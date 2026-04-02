import { sortCategories } from '../data/config';

export default function SearchFilter({ products, search, onSearchChange, activeCategories = [], onCategoryToggle, isAdmin }) {
  const dynamicCategories = [...new Set(products.map((p) => p.category).filter(Boolean))];
  const sortedList = sortCategories(dynamicCategories);
  const categories = ['Tümü', ...sortedList];

  return (
    <section className="search-section">
      <div className="search-container">
        {/* Search Input */}
        <div className="search-input-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0z" />
          </svg>
          <input
            id="product-search"
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Ürün ara…"
            className="search-input"
          />
        </div>

        {/* Filter Chips */}
        <div className="filter-chips">
          {categories.map((cat) => {
            const isActive = cat === 'Tümü' ? activeCategories.length === 0 : activeCategories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => onCategoryToggle(cat)}
                className={`filter-chip ${isActive ? 'active' : ''}`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
