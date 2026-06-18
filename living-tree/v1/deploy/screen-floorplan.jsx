// Floor Plans Screen — Living Tree Sales Suite v2
// Redesigned to match reference: 3-tab bar, VIEW/mode toggle, 6 typology chips,
// side-by-side plan panels with zoom/pan, right-hand PRICE SHEET COMPARISON card.

function FloorPlanScreen({ onBack, navigate }) {

  // ── inject keyframes once ────────────────────────────────────
  React.useEffect(() => {
    if (document.getElementById("fp2-keyframes")) return;
    const s = document.createElement("style");
    s.id = "fp2-keyframes";
    s.textContent = `
      @keyframes fp2FadeIn  { from{opacity:0}              to{opacity:1} }
      @keyframes fp2FadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      @keyframes fp2Scale   { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
      @keyframes fp2Spring  { 0%{transform:scale(0.86)}55%{transform:scale(1.05)}100%{transform:scale(1)} }
      @keyframes fp2Pulse   { 0%,100%{opacity:1}50%{opacity:0.45} }
      @keyframes fp2CountUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

      .fp2-tab    { transition:color .2s,border-color .2s; cursor:pointer; }
      .fp2-tab:hover { opacity:1 !important; }
      .fp2-chip   { transition:all .2s; cursor:pointer; user-select:none; }
      .fp2-chip:hover { box-shadow: 0 0 0 1px rgba(217,178,122,0.5); }
      .fp2-mode   { transition:all .18s; cursor:pointer; }
      .fp2-zbtn   { transition:all .18s; cursor:pointer; }
      .fp2-zbtn:hover:not(:disabled) { background:rgba(217,178,122,0.18) !important; border-color:rgba(217,178,122,0.6) !important; }
      .fp2-zbtn:disabled { opacity:0.3 !important; cursor:not-allowed !important; }
      .fp2-dlbtn  { transition:all .2s; cursor:pointer; }
      .fp2-dlbtn:hover { background:rgba(217,178,122,0.18) !important; }
      .fp2-row    { transition:background .12s; }
      .fp2-row:hover { background:rgba(217,178,122,0.06) !important; }
      .fp2-sth    { cursor:pointer; transition:color .15s; user-select:none; }
      .fp2-sth:hover { color:#d9b27a !important; }
    `;
    document.head.appendChild(s);
  }, []);

  const [tab, setTab] = React.useState("compare"); // compare | price | fsi

  const TABS = [
    { key:"compare", label:"Compare Floor Plans" },
    { key:"price",   label:"Price Sheet" },
    { key:"fsi",     label:"FSI Calculator" },
  ];

  return (
    <ScreenShell
      title="Floor Plans"
      eyebrow="Compare · Price Sheet · FSI Calculator"
      onBack={onBack}
      scroll={false}
      pad={false}
    >
      {/* ── Sub-tab bar ─────────────────────────────────────── */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:46, zIndex:20,
        display:"flex", alignItems:"stretch",
        borderBottom:`1px solid ${THEME.line}`,
        background:"rgba(10,18,13,0.82)", backdropFilter:"blur(12px)",
        padding:"0 32px",
      }}>
        {TABS.map(t => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              className="fp2-tab"
              onClick={() => setTab(t.key)}
              style={{
                background:"none", border:"none", cursor:"pointer",
                color: active ? THEME.gold : "rgba(244,234,216,0.55)",
                fontFamily: THEME.sans, fontSize:11,
                fontWeight: active ? 600 : 400,
                letterSpacing: 1.2,
                textTransform:"uppercase",
                padding:"0 20px",
                borderBottom: active ? `2px solid ${THEME.gold}` : "2px solid transparent",
                marginBottom: -1,
                opacity: active ? 1 : 0.9,
              }}
            >{t.label}</button>
          );
        })}
      </div>

      {/* ── Content area ───────────────────────────────────── */}
      <div style={{
        position:"absolute", top:46, left:0, right:0, bottom:0,
        overflow:"hidden",
      }}>
        {tab === "compare" && <CompareTab />}
        {tab === "price"   && <PriceTab />}
        {tab === "fsi"     && <FSITab />}
      </div>
    </ScreenShell>
  );
}

// ================================================================
// PLAN IMAGE MAP
// ================================================================
const FP_PLAN_IMAGES = {
  "plan-07": "assets/plans/plan-07.jpg",
  "plan-08": "assets/plans/plan-08.jpg",
  "plan-09": "assets/plans/plan-09.jpg",
  "plan-10": "assets/plans/plan-10.jpg",
  "plan-11": "assets/plans/plan-11.jpg",
  "plan-12": "assets/plans/plan-12.jpg",
};

// ================================================================
// Compass Rose SVG
// ================================================================
function CompassRose({ size = 38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 38 38" fill="none"
      style={{ opacity: 0.65 }}>
      <circle cx="19" cy="19" r="17" stroke="rgba(217,178,122,0.35)" strokeWidth="0.8"/>
      <circle cx="19" cy="19" r="13" stroke="rgba(217,178,122,0.2)" strokeWidth="0.5" strokeDasharray="2 3"/>
      {/* N arrow */}
      <polygon points="19,4 21,17 19,14 17,17" fill="#d9b27a" opacity="0.9"/>
      <polygon points="19,34 21,21 19,24 17,21" fill="rgba(244,234,216,0.3)" opacity="0.7"/>
      {/* E/W nubs */}
      <line x1="3" y1="19" x2="8" y2="19" stroke="rgba(217,178,122,0.4)" strokeWidth="0.8"/>
      <line x1="30" y1="19" x2="35" y2="19" stroke="rgba(217,178,122,0.4)" strokeWidth="0.8"/>
      <text x="19" y="2.5" textAnchor="middle" fontSize="5" fill="#d9b27a" fontFamily="Inter,sans-serif" fontWeight="700">N</text>
    </svg>
  );
}

// Small inline icon helpers
function LineIcon({ type, size = 14 }) {
  const s = { stroke:"rgba(217,178,122,0.7)", strokeWidth:1.2, fill:"none", strokeLinecap:"round" };
  const props = { width:size, height:size, viewBox:"0 0 16 16", ...s };
  if (type === "area")    return <svg {...props}><rect x="2" y="2" width="12" height="12" rx="1"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="8" y1="2" x2="8" y2="14"/></svg>;
  if (type === "carpet")  return <svg {...props}><rect x="3" y="3" width="10" height="10" rx="1" strokeDasharray="2 1.5"/></svg>;
  if (type === "balcony") return <svg {...props}><polyline points="2,14 2,6 14,6 14,14"/><line x1="2" y1="10" x2="14" y2="10"/></svg>;
  if (type === "bhk")     return <svg {...props}><rect x="2" y="5" width="12" height="9" rx="1"/><path d="M5 5V4a3 3 0 0 1 6 0v1"/></svg>;
  if (type === "tower")   return <svg {...props}><rect x="5" y="1" width="6" height="14" rx="1"/><rect x="1" y="7" width="4" height="8" rx="1"/><rect x="11" y="7" width="4" height="8" rx="1"/></svg>;
  if (type === "price")   return <svg {...props}><circle cx="8" cy="8" r="6"/><line x1="8" y1="5" x2="8" y2="11"/><line x1="5.5" y1="7" x2="10.5" y2="7"/></svg>;
  if (type === "status")  return <svg {...props}><circle cx="8" cy="8" r="5"/><path d="M5.5 8l2 2 3-3"/></svg>;
  if (type === "doc")     return <svg {...props}><path d="M4 1h6l4 4v10H4V1z"/><line x1="7" y1="1" x2="7" y2="5"/><line x1="7" y1="5" x2="14" y2="5"/><line x1="5" y1="8" x2="11" y2="8"/><line x1="5" y1="11" x2="11" y2="11"/></svg>;
  if (type === "dl")      return <svg {...props}><path d="M8 2v8m0 0l-3-3m3 3l3-3"/><path d="M2 12v2h12v-2"/></svg>;
  if (type === "eff")     return <svg {...props}><path d="M2 12l4-4 3 3 5-7"/></svg>;
  return null;
}

// ================================================================
// TAB 1 — Compare Floor Plans
// ================================================================
function CompareTab() {
  const [mode, setMode]         = React.useState("two");   // single | two | three
  // activeCode: the single typology chip that is selected
  const [activeCode, setActiveCode] = React.useState("2.5BHK");
  const [zooms, setZooms]   = React.useState({ 0:1, 1:1, 2:1 });
  const [pans, setPans]     = React.useState({ 0:{x:0,y:0}, 1:{x:0,y:0}, 2:{x:0,y:0} });
  const dragging            = React.useRef(null);

  const maxPanels = mode === "single" ? 1 : mode === "two" ? 2 : 3;

  React.useEffect(() => {
    setZooms({ 0:1, 1:1, 2:1 });
    setPans({ 0:{x:0,y:0}, 1:{x:0,y:0}, 2:{x:0,y:0} });
  }, [mode]);

  const handleChipClick = (code) => {
    if (TYPOLOGIES.find(t => t.code === code)?.soldOut) return;
    setActiveCode(code);
    setZooms({ 0:1, 1:1, 2:1 }); setPans({ 0:{x:0,y:0}, 1:{x:0,y:0}, 2:{x:0,y:0} });
  };

  // Build the panel slots based on mode — for "two" show East + West of same typology
  const baseTyp = TYPOLOGIES.find(t => t.code === activeCode) || TYPOLOGIES[2];
  const buildPanels = () => {
    if (mode === "single") return [{ typ: baseTyp, facing: "East" }];
    if (mode === "two")    return [{ typ: baseTyp, facing: "East" }, { typ: baseTyp, facing: "West" }];
    // three: show this typology + the two nearest non-sold ones
    const others = TYPOLOGIES.filter(t => !t.soldOut && t.code !== activeCode);
    const extra1 = others[0] || baseTyp;
    const extra2 = others[1] || baseTyp;
    return [
      { typ: baseTyp, facing: "East" },
      { typ: extra1,  facing: "East" },
      { typ: extra2,  facing: "West" },
    ];
  };
  const panels = buildPanels();

  const adjustZoom = (idx, delta) => {
    setZooms(prev => {
      const next = Math.min(4, Math.max(1, (prev[idx] || 1) + delta));
      if (next === 1) setPans(p => ({ ...p, [idx]: {x:0,y:0} }));
      return { ...prev, [idx]: next };
    });
  };

  const handleWheel = (idx, e) => {
    e.preventDefault();
    adjustZoom(idx, e.deltaY < 0 ? 0.25 : -0.25);
  };

  const handleMouseDown = (idx, e) => {
    if (zooms[idx] <= 1) return;
    dragging.current = { idx, startX:e.clientX, startY:e.clientY, startPan:{ ...pans[idx] } };
  };
  const handleMouseMove = (e) => {
    if (!dragging.current) return;
    const { idx, startX, startY, startPan } = dragging.current;
    setPans(prev => ({ ...prev, [idx]: { x: startPan.x + (e.clientX - startX), y: startPan.y + (e.clientY - startY) } }));
  };
  const handleMouseUp = () => { dragging.current = null; };

  // Layout split: left panels + right price-sheet card (only in compare-2 mode)
  const showRightCard = mode === "two";

  return (
    <div
      style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}
      onPointerMove={handleMouseMove}
      onPointerUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* ── Controls row ──────────────────────────────────── */}
      <div style={{
        flexShrink:0, padding:"10px 28px 9px",
        display:"flex", alignItems:"center", gap:18,
        borderBottom:`1px solid ${THEME.lineSoft}`,
        background:"rgba(10,18,13,0.5)",
      }}>
        {/* VIEW label */}
        <span style={{
          fontSize:9, letterSpacing:3, textTransform:"uppercase",
          color:"rgba(244,234,216,0.4)", fontFamily:THEME.sans,
        }}>View</span>

        {/* Mode toggle */}
        <div style={{
          display:"flex", borderRadius:999, overflow:"hidden",
          border:`1px solid ${THEME.line}`,
          background:"rgba(10,18,13,0.6)",
        }}>
          {[
            { key:"single", icon:"□",  label:"Single" },
            { key:"two",    icon:"⊟",  label:"Compare 2" },
            { key:"three",  icon:"⊞",  label:"Compare 3" },
          ].map(m => (
            <button
              key={m.key}
              className="fp2-mode"
              onClick={() => setMode(m.key)}
              style={{
                background: mode === m.key ? THEME.gold : "transparent",
                color: mode === m.key ? THEME.ink : "rgba(244,234,216,0.6)",
                border:"none", padding:"6px 16px",
                fontFamily:THEME.sans, fontSize:10.5, fontWeight: mode === m.key ? 700 : 400,
                letterSpacing:0.4, display:"flex", alignItems:"center", gap:5,
              }}
            >
              <span style={{ fontSize:12, lineHeight:1, opacity:0.8 }}>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>

        <div style={{ width:1, height:24, background:THEME.lineSoft }} />

        {/* Typology chips */}
        <div style={{ display:"flex", gap:7, flexWrap:"nowrap" }}>
          {TYPOLOGIES.map(t => {
            const active = t.code === activeCode;
            return (
              <div
                key={t.code}
                className="fp2-chip"
                onClick={() => !t.soldOut && handleChipClick(t.code)}
                style={{
                  padding:"5px 13px 5px 9px",
                  borderRadius:999,
                  border:`1px solid ${active ? THEME.gold : THEME.line}`,
                  background: active ? "rgba(217,178,122,0.12)" : "transparent",
                  display:"flex", alignItems:"center", gap:6,
                  fontSize:10.5, fontWeight: active ? 600 : 400,
                  color: t.soldOut ? "rgba(244,234,216,0.35)" : active ? THEME.cream : "rgba(244,234,216,0.65)",
                  cursor: t.soldOut ? "default" : "pointer",
                  opacity: t.soldOut ? 0.7 : 1,
                  flexShrink: 0,
                }}
              >
                {active && !t.soldOut && (
                  <span style={{
                    width:6, height:6, borderRadius:"50%",
                    background:THEME.gold, flexShrink:0,
                    animation:"fp2Spring .4s ease",
                  }}/>
                )}
                <span>{t.name}</span>
                {t.soldOut && (
                  <span style={{
                    fontSize:8, letterSpacing:0.8, textTransform:"uppercase",
                    background:"rgba(217,178,122,0.15)",
                    border:"1px solid rgba(217,178,122,0.25)",
                    borderRadius:3, padding:"1px 5px",
                    color:"rgba(217,178,122,0.55)",
                    marginLeft:2,
                  }}>SOLD</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main panels row ───────────────────────────────── */}
      <div style={{
        flex:1, display:"flex", gap:0, overflow:"hidden",
        minHeight:0,
      }}>
        {/* Left: plan panels */}
        <div style={{
          flex: showRightCard ? "0 0 calc(100% - 298px)" : "1",
          display:"flex", overflow:"hidden",
          borderRight: showRightCard ? `1px solid ${THEME.line}` : "none",
        }}>
          {panels.map((panel, idx) => (
            <FpPanelNew
              key={panel.typ.code + "-" + panel.facing + "-" + idx + "-" + mode}
              typ={panel.typ}
              facing={panel.facing}
              idx={idx}
              total={maxPanels}
              zoom={zooms[idx] || 1}
              pan={pans[idx] || {x:0,y:0}}
              onZoomIn={()  => adjustZoom(idx, 0.3)}
              onZoomOut={() => adjustZoom(idx, -0.3)}
              onWheel={(e)  => handleWheel(idx, e)}
              onPointerDown={(e) => handleMouseDown(idx, e)}
            />
          ))}
        </div>

        {/* Right: price-sheet comparison card */}
        {showRightCard && (
          <PriceComparisonCard typ={baseTyp} />
        )}
      </div>

      {/* ── Footer disclaimer ─────────────────────────────── */}
      <div style={{
        flexShrink:0, padding:"7px 0",
        textAlign:"center",
        fontSize:9.5, color:"rgba(244,234,216,0.28)", letterSpacing:0.3,
        borderTop:`1px solid ${THEME.lineSoft}`,
        background:"rgba(10,18,13,0.5)",
      }}>
        *Prices are indicative and subject to change without prior notice.
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Individual Plan Panel
// ────────────────────────────────────────────────────────────────
function FpPanelNew({ typ, facing, idx, total, zoom, pan, onZoomIn, onZoomOut, onWheel, onPointerDown }) {
  const imgSrc = FP_PLAN_IMAGES[typ.plan] || "";
  const towerShort = typ.tower.split(" · ")[0];
  const facingLabel = facing || (idx === 0 ? "East" : "West");
  const facingData = facingLabel === "East" ? typ.east : typ.west;

  return (
    <div style={{
      flex:1,
      display:"flex", flexDirection:"column",
      borderLeft: idx > 0 ? `1px solid ${THEME.lineSoft}` : "none",
      overflow:"hidden",
      animation:"fp2Scale .38s cubic-bezier(0.34,1.1,0.64,1)",
      minWidth:0,
    }}>
      {/* Image area */}
      <div
        style={{
          flex:1, position:"relative", overflow:"hidden",
          background: "rgba(8,15,11,0.85)",
          minHeight:0,
        }}
        onWheel={onWheel}
      >
        {/* Typology badge — top left */}
        <div style={{
          position:"absolute", top:14, left:14, zIndex:10,
          pointerEvents:"none",
        }}>
          <div style={{
            display:"inline-block",
            background:"rgba(9,16,11,0.88)", backdropFilter:"blur(10px)",
            border:`1px solid ${THEME.line}`, borderRadius:8,
            padding:"6px 12px",
          }}>
            <div style={{
              fontSize:8, letterSpacing:2, textTransform:"uppercase",
              color:THEME.gold, marginBottom:3,
            }}>Typology</div>
            <div style={{
              fontFamily:THEME.serif, fontSize:16, fontWeight:500,
              color:THEME.cream, letterSpacing:0.2, lineHeight:1,
            }}>{typ.name}</div>
            <div style={{
              fontSize:9, color:"rgba(244,234,216,0.5)", marginTop:4, letterSpacing:0.5,
            }}>Tower · {towerShort} · {facingLabel} Facing</div>
          </div>
        </div>

        {/* Compass — top right */}
        <div style={{ position:"absolute", top:14, right:14, zIndex:10, pointerEvents:"none" }}>
          <CompassRose size={40} />
        </div>

        {/* Plan image — zoomable / pannable */}
        <div
          className="fp-pan-area"
          style={{
            width:"100%", height:"100%",
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor: zoom > 1 ? "grab" : "default",
          }}
          onPointerDown={onPointerDown}
        >
          <img
            src={imgSrc}
            alt={typ.name}
            draggable={false}
            style={{
              maxWidth:"86%", maxHeight:"86%",
              objectFit:"contain",
              transform:`scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              transformOrigin:"center center",
              transition: zoom === 1 ? "transform 0.35s cubic-bezier(0.34,1.2,0.64,1)" : "none",
              userSelect:"none",
              filter:"brightness(1.06) contrast(1.05)",
            }}
          />
        </div>

        {/* Zoom controls — right side (vertical stacked circles) */}
        <div style={{
          position:"absolute", top:"50%", right:14, transform:"translateY(-50%)",
          display:"flex", flexDirection:"column", gap:6, zIndex:10,
        }}>
          {[
            { label:"+", action:onZoomIn,  disabled:zoom >= 4 },
            { label:"−", action:onZoomOut, disabled:zoom <= 1 },
          ].map(btn => (
            <button
              key={btn.label}
              className="fp2-zbtn"
              onClick={btn.action}
              disabled={btn.disabled}
              style={{
                width:30, height:30, borderRadius:"50%",
                border:`1px solid ${THEME.line}`,
                background:"rgba(9,16,11,0.85)", backdropFilter:"blur(8px)",
                color: btn.disabled ? "rgba(244,234,216,0.2)" : THEME.cream,
                fontSize:18, fontWeight:300, lineHeight:1,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}
            >{btn.label}</button>
          ))}
          {zoom > 1 && (
            <button
              className="fp2-zbtn"
              onClick={() => { onZoomOut(); onZoomOut(); onZoomOut(); onZoomOut(); onZoomOut(); }}
              style={{
                fontSize:8, letterSpacing:0.5, textTransform:"uppercase",
                color:THEME.gold, background:"rgba(9,16,11,0.85)",
                border:`1px solid ${THEME.lineSoft}`, borderRadius:4,
                padding:"3px 5px",
              }}
            >Reset</button>
          )}
        </div>

        {/* Sold-out overlay */}
        {typ.soldOut && (
          <div style={{
            position:"absolute", inset:0, zIndex:5,
            background:"rgba(10,18,13,0.58)",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <div style={{
              padding:"8px 22px", borderRadius:999,
              background:"rgba(217,178,122,0.1)",
              border:`1px solid ${THEME.lineStrong}`,
              fontSize:11, letterSpacing:2.5, textTransform:"uppercase",
              color:THEME.gold, fontWeight:600,
            }}>Sold Out</div>
          </div>
        )}
      </div>

      {/* Bottom spec strip */}
      <div style={{
        flexShrink:0, padding:"10px 16px 12px",
        background:"rgba(11,19,14,0.95)",
        borderTop:`1px solid ${THEME.lineSoft}`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        gap:8,
      }}>
        {/* 3 area cols */}
        <div style={{ display:"flex", gap:0, flex:1 }}>
          {[
            { icon:"area",    label:"Saleable",  val:`${facingData.saleable} sft` },
            { icon:"carpet",  label:"Carpet",    val:`${facingData.carpet} sft` },
            { icon:"balcony", label:"Balcony",   val:`${facingData.balcony.toFixed(0)} sft` },
          ].map((col, ci) => (
            <div key={col.label} style={{
              flex:1, paddingLeft: ci > 0 ? 12 : 0,
              borderLeft: ci > 0 ? `1px solid ${THEME.lineSoft}` : "none",
              display:"flex", alignItems:"center", gap:7,
            }}>
              <div style={{ opacity:0.55 }}><LineIcon type={col.icon} size={13}/></div>
              <div>
                <div style={{
                  fontSize:8, letterSpacing:1.5, textTransform:"uppercase",
                  color:"rgba(244,234,216,0.4)", marginBottom:2,
                }}>{col.label}</div>
                <div style={{
                  fontFamily:THEME.serif, fontSize:13, fontWeight:500,
                  color:THEME.cream,
                }}>{col.val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Starting price box */}
        <div style={{
          border:`1px solid ${THEME.lineStrong}`,
          borderRadius:8, padding:"6px 14px",
          textAlign:"center", flexShrink:0,
          background:"rgba(217,178,122,0.05)",
        }}>
          <div style={{
            fontSize:8, letterSpacing:2, textTransform:"uppercase",
            color:"rgba(244,234,216,0.45)", marginBottom:3,
          }}>Starting Price</div>
          <div style={{
            fontFamily:THEME.serif, fontSize:17, fontWeight:500,
            color:THEME.gold, lineHeight:1,
          }}>{formatINR(typ.priceFrom)}*</div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Right-hand Price Sheet Comparison card
// ────────────────────────────────────────────────────────────────
function PriceComparisonCard({ typ }) {
  if (!typ) return null;

  const rows = [
    { icon:"bhk",    label:"BHK",          va: typ.bhk % 1 === 0 ? typ.bhk.toFixed(0) : typ.bhk.toFixed(1),
                                            vb: typ.bhk % 1 === 0 ? typ.bhk.toFixed(0) : typ.bhk.toFixed(1) },
    { icon:"area",   label:"Saleable (E)",  va: `${typ.east.saleable} sft`,  vb: `${typ.west.saleable} sft` },
    { icon:"carpet", label:"Carpet (E)",    va: `${typ.east.carpet} sft`,    vb: `${typ.west.carpet} sft` },
    { icon:"balcony",label:"Balcony",       va: `${typ.east.balcony.toFixed(0)} sft`, vb: `${typ.west.balcony.toFixed(0)} sft` },
    { icon:"eff",    label:"Efficiency (E)",va: ((typ.east.carpet/typ.east.saleable)*100).toFixed(1)+"%",
                                            vb: ((typ.west.carpet/typ.west.saleable)*100).toFixed(1)+"%" },
    { icon:"price",  label:"Price From",    va: formatINR(typ.priceFrom), vb: formatINR(typ.priceFrom), gold:true },
    { icon:"tower",  label:"Tower",         va: typ.tower.split(" · ")[0], vb: typ.tower.split(" · ")[0] },
    { icon:"status", label:"Status",        va: typ.soldOut ? "Sold Out":"Available", vb: typ.soldOut ? "Sold Out":"Available", isStatus:true },
  ];

  const towerName = typ.tower.split(" · ")[0].toUpperCase();
  const lowestPrice = typ.priceFrom;

  return (
    <div style={{
      width:298, flexShrink:0,
      display:"flex", flexDirection:"column", justifyContent:"space-between",
      overflowY:"auto", overflowX:"hidden",
      background:"rgba(10,17,13,0.97)",
      animation:"fp2FadeIn .4s ease",
    }}>
      {/* Card header */}
      <div style={{
        padding:"16px 18px 12px",
        borderBottom:`1px solid ${THEME.line}`,
        flexShrink:0,
      }}>
        <div style={{
          display:"flex", alignItems:"center", gap:8, marginBottom:2,
        }}>
          <LineIcon type="doc" size={15} />
          <span style={{
            fontFamily:THEME.sans, fontSize:9, letterSpacing:2.5,
            textTransform:"uppercase", color:THEME.gold, fontWeight:600,
          }}>Price Sheet Comparison</span>
        </div>
      </div>

      {/* Column headers */}
      <div style={{
        display:"grid", gridTemplateColumns:"90px 1fr 1fr",
        padding:"8px 12px",
        background:"rgba(217,178,122,0.05)",
        borderBottom:`1px solid ${THEME.lineSoft}`,
        flexShrink:0,
      }}>
        <div/>
        {[
          `${towerName}\nEAST FACING`,
          `${towerName}\nWEST FACING`,
        ].map((h, i) => (
          <div key={i} style={{
            fontSize:7.5, letterSpacing:1.2, textTransform:"uppercase",
            color:THEME.cream, fontWeight:600, lineHeight:1.4,
            whiteSpace:"pre-line", textAlign:"center",
          }}>{h}</div>
        ))}
      </div>

      {/* Rows */}
      <div style={{ flex:"0 0 auto" }}>
        {rows.map((row, ri) => (
          <div
            key={row.label}
            className="fp2-row"
            style={{
              display:"grid", gridTemplateColumns:"90px 1fr 1fr",
              padding:"7px 12px",
              borderBottom:`1px solid ${THEME.lineSoft}`,
              background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.016)",
            }}
          >
            {/* label */}
            <div style={{
              display:"flex", alignItems:"center", gap:6,
            }}>
              <div style={{ opacity:0.5 }}><LineIcon type={row.icon} size={12}/></div>
              <span style={{
                fontSize:9.5, color:"rgba(244,234,216,0.5)", letterSpacing:0.3,
              }}>{row.label}</span>
            </div>
            {/* val a */}
            <div style={{ textAlign:"center" }}>
              {row.isStatus ? (
                <span style={{
                  fontSize:9.5, fontWeight:500,
                  color: row.va === "Available" ? THEME.green : "rgba(217,178,122,0.45)",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:4,
                }}>
                  <span style={{
                    width:5, height:5, borderRadius:"50%",
                    background: row.va === "Available" ? THEME.green : "rgba(217,178,122,0.4)",
                    display:"inline-block",
                  }}/>
                  {row.va}
                </span>
              ) : (
                <span style={{
                  fontFamily: row.gold ? THEME.serif : THEME.sans,
                  fontSize: row.gold ? 13.5 : 10.5,
                  color: row.gold ? THEME.gold : THEME.cream,
                  fontWeight: row.gold ? 500 : 400,
                }}>{row.va}</span>
              )}
            </div>
            {/* val b */}
            <div style={{ textAlign:"center" }}>
              {row.isStatus ? (
                <span style={{
                  fontSize:9.5, fontWeight:500,
                  color: row.vb === "Available" ? THEME.green : "rgba(217,178,122,0.45)",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:4,
                }}>
                  <span style={{
                    width:5, height:5, borderRadius:"50%",
                    background: row.vb === "Available" ? THEME.green : "rgba(217,178,122,0.4)",
                    display:"inline-block",
                  }}/>
                  {row.vb}
                </span>
              ) : (
                <span style={{
                  fontFamily: row.gold ? THEME.serif : THEME.sans,
                  fontSize: row.gold ? 13.5 : 10.5,
                  color: row.gold ? THEME.gold : THEME.cream,
                  fontWeight: row.gold ? 500 : 400,
                }}>{row.vb}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Starting price banner */}
      <div style={{
        flexShrink:0, padding:"12px 16px",
        borderTop:`1px solid ${THEME.line}`,
        background:"rgba(10,18,13,0.92)",
      }}>
        <div style={{
          fontSize:8, letterSpacing:2.5, textTransform:"uppercase",
          color:"rgba(244,234,216,0.45)", marginBottom:4,
        }}>Starting Price — Onwards</div>
        <div style={{
          fontFamily:THEME.serif, fontSize:22, fontWeight:400,
          color:THEME.gold, letterSpacing:0.2, lineHeight:1.1,
        }}>
          {formatINR(lowestPrice)}*
        </div>

        {/* Download button */}
        <button
          className="fp2-dlbtn"
          style={{
            marginTop:12, width:"100%",
            background:"transparent",
            border:`1px solid ${THEME.lineStrong}`,
            borderRadius:8, padding:"9px 0",
            color:THEME.gold, fontFamily:THEME.sans,
            fontSize:10.5, letterSpacing:1, fontWeight:600,
            display:"flex", alignItems:"center", justifyContent:"center", gap:7,
            cursor:"pointer",
          }}
        >
          <LineIcon type="dl" size={13}/>
          Download Price Sheet
        </button>
      </div>
    </div>
  );
}


// ================================================================
// TAB 2 — Price Sheet (full table of all 6 typologies)
// ================================================================
function PriceTab() {
  const [sortKey, setSortKey] = React.useState("priceFrom");
  const [sortDir, setSortDir] = React.useState(1);

  const doSort = (key) => {
    if (sortKey === key) setSortDir(d => -d);
    else { setSortKey(key); setSortDir(1); }
  };

  const sorted = React.useMemo(() => {
    return [...TYPOLOGIES].sort((a, b) => {
      let av, bv;
      if (sortKey === "priceFrom")    { av = a.priceFrom;      bv = b.priceFrom; }
      else if (sortKey === "saleable") { av = a.east.saleable; bv = b.east.saleable; }
      else if (sortKey === "carpet")   { av = a.east.carpet;   bv = b.east.carpet; }
      else if (sortKey === "bhk")      { av = a.bhk;           bv = b.bhk; }
      else { av = 0; bv = 0; }
      return (av - bv) * sortDir;
    });
  }, [sortKey, sortDir]);

  const THstyle = (col) => ({
    padding:"10px 16px",
    textAlign:"left",
    fontSize:9, letterSpacing:2, textTransform:"uppercase",
    color: sortKey === col ? THEME.gold : "rgba(244,234,216,0.45)",
    fontWeight:600,
    borderBottom:`1px solid ${THEME.line}`,
    whiteSpace:"nowrap",
  });

  const SortArrow = ({ col }) => {
    if (sortKey !== col) return <span style={{ opacity:0.2, marginLeft:4 }}>⇅</span>;
    return <span style={{ color:THEME.gold, marginLeft:4 }}>{sortDir === 1 ? "↑" : "↓"}</span>;
  };

  return (
    <div style={{
      width:"100%", height:"100%", overflowY:"auto",
      padding:"28px 36px 48px",
    }}>
      {/* Header */}
      <div style={{ marginBottom:24, animation:"fp2FadeUp .5s ease" }}>
        <div style={{
          fontFamily:THEME.serif, fontSize:30, fontWeight:400,
          color:THEME.cream, letterSpacing:0.2, marginBottom:5,
        }}>
          Residence Price Sheet
          <em style={{ color:THEME.gold, fontStyle:"italic", marginLeft:10, fontSize:26 }}>2024</em>
        </div>
        <div style={{ fontSize:10.5, color:THEME.dim, display:"flex", alignItems:"center", gap:10 }}>
          <span style={{
            width:5, height:5, borderRadius:"50%",
            background:THEME.green, boxShadow:`0 0 6px ${THEME.green}`,
            display:"inline-block", animation:"fp2Pulse 1.8s ease-in-out infinite",
          }}/>
          Prices indicative for North Bangalore micro-market — confirm with Kalyani sales. Click columns to sort.
        </div>
      </div>

      {/* Legend */}
      <div style={{ display:"flex", gap:16, marginBottom:18, animation:"fp2FadeUp .5s ease .1s backwards" }}>
        {[
          { color:THEME.green, label:"Available" },
          { color:"rgba(217,178,122,0.38)", label:"Sold Out" },
        ].map(l => (
          <div key={l.label} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:l.color, display:"inline-block" }}/>
            <span style={{ fontSize:10, color:THEME.dim, letterSpacing:0.5 }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background:"rgba(13,21,16,0.85)",
        border:`1px solid ${THEME.line}`,
        borderRadius:12, overflow:"hidden",
        animation:"fp2FadeUp .5s ease .15s backwards",
      }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"rgba(217,178,122,0.04)" }}>
              <th className="fp2-sth" onClick={() => doSort("bhk")} style={{...THstyle("bhk"), width:210}}>Type <SortArrow col="bhk"/></th>
              <th className="fp2-sth" onClick={() => doSort("bhk")} style={{...THstyle("bhk"), textAlign:"center"}}>BHK <SortArrow col="bhk"/></th>
              <th className="fp2-sth" onClick={() => doSort("saleable")} style={{...THstyle("saleable"), textAlign:"center"}}>Saleable (E/W) sft <SortArrow col="saleable"/></th>
              <th className="fp2-sth" onClick={() => doSort("carpet")} style={{...THstyle("carpet"), textAlign:"center"}}>Carpet (E/W) sft <SortArrow col="carpet"/></th>
              <th style={{ ...THstyle(null), textAlign:"center" }}>Balcony</th>
              <th style={{ ...THstyle(null), textAlign:"center" }}>Tower</th>
              <th className="fp2-sth" onClick={() => doSort("priceFrom")} style={{...THstyle("priceFrom"), textAlign:"right"}}>Price From <SortArrow col="priceFrom"/></th>
              <th style={{ ...THstyle(null), textAlign:"center" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t, i) => {
              const effE = ((t.east.carpet / t.east.saleable) * 100).toFixed(1);
              return (
                <tr
                  key={t.code}
                  className="fp2-row"
                  style={{
                    background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.016)",
                    borderBottom: i < sorted.length - 1 ? `1px solid ${THEME.lineSoft}` : "none",
                    animation:`fp2FadeUp .4s ease ${0.05 * i + 0.2}s backwards`,
                  }}
                >
                  <td style={{ padding:"13px 16px" }}>
                    <div style={{ fontFamily:THEME.serif, fontSize:17, fontWeight:500, color:THEME.cream }}>{t.name}</div>
                    <div style={{ fontSize:9.5, color:THEME.dim, marginTop:2, lineHeight:1.4 }}>{t.summary.slice(0,55)}{t.summary.length > 55 ? "…" : ""}</div>
                  </td>
                  <td style={{ padding:"13px 16px", textAlign:"center" }}>
                    <span style={{
                      display:"inline-block",
                      background:"rgba(217,178,122,0.1)", border:`1px solid ${THEME.line}`,
                      borderRadius:999, padding:"3px 11px",
                      fontFamily:THEME.serif, fontSize:14, color:THEME.cream,
                    }}>{t.bhk % 1 === 0 ? t.bhk.toFixed(0) : t.bhk.toFixed(1)}</span>
                  </td>
                  <td style={{ padding:"13px 16px", textAlign:"center" }}>
                    <div style={{ fontSize:12, fontWeight:500, color:THEME.cream }}>
                      {t.east.saleable.toLocaleString()} / {t.west.saleable.toLocaleString()}
                    </div>
                  </td>
                  <td style={{ padding:"13px 16px", textAlign:"center" }}>
                    <div style={{ fontSize:12, color:THEME.cream }}>{t.east.carpet.toLocaleString()} / {t.west.carpet.toLocaleString()}</div>
                    <div style={{ fontSize:9, color:THEME.gold, marginTop:2, letterSpacing:0.4 }}>{effE}% eff.</div>
                  </td>
                  <td style={{ padding:"13px 16px", textAlign:"center" }}>
                    <span style={{ fontSize:12, color:THEME.cream }}>{t.east.balcony.toFixed(0)}</span>
                  </td>
                  <td style={{ padding:"13px 16px", textAlign:"center" }}>
                    <div style={{ fontSize:10, color:THEME.dim, maxWidth:120, margin:"0 auto", lineHeight:1.4 }}>
                      {t.tower.split(" · ")[0]}
                    </div>
                  </td>
                  <td style={{ padding:"13px 16px", textAlign:"right" }}>
                    <div style={{ fontFamily:THEME.serif, fontSize:20, fontWeight:500, color:THEME.gold }}>{formatINR(t.priceFrom)}</div>
                    <div style={{ fontSize:9, color:THEME.dim, marginTop:2 }}>{formatINRFull(t.priceFrom)}</div>
                  </td>
                  <td style={{ padding:"13px 16px", textAlign:"center" }}>
                    {t.soldOut ? (
                      <span style={{
                        display:"inline-block", padding:"4px 12px", borderRadius:999,
                        background:"rgba(217,178,122,0.07)", border:`1px solid rgba(217,178,122,0.25)`,
                        fontSize:9, letterSpacing:1, textTransform:"uppercase",
                        color:"rgba(217,178,122,0.5)", fontWeight:600,
                      }}>Sold Out</span>
                    ) : (
                      <span style={{
                        display:"inline-block", padding:"4px 12px", borderRadius:999,
                        background:"rgba(127,185,85,0.09)", border:`1px solid rgba(127,185,85,0.3)`,
                        fontSize:9, letterSpacing:1, textTransform:"uppercase",
                        color:THEME.green, fontWeight:600,
                      }}>Available</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{
        marginTop:18, fontSize:10, color:"rgba(244,234,216,0.3)", letterSpacing:0.3, lineHeight:1.7,
        animation:"fp2FadeUp .5s ease .45s backwards",
      }}>
        * All areas are approximate. Prices indicative, may change. E = East-facing, W = West-facing. RERA: {PROJECT.rera}
      </div>
    </div>
  );
}


// ================================================================
// TAB 3 — FSI Calculator
// ================================================================
function FSITab() {
  const [plotArea,  setPlotArea]  = React.useState(1200);
  const [fsiRatio,  setFsiRatio]  = React.useState(2.5);
  const [groundCov, setGroundCov] = React.useState(40);
  const [selTyp,    setSelTyp]    = React.useState("3BHK-LUXE");

  const selectedTyp = TYPOLOGIES.find(t => t.code === selTyp) || TYPOLOGIES[5];

  const maxBuiltUp      = plotArea * fsiRatio;
  const groundFootprint = (plotArea * groundCov) / 100;
  const numFloors       = maxBuiltUp / groundFootprint;
  const avgSaleable     = (selectedTyp.east.saleable + selectedTyp.west.saleable) / 2;
  const avgCarpet       = (selectedTyp.east.carpet + selectedTyp.west.carpet) / 2;
  const loadFactor      = avgSaleable / avgCarpet;
  const efficiencyPct   = (avgCarpet / avgSaleable * 100).toFixed(1);
  const sqmPerUnit      = avgSaleable * 0.0929;
  const maxUnits        = Math.floor(maxBuiltUp / sqmPerUnit);
  const carpetBar       = (avgCarpet / avgSaleable) * 100;

  const SliderField = ({ label, value, min, max, step, onChange, unit, decimals = 0 }) => (
    <div style={{ marginBottom:22 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:9 }}>
        <span style={{ fontSize:10.5, letterSpacing:1.5, textTransform:"uppercase", color:THEME.dim }}>{label}</span>
        <span style={{ fontFamily:THEME.serif, fontSize:21, fontWeight:500, color:THEME.cream }}>
          {decimals > 0 ? value.toFixed(decimals) : value.toLocaleString()}
          <span style={{ fontSize:11, color:THEME.gold, marginLeft:5 }}>{unit}</span>
        </span>
      </div>
      <div style={{ position:"relative", height:4, borderRadius:999, background:THEME.lineSoft }}>
        <div style={{
          position:"absolute", left:0, top:0, height:"100%",
          width:`${((value - min) / (max - min)) * 100}%`,
          background:`linear-gradient(90deg, ${THEME.goldDeep}, ${THEME.gold})`,
          borderRadius:999, transition:"width .15s",
        }}/>
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            position:"absolute", top:"50%", left:0, right:0,
            transform:"translateY(-50%)", width:"100%", margin:0, padding:0,
            height:20, opacity:0, cursor:"pointer",
          }}
        />
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:5, fontSize:8.5, color:"rgba(244,234,216,0.28)" }}>
        <span>{min.toLocaleString()}</span><span>{max.toLocaleString()}</span>
      </div>
    </div>
  );

  const ResultCard = ({ label, value, unit, sub, highlight }) => (
    <div style={{
      background: highlight ? "rgba(217,178,122,0.1)" : "rgba(13,21,16,0.72)",
      border:`1px solid ${highlight ? THEME.lineStrong : THEME.lineSoft}`,
      borderRadius:10, padding:"14px 18px",
      animation:"fp2Scale .3s ease",
    }}>
      <div style={{ fontSize:8.5, letterSpacing:2, textTransform:"uppercase", color: highlight ? THEME.gold : THEME.dim, marginBottom:6 }}>{label}</div>
      <div style={{ fontFamily:THEME.serif, fontSize:26, fontWeight:500, color: highlight ? THEME.gold : THEME.cream, lineHeight:1 }}>
        {value}
        <span style={{ fontSize:12, marginLeft:5, color: highlight ? THEME.gold : THEME.dim }}>{unit}</span>
      </div>
      {sub && <div style={{ fontSize:9, color:THEME.dim, marginTop:5 }}>{sub}</div>}
    </div>
  );

  const EffBar = ({ label, value, unit, fill, color }) => (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontSize:10, color:THEME.dim }}>{label}</span>
        <span style={{ fontFamily:THEME.serif, fontSize:14, color:THEME.cream }}>
          {typeof value === "number" ? value.toLocaleString(undefined, {maximumFractionDigits:0}) : value}
          <span style={{ fontSize:9, color:THEME.dim, marginLeft:4 }}>{unit}</span>
        </span>
      </div>
      <div style={{ height:8, borderRadius:999, background:"rgba(255,255,255,0.05)", position:"relative", overflow:"hidden" }}>
        <div style={{
          position:"absolute", left:0, top:0, height:"100%",
          width:`${Math.min(100, fill)}%`, background:color,
          borderRadius:999, transition:"width .5s cubic-bezier(0.34,1.1,0.64,1)",
        }}/>
      </div>
    </div>
  );

  return (
    <div style={{ width:"100%", height:"100%", overflowY:"auto", padding:"24px 36px 44px" }}>
      {/* Header */}
      <div style={{ marginBottom:22, animation:"fp2FadeUp .5s ease" }}>
        <div style={{ fontFamily:THEME.serif, fontSize:30, fontWeight:400, color:THEME.cream, marginBottom:5 }}>
          FSI &amp; Efficiency
          <em style={{ color:THEME.gold, fontStyle:"italic", marginLeft:10, fontSize:26 }}>Calculator</em>
        </div>
        <div style={{ fontSize:10.5, color:THEME.dim }}>
          Explore permissible built-up area and analyse carpet-to-saleable efficiency for each typology.
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"360px 1fr", gap:28, alignItems:"start" }}>
        {/* Sliders */}
        <div style={{
          background:"rgba(13,21,16,0.8)", border:`1px solid ${THEME.line}`,
          borderRadius:14, padding:"24px 24px 18px",
          animation:"fp2FadeUp .5s ease .1s backwards",
        }}>
          <div style={{ fontSize:8.5, letterSpacing:3, textTransform:"uppercase", color:THEME.gold, marginBottom:22 }}>Plot &amp; FSI Inputs</div>
          <SliderField label="Plot Area"       value={plotArea}  min={200} max={10000} step={50}  onChange={setPlotArea}  unit="sq.m" />
          <SliderField label="Permissible FSI" value={fsiRatio}  min={0.5} max={5}     step={0.1} onChange={setFsiRatio}  unit="ratio" decimals={1} />
          <SliderField label="Ground Coverage" value={groundCov} min={10}  max={70}    step={5}   onChange={setGroundCov} unit="%" />

          <div style={{ marginTop:6, paddingTop:18, borderTop:`1px solid ${THEME.lineSoft}` }}>
            <div style={{ fontSize:8.5, letterSpacing:3, textTransform:"uppercase", color:THEME.gold, marginBottom:12 }}>Typology for Efficiency</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {TYPOLOGIES.map(t => (
                <button
                  key={t.code}
                  className="fp2-chip"
                  onClick={() => setSelTyp(t.code)}
                  style={{
                    background: selTyp === t.code ? "rgba(217,178,122,0.12)" : "transparent",
                    border:`1px solid ${selTyp === t.code ? THEME.gold : THEME.lineSoft}`,
                    color: selTyp === t.code ? THEME.cream : THEME.dim,
                    borderRadius:999, padding:"4px 11px",
                    fontSize:10, fontWeight: selTyp === t.code ? 600 : 400,
                    cursor:"pointer",
                  }}
                >{t.name.replace(" Standard","").replace(" (2.5)","")}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={{ animation:"fp2FadeUp .5s ease .2s backwards" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:22 }}>
            <ResultCard label="Max Built-Up Area" value={maxBuiltUp.toLocaleString(undefined,{maximumFractionDigits:0})} unit="sq.m" sub={`Plot ${plotArea.toLocaleString()} × FSI ${fsiRatio}`} highlight />
            <ResultCard label="Ground Footprint"  value={groundFootprint.toLocaleString(undefined,{maximumFractionDigits:0})} unit="sq.m" sub={`${groundCov}% of ${plotArea.toLocaleString()} sq.m`} />
            <ResultCard label="Approx. Floors"    value={numFloors.toFixed(1)} unit="floors" sub="Built-up ÷ Footprint" />
            <ResultCard label="Max Units"         value={maxUnits.toLocaleString()} unit="units" sub={`Based on ${selectedTyp.name} avg`} highlight />
            <ResultCard label="Avg Saleable"      value={avgSaleable.toLocaleString(undefined,{maximumFractionDigits:0})} unit="sft" sub={selectedTyp.name} />
            <ResultCard label="Load Factor"       value={loadFactor.toFixed(2)} unit="×" sub="Saleable ÷ Carpet" />
          </div>

          {/* Efficiency visual */}
          <div style={{
            background:"rgba(13,21,16,0.72)", border:`1px solid ${THEME.line}`,
            borderRadius:14, padding:"22px 24px",
          }}>
            <div style={{ fontSize:8.5, letterSpacing:3, textTransform:"uppercase", color:THEME.gold, marginBottom:18 }}>
              Carpet vs Saleable — {selectedTyp.name}
            </div>
            <EffBar label="Saleable Area" value={avgSaleable} unit="sft" fill={100} color={THEME.gold} />
            <EffBar label="Carpet Area"   value={avgCarpet}   unit="sft" fill={carpetBar} color={THEME.green} />
            <EffBar label="Balcony"       value={selectedTyp.east.balcony.toFixed(0)} unit="sft" fill={(selectedTyp.east.balcony/avgSaleable)*100} color="rgba(217,178,122,0.42)" />

            <div style={{
              marginTop:18, paddingTop:16, borderTop:`1px solid ${THEME.lineSoft}`,
              display:"flex", gap:28, alignItems:"center",
            }}>
              <div>
                <div style={{ fontFamily:THEME.serif, fontSize:40, fontWeight:500, color:THEME.gold, lineHeight:1 }}>
                  {efficiencyPct}<span style={{ fontSize:17 }}>%</span>
                </div>
                <div style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:THEME.dim, marginTop:3 }}>Carpet Efficiency</div>
              </div>
              <div style={{ flex:1, fontSize:11, color:THEME.dim, lineHeight:1.75 }}>
                For every 100 sq.ft of saleable area, approximately
                <strong style={{ color:THEME.cream }}> {efficiencyPct} sq.ft</strong> is usable carpet.
                Loading factor: <strong style={{ color:THEME.gold }}>{loadFactor.toFixed(2)}×</strong>.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        marginTop:22, fontSize:10, color:"rgba(244,234,216,0.28)", letterSpacing:0.3, lineHeight:1.7,
        animation:"fp2FadeUp .5s ease .5s backwards",
      }}>
        * FSI calculations are illustrative. Actual permissible FSI, setbacks and deductions vary by zoning. Consult a licensed architect / BBMP / BMRDA / BDA.
      </div>
    </div>
  );
}

// ── register ──────────────────────────────────────────────────────
window.SCREENS = window.SCREENS || {};
window.SCREENS["floorplan"] = FloorPlanScreen;
