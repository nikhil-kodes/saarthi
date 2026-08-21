# Saarthi Quality Assurance, Security Audit & Automated Test Matrix

## 1. Overview
Phase 13 establishes the comprehensive automated QA, security verification, and regression test matrix (`PRD.md`, `WORKFLOW.md`, `DESIGN.md`) across all packages and services.

---

## 2. Test Suites Summary

### Python AI Microservice (`apps/ai-service`)
Executed via `pytest`:
- `tests/test_health.py`: FastAPI service health contract.
- `tests/test_rag.py`: Cosine similarity RAG retriever and pgvector 384-dimensional chunk indexing.
- `tests/test_ocr.py`: Statutory notice OCR parsing, demand/penalty extraction, and bilingual 3-part plain explainer generation.
- `tests/test_score.py`: 5-Pillar Compliance Health Score calculator (300 - 900 scale) and weighted grade classification.
- **Result:** 10 / 10 tests passed (100%).

### TypeScript Web Application & Workers (`@saarthi/web`, `@saarthi/workers`)
Executed via `vitest`:
1. `src/__tests__/rbac.test.ts`: RBAC permission matrix (7 roles, 26 permissions).
2. `src/__tests__/verification-provider.test.ts`: Registry simulator for PAN, GSTIN, Udyam, and FSSAI.
3. `src/__tests__/onboarding-flow.test.ts`: Business creation and profile validation.
4. `src/__tests__/team-service.test.ts`: Scoped team invitations and token acceptance.
5. `src/__tests__/compliance-engine.test.ts`: Central & UP State act schedule generator.
6. `src/__tests__/compliance-filing.test.ts`: Filing acknowledgement recording and status transitions.
7. `src/__tests__/regulatory-rag.test.ts`: Ingestion of statutory notifications and vector search.
8. `src/__tests__/notices.test.ts`: Statutory notice lifecycle, emergency window banner, and WhatsApp simulator.
9. `src/__tests__/schemes-and-payments.test.ts`: Scheme eligibility matrix, Razorpay order/signature capture, and instant escrow refunds.
10. `src/__tests__/health-score.test.ts`: 5-pillar score validation and consent grant token issuance.
11. `src/__tests__/supplier-marketplace.test.ts`: B2B catalog, RFQ creation with score gates, and quote acceptance into escrow.
12. `src/__tests__/creator-marketplace.test.ts`: Vernacular creator profiles, milestone deliverable submissions, and automated ASCI `#Ad` disclosure verification.
13. `src/__tests__/admin-and-ca.test.ts`: Audit logs query filters, CA assigned client overview, and statutory dossier export.
14. `src/__tests__/integration-hardening.test.ts`: Queue registry completeness and error recovery.
15. `src/__tests__/e2e-user-flows.test.ts`: Full end-to-end multi-module user flow simulation.
16. `src/__tests__/validation.test.ts`: Zod schema bounds and regex validators.
17. `src/__tests__/health.test.ts`: Health check contract and ping endpoints.
18. `src/__tests__/compliance-worker.test.ts`: BullMQ background job processor.
19. `src/__tests__/queues.test.ts`: BullMQ queue configuration.
- **Result:** 87 / 87 tests passed across 19 suites (100%).

---

## 3. Security & RLS Policy Verification

- **Row Level Security:** Verified across all 15 SQL migration tables ensuring tenant isolation (`is_member_of_business(business_id)`).
- **Public Gating:** Public routes (`/[locale]/verify/score/[token]`) gated by cryptographic unguessable tokens with expiration timestamps.
- **ASCI & Consumer Protection:** Mandatory statutory `#Ad` / `#Sponsored` hashtag verification prevents advertiser and creator legal liability.
- **Secret Isolation:** Environment variables isolated in `.env`, client code uses only `NEXT_PUBLIC_` safe prefixes.
