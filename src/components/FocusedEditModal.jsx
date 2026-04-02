import React, { useState, useRef, useEffect } from 'react';
import { compressImage } from '../utils/image';

export default function FocusedEditModal({ product, onClose, onUpdate }) {
  const [editedProduct, setEditedProduct] = useState({ ...product });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

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
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      // compressImage fonksiyonu base64 veya Blob döner. Şu an mevcut `utils/image.js`'e göre davranacak.
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

  return (
    <div className="focused-edit-overlay">
      <div className="focused-edit-modal">
        {/* Görsel Alanı */}
        <div className="focused-edit-image-container" onClick={handleImageClick}>
          {editedProduct.image ? (
            <img src={editedProduct.image} alt="Ürün" className="focused-edit-image" />
          ) : (
            <div className="focused-edit-placeholder">
              <span className="placeholder-icon">📸</span>
              <span className="placeholder-text">Fotoğraf Ekle</span>
            </div>
          )}

          <div className="focused-edit-image-hint">
            {isUploading ? 'Yükleniyor...' : 'Fotoğrafı Değiştir'}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden-file-input"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        {/* Metin Alanları */}
        <div className="focused-edit-content">
          <div className="input-group">
            <input
              type="text"
              value={editedProduct.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="focused-input input-title"
              placeholder="Ürün Adı"
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              value={editedProduct.price || ''}
              onChange={(e) => handleChange('price', e.target.value)}
              className="focused-input input-price"
              placeholder="Fiyat (örn: 150 ₺)"
            />
          </div>

          <div className="input-group">
            <textarea
              value={editedProduct.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              className="focused-input input-desc"
              placeholder="Ürün açıklaması ekleyin..."
              rows={3}
            />
          </div>
        </div>

        {/* Aksiyonlar */}
        <div className="focused-edit-actions">
          <button type="button" onClick={onClose} className="btn-cancel">
            Vazgeç
          </button>
          <button type="button" onClick={handleSave} className="btn-save">
            KAYDET
          </button>
        </div>
      </div>
    </div>
  );
}
