from typing import Any, Dict, List, Optional
from pydantic import BaseModel


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
    """Summarizes Indian regulatory notifications into plain Hindi and English

    with structured impact matrices per PRD.md §8 & WORKFLOW.md Flow 7.
    """

    @classmethod
    def summarize_circular(cls, title: str, content: str, source: str) -> CircularSummary:
        title_lower = title.lower()
        content_lower = content.lower()

        # 1. GST & Taxation
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

        # 2. Food Safety & FSSAI
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

        # 3. UP MSME Policy & State Subsidies
        elif "up" in title_lower or "uttar pradesh" in title_lower or "subsidy" in title_lower:
            return CircularSummary(
                title_en=title,
                title_hi="उत्तर प्रदेश एमएसएमई संवर्धन नीति: पूंजीगत सब्सिडी दिशानिर्देश",
                summary_en="Government of Uttar Pradesh provides up to 25% capital investment subsidy (max ₹4 Crore) and 100% stamp duty exemption for new manufacturing units in Purvanchal and Bundelkhand.",
                summary_hi="उत्तर प्रदेश सरकार पूर्वांचल और बुंदेलखंड में नई विनिर्माण इकाइयों के लिए 25% तक पूंजीगत सब्सिडी (अधिकतम ₹4 करोड़) और 100% स्टांप शुल्क छूट प्रदान कर रही है।",
                key_deadline="2026-12-31",
                impacted_entities=["Micro & Small Manufacturing Units in UP", "Udyam Registered Units"],
                action_required="Submit subsidy claim application on Nivesh Mitra portal within 6 months of commercial production.",
                action_required_hi="उत्पादन शुरू होने के 6 महीने के भीतर निवेश मित्र पोर्टल पर सब्सिडी दावा आवेदन जमा करें।",
                risk_level="low",
            )

        # Generic Fallback
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
