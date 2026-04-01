import { GRID } from '../data/config';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, categories, isAdmin, onDelete, onUpdate }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-stone-400">
        <span className="text-5xl mb-3">🔍</span>
        <p className="text-sm font-medium">Ürün bulunamadı.</p>
      </div>
    );
  }

  // Ürünleri 'category' etiketine göre gruplara ayır
  const groupedProducts = products.reduce((acc, product) => {
    const catName = product.category || 'KATEGORİSİZ / DİĞER';
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(product);
    return acc;
  }, {});

  // Oluşan kategori reyonlarını alfabetik olarak hizala
  const sortedCategories = Object.keys(groupedProducts).sort();

  return (
    <div className="w-full flex flex-col">
      {sortedCategories.map((catName) => (
        <div key={catName} className="flex flex-col">
          <h2 className={GRID.headerClass}>
            {catName}
          </h2>
          <div className={`grid ${GRID.colsClass} ${GRID.gapClass}`}>
            {groupedProducts[catName].map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categories={categories}
                isAdmin={isAdmin}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
