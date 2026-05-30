import { motion } from 'motion/react';
import { LoadingProps } from '../../types';

const SIZE_CLASSES = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
  xl: 'w-16 h-16 border-4',
};
const VARIANT_CLASSES = {
  dark: 'border-stone-200 border-t-stone-800',
  light: 'border-white/20 border-t-white',
  white: 'border-gray-100 border-t-white shadow-sm',
};

export default function Loading({
  size = 'md',
  variant = 'dark',
  label,
  className = '',
}: LoadingProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, rotate: 360 }}
        transition={{
          opacity: { duration: 0.3 },
          scale: { duration: 0.3 },
          rotate: { repeat: Infinity, duration: 1, ease: 'linear' },
        }}
        className={`${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} rounded-full`}
      />
      {label && (
        <motion.span
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[10px] font-black uppercase tracking-widest text-stone-400"
        >
          {label}
        </motion.span>
      )}
    </div>
  );
}
