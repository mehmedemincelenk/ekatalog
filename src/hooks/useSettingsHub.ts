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

/**
 * SETTINGS HUB (DIAMOND EDITION)
 * -----------------------------------------------------------
 * Unified orchestrator for store branding, currency, and configuration.
 */

// --- 1. SETTINGS QUERY (Data Layer) ---

export function useSettingsQuery() {
  const STORE_SLUG = getActiveStoreSlug();

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

      // Parallel execution: Settings + Currency Rates
      const [settingsRes, rates] = await Promise.all([
        supabase
          .from('stores')
          .select('*')
          .eq('slug', STORE_SLUG)
          .maybeSingle(),
        fetchCurrentRates(),
      ]);

      if (settingsRes.error) throw settingsRes.error;

      // 1. FALLBACK TO PLACEHOLDERS IF NOT FOUND
      if (!settingsRes.data) {
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
        portfoys_credits: raw.portfoys_credits,
      };

      if (settings && typeof window !== 'undefined' && STORE_SLUG !== 'empty-state' && STORE_SLUG !== 'landingpage') {
        localStorage.setItem(`ekatalog_local_settings_${STORE_SLUG}`, JSON.stringify(settings));
      }

      return settings;
    },
    initialData: () => {
      if (typeof window !== 'undefined' && STORE_SLUG !== 'empty-state' && STORE_SLUG !== 'landingpage') {
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
    if (settings) setSettingsStore(settings);
  }, [settings, setSettingsStore]);

  const updateMutation = useMutation({
    mutationFn: async ({
      key,
      value,
    }: {
      key: keyof CompanySettings;
      value: CompanySettings[keyof CompanySettings];
    }) => {
      if (STORE_SLUG === 'landingpage') return;
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

        if (typeof window !== 'undefined' && STORE_SLUG !== 'empty-state' && STORE_SLUG !== 'landingpage') {
          localStorage.setItem(`ekatalog_local_settings_${STORE_SLUG}`, JSON.stringify(updated));
        }
      }

      return { previousSettings };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousSettings) {
        setSettingsStore(context.previousSettings);
        queryClient.setQueryData<CompanySettings>(['settings', STORE_SLUG], context.previousSettings);
        if (typeof window !== 'undefined' && STORE_SLUG !== 'empty-state' && STORE_SLUG !== 'landingpage') {
          localStorage.setItem(`ekatalog_local_settings_${STORE_SLUG}`, JSON.stringify(context.previousSettings));
        }
      }
    },
    onSettled: () => {
      if (STORE_SLUG !== 'landingpage') {
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
      if (STORE_SLUG === 'landingpage') return;

      const { error } = await supabase.rpc('add_visitor_lead', {
        p_store_id: settings.id,
        p_phone: phone,
      });

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['settings', STORE_SLUG] });
    },
    changePin: async (currentPin: string, newPin: string) => {
      if (!settings?.id) throw new Error('Dükkan bilgileri yüklenemedi.');
      if (STORE_SLUG === 'landingpage') {
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
