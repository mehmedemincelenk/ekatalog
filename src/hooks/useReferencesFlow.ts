import { useState } from 'react';
import { REFERENCES } from '../data/config';
import { useSettings } from './useSettingsHub';

export function useReferencesFlow(isAdmin: boolean = false) {
  const { settings, updateSetting } = useSettings(isAdmin);

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

  return {
    activeReferences,
    activeQuickEdit,
    setActiveQuickEdit,
    handleDelete,
    handleSaveEdit,
  };
}
