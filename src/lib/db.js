// Supabase Mock Servisi (SaaS Veri Katmanı)
// İleride gerçek Supabase entegrasyonu yapıldığında sadece bu dosya güncellenecektir.

import { DEFAULT_BRANDING } from '../data/config';
import { DEFAULT_PRODUCTS } from '../data/products';

const getStorageKey = (table, slug) => `ekatalog_${table}_${slug}`;

export const db = {
  stores: {
    get: async (slug) => {
      const data = localStorage.getItem(getStorageKey('store', slug));
      if (data) return JSON.parse(data);

      // Varsayılan store objesi
      return {
        id: slug === 'demo' ? 'demo_store_id' : Date.now().toString(),
        slug: slug,
        ownerPhone: null,
        paid_until: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 gün deneme
        createdAt: new Date().toISOString()
      };
    },
    update: async (slug, updates) => {
      const store = await db.stores.get(slug);
      const updatedStore = { ...store, ...updates };
      localStorage.setItem(getStorageKey('store', slug), JSON.stringify(updatedStore));
      return updatedStore;
    }
  },

  settings: {
    get: async (slug) => {
      const data = localStorage.getItem(getStorageKey('settings', slug));
      if (data) return JSON.parse(data);
      return DEFAULT_BRANDING;
    },
    update: async (slug, updates) => {
      const settings = await db.settings.get(slug);
      const updatedSettings = { ...settings, ...updates };
      localStorage.setItem(getStorageKey('settings', slug), JSON.stringify(updatedSettings));
      return updatedSettings;
    }
  },

  products: {
    get: async (slug) => {
      const data = localStorage.getItem(getStorageKey('products', slug));
      if (data) {
        const parsed = JSON.parse(data);
        // Resimleri default datadan tamamla (mock ortamı için)
        return parsed.map(p => {
          if (!p.image) {
            const defItem = DEFAULT_PRODUCTS.find(d => d.id === p.id);
            if (defItem && defItem.image) return { ...p, image: defItem.image };
          }
          return p;
        });
      }
      return slug === 'demo' ? DEFAULT_PRODUCTS : [];
    },
    update: async (slug, productsList) => {
      localStorage.setItem(getStorageKey('products', slug), JSON.stringify(productsList));
      return productsList;
    }
  }
};
