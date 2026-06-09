import * as Lucide from 'lucide-react';

interface StudioTelefondanDuzenleProps {
  title: string;
  desc: string;
  productName: string;
  oldPrice: string;
  newPrice: string;
  website: string;
  presetClass: string;
  glowColor: string;
  isLight: boolean;
  formatType: 'story' | 'post';
}

export default function StudioTelefondanDuzenle({
  title,
  desc,
  productName,
  oldPrice,
  newPrice,
  website,
  presetClass,
  glowColor,
  isLight,
  formatType,
}: StudioTelefondanDuzenleProps) {
  const isPost = formatType === 'post';

  return (
    <div
      className={`w-full h-full relative flex flex-col justify-between select-none overflow-hidden ${
        isPost ? 'p-16' : 'p-20'
      } ${presetClass}`}
    >
      {/* Background Glow (Dark Mode Only) */}
      {!isLight && (
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
      )}

      {/* Top Header Label */}
      <div className="flex justify-between items-center relative z-10">
        <span className="text-xl font-bold tracking-[0.3em] text-stone-500 uppercase">TELEFONDAN DÜZENLE</span>
        <span className="text-sm font-bold tracking-[0.1em] text-stone-500 uppercase">
          {formatType === 'story' ? 'Instagram Hikaye' : 'Instagram Gönderi'}
        </span>
      </div>

      {/* Main Interactive Mockup Area */}
      <div className={`relative z-10 flex-1 flex flex-col justify-center ${isPost ? 'gap-6 my-4' : 'gap-10 my-6'}`}>
        
        {/* Device/Interface Container */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[560px] relative">
            
            {/* Phone Frame Glass Card */}
            <div
              className={`rounded-[2.5rem] border shadow-2xl p-6 relative overflow-hidden backdrop-blur-md ${
                isLight
                  ? 'bg-stone-100/80 border-stone-200/60 shadow-stone-200/50'
                  : 'bg-stone-900/40 border-white/[0.06] shadow-black/40'
              }`}
            >
              {/* Device Header Bar */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-500/10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className={`text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                    Yönetici Modu
                  </span>
                </div>
                <Lucide.Smartphone size={14} className={isLight ? 'text-stone-500' : 'text-stone-400'} />
              </div>

              {/* Product Card Inside Phone */}
              <div
                className={`p-5 rounded-[1.75rem] border ${
                  isLight ? 'bg-white border-stone-200/50' : 'bg-white/[0.02] border-white/[0.04]'
                } flex gap-4 items-center`}
              >
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                    isLight ? 'bg-stone-100 text-stone-900' : 'bg-white/[0.04] text-stone-200'
                  }`}
                >
                  <Lucide.Utensils size={28} />
                </div>
                <div className="flex-1 space-y-1 text-left">
                  <h4 className={`text-xl font-black ${isLight ? 'text-stone-950' : 'text-stone-100'}`}>
                    {productName}
                  </h4>
                  <p className={`text-xs ${isLight ? 'text-stone-500' : 'text-stone-400'} font-medium`}>
                    Dokun ve saniyeler içinde fiyatını güncelle
                  </p>
                </div>
                
                {/* Price Display */}
                <div className="text-right shrink-0">
                  <span className="text-xs line-through text-red-500/80 block font-bold">
                    {oldPrice}
                  </span>
                  <span className="text-2xl font-black text-emerald-500 block">
                    {newPrice}
                  </span>
                </div>
              </div>

              {/* Floating Quick Edit Mini Modal overlay */}
              <div
                className={`mt-4 p-5 rounded-[1.75rem] border ${
                  isLight
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-emerald-500/[0.02] border-emerald-500/10'
                } space-y-4`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                    <Lucide.Edit3 size={12} /> Hızlı Fiyat Güncelleme
                  </span>
                  
                  {/* Fingerprint / Check overlay */}
                  <span className="text-[10px] font-black tracking-widest text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                    <Lucide.Check size={10} strokeWidth={3} /> Kaydedildi
                  </span>
                </div>

                <div className="flex gap-3 items-center">
                  {/* Dynamic Edit Field Box */}
                  <div className="flex-1 relative">
                    <div
                      className={`w-full py-3.5 px-4 rounded-xl text-lg font-black text-left border flex items-center justify-between ${
                        isLight
                          ? 'bg-white border-stone-200 text-stone-900'
                          : 'bg-stone-950 border-stone-850 text-stone-100'
                      }`}
                    >
                      <span>{newPrice}</span>
                      <span className="w-0.5 h-6 bg-emerald-500 animate-pulse rounded" />
                    </div>
                  </div>

                  {/* Tamam Button with Fingerprint animation style */}
                  <div className="relative">
                    <button
                      className="px-6 py-4 bg-emerald-500 text-stone-950 text-xs font-black uppercase tracking-widest rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform duration-200"
                    >
                      <Lucide.Fingerprint size={16} className="animate-pulse" />
                      <span>TAMAM</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Glowing Pointer Finger Indicator representing User Interaction */}
            <div className="absolute right-10 bottom-6 z-20 pointer-events-none animate-bounce">
              <div className="relative">
                {/* Ping rings */}
                <span className="absolute -top-3 -left-3 flex h-9 w-9">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-9 w-9 bg-emerald-500/20"></span>
                </span>
                
                {/* Pointer hand SVG */}
                <svg
                  className="w-12 h-12 text-emerald-400 drop-shadow-[0_4px_12px_rgba(16,185,129,0.5)] fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12.9 8.28a1.2 1.2 0 0 0-.58-.15c-.24 0-.48.06-.68.18l-3 1.8a1.2 1.2 0 0 0-.54.8c-.06.27-.04.56.08.81l1.8 3.6c.16.32.44.57.78.69l3.52 1.17c.26.09.54.09.8 0l2.5-1a1.2 1.2 0 0 0 .76-1.1v-3.77c0-.42-.22-.81-.58-1.02l-4.66-2.72zm5.3 6.94a2.2 2.2 0 0 1-1.39 2.01l-2.5 1c-.48.16-.99.16-1.47 0l-3.52-1.17a2.2 2.2 0 0 1-1.42-1.26l-1.8-3.6a2.2 2.2 0 0 1-.14-1.48 2.2 2.2 0 0 1 .99-1.46l3-1.8c.37-.22.8-.33 1.23-.33c.42 0 .84.1 1.21.3l4.66 2.73a2.2 2.2 0 0 1 1.07 1.87v3.77c.01.27-.06.53-.17.77zM11 2a1 1 0 0 1 1 1v2.5a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zm6 2a1 1 0 0 1 .71.29l1.77 1.77a1 1 0 1 1-1.42 1.42l-1.77-1.77A1 1 0 0 1 17 4zm-12 0a1 1 0 0 1 .71.29l1.77 1.77a1 1 0 1 1-1.42 1.42L4.29 5.71A1 1 0 0 1 5 4z" />
                </svg>
              </div>
            </div>

          </div>
        </div>

        {/* Feature Copy */}
        <div className={`space-y-3 px-2 text-left ${isPost ? 'max-w-[560px] mx-auto' : ''}`}>
          <h2
            className={`font-black tracking-tighter leading-tight ${isLight ? 'text-stone-900' : 'text-stone-100'} ${
              isPost ? 'text-4xl' : 'text-5xl'
            }`}
          >
            {title}
          </h2>
          <p
            className={`font-medium leading-relaxed ${isLight ? 'text-stone-500' : 'text-stone-400'} ${
              isPost ? 'text-lg' : 'text-2xl'
            }`}
          >
            {desc}
          </p>
        </div>

      </div>

      {/* Footer website address */}
      <div className="flex justify-center items-center relative z-10">
        <span className={`text-2xl font-black tracking-wide ${isLight ? 'text-stone-900' : 'text-stone-200'}`}>
          {website}
        </span>
      </div>
    </div>
  );
}
