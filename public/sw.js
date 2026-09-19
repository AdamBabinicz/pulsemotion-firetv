/**
 * PulseMotion TV — Service Worker (PWA & Offline Cache)
 * Optimized for Amazon Fire TV (Silk Browser) and Mobile Browsers.
 */

const CACHE_NAME = "pulsemotion-tv-v1";

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

// Instalacja Service Workera i precache podstawowych plików
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting()),
  );
});

// Aktywacja i czyszczenie starych wersji cache
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

  // Obsługujemy wyłącznie zapytania protokołów HTTP/HTTPS metodą GET
  if (request.method !== "GET" || !request.url.startsWith("http")) {
    return;
  }

  // 1. Zasoby MediaPipe oraz statyczne pliki (Cache First + dynamiczny zapis)
  // Gwarantuje działanie silnika wizji AI bez połączenia z Internetem
  if (request.url.includes("/mediapipe/") || request.url.includes("/assets/")) {
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

  // 2. Nawigacja HTML (Network First z fallbackiem do Cache)
  // Sprawia, że każda nowa wersja deployu na Netlify pojawia się od razu po odświeżeniu
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(request, responseClone));
          return networkResponse;
        })
        .catch(() => {
          return caches.match("/index.html") || caches.match("/");
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
        .catch(() => {
          /* cichy fallback */
        });

      return cachedResponse || fetchPromise;
    }),
  );
});
