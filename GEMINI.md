# ekatalog Diamond Standard & Project Guidelines

Bu dosya, projenin mimari standartlarını, tasarım dillerini ve geliştirme kurallarını içerir. Tüm geliştirmeler bu standartlara (Diamond Standard) uygun olmalıdır.

## 🏗️ Mimari Yapı (Component-Based)

Proje, atomik bir bileşen yapısını takip eder:
- `src/components/ui/`: Tekrar kullanılabilir, bağımsız UI parçaları (Button, Badge, Loading vb.).
- `src/components/modals/`: Tüm modal bileşenleri ve modal yönetim mantığı.
- `src/components/layout/`: Navbar, Footer, Kartlar, Gridler gibi yapısal bileşenler.
- `src/hooks/`: İş mantığını kapsayan özel hook'lar (useProductsHub, useSettingsHub vb.).
- `src/utils/`: Saf fonksiyonlar ve yardımcı araçlar (ai, price, storage vb.).

## 💎 Diamond Standard (Core Rules)

### 1. Lucide Namespace Standartı (LOCKED 🔒)
- **Kural:** Tüm Lucide ikonları namespace üzerinden kullanılmalıdır.
- **Kullanım:** `import * as Lucide from 'lucide-react'` -> `<Lucide.IconName />`.
- **Neden:** Vite/HMR süreçlerinde destructuring kaynaklı `ReferenceError` riskini sıfırlar.

### 2. Atomik Buton & Renk Birliği (LOCKED 🔒)
- **Kural:** Manuel renk sınıfları (`!bg-emerald-500` vb.) yerine `<Button>` varyantları kullanılmalıdır.
- **Varyantlar:**
  - `action`: Emerald-500 (Onay, Kaydet, Tamamla).
  - `danger`: Red-500 (Silme).
  - `instagram`: #FF0069.
  - `whatsapp`: #25D366.
  - `phone`: Blue-600 (Arama, Yol Tarifi).
  - `kraft`: #A67B5B (Konum, Toprak rengi).
  - `primary`: Stone-900 (Varsayılan).

### 3. Görsel Geri Bildirim (Zero Text Feedback) (LOCKED 🔒)
- **Kural:** "Başarıyla Eklendi" gibi metinler yerine `StatusOverlay` üzerinden animasyonlu ikonlar (Emerald Check, Red X) kullanılmalıdır.

### 4. Mobil İkon & Boyut Standartı (LOCKED 🔒)
- **Boyutlar:** Mobil'de `w-5 h-5` (20px), PC'de `sm:w-9 sm:h-9` (36px).
- **Merkezleme:** Yazısız ikonlar için `flex items-center justify-center` zorunludur.

### 5. Minimalist Modal UX
- **Header:** Başlık (title) veya alt başlık (subtitle) boşsa header alanı render edilmez. Ultra-minimalist görünüm için tercih edilir.
- **Konumlandırma:** `BaseModal` hem `center` hem de `bottom-right` (Lead Capture için) konumlandırmayı destekler.

### 6. Emerald "TAMAM" Standartı
- Ara adımlarda Siyah (`stone-900`) "DEVAM" butonu.
- Son onay adımında Yeşil (`emerald-500`) "TAMAM" metni ve parmak izi efekti (`showFingerprint={true}`).

## 🛠️ Teknik Ekosistem

- **Framework:** React 18 + Vite + TypeScript.
- **State:** Zustand (Global State) + TanStack Query (Server State).
- **Styling:** Tailwind CSS + Framer Motion (Animasyonlar).
- **Backend:** Supabase (Auth, DB, RLS).
- **Testing:** Vitest + React Testing Library (Snapshot testing zorunludur).

## 💡 Geliştirme Yaklaşımı (Vibe Coding)

- **Step by Step:** Değişiklikler küçük, test edilebilir adımlarla yapılmalıdır.
- **Architectural Integrity:** Sadece "çalışan" kod değil, mimariye uygun ve sürdürülebilir kod hedeflenir.
- **Zero TSC Errors:** Proje her zaman `tsc --noEmit` kontrolünden temiz geçmelidir.

---
*Bu rehber, projenin teknik mühürüdür.*
