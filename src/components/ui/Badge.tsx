import { memo } from 'react';

const V = { primary: 'bg-stone-900 text-white border-stone-800 shadow-md shadow-stone-900/10', secondary: 'bg-white/90 text-stone-900 border-stone-200 backdrop-blur-sm', danger: 'bg-red-500 text-white border-red-600 shadow-lg shadow-red-500/20', warning: 'bg-amber-400 text-white border-amber-500 shadow-lg shadow-amber-500/10', success: 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/10' };
const S = { xs: 'px-2 py-1 text-[8px]', sm: 'px-2.5 py-1 text-[9px]', md: 'px-3 py-1.5 text-[10px]' };

export default memo(({ children: c, variant: v = 'secondary', className: n = '', size: s = 'xs', showDot: d, pulse: p }: { children?: any; variant?: keyof typeof V; className?: string; size?: keyof typeof S; showDot?: boolean; pulse?: boolean }) => (
  <span className={`inline-flex items-center justify-center rounded-lg font-black uppercase tracking-widest border gap-1.5 ${V[v]} ${S[s]} ${n}`}>
    {d && <span className={`w-1.5 h-1.5 rounded-full ${v === 'secondary' ? 'bg-stone-900' : 'bg-white'} ${p ? 'animate-pulse' : ''}`} />}
    {c}
  </span>
));
