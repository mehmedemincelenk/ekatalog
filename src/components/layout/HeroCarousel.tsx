import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { THEME } from '../../data/config';
import CarouselSlideUnit from './CarouselSlideUnit';

import * as Lucide from 'lucide-react';

import { HeroCarouselProps } from '../../types';
import { useHeroCarouselFlow } from '../../hooks/useHeroCarouselFlow';

/**
 * HERO CAROUSEL COMPONENT (DIAMOND EDITION)
 * -----------------------------------------------------------
 * Implements a centered 60% hero card flanked by 20% "ghost" previews.
 */
export default function HeroCarousel({
  isAdminModeActive,
  isStatic = false,
}: HeroCarouselProps & { isStatic?: boolean }) {
  const flow = useHeroCarouselFlow(isAdminModeActive);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStatic) {
      flow.setIsPaused(true);
    }
  }, [isStatic, flow.setIsPaused]);

  const [activeHeight, setActiveHeight] = useState<number | 'auto'>('auto');
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [direction, setDirection] = useState(1);
  const prevIndexRef = useRef(flow.currentIndex);

  // Viewport & Tab Visibility Observer (High-Fidelity Engine Optimization)
  useEffect(() => {
    const el = containerRef.current;
    if (!el || isAdminModeActive || flow.marketingSlides.length === 0) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        flow.setIsPaused(true);
      } else {
        const rect = el.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;
        flow.setIsPaused(!isInView);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        flow.setIsPaused(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(el);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial immediate check on mount
    const rect = el.getBoundingClientRect();
    const isInView = rect.top < window.innerHeight && rect.bottom > 0;
    flow.setIsPaused(!isInView);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [flow.setIsPaused, isAdminModeActive, flow.marketingSlides.length]);

  useEffect(() => {
    if (flow.marketingSlides.length === 0) return;
    if (flow.currentIndex !== prevIndexRef.current) {
      const total = flow.marketingSlides.length;
      const prev = prevIndexRef.current;
      const curr = flow.currentIndex;

      let dir = 1;
      if (curr === 0 && prev === total - 1) {
        dir = 1;
      } else if (curr === total - 1 && prev === 0) {
        dir = -1;
      } else if (curr > prev) {
        dir = 1;
      } else {
        dir = -1;
      }
      setDirection(dir);
      prevIndexRef.current = curr;
    }
  }, [flow.currentIndex, flow.marketingSlides.length]);

  // Smooth Height Auto-Optimizer (Diamond Edition)
  useEffect(() => {
    const el = slideRefs.current[flow.currentIndex];
    if (!el || flow.marketingSlides.length === 0) return;

    // Monitor size modifications natively for seamless adjustment (lazy-loaded images, resizing)
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const height = entry.target.getBoundingClientRect().height;
        if (height > 0) {
          setActiveHeight(height);
        }
      }
    });

    resizeObserver.observe(el);

    const initialHeight = el.getBoundingClientRect().height;
    if (initialHeight > 0) {
      setActiveHeight(initialHeight);
    }

    return () => resizeObserver.disconnect();
  }, [flow.currentIndex, flow.marketingSlides]);

  // Diamond Logic: Listen for global add event
  useEffect(() => {
    if (!isAdminModeActive) return;
    const handleGlobalAdd = () => {
      flow.setActiveEditingSlideId(-1);
      fileInputRef.current?.click();
    };
    window.addEventListener('ekatalog:add-carousel-slide', handleGlobalAdd);
    return () =>
      window.removeEventListener(
        'ekatalog:add-carousel-slide',
        handleGlobalAdd,
      );
  }, [isAdminModeActive, flow]);

  const carouselTheme = THEME.heroCarousel;

  if (flow.loading)
    return (
      <div className={`${carouselTheme.container} animate-pulse`}>
        <div
          className={`${carouselTheme.layout} bg-stone-100 flex items-center justify-center`}
        >
          <div className={carouselTheme.slide.loadingSpinner} />
        </div>
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
          multiple
          onChange={(e) => {
            flow.setActiveEditingSlideId(-1);
            flow.handleFileUploadAction(e);
          }}
        />
      </div>
    );
  }

  if (flow.marketingSlides.length === 0) return null;

  return (
    <div ref={containerRef} className={carouselTheme.container}>
      {/* HIDDEN INPUT FOR GLOBAL ADD */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        multiple
        onChange={(e) => {
          flow.setActiveEditingSlideId(-1);
          flow.handleFileUploadAction(e);
        }}
      />

      <motion.div
        className={`${carouselTheme.layout} rounded-none`}
        animate={{ height: activeHeight }}
        transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
        style={{ overflow: 'hidden', isolation: 'isolate' }}
      >
        {/* LOCALIZED LOADING & SUCCESS OVERLAY */}
        {(flow.isAssetUploading || flow.uploadSuccess) && (
          <div
            className={`${carouselTheme.slide.overlay} absolute inset-0 z-[70] flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm animate-in fade-in duration-500`}
          >
            {flow.isAssetUploading ? (
              <div className={`${carouselTheme.slide.loadingSpinner}`}></div>
            ) : (
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                <Lucide.Check
                  size={28}
                  className="text-white"
                  strokeWidth={3}
                />
              </div>
            )}
          </div>
        )}

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={flow.currentIndex}
            drag={isAdminModeActive ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              const swipeThreshold = 50;
              if (info.offset.x < -swipeThreshold) {
                flow.handleNext();
              } else if (info.offset.x > swipeThreshold) {
                flow.handlePrev();
              }
            }}
            initial={{
              x: direction === 1 ? '100%' : '-100%',
              filter: 'blur(8px)',
              opacity: 0,
            }}
            animate={{
              x: '0%',
              filter: 'blur(0px)',
              opacity: 1,
            }}
            exit={{
              x: direction === 1 ? '-100%' : '100%',
              filter: 'blur(8px)',
              opacity: 0,
            }}
            transition={{
              x: { type: 'spring', stiffness: 450, damping: 42, mass: 0.8 },
              filter: { duration: 0.22, ease: 'easeOut' },
              opacity: { duration: 0.22, ease: 'easeInOut' },
            }}
            className="w-full relative touch-pan-y"
            ref={(el) => {
              slideRefs.current[flow.currentIndex] = el;
            }}
          >
            <CarouselSlideUnit
              slideData={flow.marketingSlides[flow.currentIndex]}
              isCurrentlyActive={true}
              isAdmin={isAdminModeActive}
              isCurrentlyUploading={flow.isAssetUploading}
              currentIndex={flow.currentIndex}
              totalSlides={flow.marketingSlides.length}
              editingTargetSlideId={flow.activeEditingSlideId}
              onOrderChange={(newPos) =>
                flow.reorderSlides(
                  flow.marketingSlides[flow.currentIndex].id,
                  newPos,
                )
              }
              onUpload={(e) => {
                flow.setActiveEditingSlideId(
                  flow.marketingSlides[flow.currentIndex].id,
                );
                flow.handleFileUploadAction(e);
              }}
              onDeleteTrigger={flow.deleteSlide}
            />
          </motion.div>
        </AnimatePresence>

        {flow.marketingSlides.length > 1 && (
          <>
            {/* Split-Click Navigation Overlays (Story Mode) */}
            <>
              <div
                onClick={flow.handlePrev}
                className="absolute left-0 top-[60px] bottom-0 w-1/2 z-[100] cursor-pointer"
                title="Önceki Görsel"
              />
              <div
                onClick={flow.handleNext}
                className="absolute right-0 top-[60px] bottom-0 w-1/2 z-[100] cursor-pointer"
                title="Sonraki Görsel"
              />
            </>

            {/* Instagram Stories Style Top Indicators (Instagram Perfection) */}
            <div className="absolute top-4 left-3.5 right-3.5 z-50 flex gap-1 pointer-events-auto">
              {flow.marketingSlides.map((_, dotIndex) => {
                const isActive = flow.currentIndex === dotIndex;
                const isCompleted = dotIndex < flow.currentIndex;

                return (
                  <div
                    key={dotIndex}
                    onClick={() => {
                      flow.setIsTransitioning(true);
                      flow.setCurrentIndex(dotIndex);
                    }}
                    className="h-[2px] w-full rounded-full cursor-pointer bg-white/20 relative overflow-hidden"
                  >
                    {/* Active dynamic progress bar */}
                    {isActive ? (
                      <motion.div
                        key={`${flow.currentIndex}-${flow.isPaused}`} // Re-mount and reset on index or pause state change
                        initial={{ width: '0%' }}
                        animate={{ width: flow.isPaused ? '0%' : '100%' }}
                        transition={{
                          duration: flow.isPaused ? 0 : 6,
                          ease: 'linear',
                        }}
                        className="absolute inset-y-0 left-0 bg-white"
                      />
                    ) : isCompleted ? (
                      <div className="absolute inset-0 bg-white" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
