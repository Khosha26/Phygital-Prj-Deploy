/* Highland Mayfields — offline-first service worker (PRODUCTION) */
const CACHE = 'hm-v5';

/* ---- CORE: cached on install, app is usable offline immediately ---- */
const CORE = [
  './',
  'index.html',
  'home.html',
  'manifest.json',
  'styles/brand.css',
  'assets/css/hm-tools.css',
  'screens/_kit.css',
  'screens/_kit.js',
  'screens/address.html',
  'screens/residences.html',
  'screens/pearl.html',
  'screens/inventory.html',
  'screens/landscape.html',
  'screens/masterplan.html',
  'screens/gallery.html',
  'screens/villas.html',
  'assets/js/hm-emi-sheet.js',
  'assets/js/hm-annotate.js',
  'data/project.json',
  'data/payment.json',
  'data/amenities.json',
  'data/landmarks.json',
  'data/gallery.json',
  'data/inventory.json',
  'assets/logo-crest.png',
  'assets/logo-lockup-light.png',
  'assets/logo-crest-gold.png',
  'assets/bg-lineart.png',
  'assets/hero-intro.webp',
  'assets/logo-animation.mp4',
  'assets/logo-poster.jpg',
  'assets/welcome.m4a',
  'assets/welcome.mp3',
  /* ---- today's new critical assets (villas 3D, inventory renders, sfx) ---- */
  'assets/screens/region-data.js',
  'assets/vendor/model-viewer.min.js',
  'assets/screens/villa/earth-villa.glb',
  'assets/screens/villa/sky-villa.glb',
  'assets/screens/villa/villa-select-regions.js',
  'assets/screens/villa/villa-select@1492.webp',
  'assets/screens/inv-site@2560.webp',
  'assets/screens/juice-towers@2560.webp',
  'assets/screens/tower-west.webp',
  'assets/screens/tower-east.webp',
  'assets/sfx/transition.mp3',
  'assets/sfx/tap.mp3',
  /* villa floor / sketch / render webps */
  'assets/screens/villa/earth-concept.webp',
  'assets/screens/villa/earth-floorplan.webp',
  'assets/screens/villa/earth-sketch.webp',
  'assets/screens/villa/sky-floor-1.webp',
  'assets/screens/villa/sky-floor-2.webp',
  'assets/screens/villa/sky-render@2560.webp',
  'assets/screens/villa/sky-sketch-1.webp',
  'assets/screens/villa/sky-sketch-2.webp',
  'assets/screens/villa/villas-tower.webp',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap',
  'https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400&display=swap'
];

/* ---- SECONDARY: heavy renders + videos, cached after load on message ---- */
const SECONDARY = [
  'assets/screens/branding-square.webp',
  'assets/screens/clubhouse.webp',
  'assets/screens/consultant.webp',
  'assets/screens/day-aerial.webp',
  'assets/screens/landscape-1.webp',
  'assets/screens/landscape-2.webp',
  'assets/screens/landscape-3.webp',
  'assets/screens/landscape-4.webp',
  'assets/screens/location-map.webp',
  'assets/screens/location-tour-poster.webp',
  'assets/screens/master-layout.webp',
  'assets/screens/mayfield-bird-night.webp',
  'assets/screens/mayfield-eye-1.webp',
  'assets/screens/mayfield-eye-2.webp',
  'assets/screens/night-aerial.webp',
  'assets/screens/norwood-night.webp',
  'assets/screens/norwood-top.webp',
  'assets/screens/pocketc-entry.webp',
  'assets/screens/tower-top.webp',
  'assets/screens/walkthrough-poster.webp',
  'assets/screens/floorplans/p-01.webp',
  'assets/screens/floorplans/p-02.webp',
  'assets/screens/floorplans/p-03.webp',
  'assets/screens/floorplans/p-04.webp',
  'assets/screens/floorplans/p-05.webp',
  'assets/screens/floorplans/p-06.webp',
  'assets/screens/floorplans/p-07.webp',
  'assets/screens/floorplans/p-08.webp',
  'assets/screens/floorplans/p-09.webp',
  'assets/screens/floorplans/p-10.webp',
  'assets/screens/floorplans/p-11.webp',
  'assets/screens/floorplans/p-12.webp',
  'assets/screens/floorplans/p-13.webp',
  'assets/screens/floorplans/p-14.webp',
  'assets/screens/floorplans/p-15.webp',
  'assets/screens/floorplans/p-16.webp',
  'assets/screens/floorplans/p-17.webp',
  'assets/screens/floorplans/p-18.webp',
  'assets/screens/floorplans/p-19.webp',
  'assets/screens/floorplans/p-20.webp',
  'assets/screens/floorplans/p-21.webp',
  'assets/screens/floorplans/p-22.webp',
  'assets/screens/floorplans/p-23.webp',
  'assets/screens/walkthrough.mp4',
  'assets/screens/location-tour.mp4'
];

/* ---- install: pre-cache CORE, tolerate individual misses ---- */
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(CORE.map(async (url) => {
      try {
        const res = await fetch(url, { cache: 'reload' });
        if (res && (res.ok || res.type === 'opaque')) await cache.put(url, res.clone());
      } catch (e) { /* ignore single-asset failure, never block install */ }
    }));
    self.skipWaiting();
  })());
});

/* ---- activate: drop old caches, take control ---- */
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => k === CACHE ? null : caches.delete(k)));
    await self.clients.claim();
  })());
});

/* ---- message: prefetch SECONDARY after first load, or precache an explicit list ---- */
self.addEventListener('message', (event) => {
  const data = event.data;
  if (data === 'PREFETCH_SECONDARY') {
    event.waitUntil((async () => {
      const cache = await caches.open(CACHE);
      await Promise.all(SECONDARY.map(async (url) => {
        try {
          if (await cache.match(url)) return;
          const res = await fetch(url, { cache: 'reload' });
          if (res && (res.ok || res.type === 'opaque')) await cache.put(url, res.clone());
        } catch (e) { /* ignore */ }
      }));
    })());
  }
});

/* ---- fetch: nav = network-first; assets = cache-first ---- */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Navigations: network-first, fall back to cache then app shell.
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        try {
          const cache = await caches.open(CACHE);
          cache.put(req, fresh.clone());
        } catch (e) { /* ignore put failures */ }
        return fresh;
      } catch (e) {
        const cached = await caches.match(req);
        return cached || (await caches.match('index.html')) || (await caches.match('./')) || Response.error();
      }
    })());
    return;
  }

  // Everything else: cache-first, then network (and opportunistically cache).
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      // Opportunistically cache same-origin + reachable cross-origin (fonts/tiles).
      try {
        if (res && (res.ok || res.type === 'opaque')) {
          const cache = await caches.open(CACHE);
          await cache.put(req, res.clone());
        }
      } catch (e) { /* ignore opaque / tile put failures */ }
      return res;
    } catch (e) {
      // Offline and not cached (e.g. a map tile): degrade gracefully.
      return cached || Response.error();
    }
  })());
});
