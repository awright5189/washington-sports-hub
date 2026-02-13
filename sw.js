const CACHE_NAME = "dc-sports-v1";

const APP_SHELL = [
  "/washington-sports-hub/",
  "/washington-sports-hub/index.html",
  "/washington-sports-hub/manifest.json",
  "/washington-sports-hub/icon-192.png",
  "/washington-sports-hub/icon-512.png"
];

// Install: cache shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate: cleanup
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for shell
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Let the ESPN/Worker calls stay network-first
  if (url.hostname.includes("workers.dev") || url.hostname.includes("espn.com")) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
    return;
  }

  // Cache-first for the app itself
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
