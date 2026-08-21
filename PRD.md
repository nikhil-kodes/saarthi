# Saarthi — PRD.md

**Status:** Phase 0 deliverable — approved scope for all subsequent phases.
**Formerly:** Vyavastha (compliance-only baseline; superseded by this
expanded, converged product spec — terminology from the original spec is
preserved where not explicitly superseded).

---

## 1. Product Overview

Saarthi ("साथी" — companion/guide) is an AI-powered compliance, trust, and
business-enablement platform for Indian MSMEs and early-stage businesses. It
helps an MSME owner understand and act on their compliance obligations,
become digitally verifiable, transact with trusted suppliers and creators,
and build a portable, explainable record of responsible business behaviour —
the **Compliance Health Score (CHS)** — that can eventually support access
to formal credit.

```text
Business Identity → Verification → Compliance Activity → Marketplace
Behaviour → Payment/Transaction Behaviour → Compliance Health Score →
Trust / Credit Access
```

Every feature in this document exists to reinforce that convergence model.
Saarthi is not a bundle of unrelated tools — a feature that doesn't feed
into or draw from this chain should be questioned before being built.

---

## 2. Problem

Indian MSMEs operate under a dense, frequently-changing web of central and
state compliance obligations (GST, Udyam/MSME registration, labour law,
FSSAI, professional tax, and more), typically without a dedicated compliance
or legal function. The result, consistently reported across MSME surveys:

- Missed deadlines and licence renewals leading to penalties.
- Notices/orders that owners cannot interpret without paying a CA for a
  simple explanation.
- No systematic way to discover applicable government schemes.
- No portable proof of "good behaviour" that a lender, supplier, or brand
  can trust — every relationship starts from zero.
- Verification and trust infrastructure (KYC-like checks) that exists for
  large enterprises largely doesn't reach small, informal, or first-time
  registered businesses.

Saarthi's bet: if compliance is made legible and low-effort, the resulting
verified activity record becomes valuable infrastructure for marketplace
trust and, eventually, credit access — turning a cost center (compliance)
into an asset (a score).

---

## 3. Target Users / Personas

| Role | Who they are | Primary need from Saarthi |
|---|---|---|
| **Owner** | MSME proprietor/director, often the sole decision-maker, variable digital literacy, may prefer Hindi | "Tell me what's due, what's risky, and what I should do — in my language." |
| **Team Member** | Employee delegated to handle specific compliance/marketplace tasks | Scoped access to only the tasks/documents relevant to their role |
| **CA Partner** | External chartered accountant/consultant serving multiple client businesses | Multi-business view, ability to act on a client's behalf within granted permissions |
| **Supplier** | MSME or trader offering goods/services on the B2B marketplace | Discoverability, a verification badge that signals trustworthiness, a straightforward RFQ→order flow |
| **Influencer / Creator** | Individual or small agency creating branded content | Fair campaign matching, contract/TDS clarity, verified reach metrics |
| **Lender / NBFC** | Formal credit provider evaluating an MSME | Consent-gated, explainable view into a business's CHS and verified activity — never raw account access |
| **Admin** | Saarthi internal operator | Platform health, verification queue oversight, audit visibility, dispute support |

---

## 4. Product Goals

1. Reduce the time and anxiety cost of staying compliant for a first-time
   or informally-run MSME.
2. Make every AI-generated compliance explanation grounded in a citable
   source — never an invented legal conclusion.
3. Give every business a deterministic, explainable trust score instead of
   an opaque one.
4. Make supplier and creator marketplace participation safer by surfacing
   compliance-based verification, not just self-reported claims.
5. Ship a working, demonstrable, bilingual (English + Hindi) product for
   the internal hackathon that is architecturally honest about what is
   real integration versus mocked/sandboxed integration.

---

## 5. Scope Decisions Specific to This Build

These four decisions apply across every document in this repository and
must not be silently reinterpreted in any phase:

1. **Bilingual from day one: English + Hindi (`en`, `hi`).** Every
   user-facing string, notification, WhatsApp message template, and PDF
   export must exist in both locales before a feature is considered done.
   No feature ships English-only "to be translated later." See DESIGN.md §3
   and WORKFLOW.md's i18n rule.
2. **Legal/regulatory data scope: Central (India) law + Uttar Pradesh
   state law only, for now.** The compliance requirement engine,
   regulatory monitoring, and scheme-matching content are populated for (a)
   central acts/rules applicable nationwide (GST, Companies Act,
   labour codes, Income Tax/TDS, FSSAI at the central level, Udyam) and (b)
   Uttar Pradesh state-specific obligations (state GST administration
   specifics, UP Shops & Establishments Act, UP-specific labour welfare
   provisions, UP professional tax where applicable, UP-specific scheme
   listings). **The data model must not hardcode this limitation** — every
   regulatory record and every business carries an explicit
   `jurisdiction` (country + optional state) so that adding a second,
   third, or N-th state later is a data-population exercise, not a schema
   or code change. See database.md §"Jurisdiction Model."
3. **Regulatory figures are volatile — store them as versioned reference
   data, not literals in code.** Thresholds like Udyam/MSME classification
   limits, GST registration turnover thresholds, EPF/ESI applicability
   thresholds, and minimum wage figures change periodically and must live
   in a `regulatory_reference_data` table (database.md) with an
   effective-date and source-citation column — never hardcoded in
   TypeScript/Python. See §12 below for the specific figures known at
   spec-writing time and their currency caveats.
4. **Every non-real integration is an explicitly named mock, visually
   flagged in the UI (DESIGN.md §9), never a silent fake.**

---

## 6. Functional Requirements — Track A: Compliance Copilot

- User onboarding (signup, profile, locale selection).
- Business onboarding (business profile, sector, state — constrained to UP
  for state-specific content, other states selectable but with a
  "state coverage in progress" indicator per Scope Decision #2).
- Business verification (via the abstracted `VerificationProvider`, mock by
  default — see security.md).
- Personalised compliance calendar, generated from the requirement engine
  applied to the business's profile (sector, state, employee count,
  registrations held).
- Compliance requirement engine: deterministic rules mapping business
  attributes → applicable obligations (not LLM-decided — master spec §4/§14
  rule extended to the requirement engine itself, not just the score).
- Regulatory change monitoring and classification (WORKFLOW.md).
- Notice upload, OCR, and plain-language explanation (source-grounded).
- Regulatory RAG (question-answering grounded in ingested central + UP
  sources).
- Government scheme auto-matching (central + UP schemes at MVP).
- Licence/registration expiry tracking and deadline reminders (WhatsApp +
  in-app).
- Payment tracking, overdue-payment identification, refund tracking.
- Inspection preparation checklist support.
- Labour compliance assistance (central labour codes + UP-specific
  provisions).
- Compliance Health Score (§10).

## 7. Functional Requirements — Track B: Supplier Marketplace

- Supplier onboarding and business verification (badge tied to compliance
  verification state, not a separate unrelated rating).
- Supplier discovery with category and state/location filtering.
- RFQ creation, quotation submission and comparison.
- Order management, escrow-style payment orchestration (via
  `PaymentProvider`).
- Supplier transaction history and buyer/supplier reputation.
- Supplier compliance profile (a scoped, consent-respecting view of
  relevant CHS signals — not the full score).

## 8. Functional Requirements — Track C: Influencer Marketplace

- Creator onboarding, verification, and social account connection (via
  `SocialMediaProvider`, mock by default at MVP).
- Follower/engagement metrics, category, audience metadata.
- Brand campaign creation, AI-assisted creator matching, discovery.
- Proposal/collaboration workflow, contract generation.
- ASCI disclosure clauses included in generated contracts (India-specific
  advertising-standards requirement).
- TDS calculation support for creator payouts (India tax requirement).
- Cash and barter campaign handling.
- Escrow/payment workflow, campaign completion, creator/brand history.

## 9. Cross-Cutting: Roles, Permissions, RBAC

Full detail in rbac.md; summarized here as a functional requirement: every
protected action in the product must be checked against an explicit
permission (e.g., `compliance.manage`, `marketplace.sell`), never a raw
role-string comparison, with PostgreSQL RLS as a second boundary.

## 10. Compliance Health Score — Product Requirements

- Scale 0–900, deterministic, explainable (master spec §4 — no LLM decides
  the score).
- Signals: filing punctuality, compliance completion rate, missed
  deadlines, licence validity, registration verification completeness,
  notice-response behaviour, payment behaviour, supplier/marketplace
  conduct.
- Every score MUST render with a signed contribution list (§DESIGN.md §8.4)
  and full history (never overwritten — see database.md's
  `compliance_score_events`).
- Consent-gated sharing: a business explicitly grants a lender/NBFC access
  to its score and explanation; access can be revoked; every grant/revoke
  is audit-logged (`consents`, `audit_logs`).

---

## 11. Non-Functional Requirements

- **Security by default:** RBAC + RLS defense-in-depth (security.md), no
  secrets in client bundles, signed internal service calls.
- **Bilingual parity:** no feature ships without both locale strings
  (Scope Decision #1).
- **Explainability:** every AI-generated compliance statement carries a
  source citation (ai-rag.md); the CHS is never a black box.
- **Idempotency:** every async external-facing workflow (webhook,
  notification, score recalculation) is safe under retry/duplicate
  delivery (WORKFLOW.md).
- **Modularity:** every external dependency sits behind an adapter
  (TECHSTACK.md §10); no vendor lock-in baked into business logic.
- **Testability:** critical paths have automated tests from the phase they
  are introduced in, not deferred to a final QA phase (testing.md).
- **Performance:** dashboard first-contentful-paint reasonable on a
  mid-range Android device over a 4G connection — this is a real
  constraint given the target user, not a generic aspiration.
- **Deployability:** the full system runs via Docker Compose on a single
  AWS EC2 instance for the hackathon (deployment.md).
- **Forward-compatibility:** the jurisdiction model, provider adapters, and
  RBAC design must not require a rewrite to add a new state, a new
  external integration, or a production-scale infrastructure migration.

---

## 12. Regulatory Reference Data — Known Figures at Spec Time (verify before build)

These figures are provided so the requirement engine and scheme matcher
have a correct starting dataset. **Every figure below must be re-verified
against the current official notification (MSME ministry, CBIC, UP Labour
Department, EPFO, ESIC) at the time the `regulatory_reference_data` table
is seeded, and stored with its source and effective date** — do not copy
these numbers into code as literals.

| Reference | Figure (as of Budget 2025-26, effective 1 Apr 2025) | Confidence |
|---|---|---|
| **Udyam/MSME classification — Micro** | Investment ≤ ₹2.5 crore, Turnover ≤ ₹10 crore | High — corroborated by multiple independent sources reviewed at spec time |
| **Udyam/MSME classification — Small** | Investment ≤ ₹25 crore, Turnover ≤ ₹100 crore | High |
| **Udyam/MSME classification — Medium** | Investment ≤ ₹125 crore, Turnover ≤ ₹500 crore | High |
| **MSME classification criterion** | Composite: **both** investment and turnover conditions apply; crossing either threshold moves the enterprise to the next category | High |
| **GST registration threshold — goods** | Aggregate turnover > ₹40 lakh (₹20 lakh in special-category states) | Established/stable; UP is **not** a special-category state, so the ₹40 lakh threshold applies |
| **GST registration threshold — services** | Aggregate turnover > ₹20 lakh (₹10 lakh in special-category states) | Established/stable |
| **EPF applicability** | Establishments with 20+ employees | Established/stable |
| **ESI applicability** | Establishments with 10+ employees (wage ceiling ~₹21,000/month, ~₹25,000 for persons with disability) | Established, but wage ceiling has been revised historically — re-verify |
| **Section 43B(h), Income Tax Act** | Buyers must pay Micro/Small suppliers within 45 days (or the agreed period, max 45 days) or lose the expense deduction | High |

**Explicit caveat found during research:** one lower-quality secondary
source claimed a further 2026 revision replacing the composite
investment+turnover criterion with a turnover-only criterion. This claim
was **not corroborated** by the majority of sources reviewed and should be
treated as unverified — confirm directly against an official Ministry of
MSME / Gazette notification before encoding any turnover-only logic. Do not
implement this change speculatively.

---

## 13. User Journeys (representative, not exhaustive — full detail in WORKFLOW.md)

1. Owner signs up → completes business onboarding in Hindi → sees a
   generated compliance calendar for a Uttar Pradesh food-sector business.
2. Owner uploads a government notice photographed on a phone → receives a
   plain-language, source-cited explanation within the app and via
   WhatsApp.
3. Owner views their Compliance Health Score, sees exactly why it moved,
   and grants a connected NBFC consent to view it for a loan application.
4. Supplier completes verification → appears in marketplace search with a
   verified badge → responds to an RFQ → completes an escrowed order.
5. Brand creates a campaign → Saarthi suggests matching verified creators →
   a contract with ASCI disclosure and TDS terms is generated →
   campaign completes and both parties' histories update.

---

## 14. MVP / Internal-Hackathon Scope

**In scope:**
- Tracks A, B, C as described above, to the depth defined per phase in
  IMPLEMENTATION.md.
- Bilingual EN/HI across all shipped surfaces.
- India (central) + Uttar Pradesh regulatory data only.
- Mock-by-default for VerificationProvider, SocialMediaProvider,
  GovernmentDataProvider; real integrations for Supabase, R2, Redis/BullMQ,
  WhatsApp Cloud API (sandbox/test number acceptable), Razorpay (test mode),
  and a configured LLM/embedding provider.
- Deterministic, explainable CHS with full history.
- Seeded, deterministic demo data (§16).

**Explicitly out of scope for this build:**
- States other than Uttar Pradesh (data population only — architecture
  must support them, per Scope Decision #2).
- Real DigiLocker/government API integration (abstraction exists; live
  connection is future work).
- Kubernetes, multi-region deployment, dark mode (DESIGN.md §13).
- Trading-business Udyam eligibility (per current MSMED Act scope — traders
  are not Udyam-eligible; Saarthi may still onboard traders for the
  marketplace tracks but they will not have Udyam-based verification).
- A production-grade credit/lending decision engine — Saarthi provides the
  consented data view, not a lending product itself.

---

## 15. Acceptance & Success Criteria

A feature is acceptance-complete only when it satisfies IMPLEMENTATION.md's
per-phase Definition of Done. Product-level success criteria for the
hackathon demo:

- A judge can complete the Final Demo Journey (IMPLEMENTATION.md /
  master-spec-derived) end to end without configuring any external
  credential.
- Every AI explanation shown during the demo carries a visible source
  citation.
- Switching the language toggle mid-session changes every visible string,
  including WhatsApp message previews and the CHS explanation list, with
  no untranslated fallback text visible.
- The CHS for the seeded demo business matches its displayed contribution
  list exactly (sum of contributions = displayed score).
- No screen backed by a mock provider is presented without the sandbox
  indicator (DESIGN.md §9).

---

## 16. Demo Data

One complete seeded demonstration business, e.g.:

```text
Business: Demo Foods MSME (स्वाद फूड्स)
Sector: Food / Restaurant
State: Uttar Pradesh
Registrations: GST, Udyam, FSSAI
Employees: 18
Compliance Health Score: 742 / 900
```

All synthetic data is clearly marked as such in seed scripts and,
where shown mid-product (not just in dev tooling), carries the sandbox
indicator if it stands in for a live external data source.
