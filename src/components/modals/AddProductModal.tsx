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
import { DEFAULT_TEMPLATES } from '../../data/config/constants';

const TF = () => (
  <div className="absolute -right-4 -bottom-4 opacity-[0.04] pointer-events-none transform scaleX(-1) rotate-[10deg]">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="120"
      height="120"
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M8.06 6.5a.5.5 0 0 1 .5.5v.776a11.5 11.5 0 0 1-.552 3.519l-1.331 4.14a.5.5 0 0 1-.952-.305l1.33-4.141a10.5 10.5 0 0 0 .504-3.213V7a.5.5 0 0 1 .5-.5Z" />
      <path d="M6.06 7a2 2 0 1 1 4 0 .5.5 0 1 1-1 0 1 1 0 1 0-2 0v.332q0 .613-.066 1.221A.5.5 0 0 1 6 8.447q.06-.555.06-1.115zm3.509 1a.5.5 0 0 1 .487.513 11.5 11.5 0 0 1-.587 3.339l-1.266 3.8a.5.5 0 0 1-.949-.317l1.267-3.8a10.5 10.5 0 0 0 .535-3.048A.5.5 0 0 1 9.569 8m-3.356 2.115a.5.5 0 0 1 .33.626L5.24 14.939a.5.5 0 1 1-.955-.296l1.303-4.199a.5.5 0 0 1 .625-.329" />
      <path d="M4.759 5.833A3.501 3.501 0 0 1 11.559 7a.5.5 0 0 1-1 0 2.5 2.5 0 0 0-4.857-.833.5.5 0 1 1-.943-.334m.3 1.67a.5.5 0 0 1 .449.546 10.7 10.7 0 0 1-.4 2.031l-1.222 4.072a.5.5 0 1 1-.958-.287L4.15 9.793a9.7 9.7 0 0 0 .363-1.842.5.5 0 0 1 .546-.449Zm6 .647a.5.5 0 0 1 .5.5c0 1.28-.213 2.552-.632 3.762l-1.09 3.145a.5.5 0 0 1-.944-.327l1.089-3.145c.382-1.105.578-2.266.578-3.435a.5.5 0 0 1 .5-.5Z" />
      <path d="M3.902 4.222a5 5 0 0 1 5.202-2.113.5.5 0 0 1-.208.979 4 4 0 0 0-4.163 1.69.5.5 0 0 1-.831-.556m6.72-.955a.5.5 0 0 1 .705-.052A4.99 4.99 0 0 1 13.059 7v1.5a.5.5 0 1 1-1 0V7a3.99 3.99 0 0 0-1.386-3.028.5.5 0 0 1-.051-.705M3.68 5.842a.5.5 0 0 1 .422.568q-.044.289-.044.59c0 .71-.1 1.417-.298 2.1l-1.14 3.923a.5.5 0 1 1-.96-.279L2.8 8.821A6.5 6.5 0 0 0 3.058 7q0-.375.054-.736a.5.5 0 0 1 .568-.422m8.882 3.66a.5.5 0 0 1 .456.54c-.084 1-.298 1.986-.64 2.934l-.744 2.068a.5.5 0 0 1-.941-.338l.745-2.07a10.5 10.5 0 0 0 .584-2.678.5.5 0 0 1 .54-.456" />
      <path d="M4.81 1.37A6.5 6.5 0 0 1 14.56 7a.5.5 0 1 1-1 0 5.5 5.5 0 0 0-8.25-4.765.5.5 0 0 1-.5-.865m-.89 1.257a.5.5 0 0 1 .04.706A5.48 5.48 0 0 0 2.56 7a.5.5 0 0 1-1 0c0-1.664.626-3.184 1.655-4.333a.5.5 0 0 1 .706-.04ZM1.915 8.02a.5.5 0 0 1 .346.616l-.779 2.767a.5.5 0 1 1-.962-.27l.778-2.767a.5.5 0 0 1 .617-.346m12.15.481a.5.5 0 0 1 .49.51c-.03 1.499-.161 3.025-.727 4.533l-.07.187a.5.5 0 0 1-.936-.351l.07-.187c.506-1.35.634-2.74.663-4.202a.5.5 0 0 1 .51-.49" />
    </svg>
  </div>
);

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
    selectTemplate,
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
              showFingerprint={false}
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
              showFingerprint
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
              showFingerprint
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
                showFingerprint={true}
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
                showFingerprint
                fingerprintType="detailed"
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
                showFingerprint
                fingerprintType="detailed"
                icon={<Lucide.Camera size={24} className="text-stone-400" />}
              >
                <span className="text-[13px] font-black tracking-widest text-stone-900">
                  KAMERA
                </span>
              </Button>
            </label>

            {/* HAZIR ŞABLON SEÇ SLIDER */}
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black tracking-widest text-stone-900 uppercase">
                  HAZIR ŞABLON SEÇ
                </span>
                <span className="text-[8px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase animate-pulse">
                  HIZLI EKLE ⚡
                </span>
              </div>
              
              <div className="flex gap-3 overflow-x-auto pb-3 pt-1 px-1 scrollbar-thin scrollbar-thumb-stone-200 snap-x snap-mandatory">
                {DEFAULT_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => selectTemplate(template)}
                    className="flex-shrink-0 w-32 bg-white border border-stone-150 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all text-left snap-start group relative"
                  >
                    <div className="relative h-20 w-full overflow-hidden bg-stone-100">
                      <img
                        src={template.image_url}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-1.5 right-1.5 bg-black/40 backdrop-blur-md rounded-lg px-1.5 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider">
                        {template.category.split(' ')[0]}
                      </div>
                    </div>
                    <div className="p-2 flex flex-col gap-0.5 justify-between min-h-[52px]">
                      <h5 className="text-[10px] font-bold text-stone-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                        {template.name}
                      </h5>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[9px] font-black text-stone-900">
                          {template.price} ₺
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-emerald-500 text-white rounded-full p-0.5 shadow-sm">
                          <Lucide.Zap size={8} strokeWidth={3} fill="currentColor" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setCurrentStep(2)}
              variant="secondary"
              mode="rectangle"
              className="w-full !h-16 !justify-start !px-8"
              showFingerprint
              fingerprintType="detailed"
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
                <TF />
                {['₺', '$', '€'].map((c) => (
                  <Button
                    key={c}
                    onClick={() => setFormState((p) => ({ ...p, currency: c }))}
                    variant={formState.currency === c ? 'primary' : 'ghost'}
                    className="px-8 h-10 !rounded-[calc(var(--radius-button)-4px)] z-10"
                    mode="rectangle"
                    showFingerprint={false}
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
                <TF />
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
                    showFingerprint={false}
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
