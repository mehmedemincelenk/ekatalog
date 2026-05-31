import { useState, useCallback } from 'react';
import { supabase } from '../supabase';
import { portfoysSupabase } from '../utils/portfoysSupabase';

export interface PortfoysLead {
  id: string;
  name: string;
  phone: string | null;
  website: string | null;
  address: string;
  category: string;
}

export interface SavedLead {
  id: string;
  store_id: string;
  company_name: string;
  phone: string;
  website: string | null;
  segment: string;
  created_at: string;
  metadata: {
    address?: string;
    city?: string;
    district?: string;
    country?: string;
  };
}

// Custom simple caching utilities
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

const setCache = (key: string, data: any, ttl = 1000 * 60 * 60 * 24) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    `cache_loc_${key}`,
    JSON.stringify({ data, expiry: Date.now() + ttl })
  );
};

export function usePortfoysScraper() {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'completed' | 'error'>('idle');
  const [leads, setLeads] = useState<PortfoysLead[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Local Saved Directory states
  const [savedDirectory, setSavedDirectory] = useState<SavedLead[]>([]);
  const [loadingDirectory, setLoadingDirectory] = useState(false);

  // 1. Fetch Location data with dynamic lookup & cache
  const getCities = useCallback(async (country: string): Promise<string[]> => {
    const cacheKey = `cities_${country}_v3`;
    const cached = getCache<string[]>(cacheKey);
    if (cached) return cached;

    try {
      let allCities: string[] = [];
      let page = 0;
      const pageSize = 1000;
      let keepFetching = true;

      while (keepFetching) {
        const { data, error } = await portfoysSupabase
          .from('locations')
          .select('city')
          .eq('country', country)
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) throw error;

        if (data && data.length > 0) {
          const chunk = data.map((d: any) => d.city);
          allCities = [...allCities, ...chunk];
          if (data.length < pageSize) keepFetching = false;
          else page++;
        } else {
          keepFetching = false;
        }
      }

      const uniqueCities = Array.from(new Set(allCities.filter(Boolean))).sort();
      setCache(cacheKey, uniqueCities);
      return uniqueCities;
    } catch (err: any) {
      console.error('[portfoys] fetchCities failed:', err.message);
      return [];
    }
  }, []);

  const getDistricts = useCallback(async (country: string, city: string): Promise<string[]> => {
    if (!city) return [];
    const cacheKey = `districts_${country}_${city}_v3`;
    const cached = getCache<string[]>(cacheKey);
    if (cached) return cached;

    try {
      let allDistricts: string[] = [];
      let page = 0;
      const pageSize = 1000;
      let keepFetching = true;

      while (keepFetching) {
        const { data, error } = await portfoysSupabase
          .from('locations')
          .select('district')
          .eq('country', country)
          .eq('city', city)
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) throw error;

        if (data && data.length > 0) {
          const chunk = data.map((d: any) => d.district);
          allDistricts = [...allDistricts, ...chunk];
          if (data.length < pageSize) keepFetching = false;
          else page++;
        } else {
          keepFetching = false;
        }
      }

      const uniqueDistricts = Array.from(new Set(allDistricts.filter(Boolean))).sort();
      setCache(cacheKey, uniqueDistricts);
      return uniqueDistricts;
    } catch (err: any) {
      console.error('[portfoys] fetchDistricts failed:', err.message);
      return [];
    }
  }, []);

  // 3. Fetch directory leads for the local store
  const fetchDirectory = useCallback(async (storeId: string) => {
    if (!storeId) return;
    setLoadingDirectory(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedDirectory((data as SavedLead[]) || []);
    } catch (err: any) {
      console.error('[directory] fetch failed:', err.message);
    } finally {
      setLoadingDirectory(false);
    }
  }, []);

  // 2. Perform B2B Serper scan using portfoys.pro api search via Edge Function
  const startScan = useCallback(async (params: {
    storeId: string;
    country: string;
    city: string;
    district?: string;
    keyword: string;
  }) => {
    setStatus('scanning');
    setLeads([]);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('ai-orchestrator', {
        body: {
          action: 'portfoys-search',
          payload: {
            store_id: params.storeId,
            keyword: params.keyword,
            city: params.city,
            district: params.district,
            country: params.country,
          },
        },
      });

      if (invokeError) {
        throw new Error(invokeError.message || 'Supabase fonksiyonu çağrılamadı.');
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Arama motoru aramayı tamamlayamadı.');
      }

      const rawLeads: PortfoysLead[] = data.leads || [];
      
      // Clean and validate incoming records
      const sanitized = rawLeads.map((l) => ({
        id: l.id || `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: l.name || 'İsimsiz İşletme',
        phone: l.phone || null,
        website: l.website || null,
        address: l.address || 'Adres bilgisi yok',
        category: l.category || params.keyword,
      }));

      // Update local credit balance in the Zustand store
      if (typeof data.newCredits === 'number') {
        const { useStore } = await import('../store');
        useStore.getState().updateSetting('portfoys_credits', data.newCredits);
      }

      setLeads(sanitized);
      setStatus('completed');
      
      // Refresh directory locally to include the newly background-saved leads!
      await fetchDirectory(params.storeId);
    } catch (err: any) {
      setError(err.message || 'Beklenmedik bir hata oluştu.');
      setStatus('error');
    }
  }, [fetchDirectory]);

  // 4. Save lead into the local store directory
  const saveLead = useCallback(async (storeId: string, lead: PortfoysLead, locationDetails: { country: string; city: string; district: string }) => {
    if (!storeId) return false;
    try {
      const { error } = await supabase.from('leads').insert({
        store_id: storeId,
        company_name: lead.name,
        phone: lead.phone,
        website: lead.website,
        segment: lead.category,
        metadata: {
          address: lead.address,
          city: locationDetails.city,
          district: locationDetails.district,
          country: locationDetails.country,
        },
      });

      if (error) throw error;
      
      // Refresh directory locally
      await fetchDirectory(storeId);
      return true;
    } catch (err: any) {
      console.error('[directory] save failed:', err.message);
      return false;
    }
  }, [fetchDirectory]);

  return {
    status,
    leads,
    error,
    startScan,
    clearScan: useCallback(() => {
      setLeads([]);
      setStatus('idle');
      setError(null);
    }, []),
    getCities,
    getDistricts,
    
    // Directory integration
    savedDirectory,
    loadingDirectory,
    fetchDirectory,
    saveLead,
  };
}
