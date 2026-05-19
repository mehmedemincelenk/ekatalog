import { useState, useRef, useMemo, useEffect } from 'react';
import { Product } from '../types';
import { transformCurrencyStringToNumber, formatNumberToCurrency } from '../utils/core';
import { TECH } from '../data/config';
import html2canvas from 'html2canvas';

export function usePriceListFlow(
  isOpen: boolean,
  products: Product[],
  categories: string[],
  visitorCurrency: string,
  exchangeRates: Record<string, number> | null,
  activeDiscount: any,
  storeName: string,
  storeSlug?: string,
  initialStep?: number
) {
  const [step, setStep] = useState<1 | 2>((initialStep && initialStep >= 2 ? 2 : 1) as 1 | 2);
  const [storyTheme, setStoryTheme] = useState<'LIGHT' | 'DARK'>('LIGHT');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const storiesContainerRef = useRef<HTMLDivElement>(null);

  const groupedProducts = useMemo(() => {
    return products.reduce(
      (acc, product) => {
        const category = product.category || TECH.products.fallbackCategory;
        if (!acc[category]) acc[category] = [];
        acc[category].push(product);
        return acc;
      },
      {} as Record<string, Product[]>,
    );
  }, [products]);

  const storyPages = useMemo(() => {
    const pages: { category: string; products: Product[] }[] = [];
    selectedCategories.forEach(cat => {
      const catProducts = groupedProducts[cat] || [];
      for (let i = 0; i < catProducts.length; i += 6) {
        pages.push({ category: cat, products: catProducts.slice(i, i + 6) });
      }
    });
    return pages;
  }, [selectedCategories, groupedProducts]);

  const storeUrl = storeSlug
    ? `${storeSlug.toLowerCase()}.ekatalog.site`
    : storeName.toLowerCase().replace(/\s+/g, '') + '.ekatalog.site';

  const populatedCategories = useMemo(() => {
    return categories.filter((cat) => (groupedProducts[cat] || []).length > 0);
  }, [categories, groupedProducts]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedCategories([]);
      setIsExporting(false);
    }
  }, [isOpen]);

  const handleToggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const selectAllCategories = () => {
    if (selectedCategories.length === populatedCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories([...populatedCategories]);
    }
  };

  const calculateFinalPrice = (product: Product) => {
    const isPromotionActive =
      activeDiscount &&
      (!activeDiscount.category || activeDiscount.category === product.category);
    const baseMathPrice = transformCurrencyStringToNumber(product.price);
    if (isPromotionActive && baseMathPrice > 0) {
      return formatNumberToCurrency(baseMathPrice * (1 - activeDiscount.rate), visitorCurrency, exchangeRates);
    }
    return formatNumberToCurrency(baseMathPrice, visitorCurrency, exchangeRates);
  };

  const downloadStories = async () => {
    if (!storiesContainerRef.current) return;
    setIsExporting(true);

    try {
      await document.fonts.ready;
      const allImages = storiesContainerRef.current.querySelectorAll('img');
      await Promise.all(
        Array.from(allImages).map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) return resolve();
              img.onload = () => resolve();
              img.onerror = () => resolve();
            })
        )
      );

      await new Promise(r => setTimeout(r, 100));

      const pages = storiesContainerRef.current.querySelectorAll('[data-story-page="true"]');
      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i] as HTMLElement, {
          scale: 2.5,
          useCORS: true,
          backgroundColor: storyTheme === 'DARK' ? '#1d1d1f' : '#f9fafb',
          logging: false,
          scrollX: 0, scrollY: 0,
          windowWidth: 360, windowHeight: 640,
          onclone: (clonedDoc) => {
            clonedDoc.querySelectorAll('.story-text-container').forEach((el) => {
              (el as HTMLElement).style.paddingTop = '10px';
              (el as HTMLElement).style.letterSpacing = '0px';
              (el as any).style.webkitFontSmoothing = 'antialiased';
            });
          }
        });
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.download = `${storeName.replace(/\s+/g, '_')}_Story_${i + 1}.jpg`;
        link.click();
        await new Promise((r) => setTimeout(r, 300));
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    step,
    setStep,
    storyTheme,
    setStoryTheme,
    selectedCategories,
    isExporting,
    storiesContainerRef,
    storyPages,
    populatedCategories,
    storeUrl,
    handleToggleCategory,
    selectAllCategories,
    calculateFinalPrice,
    downloadStories
  };
}
