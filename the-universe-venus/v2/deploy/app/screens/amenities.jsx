// Amenities — three-column hi-fi viewer, replicated from the Embassy Citadel
// amenities layout (the stronger of our two reference builds) and re-skinned in
// The Universe's ivory/gold brand on this app's React/Babel stack.
//
// REFERENCE LAYOUT (Embassy Citadel · v4/amenities.html):
//   · LEFT editorial rail  — eyebrow + big serif "Amenities" + tagline + rule,
//     then a category list (icon · label · NN count) where one row is active,
//     and a LEVEL filter beneath it.
//   · CENTER column        — one large feature HERO plate (the active item's
//     render, or the group hero) with a soft gradient + caption, and a floating
//     prev / NN—NN counter / next control pill overlaid at the foot.
//   · RIGHT rail           — a vertical THUMBNAIL STACK of every item in the
//     active category (photo + name + level), active thumb carries a gold ring;
//     scrolls when the group has many items.
//
// Citadel chosen over Embassy One because its 3-column category-rail + hero +
// thumb-stack maps 1:1 onto our data (5 experience groups · 33 items · 4 levels)
// and is the richer, more catalogue-forward pattern. We use a RECTANGULAR hero
// plate (not Citadel's circle) — our client renders are wide 16:9 and read far
// better un-cropped in a rectangle.
//
// Data: AMENITY_GROUPS (5 groups · 33 items) · AMENITY_COUNT (33). Image paths
// assets/renders/client/<img>.jpg and <hero>.jpg. Falls back to the group hero
// on any per-item image error. Ends with window.Amenities = Amenities.

const AM_KEYS_ID = 'uni-amenities-keys';
function ensureAmKeys() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(AM_KEYS_ID)) return;
  const s = document.createElement('style');
  s.id = AM_KEYS_ID;
  s.textContent = `
    @keyframes amHeroIn {
      0%   { opacity: 0; transform: scale(1.05); }
      100% { opacity: 1; transform: scale(1.02); }
    }
    @keyframes amThumbIn {
      0%   { opacity: 0; transform: translateX(14px); }
      100% { opacity: 1; transform: translateX(0); }
    }
    .am-stack::-webkit-scrollbar { width: 8px; }
    .am-stack::-webkit-scrollbar-track { background: transparent; }
    .am-stack::-webkit-scrollbar-thumb { background: rgba(176,138,63,0.30); border-radius: 4px; }
    .am-stack::-webkit-scrollbar-thumb:hover { background: rgba(176,138,63,0.55); }
  `;
  document.head.appendChild(s);
}

const AM_R = (name) => `assets/renders/client/${name}.jpg`;

const AM_LEVELS = ['All', 'GF', 'Clubhouse', 'Podium', 'L2'];
const AM_LEVEL_LABEL = { All:'All Levels', GF:'Ground Floor', Clubhouse:'Clubhouse', Podium:'Podium', L2:'Level 2' };

// One-line editorial descriptor per experience group (Frank-Curator register).
const AM_DESC = {
  sport:     'A podium of courts, pitches and a running track for recreation at every age.',
  wellness:  'An Olympic-grade pool, jacuzzi, a clubhouse gym and a yoga & crossfit floor.',
  social:    'Banquet, café, library, games and guest rooms, interiors curated by HBA.',
  family:    'A crèche, kids’ water play and a dedicated children’s playground, safe by design.',
  landscape: 'Acres of landscaping by SWA: water features, seating gardens and accent groves.',
};

// ============================================================================
// AmImg — <img> that falls back to the group hero render on load error.
// ============================================================================
function AmImg({ src, fallback, alt, style, className }) {
  const triedRef = React.useRef(false);
  React.useEffect(() => { triedRef.current = false; }, [src]);
  return (
    <img src={src} alt={alt || ''} draggable="false" className={className} style={style}
      onError={(ev) => {
        if (!triedRef.current && fallback && ev.currentTarget.src.indexOf(fallback) === -1) {
          triedRef.current = true;
          ev.currentTarget.src = fallback;
        } else {
          ev.currentTarget.style.opacity = '0';
        }
      }}
    />
  );
}

// ============================================================================
// AmCategoryRow — left-rail entry: icon · label · count, active = gold tint.
// NOTE: namespaced (Am-) to avoid colliding with gallery.jsx's own top-level
// `CategoryRow` — both screens are <script type="text/babel"> sharing ONE
// global scope, so a bare `CategoryRow` here was being clobbered by gallery's
// (loaded later), which reads {label,count} → rendered literal "undefined".
// ============================================================================
function AmCategoryRow({ g, i, active, onClick, dens = 0 }) {
  const Icon = AM_ICONS[g.id] || AM_ICONS.sport;
  const t = useLoop();
  const iconSz = Math.round(30 + dens * 8);
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap: Math.round(18 + dens*4), width:'100%',
      height: Math.round(86 + dens*24), flexShrink:0, padding:`0 ${Math.round(22 + dens*4)}px`, borderRadius:16,
      border:'1px solid '+(active ? 'rgba(176,138,63,0.45)' : 'transparent'),
      background: active ? 'rgba(255,250,235,0.96)' : 'transparent',
      boxShadow: active
        ? '0 18px 40px rgba(50,32,12,0.16), 0 6px 14px rgba(40,28,10,0.10)'
        : 'none',
      cursor:'pointer', textAlign:'left',
      transform: active ? 'translateY(-1px)' : 'none',
      transition:'background 240ms ease, border-color 240ms ease, box-shadow 280ms ease, transform 200ms ease',
    }}
      onMouseEnter={(ev)=>{ if(!active){ ev.currentTarget.style.background='rgba(255,250,235,0.55)'; ev.currentTarget.style.borderColor='rgba(176,138,63,0.18)'; }}}
      onMouseLeave={(ev)=>{ if(!active){ ev.currentTarget.style.background='transparent'; ev.currentTarget.style.borderColor='transparent'; }}}
    >
      <div style={{width:iconSz, height:iconSz, flexShrink:0, color:'var(--gold-deep)', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <Icon active={active} drawT={t}/>
      </div>
      <div className="mono" style={{
        flex:1, fontSize: Math.round(17 + dens*4), letterSpacing:'0.26em', textTransform:'uppercase',
        color: active ? 'var(--ink)' : 'var(--graphite)', fontWeight: active ? 700 : 500,
      }}>{g.label}</div>
      <div className="mono" style={{
        fontSize: Math.round(17 + dens*3), letterSpacing:'0.14em', fontVariantNumeric:'tabular-nums',
        padding:`${Math.round(5+dens*2)}px ${Math.round(12+dens*3)}px`, borderRadius:11,
        border:'1px solid '+(active ? 'rgba(176,138,63,0.45)' : 'var(--line)'),
        background: active ? 'rgba(255,250,235,0.98)' : 'rgba(255,250,235,0.55)',
        color: active ? 'var(--gold-deep)' : 'var(--slate)',
      }}>{String(g.items.length).padStart(2,'0')}</div>
    </button>
  );
}

// ============================================================================
// LevelFilter — All / GF / Clubhouse / Podium / L2 pills (left rail foot)
// ============================================================================
function LevelFilter({ level, setLevel, dens = 0 }) {
  return (
    <div style={{display:'flex', flexWrap:'wrap', gap: Math.round(9 + dens*4)}}>
      {AM_LEVELS.map(lv => {
        const on = level === lv;
        return (
          <button key={lv} onClick={()=>setLevel(lv)} style={{
            padding:`${Math.round(10+dens*4)}px ${Math.round(17+dens*5)}px`, borderRadius:105, cursor:'pointer',
            border:'1px solid '+(on ? 'var(--gold-deep)' : 'var(--line)'),
            background: on ? 'var(--gold)' : 'rgba(255,250,235,0.55)',
            color: on ? '#1a130a' : 'var(--graphite)',
            fontFamily:'ui-monospace, monospace', fontSize: Math.round(17 + dens*3), letterSpacing:'0.16em',
            fontWeight: on ? 700 : 500, transition:'all 220ms', textTransform:'uppercase',
          }}
            onMouseEnter={(ev)=>{ if(!on) ev.currentTarget.style.background='rgba(201,160,94,0.14)'; }}
            onMouseLeave={(ev)=>{ if(!on) ev.currentTarget.style.background='rgba(255,250,235,0.55)'; }}
          >{lv}</button>
        );
      })}
    </div>
  );
}

// ============================================================================
// AmThumbCard — right-rail thumbnail: photo + name + level, active = gold ring.
// Namespaced (Am-) for the same global-scope reason as AmCategoryRow above.
// ============================================================================
function AmThumbCard({ item, idx, active, dimmed, fallback, onClick, dens = 0, thumbH = 150 }) {
  return (
    <button onClick={onClick} style={{
      position:'relative', width:'100%', height:thumbH, flexShrink:0,
      borderRadius:18, overflow:'hidden', padding:0, cursor: dimmed ? 'default' : 'pointer',
      background:'#0c0a07',
      border:'1px solid '+(active ? 'var(--gold)' : 'rgba(176,138,63,0.22)'),
      opacity: dimmed ? 0.28 : 1,
      filter: dimmed ? 'grayscale(0.6)' : 'none',
      boxShadow: active
        ? '0 0 0 2px var(--gold), 0 18px 36px rgba(50,32,12,0.34), 0 6px 12px rgba(40,28,10,0.14)'
        : '0 10px 24px rgba(50,32,12,0.20), 0 3px 6px rgba(40,28,10,0.10)',
      animation:`amThumbIn 460ms cubic-bezier(0.22,1,0.36,1) ${Math.min(idx,9)*48}ms both`,
      transition:'box-shadow 260ms ease, border-color 240ms ease, transform 240ms ease, opacity 320ms ease, filter 320ms ease',
    }}
      onMouseEnter={(ev)=>{ if(!dimmed && !active){ ev.currentTarget.style.transform='translateX(-3px)'; ev.currentTarget.style.borderColor='rgba(176,138,63,0.5)'; const im=ev.currentTarget.querySelector('img'); if(im) im.style.transform='scale(1.06)'; }}}
      onMouseLeave={(ev)=>{ ev.currentTarget.style.transform='none'; if(!active) ev.currentTarget.style.borderColor='rgba(176,138,63,0.22)'; const im=ev.currentTarget.querySelector('img'); if(im) im.style.transform='scale(1)'; }}
    >
      <AmImg src={AM_R(item.img)} fallback={fallback} alt={item.name}
        style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover',
          opacity:0.92, transition:'transform 480ms cubic-bezier(0.22,1,0.36,1)'}}/>
      <div style={{position:'absolute', inset:0, pointerEvents:'none',
        background:'linear-gradient(180deg, rgba(10,10,10,0.05) 0%, rgba(10,10,10,0.40) 50%, rgba(10,10,10,0.88) 100%)'}}/>
      {/* level badge */}
      <div style={{position:'absolute', top:12, right:12, padding:`${Math.round(4+dens*2)}px ${Math.round(11+dens*2)}px`, borderRadius:105,
        background:'rgba(14,12,9,0.62)', border:'1px solid rgba(232,215,168,0.42)', backdropFilter:'blur(6px)'}}>
        <span className="mono" style={{fontSize: 17 + dens*2, letterSpacing:'0.22em', color:'var(--gold-soft)', textTransform:'uppercase'}}>{item.level}</span>
      </div>
      {/* active "+" chip */}
      {active && (
        <div style={{position:'absolute', top:12, left:12, width:26, height:26, borderRadius:'50%',
          background:'rgba(250,246,232,0.95)', border:'1px solid var(--gold)',
          display:'flex', alignItems:'center', justifyContent:'center', color:'var(--gold-deep)'}}>
          <Icons.check width={14} height={14}/>
        </div>
      )}
      {/* name */}
      <div style={{position:'absolute', left:18, right:18, bottom: Math.round(14+dens*4), textAlign:'left'}}>
        <span className="serif" style={{fontSize: Math.round(24 + dens*6), fontWeight:300, letterSpacing:'-0.01em',
          color:'rgba(250,246,232,0.98)', textShadow:'0 4px 14px rgba(0,0,0,0.55)', lineHeight:1.08, display:'block'}}>
          {item.name}
        </span>
      </div>
    </button>
  );
}

// ============================================================================
// Amenities — the screen.
// ============================================================================
function Amenities() {
  ensureAmKeys();
  const t = useLoop();
  const groups = AMENITY_GROUPS;

  // Canvas-height density factor: 0 on the 16:10 tablet (1600), 1 on iPad Pro 4:3
  // (1920). Drives type + breathing room so the screen reads FULL at both aspects
  // without regressing the primary tablet. useLoop re-renders so this stays live.
  const CH = (typeof window !== 'undefined' && window.UNIVERSE_CANVAS && window.UNIVERSE_CANVAS.H) || 1600;
  const dens = clamp((CH - 1600) / 320);

  const [catIdx, setCatIdx]   = React.useState(0);
  const [subIdx, setSubIdx]   = React.useState(0);
  const [level, setLevel]     = React.useState('All');
  const stackRef = React.useRef(null);

  // ── Zoom / pan / swipe state for the center hero plate ──────────────────
  const [zoom, setZoom]   = React.useState(1);     // 1× … 3×
  const [pan, setPan]     = React.useState({ x:0, y:0 }); // px, when zoomed
  const [swipeDX, setSwipeDX] = React.useState(0); // transient drag feedback @1×
  const wrapRef = React.useRef(null);
  const dragRef = React.useRef(null);

  const ZMIN = 1, ZMAX = 3;
  // clamp a pan offset to the image's overflow bounds at a given zoom.
  const clampPan = (p, z) => {
    const el = wrapRef.current;
    const w = el ? el.clientWidth : 0, h = el ? el.clientHeight : 0;
    const mx = Math.max(0, (w * (z - 1)) / 2);
    const my = Math.max(0, (h * (z - 1)) / 2);
    return { x: clamp(p.x, -mx, mx), y: clamp(p.y, -my, my) };
  };
  const applyZoom = (nz, focus) => {
    const z = clamp(nz, ZMIN, ZMAX);
    setZoom(z);
    setPan(prev => (z <= 1 ? { x:0, y:0 } : clampPan(prev, z)));
    return z;
  };
  const resetView = () => { setZoom(1); setPan({ x:0, y:0 }); setSwipeDX(0); };

  const cat   = groups[catIdx];
  const items = cat.items;
  const item  = items[subIdx] || items[0];
  const heroSrc = AM_R(cat.hero);
  const featSrc = item ? AM_R(item.img) : heroSrc;

  const e = clamp((t - 0.0) / 0.55);                 // header/rail reveal
  const eHero = clamp((t - 0.18) / 0.7);             // hero reveal

  const pickCategory = (i) => { setCatIdx(i); setSubIdx(0); };
  const pickSub = (i) => { setSubIdx((i + items.length) % items.length); };
  const prevSub = () => pickSub(subIdx - 1);
  const nextSub = () => pickSub(subIdx + 1);

  // Keyboard ← / → within the active category.
  React.useEffect(() => {
    const onKey = (ev) => {
      if (ev.key === 'ArrowLeft')  prevSub();
      else if (ev.key === 'ArrowRight') nextSub();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [subIdx, catIdx, items.length]);

  // Reset zoom/pan/swipe whenever the active item or category changes.
  React.useEffect(() => { resetView(); }, [subIdx, catIdx]);

  // Native non-passive wheel listener so we can preventDefault and zoom.
  // ctrl+wheel = trackpad pinch; plain wheel over the hero also zooms.
  React.useEffect(() => {
    const el = wrapRef.current; if (!el) return;
    const onWheel = (ev) => {
      ev.preventDefault();
      const factor = Math.exp(-ev.deltaY * 0.0016);
      setZoom(prevZ => {
        const z = clamp(prevZ * factor, ZMIN, ZMAX);
        setPan(prevP => (z <= 1 ? { x:0, y:0 } : clampPan(prevP, z)));
        return z;
      });
    };
    el.addEventListener('wheel', onWheel, { passive:false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // ── Pointer gestures on the hero: pan when zoomed, swipe when at 1× ──────
  const onHeroPointerDown = (ev) => {
    if (ev.button != null && ev.button !== 0) return;
    const el = wrapRef.current;
    try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch (e) {}
    dragRef.current = {
      id: ev.pointerId, startX: ev.clientX, startY: ev.clientY,
      startPan: { ...pan }, mode: zoom > 1 ? 'pan' : 'swipe',
      w: el ? el.clientWidth : 0, h: el ? el.clientHeight : 0, dx: 0, dy: 0, moved: false,
    };
  };
  const onHeroPointerMove = (ev) => {
    const d = dragRef.current; if (!d || d.id !== ev.pointerId) return;
    d.dx = ev.clientX - d.startX; d.dy = ev.clientY - d.startY;
    if (Math.abs(d.dx) > 3 || Math.abs(d.dy) > 3) d.moved = true;
    if (d.mode === 'pan') {
      setPan(clampPan({ x: d.startPan.x + d.dx, y: d.startPan.y + d.dy }, zoom));
    } else {
      setSwipeDX(d.dx * 0.35); // gentle rubber-band feedback at 1×
    }
  };
  const onHeroPointerUp = (ev) => {
    const d = dragRef.current; if (!d || d.id !== ev.pointerId) return;
    try { ev.currentTarget.releasePointerCapture(ev.pointerId); } catch (e) {}
    if (d.mode === 'swipe' && Math.abs(d.dx) > 60) {
      if (d.dx > 0) prevSub(); else nextSub();
    }
    setSwipeDX(0);
    dragRef.current = null;
  };

  // Double-click / double-tap toggles 1× ↔ 2×.
  const onHeroDoubleClick = () => { applyZoom(zoom > 1 ? 1 : 2); };

  const zoomTransform = zoom > 1
    ? `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
    : `translateX(${swipeDX}px)`;

  // Keep the active thumb in view inside its own scroll container.
  React.useEffect(() => {
    const stack = stackRef.current; if (!stack) return;
    const active = stack.querySelector('[data-active="1"]');
    if (!active) return;
    const aTop = active.offsetTop, aBot = aTop + active.offsetHeight;
    const pTop = stack.scrollTop, pBot = pTop + stack.clientHeight;
    if (aTop < pTop) stack.scrollTop = aTop - 10;
    else if (aBot > pBot) stack.scrollTop = aBot - stack.clientHeight + 10;
  }, [subIdx, catIdx]);

  const pad2 = (n) => String(n).padStart(2, '0');

  return (
    <div style={{position:'absolute', inset:0, background:'transparent', color:'var(--ink)', overflow:'hidden'}}>
      <ScreenHeader title="Amenities" subtitle="33 amenities across sport, wellness, social, family & landscape" idx="05"/>

      {/* ===== THREE-COLUMN STAGE ====================================== */}
      <div style={{position:'absolute', top:300, left:72, right:72, bottom:56, display:'flex', gap:34}}>

        {/* ---- LEFT EDITORIAL RAIL ---- */}
        <div style={{
          width: Math.round(520 + dens*36), flexShrink:0, display:'flex', flexDirection:'column',
          opacity:e, transform:`translateY(${(1-e)*-14}px)`,
        }}>
          <div className="mono" style={{fontSize: Math.round(17 + dens*3), letterSpacing:'0.42em', color:'var(--gold-deep)'}}>
            THE CLUBHOUSE · {AMENITY_COUNT} AMENITIES
          </div>
          <div className="serif" style={{fontSize: Math.round(58 + dens*12), fontWeight:300, lineHeight:1.0, letterSpacing:'-0.025em', marginTop:14}}>
            Everything within<br/><em style={{fontStyle:'italic', color:'var(--gold-deep)'}}>a short walk.</em>
          </div>
          <div className="mono" style={{fontSize: Math.round(17 + dens*3), letterSpacing:'0.28em', color:'var(--slate)', textTransform:'uppercase', marginTop: Math.round(18 + dens*6)}}>
            Five experiences · one address
          </div>
          <div style={{height:1, background:'linear-gradient(90deg, rgba(176,138,63,0.5) 0%, rgba(176,138,63,0.2) 60%, transparent 100%)', margin:`${Math.round(26+dens*8)}px 0 ${Math.round(22+dens*6)}px`}}/>

          {/* Category list — comfortable fixed rows, centred as a group so the rail
              reads balanced (symmetric breathing) at any canvas height, no dead band. */}
          <div style={{display:'flex', flexDirection:'column', justifyContent:'center', gap: Math.round(14 + dens*10), flex:1, minHeight:0}}>
            {groups.map((g, i) => (
              <AmCategoryRow key={g.id} g={g} i={i} active={i === catIdx} onClick={()=>pickCategory(i)} dens={dens}/>
            ))}
          </div>

          {/* Level filter */}
          <div style={{marginTop: Math.round(26 + dens*10)}}>
            <div className="mono" style={{fontSize: Math.round(17 + dens*3), letterSpacing:'0.32em', color:'var(--slate)', textTransform:'uppercase', marginBottom: Math.round(14 + dens*4)}}>
              Filter by level
            </div>
            <LevelFilter level={level} setLevel={setLevel} dens={dens}/>
          </div>
        </div>

        {/* ---- CENTER HERO PLATE ---- */}
        <div style={{flex:1, minWidth:0, position:'relative', opacity:eHero, transform:`scale(${lerp(0.985,1,eHero)})`, transformOrigin:'center'}}>
          <div style={{
            position:'absolute', inset:0, borderRadius:28, overflow:'hidden',
            background:'#0c0a07', border:'1px solid rgba(176,138,63,0.34)',
            boxShadow:'0 40px 90px -24px rgba(50,32,12,0.5), 0 16px 36px -14px rgba(50,32,12,0.28), 0 0 0 1px rgba(232,215,168,0.14) inset',
          }}>
            {/* zoom/pan/swipe layer — wraps the img so the caption never zooms */}
            <div ref={wrapRef}
              onPointerDown={onHeroPointerDown}
              onPointerMove={onHeroPointerMove}
              onPointerUp={onHeroPointerUp}
              onPointerCancel={onHeroPointerUp}
              onDoubleClick={onHeroDoubleClick}
              style={{
                position:'absolute', inset:0, overflow:'hidden', touchAction:'none',
                cursor: zoom > 1 ? (dragRef.current ? 'grabbing' : 'grab') : 'ew-resize',
              }}>
              <div style={{
                position:'absolute', inset:0,
                transform: zoomTransform, transformOrigin:'center center',
                transition: dragRef.current ? 'none' : 'transform 240ms cubic-bezier(0.22,1,0.36,1)',
              }}>
                <AmImg key={featSrc} src={featSrc} fallback={heroSrc} alt={item ? item.name : cat.label}
                  style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover',
                    filter:'saturate(1.04) contrast(1.03)', pointerEvents:'none',
                    animation:'amHeroIn 620ms cubic-bezier(0.22,1,0.36,1) both'}}/>
              </div>
            </div>
            <div style={{position:'absolute', inset:0, pointerEvents:'none',
              background:'linear-gradient(180deg, rgba(10,10,10,0.06) 0%, rgba(10,10,10,0.18) 48%, rgba(10,10,10,0.84) 100%)'}}/>
            {/* gold inner rim */}
            <div style={{position:'absolute', inset:14, borderRadius:18, border:'1px solid rgba(232,215,168,0.28)', pointerEvents:'none'}}/>

            {/* zoom controls (top-right) */}
            <div style={{position:'absolute', top:24, right:24, display:'flex', alignItems:'center', gap:8,
              padding:'7px 9px', borderRadius:999, background:'rgba(250,246,232,0.92)',
              border:'1px solid rgba(176,138,63,0.36)', backdropFilter:'blur(8px)',
              boxShadow:'0 12px 28px -10px rgba(50,32,12,0.42)'}}>
              <button onClick={()=>applyZoom(zoom - 0.5)} disabled={zoom <= ZMIN + 0.001}
                title="Zoom out" style={amZoomBtnStyle(zoom <= ZMIN + 0.001)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="6" y1="12" x2="18" y2="12"/></svg>
              </button>
              <div className="mono" style={{fontSize:17, letterSpacing:'0.08em', color:'var(--ink)',
                fontVariantNumeric:'tabular-nums', minWidth:48, textAlign:'center'}}>
                {Math.round(zoom * 100)}%
              </div>
              <button onClick={()=>applyZoom(zoom + 0.5)} disabled={zoom >= ZMAX - 0.001}
                title="Zoom in" style={amZoomBtnStyle(zoom >= ZMAX - 0.001)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="6" x2="12" y2="18"/><line x1="6" y1="12" x2="18" y2="12"/></svg>
              </button>
              <button onClick={resetView} disabled={zoom <= ZMIN + 0.001 && pan.x === 0 && pan.y === 0}
                title="Reset zoom" style={amZoomBtnStyle(zoom <= ZMIN + 0.001 && pan.x === 0 && pan.y === 0)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><polyline points="3 3 3 7 7 7"/></svg>
              </button>
            </div>

            {/* caption (bottom-left) */}
            <div style={{position:'absolute', left:48, right:48, bottom:104, pointerEvents:'none'}}>
              <div className="mono" style={{fontSize:17, letterSpacing:'0.4em', color:'var(--gold-soft)'}}>
                {cat.label.toUpperCase()} · {pad2(subIdx + 1)} OF {pad2(items.length)}
              </div>
              <div className="serif" style={{fontSize:68, fontWeight:300, lineHeight:0.98, letterSpacing:'-0.025em', marginTop:10,
                color:'#fff7e6', textShadow:'0 6px 26px rgba(0,0,0,0.55)'}}>
                {item ? item.name : cat.label}
              </div>
              <div style={{display:'flex', alignItems:'center', gap:16, marginTop:16}}>
                <div style={{padding:'7px 16px', borderRadius:105, background:'rgba(20,14,6,0.5)',
                  border:'1px solid rgba(232,215,168,0.40)', backdropFilter:'blur(6px)'}}>
                  <span className="mono" style={{fontSize:17, letterSpacing:'0.22em', color:'var(--gold-soft)', textTransform:'uppercase'}}>
                    {item ? (AM_LEVEL_LABEL[item.level] || item.level) : ''}
                  </span>
                </div>
                <div style={{fontSize:20, color:'rgba(250,246,232,0.86)', fontStyle:'italic', lineHeight:1.4, maxWidth:560}}>
                  {AM_DESC[cat.id] || ''}
                </div>
              </div>
            </div>

            {/* prev / counter / next control pill (overlay foot) */}
            <div style={{position:'absolute', left:0, right:0, bottom:34, display:'flex', justifyContent:'center'}}>
              <div style={{display:'flex', alignItems:'center', gap:22, padding:'10px 16px', borderRadius:999,
                background:'rgba(250,246,232,0.92)', border:'1px solid rgba(176,138,63,0.36)',
                boxShadow:'0 16px 34px -10px rgba(50,32,12,0.45), 0 5px 12px rgba(40,28,10,0.18)', backdropFilter:'blur(8px)'}}>
                <button onClick={prevSub} style={amCtrlBtnStyle()}
                  onMouseEnter={(ev)=>{ev.currentTarget.style.background='var(--ivory)'; ev.currentTarget.style.transform='scale(1.06)';}}
                  onMouseLeave={(ev)=>{ev.currentTarget.style.background='rgba(250,246,232,0.95)'; ev.currentTarget.style.transform='scale(1)';}}>
                  <Icons.back width={20} height={20}/>
                </button>
                <div className="mono" style={{fontSize:18, letterSpacing:'0.1em', color:'var(--ink)', fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap', padding:'0 6px'}}>
                  {pad2(subIdx + 1)}<span style={{color:'var(--gold-deep)', margin:'0 6px', opacity:0.7}}>/</span>{pad2(items.length)}
                </div>
                <button onClick={nextSub} style={amCtrlBtnStyle()}
                  onMouseEnter={(ev)=>{ev.currentTarget.style.background='var(--ivory)'; ev.currentTarget.style.transform='scale(1.06)';}}
                  onMouseLeave={(ev)=>{ev.currentTarget.style.background='rgba(250,246,232,0.95)'; ev.currentTarget.style.transform='scale(1)';}}>
                  <Icons.arrow width={20} height={20}/>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ---- RIGHT THUMBNAIL STACK ---- */}
        <div style={{
          width: Math.round(360 + dens*44), flexShrink:0, display:'flex', flexDirection:'column',
          opacity:e, transform:`translateY(${(1-e)*-14}px)`,
        }}>
          <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', paddingBottom: Math.round(14+dens*4),
            borderBottom:'1px solid var(--line)', marginBottom: Math.round(16+dens*4)}}>
            <div className="mono" style={{fontSize: Math.round(17 + dens*3), letterSpacing:'0.36em', color:'var(--gold-deep)', textTransform:'uppercase'}}>
              In this wing
            </div>
            <div className="mono" style={{fontSize: Math.round(17 + dens*3), letterSpacing:'0.2em', color:'var(--slate)', fontVariantNumeric:'tabular-nums'}}>
              {level === 'All'
                ? `${items.length} TOTAL`
                : `${items.filter(it => it.level === level).length} · ${level}`}
            </div>
          </div>

          {(() => {
            const thumbH = Math.round(150 + dens*42);
            const gap = Math.round(12 + dens*6);
            // Approx inner stack height for this canvas; centre short lists so a few
            // thumbs read intentional (no bottom void), scroll long ones.
            const approxAvail = CH - 300 - 56 - Math.round(54 + dens*20);
            const needed = items.length * thumbH + Math.max(0, items.length - 1) * gap;
            const justify = needed + 10 < approxAvail ? 'center' : 'flex-start';
            return (
              <div ref={stackRef} className="am-stack" style={{flex:1, minHeight:0, overflowY:'auto', overflowX:'hidden',
                display:'flex', flexDirection:'column', justifyContent: justify, gap, paddingRight:6}}>
                {items.map((it, idx) => {
                  const dimmed = level !== 'All' && it.level !== level;
                  return (
                    <div key={it.name + idx} data-active={idx === subIdx ? '1' : '0'} style={{flexShrink:0}}>
                      <AmThumbCard
                        item={it} idx={idx}
                        active={idx === subIdx}
                        dimmed={dimmed}
                        fallback={heroSrc}
                        onClick={()=>{ if(!dimmed) pickSub(idx); }}
                        dens={dens} thumbH={thumbH}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

function amCtrlBtnStyle() {
  return {
    width:48, height:48, borderRadius:'50%', flexShrink:0,
    background:'rgba(250,246,232,0.95)', border:'1px solid rgba(176,138,63,0.36)',
    color:'var(--gold-deep)', display:'flex', alignItems:'center', justifyContent:'center',
    cursor:'pointer', transition:'background 220ms ease, transform 200ms ease',
    boxShadow:'0 6px 14px -4px rgba(50,32,12,0.3)',
  };
}

function amZoomBtnStyle(disabled) {
  return {
    width:32, height:32, borderRadius:'50%', flexShrink:0, padding:0,
    background:'rgba(255,250,235,0.7)', border:'1px solid rgba(176,138,63,0.32)',
    color:'var(--gold-deep)', display:'flex', alignItems:'center', justifyContent:'center',
    cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.4 : 1,
    transition:'background 200ms ease, opacity 200ms ease',
  };
}

// ============================================================================
// AM_ICONS — self-drawing SVG glyphs per experience id (stroke-draw on active)
// ============================================================================
const AM_ICONS = {
  sport: ({ active }) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{display:'block'}}>
      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="50" cy="50" r="22" pathLength="1" strokeDasharray="1" strokeDashoffset={active?0:1}
          style={{transition:'stroke-dashoffset 720ms cubic-bezier(0.22,1,0.36,1)'}}/>
        <path d="M 30 38 Q 50 50 30 62" pathLength="1" strokeDasharray="1" strokeDashoffset={active?0:1}
          style={{transition:'stroke-dashoffset 720ms 200ms cubic-bezier(0.22,1,0.36,1)'}}/>
        <path d="M 70 38 Q 50 50 70 62" pathLength="1" strokeDasharray="1" strokeDashoffset={active?0:1}
          style={{transition:'stroke-dashoffset 720ms 280ms cubic-bezier(0.22,1,0.36,1)'}}/>
      </g>
    </svg>
  ),
  wellness: ({ active }) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{display:'block'}}>
      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 16 58 Q 30 48 44 58 Q 58 68 72 58 Q 80 53 84 56" pathLength="1" strokeDasharray="1" strokeDashoffset={active?0:1}
          style={{transition:'stroke-dashoffset 760ms cubic-bezier(0.22,1,0.36,1)'}}/>
        <path d="M 16 72 Q 30 62 44 72 Q 58 82 72 72 Q 80 67 84 70" pathLength="1" strokeDasharray="1" strokeDashoffset={active?0:1} opacity="0.7"
          style={{transition:'stroke-dashoffset 760ms 220ms cubic-bezier(0.22,1,0.36,1)'}}/>
        <path d="M 50 16 C 38 22 36 34 42 44 C 54 40 60 28 58 18 C 55 16 52 16 50 16 Z" pathLength="1" strokeDasharray="1" strokeDashoffset={active?0:1}
          style={{transition:'stroke-dashoffset 760ms 360ms cubic-bezier(0.22,1,0.36,1)'}}/>
      </g>
    </svg>
  ),
  social: ({ active }) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{display:'block'}}>
      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 26 22 L 74 22 L 50 54 Z" pathLength="1" strokeDasharray="1" strokeDashoffset={active?0:1}
          style={{transition:'stroke-dashoffset 760ms cubic-bezier(0.22,1,0.36,1)'}}/>
        <line x1="50" y1="54" x2="50" y2="78" pathLength="1" strokeDasharray="1" strokeDashoffset={active?0:1}
          style={{transition:'stroke-dashoffset 480ms 320ms cubic-bezier(0.22,1,0.36,1)'}}/>
        <line x1="36" y1="80" x2="64" y2="80" pathLength="1" strokeDasharray="1" strokeDashoffset={active?0:1}
          style={{transition:'stroke-dashoffset 360ms 540ms cubic-bezier(0.22,1,0.36,1)'}}/>
      </g>
    </svg>
  ),
  family: ({ active }) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{display:'block'}}>
      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 22 50 L 50 22 L 78 50 L 78 78 L 22 78 Z" pathLength="1" strokeDasharray="1" strokeDashoffset={active?0:1}
          style={{transition:'stroke-dashoffset 800ms cubic-bezier(0.22,1,0.36,1)'}}/>
        <circle cx="42" cy="55" r="4" pathLength="1" strokeDasharray="1" strokeDashoffset={active?0:1}
          style={{transition:'stroke-dashoffset 380ms 480ms cubic-bezier(0.22,1,0.36,1)'}}/>
        <path d="M 36 76 V 66 Q 42 61 48 66 V 76" pathLength="1" strokeDasharray="1" strokeDashoffset={active?0:1}
          style={{transition:'stroke-dashoffset 540ms 620ms cubic-bezier(0.22,1,0.36,1)'}}/>
      </g>
    </svg>
  ),
  landscape: ({ active }) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{display:'block'}}>
      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 50 20 C 30 30 24 52 32 74 C 54 66 72 50 78 28 C 66 24 58 22 50 20 Z" pathLength="1" strokeDasharray="1" strokeDashoffset={active?0:1}
          style={{transition:'stroke-dashoffset 820ms cubic-bezier(0.22,1,0.36,1)'}}/>
        <path d="M 34 72 Q 52 52 76 30" pathLength="1" strokeDasharray="1" strokeDashoffset={active?0:1}
          style={{transition:'stroke-dashoffset 720ms 360ms cubic-bezier(0.22,1,0.36,1)'}}/>
      </g>
    </svg>
  ),
};

window.Amenities = Amenities;
