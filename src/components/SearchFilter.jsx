import { sortCategories } from '../data/config';

// SearchFilter: real-time search box + dynamic category chips
export default function SearchFilter({ products, search, onSearchChange, activeCategories = [], onCategoryToggle, isAdmin, renameCategory, removeCategoryFromProducts }) {
  const dynamicCategories = [...new Set(products.map((p) => p.category).filter(Boolean))];
  const sortedList = sortCategories(dynamicCategories);
  const categories = ['Tümü', ...sortedList];

  return (
    <section className="bg-white border-b border-stone-200 py-4 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search Input - Desktop'ta dar (w-48), mobilde geniş (w-full) */}
        <div className="relative w-full sm:w-48 shrink-0">
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

        {/* Filter Chips - Flex Wrap ile alt alta katlanan yapı */}
        <div className="flex flex-wrap gap-2 items-center flex-1">
          {categories.map((cat) => {
            const isActive = cat === 'Tümü' ? activeCategories.length === 0 : activeCategories.includes(cat);
            const emoji = (cat === "Tümü" ? "🔍" : "📦") || '🏷️';
            return (
              <div key={cat} className="group flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => !isAdmin && onCategoryToggle(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors duration-150 flex items-center gap-1.5 ${
                    isActive && !isAdmin ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-300 hover:border-stone-500 hover:text-stone-900'
                  } ${isAdmin ? 'cursor-text bg-amber-50' : ''}`}
                >
                  <span className="select-none pointer-events-none">{emoji}</span>
                  <span
                    contentEditable={isAdmin}
                    suppressContentEditableWarning
                    onClick={(e) => { if (isAdmin) e.stopPropagation(); }}
                    onBlur={(e) => {
                      if (isAdmin) {
                        const newName = e.currentTarget.textContent.trim();
                        if (newName && newName !== cat) {
                          renameCategory(cat, newName);
                          if (activeCategories.includes(cat)) onCategoryToggle('Tümü');
                        }
                        if (!newName) e.currentTarget.textContent = cat;
                      }
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                  >
                    {cat}
                  </span>
                </button>
                {isAdmin && cat !== 'Tümü' && (
                  <button onClick={() => { window.confirm(`Silinsin mi?`) && removeCategoryFromProducts(cat); if (activeCategories.includes(cat)) onCategoryToggle('Tümü'); }} className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm" title="Kategoriyi Sil">×</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
