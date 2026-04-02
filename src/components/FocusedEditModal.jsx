import React, { useState, useRef, useEffect } from 'react';
import { compressImage } from '../utils/image';

export default function FocusedEditModal({ product, onClose, onUpdate }) {
  const [editedProduct, setEditedProduct] = useState({ ...product });
  const [isUploading, setIsUploading] = useState(false);
  const [activeField, setActiveField] = useState(null); // Track which field is being edited
  const fileInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const priceInputRef = useRef(null);
  const descInputRef = useRef(null);

  // Esc key to close
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleChange = (field, value) => {
    setEditedProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleImageClick = () => {
    setActiveField('image');
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const compressedBase64 = await compressImage(file, 800, 0.7);
      handleChange('image', compressedBase64);
    } catch (err) {
      console.error('Resim yükleme hatası:', err);
      alert('Resim yüklenirken bir hata oluştu.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    onUpdate(product.id, editedProduct);
    onClose();
  };

  const focusField = (field) => {
    setActiveField(field);
    if (field === 'name') nameInputRef.current?.focus();
    if (field === 'price') priceInputRef.current?.focus();
    if (field === 'description') descInputRef.current?.focus();
  };

  return (
    <div className="focused-edit-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="focused-edit-modal">
        {/* Header - Subtle hint */}
        <div className="focused-edit-header">
          <span>Ürünü Düzenle</span>
          <button className="close-x" onClick={onClose}>✕</button>
        </div>

        {/* Görsel Alanı - Contextual Edit */}
        <div 
          className={`focused-edit-image-container ${activeField === 'image' ? 'active-ring' : ''}`} 
          onClick={handleImageClick}
        >
          {editedProduct.image ? (
            <img src={editedProduct.image} alt="Ürün" className="focused-edit-image" />
          ) : (
            <div className="focused-edit-placeholder">
              <span className="placeholder-icon">📸</span>
              <span className="placeholder-text">Fotoğraf Ekle</span>
            </div>
          )}

          <div className="focused-edit-image-hint">
            {isUploading ? 'Yükleniyor...' : 'Değiştirmek için dokun'}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden-file-input"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        {/* Metin Alanları - Focus on one at a time */}
        <div className="focused-edit-content">
          <div 
            className={`input-group ${activeField === 'name' ? 'active-field' : ''}`}
            onClick={() => focusField('name')}
          >
            <label className="field-label">Ürün Adı</label>
            <input
              ref={nameInputRef}
              type="text"
              value={editedProduct.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              onFocus={() => setActiveField('name')}
              className="focused-input input-title"
              placeholder="Örn: Kraft Kutu"
            />
          </div>

          <div 
            className={`input-group ${activeField === 'price' ? 'active-field' : ''}`}
            onClick={() => focusField('price')}
          >
            <label className="field-label">Fiyat</label>
            <input
              ref={priceInputRef}
              type="text"
              value={editedProduct.price || ''}
              onChange={(e) => handleChange('price', e.target.value)}
              onFocus={() => setActiveField('price')}
              className="focused-input input-price"
              placeholder="0.00 ₺"
            />
          </div>

          <div 
            className={`input-group ${activeField === 'description' ? 'active-field' : ''}`}
            onClick={() => focusField('description')}
          >
            <label className="field-label">Açıklama (Opsiyonel)</label>
            <textarea
              ref={descInputRef}
              value={editedProduct.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              onFocus={() => setActiveField('description')}
              className="focused-input input-desc"
              placeholder="Ürün detaylarını buraya yazın..."
              rows={2}
            />
          </div>
        </div>

        {/* Aksiyonlar - Sticky at bottom */}
        <div className="focused-edit-actions">
          <button type="button" onClick={onClose} className="btn-cancel">
            Vazgeç
          </button>
          <button type="button" onClick={handleSave} className="btn-save">
            GÜNCELLE
          </button>
        </div>
      </div>
    </div>
  );
}
