// FloatingTools — a global manager that pops up draggable, closable, liquid-glass
// FLOATING WINDOWS (Price Sheet + EMI Calculator) that persist over ANY screen
// until the user closes them. Mounted once in App (outside the route transition),
// so windows stay open across navigation.
//
// TRIGGER CONTRACT: listens on `window` for CustomEvent 'uni-open-tool' with
//   detail.tool === 'price' | 'emi'. Opens (or focuses) that window. Re-firing
//   for an already-open tool just brings it to front (no-op otherwise).
//
// BEZEL-SCALE DRAG: the whole app is rendered inside a CSS transform:scale(...)
//   element (`.tablet-bezel`), so pointer deltas are divided by the live scale.
//
// Data: TYPOLOGIES, DUMMY_RATE, formatINR(), fmtSqft() (window globals, data.jsx).

const TOOLSF_KEYS_ID = 'uni-tools-float-keys';
function ensureToolsFloatKeys() {
  if (typeof document === 'undefined' || document.getElementById(TOOLSF_KEYS_ID)) return;
  const s = document.createElement('style'); s.id = TOOLSF_KEYS_ID;
  s.textContent = `
    @keyframes toolFloatIn {
      0%   { opacity:0; transform:translate(-50%,-50%) scale(0.86); }
      100% { opacity:1; transform:translate(-50%,-50%) scale(1); }
    }
    .toolf-win::-webkit-scrollbar{ width:9px; height:9px; }
    .toolf-win::-webkit-scrollbar-thumb{ background:rgba(232,215,168,0.24); border-radius:8px; }
    .toolf-win::-webkit-scrollbar-track{ background:transparent; }
    /* gold-fill range slider for the EMI window */
    input.toolf-range{ -webkit-appearance:none; appearance:none; width:100%; height:30px;
      background:transparent; cursor:pointer; outline:none; }
    input.toolf-range::-webkit-slider-runnable-track{ height:8px; border-radius:6px;
      background:linear-gradient(90deg, var(--gold) 0%, var(--gold) var(--fill,40%),
        rgba(255,248,230,0.12) var(--fill,40%), rgba(255,248,230,0.12) 100%); }
    input.toolf-range::-webkit-slider-thumb{ -webkit-appearance:none; appearance:none;
      width:26px; height:26px; margin-top:-9px; border-radius:50%;
      background:radial-gradient(circle at 32% 30%, #fff6e0 0%, var(--gold) 55%, var(--gold-deep) 100%);
      border:2px solid #fff8e0; box-shadow:0 3px 9px rgba(0,0,0,0.5);
      transition:transform .14s cubic-bezier(0.34,1.56,0.64,1); }
    input.toolf-range:active::-webkit-slider-thumb{ transform:scale(1.14); }
    input.toolf-range::-moz-range-thumb{ width:26px; height:26px; border-radius:50%;
      background:var(--gold); border:2px solid #fff8e0; box-shadow:0 3px 9px rgba(0,0,0,0.5); }
  `;
  document.head.appendChild(s);
}

// liquid-glass surface for the window shell (matches the app's glass chrome)
const toolfGlass = {
  background: 'linear-gradient(158deg, rgba(30,25,18,0.80) 0%, rgba(18,14,10,0.82) 100%)',
  backdropFilter: 'blur(22px) saturate(1.4)', WebkitBackdropFilter: 'blur(22px) saturate(1.4)',
  border: '1px solid rgba(255,248,230,0.30)',
  boxShadow: '0 36px 96px rgba(3,5,9,0.62), 0 10px 30px rgba(0,0,0,0.4), ' +
             'inset 0 1px 0 rgba(255,255,255,0.26), inset 0 -1px 0 rgba(0,0,0,0.34)',
};

// ── live bezel scale (CSS transform:scale on .tablet-bezel) ──────────────────
function bezelScaleF() {
  const b = document.querySelector('.tablet-bezel');
  if (!b) return 1; const r = b.getBoundingClientRect();
  return (r.width / b.offsetWidth) || 1;
}

const CANVAS_W = 2560, CANVAS_H = 1600;

// window registry: default size + staggered default centre position
const TOOL_DEFS = {
  price: { w: 920, h: 620, x: 2560 / 2 - 90, y: 1600 / 2 - 60, title: 'Price Sheet' },
  emi:   { w: 720, h: 560, x: 2560 / 2 + 150, y: 1600 / 2 + 90, title: 'EMI Calculator' },
};

// ════════════════════════════════════════════════════════════════════════
//  FloatingTools (manager — mounted once, globally)
// ════════════════════════════════════════════════════════════════════════
function FloatingTools() {
  ensureToolsFloatKeys();
  // open windows: { price?:{x,y,z}, emi?:{x,y,z} }
  const [wins, setWins] = React.useState({});
  const zTop = React.useRef(131);

  const open = React.useCallback((tool) => {
    if (tool !== 'price' && tool !== 'emi') return;
    setWins(prev => {
      const next = { ...prev };
      zTop.current += 1;
      if (next[tool]) {
        // already open → just bring to front
        next[tool] = { ...next[tool], z: zTop.current };
      } else {
        const d = TOOL_DEFS[tool];
        next[tool] = { x: d.x, y: d.y, z: zTop.current };
      }
      return next;
    });
  }, []);

  const close = React.useCallback((tool) => {
    setWins(prev => { const n = { ...prev }; delete n[tool]; return n; });
  }, []);

  const focus = React.useCallback((tool) => {
    setWins(prev => {
      if (!prev[tool]) return prev;
      zTop.current += 1;
      return { ...prev, [tool]: { ...prev[tool], z: zTop.current } };
    });
  }, []);

  const setPos = React.useCallback((tool, x, y) => {
    setWins(prev => prev[tool] ? { ...prev, [tool]: { ...prev[tool], x, y } } : prev);
  }, []);

  // mount-once event listener with cleanup
  React.useEffect(() => {
    const handler = (e) => { const t = e && e.detail && e.detail.tool; if (t) open(t); };
    window.addEventListener('uni-open-tool', handler);
    return () => window.removeEventListener('uni-open-tool', handler);
  }, [open]);

  return (
    <React.Fragment>
      {wins.price && (
        <ToolWindow tool="price" state={wins.price} title={TOOL_DEFS.price.title}
          w={TOOL_DEFS.price.w} h={TOOL_DEFS.price.h}
          onClose={() => close('price')} onFocus={() => focus('price')} onPos={setPos}>
          <PriceSheetBody/>
        </ToolWindow>
      )}
      {wins.emi && (
        <ToolWindow tool="emi" state={wins.emi} title={TOOL_DEFS.emi.title}
          w={TOOL_DEFS.emi.w} h={TOOL_DEFS.emi.h}
          onClose={() => close('emi')} onFocus={() => focus('emi')} onPos={setPos}>
          <EmiCalcBody/>
        </ToolWindow>
      )}
    </React.Fragment>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  ToolWindow — draggable, closable glass shell (drag by title bar)
// ════════════════════════════════════════════════════════════════════════
function ToolWindow({ tool, state, title, w, h, children, onClose, onFocus, onPos }) {
  const drag = React.useRef({ active: false, sx: 0, sy: 0, ox: 0, oy: 0, scale: 1 });
  const stateRef = React.useRef(state); stateRef.current = state;

  const onMove = React.useCallback((e) => {
    const d = drag.current; if (!d.active) return;
    const dx = (e.clientX - d.sx) / d.scale, dy = (e.clientY - d.sy) / d.scale;
    // clamp the window centre so the whole window stays inside the canvas
    const nx = clamp(d.ox + dx, w / 2 + 12, CANVAS_W - w / 2 - 12);
    const ny = clamp(d.oy + dy, h / 2 + 12, CANVAS_H - h / 2 - 12);
    onPos(tool, nx, ny);
  }, [tool, w, h, onPos]);

  const onUp = React.useCallback(() => {
    drag.current.active = false;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  }, [onMove]);

  const onDown = (e) => {
    // ignore drags that start on the close button
    if (e.target.closest && e.target.closest('[data-toolf-noclose]')) return;
    e.preventDefault(); e.stopPropagation();
    onFocus();
    drag.current = {
      active: true, sx: e.clientX, sy: e.clientY,
      ox: stateRef.current.x, oy: stateRef.current.y, scale: bezelScaleF(),
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  React.useEffect(() => () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  }, [onMove, onUp]);

  return (
    <div onPointerDown={onFocus} style={{
      position: 'absolute', left: state.x, top: state.y, width: w, height: h,
      zIndex: state.z, borderRadius: 22, overflow: 'hidden', ...toolfGlass,
      color: '#faf6e8', display: 'flex', flexDirection: 'column',
      animation: 'toolFloatIn 460ms cubic-bezier(0.34,1.56,0.64,1) both',
      transformOrigin: 'center', willChange: 'transform',
    }}>
      {/* title bar (drag handle) */}
      <div onPointerDown={onDown} style={{
        flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 14, padding: '18px 18px 18px 26px', cursor: 'grab', touchAction: 'none',
        borderBottom: '1px solid rgba(232,215,168,0.18)',
        background: 'linear-gradient(180deg, rgba(255,248,230,0.07) 0%, rgba(255,248,230,0) 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, minWidth: 0 }}>
          {/* grab-dots affordance */}
          <div style={{ display: 'grid', gridTemplateColumns: '4px 4px', gap: 4, flexShrink: 0, opacity: 0.5 }}>
            {[0, 1, 2, 3, 4, 5].map(i => (
              <span key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold-soft)' }}/>
            ))}
          </div>
          <div className="serif" style={{ fontSize: 27, fontWeight: 400, letterSpacing: '-0.01em',
            color: '#faf6e8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        </div>
        {/* glass close button */}
        <button data-toolf-noclose="1" onPointerDown={(e) => e.stopPropagation()} onClick={onClose}
          aria-label="Close" style={{
          width: 42, height: 42, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
          border: '1px solid rgba(232,215,168,0.34)', color: 'rgba(232,215,168,0.95)',
          background: 'linear-gradient(160deg, rgba(255,248,230,0.10) 0%, rgba(0,0,0,0.18) 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 300, lineHeight: 1,
        }}>×</button>
      </div>

      {/* body */}
      <div className="toolf-win" style={{ flex: '1 1 auto', overflowY: 'auto', padding: '24px 26px 26px' }}>
        {children}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  Price Sheet body
// ════════════════════════════════════════════════════════════════════════
function fmtRate(n) { return '₹ ' + Number(n).toLocaleString('en-IN'); }

function PriceSheetBody() {
  const cols = ['Typology', 'Block', 'RERA carpet', 'Rate', 'Indicative price'];
  const hCell = { padding: '12px 16px', textAlign: 'left', whiteSpace: 'nowrap' };
  const rCell = { padding: '16px 16px', borderTop: '1px solid rgba(232,215,168,0.12)', verticalAlign: 'middle' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* header chip row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div className="mono" style={{ fontSize: 11.5, letterSpacing: '0.30em', color: 'rgba(232,215,168,0.72)' }}>
          ALL-4BHK · NEHRU NAGAR · INDICATIVE
        </div>
        <div className="mono" style={{ padding: '8px 15px', borderRadius: 100,
          border: '1px solid rgba(232,215,168,0.30)', color: 'rgba(232,215,168,0.92)',
          background: 'linear-gradient(145deg, rgba(255,248,230,0.08), rgba(0,0,0,0.14))',
          fontSize: 10.5, letterSpacing: '0.20em', textTransform: 'uppercase' }}>
          All-inclusive on request
        </div>
      </div>

      {/* table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
        <thead>
          <tr className="mono" style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'rgba(232,215,168,0.62)' }}>
            {cols.map((c, i) => (
              <th key={c} style={{ ...hCell, textAlign: i >= 2 ? 'right' : 'left' }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TYPOLOGIES.map((t) => (
            <tr key={t.code}>
              <td style={rCell}>
                <div className="serif" style={{ fontSize: 21, fontWeight: 400, color: '#faf6e8', lineHeight: 1.15 }}>{t.name}</div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'rgba(232,215,168,0.50)',
                  marginTop: 3, textTransform: 'uppercase' }}>{t.tag}</div>
              </td>
              <td style={{ ...rCell }}>
                <span className="mono" style={{ fontSize: 14, letterSpacing: '0.10em', color: 'rgba(245,241,232,0.82)' }}>{t.pair}</span>
              </td>
              <td style={{ ...rCell, textAlign: 'right' }}>
                <span className="serif" style={{ fontSize: 19, color: '#faf6e8' }}>{fmtSqft(t.sqft)}</span>
              </td>
              <td style={{ ...rCell, textAlign: 'right' }}>
                <span className="mono" style={{ fontSize: 14, color: 'rgba(245,241,232,0.80)' }}>{fmtRate(DUMMY_RATE)}</span>
                <span className="mono" style={{ fontSize: 10.5, color: 'rgba(232,215,168,0.46)' }}> /sq.ft</span>
              </td>
              <td style={{ ...rCell, textAlign: 'right' }}>
                <span className="serif" style={{ fontSize: 22, fontWeight: 500, color: 'var(--gold-soft)' }}>{formatINR(t.price)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* footnote */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, paddingTop: 4 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }}/>
        <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.10em', color: 'rgba(232,215,168,0.58)', lineHeight: 1.5 }}>
          Indicative — confirm final pricing with sales. Rate is a placeholder ({fmtRate(DUMMY_RATE)}/sq.ft) pending the Venus price list; carpet areas are RERA-final.
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  EMI Calculator body
// ════════════════════════════════════════════════════════════════════════
function emiMedianPrice() {
  const priced = TYPOLOGIES.map(t => t.price).filter(p => p != null).sort((a, b) => a - b);
  if (!priced.length) return 15000000;
  const m = Math.floor(priced.length / 2);
  return priced.length % 2 ? priced[m] : Math.round((priced[m - 1] + priced[m]) / 2);
}

function EmiCalcBody() {
  const [loan, setLoan]   = React.useState(() => emiMedianPrice());
  const [rate, setRate]   = React.useState(8.5);
  const [years, setYears] = React.useState(20);

  // EMI = P*r*(1+r)^n / ((1+r)^n - 1), r = annualRate/12/100, n = years*12
  const r = rate / 12 / 100;
  const n = years * 12;
  const emi = r > 0
    ? loan * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
    : loan / n;
  const totalPayable = emi * n;
  const totalInterest = totalPayable - loan;

  // slider bounds
  const LOAN_MIN = 2500000, LOAN_MAX = 60000000;
  const RATE_MIN = 6, RATE_MAX = 14;
  const YEAR_MIN = 5, YEAR_MAX = 30;
  const fillPct = (v, mn, mx) => ((v - mn) / (mx - mn) * 100).toFixed(1) + '%';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* big EMI readout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.30em', color: 'rgba(232,215,168,0.70)' }}>MONTHLY EMI</div>
        <div className="serif" style={{ fontSize: 56, fontWeight: 500, lineHeight: 1, color: 'var(--gold-soft)',
          textShadow: '0 0 26px rgba(201,160,94,0.30)' }}>
          {formatINR(Math.round(emi))}
        </div>
      </div>

      {/* sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <EmiSlider label="Loan amount" readout={formatINR(loan)}
          value={loan} min={LOAN_MIN} max={LOAN_MAX} step={100000}
          onChange={setLoan} fill={fillPct(loan, LOAN_MIN, LOAN_MAX)}/>
        <EmiSlider label="Interest rate" readout={rate.toFixed(2) + ' % p.a.'}
          value={rate} min={RATE_MIN} max={RATE_MAX} step={0.05}
          onChange={setRate} fill={fillPct(rate, RATE_MIN, RATE_MAX)}/>
        <EmiSlider label="Tenure" readout={years + ' years'}
          value={years} min={YEAR_MIN} max={YEAR_MAX} step={1}
          onChange={setYears} fill={fillPct(years, YEAR_MIN, YEAR_MAX)}/>
      </div>

      {/* totals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <EmiStat label="TOTAL INTEREST" value={formatINR(Math.round(totalInterest))}/>
        <EmiStat label="TOTAL PAYABLE"  value={formatINR(Math.round(totalPayable))}/>
      </div>

      {/* note */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }}/>
        <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.10em', color: 'rgba(232,215,168,0.58)', lineHeight: 1.5 }}>
          Indicative, not a loan offer. Actual EMI depends on the lender, profile &amp; final agreement.
        </div>
      </div>
    </div>
  );
}

function EmiSlider({ label, readout, value, min, max, step, onChange, fill }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <span className="mono" style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'rgba(232,215,168,0.66)' }}>{label}</span>
        <span className="serif" style={{ fontSize: 22, fontWeight: 500, color: '#faf6e8' }}>{readout}</span>
      </div>
      <input type="range" className="toolf-range" min={min} max={max} step={step} value={value}
        style={{ '--fill': fill }}
        onChange={(e) => onChange(parseFloat(e.target.value))}/>
    </div>
  );
}

function EmiStat({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '15px 17px', borderRadius: 15,
      border: '1px solid rgba(232,215,168,0.14)',
      background: 'linear-gradient(145deg, rgba(255,248,230,0.06), rgba(0,0,0,0.16))',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}>
      <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.28em', color: 'rgba(232,215,168,0.58)' }}>{label}</div>
      <div className="serif" style={{ fontSize: 26, fontWeight: 400, color: '#faf6e8', lineHeight: 1.1 }}>{value}</div>
    </div>
  );
}

window.FloatingTools = FloatingTools;
