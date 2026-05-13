import { useStore } from '../../store';
import { useState, useEffect, useCallback } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { THEME, CAROUSEL, TECH } from '../../data/config';
import { supabase } from '../../supabase';
import { getActiveStoreSlug, reorderArray } from '../../utils/core';
import CarouselSlideUnit from './CarouselSlideUnit';
import Button from '../ui/Button';
import PlusPlaceholder from '../ui/PlusPlaceholder';

import * as Lucide from 'lucide-react';

import { HeroCarouselProps, CarouselSlide } from '../../types';

const INTERVAL_MS = 6000;
const SWIPE_THRESHOLD = 50;

/**
 * HERO CAROUSEL COMPONENT (DIAMOND EDITION)
 * -----------------------------------------------------------
 * Implements a centered 60% hero card flanked by 20% "ghost" previews.
 */
export default function HeroCarousel({ isAdminModeActive }: HeroCarouselProps) {
  const { showFeedback } = useStore();
  const [marketingSlides, setMarketingSlides] = useState<CarouselSlide[]>(CAROUSEL.slides);
  const [loading, setLoading] = useState(true);
  const activeStoreSlug = getActiveStoreSlug();

  const persistCarouselData = useCallback(async (updatedSlides: CarouselSlide[]) => {
    if (!isAdminModeActive) return;
    try {
      const { error } = await supabase.from('stores').update({
        carousel_data: { slides: updatedSlides },
      }).eq('slug', activeStoreSlug);
      if (error) throw error;
    } catch (err) { console.error('Carousel sync failed:', err); }
  }, [isAdminModeActive, activeStoreSlug]);

  const reorderSlides = useCallback(async (slideId: number, newPosition: number) => {
    setMarketingSlides((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === slideId);
      if (oldIndex === -1) return prev;
      const updated = reorderArray(prev, oldIndex, newPosition);
      persistCarouselData(updated);
      return updated;
    });
    // Slayt geçişini biraz geciktirerek state'in oturmasını sağla
    setTimeout(() => setCurrentIndex(newPosition), 100);
  }, [persistCarouselData]);

  const synchronizeCarouselSlides = useCallback(async () => {
    setLoading(true);
    const { data: storeData, error: fetchError } = await supabase.from('stores').select('carousel_data').eq('slug', activeStoreSlug).single();
    if (storeData && !fetchError && storeData.carousel_data?.slides) {
      setMarketingSlides(storeData.carousel_data.slides);
    }
    setLoading(false);
  }, [activeStoreSlug]);

  useEffect(() => { synchronizeCarouselSlides(); }, [synchronizeCarouselSlides]);

  const modifySlideContent = useCallback(async (slideId: number, contentChanges: Partial<CarouselSlide>) => {
    setMarketingSlides((prev) => {
      const updated = prev.map((s) => s.id === slideId ? { ...s, ...contentChanges } : s);
      persistCarouselData(updated);
      return updated;
    });
  }, [persistCarouselData]);

  const uploadHeroImage = useCallback(async (slideId: number, visualFile: File) => {
    try {
      const { processDualQualityVisuals } = await import('../../utils/image');
      const { hq: optimizedVisual } = await processDualQualityVisuals(visualFile, TECH.storage.heroWidth);
      const visualFileName = `hero-${activeStoreSlug}-${slideId === -1 ? 'new' : slideId}-${Date.now()}.jpg`;
      const storagePath = `${TECH.storage.heroFolder}/${visualFileName}`;
      const { error } = await supabase.storage.from(TECH.storage.bucket).upload(storagePath, optimizedVisual, { upsert: true, cacheControl: TECH.storage.cacheControl });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from(TECH.storage.bucket).getPublicUrl(storagePath);
      const finalizedUrl = `${publicUrl}?t=${Date.now()}`;
      
      if (slideId !== -1) {
        await modifySlideContent(slideId, { src: finalizedUrl });
      }
      return finalizedUrl;
    } catch (err) { console.error('Hero upload failed:', err); throw err; }
  }, [activeStoreSlug, modifySlideContent]);

  const deleteSlide = useCallback(async (slideId: number) => {
    setMarketingSlides((prev) => {
      const updated = prev.filter((s) => s.id !== slideId);
      persistCarouselData(updated);
      return updated;
    });
  }, [persistCarouselData]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAssetUploading, setIsAssetUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [activeEditingSlideId, setActiveEditingSlideId] = useState<number | null>(null);
  
  const carouselTheme = THEME.heroCarousel;

  const handleNext = useCallback(() => {
    if (marketingSlides.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % marketingSlides.length);
  }, [marketingSlides.length]);

  const handlePrev = useCallback(() => {
    if (marketingSlides.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + marketingSlides.length) % marketingSlides.length);
  }, [marketingSlides.length]);

  useEffect(() => {
    if (isAdminModeActive || isAssetUploading || marketingSlides.length <= 1) return;
    const scrollTimer = setInterval(handleNext, INTERVAL_MS);
    return () => clearInterval(scrollTimer);
  }, [handleNext, isAdminModeActive, isAssetUploading, marketingSlides.length]);

  const handleFileUploadAction = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || activeEditingSlideId === null) return;
    
    try {
      setIsAssetUploading(true);
      
      if (activeEditingSlideId === -1) {
        const uploadedUrl = await uploadHeroImage(-1, file);
        
        setMarketingSlides((prev) => {
          const currentRealSlides = (prev || []).filter(s => s && s.src && s.src !== '');
          const nextId = currentRealSlides.length > 0 ? Math.max(...currentRealSlides.map((s) => s.id)) + 1 : 1;
          const newSlide: CarouselSlide = { id: nextId, src: uploadedUrl, bg: 'bg-stone-200', label: 'Yeni Afiş', sub: 'Düzenlemek için tıklayın.' };
          const updatedSlides = [...currentRealSlides, newSlide];
          persistCarouselData(updatedSlides);
          
          // Anında yeni slayta odaklan
          setTimeout(() => setCurrentIndex(updatedSlides.length - 1), 50);
          
          return updatedSlides;
        });
      } else {
        await uploadHeroImage(activeEditingSlideId, file);
      }
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 1500);
    } catch (err) {
      console.error('Hero upload error:', err);
      showFeedback('error', 'İşlem başarısız oldu.');
    } finally {
      setIsAssetUploading(false);
      setActiveEditingSlideId(null);
      if (event.target) event.target.value = '';
    }
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (isAdminModeActive || marketingSlides.length <= 1) return;
    if (info.offset.x < -SWIPE_THRESHOLD) handleNext();
    else if (info.offset.x > SWIPE_THRESHOLD) handlePrev();
  };

  if (loading) return (
    <div className={`${carouselTheme.container} animate-pulse`}>
      <div className={`${carouselTheme.layout} bg-stone-100 flex items-center justify-center`}><div className={carouselTheme.slide.loadingSpinner} /></div>
    </div>
  );

  if (marketingSlides.length === 0 && isAdminModeActive) {
    return (
      <div className="px-6 py-10 fade-in relative">
        <PlusPlaceholder type="CAROUSEL" onClick={() => {}} />
        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" accept="image/*" 
          onChange={(e) => { setActiveEditingSlideId(-1); handleFileUploadAction(e); }} />
      </div>
    );
  }

  if (marketingSlides.length === 0) return null;

  return (
    <div className={carouselTheme.container}>
      <div className={carouselTheme.layout}>
        {/* LOCALIZED LOADING & SUCCESS OVERLAY */}
        {(isAssetUploading || uploadSuccess) && (
          <div className={`${carouselTheme.slide.overlay} absolute inset-0 z-[70] flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm animate-in fade-in duration-500`}>
            {isAssetUploading ? (
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
          onDragEnd={handleDragEnd}
          className="flex w-full h-full touch-pan-y"
          animate={{ x: `-${currentIndex * 100}%` }}
          transition={isTransitioning ? { duration: 0.7, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
          onAnimationComplete={() => setIsTransitioning(false)}
        >
          {marketingSlides.map((slideItem, index) => (
            <div key={index} className="relative w-full h-full shrink-0">
              <CarouselSlideUnit
                slideData={slideItem}
                isCurrentlyActive={index === currentIndex}
                isAdmin={isAdminModeActive}
                isCurrentlyUploading={isAssetUploading}
                currentIndex={index}
                totalSlides={marketingSlides.length}
                editingTargetSlideId={activeEditingSlideId}
                onOrderChange={(newPos) => reorderSlides(slideItem.id, newPos)}
                onUpload={(e) => {
                  setActiveEditingSlideId(slideItem.id);
                  handleFileUploadAction(e);
                }}
                onDeleteTrigger={deleteSlide}
              />
            </div>
          ))}
        </motion.div>

        {marketingSlides.length > 1 && (
          <>
            {/* NAVIGATION BUTTONS (DIAMOND BLACK GLASS EDITION) */}
            <div className="absolute inset-y-0 left-2 z-50 flex items-center">
              <Button
                variant="glass"
                mode="circle"
                className="!w-10 !h-10 !bg-stone-900/60 backdrop-blur-md border-white/20 hover:!bg-stone-900/80 text-white shadow-2xl transition-all active:scale-90"
                icon={<Lucide.ChevronLeft size={24} strokeWidth={2.5} />}
                onClick={handlePrev}
              />
            </div>
            <div className="absolute inset-y-0 right-2 z-50 flex items-center">
              <Button
                variant="glass"
                mode="circle"
                className="!w-10 !h-10 !bg-stone-900/60 backdrop-blur-md border-white/20 hover:!bg-stone-900/80 text-white shadow-2xl transition-all active:scale-90"
                icon={<Lucide.ChevronRight size={24} strokeWidth={2.5} />}
                onClick={handleNext}
              />
            </div>

            <div className={carouselTheme.navigation.dotsWrapper}>
              {/* ADMIN: ADD BUTTON ABOVE DOTS */}
              {isAdminModeActive && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-[100]">
                  <div className="relative group/add">
                    <Button 
                      variant="glass" 
                      mode="rectangle" 
                      className="h-10 px-4 shadow-2xl border border-white/20 !bg-stone-900/60 backdrop-blur-xl gap-2 min-w-[120px] !rounded-lg"
                      icon={<Lucide.Plus size={16} strokeWidth={3} className="text-white" />}
                    >
                      <span className="text-[10px] font-black text-white tracking-widest uppercase whitespace-nowrap">AFİŞ EKLE</span>
                    </Button>
                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                      accept="image/*"
                      disabled={isAssetUploading}
                      onChange={(e) => { 
                        setActiveEditingSlideId(-1); 
                        handleFileUploadAction(e); 
                      }} 
                    />
                  </div>
                </div>
              )}

              {marketingSlides.map((_, dotIndex) => (
                <div key={dotIndex} onClick={() => { setIsTransitioning(true); setCurrentIndex(dotIndex); }}
                  className={`${carouselTheme.navigation.dotBase} ${currentIndex === dotIndex ? carouselTheme.navigation.dotActive : carouselTheme.navigation.dotInactive}`} />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
