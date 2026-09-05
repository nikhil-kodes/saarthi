import json
import re
import httpx
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from app.config import settings

class CircularSummary(BaseModel):
    title_en: str
    title_hi: str
    summary_en: str
    summary_hi: str
    key_deadline: Optional[str] = None
    impacted_entities: List[str]
    action_required: str
    action_required_hi: str
    risk_level: str  # 'low' | 'medium' | 'high' | 'critical'


class CircularSummarizer:
    """Summarizes Indian regulatory notifications into plain Hindi and English."""

    @classmethod
    async def summarize_circular_ai(cls, title: str, content: str, source: str) -> CircularSummary:
        if settings.openrouter_api_key:
            try:
                system_prompt = f"""You are an Indian Regulatory Compliance Expert at Saarthi.
Summarize the following circular/notification:
Title: {title}
Source: {source}
Content: {content[:4000]}

Extract the following JSON strictly with this schema:
{{
  "title_en": "Clear English title",
  "title_hi": "Clear Hindi (Devanagari) title",
  "summary_en": "2-3 sentences explaining the core impact",
  "summary_hi": "2-3 sentences explaining the core impact in Hindi",
  "key_deadline": "YYYY-MM-DD or null",
  "impacted_entities": ["List of impacted business types"],
  "action_required": "What MSMEs must do in English",
  "action_required_hi": "What MSMEs must do in Hindi",
  "risk_level": "low" | "medium" | "high" | "critical"
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
                            "X-Title": "Saarthi Summarizer",
                        },
                        json={
                            "model": settings.openrouter_model or "google/gemma-3-4b-it:free",
                            "messages": [{"role": "system", "content": system_prompt}],
                            "temperature": 0.2,
                        },
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        raw_content = data["choices"][0]["message"]["content"].strip()
                        if raw_content.startswith("```"):
                            raw_content = re.sub(r"^```(?:json)?\n|\n```$", "", raw_content, flags=re.MULTILINE)
                        parsed = json.loads(raw_content)
                        return CircularSummary(**parsed)
            except Exception as e:
                print(f"[Summarizer] OpenRouter AI fallback triggered: {e}")

        return cls.summarize_circular(title, content, source)

    @classmethod
    def summarize_circular(cls, title: str, content: str, source: str) -> CircularSummary:
        title_lower = title.lower()
        content_lower = content.lower()

        if "gst" in title_lower or "invoice" in title_lower or "itc" in content_lower:
            return CircularSummary(
                title_en=title,
                title_hi="जीएसटी ई-इनवॉइस और इनपुट टैक्स क्रेडिट (ITC) नियम",
                summary_en="CBIC mandates that Input Tax Credit claims must exactly reconcile with GSTR-2B. Entities with turnover exceeding ₹5 Crore must mandatorily generate e-invoices with valid IRN.",
                summary_hi="सीबीआईसी के अनुसार इनपुट टैक्स क्रेडिट (ITC) केवल तभी मिलेगा जब सप्लायर ने GSTR-1 भरा हो और वह GSTR-2B में दिखे। ₹5 करोड़ से अधिक टर्नओवर वाले व्यवसायों के लिए ई-इनवॉइस अनिवार्य है।",
                key_deadline="2026-04-01",
                impacted_entities=["Businesses with turnover > ₹5 Cr", "Registered Regular GST taxpayers"],
                action_required="Ensure billing software is integrated with the GST IRP portal and conduct monthly GSTR-2B reconciliations before filing GSTR-3B.",
                action_required_hi="अपने बिलिंग सॉफ़्टवेयर को GST IRP पोर्टल से जोड़ें और GSTR-3B दाखिल करने से पहले GSTR-2B का मासिक मिलान करें।",
                risk_level="high",
            )
        elif "fssai" in title_lower or "food" in title_lower:
            return CircularSummary(
                title_en=title,
                title_hi="FSSAI पोषण लेबलिंग और अनिवार्य देवनागरी प्रदर्शन नियम",
                summary_en="FSSAI mandates clear declarations of saturated fats, sugar, and sodium per 100g on packaged foods, with prominent Devanagari / Hindi script display.",
                summary_hi="FSSAI ने पैकेटबंद खाद्य पदार्थों पर वसा, चीनी और सोडियम की स्पष्ट घोषणा और देवनागरी लिपि में मुख्य जानकारी प्रदर्शित करना अनिवार्य किया है।",
                key_deadline="2026-06-01",
                impacted_entities=["Food Manufacturers", "Repackers", "Confectionery & Bakery Units"],
                action_required="Update packaging artwork to include front-of-pack nutritional facts and minimum 1.5mm Devanagari font size.",
                action_required_hi="पैकेजिंग डिज़ाइन को अपडेट करें ताकि सामने पोषण विवरण और न्यूनतम 1.5 मिमी देवनागरी फ़ॉन्ट शामिल हो।",
                risk_level="medium",
            )
        else:
            return CircularSummary(
                title_en=title,
                title_hi=f"नियामक अद्यतन: {title}",
                summary_en=f"Official update from {source}. Review operational requirements and compliance calendars.",
                summary_hi=f"{source} से आधिकारिक अद्यतन। परिचालन आवश्यकताओं और अनुपालन समयसीमा की समीक्षा करें।",
                key_deadline=None,
                impacted_entities=["General MSMEs", "Registered Commercial Enterprises"],
                action_required="Review circular details and consult your CA or compliance officer.",
                action_required_hi="परिपत्र विवरण की समीक्षा करें और अपने सीए या अनुपालन अधिकारी से परामर्श करें।",
                risk_level="medium",
            )
