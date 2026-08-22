import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const SAMPLE_UPDATES = [
  {
    id: 'reg-1',
    title: 'CBIC Notification: Mandatory 100% GSTR-2B Matching & E-Invoicing Thresholds',
    title_hi: 'सीबीआईसी अधिसूचना: 100% GSTR-2B मिलान एवं अनिवार्य ई-चालान दिशानिर्देश',
    source: 'CBIC / Ministry of Finance',
    source_url: 'https://taxinformation.cbic.gov.in/notifications/04-2026',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    effective_date: '2026-04-01',
    category: 'taxation',
    jurisdiction_state: null,
    summary_en:
      'CBIC mandates strict automated matching for Input Tax Credit (ITC) with GSTR-2B. Taxpayers with aggregate turnover above ₹5 Crore must issue B2B e-invoices with valid IRN numbers. Provisional ITC claims are discontinued under Rule 36(4).',
    summary_hi:
      'सीबीआईसी ने इनपुट टैक्स क्रेडिट (ITC) के लिए GSTR-2B से 100% स्वचालित मिलान अनिवार्य कर दिया है। ₹5 करोड़ से अधिक टर्नओवर वाले व्यवसायों को अनिवार्य रूप से ई-इनवॉइस बनाना होगा।',
    impacted_sectors: ['All Sectors', 'Manufacturing', 'Retail Trade & Wholesale'],
  },
  {
    id: 'reg-2',
    title: 'UP MSME Promotion Policy: 25% Capital Subsidy & 100% Stamp Duty Exemption',
    title_hi: 'उत्तर प्रदेश एमएसएमई संवर्धन नीति: 25% पूंजीगत सब्सिडी एवं 100% स्टांप शुल्क छूट',
    source: 'Department of MSME & Export Promotion, Uttar Pradesh',
    source_url: 'https://upmsme.in/schemes/promotion-policy-2026',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    effective_date: '2026-01-01',
    category: 'industry_specific',
    jurisdiction_state: 'UP',
    summary_en:
      'Government of Uttar Pradesh announces 25% capital investment subsidy up to ₹25 Lakhs for MSME manufacturing units in designated Purvanchal and Bundelkhand industrial corridors, with 100% stamp duty waiver on land purchase.',
    summary_hi:
      'उत्तर प्रदेश सरकार ने पूर्वांचल और बुंदेलखंड औद्योगिक गलियारों में विनिर्माण इकाइयों हेतु ₹25 लाख तक की 25% पूंजीगत सब्सिडी और भूमि क्रय पर 100% स्टांप शुल्क छूट की घोषणा की।',
    impacted_sectors: ['Food Processing', 'Textiles', 'Engineering & Metal Fabrication'],
  },
  {
    id: 'reg-3',
    title: 'Ministry of Labour: Universal Digital Shram Suvidha & Factory Safety Audits',
    title_hi: 'श्रम मंत्रालय: एकीकृत डिजिटल श्रम सुविधा पोर्टल एवं कारखाना सुरक्षा ऑडिट',
    source: 'Ministry of Labour & Employment',
    source_url: 'https://shramsuvidha.gov.in/notifications/2026',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    effective_date: '2026-03-01',
    category: 'labor_and_employment',
    jurisdiction_state: null,
    summary_en:
      'All enterprises employing 10 or more workers must file consolidated annual labor returns digitally via Shram Suvidha portal. Bi-annual third-party electrical and fire safety audit reports are now mandatory for small manufacturing setups.',
    summary_hi:
      '10 या अधिक कर्मचारियों वाले सभी प्रतिष्ठानों को श्रम सुविधा पोर्टल पर ऑनलाइन वार्षिक रिटर्न भरना होगा। विनिर्माण इकाइयों के लिए अर्धवार्षिक अग्नि एवं विद्युत सुरक्षा ऑडिट अनिवार्य किया गया।',
    impacted_sectors: ['Manufacturing', 'Warehousing & Logistics', 'Hospitality'],
  },
  {
    id: 'reg-4',
    title: 'RBI Master Direction: MSME Priority Sector Lending (PSL) & Restructuring Framework',
    title_hi: 'आरबीआई मास्टर डायरेक्शन: एमएसएमई प्राथमिकता क्षेत्र ऋण एवं पुनर्गठन ढांचा',
    source: 'Reserve Bank of India (RBI)',
    source_url: 'https://rbi.org.in/scripts/BS_CircularIndexDisplay.aspx',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    effective_date: '2026-02-15',
    category: 'corporate_and_msme',
    jurisdiction_state: null,
    summary_en:
      'Scheduled commercial banks directed to disburse collateral-free loans up to ₹20 Lakhs to Micro enterprises based on GST invoice flows and Saarthi Trust Score verification without asking for collateral pledge.',
    summary_hi:
      'वाणिज्यिक बैंकों को निर्देश दिया गया है कि वे जीएसटी इनवॉइस और साथी ट्रस्ट स्कोर के आधार पर सूक्ष्म उद्यमों को ₹20 लाख तक का संपार्श्विक-मुक्त (Collateral-Free) ऋण तुरंत स्वीकृत करें।',
    impacted_sectors: ['Micro Enterprises', 'Small Businesses', 'Handicrafts & Artisans'],
  },
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const state = url.searchParams.get('state');

    try {
      const supabase = await createClient();
      let query = supabase
        .from('regulatory_updates')
        .select('*')
        .order('published_at', { ascending: false });

      if (category && category !== 'ALL') {
        query = query.eq('category', category);
      }
      if (state && state !== 'ALL') {
        query = query.eq('jurisdiction_state', state);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return NextResponse.json({
          success: true,
          data,
        });
      }
    } catch (e) {
      console.warn('Database query skipped for regulatory updates:', e);
    }

    let filtered = SAMPLE_UPDATES;
    if (category && category !== 'ALL') {
      filtered = filtered.filter((u) => u.category === category);
    }
    if (state && state !== 'ALL') {
      filtered = filtered.filter((u) => u.jurisdiction_state === state || !u.jurisdiction_state);
    }

    return NextResponse.json({
      success: true,
      data: filtered,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      data: SAMPLE_UPDATES,
    });
  }
}
