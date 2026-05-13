// FILE ROLE: Root Router & Global State Orchestrator
// DEPENDS ON: React, Pages, Store, Core Utils
// CONSUMED BY: main.tsx
import { useStore } from './store';
import { getActiveStoreSlug } from './utils/core';

// PAGES
import LandingPage from './pages/LandingPage';
import CatalogPage from './pages/CatalogPage';

// COMPONENTS
import StatusOverlay from './components/ui/StatusOverlay';

/**
 * GLOBAL FEEDBACK OVERLAY (Connected)
 * -----------------------------------------------------------
 * Bütün uygulama boyunca gösterilen başarı/hata bildirim katmanı.
 */
function GlobalFeedbackOverlay() {
  const { feedbackStatus: status, feedbackMessage: message, hideFeedback } = useStore();
  return <StatusOverlay status={status as any} message={message} onClose={hideFeedback} />;
}

/**
 * APP ROOT (Diamond Router)
 * -----------------------------------------------------------
 * Uygulamanın ana giriş noktası. 
 * Mağaza slug'ına göre Landing Page veya Catalog Page arasında geçiş yapar.
 */
export default function App() {
  const currentSlug = getActiveStoreSlug();

  // Eğer ana site (Landing) isteniyorsa
  if (currentSlug === 'main-site' || currentSlug === 'landing') {
    return (
      <>
        <LandingPage />
        <GlobalFeedbackOverlay />
      </>
    );
  }

  // Aksi halde Katalog sayfasını yükle
  return (
    <>
      <CatalogPage />
      <GlobalFeedbackOverlay />
    </>
  );
}
