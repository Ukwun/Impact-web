// Service Worker version - increment this on each deployment to bust cache
// This ensures all devices get the latest version after a deploy
// Update format: YYYYMMDD-HHmm (e.g., 20240319-1430)
const CACHE_VERSION = '20240319-1430'; // UPDATE THIS ON EACH DEPLOY
const CACHE_NAME = `impactapp-${CACHE_VERSION}`;
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
];

// Install Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching static assets');
      // Use add() instead of addAll() for better error handling
      const cachePromises = STATIC_ASSETS.map(url => {
        return cache.add(url).catch(err => {
          console.warn(`Service Worker: Failed to cache ${url}:`, err);
          // Don't fail the entire installation if one asset fails
          return Promise.resolve();
        });
      });
      return Promise.all(cachePromises);
    })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Optimized Caching Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { destination, method } = request;

  // Skip non-GET requests
  if (method !== 'GET') {
    return;
  }

  // Only cache http/https requests, skip other schemes (chrome-extension, etc)
  if (!request.url.startsWith('http://') && !request.url.startsWith('https://')) {
    return;
  }

  // NETWORK-FIRST for HTML pages (documents)
  // Always fetch latest page content, fall back to cache if offline
  if (destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fall back to cached version or offline page
          return caches.match(request).then((response) => {
            return response || caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // NETWORK-FIRST for API requests
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached response or offline page
          return caches.match(request).then((response) => {
            return response || caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // CACHE-FIRST for assets (JS, CSS, images, fonts)
  // These change infrequently and benefit from caching
  if (
    destination === 'style' ||
    destination === 'script' ||
    destination === 'image' ||
    destination === 'font' ||
    request.url.includes('/_next/static/')
  ) {
    event.respondWith(
      caches.match(request).then((response) => {
        return (
          response ||
          fetch(request).then((response) => {
            // Cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
        );
      })
    );
    return;
  }

  // DEFAULT: Cache-first for other requests
  event.respondWith(
    caches.match(request).then((response) => {
      return (
        response ||
        fetch(request)
          .then((response) => {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
            return response;
          })
          .catch(() => {
            // Return offline page if available
            return caches.match('/offline.html');
          })
      );
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Support for cache version checking
  if (event.data && event.data.type === 'CHECK_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION_RESPONSE',
      version: CACHE_VERSION,
      timestamp: new Date().toISOString()
    });
  }

  // Clear specific cache on request
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('Service Worker: Cache cleared on client request');
      event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
    });
  }
});
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
