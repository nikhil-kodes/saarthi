-- Saarthi Database Migration: 00007_seed_regulatory_updates.sql
-- Seeds initial regulatory circulars, notifications, and advisories for RAG grounding.

INSERT INTO public.regulatory_updates (
  title,
  title_hi,
  source,
  source_url,
  published_at,
  effective_date,
  category,
  jurisdiction_state,
  summary_en,
  summary_hi,
  raw_content,
  impacted_sectors,
  impacted_thresholds
) VALUES
-- 1. GST Invoice Matching Advisory
(
  'CBIC Notification: Mandatory E-Invoicing Thresholds & ITC Verification',
  'सीबीआईसी अधिसूचना: अनिवार्य ई-चालान और आईटीसी सत्यापन नियम',
  'CBIC / GSTN',
  'https://taxinformation.cbic.gov.in/notifications/04-2024',
  NOW() - INTERVAL '3 days',
  '2026-04-01',
  'taxation',
  NULL,
  'CBIC mandates strict 100% GSTR-2B automated matching for Input Tax Credit claims. Taxpayers with aggregate turnover above ₹5 Crore must issue B2B e-invoices with valid IRN numbers.',
  'सीबीआईसी ने इनपुट टैक्स क्रेडिट के लिए GSTR-2B से 100% मिलान अनिवार्य किया है। ₹5 करोड़ से अधिक वार्षिक कारोबार वाले व्यवसायों को अनिवार्य रूप से ई-इनवॉइस बनाना होगा।',
  'In exercise of the powers conferred by section 164 of the Central Goods and Services Tax Act, 2017, the Central Government hereby clarifies that no registered person shall avail input tax credit in respect of any supply of goods or services unless the details of such invoice have been furnished by the supplier in GSTR-1 and communicated to the recipient in Form GSTR-2B.',
  '["All Sectors", "Manufacturing", "Retail Trade & Wholesale"]'::jsonb,
  '{"min_turnover": "small", "annual_turnover_cr": 5}'::jsonb
),
-- 2. FSSAI Labeling & Display Regulations
(
  'FSSAI Advisory: Front-of-Pack Nutritional Labeling & Devanagari Display',
  'FSSAI सलाह: खाद्य पैकेटों पर पोषण लेबलिंग और अनिवार्य देवनागरी प्रदर्शन',
  'Food Safety and Standards Authority of India (FSSAI)',
  'https://fssai.gov.in/advisories/fopnl-2026',
  NOW() - INTERVAL '7 days',
  '2026-06-01',
  'industry_specific',
  NULL,
  'FSSAI mandates clear declarations of total sugar, saturated fat, and sodium per 100g on the principal display panel. Hindi / regional language font size must be at least 1.5mm.',
  'FSSAI ने सभी पैक किए गए खाद्य उत्पादों पर चीनी, वसा और सोडियम की स्पष्ट घोषणा अनिवार्य की है। हिंदी/क्षेत्रीय भाषा का फ़ॉन्ट आकार न्यूनतम 1.5 मिमी होना चाहिए।',
  'Food Safety and Standards (Labeling and Display) Amendment Regulations require all pre-packaged food manufacturers to display key nutritional values and allergy warnings in both English and Devanagari script.',
  '["Food Processing & Confectionery", "Agriculture & Allied Activities"]'::jsonb,
  '{"sectors": ["Food Processing & Confectionery"]}'::jsonb
),
-- 3. UP MSME Promotion Policy Subsidy Guidelines
(
  'UP MSME Promotion Policy: Capital Subsidy & Stamp Duty Exemption for Manufacturing Units',
  'उत्तर प्रदेश एमएसएमई संवर्धन नीति: पूंजीगत सब्सिडी एवं स्टांप शुल्क छूट',
  'Directorate of Industries, Government of Uttar Pradesh',
  'https://upmsme.in/schemes/promotion-policy-2026',
  NOW() - INTERVAL '12 days',
  '2026-01-01',
  'corporate_and_msme',
  'UP',
  'UP Government announces up to 25% capital investment subsidy (max ₹4 Crore) for micro and small manufacturing units established in Purvanchal, Bundelkhand, and Madhyanchal regions, along with 100% stamp duty exemption on industrial land acquisition.',
  'उत्तर प्रदेश सरकार ने पूर्वांचल, बुंदेलखंड और मध्यांचल में स्थापित सूक्ष्म एवं लघु विनिर्माण इकाइयों के लिए 25% तक पूंजीगत सब्सिडी (अधिकतम ₹4 करोड़) और 100% स्टांप शुल्क छूट की घोषणा की है।',
  'Under the Uttar Pradesh Micro, Small and Medium Enterprises Promotion Policy, eligible units with valid Udyam registration can submit online applications on Nivesh Mitra for capital subsidy reimbursement within 6 months of commercial production commencement.',
  '["Textiles & Apparel", "Leather & Footwear", "Automotive & Engineering Components", "Chemicals & Pharmaceuticals"]'::jsonb,
  '{"jurisdiction_state": "UP", "enterprise_types": ["micro", "small"]}'::jsonb
);
