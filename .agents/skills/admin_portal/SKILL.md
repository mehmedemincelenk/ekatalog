---
name: admin_portal
description: Supabase tabanlı en yalın dükkan ve ürün yönetimi.
---
# Admin Portal (SaaS)

## 1. Focused Edit Pipeline
- **Odaklama:** Ürün kartına tıklandığında `isFocused` state'ini true yap ve kartı modal/overlay içinde büyüt.
- **In-place Save:** Kart üzerindeki her değişiklik (metin, fiyat) odağı kaybettiğinde (blur) veya "TAMAM" dendiğinde Supabase'e kaydedilir.
- **Görsel Yükleme:** Odaktaki görsele tıklandığında Canvas ile **800px / 0.7 JPEG** sıkıştırması uygula ve Blob olarak gönder.

## 2. WhatsApp On-Tap Registration (Ghost Mode Exit)
- **OK Tuşu:** Hayalet modunda butona tıklandığında geçici verileri (localStorage/Supabase) WhatsApp'tan gelecek telefon numarasıyla eşleştirir.
- **Aktivasyon:** Kullanıcıya "Dükkanınız kuruldu: `slug.ekatalog.co`" mesajı tetikler.

## 3. WhatsApp Pay & QR
- **Ödeme Linki:** Dükkan süresi dolduğunda Shopier/Iyzico linkini WhatsApp üzerinden gönder. Webhook ile `paid_until` tarihini otomatik uzat.
- **QR/PDF:** `jspdf` veya benzeri bir kütüphane ile dükkan adı ve dinamik QR kodu içeren A4 sayfasını PDF olarak oluştur.

## 4. Dinamik Domain Senkronizasyonu
- Admin panelinde "Şirket Adı" güncellendiğinde, bu değerden yeni bir `slug` türet ve Supabase'deki `stores` tablosuna yaz.
- Yeni subdomain linkini WhatsApp'a bas.
