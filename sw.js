const CACHE = "dc-sports-v3";

const SHELL = [
  "/washington-sports-hub/",
  "/washington-sports-hub/index.html",
  "/washington-sports-hub/manifest.json",
  "/washington-sports-hub/icon-192.png",
  "/washington-sports-hub/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Network-first for worker/API calls
  if (url.hostname.endsWith("workers.dev") || url.hostname.includes("espn.com")) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  // Cache-first for app shell
  e.respondWith(caches.match(e.request).then(c => c || fetch(e.request)));
});
