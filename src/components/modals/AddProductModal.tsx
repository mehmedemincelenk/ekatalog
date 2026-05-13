import React, { useState, useCallback, useRef } from 'react';
import { LABELS, THEME } from '../../data/config';
import Button from '../ui/Button';
import BaseModal from './BaseModal';
import * as Lucide from 'lucide-react';
import FormInput from '../ui/FormInput';
import StatusOverlay from '../ui/StatusOverlay';
import Badge from '../ui/Badge';

/**
 * ADD PRODUCT MODAL COMPONENT (100% Tokenized & Professional English)
 * -----------------------------------------------------------
 * Orchestrates the product creation workflow. Fully managed via THEME.
 */

import {
  AddProductModalProps,
} from '../../types';
import { useStore } from '../../store';

const INITIAL_FORM_STATE = {
  productName: '',
  selectedCategory: '',
  customCategoryName: '',
  productPrice: '',
  currency: '₺',
  productDescription: '',
  selectedImageFile: null as File | null,
  isProductInStock: true,
};

// --- INTERNAL UI SUB-COMPONENTS ---

// CUSTOM DIAMOND SEAL SVG (Same as Button.tsx)
const ToggleFingerprint = () => (
  <div className="absolute -right-4 -bottom-4 opacity-[0.04] pointer-events-none transform scaleX(-1) rotate-[10deg]">
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8.06 6.5a.5.5 0 0 1 .5.5v.776a11.5 11.5 0 0 1-.552 3.519l-1.331 4.14a.5.5 0 0 1-.952-.305l1.33-4.141a10.5 10.5 0 0 0 .504-3.213V7a.5.5 0 0 1 .5-.5Z"/>
      <path d="M6.06 7a2 2 0 1 1 4 0 .5.5 0 1 1-1 0 1 1 0 1 0-2 0v.332q0 .613-.066 1.221A.5.5 0 0 1 6 8.447q.06-.555.06-1.115zm3.509 1a.5.5 0 0 1 .487.513 11.5 11.5 0 0 1-.587 3.339l-1.266 3.8a.5.5 0 0 1-.949-.317l1.267-3.8a10.5 10.5 0 0 0 .535-3.048A.5.5 0 0 1 9.569 8m-3.356 2.115a.5.5 0 0 1 .33.626L5.24 14.939a.5.5 0 1 1-.955-.296l1.303-4.199a.5.5 0 0 1 .625-.329"/>
      <path d="M4.759 5.833A3.501 3.501 0 0 1 11.559 7a.5.5 0 0 1-1 0 2.5 2.5 0 0 0-4.857-.833.5.5 0 1 1-.943-.334m.3 1.67a.5.5 0 0 1 .449.546 10.7 10.7 0 0 1-.4 2.031l-1.222 4.072a.5.5 0 1 1-.958-.287L4.15 9.793a9.7 9.7 0 0 0 .363-1.842.5.5 0 0 1 .546-.449Zm6 .647a.5.5 0 0 1 .5.5c0 1.28-.213 2.552-.632 3.762l-1.09 3.145a.5.5 0 0 1-.944-.327l1.089-3.145c.382-1.105.578-2.266.578-3.435a.5.5 0 0 1 .5-.5Z"/>
      <path d="M3.902 4.222a5 5 0 0 1 5.202-2.113.5.5 0 0 1-.208.979 4 4 0 0 0-4.163 1.69.5.5 0 0 1-.831-.556m6.72-.955a.5.5 0 0 1 .705-.052A4.99 4.99 0 0 1 13.059 7v1.5a.5.5 0 1 1-1 0V7a3.99 3.99 0 0 0-1.386-3.028.5.5 0 0 1-.051-.705M3.68 5.842a.5.5 0 0 1 .422.568q-.044.289-.044.59c0 .71-.1 1.417-.298 2.1l-1.14 3.923a.5.5 0 1 1-.96-.279L2.8 8.821A6.5 6.5 0 0 0 3.058 7q0-.375.054-.736a.5.5 0 0 1 .568-.422m8.882 3.66a.5.5 0 0 1 .456.54c-.084 1-.298 1.986-.64 2.934l-.744 2.068a.5.5 0 0 1-.941-.338l.745-2.07a10.5 10.5 0 0 0 .584-2.678.5.5 0 0 1 .54-.456"/>
      <path d="M4.81 1.37A6.5 6.5 0 0 1 14.56 7a.5.5 0 1 1-1 0 5.5 5.5 0 0 0-8.25-4.765.5.5 0 0 1-.5-.865m-.89 1.257a.5.5 0 0 1 .04.706A5.48 5.48 0 0 0 2.56 7a.5.5 0 0 1-1 0c0-1.664.626-3.184 1.655-4.333a.5.5 0 0 1 .706-.04ZM1.915 8.02a.5.5 0 0 1 .346.616l-.779 2.767a.5.5 0 1 1-.962-.27l.778-2.767a.5.5 0 0 1 .617-.346m12.15.481a.5.5 0 0 1 .49.51c-.03 1.499-.161 3.025-.727 4.533l-.07.187a.5.5 0 0 1-.936-.351l.07-.187c.506-1.35.634-2.74.663-4.202a.5.5 0 0 1 .51-.49"/>
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
  const { settings } = useStore();
  const [currentStep, setCurrentStep] = useState(initialStep || 1);
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const [temporaryImagePreviewUrl, setTemporaryImagePreviewUrl] = useState<string | null>(null);
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [isSubmittingData, setIsSubmittingData] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const theme = THEME.addProductModal;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect: Handle initial category sync and cleanup memory leaks from image previews
  React.useEffect(() => {
    if (isModalOpen && initialCategory) {
      setFormState((prev) => ({
        ...prev,
        selectedCategory: initialCategory,
        customCategoryName: '',
      }));
    }

    // Cleanup: Memory leak prevention (revoking temporary image URLs)
    return () => {
      if (temporaryImagePreviewUrl) {
        URL.revokeObjectURL(temporaryImagePreviewUrl);
      }
    };
  }, [isModalOpen, initialCategory, temporaryImagePreviewUrl]);

  // Sync step from props if provided (Workspace Mode)
  React.useEffect(() => {
    if (initialStep !== undefined) {
      setCurrentStep(initialStep);
    }
  }, [initialStep]);

  const handleCloseAndReset = useCallback(() => {
    if (isSubmittingData) return;

    // Direct cleanup for the preview URL before resting state
    if (temporaryImagePreviewUrl) {
      URL.revokeObjectURL(temporaryImagePreviewUrl);
    }

    setFormState(INITIAL_FORM_STATE);
    setTemporaryImagePreviewUrl(null);
    setFormErrorMessage('');
    setCurrentStep(1);
    onModalClose();
  }, [isSubmittingData, onModalClose, temporaryImagePreviewUrl]);

  const handleFormInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target;
      setFormState((previousState) => ({
        ...previousState,
        [name]: value,
        selectedCategory:
          name === 'customCategoryName' && value.trim()
            ? ''
            : previousState.selectedCategory,
      }));
      setFormErrorMessage('');
    },
    [],
  );

  const handleCategorySelection = useCallback((category: string) => {
    setFormState((previousState) => ({
      ...previousState,
      selectedCategory: category,
      customCategoryName: '',
    }));
  }, []);

  const handleImageFileSelection = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Revoke old URL before creating new one
      if (temporaryImagePreviewUrl) {
        URL.revokeObjectURL(temporaryImagePreviewUrl);
      }

      setFormState((previousState) => ({
        ...previousState,
        selectedImageFile: file,
      }));
      const localUrl = URL.createObjectURL(file);
      setTemporaryImagePreviewUrl(localUrl);
      setCurrentStep(2); // AUTO ADVANCE TO NAME
    },
    [temporaryImagePreviewUrl],
  );

  const handleProductSubmission = async () => {
    if (isSubmittingData) return;
    const finalizedCategory =
      formState.customCategoryName.trim() || formState.selectedCategory.trim();

    setIsSubmittingData(true);
    setSubmissionStatus('loading');
    try {
      const { transformCurrencyStringToNumber } =
        await import('../../utils/price');
      const numericPrice = transformCurrencyStringToNumber(
        formState.productPrice,
      );
      
      // Manual currency prefixing for the Diamond Standard
      const standardizedPriceLabel = `${formState.currency}${numericPrice}`;

      if (!settings?.id) throw new Error('Mağaza ID bulunamadı');

      await onProductAddition(
        {
          name: formState.productName.trim(),
          category: finalizedCategory,
          price: standardizedPriceLabel,
          description: formState.productDescription.trim(),
          image_url: null,
          out_of_stock: !formState.isProductInStock,
          is_archived: false,
          store_id: settings.id,
        },
        formState.selectedImageFile || undefined,
      );
      
      setSubmissionStatus('success');
      setTimeout(() => {
        handleCloseAndReset();
        setSubmissionStatus('idle');
      }, 2000);
    } catch {
      setSubmissionStatus('error');
      setFormErrorMessage(LABELS.saveError);
      setTimeout(() => setSubmissionStatus('idle'), 3000);
    } finally {
      setIsSubmittingData(false);
    }
  };

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const isStepValid = () => {
    if (currentStep === 1 && !formState.selectedImageFile) return true; // Allows skipping photo
    if (currentStep === 2) return !!formState.productName.trim();
    if (currentStep === 4)
      return !!(
        formState.selectedCategory.trim() || formState.customCategoryName.trim()
      );
    if (currentStep === 5) return !!formState.productPrice.trim();
    return true;
  };

  if (!isModalOpen) return null;

  return (
    <BaseModal
      isOpen={isModalOpen}
      onClose={handleCloseAndReset}
      title={
        currentStep === 1 ? 'FOTOĞRAF' : 
        currentStep === 2 ? 'İSİM' : 
        currentStep === 3 ? 'DETAYLAR' : 
        currentStep === 4 ? 'KATEGORİ' : 
        currentStep === 5 ? 'FİYAT' : 
        currentStep === 6 ? 'STOKTA MI?' : 
        'ÖNİZLEME'
      }
      progress={{ current: currentStep, total: 7 }}
      disableClickOutside={isSubmittingData}
      hideCloseButton={isSubmittingData}
      isStatic={isStatic}
      footer={(
        <div className="flex gap-2 w-full">
          {currentStep > 1 && (
            <Button onClick={prevStep} variant="secondary" mode="rectangle" className="w-20 h-16 shrink-0" showFingerprint={false}>
              <Lucide.ChevronLeft size={24} strokeWidth={3} />
            </Button>
          )}
          {currentStep < 7 ? (
            <Button
              onClick={nextStep}
              disabled={!isStepValid()}
              variant="primary"
              className={`flex-1 h-16 !rounded-[24px] ${currentStep === 1 ? 'hidden' : ''}`}
              showFingerprint={true}
            >
              <span className="font-black tracking-widest text-[11px] uppercase">DEVAM</span>
            </Button>
          ) : (
            <Button 
              onClick={handleProductSubmission} 
              variant="action" 
              className="flex-1 h-16 !rounded-[24px]" 
              showFingerprint={true}
              disabled={isSubmittingData}
            >
              <span className="font-black tracking-[0.2em] text-[15px] uppercase">TAMAM</span>
            </Button>
          )}
        </div>
      )}
    >
      <div className="flex flex-col">
        {/* STEP 1: PHOTO CHOICE */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-3 py-2 fade-in">
            <input
              id="product-image-input"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageFileSelection}
            />

            <label htmlFor="product-image-input" className="cursor-pointer">
              <Button
                as="div"
                variant="secondary"
                mode="rectangle"
                className="w-full !h-16 !justify-start !px-8"
                showFingerprint={true}
                fingerprintType="detailed"
                icon={<Lucide.ImageIcon size={24} className="text-stone-400" />}
              >
                <span className="text-[13px] font-black tracking-widest text-stone-900">GALERİ</span>
              </Button>
            </label>

            <label 
              htmlFor="product-image-input" 
              className="cursor-pointer"
              onClick={() => fileInputRef.current?.setAttribute('capture', 'environment')}
            >
              <Button
                as="div"
                variant="secondary"
                mode="rectangle"
                className="w-full !h-16 !justify-start !px-8"
                showFingerprint={true}
                fingerprintType="detailed"
                icon={<Lucide.Camera size={24} className="text-stone-400" />}
              >
                <span className="text-[13px] font-black tracking-widest text-stone-900">KAMERA</span>
              </Button>
            </label>

            <Button
              onClick={() => setCurrentStep(2)} 
              variant="secondary"
              mode="rectangle"
              className="w-full !h-16 !justify-start !px-8"
              showFingerprint={true}
              fingerprintType="detailed"
            >
              <span className="text-[11px] font-black tracking-widest uppercase text-stone-400">Fotoğrafsız Devam Edelim</span>
            </Button>
          </div>
        )}

        {/* STEP 2: NAME */}
        {currentStep === 2 && (
          <div className={`${theme.wizard.stepContent} relative`}>
            <FormInput
              id="product-name-input"
              labelText=""
              name="productName"
              value={formState.productName}
              onChange={handleFormInputChange}
              placeholder="Örn: Türk Kahvesi"
              autoFocus
            />
          </div>
        )}

        {/* STEP 3: DETAILS (Dynamic Multi-Input) */}
        {currentStep === 3 && (
          <div className={`${theme.wizard.stepContent} relative space-y-4`}>
            {(() => {
              const currentValues = formState.productDescription.split('\n');
              const displayValues = currentValues.length < 3 ? [...currentValues, ...Array(3 - currentValues.length).fill('')] : currentValues;
              
              return (
                <>
                  <div className="space-y-1 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                    {displayValues.map((val, idx) => (
                      <div key={idx} className="flex items-center gap-4 group">
                        <span className="text-[12px] font-black text-stone-400 w-5 text-right shrink-0">{idx + 1}.</span>
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => {
                            const newValues = [...displayValues];
                            newValues[idx] = e.target.value;
                            handleFormInputChange({
                              target: { name: 'productDescription', value: newValues.join('\n') }
                            } as unknown as React.ChangeEvent<HTMLInputElement>);
                          }}
                          placeholder={idx === 0 ? 'Örn: 20X20' : idx === 1 ? 'Örn: Kırmızı, Beyaz' : 'Örn: 100ad.'}
                          className={`w-full bg-transparent border-b border-stone-100 py-4 text-[14px] font-bold text-stone-900 placeholder:text-stone-300 focus:border-stone-900 outline-none transition-colors`}
                          autoFocus={idx === displayValues.length - 1 && idx > 2}
                        />
                      </div>
                    ))}
                  </div>

                  {/* ADD NEW DETAIL BUTTON */}
                  <Button
                    onClick={() => {
                      const newValues = [...displayValues, ''];
                      handleFormInputChange({
                        target: { name: 'productDescription', value: newValues.join('\n') }
                      } as unknown as React.ChangeEvent<HTMLInputElement>);
                    }}
                    variant="ghost"
                    className="!h-10 !w-full !justify-start !px-9 !-ml-1 opacity-50 hover:opacity-100"
                    icon={<Lucide.Plus size={14} strokeWidth={3} />}
                  >
                    <span className="text-[10px] font-black tracking-widest uppercase">YENİ DETAY EKLE</span>
                  </Button>
                </>
              );
            })()}
          </div>
        )}

        {/* STEP 4: CATEGORY */}
        {currentStep === 4 && (
          <div className="flex flex-col gap-6 py-2">
            <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {availableCategories.map((cat) => (
                <Button
                  key={cat}
                  onClick={() => handleCategorySelection(cat)}
                  variant={formState.selectedCategory === cat ? 'primary' : 'secondary'}
                  className="!h-10 !px-4 !rounded-xl"
                  mode="rectangle"
                >
                  <span className="text-[11px] font-black uppercase tracking-widest">{cat}</span>
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black text-stone-400 tracking-widest uppercase px-2">VEYA YENİ OLUŞTUR</span>
              <FormInput
                id="custom-category-input"
                labelText=""
                name="customCategoryName"
                value={formState.customCategoryName}
                onChange={handleFormInputChange}
                placeholder="Yeni kategori adı..."
              />
            </div>
          </div>
        )}

        {/* STEP 5: PRICE */}
        {currentStep === 5 && (
          <div className={`${theme.wizard.stepContent} relative flex flex-col items-center`}>
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
                <ToggleFingerprint />
                {['₺', '$', '€'].map((curr) => (
                  <Button
                    key={curr}
                    onClick={() => setFormState(p => ({ ...p, currency: curr }))}
                    variant={formState.currency === curr ? 'primary' : 'ghost'}
                    className={`px-8 h-10 !rounded-[calc(var(--radius-button)-4px)] z-10`}
                    mode="rectangle"
                    showFingerprint={false}
                  >
                    <span className="text-lg font-black">{curr}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: STOCK */}
        {currentStep === 6 && (
          <div className={`${theme.wizard.stepContent} relative pt-4 flex flex-col items-center`}>
            <div className="flex flex-col gap-6 w-full max-w-[320px]">
              <div className="bg-stone-100 p-1 rounded-[var(--radius-button)] flex w-fit mx-auto relative overflow-hidden gap-1">
                <ToggleFingerprint />
                <Button
                  onClick={() => setFormState(p => ({ ...p, isProductInStock: false }))}
                  variant={!formState.isProductInStock ? 'primary' : 'ghost'}
                  className={`px-8 h-10 !rounded-[calc(var(--radius-button)-4px)] z-10`}
                  mode="rectangle"
                  showFingerprint={false}
                >
                  <span className="text-[10px] font-black whitespace-nowrap">STOKTA YOK</span>
                </Button>
                <Button
                  onClick={() => setFormState(p => ({ ...p, isProductInStock: true }))}
                  variant={formState.isProductInStock ? 'primary' : 'ghost'}
                  className={`px-8 h-10 !rounded-[calc(var(--radius-button)-4px)] z-10`}
                  mode="rectangle"
                  showFingerprint={false}
                >
                  <span className="text-[10px] font-black whitespace-nowrap">STOKTA</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: PREVIEW & CONFIRM */}
        {currentStep === 7 && (
          <div className="flex flex-col gap-6 fade-in pt-2">
            <div className="bg-stone-50 border border-stone-100 p-6 rounded-[var(--radius-card)] relative overflow-hidden">
               <div className="flex gap-5 items-center relative z-10">
                 <div className="w-24 h-24 rounded-2xl overflow-hidden bg-stone-200 shrink-0 shadow-sm">
                   {temporaryImagePreviewUrl ? (
                     <img src={temporaryImagePreviewUrl} className="w-full h-full object-cover" alt="Preview" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-stone-400">📷</div>
                   )}
                 </div>
                 <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black text-stone-400 tracking-widest uppercase mb-1">{formState.customCategoryName || formState.selectedCategory || 'DİĞER'}</span>
                    <h3 className="text-xl font-black text-stone-900 truncate uppercase tracking-tighter">{formState.productName || 'İsimsiz Ürün'}</h3>
                    <span className="text-xl font-black text-black tracking-tighter mt-1">{formState.currency}{formState.productPrice || '0.00'}</span>
                 </div>
               </div>
               
               <div className="mt-6 pt-6 border-t border-stone-200/50 space-y-3">
                 {formState.productDescription.split('\n').filter(l => l.trim()).map((line, idx) => (
                   <div key={idx} className="flex gap-3 items-start">
                     <div className="w-1.5 h-1.5 rounded-full bg-stone-300 mt-1.5 shrink-0" />
                     <p className="text-[13px] font-bold text-stone-600 leading-relaxed">{line}</p>
                   </div>
                 ))}
                 <div className="flex gap-3 items-center pt-2">
                  <div className="flex gap-3 items-center pt-2">
                     <Badge variant={formState.isProductInStock ? 'success' : 'danger'} showDot={true} pulse={formState.isProductInStock} />
                     <p className="text-[11px] font-black text-stone-900 tracking-widest uppercase">{formState.isProductInStock ? 'STOKTA VAR' : 'STOKTA YOK'}</p>
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

      {/* SUCCESS / ERROR OVERLAY (DIAMOND FEEDBACK) */}
      <StatusOverlay 
        status={submissionStatus} 
        message="" 
        mode="contained"
      />
    </BaseModal>
  );
}
