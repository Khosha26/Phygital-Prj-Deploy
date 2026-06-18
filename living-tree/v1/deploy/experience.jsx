// Living Tree — Master Experience
// Consolidates variants 1, 3, 4, 5, 9, 10. Cinematic single-page landing.

const STAGE_W = 1440;
const STAGE_H = 900;

const FACTS = {
  loc: "KIADB Aerospace Park · Bagalur · North Bengaluru",
  airport: "15 min · Kempegowda Int'l Airport",
  acres: 25,
  towers: 10,
  units: 2522,
  amenities: 60,
  openPct: 80,
  rera: "PRM/KA/RERA/1251/309/PR/260924/007084",
  estd: 1991,
};

const BHK_DATA = [
  { tag: "1 BHK", size: "576 sqft",         price: "₹48.9 L*",    priceNum: "48.9 L",   units: 404,  active: 12 },
  { tag: "2 BHK", size: "1,041–1,054 sqft", price: "₹75.0 L*",    priceNum: "75.0 L",   units: 892,  active: 38 },
  { tag: "2.5",   size: "1,135–1,143 sqft", price: "₹82.0 L*",    priceNum: "82.0 L",   units: 586,  active: 24 },
  { tag: "3 BHK", size: "1,316–1,927 sqft", price: "₹1.21 Cr*",   priceNum: "1.21 Cr",  units: 640,  active: 16 },
];

// Shared theme + backdrop — used by the home screen and every inner screen.
const CANOPY = "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1800&q=80&auto=format&fit=crop";
const THEME = {
  bg: "#0a120d", bgPanel: "#0f1813", panel: "#13201a",
  gold: "#d9b27a", goldDeep: "#b9874a", goldSoft: "rgba(217,178,122,0.14)",
  cream: "#f4ead8", dim: "rgba(244,234,216,0.6)",
  green: "#7fb955", greenLine: "rgb(120,210,95)", ink: "#1a2620",
  glass: "rgba(255,255,255,0.06)",
  line: "rgba(217,178,122,0.22)", lineSoft: "rgba(217,178,122,0.13)", lineStrong: "rgba(217,178,122,0.42)",
  serif: "'Cormorant Garamond', serif", sans: "Inter, sans-serif",
};

// Constellation menu — 11 nodes. projectover is the center; the rest are
// scattered around it in two flanking columns plus two outliers (per sketch).
// x / y are absolute stage coordinates (1440 × 900) of each node's centre.
const NODES = [
  { key: "projectover", label: "Project Overview", hint: "Cinematic walk-through",   Icon: IconOverview,   x: 720,  y: 430, center: true },
  { key: "gallery",     label: "Gallery",          hint: "Renders & site visuals",   Icon: IconGallery,    x: 722,  y: 250 },
  { key: "masterplan",  label: "Master Plan",      hint: "25 acres · 10 towers",     Icon: IconMasterPlan, x: 566,  y: 286 },
  { key: "location",    label: "Location",         hint: "Aerospace Park · Bagalur", Icon: IconLocation,   x: 876,  y: 290 },
  { key: "floorplan",   label: "Floor Plans",      hint: "1 · 2 · 2.5 · 3 BHK",      Icon: IconFloorPlan,  x: 552,  y: 432 },
  { key: "inventory",   label: "Inventory",        hint: "Live unit availability",   Icon: IconInventory,  x: 888,  y: 428 },
  { key: "amenities",   label: "Amenities",        hint: "60+ · 80% open green",     Icon: IconAdvantages, x: 568,  y: 574 },
  { key: "booking",     label: "Booking",          hint: "EOI · payment plan",       Icon: IconBooking,    x: 874,  y: 578 },
  { key: "gre",         label: "GRE App",          hint: "Guest experience",         Icon: IconGRE,        x: 718,  y: 610 },
  { key: "emailsender", label: "Email Sender",     hint: "Brochures & offers",       Icon: IconEmail,      x: 366,  y: 434 },
  { key: "minicrm",     label: "Mini CRM",         hint: "Leads & follow-ups",       Icon: IconCRM,        x: 1074, y: 426 },
];

// ============================================================
// useCount — animated counter
// ============================================================
const useCount = (target, { duration = 1800, delay = 0 } = {}) => {
  const [value, setValue] = React.useState(0);
  React.useEffect(() => {
    let raf, start;
    const startTime = performance.now() + delay;
    const tick = (now) => {
      if (now < startTime) { raf = requestAnimationFrame(tick); return; }
      if (!start) start = now;
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay]);
  return value;
};

// ============================================================
// Ambient drifting leaves
// ============================================================
const AmbientLeaves = () => {
  const leaves = React.useMemo(() =>
    Array.from({ length: 34 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 10 + Math.random() * 16,
      duration: 16 + Math.random() * 20,
      delay: -Math.random() * 32,
      drift: (Math.random() - 0.5) * 150,
      rotateStart: Math.random() * 360,
      rotateEnd: Math.random() * 720 + 360,
      opacity: 0.10 + Math.random() * 0.21,
      depth: Math.random(),
    })), []);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {leaves.map(l => (
        <div key={l.id} style={{
          position: "absolute",
          left: `${l.left}%`,
          top: "-40px",
          animation: `leafFall ${l.duration}s linear ${l.delay}s infinite`,
          "--driftX": `${l.drift}px`,
          "--rotS": `${l.rotateStart}deg`,
          "--rotE": `${l.rotateEnd}deg`,
          opacity: l.opacity,
          filter: `blur(${(1 - l.depth) * 1.5}px)`,
        }}>
          <Leaf size={l.size} fill="#d9b27a" />
        </div>
      ))}
    </div>
  );
};

// ============================================================
// Animated brand mark — draws itself in
// ============================================================
const AnimatedTreeMark = ({ size = 56, color = "#d9b27a", strokeWidth = 1.2, animate = true }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
       style={{ filter: `drop-shadow(0 0 12px ${color}40)` }}>
    {[
      <circle key="a" cx="32" cy="24" r="16" pathLength="100" />,
      <circle key="b" cx="20" cy="20" r="9" pathLength="100" />,
      <circle key="c" cx="44" cy="20" r="9" pathLength="100" />,
      <circle key="d" cx="32" cy="14" r="9" pathLength="100" />,
      <path key="e" d="M32 38 L32 58" pathLength="100" />,
      <path key="f" d="M32 46 L26 50" pathLength="100" />,
      <path key="g" d="M32 50 L38 54" pathLength="100" />,
    ].map((el, i) => React.cloneElement(el, {
      style: animate ? {
        strokeDasharray: 100,
        strokeDashoffset: 100,
        animation: `treeDraw 1.4s cubic-bezier(0.4, 0, 0.2, 1) ${0.1 + i * 0.15}s forwards`,
      } : {},
    }))}
  </svg>
);

// ============================================================
// Constellation — 11-node menu, projectover at the centre
// ============================================================
const Constellation = ({ onOpen }) => {
  const [hovered, setHovered] = React.useState(null);
  const center = NODES.find(n => n.center);
  const others = NODES.filter(n => !n.center);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none" }}>
      {/* connector lines — centre out to every node */}
      <svg width={STAGE_W} height={STAGE_H}
           style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}>
        {others.map((n) => {
          const lit = hovered === n.key;
          return (
            <line key={n.key}
              x1={center.x} y1={center.y} x2={n.x} y2={n.y}
              stroke="rgb(120,210,95)"
              strokeOpacity={lit ? 0.3 : 0.1}
              strokeWidth={lit ? 1.8 : 1.3}
              strokeDasharray="4 6" strokeLinecap="round"
              style={{
                filter: "drop-shadow(0 0 3px rgba(120,210,95,0.85))",
                transition: "stroke-opacity 0.3s, stroke-width 0.3s",
              }}
            />
          );
        })}
      </svg>

      {/* nodes — all identical style, projectover is just the connector hub */}
      {NODES.map((n, i) => {
        const D = 96;
        const hov = hovered === n.key;
        const lit = hov;
        const delay = 0.9 + i * 0.1;
        return (
          <div key={n.key}
            onMouseEnter={() => setHovered(n.key)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onOpen && onOpen(n.key)}
            style={{
              position: "absolute", left: n.x, top: n.y,
              width: D, height: D, transform: "translate(-50%, -50%)",
              cursor: "pointer", pointerEvents: "auto",
              opacity: 0, animation: `fadeIn 0.6s ease ${delay}s forwards`,
              zIndex: hov ? 6 : 4,
            }}>
            {/* circle */}
            <div style={{
              width: D, height: D, borderRadius: "50%",
              animation: `springIn 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s backwards`,
              willChange: "transform",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: lit
                ? "linear-gradient(135deg, rgba(217,178,122,0.95), rgba(184,140,82,0.88))"
                : "rgba(255,255,255,0.06)",
              border: `1px solid ${lit ? "rgba(217,178,122,0.85)" : "rgba(217,178,122,0.32)"}`,
              backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
              boxShadow: lit
                ? "0 26px 64px rgba(217,178,122,0.42), inset 0 1px 0 rgba(255,255,255,0.28)"
                : "0 18px 44px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.14)",
              transform: hov ? "scale(1.09)" : "scale(1)",
              transition: "background 0.35s, border 0.35s, box-shadow 0.35s, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}>
              <n.Icon size={40}
                stroke={lit ? "#1a2620" : "#f4ead8"}
                strokeWidth={1.3} sw={1.4} />
            </div>
            {/* label + hint, below the circle */}
            <div style={{
              position: "absolute", top: "100%", left: "50%",
              transform: "translateX(-50%)", marginTop: 9,
              textAlign: "center", whiteSpace: "nowrap",
            }}>
              <div style={{
                fontSize: 10.5, fontWeight: 600,
                letterSpacing: 0.5, textTransform: "uppercase",
                color: lit ? "#d9b27a" : "#f4ead8",
                opacity: lit ? 1 : 0.82, transition: "color 0.3s, opacity 0.3s",
              }}>{n.label}</div>
              <div style={{
                fontSize: 9.5, letterSpacing: 0.3, color: "rgba(244,234,216,0.62)",
                maxHeight: hov ? 16 : 0, opacity: hov ? 1 : 0, marginTop: hov ? 3 : 0,
                overflow: "hidden", transition: "all 0.3s",
              }}>{n.hint}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// Live stat rail with counters
// ============================================================
const StatRail = () => {
  const acres   = useCount(FACTS.acres,     { duration: 1400, delay: 400 });
  const towers  = useCount(FACTS.towers,    { duration: 1400, delay: 500 });
  const units   = useCount(FACTS.units,     { duration: 1800, delay: 600 });
  const amen    = useCount(FACTS.amenities, { duration: 1400, delay: 700 });
  const open    = useCount(FACTS.openPct,   { duration: 1400, delay: 800 });

  const items = [
    { v: acres.toFixed(0),       u: "acres",      l: "Land" },
    { v: towers.toFixed(0),       u: "towers",     l: "G + 23 each" },
    { v: Math.round(units).toLocaleString("en-IN"), u: "homes", l: "1·2·2.5·3 BHK" },
    { v: amen.toFixed(0) + "+",   u: "amenities",  l: "2 clubhouses" },
    { v: open.toFixed(0) + "%",   u: "open",       l: "Green spaces" },
  ];
  const fs = { num: 28, unit: 13, lbl: 9 };
  return (
    <div style={{
      display: "flex", gap: 0, width: "100%",
      animation: "fadeUp 1s ease 0.6s backwards",
    }}>
      {items.map((it, i) => (
        <div key={i} style={{
          flex: 1, padding: "0 22px", textAlign: "center",
          borderLeft: i === 0 ? "none" : "1px solid rgba(217,178,122,0.18)",
        }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: fs.num, fontWeight: 500, color: "#f4ead8", lineHeight: 1,
            letterSpacing: -0.5,
          }}>
            {it.v}<span style={{ fontSize: fs.unit, color: "#d9b27a", marginLeft: 5, fontStyle: "italic" }}>{it.u}</span>
          </div>
          <div style={{
            fontSize: fs.lbl, letterSpacing: 2.5, textTransform: "uppercase",
            color: "rgba(244,234,216,0.55)", marginTop: 4,
          }}>
            {it.l}
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// BHK configurator strip
// ============================================================
const BHKConfigurator = ({ active, setActive }) => {
  const bhk = BHK_DATA[active];
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 24,
      background: "rgba(15,24,19,0.7)",
      border: "1px solid rgba(217,178,122,0.22)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      padding: "18px 24px", borderRadius: 999,
      animation: "fadeUp 1s ease 1.4s backwards",
    }}>
      <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(244,234,216,0.55)", textTransform: "uppercase" }}>
        Configure
      </div>
      <div style={{ display: "flex", gap: 4, background: "rgba(217,178,122,0.06)", borderRadius: 999, padding: 4 }}>
        {BHK_DATA.map((b, i) => (
          <button key={b.tag} onClick={() => setActive(i)} style={{
            background: i === active ? "#d9b27a" : "transparent",
            color: i === active ? "#1a2620" : "#f4ead8",
            border: "none", padding: "8px 16px", borderRadius: 999,
            fontSize: 12, fontWeight: 600, letterSpacing: 0.4, cursor: "pointer",
            transition: "all 0.25s",
          }}>{b.tag}</button>
        ))}
      </div>
      <div style={{ height: 36, width: 1, background: "rgba(217,178,122,0.18)" }}/>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, color: "#f4ead8", whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", opacity: 0.55 }}>From</span>
        <span key={bhk.tag} style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500, color: "#d9b27a",
          animation: "fadeUp 0.4s ease",
        }}>{bhk.price}</span>
        <span style={{ fontSize: 11.5, opacity: 0.55 }}>· {bhk.size}</span>
      </div>
      <div style={{ height: 36, width: 1, background: "rgba(217,178,122,0.18)" }}/>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 11, color: "#f4ead8", minWidth: 140 }}>
        <div style={{ opacity: 0.55, letterSpacing: 2, textTransform: "uppercase", fontSize: 9.5 }}>Available now</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%", background: "#7fb955",
            boxShadow: "0 0 10px #7fb955", animation: "pulse 1.6s ease-in-out infinite",
          }}/>
          <span><b>{bhk.units}</b> units · <b style={{ color: "#d9b27a" }}>{bhk.active}</b> being viewed</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Bird — animated hummingbird helper (pointer-events:none always)
// ============================================================
// bird.webp faces RIGHT. When flying leftward, flip with scaleX(-1).
// Props: x, y, size, dir ("left"|"right"), style (extra CSS overrides)
const Bird = ({ x, y, size = 80, dir = "right", style = {} }) => (
  <img
    src="assets/bird.webp"
    alt=""
    draggable={false}
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: size,
      height: "auto",
      pointerEvents: "none",
      transform: dir === "left" ? "scaleX(-1)" : "scaleX(1)",
      userSelect: "none",
      ...style,
    }}
  />
);

// ============================================================
// MAIN APP
// ============================================================
function LivingTreeExperience({ onOpen }) {
  const [bhk, setBhk] = React.useState(1);
  const [time, setTime] = React.useState(new Date());

  // ── Home-screen perching birds ──
  // Each bird: flies in from a random edge, travels to a button, perches ~3s, flies away.
  // Uses CSS keyframe animations injected once via useEffect.
  const [perchBirds, setPerchBirds] = React.useState([]);
  const perchBirdId = React.useRef(0);

  // ── Home-screen click-spawned birds (taps on the side / empty areas) ──
  const [clickBirds, setClickBirds] = React.useState([]);
  const clickBirdId = React.useRef(0);
  const clickBirdRefs = React.useRef({});

  React.useEffect(() => {
    // Inject home-screen bird keyframes once
    const id = "home-bird-kf";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id;
      el.textContent = `
        @keyframes birdFlyIn {
          0%   { opacity: 0; }
          8%   { opacity: 0.9; }
          100% { opacity: 0.9; }
        }
        @keyframes birdFlyOut {
          0%   { opacity: 0.9; }
          92%  { opacity: 0.9; }
          100% { opacity: 0; }
        }
        @keyframes birdPerchBob {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-3px); }
        }
        @keyframes birdWingRest {
          0%,100% { filter: brightness(1); }
          50%     { filter: brightness(1.06); }
        }
      `;
      document.head.appendChild(el);
    }
  }, []);

  React.useEffect(() => {
    // Constellation button positions — pick a random subset
    const buttons = NODES.filter(n => !n.center);

    let cycleTimer;
    const spawnCycle = () => {
      // Spawn 1-2 birds per cycle
      const count = 1 + Math.floor(Math.random() * 2);
      const chosen = [...buttons].sort(() => Math.random() - 0.5).slice(0, count);

      chosen.forEach((node, ci) => {
        const spawnDelay = ci * 600;
        setTimeout(() => {
          const id = ++perchBirdId.current;
          const size = 56 + Math.floor(Math.random() * 28); // 56–84px

          // HORIZONTAL ONLY — enter from left or right edge only
          const fromLeft = Math.random() > 0.5;
          const startX = fromLeft ? -size - 10 : STAGE_W + size + 10;
          // Entry Y: random vertical position avoiding very top/bottom bars
          const startY = 120 + Math.random() * (STAGE_H - 280);

          // Destination: perched ON TOP of the button — bird's feet rest on the button's
          // upper rim (button is 96px, centred on node.x/node.y; bird gif aspect ~0.96).
          const destX = node.x - size / 2 + (Math.random() - 0.5) * 10;
          const destY = node.y - 48 - size * 0.96 + 13;

          // Exit point: off the OPPOSITE horizontal edge (with slight vertical drift)
          const verticalDrift = (Math.random() - 0.5) * 160;
          const exitX = fromLeft ? STAGE_W + size + 20 : -size - 20;
          const exitY = destY + verticalDrift;

          // Slow, gentle glide: fly-in 4–7s, perch 2.5–4s, fly-out 3.5–6s
          const flyInDur = 4000 + Math.random() * 3000;
          const perchDur = 2500 + Math.random() * 1500;
          const flyOutDur = 3500 + Math.random() * 2500;

          // Facing direction: bird faces the direction it is travelling
          // gif faces RIGHT by default; flip (scaleX -1) when travelling left
          const flyInDir = fromLeft ? "right" : "left";   // from left → flies rightward
          const flyOutDir = fromLeft ? "right" : "left";  // exits to the right side (same direction)

          const bird = {
            id, size,
            startX, startY, destX, destY, exitX, exitY,
            flyInDur, perchDur, flyOutDur,
            flyInDir, flyOutDir,
            phase: "flyIn",
            x: startX, y: startY,
          };

          setPerchBirds(prev => [...prev.slice(-4), bird]); // max 5 birds

          // Kick off the fly-in: paint the bird at the off-screen edge first, then on
          // the next frames move it to the perch point so the CSS transition (flyInDur)
          // animates it gliding IN from the side — it never just pops onto the screen.
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setPerchBirds(prev => prev.map(b => b.id === id ? { ...b, x: destX, y: destY } : b));
            });
          });

          // After the glide-in completes, switch to the perched phase (already at dest).
          setTimeout(() => {
            setPerchBirds(prev => prev.map(b => b.id === id ? { ...b, phase: "perch" } : b));
          }, flyInDur + 90);

          // After perch, fly out off the opposite edge.
          setTimeout(() => {
            setPerchBirds(prev => prev.map(b => b.id === id ? { ...b, phase: "flyOut", x: exitX, y: exitY } : b));
          }, flyInDur + 90 + perchDur);

          // Remove after fly-out.
          setTimeout(() => {
            setPerchBirds(prev => prev.filter(b => b.id !== id));
          }, flyInDur + 90 + perchDur + flyOutDur + 100);

        }, spawnDelay);
      });

      // Next cycle: pause 5–12s after current birds done
      const cycleDur = 5000 + Math.random() * 7000;
      cycleTimer = setTimeout(spawnCycle, cycleDur);
    };

    // First spawn after a short settle time
    const firstTimer = setTimeout(spawnCycle, 3000);
    return () => { clearTimeout(firstTimer); clearTimeout(cycleTimer); };
  }, []);

  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });

  // ── Spawn 3 click-birds from a point — slow wavy meandering flight (same feel as intro) ──
  const spawnClickBirds = (cx, cy) => {
    for (let i = 0; i < 3; i++) {
      const id = ++clickBirdId.current;
      const size = 60 + Math.floor(Math.random() * 26);
      const angle = Math.random() * Math.PI * 2;
      const driftDist = 680 + Math.random() * 540;
      const duration = 4600 + Math.random() * 2800;
      const waveAmp = 48 + Math.random() * 60;
      const waveCycles = 1.7 + Math.random() * 2.3;
      const wavePhase = Math.random() * Math.PI * 2;
      const px = Math.cos(angle + Math.PI / 2), py = Math.sin(angle + Math.PI / 2);
      const goLeft = Math.cos(angle) < 0;
      setClickBirds(prev => [...prev, { id, size, goLeft, x0: cx - size / 2, y0: cy - size / 2 }]);

      const start = performance.now();
      const frame = (now) => {
        const el = clickBirdRefs.current[id];
        if (!el) return;
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 2.4);
        const d = eased * driftDist;
        const w = Math.sin(wavePhase + p * waveCycles * Math.PI * 2) * waveAmp * (1 - p * 0.3);
        el.style.left = (cx + Math.cos(angle) * d + px * w - size / 2) + 'px';
        el.style.top  = (cy + Math.sin(angle) * d + py * w - size / 2) + 'px';
        el.style.opacity = p < 0.12 ? (p / 0.12) : p > 0.78 ? Math.max(0, (1 - p) / 0.22) : 1;
        if (p < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(() => requestAnimationFrame(frame));

      setTimeout(() => {
        setClickBirds(prev => prev.filter(b => b.id !== id));
      }, duration + 140);
    }
  };

  // Root-click handler — taps on background (sides / leaves / sky) spawn birds.
  // Taps on actual buttons (or anything inside a <button>) navigate as normal.
  const handleHomeClick = (e) => {
    if (e.target.closest('button')) return;        // navigate normally — no birds
    if (e.target.closest('a'))       return;
    if (e.target.closest('input'))   return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = STAGE_W / rect.width;
    const scaleY = STAGE_H / rect.height;
    const stageX = (e.clientX - rect.left) * scaleX;
    const stageY = (e.clientY - rect.top)  * scaleY;
    spawnClickBirds(stageX, stageY);
  };

  return (
    <div onClick={handleHomeClick} style={{
      width: STAGE_W, height: STAGE_H, position: "relative", overflow: "hidden",
      fontFamily: "Inter, sans-serif", color: "#f4ead8",
      background: "#0a120d",
    }}>
      {/* faint canopy backdrop (variant 4) */}
      <div className="canopyBg" style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1800&q=80&auto=format&fit=crop)`,
        backgroundSize: "cover", backgroundPosition: "center 35%",
      }}/>
      {/* darkening + green tint */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(10,18,13,0.78) 0%, rgba(10,18,13,0.65) 35%, rgba(10,18,13,0.78) 65%, rgba(10,18,13,0.95) 100%)",
      }}/>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, transparent 0%, rgba(10,18,13,0.5) 70%)",
      }}/>

      <AmbientLeaves />

      {/* TOP BAR */}
      <div style={{
        position: "absolute", top: 28, left: 48, right: 48,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        animation: "fadeDown 0.8s ease backwards",
      }}>
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 16 }}>
          <img src="logo.svg?v=9" alt="Living Tree" style={{ height: 62, width: "auto", display: "block" }} />
          <div style={{
            fontSize: 9, letterSpacing: 2.5, opacity: 0.6, textTransform: "uppercase",
            lineHeight: 1.65, maxWidth: 120,
            borderLeft: "1px solid rgba(217,178,122,0.28)", paddingLeft: 16,
          }}>
            by Kalyani Developers · est. {FACTS.estd}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11 }}>
          <div style={{
            padding: "8px 14px", border: "1px solid rgba(217,178,122,0.3)", borderRadius: 999,
            letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(244,234,216,0.75)",
            display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#d9b27a" }}/>
            RERA · 1251/309
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["EN", "ಕ", "हि"].map((l, i) => (
              <button key={l} style={{
                width: 34, height: 34, borderRadius: "50%",
                background: i === 0 ? "rgba(217,178,122,0.15)" : "transparent",
                border: "1px solid rgba(217,178,122,0.25)",
                color: "#f4ead8", fontSize: 12, fontWeight: 500, cursor: "pointer",
              }}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* HEADLINE */}
      <div style={{
        position: "absolute", top: 100, left: 0, right: 0, textAlign: "center",
        zIndex: 5,
      }}>
        <div style={{
          fontSize: 10.5, letterSpacing: 6, color: "#d9b27a",
          textTransform: "uppercase", opacity: 0, animation: "fadeIn 0.8s ease 0.2s forwards",
        }}>
          {FACTS.loc}
        </div>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif", fontWeight: 400,
          fontSize: 40, lineHeight: 1.05, margin: "12px 0 0", letterSpacing: -0.3,
          whiteSpace: "nowrap",
        }}>
          <span style={{
            display: "inline-block", opacity: 0,
            animation: "fadeUp 0.9s cubic-bezier(0.4, 0, 0.2, 1) 0.4s forwards",
          }}>A residence, rooted&nbsp;<em style={{
            fontStyle: "italic", color: "#d9b27a",
            animation: "fadeUp 0.9s cubic-bezier(0.4, 0, 0.2, 1) 0.6s backwards",
          }}>where Bengaluru breathes.</em></span>
        </h1>
      </div>

      {/* CONSTELLATION — 11-node menu, center stage */}
      <Constellation onOpen={onOpen} />

      {/* STAT RAIL */}
      <div style={{
        position: "absolute", top: 716, left: 80, right: 80, height: 48,
        background: "linear-gradient(180deg, rgba(15,24,19,0.5), rgba(15,24,19,0.3))",
        border: "1px solid rgba(217,178,122,0.15)",
        borderRadius: 12, padding: "16px 24px",
        display: "flex", alignItems: "center",
        backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
      }}>
        <StatRail />
      </div>

      {/* BHK CONFIGURATOR (centered) + CTA */}
      <div style={{
        position: "absolute", bottom: 24, left: 32, right: 32,
        display: "flex", alignItems: "center",
      }}>
        <div style={{ flex: 1 }} />
        <BHKConfigurator active={bhk} setActive={setBhk} />
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => onOpen && onOpen("projectover")} style={{
            background: "linear-gradient(135deg, #d9b27a, #b9874a)",
            color: "#1a2620", border: "none",
            padding: "12px 22px", borderRadius: 999, fontSize: 13, fontWeight: 700,
            whiteSpace: "nowrap",
            letterSpacing: 0.5, cursor: "pointer",
            boxShadow: "0 16px 36px rgba(217,178,122,0.3)",
            display: "flex", alignItems: "center", gap: 8,
            animation: "fadeUp 1s ease 1.5s backwards",
          }}>
            Begin the tour
            <span style={{
              display: "inline-block",
              animation: "nudge 1.6s ease-in-out infinite",
            }}>→</span>
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{
        position: "absolute", bottom: 6, left: 32, right: 32,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 9.5, letterSpacing: 2, textTransform: "uppercase", opacity: 0.45,
      }}>
        <span>Possession Sep 2029 · Phase 1 booking open</span>
        <span>{FACTS.airport}</span>
        <span>Sales Pavilion · Gate A · {timeStr}</span>
      </div>

      {/* ── CLICK-SPAWNED BIRDS — taps on the side fly 3 birds out in wavy paths ── */}
      {clickBirds.map(bird => (
        <img
          key={bird.id}
          ref={(el) => { if (el) clickBirdRefs.current[bird.id] = el; else delete clickBirdRefs.current[bird.id]; }}
          src="assets/bird.webp"
          alt=""
          draggable={false}
          style={{
            position: "absolute",
            left: bird.x0,
            top:  bird.y0,
            width: bird.size,
            height: "auto",
            opacity: 0,
            pointerEvents: "none",
            transform: bird.goLeft ? "scaleX(-1)" : "scaleX(1)",
            zIndex: 36,                     // above perch birds (35) and buttons
            userSelect: "none",
            filter: "drop-shadow(0 5px 13px rgba(0,0,0,0.45))",
          }}
        />
      ))}

      {/* ── PERCHING BIRDS — ambient hummingbirds visiting constellation buttons ── */}
      {perchBirds.map(bird => {
        const isPerching = bird.phase === "perch";
        const isFlyOut = bird.phase === "flyOut";
        const currentDir = isPerching ? bird.flyInDir : isFlyOut ? bird.flyOutDir : bird.flyInDir;
        // CSS transition drives the position; slightly different x/y easings give a gentle arc.
        const dur = isPerching ? 0 : isFlyOut ? bird.flyOutDur / 1000 : bird.flyInDur / 1000;
        return (
          <div
            key={bird.id}
            style={{
              position: "absolute",
              left: bird.x,
              top: bird.y,
              width: bird.size,
              pointerEvents: "none",
              // z-index 35 — sits ABOVE constellation buttons (z-index 4–6) so bird perches on TOP
              zIndex: 35,
              transition: dur
                ? `left ${dur}s cubic-bezier(.36,.1,.32,1), top ${dur}s cubic-bezier(.2,.55,.3,1)`
                : "none",
              animation: isPerching ? "birdPerchBob 2.6s ease-in-out infinite" : "none",
            }}
          >
            <img
              src="assets/bird.webp"
              alt=""
              draggable={false}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                // Flip applied on the img — persists across all phases (flyIn / perch / flyOut)
                transform: currentDir === "left" ? "scaleX(-1)" : "scaleX(1)",
                opacity: 0.9,
                userSelect: "none",
                filter: "drop-shadow(0 5px 13px rgba(0,0,0,0.45))",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// Splash / intro — cinematic forest-portal reveal  v2
// Background: assets/intro.jpg — glowing circular portal with LT monogram.
// Portal measured from intro.png (1440×900 stage):
//   centre ≈ 720 x, 454 y  |  outer ring radius ≈ 204 px
// Four refinements:
//   1. Botanical SVG creeper vine that draws around ~65% of the portal rim
//   2. Large warm glow + click target covering the full portal diameter
//   3. Luxury title card — two Cormorant Garamond lines, nothing else on top
//   4. Cinematic portal-bloom click transition before onEnter()
// ============================================================
const SplashScreen = ({ onEnter }) => {
  const [phase, setPhase] = React.useState("image"); // image → bloom → text → ready → exiting
  const [hovered, setHovered] = React.useState(false);
  const [exiting, setExiting] = React.useState(false);

  // ── Ambient flying birds across the intro screen ──
  const [ambientBirds, setAmbientBirds] = React.useState([]);
  const ambBirdId = React.useRef(0);

  // ── Click-spawned birds (outside portal) ──
  const [clickBirds, setClickBirds] = React.useState([]);
  const clickBirdId = React.useRef(0);
  const clickBirdRefs = React.useRef({});

  // ── Portal geometry (measured from intro.png at 1440×900) ──
  // The ring in intro.png spans roughly 480px diameter at 1440×900 stage size.
  const PX = 720;   // portal centre x
  const PY = 448;   // portal centre y (slightly above stage mid)
  const PR = 238;   // portal outer ring radius — calibrated to the baked image ring

  // ── Inject keyframes once ──
  React.useEffect(() => {
    const id = "splash-kf-v2";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');

      @keyframes splashImgFadeIn {
        from { opacity: 0; transform: scale(1.05); }
        to   { opacity: 1; transform: scale(1); }
      }

      /* Big warm glow over the portal — gentle breath */
      @keyframes portalGlowBreath {
        0%,100% { opacity: 0.52; transform: translate(-50%,-50%) scale(1); }
        50%     { opacity: 0.82; transform: translate(-50%,-50%) scale(1.06); }
      }

      /* Outer halo — slower, cooler green */
      @keyframes haloBreath {
        0%,100% { opacity: 0.28; transform: translate(-50%,-50%) scale(1); }
        50%     { opacity: 0.48; transform: translate(-50%,-50%) scale(1.09); }
      }

      /* Subtle continuous green colour-shift — cycles through green tones on the portal glow.
         Uses a pseudo-element trick via background animation on the glow div itself.
         We animate the colours of the radial gradient by layering a colour-only overlay
         that cycles through hues: deep forest → emerald → moss/lime → teal-green → back. */
      @keyframes portalGreenCycle {
        0%   { background: radial-gradient(circle, rgba(30,100,50,0.45) 0%, rgba(60,150,60,0.28) 38%, rgba(80,160,70,0.10) 65%, transparent 80%); }
        25%  { background: radial-gradient(circle, rgba(20,140,70,0.48) 0%, rgba(40,180,90,0.30) 38%, rgba(60,200,80,0.12) 65%, transparent 80%); }
        50%  { background: radial-gradient(circle, rgba(80,170,60,0.42) 0%, rgba(120,200,60,0.25) 38%, rgba(150,220,80,0.10) 65%, transparent 80%); }
        75%  { background: radial-gradient(circle, rgba(20,130,100,0.44) 0%, rgba(40,170,110,0.27) 38%, rgba(60,190,120,0.10) 65%, transparent 80%); }
        100% { background: radial-gradient(circle, rgba(30,100,50,0.45) 0%, rgba(60,150,60,0.28) 38%, rgba(80,160,70,0.10) 65%, transparent 80%); }
      }

      /* Rings */
      @keyframes ringRotateCW {
        from { transform: translate(-50%,-50%) rotate(0deg); }
        to   { transform: translate(-50%,-50%) rotate(360deg); }
      }
      @keyframes ringRotateCCW {
        from { transform: translate(-50%,-50%) rotate(0deg); }
        to   { transform: translate(-50%,-50%) rotate(-360deg); }
      }

      /* Creeper vine draws on via stroke-dashoffset */
      @keyframes vineDraw {
        from { stroke-dashoffset: 1600; }
        to   { stroke-dashoffset: 0; }
      }
      /* Individual leaves unfurl: scale + fade */
      @keyframes leafUnfurl {
        0%   { opacity: 0; transform: scale(0.1) rotate(-40deg); }
        60%  { opacity: 1; transform: scale(1.15) rotate(6deg); }
        100% { opacity: 1; transform: scale(1) rotate(0deg); }
      }
      /* Creeper leaves gentle sway */
      @keyframes leafSway {
        0%,100% { transform: rotate(-4deg); }
        50%     { transform: rotate(4deg); }
      }

      /* Title text in */
      @keyframes titleIn {
        from { opacity: 0; transform: translateY(18px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes subtitleIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 0.62; transform: translateY(0); }
      }

      /* Portal bloom click transition */
      @keyframes bloomExpand {
        0%   { opacity: 0.7; transform: translate(-50%,-50%) scale(1); }
        40%  { opacity: 1;   transform: translate(-50%,-50%) scale(1.18); }
        100% { opacity: 0;   transform: translate(-50%,-50%) scale(3.2); }
      }
      @keyframes flashWhite {
        0%   { opacity: 0; }
        30%  { opacity: 0.55; }
        100% { opacity: 0; }
      }
      @keyframes ringSpinOut {
        0%   { opacity: 1;   transform: translate(-50%,-50%) rotate(0deg) scale(1); }
        100% { opacity: 0;   transform: translate(-50%,-50%) rotate(120deg) scale(2.4); }
      }
      @keyframes creepGlow {
        0%   { filter: drop-shadow(0 0 2px rgba(120,210,95,0.5)); }
        50%  { filter: drop-shadow(0 0 12px rgba(120,210,95,1)) drop-shadow(0 0 24px rgba(217,178,122,0.7)); }
        100% { filter: drop-shadow(0 0 2px rgba(120,210,95,0.5)); }
      }
      @keyframes splashFadeOut {
        from { opacity: 1; }
        to   { opacity: 0; }
      }
      @keyframes tapCueFloat {
        0%,100% { opacity: 0.55; transform: translateY(0); }
        50%     { opacity: 0.82; transform: translateY(-4px); }
      }

      /* Tap cue right-side pulse */
      @keyframes tapCuePulse {
        0%,100% { opacity: 0; transform: translateX(0); }
        30%,70% { opacity: 1; transform: translateX(4px); }
      }
      @keyframes tapCueArrow {
        0%,100% { opacity: 0.4; transform: translateX(0); }
        50%     { opacity: 0.9; transform: translateX(6px); }
      }

      /* Ambient splash bird — fades in/out at edges, CSS-transition driven */
      @keyframes splashBirdFade {
        0%   { opacity: 0; }
        10%  { opacity: 0.82; }
        88%  { opacity: 0.82; }
        100% { opacity: 0; }
      }

      /* Click-spawned bird — flies out fast, fades */
      @keyframes clickBirdFade {
        0%   { opacity: 0.9; }
        70%  { opacity: 0.7; }
        100% { opacity: 0; }
      }
    `;
    document.head.appendChild(el);
  }, []);

  // ── Phase sequence ──
  React.useEffect(() => {
    const a = setTimeout(() => setPhase("bloom"), 800);
    const b = setTimeout(() => setPhase("text"),  2000);
    const c = setTimeout(() => setPhase("ready"), 3100);
    return () => { clearTimeout(a); clearTimeout(b); clearTimeout(c); };
  }, []);

  // ── Enter: cinematic bloom, then onEnter after ~1100ms ──
  const enter = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(onEnter, 1100);
  };

  // Keyboard trigger
  React.useEffect(() => {
    if (phase !== "ready") return;
    const handler = (e) => { if (e.key === "Enter" || e.key === " ") enter(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, exiting]);

  // ── Ambient birds: steady flow across the intro, 2-4 visible at a time ──
  React.useEffect(() => {
    if (exiting) return;
    let timer;
    const spawnBird = () => {
      const id = ++ambBirdId.current;
      const goLeft = Math.random() > 0.45; // slightly more left-to-right
      const size = 64 + Math.floor(Math.random() * 40); // 64–104px
      const startY = 100 + Math.random() * 640; // avoid very top/bottom edges
      const durationMs = 8000 + Math.random() * 8000; // 8–16s crossing time
      // Add a gentle vertical drift (curved arc feel)
      const driftY = (Math.random() - 0.5) * 120;

      const startX = goLeft ? STAGE_W + size : -size;
      const endX = goLeft ? -size - 20 : STAGE_W + size + 20;
      const endY = startY + driftY;

      const bird = { id, goLeft, size, startX, startY, endX, endY, durationMs, x: startX, y: startY };
      setAmbientBirds(prev => [...prev, bird]);

      // Move to end position (CSS transition drives it)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAmbientBirds(prev => prev.map(b => b.id === id ? { ...b, x: endX, y: endY } : b));
        });
      });

      // Remove after flight done
      setTimeout(() => {
        setAmbientBirds(prev => prev.filter(b => b.id !== id));
      }, durationMs + 500);

      // Schedule next bird — aim for 2-4 visible at any time
      const nextSpawn = 2500 + Math.random() * 3500;
      timer = setTimeout(spawnBird, nextSpawn);
    };

    // Initial stagger: spawn first 2 birds quickly, then steady cadence
    const t1 = setTimeout(spawnBird, 600);
    const t2 = setTimeout(spawnBird, 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(timer); };
  }, [exiting]);

  // ── Helper: spawn 3 click-birds from a point, flying in 3 random directions ──
  const spawnClickBirds = (cx, cy) => {
    // 3 birds drift out slowly, each on its own gentle wavy meandering path
    for (let i = 0; i < 3; i++) {
      const id = ++clickBirdId.current;
      const size = 60 + Math.floor(Math.random() * 26);
      const angle = Math.random() * Math.PI * 2;            // own random direction
      const driftDist = 680 + Math.random() * 540;
      const duration = 4600 + Math.random() * 2800;         // slow — 4.6 to 7.4s
      const waveAmp = 48 + Math.random() * 60;
      const waveCycles = 1.7 + Math.random() * 2.3;         // wavy meander
      const wavePhase = Math.random() * Math.PI * 2;
      const px = Math.cos(angle + Math.PI / 2), py = Math.sin(angle + Math.PI / 2);
      const goLeft = Math.cos(angle) < 0;
      setClickBirds(prev => [...prev, { id, size, goLeft, x0: cx - size / 2, y0: cy - size / 2 }]);

      const start = performance.now();
      const frame = (now) => {
        const el = clickBirdRefs.current[id];
        if (!el) return;
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 2.4);             // slow ease-out drift
        const d = eased * driftDist;
        const w = Math.sin(wavePhase + p * waveCycles * Math.PI * 2) * waveAmp * (1 - p * 0.3);
        el.style.left = (cx + Math.cos(angle) * d + px * w - size / 2) + 'px';
        el.style.top  = (cy + Math.sin(angle) * d + py * w - size / 2) + 'px';
        el.style.opacity = p < 0.12 ? (p / 0.12) : p > 0.78 ? Math.max(0, (1 - p) / 0.22) : 1;
        if (p < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(() => requestAnimationFrame(frame));

      setTimeout(() => {
        setClickBirds(prev => prev.filter(b => b.id !== id));
      }, duration + 140);
    }
  };

  // ── SVG Creeper vine path ──
  // Arc around ~65% of the portal circle (roughly 234°), starting from ~8 o'clock
  // going clockwise to about 1 o'clock. The vine path is a circle arc with
  // organic waypoints added via quadratic curves to give it a hand-drawn feel.
  // All coordinates are relative to portal centre (0,0) — SVG viewBox is shifted.
  const R = PR; // same radius as portal ring, sits right on the rim

  // Arc path: start ~200° (lower-left), sweep clockwise ~234° to ~74° (upper-right)
  // Vine sits just outside the ring at R+3 for clean separation
  const Rv = R + 3; // vine sits on/just outside the ring
  const toRad = (deg) => (deg * Math.PI) / 180;

  // Parametric circle points for leaf positions along the arc
  // Arc: from 200° to 200° + 234° = 434° = 74°, clockwise
  const leafPositions = [
    { angle: 210, size: 7,  rot: -30, swayDur: "6.1s", swayDelay: "0s"    },
    { angle: 238, size: 9,  rot:  20, swayDur: "7.4s", swayDelay: "0.4s"  },
    { angle: 265, size: 6,  rot: -50, swayDur: "5.8s", swayDelay: "0.8s"  },
    { angle: 291, size: 11, rot:  15, swayDur: "8.0s", swayDelay: "0.2s"  },
    { angle: 318, size: 7,  rot: -25, swayDur: "6.6s", swayDelay: "1.0s"  },
    { angle: 344, size: 10, rot:  35, swayDur: "7.2s", swayDelay: "0.5s"  },
    { angle:  10, size: 6,  rot: -15, swayDur: "6.3s", swayDelay: "1.2s"  },
    { angle:  37, size: 9,  rot:  45, swayDur: "7.8s", swayDelay: "0.3s"  },
    { angle:  63, size: 7,  rot: -30, swayDur: "5.9s", swayDelay: "0.9s"  },
  ];

  // Tendrils — small spiral tips sprouting off the vine
  const tendrilPositions = [
    { angle: 225, r1: 14, r2: 22, dir: -1 },
    { angle: 276, r1: 12, r2: 20, dir:  1 },
    { angle: 330, r1: 15, r2: 24, dir: -1 },
    { angle:  20, r1: 13, r2: 21, dir:  1 },
    { angle:  50, r1: 14, r2: 22, dir: -1 },
  ];

  // Build a smooth arc path for the vine. Using SVG arc command.
  // Start at 200° and sweep 234° clockwise.
  const startAngle = 200;
  const sweepAngle = 234;
  const endAngle = startAngle + sweepAngle; // 434 → mod 360 = 74

  const arcStart = {
    x: Rv * Math.cos(toRad(startAngle)),
    y: Rv * Math.sin(toRad(startAngle)),
  };
  const arcEnd = {
    x: Rv * Math.cos(toRad(endAngle)),
    y: Rv * Math.sin(toRad(endAngle)),
  };

  // SVG arc: large-arc-flag=1 because sweepAngle > 180
  const vinePath = `M ${arcStart.x.toFixed(2)} ${arcStart.y.toFixed(2)} A ${Rv} ${Rv} 0 1 1 ${arcEnd.x.toFixed(2)} ${arcEnd.y.toFixed(2)}`;

  // Leaf SVG (simple organic 3-petal shape using cubic bezier)
  const LeafShape = ({ size, rot, unfurlDelay, swayDur, swayDelay }) => (
    <g style={{
      transformOrigin: "0 0",
      animation: `leafUnfurl 1.1s cubic-bezier(0.22,1,0.36,1) ${unfurlDelay} forwards`,
      opacity: 0,
    }}>
      <g style={{
        transformOrigin: "0 0",
        animation: `leafSway ${swayDur} ease-in-out ${swayDelay} infinite`,
      }}>
        <g transform={`rotate(${rot})`}>
          {/* Main leaf lobe */}
          <path
            d={`M 0 0 C ${size * 0.4} ${-size * 0.9} ${size * 1.1} ${-size * 1.0} ${size * 0.7} 0 C ${size * 1.1} ${size * 0.6} ${size * 0.4} ${size * 0.5} 0 0 Z`}
            fill="rgba(100,180,80,0.72)"
            stroke="rgba(120,200,90,0.5)"
            strokeWidth="0.4"
          />
          {/* Leaf midrib */}
          <path
            d={`M 0 0 L ${size * 0.65} ${-size * 0.18}`}
            stroke="rgba(60,140,50,0.6)"
            strokeWidth="0.5"
            fill="none"
          />
          {/* Second small lobe going inward */}
          <path
            d={`M 0 0 C ${-size * 0.3} ${-size * 0.7} ${-size * 0.9} ${-size * 0.5} ${-size * 0.5} 0 Z`}
            fill="rgba(80,160,70,0.5)"
            stroke="rgba(100,180,80,0.4)"
            strokeWidth="0.3"
          />
        </g>
      </g>
    </g>
  );

  // Tendril: a small curving outward spiral line
  const TendrilShape = ({ r1, r2, dir }) => (
    <path
      d={`M 0 0 C ${dir * r1 * 0.5} ${-r1} ${dir * r2} ${-r1 * 0.5} ${dir * r2} ${r2 * 0.3}`}
      stroke="rgba(120,190,80,0.5)"
      strokeWidth="0.7"
      fill="none"
      strokeLinecap="round"
    />
  );

  // SVG viewBox centres on portal — we use a large enough canvas
  const svgSize = (PR + 60) * 2;
  const svgOriginX = PX - (PR + 60);
  const svgOriginY = PY - (PR + 60);

  // Phase-driven glow opacity helpers
  const glowVisible = phase !== "image";
  const textVisible = phase === "text" || phase === "ready";
  const creepVisible = phase !== "image";

  // ── Handle whole-screen click: inside portal = enter, outside = 3 birds ──
  const handleScreenClick = (e) => {
    if (exiting || (phase !== "ready" && phase !== "text")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    // Map click to stage coords (stage may be scaled)
    const scaleX = STAGE_W / rect.width;
    const scaleY = STAGE_H / rect.height;
    const stageX = (e.clientX - rect.left) * scaleX;
    const stageY = (e.clientY - rect.top) * scaleY;
    // Distance from portal centre
    const dx = stageX - PX;
    const dy = stageY - PY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= PR) {
      // Inside portal → enter
      enter();
    } else {
      // Outside portal → spawn 3 birds from click point
      spawnClickBirds(stageX, stageY);
    }
  };

  return (
    <div
      onClick={handleScreenClick}
      style={{
        width: STAGE_W, height: STAGE_H, position: "relative", overflow: "hidden",
        background: "#060e08", fontFamily: "'Cormorant Garamond', Georgia, serif", color: "#f4ead8",
        animation: exiting ? "splashFadeOut 1.1s cubic-bezier(0.4,0,0.2,1) forwards" : "none",
        pointerEvents: exiting ? "none" : "auto",
        cursor: "default",
      }}
    >

      {/* ── BACKGROUND: full-bleed forest portal image ── */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url(assets/intro.jpg)",
        backgroundSize: "cover", backgroundPosition: "center center",
        animation: "splashImgFadeIn 1.6s cubic-bezier(0.4,0,0.2,1) forwards",
        transformOrigin: "center center",
      }} />

      {/* Top/bottom dark vignette — keeps text readable, doesn't touch the portal */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "linear-gradient(180deg, rgba(3,8,5,0.80) 0%, rgba(3,8,5,0.0) 20%, rgba(3,8,5,0.0) 76%, rgba(3,8,5,0.84) 100%)",
      }} />

      {/* ── LARGE WARM GLOW — raised ~20px upward to centre on the portal ring ── */}
      {/* PY_GLOW nudges the glow centre up to sit on the actual portal ring */}
      {(() => {
        const PY_GLOW = PY - 20; // raised from PY
        return (
          <>
            {/* Green colour-shift layer — cycles slowly through forest green shades */}
            <div style={{
              position: "absolute",
              left: PX, top: PY_GLOW,
              width: PR * 2 + 80, height: PR * 2 + 80,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(30,100,50,0.45) 0%, rgba(60,150,60,0.28) 38%, rgba(80,160,70,0.10) 65%, transparent 80%)",
              animation: glowVisible
                ? "portalGreenCycle 14s ease-in-out infinite, portalGlowBreath 4.8s ease-in-out infinite"
                : "none",
              opacity: glowVisible ? 1 : 0,
              transition: "opacity 1.4s ease",
              pointerEvents: "none", zIndex: 2,
            }} />

            {/* Outer green halo */}
            <div style={{
              position: "absolute",
              left: PX, top: PY_GLOW,
              width: PR * 2 + 160, height: PR * 2 + 160,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              background: "radial-gradient(circle, transparent 35%, rgba(120,200,80,0.10) 58%, rgba(80,160,60,0.06) 72%, transparent 85%)",
              animation: glowVisible ? "haloBreath 6.4s ease-in-out 0.8s infinite" : "none",
              opacity: glowVisible ? 1 : 0,
              transition: "opacity 1.8s ease 0.4s",
              pointerEvents: "none", zIndex: 2,
            }} />
          </>
        );
      })()}

      {/* Slowly rotating dashed ring — 1 rev per 32s, green */}
      <div style={{
        position: "absolute",
        left: PX, top: PY,
        width: PR * 2 + 18, height: PR * 2 + 18,
        transform: "translate(-50%, -50%)",
        borderRadius: "50%",
        border: "1px dashed rgba(160,220,100,0.16)",
        boxShadow: "0 0 14px rgba(120,200,80,0.12)",
        animation: glowVisible ? "ringRotateCW 32s linear infinite" : "none",
        opacity: glowVisible ? 1 : 0,
        transition: "opacity 1.6s ease 0.5s",
        pointerEvents: "none", zIndex: 3,
      }} />

      {/* Counter-rotating gold ring — deeper, 48s */}
      <div style={{
        position: "absolute",
        left: PX, top: PY,
        width: PR * 2 + 48, height: PR * 2 + 48,
        transform: "translate(-50%, -50%)",
        borderRadius: "50%",
        border: "1px solid rgba(217,178,122,0.09)",
        animation: glowVisible ? "ringRotateCCW 48s linear infinite" : "none",
        opacity: glowVisible ? 1 : 0,
        transition: "opacity 2.0s ease 0.7s",
        pointerEvents: "none", zIndex: 3,
      }} />

      {/* Hover warm swell — appears when hovering the portal click target */}
      {hovered && !exiting && (
        <div style={{
          position: "absolute",
          left: PX, top: PY - 20,
          width: PR * 2 + 50, height: PR * 2 + 50,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(230,195,140,0.26) 0%, rgba(217,178,122,0.12) 55%, transparent 78%)",
          pointerEvents: "none", zIndex: 4,
          animation: "portalGlowBreath 2.2s ease-in-out infinite",
        }} />
      )}

      {/* ── CLICK TRANSITION: portal blooms outward ── */}
      {exiting && (
        <>
          {/* Expanding bloom disc */}
          <div style={{
            position: "absolute", left: PX, top: PY,
            width: PR * 2, height: PR * 2,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(240,210,160,0.9) 0%, rgba(200,240,160,0.5) 45%, transparent 72%)",
            animation: "bloomExpand 1.1s cubic-bezier(0.22,0.6,0.36,1) forwards",
            pointerEvents: "none", zIndex: 20,
          }} />
          {/* Spinning ring shoots outward */}
          <div style={{
            position: "absolute", left: PX, top: PY,
            width: PR * 2 + 10, height: PR * 2 + 10,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: "2px solid rgba(217,178,122,0.7)",
            boxShadow: "0 0 28px rgba(217,178,122,0.5), inset 0 0 28px rgba(120,210,95,0.3)",
            animation: "ringSpinOut 1.0s cubic-bezier(0.4,0,0.8,0.6) forwards",
            pointerEvents: "none", zIndex: 21,
          }} />
          {/* White flash */}
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(240,240,220,1)",
            animation: "flashWhite 1.1s cubic-bezier(0.4,0,0.2,1) forwards",
            pointerEvents: "none", zIndex: 22,
          }} />
        </>
      )}

      {/* ── BOTANICAL CREEPER VINE SVG ── */}
      {creepVisible && (
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`${-(PR + 60)} ${-(PR + 60)} ${svgSize} ${svgSize}`}
          style={{
            position: "absolute",
            left: svgOriginX,
            top: svgOriginY,
            pointerEvents: "none",
            zIndex: 5,
            overflow: "visible",
            filter: "drop-shadow(0 0 4px rgba(100,190,70,0.35))",
            opacity: 0,
            animation: "leafUnfurl 0.6s ease 0.3s forwards",
            ...(exiting ? { animation: "creepGlow 0.8s ease forwards" } : {}),
          }}
        >
          {/* Main vine arc */}
          <path
            d={vinePath}
            stroke="rgba(100,170,70,0.72)"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
            style={{
              strokeDasharray: 1600,
              strokeDashoffset: 1600,
              animation: "vineDraw 2.8s cubic-bezier(0.4,0,0.2,1) 0.5s forwards",
            }}
          />

          {/* Leaves along the vine */}
          {leafPositions.map((lp, i) => {
            const ax = Rv * Math.cos(toRad(lp.angle));
            const ay = Rv * Math.sin(toRad(lp.angle));
            return (
              <g key={i} transform={`translate(${ax.toFixed(2)}, ${ay.toFixed(2)}) rotate(${lp.angle + 90})`}>
                <LeafShape
                  size={lp.size}
                  rot={lp.rot}
                  unfurlDelay={`${0.9 + i * 0.22}s`}
                  swayDur={lp.swayDur}
                  swayDelay={lp.swayDelay}
                />
              </g>
            );
          })}

          {/* Tendrils along the vine */}
          {tendrilPositions.map((tp, i) => {
            const tx = Rv * Math.cos(toRad(tp.angle));
            const ty = Rv * Math.sin(toRad(tp.angle));
            return (
              <g key={i} transform={`translate(${tx.toFixed(2)}, ${ty.toFixed(2)}) rotate(${tp.angle})`}
                style={{ opacity: 0, animation: `leafUnfurl 0.9s ease ${1.4 + i * 0.18}s forwards` }}>
                <TendrilShape r1={tp.r1} r2={tp.r2} dir={tp.dir} />
              </g>
            );
          })}
        </svg>
      )}

      {/* ── PORTAL HOVER CURSOR AREA — invisible circle, just sets cursor ── */}
      {(phase === "ready" || phase === "text") && !exiting && (
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            position: "absolute",
            left: PX - PR, top: PY - PR,
            width: PR * 2, height: PR * 2,
            borderRadius: "50%",
            cursor: "pointer",
            zIndex: 10,
            background: "transparent",
          }}
        />
      )}

      {/* ── LEFT — one big, classy line beside the portal ── */}
      {textVisible && (
        <div style={{
          position: "absolute",
          left: 78, width: 440, top: PY,
          transform: "translateY(-50%)",
          pointerEvents: "none", zIndex: 7,
          opacity: 0,
          animation: "titleIn 1.5s cubic-bezier(0.4,0,0.2,1) 0.3s forwards",
        }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 300, fontSize: 53, lineHeight: 1.14,
            color: "rgba(245,236,220,0.95)",
            textShadow: "0 2px 32px rgba(0,0,0,0.92)",
          }}>
            Rooted in life,<br />
            <em style={{ fontStyle: "italic", color: "#d9b27a" }}>designed to grow.</em>
          </div>
        </div>
      )}

      {/* ── BOTTOM CENTRE — wordmark + attribution as graceful footer title card ── */}
      {textVisible && (
        <div style={{
          position: "absolute",
          bottom: 36,
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center", pointerEvents: "none", zIndex: 8,
          opacity: 0,
          animation: "titleIn 1.4s cubic-bezier(0.4,0,0.2,1) 0.7s forwards",
        }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 400, fontSize: 32, letterSpacing: "0.2em",
            color: "rgba(245,236,220,0.97)",
            textShadow: "0 2px 24px rgba(0,0,0,0.95), 0 0 40px rgba(0,0,0,0.7)",
          }}>
            Living Tree
          </div>
          <div style={{
            marginTop: 8,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: "italic", fontSize: 13, letterSpacing: "0.32em",
            color: "rgba(217,178,122,0.86)",
            textShadow: "0 1px 12px rgba(0,0,0,0.95)",
          }}>
            by Kalyani Developers
          </div>
        </div>
      )}

      {/* ── RIGHT SIDE TAP CUE — elegant "tap to enter" beside the portal ── */}
      {/* Portal right edge: PX + PR = 720 + 238 = 958. Place cue at x ~ 990–1380 */}
      {textVisible && (
        <div style={{
          position: "absolute",
          left: 980,
          width: 300,
          top: PY - 40,
          display: "flex", flexDirection: "column", alignItems: "flex-start",
          gap: 12, pointerEvents: "none", zIndex: 7,
          opacity: 0,
          animation: "titleIn 1.4s cubic-bezier(0.4,0,0.2,1) 0.5s forwards",
        }}>
          {/* Arrow + label row */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            animation: "tapCueArrow 2.6s ease-in-out 1s infinite",
          }}>
            {/* Decorative thin line */}
            <div style={{
              width: 32, height: 1,
              background: "linear-gradient(to right, transparent, rgba(217,178,122,0.65))",
            }} />
            <div style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic",
              fontSize: 17, letterSpacing: "0.22em",
              color: "rgba(244,234,216,0.78)",
            }}>
              tap to enter
            </div>
            <div style={{
              fontSize: 16, color: "rgba(217,178,122,0.70)",
              animation: "tapCueArrow 2.6s ease-in-out 1.3s infinite",
            }}>
              ›
            </div>
          </div>
          {/* Subtle sub-line */}
          <div style={{
            fontSize: 10, letterSpacing: "0.34em", textTransform: "uppercase",
            color: "rgba(217,178,122,0.42)", paddingLeft: 44,
            opacity: 0,
            animation: "subtitleIn 1.2s cubic-bezier(0.4,0,0.2,1) 0.9s forwards",
          }}>
            begin the journey
          </div>
        </div>
      )}

      {/* ── AMBIENT BIRDS flying across the intro ── */}
      {ambientBirds.map(bird => (
        <img
          key={bird.id}
          src="assets/bird.webp"
          alt=""
          draggable={false}
          style={{
            position: "absolute",
            left: bird.x,
            top: bird.y,
            width: bird.size,
            height: "auto",
            pointerEvents: "none",
            transform: bird.goLeft ? "scaleX(-1)" : "scaleX(1)",
            transition: `left ${bird.durationMs / 1000}s cubic-bezier(0.4,0,0.6,1), top ${bird.durationMs / 1000}s cubic-bezier(0.4,0,0.6,1)`,
            animation: "splashBirdFade " + (bird.durationMs / 1000).toFixed(1) + "s ease forwards",
            zIndex: 6,
            userSelect: "none",
            filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))",
          }}
        />
      ))}

      {/* ── CLICK-SPAWNED BIRDS — 3 fly out from click point ── */}
      {clickBirds.map(bird => (
        <img
          key={bird.id}
          ref={(el) => { if (el) clickBirdRefs.current[bird.id] = el; else delete clickBirdRefs.current[bird.id]; }}
          src="assets/bird.webp"
          alt=""
          draggable={false}
          style={{
            position: "absolute",
            left: bird.x0,
            top: bird.y0,
            width: bird.size,
            height: "auto",
            opacity: 0,
            pointerEvents: "none",
            transform: bird.goLeft ? "scaleX(-1)" : "scaleX(1)",
            zIndex: 9,
            userSelect: "none",
          }}
        />
      ))}

      {/* ── AMBIENT LEAVES — top layer, drift over everything ── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 8, pointerEvents: "none" }}>
        <AmbientLeaves />
      </div>
    </div>
  );
};

// ============================================================
// ScreenShell — shared frame for every inner screen
// ============================================================
function ScreenShell({ title, eyebrow, onBack, children, scroll = true, pad = true }) {
  return (
    <div style={{
      width: STAGE_W, height: STAGE_H, position: "relative", overflow: "hidden",
      background: THEME.bg, fontFamily: THEME.sans, color: THEME.cream,
      animation: "fadeIn 0.45s ease",
    }}>
      {/* backdrop — consistent with the home screen */}
      <div className="canopyBg" style={{
        position: "absolute", inset: 0, backgroundImage: `url(${CANOPY})`,
        backgroundSize: "cover", backgroundPosition: "center 35%", opacity: 0.4,
      }}/>
      <div style={{ position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(10,18,13,0.9) 0%, rgba(10,18,13,0.96) 100%)" }}/>

      {/* header */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 76, zIndex: 30,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 30px", borderBottom: `1px solid ${THEME.line}`,
        background: "rgba(9,16,11,0.74)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
      }}>
        <button onClick={onBack} style={{
          display: "flex", alignItems: "center", gap: 9,
          background: THEME.glass, border: `1px solid ${THEME.line}`,
          color: THEME.cream, cursor: "pointer", borderRadius: 999,
          padding: "9px 17px 9px 13px", fontSize: 11, fontWeight: 600,
          letterSpacing: 1, textTransform: "uppercase", fontFamily: THEME.sans,
          transition: "background 0.25s, border-color 0.25s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = THEME.goldSoft; e.currentTarget.style.borderColor = THEME.lineStrong; }}
        onMouseLeave={e => { e.currentTarget.style.background = THEME.glass; e.currentTarget.style.borderColor = THEME.line; }}>
          <span style={{ fontSize: 15, lineHeight: 1 }}>←</span> Home
        </button>
        <div style={{ textAlign: "center", lineHeight: 1.12 }}>
          {eyebrow && <div style={{
            fontSize: 9, letterSpacing: 3.5, textTransform: "uppercase",
            color: THEME.gold, marginBottom: 5,
          }}>{eyebrow}</div>}
          <div style={{ fontFamily: THEME.serif, fontSize: 25, fontWeight: 500, letterSpacing: 0.3 }}>{title}</div>
        </div>
        <div style={{ minWidth: 132, display: "flex", justifyContent: "flex-end" }}>
          <img src="logo.svg?v=9" alt="Living Tree" style={{ height: 34, width: "auto", opacity: 0.92 }} />
        </div>
      </div>

      {/* content */}
      <div style={{
        position: "absolute", top: 76, left: 0, right: 0, bottom: 0,
        overflowY: scroll ? "auto" : "hidden", overflowX: "hidden",
        padding: pad ? "30px 40px 46px" : 0,
      }}>
        {children}
      </div>
    </div>
  );
}

// ============================================================
// App — splash → home → inner screens
// ============================================================
function App() {
  const [entered, setEntered] = React.useState(false);
  const [screen, setScreen] = React.useState(null);

  React.useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("screen");
    if (q) { setEntered(true); setScreen(q); }
  }, []);

  // RealDesk Analytics — this is a single-page app, so screens swap client-side
  // without a document reload. Emit one page_view per logical screen via the
  // public RDA API so the server gets real per-screen visit data. No-op if RDA
  // isn't loaded (e.g. dev / offline before sync).
  React.useEffect(() => {
    if (typeof window.RDA === "undefined") return;
    const view = !entered ? "intro" : (screen || "home");
    // This effect can run before rda.js's own start() (React passive-effect
    // timing vs DOMContentLoaded is not guaranteed). If no rda session exists
    // yet, we're first — emit app_open ourselves so a fresh visit is always
    // recorded. If start() already ran, the session key is present and it
    // already emitted app_open, so we skip it. Either way: exactly one app_open.
    try {
      if (!localStorage.getItem("rda_sess")) window.RDA.track("app_open", view);
    } catch (e) {}
    window.RDA.track("page_view", view);
  }, [entered, screen]);

  if (!entered) return <SplashScreen onEnter={() => setEntered(true)} />;

  if (screen) {
    const Screen = (window.SCREENS || {})[screen];
    if (Screen) return <Screen onBack={() => setScreen(null)} navigate={setScreen} />;
  }
  return <LivingTreeExperience onOpen={setScreen} />;
}

Object.assign(window, { App, SplashScreen, LivingTreeExperience, ScreenShell, THEME, CANOPY, STAGE_W, STAGE_H });
