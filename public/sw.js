const CACHE_NAME = 'santa-eufemia-gallery-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const CDN_CACHE = 'cdn-images-v1';
const API_CACHE = 'api-cache-v1';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

// Max cache sizes to prevent storage abuse
const MAX_CACHE_SIZE = {
  [CDN_CACHE]: 500, // Max 500 images from CDN
  [DYNAMIC_CACHE]: 100, // Max 100 dynamic resources
  [API_CACHE]: 50, // Max 50 API responses
};

/**
 * Utility to enforce cache size limits
 */
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxSize) {
    const keysToDelete = keys.slice(0, keys.length - maxSize);
    for (const key of keysToDelete) {
      await cache.delete(key);
    }
    console.log(`Cache ${cacheName} trimmed to ${maxSize} items`);
  }
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch((error) => {
          console.warn('⚠️ Cache addAll error (continuing anyway):', error.message);
          // Don't fail install if some assets fail
          return Promise.resolve();
        });
      })
      .catch((error) => {
        console.error('❌ Static cache setup failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('⚡ Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Keep only current caches
            const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, CDN_CACHE, API_CACHE];
            if (!validCaches.includes(cacheName)) {
              console.log('🗑️  Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .catch((error) => {
        console.error('❌ Cache cleanup failed:', error);
      })
  );
  self.clients.claim();
});

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome extensions and other non-http(s) schemes
  if (!url.protocol.startsWith('http')) return;

  // Determine cache strategy based on request type
  
  // 1. CDN Images - cache first (they're immutable)
  if (url.hostname === 'cdn.xperia.pt' && request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request)
            .then((response) => {
              // Only cache successful responses
              if (!response || response.status !== 200) {
                return response;
              }
              
              const responseToCache = response.clone();
              caches.open(CDN_CACHE)
                .then((cache) => {
                  cache.put(request, responseToCache);
                  limitCacheSize(CDN_CACHE, MAX_CACHE_SIZE[CDN_CACHE]);
                })
                .catch((error) => {
                  console.warn('Failed to cache CDN image:', error.message);
                });
              
              return response;
            })
            .catch((error) => {
              console.warn('CDN fetch failed:', error.message);
              // Return cached version if available, even if stale
              return caches.match(request);
            });
        })
        .catch((error) => {
          console.error('Cache match failed:', error);
        })
    );
    return;
  }

  // 2. API Routes (functions) - network first, short cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(API_CACHE)
            .then((cache) => {
              cache.put(request, responseToCache);
              limitCacheSize(API_CACHE, MAX_CACHE_SIZE[API_CACHE]);
            })
            .catch((error) => {
              console.warn('Failed to cache API response:', error.message);
            });
          
          return response;
        })
        .catch((error) => {
          console.warn('API fetch failed, returning cached version:', error.message);
          return caches.match(request);
        })
    );
    return;
  }

  // 3. Everything else - network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }
        
        const responseToCache = response.clone();
        caches.open(DYNAMIC_CACHE)
          .then((cache) => {
            cache.put(request, responseToCache);
            limitCacheSize(DYNAMIC_CACHE, MAX_CACHE_SIZE[DYNAMIC_CACHE]);
          })
          .catch((error) => {
            console.warn('Failed to cache dynamic response:', error.message);
          });
        
        return response;
      })
      .catch((error) => {
        console.warn('Fetch failed for:', request.url, error.message);
        
        // Try to return cached version
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/') || new Response('Offline - page not available');
            }
            
            // Return a generic offline response
            return new Response('Offline - resource not available');
          })
          .catch((cacheError) => {
            console.error('Cache match also failed:', cacheError);
            return new Response('Offline - unable to load resource');
          });
      })
  );
});

// Message handler for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('🧹 Clearing all caches...');
    caches.keys().then((cacheNames) => {
      Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      ).then(() => {
        event.ports[0].postMessage({ success: true, message: 'All caches cleared' });
      });
    });
  }
  
  if (event.data && event.data.type === 'CACHE_STATS') {
    console.log('📊 Generating cache stats...');
    caches.keys().then((cacheNames) => {
      Promise.all(
        cacheNames.map(async (cacheName) => {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          return { name: cacheName, size: keys.length };
        })
      ).then((stats) => {
        event.ports[0].postMessage({ success: true, stats });
      });
    });
  }
});

console.log('✅ Service Worker loaded');
