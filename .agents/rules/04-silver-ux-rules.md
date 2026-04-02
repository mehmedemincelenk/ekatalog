---
trigger: always_on
---

---
name: silver-ux
description: 50+ yaş grubu için erişilebilirlik ve tasarım kuralları.
---
# SILVER UX KURALLARI (APPLE EVRENSELLİĞİ)

## 1. Apple Standartlarında Tipografi
- **Dinamik Hiyerarşi:** Sabit "büyük font" yerine, Apple'ın Tipografi Hiyerarşisini (Headline, Body, Caption) kullan. Okunabilirlik puntodan ziyade **harf arası boşluk (tracking)** ve **satır yüksekliği (leading)** ile sağlanır.
- **Okunabilirlik Önceliği:** Kontrast ve netlik esastır. Yazılar arka planla boğuşmamalı, "Nefes alan" (Whitespace) bir düzen kullanılmalıdır.
- **Sistem Fontları:** Cihazın kendi yerel fontlarını (San Francisco, Segoe UI) kullanarak kullanıcıya tanıdık ve güvenli bir his ver.

## 2. Dokunma Hedefleri (Precision & Ease)
- **Evrensel Erişim:** Butonlar ve tıklanabilir alanlar Apple standartlarında (min 44x44pt / 48x48px) olmalı, ancak kaba değil, zarif görünmelidir.
- **Etkileşim Geri Bildirimi:** Her dokunuşta kullanıcıya hafif bir görsel tepki (opacity değişimi veya hafif scale) vererek işlemin gerçekleştiğini hissettir.

## 2. Dil ve Terimler
- **Sıfır Teknik Jargon:** "Login", "Sign-up", "Slug", "Tenant" gibi kelimeleri kullanıcıya gösterme. Bunun yerine "Giriş Yap", "Dükkanını Aç", "Dükkan Adresi" kelimelerini kullan.
- **Net Talimatlar:** Hata mesajları "Hata oluştu" değil, "Bir şeyler yolunda gitmedi, lütfen tekrar deneyin veya bize WhatsApp'tan yazın" şeklinde dostane olmalı.

## 3. Korku Giderme (Rehberlik)
- **Hata Yapma Korkusu:** "Bu tuşa basarsam her şey silinir mi?" korkusunu yenmek için kritik işlemlerde (Silme gibi) mutlaka "Emin misiniz? Bu işlem geri alınamaz" onayı al.
- **Vurgulu Yardım:** Karmaşık görünen yerlerde küçük, zarif bir "Yardım İster misiniz?" butonu (doğrudan destek WhatsApp hattına bağlanan) bulundur.

## 4. Akış Basitliği
- **Tek Yol:** Bir işlem için sadece bir ana yol sun. Kullanıcıyı seçenekler arasında boğma.
- **Geri Dönüş:** Kullanıcı her zaman nerede olduğunu bilmeli ve kolayca "Geri" dönebilmeli.
