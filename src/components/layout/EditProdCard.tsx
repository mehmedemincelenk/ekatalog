import { memo, useRef } from 'react';
import * as Lucide from 'lucide-react';
import Button from '../ui/Button';
import BaseModal from '../modals/BaseModal';
import Loading from '../ui/Loading';

import { EditProdCardProps } from '../../types';
import { useEditProdCardFlow } from '../../hooks/useEditProdCardFlow';

/**
 * EDIT PRODUCT CARD COMPONENT (DIAMOND EDITION)
 * -----------------------------------------------------------
 * Specialized admin dashboard with high-density unified management hub.
 * Refactored for 100% autonomy in image management and state sync.
 * Ultra-minimalist visual style aligned with the "Sadelik Zirvedir" philosophy.
 */
export const EditProdCard = memo(
  ({
    product,
    categories = [],
    onDelete,
    onUpdate,
    onImageUpload,
    isOpen,
    setIsOpen,
    isStatic = false,
    initialStep,
  }: EditProdCardProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const flow = useEditProdCardFlow(
      product,
      onDelete,
      onUpdate,
      onImageUpload,
      isOpen,
      setIsOpen,
      initialStep,
    );

    const modalFooter = (
      <div className="w-full flex items-center gap-1.5">
        {/* DOWNLOAD ACTION (BORDERLESS ICON) */}
        <button
          onClick={() => flow.handleAction('DOWNLOAD')}
          className="w-12 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 text-stone-400 hover:text-stone-800 hover:bg-stone-50 flex-shrink-0 cursor-pointer"
          title="Görseli İndir"
        >
          <Lucide.Download size={20} strokeWidth={2.5} />
        </button>

        {/* DELETE ACTION (BORDERLESS ICON) */}
        <button
          onClick={() => {
            flow.setShowDeleteConfirm(true);
            flow.setDeleteTarget(null);
          }}
          className="w-12 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 text-stone-400 hover:text-red-500 hover:bg-red-50/40 flex-shrink-0 cursor-pointer"
          title="Ürünü Sil"
        >
          <Lucide.Trash2 size={20} strokeWidth={2.5} />
        </button>

        {/* KAYDET (SAVE) ACTION */}
        <Button
          onClick={() => setIsOpen(false)}
          variant="action"
          mode="rectangle"
          className="flex-1 !rounded-2xl !h-14 font-black text-xs tracking-widest shadow-xl shadow-emerald-500/10 border-0"
          showFingerprint={true}
          icon={<Lucide.Check size={20} strokeWidth={4} />}
        >
          KAYDET
        </Button>
      </div>
    );

    return (
      <>
        <BaseModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          footer={modalFooter}
          maxWidth="max-w-md"
          className="!rounded-[2rem]"
          isStatic={isStatic}
        >
          <div className="py-1 flex flex-col gap-4">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => flow.handleImageFileChange(e, fileInputRef)}
            />

            {/* TOP CONTROLS SECTION */}
            <div className="flex gap-3 items-stretch">
              {/* LEFT: PHOTO CONTAINER */}
              <div
                onClick={() =>
                  !flow.isUploading && fileInputRef.current?.click()
                }
                className={`w-24 h-24 relative group rounded-2xl overflow-hidden bg-stone-50/40 border border-stone-100 flex items-center justify-center cursor-pointer hover:border-stone-300 transition-all shadow-sm flex-shrink-0 ${flow.isUploading ? 'opacity-50' : ''}`}
              >
                {product.polished_image_url || product.image_url ? (
                  <>
                    <img
                      src={
                        (product.polished_image_url || product.image_url) ??
                        undefined
                      }
                      alt="Preview"
                      className="w-full h-full object-contain p-1.5 transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 py-1.5 bg-black/55 backdrop-blur-md text-white text-[8px] font-black uppercase text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-1">
                      <Lucide.Camera size={10} /> DEĞİŞTİR
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center opacity-30 group-hover:opacity-60 transition-opacity">
                    <Lucide.Image size={20} className="text-stone-500" />
                    <span className="text-[7.5px] font-black mt-1 uppercase tracking-widest text-stone-500">
                      GÖRSEL EKLE
                    </span>
                  </div>
                )}
                {flow.isUploading && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-20">
                    <Loading size="sm" variant="dark" />
                  </div>
                )}
              </div>

              {/* RIGHT: STOK & YAYIN (VERTICAL STACK - PERFECTLY SYMMETRIC) */}
              <div className="flex-1 flex flex-col justify-between py-1.5 h-24">
                {/* STOCK CONTROL */}
                <div className="flex items-center justify-between pl-3">
                  <span className="text-[9.5px] font-black text-stone-400 uppercase tracking-[0.25em]">
                    STOK
                  </span>
                  <div className="flex gap-0.5 bg-stone-50 p-0.5 rounded-lg border border-stone-100/80 shadow-sm">
                    <button
                      onClick={() => flow.handleAction('STOCK', true)}
                      className={`h-6 w-8 rounded-md flex items-center justify-center transition-all active:scale-95 ${
                        !product.out_of_stock
                          ? 'bg-stone-900 text-white shadow-sm'
                          : 'text-stone-400 hover:text-stone-600'
                      }`}
                      title="Stokta Var"
                    >
                      <Lucide.Check size={10} strokeWidth={4} />
                    </button>
                    <button
                      onClick={() => flow.handleAction('STOCK', false)}
                      className={`h-6 w-8 rounded-md flex items-center justify-center transition-all active:scale-95 ${
                        product.out_of_stock
                          ? 'bg-red-500 text-white shadow-sm'
                          : 'text-stone-400 hover:text-stone-600'
                      }`}
                      title="Tükendi"
                    >
                      <Lucide.X size={10} strokeWidth={4} />
                    </button>
                  </div>
                </div>

                {/* ARCHIVE/PUBLISH CONTROL */}
                <div className="flex items-center justify-between pl-3">
                  <span className="text-[9.5px] font-black text-stone-400 uppercase tracking-[0.25em]">
                    YAYIN
                  </span>
                  <div className="flex gap-0.5 bg-stone-50 p-0.5 rounded-lg border border-stone-100/80 shadow-sm">
                    <button
                      onClick={() => flow.handleAction('ARCHIVE', false)}
                      className={`h-6 w-8 rounded-md flex items-center justify-center transition-all active:scale-95 ${
                        !product.is_archived
                          ? 'bg-stone-900 text-white shadow-sm'
                          : 'text-stone-400 hover:text-stone-600'
                      }`}
                      title="Yayında"
                    >
                      <Lucide.Check size={10} strokeWidth={4} />
                    </button>
                    <button
                      onClick={() => flow.handleAction('ARCHIVE', true)}
                      className={`h-6 w-8 rounded-md flex items-center justify-center transition-all active:scale-95 ${
                        product.is_archived
                          ? 'bg-red-500 text-white shadow-sm'
                          : 'text-stone-400 hover:text-stone-600'
                      }`}
                      title="Arşivde"
                    >
                      <Lucide.X size={10} strokeWidth={4} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* CATEGORY SELECTOR */}
            <div className="mt-4 pt-5 border-t border-stone-100/60">
              <div className="flex items-center gap-1.5 mb-3.5 pl-0.5">
                <Lucide.Settings2 size={13} className="text-stone-300" />
                <h4 className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em]">
                  KATEGORİ YÖNETİMİ
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const isSelected = product.category === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => flow.handleAction('CATEGORY', cat)}
                      className={`h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 active:scale-95 ${
                        isSelected
                          ? 'bg-stone-900 text-white shadow-md'
                          : 'bg-stone-50/60 text-stone-500 border border-stone-100 hover:bg-stone-50 hover:text-stone-800'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </BaseModal>

        {/* 3-STEP DELETE CONFIRM MODAL */}
        <BaseModal
          isOpen={flow.showDeleteConfirm}
          onClose={() => {
            flow.setShowDeleteConfirm(false);
            flow.setDeleteTarget(null);
          }}
          maxWidth="max-w-sm"
          isStatic={isStatic}
        >
          {!flow.deleteTarget ? (
            /* STEP 1: SELECT TARGET */
            <div className="flex flex-col gap-3 py-6 px-4">
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
            <div className="flex flex-col items-center text-center space-y-6 py-6 px-4">
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
                {/* THE FINAL SEAL: FINGERPRINT CONFIRM */}
                <Button
                  onClick={flow.finalizeDelete}
                  variant="danger"
                  mode="rectangle"
                  className="w-full !h-16 font-black shadow-2xl shadow-red-200 !rounded-2xl text-xs tracking-widest"
                  showFingerprint={true}
                  fingerprintType="touch"
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
        </BaseModal>
      </>
    );
  },
);

export default EditProdCard;

