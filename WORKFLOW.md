# Saarthi — WORKFLOW.md

> This document specifies every major flow in the system to a level of
> detail sufficient for Antigravity to implement each step without
> inventing behavior. Every async flow names its queue and job type per
> TECHSTACK.md §5; every AI step names which provider adapter it calls per
> TECHSTACK.md §10. Cross-reference database.md for table names and
> rbac.md/security.md for permission checks at each step.

---

## 0. Cross-Cutting Rules for Every Flow

1. **Webhooks are thin.** Any inbound webhook (WhatsApp, Razorpay) does
   exactly three things synchronously: verify signature, persist the raw
   event, enqueue a job. No AI/OCR/RAG/business logic runs inside a webhook
   request.
2. **Every async job is idempotent.** Each job type has a defined
   idempotency key (below, per flow) enforced by a DB unique constraint or
   an explicit check-before-write.
3. **Every locale-facing step produces both `en` and `hi` output** where the
   step generates user-visible text (notification, WhatsApp message, PDF).
4. **Every AI explanation step retrieves before it generates** and attaches
   source metadata to the persisted result — this is checked, not assumed
   (ai-rag.md).
5. **Every step that touches cross-business data is authorized twice**: an
   RBAC permission check in the Next.js/FastAPI layer, and RLS at the
   database layer.

---

## 1. Authentication Flow

```text
User opens app
      ↓
Supabase Auth — email/password (Google OAuth optional)
      ↓
Session issued (Supabase JWT)
      ↓
Next.js middleware validates session on protected routes
      ↓
Locale resolved: user preference (profiles.locale) → browser Accept-Language → default 'en'
      ↓
Business context resolved: if user has exactly one business_membership → auto-select;
if multiple → business switcher shown (topbar, DESIGN.md §7)
      ↓
Dashboard rendered per RBAC-scoped nav (rbac.md)
```

**Notes:** Authentication answers "who is this user?" only.
Verification (below) answers "can this business be trusted?" — the two are
never conflated in code or UI (master spec §6).

---

## 2. Onboarding Flow

```text
Signup (email/password or Google OAuth) → profile created (profiles table)
      ↓
Locale + role selection (default role: Owner, for a new business)
      ↓
Business creation form:
   legal name, sector (NIC-code-backed dropdown), state (UP fully supported;
   other states selectable with a "coverage in progress" notice per PRD.md
   Scope Decision #2), employee count, existing registrations (GST/Udyam/FSSAI
   numbers, optional at this step)
      ↓
business + business_membership(role=owner) rows created, RLS policy scopes
   all subsequent business-scoped queries to this membership
      ↓
Team invite (optional, immediate or later) → business_membership(role=team_member)
   created on invite acceptance
      ↓
Redirect to Business Verification (Flow 3)
```

---

## 3. Business Verification Flow

```text
Business profile complete
      ↓
User initiates verification
      ↓
VerificationProvider.verify(business) called
   — MVP default: MockVerificationProvider, returns a deterministic
     verified/pending/failed result plus mock document checks
   — Future: FutureDigiLockerApiSetuProvider (not implemented this build)
      ↓
business_verifications row created (status, provider_used, checked_at)
      ↓
audit_logs entry recorded (actor, action=BUSINESS_VERIFICATION_INITIATED)
      ↓
IF verified:
   verification badge unlocked (DESIGN.md §8.5 dark-band moment)
   CHS engine notified (verification completeness is a scoring signal)
ELSE:
   business_verifications.status = pending/failed, retry path shown in UI
      ↓
UI shows {component.sandbox-tag} for the entire verification screen while
   MockVerificationProvider is active (mandatory, DESIGN.md §9)
```

**Idempotency key:** one active `business_verifications` attempt per
business at a time; a new attempt supersedes rather than duplicates the
prior row (status history preserved, not deleted).

---

## 4. Compliance Calendar / Requirement Engine Flow

```text
Business profile (sector, state, employee count, registrations) available
      ↓
Applicability engine (deterministic rules, NOT LLM — PRD.md §6) evaluates
   compliance_requirements against business attributes, filtered to
   jurisdiction = India (central) + business.state (UP at MVP)
      ↓
Matching requirements instantiated as compliance_tasks with due dates
   (calculated from requirement recurrence rules, e.g. monthly GST return,
   annual Udyam re-verification via ITR/GST data)
      ↓
Dashboard renders tasks ranked per DESIGN.md §8.1 hierarchy
      ↓
Deadline approaching (scheduled BullMQ job, queue=compliance,
   job=CHECK_LICENSE_EXPIRY / a generic DEADLINE_SCAN, runs daily)
      ↓
IF task due within reminder window (configurable, e.g. 7/3/1 days):
   enqueue notifications job (SEND_COMPLIANCE_REMINDER, queue=notifications)
      ↓
Reminder sent via in-app notification + WhatsApp (Flow 5), in the user's
   locale
      ↓
On task completion (user marks done, or evidence uploaded):
   compliance_events row recorded (immutable log)
   CHS recalculation job enqueued (RECALCULATE_CHS, queue=ai)
```

**Idempotency key:** `(business_id, requirement_id, due_period)` unique
constraint on `compliance_tasks` prevents duplicate task generation on
re-runs of the applicability engine.

---

## 5. WhatsApp Copilot Flow

```text
Inbound message arrives at WhatsApp Cloud API
      ↓
Next.js webhook route (/api/webhooks/whatsapp)
      ↓
Verify webhook signature (Meta app secret)
      ↓
Identify user (match sender phone number → profiles.phone_number;
   unmatched numbers get an onboarding-link auto-reply, handled inline
   as the one allowed synchronous exception since it is a static template
   send, not AI work)
      ↓
Persist raw message (whatsapp_messages table, referencing notices/documents
   if media attached)
      ↓
Enqueue job (PROCESS_WHATSAPP_MESSAGE, queue=ai) → Redis
      ↓
Worker picks up job → calls FastAPI /internal/copilot/respond
   (INTERNAL_SERVICE_TOKEN-authenticated)
      ↓
FastAPI: intent classification → RAG or OCR pipeline as needed (Flows 7/8)
   → response composed in the user's stored locale preference
      ↓
Result persisted → WhatsAppProvider.send(message) called
   — MVP default: real Meta Cloud API in a sandbox/test WhatsApp Business
     number; MockWhatsAppProvider available for CI/local dev
      ↓
Outbound message logged; UI's WhatsApp preview bubble (DESIGN.md §8.9)
   reflects the same content for in-app visibility
```

**Idempotency key:** WhatsApp's own `message_id` is stored and checked
before processing — a redelivered webhook event is a no-op if the
`message_id` already has a `whatsapp_messages` row.

**Non-negotiable:** the webhook route never calls FastAPI or an LLM
directly — only the worker does, after the job is dequeued (§0.1).

---

## 6. Regulatory Update Flow

```text
Regulatory Source (central gazette/ministry feed, UP state gazette/
   department feed — both configured as explicit source records, not
   invented endpoints)
      ↓
Fetcher (scheduled job, queue=regulatory, job=REGULATORY_SCAN, e.g. daily)
      ↓
Change Detection (hash/diff against last-seen version of the source
   document, stored on the regulatory_updates source-tracking row)
      ↓
IF changed: Document Processing job (REGULATION_PROCESS, queue=regulatory)
   → text extraction → chunking → EMBED_DOCUMENT job (queue=ai) →
     pgvector storage with source metadata (title, act/section reference,
     jurisdiction, publish date, source URL)
      ↓
Classification: applicability tags derived (sector, jurisdiction=central|UP,
   business-size band, licence/registration type affected) — deterministic
   tagging rules first; LLM assists in drafting a plain-language summary
   but does NOT decide legal applicability alone (mirrors the CHS rule)
      ↓
Structured regulatory_updates record created/updated
      ↓
Affected Business Detection: query businesses whose profile matches the
   classification tags (jurisdiction, sector, size, registrations held)
      ↓
IF matches found: enqueue SEND_COMPLIANCE_REMINDER-equivalent notification
   job per matched business (queue=notifications) — never a global
   broadcast to all businesses (master spec §13 rule)
      ↓
Notification delivered in-app + WhatsApp (Flow 5), locale-aware
```

**Idempotency key:** `(source_id, content_hash)` — reprocessing an
unchanged source document is a no-op.

---

## 7. Regulatory RAG (Question Answering) Flow

```text
User question (typed in-app, or via WhatsApp Flow 5)
      ↓
Intent Classification (is this a regulatory question, an OCR follow-up,
   a scheme question, a general support question?)
      ↓
Business Context attached (sector, state=UP-or-other, registrations held,
   employee count) — used to scope retrieval, not to bypass it
      ↓
Query Construction (question + business context → retrieval query)
      ↓
Vector Retrieval (pgvector similarity search over embedded regulatory
   chunks, filtered to jurisdiction ∈ {central, business.state})
      ↓
Structured Rule Retrieval (deterministic compliance_requirements /
   regulatory_reference_data rows relevant to the same tags, where
   applicable — numeric thresholds come from structured data, never
   from the LLM's memory)
      ↓
LLM (via LLMProvider) composes an answer using ONLY the retrieved
   passages + structured data as grounding context; instructed to decline
   or hedge rather than fabricate when retrieval returns nothing relevant
      ↓
Answer + Source/Citation Metadata persisted and returned
      ↓
UI renders the answer with visible source chips (DESIGN.md §8.7) —
   an answer with zero sources is never rendered as a confident legal
   statement; it is rendered as "I couldn't find a grounded source for
   this — here's what I can tell you generally" with that caveat visible
```

---

## 8. Notice OCR Flow

```text
Document Upload (photo or PDF of a government notice) from app or WhatsApp
      ↓
Presigned upload to R2 (business-documents/ or government-notices/ prefix)
      ↓
documents/notices metadata row created (object_key, mime_type, size,
   checksum, status=pending)
      ↓
Enqueue NOTICE_OCR job (queue=ocr)
      ↓
Worker → FastAPI /internal/notices/{id}/process
      ↓
OCRProvider.extract(document) called
   — MVP default: configured cloud OCR API; MockOCRProvider for
     local/test with canned structured text
      ↓
Structured text persisted (extracted_text, confidence if available)
      ↓
Regulatory retrieval (Flow 7's retrieval step, run against the notice's
   extracted content as the query) + business context
      ↓
LLM explanation generated (plain language, source-cited, both locales)
      ↓
Result persisted (notices.explanation_en, explanation_hi, source
   references, status=processed)
      ↓
User notified in-app + WhatsApp (Flow 5) that the notice has been explained
```

**Idempotency key:** one active OCR job per `notice_id`; re-upload of the
same checksum on an already-processed notice is flagged as a duplicate in
the UI rather than reprocessed.

---

## 9. Notification Flow (general)

```text
Any triggering event (deadline, regulatory update, order status change,
   campaign update, score change) → notification_preferences checked
   (channel: in-app / WhatsApp / both; locale: from profiles.locale)
      ↓
Enqueue job on the notifications queue with a stable idempotency key
   (event_type + business_id + reference_id + date-bucket, as applicable)
      ↓
Worker composes message from a locale-aware template
      ↓
In-app: notifications row created, topbar bell updates
WhatsApp: WhatsAppProvider.send() called (Flow 5's outbound path)
      ↓
Delivery status tracked (sent/failed/retried per BullMQ retry/backoff
   policy — see workers/ config: exponential backoff, max attempts
   documented in the workers package, failures land in a dead-letter
   queue for admin visibility, not silently dropped)
```

---

## 10. Scheme Matching Flow

```text
government_schemes table populated (central + UP schemes only, per PRD.md
   scope) with structured eligibility rules
      ↓
Scheduled or on-profile-change job (MATCH_SCHEMES, queue=marketplace or a
   dedicated schemes context)
      ↓
Deterministic eligibility engine evaluates business profile against
   scheme_eligibility rules (sector, size/Udyam category, state, employee
   count, registrations held) — same "deterministic first" principle as
   the requirement engine
      ↓
scheme_matches rows created/updated per business
      ↓
Recommended schemes surface on the dashboard (DESIGN.md §8.1 rank 6) with
   plain-language eligibility reasoning (LLM may phrase the explanation,
   but the eligibility determination itself is rule-based)
```

---

## 11. Supplier Marketplace Flow

```text
Supplier onboarding (Flow 2 variant) → Supplier verification (Flow 3,
   same VerificationProvider) → verified badge tied to compliance
   verification state, not a separate rating system
      ↓
Supplier profile + product/service catalogue created
      ↓
Buyer discovers supplier (category + state/location filters, search)
      ↓
Buyer creates RFQ → rfqs row created, relevant suppliers notified
   (Flow 9)
      ↓
Supplier(s) submit quotations → quotations rows created
      ↓
Buyer compares quotations (UI: comparison table) → selects one →
   orders row created (state machine: draft → confirmed → in_progress →
   completed → disputed, explicit enum, never a free-text status field)
      ↓
Payment: PaymentProvider escrow-style flow — funds held at order
   confirmation, released on buyer-confirmed completion (or per documented
   dispute-resolution path); Razorpay webhook (thin, per §0.1) updates
   escrow_transactions
      ↓
On completion: supplier transaction history updated; CHS recalculation
   enqueued for both parties where marketplace conduct is a scored signal
```

## 12. Influencer Marketplace Flow

```text
Creator onboarding (Flow 2 variant) → verification (Flow 3) →
   social account connection via SocialMediaProvider
   — MVP default: MockSocialProvider returning plausible-but-labeled-mock
     follower/engagement data; a live Instagram/YouTube integration is
     future work and must not be silently implied as connected
      ↓
creator_metrics populated (from provider, on a sync schedule —
   SYNC_SOCIAL_METRICS job, queue=marketplace)
      ↓
Brand creates campaign (goals, budget, cash/barter, target audience)
      ↓
AI creator matching (MATCH_CREATORS job) — ranks verified creators by fit;
   ranking criteria are explicit/inspectable (category, audience overlap,
   engagement band, past campaign history), not an opaque LLM ranking
      ↓
Brand reviews matches → sends collaboration proposal → creator
   accepts/negotiates → campaign_creators row created
      ↓
Contract generation: template includes ASCI disclosure clause (mandatory,
   India advertising-standards requirement) and TDS terms (computed via
   tds_records based on payout amount and applicable rate)
      ↓
Escrow/payment workflow mirrors Flow 11's PaymentProvider pattern
      ↓
Campaign completion → both parties' history updated; CHS-relevant signals
   recorded where applicable (brand payment punctuality, creator delivery
   punctuality)
```

---

## 13. Compliance Health Score (CHS) Calculation Flow

```text
Trigger: RECALCULATE_CHS job (queue=ai) — enqueued on compliance_events,
   payment events, marketplace completion events, verification changes,
   or on a scheduled baseline recompute
      ↓
Deterministic scoring engine (FastAPI, NOT an LLM decision — PRD.md §10)
   reads structured signals: filing punctuality, completion rate, missed
   deadlines, licence validity, verification completeness, notice-response
   behaviour, payment behaviour, marketplace conduct
      ↓
Each signal maps to a documented, versioned point-weight rule (weights
   stored alongside the scoring engine version, not hardcoded magic
   numbers scattered in code — see database.md for the scoring-rule
   reference table)
      ↓
New score computed; compliance_score_events row appended (never overwrites
   history) with the full signed contribution breakdown
      ↓
compliance_scores.current_score updated (a pointer/summary row, history
   lives in compliance_score_events)
      ↓
Dashboard + score detail page (DESIGN.md §8.4) re-render with the new
   score, contribution list, and sparkline history
```

**Idempotency key:** each `RECALCULATE_CHS` job carries a `trigger_event_id`;
if a score event already exists for that trigger, the job is a no-op
(prevents double-counting from a redelivered job).

---

## 14. Lender / Consent-Based Access Flow

```text
Business owner initiates "Share my score" from the score detail page
      ↓
Owner selects the requesting lender/NBFC (from a registered-lender list
   or via an invite code) and the scope (score only, or score + specific
   verification facts — never raw documents/financials without a separate,
   explicit grant)
      ↓
consents row created (business_id, grantee_id, scope, granted_at,
   expires_at nullable)
      ↓
audit_logs entry recorded
      ↓
Lender's scoped view renders the CHS + explanation exactly as the owner
   sees it — no hidden additional data beyond the granted scope
      ↓
Owner can revoke at any time → consents.revoked_at set → lender access
   immediately reflects revocation (checked on every read, not cached)
      ↓
Every access by the lender while consent is active is itself audit-logged
   (who viewed what, when)
```

---

## 15. Admin Flow

```text
Admin dashboard: user management, business management, verification queue
   (pending MockVerificationProvider results needing review), audit log
   viewer, consent management oversight, role management, system health
   (queue depth, job failure rate — from BullMQ metrics), and where
   practical a lightweight queue monitoring view
      ↓
All admin actions on another user's/business's data are themselves
   audit-logged with actor=admin_user_id
      ↓
Admin cannot bypass RLS by role alone — admin-scoped access is its own
   explicit permission set (admin.*), still enforced at both the app and
   RLS layers (rbac.md, security.md)
```

---

## 16. Audit Flow

```text
Any state-changing action on a sensitive resource (verification, consent,
   role change, document delete, payment state change, admin override)
      ↓
audit_logs row written synchronously in the same transaction as the state
   change (not via an async job — audit records must not be lost to a
   queue failure)
      ↓
audit_logs is append-only (no update/delete permission granted to any
   application role at the DB level)
      ↓
Audit viewer (Admin flow, and a scoped "my business's audit trail" view
   for Owners) renders filtered by business_id per RLS
```

---

## 17. Asynchronous Workflow Summary (queue → job map)

| Queue | Representative jobs |
|---|---|
| `compliance` | `DEADLINE_SCAN`, `CHECK_LICENSE_EXPIRY`, `CHECK_OVERDUE_PAYMENT` |
| `notifications` | `SEND_COMPLIANCE_REMINDER`, `SEND_WHATSAPP_MESSAGE`, generic notification dispatch |
| `ai` | `PROCESS_WHATSAPP_MESSAGE`, `RECALCULATE_CHS` |
| `ocr` | `NOTICE_OCR` |
| `rag` | `RAG_INGEST`, `EMBED_DOCUMENT`, `NOTICE_EXPLAIN` |
| `marketplace` | `MATCH_SUPPLIERS`, `MATCH_CREATORS`, `SYNC_SOCIAL_METRICS` |
| `payments` | escrow state-transition jobs, payment webhook follow-up processing |
| `regulatory` | `REGULATORY_SCAN`, `REGULATION_PROCESS`, `MATCH_SCHEMES` |

Retry/backoff strategy, max attempts, and dead-letter handling are defined
once in `workers/` config and documented in TECHSTACK.md/testing.md — every
job type inherits the default policy unless a phase document explicitly
justifies an override.

---

## 18. i18n Content Rule (applies to every flow above)

Any step that produces user-visible text must produce it via a
locale-keyed template/content source (never a runtime machine-translation
call in the request path). Hindi copy is authored natively per DESIGN.md
§3.3, not derived by literally translating the English string word-for-word
— tone and phrasing should read as naturally written Hindi for a business
owner, not a translated document.
