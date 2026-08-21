# Saarthi B2B Supplier Marketplace & Escrow Protocol

## 1. Overview
The B2B Supplier Marketplace (`PRD.md §12`, `WORKFLOW.md Flow 12`) connects verified Indian MSMEs with compliant domestic manufacturers and raw material suppliers (packaging, agricultural ingredients, machinery, safety gear). Transactions are safeguarded by the Saarthi Escrow Protocol and credit terms are gated by the business's 5-Pillar Compliance Health Score.

---

## 2. Request for Quotation (RFQ) Lifecycle

```
[Buyer Creates RFQ]
        │
        ▼
[Verified Suppliers Browse Catalog & RFQs]
        │
        ▼
[Supplier Submits Competitive Quote]
        │
        ▼
[Buyer Evaluates Quotes & Accepts Best Offer]
        │
        ▼
[Escrow Order Created · Funds Locked (DESIGN.md Moment #2)]
        │
        ▼
[Goods Delivered & Verified -> Escrow Released to Supplier]
```

---

## 3. Compliance Health Score Credit Gating

To mitigate counterparty default risk in B2B transactions, suppliers can set mandatory Compliance Health Score gates:
- **Score >= 800 (AAA):** Eligible for 60-day open invoice credit without collateral.
- **Score >= 700 (AA):** Eligible for 30-day trade credit with partial advance.
- **Score < 700:** 100% Escrow deposit or advance payment required.

---

## 4. Institutional Escrow Safety & Dark-Band UI

Per `DESIGN.md §8.5 Moment #2`, RFQ settlements and order confirmations are presented with high-contrast institutional dark bands and the mandatory `{component.sandbox-tag}` purple badge.
