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

  return (
    <div className={`grid ${GRID.colsClass} ${GRID.gapClass}`}>
      {products.map((product) => (
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
  );
}
