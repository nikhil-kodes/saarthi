# Saarthi Notice OCR & WhatsApp Copilot

## 1. Overview
The Notice OCR & Explainer subsystem (`PRD.md §9`, `WORKFLOW.md Flow 8`) demystifies intimidating statutory notices for Indian business owners. It ingests notices from the web application or directly via WhatsApp, runs OCR and legal classification, breaks down demands into plain Hindi and English, and produces pre-filled formal response drafts.

---

## 2. Supported Notice Formats & Authorities

1. **GST Department (CBIC / State GST):**
   - `FORM GST DRC-01A` / `DRC-01`: Intimation of tax ascertained under Section 73/74 for GSTR-3B vs GSTR-2B ITC discrepancies.
2. **Income Tax Department:**
   - `Section 148A(b)` / `Section 142(1)`: Show cause notice for reassessment of unexplained high-value cash transactions.
3. **Food Safety (FSSAI):**
   - `Section 32 Improvement Notice`: Hygiene, water testing certification, and packaging compliance.
4. **Labor Department (Uttar Pradesh):**
   - `UP Shops & Establishments Act Inspection Notice`: Registration renewal and employee register records.

---

## 3. 3-Part Plain-Language Explainer Standard

Every notice is parsed into three structured sections:
1. **What This Notice Means:** Clear, jargon-free description of the statutory query.
2. **Financial Liability & Penalty Risk:** Exact tax demand amount, statutory interest (e.g. 18% p.a. under Sec 50), and penalty ranges.
3. **Step-by-Step Action Plan:** Deadlines, portal links, required document annexures, and point-by-point defense grounds.

---

## 4. Emergency Action Window Banner

Per `DESIGN.md §8.5` (Moment #1 of 3 Dark-Band Moments), when a statutory notice has **less than 7 days remaining** before coercive recovery or assessment finalization, the UI displays a high-urgency dark-band banner with glowing status indicators and bold numerical due dates in tabular figures.

---

## 5. WhatsApp Copilot Simulator

- **Endpoint:** `POST /api/webhooks/whatsapp`
- **Payload:** Accepts `senderPhone`, `messageText`, and `mediaUrl`.
- **Response:** Instant bilingual analysis and response letter link delivered via WhatsApp conversation logging.
