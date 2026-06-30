// === The Universe · FX library ====================================
// Shared interactive primitives, reused across all screens.
//
// Exports (window.*):
//   Aurora               — drifting gold blob ambience for dark hero areas
//   ConstellationField   — cursor-reactive starfield + lines
//   FilmGrain            — SVG-noise overlay (luxury filmic texture)
//   CustomCursor         — gold ring + dot that follows the mouse
//   Magnetic             — wraps a child to pull it toward the cursor
//   TiltCard             — 3D tilt on hover
//   ShimmerSweep         — gold sweep across a button on hover
//   CounterFlip          — split-flap animated number
//   Donut                — animated SVG donut ring
//   ConfettiCannon       — gold confetti burst at coords
//   useRipple            — hook giving (ripples, fire(x,y))
//   useReveal            — IntersectionObserver visibility hook

// ----- 1. Aurora ---------------------------------------------------
// Four blurred radial blobs in gold/champagne/ink — full-bleed,
// screen-blended over a dark base. Pure CSS keyframes.
function Aurora({ tint = 'gold', intensity = 1, dark = true }) {
  // Insert keyframes once
  React.useEffect(() => {
    if (document.getElementById('uni-aurora-keys')) return;
    const s = document.createElement('style');
    s.id = 'uni-aurora-keys';
    s.textContent = `
      @keyframes uniAuroraA {
        0%   { transform: translate3d(0,0,0) scale(1) rotate(0deg); }
        25%  { transform: translate3d(220px,160px,0) scale(1.14) rotate(6deg); }
        50%  { transform: translate3d(60px,300px,0) scale(0.94) rotate(10deg); }
        75%  { transform: translate3d(-200px,170px,0) scale(1.08) rotate(4deg); }
        100% { transform: translate3d(0,0,0) scale(1) rotate(0deg); }
      }
      @keyframes uniAuroraB {
        0%   { transform: translate3d(0,0,0) scale(1.02) rotate(0deg); }
        25%  { transform: translate3d(-140px,-200px,0) scale(0.92) rotate(-5deg); }
        50%  { transform: translate3d(-280px,80px,0) scale(1.20) rotate(-9deg); }
        75%  { transform: translate3d(-110px,250px,0) scale(1.04) rotate(-4deg); }
        100% { transform: translate3d(0,0,0) scale(1.02) rotate(0deg); }
      }
      @keyframes uniAuroraC {
        0%   { transform: translate3d(0,0,0) scale(1) rotate(0deg); }
        25%  { transform: translate3d(200px,-140px,0) scale(1.10) rotate(5deg); }
        50%  { transform: translate3d(40px,-280px,0) scale(0.90) rotate(8deg); }
        75%  { transform: translate3d(-220px,-110px,0) scale(1.06) rotate(3deg); }
        100% { transform: translate3d(0,0,0) scale(1) rotate(0deg); }
      }
      @keyframes uniAuroraD {
        0%   { transform: translate3d(0,0,0) scale(1.05) rotate(0deg); }
        25%  { transform: translate3d(180px,-100px,0) scale(0.96) rotate(-4deg); }
        50%  { transform: translate3d(240px,140px,0) scale(1.18) rotate(-7deg); }
        75%  { transform: translate3d(70px,230px,0) scale(1.02) rotate(-3deg); }
        100% { transform: translate3d(0,0,0) scale(1.05) rotate(0deg); }
      }
    `;
    document.head.appendChild(s);
  }, []);

  const blob = (extra) => ({
    position:'absolute', borderRadius:'50%',
    filter:'blur(140px)', mixBlendMode: dark ? 'screen' : 'multiply',
    pointerEvents:'none', willChange:'transform', opacity: 0.85 * intensity,
    ...extra,
  });
  return (
    <div style={{position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0}}>
      <div style={blob({ width:'62vw', height:'62vw', top:'-18%', left:'-12%',
        background:'radial-gradient(circle at center, #c9a05e 0%, #75592f 55%, transparent 75%)',
        animation:'uniAuroraA 38s ease-in-out infinite',
      })}/>
      <div style={blob({ width:'72vw', height:'72vw', top:'8%', right:'-18%',
        background:'radial-gradient(circle at center, #a8884f 0%, #5d4321 55%, transparent 75%)',
        animation:'uniAuroraB 46s ease-in-out infinite',
      })}/>
      <div style={blob({ width:'46vw', height:'46vw', bottom:'-12%', left:'28%',
        background:'radial-gradient(circle at center, #e8d8b3 0%, #9b7d3f 55%, transparent 75%)',
        animation:'uniAuroraC 34s ease-in-out infinite', opacity: 0.55 * intensity,
      })}/>
      <div style={blob({ width:'54vw', height:'54vw', top:'22%', left:'36%',
        background:'radial-gradient(circle at center, #2a221a 0%, #14110d 55%, transparent 75%)',
        animation:'uniAuroraD 42s ease-in-out infinite', mixBlendMode:'normal', opacity: dark ? 0.4 : 0.1,
      })}/>
    </div>
  );
}

// ----- 2. ConstellationField ---------------------------------------
// Stars float gently. When cursor is within `linkRadius`, a gold
// line is drawn from cursor to nearest stars.
function ConstellationField({ count = 60, linkRadius = 220, color = 'rgba(201,160,94,', baseAlpha = 0.5 }) {
  const ref = React.useRef(null);
  const [size, setSize] = React.useState({ w: 2560, h: 1600 });
  const cursorRef = React.useRef({ x: -9999, y: -9999, active: false });
  const animRef = React.useRef(0);

  // generate stars once (deterministic pseudo-random for ssr-safe)
  const stars = React.useMemo(() => Array.from({ length: count }).map((_, i) => ({
    seed: i,
    fx: ((i * 9301 + 49297) % 233280) / 233280, // 0-1
    fy: ((i * 49297 + 9301) % 233281) / 233281,
    vx: (((i * 7) % 5) - 2) * 0.18,
    vy: (((i * 11) % 5) - 2) * 0.18,
    r: 0.8 + (i % 3) * 0.5,
    alpha: 0.3 + (i % 4) * 0.18,
    twinkleSpeed: 0.4 + ((i * 53) % 100) / 100,
  })), [count]);

  // sync mouse
  React.useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const on = (e) => {
      const rect = el.getBoundingClientRect();
      const sx = size.w / rect.width;
      const sy = size.h / rect.height;
      cursorRef.current = { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy, active: true };
    };
    const off = () => { cursorRef.current.active = false; };
    el.addEventListener('mousemove', on);
    el.addEventListener('mouseleave', off);
    return () => { el.removeEventListener('mousemove', on); el.removeEventListener('mouseleave', off); };
  }, [size]);

  // animation loop driving canvas
  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width = size.w;
    canvas.height = size.h;
    const ctx = canvas.getContext('2d');
    const start = performance.now();

    const tick = (now) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, size.w, size.h);

      // compute star positions
      const positions = stars.map((s) => {
        const x = ((s.fx * size.w + s.vx * t * 30) % size.w + size.w) % size.w;
        const y = ((s.fy * size.h + s.vy * t * 30) % size.h + size.h) % size.h;
        const tw = 0.5 + 0.5 * Math.sin(t * s.twinkleSpeed * 1.6 + s.seed);
        return { x, y, r: s.r, a: s.alpha * (0.6 + 0.4 * tw) };
      });

      // ambient links (between close pairs)
      ctx.lineWidth = 1;
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const dx = positions[i].x - positions[j].x;
          const dy = positions[i].y - positions[j].y;
          const d  = Math.hypot(dx, dy);
          if (d > 280) continue;
          const a = (1 - d / 280) * 0.18 * baseAlpha;
          ctx.strokeStyle = color + a.toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(positions[i].x, positions[i].y); ctx.lineTo(positions[j].x, positions[j].y); ctx.stroke();
        }
      }

      // cursor links — brighter, longer
      const c = cursorRef.current;
      if (c.active) {
        ctx.lineWidth = 1.4;
        for (const p of positions) {
          const d = Math.hypot(p.x - c.x, p.y - c.y);
          if (d > linkRadius) continue;
          const a = (1 - d / linkRadius) * 0.7;
          ctx.strokeStyle = color + a.toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(p.x, p.y); ctx.stroke();
        }
        // central glow at cursor
        const grd = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 80);
        grd.addColorStop(0, color + '0.35)');
        grd.addColorStop(1, color + '0)');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(c.x, c.y, 80, 0, Math.PI * 2); ctx.fill();
      }

      // stars
      for (const p of positions) {
        ctx.fillStyle = color + p.a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }

      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [stars, size, color, baseAlpha, linkRadius]);

  return (
    <canvas ref={ref} style={{position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:1}}/>
  );
}

// ----- 3. FilmGrain ------------------------------------------------
function FilmGrain({ opacity = 0.08, blend = 'overlay' }) {
  const url = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.05' numOctaves='2' stitchTiles='stitch' seed='3'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>";
  return <div style={{position:'absolute', inset:0, opacity, mixBlendMode: blend, backgroundImage:`url("${url}")`, pointerEvents:'none', zIndex:2}}/>;
}

// ----- 4. CustomCursor ---------------------------------------------
// Gold ring + dot. Listens for `cursor-magnet` class on hovered
// elements via mouseenter/leave bubbling.
function CustomCursor() {
  const ringRef = React.useRef(null);
  const dotRef  = React.useRef(null);
  const stateRef = React.useRef({ x: 0, y: 0, tx: 0, ty: 0, active: false, hot: false });

  React.useEffect(() => {
    const ring = ringRef.current, dot = dotRef.current;
    if (!ring || !dot) return;

    const onMove = (e) => {
      stateRef.current.x = e.clientX;
      stateRef.current.y = e.clientY;
      stateRef.current.active = true;
      // detect "hot" hover (magnet target)
      const el = e.target;
      stateRef.current.hot = !!(el && el.closest && el.closest('[data-magnet], button, a, [role="button"]'));
    };
    const onLeave = () => { stateRef.current.active = false; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);

    let raf;
    const tick = () => {
      const s = stateRef.current;
      // smooth follow
      s.tx += (s.x - s.tx) * 0.22;
      s.ty += (s.y - s.ty) * 0.22;
      const r = s.hot ? 36 : 18;
      ring.style.transform = `translate3d(${s.tx - r}px, ${s.ty - r}px, 0)`;
      ring.style.width  = r * 2 + 'px';
      ring.style.height = r * 2 + 'px';
      ring.style.opacity = s.active ? (s.hot ? 1 : 0.5) : 0;
      ring.style.borderColor = s.hot ? 'rgba(201,160,94,0.95)' : 'rgba(201,160,94,0.5)';

      dot.style.transform = `translate3d(${s.x - 3}px, ${s.y - 3}px, 0)`;
      dot.style.opacity = s.active ? 1 : 0;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseleave', onLeave); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div ref={ringRef} style={{
        position:'fixed', top:0, left:0,
        width:36, height:36, borderRadius:'50%',
        border:'1.5px solid rgba(201,160,94,0.5)',
        pointerEvents:'none', zIndex:10000,
        transition:'width 240ms cubic-bezier(0.22,1,0.36,1), height 240ms cubic-bezier(0.22,1,0.36,1), border-color 200ms, opacity 200ms',
        willChange:'transform',
        mixBlendMode:'difference',
      }}/>
      <div ref={dotRef} style={{
        position:'fixed', top:0, left:0,
        width:6, height:6, borderRadius:'50%', background:'#c9a05e',
        pointerEvents:'none', zIndex:10001,
        willChange:'transform',
        boxShadow:'0 0 8px rgba(201,160,94,0.7)',
      }}/>
    </>
  );
}

// ----- 5. Magnetic --------------------------------------------------
// Wrapper that pulls its child toward the cursor when within `radius`.
function Magnetic({ children, radius = 140, strength = 0.22, tilt = 0, className, style, onClick, ...rest }) {
  const ref = React.useRef(null);
  const [tr, setTr] = React.useState({ x: 0, y: 0, rx: 0, ry: 0, hot: false });

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    const target = { x: 0, y: 0, rx: 0, ry: 0 };
    let cur = { x: 0, y: 0, rx: 0, ry: 0 };
    let hot = false;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top  + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const d = Math.hypot(dx, dy);
      if (d < radius) {
        target.x = dx * strength;
        target.y = dy * strength;
        if (tilt) {
          target.ry = (dx / r.width)  * tilt;
          target.rx = -(dy / r.height) * tilt;
        }
        hot = true;
      } else {
        target.x = 0; target.y = 0; target.rx = 0; target.ry = 0; hot = false;
      }
    };
    const onLeave = () => { target.x = 0; target.y = 0; target.rx = 0; target.ry = 0; hot = false; };

    document.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);

    const tick = () => {
      cur.x += (target.x - cur.x) * 0.18;
      cur.y += (target.y - cur.y) * 0.18;
      cur.rx += (target.rx - cur.rx) * 0.18;
      cur.ry += (target.ry - cur.ry) * 0.18;
      setTr({ x: cur.x, y: cur.y, rx: cur.rx, ry: cur.ry, hot });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { document.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); cancelAnimationFrame(raf); };
  }, [radius, strength, tilt]);

  const transform = tilt
    ? `translate3d(${tr.x}px, ${tr.y}px, 0) rotateX(${tr.rx}deg) rotateY(${tr.ry}deg)`
    : `translate3d(${tr.x}px, ${tr.y}px, 0)`;

  return (
    <div ref={ref} data-magnet
      className={className}
      style={{ ...style, transform, transformStyle:'preserve-3d', willChange:'transform' }}
      onClick={onClick}
      {...rest}>
      {typeof children === 'function' ? children(tr) : children}
    </div>
  );
}

// ----- 6. ShimmerSweep ---------------------------------------------
// CSS-only — a gold gradient sweeps across the wrapped child on hover.
function ShimmerSweep({ children, speed = 900, color = 'rgba(232,216,179,0.32)', radius = 100 }) {
  React.useEffect(() => {
    if (document.getElementById('uni-shimmer-keys')) return;
    const s = document.createElement('style');
    s.id = 'uni-shimmer-keys';
    s.textContent = `
      .uni-shimmer { position:relative; overflow:hidden; isolation:isolate; }
      .uni-shimmer::after {
        content: ''; position:absolute; top:0; bottom:0;
        left:-60%; width:60%;
        background: linear-gradient(90deg, transparent 0%, var(--uni-shimmer-color) 50%, transparent 100%);
        transform: skewX(-18deg); pointer-events:none; opacity:0; z-index:5;
      }
      .uni-shimmer:hover::after {
        animation: uniShimmer var(--uni-shimmer-speed, 900ms) cubic-bezier(0.22,1,0.36,1) forwards;
      }
      @keyframes uniShimmer { 0% { left:-60%; opacity:0; } 30% { opacity:1; } 100% { left:120%; opacity:0; } }
    `;
    document.head.appendChild(s);
  }, []);
  return (
    <div className="uni-shimmer" style={{ '--uni-shimmer-speed': speed + 'ms', '--uni-shimmer-color': color, borderRadius: radius }}>
      {children}
    </div>
  );
}

// ----- 7. CounterFlip ----------------------------------------------
// Number that animates from 0 → value. If `flip` then each digit rolls
// like a mechanical counter; otherwise smooth ease.
function CounterFlip({ value, duration = 1.4, delay = 0, suffix = '', prefix = '', flip = false }) {
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    let raf, start = null;
    const step = (ts) => {
      if (start === null) start = ts;
      const t = Math.min((ts - start - delay*1000) / (duration*1000), 1);
      if (t < 0) { raf = requestAnimationFrame(step); return; }
      const e = 1 - Math.pow(1 - t, 4); // outQuart
      setN(Math.round(value * e));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, delay]);

  if (!flip) return <>{prefix}{n.toLocaleString()}{suffix}</>;

  // Flip mode — split-flap-y for each digit
  const digits = String(n).padStart(String(value).length, '0').split('');
  return (
    <span style={{display:'inline-flex', gap:2}}>
      {prefix && <span>{prefix}</span>}
      {digits.map((d, i) => (
        <span key={i} style={{
          display:'inline-block', width:'0.6em', textAlign:'center',
          color:'inherit', position:'relative',
          transform:'translateZ(0)',
        }}>{d}</span>
      ))}
      {suffix && <span>{suffix}</span>}
    </span>
  );
}

// ----- 8. Donut ----------------------------------------------------
// Animated SVG ring — `value`/`total` controls fill, color customizable.
function Donut({ value, total = 100, size = 100, stroke = 6, color = 'var(--gold-deep)', track = 'var(--line)', label, sub }) {
  const [progress, setProgress] = React.useState(0);
  const target = total > 0 ? value / total : 0;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  React.useEffect(() => {
    let raf, start = null;
    const step = (ts) => {
      if (start === null) start = ts;
      const t = Math.min((ts - start) / 1100, 1);
      const e = 1 - Math.pow(1 - t, 4);
      setProgress(target * e);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return (
    <div style={{position:'relative', width:size, height:size, display:'flex', alignItems:'center', justifyContent:'center'}}>
      <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - progress)}/>
      </svg>
      <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, fontFamily:'Cormorant Garamond, serif'}}>
        <div style={{fontSize: size * 0.32, fontWeight:400, lineHeight:1, color}}>{Math.round(progress * 100)}%</div>
        {label && <div className="mono" style={{fontSize:9, letterSpacing:'0.2em', color:'var(--slate)', textTransform:'uppercase'}}>{label}</div>}
      </div>
    </div>
  );
}

// ----- 9. ConfettiCannon -------------------------------------------
// Spawns ~36 gold bits at (x,y), each flies in a random direction with gravity.
function ConfettiCannon({ trigger, originX = '50%', originY = '40%' }) {
  const [bits, setBits] = React.useState([]);
  React.useEffect(() => {
    if (!trigger) return;
    // generate
    const count = 56;
    const arr = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6 - 0.3;
      const speed = 380 + Math.random() * 320;
      const palette = ['#c9a05e', '#e8d8b3', '#a8884f', '#f5f1e8', '#0a0a0a'];
      return {
        id: i,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed * (0.6 + Math.random() * 0.4),
        rot: (Math.random() - 0.5) * 720,
        col: palette[i % palette.length],
        size: 6 + Math.random() * 6,
        delay: Math.random() * 80,
        shape: i % 3,
      };
    });
    setBits(arr);
    const t = setTimeout(() => setBits([]), 2200);
    return () => clearTimeout(t);
  }, [trigger]);

  // inject keyframes once
  React.useEffect(() => {
    if (document.getElementById('uni-confetti-keys')) return;
    const s = document.createElement('style');
    s.id = 'uni-confetti-keys';
    s.textContent = `
      @keyframes uniConfettiFly {
        0%   { transform: translate(0,0) rotate(0deg); opacity: 0; }
        14%  { opacity: 1; }
        100% { transform: translate(var(--dx), calc(var(--dy) + 380px)) rotate(var(--rot)); opacity: 0; }
      }
    `;
    document.head.appendChild(s);
  }, []);

  if (!bits.length) return null;
  return (
    <div style={{position:'absolute', inset:0, pointerEvents:'none', zIndex:50, overflow:'hidden'}}>
      {bits.map(b => (
        <span key={b.id} style={{
          position:'absolute', top: originY, left: originX,
          width: b.size, height: b.size,
          background: b.col,
          borderRadius: b.shape === 0 ? '50%' : b.shape === 1 ? '2px' : 0,
          transformOrigin: 'center',
          animation: `uniConfettiFly 1.6s cubic-bezier(0.18,0.7,0.4,1) ${b.delay}ms forwards`,
          '--dx': b.dx + 'px',
          '--dy': b.dy + 'px',
          '--rot': b.rot + 'deg',
          willChange: 'transform, opacity',
        }}/>
      ))}
    </div>
  );
}

// ----- 10. useRipple -----------------------------------------------
// Hook: returns [ripples, fire(x,y)] — render `ripples` as positioned
// expanding gold rings.
function useRipple(maxAge = 1200) {
  const [ripples, setRipples] = React.useState([]);
  const fire = React.useCallback((x, y, opts = {}) => {
    const id = Date.now() + Math.random();
    setRipples(rs => [...rs, { id, x, y, color: opts.color || 'rgba(201,160,94,0.7)' }]);
    setTimeout(() => setRipples(rs => rs.filter(r => r.id !== id)), maxAge);
  }, [maxAge]);
  return [ripples, fire];
}

function RippleLayer({ ripples }) {
  React.useEffect(() => {
    if (document.getElementById('uni-ripple-keys')) return;
    const s = document.createElement('style');
    s.id = 'uni-ripple-keys';
    s.textContent = `
      @keyframes uniRipple { 0% { transform: translate(-50%,-50%) scale(0); opacity: 0.85; } 100% { transform: translate(-50%,-50%) scale(8); opacity: 0; } }
    `;
    document.head.appendChild(s);
  }, []);
  return (
    <div style={{position:'absolute', inset:0, pointerEvents:'none', zIndex:30}}>
      {ripples.map(r => (
        <span key={r.id} style={{
          position:'absolute', left: r.x, top: r.y,
          width: 80, height: 80, borderRadius:'50%',
          border: `1.5px solid ${r.color}`,
          animation: 'uniRipple 1.2s cubic-bezier(0.18,0.7,0.4,1) forwards',
          willChange: 'transform, opacity',
        }}/>
      ))}
    </div>
  );
}

// ----- TowerParticles --------------------------------------------------
// 3D wireframe of building towers as gold particles, slowly rotating around
// the world Y-axis. Continuous yaw → naturally seamless loop. Pure canvas
// 2D, perspective-projected. Echoes the project's 10 towers as ambient
// architectural depth.
function TowerParticles({ opacity = 0.85, count = 6, color = 'rgba(40,32,18' }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const W = 2560, H = 1600;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });

    // build N tower point clouds, arranged on a ring around origin
    const towers = [];
    for (let n = 0; n < count; n++) {
      const angle = (n / count) * Math.PI * 2;
      const ringRadius = 920;
      const cx = Math.cos(angle) * ringRadius;
      const cz = Math.sin(angle) * ringRadius;
      const baseW = 78 + (n % 3) * 18;
      const baseH = 460 + (n % 4) * 80;
      const taperStart = baseH * 0.72;
      const taperW = baseW * 0.55;
      const pts = [];

      // 4 vertical edges (corners), straight section
      const corners = [[-baseW/2, -baseW/2], [baseW/2, -baseW/2], [baseW/2, baseW/2], [-baseW/2, baseW/2]];
      const vSamples = 28;
      for (let i = 0; i <= vSamples; i++) {
        const y = (i / vSamples) * taperStart - baseH/2;
        for (const [ox, oz] of corners) pts.push([cx + ox, y, cz + oz]);
      }
      // tapered top — 4 edges narrowing inward
      const tSamples = 14;
      for (let i = 0; i <= tSamples; i++) {
        const f = i / tSamples;
        const y = taperStart + f * (baseH - taperStart) - baseH/2;
        const w = baseW - (baseW - taperW) * f;
        for (const [ox, oz] of [[-w/2, -w/2], [w/2, -w/2], [w/2, w/2], [-w/2, w/2]]) {
          pts.push([cx + ox, y, cz + oz]);
        }
      }
      // floor bands every 50 units in the straight section
      for (let yy = -baseH/2 + 50; yy < taperStart - baseH/2; yy += 50) {
        const hSamples = 9;
        for (let i = 0; i <= hSamples; i++) {
          const f = i / hSamples;
          const u = -baseW/2 + baseW * f;
          pts.push([cx + u, yy, cz - baseW/2]);
          pts.push([cx + u, yy, cz + baseW/2]);
          pts.push([cx - baseW/2, yy, cz + u]);
          pts.push([cx + baseW/2, yy, cz + u]);
        }
      }
      // antenna spire
      for (let i = 0; i < 7; i++) pts.push([cx, baseH/2 + i * 9, cz]);
      towers.push(pts);
    }

    // Forward-perspective view: world +Y is screen-up, ring of towers rotates
    // around vertical axis so they swing past camera. Continuous yaw → seamless loop.
    const fov = 920;
    const camDist = 1700;
    const cx2d = W/2;
    const cy2d = H/2 + 80;

    let raf = 0, mounted = true;
    const start = performance.now();
    const tick = () => {
      if (!mounted) return;
      const elapsed = (performance.now() - start) / 1000;
      const yaw = elapsed * 0.024;     // 2π / 0.024 ≈ 261s seamless loop
      const cosY = Math.cos(yaw), sinY = Math.sin(yaw);

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = color + ',1)';

      for (let ti = 0; ti < towers.length; ti++) {
        const pts = towers[ti];
        for (let pi = 0; pi < pts.length; pi++) {
          const px = pts[pi][0], py = pts[pi][1], pz = pts[pi][2];
          const rx = px * cosY - pz * sinY;
          const rz = px * sinY + pz * cosY;
          const viewZ = rz + camDist;
          if (viewZ < 120) continue;
          const sx = cx2d + rx * fov / viewZ;
          const sy = cy2d + py * fov / viewZ;
          if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) continue;
          const depth = Math.max(0, Math.min(1, (3000 - viewZ) / 2700));
          const size = 1.6 + depth * 2.4;
          ctx.globalAlpha = 0.30 + depth * 0.45;
          ctx.fillRect(sx - size/2, sy - size/2, size, size);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { mounted = false; cancelAnimationFrame(raf); };
  }, [count, color]);

  return <canvas ref={ref} style={{
    position:'absolute', inset:0, width:'100%', height:'100%',
    pointerEvents:'none',
    opacity,
    zIndex: 1,
    mixBlendMode:'normal',
  }}/>;
}

// ----- LightRays --------------------------------------------------------
// Three layered diagonal light bands ("god rays") with screen blend, brightening
// the cream backdrop diagonally — like sun through a tall window. Static; the
// drifting Aurora underneath provides the motion so this layer just adds glow.
function LightRays({ opacity = 0.42 }) {
  return (
    <div style={{position:'absolute', inset:0, pointerEvents:'none', zIndex:1, overflow:'hidden', mixBlendMode:'screen', opacity}}>
      <div style={{
        position:'absolute', top:'-40%', left:'-10%', width:'140%', height:'180%',
        background: 'linear-gradient(108deg, transparent 36%, rgba(255,238,200,0.65) 48%, rgba(255,248,220,0.35) 50%, rgba(255,238,200,0.65) 52%, transparent 64%)',
        filter: 'blur(60px)',
      }}/>
      <div style={{
        position:'absolute', top:'-30%', left:'10%', width:'120%', height:'160%',
        background: 'linear-gradient(72deg, transparent 32%, rgba(255,232,180,0.40) 50%, transparent 68%)',
        filter: 'blur(80px)',
      }}/>
      <div style={{
        position:'absolute', top:'-20%', left:'30%', width:'80%', height:'140%',
        background: 'linear-gradient(115deg, transparent 45%, rgba(255,250,220,0.45) 50%, transparent 55%)',
        filter: 'blur(20px)',
      }}/>
    </div>
  );
}

// ----- SparkleField ----------------------------------------------------
// Slow-drifting champagne sparkles. Each rises gently, twinkles in/out via
// |sin| pulse, and at peak brightness flashes a 4-point cross spark — the
// luxury sparkle look without being kitschy.
function SparkleField({ count = 28, opacity = 0.75 }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width = 2560; canvas.height = 1600;
    const ctx = canvas.getContext('2d');
    const sparkles = Array.from({length: count}, (_, i) => {
      const seed = i + 1;
      return {
        baseX: (seed * 91) % 2560,
        baseY: (seed * 137) % 1600,
        vy: -10 - ((seed * 7) % 16),
        vx: ((seed * 13) % 9) - 4,
        size: 0.8 + ((seed * 5) % 16) * 0.14,
        twinkleFreq: 0.4 + ((seed * 3) % 10) * 0.13,
        phase: (seed * 1.7) % 6.283,
      };
    });
    let raf = 0, mounted = true;
    const start = performance.now();
    const tick = () => {
      if (!mounted) return;
      const t = (performance.now() - start) / 1000;
      ctx.clearRect(0, 0, 2560, 1600);
      for (const s of sparkles) {
        const x = ((s.baseX + s.vx * t) % 2560 + 2560) % 2560;
        const y = ((s.baseY + s.vy * t) % 1700 + 1700) % 1700 - 50;
        if (y < -10 || y > 1610) continue;
        const twinkle = Math.abs(Math.sin(t * s.twinkleFreq + s.phase));
        const alpha = 0.30 + twinkle * 0.65;
        const r = s.size;
        // soft halo
        ctx.fillStyle = 'rgba(255,240,200,' + (alpha * 0.30) + ')';
        ctx.beginPath(); ctx.arc(x, y, r * 3.2, 0, 6.283); ctx.fill();
        // bright core
        ctx.fillStyle = 'rgba(255,250,225,' + alpha + ')';
        ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
        // 4-point cross spark on bright peaks
        if (twinkle > 0.72) {
          const len = r * 6 * twinkle;
          ctx.globalAlpha = alpha * 0.75;
          ctx.fillRect(x - len/2, y - 0.5, len, 1);
          ctx.fillRect(x - 0.5, y - len/2, 1, len);
          ctx.globalAlpha = 1;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { mounted = false; cancelAnimationFrame(raf); };
  }, [count]);
  return <canvas ref={ref} style={{
    position:'absolute', inset:0, width:'100%', height:'100%',
    pointerEvents:'none', opacity, zIndex: 2,
    mixBlendMode:'screen',
  }}/>;
}

// ----- HouseSketch ------------------------------------------------------
// A residential-tower elevation drawn stroke-by-stroke like a pencil sketch,
// then held, faded, and looped. Reads as a continuous "video of a house being
// drawn" running quietly in the background. Ink-on-paper aesthetic — dark
// warm-charcoal strokes on cream substrate.
function HouseSketch({ opacity = 0.55, period = 18, stroke = 'rgba(60,40,16' }) {
  const t = useLoop();
  const localT = ((t % period) + period) / period - 1;     // 0..1
  // Re-wrap if useLoop returns 0..big number
  const phase = ((t % period) / period);

  // Building elevation — a tall residential tower centered on the canvas
  // viewBox is 2560 × 1600, so center is x=1280, ground at y≈1290.
  const paths = [
    // ground / horizon
    { d: 'M 240 1280 L 2320 1280',                                   win: [0.02, 0.09], len: 2080 },
    // foundation slab
    { d: 'M 540 1280 L 540 1240 L 2020 1240 L 2020 1280',           win: [0.09, 0.18], len: 1560 },
    // left tower wall (going up)
    { d: 'M 740 1240 L 740 360',                                     win: [0.18, 0.26], len: 880 },
    // right tower wall
    { d: 'M 1820 1240 L 1820 360',                                   win: [0.26, 0.34], len: 880 },
    // roofline
    { d: 'M 740 360 L 1820 360',                                     win: [0.34, 0.40], len: 1080 },
    // crown / cornice
    { d: 'M 780 360 L 780 320 L 1780 320 L 1780 360',                win: [0.40, 0.45], len: 1080 },
    // 10 floor bands
    ...Array.from({length:10}).map((_,i) => ({
      d:   `M 740 ${1240 - 88*(i+1)} L 1820 ${1240 - 88*(i+1)}`,
      win: [0.45 + i*0.022, 0.490 + i*0.022],
      len: 1080,
    })),
    // 4 internal vertical columns (window mullions / structural rhythm)
    { d: 'M 956 1240 L 956 360',    win: [0.68, 0.71], len: 880 },
    { d: 'M 1172 1240 L 1172 360',  win: [0.71, 0.74], len: 880 },
    { d: 'M 1388 1240 L 1388 360',  win: [0.74, 0.77], len: 880 },
    { d: 'M 1604 1240 L 1604 360',  win: [0.77, 0.80], len: 880 },
    // antenna spire on top
    { d: 'M 1280 320 L 1280 200',   win: [0.80, 0.84], len: 120 },
    // small ground texture ticks left
    { d: 'M 360 1296 L 380 1304 M 420 1296 L 440 1304 M 480 1296 L 500 1304', win: [0.84, 0.88], len: 80 },
    // small ground texture ticks right
    { d: 'M 2080 1296 L 2100 1304 M 2140 1296 L 2160 1304 M 2200 1296 L 2220 1304', win: [0.84, 0.88], len: 80 },
  ];

  // outro fade — starts at 0.92, full transparent by 1.0
  const fadeOut = Math.max(0, Math.min(1, (phase - 0.92) / 0.08));
  const baseOp = 1 - fadeOut;

  return (
    <svg viewBox="0 0 2560 1600" preserveAspectRatio="xMidYMid meet"
      style={{
        position:'absolute', inset:0, width:'100%', height:'100%',
        pointerEvents:'none', opacity, zIndex: 0,
        mixBlendMode: 'multiply',
      }}>
      {paths.map((p, i) => {
        const [start, end] = p.win;
        const drawP = Math.max(0, Math.min(1, (phase - start) / (end - start)));
        return (
          <path key={i} d={p.d}
            stroke={`${stroke},0.78)`}
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={p.len}
            strokeDashoffset={p.len * (1 - drawP)}
            opacity={baseOp}
          />
        );
      })}
    </svg>
  );
}

window.Aurora = Aurora;
window.ConstellationField = ConstellationField;
window.FilmGrain = FilmGrain;
window.CustomCursor = CustomCursor;
window.Magnetic = Magnetic;
window.ShimmerSweep = ShimmerSweep;
window.CounterFlip = CounterFlip;
window.Donut = Donut;
window.ConfettiCannon = ConfettiCannon;
window.useRipple = useRipple;
window.RippleLayer = RippleLayer;
window.TowerParticles = TowerParticles;
window.LightRays = LightRays;
window.SparkleField = SparkleField;
window.HouseSketch = HouseSketch;

// ----- BurstLayer + useBurst -------------------------------------------
// Magnetic-CTA-inspired chunky particle burst on tap. Each burst spawns 11
// gold/ivory particles (mix of filled rectangles + hollow circles) that fly
// outward from the tap point with eased trajectories, rotate, and fade.
// Tablet-grade tap reward — far richer than the existing ring ripple alone.
const BURST_COLORS = ['#c9a05e', '#ead7a8', '#fff8e0', '#b08a3f', '#0a0a0a'];

function ensureBurstKeys() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('uni-burst-keys')) return;
  const s = document.createElement('style');
  s.id = 'uni-burst-keys';
  s.textContent = `
    @keyframes uniBurstFly {
      0%   { transform: translate(-50%, -50%) rotate(0deg) scale(1); opacity: 1; }
      18%  { opacity: 1; }
      100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) rotate(var(--rot)) scale(0.28); opacity: 0; }
    }
    @keyframes uniTapWave {
      0%   { transform: translate(-50%, -50%) scale(0.2); opacity: 0.55; }
      40%  { opacity: 0.45; }
      100% { transform: translate(-50%, -50%) scale(3.4); opacity: 0; }
    }
  `;
  document.head.appendChild(s);
}

function useBurst(maxAge = 900) {
  const [bursts, setBursts] = React.useState([]);
  const fire = React.useCallback((x, y, opts = {}) => {
    ensureBurstKeys();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const count = opts.count || 11;
    const palette = opts.palette || BURST_COLORS;
    // pre-randomize particle parameters — sized for tablet design-space (2560×1600)
    const particles = Array.from({length: count}, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
      const dist  = 200 + Math.random() * 220;
      const size  = 16 + Math.random() * 18;
      const hollow = Math.random() < 0.28;
      return {
        dx:  Math.cos(angle) * dist,
        dy:  Math.sin(angle) * dist,
        rot: (Math.random() * 720) - 360,
        size,
        hollow,
        color: palette[Math.floor(Math.random() * palette.length)],
      };
    });
    setBursts(prev => [...prev, { id, x, y, particles }]);
    window.setTimeout(() => {
      setBursts(prev => prev.filter(b => b.id !== id));
    }, maxAge);
  }, [maxAge]);
  return [bursts, fire];
}

function BurstLayer({ bursts, zIndex = 4 }) {
  return (
    <div style={{position:'absolute', inset:0, pointerEvents:'none', zIndex}}>
      {bursts.map(b => (
        <React.Fragment key={b.id}>
          {/* outward expanding wave ring — sized for tablet design space */}
          <span style={{
            position:'absolute', left:b.x, top:b.y,
            width: 60, height: 60, borderRadius:'50%',
            border: '3px solid rgba(201,160,94,0.8)',
            boxShadow: '0 0 50px rgba(232,216,179,0.45)',
            animation: 'uniTapWave 850ms cubic-bezier(0.18,0.7,0.4,1) forwards',
          }}/>
          {/* 11 chunky particles */}
          {b.particles.map((p, i) => (
            <span key={i} style={{
              position:'absolute', left:b.x, top:b.y,
              width: p.size,
              height: p.hollow ? p.size : p.size * 0.7,
              background: p.hollow ? 'transparent' : p.color,
              border: p.hollow ? `2px solid ${p.color}` : 'none',
              borderRadius: p.hollow ? '50%' : '2px',
              transform: 'translate(-50%, -50%)',
              '--dx':  `${p.dx}px`,
              '--dy':  `${p.dy}px`,
              '--rot': `${p.rot}deg`,
              animation: 'uniBurstFly 880ms cubic-bezier(0.2,0.7,0.3,1) forwards',
              willChange: 'transform, opacity',
            }}/>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}

window.useBurst = useBurst;
window.BurstLayer = BurstLayer;
