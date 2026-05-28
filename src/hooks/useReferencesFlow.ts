import { useState } from 'react';
import { REFERENCES } from '../data/config';
import { useSettings } from './useSettingsHub';
import { useStore } from '../store';

export function useReferencesFlow(isAdmin: boolean = false) {
  const { settings, updateSetting } = useSettings(isAdmin);
  const [isUploading, setIsUploading] = useState<number | null>(null);

  const [activeQuickEdit, setActiveQuickEdit] = useState<{
    id: number;
    name: string;
    isNew?: boolean;
  } | null>(null);

  const activeReferences =
    settings && settings.referencesData && settings.referencesData.length > 0
      ? settings.referencesData
      : isAdmin
        ? []
        : REFERENCES;

  const handleDelete = (id: number) => {
    const updated = activeReferences.filter((r) => r.id !== id);
    updateSetting('referencesData', updated);
  };

  const handleSaveEdit = (newName: string) => {
    if (!activeQuickEdit) return;

    if (activeQuickEdit.isNew) {
      if (newName.trim()) {
        updateSetting('referencesData', [
          ...activeReferences,
          { id: Date.now(), name: newName.trim(), logo: '' },
        ]);
      }
    } else {
      const updated = activeReferences.map((r) =>
          r.id === activeQuickEdit.id ? { ...r, name: newName } : r
      );
      updateSetting('referencesData', updated);
    }
    setActiveQuickEdit(null);
  };

  const handleUploadLogo = async (id: number, file: File) => {
    const adminPin = useStore.getState().adminPin;
    const showFeedback = useStore.getState().showFeedback;
    if (!file || !adminPin) return;

    setIsUploading(id);
    try {
      const { secureUploadVisualAsset } = await import('../utils/image');
      const currentRef = activeReferences.find((r) => r.id === id);
      const finalizedUrl = await secureUploadVisualAsset({
        file,
        folder: 'references',
        adminPin,
        oldUrl: currentRef?.logo || '',
        slugBaseName: `${settings?.name || 'reference'}_ref_${id}`,
        uniqueIdPrefix: 'ref',
        isDualQuality: false,
      });

      const updated = activeReferences.map((r) =>
        r.id === id ? { ...r, logo: finalizedUrl } : r
      );
      await updateSetting('referencesData', updated);
      showFeedback('success', 'Referans logosu güncellendi');
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Logo yüklenirken bir hata oluştu');
    } finally {
      setIsUploading(null);
    }
  };

  return {
    activeReferences,
    activeQuickEdit,
    setActiveQuickEdit,
    handleDelete,
    handleSaveEdit,
    handleUploadLogo,
    isUploading,
  };
}
