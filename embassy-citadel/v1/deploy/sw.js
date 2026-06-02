// Embassy Citadel — Service Worker
// Cache-first for all GET requests except map tiles (network-first, fallback to cache).
const CACHE = 'citadel-v16';
const ASSETS = [
  './', 'index.html',
  'intro.html', 'home.html', 'gallery.html', 'amenities.html',
  'masterplan.html', 'about.html', 'location.html', 'inventory.html',
  'inventory-floors.html', 'floor-plan.html', 'floor-units.html',
  'unit-detail.html', 'tools.html',
  'manifest.webmanifest',
  'assets/bg-paper.png',
  'assets/tower.png',
  'assets/tower-elevation.png',
  'assets/tower-hero.png',
  'assets/tower-ref-full-elevation.png',
  'assets/floor-units.svg',
  'assets/inventory.svg',
  'assets/photography/hero-tower-realistic.jpg',
  'assets/photography/hero-tower-dusk.jpg',
  'assets/photography/hero-tower-skyline-wide.jpg',
  'assets/photography/bridge-bwsl.jpg',
  'assets/photography/bridge-bwsl-square.jpg',
  'assets/photography/brochure-p-08.jpg',
  'assets/photography/brochure-p-09.jpg',
  'assets/photography/brochure-p-10.jpg',
  'assets/photography/brochure-p-11.jpg',
  'assets/photography/brochure-p-12.jpg',
  'assets/photography/brochure-p-13.jpg',
  'assets/photography/brochure-p-14.jpg',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/icon-512-maskable.png',
  'assets/favicon-32.png',
  'assets/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(ASSETS.map(a => c.add(a).catch(err => console.warn('[sw] skip', a, err.message)))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Cache-first for Google Fonts (stylesheet + font files). Once a font has
  // loaded it is served from cache forever — kills the font-swap flicker on
  // every screen and makes the suite fully offline-capable.
  if (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(r => {
          if (r && (r.status === 200 || r.type === 'opaque')) {
            const copy = r.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
          }
          return r;
        }).catch(() => cached);
      })
    );
    return;
  }

  // Network-first for map tiles (so the freshest tiles load when online, but
  // we fall back to whatever's cached when offline).
  if (
    url.hostname.includes('arcgisonline') ||
    url.hostname.includes('openstreetmap') ||
    url.hostname.includes('cartocdn') ||
    url.hostname.includes('tile.')
  ) {
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first for everything else (HTML, assets, fonts).
  // ignoreSearch: TRUE so that navigations carrying query strings
  // (home.html?from=intro, floor-units.html?floor=26, unit-detail.html?unit=…)
  // still match their cached base document offline. Without it, every
  // query-string navigation missed the cache and fell back to intro.html or a
  // blank screen on tablets — the cross-screen "blank on tablet" bug.
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(r => {
        // Only cache successful, basic/cors GET responses
        if (r && r.status === 200 && (r.type === 'basic' || r.type === 'cors')) {
          const copy = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        }
        return r;
      }).catch(() => {
        // Navigation fallback: return cached intro.html when offline + no match
        if (e.request.mode === 'navigate') {
          return caches.match('intro.html');
        }
      });
    })
  );
});
