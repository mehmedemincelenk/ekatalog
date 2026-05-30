import { useState, memo } from 'react';
import { THEME } from '../../data/config';
import { useReferencesFlow } from '../../hooks/useReferencesFlow';
import { useMarqueePhysics } from '../../hooks/useMarqueePhysics';
import * as Lucide from 'lucide-react';
import { ReferencesProps, Reference } from '../../types';


// Admin-only ReferenceCard for editing
// Admin-only ReferenceCard for editing
const AdminReferenceCard = memo(
  ({
    refData,
    currentIndex,
    totalItems,
    onOrderChange,
    onDelete,
  }: {
    refData: Reference;
    currentIndex: number;
    totalItems: number;
    onOrderChange: (id: number, newIndex: number) => void;
    onDelete: (id: number) => void;
  }) => {
    const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);

    return (
      <div
        className="relative group flex flex-row items-center justify-between p-2 border border-stone-200 bg-stone-50/20 hover:bg-white hover:border-stone-300 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 rounded-2xl w-full h-24 select-none overflow-hidden"
      >
        {/* LEFT SIDE: LOGO CONTAINER */}
        <div className="flex-1 h-full bg-white border border-stone-100/80 rounded-xl flex flex-col items-center justify-center p-2 shadow-[inset_0_1px_3px_rgba(0,0,0,0.01)] min-w-0 relative overflow-hidden">
          {refData.logo && (refData.logo.startsWith('/') || refData.logo.startsWith('http')) ? (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <div className="h-9 flex items-center justify-center w-full">
                <img
                  src={refData.logo}
                  alt={refData.name}
                  className="h-full w-auto max-w-[90%] object-contain"
                />
              </div>
              <span className="text-[8px] font-black tracking-widest text-stone-400 uppercase mt-1.5 leading-none truncate w-full text-center px-1">
                {refData.name}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full gap-1.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-50 to-stone-100 border border-stone-200/50 flex items-center justify-center text-[9px] font-bold text-stone-600 uppercase shadow-inner">
                {refData.name.slice(0, 2)}
              </div>
              <span className="text-[9px] font-black text-stone-700 uppercase tracking-widest leading-none truncate w-full text-center px-1">
                {refData.name}
              </span>
            </div>
          )}
        </div>

        {/* RIGHT SIDE: CONTROLS COLUMN (STACKED VERTICALLY) */}
        <div 
          className="w-9 h-full flex flex-col justify-between items-center py-0.5 shrink-0 ml-2.5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* SLOT 1: SEQUENCE BUTTON (TOP) */}
          <div className="relative w-9 h-9 rounded-xl bg-white border border-stone-200/80 hover:border-stone-300 hover:bg-stone-50 flex flex-col items-center justify-center shadow-xs transition-all duration-200 cursor-pointer group/seq">
            <select
              value={currentIndex}
              onChange={(e) => {
                const newPos = Number(e.target.value);
                onOrderChange(refData.id, newPos);
              }}
              className="absolute inset-0 cursor-pointer opacity-0 z-10"
            >
              {Array.from({ length: totalItems }).map((_, i) => (
                <option key={i} value={i}>
                  {i + 1}. Sıra
                </option>
              ))}
            </select>
            <span className="text-[11px] font-black text-stone-800 leading-none">
              {currentIndex + 1}
            </span>
            <span className="text-[6px] font-bold uppercase tracking-tight text-stone-400 mt-0.5 leading-none">
              SIRA
            </span>
          </div>

          {/* SLOT 2: TWO-STEP / DOUBLE-TAP DELETE BUTTON (BOTTOM) */}
          <button
            type="button"
            onClick={() => {
              if (!isDeleteConfirming) {
                setIsDeleteConfirming(true);
                // Safety auto-disarm timer after 3 seconds
                const timer = setTimeout(() => {
                  setIsDeleteConfirming(false);
                }, 3000);
                (window as any)[`delTimer_${refData.id}`] = timer;
              } else {
                // Clear active timer and delete
                const activeTimer = (window as any)[`delTimer_${refData.id}`];
                if (activeTimer) clearTimeout(activeTimer);
                onDelete(refData.id);
                setIsDeleteConfirming(false);
              }
            }}
            className={`w-9 h-9 rounded-xl border shadow-xs transition-all duration-200 cursor-pointer flex items-center justify-center ${
              isDeleteConfirming
                ? 'bg-red-500 border-red-600 text-white animate-pulse'
                : 'bg-white border-stone-200/80 hover:border-red-100 hover:bg-red-50 text-stone-400 hover:text-red-500'
            }`}
            title={isDeleteConfirming ? "Silmek için tekrar dokun" : "Referansı Sil"}
          >
            <Lucide.Trash2 size={13} strokeWidth={isDeleteConfirming ? 2.5 : 2.2} />
          </button>
        </div>
      </div>
    );
  },
);

export default function References({
  isAdmin = false,
}: ReferencesProps) {
  const {
    activeReferences,
    handleDelete,
    handleOrderChange,
  } = useReferencesFlow(isAdmin);

  const {
    trackRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useMarqueePhysics(activeReferences.length, isAdmin);

  if (!isAdmin && activeReferences.length === 0) {
    return null;
  }

  // Repeat activeReferences enough times to guarantee perfect seamless scrolling overlay
  const marqueeItems = [];
  if (activeReferences.length > 0) {
    const baseItems = [];
    const repeatCount = Math.max(1, Math.ceil(12 / activeReferences.length));
    for (let i = 0; i < repeatCount; i++) {
      baseItems.push(...activeReferences);
    }
    marqueeItems.push(...baseItems, ...baseItems);
  }


  // --- ADMIN MODE VIEW ---
  if (isAdmin) {
    const referencesTheme = THEME.references;
    return (
      <section className={`${referencesTheme.layout} !py-8`}>
        <div className={referencesTheme.container}>
          {/* CENTERED HEADER SECTION */}
          <div className="flex flex-col items-center justify-center mb-10 text-center">
            <h2 className="text-2xl font-black text-stone-900 tracking-tighter uppercase leading-none">
              REFERANSLARIMIZ (DÜZENLEME MODU)
            </h2>
            <div className="w-12 h-1 bg-stone-900 mt-4 mb-2 rounded-full opacity-10"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
            {activeReferences.map((ref, idx) => (
              <AdminReferenceCard
                key={ref.id}
                refData={ref}
                currentIndex={idx}
                totalItems={activeReferences.length}
                onOrderChange={handleOrderChange}
                onDelete={handleDelete}
              />
            ))}

            {activeReferences.length === 0 && (
              <div className="col-span-full border-2 border-dashed border-stone-100 rounded-xl py-16 flex flex-col items-center justify-center gap-3 text-stone-300 bg-stone-50/50 w-full">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-stone-100 mb-2">
                  <span className="text-xl">🤝</span>
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-center px-8 leading-loose opacity-60">
                  HENÜZ REFERANS EKLENMEMİŞ
                </span>
                <p className="text-[9px] font-bold text-stone-400 italic">
                  Sağ alttaki "+" butonuna basıp "Yeni Referans"ı seçin
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // --- VISITOR/GUEST MODE VIEW (PREMIUM SLIDING MARQUEE) ---
  return (
    <section className="w-full max-w-full overflow-hidden select-none py-4 bg-white">
      <div className="w-full max-w-full overflow-hidden relative">
        {/* Subtle premium edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

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
            className="flex gap-10 py-1.5 items-center shrink-0 w-max"
          >
            {marqueeItems.map((ref, idx) => (
              <div
                key={`${ref.id}-${idx}`}
                className="flex items-center justify-center shrink-0 px-2 min-w-0"
              >
                <GuestReferenceItem refData={ref} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Simple Guest-facing ReferenceItem with auto-recovering fallback
const GuestReferenceItem = memo(({ refData }: { refData: Reference }) => {
  const [hasError, setHasError] = useState(false);

  const showTextFallback =
    !refData.logo ||
    !(refData.logo.startsWith('/') || refData.logo.startsWith('http')) ||
    hasError;

  if (showTextFallback) {
    return (
      <span className="text-[12px] font-black uppercase tracking-[0.2em] text-stone-800 select-none pointer-events-none transition-all duration-300 ease-out">
        {refData.name}
      </span>
    );
  }

  return (
    <img
      src={refData.logo}
      alt={refData.name}
      decoding="async"
      draggable={false}
      className="h-10 sm:h-12 w-auto object-contain opacity-100 select-none pointer-events-none transition-all duration-300 ease-out"
      onError={() => setHasError(true)}
    />
  );
});
