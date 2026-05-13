import { useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import BaseModal from './BaseModal';
import * as Lucide from 'lucide-react';
import FormInput from '../ui/FormInput';
import StatusOverlay from '../ui/StatusOverlay';
import StatusToggle from '../ui/StatusToggle';
import { transformCurrencyStringToNumber } from '../../utils/core';
import { BulkPriceUpdateModalProps, Product } from '../../types';

type ActionType = 'PRICE' | 'DELETE' | 'ARCHIVE' | 'STOCK' | null;

interface DeskItemState {
  included: boolean;
  manualPrice?: number;
  manualInStock?: boolean;
  manualArchived?: boolean;
}

/**
 * DESK ITEM ROW (Local Diamond Utility)
 * Optimized with memo to prevent redundant re-renders during bulk toggles.
 */
const DeskItemRow = memo(
  ({
    product,
    state,
    actionType,
    newPriceValue,
    onToggle,
  }: {
    product: Product;
    state: DeskItemState;
    actionType: ActionType;
    newPriceValue: number;
    onToggle: (id: string) => void;
  }) => {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: state.included ? 1 : 0.6, 
          filter: state.included ? 'grayscale(0%) opacity(1)' : 'grayscale(100%) opacity(0.7)'
        }}
        className={`flex flex-col items-stretch gap-3 p-3.5 rounded-[28px] border transition-all duration-500 ${state.included ? 'bg-white border-stone-100 shadow-sm' : 'bg-stone-50/30 border-transparent'}`}
      >
        {/* ROW 1: PRODUCT INFO */}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-100 border border-stone-100 shrink-0">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-300">
                <Lucide.Sparkles size={18} />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-black text-stone-900 truncate uppercase tracking-tighter leading-none">
              {product.name}
            </p>
            {product.description && (
              <p className="text-[9px] font-bold text-stone-400 truncate mt-1">
                {product.description}
              </p>
            )}
          </div>
        </div>

        {/* ROW 2: PRICE & TOGGLE */}
        <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-stone-100">
          {actionType === 'PRICE' && state.included && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[9px] font-black text-stone-300 line-through">
                {product.price}
              </span>
              <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                {newPriceValue.toLocaleString('tr-TR')} ₺
              </span>
            </div>
          )}

          <div className="shrink-0 pointer-events-auto min-w-[80px]">
            <StatusToggle 
              value={state.included} 
              onChange={() => onToggle(product.id)}
              variant="compact"
            />
          </div>
        </div>
      </motion.div>
    );
  },
);

/**
 * BULK PRICE UPDATE MODAL (Diamond Standard)
 * -----------------------------------------------------------
 * A high-powered wizard for mass-managing catalog economics.
 */
export default function BulkPriceUpdateModal({
  isOpen,
  onClose,
  allProducts,
  categories,
  onGranularUpdate,
  isStatic = false,
  initialStep,
}: BulkPriceUpdateModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep || 1);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isPercentage, setIsPercentage] = useState<boolean | null>(null);
  const [isIncrease, setIsIncrease] = useState<boolean | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [deskItems, setDeskItems] = useState<Record<string, DeskItemState>>({});



  const resetAll = () => {
    setCurrentStep(1);
    setActionType(null);
    setSelectedCategories([]);
    setIsPercentage(null);
    setIsIncrease(null);
    setInputValue('');
    setDeskItems({});
    setIsProcessing(false);
    setSubmitStatus('idle');
  };

  const nextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2); // Move to Category
      return;
    }
    
    if (currentStep === 2) {
      if (actionType === 'PRICE') {
        setCurrentStep(2.1);
        return;
      }
      prepareDeskAndDirectTo(3);
      return;
    }

    if (currentStep === 2.1) {
      setCurrentStep(2.2);
      return;
    }
    if (currentStep === 2.2) {
      setCurrentStep(2.3);
      return;
    }
    if (currentStep === 2.3) {
      prepareDeskAndDirectTo(3);
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  const prepareDeskAndDirectTo = (targetStep: number) => {
    const productsForDesk = allProducts.filter(
      (p) =>
        selectedCategories.length === 0 ||
        selectedCategories.includes(p.category),
    );
    const initialDesk: Record<string, DeskItemState> = {};
    const isStatusAction = actionType === 'STOCK' || actionType === 'ARCHIVE';

    productsForDesk.forEach((p) => {
      initialDesk[p.id] = {
        included: !isStatusAction,
        manualInStock: !p.out_of_stock,
        manualArchived: p.is_archived,
      };
    });
    setDeskItems(initialDesk);
    setCurrentStep(targetStep);
  };

  const prevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      return;
    }
    if (currentStep === 2.1) {
      setCurrentStep(2);
      return;
    }
    if (currentStep === 2.2) {
      setCurrentStep(2.1);
      return;
    }
    if (currentStep === 2.3) {
      setCurrentStep(2.2);
      return;
    }
    if (currentStep === 3 && actionType === 'PRICE') {
      setCurrentStep(2.3);
      return;
    }
    if (currentStep === 3) {
      setCurrentStep(2);
      return;
    }
    setCurrentStep((prev) => prev - 1);
  };

  const toggleCategory = (cat: string) => {
    if (cat === 'TÜMÜ') {
      setSelectedCategories(
        selectedCategories.length === categories.length ? [] : [...categories],
      );
      return;
    }
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const initialProductsForDesk = useMemo(() => {
    return allProducts
      .filter(
        (p) =>
          selectedCategories.length === 0 ||
          selectedCategories.includes(p.category),
      )
      .sort((a, b) => {
        const catA = categories.indexOf(a.category);
        const catB = categories.indexOf(b.category);
        if (catA !== catB) return catA - catB;
        return (a.sort_order || 0) - (b.sort_order || 0);
      });
  }, [allProducts, selectedCategories, categories]);

  const toggleProductInclusion = (id: string) => {
    setDeskItems((prev) => ({
      ...prev,
      [id]: { ...prev[id], included: !prev[id]?.included },
    }));
  };


  const calculateNewPrice = (current: number) => {
    if (!inputValue) return current;
    const amount = transformCurrencyStringToNumber(inputValue);
    let result = current;
    if (isPercentage) {
      const adj = current * (amount / 100);
      result = isIncrease ? current + adj : current - adj;
    } else {
      result = isIncrease ? current + amount : current - amount;
    }
    return result < 0 ? 0 : result;
  };

  const handleApply = async () => {
    setIsProcessing(true);
    try {
      const itemsToUpdate = Object.entries(deskItems)
        .filter(([_, state]) => state.included)
        .map(([id, state]) => ({
          id,
          ...state,
        }));

      await onGranularUpdate(itemsToUpdate.map(item => ({
        productId: item.id,
        newPrice: actionType === 'PRICE' ? item.manualPrice : undefined,
        delete: actionType === 'DELETE',
        out_of_stock: actionType === 'STOCK' ? (item.manualInStock === false) : undefined,
        is_archived: actionType === 'ARCHIVE' ? item.manualArchived : undefined,
      })));
      setSubmitStatus('success');
      setTimeout(() => {
        onClose();
        resetAll();
      }, 1500);
    } catch (err) {
      console.error('Bulk action failed', err);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 2000);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        resetAll();
      }}
      maxWidth="max-w-xl"
      title={
        currentStep === 1 ? 'İŞLEM' :
        currentStep === 2 ? 'KATEGORİ' :
        currentStep === 2.1 ? 'hangisi?' :
        currentStep === 2.2 ? 'HESAPLAMA' :
        currentStep === 2.3 ? 'MİKTAR' :
        currentStep === 3 ? 'ONAY' : 'TOPLU İŞLEM'
      }
      progress={(() => {
        if (currentStep === 0) return undefined;
        const isPrice = actionType === 'PRICE';
        const total = isPrice ? 6 : 3;
        let current = 1;
        if (currentStep === 1) current = 1;
        else if (currentStep === 2) current = 2;
        else if (currentStep === 2.1) current = 3;
        else if (currentStep === 2.2) current = 4;
        else if (currentStep === 2.3) current = 5;
        else if (currentStep === 3) current = isPrice ? 6 : 3;
        return { current, total };
      })()}
      accentColor="bg-emerald-500"
      disableClickOutside={isProcessing}
      hideCloseButton={isProcessing}
      isStatic={isStatic}
    >
      <div className="space-y-6">

        {/* STEP 1: ACTION SELECTION */}
        {currentStep === 1 && (
          <div className="space-y-3 fade-in py-2">
            <div className="flex flex-col gap-3">
              {[
                { id: 'PRICE', text: 'FİYAT DURUMU' },
                { id: 'STOCK', text: 'STOK DURUMU' },
                { id: 'ARCHIVE', text: 'YAYIN DURUMU' },
                { id: 'DELETE', text: 'SİL İŞLEMİ' },
              ].map((opt) => (
                <Button
                  key={opt.id}
                  onClick={() => {
                    setActionType(opt.id as ActionType);
                    nextStep();
                  }}
                  variant="primary"
                  className="!h-16 !px-6 !rounded-[20px] border-none flex !flex-row !items-center !justify-start group transition-all"
                  showFingerprint={true}
                >
                  <span className="text-[14px] font-black uppercase tracking-widest leading-tight">
                    {opt.text}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: CATEGORY SELECTION */}
        {currentStep === 2 && (
          <div className="space-y-6 fade-in py-2">
            <div className="bg-stone-50 p-6 rounded-[32px] border border-stone-100">
               <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    onClick={() => toggleCategory('TÜMÜ')}
                    variant={selectedCategories.length === categories.length ? 'primary' : 'secondary'}
                    size="md"
                    className={`!px-6 !py-3 !rounded-2xl !text-[11px] font-black ${selectedCategories.length === categories.length ? '!bg-stone-900 !text-white' : ''}`}
                    showFingerprint={true}
                  >
                    TÜMÜ
                  </Button>
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      variant={selectedCategories.includes(cat) ? 'primary' : 'secondary'}
                      size="md"
                      className={`!px-6 !py-3 !rounded-2xl !text-[11px] font-black ${selectedCategories.includes(cat) ? '!bg-stone-900 !text-white' : ''}`}
                      showFingerprint={true}
                    >
                      {cat}
                    </Button>
                  ))}
               </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={prevStep} variant="secondary" mode="rectangle" className="w-20 h-16 shrink-0" showFingerprint={false}>
                <Lucide.ChevronLeft size={24} strokeWidth={3} />
              </Button>
              <Button
                onClick={nextStep}
                disabled={selectedCategories.length === 0 && actionType !== 'DELETE'}
                variant="primary"
                className="flex-1 h-16 shadow-2xl font-black !rounded-[24px]"
                showFingerprint={true}
              >
                DEVAM ET
              </Button>
            </div>
          </div>
        )}

        {/* PRICE STEPS 2.1, 2.2, 2.3 */}
        {currentStep === 2.1 && (
          <div className="flex items-center gap-3 fade-in py-4">
            <Button onClick={prevStep} variant="secondary" mode="rectangle" className="w-16 h-16 shrink-0" showFingerprint={false}>
              <Lucide.ChevronLeft size={24} strokeWidth={3} />
            </Button>
            <div className="flex gap-2 flex-1">
              <Button
                onClick={() => {
                  setIsIncrease(true);
                  nextStep();
                }}
                variant="primary"
                className="flex-1 h-16 !rounded-[20px]"
                showFingerprint={true}
                icon={<Lucide.TrendingUp size={18} className="text-emerald-400" />}
              >
                <span className="font-black tracking-widest text-[11px] uppercase">ZAM</span>
              </Button>
              <Button
                onClick={() => {
                  setIsIncrease(false);
                  nextStep();
                }}
                variant="primary"
                className="flex-1 h-16 !rounded-[20px]"
                showFingerprint={true}
                icon={<Lucide.TrendingDown size={18} className="text-red-400" />}
              >
                <span className="font-black tracking-widest text-[11px] uppercase">İNDİRİM</span>
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2.2 && (
          <div className="flex items-center gap-2 fade-in py-2">
            <Button onClick={prevStep} variant="secondary" mode="rectangle" className="w-16 h-16 shrink-0" showFingerprint={false}>
              <Lucide.ChevronLeft size={24} strokeWidth={3} />
            </Button>

            <div className="flex gap-2 flex-1">
              <Button
                onClick={() => {
                  setIsPercentage(false);
                  nextStep();
                }}
                variant="primary"
                className="flex-1 h-16 !rounded-[20px]"
                showFingerprint={true}
              >
                <div className="flex flex-col items-center">
                  <span className="font-black tracking-widest text-[10px] uppercase">
                    SABİT
                  </span>
                  <span className="text-[9px] font-bold text-stone-400 lowercase italic">
                    (örn: {isIncrease ? '+50₺' : '-50₺'})
                  </span>
                </div>
              </Button>
              <Button
                onClick={() => {
                  setIsPercentage(true);
                  nextStep();
                }}
                variant="primary"
                className="flex-1 h-16 !rounded-[20px]"
                showFingerprint={true}
              >
                <div className="flex flex-col items-center">
                  <span className="font-black tracking-widest text-[10px] uppercase">
                    YÜZDE
                  </span>
                  <span className="text-[9px] font-bold text-stone-400 lowercase italic">
                    (örn: {isIncrease ? '%5' : '-%5'})
                  </span>
                </div>
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2.3 && (
          <div className="flex items-center gap-3 fade-in py-2">
            <Button onClick={prevStep} variant="secondary" mode="rectangle" className="w-16 h-16 shrink-0" showFingerprint={false}>
              <Lucide.ChevronLeft size={24} strokeWidth={3} />
            </Button>

            <FormInput
              id="bulk-price-input"
              type="text"
              inputMode="decimal"
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
              placeholder="Miktar"
              className="!text-center !text-lg !font-black !py-4 shadow-sm rounded-[18px] border-2 border-stone-100"
              containerClassName="relative flex-1 max-w-[160px] mx-auto"
              autoFocus
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-stone-300 pointer-events-none">
              {isPercentage ? '%' : '₺'}
            </span>

            <Button
              onClick={nextStep}
              disabled={!inputValue}
              variant="primary"
              className="w-16 h-16 !rounded-2xl shrink-0 shadow-xl"
              showFingerprint={true}
            >
              <Lucide.Check size={24} strokeWidth={4} />
            </Button>
          </div>
        )}

        {/* STEP 3: ACTION DESK */}
        {currentStep === 3 && (
          <div className="space-y-4 fade-in">
            <div className="max-h-[45vh] overflow-y-auto pr-1 space-y-5 custom-scrollbar">
              {categories
                .filter(cat => initialProductsForDesk.some(p => p.category === cat))
                .map((cat) => (
                  <div key={cat} className="space-y-3">
                    <div className="flex items-center gap-3 px-1">
                      <div className="h-[2px] flex-1 bg-stone-100" />
                      <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                        {cat}
                      </span>
                      <div className="h-[2px] flex-1 bg-stone-100" />
                    </div>
                    <div className="space-y-2">
                      {initialProductsForDesk
                        .filter((p) => p.category === cat)
                        .map((p) => (
                          <DeskItemRow
                            key={p.id}
                            product={p}
                            state={deskItems[p.id] || { included: true }}
                            actionType={actionType}
                            newPriceValue={calculateNewPrice(
                              transformCurrencyStringToNumber(p.price),
                            )}
                            onToggle={toggleProductInclusion}
                          />
                        ))}
                    </div>
                  </div>
                ))}
            </div>

            <div className="pt-4 flex gap-3">
              <Button
                onClick={prevStep}
                variant="secondary"
                mode="rectangle"
                className="w-16 h-16 shrink-0"
              >
                <Lucide.ChevronLeft size={24} strokeWidth={4} />
              </Button>
              <Button
                onClick={handleApply}
                disabled={
                  isProcessing ||
                  Object.values(deskItems).filter((d) => d.included).length === 0
                }
                variant={actionType === 'DELETE' ? 'danger' : 'action'}
                className="flex-1 h-16 font-black !rounded-[24px]"
                loading={isProcessing}
                showFingerprint={true}
                fingerprintType="action"
                icon={<Lucide.Check size={28} className="text-white" strokeWidth={4} />}
              />
            </div>
          </div>
        )}

        {/* CINEMATIC FEEDBACK OVERLAY */}
        <StatusOverlay 
          status={submitStatus} 
          message="" 
        />
      </div>
    </BaseModal>
  );
}
