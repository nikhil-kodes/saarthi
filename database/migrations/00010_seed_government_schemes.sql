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
  'Credit-linked subsidy scheme offering up to 35% margin money subsidy on project cost for setting up new micro-enterprises in manufacturing (up to ₹50L) and services (up to ₹20L).',
  'विनिर्माण (₹50 लाख तक) और सेवा क्षेत्र (₹20 लाख तक) में नए सूक्ष्म उद्यम स्थापित करने के लिए 15% से 35% तक मार्जिन मनी सब्सिडी।',
  '{"enterprise_types": ["micro", "small"], "sectors": ["Manufacturing", "Services"], "requires_udyam": true, "max_project_cost": 5000000}'::jsonb,
  1750000.00,
  'capital_subsidy',
  'https://www.kviconline.gov.in/pmegpeportal',
  NULL,
  TRUE
),
-- 2. CGTMSE Credit Guarantee
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
-- 3. MSME ZED Certification Scheme
(
  'CENTRAL_ZED_CERTIFICATION',
  'MSME Sustainable (ZED) Certification Scheme',
  'एमएसएमई शून्य दोष शून्य प्रभाव (ZED) प्रमाणन योजना',
  'Ministry of MSME, Government of India',
  'Financial subsidy up to 80% on Bronze, Silver, and Gold ZED quality and environmental sustainability certification fees, plus ₹5 Lakhs handholding support.',
  'गुणवत्ता और पर्यावरण अनुकूल विनिर्माण के लिए कांस्य, रजत एवं स्वर्ण ZED प्रमाणन शुल्क पर 80% तक सब्सिडी और ₹5 लाख तक तकनीकी परामर्श सहायता।',
  '{"enterprise_types": ["micro", "small", "medium"], "requires_udyam": true}'::jsonb,
  500000.00,
  'capital_subsidy',
  'https://zed.msme.gov.in',
  NULL,
  TRUE
),
-- 4. PM Vishwakarma Scheme
(
  'CENTRAL_PM_VISHWAKARMA',
  'PM Vishwakarma Artisan & Craftsman Financial Assistance',
  'प्रधानमंत्री विश्वकर्मा शिल्पकार एवं कारीगर योजना',
  'Ministry of MSME & Ministry of Skill Development',
  'Financial grant of ₹15,000 toolkits plus ₹3 Lakhs collateral-free credit at 5% concessional interest rate in two tranches with digital incentive cashback.',
  '18 पारंपरिक ट्रेडों के शिल्पकारों को ₹15,000 टूलकिट अनुदान तथा 5% रियायती ब्याज दर पर ₹3 लाख तक का कोलैटरल-फ्री ऋण।',
  '{"enterprise_types": ["micro"], "requires_aadhaar": true}'::jsonb,
  300000.00,
  'collateral_free_loan',
  'https://pmvishwakarma.gov.in',
  NULL,
  TRUE
),
-- 5. Mudra Loan (PMMY)
(
  'CENTRAL_MUDRA',
  'Pradhan Mantri Mudra Yojana (PMMY) - Shishu, Kishore & Tarun',
  'प्रधानमंत्री मुद्रा योजना (PMMY) - शिशु, किशोर एवं तरुण श्रेणी',
  'Department of Financial Services, Ministry of Finance',
  'Collateral-free institutional credit up to ₹20 Lakhs for small business units for purchase of machinery, working capital, and business expansion.',
  'मशीनरी की खरीद, कार्यशील पूंजी और व्यापार विस्तार के लिए छोटे व्यवसायों को ₹20 लाख तक का बिना किसी गारंटी का संस्थागत ऋण।',
  '{"enterprise_types": ["micro", "small"], "requires_pan": true}'::jsonb,
  2000000.00,
  'collateral_free_loan',
  'https://www.mudra.org.in',
  NULL,
  TRUE
),
-- 6. Stand-Up India Scheme
(
  'CENTRAL_STANDUP_INDIA',
  'Stand-Up India Scheme for Women and SC/ST Entrepreneurs',
  'स्टैंड-अप इंडिया योजना (महिला एवं SC/ST उद्यमी)',
  'Department of Financial Services / SIDBI',
  'Bank loans between ₹10 Lakhs and ₹1 Crore for setting up greenfield manufacturing, service, or trading enterprises by women and SC/ST promoters.',
  'ग्रीनफील्ड विनिर्माण, सेवा या व्यापार उद्यम स्थापित करने के लिए ₹10 लाख से ₹1 करोड़ तक का बैंक ऋण।',
  '{"enterprise_types": ["micro", "small"], "requires_pan": true, "promoter_category": ["Women", "SC", "ST"]}'::jsonb,
  10000000.00,
  'collateral_free_loan',
  'https://www.standupmitra.in',
  NULL,
  TRUE
),
-- 7. MSME Samadhaan Delayed Payment Recovery
(
  'CENTRAL_MSME_SAMADHAAN',
  'MSME Samadhaan Delayed Payment Legal Recovery & 3x Interest',
  'एमएसएमई समाधान विलंबित भुगतान वसूली एवं 3 गुना ब्याज समाधान',
  'Office of Development Commissioner (MSME)',
  'Statutory arbitration for recovery of delayed payments from corporate and PSU buyers with mandatory monthly compound interest at 3 times RBI bank rate.',
  '45 दिनों से अधिक के बकाया भुगतानों पर आरबीआई बैंक दर के 3 गुना चक्रवृद्धि ब्याज सहित कानूनी वसूली सहायता।',
  '{"enterprise_types": ["micro", "small"], "requires_udyam": true, "requires_gstin": true}'::jsonb,
  10000000.00,
  'interest_subvention',
  'https://samadhaan.msme.gov.in',
  NULL,
  TRUE
),
-- 8. UP MSME 25% Capital Investment Subsidy
(
  'UP_MSME_CAPITAL_SUBSIDY',
  'UP MSME Promotion Policy: 25% Capital Investment Subsidy',
  'उत्तर प्रदेश एमएसएमई संवर्धन नीति: 25% पूंजीगत निवेश सब्सिडी',
  'Directorate of Industries, Government of Uttar Pradesh',
  'Capital investment subsidy up to 25% (up to ₹4 Crore) on plant and machinery for micro and small manufacturing units established in Purvanchal and Bundelkhand districts.',
  'पूर्वांचल और बुंदेलखंड जिलों में स्थापित सूक्ष्म एवं लघु विनिर्माण इकाइयों के लिए संयंत्र एवं मशीनरी पर 25% (अधिकतम ₹4 करोड़) तक पूंजीगत निवेश सब्सिडी।',
  '{"jurisdiction_state": "UP", "enterprise_types": ["micro", "small"], "sectors": ["Manufacturing", "Food Processing", "Textiles", "Engineering"], "requires_udyam": true}'::jsonb,
  40000000.00,
  'capital_subsidy',
  'https://upmsme.in',
  'UP',
  TRUE
),
-- 9. UP One District One Product (ODOP) Margin Money Scheme
(
  'UP_ODOP_MARGIN_MONEY',
  'UP One District One Product (ODOP) Margin Money Scheme',
  'उत्तर प्रदेश एक जिला एक उत्पाद (ODOP) मार्जिन मनी योजना',
  'Department of MSME & Export Promotion, Uttar Pradesh',
  'Financial margin grant of 10% to 25% (up to ₹20 Lakhs) for setting up and modernizing specialized district craft, leather, food, and manufacturing clusters across all 75 UP districts.',
  'उत्तर प्रदेश के 75 जनपदों के विशिष्ट ओडीओपी उत्पादों (जैसे मुरादाबाद पीतल, भदोही कालीन, आगरा चमड़ा, कन्नौज इत्र) के लिए ₹20 लाख तक का मार्जिन मनी अनुदान।',
  '{"jurisdiction_state": "UP", "enterprise_types": ["micro", "small"], "requires_udyam": true}'::jsonb,
  2000000.00,
  'capital_subsidy',
  'https://odopup.in',
  'UP',
  TRUE
),
-- 10. UP Mukhyamantri Yuva Swarojgar Yojana (MMYSY)
(
  'UP_MMYSY_SWAROJGAR',
  'Mukhyamantri Yuva Swarojgar Yojana (MMYSY)',
  'मुख्यमंत्री युवा स्वरोजगार योजना (MMYSY)',
  'Department of Industries, Government of Uttar Pradesh',
  '25% margin money capital subsidy (up to ₹6.25 Lakhs for industrial projects up to ₹25L, up to ₹2.5 Lakhs for service sector projects up to ₹10L) for educated youth and first-generation entrepreneurs in UP.',
  'उत्तर प्रदेश के शिक्षित युवाओं के लिए उद्योग क्षेत्र में ₹25 लाख तक के प्रोजेक्ट पर ₹6.25 लाख तथा सेवा क्षेत्र में ₹10 लाख तक के प्रोजेक्ट पर ₹2.5 लाख तक की 25% मार्जिन सब्सिडी।',
  '{"jurisdiction_state": "UP", "enterprise_types": ["micro"], "min_age": 18, "max_age": 40}'::jsonb,
  625000.00,
  'capital_subsidy',
  'https://diupmsme.upsdc.gov.in',
  'UP',
  TRUE
),
-- 11. UP MSME 5% Annual Interest Subvention Scheme
(
  'UP_INTEREST_SUBVENTION',
  'Uttar Pradesh MSME 5% Annual Interest Subvention Scheme',
  'उत्तर प्रदेश एमएसएमई 5% वार्षिक ब्याज उपादान योजना',
  'MSME & Export Promotion Department, UP',
  'Provides 5% annual interest rebate on term loans taken from scheduled commercial banks for micro and small enterprises for a period of up to 5 years (up to ₹25 Lakhs total).',
  'सूक्ष्म और लघु उद्यमों के लिए 5 वर्षों तक की अवधि के लिए अनुसूचित वाणिज्यिक बैंकों से लिए गए सावधि ऋणों पर 5% वार्षिक ब्याज छूट (अधिकतम ₹25 लाख)।',
  '{"jurisdiction_state": "UP", "enterprise_types": ["micro", "small"], "requires_udyam": true, "requires_pan": true}'::jsonb,
  2500000.00,
  'interest_subvention',
  'https://niveshmitra.up.nic.in',
  'UP',
  TRUE
),
-- 12. UP MSME Industrial Stamp Duty & Land Exemption
(
  'UP_STAMP_DUTY_EXEMPTION',
  'UP MSME Industrial Land Stamp Duty & Registration Exemption',
  'उत्तर प्रदेश एमएसएमई औद्योगिक भूमि स्टाम्प शुल्क एवं पंजीकरण छूट',
  'Stamp & Registration Department, Uttar Pradesh',
  '100% stamp duty exemption in Purvanchal & Bundelkhand, 75% in Madhyanchal, and 50% in Paschimanchal on land purchase or lease for establishing new MSME industrial units.',
  'पूर्वांचल व बुंदेलखंड में 100%, मध्यांचल में 75% तथा पश्चिमांचल में 50% स्टाम्प शुल्क में पूर्ण छूट।',
  '{"jurisdiction_state": "UP", "enterprise_types": ["micro", "small", "medium"], "requires_udyam": true}'::jsonb,
  5000000.00,
  'capital_subsidy',
  'https://niveshmitra.up.nic.in',
  'UP',
  TRUE
);

