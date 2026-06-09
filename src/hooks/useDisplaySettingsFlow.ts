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
    if (key === 'showQR') return val !== false;
    if (key === 'showPhone') return val !== false;
    if (key === 'showTitle') return val !== false;
    if (key === 'showReferences') return val !== false;
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

  const setOptionValue = async (key: keyof DisplayConfig, val: any) => {
    setLocalConfig((prev) => ({ ...prev, [key]: val }));
    try {
      await updateSetting('displayConfig', {
        ...settings.displayConfig,
        [key]: val,
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

  return {
    isUploading,
    helpId,
    setHelpId,
    hiddenHelpIds,
    localConfig,
    localAnnouncement,
    localMaintenance,
    localInline,
    getOptionState,
    toggleOption,
    setOptionValue,
    toggleAnnouncement,
    toggleMaintenance,
    handleToggleInline,
    handleLogoUpload,
    hideHelpPermanently,
  };
}
