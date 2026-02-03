/**
 * Service Worker - Mode hors-ligne complet
 * Professeur KEBE v3.0
 */

const CACHE_NAME = 'professeur-kebe-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/data/NS01001_v2_core.json',
  '/data/sommaire_gold.json',
];

// Installation - mise en cache des assets statiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Mise en cache des assets statiques');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activation - nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Stratégie de fetch : Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') return;

  // Ignorer les requêtes API externes (moteurs IA)
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Mettre en cache la réponse réussie
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback vers le cache si hors-ligne
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // Si c'est une navigation, retourner la page d'accueil
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Contenu non disponible hors ligne', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
      })
  );
});

// Message pour forcer la mise à jour
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
