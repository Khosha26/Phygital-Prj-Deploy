// ============================================================
// Location Screen — Interactive Neighbourhood Map
// LivingTree by Kalyani Developers
// Enhanced: animated route-draw + distance count-up + vehicle marker
// ============================================================

(function () {

  // ── Inject keyframes + styles once ───────────────────────────
  const STYLE_ID = "lt-location-styles";
  if (!document.getElementById(STYLE_ID)) {
    const s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = `
      @keyframes pinDrop {
        0%   { opacity: 0; transform: translate(-50%, -100%) scale(0.5); }
        60%  { transform: translate(-50%, 10%) scale(1.12); opacity: 1; }
        80%  { transform: translate(-50%, -6%) scale(0.94); }
        100% { transform: translate(-50%, 0%) scale(1); opacity: 1; }
      }
      @keyframes rippleOut {
        0%   { transform: translate(-50%, -50%) scale(0.3); opacity: 0.9; }
        100% { transform: translate(-50%, -50%) scale(3.2); opacity: 0; }
      }
      @keyframes rippleOut2 {
        0%   { transform: translate(-50%, -50%) scale(0.3); opacity: 0.7; }
        100% { transform: translate(-50%, -50%) scale(2.6); opacity: 0; }
      }
      @keyframes heroBreath {
        0%, 100% { transform: translate(-50%, -50%) scale(1); }
        50%       { transform: translate(-50%, -50%) scale(1.08); }
      }
      @keyframes cardSlideIn {
        from { opacity: 0; transform: translateY(14px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes chipPop {
        from { opacity: 0; transform: scale(0.82); }
        to   { opacity: 1; transform: scale(1); }
      }
      @keyframes panelFade {
        from { opacity: 0; transform: translateX(-16px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      @keyframes ltPulse {
        0%, 100% { opacity: 0.55; }
        50%       { opacity: 1; }
      }
      @keyframes tooltipIn {
        from { opacity: 0; transform: translate(-50%, -4px); }
        to   { opacity: 1; transform: translate(-50%, 0); }
      }
      @keyframes routeDraw {
        from { stroke-dashoffset: var(--route-len, 1000); }
        to   { stroke-dashoffset: 0; }
      }
      @keyframes vehicleTravel {
        from { offset-distance: 0%; }
        to   { offset-distance: 100%; }
      }
      @keyframes pinPulse {
        0%   { box-shadow: 0 0 0 0px rgba(217,178,122,0.7); }
        50%  { box-shadow: 0 0 0 10px rgba(217,178,122,0); }
        100% { box-shadow: 0 0 0 0px rgba(217,178,122,0); }
      }
      @keyframes distReveal {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes routeGlow {
        0%, 100% { opacity: 0.55; }
        50%       { opacity: 1; }
      }
      @keyframes selectedPinPulse {
        0%   { transform: translate(-50%, -100%) scale(1); filter: drop-shadow(0 0 8px currentColor); }
        50%  { transform: translate(-50%, -100%) scale(1.18); filter: drop-shadow(0 0 16px currentColor); }
        100% { transform: translate(-50%, -100%) scale(1); filter: drop-shadow(0 0 8px currentColor); }
      }
      .lt-pin-hover:hover { filter: brightness(1.3) drop-shadow(0 0 8px rgba(217,178,122,0.6)); }
      .lt-list-row:hover { background: rgba(217,178,122,0.1) !important; cursor: pointer; }
      .lt-chip:hover { border-color: rgba(217,178,122,0.65) !important; background: rgba(217,178,122,0.14) !important; }
      .lt-selected-pin {
        animation: selectedPinPulse 2s ease-in-out infinite !important;
      }
      .lt-route-line {
        stroke-dashoffset: var(--route-len, 1000);
        animation: routeDraw 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
      }
    `;
    document.head.appendChild(s);
  }

  // ── Category config ──────────────────────────────────────────
  const CAT_CONFIG = {
    Connectivity: { color: "#7fc8f8", bg: "rgba(127,200,248,0.14)", icon: "✈", emoji: "✈️" },
    "Tech Parks":  { color: "#a8d8a0", bg: "rgba(168,216,160,0.14)", icon: "🏢", emoji: "🏢" },
    Schools:       { color: "#f8d07a", bg: "rgba(248,208,122,0.14)", icon: "🎓", emoji: "🎓" },
    Hospitals:     { color: "#f79ea0", bg: "rgba(247,158,160,0.14)", icon: "⚕", emoji: "⚕️" },
    Shopping:      { color: "#c8a8f8", bg: "rgba(200,168,248,0.14)", icon: "🛍", emoji: "🛍️" },
  };

  const CATS = Object.keys(CAT_CONFIG);

  // ── Map pin positions (relative 0–1 on map canvas) ───────────
  const PIN_POSITIONS = {
    "Kempegowda International Airport": { rx: 0.72, ry: 0.18 },
    "Hebbal Flyover":                    { rx: 0.22, ry: 0.56 },
    "Bagalur Cross":                     { rx: 0.56, ry: 0.38 },
    "Outer Ring Road":                   { rx: 0.18, ry: 0.42 },

    "Wipro Aerospace":           { rx: 0.63, ry: 0.42 },
    "Boeing":                    { rx: 0.67, ry: 0.36 },
    "L&T Tech Park":             { rx: 0.70, ry: 0.50 },
    "Thyssenkrupp":              { rx: 0.60, ry: 0.47 },
    "Foxconn":                   { rx: 0.72, ry: 0.44 },
    "Shell Technology Centre":   { rx: 0.68, ry: 0.58 },
    "Financial City":            { rx: 0.74, ry: 0.62 },
    "Manyata Tech Park":         { rx: 0.26, ry: 0.70 },
    "Karle Town Centre SEZ":     { rx: 0.30, ry: 0.66 },
    "Kirloskar Business Park":   { rx: 0.28, ry: 0.62 },
    "Brigade Magnum":            { rx: 0.34, ry: 0.68 },

    "Delhi Public School":       { rx: 0.38, ry: 0.38 },
    "Greenfield International":  { rx: 0.34, ry: 0.43 },
    "Chrysalis School":          { rx: 0.36, ry: 0.48 },
    "Reva University":           { rx: 0.28, ry: 0.40 },
    "CMR University":            { rx: 0.32, ry: 0.36 },
    "National Public School":    { rx: 0.22, ry: 0.48 },
    "Canadian International":    { rx: 0.20, ry: 0.38 },
    "Presidency College":        { rx: 0.26, ry: 0.54 },
    "Presidency University":     { rx: 0.24, ry: 0.60 },
    "Presidency School":         { rx: 0.22, ry: 0.64 },

    "Regal Hospital":            { rx: 0.42, ry: 0.64 },
    "Aster Hospital":            { rx: 0.36, ry: 0.72 },
    "Columbia Asia":             { rx: 0.30, ry: 0.76 },

    "Bhartiya Mall":             { rx: 0.40, ry: 0.54 },
    "Big Bewaki":                { rx: 0.36, ry: 0.58 },
    "Mall of Asia":              { rx: 0.26, ry: 0.72 },
    "Esteem Mall":               { rx: 0.22, ry: 0.76 },
    "Decathlon":                 { rx: 0.20, ry: 0.70 },
    "Lulu Vasa Mart":            { rx: 0.18, ry: 0.64 },
    "Galleria Mall":             { rx: 0.16, ry: 0.56 },
    "Elements Mall":             { rx: 0.18, ry: 0.58 },
  };

  // LivingTree center position
  const CENTER = { rx: 0.50, ry: 0.50 };

  // ── Parse dist string to numeric minutes ────────────────────
  function parseMins(dist) {
    const m = dist.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 10;
  }

  // ── Compute SVG path for a curved route ─────────────────────
  // Returns { d, len } for an SVG path element
  function buildRoutePath(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    // Perpendicular offset for curve (30% of distance, with direction alternation)
    const curvature = dist * 0.28;
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    // Normal to line
    const nx = -dy / dist;
    const ny = dx / dist;
    const cpx = midX + nx * curvature;
    const cpy = midY + ny * curvature;
    const d = `M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`;
    // Approximate length: average of chord and arc
    const chord = dist;
    const arc = Math.sqrt((x1 - cpx) ** 2 + (y1 - cpy) ** 2) +
                Math.sqrt((x2 - cpx) ** 2 + (y2 - cpy) ** 2);
    const len = (chord + arc) / 2;
    return { d, len, cpx, cpy };
  }

  // ── Animated counter hook ──────────────────────────────────
  function useAnimatedCount(target, { duration = 900, delay = 200, trigger } = {}) {
    const [val, setVal] = React.useState(0);
    const rafRef = React.useRef(null);
    React.useEffect(() => {
      setVal(0);
      if (target === null || target === undefined) return;
      let cancelled = false;
      const startAfter = setTimeout(() => {
        if (cancelled) return;
        let startTime = null;
        const tick = (now) => {
          if (cancelled) return;
          if (!startTime) startTime = now;
          const t = Math.min((now - startTime) / duration, 1);
          // Expo easing out
          const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          setVal(Math.round(target * eased));
          if (t < 1) rafRef.current = requestAnimationFrame(tick);
          else setVal(target);
        };
        rafRef.current = requestAnimationFrame(tick);
      }, delay);
      return () => {
        cancelled = true;
        clearTimeout(startAfter);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }, [target, trigger]);
    return val;
  }

  // ── Vehicle dot traveling along route ───────────────────────
  function VehicleDot({ d, len, color, duration = 900, delay = 120 }) {
    const [pos, setPos] = React.useState({ x: 0, y: 0, angle: 0 });
    const rafRef = React.useRef(null);
    const svgRef = React.useRef(null);

    React.useEffect(() => {
      // Use a temporary SVG path to get points along the route
      let cancelled = false;
      const startAfter = setTimeout(() => {
        if (cancelled) return;
        // Create ephemeral path for sampling
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d);
        const totalLen = path.getTotalLength ? path.getTotalLength() : len;

        let startTime = null;
        const tick = (now) => {
          if (cancelled) return;
          if (!startTime) startTime = now;
          const t = Math.min((now - startTime) / duration, 1);
          const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          const pt = path.getPointAtLength(eased * totalLen);
          // Get angle
          const pt2 = path.getPointAtLength(Math.max(0, eased * totalLen - 2));
          const angle = Math.atan2(pt.y - pt2.y, pt.x - pt2.x) * 180 / Math.PI;
          setPos({ x: pt.x, y: pt.y, angle });
          if (t < 1) rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      }, delay);
      return () => {
        cancelled = true;
        clearTimeout(startAfter);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }, [d, len, duration, delay]);

    return (
      <g transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.angle})`}>
        {/* Glow halo */}
        <circle r="7" fill={color} opacity="0.18" />
        {/* Vehicle body */}
        <circle r="4" fill={color} opacity="0.95" />
        <circle r="2.5" fill="#0a120d" opacity="0.7" />
        {/* Speed trails */}
        <line x1="-10" y1="0" x2="-6" y2="0" stroke={color} strokeWidth="2" opacity="0.4" strokeLinecap="round" />
        <line x1="-14" y1="0" x2="-11" y2="0" stroke={color} strokeWidth="1.2" opacity="0.2" strokeLinecap="round" />
      </g>
    );
  }

  // ── Route SVG overlay (drawn on top of map, inside transform div) ──
  function RouteOverlay({ selectedLabel, mapW, mapH, catConfig }) {
    const [routeKey, setRouteKey] = React.useState(0);

    React.useEffect(() => {
      if (selectedLabel) setRouteKey(k => k + 1);
    }, [selectedLabel]);

    if (!selectedLabel) return null;
    const pos = PIN_POSITIONS[selectedLabel];
    if (!pos) return null;

    const x1 = CENTER.rx * mapW;
    const y1 = CENTER.ry * mapH;
    const x2 = pos.rx * mapW;
    const y2 = pos.ry * mapH;

    const landmark = LOCATION_ADVANTAGES.find(a => a.label === selectedLabel);
    if (!landmark) return null;
    const cfg = catConfig[landmark.cat];
    const { d, len } = buildRoutePath(x1, y1, x2, y2);

    return (
      <svg
        key={routeKey}
        width={mapW}
        height={mapH}
        viewBox={`0 0 ${mapW} ${mapH}`}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 12 }}
      >
        <defs>
          <filter id="routeGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id={`routeGrad-${routeKey}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={cfg.color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={cfg.color} stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Glow track (behind) */}
        <path
          d={d}
          fill="none"
          stroke={cfg.color}
          strokeWidth="8"
          strokeOpacity="0.12"
          strokeLinecap="round"
          filter="url(#routeGlow)"
          style={{
            strokeDasharray: len,
            strokeDashoffset: len,
            "--route-len": len,
            animation: `routeDraw 1.0s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.05s forwards`,
          }}
        />

        {/* Main route line — animated draw */}
        <path
          d={d}
          fill="none"
          stroke={cfg.color}
          strokeWidth="2.5"
          strokeOpacity="0.85"
          strokeLinecap="round"
          strokeDasharray={`8 5`}
          style={{
            strokeDasharray: `${len}`,
            strokeDashoffset: len,
            "--route-len": len,
            animation: `routeDraw 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.08s forwards`,
          }}
        />

        {/* Dashed accent on top */}
        <path
          d={d}
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="4 8"
          style={{
            strokeDasharray: `${len}`,
            strokeDashoffset: len,
            "--route-len": len,
            animation: `routeDraw 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s forwards`,
          }}
        />

        {/* Distance midpoint label */}
        {/* Vehicle dot traveling the route */}
        <VehicleDot
          d={d}
          len={len}
          color={cfg.color}
          duration={900}
          delay={100}
        />

        {/* Origin dot (LivingTree) */}
        <circle cx={x1} cy={y1} r="6" fill={THEME.gold} opacity="0.9" />
        <circle cx={x1} cy={y1} r="10" fill="none" stroke={THEME.gold} strokeWidth="1.5" opacity="0.4" />

        {/* Destination dot */}
        <circle cx={x2} cy={y2} r="5" fill={cfg.color} opacity="0.9" />
        <circle cx={x2} cy={y2} r="9" fill="none" stroke={cfg.color} strokeWidth="1.5" opacity="0.35">
          <animate attributeName="r" values="7;13;7" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    );
  }

  // ── SVG Vector Map (dark-themed) ────────────────────────────
  const VectorMap = ({ width, height, offsetX, offsetY, zoom }) => {
    const W = width * zoom;
    const H = height * zoom;
    const ox = offsetX;
    const oy = offsetY;
    const cx = (rx) => ox + rx * W;
    const cy = (ry) => oy + ry * H;

    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute", inset: 0, display: "block" }}
      >
        <rect width={width} height={height} fill="#0e1c14" />

        {/* Major road grid */}
        <path d={`M ${ox} ${cy(0.30)} L ${ox+W} ${cy(0.30)}`} stroke="#1e3228" strokeWidth="8" />
        <path d={`M ${ox} ${cy(0.52)} L ${ox+W} ${cy(0.52)}`} stroke="#1a2e22" strokeWidth="6" />
        <path d={`M ${ox} ${cy(0.70)} L ${ox+W} ${cy(0.70)}`} stroke="#162a1e" strokeWidth="5" />
        <path d={`M ${cx(0.30)} ${oy} L ${cx(0.30)} ${oy+H}`} stroke="#1e3228" strokeWidth="8" />
        <path d={`M ${cx(0.52)} ${oy} L ${cx(0.52)} ${oy+H}`} stroke="#1a2e22" strokeWidth="7" />
        <path d={`M ${cx(0.68)} ${oy} L ${cx(0.68)} ${oy+H}`} stroke="#162a1e" strokeWidth="6" />

        {/* Minor roads */}
        {[0.15, 0.22, 0.38, 0.44, 0.60, 0.78, 0.85].map((r, i) => (
          <path key={`hr${i}`} d={`M ${ox} ${cy(r)} L ${ox+W} ${cy(r)}`} stroke="#132018" strokeWidth="3" />
        ))}
        {[0.12, 0.20, 0.40, 0.48, 0.58, 0.74, 0.88].map((r, i) => (
          <path key={`vr${i}`} d={`M ${cx(r)} ${oy} L ${cx(r)} ${oy+H}`} stroke="#132018" strokeWidth="3" />
        ))}

        {/* Diagonal connector roads */}
        <path d={`M ${cx(0.30)} ${cy(0.52)} L ${cx(0.68)} ${cy(0.30)}`} stroke="#1e3228" strokeWidth="6" />
        <path d={`M ${cx(0.52)} ${cy(0.70)} L ${cx(0.68)} ${cy(0.52)}`} stroke="#1a2e22" strokeWidth="5" />

        {/* Green zones */}
        <ellipse cx={cx(0.14)} cy={cy(0.20)} rx={cx(0.08)-cx(0)} ry={cy(0.05)-cy(0)} fill="#0f1f15" opacity="0.8" />
        <ellipse cx={cx(0.80)} cy={cy(0.76)} rx={cx(0.06)-cx(0)} ry={cy(0.04)-cy(0)} fill="#0f1f15" opacity="0.7" />
        <rect x={cx(0.40)} y={cy(0.12)} width={cx(0.10)-cx(0)} height={cy(0.09)-cy(0)} rx="4" fill="#0d1d12" opacity="0.75" />
        <rect x={cx(0.56)} y={cy(0.24)} width={cx(0.20)-cx(0)} height={cy(0.18)-cy(0)} rx="6" fill="rgba(127,200,248,0.03)" stroke="rgba(127,200,248,0.07)" strokeWidth="1" />

        {/* Water body */}
        <ellipse cx={cx(0.82)} cy={cy(0.22)} rx={cx(0.05)-cx(0)} ry={cy(0.035)-cy(0)} fill="#0a1820" opacity="0.9" />

        {/* City blocks */}
        {[
          [0.10, 0.32, 0.07, 0.06],
          [0.20, 0.28, 0.06, 0.05],
          [0.76, 0.54, 0.08, 0.07],
          [0.74, 0.32, 0.06, 0.06],
          [0.12, 0.54, 0.07, 0.05],
          [0.36, 0.26, 0.06, 0.04],
          [0.42, 0.72, 0.07, 0.05],
          [0.62, 0.72, 0.06, 0.05],
        ].map(([rx, ry, rw, rh], i) => (
          <rect key={`blk${i}`} x={cx(rx)} y={cy(ry)} width={cx(rw)-cx(0)} height={cy(rh)-cy(0)} rx="3" fill="#111f17" opacity="0.7" />
        ))}

        {/* Road labels */}
        <text x={cx(0.35)} y={cy(0.285)} fill="rgba(244,234,216,0.25)" fontSize="9" fontFamily="Inter,sans-serif" letterSpacing="1.5" textAnchor="middle">BAGALUR ROAD</text>
        <text x={cx(0.72)} y={cy(0.26)} fill="rgba(127,200,248,0.3)" fontSize="8.5" fontFamily="Inter,sans-serif" letterSpacing="1.2" textAnchor="middle">KIA — 15 MIN</text>
        <text x={cx(0.52)} y={cy(0.345)} fill="rgba(244,234,216,0.2)" fontSize="8" fontFamily="Inter,sans-serif" letterSpacing="1.2" textAnchor="middle">HENNUR — BAGALUR MAIN RD</text>
        <text x={cx(0.56)} y={cy(0.24)} fill="rgba(127,200,248,0.2)" fontSize="7.5" fontFamily="Inter,sans-serif" letterSpacing="1" textAnchor="middle" fontStyle="italic">KIADB AEROSPACE PARK</text>
      </svg>
    );
  };

  // ── Pin SVG component ────────────────────────────────────────
  const Pin = ({ color, size = 28, glow = false, special = false }) => (
    <svg width={size} height={size * 1.3} viewBox="0 0 28 36" fill="none"
      style={{ filter: glow ? `drop-shadow(0 0 10px ${color}aa)` : undefined, display: "block" }}>
      <path d="M14 2C8.477 2 4 6.477 4 12c0 7 10 22 10 22s10-15 10-22c0-5.523-4.477-10-10-10z"
        fill={special ? color : color + "cc"} stroke={color} strokeWidth={special ? 1.5 : 1}/>
      <circle cx="14" cy="12" r="5" fill={special ? "#1a2620" : "rgba(10,18,13,0.85)"}/>
      {special && <circle cx="14" cy="12" r="2.5" fill={color}/>}
    </svg>
  );

  // ── Animated Distance Card (right-side pop-up on selection) ──
  function DistanceCard({ landmark, cfg, routeKey }) {
    const mins = React.useMemo(() => parseMins(landmark.dist), [landmark.dist]);
    const count = useAnimatedCount(mins, { duration: 800, delay: 350, trigger: routeKey });

    return (
      <div style={{
        position: "absolute",
        bottom: 70,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 40,
        background: "rgba(9,16,11,0.97)",
        border: `1px solid ${cfg.color}60`,
        borderRadius: 16,
        padding: "18px 24px",
        minWidth: 280,
        maxWidth: 380,
        boxShadow: `0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px ${cfg.color}20, 0 0 40px ${cfg.color}10`,
        animation: "cardSlideIn 0.38s cubic-bezier(0.34,1.3,0.64,1)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          {/* Icon circle */}
          <div style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: cfg.bg,
            border: `1.5px solid ${cfg.color}50`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
            boxShadow: `0 0 16px ${cfg.color}20`,
          }}>
            {cfg.emoji}
          </div>

          <div style={{ flex: 1 }}>
            {/* Name */}
            <div style={{
              fontFamily: THEME.serif,
              fontSize: 17,
              fontWeight: 500,
              color: THEME.cream,
              lineHeight: 1.2,
              marginBottom: 8,
            }}>
              {landmark.label}
            </div>

            {/* Distance counter */}
            <div style={{
              display: "flex",
              alignItems: "baseline",
              gap: 6,
              marginBottom: 6,
              animation: "distReveal 0.4s ease 0.3s backwards",
            }}>
              <span style={{
                fontFamily: THEME.serif,
                fontSize: 32,
                fontWeight: 600,
                color: cfg.color,
                lineHeight: 1,
                letterSpacing: -0.5,
                fontVariantNumeric: "tabular-nums",
              }}>
                {count}
              </span>
              <span style={{
                fontSize: 13,
                fontWeight: 600,
                color: cfg.color,
                opacity: 0.8,
                letterSpacing: 0.5,
              }}>
                min
              </span>
              <span style={{
                fontSize: 10,
                color: THEME.dim,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginLeft: 4,
              }}>
                drive
              </span>
            </div>

            {/* Route drawn indicator */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 4,
              animation: "distReveal 0.4s ease 0.5s backwards",
            }}>
              <div style={{
                width: 28,
                height: 2,
                background: `linear-gradient(90deg, ${THEME.gold}, ${cfg.color})`,
                borderRadius: 1,
              }} />
              <span style={{
                fontSize: 9.5,
                color: THEME.dim,
                letterSpacing: 1.2,
                textTransform: "uppercase",
              }}>
                Route from LivingTree
              </span>
            </div>

            {/* Category tag */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 8px",
              background: cfg.bg,
              borderRadius: 999,
              fontSize: 9.5,
              color: cfg.color,
              letterSpacing: 0.8,
              fontWeight: 600,
              animation: "distReveal 0.4s ease 0.6s backwards",
            }}>
              <span style={{ fontSize: 11 }}>{cfg.icon}</span>
              {landmark.cat}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // handled by parent via click-off
            }}
            style={{
              background: "transparent",
              border: `1px solid ${THEME.lineSoft}`,
              borderRadius: "50%",
              color: THEME.dim,
              cursor: "pointer",
              fontSize: 14,
              lineHeight: 1,
              width: 26,
              height: 26,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(217,178,122,0.15)";
              e.currentTarget.style.borderColor = THEME.lineStrong;
              e.currentTarget.style.color = THEME.cream;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = THEME.lineSoft;
              e.currentTarget.style.color = THEME.dim;
            }}
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  // ── Main Screen ──────────────────────────────────────────────
  function LocationScreen({ onBack, navigate }) {
    const PANEL_W = 290;
    const MAP_W = STAGE_W - PANEL_W; // 1150
    const MAP_H = STAGE_H - 76;     // 824

    const [viewMode, setViewMode] = React.useState("map");
    const [activeCategories, setActiveCategories] = React.useState(new Set(CATS));
    const [selectedPin, setSelectedPin] = React.useState(null);
    const [hoveredPin, setHoveredPin] = React.useState(null);
    const [pinsVisible, setPinsVisible] = React.useState(false);
    const [panOffset, setPanOffset] = React.useState({ x: 0, y: 0 });
    const [zoom, setZoom] = React.useState(1);
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragStart, setDragStart] = React.useState(null);
    const [panStart, setPanStart] = React.useState(null);
    const [transitioning, setTransitioning] = React.useState(false);
    const [routeKey, setRouteKey] = React.useState(0); // increments on each new selection → re-mounts route + counter
    const mapRef = React.useRef(null);

    React.useEffect(() => {
      const t = setTimeout(() => setPinsVisible(true), 200);
      return () => clearTimeout(t);
    }, []);

    // Select pin + increment routeKey to re-trigger all animations
    const selectPin = React.useCallback((label) => {
      setSelectedPin(prev => {
        if (prev === label) return null;
        return label;
      });
      setRouteKey(k => k + 1);
    }, []);

    const toggleCat = (cat) => {
      setActiveCategories(prev => {
        const next = new Set(prev);
        if (next.has(cat)) {
          if (next.size > 1) next.delete(cat);
        } else {
          next.add(cat);
        }
        return next;
      });
      setSelectedPin(null);
    };

    const allActive = activeCategories.size === CATS.length;
    const toggleAll = () => {
      if (allActive) setActiveCategories(new Set([CATS[0]]));
      else setActiveCategories(new Set(CATS));
      setSelectedPin(null);
    };

    const switchView = (mode) => {
      if (mode === viewMode) return;
      setTransitioning(true);
      setTimeout(() => { setViewMode(mode); setTransitioning(false); }, 280);
    };

    const onPointerDown = (e) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setPanStart({ ...panOffset });
    };
    const onPointerMove = (e) => {
      if (!isDragging || !dragStart) return;
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      const maxPan = (zoom - 1) * MAP_W * 0.5 + 60;
      setPanOffset({
        x: Math.max(-maxPan, Math.min(maxPan, panStart.x + dx)),
        y: Math.max(-maxPan * 0.7, Math.min(maxPan * 0.7, panStart.y + dy)),
      });
    };
    const onPointerUp = () => { setIsDragging(false); setDragStart(null); };

    const onWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(z => Math.max(1, Math.min(2.4, z + delta)));
    };

    const focusPin = (landmark) => {
      const pos = PIN_POSITIONS[landmark.label];
      if (!pos) return;
      selectPin(landmark.label);
      const targetX = (0.5 - pos.rx) * MAP_W * zoom;
      const targetY = (0.5 - pos.ry) * MAP_H * zoom;
      setPanOffset({ x: targetX * 0.5, y: targetY * 0.4 });
    };

    const zoomIn  = () => setZoom(z => Math.min(2.4, parseFloat((z + 0.2).toFixed(1))));
    const zoomOut = () => setZoom(z => Math.max(1, parseFloat((z - 0.2).toFixed(1))));

    const catCounts = React.useMemo(() => {
      const counts = {};
      LOCATION_ADVANTAGES.forEach(a => { counts[a.cat] = (counts[a.cat] || 0) + 1; });
      return counts;
    }, []);

    const selectedData = React.useMemo(() => {
      if (!selectedPin) return null;
      return LOCATION_ADVANTAGES.find(a => a.label === selectedPin) || null;
    }, [selectedPin]);

    const mapTransform = `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`;

    return (
      <ScreenShell
        title="Location"
        eyebrow="KIADB Aerospace Park · Bagalur · North Bengaluru"
        onBack={onBack}
        scroll={false}
        pad={false}
      >
        <div style={{ display: "flex", width: "100%", height: "100%", position: "relative" }}>

          {/* ══ SIDE PANEL ═══════════════════════════════════════ */}
          <div style={{
            width: PANEL_W,
            height: "100%",
            background: "rgba(9,16,11,0.92)",
            borderRight: `1px solid ${THEME.line}`,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            zIndex: 10,
            animation: "panelFade 0.5s ease 0.1s backwards",
          }}>
            {/* Panel header */}
            <div style={{ padding: "20px 22px 16px", borderBottom: `1px solid ${THEME.lineSoft}` }}>
              <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: THEME.gold, marginBottom: 8, opacity: 0.85 }}>
                Location Advantages
              </div>
              <div style={{ fontFamily: THEME.serif, fontSize: 19, fontWeight: 500, color: THEME.cream, lineHeight: 1.2 }}>
                Proximity to What Matters
              </div>
              {/* Airport highlight */}
              <div style={{
                marginTop: 12,
                padding: "9px 13px",
                background: "rgba(127,200,248,0.08)",
                border: "1px solid rgba(127,200,248,0.2)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                gap: 9,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onClick={() => focusPin({ label: "Kempegowda International Airport" })}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(127,200,248,0.14)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(127,200,248,0.08)"}
              >
                <span style={{ fontSize: 15 }}>✈️</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#7fc8f8", letterSpacing: 0.3 }}>15 min to KIA</div>
                  <div style={{ fontSize: 9.5, color: THEME.dim, letterSpacing: 0.5, marginTop: 1 }}>Kempegowda International Airport</div>
                </div>
                <div style={{ marginLeft: "auto", fontSize: 9, color: "rgba(127,200,248,0.5)", letterSpacing: 1 }}>TAP</div>
              </div>
            </div>

            {/* Category filters */}
            <div style={{ padding: "13px 16px 10px", borderBottom: `1px solid ${THEME.lineSoft}`, display: "flex", flexWrap: "wrap", gap: 5 }}>
              <button className="lt-chip" onClick={toggleAll} style={{
                padding: "5px 10px", borderRadius: 999,
                background: allActive ? THEME.goldSoft : "transparent",
                border: `1px solid ${allActive ? THEME.lineStrong : THEME.lineSoft}`,
                color: allActive ? THEME.gold : THEME.dim,
                fontSize: 9.5, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase",
                cursor: "pointer", fontFamily: THEME.sans, transition: "all 0.2s",
                animation: `chipPop 0.35s ease backwards`,
              }}>All</button>
              {CATS.map((cat, ci) => {
                const cfg = CAT_CONFIG[cat];
                const active = activeCategories.has(cat);
                return (
                  <button key={cat} className="lt-chip" onClick={() => toggleCat(cat)} style={{
                    padding: "5px 9px", borderRadius: 999,
                    background: active ? cfg.bg : "transparent",
                    border: `1px solid ${active ? cfg.color + "60" : THEME.lineSoft}`,
                    color: active ? cfg.color : THEME.dim,
                    fontSize: 9.5, fontWeight: 600, letterSpacing: 0.8,
                    cursor: "pointer", fontFamily: THEME.sans, transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: 4,
                    animation: `chipPop 0.35s ease ${0.05 + ci * 0.06}s backwards`,
                  }}>
                    <span style={{ fontSize: 11 }}>{cfg.icon}</span>
                    <span>{cat}</span>
                    <span style={{
                      background: active ? cfg.color + "30" : "rgba(255,255,255,0.08)",
                      color: active ? cfg.color : "rgba(255,255,255,0.4)",
                      borderRadius: 999, padding: "1px 5px", fontSize: 8.5, fontWeight: 700,
                    }}>{catCounts[cat] || 0}</span>
                  </button>
                );
              })}
            </div>

            {/* Landmarks list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
              {/* Hint text if nothing selected */}
              {!selectedPin && (
                <div style={{
                  padding: "10px 18px 4px",
                  fontSize: 9.5,
                  color: "rgba(244,234,216,0.3)",
                  letterSpacing: 0.5,
                  fontStyle: "italic",
                  lineHeight: 1.5,
                }}>
                  Tap any landmark to see the route from LivingTree
                </div>
              )}
              {CATS.filter(c => activeCategories.has(c)).map((cat) => {
                const cfg = CAT_CONFIG[cat];
                const items = LOCATION_ADVANTAGES.filter(a => a.cat === cat);
                return (
                  <div key={cat}>
                    <div style={{ padding: "8px 18px 4px", fontSize: 8.5, letterSpacing: 2.2, textTransform: "uppercase", color: cfg.color, opacity: 0.8, fontWeight: 600 }}>
                      {cat}
                    </div>
                    {items.map((item) => {
                      const isSelected = selectedPin === item.label;
                      return (
                        <div
                          key={item.label}
                          className="lt-list-row"
                          onClick={() => focusPin(item)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "7px 18px",
                            gap: 9,
                            background: isSelected ? cfg.bg : "transparent",
                            borderLeft: isSelected ? `2px solid ${cfg.color}` : "2px solid transparent",
                            transition: "background 0.2s, border-color 0.15s",
                          }}
                        >
                          {/* Colored dot */}
                          <div style={{
                            width: 6, height: 6, borderRadius: "50%",
                            background: cfg.color, flexShrink: 0,
                            boxShadow: isSelected ? `0 0 8px ${cfg.color}` : "none",
                            transition: "box-shadow 0.3s",
                          }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: 11,
                              color: isSelected ? THEME.cream : THEME.dim,
                              fontWeight: isSelected ? 600 : 400,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              lineHeight: 1.35,
                            }}>
                              {item.label}
                            </div>
                          </div>
                          {/* Distance badge — shows count-up animation when selected */}
                          <div style={{ flexShrink: 0 }}>
                            {isSelected ? (
                              <LiveDistBadge dist={item.dist} color={cfg.color} routeKey={routeKey} />
                            ) : (
                              <span style={{ fontSize: 10, color: cfg.color, fontWeight: 600, opacity: 0.85, letterSpacing: 0.3 }}>
                                {item.dist}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Address footer */}
            <div style={{
              padding: "12px 18px",
              borderTop: `1px solid ${THEME.lineSoft}`,
              fontSize: 9.5,
              color: "rgba(244,234,216,0.4)",
              lineHeight: 1.55,
              letterSpacing: 0.3,
            }}>
              Plot 7, Hitech Defence & Aerospace Park
              <br />Jala Hobli, Bengaluru North — 560064
            </div>
          </div>

          {/* ══ MAP AREA ════════════════════════════════════════ */}
          <div
            style={{
              flex: 1,
              position: "relative",
              overflow: "hidden",
              background: "#0e1c14",
              cursor: isDragging ? "grabbing" : "grab",
            }}
            ref={mapRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onMouseLeave={onPointerUp}
            onWheel={onWheel}
          >
            {/* ── Transformable layers ── */}
            <div style={{
              position: "absolute",
              inset: 0,
              transformOrigin: "center center",
              transform: mapTransform,
              willChange: "transform",
              userSelect: "none",
            }}>
              {/* Vector map layer */}
              <div style={{
                position: "absolute", inset: 0,
                opacity: transitioning ? 0 : (viewMode === "map" ? 1 : 0),
                transition: "opacity 0.35s ease",
                pointerEvents: "none",
              }}>
                <VectorMap width={MAP_W} height={MAP_H} offsetX={0} offsetY={0} zoom={1} />
              </div>

              {/* Satellite map layer */}
              <div style={{
                position: "absolute", inset: 0,
                opacity: transitioning ? 0 : (viewMode === "satellite" ? 1 : 0),
                transition: "opacity 0.35s ease",
                pointerEvents: "none",
              }}>
                <img
                  src="assets/maps/location-02.jpg"
                  alt="Satellite view"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", filter: "brightness(0.72) saturate(0.7) contrast(1.1)" }}
                  draggable="false"
                />
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(10,18,13,0.1) 0%, rgba(10,18,13,0.5) 100%)", pointerEvents: "none" }} />
              </div>

              {/* ── Route overlay (drawn between center and selected pin) ── */}
              {selectedPin && (
                <RouteOverlay
                  key={`route-${routeKey}`}
                  selectedLabel={selectedPin}
                  mapW={MAP_W}
                  mapH={MAP_H}
                  catConfig={CAT_CONFIG}
                />
              )}

              {/* ── Landmark pins ── */}
              {pinsVisible && LOCATION_ADVANTAGES.map((landmark, idx) => {
                if (!activeCategories.has(landmark.cat)) return null;
                const pos = PIN_POSITIONS[landmark.label];
                if (!pos) return null;

                const pinX = pos.rx * MAP_W;
                const pinY = pos.ry * MAP_H;
                const cfg = CAT_CONFIG[landmark.cat];
                const isSelected = selectedPin === landmark.label;
                const isHovered = hoveredPin === landmark.label;
                const pinDelay = (idx * 0.04) + 0.3;
                const pinSize = isSelected ? 28 : (isHovered ? 24 : 20);

                return (
                  <div
                    key={landmark.label}
                    className={isSelected ? "" : "lt-pin-hover"}
                    onMouseEnter={() => setHoveredPin(landmark.label)}
                    onMouseLeave={() => setHoveredPin(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedPin === landmark.label) {
                        setSelectedPin(null);
                      } else {
                        focusPin(landmark);
                      }
                    }}
                    style={{
                      position: "absolute",
                      left: pinX,
                      top: pinY,
                      transform: "translate(-50%, -100%)",
                      zIndex: isSelected ? 20 : (isHovered ? 15 : 5),
                      opacity: 0,
                      animation: isSelected
                        ? `pinDrop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) ${pinDelay}s forwards, selectedPinPulse 2.2s ease-in-out 1.2s infinite`
                        : `pinDrop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) ${pinDelay}s forwards`,
                      cursor: "pointer",
                      pointerEvents: "auto",
                      transition: "z-index 0.1s",
                    }}
                  >
                    <Pin
                      color={cfg.color}
                      size={pinSize}
                      glow={isSelected || isHovered}
                      special={false}
                    />
                    {/* Tooltip on hover (not selected) */}
                    {isHovered && !isSelected && (
                      <div style={{
                        position: "absolute",
                        bottom: "calc(100% + 6px)",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "rgba(9,16,11,0.95)",
                        border: `1px solid ${cfg.color}60`,
                        borderRadius: 7,
                        padding: "5px 10px",
                        whiteSpace: "nowrap",
                        pointerEvents: "none",
                        animation: "tooltipIn 0.15s ease",
                        zIndex: 50,
                      }}>
                        <div style={{ fontSize: 10.5, fontWeight: 600, color: THEME.cream }}>{landmark.label}</div>
                        <div style={{ fontSize: 9.5, color: cfg.color, marginTop: 1 }}>{landmark.dist}</div>
                      </div>
                    )}
                    {/* Selected: floating distance badge above pin */}
                    {isSelected && (
                      <div style={{
                        position: "absolute",
                        bottom: "calc(100% + 4px)",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: `rgba(9,16,11,0.97)`,
                        border: `1.5px solid ${cfg.color}80`,
                        borderRadius: 8,
                        padding: "4px 10px",
                        whiteSpace: "nowrap",
                        pointerEvents: "none",
                        zIndex: 50,
                        animation: "cardSlideIn 0.3s cubic-bezier(0.34,1.3,0.64,1) 0.4s backwards",
                        boxShadow: `0 4px 20px ${cfg.color}30`,
                      }}>
                        <PinDistCounter dist={landmark.dist} color={cfg.color} routeKey={routeKey} />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* ── Project pin (LivingTree center) ── */}
              {pinsVisible && (() => {
                const px = CENTER.rx * MAP_W;
                const py = CENTER.ry * MAP_H;
                return (
                  <div style={{ position: "absolute", left: px, top: py, zIndex: 30, pointerEvents: "none" }}>
                    {[0, 0.7, 1.4].map((delay, i) => (
                      <div key={i} style={{
                        position: "absolute", left: 0, top: 0,
                        width: 52, height: 52, borderRadius: "50%",
                        border: `1.5px solid ${THEME.gold}`,
                        transform: "translate(-50%, -50%)",
                        animation: `rippleOut 2.4s ease-out ${delay}s infinite`,
                        pointerEvents: "none",
                      }} />
                    ))}
                    <div style={{
                      position: "absolute", left: 0, top: 0,
                      width: 24, height: 24, borderRadius: "50%",
                      background: `radial-gradient(circle, ${THEME.gold}60 0%, transparent 70%)`,
                      transform: "translate(-50%, -50%)",
                      animation: "heroBreath 3s ease-in-out infinite",
                    }} />
                    <div style={{
                      position: "absolute", left: 0, top: 0,
                      transform: "translate(-50%, -100%)",
                      opacity: 0,
                      animation: "pinDrop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.15s forwards",
                    }}>
                      <Pin color={THEME.gold} size={34} glow={true} special={true} />
                    </div>
                    <div style={{
                      position: "absolute", left: 22, top: -38,
                      background: "rgba(9,16,11,0.95)",
                      border: `1px solid ${THEME.lineStrong}`,
                      borderRadius: 8,
                      padding: "5px 10px",
                      whiteSpace: "nowrap",
                      pointerEvents: "none",
                    }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: THEME.gold, letterSpacing: 0.5, fontFamily: THEME.sans }}>LivingTree</div>
                      <div style={{ fontSize: 9, color: THEME.dim, marginTop: 1, letterSpacing: 0.3 }}>KIADB Aerospace Park</div>
                    </div>
                  </div>
                );
              })()}
            </div>{/* end transform div */}

            {/* ── Selected pin info card (distance reveal) ── */}
            {selectedData && (
              <DistanceCard
                key={`card-${routeKey}`}
                landmark={selectedData}
                cfg={CAT_CONFIG[selectedData.cat]}
                routeKey={routeKey}
              />
            )}

            {/* ── View toggle (Map / Satellite) ── */}
            <div style={{
              position: "absolute", top: 16, right: 16, zIndex: 40,
              display: "flex",
              background: "rgba(9,16,11,0.92)",
              border: `1px solid ${THEME.line}`,
              borderRadius: 10, overflow: "hidden",
              backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            }}>
              {[{ id: "map", label: "Map", icon: "⊞" }, { id: "satellite", label: "Satellite", icon: "⬡" }].map(({ id, label, icon }, i) => {
                const active = viewMode === id;
                return (
                  <button key={id} onClick={() => switchView(id)} style={{
                    background: active ? THEME.goldSoft : "transparent",
                    border: "none",
                    borderRight: i === 0 ? `1px solid ${THEME.lineSoft}` : "none",
                    color: active ? THEME.gold : THEME.dim,
                    padding: "9px 16px",
                    fontSize: 11, fontWeight: 600, letterSpacing: 0.8,
                    cursor: "pointer", fontFamily: THEME.sans, transition: "all 0.22s",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{ fontSize: 13 }}>{icon}</span>
                    {label}
                  </button>
                );
              })}
            </div>

            {/* ── Zoom controls ── */}
            <div style={{
              position: "absolute", top: 72, right: 16, zIndex: 40,
              display: "flex", flexDirection: "column",
              background: "rgba(9,16,11,0.92)",
              border: `1px solid ${THEME.line}`,
              borderRadius: 10, overflow: "hidden",
              backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            }}>
              {[{ label: "+", action: zoomIn, disabled: zoom >= 2.4 }, { label: "−", action: zoomOut, disabled: zoom <= 1 }].map(({ label, action, disabled }, i) => (
                <button key={label} onClick={action} disabled={disabled} style={{
                  background: "transparent", border: "none",
                  borderBottom: i === 0 ? `1px solid ${THEME.lineSoft}` : "none",
                  color: disabled ? "rgba(244,234,216,0.22)" : THEME.cream,
                  width: 38, height: 36, fontSize: 18, fontWeight: 300,
                  cursor: disabled ? "default" : "pointer",
                  fontFamily: THEME.sans, transition: "color 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {label}
                </button>
              ))}
              <div style={{ padding: "5px 6px", textAlign: "center", fontSize: 9, color: THEME.dim, letterSpacing: 0.5, borderTop: `1px solid ${THEME.lineSoft}`, fontFamily: THEME.sans }}>
                {Math.round(zoom * 100)}%
              </div>
            </div>

            {/* ── Category legend bottom ── */}
            <div style={{ position: "absolute", bottom: 16, left: 16, zIndex: 40, display: "flex", gap: 6, flexWrap: "wrap", maxWidth: 500 }}>
              {CATS.map((cat) => {
                const cfg = CAT_CONFIG[cat];
                const active = activeCategories.has(cat);
                return (
                  <div key={cat} onClick={() => toggleCat(cat)} className="lt-chip" style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "5px 9px",
                    background: active ? cfg.bg : "rgba(9,16,11,0.7)",
                    border: `1px solid ${active ? cfg.color + "50" : THEME.lineSoft}`,
                    borderRadius: 999, cursor: "pointer",
                    backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                    transition: "all 0.2s",
                  }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.color, opacity: active ? 1 : 0.35, boxShadow: active ? `0 0 6px ${cfg.color}` : "none" }} />
                    <span style={{ fontSize: 9.5, color: active ? cfg.color : THEME.dim, fontWeight: 600, letterSpacing: 0.6, opacity: active ? 1 : 0.5 }}>{cat}</span>
                  </div>
                );
              })}
            </div>

            {/* ── Coordinates badge ── */}
            <div style={{
              position: "absolute", bottom: 16, right: 16, zIndex: 40,
              background: "rgba(9,16,11,0.88)",
              border: `1px solid ${THEME.lineSoft}`,
              borderRadius: 8, padding: "7px 12px",
              backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
            }}>
              <div style={{ fontSize: 9, color: THEME.dim, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 2, fontFamily: THEME.sans }}>Coordinates</div>
              <div style={{ fontSize: 10, color: THEME.gold, fontFamily: "monospace", letterSpacing: 0.5 }}>13.1379° N · 77.6446° E</div>
            </div>

            {/* ── Compass rose ── */}
            <div style={{ position: "absolute", top: 16, left: 16, zIndex: 40 }}>
              <svg width="44" height="44" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="20" fill="rgba(9,16,11,0.88)" stroke={THEME.lineSoft} strokeWidth="1"/>
                <polygon points="22,4 19,20 22,18 25,20" fill={THEME.gold} opacity="0.9"/>
                <polygon points="22,40 19,24 22,26 25,24" fill={THEME.dim} opacity="0.5"/>
                <polygon points="40,22 24,19 26,22 24,25" fill={THEME.dim} opacity="0.5"/>
                <polygon points="4,22 20,19 18,22 20,25" fill={THEME.dim} opacity="0.5"/>
                <text x="22" y="15" textAnchor="middle" fill={THEME.gold} fontSize="7" fontFamily="Inter,sans-serif" fontWeight="700">N</text>
                <circle cx="22" cy="22" r="2.5" fill={THEME.gold} opacity="0.8"/>
              </svg>
            </div>

            {/* Click-off deselect */}
            <div style={{ position: "absolute", inset: 0, zIndex: 1 }} onClick={() => setSelectedPin(null)} />
          </div>{/* end map area */}
        </div>
      </ScreenShell>
    );
  }

  // ── Small inline count-up for the pin badge (top of selected pin) ──
  function PinDistCounter({ dist, color, routeKey }) {
    const mins = parseMins(dist);
    const count = useAnimatedCount(mins, { duration: 700, delay: 450, trigger: routeKey });
    return (
      <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color, fontVariantNumeric: "tabular-nums", letterSpacing: -0.3 }}>
          {count}
        </span>
        <span style={{ fontSize: 9, color, opacity: 0.8, fontWeight: 600 }}>min</span>
      </div>
    );
  }

  // ── Inline dist badge in side panel list row (count-up version) ──
  function LiveDistBadge({ dist, color, routeKey }) {
    const mins = parseMins(dist);
    const count = useAnimatedCount(mins, { duration: 600, delay: 300, trigger: routeKey });
    return (
      <div style={{
        display: "flex", alignItems: "baseline", gap: 2,
        animation: "distReveal 0.3s ease backwards",
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>{count}</span>
        <span style={{ fontSize: 9, color, opacity: 0.75, fontWeight: 600 }}> min</span>
      </div>
    );
  }

  window.SCREENS = window.SCREENS || {};
  window.SCREENS["location"] = LocationScreen;

})();
