# Saarthi — Security Architecture & Guidelines

> **Status:** Created in Phase 2. Defines security controls, authentication mechanisms, Row Level Security, and defense-in-depth policies.

---

## 1. Core Security Principles

1. **Defense-in-Depth:** Every authorization decision is evaluated at both the Application Layer (Next.js route handlers) and the Database Layer (PostgreSQL Row Level Security).
2. **No Raw Secrets in Client Bundles:** Only public environment variables (`NEXT_PUBLIC_*`) are exposed to browser clients. Database passwords, Redis credentials, and service role keys remain strictly server-side.
3. **Verification is NOT Authentication:**
   - **Authentication:** Confirms user identity ("Who are you?"). Handled by Supabase Auth with secure HTTP-only cookies and cryptographic JWT verification.
   - **Verification:** Evaluates business trustworthiness ("Can this business be trusted?"). Handled by `VerificationProvider` (mocked in development with mandatory UI sandbox tagging).
4. **Append-Only Audit Logs:** Sensitive state changes (consents, verifications, role changes, payouts) are recorded synchronously in an append-only `audit_logs` table where `UPDATE` and `DELETE` are disallowed at the database level.
5. **Signed Internal Service Authentication:** Calls between Next.js and FastAPI carry a shared `INTERNAL_SERVICE_TOKEN` header.

---

## 2. Authentication & Session Management

- **Provider:** Supabase Auth (`@supabase/ssr`).
- **Session Transport:** Encrypted, HTTP-only, `SameSite=Lax` cookies.
- **Session Refresh:** Handled automatically in Next.js middleware via `updateSession()`.
- **Password Constraints:** Minimum 8 characters, requiring at least one letter and one number (`packages/validation`).

---

## 3. Row Level Security (RLS) Isolation

PostgreSQL RLS ensures that even if an application-layer bug exists, one tenant cannot query or mutate another business's records:

```sql
-- Example: Business isolation policy
CREATE POLICY "Users can view businesses they belong to"
  ON public.businesses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.business_memberships
      WHERE business_id = public.businesses.id
        AND user_id = auth.uid()
        AND is_active = TRUE
    )
  );
```

---

## 4. Input Validation & API Error Handling

- **Shared Zod Schemas:** Input validation uses `@saarthi/validation` across both frontend form hooks and backend API route handlers to prevent schema drift.
- **Safe Error Responses:** Database errors and internal stack traces are sanitized before responding to clients:
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Invalid input parameters"
    }
  }
  ```
