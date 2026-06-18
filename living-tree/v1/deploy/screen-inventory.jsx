// ============================================================
// Inventory Screen — 4-step drill-down
// Tower Grid → Floor Elevation → Unit Grid → Unit Price
// ============================================================

(function () {

// ── Inject keyframes once ────────────────────────────────────
function injectStyles() {
  if (document.getElementById('inv-styles')) return;
  const css = `
    @keyframes invFadeIn   { from { opacity:0 } to { opacity:1 } }
    @keyframes invFadeUp   { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }
    @keyframes invFadeDown { from { opacity:0; transform:translateY(-12px) } to { opacity:1; transform:translateY(0) } }
    @keyframes invScaleIn  { from { opacity:0; transform:scale(0.93) } to { opacity:1; transform:scale(1) } }
    @keyframes invSlideL   { from { opacity:0; transform:translateX(-32px) } to { opacity:1; transform:translateX(0) } }
    @keyframes invSlideR   { from { opacity:0; transform:translateX(32px) } to { opacity:1; transform:translateX(0) } }
    @keyframes invPulse    { 0%,100% { opacity:1 } 50% { opacity:0.45 } }
    @keyframes invBreath   { 0%,100% { transform:scale(1) } 50% { transform:scale(1.06) } }
    @keyframes invGlow     { 0%,100% { box-shadow:0 0 8px rgba(127,185,85,0.4) } 50% { box-shadow:0 0 18px rgba(127,185,85,0.8) } }
    @keyframes invShimmer  {
      0%   { background-position: -400px 0 }
      100% { background-position:  400px 0 }
    }

    .inv-tower-card {
      transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1),
                  box-shadow 0.28s ease,
                  border-color 0.28s ease,
                  background 0.28s ease;
    }
    .inv-tower-card:not(.soldout):hover {
      transform: translateY(-4px) scale(1.02);
      border-color: rgba(217,178,122,0.55) !important;
      box-shadow: 0 22px 56px rgba(0,0,0,0.55), 0 0 0 1px rgba(217,178,122,0.28) !important;
    }
    .inv-tower-card.soldout { cursor: default; opacity: 0.62; }

    .inv-floor-row { transition: background 0.2s, border-color 0.2s; }
    .inv-floor-row:not(.unavail):hover { background: rgba(217,178,122,0.09) !important; border-color: rgba(217,178,122,0.38) !important; cursor:pointer; }
    .inv-floor-row.unavail { cursor: default; opacity: 0.52; }

    .inv-unit-card { transition: transform 0.24s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.24s, border-color 0.24s; }
    .inv-unit-card.available:hover { transform: translateY(-3px) scale(1.03); border-color: rgba(127,185,85,0.7) !important; box-shadow: 0 14px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(127,185,85,0.3) !important; cursor: pointer; }
    .inv-unit-card.hold { cursor: default; }
    .inv-unit-card.sold { cursor: default; opacity: 0.44; }

    .inv-crumb-link { transition: color 0.2s; cursor: pointer; }
    .inv-crumb-link:hover { color: #d9b27a !important; }

    .inv-cta-btn { transition: transform 0.2s, box-shadow 0.2s, filter 0.2s; }
    .inv-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 20px 50px rgba(217,178,122,0.5) !important; filter: brightness(1.08); }
    .inv-cta-btn:active { transform: scale(0.97); }
  `;
  const el = document.createElement('style');
  el.id = 'inv-styles';
  el.textContent = css;
  document.head.appendChild(el);
}

// ── Deterministic unit synthesiser ───────────────────────────
// Seed by (towerId, floorNo) → stable across renders.
function seededRand(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 4294967296;
  };
}

function getFloorUnits(tower, floorNo) {
  const r = seededRand((tower.id.charCodeAt(0) * 31 + tower.id.charCodeAt(1)) * 100 + floorNo);

  // 10 units per floor — matches the 10 unit shapes on the floor-plate render
  const unitCount = 10;

  // Per-tower typology pool
  const typs = tower.typologies;

  // Floor-level availability: higher floors are more premium (less sold, more available on upper third)
  const isHigh = floorNo >= 18;
  const isMid  = floorNo >= 10 && floorNo < 18;

  const units = [];
  for (let i = 0; i < unitCount; i++) {
    const typCode = typs[Math.floor(r() * typs.length)];
    const typ = TYPOLOGIES.find(t => t.name === typCode) || TYPOLOGIES[3];
    const facing = r() > 0.5 ? 'E' : 'W';

    // Status distribution weighted by tower's overall availability
    const availRatio = tower.available / tower.units;
    const holdRatio  = tower.hold / tower.units;
    const v = r();

    let status;
    if (tower.available === 0) {
      status = 'sold';
    } else {
      // Skew upper floors to have more available
      const avail = isHigh ? availRatio * 2.2 : isMid ? availRatio * 1.4 : availRatio * 0.7;
      const hold  = holdRatio * 1.1;
      if (v < Math.min(avail, 0.7)) status = 'available';
      else if (v < Math.min(avail + hold, 0.85)) status = 'hold';
      else status = 'sold';
    }

    const unitNo = `${tower.no.toString().padStart(2,'0')}${floorNo.toString().padStart(2,'0')}${(i+1).toString().padStart(2,'0')}`;

    units.push({ no: unitNo, typCode: typ.code, typName: typ.name, facing, status, floorNo, towerId: tower.id });
  }
  return units;
}

function getFloorSummary(tower, floorNo) {
  const units = getFloorUnits(tower, floorNo);
  const available = units.filter(u => u.status === 'available').length;
  const hold      = units.filter(u => u.status === 'hold').length;
  const sold      = units.filter(u => u.status === 'sold').length;
  return { units, available, hold, sold, total: units.length };
}

// ── Price calculator ──────────────────────────────────────────
function calcPrice(typ, facing, floorNo) {
  const areas = facing === 'E' ? typ.east : typ.west;
  const baseRate = typ.priceFrom / areas.saleable; // per sft
  const floorPremiumRate = 1 + (floorNo - 1) * 0.0055; // 0.55% per floor
  const basePrice  = Math.round(areas.saleable * baseRate * floorPremiumRate);
  const floorRise  = Math.round(basePrice - typ.priceFrom);
  const gst        = Math.round(basePrice * 0.05);
  const regStamp   = Math.round(basePrice * 0.056); // ~5.6% Karnataka
  const total      = basePrice + gst + regStamp;
  return { basePrice, floorRise, gst, regStamp, total, areas };
}

// ── Availability bar ──────────────────────────────────────────
function AvailBar({ available, hold, sold, total, height = 5, showLabels = false, animate = true }) {
  const av = (available / total) * 100;
  const ho = (hold / total) * 100;
  const so = (sold / total) * 100;

  return (
    <div>
      <div style={{
        display: 'flex', height: height, borderRadius: 999, overflow: 'hidden',
        background: 'rgba(255,255,255,0.06)',
        animation: animate ? 'invFadeIn 0.5s ease' : 'none',
      }}>
        {available > 0 && <div style={{ width: `${av}%`, background: '#7fb955', transition: 'width 0.6s ease' }}/>}
        {hold > 0      && <div style={{ width: `${ho}%`, background: '#d9b27a', marginLeft: available > 0 ? 1 : 0, transition: 'width 0.6s ease' }}/>}
        {sold > 0      && <div style={{ width: `${so}%`, background: 'rgba(180,80,80,0.55)', marginLeft: (available > 0 || hold > 0) ? 1 : 0, transition: 'width 0.6s ease' }}/>}
      </div>
      {showLabels && (
        <div style={{ display: 'flex', gap: 12, marginTop: 7, fontSize: 9.5, letterSpacing: 1.2, textTransform: 'uppercase' }}>
          {available > 0 && <span style={{ color: '#7fb955' }}>● {available} avail</span>}
          {hold > 0      && <span style={{ color: '#d9b27a' }}>● {hold} hold</span>}
          {sold > 0      && <span style={{ color: 'rgba(200,100,100,0.7)' }}>● {sold} sold</span>}
        </div>
      )}
    </div>
  );
}

// ── Status dot ───────────────────────────────────────────────
function StatusDot({ status, size = 7 }) {
  const map = {
    available: { bg: '#7fb955', glow: '0 0 8px rgba(127,185,85,0.8)', anim: 'invGlow 1.8s ease-in-out infinite' },
    hold:      { bg: '#d9b27a', glow: 'none', anim: 'none' },
    sold:      { bg: 'rgba(180,80,80,0.55)', glow: 'none', anim: 'none' },
  };
  const s = map[status] || map.sold;
  return (
    <span style={{
      display: 'inline-block', width: size, height: size, borderRadius: '50%',
      background: s.bg, boxShadow: s.glow, animation: s.anim, flexShrink: 0,
    }}/>
  );
}

// ── Breadcrumb ────────────────────────────────────────────────
function Breadcrumb({ tower, floor, unit, onTower, onFloor, onUnit }) {
  const crumbStyle = (active) => ({
    display: 'flex', alignItems: 'center', gap: 5,
    fontSize: 10.5, letterSpacing: 1.8, textTransform: 'uppercase', fontFamily: THEME.sans,
    color: active ? THEME.cream : THEME.dim,
    fontWeight: active ? 600 : 400,
  });
  const sep = (
    <span style={{ color: 'rgba(217,178,122,0.4)', fontSize: 11, margin: '0 4px' }}>›</span>
  );

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0,
      padding: '10px 20px', borderRadius: 999,
      background: 'rgba(15,24,19,0.7)', border: `1px solid ${THEME.lineSoft}`,
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      animation: 'invFadeDown 0.4s ease',
    }}>
      {/* Inventory root */}
      <span style={{ ...crumbStyle(!tower), opacity: 0.55, fontSize: 10 }}>Inventory</span>
      {sep}

      {/* Tower */}
      {tower ? (
        <>
          <span
            className="inv-crumb-link"
            onClick={onTower}
            style={{ ...crumbStyle(!floor), cursor: floor ? 'pointer' : 'default', color: floor ? THEME.dim : THEME.cream }}
          >
            <StatusDot status="available" size={5} />
            {tower.name}
          </span>
          {floor && (
            <>
              {sep}
              <span
                className="inv-crumb-link"
                onClick={onFloor}
                style={{ ...crumbStyle(!unit), cursor: unit ? 'pointer' : 'default', color: unit ? THEME.dim : THEME.cream }}
              >
                Floor {floor}
              </span>
            </>
          )}
          {unit && (
            <>
              {sep}
              <span style={{ ...crumbStyle(true), color: THEME.gold }}>Unit {unit}</span>
            </>
          )}
        </>
      ) : (
        <span style={{ ...crumbStyle(true), opacity: 0.55, color: THEME.gold, fontSize: 10 }}>
          Select a Tower
        </span>
      )}
    </div>
  );
}

// ── STEP 1 — Tower Grid ───────────────────────────────────────
function TowerGrid({ onSelect }) {
  // Sort: available first, then hold, then sold-out
  const sorted = [...TOWERS].sort((a, b) => {
    if (a.available === 0 && b.available > 0) return 1;
    if (b.available === 0 && a.available > 0) return -1;
    return b.available - a.available;
  });

  const total = TOWERS.reduce((s, t) => ({
    available: s.available + t.available,
    hold: s.hold + t.hold,
    sold: s.sold + t.sold,
    units: s.units + t.units,
  }), { available: 0, hold: 0, sold: 0, units: 0 });

  return (
    <div style={{ animation: 'invFadeIn 0.4s ease' }}>
      {/* Summary strip */}
      <div style={{
        display: 'flex', gap: 0, marginBottom: 28,
        background: 'rgba(15,24,19,0.6)', border: `1px solid ${THEME.line}`,
        borderRadius: 16, overflow: 'hidden',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      }}>
        {[
          { label: 'Total Residences', val: total.units.toLocaleString('en-IN'), color: THEME.cream },
          { label: 'Available', val: total.available, color: THEME.green },
          { label: 'On Hold', val: total.hold, color: THEME.gold },
          { label: 'Sold', val: total.sold, color: 'rgba(200,100,100,0.75)' },
        ].map((item, i) => (
          <div key={i} style={{
            flex: 1, padding: '16px 20px', textAlign: 'center',
            borderLeft: i > 0 ? `1px solid ${THEME.lineSoft}` : 'none',
          }}>
            <div style={{ fontFamily: THEME.serif, fontSize: 28, fontWeight: 500, color: item.color, lineHeight: 1 }}>
              {item.val}
            </div>
            <div style={{ fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', color: THEME.dim, marginTop: 5 }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tower cards — 5 × 2 grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14,
      }}>
        {sorted.map((tower, idx) => {
          const soldOut = tower.available === 0;
          return (
            <div
              key={tower.id}
              className={`inv-tower-card${soldOut ? ' soldout' : ''}`}
              onClick={() => !soldOut && onSelect(tower)}
              style={{
                padding: '20px 18px 18px',
                background: soldOut
                  ? 'rgba(15,24,19,0.4)'
                  : 'rgba(19,30,23,0.72)',
                border: `1px solid ${soldOut ? 'rgba(217,178,122,0.12)' : THEME.line}`,
                borderRadius: 16,
                backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.38)',
                cursor: soldOut ? 'default' : 'pointer',
                animation: `invFadeUp 0.45s ease ${idx * 0.055}s both`,
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Sold-out overlay badge */}
              {soldOut && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  padding: '3px 8px', borderRadius: 999,
                  background: 'rgba(180,80,80,0.2)', border: '1px solid rgba(180,80,80,0.35)',
                  fontSize: 8.5, letterSpacing: 1.5, textTransform: 'uppercase',
                  color: 'rgba(200,100,100,0.8)',
                }}>Sold Out</div>
              )}

              {/* Tower number badge */}
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: THEME.goldSoft, border: `1px solid ${THEME.lineSoft}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700, letterSpacing: 0.5, color: THEME.gold,
                marginBottom: 10,
              }}>T{tower.no}</div>

              {/* Tower name */}
              <div style={{
                fontFamily: THEME.serif, fontSize: 22, fontWeight: 500,
                color: soldOut ? THEME.dim : THEME.cream, letterSpacing: 0.2, lineHeight: 1.1,
                marginBottom: 4,
              }}>{tower.name}</div>

              {/* Cluster */}
              <div style={{
                fontSize: 9, letterSpacing: 1.8, textTransform: 'uppercase',
                color: THEME.dim, marginBottom: 12,
              }}>{tower.cluster}</div>

              {/* Availability bar */}
              <AvailBar
                available={tower.available}
                hold={tower.hold}
                sold={tower.sold}
                total={tower.units}
                height={4}
                animate={true}
              />

              {/* Counts row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 9, fontSize: 10 }}>
                <span style={{ color: THEME.green, fontWeight: 600 }}>
                  {soldOut ? '—' : `${tower.available} avail`}
                </span>
                <span style={{ color: 'rgba(244,234,216,0.38)', fontSize: 9 }}>
                  {tower.units} total
                </span>
              </div>

              {/* Typologies */}
              <div style={{
                marginTop: 11, paddingTop: 10, borderTop: `1px solid ${THEME.lineSoft}`,
                display: 'flex', flexWrap: 'wrap', gap: 4,
              }}>
                {tower.typologies.map(t => (
                  <span key={t} style={{
                    fontSize: 8.5, padding: '2px 7px', borderRadius: 999,
                    background: 'rgba(217,178,122,0.08)', border: `1px solid ${THEME.lineSoft}`,
                    color: THEME.dim, letterSpacing: 0.5,
                  }}>{t.replace('3 BHK ', '').replace('2 BHK ', '2BHK ')}</span>
                ))}
              </div>

              {/* View hint */}
              <div style={{
                marginTop: 8, fontSize: 9, color: 'rgba(244,234,216,0.35)',
                letterSpacing: 0.5, lineHeight: 1.4,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{tower.view}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── STEP 2 — Floor Elevation (redesigned) ────────────────────
function FloorElevation({ tower, onSelect, onTower }) {
  const [hovered, setHovered] = React.useState(null);
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);
  const railRef = React.useRef(null);

  // Inject additional keyframes for this screen once
  React.useEffect(() => {
    const id = 'fe-styles';
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id;
    s.textContent = `
      @keyframes feImgIn    { from { opacity:0; transform:scale(1.04) } to { opacity:1; transform:scale(1) } }
      @keyframes feSlideUp  { from { opacity:0; transform:translateY(22px) } to { opacity:1; transform:translateY(0) } }
      @keyframes feSlideR   { from { opacity:0; transform:translateX(18px) } to { opacity:1; transform:translateX(0) } }
      @keyframes feFloorIn  { from { opacity:0; transform:translateX(8px) } to { opacity:1; transform:translateX(0) } }
      @keyframes fePulse    { 0%,100%{opacity:.55} 50%{opacity:1} }
      @keyframes feKenBurns { 0%{transform:scale(1) translate(0,0)} 100%{transform:scale(1.035) translate(-8px,4px)} }
      .fe-tower-chip { transition: background .22s, border-color .22s, color .22s, box-shadow .22s; cursor: pointer; }
      .fe-tower-chip:hover { border-color: rgba(217,178,122,0.55) !important; background: rgba(217,178,122,0.14) !important; }
      .fe-tower-chip.active { background: rgba(217,178,122,0.18) !important; border-color: rgba(217,178,122,0.65) !important; }
      .fe-floor-row { transition: background .18s, border-color .18s; cursor: pointer; }
      .fe-floor-row.no-avail { opacity: 0.52; }
      .fe-floor-row:hover { background: rgba(217,178,122,0.1) !important; border-color: rgba(217,178,122,0.4) !important; }
      .fe-floor-row.hov { background: rgba(217,178,122,0.12) !important; border-color: rgba(217,178,122,0.5) !important; }
    `;
    document.head.appendChild(s);
  }, []);

  // Pre-compute all floors (tower.floors, usually 24)
  const totalFloors = tower.floors || 24;
  const floors = React.useMemo(() => {
    return Array.from({ length: totalFloors }, (_, i) => {
      const floorNo = totalFloors - i; // top floor first
      return { floorNo, ...getFloorSummary(tower, floorNo) };
    });
  }, [tower.id, totalFloors]);

  // Scroll floor rail to show selected / hovered floor
  React.useEffect(() => {
    if (!hovered || !railRef.current) return;
    const idx = totalFloors - hovered; // index in floors array
    const rowH = 30; // approx row height + gap
    const targetScroll = idx * rowH - railRef.current.clientHeight / 2 + rowH;
    railRef.current.scrollTop = Math.max(0, targetScroll);
  }, [hovered, totalFloors]);

  const hFloor = hovered ? floors.find(f => f.floorNo === hovered) : null;

  // ScreenShell content area after the breadcrumb is approx. 686px tall.
  const BODY_H = 686;

  return (
    <div style={{
      position: 'relative', height: BODY_H, borderRadius: 18, overflow: 'hidden',
      background: THEME.bg, animation: 'invFadeIn 0.45s ease',
    }}>
      {/* ── Full-bleed tower image ────────────────────────────── */}
      <img
        src="assets/tower-single.webp"
        alt={`${tower.name} tower`}
        onLoad={() => setImgLoaded(true)}
        onError={() => setImgError(true)}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center 42%',
          pointerEvents: 'none', userSelect: 'none',
          opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.9s ease',
          animation: imgLoaded
            ? 'feImgIn 1.2s cubic-bezier(0.22,1,0.36,1) both, feKenBurns 26s ease-in-out 1.2s infinite alternate'
            : 'none',
        }}
      />
      {imgError && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <div style={{ fontFamily: THEME.serif, fontSize: 64, color: 'rgba(217,178,122,0.16)', letterSpacing: 2 }}>
            {tower.name}
          </div>
          <div style={{ fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(244,234,216,0.2)' }}>
            Tower Elevation
          </div>
        </div>
      )}

      {/* Scrims — keep the overlaid text & panel legible over the image */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(100deg, rgba(8,13,9,0.94) 0%, rgba(8,13,9,0.5) 25%, rgba(8,13,9,0) 45%, rgba(8,13,9,0) 60%, rgba(8,13,9,0.55) 82%, rgba(8,13,9,0.95) 100%)',
      }}/>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(8,13,9,0.5) 0%, rgba(8,13,9,0) 20%, rgba(8,13,9,0) 74%, rgba(8,13,9,0.8) 100%)',
      }}/>

      {/* Floor highlight band on the tower (on hover) */}
      {hovered && (function () {
        const pct = ((hovered - 1) / (totalFloors - 1)) * 100;
        const towerTop = 14, towerBot = 88;
        const bandBot = towerTop + (1 - pct / 100) * (towerBot - towerTop);
        const bandH = (towerBot - towerTop) / totalFloors * 0.9;
        return (
          <div style={{
            position: 'absolute', left: '31%', right: '36%',
            top: `${bandBot - bandH}%`, height: `${bandH + 0.3}%`,
            background: 'rgba(217,178,122,0.2)',
            border: '1px solid rgba(217,178,122,0.6)',
            borderRadius: 2, pointerEvents: 'none',
            animation: 'invFadeIn 0.18s ease',
            boxShadow: '0 0 22px rgba(217,178,122,0.25)',
          }}/>
        );
      })()}

      {/* ── Tower identity — overlaid, top-left ───────────────── */}
      <div style={{
        position: 'absolute', top: 32, left: 36, width: 272,
        animation: 'feSlideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.3s both',
      }}>
        <div style={{
          fontSize: 9, letterSpacing: 3, textTransform: 'uppercase',
          color: THEME.gold, marginBottom: 7, fontFamily: THEME.sans,
        }}>Tower {tower.no} · {tower.cluster}</div>
        <div style={{
          fontFamily: THEME.serif, fontSize: 54, fontWeight: 400, color: THEME.cream,
          letterSpacing: 0.5, lineHeight: 0.98, marginBottom: 15,
          textShadow: '0 4px 32px rgba(0,0,0,0.92)',
        }}>{tower.name}</div>
        <div style={{ marginBottom: 9 }}>
          <AvailBar available={tower.available} hold={tower.hold}
            sold={tower.sold} total={tower.units} height={4} animate={true}/>
        </div>
        <div style={{ display: 'flex', gap: 15, fontSize: 11, marginBottom: 13 }}>
          <span style={{ color: THEME.green, fontWeight: 600 }}>{tower.available} available</span>
          <span style={{ color: THEME.dim }}>{tower.units} homes</span>
          <span style={{ color: THEME.dim }}>{tower.floors} floors</span>
        </div>
        <div style={{
          fontSize: 10.5, color: 'rgba(244,234,216,0.58)', lineHeight: 1.55,
          paddingTop: 12, borderTop: `1px solid ${THEME.lineSoft}`,
        }}>
          <span style={{ color: 'rgba(217,178,122,0.72)', fontWeight: 600, letterSpacing: 1.2, fontSize: 9 }}>VIEW</span>
          <br/>{tower.view}
        </div>
      </div>

      {/* ── Floor hover callout — top centre ──────────────────── */}
      {hFloor && (
        <div style={{
          position: 'absolute', top: 28, left: '45%', transform: 'translateX(-50%)',
          padding: '12px 22px', borderRadius: 12,
          background: 'rgba(10,17,12,0.9)', border: `1px solid ${THEME.lineStrong}`,
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          animation: 'feSlideUp 0.2s ease both', textAlign: 'center',
          minWidth: 210, zIndex: 6,
        }}>
          <div style={{
            fontSize: 8.5, letterSpacing: 2.5, textTransform: 'uppercase',
            color: hovered >= 22 ? THEME.gold : hovered >= 16 ? 'rgba(217,178,122,0.75)' : THEME.dim,
            marginBottom: 3,
          }}>
            {hovered >= 22 ? 'Sky Floor' : hovered >= 16 ? 'High Floor' : 'Floor'} {hovered}
          </div>
          <div style={{
            fontFamily: THEME.serif, fontSize: 21, color: THEME.cream,
            fontWeight: 400, marginBottom: 8, lineHeight: 1,
          }}>
            {hFloor.available > 0 ? `${hFloor.available} of ${hFloor.total} available` : 'No units available'}
          </div>
          <AvailBar available={hFloor.available} hold={hFloor.hold}
            sold={hFloor.sold} total={hFloor.total} height={5} animate={false}/>
          {hovered >= 16 && (
            <div style={{ marginTop: 7, fontSize: 9, color: THEME.gold, letterSpacing: 0.5 }}>
              ✦ Floor-rise premium · elevated views
            </div>
          )}
        </div>
      )}

      {/* ── Floor selection panel — overlaid on the right ─────── */}
      <div style={{
        position: 'absolute', top: 22, right: 22, bottom: 22, width: 216,
        display: 'flex', flexDirection: 'column',
        background: 'rgba(11,18,14,0.82)', border: `1px solid ${THEME.line}`,
        borderRadius: 16,
        backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
        animation: 'feSlideR 0.6s cubic-bezier(0.22,1,0.36,1) 0.35s both',
      }}>
        <div style={{ padding: '15px 16px 12px', borderBottom: `1px solid ${THEME.lineSoft}`, flexShrink: 0 }}>
          <div style={{ fontSize: 9, letterSpacing: 2.8, textTransform: 'uppercase', color: THEME.gold }}>
            Select a Floor
          </div>
          <div style={{ fontSize: 9.5, color: THEME.dim, marginTop: 3 }}>
            {totalFloors} floors · tap to choose
          </div>
          <div style={{ display: 'flex', gap: 10, fontSize: 9, marginTop: 8 }}>
            {[
              { label: 'Avail', color: '#7fb955' },
              { label: 'Hold', color: THEME.gold },
              { label: 'Sold', color: 'rgba(180,80,80,0.6)' },
            ].map(({ label, color }) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: color }}/>
                <span style={{ color: THEME.dim }}>{label}</span>
              </span>
            ))}
          </div>
        </div>
        <div ref={railRef} style={{
          flex: 1, overflowY: 'auto', padding: '8px',
          scrollbarWidth: 'thin', scrollbarColor: 'rgba(217,178,122,0.2) transparent',
        }}>
          {floors.map(({ floorNo, available, hold, sold, total: tot, units: floorUnits }, idx) => {
            const isHov = hovered === floorNo;
            const noAvail = available === 0;
            const isPH = floorNo >= 22;
            const isHi = floorNo >= 16 && floorNo < 22;
            return (
              <div key={floorNo}
                className={`fe-floor-row${noAvail ? ' no-avail' : ''}${isHov ? ' hov' : ''}`}
                onMouseEnter={() => setHovered(floorNo)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSelect(floorNo)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '5px 7px', borderRadius: 7, marginBottom: 2,
                  border: `1px solid ${isHov ? 'rgba(217,178,122,0.45)' : 'transparent'}`,
                  background: isHov ? 'rgba(217,178,122,0.1)' : 'transparent',
                  animation: `feFloorIn 0.3s ease ${idx * 0.008}s both`,
                  cursor: 'pointer',
                }}>
                <div style={{
                  width: 26, textAlign: 'right', flexShrink: 0,
                  fontSize: isPH ? 9 : 10, fontWeight: isPH ? 700 : 500,
                  color: isPH ? THEME.gold : isHi ? 'rgba(217,178,122,0.7)' : THEME.dim,
                  lineHeight: 1,
                }}>
                  {isPH ? (
                    <span>
                      <span style={{ fontSize: 7, display: 'block', letterSpacing: 0.5, lineHeight: 1, color: THEME.gold }}>PH</span>
                      {floorNo}
                    </span>
                  ) : floorNo}
                </div>
                <div style={{ flex: 1, display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  {(floorUnits || []).map((u, i) => (
                    <div key={i} style={{
                      flex: 1, height: isPH ? 11 : 8, borderRadius: 2,
                      background: u.status === 'available'
                        ? (isHov ? '#7fb955' : 'rgba(127,185,85,0.7)')
                        : u.status === 'hold'
                        ? (isHov ? THEME.gold : 'rgba(217,178,122,0.55)')
                        : 'rgba(180,80,80,0.35)',
                      transition: 'background 0.18s, height 0.18s',
                    }}/>
                  ))}
                </div>
                <div style={{
                  width: 20, textAlign: 'right', flexShrink: 0,
                  fontSize: 9, fontWeight: available > 0 ? 600 : 400,
                  color: available > 0 ? (isHov ? THEME.green : 'rgba(127,185,85,0.7)') : 'rgba(244,234,216,0.18)',
                }}>
                  {available > 0 ? available : '—'}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{
          padding: '10px 14px', borderTop: `1px solid ${THEME.lineSoft}`,
          fontSize: 9, color: 'rgba(244,234,216,0.32)', lineHeight: 1.5,
          textAlign: 'center', flexShrink: 0,
        }}>
          {hovered ? `Floor ${hovered} · tap to open` : 'Hover to preview · tap to open'}
        </div>
      </div>
    </div>
  );
}

// ── STEP 3 — Unit Grid ────────────────────────────────────────
function UnitGrid({ tower, floorNo, onSelect }) {
  const [hovered, setHovered] = React.useState(null);
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const units = React.useMemo(() => getFloorUnits(tower, floorNo), [tower.id, floorNo]);

  // 10 unit shapes traced on the floor-plate render (client SVG, viewBox 1086 x 1448)
  const VBW = 1086, VBH = 1448;
  const POLYS = [
  {p:"171.63 1318.67 206.05 1118.05 271.94 1122.97 271.94 1135.75 295.55 1138.7 290.63 1168.21 408.64 1179.02 414.54 1153.46 444.05 1158.37 424.38 1295.07 422.41 1308.84 408.64 1306.87 389.96 1426.85 365.37 1426.85 361.44 1387.51 222.77 1371.78 216.87 1356.04 176.55 1352.11 171.63 1318.67",cx:307.8,cy:1272.4},
  {p:"483.38 1437.67 483.38 1406.2 491.25 1312.77 476.5 1312.77 476.5 1295.07 491.25 1161.32 521.74 1165.26 521.74 1187.88 629.92 1201.64 629.92 1180.01 655.49 1180.99 655.49 1166.24 722.36 1172.14 697.77 1409.15 650.57 1402.27 646.64 1420.95 514.85 1404.23 507.97 1437.67 483.38 1437.67",cx:599.4,cy:1299.5},
  {p:"227.69 1104.28 221.79 1060.03 253.26 875.14 261.58 875.14 263.67 862.3 342.82 867.38 338.94 908.89 454.22 918.74 448.16 963.92 482.43 968.37 476.5 1048.92 474.42 1054.71 441.04 1054.26 433.47 1125.47 419.67 1125.47 419.67 1107.67 262.57 1092.09 263.46 1107.23 227.69 1104.28",cx:352.1,cy:993.9},
  {p:"297.28 848.65 265.68 845.98 261.23 800.14 297.28 574.49 363.6 581.61 363.6 563.37 403.65 565.59 393.42 635.91 504.24 646.59 497.11 702.22 525.15 706.01 515.81 797.02 487.32 796.58 477.53 893.15 458.84 890.93 461.07 847.31 295.95 830.85 297.28 848.65",cx:393.2,cy:728.3},
  {p:"330.75 535.24 359.13 352.19 373.03 352.19 373.03 335.97 440.23 342.34 436.18 370.72 547.98 381.73 538.13 435.6 560.72 435.6 552.61 539.87 534.65 537.55 531.18 623.29 514.38 620.39 516.12 578.1 363.6 563.37 365.07 536.89 330.75 535.24",cx:445.7,cy:479.6},
  {p:"404.89 307 404.89 286.73 371.3 283.25 396.21 100.78 404.89 100.78 408.95 88.04 448.34 88.04 448.34 79.35 458.19 79.35 458.19 73.56 537.55 80.51 528.86 132.64 579.84 134.96 574.62 174.93 596.63 176.67 587.37 268.19 573.46 266.45 567.67 350.45 553.77 348.13 553.19 316.27 404.89 307",cx:484.0,cy:212.0},
  {p:"622.7 179.56 615.17 248.5 615.17 266.45 622.7 268.77 615.17 358.56 626.18 358.56 630.23 323.8 732.18 333.65 728.71 366.67 782 369.56 784.9 317.43 816.76 318.59 841.09 125.11 785.48 125.11 786.06 103.68 714.23 95.57 706.7 146.54 658.04 140.17 652.24 181.3 622.7 179.56",cx:728.1,cy:232.6},
  {p:"615.17 386.94 608.8 443.13 585.05 443.13 576.94 514.38 596.63 514.38 589.1 586.79 754.78 598.96 761.73 572.31 801.12 574.05 822.55 374.2 728.71 366.67 727.07 396.86 615.17 386.94",cx:699.7,cy:482.8},
  {p:"579.84 655.15 572.88 710.18 547.98 706.12 540.44 777.95 571.73 782.01 560.14 859.63 711.33 874.11 715.38 847.46 750.14 849.2 782 636.61 693.37 630.82 688.74 664.99 579.84 655.15",cx:661.2,cy:752.5},
  {p:"550.87 932.62 546.24 974.32 513.22 970.27 504.53 1042.1 539.87 1045 527.7 1127.25 695.11 1137.68 698.01 1105.82 742.61 1109.29 764.62 908.87 667.88 902.49 663.25 939.57 550.87 932.62",cx:634.6,cy:1020.1}
];

  React.useEffect(() => {
    const id = 'ug-styles';
    if (document.getElementById(id)) return;
    const s = document.createElement('style'); s.id = id;
    s.textContent = '@keyframes ugGlow{0%,100%{opacity:.26}50%{opacity:.5}}'
      + '@keyframes ugMark{from{opacity:0;transform:translate(-50%,-50%) scale(.5)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}';
    document.head.appendChild(s);
  }, []);

  const available = units.filter(u => u.status === 'available').length;
  const hold = units.filter(u => u.status === 'hold').length;
  const sold = units.filter(u => u.status === 'sold').length;

  const SC = {
    available: { glow: '#7fb955', dot: '#7fb955', label: 'Available' },
    hold:      { glow: '#e0b24c', dot: THEME.gold, label: 'On Hold' },
    sold:      { glow: '#b45454', dot: 'rgba(206,120,120,0.85)', label: 'Sold' },
  };

  const DISP_H = 686;
  const DISP_W = DISP_H * VBW / VBH;

  const hUnit = hovered != null ? units[hovered] : null;
  const hTyp = hUnit ? (TYPOLOGIES.find(t => t.code === hUnit.typCode) || TYPOLOGIES[3]) : null;
  const hAreas = hUnit ? (hUnit.facing === 'E' ? hTyp.east : hTyp.west) : null;

  return (
    <div style={{ display: 'flex', gap: 26, height: DISP_H, animation: 'invFadeIn 0.45s ease' }}>

      {/* ── LEFT — info panel ─────────────────────────────────── */}
      <div style={{ width: 312, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: THEME.gold, marginBottom: 7 }}>
          {tower.name} · Floor {floorNo}{floorNo >= 22 ? ' · Sky Floor' : floorNo >= 16 ? ' · High Floor' : ''}
        </div>
        <div style={{ fontFamily: THEME.serif, fontSize: 35, color: THEME.cream, lineHeight: 1.04, marginBottom: 7 }}>
          Select your home
        </div>
        <div style={{ fontSize: 11, color: THEME.dim, marginBottom: 18, lineHeight: 1.55 }}>
          {units.length} residences on this floor — tap a glowing unit on the plan to view its pricing.
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[['Available', available, SC.available.dot], ['On Hold', hold, THEME.gold], ['Sold', sold, 'rgba(206,120,120,0.7)']].map(([l, n, c]) => (
            <div key={l} style={{
              flex: 1, padding: '11px 6px', borderRadius: 11, textAlign: 'center',
              background: 'rgba(15,24,19,0.55)', border: '1px solid ' + THEME.lineSoft,
            }}>
              <div style={{ fontFamily: THEME.serif, fontSize: 23, color: THEME.cream, lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: c, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{
          flex: 1, borderRadius: 14, padding: 18,
          background: 'rgba(13,20,16,0.7)',
          border: '1px solid ' + (hUnit ? SC[hUnit.status].glow + '66' : THEME.lineSoft),
          transition: 'border-color 0.25s',
        }}>
          {hUnit ? (
            <div style={{ animation: 'invFadeIn 0.2s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: SC[hUnit.status].dot }}/>
                <span style={{ fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: SC[hUnit.status].dot, fontWeight: 600 }}>
                  {SC[hUnit.status].label}</span>
              </div>
              <div style={{ fontSize: 8.5, letterSpacing: 2, textTransform: 'uppercase', color: THEME.dim }}>Unit No.</div>
              <div style={{ fontFamily: THEME.serif, fontSize: 30, color: THEME.cream, lineHeight: 1.1, marginBottom: 7 }}>{hUnit.no}</div>
              <div style={{ fontSize: 12, color: THEME.gold, marginBottom: 12 }}>{hTyp.name} · {hUnit.facing === 'E' ? 'East' : 'West'} facing</div>
              <div style={{ display: 'flex', gap: 16, fontSize: 10, marginBottom: 13 }}>
                <div>
                  <div style={{ color: 'rgba(244,234,216,0.4)', letterSpacing: 1, textTransform: 'uppercase', fontSize: 8 }}>Saleable</div>
                  <div style={{ color: THEME.cream, fontWeight: 600, marginTop: 2 }}>{hAreas.saleable} sft</div>
                </div>
                <div>
                  <div style={{ color: 'rgba(244,234,216,0.4)', letterSpacing: 1, textTransform: 'uppercase', fontSize: 8 }}>Carpet</div>
                  <div style={{ color: THEME.cream, fontWeight: 600, marginTop: 2 }}>{hAreas.carpet} sft</div>
                </div>
              </div>
              <div style={{ paddingTop: 11, borderTop: '1px solid ' + THEME.lineSoft }}>
                <div style={{ fontSize: 8.5, color: THEME.dim, letterSpacing: 1.5, textTransform: 'uppercase' }}>Price from</div>
                <div style={{ fontFamily: THEME.serif, fontSize: 25, color: THEME.gold, marginTop: 2 }}>{formatINR(hTyp.priceFrom)}</div>
              </div>
              {hUnit.status !== 'sold' && (
                <div style={{
                  marginTop: 13, padding: '9px', borderRadius: 9, textAlign: 'center',
                  background: 'rgba(127,185,85,0.12)', border: '1px solid rgba(127,185,85,0.3)',
                  fontSize: 9.5, color: THEME.green, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600,
                }}>Tap the unit to view pricing →</div>
              )}
            </div>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              height: '100%', textAlign: 'center', gap: 10,
            }}>
              <div style={{ fontSize: 30, opacity: 0.25 }}>✦</div>
              <div style={{ fontSize: 11, color: THEME.dim, lineHeight: 1.7 }}>
                Hover a unit on the floor plan<br/>to preview its details
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── CENTRE — floor-plate with glowing unit buttons ────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'relative', width: DISP_W, height: DISP_H }}>
          <img
            src="assets/unit-floor.jpg" alt="Floor plan" draggable={false}
            onLoad={() => setImgLoaded(true)}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', borderRadius: 14,
              boxShadow: '0 30px 70px rgba(0,0,0,0.6)',
              opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.8s ease',
              animation: imgLoaded ? 'invScaleIn 0.9s ease both' : 'none',
              pointerEvents: 'none', userSelect: 'none',
            }}
          />
          {/* SVG glowing unit buttons — 40% fill so the plan shows through */}
          <svg viewBox={'0 0 ' + VBW + ' ' + VBH} preserveAspectRatio="none"
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              mixBlendMode: 'screen',
              opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.6s ease 0.35s',
            }}>
            <defs>
              <filter id="ugBlur" x="-35%" y="-35%" width="170%" height="170%">
                <feGaussianBlur stdDeviation="10"/>
              </filter>
            </defs>
            {POLYS.map((poly, i) => {
              const u = units[i]; if (!u) return null;
              const c = SC[u.status]; const hov = hovered === i;
              const clickable = u.status !== 'sold';
              return (
                <g key={i}
                  onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                  onClick={() => clickable && onSelect(u)}
                  style={{ cursor: clickable ? 'pointer' : 'default' }}>
                  <polygon points={poly.p} fill={c.glow}
                    style={{
                      filter: 'url(#ugBlur)',
                      opacity: hov ? 0.55 : undefined,
                      animation: hov ? 'none' : 'ugGlow ' + (3 + i * 0.21).toFixed(2) + 's ease-in-out ' + (i * 0.16).toFixed(2) + 's infinite',
                    }}/>
                  <polygon points={poly.p} fill={c.glow}
                    fillOpacity={hov ? 0.55 : 0.4}
                    stroke={c.glow} strokeWidth={hov ? 5 : 2.4} strokeOpacity={hov ? 1 : 0.75}
                    strokeLinejoin="round"
                    style={{ transition: 'fill-opacity 0.2s, stroke-width 0.2s' }}/>
                </g>
              );
            })}
          </svg>
          {/* Unit markers — number + BHK */}
          {POLYS.map((poly, i) => {
            const u = units[i]; if (!u) return null;
            const typ = TYPOLOGIES.find(t => t.code === u.typCode) || TYPOLOGIES[3];
            const c = SC[u.status]; const hov = hovered === i;
            const clickable = u.status !== 'sold';
            const left = poly.cx / VBW * DISP_W, top = poly.cy / VBH * DISP_H;
            return (
              <div key={i}
                className="ug-marker"
                onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                onClick={() => clickable && onSelect(u)}
                style={{
                  position: 'absolute', left: left, top: top,
                  transform: 'translate(-50%,-50%)' + (hov ? ' scale(1.13)' : ''),
                  transformOrigin: 'center', cursor: clickable ? 'pointer' : 'default',
                  zIndex: hov ? 25 : 12,
                  animation: 'ugMark 0.45s cubic-bezier(0.34,1.56,0.64,1) ' + (0.35 + i * 0.05).toFixed(2) + 's both',
                  transition: 'transform 0.2s',
                }}>
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  padding: '6px 12px', borderRadius: 11, whiteSpace: 'nowrap',
                  background: 'rgba(9,15,11,0.88)',
                  border: '1px solid ' + (hov ? c.glow : c.glow + '99'),
                  boxShadow: hov
                    ? '0 8px 24px rgba(0,0,0,0.65), 0 0 20px ' + c.glow + 'cc'
                    : '0 5px 14px rgba(0,0,0,0.55)',
                  transition: 'box-shadow 0.2s, border-color 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }}/>
                    <span style={{ fontFamily: THEME.serif, fontSize: 17, fontWeight: 600, color: THEME.cream, lineHeight: 1 }}>
                      {String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <span style={{ fontSize: 7.5, letterSpacing: 0.9, textTransform: 'uppercase', color: c.glow, fontWeight: 700 }}>
                    {typ.bhk} BHK
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── STEP 4 — Unit Price Detail ────────────────────────────────
function UnitPrice({ tower, floorNo, unit, onBook }) {
  const typ = TYPOLOGIES.find(t => t.code === unit.typCode) || TYPOLOGIES[3];
  const { basePrice, floorRise, gst, regStamp, total, areas } = calcPrice(typ, unit.facing, floorNo);

  const LineRow = ({ label, value, sub, accent, big, separator }) => (
    <>
      {separator && <div style={{ height: 1, background: THEME.lineSoft, margin: '4px 0' }}/>}
      <div style={{
        display: 'flex', alignItems: big ? 'flex-start' : 'center',
        justifyContent: 'space-between', padding: '8px 0',
      }}>
        <div>
          <div style={{
            fontSize: big ? 12 : 11, color: big ? THEME.cream : THEME.dim,
            fontWeight: big ? 600 : 400, letterSpacing: 0.3,
          }}>{label}</div>
          {sub && <div style={{ fontSize: 9.5, color: 'rgba(244,234,216,0.35)', marginTop: 2 }}>{sub}</div>}
        </div>
        <div style={{
          fontFamily: big ? THEME.serif : THEME.sans,
          fontSize: big ? 22 : 12,
          color: accent ? THEME.gold : THEME.cream,
          fontWeight: big ? 500 : 500,
          textAlign: 'right',
        }}>{value}</div>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', gap: 28, animation: 'invFadeIn 0.4s ease' }}>
      {/* Left — unit details */}
      <div style={{ flex: '0 0 340px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Unit identity card */}
        <div style={{
          padding: '24px 22px',
          background: 'rgba(19,30,23,0.72)', border: `1px solid ${THEME.lineStrong}`,
          borderRadius: 20, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          animation: 'invScaleIn 0.45s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <StatusDot status="available" size={9} />
            <span style={{ fontSize: 9.5, letterSpacing: 2, textTransform: 'uppercase', color: THEME.green, fontWeight: 600 }}>
              Available
            </span>
          </div>

          <div style={{ fontFamily: THEME.serif, fontSize: 40, fontWeight: 400, color: THEME.cream, lineHeight: 1 }}>
            {unit.no}
          </div>
          <div style={{ fontSize: 11, color: THEME.dim, marginTop: 4, marginBottom: 18, letterSpacing: 0.3 }}>
            Unit {unit.no}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Tower', val: tower.name },
              { label: 'Floor', val: `${floorNo}${floorNo >= 22 ? ' · Sky' : floorNo >= 16 ? ' · High' : ''}` },
              { label: 'Typology', val: typ.name },
              { label: 'Facing', val: `${unit.facing === 'E' ? 'East' : 'West'}` },
            ].map(({ label, val }) => (
              <div key={label} style={{
                padding: '9px 12px', borderRadius: 10,
                background: 'rgba(255,255,255,0.04)', border: `1px solid ${THEME.lineSoft}`,
              }}>
                <div style={{ fontSize: 8.5, letterSpacing: 1.5, textTransform: 'uppercase', color: THEME.dim, marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 11.5, color: THEME.cream, fontWeight: 600 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Areas */}
        <div style={{
          padding: '18px 20px', background: 'rgba(15,24,19,0.6)',
          border: `1px solid ${THEME.line}`, borderRadius: 16,
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        }}>
          <div style={{ fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', color: THEME.dim, marginBottom: 14 }}>
            Area Breakup
          </div>
          {[
            { label: 'Saleable Area', val: `${areas.saleable} sft`, big: true },
            { label: 'Carpet Area', val: `${areas.carpet} sft` },
            { label: 'Balcony / Utility', val: `${areas.balcony.toFixed(0)} sft` },
          ].map(({ label, val, big }, aIdx, arr) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '6px 0',
              borderBottom: aIdx < arr.length - 1 ? `1px solid ${THEME.lineSoft}` : 'none',
            }}>
              <span style={{ fontSize: 11, color: THEME.dim }}>{label}</span>
              <span style={{ fontSize: big ? 14 : 11, color: big ? THEME.cream : THEME.dim, fontWeight: big ? 700 : 400 }}>{val}</span>
            </div>
          ))}
        </div>

        {/* View */}
        <div style={{
          padding: '14px 18px', background: 'rgba(15,24,19,0.5)',
          border: `1px solid ${THEME.lineSoft}`, borderRadius: 12, fontSize: 10, lineHeight: 1.65,
        }}>
          <div style={{ color: THEME.gold, fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>View</div>
          <div style={{ color: THEME.dim }}>{tower.view}</div>
        </div>
      </div>

      {/* Right — price breakdown + CTA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Price heading */}
        <div style={{
          padding: '22px 26px',
          background: 'rgba(19,30,23,0.72)', border: `1px solid ${THEME.lineStrong}`,
          borderRadius: 20, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          animation: 'invSlideR 0.45s ease 0.1s both',
        }}>
          <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: THEME.dim, marginBottom: 6 }}>
            Indicative Price Breakdown
          </div>
          <div style={{ fontFamily: THEME.serif, fontSize: 42, fontWeight: 400, color: THEME.gold, lineHeight: 1, marginBottom: 4 }}>
            {formatINR(total)}
          </div>
          <div style={{ fontSize: 10.5, color: THEME.dim, letterSpacing: 0.3 }}>
            All-in (incl. GST + registration) · indicative
          </div>
        </div>

        {/* Price line-items */}
        <div style={{
          padding: '22px 24px', flex: 1,
          background: 'rgba(15,24,19,0.6)', border: `1px solid ${THEME.line}`,
          borderRadius: 18, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          animation: 'invSlideR 0.45s ease 0.18s both',
        }}>
          <div style={{ fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', color: THEME.dim, marginBottom: 8 }}>
            Cost Structure
          </div>

          <LineRow
            label="Base Price"
            sub={`${areas.saleable} sft × ₹${Math.round(typ.priceFrom / areas.saleable).toLocaleString('en-IN')}/sft`}
            value={formatINR(typ.priceFrom)}
          />
          <LineRow
            label={`Floor Rise Premium`}
            sub={`Floor ${floorNo} · +${((floorNo - 1) * 0.55).toFixed(1)}% above base`}
            value={floorRise > 0 ? `+${formatINR(floorRise)}` : '—'}
            accent={true}
          />
          <LineRow
            label="Agreement Value"
            value={formatINR(basePrice)}
            separator={true}
          />
          <LineRow
            label="GST @ 5%"
            sub="Applicable on agreement value"
            value={formatINR(gst)}
          />
          <LineRow
            label="Registration & Stamp Duty"
            sub="~5.6% (Karnataka, illustrative)"
            value={formatINR(regStamp)}
          />

          {/* Total */}
          <div style={{
            marginTop: 12, padding: '16px 18px', borderRadius: 12,
            background: 'rgba(217,178,122,0.07)', border: `1px solid ${THEME.lineStrong}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: THEME.dim }}>Total Outflow</div>
                <div style={{ fontSize: 9.5, color: 'rgba(244,234,216,0.35)', marginTop: 2 }}>All-inclusive · indicative</div>
              </div>
              <div style={{ fontFamily: THEME.serif, fontSize: 32, color: THEME.gold, fontWeight: 500 }}>
                {formatINR(total)}
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: 9.5, color: THEME.dim, lineHeight: 1.6 }}>
              {formatINRFull(total)} · please confirm final pricing with the sales team
            </div>
          </div>

          {/* EMI teaser */}
          <div style={{
            marginTop: 12, padding: '12px 16px', borderRadius: 10,
            background: 'rgba(127,185,85,0.06)', border: '1px solid rgba(127,185,85,0.15)',
            fontSize: 10.5, color: THEME.dim, lineHeight: 1.55,
          }}>
            <span style={{ color: THEME.green, fontWeight: 600 }}>EMI estimate · </span>
            ≈ {formatINR(Math.round(basePrice * 0.00756))}/mo at 8.5% for 20 yr · 80% LTV
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{
          padding: '10px 16px', borderRadius: 10,
          background: 'rgba(15,24,19,0.4)', border: `1px solid ${THEME.lineSoft}`,
          fontSize: 9, color: 'rgba(244,234,216,0.3)', lineHeight: 1.7,
          animation: 'invFadeIn 0.5s ease 0.3s both',
        }}>
          * Prices are illustrative and subject to final confirmation from Kalyani Developers. GST and registration charges are approximate. RERA: {window.PROJECT?.rera || 'PRM/KA/RERA/1251/309/PR/260924/007084'}.
        </div>

        {/* CTA */}
        <button
          className="inv-cta-btn"
          onClick={onBook}
          style={{
            width: '100%', padding: '17px 24px', borderRadius: 999,
            background: 'linear-gradient(135deg, #d9b27a, #b9874a)',
            color: '#1a2620', border: 'none', cursor: 'pointer',
            fontFamily: THEME.sans, fontSize: 13.5, fontWeight: 700,
            letterSpacing: 1, textTransform: 'uppercase',
            boxShadow: '0 16px 44px rgba(217,178,122,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            animation: 'invFadeUp 0.5s ease 0.25s both',
          }}
        >
          Proceed to Booking
          <span style={{ fontSize: 16 }}>→</span>
        </button>
      </div>
    </div>
  );
}

// ── Main InventoryScreen ──────────────────────────────────────
// ── Step 0 · 3D render hero — "Choose your tower" ──
function Tower3DHero({ onSelect }) {
  const [hover, setHover] = React.useState(null);
  const [mode, setMode] = React.useState("normal");
  const [divide, setDivide] = React.useState(720);
  const [cents, setCents] = React.useState([]);
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const [glowOn, setGlowOn]       = React.useState(false);
  const drag = React.useRef(false);
  const wrap = React.useRef(null);
  const pathRefs = React.useRef([]);
  const glowTimer = React.useRef(null);

  React.useEffect(() => {
    const id = "lt-t3d-glow";
    if (!document.getElementById(id)) {
      const s = document.createElement("style"); s.id = id;
      s.textContent = "@keyframes ltGlowPulse{0%,100%{opacity:.2}50%{opacity:.5}}"
        + "@keyframes ltNameIn{0%{opacity:0;transform:translateY(9px) scale(.92)}100%{opacity:1;transform:translateY(0) scale(1)}}"
        + "@keyframes ltNameFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}";
      document.head.appendChild(s);
    }
  }, []);

  // 10 tower shapes traced on the 3D render (client SVG, viewBox 1534.36 x 1022.93)
  const SHAPES = [
    {t:"p",d:"M985.42,732.65l4.88-74.33,3.8-45.03,20.62-152.45,2.17-8.14h6.51v-4.88h6.51l8.14-63.48,5.43-2.71v-7.6h16.28v5.97l14.65,1.09v-17.9h11.94v16.82h5.97l2.71-6.51,13.02,1.09v6.51h13.56l7.05,65.1-4.88,21.7.54,22.79-36.89,174.15-13.56,20.62-11.94,66.19s-4.34,5.43-13.02,6.51-53.17-2.17-53.17-2.17c0,0-10.85,0-10.31-23.33Z"},
    {t:"g",d:"239.47 610.44 166.25 449.53 166.25 445.25 166.25 440.57 172.28 425.76 178.74 425.76 180.89 419.34 186.06 419.34 179.6 402.19 192.09 376.87 200.27 376.87 198.98 372.58 202.86 365.96 208.03 365.96 211.9 359.73 210.18 354.66 211.9 346.09 218.37 346.09 221.38 339.86 219.66 332.84 221.81 327 229.13 327 232.15 319.6 230.43 312.58 232.15 306.74 239.47 306.74 241.63 300.9 245.5 300.9 241.63 289.21 252.39 265.83 261.01 265.83 263.16 259.99 259.72 256.09 265.75 242.45 271.35 242.45 273.5 238.56 277.81 238.56 281.68 236.22 285.56 236.22 288.58 243.23 297.62 243.62 295.47 249.08 299.77 249.47 307.1 238.56 313.56 239.34 325.19 242.06 357.16 363.31 352.69 373.39 355.67 383.09 346.1 386.39 339.63 404.35 334.79 417.36 326.94 437.56 334.03 465.91 333.66 480.46 283.47 612.53 239.47 610.44"},
    {t:"p",d:"M382.07,697.71s-6.8-5.2-4.8-9.2,4.8-9.2,4.8-9.2l-48-147.99v-8.8l-2-10.4,5.6-19.2-9.81-37.19,3.01-4.01-2.3-13.21,5.5-14.79,5.6-.8,4-6.4-3.2-11.6,6.4-15.2,6.4.8,2.8-6-2.8-11.6,6.4-15.2h7.2l-2.8-14,5.6-16.8h4.8l3.6-2.8h11.2v8.8h4.8l4.8-12h10.4l2,6.8h10.8v4.4l10.4.4,40,169.59-13.6,46.8,11.2,50.8-25.6,94.8s-2,12-62.4,3.2Z"},
    {t:"p",d:"M541.79,747.21l-1.97,14.75s.98,6.23,8.52,6.89c7.54.66,48.52,3.61,48.52,3.61,0,0,13.77.33,15.74-6.89s0-12.79,0-12.79l2.3-8.52-4.59-21.97,15.08-65.25,6.89,1.97,9.51-42.29-27.21-256.39-12.79-2.3-.33-3.93h-17.05l-1.97-9.84h-10.49l-4.59,15.74-7.87-.98-.98-6.23-14.1-1.97-.66,4.26-7.54-.66-2.3,7.21h-3.93l-3.61,17.7,1.64,11.15-5.25,2.62-2.3,10.16-3.93,16.39,3.61,14.43-1.31,3.93-3.61,1.97-3.61,17.38,12.79,69.18-2.95,15.41.98,9.51-6.56,14.1-4.26,19.02,30.16,162.62Z"},
    {t:"p",d:"M790.69,707.85v-147.56l2.7-20.19,4.32-12.41v-15.04l3.78-25.42v-28.05l5.39-9.71h5.93v-5.39h10.79l7.01-7.55,3.78-27.51v-27.51l4.85-7.55h18.88v5.39l11.87,3.24,3.24-19.42h11.87v19.96h7.55v-10.25h10.79v5.39h14.02l-12.95,238.95-5.39,2.7-2.16,42.07-22.11,21.58s-10.79,8.09-9.71,21.58-2.16,37.22-2.16,37.22l-32.9,28.05-10.25-12.95,4.32-16.72-2.16-29.67-31.28-3.24Z"},
    {t:"p",d:"M1257.91,726.86s0-47.48-16.1-60.36c-20.93-20.93-24.95-37.02-24.95-37.02v-28.97l-14.49-64.38,49.09-170.93h23.34v9.84h9.66v-9.84h12.07v6.75l8.05-.8,16.1-5.94,13.66,9.84,6.22,28.01,5.45,42.78h15.56l15.56,12.45v35l9.33,3.11v36.56l6.22,7v17.11l-63.01,169.8s4.67,13.78-4.67,13.78-53.29-.34-67.1-13.78Z"},
    {t:"p",d:"M1207.77,431.84l-9.67-62.46,4.83-22.31-.56-17.1,32.16-161.34,14.87-52.79h18.59l8.18,5.2v-10.41h11.9v11.9l31.23-2.23,8.92,78.81-43.12,159.86-32.5.74-24.27,80.27s-20.84,3.71-20.55-8.14Z"},
    {t:"p",d:"M1027.26,407.89l18.2-242.11,15.03-7.12,3.96-48.01,17.41-3.41,8.7,3.41v-8.16h12.66v8.16h28.48v74.92l-26.11,179.63-10.62-2-2.64,12.85h-4.27l-1.72-12.85h-13.95v13.46h-10.38v-5.09h-18.54l-9.74,34.79-2.24,19.73s-4.6-.41-4.23-6.31,0-11.89,0-11.89Z"},
    {t:"p",d:"M838.35,347v-194.95l4.4-26.41,3.77-25.78,7.55,2.63v-5.85h12.29v3.62l5.15.14v-6.26h12.94l-1.25,8.76,6.4-.42v-3.48l11.27-.14v4.45l7.65-.14v49.79l10.85.14v5.42h6.4v4.73l2.92.14-9.92,212.58h-11.78v-6.01h-18.75v-10.58h-18.27v16.59h-30.72s.2-28.97-.89-28.97Z"},
    {t:"g",d:"677.33 403.74 697.48 320.93 691.01 275.59 697.48 241.13 687.41 115.22 677.33 115.22 677.33 110.73 666.13 110.73 666.13 115.63 658.77 114.81 656.32 103.78 647.74 103.78 644.47 111.95 637.53 111.54 637.53 107.87 629.36 107.46 629.36 114.4 623.23 112.77 618.33 129.52 623.23 132.79 611.38 158.12 611.38 169.56 602.39 171.19 599.53 191.62 599.53 198.15 589.73 218.17 606.48 355.85 614.58 360.33 622 408.55 678.38 408.55 677.33 403.74"}
  ];
  const VBW = 1534.36, VBH = 1022.93;
  const NAMES = ["Walnut","Ashoka","Aspen","Chestnut","Coral","Mahogany","Plumeria","Tamarind","Laurel","Deodar"];
  const COL = [["#f5d98f","#e0a24c"],["#a3f0b4","#52c074"],["#92ede8","#3ab0aa"],["#f6b79c","#e07a52"],
    ["#a6cdf6","#5a8ee0"],["#f6e08f","#e0b840"],["#d8c0f4","#9a6fe0"],["#f6b0cc","#e06f96"],
    ["#cdec8f","#88bc44"],["#9eecf4","#42b8c8"]];
  const byName = (nm) => (typeof TOWERS !== "undefined" ? TOWERS.find((t) => t.name === nm) : null);

  const DS = 1440 / 1535, OY = (824 - 1024 * DS) / 2, IMGH = 1024 * DS;
  const compare = mode === "compare";

  React.useEffect(() => {
    if (compare || !imgLoaded) return;
    const c = pathRefs.current.map((el) => {
      if (!el) return null;
      const b = el.getBBox();
      return [(b.x + b.width / 2) / VBW * 1440, OY + (b.y + b.height / 2) / VBH * IMGH,
        OY + b.y / VBH * IMGH];
    });
    setCents(c);
  }, [mode, imgLoaded]);

  // Fire glow exactly 1 second after the night render image finishes loading
  React.useEffect(() => {
    if (!imgLoaded) return;
    glowTimer.current = setTimeout(() => setGlowOn(true), 1000);
    return () => { if (glowTimer.current) clearTimeout(glowTimer.current); };
  }, [imgLoaded]);

  const onMove = (e) => {
    if (!drag.current || !wrap.current) return;
    const r = wrap.current.getBoundingClientRect();
    setDivide(Math.max(46, Math.min(1394, (e.clientX - r.left) * (1440 / r.width))));
  };
  const endDrag = () => { drag.current = false; };

  return (
    <div ref={wrap} onPointerMove={onMove} onPointerUp={endDrag} onMouseLeave={endDrag}
      style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#070d09" }}>

      <img src="assets/towers-3d.jpg" alt="" draggable={false}
        onLoad={() => setImgLoaded(true)} style={{
        position: "absolute", left: 0, top: OY, width: 1440, height: IMGH,
        pointerEvents: "none", userSelect: "none", animation: "fadeIn .7s ease" }}/>
      {compare && (
        <img src="assets/towers-3d-day.jpg" alt="" draggable={false} style={{
          position: "absolute", left: 0, top: OY, width: 1440, height: IMGH,
          pointerEvents: "none", userSelect: "none",
          clipPath: "inset(0 " + (1440 - divide) + "px 0 0)" }}/>
      )}

      {/* glowing tower buttons — exact SVG shapes, fade in 1s after the image loads */}
      {!compare && imgLoaded && (
        <svg viewBox={"0 0 " + VBW + " " + VBH} preserveAspectRatio="none"
          style={{ position: "absolute", left: 0, top: OY, width: 1440, height: IMGH,
            mixBlendMode: "screen", zIndex: 14,
            opacity: glowOn ? 1 : 0, transition: "opacity .7s ease" }}>
          <defs>
            {SHAPES.map((s, i) => (
              <linearGradient key={i} id={"tg" + i} x1="0" y1="0" x2="0.4" y2="1">
                <stop offset="0%" stopColor={COL[i][0]}/>
                <stop offset="100%" stopColor={COL[i][1]}/>
              </linearGradient>
            ))}
            <filter id="tgblur" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="3.4"/>
            </filter>
          </defs>
          {SHAPES.map((s, i) => {
            const hov = hover === i;
            return React.createElement(s.t === "p" ? "path" : "polygon", {
              key: i,
              ref: (el) => { pathRefs.current[i] = el; },
              [s.t === "p" ? "d" : "points"]: s.d,
              fill: "url(#tg" + i + ")",
              stroke: COL[i][0], strokeWidth: hov ? 2.6 : 1.3, strokeOpacity: 0.92,
              onMouseEnter: () => setHover(i), onMouseLeave: () => setHover(null),
              onClick: () => { const t = byName(NAMES[i]); if (t) onSelect(t); },
              style: { cursor: "pointer",
                filter: hov ? "url(#tgblur) brightness(1.45)" : "url(#tgblur)",
                animation: "ltGlowPulse 3s ease-in-out " + (i * 0.22).toFixed(2) + "s infinite",
                transition: "stroke-width .2s, filter .2s" },
            });
          })}
        </svg>
      )}

      {/* tower markers — modern pointer + name callout — fade in 1s after image load */}
      {!compare && imgLoaded && cents.map((c, i) => {
        if (!c) return null;
        const hov = hover === i;
        const cx = c[0], topY = c[2];
        const chipTop = Math.max(4, topY - 59);
        const lineTop = chipTop + 21;
        const lineH = Math.max(0, topY - lineTop);
        const t = byName(NAMES[i]);
        const enter = () => setHover(i), leave = () => setHover(null);
        const pick = () => { if (t) onSelect(t); };
        const dz = hov ? 42 : 21;
        return (
          <React.Fragment key={i}>
            {lineH > 1 && (
              <div style={{ position: "absolute", left: cx, top: lineTop, width: hov ? 2 : 1.5,
                height: lineH, transform: "translateX(-50%)", zIndex: dz, pointerEvents: "none",
                transformOrigin: "top", background: "linear-gradient(to bottom," + COL[i][0] + "," + COL[i][1] + "44)",
                transition: "width .2s, opacity .7s ease",
                opacity: glowOn ? 1 : 0,
                animation: glowOn ? "ltNameIn .5s ease both" : "none",
                animationDelay: glowOn ? (0.2 + i * 0.09).toFixed(2) + "s" : "0s" }}/>
            )}
            <div onMouseEnter={enter} onMouseLeave={leave} onClick={pick}
              style={{ position: "absolute", left: cx, top: topY,
                width: hov ? 12 : 9, height: hov ? 12 : 9, borderRadius: "50%",
                transform: "translate(-50%,-50%)", zIndex: dz, cursor: "pointer",
                background: COL[i][0],
                boxShadow: "0 0 10px " + COL[i][0] + ", 0 0 0 " + (hov ? 5 : 3) + "px " + COL[i][1] + "33",
                transition: "all .2s, opacity .7s ease",
                opacity: glowOn ? 1 : 0,
                animation: glowOn ? "ltNameIn .5s ease both" : "none",
                animationDelay: glowOn ? (0.25 + i * 0.09).toFixed(2) + "s" : "0s" }}/>
            <div onMouseEnter={enter} onMouseLeave={leave} onClick={pick}
              style={{ position: "absolute", left: cx, top: chipTop,
                transform: "translateX(-50%)", zIndex: dz + 1, cursor: "pointer",
                padding: "4px 12px", borderRadius: 7, whiteSpace: "nowrap",
                fontFamily: THEME.sans, fontSize: 10, fontWeight: 700,
                letterSpacing: 1.7, textTransform: "uppercase",
                color: hov ? "#ffffff" : COL[i][0],
                background: hov ? "rgba(13,21,16,.97)" : "rgba(10,16,12,.82)",
                border: "1px solid " + COL[i][0] + (hov ? "" : "55"),
                boxShadow: hov ? "0 8px 22px rgba(0,0,0,.6), 0 0 18px " + COL[i][1] + "66"
                  : "0 4px 13px rgba(0,0,0,.5)",
                backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
                transition: "color .2s, background .2s, box-shadow .2s, border-color .2s, opacity .7s ease",
                opacity: glowOn ? 1 : 0,
                animation: glowOn ? "ltNameIn .5s cubic-bezier(.2,.8,.2,1) both" : "none",
                animationDelay: glowOn ? (0.15 + i * 0.09).toFixed(2) + "s" : "0s" }}>
              {NAMES[i]}
            </div>
          </React.Fragment>
        );
      })}

      {/* day / night wipe slider — compare mode */}
      {compare && (
        <React.Fragment>
          <div style={{ position: "absolute", left: divide, top: 0, bottom: 0, width: 2,
            background: "rgba(255,255,255,.9)", zIndex: 35, pointerEvents: "none",
            boxShadow: "0 0 18px rgba(255,255,255,.55)" }}/>
          <div onPointerDown={() => { drag.current = true; }}
            style={{ position: "absolute", left: divide, top: "50%", transform: "translate(-50%,-50%)",
              width: 48, height: 48, borderRadius: "50%", zIndex: 36, cursor: "ew-resize",
              background: "rgba(9,16,11,.94)", border: "2px solid #fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 22px rgba(0,0,0,.65)", color: "#fff", fontSize: 17 }}>{"\u21C4"}</div>
          <div style={{ position: "absolute", left: 18, top: 14, zIndex: 35, fontSize: 10.5, fontWeight: 700,
            letterSpacing: 2, textTransform: "uppercase", color: "#fff",
            background: "rgba(9,16,11,.62)", borderRadius: 999, padding: "6px 14px" }}>Day</div>
          <div style={{ position: "absolute", right: 18, top: 14, zIndex: 35, fontSize: 10.5, fontWeight: 700,
            letterSpacing: 2, textTransform: "uppercase", color: "#fff",
            background: "rgba(9,16,11,.62)", borderRadius: 999, padding: "6px 14px" }}>Night</div>
        </React.Fragment>
      )}

      {/* mode controls */}
      {!compare ? (
        <button onClick={() => { setMode("compare"); setHover(null); }}
          style={{ position: "absolute", right: 18, top: 14,
            zIndex: 38, cursor: "pointer", padding: "9px 18px", borderRadius: 999, fontFamily: THEME.sans,
            background: "rgba(9,16,11,.85)", border: "1px solid " + THEME.lineStrong,
            color: THEME.cream, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
          Day / Night view
        </button>
      ) : (
        <button onClick={() => setMode("normal")}
          style={{ position: "absolute", left: "50%", top: 14, transform: "translateX(-50%)",
            zIndex: 38, display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
            padding: "9px 18px 9px 13px", borderRadius: 999, fontFamily: THEME.sans,
            background: "rgba(9,16,11,.9)", border: "1px solid " + THEME.lineStrong,
            color: THEME.cream, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
          <span style={{ width: 18, height: 18, borderRadius: "50%", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: 13,
            background: THEME.goldSoft, border: "1px solid " + THEME.lineStrong }}>{"\u00D7"}</span>
          Close - back to towers
        </button>
      )}

      {/* hint */}
      <div style={{ position: "absolute", left: "50%", bottom: 24, transform: "translateX(-50%)",
        fontSize: 10.5, letterSpacing: 2, textTransform: "uppercase", color: THEME.dim,
        background: "rgba(7,13,9,.72)", border: "1px solid " + THEME.lineSoft,
        borderRadius: 999, padding: "8px 18px", zIndex: 35 }}>
        {compare ? "Drag the slider to compare day and night" : "Tap a glowing tower to choose your home"}
      </div>
    </div>
  );
}

function InventoryScreen({ onBack, navigate }) {
  React.useEffect(() => { injectStyles(); }, []);

  const [step, setStep]     = React.useState(0); // 0=towers, 1=floors, 2=units, 3=price
  const [tower, setTower]   = React.useState(null);
  const [floorNo, setFloor] = React.useState(null);
  const [unit, setUnit]     = React.useState(null);

  // Step labels for eyebrow
  const eyebrows = [
    'Select a Tower',
    `${tower ? tower.name + ' · ' : ''}Select a Floor`,
    `${tower ? tower.name + ' · ' : ''}Floor ${floorNo} · Select a Unit`,
    `${tower ? tower.name + ' · ' : ''}Floor ${floorNo} · Unit ${unit?.no}`,
  ];

  function goTower(t) { setTower(t); setFloor(null); setUnit(null); setStep(1); }
  function goFloor(f) { setFloor(f); setUnit(null); setStep(2); }
  function goUnit(u)  { setUnit(u);  setStep(3); }

  function jumpToTowers() { setTower(null); setFloor(null); setUnit(null); setStep(0); }
  function jumpToFloors() { if (tower) { setFloor(null); setUnit(null); setStep(1); } }
  function jumpToUnits()  { if (floorNo) { setUnit(null); setStep(2); } }

  const scroll = step === 1 ? false : true;

  // Step 0 — full-bleed 3D render hero
  if (step === 0) {
    return (
      <ScreenShell title="Inventory" eyebrow="Choose your tower" onBack={onBack}
        scroll={false} pad={false}>
        <Tower3DHero onSelect={goTower} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      title="Inventory"
      eyebrow={eyebrows[step]}
      onBack={onBack}
      scroll={scroll}
      pad={true}
    >
      {/* Breadcrumb — always visible */}
      <div style={{ marginBottom: 22 }}>
        <Breadcrumb
          tower={tower}
          floor={floorNo}
          unit={unit?.no}
          onTower={jumpToTowers}
          onFloor={jumpToFloors}
          onUnit={jumpToUnits}
        />
      </div>

      {/* Step content — key forces remount / animation on step change */}
      <div key={`step-${step}-${tower?.id}-${floorNo}`}>
        {step === 0 && <TowerGrid onSelect={goTower} />}
        {step === 1 && tower && <FloorElevation tower={tower} onSelect={goFloor} onTower={goTower} />}
        {step === 2 && tower && floorNo && <UnitGrid tower={tower} floorNo={floorNo} onSelect={goUnit} />}
        {step === 3 && tower && floorNo && unit && (
          <UnitPrice
            tower={tower}
            floorNo={floorNo}
            unit={unit}
            onBook={() => navigate('booking')}
          />
        )}
      </div>
    </ScreenShell>
  );
}

window.SCREENS = window.SCREENS || {};
window.SCREENS['inventory'] = InventoryScreen;

})();
