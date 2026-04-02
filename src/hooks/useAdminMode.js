import { useState, useCallback, useEffect } from 'react';
import { ADMIN } from '../data/config';
import { useTenant } from './useTenant';

export function useAdminMode() {
  const { isGhostMode } = useTenant();

  // Ghost mode ise her zaman admin olarak başla
  const [isAdmin, setIsAdmin] = useState(isGhostMode);
  const [clickCount, setClickCount] = useState(0);
  const [timerId, setTimerId] = useState(null);

  // Tenant değiştiğinde veya ghost mode durumu değiştiğinde state'i güncelle
  useEffect(() => {
    setIsAdmin(isGhostMode);
  }, [isGhostMode]);

  const handleLogoClick = useCallback(() => {
    // Eğer ghost mode'daysa zaten admindir, çıkış yapamaz
    if (isGhostMode) return;

    if (isAdmin) {
      setIsAdmin(false);
      setClickCount(0);
      if (timerId) clearTimeout(timerId);
      return;
    }

    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= ADMIN.triggerClicks) {
        setIsAdmin(true);
        return 0;
      }
      return next;
    });

    if (timerId) clearTimeout(timerId);
    const id = setTimeout(() => setClickCount(0), ADMIN.resetDelayMs);
    setTimerId(id);
  }, [timerId, isAdmin, isGhostMode]);

  return { isAdmin, handleLogoClick };
}
