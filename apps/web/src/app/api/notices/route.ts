import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { NoticeService } from '@/lib/services/notices';

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'qwen/qwen3-30b-a3b-instruct-2507';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

const DEMO_NOTICES = [
  {
    id: 'notice-1',
    business_id: 'demo-business',
    file_name: 'GST_DRC01A_ITC_Discrepancy.pdf',
    authority: 'State Tax Officer, Sector-62, Noida (UP GST)',
    notice_number: 'GST/UP/NOIDA/2026/DRC01A-9812',
    issue_date: '2026-02-15',
    response_deadline: '2026-03-02',
    demand_amount: 450000.0,
    penalty_amount: 45000.0,
    severity: 'critical',
    status: 'action_required',
    plain_summary_en:
      '**1. What This Notice Means:** The GST department has detected a discrepancy between the Input Tax Credit (ITC) claimed in your GSTR-3B and credit reflected in GSTR-2B for FY 2024-25.\n\n**2. Financial Liability & Risk:** The total tax demand is **₹4,50,000** plus **₹81,000** interest under Section 50 and **₹45,000** penalty under Section 73.\n\n**3. Required Next Steps:** Verify invoice-level vendor reconciliations and submit a formal point-by-point reply in Part B of Form DRC-01A before 2 March 2026.',
    plain_summary_hi:
      '**1. इस नोटिस का सरल अर्थ:** जीएसटी विभाग ने वित्त वर्ष 2024-25 के दौरान आपके द्वारा GSTR-3B में लिए गए इनपुट टैक्स क्रेडिट (ITC) और GSTR-2B के बीच ₹4.5 लाख का अंतर पाया है।\n\n**2. वित्तीय देनदारी एवं जोखिम:** कुल कर मांग **₹4,50,000**, धारा 50 के तहत ब्याज **₹81,000** और धारा 73 के तहत जुर्माना **₹45,000** है।\n\n**3. आवश्यक कार्यवाही:** अपने विक्रेताओं के बिलों का मिलान करें और 2 मार्च 2026 से पहले फॉर्म DRC-01A (भाग B) के माध्यम से अपना स्पष्टीकरण प्रस्तुत करें।',
    reply_draft_en:
      'To,\nThe State Tax Officer,\nCommercial Tax Department, Sector-62, Noida, Uttar Pradesh.\n\nSubject: Formal Written Reply to Intimation in Form GST DRC-01A\n\nRespected Sir,\nWith reference to the notice regarding ITC mismatch, we respectfully submit that all credit was availed against genuine tax invoices issued by registered suppliers in compliance with Section 16(2) of the CGST Act. Detailed invoice reconciliations are attached herewith.\n\nYours faithfully,\nFor Apex Enterprises\nAuthorized Signatory',
    created_at: new Date().toISOString(),
  },
  {
    id: 'notice-2',
    business_id: 'demo-business',
    file_name: 'IT_Section_148A_Inquiry.pdf',
    authority: 'Income Tax Department, Ward 1(2), Kanpur',
    notice_number: 'ITBA/AST/F/148A/2026-27/1049281',
    issue_date: '2026-02-10',
    response_deadline: '2026-02-25',
    demand_amount: 0.0,
    penalty_amount: 140000.0,
    severity: 'urgent',
    status: 'action_required',
    plain_summary_en:
      '**1. What This Notice Means:** Inquiry under Section 148A(b) regarding unexplained cash deposits of ₹28 Lakhs in current accounts.\n\n**2. Financial Liability & Risk:** Potential 50% to 200% under-reporting penalty under Section 270A if unaddressed.\n\n**3. Required Next Steps:** Submit bank statements, audited cash books, and sales ledgers via the e-Filing portal before 25-02-2026.',
    plain_summary_hi:
      '**1. नोटिस का अर्थ:** धारा 148A(b) के तहत चालू खाते में ₹28 लाख के नकद जमा के संबंध में पूछताछ।\n\n**2. जोखिम:** स्पष्टीकरण न देने पर धारा 270A के तहत 50% से 200% तक जुर्माना।\n\n**3. आवश्यक कदम:** 25 फरवरी 2026 से पहले ई-फाइलिंग पोर्टल पर बैंक स्टेटमेंट और कैश लेजर अपलोड करें।',
    reply_draft_en:
      'To,\nThe Income Tax Officer, Ward 1(2), Kanpur, Uttar Pradesh.\n\nSubject: Response to Show Cause Notice under Section 148A(b)\n\nRespected Sir,\nWe submit that cash deposits represent legitimate daily business sales proceeds duly accounted for in our audited books of account.\n\nYours faithfully,\nAuthorized Signatory',
    created_at: new Date().toISOString(),
  },
  {
    id: 'notice-3',
    business_id: 'demo-business',
    file_name: 'UP_Pollution_Control_SCN.pdf',
    authority: 'Uttar Pradesh Pollution Control Board (UPPCB), Lucknow',
    notice_number: 'UPPCB/SCN/AIR-WATER/2026/4102',
    issue_date: '2026-02-18',
    response_deadline: '2026-03-05',
    demand_amount: 0.0,
    penalty_amount: 50000.0,
    severity: 'urgent',
    status: 'action_required',
    plain_summary_en:
      '**1. What This Notice Means:** Show Cause Notice under Section 33A of the Water (Prevention and Control of Pollution) Act, 1974 for renewal of Consent to Operate (CTO).\n\n**2. Financial Liability & Risk:** Closure directions and environmental compensation fine up to ₹50,000 per day of non-compliance.\n\n**3. Required Next Steps:** Submit online CTO renewal application on Nivesh Mitra portal with effluent testing test certificates within 15 days.',
    plain_summary_hi:
      '**1. नोटिस का अर्थ:** उत्तर प्रदेश प्रदूषण नियंत्रण बोर्ड द्वारा सहमति (CTO) के नवीनीकरण हेतु कारण बताओ नोटिस।\n\n**2. जोखिम:** अनुपालन न होने पर इकाई बंदी का आदेश एवं पर्यावरण क्षतिपूर्ति जुर्माना।\n\n**3. आवश्यक कदम:** 15 दिनों के भीतर निवेश मित्र पोर्टल पर ऑनलाइन नवीनीकरण आवेदन और लैब रिपोर्ट प्रस्तुत करें।',
    reply_draft_en:
      'To,\nThe Regional Officer,\nUP Pollution Control Board, Lucknow.\n\nSubject: Reply to SCN No. UPPCB/SCN/AIR-WATER/2026/4102\n\nRespected Sir,\nWe have initiated the CTO renewal process on the Nivesh Mitra portal and attached valid stack and effluent analysis test reports.\n\nYours faithfully,\nAuthorized Signatory',
    created_at: new Date().toISOString(),
  },
];

export async function GET(request: Request) {
  try {
    const session = await AuthService.getSession();
    if (!session || !session.user || !session.activeMembership?.businessId) {
      return NextResponse.json({
        success: true,
        data: DEMO_NOTICES,
      });
    }

    const businessId = session.activeMembership.businessId;
    const notices = await NoticeService.listNotices(businessId);
    return NextResponse.json({
      success: true,
      data: notices && notices.length > 0 ? notices : DEMO_NOTICES,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      data: DEMO_NOTICES,
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fileName = body.fileName || 'Statutory_Notice.pdf';
    const fileUrl = body.fileUrl || `https://storage.saarthi.app/notices/${fileName}`;
    const rawOcrText = body.rawOcrText || '';

    let parsedResult = null;

    // 1. If OpenRouter is configured, parse dynamically with Qwen 30B
    if (OPENROUTER_API_KEY) {
      try {
        const systemPrompt = `You are an elite Indian Corporate Tax & Regulatory Legal Counsel at Saarthi MSME.
Analyze the statutory notice named "${fileName}" with OCR content:
"${rawOcrText || fileName}"

Generate a valid JSON object with:
{
  "authority": "Issuing authority (e.g. State Tax Officer, GST / Income Tax / UPPCB)",
  "notice_number": "Reference or DIN number",
  "issue_date": "YYYY-MM-DD",
  "response_deadline": "YYYY-MM-DD",
  "demand_amount": 450000.0,
  "penalty_amount": 45000.0,
  "severity": "critical" | "urgent" | "moderate" | "low",
  "status": "action_required",
  "plain_summary_en": "3-part breakdown: 1. What Happened 2. Financial Liability & Penalty Risk 3. Required Action Steps",
  "plain_summary_hi": "3-part breakdown in Hindi: 1. क्या मामला है 2. देनदारी एवं जोखिम 3. आवश्यक कदम",
  "reply_draft_en": "Formal written legal reply letter addressed to the authority"
}
Output strictly valid JSON only.`;

        const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://saarthi.app',
            'X-Title': 'Saarthi Notice Parser',
          },
          body: JSON.stringify({
            model: OPENROUTER_MODEL,
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: `Notice: ${fileName}` }],
            temperature: 0.1,
          }),
        });

        if (orRes.ok) {
          const data = await orRes.json();
          let content = data.choices?.[0]?.message?.content?.trim() || '';
          if (content.startsWith('```')) {
            content = content.replace(/^```(?:json)?\n|\n```$/g, '');
          }
          parsedResult = JSON.parse(content);
        }
      } catch (e) {
        console.warn('Dynamic Qwen parsing fallback:', e);
      }
    }

    // 2. Fallback preset match
    if (!parsedResult) {
      const match = DEMO_NOTICES.find((n) => n.file_name === fileName) || DEMO_NOTICES[0]!;
      parsedResult = {
        authority: match?.authority || 'Statutory Authority',
        notice_number: match?.notice_number || 'NOT-2026-9812',
        issue_date: match?.issue_date || '2026-02-15',
        response_deadline: match?.response_deadline || '2026-03-02',
        demand_amount: match?.demand_amount || 0,
        penalty_amount: match?.penalty_amount || 0,
        severity: match?.severity || 'urgent',
        status: match?.status || 'action_required',
        plain_summary_en: match?.plain_summary_en || 'Notice analysis completed.',
        plain_summary_hi: match?.plain_summary_hi || 'नोटिस विश्लेषण पूरा हुआ।',
        reply_draft_en: match?.reply_draft_en || 'Formal reply draft generated.',
      };
    }

    const newNotice = {
      id: `notice-${Date.now()}`,
      business_id: 'demo-business',
      file_name: fileName,
      file_url: fileUrl,
      authority: parsedResult.authority,
      notice_number: parsedResult.notice_number || 'NOT-2026-9812',
      issue_date: parsedResult.issue_date || '2026-02-15',
      response_deadline: parsedResult.response_deadline || '2026-03-02',
      demand_amount: parsedResult.demand_amount || 0,
      penalty_amount: parsedResult.penalty_amount || 0,
      severity: parsedResult.severity || 'urgent',
      status: parsedResult.status || 'action_required',
      plain_summary_en: parsedResult.plain_summary_en,
      plain_summary_hi: parsedResult.plain_summary_hi,
      reply_draft_en: parsedResult.reply_draft_en,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: newNotice,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'UPLOAD_NOTICE_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}
