// Inventory · Master Plan — MODULE 05.
// Full-bleed editorial site plan (assets/masterplan/inventory-mp.png, 1672×941)
// fitted into the 2560×1600 canvas (object-fit: contain). An SVG overlay
// (viewBox 0 0 1672 941, preserveAspectRatio xMidYMid meet) sits exactly over
// the rendered image so the 10 tower footprint polygons (from
// inventory-towers.json) map 1:1 onto the towers. Each tower is a clickable
// BUTTON → its typical floor plan (navigate('floors/<id>') → FloorSelect →
// FloorPlate → UnitDetail, the existing drill-down).
//
// Globals used: TOWERS, towerSummary, STATUS, useLoop, clamp, Icons,
// UniverseMonogram, UniverseWordmark — all defined in data.jsx / utils.jsx.

const INV_IMG = 'assets/masterplan/inventory-mp.png';
const INV_IMG_W = 1672, INV_IMG_H = 941;        // native image (= SVG viewBox)
const INV_CANVAS_W = 2560, INV_CANVAS_H = 1600; // fixed app canvas

// Tower footprint polygons + centroids in the 1672×941 image space.
// Extracted from assets/masterplan/inventory-towers.json (exact hit-areas).
const INV_TOWERS = {
  E:{cx:729.9,cy:180.5,points:[[651.8,231.5],[658.8,173.9],[687.5,178.8],[687.5,175.7],[735.5,182.7],[736.2,171.8],[688.5,167.5],[689.2,164.0],[661.0,160.1],[669.4,104.3],[843.1,128.0],[836.5,182.8],[776.4,176.9],[775.1,189.4],[833.2,198.0],[826.6,251.5],[651.8,231.5]]},
  F:{cx:966.9,cy:211.1,points:[[880.6,258.3],[887.5,203.5],[948.3,210.4],[948.7,199.4],[887.5,190.2],[896.7,132.1],[1072.6,155.2],[1068.0,212.3],[989.7,203.1],[989.3,215.9],[1063.4,224.7],[1057.4,280.4],[880.6,258.3]]},
  D:{cx:673.0,cy:380.4,points:[[651.5,303.1],[724.8,303.1],[724.8,444.7],[661.7,444.7],[661.7,406.4],[665.8,406.4],[665.8,396.4],[672.2,396.4],[672.2,390.3],[650.7,390.3],[651.5,303.1]]},
  G:{cx:1103.3,cy:415.8,points:[[1040.7,330.5],[1165.1,330.5],[1165.7,358.6],[1155.1,358.1],[1155.1,387.2],[1147.7,387.2],[1148.2,417.9],[1142.4,417.4],[1142.4,425.8],[1148.7,426.4],[1147.7,446.0],[1155.1,446.5],[1155.1,476.1],[1166.2,476.7],[1165.1,503.7],[1039.1,503.1],[1040.2,476.7],[1051.8,475.6],[1051.8,446.0],[1059.2,446.0],[1059.2,433.2],[1096.3,432.2],[1095.8,417.4],[1059.8,418.4],[1059.8,387.7],[1050.8,387.2],[1050.8,357.5],[1040.7,357.5],[1040.7,330.5]]},
  C:{cx:673.0,cy:509.5,points:[[652.0,582.0],[652.0,494.5],[665.3,494.5],[665.3,482.3],[662.4,482.3],[662.4,442.6],[723.0,442.6],[723.0,582.6],[652.0,582.0]]},
  H:{cx:1103.2,cy:655.1,points:[[1040.7,559.3],[1165.1,560.3],[1165.7,588.9],[1155.1,588.4],[1156.1,617.0],[1146.6,617.5],[1146.6,647.2],[1140.2,646.6],[1140.8,655.1],[1148.7,656.7],[1148.7,676.3],[1155.6,676.8],[1155.6,705.4],[1166.2,706.5],[1165.7,734.0],[1114.8,734.5],[1113.8,713.3],[1094.2,712.8],[1093.7,734.5],[1041.8,733.5],[1041.8,705.9],[1050.8,704.9],[1051.8,676.8],[1057.1,676.8],[1057.1,661.5],[1096.3,662.0],[1095.8,649.3],[1057.7,648.7],[1057.7,617.0],[1050.8,616.5],[1050.8,586.8],[1040.2,586.8],[1040.7,559.3]]},
  B:{cx:482.9,cy:674.4,points:[[399.4,717.6],[399.4,681.3],[422.2,681.3],[422.2,659.5],[399.6,659.5],[399.6,624.5],[439.3,624.5],[439.3,635.0],[454.4,635.0],[454.4,637.4],[517.3,637.4],[517.3,634.5],[532.0,634.5],[532.0,624.1],[570.7,624.1],[570.7,658.8],[549.2,658.8],[549.2,682.1],[571.1,682.1],[571.1,718.0],[532.3,718.0],[532.3,708.3],[516.9,708.3],[516.9,703.2],[494.7,703.2],[494.7,674.5],[475.7,674.5],[475.7,702.9],[453.8,702.9],[453.8,707.2],[439.1,707.2],[439.1,718.7],[399.4,717.6]]},
  J:{cx:748.5,cy:710.0,points:[[679.6,733.5],[679.1,676.3],[695.0,676.8],[695.0,669.4],[810.9,669.4],[811.4,676.8],[832.1,677.3],[833.1,726.6],[796.1,727.6],[795.6,722.9],[774.9,721.8],[775.4,733.5],[731.0,734.0],[730.4,728.7],[702.4,728.2],[702.4,733.5],[679.6,733.5]]},
  I:{cx:921.0,cy:712.3,points:[[986.2,728.7],[985.1,677.9],[967.6,677.9],[968.2,669.9],[854.3,668.9],[854.9,676.3],[832.1,677.3],[833.1,726.6],[871.3,727.6],[871.3,722.9],[889.8,723.4],[889.3,734.0],[930.0,734.5],[934.3,734.5],[934.8,729.2],[962.3,728.7],[961.8,732.9],[986.2,733.5],[986.2,728.7]]},
  A:{cx:587.4,cy:866.3,points:[[538.6,899.7],[538.6,910.5],[495.4,910.2],[496.5,875.2],[520.3,875.5],[520.3,856.2],[496.5,856.2],[497.6,822.3],[516.2,823.0],[516.2,820.7],[538.8,820.7],[538.8,832.2],[553.7,832.2],[553.7,837.0],[576.4,837.0],[576.4,862.1],[593.8,862.1],[593.8,836.4],[615.6,836.4],[615.6,832.0],[633.0,832.0],[633.0,822.1],[654.0,822.1],[654.0,824.6],[674.3,824.6],[674.3,856.4],[650.6,856.4],[650.6,875.5],[675.4,875.5],[675.4,909.8],[653.3,909.8],[653.3,911.6],[632.6,911.6],[632.6,899.0],[616.6,899.0],[616.6,896.5],[602.6,896.5],[602.6,898.3],[566.8,898.3],[566.8,896.3],[553.5,896.3],[553.5,899.6],[538.6,899.7]]},
};
const INV_ORDER = ['A','B','C','D','E','F','G','H','I','J'];

// Per-tower animated gradient palettes (10 distinct refined hues) +
// stop-color cycle / rotation durations (staggered 7–13s).
const INV_PALETTE = {
  A:{a:['#c9a05e','#e2c487','#b08a3f'], b:['#ead7a8','#c9a05e','#d8b873'], cyc:9,    rot:16},  // gold
  B:{a:['#5b9bd5','#7fb5e6','#4a86c5'], b:['#a9cce8','#5b9bd5','#6fa8dc'], cyc:11,   rot:19},  // sky-blue
  C:{a:['#2a9d8f','#46b3a4','#1f8276'], b:['#7fd1c6','#2a9d8f','#3cb5a6'], cyc:8,    rot:14},  // teal
  D:{a:['#4caf50','#6fc471','#3a943e'], b:['#a5d6a7','#4caf50','#66bb6a'], cyc:12,   rot:21},  // green
  E:{a:['#7b5cd6','#9a7ee6','#6244c0'], b:['#c4b0ef','#7b5cd6','#8a6fe0'], cyc:10,   rot:18},  // violet
  F:{a:['#e9685a','#f08878','#d6493b'], b:['#f5b0a6','#e9685a','#ee7d6f'], cyc:7,    rot:13},  // coral
  G:{a:['#2bb5c9','#50c8da','#1f97a8'], b:['#8fdde8','#2bb5c9','#43c2d3'], cyc:13,   rot:22},  // aqua
  H:{a:['#c84d9e','#d96fb4','#a83c84'], b:['#eaa3d2','#c84d9e','#d666ad'], cyc:9.5,  rot:17},  // magenta
  I:{a:['#9bbf3c','#b3d35a','#82a52e'], b:['#d4e89a','#9bbf3c','#aecd58'], cyc:11.5, rot:20},  // lime
  J:{a:['#e8923c','#f0aa5e','#d6792a'], b:['#f5c79a','#e8923c','#eea35a'], cyc:8.5,  rot:15},  // orange
};
// Label-pill anchors in 1672×941 image space — fanned into open courtyard /
// side margins so leader pills never overlap the towers or each other.
const INV_LABEL_ANCHOR = {
  E:[700,72],  F:[1010,90], D:[515,355], C:[515,545], B:[350,690],
  A:[460,895], G:[1255,400], H:[1255,672], I:[990,815], J:[705,815],
};

const INV_KEYS_ID = 'uni-inventory-keys-v2';
function ensureInvKeys(){
  if (typeof document==='undefined' || document.getElementById(INV_KEYS_ID)) return;
  const s=document.createElement('style'); s.id=INV_KEYS_ID;
  s.textContent=`
    @keyframes invDiscIn { 0%{opacity:0; transform:translateY(-10px) scale(0.6);} 100%{opacity:1; transform:translateY(0) scale(1);} }
    @keyframes invCardIn { from{opacity:0; transform:translate(-50%,14px);} to{opacity:1; transform:translate(-50%,0);} }
    @keyframes invHeadIn { from{opacity:0; transform:translateY(-12px);} to{opacity:1; transform:translateY(0);} }
    @keyframes invLetterFloat { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-2px);} }
  `;
  document.head.appendChild(s);
}

function Inventory(){
  ensureInvKeys();
  const t = useLoop();
  const [hover, setHover] = React.useState(null);   // tower id
  const [filter, setFilter] = React.useState('all'); // all | available

  // per-tower availability (real, from the placeholder status hash on real units)
  const sums = React.useMemo(() => {
    const m = {}; TOWERS.forEach(tw => { m[tw.id] = towerSummary(tw.id); }); return m;
  }, []);
  const totals = React.useMemo(() => TOWERS.reduce((a,tw)=>{
    const s=sums[tw.id]; a.available+=s.available; a.sold+=s.sold; a.hold+=s.hold; a.total+=s.total; return a;
  }, {available:0,sold:0,hold:0,total:0}), [sums]);

  // contain-fit the image into the LIVE canvas (adaptive height: 1600 on the
  // 16:10 tablet, up to 1920 on iPad Pro 4:3). Centring against the real height
  // keeps the site map intentionally centred at BOTH heights — no dead band at
  // the bottom on the taller 4:3 canvas. Width-bound contain → full width used.
  const CH = (window.UNIVERSE_CANVAS && window.UNIVERSE_CANVAS.H) || INV_CANVAS_H;
  const dens = CH > 1720 ? 1.12 : 1;   // gentle iPad density bump (16:10 unchanged)
  const scale = Math.min(INV_CANVAS_W/INV_IMG_W, CH/INV_IMG_H);
  const dispW = INV_IMG_W*scale, dispH = INV_IMG_H*scale;
  const offX = (INV_CANVAS_W-dispW)/2, offY = (CH-dispH)/2;
  const imageBox = { position:'absolute', left:offX, top:offY, width:dispW, height:dispH };

  const go = (id) => navigate(`floors/${id}`);
  const tint = (s) => s.available>0 ? STATUS.available.dot : s.hold>0 ? STATUS.hold.dot : STATUS.sold.dot;
  const dimmed = (s) => filter==='available' && s.available===0;
  const hoveredTw = hover ? TOWERS.find(x=>x.id===hover) : null;

  return (
    <div style={{position:'absolute', inset:0, background:'transparent', color:'var(--ink)', overflow:'hidden'}}>

      {/* ── MASTER PLAN IMAGE (contain-fit, centered) — blends seamlessly into the shared cream backdrop, no shadow / no cut ── */}
      <div style={{...imageBox, zIndex:0}}>
        <img src={INV_IMG} alt="The Universe — master plan" draggable="false"
          style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'fill', userSelect:'none', pointerEvents:'none'}}/>
      </div>

      {/* ── SVG OVERLAY — exactly over the image rect (1:1 mapping) ── */}
      <svg viewBox={`0 0 ${INV_IMG_W} ${INV_IMG_H}`} preserveAspectRatio="xMidYMid meet"
        style={{...imageBox, zIndex:2, overflow:'visible'}}>

        {/* ── animated multi-hue gradient defs — one per tower ── */}
        <defs>
          {INV_ORDER.map(id => {
            const P = INV_PALETTE[id];
            const v0 = `${P.a[0]};${P.a[1]};${P.a[2]};${P.a[0]}`;
            const v1 = `${P.b[0]};${P.b[1]};${P.b[2]};${P.b[0]}`;
            return (
              <linearGradient key={id} id={`invGrad-${id}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={P.a[0]}>
                  <animate attributeName="stop-color" values={v0} dur={`${P.cyc}s`} repeatCount="indefinite"/>
                </stop>
                <stop offset="100%" stopColor={P.b[0]}>
                  <animate attributeName="stop-color" values={v1} dur={`${P.cyc}s`} repeatCount="indefinite"/>
                </stop>
                <animateTransform attributeName="gradientTransform" type="rotate"
                  from="0 0.5 0.5" to="360 0.5 0.5" dur={`${P.rot}s`} repeatCount="indefinite"/>
              </linearGradient>
            );
          })}
        </defs>

        {INV_ORDER.map((id, i) => {
          const T = INV_TOWERS[id]; if(!T) return null;
          const tw = TOWERS.find(x=>x.id===id); const s = sums[id];
          const on = hover===id;
          const col = tint(s);
          const dim = dimmed(s);
          const pts = T.points.map(p=>p.join(',')).join(' ');
          const appear = clamp((t - 0.12 - i*0.045) / 0.5);
          // counter-scale the disc so it stays constant screen size regardless of svg scale
          const k = 1/scale;
          return (
            <g key={id} style={{cursor: dim?'default':'pointer', opacity: dim?0.32:1, transition:'opacity 320ms'}}
               onMouseEnter={()=>!dim && setHover(id)} onMouseLeave={()=>setHover(null)}
               onClick={(e)=>{ e.stopPropagation(); if(!dim) go(id); }}>

              {/* footprint fill — always animated gradient, brightens on hover */}
              <polygon points={pts}
                fill={`url(#invGrad-${id})`}
                fillOpacity={ on ? 0.82 : 0.5 }
                stroke={ on ? '#ffd97a' : 'rgba(201,160,94,0.55)' }
                strokeWidth={ on ? 2.6*k : 1.2*k }
                strokeLinejoin="round"
                style={{
                  filter: on ? 'drop-shadow(0 0 16px var(--gold-glow))' : 'none',
                  transition:'fill-opacity 220ms, stroke 200ms, stroke-width 200ms',
                  opacity: appear,
                }}/>

              {/* tower lettered disc at centroid — appears on hover (always shows badge on hover) */}
              <g transform={`translate(${T.cx} ${T.cy}) scale(${k*dens})`}
                 style={{ opacity: on ? 1 : 0, transition:'opacity 220ms', pointerEvents:'none' }}>
                {on && <circle r="34" fill="none" stroke={col} strokeWidth="1.4" opacity="0.55"/>}
                <circle r="26"
                  fill="rgba(12,11,8,0.92)" stroke="#ffd97a" strokeWidth="2.4"
                  style={{ filter:'drop-shadow(0 4px 12px rgba(0,0,0,0.7))', animation: on?'invDiscIn 240ms cubic-bezier(0.22,1,0.36,1)':'none' }}/>
                <text x="0" y="9" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="28" fontWeight="600" fill="#fff8e0">{id}</text>
                {/* availability dot on the disc */}
                <circle cx="19" cy="-19" r="6" fill={col} stroke="#0c0b08" strokeWidth="2"/>
              </g>

              {/* always-on tiny availability anchor at centroid (so towers read even when not hovered) */}
              {!on && (
                <g transform={`translate(${T.cx} ${T.cy}) scale(${k*dens})`} style={{ opacity: appear*(dim?0.4:0.85), pointerEvents:'none' }}>
                  <circle r="13" fill="rgba(12,11,8,0.62)" stroke={col} strokeWidth="1.6"/>
                  <text x="0" y="5" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="15" fontWeight="600" fill="#ead7a8">{id}</text>
                </g>
              )}
            </g>
          );
        })}

        {/* ── TOWER-NAME POINTER LABELS — leader line from centroid → pill in open space ── */}
        {INV_ORDER.map(id => {
          const T = INV_TOWERS[id]; if(!T) return null;
          const tw = TOWERS.find(x=>x.id===id); const s = sums[id];
          const A = INV_LABEL_ANCHOR[id]; if(!A) return null;
          const [ax,ay] = A;
          const on = hover===id; const dim = dimmed(s);
          const col = tint(s);
          const k = 1/scale;
          return (
            <g key={`lbl-${id}`} style={{pointerEvents:'none', opacity: dim?0.3:1, transition:'opacity 320ms'}}>
              <line x1={T.cx} y1={T.cy} x2={ax} y2={ay}
                stroke={on?'#caa05e':'var(--gold)'} strokeWidth={(on?1.7:1)*k} opacity={on?0.95:0.62}/>
              <circle cx={T.cx} cy={T.cy} r={2.6*k} fill="var(--gold-deep)"/>
              <g transform={`translate(${ax} ${ay}) scale(${k*dens})`}>
                <rect x={-56} y={-16} width={112} height={32} rx={16}
                  fill="rgba(255,253,248,0.94)" stroke={on?'var(--gold-deep)':'var(--gold)'} strokeWidth={1.3}
                  style={{filter:'drop-shadow(0 4px 11px rgba(40,30,12,0.16))', transition:'stroke 200ms'}}/>
                <circle cx={-40} cy={0} r={5} fill={col} stroke="#fffdf8" strokeWidth={1.4}/>
                <text x={9} y={5} textAnchor="middle" fontFamily="Cinzel, serif"
                  fontSize={15} fontWeight={600} fill="var(--ink)" letterSpacing="0.02em">{tw ? tw.name : `Tower ${id}`}</text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* ── BACK ── */}
      <button onClick={()=>navigate('home')} aria-label="Back to home" style={invIconBtn}
        onMouseEnter={ev=>{ev.currentTarget.style.background='var(--gold)'; ev.currentTarget.style.color='#1a130a'; ev.currentTarget.style.borderColor='var(--gold)';}}
        onMouseLeave={ev=>{ev.currentTarget.style.background='rgba(255,253,248,0.78)'; ev.currentTarget.style.color='var(--ink)'; ev.currentTarget.style.borderColor='var(--line)';}}>
        <Icons.back width={26} height={26}/>
      </button>

      {/* ── MODULE HEADER ── */}
      <div style={{position:'absolute', top:50, left:132, zIndex:5, pointerEvents:'none', animation:'invHeadIn 600ms cubic-bezier(0.22,1,0.36,1) both'}}>
        <div className="mono" style={{fontSize:14*dens, letterSpacing:'0.36em', color:'var(--gold-deep)'}}>MODULE · 05 / INVENTORY</div>
        <div className="serif" style={{fontSize:66*dens, fontWeight:300, color:'var(--ink)', lineHeight:1.0, marginTop:10, letterSpacing:'-0.02em'}}>Select a tower to explore</div>
      </div>

      {/* ── UNIVERSE / VENUS LOCKUP (tap → home) ── */}
      <div role="button" tabIndex={0} aria-label="Go to home"
        onClick={()=>navigate('home')}
        onKeyDown={ev=>{ if(ev.key==='Enter'||ev.key===' '){ ev.preventDefault(); navigate('home'); } }}
        onMouseEnter={ev=>{ ev.currentTarget.style.opacity='0.6'; ev.currentTarget.style.transform='scale(1.03)'; }}
        onMouseLeave={ev=>{ ev.currentTarget.style.opacity='1'; ev.currentTarget.style.transform='scale(1)'; }}
        style={{position:'absolute', top:54, right:46, zIndex:5, display:'flex', alignItems:'center', gap:22, cursor:'pointer', transformOrigin:'right center', transition:'opacity 200ms ease, transform 200ms ease', animation:'invHeadIn 600ms cubic-bezier(0.22,1,0.36,1) both'}}>
        <UniverseMonogram size={68} progress={1} color="var(--gold-deep)"/>
        <div style={{display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end'}}>
          <UniverseWordmark size={26} color="var(--ink)" tight/>
          <VenusCredit size={13}/>
        </div>
      </div>

      {/* ── availability legend (Available · On hold · Sold) ── */}
      <div style={{position:'absolute', top:172, left:132, zIndex:5, display:'flex', alignItems:'center', gap:18, padding:'14px 24px', borderRadius:100, ...invGlass}}>
        {[['available',totals.available],['hold',totals.hold],['sold',totals.sold]].map(([k,n],i)=>(
          <React.Fragment key={k}>
            {i>0 && <span style={{width:1, height:20, background:'var(--line)'}}/>}
            <div style={{display:'flex', alignItems:'center', gap:9}}>
              <span style={{width:11*dens, height:11*dens, borderRadius:'50%', background:STATUS[k].dot, boxShadow:`0 0 8px ${STATUS[k].dot}66`}}/>
              <span className="mono" style={{fontSize:13.5*dens, letterSpacing:'0.08em', color:'var(--graphite)'}}>{STATUS[k].label} <span style={{color:'var(--slate)'}}>·</span> <strong style={{color:'var(--ink)', fontWeight:700}}>{n}</strong></span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* ── BOTTOM CARD (hovered tower) or HINT ── */}
      {hoveredTw ? (() => { const s = sums[hoveredTw.id];
        return (
          <div style={{position:'absolute', bottom:40, left:'50%', zIndex:6, display:'flex', alignItems:'center', gap:26, padding:'18px 30px', borderRadius:20, ...invGlass, color:'var(--ink)', animation:'invCardIn 240ms cubic-bezier(0.22,1,0.36,1) both'}}>
            <div style={{width:56, height:56, borderRadius:'50%', flexShrink:0, background:'linear-gradient(180deg, #d8b873, #c9a05e)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 20px rgba(176,138,63,0.35)'}}>
              <span className="serif" style={{fontSize:30, fontWeight:600, color:'#1a130a'}}>{hoveredTw.id}</span>
            </div>
            <div>
              <div className="mono" style={{fontSize:11, letterSpacing:'0.3em', color:'var(--gold-deep)'}}>{hoveredTw.cluster.toUpperCase()}</div>
              <div className="serif" style={{fontSize:32, fontWeight:400, lineHeight:1.05, color:'var(--ink)'}}>{hoveredTw.name}</div>
            </div>
            <div style={{width:1, alignSelf:'stretch', background:'var(--line)'}}/>
            <div className="mono" style={{fontSize:14, color:'var(--graphite)'}}>{hoveredTw.totalUnits} homes · {hoveredTw.type}</div>
            <div className="mono" style={{fontSize:14, color:STATUS.available.color}}>{s.available} of {s.total} available</div>
            <div className="mono" style={{display:'flex', alignItems:'center', gap:8, fontSize:12, letterSpacing:'0.18em', color:'#1a130a', padding:'13px 22px', borderRadius:100, background:'linear-gradient(180deg, #d8b873, #c9a05e)', fontWeight:800}}>
              EXPLORE <Icons.arrow width={16} height={16}/>
            </div>
          </div>
        );
      })() : (
        <div style={{position:'absolute', bottom:46, left:'50%', transform:'translateX(-50%)', zIndex:5, pointerEvents:'none', display:'flex', alignItems:'center', gap:18}}>
          <span style={{width:64, height:1, background:'linear-gradient(90deg, transparent, var(--gold))'}}/>
          <span className="mono" style={{fontSize:12.5, letterSpacing:'0.28em', color:'var(--gold-deep)'}}>TAP A TOWER TO EXPLORE ITS FLOORS &amp; HOMES</span>
          <span style={{width:64, height:1, background:'linear-gradient(90deg, var(--gold), transparent)'}}/>
        </div>
      )}
    </div>
  );
}

const invGlass = {
  background:'rgba(255,253,248,0.74)',
  border:'1px solid var(--line)',
  backdropFilter:'blur(18px) saturate(1.15)', WebkitBackdropFilter:'blur(18px) saturate(1.15)',
  boxShadow:'0 16px 44px rgba(40,30,12,0.10), inset 0 1px 0 rgba(255,255,255,0.75)',
};
const invIconBtn = {
  position:'absolute', top:48, left:46, zIndex:6, width:62, height:62, borderRadius:18,
  background:'rgba(255,253,248,0.78)', border:'1px solid var(--line)',
  backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)',
  display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
  color:'var(--ink)', transition:'all 220ms',
  boxShadow:'0 12px 30px rgba(40,30,12,0.10), inset 0 1px 0 rgba(255,255,255,0.7)',
};

window.Inventory = Inventory;
