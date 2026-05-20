import { useEffect, useRef } from 'react';
import { TurnstileProps, TurnstileOptions } from '../../types';

export default function Turnstile({ onVerify: oV, options: o = {} }: TurnstileProps) {
  const cR = useRef<HTMLDivElement>(null);
  const wR = useRef<string | null>(null);

  useEffect(() => {
    if (!window.turnstile) return;
    if (wR.current) window.turnstile.remove(wR.current);
    const hn = window.location.hostname;
    const aK = (hn === 'localhost' || hn === '127.0.0.1') ? '1x00000000000000000000AA' : (import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAADAJkSXkZ8wkzSTM');
    wR.current = window.turnstile.render(cR.current!, { sitekey: aK, callback: (t: string) => oV(t), theme: o.theme || 'auto', size: o.size || 'normal' });
    return () => { if (wR.current) window.turnstile.remove(wR.current); };
  }, [oV, o.theme, o.size]);

  return <div ref={cR} className="my-4 flex justify-center" />;
}

declare global { interface Window { turnstile: { render: (c: string | HTMLElement, o: TurnstileOptions) => string; remove: (wId: string) => void; }; } }
