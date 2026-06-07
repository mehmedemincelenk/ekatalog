// FILE ROLE: Admin Authentication and Session Engine (Pin & Gestures)
// DEPENDS ON: TECH/STORAGE constants, Supabase
// CONSUMED BY: App.tsx, Navbar.tsx, Protected Components
import { useState, useCallback, useRef, useEffect } from 'react';
import { TECH } from '../data/config';
import { supabase } from '../supabase';
import { getActiveStoreSlug } from '../utils/core';
import { useStore } from '../store';

const STORE_SLUG = getActiveStoreSlug();

/**
 * ADMIN SESSION & GESTURE ENGINE (Diamond Standard)
 * -----------------------------------------------------------
 * Güvenlik ve gizli geçitlerin yönetim merkezi.
 * - Admin oturumu yönetimi.
 * - Akıllı Gesture Algılama (PIN vs QR Ayrımı).
 * - Sunucu taraflı PIN doğrulama (RPC).
 */
export function useAdminMode() {
  const {
    isAdmin,
    setIsAdmin,
    isInlineEnabled,
    toggleInlineEdit,
    setAdminPin,
  } = useStore();

  const [lockoutUntil, setLockoutUntil] = useState<number | null>(() => {
    const saved = sessionStorage.getItem('admin_lockout_until');
    return saved ? parseInt(saved, 10) : null;
  });
  const [isLockedOut, setIsLockedOut] = useState(() => {
    return !!lockoutUntil && Date.now() < lockoutUntil;
  });
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Check for lockout expiry
  useEffect(() => {
    if (!lockoutUntil) return;

    const check = setInterval(() => {
      const isStillLocked = Date.now() < lockoutUntil;
      if (!isStillLocked) {
        setLockoutUntil(null);
        setFailedAttempts(0);
        sessionStorage.removeItem('admin_lockout_until');
        setIsLockedOut(false);
        clearInterval(check);
      } else {
        setIsLockedOut(true);
      }
    }, 1000);
    return () => clearInterval(check);
  }, [lockoutUntil]);

  const verifyPinWithServer = useCallback(
    async (pin: string) => {
      if (STORE_SLUG === 'main-site' || STORE_SLUG === 'landing') return false;

      if (isLockedOut) return false;

      if (STORE_SLUG === 'landingpage') {
        const isSuccess = pin === '0000';
        if (!isSuccess) {
          const newAttempts = failedAttempts + 1;
          setFailedAttempts(newAttempts);

          if (newAttempts >= 3) {
            const until = Date.now() + 60000;
            setLockoutUntil(until);
            sessionStorage.setItem('admin_lockout_until', String(until));
            setIsLockedOut(true);
          }
        } else {
          setFailedAttempts(0);
          setIsLockedOut(false);
          setAdminPin(pin);
        }
        return isSuccess;
      }

      const { data: isSuccess, error } = await supabase.rpc(
        'verify_admin_access',
        {
          target_slug: STORE_SLUG,
          input_pin: pin,
        },
      );

      if (error) {
        console.error('❌ PIN doğrulama hatası (Detaylı):', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        return false;
      }

      if (!isSuccess) {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= 3) {
          const until = Date.now() + 60000;
          setLockoutUntil(until);
          sessionStorage.setItem('admin_lockout_until', String(until));
          setIsLockedOut(true);
        }
      } else {
        setFailedAttempts(0);
        setIsLockedOut(false);
        setAdminPin(pin);
      }

      return isSuccess;
    },
    [failedAttempts, isLockedOut, setAdminPin],
  );

  const openModal = useStore((state) => state.openModal);

  // GESTURE ENGINE REFS
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const pointerDownTime = useRef(0);
  const timeoutTimer = useRef<NodeJS.Timeout | null>(null);

  // LOGOUT
  const logout = useCallback(() => {
    setIsAdmin(false);
    setAdminPin(null);
    if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
  }, [setIsAdmin, setAdminPin]);

  // SESSION TIMEOUT
  const resetTimeout = useCallback(() => {
    if (!isAdmin) return;
    if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
    timeoutTimer.current = setTimeout(logout, TECH.auth.timeoutMs);
  }, [isAdmin, logout]);

  useEffect(() => {
    if (!isAdmin) return;
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ];
    const handleActivity = () => resetTimeout();
    events.forEach((name) => document.addEventListener(name, handleActivity));
    resetTimeout();
    return () => {
      events.forEach((name) =>
        document.removeEventListener(name, handleActivity),
      );
      if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
    };
  }, [isAdmin, resetTimeout]);

  // SMART TRIGGER LOGIC:
  // 1. Long Press (1.2s) -> Admin PIN / Logout
  const handleMenuPointerDown = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    pointerDownTime.current = Date.now();

    longPressTimer.current = setTimeout(() => {
      if (isAdmin) {
        logout();
      } else {
        openModal('PIN');
      }
    }, 1200);
  }, [isAdmin, logout, openModal]);

  const handleMenuPointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const closeModal = useStore((state) => state.closeModal);

  const onPinSuccess = useCallback(() => {
    setIsAdmin(true);
    closeModal();
  }, [closeModal, setIsAdmin]);

  return {
    isAdmin,
    handleMenuPointerDown,
    handleMenuPointerUp,
    logout,
    verifyPinWithServer,
    onPinSuccess,
    isInlineEnabled,
    toggleInlineEdit,
    isLockedOut,
    failedAttempts,
  };
}
