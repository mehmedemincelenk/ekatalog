-- ============================================================
-- Target Store: Karakus Temizlik (karakus-temizlik)
-- Generated at: 2026-05-26 02:02:25
-- Scraped: 1 products, 1 categories
-- ============================================================

DO $$
DECLARE
    v_store_id uuid;
BEGIN
    -- 1. UPSERT STORE
    INSERT INTO stores (slug, name, tagline, logo_url, phone, address, category_order, carousel_data, announcement_bar)
    VALUES ('karakus-temizlik', 'Karakus Temizlik', 'KARAKU TEMZLK MALZEMELER', 'http://www.karakustemizlik.com/cay%20logo.jpg', '905334126960', 'option value="http://www.tarihvakfi.org.tr/istanbul"', '["Temizlik Hizmetleri"]'::jsonb, '{"enabled": false, "slides": []}'::jsonb, '{"text": "📦 Karakus Temizlik B2B Sipariş ve Talep Kataloğu Yayında!", "enabled": true}'::jsonb)
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        tagline = EXCLUDED.tagline,
        logo_url = EXCLUDED.logo_url,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        category_order = EXCLUDED.category_order,
        carousel_data = EXCLUDED.carousel_data,
        announcement_bar = EXCLUDED.announcement_bar;

    SELECT id INTO v_store_id FROM stores WHERE slug = 'karakus-temizlik';

    -- 2. RESET EXISTING PRODUCTS
    DELETE FROM prods WHERE store_id = v_store_id;

    -- 3. INSERT PRODUCTS
    INSERT INTO prods (store_id, name, category, image_url, description, price) VALUES
        (v_store_id, 'Karakuş Temizlik', 'Temizlik Hizmetleri', '', 'Karakuş Temizlik alanında tecrübeli ve profesyonel ekiplerimizle en ince ayrıntısına kadar hijyenik ve garantili temizlik hizmeti.', '0');
END $$;
