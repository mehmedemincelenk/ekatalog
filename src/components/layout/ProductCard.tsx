// FILE ROLE: Core Product Presentation Unit (Interactive Card)
// DEPENDS ON: THEME, Product Types, Admin Sub-menus, Animation Logic
// CONSUMED BY: ProductGrid.tsx
import { useRef, useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import Loading from '../ui/Loading';
import Badge from '../ui/Badge';
import { LABELS, THEME } from '../../data/config';
import { Product } from '../../types';
import { resolveVisualAssetUrl } from '../../utils/image';
import {
  standardizePriceInput,
  transformCurrencyStringToNumber,
  formatNumberToCurrency,
} from '../../utils/core';
import SmartImage from '../ui/SmartImage';
import { MarqueeText } from '../ui/MarqueeText';

import { QuickEditModal, ProductDetailModal } from '../modals/UtilityModals';
import { useStore } from '../../store';

/**
 * PRODUCT CARD COMPONENT (100% Tokenized & Professional English)
 * -----------------------------------------------------------
 * Managed via central THEME config. Orchestrates sub-components.
 */

import { ProductCardProps } from '../../types';
import * as Lucide from 'lucide-react';

const ProductCard = memo(
  ({
    product,
    isAdmin,
    isInlineEnabled,
    showPrice = true,
    onUpdate,
    onImageUpload,
    activeDiscount,
    setActiveAdminProductId,
    orderIndex,
    onOrderIndexChange,
    itemsInCategory = 1,
  }: ProductCardProps) => {
    const { visitorCurrency, exchangeRates } = useStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cardContainerRef = useRef<HTMLElement>(null);

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

    const theme = THEME.productCard;
    const adminLabels = LABELS.adminActions;



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

    // When real image arrives, just clear the preview state (revocation stays in cleanup)
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
        alert(LABELS.saveError);
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

    return (
      <>
        <motion.article
          ref={cardContainerRef}
          layout
          layoutId={product.id}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 40,
            opacity: { duration: 0.2 }
          }}
          data-product-id={product.id}
          className={`${theme.container} ${THEME.radius.card} h-fit flex-shrink-0 overflow-hidden ${product.out_of_stock ? theme.outOfStockBorder : theme.activeBorder} ${theme.shadow}`}
        >
          {/* IMAGE VISUAL SECTION - SHARP CORNERS */}
          <div
            className={`${theme.image.wrapper} w-full overflow-hidden ${theme.image.bg} rounded-t-[inherit] rounded-b-none ${!isAdmin ? theme.image.cursorUser : theme.image.cursorAdmin}`}
            style={{
              aspectRatio: '1/1',
              flexShrink: 0,
            }}
            onClick={() => {
              if (isAdmin && !isUploadingImage)
                setIsAdminMenuOpen(true);
              else if (!isAdmin && primaryImageSource)
                setIsZoomDetailOpen(true);
            }}
          >
            <SmartImage
              src={primaryImageSource}
              alt={product.name}
              aspectRatio="square"
              objectFit={
                theme.image.fit === 'object-cover' ? 'cover' : 'contain'
              }
              className={`
              w-full h-full rounded-none ${theme.image.transition} 
              ${product.out_of_stock ? theme.image.outOfStock : ''} 
              ${isUploadingImage ? 'opacity-20 blur-sm' : ''}
            `}
            />

            {/* LOADING OVERLAY (ONLY FOR UPLOADS) */}
            {isUploadingImage && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <Loading size="sm" label="" variant="white" />
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageFileChange}
            />
          </div>

          {/* TEXTUAL CONTENT SECTION */}
          <div
            className={`${theme.padding} ${theme.innerLayout.contentWrapper}`}
          >
            <MarqueeText
              text={product.name}
              textClass={`${theme.typography.name} ${theme.typography.nameTransition} ${product.out_of_stock ? theme.typography.nameOutOfStock : ''}`}
              isAdmin={isAdmin}
              onClick={() => {
                if (!isAdmin || isInlineEnabled) return;
                setQuickEdit({
                  field: 'name',
                  value: product.name,
                  title: 'Ürün Adı',
                });
              }}
              editableProps={
                isAdmin && isInlineEnabled
                  ? {
                      contentEditable: true,
                      suppressContentEditableWarning: true,
                      onBlur: (event: React.FocusEvent<HTMLDivElement>) =>
                        handleDataFieldUpdate(
                          'name',
                          event.currentTarget.textContent?.trim() || '',
                        ),
                      onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) =>
                        event.key === 'Enter' &&
                        (event.preventDefault(), event.currentTarget.blur()),
                      className: `outline-none focus:ring-2 focus:ring-stone-900/10 rounded px-1 -mx-1 transition-all hover:bg-stone-100 focus:bg-stone-100 cursor-text`,
                    }
                  : {
                      className: `cursor-pointer transition-all ${isAdmin ? 'hover:text-stone-950' : ''}`
                    }
              }
            />

            <div className={theme.innerLayout.descriptionWrapper}>
              {isAdmin && isInlineEnabled ? (
                <div
                  onClick={(event) => event.stopPropagation()}
                  className={theme.adminMenu.textareaBase}
                >
                  <textarea
                    defaultValue={product.description || ''}
                    onBlur={(event) =>
                      handleDataFieldUpdate(
                        'description',
                        event.target.value.trim(),
                      )
                    }
                    onChange={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onFocus={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    className={`${theme.typography.description} outline-none w-full px-1 -mx-1 rounded transition-all hover:bg-stone-100 focus:bg-stone-100 focus:ring-2 focus:ring-stone-900/10 border-transparent bg-transparent resize-none overflow-hidden`}
                    placeholder={adminLabels.addDescription}
                    rows={1}
                  />
                </div>
              ) : (
                (product.description || isAdmin) && (
                  <p
                    onClick={() =>
                      handlePromptEdit('description', 'Ürün Açıklaması')
                    }
                    className={`${theme.typography.description} ${theme.typography.descriptionClamp} ${isAdmin && !isInlineEnabled ? `outline-none focus:ring-2 focus:ring-stone-900/10 rounded px-1 -mx-1 transition-all hover:bg-stone-100 focus:bg-stone-100 cursor-text` : ''}`}
                  >
                    {product.description ||
                      (isAdmin ? adminLabels.addDescription : '')}
                  </p>
                )
              )}
            </div>

            {/* PRICE AREA: Hidden for everyone when showPrice is off */}
            {showPrice && (
              <div className={theme.innerLayout.footerWrapper}>
                <div className="flex flex-wrap items-center gap-1.5 min-h-[20px]">
                  {isPromotionActive && !isAdmin ? (
                    <>
                      <span
                        className={`${theme.typography.price} text-stone-400 line-through text-[0.625rem]`}
                      >
                        {originalPriceLabel}
                      </span>
                      <span
                        className={`${theme.typography.price} text-green-600`}
                      >
                        {discountedPriceLabel}
                      </span>
                    </>
                  ) : (
                    <div
                      contentEditable={isAdmin && isInlineEnabled}
                      suppressContentEditableWarning
                      onBlur={(event: React.FocusEvent<HTMLDivElement>) => {
                        const inputPrice =
                          event.currentTarget.textContent?.trim() || '';
                        handleDataFieldUpdate(
                          'price',
                          standardizePriceInput(inputPrice),
                        );
                      }}
                      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) =>
                        event.key === 'Enter' &&
                        (event.preventDefault(), event.currentTarget.blur())
                      }
                      onClick={() => handlePromptEdit('price', 'Ürün Fiyatı')}
                      className={`${theme.typography.price} ${isAdmin ? `outline-none focus:ring-2 focus:ring-stone-900/10 rounded px-1 -mx-1 transition-all hover:bg-stone-100 focus:bg-stone-100 ${!isInlineEnabled ? 'cursor-text' : ''}` : 'text-stone-900'} ${product.out_of_stock && !isAdmin ? theme.typography.priceOutOfStock : ''}`}
                    >
                      {originalPriceLabel}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* STATUS BADGES */}
          <div className={theme.status.wrapper}>
            {product.out_of_stock && (
              <Badge variant="primary" size="md" className="-translate-y-4 shadow-2xl">TÜKENDİ</Badge>
            )}
            {product.is_archived && (
              <Badge variant="primary" size="md" className="-translate-y-4 shadow-2xl">📦</Badge>
            )}
          </div>

          {/* ABSOLUTE ORDER INDICATOR - HIDDEN PER REQUEST TO PREVENT DOUBLE NUMBERING */}
          {isAdmin && orderIndex !== undefined && (
            <div 
              className="absolute top-2 right-2 z-30 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative group">
                <select
                  value={orderIndex}
                  disabled={isUpdatingOrder}
                  onChange={async (e) => {
                    e.stopPropagation();
                    const newPos = Number(e.target.value);
                    setIsUpdatingOrder(true);
                    try {
                      await onOrderIndexChange?.(product.id, newPos);
                      setIsUpdatingOrder(false);
                      setShowSuccess(true);
                      setTimeout(() => setShowSuccess(false), 1500);
                    } catch {
                      setIsUpdatingOrder(false);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10 w-8 h-8"
                >
                  {Array.from({ length: itemsInCategory }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}.</option>
                  ))}
                </select>
                
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center transition-all
                  ${isUpdatingOrder ? 'bg-stone-900' : showSuccess ? 'bg-emerald-500' : 'bg-stone-900/10 hover:bg-stone-900/20'}
                `}>
                  {isUpdatingOrder ? (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : showSuccess ? (
                    <Lucide.Check size={14} className="text-white" strokeWidth={4} />
                  ) : (
                    <Lucide.ArrowUpDown size={14} className="text-stone-600 group-hover:text-stone-900" />
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.article>

        <ProductDetailModal
          isOpen={isZoomDetailOpen}
          onClose={() => setIsZoomDetailOpen(false)}
          product={product}
          isPromotionActive={isPromotionActive || false}
          originalPriceLabel={originalPriceLabel}
          discountedPriceLabel={discountedPriceLabel || ''}
          highDefinitionImageSource={highDefinitionImageSource || ''}
        />



        <QuickEditModal
          isOpen={!!quickEdit}
          onClose={() => setQuickEdit(null)}
          onSave={(newVal) => {
            if (quickEdit) {
              handleDataFieldUpdate(
                quickEdit.field,
                quickEdit.field === 'price'
                  ? standardizePriceInput(newVal)
                  : newVal,
              );
            }
          }}
          initialValue={quickEdit?.value || ''}
          placeholder={`${quickEdit?.title} girin...`}
          type={quickEdit?.field === 'price' ? 'text' : 'text'}
        />
      </>
    );
  },
);

ProductCard.displayName = 'ProductCard';
export default ProductCard;
