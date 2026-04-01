import { useState, useEffect, useCallback, useRef } from 'react';
import { CAROUSEL } from '../data/config';
import { useCarousel } from '../hooks/useCarousel';

export default function HeroCarousel({ isAdmin }) {
  const { slides, updateSlide } = useCarousel();
  const fileInputRef = useRef(null);
  const [editingSlideId, setEditingSlideId] = useState(null);

  const { 
    intervalMs, swipeThreshold, roundedClass,
    heightMobile, heightTablet, heightPC, containerWidth, containerPadding, containerMargin,
    dotPosition, dotGap, dotSize, dotActive, dotInactive,
    boxPositionMobile, boxPositionPC, boxWidthMobile, boxWidthPC, boxPaddingMobile, boxPaddingPC, boxRounding, boxBg, boxBorder, boxShadow,
    titleSizeMobile, titleSizePC, titleWeight, titleColor, titleTracking, titleShadow,
    subSizeMobile, subSizePC, subWeight, subColor, subLeading, subShadow
  } = CAROUSEL;
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
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file || !editingSlideId) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
              updateSlide(editingSlideId, { src: ev.target.result });
              setEditingSlideId(null);
            };
            reader.readAsDataURL(file);
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
