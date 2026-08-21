-- Saarthi Database Migration: 00010_seed_government_schemes.sql
-- Seeds Central and Uttar Pradesh State government MSME schemes and subsidies.

INSERT INTO public.government_schemes (
  code,
  title,
  title_hi,
  ministry,
  description,
  description_hi,
  eligibility_criteria,
  max_benefit_amount,
  benefit_type,
  application_url,
  jurisdiction_state,
  is_active
) VALUES
-- 1. PMEGP
(
  'CENTRAL_PMEGP',
  'Prime Minister Employment Generation Programme (PMEGP)',
  'प्रधानमंत्री रोजगार सृजन कार्यक्रम (PMEGP)',
  'Ministry of Micro, Small and Medium Enterprises',
  'Credit-linked subsidy scheme offering up to 35% margin money subsidy on project cost for setting up new micro-enterprises in manufacturing and services sectors.',
  'विनिर्माण और सेवा क्षेत्र में नए सूक्ष्म उद्यम स्थापित करने के लिए परियोजना लागत पर 35% तक की सब्सिडी प्रदान करने वाली क्रेडिट-लिंक्ड योजना।',
  '{"enterprise_types": ["micro"], "sectors": ["Manufacturing", "Services"], "requires_udyam": true, "max_project_cost": 5000000}'::jsonb,
  1750000.00,
  'capital_subsidy',
  'https://www.kviconline.gov.in/pmegpeportal',
  NULL,
  TRUE
),
-- 2. Mudra Loan (PMMY)
(
  'CENTRAL_MUDRA',
  'Pradhan Mantri Mudra Yojana (PMMY) - Tarun Category',
  'प्रधानमंत्री मुद्रा योजना (PMMY) - तरुण श्रेणी',
  'Department of Financial Services, Ministry of Finance',
  'Collateral-free institutional credit up to ₹10 Lakhs for small business units for purchase of machinery, working capital, and business expansion.',
  'मशीनरी की खरीद, कार्यशील पूंजी और व्यापार विस्तार के लिए छोटे व्यवसायों को ₹10 लाख तक का बिना किसी गारंटी का संस्थागत ऋण।',
  '{"enterprise_types": ["micro", "small"], "requires_pan": true, "min_credit_score": 650}'::jsonb,
  1000000.00,
  'collateral_free_loan',
  'https://www.mudra.org.in',
  NULL,
  TRUE
),
-- 3. CGTMSE Credit Guarantee
(
  'CENTRAL_CGTMSE',
  'Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)',
  'सूक्ष्म एवं लघु उद्यम क्रेडिट गारंटी फंड ट्रस्ट (CGTMSE)',
  'Ministry of MSME & SIDBI',
  'Provides 75% to 85% credit guarantee cover to scheduled commercial banks and NBFCs for collateral-free business loans up to ₹5 Crore.',
  'अनुसूचित वाणिज्यिक बैंकों और एनबीएफसी को ₹5 करोड़ तक के संपार्श्विक-मुक्त व्यापार ऋणों के लिए 75% से 85% क्रेडिट गारंटी कवर प्रदान करता है।',
  '{"enterprise_types": ["micro", "small"], "requires_udyam": true, "requires_gstin": true}'::jsonb,
  50000000.00,
  'collateral_free_loan',
  'https://www.cgtmse.in',
  NULL,
  TRUE
),
-- 4. UP MSME 25% Capital Investment Subsidy
(
  'UP_MSME_CAPITAL_SUBSIDY',
  'UP MSME Promotion Policy: Capital Investment Subsidy',
  'उत्तर प्रदेश एमएसएमई संवर्धन नीति: पूंजीगत निवेश सब्सिडी',
  'Directorate of Industries, Government of Uttar Pradesh',
  'Capital investment subsidy up to 25% (up to ₹4 Crore) on plant and machinery for micro and small manufacturing units established in Purvanchal and Bundelkhand districts.',
  'पूर्वांचल और बुंदेलखंड जिलों में स्थापित सूक्ष्म एवं लघु विनिर्माण इकाइयों के लिए संयंत्र एवं मशीनरी पर 25% (अधिकतम ₹4 करोड़) तक पूंजीगत निवेश सब्सिडी।',
  '{"jurisdiction_state": "UP", "enterprise_types": ["micro", "small"], "sectors": ["Manufacturing", "Food Processing & Confectionery", "Textiles & Apparel", "Leather & Footwear"], "requires_udyam": true}'::jsonb,
  40000000.00,
  'capital_subsidy',
  'https://upmsme.in',
  'UP',
  TRUE
),
-- 5. UP Interest Subvention Scheme
(
  'UP_INTEREST_SUBVENTION',
  'Uttar Pradesh MSME 5% Interest Subvention Scheme',
  'उत्तर प्रदेश एमएसएमई 5% ब्याज उपादान योजना',
  'MSME & Export Promotion Department, UP',
  'Provides 5% annual interest rebate on term loans taken from scheduled commercial banks for micro and small enterprises for a period of up to 5 years.',
  'सूक्ष्म और लघु उद्यमों के लिए 5 वर्षों तक की अवधि के लिए अनुसूचित वाणिज्यिक बैंकों से लिए गए सावधि ऋणों पर 5% वार्षिक ब्याज छूट प्रदान करता है।',
  '{"jurisdiction_state": "UP", "enterprise_types": ["micro", "small"], "requires_udyam": true, "requires_pan": true}'::jsonb,
  2500000.00,
  'interest_subvention',
  'https://niveshmitra.up.nic.in',
  'UP',
  TRUE
);
