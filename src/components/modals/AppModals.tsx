import { memo } from 'react';
import { AnimatePresence } from 'framer-motion';
import AddProductModal from './AddProductModal';
import BulkPriceUpdateModal from './BulkPriceUpdateModal';
import { 
  PinModal, 
  QRModal, 
  CouponModal, 
  LocationModal, 
  ContactModal,
  GlobalAddMenuModal
} from './UtilityModals';
import DisplaySettingsModal from './DisplaySettingsModal';
import PriceListModal from './PriceListModal';


import SocialExportModal from './SocialExportModal';

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
    discountError
  } = useStore();

  const { updateSetting } = useSettings(isAdmin);

  const {
    allProducts,
    categoryOrder,
    addProduct,
    uploadImage,
    executeGranularBulkActions,
    addCategory
  } = useProducts(searchQuery, [], isAdmin, settings);

  const {
    verifyPinWithServer,
    onPinSuccess,
    isLockedOut,
    failedAttempts,
    isInlineEnabled,
    toggleInlineEdit
  } = useAdminMode();


  const handleGlobalAddAction = (
    type: 'PRODUCT' | 'CATEGORY' | 'REFERENCE' | 'CAROUSEL',
  ) => {
    if (type === 'PRODUCT') {
      // Just switch the active modal
      useStore.getState().openModal('ADD_PRODUCT');
    } else if (type === 'CATEGORY') {
      const name = window.prompt('Yeni Kategori Adı:');
      if (name) addCategory(name);
    } else if (type === 'REFERENCE') {
      const name = window.prompt('Yeni Referans/İş Ortağı Adı:');
      if (name) {
        const currentRefs = settings?.referencesData || [];
        updateSetting('referencesData', [
          ...currentRefs,
          { id: Date.now(), name, logo: '' },
        ]);
      }
    } else if (type === 'CAROUSEL') {
      window.dispatchEvent(new CustomEvent('ekatalog:add-carousel-slide'));
    }
  };

  return (
    <>
      <QRModal
        isOpen={activeModal === 'QR'}
        onClose={closeModal}
      />

      <AnimatePresence>
        {isAdmin && (
          <>
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

            <BulkPriceUpdateModal
              isOpen={activeModal === 'BULK_UPDATE'}
              onClose={closeModal}
              allProducts={allProducts}
              categories={categoryOrder}
              onGranularUpdate={executeGranularBulkActions}
            />

            {settings && (
              <DisplaySettingsModal
                key={activeModal === 'DISPLAY_SETTINGS' ? 'active' : 'inactive'}
                isOpen={activeModal === 'DISPLAY_SETTINGS'}
                onClose={closeModal}
                settings={settings}
                updateSetting={updateSetting}
                isInlineEnabled={isInlineEnabled}
                onToggleInline={toggleInlineEdit}
              />
            )}

              <GlobalAddMenuModal
                isOpen={activeModal === 'GLOBAL_ADD_MENU'}
                onClose={closeModal}
                onAction={handleGlobalAddAction}
              />


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
      )}


      <LocationModal
        isOpen={activeModal === 'LOCATION'}
        onClose={closeModal}
        address={settings?.address || ''}
      />

      <ContactModal
        isOpen={activeModal === 'CONTACT'}
        onClose={closeModal}
        phone={settings?.whatsapp || ''}
        storeName={settings?.title || 'Katalog'}
      />

      <SocialExportModal
        isOpen={activeModal === 'SOCIAL_EXPORT'}
        onClose={closeModal}
        products={allProducts}
      />
    </>
  );
});

export default AppModals;
