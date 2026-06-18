/* Living Tree — service worker (offline-capable PWA, smooth two-tier cache) */
const CACHE = 'livingtree-v32';
const V = '32';

/* CORE = absolute minimum to render the intro + home screen. Precached on install. */
const CORE = [
  './',
  './index.html',
  './Living%20Tree%20-%20Master%20Experience.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './logo.svg',

  /* React PRODUCTION CDN (no Babel — JSX is pre-compiled into app.js) */
  'https://unpkg.com/react@18.3.1/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600;700&display=swap',

  /* Single pre-compiled app bundle (all 15 screens + experience shell) */
  './app.js?v=' + V,

  /* RealDesk Analytics client (offline-first usage tracking) */
  './assets/rda.js?v=' + V,

  /* Above-the-fold visual */
  './assets/intro.jpg',
  './assets/bird.webp',

  /* iOS apple-touch-startup-image splash variants */
  './splash/splash-iphone-l.png',
  './splash/splash-iphone-p.png',
  './splash/splash-ipad-l.png',
  './splash/splash-ipad-p.png'
];

/* SECONDARY = downloaded after the app is interactive, via message from the page. */
const SECONDARY = [
  './assets/masterplan-render.jpg',
  './assets/towers-3d.jpg',
  './assets/towers-3d-day.jpg',
  './assets/tower-single.webp',
  './assets/unit-floor.jpg',
  './assets/maps/location-02.jpg',
  './assets/renders/cover-01.png',
  './assets/renders/masterplan-03.jpg',
  './assets/renders/render-04.jpg',
  './assets/renders/render-05.jpg',
  './assets/renders/backcover-15.jpg',
  './assets/plans/plan-07.jpg', './assets/plans/plan-07-e.jpg', './assets/plans/plan-07-w.jpg',
  './assets/plans/plan-08.jpg', './assets/plans/plan-08-e.jpg', './assets/plans/plan-08-w.jpg',
  './assets/plans/plan-09.jpg', './assets/plans/plan-09-e.jpg', './assets/plans/plan-09-w.jpg',
  './assets/plans/plan-10.jpg', './assets/plans/plan-10-e.jpg', './assets/plans/plan-10-w.jpg',
  './assets/plans/plan-11.jpg', './assets/plans/plan-11-e.jpg', './assets/plans/plan-11-w.jpg',
  './assets/plans/plan-12.jpg', './assets/plans/plan-12-e.jpg', './assets/plans/plan-12-w.jpg'
];

function fetchAndCache(cache, urls) {
  return Promise.all(urls.map((url) =>
    cache.add(new Request(url, {
      cache: 'reload',
      mode: url.startsWith('http') ? 'no-cors' : 'same-origin'
    })).catch(() => {/* skip individual failures */})
  ));
}

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((cache) => fetchAndCache(cache, CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match('./index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => cached);
    })
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
  if (e.data === 'PREFETCH_SECONDARY') {
    e.waitUntil(
      caches.open(CACHE).then((cache) => fetchAndCache(cache, SECONDARY))
    );
  }
});
