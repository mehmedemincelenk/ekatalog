import { useState } from 'react';
import { MODAL } from '../data/config';

const EMPTY = { name: '', category: '', newCategory: '', price: '', description: '', image: null };

export default function AddProductModal({ categories = [], onAdd, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviewUrl(ev.target.result);
      setForm((prev) => ({ ...prev, image: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalCategory = form.newCategory.trim() || form.category.trim();
    if (!form.name.trim() || !finalCategory || !form.price.trim()) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }
    onAdd({ ...form, name: form.name.trim(), category: finalCategory, price: form.price.trim() });
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${MODAL.overlayBg} px-4 py-8`}
      role="dialog"
      aria-modal="true"
      aria-label="Yeni Ürün Ekle"
    >
      <div className={`${MODAL.bgClass} w-full ${MODAL.maxWidthClass} ${MODAL.roundingClass} ${MODAL.shadowClass} flex flex-col max-h-[85vh]`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 shrink-0">
          <h2 className="text-base font-bold text-stone-900">Yeni Ürün Ekle</h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 transition-colors text-xl leading-none"
            aria-label="Kapat"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto">
          {/* Image picker */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 shrink-0 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="Önizleme" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl text-stone-300">📷</span>
              )}
            </div>
            <label className="cursor-pointer text-xs font-medium text-kraft-700 hover:text-kraft-900 transition-colors">
              Resim Seç
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>

          {/* Text fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1" htmlFor="add-name">
                Ürün Adı *
              </label>
              <input
                id="add-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="örn. Kraft Kargo Kutusu (M)"
                className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kraft-400 focus:border-kraft-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-2">
                Kategori *
              </label>
              
              {/* Mevcut Kategoriler (Chip Seçimi) */}
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, category: cat, newCategory: '' }))}
                      className={`px-2 py-1 text-[10px] font-semibold rounded-full border transition-colors ${
                        form.category === cat && !form.newCategory
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-white text-stone-600 border-stone-300 hover:border-stone-500'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Yeni Kategori Ekleme */}
              <input
                name="newCategory"
                type="text"
                value={form.newCategory}
                onChange={(e) => setForm((prev) => ({ ...prev, newCategory: e.target.value, category: '' }))}
                placeholder="Veya yeni kategori yazın..."
                className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kraft-400 focus:border-kraft-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1" htmlFor="add-price">
                Fiyat *
              </label>
              <input
                id="add-price"
                name="price"
                type="text"
                value={form.price}
                onChange={handleChange}
                placeholder="örn. ₺4,90"
                className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kraft-400 focus:border-kraft-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1" htmlFor="add-description">
                Kısa Açıklama
              </label>
              <textarea
                id="add-description"
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                placeholder={'Her satır ayrı bir madde olur\nÖrn: 40x30x30 cm\n10 adet/koli'}
                className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-kraft-400 focus:border-kraft-400 transition"
              />
              <p className="text-[10px] text-stone-400 mt-0.5">Her satır, kartında otomatik • madde işareti alır.</p>
            </div>
          </div>

          {error && <p className="text-red-600 text-xs">{error}</p>}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-stone-300 rounded-md text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-stone-900 text-white rounded-md text-sm font-semibold hover:bg-stone-700 transition"
            >
              Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
