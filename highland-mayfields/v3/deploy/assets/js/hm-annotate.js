/* ============================================================
   ANNOTATE — Highland Mayfields  ·  window.HMAnnotate
   Self-contained, file://-safe, no libraries.
   API: HMAnnotate.open() / close() / toggle() / isOpen()
   ============================================================ */
(function () {
  'use strict';
  if (window.HMAnnotate && window.HMAnnotate.__hman) return;   // idempotent

  /* ---------- config ---------- */
  var SIZES = { S: 3, M: 6, L: 11 };                 // base stroke widths (CSS px)
  var HL_MULT = 3.2, HL_ALPHA = 0.28;                // highlighter girth + translucency
  var ER_MULT = 3.5;                                 // eraser girth
  var DPR_CAP = 2.5;
  var FALLBACK = { '--hm-gold': '#caa14e', '--hm-cream': '#f3ead8', '--hm-copper': '#de9b8a' };

  /* ---------- state ---------- */
  var currentTool = 'pen';                            // pen | highlighter | eraser
  var currentColor = '--hm-gold';                     // token name or literal hex
  var currentSize = 'M';
  var strokes = [];                                   // committed (for undo / rebuild)
  var active = null, drawing = false, activeId = null;
  var dpr = 1, rafId = 0, rafPending = false, resizeT = 0, isOpenFlag = false;

  /* ---------- DOM (built once, stays inert) ---------- */
  var root, bar, canvas, ctx, base, bctx;

  var ICON = {
    pen:   '<path d="M4 20l3.6-1L19 7.6a2.1 2.1 0 0 0-3-3L4.5 16.4 4 20z"/><path d="M14.6 6l3.4 3.4"/>',
    hl:    '<path d="M15 4l5 5-7.5 7.5H7v-5L15 4z"/><path d="M5 21h14"/>',
    eraser:'<path d="M8.5 19H5l-1.6-1.6a2 2 0 0 1 0-2.8L13 5a2 2 0 0 1 2.8 0L20 9.2a2 2 0 0 1 0 2.8L13 19"/><path d="M9 10l5 5"/>',
    undo:  '<path d="M7.5 8.5L3.5 12.5l4 4"/><path d="M3.5 12.5h11a4.5 4.5 0 0 1 0 9h-3"/>',
    trash: '<path d="M4 7h16"/><path d="M9.5 7V5h5v2"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11.5v5M14 11.5v5"/>',
    exit:  '<path d="M6 6l12 12M18 6L6 18"/>'
  };
  function svgLine(p){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>'; }
  function svgDot(r){ return '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="'+r+'"/></svg>'; }

  function build() {
    if (document.getElementById('hman-root')) { root = document.getElementById('hman-root'); }
    root = document.createElement('div'); root.id = 'hman-root';

    canvas = document.createElement('canvas'); canvas.id = 'hman-canvas';
    canvas.setAttribute('aria-hidden', 'true');

    bar = document.createElement('div'); bar.id = 'hman-bar';
    bar.setAttribute('role', 'toolbar');
    bar.setAttribute('aria-label', 'Annotation tools');

    var swatches = [
      { c: '--hm-gold',   label: 'Gold' },
      { c: '--hm-cream',  label: 'Cream' },
      { c: '--hm-copper', label: 'Copper' },
      { c: '#ff5436',     label: 'Coral red' }
    ];
    var swHTML = swatches.map(function (s) {
      var on = (s.c === currentColor) ? ' hman-active' : '';
      return '<button type="button" class="hman-btn hman-sw' + on + '" data-hman-color="' + s.c +
             '" aria-label="' + s.label + '"><span class="hman-dot" style="background:' +
             (s.c[0] === '#' ? s.c : 'var(' + s.c + ')') + '"></span></button>';
    }).join('');

    bar.innerHTML =
      '<button type="button" class="hman-btn hman-active" data-hman-tool="pen" aria-label="Pen">'        + svgLine(ICON.pen)   + '</button>' +
      '<button type="button" class="hman-btn" data-hman-tool="highlighter" aria-label="Highlighter">'    + svgLine(ICON.hl)    + '</button>' +
      '<button type="button" class="hman-btn" data-hman-tool="eraser" aria-label="Eraser">'              + svgLine(ICON.eraser)+ '</button>' +
      '<span class="hman-div"></span>' +
      swHTML +
      '<span class="hman-div"></span>' +
      '<button type="button" class="hman-btn" data-hman-size="S" aria-label="Small">'                    + svgDot(2.4) + '</button>' +
      '<button type="button" class="hman-btn hman-active" data-hman-size="M" aria-label="Medium">'       + svgDot(4)   + '</button>' +
      '<button type="button" class="hman-btn" data-hman-size="L" aria-label="Large">'                    + svgDot(6)   + '</button>' +
      '<span class="hman-div"></span>' +
      '<button type="button" class="hman-btn" data-hman-act="undo" aria-label="Undo">'                   + svgLine(ICON.undo)  + '</button>' +
      '<button type="button" class="hman-btn" data-hman-act="clear" aria-label="Clear all">'             + svgLine(ICON.trash) + '</button>' +
      '<button type="button" class="hman-btn" data-hman-act="exit" aria-label="Exit annotate">'          + svgLine(ICON.exit)  + '</button>';

    root.appendChild(canvas);
    root.appendChild(bar);
    document.body.appendChild(root);

    ctx  = canvas.getContext('2d');
    base = document.createElement('canvas');           // offscreen, never in DOM
    bctx = base.getContext('2d');

    bar.addEventListener('click', onBarClick);
  }

  /* ---------- helpers ---------- */
  function resolve(c) {
    if (c[0] === '#') return c;
    var v = getComputedStyle(document.documentElement).getPropertyValue(c).trim();
    return v || FALLBACK[c] || '#caa14e';
  }
  function makeStroke() {
    var w = SIZES[currentSize], alpha = 1, comp = 'source-over';
    if (currentTool === 'highlighter') { w *= HL_MULT; alpha = HL_ALPHA; }
    else if (currentTool === 'eraser') { w *= ER_MULT; comp = 'destination-out'; }
    return { color: resolve(currentColor), width: w, alpha: alpha, comp: comp, points: [] };
  }

  /* ---------- rendering ---------- */
  function sizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    var w = window.innerWidth, h = window.innerHeight;
    canvas.width = base.width  = Math.max(1, Math.round(w * dpr));
    canvas.height = base.height = Math.max(1, Math.round(h * dpr));
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    rebuildBase();
    blit();
  }
  function drawStroke(c, s) {
    var p = s.points; if (!p.length) return;
    c.save();
    c.globalCompositeOperation = s.comp;
    c.globalAlpha = s.alpha;
    c.strokeStyle = s.color; c.fillStyle = s.color;
    c.lineWidth = s.width; c.lineJoin = 'round'; c.lineCap = 'round';
    if (p.length < 3) {
      c.beginPath(); c.arc(p[0].x, p[0].y, s.width / 2, 0, Math.PI * 2); c.fill();
      if (p.length === 2) { c.beginPath(); c.moveTo(p[0].x, p[0].y); c.lineTo(p[1].x, p[1].y); c.stroke(); }
      c.restore(); return;
    }
    c.beginPath();
    c.moveTo(p[0].x, p[0].y);
    for (var i = 1; i < p.length - 1; i++) {           // quadratic midpoint smoothing
      var mx = (p[i].x + p[i + 1].x) / 2, my = (p[i].y + p[i + 1].y) / 2;
      c.quadraticCurveTo(p[i].x, p[i].y, mx, my);
    }
    c.lineTo(p[p.length - 1].x, p[p.length - 1].y);
    c.stroke();
    c.restore();
  }
  function rebuildBase() {
    bctx.setTransform(1, 0, 0, 1, 0, 0);
    bctx.clearRect(0, 0, base.width, base.height);
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (var i = 0; i < strokes.length; i++) drawStroke(bctx, strokes[i]);
  }
  function blit() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(base, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function redrawActive() {
    blit();
    if (active && active.points.length) drawStroke(ctx, active);  // single path → uniform alpha
  }
  function scheduleRedraw() {
    if (rafPending) return;
    rafPending = true;
    rafId = requestAnimationFrame(function () { rafPending = false; redrawActive(); });
  }
  function cancelRaf() { if (rafId) cancelAnimationFrame(rafId); rafId = 0; rafPending = false; }

  /* ---------- pointer drawing ---------- */
  function addPoint(e) {
    var r = canvas.getBoundingClientRect();
    active.points.push({ x: e.clientX - r.left, y: e.clientY - r.top });
  }
  function onDown(e) {
    if (drawing || !e.isPrimary) return;                          // multi-touch protection
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drawing = true; activeId = e.pointerId;
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    active = makeStroke(); addPoint(e); scheduleRedraw();
    e.preventDefault();
  }
  function onMove(e) {
    if (!drawing || e.pointerId !== activeId) return;
    var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
    if (evs && evs.length) { for (var i = 0; i < evs.length; i++) addPoint(evs[i]); }
    else addPoint(e);
    scheduleRedraw();
    e.preventDefault();
  }
  function commitActive() {
    if (active && active.points.length) { drawStroke(bctx, active); strokes.push(active); }
    active = null; drawing = false; activeId = null;
  }
  function onUp(e) {
    if (!drawing || e.pointerId !== activeId) return;
    addPoint(e);
    try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
    commitActive(); cancelRaf(); blit();
    e.preventDefault();
  }
  function onCancel(e) {
    if (!drawing || e.pointerId !== activeId) return;
    commitActive(); cancelRaf(); blit();
  }

  /* ---------- toolbar ---------- */
  function setActive(sel, el) {
    var nodes = bar.querySelectorAll(sel);
    for (var i = 0; i < nodes.length; i++) nodes[i].classList.toggle('hman-active', nodes[i] === el);
  }
  function onBarClick(e) {
    var b = e.target.closest('.hman-btn'); if (!b) return;
    if (b.dataset.hmanTool)  { currentTool  = b.dataset.hmanTool;  setActive('[data-hman-tool]', b); }
    else if (b.dataset.hmanColor) { currentColor = b.dataset.hmanColor; setActive('[data-hman-color]', b); }
    else if (b.dataset.hmanSize)  { currentSize  = b.dataset.hmanSize;  setActive('[data-hman-size]', b); }
    else if (b.dataset.hmanAct === 'undo')  { strokes.pop(); rebuildBase(); blit(); }
    else if (b.dataset.hmanAct === 'clear') { strokes.length = 0; rebuildBase(); blit(); }
    else if (b.dataset.hmanAct === 'exit')  { api.close(); }
  }

  /* ---------- lifecycle (listeners attached ONLY while open) ---------- */
  function onResize() { if (resizeT) cancelAnimationFrame(resizeT); resizeT = requestAnimationFrame(sizeCanvas); }
  function onKey(e) { if (e.key === 'Escape') api.close(); }

  var api = {
    __hman: true,
    open: function () {
      if (isOpenFlag) return;
      isOpenFlag = true;
      root.setAttribute('data-open', '');
      canvas.setAttribute('aria-hidden', 'false');
      sizeCanvas();
      window.addEventListener('resize', onResize);
      window.addEventListener('keydown', onKey);
      canvas.addEventListener('pointerdown', onDown);
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerup', onUp);
      canvas.addEventListener('pointercancel', onCancel);
      canvas.addEventListener('lostpointercapture', onCancel);
    },
    close: function () {
      if (!isOpenFlag) return;
      isOpenFlag = false;
      if (drawing) commitActive();
      cancelRaf();
      root.removeAttribute('data-open');
      canvas.setAttribute('aria-hidden', 'true');
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKey);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onCancel);
      canvas.removeEventListener('lostpointercapture', onCancel);
    },
    toggle: function () { isOpenFlag ? api.close() : api.open(); },
    isOpen: function () { return isOpenFlag; }
  };

  function init() { build(); window.HMAnnotate = api; }      // built, but CLOSED + inert
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
