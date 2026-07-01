// Unit Detail — final step of the inventory drill-down.
// params: [towerId, floor, unitNo].  Back → floor/<towerId>/<floor>.
// LEFT: the unit plan (u.plan) in a pinch / drag / wheel / double-tap zoom-pan
//   viewer with ± and reset controls.
// RIGHT: status + headline, a transparent BASIC PRICE SHEET (unitPriceSheet),
//   a spec grid, and two actions — primary ENQUIRE / BOOK → booking, and a
//   distinct HOME → home.
//
// Reuses window.STATUS, Breadcrumb, fsBackBtn from earlier inventory screens.

function UnitDetail() {
  const t = useLoop();
  const e = clamp(t/0.5);
  const [route] = useRoute();

  // Canvas-height density: 0 on 16:10 tablet (1600) → 1 on iPad Pro 4:3 (1920).
  const CH = (typeof window !== 'undefined' && window.UNIVERSE_CANVAS && window.UNIVERSE_CANVAS.H) || 1600;
  const dens = clamp((CH - 1600) / 320);

  const towerId = route.params && route.params[0];
  const floor = route.params && parseInt(route.params[1], 10);
  const unitNo = route.params && route.params[2];
  const tower = TOWERS.find(tw => tw.id === towerId);

  const unit = (tower && Number.isFinite(floor))
    ? buildUnits(towerId, floor).find(u => u.no === unitNo)
    : null;

  // ── zoom-pan state (ported verbatim) ─────────────────────────
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({x:0, y:0});
  const [hintFaded, setHintFaded] = React.useState(false);
  const containerRef = React.useRef(null);
  const gestureRef = React.useRef({
    active:false, mode:null, startD:0, startZoom:1,
    startPanX:0, startPanY:0, startMidX:0, startMidY:0,
    lastTapAt:0, lastTapX:0, lastTapY:0, dragStartX:0, dragStartY:0,
  });

  React.useEffect(()=>{ setZoom(1); setPan({x:0,y:0}); }, [unitNo]);

  const clampPan = (p, z) => {
    const el = containerRef.current; if (!el) return p;
    const r = el.getBoundingClientRect();
    const maxX = Math.max(0, ((z-1)/2)*r.width)  + 80;
    const maxY = Math.max(0, ((z-1)/2)*r.height) + 80;
    return { x: Math.max(-maxX, Math.min(maxX, p.x)), y: Math.max(-maxY, Math.min(maxY, p.y)) };
  };
  const fadeHint = () => { if (!hintFaded) setHintFaded(true); };

  const handleTouchStart = (ev) => {
    const g = gestureRef.current; const touches = ev.touches;
    const el = containerRef.current; const rect = el ? el.getBoundingClientRect() : {left:0,top:0};
    if (touches.length === 2) {
      const [a,b] = [touches[0], touches[1]];
      const dx = b.clientX-a.clientX, dy = b.clientY-a.clientY;
      g.mode='pinch'; g.active=true; g.startD=Math.hypot(dx,dy)||1; g.startZoom=zoom;
      g.startPanX=pan.x; g.startPanY=pan.y;
      g.startMidX=(a.clientX+b.clientX)/2-rect.left; g.startMidY=(a.clientY+b.clientY)/2-rect.top;
      fadeHint();
    } else if (touches.length === 1) {
      const now = performance.now(); const t0 = touches[0];
      const tx=t0.clientX, ty=t0.clientY;
      if (now-g.lastTapAt < 320 && Math.hypot(tx-g.lastTapX, ty-g.lastTapY) < 40) {
        setZoom(1); setPan({x:0,y:0}); g.lastTapAt=0; g.active=false; g.mode=null; fadeHint(); return;
      }
      g.lastTapAt=now; g.lastTapX=tx; g.lastTapY=ty;
      if (zoom > 1) { g.mode='pan-touch'; g.active=true; g.dragStartX=tx; g.dragStartY=ty; g.startPanX=pan.x; g.startPanY=pan.y; fadeHint(); }
      else { g.mode=null; g.active=false; }
    }
  };
  const handleTouchMove = (ev) => {
    const g = gestureRef.current; if (!g.active) return;
    if (ev.cancelable) ev.preventDefault();
    const touches = ev.touches;
    if (g.mode==='pinch' && touches.length===2) {
      const [a,b]=[touches[0],touches[1]];
      const dx=b.clientX-a.clientX, dy=b.clientY-a.clientY;
      const newD=Math.hypot(dx,dy)||1; const ratio=newD/g.startD;
      const newZoom=Math.max(0.6, Math.min(4, g.startZoom*ratio));
      const el=containerRef.current; const rect=el?el.getBoundingClientRect():{left:0,top:0,width:1,height:1};
      const cx=(a.clientX+b.clientX)/2-rect.left; const cy=(a.clientY+b.clientY)/2-rect.top;
      const k=newZoom/g.startZoom;
      const offX=(cx-g.startMidX)+g.startPanX*k; const offY=(cy-g.startMidY)+g.startPanY*k;
      setZoom(newZoom); setPan(clampPan({x:offX,y:offY}, newZoom));
    } else if (g.mode==='pan-touch' && touches.length===1) {
      const t0=touches[0]; const dx=t0.clientX-g.dragStartX; const dy=t0.clientY-g.dragStartY;
      setPan(clampPan({x:g.startPanX+dx, y:g.startPanY+dy}, zoom));
    }
  };
  const handleTouchEnd = (ev) => {
    const g = gestureRef.current;
    if (ev.touches.length===0) { g.active=false; g.mode=null; }
    else if (ev.touches.length===1 && g.mode==='pinch') {
      const t0=ev.touches[0]; g.mode = zoom>1?'pan-touch':null; g.active = g.mode==='pan-touch';
      g.dragStartX=t0.clientX; g.dragStartY=t0.clientY; g.startPanX=pan.x; g.startPanY=pan.y;
    }
  };
  const handleMouseDown = (ev) => {
    if (zoom<=1) return; const g=gestureRef.current;
    g.mode='pan-mouse'; g.active=true; g.dragStartX=ev.clientX; g.dragStartY=ev.clientY;
    g.startPanX=pan.x; g.startPanY=pan.y; fadeHint();
  };
  const handleMouseMove = (ev) => {
    const g=gestureRef.current; if (!g.active || g.mode!=='pan-mouse') return;
    const dx=ev.clientX-g.dragStartX, dy=ev.clientY-g.dragStartY;
    setPan(clampPan({x:g.startPanX+dx, y:g.startPanY+dy}, zoom));
  };
  const endMouse = () => { const g=gestureRef.current; if (g.mode==='pan-mouse'){ g.active=false; g.mode=null; } };
  const handleWheel = (ev) => {
    if (ev.cancelable) ev.preventDefault(); fadeHint();
    const el=containerRef.current; const rect=el?el.getBoundingClientRect():{left:0,top:0,width:1,height:1};
    const cx=ev.clientX-rect.left-rect.width/2; const cy=ev.clientY-rect.top-rect.height/2;
    const delta=ev.deltaY>0?-0.1:0.1; const newZoom=Math.max(0.6, Math.min(4, zoom*(1+delta))); const k=newZoom/zoom;
    setZoom(newZoom); setPan(clampPan({x:cx-(cx-pan.x)*k, y:cy-(cy-pan.y)*k}, newZoom));
  };
  React.useEffect(() => {
    const el=containerRef.current; if (!el) return;
    const tm=(ev)=>handleTouchMove(ev); const wh=(ev)=>handleWheel(ev);
    el.addEventListener('touchmove', tm, {passive:false});
    el.addEventListener('wheel', wh, {passive:false});
    return () => { el.removeEventListener('touchmove', tm); el.removeEventListener('wheel', wh); };
  }, [zoom, pan.x, pan.y, hintFaded]);

  // ── guard: missing unit ──────────────────────────────────────
  if (!unit) {
    return (
      <div style={{position:'absolute', inset:0, background:'transparent', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <button onClick={()=>navigate('inventory')} className="mono" style={{padding:'18px 30px', borderRadius:105, border:'1px solid var(--gold-deep)', background:'var(--ivory-2)', fontSize:16, letterSpacing:'0.18em', cursor:'pointer'}}>← BACK TO INVENTORY</button>
      </div>
    );
  }

  const st = STATUS[unit.status] || STATUS.sold;
  const flLabel = floorLabel(tower, floor);
  const sold = unit.status === 'sold';
  const sheet = unitPriceSheet(unit);

  return (
    <div style={{position:'absolute', inset:0, background:'transparent', color:'var(--ink)', overflow:'hidden'}}>

      {/* ── HEADER (back → floor/<tower>/<floor>) ──────────────── */}
      <div style={{position:'absolute', top:54, left:72, right:72, display:'flex', justifyContent:'space-between', alignItems:'flex-end', opacity:e, transform:`translateY(${(1-e)*-12}px)`, zIndex:10}}>
        <div style={{display:'flex', alignItems:'flex-end', gap:34}}>
          <button onClick={()=>navigate(`floor/${towerId}/${floor}`)} style={fsBackBtn}
            onMouseEnter={ev=>{ev.currentTarget.style.background='var(--gold)'; ev.currentTarget.style.color='#0a0807'; ev.currentTarget.style.borderColor='var(--gold)';}}
            onMouseLeave={ev=>{ev.currentTarget.style.background='transparent'; ev.currentTarget.style.color='var(--ink)'; ev.currentTarget.style.borderColor='var(--line)';}}>
            <Icons.back width={28} height={28}/>
          </button>
          <div>
            <Breadcrumb crumbs={[
              {label:'Inventory', go:()=>navigate('inventory')},
              {label:tower.name, go:()=>navigate(`floors/${towerId}`)},
              {label:flLabel, go:()=>navigate(`floor/${towerId}/${floor}`)},
              {label:unit.no},
            ]}/>
            <div style={{display:'flex', alignItems:'baseline', gap:22, marginTop:10}}>
              <div className="display" style={{fontSize:84, fontWeight:500, letterSpacing:'0.01em', lineHeight:1}}>{unit.no}</div>
              <div className="serif" style={{fontSize:40, fontWeight:300, color:'var(--gold-deep)', fontStyle:'italic'}}>{unit.isPenthouse ? 'Signature Penthouse' : '4 BHK home'}</div>
            </div>
          </div>
        </div>
        <div role="button" tabIndex={0} aria-label="Go to home"
          onClick={()=>navigate('home')}
          onKeyDown={ev=>{ if(ev.key==='Enter'||ev.key===' '){ ev.preventDefault(); navigate('home'); } }}
          onMouseEnter={ev=>{ ev.currentTarget.style.opacity='0.6'; ev.currentTarget.style.transform='scale(1.03)'; }}
          onMouseLeave={ev=>{ ev.currentTarget.style.opacity='1'; ev.currentTarget.style.transform='scale(1)'; }}
          style={{display:'flex', alignItems:'center', gap:22, cursor:'pointer', transformOrigin:'right center', transition:'opacity 200ms ease, transform 200ms ease'}}>
          <UniverseMonogram size={68} progress={1} color="var(--gold-deep)"/>
          <div style={{display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end'}}>
            <UniverseWordmark size={26} color="var(--ink)" tight/>
            <VenusCredit size={13}/>
          </div>
        </div>
      </div>

      {/* ── BODY: plan viewer (left) + details (right) ─────────── */}
      <div style={{position:'absolute', top:300, left:72, right:72, bottom:60, display:'grid', gridTemplateColumns:'1.42fr 1fr', gap:46}}>

        {/* PLAN VIEWER */}
        <div style={{position:'relative', borderRadius:20, overflow:'hidden', background:'#f3eddc', border:'1px solid var(--line)', boxShadow:'0 20px 50px rgba(40,28,10,0.08)'}}>
          <div ref={containerRef}
            onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchEnd}
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={endMouse} onMouseLeave={endMouse}
            style={{position:'absolute', inset:0, overflow:'hidden', touchAction:'none',
              cursor: zoom>1 ? (gestureRef.current.mode==='pan-mouse'?'grabbing':'grab') : 'default'}}>
            <img src={unit.plan} alt={`${unit.no} floor plan`} draggable={false}
              style={{width:'100%', height:'100%', objectFit:'contain', display:'block', padding:18,
                transform:`translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transition: gestureRef.current.active ? 'none' : 'transform 320ms cubic-bezier(0.22,1,0.36,1)',
                transformOrigin:'center', userSelect:'none', WebkitUserSelect:'none', pointerEvents:'none'}}
              onError={(ev)=>{ ev.currentTarget.style.display='none'; }}/>
          </div>

          {/* zoom controls */}
          <div style={{position:'absolute', bottom:23, left:23, display:'flex', gap:8, zIndex:3}}>
            <button onClick={()=>{ fadeHint(); setZoom(z=>Math.max(0.6, z-0.25)); }} style={udZoomBtn}><Icons.minus width={21} height={21}/></button>
            <div className="mono" style={{padding:'15px 23px', borderRadius:105, background:'rgba(20,16,11,0.88)', border:'1px solid rgba(232,215,168,0.30)', fontSize:15, letterSpacing:'0.2em', color:'rgba(232,215,168,0.95)'}}>{Math.round(zoom*100)}%</div>
            <button onClick={()=>{ fadeHint(); setZoom(z=>Math.min(4, z+0.25)); }} style={udZoomBtn}><Icons.plus width={21} height={21}/></button>
            <button onClick={()=>{ fadeHint(); setZoom(1); setPan({x:0,y:0}); }} className="mono" style={{...udZoomBtn, width:'auto', padding:'15px 21px', fontSize:14, letterSpacing:'0.2em'}}>RESET</button>
          </div>

          {/* gesture hint */}
          <div className="mono" style={{position:'absolute', bottom:25, left:'50%', transform:'translateX(-50%)', padding:'10px 19px', borderRadius:105, background:'rgba(20,16,11,0.78)', border:'1px solid rgba(232,215,168,0.32)', fontSize:13, letterSpacing:'0.28em', color:'var(--gold-deep)', opacity: hintFaded?0:1, transition:'opacity 480ms ease', pointerEvents:'none', zIndex:2, whiteSpace:'nowrap'}}>PINCH OR SCROLL TO ZOOM · DRAG TO PAN</div>

          {/* block tag */}
          <div style={{position:'absolute', top:23, right:23, padding:'14px 22px', background:'rgba(20,16,11,0.88)', backdropFilter:'blur(8px)', borderRadius:105, display:'flex', alignItems:'center', gap:14, border:'1px solid rgba(232,215,168,0.30)', zIndex:3}}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M12 3 L15 12 L12 10 L9 12 Z" fill="#c9a05e"/><text x="12" y="22" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle" fill="#c9a05e">N</text></svg>
            <span className="mono" style={{fontSize:15, letterSpacing:'0.22em', color:'rgba(232,215,168,0.92)'}}>BLOCK {unit.pair} · {unit.type.toUpperCase()}</span>
          </div>
        </div>

        {/* DETAILS PANEL */}
        <div className="scroll" style={{display:'flex', flexDirection:'column', overflow:'auto', paddingRight:4}}>
          {/* status + headline */}
          <div style={{display:'flex', alignItems:'center', gap:14}}>
            <div style={{display:'inline-flex', alignItems:'center', gap:10, padding:`${Math.round(11+dens*3)}px ${Math.round(18+dens*4)}px`, borderRadius:105, background:st.soft, border:`1px solid ${st.line}`}}>
              <span style={{width:11, height:11, borderRadius:'50%', background:st.dot}}/>
              <span className="mono" style={{fontSize:Math.round(14+dens*2), letterSpacing:'0.16em', color: sold ? STATUS.sold.color : (unit.status==='hold'?STATUS.hold.color:'var(--gold-deep)')}}>{st.label.toUpperCase()}</span>
            </div>
            <span className="mono" style={{fontSize:Math.round(14+dens*2), letterSpacing:'0.2em', color:'var(--slate)'}}>{tower.name.toUpperCase()} · {flLabel.toUpperCase()}</span>
          </div>

          <div className="serif" style={{fontSize:Math.round(54+dens*12), fontWeight:300, lineHeight:1.04, letterSpacing:'-0.025em', marginTop:Math.round(18+dens*10)}}>
            {unit.isPenthouse ? 'Signature Penthouse' : 'A 4 BHK home'}
          </div>
          <div style={{fontSize:Math.round(21+dens*4), color:'var(--slate)', marginTop:10, fontStyle:'italic'}}>{tower.cluster} · {unit.facing}</div>

          {/* spec grid */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0 22px', marginTop:Math.round(24+dens*14), borderTop:'1px solid var(--line)', paddingTop:6}}>
            <DetailCell label="RERA Carpet" value={fmtSqft(unit.sqft)} dens={dens}/>
            <DetailCell label="Unit Type" value={unit.type} dens={dens}/>
            <DetailCell label="Facing" value={unit.facing} dens={dens}/>
            <DetailCell label="Tower" value={`${tower.name} · ${tower.pair}`} dens={dens}/>
            <DetailCell label="Floor" value={flLabel} dens={dens}/>
            <DetailCell label="Config" value="4 BHK" dens={dens}/>
          </div>

          {/* PRICE SHEET */}
          <div style={{marginTop:Math.round(24+dens*14), borderRadius:18, overflow:'hidden', border:'1px solid var(--line)', background:'rgba(255,255,255,0.6)', backdropFilter:'blur(6px)'}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:`${Math.round(15+dens*4)}px 22px`, borderBottom:'1px solid var(--line)', background:'rgba(201,160,94,0.07)'}}>
              <span className="mono" style={{fontSize:Math.round(13+dens*3), letterSpacing:'0.26em', color:'var(--gold-deep)'}}>INDICATIVE COST SHEET</span>
              <span className="mono" style={{fontSize:Math.round(12.5+dens*2), letterSpacing:'0.14em', color:'var(--slate)'}}>{formatINR(sheet.rate)}/SQ.FT</span>
            </div>
            <div style={{padding:'6px 22px'}}>
              <PriceRow label="Base price" sub={`${formatINR(sheet.rate)}/sq.ft × ${fmtSqft(sheet.sqft)}`} value={formatINR(sheet.base)} dens={dens}/>
              <PriceRow label="Floor rise" sub={`Premium for the ${flLabel.toLowerCase()}`} value={formatINR(sheet.floorRise)} dens={dens}/>
              <PriceRow label="Preferred-location" sub={unit.isPenthouse ? 'Penthouse PLC · 5%' : 'Corner / view PLC · 2%'} value={formatINR(sheet.plc)} dens={dens}/>
              <PriceRow label="Subtotal" value={formatINR(sheet.subtotal)} strong dens={dens}/>
              <PriceRow label="GST" sub="5% · under-construction" value={formatINR(sheet.gst)} dens={dens}/>
              <PriceRow label="Stamp + Registration" sub="Gujarat ≈ 4.9%" value={formatINR(sheet.reg)} dens={dens}/>
            </div>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:`${Math.round(18+dens*6)}px 22px`, borderTop:'1px solid var(--line)', background:'linear-gradient(180deg, rgba(201,160,94,0.10), rgba(201,160,94,0.04))'}}>
              <div>
                <div className="mono" style={{fontSize:Math.round(13+dens*3), letterSpacing:'0.26em', color:'var(--slate)'}}>ALL-IN TOTAL</div>
                <div className="mono" style={{fontSize:Math.round(11.5+dens*2), letterSpacing:'0.12em', color:'var(--muted)', marginTop:4}}>INDICATIVE · TAXES INCLUDED</div>
              </div>
              <div className="serif" style={{fontSize:Math.round(46+dens*10), fontWeight:300, color:'var(--gold-deep)', letterSpacing:'-0.01em', lineHeight:1}}>{formatINR(sheet.total)}</div>
            </div>
          </div>

          {/* ACTIONS — pinned to the panel foot so the column fills the taller canvas */}
          <div style={{marginTop:'auto', paddingTop:Math.round(24+dens*12), display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:14}}>
            <button onClick={()=>navigate('booking')} className="mono" style={{
              padding:`${Math.round(24+dens*6)}px 30px`, borderRadius:105, border:'1px solid var(--gold-deep)',
              background: sold ? 'linear-gradient(180deg, #b9b3a6, #9a9384)' : 'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)',
              color:'#1a130a', fontSize:Math.round(18+dens*3), letterSpacing:'0.2em', textTransform:'uppercase', cursor:'pointer', fontWeight:700,
              boxShadow: sold ? 'none' : '0 17px 38px rgba(176,138,63,0.42), inset 0 1px 0 rgba(255,255,255,0.42)',
              display:'flex', alignItems:'center', justifyContent:'center', gap:13,
            }}>
              {sold ? 'Enquire similar' : 'Enquire / Book'} <span style={{fontSize:22}}>→</span>
            </button>
            <button onClick={()=>navigate('home')} className="mono" style={{
              padding:`${Math.round(24+dens*6)}px 26px`, borderRadius:105, border:'1.4px solid var(--line)',
              background:'rgba(255,255,255,0.6)', color:'var(--ink)', fontSize:Math.round(16+dens*3), letterSpacing:'0.2em',
              textTransform:'uppercase', cursor:'pointer', fontWeight:600,
              display:'flex', alignItems:'center', justifyContent:'center', gap:11, transition:'all 220ms',
            }}
              onMouseEnter={ev=>{ev.currentTarget.style.background='var(--ink)'; ev.currentTarget.style.color='var(--ivory)'; ev.currentTarget.style.borderColor='var(--ink)';}}
              onMouseLeave={ev=>{ev.currentTarget.style.background='rgba(255,255,255,0.6)'; ev.currentTarget.style.color='var(--ink)'; ev.currentTarget.style.borderColor='var(--line)';}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11 L12 4 L20 11"/><path d="M6 10 L6 20 L18 20 L18 10"/><path d="M10 20 L10 14 L14 14 L14 20"/></svg>
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailCell({ label, value, dens = 0 }) {
  return (
    <div style={{padding:`${Math.round(14+dens*6)}px 0`, borderBottom:'1px solid var(--line-soft)'}}>
      <div className="mono" style={{fontSize:Math.round(12+dens*2), letterSpacing:'0.22em', color:'var(--slate)'}}>{label.toUpperCase()}</div>
      <div className="serif" style={{fontSize:Math.round(26+dens*6), fontWeight:300, color:'var(--ink)', marginTop:4, letterSpacing:'-0.01em', lineHeight:1.12}}>{value}</div>
    </div>
  );
}

function PriceRow({ label, sub, value, strong, dens = 0 }) {
  return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, padding:`${Math.round(12+dens*6)}px 0`, borderBottom:'1px solid var(--line-soft)'}}>
      <div>
        <div style={{fontSize: Math.round((strong?20:19)+dens*3), color: strong?'var(--ink)':'var(--graphite)', fontWeight: strong?600:400, letterSpacing: strong?'0.01em':0}} className={strong?'mono':''}>{label}</div>
        {sub && <div className="mono" style={{fontSize:Math.round(12+dens*2), letterSpacing:'0.08em', color:'var(--muted)', marginTop:3}}>{sub}</div>}
      </div>
      <div className="serif" style={{fontSize: Math.round((strong?28:26)+dens*5), fontWeight:300, color: strong?'var(--ink)':'var(--graphite)', letterSpacing:'-0.005em', whiteSpace:'nowrap', fontVariantNumeric:'tabular-nums'}}>{value}</div>
    </div>
  );
}

const udZoomBtn = {
  width:57, height:57, borderRadius:'50%',
  background:'rgba(20,16,11,0.88)', border:'1px solid rgba(232,215,168,0.30)',
  display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'rgba(232,215,168,0.95)',
};

window.UnitDetail = UnitDetail;
