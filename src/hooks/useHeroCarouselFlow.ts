import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store';
import { supabase } from '../supabase';
import { getActiveStoreSlug, reorderArray } from '../utils/core';
import { CarouselSlide } from '../types';
import { CAROUSEL, TECH } from '../data/config';
import { PanInfo } from 'framer-motion';

import { useSettings } from './useSettingsHub';

const INTERVAL_MS = 6000;
const SWIPE_THRESHOLD = 50;

export function useHeroCarouselFlow(isAdminModeActive: boolean) {
  const { showFeedback, adminPin } = useStore();
  const { updateSetting } = useSettings(isAdminModeActive);
  const [marketingSlides, setMarketingSlides] = useState<CarouselSlide[]>(
    CAROUSEL.slides,
  );
  const [loading, setLoading] = useState(true);
  const activeStoreSlug = getActiveStoreSlug();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAssetUploading, setIsAssetUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [activeEditingSlideId, setActiveEditingSlideId] = useState<
    number | null
  >(null);
  const [isPaused, setIsPaused] = useState(false);

  const persistCarouselData = useCallback(
    async (updatedSlides: CarouselSlide[]) => {
      if (!isAdminModeActive) return;
      try {
        await updateSetting('carouselData', { slides: updatedSlides });
      } catch (err) {
        console.error('Carousel sync failed:', err);
      }
    },
    [isAdminModeActive, updateSetting],
  );

  const reorderSlides = useCallback(
    async (slideId: number, newPosition: number) => {
      setMarketingSlides((prev) => {
        const oldIndex = prev.findIndex((s) => s.id === slideId);
        if (oldIndex === -1) return prev;
        const updated = reorderArray(prev, oldIndex, newPosition);
        persistCarouselData(updated);
        return updated;
      });
      setTimeout(() => setCurrentIndex(newPosition), 100);
    },
    [persistCarouselData],
  );

  const synchronizeCarouselSlides = useCallback(async () => {
    setLoading(true);
    const { data: storeData, error: fetchError } = await supabase
      .from('stores')
      .select('carousel_data')
      .eq('slug', activeStoreSlug)
      .single();
    if (storeData && !fetchError && storeData.carousel_data?.slides) {
      setMarketingSlides(storeData.carousel_data.slides);
    }
    setLoading(false);
  }, [activeStoreSlug]);

  useEffect(() => {
    synchronizeCarouselSlides();
  }, [synchronizeCarouselSlides]);

  const modifySlideContent = useCallback(
    async (slideId: number, contentChanges: Partial<CarouselSlide>) => {
      setMarketingSlides((prev) => {
        const updated = prev.map((s) =>
          s.id === slideId ? { ...s, ...contentChanges } : s,
        );
        persistCarouselData(updated);
        return updated;
      });
    },
    [persistCarouselData],
  );

  const uploadHeroImage = useCallback(
    async (slideId: number, visualFile: File) => {
      if (!adminPin)
        throw new Error('Security Error: PIN required for storage operations.');
      try {
        const { secureUploadVisualAsset } = await import('../utils/image');
        const oldSlide =
          slideId !== -1
            ? marketingSlides.find((slide) => slide.id === slideId)
            : null;
        const oldUrl = oldSlide?.src;

        const finalizedUrl = await secureUploadVisualAsset({
          file: visualFile,
          folder: TECH.storage.heroFolder,
          adminPin,
          oldUrl,
          slugBaseName: `hero-${activeStoreSlug}`,
          uniqueIdPrefix: slideId === -1 ? 'new' : String(slideId),
          isDualQuality: false,
          maxDimension: TECH.storage.heroWidth,
        });

        if (slideId !== -1) {
          await modifySlideContent(slideId, { src: finalizedUrl });
        }
        return finalizedUrl;
      } catch (err) {
        console.error('Hero upload failed:', err);
        throw err;
      }
    },
    [adminPin, activeStoreSlug, marketingSlides, modifySlideContent],
  );

  const deleteSlide = useCallback(
    async (slideId: number) => {
      setMarketingSlides((prev) => {
        const updated = prev.filter((s) => s.id !== slideId);
        persistCarouselData(updated);
        return updated;
      });
    },
    [persistCarouselData],
  );

  const handleNext = useCallback(() => {
    if (marketingSlides.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % marketingSlides.length);
  }, [marketingSlides.length]);

  const handlePrev = useCallback(() => {
    if (marketingSlides.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex(
      (prev) => (prev - 1 + marketingSlides.length) % marketingSlides.length,
    );
  }, [marketingSlides.length]);

  // Auto-scroll effect
  useEffect(() => {
    if (isAdminModeActive || isAssetUploading || marketingSlides.length <= 1 || isPaused)
      return;
    const scrollTimer = setInterval(handleNext, INTERVAL_MS);
    return () => clearInterval(scrollTimer);
  }, [handleNext, isAdminModeActive, isAssetUploading, marketingSlides.length, currentIndex, isPaused]);

  const handleFileUploadAction = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || activeEditingSlideId === null) return;

    try {
      setIsAssetUploading(true);

      if (activeEditingSlideId === -1) {
        const uploadedUrl = await uploadHeroImage(-1, file);

        setMarketingSlides((prev) => {
          const currentRealSlides = (prev || []).filter(
            (s) => s && s.src && s.src !== '',
          );
          const nextId =
            currentRealSlides.length > 0
              ? Math.max(...currentRealSlides.map((s) => s.id)) + 1
              : 1;
          const newSlide: CarouselSlide = {
            id: nextId,
            src: uploadedUrl,
            bg: 'bg-stone-200',
            label: 'Yeni Afiş',
            sub: 'Düzenlemek için tıklayın.',
          };
          const updatedSlides = [...currentRealSlides, newSlide];
          persistCarouselData(updatedSlides);

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

  return {
    marketingSlides,
    loading,
    currentIndex,
    setCurrentIndex,
    isTransitioning,
    setIsTransitioning,
    isAssetUploading,
    uploadSuccess,
    activeEditingSlideId,
    setActiveEditingSlideId,
    handleNext,
    handlePrev,
    handleFileUploadAction,
    handleDragEnd,
    reorderSlides,
    deleteSlide,
    isPaused,
    setIsPaused,
  };
}
