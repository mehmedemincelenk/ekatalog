import { motion } from 'framer-motion';
import { LoadingProps } from '../../types';

const S = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-3', lg: 'w-12 h-12 border-4', xl: 'w-16 h-16 border-4' };
const V = { dark: 'border-stone-200 border-t-stone-800', light: 'border-white/20 border-t-white', white: 'border-gray-100 border-t-white shadow-sm' };

export default function Loading({ size: s = 'md', variant: v = 'dark', label: l, className: c = '' }: LoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${c}`}>
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1, rotate: 360 }} transition={{ opacity: { duration: 0.3 }, scale: { duration: 0.3 }, rotate: { repeat: Infinity, duration: 1, ease: "linear" } }} className={`${S[s]} ${V[v]} rounded-full`} />
      {l && <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-[10px] font-black uppercase tracking-widest text-stone-400">{l}</motion.span>}
    </div>
  );
}
