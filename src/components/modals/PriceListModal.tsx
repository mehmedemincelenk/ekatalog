// FILE ROLE: Story-mode Price List Generator (Social Media Export)
// DEPENDS ON: Product Logic, html2canvas
// CONSUMED BY: FloatingGuestMenu.tsx
import { Product } from '../../types';
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
  
  const flow = usePriceListFlow(
    isOpen,
    products,
    categories,
    visitorCurrency,
    exchangeRates,
    activeDiscount,
    storeName,
    settings?.slug,
    initialStep
  );

  if (!isOpen) return null;

  const footer = (
    <div className="flex gap-3 w-full">
      {flow.step === 2 && (
        <Button
          variant="secondary"
          mode="rectangle"
          onClick={() => flow.setStep(1)}
          className="w-16 h-16 shrink-0"
        >
          <Lucide.ChevronLeft size={24} strokeWidth={4} />
        </Button>
      )}
      {flow.step === 1 ? (
        <Button
          variant="primary"
          size="md"
          disabled={flow.selectedCategories.length === 0}
          onClick={() => flow.setStep(2)}
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
            onClick={flow.downloadStories}
            loading={flow.isExporting}
            className="flex-1 h-16 shadow-lg !rounded-[24px]"
            mode="rectangle"
            showFingerprint={true}
          >
            SERİ KAYDET ({flow.storyPages.length} SAYFA)
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={flow.storyTheme === 'LIGHT' ? <Lucide.Moon size={18} /> : <Lucide.Sun size={18} />}
            onClick={() => flow.setStoryTheme(prev => prev === 'LIGHT' ? 'DARK' : 'LIGHT')}
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
      title={flow.step === 1 ? 'KATEGORİ SEÇ' : 'ÖNİZLEME'}
      maxWidth={flow.step === 1 ? 'max-w-xl' : 'max-w-sm'}
      footer={footer}
      progress={{ current: flow.step, total: 2 }}
      noPadding={flow.step === 2}
      isStatic={isStatic}
    >
      {flow.step === 1 ? (
        <div className="p-2">
          <div className="mb-6 flex items-center justify-between -mt-2">
            <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight leading-tight">
              KATEGORİ
            </h3>
            <Button
              onClick={flow.selectAllCategories}
              variant="secondary"
              mode="rectangle"
              size="sm"
              className="!flex !items-center !gap-1.5 !text-[9px] font-black !text-stone-900 hover:!text-stone-600 transition-colors !bg-stone-50 !px-4 !py-2 !rounded-xl whitespace-nowrap shrink-0 border border-stone-100 shadow-sm"
              showFingerprint={true}
              icon={
                flow.selectedCategories.length === flow.populatedCategories.length ? (
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
            {flow.populatedCategories.map((cat) => (
              <Button
                key={cat}
                onClick={() => flow.handleToggleCategory(cat)}
                variant={flow.selectedCategories.includes(cat) ? 'primary' : 'secondary'}
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
        <div className={`py-4 ${flow.storyTheme === 'DARK' ? 'bg-[#121212]' : 'bg-stone-50/30'}`}>
          <div
            ref={flow.storiesContainerRef}
            className="flex flex-col items-center gap-4 overflow-y-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {flow.storyPages.map((page, pageIdx) => (
              <div
                key={pageIdx}
                data-story-page="true"
                className={`w-[360px] h-[640px] relative flex flex-col items-center px-12 pt-12 pb-6 shrink-0 overflow-hidden ${flow.storyTheme === 'DARK' ? 'bg-[#1d1d1f] text-white' : 'bg-[#f8f8f8] text-[#1c1c1e]'}`}
                style={{ aspectRatio: '9/16' }}
              >
                {/* STORY HEADER */}
                <div className="w-full flex items-center justify-end mb-4 shrink-0 px-1 py-1">
                  <div className={`px-3 py-1.5 rounded-lg shadow-sm border ${flow.storyTheme === 'DARK' ? 'bg-stone-900/50 border-stone-800 text-white' : 'bg-stone-900 text-white border-stone-900'}`}>
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
                        className={`w-full h-[64px] rounded-xl border flex items-center px-3 transition-all ${flow.storyTheme === 'DARK' ? 'bg-stone-900/40 border-stone-800/50' : 'bg-stone-50/50 border-stone-100 shadow-sm'}`}
                      >
                        {/* Image Cell */}
                        <div className={`w-12 h-12 rounded-lg overflow-hidden border shadow-sm bg-white shrink-0 ${flow.storyTheme === 'DARK' ? 'border-stone-800' : 'border-white'}`}>
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
                              <h4 className={`text-[10px] font-black m-0 p-0 overflow-hidden whitespace-nowrap ${flow.storyTheme === 'DARK' ? 'text-white' : 'text-stone-900'}`} style={{ lineHeight: '1.2' }}>
                                 {product.name.toLocaleUpperCase('tr-TR')}
                              </h4>
                              <p className={`text-[8px] font-medium m-0 p-0 overflow-hidden whitespace-nowrap opacity-50 ${flow.storyTheme === 'DARK' ? 'text-stone-300' : 'text-stone-500'}`} style={{ lineHeight: '1.2', marginTop: '2px' }}>
                                 {(product.description || 'Standart Ürün').toLocaleUpperCase('tr-TR')}
                              </p>
                           </div>

                           <div className="shrink-0 text-right">
                              <span className={`text-[11px] font-black ${flow.storyTheme === 'DARK' ? 'text-white' : 'text-stone-900'}`} style={{ lineHeight: '1', whiteSpace: 'nowrap' }}>
                                 {flow.calculateFinalPrice(product)}
                              </span>
                           </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* STORY FOOTER */}
                <div className="mt-4 flex flex-col items-center gap-2 shrink-0">
                  <p className={`text-[8px] font-black lowercase tracking-[0.2em] opacity-40 ${flow.storyTheme === 'DARK' ? 'text-white' : 'text-stone-900'}`}>
                    {flow.storeUrl}
                  </p>
                  {settings?.logoUrl && (
                    <img
                      src={settings.logoUrl}
                      alt="watermark"
                      className={`w-10 h-10 object-contain rounded-lg opacity-40 ${flow.storyTheme === 'DARK' ? 'brightness-125' : ''}`}
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
