import * as Lucide from 'lucide-react';

interface StudioKazanacaklarCarouselProps {
  activeSlide: number; // 0: Cover, 1: Teknoloji, 2: Reklam, 3: Tasarım, 4: Özet/Badges
  website: string;
  presetClass: string;
  glowColor: string;
  isLight: boolean;
  formatType: 'story' | 'post';
}

export default function StudioKazanacaklarCarousel({
  activeSlide,
  website,
  presetClass,
  glowColor,
  isLight,
  formatType,
}: StudioKazanacaklarCarouselProps) {
  // Common background glow
  const backgroundGlow = !isLight && (
    <>
      <div 
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none bg-[radial-gradient(circle,_var(--tw-gradient-stops))]"
        style={{ backgroundImage: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }}
      />
      <div 
        className="absolute bottom-0 left-0 w-[700px] h-[700px] rounded-full blur-[140px] pointer-events-none bg-[radial-gradient(circle,_var(--tw-gradient-stops))]"
        style={{ backgroundImage: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }}
      />
    </>
  );

  const headerLabel = (
    <div className="flex justify-between items-center relative z-10 w-full">
      <span className="text-xl font-bold tracking-[0.3em] text-emerald-500 uppercase">
        Kazanacaklarınız {formatType === 'story' ? '(Hikaye)' : '(Gönderi)'}
      </span>
      <span className="text-sm font-bold tracking-[0.1em] text-stone-500 uppercase">
        Slayt {activeSlide + 1} / 5
      </span>
    </div>
  );

  const footerLabel = (
    <div className="flex justify-between items-center relative z-10 w-full">
      <span className={`text-2xl font-black tracking-wide ${isLight ? 'text-stone-900' : 'text-stone-200'}`}>
        {website}
      </span>
      {activeSlide < 4 && (
        <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500 animate-pulse flex items-center gap-1">
          Kaydırın <Lucide.ArrowRight size={12} strokeWidth={3} />
        </span>
      )}
    </div>
  );

  // Render individual slides based on index
  const renderSlideContent = () => {
    switch (activeSlide) {
      case 0: // Cover
        return (
          <div className="flex-1 flex flex-col justify-center text-left gap-8 relative z-10">
            <span className="text-[20px] font-black tracking-[0.4em] text-emerald-500 uppercase">EKATALOG</span>
            <h1 className={`text-8xl font-black tracking-tighter leading-[1.05] ${isLight ? 'text-stone-900' : 'text-stone-100'}`}>
              ekatalog ile
              <br />
              Neler
              <br />
              <span className="text-emerald-500">Kazanacaksınız?</span>
            </h1>
            <p className={`text-3xl font-bold leading-relaxed max-w-2xl ${isLight ? 'text-stone-600' : 'text-stone-300'}`}>
              Toptancı esnafı için tasarlanmış dijital dönüşümün en kolay adımları.
            </p>
          </div>
        );

      case 1: // Teknoloji
        return (
          <div className="flex-1 flex flex-col justify-center text-left gap-10 relative z-10">
            <div className={`w-28 h-28 rounded-3xl flex items-center justify-center ${isLight ? 'bg-stone-200 border border-stone-300 text-stone-900' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
              <Lucide.Globe size={52} />
            </div>
            <div className="space-y-6">
              <span className="text-lg font-black uppercase tracking-[0.25em] text-emerald-500">01. TEKNOLOJİ</span>
              <h2 className={`text-6xl font-black tracking-tighter leading-tight ${isLight ? 'text-stone-900' : 'text-stone-100'}`}>
                Markanıza Özel Altyapı
              </h2>
              <p className={`text-3xl font-bold leading-relaxed ${isLight ? 'text-stone-600' : 'text-stone-300'}`}>
                Markanıza özel web sitesi, cepten kolay katalog yönetimi, mobil uygulama kurulumu ve toplu ürün yükleme kolaylığı.
              </p>
            </div>
          </div>
        );

      case 2: // Reklam
        return (
          <div className="flex-1 flex flex-col justify-center text-left gap-10 relative z-10">
            <div className={`w-28 h-28 rounded-3xl flex items-center justify-center ${isLight ? 'bg-stone-200 border border-stone-300 text-stone-900' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
              <Lucide.Sparkles size={52} />
            </div>
            <div className="space-y-6">
              <span className="text-lg font-black uppercase tracking-[0.25em] text-emerald-500">02. REKLAM</span>
              <h2 className={`text-6xl font-black tracking-tighter leading-tight ${isLight ? 'text-stone-900' : 'text-stone-100'}`}>
                Bölgesel Google Reklamı
              </h2>
              <p className={`text-3xl font-bold leading-relaxed ${isLight ? 'text-stone-600' : 'text-stone-300'}`}>
                Yazılım bilmenize gerek yok; bikaç tıkla bütçenizi belirleyin, Google reklamınızı biz verelim, bölgenizdeki müşterilerin sizi ilk sırada görmesini sağlayalım.
              </p>
            </div>
          </div>
        );

      case 3: // Tasarım
        return (
          <div className="flex-1 flex flex-col justify-center text-left gap-10 relative z-10">
            <div className={`w-28 h-28 rounded-3xl flex items-center justify-center ${isLight ? 'bg-stone-200 border border-stone-300 text-stone-900' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
              <Lucide.Palette size={52} />
            </div>
            <div className="space-y-6">
              <span className="text-lg font-black uppercase tracking-[0.25em] text-emerald-500">03. TASARIM</span>
              <h2 className={`text-6xl font-black tracking-tighter leading-tight ${isLight ? 'text-stone-900' : 'text-stone-100'}`}>
                Hazır Sosyal Medya & Baskı
              </h2>
              <p className={`text-3xl font-bold leading-relaxed ${isLight ? 'text-stone-600' : 'text-stone-300'}`}>
                Tasarımcı beklemeden hazır sosyal medya gönderilerinizi indirip paylaşın; QR masa kartı, kılıf ve kartvizit gibi tüm baskı ürünlerini markanıza özel tasarımlarla anında sipariş edin.
              </p>
            </div>
          </div>
        );

      case 4: // Özet / Badges
        return (
          <div className="flex-1 flex flex-col justify-center text-left gap-10 relative z-10">
            <div className="space-y-4">
              <span className="text-lg font-black uppercase tracking-[0.25em] text-emerald-500">ÖZETLE</span>
              <h2 className={`text-6xl font-black tracking-tighter leading-tight ${isLight ? 'text-stone-900' : 'text-stone-100'}`}>
                Dükkanınız İçin Değerler
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-6 w-full">
              {[
                { title: 'ZAMAN', desc: 'Hızlı katalog ve sipariş yönetimi.', icon: Lucide.Clock },
                { title: 'TASARRUF', desc: 'Tasarım ve yazılım maliyetlerine son.', icon: Lucide.TrendingDown },
                { title: 'KOLAYLIK', desc: 'Telefondan 2 tıkla kontrol paneli.', icon: Lucide.Zap },
                { title: 'SATIŞ', desc: 'Müşterileriniz doğrudan sipariş versin.', icon: Lucide.ShoppingBag },
              ].map((badge, index) => {
                const IconComp = badge.icon;
                return (
                  <div 
                    key={index}
                    className={`p-8 rounded-[2rem] border ${isLight ? 'bg-emerald-50/40 border-emerald-100/80' : 'bg-white/[0.02] border-white/[0.04]'} flex flex-col gap-3 justify-center text-left`}
                  >
                    <div className="flex items-center gap-3 text-emerald-500 font-black tracking-wider text-[17px]">
                      <IconComp size={24} strokeWidth={3} />
                      <span>{badge.title}</span>
                    </div>
                    <p className={`text-[17px] ${isLight ? 'text-stone-600' : 'text-stone-300'} font-bold leading-relaxed`}>
                      {badge.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`w-full h-full relative flex flex-col justify-between p-20 select-none overflow-hidden ${presetClass}`}
    >
      {backgroundGlow}
      {headerLabel}
      {renderSlideContent()}
      {footerLabel}
    </div>
  );
}
