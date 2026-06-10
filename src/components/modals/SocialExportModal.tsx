import { useRef } from 'react';
import BaseModal from './BaseModal';
import Button from '../ui/Button';
import * as Lucide from 'lucide-react';
import { Product } from '../../types';
import { useSocialExportFlow } from '../../hooks/useSocialExportFlow';

/**
 * PAZARLAMA MODALI (v11.0 - El Emeği Serisi)
 * -----------------------------------------------------------
 * Fabrika yok. Prosedürel üretim yok.
 * MarketingGallery içinden özgün tasarımlar kullanılır.
 * Sadece "EKATALOG".
 * Modern, Sade, Zeki.
 */

export default function SocialExportModal({
  isOpen,
  onClose,
  products = [],
}: {
  isOpen: boolean;
  onClose: () => void;
  products?: Product[];
}) {
  const designRef = useRef<HTMLDivElement>(null);

  const {
    storeName,
    storeUrl,
    isExporting,
    aspectRatio,
    activeProduct,
    CurrentDesign,
    handleNextDesign,
    handleProductChange,
    handleDownload,
  } = useSocialExportFlow(isOpen, products, designRef);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="İNDİR-PAYLAŞ"
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center justify-center gap-6 py-6 px-4">
        {/* TOP: PHONE MOCKUP (SCALED DOWN TO FIT) */}
        <div className="relative shrink-0">
          <div className="box-content w-[162px] h-[288px] rounded-[2rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] overflow-hidden border-[6px] border-stone-950 relative bg-stone-50">
            <div
              ref={designRef}
              className="w-[360px] h-[640px] scale-[0.45] absolute top-0 left-0 origin-top-left bg-white"
            >
              {activeProduct && (
                <CurrentDesign
                  product={activeProduct}
                  storeName={storeName}
                  storeUrl={storeUrl}
                  onProductClick={handleProductChange}
                  aspectRatio={aspectRatio}
                />
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM: ACTION ROW - HORIZONTAL BUTTONS */}
        <div className="flex flex-row gap-3 w-full justify-center max-w-[200px] shrink-0">
          <Button
            variant="primary"
            onClick={handleNextDesign}
            icon={
              <Lucide.RotateCw
                size={24}
                className={isExporting ? 'animate-spin' : ''}
              />
            }
            className="flex-1 h-16 !rounded-2xl !bg-stone-900 hover:!bg-black !text-white shadow-xl"
          />

          <Button
            variant="secondary"
            onClick={handleDownload}
            loading={isExporting}
            icon={<Lucide.Download size={24} />}
            className="flex-1 h-16 !rounded-2xl shadow-lg border-2 border-stone-200 !bg-white !text-stone-900"
          />
        </div>
      </div>
    </BaseModal>
  );
}
