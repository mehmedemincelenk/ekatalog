import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Lucide from 'lucide-react';
import { THEME } from '../data/config';

const DOMAIN_EXTENSIONS = ['site', 'coffee', 'cafe', 'ltd', 'io'];

export default function LandingPage() {
  const [domainIndex, setDomainIndex] = useState(0);
  const [_mockupState, setMockupState] = useState<{
    activeModal: string | null;
    isAdmin: boolean;
  }>({
    activeModal: null,
    isAdmin: false,
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'EKATALOG_MOCKUP_STATE') {
        setMockupState({
          activeModal: event.data.activeModal,
          isAdmin: event.data.isAdmin,
        });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const domainInterval = setInterval(() => {
      setDomainIndex((prev) => (prev + 1) % DOMAIN_EXTENSIONS.length);
    }, 1000);

    return () => {
      clearInterval(domainInterval);
    };
  }, []);

  useEffect(() => {
    document.title = 'ekatalog';

    // Function to set the correct theme-aware favicon dynamically
    const updateFavicon = () => {
      const isDark =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;

      // Clean up any existing favicon links
      const links = document.querySelectorAll("link[rel*='icon']");
      links.forEach((l) => l.remove());

      // Create new favicon link tag
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.type = 'image/svg+xml';
      newLink.href = isDark
        ? '/images/logo_dark.svg?v=5'
        : '/images/logo_lg.svg?v=5';
      document.head.appendChild(newLink);
    };

    updateFavicon();

    // Listen for theme changes dynamically
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => updateFavicon();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(listener);
    }

    // Body arkaplanını beyaza set ederek tarayıcı kaydırma taşmalarındaki gri rengi önlüyoruz
    const originalBgColor = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#ffffff';

    return () => {
      document.body.style.backgroundColor = originalBgColor;
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', listener);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(listener);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-stone-900 selection:text-white">
      {/* STICKY PROMO BAR */}
      <div
        className="sticky top-0 z-[100] text-white py-3 px-4 text-center shadow-lg overflow-hidden"
        style={{ backgroundColor: THEME.colors.marketing.primary }}
      >
        <p className="text-[10px] font-medium uppercase tracking-[0.1em] whitespace-nowrap opacity-90 flex items-center justify-center">
          webadresi <span className="font-black opacity-100 ml-1">hediye</span>{' '}
          <span className="mx-2 opacity-50">→</span>
          <span className="font-black bg-black/10 px-2 py-0.5 rounded normal-case opacity-100 inline-flex items-center">
            www.sirketiniz.ekatalog.
            <span className="relative inline-flex h-[1em] overflow-visible">
              <AnimatePresence mode="wait">
                <motion.span
                  key={DOMAIN_EXTENSIONS[domainIndex]}
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -5, opacity: 0 }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                  className="text-white leading-none inline-block whitespace-nowrap translate-y-[0.05em]"
                >
                  {DOMAIN_EXTENSIONS[domainIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </span>
        </p>
      </div>

      <section className="pt-10 pb-12 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-2 relative">
          {/* Milli Teknoloji Hamlesi Watermark */}
          <div className="absolute top-[-40px] sm:top-[-80px] left-1/2 -translate-x-[110%] sm:translate-x-[25%] w-56 sm:w-[360px] opacity-[0.07] pointer-events-none select-none z-0">
            <img
              src="/images/milli_teknoloji_hamlesi.png"
              alt="Milli Teknoloji Hamlesi"
              className="w-full h-auto object-contain"
            />
          </div>

          <h1 className="text-7xl sm:text-8xl font-black text-stone-900 tracking-tighter leading-none animate-in slide-in-from-bottom-8 duration-700 relative z-10 pt-2">
            ekatalog
          </h1>

          <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight leading-none relative z-10 pt-2 uppercase">
            katalog menü angaryaları/maliyetleri geçmişte kalıyor
          </h2>


          <div className="pt-8 flex flex-col items-center justify-center relative z-20 space-y-4">
            {/* Premium Phone Frame Mockup */}
            <div className="relative w-[260px] h-[520px] sm:w-[300px] sm:h-[600px] bg-stone-950 rounded-[1.75rem] p-2 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.1)] border border-stone-850 ring-4 ring-stone-900/5">
              {/* Örnek E-Katalog Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-stone-900 text-stone-100 text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full border border-stone-800 shadow-md z-30 select-none">
                örnek ekatalog
              </div>

              {/* Screen Container */}
              <div className="w-full h-full rounded-[1.25rem] overflow-hidden bg-stone-50 border border-stone-900 relative">
                <iframe
                  src="/landingpage"
                  className="border-none origin-top-left w-[140%] h-[140%] scale-[0.714] sm:w-[120%] sm:h-[120%] sm:scale-[0.8333]"
                  title="E-Katalog Canlı Demo"
                />
              </div>
            </div>

            <div className="pt-4 w-full">
              <a
                href="https://wa.me/905373420161"
                target="_blank"
                rel="noreferrer"
                className="block hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 max-w-md mx-auto"
              >
                <div
                  className="rounded-[2rem] p-5 shadow-2xl relative overflow-hidden w-full"
                  style={{ backgroundColor: THEME.colors.marketing.brand }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent"></div>

                  <div className="relative z-10 flex items-center gap-4 text-left">
                    {/* Left Side: Squircle App Icon Button */}
                    <div className="shrink-0">
                      <div className="w-16 h-16 bg-[#25D366] text-white flex items-center justify-center rounded-2xl shadow-none">
                        <div className="w-8 h-8 fill-white drop-shadow-sm transition-transform duration-300">
                          {THEME.icons.whatsapp}
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Text Copy */}
                    <div className="flex-1 space-y-1">
                      <h2 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug">
                        Eski Katalog Menünüzü Gönderin
                      </h2>
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        ÜCRETSİZ KURALIM
                      </p>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* AVOID LOSS (STAKES) - Modernist Minimalist (Kurtulacaklarınız) */}
          <div className="pt-16 max-w-3xl mx-auto text-center space-y-4 relative z-10">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.4em]">
                kurtulacaklarınız
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 px-4 pt-2">
              <div className="flex items-center gap-2 bg-red-50/60 border border-red-100/80 rounded-full py-1.5 px-4 text-xs font-bold text-red-800/90 shadow-sm shadow-red-100/30 hover:bg-red-100/40 transition-colors">
                <span>fiyat değiştirme zorluğu</span>
              </div>
              <div className="flex items-center gap-2 bg-red-50/60 border border-red-100/80 rounded-full py-1.5 px-4 text-xs font-bold text-red-800/90 shadow-sm shadow-red-100/30 hover:bg-red-100/40 transition-colors">
                <span>fiyat değişikliklerine geç kalmak</span>
              </div>
              <div className="flex items-center gap-2 bg-red-50/60 border border-red-100/80 rounded-full py-1.5 px-4 text-xs font-bold text-red-800/90 shadow-sm shadow-red-100/30 hover:bg-red-100/40 transition-colors">
                <span>tasarımcı/yazılımcı beklemek</span>
              </div>
            </div>
          </div>

          {/* THE SUPERPOWERS (Kazanacaklarınız) - Flat typographic minimalist design */}
          <div className="pt-16 max-w-4xl mx-auto space-y-8">
            <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.4em]">
              kazanacaklarınız
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto px-4">
              {/* Pillar 1: App & Web */}
              <div className="bg-stone-50/40 border border-stone-100/80 rounded-2xl p-5 hover:bg-stone-50/80 transition-all shadow-sm shadow-stone-100/10 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 bg-emerald-50/60 border border-emerald-100/80 rounded-lg py-1.5 px-4 text-xs font-bold text-emerald-800/90 shadow-sm shadow-emerald-100/30 hover:bg-emerald-100/40 transition-colors shrink-0">
                  <Lucide.Globe size={12} className="text-emerald-600" />
                  <span>hem app hem web</span>
                </div>
                <div className="flex-1 flex items-center justify-center pt-3">
                  <p className="text-xs text-stone-500 font-medium leading-relaxed">
                    markanıza özel ücretsiz web sitesi, cepten yönetim ve mobil uygulama kurulumu
                  </p>
                </div>
              </div>

              {/* Pillar 2: Bikaç Tıkla Teknoloji */}
              <div className="bg-stone-50/40 border border-stone-100/80 rounded-2xl p-5 hover:bg-stone-50/80 transition-all shadow-sm shadow-stone-100/10 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 bg-emerald-50/60 border border-emerald-100/80 rounded-lg py-1.5 px-4 text-xs font-bold text-emerald-800/90 shadow-sm shadow-emerald-100/30 hover:bg-emerald-100/40 transition-colors shrink-0">
                  <Lucide.Sparkles size={12} className="text-emerald-600" />
                  <span>bikaç tıkla teknoloji</span>
                </div>
                <div className="flex-1 flex items-center justify-center pt-3">
                  <p className="text-xs text-stone-500 font-medium leading-relaxed">
                    Yazılım veya tasarım bilmenize gerek yok; bikaç tıkla kataloğunuzu yönetin, <span className="font-bold text-stone-900">Google reklamı verin</span>, toplu yükleme yapın ve sosyal medya tasarımlarınızı cebe indirin.
                  </p>
                </div>
              </div>

              {/* Pillar 3: Hazır Tasarımlar */}
              <div className="bg-stone-50/40 border border-stone-100/80 rounded-2xl p-5 hover:bg-stone-50/80 transition-all shadow-sm shadow-stone-100/10 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 bg-emerald-50/60 border border-emerald-100/80 rounded-lg py-1.5 px-4 text-xs font-bold text-emerald-800/90 shadow-sm shadow-emerald-100/30 hover:bg-emerald-100/40 transition-colors shrink-0">
                  <Lucide.Palette size={12} className="text-emerald-600" />
                  <span>hazır tasarımlar</span>
                </div>
                <div className="flex-1 flex items-center justify-center pt-3">
                  <p className="text-xs text-stone-500 font-medium leading-relaxed">
                    kataloğunuza yönlendiren QR telefon kılıfları, masa kartları, kartvizitler, hazır sosyal medya gönderileri ve tüm baskı/tasarım çözümleri
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING & TRUST SECTION - Clean Modernist Layout */}
      <section className="pb-16 px-4">
        <div className="text-center flex flex-col items-center animate-in fade-in duration-1000 delay-500">
          <div className="flex flex-col items-center space-y-2">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.3em] line-through">
                ₺499 / AY
              </p>
              <p className="text-5xl font-black text-stone-900 tracking-tighter leading-none pr-1">
                ₺299
                <span className="text-lg font-bold opacity-30 ml-2">/ ay</span>
              </p>
              <p className="text-xs font-bold text-emerald-600 mt-2 uppercase tracking-wider">
                90 GÜN ÜCRETSİZ DENE
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3-STEP PLAN SECTION */}
      <section className="pb-16 px-4 border-t border-stone-50 pt-16 max-w-3xl mx-auto w-full">
        <div className="text-center space-y-8">
          <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.4em]">
            3 adımda kolay kurulum
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-2xl mx-auto">
            {/* Step 1 */}
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-black text-sm">
                1
              </div>
              <h3 className="text-sm font-black text-stone-900 tracking-tight">
                Kataloğunuzu Gönderin
              </h3>
              <p className="text-xs text-stone-500 font-medium leading-relaxed">
                Eski katalog veya menünüzü WhatsApp'tan bize atın.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-black text-sm">
                2
              </div>
              <h3 className="text-sm font-black text-stone-900 tracking-tight">
                Biz Kuralım
              </h3>
              <p className="text-xs text-stone-500 font-medium leading-relaxed">
                Dükkanınızı 24 saat içinde tamamen hazır hale getirelim.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-black text-sm">
                3
              </div>
              <h3 className="text-sm font-black text-stone-900 tracking-tight">
                Cepten Yönetin
              </h3>
              <p className="text-xs text-stone-500 font-medium leading-relaxed">
                Fiyatlarınızı telefondan güncelleyin ve anında paylaşın.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-stone-100 pt-8 flex items-center justify-between gap-4 px-6 pb-8 max-w-3xl mx-auto w-full">
        <div className="flex items-center select-none">
          <img
            src="/images/logo_lg.svg?v=5"
            alt="ekatalog"
            className="w-6 h-6"
          />
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-stone-600">
          <a
            href="tel:905373420161"
            className="hover:text-stone-900 transition-colors font-black tracking-tight"
          >
            +90 537 342 01 61
          </a>

          <span className="text-stone-200 select-none">|</span>

          <a
            href="mailto:mehmedemincelenk@gmail.com"
            className="flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            title="E-posta"
          >
            <svg
              className="w-4 h-4 fill-none stroke-current stroke-2 text-stone-600 hover:text-stone-900 transition-colors"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 6l-10 7L2 6" />
            </svg>
          </a>

          <span className="text-stone-200 select-none">|</span>

          <a
            href="https://www.linkedin.com/in/celenkemin/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            title="LinkedIn"
          >
            <svg
              className="w-4 h-4 fill-current text-stone-600 hover:text-[#0077B5] transition-colors"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}
