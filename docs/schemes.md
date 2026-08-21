# Saarthi Government Schemes Engine & Payment / Escrow Gateway

## 1. Overview
The Government Schemes & Payment module (`PRD.md §10`, `WORKFLOW.md Flows 9 & 10`) bridges Indian MSMEs with Central and State financial support schemes (subsidies, interest subventions, collateral-free credit) and provides an integrated, sandboxed payment checkout and escrow refund engine.

---

## 2. Supported Government Schemes & Subsidies

1. **Prime Minister Employment Generation Programme (PMEGP):**
   - 15% to 35% margin money capital subsidy on projects up to ₹50 Lakhs for micro-enterprises.
2. **Pradhan Mantri Mudra Yojana (PMMY):**
   - Tarun category collateral-free institutional credit up to ₹10 Lakhs.
3. **Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE):**
   - 75% to 85% credit guarantee for bank term loans up to ₹5 Crore without third-party collateral.
4. **UP MSME Promotion Policy 25% Capital Subsidy:**
   - 25% capital subsidy on plant & machinery (up to ₹4 Crore) for Purvanchal & Bundelkhand industrial units.
5. **UP MSME 5% Interest Subvention Scheme:**
   - 5% annual interest rebate on term loans from commercial banks for up to 5 years.

---

## 3. Eligibility Matching Rules Matrix

The schemes engine (`SchemesService.evaluateEligibility`) evaluates:
- **Operating Jurisdiction:** Compares Central schemes vs state schemes (`jurisdictionState = 'UP'`).
- **Turnover Band & Enterprise Category:** Micro / Small / Medium thresholds.
- **Registrations:** Validates presence of `udyamNumber`, `gstin`, and `pan`.
- **Target Sectors:** Matches manufacturing, food processing, textiles, or leather sectors.

---

## 4. Payment Gateway & Escrow Refund Architecture

- **Payment Provider Abstraction:** `PaymentProvider` interface with production-ready `MockPaymentProvider` (simulating Razorpay orders, webhook signature verification, and instant refunds).
- **Mandatory Sandbox Tagging:** All simulated checkouts and payment balances feature the purple pill badge (`bg-sandbox-bg text-sandbox`: *"Sandbox data · not a live government/bank connection"*) per `DESIGN.md §9`.
- **Escrow Refund Safety:** 1-click instant escrow cancellation refunds recorded with audit logs in `payment_transactions`.
