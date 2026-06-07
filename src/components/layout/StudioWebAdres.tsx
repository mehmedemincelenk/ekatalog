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
  // Outgoing chat bubble colors based on background preset
  const bubbleBg = isLight 
    ? 'bg-[#d9fdd3] text-[#303030] border border-[#e1f7dd]' 
    : 'bg-[#005c4b]/80 text-[#e9edef] border border-[#007560]/40 backdrop-blur-md';

  const previewCardBg = isLight
    ? 'bg-[#cfe9c9]'
    : 'bg-[#025143]';

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
        
        {/* WhatsApp Mobile Chat Mockup */}
        <div className={`rounded-[2.5rem] border overflow-hidden shadow-2xl relative ${
          isLight ? 'bg-[#efeae2] border-stone-200/60' : 'bg-[#0b141a] border-white/[0.05]'
        }`}>
          {/* Header area of Chat */}
          <div className={`px-6 py-5 flex items-center justify-between border-b ${
            isLight ? 'bg-[#f0f2f5] border-stone-200/60' : 'bg-[#202c33] border-stone-850'
          }`}>
            <div className="flex items-center gap-3">
              {/* Back Arrow */}
              <Lucide.ArrowLeft size={18} className={isLight ? 'text-[#54656f]' : 'text-[#aebac1]'} />
              
              {/* User Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isLight ? 'bg-stone-300' : 'bg-stone-700'
              }`}>
                <Lucide.User size={18} className={isLight ? 'text-stone-600' : 'text-stone-300'} />
              </div>

              {/* Name & Status */}
              <div>
                <h4 className={`text-sm font-bold ${isLight ? 'text-[#111b21]' : 'text-[#e9edef]'}`}>
                  Ahmet Abi
                </h4>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Çevrimiçi</p>
              </div>
            </div>

            {/* Chat Call/More Icons */}
            <div className={`flex gap-4 ${isLight ? 'text-[#54656f]' : 'text-[#aebac1]'}`}>
              <Lucide.Phone size={16} />
              <Lucide.MoreVertical size={16} />
            </div>
          </div>

          {/* Date Separator */}
          <div className="flex justify-center my-4">
            <span className={`text-[10px] font-bold px-3 py-1 rounded-lg ${
              isLight ? 'bg-white text-[#54656f] shadow-sm' : 'bg-[#182229] text-[#8696a0]'
            }`}>
              BUGÜN
            </span>
          </div>

          {/* Chat Messages Stream Area */}
          <div className="px-6 pb-6 pt-2 flex flex-col items-end">
            
            {/* Outgoing Msg (Green Bubble) */}
            <div className={`max-w-[85%] rounded-2xl rounded-tr-none p-4 space-y-3 shadow-[0_1px_0.5px_rgba(0,0,0,0.15)] relative ${bubbleBg}`}>
              
              {/* The Text */}
              <p className="text-sm font-bold leading-normal">
                abi sadece buna tıkla, ürünlerimizin hepsine ulaşabilirsin.
              </p>

              {/* Link Preview Box */}
              <div className={`rounded-xl overflow-hidden flex flex-col border border-white/[0.04] p-3 text-left ${previewCardBg}`}>
                <div className="flex gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                    isLight ? 'bg-white/80' : 'bg-black/20'
                  }`}>
                    <Lucide.Globe className="text-emerald-500" size={20} />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h5 className={`text-[11px] font-black truncate ${isLight ? 'text-stone-900' : 'text-white'}`}>
                      {title}
                    </h5>
                    <p className={`text-[9px] font-medium leading-relaxed truncate opacity-70`}>
                      Dijital menümüz ve anında güncel fiyatlar.
                    </p>
                    <p className="text-[9px] font-bold text-sky-400 truncate tracking-wide">
                      {website}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timestamp tick */}
              <div className="flex justify-end items-center gap-1 opacity-60">
                <span className="text-[9px]">15:10</span>
                <span className="text-sky-400 text-xs font-black">✓✓</span>
              </div>
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
