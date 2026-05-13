import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { Product, NewProductPayload, CompanySettings } from '../types';
import { reorderArray, smartSearch } from '../utils/core';
import { useStore } from '../store';
import { TECH, sortCategories } from '../data/config';


/**
 * PRODUCTS & CATALOG HUB (DIAMOND EDITION)
 * -----------------------------------------------------------
 * Unified orchestrator for all product-related operations:
 * 1. Data Fetching (Query)
 * 2. Mutations (Add, Update, Delete, Bulk)
 * 3. Catalog Engine (Grouping, Filtering, Sorting)
 * 4. Storage Service (Visual Asset Management)
 */




// --- 1. QUERY HOOK (Data Layer) ---

export function useProductsQuery(storeId?: string) {
  return useQuery<Product[]>({
    queryKey: ['products', storeId],
    queryFn: async () => {
      if (!storeId) return [];
      const { data, error } = await supabase
        .from('prods')
        .select('*')
        .eq('store_id', storeId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!storeId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// --- 2. ACTIONS HOOK (Mutation Layer) ---

export function useProductsActions() {
  const queryClient = useQueryClient();
  const { settings, adminPin } = useStore();
  const queryKey = ['products', settings?.id];

  const updateMutation = useMutation({
    mutationFn: async ({ id, changes }: { id: string; changes: Partial<Product> }) => {
      if (!adminPin) throw new Error('Yetkisiz işlem: PIN gerekli');
      const { error } = await supabase.rpc('secure_update_product', {
        p_id: id,
        p_pin: adminPin,
        p_changes: changes
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!adminPin) throw new Error('Yetkisiz işlem: PIN gerekli');
      const { error } = await supabase.rpc('secure_delete_product', {
        p_id: id,
        p_pin: adminPin
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const reorderCategoryMutation = useMutation({
    mutationFn: async (newOrder: string[]) => {
      if (!settings?.id || !adminPin) throw new Error('Yetkisiz işlem');
      const { error } = await supabase.rpc('secure_reorder_categories', {
        p_store_id: settings.id,
        p_pin: adminPin,
        p_new_order: newOrder
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  const renameCategoryMutation = useMutation({
    mutationFn: async ({ oldName, newName }: { oldName: string; newName: string }) => {
      if (!settings?.id || !adminPin) throw new Error('Yetkisiz işlem');
      const { error } = await supabase.rpc('secure_rename_category', {
        p_store_id: settings.id,
        p_pin: adminPin,
        p_old_name: oldName,
        p_new_name: newName
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const reorderProductsMutation = useMutation({
    mutationFn: async ({ id, newSortOrder }: { id: string; newSortOrder: number }) => {
      if (!adminPin) throw new Error('Yetkisiz işlem');
      const { error } = await supabase.rpc('secure_update_product', {
        p_id: id,
        p_pin: adminPin,
        p_changes: { sort_order: newSortOrder }
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const addMutation = useMutation({
    mutationFn: async (newProduct: NewProductPayload) => {
      if (!settings?.id || !adminPin) throw new Error('Yetkisiz işlem');
      const { data, error } = await supabase.rpc('secure_add_product', {
        p_pin: adminPin,
        p_payload: {
          ...newProduct,
          store_id: settings.id
        }
      });
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });


  const uploadImageMutation = useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      if (!adminPin) throw new Error('Yetkisiz işlem: PIN gerekli');
      const cachedProducts = queryClient.getQueryData<Product[]>(queryKey);
      const targetProduct = cachedProducts?.find((p) => p.id === id);
      if (!targetProduct) throw new Error('Ürün bulunamadı');

      const { secureUploadVisualAsset } = await import('../utils/image');
      const finalizedUrl = await secureUploadVisualAsset({
        file,
        folder: TECH.storage.lqFolder,
        adminPin,
        oldUrl: targetProduct.image_url,
        slugBaseName: targetProduct.name,
        uniqueIdPrefix: targetProduct.id.substring(0, 4),
        isDualQuality: true
      });

      if (finalizedUrl) {
        const { error } = await supabase.rpc('secure_update_product', {
          p_id: id,
          p_pin: adminPin,
          p_changes: {
            image_url: finalizedUrl,
            is_polished_pending: false,
          }
        });
        if (error) throw error;
      }
      return finalizedUrl;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const bulkActionMutation = useMutation({
    mutationFn: async (
      actions: {
        productId: string;
        newPrice?: number;
        newSortOrder?: number;
        category?: string;
        delete?: boolean;
        out_of_stock?: boolean;
        is_archived?: boolean;
      }[],
    ) => {
      if (!actions.length) return;
      if (!adminPin) throw new Error('Yetkisiz işlem: PIN gerekli');

      // Process actions to match RPC format (converting prices if needed)
      const formattedActions = await Promise.all(actions.map(async (action) => {
        const formatted: any = { ...action };
        if (action.newPrice !== undefined) {
          const { formatNumberToCurrency } = await import('../utils/core');
          formatted.newPrice = formatNumberToCurrency(action.newPrice);
        }
        return formatted;
      }));

      const { error } = await supabase.rpc('secure_bulk_update_products', {
        p_pin: adminPin,
        p_actions: formattedActions
      });

      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    addProduct: addMutation.mutateAsync,
    updateProduct: updateMutation.mutateAsync,
    deleteProduct: deleteMutation.mutateAsync,
    reorderCategories: reorderCategoryMutation.mutateAsync,
    renameCategory: renameCategoryMutation.mutateAsync,
    reorderProduct: reorderProductsMutation.mutateAsync,
    uploadImage: uploadImageMutation.mutateAsync,
    executeGranularBulkActions: bulkActionMutation.mutateAsync,
    isMutating:
      updateMutation.isPending ||
      deleteMutation.isPending ||
      addMutation.isPending ||
      uploadImageMutation.isPending ||
      bulkActionMutation.isPending ||
      reorderCategoryMutation.isPending ||
      renameCategoryMutation.isPending ||
      reorderProductsMutation.isPending,
  };
}

// --- 3. CATALOG ENGINE (Logic Layer) ---

export function useCatalogEngine(products: Product[], categoryOrder: string[], activeCategories: string[], isAdmin: boolean) {
  const groupedProducts = useMemo(() => {
    return products.reduce((acc, product) => {
      const category = product.category || TECH.products.fallbackCategory;
      if (!acc[category]) acc[category] = [];
      acc[category].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [products]);

  const { sortedList, stats } = useMemo(() => {
    const foundInProducts = [
      ...new Set(products.map((p) => p.category).filter(Boolean)),
    ];
    const consolidated = [...new Set([...categoryOrder, ...foundInProducts])];
    const statsObj: Record<string, number> = {};

    products.forEach((p) => {
      if (p.category) statsObj[p.category] = (statsObj[p.category] || 0) + 1;
    });

    return {
      sortedList: sortCategories(consolidated, categoryOrder),
      stats: statsObj,
    };
  }, [products, categoryOrder]);

  const displayCategories = useMemo(() => {
    const allCategories = sortedList;
    const filtered = activeCategories.length > 0 ? allCategories.filter(cat => activeCategories.includes(cat)) : allCategories;
    
    if (isAdmin) return filtered;
    return filtered.filter(cat => (groupedProducts[cat] || []).length > 0 || activeCategories.includes(cat));
  }, [groupedProducts, sortedList, activeCategories, isAdmin]);

  return { groupedProducts, displayCategories, sortedList, stats };
}

// --- 4. COORDINATOR HOOK (Main Entry) ---

export function useProducts(searchQuery: string, activeCategories: string[], isAdmin: boolean, settings: CompanySettings | null) {
  const { data: allProducts = [], isLoading: productsLoading } = useProductsQuery(settings?.id);
  const actions = useProductsActions();

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];
    if (!isAdmin) result = result.filter((p) => !p.is_archived);
    if (activeCategories.length > 0) result = result.filter((p) => activeCategories.includes(p.category));
    if (searchQuery) result = smartSearch(searchQuery, result);
    return result;
  }, [allProducts, searchQuery, activeCategories, isAdmin]);

  const categoryOrder = useMemo(() => settings?.categoryOrder || [], [settings?.categoryOrder]);
  const { sortedList, stats } = useCatalogEngine(allProducts, categoryOrder, activeCategories, isAdmin);

  return {
    products: filteredProducts,
    allProducts,
    categoryOrder,
    sortedList,
    stats,
    loading: productsLoading,
    addProduct: actions.addProduct,
    updateProduct: actions.updateProduct,
    deleteProduct: actions.deleteProduct,
    uploadImage: actions.uploadImage,
    renameCategory: actions.renameCategory,
    reorderCategories: actions.reorderCategories,
    executeGranularBulkActions: actions.executeGranularBulkActions,
    reorderCategory: async (categoryName: string, newPosition: number) => {
      const oldIndex = categoryOrder.indexOf(categoryName);
      if (oldIndex === -1) return;
      const updatedOrder = reorderArray(categoryOrder, oldIndex, newPosition - 1);
      await actions.reorderCategories(updatedOrder);
    },
    reorderProductsInCategory: async (id: string, newPosition: number) => {
      const targetProduct = allProducts.find(p => p.id === id);
      if (!targetProduct) return;

      const categoryProducts = allProducts
        .filter(p => p.category === targetProduct.category)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

      const oldIndex = categoryProducts.findIndex(p => p.id === id);
      if (oldIndex === -1) return;

      const reordered = reorderArray(categoryProducts, oldIndex, newPosition - 1);
      
      const bulkActions = reordered.map((p, idx) => ({
        productId: p.id,
        newSortOrder: idx + 1
      }));

      // Map to executeGranularBulkActions format
      await actions.executeGranularBulkActions(bulkActions);
    },
    addCategory: async (name: string) => {
      if (!settings?.id) return;
      
      // 1. Create a placeholder product
      await actions.addProduct({
        name: 'Yeni Kategori Ürünü',
        category: name,
        price: '0',
        description: 'Bu ürün kategoriyi oluşturmak için otomatik eklenmiştir.',
        image_url: null,
        store_id: settings.id,
        out_of_stock: false,
        is_archived: true,
      });

      // 2. Persist to category_order list in DB
      const currentOrder = settings.categoryOrder || [];
      if (!currentOrder.includes(name)) {
        const updatedOrder = [...currentOrder, name];
        await actions.reorderCategories(updatedOrder);
      }
    },
  };
}
