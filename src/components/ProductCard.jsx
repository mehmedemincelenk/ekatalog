import { useRef, useState, useEffect } from 'react';
import { CARD_TYPOGRAPHY as CT, CARD_LAYOUT as CL } from '../data/config';

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
    const check = () => setOverflow(el.scrollWidth > el.clientWidth + CL.marqueeTolerance);
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
    const check = () => setOverflow(el.scrollHeight > el.clientHeight + CL.marqueeTolerance);
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
  const cardRef = useRef(null);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [newCatData, setNewCatData] = useState('');
  const [showActions, setShowActions] = useState(false);

  // --- Drag & Click-Away State ---
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Reset drag position explicitly when popover opens
  useEffect(() => {
    if (isEditingCategory) setDragPos({ x: 0, y: 0 });
  }, [isEditingCategory]);

  // Exterior Bound Click-Away Listener Handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Validate click exists and falls entirely outside the current card wrapper ref container
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setIsEditingCategory(false);
        setShowActions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Frame Interpolation Handlers for Drag Movement
  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      setDragPos({
        x: clientX - dragStartRef.current.x,
        y: clientY - dragStartRef.current.y
      });
    };
    const handleEnd = () => setIsDragging(false);

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", handleEnd);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging]);

  const handleDragStart = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = { x: clientX - dragPos.x, y: clientY - dragPos.y };
  };

  // --- Delete ---
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) onDelete(product.id);
  };

  // --- Image ---
  const handleImageClick = () => { if (isAdmin) fileInputRef.current?.click(); };
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { compressImage } = await import('../utils/image.js');
      const compressedStr = await compressImage(file, 600, 0.7);
      onUpdate(product.id, { image: compressedStr });
    } catch (error) {
      alert("Fotoğraf işlenirken cihaz desteklemedi veya hata oluştu.");
    }
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
    <article ref={cardRef} className={`bg-white border ${product.inStock === false ? 'border-transparent bg-stone-50' : 'border-stone-200'} rounded-lg flex flex-col group hover:shadow-md transition-shadow duration-200 relative`}>

      {/* Image */}
      <div className={`relative w-full bg-stone-100 aspect-square flex items-center justify-center rounded-t-lg ${isAdmin ? 'cursor-pointer' : ''}`} onClick={handleImageClick}>
        {product.image
          ? <img src={getImageUrl(product.image)} alt={product.name} className={`w-full h-full object-cover rounded-t-lg transition-all duration-300 ${product.inStock === false ? 'grayscale opacity-60' : ''}`} draggable={false} />
          : <div className={`flex flex-col items-center gap-1 text-stone-300 select-none transition-all duration-300 ${product.inStock === false ? 'grayscale opacity-60' : ''}`}>
              <span className="text-5xl">📦</span>
            </div>
        }
        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handleFileChange} />

        {/* Category chip — top-left overlay (Yalnızca Admin Görebilir) */}
        {isAdmin && !isEditingCategory && (
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setNewCatData(''); // reset temp state
              setIsEditingCategory(true);
            }} 
            className={`absolute top-1.5 left-1.5 z-10 ${categoryClass} cursor-pointer hover:ring-1 hover:ring-kraft-400 outline-none ${!product.category ? 'border-dashed border-red-300 bg-red-50 text-red-600' : ''} transition-all duration-300 ${product.inStock === false ? 'grayscale opacity-60' : ''}`}
            title="Kategoriyi Değiştir"
          >
            {product.category || 'KATEGORİSİZ'}
          </button>
        )}
        
        {/* Category chip — Popover Menu (Centered over Image + Draggable) */}
        {isAdmin && isEditingCategory && (
          <div 
            style={{ transform: `translate(calc(-50% + ${dragPos.x}px), ${dragPos.y}px)` }}
            className={`absolute ${CL.catPopoverOffsetTop} left-1/2 z-50 bg-white border border-stone-200 rounded-lg ${CL.catPopoverWidth} flex flex-col items-stretch overflow-hidden origin-top ${isDragging ? 'shadow-3xl ring-2 ring-kraft-200 opacity-95 transition-none' : 'shadow-2xl transition-transform duration-75'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="flex justify-between items-center mb-2 p-3 pb-0 cursor-move bg-stone-50 active:bg-stone-100 touch-none"
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
            >
              <div className={`flex items-center ${CL.gapSmall} pointer-events-none select-none`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`${CL.iconTiny} text-stone-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                <span className="text-[10px] font-bold text-stone-600">Kategori</span>
              </div>
              <button type="button" onClick={() => setIsEditingCategory(false)} className="text-stone-400 hover:text-stone-700 leading-none">×</button>
            </div>
            <div className="p-3 pt-1 bg-white">
              {categories.length > 0 && (
                <div className={`flex flex-wrap gap-1 mb-2 ${CL.catPopoverListMaxH} overflow-y-auto`}>
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
          </div>
        )}
      </div>

      {/* Info */}
      <div className={`${CL.cardInfoPadding} flex flex-col gap-0.5 flex-grow`}>

        {/* Name — horizontal marquee on overflow */}
        <MarqueeText
          text={product.name}
          textClass={`${nameClass} transition-all duration-300 ${product.inStock === false ? 'opacity-60 text-stone-500' : ''}`}
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
        <div className="mt-auto">
          <p {...makeEditable('price')} className={`${priceClass} transition-all duration-300 ${makeEditable('price').className} ${product.inStock === false && !isAdmin ? 'line-through opacity-60 text-stone-500' : ''}`}>
            {product.price}
          </p>
        </div>
      </div>

      {/* Admin 3-Dots Action Menu (Absolute Bottom Right) */}
      {isAdmin && (
        <>
          <div className={`absolute ${CL.actionMenuAnchorB} ${CL.actionMenuAnchorR} z-20`}>
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowActions(!showActions); }} 
              className={`${CL.iconSmall} flex items-center justify-center rounded-full transition-colors ${showActions ? 'bg-stone-200 text-stone-900' : 'bg-transparent text-stone-300 hover:bg-stone-100 hover:text-stone-700'}`}
              aria-label="Aksiyon Menüsü"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
              </svg>
            </button>
          </div>
          
          {/* Actions Popover (Icons Only) Centered in Article */}
          {showActions && (
            <div 
              className={`absolute ${CL.actionPopoverOffsetB} left-1/2 -translate-x-1/2 z-40 bg-white border border-stone-200 rounded-full shadow-2xl px-1.5 py-1.5 flex items-center ${CL.gapSmall} origin-bottom`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Stock Toggle (Empty Set Character) */}
              <button 
                type="button"
                onClick={() => { onUpdate(product.id, { inStock: product.inStock === false ? true : false }); setShowActions(false); }}
                className={`${CL.iconMedium} flex items-center justify-center rounded-full transition-colors ${product.inStock === false ? 'bg-stone-900 text-white' : 'bg-transparent text-stone-400 hover:bg-stone-100 hover:text-stone-700'}`}
                title={product.inStock === false ? "Stok Tasarrufu (Stoğa Ekle)" : "Stok Tükendi Olarak İşaretle"}
              >
                <span className="text-xl font-light leading-none -mt-0.5">∅</span>
              </button>

              {/* Archive Toggle (Archive Box SVG) */}
              <button 
                type="button"
                onClick={() => { onUpdate(product.id, { isArchived: !product.isArchived }); setShowActions(false); }}
                className={`${CL.iconMedium} flex items-center justify-center rounded-full transition-colors ${product.isArchived ? 'bg-stone-900 text-white' : 'bg-transparent text-stone-400 hover:bg-stone-100 hover:text-stone-700'}`}
                title={product.isArchived ? "Arşivden Çıkar" : "Arşive Al"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </button>

              <div className="w-px h-4 bg-stone-200 mx-0.5"></div>

              {/* Delete Button (Trash) */}
              <button 
                type="button"
                onClick={(e) => { setShowActions(false); handleDeleteClick(e); }}
                className={`${CL.iconMedium} flex items-center justify-center rounded-full bg-transparent text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors`}
                title="Kalıcı Olarak Sil"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}

      {/* Status Overlays (Archived / Out of Stock) */}
      <div className={`absolute inset-0 z-[5] pointer-events-none rounded-lg flex items-center justify-center ${CL.gapSmall}`}>
        
        {/* Out of Stock Icon */}
        {product.inStock === false && (
          <button 
            type="button"
            onClick={(e) => {
              if (isAdmin) { e.stopPropagation(); onUpdate(product.id, { inStock: true }); }
            }}
            className={`bg-stone-900/90 text-white ${CL.iconOverlay} rounded-full shadow-xl flex items-center justify-center -translate-y-4 ${isAdmin ? 'pointer-events-auto cursor-pointer hover:bg-stone-900 hover:scale-105 transition-transform' : 'pointer-events-none'}`} 
            title={isAdmin ? "Stoka geri ekle" : "Stok Tükendi"}
          >
            <span className="text-xl font-light leading-none">∅</span>
          </button>
        )}

        {/* Admin Archived Icon */}
        {isAdmin && product.isArchived && (
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onUpdate(product.id, { isArchived: false }); }}
            className={`bg-stone-900/90 text-white ${CL.iconOverlay} rounded-full shadow-xl flex items-center justify-center border border-dashed border-stone-400/50 -translate-y-4 pointer-events-auto cursor-pointer hover:bg-stone-900 hover:scale-105 transition-transform`} 
            title="Arşivden Çıkar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={CL.iconOverlaySvg}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </button>
        )}

      </div>
    </article>
  );
}
