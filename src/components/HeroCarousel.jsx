import { useState, useEffect, useCallback, useRef } from 'react';
import { DEFAULT_CAROUSEL } from '../data/config';
import { useCarousel } from '../hooks/useCarousel';

export default function HeroCarousel({ isAdmin, settings }) {
  const { slides, updateSlide } = useCarousel('demo');
  const fileInputRef = useRef(null);
  const [editingSlideId, setEditingSlideId] = useState(null);

  const { 
    intervalMs = 5000, swipeThreshold = 50, roundedClass = 'rounded-md',
    heightMobile = 'h-64', heightTablet = 'sm:h-80', heightPC = 'lg:h-96', 
    containerWidth = 'mx-auto max-w-7xl', containerPadding = 'px-4 sm:px-6 lg:px-8', containerMargin = 'mt-4',
    dotPosition = 'bottom-3', dotGap = 'gap-1.5', dotSize = 'w-2 h-2', dotActive = 'bg-white scale-125', dotInactive = 'bg-white/50',
    boxPositionMobile = 'bottom-8 left-2', boxPositionPC = 'sm:bottom-10 sm:left-6', 
    boxWidthMobile = 'max-w-[60%]', boxWidthPC = 'sm:max-w-md', 
    boxPaddingMobile = 'p-2', boxPaddingPC = 'sm:p-5', 
    boxRounding = 'rounded-md', boxBg = 'bg-black/25 backdrop-blur-md', boxBorder = 'border border-white/20', boxShadow = 'shadow-2xl',
    titleSizeMobile = 'text-[14px]', titleSizePC = 'sm:text-xl lg:text-2xl', titleWeight = 'font-extrabold', titleColor = 'text-white', titleTracking = 'tracking-tight', titleShadow = 'drop-shadow',
    subSizeMobile = 'text-[10px]', subSizePC = 'text-[12px]', subWeight = 'font-medium', subColor = 'text-white/90', subLeading = 'leading-none', subShadow = 'drop-shadow'
  } = DEFAULT_CAROUSEL;
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > swipeThreshold) next();
    if (distance < -swipeThreshold) prev();
    setTouchStart(0);
    setTouchEnd(0);
  };

  const getImageUrl = (path) => {
    if (!path) return path;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
  };

  useEffect(() => {
    if (isAdmin) return; // Admin modunda düzenleme sekteye uğramasın diye zamanlayıcı durdurulur
    const timer = setInterval(next, intervalMs);
    return () => clearInterval(timer);
  }, [next, intervalMs, isAdmin]);

  return (
    <div className={`relative w-full ${heightMobile} ${heightTablet} ${heightPC} overflow-hidden ${containerWidth} ${containerPadding} ${containerMargin}`}>
      <div 
        className={`relative w-full h-full overflow-hidden ${roundedClass}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === activeIndex ? 'opacity-100' : 'opacity-0'
            } ${slide.bg}`}
          >
            {slide.src ? (
              <img
                src={getImageUrl(slide.src)}
                alt={slide.label}
                className={`absolute inset-0 w-full h-full object-cover ${isAdmin ? 'cursor-pointer' : ''}`}
                onClick={() => {
                  if (isAdmin) {
                    setEditingSlideId(slide.id);
                    fileInputRef.current?.click();
                  }
                }}
              />
            ) : (
               <div 
                 className={`absolute inset-0 w-full h-full bg-stone-200 ${isAdmin ? 'cursor-pointer' : ''}`}
                 onClick={() => {
                  if (isAdmin) {
                    setEditingSlideId(slide.id);
                    fileInputRef.current?.click();
                  }
                }}
               ></div>
            )}
            
            {/* Glassmorphism Text Box (Sol Alt) */}
            <div className={`absolute z-20 ${boxPositionMobile} ${boxPositionPC} ${boxWidthMobile} ${boxWidthPC} ${boxPaddingMobile} ${boxPaddingPC} ${boxRounding} ${boxBg} ${boxBorder} ${boxShadow}`}>
              <h2 
                className={`${titleColor} ${titleSizeMobile} ${titleSizePC} ${titleWeight} ${titleTracking} ${titleShadow} ${isAdmin ? 'cursor-text focus:outline-none rounded px-1' : ''}`}
                contentEditable={isAdmin}
                suppressContentEditableWarning
                onBlur={(e) => {
                  const val = e.currentTarget.textContent.trim();
                  if (val && val !== slide.label) updateSlide(slide.id, { label: val });
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
              >
                {slide.label}
              </h2>
              <p 
                className={`${subColor} ${subSizeMobile} ${subSizePC} ${subWeight} ${subShadow} ${subLeading} ${isAdmin ? 'cursor-text focus:outline-none rounded px-1' : ''}`}
                contentEditable={isAdmin}
                suppressContentEditableWarning
                onBlur={(e) => {
                  const val = e.currentTarget.textContent.trim();
                  if (val !== slide.sub) updateSlide(slide.id, { sub: val });
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
              >
                {slide.sub}
              </p>
            </div>
          </div>
        ))}

        <input 
          ref={fileInputRef} 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file || !editingSlideId) return;
            try {
              const { compressImage } = await import('../utils/image.js');
              const compressedStr = await compressImage(file, 1200, 0.7);
              updateSlide(editingSlideId, { src: compressedStr });
              setEditingSlideId(null);
            } catch (err) {
              alert("Slayt fotoğrafı işlenemedi.");
            }
            e.target.value = '';
          }} 
        />

        {/* Dot indicators */}
        <div className={`absolute ${dotPosition} left-1/2 -translate-x-1/2 flex ${dotGap} z-10`}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`${dotSize} rounded-full transition-all duration-300 ${
                i === activeIndex ? dotActive : dotInactive
              }`}
              aria-label={`Slayt ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
