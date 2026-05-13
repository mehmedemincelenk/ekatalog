import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ExchangeRates, Product } from '../types';
export * from './price';

/**
 * CORE UTILITIES (DIAMOND ENGINE)
 * -----------------------------------------------------------
 * The unified nerve center for UI merging, price logic, 
 * store resolution, and text normalization.
 */

// --- 0. DATA CONVERTERS ---

/**
 * fileToBase64: Universal converter for files/blobs.
 */
export async function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
}

/**
 * base64ToBlob: Reconstructs images from API responses.
 */
export function base64ToBlob(base64: string, mime: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mime });
}

// --- 1. UI HELPERS ---

/**
 * cn: Class Name Merger - Intelligently merges Tailwind classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- 2. STORE & CONTACT UTILS ---

/**
 * getActiveStoreSlug: Resolves the active store slug from URL (Path priority), Subdomain, or Environment.
 */
export const getActiveStoreSlug = (): string => {
  if (typeof window === 'undefined') return 'landing';

  const hostname = window.location.hostname.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();
  const urlParams = new URLSearchParams(window.location.search);

  // 1. URL Path Overrides (Priority)
  if (pathname === '/landing') return 'landing';
  if (pathname === '/empty') return 'empty-state';
  
  // Custom slug from path (e.g. /kayiambalaj)
  const pathSlug = pathname.split('/')[1];
  if (pathSlug && pathSlug.length > 2 && !['showroom', 'maintenance', 'pages', 'assets'].includes(pathSlug)) {
    return pathSlug;
  }

  // 2. Query Param Overrides
  const storeParam = urlParams.get('store');
  if (storeParam) return storeParam;
  if (urlParams.get('main') === '1') return 'landing';

  // 3. Localhost & Dev Overrides
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('172.') ||
    hostname.startsWith('10.') ||
    (import.meta.env && import.meta.env.DEV)
  ) {
    const envSlug = import.meta.env.VITE_STORE_SLUG;
    if (envSlug && envSlug !== 'mainsite' && envSlug !== 'landing') return envSlug;
    return 'toptan-ambalajcim'; // Default Dev Shop
  }

  // 4. Subdomain Resolution (Production)
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname.startsWith('192.168.');
  const parts = hostname.split('.');

  // If it's a real domain (not local) and has no subdomain, it's the landing page
  if (!isLocal && (parts.length <= 2 || (parts.length === 3 && (parts[0] === 'www' || parts[0] === 'landing')))) {
    return 'landing';
  }

  // If it's localhost and we reached here, it means it's the default shop
  if (isLocal && parts.length === 1) {
    return 'toptanambalajcim';
  }

  return parts[0];
};



/**
 * reorderArray: Moves an item within an array (Immutable).
 */
export const reorderArray = <T>(
  array: T[],
  oldIndex: number,
  newIndex: number,
): T[] => {
  const result = Array.from(array);
  const [removed] = result.splice(oldIndex, 1);
  result.splice(newIndex, 0, removed);
  return result;
};

// --- 3. PRICE & CURRENCY UTILS ---

const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/TRY';

/**
 * fetchCurrentRates: Fetches real-time exchange rates with a safety timeout.
 */
export async function fetchCurrentRates(): Promise<ExchangeRates | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(EXCHANGE_API_URL, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error('Currency API error');
    const data = await response.json();
    return {
      usd: parseFloat((1 / data.rates.USD).toFixed(4)),
      eur: parseFloat((1 / data.rates.EUR).toFixed(4)),
      lastUpdate: data.time_last_updated,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Failed to fetch currency rates:', error);
    return null;
  }
}

// (Functions moved to price.ts)

// --- 4. TEXT & SEARCH UTILS ---

/**
 * slugify: Turkish-aware SEO friendly text converter.
 */
export const slugify = (text: string): string => {
  const turkishCharMap: Record<string, string> = {
    ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u',
    Ç: 'C', Ğ: 'G', İ: 'I', Ö: 'O', Ş: 'S', Ü: 'U'
  };
  return (text || '')
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, (c) => turkishCharMap[c])
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};


/**
 * normalizeText: Professional Turkish-aware text normalization.
 */
export const normalizeText = (text: string): string => {
  return (text || '')
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim();
};

/**
 * smartSearch: Professional fuzzy search with weighted scoring.
 */
export const smartSearch = (query: string, products: Product[]): Product[] => {
  if (!query) return products;
  const q = normalizeText(query);
  const words = q.split(/\s+/).filter(Boolean);

  return products.map(p => {
    const name = normalizeText(p.name || '');
    const desc = normalizeText(p.description || '');
    const cat = normalizeText(p.category || '');
    let score = 0;
    if (name === q) score += 1000;
    if (name.startsWith(q)) score += 500;
    words.forEach(w => {
      if (name.includes(w)) score += 100;
      if (desc.includes(w)) score += 20;
      if (cat.includes(w)) score += 50;
    });
    return { p, score };
  }).filter(i => i.score > 0).sort((a, b) => b.score - a.score).map(i => i.p);
};

/**
 * copyToClipboard: Professional async clipboard handler.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}
