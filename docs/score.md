# Saarthi 5-Pillar Compliance Health Score (300 - 900)

## 1. Overview
The Compliance Health Score (`PRD.md §11`, `WORKFLOW.md Flow 11`) is an objective, standardized metric that measures the regulatory and tax compliance reliability of an Indian MSME. It serves as an institutional trust badge for commercial bank loans, fast-track GST refund approvals, and verified supplier onboarding in enterprise procurement marketplaces.

---

## 2. 5-Pillar Scoring Algorithm (Score Range: 300 to 900)

Total Score = `Base (300) + Sum of 5 Pillar Points (Max 600) = 300 to 900 Points`

| Pillar | Focus Area | Weight | Max Points | Measurement Criteria |
| :--- | :--- | :---: | :---: | :--- |
| **Pillar 1** | Filing Timeliness | 35% | 210 pts | On-time vs overdue monthly & annual filings (GSTR-1, GSTR-3B, EPF, ESI, FSSAI). |
| **Pillar 2** | Notice Resolution Velocity | 20% | 120 pts | Speed and completeness of resolving statutory notices without escalation. |
| **Pillar 3** | Identity & Registry Authenticity | 20% | 120 pts | Verified PAN, GSTIN, Udyam MSME, and FSSAI registry checks. |
| **Pillar 4** | Financial & Tax Discipline | 15% | 90 pts | Timely advance tax installments and lack of outstanding tax demands. |
| **Pillar 5** | Regulatory Adherence | 10% | 60 pts | Active operating licenses without pollution/labor suspension orders. |

### Grade Classification:
- **800 - 900 Points:** `AAA_EXCELLENT` (Prime Trust — Eligible for collateral-free credit & instant marketplace trade).
- **700 - 799 Points:** `AA_GOOD` (Good Standing — Standard commercial credit approval).
- **600 - 699 Points:** `A_MODERATE` (Moderate — Remediation advised for upcoming filings).
- **< 600 Points:** `NEEDS_IMPROVEMENT` (Remediation Required — Active notices/overdue filings require action).

---

## 3. Consent-Gated Sharing & Public Verification Links

- **Consent Grants:** Enterprise owners generate shareable links (`/verify/score/[token]`) with scoped validity (1 to 90 days) for designated banks or B2B buyers.
- **Audit Logging:** Every grant, view, and revocation is cryptographically timestamped in `score_consent_grants` and `audit_logs`.
