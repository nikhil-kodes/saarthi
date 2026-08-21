# Saarthi — Database Specification & Schema

> **Status:** Created in Phase 2, living document updated as schema evolves.
> **Database Engine:** PostgreSQL 15 (Supabase-managed) with `pgvector`, `uuid-ossp`, `pgcrypto`, and native Row Level Security (RLS).

---

## 1. Schema Architecture & Philosophy

The Saarthi database models the convergence chain:
```text
Business Identity → Verification → Compliance Activity → Marketplace Behaviour 
→ Payment Behaviour → Compliance Health Score → Trust / Credit Access
```

Key Architectural Tenets:
1. **Relational Integrity First:** Strong foreign keys and constraints over document flexibility.
2. **Defense-in-Depth RLS:** Every multi-tenant or sensitive table has Row Level Security enabled.
3. **Immutable Audit Trail:** `audit_logs` is append-only (`SELECT` and `INSERT` only, zero `UPDATE` or `DELETE`).
4. **Generic Jurisdiction Model:** Every regulatory record and business carries an explicit `jurisdiction_country` and `jurisdiction_state` (Central + UP for Phase 0–4, cleanly expandable).

---

## 2. Table Specifications

### 2.1 `profiles` (User Profiles)
Stores user identity, contact details, and localization preference. Linked 1:1 with Supabase `auth.users`.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, `REFERENCES auth.users(id) ON DELETE CASCADE` | Matches Supabase Auth user ID |
| `email` | `TEXT` | `NOT NULL`, `UNIQUE` | Normalized email address |
| `full_name` | `TEXT` | `NULLABLE` | Display name of the user |
| `phone_number` | `TEXT` | `NULLABLE` | Indian mobile number (e.g. for WhatsApp reminders) |
| `locale` | `locale_enum` | `NOT NULL`, `DEFAULT 'en'` | User language preference (`en`, `hi`) |
| `avatar_url` | `TEXT` | `NULLABLE` | Profile picture URI |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT NOW()` | Last update timestamp |

### 2.2 `businesses` (Business Entities)
Stores legal entity information, classification metrics, and registration numbers.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Business unique ID |
| `legal_name` | `TEXT` | `NOT NULL` | Registered legal business name |
| `trade_name` | `TEXT` | `NULLABLE` | Brand or operating name |
| `sector` | `TEXT` | `NOT NULL` | Industry classification (NIC code / standardized sector) |
| `jurisdiction_country` | `TEXT` | `NOT NULL`, `DEFAULT 'IN'` | Country code (India) |
| `jurisdiction_state` | `TEXT` | `NOT NULL`, `DEFAULT 'UP'` | State code (Uttar Pradesh for MVP) |
| `employee_count_band` | `TEXT` | `NULLABLE` | Employee size band (`1-9`, `10-19`, `20-49`, `50-249`, `250+`) |
| `turnover_band` | `TEXT` | `NULLABLE` | MSME turnover band (`micro`, `small`, `medium`) |
| `investment_band` | `TEXT` | `NULLABLE` | Plant & machinery investment band |
| `gstin` | `TEXT` | `NULLABLE` | 15-character GSTIN |
| `udyam_number` | `TEXT` | `NULLABLE` | Udyam registration number |
| `fssai_number` | `TEXT` | `NULLABLE` | 14-digit FSSAI licence number |
| `pan` | `TEXT` | `NULLABLE` | 10-character PAN |
| `is_verified` | `BOOLEAN` | `NOT NULL`, `DEFAULT FALSE` | Business identity verification status |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT NOW()` | Last update timestamp |

### 2.3 `roles` (System & Application Roles)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `name` | `TEXT` | `PRIMARY KEY` | Role identifier (`owner`, `team_member`, `ca_partner`, `supplier`, `influencer`, `lender`, `admin`) |
| `description` | `TEXT` | `NOT NULL` | Plain language description of role scope |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT NOW()` | Record creation timestamp |

### 2.4 `permissions` (Granular Capabilities)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `name` | `TEXT` | `PRIMARY KEY` | Permission name (`compliance.view`, `marketplace.buy`, etc.) |
| `module` | `TEXT` | `NOT NULL` | Module grouping (`compliance`, `marketplace`, `team`, `score`, `audit`, `admin`) |
| `description` | `TEXT` | `NOT NULL` | Description of granted capability |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT NOW()` | Record creation timestamp |

### 2.5 `role_permissions` (Role-to-Permission Mapping)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique mapping ID |
| `role_name` | `TEXT` | `NOT NULL`, `REFERENCES roles(name) ON DELETE CASCADE` | Associated role |
| `permission_name` | `TEXT` | `NOT NULL`, `REFERENCES permissions(name) ON DELETE CASCADE` | Granted permission |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT NOW()` | Record creation timestamp |

*Unique Constraint:* `(role_name, permission_name)`

### 2.6 `business_memberships` (User-to-Business Affiliation)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique membership ID |
| `user_id` | `UUID` | `NOT NULL`, `REFERENCES profiles(id) ON DELETE CASCADE` | Affiliated user |
| `business_id` | `UUID` | `NOT NULL`, `REFERENCES businesses(id) ON DELETE CASCADE` | Target business entity |
| `role_name` | `TEXT` | `NOT NULL`, `REFERENCES roles(name) ON DELETE RESTRICT` | Role held in this business |
| `is_active` | `BOOLEAN` | `NOT NULL`, `DEFAULT TRUE` | Active/deactivated status |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT NOW()` | Membership grant timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT NOW()` | Last update timestamp |

*Unique Constraint:* `(user_id, business_id)`

### 2.7 `audit_logs` (Immutable Security Audit Trail)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique log entry ID |
| `business_id` | `UUID` | `NULLABLE`, `REFERENCES businesses(id) ON DELETE SET NULL` | Target business (if business-scoped) |
| `actor_id` | `UUID` | `NULLABLE`, `REFERENCES profiles(id) ON DELETE SET NULL` | User performing the action |
| `action` | `TEXT` | `NOT NULL` | Machine-readable action verb (e.g. `AUTH_SIGNUP`, `BUSINESS_VERIFY`) |
| `resource_type` | `TEXT` | `NOT NULL` | Resource type (`user`, `business`, `task`, `consent`) |
| `resource_id` | `TEXT` | `NULLABLE` | Specific resource ID modified |
| `details` | `JSONB` | `NOT NULL`, `DEFAULT '{}'::jsonb` | Structured event context & payload |
| `ip_address` | `TEXT` | `NULLABLE` | Client IP address |
| `user_agent` | `TEXT` | `NULLABLE` | Client user agent |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT NOW()` | Exact timestamp of event |

### 2.8 `business_verifications` (Verification Audit History)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique verification run ID |
| `business_id` | `UUID` | `NOT NULL`, `REFERENCES businesses(id) ON DELETE CASCADE` | Associated business entity |
| `status` | `verification_status_enum` | `NOT NULL`, `DEFAULT 'pending'` | Overall verification outcome (`unverified`, `pending`, `verified`, `rejected`) |
| `provider_used` | `TEXT` | `NOT NULL`, `DEFAULT 'MockVerificationProvider'` | Identifier of provider used |
| `checked_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT NOW()` | Timestamp when checks were executed |
| `check_results` | `JSONB` | `NOT NULL`, `DEFAULT '[]'::jsonb` | Array of per-credential check objects (PAN, GSTIN, Udyam, FSSAI) |
| `failure_reason` | `TEXT` | `NULLABLE` | Explanation if verification was rejected |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT NOW()` | Last update timestamp |

### 2.9 `team_invites` (Delegated Invitations)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique invite ID |
| `business_id` | `UUID` | `NOT NULL`, `REFERENCES businesses(id) ON DELETE CASCADE` | Target business entity |
| `invited_by` | `UUID` | `NOT NULL`, `REFERENCES profiles(id) ON DELETE CASCADE` | User creating the invitation |
| `email` | `TEXT` | `NOT NULL` | Destination email address |
| `role_name` | `TEXT` | `NOT NULL`, `REFERENCES roles(name) ON DELETE RESTRICT` | Assigned role |
| `token` | `TEXT` | `NOT NULL`, `UNIQUE` | Secure random invite acceptance token |
| `expires_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT (NOW() + INTERVAL '7 days')` | Expiration timestamp |
| `accepted_at` | `TIMESTAMPTZ` | `NULLABLE` | Timestamp when invite was claimed |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT NOW()` | Record creation timestamp |

---

## 3. Database Functions & Triggers

### 3.1 `handle_new_user()`
Trigger on `auth.users` that automatically inserts a corresponding row into `public.profiles` upon user creation.

### 3.2 `is_member_of_business(business_uuid UUID) -> BOOLEAN`
Security definer function used in RLS policies to determine if `auth.uid()` holds an active membership in `business_uuid`.

### 3.3 `has_business_permission(business_uuid UUID, required_permission TEXT) -> BOOLEAN`
Evaluates whether `auth.uid()` has an active role in `business_uuid` that contains `required_permission`.

---

## 4. Row Level Security (RLS) Policy Summary

| Table | Operation | Policy Rule |
|---|---|---|
| `profiles` | `SELECT` | `auth.uid() = id` |
| `profiles` | `UPDATE` | `auth.uid() = id` |
| `businesses` | `SELECT` | `is_member_of_business(id)` |
| `businesses` | `INSERT` | `auth.uid() IS NOT NULL` |
| `businesses` | `UPDATE` | Member with `owner` role in business |
| `business_memberships` | `SELECT` | Member of same business or self |
| `business_memberships` | `ALL` | Member with `owner` role in business |
| `roles` / `permissions` | `SELECT` | Public read (`TRUE`) |
| `business_verifications` | `SELECT` | Member of target business |
| `business_verifications` | `INSERT` / `UPDATE` | Member with `business.verify` permission |
| `team_invites` | `SELECT` | Member of target business |
| `team_invites` | `INSERT` | Member with `team.invite` permission |
| `team_invites` | `DELETE` | Member with `team.remove` permission |
| `audit_logs` | `SELECT` | Member of target business |
| `audit_logs` | `INSERT` | System or self (`actor_id = auth.uid()`) |
| `audit_logs` | `UPDATE` / `DELETE` | **Explicitly Denied (`FALSE`)** |
