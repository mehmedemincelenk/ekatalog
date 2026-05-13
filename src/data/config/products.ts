// ============================================================
// DEFAULT PRODUCTS (YEDEK ÜRÜN HAVUZU)
// ============================================================
/**
 * KURUCU NOTU:
 * Bu dosya senin mağazanın "Sigortası"dır.
 *
 * TEORİK MANTIK:
 * Eğer veritabanı bağlantısında bir sorun olursa veya internet kesilirse,
 * sitenin tamamen boş görünmemesi için bu listedeki ürünler devreye girer.
 *
 * TEKNİK MANTIK:
 * 'DEFAULT_PRODUCTS' bir dizidir (Array). İçindeki her obje bir ürünü temsil eder.
 */

import { Product } from '../../types';

export const DEFAULT_PRODUCTS: Product[] = [
  // Örnek: Eğer Sheets boşsa mağazada görünecek temel ürünler buraya eklenebilir.
  /* 
  {
    id: 'starter-1',
    name: 'Örnek Kraft Kutu',
    category: 'Kargo Kutusu',
    price: '₺10,00',
    image: null,
    description: 'Varsayılan başlangıç ürünü.',
    inStock: true,
    is_archived: false
  }
  */
];
