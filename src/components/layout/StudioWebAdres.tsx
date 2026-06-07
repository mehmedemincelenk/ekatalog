interface StudioWebAdresProps {
  title: string;
  desc: string;
  website: string;
  presetClass: string;
  glowColor: string;
  isLight: boolean;
  formatType: 'story' | 'post';
}

export default function StudioWebAdres({
  title,
  desc,
  website,
  presetClass,
  glowColor,
  isLight,
  formatType,
}: StudioWebAdresProps) {
  // Next Sosyal style signature chat bubble colors (Indigo-violet gradient)
  const bubbleBg = isLight 
    ? 'bg-gradient-to-tr from-indigo-500 to-blue-500 text-white shadow-lg border border-indigo-400/20' 
    : 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white border border-indigo-500/30 shadow-2xl shadow-indigo-950/20';

  return (
    <div
      className={`w-full h-full relative flex flex-col justify-between p-24 select-none overflow-hidden ${presetClass}`}
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
        <span className="text-xl font-bold tracking-[0.3em] text-stone-500 uppercase">Kazanacaklarınız</span>
        <span className="text-sm font-bold tracking-[0.1em] text-stone-500 uppercase">
          {formatType === 'story' ? 'Instagram Hikaye' : 'Instagram Gönderi'}
        </span>
      </div>

      {/* Center Layout: Mockup and Copy */}
      <div className="relative z-10 flex-1 flex flex-col justify-center gap-16 my-6">
        
        {/* Next Sosyal Custom Direct Message Bubble Mockup */}
        <div className="w-full flex justify-center py-4">
          <div className={`w-full max-w-[540px] rounded-[2rem] rounded-br-[0.5rem] p-8 space-y-4 relative ${bubbleBg}`}>
            
            {/* Direct Message text */}
            <p className="text-2xl font-semibold leading-relaxed tracking-tight">
              abi sadece buna tıkla, ürünlerimizin hepsine ulaşabilirsin:
            </p>
            
            {/* Inline blue website link */}
            <p className="text-2xl font-black text-sky-200 hover:text-sky-100 underline break-all block">
              {website}
            </p>

            {/* Micro badge indicator (Delivered/Sent) */}
            <div className="flex justify-end items-center opacity-70">
              <span className="text-[10px] font-black tracking-widest uppercase text-indigo-200">GÖNDERİLDİ</span>
            </div>
          </div>
        </div>

        {/* Feature Copy */}
        <div className="space-y-4 px-2 text-left">
          <div className="flex items-center gap-4">
            <h2 className={`text-5xl font-black tracking-tighter leading-tight ${isLight ? 'text-stone-900' : 'text-stone-100'}`}>
              {title}
            </h2>
            <span className="bg-emerald-500 text-stone-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest shrink-0">
              HEDİYEMİZ
            </span>
          </div>
          <p className={`text-2xl font-medium leading-relaxed ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
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
