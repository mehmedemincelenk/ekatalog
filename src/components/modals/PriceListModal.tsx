// FILE ROLE: Story-mode Price List Generator (Social Media Export)
// DEPENDS ON: Product Logic, html2canvas
// CONSUMED BY: FloatingGuestMenu.tsx

import Button from '../ui/Button';
import BaseModal from './BaseModal';
import * as Lucide from 'lucide-react';
import { useStore } from '../../store';
import { PriceListModalProps } from '../../types';
import { resolveVisualAssetUrl } from '../../utils/image';
import { usePriceListFlow } from '../../hooks/usePriceListFlow';

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

  const {
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
    downloadStories,
  } = usePriceListFlow(
    isOpen,
    products,
    categories,
    visitorCurrency,
    exchangeRates,
    activeDiscount,
    storeName,
    settings?.slug,
    initialStep,
  );

  if (!isOpen) return null;

  const footer = (
    <div className="flex gap-3 w-full">
      {step === 2 && (
        <Button
          variant="secondary"
          mode="rectangle"
          onClick={() => setStep(1)}
          className="w-12 h-12 shrink-0 flex items-center justify-center p-0 !rounded-2xl"
        >
          <Lucide.ChevronLeft size={20} strokeWidth={4} />
        </Button>
      )}
      {step === 1 ? (
        <Button
          variant="primary"
          size="md"
          disabled={selectedCategories.length === 0}
          onClick={() => setStep(2)}
          className="flex-1 h-12 !rounded-2xl text-xs font-black tracking-wider"
          mode="rectangle"
        >
          ÖNİZLEME
        </Button>
      ) : (
        <>
          <Button
            variant="primary"
            size="md"
            icon={<Lucide.Download size={16} />}
            onClick={downloadStories}
            loading={isExporting}
            className="flex-1 h-12 shadow-lg !rounded-2xl text-xs font-black tracking-wider"
            mode="rectangle"
          >
            SERİ KAYDET ({storyPages.length} SAYFA)
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={
              storyTheme === 'LIGHT' ? (
                <Lucide.Moon size={16} />
              ) : (
                <Lucide.Sun size={16} />
              )
            }
            onClick={() =>
              setStoryTheme((prev) => (prev === 'LIGHT' ? 'DARK' : 'LIGHT'))
            }
            className="w-12 shrink-0 h-12 flex items-center justify-center p-0 !bg-stone-50 border-stone-100 shadow-sm !rounded-2xl"
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
      title={step === 1 ? 'KATEGORİ SEÇİMİ' : 'ÖNİZLEME'}
      subtitle={
        step === 1
          ? 'SEÇMEK İSTEDİĞİNİZ KATEGORİLERİN ÜZERİNE TIKLAYINIZ'
          : undefined
      }
      maxWidth={step === 1 ? 'max-w-xl' : 'max-w-sm'}
      footer={footer}
      progress={{ current: step, total: 2 }}
      noPadding={step === 2}
      isStatic={isStatic}
    >
      {step === 1 ? (
        <div className="p-2">
          <div className="mb-4 flex justify-end -mt-2">
            <Button
              onClick={selectAllCategories}
              variant="secondary"
              mode="rectangle"
              size="sm"
              className="!flex !items-center !gap-1.5 !text-[9px] font-black !text-stone-900 hover:!text-stone-600 transition-colors !bg-stone-50 !px-4 !py-2 !rounded-xl whitespace-nowrap shrink-0 border border-stone-100 shadow-sm"
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
                variant={
                  selectedCategories.includes(cat) ? 'primary' : 'secondary'
                }
                mode="rectangle"
                size="sm"
                className="!text-[10px] !py-2 !px-4 !rounded-xl"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div
          className={`py-4 ${storyTheme === 'DARK' ? 'bg-[#121212]' : 'bg-stone-50/30'}`}
        >
          <div
            ref={storiesContainerRef}
            className="flex flex-col items-center gap-4 overflow-y-auto max-h-[60vh]"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {storyPages.map((page, pageIdx) => (
              <div
                key={pageIdx}
                className="w-[252px] h-[448px] relative shrink-0 overflow-hidden rounded-2xl border border-stone-200/50 shadow-md bg-stone-100"
              >
                <div
                  data-story-page="true"
                  className={`w-[360px] h-[640px] absolute top-0 left-0 origin-top-left scale-[0.7] flex flex-col items-center px-10 pt-10 pb-6 shrink-0 overflow-hidden ${storyTheme === 'DARK' ? 'bg-[#1d1d1f] text-white' : 'bg-[#f8f8f8] text-[#1c1c1e]'}`}
                  style={{ aspectRatio: '9/16' }}
                >
                  {/* STORY HEADER */}
                  <div className="w-full flex items-center justify-end mb-4 shrink-0 px-1 py-1">
                    <div
                      className={`px-3 py-1.5 rounded-lg shadow-sm border ${storyTheme === 'DARK' ? 'bg-stone-900/50 border-stone-800 text-white' : 'bg-stone-900 text-white border-stone-900'}`}
                    >
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
                          className={`w-full h-[58px] rounded-xl border flex items-center px-3 transition-all ${storyTheme === 'DARK' ? 'bg-stone-900/40 border-stone-800/50' : 'bg-stone-50/50 border-stone-100 shadow-sm'}`}
                        >
                          {/* Image Cell */}
                          <div
                            className={`w-10 h-10 rounded-lg overflow-hidden border shadow-sm bg-white shrink-0 ${storyTheme === 'DARK' ? 'border-stone-800' : 'border-white'}`}
                          >
                            <img
                              src={
                                resolveVisualAssetUrl(product.image_url) || ''
                              }
                              alt={product.name}
                              loading="eager"
                              crossOrigin="anonymous"
                              className="w-full h-full object-contain"
                            />
                          </div>

                          {/* Text & Price Group (Independent Blocks for html2canvas stability) */}
                          <div className="flex-1 flex items-center justify-between min-w-0 pl-3 gap-2">
                            <div className="flex-1 min-w-0 story-text-container">
                              <h4
                                className={`text-[9.5px] font-black m-0 p-0 overflow-hidden whitespace-nowrap ${storyTheme === 'DARK' ? 'text-white' : 'text-stone-900'}`}
                                style={{ lineHeight: '1.2' }}
                              >
                                {product.name.toLocaleUpperCase('tr-TR')}
                              </h4>
                              <p
                                className={`text-[7.5px] font-medium m-0 p-0 overflow-hidden whitespace-nowrap opacity-50 ${storyTheme === 'DARK' ? 'text-stone-300' : 'text-stone-500'}`}
                                style={{ lineHeight: '1.2', marginTop: '2px' }}
                              >
                                {(
                                  product.description || 'Standart Ürün'
                                ).toLocaleUpperCase('tr-TR')}
                              </p>
                            </div>

                            <div className="shrink-0 text-right">
                              <span
                                className={`text-[10px] font-black ${storyTheme === 'DARK' ? 'text-white' : 'text-stone-900'}`}
                                style={{
                                  lineHeight: '1',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {calculateFinalPrice(product)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* STORY FOOTER */}
                  <div className="mt-auto mb-2 flex flex-col items-center gap-2 shrink-0">
                    <p
                      className={`text-[7px] font-black lowercase tracking-[0.15em] opacity-40 ${storyTheme === 'DARK' ? 'text-white' : 'text-stone-900'}`}
                    >
                      {storeUrl}
                    </p>
                    {settings?.logoUrl && (
                      <img
                        src={settings.logoUrl}
                        alt="watermark"
                        className={`w-8 h-8 object-contain rounded-[4px] opacity-40 ${storyTheme === 'DARK' ? 'brightness-125' : ''}`}
                        crossOrigin="anonymous"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </BaseModal>
  );
}
