// The Universe · MASTER PLAN — interactive site explorer (matches the approved
// "Module 03" layout). Full-bleed plan, switchable views (3D massing · 2D site ·
// ground/arrival), black tower pins with gold live-availability tags, a Key
// Section + Legend panel, 2D/3D + day-night toggles, compass / zoom / fullscreen,
// and tap-a-tower → cinematic zoom-in + info, with a bridge to live Inventory.

const MP_W = 2560, MP_H = 1600;
const MP_CAL = false;
const HEADER_H = 132;

const MP_VIEWS = {
  '3d':     { label:'Master Plan',     img:'assets/masterplan/universe-masterplan.jpg', kind:'towers' },
  '2d':     { label:'2D Site Plan',    img:'assets/masterplan/universe-mp-2d.jpg',      kind:'towers' },
  'ground': { label:'Ground & Arrival',img:'assets/masterplan/universe-mp-ground.jpg',  kind:'places' },
};
const MP_VIEW_ORDER = ['3d','2d','ground'];

// Default framing per view — zoom/pan applied on entry so each plan fills the
// screen nicely (the 2D/ground site plans have empty setback margins otherwise).
const MP_VIEW_HOME = {
  // 3D master plan render carries an empty dark margin on its left; nudge the
  // framing right + a touch of zoom so the tower cluster sits centred and the
  // canvas reads full (no dead void) at BOTH 16:10 and the taller 4:3 iPad.
  '3d':     { zoom:1.22, pan:{ x:-200, y:0  } },
  '2d':     { zoom:1.04, pan:{ x:120,  y:0  } },
  'ground': { zoom:1.30, pan:{ x:-150, y:48 } },
};

const MP_TOWER_PT = {
  // Master Plan view uses the real top-down site plan (same page-17 geometry as 2D)
  '3d': { E:{x:1305,y:278}, F:{x:1704,y:332}, D:{x:1204,y:560}, G:{x:1867,y:724},
          C:{x:1204,y:975}, H:{x:1866,y:1158}, B:{x:752,y:1158}, A:{x:902,y:1158},
          J:{x:1300,y:1245}, I:{x:1620,y:1245} },
  '2d': { E:{x:1305,y:278}, F:{x:1704,y:332}, D:{x:1204,y:560}, G:{x:1867,y:724},
          C:{x:1204,y:975}, H:{x:1866,y:1158}, B:{x:752,y:1158}, A:{x:902,y:1158},
          J:{x:1300,y:1245}, I:{x:1620,y:1245} },
};

const MP_GROUND_PLACES = [
  { id:'g-retail', kind:'retail', x:1623,y:320, label:'High-Street Retail', sub:'47 shops · G+1', level:'GF + FF',
    detail:['Street-facing retail arcade along the frontage','25 shops on GF + 22 on first floor','Merged corner shops'] },
  { id:'g-aramp', kind:'parking', x:1430,y:547, label:'Apartment Ramp', sub:'GF → B3', level:'Ramp',
    detail:['Resident parking ramp from ground floor to basement 3','Four levels of parking — 3 basements + GF'] },
  { id:'g-foyer', kind:'entry', x:1324,y:660, label:'Main Arrival Court', sub:'Double-height foyer', level:'GF',
    detail:['Primary arrival & drop-off court','Double-height foyers for blocks C–J','Entrance water feature'] },
  { id:'g-rramp', kind:'parking', x:1815,y:769, label:'Retail Ramp', sub:'GF → B1', level:'Ramp',
    detail:['Dedicated retail parking ramp from GF to basement 1','Keeps shopper & resident traffic separate'] },
  { id:'g-podium', kind:'parking', x:1238,y:1080, label:'Podium Ramp', sub:'GF → Podium-01', level:'Ramp',
    detail:['Vehicle ramp from ground floor up to the podium level','Lifts residents above the retail street'] },
];
const PLACE_ACCENT = { retail:'#e8dd9a', parking:'#8a8a8a', entry:'#e0a86a' };
const PLACE_GLYPH = {
  retail:'M5 9 H19 L18 19 H6 Z M8 9 V7 A4 4 0 0 1 16 7 V9',
  parking:'M8 19 V6 H13 A4 4 0 0 1 13 14 H8',
  entry:'M7 20 V7 H17 V20 M7 7 L12 4 L17 7',
};

// Zoning legend (from the deck's ground-floor zoning key)
const MP_LEGEND = [
  { label:'Basketball Court', color:'#9bbf7a' },
  { label:'Amenities',        color:'#c98ec9' },
  { label:'Substation',       color:'#4fb3a8' },
  { label:'Residential',      color:'#e0a86a' },
  { label:'Meter Room',       color:'#8a8a8a' },
  { label:'Retail Shops',     color:'#e8dd9a' },
];
const AVAIL_LEGEND = [
  { id:'available', label:'AVAILABLE', color:'#7bb661' },
  { id:'hold',      label:'ON HOLD',   color:'#d99a2b' },
  { id:'sold',      label:'SOLD',      color:'#a9a29a' },
];

const GLASS_D = {
  background:'linear-gradient(155deg, rgba(20,17,12,0.78) 0%, rgba(12,10,7,0.74) 100%)',
  border:'1px solid rgba(255,248,230,0.26)', backdropFilter:'blur(20px) saturate(1.4)', WebkitBackdropFilter:'blur(20px) saturate(1.4)',
  boxShadow:'0 14px 36px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
};
const GLASS_L = {
  background:'rgba(255,253,247,0.86)', border:'1px solid rgba(120,98,54,0.16)',
  backdropFilter:'blur(20px) saturate(1.2)', WebkitBackdropFilter:'blur(20px) saturate(1.2)',
  boxShadow:'0 16px 40px rgba(60,44,18,0.16), inset 0 1px 0 rgba(255,255,255,0.7)',
};
const pillBtn = { ...GLASS_L, borderRadius:100, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' };

function ensureMpKeys(){
  if (typeof document==='undefined' || document.getElementById('uni-mpm-keys')) return;
  const s=document.createElement('style'); s.id='uni-mpm-keys';
  s.textContent=`@keyframes mpmPanel{0%{opacity:0;transform:translateX(34px)}100%{opacity:1;transform:translateX(0)}}
    @keyframes mpmFade{0%{opacity:0}100%{opacity:1}} @keyframes mpmPop{0%{opacity:0;transform:translateY(8px) scale(.96)}100%{opacity:1;transform:translateY(0) scale(1)}}`;
  document.head.appendChild(s);
}

function MasterPlan(){
  ensureMpKeys();
  const t = useLoop();
  const t0 = React.useRef(t).current;
  const [view, setView] = React.useState('3d');
  const [night, setNight] = React.useState(false);
  const [sel, setSel] = React.useState(null);     // tower id or place id
  const [hover, setHover] = React.useState(null);
  const [chooser, setChooser] = React.useState(false);
  const [zoom, setZoom] = React.useState(MP_VIEW_HOME['3d'].zoom);
  const [pan, setPan] = React.useState(MP_VIEW_HOME['3d'].pan);
  const [hintGone, setHintGone] = React.useState(false);
  const boxRef = React.useRef(null);
  const g = React.useRef({ active:false, mode:null, startD:0, startZoom:1, sx:0, sy:0, px:0, py:0, midX:0, midY:0, lastTap:0, ltx:0, lty:0 });

  const summaries = React.useMemo(()=>{ const m={}; TOWERS.forEach(tw=>{ m[tw.id]=towerSummary(tw.id); }); return m; },[]);
  const totals = React.useMemo(()=>TOWERS.reduce((a,tw)=>{ const s=summaries[tw.id]; a.available+=s.available;a.sold+=s.sold;a.hold+=s.hold;a.total+=s.total;return a;},{available:0,sold:0,hold:0,total:0}),[summaries]);
  const cur = MP_VIEWS[view];
  const towerPts = cur.kind==='towers' ? MP_TOWER_PT[view] : {};
  const places = cur.kind==='places' ? MP_GROUND_PLACES : [];
  const fade=()=>{ if(!hintGone) setHintGone(true); };

  React.useEffect(()=>{ Object.values(MP_VIEWS).forEach(v=>{ const im=new Image(); im.src=v.img; }); },[]);

  const clampPan=(p,z)=>{ const el=boxRef.current; if(!el) return p; const r=el.getBoundingClientRect(); const mx=Math.max(0,((z-1)/2)*r.width), my=Math.max(0,((z-1)/2)*r.height); return {x:Math.max(-mx,Math.min(mx,p.x)),y:Math.max(-my,Math.min(my,p.y))}; };
  const zoomTo=(pt,Z=2.5)=>{ setZoom(Z); setPan(clampPan({x:-(pt.x-MP_W/2)*Z, y:-(pt.y-MP_H/2)*Z}, Z)); };
  const homeOf=(id)=>MP_VIEW_HOME[id]||MP_VIEW_HOME['3d'];
  const resetXform=()=>{ const h=homeOf(view); setZoom(h.zoom); setPan(h.pan); };
  const switchView=(id)=>{ setChooser(false); if(id===view) return; setSel(null); setHover(null); const h=homeOf(id); setZoom(h.zoom); setPan(h.pan); setView(id); };
  const pickTower=(id,pt)=>{ setSel('t:'+id); zoomTo(pt, 2.6);
    // hand a "cut" of the masterplan (this tower's spot) to the next screen,
    // so FloorSelect can float a locator medallion showing where it sits.
    try { window.UNI_MP_FOCUS = { towerId:id, img:cur.img, xPct:(pt.x/MP_W)*100, yPct:(pt.y/MP_H)*100 }; } catch(e){} };
  const pickPlace=(p)=>{ setSel('p:'+p.id); zoomTo(p, 2.2); };
  const closePanel=()=>{ setSel(null); resetXform(); };

  const onTouchStart=(e)=>{ const tc=e.touches, el=boxRef.current, r=el?el.getBoundingClientRect():{left:0,top:0};
    if(tc.length===2){ const[a,b]=[tc[0],tc[1]]; g.current.mode='pinch'; g.current.active=true; g.current.startD=Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY)||1; g.current.startZoom=zoom; g.current.px=pan.x; g.current.py=pan.y; g.current.midX=(a.clientX+b.clientX)/2-r.left; g.current.midY=(a.clientY+b.clientY)/2-r.top; fade();
    } else if(tc.length===1){ const now=performance.now(), p0=tc[0];
      if(now-g.current.lastTap<320 && Math.hypot(p0.clientX-g.current.ltx,p0.clientY-g.current.lty)<40){ resetXform(); g.current.lastTap=0; g.current.active=false; fade(); return; }
      g.current.lastTap=now; g.current.ltx=p0.clientX; g.current.lty=p0.clientY;
      if(zoom>1){ g.current.mode='pan'; g.current.active=true; g.current.sx=p0.clientX; g.current.sy=p0.clientY; g.current.px=pan.x; g.current.py=pan.y; fade(); } else { g.current.mode=null; g.current.active=false; } } };
  const onTouchMove=(e)=>{ if(!g.current.active) return; if(e.cancelable) e.preventDefault(); const tc=e.touches, el=boxRef.current, r=el?el.getBoundingClientRect():{left:0,top:0,width:1,height:1};
    if(g.current.mode==='pinch'&&tc.length===2){ const[a,b]=[tc[0],tc[1]]; const nd=Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY)||1; const nz=clamp(g.current.startZoom*(nd/g.current.startD),1,5); const cx=(a.clientX+b.clientX)/2-r.left, cy=(a.clientY+b.clientY)/2-r.top; const k=nz/g.current.startZoom; setZoom(nz); setPan(clampPan({x:(cx-g.current.midX)+g.current.px*k, y:(cy-g.current.midY)+g.current.py*k}, nz));
    } else if(g.current.mode==='pan'&&tc.length===1){ const p0=tc[0]; setPan(clampPan({x:g.current.px+(p0.clientX-g.current.sx), y:g.current.py+(p0.clientY-g.current.sy)}, zoom)); } };
  const onTouchEnd=(e)=>{ if(e.touches.length===0){ g.current.active=false; g.current.mode=null; } };
  const onMouseDown=(e)=>{ if(zoom<=1) return; g.current.mode='mouse'; g.current.active=true; g.current.sx=e.clientX; g.current.sy=e.clientY; g.current.px=pan.x; g.current.py=pan.y; fade(); };
  const onMouseMove=(e)=>{ if(!g.current.active||g.current.mode!=='mouse') return; setPan(clampPan({x:g.current.px+(e.clientX-g.current.sx), y:g.current.py+(e.clientY-g.current.sy)}, zoom)); };
  const endMouse=()=>{ if(g.current.mode==='mouse'){ g.current.active=false; g.current.mode=null; } };
  const onWheel=(e)=>{ if(e.cancelable) e.preventDefault(); fade(); const el=boxRef.current, r=el?el.getBoundingClientRect():{left:0,top:0,width:1,height:1}; const cx=e.clientX-r.left-r.width/2, cy=e.clientY-r.top-r.height/2; const nz=clamp(zoom*(1+(e.deltaY>0?-0.12:0.12)),1,5); const k=nz/zoom; setZoom(nz); setPan(clampPan({x:cx-(cx-pan.x)*k, y:cy-(cy-pan.y)*k}, nz)); };
  React.useEffect(()=>{ const el=boxRef.current; if(!el) return; const tm=(e)=>onTouchMove(e), wh=(e)=>onWheel(e); el.addEventListener('touchmove',tm,{passive:false}); el.addEventListener('wheel',wh,{passive:false}); return ()=>{ el.removeEventListener('touchmove',tm); el.removeEventListener('wheel',wh); }; },[zoom,pan.x,pan.y,view]);

  const xform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
  const moveT = g.current.active ? 'none' : 'transform 620ms cubic-bezier(0.22,1,0.36,1)';
  const k = 1/zoom;
  const toggleFs=()=>{ const d=document; if(!d.fullscreenElement){ (d.documentElement.requestFullscreen||(()=>{})).call(d.documentElement); } else { (d.exitFullscreen||(()=>{})).call(d); } };

  return (
    <div style={{ position:'absolute', inset:0, background:'transparent', overflow:'hidden' }}>
      {/* ── PLAN CANVAS ── */}
      <div ref={boxRef}
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onTouchCancel={onTouchEnd}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={endMouse} onMouseLeave={endMouse}
        onClick={(e)=>{ if(e.target===e.currentTarget||e.target.tagName==='IMG'||e.target.tagName==='svg'){ if(sel) closePanel(); setChooser(false); } }}
        style={{ position:'absolute', inset:0, overflow:'hidden', touchAction:'none', cursor: zoom>1 ? (g.current.mode==='mouse'?'grabbing':'grab') : 'default' }}>
        <div style={{ position:'absolute', inset:0, transform:xform, transformOrigin:'center', transition:moveT, willChange:'transform' }}>
          {Object.entries(MP_VIEWS).map(([id,v])=>(
            <img key={id} src={v.img} alt={v.label} draggable="false"
              style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', userSelect:'none', pointerEvents:'none',
                       opacity:id===view?1:0, transition:'opacity 520ms ease' }}/>
          ))}
          <svg viewBox={`0 0 ${MP_W} ${MP_H}`} preserveAspectRatio="xMidYMid slice" style={{ position:'absolute', inset:0, width:'100%', height:'100%', overflow:'visible' }}>
            {MP_CAL && <MpCalGrid/>}
            {/* place pins (ground view) */}
            {places.map((p,i)=>{ const on=hover==='p:'+p.id||sel==='p:'+p.id; const col=PLACE_ACCENT[p.kind]||'#e0a86a'; const ap=clamp((t-t0-0.1-i*0.05)/0.5); const R=on?18:14;
              return (
                <g key={p.id} transform={`translate(${p.x} ${p.y}) scale(${k})`} style={{cursor:'pointer',opacity:ap}}
                   onMouseEnter={()=>setHover('p:'+p.id)} onMouseLeave={()=>setHover(null)} onClick={(e)=>{e.stopPropagation(); pickPlace(p);}}>
                  <circle r="30" fill="transparent"/>
                  {on && <circle r={R+8} fill="none" stroke={col} strokeWidth="2" opacity="0.6"/>}
                  <circle r={R} fill="#141008" stroke={on?'#fff2cc':col} strokeWidth={on?2.4:1.8} style={{filter:'drop-shadow(0 3px 7px rgba(0,0,0,0.55))',transition:'all .18s'}}/>
                  <g fill="none" stroke={on?'#fff2cc':col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{transform:`translate(-12px,-12px) scale(${R/13})`}}><path d={PLACE_GLYPH[p.kind]}/></g>
                </g>
              );
            })}
            {/* tower pins — black disc + letter + gold availability tag */}
            {Object.entries(towerPts).map(([id,pt],i)=>{ const s=summaries[id]; const on=hover==='t:'+id||sel==='t:'+id; const ap=clamp((t-t0-0.05-i*0.04)/0.5); const R=on?26:23;
              const tagW=on?64:58, tagH=on?40:36;
              return (
                <g key={id} transform={`translate(${pt.x} ${pt.y}) scale(${k})`} style={{cursor:'pointer',opacity:ap}}
                   onMouseEnter={()=>setHover('t:'+id)} onMouseLeave={()=>setHover(null)} onClick={(e)=>{e.stopPropagation(); pickTower(id,pt);}}>
                  <circle r="44" fill="transparent"/>
                  {/* gold availability tag (behind, to the right) */}
                  <g transform={`translate(${R-6} ${-tagH/2})`}>
                    <rect x="0" y="0" width={tagW} height={tagH} rx={tagH/2}
                      fill="url(#mpGold)" stroke="#8a6a2e" strokeWidth="1"
                      style={{filter:'drop-shadow(0 3px 8px rgba(0,0,0,0.4))'}}/>
                    <text x={tagW/2+8} y={tagH/2+1} textAnchor="middle" dominantBaseline="middle"
                      fontFamily="'JetBrains Mono',monospace" fontSize={on?20:18} fontWeight="700" fill="#1a130a">{s.available}</text>
                  </g>
                  {/* black disc + letter */}
                  <circle r={R} fill="#16120b" stroke={on?'#ffd97a':'#caa463'} strokeWidth={on?3:2}
                    style={{filter:on?'drop-shadow(0 0 14px rgba(255,217,122,0.6))':'drop-shadow(0 4px 10px rgba(0,0,0,0.5))',transition:'all .2s'}}/>
                  <text x="0" y="1" textAnchor="middle" dominantBaseline="middle" fontFamily="Cinzel, serif" fontSize={on?26:23} fontWeight="600" fill="#fff3d4">{id}</text>
                </g>
              );
            })}
            <defs>
              <linearGradient id="mpGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f3dca0"/><stop offset="0.5" stopColor="#e3bf78"/><stop offset="1" stopColor="#caa463"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* ── DAY/NIGHT overlay ── */}
      <div style={{ position:'absolute', top:HEADER_H, left:0, right:0, bottom:0, pointerEvents:'none', transition:'opacity 600ms ease', opacity:night?1:0,
        background:'linear-gradient(180deg, rgba(8,14,30,0.55), rgba(6,10,22,0.68))', mixBlendMode:'multiply' }}/>
      <div style={{ position:'absolute', top:HEADER_H, left:0, right:0, bottom:0, pointerEvents:'none', transition:'opacity 600ms ease', opacity:night?0.5:0,
        background:'radial-gradient(ellipse at 50% 40%, rgba(80,110,190,0.18), transparent 70%)' }}/>

      {/* ════════ HEADER (cream band) ════════ */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:HEADER_H, zIndex:20, display:'flex', alignItems:'center', padding:'0 40px',
        background:'linear-gradient(180deg, #fbf6ea 0%, #f6efdd 100%)', borderBottom:'1px solid rgba(120,98,54,0.14)' }}>
        <button onClick={()=>navigate('home')} aria-label="Back" style={{ width:56, height:56, borderRadius:'50%', flexShrink:0,
          background:'#fff', border:'1px solid rgba(120,98,54,0.2)', boxShadow:'0 6px 18px rgba(60,44,18,0.12)', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', color:'#3a2c14' }}><Icons.back width={24} height={24}/></button>
        <div style={{ marginLeft:28 }}>
          <div className="mono" style={{ fontSize:13, letterSpacing:'0.4em', color:'var(--gold-deep)' }}>MODULE · 03</div>
          <div className="serif" style={{ fontSize:46, fontWeight:400, color:'var(--ink)', lineHeight:1.0, marginTop:2 }}>Master Plan</div>
          <div className="serif" style={{ fontSize:18, fontStyle:'italic', color:'var(--graphite)', marginTop:3 }}>10 towers · tap a tower to explore live inventory</div>
        </div>
        <div style={{ flex:1 }}/>
        <div style={{ display:'flex', alignItems:'center', gap:28 }}>
          <UniverseMonogram size={68} progress={1} color="var(--gold-deep)"/>
          <div style={{display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end'}}>
            <UniverseWordmark size={26} color="var(--ink)" tight/>
            <VenusCredit size={13}/>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'12px 30px', borderRadius:16,
            background:'linear-gradient(160deg, #1a1610, #0c0a07)', boxShadow:'0 10px 30px rgba(0,0,0,0.3)' }}>
            <div className="mono" style={{ fontSize:10, letterSpacing:'0.3em', color:'var(--gold)' }}>AVAILABLE NOW</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:6, marginTop:2 }}>
              <span className="serif" style={{ fontSize:40, fontWeight:500, color:'#fff' }}>{totals.available}</span>
              <span className="serif" style={{ fontSize:22, color:'rgba(255,255,255,0.5)' }}>/ {totals.total}</span>
              <span className="mono" style={{ fontSize:11, letterSpacing:'0.16em', color:'rgba(232,215,168,0.7)', marginLeft:2 }}>Units</span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════ CHOOSE VIEW (floating field) ════════ */}
      <div style={{ position:'absolute', top:HEADER_H+22, left:'50%', transform:'translateX(-50%)', zIndex:16 }}>
        <button onClick={()=>setChooser(c=>!c)} className="mono" style={{ ...pillBtn, padding:'13px 24px', gap:12, fontSize:13, letterSpacing:'0.16em', color:'var(--ink)' }}>
          <span style={{ color:'var(--slate)' }}>VIEW</span>
          <span className="serif" style={{ fontSize:18, letterSpacing:0, color:'var(--ink)' }}>{cur.label}</span>
          <span style={{ transform:chooser?'rotate(180deg)':'none', transition:'transform .2s', color:'var(--gold-deep)' }}>▾</span>
        </button>
        {chooser && (
          <div style={{ position:'absolute', top:'110%', left:'50%', transform:'translateX(-50%)', marginTop:8, width:248, padding:6, borderRadius:16, ...GLASS_L, animation:'mpmPop 200ms ease both' }}>
            {MP_VIEW_ORDER.map(id=>{ const v=MP_VIEWS[id]; const on=id===view;
              return (
                <button key={id} onClick={()=>switchView(id)} style={{ width:'100%', textAlign:'left', padding:'12px 16px', borderRadius:11, cursor:'pointer', border:'none',
                  background:on?'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)':'transparent', display:'flex', flexDirection:'column', gap:2, transition:'all .15s' }}>
                  <span className="serif" style={{ fontSize:19, color:on?'#1a130a':'var(--ink)' }}>{v.label}</span>
                  <span className="mono" style={{ fontSize:11, letterSpacing:'0.1em', color:on?'rgba(26,19,10,0.7)':'var(--slate)' }}>{v.kind==='towers'?'Towers · live availability':'Access · ramps · retail'}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ════════ KEY SECTION + LEGEND (right card) ════════ */}
      <div style={{ position:'absolute', top:HEADER_H+22, right:30, width:418, zIndex:15, padding:'28px 30px', borderRadius:24, ...GLASS_L, color:'var(--ink)' }}>
        <div className="serif" style={{ fontSize:30, fontWeight:400 }}>Key Section</div>
        <div style={{ marginTop:16, borderRadius:12, overflow:'hidden', background:'#fff', border:'1px solid rgba(120,98,54,0.12)' }}>
          <img src="assets/masterplan/universe-section.jpg" alt="Schematic section" style={{ width:'100%', display:'block' }}/>
        </div>
        <div className="serif" style={{ fontSize:27, fontWeight:400, marginTop:24 }}>Legend</div>
        <div style={{ marginTop:18, display:'flex', flexDirection:'column', gap:16 }}>
          {MP_LEGEND.map(l=>(
            <div key={l.label} style={{ display:'flex', alignItems:'center', gap:15 }}>
              <span style={{ width:28, height:28, borderRadius:7, background:l.color, border:'1px solid rgba(0,0,0,0.12)', flexShrink:0, boxShadow:'0 2px 5px rgba(0,0,0,0.1)' }}/>
              <span style={{ fontSize:19, letterSpacing:'0.01em', color:'var(--graphite)' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ════════ BOTTOM-LEFT: 2D/3D · day-night · availability ════════ */}
      <div style={{ position:'absolute', left:30, bottom:34, zIndex:16, display:'flex', flexDirection:'column', gap:16, alignItems:'flex-start' }}>
        <div style={{ display:'flex', gap:14 }}>
          {/* 2D / 3D toggle */}
          <div style={{ ...GLASS_L, borderRadius:16, padding:6, display:'flex', gap:4 }}>
            {[['2d','2D'],['3d','3D']].map(([id,lbl])=>{ const on=view===id;
              return <button key={id} onClick={()=>switchView(id)} className="mono" style={{ padding:'10px 22px', borderRadius:11, cursor:'pointer', border:'none',
                background:on?'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)':'transparent', color:on?'#1a130a':'var(--slate)', fontWeight:on?800:600, fontSize:15, letterSpacing:'0.08em', transition:'all .2s' }}>{lbl}</button>;
            })}
          </div>
          {/* day / night */}
          <button onClick={()=>setNight(n=>!n)} aria-label="Day / night" style={{ ...pillBtn, width:56, height:56, borderRadius:16, color:'var(--gold-deep)' }}>
            {night
              ? <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.5 6.5 0 0 0 21 12.8Z"/></svg>
              : <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/></svg>}
          </button>
        </div>
        {/* availability legend */}
        <div style={{ ...GLASS_L, borderRadius:100, padding:'12px 22px', display:'flex', gap:22 }}>
          {AVAIL_LEGEND.map(a=>(
            <div key={a.id} style={{ display:'flex', alignItems:'center', gap:9 }}>
              <span style={{ width:12, height:12, borderRadius:'50%', background:a.color }}/>
              <span className="mono" style={{ fontSize:13, letterSpacing:'0.14em', color:'var(--graphite)' }}>{a.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ════════ BOTTOM-RIGHT: compass · zoom · fullscreen ════════ */}
      <div style={{ position:'absolute', right:30, bottom:34, zIndex:16, display:'flex', alignItems:'flex-end', gap:14 }}>
        <div style={{ ...GLASS_L, width:74, height:74, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
          <svg viewBox="0 0 60 60" width="64" height="64">
            <g transform={`rotate(${(t*8)%360} 30 30)`} opacity="0.25"><circle cx="30" cy="30" r="26" fill="none" stroke="var(--gold-deep)" strokeWidth="0.6" strokeDasharray="2 4"/></g>
            <path d="M30 8 L34 30 L30 27 L26 30 Z" fill="#c0392b"/>
            <path d="M30 52 L26 30 L30 33 L34 30 Z" fill="#8a8a8a"/>
            <text x="30" y="7" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="9" fontWeight="700" fill="var(--ink)">N</text>
          </svg>
        </div>
        <div style={{ ...GLASS_L, borderRadius:100, padding:'8px 10px', display:'flex', alignItems:'center', gap:6 }}>
          <button onClick={()=>{ fade(); const nz=clamp(zoom-0.5,1,5); setZoom(nz); setPan(p=>clampPan(p,nz)); }} aria-label="Zoom out" style={{ width:46, height:46, borderRadius:'50%', border:'none', background:'transparent', cursor:'pointer', color:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center' }}><Icons.minus width={22} height={22}/></button>
          <div style={{ width:1, height:24, background:'rgba(120,98,54,0.2)' }}/>
          <button onClick={()=>{ fade(); setZoom(z=>clamp(z+0.5,1,5)); }} aria-label="Zoom in" style={{ width:46, height:46, borderRadius:'50%', border:'none', background:'transparent', cursor:'pointer', color:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center' }}><Icons.plus width={22} height={22}/></button>
        </div>
        <button onClick={toggleFs} aria-label="Fullscreen" style={{ ...pillBtn, width:62, height:62, borderRadius:18, color:'var(--ink)' }}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>
        </button>
      </div>

      {/* hint */}
      {!sel && zoom<=1 && (
        <div className="mono" style={{ position:'absolute', bottom:120, left:'50%', transform:'translateX(-50%)', zIndex:8, pointerEvents:'none', opacity:hintGone?0:0.8, transition:'opacity .5s', fontSize:12.5, letterSpacing:'0.22em', color:night?'rgba(255,248,224,0.85)':'rgba(40,30,15,0.7)', textShadow:night?'0 1px 8px rgba(0,0,0,0.8)':'none' }}>
          TAP A {cur.kind==='towers'?'TOWER':'POINT'} TO ZOOM IN · CHOOSE A VIEW ABOVE · PINCH / SCROLL TO ZOOM
        </div>
      )}

      {/* ════════ DETAIL PANEL ════════ */}
      {sel && (() => {
        if(sel.startsWith('t:')){ const id=sel.slice(2); return <MpTowerPanel id={id} s={summaries[id]} onClose={closePanel}/>; }
        const p=MP_GROUND_PLACES.find(x=>'p:'+x.id===sel); if(!p) return null; return <MpPlacePanel p={p} onClose={closePanel}/>;
      })()}
    </div>
  );
}

// ── tower detail panel (right slide-in) ──
function MpTowerPanel({ id, s, onClose }){
  const tw = TOWERS.find(t=>t.id===id); const spec = BLOCK_SPECS[tw.pair];
  const carps = spec.slots.map(x=>x.sqft); const phs = spec.ph.map(x=>x.sqft);
  const pct = Math.round(100*s.available/Math.max(1,s.total));
  return (
    <div style={{ position:'absolute', top:0, right:0, bottom:0, width:520, zIndex:24, padding:'40px 38px', display:'flex', flexDirection:'column',
      background:'linear-gradient(150deg, rgba(22,18,12,0.94) 0%, rgba(12,10,7,0.94) 100%)', borderLeft:'1px solid rgba(232,215,168,0.22)',
      backdropFilter:'blur(26px)', WebkitBackdropFilter:'blur(26px)', boxShadow:'-24px 0 60px rgba(0,0,0,0.5)', color:'#faf6e8', animation:'mpmPanel 320ms cubic-bezier(0.22,1,0.36,1) both' }}>
      <button onClick={onClose} aria-label="Close" style={{ position:'absolute', top:30, right:30, width:38, height:38, borderRadius:'50%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(232,215,168,0.28)', color:'rgba(232,215,168,0.9)', cursor:'pointer', fontSize:17 }}>✕</button>
      <div className="mono" style={{ fontSize:12, letterSpacing:'0.3em', color:'var(--gold)' }}>{tw.cluster.toUpperCase()}</div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:16, margin:'8px 0 4px' }}>
        <div style={{ width:66, height:66, borderRadius:'50%', flexShrink:0, background:'#16120b', border:'2px solid var(--gold)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span className="display" style={{ fontSize:34, fontWeight:600, color:'#fff3d4' }}>{id}</span>
        </div>
        <div className="serif" style={{ fontSize:40, fontWeight:300, lineHeight:1 }}>{tw.name}</div>
      </div>
      <div className="serif" style={{ fontSize:18, fontStyle:'italic', color:'rgba(245,241,232,0.7)', marginTop:8 }}>{tw.view}</div>

      {/* availability bar */}
      <div style={{ marginTop:24, padding:'18px 20px', borderRadius:16, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(232,215,168,0.16)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
          <span className="mono" style={{ fontSize:12, letterSpacing:'0.2em', color:'rgba(232,215,168,0.6)' }}>LIVE AVAILABILITY</span>
          <span className="serif" style={{ fontSize:28, color:'#7bb661' }}>{s.available}<span style={{fontSize:16,color:'rgba(245,241,232,0.5)'}}> / {s.total}</span></span>
        </div>
        <div style={{ marginTop:12, height:8, borderRadius:8, overflow:'hidden', display:'flex', background:'rgba(0,0,0,0.3)' }}>
          <div style={{ width:`${100*s.available/s.total}%`, background:'#7bb661' }}/>
          <div style={{ width:`${100*s.hold/s.total}%`, background:'#d99a2b' }}/>
          <div style={{ width:`${100*s.sold/s.total}%`, background:'#a9a29a' }}/>
        </div>
        <div style={{ display:'flex', gap:18, marginTop:12 }}>
          {[['#7bb661',`${s.available} available`],['#d99a2b',`${s.hold} on hold`],['#a9a29a',`${s.sold} sold`]].map((x,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:7 }}><span style={{width:9,height:9,borderRadius:'50%',background:x[0]}}/><span className="mono" style={{fontSize:13,color:'rgba(245,241,232,0.82)'}}>{x[1]}</span></div>
          ))}
        </div>
      </div>

      {[['Typology',tw.type],['Homes per floor',`${spec.upf} apartments`],['Storeys',`${spec.phFloor} floors`],
        ['Carpet area',`${fmtSqft(Math.min(...carps))} – ${fmtSqft(Math.max(...carps))}`],['Penthouse',`${fmtSqft(Math.min(...phs))} – ${fmtSqft(Math.max(...phs))}`]].map((r,i)=>(
        <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'12px 0', borderBottom:'1px solid rgba(232,215,168,0.1)' }}>
          <span className="mono" style={{ fontSize:12, letterSpacing:'0.16em', color:'rgba(232,215,168,0.6)' }}>{r[0].toUpperCase()}</span>
          <span className="serif" style={{ fontSize:21, color:'#faf6e8', textAlign:'right' }}>{r[1]}</span>
        </div>
      ))}
      <div style={{ flex:1 }}/>
      <button onClick={()=>navigate(`floors/${id}`)} className="mono" style={{ marginTop:22, width:'100%', padding:'18px', borderRadius:14, cursor:'pointer', border:'none',
        background:'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)', color:'#1a130a', fontSize:12.5, letterSpacing:'0.2em', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
        EXPLORE LIVE INVENTORY <Icons.arrow width={17} height={17}/>
      </button>
    </div>
  );
}

// ── ground place panel ──
function MpPlacePanel({ p, onClose }){
  const col = PLACE_ACCENT[p.kind]||'#e0a86a';
  return (
    <div style={{ position:'absolute', top:0, right:0, bottom:0, width:500, zIndex:24, padding:'40px 38px',
      background:'linear-gradient(150deg, rgba(22,18,12,0.94) 0%, rgba(12,10,7,0.94) 100%)', borderLeft:'1px solid rgba(232,215,168,0.22)',
      backdropFilter:'blur(26px)', WebkitBackdropFilter:'blur(26px)', boxShadow:'-24px 0 60px rgba(0,0,0,0.5)', color:'#faf6e8', animation:'mpmPanel 320ms cubic-bezier(0.22,1,0.36,1) both' }}>
      <button onClick={onClose} aria-label="Close" style={{ position:'absolute', top:30, right:30, width:38, height:38, borderRadius:'50%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(232,215,168,0.28)', color:'rgba(232,215,168,0.9)', cursor:'pointer', fontSize:17 }}>✕</button>
      <div className="mono" style={{ fontSize:12, letterSpacing:'0.24em', color:col }}>{p.level.toUpperCase()} · {p.sub.toUpperCase()}</div>
      <div className="serif" style={{ fontSize:38, fontWeight:300, lineHeight:1.05, margin:'10px 0 20px' }}>{p.label}</div>
      <div style={{ height:1, background:'rgba(232,215,168,0.16)', marginBottom:20 }}/>
      {p.detail.map((d,i)=>(
        <div key={i} style={{ display:'flex', gap:13, marginBottom:15 }}><span style={{ marginTop:10, width:6, height:6, borderRadius:'50%', background:col, flexShrink:0 }}/><span style={{ fontSize:19, lineHeight:1.5, color:'rgba(245,241,232,0.9)' }}>{d}</span></div>
      ))}
    </div>
  );
}

function MpCalGrid(){
  const lines=[];
  for(let x=0;x<=MP_W;x+=160){ lines.push(<line key={'x'+x} x1={x} y1={0} x2={x} y2={MP_H} stroke={x%640===0?'#00e6ff':'rgba(255,0,90,0.5)'} strokeWidth="1"/>); lines.push(<text key={'xt'+x} x={x+3} y={26} fill="#00e6ff" fontSize="20">{x}</text>); }
  for(let y=0;y<=MP_H;y+=160){ lines.push(<line key={'y'+y} x1={0} y1={y} x2={MP_W} y2={y} stroke={y%640===0?'#00e6ff':'rgba(255,0,90,0.5)'} strokeWidth="1"/>); lines.push(<text key={'yt'+y} x={3} y={y+22} fill="#00e6ff" fontSize="20">{y}</text>); }
  return <g>{lines}</g>;
}

window.MasterPlan = MasterPlan;
