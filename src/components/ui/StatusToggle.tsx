import { memo } from 'react';
import { motion } from 'motion/react';

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
    activeColor = 'bg-emerald-500',
    inactiveColor = 'bg-stone-800',
    variant = 'default',
  }: StatusToggleProps) => {
    const isCompact = variant === 'compact';

    // Premium iOS Toggle Dimensions
    const toggleWidth = isCompact ? 'w-[36px]' : 'w-[44px]';
    const toggleHeight = isCompact ? 'h-[20px]' : 'h-[24px]';
    const knobSize = isCompact ? 'w-[16px] h-[16px]' : 'w-[20px] h-[20px]';
    const travelDistance = isCompact ? 16 : 20;

    // Helper to safely extract background color classes from compound color definitions
    const getBgColorClass = (colorStr: string, fallback: string) => {
      if (!colorStr) return fallback;
      const bgClass = colorStr.split(' ').find((c) => c.includes('bg-'));
      return bgClass || fallback;
    };

    const resolvedActiveBg = getBgColorClass(activeColor, 'bg-emerald-500');
    const resolvedInactiveBg = getBgColorClass(inactiveColor, 'bg-stone-800');

    return (
      <div className="flex items-center justify-between select-none">
        {label && (
          <span
            className={`${
              isCompact ? 'text-[8px]' : 'text-[10px]'
            } font-black text-stone-400 uppercase tracking-tight pr-2`}
          >
            {label}
          </span>
        )}
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onChange(!value);
          }}
          className={`relative ${toggleWidth} ${toggleHeight} rounded-full transition-colors duration-300 p-[2px] flex items-center justify-start shrink-0 ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          } ${value ? resolvedActiveBg : resolvedInactiveBg}`}
        >
          <motion.div
            animate={{ x: value ? travelDistance : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`${knobSize} bg-white rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.2)]`}
          />
        </div>
      </div>
    );
  },
);

export default StatusToggle;
