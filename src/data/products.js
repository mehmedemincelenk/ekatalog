// ============================================================
// ÜRÜN VERİ TABANI
// NOT: Tüm veriler yerel hafıza (localStorage) üzerinde saklanır.
// ============================================================

export const DEFAULT_PRODUCTS = [
  // --- BASKILI ÖZEL ÜRÜNLER (Özel Yapım) ---
  { id: 1, name: 'Baskılı Pipet', category: 'BASKILI ÖZEL ÜRÜNLER', price: 'Fiyat Sorunuz', image: null, description: '' },
  { id: 2, name: 'Baskılı Şeker', category: 'BASKILI ÖZEL ÜRÜNLER', price: 'Fiyat Sorunuz', image: null, description: '' },
  { id: 3, name: 'Baskılı Poşet', category: 'BASKILI ÖZEL ÜRÜNLER', price: 'Fiyat Sorunuz', image: null, description: '' },
  { id: 4, name: 'Baskılı Kağıt', category: 'BASKILI ÖZEL ÜRÜNLER', price: 'Fiyat Sorunuz', image: null, description: '' },
  { id: 5, name: 'Baskılı Mendil', category: 'BASKILI ÖZEL ÜRÜNLER', price: 'Fiyat Sorunuz', image: null, description: '' },
  { id: 6, name: 'Baskılı Kese Kağıdı Çeşitleri', category: 'BASKILI ÖZEL ÜRÜNLER', price: 'Fiyat Sorunuz', image: null, description: '' },

  // --- STREÇ VE FOLYO ÇEŞİTLERİ ---
  { id: 7, name: '1 Adet Streç', category: 'STREÇ VE FOLYO ÇEŞİTLERİ', price: '₺75', image: null, description: '' },
  { id: 8, name: '1 Adet Açık Streç 200 Mt. (İlka)', category: 'STREÇ VE FOLYO ÇEŞİTLERİ', price: '₺95', image: null, description: '' },
  { id: 9, name: '1 Adet Folyo 400 Gram', category: 'STREÇ VE FOLYO ÇEŞİTLERİ', price: '₺85', image: null, description: '' },
  { id: 10, name: '1 Adet 30x1500 Streç', category: 'STREÇ VE FOLYO ÇEŞİTLERİ', price: '₺550', image: null, description: '' },
  { id: 11, name: '1 Adet 45x1500 Streç', category: 'STREÇ VE FOLYO ÇEŞİTLERİ', price: '₺700', image: null, description: '' },
  { id: 12, name: "1 Adet 45'lik Streç 200 Mt.", category: 'STREÇ VE FOLYO ÇEŞİTLERİ', price: '₺85', image: null, description: '' },
  { id: 13, name: '1 Adet Folyo 1 Kg', category: 'STREÇ VE FOLYO ÇEŞİTLERİ', price: '₺170', image: null, description: '' },
  { id: 14, name: 'Streç Folyo (Çeşitleri)', category: 'STREÇ VE FOLYO ÇEŞİTLERİ', price: 'Fiyat Sorunuz', image: null, description: '' },
  { id: 15, name: 'Patpat 50 Mt', category: 'STREÇ VE FOLYO ÇEŞİTLERİ', price: '₺250', image: null, description: '' },

  // --- ALÜMİNYUM ÇEŞİTLERİ ---
  { id: 16, name: '100 Adet Sütlaç Kabı', category: 'ALÜMİNYUM ÇEŞİTLERİ', price: '₺80', image: null, description: '' },
  { id: 17, name: '100 Adet 250 Gr Alüminyum + Kap', category: 'ALÜMİNYUM ÇEŞİTLERİ', price: '₺145', image: null, description: '' },
  { id: 18, name: '100 Adet 350 Gr Alüminyum + Kap', category: 'ALÜMİNYUM ÇEŞİTLERİ', price: '₺150', image: null, description: '' },
  { id: 19, name: '100 Adet 500 Gr Alüminyum + Kap', category: 'ALÜMİNYUM ÇEŞİTLERİ', price: '₺185', image: null, description: '' },
  { id: 20, name: '100 Adet 750 Gr Alüminyum + Kap', category: 'ALÜMİNYUM ÇEŞİTLERİ', price: '₺230', image: null, description: '' },
  { id: 21, name: '100 Adet 1 Kg Alüminyum + Kap', category: 'ALÜMİNYUM ÇEŞİTLERİ', price: '₺265', image: null, description: '' },
  { id: 22, name: '100 Adet 1.5 Kg Alüminyum + Kap', category: 'ALÜMİNYUM ÇEŞİTLERİ', price: '₺320', image: null, description: '' },
  { id: 23, name: '100 Adet 3 Gözlü Alüminyum + Kap', category: 'ALÜMİNYUM ÇEŞİTLERİ', price: '₺320', image: null, description: '' },
  { id: 24, name: '100 Adet 2 Gözlü Alüminyum + Kap', category: 'ALÜMİNYUM ÇEŞİTLERİ', price: '₺320', image: null, description: '' },
  { id: 25, name: '100 Adet Künefe + Kap', category: 'ALÜMİNYUM ÇEŞİTLERİ', price: '₺180', image: null, description: '' },
  { id: 26, name: '25 Adet Oval Tepsi', category: 'ALÜMİNYUM ÇEŞİTLERİ', price: '₺155', image: null, description: '' },
  { id: 27, name: 'Alüminyum (Genel Çeşitler)', category: 'ALÜMİNYUM ÇEŞİTLERİ', price: 'Fiyat Sorunuz', image: null, description: '' },

  // --- POŞET VE NAYLON ÇEŞİTLERİ ---
  { id: 28, name: '1 Kg. Orta Poşet Dökme', category: 'POŞET VE NAYLON ÇEŞİTLERİ', price: '₺44', image: null, description: '' },
  { id: 29, name: 'Orta Boy Poşet 1 Kg (Ambalajcım)', category: 'POŞET VE NAYLON ÇEŞİTLERİ', price: '₺40', image: null, description: '' },
  { id: 30, name: '500 Gr. Dürüm Hışır Poşet', category: 'POŞET VE NAYLON ÇEŞİTLERİ', price: '₺48', image: null, description: '' },
  { id: 31, name: '1 Kg. Yapışkanlı Set Poşeti', category: 'POŞET VE NAYLON ÇEŞİTLERİ', price: '₺125', image: null, description: '' },
  { id: 32, name: '1 Paket Küçük Hışır 250 Adet', category: 'POŞET VE NAYLON ÇEŞİTLERİ', price: '₺35', image: null, description: '' },
  { id: 33, name: '1 Paket Orta Hışır 250 Adet', category: 'POŞET VE NAYLON ÇEŞİTLERİ', price: '₺43', image: null, description: '' },
  { id: 34, name: 'Florex Çöp Poşeti 400 Gr. 80x110', category: 'POŞET VE NAYLON ÇEŞİTLERİ', price: '₺26', image: null, description: '' },
  { id: 35, name: 'Çöp Poşeti 80x110 - 70x90', category: 'POŞET VE NAYLON ÇEŞİTLERİ', price: '₺25', image: null, description: '' },
  { id: 36, name: '10 Kg. Dökme Çöp 80x110', category: 'POŞET VE NAYLON ÇEŞİTLERİ', price: '₺385', image: null, description: '' },
  { id: 37, name: '2000 Ad. Kilit Torba 5x5', category: 'POŞET VE NAYLON ÇEŞİTLERİ', price: '₺185', image: null, description: '' },
  { id: 38, name: '2000 Ad. Kilit Torba 6x7', category: 'POŞET VE NAYLON ÇEŞİTLERİ', price: '₺185', image: null, description: '' },
  { id: 39, name: '1500 Ad. Kilit Torba 7x9', category: 'POŞET VE NAYLON ÇEŞİTLERİ', price: '₺185', image: null, description: '' },
  { id: 40, name: 'Poşet & Naylon (Genel)', category: 'POŞET VE NAYLON ÇEŞİTLERİ', price: 'Fiyat Sorunuz', image: null, description: '' },

  // --- DETERJAN VE TEMİZLİK GRUBU ---
  { id: 41, name: 'Çamaşır Suyu Start 5 Lt', category: 'DETERJAN VE TEMİZLİK', price: '₺100', image: null, description: '' },
  { id: 42, name: 'Çamaşır Suyu Start 30 Lt', category: 'DETERJAN VE TEMİZLİK', price: '₺400', image: null, description: '' },
  { id: 43, name: 'Tetik Çamaşır Suyu', category: 'DETERJAN VE TEMİZLİK', price: '₺30', image: null, description: '' },
  { id: 44, name: 'Çamaşır Sodası 500 Gr', category: 'DETERJAN VE TEMİZLİK', price: '₺30', image: null, description: '' },
  { id: 45, name: 'Bulaşık Deterjanı Pril 5 Lt', category: 'DETERJAN VE TEMİZLİK', price: '₺150', image: null, description: '' },
  { id: 46, name: 'Bulaşık Deterjanı Formül 750 Ml', category: 'DETERJAN VE TEMİZLİK', price: '₺30', image: null, description: '' },
  { id: 47, name: 'Pak Bulaşık Deterjanı Ekstra 20 Kg', category: 'DETERJAN VE TEMİZLİK', price: '₺450', image: null, description: '' },
  { id: 48, name: 'Yüzey Temizleyici Start 5 Lt', category: 'DETERJAN VE TEMİZLİK', price: '₺100', image: null, description: '' },
  { id: 49, name: 'Yüzey Temizleyici Start 30 Lt', category: 'DETERJAN VE TEMİZLİK', price: '₺400', image: null, description: '' },
  { id: 50, name: 'Camsil Start 5 Lt', category: 'DETERJAN VE TEMİZLİK', price: '₺100', image: null, description: '' },
  { id: 51, name: 'Köpük Sabun Start 5 Lt', category: 'DETERJAN VE TEMİZLİK', price: '₺100', image: null, description: '' },
  { id: 52, name: 'Tetik Aspirin 5 Lt', category: 'DETERJAN VE TEMİZLİK', price: '₺100', image: null, description: '' },
  { id: 53, name: 'Tetik Arap Sabunu 5 Lt', category: 'DETERJAN VE TEMİZLİK', price: '₺100', image: null, description: '' },
  { id: 54, name: 'Tetik Arap Sabunu 1 Lt', category: 'DETERJAN VE TEMİZLİK', price: '₺45', image: null, description: '' },
  { id: 55, name: 'Dalan Sıvı Sabun 3 Lt', category: 'DETERJAN VE TEMİZLİK', price: '₺70', image: null, description: '' },
  { id: 56, name: 'Papilion Sıvı Sabun 1.5 Lt', category: 'DETERJAN VE TEMİZLİK', price: '₺40', image: null, description: '' },
  { id: 57, name: 'Sir Pro Güç 1 Lt', category: 'DETERJAN VE TEMİZLİK', price: '₺60', image: null, description: '' },
  { id: 58, name: 'Katı Jel 9 Kg', category: 'DETERJAN VE TEMİZLİK', price: '₺425', image: null, description: 'Stok Sorunuz' },
  { id: 59, name: "Temizlik Havlusu Sleepy 100'lü", category: 'DETERJAN VE TEMİZLİK', price: '₺75', image: null, description: '' },
  { id: 60, name: "Islak Mendil 120'li", category: 'DETERJAN VE TEMİZLİK', price: '₺25', image: null, description: '' },
  { id: 61, name: 'Hareket Havlu 25 Kg', category: 'DETERJAN VE TEMİZLİK', price: '₺200', image: null, description: '' },
  { id: 62, name: 'Mikro Fiber Bez Mavi / Temizlik Bezi', category: 'DETERJAN VE TEMİZLİK', price: '₺15', image: null, description: '' },
  { id: 63, name: "Tuvalet Kağıdı Papilion 40'lı", category: 'DETERJAN VE TEMİZLİK', price: '₺175', image: null, description: '' },

  // --- AMBALAJ VE SARF MALZEMELERİ ---
  { id: 64, name: "Siyah Eldiven (M) Beden 100'lü", category: 'AMBALAJ VE SARF', price: '₺100', image: null, description: '' },
  { id: 65, name: "Karton Bardak 50'li", category: 'AMBALAJ VE SARF', price: '₺15', image: null, description: '' },
  { id: 66, name: 'Pipet Çeşitleri', category: 'AMBALAJ VE SARF', price: '₺15', image: null, description: '' },
  { id: 67, name: 'Boş Koli 60x60', category: 'AMBALAJ VE SARF', price: '₺35', image: null, description: '' },
  { id: 68, name: 'Koli Bandı', category: 'AMBALAJ VE SARF', price: '₺35', image: null, description: '' },
  { id: 69, name: 'Küçük Köpük Tabak', category: 'AMBALAJ VE SARF', price: '₺40', image: null, description: '' },
  { id: 70, name: 'Büyük Köpük Tabak', category: 'AMBALAJ VE SARF', price: '₺160', image: null, description: '' },
  { id: 71, name: '100 Ad. Bone', category: 'AMBALAJ VE SARF', price: '₺50', image: null, description: '' },
  { id: 72, name: '100 Ad. Kolluk', category: 'AMBALAJ VE SARF', price: '₺50', image: null, description: '' },
  { id: 73, name: '1000 Ad. Tahta Karıştırıcı', category: 'AMBALAJ VE SARF', price: '₺35', image: null, description: '' },
  { id: 74, name: '1000 Ad. Cips Çatalı', category: 'AMBALAJ VE SARF', price: '₺45', image: null, description: '' },
  { id: 75, name: 'Kağıt & Kese Kağıdı', category: 'AMBALAJ VE SARF', price: 'Fiyat Sorunuz', image: null, description: '' },

  // --- GIDA VE SOS GRUBU ---
  { id: 76, name: 'Salatalık Turşusu Kova', category: 'GIDA VE SOS GRUBU', price: '₺315', image: null, description: '' },
  { id: 77, name: 'Domates Salçası 4.3 Kg', category: 'GIDA VE SOS GRUBU', price: '₺200', image: null, description: '' },
  { id: 78, name: 'Gold Ketçap 9 Kg', category: 'GIDA VE SOS GRUBU', price: '₺200', image: null, description: '' },
  { id: 79, name: 'Gold Mayonez 8 Kg', category: 'GIDA VE SOS GRUBU', price: '₺200', image: null, description: '' },
  { id: 80, name: 'Burcu Ketçap 9 Kg', category: 'GIDA VE SOS GRUBU', price: '₺275', image: null, description: '' },
  { id: 81, name: 'Burcu Mayonez 8 Kg', category: 'GIDA VE SOS GRUBU', price: '₺290', image: null, description: '' },
  { id: 82, name: 'Nar Ekşisi 1 Lt', category: 'GIDA VE SOS GRUBU', price: '₺35', image: null, description: '' },
  { id: 83, name: 'Bardak Su Koli', category: 'GIDA VE SOS GRUBU', price: '₺250', image: null, description: '' },
  { id: 84, name: "0.5 Lt Su Koli 12'li", category: 'GIDA VE SOS GRUBU', price: '₺35', image: null, description: '' },
  { id: 85, name: 'Sızma Zeytinyağı 5 Lt', category: 'GIDA VE SOS GRUBU', price: 'Fiyat Sorunuz', image: null, description: '' },

  // --- HAZIR SET VE HİJYEN ---
  { id: 86, name: "1 Koli Lux 6'lı İkram Seti", category: 'HAZIR SET VE HİJYEN', price: '₺475', image: null, description: '' },
  { id: 87, name: "1 Koli 5'li Lux Set", category: 'HAZIR SET VE HİJYEN', price: '₺425', image: null, description: '' },
  { id: 88, name: "1 Koli Dürüm Set 4'lü", category: 'HAZIR SET VE HİJYEN', price: '₺550', image: null, description: '' },
  { id: 89, name: '100 Ad. Siyah Eldiven L', category: 'HAZIR SET VE HİJYEN', price: '₺120', image: null, description: '' },
  { id: 90, name: '100 Ad. Eldiven Cerrah L', category: 'HAZIR SET VE HİJYEN', price: '₺115', image: null, description: '' },
  { id: 91, name: '1 Lt. Dezenfektan', category: 'HAZIR SET VE HİJYEN', price: '₺50', image: null, description: '' },
  { id: 92, name: '5 Lt. Kolonya Limon', category: 'HAZIR SET VE HİJYEN', price: '₺300', image: null, description: '' },
];
