import { useState, useEffect, useCallback, useRef } from 'react';
import { LABELS } from '../data/config';
import { CompanySettings } from '../types';

/**
 * COMMON UTILITY HOOKS (DIAMOND STANDARD)
 * -----------------------------------------------------------
 * Generic tools for state persistence, debouncing, and general logic.
 */

/**
 * useDebounce: Delays updating a value until a specific time has passed.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

/**
 * useLocalStorage: Ensures seamless data retention across browser sessions.
 */
export function useLocalStorage<T>(storageKey: string, initialValue: T): [T, (updateValue: T | ((val: T) => T)) => void] {
  const [persistedData, setPersistedData] = useState<T>(() => {
    try {
      const serializedItem = window.localStorage.getItem(storageKey);
      return serializedItem ? JSON.parse(serializedItem) : initialValue;
    } catch (readError) {
      console.warn(LABELS.storage.readError(storageKey), readError);
      return initialValue;
    }
  });

  const updatePersistedData = useCallback(
    (updateValue: T | ((val: T) => T)) => {
      setPersistedData((previousData) => {
        const finalizedData = updateValue instanceof Function ? updateValue(previousData) : updateValue;
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(finalizedData));
        } catch (writeError) {
          if (
            writeError instanceof DOMException &&
            (writeError.name === 'QuotaExceededError' || writeError.name === 'NS_ERROR_DOM_QUOTA_REACHED')
          ) {
            console.error(LABELS.storage.quotaExceeded);
            alert(LABELS.storage.quotaAlert);
          }
        }
        return finalizedData;
      });
    },
    [storageKey]
  );

  return [persistedData, updatePersistedData];
}

/**
 * useScrollLock: Locks body scroll and prevents layout shift.
 */
export function useScrollLock(lock: boolean) {
  const lockScroll = useCallback(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }, []);

  const unlockScroll = useCallback(() => {
    document.body.style.overflow = 'unset';
    document.body.style.paddingRight = '0px';
  }, []);

  useEffect(() => {
    if (lock) lockScroll();
    else unlockScroll();
    return () => unlockScroll();
  }, [lock, lockScroll, unlockScroll]);
}

/**
 * useKeyboard: Listens for specific keyboard events.
 */
export function useKeyboard(key: string, callback: () => void, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === key) callback();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, enabled]);
}

/**
 * useFocusTrap: Traps keyboard focus for accessibility.
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, active: boolean) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) {
      if (previousFocusRef.current) previousFocusRef.current.focus();
      return;
    }
    previousFocusRef.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !containerRef.current) return;
      const focusable = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    const focusTimeout = setTimeout(() => {
      if (containerRef.current) {
        const focusable = containerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) (focusable[0] as HTMLElement).focus();
      }
    }, 50);

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(focusTimeout);
    };
  }, [active, containerRef]);
}

/**
 * useModalBehavior: Unified orchestration for modal accessibility and UX.
 */
export function useModalBehavior(
  isOpen: boolean,
  containerRef: React.RefObject<HTMLElement>,
  onClose: () => void,
  disableEsc: boolean = false,
  isStatic: boolean = false
) {
  useScrollLock(isOpen && !isStatic);
  useKeyboard('Escape', onClose, isOpen && !disableEsc && !isStatic);
  useFocusTrap(containerRef, isOpen && !isStatic);
}

/**
 * useSyncMetadata: Synchronizes Browser Tab Title and Favicon.
 */
export function useSyncMetadata(settings: CompanySettings | null, isAdmin: boolean) {
  useEffect(() => {
    if (!settings || !settings.id) return;
    const baseTitle = settings.title || 'E-Katalog';
    document.title = isAdmin ? `[Admin] ${baseTitle}` : baseTitle;

    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    if (settings.logoUrl) link.href = settings.logoUrl;
  }, [isAdmin, settings]);
}

/**
 * useResponsiveShadow: Calculates shadow offset based on mouse or device movement.
 */
export function useResponsiveShadow(intensity = 30, baseOffset = 15) {
  const [shadowOffset, setShadowOffset] = useState({ x: 0, y: baseOffset });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * intensity;
      const y = (e.clientY / window.innerHeight - 0.5) * intensity;
      setShadowOffset({ x: -x, y: -y + baseOffset }); 
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        const x = Math.max(-20, Math.min(20, e.gamma / 1.5));
        const y = Math.max(-20, Math.min(20, (e.beta - 45) / 1.5));
        setShadowOffset({ x: -x, y: -y + baseOffset });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('deviceorientation', handleDeviceOrientation);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [intensity, baseOffset]);

  return shadowOffset;
}
