import { useState, memo } from 'react';
import { THEME } from '../../data/config';
import { useReferencesFlow } from '../../hooks/useReferencesFlow';
import { useMarqueePhysics } from '../../hooks/useMarqueePhysics';
import { QuickEditModal } from '../modals/UtilityModals';
import * as Lucide from 'lucide-react';
import { ReferencesProps, Reference } from '../../types';


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
        className="relative group flex flex-col items-center justify-center p-4 pt-10 pb-4 border border-stone-100 bg-white hover:border-stone-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_-6px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 rounded-2xl w-full h-32 select-none overflow-hidden"
      >
        {/* SEQUENCE SELECTION BADGE (TOP-LEFT) */}
        {!isDeleteConfirming && (
          <div 
            className="absolute top-3 left-3 z-20 flex items-center justify-center px-2 py-0.5 rounded-full border border-stone-200/60 bg-stone-50/80 hover:bg-stone-100/90 text-stone-600 shadow-xs transition-colors cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
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
            <span className="text-[10px] font-bold tracking-tight">
              {currentIndex + 1}. Sıra
            </span>
          </div>
        )}

        {/* DELETE BUTTON (TOP-RIGHT) */}
        <div 
          className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {!isDeleteConfirming ? (
            <button
              type="button"
              onClick={() => setIsDeleteConfirming(true)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50/80 border border-transparent hover:border-red-100/60 transition-all duration-200 cursor-pointer"
              title="Referansı Sil"
            >
              <Lucide.Trash2 size={13} strokeWidth={2.2} />
            </button>
          ) : (
            <div className="flex gap-1.5 items-center bg-stone-50 border border-stone-200/60 p-0.5 rounded-full shadow-xs animate-in slide-in-from-right-1 duration-200">
              <button
                type="button"
                onClick={() => {
                  onDelete(refData.id);
                  setIsDeleteConfirming(false);
                }}
                className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs hover:bg-emerald-600 transition-colors cursor-pointer"
                title="Onayla"
              >
                <Lucide.Check size={11} strokeWidth={4} />
              </button>
              <button
                type="button"
                onClick={() => setIsDeleteConfirming(false)}
                className="w-6 h-6 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center hover:bg-stone-300 transition-colors cursor-pointer"
                title="İptal"
              >
                <Lucide.X size={11} strokeWidth={3} />
              </button>
            </div>
          )}
        </div>

        {/* LOGO IMAGE OR TEXT PLACEHOLDER */}
        {refData.logo && (refData.logo.startsWith('/') || refData.logo.startsWith('http')) ? (
          <div className="flex flex-col items-center justify-center w-full h-full pt-2">
            <div className="h-10 flex items-center justify-center w-full">
              <img
                src={refData.logo}
                alt={refData.name}
                className="h-full w-auto max-w-[85%] object-contain"
              />
            </div>
            <span className="text-[9px] font-black tracking-widest text-stone-400 uppercase mt-2 leading-none">
              {refData.name}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full pt-2 gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-stone-50 to-stone-100 border border-stone-200/50 flex items-center justify-center text-[10px] font-bold text-stone-600 uppercase shadow-inner">
              {refData.name.slice(0, 2)}
            </div>
            <span className="text-[10px] font-black text-stone-700 uppercase tracking-widest leading-none">
              {refData.name}
            </span>
          </div>
        )}
      </div>
    );
  },
);

export default function References({
  isAdmin = false,
}: ReferencesProps) {
  const {
    activeReferences,
    activeQuickEdit,
    setActiveQuickEdit,
    handleDelete,
    handleSaveEdit,
    handleOrderChange,
  } = useReferencesFlow(isAdmin);

  const {
    trackRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useMarqueePhysics(activeReferences.length, isAdmin);

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

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center justify-items-center w-full">
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

        <QuickEditModal
          isOpen={!!activeQuickEdit}
          onClose={() => setActiveQuickEdit(null)}
          onSave={handleSaveEdit}
          initialValue={activeQuickEdit?.name || ''}
          placeholder="Referans adı..."
        />
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
                {ref.logo && (ref.logo.startsWith('/') || ref.logo.startsWith('http')) ? (
                  <img
                    src={ref.logo}
                    alt={ref.name}
                    decoding="async"
                    draggable={false}
                    className="h-10 sm:h-12 w-auto object-contain opacity-100 select-none pointer-events-none transition-all duration-300 ease-out"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-[12px] font-black uppercase tracking-[0.2em] text-stone-400 select-none pointer-events-none transition-all duration-300 ease-out">
                    {ref.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
