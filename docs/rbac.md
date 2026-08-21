# Saarthi — Role-Based Access Control (RBAC) Specification

> **Governing Rule:** Every protected route, action, and API handler in Saarthi must be checked against an explicit granular permission (e.g. `compliance.manage`, `marketplace.sell`), **never** against a raw role-name string comparison (`role === 'owner'`).

---

## 1. Overview & Personas

Saarthi defines 7 foundational personas tailored to the Indian MSME ecosystem:

| Role | Persona | Scope & Responsibilities |
|---|---|---|
| **`owner`** | MSME Proprietor / Director | Full authority over business profile, team members, compliance actions, consents, and marketplace accounts. |
| **`team_member`** | Operational Employee | Scoped access to mark compliance tasks complete, view calendar, and upload documents. |
| **`ca_partner`** | Chartered Accountant / Consultant | Scoped cross-business access to review compliance filings, notices, audit trails, and export reports. |
| **`supplier`** | B2B Marketplace Seller | Manage supplier catalog, submit quotations, fulfill orders, and showcase compliance badges. |
| **`influencer`** | Content Creator / Agency | Collaborate on brand campaigns, submit deliverables, and track TDS-deducted payouts. |
| **`lender`** | Bank / NBFC Credit Officer | Consent-gated, read-only view of Compliance Health Score and verified activity. |
| **`admin`** | Internal Platform Operator | Oversight over verification queue, dispute resolution, system health, and audit logs. |

---

## 2. Granular Permissions Matrix

| Permission | Module | owner | team_member | ca_partner | supplier | influencer | lender | admin |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `compliance.view` | Compliance | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| `compliance.manage` | Compliance | ✅ | ✅ | ✅ | — | — | — | ✅ |
| `compliance.export` | Compliance | ✅ | — | ✅ | — | — | — | ✅ |
| `documents.view` | Documents | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| `documents.upload` | Documents | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| `documents.delete` | Documents | ✅ | — | — | — | — | — | ✅ |
| `business.view` | Business | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `business.update_profile` | Business | ✅ | — | — | — | — | — | ✅ |
| `business.verify` | Business | ✅ | — | — | ✅ | ✅ | — | ✅ |
| `team.view` | Team | ✅ | — | — | — | — | — | ✅ |
| `team.invite` | Team | ✅ | — | — | — | — | — | ✅ |
| `team.manage_roles` | Team | ✅ | — | — | — | — | — | ✅ |
| `team.remove` | Team | ✅ | — | — | — | — | — | ✅ |
| `marketplace.buy` | Marketplace | ✅ | ✅ | — | — | — | — | ✅ |
| `marketplace.sell` | Marketplace | ✅ | — | — | ✅ | — | — | ✅ |
| `marketplace.manage_rfq` | Marketplace | ✅ | — | — | ✅ | — | — | ✅ |
| `campaigns.create` | Campaigns | ✅ | — | — | — | — | — | ✅ |
| `campaigns.collaborate` | Campaigns | — | — | — | — | ✅ | — | ✅ |
| `campaigns.payout` | Campaigns | ✅ | — | — | — | — | — | ✅ |
| `score.view` | Score | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| `score.share` | Score | ✅ | — | — | — | — | — | ✅ |
| `consents.view` | Consents | ✅ | — | — | — | — | — | ✅ |
| `consents.grant` | Consents | ✅ | — | — | — | — | — | ✅ |
| `consents.revoke` | Consents | ✅ | — | — | — | — | — | ✅ |
| `audit.view` | Audit | ✅ | — | ✅ | — | — | — | ✅ |
| `admin.all` | Admin | — | — | — | — | — | — | ✅ |

---

## 3. Enforcement Architecture (Two-Layer Defense)

```text
[HTTP Request]
       │
       ▼
[Layer 1: Application Layer (Next.js / Route Handlers)]
  - Session verified via Supabase JWT
  - Active business membership resolved
  - requirePermission(permissions, 'compliance.manage') checked
       │
       ▼
[Layer 2: Database Layer (PostgreSQL)]
  - Native Row Level Security (RLS) policies
  - is_member_of_business(business_id)
  - has_business_permission(business_id, permission_name)
```

### 3.1 TypeScript Usage Example

```typescript
import { requirePermission } from '@/lib/rbac/service';
import { AuthService } from '@/lib/auth/service';

export async function POST(request: Request) {
  const session = await AuthService.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Enforce granular permission check
  requirePermission(session.permissions, 'compliance.manage', 'modifying compliance task');

  // Proceed with business service execution...
}
```
