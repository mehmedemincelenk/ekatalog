import { useState, useEffect } from 'react';
import { getStorageKey, DEFAULT_CAROUSEL } from '../data/config';

export function useCarousel(slug = 'demo') {
  const storageKey = getStorageKey(slug) + '_carousel';

  const [slides, setSlides] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : DEFAULT_CAROUSEL.slides;
    } catch {
      return DEFAULT_CAROUSEL.slides;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(slides));
    } catch (err) {
      console.error('Carousel Storage Hatası:', err);
    }
  }, [slides, storageKey]);

  const updateSlide = (id, changes) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...changes } : s))
    );
  };

  return { slides, updateSlide };
}
