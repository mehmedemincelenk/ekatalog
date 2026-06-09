import * as Lucide from 'lucide-react';

interface StudioB2BRehberProps {
  title: string;
  desc: string;
  searchQuery: string;
  leadName1: string;
  leadInfo1: string;
  leadName2: string;
  leadInfo2: string;
  website: string;
  presetClass: string;
  glowColor: string;
  isLight: boolean;
  formatType: 'story' | 'post';
}

export default function StudioB2BRehber({
  title,
  desc,
  searchQuery,
  leadName1,
  leadInfo1,
  leadName2,
  leadInfo2,
  website,
  presetClass,
  glowColor,
  isLight,
  formatType,
}: StudioB2BRehberProps) {
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
        <span className="text-xl font-bold tracking-[0.3em] text-stone-500 uppercase">EKATALOG REHBERİM</span>
        <span className="text-sm font-bold tracking-[0.1em] text-stone-500 uppercase">
          {formatType === 'story' ? 'Instagram Hikaye' : 'Instagram Gönderi'}
        </span>
      </div>

      {/* Main Interactive Mockup Area */}
      <div className={`relative z-10 flex-1 flex flex-col justify-center ${isPost ? 'gap-6 my-4' : 'gap-10 my-6'}`}>
        
        {/* Device/Interface Container */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-[560px] relative">
            
            {/* Phone/Dashboard Glass Card */}
            <div
              className={`rounded-[2.5rem] border shadow-2xl p-6 relative overflow-hidden backdrop-blur-md ${
                isLight
                  ? 'bg-stone-100/80 border-stone-200/60 shadow-stone-200/50'
                  : 'bg-stone-900/40 border-white/[0.06] shadow-black/40'
              }`}
            >
              {/* Directory Search Header */}
              <div className="space-y-4 mb-5">
                <div className="flex items-center justify-between border-b border-stone-500/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className={`text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                      B2B Müşteri Bulucu
                    </span>
                  </div>
                  <Lucide.Users size={14} className={isLight ? 'text-stone-500' : 'text-stone-400'} />
                </div>

                {/* Search Input Mockup */}
                <div
                  className={`flex items-center gap-3 py-3 px-4 rounded-2xl border text-sm font-bold ${
                    isLight
                      ? 'bg-white border-stone-200 text-stone-900'
                      : 'bg-stone-950 border-stone-850 text-stone-100'
                  }`}
                >
                  <Lucide.Search size={16} className="text-stone-400 shrink-0" />
                  <span className="flex-1 text-left">{searchQuery}</span>
                  <span className="text-[10px] font-black text-blue-500 tracking-wider">İSTANBUL</span>
                </div>
              </div>

              {/* Lead Cards List */}
              <div className="space-y-3">
                {/* Lead 1 */}
                <div
                  className={`p-4 rounded-2xl border ${
                    isLight ? 'bg-white border-stone-200/50' : 'bg-white/[0.02] border-white/[0.04]'
                  } flex gap-4 items-center`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      isLight ? 'bg-blue-500/10 text-blue-600' : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    <Lucide.Building2 size={22} />
                  </div>
                  <div className="flex-1 space-y-0.5 text-left">
                    <div className="flex items-center gap-1.5">
                      <h4 className={`text-base font-black ${isLight ? 'text-stone-950' : 'text-stone-100'}`}>
                        {leadName1}
                      </h4>
                      <Lucide.CheckCircle2 size={12} className="text-blue-500" />
                    </div>
                    <p className={`text-[11px] ${isLight ? 'text-stone-500' : 'text-stone-400'} font-medium`}>
                      {leadInfo1}
                    </p>
                  </div>
                  <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase shrink-0">
                    Kayıtlı
                  </span>
                </div>

                {/* Lead 2 */}
                <div
                  className={`p-4 rounded-2xl border ${
                    isLight ? 'bg-white border-stone-200/50' : 'bg-white/[0.02] border-white/[0.04]'
                  } flex gap-4 items-center`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      isLight ? 'bg-amber-500/10 text-amber-600' : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    <Lucide.Building2 size={22} />
                  </div>
                  <div className="flex-1 space-y-0.5 text-left">
                    <div className="flex items-center gap-1.5">
                      <h4 className={`text-base font-black ${isLight ? 'text-stone-950' : 'text-stone-100'}`}>
                        {leadName2}
                      </h4>
                      <Lucide.CheckCircle2 size={12} className="text-amber-500" />
                    </div>
                    <p className={`text-[11px] ${isLight ? 'text-stone-500' : 'text-stone-400'} font-medium`}>
                      {leadInfo2}
                    </p>
                  </div>
                  <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full uppercase shrink-0">
                    Ulaşıldı
                  </span>
                </div>
              </div>
            </div>

            {/* Glowing Pointer Finger Indicator */}
            <div className="absolute right-12 bottom-6 z-20 pointer-events-none animate-bounce">
              <div className="relative">
                <span className="absolute -top-3 -left-3 flex h-9 w-9">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-9 w-9 bg-blue-500/20"></span>
                </span>
                
                <svg
                  className="w-12 h-12 text-blue-400 drop-shadow-[0_4px_12px_rgba(59,130,246,0.5)] fill-current"
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
