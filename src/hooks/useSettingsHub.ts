import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useStore } from '../store';
import { getActiveStoreSlug, fetchCurrentRates } from '../utils/core';
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
        return {
          id: 'placeholder',
          slug: STORE_SLUG,
          name: 'Mağaza Adı',
          title: 'Mağaza Adı',
          subtitle: 'Sloganınızı buraya yazın',
          logoUrl: '',
          activeCurrency: 'TRY',
          categoryOrder: DEFAULT_ORDER,
          carouselData: { slides: [] },
          referencesData: [],
          displayConfig: {
            showLogo: true,
            showSearch: true,
            showAddress: true,
            showInstagram: true,
            showWhatsapp: true,
            showReferences: true,
            showPrice: true,
            showCarousel: true,
            showCoupons: true,
            showPriceList: true,
            showCurrency: true,
            showCategories: true,
            showSubtitle: true,
          },
          announcementBar: { enabled: false, text: '' },
          exchangeRates: rates || { usd: 0, eur: 0 },
          whatsapp: '05XX XXX XX XX',
          phoneCall: '05XX XXX XX XX',
          address: 'Adres Bilgisi',
          instagram: '',
          maintenanceMode: { enabled: false, message: '' },
          portfoys_credits: 2,
        } as CompanySettings;
      }

      const raw = settingsRes.data;
      const settings: CompanySettings = {
        id: raw.id,
        title: raw.name || 'Mağaza Adı',
        logoUrl: raw.logo_url || '',
        activeCurrency: raw.active_currency || 'TRY',
        categoryOrder: raw.category_order || DEFAULT_ORDER,
        carouselData: raw.carousel_data || { slides: [] },
        referencesData: raw.references_data || [],
        socialProofCards: raw.social_proof_cards || [],
        maintenanceMode: raw.maintenance_mode || {
          enabled: false,
          message: '',
        },
        exchangeRates: rates || { usd: 0, eur: 0 },
        whatsapp: raw.phone || '05XX XXX XX XX',
        phoneCall: raw.display_config?.phoneCall || raw.phone || '05XX XXX XX XX',
        address: raw.address || 'Adres Bilgisi Girilmemiş',
        shortAddress: raw.short_address || '',
        instagram: raw.instagram_url || '',
        subtitle: raw.tagline || 'Sloganınızı buraya yazın',
        name: raw.name || 'Mağaza Adı',
        displayConfig: {
          showLogo: true,
          showSearch: true,
          showAddress: true,
          showInstagram: true,
          showWhatsapp: true,
          showReferences: true,
          ...raw.display_config,
        },
        announcementBar: raw.announcement_bar || { enabled: false, text: '' },
        visitor_leads: raw.visitor_leads || [],
        subscription_tier: raw.subscription_tier || 'free',
        subscription_expires_at: raw.subscription_expires_at,
        created_at: raw.created_at,
        slug: raw.slug || '',
        portfoys_credits: raw.portfoys_credits,
      };

      return settings;
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
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['settings', STORE_SLUG] }),
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

      const { error } = await supabase.rpc('add_visitor_lead', {
        p_store_id: settings.id,
        p_phone: phone,
      });

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['settings', STORE_SLUG] });
    },
    changePin: async (currentPin: string, newPin: string) => {
      if (!settings?.id) throw new Error('Dükkan bilgileri yüklenemedi.');
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
