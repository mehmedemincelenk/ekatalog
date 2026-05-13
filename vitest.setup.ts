import '@testing-library/jest-dom';
import { vi } from 'vitest';

/**
 * TEST LABORATUVARI KURULUMU (Vitest)
 * Bu dosya, testler çalışmadan önce sahte bir tarayıcı ortamı hazırlar.
 */

// Tarayıcıdaki bazı özellikleri (localStorage gibi) test ortamında taklit ediyoruz.
const localStorageMock = (function () {
  let store: Record<string, string> = {};
  return {
    getItem: function (key: string) {
      return store[key] || null;
    },
    setItem: function (key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem: function (key: string) {
      delete store[key];
    },
    clear: function () {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Kaydırma (scroll) fonksiyonlarını taklit ediyoruz.
window.scrollTo = vi.fn();

// ResizeObserver mock (Required for MarqueeText and other responsive components)
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
