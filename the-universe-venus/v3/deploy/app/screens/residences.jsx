// Residences — FLOOR-PLAN COMPARISON screen for The Universe (4 BHK).
// ─────────────────────────────────────────────────────────────────────────
// Compare up to THREE real 2D floor plans side by side: each column = a
// pinch/drag/wheel/double-tap zoom-pan PLAN VIEWER + a spec row (RERA carpet,
// BHK, block, price) + a sqft bar (normalized vs the
// largest home, the 4689.98 sq.ft E&F penthouse).
//   · COMPARE mode  — pick up to 3 typologies → up to 3 independent viewers
//                     (each ~⅓ width at 3-up, type sizes auto-tighten). The
//                     trailing track shows a "pick a plan" prompt until full;
//                     at 3 the rail flashes a "max 3" hint instead of replacing.
//   · FOCUS mode    — one big plan, single viewer.
// No interior renders — this is purely about the real floor plans + specs.
// The viewer gesture engine (PlanViewer) is reused verbatim from the prior
// single-plan implementation, refactored into a self-contained component so
// every column gets its own independent zoom/pan.

// ── Largest home in the project — drives the sqft comparison bars. ──────────
const MAX_SQFT = TYPOLOGIES.reduce((m, t) => Math.max(m, t.sqft), 0); // 4689.98

// ════════════════════════════════════════════════════════════════════════
//  PlanViewer — self-contained zoom-pan floor-plan viewer (reused per column)
//  Pinch · drag · wheel (cursor-anchored) · double-tap reset · +/−/RESET HUD.
// ════════════════════════════════════════════════════════════════════════
function PlanViewer({ typology, big }) {
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [hintFaded, setHintFaded] = React.useState(false);

  const containerRef = React.useRef(null);
  const gestureRef = React.useRef({
    active: false, mode: null,
    startD: 0, startZoom: 1,
    startPanX: 0, startPanY: 0,
    startMidX: 0, startMidY: 0,
    lastTapAt: 0, lastTapX: 0, lastTapY: 0,
    dragStartX: 0, dragStartY: 0,
  });

  // Reset zoom/pan whenever the plan changes.
  React.useEffect(() => { setZoom(1); setPan({ x: 0, y: 0 }); setHintFaded(false); }, [typology.code]);

  // Clamp pan so the plan can't drift entirely off-screen.
  const clampPan = (p, z) => {
    const el = containerRef.current;
    if (!el) return p;
    const r = el.getBoundingClientRect();
    const maxX = Math.max(0, ((z - 1) / 2) * r.width) + 80;
    const maxY = Math.max(0, ((z - 1) / 2) * r.height) + 80;
    return {
      x: Math.max(-maxX, Math.min(maxX, p.x)),
      y: Math.max(-maxY, Math.min(maxY, p.y)),
    };
  };

  const fadeHint = () => { if (!hintFaded) setHintFaded(true); };

  // ------- TOUCH ----------
  const handleTouchStart = (ev) => {
    const g = gestureRef.current;
    const touches = ev.touches;
    const el = containerRef.current;
    const rect = el ? el.getBoundingClientRect() : { left: 0, top: 0 };
    if (touches.length === 2) {
      const [a, b] = [touches[0], touches[1]];
      const dx = b.clientX - a.clientX, dy = b.clientY - a.clientY;
      g.mode = 'pinch';
      g.active = true;
      g.startD = Math.hypot(dx, dy) || 1;
      g.startZoom = zoom;
      g.startPanX = pan.x; g.startPanY = pan.y;
      g.startMidX = (a.clientX + b.clientX) / 2 - rect.left;
      g.startMidY = (a.clientY + b.clientY) / 2 - rect.top;
      fadeHint();
    } else if (touches.length === 1) {
      const now = performance.now();
      const t0 = touches[0];
      const tx = t0.clientX, ty = t0.clientY;
      // Double-tap → reset
      if (now - g.lastTapAt < 320 &&
          Math.hypot(tx - g.lastTapX, ty - g.lastTapY) < 40) {
        setZoom(1); setPan({ x: 0, y: 0 });
        g.lastTapAt = 0;
        g.active = false; g.mode = null;
        fadeHint();
        return;
      }
      g.lastTapAt = now; g.lastTapX = tx; g.lastTapY = ty;
      // Single-finger pan only when zoomed in
      if (zoom > 1) {
        g.mode = 'pan-touch';
        g.active = true;
        g.dragStartX = tx; g.dragStartY = ty;
        g.startPanX = pan.x; g.startPanY = pan.y;
        fadeHint();
      } else {
        g.mode = null; g.active = false;
      }
    }
  };

  const handleTouchMove = (ev) => {
    const g = gestureRef.current;
    if (!g.active) return;
    if (ev.cancelable) ev.preventDefault();
    const touches = ev.touches;
    if (g.mode === 'pinch' && touches.length === 2) {
      const [a, b] = [touches[0], touches[1]];
      const dx = b.clientX - a.clientX, dy = b.clientY - a.clientY;
      const newD = Math.hypot(dx, dy) || 1;
      const ratio = newD / g.startD;
      const newZoom = Math.max(0.5, Math.min(4, g.startZoom * ratio));
      const el = containerRef.current;
      const rect = el ? el.getBoundingClientRect() : { left: 0, top: 0, width: 1, height: 1 };
      const cx = (a.clientX + b.clientX) / 2 - rect.left;
      const cy = (a.clientY + b.clientY) / 2 - rect.top;
      const k = newZoom / g.startZoom;
      const offX = (cx - g.startMidX) + g.startPanX * k;
      const offY = (cy - g.startMidY) + g.startPanY * k;
      setZoom(newZoom);
      setPan(clampPan({ x: offX, y: offY }, newZoom));
    } else if (g.mode === 'pan-touch' && touches.length === 1) {
      const t0 = touches[0];
      const dx = t0.clientX - g.dragStartX;
      const dy = t0.clientY - g.dragStartY;
      setPan(clampPan({ x: g.startPanX + dx, y: g.startPanY + dy }, zoom));
    }
  };

  const handleTouchEnd = (ev) => {
    const g = gestureRef.current;
    if (ev.touches.length === 0) {
      g.active = false; g.mode = null;
    } else if (ev.touches.length === 1 && g.mode === 'pinch') {
      const t0 = ev.touches[0];
      g.mode = zoom > 1 ? 'pan-touch' : null;
      g.active = g.mode === 'pan-touch';
      g.dragStartX = t0.clientX; g.dragStartY = t0.clientY;
      g.startPanX = pan.x; g.startPanY = pan.y;
    }
  };

  // ------- MOUSE ----------
  const handleMouseDown = (ev) => {
    if (zoom <= 1) return;
    const g = gestureRef.current;
    g.mode = 'pan-mouse';
    g.active = true;
    g.dragStartX = ev.clientX; g.dragStartY = ev.clientY;
    g.startPanX = pan.x; g.startPanY = pan.y;
    fadeHint();
  };
  const handleMouseMove = (ev) => {
    const g = gestureRef.current;
    if (!g.active || g.mode !== 'pan-mouse') return;
    const dx = ev.clientX - g.dragStartX;
    const dy = ev.clientY - g.dragStartY;
    setPan(clampPan({ x: g.startPanX + dx, y: g.startPanY + dy }, zoom));
  };
  const handleMouseUp = () => {
    const g = gestureRef.current;
    if (g.mode === 'pan-mouse') { g.active = false; g.mode = null; }
  };
  const handleMouseLeave = () => {
    const g = gestureRef.current;
    if (g.mode === 'pan-mouse') { g.active = false; g.mode = null; }
  };

  // ------- WHEEL (cursor-anchored) ----------
  const handleWheel = (ev) => {
    if (ev.cancelable) ev.preventDefault();
    fadeHint();
    const el = containerRef.current;
    const rect = el ? el.getBoundingClientRect() : { left: 0, top: 0, width: 1, height: 1 };
    const cx = ev.clientX - rect.left - rect.width / 2;
    const cy = ev.clientY - rect.top - rect.height / 2;
    const delta = ev.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.5, Math.min(4, zoom * (1 + delta)));
    const k = newZoom / zoom;
    const newPan = { x: cx - (cx - pan.x) * k, y: cy - (cy - pan.y) * k };
    setZoom(newZoom);
    setPan(clampPan(newPan, newZoom));
  };

  // Register passive:false touchmove + wheel listeners (React inline can't).
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const tm = (ev) => handleTouchMove(ev);
    const wh = (ev) => handleWheel(ev);
    el.addEventListener('touchmove', tm, { passive: false });
    el.addEventListener('wheel', wh, { passive: false });
    return () => {
      el.removeEventListener('touchmove', tm);
      el.removeEventListener('wheel', wh);
    };
  }, [zoom, pan.x, pan.y, hintFaded, typology.code]);

  return (
    <div style={{ position: 'relative', flex: 1, minHeight: 0, borderRadius: 19, overflow: 'hidden', background: '#f3eddc', border: '1px solid var(--line)' }}>
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'absolute', inset: 0, overflow: 'hidden',
          cursor: zoom > 1 ? (gestureRef.current.mode === 'pan-mouse' ? 'grabbing' : 'grab') : 'default',
          touchAction: 'none',
        }}>
        <img
          src={typology.plan}
          alt={typology.name}
          draggable={false}
          style={{
            width: '100%', height: '100%', objectFit: 'contain', display: 'block',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: gestureRef.current.active ? 'none' : 'transform 320ms cubic-bezier(0.22,1,0.36,1)',
            transformOrigin: 'center',
            userSelect: 'none', WebkitUserSelect: 'none',
            pointerEvents: 'none',
          }}
          onError={(e) => { e.currentTarget.style.opacity = 0.0; }}
        />
      </div>

      {/* block / N-arrow chip */}
      <div style={{ position: 'absolute', top: 18, left: 18, padding: '12px 19px', background: 'rgba(20,16,11,0.86)', backdropFilter: 'blur(8px)', borderRadius: 105, display: 'flex', alignItems: 'center', gap: 12, border: '1px solid rgba(232,215,168,0.30)', zIndex: 3 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 3 L15 12 L12 10 L9 12 Z" fill="var(--gold)" />
          <text x="12" y="22" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle" fill="var(--gold)">N</text>
        </svg>
        <div className="mono" style={{ fontSize: 13, letterSpacing: '0.2em', color: 'rgba(232,215,168,0.92)' }}>BLOCK {typology.pair}</div>
      </div>

      {/* zoom controls */}
      <div style={{ position: 'absolute', bottom: 18, left: 18, display: 'flex', gap: 7, zIndex: 3 }}>
        <button onClick={() => { fadeHint(); setZoom(z => Math.max(0.6, z - 0.25)); }} style={zoomBtn}>
          <Icons.minus width={19} height={19} />
        </button>
        <div className="mono" style={{ padding: '0 17px', display: 'flex', alignItems: 'center', borderRadius: 105, background: 'rgba(20,16,11,0.88)', border: '1px solid rgba(232,215,168,0.30)', fontSize: 13, letterSpacing: '0.18em', color: 'rgba(232,215,168,0.95)' }}>{Math.round(zoom * 100)}%</div>
        <button onClick={() => { fadeHint(); setZoom(z => Math.min(3, z + 0.25)); }} style={zoomBtn}>
          <Icons.plus width={19} height={19} />
        </button>
        <button onClick={() => { fadeHint(); setZoom(1); setPan({ x: 0, y: 0 }); }} className="mono" style={{ ...zoomBtn, width: 'auto', padding: '0 17px', fontSize: 12, letterSpacing: '0.18em' }}>RESET</button>
      </div>

      {/* gesture hint — fades after first interaction */}
      <div className="mono" style={{
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        padding: '9px 17px', borderRadius: 105,
        background: 'rgba(20,16,11,0.78)', border: '1px solid rgba(232,215,168,0.32)',
        fontSize: big ? 13 : 11, letterSpacing: '0.24em', color: 'var(--gold-deep)',
        opacity: hintFaded ? 0 : 1, transition: 'opacity 480ms ease',
        pointerEvents: 'none', zIndex: 2, whiteSpace: 'nowrap',
      }}>PINCH · DRAG · DOUBLE-TAP</div>
    </div>
  );
}

const zoomBtn = {
  width: 50, height: 50, borderRadius: '50%',
  background: 'rgba(20,16,11,0.88)', border: '1px solid rgba(232,215,168,0.30)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: 'rgba(232,215,168,0.95)',
};

// ════════════════════════════════════════════════════════════════════════
//  Spec block — RERA carpet + sqft bar + BHK / block / price, per column.
// ════════════════════════════════════════════════════════════════════════
function SpecBlock({ typology, t, delay, compact, dens = 0 }) {
  const e = ease.outQuart(clamp((t - delay) / 0.6, 0, 1));
  const barFrac = typology.sqft / MAX_SQFT;
  const barFill = ease.outQuart(clamp((t - delay - 0.15) / 0.7, 0, 1));
  const isMax = typology.sqft === MAX_SQFT;
  const isPent = typology.name.toLowerCase().includes('penthouse');

  // At 3-up the columns are ~⅓ width, so dial down the display type sizes.
  // `dens` (0 → 1, tablet → iPad Pro) bumps every value so specs stay legible on
  // the taller canvas without regressing 16:10.
  const d = compact ? dens * 0.5 : dens;   // 3-up columns are narrow, grow gently
  const nameSize   = Math.round((compact ? 32 : 46) + d*8);
  const carpetSize = Math.round((compact ? 30 : 40) + d*8);
  const carpetUnit = Math.round((compact ? 16 : 20) + d*3);
  const rowVal     = Math.round((compact ? 18 : 21) + d*4);
  const rowPadY    = Math.round((compact ? 11 : 13) + d*5);
  const secGap     = Math.round((compact ? 14 : 18) + d*8);

  return (
    <div style={{ opacity: e, transform: `translateY(${(1 - e) * 14}px)`, minWidth: 0 }}>
      {/* name + tag */}
      <div className="mono" style={{ fontSize: Math.round((compact ? 12 : 13) + d*3), letterSpacing: '0.3em', color: 'var(--gold-deep)' }}>{typology.tag.toUpperCase()}</div>
      <div className="serif" style={{ fontSize: nameSize, fontWeight: 300, lineHeight: 1.05, letterSpacing: '-0.025em', marginTop: 8 }}>{typology.name}</div>

      {/* carpet headline */}
      <div style={{ marginTop: secGap }}>
        <div className="mono" style={{ fontSize: Math.round(12 + d*3), letterSpacing: '0.26em', color: 'var(--slate)' }}>RERA CARPET (APPROX)</div>
        <div className="serif" style={{ fontSize: carpetSize, fontWeight: 300, color: isPent ? 'var(--gold-deep)' : 'var(--ink)', letterSpacing: '-0.01em', marginTop: 4 }}>
          {typology.sqft.toLocaleString('en-IN', { maximumFractionDigits: 0 })} <span style={{ fontSize: carpetUnit, color: 'var(--slate)' }}>sq.ft</span>
        </div>
      </div>

      {/* sqft comparison bar (normalized to the largest home) */}
      <div style={{ marginTop: Math.round(14 + d*6) }}>
        <div style={{ height: Math.round(14 + d*4), borderRadius: 105, background: 'var(--line-soft)', overflow: 'hidden', border: '1px solid var(--line)' }}>
          <div style={{
            height: '100%', width: `${barFrac * barFill * 100}%`, borderRadius: 105,
            background: isMax
              ? 'linear-gradient(90deg, var(--gold) 0%, var(--gold-deep) 100%)'
              : 'linear-gradient(90deg, var(--gold-soft, #d9c089) 0%, var(--gold) 100%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
          }} />
        </div>
        <div className="mono" style={{ fontSize: Math.round(11 + d*2), letterSpacing: '0.2em', color: 'var(--slate)', marginTop: 7, display: 'flex', justifyContent: 'space-between' }}>
          <span>{Math.round(barFrac * 100)}% OF LARGEST HOME</span>
          {isMax && <span style={{ color: 'var(--gold-deep)' }}>LARGEST</span>}
        </div>
      </div>

      {/* spec rows */}
      <div style={{ marginTop: secGap, borderTop: '1px solid var(--line-soft)' }}>
        {[
          ['CONFIGURATION', `${typology.bhk} BHK`],
          ['BLOCK', `Block ${typology.pair}`],
          ['PRICE', formatINR(typology.price)],
        ].map(([k, v], i) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, padding: `${rowPadY}px 2px`, borderBottom: '1px solid var(--line-soft)' }}>
            <div className="mono" style={{ fontSize: Math.round((compact ? 11 : 12) + d*3), letterSpacing: '0.24em', color: 'var(--slate)', whiteSpace: 'nowrap' }}>{k}</div>
            <div className="serif" style={{ fontSize: rowVal, color: k === 'PRICE' && typology.price == null ? 'var(--slate)' : 'var(--ink)', fontStyle: k === 'PRICE' && typology.price == null ? 'italic' : 'normal', textAlign: 'right' }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  A single comparison column = viewer + spec + a remove/swap affordance.
// ════════════════════════════════════════════════════════════════════════
function CompareColumn({ typology, t, delay, onClear, clearable, compact, dens = 0 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: Math.round((compact ? 18 : 22) + dens*8), minHeight: 0, minWidth: 0 }}>
      <PlanViewer typology={typology} big={false} />
      <SpecBlock typology={typology} t={t} delay={delay} compact={compact} dens={dens} />
      {clearable && (
        <button onClick={onClear} className="mono" style={{
          alignSelf: 'flex-start', padding: `${Math.round(11+dens*4)}px ${Math.round(20+dens*5)}px`, borderRadius: 105,
          border: '1px solid var(--line)', background: 'var(--ivory-2)', color: 'var(--slate)',
          fontSize: Math.round(12 + dens*3), letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Icons.close width={13} height={13} /> Remove
        </button>
      )}
    </div>
  );
}

// "+ Add a plan" track — a slim button column to add another plan (up to 3).
function AddColumn({ onAdd }) {
  return (
    <button onClick={onAdd} className="mono" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
      borderRadius: 19, border: '1.5px dashed var(--gold-deep)', background: 'var(--ivory-2)', minWidth: 0, padding: 24,
      cursor: 'pointer', transition: 'all .24s cubic-bezier(0.22,1,0.36,1)',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--tile-light)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--ivory-2)'; }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', border: '1.6px solid var(--gold-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-deep)', background: 'var(--ivory)' }}>
        <Icons.plus width={28} height={28} />
      </div>
      <div className="serif" style={{ fontSize: 24, fontWeight: 300, color: 'var(--ink)' }}>Add a plan</div>
      <div className="mono" style={{ fontSize: 11.5, letterSpacing: '0.2em', color: 'var(--slate)', opacity: 0.75 }}>COMPARE UP TO 3</div>
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  Residences (root) — selection rail + COMPARE / FOCUS modes.
// ════════════════════════════════════════════════════════════════════════
function Residences() {
  const t = useLoop();
  const [route] = useRoute();

  // Canvas-height density: 0 on 16:10 tablet (1600) → 1 on iPad Pro 4:3 (1920).
  const CH = (typeof window !== 'undefined' && window.UNIVERSE_CANVAS && window.UNIVERSE_CANVAS.H) || 1600;
  const dens = Math.max(clamp((CH - 1600) / 320), (typeof window!=="undefined" && window.UNIVERSE_CANVAS && window.UNIVERSE_CANVAS.dens) || 0);

  // Initial typology from route (tower id → its block pair), else first.
  const initialCode = (() => {
    const towerId = route.params && route.params[0];
    if (towerId) {
      const tower = TOWERS.find(tw => tw.id === towerId);
      if (tower) {
        const ty = TYPOLOGIES.find(t => t.pair === tower.pair);
        if (ty) return ty.code;
      }
    }
    return TYPOLOGIES[0].code;
  })();

  const MAX_COMPARE = 3;
  // default to TWO plans side by side (initial + the next distinct typology)
  const secondCode = (TYPOLOGIES.find(ty => ty.code !== initialCode) || TYPOLOGIES[0]).code;

  const [mode, setMode] = React.useState('compare');           // 'compare' | 'focus'
  const [selected, setSelected] = React.useState(
    secondCode && secondCode !== initialCode ? [initialCode, secondCode] : [initialCode]
  );
  const [focusCode, setFocusCode] = React.useState(initialCode);
  const [maxHint, setMaxHint] = React.useState(false);          // brief "max 3" flash

  const byCode = (c) => TYPOLOGIES.find(ty => ty.code === c);

  // Rail tap behaviour depends on mode.
  const pick = (code) => {
    if (mode === 'focus') { setFocusCode(code); return; }
    setSelected(prev => {
      if (prev.includes(code)) {
        // tapping a selected one removes it (unless it's the only one)
        if (prev.length === 1) return prev;
        return prev.filter(c => c !== code);
      }
      if (prev.length >= MAX_COMPARE) {
        // already at the cap — flash a "max 3" hint, keep selection unchanged
        setMaxHint(true);
        return prev;
      }
      return [...prev, code];
    });
  };

  // "+ Add plan" — append the next typology not yet being compared (up to 3).
  const addPlan = () => setSelected(prev => {
    if (prev.length >= MAX_COMPARE) return prev;
    const next = TYPOLOGIES.find(ty => !prev.includes(ty.code));
    return next ? [...prev, next.code] : prev;
  });

  // Auto-dismiss the "max 3" hint shortly after it appears.
  React.useEffect(() => {
    if (!maxHint) return;
    const id = setTimeout(() => setMaxHint(false), 2200);
    return () => clearTimeout(id);
  }, [maxHint]);

  const isActive = (code) => mode === 'focus' ? focusCode === code : selected.includes(code);
  const slotOf = (code) => selected.indexOf(code); // 0 / 1 / 2 / -1

  const cols = selected.map(byCode).filter(Boolean);   // 1–3 chosen typologies
  const compact = cols.length === 3;                   // tighten type at 3-up
  const showEmpty = cols.length < MAX_COMPARE && cols.length >= 1; // trailing prompt slot
  // 1 chosen → show its column + an empty prompt (2 tracks).
  // 2 chosen → two columns + an empty prompt (3 tracks).
  // 3 chosen → three columns, no prompt.
  const trackCount = cols.length >= MAX_COMPARE ? MAX_COMPARE : cols.length + 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'transparent', color: 'var(--ink)', overflow: 'hidden' }}>
      <ScreenHeader title="Residences" subtitle="Compare 4 BHK floor plans · RERA carpet · interiors by HBA" idx="04" />

      {/* ── mode toggle (Compare / Focus) ── top-right under header ── */}
      <div style={{ position: 'absolute', top: 250, right: 76, display: 'flex', gap: 0, padding: 5, borderRadius: 105, background: 'var(--ivory-2)', border: '1px solid var(--line)', zIndex: 6 }}>
        {[['compare', 'COMPARE'], ['focus', 'SINGLE PLAN']].map(([m, label]) => (
          <button key={m} onClick={() => {
            setMode(m);
            if (m === 'focus') setFocusCode(selected[0] || initialCode);
          }} className="mono" style={{
            padding: `${Math.round(13+dens*5)}px ${Math.round(26+dens*8)}px`, borderRadius: 105, border: 'none', cursor: 'pointer',
            fontSize: Math.round(14 + dens*3), letterSpacing: '0.2em',
            background: mode === m ? 'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)' : 'transparent',
            color: mode === m ? '#1a130a' : 'var(--slate)',
            fontWeight: mode === m ? 700 : 500,
            boxShadow: mode === m ? '0 6px 14px rgba(176,138,63,0.35)' : 'none',
            transition: 'all 240ms cubic-bezier(0.22,1,0.36,1)',
          }}>{label}</button>
        ))}
      </div>

      {/* ── selection rail (the 6 typologies) ── */}
      <div style={{ position: 'absolute', top: 300, left: 76, right: 76, display: 'flex', gap: 11, alignItems: 'center', flexWrap: 'wrap', zIndex: 5 }}>
        {TYPOLOGIES.map(ty => {
          const active = isActive(ty.code);
          const slot = slotOf(ty.code);
          return (
            <button key={ty.code} onClick={() => pick(ty.code)} className="mono" style={{
              padding: `${Math.round(14+dens*4)}px ${Math.round(22+dens*3)}px`, borderRadius: 105,
              border: '1px solid ' + (active ? 'var(--gold-deep)' : 'var(--line)'),
              background: active ? 'linear-gradient(180deg, var(--tile-light) 0%, var(--tile) 100%)' : 'var(--ivory-2)',
              color: active ? 'var(--on-tile)' : 'var(--ink)',
              fontSize: Math.round(14 + dens*2), letterSpacing: '0.16em', textTransform: 'uppercase', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 11,
              fontWeight: active ? 700 : 500,
              boxShadow: active ? '0 8px 19px rgba(50,32,12,0.18)' : 'none',
              transition: 'all 240ms cubic-bezier(0.22,1,0.36,1)',
            }}>
              {/* slot badge in compare mode */}
              {mode === 'compare' && slot >= 0 && (
                <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--gold-deep)', color: '#1a130a', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{slot + 1}</span>
              )}
              <span style={{ opacity: 0.7 }}>{ty.pair}</span>
              <span style={{ opacity: 0.35 }}>·</span>
              <span>{ty.name.replace('4 BHK · ', '').replace('Penthouse · ', 'PH · ')}</span>
              <span style={{ opacity: 0.45, fontSize: 12 }}>{Math.round(ty.sqft)}</span>
            </button>
          );
        })}
      </div>

      {/* ── selection hint ── */}
      <div className="mono" style={{ position: 'absolute', top: 372, left: 78, fontSize: Math.round(12 + dens*2), letterSpacing: '0.22em', zIndex: 5, display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ color: 'var(--slate)', opacity: 0.75 }}>
          {mode === 'compare'
            ? `SELECT UP TO THREE PLANS TO COMPARE SIDE BY SIDE · ${selected.length}/${MAX_COMPARE} CHOSEN`
            : 'SELECT ONE PLAN TO STUDY FULL-SIZE'}
        </span>
        {mode === 'compare' && (
          <span style={{
            color: 'var(--gold-deep)', fontWeight: 700,
            opacity: maxHint ? 1 : 0,
            transform: maxHint ? 'translateX(0)' : 'translateX(-6px)',
            transition: 'opacity 220ms ease, transform 220ms ease',
            pointerEvents: 'none',
          }}>· MAX {MAX_COMPARE} · REMOVE ONE TO SWAP</span>
        )}
      </div>

      {/* ── stage ── */}
      <div style={{ position: 'absolute', top: 410, left: 76, right: 76, bottom: 76 }}>
        {mode === 'compare' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: cols.length >= MAX_COMPARE
              ? `repeat(${MAX_COMPARE}, 1fr)`
              : `repeat(${cols.length}, 1fr) minmax(230px, 0.52fr)`,
            gap: compact ? 34 : 46,
            height: '100%',
            minWidth: 0,
          }}>
            {cols.map((ty, i) => (
              <CompareColumn
                key={ty.code}
                typology={ty}
                t={t} delay={0.2 + i * 0.12}
                compact={compact}
                dens={dens}
                clearable={cols.length > 1}
                onClear={() => setSelected(prev => prev.filter(c => c !== ty.code))}
              />
            ))}
            {cols.length < MAX_COMPARE && <AddColumn onAdd={addPlan} />}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.75fr 1fr', gap: 50, height: '100%' }}>
            {/* big single viewer */}
            <PlanViewer typology={byCode(focusCode)} big={true} />
            {/* spec + room schedule + CTA */}
            <FocusSpec typology={byCode(focusCode)} t={t} dens={dens} />
          </div>
        )}
      </div>
    </div>
  );
}

// Right-hand panel for FOCUS mode — fuller spec + room schedule + CTA.
function FocusSpec({ typology, t, dens = 0 }) {
  const rooms = parseRooms(typology.code);
  const isPent = typology.name.toLowerCase().includes('penthouse');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: Math.round(20 + dens*8), overflow: 'hidden', minHeight: 0 }}>
      <SpecBlock typology={typology} t={t} delay={0.18} dens={dens} />

      {/* room schedule (scrolls) */}
      <div className="scroll" style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <div className="mono" style={{ fontSize: Math.round(13 + dens*3), letterSpacing: '0.26em', color: 'var(--slate)', marginBottom: Math.round(14 + dens*4) }}>ROOM SCHEDULE</div>
        <div style={{ borderTop: '1px solid var(--line-soft)' }}>
          {rooms.map((r, i) => {
            const e = ease.outQuart(clamp((t - 0.3 - i * 0.035) / 0.5, 0, 1));
            return (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '24px 1fr auto', alignItems: 'center', gap: 16,
                padding: `${Math.round(13 + dens*5)}px 4px`, borderBottom: '1px solid var(--line-soft)',
                opacity: e, transform: `translateX(${(1 - e) * -10}px)`,
              }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--gold)', opacity: 0.55 }} />
                <div className="serif" style={{ fontSize: Math.round(19 + dens*4), color: 'var(--ink)' }}>{r.name}</div>
                <div className="mono" style={{ fontSize: Math.round(14 + dens*3), color: 'var(--graphite)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{r.dim}</div>
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={() => navigate('booking')} className="mono" style={{
        padding: `${Math.round(22 + dens*6)}px 34px`, borderRadius: 105,
        border: '1px solid var(--gold-deep)',
        background: 'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)',
        color: '#1a130a',
        fontSize: Math.round(17 + dens*3), letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 700,
        boxShadow: '0 17px 38px rgba(176,138,63,0.45), inset 0 1px 0 rgba(255,255,255,0.42)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 15,
      }}>Reserve a {isPent ? 'penthouse' : 'residence'} <span style={{ fontSize: 21 }}>→</span></button>
    </div>
  );
}

// ── Room schedules per typology code — from the official Unit Plans PDF. ────
function parseRooms(code) {
  const schedules = {
    'AB-4BHK': [
      { name: 'Living / Dining', dim: '20\'-5" × 15\'-1"' },
      { name: 'Master Bedroom', dim: '16\'-7" × 11\'-0"' },
      { name: 'Bedroom 1', dim: '11\'-11" × 14\'-8"' },
      { name: 'Bedroom 2', dim: '11\'-0" × 13\'-9"' },
      { name: 'Bedroom 3', dim: '14\'-0" × 11\'-11"' },
      { name: 'Kitchen', dim: '11\'-0" × 9\'-0"' },
      { name: 'Utility', dim: '5\'-7" × 6\'-5"' },
      { name: 'Puja', dim: '3\'-7" × 3\'-1"' },
      { name: 'Foyer', dim: '3\'-11" × 9\'-0"' },
      { name: 'Balcony', dim: '12\'-1" × 5\'-0"' },
      { name: 'Toilets', dim: '4 attached' },
    ],
    'CD-4BHK': [
      { name: 'Living / Dining', dim: '30\'-4" × 16\'-4"' },
      { name: 'Family Lounge', dim: '12\'-7" × 6\'-8"' },
      { name: 'Bedroom 1', dim: '11\'-0" × 16\'-0"' },
      { name: 'Bedroom 2', dim: '11\'-0" × 15\'-8"' },
      { name: 'Bedroom 3', dim: '10\'-6" × 15\'-0"' },
      { name: 'Bedroom 4', dim: '14\'-0" × 11\'-6"' },
      { name: 'Kitchen', dim: '9\'-0" × 14\'-11"' },
      { name: 'Utility', dim: '8\'-4" × 7\'-6"' },
      { name: 'Servant', dim: '5\'-0" × 11\'-8"' },
      { name: 'Balcony', dim: '29\'-9" × 6\'-0"' },
    ],
    'EF-4BHK': [
      { name: 'Living', dim: '25\'-8" × 16\'-10"' },
      { name: 'Dining', dim: '15\'-4" × 8\'-3"' },
      { name: 'Master Bedroom', dim: '20\'-6" × 11\'-0"' },
      { name: 'Bedroom 1', dim: '13\'-1" × 13\'-2"' },
      { name: 'Bedroom 2', dim: '17\'-4" × 11\'-0"' },
      { name: 'Bedroom 3', dim: '17\'-4" × 11\'-0"' },
      { name: 'Kitchen', dim: '10\'-0" × 18\'-10"' },
      { name: 'Servant', dim: '11\'-8" × 5\'-5"' },
      { name: 'Utility', dim: '11\'-9" × 6\'-5"' },
      { name: 'Store', dim: '6\'-4" × 7\'-0"' },
      { name: 'Balcony', dim: '25\'-6" × 7\'-1"' },
    ],
    'GH-4BHK': [
      { name: 'Living / Dining / Family', dim: '27\'-4" × 15\'-2"' },
      { name: 'Master Bedroom', dim: '16\'-7" × 11\'-8"' },
      { name: 'Bedroom A', dim: '16\'-0" × 11\'-11"' },
      { name: 'Bedroom B', dim: '11\'-8" × 15\'-9"' },
      { name: 'Bedroom C', dim: '11\'-0" × 15\'-0"' },
      { name: 'Kitchen', dim: '10\'-0" × 14\'-4"' },
      { name: 'Servant', dim: '8\'-6" × 5\'-6"' },
      { name: 'Utility', dim: '7\'-5" × 7\'-2"' },
      { name: 'Balcony', dim: '22\'-8" × 6\'-0"' },
    ],
    'IJ-4BHK': [
      { name: 'Living / Dining', dim: '30\'-5" × 16\'-4"' },
      { name: 'Family Lounge', dim: '11\'-0" × 6\'-8"' },
      { name: 'Bedroom 1', dim: '11\'-0" × 16\'-0"' },
      { name: 'Bedroom 2', dim: '11\'-0" × 15\'-8"' },
      { name: 'Bedroom 3', dim: '10\'-6" × 15\'-0"' },
      { name: 'Bedroom 4', dim: '14\'-0" × 11\'-6"' },
      { name: 'Kitchen', dim: '9\'-0" × 14\'-11"' },
      { name: 'Utility', dim: '8\'-4" × 7\'-6"' },
      { name: 'Servant', dim: '5\'-0" × 11\'-8"' },
      { name: 'Balcony', dim: '29\'-7" × 6\'-0"' },
    ],
    'EF-PENT': [
      { name: 'Living', dim: '25\'-8" × 16\'-9"' },
      { name: 'Dining', dim: '15\'-4" × 8\'-3"' },
      { name: 'Master Bedroom', dim: '20\'-7" × 11\'-0"' },
      { name: 'Dressing (Master)', dim: '5\'-6" × 5\'-0"' },
      { name: 'Bedroom 1', dim: '13\'-1" × 13\'-2"' },
      { name: 'Bedroom 2', dim: '17\'-3" × 11\'-0"' },
      { name: 'Bedroom 3', dim: '17\'-3" × 11\'-0"' },
      { name: 'Kitchen', dim: '10\'-0" × 18\'-10"' },
      { name: 'Servant', dim: '11\'-7" × 5\'-7"' },
      { name: 'Foyer', dim: '13\'-5" × 4\'-11"' },
    ],
  };
  return schedules[code] || [];
}

window.Residences = Residences;
