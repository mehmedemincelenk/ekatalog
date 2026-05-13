import { create } from 'zustand';
import { CompanySettings, StoreState } from './types';
import { TECH, LABELS } from './data/config';

/**
 * STORE.TS (DÜKKANIN ORTAK AKLI)
 * ----------------------------
 * Dükkanın tüm global durumlarını (admin modu, ayarlar vb.)
 * merkezi bir yerden yöneten akıllı pano.
 */

let errorTimer: NodeJS.Timeout | null = null;

export const useStore = create<StoreState>((set) => ({
  // Admin Modu (Sayfa yenilendiğinde sıfırlanması için direkt false başlar)
  isAdmin: false,
  setIsAdmin: (status: boolean) => set({ isAdmin: status }),

  adminPin: typeof window !== 'undefined' ? 
    sessionStorage.getItem('ekatalog_admin_pin') : null,
  setAdminPin: (pin: string | null) => {
    if (pin) sessionStorage.setItem('ekatalog_admin_pin', pin);
    else sessionStorage.removeItem('ekatalog_admin_pin');
    set({ adminPin: pin });
  },

  // Dükkan Ayarları
  settings: null,
  setSettings: (settings: CompanySettings) => set({ settings }),
  updateSetting: <K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) =>
    set((state: StoreState) => ({
      settings: state.settings
        ? ({ ...state.settings, [key]: value } as CompanySettings)
        : null,
    })),

  // Katalog UI Kontrolleri
  searchQuery: '',
  setSearchQuery: (query: string) => set({ searchQuery: query }),

  activeCategories: [],
  toggleCategory: (category: string) =>
    set((state: StoreState) => {
      // "Tüm Ürünler" or special clear signal
      if (category === 'ALL_PRODUCTS') {
        return { activeCategories: [] };
      }
      
      return {
        activeCategories: state.activeCategories.includes(category)
          ? state.activeCategories.filter((c: string) => c !== category)
          : [...state.activeCategories, category],
      };
    }),
  clearCategories: () => set({ activeCategories: [] }),

  visitorCurrency:
    (localStorage.getItem('ekatalog_visitor_currency') as
      | 'TRY'
      | 'USD'
      | 'EUR') || 'TRY',
  toggleVisitorCurrency: () =>
    set((state: StoreState) => {
      const cycle: Record<string, 'TRY' | 'USD' | 'EUR'> = {
        TRY: 'USD',
        USD: 'EUR',
        EUR: 'TRY',
      };
      const next = cycle[state.visitorCurrency] || 'TRY';
      localStorage.setItem('ekatalog_visitor_currency', next);
      return { visitorCurrency: next };
    }),

  exchangeRates: null,
  setExchangeRates: (rates: { usd: number; eur: number }) => set({ exchangeRates: rates }),

  // Promosyonlar
  activeDiscount: null,
  setActiveDiscount: (discount: { code: string; rate: number; category?: string } | null) =>
    set({ activeDiscount: discount }),
  discountError: null,
  applyDiscountCode: (rawInput: string) => {
    const sanitizedCode = rawInput.toUpperCase().trim();
    if (errorTimer) clearTimeout(errorTimer);

    if (!sanitizedCode) {
      set({ activeDiscount: null, discountError: null });
      return;
    }

    const discountMatch = sanitizedCode.match(/(\d+)$/);
    if (discountMatch && discountMatch[1]) {
      const parsedRate = parseInt(discountMatch[1], 10);
      if (parsedRate >= TECH.discount.min && parsedRate <= TECH.discount.max) {
        set({
          activeDiscount: { code: sanitizedCode, rate: parsedRate / 100 },
          discountError: null,
        });
      } else {
        set({ activeDiscount: null, discountError: LABELS.discount.invalidRate });
        errorTimer = setTimeout(() => set({ discountError: null }), TECH.discount.errorResetMs);
      }
    } else {
      set({ activeDiscount: null, discountError: LABELS.discount.invalidCode });
      errorTimer = setTimeout(() => set({ discountError: null }), TECH.discount.errorResetMs);
    }
  },
  
  isInlineEnabled: typeof window !== 'undefined' ? 
    (localStorage.getItem('ekatalog_inline_edit_v1') !== 'false') : true,
  toggleInlineEdit: () => set((state) => {
    const next = !state.isInlineEnabled;
    localStorage.setItem('ekatalog_inline_edit_v1', String(next));
    return { isInlineEnabled: next };
  }),

  // UI / Modal Management
  activeModal: null,
  modalData: null,
  openModal: (type, data = null) => set({ activeModal: type, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  // Workspace
  isWorkspaceOpen: false,
  toggleWorkspace: () => set((state) => ({ isWorkspaceOpen: !state.isWorkspaceOpen })),

  // Global Feedback
  feedbackStatus: 'idle',
  feedbackMessage: '',
  showFeedback: (type, message = '', duration = 1500) => {
    set({ feedbackStatus: type, feedbackMessage: message });
    setTimeout(() => {
      set({ feedbackStatus: 'idle', feedbackMessage: '' });
    }, duration);
  },
  hideFeedback: () => set({ feedbackStatus: 'idle', feedbackMessage: '' }),
}));
