import { useRef } from 'react';
import { THEME } from '../../data/config';
import Button from '../ui/Button';
import ToggleButton from '../ui/ToggleButton';
import BaseModal from './BaseModal';
import * as Lucide from 'lucide-react';
import FormInput from '../ui/FormInput';
import StatusOverlay from '../ui/StatusOverlay';
import { AddProductModalProps } from '../../types';
import { useAddProductFlow } from '../../hooks/useAddProductFlow';
import { useStore } from '../../store';
import { openWhatsApp } from '../../utils/contact';
import CategoryFilterChip from '../ui/CategoryFilterChip';
import ProductCard from '../layout/ProductCard';

export default function AddProductModal({
  isModalOpen,
  availableCategories = [],
  onProductAddition,
  onModalClose,
  initialCategory,
  isStatic = false,
  initialStep,
  allProducts = [],
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
                    Ürünlerinizi tek tek eklemek yerine; CSV, Excel veya PDF
                    listenizi WhatsApp'tan gönderin, sizin yerinize saniyeler
                    içinde yükleyelim!
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
                  <Lucide.Send
                    size={12}
                    strokeWidth={3}
                    className="text-white animate-pulse"
                  />
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
                  <span className="text-[12px] font-black text-stone-500 w-5 text-right shrink-0">
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
                    className="w-full bg-transparent border-b border-stone-200 py-4 text-[14px] font-bold text-stone-900 placeholder:text-stone-400 focus:border-stone-900 outline-none transition-colors"
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
              {availableCategories.map((c) => {
                const count = allProducts ? allProducts.filter((p) => p.category === c).length : 0;
                return (
                  <CategoryFilterChip
                    key={c}
                    categoryName={c}
                    isItemSelected={formState.selectedCategory === c}
                    isAdminMode={false}
                    productCount={count}
                    onSelect={handleCategorySelection}
                  />
                );
              })}
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
              <ToggleButton
                options={[
                  { value: '₺', label: <span className="text-lg font-black">₺</span> },
                  { value: '$', label: <span className="text-lg font-black">$</span> },
                  { value: '€', label: <span className="text-lg font-black">€</span> },
                ]}
                value={formState.currency}
                onChange={(val) => setFormState((p) => ({ ...p, currency: val }))}
                className="mx-auto w-fit"
                buttonClassName="px-8 !h-10"
              />
            </div>
          </div>
        )}
        {currentStep === 6 && (
          <div
            className={`${theme.wizard.stepContent} relative pt-4 flex flex-col items-center`}
          >
            <div className="flex flex-col gap-6 w-full max-w-[320px]">
              <ToggleButton
                options={[
                  { value: true, label: <span className="text-[10px] font-black whitespace-nowrap">STOKTA</span> },
                  { value: false, label: <span className="text-[10px] font-black whitespace-nowrap">STOKTA YOK</span> },
                ]}
                value={formState.isProductInStock}
                onChange={(val) => setFormState((p) => ({ ...p, isProductInStock: val }))}
                className="mx-auto w-fit"
                buttonClassName="px-8 !h-10"
              />
            </div>
          </div>
        )}
        {currentStep === 7 && (
          <div className="flex flex-col gap-6 fade-in pt-2 items-center justify-center">
            <div className="w-full max-w-[280px]">
              <ProductCard
                product={{
                  id: 'preview-id',
                  name: formState.productName || 'İsimsiz Ürün',
                  category: formState.customCategoryName || formState.selectedCategory || 'DİĞER',
                  price: `${formState.currency}${formState.productPrice || '0.00'}`,
                  description: formState.productDescription || '',
                  image_url: temporaryImagePreviewUrl,
                  original_image_url: temporaryImagePreviewUrl,
                  polished_image_url: null,
                  is_polished_pending: false,
                  polished_ready_dismissed: false,
                  text_polished_dismissed: false,
                  suggested_name: null,
                  suggested_description: null,
                  out_of_stock: !formState.isProductInStock,
                  is_archived: false,
                  sort_order: 0,
                  store_id: 'preview-store',
                }}
                categories={availableCategories}
                isAdmin={false}
                isInlineEnabled={false}
                showPrice={true}
                onDelete={() => {}}
                onUpdate={() => {}}
              />
            </div>
            {formErrorMessage && (
              <div className="flex flex-col gap-3 w-full animate-in slide-in-from-top-2 duration-300">
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl text-[12px] font-medium text-stone-600 leading-relaxed text-center shadow-sm">
                  {formErrorMessage}
                </div>
                <Button
                  variant="whatsapp"
                  mode="rectangle"
                  className="w-full !h-11 !rounded-xl"
                  onClick={() => {
                    openWhatsApp(
                      '905373420161',
                      `Merhaba, ürünümü kataloğa eklerken bir durumla karşılaştım. Yardımcı olabilir misiniz? Ürün Adı: ${formState.productName || 'Belirtilmedi'}`,
                    );
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Lucide.MessageCircle size={14} strokeWidth={3} className="text-white" />
                    <span className="text-[10px] font-black tracking-widest text-white uppercase">
                      DESTEK EKİBİNE YAZIN
                    </span>
                  </div>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      <StatusOverlay status={submissionStatus} message="" mode="contained" />
    </BaseModal>
  );
}
