import { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import HeroCarousel from './components/HeroCarousel';
import SearchFilter from './components/SearchFilter';
import ProductGrid from './components/ProductGrid';
import AddProductModal from './components/AddProductModal';
import References from './components/References';
import Footer from './components/Footer';
import { useProducts } from './hooks/useProducts';
import { useAdminMode } from './hooks/useAdminMode';

export default function App() {
  const { products, updateProduct, removeProduct, addProduct, renameCategory, removeCategoryFromProducts } = useProducts();
  const { isAdmin, handleLogoClick } = useAdminMode();
  const [search, setSearch] = useState('');
  const [activeCategories, setActiveCategories] = useState([]); // Boş dizi => 'Tümü'
  const [showAddModal, setShowAddModal] = useState(false);

  // Kategori seçme / çıkarma mantığı (Tümü'ne basılırsa hepsini iptal et)
  const toggleCategory = (cat) => {
    if (cat === 'Tümü') { setActiveCategories([]); return; }
    setActiveCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  // Mevcut benzersiz kategorileri türet (Modal vs. için)
  const existingCategories = useMemo(() => {
    return [...new Set(products.map((p) => p.category).filter(Boolean))].sort();
  }, [products]);

  // Derive filtered products from search + category
  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase().trim();
    return products.filter((p) => {
      const matchSearch = !term || p.name.toLowerCase().includes(term);
      const matchCategory = activeCategories.length === 0 || activeCategories.includes(p.category);
      return matchSearch && matchCategory;
    });
  }, [products, search, activeCategories]);

  const handleAddProduct = (product) => {
    addProduct(product);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />

      <HeroCarousel isAdmin={isAdmin} />

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

      {/* Main catalog content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Catalog header row */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-sm font-semibold text-stone-500">
            {filteredProducts.length} ürün listeleniyor
          </h1>
          {isAdmin && (
            <div className="text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded">
              🔓 Admin Modu Aktif
            </div>
          )}
        </div>

        <ProductGrid
          products={filteredProducts}
          isAdmin={isAdmin}
          onDelete={removeProduct}
          onUpdate={updateProduct}
        />
      </main>

      <References />

      <Footer onLogoClick={handleLogoClick} isAdmin={isAdmin} />

      {/* Admin floating + button */}
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

      {/* Add product modal */}
      {showAddModal && (
        <AddProductModal
          categories={existingCategories}
          onAdd={handleAddProduct}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
