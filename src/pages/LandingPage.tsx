import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Lucide from 'lucide-react';
import { THEME } from '../data/config';

const DOMAIN_EXTENSIONS = ['site', 'coffee', 'cafe', 'ltd', 'io'];

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

  useEffect(() => {
    document.title = "ekatalog";
    
    // Function to set the correct theme-aware favicon dynamically
    const updateFavicon = () => {
      const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Clean up any existing favicon links
      const links = document.querySelectorAll("link[rel*='icon']");
      links.forEach(l => l.remove());
      
      // Create new favicon link tag
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.type = 'image/svg+xml';
      newLink.href = isDark ? '/images/logo_dark.svg?v=4' : '/images/logo_lg.svg?v=4';
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

          <h1 className="text-7xl sm:text-8xl font-black text-stone-900 tracking-tighter leading-none animate-in slide-in-from-bottom-8 duration-700 relative z-10">
            ekatalog
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-stone-500 font-medium leading-relaxed relative z-10">
            sahada/ofiste <span className="font-black text-stone-900">kolaylık.</span>
          </p>

          <div className="pt-8 flex flex-col items-center justify-center relative z-20 space-y-4">
            {/* Premium Phone Frame Mockup */}
            <div className="relative w-[260px] h-[520px] sm:w-[300px] sm:h-[600px] bg-stone-950 rounded-[1.75rem] p-2 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.1)] border border-stone-850 ring-4 ring-stone-900/5">
              {/* Screen Container */}
              <div className="w-full h-full rounded-[1.25rem] overflow-hidden bg-stone-50 border border-stone-900 relative">
                <iframe
                  src="https://ornek.ekatalog.site"
                  className="w-[120%] h-[120%] border-none origin-top-left scale-[0.8333]"
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
                        Sadece eski PDF/Excel listenizi atın
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
              <div className="flex items-center gap-2 bg-stone-50/80 border border-stone-100/80 rounded-full py-1.5 px-4 text-xs font-bold text-stone-600 shadow-sm shadow-stone-100/50 hover:bg-stone-100/50 transition-colors">
                <span className="text-[10px] text-red-500 font-black">✕</span>
                <span>karmaşık pdf'ler</span>
              </div>
              <div className="flex items-center gap-2 bg-stone-50/80 border border-stone-100/80 rounded-full py-1.5 px-4 text-xs font-bold text-stone-600 shadow-sm shadow-stone-100/50 hover:bg-stone-100/50 transition-colors">
                <span className="text-[10px] text-red-500 font-black">✕</span>
                <span>karmaşık yönetim panelleri</span>
              </div>
              <div className="flex items-center gap-2 bg-stone-50/80 border border-stone-100/80 rounded-full py-1.5 px-4 text-xs font-bold text-stone-600 shadow-sm shadow-stone-100/50 hover:bg-stone-100/50 transition-colors">
                <span className="text-[10px] text-red-500 font-black">✕</span>
                <span>tasarımcı beklemek</span>
              </div>
              <div className="flex items-center gap-2 bg-stone-50/80 border border-stone-100/80 rounded-full py-1.5 px-4 text-xs font-bold text-stone-600 shadow-sm shadow-stone-100/50 hover:bg-stone-100/50 transition-colors">
                <span className="text-[10px] text-red-500 font-black">✕</span>
                <span>müşteri bekletmek</span>
              </div>
              <div className="flex items-center gap-2 bg-stone-50/80 border border-stone-100/80 rounded-full py-1.5 px-4 text-xs font-bold text-stone-600 shadow-sm shadow-stone-100/50 hover:bg-stone-100/50 transition-colors">
                <span className="text-[10px] text-red-500 font-black">✕</span>
                <span>websiteye eleman tutmak</span>
              </div>
              <div className="flex items-center gap-2 bg-stone-50/80 border border-stone-100/80 rounded-full py-1.5 px-4 text-xs font-bold text-stone-600 shadow-sm shadow-stone-100/50 hover:bg-stone-100/50 transition-colors">
                <span className="text-[10px] text-red-500 font-black">✕</span>
                <span>yazılımcı beklemek</span>
              </div>
              <div className="flex items-center gap-2 bg-stone-50/80 border border-stone-100/80 rounded-full py-1.5 px-4 text-xs font-bold text-stone-600 shadow-sm shadow-stone-100/50 hover:bg-stone-100/50 transition-colors">
                <span className="text-[10px] text-red-500 font-black">✕</span>
                <span>gönderilen pdf'i güncelleyememek</span>
              </div>
              <div className="flex items-center gap-2 bg-stone-50/80 border border-stone-100/80 rounded-full py-1.5 px-4 text-xs font-bold text-stone-600 shadow-sm shadow-stone-100/50 hover:bg-stone-100/50 transition-colors">
                <span className="text-[10px] text-red-500 font-black">✕</span>
                <span>stokta olmayan ürüne sipariş almak</span>
              </div>
              <div className="flex items-center gap-2 bg-stone-50/80 border border-stone-100/80 rounded-full py-1.5 px-4 text-xs font-bold text-stone-600 shadow-sm shadow-stone-100/50 hover:bg-stone-100/50 transition-colors">
                <span className="text-[10px] text-red-500 font-black">✕</span>
                <span>müşteriyle fiyat sorunuz sürtüşmesi</span>
              </div>
              <div className="flex items-center gap-2 bg-stone-50/80 border border-stone-100/80 rounded-full py-1.5 px-4 text-xs font-bold text-stone-600 shadow-sm shadow-stone-100/50 hover:bg-stone-100/50 transition-colors">
                <span className="text-[10px] text-red-500 font-black">✕</span>
                <span>hantal süreçlerle rakibe müşteri kaptırmak</span>
              </div>
              <div className="flex items-center gap-2 bg-stone-50/80 border border-stone-100/80 rounded-full py-1.5 px-4 text-xs font-bold text-stone-600 shadow-sm shadow-stone-100/50 hover:bg-stone-100/50 transition-colors">
                <span className="text-[10px] text-red-500 font-black">✕</span>
                <span>mesai dışında fiyat verememek</span>
              </div>
            </div>
          </div>

          {/* THE SUPERPOWERS (Kazanacaklarınız) - Flat typographic minimalist design */}
          <div className="pt-16 max-w-4xl mx-auto space-y-8">
            <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.4em]">
              kazanacaklarınız
            </p>
            <div className="grid grid-cols-1 gap-y-6 max-w-xl mx-auto text-left px-4">
              {/* Pillar 1: Web Sitesi */}
              <div className="flex gap-3 items-start">
                <Lucide.Globe size={16} className="text-stone-900 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-stone-900 tracking-tight">kendi website adresiniz</h3>
                  <p className="text-xs text-stone-500 font-medium leading-relaxed">www.firmaniz.com veya markaniz.ekatalog.site ile 7/24 yayında prestijli bir ekatalog.</p>
                </div>
              </div>

              {/* Pillar 2: Yönetim Paneli */}
              <div className="flex gap-3 items-start">
                <Lucide.Smartphone size={16} className="text-stone-900 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-stone-900 tracking-tight">kolayca telefondan düzenle</h3>
                  <p className="text-xs text-stone-500 font-medium leading-relaxed">Doğrudan ürün fiyatlarına dokunarak anında güncelleyin.</p>
                </div>
              </div>

              {/* Pillar 3: Ana Ekranda Logonuz */}
              <div className="flex gap-3 items-start">
                <Lucide.LayoutGrid size={16} className="text-stone-900 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-stone-900 tracking-tight">Hem webadresi hem mobil uygulama</h3>
                  <p className="text-xs text-stone-500 font-medium leading-relaxed">Telefonunlara tek tıkla mobil uygulama olarak kurulabilir.</p>
                </div>
              </div>

              {/* Pillar 4: Özel İndirim & Fiyat */}
              <div className="flex gap-3 items-start">
                <Lucide.Percent size={16} className="text-stone-900 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-stone-900 tracking-tight">müşteriye özel geçici fiyat tanımlama</h3>
                  <p className="text-xs text-stone-500 font-medium leading-relaxed">Dilediğiniz müşteriye özel indirim kuponlarıyla özel fiyatlar tanımlayın.</p>
                </div>
              </div>

              {/* Pillar 5: Döviz Çevirici */}
              <div className="flex gap-3 items-start">
                <Lucide.Coins size={16} className="text-stone-900 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-stone-900 tracking-tight">döviz çevirici</h3>
                  <p className="text-xs text-stone-500 font-medium leading-relaxed">Müşterileriniz dükkanınızdaki tüm fiyatları TL, USD veya EUR cinsine tek tıkla çevirsin.</p>
                </div>
              </div>

              {/* Pillar 6: Telefon Kilidi Gibi Giriş */}
              <div className="flex gap-3 items-start">
                <Lucide.Lock size={16} className="text-stone-900 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-stone-900 tracking-tight">ekatalog PIN Kodunuz</h3>
                  <p className="text-xs text-stone-500 font-medium leading-relaxed">Uzunca şifre yazma derdi olmadan, 4 haneli PIN kodu ile dükkanınıza güvenli ve hızlı erişin.</p>
                </div>
              </div>

              {/* Pillar 7: Portföy Genişletici */}
              <div className="flex gap-3 items-start">
                <Lucide.Compass size={16} className="text-stone-900 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-stone-900 tracking-tight">portfoys.pro ile işbirliğimiz</h3>
                  <p className="text-xs text-stone-500 font-medium leading-relaxed">Yurtiçi/yurtdışı herhangi bir ilçedeki tüm toptancıların/çiçekçilerin/kafelerin (veya istediğiniz herhangi bir sektörün) kurumsal iletişim bilgilerine ulaşın.</p>
                </div>
              </div>

              {/* Pillar 8: Sosyal Medya Gönderi Tasarımı */}
              <div className="flex gap-3 items-start">
                <Lucide.Image size={16} className="text-stone-900 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-stone-900 tracking-tight">sosyal medya içerik tasarımı</h3>
                  <p className="text-xs text-stone-500 font-medium leading-relaxed">Ürünlerinizi tek tıkla Instagram ve WhatsApp için hazır reklam görsellerine dönüştürün.</p>
                </div>
              </div>

              {/* Pillar 9: Toplu Fiyat Güncelleme */}
              <div className="flex gap-3 items-start">
                <Lucide.TrendingUp size={16} className="text-stone-900 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-stone-900 tracking-tight">toplu güncelleme</h3>
                  <p className="text-xs text-stone-500 font-medium leading-relaxed">Tüm dükkandaki fiyatları ister yüzde ister tutar bazlı tek tıkla toplu güncelleyin ve benzeri toplu işlemlerle zaman kazanın.</p>
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
                ₺199
                <span className="text-lg font-bold opacity-30 ml-2">
                  / ay
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-stone-100 pt-8 flex items-center justify-between gap-4 px-6 pb-8 max-w-3xl mx-auto w-full">
        <div className="flex items-center select-none">
          <img src="/images/logo_lg.svg?v=4" alt="ekatalog" className="w-6 h-6" />
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
