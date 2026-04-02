---
trigger: always_on
---

---
name: saas-core
description: Subdomain & Supabase tabanlı en yalın SaaS mimarisi.
---
# SaaS ÇEKİRDEK KURALLARI (ekatalog.co)

## 1. Veri ve Erişim: Supabase & Ghost Mode
- **Ghost Mode:** `ekatalog.co` ana sayfasında kayıt olmadan yapılan düzenlemeler `localStorage` veya geçici bir `session_id` ile Supabase'de tutulur. Kayıt süreci dükkan içinden telefon numarası alınarak başlatılır, `wa.me` yönlendirmesi yapılmaz.
- **Tenant Resolution:** Mağaza verisi subdomain (`slug`) üzerinden çekilir. Eğer `slug` yoksa (ana sayfa), Ghost Mode/Demo şablonu yüklenir.
- **Ödeme Kontrolü:** Her dükkanın `paid_until` tarihi vardır. Süre dolduğunda sistem WhatsApp mesajı tetikler ve dükkanı "Görüntüleme Modu"na (veya ödeme uyarısına) alır.
- **Görsel Standart:** iOS/Safari uyumu için **max 800px** ve **0.7 JPEG** sıkıştırma zorunludur.

## 2. Dinamik URL & Subdomain
- **Şirket Adı = Slug:** Admin panelindeki "Şirket Adı" alanı, dükkanın `slug` (subdomain) değerini belirler.
- **Senkronizasyon:** Ad değiştiğinde slug güncellenir ve yeni link WhatsApp üzerinden dükkan sahibine iletilir.

## 3. SEO ve Marka
- Dükkan adı ve meta etiketleri slug'a göre dinamik güncellenmelidir.
- Paylaşımlarda şık bir "Dükkan Kartı" önizlemesi (Dinamik Meta) oluşturulmalıdır.
