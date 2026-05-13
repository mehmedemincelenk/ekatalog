import { memo, useEffect, useState, useRef } from 'react';
import Button from '../ui/Button';
import BaseModal from '../modals/BaseModal';
import StatusToggle from '../ui/StatusToggle';
import Loading from '../ui/Loading';
import {
  Trash2,
  Download,
  ImageIcon,
  Camera,
  AlertCircle,
  ArrowLeft,
  Settings2,
  Check
} from 'lucide-react';

import { EditProdCardProps } from '../../types';
import { useScrollLock } from '../../hooks/useCommon';
import { downloadImage } from '../../utils/image';

/**
 * EDIT PRODUCT CARD COMPONENT (DIAMOND EDITION)
 * -----------------------------------------------------------
 * Specialized admin dashboard with high-density unified management hub.
 * Refactored for 100% autonomy in image management and state sync.
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
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<
      'PRODUCT' | 'IMAGE' | null
    >(null);
    const [isUploading, setIsUploading] = useState(false);

    // Diamond Sync: Manage background interactions
    useScrollLock(isOpen);

    // Reset local states when modal closes
    useEffect(() => {
      if (!isOpen) {
        setShowDeleteConfirm(false);
        setDeleteTarget(null);
        setIsUploading(false);
      }
    }, [isOpen]);

    // Workspace Step Sync
    useEffect(() => {
      if (initialStep !== undefined) {
        if (initialStep === 1) {
          setShowDeleteConfirm(false);
          setDeleteTarget(null);
        } else if (initialStep === 2) {
          setShowDeleteConfirm(true);
          setDeleteTarget(null);
        } else if (initialStep === 3) {
          setShowDeleteConfirm(true);
          setDeleteTarget('PRODUCT');
        } else if (initialStep === 4) {
          setShowDeleteConfirm(true);
          setDeleteTarget('IMAGE');
        }
      }
    }, [initialStep]);

    const handleImageFileChange = async (
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const selectedFile = event.target.files?.[0];
      if (!selectedFile || !onImageUpload) return;

      setIsUploading(true);
      try {
        await onImageUpload(product.id, selectedFile);
      } catch (err) {
        console.error('Upload failed', err);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    const handleDownload = () => {
      const targetUrl = product.polished_image_url || product.image_url;
      if (!targetUrl) return;

      const hqUrl = !product.polished_image_url
        ? targetUrl.replace('/lq/', '/hq/').split('?')[0]
        : targetUrl;

      const cleanName = product.name.replace(/\s+/g, '-').toLowerCase();
      downloadImage(hqUrl, `diamond-${cleanName}.png`);
    };

    const handleAction = (
      type: 'ARCHIVE' | 'STOCK' | 'DOWNLOAD' | 'CATEGORY',
      value?: string | boolean,
    ) => {
      if (type === 'ARCHIVE') onUpdate(product.id, { is_archived: !!value });
      else if (type === 'STOCK') onUpdate(product.id, { out_of_stock: !value });
      else if (type === 'DOWNLOAD') handleDownload();
      else if (type === 'CATEGORY' && typeof value === 'string')
        onUpdate(product.id, { category: value });
    };

    const finalizeDelete = () => {
      if (deleteTarget === 'PRODUCT') {
        onDelete(product.id);
        setIsOpen(false);
      } else if (deleteTarget === 'IMAGE') {
        onUpdate(product.id, { image_url: '' });
      }
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    };


    const modalFooter = (
      <Button
        onClick={() => setIsOpen(false)}
        variant="action"
        mode="rectangle"
        className="w-full !rounded-[20px] !h-16"
        showFingerprint={true}
        icon={<Check size={24} strokeWidth={4} />}
      >
        KAYDET
      </Button>
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
          <div className="py-2 flex flex-col gap-4">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageFileChange}
            />

            {/* THE NEW DIAMOND GRID (3 COLUMNS, 2 ROWS) */}
            <div className="grid grid-cols-[130px_1fr_1fr] gap-3 items-stretch">
              
              {/* COL 1: PHOTO (Spans 2 rows potentially by container height) */}
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`aspect-square relative group rounded-2xl overflow-hidden bg-white border border-stone-100 flex items-center justify-center cursor-pointer hover:border-stone-300 transition-all shadow-sm ${isUploading ? 'opacity-50' : ''}`}
              >
                {product.polished_image_url || product.image_url ? (
                  <>
                    <img
                      src={(product.polished_image_url || product.image_url) ?? undefined}
                      alt="Preview"
                      className="w-full h-full object-contain p-1.5"
                    />
                    <div className="absolute inset-x-0 bottom-0 py-2 bg-black/40 backdrop-blur-sm text-white text-[8px] font-black uppercase text-center translate-y-full group-hover:translate-y-0 transition-transform flex items-center justify-center gap-1">
                      <Camera size={10} /> DEĞİŞTİR
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center opacity-30 group-hover:opacity-60 transition-opacity">
                    <ImageIcon size={28} />
                    <span className="text-[8px] font-black mt-2 uppercase tracking-widest">GÖRSEL</span>
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-20">
                    <Loading size="sm" variant="dark" />
                  </div>
                )}
              </div>

              {/* COL 2: STATUS (STOCK & PUBLISH) */}
              <div className="flex flex-col gap-2">
                <div className="flex-1 bg-stone-50 rounded-2xl p-3 border border-stone-100/50 flex flex-col justify-center gap-1">
                  <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">STOK</span>
                  <StatusToggle
                    label=""
                    value={!product.out_of_stock}
                    onChange={(val) => handleAction('STOCK', val)}
                  />
                </div>
                <div className="flex-1 bg-stone-50 rounded-2xl p-3 border border-stone-100/50 flex flex-col justify-center gap-1">
                  <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">YAYIN</span>
                  <StatusToggle
                    label=""
                    value={!product.is_archived}
                    onChange={(val) => handleAction('ARCHIVE', !val)}
                  />
                </div>
              </div>

              {/* COL 3: ACTIONS (DOWNLOAD & DELETE) */}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handleAction('DOWNLOAD')}
                  variant="secondary"
                  mode="rectangle"
                  className="flex-1 !rounded-2xl !bg-stone-50 !border-stone-100 flex flex-col items-center justify-center gap-1 group shadow-none hover:!bg-white hover:shadow-sm"
                  icon={<Download size={18} className="text-stone-900 group-hover:scale-110 transition-transform" />}
                >
                  <span className="text-[8px] font-black uppercase tracking-widest text-stone-400">İNDİR</span>
                </Button>
                <Button
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setDeleteTarget(null);
                  }}
                  variant="secondary"
                  mode="rectangle"
                  className="flex-1 !rounded-2xl !bg-stone-50 !border-stone-100 flex flex-col items-center justify-center gap-1 group shadow-none hover:!bg-red-50 hover:!border-red-100 hover:!text-red-600"
                  icon={<Trash2 size={18} className="group-hover:scale-110 transition-transform" />}
                >
                  <span className="text-[8px] font-black uppercase tracking-widest text-stone-400 group-hover:text-red-400">SİL</span>
                </Button>
              </div>
            </div>

            {/* CATEGORY SELECTOR - MOVED & MODERNIZED */}
            <div className="mt-4 pt-6 border-t border-stone-100/60">
              <div className="flex items-center gap-2 mb-4">
                <Settings2 size={14} className="text-stone-300" />
                <h4 className="text-[10px] font-black text-stone-900 uppercase tracking-[0.2em]">KATEGORİ YÖNETİMİ</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    onClick={() => handleAction('CATEGORY', cat)}
                    variant={product.category === cat ? 'primary' : 'secondary'}
                    className="!h-9 !px-4 !rounded-xl"
                    mode="rectangle"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">{cat}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </BaseModal>

        {/* 3-STEP DELETE CONFIRM MODAL */}
        <BaseModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setDeleteTarget(null);
          }}
          maxWidth="max-w-sm"
          isStatic={isStatic}
        >
          {!deleteTarget ? (
            /* STEP 1: SELECT TARGET */
            <div className="flex flex-col gap-3 py-6 px-4">
              <Button
                onClick={() => setDeleteTarget('PRODUCT')}
                variant="secondary"
                mode="rectangle"
                className="w-full !py-5 font-black !rounded-2xl border-stone-100 hover:!border-red-100 hover:!text-red-600 transition-all"
              >
                ÜRÜNÜ TAMAMEN SİL
              </Button>
              <Button
                onClick={() => setDeleteTarget('IMAGE')}
                variant="secondary"
                mode="rectangle"
                className="w-full !py-5 font-black !rounded-2xl border-stone-100"
              >
                SADECE GÖRSELİ KALDIR
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="ghost"
                mode="rectangle"
                className="w-full py-2 font-black text-stone-300 text-[10px] mt-2 tracking-widest"
              >
                İPTAL ET
              </Button>
            </div>
          ) : (
            /* STEP 2 & 3: WARNING & FINAL FINGERPRINT CONFIRM */
            <div className="flex flex-col items-center text-center space-y-8 py-6 px-4">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-inner relative">
                <div className="absolute inset-0 bg-red-500/10 rounded-full animate-ping" />
                <AlertCircle size={40} strokeWidth={2.5} className="relative z-10" />
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-black text-stone-900 uppercase tracking-tighter">
                  EMİN MİSİNİZ?
                </h3>
                <p className="text-[13px] font-bold text-stone-400 leading-relaxed px-4">
                  {deleteTarget === 'PRODUCT'
                    ? 'Bu ürün dükkandan tamamen ve kalıcı olarak kaldırılacak.'
                    : 'Ürünün görseli kalıcı olarak silinecek, ürün dükkanda kalmaya devam edecek.'}
                  <br />
                  <span className="text-red-500/60 uppercase text-[10px] tracking-widest font-black">Bu işlem geri alınamaz!</span>
                </p>
              </div>

              <div className="w-full space-y-3 pt-2">
                {/* THE FINAL SEAL: FINGERPRINT CONFIRM */}
                <Button
                  onClick={finalizeDelete}
                  variant="danger"
                  mode="rectangle"
                  className="w-full !h-20 font-black shadow-2xl shadow-red-200 !rounded-[24px]"
                  showFingerprint={true}
                  fingerprintType="touch"
                >
                  SİLMEYİ ONAYLA
                </Button>
                
                <Button
                  onClick={() => setDeleteTarget(null)}
                  variant="ghost"
                  mode="rectangle"
                  className="w-full !text-stone-400 hover:!text-stone-900 !text-[11px] font-black uppercase py-2 tracking-widest"
                  icon={<ArrowLeft size={16} strokeWidth={3} />}
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
