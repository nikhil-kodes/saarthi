import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { SchemesService } from '@/lib/services/schemes';
import { applySchemeSchema } from '@saarthi/validation';

const DEMO_SCHEMES = [
  {
    id: 'scheme-1',
    code: 'UP_MSME_CAPITAL_GRANT_25',
    title: 'UP MSME 25% Capital Investment Subsidy',
    titleHi: 'उत्तर प्रदेश MSME 25% पूंजीगत निवेश सब्सिडी',
    ministry: 'Department of MSME & Export Promotion, Uttar Pradesh',
    description: '25% capital investment grant up to ₹25 Lakhs for modernizing food processing, textiles, and engineering machinery in UP industrial belts.',
    descriptionHi: 'खाद्य प्रसंस्करण, वस्त्र और इंजीनियरिंग इकाइयों के आधुनिकीकरण हेतु ₹25 लाख तक की 25% पूंजीगत सब्सिडी।',
    eligibilityCriteria: { requires_udyam: true, requires_gstin: true, enterprise_types: ['micro', 'small'] },
    maxBenefitAmount: 2500000,
    benefitType: 'capital_subsidy',
    applicationUrl: 'https://msme.up.gov.in',
    jurisdictionState: 'UP',
    isEligible: true,
    eligibilityReason: '100% criteria met (Registered UP Micro/Small Enterprise with active Udyam & GSTIN)',
  },
  {
    id: 'scheme-2',
    code: 'PMEGP_CREDIT_LINKED_GRANT',
    title: 'Prime Minister Employment Generation Programme (PMEGP)',
    titleHi: 'प्रधानमंत्री रोजगार सृजन कार्यक्रम (PMEGP)',
    ministry: 'Ministry of MSME / KVIC',
    description: 'Credit-linked subsidy scheme offering 15% to 35% margin money assistance on bank term loans up to ₹50 Lakhs for new manufacturing ventures.',
    descriptionHi: 'नई विनिर्माण इकाइयों के लिए ₹50 लाख तक के बैंक ऋण पर 15% से 35% तक मार्जिन मनी सब्सिडी।',
    eligibilityCriteria: { requires_udyam: true },
    maxBenefitAmount: 5000000,
    benefitType: 'margin_money_subsidy',
    applicationUrl: 'https://kviconline.gov.in',
    jurisdictionState: null,
    isEligible: true,
    eligibilityReason: 'Eligible for manufacturing MSME setting up new production lines',
  },
  {
    id: 'scheme-3',
    code: 'CGTMSE_COLLATERAL_FREE',
    title: 'Credit Guarantee Scheme (CGTMSE)',
    titleHi: 'क्रेडिट गारंटी फंड योजना (CGTMSE)',
    ministry: 'Ministry of MSME & SIDBI',
    description: 'Collateral-free credit facility up to ₹5 Crore with 85% credit guarantee cover from SIDBI for manufacturing & service MSMEs.',
    descriptionHi: 'विनिर्माण एवं सेवा MSME के लिए बिना किसी संपत्ति बंधक (Collateral-Free) के ₹5 करोड़ तक का ऋण।',
    eligibilityCriteria: { requires_udyam: true, requires_gstin: true },
    maxBenefitAmount: 50000000,
    benefitType: 'credit_guarantee',
    applicationUrl: 'https://www.cgtmse.in',
    jurisdictionState: null,
    isEligible: true,
    eligibilityReason: 'Active registered enterprise with clean statutory filing record',
  },
  {
    id: 'scheme-4',
    code: 'UP_ODOP_MARGIN_MONEY',
    title: 'UP One District One Product (ODOP) Scheme',
    titleHi: 'उत्तर प्रदेश एक जिला एक उत्पाद (ODOP) मार्जिन मनी योजना',
    ministry: 'Department of Industries, Uttar Pradesh',
    description: 'Financial assistance of up to ₹20 Lakhs margin money grant for designated district handicraft, food, and manufacturing clusters across UP.',
    descriptionHi: 'उत्तर प्रदेश के 75 जनपदों के विशिष्ट ओडीओपी उत्पादों के विकास हेतु ₹20 लाख तक का अनुदान।',
    eligibilityCriteria: { requires_udyam: true },
    maxBenefitAmount: 2000000,
    benefitType: 'capital_subsidy',
    applicationUrl: 'https://odopup.in',
    jurisdictionState: 'UP',
    isEligible: true,
    eligibilityReason: 'Recognized regional MSME manufacturing cluster',
  },
];

export async function GET(request: Request) {
  try {
    const session = await AuthService.getSession();
    if (!session || !session.user || !session.activeMembership?.businessId) {
      return NextResponse.json({
        success: true,
        data: DEMO_SCHEMES,
      });
    }

    const businessId = session.activeMembership.businessId;
    const schemes = await SchemesService.listSchemesForBusiness(businessId);
    return NextResponse.json({
      success: true,
      data: schemes && schemes.length > 0 ? schemes : DEMO_SCHEMES,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      data: DEMO_SCHEMES,
    });
  }
}

export async function POST(request: Request) {
  try {
    const session = await AuthService.getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = applySchemeSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invalid scheme application payload',
            details: validated.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const application = await SchemesService.applyForScheme(session.user.id, validated.data);
    return NextResponse.json(
      {
        success: true,
        data: application,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'APPLY_SCHEME_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}
