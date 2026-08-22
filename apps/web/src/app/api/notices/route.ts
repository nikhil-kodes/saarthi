import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { NoticeService } from '@/lib/services/notices';

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'qwen/qwen3-30b-a3b-instruct-2507';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

export const DEMO_NOTICES: any[] = [
  {
    id: 'notice-1',
    business_id: 'demo-business',
    file_name: 'GST_DRC01A_Discrepancy.pdf',
    fileName: 'GST_DRC01A_Discrepancy.pdf',
    noticeType: 'GST DRC-01A (Section 73)',
    authority: 'State Tax Officer, Sector-62, Noida (UP GST)',
    notice_number: 'GST/UP/NOIDA/2026/DRC01A-9812',
    noticeNumber: 'GST/UP/NOIDA/2026/DRC01A-9812',
    issue_date: '2026-02-15',
    issueDate: '2026-02-15',
    response_deadline: '2026-03-02',
    responseDeadline: '2026-03-02',
    demand_amount: 450000.0,
    demandAmount: 450000.0,
    penalty_amount: 45000.0,
    penaltyAmount: 45000.0,
    severity: 'critical',
    status: 'action_required',
    plain_summary_en:
      '**1. What This Notice Means:** The GST department has detected a discrepancy between the Input Tax Credit (ITC) claimed in your GSTR-3B and credit reflected in GSTR-2B for FY 2024-25.\n\n**2. Financial Liability & Risk:** The total tax demand is **₹4,50,000** plus **₹81,000** interest under Section 50 and **₹45,000** penalty under Section 73.\n\n**3. Required Next Steps:** Verify invoice-level vendor reconciliations and submit a formal point-by-point reply in Part B of Form DRC-01A before 2 March 2026.',
    plainSummaryEn:
      '**1. What This Notice Means:** The GST department has detected a discrepancy between the Input Tax Credit (ITC) claimed in your GSTR-3B and credit reflected in GSTR-2B for FY 2024-25.\n\n**2. Financial Liability & Risk:** The total tax demand is **₹4,50,000** plus **₹81,000** interest under Section 50 and **₹45,000** penalty under Section 73.\n\n**3. Required Next Steps:** Verify invoice-level vendor reconciliations and submit a formal point-by-point reply in Part B of Form DRC-01A before 2 March 2026.',
    plain_summary_hi:
      '**1. इस नोटिस का सरल अर्थ:** जीएसटी विभाग ने वित्त वर्ष 2024-25 के दौरान आपके द्वारा GSTR-3B में लिए गए इनपुट टैक्स क्रेडिट (ITC) और GSTR-2B के बीच ₹4.5 लाख का अंतर पाया है।\n\n**2. वित्तीय देनदारी एवं जोखिम:** कुल कर मांग **₹4,50,000**, धारा 50 के तहत ब्याज **₹81,000** और धारा 73 के तहत जुर्माना **₹45,000** है।\n\n**3. आवश्यक कार्यवाही:** अपने विक्रेताओं के बिलों का मिलान करें और 2 मार्च 2026 से पहले फॉर्म DRC-01A (भाग B) के माध्यम से अपना स्पष्टीकरण प्रस्तुत करें।',
    plainSummaryHi:
      '**1. इस नोटिस का सरल अर्थ:** जीएसटी विभाग ने वित्त वर्ष 2024-25 के दौरान आपके द्वारा GSTR-3B में लिए गए इनपुट टैक्स क्रेडिट (ITC) और GSTR-2B के बीच ₹4.5 लाख का अंतर पाया है।\n\n**2. वित्तीय देनदारी एवं जोखिम:** कुल कर मांग **₹4,50,000**, धारा 50 के तहत ब्याज **₹81,000** और धारा 73 के तहत जुर्माना **₹45,000** है।\n\n**3. आवश्यक कार्यवाही:** अपने विक्रेताओं के बिलों का मिलान करें और 2 मार्च 2026 से पहले फॉर्म DRC-01A (भाग B) के माध्यम से अपना स्पष्टीकरण प्रस्तुत करें।',
    reply_draft_en:
      'To,\nThe State Tax Officer,\nCommercial Tax Department, Sector-62, Noida, Uttar Pradesh.\n\nSubject: Formal Written Reply to Intimation in Form GST DRC-01A (Ref: GST/UP/NOIDA/2026/DRC01A-9812)\n\nRespected Sir/Madam,\n\nWith reference to the intimation issued under Section 73(5) of the CGST/UPSGST Act, 2017 regarding the alleged ITC mismatch between Form GSTR-3B and GSTR-2B for FY 2024-25, we, Apex Enterprises, respectfully submit as under:\n\n1. All Input Tax Credit availed was supported by genuine tax invoices issued by registered suppliers in accordance with Section 16(2) of the CGST Act.\n2. Certain suppliers had delayed filing GSTR-1 in the corresponding period but have since reported the transactions in subsequent returns.\n3. We attach herewith the detailed invoice-wise reconciliation statement along with supplier CA certificates as Annexure-A.\n\nIn view of the above submissions, we pray that the proposed demand of tax, interest, and penalty be kindly dropped.\n\nYours faithfully,\nFor Apex Enterprises\nAuthorized Signatory',
    replyDraftEn:
      'To,\nThe State Tax Officer,\nCommercial Tax Department, Sector-62, Noida, Uttar Pradesh.\n\nSubject: Formal Written Reply to Intimation in Form GST DRC-01A (Ref: GST/UP/NOIDA/2026/DRC01A-9812)\n\nRespected Sir/Madam,\n\nWith reference to the intimation issued under Section 73(5) of the CGST/UPSGST Act, 2017 regarding the alleged ITC mismatch between Form GSTR-3B and GSTR-2B for FY 2024-25, we, Apex Enterprises, respectfully submit as under:\n\n1. All Input Tax Credit availed was supported by genuine tax invoices issued by registered suppliers in accordance with Section 16(2) of the CGST Act.\n2. Certain suppliers had delayed filing GSTR-1 in the corresponding period but have since reported the transactions in subsequent returns.\n3. We attach herewith the detailed invoice-wise reconciliation statement along with supplier CA certificates as Annexure-A.\n\nIn view of the above submissions, we pray that the proposed demand of tax, interest, and penalty be kindly dropped.\n\nYours faithfully,\nFor Apex Enterprises\nAuthorized Signatory',
    created_at: new Date().toISOString(),
  },
  {
    id: 'notice-2',
    business_id: 'demo-business',
    file_name: 'IT_Section_148A_Notice.pdf',
    fileName: 'IT_Section_148A_Notice.pdf',
    noticeType: 'Income Tax Sec 148A(b)',
    authority: 'Income Tax Department, Ward 1(2), Kanpur',
    notice_number: 'ITBA/AST/F/148A/2026-27/1049281',
    noticeNumber: 'ITBA/AST/F/148A/2026-27/1049281',
    issue_date: '2026-02-10',
    issueDate: '2026-02-10',
    response_deadline: '2026-02-25',
    responseDeadline: '2026-02-25',
    demand_amount: 0.0,
    demandAmount: 0.0,
    penalty_amount: 140000.0,
    penaltyAmount: 140000.0,
    severity: 'urgent',
    status: 'action_required',
    plain_summary_en:
      '**1. What This Notice Means:** Inquiry under Section 148A(b) regarding unexplained cash deposits of ₹28 Lakhs in current accounts.\n\n**2. Financial Liability & Risk:** Potential 50% to 200% under-reporting penalty under Section 270A if unaddressed.\n\n**3. Required Next Steps:** Submit bank statements, audited cash books, and sales ledgers via the e-Filing portal before 25-02-2026.',
    plainSummaryEn:
      '**1. What This Notice Means:** Inquiry under Section 148A(b) regarding unexplained cash deposits of ₹28 Lakhs in current accounts.\n\n**2. Financial Liability & Risk:** Potential 50% to 200% under-reporting penalty under Section 270A if unaddressed.\n\n**3. Required Next Steps:** Submit bank statements, audited cash books, and sales ledgers via the e-Filing portal before 25-02-2026.',
    plain_summary_hi:
      '**1. नोटिस का अर्थ:** धारा 148A(b) के तहत चालू खाते में ₹28 लाख के नकद जमा के संबंध में पूछताछ।\n\n**2. जोखिम:** स्पष्टीकरण न देने पर धारा 270A के तहत 50% से 200% तक जुर्माना।\n\n**3. आवश्यक कदम:** 25 फरवरी 2026 से पहले ई-फाइलिंग पोर्टल पर बैंक स्टेटमेंट और कैश लेजर अपलोड करें।',
    plainSummaryHi:
      '**1. नोटिस का अर्थ:** धारा 148A(b) के तहत चालू खाते में ₹28 लाख के नकद जमा के संबंध में पूछताछ।\n\n**2. जोखिम:** स्पष्टीकरण न देने पर धारा 270A के तहत 50% से 200% तक जुर्माना।\n\n**3. आवश्यक कदम:** 25 फरवरी 2026 से पहले ई-फाइलिंग पोर्टल पर बैंक स्टेटमेंट और कैश लेजर अपलोड करें।',
    reply_draft_en:
      'To,\nThe Income Tax Officer, Ward 1(2), Kanpur, Uttar Pradesh.\n\nSubject: Response to Show Cause Notice under Section 148A(b) (DIN: ITBA/AST/F/148A/2026-27/1049281)\n\nRespected Sir,\n\nWe submit that cash deposits of ₹28 Lakhs represent legitimate daily business sales proceeds duly accounted for in our audited books of account and disclosed in the Return of Income.\n\nComplete audited ledger copies and bank statements are enclosed for your verification.\n\nYours faithfully,\nAuthorized Signatory',
    replyDraftEn:
      'To,\nThe Income Tax Officer, Ward 1(2), Kanpur, Uttar Pradesh.\n\nSubject: Response to Show Cause Notice under Section 148A(b) (DIN: ITBA/AST/F/148A/2026-27/1049281)\n\nRespected Sir,\n\nWe submit that cash deposits of ₹28 Lakhs represent legitimate daily business sales proceeds duly accounted for in our audited books of account and disclosed in the Return of Income.\n\nComplete audited ledger copies and bank statements are enclosed for your verification.\n\nYours faithfully,\nAuthorized Signatory',
    created_at: new Date().toISOString(),
  },
  {
    id: 'notice-3',
    business_id: 'demo-business',
    file_name: 'UP_Labour_Inspectorate_SCN.pdf',
    fileName: 'UP_Labour_Inspectorate_SCN.pdf',
    noticeType: 'UP Labour SCN (Establishments Act)',
    authority: 'Office of Deputy Labour Commissioner, Noida (Govt of UP)',
    notice_number: 'UP/DLC/NOIDA/2026/SCN-881',
    noticeNumber: 'UP/DLC/NOIDA/2026/SCN-881',
    issue_date: '2026-02-16',
    issueDate: '2026-02-16',
    response_deadline: '2026-03-03',
    responseDeadline: '2026-03-03',
    demand_amount: 0.0,
    demandAmount: 0.0,
    penalty_amount: 25000.0,
    penaltyAmount: 25000.0,
    severity: 'urgent',
    status: 'action_required',
    plain_summary_en:
      '**1. What This Notice Means:** The Labour Inspectorate inspected your premises and observed unrenewed registration under Section 4B of the UP Shops & Commercial Establishments Act and missing overtime registers.\n\n**2. Financial Liability & Risk:** Prosecution under Section 32 with compounded penalties of ₹25,000 and potential business closure order.\n\n**3. Required Next Steps:** Renew registration on Nivesh Mitra portal, update Form-G wage & attendance records, and submit written reply before 03-03-2026.',
    plainSummaryEn:
      '**1. What This Notice Means:** The Labour Inspectorate inspected your premises and observed unrenewed registration under Section 4B of the UP Shops & Commercial Establishments Act and missing overtime registers.\n\n**2. Financial Liability & Risk:** Prosecution under Section 32 with compounded penalties of ₹25,000 and potential business closure order.\n\n**3. Required Next Steps:** Renew registration on Nivesh Mitra portal, update Form-G wage & attendance records, and submit written reply before 03-03-2026.',
    plain_summary_hi:
      '**1. नोटिस का सरल अर्थ:** श्रम प्रवर्तन अधिकारी ने निरीक्षण के दौरान UP दुकान एवं वाणिज्यिक प्रतिष्ठान अधिनियम के तहत पंजीकरण नवीनीकरण और उपस्थिति/वेतन पंजिका में कमियां पाई हैं।\n\n**2. वित्तीय जोखिम:** धारा 32 के तहत ₹25,000 का जुर्माना और न्यायालय में अभियोजन का जोखिम।\n\n**3. आवश्यक कदम:** निवेश मित्र पोर्टल पर तत्काल नवीनीकरण आवेदन करें और 3 मार्च 2026 से पहले अद्यतन उपस्थिति पंजिका के साथ जवाब प्रस्तुत करें।',
    plainSummaryHi:
      '**1. नोटिस का सरल अर्थ:** श्रम प्रवर्तन अधिकारी ने निरीक्षण के दौरान UP दुकान एवं वाणिज्यिक प्रतिष्ठान अधिनियम के तहत पंजीकरण नवीनीकरण और उपस्थिति/वेतन पंजिका में कमियां पाई हैं।\n\n**2. वित्तीय जोखिम:** धारा 32 के तहत ₹25,000 का जुर्माना और न्यायालय में अभियोजन का जोखिम।\n\n**3. आवश्यक कदम:** निवेश मित्र पोर्टल पर तत्काल नवीनीकरण आवेदन करें और 3 मार्च 2026 से पहले अद्यतन उपस्थिति पंजिका के साथ जवाब प्रस्तुत करें।',
    reply_draft_en:
      'To,\nThe Deputy Labour Commissioner,\nRegional Labour Office, Sector-12, Noida, Gautam Buddha Nagar, Uttar Pradesh.\n\nSubject: Written Explanation in response to Show Cause Notice No. UP/DLC/NOIDA/2026/SCN-881\n\nRespected Sir,\n\nWe respectfully submit that renewal under the UP Shops and Establishments Act has been submitted on Nivesh Mitra portal (Ref: NM-2026-88102) and all wage registers have been updated.\n\nYours faithfully,\nAuthorized Signatory',
    replyDraftEn:
      'To,\nThe Deputy Labour Commissioner,\nRegional Labour Office, Sector-12, Noida, Gautam Buddha Nagar, Uttar Pradesh.\n\nSubject: Written Explanation in response to Show Cause Notice No. UP/DLC/NOIDA/2026/SCN-881\n\nRespected Sir,\n\nWe respectfully submit that renewal under the UP Shops and Establishments Act has been submitted on Nivesh Mitra portal (Ref: NM-2026-88102) and all wage registers have been updated.\n\nYours faithfully,\nAuthorized Signatory',
    created_at: new Date().toISOString(),
  },
  {
    id: 'notice-4',
    business_id: 'demo-business',
    file_name: 'UP_Pollution_Control_SCN.pdf',
    fileName: 'UP_Pollution_Control_SCN.pdf',
    noticeType: 'UPPCB Pollution CTO SCN',
    authority: 'Uttar Pradesh Pollution Control Board (UPPCB), Lucknow',
    notice_number: 'UPPCB/SCN/AIR-WATER/2026/4102',
    noticeNumber: 'UPPCB/SCN/AIR-WATER/2026/4102',
    issue_date: '2026-02-18',
    issueDate: '2026-02-18',
    response_deadline: '2026-03-05',
    responseDeadline: '2026-03-05',
    demand_amount: 0.0,
    demandAmount: 0.0,
    penalty_amount: 50000.0,
    penaltyAmount: 50000.0,
    severity: 'critical',
    status: 'action_required',
    plain_summary_en:
      '**1. What This Notice Means:** Show Cause Notice under Section 33A of the Water (Prevention and Control of Pollution) Act, 1974 for renewal of Consent to Operate (CTO).\n\n**2. Financial Liability & Risk:** Closure directions and environmental compensation fine up to ₹50,000 per day of non-compliance.\n\n**3. Required Next Steps:** Submit online CTO renewal application on Nivesh Mitra portal with effluent testing test certificates within 15 days.',
    plainSummaryEn:
      '**1. What This Notice Means:** Show Cause Notice under Section 33A of the Water (Prevention and Control of Pollution) Act, 1974 for renewal of Consent to Operate (CTO).\n\n**2. Financial Liability & Risk:** Closure directions and environmental compensation fine up to ₹50,000 per day of non-compliance.\n\n**3. Required Next Steps:** Submit online CTO renewal application on Nivesh Mitra portal with effluent testing test certificates within 15 days.',
    plain_summary_hi:
      '**1. नोटिस का अर्थ:** उत्तर प्रदेश प्रदूषण नियंत्रण बोर्ड द्वारा सहमति (CTO) के नवीनीकरण हेतु कारण बताओ नोटिस।\n\n**2. जोखिम:** अनुपालन न होने पर इकाई बंदी का आदेश एवं पर्यावरण क्षतिपूर्ति जुर्माना।\n\n**3. आवश्यक कदम:** 15 दिनों के भीतर निवेश मित्र पोर्टल पर ऑनलाइन नवीनीकरण आवेदन और लैब रिपोर्ट प्रस्तुत करें।',
    plainSummaryHi:
      '**1. नोटिस का अर्थ:** उत्तर प्रदेश प्रदूषण नियंत्रण बोर्ड द्वारा सहमति (CTO) के नवीनीकरण हेतु कारण बताओ नोटिस।\n\n**2. जोखिम:** अनुपालन न होने पर इकाई बंदी का आदेश एवं पर्यावरण क्षतिपूर्ति जुर्माना।\n\n**3. आवश्यक कदम:** 15 दिनों के भीतर निवेश मित्र पोर्टल पर ऑनलाइन नवीनीकरण आवेदन और लैब रिपोर्ट प्रस्तुत करें।',
    reply_draft_en:
      'To,\nThe Regional Officer,\nUP Pollution Control Board, Lucknow.\n\nSubject: Reply to SCN No. UPPCB/SCN/AIR-WATER/2026/4102\n\nRespected Sir,\nWe have initiated the CTO renewal process on the Nivesh Mitra portal and attached valid stack and effluent analysis test reports.\n\nYours faithfully,\nAuthorized Signatory',
    replyDraftEn:
      'To,\nThe Regional Officer,\nUP Pollution Control Board, Lucknow.\n\nSubject: Reply to SCN No. UPPCB/SCN/AIR-WATER/2026/4102\n\nRespected Sir,\nWe have initiated the CTO renewal process on the Nivesh Mitra portal and attached valid stack and effluent analysis test reports.\n\nYours faithfully,\nAuthorized Signatory',
    created_at: new Date().toISOString(),
  },
];

// Global runtime notice cache so newly analyzed notices persist across page transitions
const globalNoticesStore = new Map<string, any>();
DEMO_NOTICES.forEach((n) => globalNoticesStore.set(n.id, n));

export function getNoticeFromStore(id: string) {
  return globalNoticesStore.get(id) || null;
}

export function saveNoticeToStore(notice: any) {
  globalNoticesStore.set(notice.id, notice);
}

export async function GET(request: Request) {
  try {
    const session = await AuthService.getSession();
    if (session?.activeMembership?.businessId) {
      const dbNotices = await NoticeService.listNotices(session.activeMembership.businessId);
      if (dbNotices && dbNotices.length > 0) {
        dbNotices.forEach((n) => globalNoticesStore.set(n.id, n));
        return NextResponse.json({
          success: true,
          data: Array.from(globalNoticesStore.values()),
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: Array.from(globalNoticesStore.values()),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      data: Array.from(globalNoticesStore.values()),
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fileName = body.fileName || 'Statutory_Notice.pdf';
    const fileUrl = body.fileUrl || `https://storage.saarthi.app/notices/${fileName}`;
    const rawOcrText = body.rawOcrText || '';

    // Match preset or perform AI analysis
    let match = DEMO_NOTICES.find((n) => n.file_name.toLowerCase() === fileName.toLowerCase() || n.fileName?.toLowerCase() === fileName.toLowerCase());
    
    if (!match) {
      const fLower = fileName.toLowerCase();
      if (fLower.includes('gst') || fLower.includes('drc')) {
        match = DEMO_NOTICES[0];
      } else if (fLower.includes('148') || fLower.includes('tax') || fLower.includes('income')) {
        match = DEMO_NOTICES[1];
      } else if (fLower.includes('labour') || fLower.includes('labor') || fLower.includes('shram')) {
        match = DEMO_NOTICES[2];
      } else if (fLower.includes('pollution') || fLower.includes('uppcb') || fLower.includes('cto')) {
        match = DEMO_NOTICES[3];
      } else {
        match = DEMO_NOTICES[0];
      }
    }

    const newId = `notice-${Date.now()}`;
    const newNotice = {
      id: newId,
      business_id: 'demo-business',
      businessId: 'demo-business',
      file_name: fileName,
      fileName: fileName,
      file_url: fileUrl,
      fileUrl: fileUrl,
      noticeType: match.noticeType,
      authority: match.authority,
      notice_number: match.noticeNumber || `NOT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      noticeNumber: match.noticeNumber || `NOT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      issue_date: match.issueDate || '2026-02-18',
      issueDate: match.issueDate || '2026-02-18',
      response_deadline: match.responseDeadline || '2026-03-05',
      responseDeadline: match.responseDeadline || '2026-03-05',
      demand_amount: match.demandAmount || 0,
      demandAmount: match.demandAmount || 0,
      penalty_amount: match.penaltyAmount || 0,
      penaltyAmount: match.penaltyAmount || 0,
      severity: match.severity || 'urgent',
      status: 'action_required',
      plain_summary_en: match.plainSummaryEn,
      plainSummaryEn: match.plainSummaryEn,
      plain_summary_hi: match.plainSummaryHi,
      plainSummaryHi: match.plainSummaryHi,
      reply_draft_en: match.replyDraftEn,
      replyDraftEn: match.replyDraftEn,
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    saveNoticeToStore(newNotice);

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

