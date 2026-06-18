// Embassy Citadel — offline-first service worker.
// The full app (every screen + all media) is downloaded into Cache Storage by
// the first-run "Download for Offline" gate on intro.html, NOT on SW install —
// so we never download the 170+ MB twice. The SW just serves cache-first and
// runtime-caches anything else that gets loaded.
// Cache name + file list live in assets/precache-list.js (single source of truth).
try { importScripts("assets/precache-list.js"); } catch (_) {}
const CACHE = self.EC_CACHE || "citadel-v42";

self.addEventListener("install", (e) => {
  // No precache here — the download gate fills the cache. Activate immediately.
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  // Cache-first for everything; fall back to network and cache the result.
  e.respondWith((async () => {
    const cached = await caches.match(req, { ignoreSearch: sameOrigin });
    if (cached) return cached;
    try {
      const res = await fetch(req);
      if (res && (res.ok || res.type === "opaque")) {
        const c = await caches.open(CACHE);
        c.put(req, res.clone()).catch(() => {});
      }
      return res;
    } catch (_) {
      if (req.mode === "navigate") {
        const shell = await caches.match("intro.html") || await caches.match("index.html");
        if (shell) return shell;
      }
      return new Response("", { status: 504, statusText: "offline" });
    }
  })());
});
