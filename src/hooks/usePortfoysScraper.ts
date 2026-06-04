import { useState, useCallback } from 'react';
import { supabase } from '../supabase';

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
    keyword?: string;
  };
}

export function usePortfoysScraper() {
  const [status, setStatus] = useState<
    'idle' | 'scanning' | 'completed' | 'error'
  >('idle');
  const [leads, setLeads] = useState<PortfoysLead[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Local Saved Directory states
  const [savedDirectory, setSavedDirectory] = useState<SavedLead[]>([]);
  const [loadingDirectory, setLoadingDirectory] = useState(false);

  // 3. Fetch directory leads for the local store
  const fetchDirectory = useCallback(async (storeId: string) => {
    if (!storeId) return;
    setLoadingDirectory(true);
    try {
      const { data, error } = await supabase
        .from('store_contacts')
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

  // 2. Perform B2B search using portfoys.pro API via Edge Function
  const startScan = useCallback(
    async (params: {
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
        const { data, error: invokeError } = await supabase.functions.invoke(
          'ai-orchestrator',
          {
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
          },
        );

        if (invokeError) {
          throw new Error(
            invokeError.message || 'Supabase fonksiyonu çağrılamadı.',
          );
        }

        if (!data || !data.success) {
          throw new Error(data?.error || 'Arama motoru aramayı tamamlayamadı.');
        }

        const rawLeads: PortfoysLead[] = data.leads || [];

        // Clean and validate incoming records
        const sanitized = rawLeads.map((l) => ({
          id:
            l.id ||
            `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: l.name || 'İsimsiz İşletme',
          phone: l.phone || null,
          website: l.website || null,
          address: l.address || 'Adres bilgisi yok',
          category: l.category || params.keyword,
        }));

        // Update local credit balance in the Zustand store
        if (typeof data.newCredits === 'number') {
          const { useStore } = await import('../store');
          useStore
            .getState()
            .updateSetting('portfoys_credits', data.newCredits);
        }

        setLeads(sanitized);
        setStatus('completed');

        // Refresh directory locally to include the newly background-saved leads!
        await fetchDirectory(params.storeId);
      } catch (err: any) {
        setError(err.message || 'Beklenmedik bir hata oluştu.');
        setStatus('error');
      }
    },
    [fetchDirectory],
  );

  // 4. Save lead into the local store directory
  const saveLead = useCallback(
    async (
      storeId: string,
      lead: PortfoysLead,
      locationDetails: { country: string; city: string; district: string },
    ) => {
      if (!storeId) return false;
      try {
        const { error } = await supabase.from('store_contacts').insert({
          store_id: storeId,
          company_name: lead.name,
          phone: lead.phone || '',
          website: lead.website || null,
          segment: lead.category,
          metadata: {
            address: lead.address,
            city: locationDetails.city,
            district: locationDetails.district,
            country: locationDetails.country,
            keyword: lead.category,
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
    },
    [fetchDirectory],
  );

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

    // Directory integration
    savedDirectory,
    loadingDirectory,
    fetchDirectory,
    saveLead,
  };
}
