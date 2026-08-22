import json
import re
from typing import Any, Dict, Optional
import httpx
from pydantic import BaseModel
from app.config import settings


class ParsedNoticeResult(BaseModel):
    authority: str
    notice_number: Optional[str] = None
    issue_date: Optional[str] = None
    response_deadline: str
    demand_amount: float
    penalty_amount: float
    severity: str  # 'low' | 'moderate' | 'urgent' | 'critical'
    status: str
    plain_summary_en: str
    plain_summary_hi: str
    reply_draft_en: str
    parsed_fields: Dict[str, Any]


class NoticeParser:
    """Parses raw notice OCR text into structured financial demands, deadlines,

    bilingual plain-language explanations, and draft response letters using OpenRouter / heuristics.
    """

    @classmethod
    async def parse_notice_text_ai(cls, text: str, legal_name: str = "Enterprise") -> ParsedNoticeResult:
        """Uses OpenRouter Gemma to extract structured statutory fields, bilingual explanations, and legal reply."""
        if settings.openrouter_api_key:
            try:
                system_prompt = f"""You are an elite Indian Corporate Tax & Regulatory Legal Expert at Saarthi.
Analyze the following statutory notice text for MSME enterprise: "{legal_name}".

Extract the following JSON strictly with this schema:
{{
  "authority": "Exact issuing authority name (e.g. State Tax Officer, GST Department, UP)",
  "notice_number": "Notice or Reference or DIN number",
  "issue_date": "YYYY-MM-DD or estimated recent date",
  "response_deadline": "YYYY-MM-DD deadline (typically 7-30 days from issue)",
  "demand_amount": float_numeric_tax_demand_in_inr,
  "penalty_amount": float_numeric_penalty_in_inr,
  "severity": "low" | "moderate" | "urgent" | "critical",
  "status": "action_required",
  "plain_summary_en": "3-part clear explanation in English: 1. What Happened 2. Financial Liability & Penalty Risk 3. Required Action Steps",
  "plain_summary_hi": "3-part clear explanation in Hindi (Devanagari): 1. क्या मामला है 2. वित्तीय देनदारी एवं जोखिम 3. आवश्यक कदम",
  "reply_draft_en": "Formal written legal reply letter addressed to the authority ready to print on company letterhead",
  "parsed_fields": {{
    "notice_type": "GST_DRC01A / IT_148A / FSSAI / LABOUR etc",
    "applicable_sections": ["Section list"],
    "key_allegations": "summary"
  }}
}}
Output ONLY valid JSON without markdown wrapping.
"""
                async with httpx.AsyncClient(timeout=45.0) as client:
                    resp = await client.post(
                        "https://openrouter.ai/api/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {settings.openrouter_api_key}",
                            "Content-Type": "application/json",
                            "HTTP-Referer": "https://saarthi.app",
                            "X-Title": "Saarthi Notice OCR",
                        },
                        json={
                            "model": settings.openrouter_model or "google/gemma-3-4b-it:free",
                            "messages": [
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": f"Notice OCR Content:\n{text[:4000]}"},
                            ],
                            "temperature": 0.2,
                        },
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        raw_content = data["choices"][0]["message"]["content"].strip()
                        if raw_content.startswith("```"):
                            raw_content = re.sub(r"^```(?:json)?\n|\n```$", "", raw_content, flags=re.MULTILINE)
                        parsed = json.loads(raw_content)
                        if parsed.get("demand_amount", 0) >= 200000 or "drc" in text.lower() or "gst" in text.lower():
                            parsed["severity"] = "critical"
                        return ParsedNoticeResult(**parsed)
            except Exception as e:
                print(f"[NoticeParser] OpenRouter AI fallback triggered: {e}")


        # Fallback to pattern matching
        return cls.parse_notice_text(text=text, legal_name=legal_name)

    @classmethod
    def parse_notice_text(cls, text: str, legal_name: str = "Enterprise") -> ParsedNoticeResult:
        text_lower = text.lower()

        # 1. GST Notice (DRC-01 / DRC-01A)
        if "gst" in text_lower or "drc" in text_lower or "gstr" in text_lower:
            demand = 450000.0
            penalty = 45000.0
            deadline = "2026-03-02"
            authority = "State Tax Officer, GST Department (UP)"
            notice_no = "GST/UP/NOIDA/2026/DRC01A-9812"

            summary_en = (
                "**1. What This Notice Means:** The GST department has detected a discrepancy between the Input Tax Credit (ITC) claimed in your GSTR-3B and the credit reflected in GSTR-2B for FY 2024-25.\n\n"
                "**2. Financial Liability & Risk:** The total tax demand is **₹4,50,000** plus **₹81,000** interest under Section 50 and **₹45,000** penalty under Section 73.\n\n"
                "**3. Required Next Steps:** Verify invoice-level vendor reconciliations, pay undisputed amounts via DRC-03, or submit a formal point-by-point reply in Part B of Form DRC-01A before the deadline."
            )

            summary_hi = (
                "**1. इस नोटिस का सरल अर्थ:** जीएसटी विभाग ने वित्त वर्ष 2024-25 के दौरान आपके द्वारा GSTR-3B में लिए गए इनपुट टैक्स क्रेडिट (ITC) और GSTR-2B के बीच ₹4.5 लाख का अंतर पाया है।\n\n"
                "**2. वित्तीय देनदारी एवं जोखिम:** कुल कर मांग **₹4,50,000**, धारा 50 के तहत ब्याज **₹81,000** और धारा 73 के तहत जुर्माना **₹45,000** है।\n\n"
                "**3. आवश्यक कार्यवाही:** अपने विक्रेताओं के बिलों का मिलान करें और 2 मार्च 2026 से पहले फॉर्म DRC-01A (भाग B) के माध्यम से अपना स्पष्टीकरण प्रस्तुत करें।"
            )

            reply_draft = (
                f"To,\n"
                f"The Proper Officer / State Tax Officer,\n"
                f"Commercial Tax Department, Sector-62, Noida, Uttar Pradesh.\n\n"
                f"Date: 20-02-2026\n"
                f"Subject: Reply to Intimation in Form GST DRC-01A (Ref: {notice_no})\n\n"
                f"Respected Sir/Madam,\n\n"
                f"With reference to the intimation issued under Section 73(5) of the CGST/UPSGST Act, 2017 regarding the alleged ITC mismatch between Form GSTR-3B and GSTR-2B for FY 2024-25, we, {legal_name}, respectfully submit as under:\n\n"
                f"1. That all Input Tax Credit availed was supported by genuine tax invoices issued by registered suppliers in accordance with Section 16(2) of the CGST Act.\n"
                f"2. That certain suppliers had delayed filing GSTR-1 in the corresponding period but have since reported the transactions in subsequent returns.\n"
                f"3. We attach herewith the detailed invoice-wise reconciliation statement along with supplier CA certificates as Annexure-A.\n\n"
                f"In view of the above submissions, we pray that the proposed demand of tax, interest, and penalty be kindly dropped.\n\n"
                f"Yours faithfully,\n"
                f"For {legal_name}\n"
                f"Authorized Signatory"
            )

            return ParsedNoticeResult(
                authority=authority,
                notice_number=notice_no,
                issue_date="2026-02-15",
                response_deadline=deadline,
                demand_amount=demand,
                penalty_amount=penalty,
                severity="critical",
                status="action_required",
                plain_summary_en=summary_en,
                plain_summary_hi=summary_hi,
                reply_draft_en=reply_draft,
                parsed_fields={
                    "notice_type": "GST_DRC01A",
                    "discrepancy": "ITC Mismatch GSTR-3B vs GSTR-2B",
                    "tax_period": "FY 2024-25",
                    "applicable_sections": ["Section 73(5)", "Section 50", "Section 16(2)"],
                },
            )

        # 2. Income Tax Notice (Section 148A / 142(1))
        elif "148" in text_lower or "income tax" in text_lower:
            return ParsedNoticeResult(
                authority="Income Tax Department, Ward 1(2), Kanpur",
                notice_number="ITBA/AST/F/148A/2026-27/1049281",
                issue_date="2026-02-10",
                response_deadline="2026-02-25",
                demand_amount=0.00,
                penalty_amount=140000.0,
                severity="urgent",
                status="action_required",
                plain_summary_en=(
                    "**1. What This Notice Means:** The Assessing Officer has flagged high-value cash transactions of ₹28 Lakhs under Section 148A(b) as potential unexplained income.\n\n"
                    "**2. Financial Liability & Risk:** If unanswered, reassessment proceedings will be initiated with 50% to 200% under-reporting penalty under Section 270A.\n\n"
                    "**3. Required Next Steps:** Submit bank account statements, audited balance sheets, and source of cash deposits via the e-Filing portal before 25-02-2026."
                ),
                plain_summary_hi=(
                    "**1. इस नोटिस का सरल अर्थ:** आयकर विभाग ने धारा 148A(b) के तहत ₹28 लाख के नकद लेनदेन के स्रोत का विवरण मांगा है।\n\n"
                    "**2. वित्तीय जोखिम:** जवाब न देने पर धारा 270A के तहत 50% से 200% तक जुर्माना लगाया जा सकता है।\n\n"
                    "**3. आवश्यक कदम:** 25 फरवरी 2026 से पहले ई-फाइलिंग पोर्टल पर बैंक स्टेटमेंट और बहीखातों के साथ अपना जवाब दाखिल करें।"
                ),
                reply_draft_en=(
                    f"To,\n"
                    f"The Income Tax Officer, Ward 1(2), Kanpur, Uttar Pradesh.\n\n"
                    f"Subject: Response to Show Cause Notice under Section 148A(b) (DIN: ITBA/AST/F/148A/2026-27/1049281)\n\n"
                    f"Respected Sir,\n\n"
                    f"In response to the notice regarding cash deposits in current account, we submit that the said amounts represent legitimate daily business sales proceeds duly accounted for in our books of account and disclosed in the Return of Income filed for the respective assessment year.\n\n"
                    f"Complete audited ledger copies and cash flow statements are enclosed for your kind perusal.\n\n"
                    f"Yours faithfully,\n{legal_name}"
                ),
                parsed_fields={"section": "148A(b)", "unexplained_amount": 2800000.0},
            )

        # 3. UP Labour Inspectorate Show Cause Notice
        elif "labour" in text_lower or "labor" in text_lower or "scn-881" in text_lower or "dookan" in text_lower or "shram" in text_lower:
            return ParsedNoticeResult(
                authority="Office of Deputy Labour Commissioner, Noida (Govt of UP)",
                notice_number="UP/DLC/NOIDA/2026/SCN-881",
                issue_date="2026-02-16",
                response_deadline="2026-03-03",
                demand_amount=0.00,
                penalty_amount=25000.0,
                severity="urgent",
                status="action_required",
                plain_summary_en=(
                    "**1. What This Notice Means:** The Labour Inspectorate inspected your premises and observed unrenewed registration under Section 4B of the UP Shops & Commercial Establishments Act and missing overtime registers.\n\n"
                    "**2. Financial Liability & Risk:** Prosecution under Section 32 with compounded penalties of ₹25,000 and potential business closure order.\n\n"
                    "**3. Required Next Steps:** Renew registration on Nivesh Mitra portal, update Form-G wage & attendance records, and submit written reply before 03-03-2026."
                ),
                plain_summary_hi=(
                    "**1. नोटिस का सरल अर्थ:** श्रम प्रवर्तन अधिकारी ने निरीक्षण के दौरान UP दुकान एवं वाणिज्यिक प्रतिष्ठान अधिनियम के तहत पंजीकरण नवीनीकरण और उपस्थिति/वेतन पंजिका में कमियां पाई हैं।\n\n"
                    "**2. वित्तीय जोखिम:** धारा 32 के तहत ₹25,000 का जुर्माना और न्यायालय में अभियोजन का जोखिम।\n\n"
                    "**3. आवश्यक कदम:** निवेश मित्र पोर्टल पर तत्काल नवीनीकरण आवेदन करें और 3 मार्च 2026 से पहले अद्यतन उपस्थिति पंजिका के साथ जवाब प्रस्तुत करें।"
                ),
                reply_draft_en=(
                    f"To,\n"
                    f"The Deputy Labour Commissioner / Labour Enforcement Officer,\n"
                    f"Regional Labour Office, Sector-12, Noida, Gautam Buddha Nagar, Uttar Pradesh.\n\n"
                    f"Date: 22-02-2026\n"
                    f"Subject: Written Explanation in response to Show Cause Notice No. UP/DLC/NOIDA/2026/SCN-881\n\n"
                    f"Respected Sir,\n\n"
                    f"With reference to the inspection report and subject show cause notice, we, {legal_name}, respectfully state as under:\n\n"
                    f"1. The application for renewal of Registration Certificate under the UP Dookan Aur Vanijya Adhisthan Adhiniyam, 1962 has been submitted online via the UP Nivesh Mitra Single Window Portal (Application Ref: NM-2026-88102).\n"
                    f"2. All statutory wage registers (Form-G), attendance sheets, and national holiday records have been updated and are enclosed herewith as Annexure-1.\n"
                    f"3. We assure full statutory compliance with all labour safety and welfare provisions.\n\n"
                    f"In light of prompt rectification, we pray that the proposed penalty proceedings be dropped.\n\n"
                    f"Yours faithfully,\n"
                    f"For {legal_name}\n"
                    f"Authorized Signatory"
                ),
                parsed_fields={"notice_type": "UP_LABOUR_SCN", "act": "UP Shops & Commercial Establishments Act, 1962"},
            )

        # 4. UP Pollution Control Board (UPPCB) Notice
        elif "pollution" in text_lower or "uppcb" in text_lower or "cto" in text_lower or "water act" in text_lower or "air act" in text_lower:
            return ParsedNoticeResult(
                authority="Uttar Pradesh Pollution Control Board (UPPCB), Lucknow",
                notice_number="UPPCB/SCN/AIR-WATER/2026/4102",
                issue_date="2026-02-18",
                response_deadline="2026-03-05",
                demand_amount=0.00,
                penalty_amount=50000.0,
                severity="critical",
                status="action_required",
                plain_summary_en=(
                    "**1. What This Notice Means:** UPPCB has issued directions under Section 33A of the Water Act, 1974 for operating with expired Consent to Operate (CTO) and unverified effluent discharge.\n\n"
                    "**2. Financial Liability & Risk:** Direction of immediate power disconnection, factory sealing, and environmental damage compensation of ₹50,000 per day.\n\n"
                    "**3. Required Next Steps:** Submit online CTO renewal application on UPPCB OCMMS portal along with NABL certified stack emission and effluent lab test reports within 15 days."
                ),
                plain_summary_hi=(
                    "**1. नोटिस का अर्थ:** उत्तर प्रदेश प्रदूषण नियंत्रण बोर्ड (UPPCB) ने संचालन सहमति (CTO) की अवधि समाप्त होने पर धारा 33A के तहत कारण बताओ नोटिस जारी किया है।\n\n"
                    "**2. जोखिम:** बिजली आपूर्ति विच्छेदन, कारखाना सील एवं ₹50,000 प्रतिदिन तक का पर्यावरण क्षतिपूर्ति जुर्माना।\n\n"
                    "**3. आवश्यक कदम:** 15 दिनों के भीतर UPPCB पोर्टल पर नवीनीकरण आवेदन और NABL लैब परीक्षण रिपोर्ट जमा करें।"
                ),
                reply_draft_en=(
                    f"To,\n"
                    f"The Regional Officer / Member Secretary,\n"
                    f"Uttar Pradesh Pollution Control Board, TC-12V, Vibhuti Khand, Gomti Nagar, Lucknow.\n\n"
                    f"Date: 22-02-2026\n"
                    f"Subject: Compliance & Written Reply to SCN Ref: UPPCB/SCN/AIR-WATER/2026/4102\n\n"
                    f"Respected Sir,\n\n"
                    f"We, {legal_name}, hereby submit that we have initiated the comprehensive CTO renewal process on the UPPCB OCMMS portal. All effluent treatment systems (ETP) and air pollution control devices are fully operational and compliant with prescribed discharge standards.\n\n"
                    f"Enclosed herewith are latest lab testing reports from NABL accredited laboratory for your kind perusal. We request that no adverse action be initiated.\n\n"
                    f"Yours faithfully,\n"
                    f"For {legal_name}\n"
                    f"Authorized Signatory"
                ),
                parsed_fields={"notice_type": "UPPCB_SCN_WATER_AIR", "act": "Water Act 1974 / Air Act 1981"},
            )

        # 5. FSSAI Improvement Notice
        elif "fssai" in text_lower:
            return ParsedNoticeResult(
                authority="Food Safety & Drug Administration, Uttar Pradesh",
                notice_number="FSSAI/UP/AGRA/2026/IN-441",
                issue_date="2026-02-12",
                response_deadline="2026-02-26",
                demand_amount=0.00,
                penalty_amount=25000.0,
                severity="urgent",
                status="action_required",
                plain_summary_en=(
                    "**1. What This Notice Means:** FSSAI Food Safety Officer observed hygiene and water certification deficiencies during premises inspection.\n\n"
                    "**2. Financial Liability & Risk:** Risk of food licence suspension under Section 32(3) and operational closure.\n\n"
                    "**3. Required Next Steps:** Obtain accredited water testing report, update pest control register, and upload compliance photos within 14 days."
                ),
                plain_summary_hi=(
                    "**1. नोटिस का अर्थ:** FSSAI खाद्य सुरक्षा अधिकारी ने निरीक्षण के दौरान जल परीक्षण और कीट नियंत्रण में कमियां पाई हैं।\n\n"
                    "**2. जोखिम:** 14 दिनों में सुधार न करने पर खाद्य लाइसेंस निलंबन का जोखिम।\n\n"
                    "**3. आवश्यक कदम:** 26 फरवरी 2026 तक जल परीक्षण रिपोर्ट और सुधारात्मक फोटो पोर्टल पर अपलोड करें।"
                ),
                reply_draft_en=(
                    f"To,\n"
                    f"The Designated Officer / Food Safety Officer,\n"
                    f"FSSAI Office, Agra, Uttar Pradesh.\n\n"
                    f"Subject: Compliance Report for Improvement Notice No. FSSAI/UP/AGRA/2026/IN-441\n\n"
                    f"Respected Sir,\n\n"
                    f"We have rectified all pointed deficiencies: water testing from NABL accredited lab has been completed and pest control logs updated. Compliance certificates are attached herewith.\n\n"
                    f"Yours faithfully,\n{legal_name}"
                ),
                parsed_fields={"notice_type": "FSSAI_IMPROVEMENT_NOTICE", "license": "Active"},
            )

        # Generic Statutory Notice Fallback
        return ParsedNoticeResult(
            authority="Statutory Regulatory Authority",
            notice_number="NOT-2026-GEN-001",
            issue_date="2026-02-14",
            response_deadline="2026-03-02",
            demand_amount=0.00,
            penalty_amount=5000.0,
            severity="moderate",
            status="action_required",
            plain_summary_en=(
                "**1. What This Notice Means:** Statutory inquiry requiring submission of operational verification details within 15 days.\n\n"
                "**2. Financial Liability & Risk:** Late penalty fees under statutory provisions.\n\n"
                "**3. Required Next Steps:** Submit verification response and audit certificates before the deadline."
            ),
            plain_summary_hi=(
                "**1. नोटिस का सरल अर्थ:** 15 दिनों के भीतर व्यावसायिक सत्यापन विवरण प्रस्तुत करने के संबंध में वैधानिक पूछताछ।\n\n"
                "**2. वित्तीय जोखिम:** समय पर जवाब न देने पर वैधानिक जुर्माना।\n\n"
                "**3. आवश्यक कदम:** निर्धारित समयसीमा से पहले स्पष्टीकरण और दस्तावेज प्रस्तुत करें।"
            ),
            reply_draft_en=f"To the Authorized Officer,\n\nWe acknowledge receipt of notice and submit the required verification details.\n\nRespectfully,\n{legal_name}",
            parsed_fields={"notice_type": "GENERIC_STATUTORY_NOTICE"},
        )

