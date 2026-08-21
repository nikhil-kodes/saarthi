-- Saarthi Seed Migration: 00013_seed_supplier_catalog.sql
-- Seed industrial B2B products for verified UP suppliers.

DO $$
DECLARE
  v_biz_id UUID;
BEGIN
  SELECT id INTO v_biz_id FROM public.businesses LIMIT 1;

  IF v_biz_id IS NOT NULL THEN
    INSERT INTO public.supplier_products (
      business_id, title, title_hi, description, category, unit, unit_price, hsn_code, gst_rate, min_order_quantity, lead_time_days, is_active
    ) VALUES
    (
      v_biz_id,
      'Heavy Duty 5-Ply Corrugated Packaging Boxes',
      'मजबूत 5-प्लाई नालीदार पैकेजिंग बॉक्स',
      'Industrial grade 150 GSM corrugated cardboard shipping boxes for food and consumer electronics.',
      'packaging',
      'box',
      28.50,
      '48191010',
      18.00,
      500,
      5,
      true
    ),
    (
      v_biz_id,
      'Food Grade Multi-Layer Barrier Packaging Film (Roll)',
      'खाद्य ग्रेड मल्टी-लेयर पैकेजिंग फिल्म (रोल)',
      'High-barrier sealable laminate film for snacks, spices, and confectioneries. FSSAI & ISO certified.',
      'packaging',
      'kg',
      195.00,
      '39201019',
      18.00,
      100,
      7,
      true
    ),
    (
      v_biz_id,
      'Cold-Pressed Kacchi Ghani Mustard Oil Raw Base',
      'कोल्ड-प्रेस कच्ची घानी सरसों का तेल बेस',
      'Agmark certified bulk unrefined mustard oil for commercial food processing and pickling.',
      'raw_ingredients',
      'liter',
      135.00,
      '15149110',
      5.00,
      200,
      4,
      true
    ),
    (
      v_biz_id,
      'Organic Certified Sugarcane Jaggery Powder',
      'जैविक प्रमाणित गुड़ पाउडर (थोक)',
      'Pure organic sulfur-free jaggery powder processed from Muzaffarnagar sugarcane farms.',
      'raw_ingredients',
      'kg',
      52.00,
      '17011490',
      5.00,
      500,
      3,
      true
    ),
    (
      v_biz_id,
      'SS 304 Stainless Steel Industrial Mixing Tank (500L)',
      'एसएस 304 स्टेनलेस स्टील इंडस्ट्रियल मिक्सिंग टैंक (500 लीटर)',
      'Food-grade stainless steel mixing vessel with motorized agitator for dairy and liquid processing.',
      'machinery',
      'piece',
      85000.00,
      '84798200',
      18.00,
      1,
      14,
      true
    ),
    (
      v_biz_id,
      'Heavy Duty Industrial Nitrile Chemical Safety Gloves (Pack of 50)',
      'इंडस्ट्रियल नाइट्राइल केमिकल सेफ्टी ग्लव्स (50 का पैक)',
      'CE certified acid and solvent resistant safety gloves for factory shop-floor workers.',
      'safety_gear',
      'box',
      1450.00,
      '40151900',
      18.00,
      10,
      3,
      true
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
