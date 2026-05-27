import { useState, memo } from 'react';
import { THEME } from '../../data/config';
import { useReferencesFlow } from '../../hooks/useReferencesFlow';
import { useMarqueePhysics } from '../../hooks/useMarqueePhysics';
import Button from '../ui/Button';
import { QuickEditModal } from '../modals/UtilityModals';
import * as Lucide from 'lucide-react';
import { ReferencesProps, Reference } from '../../types';


// Admin-only ReferenceCard for editing
const AdminReferenceCard = memo(
  ({
    refData,
    isInlineEnabled,
    onDelete,
    onEdit,
  }: {
    refData: Reference;
    isInlineEnabled: boolean;
    onDelete: (id: number) => void;
    onEdit: (id: number, name: string) => void;
  }) => {
    const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
    const referencesTheme = THEME.references;

    return (
      <div
        className={`${referencesTheme.card.base} relative group flex items-center justify-center p-4 text-center border-stone-100 bg-white shadow-[0_2px_15px_-5px_rgba(0,0,0,0.08)] hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300 rounded-xl overflow-hidden`}
      >
        {refData.logo && (refData.logo.startsWith('/') || refData.logo.startsWith('http')) ? (
          <div className="flex flex-col items-center gap-1.5 py-1">
            <img
              src={refData.logo}
              alt={refData.name}
              className="h-6 w-auto object-contain opacity-100"
            />
            <span className="text-[8px] font-black tracking-[0.1em] text-stone-400 uppercase">
              {refData.name}
            </span>
          </div>
        ) : (
          <span
            contentEditable={isInlineEnabled}
            suppressContentEditableWarning
            onBlur={(e) => {
              const newName = e.currentTarget.textContent || '';
              onEdit(refData.id, newName);
            }}
            onKeyDown={(e) =>
              e.key === 'Enter' && (e.preventDefault(), e.currentTarget.blur())
            }
            className={`text-[12px] font-black uppercase tracking-[0.2em] text-stone-800 leading-tight outline-none hover:bg-stone-50 focus:bg-stone-50 focus:ring-2 focus:ring-stone-900/10 px-3 py-1 -mx-3 rounded-xl transition-all cursor-text`}
          >
            {refData.name}
          </span>
        )}

        {/* DELETE ACTIONS */}
        <div className="absolute top-2 right-2 z-20 flex gap-1">
          {!isDeleteConfirming ? (
            <Button
              onClick={() => setIsDeleteConfirming(true)}
              variant="glass"
              mode="square"
              className="!w-8 !h-8 !bg-stone-900/60 backdrop-blur-md border border-white/20 text-white shadow-xl !rounded-lg !p-0 opacity-0 group-hover:opacity-100 transition-all"
              icon={<Lucide.Trash2 size={14} strokeWidth={3} />}
              title="Referansı Sil"
            />
          ) : (
            <div className="flex gap-1 animate-in slide-in-from-right-2 duration-300">
              <Button
                onClick={() => {
                  onDelete(refData.id);
                  setIsDeleteConfirming(false);
                }}
                variant="action"
                mode="square"
                className="!w-8 !h-8 !p-0 !rounded-lg shadow-xl"
                icon={<Lucide.Check size={14} strokeWidth={4} />}
              />
              <Button
                onClick={() => setIsDeleteConfirming(false)}
                variant="glass"
                mode="square"
                className="!w-8 !h-8 !bg-stone-900/60 backdrop-blur-md border border-white/20 text-white shadow-xl !rounded-lg !p-0"
                icon={<Lucide.X size={14} strokeWidth={3} />}
              />
            </div>
          )}
        </div>
      </div>
    );
  },
);

export default function References({
  isAdmin = false,
  isInlineEnabled = true,
}: ReferencesProps) {
  const {
    activeReferences,
    activeQuickEdit,
    setActiveQuickEdit,
    handleDelete,
    handleSaveEdit,
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

          <div className={referencesTheme.grid}>
            {activeReferences.map((ref) => (
              <AdminReferenceCard
                key={ref.id}
                refData={ref}
                isInlineEnabled={isInlineEnabled}
                onDelete={handleDelete}
                onEdit={(id, name) => setActiveQuickEdit({ id, name })}
              />
            ))}

            {activeReferences.length === 0 && (
              <div className="col-span-full border-2 border-dashed border-stone-100 rounded-xl py-16 flex flex-col items-center justify-center gap-3 text-stone-300 bg-stone-50/50">
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
            className="flex gap-10 py-1.5 items-center justify-center mx-auto shrink-0 w-max"
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
