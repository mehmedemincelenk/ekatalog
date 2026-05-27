import { useState, useRef, useEffect, memo } from 'react';
import { THEME } from '../../data/config';
import { useReferencesFlow } from '../../hooks/useReferencesFlow';
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
              className="h-6 w-auto object-contain grayscale opacity-80"
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

  const trackRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(0);
  const velocity = useRef(0);
  const isDown = useRef(false);
  const startX = useRef(0);
  const startXOffset = useRef(0);
  const lastClientX = useRef(0);
  const lastMoveTime = useRef(0);
  const lastTime = useRef(0);

  const baseSpeedRef = useRef(-28); // Pixels per second to slide left

  useEffect(() => {
    const track = trackRef.current;
    if (!track || activeReferences.length === 0 || isAdmin) return;

    let animationFrameId: number;

    const updateHighlights = () => {
      const children = track.children;
      if (!children.length) return;
      
      const viewportCenter = window.innerWidth / 2;
      const maxDistance = window.innerWidth < 640 ? 120 : 250;

      for (let i = 0; i < children.length; i++) {
        const child = children[i] as HTMLElement;
        const rect = child.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const distance = Math.abs(viewportCenter - itemCenter);

        let highlight = 0;
        if (distance < maxDistance) {
          // Smooth bell-curve transition using cosine interpolation
          const ratio = distance / maxDistance;
          highlight = Math.cos(ratio * Math.PI / 2);
        }

        const img = child.querySelector('img') as HTMLElement;
        if (img) {
          const grayscaleVal = 100 - (highlight * 100);
          const opacityVal = 0.35 + (highlight * 0.65);
          const scaleVal = 1.0 + (highlight * 0.12);
          
          img.style.filter = `grayscale(${grayscaleVal}%)`;
          img.style.opacity = `${opacityVal}`;
          img.style.transform = `scale(${scaleVal})`;
          img.style.transition = 'filter 0.3s ease-out, opacity 0.3s ease-out, transform 0.3s ease-out';
        } else {
          const span = child.querySelector('span') as HTMLElement;
          if (span) {
            const opacityVal = 0.45 + (highlight * 0.55);
            const scaleVal = 1.0 + (highlight * 0.08);
            
            span.style.opacity = `${opacityVal}`;
            span.style.transform = `scale(${scaleVal})`;
            span.style.color = highlight > 0.5 ? '#1c1917' : '#78716c';
            span.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out, color 0.3s ease-out';
          }
        }
      }
    };

    const animate = (time: number) => {
      if (!lastTime.current) {
        lastTime.current = time;
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      let dt = (time - lastTime.current) / 1000;
      if (dt < 0 || dt > 0.1) dt = 0.016; // Safeguard tab backgrounding

      const halfWidth = track.scrollWidth / 2;

      // Infinite wrapping boundary check
      if (halfWidth > 0) {
        if (xRef.current <= -halfWidth) {
          xRef.current += halfWidth;
        } else if (xRef.current >= 0) {
          xRef.current -= halfWidth;
        }
      }

      const baseSpeed = baseSpeedRef.current;

      if (!isDown.current) {
        // INERTIA DECELERATION & AUTO-SCROLL PHYSICS
        if (Math.abs(velocity.current) > Math.abs(baseSpeed)) {
          // Decelerate with time-independent exponential friction
          velocity.current *= Math.pow(0.96, dt * 60);

          // Once it decays close to base speed, seamlessly lock to base speed
          if (Math.abs(velocity.current) <= Math.abs(baseSpeed) + 5) {
            velocity.current = baseSpeed;
          }
        } else {
          // Gently accelerate/merge back to base speed in the active direction
          velocity.current = velocity.current * 0.95 + baseSpeed * 0.05;
        }

        xRef.current += velocity.current * dt;
        track.style.transform = `translate3d(${xRef.current}px, 0, 0)`;
      }

      // Smoothly update visual highlights on every frame
      updateHighlights();

      lastTime.current = time;
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeReferences.length, isAdmin]);

  // Unified Pointer Drag Handlers (Cross-platform mouse client coordinates & touch)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isAdmin) return;
    isDown.current = true;
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);

    startX.current = e.clientX;
    startXOffset.current = xRef.current;
    lastClientX.current = e.clientX;
    lastMoveTime.current = performance.now();
    velocity.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDown.current) return;
    const track = trackRef.current;
    if (!track) return;

    const now = performance.now();
    const dt = (now - lastMoveTime.current) / 1000;

    const dx = e.clientX - lastClientX.current;
    const totalDragDx = e.clientX - startX.current;

    xRef.current = startXOffset.current + totalDragDx;
    track.style.transform = `translate3d(${xRef.current}px, 0, 0)`;

    if (dt > 0) {
      // Calculate instant drag speed
      const instantVelocity = dx / dt;
      // Smooth using low-pass filter to reject coordinate jitter
      velocity.current = velocity.current * 0.3 + instantVelocity * 0.7;
    }

    lastClientX.current = e.clientX;
    lastMoveTime.current = now;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDown.current) return;
    isDown.current = false;
    const el = e.currentTarget as HTMLElement;
    try {
      el.releasePointerCapture(e.pointerId);
    } catch (err) {}

    // Adapt automatic scroll direction to the user's drag gesture direction
    const totalDragDx = e.clientX - startX.current;
    if (Math.abs(totalDragDx) > 10) {
      baseSpeedRef.current = totalDragDx > 0 ? 28 : -28;
    }
  };

  // Repeat activeReferences enough times to guarantee perfect seamless scrolling overlay
  const marqueeItems = [];
  if (activeReferences.length > 0) {
    const baseItems = [];
    const repeatCount = Math.max(4, Math.ceil(20 / activeReferences.length));
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
    <section className="bg-stone-50 overflow-hidden select-none py-4">
      <div className="w-full overflow-hidden relative">
        {/* Subtle premium edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-stone-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-stone-50 to-transparent z-10 pointer-events-none" />

        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ touchAction: 'pan-y' }}
          className="w-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
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
                    className="h-12 sm:h-14 w-auto object-contain grayscale opacity-45 hover:grayscale-0 hover:opacity-100 transition-all duration-300 pointer-events-none select-none"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-[12px] font-black uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 transition-colors pointer-events-none select-none">
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
