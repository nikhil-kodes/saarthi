-- Saarthi Database Migration: 00005_seed_compliance_requirements.sql
-- Seeds initial Central Indian and Uttar Pradesh State regulatory requirements catalog.

INSERT INTO public.compliance_requirements (
  code,
  title,
  title_hi,
  description,
  description_hi,
  category,
  act_name,
  jurisdiction_country,
  jurisdiction_state,
  applicability_rules,
  frequency,
  due_day_offset,
  penalty_details,
  penalty_details_hi
) VALUES
-- 1. GST GSTR-1 Monthly
(
  'GST_GSTR1_MONTHLY',
  'GSTR-1 Monthly Outward Supplies Return',
  'जीएसटीआर-1 मासिक बिक्री रिटर्न',
  'Mandatory monthly statement of all outward supplies of goods and services for regular GST taxpayers.',
  'नियमित जीएसटी करदाताओं के लिए माल और सेवाओं की सभी बाहरी आपूर्ति का अनिवार्य मासिक विवरण।',
  'taxation',
  'Central Goods and Services Tax Act, 2017',
  'IN',
  NULL,
  '{"has_gstin": true, "filing_scheme": "monthly"}'::jsonb,
  'monthly',
  11,
  'Late fee of ₹50/day (₹20/day for NIL return) under Section 47 of CGST Act.',
  'सीजीएसटी अधिनियम की धारा 47 के तहत ₹50/दिन (शून्य रिटर्न के लिए ₹20/दिन) का विलंब शुल्क।'
),
-- 2. GST GSTR-3B Monthly
(
  'GST_GSTR3B_MONTHLY',
  'GSTR-3B Monthly Summary Return & Tax Payment',
  'जीएसटीआर-3बी मासिक सारांश रिटर्न और कर भुगतान',
  'Mandatory monthly self-assessed summary return of input tax credit availed, tax liability declared and paid.',
  'इनपुट टैक्स क्रेडिट, कर देनदारी और भुगतान का अनिवार्य मासिक स्व-मूल्यांकन रिटर्न।',
  'taxation',
  'Central Goods and Services Tax Act, 2017',
  'IN',
  NULL,
  '{"has_gstin": true, "filing_scheme": "monthly"}'::jsonb,
  'monthly',
  20,
  'Interest at 18% p.a. on delayed tax payment plus ₹50/day late fee.',
  'विलंबित कर भुगतान पर 18% प्रति वर्ष की दर से ब्याज और ₹50/दिन का विलंब शुल्क।'
),
-- 3. Udyam Annual Update
(
  'UDYAM_ANNUAL_UPDATE',
  'Udyam MSME Annual Information Update',
  'उद्यम एमएसएमई वार्षिक विवरण अद्यतन',
  'Annual mandatory update of turnover and plant & machinery investment on the official Udyam portal to maintain MSME priority classification.',
  'एमएसएमई प्राथमिकता वर्गीकरण बनाए रखने के लिए उद्यम पोर्टल पर टर्नओवर और निवेश का वार्षिक अद्यतन।',
  'corporate_and_msme',
  'Micro, Small and Medium Enterprises Development (MSMED) Act, 2006',
  'IN',
  NULL,
  '{"has_udyam": true}'::jsonb,
  'annual',
  90, -- June 30 (90 days post FY close)
  'Suspension of MSME priority benefits and public procurement preferences.',
  'एमएसएमई प्राथमिकता लाभों और सार्वजनिक खरीद वरीयता का निलंबन।'
),
-- 4. FSSAI Annual Return Form D1
(
  'FSSAI_ANNUAL_RETURN_D1',
  'FSSAI Annual Return (Form D-1)',
  'FSSAI वार्षिक रिटर्न (फॉर्म डी-1)',
  'Annual return filing for Food Business Operators (manufacturers, repackers, importers) detailing food category volumes and quantities.',
  'खाद्य व्यवसाय संचालकों के लिए वार्षिक रिटर्न जिसमें खाद्य श्रेणियों और मात्राओं का विवरण होता है।',
  'industry_specific',
  'Food Safety and Standards Act, 2006',
  'IN',
  NULL,
  '{"sector": "Food Processing & Confectionery"}'::jsonb,
  'annual',
  61, -- May 31 (61 days post FY close)
  'Late fee of ₹100 per day of delay up to a maximum equal to 5 times annual licence fee.',
  'विलंब के प्रति दिन ₹100 का शुल्क, जो वार्षिक लाइसेंस शुल्क के अधिकतम 5 गुना तक हो सकता है।'
),
-- 5. Income Tax Advance Tax - Q1
(
  'IT_ADVANCE_TAX_Q1',
  'Income Tax Advance Tax Installment (Q1 - 15%)',
  'आयकर अग्रिम कर पहली किस्त (Q1 - 15%)',
  'First installment of advance tax (15% of estimated total income tax liability) for the assessment year.',
  'आकलन वर्ष के लिए अनुमानित कुल आयकर देनदारी की पहली किस्त (15%)।',
  'taxation',
  'Income Tax Act, 1961',
  'IN',
  NULL,
  '{"min_turnover": "micro"}'::jsonb,
  'quarterly',
  15, -- June 15
  'Interest penalty at 1% per month under Section 234C on shortfall of advance tax.',
  'अग्रिम कर की कमी पर धारा 234C के तहत प्रति माह 1% की दर से ब्याज दंड।'
),
-- 6. Income Tax Advance Tax - Q2
(
  'IT_ADVANCE_TAX_Q2',
  'Income Tax Advance Tax Installment (Q2 - 45%)',
  'आयकर अग्रिम कर दूसरी किस्त (Q2 - 45%)',
  'Second cumulative installment of advance tax (45% of estimated total income tax liability).',
  'अनुमानित कुल आयकर देनदारी की दूसरी संचयी किस्त (45%)।',
  'taxation',
  'Income Tax Act, 1961',
  'IN',
  NULL,
  '{"min_turnover": "micro"}'::jsonb,
  'quarterly',
  15, -- Sept 15
  'Interest penalty at 1% per month under Section 234C on shortfall.',
  'कमी पर धारा 234C के तहत प्रति माह 1% की दर से ब्याज दंड।'
),
-- 7. Income Tax Advance Tax - Q3
(
  'IT_ADVANCE_TAX_Q3',
  'Income Tax Advance Tax Installment (Q3 - 75%)',
  'आयकर अग्रिम कर तीसरी किस्त (Q3 - 75%)',
  'Third cumulative installment of advance tax (75% of estimated total income tax liability).',
  'अनुमानित कुल आयकर देनदारी की तीसरी संचयी किस्त (75%)।',
  'taxation',
  'Income Tax Act, 1961',
  'IN',
  NULL,
  '{"min_turnover": "micro"}'::jsonb,
  'quarterly',
  15, -- Dec 15
  'Interest penalty at 1% per month under Section 234C on shortfall.',
  'कमी पर धारा 234C के तहत प्रति माह 1% की दर से ब्याज दंड।'
),
-- 8. Income Tax Advance Tax - Q4
(
  'IT_ADVANCE_TAX_Q4',
  'Income Tax Advance Tax Installment (Q4 - 100%)',
  'आयकर अग्रिम कर चौथी किस्त (Q4 - 100%)',
  'Final installment of advance tax (100% of estimated income tax liability).',
  'अनुमानित आयकर देनदारी की अंतिम किस्त (100%)।',
  'taxation',
  'Income Tax Act, 1961',
  'IN',
  NULL,
  '{"min_turnover": "micro"}'::jsonb,
  'quarterly',
  15, -- March 15
  'Interest penalty under Section 234B and 234C.',
  'धारा 234B और 234C के तहत ब्याज दंड।'
),
-- 9. EPF Monthly ECR
(
  'EPF_MONTHLY_ECR',
  'EPF Monthly Electronic Challan cum Return (ECR)',
  'ईपीएफ मासिक इलेक्ट्रॉनिक चालान सह रिटर्न (ECR)',
  'Monthly filing and remittance of Employees Provident Fund contributions for units with 20 or more staff.',
  '20 या अधिक कर्मचारियों वाली इकाइयों के लिए कर्मचारी भविष्य निधि योगदान का मासिक विवरण व प्रेषण।',
  'labor_and_employment',
  'Employees Provident Funds and Miscellaneous Provisions Act, 1952',
  'IN',
  NULL,
  '{"min_employees": 20}'::jsonb,
  'monthly',
  15,
  'Damages ranging from 5% to 25% p.a. under Section 14B plus 12% interest under Section 7Q.',
  'धारा 14B के तहत 5% से 25% प्रति वर्ष तक हर्जाना और धारा 7Q के तहत 12% ब्याज।'
),
-- 10. UP Shops & Commercial Establishments Annual Renewal
(
  'UP_SHOPS_ANNUAL_RENEWAL',
  'UP Shops & Commercial Establishments Registration Renewal',
  'उत्तर प्रदेश दुकान एवं वाणिज्यिक प्रतिष्ठान पंजीकरण नवीनीकरण',
  'Annual renewal of establishment registration under Uttar Pradesh state labor rules for operational commercial premises.',
  'व्यावसायिक परिसरों के लिए उत्तर प्रदेश राज्य श्रम नियमों के तहत प्रतिष्ठान पंजीकरण का वार्षिक नवीनीकरण।',
  'labor_and_employment',
  'Uttar Pradesh Dookan Aur Vanijya Adhishthan Adhiniyam, 1962',
  'IN',
  'UP',
  '{"jurisdiction_state": "UP"}'::jsonb,
  'annual',
  31, -- Dec 31
  'Penal action by State Labor Inspectorate and fines under Section 31.',
  'राज्य श्रम निरीक्षणालय द्वारा दंडात्मक कार्रवाई और धारा 31 के तहत जुर्माना।'
),
-- 11. UP Pollution Control Board CTO Renewal
(
  'UPPCB_CTO_RENEWAL',
  'UPPCB Consent to Operate (CTO) Renewal',
  'उत्तर प्रदेश प्रदूषण नियंत्रण बोर्ड संचालन सहमति (CTO) नवीनीकरण',
  'Periodic renewal of air and water consent to operate for manufacturing, chemical, and leather processing units in Uttar Pradesh.',
  'उत्तर प्रदेश में विनिर्माण, रसायन और चमड़ा प्रसंस्करण इकाइयों के लिए संचालन हेतु वायु और जल सहमति का नवीनीकरण।',
  'environmental',
  'Water (Prevention & Control of Pollution) Act, 1974 & Air Act, 1981',
  'IN',
  'UP',
  '{"jurisdiction_state": "UP", "sectors": ["Leather & Footwear", "Chemicals & Pharmaceuticals", "Food Processing & Confectionery"]}'::jsonb,
  'annual',
  90,
  'Closure notices under Section 33A of Water Act and heavy environmental compensation tariffs.',
  'जल अधिनियम की धारा 33A के तहत बंदी नोटिस और भारी पर्यावरणीय मुआवजा शुल्क।'
)
ON CONFLICT (code) DO NOTHING;
