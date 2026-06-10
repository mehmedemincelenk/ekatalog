import { useState, useMemo } from 'react';
import { transformCurrencyStringToNumber } from '../utils/core';
import { Product } from '../types';

export type ActionType = 'PRICE' | 'DELETE' | 'ARCHIVE' | 'STOCK' | null;

export interface DeskItemState {
  included: boolean;
}

export function useBulkPriceFlow(
  allProducts: Product[],
  categories: string[],
  onGranularUpdate: (actions: any[]) => Promise<void>,
  onClose: () => void,
  initialStep?: number,
) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep || 1);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isPercentage, setIsPercentage] = useState<boolean | null>(null);
  const [isIncrease, setIsIncrease] = useState<boolean | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
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
    const nextMap: Record<number, number> = {
      1: 2,
      2: actionType === 'PRICE' ? 2.1 : 3,
      2.1: 2.2,
      2.2: 2.3,
      2.3: 3,
    };
    if (nextMap[currentStep]) {
      if (nextMap[currentStep] === 3) prepareDeskAndDirectTo(3);
      else setCurrentStep(nextMap[currentStep]);
    }
  };

  const prevStep = () => {
    const prevMap: Record<number, number> = {
      2: 1,
      2.1: 2,
      2.2: 2.1,
      2.3: 2.2,
      3: actionType === 'PRICE' ? 2.3 : 2,
    };
    if (prevMap[currentStep]) setCurrentStep(prevMap[currentStep]);
  };

  const prepareDeskAndDirectTo = (targetStep: number) => {
    const productsForDesk = allProducts.filter(
      (p) =>
        selectedCategories.length === 0 ||
        selectedCategories.includes(p.category),
    );
    const initialDesk: Record<string, DeskItemState> = {};

    productsForDesk.forEach((p) => {
      initialDesk[p.id] = { included: true };
    });
    setDeskItems(initialDesk);
    setCurrentStep(targetStep);
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
        .map(([id]) => id);

      await onGranularUpdate(
        itemsToUpdate.map((id) => {
          const product = allProducts.find((p) => p.id === id);
          return {
            productId: id,
            newPrice:
              actionType === 'PRICE'
                ? calculateNewPrice(
                    transformCurrencyStringToNumber(product?.price || '0'),
                  )
                : undefined,
            delete: actionType === 'DELETE',
            out_of_stock:
              actionType === 'STOCK' ? !product?.out_of_stock : undefined,
            is_archived:
              actionType === 'ARCHIVE' ? !product?.is_archived : undefined,
          };
        }),
      );
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

  return {
    currentStep,
    actionType,
    setActionType,
    selectedCategories,
    isPercentage,
    setIsPercentage,
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
  };
}

export type BulkPriceFlowContext = ReturnType<typeof useBulkPriceFlow>;
