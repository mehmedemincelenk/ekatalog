import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { THEME } from '../../data/config';
import CarouselSlideUnit from './CarouselSlideUnit';
import Button from '../ui/Button';

import * as Lucide from 'lucide-react';

import { HeroCarouselProps } from '../../types';
import { useHeroCarouselFlow } from '../../hooks/useHeroCarouselFlow';

/**
 * HERO CAROUSEL COMPONENT (DIAMOND EDITION)
 * -----------------------------------------------------------
 * Implements a centered 60% hero card flanked by 20% "ghost" previews.
 */
export default function HeroCarousel({ isAdminModeActive }: HeroCarouselProps) {
  const flow = useHeroCarouselFlow(isAdminModeActive);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Diamond Logic: Listen for global add event
  useEffect(() => {
    if (!isAdminModeActive) return;
    const handleGlobalAdd = () => {
      flow.setActiveEditingSlideId(-1);
      fileInputRef.current?.click();
    };
    window.addEventListener('ekatalog:add-carousel-slide', handleGlobalAdd);
    return () => window.removeEventListener('ekatalog:add-carousel-slide', handleGlobalAdd);
  }, [isAdminModeActive, flow]);

  const carouselTheme = THEME.heroCarousel;

  if (flow.loading) return (
    <div className={`${carouselTheme.container} animate-pulse`}>
      <div className={`${carouselTheme.layout} bg-stone-100 flex items-center justify-center`}><div className={carouselTheme.slide.loadingSpinner} /></div>
    </div>
  );

  if (flow.marketingSlides.length === 0 && isAdminModeActive) {
    return (
      <div className="px-6 py-10 fade-in relative flex items-center justify-center border-2 border-dashed border-stone-200 rounded-3xl bg-stone-50/50">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 italic">
          HENÜZ AFİŞ EKLENMEMİŞ
        </p>
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={(e) => { flow.setActiveEditingSlideId(-1); flow.handleFileUploadAction(e); }} 
        />
      </div>
    );
  }

  if (flow.marketingSlides.length === 0) return null;

  return (
    <div className={carouselTheme.container}>
      {/* HIDDEN INPUT FOR GLOBAL ADD */}
      <input 
        ref={fileInputRef}
        type="file" 
        className="hidden" 
        accept="image/*"
        onChange={(e) => { 
          flow.setActiveEditingSlideId(-1); 
          flow.handleFileUploadAction(e); 
        }} 
      />

      <div className={carouselTheme.layout}>
        {/* LOCALIZED LOADING & SUCCESS OVERLAY */}
        {(flow.isAssetUploading || flow.uploadSuccess) && (
          <div className={`${carouselTheme.slide.overlay} absolute inset-0 z-[70] flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm animate-in fade-in duration-500`}>
            {flow.isAssetUploading ? (
              <div className={`${carouselTheme.slide.loadingSpinner}`}></div>
            ) : (
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                <Lucide.Check size={28} className="text-white" strokeWidth={3} />
              </div>
            )}
          </div>
        )}
        <motion.div
          drag={isAdminModeActive ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={flow.handleDragEnd}
          className="flex w-full h-full touch-pan-y"
          animate={{ x: `-${flow.currentIndex * 100}%` }}
          transition={flow.isTransitioning ? { duration: 0.7, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
          onAnimationComplete={() => flow.setIsTransitioning(false)}
        >
          {flow.marketingSlides.map((slideItem, index) => (
            <div key={index} className="relative w-full h-full shrink-0">
              <CarouselSlideUnit
                slideData={slideItem}
                isCurrentlyActive={index === flow.currentIndex}
                isAdmin={isAdminModeActive}
                isCurrentlyUploading={flow.isAssetUploading}
                currentIndex={index}
                totalSlides={flow.marketingSlides.length}
                editingTargetSlideId={flow.activeEditingSlideId}
                onOrderChange={(newPos) => flow.reorderSlides(slideItem.id, newPos)}
                onUpload={(e) => {
                  flow.setActiveEditingSlideId(slideItem.id);
                  flow.handleFileUploadAction(e);
                }}
                onDeleteTrigger={flow.deleteSlide}
              />
            </div>
          ))}
        </motion.div>

        {flow.marketingSlides.length > 1 && (
          <>
            {/* NAVIGATION BUTTONS (DIAMOND BLACK GLASS EDITION) */}
            <div className="absolute inset-y-0 left-2 z-50 flex items-center">
              <Button
                variant="glass"
                mode="square"
                className="!w-10 !h-10 !bg-stone-900/60 backdrop-blur-md border-white/20 hover:!bg-stone-900/80 text-white shadow-2xl transition-all active:scale-90 !rounded-lg"
                icon={<Lucide.ChevronLeft size={24} strokeWidth={2.5} />}
                onClick={flow.handlePrev}
              />
            </div>
            <div className="absolute inset-y-0 right-2 z-50 flex items-center">
              <Button
                variant="glass"
                mode="square"
                className="!w-10 !h-10 !bg-stone-900/60 backdrop-blur-md border-white/20 hover:!bg-stone-900/80 text-white shadow-2xl transition-all active:scale-90 !rounded-lg"
                icon={<Lucide.ChevronRight size={24} strokeWidth={2.5} />}
                onClick={flow.handleNext}
              />
            </div>

            <div className={carouselTheme.navigation.dotsWrapper}>
              {flow.marketingSlides.map((_, dotIndex) => (
                <div key={dotIndex} onClick={() => { flow.setIsTransitioning(true); flow.setCurrentIndex(dotIndex); }}
                  className={`${carouselTheme.navigation.dotBase} ${flow.currentIndex === dotIndex ? carouselTheme.navigation.dotActive : carouselTheme.navigation.dotInactive}`} />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
