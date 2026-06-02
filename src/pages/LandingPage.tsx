import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Lucide from 'lucide-react';
import Button from '../components/ui/Button';
import { THEME } from '../data/config';

const DOMAIN_EXTENSIONS = ['site', 'coffee', 'kafe', 'ltd'];

export default function LandingPage() {
  const [domainIndex, setDomainIndex] = useState(0);

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
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-7xl sm:text-8xl font-black text-stone-900 tracking-tighter leading-none animate-in slide-in-from-bottom-8 duration-700">
            ekatalog
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-stone-500 font-medium leading-relaxed">
            sahada/ofiste <span className="font-black text-stone-900">kolaylık.</span>
          </p>

          <div className="pt-8 flex flex-col items-center justify-center relative z-20">
            {/* Premium Phone Frame Mockup */}
            <div className="relative w-[300px] h-[600px] bg-stone-950 rounded-[1.75rem] p-2 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.1)] border border-stone-850 ring-4 ring-stone-900/5">
              {/* Screen Container */}
              <div className="w-full h-full rounded-[1.25rem] overflow-hidden bg-stone-50 border border-stone-900 relative">
                <iframe
                  src="https://ornek.ekatalog.site"
                  className="w-[120%] h-[120%] border-none origin-top-left scale-[0.8333]"
                  title="E-Katalog Canlı Demo"
                />
              </div>
            </div>
          </div>

          {/* AVOID LOSS (STAKES) - Modernist Minimalist (Kurtulacaklarınız) */}
          <div className="pt-16 max-w-3xl mx-auto text-center space-y-4 relative z-10">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.4em]">
                kurtulacaklarınız
              </p>
              <p className="text-sm font-medium text-stone-500 max-w-md mx-auto">
                Zamanınızı, paranızı ve sabrınızı tüketen tüm o eski usul dertlere veda edin:
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 px-4 pt-2">
              <div className="flex items-center gap-2 bg-stone-50/80 border border-stone-100/80 rounded-full py-1.5 px-4 text-xs font-bold text-stone-600 shadow-sm shadow-stone-100/50 hover:bg-stone-100/50 transition-colors">
                <span className="text-[10px] text-red-500 font-black">✕</span>
                <span>matbaa masrafı</span>
              </div>
              <div className="flex items-center gap-2 bg-stone-50/80 border border-stone-100/80 rounded-full py-1.5 px-4 text-xs font-bold text-stone-600 shadow-sm shadow-stone-100/50 hover:bg-stone-100/50 transition-colors">
                <span className="text-[10px] text-red-500 font-black">✕</span>
                <span>fiyat okuma angaryası</span>
              </div>
              <div className="flex items-center gap-2 bg-stone-50/80 border border-stone-100/80 rounded-full py-1.5 px-4 text-xs font-bold text-stone-600 shadow-sm shadow-stone-100/50 hover:bg-stone-100/50 transition-colors">
                <span className="text-[10px] text-red-500 font-black">✕</span>
                <span>eski fiyattan zarar etmek</span>
              </div>
              <div className="flex items-center gap-2 bg-stone-50/80 border border-stone-100/80 rounded-full py-1.5 px-4 text-xs font-bold text-stone-600 shadow-sm shadow-stone-100/50 hover:bg-stone-100/50 transition-colors">
                <span className="text-[10px] text-red-500 font-black">✕</span>
                <span>telefonla fiyat sorma</span>
              </div>
              <div className="flex items-center gap-2 bg-stone-50/80 border border-stone-100/80 rounded-full py-1.5 px-4 text-xs font-bold text-stone-600 shadow-sm shadow-stone-100/50 hover:bg-stone-100/50 transition-colors">
                <span className="text-[10px] text-red-500 font-black">✕</span>
                <span>karmaşık pdf'ler</span>
              </div>
              <div className="flex items-center gap-2 bg-stone-50/80 border border-stone-100/80 rounded-full py-1.5 px-4 text-xs font-bold text-stone-600 shadow-sm shadow-stone-100/50 hover:bg-stone-100/50 transition-colors">
                <span className="text-[10px] text-red-500 font-black">✕</span>
                <span>karmaşık yönetim panelleri</span>
              </div>
            </div>
          </div>

          {/* THE SUPERPOWERS (Kazanacaklarınız) - Flat typographic minimalist design */}
          <div className="pt-16 max-w-4xl mx-auto space-y-8">
            <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.4em]">
              kazanacaklarınız
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 text-left px-4">
              {/* Pillar 1: Web Sitesi */}
              <div className="flex items-center gap-2 py-0.5">
                <Lucide.Globe size={15} className="text-stone-900 shrink-0" />
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-stone-900 tracking-tight lowercase">
                    adres
                  </span>
                  <span className="text-stone-400 font-medium select-none text-[10px]">—</span>
                  <span className="text-xs text-stone-500 font-bold lowercase">
                    7/24 yayında dükkan
                  </span>
                </div>
              </div>

              {/* Pillar 2: Yönetim Paneli */}
              <div className="flex items-center gap-2 py-0.5">
                <Lucide.Smartphone size={15} className="text-stone-900 shrink-0" />
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-stone-900 tracking-tight lowercase">
                    düzenleme
                  </span>
                  <span className="text-stone-400 font-medium select-none text-[10px]">—</span>
                  <span className="text-xs text-stone-500 font-bold lowercase">
                    cepten anında güncelleme
                  </span>
                </div>
              </div>

              {/* Pillar 3: Ana Ekranda Logonuz */}
              <div className="flex items-center gap-2 py-0.5">
                <Lucide.LayoutGrid size={15} className="text-stone-900 shrink-0" />
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-stone-900 tracking-tight lowercase">
                    kısayol
                  </span>
                  <span className="text-stone-400 font-medium select-none text-[10px]">—</span>
                  <span className="text-xs text-stone-500 font-bold lowercase">
                    telefona uygulama gibi
                  </span>
                </div>
              </div>

              {/* Pillar 4: Özel İndirim & Fiyat */}
              <div className="flex items-center gap-2 py-0.5">
                <Lucide.Percent size={15} className="text-stone-900 shrink-0" />
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-stone-900 tracking-tight lowercase">
                    indirim
                  </span>
                  <span className="text-stone-400 font-medium select-none text-[10px]">—</span>
                  <span className="text-xs text-stone-500 font-bold lowercase">
                    müşteriye özel kupon
                  </span>
                </div>
              </div>

              {/* Pillar 5: Döviz Çevirici */}
              <div className="flex items-center gap-2 py-0.5">
                <Lucide.Coins size={15} className="text-stone-900 shrink-0" />
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-stone-900 tracking-tight lowercase">
                    döviz
                  </span>
                  <span className="text-stone-400 font-medium select-none text-[10px]">—</span>
                  <span className="text-xs text-stone-500 font-bold lowercase">
                    anlık kur çevirisi
                  </span>
                </div>
              </div>

              {/* Pillar 6: Telefon Kilidi Gibi Giriş */}
              <div className="flex items-center gap-2 py-0.5">
                <Lucide.Lock size={15} className="text-stone-900 shrink-0" />
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-stone-900 tracking-tight lowercase">
                    giriş
                  </span>
                  <span className="text-stone-400 font-medium select-none text-[10px]">—</span>
                  <span className="text-xs text-stone-500 font-bold lowercase">
                    4 haneli PIN
                  </span>
                </div>
              </div>

              {/* Pillar 7: Portföy Genişletici */}
              <div className="flex items-center gap-2 py-0.5">
                <Lucide.Compass size={15} className="text-stone-900 shrink-0" />
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-stone-900 tracking-tight lowercase">
                    portföy
                  </span>
                  <span className="text-stone-400 font-medium select-none text-[10px]">—</span>
                  <span className="text-xs text-stone-500 font-bold lowercase">
                    alıcı esnaf bulma
                  </span>
                </div>
              </div>

              {/* Pillar 8: Sosyal Medya Gönderi Tasarımı */}
              <div className="flex items-center gap-2 py-0.5">
                <Lucide.Image size={15} className="text-stone-900 shrink-0" />
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-stone-900 tracking-tight lowercase">
                    tasarım
                  </span>
                  <span className="text-stone-400 font-medium select-none text-[10px]">—</span>
                  <span className="text-xs text-stone-500 font-bold lowercase">
                    sosyal medya afişi
                  </span>
                </div>
              </div>

              {/* Pillar 9: Toplu Fiyat Güncelleme */}
              <div className="flex items-center gap-2 py-0.5">
                <Lucide.TrendingUp size={15} className="text-stone-900 shrink-0" />
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-stone-900 tracking-tight lowercase">
                    fiyat
                  </span>
                  <span className="text-stone-400 font-medium select-none text-[10px]">—</span>
                  <span className="text-xs text-stone-500 font-bold lowercase">
                    yüzde/tutar toplu güncelleme
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* PRICING & TRUST SECTION - Clean Modernist Layout */}
          <div className="text-center flex flex-col items-center pt-20">
            <div className="flex flex-col items-center space-y-2">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.3em] line-through">
                  ₺499 / AY
                </p>
                <p className="text-7xl font-black text-stone-900 tracking-tighter leading-none pr-1">
                  ₺199
                  <span className="text-lg font-bold opacity-30 ml-2">
                    / ay
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="pb-10 px-4 -mt-6">
        <div
          className="max-w-2xl mx-auto rounded-[2.5rem] p-8 sm:p-10 shadow-3xl relative overflow-hidden w-full"
          style={{ backgroundColor: THEME.colors.marketing.brand }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8 text-center sm:text-left">
            {/* Left Side: Squircle App Icon Button */}
            <div className="shrink-0">
              <a
                href="https://wa.me/905373420161"
                target="_blank"
                rel="noreferrer"
                className="block hover:scale-105 active:scale-95 transition-transform duration-200"
              >
                <Button
                  variant="primary"
                  mode="rectangle"
                  size="lg"
                  className="!text-white flex items-center justify-center group border-none !p-8 !rounded-[1.75rem] !shadow-none"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <div className="w-12 h-12 fill-white drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {THEME.icons.whatsapp}
                  </div>
                </Button>
              </a>
            </div>

            {/* Right Side: Text Copy */}
            <div className="flex-1 space-y-2">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter leading-tight">
                Sadece eski PDF/Excel listenizi atın
              </h2>
              <p className="text-sm font-black text-emerald-400 uppercase tracking-[0.25em]">
                ÜCRETSİZ KURALIM
              </p>
            </div>
          </div>
        </div>

        {/* Footer outside the card */}
        <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em] text-center mt-4">
          Taahhüt yok, cayma bedeli yok.
        </p>

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
