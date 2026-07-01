// FloatingDock — a draggable "park-anywhere" glass FAB that blooms open into a
// creative arc of shortcuts: Pricing · EMI · Annotate. Lives globally (mounted
// in App, above every screen), remembers its position across screens + reloads,
// and fans its actions toward open space whichever corner you leave it in.

function ensureDockKeys() {
  if (typeof document === 'undefined' || document.getElementById('uni-dock-keys')) return;
  const s = document.createElement('style'); s.id = 'uni-dock-keys';
  s.textContent = `
    @keyframes dockPulse { 0%,100%{ box-shadow:0 10px 30px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.28), 0 0 0 0 rgba(201,160,94,0.45);}
                            50%{ box-shadow:0 10px 30px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.28), 0 0 0 14px rgba(201,160,94,0);} }
  `;
  document.head.appendChild(s);
}

// liquid-glass disc used by the FAB + shortcuts
const dockGlass = {
  background:'linear-gradient(155deg, rgba(34,28,20,0.78) 0%, rgba(20,16,11,0.74) 100%)',
  border:'1px solid rgba(255,248,230,0.34)',
  backdropFilter:'blur(18px) saturate(1.5)', WebkitBackdropFilter:'blur(18px) saturate(1.5)',
  boxShadow:'0 12px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.26), inset 0 -1px 0 rgba(0,0,0,0.3)',
};

const DockGlyph = {
  plus: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" {...p}><path d="M12 5 L12 19 M5 12 L19 12"/></svg>,
  emi:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
          <rect x="5" y="3" width="14" height="18" rx="2.2"/><path d="M8 7 L16 7"/><path d="M8 12 L9 12 M11.5 12 L12.5 12 M15 12 L16 12 M8 16 L9 16 M11.5 16 L12.5 16 M15 16 L16 16"/></svg>,
  pen:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 20 L4.4 16.2 L15.2 5.4 L18.6 8.8 L7.8 19.6 Z"/><path d="M13.4 7.2 L16.8 10.6"/><path d="M4 20 L8 19.6"/></svg>,
};

// live canvas height (adaptive: 1600 on 16:10 → up to 1920 on iPad 4:3). The FAB
// anchors to the REAL bottom so it never floats mid-screen on the taller canvas.
const dockLiveH = () => (typeof window !== 'undefined' && window.UNIVERSE_CANVAS && window.UNIVERSE_CANVAS.H) || 1600;
const dockHasCustomPos = () => { try { const s = JSON.parse(localStorage.getItem('uni-fab-pos')); return !!(s && typeof s.x === 'number'); } catch (e) { return false; } };

function FloatingDock() {
  ensureDockKeys();
  const W = 2560, FAB = 86, MARGIN = 24;
  const [H, setH] = React.useState(dockLiveH);
  const [open, setOpen] = React.useState(false);
  const [annot, setAnnot] = React.useState(false);
  const [pos, setPos] = React.useState(() => {
    try { const s = JSON.parse(localStorage.getItem('uni-fab-pos')); if (s && typeof s.x === 'number') return s; } catch (e) {}
    return { x: W - 110, y: dockLiveH() - 120 };
  });
  const posRef = React.useRef(pos); posRef.current = pos;

  // keep the FAB pinned to the live bottom-right as the canvas height adapts
  // (orientation / device change). A user-dragged custom position is preserved.
  React.useEffect(() => {
    const onResize = () => {
      const nh = dockLiveH(); setH(nh);
      if (!dockHasCustomPos()) setPos({ x: W - 110, y: nh - 120 });
    };
    onResize();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      if (window.visualViewport) window.visualViewport.removeEventListener('resize', onResize);
    };
  }, []);
  const drag = React.useRef({ active:false, moved:false, sx:0, sy:0, ox:0, oy:0, scale:1 });

  const bezelScale = () => {
    const b = document.querySelector('.tablet-bezel');
    if (!b) return 1; const r = b.getBoundingClientRect();
    return (r.width / b.offsetWidth) || 1;
  };

  const onMove = (e) => {
    const d = drag.current; if (!d.active) return;
    const dx = (e.clientX - d.sx) / d.scale, dy = (e.clientY - d.sy) / d.scale;
    if (Math.hypot(dx, dy) > 6) d.moved = true;
    const nx = clamp(d.ox + dx, FAB/2 + MARGIN, W - FAB/2 - MARGIN);
    const ny = clamp(d.oy + dy, FAB/2 + MARGIN, H - FAB/2 - MARGIN);
    setPos({ x: nx, y: ny });
  };
  const onUp = () => {
    const d = drag.current;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    if (!d.moved) { setOpen(o => !o); }
    else { try { localStorage.setItem('uni-fab-pos', JSON.stringify(posRef.current)); } catch (e) {} }
    d.active = false;
  };
  const onDown = (e) => {
    e.stopPropagation(); e.preventDefault();
    drag.current = { active:true, moved:false, sx:e.clientX, sy:e.clientY, ox:pos.x, oy:pos.y, scale:bezelScale() };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const items = [
    { key:'price', label:'Pricing',  glyph:'₹',          onClick:() => { setOpen(false); window.dispatchEvent(new CustomEvent('uni-open-tool', { detail:{ tool:'price' } })); } },
    { key:'emi',   label:'EMI',       icon:DockGlyph.emi, onClick:() => { setOpen(false); window.dispatchEvent(new CustomEvent('uni-open-tool', { detail:{ tool:'emi' } })); } },
    { key:'pen',   label:'Annotate',  icon:DockGlyph.pen, onClick:() => { setOpen(false); setAnnot(a => !a); } },
  ];

  // fan toward the open quadrant (away from the nearest corner)
  const hx = pos.x > W/2 ? -1 : 1;
  const vy = pos.y > H/2 ? -1 : 1;            // screen y-down; -1 = upward
  const base = Math.atan2(-vy, hx);           // math angle (y-up) into open space
  const SPREAD = 42 * Math.PI / 180;

  return (
    <React.Fragment>
      {annot && <AnnotateOverlay onClose={() => setAnnot(false)}/>}

      {/* no backdrop overlay — the dock just blooms in place, screen stays clear */}

      <div style={{ position:'absolute', left:pos.x, top:pos.y, width:0, height:0, zIndex:95 }}>
        {/* shortcut bloom */}
        {items.map((it, i) => {
          const ang = base + (i - 1) * SPREAD;
          const R = 138 + i * 4;
          const dx = Math.cos(ang) * R, dy = -Math.sin(ang) * R;
          return (
            <div key={it.key} style={{
              position:'absolute', left:0, top:0,
              transform:`translate(-50%,-50%) translate(${open ? dx : 0}px, ${open ? dy : 0}px) scale(${open ? 1 : 0.25})`,
              opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
              transition:`transform 480ms cubic-bezier(0.34,1.56,0.64,1) ${i*60}ms, opacity 300ms ease ${i*55}ms`,
            }}>
              <button onClick={it.onClick} aria-label={it.label} style={{
                width:66, height:66, borderRadius:'50%', cursor:'pointer', ...dockGlass,
                color:'#ead7a8', display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                {it.icon ? it.icon({ width:26, height:26 })
                         : <span className="serif" style={{ fontSize:30, fontWeight:500, lineHeight:1 }}>{it.glyph}</span>}
              </button>
              <div className="mono" style={{
                position:'absolute', top:'100%', left:'50%', transform:'translateX(-50%)', marginTop:8, whiteSpace:'nowrap',
                padding:'6px 12px', borderRadius:100, ...dockGlass, color:'rgba(232,215,168,0.95)',
                fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase',
              }}>{it.label}</div>
            </div>
          );
        })}

        {/* main FAB */}
        <button onPointerDown={onDown} aria-label="Shortcuts" data-fab="1"
          style={{
            position:'absolute', left:0, top:0,
            transform:`translate(-50%,-50%) rotate(${open ? 45 : 0}deg)`,
            width:FAB, height:FAB, borderRadius:'50%', cursor:'grab', touchAction:'none',
            ...dockGlass, color:'#ead7a8', display:'flex', alignItems:'center', justifyContent:'center',
            transition:'transform 460ms cubic-bezier(0.34,1.56,0.64,1)',
            animation: open ? 'none' : 'dockPulse 3.4s ease-in-out infinite',
          }}>
          {DockGlyph.plus({ width:30, height:30 })}
        </button>
      </div>
    </React.Fragment>
  );
}

// ── AnnotateOverlay — freehand gold pen over the current screen ──────────────
function AnnotateOverlay({ onClose }) {
  const ref = React.useRef(null);
  const st = React.useRef({ on:false, last:null });
  const W = 2560, H = 1600;

  const toC = (e) => {
    const c = ref.current, r = c.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
  };
  const ctxOf = () => {
    const ctx = ref.current.getContext('2d');
    ctx.strokeStyle = '#c9a05e'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(201,160,94,0.55)'; ctx.shadowBlur = 7;
    return ctx;
  };
  const down = (e) => { e.preventDefault(); st.current.on = true; st.current.last = toC(e); };
  const move = (e) => {
    if (!st.current.on) return;
    const ctx = ctxOf(), p = toC(e), l = st.current.last;
    ctx.beginPath(); ctx.moveTo(l.x, l.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    st.current.last = p;
  };
  const end = () => { st.current.on = false; };
  const clear = () => ref.current.getContext('2d').clearRect(0, 0, W, H);

  return (
    <div style={{ position:'absolute', inset:0, zIndex:120 }}>
      <canvas ref={ref} width={W} height={H}
        onPointerDown={down} onPointerMove={move} onPointerUp={end} onPointerLeave={end}
        style={{ position:'absolute', inset:0, width:'100%', height:'100%', cursor:'crosshair', touchAction:'none' }}/>
      <div style={{
        position:'absolute', top:28, left:'50%', transform:'translateX(-50%)',
        display:'flex', alignItems:'center', gap:12, padding:'10px 12px 10px 20px', borderRadius:100, ...dockGlass,
      }}>
        <span className="mono" style={{ fontSize:12, letterSpacing:'0.26em', color:'rgba(232,215,168,0.95)' }}>✎ ANNOTATE</span>
        <button onClick={clear} className="mono" style={{ padding:'9px 18px', borderRadius:100, cursor:'pointer',
          background:'rgba(255,246,224,0.06)', border:'1px solid rgba(232,215,168,0.3)', color:'rgba(232,215,168,0.9)',
          fontSize:11, letterSpacing:'0.16em' }}>CLEAR</button>
        <button onClick={onClose} className="mono" style={{ padding:'9px 20px', borderRadius:100, cursor:'pointer',
          background:'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)', border:'1px solid var(--gold-deep)',
          color:'#1a130a', fontSize:11, letterSpacing:'0.16em', fontWeight:800 }}>DONE</button>
      </div>
    </div>
  );
}

window.FloatingDock = FloatingDock;
