-- Saarthi Seed Migration: 00015_seed_creator_profiles.sql
-- Seed verified vernacular creators across Uttar Pradesh for MSME branding.

INSERT INTO public.creator_profiles (
  display_name, handle, platform, primary_language, follower_count, niche, pan, is_verified, bio, bio_hi, rate_card
) VALUES
(
  'Purvanchal Food & Zaika',
  '@purvanchal_zaika',
  'youtube',
  'bho',
  185000,
  'food_fmcg',
  'ABCDE1234F',
  true,
  'Exploring local street foods, spices, and packaged snacks across Varanasi, Gorakhpur & Eastern UP.',
  'वाराणसी, गोरखपुर और पूर्वांचल के प्रसिद्ध खाद्य पदार्थों, मसालों और स्नैक्स के प्रमाणित व्लॉगर।',
  '{"reel_video": 4500, "dedicated_video": 12000}'::jsonb
),
(
  'UP Kisan & Modern Agri Tech',
  '@up_kisan_tech',
  'youtube',
  'hi',
  320000,
  'agritech',
  'BCDEF2345G',
  true,
  'Demonstrating modern agricultural implements, bio-fertilizers, and food processing machinery for farmers.',
  'किसानों के लिए आधुनिक कृषि उपकरण, जैविक खाद और खाद्य प्रसंस्करण मशीनों के मार्गदर्शक।',
  '{"reel_video": 6000, "dedicated_video": 18000}'::jsonb
),
(
  'Lucknowi Chikankari & Artisans',
  '@lucknow_crafts',
  'instagram',
  'awa',
  140000,
  'handloom_crafts',
  'CDEFG3456H',
  true,
  'Promoting authentic ODOP handlooms, Zardozi crafts, and ethical artisan apparel from Lucknow and Sitapur.',
  'लखनऊ और सीतापुर के ओडीओपी (ODOP) हथकरघा, चिकनकारी और हस्तशिल्प को बढ़ावा देने वाला मंच।',
  '{"reel_video": 5000, "dedicated_video": 14000}'::jsonb
),
(
  'Desi SME & Industrial Machinery',
  '@desi_sme_factory',
  'youtube',
  'hi',
  210000,
  'manufacturing_sme',
  'DEFGH4567I',
  true,
  'Factory tours and raw material sourcing guide for small manufacturing units in Kanpur, Noida & Meerut.',
  'कानपुर, नोएडा और मेरठ के विनिर्माण कारखानों और कच्चा माल आपूर्तिकर्ताओं का व्यावहारिक विश्लेषण।',
  '{"reel_video": 7500, "dedicated_video": 20000}'::jsonb
),
(
  'Bundelkhand Dairy & Rural Organic',
  '@bundelkhand_dairy',
  'instagram',
  'hi',
  95000,
  'lifestyle',
  'EFGHI5678J',
  true,
  'Showcasing pure A2 desi ghee, organic honey, and rural dairy cooperatives from Jhansi and Lalitpur.',
  'झांसी और ललितपुर के शुद्ध देसी घी, जैविक शहद और ग्रामीण डेयरी उत्पादों का प्रामाणिक प्रचार।',
  '{"reel_video": 3500, "dedicated_video": 9000}'::jsonb
)
ON CONFLICT DO NOTHING;
