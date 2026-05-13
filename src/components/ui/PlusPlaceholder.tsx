import { memo } from 'react';
import { THEME } from '../../data/config';
import Button from './Button';
import { PlusPlaceholderProps } from '../../types';

/**
 * PLUS PLACEHOLDER (DIAMOND EDITION)
 * -----------------------------------------------------------
 * A configuration-driven 'Add' trigger that adapts its UI
 * based on the context. DRY, clean, and 100% tokenized.
 */
const PlusPlaceholder = memo(
  ({
    type,
    onClick,
    category,
    className = '',
    label,
    as,
  }: PlusPlaceholderProps & { as?: any }) => {
    const globalIcons = THEME.icons;

    // VARIANT CONFIGURATION ENGINE
    const config = {
      PRODUCT: {
        aria: category ? `Add product to ${category}` : 'Add product',
        wrapperClass: `relative flex flex-col items-center justify-center border-2 border-dashed border-stone-200 hover:border-stone-400 !bg-stone-50/50 hover:!bg-stone-50 aspect-square h-auto`,
        iconSize: 'w-10 h-10',
        label: (
          <span className="mt-4 font-black uppercase text-[0.625rem] tracking-[0.2em] text-stone-400 group-hover/plus:text-stone-900 transition-colors leading-tight">
            Bu Kategoriye
            <br />
            Ürün Ekle
          </span>
        ),
        showCorners: true,
      },
      CATEGORY: {
        aria: 'Add category',
        wrapperClass: `px-3 !py-0 !border-2 !border-dashed !border-stone-300 text-stone-400 font-black uppercase tracking-widest hover:!border-stone-900 hover:!text-stone-900 !rounded-full bg-stone-50/30 flex items-center justify-center h-8 !shadow-none`,
        iconSize: 'w-4 h-4',
        label: <span className="ml-2 text-[0.5rem]">{label || 'KATEGORİ EKLE'}</span>,
        showCorners: false,
      },
      REFERENCE: {
        aria: 'Add reference',
        wrapperClass: `w-full aspect-square border-2 border-dashed border-stone-200 hover:border-stone-400 !bg-stone-50/50 hover:!bg-stone-50 !rounded-[32px] flex flex-col items-center justify-center gap-2 group/ref`,
        iconSize:
          'w-8 h-8 !rounded-full bg-white shadow-sm border border-stone-100',
        label: (
          <span className="font-black text-[8px] uppercase tracking-tighter text-stone-400 group-hover/ref:text-stone-900">
            Yeni Referans
          </span>
        ),
        showCorners: false,
      },
      CAROUSEL: {
        aria: 'Add carousel slide',
        wrapperClass: `w-full aspect-[21/9] border-2 border-dashed border-stone-200 hover:border-stone-400 !bg-stone-50/50 hover:!bg-stone-50 !rounded-[2rem] flex items-center justify-center gap-4 group/carousel`,
        iconSize:
          'w-12 h-12 !rounded-full bg-white shadow-lg border border-stone-100',
        label: (
          <div className="text-left">
            <span className="block font-black text-[10px] uppercase tracking-widest text-stone-400 group-hover/carousel:text-stone-900">
              Yeni Afiş Ekle
            </span>
            <span className="block text-[8px] text-stone-300 font-medium italic">
              Kampanyanızı vitrine taşıyın
            </span>
          </div>
        ),
        showCorners: false,
      },
    }[type];

    const theme = THEME.productCard;

    return (
      <Button
        as={as}
        onClick={() => (type === 'PRODUCT' ? onClick(category) : onClick())}
        variant={type === 'CATEGORY' ? 'secondary' : 'ghost'}
        mode={type === 'REFERENCE' ? 'circle' : 'rectangle'}
        aria-label={config.aria}
        className={`
        ${type === 'PRODUCT' ? theme.container + ' ' + THEME.radius.card : ''}
        group/plus transition-all cursor-pointer shadow-none
        ${config.wrapperClass}
        ${className}
      `}
      >
        <div
          className={`flex ${type === 'CAROUSEL' || type === 'CATEGORY' ? 'flex-row' : 'flex-col'} items-center justify-center ${type === 'CATEGORY' ? 'p-0' : 'p-6'} text-center transform transition-transform group-hover/plus:scale-110`}
        >
          <div
            className={`${config.iconSize} flex items-center justify-center text-stone-400 group-hover/plus:text-stone-900 transition-colors`}
          >
            <div className={`${type === 'PRODUCT' ? 'w-6 h-6' : 'w-4 h-4'}`}>
              {globalIcons.plus}
            </div>
          </div>
          {config.label}
        </div>

        {config.showCorners && (
          <>
            <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-stone-200" />
            <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-stone-200" />
          </>
        )}
      </Button>
    );
  },
);

export default PlusPlaceholder;
