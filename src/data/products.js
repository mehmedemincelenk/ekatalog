// ============================================================
// E-KATALOG ÜRÜN VERİ TABANI (ŞABLON)
// NOT: Bu dosya başlangıç (fallback) ürünlerini içerir. 
// Yeni ürünler localStorage veya Backend üzerinden yönetilir.
// ============================================================

export const DEFAULT_PRODUCTS = [
  { 
    id: 1, 
    name: 'Örnek Ürün', 
    category: 'Genel', 
    price: '₺100', 
    image: null, 
    description: 'Bu bir örnek ürün açıklamasıdır.\nMağaza yönetiminden bu ürünü silebilir veya düzenleyebilirsiniz.' 
  }
];
