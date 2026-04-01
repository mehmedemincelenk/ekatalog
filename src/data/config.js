// ============================================================
// MERKEZ KONFİGÜRASYON — tüm sabit veriler burada tutulur
// ============================================================

// ----- Şirket -----
export const COMPANY = {
  name: 'Toptan Ambalajcım',   // Marka adı
  tagline: 'ÖMER KÖSE',             // Navbar altı etiket
  phone: '+90 537 342 0161',   // Telefon numarası
  whatsappUrl: 'https://wa.me/905373420161', // WhatsApp doğrudan bağlantı
  address: 'Mahmutbey Cd. No:10, Yenibosna / İstanbul', // Açık adres
  email: 'info@toptanambalajcim.com',  // E-posta
  logoEmoji: '📦',                  // Logo sembolü
};

// ----- Navbar -----
export const NAVBAR = {
  heightClass: 'h-14',                     // Bar yüksekliği
  bgClass: 'bg-white',                 // Arka plan
  borderClass: 'border-b border-stone-200',// Alt çizgi
  shadowClass: 'shadow-sm',                // Gölge yoğunluğu
  // Logo
  logoEmojiSize: 'text-[20px]',              // Emoji boyutu
  logoNameSize: 'text-[14px]',              // Marka adı boyutu
  logoNameWeight: 'font-bold',                // Marka adı kalınlığı
  logoTaglineSize: 'text-[10px]',              // Tagline boyutu
  logoTaglineColor: 'text-kraft-600',           // Tagline rengi
  // Telefon & WhatsApp kombinasyon butonu
  phoneSize: 'text-[11px]',              // Telefon yazı boyutu
  phoneWeight: 'font-semibold',            // Telefon yazı kalınlığı
  phoneColor: 'text-stone-900',           // Telefon yazı rengi
  phoneHoverColor: 'hover:text-kraft-700',     // Telefon hover rengi
  whatsappBtnSize: 'w-6 h-6',                 // Buton kare boyutu
  whatsappIconSize: 'w-3.5 h-3.5',             // İkon boyutu
  whatsappBg: 'bg-stone-900',             // Buton arka planı
  whatsappHoverBg: 'hover:bg-stone-900',       // Buton hover arka planı
  whatsappRounded: 'rounded',                  // Köşe yuvarlama
  // Adres
  addressSize: 'text-[10px]',              // Adres yazı boyutu
  addressColor: 'text-stone-600',           // Adres yazı rengi
};

// ----- Admin Modu -----
export const ADMIN = {
  triggerClicks: 7,     // Kaç tıkla admin açılır (footer logosu)
  resetDelayMs: 2000,  // Tık sayacı sıfırlama süresi (ms)
};

// ----- Veri Depolama -----
export const STORAGE_KEY = 'toptanambalaj_products_v5'; // localStorage anahtarı

// ============================================================
// TAILWIND CSS TASARIM REHBERİ (KOPYA KAĞIDI)
// ============================================================
// YAZI BOYUTLARI:    text-[8px], text-[10px], text-xs (çok küçük), text-sm (küçük), text-base (normal büyük), text-lg, text-xl, text-2xl, text-3xl, 4xl, 5xl ...
// YAZI KALINLIĞI:    font-light, font-normal, font-medium, font-semibold (yarı kalın), font-bold (kalın), font-extrabold
// KÖŞE YUVARLATMA:   rounded-none, rounded-sm, rounded, rounded-md, rounded-lg, rounded-xl, rounded-2xl, rounded-full
// BOŞLUKLAR (p/m):   p-2, p-4, p-6 (iç boşluk) | mt-2, mt-4 (üstten dış boşluk)
// GÖLGELER:          shadow-sm, shadow, shadow-md, shadow-lg, shadow-xl, shadow-2xl, drop-shadow
// MİN/MAX GENİŞLİK:  max-w-xs, max-w-sm, max-w-md, max-w-lg, max-w-xl VEYA özel yüzdeler max-w-[45%], max-w-[80%] vb.
// ============================================================

// ----- Carousel -----
export const CAROUSEL = {
  intervalMs: 4000,          // Slayt geçiş süresi (ms)
  roundedClass: 'rounded-md',  // Köşe yuvarlama

  // Kutucuk (Glassmorphism) Görünümü
  boxPositionMobile: 'bottom-10 left-4',         // [MOBİL] Kutunun konumu
  boxPositionPC: 'sm:bottom-12 sm:left-10',      // [PC] Kutunun konumu (Geniş ekranlar için sm: veya lg: öneki şarttır)
  boxWidthMobile: 'max-w-[40%]',                 // [MOBİL] Kutu maksimum genişliği
  boxWidthPC: 'sm:max-w-md',                     // [PC] Kutu maksimum genişliği
  boxPaddingMobile: 'p-3',                       // [MOBİL] Kutu iç boşluğu
  boxPaddingPC: 'sm:p-5',                        // [PC] Kutu iç boşluğu
  boxRounding: 'rounded-2xl',                    // Köşe yuvarlama
  boxBg: 'bg-black/25 backdrop-blur-md',         // Arka plan (buzlu cam efekti) 
  boxBorder: 'border border-white/20',           // Kenarlık
  boxShadow: 'shadow-2xl',                       // Derinlik gölgesi

  // Ana Başlık (Label) Tasarımı
  titleSizeMobile: 'text-[14px]',                // [MOBİL] Başlık boyutu
  titleSizePC: 'sm:text-3xl lg:text-4xl',        // [PC] Başlık boyutu
  titleWeight: 'font-extrabold',
  titleColor: 'text-white',
  titleTracking: 'tracking-tight',
  titleShadow: 'drop-shadow',

  // Alt Metin (Sub) Tasarımı
  subSizeMobile: 'text-[10px]',                  // [MOBİL] Alt metin boyutu
  subSizePC: 'sm:text-base',                     // [PC] Alt metin boyutu
  subWeight: 'font-medium',
  subColor: 'text-white/90',
  subLeading: 'leading-relaxed',
  subShadow: 'drop-shadow',
  subSpacing: 'mt-0',                            // Alt metin ile üstteki ana başlık arasındaki boşluk

  slides: [
    {
      id: 1,
      src: 'https://images.pexels.com/photos/1797428/pexels-photo-1797428.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Depo/Raf görünümü
      bg: 'bg-stone-800',
      label: 'Geniş Depo, Hazır Stok',
      sub: 'Aynı gün sevkiyat, minimum sipariş yok.',
    },
    {
      id: 2,
      src: 'https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Ambalaj kutuları görünümü
      bg: 'bg-kraft-800',
      label: 'Her Ölçü, Her Materyal',
      sub: 'Kargo kutusundan streç filme, her ambalaj bizde.',
    },
    {
      id: 3,
      src: 'https://images.pexels.com/photos/236705/pexels-photo-236705.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', // Lojistik koridoru görünümü
      bg: 'bg-stone-700',
      label: "İstoç'tan Bile Ucuz!",
      sub: 'Toptan fiyata perakende kolaylığı.',
    },
  ],
};

// ----- Ürün Grid -----
export const GRID = {
  colsClass: 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6', // Sütun sayısı
  gapClass: 'gap-2',                                      // Kart arası boşluk
};

// ----- Varsayılan Ürünler -----
// Ürün verileri yüzlerce satırı bulabileceği için ayrı dosyaya taşındı: src/data/products.js

// ----- Referans Logoları -----
export const REFERENCES = [
  { id: 1, name: 'PTT Kargo', logo: '🟡' },
  { id: 2, name: 'MNG Kargo', logo: '🔴' },
  { id: 3, name: 'Yurtiçi Kargo', logo: '🟠' },
  { id: 4, name: 'Aras Kargo', logo: '🟣' },
  { id: 5, name: 'UPS', logo: '🟤' },
  { id: 6, name: 'DHL', logo: '⚫' },
  { id: 7, name: 'Trendyol', logo: '🟧' },
  { id: 8, name: 'Hepsiburada', logo: '🟥' },
];

// ----- Ürün Kartı Tipografisi -----
export const CARD_TYPOGRAPHY = {
  // Kategori chip (resim üstü overlay)
  categoryFontSize: 'text-[8px]',             // Çip metin boyutu
  categoryWeight: 'font-semibold',            // Çip metin kalınlığı
  categoryCase: 'uppercase',                  // Çip metni büyük/küçük harf durumu
  categoryTracking: 'tracking-wider',         // Çip harf arası boşluk (harf aralığı)
  categoryColor: 'text-kraft-700',            // Çip yazı rengi
  categoryBg: 'bg-kraft-50',                  // Çip arka plan rengi
  categoryBorder: 'border border-kraft-200',  // Çip kenarlık rengi ve kalınlığı
  categoryRounding: 'rounded-md',             // Çip köşe yuvarlatma miktarı
  categoryPadding: 'px-1.5 py-0.5',           // Çip içi yatay ve dikey boşluk (padding)

  // İsim (tek satır, yatay marquee)
  nameFontSize: 'text-[12px]',                // Ürün adı yazı boyutu
  nameWeight: 'font-semibold',                // Ürün adı yazı kalınlığı
  nameColor: 'text-stone-900',                // Ürün adı yazı rengi
  nameLeading: 'leading-snug',                // Ürün adı satır yüksekliği

  // Fiyat
  priceFontSize: 'text-[16px]',               // Ürün fiyatı yazı boyutu
  priceWeight: 'font-bold',                   // Ürün fiyatı yazı kalınlığı
  priceColor: 'text-stone-900',               // Ürün fiyatı yazı rengi

  // Açıklama (çok satır, dikey oto-kaydırma)
  descFontSize: 'text-[9px]',                 // Açıklama yazı boyutu
  descColor: 'text-stone-500',                // Açıklama yazı rengi
  descLeading: 'leading-tight',               // Açıklama satır yüksekliği
  descMaxHeight: 'max-h-[36px]',              // Açıklama alanı maksimum yüksekliği (kullanıcı görünümü)
  descAreaHeight: 'h-[30px]',                 // Admin editöründeki açıklama kutusu yüksekliği
};
