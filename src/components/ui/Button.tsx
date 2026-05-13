import React from 'react';
import { Check } from 'lucide-react'; // Master Icons

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  children?: React.ReactNode;
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'danger'
    | 'success'
    | 'glass'
    | 'whatsapp'
    | 'kraft'
    | 'action'
    | 'instagram'
    | 'phone';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  mode?: 'circle' | 'rectangle' | 'square' | 'nav-left' | 'nav-right';
  loading?: boolean;
  // Master Button Extensions
  description?: string;
  selected?: boolean;
  layout?: 'vertical' | 'horizontal';
  badge?: string;
  showFingerprint?: boolean;
  fingerprintType?: 'standard' | 'detailed' | 'touch' | 'action';
  fingerprintRotation?: number;
  as?: any;
}

/**
 * MASTER BUTTON (DIAMOND STANDARD)
 * -----------------------------------------------------------
 * The ultimate clickable unit. Handles everything from simple 
 * action triggers to complex selection cards.
 */
const Button: React.FC<ButtonProps> = ({
  icon,
  children,
  variant = 'secondary',
  size = 'md',
  mode = 'rectangle',
  loading,
  className = '',
  disabled,
  description,
  selected,
  layout = 'horizontal',
  badge,
  showFingerprint,
  fingerprintType = 'standard',
  fingerprintRotation,
  as: Component = 'button',
  ...props
}) => {
  const isCard = !!description || selected !== undefined;
  const isVertical = layout === 'vertical';

  const baseStyles = 'relative inline-flex items-center justify-center transition-all duration-300 font-black uppercase tracking-widest active:scale-95 disabled:opacity-50 disabled:pointer-events-none overflow-hidden';
  
  const variants = {
    primary: 'bg-stone-900 text-white hover:bg-stone-800 shadow-lg shadow-stone-200',
    secondary: 'bg-stone-100 text-stone-900 hover:bg-stone-200',
    outline: 'border-2 border-stone-200 text-stone-600 hover:border-stone-900 hover:text-stone-900',
    ghost: 'text-stone-500 hover:bg-stone-50 hover:text-stone-900',
    danger: 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white',
    success: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white',
    glass: 'bg-white/80 backdrop-blur-md text-stone-900 border border-white/50 hover:bg-white shadow-xl',
    whatsapp: 'bg-[#25D366] text-white hover:bg-[#128C7E] shadow-lg shadow-green-100',
    kraft: 'bg-[#e3d5c1] text-[#5d4037] hover:bg-[#d7c4aa]',
    action: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-100',
    instagram: 'bg-[#FF0069] text-white hover:bg-[#D40058] shadow-lg shadow-pink-100',
    phone: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100',
  };

  const sizes = {
    xs: 'px-2 py-1 text-[8px] gap-1',
    sm: 'px-3 py-1.5 text-[9px] gap-1.5',
    md: 'px-6 py-3 text-xs gap-2',
    lg: 'px-8 py-4 text-sm gap-3',
    xl: 'px-10 py-5 text-base gap-4',
  };

  const modes = {
    circle: 'rounded-full aspect-square !p-0',
    square: 'rounded-2xl aspect-square !p-0',
    rectangle: isCard ? 'rounded-[2.5rem]' : 'rounded-2xl',
    'nav-left': 'rounded-full aspect-square !p-0 shadow-2xl',
    'nav-right': 'rounded-full aspect-square !p-0 shadow-2xl',
  };

  // Card specific styles override
  const cardStyles = isCard ? `
    !flex border-2 text-left w-full justify-start
    ${isVertical ? 'flex-col items-center p-8 rounded-[3rem] text-center' : 'items-center gap-5 p-6'}
    ${selected 
      ? 'bg-stone-900 border-stone-900 text-white shadow-2xl scale-[1.02] z-10' 
      : 'bg-stone-50 border-stone-100 text-stone-600 hover:border-stone-300 hover:bg-white'}
  ` : '';

  return (
    <Component
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${modes[mode]} 
        ${cardStyles}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {/* LOADING OVERLAY */}
      {loading && (
        <div className="absolute inset-0 bg-inherit flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* SELECTION CHECKMARK */}
      {selected && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
          <Check size={14} className="text-stone-900" strokeWidth={3} />
        </div>
      )}

      {/* BADGE */}
      {badge && (
        <div className="absolute -top-1 left-6 px-3 py-1 bg-amber-400 text-stone-900 text-[8px] font-black uppercase tracking-widest rounded-full shadow-sm border border-white">
          {badge}
        </div>
      )}

      {/* ICON / PREVIEW UNIT */}
      {icon && (
        <div className={`
          flex items-center justify-center shrink-0 transition-transform duration-300
          ${isCard ? (isVertical ? 'w-20 h-28 mb-4' : 'w-14 h-14 rounded-3xl bg-white shadow-sm text-stone-400') : ''}
          ${selected && isCard ? 'bg-white text-stone-900 shadow-xl' : ''}
        `}>
          {icon}
        </div>
      )}

      {/* CONTENT UNIT */}
      {children && (
        <div className={`
          ${isCard ? 'flex-1 min-w-0' : ''}
          ${selected && !isVertical ? 'pr-8' : ''}
        `}>
          {isCard ? (
            <>
              <div className={`
                ${description ? 'font-black text-sm mb-0.5 block' : 'flex items-center justify-between w-full'}
              `}>
                {children}
              </div>
              {description && (
                <p className={`
                  text-[10px] lowercase leading-relaxed font-bold opacity-70 transition-colors normal-case
                  ${selected ? 'text-stone-300' : 'text-stone-400'}
                `}>
                  {description}
                </p>
              )}
            </>
          ) : (
            children
          )}
        </div>
      )}

      {/* FINGERPRINT WATERMARK (DIAMOND SEAL) */}
      {showFingerprint && (
        <div 
          className={`
            absolute opacity-10 pointer-events-none transition-transform duration-500
            ${size === 'xs' || size === 'sm' ? '-right-2 -bottom-2' : '-right-6 -bottom-6'}
            ${selected ? 'opacity-20 scale-110' : 'group-hover:scale-110 group-hover:opacity-15'}
          `}
          style={{ transform: `scaleX(-1) rotate(${fingerprintRotation ?? 10}deg)` }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width={size === 'xs' || size === 'sm' ? '36' : '90'} height={size === 'xs' || size === 'sm' ? '36' : '90'} fill="currentColor" viewBox="0 0 16 16">
            <path d="M8.06 6.5a.5.5 0 0 1 .5.5v.776a11.5 11.5 0 0 1-.552 3.519l-1.331 4.14a.5.5 0 0 1-.952-.305l1.33-4.141a10.5 10.5 0 0 0 .504-3.213V7a.5.5 0 0 1 .5-.5Z"/>
            <path d="M6.06 7a2 2 0 1 1 4 0 .5.5 0 1 1-1 0 1 1 0 1 0-2 0v.332q0 .613-.066 1.221A.5.5 0 0 1 6 8.447q.06-.555.06-1.115zm3.509 1a.5.5 0 0 1 .487.513 11.5 11.5 0 0 1-.587 3.339l-1.266 3.8a.5.5 0 0 1-.949-.317l1.267-3.8a10.5 10.5 0 0 0 .535-3.048A.5.5 0 0 1 9.569 8m-3.356 2.115a.5.5 0 0 1 .33.626L5.24 14.939a.5.5 0 1 1-.955-.296l1.303-4.199a.5.5 0 0 1 .625-.329"/>
            <path d="M4.759 5.833A3.501 3.501 0 0 1 11.559 7a.5.5 0 0 1-1 0 2.5 2.5 0 0 0-4.857-.833.5.5 0 1 1-.943-.334m.3 1.67a.5.5 0 0 1 .449.546 10.7 10.7 0 0 1-.4 2.031l-1.222 4.072a.5.5 0 1 1-.958-.287L4.15 9.793a9.7 9.7 0 0 0 .363-1.842.5.5 0 0 1 .546-.449Zm6 .647a.5.5 0 0 1 .5.5c0 1.28-.213 2.552-.632 3.762l-1.09 3.145a.5.5 0 0 1-.944-.327l1.089-3.145c.382-1.105.578-2.266.578-3.435a.5.5 0 0 1 .5-.5Z"/>
            <path d="M3.902 4.222a5 5 0 0 1 5.202-2.113.5.5 0 0 1-.208.979 4 4 0 0 0-4.163 1.69.5.5 0 0 1-.831-.556m6.72-.955a.5.5 0 0 1 .705-.052A4.99 4.99 0 0 1 13.059 7v1.5a.5.5 0 1 1-1 0V7a3.99 3.99 0 0 0-1.386-3.028.5.5 0 0 1-.051-.705M3.68 5.842a.5.5 0 0 1 .422.568q-.044.289-.044.59c0 .71-.1 1.417-.298 2.1l-1.14 3.923a.5.5 0 1 1-.96-.279L2.8 8.821A6.5 6.5 0 0 0 3.058 7q0-.375.054-.736a.5.5 0 0 1 .568-.422m8.882 3.66a.5.5 0 0 1 .456.54c-.084 1-.298 1.986-.64 2.934l-.744 2.068a.5.5 0 0 1-.941-.338l.745-2.07a10.5 10.5 0 0 0 .584-2.678.5.5 0 0 1 .54-.456"/>
            <path d="M4.81 1.37A6.5 6.5 0 0 1 14.56 7a.5.5 0 1 1-1 0 5.5 5.5 0 0 0-8.25-4.765.5.5 0 0 1-.5-.865m-.89 1.257a.5.5 0 0 1 .04.706A5.48 5.48 0 0 0 2.56 7a.5.5 0 0 1-1 0c0-1.664.626-3.184 1.655-4.333a.5.5 0 0 1 .706-.04ZM1.915 8.02a.5.5 0 0 1 .346.616l-.779 2.767a.5.5 0 1 1-.962-.27l.778-2.767a.5.5 0 0 1 .617-.346m12.15.481a.5.5 0 0 1 .49.51c-.03 1.499-.161 3.025-.727 4.533l-.07.187a.5.5 0 0 1-.936-.351l.07-.187c.506-1.35.634-2.74.663-4.202a.5.5 0 0 1 .51-.49"/>
          </svg>
        </div>
      )}
    </Component>
  );
};

export default Button;
