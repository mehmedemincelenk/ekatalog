
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
  // Outgoing chat bubble colors based on background preset
  const bubbleBg = isLight 
    ? 'bg-[#d9fdd3] text-[#303030] border border-[#e1f7dd]' 
    : 'bg-[#005c4b] text-[#e9edef] border border-[#007560]/50 shadow-xl';

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
        
        {/* Centered Chat Bubble with Inline Blue Link */}
        <div className="w-full flex justify-center py-4">
          <div className={`w-full max-w-[540px] rounded-[2.5rem] rounded-tr-none p-8 space-y-6 shadow-2xl relative border ${bubbleBg}`}>
            
            {/* The Message Text + Blue Inline Link */}
            <div className="space-y-4 text-left">
              <p className="text-2xl font-bold leading-relaxed">
                abi sadece buna tıkla, ürünlerimizin hepsine ulaşabilirsin:
              </p>
              <p className="text-2xl font-black text-sky-400 hover:underline break-all block pt-1">
                {website}
              </p>
            </div>

            {/* Timestamp tick */}
            <div className="flex justify-end items-center gap-1.5 opacity-60">
              <span className="text-xs font-bold">15:10</span>
              <span className="text-sky-400 text-sm font-black">✓✓</span>
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
