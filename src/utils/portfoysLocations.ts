// Static list of Turkey's 81 cities
export const TURKEY_CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya', 'Ardahan', 'Artvin',
  'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur',
  'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan',
  'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul',
  'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kırıkkale', 'Kırklareli', 'Kırşehir',
  'Kilis', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş',
  'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun', 'Şanlıurfa', 'Siirt', 'Sinop',
  'Sivas', 'Şırnak', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak'
];

// Static list of Iraq's 10 cities
export const IRAQ_CITIES = [
  'Anbar', 'Baghdad', 'Basra', 'Duhok', 'Erbil', 'Karbala', 'Kirkuk', 'Najaf', 'Nineveh (Mosul)', 'Sulaymaniyah'
];

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

/** Fetch unique cities instantly from static list to ensure zero network latency and 100% availability */
export async function fetchCities(country: string): Promise<string[]> {
  if (country === 'Türkiye') return TURKEY_CITIES;
  if (country === 'Irak') return IRAQ_CITIES;
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
