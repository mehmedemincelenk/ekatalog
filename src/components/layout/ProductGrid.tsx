// FILE ROLE: Main Catalog Display Engine (Categorized Grid)
// DEPENDS ON: ProductCard, THEME config, Category sorting logic
// CONSUMED BY: App.tsx
import { memo, Fragment } from 'react';
import { THEME, LABELS } from '../../data/config';
import ProductCard from './ProductCard';
import PlusPlaceholder from '../ui/PlusPlaceholder';
import Button from '../ui/Button';
import { EditProdCard } from './EditProdCard';
import CategoryHeader from './CategoryHeader';
import { useStore } from '../../store';
import { useCatalogEngine } from '../../hooks/useProductsHub';
import { ProductGridProps } from '../../types';

/**
 * PRODUCT GRID COMPONENT (DIAMOND EDITION)
 * -----------------------------------------------------------
 * Main catalog display area. Organizes products into styled category sections.
 * Optimized for LCP and mobile-first premium experience.
 */
const ProductGrid = memo(
  ({
    products = [],
    categoryOrder = [],
    isInlineEnabled,
    onDelete,
    onUpdate,
    onOrderUpdate,
    onOrderIndexChange,
    onImageUpload,
    visibleCategoryLimit,
    onLoadMore,
    onAddClick,
    activeAdminProductId,
    setActiveAdminProductId,
    visitorCurrency = 'TRY',
    renameCategory,
  }: ProductGridProps) => {
    const { isAdmin, settings, activeDiscount, activeCategories } = useStore();

    const theme = THEME.productGrid;

    // Diamond Engine: Grouping & Sorting logic decoupled for maximum Vibe-Readability
    const { groupedProducts, displayCategories } = useCatalogEngine(
      products,
      categoryOrder,
      activeCategories,
      isAdmin,
    );

    if (!settings) return null;

    const showPrice = settings.displayConfig.showPrice ?? true;
    const exchangeRates = settings.exchangeRates;
    const displayCurrency = isAdmin ? settings.activeCurrency : visitorCurrency;

    const visibleCategories = displayCategories.slice(0, visibleCategoryLimit);

    let priorityCounter = 0;

    if (displayCategories.length === 0 && !isAdmin) {
      return (
        <div className="flex flex-col items-center justify-start min-h-[60vh] pt-20 w-full text-center animate-in fade-in duration-700">
          <div className="w-16 h-16 mb-6 opacity-20 text-stone-400">
            {THEME.icons.search}
          </div>
          <p className={`${THEME.font.base} text-stone-400 italic px-8`}>
            {LABELS.noProductsFound}
          </p>
        </div>
      );
    }

    return (
      <div className={theme.layout}>
        {visibleCategories.map((category) => {
          const categoryProducts = groupedProducts[category] || [];

          return (
            <section key={category} className={theme.sectionSpacing}>
              <CategoryHeader
                categoryName={category}
                productCount={categoryProducts.length}
                isAdmin={isAdmin}
                onRename={renameCategory}
                onOrderChange={onOrderUpdate}
                currentOrder={categoryOrder.indexOf(category) + 1}
                totalCategories={categoryOrder.length}
              />

              {categoryProducts.length > 0 || isAdmin ? (
                <div className="grid grid-cols-2 gap-x-3 gap-y-6">
                  {isAdmin && (
                    <PlusPlaceholder
                      type="PRODUCT"
                      category={category}
                      onClick={(cat) => onAddClick?.(cat)}
                    />
                  )}
                  {categoryProducts.map((product, index) => {
                    const isPriority = priorityCounter < 4;
                    priorityCounter++;

                    return (
                      <Fragment key={product.id}>
                        <ProductCard
                          product={product}
                          categories={categoryOrder}
                          isAdmin={isAdmin}
                          isInlineEnabled={isInlineEnabled}
                          showPrice={showPrice}
                          onDelete={onDelete}
                          onUpdate={onUpdate}
                          onOrderChange={onOrderUpdate}
                          onOrderIndexChange={onOrderIndexChange}
                          onImageUpload={onImageUpload}
                          orderIndex={index + 1}
                          itemsInCategory={categoryProducts.length}
                          activeDiscount={activeDiscount}
                          isPriority={isPriority}
                          activeAdminProductId={activeAdminProductId}
                          setActiveAdminProductId={setActiveAdminProductId}
                          displayCurrency={displayCurrency}
                          exchangeRates={exchangeRates}
                        />
                      </Fragment>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 border-2 border-dashed border-stone-100 rounded-2xl flex flex-col items-center justify-center bg-stone-50/30">
                  <p className="text-stone-400 text-xs font-medium italic mb-4">
                    {isAdmin
                      ? 'Bu kategori henüz boş.'
                      : 'Bu kategoride henüz ürün bulunmuyor.'}
                  </p>
                  {isAdmin && (
                    <Button
                      onClick={() => onAddClick?.()}
                      variant="secondary"
                      mode="rectangle"
                      className="!px-6 !py-2 !rounded-full !text-[10px]"
                    >
                      + BU KATEGORİYE ÜRÜN EKLE
                    </Button>
                  )}
                </div>
              )}
            </section>
          );
        })}

        {onLoadMore && displayCategories.length > visibleCategoryLimit && (
          <div className="flex flex-col items-center justify-center pt-8 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Button
              onClick={onLoadMore}
              variant="secondary"
              size="md"
              mode="rectangle"
              className="group !py-4 !px-8 border shadow-sm hover:shadow-md transition-all active:scale-95"
              showFingerprint
            >
              <span className="text-[10px] font-black tracking-[0.3em] text-stone-900 uppercase">
                DAHA FAZLA ÜRÜN GÖSTER
              </span>
            </Button>
          </div>
        )}

        {isAdmin && activeAdminProductId && (
          <EditProdCard
            product={products.find((p) => p.id === activeAdminProductId)!}
            categories={categoryOrder}
            onDelete={onDelete}
            onUpdate={onUpdate}
            isOpen={!!activeAdminProductId}
            setIsOpen={(open) =>
              setActiveAdminProductId?.(open ? activeAdminProductId : null)
            }
            onImageUpload={onImageUpload}
          />
        )}
      </div>
    );
  },
);

export default ProductGrid;
