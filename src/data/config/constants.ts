// FILE ROLE: Global Configuration & Immutable Technical Sabitler
// CONSUMED BY: settings, theme, components, hooks
/**
 * DEFAULT COMPANY SETTINGS (Premium Global Template)
 */
export const DEFAULT_COMPANY = {
  name: 'Yeni Mağazanız',
  tagline: 'Dijital Katalog ve Sipariş Platformu',
  phone: '05XX XXX XX XX',
  address: 'Mağaza Adresiniz Buraya Gelecek',
  instagramUrl: 'https://instagram.com/katalogunuz',
  logoUrl: '/images/default-logo.png',
  displayConfig: {
    showAddress: true,
    showInstagram: true,
    showWhatsapp: true,
    showReferences: true,
    showPrice: true,
    showCarousel: true,
    showCoupons: true,
    showPriceList: true,
    showCurrency: true,
    showSearch: true,
    showCategories: true,
    showLogo: true,
    showSubtitle: true,
  },
  announcementBar: {
    enabled: false,
    text: '',
  },
  socialProofCards: [
    '📋 340+ Ürün, 12 Kategoride Profesyonel Katalog',
    '⚡ Hızlı Sipariş ve Anında WhatsApp Desteği',
    "🚛 Tüm Türkiye'ye Güvenli Gönderim Seçenekleri",
    '🔥 En Çok Tercih Edilen Ürünleri İnceleyin',
  ],
  maintenanceMode: {
    enabled: false,
    message:
      'Sistemlerimiz güncelleniyor. Kısa süre içinde tekrar hizmetinizdeyiz.',
  },
};

/**
 * DEFAULT CAROUSEL DATA (Neutral Sample Slides)
 */
export const CAROUSEL = {
  slides: [
    {
      id: 1,
      src: '',
      bg: 'bg-stone-50',
      label: 'Yeni Sezon',
      sub: 'Mağazanızın en yeni ürünlerini burada sergileyin.',
    },
    {
      id: 2,
      src: '',
      bg: 'bg-stone-100',
      label: 'Hızlı Sipariş',
      sub: 'Müşterileriniz WhatsApp üzerinden size anında ulaşsın.',
    },
    {
      id: 3,
      src: '',
      bg: 'bg-stone-200',
      label: '7/24 Açık',
      sub: 'Dijital vitrininiz her an yayında.',
    },
  ],
};

export const CATEGORY_ORDER: string[] = [];

export const REFERENCES = [
  { id: 1, name: 'Lider İş Ortakları', logo: '🤝' },
  { id: 2, name: 'Güvenli Ödeme', logo: '🛡️' },
  { id: 3, name: 'Hızlı Kargo', logo: '🚀' },
  { id: 4, name: 'Müşteri Memnuniyeti', logo: '⭐' },
];

export const TECH = {
  adminTriggerClicks: 3,
  adminResetDelay: 2000,
  searchDebounceMs: 300,
  offHours: { start: 23, end: 7 },
  auth: {
    sessionActiveValue: 'authorized_admin_active',
    pinLength: 4,
    timeoutMs: 3600000, // 1 hour inactivity timeout
  },
  notifications: {
    telegram: {
      enabled: true,
      botToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '',
      chatId: import.meta.env.VITE_TELEGRAM_CHAT_ID || '',
    },
  },
  carousel: {
    intervalMs: 8000, // Slightly slower for better readability
    swipeThreshold: 50,
  },
  category: {
    desktopThreshold: 6,
  },
  discount: {
    min: 1,
    max: 99,
    errorResetMs: 3000,
  },
  products: {
    defaultCategory: 'DİĞER',
    defaultPrice: '0,00',
    fallbackCategory: 'DÜZENLENMEMİŞ KATEGORİ',
    maxFileNameLength: 40,
    uniqueIdSuffixLength: 6,
  },
  storage: {
    bucket: 'product-images',
    heroFolder: 'hero',
    lqFolder: 'lq',
    hqFolder: 'hq',
    cacheControl: '0',
    heroWidth: 1920,
    productHqWidth: 1200,
    productLqWidth: 400,
    hqQuality: 0.85,
    lqQuality: 0.5,
    placeholderEmoji: '📦',
  },
  commerce: {
    locale: 'tr-TR',
    currency: 'TRY',
    currencySymbol: '₺',
  },
};

export const STORAGE = {
  productsCache: 'ekatalog_inventory_persistence',
  categoryOrder: 'ekatalog_category_meta',
  carouselSlides: 'ekatalog_branding_assets',
  adminSession: 'ekatalog_secure_session_lock',
};

export interface ProductTemplate {
  id: string;
  name: string;
  category: string;
  price: string;
  description: string;
  image_url: string;
}

export const DEFAULT_TEMPLATES: ProductTemplate[] = [
  {
    id: 'temp_cortado',
    name: 'Cortado',
    category: 'Nitelikli Kahveler',
    price: '120',
    description: 'Özel kavrulmuş espresso ve kadifemsi süt kremasının dengeli buluşması.',
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'temp_v60',
    name: 'V60 Drip Brew',
    category: 'Nitelikli Kahveler',
    price: '140',
    description: 'Tek kökenli (Single Origin) nitelikli çekirdeklerden filtreleme yöntemiyle demlenmiş berrak gövdeli filtre kahve.',
    image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'temp_latte',
    name: 'Salted Caramel Latte',
    category: 'Nitelikli Kahveler',
    price: '160',
    description: 'Ev yapımı tuzlu karamel sosu, espresso ve ipeksi süt köpüğü.',
    image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'temp_truffle_burger',
    name: 'Truffle Mushroom Burger',
    category: 'Artizan Burgerler',
    price: '380',
    description: '180g artizan köfte, trüflü mayonez, karamelize mantar ve erimiş cheddar peyniri.',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'temp_sig_burger',
    name: 'Vibe Signature Burger',
    category: 'Artizan Burgerler',
    price: '410',
    description: 'Özel Vibe sos, çift cheddar, karamelize soğan, çıtır füme et ve sulu burger köftesi.',
    image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'temp_chicken_burger',
    name: 'Crispy Chicken Brioche',
    category: 'Artizan Burgerler',
    price: '340',
    description: 'Altın sarısı çıtır tavuk göğsü, brioche ekmeğinde marul, turşu ve ballı hardal sosu.',
    image_url: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'temp_san_sebastian',
    name: 'San Sebastian Cheesecake',
    category: 'Butik Tatlılar',
    price: '220',
    description: 'İçi akışkan, üzeri mükemmel karamelize olmuş yanık Bask cheesecake\'i.',
    image_url: 'https://images.unsplash.com/photo-1524351199679-46cddf530c04?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'temp_tiramisu',
    name: 'Lotus Biscoff Tiramisu',
    category: 'Butik Tatlılar',
    price: '210',
    description: 'Mascarpone kreması ve Lotus Biscoff bisküvi katmanları ile modern İtalyan klasiği.',
    image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'temp_paris_brest',
    name: 'Pistachio Paris-Brest',
    category: 'Butik Tatlılar',
    price: '240',
    description: 'Halka choux hamuru arasında yoğun Antep fıstıklı pralin krema dolgusu.',
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'temp_cold_brew',
    name: 'Cold Brew Coffee',
    category: 'Öne Çıkanlar',
    price: '150',
    description: '18 saat boyunca soğuk suyla damıtılarak hazırlanmış yumuşak içimli soğuk demlenmiş kahve.',
    image_url: 'https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'temp_avocado_toast',
    name: 'Smashed Avocado Toast',
    category: 'Öne Çıkanlar',
    price: '290',
    description: 'Ekşi mayalı çıtır ekmek üzerinde ezilmiş avokado, çırpılmış yumurta ve taze baharatlar.',
    image_url: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'temp_waffle',
    name: 'Red Velvet Waffle',
    category: 'Öne Çıkanlar',
    price: '260',
    description: 'Kırmızı kadife waffle hamuru, taze çilek, muz, çikolata sosu ve beyaz çikolata kreması.',
    image_url: 'https://images.unsplash.com/photo-1562376502-6f769499c886?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'temp_koli',
    name: 'Karton Koli',
    category: 'Ambalaj',
    price: '15',
    description: 'Dayanıklı, çift oluklu kraft mukavvadan üretilmiş taşıma ve kargo kolisi.',
    image_url: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'temp_pizza_box',
    name: 'Lüks Pizza Kutusu',
    category: 'Ambalaj',
    price: '8',
    description: 'Gıda temasına uygun, ısı yalıtımlı ve havalandırma delikli mikro-dopel karton pizza kutusu.',
    image_url: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'temp_kraft_bag',
    name: 'Kraft Karton Çanta',
    category: 'Ambalaj',
    price: '12',
    description: 'Büküm saplı, doğa dostu geri dönüştürülebilir ambalaj ve servis kraft çanta.',
    image_url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=600&auto=format&fit=crop&q=80'
  }
];
