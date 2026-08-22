import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Personalized MSME Statutory License & Registration Engine
 * Differentiates requirements by:
 * - MSME Class: Micro (Turnover <= 5Cr), Small (Turnover <= 50Cr), Medium (Turnover <= 250Cr)
 * - Sector: Food, Textiles, Chemicals, Engineering, Retail, IT, etc.
 * - Employee Count: 1-9, 10-19, 20-49, 50-249, 250+
 * - Jurisdiction State: UP (Uttar Pradesh) / Central
 */

interface LicenseDefinition {
  code: string;
  titleEn: string;
  titleHi: string;
  category: 'universal' | 'labor' | 'environmental' | 'industry_specific' | 'corporate';
  authority: string;
  actName: string;
  portalName: string;
  portalUrl: string;
  validityYears: number | 'lifetime';
  penaltyDetailsEn: string;
  penaltyDetailsHi: string;
  requiredDocumentsEn: string[];
  requiredDocumentsHi: string[];
  applicabilityCriteria: {
    msmeTiers: ('micro' | 'small' | 'medium')[];
    minEmployees?: number;
    sectors?: string[];
  };
}

const MASTER_LICENSES: LicenseDefinition[] = [
  // 1. Universal MSME Registrations
  {
    code: 'UDYAM_REGISTRATION',
    titleEn: 'Udyam MSME Registration Certificate',
    titleHi: 'उद्यम MSME पंजीकरण प्रमाणपत्र',
    category: 'universal',
    authority: 'Ministry of MSME, Govt of India',
    actName: 'MSMED Act, 2006',
    portalName: 'National Single Window System (NSWS) / Udyam Portal',
    portalUrl: 'https://udyamregistration.gov.in',
    validityYears: 'lifetime',
    penaltyDetailsEn: 'Disqualification from government subsidy schemes, MSME Samadhan protection, and priority sector lending',
    penaltyDetailsHi: 'सरकारी सब्सिडी, MSME समाधान सुरक्षा और प्राथमिकता क्षेत्र ऋण से वंचित होना',
    requiredDocumentsEn: ['Aadhaar Card of Applicant', 'PAN Card of Business', 'GSTIN (if applicable)', 'Bank Account Details'],
    requiredDocumentsHi: ['आवेदक का आधार कार्ड', 'व्यवसाय का पैन कार्ड', 'जीएसटी नंबर (यदि लागू हो)', 'बैंक खाता विवरण'],
    applicabilityCriteria: { msmeTiers: ['micro', 'small', 'medium'] },
  },
  {
    code: 'GST_REGISTRATION',
    titleEn: 'Goods & Services Tax (GST) Registration',
    titleHi: 'वस्तु एवं सेवा कर (GST) पंजीकरण',
    category: 'universal',
    authority: 'Central Board of Indirect Taxes & Customs (CBIC)',
    actName: 'CGST / SGST Act, 2017',
    portalName: 'GST Common Portal',
    portalUrl: 'https://www.gst.gov.in',
    validityYears: 'lifetime',
    penaltyDetailsEn: '100% of tax due or ₹10,000 (whichever is higher) under Section 122',
    penaltyDetailsHi: 'धारा 122 के तहत देय कर का 100% या ₹10,000 (जो भी अधिक हो)',
    requiredDocumentsEn: ['PAN Card', 'Proof of Business Premises (Electricity Bill/Rent Agreement)', 'Bank Statement / Cancelled Cheque', 'Partner/Director Photos'],
    requiredDocumentsHi: ['पैन कार्ड', 'परिसर का प्रमाण (बिजली बिल/किरायानामा)', 'बैंक स्टेटमेंट / रद्द चेक', 'भागीदार/निदेशक की तस्वीर'],
    applicabilityCriteria: { msmeTiers: ['micro', 'small', 'medium'] },
  },
  {
    code: 'UP_SHOPS_ESTABLISHMENT',
    titleEn: 'UP Shops & Commercial Establishment Registration',
    titleHi: 'UP दुकान एवं वाणिज्यिक प्रतिष्ठान पंजीकरण (गुमास्ता)',
    category: 'universal',
    authority: 'Labour Department, Uttar Pradesh',
    actName: 'UP Dookan Aur Vanijya Adhisthan Adhiniyam, 1962',
    portalName: 'UP Nivesh Mitra Single Window Portal',
    portalUrl: 'https://niveshmitra.up.nic.in',
    validityYears: 5,
    penaltyDetailsEn: 'Fine up to ₹5,000 and closure notice by Labour Inspector',
    penaltyDetailsHi: 'श्रम निरीक्षक द्वारा ₹5,000 तक का जुर्माना एवं बंदी नोटिस',
    requiredDocumentsEn: ['Business PAN', 'Premises Rent Agreement', 'Employee Details List', 'Challan Payment Receipt'],
    requiredDocumentsHi: ['व्यवसाय पैन', 'परिसर किराया समझौता', 'कर्मचारी विवरण सूची', 'चालान भुगतान रसीद'],
    applicabilityCriteria: { msmeTiers: ['micro', 'small', 'medium'] },
  },

  // 2. Labor & Employment Scale-Tiered
  {
    code: 'EPF_REGISTRATION',
    titleEn: 'Employees Provident Fund (EPF) Registration',
    titleHi: 'कर्मचारी भविष्य निधि (EPF) पंजीकरण',
    category: 'labor',
    authority: 'Employees Provident Fund Organisation (EPFO)',
    actName: 'EPF & Miscellaneous Provisions Act, 1952',
    portalName: 'Unified Shram Suvidha Portal',
    portalUrl: 'https://shramsuvidha.gov.in',
    validityYears: 'lifetime',
    penaltyDetailsEn: 'Mandatory for establishments with 20+ employees. Non-compliance invites penal damages up to 25% p.a. + imprisonment',
    penaltyDetailsHi: '20+ कर्मचारियों वाले प्रतिष्ठानों के लिए अनिवार्य। 25% वार्षिक तक दंडात्मक क्षतिपूर्ति + कारावास',
    requiredDocumentsEn: ['Establishment PAN', 'Incorporation/Partnership Deed', 'List of 20+ Employees with Aadhaar/UAN', 'Cancelled Cheque'],
    requiredDocumentsHi: ['प्रतिष्ठान पैन', 'कंपनी निगमन विलेख', 'आधार/UAN सहित 20+ कर्मचारियों की सूची', 'रद्द चेक'],
    applicabilityCriteria: { msmeTiers: ['small', 'medium'], minEmployees: 20 },
  },
  {
    code: 'ESI_REGISTRATION',
    titleEn: 'Employees State Insurance (ESIC) Registration',
    titleHi: 'कर्मचारी राज्य बीमा (ESIC) पंजीकरण',
    category: 'labor',
    authority: 'Employees State Insurance Corporation',
    actName: 'ESI Act, 1948',
    portalName: 'ESIC Portal / Shram Suvidha',
    portalUrl: 'https://www.esic.gov.in',
    validityYears: 'lifetime',
    penaltyDetailsEn: 'Mandatory for non-seasonal factories with 10+ employees. Section 85 penalty and prosecution',
    penaltyDetailsHi: '10+ कर्मचारियों वाली गैर-मौसमी इकाइयों के लिए अनिवार्य। धारा 85 के तहत अभियोजन',
    requiredDocumentsEn: ['Entity PAN', 'Registration Certificate', 'Employee Salary Sheet', 'Address Proof'],
    requiredDocumentsHi: ['इकाई पैन', 'पंजीकरण प्रमाणपत्र', 'कर्मचारी वेतन शीट', 'पते का प्रमाण'],
    applicabilityCriteria: { msmeTiers: ['small', 'medium'], minEmployees: 10 },
  },

  // 3. Sector-Specific Clearances
  {
    code: 'FSSAI_FOOD_LICENSE',
    titleEn: 'FSSAI Food Safety License / Registration',
    titleHi: 'FSSAI खाद्य सुरक्षा लाइसेंस / पंजीकरण',
    category: 'industry_specific',
    authority: 'Food Safety and Standards Authority of India',
    actName: 'Food Safety and Standards Act, 2006',
    portalName: 'FSSAI FoSCoS Portal (Food Safety Compliance System)',
    portalUrl: 'https://foscos.fssai.gov.in',
    validityYears: 5,
    penaltyDetailsEn: 'Section 63 penalty: Imprisonment up to 6 months and fine up to ₹5,00,000 for operating without valid FSSAI license',
    penaltyDetailsHi: 'धारा 63 जुर्माना: वैध FSSAI लाइसेंस के बिना संचालन पर 6 महीने तक की कैद और ₹5 लाख तक का जुर्माना',
    requiredDocumentsEn: ['Photo ID of FBO', 'Premises Layout Plan', 'Water Quality Test Report from NABL Lab', 'List of Equipment & Food Category List', 'FSMS Plan'],
    requiredDocumentsHi: ['खाद्य ऑपरेटर फोटो आईडी', 'परिसर लेआउट योजना', 'NABL लैब से जल परीक्षण रिपोर्ट', 'उपकरण एवं खाद्य श्रेणी सूची', 'FSMS स्वच्छता योजना'],
    applicabilityCriteria: {
      msmeTiers: ['micro', 'small', 'medium'],
      sectors: ['Food Processing & Confectionery', 'Agriculture & Allied Activities', 'Retail Trade & Wholesale'],
    },
  },
  {
    code: 'UPPCB_CONSENT_CTO',
    titleEn: 'Pollution Control Consent to Operate (CTO - Green/Orange Category)',
    titleHi: 'प्रदूषण नियंत्रण बोर्ड संचालन सहमति (CTO)',
    category: 'environmental',
    authority: 'UP Pollution Control Board (UPPCB)',
    actName: 'Water (Prevention & Control of Pollution) Act 1974 / Air Act 1981',
    portalName: 'UPPCB Online Consent Management System (OCMMS)',
    portalUrl: 'https://uppcb.com',
    validityYears: 5,
    penaltyDetailsEn: 'Power disconnection, factory seal, and penalty up to ₹1,00,000 per day under Section 41/43',
    penaltyDetailsHi: 'विद्युत विच्छेदन, कारखाना सील एवं धारा 41/43 के तहत ₹1,00,000 प्रतिदिन तक का जुर्माना',
    requiredDocumentsEn: ['Site Plan with Manufacturing Process Flow', 'Effluent/Air Emission Treatment Details', 'Land Ownership/Lease Agreement', 'Capital Investment CA Certificate'],
    requiredDocumentsHi: ['उत्पादन प्रक्रिया प्रवाह सहित साइट योजना', 'उत्सर्जन उपचार विवरण', 'भूमि पट्टा समझौता', 'CA पूंजी निवेश प्रमाणपत्र'],
    applicabilityCriteria: {
      msmeTiers: ['small', 'medium'],
      sectors: ['Food Processing & Confectionery', 'Textiles & Apparel', 'Leather & Footwear', 'Chemicals & Pharmaceuticals', 'Automotive & Engineering Components'],
    },
  },
  {
    code: 'FIRE_SAFETY_NOC',
    titleEn: 'Fire Safety No-Objection Certificate (NOC)',
    titleHi: 'अग्नि सुरक्षा अनापत्ति प्रमाणपत्र (Fire NOC)',
    category: 'environmental',
    authority: 'Directorate of Fire Services, Uttar Pradesh',
    actName: 'UP Fire Prevention and Fire Safety Act',
    portalName: 'Nivesh Mitra Fire NOC Service',
    portalUrl: 'https://niveshmitra.up.nic.in',
    validityYears: 3,
    penaltyDetailsEn: 'Factory closure notice, disqualification of industrial insurance claims, and criminal liability in case of hazard',
    penaltyDetailsHi: 'कारखाना बंदी नोटिस, औद्योगिक बीमा दावों की अमान्यता एवं आपराधिक दायित्व',
    requiredDocumentsEn: ['Building Architectural Plan with Emergency Exits', 'Fire Extinguisher Installation Certificate', 'Water Storage Tank Availability Proof'],
    requiredDocumentsHi: ['आपातकालीन निकास सहित भवन का नक्शा', 'अग्निशामक स्थापना प्रमाणपत्र', 'जल भंडारण क्षमता प्रमाण'],
    applicabilityCriteria: {
      msmeTiers: ['small', 'medium'],
      sectors: ['Food Processing & Confectionery', 'Textiles & Apparel', 'Leather & Footwear', 'Chemicals & Pharmaceuticals', 'Automotive & Engineering Components'],
    },
  },
  {
    code: 'IMPORT_EXPORT_CODE',
    titleEn: 'Import Export Code (IEC)',
    titleHi: 'आयात निर्यात कोड (IEC)',
    category: 'corporate',
    authority: 'Directorate General of Foreign Trade (DGFT)',
    actName: 'Foreign Trade (Development and Regulation) Act, 1992',
    portalName: 'DGFT Online Portal',
    portalUrl: 'https://www.dgft.gov.in',
    validityYears: 'lifetime',
    penaltyDetailsEn: 'Inability to clear export shipments through Indian Customs, forfeiture of RoDTEP/Duty Drawback benefits',
    penaltyDetailsHi: 'भारतीय सीमा शुल्क के माध्यम से निर्यात खेप निकालने में असमर्थता, RoDTEP लाभों की जब्ती',
    requiredDocumentsEn: ['Entity PAN', 'Active Current Bank Account with AD Code', 'Address Proof'],
    requiredDocumentsHi: ['इकाई पैन', 'AD कोड सहित चालू बैंक खाता', 'पते का प्रमाण'],
    applicabilityCriteria: {
      msmeTiers: ['micro', 'small', 'medium'],
      sectors: ['Textiles & Apparel', 'Leather & Footwear', 'Handicrafts & Carpet Manufacturing', 'Chemicals & Pharmaceuticals'],
    },
  },
];

// Persistent state simulation per business
const memoryLicenseStatuses: Record<string, { status: string; licenseNumber?: string; expiryDate?: string; appliedDate?: string }> = {
  UDYAM_REGISTRATION: { status: 'approved', licenseNumber: 'UDYAM-UP-28-0098124', expiryDate: '2099-12-31' },
  GST_REGISTRATION: { status: 'approved', licenseNumber: '09AAACG1234F1Z5', expiryDate: '2099-12-31' },
  UP_SHOPS_ESTABLISHMENT: { status: 'renewal_due', licenseNumber: 'UP-SE-NOIDA-2021-994', expiryDate: '2026-03-31' },
  FSSAI_FOOD_LICENSE: { status: 'applied', licenseNumber: 'Pending Verification', appliedDate: '2026-02-14' },
  UPPCB_CONSENT_CTO: { status: 'not_applied' },
  FIRE_SAFETY_NOC: { status: 'not_applied' },
};

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Default enterprise context for personalization
    const enterprise = {
      legalName: 'Apex Precision Agro & Foodtech Enterprises',
      turnoverBand: 'small', // 'micro' | 'small' | 'medium'
      sector: 'Food Processing & Confectionery',
      state: 'UP',
      employeeCountBand: '20-49',
      employeeCount: 28,
      pan: 'AAACG1234F',
      gstin: '09AAACG1234F1Z5',
      udyamNumber: 'UDYAM-UP-28-0098124',
    };

    // Filter master licenses based on MSME class & sector
    const personalizedLicenses = MASTER_LICENSES.filter((lic) => {
      const criteria = lic.applicabilityCriteria;

      // 1. Check MSME tier (micro, small, medium)
      if (!criteria.msmeTiers.includes(enterprise.turnoverBand as any)) {
        return false;
      }

      // 2. Check employee threshold
      if (criteria.minEmployees && enterprise.employeeCount < criteria.minEmployees) {
        return false;
      }

      // 3. Check sector if specified
      if (criteria.sectors && !criteria.sectors.includes(enterprise.sector)) {
        return false;
      }

      return true;
    }).map((lic) => {
      const saved = memoryLicenseStatuses[lic.code] || { status: 'not_applied' };
      return {
        ...lic,
        currentStatus: saved.status,
        licenseNumber: saved.licenseNumber || null,
        expiryDate: saved.expiryDate || null,
        appliedDate: saved.appliedDate || null,
        // NSWS Pre-filled JSON payload for AI autofill assistant
        nswsAutofillData: {
          applicantName: user?.user_metadata?.full_name || 'Enterprise Authorized Signatory',
          enterpriseName: enterprise.legalName,
          msmeCategory: enterprise.turnoverBand.toUpperCase(),
          sector: enterprise.sector,
          pan: enterprise.pan,
          gstin: enterprise.gstin,
          udyamRegistrationNumber: enterprise.udyamNumber,
          jurisdictionState: enterprise.state,
          employeeCount: enterprise.employeeCount,
        },
      };
    });

    const activeCount = personalizedLicenses.filter((l) => l.currentStatus === 'approved').length;
    const renewalDueCount = personalizedLicenses.filter((l) => l.currentStatus === 'renewal_due').length;
    const actionRequiredCount = personalizedLicenses.filter((l) => l.currentStatus === 'not_applied' || l.currentStatus === 'expired').length;

    return NextResponse.json({
      success: true,
      data: {
        enterpriseProfile: enterprise,
        licenses: personalizedLicenses,
        summary: {
          totalApplicable: personalizedLicenses.length,
          activeLicenses: activeCount,
          renewalDueLicenses: renewalDueCount,
          actionRequiredLicenses: actionRequiredCount,
          complianceRate: Math.round((activeCount / personalizedLicenses.length) * 100),
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const { licenseCode, status, licenseNumber, expiryDate } = body;

    if (!licenseCode || !status) {
      return NextResponse.json({ success: false, error: 'Missing licenseCode or status' }, { status: 400 });
    }

    memoryLicenseStatuses[licenseCode] = {
      status,
      licenseNumber: licenseNumber || undefined,
      expiryDate: expiryDate || undefined,
      appliedDate: status === 'applied' ? new Date().toISOString().split('T')[0] : undefined,
    };

    return NextResponse.json({
      success: true,
      message: 'License tracking status updated successfully.',
      data: memoryLicenseStatuses[licenseCode],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
