import { useMemo } from 'react';

export function useTenant() {
  return useMemo(() => {
    // SSR safe check
    if (typeof window === 'undefined') {
      return { slug: 'demo', isGhostMode: true, hostname: 'localhost' };
    }

    const urlParams = new URLSearchParams(window.location.search);
    const tenantParam = urlParams.get('tenant');
    const hostname = window.location.hostname;

    let resolvedSlug = 'demo';
    let isGhostMode = true;

    if (tenantParam) {
      resolvedSlug = tenantParam;
      isGhostMode = false;
    } else {
      // Subdomain kontrolü (örn: slug.ekatalog.co)
      const parts = hostname.split('.');
      // localhost'ta subdomain testi için (slug.localhost)
      const isLocalhostSubdomain = parts.length >= 2 && parts[1] === 'localhost';
      const isProdSubdomain = parts.length >= 3 && parts[0] !== 'www';

      if (isLocalhostSubdomain || isProdSubdomain) {
        resolvedSlug = parts[0];
        isGhostMode = false;
      }
    }

    return {
      slug: resolvedSlug,
      isGhostMode,
      hostname
    };
  }, []);
}
