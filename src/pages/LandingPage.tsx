import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Lucide from 'lucide-react';
import Button from '../components/ui/Button';
import { THEME } from '../data/config';
import { useResponsiveShadow } from '../hooks/useCommon';

const DOMAIN_EXTENSIONS = ['site', 'shop', 'co', 'cafe', 'me'];

export default function LandingPage() {
  const [domainIndex, setDomainIndex] = useState(0);

  // Diamond Shadow Engine: Now powered by a reusable Hook! 🚀
  const shadowOffset = useResponsiveShadow(30, 15);

  useEffect(() => {
    const domainInterval = setInterval(() => {
      setDomainIndex((prev) => (prev + 1) % DOMAIN_EXTENSIONS.length);
    }, 1000);

    return () => {
      clearInterval(domainInterval);
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
          domain <span className="font-black opacity-100 ml-1">hediye!</span>{' '}
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

      <section className="pt-12 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-5xl font-black text-stone-900 tracking-tighter leading-[0.85] animate-in slide-in-from-bottom-8 duration-700">
            sade. basit.
            <br />
            ekatalog.
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-stone-500 font-medium leading-relaxed">
            değişen fiyatların angaryasına son.
          </p>

          <div className="flex justify-center pt-2">
            <Button
              variant="primary"
              mode="rectangle"
              size="lg"
              className="group !rounded-full !px-8 !py-4"
            >
              <span className="font-black tracking-tight text-xl">
                ekatalogunu kur
              </span>
              <Lucide.ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="pt-4 flex justify-center relative">
            <div className="max-w-[280px] rounded-2xl overflow-hidden shadow-2xl border-4 border-green-600 bg-white ring-8 ring-green-600/5 relative">
              <img
                src="/images/catalog_preview.png"
                alt="E-Katalog Önizleme"
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* THE ROADMAP - Transparent Backdrop Panel */}
          <div className="pt-12 max-w-3xl mx-auto flex flex-col items-center">
            <p className="text-[11px] font-black text-stone-400 uppercase tracking-[0.3em] mb-4">
              plan
            </p>
            <div className="w-full grid grid-cols-3 gap-3 bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-stone-100 shadow-xl shadow-stone-200/50">
              <div className="flex flex-col items-center p-2">
                <div className="w-11 h-11 bg-stone-900 rounded-2xl flex items-center justify-center text-white text-base font-black shadow-md">
                  1
                </div>
                <h3 className="text-sm sm:text-base font-black tracking-tight text-stone-900 mt-3 text-center">
                  Excel / PDF Atın
                </h3>
              </div>
              <div className="flex flex-col items-center p-2">
                <div className="w-11 h-11 bg-stone-900 rounded-2xl flex items-center justify-center text-white text-base font-black shadow-md">
                  2
                </div>
                <h3 className="text-sm sm:text-base font-black tracking-tight text-stone-900 mt-3 text-center">
                  Biz Kuralım
                </h3>
              </div>
              <div className="flex flex-col items-center p-2">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/20"
                  style={{ backgroundColor: THEME.colors.marketing.primary }}
                >
                  <div className="w-5 h-5">{THEME.icons.check}</div>
                </div>
                <h3 className="text-sm sm:text-base font-black tracking-tight text-stone-900 mt-3 text-center">
                  Kolayca Yönetin
                </h3>
              </div>
            </div>
          </div>

          {/* PRICING & TRUST SECTION */}
          <div className="text-center flex flex-col items-center pt-36">
            <div className="w-fit flex flex-col items-center relative">
              {/* CAMPAIGN CHIPS - Completely Static */}
              <div
                className="absolute -top-8 -left-1 text-white text-[9px] font-black px-3 py-1 rounded-lg -rotate-2 shadow-xl whitespace-nowrap z-40"
                style={{ backgroundColor: THEME.colors.marketing.primary }}
              >
                1 AY DENEME SÜRESİ BİZDEN 🎁
              </div>

              <div
                className="absolute -top-14 -left-14 text-white text-[9px] font-black px-3 py-1 rounded-lg -rotate-12 shadow-xl whitespace-nowrap z-30"
                style={{ backgroundColor: THEME.colors.marketing.secondary }}
              >
                LANSMANA ÖZEL %60 İNDİRİM 🏷️
              </div>

              <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.3em] line-through mb-1">
                ₺499 / AY
              </p>
              <p className="text-7xl font-black text-stone-900 tracking-tighter leading-none pr-1">
                ₺199
                <span className="text-xl font-bold opacity-30 ml-2">
                  &nbsp;/&nbsp;ay&nbsp;
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="pb-20 px-4 -mt-6">
        <div
          className="max-w-2xl mx-auto rounded-[2.5rem] pt-8 pb-10 px-6 text-center space-y-8 shadow-3xl relative overflow-hidden w-full"
          style={{ backgroundColor: THEME.colors.marketing.brand }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent"></div>
          <div className="space-y-2 relative z-10 w-full text-center">
            <h2 className="text-4xl font-black text-white tracking-tighter leading-none">
              Şimdi Ürünlerinizi Gönderin
            </h2>
            <p className="text-sm font-black text-emerald-400 uppercase tracking-[0.25em]">
              ÜCRETSİZ BAŞLAYIN
            </p>
          </div>
          <div className="relative z-20 flex justify-center w-full">
            <a
              href="https://wa.me/905373420161"
              target="_blank"
              rel="noreferrer"
            >
              <motion.div
                animate={{
                  boxShadow: `${shadowOffset.x}px ${shadowOffset.y}px 40px rgba(37, 211, 102, 0.4)`,
                }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.8 }}
                className="rounded-full"
              >
                <Button
                  variant="primary"
                  mode="rectangle"
                  size="lg"
                  className="!text-white flex items-center justify-center transition-all active:scale-95 group border-none !p-8 !rounded-full"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <div className="w-12 h-12 fill-white drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {THEME.icons.whatsapp}
                  </div>
                </Button>
              </motion.div>
            </a>
          </div>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] relative z-10 w-full text-center">
            Taahhüt yok, cayma bedeli yok.
          </p>
        </div>

        {/* SECONDARY CONTACT (Direct Line for Trust) */}
        <div className="mt-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-700">
          <a
            href="tel:905373420161"
            className="bg-stone-900 rounded-3xl px-8 py-4 flex items-center gap-4 group hover:bg-stone-800 hover:shadow-2xl transition-all cursor-pointer"
          >
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
              <div className="w-5 h-5">
                <svg
                  className="w-full h-full fill-none stroke-current stroke-2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <p className="text-xl font-black text-white tracking-tighter transition-colors group-hover:text-stone-300">
              +90 537 342 01 61
            </p>
          </a>
        </div>
      </section>

      <footer className="text-center border-t border-stone-100 pt-10 flex flex-col items-center gap-4 px-4 pb-4">
        <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.5em]">
          ekatalog.site © 2026 — <span className="text-red-600">#</span>
          MİLLİTEKNOLOJİHAMLESİ
        </p>
      </footer>
    </div>
  );
}
