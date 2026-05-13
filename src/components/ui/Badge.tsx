import { memo } from 'react';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
  className?: string;
  size?: 'xs' | 'sm' | 'md';
  showDot?: boolean;
  pulse?: boolean;
}

/**
 * BADGE COMPONENT (Diamond Edition)
 * -----------------------------------------------------------
 * Versatile label component for status, tips, and highlights.
 * Includes integrated StatusDot functionality.
 */
const Badge = memo(({ 
  children, 
  variant = 'secondary', 
  className = '',
  size = 'xs',
  showDot = false,
  pulse = false
}: BadgeProps) => {
  const variantClasses = {
    primary: 'bg-stone-900 text-white border-stone-800 shadow-md shadow-stone-900/10',
    secondary: 'bg-white/90 text-stone-900 border-stone-200 backdrop-blur-sm',
    danger: 'bg-red-500 text-white border-red-600 shadow-lg shadow-red-500/20',
    warning: 'bg-amber-400 text-white border-amber-500 shadow-lg shadow-amber-500/10',
    success: 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/10',
  };

  const dotClasses = {
    primary: 'bg-white',
    secondary: 'bg-stone-900',
    danger: 'bg-white',
    warning: 'bg-white',
    success: 'bg-white',
  };

  const sizeClasses = {
    xs: 'px-2 py-1 text-[8px]',
    sm: 'px-2.5 py-1 text-[9px]',
    md: 'px-3 py-1.5 text-[10px]',
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center rounded-lg font-black uppercase tracking-widest border gap-1.5
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotClasses[variant]} ${pulse ? 'animate-pulse' : ''}`} />
      )}
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';
export default Badge;
