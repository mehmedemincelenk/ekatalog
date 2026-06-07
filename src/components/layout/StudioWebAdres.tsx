import * as Lucide from 'lucide-react';

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
  return (
    <div
      className={`w-full h-full relative flex flex-col justify-between p-20 select-none overflow-hidden ${presetClass}`}
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
      <div className="relative z-10 flex-1 flex flex-col justify-center gap-12 my-6">
        
        {/* Browser Mockup */}
        <div className={`rounded-[2rem] border overflow-hidden shadow-2xl backdrop-blur-md ${
          isLight ? 'bg-white/60 border-stone-200/50' : 'bg-white/[0.02] border-white/[0.05]'
        }`}>
          {/* Browser Top Bar */}
          <div className={`px-6 py-4 flex items-center justify-between border-b ${
            isLight ? 'bg-stone-100/80 border-stone-200/50' : 'bg-white/[0.03] border-white/[0.05]'
          }`}>
            {/* Dots */}
            <div className="flex gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500/70" />
              <span className="w-3.5 h-3.5 rounded-full bg-yellow-500/70" />
              <span className="w-3.5 h-3.5 rounded-full bg-green-500/70" />
            </div>

            {/* Address Bar */}
            <div className={`flex-1 mx-8 py-2.5 px-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
              isLight ? 'bg-white border border-stone-200' : 'bg-black/30 border border-white/[0.04]'
            }`}>
              <div className="flex items-center gap-2 text-stone-400">
                <Lucide.Lock size={12} className="text-emerald-500" />
                <span className="text-emerald-500 select-none">https://</span>
                <span className={isLight ? 'text-stone-800 font-bold' : 'text-stone-200 font-bold'}>{website}</span>
              </div>
              <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">GÜVENLİ</span>
            </div>

            {/* Empty Right for Alignment */}
            <div className="w-14" />
          </div>

          {/* Browser Body Mockup Content */}
          <div className="p-10 flex flex-col items-center justify-center text-center gap-6 min-h-[200px]">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${isLight ? 'bg-stone-100' : 'bg-white/[0.02]'}`}>
              <Lucide.Globe className="text-emerald-500 animate-pulse" size={40} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">7/24 Kesintisiz Erişim</span>
              <p className={`text-sm font-bold ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>Dükkanınız tüm dünyaya açık</p>
            </div>
          </div>
        </div>

        {/* Feature Copy */}
        <div className="space-y-4 px-2 text-left">
          <h2 className={`text-5xl font-black tracking-tighter leading-tight ${isLight ? 'text-stone-900' : 'text-stone-100'}`}>
            {title}
          </h2>
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
