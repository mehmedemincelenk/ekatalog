import * as Lucide from 'lucide-react';

interface StudioKurtulacaklarProps {
  header: string;
  items: string[];
  website: string;
  presetClass: string;
  glowColor: string;
  isLight: boolean;
  formatType: 'story' | 'post';
}

export default function StudioKurtulacaklar({
  header,
  items,
  website,
  presetClass,
  glowColor,
  isLight,
  formatType,
}: StudioKurtulacaklarProps) {
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
        <span className="text-xl font-bold tracking-[0.3em] text-red-500 uppercase">Kurtulacaklarınız</span>
        <span className="text-sm font-bold tracking-[0.1em] text-stone-500 uppercase">
          {formatType === 'story' ? 'Instagram Hikaye' : 'Instagram Gönderi'}
        </span>
      </div>

      {/* Main List */}
      <div className="relative z-10 flex-1 flex flex-col justify-center gap-12 my-6">
        <h2 className={`text-6xl font-black tracking-tighter leading-tight ${isLight ? 'text-stone-900' : 'text-stone-100'} pl-2`}>
          {header}
        </h2>

        <div className="flex flex-col gap-6">
          {(items || []).map((item, idx) => (
            <div 
              key={idx}
              className={`p-8 rounded-[2rem] border backdrop-blur-md flex gap-6 items-center transition-all ${
                isLight 
                  ? 'bg-red-50/20 border-red-100/50' 
                  : 'bg-white/[0.02] border-white/[0.04]'
              }`}
            >
              <div className="shrink-0">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  isLight 
                    ? 'bg-red-50 border border-red-200 text-red-600' 
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}>
                  <Lucide.X size={24} strokeWidth={3} />
                </div>
              </div>
              <div className="flex-1 space-y-1 text-left">
                <p className={`text-[19px] font-bold leading-relaxed ${isLight ? 'text-stone-700' : 'text-stone-300'}`}>
                  {item || 'Madde açıklaması...'}
                </p>
              </div>
            </div>
          ))}
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
