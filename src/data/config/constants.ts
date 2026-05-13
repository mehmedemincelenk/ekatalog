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

