import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { useTenant } from './useTenant';
import { DEFAULT_BRANDING } from '../data/config';

export function useSettings() {
  const { slug } = useTenant();
  const [settings, setSettings] = useState(DEFAULT_BRANDING);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await db.settings.get(slug);
        if (mounted) setSettings(data);
      } catch (err) {
        console.error('Ayarlar yüklenirken hata:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, [slug]);

  useEffect(() => {
    if (!isLoading) {
      db.settings.update(slug, settings).catch(err => {
         console.error('Ayarlar kaydedilirken hata:', err);
      });
    }
  }, [settings, slug, isLoading]);

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return { settings, updateSettings, isLoading };
}
