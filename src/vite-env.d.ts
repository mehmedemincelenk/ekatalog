/// <reference types="vite/client" />
import 'react';

/**
 * VITE-ENV.D.TS (TEKNİK TERCÜMAN)
 * ------------------------------
 * Bir kurucu olarak bu dosya senin "Sistem Sözlüğündür".
 *
 * 1. Akıllı Tanım: Kod yazarken kullanılan özel yapıların (Örn: .env dosyasındaki değişkenler,
 *    resim dosyaları veya CSS modülleri) sistem tarafından "ne olduğunun" anlaşılmasını sağlar.
 * 2. Hata Önleyici: Eğer bu dosya olmazsa, TypeScript motoru "import.meta.env" gibi
 *    modern yapıları tanıyamaz ve her yerde kırmızı hata çizgileri çıkarır.
 * 3. Görünmez Kahraman: Bu dosya projenin çalışmasına doğrudan katılmaz, sadece geliştirme
 *    aşamasında kodun daha güvenli ve hatasız yazılmasını sağlar.
 */

interface Window {
  showQR?: () => void;
}

declare module 'react' {
  interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
    fetchpriority?: 'high' | 'low' | 'auto';
  }
}
