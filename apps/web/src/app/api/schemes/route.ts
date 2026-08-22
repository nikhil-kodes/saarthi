import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { SchemesService } from '@/lib/services/schemes';
import { applySchemeSchema } from '@saarthi/validation';

export const DEMO_SCHEMES = [
  {
    id: 'scheme-1',
    code: 'UP_MSME_CAPITAL_GRANT_25',
    title: 'UP MSME 25% Capital Investment Subsidy',
    titleHi: 'उत्तर प्रदेश MSME 25% पूंजीगत निवेश सब्सिडी',
    ministry: 'Department of MSME & Export Promotion, Uttar Pradesh',
    description: '25% capital investment grant up to ₹25 Lakhs (up to ₹4 Cr in Purvanchal/Bundelkhand) for modernizing food processing, textiles, and engineering machinery.',
    descriptionHi: 'खाद्य प्रसंस्करण, वस्त्र और इंजीनियरिंग इकाइयों के आधुनिकीकरण हेतु पूर्वांचल व बुंदेलखंड में 25% पूंजीगत सब्सिडी (अधिकतम ₹4 करोड़)।',
    eligibilityCriteria: { requires_udyam: true, requires_gstin: true, enterprise_types: ['micro', 'small'] },
    maxBenefitAmount: 2500000,
    benefitType: 'capital_subsidy',
    applicationUrl: 'https://upmsme.in',
    jurisdictionState: 'UP',
    isEligible: true,
    eligibilityReason: '100% criteria met (Registered UP Micro/Small Enterprise with active Udyam & GSTIN)',
  },
  {
    id: 'scheme-2',
    code: 'UP_ODOP_MARGIN_MONEY',
    title: 'UP One District One Product (ODOP) Margin Money Scheme',
    titleHi: 'उत्तर प्रदेश एक जिला एक उत्पाद (ODOP) मार्जिन मनी योजना',
    ministry: 'Department of MSME & Export Promotion, Uttar Pradesh',
    description: 'Financial margin grant of 10% to 25% (up to ₹20 Lakhs) for setting up and modernizing designated district handicraft, food, leather, and manufacturing clusters across UP.',
    descriptionHi: 'उत्तर प्रदेश के 75 जनपदों के विशिष्ट ओडीओपी उत्पादों (जैसे मुरादाबाद पीतल, भदोही कालीन, आगरा चमड़ा, कन्नौज इत्र) के लिए ₹20 लाख तक का मार्जिन मनी अनुदान।',
    eligibilityCriteria: { requires_udyam: true },
    maxBenefitAmount: 2000000,
    benefitType: 'capital_subsidy',
    applicationUrl: 'https://odopup.in',
    jurisdictionState: 'UP',
    isEligible: true,
    eligibilityReason: 'Recognized regional MSME manufacturing cluster located in UP',
  },
  {
    id: 'scheme-3',
    code: 'UP_MMYSY_SWAROJGAR',
    title: 'Mukhyamantri Yuva Swarojgar Yojana (MMYSY)',
    titleHi: 'मुख्यमंत्री युवा स्वरोजगार योजना (MMYSY)',
    ministry: 'Department of Industries, Government of Uttar Pradesh',
    description: '25% margin money capital subsidy (up to ₹6.25 Lakhs for industrial projects up to ₹25L, up to ₹2.5 Lakhs for service sector projects up to ₹10L) for educated youth in UP.',
    descriptionHi: 'उत्तर प्रदेश के शिक्षित युवाओं के लिए उद्योग क्षेत्र में ₹25 लाख तक के प्रोजेक्ट पर ₹6.25 लाख तथा सेवा क्षेत्र में ₹10 लाख तक के प्रोजेक्ट पर ₹2.5 लाख तक की 25% मार्जिन सब्सिडी।',
    eligibilityCriteria: { requires_udyam: true, enterprise_types: ['micro'] },
    maxBenefitAmount: 625000,
    benefitType: 'capital_subsidy',
    applicationUrl: 'https://diupmsme.upsdc.gov.in',
    jurisdictionState: 'UP',
    isEligible: true,
    eligibilityReason: 'Eligible for UP first-generation micro entrepreneurs & youth startups',
  },
  {
    id: 'scheme-4',
    code: 'UP_INTEREST_SUBVENTION',
    title: 'Uttar Pradesh MSME 5% Annual Interest Subvention Scheme',
    titleHi: 'उत्तर प्रदेश एमएसएमई 5% वार्षिक ब्याज उपादान योजना',
    ministry: 'MSME & Export Promotion Department, UP',
    description: 'Provides 5% annual interest rebate on term loans taken from scheduled commercial banks for micro and small enterprises for a period of up to 5 years (up to ₹25 Lakhs total).',
    descriptionHi: 'सूक्ष्म और लघु उद्यमों के लिए 5 वर्षों तक की अवधि के लिए अनुसूचित वाणिज्यिक बैंकों से लिए गए सावधि ऋणों पर 5% वार्षिक ब्याज छूट (अधिकतम ₹25 लाख)।',
    eligibilityCriteria: { requires_udyam: true, requires_pan: true },
    maxBenefitAmount: 2500000,
    benefitType: 'interest_subvention',
    applicationUrl: 'https://niveshmitra.up.nic.in',
    jurisdictionState: 'UP',
    isEligible: true,
    eligibilityReason: 'Active registered enterprise with term loan interest eligibility',
  },
  {
    id: 'scheme-5',
    code: 'UP_STAMP_DUTY_EXEMPTION',
    title: 'UP MSME Industrial Land Stamp Duty & Registration Exemption',
    titleHi: 'उत्तर प्रदेश एमएसएमई औद्योगिक भूमि स्टाम्प शुल्क एवं पंजीकरण छूट',
    ministry: 'Stamp & Registration Department, Uttar Pradesh',
    description: '100% stamp duty exemption in Purvanchal & Bundelkhand, 75% in Madhyanchal, and 50% in Paschimanchal on land purchase or lease for establishing new MSME industrial units.',
    descriptionHi: 'पूर्वांचल व बुंदेलखंड में 100%, मध्यांचल में 75% तथा पश्चिमांचल में 50% स्टाम्प शुल्क में पूर्ण छूट।',
    eligibilityCriteria: { requires_udyam: true },
    maxBenefitAmount: 5000000,
    benefitType: 'capital_subsidy',
    applicationUrl: 'https://niveshmitra.up.nic.in',
    jurisdictionState: 'UP',
    isEligible: true,
    eligibilityReason: 'Industrial unit acquiring or leasing land in UP industrial areas',
  },
  {
    id: 'scheme-6',
    code: 'PMEGP_CREDIT_LINKED_GRANT',
    title: 'Prime Minister Employment Generation Programme (PMEGP)',
    titleHi: 'प्रधानमंत्री रोजगार सृजन कार्यक्रम (PMEGP)',
    ministry: 'Ministry of MSME / KVIC (Central Government)',
    description: 'Credit-linked subsidy scheme offering 15% to 35% margin money assistance on bank term loans up to ₹50 Lakhs for manufacturing and ₹20 Lakhs for service ventures.',
    descriptionHi: 'विनिर्माण (₹50 लाख तक) और सेवा क्षेत्र (₹20 लाख तक) में नई इकाइयों के लिए 15% से 35% तक मार्जिन मनी सब्सिडी।',
    eligibilityCriteria: { requires_udyam: true },
    maxBenefitAmount: 1750000,
    benefitType: 'margin_money_subsidy',
    applicationUrl: 'https://kviconline.gov.in',
    jurisdictionState: null,
    isEligible: true,
    eligibilityReason: 'Eligible for manufacturing and services MSME setting up new production units',
  },
  {
    id: 'scheme-7',
    code: 'CGTMSE_COLLATERAL_FREE',
    title: 'Credit Guarantee Scheme for Micro & Small Enterprises (CGTMSE)',
    titleHi: 'क्रेडिट गारंटी फंड योजना (CGTMSE)',
    ministry: 'Ministry of MSME & SIDBI (Central Government)',
    description: 'Collateral-free credit facility up to ₹5 Crore with 85% credit guarantee cover from SIDBI for manufacturing & service MSMEs without pledging fixed assets.',
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
    id: 'scheme-8',
    code: 'CENTRAL_ZED_CERTIFICATION',
    title: 'MSME Sustainable (ZED) Certification Scheme',
    titleHi: 'एमएसएमई शून्य दोष शून्य प्रभाव (ZED) प्रमाणन योजना',
    ministry: 'Ministry of MSME, Government of India',
    description: 'Financial subsidy up to 80% on Bronze, Silver, and Gold ZED quality and environmental sustainability certification fees, plus ₹5 Lakhs handholding support.',
    descriptionHi: 'गुणवत्ता और पर्यावरण अनुकूल विनिर्माण के लिए कांस्य, रजत एवं स्वर्ण ZED प्रमाणन शुल्क पर 80% तक सब्सिडी और ₹5 लाख तक तकनीकी परामर्श सहायता।',
    eligibilityCriteria: { requires_udyam: true },
    maxBenefitAmount: 500000,
    benefitType: 'capital_subsidy',
    applicationUrl: 'https://zed.msme.gov.in',
    jurisdictionState: null,
    isEligible: true,
    eligibilityReason: 'Udyam-registered MSME eligible for sustainability and zero-defect quality certification grant',
  },
  {
    id: 'scheme-9',
    code: 'CENTRAL_PM_VISHWAKARMA',
    title: 'PM Vishwakarma Artisan & Craftsman Financial Assistance',
    titleHi: 'प्रधानमंत्री विश्वकर्मा शिल्पकार एवं कारीगर योजना',
    ministry: 'Ministry of MSME & Ministry of Skill Development',
    description: 'Financial grant of ₹15,000 toolkits plus ₹3 Lakhs collateral-free credit at 5% concessional interest rate with digital incentive cashback for traditional trades.',
    descriptionHi: '18 पारंपरिक ट्रेडों के शिल्पकारों को ₹15,000 टूलकिट अनुदान तथा 5% रियायती ब्याज दर पर ₹3 लाख तक का कोलैटरल-फ्री ऋण।',
    eligibilityCriteria: { requires_aadhaar: true },
    maxBenefitAmount: 300000,
    benefitType: 'collateral_free_loan',
    applicationUrl: 'https://pmvishwakarma.gov.in',
    jurisdictionState: null,
    isEligible: true,
    eligibilityReason: 'Artisans and craft manufacturing enterprises eligible for 5% loan & toolkit grant',
  },
  {
    id: 'scheme-10',
    code: 'CENTRAL_MUDRA',
    title: 'Pradhan Mantri Mudra Yojana (PMMY) - Shishu, Kishore & Tarun',
    titleHi: 'प्रधानमंत्री मुद्रा योजना (PMMY) - शिशु, किशोर एवं तरुण श्रेणी',
    ministry: 'Department of Financial Services, Ministry of Finance',
    description: 'Collateral-free institutional credit up to ₹20 Lakhs for small business units for purchase of machinery, working capital, and business expansion.',
    descriptionHi: 'मशीनरी की खरीद, कार्यशील पूंजी और व्यापार विस्तार के लिए छोटे व्यवसायों को ₹20 लाख तक का बिना किसी गारंटी का संस्थागत ऋण।',
    eligibilityCriteria: { requires_pan: true },
    maxBenefitAmount: 2000000,
    benefitType: 'collateral_free_loan',
    applicationUrl: 'https://www.mudra.org.in',
    jurisdictionState: null,
    isEligible: true,
    eligibilityReason: 'Collateral-free working capital loan for operational MSME enterprises',
  },
  {
    id: 'scheme-11',
    code: 'CENTRAL_STANDUP_INDIA',
    title: 'Stand-Up India Scheme for Women and SC/ST Entrepreneurs',
    titleHi: 'स्टैंड-अप इंडिया योजना (महिला एवं SC/ST उद्यमी)',
    ministry: 'Department of Financial Services / SIDBI',
    description: 'Bank loans between ₹10 Lakhs and ₹1 Crore for setting up greenfield manufacturing, service, or trading enterprises by women and SC/ST promoters.',
    descriptionHi: 'ग्रीनफील्ड विनिर्माण, सेवा या व्यापार उद्यम स्थापित करने के लिए ₹10 लाख से ₹1 करोड़ तक का बैंक ऋण।',
    eligibilityCriteria: { requires_pan: true },
    maxBenefitAmount: 10000000,
    benefitType: 'collateral_free_loan',
    applicationUrl: 'https://www.standupmitra.in',
    jurisdictionState: null,
    isEligible: true,
    eligibilityReason: 'Women or SC/ST promoter greenfield business project',
  },
  {
    id: 'scheme-12',
    code: 'CENTRAL_MSME_SAMADHAAN',
    title: 'MSME Samadhaan Delayed Payment Legal Recovery & 3x Interest',
    titleHi: 'एमएसएमई समाधान विलंबित भुगतान वसूली एवं 3 गुना ब्याज समाधान',
    ministry: 'Office of Development Commissioner (MSME)',
    description: 'Statutory dispute recovery for delayed payments from corporate and PSU buyers with mandatory monthly compound interest at 3 times RBI bank rate under MSMED Act.',
    descriptionHi: '45 दिनों से अधिक के बकाया भुगतानों पर आरबीआई बैंक दर के 3 गुना चक्रवृद्धि ब्याज सहित कानूनी वसूली सहायता।',
    eligibilityCriteria: { requires_udyam: true, requires_gstin: true },
    maxBenefitAmount: 10000000,
    benefitType: 'interest_subvention',
    applicationUrl: 'https://samadhaan.msme.gov.in',
    jurisdictionState: null,
    isEligible: true,
    eligibilityReason: 'Eligible for recovering overdue buyer payments beyond 45 days with statutory interest',
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
