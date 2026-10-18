-- Construction E-commerce Marketplace - Seed Data
-- Uses standard UUIDv4 format compatible with Postgres uuid columns

-- 1. SEED CATEGORIES
insert into public.categories (id, slug, name_en, name_ta, description_en, description_ta, sort_order, is_active)
values
  ('c0000000-0000-4000-8000-000000000001'::uuid, 'cement-concrete', 'Cement & Concrete', 'சிமெண்ட் மற்றும் கான்கிரீட்', 'OPC 53, PPC, ready-mix concrete, rapid-hardening cement', 'OPC 53, PPC, ரெடிமிக்ஸ் கான்கிரீட்', 1, true),
  ('c0000000-0000-4000-8000-000000000002'::uuid, 'structural-steel', 'Structural Steel & TMT Bars', 'கட்டமைப்பு எஃகு மற்றும் TMT கம்பிகள்', 'Fe 500D, Fe 550D corrosion-resistant rebars, MS beams, angles', 'Fe 500D, Fe 550D அரிப்பு எதிர்ப்பு கம்பிகள்', 2, true),
  ('c0000000-0000-4000-8000-000000000003'::uuid, 'bricks-masonry', 'Bricks & Masonry Aggregates', 'செங்கற்கள் மற்றும் கொத்து பொருட்கள்', 'Wirecut red bricks, AAC lightweight blocks, river sand, M-sand, gravel', 'வயர் கட் சிவப்பு செங்கற்கள், AAC பிளாக்குகள்', 3, true),
  ('c0000000-0000-4000-8000-000000000004'::uuid, 'heavy-machinery', 'Plant Machinery & Equipment', 'கனரக இயந்திரங்கள் மற்றும் உபகரணங்கள்', 'Diesel concrete mixers, earthmovers, plate compactors, bar bending machines', 'டீசல் கான்கிரீட் கலவை இயந்திரங்கள்', 4, true),
  ('c0000000-0000-4000-8000-000000000005'::uuid, 'plumbing-drainage', 'Plumbing & Drainage', 'குழாய்கள் மற்றும் வடிகால் அமைப்புகள்', 'Industrial UPVC pipes, CPVC, underground sewage lines, booster pumps', 'தொழில்துறை UPVC குழாய்கள், CPVC', 5, true),
  ('c0000000-0000-4000-8000-000000000006'::uuid, 'electrical-infrastructure', 'Heavy Electrical & Power', 'கனரக மின்சாரம் மற்றும் கேபிள்கள்', 'Armoured copper cables, 3-phase distribution boards, diesel generators', 'ஆர்மர்டு செம்பு கேபிள்கள்', 6, true)
on conflict (id) do update set
  name_en = excluded.name_en,
  name_ta = excluded.name_ta;

-- 2. SEED APPROVED PLATFORM PRODUCTS
insert into public.products (
  id, owner_type, sku, slug, category_id, title_en, title_ta, description_en, description_ta,
  unit_code, currency_code, unit_price_minor, minimum_order_quantity, attributes,
  source_status, availability_status, is_active
)
values
  (
    'd0000000-0000-4000-8000-000000000001'::uuid, 'platform', 'CEM-OPC53-50KG', 'ultratech-super-opc-53-grade-cement',
    'c0000000-0000-4000-8000-000000000001'::uuid, 'UltraTech Super OPC 53 Grade Cement (50kg Bag)', 'அல்ட்ராடெக் சூப்பர் OPC 53 கிரேடு சிமெண்ட் (50 கிலோ பை)',
    'High early strength Ordinary Portland Cement engineered for multi-storey high-rises, bridges, and heavy industrial slabs. Conforms to IS 12269.',
    'அதிக ஆரம்ப வலிமை கொண்ட ஆர்டினரி போர்ட்லேண்ட் சிமெண்ட். பல அடுக்கு கட்டிடங்கள், பாலங்களுக்காக வடிவமைக்கப்பட்டது.',
    'bag (50kg)', 'INR', 38500, 50,
    '{"Standard Code": "IS 12269:2013", "Compressive Strength": "58.5 MPa", "Packaging": "HDPE laminated bag"}'::jsonb,
    'approved', 'available', true
  ),
  (
    'd0000000-0000-4000-8000-000000000002'::uuid, 'platform', 'BRK-REDC-WRCUT-1K', 'wirecut-first-class-red-clay-bricks',
    'c0000000-0000-4000-8000-000000000003'::uuid, 'First-Class Machine Wire-Cut Red Clay Bricks (Pallet of 1,000)', 'முதல் தர மெஷின் வயர்கட் சிவப்பு களிமண் செங்கற்கள் (1000 எண்ணிக்கை பேலட்)',
    'Precision-extruded kiln-fired clay masonry bricks offering sharp geometric edges, uniform compressive strength of 10.5 N/mm².',
    'துல்லியமாக வெட்டப்பட்டு சூளையில் சுடப்பட்ட சிவப்பு களிமண் செங்கற்கள்.',
    'pallet (1000 pcs)', 'INR', 1150000, 3,
    '{"Dimensions": "230 x 110 x 70 mm", "Compressive Strength": "10.5 N/mm²", "Water Absorption": "< 12%"}'::jsonb,
    'approved', 'available', true
  ),
  (
    'd0000000-0000-4000-8000-000000000003'::uuid, 'platform', 'PLM-UPVC-160MM-6M', 'heavy-duty-underground-upvc-drainage-pipe',
    'c0000000-0000-4000-8000-000000000005'::uuid, 'SN4 Ring-Fit Underground UPVC Sewer Pipe (160mm x 6 Metres)', 'நிலத்தடி UPVC கழிவுநீர் வடிகால் குழாய் (160 மிமீ x 6 மீட்டர்)',
    'Rigid PVC sewer and soil drainage pipes designed with rubber elastomer ring sockets for leak-proof jointing.',
    'எலாஸ்டோமெரிக் ரப்பர் வளைய பூட்டு கொண்ட திடமான UPVC கழிவுநீர் வடிகால் குழாய்கள்.',
    'length (6m)', 'INR', 245000, 10,
    '{"Outside Diameter": "160 mm", "Length": "6.0 Metres", "Stiffness": "SN4", "Standard": "IS 15328"}'::jsonb,
    'approved', 'available', true
  )
on conflict (id) do update set
  title_en = excluded.title_en,
  unit_price_minor = excluded.unit_price_minor;

-- 3. SEED INVENTORY
insert into public.inventory (product_id, location_code, quantity_on_hand, quantity_reserved)
values
  ('d0000000-0000-4000-8000-000000000001'::uuid, 'CENTRAL_YARD', 4500, 0),
  ('d0000000-0000-4000-8000-000000000002'::uuid, 'BRICK_KILN_YARD', 250, 0),
  ('d0000000-0000-4000-8000-000000000003'::uuid, 'DISTRIBUTION_HUB', 850, 0)
on conflict (product_id, location_code) do update set
  quantity_on_hand = excluded.quantity_on_hand;

-- 4. SEED COMMISSION RULES
insert into public.commission_rules (id, name, rate_percent, calculation_basis, is_active)
values
  ('e0000000-0000-4000-8000-000000000001'::uuid, 'Standard Marketplace Commission', 8.5, 'subtotal', true)
on conflict (id) do update set
  rate_percent = excluded.rate_percent;
