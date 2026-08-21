# Saarthi — Complete Engineering & Product Documentation Index

Welcome to the comprehensive technical documentation for **Saarthi (सारथी)** — The AI-Powered Regulatory Compliance, B2B Marketplace & Growth Operating System for MSMEs in India (with special focus on Uttar Pradesh).

---

## 📚 Master Documentation Catalogue

| Section | Document | Description | Key Modules & APIs |
| :--- | :--- | :--- | :--- |
| **01** | [Architecture Guide](file:///home/nikhil-kodes/Projects/Saarthi/docs/architecture.md) | Monorepo structure, Next.js 15, FastAPI, BullMQ, and Supabase pgvector | Turborepo, Next.js App Router, FastAPI, Redis 7 |
| **02** | [Auth & RBAC Guide](file:///home/nikhil-kodes/Projects/Saarthi/docs/auth-and-rbac.md) | Bilingual auth flows, Supabase SSR sessions, 7 roles & 26 permissions | `/api/auth/*`, `AuthService`, `RBACService` |
| **03** | [Onboarding & Verification](file:///home/nikhil-kodes/Projects/Saarthi/docs/onboarding-and-verification.md) | 4-step wizard, `MockVerificationProvider` for PAN/GST/Udyam/FSSAI, and Team invites | `VerificationProvider`, `TeamService`, `/api/business/*` |
| **04** | [Compliance Core Engine](file:///home/nikhil-kodes/Projects/Saarthi/docs/compliance-core.md) | Central & UP State Act schedules, automated due date rules, and penalty calculation | `ComplianceService`, `00004_compliance_catalog.sql` |
| **05** | [Regulatory Intelligence & RAG](file:///home/nikhil-kodes/Projects/Saarthi/docs/regulatory-rag.md) | pgvector 384-dim embeddings, Daily Gazette crawler, and grounded Compliance Copilot | `RAGService`, `EmbeddingService`, `/api/v1/rag/*` |
| **06** | [Notice OCR & WhatsApp Copilot](file:///home/nikhil-kodes/Projects/Saarthi/docs/notices-and-ocr.md) | Notice OCR extraction, bilingual 3-part explainer, legal reply letters, Emergency Action Window | `OCRService`, `NoticeParser`, `/api/notices/*` |
| **07** | [Government Schemes & Payments](file:///home/nikhil-kodes/Projects/Saarthi/docs/schemes-and-payments.md) | UP MSME Policy subsidies, Mudra loans, Razorpay simulated checkout & instant escrow refunds | `SchemesService`, `PaymentsService`, `/api/payments/*` |
| **08** | [Compliance Health Score](file:///home/nikhil-kodes/Projects/Saarthi/docs/health-score.md) | 5-Pillar objective score (300-900 pts), weighted algorithm, consent-gated shareable tokens | `HealthScoreCalculator`, `ScoreService`, `/api/score/*` |
| **09** | [B2B Supplier Marketplace](file:///home/nikhil-kodes/Projects/Saarthi/docs/marketplace.md) | Industrial supplier catalog, RFQ broadcasting with score gates, quote acceptance into escrow | `MarketplaceService`, `/api/marketplace/*` |
| **10** | [Vernacular Creator Marketplace](file:///home/nikhil-kodes/Projects/Saarthi/docs/creators.md) | Regional UP creators (Bhojpuri/Hindi/Awadhi), milestone escrow, mandatory ASCI `#Ad` check | `CreatorsService`, `/api/creators`, `/api/campaigns/*` |
| **11** | [Security, Audit Trail & CA Portal](file:///home/nikhil-kodes/Projects/Saarthi/docs/security-and-admin.md) | Superadmin platform aggregates, immutable audit logs explorer, CA multi-tenant client portfolio | `AdminService`, `/api/admin/*`, `/api/ca/*` |
| **12** | [Integration Hardening & Queues](file:///home/nikhil-kodes/Projects/Saarthi/docs/integration-and-hardening.md) | Localized error boundaries, custom 404 recovery, and BullMQ queue metrics across 8 queues | `/api/admin/queues`, `error.tsx`, `not-found.tsx` |
| **13** | [QA & Security Audit](file:///home/nikhil-kodes/Projects/Saarthi/docs/qa-and-security.md) | Full 97-test automated testing matrix (Pytest + Vitest), RLS policy verification, and E2E simulation | `vitest`, `pytest`, `e2e-user-flows.test.ts` |
| **14** | [Deployment & Orchestration](file:///home/nikhil-kodes/Projects/Saarthi/docs/deployment.md) | Production Docker Compose topology, multi-stage Dockerfiles, health probes, and `.env` manifest | `docker-compose.yml`, `scripts/start-prod.sh` |

---

## 🚀 Quick Run Commands

- **Run Web Dev Server:** `pnpm --filter=@saarthi/web dev` (http://localhost:3000)
- **Run FastAPI AI Microservice:** `cd apps/ai-service && uvicorn app.main:app --port 8000` (http://localhost:8000)
- **Run BullMQ Worker Daemon:** `pnpm --filter=@saarthi/workers dev`
- **Execute Full Test Matrix:** `pnpm test` (87 Vitest tests) & `cd apps/ai-service && .venv/bin/pytest` (10 Pytest tests)
- **Compile Production Monorepo:** `pnpm build` (77 static/dynamic routes)
- **Launch Production Containers:** `./scripts/start-prod.sh`
