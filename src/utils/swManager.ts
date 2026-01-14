/**
 * Service Worker Management Utility
 * Provides helper functions to interact with the service worker
 */

export const swManager = {
  /**
   * Check if service worker is supported
   */
  isSupported(): boolean {
    return 'serviceWorker' in navigator;
  },

  /**
   * Register the service worker
   */
  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) {
      console.warn('Service Workers not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      console.log('✅ Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return null;
    }
  },

  /**
   * Unregister the service worker
   */
  async unregister(): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      const registration = await navigator.serviceWorker.getRegistration('/');
      if (registration) {
        await registration.unregister();
        console.log('✅ Service Worker unregistered');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Service Worker unregistration failed:', error);
      return false;
    }
  },

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<
    { name: string; size: number }[] | null
  > {
    if (!this.isSupported()) return null;

    try {
      const registration = await navigator.serviceWorker.getRegistration('/');
      if (!registration || !registration.active) {
        console.warn('Service Worker not active');
        return null;
      }

      return new Promise((resolve) => {
        const channel = new MessageChannel();
        
        channel.port1.onmessage = (event) => {
          if (event.data.success) {
            resolve(event.data.stats);
          } else {
            resolve(null);
          }
        };

        const active = registration.active;
        if (active) {
          active.postMessage(
            { type: 'CACHE_STATS' },
            [channel.port2]
          );

          // Timeout after 5 seconds
          setTimeout(() => resolve(null), 5000);
        }
      });
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return null;
    }
  },

  /**
   * Clear all caches
   */
  async clearAllCaches(): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      const registration = await navigator.serviceWorker.getRegistration('/');
      if (!registration || !registration.active) {
        console.warn('Service Worker not active');
        return false;
      }

      return new Promise((resolve) => {
        const channel = new MessageChannel();
        
        channel.port1.onmessage = (event) => {
          if (event.data.success) {
            console.log('✅ All caches cleared');
            resolve(true);
          } else {
            resolve(false);
          }
        };

        const active = registration.active;
        if (active) {
          active.postMessage(
            { type: 'CLEAR_CACHE' },
            [channel.port2]
          );

          // Timeout after 10 seconds
          setTimeout(() => resolve(false), 10000);
        }
      });
    } catch (error) {
      console.error('Failed to clear caches:', error);
      return false;
    }
  },

  /**
   * Check if the app is running in offline mode
   */
  isOnline(): boolean {
    return navigator.onLine;
  },

  /**
   * Listen for online/offline events
   */
  onOnlineStatusChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  },

  /**
   * Skip waiting and activate new service worker version
   */
  async skipWaiting(): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      const registration = await navigator.serviceWorker.getRegistration('/');
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        console.log('✅ Requesting Service Worker skip waiting');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to skip waiting:', error);
      return false;
    }
  },
};

export default swManager;
