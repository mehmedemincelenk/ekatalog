import { memo } from 'react';
import * as Lucide from 'lucide-react';
import Button from './Button';
import { THEME } from '../../data/config';

import { motion } from 'framer-motion';

/**
 * STATUS TOGGLE COMPONENT (Diamond Standard)
 * -----------------------------------------------------------
 * A specialized binary toggle for handling Stock, Publish, etc.
 * Uses the atomic Button unit internally for consistent feel.
 */

interface StatusToggleProps {
  label?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  variant?: 'default' | 'compact';
}

const StatusToggle = memo(
  ({
    label,
    value,
    onChange,
    disabled = false,
    activeColor = THEME.statusState.active,
    inactiveColor = THEME.statusState.danger,
    variant = 'default',
  }: StatusToggleProps) => {
    const isCompact = variant === 'compact';

    return (
      <div className={`flex items-center justify-between bg-white rounded-xl border border-stone-100/50 shadow-sm ${isCompact ? 'px-1.5 py-1' : 'px-2.5 py-2'}`}>
        {label && (
          <span className={`${isCompact ? 'text-[8px]' : 'text-[10px]'} font-black text-stone-400 uppercase tracking-tight pr-2`}>
            {label}
          </span>
        )}
        <div className={`flex ${isCompact ? 'gap-1' : 'gap-1.5'}`}>
          <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
            <Button
              onClick={(e) => { e.stopPropagation(); onChange(true); }}
              disabled={disabled}
              mode="square"
              size="sm"
              className={`${isCompact ? '!w-6 !h-6' : '!w-7 !h-7'} !p-0 !rounded-lg transition-all ${value ? activeColor : THEME.statusState.inactive}`}
              icon={<Lucide.Check size={isCompact ? 10 : 14} strokeWidth={4} />}
            />
          </motion.div>
          <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
            <Button
              onClick={(e) => { e.stopPropagation(); onChange(false); }}
              disabled={disabled}
              mode="square"
              size="sm"
              className={`${isCompact ? '!w-6 !h-6' : '!w-7 !h-7'} !p-0 !rounded-lg transition-all ${!value ? inactiveColor : THEME.statusState.inactive}`}
              icon={<Lucide.X size={isCompact ? 10 : 14} strokeWidth={4} />}
            />
          </motion.div>
        </div>
      </div>
    );
  },
);

StatusToggle.displayName = 'StatusToggle';
export default StatusToggle;
