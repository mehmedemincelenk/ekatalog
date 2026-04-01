import { useState, useEffect } from 'react';
import { STORAGE_KEY } from '../data/config';
import { DEFAULT_PRODUCTS } from '../data/products';

export function useProducts() {
  const [products, setProducts] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_PRODUCTS;
    } catch {
      return DEFAULT_PRODUCTS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
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
