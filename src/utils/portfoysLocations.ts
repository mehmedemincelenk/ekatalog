import { portfoysSupabase } from './portfoysSupabase';

// Helper to fetch cache from localStorage
const getCache = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  const cached = localStorage.getItem(`cache_loc_${key}`);
  if (!cached) return null;
  try {
    const { data, expiry } = JSON.parse(cached);
    if (Date.now() > expiry) {
      localStorage.removeItem(`cache_loc_${key}`);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

// Helper to set cache to localStorage
const setCache = (key: string, data: any, ttl = 1000 * 60 * 60 * 24) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    `cache_loc_${key}`,
    JSON.stringify({ data, expiry: Date.now() + ttl }),
  );
};

/** Fetch unique cities for a country with caching */
export async function fetchCities(country: string): Promise<string[]> {
  const cacheKey = `cities_${country}`;
  const cached = getCache<string[]>(cacheKey);
  if (cached) return cached;

  let allCities: string[] = [];
  let page = 0;
  const pageSize = 5000;
  let keepFetching = true;

  while (keepFetching) {
    const { data, error } = await portfoysSupabase
      .from('locations')
      .select('city')
      .eq('country', country)
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('[locations] fetchCities error:', error.message);
      break;
    }

    if (data && data.length > 0) {
      const chunk = data.map((d: any) => d.city);
      allCities = [...allCities, ...chunk];
      if (data.length < pageSize) keepFetching = false;
      else page++;
    } else {
      keepFetching = false;
    }

    if (page > 15) keepFetching = false; // Safety cap
  }

  const uniqueCities = Array.from(new Set(allCities)).filter(Boolean).sort();
  setCache(cacheKey, uniqueCities);
  return uniqueCities;
}

/** Fetch unique districts for a city with caching */
export async function fetchDistricts(country: string, city: string): Promise<string[]> {
  if (!city) return [];
  const cacheKey = `districts_${country}_${city}`;
  const cached = getCache<string[]>(cacheKey);
  if (cached) return cached;

  let allDistricts: string[] = [];
  let page = 0;
  const pageSize = 5000;
  let keepFetching = true;

  while (keepFetching) {
    const { data, error } = await portfoysSupabase
      .from('locations')
      .select('district')
      .eq('country', country)
      .eq('city', city)
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('[locations] fetchDistricts error:', error.message);
      break;
    }

    if (data && data.length > 0) {
      const chunk = data.map((d: any) => d.district);
      allDistricts = [...allDistricts, ...chunk];
      if (data.length < pageSize) keepFetching = false;
      else page++;
    } else {
      keepFetching = false;
    }

    if (page > 15) keepFetching = false; // Safety cap
  }

  const uniqueDistricts = Array.from(new Set(allDistricts)).filter(Boolean).sort();
  setCache(cacheKey, uniqueDistricts);
  return uniqueDistricts;
}

export interface PortfoysCountry {
  code: string;
  name: string;
  flag: string;
  desc: string;
}

export const PORTFOYS_COUNTRIES: PortfoysCountry[] = [
  { code: 'TR', name: 'Türkiye', flag: '🇹🇷', desc: 'Tüm şehirler ve ilçeler' },
  { code: 'DE', name: 'Almanya', flag: '🇩🇪', desc: 'Avrupa\'daki gurbetçi esnaflar' },
  { code: 'IQ', name: 'Irak', flag: '🇮🇶', desc: 'Yakın sınır komşuları' },
];

export const PRESET_CATEGORIES = [
  'Restoran',
  'Butik',
  'Kuaför',
  'Market',
  'Eczane',
  'Otel',
  'Kozmetik',
  'İnşaat',
];

