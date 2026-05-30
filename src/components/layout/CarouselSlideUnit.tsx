import { memo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { THEME } from '../../data/config';
import SmartImage from '../ui/SmartImage';
import { resolveVisualAssetUrl } from '../../utils/image';
import Button from '../ui/Button';
import * as Lucide from 'lucide-react';

/**
 * CAROUSEL SLIDE UNIT (Admin Optimized)
 * -----------------------------------------------------------
 * Renders a single banner slide with administrative overlays.
 */

import { CarouselSlide } from '../../types';

const CarouselSlideUnit = memo(
  ({
    slideData,
    currentIndex,
    totalSlides,
    isAdmin,
    isCurrentlyActive,
    isCurrentlyUploading,
    editingTargetSlideId,
    onDeleteTrigger,
    onUpload,
    onOrderChange,
  }: {
    slideData: CarouselSlide;
    currentIndex: number;
    totalSlides: number;
    isAdmin: boolean;
    isCurrentlyActive: boolean;
    isCurrentlyUploading: boolean;
    editingTargetSlideId: number | null;
    onDeleteTrigger: (id: number) => void;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onOrderChange?: (newPos: number) => void;
  }) => {
    const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const carouselTheme = THEME.heroCarousel;
    const globalIcons = THEME.icons;

    return (
      <div
        className={`${carouselTheme.slide.base} overflow-hidden rounded-none relative`}
      >
        {/* VISUAL ASSET LAYER */}
        <div className="relative w-full overflow-hidden rounded-none">
          <SmartImage
            src={resolveVisualAssetUrl(slideData.src)}
            alt={slideData.label}
            aspectRatio="none"
            priority={true}
            className={`
              w-full h-auto block object-contain rounded-none
              ${isCurrentlyUploading && editingTargetSlideId === slideData.id ? carouselTheme.slide.loadingBlur : ''}
            `}
            imgClassName="rounded-none"
          />
        </div>

        <AnimatePresence>
          {isAdmin && (
            <div
              className={`absolute top-5 right-4 flex items-center gap-2 z-[1000] transition-opacity duration-500 ${isCurrentlyActive ? 'opacity-100' : 'opacity-40'}`}
            >
              {/* INTERACTIVE SEQUENCE BADGE */}
              <div
                className={`${carouselTheme.slide.changeBadge} !static !pointer-events-auto flex items-center relative w-7 h-7 justify-center !rounded-md border border-white/20 shadow-xl bg-stone-900/60 backdrop-blur-md`}
                onClick={(e) => e.stopPropagation()}
              >
                <select
                  value={currentIndex}
                  disabled={isUpdatingOrder}
                  onChange={async (e) => {
                    e.stopPropagation();
                    const newPos = Number(e.target.value);
                    setIsUpdatingOrder(true);
                    try {
                      await onOrderChange?.(newPos);
                      setIsUpdatingOrder(false);
                      setShowSuccess(true);
                      setTimeout(() => setShowSuccess(false), 1500);
                    } finally {
                      setIsUpdatingOrder(false);
                    }
                  }}
                  className={`absolute inset-0 cursor-pointer z-10 ${isUpdatingOrder || showSuccess ? 'opacity-0' : 'opacity-0'}`}
                >
                  {Array.from({ length: totalSlides }).map((_, i) => (
                    <option key={i} value={i}>
                      {i + 1}.
                    </option>
                  ))}
                </select>
                {isUpdatingOrder ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : showSuccess ? (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center"
                  >
                    <Lucide.Check
                      size={12}
                      className="text-emerald-400"
                      strokeWidth={4}
                    />
                  </motion.div>
                ) : (
                  <span className="text-white text-[10px] font-black">
                    {currentIndex + 1}.
                  </span>
                )}
              </div>

              {/* CHANGE IMAGE BUTTON */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="!pointer-events-auto"
              >
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  variant="glass"
                  mode="square"
                  className="w-7 h-7 shadow-xl border border-white/20 !rounded-md !bg-stone-900/60 backdrop-blur-md !p-0 flex items-center justify-center"
                  icon={
                    <div className="w-3.5 h-3.5 text-white hover:text-emerald-400 transition-colors flex items-center justify-center">
                      <Lucide.ImagePlus size={14} strokeWidth={2.5} />
                    </div>
                  }
                  title="GÖRSELİ DEĞİŞTİR"
                />
              </motion.div>

              {/* DELETE BUTTON */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="!pointer-events-auto"
              >
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTrigger?.(slideData.id);
                  }}
                  variant="glass"
                  mode="square"
                  className="w-7 h-7 shadow-xl border border-white/20 !rounded-md !bg-stone-900/60 backdrop-blur-md !p-0 flex items-center justify-center"
                  icon={
                    <div className="w-3.5 h-3.5 text-white hover:text-red-400 transition-colors flex items-center justify-center">
                      {globalIcons.trash}
                    </div>
                  }
                  title="AFİŞİ SİL"
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* FILE INPUT - ADMIN ONLY */}
        {isAdmin && isCurrentlyActive && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                onUpload(e);
              }}
              onClick={(e) => e.stopPropagation()}
            />

            {/* LOCAL LOADING SPINNER WITHIN IMAGE BOUNDS */}
            {isCurrentlyUploading && editingTargetSlideId === slideData.id && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900/40 backdrop-blur-[2px] transition-all duration-500 z-40">
                <div className={carouselTheme.slide.loadingSpinner} />
                <span className="mt-4 text-[10px] font-black text-white tracking-[0.2em] animate-pulse">
                  LÜTFEN BEKLEYİN...
                </span>
              </div>
            )}
          </>
        )}
      </div>
    );
  },
);

CarouselSlideUnit.displayName = 'CarouselSlideUnit';
export default CarouselSlideUnit;
