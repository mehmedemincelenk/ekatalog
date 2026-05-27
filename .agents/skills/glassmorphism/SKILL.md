---
name: glassmorphism
description: Apple Glassmorphism (Buzlu Cam Mükemmelliği) Tasarım ve Geliştirme Standartları
---

# 💎 Apple Glassmorphism (Buzlu Cam Mükemmelliği) Standartları

Bu döküman, **ekatalog** platformunda kullanılan tüm asılı (floating) menülerin, Navbar'ın ve cam kartların (glassmorphic cards) görsel kalitesini Apple standartlarına çıkarmak için uyulması gereken zorunlu tasarım kurallarını, formülleri ve performans pratiklerini içerir.

---

## 🔮 1. Temel Mimarisi (Core Formula)

Gerçekçi bir Apple buzlu cam efekti oluşturmak için aşağıdaki 4 bileşen **altın oranla** bir araya getirilmelidir:

```
┌────────────────────────────────────────────────────────┐
│  1. Translucency: bg-white/15 veya bg-white/20         │
│  2. Backdrop Blur: backdrop-blur-xl veya blur-[24px]   │
│  3. Light Edge (Rim): border border-white/35           │
│  4. Inset Reflection: shadow-[inset_0_1px_0_0_white]   │
└────────────────────────────────────────────────────────┘
```

### Altın Oran Değerleri:
1. **Opaklık (Translucency)**: Arka plandaki renklerin parlaması için beyaz katman asla `%30` opaklığı geçmemelidir. En ideal cam hissiyatı **`bg-white/20`** (`%20`) veya **`bg-white/15`** (`%15`) ile elde edilir.
2. **Buzlu Cam Bluru (Backdrop Blur)**: Arkadaki karmaşayı gidermek ve okunaklılığı garantilemek için en az **`backdrop-blur-xl`** (24px) veya **`backdrop-blur-2xl`** (40px) kullanılmalıdır.
3. **Işık Yansıması Kenarı (Reflective Edge)**: Kapsülü arka plandan şık bir şekilde ayırmak için hafif, yarı saydam bir beyaz sınır çizgisi (**`border border-white/30`**) şarttır.
4. **Tepeden Gelen Işık Vurgusu (Inset Highlight)**: Apple tasarımlarındaki en büyük sır, camın üst kenarına vuran ışığı simüle eden iç gölgedir (**`shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45)]`**).

---

## 🎨 2. Standart Tailwind Glass Sınıfları

Projedeki tüm glassmorphism geliştirmelerinde aşağıdaki sınıflar referans alınmalıdır:

### A. Light Theme Glass (Açık Cam)
```tailwind
bg-white/20 backdrop-blur-xl border border-white/35 shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.45),0_8px_32px_-6px_rgba(0,0,0,0.08)]
```
* **Kullanım Alanları**: Navbar kapsülü, Açık renkli modal kaplamaları, öncelikli buton varyantları.

### B. Dark Theme Glass (Koyu Cam)
```tailwind
bg-stone-900/75 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_6px_20px_-4px_rgba(0,0,0,0.15)]
```
* **Kullanım Alanları**: Asılı eylem butonları (Sipariş Ver, İletişim), Gece modu veya siyah zemin kaplamaları.

---

## 👁️ 3. Okunabilirlik ve WCAG Erişilebilirlik Kuralları

Glassmorphic katmanlar şeffaf olduğu için kontrast kaybı riski taşır. Bunu önlemek için:
- **Metin Kontrastı**: Açık renkli camların üzerinde mutlaka yüksek kontrastlı koyu metinler (**`text-stone-800`** veya **`text-stone-900`**) kullanılmalıdır.
- **Altlık Katman Kontrastı**: Camın arkasında aşırı hareketli veya parlak görseller olduğunda, cam katmanın opaklığı çok hafifçe artırılarak (`%25` veya `%30`) metinlerin kararlılığı korunur.
- **Minimalist Yaklaşım**: Cam katmanın içindeki yazı tipleri ince olmamalıdır. Kalın ve okunaklı yazı tipleri (`font-bold`, `font-black`) tercih edilmelidir.

---

## ⚡ 4. Mobil Performans ve Donanım Hızlandırma

Tarayıcıların `backdrop-filter` (arka plan süzgeci) filtresini hesaplaması GPU için maliyetlidir. Mobil cihazlarda kasma (jank) olmaması için şu kurallara dikkat edilmelidir:

1. **Donanım İvmesini Tetikle (Hardware Acceleration)**:
   Gerektiğinde CSS düzeyinde GPU'yu tetikleyecek transform sınıflarını uygulayın:
   ```css
   transform: translate3d(0, 0, 0);
   will-change: transform, backdrop-filter;
   ```
2. **Çift Filtre Çakışmasını Önleyin**:
   Üst üste binen birden fazla blurlu katman render edilmemelidir. Örneğin, Navbar'ın dış çerçevesi `bg-transparent` olmalı, sadece içindeki kapsül `backdrop-blur` uygulamalıdır.
3. **Eski Tarayıcı Desteği (Fallback)**:
   `backdrop-filter` desteklemeyen eski tarayıcılar için mutlaka `@supports` kuralları veya yedek opak renk sınıfları tanımlanmalıdır.

---
*Bu yetenek mühürü, ekatalog platformunun görsel zarafetini ve premium hissini geleceğe taşımak üzere oluşturulmuştur.*
