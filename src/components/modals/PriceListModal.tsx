// FILE ROLE: Story-mode Price List Generator (Social Media Export)
// DEPENDS ON: Product Logic, html2canvas
// CONSUMED BY: FloatingGuestMenu.tsx
import { useState, useRef, useMemo, useEffect } from 'react';
import { Product } from '../../types';
import Button from '../ui/Button';
import BaseModal from './BaseModal';
import {
  transformCurrencyStringToNumber,
  formatNumberToCurrency,
} from '../../utils/core';
import { TECH } from '../../data/config';
import html2canvas from 'html2canvas';
import * as Lucide from 'lucide-react';

import { useStore } from '../../store';
import { PriceListModalProps } from '../../types';
import { resolveVisualAssetUrl } from '../../utils/image';

/**
 * PRICE LIST MODAL — HİKAYE MODU (Diamond Standard)
 * -----------------------------------------------------------
 * Ürünleri 9:16 Story formatında dışa aktarır.
 * Adım 1: Kategori seçimi
 * Adım 2: Önizleme & İndirme
 */
export default function PriceListModal({
  isOpen,
  onClose,
  products,
  categories,
  visitorCurrency,
  exchangeRates,
  activeDiscount,
  storeName,
  isStatic = false,
  initialStep,
}: PriceListModalProps) {
  const { settings } = useStore();
  // step: 1 = Kategori, 2 = Önizleme
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

  const storeUrl = settings?.slug
    ? `${settings.slug.toLowerCase()}.ekatalog.site`
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

  if (!isOpen) return null;

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
      // Bariyer 1: Fontların yüklenmesini bekle
      await document.fonts.ready;

      // Bariyer 2: Görsellerin yüklenmesini bekle
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

      // Bariyer 3: Render için kısa bir nefes al (layout settling)
      await new Promise(r => setTimeout(r, 100));

      const pages = storiesContainerRef.current.querySelectorAll('[data-story-page="true"]');
      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i] as HTMLElement, {
          scale: 2.5, // 3 yerine 2.5 daha stabil sonuç verebilir
          useCORS: true,
          backgroundColor: storyTheme === 'DARK' ? '#1d1d1f' : '#f9fafb',
          logging: false,
          scrollX: 0, scrollY: 0,
          windowWidth: 360, windowHeight: 640,
          onclone: (clonedDoc) => {
            // html2canvas için "Champ" seviyesi yazı düzeltmeleri
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

  const footer = (
    <div className="flex gap-3 w-full">
      {step === 2 && (
        <Button
          variant="secondary"
          mode="rectangle"
          onClick={() => setStep(1)}
          className="w-16 h-16 shrink-0"
        >
          <Lucide.ChevronLeft size={24} strokeWidth={4} />
        </Button>
      )}
      {step === 1 ? (
        <Button
          variant="primary"
          size="md"
          disabled={selectedCategories.length === 0}
          onClick={() => setStep(2)}
          className="flex-1 h-16 !rounded-[24px]"
          mode="rectangle"
          showFingerprint={true}
        >
          ÖNİZLEME
        </Button>
      ) : (
        <>
          <Button
            variant="primary"
            size="md"
            icon={<Lucide.Download size={18} />}
            onClick={downloadStories}
            loading={isExporting}
            className="flex-1 h-16 shadow-lg !rounded-[24px]"
            mode="rectangle"
            showFingerprint={true}
          >
            SERİ KAYDET ({storyPages.length} SAYFA)
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={storyTheme === 'LIGHT' ? <Lucide.Moon size={18} /> : <Lucide.Sun size={18} />}
            onClick={() => setStoryTheme(prev => prev === 'LIGHT' ? 'DARK' : 'LIGHT')}
            className="w-16 shrink-0 h-16 flex items-center justify-center p-0 !bg-stone-50 border-stone-100 shadow-sm"
            mode="rectangle"
          />
        </>
      )}
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 1 ? 'KATEGORİ SEÇ' : 'ÖNİZLEME'}
      maxWidth={step === 1 ? 'max-w-xl' : 'max-w-sm'}
      footer={footer}
      progress={{ current: step, total: 2 }}
      noPadding={step === 2}
      isStatic={isStatic}
    >
      {step === 1 ? (
        <div className="p-2">
          <div className="mb-6 flex items-center justify-between -mt-2">
            <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight leading-tight">
              KATEGORİ
            </h3>
            <Button
              onClick={selectAllCategories}
              variant="secondary"
              mode="rectangle"
              size="sm"
              className="!flex !items-center !gap-1.5 !text-[9px] font-black !text-stone-900 hover:!text-stone-600 transition-colors !bg-stone-50 !px-4 !py-2 !rounded-xl whitespace-nowrap shrink-0 border border-stone-100 shadow-sm"
              showFingerprint={true}
              icon={
                selectedCategories.length === populatedCategories.length ? (
                  <Lucide.CheckSquare size={14} />
                ) : (
                  <Lucide.Square size={14} />
                )
              }
            >
              TÜMÜNÜ SEÇ
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {populatedCategories.map((cat) => (
              <Button
                key={cat}
                onClick={() => handleToggleCategory(cat)}
                variant={selectedCategories.includes(cat) ? 'primary' : 'secondary'}
                mode="rectangle"
                size="sm"
                className="!text-[10px] !py-2 !px-4 !rounded-xl"
                showFingerprint={true}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className={`py-4 ${storyTheme === 'DARK' ? 'bg-[#121212]' : 'bg-stone-50/30'}`}>
          <div
            ref={storiesContainerRef}
            className="flex flex-col items-center gap-4 overflow-y-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {storyPages.map((page, pageIdx) => (
              <div
                key={pageIdx}
                data-story-page="true"
                className={`w-[360px] h-[640px] relative flex flex-col items-center px-12 pt-12 pb-6 shrink-0 overflow-hidden ${storyTheme === 'DARK' ? 'bg-[#1d1d1f] text-white' : 'bg-[#f8f8f8] text-[#1c1c1e]'}`}
                style={{ aspectRatio: '9/16' }}
              >
                {/* STORY HEADER */}
                <div className="w-full flex items-center justify-end mb-4 shrink-0 px-1 py-1">
                  <div className={`px-3 py-1.5 rounded-lg shadow-sm border ${storyTheme === 'DARK' ? 'bg-stone-900/50 border-stone-800 text-white' : 'bg-stone-900 text-white border-stone-900'}`}>
                    <h2 className="text-[9px] font-black uppercase tracking-tighter leading-none">
                      {page.category}
                    </h2>
                  </div>
                </div>

                {/* PRODUCTS */}
                <div className="w-full flex flex-col gap-2 overflow-hidden">
                  {page.products.map((product) => {
                    return (
                      <div
                        key={product.id}
                        className={`w-full h-[64px] rounded-xl border flex items-center px-3 transition-all ${storyTheme === 'DARK' ? 'bg-stone-900/40 border-stone-800/50' : 'bg-stone-50/50 border-stone-100 shadow-sm'}`}
                      >
                        {/* Image Cell */}
                        <div className={`w-12 h-12 rounded-lg overflow-hidden border shadow-sm bg-white shrink-0 ${storyTheme === 'DARK' ? 'border-stone-800' : 'border-white'}`}>
                          <img
                            src={resolveVisualAssetUrl(product.image_url) || ''}
                            alt={product.name}
                            loading="eager"
                            crossOrigin="anonymous"
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Text & Price Group (Independent Blocks for html2canvas stability) */}
                        <div className="flex-1 flex items-center justify-between min-w-0 pl-3 gap-2">
                           <div className="flex-1 min-w-0 story-text-container">
                              <h4 className={`text-[10px] font-black m-0 p-0 overflow-hidden whitespace-nowrap ${storyTheme === 'DARK' ? 'text-white' : 'text-stone-900'}`} style={{ lineHeight: '1.2' }}>
                                 {product.name.toLocaleUpperCase('tr-TR')}
                              </h4>
                              <p className={`text-[8px] font-medium m-0 p-0 overflow-hidden whitespace-nowrap opacity-50 ${storyTheme === 'DARK' ? 'text-stone-300' : 'text-stone-500'}`} style={{ lineHeight: '1.2', marginTop: '2px' }}>
                                 {(product.description || 'Standart Ürün').toLocaleUpperCase('tr-TR')}
                              </p>
                           </div>

                           <div className="shrink-0 text-right">
                              <span className={`text-[11px] font-black ${storyTheme === 'DARK' ? 'text-white' : 'text-stone-900'}`} style={{ lineHeight: '1', whiteSpace: 'nowrap' }}>
                                 {calculateFinalPrice(product)}
                              </span>
                           </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* STORY FOOTER */}
                <div className="mt-4 flex flex-col items-center gap-2 shrink-0">
                  <p className={`text-[8px] font-black lowercase tracking-[0.2em] opacity-40 ${storyTheme === 'DARK' ? 'text-white' : 'text-stone-900'}`}>
                    {storeUrl}
                  </p>
                  {settings?.logoUrl && (
                    <img
                      src={settings.logoUrl}
                      alt="watermark"
                      className={`w-10 h-10 object-contain rounded-lg opacity-40 ${storyTheme === 'DARK' ? 'brightness-125' : ''}`}
                      crossOrigin="anonymous"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </BaseModal>
  );
}
