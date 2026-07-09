/* The Residences at Embassy ONE — service worker (offline-first PWA kiosk).
   On install it precaches the app shell + every key asset so the suite runs
   fully offline after the first load. Strategy: stale-while-revalidate for
   same-origin assets (instant + offline, refreshes in the background so new
   builds appear on the next load). Live map tiles always hit the network. */
const CACHE = 'eo-v2.6';

const SHELL = [
  './', './index.html', './manifest.json', './assets/leaf.js', './assets/rda.js', './assets-manifest.json',
  './screens/place-location.html', './screens/masterplan.html', './screens/masterplan-illustrated.html',
  './screens/tower.html', './screens/floorplans.html', './screens/gallery.html',
  './screens/overview.html', './screens/service.html', './screens/lanterns.html',
  './screens/amenities.html', './screens/invitation.html',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-192.png', './icons/maskable-512.png',
  './icons/apple-touch-icon.png', './icons/favicon.png'
];

// GENERATED from assets-manifest.json (eo-pkg-beige-v29, 101 assets) — regenerate on every deploy
const ASSETS = [
  './assets/belt.webp', './assets/bg-inner.webp', './assets/brand/one-coin-nb.webp',
  './assets/brand/one-pr-bone.webp', './assets/brand/one-pr-ink.webp', './assets/clouds/cloud02.webp',
  './assets/clouds/cloud22.webp', './assets/clouds/cloud44.webp', './assets/clouds/cloud54.webp',
  './assets/clouds/cloud65.webp', './assets/embassy-one-logo.svg', './assets/floorplans/booklet/p01.webp',
  './assets/floorplans/booklet/p02.webp', './assets/floorplans/booklet/p03.webp', './assets/floorplans/booklet/p04.webp',
  './assets/floorplans/booklet/p05.webp', './assets/floorplans/booklet/p06.webp', './assets/floorplans/booklet/p07.webp',
  './assets/floorplans/booklet/p08.webp', './assets/floorplans/booklet/p09.webp', './assets/floorplans/booklet/p10.webp',
  './assets/floorplans/booklet/p11.webp', './assets/floorplans/booklet/p12.webp', './assets/floorplans/booklet/p13.webp',
  './assets/floorplans/booklet/p14.webp', './assets/floorplans/booklet/p15.webp', './assets/floorplans/booklet/p16.webp',
  './assets/floorplans/booklet/p17.webp', './assets/floorplans/booklet/p18.webp', './assets/floorplans/booklet/p19.webp',
  './assets/floorplans/booklet/p20.webp', './assets/floorplans/booklet/p21.webp', './assets/floorplans/booklet/p22.webp',
  './assets/floorplans/booklet/p23.webp', './assets/floorplans/booklet/p24.webp', './assets/floorplans/booklet/p25.webp',
  './assets/floorplans/booklet/p26.webp', './assets/floorplans/booklet/p27.webp', './assets/floorplans/booklet/p28.webp',
  './assets/floorplans/hi/2br-duplex.webp', './assets/floorplans/hi/3br-study-media.webp', './assets/floorplans/hi/3br-study.webp',
  './assets/floorplans/hi/3br.webp', './assets/floorplans/hi/4br-recessed.webp', './assets/floorplans/hi/4br-study.webp',
  './assets/floorplans/hi/4br.webp', './assets/floorplans/hi/5br-penthouse-lower.webp', './assets/floorplans/hi/5br-penthouse-upper.webp',
  './assets/home-sketch-bg.webp', './assets/home/btn-gallery.webp', './assets/home/btn-grounds.webp',
  './assets/home/btn-overview.webp', './assets/home/btn-place.webp', './assets/home/btn-residences.webp',
  './assets/home/btn-service.webp', './assets/home/btn-tower.webp', './assets/home/lantern-bar.webp',
  './assets/lantern-btn-gold.webp', './assets/lanterns/3d/autumn.glb', './assets/lanterns/3d/center.glb',
  './assets/lanterns/3d/spring.glb', './assets/lanterns/3d/summer.glb', './assets/lanterns/3d/winter.glb',
  './assets/leaf-cluster.webp', './assets/leaf-motif.webp', './assets/masterplan/views/master-fs.webp',
  './assets/masterplan/views/planting.webp', './assets/masterplan/views/trees.webp', './assets/masterplan/views/zoning.webp',
  './assets/one-coin.webp', './assets/plate-2560.webp', './assets/plate-parchment.webp',
  './assets/renders/amenities/lawn.webp', './assets/renders/amenities/muga.webp', './assets/renders/amenities/pets.webp',
  './assets/renders/amenities/yoga.webp', './assets/renders/exterior/ext-1.webp', './assets/renders/exterior/ext-2.webp',
  './assets/renders/exterior/ext-3.webp', './assets/renders/exterior/overview-dev.webp', './assets/renders/exterior/tower-aerial.webp',
  './assets/renders/exterior/tower-etch.webp', './assets/renders/exterior/tower-hero.webp', './assets/renders/exterior/tower-inside.webp',
  './assets/renders/exterior/tower-lineart.webp', './assets/renders/exterior/tower-outline-bone.webp', './assets/renders/exterior/tower-outline.webp',
  './assets/renders/exterior/tower-scene.webp', './assets/renders/lanterns/autumn.webp', './assets/renders/lanterns/center.webp',
  './assets/renders/lanterns/lobby.webp', './assets/renders/lanterns/spring.webp', './assets/renders/lanterns/summer.webp',
  './assets/renders/lanterns/twin.webp', './assets/vendor/draco/draco_decoder.wasm', './assets/vendor/draco/draco_wasm_wrapper.js',
  './assets/vendor/three/DRACOLoader.js', './assets/vendor/three/GLTFLoader.js', './assets/vendor/three/three.module.js',
  './assets/vendor/utils/BufferGeometryUtils.js', './sw.js',
  // fixed CDN libs (map engine) so the location screen works offline too
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(async (c) => {
      await c.addAll(SHELL).catch(() => {});                          // shell is essential
      await Promise.allSettled(ASSETS.map((u) => c.add(u)));  // tolerant: one 404 won't abort
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => { if (e.data === 'skip-waiting') self.skipWaiting(); });

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Map tiles for the fixed location ARE cached (offline + fast; they preload during the download gate).
  const cacheable = url.origin === location.origin || /fonts\.(googleapis|gstatic)|unpkg\.com|basemaps\.cartocdn\.com|server\.arcgisonline\.com/.test(url.href);
  if (!cacheable) return;

  // HTML pages (the home + every screen, incl. iframes) = NETWORK-FIRST: always fetch the latest when
  // online so code/markup edits show up immediately; fall back to cache when offline. This kills the
  // "I can't see my changes" staleness. Heavy assets stay cache-first below (instant + offline).
  const isDoc = req.mode === 'navigate' || url.pathname.endsWith('.html');
  if (isDoc) {
    e.respondWith(
      fetch(req).then((res) => {
        if (res && res.status === 200) { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); }
        return res;
      }).catch(() => caches.open(CACHE).then((c) => c.match(req).then((hit) => hit || c.match('./index.html'))))
    );
    return;
  }

  // Assets (images, fonts, glb, js/css): stale-while-revalidate — instant + offline, refresh in background.
  e.respondWith(
    caches.open(CACHE).then((c) =>
      c.match(req).then((hit) => {
        const net = fetch(req).then((res) => {
          if (res && res.status === 200 && res.type !== 'opaque') c.put(req, res.clone());
          return res;
        }).catch(() => null);
        return hit || net;
      })
    )
  );
});
