/* Phygital kiosk — offline service worker.
   Strategy:
     • HTML / CSS / JS + /api/projects → network-first: always shows the latest
       on reload when online, falls back to cache when offline. (No more stale
       UI after an edit.)
     • Images / fonts / other static → cache-first for instant, offline loads.
   Bump CACHE when you ship new assets to force a clean refresh. */
const CACHE = "phygital-kiosk-v15";
const SHELL = [
  "./assets/rda.js",
  "./",
  "./index.html",
  "./styles.css",
  "./intro.css",
  "./app.js",
  "./handfx.js",
  "./intro.js",
  "./manifest.webmanifest",
  "./assets/logos/phygital-wordmark.png",
  "./assets/logos/phygital-glyph.png",
  "./assets/logos/universe.png",
  "./assets/logos/livingtree.png",
  "./assets/logos/embassy.png",
  "./assets/logos/embassy-developments.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-180.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Code & data (HTML / CSS / JS / API) → NETWORK-FIRST so edits always show
  // on reload; fall back to the cached copy only when offline.
  const isCode =
    req.mode === "navigate" ||
    url.pathname.endsWith("/api/projects") ||
    /\.(html|css|js|webmanifest)$/.test(url.pathname);

  if (isCode) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok && url.origin === self.location.origin) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match("./index.html")))
    );
    return;
  }

  // Images / fonts / other static → cache-first for instant, offline loads.
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok && url.origin === self.location.origin) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
    )
  );
});
