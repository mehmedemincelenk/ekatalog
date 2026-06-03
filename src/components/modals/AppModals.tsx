import { memo, lazy, Suspense } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  PinModal,
  QRModal,
  CouponModal,
  LocationModal,
  ContactModal,
  GlobalAddMenuModal,
} from './UtilityModals';

const AddProductModal = lazy(() => import('./AddProductModal'));
const BulkPriceUpdateModal = lazy(() => import('./BulkPriceUpdateModal'));
const DisplaySettingsModal = lazy(() => import('./DisplaySettingsModal'));
const ChangePinModal = lazy(() => import('./ChangePinModal'));
const PriceListModal = lazy(() => import('./PriceListModal'));

const SocialExportModal = lazy(() => import('./SocialExportModal'));
const PortfoysLeadModal = lazy(() => import('./PortfoysLeadModal'));
const FeaturesModal = lazy(() => import('./FeaturesModal'));

import { useStore } from '../../store';
import { useProducts } from '../../hooks/useProductsHub';
import { useAdminMode } from '../../hooks/useAdminMode';
import { useSettings } from '../../hooks/useSettingsHub';

/**
 * APP MODALS CONTAINER (DIAMOND EDITION)
 * -----------------------------------------------------------
 * Centralizes all global application modals to keep App.tsx clean.
 * Now fully data-driven via useStore (Zustand).
 */
const AppModals = memo(() => {
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

  const handleGlobalAddAction = async (
    type: 'PRODUCT' | 'CATEGORY' | 'REFERENCE' | 'CAROUSEL',
  ) => {
    if (type === 'PRODUCT') {
      // Just switch the active modal
      useStore.getState().openModal('ADD_PRODUCT');
    } else if (type === 'CATEGORY') {
      const name = window.prompt('Yeni Kategori Adı:');
      if (name) {
        try {
          await addCategory(name);
          useStore.getState().showFeedback('success', 'Kategori eklendi');
        } catch (err: any) {
          useStore.getState().showFeedback('error', err?.message || 'Kategori eklenemedi');
        }
      }
    } else if (type === 'REFERENCE') {
      const name = window.prompt('Yeni Referans/İş Ortağı Adı:');
      if (name) {
        const currentRefs = settings?.referencesData || [];
        try {
          await updateSetting('referencesData', [
            ...currentRefs,
            { id: Date.now(), name: name.trim(), logo: '' },
          ]);
          useStore.getState().showFeedback('success', 'Referans eklendi');
        } catch (err: any) {
          console.error(err);
          useStore.getState().showFeedback('error', err?.message || 'Hata oluştu');
        }
      }
    } else if (type === 'CAROUSEL') {
      window.dispatchEvent(new CustomEvent('ekatalog:add-carousel-slide'));
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
                    await uploadImage({ id: newId, file });
                  }
                }}
                availableCategories={categoryOrder}
                initialCategory={(modalData as { category?: string })?.category}
              />
            </Suspense>

            <Suspense fallback={null}>
              <BulkPriceUpdateModal
                isOpen={activeModal === 'BULK_UPDATE'}
                onClose={closeModal}
                allProducts={allProducts}
                categories={categoryOrder}
                onGranularUpdate={executeGranularBulkActions}
              />
            </Suspense>

            {settings && (
              <Suspense fallback={null}>
                <DisplaySettingsModal
                  key={activeModal === 'DISPLAY_SETTINGS' ? 'active' : 'inactive'}
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
                isOpen={activeModal === 'PORTFOYS_SEARCH' || activeModal === 'PORTFOYS_DIRECTORY'}
                onClose={closeModal}
                initialTab={activeModal === 'PORTFOYS_DIRECTORY' ? 'directory' : 'search'}
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
            <ChangePinModal
              isOpen={true}
              onClose={closeModal}
            />
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
    </>
  );
});

export default AppModals;
