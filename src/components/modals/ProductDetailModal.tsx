import { useRef } from 'react';
import * as Lucide from 'lucide-react';
import { ProductDetailModalProps } from '../../types';
import Button from '../ui/Button';
import BaseModal from './BaseModal';
import SmartImage from '../ui/SmartImage';
import StatusToggle from '../ui/StatusToggle';
import { useEditProdCardFlow } from '../../hooks/useEditProdCardFlow';

export function ProductDetailModal({
  isOpen,
  onClose,
  product,
  isPromotionActive,
  originalPriceLabel,
  discountedPriceLabel,
  highDefinitionImageSource,
  isStatic = false,
  showPrice = true,
  isAdmin = false,
  categories = [],
  onUpdate,
  onDelete,
  onImageUpload,
}: ProductDetailModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const flow = useEditProdCardFlow(
    product,
    onDelete || (() => {}),
    onUpdate || (() => {}),
    onImageUpload,
    isOpen,
    onClose,
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-sm"
      className="!p-0"
      noPadding
      isStatic={isStatic}
    >
      <div className="flex flex-col relative bg-white p-4">
        {isAdmin && (
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => flow.handleImageFileChange(e, fileInputRef)}
          />
        )}

        {flow.showDeleteConfirm ? (
          /* DELETE CONFIRMATION INTERFACE (Unified in detail modal) */
          <div className="p-6">
            {!flow.deleteTarget ? (
              /* STEP 1: SELECT TARGET */
              <div className="flex flex-col gap-3 py-6">
                <button
                  onClick={() => flow.setDeleteTarget('PRODUCT')}
                  className="w-full py-4 text-xs font-black uppercase tracking-wider rounded-2xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 active:scale-95 border border-red-100/50 shadow-sm"
                >
                  ÜRÜNÜ TAMAMEN SİL
                </button>
                <button
                  onClick={() => flow.setDeleteTarget('IMAGE')}
                  className="w-full py-4 text-xs font-black uppercase tracking-wider rounded-2xl bg-stone-50 text-stone-700 hover:bg-stone-100 transition-all duration-200 active:scale-95 border border-stone-100 shadow-sm"
                >
                  SADECE GÖRSELİ KALDIR
                </button>
                <button
                  onClick={() => flow.setShowDeleteConfirm(false)}
                  className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-600 mt-2 transition-colors"
                >
                  İPTAL ET
                </button>
              </div>
            ) : (
              /* STEP 2 & 3: WARNING & FINAL FINGERPRINT CONFIRM */
              <div className="flex flex-col items-center text-center space-y-6 py-6">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-inner relative">
                  <div className="absolute inset-0 bg-red-500/10 rounded-full animate-ping" />
                  <Lucide.AlertCircle
                    size={32}
                    strokeWidth={2.5}
                    className="relative z-10"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-stone-900 uppercase tracking-tighter">
                    EMİN MİSİNİZ?
                  </h3>
                  <p className="text-[12px] font-bold text-stone-400 leading-relaxed px-4">
                    {flow.deleteTarget === 'PRODUCT'
                      ? 'Bu ürün dükkandan tamamen ve kalıcı olarak kaldırılacak.'
                      : 'Ürünün görseli kalıcı olarak silinecek, ürün dükkanda kalmaya devam edecek.'}
                    <br />
                    <span className="text-red-500/80 uppercase text-[9px] tracking-widest font-black block mt-2">
                      Bu işlem geri alınamaz!
                    </span>
                  </p>
                </div>

                <div className="w-full space-y-3 pt-2">
                  <Button
                    onClick={flow.finalizeDelete}
                    variant="danger"
                    mode="rectangle"
                    className="w-full !h-16 font-black shadow-2xl shadow-red-200 !rounded-2xl text-xs tracking-widest"
                  >
                    SİLMEYİ ONAYLA
                  </Button>

                  <Button
                    onClick={() => flow.setDeleteTarget(null)}
                    variant="ghost"
                    mode="rectangle"
                    className="w-full !text-stone-400 hover:!text-stone-900 !text-[10px] font-black uppercase py-2 tracking-widest flex items-center justify-center gap-1.5"
                    icon={<Lucide.ArrowLeft size={14} strokeWidth={3} />}
                  >
                    VAZGEÇ
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* PRODUCT DETAILS & INLINE ACTIONS */
          <>
            <div className="relative aspect-square bg-stone-50 overflow-hidden rounded-2xl border border-stone-100 shadow-inner">
              <SmartImage
                src={highDefinitionImageSource}
                alt={product.name}
                aspectRatio="square"
                className="w-full h-full"
              />
              {isAdmin && (
                <div className="absolute bottom-3 left-3 right-3 z-20">
                  <button
                    onClick={() =>
                      !flow.isUploading && fileInputRef.current?.click()
                    }
                    className="w-full h-11 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border border-white/10 bg-stone-900/40 backdrop-blur-md text-white transition-all active:scale-[0.98] hover:bg-stone-900/60 outline-none"
                  >
                    {flow.isUploading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Lucide.Camera size={14} className="text-white" />
                    )}
                    DEĞİŞTİR
                  </button>
                </div>
              )}
            </div>

            <div
              className={`pt-6 px-4 space-y-4 text-left ${isAdmin ? 'pb-0' : 'pb-20'}`}
            >
              <div className="space-y-2">
                <div>
                  {isAdmin && categories && categories.length > 0 ? (
                    <div className="relative inline-block">
                      <select
                        value={product.category}
                        onChange={(e) =>
                          flow.handleAction('CATEGORY', e.target.value)
                        }
                        className="appearance-none bg-stone-50 text-stone-500 pl-3 pr-8 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] inline-block border border-stone-100 shadow-sm outline-none cursor-pointer focus:border-stone-300 animate-none"
                        style={{
                          width: `${product.category.length * 6.6 + 44}px`,
                        }}
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-stone-400">
                        <Lucide.ChevronDown size={10} strokeWidth={3} />
                      </div>
                    </div>
                  ) : (
                    <span className="bg-stone-50 text-stone-500 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] inline-block border border-stone-100 shadow-sm">
                      {product.category}
                    </span>
                  )}
                </div>

                {isAdmin ? (
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) =>
                      onUpdate?.(product.id, { name: e.target.value })
                    }
                    spellCheck={false}
                    className="text-lg font-black text-stone-900 tracking-tighter leading-tight w-full uppercase bg-transparent outline-none focus:bg-stone-100 hover:bg-stone-50 rounded px-1 -mx-1 border-none focus:ring-0 focus:outline-none transition-all"
                    placeholder="ÜRÜN ADI"
                  />
                ) : (
                  <h3 className="text-lg font-black text-stone-900 tracking-tighter leading-tight max-w-[85%] uppercase">
                    {product.name}
                  </h3>
                )}

                {isAdmin ? (
                  <textarea
                    value={product.description || ''}
                    spellCheck={false}
                    onChange={(e) => {
                      onUpdate?.(product.id, { description: e.target.value });
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onFocus={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    className="text-stone-500 text-[10px] font-bold leading-relaxed w-full uppercase bg-transparent outline-none focus:bg-stone-100 hover:bg-stone-50 rounded px-1 -mx-1 border-none focus:ring-0 focus:outline-none transition-all resize-none overflow-hidden block"
                    placeholder="ÜRÜN AÇIKLAMASI EKLE"
                    rows={1}
                  />
                ) : (
                  product.description && (
                    <p className="text-stone-500 text-[10px] font-bold leading-relaxed max-w-[95%] uppercase">
                      {product.description}
                    </p>
                  )
                )}
              </div>

              {/* ADMIN CONTROLS & PRICE BOTTOM ROW */}
              {isAdmin && (
                <div className="flex items-center justify-between border-t border-stone-100 pt-4 mt-6">
                  {/* PRICE ON THE LEFT */}
                  {showPrice ? (
                    <div>
                      {isPromotionActive ? (
                        <div className="flex flex-col items-start leading-none">
                          <span className="text-stone-300 line-through text-[10px] font-bold mb-0.5">
                            {originalPriceLabel}
                          </span>
                          <span className="text-stone-900 text-xl font-black tracking-tighter">
                            {discountedPriceLabel}
                          </span>
                        </div>
                      ) : (
                        <span className="text-stone-900 text-xl font-black tracking-tighter">
                          {originalPriceLabel}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div />
                  )}

                  {/* ACTIONS GROUP ON THE RIGHT */}
                  <div className="flex items-center gap-3 bg-stone-50 border border-stone-100 rounded-2xl p-2.5">
                    {/* TOGGLES */}
                    <div className="flex gap-3.5 pr-3.5 border-r border-stone-200">
                      <div className="flex flex-col items-center gap-0.5 select-none">
                        <span className="text-[7px] font-black text-stone-400 uppercase tracking-widest leading-none">
                          STOK
                        </span>
                        <StatusToggle
                          value={!product.out_of_stock}
                          onChange={(val) => flow.handleAction('STOCK', val)}
                          variant="compact"
                          activeColor="bg-emerald-500"
                          inactiveColor="bg-stone-200"
                        />
                      </div>
                      <div className="flex flex-col items-center gap-0.5 select-none">
                        <span className="text-[7px] font-black text-stone-400 uppercase tracking-widest leading-none">
                          YAYIN
                        </span>
                        <StatusToggle
                          value={!product.is_archived}
                          onChange={(val) => flow.handleAction('ARCHIVE', val)}
                          variant="compact"
                          activeColor="bg-emerald-500"
                          inactiveColor="bg-stone-200"
                        />
                      </div>
                    </div>

                    {/* BUTTONS */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => flow.handleAction('DOWNLOAD')}
                        className="w-9 h-9 rounded-xl bg-stone-900 hover:bg-black text-white flex items-center justify-center transition-all active:scale-95 outline-none shadow-md"
                        title="Görseli İndir"
                      >
                        <Lucide.Download size={15} strokeWidth={2.5} />
                      </button>

                      <button
                        onClick={() => {
                          flow.setShowDeleteConfirm(true);
                          flow.setDeleteTarget(null);
                        }}
                        className="w-9 h-9 rounded-xl bg-stone-900 hover:bg-black hover:text-red-300 text-white flex items-center justify-center transition-all active:scale-95 outline-none shadow-md"
                        title="Ürünü Sil"
                      >
                        <Lucide.Trash2 size={15} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!isAdmin && showPrice && (
              <div className="absolute bottom-10 left-8 pointer-events-none">
                <div className="flex flex-col items-start">
                  {isPromotionActive ? (
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-stone-300 line-through text-sm font-bold">
                        {originalPriceLabel}
                      </span>
                      <span className="text-stone-900 text-2xl font-black tracking-tighter">
                        {discountedPriceLabel}
                      </span>
                    </div>
                  ) : (
                    <div className="bg-white/50 backdrop-blur-sm">
                      <span className="text-stone-900 text-2xl font-black tracking-tighter">
                        {originalPriceLabel}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </BaseModal>
  );
}
