import { memo } from 'react';
import { THEME } from '../../data/config';
import Button from './Button';
import { PlusPlaceholderProps } from '../../types';

export default memo(({ type: t, onClick: o, category: cT, className: cn = '', as: a }: PlusPlaceholderProps & { as?: any }) => {
  const c = {
    PRODUCT: { a: cT ? `Add product to ${cT}` : 'Add product', wc: 'relative flex flex-col items-center justify-center border-2 border-dashed border-stone-200 hover:border-stone-400 !bg-stone-50/50 hover:!bg-stone-50 aspect-square h-auto', is: 'w-10 h-10', l: <span className="mt-4 font-black uppercase text-[0.625rem] tracking-[0.2em] text-stone-400 group-hover/plus:text-stone-900 transition-colors leading-tight">Bu Kategoriye<br />Ürün Ekle</span>, sc: true },
    CATEGORY: { a: 'Add category', wc: 'w-8 h-8 !p-0 !border-white/20 text-white font-black hover:!bg-stone-900/80 !rounded-lg bg-stone-900/60 backdrop-blur-md flex items-center justify-center shadow-xl transition-all', is: 'w-4 h-4', l: null, sc: false },
    REFERENCE: { a: 'Add reference', wc: 'w-full aspect-square border-2 border-dashed border-stone-200 hover:border-stone-400 !bg-stone-50/50 hover:!bg-stone-50 !rounded-[32px] flex flex-col items-center justify-center gap-2 group/ref', is: 'w-8 h-8 !rounded-full bg-white shadow-sm border border-stone-100', l: <span className="font-black text-[8px] uppercase tracking-tighter text-stone-400 group-hover/ref:text-stone-900">Yeni Referans</span>, sc: false },
    CAROUSEL: { a: 'Add carousel slide', wc: 'w-full aspect-[21/9] border-2 border-dashed border-stone-200 hover:border-stone-400 !bg-stone-50/50 hover:!bg-stone-50 !rounded-[2rem] flex items-center justify-center gap-4 group/carousel', is: 'w-12 h-12 !rounded-full bg-white shadow-lg border border-stone-100', l: <div className="text-left"><span className="block font-black text-[10px] uppercase tracking-widest text-stone-400 group-hover/carousel:text-stone-900">Yeni Afiş Ekle</span><span className="block text-[8px] text-stone-300 font-medium italic">Kampanyanızı vitrine taşıyın</span></div>, sc: false },
  }[t];

  return (
    <Button as={a} onClick={() => t === 'PRODUCT' ? o(cT) : o()} variant={t === 'CATEGORY' ? 'secondary' : 'ghost'} mode={t === 'REFERENCE' ? 'circle' : 'rectangle'} aria-label={c.a} className={`${t === 'PRODUCT' ? THEME.productCard.container + ' ' + THEME.radius.card : ''} group/plus transition-all cursor-pointer shadow-none ${c.wc} ${cn}`}>
      <div className={`flex ${t === 'CAROUSEL' || t === 'CATEGORY' ? 'flex-row' : 'flex-col'} items-center justify-center ${t === 'CATEGORY' ? 'p-0' : 'p-6'} text-center transform transition-transform group-hover/plus:scale-110`}>
        <div className={`${c.is} flex items-center justify-center ${t === 'CATEGORY' ? 'text-white' : 'text-stone-400 group-hover/plus:text-stone-900'} transition-colors`}>
          <div className={`${t === 'PRODUCT' ? 'w-6 h-6' : 'w-4 h-4'}`}>{THEME.icons.plus}</div>
        </div>
        {c.l}
      </div>
      {c.sc && <><div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-stone-200" /><div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-stone-200" /></>}
    </Button>
  );
});
