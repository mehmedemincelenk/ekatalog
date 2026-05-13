import { useEffect, useRef } from 'react';

import { TurnstileProps, TurnstileOptions } from '../../types';

/**
 * TURNSTILE COMPONENT (Cloudflare Security Widget)
 * -----------------------------------------------------------
 * Provides intelligent, non-intrusive bot protection.
 */
const Turnstile = ({ onVerify, options = {} }: TurnstileProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Cloudflare scriptinin yüklendiğinden emin ol
    if (!window.turnstile) {
      console.warn('Cloudflare Turnstile script not loaded yet.');
      return;
    }

    // Eğer zaten bir widget varsa salla
    if (widgetIdRef.current) {
      window.turnstile.remove(widgetIdRef.current);
    }

    // Yerel geliştirme ortamında test anahtarını, canlıda gerçek anahtarı kullanıyoruz.
    const isLocal =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    
    const activeSiteKey = isLocal
      ? '1x00000000000000000000AA' 
      : (import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAADAJkSXkZ8wkzSTM');

    widgetIdRef.current = window.turnstile.render(containerRef.current!, {
      sitekey: activeSiteKey,
      callback: (token: string) => onVerify(token),
      theme: options.theme || 'auto',
      size: options.size || 'normal',
    });

    return () => {
      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [onVerify, options.theme, options.size]);

  return <div ref={containerRef} className="my-4 flex justify-center" />;
};

export default Turnstile;

declare global {
  interface Window {
    turnstile: {
      render: (
        container: string | HTMLElement,
        options: TurnstileOptions,
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}
