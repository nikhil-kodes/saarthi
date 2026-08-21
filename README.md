# Saarthi (सारथी)

**The AI-Powered Regulatory Compliance, B2B Marketplace & Growth Operating System for Indian MSMEs.**

---

## 🌟 Overview

Saarthi transforms compliance from a burdensome cost center into an objective trust asset for Indian MSMEs:

```text
Business Identity (GST/PAN/Udyam) → Verification → Automated Compliance Engine (Central & UP Acts)
   → Notice OCR & Legal Copilot → Government Schemes & Subsidies (UP MSME Policy)
   → B2B Supplier Marketplace (Escrow) → Regional Creator Marketplace (ASCI Check)
   → 5-Pillar Health Score (300–900 pts) → Bank Loans & Credit Access
```

- **Bilingual by Design:** Complete, native English & Hindi (`en`, `hi`) localization across all UI surfaces and AI outputs.
- **Institutional Design System:** Based on `DESIGN.md` with warm off-white canvas (`#F7F6F3`), ink action layer (`#12151A`), tabular numerals, 3 dark-band moments, and mandatory purple sandbox tag.
- **Deterministic Trust Engine:** 5-Pillar Compliance Health Score (CHS) on a 300–900 scale with consent-gated shareable verification tokens.
- **Modular Monorepo:** Turborepo + pnpm workspaces managing web app, FastAPI AI service, BullMQ workers, and shared packages.

---

## 🏗️ Architecture & Tech Stack

| Service / Layer | Technology | Function | Port |
| :--- | :--- | :--- | :--- |
| **Web Frontend & APIs** | Next.js 15 (App Router), React 19, Tailwind CSS, `next-intl` | Bilingual Web UI and 38 API route handlers | `3000` |
| **AI Backend Service** | Python 3.12, FastAPI, Pydantic v2, pgvector | Source-grounded RAG, OCR explainer parsing, 5-Pillar Scoring | `8000` |
| **Async Workers** | Node.js 20, BullMQ, Redis 7 | 8 background queues for compliance, reminders, RAG, and escrow | Background |
| **Database & Vector** | PostgreSQL 16 (Supabase) + RLS + pgvector | 15 SQL migrations with row-level security and 384-dim embeddings | `5432` |
| **Payment Gateway** | Razorpay Sandbox Simulator | Simulated orders, signature capture, and instant escrow refunds | API |
| **Storage & WhatsApp** | Cloudflare R2 / Supabase Storage & Meta WhatsApp Cloud API | Notice PDFs, statutory reply letters, and WhatsApp copilot webhook | Webhook |

---

## 🚀 Quick Start (Local Development)

### 1. Setup Environment
```bash
cp .env.example .env
```

### 2. Install Monorepo Dependencies
```bash
pnpm install
```

### 3. Run Test Suites
```bash
# Run 87 TypeScript Vitest test suites
pnpm test

# Run 10 Python Pytest test suites
cd apps/ai-service && .venv/bin/pytest
```

### 4. Build Production Bundle
```bash
pnpm build
```

### 5. Launch Full Stack with Docker Compose
```bash
./scripts/start-prod.sh
```

---

## 📚 Complete Technical Documentation

- **Master Docs Hub:** [`docs/README.md`](./docs/README.md)
- **Architecture:** [`docs/architecture.md`](./docs/architecture.md)
- **Authentication & RBAC:** [`docs/auth-and-rbac.md`](./docs/auth-and-rbac.md)
- **Onboarding & Verification:** [`docs/onboarding-and-verification.md`](./docs/onboarding-and-verification.md)
- **Compliance Core Engine:** [`docs/compliance-core.md`](./docs/compliance-core.md)
- **Regulatory Intelligence & RAG:** [`docs/regulatory-rag.md`](./docs/regulatory-rag.md)
- **Notice OCR & WhatsApp Copilot:** [`docs/notices-and-ocr.md`](./docs/notices-and-ocr.md)
- **Government Schemes & Payments:** [`docs/schemes-and-payments.md`](./docs/schemes-and-payments.md)
- **Compliance Health Score:** [`docs/health-score.md`](./docs/health-score.md)
- **B2B Supplier Marketplace:** [`docs/marketplace.md`](./docs/marketplace.md)
- **Vernacular Creator Marketplace:** [`docs/creators.md`](./docs/creators.md)
- **Security, Audit Trail & CA Portal:** [`docs/security-and-admin.md`](./docs/security-and-admin.md)
- **Integration Hardening & Queues:** [`docs/integration-and-hardening.md`](./docs/integration-and-hardening.md)
- **QA & Automated Test Matrix:** [`docs/qa-and-security.md`](./docs/qa-and-security.md)
- **Deployment & Orchestration:** [`docs/deployment.md`](./docs/deployment.md)
- **Implementation Status Ledger:** [`IMPLEMENTATION.md`](./IMPLEMENTATION.md)
