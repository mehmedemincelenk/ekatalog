import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { useSettings } from './useSettingsHub';
import { CompanySettings } from '../types';
import { compressVisualToDataUri } from '../utils/image';
import { openInstagram } from '../utils/contact';

export function useNavbarFlow(
  onLogoPointerDown: () => void,
  onLogoPointerUp: () => void,
  isInlineEnabled: boolean,
) {
  const {
    isAdmin,
    settings,
    searchQuery: search,
    setSearchQuery: onSearchChange,
  } = useStore();

  const { updateSetting } = useSettings(isAdmin);

  const [isLogoPressed, setIsLogoPressed] = useState(false);
  const [internalSearch, setInternalSearch] = useState(search || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange) onSearchChange(internalSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [internalSearch, onSearchChange]);

  const [prevSearch, setPrevSearch] = useState(search);
  if (search !== prevSearch) {
    setPrevSearch(search);
    setInternalSearch(search || '');
  }

  const [quickEdit, setQuickEdit] = useState<{
    key: keyof CompanySettings;
    value: string;
    title: string;
    maxLength?: number;
  } | null>(null);

  const logoPressStartTimeRef = useRef<number>(0);

  const handlePressStart = () => {
    setIsLogoPressed(true);
    logoPressStartTimeRef.current = Date.now();
    onLogoPointerDown();
  };

  const handlePressEnd = () => {
    setIsLogoPressed(false);
    const holdDuration = Date.now() - logoPressStartTimeRef.current;
    onLogoPointerUp();

    // Short click in Admin Mode -> Trigger Upload
    if (isAdmin && holdDuration < 300) {
      document.getElementById('logo-upload-input')?.click();
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      const dataUri = await compressVisualToDataUri(file, 400, 0.8);
      updateSetting('logoUrl', dataUri);
    } catch (error) {
      console.error('Logo upload error:', error);
      alert('Logo yüklenirken bir hata oluştu.');
    }
  };

  const handleInstagramAction = () => {
    if (!settings) return;
    if (isAdmin) {
      const currentUrl = settings.instagram || '';
      const currentUsername =
        currentUrl.split('instagram.com/').pop()?.replace(/\//g, '') || '';

      setQuickEdit({
        key: 'instagram',
        value: currentUsername,
        title: 'Instagram Adresi',
      });
      return;
    }
    if (settings.instagram) openInstagram(settings.instagram);
  };

  const handleTextEdit = (
    key: keyof CompanySettings,
    current: string,
    label: string,
    maxLength?: number,
  ) => {
    if (!isAdmin || isInlineEnabled) return;
    setQuickEdit({
      key,
      value: current,
      title: label,
      maxLength,
    });
  };

  const handleQuickSave = (newVal: string) => {
    if (!quickEdit) return;

    if (quickEdit.key === 'instagram') {
      const sanitized = newVal.trim().replace(/^@/, '');
      updateSetting(
        'instagram',
        sanitized ? `https://www.instagram.com/${sanitized}` : '',
      );
    } else if (quickEdit.key === 'subtitle') {
      const sliced = newVal.slice(0, 20);
      updateSetting('subtitle', sliced);
    } else {
      updateSetting(quickEdit.key as any, newVal);
    }
    setQuickEdit(null);
  };

  const handleAnnouncementBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
    if (!settings?.announcementBar) return;
    let newText = e.currentTarget.textContent?.trim() || '';
    if (newText.length > 60) {
      newText = newText.slice(0, 60);
      e.currentTarget.textContent = newText;
    }
    if (newText !== settings.announcementBar.text) {
      updateSetting('announcementBar', {
        ...settings.announcementBar,
        text: newText,
      });
    }
  };

  return {
    isAdmin,
    settings,
    updateSetting,
    isLogoPressed,
    internalSearch,
    setInternalSearch,
    quickEdit,
    setQuickEdit,
    handlePressStart,
    handlePressEnd,
    handleLogoUpload,
    handleInstagramAction,
    handleTextEdit,
    handleQuickSave,
    handleAnnouncementBlur,
  };
}
