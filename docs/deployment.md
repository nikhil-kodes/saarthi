# Saarthi Production Deployment & Orchestration Guide

## 1. Overview
Saarthi is architected as a modular, containerized multi-service platform (`TECHSTACK.md §11, PRD.md §16`):
- **Web Service (`@saarthi/web`):** Next.js 15 App Router running in standalone container mode on port 3000.
- **AI Processing Microservice (`apps/ai-service`):** Python 3.12 FastAPI microservice serving RAG embeddings, OCR notice parsing, and 5-Pillar health scoring on port 8000.
- **Background Worker Service (`@saarthi/workers`):** Node.js BullMQ daemon handling compliance schedule generation, notifications, and escrow settlement.
- **Queue State Broker (`redis`):** Redis 7 Alpine container on port 6379.
- **Database & Identity (`supabase` / PostgreSQL 16):** Managed Supabase or self-hosted PostgreSQL with `pgvector`.

---

## 2. Quick Start with Docker Compose

### Step 1: Configure Environment Variables
```bash
cp .env.example .env
# Edit .env and supply your Supabase and Razorpay credentials
```

### Step 2: Build and Run Services
```bash
./scripts/start-prod.sh
```
Or directly with Docker Compose:
```bash
docker compose up -d --build
```

### Step 3: Verify Multi-Service Health
```bash
./scripts/healthcheck.sh
```

---

## 3. Container Topology & Networking

```
                     ┌──────────────────┐
                     │   Reverse Proxy  │ (e.g. Traefik / Nginx / Cloudflare)
                     └─────────┬────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
            ▼ (port 3000)      ▼ (port 8000)      │
     ┌─────────────┐    ┌─────────────┐           │
     │ Next.js Web │    │ FastAPI AI  │           │
     └──────┬──────┘    └──────┬──────┘           │
            │                  │                  │
            │                  ▼                  │
            │           ┌─────────────┐           │
            │           │ pgvector DB │           │
            │           └─────────────┘           │
            │                                     │
            └──────────► ┌─────────────┐ ◄────────┘
                         │    Redis    │
                         └──────┬──────┘
                                │
                                ▼
                         ┌─────────────┐
                         │   Workers   │
                         └─────────────┘
```
