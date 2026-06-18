// Project Overview — no-scroll interactive showcase
// LivingTree by Kalyani Developers · Sales Suite v3
// Layout: left cinematic hero (stats + identity) + right interactive tabbed explorer
// Fits entirely in the ScreenShell content area (1440 × 824) with scroll={false}

(function () {

// ─── inject keyframes once ────────────────────────────────────────────────
const STYLE_ID = "lt-po2-styles";
function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
    @keyframes po2FadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes po2FadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes po2ScaleIn {
      from { opacity: 0; transform: scale(0.94); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes po2SlideLeft {
      from { opacity: 0; transform: translateX(24px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes po2PulseGlow {
      0%, 100% { box-shadow: 0 0 0 0 rgba(127,185,85,0.55); }
      50%       { box-shadow: 0 0 0 7px rgba(127,185,85,0); }
    }
    @keyframes po2BarGrow {
      from { transform: scaleX(0); }
      to   { transform: scaleX(1); }
    }
    @keyframes po2CountUp {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes po2Nudge {
      0%, 100% { transform: translateX(0); }
      50%       { transform: translateX(5px); }
    }
    @keyframes po2Shimmer {
      0%   { background-position: -500px 0; }
      100% { background-position: 500px 0; }
    }
    @keyframes po2LineGrow {
      from { height: 0; }
      to   { height: 100%; }
    }
    @keyframes po2TabReveal {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Hover states — pure CSS for performance */
    .po2-tab-btn:hover {
      background: rgba(217,178,122,0.09) !important;
      color: rgba(244,234,216,0.9) !important;
    }
    .po2-tab-btn.active {
      background: rgba(217,178,122,0.13) !important;
      color: #d9b27a !important;
      border-color: rgba(217,178,122,0.35) !important;
    }
    .po2-pill-btn:hover {
      background: rgba(217,178,122,0.16) !important;
      border-color: rgba(217,178,122,0.38) !important;
      transform: translateY(-1px);
    }
    .po2-pill-btn.active {
      background: rgba(217,178,122,0.18) !important;
      border-color: rgba(217,178,122,0.45) !important;
      color: #d9b27a !important;
    }
    .po2-stat-box:hover {
      background: rgba(217,178,122,0.1) !important;
      border-color: rgba(217,178,122,0.3) !important;
    }
    .po2-nav-chip:hover {
      background: rgba(217,178,122,0.12) !important;
      border-color: rgba(217,178,122,0.35) !important;
      color: #d9b27a !important;
      transform: translateY(-1px);
    }
    .po2-usp-row:hover {
      background: rgba(217,178,122,0.07) !important;
      border-color: rgba(217,178,122,0.25) !important;
    }
    .po2-usp-row.selected {
      background: rgba(217,178,122,0.1) !important;
      border-color: rgba(217,178,122,0.3) !important;
    }
    .po2-reason-row:hover {
      background: rgba(255,255,255,0.04) !important;
    }
    .po2-reason-row.open {
      background: rgba(217,178,122,0.06) !important;
    }
    .po2-action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 36px rgba(217,178,122,0.38) !important;
    }
    .po2-action-sec:hover {
      background: rgba(255,255,255,0.08) !important;
      border-color: rgba(217,178,122,0.32) !important;
    }
    ::-webkit-scrollbar { width: 0; height: 0; }
  `;
  document.head.appendChild(el);
}

// ─── animated counter ─────────────────────────────────────────────────────
function useAnimCount(target, duration, delay) {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    let raf, startT;
    const t0 = performance.now() + (delay || 0);
    const tick = (now) => {
      if (now < t0) { raf = requestAnimationFrame(tick); return; }
      if (!startT) startT = now;
      const prog = Math.min((now - startT) / (duration || 1400), 1);
      const eased = 1 - Math.pow(1 - prog, 3);
      setVal(Math.round(target * eased));
      if (prog < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return val;
}

// ─── Left panel: cinematic hero ───────────────────────────────────────────
function HeroPanel({ navigate }) {
  const acres  = useAnimCount(25,   1200, 200);
  const towers = useAnimCount(10,   1100, 350);
  const units  = useAnimCount(2522, 1800, 500);
  const amen   = useAnimCount(65,   1200, 650);

  const stats = [
    { value: acres,  unit: "ac",    label: "Land" },
    { value: towers, unit: "",      label: "Towers" },
    { value: units.toLocaleString("en-IN"), unit: "",  label: "Homes" },
    { value: amen,   unit: "+",     label: "Amenities" },
  ];

  const navChips = [
    { label: "Floor Plans",  key: "floorplan" },
    { label: "Master Plan",  key: "masterplan" },
    { label: "Gallery",      key: "gallery" },
    { label: "Amenities",    key: "amenities" },
    { label: "Location",     key: "location" },
    { label: "Inventory",    key: "inventory" },
  ];

  return (
    <div style={{
      width: 488,
      flexShrink: 0,
      height: "100%",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      borderRight: "1px solid rgba(217,178,122,0.13)",
      overflow: "hidden",
    }}>

      {/* Background image */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
      }}>
        <img
          src="assets/renders/render-04.jpg"
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}
          onError={e => { e.target.style.display = "none"; }}
        />
        {/* dark overlay — base */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(170deg, rgba(10,18,13,0.62) 0%, rgba(10,18,13,0.45) 30%, rgba(10,18,13,0.72) 70%, rgba(10,18,13,0.97) 100%)",
        }} />
        {/* left fade for blending */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(10,18,13,0.0) 60%, rgba(10,18,13,0.55) 100%)",
        }} />
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", height: "100%", padding: "36px 36px 28px" }}>

        {/* Identity block */}
        <div style={{ opacity: 0, animation: "po2FadeUp 0.7s ease 0.1s forwards" }}>
          {/* tree mark */}
          <div style={{ marginBottom: 18 }}>
            <img src="assets/renders/cover-01.png" alt="LivingTree"
              style={{ width: 52, height: 52, borderRadius: "50%", border: "1.5px solid rgba(217,178,122,0.4)", objectFit: "cover" }}
              onError={e => {
                e.target.style.display = "none";
                const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
                svg.setAttribute("width","52"); svg.setAttribute("height","52"); svg.setAttribute("viewBox","0 0 64 64");
                svg.setAttribute("fill","none"); svg.setAttribute("stroke","#d9b27a"); svg.setAttribute("stroke-width","1.4");
                svg.innerHTML = `<circle cx="32" cy="24" r="16"/><circle cx="20" cy="20" r="9"/><circle cx="44" cy="20" r="9"/><path d="M32 38 L32 58"/><path d="M32 46 L26 50"/><path d="M32 50 L38 54"/>`;
                e.target.parentNode.appendChild(svg);
              }}
            />
          </div>

          <div style={{ fontSize: 9, letterSpacing: 3.5, textTransform: "uppercase", color: THEME.gold, marginBottom: 8, opacity: 0.85 }}>
            Kalyani Developers
          </div>
          <h2 style={{
            fontFamily: THEME.serif, fontSize: 42, fontWeight: 400, lineHeight: 1.08,
            color: THEME.cream, margin: "0 0 6px", letterSpacing: -0.5,
          }}>
            LivingTree
          </h2>
          <div style={{
            fontFamily: THEME.serif, fontSize: 16, fontStyle: "italic",
            color: "rgba(244,234,216,0.65)", marginBottom: 16, lineHeight: 1.5,
          }}>
            "{PROJECT.hero}"
          </div>
          <div style={{ fontSize: 11, color: "rgba(244,234,216,0.5)", letterSpacing: 0.4, lineHeight: 1.65, maxWidth: 340 }}>
            {PROJECT.pitch}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(217,178,122,0.15)", margin: "24px 0", flexShrink: 0, opacity: 0, animation: "po2FadeIn 0.6s ease 0.45s forwards" }} />

        {/* Animated stat grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
          flexShrink: 0,
          opacity: 0, animation: "po2FadeUp 0.6s ease 0.5s forwards",
        }}>
          {stats.map((s, i) => (
            <div
              key={i}
              className="po2-stat-box"
              style={{
                padding: "14px 16px", borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(217,178,122,0.14)",
                transition: "background 0.25s, border-color 0.25s",
                cursor: "default",
              }}>
              <div style={{
                fontFamily: THEME.serif, fontSize: 30, fontWeight: 400, lineHeight: 1,
                color: THEME.cream, letterSpacing: -0.5,
                animation: "po2CountUp 0.5s ease",
              }}>
                {s.value}<span style={{ fontSize: 14, color: THEME.gold, marginLeft: 3, fontStyle: "italic" }}>{s.unit}</span>
              </div>
              <div style={{ fontSize: 9.5, letterSpacing: 2, textTransform: "uppercase", color: "rgba(244,234,216,0.45)", marginTop: 5 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* RERA + possession badges */}
        <div style={{
          display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap",
          opacity: 0, animation: "po2FadeUp 0.6s ease 0.65s forwards",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "6px 13px", borderRadius: 99,
            background: "rgba(217,178,122,0.07)", border: "1px solid rgba(217,178,122,0.2)",
            fontSize: 10, letterSpacing: 0.4, color: "rgba(244,234,216,0.65)",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%", background: THEME.green,
              animation: "po2PulseGlow 2s ease infinite",
            }} />
            <span style={{ color: THEME.gold, letterSpacing: 1.5, fontSize: 9, textTransform: "uppercase" }}>RERA</span>
            <span style={{ color: "rgba(217,178,122,0.3)" }}>·</span>
            1251/309
          </div>
          <div style={{
            padding: "6px 13px", borderRadius: 99,
            background: "rgba(217,178,122,0.07)", border: "1px solid rgba(217,178,122,0.2)",
            fontSize: 10, letterSpacing: 0.4, color: "rgba(244,234,216,0.65)",
          }}>
            Possession Sep 2029
          </div>
          <div style={{
            padding: "6px 13px", borderRadius: 99,
            background: "rgba(217,178,122,0.07)", border: "1px solid rgba(217,178,122,0.2)",
            fontSize: 10, letterSpacing: 0.4, color: "rgba(244,234,216,0.65)",
          }}>
            15 min · KIA
          </div>
        </div>

        {/* Explore other sections — nav chips */}
        <div style={{ marginTop: 22, opacity: 0, animation: "po2FadeUp 0.6s ease 0.78s forwards" }}>
          <div style={{ fontSize: 8.5, letterSpacing: 3, textTransform: "uppercase", color: "rgba(217,178,122,0.5)", marginBottom: 10 }}>
            Explore
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {navChips.map(chip => (
              <button
                key={chip.key}
                className="po2-nav-chip"
                onClick={() => navigate && navigate(chip.key)}
                style={{
                  padding: "6px 14px", borderRadius: 99,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(217,178,122,0.16)",
                  fontSize: 10.5, fontWeight: 500, letterSpacing: 0.3,
                  color: "rgba(244,234,216,0.65)", cursor: "pointer",
                  fontFamily: THEME.sans, transition: "all 0.22s",
                }}>
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* CTA buttons */}
        <div style={{
          display: "flex", gap: 10,
          opacity: 0, animation: "po2FadeUp 0.6s ease 0.9s forwards",
        }}>
          <button
            onClick={() => navigate && navigate("booking")}
            className="po2-action-btn"
            style={{
              flex: 1, padding: "13px 0", borderRadius: 12,
              background: `linear-gradient(135deg, ${THEME.gold}, ${THEME.goldDeep})`,
              color: "#1a2620", border: "none", cursor: "pointer",
              fontSize: 12.5, fontWeight: 700, letterSpacing: 0.7,
              fontFamily: THEME.sans,
              boxShadow: "0 12px 28px rgba(217,178,122,0.3)",
              transition: "transform 0.22s, box-shadow 0.22s",
            }}>
            Book Now
            <span style={{ display: "inline-block", marginLeft: 7, animation: "po2Nudge 1.8s ease-in-out infinite" }}>→</span>
          </button>
          <button
            onClick={() => navigate && navigate("gallery")}
            className="po2-action-sec"
            style={{
              flex: 1, padding: "13px 0", borderRadius: 12,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(217,178,122,0.22)",
              color: THEME.cream, cursor: "pointer",
              fontSize: 12.5, fontWeight: 600, letterSpacing: 0.5,
              fontFamily: THEME.sans,
              transition: "background 0.22s, border-color 0.22s",
            }}>
            Gallery
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── Tab: What Makes LivingTree Different (USPs) ─────────────────────────
function TabUSPs() {
  const [activeUsp, setActiveUsp] = React.useState(0);
  const usp = USPS[activeUsp];

  const icons = [
    /* kiadb — shield */ (
      <svg key="shield" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    /* design — compass */ (
      <svg key="compass" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
        <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
        <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
      </svg>
    ),
    /* roots — leaf */ (
      <svg key="leaf" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8C8 10 5.9 16.17 3.82 22"/><path d="M9.5 9.5c3 3 3.5 6.5 3.5 8.5"/>
        <path d="M21 2S10 5 8 14c0 0 3-1 5-1s4 1 4 1"/>
      </svg>
    ),
    /* double — layers */ (
      <svg key="layers" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
      </svg>
    ),
  ];

  return (
    <div style={{ display: "flex", gap: 0, height: "100%", overflow: "hidden" }}>

      {/* USP selector — left column */}
      <div style={{
        width: 224, flexShrink: 0, borderRight: "1px solid rgba(217,178,122,0.1)",
        display: "flex", flexDirection: "column", gap: 0, paddingTop: 6,
      }}>
        {USPS.map((u, i) => (
          <button
            key={u.id}
            className={`po2-usp-row${activeUsp === i ? " selected" : ""}`}
            onClick={() => setActiveUsp(i)}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "15px 18px", cursor: "pointer",
              background: activeUsp === i ? "rgba(217,178,122,0.1)" : "transparent",
              border: "none", borderLeft: `2px solid ${activeUsp === i ? THEME.gold : "transparent"}`,
              textAlign: "left", transition: "background 0.22s",
              fontFamily: THEME.sans,
            }}>
            <div style={{
              color: activeUsp === i ? THEME.gold : "rgba(244,234,216,0.45)",
              transition: "color 0.22s", flexShrink: 0,
            }}>
              {icons[i]}
            </div>
            <div>
              <div style={{
                fontSize: 12.5, fontWeight: 600,
                color: activeUsp === i ? THEME.cream : "rgba(244,234,216,0.65)",
                transition: "color 0.22s", marginBottom: 2,
              }}>{u.title}</div>
              <div style={{
                fontSize: 9.5, color: "rgba(244,234,216,0.38)", letterSpacing: 0.3,
              }}>{u.points.length} highlights</div>
            </div>
            <div style={{
              marginLeft: "auto", color: activeUsp === i ? THEME.gold : "rgba(217,178,122,0.3)",
              fontSize: 13,
            }}>›</div>
          </button>
        ))}
      </div>

      {/* USP detail — right */}
      <div key={activeUsp} style={{
        flex: 1, padding: "24px 28px", overflow: "hidden",
        animation: "po2SlideLeft 0.32s ease",
        display: "flex", flexDirection: "column",
      }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 50, height: 50, borderRadius: 14, flexShrink: 0,
            background: "rgba(217,178,122,0.1)", border: "1px solid rgba(217,178,122,0.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: THEME.gold,
          }}>
            {icons[activeUsp]}
          </div>
          <div>
            <div style={{
              fontFamily: THEME.serif, fontSize: 24, fontWeight: 500,
              color: THEME.cream, lineHeight: 1.15, marginBottom: 5,
            }}>{usp.title}</div>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(217,178,122,0.55)" }}>
              {usp.points.length} key highlights
            </div>
          </div>
        </div>

        {/* points */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, flex: 1, overflow: "hidden" }}>
          {usp.points.map((pt, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 14,
              padding: "13px 0",
              borderBottom: i < usp.points.length - 1 ? "1px solid rgba(217,178,122,0.08)" : "none",
              opacity: 0,
              animation: `po2FadeUp 0.4s ease ${i * 0.07}s forwards`,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: "rgba(217,178,122,0.08)", border: "1px solid rgba(217,178,122,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: THEME.serif, fontSize: 12, color: THEME.gold, fontWeight: 500,
              }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(244,234,216,0.78)", paddingTop: 3 }}>{pt}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Why North Bengaluru ─────────────────────────────────────────────
function TabNorth() {
  const [openIdx, setOpenIdx] = React.useState(null);

  const northIcons = [
    /* metro */ (
      <svg key="metro" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="3"/>
        <path d="M8 5V3M16 5V3"/><line x1="3" y1="10" x2="21" y2="10"/>
        <circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/>
      </svg>
    ),
    /* industry */ (
      <svg key="ind" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20V8l6-4v4l6-4v4l6-4v16"/>
        <rect x="4" y="14" width="4" height="6"/><rect x="10" y="14" width="4" height="6"/>
      </svg>
    ),
    /* aerospace */ (
      <svg key="aero" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92A10 10 0 0 0 12 2a10 10 0 0 0-10 10.92"/>
        <path d="M12 2v10l4 4"/><circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    /* corridor */ (
      <svg key="corr" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h18v2H3z"/><path d="M3 19h18v2H3z"/>
        <path d="M7 3v18"/><path d="M12 3v18"/><path d="M17 3v18"/>
      </svg>
    ),
    /* airport */ (
      <svg key="apt" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 2.5S18 2 16.5 3.5L13 7 4.8 5.2L3.4 6.6l6.4 3.4L7 12 4 11l-1.3 1.3 3.3 3.3 3.3 3.3L10.7 20l-1-3 1.7-2.7 3.4 6.4z"/>
      </svg>
    ),
  ];

  return (
    <div style={{ padding: "6px 0", overflow: "hidden", display: "flex", flexDirection: "column", gap: 0 }}>
      {NORTH_REASONS.map((r, i) => {
        const isOpen = openIdx === i;
        return (
          <div key={r.n}>
            <button
              className={`po2-reason-row${isOpen ? " open" : ""}`}
              onClick={() => setOpenIdx(isOpen ? null : i)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 16,
                padding: "16px 20px", cursor: "pointer",
                background: isOpen ? "rgba(217,178,122,0.06)" : "transparent",
                border: "none", borderBottom: "1px solid rgba(217,178,122,0.08)",
                textAlign: "left", transition: "background 0.22s", fontFamily: THEME.sans,
              }}>

              {/* Number */}
              <div style={{
                fontFamily: THEME.serif, fontSize: 22, fontWeight: 400,
                color: isOpen ? "rgba(217,178,122,0.7)" : "rgba(217,178,122,0.22)",
                lineHeight: 1, flexShrink: 0, width: 36, transition: "color 0.25s",
              }}>{r.n}</div>

              {/* Icon */}
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: isOpen ? "rgba(217,178,122,0.12)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${isOpen ? "rgba(217,178,122,0.3)" : "rgba(217,178,122,0.1)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: isOpen ? THEME.gold : "rgba(244,234,216,0.45)",
                transition: "all 0.25s",
              }}>
                {northIcons[i]}
              </div>

              {/* Title */}
              <div style={{
                flex: 1, fontSize: 13.5, fontWeight: 600,
                color: isOpen ? THEME.cream : "rgba(244,234,216,0.75)",
                transition: "color 0.22s",
              }}>{r.title}</div>

              {/* Chevron */}
              <div style={{
                color: "rgba(217,178,122,0.45)", fontSize: 16,
                transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.28s cubic-bezier(0.34,1.56,0.64,1)",
              }}>›</div>
            </button>

            {/* Expanded body */}
            {isOpen && (
              <div style={{
                padding: "14px 20px 16px 88px",
                background: "rgba(217,178,122,0.04)",
                borderBottom: "1px solid rgba(217,178,122,0.08)",
                animation: "po2TabReveal 0.28s ease",
              }}>
                <div style={{ fontSize: 12.5, lineHeight: 1.75, color: "rgba(244,234,216,0.7)" }}>
                  {r.body}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab: Developer Story ─────────────────────────────────────────────────
function TabDeveloper() {
  const yrs  = useAnimCount(30,  1200, 100);
  const msft = useAnimCount(12,  1200, 250);
  const auto = useAnimCount(75,  1400, 400);

  const devStats = [
    { value: yrs + "+",          label: "Years",            sub: "est. 1991" },
    { value: msft + "M+ sqft",   label: "Office Spaces",    sub: "across Bengaluru" },
    { value: auto,               label: "Auto Showrooms",   sub: "Bengaluru · Hyd · Mys" },
  ];

  return (
    <div style={{ padding: "20px 24px", overflow: "hidden" }}>

      {/* Developer identity */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 22, opacity: 0, animation: "po2FadeUp 0.5s ease forwards" }}>
        <div style={{
          width: 60, height: 60, borderRadius: "50%", flexShrink: 0,
          background: "rgba(217,178,122,0.08)", border: "1.5px solid rgba(217,178,122,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}>
          <img src="assets/renders/cover-01.png" alt="Kalyani"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => {
              e.target.style.display = "none";
              e.target.parentNode.innerHTML = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" stroke="#d9b27a" strokeWidth="1.5"><circle cx="32" cy="24" r="16"/><path d="M32 38L32 58"/></svg>`;
            }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: THEME.serif, fontSize: 22, fontWeight: 500, color: THEME.cream, marginBottom: 4 }}>
            Kalyani Developers
          </div>
          <div style={{ fontSize: 10.5, color: "rgba(244,234,216,0.5)", letterSpacing: 0.3, marginBottom: 10 }}>
            Rooted for 30+ years · Bengaluru
          </div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "5px 12px", borderRadius: 99,
            background: "rgba(217,178,122,0.09)", border: "1px solid rgba(217,178,122,0.25)",
            fontSize: 9.5, letterSpacing: 1.5, textTransform: "uppercase", color: THEME.gold,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: "50%", background: THEME.green,
              animation: "po2PulseGlow 2s ease infinite",
            }} />
            Verified Developer
          </div>
        </div>
      </div>

      {/* Quote */}
      <div style={{
        fontFamily: THEME.serif, fontSize: 15, fontStyle: "italic",
        color: "rgba(244,234,216,0.68)", lineHeight: 1.7,
        padding: "16px 18px",
        borderLeft: `2.5px solid rgba(217,178,122,0.45)`,
        background: "rgba(217,178,122,0.04)",
        borderRadius: "0 10px 10px 0",
        marginBottom: 22,
        opacity: 0, animation: "po2FadeUp 0.5s ease 0.12s forwards",
      }}>
        "It's not just a home. It's a feeling — the warmth of belonging to a community that's been crafted, not built."
      </div>

      {/* Stats */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10,
        marginBottom: 22,
        opacity: 0, animation: "po2FadeUp 0.5s ease 0.22s forwards",
      }}>
        {devStats.map((s, i) => (
          <div key={i} style={{
            padding: "16px 14px", borderRadius: 12, textAlign: "center",
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(217,178,122,0.12)",
            cursor: "default",
          }}>
            <div style={{
              fontFamily: THEME.serif, fontSize: 22, fontWeight: 500,
              color: THEME.gold, lineHeight: 1, marginBottom: 4,
              animation: "po2CountUp 0.5s ease",
            }}>{s.value}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: THEME.cream, marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: 9.5, color: "rgba(244,234,216,0.4)", letterSpacing: 0.3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Domains */}
      <div style={{ opacity: 0, animation: "po2FadeUp 0.5s ease 0.3s forwards" }}>
        <div style={{ fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(244,234,216,0.4)", marginBottom: 10 }}>
          Domains of excellence
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {KALYANI_DOMAINS.map((d, i) => (
            <div key={i} style={{
              padding: "6px 13px", borderRadius: 99,
              background: "rgba(217,178,122,0.06)", border: "1px solid rgba(217,178,122,0.15)",
              fontSize: 11, color: "rgba(244,234,216,0.68)",
            }}>{d}</div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─── Tab: Key Stats & Highlights ─────────────────────────────────────────
function TabHighlights({ navigate }) {
  const highlights = [
    { label: "Land Area",         value: "25 Acres",              gold: true },
    { label: "Open Green Space",  value: "20 Acres (80%)",        gold: true },
    { label: "Towers",            value: "10 · G+23 each",        gold: false },
    { label: "Total Homes",       value: "2,522 apartments",      gold: false },
    { label: "Typologies",        value: "1 · 2 · 2.5 · 3 BHK",  gold: false },
    { label: "Amenities",         value: "65 across 2 clubhouses",gold: false },
    { label: "Clubhouse Area",    value: "~1 lakh sft each",      gold: false },
    { label: "Airport Distance",  value: "15 min · KIA",          gold: true },
    { label: "Structure",         value: "RCC Framed · Vastu",    gold: false },
    { label: "Doors",             value: "8′ Engineered Veneer",  gold: false },
    { label: "DG Backup",         value: "100% available",        gold: false },
    { label: "Possession",        value: "September 2029",        gold: true },
  ];

  const constructionUpdates = [
    { date: "May 2025",  phase: "Phase 1 Foundation",     pct: 65 },
    { date: "Feb 2025",  phase: "RERA Registration",      pct: 100 },
    { date: "Mar 2025",  phase: "Clubhouse 01 Design",    pct: 40 },
    { date: "Apr 2025",  phase: "Tower Branding",         pct: 100 },
  ];

  return (
    <div style={{ padding: "16px 20px", overflow: "hidden", display: "flex", flexDirection: "column", height: "100%", gap: 20 }}>

      {/* Fact grid */}
      <div>
        <div style={{ fontSize: 8.5, letterSpacing: 3, textTransform: "uppercase", color: "rgba(217,178,122,0.5)", marginBottom: 12 }}>
          Key Facts
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0,
          border: "1px solid rgba(217,178,122,0.12)", borderRadius: 12, overflow: "hidden",
        }}>
          {highlights.map((h, i) => (
            <div key={i} style={{
              padding: "10px 14px",
              borderBottom: i < highlights.length - 2 ? "1px solid rgba(217,178,122,0.08)" : "none",
              borderRight: i % 2 === 0 ? "1px solid rgba(217,178,122,0.08)" : "none",
              opacity: 0,
              animation: `po2FadeIn 0.35s ease ${0.04 + i * 0.04}s forwards`,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(244,234,216,0.38)", marginBottom: 3 }}>
                {h.label}
              </div>
              <div style={{
                fontSize: 12.5, fontWeight: 600,
                color: h.gold ? THEME.gold : THEME.cream,
              }}>
                {h.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Construction progress */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 8.5, letterSpacing: 3, textTransform: "uppercase", color: "rgba(217,178,122,0.5)" }}>
            Build Progress
          </div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 99,
            background: "rgba(127,185,85,0.1)", border: "1px solid rgba(127,185,85,0.28)",
            fontSize: 9.5, letterSpacing: 1, color: THEME.green,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: "50%", background: THEME.green,
              animation: "po2PulseGlow 1.8s ease infinite",
            }}/>
            Live · 2025
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {constructionUpdates.map((u, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              opacity: 0, animation: `po2FadeUp 0.35s ease ${0.1 + i * 0.07}s forwards`,
            }}>
              <div style={{ fontSize: 9, letterSpacing: 1.5, color: "rgba(244,234,216,0.38)", width: 56, flexShrink: 0 }}>
                {u.date}
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 500, color: THEME.cream, width: 160, flexShrink: 0 }}>
                {u.phase}
              </div>
              <div style={{ flex: 1, position: "relative" }}>
                <div style={{
                  height: 4, borderRadius: 99,
                  background: "rgba(255,255,255,0.06)", overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", borderRadius: 99, width: `${u.pct}%`,
                    background: u.pct === 100
                      ? `linear-gradient(90deg, ${THEME.goldDeep}, ${THEME.gold})`
                      : `linear-gradient(90deg, rgba(127,185,85,0.7), ${THEME.green})`,
                    transformOrigin: "left",
                    animation: `po2BarGrow 0.8s cubic-bezier(0.34,1.1,0.64,1) ${0.2 + i * 0.1}s backwards`,
                  }} />
                </div>
              </div>
              <div style={{
                fontSize: 10, fontWeight: 600, width: 42, textAlign: "right", flexShrink: 0,
                color: u.pct === 100 ? THEME.gold : THEME.green,
              }}>
                {u.pct}%
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─── Right panel: tabbed explorer ─────────────────────────────────────────
function ExplorerPanel({ navigate }) {
  const tabs = [
    { key: "usps",        label: "Differentiators" },
    { key: "north",       label: "Why North BLR" },
    { key: "developer",   label: "Developer" },
    { key: "highlights",  label: "Key Facts" },
  ];
  const [activeTab, setActiveTab] = React.useState("usps");

  const renderTab = () => {
    if (activeTab === "usps")       return <TabUSPs />;
    if (activeTab === "north")      return <TabNorth />;
    if (activeTab === "developer")  return <TabDeveloper />;
    if (activeTab === "highlights") return <TabHighlights navigate={navigate} />;
    return null;
  };

  // Image carousel in the header area of explorer
  const renders = [
    "assets/renders/render-04.jpg",
    "assets/renders/masterplan-03.jpg",
    "assets/renders/render-05.jpg",
  ];
  const [renderIdx, setRenderIdx] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setRenderIdx(p => (p + 1) % renders.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      flex: 1,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>

      {/* Image header strip */}
      <div style={{
        height: 188, flexShrink: 0,
        position: "relative", overflow: "hidden",
      }}>
        <img
          key={renderIdx}
          src={renders[renderIdx]}
          alt=""
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            objectPosition: "center 35%",
            animation: "po2ScaleIn 0.7s ease",
          }}
          onError={e => { e.target.style.display = "none"; }}
        />
        {/* overlay gradient */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(10,18,13,0.2) 0%, rgba(10,18,13,0.0) 40%, rgba(10,18,13,0.92) 100%)",
        }} />
        {/* image dots */}
        <div style={{
          position: "absolute", bottom: 14, right: 18, display: "flex", gap: 5,
        }}>
          {renders.map((_, i) => (
            <button
              key={i}
              onClick={() => setRenderIdx(i)}
              style={{
                width: i === renderIdx ? 18 : 6, height: 6, borderRadius: 99, padding: 0,
                background: i === renderIdx ? THEME.gold : "rgba(255,255,255,0.4)",
                border: "none", cursor: "pointer",
                transition: "all 0.35s ease",
              }}
            />
          ))}
        </div>
        {/* label bottom-left */}
        <div style={{
          position: "absolute", bottom: 16, left: 22,
          fontFamily: THEME.serif, fontSize: 11, fontStyle: "italic",
          color: "rgba(244,234,216,0.7)", letterSpacing: 0.3,
        }}>
          {["Night aerial · North Bangalore", "Master Plan · 25 acres", "Tower numbering plan"][renderIdx]}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        display: "flex", gap: 0, padding: "0", flexShrink: 0,
        borderBottom: "1px solid rgba(217,178,122,0.12)",
        background: "rgba(10,18,13,0.6)",
      }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`po2-tab-btn${activeTab === tab.key ? " active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1, padding: "13px 10px",
              background: activeTab === tab.key ? "rgba(217,178,122,0.12)" : "transparent",
              border: "none",
              borderBottom: `2px solid ${activeTab === tab.key ? THEME.gold : "transparent"}`,
              color: activeTab === tab.key ? THEME.gold : "rgba(244,234,216,0.55)",
              fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
              cursor: "pointer", fontFamily: THEME.sans,
              transition: "all 0.22s",
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content — fixed height, no scroll */}
      <div key={activeTab} style={{
        flex: 1, overflow: "hidden",
        animation: "po2TabReveal 0.3s ease",
      }}>
        {renderTab()}
      </div>

    </div>
  );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────
function ProjectOverviewScreen({ onBack, navigate }) {
  React.useEffect(() => { injectStyles(); }, []);

  return (
    <ScreenShell title="Project Overview" eyebrow="LivingTree by Kalyani Developers" onBack={onBack} scroll={false} pad={false}>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex",
        overflow: "hidden",
        background: THEME.bg,
      }}>
        {/* Left: cinematic hero + stat grid + nav */}
        <HeroPanel navigate={navigate} />

        {/* Right: tabbed explorer */}
        <ExplorerPanel navigate={navigate} />
      </div>
    </ScreenShell>
  );
}

window.SCREENS = window.SCREENS || {};
window.SCREENS["projectover"] = ProjectOverviewScreen;

})();
