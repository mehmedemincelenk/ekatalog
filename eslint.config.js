import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

/**
 * ESLINT YAPILANDIRMASI
 * Bu dosya, projedeki kod yazım kalitesini denetleyen kurallar listesidir.
 */
export default tseslint.config(
  // Bazı klasörleri denetim dışı bırakıyoruz (Örn: Hazır build klasörü)
  { ignores: ['dist'] },
  {
    // Hangi dosyalar denetlenecek ve hangi kurallar geçerli olacak?
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // React Hooks kurallarını (useEffect, useState vb.) zorunlu kılıyoruz.
      ...reactHooks.configs.recommended.rules,

      // Hızlı yenileme (HMR) sırasında bileşenlerin doğru dışa aktarıldığından emin oluyoruz.
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // PROJE ÖZELİ: 'any' tip kullanımını yasaklıyoruz (Kural 2).
      '@typescript-eslint/no-explicit-any': 'error',

      // Kullanılmayan değişkenler varsa bizi uyarır.
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
);
