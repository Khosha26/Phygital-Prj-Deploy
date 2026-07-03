// Floor Plate — step 3 of the inventory drill-down.  "Typical Floor Plan".
// params: [towerId, floor].  Back → floors/<towerId>.
//
// Header, back button and title are matched to the other inside screens
// (FloorSelect / Inventory): a circular back button + breadcrumb + a light
// serif title + top-right monogram / wordmark / availability chip. No baked
// image-text — every label is real HTML.
//
// The selected floor's PAIR shows as two cut-out block plates (true-alpha PNGs).
// Two-state interaction:
//   STATE 1 (blocks)  — both plates visible; tap a block to choose it.
//   STATE 2 (units)   — a floating unit-selector panel rises ON TOP of the
//                       chosen block (the other dims). Tap a unit → its plan.
// The right rail is a full-height "plate dossier": key plan + RERA carpet-area
// table + typology legend (or a configuration card when a pair has no table),
// sized to fill the column so the screen never reads half-empty.
// Data: window.PLATE_DATA.

const FP_KEYS_ID = 'uni-floorplate-keys-v10';
function ensureFpKeys() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(FP_KEYS_ID)) return;
  const s = document.createElement('style');
  s.id = FP_KEYS_ID;
  s.textContent = `
    @keyframes fpFadeUp   { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
    @keyframes fpPanelIn  { from { opacity:0; transform: translate(-50%,-50%) scale(0.92); } to { opacity:1; transform: translate(-50%,-50%) scale(1); } }
    @keyframes fpCardIn   { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }
    /* idle "tap me" breathing glow on the block hot-zone */
    @keyframes fpTapPulse {
      0%,100% { box-shadow: 0 0 0 1.5px rgba(201,160,94,0.45), 0 18px 40px rgba(120,86,28,0.14), 0 0 34px rgba(201,160,94,0.24); border-color: rgba(201,160,94,0.58); }
      50%     { box-shadow: 0 0 0 2.5px rgba(201,160,94,0.72), 0 22px 52px rgba(120,86,28,0.20), 0 0 64px rgba(201,160,94,0.46); border-color: rgba(201,160,94,0.85); }
    }
    @keyframes fpHintBob { 0%,100% { transform: translate(-50%,0); } 50% { transform: translate(-50%,-4px); } }
    @keyframes fpZoneIn  { from { opacity:0; transform: scale(0.93); } to { opacity:1; transform: scale(1); } }
    @keyframes fpPipPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(201,160,94,0.42); } 50% { box-shadow: 0 0 0 7px rgba(201,160,94,0); } }
    @keyframes fpHlPulse { 0%,100% { box-shadow: 0 0 0 1px rgba(255,255,255,0.55), 0 0 14px rgba(201,160,94,0.45); } 50% { box-shadow: 0 0 0 1px rgba(255,255,255,0.7), 0 0 28px rgba(201,160,94,0.80); } }
    .fp-block  { transition: transform 340ms cubic-bezier(0.22,1,0.36,1), filter 340ms ease, opacity 340ms ease; }
    .fp-hotzone { animation: fpTapPulse 2.6s ease-in-out infinite; transition: box-shadow 300ms ease, border-color 300ms ease, background 300ms ease, transform 280ms cubic-bezier(0.22,1,0.36,1); }
    .fp-hotzone.is-hot { animation: none; box-shadow: 0 0 0 2px rgba(201,160,94,0.85), 0 26px 60px rgba(120,86,28,0.24), 0 0 70px rgba(201,160,94,0.50) !important; border-color: rgba(201,160,94,0.92) !important; background: rgba(201,160,94,0.20) !important; }
    .fp-hotzone.is-active { animation: none; box-shadow: 0 0 0 2.5px var(--gold-deep), 0 30px 66px rgba(120,86,28,0.28) !important; border-color: var(--gold-deep) !important; background: rgba(201,160,94,0.14) !important; }
    .fp-plate-btn { transition: transform 220ms cubic-bezier(0.22,1,0.36,1); }
    .fp-plate-btn:active { transform: scale(0.985); }
    .fp-uc     { transition: transform 180ms cubic-bezier(0.22,1,0.36,1), box-shadow 220ms ease, border-color 220ms ease, background 220ms ease; }
    .fp-uc:active { transform: scale(0.975); }
    .fp-zone   { transition: background 220ms ease, border-color 220ms ease, box-shadow 220ms ease; }
    .fp-zone:not(:disabled):active { transform: scale(0.99); }
    .fp-zone-pill { transition: border-color 200ms ease, box-shadow 200ms ease, background 200ms ease; }
    .fp-reset  { transition: background 200ms ease, color 200ms ease, border-color 200ms ease; }
    .kp-zoom-btn { transition: background 180ms ease, color 180ms ease, border-color 180ms ease, transform 140ms ease; }
    .kp-zoom-btn:hover { background: var(--gold) !important; color:#1a130a !important; border-color: var(--gold) !important; }
    .kp-zoom-btn:active { transform: scale(0.92); }
    .kp-zoom-btn:disabled { opacity:0.4; cursor:not-allowed; }
  `;
  document.head.appendChild(s);
}

// "You are here" highlight box per pair, as % of the shared keyplan-site base
// (cropped masterplan-06 typical-floor, 1760×1800). Tuned to the labelled towers.
const KEYPLAN_HL = {
  AB: { left:22, top:61, width:30, height:34 },
  CD: { left:45, top:33, width:13, height:27 },
  EF: { left:49, top:12, width:37, height:18 },
  GH: { left:83, top:33, width:14, height:40 },
  IJ: { left:52, top:63, width:29, height:12 },
};

// native plate aspect (w/h) per block — drives the on-screen frame.
const PLATE_ASPECT = { A:1.5, B:1.49, C:1.811, D:1.804, E:1.14, F:1.14, G:1.593, H:1.568, I:1.508, J:1.707 };

// Unit "shape" zones laid directly over the plate (positions are spatial corners
// in PLATE_DATA, so each unit's button sits on its real quadrant of the plan).
// rect = % of the plate frame; ax/ay = which corner the selector pill anchors to.
const UNIT_ZONE = {
  topLeft:     { left:1.5,  top:2,    w:47, h:46.5, ax:'left',  ay:'top'    },
  topRight:    { left:51.5, top:2,    w:47, h:46.5, ax:'right', ay:'top'    },
  bottomLeft:  { left:1.5,  top:51.5, w:47, h:46.5, ax:'left',  ay:'bottom' },
  bottomRight: { left:51.5, top:51.5, w:47, h:46.5, ax:'right', ay:'bottom' },
  left:        { left:1.5,  top:7,    w:47, h:86,   ax:'left',  ay:'mid'    },
  right:       { left:51.5, top:7,    w:47, h:86,   ax:'right', ay:'mid'    },
};

function FloorPlate() {
  ensureFpKeys();
  const t = useLoop();
  const e = clamp(t/0.5);
  const [route] = useRoute();
  const [sel, setSel] = React.useState(null);      // selected block id
  const [hoverB, setHoverB] = React.useState(null); // hovered block id

  const towerId = route.params && route.params[0];
  const floor = route.params && parseInt(route.params[1], 10);
  const tower = TOWERS.find(tw => tw.id === towerId);

  React.useEffect(()=>{ setSel(null); }, [towerId, floor]);

  // Derive plate data defensively BEFORE any conditional return so every hook
  // below runs on every render (route can momentarily resolve to no tower during
  // a transition — a hook after an early return would change the hook count and
  // throw "Rendered fewer hooks than expected").
  const pairCode = tower ? tower.pair.replace(/&/g,'') : '';      // 'A&B' → 'AB'
  const pdata = (pairCode && window.PLATE_DATA && window.PLATE_DATA[pairCode]) || null;
  const layouts = pdata ? pdata.layouts : [];                    // [{block, positions}] left→right
  const blockIds = layouts.map(l => l.block).slice().sort();

  // KEY PLAN focus — the screen zooms into THIS pair's marking so it's the hero.
  const kpHl   = KEYPLAN_HL[pairCode] || null;
  const kpCx   = kpHl ? kpHl.left + kpHl.width/2 : 50;           // marking centre (% of base)
  const kpCy   = kpHl ? kpHl.top  + kpHl.height/2 : 50;
  const kpBase = kpHl ? Math.max(1.5, Math.min(2.8, 0.62 * Math.min(100/kpHl.width, 100/kpHl.height))) : 1;
  const [kpZoom, setKpZoom] = React.useState(kpBase);
  React.useEffect(() => { setKpZoom(kpBase); }, [pairCode]); // re-frame when the block pair changes

  // floor-level availability across both blocks → the header chip.
  const summary = React.useMemo(() => {
    const s = { available:0, hold:0, sold:0 };
    if (!Number.isFinite(floor)) return s;
    blockIds.forEach(b => buildUnits(b, floor).forEach(u => { s[u.status] = (s[u.status]||0) + 1; }));
    return s;
  }, [blockIds.join(''), floor]);

  if (!tower || !Number.isFinite(floor)) {
    return (
      <div style={{position:'absolute', inset:0, background:'transparent', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <button onClick={()=>navigate('inventory')} className="mono" style={{padding:'18px 30px', borderRadius:105, border:'1px solid var(--gold-deep)', background:'var(--ivory-2)', fontSize:16, letterSpacing:'0.18em', cursor:'pointer'}}>← BACK TO INVENTORY</button>
      </div>
    );
  }

  const flLabel = floorLabel(tower, floor);
  const hl = KEYPLAN_HL[pairCode] || null;     // every pair now resolves to the shared site key plan
  const hasTable = !!(pdata && pdata.table && pdata.table.length > 0);
  const hasLegend = !!(pdata && pdata.typeLegend && pdata.typeLegend.length > 0);

  // geometry — the rail is ALWAYS present (filled with a config card when a pair
  // has no table) so the plates sit in a consistent left field, never adrift in
  // a half-empty canvas.
  const RAIL_W = 680;
  const bandRight = RAIL_W + 72 + 56;   // rail width + right inset + gutter

  return (
    <div style={{position:'absolute', inset:0, background:'transparent', color:'var(--ink)', overflow:'hidden'}}>

      {/* ── HEADER (matches FloorSelect / Inventory) ───────────────── */}
      <div style={{position:'absolute', top:54, left:72, right:72, display:'flex', justifyContent:'space-between', alignItems:'flex-end', opacity:e, transform:`translateY(${(1-e)*-12}px)`, zIndex:14}}>
        <div style={{display:'flex', alignItems:'flex-end', gap:34}}>
          <button onClick={()=>navigate(`floors/${towerId}`)} style={fsBackBtn}
            onMouseEnter={ev=>{ev.currentTarget.style.background='var(--gold)'; ev.currentTarget.style.color='#0a0807'; ev.currentTarget.style.borderColor='var(--gold)';}}
            onMouseLeave={ev=>{ev.currentTarget.style.background='transparent'; ev.currentTarget.style.color='var(--ink)'; ev.currentTarget.style.borderColor='var(--line)';}}>
            <Icons.back width={28} height={28}/>
          </button>
          <div>
            <Breadcrumb crumbs={[
              {label:'Inventory', go:()=>navigate('inventory')},
              {label:`Tower ${towerId}`, go:()=>navigate(`floors/${towerId}`)},
              {label:flLabel},
            ]}/>
            <div className="serif" style={{fontSize:84, fontWeight:300, letterSpacing:'-0.022em', lineHeight:1, marginTop:12}}>Typical Floor Plan</div>
            <div style={{fontSize:23, color:'var(--slate)', marginTop:12, fontStyle:'italic'}}>
              Block {blockIds.join(' & ')} · {flLabel}{pdata && pdata.subtitle ? ` · ${pdata.subtitle}` : ''}
            </div>
          </div>
        </div>
        <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:14}}>
          <div style={{display:'flex', alignItems:'center', gap:18}}>
            <UniverseMonogram size={64} progress={1} color="var(--gold-deep)"/>
            <UniverseWordmark size={25} color="var(--ink)" tight/>
          </div>
          <AvailChip summary={summary}/>
        </div>
      </div>

      {/* ── THE TWO BLOCK PLATES (glowing buttons) ─────────────── */}
      <div style={{position:'absolute', top:262, left:88, right:bandRight, bottom:78, display:'flex', alignItems:'center', justifyContent:'center', gap:72, zIndex:5}}>
        {layouts.map((lay, li) => {
          const id = lay.block;
          const positions = lay.positions;
          const four = !('left' in positions);
          const aspect = PLATE_ASPECT[id] || 1.5;
          const dimmed = sel && sel !== id;
          const active = sel === id;
          const hot = hoverB === id || active;
          const plateW = four ? 740 : 770;
          const plateH = Math.round(plateW / aspect);

          const units = Object.entries(positions)
            .map(([corner, num]) => ({ corner, num }))
            .sort((a,b)=>a.num-b.num);

          return (
            <div key={id} className="fp-block" style={{
                position:'relative', display:'flex', flexDirection:'column', alignItems:'center', gap:26,
                opacity: dimmed ? 0.4 : 1,
                filter: dimmed ? 'saturate(0.82)' : 'none',
                transform: active ? 'scale(1.02)' : 'scale(1)',
                zIndex: active ? 7 : 5,
                animation:`fpFadeUp .7s cubic-bezier(0.22,1,0.36,1) ${0.12+li*0.1}s both`}}>

              {/* clean block label (replaces the ornate cartouche) */}
              <div style={{textAlign:'center'}}>
                <div className="serif" style={{fontSize:38, fontWeight:300, letterSpacing:'0.01em', color: active ? 'var(--gold-deep)' : 'var(--ink)', lineHeight:1, transition:'color 240ms ease'}}>Block {id}</div>
                <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginTop:12}}>
                  <span style={{width:34, height:1, background:'var(--gold-deep)', opacity:0.55}}/>
                  <span className="mono" style={{fontSize:12.5, letterSpacing:'0.24em', color:'var(--slate)'}}>{units.length} {units.length===1?'RESIDENCE':'RESIDENCES'}</span>
                  <span style={{width:34, height:1, background:'var(--gold-deep)', opacity:0.55}}/>
                </div>
              </div>

              <div style={{position:'relative', width:plateW, height:plateH}}>
                {/* tappable HOT-ZONE — a solid gold-glow card sized to the plate.
                    Translucent gold fill (plan stays readable on top), a clear
                    ring border and an idle breathing pulse so it reads as a button. */}
                <div className={`fp-hotzone${active ? ' is-active' : (hot ? ' is-hot' : '')}`}
                  style={{position:'absolute', left:'-5%', top:'-6%', width:'110%', height:'112%', zIndex:0,
                    borderRadius:28, pointerEvents:'none',
                    border:'1.5px solid rgba(201,160,94,0.58)',
                    background:'rgba(201,160,94,0.15)',
                    transform: hot ? 'scale(1.012)' : 'scale(1)'}}/>

                <div className="fp-plate-btn" role="button" tabIndex={0} aria-label={`Select Block ${id}`}
                  onClick={()=>setSel(id)}
                  onMouseEnter={()=>setHoverB(id)} onMouseLeave={()=>setHoverB(null)}
                  style={{position:'relative', width:'100%', height:'100%', zIndex:1, cursor:'pointer',
                    filter: hot ? 'drop-shadow(0 26px 42px rgba(120,86,28,0.26))' : 'drop-shadow(0 16px 28px rgba(120,86,28,0.14))',
                    transition:'filter 340ms ease'}}>
                  <img src={`assets/plans/plate-${id}.png`} alt={`Block ${id} typical floor plate`}
                    style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain'}}
                    onError={(ev)=>{ ev.currentTarget.style.opacity=0.15; }}/>
                </div>

                {/* TAP affordance chip — only while this block is idle/unselected */}
                {!active && (
                  <div style={{position:'absolute', left:'50%', bottom:'-22px', zIndex:2, pointerEvents:'none',
                    display:'inline-flex', alignItems:'center', gap:9, padding:'8px 16px', borderRadius:105,
                    background: hot ? 'var(--gold-deep)' : 'rgba(255,251,243,0.92)',
                    border:`1px solid ${hot ? 'var(--gold-deep)' : 'rgba(201,160,94,0.55)'}`,
                    boxShadow:'0 8px 22px rgba(120,86,28,0.18)',
                    animation:'fpHintBob 2.6s ease-in-out infinite', transition:'background 240ms ease, border-color 240ms ease'}}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={hot ? '#fff8ec' : 'var(--gold-deep)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11"/><path d="M12 11V8.5a1.5 1.5 0 0 1 3 0V11"/><path d="M15 11v-1a1.5 1.5 0 0 1 3 0v5a6 6 0 0 1-6 6h-1.6a6 6 0 0 1-4.6-2.2L4 19c-.8-1-.6-2 .4-2.6.9-.5 2-.3 2.6.6V8a1.5 1.5 0 0 1 3 0v3"/>
                    </svg>
                    <span className="mono" style={{fontSize:11.5, letterSpacing:'0.2em', color: hot ? '#fff8ec' : 'var(--gold-deep)'}}>TAP</span>
                  </div>
                )}

                {/* ── ON-PLATE UNIT ZONES — each unit shaped out on its real
                       quadrant of the plan, with a corner selector pill. No
                       popup: the buttons live on the map itself. ── */}
                {active && units.map((it, ci) => {
                  const z = UNIT_ZONE[it.corner] || UNIT_ZONE.topLeft;
                  const u = buildUnits(id, floor).find(x => x.pos === it.num);
                  const st = u ? (STATUS[u.status] || STATUS.sold) : STATUS.available;
                  const sold = u && u.status === 'sold';
                  const rera = (pdata && pdata.perPosition && pdata.perPosition[it.num] && pdata.perPosition[it.num].rera) || (u && u.sqft) || null;
                  // anchor the pill to this zone's outer corner so it never covers the plan centre
                  const pillPos = { position:'absolute' };
                  if (z.ax === 'left') pillPos.left = 16; else pillPos.right = 16;
                  if (z.ay === 'top') pillPos.top = 16;
                  else if (z.ay === 'bottom') pillPos.bottom = 16;
                  else { pillPos.top = '50%'; pillPos.transform = 'translateY(-50%)'; }
                  return (
                    <button key={it.num} className="fp-zone" disabled={sold}
                      onClick={(ev)=>{ ev.stopPropagation(); if (u && !sold) navigate(`unit/${id}/${floor}/${u.no}`); }}
                      aria-label={sold ? `Unit ${it.num} sold` : `Select unit ${it.num}`}
                      style={{position:'absolute', left:`${z.left}%`, top:`${z.top}%`, width:`${z.w}%`, height:`${z.h}%`,
                        zIndex:8, padding:0, cursor: sold ? 'not-allowed' : 'pointer',
                        borderRadius:18,
                        border:`1.5px ${sold ? 'dashed' : 'solid'} ${sold ? 'rgba(150,138,118,0.55)' : 'rgba(201,160,94,0.62)'}`,
                        background: sold ? 'rgba(120,108,90,0.07)' : 'rgba(201,160,94,0.11)',
                        boxShadow: sold ? 'none' : 'inset 0 0 0 1px rgba(255,255,255,0.42), inset 0 0 38px rgba(201,160,94,0.10)',
                        animation:`fpZoneIn .46s cubic-bezier(0.22,1,0.36,1) ${0.06+ci*0.07}s both`}}
                      onMouseEnter={ev=>{ if(sold) return; ev.currentTarget.style.background='rgba(201,160,94,0.2)'; ev.currentTarget.style.borderColor='var(--gold-deep)'; ev.currentTarget.style.boxShadow='inset 0 0 0 1.5px rgba(255,255,255,0.55), inset 0 0 56px rgba(201,160,94,0.18)'; }}
                      onMouseLeave={ev=>{ if(sold) return; ev.currentTarget.style.background='rgba(201,160,94,0.11)'; ev.currentTarget.style.borderColor='rgba(201,160,94,0.62)'; ev.currentTarget.style.boxShadow='inset 0 0 0 1px rgba(255,255,255,0.42), inset 0 0 38px rgba(201,160,94,0.10)'; }}>

                      {/* corner selector pill */}
                      <div className="fp-zone-pill" style={{...pillPos, textAlign:'left',
                        display:'grid', gridTemplateColumns:'auto 1fr', alignItems:'center', gap:13,
                        padding:'11px 15px', borderRadius:15, maxWidth:'82%',
                        background: sold ? 'rgba(244,240,232,0.94)' : 'rgba(253,249,242,0.96)',
                        border:`1px solid ${sold ? 'var(--muted)' : 'rgba(176,138,63,0.5)'}`,
                        boxShadow: sold ? '0 8px 18px rgba(60,42,14,0.12)' : '0 12px 28px rgba(60,42,14,0.2)'}}>
                        <span style={{width:48, height:48, borderRadius:13, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', position:'relative',
                          background: sold ? 'rgba(230,224,214,0.95)' : 'radial-gradient(circle at 50% 36%, #fffdf8, #efe0c2)',
                          border:`1.5px solid ${sold ? 'var(--muted)' : 'var(--gold-deep)'}`,
                          animation: sold ? 'none' : 'fpPipPulse 2.4s ease-in-out infinite'}}>
                          <span className="serif" style={{fontSize:26, fontWeight:600, color: sold ? 'var(--muted)' : 'var(--gold-deep)', lineHeight:1}}>{it.num}</span>
                        </span>
                        <div style={{minWidth:0}}>
                          <div style={{display:'flex', alignItems:'center', gap:9}}>
                            <span className="serif" style={{fontSize:19, fontWeight:400, color:'var(--ink)', whiteSpace:'nowrap'}}>{u ? u.type : `Unit ${it.num}`}</span>
                            <span style={{display:'inline-flex', alignItems:'center', gap:5, flexShrink:0}}>
                              <span style={{width:8, height:8, borderRadius:'50%', background:st.dot}}/>
                              <span className="mono" style={{fontSize:10, letterSpacing:'0.08em', color:st.color}}>{st.label.toUpperCase()}</span>
                            </span>
                          </div>
                          <div className="mono" style={{fontSize:12, letterSpacing:'0.06em', color:'var(--slate)', marginTop:5, fontVariantNumeric:'tabular-nums'}}>
                            {rera ? `${Math.round(rera).toLocaleString('en-IN')} sq.ft carpet` : 'Area on request'}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── RIGHT RAIL: full-height plate dossier ──────────────────── */}
      <div style={{position:'absolute', top:262, right:72, width:RAIL_W, bottom:78, zIndex:6,
        opacity:e, transform:`translateY(${(1-e)*14}px)`,
        display:'flex', flexDirection:'column'}}>
        <div style={{flex:1, display:'flex', flexDirection:'column', borderRadius:18, overflow:'hidden',
          border:'1px solid rgba(176,138,63,0.40)',
          background:'rgba(255,252,246,0.62)', backdropFilter:'blur(3px)',
          boxShadow:'0 24px 60px rgba(90,64,20,0.10), inset 0 1px 0 rgba(255,255,255,0.7)'}}>

          {/* KEY PLAN — ONE shared typical-floor site base, ZOOMED INTO this
              pair's marking so the selected blocks are the focus. Pinch-free
              zoom in/out controls sit over it; the marking stays centred. */}
          <div data-keyplan style={{flex:1, minHeight:0, display:'flex', flexDirection:'column', padding:'24px 28px 18px', borderBottom:'1px solid rgba(176,138,63,0.26)'}}>
            <SectionLabel text="KEY PLAN" right={<Compass/>}/>
            <div style={{flex:1, minHeight:0, position:'relative', marginTop:14, borderRadius:14, overflow:'hidden',
              background:'#fbf6ec', border:'1px solid rgba(176,138,63,0.22)',
              display:'flex', alignItems:'center', justifyContent:'center'}}>
              {/* contain-fit box that matches the base image aspect (1760×1800) */}
              <div style={{position:'relative', height:'100%', maxHeight:'100%', maxWidth:'100%', aspectRatio:'1760 / 1800', margin:'auto'}}>
                <div style={{position:'absolute', inset:0, transformOrigin:'50% 50%',
                  transform:`scale(${kpZoom}) translate(${50 - kpCx}%, ${50 - kpCy}%)`,
                  transition:'transform 380ms cubic-bezier(0.22,1,0.36,1)'}}>
                  <img src="assets/plans/keyplan-site.jpg" alt={`Key plan — Block ${blockIds.join(' & ')} highlighted`}
                    style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'fill', mixBlendMode:'multiply'}}
                    onError={(ev)=>{ const sec = ev.currentTarget.closest('[data-keyplan]'); if (sec) sec.style.display='none'; }}/>
                  {kpHl && (
                    <div aria-hidden="true" style={{position:'absolute',
                      left:`${kpHl.left}%`, top:`${kpHl.top}%`, width:`${kpHl.width}%`, height:`${kpHl.height}%`,
                      border:'2px solid var(--gold-deep)', borderRadius:6,
                      background:'rgba(201,160,94,0.16)', boxShadow:'0 0 0 9999px rgba(250,245,236,0.34)',
                      animation:'fpHlPulse 2.6s ease-in-out infinite'}}/>
                  )}
                </div>
              </div>

              {/* zoom in / out controls */}
              <div style={{position:'absolute', right:14, bottom:14, display:'flex', flexDirection:'column', gap:8, zIndex:3}}>
                {[['+', () => setKpZoom(z => Math.min(5, +(z*1.25).toFixed(3))), kpZoom >= 5],
                  ['−', () => setKpZoom(z => Math.max(1, +(z/1.25).toFixed(3))), kpZoom <= 1]].map(([lbl, fn, dis]) => (
                  <button key={lbl} className="kp-zoom-btn" onClick={fn} disabled={dis} aria-label={lbl === '+' ? 'Zoom in' : 'Zoom out'}
                    style={{width:46, height:46, borderRadius:13, cursor:'pointer', fontSize:24, lineHeight:1,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      border:'1px solid rgba(176,138,63,0.5)', background:'rgba(255,253,248,0.92)', color:'var(--gold-deep)',
                      boxShadow:'0 8px 20px rgba(120,86,28,0.16)'}}>{lbl}</button>
                ))}
              </div>
            </div>

            {/* readable caption under the key plan */}
            <div style={{marginTop:14, display:'flex', alignItems:'center', justifyContent:'center', gap:12}}>
              <span style={{width:9, height:9, borderRadius:3, background:'var(--gold-deep)', flexShrink:0}}/>
              <span className="mono" style={{fontSize:15, letterSpacing:'0.16em', color:'var(--graphite)'}}>
                BLOCK {blockIds.join(' & ')} · {flLabel.toUpperCase()} · YOU ARE HERE
              </span>
            </div>
          </div>

          {/* RERA CARPET AREA table */}
          {hasTable && (
            <div style={{padding:'22px 28px', borderBottom: hasLegend ? '1px solid rgba(176,138,63,0.26)' : 'none'}}>
              <SectionLabel text="RERA CARPET AREA"/>
              <div style={{marginTop:16, borderRadius:8, overflow:'hidden', border:'1px solid rgba(176,138,63,0.34)'}}>
                <div style={{display:'grid', gridTemplateColumns:'1.5fr 1fr', background:'linear-gradient(180deg,#b89456,#9a7836)'}}>
                  <div className="mono" style={{padding:'12px 18px', fontSize:12.5, letterSpacing:'0.12em', fontWeight:600, color:'#fff7e8', borderRight:'1px solid rgba(255,255,255,0.22)'}}>UNIT NUMBER</div>
                  <div className="mono" style={{padding:'12px 18px', fontSize:12.5, letterSpacing:'0.12em', fontWeight:600, color:'#fff7e8'}}>RERA CA · SQ.FT</div>
                </div>
                {pdata.table.map((r, ri) => (
                  <div key={ri} style={{display:'grid', gridTemplateColumns:'1.5fr 1fr', borderTop:'1px solid rgba(176,138,63,0.22)', background: ri%2 ? 'rgba(255,255,255,0.34)' : 'rgba(255,255,255,0.06)'}}>
                    <div className="serif" style={{padding:'13px 18px', fontSize:16.5, color:'var(--ink)', borderRight:'1px solid rgba(176,138,63,0.18)', lineHeight:1.35}}>{r.unitRange}</div>
                    <div className="serif" style={{padding:'13px 18px', fontSize:16.5, color:'var(--graphite)', fontVariantNumeric:'tabular-nums'}}>{Number(r.rera).toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TYPOLOGY legend */}
          {hasLegend && (
            <div style={{padding:'22px 28px'}}>
              <SectionLabel text="TYPOLOGY"/>
              <div style={{marginTop:14, display:'flex', flexDirection:'column', gap:11}}>
                {pdata.typeLegend.map((tl, ti) => (
                  <div key={ti} style={{display:'flex', alignItems:'center', gap:14}}>
                    <span style={{width:26, height:26, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:'radial-gradient(circle at 50% 38%, #fffdf8, #e9d6b0)', border:'1.5px solid var(--gold-deep)'}}>
                      <span className="serif" style={{fontSize:13, fontWeight:600, color:'var(--gold-deep)'}}>{ti+1}</span>
                    </span>
                    <span className="serif" style={{fontSize:16.5, color:'var(--graphite)'}}>{tl}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONFIGURATION — shown when a pair has no table/keyplan (e.g. C&D),
              so the rail carries real information instead of empty space. */}
          {!hasTable && (
            <div style={{flex:1, display:'flex', flexDirection:'column', padding:'28px 30px'}}>
              <SectionLabel text="CONFIGURATION"/>
              <div style={{marginTop:20, display:'flex', flexDirection:'column'}}>
                {[
                  ['Blocks', blockIds.join(' & ')],
                  ['Residences / floor', String(layouts.reduce((n,l)=>n+Object.keys(l.positions).length,0))],
                  ['Typology', '4 BHK'],
                  ['Level', flLabel],
                  ['RERA carpet area', 'On request'],
                ].map(([k,v], i) => (
                  <div key={i} style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:18, padding:'15px 0', borderTop: i? '1px solid rgba(176,138,63,0.20)':'none'}}>
                    <span className="mono" style={{fontSize:12.5, letterSpacing:'0.16em', color:'var(--slate)'}}>{k.toUpperCase()}</span>
                    <span className="serif" style={{fontSize:19, color:'var(--ink)', textAlign:'right'}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{marginTop:'auto', paddingTop:20}}>
                <p className="serif" style={{fontSize:15.5, lineHeight:1.6, color:'var(--slate)', fontStyle:'italic', margin:0}}>
                  Detailed RERA carpet areas for Block {blockIds.join(' & ')} are issued with the allotment pack. Tap a block to view its residences.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM HINT (under the plates) + reset ─────────────── */}
      <div style={{position:'absolute', left:88, right:bandRight, bottom:30, display:'flex', flexDirection:'column', alignItems:'center', gap:12, zIndex:9}}>
        <div className="mono" style={{textAlign:'center', fontSize:13.5, letterSpacing:'0.26em', color:'var(--gold-deep)'}}>
          {sel ? 'CHOOSE A RESIDENCE TO VIEW ITS PLAN' : 'TAP A BLOCK TO SELECT A RESIDENCE'}
        </div>
        {sel && (
          <button className="fp-reset" onClick={()=>setSel(null)}
            style={{display:'inline-flex', alignItems:'center', gap:10, padding:'10px 20px', borderRadius:105, cursor:'pointer',
              border:'1px solid rgba(176,138,63,0.45)', background:'rgba(255,255,255,0.5)', color:'var(--gold-deep)',
              animation:'fpFadeUp .4s ease-out both'}}
            onMouseEnter={ev=>{ev.currentTarget.style.background='var(--gold)'; ev.currentTarget.style.color='#1a130a'; ev.currentTarget.style.borderColor='var(--gold)';}}
            onMouseLeave={ev=>{ev.currentTarget.style.background='rgba(255,255,255,0.5)'; ev.currentTarget.style.color='var(--gold-deep)'; ev.currentTarget.style.borderColor='rgba(176,138,63,0.45)';}}>
            <Icons.back width={16} height={16}/>
            <span className="mono" style={{fontSize:13, letterSpacing:'0.18em'}}>VIEW BOTH BLOCKS</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ── small section heading used inside the rail dossier ───────────────────────
function SectionLabel({ text, right }) {
  return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:14}}>
      <div style={{display:'flex', alignItems:'center', gap:12}}>
        <span style={{width:22, height:1, background:'var(--gold-deep)'}}/>
        <span className="mono" style={{fontSize:13, letterSpacing:'0.24em', color:'var(--gold-deep)'}}>{text}</span>
      </div>
      {right || null}
    </div>
  );
}

// ── HTML north compass (replaces any baked "N" on the key-plan image) ────────
function Compass() {
  return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:2}}>
      <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
        <path d="M8 1 L12 13 L8 10 L4 13 Z" fill="var(--gold-deep)"/>
      </svg>
      <span className="mono" style={{fontSize:10.5, letterSpacing:'0.1em', color:'var(--slate)'}}>N</span>
    </div>
  );
}

window.FloorPlate = FloorPlate;
