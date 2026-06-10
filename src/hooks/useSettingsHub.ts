import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useStore } from '../store';
import {
  getActiveStoreSlug,
  fetchCurrentRates,
  resolveLegacyImagePath,
} from '../utils/core';
import { CompanySettings } from '../types';
import { CATEGORY_ORDER as DEFAULT_ORDER } from '../data/config';

const STORE_SLUG = getActiveStoreSlug();
const isVirtual = STORE_SLUG === 'landingpage' || STORE_SLUG === 'misal' || STORE_SLUG === 'ornek';
let isSettingsFirstLoad = true;

/**
 * SETTINGS HUB (DIAMOND EDITION)
 * -----------------------------------------------------------
 * Unified orchestrator for store branding, currency, and configuration.
 */

// --- 1. SETTINGS QUERY (Data Layer) ---

export function useSettingsQuery() {
  const STORE_SLUG = getActiveStoreSlug();

  if (typeof window !== 'undefined' && isSettingsFirstLoad && isVirtual) {
    localStorage.removeItem(`ekatalog_local_settings_${STORE_SLUG}`);
    isSettingsFirstLoad = false;
  }

  return useQuery({
    queryKey: ['settings', STORE_SLUG],
    queryFn: async () => {
      // 0. EMPTY STATE BYPASS
      if (STORE_SLUG === 'empty-state') {
        return {
          id: 'empty',
          title: '',
          logoUrl: '',
          activeCurrency: 'TRY',
          categoryOrder: [],
          carouselData: { slides: [] },
          referencesData: [],
          displayConfig: {
            showLogo: true,
            showSearch: true,
            showAddress: true,
            showInstagram: true,
            showWorkspace: false,
            showWhatsapp: true,
            showSubtitle: true,
            showReferences: true,
            showPrice: true,
            showCarousel: true,
            showCoupons: true,
            showPriceList: true,
            showCurrency: true,
            showCategories: true,
          },
          maintenanceMode: { enabled: false, message: '' },
          announcementBar: { enabled: false, text: '' },
          exchangeRates: { usd: 0, eur: 0 },
          whatsapp: '',
          phoneCall: '',
          address: '',
          instagram: '',
          subtitle: '',
          name: '',
          portfoys_credits: 2,
        } as CompanySettings;
      }

      // 0.1. LANDINGPAGE DEMO STORE BYPASS
      if (STORE_SLUG === 'landingpage') {
        const { MOCK_LANDINGPAGE_SETTINGS } =
          await import('../data/mockLandingpage');
        return MOCK_LANDINGPAGE_SETTINGS;
      }

      // If virtual, check localStorage first (to retain temporary edits during session)
      if (isVirtual && typeof window !== 'undefined') {
        const cached = localStorage.getItem(`ekatalog_local_settings_${STORE_SLUG}`);
        if (cached) {
          try {
            const parsed = JSON.parse(cached) as CompanySettings;
            parsed.portfoys_credits = 2; // Always force 2 for virtual stores
            return parsed;
          } catch (e) {
            // ignore and fetch
          }
        }
      }

      // Parallel execution: Settings + Currency Rates
      let [settingsRes, rates] = await Promise.all([
        supabase
          .from('stores')
          .select('*')
          .eq('slug', STORE_SLUG)
          .maybeSingle(),
        fetchCurrentRates(),
      ]);

      if (settingsRes.error) throw settingsRes.error;

      // 1. FUZZY SLUG FALLBACK FOR DIRECT URL VISITS
      if (!settingsRes.data && STORE_SLUG && STORE_SLUG !== 'landing' && STORE_SLUG !== 'empty-state') {
        const { data: allStores } = await supabase
          .from('stores')
          .select('id, slug');

        if (allStores && allStores.length > 0) {
          const getSimilarity = (req: string, store: string) => {
            const r = req.toLowerCase().replace(/[^a-z0-9]/g, '');
            const s = store.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (!r || !s) return 0;
            if (r === s) return 1.0;
            if (r[0] !== s[0]) return 0;
            if (s.startsWith(r) || r.startsWith(s)) return 0.9;
            if (s.includes(r) || r.includes(s)) return 0.8;

            let matches = 0;
            let sIndex = 0;
            for (let i = 0; i < r.length; i++) {
              const char = r[i];
              const found = s.indexOf(char, sIndex);
              if (found !== -1) {
                matches++;
                sIndex = found + 1;
              }
            }
            return matches / Math.max(r.length, s.length);
          };

          let bestMatch = null;
          let highestScore = 0;

          for (const store of allStores) {
            const score = getSimilarity(STORE_SLUG, store.slug);
            if (score > highestScore) {
              highestScore = score;
              bestMatch = store;
            }
          }

          if (bestMatch && highestScore >= 0.8) {
            const retryRes = await supabase
              .from('stores')
              .select('*')
              .eq('id', bestMatch.id)
              .maybeSingle();

            if (retryRes.data) {
              settingsRes = retryRes;
              
              if (typeof window !== 'undefined') {
                const newUrl = `${window.location.protocol}//${window.location.host}/${bestMatch.slug}${window.location.search}${window.location.hash}`;
                window.history.replaceState({ path: newUrl }, '', newUrl);
              }
            }
          }
        }
      }

      // 2. FALLBACK TO PLACEHOLDERS IF NOT FOUND
      if (!settingsRes.data) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`ekatalog_local_settings_${STORE_SLUG}`);
        }
        return null;
      }

      const raw = settingsRes.data;

      const mappedReferences = (raw.references_data || []).map((ref: any) => {
        let logo = ref.logo;
        if (
          logo &&
          (logo.includes('yalcintemizlik.com') || logo.includes('clearbit'))
        ) {
          const domainMap: Record<string, string> = {
            selpak: 'selpak.com.tr',
            diversey: 'diversey.com',
            johnson: 'diversey.com',
            kärcher: 'kaercher.com',
            vileda: 'vileda.com',
            'p&g': 'pg.com',
            arçelik: 'arcelik.com.tr',
            eczacıbaşı: 'eczacibasi.com.tr',
            hayat: 'hayat.com.tr',
            '3m': '3m.com',
            tesa: 'tesa.com',
            kimberly: 'kimberly-clark.com',
          };
          const lowerName = (ref.name || '').toLowerCase();
          for (const [key, domain] of Object.entries(domainMap)) {
            if (lowerName.includes(key)) {
              logo = `https://logo.clearbit.com/${domain}`;
              break;
            }
          }
        }
        return { ...ref, logo };
      });

      const mergedDisplayConfig = {
        showLogo: true,
        showSearch: true,
        showAddress: true,
        showInstagram: true,
        showWhatsapp: true,
        showReferences: true,
        ...raw.display_config,
      };

      const settings: CompanySettings = {
        id: raw.id,
        title: raw.name || 'Mağaza Adı',
        logoUrl: resolveLegacyImagePath(raw.logo_url) || '',
        activeCurrency: raw.active_currency || 'TRY',
        categoryOrder: raw.category_order || DEFAULT_ORDER,
        carouselData: {
          slides: (raw.carousel_data?.slides || []).map((slide: any) => ({
            ...slide,
            src: resolveLegacyImagePath(slide.src),
          })),
        },
        referencesData: mappedReferences,
        socialProofCards: raw.social_proof_cards || [],
        maintenanceMode: raw.maintenance_mode || {
          enabled: false,
          message: '',
        },
        exchangeRates: rates || { usd: 0, eur: 0 },
        whatsapp: raw.phone || '05XX XXX XX XX',
        phoneCall:
          raw.display_config?.phoneCall || raw.phone || '05XX XXX XX XX',
        address: raw.address || 'Adres Bilgisi Girilmemiş',
        shortAddress: raw.short_address || '',
        instagram: raw.instagram_url || '',
        subtitle: raw.tagline || 'Sloganınızı buraya yazın',
        name: raw.name || 'Mağaza Adı',
        displayConfig: mergedDisplayConfig,
        announcementBar: raw.announcement_bar || { enabled: false, text: '' },
        visitor_leads: raw.visitor_leads || [],
        subscription_tier: raw.subscription_tier || 'free',
        subscription_expires_at: raw.subscription_expires_at,
        created_at: raw.created_at,
        slug: raw.slug || '',
        portfoys_credits: isVirtual ? 2 : (raw.portfoys_credits ?? 2),
      };

      if (settings && typeof window !== 'undefined' && STORE_SLUG !== 'empty-state') {
        localStorage.setItem(`ekatalog_local_settings_${STORE_SLUG}`, JSON.stringify(settings));
      }

      return settings;
    },
    placeholderData: () => {
      if (typeof window !== 'undefined' && STORE_SLUG !== 'empty-state') {
        const cached = localStorage.getItem(`ekatalog_local_settings_${STORE_SLUG}`);
        if (cached) {
          try {
            return JSON.parse(cached) as CompanySettings;
          } catch (e) {
            return undefined;
          }
        }
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// --- 2. SETTINGS COORDINATOR (Main Hook) ---

export function useSettings(isAdmin: boolean) {
  const { setSettings: setSettingsStore, adminPin } = useStore();
  const queryClient = useQueryClient();
  const { data: settings, isLoading: loading, isError } = useSettingsQuery();

  useEffect(() => {
    if (settings !== undefined) {
      setSettingsStore(settings);
    }
  }, [settings, setSettingsStore]);

  const updateMutation = useMutation({
    mutationFn: async ({
      key,
      value,
    }: {
      key: keyof CompanySettings;
      value: CompanySettings[keyof CompanySettings];
    }) => {
      if (isVirtual) return;
      if (!settings?.id) throw new Error('Settings not loaded');

      const dbMap: Record<string, string> = {
        title: 'name',
        logoUrl: 'logo_url',
        activeCurrency: 'active_currency',
        categoryOrder: 'category_order',
        carouselData: 'carousel_data',
        maintenanceMode: 'maintenance_mode',
        referencesData: 'references_data',
        socialProofCards: 'social_proof_cards',
        whatsapp: 'phone',
        address: 'address',
        shortAddress: 'short_address',
        instagram: 'instagram_url',
        subtitle: 'tagline',
        name: 'name',
        displayConfig: 'display_config',
        announcementBar: 'announcement_bar',
        visitor_leads: 'visitor_leads',
        slug: 'slug',
        portfoys_credits: 'portfoys_credits',
      };

      if (!adminPin) throw new Error('Yetkisiz işlem: PIN gerekli');

      if (key === 'phoneCall') {
        const updatedDisplayConfig = {
          ...(settings.displayConfig || {}),
          phoneCall: value,
        };
        const { error } = await supabase.rpc('secure_update_store', {
          p_id: settings.id,
          p_pin: adminPin,
          p_changes: { display_config: updatedDisplayConfig },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.rpc('secure_update_store', {
          p_id: settings.id,
          p_pin: adminPin,
          p_changes: { [dbMap[key] || key]: value },
        });
        if (error) throw error;
      }
    },
    onMutate: async ({ key, value }) => {
      await queryClient.cancelQueries({ queryKey: ['settings', STORE_SLUG] });
      const previousSettings = queryClient.getQueryData<CompanySettings>(['settings', STORE_SLUG]);

      if (previousSettings) {
        let updated: CompanySettings;
        if (key === 'phoneCall') {
          updated = {
            ...previousSettings,
            displayConfig: {
              ...(previousSettings.displayConfig || {}),
              phoneCall: value as string,
            },
          } as CompanySettings;
        } else {
          updated = {
            ...previousSettings,
            [key]: value,
          } as CompanySettings;
        }

        setSettingsStore(updated);
        queryClient.setQueryData<CompanySettings>(['settings', STORE_SLUG], updated);

        if (typeof window !== 'undefined' && STORE_SLUG !== 'empty-state') {
          localStorage.setItem(`ekatalog_local_settings_${STORE_SLUG}`, JSON.stringify(updated));
        }
      }

      return { previousSettings };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousSettings) {
        setSettingsStore(context.previousSettings);
        queryClient.setQueryData<CompanySettings>(['settings', STORE_SLUG], context.previousSettings);
        if (typeof window !== 'undefined' && STORE_SLUG !== 'empty-state') {
          localStorage.setItem(`ekatalog_local_settings_${STORE_SLUG}`, JSON.stringify(context.previousSettings));
        }
      }
    },
    onSettled: () => {
      if (!isVirtual) {
        queryClient.invalidateQueries({ queryKey: ['settings', STORE_SLUG] });
      }
    },
  });

  return {
    settings: settings || ({} as CompanySettings),
    updateSetting: async <K extends keyof CompanySettings>(
      key: K,
      value: CompanySettings[K],
    ) => {
      if (!isAdmin) console.warn('Admin mode not active');
      await updateMutation.mutateAsync({ key, value });
    },
    loading,
    notFound: !loading && !settings,
    isError,
    addVisitorLead: async (phone: string) => {
      if (!settings?.id) return;
      if (isVirtual) return;

      const { error } = await supabase.rpc('add_visitor_lead', {
        p_store_id: settings.id,
        p_phone: phone,
      });

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['settings', STORE_SLUG] });
    },
    changePin: async (currentPin: string, newPin: string) => {
      if (!settings?.id) throw new Error('Dükkan bilgileri yüklenemedi.');
      if (isVirtual) {
        throw new Error('Demo modunda PIN kodu değiştirilemez.');
      }
      const { error } = await supabase.rpc('secure_update_store_pin', {
        p_store_id: settings.id,
        p_current_pin: currentPin,
        p_new_pin: newPin,
      });
      if (error) throw error;
    },
    retry: () =>
      queryClient.invalidateQueries({ queryKey: ['settings', STORE_SLUG] }),
  };
}
