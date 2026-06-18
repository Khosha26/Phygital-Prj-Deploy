// AmenitiesScreen — Living Tree by Kalyani Developers
// Showcases all 65 amenities across 5 categories with animated count-ups,
// category filter, featured marquee strip, and a full card grid.

function AmenitiesScreen({ onBack, navigate }) {
  // ── inject keyframes once ──────────────────────────────────────────────────
  React.useEffect(() => {
    const id = "lt-amenities-kf";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes amenFadeUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:none; } }
      @keyframes amenFadeIn   { from { opacity:0; } to { opacity:1; } }
      @keyframes amenScaleIn  { from { opacity:0; transform:scale(0.88); } to { opacity:1; transform:scale(1); } }
      @keyframes amenSlideIn  { from { opacity:0; transform:translateX(-14px); } to { opacity:1; transform:none; } }
      @keyframes amenPulse    { 0%,100%{ box-shadow:0 0 0 0 rgba(217,178,122,0.0); } 50%{ box-shadow:0 0 0 8px rgba(217,178,122,0.12); } }
      @keyframes amenBreathe  { 0%,100%{ opacity:0.7; } 50%{ opacity:1; } }
      @keyframes amenCountUp  { from { opacity:0; transform:translateY(6px) scale(0.92); } to { opacity:1; transform:none; } }
      @keyframes amenCardIn   { from { opacity:0; transform:translateY(22px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }
      @keyframes amenShimmer  {
        0%   { background-position: -400px 0; }
        100% { background-position:  400px 0; }
      }
      @keyframes amenHeroGlow { 0%,100%{ opacity:0.4; } 50%{ opacity:0.7; } }
    `;
    document.head.appendChild(style);
  }, []);

  // ── animated counter hook ──────────────────────────────────────────────────
  function useAnimCount(target, duration, delay) {
    const [val, setVal] = React.useState(0);
    React.useEffect(() => {
      let raf;
      const t0 = performance.now() + (delay || 0);
      const tick = (now) => {
        if (now < t0) { raf = requestAnimationFrame(tick); return; }
        const elapsed = now - t0;
        const p = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(target * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [target, duration, delay]);
    return val;
  }

  // ── category state ─────────────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = React.useState("All");
  const [hoveredCard, setHoveredCard] = React.useState(null);

  // ── count-up numbers ───────────────────────────────────────────────────────
  const countAmenities  = useAnimCount(65,   1600, 200);
  const countClubhouses = useAnimCount(2,    1000, 400);
  const countAcres      = useAnimCount(20,   1400, 600);
  const countSft        = useAnimCount(1,    1200, 800);   // "1 lakh sft each"

  // ── categories meta ────────────────────────────────────────────────────────
  const catMeta = [
    { key: "All",      color: THEME.gold,       accent: "rgba(217,178,122,0.18)", label: "All" },
    { key: "Sport",    color: "#f97316",         accent: "rgba(249,115,22,0.14)",  label: "Sport" },
    { key: "Social",   color: "#a78bfa",         accent: "rgba(167,139,250,0.14)", label: "Social" },
    { key: "Wellness", color: "#34d399",         accent: "rgba(52,211,153,0.14)",  label: "Wellness" },
    { key: "Family",   color: "#f472b6",         accent: "rgba(244,114,182,0.14)", label: "Family" },
    { key: "Water",    color: "#38bdf8",         accent: "rgba(56,189,248,0.14)",  label: "Water" },
  ];

  function getCatColor(catKey) {
    const m = catMeta.find(c => c.key === catKey);
    return m ? m.color : THEME.gold;
  }

  // ── build flat list with category colour ──────────────────────────────────
  const allItems = React.useMemo(() => {
    const out = [];
    AMENITIES.forEach(group => {
      group.items.forEach(item => {
        out.push({ ...item, cat: group.cat, catColor: getCatColor(group.cat) });
      });
    });
    return out.sort((a, b) => a.n - b.n);
  }, []);

  const filteredItems = React.useMemo(() => {
    if (activeCategory === "All") return allItems;
    return allItems.filter(it => it.cat === activeCategory);
  }, [allItems, activeCategory]);

  const countPerCat = React.useMemo(() => {
    const map = { All: allItems.length };
    AMENITIES.forEach(g => { map[g.cat] = g.items.length; });
    return map;
  }, [allItems]);

  // ── featured marquee amenities ─────────────────────────────────────────────
  const featuredAmenities = [
    { label: "Infinity Edge Pool",   cat: "Water",    icon: "water",   n: 36, desc: "Panoramic view pool · Clubhouse North" },
    { label: "Lap Pool",             cat: "Water",    icon: "water",   n: 41, desc: "50-metre training pool · Clubhouse South" },
    { label: "Aqua Gym + Jacuzzi",   cat: "Water",    icon: "water",   n: 38, desc: "Hydrotherapy & training · both clubhouses" },
    { label: "Amphitheatre",         cat: "Social",   icon: "social",  n: 31, desc: "Open-air stage & seating" },
    { label: "Mega Court",           cat: "Sport",    icon: "sport",   n: 54, desc: "Multi-sport mega arena" },
    { label: "Cricket Maidan",       cat: "Sport",    icon: "sport",   n: 61, desc: "Full-size cricket ground" },
    { label: "Yoga / Meditation",    cat: "Wellness", icon: "wellness",n: 12, desc: "Dedicated mindfulness zone" },
    { label: "Woodland",             cat: "Wellness", icon: "wellness",n: 52, desc: "20 acres of curated green" },
  ];

  // ── category SVG icons ─────────────────────────────────────────────────────
  function CategoryIcon({ cat, size = 16, color = "currentColor" }) {
    const sw = 1.5;
    const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none",
                    stroke: color, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" };
    if (cat === "Sport")
      return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M4.5 7.5C6 9 6 12 9 12s5-3 6-3 4 1.5 4.5 3"/><path d="M4 13c2 2 4 2 6 0s4-2 6 0"/></svg>;
    if (cat === "Social")
      return <svg {...props}><circle cx="9" cy="7" r="3"/><circle cx="16" cy="8" r="2.5"/><path d="M2 20v-1a7 7 0 0 1 14 0v1"/><path d="M16 14a5 5 0 0 1 6 6"/></svg>;
    if (cat === "Wellness")
      return <svg {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 8v4l3 3"/></svg>;
    if (cat === "Family")
      return <svg {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    if (cat === "Water")
      return <svg {...props}><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z"/></svg>;
    // All
    return <svg {...props}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>;
  }

  function FeaturedIcon({ cat, size = 22, color = "currentColor" }) {
    return <CategoryIcon cat={cat} size={size} color={color} />;
  }

  // ── styles ─────────────────────────────────────────────────────────────────
  const amenStyles = {
    // hero band
    hero: {
      position: "relative",
      background: "linear-gradient(135deg, rgba(19,32,26,0.96) 0%, rgba(13,22,16,0.92) 100%)",
      border: `1px solid ${THEME.line}`,
      borderRadius: 18,
      padding: "28px 36px",
      marginBottom: 22,
      overflow: "hidden",
      animation: "amenFadeUp 0.7s ease both",
    },
    heroGlow: {
      position: "absolute", top: -80, right: -80, width: 320, height: 320,
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(217,178,122,0.12) 0%, transparent 70%)",
      animation: "amenHeroGlow 4s ease-in-out infinite",
      pointerEvents: "none",
    },
    heroGlow2: {
      position: "absolute", bottom: -60, left: -40, width: 220, height: 220,
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(127,185,85,0.1) 0%, transparent 70%)",
      animation: "amenHeroGlow 5s ease-in-out 1.5s infinite",
      pointerEvents: "none",
    },
    statBlock: {
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "0 32px",
      borderRight: `1px solid ${THEME.line}`,
    },
    statNum: {
      fontFamily: THEME.serif, fontSize: 52, fontWeight: 600,
      color: THEME.cream, lineHeight: 1,
      letterSpacing: -1,
    },
    statUnit: {
      fontFamily: THEME.serif, fontSize: 20, fontStyle: "italic",
      color: THEME.gold, marginLeft: 6,
    },
    statLabel: {
      fontSize: 9.5, letterSpacing: 3, textTransform: "uppercase",
      color: "rgba(244,234,216,0.5)", marginTop: 6,
    },
    statSub: {
      fontSize: 10.5, color: THEME.dim, marginTop: 3, letterSpacing: 0.3,
    },
    // filter bar
    filterBar: {
      display: "flex", alignItems: "center", gap: 8,
      marginBottom: 18,
      animation: "amenFadeUp 0.7s ease 0.2s both",
    },
    filterBtn: {
      display: "flex", alignItems: "center", gap: 6,
      padding: "8px 16px", borderRadius: 999,
      border: `1px solid ${THEME.line}`,
      background: THEME.glass,
      color: THEME.cream,
      cursor: "pointer",
      fontSize: 11.5, fontWeight: 600, letterSpacing: 0.5,
      transition: "all 0.22s",
      fontFamily: THEME.sans,
    },
    // featured strip
    featuredStrip: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 10,
      marginBottom: 22,
      animation: "amenFadeUp 0.7s ease 0.3s both",
    },
    featuredCard: {
      position: "relative",
      background: "linear-gradient(135deg, rgba(19,32,26,0.96), rgba(13,22,16,0.92))",
      border: `1px solid ${THEME.line}`,
      borderRadius: 14,
      padding: "16px 18px",
      overflow: "hidden",
      cursor: "default",
      transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s, border-color 0.25s",
    },
    // amenity grid
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(5, 1fr)",
      gap: 9,
    },
    amenCard: {
      position: "relative",
      background: "rgba(19,32,26,0.85)",
      border: `1px solid ${THEME.lineSoft}`,
      borderRadius: 12,
      padding: "13px 14px 12px",
      overflow: "hidden",
      cursor: "default",
      transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1), border-color 0.22s, box-shadow 0.22s",
    },
  };

  return (
    <ScreenShell
      title="Amenities"
      eyebrow="Double Everything · 65 across Two Clubhouses"
      onBack={onBack}
      scroll={true}
      pad={true}
    >
      {/* ── HERO STAT BAND ─────────────────────────────────────────── */}
      <div style={amenStyles.hero}>
        <div style={amenStyles.heroGlow} />
        <div style={amenStyles.heroGlow2} />

        <div style={{ display: "flex", alignItems: "center", gap: 0, position: "relative", zIndex: 1 }}>
          {/* Stat 1 — 65 amenities */}
          <div style={{ ...amenStyles.statBlock, paddingLeft: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <span style={amenStyles.statNum}>{countAmenities}</span>
              <span style={amenStyles.statUnit}>+</span>
            </div>
            <div style={amenStyles.statLabel}>Amenities</div>
            <div style={amenStyles.statSub}>Across both clubhouses</div>
          </div>

          {/* Stat 2 — 2 clubhouses */}
          <div style={amenStyles.statBlock}>
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <span style={amenStyles.statNum}>{countClubhouses}</span>
            </div>
            <div style={amenStyles.statLabel}>Clubhouses</div>
            <div style={amenStyles.statSub}>~1 lakh sft each</div>
          </div>

          {/* Stat 3 — 1 lakh sft */}
          <div style={amenStyles.statBlock}>
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <span style={amenStyles.statNum}>{countSft}</span>
              <span style={amenStyles.statUnit}>lakh sft</span>
            </div>
            <div style={amenStyles.statLabel}>Per Clubhouse</div>
            <div style={amenStyles.statSub}>North &amp; South both equal</div>
          </div>

          {/* Stat 4 — 20 acres */}
          <div style={{ ...amenStyles.statBlock, borderRight: "none" }}>
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <span style={amenStyles.statNum}>{countAcres}</span>
              <span style={amenStyles.statUnit}>acres</span>
            </div>
            <div style={amenStyles.statLabel}>Open Spaces</div>
            <div style={amenStyles.statSub}>Flowing-roots landscape</div>
          </div>

          {/* Divider + descriptor */}
          <div style={{
            flex: 1, paddingLeft: 36,
            borderLeft: `1px solid ${THEME.line}`,
          }}>
            <div style={{
              fontSize: 9.5, letterSpacing: 3.5, textTransform: "uppercase",
              color: THEME.gold, marginBottom: 10,
            }}>The Double Everything Concept</div>
            <div style={{
              fontFamily: THEME.serif, fontSize: 22, fontWeight: 500, color: THEME.cream,
              lineHeight: 1.38, marginBottom: 12,
            }}>
              Every amenity mirrored — North &amp; South.
              <span style={{ fontStyle: "italic", color: THEME.gold }}> Easy access</span> from any tower.
            </div>
            <div style={{ fontSize: 11.5, color: THEME.dim, lineHeight: 1.7, maxWidth: 340 }}>
              Two full clubhouses, two pools, two wellness zones — the project is designed so no resident ever
              needs to cross more than half the campus to reach world-class facilities.
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURED MARQUEE STRIP ─────────────────────────────────── */}
      <div style={{
        fontSize: 9, letterSpacing: 3.5, textTransform: "uppercase",
        color: THEME.gold, marginBottom: 10,
        animation: "amenFadeUp 0.6s ease 0.25s both",
      }}>Marquee Amenities</div>

      <div style={amenStyles.featuredStrip}>
        {featuredAmenities.map((fa, i) => {
          const cc = getCatColor(fa.cat);
          return (
            <div
              key={fa.n}
              style={{
                ...amenStyles.featuredCard,
                animationDelay: `${0.3 + i * 0.06}s`,
                animation: `amenCardIn 0.55s cubic-bezier(0.34,1.56,0.64,1) ${0.3 + i * 0.06}s both`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                e.currentTarget.style.borderColor = cc;
                e.currentTarget.style.boxShadow = `0 14px 36px rgba(0,0,0,0.4), 0 0 0 1px ${cc}40`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.borderColor = THEME.line;
                e.currentTarget.style.boxShadow = "";
              }}
            >
              {/* accent bar */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                background: `linear-gradient(90deg, ${cc}, transparent)`,
                borderRadius: "14px 14px 0 0",
              }} />
              {/* glow blob */}
              <div style={{
                position: "absolute", top: -30, right: -20, width: 100, height: 100,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${cc}22 0%, transparent 70%)`,
                pointerEvents: "none",
              }} />

              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, position: "relative" }}>
                {/* icon circle */}
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: `${cc}18`,
                  border: `1px solid ${cc}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <FeaturedIcon cat={fa.cat} size={18} color={cc} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: THEME.serif, fontSize: 15, fontWeight: 500, color: THEME.cream,
                    lineHeight: 1.25, marginBottom: 4,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>{fa.label}</div>
                  <div style={{ fontSize: 10.5, color: THEME.dim, lineHeight: 1.5 }}>{fa.desc}</div>
                </div>
                {/* legend number */}
                <div style={{
                  fontSize: 9, fontFamily: THEME.serif, fontStyle: "italic",
                  color: cc, opacity: 0.8, flexShrink: 0, marginTop: 2,
                }}>#{fa.n}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── CATEGORY FILTER BAR ────────────────────────────────────── */}
      <div style={amenStyles.filterBar}>
        <div style={{
          fontSize: 9, letterSpacing: 3, textTransform: "uppercase",
          color: "rgba(244,234,216,0.45)", marginRight: 4, whiteSpace: "nowrap",
        }}>Filter</div>

        {catMeta.map(cm => {
          const isActive = activeCategory === cm.key;
          return (
            <button
              key={cm.key}
              onClick={() => setActiveCategory(cm.key)}
              style={{
                ...amenStyles.filterBtn,
                background: isActive ? cm.accent : THEME.glass,
                borderColor: isActive ? cm.color : THEME.line,
                color: isActive ? cm.color : THEME.cream,
                boxShadow: isActive ? `0 0 0 1px ${cm.color}40` : "none",
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = cm.accent;
                  e.currentTarget.style.borderColor = cm.color + "60";
                  e.currentTarget.style.color = cm.color;
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = THEME.glass;
                  e.currentTarget.style.borderColor = THEME.line;
                  e.currentTarget.style.color = THEME.cream;
                }
              }}
            >
              <CategoryIcon cat={cm.key} size={13} color={isActive ? cm.color : "currentColor"} />
              {cm.label}
              <span style={{
                fontSize: 9.5,
                background: isActive ? cm.color : "rgba(244,234,216,0.15)",
                color: isActive ? (cm.key === "All" ? THEME.ink : "#0a120d") : THEME.dim,
                borderRadius: 999, padding: "1px 6px", marginLeft: 2, fontWeight: 700,
              }}>{countPerCat[cm.key]}</span>
            </button>
          );
        })}

        <div style={{ flex: 1 }} />
        <div style={{
          fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
          color: "rgba(244,234,216,0.35)",
        }}>
          {filteredItems.length} of 65 shown
        </div>
      </div>

      {/* ── SECTION LABEL ──────────────────────────────────────────── */}
      {activeCategory !== "All" && (
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          marginBottom: 14,
          animation: "amenSlideIn 0.35s ease both",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: `${getCatColor(activeCategory)}18`,
            border: `1px solid ${getCatColor(activeCategory)}50`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <CategoryIcon cat={activeCategory} size={17} color={getCatColor(activeCategory)} />
          </div>
          <div>
            <div style={{
              fontFamily: THEME.serif, fontSize: 18, fontWeight: 500, color: THEME.cream,
            }}>{activeCategory} Amenities</div>
            <div style={{ fontSize: 10, color: THEME.dim, letterSpacing: 0.5 }}>
              {countPerCat[activeCategory]} in this category
            </div>
          </div>
        </div>
      )}

      {/* ── AMENITY CARD GRID ──────────────────────────────────────── */}
      <div style={amenStyles.grid}>
        {filteredItems.map((item, i) => {
          const cc = item.catColor;
          const isHov = hoveredCard === `${item.n}`;
          return (
            <div
              key={`${item.n}-${activeCategory}`}
              style={{
                ...amenStyles.amenCard,
                animation: `amenCardIn 0.45s cubic-bezier(0.34,1.56,0.64,1) ${Math.min(i * 0.03, 0.6)}s both`,
                transform: isHov ? "translateY(-3px) scale(1.025)" : "none",
                borderColor: isHov ? `${cc}70` : THEME.lineSoft,
                boxShadow: isHov ? `0 10px 30px rgba(0,0,0,0.45), 0 0 0 1px ${cc}30` : "none",
              }}
              onMouseEnter={() => setHoveredCard(`${item.n}`)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* top accent line */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, ${cc}90, transparent)`,
                borderRadius: "12px 12px 0 0",
                opacity: isHov ? 1 : 0.5,
                transition: "opacity 0.22s",
              }} />

              {/* glow on hover */}
              {isHov && (
                <div style={{
                  position: "absolute", top: -40, right: -20, width: 90, height: 90,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${cc}18 0%, transparent 70%)`,
                  pointerEvents: "none",
                }} />
              )}

              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 7 }}>
                {/* legend number badge */}
                <div style={{
                  fontSize: 9, fontFamily: THEME.serif, fontStyle: "italic",
                  color: cc, background: `${cc}15`,
                  border: `1px solid ${cc}35`,
                  borderRadius: 6, padding: "2px 6px",
                  fontWeight: 600, letterSpacing: 0.2,
                  flexShrink: 0,
                }}>#{item.n}</div>

                {/* category dot */}
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: cc, opacity: 0.7, marginTop: 2, flexShrink: 0,
                }} />
              </div>

              {/* amenity name */}
              <div style={{
                fontSize: 12, fontWeight: 600, color: THEME.cream,
                lineHeight: 1.35, letterSpacing: 0.1,
                fontFamily: THEME.sans,
              }}>{item.label}</div>

              {/* category label — small */}
              <div style={{
                fontSize: 9.5, color: cc, marginTop: 5, letterSpacing: 0.3,
                display: "flex", alignItems: "center", gap: 4,
                opacity: 0.85,
              }}>
                <CategoryIcon cat={item.cat} size={9} color={cc} />
                {item.cat}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── MASTERPLAN CTA ─────────────────────────────────────────── */}
      <div style={{
        marginTop: 24,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 26px",
        background: "rgba(19,32,26,0.8)",
        border: `1px solid ${THEME.line}`,
        borderRadius: 14,
        animation: "amenFadeUp 0.6s ease 0.5s both",
      }}>
        <div>
          <div style={{
            fontSize: 9, letterSpacing: 3, textTransform: "uppercase",
            color: THEME.gold, marginBottom: 6,
          }}>View on Map</div>
          <div style={{ fontFamily: THEME.serif, fontSize: 17, color: THEME.cream }}>
            All 65 amenities are numbered on the master plan
          </div>
          <div style={{ fontSize: 11, color: THEME.dim, marginTop: 3 }}>
            Each legend pin corresponds to the <span style={{ color: THEME.gold }}>#number</span> shown on every card above
          </div>
        </div>
        <button
          style={{
            background: "linear-gradient(135deg, #d9b27a, #b9874a)",
            color: THEME.ink, border: "none",
            padding: "11px 22px", borderRadius: 999, fontSize: 12.5, fontWeight: 700,
            letterSpacing: 0.6, cursor: "pointer",
            boxShadow: "0 12px 28px rgba(217,178,122,0.28)",
            display: "flex", alignItems: "center", gap: 8,
            transition: "transform 0.2s, box-shadow 0.2s",
            fontFamily: THEME.sans,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 16px 36px rgba(217,178,122,0.38)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 12px 28px rgba(217,178,122,0.28)"; }}
          onClick={() => navigate && navigate("masterplan")}
        >
          Open Master Plan
          <span style={{ display: "inline-block", animation: "nudge 1.6s ease-in-out infinite" }}>→</span>
        </button>
      </div>

    </ScreenShell>
  );
}

window.SCREENS = window.SCREENS || {};
window.SCREENS["amenities"] = AmenitiesScreen;
