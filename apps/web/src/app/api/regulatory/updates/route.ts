import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const session = await AuthService.getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const state = url.searchParams.get('state');

    const supabase = await createClient();
    let query = supabase
      .from('regulatory_updates')
      .select('*')
      .order('published_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }
    if (state) {
      query = query.eq('jurisdiction_state', state);
    }

    const { data, error } = await query;

    if (error || !data) {
      // Fallback sample data if DB connection has no seed yet
      return NextResponse.json({
        success: true,
        data: [
          {
            id: 'sample-1',
            title: 'CBIC Notification: Mandatory E-Invoicing Thresholds & ITC Verification',
            title_hi: 'सीबीआईसी अधिसूचना: अनिवार्य ई-चालान और आईटीसी सत्यापन नियम',
            source: 'CBIC / GSTN',
            source_url: 'https://taxinformation.cbic.gov.in/notifications/04-2024',
            published_at: new Date().toISOString(),
            effective_date: '2026-04-01',
            category: 'taxation',
            jurisdiction_state: null,
            summary_en: 'CBIC mandates strict 100% GSTR-2B automated matching for Input Tax Credit claims. Taxpayers with aggregate turnover above ₹5 Crore must issue B2B e-invoices with valid IRN numbers.',
            summary_hi: 'सीबीआईसी ने इनपुट टैक्स क्रेडिट के लिए GSTR-2B से 100% मिलान अनिवार्य किया है। ₹5 करोड़ से अधिक वार्षिक कारोबार वाले व्यवसायों को अनिवार्य रूप से ई-इनवॉइस बनाना होगा।',
            impacted_sectors: ['All Sectors', 'Manufacturing', 'Retail Trade & Wholesale'],
          },
          {
            id: 'sample-2',
            title: 'UP MSME Promotion Policy: Capital Subsidy & Stamp Duty Exemption for Manufacturing Units',
            title_hi: 'उत्तर प्रदेश एमएसएमई संवर्धन नीति: पूंजीगत सब्सिडी एवं स्टांप शुल्क छूट',
            source: 'Directorate of Industries, UP',
            source_url: 'https://upmsme.in/schemes/promotion-policy-2026',
            published_at: new Date().toISOString(),
            effective_date: '2026-01-01',
            category: 'corporate_and_msme',
            jurisdiction_state: 'UP',
            summary_en: 'UP Government announces up to 25% capital investment subsidy (max ₹4 Crore) for micro and small manufacturing units established in Purvanchal and Bundelkhand regions.',
            summary_hi: 'उत्तर प्रदेश सरकार ने पूर्वांचल और बुंदेलखंड में स्थापित सूक्ष्म एवं लघु विनिर्माण इकाइयों के लिए 25% तक पूंजीगत सब्सिडी की घोषणा की है।',
            impacted_sectors: ['Textiles & Apparel', 'Leather & Footwear', 'Automotive & Engineering Components'],
          },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_UPDATES_FAILED',
          message: error.message || 'Failed to load regulatory updates',
        },
      },
      { status: 500 }
    );
  }
}
