import { useRef } from 'react';
import { THEME } from '../../data/config';
import Button from '../ui/Button';
import BaseModal from './BaseModal';
import * as Lucide from 'lucide-react';
import FormInput from '../ui/FormInput';
import StatusOverlay from '../ui/StatusOverlay';
import Badge from '../ui/Badge';
import { AddProductModalProps } from '../../types';
import { useAddProductFlow } from '../../hooks/useAddProductFlow';
import { useStore } from '../../store';
import { openWhatsApp } from '../../utils/contact';

export default function AddProductModal({
  isModalOpen,
  availableCategories = [],
  onProductAddition,
  onModalClose,
  initialCategory,
  isStatic = false,
  initialStep,
}: AddProductModalProps) {
  const {
    currentStep,
    setCurrentStep,
    formState,
    setFormState,
    temporaryImagePreviewUrl,
    formErrorMessage,
    isSubmittingData,
    submissionStatus,
    handleCloseAndReset,
    handleFormInputChange,
    handleCategorySelection,
    handleImageFileSelection,
    handleProductSubmission,
    nextStep,
    prevStep,
    isStepValid,
  } = useAddProductFlow(
    isModalOpen,
    initialCategory,
    initialStep,
    onProductAddition,
    onModalClose,
  );
  const theme = THEME.addProductModal;
  const { settings } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  if (!isModalOpen) return null;
  const descValues = formState.productDescription.split('\n');
  const paddedValues =
    descValues.length < 3
      ? [...descValues, ...Array(3 - descValues.length).fill('')]
      : descValues;
  return (
    <BaseModal
      isOpen={isModalOpen}
      onClose={handleCloseAndReset}
      title={
        [
          '',
          'FOTOĞRAF',
          'İSİM',
          'DETAYLAR',
          'KATEGORİ',
          'FİYAT',
          'STOKTA MI?',
          'ÖNİZLEME',
        ][currentStep]
      }
      progress={{ current: currentStep, total: 7 }}
      disableClickOutside={isSubmittingData}
      hideCloseButton={isSubmittingData}
      isStatic={isStatic}
      footer={
        <div className="flex gap-2 w-full">
          {currentStep > 1 && (
            <Button
              onClick={prevStep}
              variant="secondary"
              mode="rectangle"
              className="w-20 h-16 shrink-0"
            >
              <Lucide.ChevronLeft size={24} strokeWidth={3} />
            </Button>
          )}
          {currentStep < 7 ? (
            <Button
              onClick={nextStep}
              disabled={!isStepValid()}
              variant="primary"
              className={`flex-1 h-16 !rounded-[24px] ${currentStep === 1 ? 'hidden' : ''}`}
            >
              <span className="font-black tracking-widest text-[11px] uppercase">
                DEVAM
              </span>
            </Button>
          ) : (
            <Button
              onClick={handleProductSubmission}
              variant="action"
              className="flex-1 h-16 !rounded-[24px]"
              disabled={isSubmittingData}
            >
              <span className="font-black tracking-[0.2em] text-[15px] uppercase">
                TAMAM
              </span>
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col">
        {currentStep === 1 && (
          <div className="flex flex-col gap-3 py-2 fade-in">
            {/* BULK UPLOAD CALLOUT - PREMIUM GLASSMORPHIC */}
            <div className="bg-emerald-500/[0.04] border border-emerald-500/10 rounded-[1.5rem] p-4 relative overflow-hidden flex flex-col gap-3">
              <div className="flex gap-3">
                <span className="text-xl shrink-0 mt-0.5">📊</span>
                <div className="flex flex-col">
                  <h4 className="text-[10px] font-black text-emerald-600 tracking-[0.2em] uppercase leading-tight">
                    Toplu Ürün Yükleme
                  </h4>
                  <p className="text-[9px] text-stone-500 font-bold leading-normal mt-1">
                    Ürünlerinizi tek tek eklemek yerine; CSV, Excel veya PDF listenizi WhatsApp'tan gönderin, sizin yerinize saniyeler içinde yükleyelim!
                  </p>
                </div>
              </div>
              <Button
                variant="whatsapp"
                mode="rectangle"
                className="w-full !h-10 !rounded-xl"
                onClick={() => {
                  const number = settings?.whatsapp || '';
                  openWhatsApp(
                    number,
                    'Merhaba, ürünlerimizi dijital kataloğumuza toplu olarak yüklemek istiyoruz. Excel/PDF/CSV listemizi ekte iletiyoruz. Destek olur musunuz?',
                  );
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Lucide.Send size={12} strokeWidth={3} className="text-white animate-pulse" />
                  <span className="text-[9px] font-black tracking-widest text-white uppercase">
                    WHATSAPP İLE TOPLU YÜKLE
                  </span>
                </div>
              </Button>
            </div>

            <input
              id="p-img"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageFileSelection}
            />
            <label htmlFor="p-img" className="cursor-pointer">
              <Button
                as="div"
                variant="secondary"
                mode="rectangle"
                className="w-full !h-16 !justify-start !px-8"
                icon={<Lucide.ImageIcon size={24} className="text-stone-400" />}
              >
                <span className="text-[13px] font-black tracking-widest text-stone-900">
                  GALERİ
                </span>
              </Button>
            </label>
            <label
              htmlFor="p-img"
              className="cursor-pointer"
              onClick={() =>
                fileInputRef.current?.setAttribute('capture', 'environment')
              }
            >
              <Button
                as="div"
                variant="secondary"
                mode="rectangle"
                className="w-full !h-16 !justify-start !px-8"
                icon={<Lucide.Camera size={24} className="text-stone-400" />}
              >
                <span className="text-[13px] font-black tracking-widest text-stone-900">
                  KAMERA
                </span>
              </Button>
            </label>
            <Button
              onClick={() => setCurrentStep(2)}
              variant="secondary"
              mode="rectangle"
              className="w-full !h-16 !justify-start !px-8"
            >
              <span className="text-[11px] font-black tracking-widest uppercase text-stone-400">
                Fotoğrafsız Devam Edelim
              </span>
            </Button>
          </div>
        )}
        {currentStep === 2 && (
          <div className={`${theme.wizard.stepContent} relative`}>
            <FormInput
              id="p-name"
              labelText=""
              name="productName"
              value={formState.productName}
              onChange={handleFormInputChange}
              placeholder="Örn: Türk Kahvesi"
              autoFocus
            />
          </div>
        )}
        {currentStep === 3 && (
          <div className={`${theme.wizard.stepContent} relative space-y-4`}>
            <div className="space-y-1 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
              {paddedValues.map((v, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <span className="text-[12px] font-black text-stone-400 w-5 text-right shrink-0">
                    {i + 1}.
                  </span>
                  <input
                    type="text"
                    value={v}
                    onChange={(e) => {
                      const n = [...paddedValues];
                      n[i] = e.target.value;
                      handleFormInputChange({
                        target: {
                          name: 'productDescription',
                          value: n.join('\n'),
                        },
                      } as any);
                    }}
                    placeholder={
                      i === 0
                        ? 'Örn: 20X20'
                        : i === 1
                          ? 'Örn: Kırmızı, Beyaz'
                          : 'Örn: 100ad.'
                    }
                    className="w-full bg-transparent border-b border-stone-100 py-4 text-[14px] font-bold text-stone-900 placeholder:text-stone-300 focus:border-stone-900 outline-none transition-colors"
                    autoFocus={i === paddedValues.length - 1 && i > 2}
                  />
                </div>
              ))}
            </div>
            <Button
              onClick={() =>
                handleFormInputChange({
                  target: {
                    name: 'productDescription',
                    value: [...paddedValues, ''].join('\n'),
                  },
                } as any)
              }
              variant="ghost"
              className="!h-10 !w-full !justify-start !px-9 !-ml-1 opacity-50 hover:opacity-100"
              icon={<Lucide.Plus size={14} strokeWidth={3} />}
            >
              <span className="text-[10px] font-black tracking-widest uppercase">
                YENİ DETAY EKLE
              </span>
            </Button>
          </div>
        )}
        {currentStep === 4 && (
          <div className="flex flex-col gap-6 py-2">
            <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {availableCategories.map((c) => (
                <Button
                  key={c}
                  onClick={() => handleCategorySelection(c)}
                  variant={
                    formState.selectedCategory === c ? 'primary' : 'secondary'
                  }
                  className="!h-10 !px-4 !rounded-xl"
                  mode="rectangle"
                >
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    {c}
                  </span>
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-black text-stone-400 tracking-widest uppercase px-2">
                VEYA YENİ OLUŞTUR
              </span>
              <FormInput
                id="c-cat"
                labelText=""
                name="customCategoryName"
                value={formState.customCategoryName}
                onChange={handleFormInputChange}
                placeholder="Yeni kategori adı..."
              />
            </div>
          </div>
        )}
        {currentStep === 5 && (
          <div
            className={`${theme.wizard.stepContent} relative flex flex-col items-center`}
          >
            <div className="flex flex-col gap-6 w-full max-w-[340px] items-center">
              <input
                type="text"
                inputMode="decimal"
                value={formState.productPrice}
                onChange={handleFormInputChange}
                name="productPrice"
                placeholder="0.00"
                className={`${theme.inputField} !text-5xl font-black py-8 text-center w-full bg-transparent border-none`}
                autoFocus
              />
              <div className="bg-stone-100 p-1 rounded-[var(--radius-button)] flex w-fit mx-auto relative overflow-hidden gap-1">
                {['₺', '$', '€'].map((c) => (
                  <Button
                    key={c}
                    onClick={() => setFormState((p) => ({ ...p, currency: c }))}
                    variant={formState.currency === c ? 'primary' : 'ghost'}
                    className="px-8 h-10 !rounded-[calc(var(--radius-button)-4px)] z-10"
                    mode="rectangle"
                  >
                    <span className="text-lg font-black">{c}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
        {currentStep === 6 && (
          <div
            className={`${theme.wizard.stepContent} relative pt-4 flex flex-col items-center`}
          >
            <div className="flex flex-col gap-6 w-full max-w-[320px]">
              <div className="bg-stone-100 p-1 rounded-[var(--radius-button)] flex w-fit mx-auto relative overflow-hidden gap-1">
                {[false, true].map((v) => (
                  <Button
                    key={v.toString()}
                    onClick={() =>
                      setFormState((p) => ({ ...p, isProductInStock: v }))
                    }
                    variant={
                      formState.isProductInStock === v ? 'primary' : 'ghost'
                    }
                    className="px-8 h-10 !rounded-[calc(var(--radius-button)-4px)] z-10"
                    mode="rectangle"
                  >
                    <span className="text-[10px] font-black whitespace-nowrap">
                      {v ? 'STOKTA' : 'STOKTA YOK'}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
        {currentStep === 7 && (
          <div className="flex flex-col gap-6 fade-in pt-2">
            <div className="bg-stone-50 border border-stone-100 p-6 rounded-[var(--radius-card)] relative overflow-hidden">
              <div className="flex gap-5 items-center relative z-10">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-stone-200 shrink-0 shadow-sm">
                  {temporaryImagePreviewUrl ? (
                    <img
                      src={temporaryImagePreviewUrl}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      📷
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-black text-stone-400 tracking-widest uppercase mb-1">
                    {formState.customCategoryName ||
                      formState.selectedCategory ||
                      'DİĞER'}
                  </span>
                  <h3 className="text-xl font-black text-stone-900 truncate uppercase tracking-tighter">
                    {formState.productName || 'İsimsiz Ürün'}
                  </h3>
                  <span className="text-xl font-black text-black tracking-tighter mt-1">
                    {formState.currency}
                    {formState.productPrice || '0.00'}
                  </span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-stone-200/50 space-y-3">
                {formState.productDescription
                  .split('\n')
                  .filter((l: string) => l.trim())
                  .map((l: string, i: number) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-stone-300 mt-1.5 shrink-0" />
                      <p className="text-[13px] font-bold text-stone-600 leading-relaxed">
                        {l}
                      </p>
                    </div>
                  ))}
                <div className="flex gap-3 items-center pt-2">
                  <div className="flex gap-3 items-center pt-2">
                    <Badge
                      variant={
                        formState.isProductInStock ? 'success' : 'danger'
                      }
                      showDot
                      pulse={formState.isProductInStock}
                    />
                    <p className="text-[11px] font-black text-stone-900 tracking-widest uppercase">
                      {formState.isProductInStock ? 'STOKTA VAR' : 'STOKTA YOK'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {formErrorMessage && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100 animate-in slide-in-from-top-2 duration-300">
                {formErrorMessage}
              </div>
            )}
          </div>
        )}
      </div>
      <StatusOverlay status={submissionStatus} message="" mode="contained" />
    </BaseModal>
  );
}
