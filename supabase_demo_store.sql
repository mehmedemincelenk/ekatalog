-- ==========================================
-- PREMIUM DEMO STORE & PRODUCTS SEED SCRIPT
-- MAĞAZA: Vibe Coffee & Bistro (ornek)
-- ==========================================

-- 1. MAĞAZA EKLEME
INSERT INTO public.stores (
  id,
  slug,
  name,
  tagline,
  phone,
  address,
  logo_url,
  instagram_url,
  active_currency,
  category_order,
  carousel_data,
  references_data,
  display_config,
  announcement_bar,
  maintenance_mode,
  exchange_rates
) VALUES (
  'd18d098e-1954-4578-bd2f-1d868a63ed09',
  'ornek',
  'Vibe Coffee & Bistro',
  'Taze Kavrulmuş Çekirdekler & Özel Butik Lezzetler',
  '905370000000',
  'Moda Cd. No:82, Kadıköy / İstanbul',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop&q=80',
  'vibecoffee.tr',
  'TRY',
  '["Öne Çıkanlar", "Nitelikli Kahveler", "Artizan Burgerler", "Butik Tatlılar"]'::jsonb,
  '{"slides": [
    {"id": 1, "src": "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=1600&auto=format&fit=crop&q=80", "bg": "from-stone-900/60 to-black/80", "label": "TAZE KAVRULMUŞ ÇEKİRDEKLER", "sub": "Dünyanın en seçkin çiftliklerinden gelen %100 Arabica çekirdekleri sizin için öğütüp demliyoruz."},
    {"id": 2, "src": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1600&auto=format&fit=crop&q=80", "bg": "from-stone-900/60 to-black/80", "label": "EŞSİZ BUTİK TATLILAR", "sub": "Her sabah şefimiz tarafından taze hazırlanan artizan tatlılarımız ve makaronlarımızla gününüzü tatlandırın."}
  ]}',
  '[]',
  '{"showLogo": true, "showSearch": true, "showAddress": true, "showInstagram": true, "showWhatsapp": true, "showSubtitle": true, "showReferences": false, "showPrice": true, "showCarousel": false, "showCoupons": true, "showPriceList": true, "showCurrency": true, "showCategories": true}',
  '{"text": "☕ İLK SİPARİŞTE %15 İNDİRİM FIRSATI! KUPON KODU: VIBE15", "enabled": false}',
  '{"enabled": false, "message": "Güncelleme yapılıyor."}',
  '{"usd": 32.5, "eur": 35.2}'
) ON CONFLICT (slug) DO NOTHING;


-- 2. PREMIUM MOCKUP ÜRÜNLERİ EKLEME (12 ADET ADIM ADIM)

-- NİTELİKLİ KAHVELER
INSERT INTO public.prods (id, store_id, name, category, price, description, image_url, sort_order, out_of_stock, is_archived) VALUES
('a1010000-1111-2222-3333-444455556666', 'd18d098e-1954-4578-bd2f-1d868a63ed09', 'Cortado', 'Nitelikli Kahveler', '120 TL', 'Eşit oranda espresso ve kadifemsi sıcak süt köpüğü.', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80', 1, false, false),
('a1020000-1111-2222-3333-444455556666', 'd18d098e-1954-4578-bd2f-1d868a63ed09', 'V60 Drip Coffee', 'Nitelikli Kahveler', '140 TL', 'Etiyopya Kochere çekirdekleri ile demlenmiş meyvemsi aromalar.', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80', 2, false, false),
('a1030000-1111-2222-3333-444455556666', 'd18d098e-1954-4578-bd2f-1d868a63ed09', 'Iced Salted Caramel Latte', 'Nitelikli Kahveler', '160 TL', 'Tuzlu karamel şurubu, soğuk süt ve espresso.', 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80', 3, false, false)
ON CONFLICT (id) DO NOTHING;

-- ARTİZAN BURGERLER
INSERT INTO public.prods (id, store_id, name, category, price, description, image_url, sort_order, out_of_stock, is_archived) VALUES
('a2010000-1111-2222-3333-444455556666', 'd18d098e-1954-4578-bd2f-1d868a63ed09', 'Truffle Mushroom Burger', 'Artizan Burgerler', '380 TL', '160g dana köfte, trüflü mayonez, karamelize mantar, gravyer peyniri.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', 1, false, false),
('a2020000-1111-2222-3333-444455556666', 'd18d098e-1954-4578-bd2f-1d868a63ed09', 'Vibe Signature Burger', 'Artizan Burgerler', '410 TL', 'Özel brioche ekmeği, füme et, cheddar dolgulu köfte ve çıtır soğan halkası.', 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80', 2, false, false),
('a2030000-1111-2222-3333-444455556666', 'd18d098e-1954-4578-bd2f-1d868a63ed09', 'Crispy Chicken Brioche', 'Artizan Burgerler', '340 TL', 'Panko ile panelenmiş çıtır tavuk göğsü, coleslaw salatası ve ballı hardal sos.', 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80', 3, false, false)
ON CONFLICT (id) DO NOTHING;

-- BUTİK TATLILAR
INSERT INTO public.prods (id, store_id, name, category, price, description, image_url, sort_order, out_of_stock, is_archived) VALUES
('a3010000-1111-2222-3333-444455556666', 'd18d098e-1954-4578-bd2f-1d868a63ed09', 'San Sebastian Cheesecake', 'Butik Tatlılar', '220 TL', 'İçi akışkan kıvamlı, sıcak Belçika çikolatası eşliğinde servis edilir.', 'https://images.unsplash.com/photo-1524351199679-46cddf530c04?w=600&auto=format&fit=crop&q=80', 1, false, false),
('a3020000-1111-2222-3333-444455556666', 'd18d098e-1954-4578-bd2f-1d868a63ed09', 'Lotus Biscoff Tiramisu', 'Butik Tatlılar', '210 TL', 'Mascarpone kreması ve Lotus bisküvi ezmesi aromalı modern tiramisu.', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80', 2, false, false),
('a3030000-1111-2222-3333-444455556666', 'd18d098e-1954-4578-bd2f-1d868a63ed09', 'Pistachio Paris-Brest', 'Butik Tatlılar', '240 TL', 'Çıtır choux hamuru arasında bol Antep fıstıklı krema dolgusu.', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80', 3, false, false)
ON CONFLICT (id) DO NOTHING;

-- ÖNE ÇIKANLAR
INSERT INTO public.prods (id, store_id, name, category, price, description, image_url, sort_order, out_of_stock, is_archived) VALUES
('a4010000-1111-2222-3333-444455556666', 'd18d098e-1954-4578-bd2f-1d868a63ed09', 'Cold Brew Bottle', 'Öne Çıkanlar', '150 TL', '24 saat soğuk demlenmiş, 250ml özel şişesinde.', 'https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?w=600&auto=format&fit=crop&q=80', 1, false, false),
('a4020000-1111-2222-3333-444455556666', 'd18d098e-1954-4578-bd2f-1d868a63ed09', 'Smashed Avocado Toast', 'Öne Çıkanlar', '290 TL', 'Ekşi mayalı ekmek üzerine avokado püresi, poşe yumurta ve tulum peyniri.', 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=600&auto=format&fit=crop&q=80', 2, false, false),
('a4030000-1111-2222-3333-444455556666', 'd18d098e-1954-4578-bd2f-1d868a63ed09', 'Red Velvet Waffle', 'Öne Çıkanlar', '260 TL', 'Kırmızı kadife waffle hamuru, beyaz çikolatalı krema ve taze çilekler.', 'https://images.unsplash.com/photo-1562376502-6f769499c886?w=600&auto=format&fit=crop&q=80', 3, false, false)
ON CONFLICT (id) DO NOTHING;


-- 3. ADMIN GİRİŞ PIN KODU TANIMLAMA (ŞİFRE: 1234)
INSERT INTO public.store_secrets (store_id, admin_pin)
VALUES ('d18d098e-1954-4578-bd2f-1d868a63ed09', '1234')
ON CONFLICT (store_id) DO NOTHING;
