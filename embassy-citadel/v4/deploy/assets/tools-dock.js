/* ════════════════════════════════════════════════════════════════════════
   EMBASSY CITADEL — Global Tools Dock
   ─────────────────────────────────────────────────────────────────────────
   A floating launcher (bottom-right, every screen) that opens utilities as
   draggable windows / overlays on top of the current screen.

     • LAUNCHER    52px glass/bronze FAB → staggered vertical pill menu
     • WINDOWS     a reusable draggable, non-modal window factory; each tool
                   (EMI · Price Sheet · FSI) shares identical chrome + drag
     • ANNOTATE    full-viewport canvas overlay, smooth freehand pen, with an
                   in-bar Screenshot button (next to Done) that captures the
                   current screen WITH the annotations and saves a PNG
     • SCREENSHOT  html2canvas capture (composites annotations) → PNG,
                   reached only from inside Annotate

   Self-contained IIFE. Idempotent. Injects only a fixed root + a <style>,
   so it never disturbs page scroll or the stage scaler. Class prefix `ectd-`.
   Brand: paper #FCFAF4 · onyx text · bronze #946F38 · Cormorant + Inter.
   Multiple tool windows may be open at once (non-modal).
   ──────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var ROOT_ID = 'ectd-root';
  if (window.__ecToolsDock || document.getElementById(ROOT_ID)) return;
  window.__ecToolsDock = true;

  /* ── Brand tokens ───────────────────────────────────────────────────── */
  var BRONZE = '#946F38';
  var ONYX   = '#1C1A17';
  var PAPER  = '#FCFAF4';
  var COPPER = '#B8591A';

  /* ── Indian ₹ formatting (Cr / Lakh aware comma grouping) ───────────── */
  function fmtIN(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    var n = Math.round(num), neg = n < 0, s = String(Math.abs(n));
    if (s.length <= 3) return (neg ? '-' : '') + s;
    var last3 = s.slice(-3), rest = s.slice(0, -3);
    var restFmt = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    return (neg ? '-' : '') + restFmt + ',' + last3;
  }
  function rs(n) { return '₹' + fmtIN(n); }
  function compactCr(n) {
    if (n >= 10000000) { var cr = n / 10000000; return '₹' + (cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)) + ' Cr'; }
    if (n >= 100000)   { var l  = n / 100000;   return '₹' + (l  % 1 === 0 ? l.toFixed(0)  : l.toFixed(2))  + ' L'; }
    return rs(n);
  }

  /* ── EMI math: E = P·r·(1+r)^n / ((1+r)^n − 1) ──────────────────────── */
  function calcEMI(P, annual, years) {
    var r = (annual / 100) / 12, n = years * 12, emi = 0;
    if (P > 0 && r > 0 && n > 0) emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    else if (P > 0 && n > 0)     emi = P / n;
    var total = emi * n;
    return { emi: emi, total: total, interest: total - P };
  }

  /* ── Small DOM helper ───────────────────────────────────────────────── */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  /* ── Line icons (inline SVG, ~1.3–1.5 stroke, currentColor, no fill) ── */
  var ICONS = {
    /* Launcher — thin tower-section / index glyph to match the app's line set */
    tools:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M7 7l5-4 5 4"/><path d="M7 7v14h10V7"/><path d="M7 12h10M7 16.5h10"/></svg>',
    close:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    emi:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="9" y2="11"/><line x1="12" y1="11" x2="13" y2="11"/><line x1="8" y1="15" x2="9" y2="15"/><line x1="12" y1="15" x2="13" y2="15"/><line x1="16" y1="11" x2="16" y2="19"/></svg>',
    pen:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19l1.5-4L17 4.5a1.8 1.8 0 0 1 2.5 2.5L9 17.5 5 19z"/><path d="M14 6l3 3"/></svg>',
    shot:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8a2 2 0 0 1 2-2h2l1.2-1.6A1 1 0 0 1 11 4h2a1 1 0 0 1 .8.4L15 6h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="12.5" r="3.4"/></svg>',
    price:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/><path d="M8 12h8M8 15h8M8 18h5"/></svg>',
    fsi:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M4 10h16M10 4v16"/></svg>',
    undo:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 7L4 12l5 5"/><path d="M4 12h11a5 5 0 0 1 0 10h-1"/></svg>',
    clear:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/></svg>',
    check:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
    grip:   '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="7" r="1.3"/><circle cx="15" cy="7" r="1.3"/><circle cx="9" cy="12" r="1.3"/><circle cx="15" cy="12" r="1.3"/><circle cx="9" cy="17" r="1.3"/><circle cx="15" cy="17" r="1.3"/></svg>'
  };

  /* ════════════════════════════════════════════════════════════════════
     STYLE
     ════════════════════════════════════════════════════════════════════ */
  var CSS = [
    '#ectd-root{position:fixed;inset:0;pointer-events:none;z-index:2147483000;',
      'font-family:"Inter",-apple-system,BlinkMacSystemFont,system-ui,sans-serif;',
      '-webkit-font-smoothing:antialiased;color:' + ONYX + ';}',
    '#ectd-root *{box-sizing:border-box;}',
    '#ectd-root button{font-family:inherit;}',

    /* ── Launcher cluster (raised so it clears page content / footers) ──── */
    '.ectd-dock{position:absolute;right:calc(22px + env(safe-area-inset-right));',
      'bottom:calc(78px + env(safe-area-inset-bottom));pointer-events:none;',
      'display:flex;flex-direction:column;align-items:flex-end;gap:10px;}',

    /* Collapsed menu is fully inert: no pointer-events AND visibility:hidden so
       neither the menu container nor its (opacity:0) pills can intercept taps
       over page content (e.g. the gallery thumbnail rail). */
    '.ectd-menu{display:flex;flex-direction:column;align-items:flex-end;gap:9px;',
      'pointer-events:none;visibility:hidden;}',
    '.ectd-menu.open{visibility:visible;}',
    /* Pills only become hit-targets when the menu is open. */
    '.ectd-menu:not(.open) .ectd-pill{pointer-events:none;}',

    '.ectd-pill{pointer-events:auto;display:flex;align-items:center;gap:11px;',
      'height:42px;padding:0 16px;border:none;cursor:pointer;',
      'border-radius:999px;background:rgba(252,250,244,0.86);',
      '-webkit-backdrop-filter:blur(14px) saturate(1.4);backdrop-filter:blur(14px) saturate(1.4);',
      'box-shadow:0 1px 0 rgba(255,255,255,0.7) inset,0 8px 22px -10px rgba(28,26,23,0.35),',
      '0 0 0 1px rgba(148,111,56,0.22);',
      'color:' + ONYX + ';white-space:nowrap;',
      'opacity:0;transform:translateY(8px) scale(0.94);transform-origin:right center;',
      'transition:background .25s ease,box-shadow .25s ease,transform .2s ease;}',
    '.ectd-menu.open .ectd-pill{animation:ectdPillIn .42s cubic-bezier(.18,.9,.22,1.08) forwards;}',
    '.ectd-pill:hover{background:rgba(252,250,244,0.97);',
      'box-shadow:0 1px 0 rgba(255,255,255,0.8) inset,0 10px 26px -10px rgba(28,26,23,0.42),',
      '0 0 0 1px rgba(148,111,56,0.5);transform:translateY(-1px) scale(1.01);}',
    '.ectd-pill:active{transform:scale(.97);}',
    '.ectd-pill .ectd-plabel{font-size:12.5px;font-weight:500;letter-spacing:.02em;order:1;}',
    '.ectd-pill .ectd-picon{order:2;width:18px;height:18px;color:' + BRONZE + ';',
      'display:flex;align-items:center;justify-content:center;flex:0 0 auto;}',
    '.ectd-pill .ectd-picon svg{width:18px;height:18px;}',
    '@keyframes ectdPillIn{from{opacity:0;transform:translateY(10px) scale(.92);}',
      'to{opacity:1;transform:translateY(0) scale(1);}}',

    /* ── Launcher FAB ─────────────────────────────────────────────────── */
    '.ectd-fab{pointer-events:auto;width:52px;height:52px;border-radius:50%;',
      'border:none;cursor:pointer;position:relative;display:flex;align-items:center;',
      'justify-content:center;color:' + BRONZE + ';',
      'background:radial-gradient(120% 120% at 30% 25%,#ffffff 0%,#FCFAF4 48%,#F2ECDD 100%);',
      'box-shadow:0 1px 0 rgba(255,255,255,0.9) inset,0 0 0 1px rgba(148,111,56,0.55),',
      '0 0 0 4px rgba(148,111,56,0.07),0 14px 30px -12px rgba(28,26,23,0.45);',
      'transition:transform .28s cubic-bezier(.2,.8,.2,1),box-shadow .28s ease;}',
    '.ectd-fab:hover{transform:translateY(-2px);',
      'box-shadow:0 1px 0 rgba(255,255,255,0.95) inset,0 0 0 1px rgba(148,111,56,0.75),',
      '0 0 0 5px rgba(148,111,56,0.1),0 18px 38px -12px rgba(28,26,23,0.5);}',
    '.ectd-fab:active{transform:scale(.95);}',
    '.ectd-fab svg{width:23px;height:23px;transition:transform .35s cubic-bezier(.2,.8,.2,1);}',
    '.ectd-dock.open .ectd-fab{color:' + ONYX + ';}',
    '.ectd-dock.open .ectd-fab svg{transform:rotate(135deg);}',
    '.ectd-fab:focus-visible{outline:2px solid ' + BRONZE + ';outline-offset:3px;}',
    '.ectd-pill:focus-visible{outline:2px solid ' + BRONZE + ';outline-offset:2px;}',

    /* ── WINDOW (shared chrome for EMI · Price · FSI) ──────────────────── */
    '.ectd-win{position:absolute;width:420px;max-width:calc(100vw - 24px);',
      'max-height:calc(100vh - 24px);pointer-events:auto;border-radius:20px;overflow:hidden;',
      'display:flex;flex-direction:column;',
      'background:rgba(252,250,244,0.94);',
      '-webkit-backdrop-filter:blur(22px) saturate(1.5);backdrop-filter:blur(22px) saturate(1.5);',
      'box-shadow:0 1px 0 rgba(255,255,255,0.7) inset,0 0 0 1px rgba(148,111,56,0.22),',
      '0 40px 80px -28px rgba(28,26,23,0.5),0 12px 30px -16px rgba(28,26,23,0.3);',
      'opacity:0;transform:scale(.96) translateY(6px);transform-origin:center;',
      'transition:opacity .26s ease,transform .3s cubic-bezier(.2,.9,.25,1.05);}',
    '.ectd-win.show{opacity:1;transform:scale(1) translateY(0);}',
    '.ectd-win.wide{width:540px;}',
    '.ectd-titlebar{display:flex;align-items:center;gap:10px;height:50px;flex:0 0 auto;',
      'padding:0 8px 0 18px;cursor:grab;touch-action:none;user-select:none;',
      '-webkit-user-select:none;',
      'background:linear-gradient(180deg,rgba(255,255,255,0.5),rgba(255,255,255,0));',
      'border-bottom:1px solid rgba(148,111,56,0.16);}',
    '.ectd-titlebar:active{cursor:grabbing;}',
    '.ectd-tb-grip{width:18px;height:18px;color:rgba(148,111,56,0.55);flex:0 0 auto;}',
    '.ectd-tb-grip svg{width:18px;height:18px;}',
    '.ectd-tb-title{font-family:"Cormorant Garamond",serif;font-size:21px;font-weight:500;',
      'letter-spacing:.01em;flex:1;line-height:1;}',
    '.ectd-tb-close{width:32px;height:32px;border-radius:50%;border:none;cursor:pointer;',
      'background:transparent;color:' + ONYX + ';display:flex;align-items:center;justify-content:center;',
      'transition:background .2s ease,color .2s ease;flex:0 0 auto;}',
    '.ectd-tb-close:hover{background:rgba(148,111,56,0.12);color:' + BRONZE + ';}',
    '.ectd-tb-close svg{width:16px;height:16px;}',

    '.ectd-body{padding:18px 20px 22px;overflow-y:auto;-webkit-overflow-scrolling:touch;}',
    '.ectd-hero{text-align:center;padding:4px 0 16px;}',
    '.ectd-hero-lbl{font-size:10.5px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;',
      'color:rgba(28,26,23,0.5);}',
    '.ectd-hero-num{font-family:"Cormorant Garamond",serif;font-weight:500;',
      'font-size:46px;line-height:1.02;letter-spacing:.005em;color:' + ONYX + ';margin-top:2px;}',
    '.ectd-hero-num .ectd-mo{font-family:"Inter",sans-serif;font-size:13px;font-weight:500;',
      'color:rgba(28,26,23,0.45);letter-spacing:.02em;}',

    '.ectd-field{margin-top:14px;}',
    '.ectd-field-top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:7px;}',
    '.ectd-field-lbl{font-size:11.5px;font-weight:500;letter-spacing:.04em;color:rgba(28,26,23,0.6);',
      'text-transform:uppercase;}',
    '.ectd-field-val{font-family:"Cormorant Garamond",serif;font-size:18px;font-weight:500;color:' + BRONZE + ';}',
    '.ectd-range{-webkit-appearance:none;appearance:none;width:100%;height:4px;border-radius:99px;',
      'background:rgba(148,111,56,0.18);outline:none;cursor:pointer;}',
    '.ectd-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;',
      'border-radius:50%;background:' + PAPER + ';border:1.5px solid ' + BRONZE + ';cursor:grab;',
      'box-shadow:0 2px 6px -1px rgba(28,26,23,0.35);transition:transform .15s ease;}',
    '.ectd-range::-webkit-slider-thumb:active{cursor:grabbing;transform:scale(1.12);}',
    '.ectd-range::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:' + PAPER + ';',
      'border:1.5px solid ' + BRONZE + ';cursor:grab;box-shadow:0 2px 6px -1px rgba(28,26,23,0.35);}',

    '.ectd-out{display:flex;gap:10px;margin-top:20px;}',
    '.ectd-out-card{flex:1;padding:11px 13px;border-radius:13px;background:rgba(148,111,56,0.06);',
      'border:1px solid rgba(148,111,56,0.14);}',
    '.ectd-out-lbl{font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;',
      'color:rgba(28,26,23,0.5);}',
    '.ectd-out-val{font-family:"Cormorant Garamond",serif;font-size:21px;font-weight:500;margin-top:3px;',
      'color:' + ONYX + ';line-height:1;}',

    /* ── Hero result row (Price total / calc hero) ─────────────────────── */
    '.ectd-result-hero{text-align:center;padding:2px 0 8px;}',
    '.ectd-result-hero .ectd-hero-num{color:' + COPPER + ';}',

    /* ── Segmented chips (BHK selector, unit cycle) ────────────────────── */
    '.ectd-seg{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;}',
    '.ectd-chip{flex:1 1 auto;min-width:0;padding:8px 10px;border-radius:10px;cursor:pointer;',
      'border:1px solid rgba(148,111,56,0.22);background:' + PAPER + ';color:' + ONYX + ';',
      'font-size:11px;font-weight:500;letter-spacing:.02em;text-align:center;white-space:nowrap;',
      'transition:background .18s ease,border-color .18s ease,color .18s ease;}',
    '.ectd-chip:hover{border-color:rgba(148,111,56,0.5);background:rgba(148,111,56,0.05);}',
    '.ectd-chip.sel{background:linear-gradient(135deg,#D87A2E 0%,#B8591A 100%);color:#fff;',
      'border-color:' + COPPER + ';box-shadow:0 4px 12px -4px rgba(184,89,26,0.5);}',

    /* ── Inline stepper (floor / unit) ─────────────────────────────────── */
    '.ectd-stepper{display:flex;align-items:center;gap:8px;margin-top:8px;}',
    '.ectd-step-btn{width:32px;height:32px;border-radius:50%;border:1px solid rgba(148,111,56,0.22);',
      'background:' + PAPER + ';color:' + BRONZE + ';cursor:pointer;flex:0 0 auto;',
      'display:flex;align-items:center;justify-content:center;font-size:17px;line-height:1;',
      'transition:background .18s ease,border-color .18s ease;}',
    '.ectd-step-btn:hover{background:rgba(148,111,56,0.08);border-color:rgba(148,111,56,0.5);}',
    '.ectd-step-val{flex:1;text-align:center;font-family:"Cormorant Garamond",serif;font-size:20px;',
      'font-weight:500;color:' + ONYX + ';}',

    /* ── Breakdown table (Price Sheet) ─────────────────────────────────── */
    '.ectd-tbl{width:100%;border-collapse:collapse;margin-top:14px;}',
    '.ectd-tbl td{font-size:12px;padding:8px 0;border-bottom:1px solid rgba(148,111,56,0.12);',
      'color:rgba(28,26,23,0.82);font-variant-numeric:tabular-nums;}',
    '.ectd-tbl td:last-child{text-align:right;font-weight:500;color:' + ONYX + ';}',
    '.ectd-tbl tr.ectd-tr-sub td{color:' + COPPER + ';font-weight:600;font-size:10.5px;',
      'letter-spacing:.12em;text-transform:uppercase;border-bottom:1px solid rgba(148,111,56,0.28);}',
    '.ectd-tbl tr.ectd-tr-sub td:last-child{font-size:13px;}',
    '.ectd-tbl tr.ectd-tr-total td{border-bottom:none;padding-top:12px;',
      'font-family:"Cormorant Garamond",serif;font-size:18px;font-weight:500;color:' + COPPER + ';',
      'letter-spacing:.01em;}',
    '.ectd-tbl tr.ectd-tr-total td:last-child{font-size:24px;}',

    '.ectd-note{font-size:10.5px;line-height:1.5;color:rgba(28,26,23,0.5);margin-top:14px;}',

    /* ── ANNOTATE ─────────────────────────────────────────────────────── */
    '.ectd-canvas{position:fixed;inset:0;width:100vw;height:100vh;pointer-events:auto;',
      'touch-action:none;cursor:crosshair;z-index:2147483200;}',
    '.ectd-anno-bar{position:fixed;left:50%;',
      'bottom:calc(22px + env(safe-area-inset-bottom));pointer-events:auto;z-index:2147483300;',
      'display:flex;align-items:center;gap:6px;padding:7px 9px;border-radius:999px;',
      'background:rgba(252,250,244,0.92);',
      '-webkit-backdrop-filter:blur(16px) saturate(1.4);backdrop-filter:blur(16px) saturate(1.4);',
      'box-shadow:0 1px 0 rgba(255,255,255,0.7) inset,0 0 0 1px rgba(148,111,56,0.25),',
      '0 16px 40px -16px rgba(28,26,23,0.5);',
      'opacity:0;transform:translate(-50%,8px);transition:opacity .25s ease,transform .25s ease;}',
    '.ectd-anno-bar.show{opacity:1;transform:translate(-50%,0);}',
    '.ectd-sw{width:24px;height:24px;border-radius:50%;border:1.5px solid rgba(28,26,23,0.12);',
      'cursor:pointer;padding:0;transition:transform .15s ease,box-shadow .15s ease;}',
    '.ectd-sw:hover{transform:scale(1.1);}',
    '.ectd-sw.sel{box-shadow:0 0 0 2px ' + PAPER + ',0 0 0 3.5px ' + BRONZE + ';transform:scale(1.06);}',
    '.ectd-sep{width:1px;height:22px;background:rgba(148,111,56,0.22);margin:0 3px;}',
    '.ectd-sizes{display:flex;align-items:center;gap:5px;}',
    '.ectd-size{width:26px;height:26px;border-radius:50%;border:none;cursor:pointer;background:transparent;',
      'display:flex;align-items:center;justify-content:center;transition:background .18s ease;}',
    '.ectd-size:hover{background:rgba(148,111,56,0.1);}',
    '.ectd-size .ectd-dot{border-radius:50%;background:' + ONYX + ';display:block;}',
    '.ectd-size.sel{background:rgba(148,111,56,0.16);}',
    '.ectd-abtn{height:30px;padding:0 12px;border:none;cursor:pointer;border-radius:99px;',
      'background:transparent;color:' + ONYX + ';display:flex;align-items:center;gap:6px;',
      'font-size:12px;font-weight:500;letter-spacing:.02em;transition:background .18s ease;}',
    '.ectd-abtn:hover{background:rgba(148,111,56,0.1);}',
    '.ectd-abtn svg{width:16px;height:16px;}',
    '.ectd-abtn.primary{background:' + BRONZE + ';color:' + PAPER + ';padding:0 14px;}',
    '.ectd-abtn.primary:hover{background:#7d5d2e;}',
    '.ectd-abtn.icon{padding:0 9px;}',

    /* ── Toast ────────────────────────────────────────────────────────── */
    '.ectd-toast{position:fixed;left:50%;bottom:calc(80px + env(safe-area-inset-bottom));',
      'transform:translate(-50%,12px);pointer-events:none;z-index:2147483400;',
      'padding:10px 18px;border-radius:999px;background:rgba(28,26,23,0.92);color:' + PAPER + ';',
      'font-size:12.5px;font-weight:500;letter-spacing:.02em;',
      '-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);',
      'box-shadow:0 14px 34px -14px rgba(28,26,23,0.6);',
      'opacity:0;transition:opacity .3s ease,transform .3s ease;}',
    '.ectd-toast.show{opacity:1;transform:translate(-50%,0);}',

    '@media (prefers-reduced-motion: reduce){',
      '#ectd-root *,.ectd-canvas,.ectd-anno-bar,.ectd-toast{transition:none !important;animation:none !important;}}'
  ].join('');

  /* ════════════════════════════════════════════════════════════════════
     BOOT
     ════════════════════════════════════════════════════════════════════ */
  function boot() {
    if (window.__ecToolsDockBooted || document.getElementById(ROOT_ID)) return;
    window.__ecToolsDockBooted = true;

    var style = el('style');
    style.id = 'ectd-style';
    style.textContent = CSS;
    document.head.appendChild(style);

    var root = el('div'); root.id = ROOT_ID;
    document.body.appendChild(root);

    /* ── Toast helper ─────────────────────────────────────────────────── */
    var toastTimer = null;
    function toast(msg) {
      var t = root.querySelector('.ectd-toast');
      if (!t) { t = el('div', 'ectd-toast'); root.appendChild(t); }
      t.textContent = msg;
      void t.offsetWidth;
      t.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200);
    }

    /* ════════════════════════════════════════════════════════════════
       1) LAUNCHER
       ════════════════════════════════════════════════════════════════ */
    var dock = el('div', 'ectd-dock');
    var menu = el('div', 'ectd-menu');
    menu.setAttribute('role', 'menu');

    var ITEMS = [
      { key: 'emi',   label: 'EMI Calculator', icon: ICONS.emi,   act: openEMI },
      { key: 'price', label: 'Price Sheet',    icon: ICONS.price, act: openPrice },
      { key: 'fsi',   label: 'FSI Calculator', icon: ICONS.fsi,   act: openFSI },
      { key: 'anno',  label: 'Annotate',       icon: ICONS.pen,   act: startAnnotate }
    ];

    /* Map persistable window ids → their opener, for cross-screen restore.
       (Annotate is intentionally session-ephemeral, not restored.) */

    ITEMS.forEach(function (it) {
      var pill = el('button', 'ectd-pill');
      pill.type = 'button';
      pill.setAttribute('role', 'menuitem');
      pill.setAttribute('aria-label', it.label);
      pill.innerHTML = '<span class="ectd-plabel">' + it.label + '</span>' +
                       '<span class="ectd-picon">' + it.icon + '</span>';
      pill.addEventListener('click', function (e) {
        e.stopPropagation();
        closeMenu();
        it.act();
      });
      menu.appendChild(pill);
    });

    var fab = el('button', 'ectd-fab');
    fab.type = 'button';
    fab.setAttribute('role', 'button');
    fab.setAttribute('aria-label', 'Tools');
    fab.setAttribute('aria-expanded', 'false');
    fab.innerHTML = ICONS.tools;

    dock.appendChild(menu);
    dock.appendChild(fab);
    root.appendChild(dock);

    var menuOpen = false;
    function applyStagger() {
      var pills = menu.querySelectorAll('.ectd-pill');
      var n = pills.length;
      for (var i = 0; i < n; i++) {
        pills[i].style.animationDelay = ((n - 1 - i) * 42) + 'ms';
      }
    }
    function openMenu() {
      if (menuOpen) return;
      menuOpen = true;
      applyStagger();
      dock.classList.add('open');
      menu.classList.add('open');
      menu.style.pointerEvents = 'auto';
      fab.setAttribute('aria-expanded', 'true');
      if (!restoring) writeState({ launcher: true });
    }
    function closeMenu() {
      if (!menuOpen) return;
      menuOpen = false;
      dock.classList.remove('open');
      menu.classList.remove('open');
      menu.style.pointerEvents = 'none';
      menu.querySelectorAll('.ectd-pill').forEach(function (p) { p.style.opacity = '0'; });
      fab.setAttribute('aria-expanded', 'false');
      if (!restoring) writeState({ launcher: false });
    }
    function toggleMenu() { menuOpen ? closeMenu() : openMenu(); }

    fab.addEventListener('click', function (e) { e.stopPropagation(); toggleMenu(); });
    fab.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMenu(); }
    });
    document.addEventListener('pointerdown', function (e) {
      if (menuOpen && !dock.contains(e.target)) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuOpen) closeMenu();
    });

    /* ════════════════════════════════════════════════════════════════
       2) WINDOW FACTORY  (shared draggable, non-modal chrome)
       ════════════════════════════════════════════════════════════════
       openWindow({ id, title, wide, bodyHTML, onMount }) → window state.
       Each tool keeps a single live instance (re-opening focuses it) and
       remembers its last position for the session. Many may be open at once.
       ──────────────────────────────────────────────────────────────── */
    var WINDOWS = {};   // id → { win, pos }

    /* ── Session persistence ──────────────────────────────────────────────
       Remember which tool windows are open + their positions (and the
       launcher open/closed state) so an opened tool stays put as the user
       navigates between screens, until they close it. */
    var PERSIST_KEY = 'ec.toolsDock.v1';
    var OPENERS = {};   // id → opener fn (registered as each tool is defined)
    var restoring = false;

    function readState() {
      try { return JSON.parse(sessionStorage.getItem(PERSIST_KEY)) || {}; }
      catch (e) { return {}; }
    }
    function writeState(patch) {
      var s = readState();
      for (var k in patch) s[k] = patch[k];
      try { sessionStorage.setItem(PERSIST_KEY, JSON.stringify(s)); } catch (e) {}
    }
    function persistWindows() {
      if (restoring) return;
      var open = {};
      for (var k in WINDOWS) {
        var rec = WINDOWS[k];
        if (rec && rec.win) open[k] = rec.pos || null;
      }
      writeState({ windows: open });
    }

    function openWindow(opts) {
      var rec = WINDOWS[opts.id] || (WINDOWS[opts.id] = { win: null, pos: null });
      if (rec.win) { rec.win.classList.add('show'); bringFront(rec.win); return rec; }

      var win = el('div', 'ectd-win' + (opts.wide ? ' wide' : ''));
      win.setAttribute('role', 'dialog');
      win.setAttribute('aria-label', opts.title);
      win.innerHTML =
        '<div class="ectd-titlebar" data-drag>' +
          '<span class="ectd-tb-grip">' + ICONS.grip + '</span>' +
          '<span class="ectd-tb-title">' + opts.title + '</span>' +
          '<button class="ectd-tb-close" type="button" aria-label="Close">' + ICONS.close + '</button>' +
        '</div>' +
        '<div class="ectd-body">' + (opts.bodyHTML || '') + '</div>';
      root.appendChild(win);
      rec.win = win;

      placeWindow(win, rec.pos);
      bringFront(win);
      win.addEventListener('pointerdown', function () { bringFront(win); });
      win.querySelector('.ectd-tb-close').addEventListener('click', function () { closeWindow(opts.id); });
      makeDraggable(win, win.querySelector('[data-drag]'), function (p) { rec.pos = p; persistWindows(); });

      if (opts.onMount) opts.onMount(win);

      void win.offsetWidth;
      win.classList.add('show');
      persistWindows();
      return rec;
    }

    function closeWindow(id) {
      var rec = WINDOWS[id];
      if (!rec || !rec.win) return;
      var w = rec.win; rec.win = null;
      w.classList.remove('show');
      setTimeout(function () { if (w.parentNode) w.parentNode.removeChild(w); }, 280);
      persistWindows();
    }
    function anyWindowOpen() {
      for (var k in WINDOWS) { if (WINDOWS[k] && WINDOWS[k].win) return true; }
      return false;
    }
    function closeTopWindow() {
      // close the most recently focused (highest z) open window
      var best = null, bestZ = -1;
      for (var k in WINDOWS) {
        var w = WINDOWS[k] && WINDOWS[k].win;
        if (!w) continue;
        var z = +w.style.zIndex || 0;
        if (z >= bestZ) { bestZ = z; best = k; }
      }
      if (best) closeWindow(best);
    }

    var zTop = 10;
    function bringFront(win) { win.style.zIndex = String(++zTop); }

    function placeWindow(win, pos) {
      win.style.left = '-9999px'; win.style.top = '-9999px';
      var r = win.getBoundingClientRect();
      var vw = window.innerWidth, vh = window.innerHeight, x, y;
      if (pos) {
        x = pos.x; y = pos.y;
      } else {
        // centered-ish, with a small cascade so stacked windows don't fully overlap
        var idx = Object.keys(WINDOWS).length;
        var off = ((idx - 1) % 4) * 26;
        x = Math.max(12, (vw - r.width) / 2) + off;
        y = Math.max(40, vh * 0.5 - r.height * 0.55) + off;
      }
      x = clamp(x, 8, Math.max(8, vw - r.width - 8));
      y = clamp(y, 8, Math.max(8, vh - r.height - 8));
      win.style.left = x + 'px'; win.style.top = y + 'px';
    }

    function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

    function makeDraggable(win, handle, onMove) {
      var dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;
      handle.addEventListener('pointerdown', function (e) {
        if (e.target.closest('.ectd-tb-close')) return;
        dragging = true;
        bringFront(win);
        var r = win.getBoundingClientRect();
        ox = r.left; oy = r.top; sx = e.clientX; sy = e.clientY;
        try { handle.setPointerCapture(e.pointerId); } catch (err) {}
        e.preventDefault();
      });
      handle.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var vw = window.innerWidth, vh = window.innerHeight;
        var r = win.getBoundingClientRect();
        var x = clamp(ox + (e.clientX - sx), 8, Math.max(8, vw - r.width - 8));
        var y = clamp(oy + (e.clientY - sy), 8, Math.max(8, vh - r.height - 8));
        win.style.left = x + 'px'; win.style.top = y + 'px';
        if (onMove) onMove({ x: x, y: y });
      });
      function end(e) {
        if (!dragging) return;
        dragging = false;
        try { handle.releasePointerCapture(e.pointerId); } catch (err) {}
      }
      handle.addEventListener('pointerup', end);
      handle.addEventListener('pointercancel', end);
    }

    function field(id, label, val, min, max, step) {
      return '<div class="ectd-field">' +
        '<div class="ectd-field-top">' +
          '<span class="ectd-field-lbl">' + label + '</span>' +
          '<span class="ectd-field-val" data-val="' + id + '"></span>' +
        '</div>' +
        '<input id="ectd-' + id + '" class="ectd-range" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '">' +
      '</div>';
    }

    /* ════════════════════════════════════════════════════════════════
       2a) EMI WINDOW
       ════════════════════════════════════════════════════════════════ */
    var EMI_DEFAULTS = { amount: 50000000, rate: 8.5, years: 20 };

    function openEMI() {
      openWindow({
        id: 'emi',
        title: 'EMI Calculator',
        bodyHTML:
          '<div class="ectd-hero">' +
            '<div class="ectd-hero-lbl">Monthly EMI</div>' +
            '<div class="ectd-hero-num" data-emi>—<span class="ectd-mo"> /mo</span></div>' +
          '</div>' +
          field('amt', 'Loan Amount', EMI_DEFAULTS.amount, 1000000, 1000000000, 1000000) +
          field('rate', 'Interest Rate', EMI_DEFAULTS.rate, 5, 18, 0.05) +
          field('yrs', 'Tenure', EMI_DEFAULTS.years, 1, 30, 1) +
          '<div class="ectd-out">' +
            '<div class="ectd-out-card"><div class="ectd-out-lbl">Total Interest</div><div class="ectd-out-val" data-int>—</div></div>' +
            '<div class="ectd-out-card"><div class="ectd-out-lbl">Total Payable</div><div class="ectd-out-val" data-tot>—</div></div>' +
          '</div>',
        onMount: function (win) {
          var amt = win.querySelector('#ectd-amt'),
              rate = win.querySelector('#ectd-rate'),
              yrs = win.querySelector('#ectd-yrs');
          function recompute() {
            var P = +amt.value, R = +rate.value, Y = +yrs.value;
            win.querySelector('[data-val="amt"]').textContent = compactCr(P);
            win.querySelector('[data-val="rate"]').textContent = R.toFixed(2) + '%';
            win.querySelector('[data-val="yrs"]').textContent = Y + (Y === 1 ? ' yr' : ' yrs');
            var r = calcEMI(P, R, Y);
            win.querySelector('[data-emi]').innerHTML = rs(r.emi) + '<span class="ectd-mo"> /mo</span>';
            win.querySelector('[data-int]').textContent = rs(r.interest);
            win.querySelector('[data-tot]').textContent = rs(r.total);
          }
          [amt, rate, yrs].forEach(function (s) { s.addEventListener('input', recompute); });
          recompute();
        }
      });
    }

    /* ════════════════════════════════════════════════════════════════
       2b) PRICE SHEET WINDOW  (ported from tools.html #panelPrice)
       ════════════════════════════════════════════════════════════════ */
    var BHK_CONFIG = {
      '1bhk':  { label: '1 BHK',         area: 600,  rate: 18000 },
      '2bhk':  { label: '2 BHK',         area: 900,  rate: 18000 },
      '3bhkp': { label: '3 BHK Premium', area: 1245, rate: 18000 },
      '4bhk':  { label: '4 BHK',         area: 1800, rate: 18000 }
    };
    var UNITS = ['Unit 01', 'Unit 02', 'Unit 03', 'Unit 04', 'Unit 05', 'Unit 06'];
    var PRICE_STATE = { floor: 12, bhk: '3bhkp', unit: 'Unit 03', tower: 'Tower A' };

    function ordinal(n) {
      var s = ['th', 'st', 'nd', 'rd'], v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }

    function openPrice() {
      openWindow({
        id: 'price',
        title: 'Price Sheet',
        bodyHTML:
          '<div class="ectd-field"><span class="ectd-field-lbl">Select Floor</span>' +
            '<div class="ectd-stepper">' +
              '<button class="ectd-step-btn" type="button" data-floor="-1" aria-label="Lower floor">−</button>' +
              '<span class="ectd-step-val" data-floor-val></span>' +
              '<button class="ectd-step-btn" type="button" data-floor="1" aria-label="Higher floor">+</button>' +
            '</div>' +
          '</div>' +
          '<div class="ectd-field"><span class="ectd-field-lbl">Select Unit Type</span>' +
            '<div class="ectd-seg" data-bhk-row>' +
              Object.keys(BHK_CONFIG).map(function (k) {
                return '<button class="ectd-chip" type="button" data-bhk="' + k + '">' + BHK_CONFIG[k].label + '</button>';
              }).join('') +
            '</div>' +
          '</div>' +
          '<div class="ectd-field"><span class="ectd-field-lbl">Select Unit</span>' +
            '<div class="ectd-stepper">' +
              '<button class="ectd-step-btn" type="button" data-unit="-1" aria-label="Previous unit">‹</button>' +
              '<span class="ectd-step-val" data-unit-val></span>' +
              '<button class="ectd-step-btn" type="button" data-unit="1" aria-label="Next unit">›</button>' +
            '</div>' +
          '</div>' +
          '<table class="ectd-tbl">' +
            '<tbody>' +
              '<tr><td>Basic Sale Price</td><td data-basic></td></tr>' +
              '<tr><td>Preferential Location Charges</td><td data-plc></td></tr>' +
              '<tr><td>Other Charges</td><td data-other></td></tr>' +
              '<tr><td>Car Parking (2 Nos.)</td><td>' + rs(1000000) + '</td></tr>' +
              '<tr class="ectd-tr-sub"><td>Sub Total</td><td data-sub></td></tr>' +
              '<tr><td>GST &amp; Taxes</td><td data-tax></td></tr>' +
              '<tr class="ectd-tr-total"><td>Total Price</td><td data-total></td></tr>' +
            '</tbody>' +
          '</table>' +
          '<p class="ectd-note">Indicative figures. ₹18,000 / Sq.Ft. base. Final pricing per registered agreement.</p>',
        onMount: function (win) {
          function render() {
            var cfg = BHK_CONFIG[PRICE_STATE.bhk];
            var area = cfg.area;
            var bsp = area * cfg.rate;
            var plc = area * 1000;
            var other = Math.round(876000 * (area / 1245));
            var parking = 1000000;
            var sub = bsp + plc + other + parking;
            var tax = Math.round(sub * 0.09);
            var total = sub + tax;

            win.querySelector('[data-floor-val]').textContent = ordinal(PRICE_STATE.floor) + ' Floor';
            win.querySelector('[data-unit-val]').textContent = PRICE_STATE.unit;
            win.querySelector('[data-basic]').textContent = rs(bsp);
            win.querySelector('[data-plc]').textContent   = rs(plc);
            win.querySelector('[data-other]').textContent = rs(other);
            win.querySelector('[data-sub]').textContent   = rs(sub);
            win.querySelector('[data-tax]').textContent   = rs(tax);
            win.querySelector('[data-total]').textContent = rs(total);

            win.querySelectorAll('[data-bhk]').forEach(function (b) {
              b.classList.toggle('sel', b.getAttribute('data-bhk') === PRICE_STATE.bhk);
            });
          }
          win.querySelectorAll('[data-floor]').forEach(function (b) {
            b.addEventListener('click', function () {
              var step = +b.getAttribute('data-floor');
              PRICE_STATE.floor = clamp(PRICE_STATE.floor + step, 1, 79);
              render();
            });
          });
          win.querySelectorAll('[data-bhk]').forEach(function (b) {
            b.addEventListener('click', function () { PRICE_STATE.bhk = b.getAttribute('data-bhk'); render(); });
          });
          win.querySelectorAll('[data-unit]').forEach(function (b) {
            b.addEventListener('click', function () {
              var i = UNITS.indexOf(PRICE_STATE.unit);
              var dir = +b.getAttribute('data-unit');
              PRICE_STATE.unit = UNITS[(i + dir + UNITS.length) % UNITS.length];
              render();
            });
          });
          render();
        }
      });
    }

    /* ════════════════════════════════════════════════════════════════
       2c) FSI CALCULATOR WINDOW  (ported from tools.html #panelFSI)
       ════════════════════════════════════════════════════════════════ */
    var FSI_DEFAULTS = { plot: 50000, ratio: 4.0, margin: 12 };

    function openFSI() {
      openWindow({
        id: 'fsi',
        title: 'FSI Calculator',
        bodyHTML:
          '<div class="ectd-result-hero">' +
            '<div class="ectd-hero-lbl">Permissible Built-up Area</div>' +
            '<div class="ectd-hero-num" data-built>—<span class="ectd-mo"> Sq.Ft.</span></div>' +
          '</div>' +
          field('fsiPlot', 'Plot Area', FSI_DEFAULTS.plot, 5000, 200000, 500) +
          field('fsiRatio', 'Permissible FSI', FSI_DEFAULTS.ratio, 1.0, 6.0, 0.1) +
          field('fsiMargin', 'Side Margins', FSI_DEFAULTS.margin, 6, 30, 1) +
          '<div class="ectd-out">' +
            '<div class="ectd-out-card"><div class="ectd-out-lbl">Carpet (~75%)</div><div class="ectd-out-val" data-carpet>—</div></div>' +
            '<div class="ectd-out-card"><div class="ectd-out-lbl">Setback Area</div><div class="ectd-out-val" data-setback>—</div></div>' +
          '</div>' +
          '<p class="ectd-note">Indicative per Mumbai DCR norms. Setback uses perimeter × margin assuming a square plot.</p>',
        onMount: function (win) {
          var plot = win.querySelector('#ectd-fsiPlot'),
              ratio = win.querySelector('#ectd-fsiRatio'),
              margin = win.querySelector('#ectd-fsiMargin');
          function render() {
            var p = +plot.value, ra = +ratio.value, m = +margin.value;
            var built = p * ra;
            var carpet = built * 0.75;
            var side = Math.sqrt(Math.max(0, p));
            var setback = Math.max(0, 4 * side * m - 4 * m * m);
            win.querySelector('[data-val="fsiPlot"]').textContent = fmtIN(p) + ' Sq.Ft.';
            win.querySelector('[data-val="fsiRatio"]').textContent = ra.toFixed(1);
            win.querySelector('[data-val="fsiMargin"]').textContent = m + (m === 1 ? ' ft' : ' ft');
            win.querySelector('[data-built]').innerHTML = fmtIN(built) + '<span class="ectd-mo"> Sq.Ft.</span>';
            win.querySelector('[data-carpet]').textContent = fmtIN(carpet);
            win.querySelector('[data-setback]').textContent = fmtIN(setback);
          }
          [plot, ratio, margin].forEach(function (s) { s.addEventListener('input', render); });
          render();
        }
      });
    }

    /* ════════════════════════════════════════════════════════════════
       3) ANNOTATE  (full-viewport canvas, smooth freehand)
       ════════════════════════════════════════════════════════════════ */
    var anno = null;

    function startAnnotate() {
      if (anno) return;
      var dpr = window.devicePixelRatio || 1;
      var canvas = el('canvas', 'ectd-canvas');
      sizeCanvas(canvas, dpr);
      var ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';

      var bar = el('div', 'ectd-anno-bar');
      var colors = [
        { name: 'Bronze', val: BRONZE },
        { name: 'Red',    val: '#C0392B' },
        { name: 'Onyx',   val: ONYX },
        { name: 'White',  val: '#FFFFFF' }
      ];
      var swHTML = colors.map(function (c, i) {
        return '<button class="ectd-sw' + (i === 0 ? ' sel' : '') + '" type="button" aria-label="' + c.name +
               '" data-color="' + c.val + '" style="background:' + c.val + '"></button>';
      }).join('');
      var sizeHTML =
        '<button class="ectd-size sel" type="button" aria-label="Thin pen" data-size="3"><span class="ectd-dot" style="width:5px;height:5px"></span></button>' +
        '<button class="ectd-size" type="button" aria-label="Thick pen" data-size="7"><span class="ectd-dot" style="width:11px;height:11px"></span></button>';
      bar.innerHTML =
        swHTML +
        '<span class="ectd-sep"></span>' +
        '<span class="ectd-sizes">' + sizeHTML + '</span>' +
        '<span class="ectd-sep"></span>' +
        '<button class="ectd-abtn icon" type="button" data-act="undo" aria-label="Undo">' + ICONS.undo + '</button>' +
        '<button class="ectd-abtn icon" type="button" data-act="clear" aria-label="Clear">' + ICONS.clear + '</button>' +
        '<button class="ectd-abtn icon" type="button" data-act="shot" aria-label="Save screenshot with annotations">' + ICONS.shot + '</button>' +
        '<button class="ectd-abtn primary" type="button" data-act="done">' + ICONS.check + '<span>Done</span></button>';

      root.appendChild(canvas);
      root.appendChild(bar);

      anno = { canvas: canvas, ctx: ctx, bar: bar, strokes: [], current: null,
               color: BRONZE, size: 3, dpr: dpr };

      bar.querySelectorAll('.ectd-sw').forEach(function (b) {
        b.addEventListener('click', function () {
          bar.querySelectorAll('.ectd-sw').forEach(function (x) { x.classList.remove('sel'); });
          b.classList.add('sel');
          anno.color = b.getAttribute('data-color');
        });
      });
      bar.querySelectorAll('.ectd-size').forEach(function (b) {
        b.addEventListener('click', function () {
          bar.querySelectorAll('.ectd-size').forEach(function (x) { x.classList.remove('sel'); });
          b.classList.add('sel');
          anno.size = +b.getAttribute('data-size');
        });
      });
      bar.querySelectorAll('[data-act]').forEach(function (b) {
        b.addEventListener('click', function () {
          var a = b.getAttribute('data-act');
          if (a === 'undo') undoStroke();
          else if (a === 'clear') clearStrokes();
          else if (a === 'shot') takeScreenshot();
          else if (a === 'done') stopAnnotate();
        });
      });

      canvas.addEventListener('pointerdown', annoDown);
      canvas.addEventListener('pointermove', annoMove);
      canvas.addEventListener('pointerup', annoUp);
      canvas.addEventListener('pointercancel', annoUp);
      canvas.addEventListener('pointerleave', annoUp);

      window.addEventListener('resize', annoResize);

      void bar.offsetWidth;
      bar.classList.add('show');
    }

    function sizeCanvas(canvas, dpr) {
      var w = window.innerWidth, h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
    }

    function annoResize() {
      if (!anno) return;
      anno.dpr = window.devicePixelRatio || 1;
      sizeCanvas(anno.canvas, anno.dpr);
      anno.ctx.setTransform(1, 0, 0, 1, 0, 0);
      anno.ctx.scale(anno.dpr, anno.dpr);
      anno.ctx.lineCap = 'round'; anno.ctx.lineJoin = 'round';
      redrawStrokes();
    }

    function evtPt(e) {
      var r = anno.canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    function annoDown(e) {
      if (!anno) return;
      try { anno.canvas.setPointerCapture(e.pointerId); } catch (err) {}
      anno.current = { color: anno.color, size: anno.size, pts: [evtPt(e)] };
      e.preventDefault();
    }
    function annoMove(e) {
      if (!anno || !anno.current) return;
      anno.current.pts.push(evtPt(e));
      redrawStrokes();
    }
    function annoUp(e) {
      if (!anno || !anno.current) return;
      if (anno.current.pts.length > 0) anno.strokes.push(anno.current);
      anno.current = null;
      try { anno.canvas.releasePointerCapture(e.pointerId); } catch (err) {}
    }
    function drawStroke(ctx, s) {
      var pts = s.pts;
      if (!pts.length) return;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.size;
      ctx.beginPath();
      if (pts.length < 3) {
        ctx.moveTo(pts[0].x, pts[0].y);
        for (var k = 1; k < pts.length; k++) ctx.lineTo(pts[k].x, pts[k].y);
        if (pts.length === 1) ctx.lineTo(pts[0].x + 0.1, pts[0].y + 0.1);
        ctx.stroke();
        return;
      }
      ctx.moveTo(pts[0].x, pts[0].y);
      for (var i = 1; i < pts.length - 1; i++) {
        var mx = (pts[i].x + pts[i + 1].x) / 2;
        var my = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
      }
      var last = pts[pts.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
    }
    function redrawStrokes() {
      var ctx = anno.ctx;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (var i = 0; i < anno.strokes.length; i++) drawStroke(ctx, anno.strokes[i]);
      if (anno.current) drawStroke(ctx, anno.current);
    }
    function undoStroke() { if (anno && anno.strokes.length) { anno.strokes.pop(); redrawStrokes(); } }
    function clearStrokes() { if (anno) { anno.strokes = []; anno.current = null; redrawStrokes(); } }

    function stopAnnotate() {
      if (!anno) return;
      var a = anno; anno = null;
      window.removeEventListener('resize', annoResize);
      a.bar.classList.remove('show');
      setTimeout(function () {
        if (a.canvas.parentNode) a.canvas.parentNode.removeChild(a.canvas);
        if (a.bar.parentNode) a.bar.parentNode.removeChild(a.bar);
      }, 260);
    }

    /* ════════════════════════════════════════════════════════════════
       4) SCREENSHOT  (html2canvas, composites annotations)
          Reached only from inside Annotate (the camera button).
       ════════════════════════════════════════════════════════════════ */
    var h2cLoading = null;
    function ensureH2C() {
      if (window.html2canvas) return Promise.resolve(window.html2canvas);
      if (h2cLoading) return h2cLoading;
      h2cLoading = new Promise(function (resolve, reject) {
        var s = el('script');
        s.src = 'assets/html2canvas.min.js';
        s.onload = function () { window.html2canvas ? resolve(window.html2canvas) : reject(new Error('no h2c')); };
        s.onerror = function () { reject(new Error('load fail')); };
        document.head.appendChild(s);
      });
      return h2cLoading;
    }

    function takeScreenshot() {
      toast('Capturing…');
      ensureH2C().then(function (h2c) {
        var dpr = window.devicePixelRatio || 1;
        var hidden = [dock];
        var toastEl = root.querySelector('.ectd-toast');
        if (toastEl) hidden.push(toastEl);
        if (anno) hidden.push(anno.bar);
        hidden.forEach(function (n) { n.style.visibility = 'hidden'; });

        return h2c(document.body, {
          backgroundColor: PAPER,
          scale: dpr,
          useCORS: true,
          logging: false,
          windowWidth: document.documentElement.clientWidth,
          windowHeight: document.documentElement.clientHeight,
          ignoreElements: function (node) {
            return node === (anno && anno.canvas) || node === dock;
          }
        }).then(function (base) {
          hidden.forEach(function (n) { n.style.visibility = ''; });
          if (anno && anno.canvas) {
            var out = el('canvas');
            out.width = base.width; out.height = base.height;
            var octx = out.getContext('2d');
            octx.drawImage(base, 0, 0);
            octx.drawImage(anno.canvas, 0, 0, anno.canvas.width, anno.canvas.height, 0, 0, base.width, base.height);
            return out;
          }
          return base;
        });
      }).then(function (canvas) {
        var name = 'embassy-citadel-' + slugPath() + '-shot.png';
        canvas.toBlob(function (blob) {
          if (!blob) { toast('Capture failed'); return; }
          var url = URL.createObjectURL(blob);
          var a = el('a'); a.href = url; a.download = name;
          document.body.appendChild(a); a.click();
          setTimeout(function () { URL.revokeObjectURL(url); if (a.parentNode) a.parentNode.removeChild(a); }, 1000);
          toast('Saved');
        }, 'image/png');
      }).catch(function (err) {
        if (dock) dock.style.visibility = '';
        toast('Screenshot unavailable');
      });
    }

    function slugPath() {
      var p = location.pathname.split('/').pop() || 'home';
      p = p.replace(/\.html?$/i, '').replace(/[^a-z0-9\-]+/gi, '-').replace(/^-+|-+$/g, '');
      return p || 'home';
    }

    /* ── global Esc: exit annotate / close top window (menu handled above) ─ */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (menuOpen) return;
      if (anno) { stopAnnotate(); return; }
      if (anyWindowOpen()) { closeTopWindow(); return; }
    });

    /* keep open windows inside the viewport on resize */
    window.addEventListener('resize', function () {
      var vw = window.innerWidth, vh = window.innerHeight;
      for (var k in WINDOWS) {
        var rec = WINDOWS[k];
        if (!rec || !rec.win) continue;
        var r = rec.win.getBoundingClientRect();
        var x = clamp(r.left, 8, Math.max(8, vw - r.width - 8));
        var y = clamp(r.top, 8, Math.max(8, vh - r.height - 8));
        rec.win.style.left = x + 'px'; rec.win.style.top = y + 'px';
        rec.pos = { x: x, y: y };
      }
      persistWindows();
    });

    /* ── Restore persisted state on every screen load ──────────────────────
       Re-open any tool windows that were open (in their saved positions) and
       restore the launcher open/closed state, so tools follow the user across
       navigation until explicitly closed. */
    function restore() {
      restoring = true;
      var s = readState();
      var wins = s.windows || {};
      Object.keys(wins).forEach(function (id) {
        var opener = (id==="emi")?openEMI:(id==="price")?openPrice:(id==="fsi")?openFSI:null;
        if (!opener) return;
        opener();                                  // builds the window
        var rec = WINDOWS[id];
        if (rec && wins[id]) {                     // re-apply saved position
          rec.pos = wins[id];
          placeWindow(rec.win, rec.pos);
        }
      });
      if (s.launcher) openMenu();
      restoring = false;
    }
    restore();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

;(function(){try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();}catch(e){}})();
