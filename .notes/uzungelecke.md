- b2c b2b ayrı panel gerekir mi diye bakmak lazım
- bazı şeyler ikonlarla temsil edilir evrenseil ikonlardır mesela kurutma vs. bunların bi listesini ve cardlarda yerini ayarlamak

Kritik Eksiklik: isAdmin hâlâ sessionStorage üzerinde "active" gibi basit bir metne bakıyor. Birisi tarayıcı konsoluna sessionStorage.setItem('admin_v1_session', 'active') yazarsa admin butonlarını görebilir (RLS sayesinde işlem yapamaz ama arayüzü bozabilir).
İyileştirme: Admin oturumunu sadece bir metne değil, PIN doğrulaması sonucunda dönen ve veritabanı tarafından imzalanmış bir geçici ID'ye bağlamak daha "Diamond" olur.

"İyileştirme: Yükleme işlemi başlamadan önce visualFile.size kontrolü yaparak "5MB'dan büyük dosyalar yüklenemez" uyarısı eklemeliyiz." bi foto max kaç mb olabilir ise max sınırı o boyutu + 4 olarak verleim.

🔁 Geri Geldi Ama Almadı (Return Visitor Nudge)
Müşteri 2. kez siteye girdi

- Geçen sefer baktığı ürünler hâlâ stokta
  → "Geçen seferki ilginizi çeken ürünler hâlâ mevcut. Teklif alalım mı?"
  🚪 Çıkış Kapısı (Exit Intent)
  Fare ekranın üstüne gitti (sekmeyi kapatacak)
  VEYA mobilde hızlıca yukarı kaydırdı
  → "Gitmeden önce — beğendiğiniz 3 ürünü kaydetmek ister misiniz?"
  😶 Sessiz Gezgin (Silent Scroller)
  5 dakikadır geziyor
- Hiçbir ürüne tıklamadı (sadece scroll)
- Belirli bir kategoride takıldı
  → "Aradığınızı bulamadınız mı? Bize yazın, yardımcı olalım."
  [WhatsApp ile sor]
  💰 Fiyat Avcısı (Price Hunter)
  3+ ürünün modalını açtı
- Hepsinde fiyata baktı (scroll pozisyonu fiyat alanında durdu)
- Ama hiçbirini sepete/listeye eklemedi
  → "Toplu alımlarda özel fiyat sunuyoruz. Teklif isteyin."
  📦 Kategori Uzmanı (Category Deep-Dive)
  Tek bir kategoride 8+ ürüne baktı
- Diğer kategorilere hiç girmedi
  → "Sızdırmaz Grubu'nun tamamını PDF olarak indirmek ister misiniz?"
  [PDF İndir] [WhatsApp'tan Gönder]
  ⏰ Gece Vardiyası (Off-Hours Visitor)
  Saat 23:00 - 06:00 arası giriş
  → "Şu an çalışma saatleri dışındayız.
  İlgilendiğiniz ürünleri not alalım,
  sabah ilk iş size dönelim."
  [Ürünlerimi Gönder + Telefon Numaramı Bırak]
  🔄 Kararsız (Comparison Loop)
  Aynı 2 ürüne 3+ kez gidip geldi
  → "Bu iki ürün arasında mı kaldınız?
  İkisini yan yana karşılaştırın."
  [Karşılaştır]
  🆕 İlk Ziyaret (First-Timer Welcome)
  İlk kez gelen ziyaretçi
- 30 saniye geçti (sayfayı terk etmedi)
  → "Hoş geldiniz! 340+ ürünlük kataloğumuzu keşfedin.
  En çok tercih edilenlerle başlamak ister misiniz?"
  [Popülerleri Göster]
  🏃 Hızlı Gezgin (Speed Scroller)
  30 saniyede 50+ ürünü geçti (çok hızlı kaydırıyor)
- Hiçbirine bakmadı
  → "Spesifik bir ürün mü arıyorsunuz?"
  [Arama kutusunu odakla + parlat]
