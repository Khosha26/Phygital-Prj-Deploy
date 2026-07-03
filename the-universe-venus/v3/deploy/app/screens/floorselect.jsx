// Floor Selector — step 2 of the inventory drill-down.
// params: [towerId].  Back → inventory.
// STAGE: the selected tower's elevation study fills the canvas; a glass
// FLOOR PICKER floats centre-right beside it. The picker carries:
//   · header   — SELECT A FLOOR · {n} LEVELS · sort toggle
//   · featured — the Penthouse level as a gold hero card
//   · the list — every typical floor on a vertical elevator rail, each row a
//                card with its availability ratio + a live status pill
//   · legend   — Open · Hold · Sold
// Tap any floor → navigate('floor/<tower>/<f>').  Status palette = window.STATUS.

// Tower footprints on the top-down master plan (2560×1600) — mirrored from
// masterplan.jsx MP_TOWER_PT. Lets the locator "cut" always show the right
// tower, even when this screen is reached WITHOUT the master-plan handoff
// (e.g. Inventory → Tower → Floors), so the piece never goes missing.
// 2D site plan (clean light background, same footprint geometry as the 3D plan)
// reads better as a circular crop than the dark-surround 3D render.
const FS_MP_IMG = 'assets/masterplan/universe-mp-2d.jpg';
const FS_TOWER_PT = {
  E:{x:1305,y:278}, F:{x:1704,y:332}, D:{x:1204,y:560}, G:{x:1867,y:724},
  C:{x:1204,y:975}, H:{x:1866,y:1158}, B:{x:752,y:1158}, A:{x:902,y:1158},
  J:{x:1300,y:1245}, I:{x:1620,y:1245},
};

const FS_KEYS_ID = 'uni-floorselect-keys-v4';
function ensureFsKeys() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(FS_KEYS_ID)) return;
  const s = document.createElement('style');
  s.id = FS_KEYS_ID;
  s.textContent = `
    @keyframes fsRowIn   { from { opacity:0; transform: translateX(16px); } to { opacity:1; transform: translateX(0); } }
    @keyframes fsStageIn { from { opacity:0; transform: scale(1.04); }       to { opacity:1; transform: scale(1); } }
    @keyframes fsBldgFloat { 0%{ transform: translate(-50%,-50%); } 50%{ transform: translate(calc(-50% - 16px),-50%); } 100%{ transform: translate(-50%,-50%); } }
    @keyframes fsCardIn  { from { opacity:0; transform: translateY(14px); }  to { opacity:1; transform: translateY(0); } }
    @keyframes fsLocIn   { from { opacity:0; } to { opacity:1; } }
    @keyframes fsLocFloat{ 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
    @keyframes fsLocPulse{ 0%,100% { box-shadow: 0 0 0 0 rgba(201,160,94,0.5); } 70%,100% { box-shadow: 0 0 0 20px rgba(201,160,94,0); } }
    .fs-row   { transition: border-color 220ms ease, background 220ms ease, box-shadow 240ms ease, transform 160ms cubic-bezier(0.22,1,0.36,1); }
    .fs-row:active   { transform: scale(0.985); }
    .fs-hero  { transition: box-shadow 260ms ease, transform 160ms cubic-bezier(0.22,1,0.36,1); }
    .fs-hero:active  { transform: scale(0.99); }
    .fs-node  { transition: width 240ms cubic-bezier(0.22,1,0.36,1), height 240ms cubic-bezier(0.22,1,0.36,1), border-color 220ms ease, box-shadow 260ms ease; }
  `;
  document.head.appendChild(s);
}

function FloorSelect() {
  ensureFsKeys();
  const t = useLoop();
  const e = clamp(t/0.5);
  const [route] = useRoute();
  const [hoverFloor, setHoverFloor] = React.useState(null);
  const [asc, setAsc] = React.useState(false);   // sort direction (default: top floor first)

  const towerId = route.params && route.params[0];
  const tower = TOWERS.find(tw => tw.id === towerId);

  // NB: every hook must run before any early return — during the 220ms route
  // transition this screen briefly renders with the *live* (next) route, so
  // towerId can be absent; a hook after the early return would desync React.
  const floorData = React.useMemo(() => {
    if (!tower) return [];
    return buildFloors(towerId).map(fl => {
      const units = buildUnits(towerId, fl.floor);
      const avail = units.filter(u => u.status==='available').length;
      // "hold" here = reserved-but-not-sold = booked + blocked
      const hold  = units.filter(u => u.status==='booked' || u.status==='blocked').length;
      const total = units.length;
      return { ...fl, avail, hold, total, soldCount: total - avail - hold };
    });
  }, [towerId, tower]);

  if (!tower) {
    return (
      <div style={{position:'absolute', inset:0, background:'transparent', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <button onClick={()=>navigate('inventory')} className="mono" style={{padding:'18px 30px', borderRadius:105, border:'1px solid var(--gold-deep)', background:'var(--ivory-2)', fontSize:16, letterSpacing:'0.18em', cursor:'pointer'}}>← BACK TO INVENTORY</button>
      </div>
    );
  }

  const summary = towerSummary(towerId);
  // Float a locator medallion on the left = a "cut" of this tower's spot on the
  // master plan, so the floor choice always carries visual context. Prefer the
  // live hand-off from the master plan (exact view the user just saw); otherwise
  // derive the cut from the tower's known footprint so it appears on EVERY path.
  const mpFocus = (typeof window !== 'undefined' && window.UNI_MP_FOCUS && window.UNI_MP_FOCUS.towerId === towerId)
    ? window.UNI_MP_FOCUS
    : (FS_TOWER_PT[towerId]
        ? { towerId, img:FS_MP_IMG, xPct:(FS_TOWER_PT[towerId].x/2560)*100, yPct:(FS_TOWER_PT[towerId].y/1600)*100 }
        : null);
  const ph = floorData.find(f => f.kind === 'penthouse');
  const typical = floorData.filter(f => f.kind !== 'penthouse');
  const rows = asc ? [...typical].reverse() : typical;

  // Live canvas height (1600 on the 16:10 tablet, up to 1920 on iPad 4:3).
  // The building (top:0/bottom:0) and picker panel (top:206…bottom:90) already
  // stretch to fill it; `dens` gently enlarges row/card type so the taller
  // canvas reads dense and intentional (16:10 stays mathematically unchanged).
  const CH = (window.UNIVERSE_CANVAS && window.UNIVERSE_CANVAS.H) || 1600;
  const dens = CH > 1720 ? 1.1 : 1;

  return (
    <div style={{position:'absolute', inset:0, background:'#f6efe1', color:'var(--ink)', overflow:'hidden'}}>

      {/* ── TWIN-TOWER ELEVATION STUDY (sits centre-left, full height, no crop) ── */}
      <div style={{position:'absolute', left:-30, top:0, bottom:0, right:760, zIndex:0, overflow:'hidden',
        animation:'fsStageIn 1s cubic-bezier(0.22,1,0.36,1) both'}}>
        <div style={{position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)',
          height:'94%', width:'auto', minWidth:'100%',
          animation:'fsBldgFloat 30s ease-in-out 1s infinite'}}>
          <img src="assets/building-twin.jpg" alt={`${tower.name} — Venus Universe twin-tower elevation`}
            style={{display:'block', height:'100%', width:'auto', maxWidth:'none',
              mixBlendMode:'multiply',
              WebkitMaskImage:'radial-gradient(120% 110% at 48% 56%, #000 40%, rgba(0,0,0,0.5) 70%, transparent 88%), linear-gradient(180deg, transparent 0%, #000 12%, #000 86%, transparent 100%)',
              maskImage:'radial-gradient(120% 110% at 48% 56%, #000 40%, rgba(0,0,0,0.5) 70%, transparent 88%), linear-gradient(180deg, transparent 0%, #000 12%, #000 86%, transparent 100%)',
              WebkitMaskComposite:'source-in', maskComposite:'intersect'}}
            onError={(ev)=>{ ev.currentTarget.closest('div').style.opacity=0; }}/>
        </div>
      </div>
      {/* edge fade → blends the drawing into the matching cream letterbox (no top/bottom
          cut at any aspect) + a soft cream column behind the centre-right panel */}
      <div style={{position:'absolute', inset:0, zIndex:1, pointerEvents:'none',
        background:'linear-gradient(180deg, #fcf5eb 0%, rgba(252,245,235,0) 6%, rgba(252,245,235,0) 92%, #fcf5eb 100%), linear-gradient(90deg, rgba(252,245,235,0) 40%, rgba(252,245,235,0.22) 56%, rgba(251,244,232,0.50) 78%)'}}/>

      {/* ── HEADER (back → inventory) ──────────────────────────── */}
      <div style={{position:'absolute', top:54, left:72, right:72, display:'flex', justifyContent:'space-between', alignItems:'flex-end', opacity:e, transform:`translateY(${(1-e)*-12}px)`, zIndex:10}}>
        <div style={{display:'flex', alignItems:'flex-end', gap:34}}>
          <button onClick={()=>navigate('inventory')} style={backBtn}
            onMouseEnter={ev=>{ev.currentTarget.style.background='var(--gold)'; ev.currentTarget.style.color='#0a0807'; ev.currentTarget.style.borderColor='var(--gold)';}}
            onMouseLeave={ev=>{ev.currentTarget.style.background='transparent'; ev.currentTarget.style.color='var(--ink)'; ev.currentTarget.style.borderColor='var(--line)';}}>
            <Icons.back width={28} height={28}/>
          </button>
          <div>
            <Breadcrumb crumbs={[{label:'Inventory', go:()=>navigate('inventory')}, {label:tower.name}]}/>
            <div className="serif" style={{fontSize:96, fontWeight:300, letterSpacing:'-0.025em', lineHeight:1, marginTop:12}}>{tower.name}</div>
            <div style={{fontSize:23, color:'var(--slate)', marginTop:12, fontStyle:'italic'}}>{tower.cluster} · {tower.view}</div>
          </div>
        </div>
        <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:14}}>
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
          <AvailChip summary={summary}/>
        </div>
      </div>

      {/* ── editorial caption over the drawing (bottom-left) ── */}
      <div style={{position:'absolute', left:72, bottom:66, zIndex:6, display:'flex', alignItems:'center', gap:30}}>
        <div style={{display:'flex', alignItems:'center', gap:13}}>
          <span style={{width:30, height:1, background:'var(--gold-deep)'}}/>
          <span className="mono" style={{fontSize:17, letterSpacing:'0.32em', color:'var(--gold-deep)'}}>{tower.type.toUpperCase()}</span>
        </div>
        <span style={{width:1, height:46, background:'var(--line)'}}/>
        <CapStat n={tower.totalUnits} label="HOMES"/>
        <CapStat n={floorData.length} label="LEVELS"/>
      </div>

      {/* ── FLOATING MASTER-PLAN LOCATOR (left, the "cut" of the tower's spot) ── */}
      {mpFocus && (() => {
        const D = 304, ZW = 2000, ZH = ZW * 1600 / 2560;
        const bgX = D/2 - (mpFocus.xPct/100) * ZW;
        const bgY = D/2 - (mpFocus.yPct/100) * ZH;
        return (
          <div style={{position:'absolute', right:948, top:'50%', transform:'translateY(-50%)', zIndex:8,
            display:'flex', flexDirection:'column', alignItems:'center', gap:18, pointerEvents:'none',
            animation:'fsLocIn .9s ease-out both'}}>
            <div style={{display:'flex', alignItems:'center', gap:11}}>
              <span style={{width:26, height:1, background:'var(--gold-deep)'}}/>
              <span className="mono" style={{fontSize:17, letterSpacing:'0.26em', color:'var(--gold-deep)'}}>SELECTED ON MASTER PLAN</span>
            </div>
            <div style={{position:'relative', animation:'fsLocFloat 6.5s ease-in-out infinite'}}>
              <div style={{width:D, height:D, borderRadius:'50%', overflow:'hidden', position:'relative',
                backgroundColor:'#0c0a08',
                backgroundImage:`url(${mpFocus.img})`, backgroundRepeat:'no-repeat',
                backgroundSize:`${ZW}px ${ZH}px`, backgroundPosition:`${bgX}px ${bgY}px`,
                border:'3px solid rgba(252,247,235,0.92)',
                boxShadow:'0 38px 80px rgba(40,28,10,0.34), inset 0 2px 0 rgba(255,255,255,0.4), 0 0 0 1px rgba(201,160,94,0.55)'}}>
                {/* gradient vignette so the centre reads clean */}
                <div style={{position:'absolute', inset:0, borderRadius:'50%',
                  background:'radial-gradient(circle at 50% 46%, transparent 38%, rgba(8,6,4,0.42) 100%)'}}/>
                {/* centre marker on the tower */}
                <div style={{position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)',
                  width:46, height:46, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                  background:'radial-gradient(circle at 38% 30%, #fbeec4, var(--gold) 55%, var(--gold-deep))',
                  border:'2px solid #fff8e0', boxShadow:'0 8px 18px rgba(0,0,0,0.55)', animation:'fsLocPulse 2.4s ease-out infinite'}}>
                  <span className="serif" style={{fontSize:22, fontWeight:600, color:'#2a1d05', lineHeight:1}}>{towerId}</span>
                </div>
              </div>
            </div>
            <div style={{textAlign:'center'}}>
              <div className="serif" style={{fontSize:27, fontWeight:300, color:'var(--ink)', lineHeight:1}}>{tower.name}</div>
              <div className="mono" style={{fontSize:17, letterSpacing:'0.18em', color:'var(--slate)', marginTop:7}}>{tower.cluster.toUpperCase()}</div>
            </div>
          </div>
        );
      })()}

      {/* ── FLOATING FLOOR PICKER (centre-right, beside the tower) ── */}
      <div style={{position:'absolute', top:206, right:88, bottom:90, width:820, zIndex:7,
        borderRadius:30, overflow:'hidden',
        background:'rgba(255,253,249,0.74)', backdropFilter:'blur(26px) saturate(1.1)', WebkitBackdropFilter:'blur(26px) saturate(1.1)',
        border:'1px solid rgba(176,138,63,0.22)', boxShadow:'0 40px 90px rgba(40,28,10,0.20), inset 0 1px 0 rgba(255,255,255,0.9)',
        display:'flex', flexDirection:'column',
        animation:'fsStageIn .7s cubic-bezier(0.22,1,0.36,1) both'}}>

        {/* header */}
        <div style={{padding:'26px 30px 0'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <span className="mono" style={{fontSize:18*dens, letterSpacing:'0.28em', color:'var(--graphite)'}}>SELECT A FLOOR</span>
            <div style={{display:'flex', alignItems:'center', gap:18}}>
              <span className="mono" style={{fontSize:17*dens, letterSpacing:'0.18em', color:'var(--gold-deep)'}}>{floorData.length} LEVELS</span>
              <button onClick={()=>setAsc(a=>!a)} title={asc ? 'Showing lowest first' : 'Showing highest first'}
                style={{width:42, height:42, borderRadius:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                  border:'1px solid var(--line)', background:'rgba(255,255,255,0.6)', color:'var(--gold-deep)', transition:'all 200ms'}}
                onMouseEnter={ev=>{ev.currentTarget.style.background='var(--gold)'; ev.currentTarget.style.color='#1a130a'; ev.currentTarget.style.borderColor='var(--gold)';}}
                onMouseLeave={ev=>{ev.currentTarget.style.background='rgba(255,255,255,0.6)'; ev.currentTarget.style.color='var(--gold-deep)'; ev.currentTarget.style.borderColor='var(--line)';}}>
                <Icons.filter width={20} height={20} style={{transform: asc ? 'scaleY(-1)' : 'none', transition:'transform 260ms cubic-bezier(0.22,1,0.36,1)'}}/>
              </button>
            </div>
          </div>
          <div style={{height:1, background:'linear-gradient(90deg, var(--line), rgba(176,138,63,0.06))', marginTop:16}}/>
        </div>

        {/* featured penthouse */}
        {ph && (
          <div style={{padding:'18px 24px 6px'}}>
            <button className="fs-hero" onClick={()=>navigate(`floor/${towerId}/${ph.floor}`)}
              style={{position:'relative', width:'100%', textAlign:'left', cursor:'pointer', overflow:'hidden',
                display:'grid', gridTemplateColumns:'auto 1px 1fr auto', alignItems:'center', gap:24,
                padding:'22px 26px', borderRadius:20,
                border:'1px solid rgba(176,138,63,0.42)',
                background:'linear-gradient(108deg, rgba(201,160,94,0.22) 0%, rgba(234,215,168,0.10) 46%, rgba(252,247,235,0.30) 100%)',
                boxShadow:'inset 0 1px 0 rgba(255,255,255,0.7), 0 14px 34px rgba(120,86,28,0.10)',
                animation:'fsCardIn .55s cubic-bezier(0.22,1,0.36,1) .1s both'}}
              onMouseEnter={ev=>{ev.currentTarget.style.boxShadow='inset 0 1px 0 rgba(255,255,255,0.8), 0 22px 48px rgba(120,86,28,0.20)';}}
              onMouseLeave={ev=>{ev.currentTarget.style.boxShadow='inset 0 1px 0 rgba(255,255,255,0.7), 0 14px 34px rgba(120,86,28,0.10)';}}>
              {/* sparkle */}
              <svg width="22" height="22" viewBox="0 0 24 24" style={{position:'absolute', top:16, right:18, opacity:0.9}}>
                <path d="M12 2 L13.4 9 L20 12 L13.4 15 L12 22 L10.6 15 L4 12 L10.6 9 Z" fill="var(--gold-deep)"/>
              </svg>
              <span className="serif" style={{fontSize:58*dens, fontWeight:300, color:'var(--gold-deep)', letterSpacing:'0.01em', lineHeight:0.9}}>PH</span>
              <span style={{width:1, height:52*dens, background:'rgba(176,138,63,0.35)'}}/>
              <div>
                <div className="serif" style={{fontSize:34*dens, fontWeight:300, color:'var(--ink)', letterSpacing:'-0.01em', lineHeight:1}}>Penthouse</div>
                <div className="mono" style={{fontSize:17*dens, letterSpacing:'0.20em', color:'var(--slate)', marginTop:8}}>{ph.total} {ph.total===1?'HOME':'HOMES'} · DUPLEX</div>
              </div>
              <span style={{width:56, height:56, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                border:'1.4px solid var(--gold-deep)', background:'rgba(255,255,255,0.45)', color:'var(--gold-deep)'}}>
                <Icons.arrow width={24} height={24}/>
              </span>
            </button>
          </div>
        )}

        {/* the elevator-rail list */}
        <div className="scroll" style={{flex:1, overflow:'auto', position:'relative', padding:'12px 24px 16px'}}>
          {/* the rail */}
          <div style={{position:'absolute', left:46, top:22, bottom:18, width:1.5,
            background:'linear-gradient(180deg, transparent 0%, var(--line) 7%, var(--line) 93%, transparent 100%)'}}/>
          <div style={{display:'flex', flexDirection:'column', gap:11*dens}}>
            {rows.map((fl, i) => {
              const on = hoverFloor === fl.floor;
              // live status: hold > sold > all-open
              let st, txt;
              if (fl.avail === 0)        { st = STATUS.sold;      txt = 'Sold out'; }
              else if (fl.hold > 0)      { st = STATUS.hold;      txt = `${fl.hold} hold`; }
              else if (fl.soldCount > 0) { st = STATUS.sold;      txt = `${fl.soldCount} sold`; }
              else                       { st = STATUS.available; txt = 'All open'; }
              return (
                <button key={fl.floor} className="fs-row"
                  onClick={()=>navigate(`floor/${towerId}/${fl.floor}`)}
                  onMouseEnter={()=>setHoverFloor(fl.floor)}
                  onMouseLeave={()=>setHoverFloor(null)}
                  style={{
                    position:'relative', textAlign:'left', cursor:'pointer', width:'100%',
                    display:'grid', gridTemplateColumns:'56px 1fr auto 22px', alignItems:'center', gap:18,
                    padding:`${16*dens}px 20px ${16*dens}px 56px`, borderRadius:16,
                    border:`1px solid ${on ? 'rgba(176,138,63,0.42)' : 'var(--line-soft, rgba(20,16,11,0.06))'}`,
                    background: on ? 'rgba(255,255,255,0.86)' : 'rgba(255,255,255,0.40)',
                    boxShadow: on ? '0 14px 30px rgba(50,32,12,0.10)' : 'none',
                    opacity:0, animation:`fsRowIn .5s cubic-bezier(0.22,1,0.36,1) ${0.16+i*0.024}s forwards`,
                  }}>
                  {/* elevator node on the rail */}
                  <span className="fs-node" style={{position:'absolute', left:22, top:'50%', transform:'translate(-50%,-50%)',
                    width: on ? 16 : 9, height: on ? 16 : 9, borderRadius:'50%', boxSizing:'border-box',
                    border:`2px solid ${on ? 'var(--gold-deep)' : 'var(--line)'}`,
                    background: on ? 'radial-gradient(circle, var(--gold-deep) 0 32%, rgba(201,160,94,0.18) 36%)' : '#fffdf9',
                    boxShadow: on ? '0 0 0 5px rgba(201,160,94,0.12)' : 'none'}}/>
                  {/* floor number */}
                  <span className="serif" style={{fontSize:42*dens, fontWeight:300, color:'var(--ink)', lineHeight:1, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.01em'}}>{fl.floor}</span>
                  {/* availability ratio + homes */}
                  <div style={{minWidth:0}}>
                    <div style={{display:'flex', alignItems:'baseline', gap:4}}>
                      <span className="serif" style={{fontSize:25*dens, fontWeight:400, color: fl.avail===0 ? STATUS.sold.color : 'var(--gold-deep)', fontVariantNumeric:'tabular-nums', lineHeight:1}}>{fl.avail}/{fl.total}</span>
                    </div>
                    <div className="mono" style={{fontSize:17*dens, letterSpacing:'0.14em', color:'var(--slate)', marginTop:5, whiteSpace:'nowrap'}}>{fl.total} {fl.total===1?'HOME':'HOMES'}</div>
                  </div>
                  {/* status pill */}
                  <span style={{display:'inline-flex', alignItems:'center', gap:9, padding:`${8*dens}px ${15*dens}px`, borderRadius:105,
                    background: st.soft || 'rgba(255,255,255,0.6)', border:`1px solid ${st.line || 'var(--line)'}`, whiteSpace:'nowrap'}}>
                    <span style={{width:9, height:9, borderRadius:'50%', background:st.dot}}/>
                    <span className="mono" style={{fontSize:17*dens, letterSpacing:'0.08em', color: st.color, fontVariantNumeric:'tabular-nums'}}>{txt}</span>
                  </span>
                  {/* chevron */}
                  <span style={{color: on ? 'var(--gold-deep)' : 'var(--muted)', transition:'color 200ms, transform 200ms', display:'flex', transform: on ? 'translateX(2px)' : 'none'}}>
                    <Icons.arrow width={20} height={20}/>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* legend footer */}
        <div style={{padding:'14px 30px 20px', borderTop:'1px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'center', gap:30}}>
          {[STATUS.available, STATUS.booked, STATUS.blocked, STATUS.sold].map(s => (
            <div key={s.key} style={{display:'flex', alignItems:'center', gap:9}}>
              <span style={{width:12, height:12, borderRadius:'50%', background:s.dot, boxShadow:`0 0 8px ${s.dot}88`}}/>
              <span className="mono" style={{fontSize:17*dens, letterSpacing:'0.12em', color:'var(--graphite)'}}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CapStat({ n, label }) {
  return (
    <div style={{textAlign:'left'}}>
      <div className="serif" style={{fontSize:46, fontWeight:300, color:'var(--ink)', lineHeight:1, fontVariantNumeric:'tabular-nums'}}>{n}</div>
      <div className="mono" style={{fontSize:17, letterSpacing:'0.20em', color:'var(--slate)', marginTop:5}}>{label}</div>
    </div>
  );
}

// Small reusable breadcrumb used across drill-down screens.
function Breadcrumb({ crumbs }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:11, flexWrap:'wrap'}}>
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          {i>0 && <span className="mono" style={{fontSize:16, color:'var(--muted)'}}>›</span>}
          {c.go && i < crumbs.length-1 ? (
            <button onClick={c.go} className="mono" style={{background:'none', border:'none', padding:0, cursor:'pointer', fontSize:15, letterSpacing:'0.22em', color:'var(--gold-deep)', textTransform:'uppercase'}}>{c.label}</button>
          ) : (
            <span className="mono" style={{fontSize:15, letterSpacing:'0.22em', color: i===crumbs.length-1 ? 'var(--slate)' : 'var(--gold-deep)', textTransform:'uppercase'}}>{c.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Compact tower-level availability chip (available / hold / sold).
function AvailChip({ summary }) {
  const items = [
    { ...STATUS.available, n: summary.available },
    { ...STATUS.booked,    n: summary.booked },
    { ...STATUS.blocked,   n: summary.blocked },
    { ...STATUS.sold,      n: summary.sold },
  ];
  return (
    <div style={{display:'flex', alignItems:'center', gap:14, padding:'10px 18px', borderRadius:105, background:'rgba(255,255,255,0.7)', backdropFilter:'blur(6px)', border:'1px solid var(--line)'}}>
      {items.map(it => (
        <div key={it.key} style={{display:'flex', alignItems:'center', gap:8}}>
          <span style={{width:10, height:10, borderRadius:'50%', background:it.dot}}/>
          <span className="mono" style={{fontSize:14, color:'var(--graphite)', fontVariantNumeric:'tabular-nums'}}>{it.n}</span>
        </div>
      ))}
    </div>
  );
}

const backBtn = {
  width:78, height:78, borderRadius:'50%',
  border:'1.4px solid var(--line)', background:'transparent',
  display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--ink)',
  transition:'all 240ms',
};

window.FloorSelect = FloorSelect;
window.Breadcrumb = Breadcrumb;
window.AvailChip = AvailChip;
window.fsBackBtn = backBtn;
