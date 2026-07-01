/* The Universe — PWA "Download Experience" controller (plain JS, no Babel).
 *
 * Decides one of three modes and drives the branded first-run download screen:
 *   dev   — local development (localhost, not installed): no SW, caches cleared,
 *           app boots straight from network so edits always show.
 *   gate  — production / installed PWA, not yet downloaded: show the branded
 *           "Download Experience" screen; on tap, precache every asset from
 *           asset-manifest.json with a real progress bar, then enter the suite.
 *   ready — already downloaded: SW serves everything from cache, instant + offline.
 *
 * Force the gate locally for testing with ?pwa=1 (and ?pwa=reset to re-download).
 */
(function () {
  'use strict';
  var CACHE = 'universe-v8';               // MUST match CACHE in sw.js
  var FLAG = 'universe-cache-version';
  var doc = document, html = doc.documentElement;

  var qs = new URLSearchParams(location.search);
  if (qs.get('pwa') === 'reset') { try { localStorage.removeItem(FLAG); } catch (e) {} }
  var forced = qs.has('pwa') && qs.get('pwa') !== '0';
  var host = location.hostname;
  var isLocal = host === 'localhost' || host === '127.0.0.1' || /^192\.168\./.test(host) || host === '';
  var standalone = matchMedia('(display-mode: standalone)').matches ||
                   matchMedia('(display-mode: fullscreen)').matches ||
                   navigator.standalone === true;
  var swOK = 'serviceWorker' in navigator && (location.protocol === 'https:' || isLocal);
  var downloaded = false;
  try { downloaded = localStorage.getItem(FLAG) === CACHE; } catch (e) {}

  var mode;
  if (isLocal && !standalone && !forced) mode = 'dev';
  else if (downloaded) mode = 'ready';
  else mode = 'gate';
  html.setAttribute('data-pwa', mode);

  // ---- DEV: tear down any SW + caches so local edits always show ----
  if (mode === 'dev') {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function (rs) { rs.forEach(function (r) { r.unregister(); }); }).catch(function () {});
      if (window.caches && caches.keys) caches.keys().then(function (ks) { ks.forEach(function (k) { caches.delete(k); }); }).catch(function () {});
    }
    return;
  }

  // ---- PROD / installed: register the offline service worker ----
  if (swOK) {
    var register = function () { navigator.serviceWorker.register('./sw.js').catch(function (err) { console.warn('SW registration failed', err); }); };
    if (doc.readyState === 'complete') register(); else addEventListener('load', register);
  }

  if (mode === 'ready') return;  // everything cached already — boot straight in.

  // ---- GATE: branded download screen + precache with progress ----
  function $(id) { return doc.getElementById(id); }
  function fmtMB(b) { return (b / 1048576).toFixed(b < 10485760 ? 1 : 0); }

  function enter() {
    var ov = $('pwa-gate');
    if (!ov) { html.setAttribute('data-pwa', 'ready'); return; }
    ov.classList.add('pwa-done');
    setTimeout(function () { ov.parentNode && ov.parentNode.removeChild(ov); html.setAttribute('data-pwa', 'ready'); }, 760);
  }

  function startDownload() {
    var btn = $('pwa-btn'); if (btn) btn.style.display = 'none';
    var prog = $('pwa-progress'); if (prog) prog.style.display = 'block';
    var bar = $('pwa-bar'), pct = $('pwa-pct'), sub = $('pwa-status');

    fetch('asset-manifest.json', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (m) {
      var urls = m.urls.slice(), sizes = m.sizes || {}, total = m.totalBytes || 1;
      caches.open(CACHE).then(function (cache) {
        var done = 0, i = 0, active = 0, failed = 0, finished = false;
        var CONC = 6;

        function tick() {
          var p = Math.min(100, Math.round(done / total * 100));
          if (bar) bar.style.width = p + '%';
          if (pct) pct.textContent = p + '%';
          if (sub) sub.textContent = fmtMB(done) + ' / ' + fmtMB(total) + ' MB';
        }
        function one(url, retried) {
          active++;
          cache.match(url).then(function (hit) {
            if (hit) { done += (sizes[url] || 0); active--; tick(); pump(); return; }
            fetch(url, { cache: 'no-store' }).then(function (res) {
              if (!res || !res.ok) throw new Error('bad ' + url);
              return cache.put(url, res.clone());
            }).then(function () {
              done += (sizes[url] || 0); active--; tick(); pump();
            }).catch(function () {
              if (!retried) { active--; one(url, true); return; }  // one retry
              failed++; done += (sizes[url] || 0); active--; tick(); pump();
            });
          });
        }
        function pump() {
          while (active < CONC && i < urls.length) one(urls[i++]);
          if (!finished && active === 0 && i >= urls.length) {
            finished = true;
            tick();
            try { localStorage.setItem(FLAG, CACHE); } catch (e) {}
            if (sub) sub.textContent = failed ? ('Ready · ' + failed + ' items will load live') : 'Ready';
            setTimeout(enter, 420);
          }
        }
        tick(); pump();
      });
    }).catch(function () {
      // manifest unreachable (e.g. truly offline first run) — just enter.
      enter();
    });
  }

  function wire() {
    var btn = $('pwa-btn');
    if (btn) btn.addEventListener('click', startDownload, { once: true });
    var skip = $('pwa-skip');
    if (skip) skip.addEventListener('click', function () { try { localStorage.setItem(FLAG, CACHE); } catch (e) {} enter(); });
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', wire); else wire();
})();
