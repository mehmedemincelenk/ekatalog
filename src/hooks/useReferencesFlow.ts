import { useState } from 'react';
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
      : [];

  const handleDelete = async (id: number) => {
    const showFeedback = useStore.getState().showFeedback;
    const updated = activeReferences.filter((r) => r.id !== id);
    try {
      await updateSetting('referencesData', updated);
      showFeedback('success', 'Referans silindi');
    } catch (err: any) {
      console.error(err);
      showFeedback('error', 'Hata oluştu');
    }
  };

  const handleSaveEdit = async (newName: string) => {
    if (!activeQuickEdit) return;
    const showFeedback = useStore.getState().showFeedback;

    if (activeQuickEdit.isNew) {
      if (newName.trim()) {
        try {
          await updateSetting('referencesData', [
            ...activeReferences,
            { id: Date.now(), name: newName.trim(), logo: '' },
          ]);
          showFeedback('success', 'Referans eklendi');
        } catch (err: any) {
          console.error(err);
          showFeedback('error', 'Hata oluştu');
        }
      }
    } else {
      const updated = activeReferences.map((r) =>
          r.id === activeQuickEdit.id ? { ...r, name: newName } : r
      );
      try {
        await updateSetting('referencesData', updated);
        showFeedback('success', 'Referans güncellendi');
      } catch (err: any) {
        console.error(err);
        showFeedback('error', 'Hata oluştu');
      }
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

  const handleOrderChange = async (id: number, newIndex: number) => {
    const itemToMove = activeReferences.find((r) => r.id === id);
    if (!itemToMove) return;

    const remaining = activeReferences.filter((r) => r.id !== id);
    const updated = [
      ...remaining.slice(0, newIndex),
      itemToMove,
      ...remaining.slice(newIndex),
    ];
    await updateSetting('referencesData', updated);
  };

  return {
    activeReferences,
    activeQuickEdit,
    setActiveQuickEdit,
    handleDelete,
    handleSaveEdit,
    handleUploadLogo,
    handleOrderChange,
    isUploading,
  };
}
