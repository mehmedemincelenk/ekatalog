import { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroCarousel from './components/HeroCarousel';
import SearchFilter from './components/SearchFilter';
import ProductGrid from './components/ProductGrid';
import AddProductModal from './components/AddProductModal';
import References from './components/References';
import Footer from './components/Footer';
import PublishBar from './components/PublishBar';
import PublishModal from './components/PublishModal'; // We will create this next
import { useProducts } from './hooks/useProducts';
import { useAdminMode } from './hooks/useAdminMode';
import { useSettings } from './hooks/useSettings';
import { useTenant } from './hooks/useTenant';
import { sortCategories } from './data/config';

export default function App() {
  const { isGhostMode } = useTenant();
  const { products, updateProduct, removeProduct, addProduct, renameCategory, removeCategoryFromProducts, isLoading: isProductsLoading } = useProducts();
  const { isAdmin, handleLogoClick } = useAdminMode();
  const { settings, updateSettings, isLoading: isSettingsLoading } = useSettings();
  const [search, setSearch] = useState('');
  const [activeCategories, setActiveCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isAdmin]);

  const toggleCategory = (cat) => {
    if (cat === 'Tümü') { setActiveCategories([]); return; }
    setActiveCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const existingCategories = useMemo(() => {
    return sortCategories([...new Set(products.map((p) => p.category).filter(Boolean))], settings?.categoryOrder || []);
  }, [products, settings]);

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase().trim();
    return products.filter((p) => {
      if (!isAdmin && p.isArchived) return false;
      const matchSearch = !term || p.name?.toLowerCase().includes(term);
      const matchCategory = activeCategories.length === 0 || activeCategories.includes(p.category);
      return matchSearch && matchCategory;
    });
  }, [products, search, activeCategories, isAdmin]);

  const handleAddProduct = (product) => {
    addProduct(product);
  };

  if (isProductsLoading || isSettingsLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-stone-50"><span className="text-stone-500 tracking-wide text-sm">Yükleniyor...</span></div>;
  }

  return (
    <div className={`min-h-screen flex flex-col bg-stone-50 ${isGhostMode ? 'pt-14' : ''}`} style={{ backgroundColor: settings?.colors?.bg }}>

      <PublishBar onPublish={() => setShowPublishModal(true)} />

      <Navbar settings={settings} />

      <HeroCarousel isAdmin={isAdmin} settings={settings} />

      <SearchFilter
        products={products}
        search={search}
        onSearchChange={setSearch}
        activeCategories={activeCategories}
        onCategoryToggle={toggleCategory}
        isAdmin={isAdmin}
        renameCategory={renameCategory}
        removeCategoryFromProducts={removeCategoryFromProducts}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-sm font-semibold text-stone-500">
            {filteredProducts.length} ürün listeleniyor
          </h1>
          <div className={`text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded transition-opacity ${isAdmin && !isGhostMode ? 'opacity-100' : 'opacity-0 pointer-events-none hidden'}`}>
            🔓 Düzenleme Modu
          </div>
        </div>

        <ProductGrid
          products={filteredProducts}
          isAdmin={isAdmin}
          onDelete={removeProduct}
          onUpdate={updateProduct}
        />
      </main>

      <References />

      <Footer onLogoClick={handleLogoClick} isAdmin={isAdmin} settings={settings} />

      {isAdmin && (
        <button
          id="admin-add-btn"
          onClick={() => setShowAddModal(true)}
          className="admin-fab fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-stone-900 text-white text-4xl pb-1.5 font-light shadow-xl hover:bg-stone-700 transition-colors flex items-center justify-center"
          aria-label="Yeni Ürün Ekle"
        >
          +
        </button>
      )}

      {showAddModal && (
        <AddProductModal
          categories={existingCategories}
          onAdd={handleAddProduct}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showPublishModal && (
        <PublishModal onClose={() => setShowPublishModal(false)} />
      )}
    </div>
  );
}
