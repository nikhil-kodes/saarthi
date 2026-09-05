import json
import re
import httpx
from typing import Any, Dict, Optional
from pydantic import BaseModel
from app.config import settings

class ParsedNoticeResult(BaseModel):
    authority: str
    notice_number: Optional[str] = None
    issue_date: Optional[str] = None
    response_deadline: str
    demand_amount: float
    penalty_amount: float
    severity: str
    status: str
    plain_summary_en: str
    plain_summary_hi: str
    reply_draft_en: str
    parsed_fields: Dict[str, Any]

class NoticeParser:
    @classmethod
    async def parse_notice_text_ai(cls, text: str, legal_name: str = "Enterprise") -> ParsedNoticeResult:
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

        return cls.parse_notice_text(text=text, legal_name=legal_name)

    @classmethod
    def parse_notice_text(cls, text: str, legal_name: str = "Enterprise") -> ParsedNoticeResult:
        text_lower = text.lower()
        
        # Regex extractors
        demand_match = re.search(r'demand.*?rs\.?\s*([\d,]+)', text_lower)
        demand_amount = float(demand_match.group(1).replace(',', '')) if demand_match else 0.0
        
        penalty_match = re.search(r'penalty.*?rs\.?\s*([\d,]+)|fine.*?₹?([\d,]+)', text_lower)
        penalty_amount = 0.0
        if penalty_match:
            val = penalty_match.group(1) or penalty_match.group(2)
            if val:
                penalty_amount = float(val.replace(',', ''))

        date_match = re.search(r'date:\s*(\d{2}-\d{2}-\d{4})', text_lower)
        issue_date = date_match.group(1) if date_match else "2026-01-01"

        deadline_match = re.search(r'deadline:\s*(\d{2}-\d{2}-\d{4})', text_lower)
        deadline = deadline_match.group(1) if deadline_match else "2026-03-01"

        ref_match = re.search(r'(?:reference no|notice no|din|notice ref):\s*([\w/\-]+)', text_lower)
        notice_no = ref_match.group(1).upper() if ref_match else "UNKNOWN-REF"
        
        authority_match = re.search(r'(?:office of the|government of)(.*)', text_lower)
        authority = authority_match.group(0).strip().title() if authority_match else "Statutory Authority"

        severity = "urgent"
        if demand_amount > 100000 or penalty_amount > 20000 or "gst" in text_lower or "drc" in text_lower:
            severity = "critical"
        elif demand_amount == 0 and penalty_amount == 0:
            severity = "moderate"

        summary_en = (
            f"**1. What This Notice Means:** You have received a statutory notice from {authority}.\n\n"
            f"**2. Financial Liability & Risk:** The total tax demand is **₹{demand_amount:,.2f}** and penalty is **₹{penalty_amount:,.2f}**.\n\n"
            f"**3. Required Next Steps:** Submit a formal reply or pay the dues before {deadline}."
        )

        summary_hi = (
            f"**1. इस नोटिस का सरल अर्थ:** आपको {authority} से एक वैधानिक नोटिस मिला है।\n\n"
            f"**2. वित्तीय देनदारी एवं जोखिम:** कुल कर मांग **₹{demand_amount:,.2f}** और जुर्माना **₹{penalty_amount:,.2f}** है।\n\n"
            f"**3. आवश्यक कार्यवाही:** {deadline} से पहले अपना स्पष्टीकरण प्रस्तुत करें या बकाया राशि का भुगतान करें।"
        )

        reply_draft = (
            f"To,\n"
            f"The Proper Officer / Authorized Signatory,\n"
            f"{authority}\n\n"
            f"Date: 20-02-2026\n"
            f"Subject: Reply to Notice (Ref: {notice_no})\n\n"
            f"Respected Sir/Madam,\n\n"
            f"With reference to the intimation {notice_no} issued on {issue_date}, we, {legal_name}, respectfully submit as under:\n\n"
            f"1. That all required statutory compliances have been adhered to by our organization.\n"
            f"2. That any discrepancy noted may kindly be reconciled with the enclosed documents and statements.\n\n"
            f"In view of the above submissions, we pray that the proposed demand of tax, interest, and penalty be kindly dropped.\n\n"
            f"Yours faithfully,\n"
            f"For {legal_name}\n"
            f"Authorized Signatory"
        )

        return ParsedNoticeResult(
            authority=authority,
            notice_number=notice_no,
            issue_date=issue_date,
            response_deadline=deadline,
            demand_amount=demand_amount,
            penalty_amount=penalty_amount,
            severity=severity,
            status="action_required",
            plain_summary_en=summary_en,
            plain_summary_hi=summary_hi,
            reply_draft_en=reply_draft,
            parsed_fields={
                "notice_type": "STATUTORY_NOTICE",
            },
        )
