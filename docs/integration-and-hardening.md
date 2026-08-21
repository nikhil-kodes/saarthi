# Saarthi Integration Hardening, Resilience & Queue Orchestration

## 1. Overview
Phase 12 unifies and hardens all 12 platform hubs (`PRD.md`, `WORKFLOW.md Flows 1–15`) into a cohesive, resilient enterprise application:
- **Global Localized Error Boundary (`/[locale]/error.tsx`):** Graceful recovery, incident ID recording, and 1-click retry.
- **Custom Localized 404 Recovery (`/[locale]/not-found.tsx`):** Clean redirect to cockpit.
- **Queue Inspector (`/api/admin/queues`):** Real-time monitoring of waiting, active, delayed, and failed jobs across all 8 BullMQ queues.
- **Unified Compliance Cockpit (`/[locale]/dashboard`):** Central dashboard linking all 12 operational hubs with verified state indicators.

---

## 2. Queue Health Architecture

```
[Web App / FastAPI microservice]
             │
             ▼
[Redis BullMQ Connection (redis:6379)]
   ├── 'compliance' Queue (Deadlines & Penalties)
   ├── 'notifications' Queue (Alerts & Reminders)
   ├── 'ai' Queue (Copilot & Reasoning)
   ├── 'ocr' Queue (Notice OCR & Parsing)
   ├── 'rag' Queue (Circular Embeddings & Chunks)
   ├── 'marketplace' Queue (RFQ Matching & Escrow)
   ├── 'payments' Queue (Razorpay Verification & Refunds)
   └── 'regulatory' Queue (Daily Gazette Ingestion)
             │
             ▼
[Worker Processors (apps/workers)]
```
