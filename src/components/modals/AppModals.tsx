import { memo, lazy, Suspense, useState, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  PinModal,
  QRModal,
  CouponModal,
  LocationModal,
  ContactModal,
  GlobalAddMenuModal,
  QuickEditModal,
} from './UtilityModals';

const AddProductModal = lazy(() => import('./AddProductModal'));
const AdminOperationsModal = lazy(() => import('./AdminOperationsModal'));
const DisplaySettingsModal = lazy(() => import('./DisplaySettingsModal'));
const ChangePinModal = lazy(() => import('./ChangePinModal'));
const PriceListModal = lazy(() => import('./PriceListModal'));

const SocialExportModal = lazy(() => import('./SocialExportModal'));
const PortfoysLeadModal = lazy(() => import('./PortfoysLeadModal'));
const FeaturesModal = lazy(() => import('./FeaturesModal'));
const AddReferenceModal = lazy(() => import('./AddReferenceModal'));

import { useStore } from '../../store';
import { useProducts } from '../../hooks/useProductsHub';
import { useAdminMode } from '../../hooks/useAdminMode';
import { useSettings } from '../../hooks/useSettingsHub';
import { TECH } from '../../data/config';

/**
 * APP MODALS CONTAINER (DIAMOND EDITION)
 * -----------------------------------------------------------
 * Centralizes all global application modals to keep App.tsx clean.
 * Now fully data-driven via useStore (Zustand).
 */
const AppModals = memo(() => {
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddReferenceOpen, setIsAddReferenceOpen] = useState(false);
  const carouselFileInputRef = useRef<HTMLInputElement>(null);

  const {
    activeModal,
    modalData,
    closeModal,
    isAdmin,
    settings,
    searchQuery,
    activeDiscount,
    visitorCurrency,
    applyDiscountCode,
    discountError,
  } = useStore();

  const { updateSetting } = useSettings(isAdmin);

  const {
    allProducts,
    categoryOrder,
    addProduct,
    uploadImage,
    executeGranularBulkActions,
    addCategory,
  } = useProducts(searchQuery, [], isAdmin, settings);

  const {
    verifyPinWithServer,
    onPinSuccess,
    isLockedOut,
    failedAttempts,
    isInlineEnabled,
    toggleInlineEdit,
  } = useAdminMode();

  const handleCarouselUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const { adminPin, showFeedback } = useStore.getState();
    if (!adminPin) {
      showFeedback('error', 'Lütfen yetkilendirme için PIN kodunu girin.');
      return;
    }

    try {
      showFeedback('success', 'Afiş yükleniyor...');

      const { secureUploadVisualAsset } = await import('../../utils/image');
      const { getActiveStoreSlug } = await import('../../utils/core');
      const activeStoreSlug = getActiveStoreSlug();

      const filesToUpload = Array.from(files).slice(0, 10);
      const uploadedUrls = await Promise.all(
        filesToUpload.map(async (file, idx) => {
          return secureUploadVisualAsset({
            file,
            folder: TECH.storage.heroFolder,
            adminPin,
            slugBaseName: `hero-${activeStoreSlug}`,
            uniqueIdPrefix: `new-${idx}`,
            isDualQuality: false,
            maxDimension: TECH.storage.heroWidth,
          });
        })
      );

      const currentSlides = settings?.carouselData?.slides || [];
      const currentRealSlides = currentSlides.filter(
        (s: any) => s && s.src && s.src !== '',
      );
      const nextId =
        currentRealSlides.length > 0
          ? Math.max(...currentRealSlides.map((s: any) => s.id)) + 1
          : 1;

      const newSlides = uploadedUrls.map((url, idx) => ({
        id: nextId + idx,
        src: url,
        bg: 'bg-stone-200',
        label: 'Yeni Afiş',
        sub: 'Düzenlemek için tıklayın.',
      }));

      const updatedSlides = [...currentRealSlides, ...newSlides];

      await updateSetting('carouselData', { slides: updatedSlides });

      showFeedback('success', 'Afiş başarıyla eklendi.');

      window.dispatchEvent(new CustomEvent('ekatalog:refresh-carousel'));
    } catch (err) {
      console.error('Hero upload error:', err);
      showFeedback('error', 'Afiş yüklenemedi.');
    } finally {
      if (event.target) event.target.value = '';
    }
  };

  const handleGlobalAddAction = async (
    type: 'PRODUCT' | 'CATEGORY' | 'REFERENCE' | 'CAROUSEL',
  ) => {
    if (type === 'PRODUCT') {
      // Just switch the active modal
      useStore.getState().openModal('ADD_PRODUCT');
    } else if (type === 'CATEGORY') {
      setIsAddCategoryOpen(true);
    } else if (type === 'REFERENCE') {
      setIsAddReferenceOpen(true);
    } else if (type === 'CAROUSEL') {
      carouselFileInputRef.current?.click();
    }
  };

  return (
    <>
      <QRModal isOpen={activeModal === 'QR'} onClose={closeModal} />

      <AnimatePresence>
        {isAdmin && (
          <>
            <Suspense fallback={null}>
              <AddProductModal
                isModalOpen={activeModal === 'ADD_PRODUCT'}
                onModalClose={closeModal}
                onProductAddition={async (data, file) => {
                  const newId = await addProduct(data);
                  if (file && newId) {
                    try {
                      await uploadImage({ id: newId, file });
                    } catch (uploadError) {
                      console.error('Image upload failed but product was created:', uploadError);
                    }
                  }
                }}
                availableCategories={categoryOrder}
                initialCategory={(modalData as { category?: string })?.category}
                allProducts={allProducts}
              />
            </Suspense>

            <Suspense fallback={null}>
              <AdminOperationsModal
                isOpen={activeModal === 'ADMIN_OPERATIONS'}
                onClose={closeModal}
                allProducts={allProducts}
                categories={categoryOrder}
                onGranularUpdate={executeGranularBulkActions}
                onAddAction={handleGlobalAddAction}
              />
            </Suspense>

            {settings && (
              <Suspense fallback={null}>
                <DisplaySettingsModal
                  key={
                    activeModal === 'DISPLAY_SETTINGS' ? 'active' : 'inactive'
                  }
                  isOpen={activeModal === 'DISPLAY_SETTINGS'}
                  onClose={closeModal}
                  settings={settings}
                  updateSetting={updateSetting}
                  isInlineEnabled={isInlineEnabled}
                  onToggleInline={toggleInlineEdit}
                />
              </Suspense>
            )}

            <GlobalAddMenuModal
              isOpen={activeModal === 'GLOBAL_ADD_MENU'}
              onClose={closeModal}
              onAction={handleGlobalAddAction}
            />

            <Suspense fallback={null}>
              <PortfoysLeadModal
                isOpen={
                  activeModal === 'PORTFOYS_SEARCH' ||
                  activeModal === 'PORTFOYS_DIRECTORY'
                }
                onClose={closeModal}
                initialTab={
                  activeModal === 'PORTFOYS_DIRECTORY' ? 'directory' : 'search'
                }
              />
            </Suspense>

            <Suspense fallback={null}>
              <FeaturesModal
                isOpen={activeModal === 'FEATURES'}
                onClose={closeModal}
              />
            </Suspense>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeModal === 'PIN' && (
          <PinModal
            isModalOpen={true}
            onVerify={verifyPinWithServer}
            onAuthenticationSuccess={onPinSuccess}
            onModalClose={closeModal}
            isLockedOut={isLockedOut}
            failedAttempts={failedAttempts}
          />
        )}
        {activeModal === 'CHANGE_PIN' && (
          <Suspense fallback={null}>
            <ChangePinModal isOpen={true} onClose={closeModal} />
          </Suspense>
        )}
      </AnimatePresence>

      <CouponModal
        key={activeModal === 'COUPON' ? 'active' : 'inactive'}
        isOpen={activeModal === 'COUPON'}
        onClose={closeModal}
        onApplyDiscount={applyDiscountCode}
        activeDiscount={activeDiscount}
        discountError={discountError}
      />

      {settings && (
        <Suspense fallback={null}>
          <PriceListModal
            isOpen={activeModal === 'PRICE_LIST'}
            onClose={closeModal}
            products={allProducts}
            categories={categoryOrder}
            visitorCurrency={visitorCurrency}
            exchangeRates={settings.exchangeRates}
            activeDiscount={activeDiscount}
            storeName={settings.title || 'Katalog'}
          />
        </Suspense>
      )}

      <LocationModal
        isOpen={activeModal === 'LOCATION'}
        onClose={closeModal}
        address={settings?.address || ''}
      />

      <ContactModal
        isOpen={activeModal === 'CONTACT'}
        onClose={closeModal}
        phone={settings?.phoneCall || settings?.whatsapp || ''}
        whatsapp={settings?.whatsapp || ''}
        storeName={settings?.title || 'Katalog'}
      />

      <Suspense fallback={null}>
        <SocialExportModal
          isOpen={activeModal === 'SOCIAL_EXPORT'}
          onClose={closeModal}
          products={allProducts}
        />
      </Suspense>

      <QuickEditModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        title="YENİ KATEGORİ EKLE"
        placeholder="Kategori Adı girin"
        initialValue=""
        onSave={async (name) => {
          if (!name.trim()) return false;
          try {
            await addCategory(name.trim());
            useStore.getState().showFeedback('success', 'Kategori eklendi');
            return true;
          } catch (err: any) {
            useStore
              .getState()
              .showFeedback('error', err?.message || 'Kategori eklenemedi');
            return false;
          }
        }}
      />

      <Suspense fallback={null}>
        <AddReferenceModal
          isOpen={isAddReferenceOpen}
          onClose={() => setIsAddReferenceOpen(false)}
          onSave={async (name, file) => {
            const currentRefs = settings?.referencesData || [];
            const newId = Date.now();
            const showFeedback = useStore.getState().showFeedback;

            let logoUrl = '';
            if (file) {
              const { secureUploadVisualAsset } = await import('../../utils/image');
              const adminPin = useStore.getState().adminPin;

              if (!adminPin) {
                showFeedback('error', 'Lütfen yetkilendirme için PIN kodunu girin.');
                return false;
              }

              try {
                logoUrl = await secureUploadVisualAsset({
                  file,
                  folder: 'references',
                  adminPin,
                  oldUrl: '',
                  slugBaseName: `${settings?.name || 'reference'}_ref_${newId}`,
                  uniqueIdPrefix: 'ref',
                  isDualQuality: false,
                });
              } catch (uploadErr) {
                console.error('Logo upload failed:', uploadErr);
                showFeedback('error', 'Logo yüklenirken bir hata oluştu.');
                return false;
              }
            }

            try {
              await updateSetting('referencesData', [
                ...currentRefs,
                { id: newId, name, logo: logoUrl },
              ]);
              showFeedback('success', 'Referans eklendi');
              return true;
            } catch (err: any) {
              console.error(err);
              showFeedback('error', err?.message || 'Hata oluştu');
              return false;
            }
          }}
        />
      </Suspense>

      <input
        ref={carouselFileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        multiple
        onChange={handleCarouselUpload}
      />
    </>
  );
});

export default AppModals;
