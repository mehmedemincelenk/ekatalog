// FILE ROLE: Root Router & Global State Orchestrator
// DEPENDS ON: React, Pages, Store, Core Utils
// CONSUMED BY: main.tsx
import { useStore } from './store';
import { getActiveStoreSlug } from './utils/core';
import { useSaaSLifecycle } from './hooks/useSaaSLifecycle';

// PAGES
import LandingPage from './pages/LandingPage';
import CatalogPage from './pages/CatalogPage';

// COMPONENTS
import StatusOverlay from './components/ui/StatusOverlay';
import GlobalAdminLockModal from './components/modals/GlobalAdminLockModal';
import StorefrontClosedView from './components/layout/StorefrontClosedView';

/**
 * GLOBAL FEEDBACK OVERLAY (Connected)
 * -----------------------------------------------------------
 * Bütün uygulama boyunca gösterilen başarı/hata bildirim katmanı.
 */
function GlobalFeedbackOverlay() {
  const {
    feedbackStatus: status,
    feedbackMessage: message,
    hideFeedback,
  } = useStore();
  return (
    <StatusOverlay
      status={status as 'success' | 'error' | 'loading'}
      message={message}
      onClose={hideFeedback}
    />
  );
}

/**
 * APP ROOT (Diamond Router)
 * -----------------------------------------------------------
 * Uygulamanın ana giriş noktası.
 * Mağaza slug'ına göre Landing Page veya Catalog Page arasında geçiş yapar.
 */
export default function App() {
  const currentSlug = getActiveStoreSlug();
  const isAdmin = useStore((state) => state.isAdmin);
  const { isStorefrontClosed, isAdminLocked, daysLeft, isSubscriptionExpired } =
    useSaaSLifecycle();

  // Eğer ana site (Landing) isteniyorsa
  if (currentSlug === 'main-site' || currentSlug === 'landing') {
    return (
      <>
        <LandingPage />
        <GlobalFeedbackOverlay />
      </>
    );
  }

  // 1. Ziyaretçi Vitrini Kapalıysa (Hard Expiry)
  if (isStorefrontClosed) {
    return <StorefrontClosedView />;
  }

  // Aksi halde Katalog sayfasını yükle
  return (
    <>
      {/* 2. Admin Tolerans Süresindeyse Kilit Modalı Bas */}
      {isAdminLocked && isAdmin && (
        <GlobalAdminLockModal
          daysLeft={daysLeft}
          isSubscriptionExpired={isSubscriptionExpired}
        />
      )}
      <CatalogPage />
      <GlobalFeedbackOverlay />
    </>
  );
}
