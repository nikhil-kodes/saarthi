# Saarthi — Architecture Overview

> This is a living document created in Phase 1 and updated in every subsequent phase per IMPLEMENTATION.md §2.5.

## 1. System Topology

```text
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT TIER                               │
│  Browser / Mobile PWA / WhatsApp Client (Hindi + English)              │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ HTTPS / WSS
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        EDGE / REVERSE PROXY                            │
│  Nginx / Cloudflare (TLS Termination, Routing, Asset Caching)          │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
     /api/ai/*      │                                │ All other routes
                    ▼                                ▼
┌───────────────────────────────┐ ┌──────────────────────────────────────┐
│       AI / PROCESSING         │ │          MAIN APPLICATION            │
│  apps/ai-service (Python 3.12)│ │  apps/web (Next.js 15 App Router)    │
│  - FastAPI + Pydantic v2      │ │  - React 19 + TypeScript             │
│  - RAG / Embeddings / pgvector│ │  - Route Handlers (/api/*)           │
│  - Document OCR Pipeline      │ │  - next-intl Bilingual (EN/HI)       │
│  - Compliance Scoring Engine  │ │  - RBAC & Session Middleware         │
└───────────────┬───────────────┘ └──────────────────┬───────────────────┘
                │                                    │
                │ Enqueues AI Jobs                   │ Enqueues Async Jobs
                ▼                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           ASYNC QUEUE TIER                             │
│  Redis 7 + BullMQ                                                      │
│  8 Queues: compliance, notifications, ai, ocr, rag, marketplace,       │
│            payments, regulatory                                        │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Consumes Jobs
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           WORKER PROCESSES                             │
│  apps/workers (Node.js 20 LTS + TypeScript)                            │
│  - Cron & Scheduled Scans                                              │
│  - WhatsApp Notification Dispatch                                      │
│  - Internal Service Coordinator                                        │
└────────────────────────────────────────────────────────────────────────┘
```

## 2. Monorepo Structure

```text
saarthi/
├── apps/
│   ├── web/               # Next.js 15 frontend + route handler backend
│   ├── ai-service/        # Python FastAPI AI, RAG, and OCR service
│   └── workers/           # Node.js BullMQ background worker service
├── packages/
│   ├── shared-types/      # Cross-workspace TypeScript type definitions
│   ├── validation/        # Shared Zod schemas (client forms & API validation)
│   └── config/            # Application constants and configuration
├── database/              # PostgreSQL migrations (introduced in Phase 2)
└── docs/                  # Architectural documentation (progressively expanded)
```

## 3. Communication Protocols

| Source | Destination | Protocol | Authentication |
|---|---|---|---|
| Client | `apps/web` | HTTPS | Supabase JWT (Cookie / Authorization header) |
| `apps/web` | `apps/ai-service` | HTTP | `INTERNAL_SERVICE_TOKEN` header |
| `apps/web` | Redis | TCP (ioredis) | Redis AUTH / Network boundary |
| `apps/workers` | Redis | TCP (ioredis/BullMQ) | Redis AUTH / Network boundary |
| `apps/workers` | `apps/ai-service` | HTTP | `INTERNAL_SERVICE_TOKEN` header |

## 4. Phase Evolution

- **Phase 1 (Current):** Repository foundation, monorepo skeleton, health endpoints, bilingual setup.
- **Phase 2:** Database schema, Supabase Auth, initial RLS policies, audit logging.
- **Phase 3:** RBAC, Business Onboarding, MockVerificationProvider.
- **Phase 4:** Compliance core, requirement engine, compliance calendar.
- **Phase 5:** Regulatory intelligence, RAG ingestion, pgvector search.
- **Phase 6:** Notice OCR, WhatsApp Copilot webhook & dispatch.
- **Phase 7:** Government schemes matcher, payments & refund tracking.
- **Phase 8:** Compliance Health Score (CHS) deterministic engine (0–900).
- **Phase 9:** Supplier Marketplace (RFQ → Quote → Escrowed Order).
- **Phase 10:** Influencer Marketplace (Campaign → Match → ASCI/TDS Contract).
- **Phase 11:** Admin portal, audit viewer, security hardening.
- **Phase 12:** Full stack integration hardening & idempotency audit.
- **Phase 13:** QA & comprehensive testing pass.
- **Phase 14:** Production deployment preparation (AWS EC2 / Docker).
- **Phase 15:** Final demo journey validation & seeded Demo Foods MSME dataset.
