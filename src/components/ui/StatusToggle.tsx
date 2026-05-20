import { memo } from 'react';
import * as Lucide from 'lucide-react';
import Button from './Button';
import { THEME } from '../../data/config';
import { motion } from 'framer-motion';

interface StatusToggleProps { label?: string; value: boolean; onChange: (value: boolean) => void; disabled?: boolean; activeColor?: string; inactiveColor?: string; variant?: 'default' | 'compact'; }

export default memo(({ label: l, value: v, onChange: oC, disabled: d = false, activeColor: aC = THEME.statusState.active, inactiveColor: iC = THEME.statusState.danger, variant: vr = 'default' }: StatusToggleProps) => {
  const iCmp = vr === 'compact';
  return (
    <div className={`flex items-center justify-between bg-white rounded-xl border border-stone-100/50 shadow-sm ${iCmp ? 'px-1.5 py-1' : 'px-2.5 py-2'}`}>
      {l && <span className={`${iCmp ? 'text-[8px]' : 'text-[10px]'} font-black text-stone-400 uppercase tracking-tight pr-2`}>{l}</span>}
      <div className={`flex ${iCmp ? 'gap-1' : 'gap-1.5'}`}>
        <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}><Button onClick={(e) => { e.stopPropagation(); oC(true); }} disabled={d} mode="square" size="sm" className={`${iCmp ? '!w-6 !h-6' : '!w-7 !h-7'} !p-0 !rounded-lg transition-all ${v ? aC : THEME.statusState.inactive}`} icon={<Lucide.Check size={iCmp ? 10 : 14} strokeWidth={4} />} /></motion.div>
        <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}><Button onClick={(e) => { e.stopPropagation(); oC(false); }} disabled={d} mode="square" size="sm" className={`${iCmp ? '!w-6 !h-6' : '!w-7 !h-7'} !p-0 !rounded-lg transition-all ${!v ? iC : THEME.statusState.inactive}`} icon={<Lucide.X size={iCmp ? 10 : 14} strokeWidth={4} />} /></motion.div>
      </div>
    </div>
  );
});
