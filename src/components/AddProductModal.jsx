import { useState } from 'react';

const EMPTY = { name: '', category: '', price: '', description: '', image: null };

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
    if (!form.name.trim() || !form.category.trim() || !form.price.trim()) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }
    onAdd({ ...form, name: form.name.trim(), category: form.category.trim(), price: form.price.trim() });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Yeni Ürün Ekle"
    >
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Image picker */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-24 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden">
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
              <label className="block text-xs font-semibold text-stone-600 mb-1" htmlFor="add-category">
                Kategori *
              </label>
              <input
                id="add-category"
                name="category"
                type="text"
                list="existing-categories"
                value={form.category}
                onChange={handleChange}
                placeholder="Örn. Kargo Kutuları (Seç veya Yaz)"
                className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kraft-400 focus:border-kraft-400 transition"
              />
              <datalist id="existing-categories">
                {categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
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
