// SearchFilter: real-time search box + dynamic category chips
export default function SearchFilter({ products, search, onSearchChange, activeCategory, onCategoryChange, isAdmin, renameCategory, removeCategoryFromProducts }) {
  // Derive unique categories from product list, always prepend "Tümü"
  const categories = ['Tümü', ...new Set(products.map((p) => p.category).filter(Boolean))];

  return (
    <section className="bg-white border-b border-stone-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Search input */}
        <div className="relative w-full md:w-64 shrink-0">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0z" />
            </svg>
          </span>
          <input
            id="product-search"
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Ürün ara…"
            className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-md text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-kraft-400 focus:border-kraft-400 transition"
          />
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 flex-1">
          {categories.map((cat) => {
            if (cat === 'Tümü') {
              return (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors duration-150 ${
                    activeCategory === cat
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-600 border-stone-300 hover:border-stone-500 hover:text-stone-900'
                  }`}
                >
                  {cat}
                </button>
              );
            }

            return (
              <div key={cat} className="group flex items-center gap-1">
                <button
                  onClick={() => !isAdmin && onCategoryChange(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors duration-150 ${
                    activeCategory === cat && !isAdmin
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-600 border-stone-300 hover:border-stone-500 hover:text-stone-900'
                  } ${isAdmin ? 'cursor-text ring-1 ring-amber-300 bg-amber-50' : ''}`}
                  contentEditable={isAdmin}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    if (isAdmin) {
                      const newName = e.currentTarget.textContent.trim();
                      if (newName && newName !== cat) {
                        renameCategory(cat, newName);
                        // Eğer aktif kategori değiştirildiyse seçimi de güncelle
                        if (activeCategory === cat) onCategoryChange(newName);
                      }
                      if (!newName) e.currentTarget.textContent = cat;
                    }
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                >
                  {cat}
                </button>
                {isAdmin && (
                  <button 
                    onClick={() => {
                        window.confirm(`'${cat}' kategorisini listeden tamamen silmek istediğinize emin misiniz? (Bu kategorideki ürünler kategorisiz bölümüne düşer)`) && removeCategoryFromProducts(cat);
                        // Eğer silinen aktif kategoriyse menüyü sıfırla
                        if (activeCategory === cat) onCategoryChange('Tümü');
                    }}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-colors pb-0.5 font-bold"
                    title="Bu kategoriyi tampon bellekten tamamen sil"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
