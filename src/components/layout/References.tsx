import { useState, useRef, useEffect, memo } from 'react';
import { useReferencesFlow } from '../../hooks/useReferencesFlow';
import { useMarqueePhysics } from '../../hooks/useMarqueePhysics';
import * as Lucide from 'lucide-react';
import { ReferencesProps, Reference } from '../../types';

interface ReferenceItemProps {
  refData: Reference;
  isAdmin?: boolean;
  currentIndex?: number;
  totalItems?: number;
  onOrderChange?: (id: number, newIndex: number) => void;
  onDelete?: (id: number) => void;
  onActiveStateChange?: (active: boolean) => void;
}

// A single, unified, perfectly aligned component for both Guest and Admin modes
const ReferenceItem = memo(
  ({
    refData,
    isAdmin = false,
    currentIndex = 0,
    totalItems = 0,
    onOrderChange,
    onDelete,
    onActiveStateChange,
  }: ReferenceItemProps) => {
    const [hasError, setHasError] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const showTextFallback =
      !refData.logo ||
      !(refData.logo.startsWith('/') || refData.logo.startsWith('http')) ||
      hasError;

    const handleCardClick = () => {
      if (!isAdmin) return;
      if (isActive) {
        setIsActive(false);
        onActiveStateChange?.(false);
        if (timerRef.current) clearTimeout(timerRef.current);
      } else {
        setIsActive(true);
        onActiveStateChange?.(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setIsActive(false);
          onActiveStateChange?.(false);
        }, 3000);
      }
    };

    useEffect(() => {
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (isAdmin) onActiveStateChange?.(false);
      };
    }, [isAdmin, onActiveStateChange]);

    return (
      <div
        onClick={handleCardClick}
        className={`relative flex items-center justify-center h-10 sm:h-12 select-none ${
          isAdmin ? 'cursor-pointer' : 'pointer-events-none'
        }`}
      >
        {/* LOGO CONTAINER (BLURS DIRECTLY WHEN ACTIVE WITH GPU ACCELERATION) */}
        <div
          className={`flex items-center justify-center h-full transition-all duration-300 ${
            isActive
              ? 'blur-[6px] opacity-25 scale-95'
              : 'blur-0 opacity-100 scale-100'
          }`}
        >
          {showTextFallback ? (
            <span className="text-[12px] font-black uppercase tracking-[0.2em] text-stone-800 transition-all duration-300 ease-out leading-none">
              {refData.name}
            </span>
          ) : (
            <img
              src={refData.logo}
              alt={refData.name}
              decoding="async"
              draggable={false}
              className="h-full w-auto object-contain rounded-[4px] overflow-hidden opacity-100 transition-all duration-300 ease-out"
              onError={() => setHasError(true)}
            />
          )}
        </div>

        {/* ADMIN OVERLAY BUTTONS (FADES IN WHEN ACTIVE - FLOATING DIRECTLY ON BLURRED LOGO WITH NO SOLID CARD COVER) */}
        {isAdmin && isActive && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-1 z-20 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-8 h-8 flex items-center justify-center rounded-md border border-white/20 shadow-xl bg-stone-900/60 backdrop-blur-md transition-all duration-200 active:scale-95 cursor-pointer hover:bg-stone-900/80">
              <select
                value={currentIndex}
                onChange={async (e) => {
                  e.stopPropagation();
                  const newPos = Number(e.target.value);
                  setShowSuccess(true);
                  setTimeout(() => setShowSuccess(false), 1500);
                  try {
                    await onOrderChange?.(refData.id, newPos);
                  } catch (err) {
                    console.error(err);
                    setShowSuccess(false);
                  } finally {
                    setIsActive(false);
                    onActiveStateChange?.(false);
                    if (timerRef.current) clearTimeout(timerRef.current);
                  }
                }}
                className="absolute inset-0 cursor-pointer z-10 opacity-0"
              >
                {Array.from({ length: totalItems }).map((_, i) => (
                  <option key={i} value={i}>
                    {i + 1}. Sıra
                  </option>
                ))}
              </select>
              {showSuccess ? (
                <Lucide.Check
                  size={14}
                  className="text-emerald-400"
                  strokeWidth={4}
                />
              ) : (
                <span className="text-white text-xs font-black leading-none">
                  {currentIndex + 1}
                </span>
              )}
            </div>

            {/* DELETE ACTION */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(refData.id);
                setIsActive(false);
                onActiveStateChange?.(false);
                if (timerRef.current) clearTimeout(timerRef.current);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-white/20 shadow-xl bg-stone-900/60 backdrop-blur-md text-white hover:text-red-400 transition-all duration-200 active:scale-95 cursor-pointer hover:bg-stone-900/80"
              title="Referansı Sil"
            >
              <Lucide.Trash2 size={14} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    );
  },
);

export default function References({
  isAdmin = false,
  isPaused = false,
}: ReferencesProps & { isPaused?: boolean }) {
  const { activeReferences, handleDelete, handleOrderChange } =
    useReferencesFlow(isAdmin);

  const [isAnyCardActive, setIsAnyCardActive] = useState(false);

  const { trackRef, handlePointerDown, handlePointerMove, handlePointerUp } =
    useMarqueePhysics(
      activeReferences.length,
      isAdmin,
      isPaused || isAnyCardActive,
    );

  if (activeReferences.length === 0) {
    if (isAdmin) {
      return (
        <section className="w-full max-w-full overflow-hidden select-none py-4 bg-transparent border border-stone-100/50 rounded-2xl flex flex-col items-center justify-center gap-2 text-stone-300">
          <span className="text-xl">🤝</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            HENÜZ REFERANS EKLENMEMİŞ
          </span>
        </section>
      );
    }
    return null;
  }

  // Repeat activeReferences enough times to guarantee perfect seamless scrolling
  const marqueeItems = [];
  const baseItems = [];
  const repeatCount = Math.max(1, Math.ceil(12 / activeReferences.length));
  for (let i = 0; i < repeatCount; i++) {
    baseItems.push(...activeReferences);
  }
  marqueeItems.push(...baseItems, ...baseItems);

  return (
    <section className="w-full max-w-full overflow-hidden select-none py-1.5 bg-transparent relative">
      <div className="w-full max-w-full overflow-hidden relative">
        {/* Subtle premium edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-stone-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-stone-50 to-transparent z-10 pointer-events-none" />

        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ touchAction: 'pan-y' }}
          className="w-full max-w-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
        >
          <div
            ref={trackRef}
            style={{ transform: 'translate3d(0px, 0, 0)' }}
            className="flex gap-8 py-1.5 items-center shrink-0 w-max"
          >
            {marqueeItems.map((ref, idx) => (
              <div
                key={`${ref.id}-${idx}`}
                className="relative flex items-center justify-center shrink-0 h-16 px-3 min-w-0 select-none"
              >
                <ReferenceItem
                  refData={ref}
                  isAdmin={isAdmin}
                  currentIndex={activeReferences.findIndex(
                    (r) => r.id === ref.id,
                  )}
                  totalItems={activeReferences.length}
                  onOrderChange={handleOrderChange}
                  onDelete={handleDelete}
                  onActiveStateChange={setIsAnyCardActive}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
