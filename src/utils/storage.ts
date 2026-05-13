/**
 * SAFE STORAGE UTILITIES (DIAMOND ENGINE)
 * -----------------------------------------------------------
 * Centralized, error-aware wrapper for localStorage and sessionStorage.
 * Prevents application crashes due to full storage or browser restrictions.
 */

export const storage = {
  /**
   * get: Retrieves and parses data from localStorage.
   */
  get: <T>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (error) {
      console.warn(`Storage read error for key "${key}":`, error);
      return fallback;
    }
  },

  /**
   * set: Stringifies and saves data to localStorage.
   */
  set: (key: string, value: any): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Storage write error for key "${key}":`, error);
    }
  },

  /**
   * remove: Deletes a key from localStorage.
   */
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Storage delete error for key "${key}":`, error);
    }
  },

  /**
   * session: SessionStorage equivalent.
   */
  session: {
    get: <T>(key: string, fallback: T): T => {
      if (typeof window === 'undefined') return fallback;
      try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
      } catch {
        return fallback;
      }
    },
    set: (key: string, value: any): void => {
      if (typeof window === 'undefined') return;
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Session storage error:`, error);
      }
    }
  }
};
