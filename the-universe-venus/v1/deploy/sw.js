/* The Universe — PRODUCTION service worker.
 * Offline-first kiosk PWA. The "Download Experience" screen (app/pwa-download.js)
 * populates CACHE with every asset from asset-manifest.json and shows progress;
 * this SW then serves everything cache-first, so the suite runs fully offline,
 * fast, with no network glitches. Bump CACHE to invalidate after a deploy.
 */
const CACHE = 'universe-v7';
const SHELL = ['./', './index.html', './manifest.json', './asset-manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(SHELL).catch(() => {});  // best-effort shell precache
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Cache-first for same-origin GET. Navigations fall back to cached index.html
// when offline so the kiosk never shows a browser error page.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req) || await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
      return res;
    } catch (err) {
      if (req.mode === 'navigate') {
        const shell = await cache.match('./index.html') || await cache.match('./');
        if (shell) return shell;
      }
      throw err;
    }
  })());
});

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
