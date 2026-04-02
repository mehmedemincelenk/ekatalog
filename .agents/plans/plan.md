# Proje Yol Haritası ve Gelecek Planları (ekatalog.co)

Bu dosya, projenin SaaS dönüşümü ve 50+ yaş kitlesi için kullanıcı deneyimi iyileştirmelerini kapsayan tüm planları tek bir yerde toplar.

---

## 🚀 1. Plan: WhatsApp Business "One-Tap Approval" Giriş Sistemi
**Hedef:** Şifresiz, sadece WhatsApp üzerinden bir buton onayıyla (Evet/Hayır) giriş.

---

## 📝 1.1 Plan: Hayalet Admin ve Sıfır Sürtünmeli Kayıt (Ghost Mode Onboarding)
**Hedef:** 50+ yaş kitlesi için "Önce Dene, Sonra Kaydol" yaklaşımıyla en zahmetsiz kayıt deneyimi.
- **Akış:** İşletme sahibi `ekatalog.co`'ya girdiğinde karşısına doğrudan şablonlu, içi dolu bir dükkan çıkar. Hiçbir form doldurmadan "Hayalet Admin" modunda ürünleri siler, ekler, fiyatları değiştirir (tıklayarak düzenleme).
- **Yayınlama (TAMAM Tuşu):** Düzenleme bittiğinde kocaman bir "DÜKKANIMI YAYINLA" butonuna tıklar.
- **Numara Girişi (SaaS Deneyimi):** Kullanıcı başka bir sekmeye atılmaz. Dükkan içinde şık bir alan açılır: "Dükkan linkinizi WhatsApp'tan iletmemiz için numaranızı yazın."
- **WhatsApp Entegrasyonu:** Kayıt tamamlandığı an arka planda (API üzerinden) telefonuna `sirketadi.ekatalog.co` linki gönderilir. Ekranda ise "Dükkanınız başarıyla kuruldu! Onay mesajını WhatsApp'tan ilettik, lütfen telefonunuzu kontrol edin." uyarısı görünür.

---

## 🆘 1.2 Plan: Entegre Yardım ve Dostane Rehberlik
**Hedef:** "Hata yapma korkusunu" silip her adımda kullanıcıya eşlik etmek.

---

## 🛠️ 2. Plan: SaaS Mimarisi ve Tenant Resolution
**Hedef:** Her dükkanın kendi subdomain'i üzerinden çalışması.
- **Dinamik Domain:** Admin panelinde doldurulması zorunlu olan (ancak müşteriye görünmeyen) bir "Şirket Adı" alanı bulunur.
- **Ad Değişimi = Domain Değişimi:** Şirket adı değiştiğinde dükkanın subdomain'i (`slug`) de otomatik güncellenir. Bu değişim gerçekleştiğinde yeni link anında dükkan sahibine WhatsApp üzerinden iletilir.
- **Tenant Resolution:** URL subdomain bilgisinden dükkanın ayarları ve ürünleri filtrele.

---

## 🎨 3. Plan: Modern & Minimalist Tasarım Revizyonu
**Hedef:** SOLID ve KISS prensipleriyle, Apple-esque bir sadelik.

---

## 📊 4. Plan: Supabase Veri Yönetimi
**Hedef:** LocalStorage'dan tamamen bulut tabanlı yapıya geçiş.

---

## 🔄 5. Plan: Mağaza Yönetimi (Admin Paneli) Devrimi
**Hedef:** Karmaşık formlar yerine dükkanın kendisi üzerinde "Dokun-Düzenle" mantığı.

### 5.1 Odaklanmış Ürün Düzenleme (Focused Edit View)
- **Akış:** Admin modunda ürünün Adı, Fiyatı, Açıklaması veya Görseline tıklandığında, o ürün kartı ekranda **daha büyük ve odaklanmış** bir şekilde açılır.
- **Düzenleme:** Büyük kartın üzerindeki fotoğrafa tıklanırsa dosya seçici açılır, isme tıklanırsa klavye açılır. 
- **Kontroller:** Kartın altında kocaman bir "TAMAMLANDI" ve "VAZGEÇ" butonu yer alır.
- **3-Nokta Menüsü:** Silme gibi ek aksiyonlar için 3-nokta menüsü hala aktiftir.

### 5.2 Görsel Mağaza Ayarları (Contextual Branding)
- **Yerinde Düzenleme:** Ayrı bir ayar sayfası yok. Admin dükkanın logosuna, WhatsApp nosuna veya adresine doğrudan tıklar.
- **Rehberlik:** Boş dükkanlarda "Buraya dükkan adınızı yazın", "WhatsApp numaranızı girin" gibi placeholder'lar (yer tutucular) kullanıcıyı yönlendirir.

---

## 🔍 6. Plan: SEO ve Sosyal Paylaşım (Dinamik Meta)
**Hedef:** Dükkan linki paylaşıldığında dükkanın logosu ve isminin şık bir şekilde görünmesi.

---

## ✨ 7. Plan: Otomatik Dükkan Şablonu (Ghost Mode Girişi)
**Hedef:** Yeni gelen birinin bomboş bir sayfa yerine, düzenlenmeye hazır profesyonel bir katalog görmesini sağlamak.
- **Zengin Placeholder:** Sektöre özel (veya genel en çok satan ürünler) hazır görseller ve metinlerle dükkan anında "dolu" görünür.
- **Admin-First:** `ekatalog.co` ana sayfası aslında bir "Demo Admin" sayfası gibi davranır. Üstte "Dükkanınızı Düzenliyorsunuz" barı ile güven verir.

---

## 🌐 8. Plan: Wildcard Subdomain & Deployment (Altyapı)
**Hedef:** Sınırsız sayıda `*.ekatalog.co` adresinin tek bir sunucu üzerinden bedava yönetilmesi.

---

## 💳 9. Plan: WhatsApp Ödeme Linki & Otomatik Aktivasyon
**Hedef:** 50+ yaş grubu için en zahmetsiz, masrafsız ve güvenilir ödeme akışı.
- **Sistem:** Stripe Türkiye kısıtlamaları ve karmaşık prosedürler yerine, dükkan süresi dolduğunda (örn: 3 ay sonunda) otomatik bir WhatsApp mesajı atılır: "Dükkanınızın süresi doldu. Devam etmek için linke tıkla ve 100 TL ödeme yap."
- **Ödeme:** Kullanıcı linke tıklar (Shopier veya Iyzico Link) ve ödemesini yapar.
- **Aktivasyon:** Ödeme başarılı uyarısı (Webhook) geldiği an, Supabase'deki `paid_until` tarihi otomatik olarak uzatılır. Recurring (tekrarlı) ödemeler için Iyzico altyapısı tercih edilir.

---

## 🖨️ 10. Plan: QR Kod & PDF (Zarif Tanıtım Materyali)
**Hedef:** Dükkan sahiplerinin fiziksel dünyada (vitrin, masa üstü) kataloğunu kolayca paylaşmasını sağlamak ve ekatalog.co markasını yaymak.
- **Yazdır Butonu:** Admin panelinde tek tıkla harika bir A4 PDF oluşturulur.
- **Tasarım:** Sayfanın ortasında büyük bir QR kod, altında şık bir fontla dükkan adı.
- **Görünmez Reklam:** PDF'in alt köşesinde zarif bir ibare: "Kendi dijital kataloğunu oluşturmak ister misin? ekatalog.co". Bu sayede dükkan önünden geçen herkes potansiyel müşteri olur.

---
*Tüm planlar "Yoğurt Yiyişimiz" (SOLID, KISS, Functional) prensiplerine göre icra edilecektir.*
