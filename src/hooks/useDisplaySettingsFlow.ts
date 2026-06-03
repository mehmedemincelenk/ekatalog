import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { DisplayConfig } from '../types';
import { supabase } from '../supabase';

export function useDisplaySettingsFlow(
  isOpen: boolean,
  settings: any,
  updateSetting: any,
  isInlineEnabled: boolean,
  onToggleInline: () => void,
) {
  const { showFeedback, adminPin } = useStore();
  const [isUploading, setIsUploading] = useState(false);

  const [localConfig, setLocalConfig] = useState<DisplayConfig>(
    settings?.displayConfig || {},
  );
  const [localAnnouncement, setLocalAnnouncement] = useState(
    settings?.announcementBar?.enabled || false,
  );
  const [localMaintenance, setLocalMaintenance] = useState(
    settings?.maintenanceMode?.enabled || false,
  );
  const [localInline, setLocalInline] = useState(isInlineEnabled);

  // Form states for Identity inputs
  const [formState, setFormState] = useState({
    title: '',
    slug: '',
    subtitle: '',
    address: '',
    shortAddress: '',
    whatsapp: '',
    phoneCall: '',
    instagram: '',
  });

  const [slugConfirm, setSlugConfirm] = useState<string | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  useEffect(() => {
    if (isOpen && settings) {
      setLocalConfig(settings.displayConfig || {});
      setLocalAnnouncement(settings.announcementBar?.enabled || false);
      setLocalMaintenance(settings.maintenanceMode?.enabled || false);
      setLocalInline(isInlineEnabled);
      setSlugConfirm(null);

      setFormState({
        title: settings.title || '',
        slug: settings.slug || '',
        subtitle: settings.subtitle || '',
        address: settings.address || '',
        shortAddress: settings.shortAddress || '',
        whatsapp: settings.whatsapp || '',
        phoneCall: settings.phoneCall || '',
        instagram: settings.instagram?.split('/').pop()?.replace(/\//g, '') || '',
      });
    }
  }, [isOpen, settings, isInlineEnabled]);

  const handleFieldChange = (key: string, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleFieldBlur = (key: string) => {
    const value = formState[key as keyof typeof formState].trim();
    if (key === 'title' && !value) return;

    if (key === 'subtitle') {
      const sliced = value.slice(0, 35);
      if (sliced !== settings.subtitle) {
        updateSetting('subtitle', sliced);
      }
    } else if (key === 'instagram') {
      const fullUrl = value ? `https://www.instagram.com/${value}` : '';
      if (fullUrl !== settings.instagram) {
        updateSetting('instagram', fullUrl);
      }
    } else if (key !== 'slug') {
      if (value !== settings[key as keyof typeof settings]) {
        updateSetting(key as any, value);
      }
    }
  };

  const handleSlugCheck = async (newSlug: string) => {
    const cleaned = newSlug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!cleaned) {
      handleFieldChange('slug', settings.slug || '');
      setSlugConfirm(null);
      return;
    }
    if (cleaned === settings.slug) {
      setSlugConfirm(null);
      return;
    }

    setCheckingSlug(true);

    try {
      const { data, error } = await supabase
        .from('stores')
        .select('id')
        .eq('slug', cleaned)
        .maybeSingle();

      if (error) throw error;

      if (data && data.id !== settings.id) {
        showFeedback('error', 'Bu dükkan adresi zaten başka bir işletme tarafından kullanılıyor!');
        handleFieldChange('slug', settings.slug || '');
        setSlugConfirm(null);
      } else {
        setSlugConfirm(cleaned);
      }
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Bağlantı adresi kontrol edilirken hata oluştu.');
    } finally {
      setCheckingSlug(false);
    }
  };

  const getOptionState = (key: keyof DisplayConfig) => {
    const val = localConfig[key];
    if (key === 'showPrice') return val !== false;
    if (key === 'showWhatsapp') return val !== false;
    if (key === 'showCarousel') return val !== false;
    if (key === 'showCategories') return val !== false;
    if (key === 'showSearch') return val !== false;
    if (key === 'showQR') return val !== false;
    if (key === 'showPhone') return val !== false;
    if (key === 'showTitle') return val !== false;
    return !!val;
  };

  const toggleOption = async (key: keyof DisplayConfig) => {
    const currentVal = getOptionState(key);
    const newVal = !currentVal;
    setLocalConfig((prev) => ({ ...prev, [key]: newVal }));
    try {
      await updateSetting('displayConfig', {
        ...settings.displayConfig,
        [key]: newVal,
      });
    } catch (err) {
      setLocalConfig(settings.displayConfig || {});
    }
  };

  const toggleAnnouncement = async () => {
    const newVal = !localAnnouncement;
    setLocalAnnouncement(newVal);
    try {
      await updateSetting('announcementBar', {
        ...settings.announcementBar,
        enabled: newVal,
      });
    } catch (err) {
      setLocalAnnouncement(settings.announcementBar?.enabled || false);
    }
  };

  const toggleMaintenance = async () => {
    const newVal = !localMaintenance;
    setLocalMaintenance(newVal);
    try {
      await updateSetting('maintenanceMode', {
        ...settings.maintenanceMode,
        enabled: newVal,
      });
    } catch (err) {
      setLocalMaintenance(settings.maintenanceMode?.enabled || false);
    }
  };

  const handleToggleInline = () => {
    setLocalInline(!localInline);
    onToggleInline();
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !adminPin) return;
    setIsUploading(true);
    try {
      const { secureUploadVisualAsset } = await import('../utils/image');
      const finalizedUrl = await secureUploadVisualAsset({
        file,
        folder: 'logos',
        adminPin,
        oldUrl: settings.logoUrl,
        slugBaseName: settings.name,
        uniqueIdPrefix: 'logo',
        isDualQuality: false,
      });

      await updateSetting('logoUrl', finalizedUrl);
      showFeedback('success', 'Logo başarıyla güncellendi');
    } catch (err) {
      showFeedback('error', 'Logo yüklenirken bir hata oluştu');
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    localConfig,
    localAnnouncement,
    localMaintenance,
    localInline,
    formState,
    slugConfirm,
    checkingSlug,
    setSlugConfirm,
    handleFieldChange,
    handleFieldBlur,
    handleSlugCheck,
    getOptionState,
    toggleOption,
    toggleAnnouncement,
    toggleMaintenance,
    handleToggleInline,
    handleLogoUpload,
  };
}
