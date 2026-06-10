// FILE ROLE: Core Product Presentation Unit (Interactive Card)
// DEPENDS ON: THEME, Product Types, Admin Sub-menus, Animation Logic
// CONSUMED BY: ProductGrid.tsx
import { useRef, memo } from 'react';
import { motion } from 'motion/react';
import Loading from '../ui/Loading';
import Badge from '../ui/Badge';
import { LABELS, THEME } from '../../data/config';
import { ProductCardProps } from '../../types';
import { standardizePriceInput } from '../../utils/core';
import SmartImage from '../ui/SmartImage';
import { MarqueeText } from '../ui/MarqueeText';

import { QuickEditModal } from '../modals/UtilityModals';
import { ProductDetailModal } from '../modals/ProductDetailModal';
import { useProductCardFlow } from '../../hooks/useProductCardFlow';

/**
 * PRODUCT CARD COMPONENT (100% Tokenized & Professional English)
 * -----------------------------------------------------------
 * Managed via central THEME config. Orchestrates sub-components.
 */



const ProductCard = memo(
  ({
    product,
    categories,
    isAdmin,
    isInlineEnabled,
    showPrice = true,
    onDelete,
    onUpdate,
    onImageUpload,
    activeDiscount,
    setActiveAdminProductId,
    orderIndex,
    onOrderIndexChange,
    itemsInCategory = 1,
  }: ProductCardProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cardContainerRef = useRef<HTMLElement>(null);

    const {
      isUploadingImage,
      isZoomDetailOpen,
      setIsZoomDetailOpen,
      quickEdit,
      setQuickEdit,
      handleImageFileChange,
      handleDataFieldUpdate,
      handlePromptEdit,
      isPromotionActive,
      originalPriceLabel,
      discountedPriceLabel,
      primaryImageSource,
      highDefinitionImageSource,
    } = useProductCardFlow(
      product,
      isAdmin,
      isInlineEnabled,
      activeDiscount,
      onUpdate,
      onImageUpload,
      setActiveAdminProductId,
    );

    const theme = THEME.productCard;
    const adminLabels = LABELS.adminActions;

    return (
      <>
        <motion.article
          ref={cardContainerRef}
          layout
          layoutId={product.id}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 40,
            opacity: { duration: 0.2 },
          }}
          data-product-id={product.id}
          className={`${theme.container} ${THEME.radius.card} h-fit flex-shrink-0 overflow-hidden ${product.out_of_stock ? theme.outOfStockBorder : theme.activeBorder} ${theme.shadow}`}
        >
          {/* IMAGE VISUAL SECTION - FLOATING IN LIGHT GRAY BOX (MATCHES ZOOM MODAL) */}
          <div className="p-3 pb-0">
            <div
              className={`relative aspect-square bg-stone-50 overflow-hidden rounded-[var(--radius-card)] border border-stone-100 shadow-inner ${!isAdmin ? theme.image.cursorUser : theme.image.cursorAdmin}`}
              style={{
                flexShrink: 0,
              }}
              onClick={() => {
                if (!isUploadingImage && (isAdmin || primaryImageSource)) {
                  setIsZoomDetailOpen(true);
                }
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
                w-full h-full ${theme.image.transition} 
                ${product.out_of_stock ? theme.image.outOfStock : ''} 
                ${isUploadingImage ? 'opacity-20 blur-sm' : ''}
              `}
                imgClassName="rounded-[var(--radius-card)]"
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
          </div>

          {/* TEXTUAL CONTENT SECTION */}
          <div
            className={`${theme.padding} ${theme.innerLayout.contentWrapper}`}
          >
            <MarqueeText
              text={product.name}
              textClass={`${theme.typography.name} ${theme.typography.nameTransition} ${product.out_of_stock ? theme.typography.nameOutOfStock : ''}`}
              isAdmin={isAdmin}
              onClick={() => handlePromptEdit('name', 'Ürün Adı')}
              editableProps={
                isAdmin && isInlineEnabled
                  ? {
                      contentEditable: true,
                      suppressContentEditableWarning: true,
                      spellCheck: false,
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
                      className: `cursor-pointer transition-all ${isAdmin ? 'hover:text-stone-950' : ''}`,
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
                    spellCheck={false}
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
                      spellCheck={false}
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
              <Badge
                variant="primary"
                size="md"
                className="-translate-y-4 shadow-2xl"
              >
                TÜKENDİ
              </Badge>
            )}
            {product.is_archived && (
              <Badge
                variant="primary"
                size="md"
                className="-translate-y-4 shadow-2xl"
              >
                ARŞİVDE
              </Badge>
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
                  onChange={async (e) => {
                    e.stopPropagation();
                    const newPos = Number(e.target.value);
                    try {
                      await onOrderIndexChange?.(product.id, newPos);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10 w-7 h-7"
                >
                  {Array.from({ length: itemsInCategory }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}.
                    </option>
                  ))}
                </select>

                <div className="w-7 h-7 rounded-md flex items-center justify-center transition-all border border-white/20 shadow-xl backdrop-blur-md bg-stone-900/60 hover:bg-stone-900/80">
                  <span className="text-white text-[10px] font-black">
                    {orderIndex}.
                  </span>
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
          showPrice={showPrice}
          isAdmin={isAdmin}
          categories={categories}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onImageUpload={onImageUpload}
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
