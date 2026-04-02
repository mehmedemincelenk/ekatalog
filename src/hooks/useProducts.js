import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { useTenant } from './useTenant';

export function useProducts() {
  const { slug } = useTenant();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await db.products.get(slug);
        if (mounted) setProducts(data);
      } catch (err) {
        console.error('Ürünler yüklenirken hata:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, [slug]);

  // Ürünler her değiştiğinde veritabanını (şu an localStorage) güncelle
  useEffect(() => {
    // Sadece ilk yükleme tamamlandıysa kaydet (boş dizi kaydetmemek için)
    if (!isLoading) {
      db.products.update(slug, products).catch(err => {
         console.error('Ürünler kaydedilirken hata:', err);
         alert('Cihaz hafızası dolu olabilir. Lütfen bazı ürünleri silerek yer açın.');
      });
    }
  }, [products, slug, isLoading]);

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

  return { products, updateProduct, removeProduct, addProduct, renameCategory, removeCategoryFromProducts, isLoading };
}
