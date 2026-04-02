---
name: communication_bridge
description: WhatsApp mesajları, bildirimler ve ödeme otomasyonları yönetimi.
---
# İletişim Köprüsü (WhatsApp & SaaS)

## 1. Mesaj Şablonları (Template Engine)
- **Kayıt:** "Hoş geldiniz! Dükkanınızın adresi: {slug}.ekatalog.co. Düzenlemek için bu linke tıklayın."
- **Ödeme Hatırlatma:** "Dükkanınızın kullanım süresi doldu. Devam etmek için 100 TL ödeme yapabilirsiniz: {pay_link}"
- **Slug Değişimi:** "Dükkanınızın adresi güncellendi! Yeni link: {new_slug}.ekatalog.co"

## 2. Webhook & Background Messaging
- **Kayıt (SaaS Akışı):** Kullanıcı dükkan içindeki forma numarasını girer. Backend, bu numaraya otomatik olarak onay linkini gönderir.
- **In-app Feedback:** Mesaj gönderildiği an kullanıcıya "Dükkanınız kuruldu! Onay mesajını WhatsApp'tan ilettik, lütfen telefonunuzu kontrol edin." bildirimi gösterilir.
- **Iyzico / Shopier Link:** Ödeme başarılı bildirimi geldiği an, Supabase'deki `stores` tablosunda `paid_until` değerini `+30 gün` olarak güncelle.

## 3. Sosyal Paylaşım & SEO
- **Dinamik Meta:** Paylaşımlarda dükkan logosu ve isminin şık görünmesini sağlayacak meta tag'leri (`og:image`, `og:title`) slug bazlı oluştur.
- **Kart Tasarımı:** Sosyal medya önizlemelerinde (WhatsApp, Facebook) dükkan isminin büyük ve okunur olduğundan emin ol.

## 4. Kullanıcı Rehberliği (Friendly Support)
- Kullanıcı dükkanında takılırsa veya "Yardım" butonuna basarsa, otomatik bir WhatsApp destek hattı linki oluştur: `wa.me/numara?text=Selam, dükkanımı düzenlerken yardıma ihtiyacım var.`
