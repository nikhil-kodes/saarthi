# Saarthi Enterprise Security, Audit Trail & CA Portal

## 1. Overview
Enterprise security and accountability (`PRD.md §14, §15`, `WORKFLOW.md Flow 14`) form the trust bedrock of Saarthi. All state transitions (filing proofs, verification checks, score grants, escrow movements, and notice uploads) are recorded in an immutable `audit_logs` store.

---

## 2. Chartered Accountant (CA) Partner Portal

The CA Partner interface (`/[locale]/ca/clients`) enables certified practitioners to manage client MSME portfolios with scoped RBAC:
- **Client Status Overview:** Real-time visibility into overdue, upcoming, and compliant instances across Central & State acts.
- **Filing Assistance:** Direct ability to upload challans and ack numbers on behalf of the business.
- **1-Click Compliance Dossier:** Instant compilation of statutory filing histories, verified registries, and 5-Pillar Health Score certificates for bank loan appraisals and credit underwriting.

---

## 3. Platform Administration & Security Controls

- **Superadmin Overview (`/[locale]/admin`):** Live aggregates of verified MSME entities, active statutory notices, and B2B escrow orders.
- **Audit Explorer:** Filterable audit logging covering actor identity, resource types, client IP, and payload diffs.
- **Row-Level Security (RLS):** Supabase RLS guarantees zero cross-tenant data leakage across all database tables.
