/**
 * PulseMotion TV — Service Worker (PWA & Offline Cache)
 * Optimized for Amazon Fire TV (Silk Browser) and Mobile Browsers.
 */

const CACHE_NAME = "pulsemotion-tv-v2";

// Kluczowe zasoby startowe (App Shell)
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/site.webmanifest",
  "/favicon.svg",
  "/favicon-96x96.png",
  "/favicon.ico",
  "/apple-touch-icon.png",
  "/web-app-manifest-192x192.png",
  "/web-app-manifest-512x512.png",
  "/mediapipe/camera_utils/camera_utils.js",
  "/mediapipe/pose/pose.js",
];

// Natychmiastowa instalacja i przejęcie kontroli (skipWaiting)
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .catch((err) => {
        console.warn("Precache failed:", err);
      }),
  );
});

// Aktywacja i bezwzględne czyszczenie starej wersji cache v1
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Strategia obsługi żądań sieciowych
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Obsługujemy wyłącznie zapytania HTTP/HTTPS metodą GET
  if (request.method !== "GET" || !request.url.startsWith("http")) {
    return;
  }

  // 1. Ciężkie modele MediaPipe (Cache First dla oszczędności transferu i trybu offline)
  if (request.url.includes("/mediapipe/")) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        });
      }),
    );
    return;
  }

  // 2. Kod JavaScript / CSS aplikacji oraz nawigacja HTML (Network First)
  // Gwarantuje, że każda zmiana w kodzie aplikacji pojawia się natychmiast na Fire TV
  if (request.mode === "navigate" || request.url.includes("/assets/")) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback do pamięci podręcznej, jeśli Fire TV jest offline
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            if (request.mode === "navigate") {
              return caches.match("/index.html") || caches.match("/");
            }
          });
        }),
    );
    return;
  }

  // 3. Pozostałe zapytania (Stale-While-Revalidate)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {});

      return cachedResponse || fetchPromise;
    }),
  );
});
