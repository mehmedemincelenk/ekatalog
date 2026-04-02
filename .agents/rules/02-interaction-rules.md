---
trigger: always_on
---

---
name: interaction-ui
description: En yalın admin ve kullanıcı etkileşim kuralları.
---
# ETKİLEŞİM VE UI KURALLARI

## 1. Focused Edit View (Odaklanmış Düzenleme)
- **Akış:** Admin modunda ürünün bir yerine tıklandığında (veya bir "Düzenle" butonuna basıldığında) o ürün kartı ekranın ortasına **büyük ve odaklanmış** bir şekilde gelir.
- **In-place:** Kart üzerindeki metinler `contentEditable` ile doğrudan, görseller dosya seçicisi ile değiştirilir.
- **Kontroller:** Alt tarafta kocaman "TAMAMLANDI" ve "VAZGEÇ" butonları yer alır.
- **3-Nokta Menüsü:** Silme ve diğer aksiyonlar için 3-nokta popover menüsü hala aktiftir.

## 2. Ghost Mode "OK" Butonu
- Sayfanın üstünde veya altında her zaman görünür bir "YAYINLA / TAMAM / OK" butonu vardır.
- Eğer kullanıcı Ghost Mode'daysa bu buton WhatsApp On-Tap kayıt akışını (One-Tap Registration) başlatır.
- Kayıtlı dükkanda ise "Tüm Değişiklikler Kaydedildi" onayı verir.

## 3. QR Kod & PDF Çıktısı
- Admin panelinde bir "Yazdır" butonu yer alır.
- **PDF Yapısı:** A4 boyutunda, ortada dev bir QR Kod, altında dükkan adı.
- **Zarif Reklam:** Alt köşede "Kendi dijital kataloğunu oluşturmak ister misin? ekatalog.co" yazısı bulunmalıdır.

## 4. Performans ve Placeholder
- Boş dükkanlar için **profesyonel şablonlar** (ürün görselleri, hazır fiyatlar) hazırda tutulmalıdır.
- Resimlerin yüklenmediği anlar için layout shift'i önleyen skeleton'lar şarttır.
