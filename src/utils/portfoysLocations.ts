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

/** Fetch unique cities for a country with caching from the official Portfoys location API */
export async function fetchCities(country: string): Promise<string[]> {
  const cacheKey = `cities_${country}`;
  const cached = getCache<string[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`https://portfoys.pro/api/locations?type=cities&country=${encodeURIComponent(country)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.cities)) {
      setCache(cacheKey, data.cities);
      return data.cities;
    }
  } catch (err) {
    console.error('[locations] fetchCities API error:', err);
  }
  
  return [];
}

/** Fetch unique districts for a city with caching from the official Portfoys location API */
export async function fetchDistricts(country: string, city: string): Promise<string[]> {
  if (!city) return [];
  const cacheKey = `districts_${country}_${city}`;
  const cached = getCache<string[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`https://portfoys.pro/api/locations?type=districts&country=${encodeURIComponent(country)}&city=${encodeURIComponent(city)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.districts)) {
      setCache(cacheKey, data.districts);
      return data.districts;
    }
  } catch (err) {
    console.error('[locations] fetchDistricts API error:', err);
  }

  return [];
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
