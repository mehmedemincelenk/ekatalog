import { useState, useEffect } from 'react';
import { CAROUSEL } from '../data/config';

const STORAGE_KEY = 'toptanambalaj_carousel_v1';

export function useCarousel() {
  const [slides, setSlides] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : CAROUSEL.slides;
    } catch {
      return CAROUSEL.slides;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slides));
  }, [slides]);

  const updateSlide = (id, changes) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...changes } : s))
    );
  };

  return { slides, updateSlide };
}
