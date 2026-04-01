import { useRef, useState, useEffect } from 'react';
import { CARD_TYPOGRAPHY as CT } from '../data/config';

// Derived class strings from individual config tokens
const categoryClass = `inline-block ${CT.categoryFontSize} ${CT.categoryWeight} ${CT.categoryCase} ${CT.categoryTracking} ${CT.categoryColor} ${CT.categoryBg} ${CT.categoryBorder} ${CT.categoryRounding} ${CT.categoryPadding}`;
const nameClass     = `${CT.nameFontSize} ${CT.nameWeight} ${CT.nameColor} ${CT.nameLeading}`;
const priceClass    = `${CT.priceFontSize} ${CT.priceWeight} ${CT.priceColor}`;
const descClass     = `${CT.descFontSize} ${CT.descColor} ${CT.descLeading}`;

// Scrolls text horizontally if it overflows — only for single-line fields
function MarqueeText({ text, textClass, isAdmin, editableProps = {} }) {
  const containerRef = useRef(null);
  const [overflow, setOverflow] = useState(false);
  const { className: editableClass = '', ...restEditable } = editableProps;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const check = () => setOverflow(el.scrollWidth > el.clientWidth + 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${isAdmin ? 'whitespace-normal' : 'whitespace-nowrap'} ${textClass} ${editableClass}`}
      {...restEditable}
    >
      {overflow && !isAdmin
        ? <span className="marquee-track inline-block">{text}&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;</span>
        : <span>{text}</span>
      }
    </div>
  );
}

// Dikey oto-kaydırma — taşan açıklamalar için
function DescriptionScroll({ lines, lineClass, maxHeightClass }) {
  const containerRef = useRef(null);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const check = () => setOverflow(el.scrollHeight > el.clientHeight + 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [lines]);

  const renderLines = (keyPrefix) =>
    lines.map((line, i) => (
      <div key={`${keyPrefix}-${i}`} className={`${lineClass} flex gap-1 items-baseline`}>
        <span className="text-stone-400 shrink-0">•</span>
        <span>{line}</span>
      </div>
    ));

  return (
    <div ref={containerRef} className={`${maxHeightClass} overflow-hidden`}>
      {overflow ? (
        <div className="desc-scroll-track">
          {renderLines('a')}
          {renderLines('b')}
        </div>
      ) : renderLines('a')}
    </div>
  );
}

export default function ProductCard({ product, categories = [], isAdmin, onDelete, onUpdate }) {
  const fileInputRef = useRef(null);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [newCatData, setNewCatData] = useState('');

  // --- Delete ---
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) onDelete(product.id);
  };

  // --- Image ---
  const handleImageClick = () => { if (isAdmin) fileInputRef.current?.click(); };
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onUpdate(product.id, { image: ev.target.result });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // --- Generic in-place edit (single-line fields) ---
  const makeEditable = (field) => ({
    contentEditable: isAdmin ? 'true' : 'false',
    suppressContentEditableWarning: true,
    inputMode: field === 'price' && isAdmin ? 'decimal' : undefined,
    onClick: (e) => e.stopPropagation(),
    onBlur: (e) => {
      let val = e.currentTarget.textContent.trim();
      if (field === 'price' && val && !val.startsWith('₺')) { val = '₺' + val; e.currentTarget.textContent = val; }
      if (val !== (product[field] || '')) onUpdate(product.id, { [field]: val });
    },
    onKeyDown: (e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } },
    className: isAdmin ? 'cursor-text focus:outline-none rounded transition-shadow' : '',
  });

  // Multiline özel in-place edit (Açıklamalar için)
  const makeEditableMulti = (field) => ({
    contentEditable: isAdmin ? 'true' : 'false',
    suppressContentEditableWarning: true,
    onClick: (e) => e.stopPropagation(),
    onBlur: (e) => {
      let val = e.currentTarget.innerText.trim();
      if (val !== (product[field] || '')) onUpdate(product.id, { [field]: val });
    },
    onKeyDown: (e) => { if (e.key === 'Escape') e.currentTarget.blur(); },
    className: isAdmin ? 'cursor-text focus:outline-none rounded transition-shadow whitespace-pre-wrap' : 'whitespace-pre-wrap',
  });

  // --- Description processing ---
  // Replaces raw newlines to map to our • visual output, or just let users type directly
  const descLines = (product.description || '').split('\n').filter(Boolean);

  const getImageUrl = (path) => {
    if (!path) return path;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
  };

  return (
    <article className="bg-white border border-stone-200 rounded-lg flex flex-col group hover:shadow-md transition-shadow duration-200 relative">

      {/* Image */}
      <div className={`relative w-full bg-stone-100 aspect-square flex items-center justify-center rounded-t-lg ${isAdmin ? 'cursor-pointer' : ''}`} onClick={handleImageClick}>
        {product.image
          ? <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover rounded-t-lg" draggable={false} />
          : <div className="flex flex-col items-center gap-1 text-stone-300 select-none">
              <span className="text-5xl">📦</span>
            </div>
        }
        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handleFileChange} />

        {/* Category chip — top-left overlay */}
        {product.category && !isEditingCategory && (
          <button 
            type="button"
            onClick={(e) => {
              if (!isAdmin) return;
              e.stopPropagation();
              setNewCatData(''); // reset temp state
              setIsEditingCategory(true);
            }} 
            className={`absolute top-1.5 left-1.5 z-10 ${categoryClass} ${isAdmin ? 'cursor-pointer hover:ring-1 hover:ring-kraft-400' : 'cursor-default'} outline-none`}
            title={isAdmin ? "Kategoriyi Değiştir" : ""}
          >
            {product.category}
          </button>
        )}
        
        {/* Inline Category Popover */}
        {isAdmin && isEditingCategory && (
          <div 
            className="absolute top-1.5 left-1.5 z-30 bg-white shadow-xl rounded-lg p-3 w-48 border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-stone-600">Kategori Değiştir</span>
              <button type="button" onClick={() => setIsEditingCategory(false)} className="text-stone-400 hover:text-stone-700 leading-none">×</button>
            </div>
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2 max-h-24 overflow-y-auto">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      onUpdate(product.id, { category: cat });
                      setIsEditingCategory(false);
                    }}
                    className={`px-1.5 py-0.5 text-[9px] rounded-sm font-semibold border ${cat === product.category ? 'bg-kraft-100 text-kraft-800 border-kraft-300' : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-1 mt-2">
              <input 
                type="text" 
                value={newCatData}
                onChange={e => setNewCatData(e.target.value)}
                placeholder="Yeni ekle..."
                className="w-full border border-stone-300 rounded px-1.5 py-1 text-[10px] focus:outline-none focus:border-kraft-400"
                onKeyDown={e => {
                  if (e.key === 'Enter' && newCatData.trim()) {
                    e.preventDefault();
                    onUpdate(product.id, { category: newCatData.trim() });
                    setIsEditingCategory(false);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (newCatData.trim()) {
                    onUpdate(product.id, { category: newCatData.trim() });
                    setIsEditingCategory(false);
                  }
                }}
                className="bg-stone-900 text-white px-2 py-0.5 rounded text-[10px] font-bold hover:bg-stone-700"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-2 py-2 flex flex-col gap-0.5 flex-grow">

        {/* Name — horizontal marquee on overflow */}
        <MarqueeText
          text={product.name}
          textClass={nameClass}
          isAdmin={isAdmin}
          editableProps={isAdmin ? {
            contentEditable: 'true',
            suppressContentEditableWarning: true,
            onBlur: (e) => { const v = e.currentTarget.textContent.trim(); if (v && v !== product.name) onUpdate(product.id, { name: v }); },
            onKeyDown: (e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } },
            className: 'cursor-text focus:outline-none',
          } : {}}
        />

        {/* Description: in-place editable raw text vs bullet view */}
        {isAdmin ? (
          <div
            {...makeEditableMulti('description')}
            className={`w-full px-1 py-0.5 ${descClass} ${CT.descMaxHeight} overflow-y-auto ${makeEditableMulti('description').className}`}
          >
            {product.description || '+ Açıklama ekle'}
          </div>
        ) : descLines.length > 0 ? (
          <DescriptionScroll
            lines={descLines}
            lineClass={descClass}
            maxHeightClass={CT.descMaxHeight}
          />
        ) : null}

        {/* Price */}
        <p {...makeEditable('price')} className={`mt-auto ${priceClass} ${makeEditable('price').className}`}>
          {product.price}
        </p>
      </div>

      {/* Admin: trash button (bottom right) */}
      {isAdmin && (
        <button onClick={handleDeleteClick} className="absolute bottom-1.5 right-1.5 z-20 w-6 h-6 flex items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow" aria-label="Ürünü sil">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </article>
  );
}
