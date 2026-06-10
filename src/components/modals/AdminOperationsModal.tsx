import { memo, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import Button from '../ui/Button';
import BaseModal from './BaseModal';
import * as Lucide from 'lucide-react';
import FormInput from '../ui/FormInput';
import StatusOverlay from '../ui/StatusOverlay';
import StatusToggle from '../ui/StatusToggle';
import CategoryFilterChip from '../ui/CategoryFilterChip';
import { transformCurrencyStringToNumber } from '../../utils/core';
import { AdminOperationsModalProps, Product } from '../../types';
import { useStore } from '../../store';
import {
  useBulkPriceFlow,
  ActionType,
  DeskItemState,
} from '../../hooks/useBulkPriceFlow';

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
    const getActiveColor = () => {
      if (actionType === 'DELETE') return 'bg-red-500';
      return 'bg-emerald-500';
    };

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: state.included ? 1 : 0.6,
          filter: state.included
            ? 'grayscale(0%) opacity(1)'
            : 'grayscale(100%) opacity(0.7)',
        }}
        className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-500 ${state.included ? 'bg-white border-stone-100 shadow-sm' : 'bg-stone-50/30 border-transparent'}`}
      >
        {/* LEFT: IMAGE */}
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-100 border border-stone-100 shrink-0">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300">
              <Lucide.Sparkles size={18} />
            </div>
          )}
        </div>

        {/* MIDDLE: INFO */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black text-stone-900 truncate uppercase tracking-tighter leading-none">
            {product.name}
          </p>
          {product.description && (
            <p className="text-[9px] font-bold text-stone-400 truncate mt-1">
              {product.description}
            </p>
          )}
          {actionType === 'PRICE' && state.included && (
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[9px] font-black text-stone-300 line-through">
                {product.price}
              </span>
              <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                {newPriceValue.toLocaleString('tr-TR')} ₺
              </span>
            </div>
          )}
        </div>

        {/* RIGHT: TOGGLE */}
        <div className="shrink-0 pointer-events-auto">
          <StatusToggle
            value={state.included}
            onChange={() => onToggle(product.id)}
            variant="compact"
            activeColor={getActiveColor()}
          />
        </div>
      </motion.div>
    );
  },
);

/**
 * SUB-COMPONENT: SingleActionsGrid
 * Renders the 2x2 action buttons for adding a single item.
 */
interface SingleActionsGridProps {
  onClose: () => void;
  onAddAction?: (type: 'PRODUCT' | 'CATEGORY' | 'REFERENCE' | 'CAROUSEL') => void;
}

function SingleActionsGrid({ onClose, onAddAction }: SingleActionsGridProps) {
  return (
    <div className="space-y-2">
      <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">
        TEKİL İŞLEMLER
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => {
            onClose();
            useStore.getState().openModal('ADD_PRODUCT');
          }}
          variant="primary"
          className="!h-14 !px-4 !rounded-[18px] border-none flex !flex-row !items-center !justify-start gap-2.5 group transition-all"
          icon={<Lucide.Plus size={18} strokeWidth={3} />}
        >
          <span className="text-[11px] font-black uppercase tracking-widest leading-tight">
            ÜRÜN EKLE
          </span>
        </Button>

        <Button
          onClick={() => {
            onAddAction?.('CATEGORY');
            onClose();
          }}
          variant="primary"
          className="!h-14 !px-4 !rounded-[18px] border-none flex !flex-row !items-center !justify-start gap-2.5 group transition-all"
          icon={<Lucide.Plus size={18} strokeWidth={3} />}
        >
          <span className="text-[11px] font-black uppercase tracking-widest leading-tight">
            KATEGORİ EKLE
          </span>
        </Button>

        <Button
          onClick={() => {
            onAddAction?.('REFERENCE');
            onClose();
          }}
          variant="primary"
          className="!h-14 !px-4 !rounded-[18px] border-none flex !flex-row !items-center !justify-start gap-2.5 group transition-all"
          icon={<Lucide.Plus size={18} strokeWidth={3} />}
        >
          <span className="text-[11px] font-black uppercase tracking-widest leading-tight">
            REFERANS EKLE
          </span>
        </Button>

        <Button
          onClick={() => {
            onAddAction?.('CAROUSEL');
          }}
          variant="primary"
          className="!h-14 !px-4 !rounded-[18px] border-none flex !flex-row !items-center !justify-start gap-2.5 group transition-all"
          icon={<Lucide.Plus size={18} strokeWidth={3} />}
        >
          <span className="text-[11px] font-black uppercase tracking-widest leading-tight">
            AFİŞ EKLE
          </span>
        </Button>
      </div>
    </div>
  );
}

/**
 * SUB-COMPONENT: BulkActionsList
 * Renders the vertical action list for bulk/system actions.
 */
interface BulkActionsListProps {
  onActionSelect: (type: ActionType | 'BULK_UPLOAD') => void;
}

function BulkActionsList({ onActionSelect }: BulkActionsListProps) {
  const options = [
    { id: 'PRICE', text: 'FİYAT DURUMU', icon: <Lucide.TrendingUp size={18} /> },
    { id: 'STOCK', text: 'STOK DURUMU', icon: <Lucide.Boxes size={18} /> },
    { id: 'ARCHIVE', text: 'YAYIN DURUMU', icon: <Lucide.Eye size={18} /> },
    { id: 'DELETE', text: 'SİL İŞLEMİ', icon: <Lucide.Trash2 size={18} /> },
    { id: 'BULK_UPLOAD', text: 'TOPLU ÜRÜN YÜKLE', icon: <Lucide.Upload size={18} /> },
  ] as const;

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">
        TOPLU İŞLEMLER
      </div>
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <Button
            key={opt.id}
            onClick={() => onActionSelect(opt.id)}
            variant="primary"
            className="!h-14 !px-5 !rounded-[18px] border-none flex !flex-row !items-center !justify-start gap-3 group transition-all w-full"
            icon={opt.icon}
          >
            <span className="text-[12px] font-black uppercase tracking-widest leading-tight">
              {opt.text}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}

/**
 * SUB-COMPONENT: BulkUploadScreen
 * Renders the WhatsApp support redirection details card.
 */
interface BulkUploadScreenProps {
  onBack: () => void;
}

function BulkUploadScreen({ onBack }: BulkUploadScreenProps) {
  return (
    <div className="space-y-6 fade-in py-2">
      <div className="bg-stone-50 p-6 rounded-[32px] border border-stone-100 flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 animate-pulse">
          <Lucide.MessageCircle size={32} strokeWidth={2.5} />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider">
            ÜCRETSİZ TOPLU YÜKLEME
          </h3>
          <p className="text-[11px] font-bold text-stone-500 leading-relaxed max-w-sm">
            Ürün listenizi (Excel, PDF, fotoğraf veya metin listesi olarak) bize WhatsApp üzerinden iletin, sizin için ekataloğunuza ücretsiz yükleyelim!
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onBack}
          variant="secondary"
          mode="rectangle"
          className="w-16 h-16 shrink-0"
        >
          <Lucide.ChevronLeft size={24} strokeWidth={3} />
        </Button>
        
        <Button
          onClick={() => {
            window.open(
              'https://wa.me/905373420161?text=Merhaba,%20e-katalog%20sistemime%20toplu%20ürün%20yüklemek%20istiyorum.%20Yardımcı%20olur%20musunuz?',
              '_blank',
              'noopener,noreferrer'
            );
          }}
          variant="whatsapp"
          className="flex-1 h-16 shadow-2xl font-black !rounded-[24px] flex items-center justify-center gap-2"
          icon={<Lucide.MessageCircle size={20} strokeWidth={3} />}
        >
          WHATSAPP İLE GÖNDER
        </Button>
      </div>
    </div>
  );
}

/**
 * SUB-COMPONENT: CategorySelectionScreen
 * Renders the category chip list and navigation options.
 */
interface CategorySelectionScreenProps {
  categories: string[];
  selectedCategories: string[];
  toggleCategory: (cat: string) => void;
  prevStep: () => void;
  nextStep: () => void;
  allProducts: Product[];
}

function CategorySelectionScreen({
  categories,
  selectedCategories,
  toggleCategory,
  prevStep,
  nextStep,
  allProducts,
}: CategorySelectionScreenProps) {
  const isAllSelected = selectedCategories.length === categories.length;

  return (
    <div className="space-y-6 fade-in py-2">
      <div className="bg-stone-50 p-6 rounded-[32px] border border-stone-100">
        <div className="flex flex-wrap justify-center gap-2">
          <CategoryFilterChip
            categoryName="TÜMÜ"
            isItemSelected={isAllSelected}
            productCount={allProducts.length}
            onSelect={() => toggleCategory('TÜMÜ')}
            isAdminMode={false}
          />
          {categories.map((cat) => {
            const isSelected = selectedCategories.includes(cat);
            const count = allProducts.filter((p) => p.category === cat).length;
            return (
              <CategoryFilterChip
                key={cat}
                categoryName={cat}
                isItemSelected={isSelected}
                productCount={count}
                onSelect={() => toggleCategory(cat)}
                isAdminMode={false}
              />
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={prevStep}
          variant="secondary"
          mode="rectangle"
          className="w-20 h-16 shrink-0"
        >
          <Lucide.ChevronLeft size={24} strokeWidth={3} />
        </Button>
        <Button
          onClick={nextStep}
          disabled={selectedCategories.length === 0}
          variant="primary"
          className="flex-1 h-16 shadow-2xl font-black !rounded-[24px]"
        >
          DEVAM ET
        </Button>
      </div>
    </div>
  );
}

/**
 * SUB-COMPONENT: PriceSetupWizard
 * Renders sub-steps (2.1, 2.2, 2.3) of the bulk price flow.
 */
interface PriceSetupWizardProps {
  currentStep: number;
  isIncrease: boolean | null;
  isPercentage: boolean | null;
  inputValue: string;
  setInputValue: (val: string) => void;
  setIsIncrease: (val: boolean) => void;
  setIsPercentage: (val: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
}

function PriceSetupWizard({
  currentStep,
  isIncrease,
  isPercentage,
  inputValue,
  setInputValue,
  setIsIncrease,
  setIsPercentage,
  nextStep,
  prevStep,
}: PriceSetupWizardProps) {
  if (currentStep === 2.1) {
    return (
      <div className="flex items-center gap-3 fade-in py-4">
        <Button
          onClick={prevStep}
          variant="secondary"
          mode="rectangle"
          className="w-16 h-16 shrink-0"
        >
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
            icon={<Lucide.TrendingUp size={18} className="text-emerald-400" />}
          >
            <span className="font-black tracking-widest text-[11px] uppercase">
              ZAM
            </span>
          </Button>
          <Button
            onClick={() => {
              setIsIncrease(false);
              nextStep();
            }}
            variant="primary"
            className="flex-1 h-16 !rounded-[20px]"
            icon={<Lucide.TrendingDown size={18} className="text-red-400" />}
          >
            <span className="font-black tracking-widest text-[11px] uppercase">
              İNDİRİM
            </span>
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === 2.2) {
    return (
      <div className="flex items-center gap-2 fade-in py-2">
        <Button
          onClick={prevStep}
          variant="secondary"
          mode="rectangle"
          className="w-16 h-16 shrink-0"
        >
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
    );
  }

  if (currentStep === 2.3) {
    return (
      <div className="flex items-center gap-3 fade-in py-2 relative">
        <Button
          onClick={prevStep}
          variant="secondary"
          mode="rectangle"
          className="w-16 h-16 shrink-0"
        >
          <Lucide.ChevronLeft size={24} strokeWidth={3} />
        </Button>

        <FormInput
          id="bulk-price-input"
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInputValue(e.target.value)
          }
          placeholder="Miktar"
          className="!text-center !text-lg !font-black !py-4 shadow-sm rounded-[18px] border-2 border-stone-100"
          containerClassName="relative flex-1 max-w-[160px] mx-auto"
          autoFocus
        />
        <span className="absolute right-24 top-1/2 -translate-y-1/2 text-sm font-black text-stone-300 pointer-events-none">
          {isPercentage ? '%' : '₺'}
        </span>

        <Button
          onClick={nextStep}
          disabled={!inputValue}
          variant="primary"
          className="w-16 h-16 !rounded-2xl shrink-0 shadow-xl"
        >
          <Lucide.Check size={24} strokeWidth={4} />
        </Button>
      </div>
    );
  }

  return null;
}

/**
 * SUB-COMPONENT: ActionDeskScreen
 * Renders the selection review and apply step (Step 3).
 */
interface ActionDeskScreenProps {
  categories: string[];
  initialProductsForDesk: Product[];
  deskItems: Record<string, DeskItemState>;
  actionType: ActionType;
  calculateNewPrice: (current: number) => number;
  toggleProductInclusion: (id: string) => void;
  prevStep: () => void;
  handleApply: () => void;
  isProcessing: boolean;
}

function ActionDeskScreen({
  categories,
  initialProductsForDesk,
  deskItems,
  actionType,
  calculateNewPrice,
  toggleProductInclusion,
  prevStep,
  handleApply,
  isProcessing,
}: ActionDeskScreenProps) {
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');

  const hasChanges = useMemo(() => {
    return initialProductsForDesk.some((p) => {
      const state = deskItems[p.id];
      if (!state) return false;
      if (actionType === 'STOCK') return state.included !== !p.out_of_stock;
      if (actionType === 'ARCHIVE') return state.included !== !p.is_archived;
      return state.included;
    });
  }, [initialProductsForDesk, deskItems, actionType]);

  const onConfirmClick = () => {
    const activePin = useStore.getState().adminPin;
    if (confirmPin !== activePin) {
      setPinError('Hatalı yönetici şifresi.');
      return;
    }
    handleApply();
  };

  return (
    <div className="space-y-4 fade-in">
      {/* Help Hint Text */}
      <div className="px-1 text-[9px] font-black text-stone-400 uppercase tracking-widest text-center select-none bg-stone-50 py-2.5 rounded-xl border border-stone-100/50">
        {actionType === 'STOCK' && 'Stoktaki ürünleri yeşil (aktif), stok dışı ürünleri gri (deaktif) yapın.'}
        {actionType === 'ARCHIVE' && 'Yayındaki ürünleri yeşil (aktif), arşivdeki ürünleri gri (deaktif) yapın.'}
        {actionType === 'PRICE' && 'Fiyatı güncellenecek ürünleri yeşil (aktif) yapın.'}
        {actionType === 'DELETE' && 'Silinecek ürünleri kırmızı (aktif) yapın.'}
      </div>

      <div className="max-h-[42vh] overflow-y-auto pr-1 space-y-5 custom-scrollbar">
        {categories
          .filter((cat) =>
            initialProductsForDesk.some((p) => p.category === cat),
          )
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

      {/* PIN Verification Input */}
      <div className="flex flex-col gap-2 mt-4 text-left border-t border-stone-100 pt-4">
        <FormInput
          id="bulk-confirm-pin"
          labelText="YÖNETİCİ ŞİFRESİ (PIN)"
          placeholder="Toplu işlemi onaylamak için şifreyi girin"
          type="password"
          value={confirmPin}
          onChange={(e) => {
            setConfirmPin(e.target.value);
            if (pinError) setPinError('');
          }}
        />
        {pinError && (
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider px-1">
            {pinError}
          </span>
        )}
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
          onClick={onConfirmClick}
          disabled={isProcessing || !hasChanges || !confirmPin}
          variant="primary"
          className="flex-1 h-16 font-black !rounded-[24px]"
          loading={isProcessing}
          icon={
            <Lucide.Check
              size={28}
              className="text-white"
              strokeWidth={4}
            />
          }
        />
      </div>
    </div>
  );
}

/**
 * ADMIN OPERATIONS MODAL (Diamond Standard)
 * -----------------------------------------------------------
 * A centralized operations hub handling single & bulk actions.
 */
export default function AdminOperationsModal({
  isOpen,
  onClose,
  allProducts,
  categories,
  onGranularUpdate,
  onAddAction,
  isStatic = false,
  initialStep,
}: AdminOperationsModalProps) {
  const {
    currentStep,
    actionType,
    setActionType,
    selectedCategories,
    setIsPercentage,
    isPercentage,
    isIncrease,
    setIsIncrease,
    inputValue,
    setInputValue,
    isProcessing,
    submitStatus,
    deskItems,
    resetAll,
    nextStep,
    prevStep,
    toggleCategory,
    initialProductsForDesk,
    toggleProductInclusion,
    calculateNewPrice,
    handleApply,
  } = useBulkPriceFlow(
    allProducts,
    categories,
    onGranularUpdate,
    onClose,
    initialStep,
  );

  const [isBulkUpload, setIsBulkUpload] = useState(false);

  if (!isOpen) return null;

  const getModalTitle = () => {
    if (isBulkUpload) return 'TOPLU YÜKLE';
    switch (currentStep) {
      case 1:
        return 'İŞLEMLER';
      case 2:
        return 'KATEGORİ';
      case 2.1:
        return 'hangisi?';
      case 2.2:
        return 'HESAPLAMA';
      case 2.3:
        return 'MİKTAR';
      case 3:
        return 'ONAY';
      default:
        return 'İŞLEMLER';
    }
  };

  const getProgress = () => {
    if (isBulkUpload || currentStep <= 1) return undefined;
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
  };

  const handleActionSelect = (type: ActionType | 'BULK_UPLOAD') => {
    if (type === 'BULK_UPLOAD') {
      setIsBulkUpload(true);
    } else {
      setActionType(type);
      nextStep();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        resetAll();
        setIsBulkUpload(false);
      }}
      maxWidth="max-w-xl"
      title={getModalTitle()}
      progress={getProgress()}
      accentColor="bg-emerald-500"
      disableClickOutside={isProcessing}
      hideCloseButton={isProcessing}
      isStatic={isStatic}
    >
      <div className="space-y-6">
        {/* BULK UPLOAD INFO SCREEN */}
        {isBulkUpload && (
          <BulkUploadScreen onBack={() => setIsBulkUpload(false)} />
        )}

        {/* STEP 1: HUB ACTION SELECTION */}
        {!isBulkUpload && currentStep === 1 && (
          <div className="space-y-6 fade-in py-2">
            <SingleActionsGrid onClose={onClose} onAddAction={onAddAction} />
            <BulkActionsList onActionSelect={handleActionSelect} />
          </div>
        )}

        {/* STEP 2: CATEGORY SELECTION */}
        {!isBulkUpload && currentStep === 2 && (
          <CategorySelectionScreen
            categories={categories}
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            prevStep={prevStep}
            nextStep={nextStep}
            allProducts={allProducts}
          />
        )}

        {/* PRICE CONFIGURATION SUB-STEPS */}
        {!isBulkUpload && (currentStep === 2.1 || currentStep === 2.2 || currentStep === 2.3) && (
          <PriceSetupWizard
            currentStep={currentStep}
            isIncrease={isIncrease}
            isPercentage={isPercentage}
            inputValue={inputValue}
            setInputValue={setInputValue}
            setIsIncrease={setIsIncrease}
            setIsPercentage={setIsPercentage}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {/* STEP 3: ACTION DESK */}
        {!isBulkUpload && currentStep === 3 && (
          <ActionDeskScreen
            categories={categories}
            initialProductsForDesk={initialProductsForDesk}
            deskItems={deskItems}
            actionType={actionType}
            calculateNewPrice={calculateNewPrice}
            toggleProductInclusion={toggleProductInclusion}
            prevStep={prevStep}
            handleApply={handleApply}
            isProcessing={isProcessing}
          />
        )}

        {/* CINEMATIC FEEDBACK OVERLAY */}
        <StatusOverlay status={submitStatus} message="" />
      </div>
    </BaseModal>
  );
}
