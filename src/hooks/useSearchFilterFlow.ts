import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { useProducts } from './useProductsHub';
import { useDebounce } from './useCommon';

export function useSearchFilterFlow() {
  const {
    isAdmin,
    settings,
    searchQuery: search,
    setSearchQuery: onSearchChange,
    activeCategories,
    toggleCategory: onCategoryToggle,
    updateSetting,
    showFeedback,
  } = useStore();

  const { allProducts, executeGranularBulkActions, reorderCategories } = useProducts(
    search,
    activeCategories,
    isAdmin,
    settings,
  );

  const [internalSearch, setInternalSearch] = useState(search);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [adminAction, setAdminAction] = useState<'IDLE' | 'EDIT' | 'DELETE'>('IDLE');

  const debouncedSearch = useDebounce(internalSearch, 400);

  // Sync debounced search to global search state
  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  // Sync global search back to internal state
  useEffect(() => {
    setInternalSearch(search);
  }, [search]);

  const handleDeleteCategory = async (name: string) => {
    // Diamond Standard: Move products to 'Arşiv' category instead of deleting them outright
    const catProds = allProducts?.filter((p) => p.category === name) || [];
    
    if (catProds.length > 0) {
      const actions = catProds.map((p) => ({ productId: p.id, category: 'Arşiv' }));
      await executeGranularBulkActions(actions);
    }
    
    let newOrder = (settings?.categoryOrder || []).filter((c) => c !== name);
    if (!newOrder.includes('Arşiv')) {
      newOrder = [...newOrder, 'Arşiv'];
    }
    
    updateSetting('categoryOrder', newOrder);
    await reorderCategories(newOrder);
    
    showFeedback('success', `Kategori silindi, ${catProds.length} ürün Arşiv'e taşındı.`);
    setAdminAction('IDLE');
  };

  return {
    isAdmin,
    settings,
    search,
    activeCategories,
    onCategoryToggle,
    internalSearch,
    setInternalSearch,
    isPanelOpen,
    setIsPanelOpen,
    isAddingCategory,
    setIsAddingCategory,
    adminAction,
    setAdminAction,
    handleDeleteCategory,
  };
}
