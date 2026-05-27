---
name: b2b_scraper
description: "B2B Mağaza Scrape ve Otomatik İçerik Oluşturma Skill'i. Diamond standartlarında dükkan verileri üretir."
---

# 🕵️‍♂️ B2B ALL-INCLUSIVE EXTRACTION & MAPPING PROTOCOL (LOCKED 🔒)

Bu rehber, sisteme yeni bir dükkan ekleneceği zaman hedef web sitesinden **tüm kurumsal ve ürün varlıklarını eksiksiz sızdırıp** e-katalog veri modelimizdeki **en doğru yerlere** kusursuz yerleştirmek için uyulması zorunlu olan mutlak standarttır.

---

## 📋 4-AŞAMALI EKSİKSİZ TARAMA VE EŞLEŞTİRME METODOLOJİSİ

Bir web sitesini tararken hiçbir detayı atlamamak için sırasıyla şu 4 aşamayı tamamlamalısınız:

### AŞAMA 1: Kurumsal Kimlik & Marka Varlıkları (Corporate Assets)
Hedef sitenin kaynak kodundan ve stil dosyalarından aşağıdaki varlıkları sızdırın:
1. **Orijinal Logo (`logo_url`):** 
   - Sitenin header, footer veya meta (`og:image`, `shortcut icon`) alanlarındaki asıl logo görselini bulun.
   - Logo adresini kesinlikle tespit edip `logo_url` sütununa yazın.
2. **Kurumsal Renk Paleti (`brand_color`):**
   - Sitenin CSS dosyalarından (veya logodan renk seçiciyle) dominant kurumsal rengini (Primary `#HEX` kodu) çıkarın.
   - Bu rengi `public.stores` altındaki tema veya renk ayarı alanına işleyerek e-kataloğun marka renkleriyle birebir eşleşmesini sağlayın.
3. **Resmi Slogan (`tagline`):**
   - Sitenin anasayfa başlığındaki veya slider üzerindeki asıl kurumsal sloganı bulun.
   - **Kısıtlama:** Maksimum 35 karakter olmalı ve içinde dükkanın kendi adı geçmemelidir!

### AŞAMA 2: Karusel ve Banner Varlıkları — FULL SITE DEEP CRAWL (LOCKED 🔒)
Slider alanı dükkanın vitrinidir. **Sadece ana sayfa değil, sitenin TÜM sayfaları taranmalıdır.**

1. **Multi-Page Link Discovery (ZORUNLU):**
   - Ana sayfadan tüm `<a href>` iç linkleri topla (ürünler, galeri, hakkımızda, referanslar, iletişim, kategoriler vb.).
   - Her iç linke git ve o sayfadaki tüm `<img>` elementlerini tara.
   - Yalnızca site'ye ait (3rd party CDN/reklam değil) görselleri işle.

2. **Yatay Görsel Filtresi:**
   - Tüm sayfalardaki `slider`, `banner`, `bg`, `carousel`, `hero`, `galeri`, `gallery` sınıflarındaki resimleri çekin.
   - `og:image` meta etiketlerini tüm sayfalarda kontrol edin.
   - Yalnızca **geniş yatay (en-boy oranı > 1.5 veya banner formatında)** görselleri seçin.
   - Dikey (portrait) veya kare (square) ürün detay fotoğraflarını **kesinlikle karuselden eleyin**.
   - Minimum çözünürlük: **800px genişlik** — küçük thumbnail'ları ele.

3. **Görsel Öncelik Sırası:**
   - 1. Önce: Galeri / Referanslar / Hakkımızda sayfalarındaki yatay görseller.
   - 2. Önce: Ana sayfa slider/hero görselleri.
   - 3. Önce: Kategori sayfası banner görselleri.

4. **Kurumsal Metin Bindirme:**
   - Karuseldeki her slayt için sitenin kurumsal vizyonunu yansıtan premium başlık (`label`) ve alt başlık (`sub`) metinleri türetin.

### AŞAMA 3: İletişim, Lokasyon ve Sosyal Medya Varlıkları
Hiçbir kurumsal bağı atlamayın:
1. **İletişim Numaraları (`phone`, `whatsapp_url`):**
   - Sitedeki tüm B2B sipariş hatlarını, WhatsApp numaralarını çekin. `phone` sütununa ülke koduyla birlikte (`905xxxxxxxxx`) ekleyin.
2. **Adres & Bölge (`address`, `short_address`):**
   - Tam adresi (`address`) ve B2B alıcılarının ilk bakışta göreceği şehir/semt bilgisini (`short_address`, örn: `"Bağcılar / İstanbul"`) çıkarın.
3. **Sosyal Medya Linkleri (`instagram_url` vb.):**
   - Instagram, Facebook veya LinkedIn adreslerini tespit edin.

### AŞAMA 4: Ürün ve Kategori Kataloğu (Full Product Crawl)
1. **Kategori Ağacı (`category_order`):**
   - Sitedeki tüm B2B ürün kategorilerini isimleriyle eksiksiz çekin.
   - **KRİTİK:** `stores.category_order` içindeki isimler, `prods.category` alanlarıyla **birebir (case-sensitive)** eşleşmelidir.
   - Ekleme sonrası `SELECT category, COUNT(*) FROM prods WHERE store_id=... GROUP BY category` ile doğrula.
2. **Kapsamlı Ürün Verisi (`public.prods`):**
   - Sitedeki **tüm ürünleri** (adları, stok kodları, açıklamaları, fiyatları ve yüksek kaliteli görsel URL'leri ile) sızdırın.
   - Ürün açıklamalarında stok kodunu veya teknik özellikleri koruyun.

### AŞAMA 5: Karusel Karar Protokolü (ZORUNLU 🔒)
Tüm sayfalar tarandıktan sonra carousel kararı verilir:

1. **Görsel Boyut Doğrulama (curl + file komutu):**
   ```bash
   curl -s "http://site.com/img/banner.jpg" | file -
   # Çıktı: "1920x600" ise YATAY ✅ | "1080x1080" ise KARE ❌
   ```
   - **Sadece `read_url_content` veya markdown çıktısına güvenme** — img tag'leri kaybolur.
   - Ham HTML için: `curl -s "URL" | grep -Ei '<img[^>]+src'`

2. **Karusel AÇIK kararı:** En az 1 yatay görsel (oran > 1.5, min 800px geniş) bulunmuşsa.
   - Gerçek site görsellerini kullan.

3. **Karusel KAPALI kararı:** Sitedeki TÜM görseller kare/dikey ise:
   ```sql
   UPDATE stores SET carousel_data = '{"slides": [], "enabled": false}' WHERE slug = '...';
   ```
   - `carousel_data.enabled = false` olduğunda `HeroCarousel` bileşeni render edilmez.
   - Bu durumda Unsplash görseli de kullanılmaz — carousel tamamen gizlenir.

4. **Unsplash Fallback (istisnai durum):** Sadece carousel AÇIK kalacak ama site görseli yoksa (404 vb.) - Neden: Kullanıcının PC'sini fiziksel olarak çökertebilmektedir.

---

## 🤖 CANLI SCRAPER PROMPT ŞABLONU (SELF-PROMPT)
Bir dükkan taramaya başlamadan önce kendinize şu talimatı verin:

```text
[B2B_ALL_INCLUSIVE_CRAWLER_ACTIVE]
Hedef: <WEBSITE_URL>
İşletme: <ISLETME_ADI>

1. KURUMSAL VARLIKLAR:
   - Sitenin asıl logolarını listele. En yüksek kaliteli logonun URL'sini tespit et.
   - Header, buton veya logodan baskın marka rengini (#HEX) tespit et.
   - Sitenin meta ve slogan metinlerinden maksimum 35 karakterlik (şirket adı içermeyen) kurumsal slogan üret.

2. AFİŞ & BANNER VARLIKLARI — TÜM SAYFALARDA DEEP CRAWL:
   - Ana sayfadaki tüm iç linkleri keşfet ve HER SAYFAYA git.
   - Her sayfada (ürünler, galeri, hakkımızda, kategoriler dahil) img src'leri topla.
   - Yalnızca geniş yatay (oran > 1.5, min 800px) görselleri karusel adayı olarak işaretle.
   - Kare veya dikey ürün resimlerini karusel listesinden KESİNLİKLE ele.
   - Her slayt için sektörel ve toptan satış odaklı premium başlık ve alt metin yaz.

3. İLETİŞİM & LOKASYON:
   - Sipariş numarası, WhatsApp linki, tam adres ve ilçe/il verilerini çek.
   - Duyuru barı için emojisiz, B2B odaklı maksimum 60 karakterlik toptan satış vaadi yaz.

4. EKSİKSİZ ÜRÜN KATALOĞU:
   - Tüm kategorileri ve içlerindeki tüm ürünleri (görsel, ad, açıklama) sızdır.
   - Ürün açıklamalarını B2B teknik özelliklerini yansıtacak şekilde zenginleştir.

5. VERİTABANI MODELLEME:
   - Çekilen tüm verileri public.stores ve public.prods tabloları için mükemmel ve eksiksiz SQL insert ifadelerine dönüştür.
```

---

## 🔒 GÜVENLİ GÖRSEL PROTOKOLÜ (MIXED CONTENT RESOLUTION)
Eğer hedef web sitesi `http://` protokolü üzerinden yayın yapıyor ve görseller `https://` altında çalışmıyorsa:
1. Görsellerin güvenli bir proxy üzerinden çekilmesini veya HTTPS CDN URL'leriyle eşleştirilmesini değerlendirin.
2. Carousel AÇIK ama görsel HTTP ise → carousel OFF yap (mixed content hatası önlenir).

---

## 🛠️ SORUN ÇÖZME REHBERİ (Troubleshooting Playbook)

Her sorun karşısında önce bu rehbere bak:

| Sorun | Sebep | Çözüm |
|---|---|---|  
| `read_url_content` img göstermiyor | Markdown dönüşümü img tag'lerini atar | `curl -s URL \| grep '<img'` ile ham HTML tara |
| Görsel 404 veriyor | URL yanlış veya http/https uyumsuz | `curl -I URL` ile HEAD isteği at, doğru URL'yi bul |
| Tüm görseller kare (1:1) | Site mobil-odaklı katalog görseli kullanmış | Carousel OFF yap, references_data için kullan |
| Logo görünmüyor | Logo HTML'de yorum satırında | CSS class veya `background-image` içinde ara |
| JS ile yüklenen içerik | SPA/dinamik site | `browser_subagent` kullan (Lighthouse YASAK) |
| Instagram linki bulunamadı | Footer veya WhatsApp mesajında gizli | `curl -s URL \| grep -i 'instagram\|facebook'` |
| Adres bulunamadı | İletişim sayfasında gizli | `/iletisim.html`, `/contact.html`, `/hakkimizda.html` tara |
