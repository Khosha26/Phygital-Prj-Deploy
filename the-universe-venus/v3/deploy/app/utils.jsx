// Shared hooks, helpers, icons + Universe brand marks

// requestAnimationFrame loop, returns elapsed seconds
function useLoop() {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    let raf, start = null;
    const step = (ts) => {
      if (start === null) start = ts;
      setT((ts - start) / 1000);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);
  return t;
}

const ease = {
  linear:    t => t,
  outQuad:   t => t*(2-t),
  inOutQuad: t => t<0.5 ? 2*t*t : -1+(4-2*t)*t,
  outCubic:  t => 1 - Math.pow(1-t,3),
  inOutCubic:t => t<0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2,
  outQuart:  t => 1 - Math.pow(1-t,4),
  outQuint:  t => 1 - Math.pow(1-t,5),
  inOutQuint:t => t<0.5 ? 16*t*t*t*t*t : 1-Math.pow(-2*t+2,5)/2,
  outBack:   (t, s=1.70158) => 1 + (s+1)*Math.pow(t-1,3) + s*Math.pow(t-1,2),
  outExpo:   t => t === 1 ? 1 : 1 - Math.pow(2, -10*t),
  inOutExpo: t => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20*t-10)/2 : (2-Math.pow(2,-20*t+10))/2,
};

const clamp = (v, mn=0, mx=1) => Math.max(mn, Math.min(mx, v));
const lerp  = (a, b, t) => a + (b-a)*t;
const mod   = (a, b) => ((a%b)+b)%b;

// hash router
function useRoute() {
  const [route, setRoute] = React.useState(() => parseHash());
  React.useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return [route, navigate];
}
function parseHash() {
  const h = location.hash.replace(/^#\/?/, '') || 'splash';
  const [path, ...rest] = h.split('/');
  return { path, params: rest };
}
function navigate(path) {
  location.hash = '/' + path;
}

function useRouteTransition(route) {
  const [phase, setPhase] = React.useState('in');
  const [displayed, setDisplayed] = React.useState(route);
  const prevRef = React.useRef(route);

  React.useEffect(() => {
    if (route.path === prevRef.current.path && JSON.stringify(route.params) === JSON.stringify(prevRef.current.params)) return;
    setPhase('out');
    const t = setTimeout(() => {
      setDisplayed(route);
      prevRef.current = route;
      setPhase('in');
    }, 220);  // matches the .transition-out 220ms fade
    return () => clearTimeout(t);
  }, [route]);

  return { route: displayed, phase };
}

// Auto-fit the 2560x1600 design canvas into ANY viewport / device aspect ratio.
// Full-bleed scale-to-contain: fills the limiting axis exactly (16:10 device =
// perfect fill, zero bars) and centres on the other axis with a clean surround.
// Never crops content. Re-measures on resize + orientation change.
function useFitScale(W=2560, Hbase=1600, Hmax=1920) {
  const [state, setState] = React.useState({ scale: 1, tight: true, W, H: Hbase, dens: 0 });
  React.useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      // ADAPTIVE design height. On viewports TALLER than the base 16:10 ratio
      // (e.g. iPad Pro 4:3) the canvas grows in height so screen content fills
      // the device instead of leaving top/bottom letterbox dead-space. Capped at
      // Hmax (4:3) and floored at Hbase so the primary 16:10 tablet (Tab S7) is
      // mathematically UNCHANGED (H stays 1600, scale stays width-bound).
      const isTV = (vw >= 3000 || vh >= 1900);   // 65" 4K-class kiosk
      const aspectH = Math.round(W * vh / vw);   // canvas height that fills width exactly
      // ADAPTIVE design height. Taller-than-16:10 viewports (iPad 4:3) grow H so
      // content fills the device. On a 4K-class screen that is WIDER than 16:10
      // (a 16:9 65" TV), instead of leaving ~192px black side bars ("the cut"),
      // fill the WIDTH — the canvas takes the screen's own aspect (floored so we
      // never over-squash). This removes the side bars AND raises the fit scale
      // (1.35→1.5 on 16:9) so ALL text/UI reads bigger from across a showroom.
      // Tab S7 (2560×1600) & iPad stay isTV=false → math byte-identical to before.
      const H = (isTV && aspectH < Hbase)
        ? Math.max(1350, aspectH)
        : Math.max(Hbase, Math.min(Hmax, aspectH));
      const scale = Math.min(vw / W, vh / H);
      // TYPE-DENSITY boost. `dens` (0→1.25) lets screens scale type/spacing UP on
      // large canvases WITHOUT touching the fit math above. On 4K-class kiosks add
      // a fixed +0.4 on top of the height-based base so headings read from afar.
      const densBase = clamp((H - 1600) / 320, 0, 1);
      const dens = Math.min(1.25, densBase + (isTV ? 0.4 : 0));
      setState({ scale, tight: true, W, H, dens });
      // expose to screens that anchor to the live canvas height
      if (typeof document !== 'undefined') {
        document.documentElement.style.setProperty('--canvas-h', H + 'px');
        document.documentElement.style.setProperty('--canvas-w', W + 'px');
        document.documentElement.style.setProperty('--dens', dens);
      }
      if (typeof window !== 'undefined') window.UNIVERSE_CANVAS = { W, H, dens };
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    // some tablets fire neither reliably on rotation — poll-guard via VisualViewport
    if (window.visualViewport) window.visualViewport.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
      if (window.visualViewport) window.visualViewport.removeEventListener('resize', measure);
    };
  }, [W, Hbase, Hmax]);
  return state;
}

// ===== Icons =====
const Icons = {
  story: (props) => (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 8 L10 40 C10 41 11 42 12 42 L36 42 C37 42 38 41 38 40 L38 8 L24 14 L10 8 Z"/>
      <path d="M16 18 L32 18 M16 24 L32 24 M16 30 L26 30"/>
    </svg>
  ),
  location: (props) => (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M24 6 C16 6 11 12 11 19 C11 28 24 42 24 42 C24 42 37 28 37 19 C37 12 32 6 24 6 Z"/>
      <circle cx="24" cy="19" r="4.5"/>
    </svg>
  ),
  masterplan: (props) => (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 42 L10 18 L18 12 L18 42 Z"/>
      <path d="M22 42 L22 14 L32 8 L32 42 Z"/>
      <path d="M36 42 L36 22 L42 18 L42 42 Z"/>
      <path d="M6 42 L44 42"/>
      <path d="M13 22 L15 22 M13 28 L15 28 M13 34 L15 34"/>
      <path d="M25 18 L29 18 M25 26 L29 26 M25 34 L29 34"/>
    </svg>
  ),
  residences: (props) => (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="8" y="8" width="32" height="32" rx="1"/>
      <path d="M8 22 L24 22 L24 8"/>
      <path d="M24 22 L40 22 M24 22 L24 40 M30 22 L30 30 L40 30"/>
      <path d="M14 14 L18 14"/>
      <path d="M30 14 L36 14"/>
    </svg>
  ),
  amenities: (props) => (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 28 C10 22 14 18 24 18 C34 18 38 22 38 28"/>
      <path d="M6 28 L42 28 L42 32 L6 32 Z"/>
      <path d="M14 18 L14 12 M24 18 L24 8 M34 18 L34 12"/>
      <path d="M12 36 L36 36"/>
    </svg>
  ),
  gallery: (props) => (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="8" y="12" width="32" height="24" rx="2"/>
      <circle cx="17" cy="20" r="2.4"/>
      <path d="M40 28 L31 22 L21 30 L13 26 L8 30"/>
    </svg>
  ),
  tools: (props) => (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="8" y="10" width="32" height="28" rx="2"/>
      <path d="M14 18 L20 18 M14 24 L26 24 M14 30 L22 30"/>
      <circle cx="33" cy="22" r="3"/>
      <path d="M33 27 L33 32 M30 30 L36 30"/>
    </svg>
  ),
  booking: (props) => (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 6 L12 42 L20 36 L28 42 L36 36 L36 6 Z"/>
      <path d="M18 16 L30 16"/>
      <path d="M18 22 L30 22"/>
      <path d="M18 28 L26 28"/>
    </svg>
  ),
  arrow: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12 L19 12 M13 6 L19 12 L13 18"/></svg>
  ),
  back: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 12 L5 12 M11 6 L5 12 L11 18"/></svg>
  ),
  close: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 6 L18 18 M18 6 L6 18"/></svg>
  ),
  plus:  (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...props}><path d="M12 5 L12 19 M5 12 L19 12"/></svg>,
  minus: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...props}><path d="M5 12 L19 12"/></svg>,
  check: (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12 L10 17 L19 7"/></svg>,
  filter:(props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6 L21 6 M6 12 L18 12 M9 18 L15 18"/></svg>,
};

// === The Universe — official client monogram (real image, transparent bg) ===
// `size` is the pixel height of the rendered logo.
// `progress` (0-1) reveals the monogram top→bottom with a soft glow rise.
// `color` is ignored — the image carries the brand gold.
function UniverseMonogram({ size = 200, progress = 1, color }) {
  const p = clamp(progress);
  return (
    <div style={{
      position:'relative',
      width: size * (240/265),     // preserve native 240×265 aspect
      height: size,
      display:'inline-block',
    }} aria-label="The Universe">
      <img
        src="assets/brand/universe-monogram-transparent.png"
        width={size * (240/265)}
        height={size}
        draggable="false"
        style={{
          display:'block',
          // top→down reveal during draw-in
          clipPath: `inset(0 0 ${(1 - p) * 100}% 0)`,
          // soft glow that intensifies as it draws
          filter: `drop-shadow(0 0 ${size*0.06 * p}px rgba(201,160,94,${0.45*p}))`,
          transition: 'clip-path 240ms ease-out, filter 240ms ease-out',
        }}
      />
    </div>
  );
}

// === The Universe — full primary lockup (monogram + wordmark) ===
// Used on splash where we want the canonical client logo, not the
// monogram + custom-typeset wordmark side-by-side.
function UniverseLogoFull({ size = 600, progress = 1 }) {
  const p = clamp(progress);
  return (
    <img
      src="assets/brand/universe-logo-transparent.png"
      width={size}
      height={size * (787/1400)}
      draggable="false"
      aria-label="the UNIVERSE"
      style={{
        display:'block',
        opacity: p,
        filter: `drop-shadow(0 0 ${size*0.04 * p}px rgba(201,160,94,${0.55*p}))`,
        transition: 'opacity 320ms ease-out, filter 320ms ease-out',
      }}
    />
  );
}
window.UniverseLogoFull = UniverseLogoFull;

// "the UNIVERSE" wordmark — italic 'the' + wide-tracked uppercase serif
function UniverseWordmark({ size = 56, color = 'currentColor', tight = false }) {
  return (
    <div style={{display:'flex', alignItems:'baseline', gap: size*0.16, color, lineHeight:1, whiteSpace:'nowrap'}}>
      <span className="serif" style={{fontSize:size*0.62, fontStyle:'italic', fontWeight:300, letterSpacing:'-0.01em', opacity:0.92}}>the</span>
      <span className="display" style={{fontSize:size, fontWeight:400, letterSpacing: tight ? '0.18em' : '0.32em', textTransform:'uppercase'}}>UNIVERSE</span>
    </div>
  );
}

// Venus parent-brand wordmark (red sans-serif, used as developer credit)
function VenusWordmark({ size = 28, color = 'var(--venus-red)' }) {
  return (
    <span style={{
      fontFamily:'Inter, system-ui, sans-serif',
      fontWeight: 800,
      fontSize: size,
      letterSpacing: '0.06em',
      color,
      lineHeight: 1,
    }}>VENUS</span>
  );
}

// "developed by VENUS" small chip
function VenusCredit({ light = false, size = 13 }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:10}}>
      <span className="mono" style={{fontSize:size, letterSpacing:'0.28em', color: light ? 'rgba(245,241,232,0.55)' : 'var(--slate)', textTransform:'uppercase'}}>Developed by</span>
      <VenusWordmark size={size + 6}/>
    </div>
  );
}

window.useLoop = useLoop;
window.ease = ease;
window.clamp = clamp;
window.lerp = lerp;
window.mod = mod;
window.useRoute = useRoute;
window.navigate = navigate;
window.useRouteTransition = useRouteTransition;
window.useFitScale = useFitScale;
window.Icons = Icons;
window.UniverseMonogram = UniverseMonogram;
window.UniverseWordmark = UniverseWordmark;
window.VenusWordmark = VenusWordmark;
window.VenusCredit = VenusCredit;
