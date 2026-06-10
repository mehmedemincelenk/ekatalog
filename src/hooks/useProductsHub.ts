import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { Product, NewProductPayload, CompanySettings } from '../types';
import {
  reorderArray,
  smartSearch,
  sortCategories,
  getActiveStoreSlug,
  resolveLegacyImagePath,
} from '../utils/core';
import { useStore } from '../store';
import { TECH } from '../data/config';

/**
 * PRODUCTS & CATALOG HUB (DIAMOND EDITION)
 * -----------------------------------------------------------
 * Unified orchestrator for all product-related operations:
 * 1. Data Fetching (Query)
 * 2. Mutations (Add, Update, Delete, Bulk)
 * 3. Catalog Engine (Grouping, Filtering, Sorting)
 * 4. Storage Service (Visual Asset Management)
 */

const STORE_SLUG = getActiveStoreSlug();
const isVirtual = STORE_SLUG === 'landingpage' || STORE_SLUG === 'misal' || STORE_SLUG === 'ornek';
let isProductsFirstLoad = true;

// --- 1. QUERY HOOK (Data Layer) ---

export function useProductsQuery(storeId?: string) {
  const queryKey = ['products', storeId];

  if (typeof window !== 'undefined' && isProductsFirstLoad && isVirtual && storeId) {
    localStorage.removeItem(`ekatalog_local_products_${storeId}`);
    isProductsFirstLoad = false;
  }

  return useQuery<Product[]>({
    queryKey,
    queryFn: async () => {
      if (STORE_SLUG === 'landingpage') {
        const { MOCK_LANDINGPAGE_PRODUCTS } =
          await import('../data/mockLandingpage');
        return MOCK_LANDINGPAGE_PRODUCTS;
      }

      // If virtual, check localStorage first (to retain temporary edits during session)
      if (isVirtual && typeof window !== 'undefined' && storeId) {
        const cached = localStorage.getItem(`ekatalog_local_products_${storeId}`);
        if (cached) {
          try {
            return JSON.parse(cached) as Product[];
          } catch (e) {
            // ignore and fetch
          }
        }
      }

      if (!storeId) return [];
      const { data, error } = await supabase
        .from('prods')
        .select('*')
        .eq('store_id', storeId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      const products = (data || []).map((p) => ({
        ...p,
        image_url: resolveLegacyImagePath(p.image_url) || '',
      }));

      if (typeof window !== 'undefined' && storeId) {
        localStorage.setItem(`ekatalog_local_products_${storeId}`, JSON.stringify(products));
      }

      return products;
    },
    initialData: () => {
      if (typeof window !== 'undefined' && storeId) {
        const cached = localStorage.getItem(`ekatalog_local_products_${storeId}`);
        if (cached) {
          try {
            return JSON.parse(cached) as Product[];
          } catch (e) {
            return undefined;
          }
        }
      }
      return undefined;
    },
    enabled: !!storeId,
    staleTime: 0,
  });
}

// --- 2. ACTIONS HOOK (Mutation Layer) ---

export function useProductsActions() {
  const queryClient = useQueryClient();
  const { settings, adminPin } = useStore();
  const queryKey = ['products', settings?.id];

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      changes,
    }: {
      id: string;
      changes: Partial<Product>;
    }) => {
      if (isVirtual) return;
      if (!adminPin) throw new Error('Yetkisiz işlem: PIN gerekli');
      const { error } = await supabase.rpc('secure_update_product', {
        p_id: id,
        p_pin: adminPin,
        p_changes: changes,
      });
      if (error) throw error;
    },
    onMutate: async ({ id, changes }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousProducts = queryClient.getQueryData<Product[]>(queryKey);

      if (previousProducts) {
        const updated = previousProducts.map((p) =>
          p.id === id ? { ...p, ...changes } : p
        );
        queryClient.setQueryData<Product[]>(queryKey, updated);
        if (typeof window !== 'undefined' && settings?.id) {
          localStorage.setItem(`ekatalog_local_products_${settings.id}`, JSON.stringify(updated));
        }
      }
      return { previousProducts };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData<Product[]>(queryKey, context.previousProducts);
        if (typeof window !== 'undefined' && settings?.id) {
          localStorage.setItem(`ekatalog_local_products_${settings.id}`, JSON.stringify(context.previousProducts));
        }
      }
    },
    onSettled: () => {
      if (!isVirtual) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isVirtual) return;
      if (!adminPin) throw new Error('Yetkisiz işlem: PIN gerekli');
      const { error } = await supabase.rpc('secure_delete_product', {
        p_id: id,
        p_pin: adminPin,
      });
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousProducts = queryClient.getQueryData<Product[]>(queryKey);

      if (previousProducts) {
        const updated = previousProducts.filter((p) => p.id !== id);
        queryClient.setQueryData<Product[]>(queryKey, updated);
        if (typeof window !== 'undefined' && settings?.id) {
          localStorage.setItem(`ekatalog_local_products_${settings.id}`, JSON.stringify(updated));
        }
      }
      return { previousProducts };
    },
    onError: (_err, _id, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData<Product[]>(queryKey, context.previousProducts);
        if (typeof window !== 'undefined' && settings?.id) {
          localStorage.setItem(`ekatalog_local_products_${settings.id}`, JSON.stringify(context.previousProducts));
        }
      }
    },
    onSettled: () => {
      if (!isVirtual) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });

  const reorderCategoryMutation = useMutation({
    mutationFn: async (newOrder: string[]) => {
      if (isVirtual) return;
      if (!settings?.id || !adminPin) throw new Error('Yetkisiz işlem');
      const { error } = await supabase.rpc('secure_reorder_categories', {
        p_store_id: settings.id,
        p_pin: adminPin,
        p_new_order: newOrder,
      });
      if (error) throw error;
    },
    onMutate: async (newOrder) => {
      const settingsKey = ['settings', STORE_SLUG];
      await queryClient.cancelQueries({ queryKey: settingsKey });
      const previousSettings = queryClient.getQueryData<CompanySettings>(settingsKey);

      if (previousSettings) {
        const updated = {
          ...previousSettings,
          categoryOrder: newOrder,
        };
        queryClient.setQueryData<CompanySettings>(settingsKey, updated);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`ekatalog_local_settings_${STORE_SLUG}`, JSON.stringify(updated));
        }
      }
      return { previousSettings };
    },
    onError: (_err, _variables, context) => {
      const settingsKey = ['settings', STORE_SLUG];
      if (context?.previousSettings) {
        queryClient.setQueryData<CompanySettings>(settingsKey, context.previousSettings);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`ekatalog_local_settings_${STORE_SLUG}`, JSON.stringify(context.previousSettings));
        }
      }
    },
    onSettled: () => {
      if (!isVirtual) {
        queryClient.invalidateQueries({ queryKey: ['settings', STORE_SLUG] });
      }
    },
  });

  const renameCategoryMutation = useMutation({
    mutationFn: async ({
      oldName,
      newName,
    }: {
      oldName: string;
      newName: string;
    }) => {
      if (isVirtual) return;
      if (!settings?.id || !adminPin) throw new Error('Yetkisiz işlem');
      const { error } = await supabase.rpc('secure_rename_category', {
        p_store_id: settings.id,
        p_pin: adminPin,
        p_old_name: oldName,
        p_new_name: newName,
      });
      if (error) throw error;
    },
    onMutate: async ({ oldName, newName }) => {
      const settingsKey = ['settings', STORE_SLUG];
      await queryClient.cancelQueries({ queryKey });
      await queryClient.cancelQueries({ queryKey: settingsKey });

      const previousProducts = queryClient.getQueryData<Product[]>(queryKey);
      const previousSettings = queryClient.getQueryData<CompanySettings>(settingsKey);

      if (previousProducts) {
        const updatedProds = previousProducts.map((p) =>
          p.category === oldName ? { ...p, category: newName } : p
        );
        queryClient.setQueryData<Product[]>(queryKey, updatedProds);
        if (typeof window !== 'undefined' && settings?.id) {
          localStorage.setItem(`ekatalog_local_products_${settings.id}`, JSON.stringify(updatedProds));
        }
      }

      if (previousSettings) {
        const updatedSettings = {
          ...previousSettings,
          categoryOrder: (previousSettings.categoryOrder || []).map((cat) =>
            cat === oldName ? newName : cat
          ),
        };
        queryClient.setQueryData<CompanySettings>(settingsKey, updatedSettings);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`ekatalog_local_settings_${STORE_SLUG}`, JSON.stringify(updatedSettings));
        }
      }

      return { previousProducts, previousSettings };
    },
    onError: (_err, _variables, context) => {
      const settingsKey = ['settings', STORE_SLUG];
      if (context?.previousProducts) {
        queryClient.setQueryData<Product[]>(queryKey, context.previousProducts);
        if (typeof window !== 'undefined' && settings?.id) {
          localStorage.setItem(`ekatalog_local_products_${settings.id}`, JSON.stringify(context.previousProducts));
        }
      }
      if (context?.previousSettings) {
        queryClient.setQueryData<CompanySettings>(settingsKey, context.previousSettings);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`ekatalog_local_settings_${STORE_SLUG}`, JSON.stringify(context.previousSettings));
        }
      }
    },
    onSettled: () => {
      if (!isVirtual) {
        queryClient.invalidateQueries({ queryKey });
        queryClient.invalidateQueries({ queryKey: ['settings', STORE_SLUG] });
      }
    },
  });

  const reorderProductsMutation = useMutation({
    mutationFn: async ({
      id,
      newSortOrder,
    }: {
      id: string;
      newSortOrder: number;
    }) => {
      if (isVirtual) return;
      if (!adminPin) throw new Error('Yetkisiz işlem');
      const { error } = await supabase.rpc('secure_update_product', {
        p_id: id,
        p_pin: adminPin,
        p_changes: { sort_order: newSortOrder },
      });
      if (error) throw error;
    },
    onMutate: async ({ id, newSortOrder }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousProducts = queryClient.getQueryData<Product[]>(queryKey);

      if (previousProducts) {
        const updated = previousProducts.map((p) =>
          p.id === id ? { ...p, sort_order: newSortOrder } : p
        );
        queryClient.setQueryData<Product[]>(queryKey, updated);
        if (typeof window !== 'undefined' && settings?.id) {
          localStorage.setItem(`ekatalog_local_products_${settings.id}`, JSON.stringify(updated));
        }
      }
      return { previousProducts };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData<Product[]>(queryKey, context.previousProducts);
        if (typeof window !== 'undefined' && settings?.id) {
          localStorage.setItem(`ekatalog_local_products_${settings.id}`, JSON.stringify(context.previousProducts));
        }
      }
    },
    onSettled: () => {
      if (!isVirtual) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newProduct: NewProductPayload) => {
      if (isVirtual) {
        const generatedId = `mock-${Date.now()}`;
        const mockProduct: Product = {
          id: generatedId,
          name: newProduct.name,
          category: newProduct.category || '',
          price: newProduct.price || '',
          description: newProduct.description || '',
          image_url: newProduct.image_url || '',
          original_image_url: null,
          polished_image_url: null,
          is_polished_pending: false,
          polished_ready_dismissed: false,
          text_polished_dismissed: false,
          suggested_name: null,
          suggested_description: null,
          sort_order: 999,
          out_of_stock: false,
          is_archived: false,
          store_id: settings?.id || 'landingpage',
        };
        queryClient.setQueryData<Product[]>(queryKey, (old) => {
          if (!old) return [mockProduct];
          return [...old, mockProduct];
        });
        return generatedId;
      }
      if (!settings?.id || !adminPin) throw new Error('Yetkisiz işlem');
      const { data, error } = await supabase.rpc('secure_add_product', {
        p_pin: adminPin,
        p_payload: {
          ...newProduct,
          store_id: settings.id,
        },
      });
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => {
      if (!isVirtual) {
        queryClient.invalidateQueries({ queryKey });
      } else {
        const updated = queryClient.getQueryData<Product[]>(queryKey);
        if (updated && typeof window !== 'undefined' && settings?.id) {
          localStorage.setItem(`ekatalog_local_products_${settings.id}`, JSON.stringify(updated));
        }
      }
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      if (isVirtual) {
        const localUrl = URL.createObjectURL(file);
        queryClient.setQueryData<Product[]>(queryKey, (old) => {
          if (!old) return [];
          return old.map((p) =>
            p.id === id
              ? { ...p, image_url: localUrl, is_polished_pending: false }
              : p,
          );
        });
        return localUrl;
      }
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
        isDualQuality: true,
      });

      if (finalizedUrl) {
        const { error } = await supabase.rpc('secure_update_product', {
          p_id: id,
          p_pin: adminPin,
          p_changes: {
            image_url: finalizedUrl,
            is_polished_pending: false,
          },
        });
        if (error) throw error;
      }
      return finalizedUrl;
    },
    onSuccess: () => {
      if (!isVirtual) {
        queryClient.invalidateQueries({ queryKey });
      } else {
        const updated = queryClient.getQueryData<Product[]>(queryKey);
        if (updated && typeof window !== 'undefined' && settings?.id) {
          localStorage.setItem(`ekatalog_local_products_${settings.id}`, JSON.stringify(updated));
        }
      }
    },
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
      if (isVirtual) return;
      if (!adminPin) throw new Error('Yetkisiz işlem: PIN gerekli');

      // Process actions to match RPC format (converting prices if needed)
      const formattedActions = await Promise.all(
        actions.map(async (action) => {
          const formatted: any = { ...action };
          if (action.newPrice !== undefined) {
            const { formatNumberToCurrency } = await import('../utils/core');
            formatted.newPrice = formatNumberToCurrency(action.newPrice);
          }
          return formatted;
        }),
      );

      const { error } = await supabase.rpc('secure_bulk_update_products', {
        p_pin: adminPin,
        p_actions: formattedActions,
      });

      if (error) throw error;
    },
    onMutate: async (actions) => {
      await queryClient.cancelQueries({ queryKey });
      const previousProducts = queryClient.getQueryData<Product[]>(queryKey);

      if (previousProducts) {
        const { formatNumberToCurrency } = await import('../utils/core');
        let updated = [...previousProducts];
        for (const action of actions) {
          if (action.delete) {
            updated = updated.filter((p) => p.id !== action.productId);
          } else {
            updated = updated.map((p) => {
              if (p.id !== action.productId) return p;
              const changes: Partial<Product> = {};
              if (action.newPrice !== undefined) {
                changes.price =
                  action.newPrice === 0
                    ? ''
                    : formatNumberToCurrency(action.newPrice);
              }
              if (action.newSortOrder !== undefined) {
                changes.sort_order = action.newSortOrder;
              }
              if (action.category !== undefined) {
                changes.category = action.category;
              }
              if (action.out_of_stock !== undefined) {
                changes.out_of_stock = action.out_of_stock;
              }
              if (action.is_archived !== undefined) {
                changes.is_archived = action.is_archived;
              }
              return { ...p, ...changes };
            });
          }
        }
        queryClient.setQueryData<Product[]>(queryKey, updated);
        if (typeof window !== 'undefined' && settings?.id) {
          localStorage.setItem(`ekatalog_local_products_${settings.id}`, JSON.stringify(updated));
        }
      }
      return { previousProducts };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData<Product[]>(queryKey, context.previousProducts);
        if (typeof window !== 'undefined' && settings?.id) {
          localStorage.setItem(`ekatalog_local_products_${settings.id}`, JSON.stringify(context.previousProducts));
        }
      }
    },
    onSettled: () => {
      if (!isVirtual) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
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

export function useCatalogEngine(
  products: Product[],
  categoryOrder: string[],
  activeCategories: string[],
  isAdmin: boolean,
) {
  const groupedProducts = useMemo(() => {
    const sortedProducts = [...products].sort((a, b) => {
      const orderA = a.sort_order ?? 999;
      const orderB = b.sort_order ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });

    return sortedProducts.reduce(
      (acc, product) => {
        const category = product.category || TECH.products.fallbackCategory;
        if (!acc[category]) acc[category] = [];
        acc[category].push(product);
        return acc;
      },
      {} as Record<string, Product[]>,
    );
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
    const filtered =
      activeCategories.length > 0
        ? allCategories.filter((cat) => activeCategories.includes(cat))
        : allCategories;

    if (isAdmin) return filtered;
    return filtered.filter(
      (cat) =>
        (groupedProducts[cat] || []).length > 0 ||
        activeCategories.includes(cat),
    );
  }, [groupedProducts, sortedList, activeCategories, isAdmin]);

  return { groupedProducts, displayCategories, sortedList, stats };
}

// --- 4. COORDINATOR HOOK (Main Entry) ---

export function useProducts(
  searchQuery: string,
  activeCategories: string[],
  isAdmin: boolean,
  settings: CompanySettings | null,
) {
  const { data: allProducts = [], isLoading: productsLoading } =
    useProductsQuery(settings?.id);
  const actions = useProductsActions();

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];
    if (!isAdmin) result = result.filter((p) => !p.is_archived);
    if (activeCategories.length > 0)
      result = result.filter((p) => activeCategories.includes(p.category));
    if (searchQuery) result = smartSearch(searchQuery, result);
    return result;
  }, [allProducts, searchQuery, activeCategories, isAdmin]);

  const categoryOrder = useMemo(
    () => settings?.categoryOrder || [],
    [settings?.categoryOrder],
  );
  const { sortedList, stats } = useCatalogEngine(
    allProducts,
    categoryOrder,
    activeCategories,
    isAdmin,
  );

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
      const updatedOrder = reorderArray(
        categoryOrder,
        oldIndex,
        newPosition - 1,
      );
      await actions.reorderCategories(updatedOrder);
    },
    reorderProductsInCategory: async (id: string, newPosition: number) => {
      const targetProduct = allProducts.find((p) => p.id === id);
      if (!targetProduct) return;

      const categoryProducts = allProducts
        .filter((p) => p.category === targetProduct.category)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

      const oldIndex = categoryProducts.findIndex((p) => p.id === id);
      if (oldIndex === -1) return;

      const reordered = reorderArray(
        categoryProducts,
        oldIndex,
        newPosition - 1,
      );

      const bulkActions = reordered.map((p, idx) => ({
        productId: p.id,
        newSortOrder: idx + 1,
      }));

      // Map to executeGranularBulkActions format
      await actions.executeGranularBulkActions(bulkActions);
    },
    addCategory: async (name: string) => {
      if (!settings?.id) return;

      const currentOrder = settings.categoryOrder || [];
      if (!currentOrder.includes(name)) {
        const updatedOrder = [...currentOrder, name];
        await actions.reorderCategories(updatedOrder);
      }
    },
    deleteCategory: async (name: string) => {
      const catProds = allProducts?.filter((p) => p.category === name) || [];

      if (catProds.length > 0) {
        const bulkActions = catProds.map((p) => ({
          productId: p.id,
          category: 'Arşiv',
        }));
        await actions.executeGranularBulkActions(bulkActions);
      }

      let newOrder = (categoryOrder || []).filter((c) => c !== name);
      if (catProds.length > 0 && !newOrder.includes('Arşiv')) {
        newOrder = [...newOrder, 'Arşiv'];
      }

      await actions.reorderCategories(newOrder);
    },
  };
}
