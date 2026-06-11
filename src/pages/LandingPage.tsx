import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Lucide from 'lucide-react';
import { THEME } from '../data/config';
import Button from '../components/ui/Button';

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
              <p className="text-[10px] font-black text-stone-800 uppercase tracking-[0.4em]">
                bikaç tıkla kurtulacaklarınız
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 px-4 pt-2">
              <div className="flex items-center gap-2 bg-red-50/60 border border-red-100/80 rounded-lg py-1.5 px-4 text-xs font-bold text-red-800/90 shadow-sm shadow-red-100/30 hover:bg-red-100/40 transition-colors">
                <span>fiyat değişikliklerine yetişememek</span>
              </div>
              <div className="flex items-center gap-2 bg-red-50/60 border border-red-100/80 rounded-lg py-1.5 px-4 text-xs font-bold text-red-800/90 shadow-sm shadow-red-100/30 hover:bg-red-100/40 transition-colors">
                <span>tasarımcı/yazılımcı beklemek</span>
              </div>
              <div className="flex items-center gap-2 bg-red-50/60 border border-red-100/80 rounded-lg py-1.5 px-4 text-xs font-bold text-red-800/90 shadow-sm shadow-red-100/30 hover:bg-red-100/40 transition-colors">
                <span>karmaşa</span>
              </div>
              <div className="flex items-center gap-2 bg-red-50/60 border border-red-100/80 rounded-lg py-1.5 px-4 text-xs font-bold text-red-800/90 shadow-sm shadow-red-100/30 hover:bg-red-100/40 transition-colors">
                <span>maliyetler</span>
              </div>
            </div>
          </div>

          {/* THE SUPERPOWERS (Kazanacaklarınız) - Flat typographic minimalist design */}
          <div className="pt-16 max-w-4xl mx-auto space-y-8">
            <p className="text-[10px] font-black text-stone-800 uppercase tracking-[0.4em]">
              bikaç tıkla kazanacaklarınız
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto px-4">
              {/* Pillar 1: App & Web */}
              <div className="bg-emerald-50/40 border border-emerald-100/70 rounded-lg p-5 hover:bg-emerald-50/80 transition-all shadow-sm shadow-emerald-100/20 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 text-xs font-black text-emerald-800 shrink-0">
                  <Lucide.Globe size={14} className="text-emerald-600" />
                  <span className="uppercase tracking-wider">teknoloji</span>
                </div>
                <div className="flex-1 flex items-center justify-center pt-3">
                  <p className="text-xs text-stone-600 font-medium leading-relaxed">
                    markanıza özel web sitesi, cepten kolay katalog yönetimi, mobil uygulama kurulumu ve toplu ürün yükleme
                  </p>
                </div>
              </div>

              {/* Pillar 2: Bikaç Tıkla Teknoloji */}
              <div className="bg-emerald-50/40 border border-emerald-100/70 rounded-lg p-5 hover:bg-emerald-50/80 transition-all shadow-sm shadow-emerald-100/20 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 text-xs font-black text-emerald-800 shrink-0">
                  <Lucide.Sparkles size={14} className="text-emerald-600" />
                  <span className="uppercase tracking-wider">reklam</span>
                </div>
                <div className="flex-1 flex items-center justify-center pt-3">
                  <p className="text-xs text-stone-600 font-medium leading-relaxed">
                    Yazılım bilmenize gerek yok; bikaç tıkla bütçenizi belirleyin, <span className="font-bold text-stone-900">Google reklamınızı biz verelim</span>, bölgenizdeki müşterilerin sizi ilk sırada görmesini sağlayalım.
                  </p>
                </div>
              </div>

              {/* Pillar 3: Hazır Tasarımlar */}
              <div className="bg-emerald-50/40 border border-emerald-100/70 rounded-lg p-5 hover:bg-emerald-50/80 transition-all shadow-sm shadow-emerald-100/20 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 text-xs font-black text-emerald-800 shrink-0">
                  <Lucide.Palette size={14} className="text-emerald-600" />
                  <span className="uppercase tracking-wider">tasarım</span>
                </div>
                <div className="flex-1 flex items-center justify-center pt-3">
                  <p className="text-xs text-stone-600 font-medium leading-relaxed">
                    Tasarımcı beklemeden hazır sosyal medya gönderilerinizi indirip paylaşın; QR masa kartı, kılıf ve kartvizit gibi tüm baskı ürünlerini markanıza özel tasarımlarımızla anında sipariş edin.
                  </p>
                </div>
              </div>
            </div>

            {/* SB7 Emotional Success Badges */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 px-4 !mt-3">
              <div className="flex items-center gap-2 bg-emerald-50/60 border border-emerald-100/80 rounded-lg py-1.5 px-4 text-xs font-bold text-emerald-800/90 shadow-sm shadow-emerald-100/30 hover:bg-emerald-100/40 transition-colors">
                <span>zaman</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50/60 border border-emerald-100/80 rounded-lg py-1.5 px-4 text-xs font-bold text-emerald-800/90 shadow-sm shadow-emerald-100/30 hover:bg-emerald-100/40 transition-colors">
                <span>tasarruf</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50/60 border border-emerald-100/80 rounded-lg py-1.5 px-4 text-xs font-bold text-emerald-800/90 shadow-sm shadow-emerald-100/30 hover:bg-emerald-100/40 transition-colors">
                <span>kolaylık</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50/60 border border-emerald-100/80 rounded-lg py-1.5 px-4 text-xs font-bold text-emerald-800/90 shadow-sm shadow-emerald-100/30 hover:bg-emerald-100/40 transition-colors">
                <span>satış</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="max-w-md mx-auto border-t border-stone-100 my-16" />

      {/* PRICING & TRUST SECTION - Clean Modernist Layout */}
      <section className="pb-16 px-4">
        <div className="text-center flex flex-col items-center animate-in fade-in duration-1000 delay-500">
          {/* Launch Special Price Subtitle */}
          <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-8">
            • lansmana özel • ilk 10 müşterimize özel (son 8 dükkan) •
          </p>

          <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 mt-4 max-w-2xl mx-auto w-full px-4">
            {/* Monthly Plan Card */}
            <div className="flex-1 min-w-[260px] bg-white border border-stone-100 rounded-3xl p-8 flex flex-col justify-between hover:border-stone-200 transition-all shadow-sm text-left">
              <div className="space-y-4">
                <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest block">
                  AYLIK ÖDEME
                </span>
                <div className="space-y-1">
                  <p className="text-5xl font-black text-stone-900 tracking-tighter leading-none">
                    ₺300
                    <span className="text-base font-bold text-stone-400 ml-2">/ ay</span>
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-stone-400 font-bold mt-8">
                Dilediğiniz zaman iptal edebilirsiniz.
              </p>
            </div>

            {/* Yearly Plan Card - Highly Recommended */}
            <div className="flex-1 min-w-[260px] bg-stone-950 text-white border-2 border-stone-950 rounded-3xl p-8 flex flex-col justify-between relative hover:scale-[1.01] transition-all shadow-xl shadow-stone-950/10 text-left">
              {/* Popular Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-emerald-500 text-[9px] font-black text-white uppercase tracking-widest rounded-full shadow-lg shadow-emerald-500/20 whitespace-nowrap">
                en popüler
              </div>

              <div className="space-y-4">
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block">
                  YILLIK ÖDEME
                </span>
                <div className="space-y-1">
                  <p className="text-5xl font-black text-white tracking-tighter leading-none">
                    ₺3.500
                    <span className="text-base font-bold text-stone-400 ml-2">/ yıl</span>
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-stone-400 font-bold mt-8">
                Yıllık ödemede kredi kartı gerekmez.
              </p>
            </div>
          </div>
          {/* Unified CTA Button */}
          <div className="mt-8 max-w-lg mx-auto w-full px-4">
            <Button
              {...({
                as: 'a',
                href: 'https://wa.me/905373420161?text=Merhaba,%2090%20günlük%20ücretsiz%20denememi%20başlatmak%20istiyorum.',
                target: '_blank',
                rel: 'noreferrer'
              } as any)}
              variant="primary"
              size="lg"
              className="hover:scale-[1.01] active:scale-[0.99] transition-transform shadow-xl shadow-stone-900/10 w-full text-center"
            >
              90 Gün Ücretsiz Deneyin • Fiyatı Sonra Düşünün
            </Button>
            {/* Trust Badge / Microcopy */}
            <p className="text-[9px] font-black text-stone-400 mt-4 uppercase tracking-[0.2em]">
              24 Saatte Teslim • Kurulum Bize Ait
            </p>
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
