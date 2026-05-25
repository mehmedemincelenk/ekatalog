import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { storage } from '../utils/storage';
import { DisplayConfig } from '../types';

export function useDisplaySettingsFlow(
  isOpen: boolean,
  settings: any,
  updateSetting: any,
  isInlineEnabled: boolean,
  onToggleInline: () => void,
) {
  const { showFeedback, adminPin } = useStore();
  const [isUploading, setIsUploading] = useState(false);
  const [helpId, setHelpId] = useState<string | null>(null);
  const [hiddenHelpIds, setHiddenHelpIds] = useState<string[]>(() => {
    return storage.get('ekatalog_hidden_help_ids', []);
  });

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
  const [quickEdit, setQuickEdit] = useState<{
    key: string;
    value: string;
    title: string;
    maxLength?: number;
  } | null>(null);

  // FIX: Anti-Pattern Removed. Using useEffect instead of render-phase mutation.
  useEffect(() => {
    if (isOpen && settings) {
      setLocalConfig(settings.displayConfig || {});
      setLocalAnnouncement(settings.announcementBar?.enabled || false);
      setLocalMaintenance(settings.maintenanceMode?.enabled || false);
      setLocalInline(isInlineEnabled);
    }
  }, [isOpen, settings, isInlineEnabled]);

  const getOptionState = (key: keyof DisplayConfig) => {
    const val = localConfig[key];
    if (key === 'showPrice') return val !== false;
    if (key === 'showWhatsapp') return val !== false;
    if (key === 'showCarousel') return val !== false;
    if (key === 'showCategories') return val !== false;
    if (key === 'showSearch') return val !== false;
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

  const hideHelpPermanently = (id: string) => {
    const updated = [...hiddenHelpIds, id];
    setHiddenHelpIds(updated);
    storage.set('ekatalog_hidden_help_ids', updated);
    setHelpId(null);
  };

  const handleIdentityClick = (
    option: any,
    fileInputRef: React.RefObject<HTMLInputElement | null>,
  ) => {
    if (option.isLogo) {
      fileInputRef.current?.click();
      return;
    }
    setQuickEdit({
      key: option.key,
      value: option.value,
      title: option.label,
      maxLength: option.key === 'subtitle' ? 35 : undefined,
    });
  };

  const handleQuickSave = async (newVal: string) => {
    if (!quickEdit) return;
    try {
      if (quickEdit.key === 'slug') {
        const sanitized = newVal.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
        if (!sanitized) {
          showFeedback('error', 'Geçersiz dükkan linki');
          return;
        }
        if (sanitized === settings?.slug) {
          setQuickEdit(null);
          return;
        }

        const confirmChange = window.confirm(
          `Dükkan linkiniz "${sanitized}" olarak güncellenecektir. Yeni adrese otomatik olarak yönlendirileceksiniz. Onaylıyor musunuz?`
        );
        if (!confirmChange) return;

        await updateSetting('slug', sanitized);
        showFeedback('success', 'Dükkan adresi başarıyla güncellendi!');
        
        setTimeout(() => {
          window.location.replace('/' + sanitized);
        }, 1200);
      } else if (quickEdit.key === 'instagram') {
        const sanitized = newVal.trim().replace(/^@/, '');
        await updateSetting(
          'instagram',
          sanitized ? `https://www.instagram.com/${sanitized}` : '',
        );
      } else if (quickEdit.key === 'subtitle') {
        await updateSetting('subtitle', newVal.slice(0, 35));
      } else {
        await updateSetting(quickEdit.key as any, newVal);
      }
      setQuickEdit(null);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('duplicate key') || err.message?.includes('stores_slug_key')) {
        showFeedback('error', 'Bu dükkan adresi zaten başka bir işletme tarafından kullanılıyor!');
      } else {
        showFeedback('error', 'Güncelleme sırasında bir hata oluştu');
      }
    }
  };

  return {
    isUploading,
    helpId,
    setHelpId,
    hiddenHelpIds,
    localConfig,
    localAnnouncement,
    localMaintenance,
    localInline,
    quickEdit,
    setQuickEdit,
    getOptionState,
    toggleOption,
    toggleAnnouncement,
    toggleMaintenance,
    handleToggleInline,
    handleLogoUpload,
    hideHelpPermanently,
    handleIdentityClick,
    handleQuickSave,
  };
}
