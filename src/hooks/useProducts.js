import { useState, useEffect } from 'react';
import { getStorageKey } from '../data/config';
import { DEFAULT_PRODUCTS } from '../data/products';

export function useProducts() {
  const slug = 'demo'; // Şimdilik statik, 3. aşamada dinamikleşecek
  const storageKey = getStorageKey(slug);

  const [products, setProducts] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Eksik resimleri DEFAULT_PRODUCTS içindeki veritabanından çekerek canlı kataloğa enjekte et
        return parsed.map(p => {
          if (!p.image) {
            const defItem = DEFAULT_PRODUCTS.find(d => d.id === p.id);
            if (defItem && defItem.image) return { ...p, image: defItem.image };
          }
          return p;
        });
      }
      return DEFAULT_PRODUCTS;
    } catch {
      return DEFAULT_PRODUCTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(products));
    } catch (err) {
      console.error('Storage Hatası:', err);
      alert('Cihaz hafızası (5MB) doldu! Hata: ' + err.message + '\nLütfen sayfayı yenileyin ve çalışmaya devam etmek için eski ürünleri veya yüksek boyutlu resimleri silerek yer açın.');
    }
  }, [products]);

  const addProduct = (product) => {
    const newProduct = { ...product, id: Date.now() };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const removeProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateProduct = (id, changes) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...changes } : p))
    );
  };

  const renameCategory = (oldName, newName) => {
    if (!oldName || !newName || oldName === newName) return;
    setProducts((prev) => prev.map((p) => (p.category === oldName ? { ...p, category: newName } : p)));
  };

  const removeCategoryFromProducts = (catName) => {
    if (!catName) return;
    setProducts((prev) => prev.map((p) => (p.category === catName ? { ...p, category: null } : p)));
  };

  return { products, updateProduct, removeProduct, addProduct, renameCategory, removeCategoryFromProducts };
}
