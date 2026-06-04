// FILE ROLE: Main Catalog Display Engine (Categorized Grid)
// DEPENDS ON: ProductCard, THEME config, Category sorting logic
// CONSUMED BY: App.tsx
import { memo, Fragment } from 'react';
import { THEME, LABELS } from '../../data/config';
import ProductCard from './ProductCard';
import Button from '../ui/Button';
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
    activeAdminProductId,
    setActiveAdminProductId,
    visitorCurrency = 'TRY',
    renameCategory,
    onDeleteCategory,
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
                onDelete={onDeleteCategory}
                currentOrder={categoryOrder.indexOf(category) + 1}
                totalCategories={categoryOrder.length}
                isInlineEnabled={isInlineEnabled}
              />

              {categoryProducts.length > 0 || isAdmin ? (
                <div className={`${theme.cols} ${theme.gap}`}>
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
                  <p className="text-stone-400 text-xs font-medium italic">
                    {isAdmin
                      ? 'Bu kategori henüz boş.'
                      : 'Bu kategoride henüz ürün bulunmuyor.'}
                  </p>
                </div>
              )}
            </section>
          );
        })}

        {onLoadMore && displayCategories.length > visibleCategoryLimit && (
          <div className="flex flex-col items-center justify-center pt-6 pb-2 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Button
              onClick={onLoadMore}
              variant="primary"
              size="md"
              mode="rectangle"
              className="px-8 py-3.5 shadow-sm hover:shadow-md transition-all active:scale-95 !rounded-xl border-none"
            >
              <span className="text-[10px] font-black tracking-[0.3em] text-white uppercase">
                DAHA FAZLA ÜRÜN GÖSTER
              </span>
            </Button>
          </div>
        )}
      </div>
    );
  },
);

export default ProductGrid;
