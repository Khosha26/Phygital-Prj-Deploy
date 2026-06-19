/* ════════════════════════════════════════════════════════════════════════
   Embassy Citadel — Global floating EMI calculator widget
   Self-contained. Injects a bottom-left FAB + a modal EMI calculator overlay.
   No external CSS. Idempotent. Does not interfere with page scroll/scaler.

   EMI formula (reducing balance):
     E = P·r·(1+r)^n / ((1+r)^n − 1)
     r = annual% / 12 / 100   ·   n = years × 12
   ──────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var WIDGET_ID = 'ecemi-root';
  if (window.__ecEmiWidget) return;          // already booted this realm
  window.__ecEmiWidget = true;

  // ── Defaults ──────────────────────────────────────────────────────────
  var DEFAULTS = { amount: 50000000, rate: 8.5, years: 20 };   // ₹5,00,00,000 · 8.5% · 20 yrs

  // ── Indian number formatting (Cr / Lakh-aware comma grouping) ─────────
  function fmtIN(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    var n = Math.round(num);
    var neg = n < 0;
    var s = String(Math.abs(n));
    if (s.length <= 3) return (neg ? '-' : '') + s;
    var last3 = s.slice(-3);
    var rest = s.slice(0, -3);
    var restFmt = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    return (neg ? '-' : '') + restFmt + ',' + last3;
  }
  function rs(n) { return '₹ ' + fmtIN(n); }
  // Compact Cr/Lakh label for the amount read-out
  function compactCr(n) {
    if (n >= 10000000) {
      var cr = n / 10000000;
      return '₹ ' + (cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)) + ' Cr';
    }
    if (n >= 100000) {
      var l = n / 100000;
      return '₹ ' + (l % 1 === 0 ? l.toFixed(0) : l.toFixed(2)) + ' L';
    }
    return rs(n);
  }

  // ── EMI math ──────────────────────────────────────────────────────────
  function calc(P, annual, years) {
    var r = (annual / 100) / 12;
    var n = years * 12;
    var emi = 0;
    if (P > 0 && r > 0 && n > 0) {
      emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    } else if (P > 0 && n > 0) {
      emi = P / n;
    }
    var total = emi * n;
    return { emi: emi, total: total, interest: total - P };
  }

  // ── Scoped CSS (all under .ecemi- prefix) ─────────────────────────────
  var CSS = [
    '.ecemi-root{',
    '  --ec-paper:#FCFAF4; --ec-bone:#F4F2ED; --ec-bone100:#F1ECDF;',
    '  --ec-onyx:#1A1814; --ec-onyx-soft:#3A332A;',
    '  --ec-bronze:#946F38; --ec-bronze-lo:rgba(148,111,56,.30); --ec-bronze-xlo:rgba(148,111,56,.14);',
    '  --ec-hair:rgba(148,111,56,.30); --ec-hair-hi:rgba(148,111,56,.55);',
    '  font-family:"Inter",-apple-system,BlinkMacSystemFont,system-ui,sans-serif;',
    '  -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;',
    '}',

    /* FAB ---------------------------------------------------------------- */
    '.ecemi-fab{',
    '  position:fixed;',
    '  left:calc(20px + env(safe-area-inset-left,0px));',
    '  bottom:calc(20px + env(safe-area-inset-bottom,0px));',
    '  width:52px; height:52px; border-radius:50%;',
    '  display:flex; align-items:center; justify-content:center;',
    '  border:none; padding:0; cursor:pointer; z-index:2147483600;',
    '  background:linear-gradient(160deg,#FCFAF4 0%,#F4F2ED 100%);',
    '  color:var(--ec-bronze);',
    '  box-shadow:0 0 0 1px var(--ec-bronze-lo),0 8px 22px rgba(26,24,20,.16),0 2px 6px rgba(26,24,20,.10);',
    '  -webkit-backdrop-filter:blur(8px); backdrop-filter:blur(8px);',
    '  -webkit-tap-highlight-color:transparent; -webkit-user-select:none; user-select:none;',
    '  transition:transform .18s cubic-bezier(.22,.61,.36,1),box-shadow .18s cubic-bezier(.22,.61,.36,1);',
    '}',
    '.ecemi-fab::before{',  /* bronze ring */
    '  content:""; position:absolute; inset:3px; border-radius:50%;',
    '  border:1px solid var(--ec-hair); pointer-events:none;',
    '}',
    '.ecemi-fab:active{ transform:scale(.94); }',
    '@media (hover:hover){ .ecemi-fab:hover{',
    '  transform:translateY(-2px);',
    '  box-shadow:0 0 0 1px var(--ec-hair-hi),0 12px 28px rgba(26,24,20,.20),0 3px 8px rgba(26,24,20,.12);',
    '} }',
    '.ecemi-fab svg{ width:24px; height:24px; display:block; }',

    /* Overlay + backdrop ------------------------------------------------- */
    '.ecemi-overlay{',
    '  position:fixed; inset:0; z-index:2147483601;',
    '  display:flex; align-items:center; justify-content:center;',
    '  padding:24px;',
    '  opacity:0; visibility:hidden; pointer-events:none;',
    '  transition:opacity .22s cubic-bezier(.22,.61,.36,1),visibility 0s linear .22s;',
    '}',
    '.ecemi-overlay.is-open{ opacity:1; visibility:visible; pointer-events:auto; transition:opacity .22s cubic-bezier(.22,.61,.36,1); }',
    '.ecemi-backdrop{',
    '  position:absolute; inset:0;',
    '  background:rgba(26,24,20,.42);',
    '  -webkit-backdrop-filter:blur(3px); backdrop-filter:blur(3px);',
    '}',

    /* Card -------------------------------------------------------------- */
    '.ecemi-card{',
    '  position:relative; width:100%; max-width:560px;',
    '  max-height:calc(100vh - 48px); max-height:calc(100dvh - 48px); overflow:auto;',
    '  -webkit-overflow-scrolling:touch;',
    '  background:var(--ec-paper);',
    '  border:1px solid var(--ec-hair);',
    '  border-radius:16px;',
    '  box-shadow:0 24px 60px rgba(26,24,20,.28),0 6px 16px rgba(26,24,20,.12);',
    '  padding:26px 28px 24px;',
    '  transform:translateY(10px) scale(.985);',
    '  transition:transform .26s cubic-bezier(.22,.61,.36,1);',
    '}',
    '.ecemi-overlay.is-open .ecemi-card{ transform:translateY(0) scale(1); }',

    /* Head -------------------------------------------------------------- */
    '.ecemi-head{ display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:4px; }',
    '.ecemi-eyebrow{',
    '  font-family:"Inter",sans-serif; font-size:10.5px; font-weight:500;',
    '  letter-spacing:.22em; text-transform:uppercase; color:var(--ec-bronze);',
    '  margin:0 0 6px;',
    '}',
    '.ecemi-title{',
    '  font-family:"Cormorant Garamond",Georgia,serif; font-weight:400;',
    '  font-size:30px; line-height:1.04; letter-spacing:.005em;',
    '  color:var(--ec-onyx); margin:0;',
    '}',
    '.ecemi-close{',
    '  flex:0 0 auto; width:34px; height:34px; border-radius:50%;',
    '  display:flex; align-items:center; justify-content:center;',
    '  background:transparent; border:1px solid var(--ec-hair); color:var(--ec-onyx-soft);',
    '  cursor:pointer; -webkit-tap-highlight-color:transparent;',
    '  transition:transform .16s cubic-bezier(.22,.61,.36,1),background .16s,color .16s,border-color .16s;',
    '}',
    '.ecemi-close:active{ transform:scale(.92); }',
    '@media (hover:hover){ .ecemi-close:hover{ background:var(--ec-bone); color:var(--ec-onyx); border-color:var(--ec-hair-hi); } }',
    '.ecemi-close svg{ width:16px; height:16px; }',

    '.ecemi-rule{ height:1px; background:var(--ec-hair); margin:18px 0 20px; border:0; }',

    /* Fields ------------------------------------------------------------ */
    '.ecemi-fields{ display:flex; flex-direction:column; gap:18px; }',
    '.ecemi-field .ecemi-fhead{ display:flex; align-items:baseline; justify-content:space-between; margin-bottom:9px; }',
    '.ecemi-flabel{ font-size:12.5px; font-weight:500; color:var(--ec-onyx-soft); letter-spacing:.01em; }',
    '.ecemi-fval{ font-family:"Inter",sans-serif; font-size:15px; font-weight:600; color:var(--ec-onyx); }',
    '.ecemi-fval .ecemi-unit{ font-size:11px; font-weight:500; color:var(--ec-onyx-soft); opacity:.7; margin-left:5px; letter-spacing:.04em; }',

    /* Range slider (gold fill via --pct) -------------------------------- */
    '.ecemi-range{',
    '  -webkit-appearance:none; appearance:none; width:100%; height:4px;',
    '  border-radius:4px; outline:none; cursor:pointer; margin:0; padding:0;',
    '  background:linear-gradient(to right,var(--ec-bronze) 0%,var(--ec-bronze) var(--pct,0%),var(--ec-bone100) var(--pct,0%),var(--ec-bone100) 100%);',
    '}',
    '.ecemi-range::-webkit-slider-thumb{',
    '  -webkit-appearance:none; appearance:none; width:18px; height:18px; border-radius:50%;',
    '  background:var(--ec-paper); border:2px solid var(--ec-bronze);',
    '  box-shadow:0 2px 6px rgba(26,24,20,.18); cursor:pointer;',
    '  transition:transform .14s cubic-bezier(.22,.61,.36,1);',
    '}',
    '.ecemi-range:active::-webkit-slider-thumb{ transform:scale(1.12); }',
    '.ecemi-range::-moz-range-thumb{',
    '  width:18px; height:18px; border-radius:50%;',
    '  background:var(--ec-paper); border:2px solid var(--ec-bronze);',
    '  box-shadow:0 2px 6px rgba(26,24,20,.18); cursor:pointer;',
    '}',
    '.ecemi-bounds{ display:flex; justify-content:space-between; margin-top:7px; }',
    '.ecemi-bounds span{ font-size:10.5px; color:var(--ec-onyx-soft); opacity:.6; letter-spacing:.02em; }',

    /* Results ----------------------------------------------------------- */
    '.ecemi-results{',
    '  margin-top:22px; background:var(--ec-bone); border:1px solid var(--ec-hair);',
    '  border-radius:12px; padding:16px 18px;',
    '}',
    '.ecemi-rrow{ display:flex; align-items:baseline; justify-content:space-between; padding:7px 0; }',
    '.ecemi-rrow + .ecemi-rrow{ border-top:1px solid var(--ec-bronze-xlo); }',
    '.ecemi-rk{ font-size:12.5px; color:var(--ec-onyx-soft); letter-spacing:.01em; }',
    '.ecemi-rv{ font-family:"Inter",sans-serif; font-size:15px; font-weight:600; color:var(--ec-onyx); }',
    '.ecemi-rrow.is-hero{ padding:4px 0 10px; }',
    '.ecemi-rrow.is-hero .ecemi-rk{ font-size:11px; text-transform:uppercase; letter-spacing:.16em; color:var(--ec-bronze); font-weight:500; }',
    '.ecemi-rrow.is-hero .ecemi-rv{ font-family:"Cormorant Garamond",Georgia,serif; font-weight:500; font-size:34px; line-height:1; color:var(--ec-onyx); }',

    '.ecemi-note{ font-size:10.5px; color:var(--ec-onyx-soft); opacity:.62; line-height:1.5; margin:14px 0 0; letter-spacing:.01em; }',

    '@media (max-width:520px){',
    '  .ecemi-card{ padding:22px 20px 20px; }',
    '  .ecemi-title{ font-size:26px; }',
    '  .ecemi-rrow.is-hero .ecemi-rv{ font-size:30px; }',
    '}',

    '@media (prefers-reduced-motion:reduce){',
    '  .ecemi-fab,.ecemi-overlay,.ecemi-card,.ecemi-close,.ecemi-range::-webkit-slider-thumb{ transition:none !important; }',
    '}'
  ].join('\n');

  // ── Build DOM ─────────────────────────────────────────────────────────
  function build() {
    if (document.getElementById(WIDGET_ID)) return;   // idempotent

    var style = document.createElement('style');
    style.id = 'ecemi-style';
    style.textContent = CSS;
    document.head.appendChild(style);

    var root = document.createElement('div');
    root.id = WIDGET_ID;
    root.className = 'ecemi-root';

    root.innerHTML = [
      '<button class="ecemi-fab" type="button" aria-label="Open EMI calculator" aria-haspopup="dialog">',
      '  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">',
      '    <rect x="5" y="2.5" width="14" height="19" rx="2.2"/>',
      '    <rect x="8" y="5.5" width="8" height="3.2" rx="0.7"/>',
      '    <path d="M8.5 12.5h0M12 12.5h0M15.5 12.5h0M8.5 15.5h0M12 15.5h0M8.5 18.5h0M12 18.5h0"/>',
      '    <path d="M15.5 15.5v3"/>',
      '  </svg>',
      '</button>',
      '<div class="ecemi-overlay" role="dialog" aria-modal="true" aria-label="EMI calculator">',
      '  <div class="ecemi-backdrop"></div>',
      '  <div class="ecemi-card" role="document">',
      '    <div class="ecemi-head">',
      '      <div>',
      '        <p class="ecemi-eyebrow">Loan Planner</p>',
      '        <h2 class="ecemi-title">EMI Calculator</h2>',
      '      </div>',
      '      <button class="ecemi-close" type="button" aria-label="Close">',
      '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
      '      </button>',
      '    </div>',
      '    <hr class="ecemi-rule"/>',
      '    <div class="ecemi-fields">',
      '      <div class="ecemi-field">',
      '        <div class="ecemi-fhead"><span class="ecemi-flabel">Loan Amount</span><span class="ecemi-fval" id="ecemiAmountLbl"></span></div>',
      '        <input type="range" class="ecemi-range" id="ecemiAmount" min="1000000" max="200000000" step="100000" value="' + DEFAULTS.amount + '" aria-label="Loan amount in rupees"/>',
      '        <div class="ecemi-bounds"><span>₹ 10 L</span><span>₹ 20 Cr</span></div>',
      '      </div>',
      '      <div class="ecemi-field">',
      '        <div class="ecemi-fhead"><span class="ecemi-flabel">Interest Rate</span><span class="ecemi-fval" id="ecemiRateLbl"></span></div>',
      '        <input type="range" class="ecemi-range" id="ecemiRate" min="6" max="14" step="0.05" value="' + DEFAULTS.rate + '" aria-label="Annual interest rate percent"/>',
      '        <div class="ecemi-bounds"><span>6.00 %</span><span>14.00 %</span></div>',
      '      </div>',
      '      <div class="ecemi-field">',
      '        <div class="ecemi-fhead"><span class="ecemi-flabel">Loan Tenure</span><span class="ecemi-fval" id="ecemiYearsLbl"></span></div>',
      '        <input type="range" class="ecemi-range" id="ecemiYears" min="5" max="30" step="1" value="' + DEFAULTS.years + '" aria-label="Loan tenure in years"/>',
      '        <div class="ecemi-bounds"><span>5 Years</span><span>30 Years</span></div>',
      '      </div>',
      '    </div>',
      '    <div class="ecemi-results">',
      '      <div class="ecemi-rrow is-hero"><span class="ecemi-rk">Monthly EMI</span><span class="ecemi-rv" id="ecemiResult"></span></div>',
      '      <div class="ecemi-rrow"><span class="ecemi-rk">Total Interest Payable</span><span class="ecemi-rv" id="ecemiInterest"></span></div>',
      '      <div class="ecemi-rrow"><span class="ecemi-rk">Total Amount Payable</span><span class="ecemi-rv" id="ecemiTotal"></span></div>',
      '    </div>',
      '    <p class="ecemi-note">Computed via the reducing-balance method. Figures are indicative; actual lender terms apply.</p>',
      '  </div>',
      '</div>'
    ].join('\n');

    document.body.appendChild(root);
    wire(root);
  }

  // ── Wire interactions ─────────────────────────────────────────────────
  function wire(root) {
    var fab     = root.querySelector('.ecemi-fab');
    var overlay = root.querySelector('.ecemi-overlay');
    var backdrop= root.querySelector('.ecemi-backdrop');
    var closeBtn= root.querySelector('.ecemi-close');

    var elP = root.querySelector('#ecemiAmount');
    var elR = root.querySelector('#ecemiRate');
    var elY = root.querySelector('#ecemiYears');

    var amountLbl = root.querySelector('#ecemiAmountLbl');
    var rateLbl   = root.querySelector('#ecemiRateLbl');
    var yearsLbl  = root.querySelector('#ecemiYearsLbl');
    var rResult   = root.querySelector('#ecemiResult');
    var rInterest = root.querySelector('#ecemiInterest');
    var rTotal    = root.querySelector('#ecemiTotal');

    function paint(el) {
      var min = Number(el.min) || 0, max = Number(el.max) || 100, val = Number(el.value) || 0;
      var pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
      el.style.setProperty('--pct', pct + '%');
    }

    function update() {
      var P = Number(elP.value) || 0;
      var annual = Number(elR.value) || 0;
      var years = Number(elY.value) || 0;
      var out = calc(P, annual, years);

      amountLbl.textContent = compactCr(P);
      rateLbl.innerHTML = annual.toFixed(2) + '<span class="ecemi-unit">% p.a.</span>';
      yearsLbl.innerHTML = years + '<span class="ecemi-unit">' + (years === 1 ? 'Year' : 'Years') + '</span>';

      paint(elP); paint(elR); paint(elY);

      rResult.textContent   = rs(out.emi);
      rInterest.textContent = rs(out.interest);
      rTotal.textContent    = rs(out.total);
    }

    [elP, elR, elY].forEach(function (el) { el.addEventListener('input', update); });
    update();

    var lastFocus = null;
    function open() {
      lastFocus = document.activeElement;
      overlay.classList.add('is-open');
      update();
      setTimeout(function () { closeBtn.focus(); }, 60);
    }
    function close() {
      overlay.classList.remove('is-open');
      if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (_) {} }
    }

    fab.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
    });

    // Keep backdrop touch-drags from scrolling the page behind the modal.
    overlay.addEventListener('touchmove', function (e) {
      if (e.target && e.target.classList && e.target.classList.contains('ecemi-backdrop')) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  // ── Boot on DOMContentLoaded (or immediately if already parsed) ───────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
