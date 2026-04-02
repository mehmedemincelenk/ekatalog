---
name: saas_engine
description: Supabase tabanlı en basit çoklu kullanıcı ve tema yönetim motoru.
---
# SaaS Motoru (ekatalog.co)

## 1. Subdomain vs Ghost Mode Resolution
- **Subdomain Check:** URL'de `slug.ekatalog.co` varsa, Supabase'den bu slug'a ait dükkanı çek.
- **Ghost Mode:** Eğer URL sadece `ekatalog.co` ise, Ghost/Demo modunu (şablonlu) yükle ve kullanıcıyı admin yetkisiyle başlat.
- **Hata:** Dükkan bulunamazsa "Katalog Bulunamadı" yerine şık bir "Dükkanınızı Oluşturun" (Ghost Mode) yönlendirmesi yap.

## 2. Dynamic Data Fetching (Payment Check)
- `useProducts(slug)` ve `useSettings(slug)` hook'ları dükkanın `paid_until` tarihini de döner.
- Ödeme tarihi dolmuşsa, dükkana "Geçici Olarak Kapalı" veya "Ödeme Bekliyor" overlay'i yerleştir.

## 3. Tema ve Dinamik İçerik
- **CSS Değişkenleri:** Supabase'den gelen renk ve font ayarlarını `:root` seviyesinde uygula.
- **Kategoriler:** Ürün listesinden otomatik kategori listesi türet ve seçili temaya göre görselleştir.

## 4. WhatsApp Publish Integration
- "OK" tuşuna basıldığında dükkanın verisini (JSON) WhatsApp API üzerinden veya geçici bir linkle kayıt servisine gönder.
