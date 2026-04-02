// ============================================================
// SaaS MERKEZ KONFİGÜRASYON — Tüm platform ayarları burada
// ============================================================

// ----- Varsayılan Marka Ayarları (Yeni dükkanlar için) -----
export const DEFAULT_BRANDING = {
  name: 'E-Katalog',
  tagline: 'Dijital Ürün Kataloğunuz',
  phone: '',
  whatsappNo: '',
  address: '',
  email: '',
  logoEmoji: '📱',
  colors: {
    primary: '#1c1917',   // stone-900
    secondary: '#78716c', // stone-500
    accent: '#f59e0b',    // amber-500
    bg: '#fafaf9',        // stone-50
  }
};

// ----- Navbar Tasarımı -----
export const NAVBAR = {
  heightClass: 'h-14',
  bgClass: 'bg-white',
  borderClass: 'border-b border-stone-200',
  shadowClass: 'shadow-sm',
  logoEmojiSize: 'text-[24px]',
  logoNameSize: 'text-[14px]',
  logoTaglineSize: 'text-[10px]',
};

// ----- Admin Modu -----
export const ADMIN = {
  triggerClicks: 7,
  resetDelayMs: 2000,
};

// ----- Veri Depolama (SaaS Dinamik Yapı) -----
export const getStorageKey = (slug = 'default') => `ekatalog_${slug}_v1`;

// ----- UI / Modal Tasarımı -----
export const MODAL = {
  bgClass: 'bg-white',
  maxWidthClass: 'max-w-sm',
  roundingClass: 'rounded-xl',
  shadowClass: 'shadow-2xl',
  overlayBg: 'bg-black/50',
};

// ----- Varsayılan Carousel (Şablon) -----
export const DEFAULT_CAROUSEL = {
  intervalMs: 5000,
  slides: [
    {
      id: 1,
      src: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      bg: 'bg-stone-800',
      label: 'Kataloğunuza Hoş Geldiniz',
      sub: 'Ürünlerinizi sergilemeye hemen başlayın.',
    }
  ],
};

// ----- Ürün Grid -----
export const GRID = {
  colsClass: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
  gapClass: 'gap-3',
  headerClass: 'text-sm font-bold text-stone-500 uppercase tracking-widest border-b border-stone-200 pb-2 mb-4 mt-10 first:mt-2',
};

// ----- Kategori Yardımcıları -----
export const sortCategories = (categoriesList, order = []) => {
  return [...categoriesList].sort((a, b) => {
    let indexA = order.indexOf(a);
    let indexB = order.indexOf(b);
    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;
    if (indexA === indexB) return a.localeCompare(b);
    return indexA - indexB;
  });
};

// ----- Referanslar (SaaS için pasifize edilebilir) -----
export const REFERENCES = [];

// ----- Ürün Kartı Tipografisi (Genel) -----
export const CARD_TYPOGRAPHY = {
  categoryFontSize: 'text-[10px]',
  categoryWeight: 'font-bold',
  categoryCase: 'uppercase',
  categoryColor: 'text-stone-600',
  categoryBg: 'bg-stone-100',
  categoryRounding: 'rounded',
  categoryPadding: 'px-2 py-0.5',

  nameFontSize: 'text-sm',
  nameWeight: 'font-semibold',
  nameColor: 'text-stone-900',

  priceFontSize: 'text-base',
  priceWeight: 'font-bold',
  priceColor: 'text-stone-900',

  descFontSize: 'text-xs',
  descColor: 'text-stone-500',
  descMaxHeight: 'max-h-[40px]',
};

export const CARD_LAYOUT = {
  iconSmall: 'w-5 h-5',
  iconMedium: 'w-7 h-7',
  cardInfoPadding: 'p-3',
  gapSmall: 'gap-2',
};
