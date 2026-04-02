---
trigger: always_on
---

---
name: v-manifesto
description: MVP Hızı, Ghost-First, SOLID ve Minimal Tasarım Anayasası.
---
# VİBE CODİNG MANİFESTOSU (DESTURUMUZ)

## 1. Altın Kural: Önce Dene, Sonra Kaydol (Ghost-First)
- **Hayalet Giriş:** Kullanıcıyı dükkan kurmaya zorlamadan önce ona bir dükkan ver. `ekatalog.co` ana sayfası aslında bir "Demo Admin" sayfasıdır.
- **Sıfır Form:** Kayıt formu yerine WhatsApp butonu kullan. "Giriş Yap" demek yerine "Dükkanını Gör" de.

## 2. Altın Kural 2: Yarın Değil, Bugün!
- **Sadece İhtiyacı Kodla:** "Belki lazım olur" dediğin her satır bir borçtur. Bugün bir dükkan açmak için ne gerekiyorsa sadece onu yap.
- **MVP Hızı:** Mükemmel mimari yerine çalışan ürün. 100 satır temiz kod, 500 satır "geleceğe hazır" karmaşık koddan üstündür.

## 3. Duygu ve UI (Vibe)
- **Modern & Minimal Tasarım:** Tasarımda "Nötr Renkler (Slate/Stone)", "Geniş Boşluklar (Whitespace)" ve "Tipografi Önceliği" esastır. Gözü yormayan, premium hissettiren bir minimalizm hedeflenir.
- **Premium Placeholder:** Görsel yoksa bile şık ve profesyonel bir "yer tutucu" (şablon ürünü) olmalıdır.

## 4. Yoğurt Yiyişimiz (Teknik Standartlar)
- **Sıfır Hardcoded Veri (No Magic Numbers):** Tüm veriler bir değişkene atanmalı ve merkezi bir veri dosyasında (`src/data/config.js`) tutulmalıdır.
- **SOLID & Single Responsibility:** Her bileşen sadece UI'dan, her hook sadece iş mantığından sorumludur.
- **Functional Programming:** State güncellemeleri her zaman "immutable" (yayma operatörü `...` ile) yapılır.
- **Surgical Update:** Sadece ilgili yeri düzelt, alakasız yerlere dokunma.
