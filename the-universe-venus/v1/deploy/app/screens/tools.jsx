// Tools — 3 modes, modernised:
//   1) Cost sheet — animated grand total, segmented gold breakdown bar,
//                   line-items with per-row donut shares.
//   2) EMI calc   — central principal-vs-interest donut with the EMI
//                   number BIG inside; gold-fill range sliders; year-by-year
//                   amortization mini-bars; live ratio stats.
//   3) Compare    — side-by-side cards with FLOOR PLAN images, vertical
//                   "VS" divider, and per-metric winner indicators.
//
// All literal sizes/paddings/gaps/radii bumped ~+5% relative to the prior
// version. Theme: --tile gradient + --on-tile for headline cards;
// --gold-deep for mono labels.

const TOOLS_KEYS_ID = 'uni-tools-keys';
function ensureToolsKeys() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(TOOLS_KEYS_ID)) return;
  const s = document.createElement('style');
  s.id = TOOLS_KEYS_ID;
  s.textContent = `
    /* Custom range slider — gold gradient track + 32px gold thumb. */
    input.uni-range {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      background: transparent;
      height: 32px;
      cursor: pointer;
      outline: none;
    }
    input.uni-range::-webkit-slider-runnable-track {
      height: 8px; border-radius: 100px;
      background: var(--uni-track, var(--line));
      box-shadow: inset 0 1px 2px rgba(50,32,12,0.10);
    }
    input.uni-range::-moz-range-track {
      height: 8px; border-radius: 100px;
      background: var(--uni-track, var(--line));
      box-shadow: inset 0 1px 2px rgba(50,32,12,0.10);
    }
    input.uni-range::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 32px; height: 32px; border-radius: 50%;
      margin-top: -12px;
      background: radial-gradient(circle at 35% 30%, #f3e0b1 0%, #c9a05e 55%, #8b6f3d 100%);
      border: 2px solid #faf6e8;
      box-shadow: 0 6px 14px rgba(50,32,12,0.32),
                  0 2px 4px rgba(50,32,12,0.20),
                  inset 0 1px 0 rgba(255,246,224,0.55);
      cursor: grab;
      transition: transform 180ms cubic-bezier(0.22,1,0.36,1);
    }
    input.uni-range:active::-webkit-slider-thumb { transform: scale(1.12); cursor: grabbing; }
    input.uni-range::-moz-range-thumb {
      width: 32px; height: 32px; border-radius: 50%;
      background: radial-gradient(circle at 35% 30%, #f3e0b1 0%, #c9a05e 55%, #8b6f3d 100%);
      border: 2px solid #faf6e8;
      box-shadow: 0 6px 14px rgba(50,32,12,0.32),
                  0 2px 4px rgba(50,32,12,0.20),
                  inset 0 1px 0 rgba(255,246,224,0.55);
      cursor: grab;
    }
    /* Stacked-bar segment hover lift */
    .uni-seg { transition: flex-grow 280ms cubic-bezier(0.22,1,0.36,1),
                            transform 240ms cubic-bezier(0.22,1,0.36,1),
                            filter 240ms; }
    .uni-seg:hover { transform: translateY(-3px); filter: brightness(1.10); }
    /* Amortization year hover */
    .uni-amrt { transition: transform 200ms, filter 200ms; }
    .uni-amrt:hover { transform: translateY(-2px); filter: brightness(1.08); }
  `;
  document.head.appendChild(s);
}

// Live canvas-height density: 0 on the 16:10 Tab S7 (H=1600), 1 on iPad Pro 4:3
// (H=1920). Lets each screen grow figures + breathing room so content fills the
// taller canvas and reads large on iPad, while leaving 16:10 mathematically
// untouched (dens=0 → every interpolated size collapses to its 16:10 value).
function useToolsDens() {
  const read = () => {
    const H = (typeof window !== 'undefined' && window.UNIVERSE_CANVAS && window.UNIVERSE_CANVAS.H) || 1600;
    return Math.max(0, Math.min(1, (H - 1600) / 320));
  };
  const [d, setD] = React.useState(read);
  React.useEffect(() => {
    const on = () => setD(read());
    on();
    window.addEventListener('resize', on);
    window.addEventListener('orientationchange', on);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', on);
    return () => {
      window.removeEventListener('resize', on);
      window.removeEventListener('orientationchange', on);
      if (window.visualViewport) window.visualViewport.removeEventListener('resize', on);
    };
  }, []);
  return d;
}
// interpolate a literal from its 16:10 value (a) to its iPad value (b)
const dlerp = (d, a, b) => Math.round((a + (b - a) * d) * 100) / 100;

function Tools() {
  ensureToolsKeys();
  const dens = useToolsDens();
  const [mode, setMode] = React.useState('cost'); // 'cost' | 'emi' | 'compare'
  return (
    <div style={{position:'absolute', inset:0, background:'transparent', color:'var(--ink)', overflow:'hidden'}}>
      <ScreenHeader title="Tools" subtitle="Cost · EMI · compare typologies" idx="07"/>

      <div style={{position:'absolute', top:294, left:76, display:'flex', gap:11, alignItems:'center', zIndex:5}}>
        {[
          { k:'cost',    label:'Cost Sheet'   },
          { k:'emi',     label:'EMI Calculator' },
          { k:'compare', label:'Compare'      },
        ].map(m => (
          <button key={m.k} onClick={()=>setMode(m.k)} className="mono" style={{
            padding:'17px 32px', borderRadius:105,
            border:'1px solid '+(m.k===mode ? 'var(--gold-deep)' : 'var(--line)'),
            background: m.k===mode
              ? 'linear-gradient(180deg, var(--tile-light) 0%, var(--tile) 100%)'
              : 'var(--ivory-2)',
            color: m.k===mode ? 'var(--on-tile)' : 'var(--ink)',
            fontSize:16, letterSpacing:'0.2em', textTransform:'uppercase', cursor:'pointer',
            fontWeight: m.k===mode ? 700 : 500,
            boxShadow: m.k===mode ? '0 8px 19px rgba(50,32,12,0.18)' : 'none',
            transition:'all 240ms cubic-bezier(0.22,1,0.36,1)',
          }}>{m.label}</button>
        ))}
      </div>

      <div style={{position:'absolute', top:378, left:76, right:76, bottom:76}}>
        {mode === 'cost'    && <CostSheet dens={dens}/>}
        {mode === 'emi'     && <EMI dens={dens}/>}
        {mode === 'compare' && <Compare dens={dens}/>}
      </div>
    </div>
  );
}

// ============================================================================
// COST SHEET — animated total + segmented breakdown bar + line items w/ donuts
// ============================================================================
function CostSheet({ dens = 0 }) {
  const d = dens;
  const [code, setCode] = React.useState(TYPOLOGIES[0].code);
  const [hoverSeg, setHoverSeg] = React.useState(null);
  const ty = TYPOLOGIES.find(x => x.code === code);
  const base = ty.price;
  const gst       = Math.round(base * 0.05);
  const stamp     = Math.round(base * 0.049);
  const reg       = Math.round(base * 0.01);
  const club      = 350000;
  const car       = 600000;
  const corpus    = 250000;
  const legal     = 35000;
  const total     = base + gst + stamp + reg + club + car + corpus + legal;

  // Gold tonal ramp (light → deep) used both in the bar and the row donuts.
  const segments = [
    { k:'BASE',     label:'Base price',      v: base,  color:'#a98e5d' },
    { k:'GST',      label:'GST 5%',          v: gst,   color:'#c9a05e' },
    { k:'STAMP',    label:'Stamp 4.9%',      v: stamp, color:'#b08a3f' },
    { k:'REG',      label:'Registration 1%', v: reg,   color:'#d8b573' },
    { k:'CLUB',     label:'Club',            v: club,  color:'#8b6f3d' },
    { k:'PARKING',  label:'Parking ×2',      v: car,   color:'#6f5829' },
    { k:'CORPUS',   label:'Corpus',          v: corpus,color:'#9c7d4a' },
    { k:'LEGAL',    label:'Legal',           v: legal, color:'#7a6233' },
  ];

  const rows = [
    { k:'Base price (carpet × rate)',  v: base, note: ty.sqft.toLocaleString()+' sq ft', color:'#a98e5d' },
    { k:'GST (5%, under-construction)', v: gst,  color:'#c9a05e' },
    { k:'Stamp duty (4.9%)',           v: stamp, color:'#b08a3f' },
    { k:'Registration (1%)',           v: reg,   color:'#d8b573' },
    { k:'Club membership (1×)',        v: club, note:'lifetime', color:'#8b6f3d' },
    { k:'Covered parking (2 nos.)',    v: car,  note:'2 cars',  color:'#6f5829' },
    { k:'Society corpus (1×)',         v: corpus, color:'#9c7d4a' },
    { k:'Legal & documentation',       v: legal, color:'#7a6233' },
  ];

  return (
    <div style={{display:'grid', gridTemplateColumns:'1.05fr 1fr', gap:53, height:'100%'}}>
      {/* LEFT — selector + animated total + segmented breakdown */}
      <div style={{display:'flex', flexDirection:'column', gap:dlerp(d,23,28), height:'100%', minHeight:0}}>
        <div className="mono" style={{fontSize:dlerp(d,15,18), letterSpacing:'0.28em', color:'var(--slate)'}}>SELECT TYPOLOGY</div>
        <select value={code} onChange={e=>setCode(e.target.value)} style={{width:'100%', fontSize:dlerp(d,24,30), minHeight:dlerp(d,76,90)}}>
          {TYPOLOGIES.map(x => <option key={x.code} value={x.code}>{x.block} — {x.name} ({x.sqft.toLocaleString()} sqft)</option>)}
        </select>

        {/* big animated total card — grows to fill the column; total sits at the
            top, the breakdown bar sinks to the card's base so the card reads full
            and intentional at every canvas height */}
        <div style={{padding:dlerp(d,36,46)+'px '+dlerp(d,40,48)+'px', borderRadius:19, marginTop:8,
                     flex:'1 1 auto', minHeight:0,
                     display:'flex', flexDirection:'column',
                     background:'linear-gradient(160deg, var(--tile) 0%, var(--tile-deep) 100%)',
                     color:'var(--on-tile)',
                     boxShadow:'0 23px 53px rgba(50,32,12,0.32), inset 0 1px 0 rgba(255,246,224,0.18)',
                     border:'1px solid rgba(255,246,224,0.18)'}}>
          <div className="mono" style={{fontSize:dlerp(d,15,18), letterSpacing:'0.32em', color:'var(--gold-soft)'}}>ALL-INCLUSIVE TOTAL</div>
          <div className="serif" style={{fontSize:dlerp(d,88,104), fontWeight:300, lineHeight:1, marginTop:dlerp(d,15,20), letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums'}}>
            <span>₹ </span>
            <CounterFlip key={'total-'+code} value={Math.round(total/1e5)} duration={1.2}/>
            <span style={{fontSize:dlerp(d,38,46), marginLeft:14, fontStyle:'italic', color:'var(--gold-soft)'}}>L</span>
          </div>
          <div style={{fontSize:dlerp(d,19,23), color:'rgba(250,246,232,0.70)', marginTop:11, fontStyle:'italic'}}>{ty.name} · ₹ {Math.round(base/ty.sqft).toLocaleString()}/sqft base</div>

          {/* indicative construction-linked payment plan — sits a fixed,
              comfortable distance under the total so the card's free space
              collects as ONE band at the base (under the breakdown) rather than
              two awkward mid-card voids on the taller iPad canvas */}
          <div style={{marginTop:dlerp(d,30,44)}}>
            <div className="mono" style={{fontSize:dlerp(d,13,16), letterSpacing:'0.30em', color:'var(--gold-soft)', marginBottom:dlerp(d,16,22)}}>INDICATIVE PAYMENT PLAN</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:0}}>
              {[
                { k:'ON BOOKING',         pct:0.10 },
                { k:'DURING CONSTRUCTION', pct:0.75 },
                { k:'ON POSSESSION',      pct:0.15 },
              ].map((m, i) => (
                <div key={m.k} style={{
                  padding:'0 '+dlerp(d,20,26)+'px',
                  borderLeft: i === 0 ? 'none' : '1px solid rgba(255,246,224,0.16)',
                }}>
                  <div className="serif" style={{fontSize:dlerp(d,40,50), fontWeight:300, lineHeight:1, letterSpacing:'-0.01em', fontVariantNumeric:'tabular-nums'}}>{Math.round(m.pct*100)}<span style={{fontSize:dlerp(d,20,25), fontStyle:'italic', color:'var(--gold-soft)', marginLeft:2}}>%</span></div>
                  <div className="serif" style={{fontSize:dlerp(d,21,26), marginTop:dlerp(d,8,11), color:'rgba(250,246,232,0.82)', fontVariantNumeric:'tabular-nums'}}>{formatINR(Math.round(total*m.pct), {decimals:1})}</div>
                  <div className="mono" style={{fontSize:dlerp(d,11.5,14), letterSpacing:'0.22em', color:'rgba(250,246,232,0.55)', marginTop:dlerp(d,9,12)}}>{m.k}</div>
                </div>
              ))}
            </div>
          </div>

          {/* segmented breakdown bar — anchored to the bottom of the card */}
          <div style={{marginTop:'auto', paddingTop:dlerp(d,26,34)}}>
            <div className="mono" style={{fontSize:dlerp(d,13,16), letterSpacing:'0.30em', color:'var(--gold-soft)', marginBottom:13}}>BREAKDOWN</div>
            <div style={{display:'flex', height:dlerp(d,32,40), borderRadius:11, overflow:'hidden', border:'1px solid rgba(255,246,224,0.22)', boxShadow:'inset 0 1px 3px rgba(0,0,0,0.32)'}}>
              {segments.map((s, i) => {
                const pct = s.v / total;
                const isHover = hoverSeg === i;
                return (
                  <div key={s.k}
                    className="uni-seg"
                    onMouseEnter={()=>setHoverSeg(i)}
                    onMouseLeave={()=>setHoverSeg(null)}
                    style={{
                      flex: pct,
                      flexGrow: isHover ? pct * 1.05 : pct,
                      background: s.color,
                      borderRight: i < segments.length - 1 ? '1px solid rgba(0,0,0,0.18)' : 'none',
                      position:'relative',
                      cursor:'default',
                    }}>
                    {isHover && (
                      <div style={{
                        position:'absolute', bottom:'calc(100% + 11px)', left:'50%', transform:'translateX(-50%)',
                        background:'var(--ivory)', color:'var(--ink)',
                        padding:'9px 14px', borderRadius:9,
                        fontSize:13, whiteSpace:'nowrap',
                        boxShadow:'0 8px 22px rgba(50,32,12,0.30)',
                        border:'1px solid var(--gold)',
                        zIndex:5,
                      }}>
                        <span className="mono" style={{letterSpacing:'0.18em', color:'var(--gold-deep)'}}>{s.label}</span>
                        <span style={{marginLeft:9, fontVariantNumeric:'tabular-nums'}}>{(pct*100).toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* legend dots */}
            <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:dlerp(d,9,12), marginTop:dlerp(d,15,20)}}>
              {segments.map((s, i) => (
                <div key={s.k} style={{display:'flex', alignItems:'center', gap:8, fontSize:dlerp(d,12.5,15), color:'rgba(250,246,232,0.78)'}}>
                  <span style={{width:dlerp(d,9,11), height:dlerp(d,9,11), borderRadius:2, background:s.color, flex:'none'}}/>
                  <span className="mono" style={{letterSpacing:'0.18em'}}>{s.k}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{padding:dlerp(d,25,30)+'px '+dlerp(d,30,36)+'px', background:'var(--ivory-2)', border:'1px dashed var(--line)', borderRadius:15, fontSize:dlerp(d,18,21), color:'var(--graphite)', lineHeight:1.55}}>
          Figures are illustrative for sales discussion. Actual schedule of payment, GST and registration charges
          will be reflected in the booking application form per RERA disclosures.
        </div>
      </div>

      {/* RIGHT — line items with per-row donut % shares (rows distribute to fill height) */}
      <div className="scroll" style={{overflow:'auto', paddingRight:8, display:'flex', flexDirection:'column', height:'100%'}}>
        <div className="mono" style={{fontSize:dlerp(d,15,18), letterSpacing:'0.28em', color:'var(--slate)', paddingBottom:13, borderBottom:'1px solid var(--line)', flex:'0 0 auto'}}>LINE-ITEM BREAKDOWN</div>
        <div style={{display:'flex', flexDirection:'column', justifyContent:'space-between', flex:'1 1 auto', minHeight:0, paddingBottom:dlerp(d,30,20)}}>
          {rows.map((r, i) => {
            const pct = r.v / total;
            const ds = dlerp(d,50,60);
            return (
              <div key={i} style={{
                display:'grid',
                gridTemplateColumns:dlerp(d,56,66)+'px 1fr auto',
                gap:dlerp(d,19,24),
                padding:dlerp(d,21,24)+'px 4px',
                borderBottom:'1px solid var(--line-soft)',
                alignItems:'center',
              }}>
                {/* mini donut */}
                <div style={{position:'relative', width:ds, height:ds, flex:'none'}}>
                  <svg width={ds} height={ds} style={{transform:'rotate(-90deg)'}}>
                    <circle cx={ds/2} cy={ds/2} r={ds/2-5} fill="none" stroke="var(--line)" strokeWidth="4.5"/>
                    <circle cx={ds/2} cy={ds/2} r={ds/2-5} fill="none" stroke={r.color} strokeWidth="4.5"
                      strokeLinecap="round" strokeDasharray={2*Math.PI*(ds/2-5)}
                      strokeDashoffset={2*Math.PI*(ds/2-5) * (1 - pct)}/>
                  </svg>
                  <div className="serif" style={{
                    position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:dlerp(d,14,17), color:r.color, fontWeight:500, fontVariantNumeric:'tabular-nums',
                  }}>{(pct*100).toFixed(0)}%</div>
                </div>

                <div>
                  <div className="serif" style={{fontSize:dlerp(d,27,33), fontWeight:400, letterSpacing:'-0.005em', lineHeight:1.18}}>{r.k}</div>
                  {r.note && <div className="mono" style={{fontSize:dlerp(d,14.5,17), letterSpacing:'0.22em', color:'var(--slate)', marginTop:6, textTransform:'uppercase'}}>{r.note}</div>}
                </div>
                <div className="mono" style={{fontSize:dlerp(d,25,30), color:'var(--ink)', whiteSpace:'nowrap', fontVariantNumeric:'tabular-nums'}}>{formatINR(r.v, {decimals:2})}</div>
              </div>
            );
          })}
          <div style={{display:'grid', gridTemplateColumns:'1fr auto', gap:19, padding:dlerp(d,31,30)+'px 4px '+dlerp(d,10,2)+'px', borderTop:'2.6px solid var(--gold)', alignItems:'baseline', marginTop:6}}>
            <div className="serif" style={{fontSize:dlerp(d,42,52), fontWeight:400, letterSpacing:'-0.01em'}}>Total payable</div>
            <div className="serif" style={{fontSize:dlerp(d,42,52), color:'var(--gold-deep)', fontWeight:400, fontVariantNumeric:'tabular-nums'}}>{formatINR(total, {decimals:2})}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EMI — central principal-vs-interest donut (with EMI BIG inside) + custom
// gold sliders + amortization mini-bars + ratio stats
// ============================================================================
function EMI({ dens = 0 }) {
  const d = dens;
  const [code, setCode] = React.useState(TYPOLOGIES[0].code);
  const ty = TYPOLOGIES.find(x => x.code === code);
  const [downPct, setDownPct]  = React.useState(20);
  const [rate, setRate]        = React.useState(8.5);
  const [years, setYears]      = React.useState(20);
  const [hoverYr, setHoverYr]  = React.useState(null);

  const base   = ty.price;
  const down   = base * downPct / 100;
  const loan   = base - down;
  const r      = rate/100/12;
  const n      = years * 12;
  const emi    = loan * r * Math.pow(1+r,n) / (Math.pow(1+r,n) - 1);
  const totalInt = emi * n - loan;
  const totalPay = loan + totalInt;
  const monthlyIncome = 500000; // assumed for ratio
  const ratioPct = (emi / monthlyIncome) * 100;

  // Year-by-year amortization
  const yearly = React.useMemo(() => {
    const arr = [];
    let bal = loan;
    for (let y = 1; y <= years; y++) {
      let pPaid = 0, iPaid = 0;
      for (let m = 0; m < 12; m++) {
        const ip = bal * r;
        const pp = emi - ip;
        bal = Math.max(0, bal - pp);
        pPaid += pp; iPaid += ip;
      }
      arr.push({ y, principal: pPaid, interest: iPaid, balance: bal });
    }
    return arr;
  }, [loan, r, emi, years]);
  const maxYearTotal = Math.max(...yearly.map(d => d.principal + d.interest), 1);

  // Donut geometry — central card (grows on the taller iPad canvas so the card
  // never reads hollow)
  const donutSize = dlerp(d, 380, 560);
  const donutStroke = dlerp(d, 38, 52);
  const donutR = (donutSize - donutStroke) / 2;
  const donutC = 2 * Math.PI * donutR;
  const principalShare = loan / totalPay;
  const interestShare  = totalInt / totalPay;

  // Helper for gold-fill range track
  const trackBg = (pct) =>
    `linear-gradient(90deg, var(--gold-deep) 0%, var(--gold) ${pct}%, var(--line) ${pct}%, var(--line) 100%)`;

  return (
    <div style={{display:'grid', gridTemplateColumns:'0.85fr 1.15fr', gap:53, height:'100%'}}>

      {/* LEFT — typology + sliders + amortization */}
      <div style={{display:'flex', flexDirection:'column', gap:dlerp(d,23,30), height:'100%', minHeight:0}}>
        <div>
          <div className="mono" style={{fontSize:dlerp(d,15,18), letterSpacing:'0.28em', color:'var(--slate)'}}>TYPOLOGY</div>
          <select value={code} onChange={e=>setCode(e.target.value)} style={{width:'100%', marginTop:11, fontSize:dlerp(d,24,30), minHeight:dlerp(d,76,90)}}>
            {TYPOLOGIES.map(x => <option key={x.code} value={x.code}>{x.block} — {x.name}</option>)}
          </select>
        </div>

        <SliderBig dens={d} label="Down payment" value={downPct} setValue={setDownPct}
          min={10} max={50} step={5} suffix="%" trackBg={trackBg}/>
        <SliderBig dens={d} label="Interest rate" value={rate} setValue={setRate}
          min={6.5} max={11} step={0.1} suffix="% p.a." trackBg={trackBg} fixed={1}/>
        <SliderBig dens={d} label="Loan tenure" value={years} setValue={setYears}
          min={5} max={30} step={1} suffix=" yrs" trackBg={trackBg}/>

        {/* amortization mini-chart — grows to fill the column on tall canvases */}
        <div style={{padding:dlerp(d,25,30)+'px '+dlerp(d,27,32)+'px', background:'var(--ivory-2)', border:'1px solid var(--line)', borderRadius:17, marginTop:6, flex:'1 1 auto', minHeight:0, display:'flex', flexDirection:'column'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:13}}>
            <div className="mono" style={{fontSize:dlerp(d,14,17), letterSpacing:'0.30em', color:'var(--slate)'}}>AMORTIZATION · YEAR-WISE</div>
            {hoverYr !== null && yearly[hoverYr] && (
              <div className="mono" style={{fontSize:13, letterSpacing:'0.18em', color:'var(--gold-deep)', fontVariantNumeric:'tabular-nums'}}>
                Y{yearly[hoverYr].y} · P {formatINR(Math.round(yearly[hoverYr].principal),{decimals:1})} · I {formatINR(Math.round(yearly[hoverYr].interest),{decimals:1})}
              </div>
            )}
          </div>
          <div style={{display:'flex', alignItems:'flex-end', gap:dlerp(d,5,7), flex:'1 1 auto', minHeight:dlerp(d,140,210)}}>
            {yearly.map((yr, i) => {
              const tot = yr.principal + yr.interest;
              const colPct = (tot / maxYearTotal) * 100;     // column height as % of chart
              const pPct = (yr.principal / tot) * 100;        // principal share within column
              const isHover = hoverYr === i;
              return (
                <div key={i}
                  className="uni-amrt"
                  onMouseEnter={()=>setHoverYr(i)}
                  onMouseLeave={()=>setHoverYr(null)}
                  style={{
                    flex:1, display:'flex', flexDirection:'column', justifyContent:'flex-end',
                    height:`${colPct}%`, cursor:'pointer',
                    filter: isHover ? 'brightness(1.10)' : 'none',
                  }}>
                  <div style={{
                    height: `${100 - pPct}%`,
                    background:'var(--gold-deep)',
                    borderRadius:'3px 3px 0 0',
                    boxShadow: isHover ? '0 0 12px rgba(176,138,63,0.55)' : 'none',
                  }}/>
                  <div style={{
                    height: `${pPct}%`,
                    background:'var(--gold-soft)',
                    borderTop:'1px solid var(--ivory)',
                  }}/>
                </div>
              );
            })}
          </div>
          <div style={{display:'flex', justifyContent:'space-between', marginTop:dlerp(d,9,13), fontSize:dlerp(d,11.5,14), color:'var(--slate)', fontFamily:'JetBrains Mono, monospace', letterSpacing:'0.15em'}}>
            <span>Y1</span><span>Y{Math.ceil(years/2)}</span><span>Y{years}</span>
          </div>
          <div style={{display:'flex', justifyContent:'flex-start', gap:21, marginTop:dlerp(d,13,16), fontSize:dlerp(d,13,16), color:'var(--graphite)'}}>
            <span style={{display:'flex', alignItems:'center', gap:8}}>
              <span style={{width:13, height:13, background:'var(--gold-soft)', borderRadius:3}}/>
              <span className="mono" style={{letterSpacing:'0.18em'}}>PRINCIPAL</span>
            </span>
            <span style={{display:'flex', alignItems:'center', gap:8}}>
              <span style={{width:13, height:13, background:'var(--gold-deep)', borderRadius:3}}/>
              <span className="mono" style={{letterSpacing:'0.18em'}}>INTEREST</span>
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT — donut card grows to fill; stats + context anchor below */}
      <div style={{display:'flex', flexDirection:'column', gap:dlerp(d,23,28), height:'100%', minHeight:0}}>
        <div style={{padding:dlerp(d,40,48)+'px '+dlerp(d,44,52)+'px', borderRadius:21,
                     flex:'1 1 auto', minHeight:0,
                     background:'linear-gradient(160deg, var(--tile) 0%, var(--tile-deep) 100%)',
                     color:'var(--on-tile)',
                     boxShadow:'0 27px 59px rgba(50,32,12,0.32), inset 0 1px 0 rgba(255,246,224,0.18)',
                     border:'1px solid rgba(255,246,224,0.18)',
                     display:'flex', flexDirection:'column', alignItems:'center', gap:dlerp(d,11,16)}}>
          <div className="mono" style={{fontSize:dlerp(d,15,18), letterSpacing:'0.32em', color:'var(--gold-soft)', alignSelf:'flex-start'}}>MONTHLY EMI · PRINCIPAL VS INTEREST</div>

          {/* DONUT with EMI in centre — vertically centred in the card's free space */}
          <div style={{flex:'1 1 auto', minHeight:0, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div style={{position:'relative', width:donutSize, height:donutSize}}>
            <svg width={donutSize} height={donutSize} style={{transform:'rotate(-90deg)'}}>
              <circle cx={donutSize/2} cy={donutSize/2} r={donutR} fill="none"
                stroke="rgba(255,246,224,0.10)" strokeWidth={donutStroke}/>
              {/* principal arc — gold soft */}
              <circle cx={donutSize/2} cy={donutSize/2} r={donutR} fill="none"
                stroke="var(--gold-soft)" strokeWidth={donutStroke}
                strokeLinecap="butt"
                strokeDasharray={`${donutC * principalShare} ${donutC}`}
                strokeDashoffset={0}
                style={{transition:'stroke-dasharray 360ms cubic-bezier(0.22,1,0.36,1)'}}/>
              {/* interest arc — gold deep */}
              <circle cx={donutSize/2} cy={donutSize/2} r={donutR} fill="none"
                stroke="var(--gold-deep)" strokeWidth={donutStroke}
                strokeLinecap="butt"
                strokeDasharray={`${donutC * interestShare} ${donutC}`}
                strokeDashoffset={-donutC * principalShare}
                style={{transition:'stroke-dasharray 360ms cubic-bezier(0.22,1,0.36,1)'}}/>
            </svg>
            <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
              <div className="mono" style={{fontSize:dlerp(d,13,16), letterSpacing:'0.32em', color:'var(--gold-soft)'}}>EMI / MONTH</div>
              <div className="serif" style={{fontSize:dlerp(d,62,76), fontWeight:300, lineHeight:1, marginTop:dlerp(d,8,12), letterSpacing:'-0.025em', fontVariantNumeric:'tabular-nums', color:'var(--on-tile)'}}>
                <CounterFlip key={'emi-'+code+'-'+downPct+'-'+rate+'-'+years} value={Math.round(emi)} duration={0.7} prefix="₹"/>
              </div>
              <div style={{fontSize:dlerp(d,14.5,18), color:'rgba(250,246,232,0.65)', marginTop:9, fontStyle:'italic'}}>{years*12} months · {rate}% p.a.</div>
            </div>
          </div>
          </div>

          {/* donut legend */}
          <div style={{display:'flex', gap:dlerp(d,32,40), marginTop:6, fontVariantNumeric:'tabular-nums'}}>
            <div style={{display:'flex', alignItems:'center', gap:9}}>
              <span style={{width:dlerp(d,13,15), height:dlerp(d,13,15), background:'var(--gold-soft)', borderRadius:3, boxShadow:'inset 0 0 0 1px rgba(0,0,0,0.18)'}}/>
              <span className="mono" style={{fontSize:dlerp(d,12.5,15), letterSpacing:'0.22em', color:'var(--gold-soft)'}}>PRINCIPAL</span>
              <span style={{fontSize:dlerp(d,14,17), color:'var(--on-tile)'}}>{Math.round(principalShare*100)}%</span>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:9}}>
              <span style={{width:dlerp(d,13,15), height:dlerp(d,13,15), background:'var(--gold-deep)', borderRadius:3}}/>
              <span className="mono" style={{fontSize:dlerp(d,12.5,15), letterSpacing:'0.22em', color:'var(--gold-soft)'}}>INTEREST</span>
              <span style={{fontSize:dlerp(d,14,17), color:'var(--on-tile)'}}>{Math.round(interestShare*100)}%</span>
            </div>
          </div>
        </div>

        {/* stats row */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:dlerp(d,13,16)}}>
          <Stat2 dens={d} k="TOTAL PAYABLE" v={formatINR(Math.round(totalPay),{decimals:2})}/>
          <Stat2 dens={d} k="TOTAL INTEREST" v={formatINR(Math.round(totalInt),{decimals:2})} accent/>
          <Stat2 dens={d} k="LOAN AMOUNT"   v={formatINR(Math.round(loan),{decimals:2})}/>
          <Stat2 dens={d} k="EMI / INCOME"  v={ratioPct.toFixed(1)+'%'} sub="@ ₹5 L / mo"
                 accent={ratioPct > 40}/>
        </div>

        {/* down-payment context */}
        <div style={{padding:dlerp(d,21,28)+'px '+dlerp(d,27,32)+'px', background:'var(--ivory-2)', border:'1px solid var(--line)', borderRadius:15,
                     display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:18}}>
          <div>
            <div className="mono" style={{fontSize:dlerp(d,13.5,16), letterSpacing:'0.28em', color:'var(--slate)'}}>DOWN PAYMENT · {downPct}%</div>
            <div className="serif" style={{fontSize:dlerp(d,30,37), fontWeight:400, marginTop:7, color:'var(--ink)', fontVariantNumeric:'tabular-nums'}}>{formatINR(Math.round(down),{decimals:2})}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div className="mono" style={{fontSize:dlerp(d,13.5,16), letterSpacing:'0.28em', color:'var(--slate)'}}>UNIT PRICE</div>
            <div className="serif" style={{fontSize:dlerp(d,30,37), fontWeight:400, marginTop:7, color:'var(--ink)', fontVariantNumeric:'tabular-nums'}}>{formatINR(base,{decimals:2})}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPARE — side-by-side cards with floor plan IMAGES + VS divider + winner row
// ============================================================================
function Compare({ dens = 0 }) {
  const d = dens;
  const [a, setA] = React.useState(TYPOLOGIES[0].code);
  const [b, setB] = React.useState(TYPOLOGIES[4].code);
  const A = TYPOLOGIES.find(x => x.code === a);
  const B = TYPOLOGIES.find(x => x.code === b);

  // ---- winner logic per metric -------------------------------------------
  // For carpet: bigger wins ("more spacious"). Compact-flag for the smaller.
  // For base price: lower wins.
  // For per-sqft: lower wins.
  // Character is descriptive (the typology tag), not a contest.
  const metrics = [
    {
      k: 'CARPET',
      av: A.sqft, bv: B.sqft,
      fmt: v => v.toLocaleString() + ' sqft',
      winner: A.sqft === B.sqft ? null : (A.sqft > B.sqft ? 'A' : 'B'),
      winnerNote: 'more spacious',
      loserNote:  'more compact',
    },
    {
      k: 'BASE PRICE',
      av: A.price, bv: B.price,
      fmt: v => formatINR(v, {decimals:2}),
      winner: A.price === B.price ? null : (A.price < B.price ? 'A' : 'B'),
      winnerNote: 'better value',
      loserNote:  'higher ticket',
    },
    {
      k: 'PER SQFT',
      av: Math.round(A.price/A.sqft), bv: Math.round(B.price/B.sqft),
      fmt: v => '₹ ' + v.toLocaleString() + '/sqft',
      winner: (A.price/A.sqft) === (B.price/B.sqft) ? null : ((A.price/A.sqft) < (B.price/B.sqft) ? 'A' : 'B'),
      winnerNote: 'lower /sqft',
      loserNote:  'higher /sqft',
    },
    {
      k: 'CHARACTER',
      av: A.tag, bv: B.tag,
      fmt: v => v,
      winner: null, // descriptive, not a contest
      winnerNote: '',
      loserNote:  '',
    },
  ];

  return (
    <div style={{display:'flex', flexDirection:'column', gap:dlerp(d,23,28), height:'100%'}}>

      {/* CARDS row */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 86px 1fr', gap:0, alignItems:'stretch', flex:'1 1 auto', minHeight:0}}>
        <CompareCard dens={d} letter="A" ty={A} setTy={c=>setA(c)}/>
        <VsDivider/>
        <CompareCard dens={d} letter="B" ty={B} setTy={c=>setB(c)}/>
      </div>

      {/* WINNER ROW */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:dlerp(d,13,16)}}>
        {metrics.map((m, i) => (
          <WinnerCell key={i} m={m} dens={d}/>
        ))}
      </div>
    </div>
  );
}

function CompareCard({ letter, ty, setTy, dens = 0 }) {
  const d = dens;
  const isA = letter === 'A';
  // available blocks → typologies for the pill-list filter
  const blocks = Array.from(new Set(TYPOLOGIES.map(x => x.pair)));
  const [block, setBlock] = React.useState(ty.pair);
  const inBlock = TYPOLOGIES.filter(x => x.pair === block);
  // if currently selected ty isn't in the new block, hop to first match
  React.useEffect(() => {
    if (!inBlock.find(x => x.code === ty.code)) {
      if (inBlock[0]) setTy(inBlock[0].code);
    }
    // eslint-disable-next-line
  }, [block]);

  const planSrc = ty.plan; // already a full assets/plans/*.jpg path

  return (
    <div style={{
      background:'var(--ivory-2)',
      border:'1px solid var(--line)',
      borderRadius:21,
      padding:'21px 23px 23px',
      display:'flex', flexDirection:'column', gap:15,
      boxShadow:'0 13px 30px rgba(50,32,12,0.10)',
      minHeight:0, overflow:'hidden',
    }}>
      {/* header — option label + block pills */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:13}}>
        <div className="mono" style={{
          fontSize:13.5, letterSpacing:'0.30em', color:'var(--gold-deep)',
          padding:'7px 13px', borderRadius:100,
          background:'rgba(216,181,115,0.16)',
          border:'1px solid rgba(176,138,63,0.32)',
        }}>OPTION {letter}</div>
        <div style={{display:'flex', gap:6, flexWrap:'wrap', justifyContent:'flex-end'}}>
          {blocks.map(blk => (
            <button key={blk} onClick={()=>setBlock(blk)} className="mono" style={{
              padding:'7px 12px', borderRadius:100,
              fontSize:11.5, letterSpacing:'0.18em', textTransform:'uppercase',
              border:'1px solid '+(blk===block ? 'var(--gold-deep)' : 'var(--line)'),
              background: blk===block ? 'var(--gold)' : 'var(--ivory)',
              color: blk===block ? 'var(--ink)' : 'var(--graphite)',
              cursor:'pointer', fontWeight: blk===block ? 700 : 500,
              transition:'all 200ms',
            }}>{blk}</button>
          ))}
        </div>
      </div>

      {/* unit-within-block dropdown */}
      <select value={ty.code} onChange={e=>setTy(e.target.value)} style={{width:'100%', fontSize:dlerp(d,24,29), minHeight:dlerp(d,76,88)}}>
        {inBlock.map(x => <option key={x.code} value={x.code}>{x.name}</option>)}
      </select>

      {/* LARGE FLOOR PLAN IMAGE — zoomable */}
      <ZoomablePlan src={planSrc} alt={ty.name} block={ty.pair}/>

      {/* metadata row */}
      <div>
        <div className="serif" style={{fontSize:dlerp(d,31,38), fontWeight:400, lineHeight:1.10, letterSpacing:'-0.01em'}}>{ty.name}</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:11, marginTop:dlerp(d,13,17)}}>
          <Mini dens={d} k="CARPET"     v={ty.sqft.toLocaleString()+' sqft'}/>
          <Mini dens={d} k="BASE"       v={formatINR(ty.price,{decimals:1})}/>
          <Mini dens={d} k="PER SQFT"   v={'₹ '+Math.round(ty.price/ty.sqft).toLocaleString()}/>
          <Mini dens={d} k="CHARACTER"  v={ty.tag}/>
        </div>
      </div>
    </div>
  );
}

function VsDivider() {
  return (
    <div style={{position:'relative', display:'flex', justifyContent:'center', alignItems:'center'}}>
      <div style={{position:'absolute', top:0, bottom:0, width:1, background:'linear-gradient(180deg, transparent 0%, var(--gold) 18%, var(--gold) 82%, transparent 100%)', opacity:0.6}}/>
      <div className="serif" style={{
        position:'relative',
        width:74, height:74, borderRadius:'50%',
        background:'linear-gradient(160deg, var(--tile) 0%, var(--tile-deep) 100%)',
        color:'var(--on-tile)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:27, fontWeight:400, fontStyle:'italic',
        letterSpacing:'-0.01em',
        boxShadow:'0 11px 25px rgba(50,32,12,0.32), inset 0 1px 0 rgba(255,246,224,0.20)',
        border:'1px solid rgba(255,246,224,0.22)',
      }}>vs</div>
    </div>
  );
}

function Mini({ k, v, dens = 0 }) {
  const d = dens;
  return (
    <div>
      <div className="mono" style={{fontSize:dlerp(d,11.5,14), letterSpacing:'0.22em', color:'var(--slate)'}}>{k}</div>
      <div className="serif" style={{fontSize:dlerp(d,19,23), fontWeight:400, marginTop:4, color:'var(--ink)', fontVariantNumeric:'tabular-nums'}}>{v}</div>
    </div>
  );
}

// === ZoomablePlan ===========================================================
// Floor plan image with full pinch / drag / wheel / double-tap-reset gestures
// PLUS visible + / − / RESET buttons. Mirrors the residences-screen pattern
// so the gestures feel consistent across the app.
function ZoomablePlan({ src, alt, block }) {
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({x:0, y:0});
  const [gestureActive, setGestureActive] = React.useState(false);
  const containerRef = React.useRef(null);
  const gestureRef = React.useRef({
    mode:null,
    startD:0, startZoom:1,
    startPanX:0, startPanY:0,
    startMidX:0, startMidY:0,
    lastTapAt:0, lastTapX:0, lastTapY:0,
    dragStartX:0, dragStartY:0,
  });

  const MIN_Z = 1, MAX_Z = 5, STEP = 0.6;

  // Reset when src changes (user picked a new typology)
  React.useEffect(()=>{ setZoom(1); setPan({x:0, y:0}); }, [src]);

  // Clamp pan so the plan stays mostly inside the frame
  const clampPan = (p, z) => {
    const el = containerRef.current;
    if (!el) return p;
    const r = el.getBoundingClientRect();
    const maxX = Math.max(0, ((z - 1) / 2) * r.width)  + 40;
    const maxY = Math.max(0, ((z - 1) / 2) * r.height) + 40;
    return {
      x: Math.max(-maxX, Math.min(maxX, p.x)),
      y: Math.max(-maxY, Math.min(maxY, p.y)),
    };
  };

  // Zoom toward a point (cx, cy in container-local coords)
  const zoomAt = (newZoom, cx, cy) => {
    const z = Math.max(MIN_Z, Math.min(MAX_Z, newZoom));
    const el = containerRef.current;
    if (!el) { setZoom(z); return; }
    const r = el.getBoundingClientRect();
    const ax = cx - r.width/2;
    const ay = cy - r.height/2;
    const k = z / zoom;
    setZoom(z);
    if (z <= MIN_Z) setPan({x:0, y:0});
    else setPan(clampPan({ x: ax - (ax - pan.x) * k, y: ay - (ay - pan.y) * k }, z));
  };

  // ----- TOUCH ----- (pinch + 1-finger pan + tap-to-zoom + double-tap-reset)
  const handleTouchStart = (ev) => {
    const g = gestureRef.current;
    const touches = ev.touches;
    const el = containerRef.current;
    const rect = el ? el.getBoundingClientRect() : { left:0, top:0 };
    if (touches.length >= 2) {
      const [a, b] = [touches[0], touches[1]];
      const dx = b.clientX - a.clientX, dy = b.clientY - a.clientY;
      g.mode = 'pinch';
      setGestureActive(true);
      g.startD = Math.hypot(dx, dy) || 1;
      g.startZoom = zoom;
      g.startPanX = pan.x; g.startPanY = pan.y;
      g.startMidX = (a.clientX + b.clientX) / 2 - rect.left;
      g.startMidY = (a.clientY + b.clientY) / 2 - rect.top;
    } else if (touches.length === 1) {
      const t0 = touches[0];
      const tx = t0.clientX, ty = t0.clientY;
      g.dragStartX = tx; g.dragStartY = ty;
      g.startPanX = pan.x; g.startPanY = pan.y;
      // Track tap timing for double-tap detection (handled in touchend)
      if (zoom > MIN_Z) {
        g.mode = 'pan-touch';
        setGestureActive(true);
      } else {
        g.mode = 'tap-pending';
      }
    }
  };
  const handleTouchMove = (ev) => {
    const g = gestureRef.current;
    if (!g.mode) return;
    if (ev.cancelable) ev.preventDefault();
    const touches = ev.touches;
    if (g.mode === 'pinch' && touches.length >= 2) {
      const [a, b] = [touches[0], touches[1]];
      const dx = b.clientX - a.clientX, dy = b.clientY - a.clientY;
      const newD = Math.hypot(dx, dy) || 1;
      const newZoom = Math.max(MIN_Z, Math.min(MAX_Z, g.startZoom * (newD / g.startD)));
      const el = containerRef.current;
      const rect = el ? el.getBoundingClientRect() : { left:0, top:0 };
      const cx = (a.clientX + b.clientX) / 2 - rect.left;
      const cy = (a.clientY + b.clientY) / 2 - rect.top;
      const offX = (cx - g.startMidX) + g.startPanX * (newZoom / g.startZoom);
      const offY = (cy - g.startMidY) + g.startPanY * (newZoom / g.startZoom);
      setZoom(newZoom);
      setPan(clampPan({ x: offX, y: offY }, newZoom));
    } else if (g.mode === 'pan-touch' && touches.length === 1) {
      const t0 = touches[0];
      const dx = t0.clientX - g.dragStartX;
      const dy = t0.clientY - g.dragStartY;
      setPan(clampPan({ x: g.startPanX + dx, y: g.startPanY + dy }, zoom));
    } else if (g.mode === 'tap-pending' && touches.length === 1) {
      // If finger has moved meaningfully, cancel the pending tap
      const t0 = touches[0];
      if (Math.hypot(t0.clientX - g.dragStartX, t0.clientY - g.dragStartY) > 12) {
        g.mode = null;
      }
    }
  };
  const handleTouchEnd = (ev) => {
    const g = gestureRef.current;
    // Tap-to-zoom-in (when zoom===1) and double-tap-reset (when zoomed)
    if (g.mode === 'tap-pending' && ev.changedTouches && ev.changedTouches.length) {
      const t = ev.changedTouches[0];
      const el = containerRef.current;
      const rect = el ? el.getBoundingClientRect() : { left:0, top:0 };
      const localX = t.clientX - rect.left;
      const localY = t.clientY - rect.top;
      const now = performance.now();
      const isDouble = (now - g.lastTapAt < 320 && Math.hypot(t.clientX - g.lastTapX, t.clientY - g.lastTapY) < 40);
      if (isDouble) {
        // Double-tap → reset
        setZoom(1); setPan({x:0,y:0});
        g.lastTapAt = 0;
      } else {
        // Single tap on plan when zoom===1 → zoom in 2× at tap point
        if (zoom <= MIN_Z) zoomAt(2, localX, localY);
        g.lastTapAt = now; g.lastTapX = t.clientX; g.lastTapY = t.clientY;
      }
    }
    if (ev.touches.length === 0) {
      g.mode = null;
      setGestureActive(false);
    } else if (ev.touches.length === 1 && g.mode === 'pinch') {
      // Transition pinch → 1-finger pan
      const t0 = ev.touches[0];
      g.mode = 'pan-touch';
      g.dragStartX = t0.clientX; g.dragStartY = t0.clientY;
      g.startPanX = pan.x; g.startPanY = pan.y;
    }
  };

  // ----- MOUSE -----  (drag-pan when zoomed; click to zoom-in when 1×)
  const handleMouseDown = (ev) => {
    const g = gestureRef.current;
    g.dragStartX = ev.clientX; g.dragStartY = ev.clientY;
    g.startPanX = pan.x; g.startPanY = pan.y;
    if (zoom > MIN_Z) {
      g.mode = 'pan-mouse';
      setGestureActive(true);
    } else {
      g.mode = 'mouse-tap-pending';
    }
  };
  const handleMouseMove = (ev) => {
    const g = gestureRef.current;
    if (g.mode === 'pan-mouse') {
      const dx = ev.clientX - g.dragStartX;
      const dy = ev.clientY - g.dragStartY;
      setPan(clampPan({ x: g.startPanX + dx, y: g.startPanY + dy }, zoom));
    } else if (g.mode === 'mouse-tap-pending') {
      if (Math.hypot(ev.clientX - g.dragStartX, ev.clientY - g.dragStartY) > 6) {
        g.mode = null;
      }
    }
  };
  const handleMouseUp = (ev) => {
    const g = gestureRef.current;
    if (g.mode === 'mouse-tap-pending' && ev) {
      const el = containerRef.current;
      const rect = el ? el.getBoundingClientRect() : { left:0, top:0 };
      zoomAt(2, ev.clientX - rect.left, ev.clientY - rect.top);
    }
    g.mode = null;
    setGestureActive(false);
  };

  // ----- WHEEL + non-passive touchmove ----- (cursor-anchored zoom)
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (ev) => {
      ev.preventDefault();
      const rect = el.getBoundingClientRect();
      const delta = ev.deltaY > 0 ? -0.18 : 0.18;
      const newZoom = Math.max(MIN_Z, Math.min(MAX_Z, zoom * (1 + delta)));
      zoomAt(newZoom, ev.clientX - rect.left, ev.clientY - rect.top);
    };
    const onTM = (ev) => handleTouchMove(ev);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchmove', onTM, { passive: false });
    return () => { el.removeEventListener('wheel', onWheel); el.removeEventListener('touchmove', onTM); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, pan]);

  const stepZoom = (dir) => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    zoomAt(zoom + dir * STEP, r.width/2, r.height/2);
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        flex:'1 1 auto',
        minHeight:330,
        position:'relative',
        background:'linear-gradient(180deg, #fbf7ec 0%, #f0eadb 100%)',
        border:'1px solid var(--line)',
        borderRadius:14,
        overflow:'hidden',
        boxShadow:'inset 0 1px 3px rgba(50,32,12,0.10)',
        cursor: zoom > MIN_Z ? (gestureActive ? 'grabbing' : 'grab') : 'zoom-in',
        touchAction: 'none',
        userSelect:'none',
      }}
    >
      <img src={src} alt={alt} draggable={false}
        style={{
          position:'absolute', inset:0,
          width:'100%', height:'100%',
          objectFit:'contain',
          padding:18,
          filter:'drop-shadow(0 4px 12px rgba(50,32,12,0.10))',
          transform:`translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin:'center',
          transition: gestureActive ? 'none' : 'transform 260ms cubic-bezier(0.22,1,0.36,1)',
          willChange:'transform',
          pointerEvents:'none',
        }}/>

      {/* corner badge — block tag (fades when zoomed so it doesn't obstruct) */}
      <div className="mono" style={{
        position:'absolute', top:14, left:14,
        padding:'6px 11px', borderRadius:100,
        background:'rgba(255,250,235,0.92)',
        border:'1px solid var(--gold)',
        fontSize:11, letterSpacing:'0.24em', color:'var(--gold-deep)',
        opacity: zoom > MIN_Z ? 0.0 : 1,
        transition:'opacity 200ms ease',
        pointerEvents:'none',
      }}>BLOCK {block}</div>

      {/* zoom controls — bottom-right, large enough for tablet taps */}
      <div style={{
        position:'absolute', bottom:14, right:14, display:'flex', gap:7, zIndex:5,
      }}>
        <button onClick={(e)=>{e.stopPropagation(); stepZoom(-1);}}
                onMouseDown={(e)=>e.stopPropagation()}
                onTouchStart={(e)=>e.stopPropagation()}
                className="mono" style={zoomBtnSty}>−</button>
        <div className="mono" style={{
          padding:'0 16px', borderRadius:100,
          background:'rgba(20,16,11,0.88)',
          border:'1px solid rgba(232,215,168,0.30)',
          color:'rgba(232,215,168,0.96)',
          fontSize:13, letterSpacing:'0.16em',
          minWidth: 70, height:50,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontVariantNumeric:'tabular-nums',
        }}>{Math.round(zoom*100)}%</div>
        <button onClick={(e)=>{e.stopPropagation(); stepZoom(+1);}}
                onMouseDown={(e)=>e.stopPropagation()}
                onTouchStart={(e)=>e.stopPropagation()}
                className="mono" style={zoomBtnSty}>+</button>
        <button onClick={(e)=>{e.stopPropagation(); setZoom(1); setPan({x:0,y:0});}}
                onMouseDown={(e)=>e.stopPropagation()}
                onTouchStart={(e)=>e.stopPropagation()}
                className="mono"
                style={{...zoomBtnSty, width:'auto', padding:'0 16px', fontSize:11, letterSpacing:'0.20em'}}>RESET</button>
      </div>

      {/* hint pill — bottom-left */}
      {zoom <= MIN_Z && (
        <div className="mono" style={{
          position:'absolute', bottom:24, left:18,
          padding:'9px 16px', borderRadius:100,
          background:'rgba(20,16,11,0.55)',
          border:'1px solid rgba(232,215,168,0.20)',
          color:'rgba(232,215,168,0.92)',
          fontSize:11, letterSpacing:'0.30em', textTransform:'uppercase',
          pointerEvents:'none',
        }}>Tap or pinch to zoom</div>
      )}
    </div>
  );
}

const zoomBtnSty = {
  width:50, height:50, borderRadius:'50%',
  background:'rgba(20,16,11,0.88)',
  border:'1px solid rgba(232,215,168,0.32)',
  color:'rgba(232,215,168,0.98)',
  fontSize:22, fontWeight:600,
  display:'flex', alignItems:'center', justifyContent:'center',
  cursor:'pointer',
  boxShadow:'0 4px 14px rgba(20,16,11,0.30)',
  WebkitTapHighlightColor:'transparent',
};

function WinnerCell({ m, dens = 0 }) {
  const d = dens;
  const tied = m.winner === null;
  const aWin = m.winner === 'A';
  return (
    <div style={{
      padding:dlerp(d,17,22)+'px '+dlerp(d,21,25)+'px', borderRadius:15,
      background:'var(--ivory-2)', border:'1px solid var(--line)',
      display:'flex', flexDirection:'column', gap:dlerp(d,9,12),
    }}>
      <div className="mono" style={{fontSize:dlerp(d,12,15), letterSpacing:'0.28em', color:'var(--slate)'}}>{m.k}</div>

      <div style={{display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:9, alignItems:'center'}}>
        {/* A side */}
        <div style={{textAlign:'left'}}>
          <div className="serif" style={{
            fontSize: aWin ? dlerp(d,22,27) : dlerp(d,18,22),
            fontWeight: aWin ? 500 : 400,
            color: aWin ? 'var(--gold-deep)' : 'var(--graphite)',
            fontVariantNumeric:'tabular-nums', lineHeight:1.05,
            transition:'all 240ms',
          }}>{m.fmt(m.av)}</div>
          {!tied && (
            <div className="mono" style={{fontSize:10, letterSpacing:'0.20em', color: aWin ? 'var(--gold-deep)' : 'var(--slate)', marginTop:4}}>
              {aWin ? m.winnerNote.toUpperCase() : m.loserNote.toUpperCase()}
            </div>
          )}
        </div>

        {/* arrow / equal */}
        <div style={{
          width:30, height:30, borderRadius:'50%',
          background: tied ? 'var(--ivory)' : 'linear-gradient(160deg, var(--gold-soft) 0%, var(--gold-deep) 100%)',
          display:'flex', alignItems:'center', justifyContent:'center',
          color: tied ? 'var(--slate)' : '#1a130a',
          fontSize:15, fontWeight:700,
          boxShadow: tied ? 'none' : '0 5px 11px rgba(176,138,63,0.40)',
        }}>{tied ? '=' : (aWin ? '<' : '>')}</div>

        {/* B side */}
        <div style={{textAlign:'right'}}>
          <div className="serif" style={{
            fontSize: !aWin && !tied ? dlerp(d,22,27) : dlerp(d,18,22),
            fontWeight: !aWin && !tied ? 500 : 400,
            color: !aWin && !tied ? 'var(--gold-deep)' : 'var(--graphite)',
            fontVariantNumeric:'tabular-nums', lineHeight:1.05,
            transition:'all 240ms',
          }}>{m.fmt(m.bv)}</div>
          {!tied && (
            <div className="mono" style={{fontSize:10, letterSpacing:'0.20em', color: !aWin ? 'var(--gold-deep)' : 'var(--slate)', marginTop:4}}>
              {!aWin ? m.winnerNote.toUpperCase() : m.loserNote.toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SHARED — slider + stat
// ============================================================================
function SliderBig({ label, value, setValue, min, max, step, suffix, trackBg, fixed, dens = 0 }) {
  const d = dens;
  const pct = ((value - min) / (max - min)) * 100;
  const display = fixed != null ? value.toFixed(fixed) : value;
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:dlerp(d,8,11)}}>
        <div className="mono" style={{fontSize:dlerp(d,14.5,18), letterSpacing:'0.30em', color:'var(--gold-deep)'}}>{label.toUpperCase()}</div>
        <div className="serif" style={{fontSize:dlerp(d,38,46), fontWeight:400, color:'var(--ink)', letterSpacing:'-0.01em', lineHeight:1, fontVariantNumeric:'tabular-nums'}}>
          {display}<span style={{fontSize:dlerp(d,21,25), color:'var(--graphite)', fontStyle:'italic', marginLeft:4}}>{suffix}</span>
        </div>
      </div>
      <input className="uni-range" type="range" min={min} max={max} step={step}
        value={value} onChange={e=>setValue(parseFloat(e.target.value))}
        style={{
          // CSS custom prop on the wrapper drives the track-fill gradient
          ['--uni-track']: trackBg(pct),
        }}/>
      <div style={{display:'flex', justifyContent:'space-between', marginTop:6,
                   fontSize:dlerp(d,11.5,14), color:'var(--slate)', fontFamily:'JetBrains Mono, monospace', letterSpacing:'0.22em'}}>
        <span>{min}{suffix.trim()}</span><span>{max}{suffix.trim()}</span>
      </div>
    </div>
  );
}

function Stat2({ k, v, accent, sub, dens = 0 }) {
  const d = dens;
  return (
    <div style={{padding:dlerp(d,19,24)+'px '+dlerp(d,23,26)+'px', background: accent ? 'rgba(216,181,115,0.20)' : 'var(--ivory-2)',
                 border:'1px solid '+(accent ? 'rgba(176,138,63,0.32)' : 'var(--line)'),
                 borderRadius:15}}>
      <div className="mono" style={{fontSize:dlerp(d,12.5,15), letterSpacing:'0.28em', color:'var(--slate)'}}>{k}</div>
      <div className="serif" style={{fontSize:dlerp(d,25,31), fontWeight:400, marginTop:9, color: accent ? 'var(--gold-deep)' : 'var(--ink)', fontVariantNumeric:'tabular-nums', lineHeight:1.1}}>{v}</div>
      {sub && <div className="mono" style={{fontSize:dlerp(d,10.5,13), letterSpacing:'0.20em', color:'var(--slate)', marginTop:5}}>{sub.toUpperCase()}</div>}
    </div>
  );
}

window.Tools = Tools;
