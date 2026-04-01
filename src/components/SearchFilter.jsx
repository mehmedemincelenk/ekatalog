// SearchFilter: real-time search box + dynamic category chips
export default function SearchFilter({ products, search, onSearchChange, activeCategory, onCategoryChange }) {
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
          {categories.map((cat) => (
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
          ))}
        </div>
      </div>
    </section>
  );
}
