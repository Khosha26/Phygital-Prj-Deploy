/* ══════════════════════════════════════════════════════════════════════════
   Embassy Citadel — 360° View
   Self-injecting floating button + fullscreen in-app tour overlay.
   Included on every content screen. Loads the external 360° tour lazily on
   open (never on page load, so offline boot is unaffected). Falls back to a
   graceful message when there is no connection.
   Brand: paper #FCFAF4 · onyx #1C1A17 · bronze #946F38 · Lato + Cormorant.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (document.getElementById('ec360-root')) return;         // idempotent

  var TOUR_URL = 'https://www.turiya.co/360/Embassy/Mumbai/BLUAnnex/';
  var BRONZE   = '#946F38';

  /* 360° rotate glyph — a sphere with an orbit sweep + rotation arrow */
  var ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<ellipse cx="12" cy="12" rx="9.6" ry="4"/>' +
      '<path d="M12 3.1a8.9 8.9 0 0 1 0 17.8 8.9 8.9 0 0 1 0-17.8"/>' +
      '<path d="M9.6 2.3 12 3.1l-.8 2.4"/>' +
    '</svg>';

  /* ── styles ─────────────────────────────────────────────────────────── */
  var css = [
    '#ec360-root{position:fixed;inset:0;pointer-events:none;z-index:2147483400;}',
    '#ec360-root *{box-sizing:border-box;}',
    '#ec360-root button{font-family:inherit;}',

    /* in-topbar trigger — a glass pill matching the Back button, sits in the top-right */
    '.ec-topbar-actions{display:flex;align-items:center;gap:12px;}',
    '.ec-360-btn{display:inline-flex;align-items:center;gap:9px;min-height:48px;padding:0 20px;',
      'border-radius:999px;',
      'background:var(--glass-strong,rgba(252,250,244,0.92));',
      'border:1px solid var(--glass-border,rgba(148,111,56,0.28));',
      'box-shadow:var(--glass-shadow,0 6px 22px rgba(28,26,23,0.14));',
      'backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);',
      "color:var(--gold-500,#946F38);font-family:'Lato',-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;",
      'font-weight:600;font-size:10px;letter-spacing:.34em;text-transform:uppercase;white-space:nowrap;',
      'cursor:pointer;-webkit-appearance:none;appearance:none;',
      'transition:background .2s ease,transform .18s ease,color .2s ease;}',
    '.ec-360-btn:hover{background:var(--paper,#fff);transform:translateY(-1px);color:var(--onyx-700,#3a352c);}',
    '.ec-360-btn:active{transform:scale(.97);}',
    '.ec-360-btn:focus-visible{outline:2px solid ' + BRONZE + ';outline-offset:2px;}',
    '.ec-360-btn .ec360-ic{width:18px;height:18px;color:' + BRONZE + ';display:block;flex:0 0 auto;}',
    '.ec-360-btn:hover .ec360-ic{color:inherit;}',
    '.ec-360-btn .ec360-ic svg{width:18px;height:18px;display:block;}',

    /* overlay */
    '.ec360-overlay{position:fixed;inset:0;z-index:2147483500;pointer-events:none;',
      'background:rgba(20,18,15,0.64);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);',
      'opacity:0;visibility:hidden;transition:opacity .4s ease,visibility .4s ease;',
      'display:flex;align-items:center;justify-content:center;padding:26px;}',
    '.ec360-overlay.open{opacity:1;visibility:visible;pointer-events:auto;}',
    '.ec360-frame{position:relative;width:100%;height:100%;max-width:1720px;border-radius:14px;',
      'overflow:hidden;background:#0d0c0a;box-shadow:0 40px 120px rgba(0,0,0,0.5);',
      'transform:scale(.985);transition:transform .4s cubic-bezier(.2,.8,.2,1);}',
    '.ec360-overlay.open .ec360-frame{transform:scale(1);}',
    '.ec360-iframe{width:100%;height:100%;border:0;display:block;background:#0d0c0a;}',

    '.ec360-title{position:absolute;top:20px;left:24px;z-index:3;color:#FCFAF4;',
      "font-family:'Cormorant Garamond',Georgia,serif;font-size:15px;font-weight:500;",
      'letter-spacing:.30em;text-transform:uppercase;text-shadow:0 2px 14px rgba(0,0,0,0.55);',
      'pointer-events:none;}',
    '.ec360-close{position:absolute;top:15px;right:15px;z-index:3;width:44px;height:44px;',
      'border-radius:50%;background:rgba(252,250,244,0.96);border:1px solid rgba(148,111,56,0.30);',
      'cursor:pointer;display:grid;place-items:center;color:#1C1A17;',
      'box-shadow:0 6px 20px rgba(0,0,0,0.32);transition:background .2s ease,transform .18s ease;}',
    '.ec360-close:hover{background:#fff;transform:rotate(90deg);}',
    '.ec360-close svg{width:20px;height:20px;}',

    /* loader */
    '.ec360-load{position:absolute;inset:0;z-index:2;display:grid;place-items:center;',
      "color:#FCFAF4;font-family:'Lato',sans-serif;font-size:10px;letter-spacing:.34em;",
      'text-transform:uppercase;text-align:center;transition:opacity .3s ease;}',
    '.ec360-load.hide{opacity:0;pointer-events:none;}',
    '.ec360-spin{width:34px;height:34px;margin:0 auto 16px;border:2px solid rgba(252,250,244,0.22);',
      'border-top-color:#C9A25A;border-radius:50%;animation:ec360spin .9s linear infinite;}',
    '@keyframes ec360spin{to{transform:rotate(360deg);}}',

    /* offline / error fallback */
    '.ec360-msg{position:absolute;inset:0;z-index:4;display:none;place-items:center;text-align:center;',
      "padding:44px;color:#FCFAF4;font-family:'Lato',sans-serif;background:radial-gradient(120% 120% at 50% 40%,#1a1713 0%,#0d0c0a 100%);}",
    '.ec360-msg.show{display:grid;}',
    '.ec360-msg .m-ic{width:40px;height:40px;margin:0 auto 18px;color:#C9A25A;}',
    ".ec360-msg .m-h{font-family:'Cormorant Garamond',Georgia,serif;font-size:26px;letter-spacing:.04em;margin-bottom:10px;}",
    '.ec360-msg .m-p{font-size:12.5px;line-height:1.6;color:rgba(252,250,244,0.72);max-width:340px;margin:0 auto;}',

    '@media (prefers-reduced-motion:reduce){',
      '.ec-360-btn,.ec360-frame,.ec360-overlay,.ec360-close{transition:none;}',
      '.ec360-spin{animation:none;}}',

    /* narrow screens — shrink the pill to just the mark */
    '@media (max-width:560px){.ec-360-btn{padding:0 13px;gap:0;}.ec-360-btn span:last-child{display:none;}}'
  ].join('');

  var styleEl = document.createElement('style');
  styleEl.id = 'ec360-style';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ── DOM ────────────────────────────────────────────────────────────── */
  var root = document.createElement('div');
  root.id = 'ec360-root';
  root.innerHTML =
    '<div class="ec360-overlay" id="ec360Overlay" role="dialog" aria-modal="true" aria-label="360 degree view">' +
      '<div class="ec360-frame">' +
        '<div class="ec360-title">360&deg; View</div>' +
        '<button class="ec360-close" id="ec360Close" type="button" aria-label="Close 360 view">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>' +
        '</button>' +
        '<div class="ec360-load" id="ec360Load"><div><div class="ec360-spin"></div>Loading 360&deg; View</div></div>' +
        '<div class="ec360-msg" id="ec360Msg">' +
          '<div>' +
            '<div class="m-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9"/><path d="M3.5 8.5h17M3.5 15.5h13"/><path d="M12 3c2.6 2.4 3.9 5.6 3.9 9s-1.3 6.6-3.9 9c-2.6-2.4-3.9-5.6-3.9-9"/></svg></div>' +
            '<div class="m-h">Connect to view</div>' +
            '<div class="m-p">The 360&deg; tour streams live and needs an internet connection. Reconnect this device and tap 360&deg; View again.</div>' +
          '</div>' +
        '</div>' +
        '<iframe class="ec360-iframe" id="ec360Iframe" title="Embassy Citadel 360 degree tour" allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer" allowfullscreen loading="lazy"></iframe>' +
      '</div>' +
    '</div>';
  document.body.appendChild(root);

  /* ── behavior ───────────────────────────────────────────────────────── */
  var overlay = root.querySelector('#ec360Overlay');
  var iframe  = root.querySelector('#ec360Iframe');
  var load    = root.querySelector('#ec360Load');
  var msg     = root.querySelector('#ec360Msg');
  var closeBtn= root.querySelector('#ec360Close');
  var loaded  = false;
  var failTimer = null;

  function showMsg(show) { msg.classList.toggle('show', show); }

  function open() {
    overlay.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    // RealDesk — track 360 usage
    try { if (window.RDA) RDA.track('360_view', 'BLUAnnex', 1, { url: TOUR_URL, screen: (location.pathname.split('/').pop() || 'index').replace('.html','') }); } catch (e) {}

    if (navigator.onLine === false) { showMsg(true); load.classList.add('hide'); return; }
    showMsg(false);

    if (!loaded) {
      load.classList.remove('hide');
      iframe.src = TOUR_URL;
      loaded = true;
      // if the frame never loads (blocked / no route), show the fallback
      failTimer = setTimeout(function () {
        if (!iframe.dataset.ok) { showMsg(true); load.classList.add('hide'); }
      }, 12000);
    }
  }

  function close() {
    overlay.classList.remove('open');
    document.documentElement.style.overflow = '';
  }

  iframe.addEventListener('load', function () {
    if (!iframe.src) return;              // ignore the initial empty load
    iframe.dataset.ok = '1';
    if (failTimer) { clearTimeout(failTimer); failTimer = null; }
    load.classList.add('hide');
  });

  // any in-topbar trigger opens the overlay (event delegation — works for
  // buttons injected before or after this script runs)
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-ec360], .ec-360-btn');
    if (t) { e.preventDefault(); open(); }
  });
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay.classList.contains('open')) close(); });
})();
