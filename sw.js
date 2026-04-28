// Service Worker per VED Final Book Generator
// Cache first strategy per funzionamento offline completo

const CACHE_NAME = 'ved-book-v1.0.0';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './assets/logo_ved.png',
  './assets/logo_tms.png',
  './assets/banner_filiali.png',
  './assets/timbro_ved.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/favicon-32.png',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// Installazione: pre-cache di tutte le risorse
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache aperta, pre-caching risorse');
        // addAll fallisce se una risorsa non è disponibile: usiamo Promise.allSettled
        return Promise.allSettled(
          URLS_TO_CACHE.map((url) =>
            cache.add(url).catch((err) => console.warn('[SW] Skip cache:', url, err))
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Attivazione: pulisco vecchie cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => {
          console.log('[SW] Rimozione vecchia cache:', key);
          return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first con fallback network
self.addEventListener('fetch', (event) => {
  // Ignoro richieste non GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        // Non cacho risposte non valide o opache (es. POST a API esterne)
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }

        // Clono perché una response può essere consumata solo una volta
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(() => {
        // Offline fallback: se è una richiesta HTML, mostra index.html
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
        return new Response('Offline - risorsa non disponibile', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      });
    })
  );
});

// Messaggi dal client (es. per skip waiting manuale)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
