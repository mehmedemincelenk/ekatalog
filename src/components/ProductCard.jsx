import React, { useState, useRef, useEffect } from 'react';
import FocusedEditModal from "./FocusedEditModal";

export default function ProductCard({ product, categories = [], isAdmin, onDelete, onUpdate }) {
  const [showFocusedEdit, setShowFocusedEdit] = useState(false);
  const cardRef = useRef(null);
  const [showActions, setShowActions] = useState(false);

  // Click-Away Listener (Menüyü kapatmak için)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setShowActions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) onDelete(product.id);
  };

  const getImageUrl = (path) => {
    if (!path) return path;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
  };

  const isOutOfStock = product.inStock === false;

  return (
    <>
      <article 
        ref={cardRef}
        onClick={() => isAdmin && setShowFocusedEdit(true)} 
        className={`product-card ${isOutOfStock ? 'out-of-stock' : ''} ${isAdmin ? 'admin-card' : ''}`}
      >
        {/* Görsel Alanı */}
        <div className="card-image-wrapper">
          {product.image ? (
            <img src={getImageUrl(product.image)} alt={product.name} className="card-image" loading="lazy" />
          ) : (
            <div className="card-placeholder">📦</div>
          )}
          
          {product.category && (
            <span className="card-category-tag">{product.category}</span>
          )}

          {isOutOfStock && <div className="stock-overlay">TÜKENDİ</div>}
        </div>

        {/* Bilgi Alanı */}
        <div className="card-info">
          <h3 className="card-title">{product.name}</h3>
          
          {product.description && (
            <p className="card-description">
              {product.description.split('\n')[0]} {/* Sadece ilk satırı göster, gerisi modalda */}
            </p>
          )}

          <div className="card-footer">
            <span className="card-price">{product.price}</span>
            
            {isAdmin && (
              <button 
                className="card-action-trigger"
                onClick={(e) => { e.stopPropagation(); setShowActions(!showActions); }}
              >
                ⋯
              </button>
            )}
          </div>
        </div>

        {/* Hızlı Admin Aksiyonları (3-Nokta Menüsü) */}
        {isAdmin && showActions && (
          <div className="card-admin-menu" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { onUpdate(product.id, { inStock: isOutOfStock }); setShowActions(false); }}>
              {isOutOfStock ? '✅ Stoğa Al' : '🚫 Tükendi İşaretle'}
            </button>
            <button onClick={() => { onUpdate(product.id, { isArchived: !product.isArchived }); setShowActions(false); }}>
              📦 {product.isArchived ? 'Arşivden Çıkar' : 'Arşive Al'}
            </button>
            <button onClick={handleDeleteClick} className="menu-delete">
              🗑️ Sil
            </button>
          </div>
        )}
      </article>

      {showFocusedEdit && (
        <FocusedEditModal 
          product={product} 
          onClose={() => setShowFocusedEdit(false)} 
          onUpdate={onUpdate} 
        />
      )}
    </>
  );
}
