# Saarthi — TECHSTACK.md

> Governing rule (per the master build spec): this stack is fixed unless a
> genuine technical contradiction is found and documented here first. No
> agent — human or Antigravity — swaps a technology silently. Any deviation
> must be logged in IMPLEMENTATION.md's Phase Execution Log with a reason.

---

## 1. Stack at a Glance

```text
┌─────────────────────────────────────────────────────────────────┐
│  Frontend: Next.js 15 (App Router) + React 19 + TypeScript       │
│  Main backend: Next.js Route Handlers (same app, TypeScript)     │
│  AI backend: Python 3.12 + FastAPI + Pydantic v2                 │
│  Workers: Node.js + BullMQ (separate deployable service)         │
│  Queue: Redis 7                                                  │
│  Database: PostgreSQL 15 (Supabase) + pgvector + RLS             │
│  Storage: Cloudflare R2 (S3-compatible)                          │
│  Auth: Supabase Auth (email/password + optional Google OAuth)    │
│  Messaging: WhatsApp Business Cloud API                          │
│  Payments: Razorpay                                              │
│  Infra: Docker Compose on AWS EC2, Nginx, Cloudflare              │
└─────────────────────────────────────────────────────────────────┘
```

Monorepo, managed with **pnpm workspaces + Turborepo**, one Git repository,
five deployable units (web, ai-service, workers, database migrations,
infrastructure config).

---

## 2. Frontend — `apps/web`

| Choice | Version | Rationale |
|---|---|---|
| Next.js | 15.x, App Router | Server components + route handlers let the "main backend" live in the same app instead of a second Node service, per the required architecture (§7 of the master spec). SSR helps first-load performance for MSME owners on slower mobile connections. |
| React | 19.x | Required by Next.js 15; server actions are useful for simple mutations (e.g., marking a task complete) without a full API round trip. |
| TypeScript | 5.x, `strict: true` | Non-negotiable for a multi-agent-edited codebase — type errors catch a large class of Antigravity mistakes before they reach a human reviewer. |
| Tailwind CSS | 3.x | Matches DESIGN.md's token-driven approach cleanly (`tailwind.config.ts` maps 1:1 to the `{colors.*}`/`{spacing.*}`/`{rounded.*}` tables in DESIGN.md — this mapping is the actual implementation contract). |
| shadcn/ui (selected primitives only: Dialog, DropdownMenu, Tooltip, Toast) | latest | Accessible, unstyled-enough primitives so DESIGN.md tokens still govern the visual output — do not adopt shadcn's default theme. |
| next-intl | 3.x | i18n for the bilingual (EN/HI) requirement — App Router-native, supports locale-prefixed routing (`/en/...`, `/hi/...`) and server-component-safe translation loading. Rejected next-i18next because it's Pages-Router-oriented. |
| TanStack Query | 5.x | Client-side cache for data fetched from Next.js route handlers (dashboard widgets, notifications) — avoids hand-rolled fetch/loading-state boilerplate. |
| Zustand | 4.x | Small, unopinionated client UI state (sidebar collapse, active business context) — not for server data, that's TanStack Query's job. |
| React Hook Form + Zod | latest | Form state + schema validation; the **same Zod schemas are reused** as the request-validation layer in route handlers (see §3) so client and server validation cannot drift. |
| next-pwa (or hand-rolled manifest + service worker) | — | PWA installability per the master spec — offline shell + cached static assets only; no offline-first data sync in the hackathon scope. |
| Fonts | Inter (Google Fonts, self-hosted via `next/font`), Noto Sans Devanagari (Google Fonts, self-hosted via `next/font`) | Matches DESIGN.md §3.1. Self-hosting via `next/font` avoids a third-party font request and layout shift. |
| lucide-react | latest | Icon set, matches DESIGN.md §13 default. |
| Testing | Vitest + React Testing Library | Fast, native ESM, works well with the Next.js App Router; Playwright reserved for a small smoke-test suite in Phase 13, not the default unit-test tool. |

---

## 3. Main Application Backend — Next.js Route Handlers (`apps/web/app/api`)

Same codebase as the frontend, TypeScript throughout.

- **Auth & session:** `@supabase/ssr` for server-side session handling in
  Route Handlers and Server Components.
- **Validation:** Zod schemas, shared from `packages/validation`, imported
  by both client forms and route handlers — one schema per resource, no
  duplicated shape definitions.
- **RBAC middleware:** a Next.js middleware + a `requirePermission()`
  helper wrapping route handlers, checking against the
  `role_permissions` table (see database.md, rbac.md). RBAC is **never**
  a raw `role === 'owner'` string check anywhere in the codebase.
- **Business logic:** service-layer functions under `apps/web/lib/services/*`
  — route handlers stay thin (parse → authorize → call service → respond),
  matching the "webhook must be thin" principle extended to all routes.
- **Job production:** `bullmq` npm package (`Queue` class) — route handlers
  and server actions enqueue jobs, they never run long AI/OCR/RAG work
  synchronously (see WORKFLOW.md).
- **Redis client:** `ioredis`, one shared connection module.
- **Webhook endpoints:** WhatsApp webhook, Razorpay webhook — both verify
  signatures before touching the database, both enqueue a job instead of
  processing inline (WORKFLOW.md §5, §8).
- **Internal service auth:** requests from Next.js to FastAPI carry a
  short-lived signed header (`INTERNAL_SERVICE_TOKEN`, see environment.md)
  validated by FastAPI middleware — FastAPI's privileged routes are never
  reachable without it.
- **Testing:** Vitest for service-layer unit tests; route-handler tests
  using Next.js's test utilities + a seeded test database (see testing.md).

---

## 4. AI / Processing Backend — `apps/ai-service` (Python)

| Choice | Version | Rationale |
|---|---|---|
| Python | 3.12 | Current stable, good async support. |
| FastAPI | 0.11x | Async-native, Pydantic-integrated, auto OpenAPI docs which double as the Next.js↔FastAPI contract reference (api.md). |
| Pydantic | v2 | Request/response schemas, plus `pydantic-settings` for env config. |
| Uvicorn | latest, behind Nginx | ASGI server. |
| DB access | `asyncpg` + `pgvector` Python client | Direct async Postgres access for retrieval-heavy work; avoid a heavy ORM here — the AI service does mostly read-heavy vector/structured queries, not complex relational writes (those live in the Next.js layer against the same Supabase Postgres instance). |
| LLM access | Provider-agnostic `LLMProvider` adapter (see §9) wrapping the official SDK of whichever provider is configured (e.g., `anthropic` Python SDK) | Never hardcode a single vendor's client directly into business logic — matches the master spec's mandatory abstraction-layer rule. |
| Embeddings | Provider-agnostic `EmbeddingProvider` adapter, same reasoning | Keeps `pgvector` column dimensionality decoupled from a single vendor's model choice — documented in ai-rag.md. |
| OCR | `OCRProvider` adapter — default implementation calls a configured OCR API (e.g., a cloud Document AI / OCR endpoint); `MockOCRProvider` returns canned structured text for local dev/tests | No local Tesseract dependency baked into the default path, to keep the container lean — but a `TesseractOCRProvider` may be added later behind the same interface without touching call sites. |
| Testing | Pytest + `pytest-asyncio` + `httpx.AsyncClient` for endpoint tests | Standard FastAPI testing pattern; all external providers mocked via dependency injection in tests. |
| Linting/formatting | Ruff (lint) + Black (format) + mypy (type-check, non-blocking initially) | Fast, single-tool linting; keeps Python code held to a similar bar as the strict TypeScript side. |

**Why not LangChain/LlamaIndex:** the master spec's anti-hallucination
policy requires every retrieval and generation step to be inspectable and
adapter-based. A thin, hand-rolled orchestration layer (`rag/pipeline.py`
calling `EmbeddingProvider` → pgvector query → `LLMProvider`) is easier to
audit for "did this actually retrieve a source before answering" than a
framework's implicit chain behavior. This can be revisited post-hackathon if
orchestration complexity grows — but must be logged as a documented
architecture change first (§59 rule).

---

## 5. Background Processing — `apps/workers`

| Choice | Version | Rationale |
|---|---|---|
| Node.js | 20.x LTS | Same runtime family as the main app, shares TypeScript types from `packages/shared-types`. |
| BullMQ | 5.x | Queues, workers, retries, delays, repeatable job schedulers — matches the required Redis+BullMQ architecture exactly. Celery is explicitly excluded per the master spec unless a documented contradiction is found (none identified). |
| Redis | 7.x | Queue backend; also usable later for lightweight caching if needed (not required for MVP). |

**Queues (logical separation, matches master spec §11):**
`compliance`, `notifications`, `ai`, `ocr`, `rag`, `marketplace`, `payments`,
`regulatory`.

**Worker responsibilities:** a worker process consumes a queue, and for any
job requiring AI/OCR/RAG work, calls the FastAPI service internally (with
`INTERNAL_SERVICE_TOKEN`) rather than embedding AI logic in Node — keeps the
"AI backend is Python" boundary clean (master spec §61's ownership rule).

**Idempotency:** every job handler is written to be safe on redelivery —
either a DB-level unique constraint on the natural key (e.g., one
`REGULATORY_SCAN` per source per day) or an explicit idempotency-key check
before performing a side effect (see WORKFLOW.md §9, database.md).

**Testing:** Vitest, with an in-memory or Dockerized-for-CI-only Redis
instance (not required for day-to-day local test runs — see testing.md's
Docker rule) plus fake timers for delay/retry assertions.

---

## 6. Database — Supabase / PostgreSQL

| Choice | Version | Rationale |
|---|---|---|
| PostgreSQL | 15 (Supabase-managed) | Relational integrity for a domain this interconnected (business → membership → role → permission → resource) is worth more than a document DB's flexibility here. |
| pgvector | latest Supabase extension | Regulatory-document embeddings live alongside their structured metadata in the same database — no separate vector DB to keep in sync. |
| Row Level Security | native Postgres RLS | Second authorization boundary beneath the app-level RBAC checks (rbac.md) — defense in depth against an app-layer bug leaking cross-business data. |
| Supabase Auth | — | Handles email/password + optional Google OAuth, session/JWT issuance; the app trusts Supabase-issued JWTs, doesn't roll its own auth. |
| Migrations | Supabase CLI / plain SQL migration files under `database/migrations` | Version-controlled, reviewable diffs — no auto-generated ORM migrations that Antigravity can't fully explain. |
| Client libraries | `@supabase/supabase-js` (browser + server, via `@supabase/ssr`), `asyncpg` (FastAPI direct connection) | |

**Direct DB connection for FastAPI:** the AI service connects directly to
Postgres (via `DATABASE_URL`/`DIRECT_DATABASE_URL`, see environment.md) for
vector search and read-heavy regulatory queries, rather than proxying every
retrieval through Next.js — reduces latency for RAG requests. Writes that
affect authorization-sensitive tables still go through the Next.js
service layer or are guarded by their own RLS policies.

---

## 7. Object Storage — Cloudflare R2

- S3-compatible API, accessed via `@aws-sdk/client-s3` (Node) and `boto3`
  or an S3-compatible Python client (FastAPI, only where the AI service
  needs to read an uploaded document for OCR).
- Presigned URLs for upload and download — the browser never gets a
  long-lived credential, and Postgres never stores binary content (only the
  `documents` metadata row, per database.md).
- Bucket key structure exactly as specified in the master spec §10
  (`business-documents/`, `government-notices/`, `licenses/`, etc.).

---

## 8. Messaging — WhatsApp Business Cloud API

- Meta's official Cloud API, accessed via signed HTTPS calls from the
  worker layer (never from the thin webhook route directly — WORKFLOW.md
  §5).
- Abstracted behind a `WhatsAppProvider` interface (§9) so a
  `MockWhatsAppProvider` can stand in during local development and CI.

---

## 9. Payments — Razorpay

- Razorpay Node SDK for order/payment creation from the Next.js layer;
  webhook signature verification before any order-state mutation.
- Abstracted behind a `PaymentProvider` interface so escrow/marketplace
  payment logic (Phase 9/10) doesn't hardcode a single vendor's response
  shape into business logic.

---

## 10. Third-Party Integration Abstractions (mandatory adapters)

Every external dependency that could be unavailable, rate-limited, or
policy-restricted during the hackathon is wrapped in an interface with at
least one `Mock*` implementation, per the master spec's anti-hallucination
and mocking policy:

```text
LLMProvider            → e.g. AnthropicLLMProvider | MockLLMProvider
EmbeddingProvider       → e.g. <configured>EmbeddingProvider | MockEmbeddingProvider
OCRProvider             → e.g. <configured>OCRProvider | MockOCRProvider
WhatsAppProvider        → MetaCloudWhatsAppProvider | MockWhatsAppProvider
PaymentProvider         → RazorpayPaymentProvider | MockPaymentProvider
VerificationProvider    → MockVerificationProvider | FutureDigiLockerApiSetuProvider
GovernmentDataProvider  → MockGovernmentProvider | (future real source connectors)
SocialMediaProvider     → MockSocialProvider | (future Instagram/YouTube connectors)
StorageProvider         → R2StorageProvider (real from day one — R2 credentials are available; no mock needed unless explicitly requested for a fully offline dev mode)
```

Every mock implementation is named with a `Mock` prefix, never disguised —
and per DESIGN.md §9, any screen backed by a mock surfaces the sandbox tag
in the UI. This list is authoritative; adding a new external dependency
means adding a row here and to environment.md before writing the
integration.

---

## 11. Infrastructure & Deployment

| Layer | Choice | Rationale |
|---|---|---|
| Containerization | Docker, one Dockerfile per deployable unit (`web`, `ai-service`, `workers`) | Consistent, reproducible builds; packaging only — not the test harness (testing.md). |
| Orchestration | Docker Compose | Sufficient for a single-EC2-instance hackathon deployment; explicitly no Kubernetes (master spec §71). |
| Reverse proxy | Nginx | TLS termination (or Cloudflare-terminated + Nginx origin), routing `/api/ai/*` to FastAPI, everything else to Next.js, `/whatsapp/webhook` to the Next.js webhook route. |
| Host | AWS EC2 | Per the master spec's target topology. |
| CDN/DNS/edge | Cloudflare | In front of Nginx; also fronts R2 for asset delivery if needed. |
| Process management | Docker Compose restart policies (`unless-stopped`) | No separate process manager needed at this scale. |

**Explicitly excluded** (master spec §71): Celery, Kubernetes, Vercel as
the production runtime, storing files in Postgres, one giant container for
every service, Docker as the normal test harness.

---

## 12. Local Development

- `pnpm install` at the repo root (workspaces resolve `apps/web`,
  `workers`, `packages/*`).
- `apps/ai-service` uses its own Python virtualenv (`uv` or `venv` +
  `pip install -r requirements.txt`).
- A single `docker-compose.dev.yml` may run **only** Redis and (optionally)
  a local Postgres if not using a hosted Supabase dev project — the web,
  AI, and worker processes themselves run natively (`pnpm dev`, `uvicorn
  --reload`, `pnpm dev:worker`) for fast iteration, consistent with the
  "don't test through Docker" rule.
- `.env.example` at the repo root plus one per deployable unit if variable
  sets diverge meaningfully (see environment.md).

---

## 13. Package/Dependency Discipline

- Before adding any new npm/pip package, check whether an already-installed
  dependency solves the problem (master spec §35). Antigravity must
  justify any new dependency in its phase completion report.
- No dependency may be added that duplicates the responsibility of an
  existing one in the same layer (e.g., no second HTTP client library, no
  second state-management library).

---

## 14. Summary Rationale Table

| Domain | Choice | Rejected alternative(s) | Why |
|---|---|---|---|
| Frontend framework | Next.js App Router | Remix, plain Vite SPA | SSR + route handlers collapse "frontend" and "main backend" into one deployable unit, exactly matching the required architecture. |
| Background jobs | BullMQ (Redis) | Celery (Python) | Keeps the async layer in the same language family as the main backend; explicitly mandated by the master spec. |
| AI backend | FastAPI (Python) | Node-only AI logic | Python's ecosystem is the pragmatic choice for OCR/RAG/embedding work; FastAPI's Pydantic contracts keep the Next.js↔AI boundary explicit. |
| Vector store | pgvector (in Postgres) | Standalone vector DB (Pinecone, Weaviate) | One database to operate, back up, and secure for the hackathon; metadata and vectors never drift out of sync. |
| Auth | Supabase Auth | Custom JWT/auth service, NextAuth | Ships session handling, RLS-compatible JWTs, and OAuth in one already-adopted platform (Supabase is already the DB host). |
| i18n | next-intl | next-i18next, custom dictionary | App-Router-native, server-component-safe. |
| Orchestration (AI) | Hand-rolled adapters | LangChain/LlamaIndex | Auditability for the anti-hallucination policy; can be revisited later with a documented change. |
