import { useStore } from '../store';

export function useSaaSLifecycle() {
  const settings = useStore((state) => state.settings);

  if (!settings || !settings.created_at) {
    // If settings are not loaded yet, default to open
    return {
      isAdminLocked: false,
      isStorefrontClosed: false,
      daysLeft: 999,
      isPro: false,
      isSubscriptionExpired: false,
    };
  }

  const createdDate = new Date(settings.created_at);
  const now = new Date();

  const isProTier = settings.subscription_tier === 'pro';

  let isAdminLocked = false;
  let isStorefrontClosed = false;
  let daysLeft = 999;
  let isSubscriptionExpired = false;

  if (isProTier) {
    if (settings.subscription_expires_at) {
      const expiresDate = new Date(settings.subscription_expires_at);
      if (now > expiresDate) {
        // PRO expired
        isSubscriptionExpired = true;
        isAdminLocked = true;
        const diffTime = now.getTime() - expiresDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // 30 days grace period after subscription expires
        isStorefrontClosed = diffDays > 30;
        daysLeft = Math.max(0, 30 - diffDays);
      }
    }
  } else {
    // Free Trial Lifecycle: Trial 30 days, grace 30 days
    const diffTime = now.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    isAdminLocked = diffDays > 30;
    isStorefrontClosed = diffDays > 60;
    daysLeft = Math.max(0, 60 - diffDays);
  }

  return {
    isAdminLocked,
    isStorefrontClosed,
    daysLeft,
    isPro: isProTier && !isSubscriptionExpired,
    isSubscriptionExpired,
  };
}
