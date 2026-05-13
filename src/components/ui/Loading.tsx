// FILE ROLE: High-End Minimal Loading Spinner
// DEPENDS ON: Lucide React (or SVG), Tailwind
// CONSUMED BY: ProductCard, HeroCarousel, AIStudio
import { motion } from 'framer-motion';

import { LoadingProps } from '../../types';

/**
 * LOADING COMPONENT (DIAMOND STANDARD)
 * -----------------------------------------------------------
 * A pure, elegant spinner that replaces redundant loading labels.
 */
const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'dark',
  label,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  const variantClasses = {
    dark: 'border-stone-200 border-t-stone-800',
    light: 'border-white/20 border-t-white',
    white: 'border-gray-100 border-t-white shadow-sm',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          rotate: 360 
        }}
        transition={{
          opacity: { duration: 0.3 },
          scale: { duration: 0.3 },
          rotate: { repeat: Infinity, duration: 1, ease: "linear" }
        }}
        className={`
          ${sizeClasses[size]} 
          ${variantClasses[variant]} 
          rounded-full
        `}
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
};

export default Loading;
