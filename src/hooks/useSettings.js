import { useState, useEffect } from 'react';
import { getStorageKey, DEFAULT_BRANDING } from '../data/config';

export function useSettings(slug = 'demo') {
  const storageKey = getStorageKey(slug) + '_settings';

  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : DEFAULT_BRANDING;
    } catch {
      return DEFAULT_BRANDING;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(settings));
    } catch (err) {
      console.error('Settings Storage Hatası:', err);
    }
  }, [settings, storageKey]);

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return { settings, updateSettings };
}
