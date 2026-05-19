import { useState, useEffect } from 'react';
import { Product } from '../types';
import {
  transformCurrencyStringToNumber,
  formatNumberToCurrency,
} from '../utils/core';
import { resolveVisualAssetUrl } from '../utils/image';
import { useStore } from '../store';

export function useProductCardFlow(
  product: Product,
  isAdmin: boolean,
  isInlineEnabled: boolean,
  activeDiscount: any,
  onUpdate: (id: string, data: Partial<Product>) => void,
  onImageUpload?: (id: string, file: File) => Promise<any>,
  setActiveAdminProductId?: (id: string | null) => void,
) {
  const { visitorCurrency, exchangeRates } = useStore();

  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [optimisticImagePreview, setOptimisticImagePreview] = useState<
    string | null
  >(null);
  const [isZoomDetailOpen, setIsZoomDetailOpen] = useState(false);
  const [quickEdit, setQuickEdit] = useState<{
    field: keyof Product;
    value: string;
    title: string;
  } | null>(null);

  const setIsAdminMenuOpen = (isOpen: boolean) => {
    setActiveAdminProductId?.(isOpen ? product.id : null);
  };

  // Apple-style scroll to close behavior
  useEffect(() => {
    if (!isZoomDetailOpen) return;
    const handleScrollClose = () => setIsZoomDetailOpen(false);
    window.addEventListener('scroll', handleScrollClose, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollClose);
  }, [isZoomDetailOpen]);

  // CLEANUP memory ONLY on unmount to prevent race conditions during upload transitions
  useEffect(() => {
    return () => {
      if (optimisticImagePreview) {
        URL.revokeObjectURL(optimisticImagePreview);
      }
    };
  }, [optimisticImagePreview]);

  // When real image arrives, just clear the preview state
  useEffect(() => {
    if (product.image_url && optimisticImagePreview) {
      setOptimisticImagePreview(null);
    }
  }, [product.image_url, optimisticImagePreview]);

  const handleImageFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile || !onImageUpload) return;

    const localPreviewUrl = URL.createObjectURL(selectedFile);
    setOptimisticImagePreview(localPreviewUrl);
    setIsUploadingImage(true);

    try {
      await onImageUpload(product.id, selectedFile);
    } catch {
      alert('Kaydetme hatası oluştu.');
      setOptimisticImagePreview(null);
    } finally {
      setIsUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleDataFieldUpdate = (
    fieldName: keyof Product,
    newValue: string | boolean | null,
  ) => {
    if (newValue !== (product[fieldName] || '')) {
      onUpdate(product.id, { [fieldName]: newValue });
    }
  };

  const handlePromptEdit = (field: keyof Product, label: string) => {
    if (!isAdmin || isInlineEnabled) return;
    setQuickEdit({
      field,
      value: (product[field] as string) || '',
      title: label,
    });
  };

  // DISCOUNT & CURRENCY CALCULATION
  const isPromotionActive =
    activeDiscount &&
    (!activeDiscount.category ||
      activeDiscount.category === product.category);
  const baseMathematicalPrice = transformCurrencyStringToNumber(
    product.price,
  );

  const originalPriceLabel = formatNumberToCurrency(
    baseMathematicalPrice,
    visitorCurrency,
    exchangeRates ?? undefined,
  );

  const discountedPriceLabel =
    isPromotionActive && baseMathematicalPrice > 0
      ? formatNumberToCurrency(
          baseMathematicalPrice * (1 - activeDiscount.rate),
          visitorCurrency,
          exchangeRates ?? undefined,
        )
      : null;

  const primaryImageSource =
    (optimisticImagePreview ||
    (product.image_url ? resolveVisualAssetUrl(product.image_url) : null)) ?? null;
  const highDefinitionImageSource = (product.image_url
    ? resolveVisualAssetUrl(
        product.image_url.replace('/lq/', '/hq/').split('?')[0],
      )
    : null) ?? null;

  return {
    isUpdatingOrder,
    setIsUpdatingOrder,
    showSuccess,
    setShowSuccess,
    isUploadingImage,
    isZoomDetailOpen,
    setIsZoomDetailOpen,
    quickEdit,
    setQuickEdit,
    setIsAdminMenuOpen,
    handleImageFileChange,
    handleDataFieldUpdate,
    handlePromptEdit,
    isPromotionActive,
    originalPriceLabel,
    discountedPriceLabel,
    primaryImageSource,
    highDefinitionImageSource
  };
}
