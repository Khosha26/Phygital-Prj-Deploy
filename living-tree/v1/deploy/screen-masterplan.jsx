// ============================================================
// Master Plan — interactive estate explorer
// Cinematic render, full-width · named tower/clubhouse pointers
// + every amenity pointer · click → zoom, spotlight, details.
// ============================================================
function MasterPlanScreen({ onBack, navigate }) {
  const { useState, useRef, useEffect } = React;

  const IMG_W = 1597, IMG_H = 985;                  // new master-plan render
  const VW = 1440, VH = 824;                        // full-bleed viewport
  const FITW = VW / IMG_W;                          // fit-to-width (full prominence)
  const fitView = () => ({ s: FITW, x: 0, y: (VH - IMG_H * FITW) / 2 });

  // tower / clubhouse centres (% of the render)
  const STRUCT = [
    { id: "ashoka",   name: "Ashoka",   kind: "tower", px: 21.8, py: 35.9 },
    { id: "aspen",    name: "Aspen",    kind: "tower", px: 34.7, py: 32.5 },
    { id: "chestnut", name: "Chestnut", kind: "tower", px: 47.0, py: 33.0 },
    { id: "coral",    name: "Coral",    kind: "tower", px: 64.7, py: 26.7 },
    { id: "deodar",   name: "Deodar",   kind: "tower", px: 74.3, py: 28.4 },
    { id: "laurel",   name: "Laurel",   kind: "tower", px: 84.9, py: 31.3 },
    { id: "walnut",   name: "Walnut",   kind: "tower", px: 23.5, py: 73.3 },
    { id: "tamarind", name: "Tamarind", kind: "tower", px: 34.1, py: 73.9 },
    { id: "plumeria", name: "Plumeria", kind: "tower", px: 47.0, py: 73.3 },
    { id: "mahogany", name: "Mahogany", kind: "tower", px: 59.1, py: 68.7 },
    { id: "club1",    name: "Clubhouse 01", kind: "club", px: 51.3, py: 13.3 },
    { id: "club2",    name: "Clubhouse 02", kind: "club", px: 53.5, py: 82.6 },
  ];
  const CLUBS = {
    club1: { tag: "North Clubhouse", area: "≈ 1 lakh sft",
      facilities: ["Banquet & party hall", "Indoor games arena", "Gymnasium", "Leisure swimming pool", "Multipurpose courts"],
      note: "One of two clubhouses — the “Double Everything” promise, so every home has a club within reach." },
    club2: { tag: "South Clubhouse", area: "≈ 1 lakh sft",
      facilities: ["Lap pool & aqua gym", "Jacuzzi & aqua deck", "Co-working space", "Amphitheatre with stage", "Fern’s Café"],
      note: "Mirrors Clubhouse 01 across the estate so amenities are never far from any tower." },
  };

  // amenity legend-number → centre (% of render), affine-mapped from the old plan
  const AMP = {
    1:[12.7,33.9], 2:[15.7,59.9], 4:[12.9,61.2], 5:[18.0,42.4], 6:[23.9,37.2],
    7:[13.8,22.3], 8:[13.3,18.3], 9:[19.5,16.6], 10:[81.7,3.4], 11:[19.2,26.8],
    12:[21.4,19.5], 13:[23.9,65.9], 14:[43.2,93.0], 15:[21.8,42.5], 16:[37.9,66.2],
    17:[31.4,18.4], 18:[22.8,23.5], 19:[78.4,15.3], 20:[32.7,55.6], 21:[20.9,29.8],
    22:[30.0,33.1], 23:[30.1,27.3], 24:[32.2,19.4], 25:[30.4,18.0], 26:[66.5,33.3],
    27:[33.0,41.3], 28:[33.7,38.1], 29:[78.7,30.9], 30:[21.6,37.6], 31:[54.4,50.9],
    32:[56.9,35.5], 33:[51.9,49.6], 34:[55.0,25.6], 35:[50.7,65.1], 36:[51.5,29.9],
    37:[55.2,32.2], 38:[56.1,27.7], 39:[53.9,33.7], 40:[56.6,21.9], 41:[53.0,31.9],
    43:[50.5,22.8], 44:[59.6,47.1], 45:[64.2,45.4], 46:[73.2,46.0], 47:[69.8,43.7],
    48:[77.8,46.6], 49:[79.3,44.2], 51:[73.9,58.0], 52:[3.0,86.0], 53:[12.2,28.2],
    54:[75.7,7.4], 55:[68.6,8.7], 56:[80.3,3.2], 57:[34.3,94.5], 58:[60.6,90.5],
    59:[35.1,93.6], 60:[27.0,94.2], 61:[81.7,7.2], 62:[71.8,9.0], 63:[60.6,89.0],
    64:[58.8,89.2], 65:[63.4,88.4], 66:[48.0,91.0], 67:[65.8,9.0], 68:[30.6,93.4],
    69:[23.4,24.7],
  };
  const CAT_COLOR = { Sport:"#e3a93f", Social:"#cf906c", Wellness:"#7fb955", Family:"#8ab2cc", Water:"#5ec7c9" };
  const CAT_NOTE = {
    Sport:"Active recreation — part of the estate's sports & play zones.",
    Social:"A community & gathering space woven through the landscape.",
    Wellness:"Part of the estate's health, movement & wellness network.",
    Family:"A family-oriented feature of the Flowing Roots masterplan.",
    Water:"Part of the estate's pools & water landscape.",
  };

  const AMEN = [];
  if (typeof AMENITIES !== "undefined") {
    AMENITIES.forEach((g) => g.items.forEach((it) => {
      const p = AMP[it.n];
      if (p) AMEN.push({ id: "a" + it.n, kind: "amenity", cat: g.cat, n: it.n, name: it.label, px: p[0], py: p[1] });
    }));
  }
  const catCount = {};
  AMEN.forEach((a) => { catCount[a.cat] = (catCount[a.cat] || 0) + 1; });

  const FILTERS = [
    { key: "towers", label: "Towers", count: 10, color: "#d9b27a" },
    { key: "clubs",  label: "Clubhouses", count: 2, color: "#d9b27a" },
    { key: "Sport",    label: "Sport",    count: catCount.Sport || 0,    color: CAT_COLOR.Sport },
    { key: "Social",   label: "Social",   count: catCount.Social || 0,   color: CAT_COLOR.Social },
    { key: "Wellness", label: "Wellness", count: catCount.Wellness || 0, color: CAT_COLOR.Wellness },
    { key: "Family",   label: "Family",   count: catCount.Family || 0,   color: CAT_COLOR.Family },
    { key: "Water",    label: "Water",    count: catCount.Water || 0,    color: CAT_COLOR.Water },
  ];

  const [view, setView]   = useState(fitView());
  const [sel, setSel]     = useState(null);
  const [hover, setHover] = useState(null);
  const [ready, setReady] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [glowOn, setGlowOn]       = useState(false);
  const [active, setActive] = useState({ towers: true, clubs: true, Sport: false, Social: false, Wellness: false, Family: false, Water: false });
  const viewRef = useRef(view);
  const rafRef  = useRef(0);
  const drag    = useRef(null);
  const moved   = useRef(false);
  const vp      = useRef(null);
  const glowTimer = useRef(null);

  const apply = (v) => { viewRef.current = v; setView(v); };

  useEffect(() => {
    const id = "lt-mp-keys";
    if (!document.getElementById(id)) {
      const s = document.createElement("style"); s.id = id;
      s.textContent =
        "@keyframes mpRing{0%,100%{opacity:.9;transform:scale(1)}50%{opacity:.3;transform:scale(1.14)}}" +
        "@keyframes mpPop{from{opacity:0;transform:translate(-50%,-50%) scale(0)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}";
      document.head.appendChild(s);
    }
    return () => { if (glowTimer.current) clearTimeout(glowTimer.current); };
  }, []);

  // Fire glow + ready exactly 1 second after the render image finishes loading
  useEffect(() => {
    if (!imgLoaded) return;
    glowTimer.current = setTimeout(() => {
      setReady(true);
      setGlowOn(true);
    }, 1000);
    return () => { if (glowTimer.current) clearTimeout(glowTimer.current); };
  }, [imgLoaded]);

  const animateTo = (target, dur = 640) => {
    cancelAnimationFrame(rafRef.current);
    const start = { ...viewRef.current }, t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const k = Math.min((now - t0) / dur, 1), e = ease(k);
      apply({ s: start.s + (target.s - start.s) * e,
              x: start.x + (target.x - start.x) * e,
              y: start.y + (target.y - start.y) * e });
      if (k < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const allPoints = STRUCT.concat(AMEN);
  const focusPoint = (id) => {
    const n = allPoints.find((p) => p.id === id);
    if (!n) return;
    setSel(id);
    const Z = FITW * (n.kind === "amenity" ? 2.5 : 2.05);
    const cx = (n.px / 100) * IMG_W, cy = (n.py / 100) * IMG_H;
    animateTo({ s: Z, x: 540 - cx * Z, y: VH / 2 - cy * Z });
  };
  const resetView = () => { setSel(null); animateTo(fitView()); };

  const onDown = (e) => { drag.current = { x: e.clientX, y: e.clientY, v: { ...viewRef.current } }; moved.current = false; };
  const onMove = (e) => {
    if (!drag.current) return;
    const d = drag.current;
    if (Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 4) moved.current = true;
    apply({ s: d.v.s, x: d.v.x + (e.clientX - d.x), y: d.v.y + (e.clientY - d.y) });
  };
  const onUp = () => { drag.current = null; };

  useEffect(() => {
    const el = vp.current; if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const cx = e.clientX - r.left, cy = e.clientY - r.top;
      const v = viewRef.current;
      const ns = Math.min(Math.max(v.s * (1 - e.deltaY * 0.0014), FITW * 0.9), FITW * 4.2);
      const k = ns / v.s;
      apply({ s: ns, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const zoomBtn = (dir) => {
    const v = viewRef.current;
    const ns = Math.min(Math.max(v.s * (dir > 0 ? 1.28 : 0.78), FITW * 0.9), FITW * 4.2);
    const k = ns / v.s;
    animateTo({ s: ns, x: VW / 2 - (VW / 2 - v.x) * k, y: VH / 2 - (VH / 2 - v.y) * k }, 280);
  };

  const sp = (n) => ({ x: view.x + (n.px / 100) * IMG_W * view.s,
                       y: view.y + (n.py / 100) * IMG_H * view.s });
  const isOn = (n) => n.kind === "amenity" ? active[n.cat] : active[n.kind === "club" ? "clubs" : "towers"];
  const shown = allPoints.filter((n) => isOn(n) || sel === n.id);
  const selNode = sel ? allPoints.find((n) => n.id === sel) : null;
  const tower = (id) => (typeof TOWERS !== "undefined" ? TOWERS.find((t) => t.id === id) : null);

  return (
    <ScreenShell title="Master Plan" eyebrow="25 acres · 10 towers · 65 amenities"
      onBack={onBack} scroll={false} pad={false}>
      <div ref={vp}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onMouseLeave={onUp}
        onClick={() => { if (!moved.current && sel) resetView(); }}
        style={{ position: "absolute", inset: 0, overflow: "hidden",
          cursor: drag.current ? "grabbing" : "grab", background: "#070d09" }}>

        {/* ── the master-plan render (full width) ── */}
        <img src="assets/masterplan-render.jpg" alt="Master Plan" draggable={false}
          onLoad={() => setImgLoaded(true)}
          style={{
            position: "absolute", left: 0, top: 0, width: IMG_W, height: IMG_H,
            transformOrigin: "0 0",
            transform: "translate(" + view.x + "px," + view.y + "px) scale(" + view.s + ")",
            opacity: imgLoaded ? 1 : 0, transition: "opacity .8s ease",
            pointerEvents: "none", userSelect: "none",
          }}/>

        {/* ── spotlight veil ── */}
        {selNode && (() => {
          const p = sp(selNode);
          const r = (selNode.kind === "club" ? 0.1 : selNode.kind === "tower" ? 0.072 : 0.046) * IMG_W * view.s;
          return (
            <svg width={VW} height={VH} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              <defs>
                <radialGradient id="mpHole">
                  <stop offset="56%" stopColor="#000" stopOpacity="1"/>
                  <stop offset="100%" stopColor="#000" stopOpacity="0"/>
                </radialGradient>
                <mask id="mpMask">
                  <rect x="0" y="0" width={VW} height={VH} fill="#fff"/>
                  <circle cx={p.x} cy={p.y} r={r} fill="url(#mpHole)"/>
                </mask>
              </defs>
              <rect x="0" y="0" width={VW} height={VH} fill="#05100a" opacity="0.7" mask="url(#mpMask)"/>
              <circle cx={p.x} cy={p.y} r={r} fill="none" stroke={THEME.gold} strokeWidth="2.5" opacity="0.95"/>
              <circle cx={p.x} cy={p.y} r={r} fill="none" stroke={THEME.gold} strokeWidth="1.4"
                style={{ transformOrigin: p.x + "px " + p.y + "px", animation: "mpRing 2.4s ease-in-out infinite" }}/>
            </svg>
          );
        })()}

        {/* ── pointers ── */}
        {shown.map((n, i) => {
          const p = sp(n);
          if (p.x < -60 || p.x > VW + 60 || p.y < -60 || p.y > VH + 60) return null;
          const on = sel === n.id, hov = hover === n.id, dim = sel && !on;
          const isAm = n.kind === "amenity";
          const D = on ? (isAm ? 30 : 34) : (n.kind === "club" ? 30 : isAm ? 21 : 26);
          const col = isAm ? CAT_COLOR[n.cat] : THEME.gold;
          return (
            <div key={n.id}
              onMouseEnter={() => setHover(n.id)} onMouseLeave={() => setHover(null)}
              onClick={(e) => { e.stopPropagation(); focusPoint(n.id); }}
              style={{
                position: "absolute", left: p.x, top: p.y, width: D, height: D,
                transform: "translate(-50%,-50%)" + (hov ? " scale(1.16)" : ""),
                transition: "transform .18s, width .25s, height .25s, opacity .7s ease",
                cursor: "pointer", zIndex: on ? 9 : hov ? 8 : isAm ? 5 : 6,
                opacity: glowOn ? (dim ? 0.32 : 1) : 0,
                animation: glowOn ? "mpPop .45s cubic-bezier(.34,1.56,.64,1) " + Math.min(i * 0.016, 0.5) + "s both" : "none",
              }}>
              <div style={{
                width: "100%", height: "100%",
                borderRadius: n.kind === "club" ? 8 : "50%",
                background: on ? "linear-gradient(135deg,#fff2d6," + col + ")"
                  : isAm ? "rgba(7,13,9,.92)" : "rgba(7,13,9,.9)",
                border: "2px solid " + (on ? "#fff7e6" : col),
                boxShadow: on ? "0 0 20px " + col
                  : isAm ? "0 2px 8px rgba(0,0,0,.7)" : "0 3px 12px rgba(0,0,0,.75)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: isAm ? 9.5 : 10.5, fontWeight: 700, fontFamily: THEME.serif,
                color: on ? THEME.ink : col,
              }}>{n.kind === "club" ? "◆" : isAm ? n.n : (STRUCT.indexOf(n) + 1)}</div>

              {/* always-on NAME label for towers + clubhouses */}
              {!isAm &&
                <div style={{
                  position: "absolute", top: "108%", left: "50%", transform: "translateX(-50%)",
                  whiteSpace: "nowrap", padding: "3px 9px", borderRadius: 6,
                  background: on ? THEME.gold : "rgba(7,13,9,.9)",
                  border: "1px solid " + (on ? THEME.gold : THEME.line),
                  fontSize: 10, fontWeight: 700, letterSpacing: .4, fontFamily: THEME.sans,
                  color: on ? THEME.ink : THEME.cream,
                  textTransform: "uppercase", pointerEvents: "none",
                }}>{n.name}</div>}

              {/* hover name for amenities */}
              {isAm && hov && !on &&
                <div style={{
                  position: "absolute", bottom: "126%", left: "50%", transform: "translateX(-50%)",
                  background: "rgba(7,13,9,.97)", border: "1px solid " + THEME.line, borderRadius: 7,
                  padding: "5px 10px", whiteSpace: "nowrap", fontSize: 11, fontWeight: 600, color: THEME.cream,
                }}>{n.name}  ·  #{n.n}</div>}
            </div>
          );
        })}

        {/* ── filter bar ── */}
        <div style={{
          position: "absolute", left: 18, top: 16, display: "flex", gap: 7, flexWrap: "wrap",
          maxWidth: 770, alignItems: "center",
          padding: 9, borderRadius: 14, background: "rgba(7,13,9,.86)",
          border: "1px solid " + THEME.line, backdropFilter: "blur(10px)",
        }}>
          <span style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase",
            color: THEME.gold, padding: "0 6px 0 4px" }}>Show</span>
          {FILTERS.map((f) => {
            const fon = active[f.key];
            return (
              <button key={f.key}
                onClick={() => setActive((s) => ({ ...s, [f.key]: !s[f.key] }))}
                style={{
                  display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                  padding: "6px 11px", borderRadius: 999, fontFamily: THEME.sans,
                  fontSize: 11, fontWeight: 600,
                  background: fon ? f.color : THEME.glass,
                  color: fon ? THEME.ink : THEME.cream,
                  border: "1px solid " + (fon ? f.color : THEME.lineSoft),
                  transition: "all .2s",
                }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%",
                  background: fon ? "rgba(26,38,32,.55)" : f.color }}/>
                {f.label}<span style={{ opacity: .7, fontSize: 10 }}>{f.count}</span>
              </button>
            );
          })}
        </div>

        {/* zoom + reset */}
        <div style={{ position: "absolute", right: 18, bottom: 18, display: "flex",
          flexDirection: "column", gap: 6 }}>
          {[["+", 1], ["−", -1]].map(([t, d]) => (
            <button key={t} onClick={() => zoomBtn(d)} style={{
              width: 42, height: 42, borderRadius: 11, cursor: "pointer",
              background: "rgba(7,13,9,.94)", border: "1px solid " + THEME.line,
              color: THEME.cream, fontSize: 20, lineHeight: 1, fontFamily: THEME.sans,
            }}>{t}</button>
          ))}
          <button onClick={resetView} title="Full plan" style={{
            width: 42, height: 42, borderRadius: 11, cursor: "pointer",
            background: sel ? THEME.goldSoft : "rgba(7,13,9,.94)",
            border: "1px solid " + (sel ? THEME.lineStrong : THEME.line),
            color: THEME.cream, fontSize: 16, fontFamily: THEME.sans,
          }}>⤢</button>
        </div>
        <div style={{ position: "absolute", left: 18, bottom: 18, fontSize: 10,
          letterSpacing: 1.4, textTransform: "uppercase", color: THEME.dim,
          background: "rgba(7,13,9,.82)", border: "1px solid " + THEME.lineSoft,
          borderRadius: 999, padding: "7px 14px" }}>
          Tap a pointer · drag to pan · scroll to zoom
        </div>

        {/* ── DETAIL CARD ── */}
        {selNode && (() => {
          const isClub = selNode.kind === "club";
          const isAm = selNode.kind === "amenity";
          const t = !isClub && !isAm ? tower(selNode.id) : null;
          const c = isClub ? CLUBS[selNode.id] : null;
          const total = t ? t.available + t.sold + t.hold : 0;
          return (
            <div key={selNode.id} style={{
              position: "absolute", right: 20, top: 70, width: 372,
              maxHeight: VH - 140, overflowY: "auto",
              background: "rgba(13,21,16,.96)", border: "1px solid " + THEME.lineStrong,
              borderRadius: 16, padding: "22px 22px 20px",
              boxShadow: "0 30px 70px rgba(0,0,0,.7)",
              animation: "scaleFadeIn .5s cubic-bezier(.34,1.56,.64,1)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ paddingRight: 10 }}>
                  <div style={{ fontSize: 9, letterSpacing: 2.6, textTransform: "uppercase",
                    color: isAm ? CAT_COLOR[selNode.cat] : THEME.gold }}>
                    {isClub ? c.tag : isAm ? (selNode.cat + " amenity") : (t ? t.cluster : "Tower")}
                  </div>
                  <div style={{ fontFamily: THEME.serif, fontSize: isAm ? 25 : 30, fontWeight: 500,
                    marginTop: 3, lineHeight: 1.1 }}>{selNode.name}</div>
                </div>
                <button onClick={resetView} style={{
                  width: 30, height: 30, borderRadius: "50%", cursor: "pointer", flexShrink: 0,
                  background: THEME.glass, border: "1px solid " + THEME.line, color: THEME.cream, fontSize: 15,
                }}>×</button>
              </div>

              {isAm ? (
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 16px",
                    background: THEME.glass, border: "1px solid " + THEME.lineSoft, borderRadius: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: THEME.serif, fontSize: 20, fontWeight: 700,
                      background: "rgba(7,13,9,.8)", color: CAT_COLOR[selNode.cat],
                      border: "2px solid " + CAT_COLOR[selNode.cat] }}>{selNode.n}</div>
                    <div>
                      <div style={{ fontSize: 10, letterSpacing: 1.6, textTransform: "uppercase", color: THEME.dim }}>
                        Master-plan marker
                      </div>
                      <div style={{ fontSize: 13, color: THEME.cream, marginTop: 2 }}>
                        Legend no. <b style={{ color: CAT_COLOR[selNode.cat] }}>{selNode.n}</b> · {selNode.cat}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 14, fontSize: 12, lineHeight: 1.7, color: THEME.dim }}>
                    {CAT_NOTE[selNode.cat]}
                  </div>
                  <button onClick={() => navigate && navigate("amenities")} style={ctaStyle}>
                    See all 65 amenities →
                  </button>
                </div>
              ) : isClub ? (
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "12px 14px",
                    background: THEME.goldSoft, border: "1px solid " + THEME.line, borderRadius: 11 }}>
                    <span style={{ fontFamily: THEME.serif, fontSize: 26, color: THEME.gold }}>{c.area}</span>
                    <span style={{ fontSize: 11, color: THEME.dim }}>of clubhouse space</span>
                  </div>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase",
                    color: THEME.dim, margin: "16px 0 9px" }}>Key facilities</div>
                  {c.facilities.map((f) => (
                    <div key={f} style={{ display: "flex", gap: 9, alignItems: "center", padding: "5px 0" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: THEME.gold, flexShrink: 0 }}/>
                      <span style={{ fontSize: 12.5, color: THEME.cream }}>{f}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 14, fontSize: 11.5, lineHeight: 1.65, color: THEME.dim,
                    fontStyle: "italic", fontFamily: THEME.serif }}>{c.note}</div>
                  <button onClick={() => navigate && navigate("amenities")} style={ctaStyle}>
                    Explore all amenities →
                  </button>
                </div>
              ) : t ? (
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[["Tower", "0" + t.no], ["Floors", t.floors], ["Homes", t.units]].map(([l, v]) => (
                      <div key={l} style={{ flex: 1, padding: "11px 8px", textAlign: "center",
                        background: THEME.glass, border: "1px solid " + THEME.lineSoft, borderRadius: 10 }}>
                        <div style={{ fontFamily: THEME.serif, fontSize: 22, color: THEME.cream }}>{v}</div>
                        <div style={{ fontSize: 8.5, letterSpacing: 1.4, textTransform: "uppercase",
                          color: THEME.dim, marginTop: 2 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase",
                    color: THEME.dim, margin: "16px 0 8px" }}>Availability</div>
                  <div style={{ display: "flex", height: 9, borderRadius: 99, overflow: "hidden",
                    border: "1px solid " + THEME.lineSoft }}>
                    <div style={{ width: (t.available / total * 100) + "%", background: THEME.green }}/>
                    <div style={{ width: (t.hold / total * 100) + "%", background: THEME.gold }}/>
                    <div style={{ width: (t.sold / total * 100) + "%", background: "rgba(150,90,84,.7)" }}/>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}>
                    {[["Available", t.available, THEME.green], ["On hold", t.hold, THEME.gold],
                      ["Sold", t.sold, "rgba(190,120,112,1)"]].map(([l, v, col]) => (
                      <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: col }}/>
                        <span style={{ fontSize: 11, color: THEME.cream }}><b>{v}</b>
                          <span style={{ color: THEME.dim }}> {l}</span></span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase",
                    color: THEME.dim, margin: "16px 0 8px" }}>Configurations</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {t.typologies.map((ty) => (
                      <span key={ty} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 999,
                        background: THEME.goldSoft, border: "1px solid " + THEME.line, color: THEME.cream }}>{ty}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 14,
                    padding: "10px 12px", background: THEME.glass, borderRadius: 10,
                    border: "1px solid " + THEME.lineSoft }}>
                    <span style={{ fontSize: 14 }}>◷</span>
                    <span style={{ fontSize: 11.5, color: THEME.dim }}>Aspect — {t.view}</span>
                  </div>
                  <button onClick={() => navigate && navigate("inventory")} style={ctaStyle}>
                    View units in {selNode.name} →
                  </button>
                </div>
              ) : null}
            </div>
          );
        })()}
      </div>
    </ScreenShell>
  );
}

const ctaStyle = {
  width: "100%", marginTop: 16, padding: "12px", borderRadius: 10, cursor: "pointer",
  background: "linear-gradient(135deg,#d9b27a,#b9874a)", border: "none", color: "#1a2620",
  fontSize: 12, fontWeight: 700, letterSpacing: .5, fontFamily: "Inter, sans-serif",
  boxShadow: "0 14px 30px rgba(217,178,122,.28)",
};

window.SCREENS = window.SCREENS || {};
window.SCREENS["masterplan"] = MasterPlanScreen;
