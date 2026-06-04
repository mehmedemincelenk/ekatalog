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

// Helper to get target API base URLs (attempts local backend first in development)
const getApiUrls = (): string[] => {
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')
  ) {
    return ['http://localhost:3000', 'https://portfoys.pro'];
  }
  return ['https://portfoys.pro'];
};

/** Fetch unique cities dynamically from the official Portfoys location API with local caching */
export async function fetchCities(country: string): Promise<string[]> {
  const cacheKey = `cities_${country}`;
  const cached = getCache<string[]>(cacheKey);

  // Turkey has 81, Iraq has 18 cities. A cache with <= 5 items is corrupted/stale and must be bypassed.
  if (cached && Array.isArray(cached) && cached.length > 5) {
    return cached;
  }

  if (cached) {
    console.warn(
      `[locations] Tiny/corrupted cache detected for ${country} (${cached.length} items). Clearing cache...`,
    );
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`cache_loc_${cacheKey}`);
    }
  }

  const baseUrls = getApiUrls();
  for (const baseUrl of baseUrls) {
    try {
      const res = await fetch(
        `${baseUrl}/api/locations?type=cities&country=${encodeURIComponent(country)}`,
      );
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.cities)) {
        // Only cache if we got a substantial/valid city list
        if (data.cities.length > 5) {
          setCache(cacheKey, data.cities);
        }
        return data.cities;
      }
    } catch (err) {
      console.warn(
        `[locations] fetchCities failed on ${baseUrl}, trying next...`,
        err,
      );
    }
  }

  return [];
}

/** Fetch unique districts for a city with caching from the official Portfoys location API */
export async function fetchDistricts(
  country: string,
  city: string,
): Promise<string[]> {
  if (!city) return [];
  const cacheKey = `districts_${country}_${city}`;
  const cached = getCache<string[]>(cacheKey);

  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }

  if (cached) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`cache_loc_${cacheKey}`);
    }
  }

  const baseUrls = getApiUrls();
  for (const baseUrl of baseUrls) {
    try {
      const res = await fetch(
        `${baseUrl}/api/locations?type=districts&country=${encodeURIComponent(country)}&city=${encodeURIComponent(city)}`,
      );
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.districts)) {
        if (data.districts.length > 0) {
          setCache(cacheKey, data.districts);
        }
        return data.districts;
      }
    } catch (err) {
      console.warn(
        `[locations] fetchDistricts failed on ${baseUrl}, trying next...`,
        err,
      );
    }
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
  {
    code: 'DE',
    name: 'Almanya',
    flag: '🇩🇪',
    desc: "Avrupa'daki gurbetçi esnaflar",
  },
  { code: 'IQ', name: 'Irak', flag: '🇮🇶', desc: 'Yakın sınır komşuları' },
];

export const PRESET_CATEGORIES = [
  'Restoran',
  'Kafe',
  'Butik',
  'Kuaför',
  'Güzellik Salonu',
  'Otel',
  'Eczane',
  'Market',
  'İnşaat',
  'Emlak',
  'Klinik',
  'Diş Hekimi',
  'Mobilya',
  'Oto Servis',
  'Hırdavat',
  'Tekstil',
  'Spor Salonu',
  'Avukat',
  'Muhasebe',
  'Yazılım',
];
