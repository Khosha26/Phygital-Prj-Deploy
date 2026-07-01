// Home — split-stage cosmos.
//
//   · LEFT — editorial title block. Big "Center of everything." headline,
//     descriptive paragraph, key stats inline, ambient cosmic backdrop.
//   · RIGHT — 8 module buttons orbit a smaller centre circle. The centre
//     circle holds the U monogram (no text), with the 10-floor apartment
//     sketch animating behind it.
//   · Tap a button → its icon JUMPS UP, FLIPS in the air (rotateY card-flip),
//     then FLIES into the centre circle and lands with a flash. After landing
//     the page transitions to that screen.
//   · Cosmos: warm-gold dust particles drifting on a light substrate.

const HOME_KEYS_ID = 'uni-home-split-keys';
function ensureHomeKeys() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(HOME_KEYS_ID)) return;
  const s = document.createElement('style');
  s.id = HOME_KEYS_ID;
  s.textContent = `
    /* The icon's flight: anticipation jump → flip → glide to centre.
       Per-instance --dx/--dy are set on click for the centre vector. Uses
       rotateZ (always visible) instead of rotateY (disappears edge-on),
       and ends at scale 0.55 so the landing read clearly. */
    @keyframes uniIconJumpFlipFly {
      0%   { transform: translate(0,0) translateY(0)    scale(1)    rotate(0deg);
             filter: drop-shadow(0 0 0 transparent); opacity: 1; }
      25%  { transform: translate(0,0) translateY(-60px) scale(1.25) rotate(90deg);
             filter: drop-shadow(0 18px 30px rgba(232,215,168,0.6))
                     drop-shadow(0 0 22px rgba(255,238,180,0.75)); opacity: 1; }
      70%  { transform: translate(calc(var(--dx,0) * 0.7), calc(var(--dy,0) * 0.7 - 30px)) scale(1.30) rotate(360deg);
             filter: drop-shadow(0 0 42px rgba(255,238,180,1.0))
                     drop-shadow(0 0 22px rgba(255,238,180,0.9)); opacity: 1; }
      100% { transform: translate(var(--dx,0), var(--dy,0)) scale(0.55) rotate(540deg);
             filter: drop-shadow(0 0 20px rgba(255,238,180,0.6)); opacity: 0; }
    }
    /* gold halo disk that carries the icon during flight — keeps the
       icon legible against any background */
    @keyframes uniIconHalo {
      0%   { transform: scale(0); opacity: 0; }
      18%  { transform: scale(1); opacity: 0.95; }
      85%  { transform: scale(1); opacity: 0.85; }
      100% { transform: scale(0.6); opacity: 0; }
    }
    @keyframes uniSatBlast {
      0%   { box-shadow: 0 18px 36px rgba(50,32,12,0.20),
                          0 8px 16px rgba(50,32,12,0.12),
                          inset 0 1px 0 rgba(255,246,224,0.16);
             transform: scale(1); }
      28%  { box-shadow: 0 0 0 14px rgba(216,181,115,0.18),
                          0 0 80px 18px rgba(232,216,179,0.45),
                          inset 0 0 50px rgba(232,216,179,0.18);
             transform: scale(1.06); }
      62%  { box-shadow: 0 0 0 22px rgba(216,181,115,0),
                          0 0 110px 26px rgba(232,216,179,0.18);
             transform: scale(0.96); }
      100% { transform: scale(1); }
    }
    @keyframes uniCenterFlash {
      0%   { background: radial-gradient(circle, rgba(255,238,180,0) 0%, rgba(232,215,168,0) 60%);
             transform: scale(1); }
      28%  { background: radial-gradient(circle, rgba(255,238,180,0.95) 0%, rgba(232,215,168,0.55) 38%, rgba(232,215,168,0) 70%);
             transform: scale(1.08); }
      100% { background: radial-gradient(circle, rgba(255,238,180,0) 0%, rgba(232,215,168,0) 60%);
             transform: scale(1.22); }
    }
    @keyframes uniCenterRing {
      0%   { transform: scale(0.55); opacity: 0.95; border-width: 3px; }
      100% { transform: scale(2.6); opacity: 0; border-width: 1px; }
    }
    /* Settling wave — fired when arriving from /explore. A ring expands from
       the centre out past the screen edges; subtle, not heavy. 3 instances
       are rendered with staggered delays for depth. */
    @keyframes uniSettleWave {
      0%   { transform: translate(-50%, -50%) scale(0.40);
             opacity: 0.85; border-width: 3px;
             box-shadow: 0 0 22px rgba(255,238,180,0.45); }
      18%  { opacity: 0.78; }
      100% { transform: translate(-50%, -50%) scale(20);
             opacity: 0; border-width: 0.4px;
             box-shadow: 0 0 6px rgba(255,238,180,0); }
    }
    /* Cinematic text reveal — blur-to-clear + soft lift. */
    @keyframes uniCinematicIn {
      0%   { opacity: 0; transform: translateY(14px); filter: blur(10px); }
      100% { opacity: 1; transform: translateY(0);    filter: blur(0); }
    }
    /* Mini-CRM panel — slides in from the left edge. */
    @keyframes uniCrmPanelIn {
      0%   { opacity: 0; transform: translateX(-46px); }
      100% { opacity: 1; transform: translateX(0); }
    }
    /* ── Building backdrop motion ──────────────────────────────
       Reveal: the twin-tower drawing "inks in" from the ground up on load.
       Float: a slow horizontal parallax drift (stays within the side margins
       so the building is never cropped top/bottom). Sweep: a golden light
       band passes across the towers. Glow: a faint contrast breathe. */
    @keyframes uniBldgReveal { from { opacity:0; clip-path: inset(100% 0 0 0); } to { opacity:1; clip-path: inset(0 0 0 0); } }
    @keyframes uniBldgFloat  { 0%{ transform: translateX(0); } 50%{ transform: translateX(-22px); } 100%{ transform: translateX(0); } }
    @keyframes uniBldgSweep  { 0%{ transform: translateX(-140%); opacity:0; } 12%{ opacity:1; } 88%{ opacity:1; } 100%{ transform: translateX(360%); opacity:0; } }
    @keyframes uniBldgGlow   { 0%,100%{ opacity:0.52; } 50%{ opacity:0.62; } }
    /* Constrain the 100x100 SVG glyphs inside their orbital button */
    .uni-sat-icon svg { width: 100% !important; height: 100% !important; display: block; }
    /* Mini-CRM scroll areas — slim gold scrollbar */
    .uni-crm-scroll::-webkit-scrollbar { width: 7px; }
    .uni-crm-scroll::-webkit-scrollbar-thumb { background: rgba(176,138,63,0.30); border-radius: 7px; }
    .uni-crm-scroll::-webkit-scrollbar-track { background: transparent; }
    .uni-crm-hscroll::-webkit-scrollbar { height: 7px; }
    .uni-crm-hscroll::-webkit-scrollbar-thumb { background: rgba(176,138,63,0.30); border-radius: 7px; }
    .uni-crm-hscroll::-webkit-scrollbar-track { background: transparent; }
  `;
  document.head.appendChild(s);
}

// ============================================================================
// Geometry — split layout
// ============================================================================
// LEFT block sits in the left half of the canvas; RIGHT cluster sits at the
// right.  Sized so it reads strongly when the 2560×1600 canvas is scaled
// down to a typical tablet — tiles, monogram, and label type are all
// generous.
const RIGHT_CX  = 1880;
const RIGHT_CY  = 830;
const SAT_R     = 460;
const TILE_SIZE = 172;
const CIRCLE_R  = 200;     // centre circle holds the U monogram
// Mini-CRM panel — occupies the LEFT 60% of the 2560-wide canvas; the centre
// circle (right 40%) stays visible as the "centre button" while it's open.
const CRM_PANEL_W = 1536;  // 60% of 2560
const CRM_PAD     = 56;
// Pixel delta between explore-CX (1280) and home-RIGHT_CX (1880) — used to
// glide the cluster from the explore-centre position to the home-right
// position when arriving via the from-explore handoff.
const HOME_SLIDE_X = 600;

function Home() {
  ensureHomeKeys();
  const t = useLoop();
  const [hovered, setHovered]     = React.useState(null);
  const [jumping, setJumping]     = React.useState(null);
  const [exiting, setExiting]     = React.useState(false);
  const [centerLand, setCenterLand] = React.useState(0);
  const [ripples, fireRipple]     = useRipple(1200);
  const [bursts, fireBurst]       = useBurst(900);
  const modules = PROJECT.modules;

  // ── Canvas-height density. 0 on the primary 16:10 tablet (H=1600, Tab S7 —
  //    mathematically UNCHANGED) → 1 on iPad Pro 4:3 (H=1920). Everything below
  //    keys off `dens` so the cluster, type and the new bottom fact-bar grow to
  //    fill the taller 4:3 canvas instead of leaving a dead gap underneath.
  const H    = (typeof window !== 'undefined' && window.UNIVERSE_CANVAS && window.UNIVERSE_CANVAS.H) || 1600;
  const dens = clamp((H - 1600) / 320);
  // Drop the cluster centre down so it tracks the auto-centred left text block
  // (which sits at 50% of H) instead of floating high. Grows the orbit radius,
  // tile size and centre circle so the whole assembly reads bigger on iPad.
  const RCY = Math.round(RIGHT_CY + dens * 122);   // 830 → ~952
  const SR  = Math.round(SAT_R    + dens * 46);    // 460 → ~506
  const TS  = Math.round(TILE_SIZE + dens * 22);   // 172 → ~194
  const circleScale = 1 + dens * 0.12;             // centre circle / monogram
  const innerR = CIRCLE_R * circleScale + 18;
  const outerR = SR - TS / 2 - 12;
  const labelFS = Math.round(27 + dens * 4);
  const hotR = Math.round(CIRCLE_R * circleScale);

  // ── Hidden Sales-Desk mini-CRM. Triple-tapping the centre circle (3 taps
  //    within ~600ms) toggles it open. The centre circle has no single-tap
  //    action of its own, so a lone tap is harmlessly absorbed by the counter.
  const [crmOpen, setCrmOpen] = React.useState(false);
  const tapRef = React.useRef({ n: 0, timer: null });
  const handleCenterTap = () => {
    const s = tapRef.current;
    s.n += 1;
    if (s.timer) clearTimeout(s.timer);
    if (s.n >= 3) {
      s.n = 0;
      setCrmOpen(o => !o);
      return;
    }
    s.timer = setTimeout(() => { s.n = 0; }, 600);
  };

  // Three entry modes:
  //   fromExplore  — arrived seamlessly from /explore. Orbital + circle are
  //                   already in their final positions. A settling wave rolls
  //                   out from the centre, then the left-block text reveals
  //                   cinematically (blur-to-clear stagger).
  //   firstVisit   — full cinematic from-zero entrance (legacy first-load).
  //   return       — back from a sub-screen. Fast-forward.
  const fromExplore = React.useRef(
    typeof sessionStorage !== 'undefined' && sessionStorage.getItem('uni-from-explore') === '1'
  ).current;
  const isFirstVisit = React.useRef(
    typeof sessionStorage === 'undefined' || !sessionStorage.getItem('uni-home-seen')
  ).current;
  React.useEffect(() => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('uni-home-seen', '1');
      sessionStorage.removeItem('uni-from-explore');
    }
  }, []);

  // Cluster slide: when fromExplore, paint at translateX(-HOME_SLIDE_X) on the
  // first frame, then on the SECOND frame flip `slid` to true so the CSS
  // transition kicks in. Double-rAF guarantees the browser commits the start
  // position to the GPU before applying the end position.
  const [slid, setSlid] = React.useState(!fromExplore);
  // The settling wave (the "ripple") only mounts AFTER the slide finishes.
  // Otherwise the rings sit visibly at the centre while the cluster is still
  // sliding — which reads as a flicker right before they expand outward.
  const [waveReady, setWaveReady] = React.useState(false);
  React.useEffect(() => {
    if (!fromExplore) return;
    const r1 = requestAnimationFrame(() => {
      const r2 = requestAnimationFrame(() => setSlid(true));
      // store r2 cleanup via outer closure
      return () => cancelAnimationFrame(r2);
    });
    // Slide is 820ms. Mount the wave a hair after to guarantee the cluster
    // has fully settled before the rings begin expanding.
    const wt = setTimeout(() => setWaveReady(true), 860);
    return () => { cancelAnimationFrame(r1); clearTimeout(wt); };
  }, []);

  // Phase clocks — branch on entry mode.
  let titleP, paraP, statsP, circleP, lineP, buildingP, orbitalStart, eT;
  if (fromExplore) {
    // Orbital + circle + building are already settled (matches how /explore
    // left them). Only the LEFT text block needs to fade in — and we delay
    // it slightly so the user feels the settling wave first.
    eT           = t + 2.6;             // pretend the entry-time has elapsed
    circleP      = 1;                   // circle fully drawn
    lineP        = 1;                   // underline fully drawn
    buildingP    = 1;                   // apartment fully revealed
    orbitalStart = -100;                // tiles all show at e=1 from t=0
    // Cinematic text — first wave plays t=0..0.9, then text from t=0.7
    // Slide takes ~820ms; defer text reveal so it lands AFTER the cluster
    // has finished gliding into place.
    titleP = clamp((t - 0.95) / 1.05);
    paraP  = clamp((t - 1.35) / 0.95);
    statsP = clamp((t - 1.80) / 0.95);
  } else {
    const tOffset = isFirstVisit ? 0 : 1.6;
    eT = t + tOffset;
    titleP       = clamp((eT - 0.2) / 0.9);
    paraP        = clamp((eT - 0.9) / 0.7);
    statsP       = clamp((eT - 1.4) / 0.8);
    circleP      = clamp((eT - 0.8) / 1.0);
    orbitalStart = 1.2;
    buildingP    = clamp((eT - 2.0) / 1.0);
    lineP        = clamp((eT - 1.6) / 0.7);
  }

  // Click handler — set --dx/--dy then fire the keyframe.
  const handleSatelliteClick = (ev, m, i, x, y) => {
    if (jumping) return;
    const root = document.querySelector('.tablet-bezel').getBoundingClientRect();
    const scale = root.width / 2560;
    const tapX = (ev.clientX - root.left) / scale;
    const tapY = (ev.clientY - root.top)  / scale;
    fireRipple(tapX, tapY);
    fireBurst(x, y, { count: 11 });

    const iconEl = ev.currentTarget.querySelector('.uni-sat-icon');
    if (iconEl) {
      iconEl.style.setProperty('--dx', (RIGHT_CX - x) + 'px');
      iconEl.style.setProperty('--dy', (RCY - y) + 'px');
    }

    setJumping(m.id);
    // Landing flash near the end of the icon flight (~440ms in)
    setTimeout(() => setCenterLand(c => c + 1), 440);
    setTimeout(() => setExiting(true), 520);
    setTimeout(() => navigate(m.id === 'masterplan' ? 'masterplan-explorer' : m.id), 640);
  };

  return (
    <div style={{position:'absolute', inset:0, background:'transparent', color:'var(--ink)', overflow:'hidden',
                 transition:'opacity 320ms ease, transform 320ms ease',
                 opacity: exiting ? 0 : 1,
                 transform: exiting ? 'scale(0.985)' : 'scale(1)'}}>

      {/* The twin-tower drawing is painted at the VIEWPORT level (see index.html
          HOME_BG) so it's edge-to-edge with no cut at any aspect. Here we only
          add a soft left cream scrim so the "Center of everything." headline
          stays crisp over the lighter parts of the drawing. */}
      <div style={{position:'absolute', inset:0, zIndex:0, pointerEvents:'none',
        background:'linear-gradient(90deg, rgba(249,244,234,0.82) 0%, rgba(249,244,234,0.42) 18%, rgba(249,244,234,0.10) 34%, transparent 50%)'}}/>

      {/* === COSMIC DUST BACKDROP === */}
      <CosmicDust count={120} opacity={0.7}/>

      {/* warm radial overlay favours the right (where the cluster lives) */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none', zIndex:1,
        background:'radial-gradient(ellipse at 73% 52%, rgba(255,250,235,0.45) 0%, rgba(255,250,235,0.10) 36%, transparent 78%)',
      }}/>

      <RippleLayer ripples={ripples}/>
      <BurstLayer bursts={bursts} zIndex={4}/>
      <FilmGrain opacity={0.04} blend="multiply"/>

      {/* === SETTLING WAVE — three concentric rings emanate from the centre
          AFTER the cluster glides into place. We gate mounting on
          `waveReady` (set ~860ms after mount) so the rings don't sit
          visibly at the centre during the slide — they begin expanding
          the instant they appear, no held-start-state flicker. */}
      {fromExplore && waveReady && (
        <div style={{position:'absolute', inset:0, zIndex:3, pointerEvents:'none'}}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              position:'absolute',
              left: RIGHT_CX, top: RCY,
              width: 220, height: 220,
              borderRadius:'50%',
              border:'2px solid rgba(232,215,168,0.78)',
              animation: `uniSettleWave 1900ms ${i*220}ms cubic-bezier(0.22,1,0.36,1) forwards`,
              willChange: 'transform, opacity',
            }}/>
          ))}
        </div>
      )}

      {/* === TOP BAR (hidden while the mini-CRM is open) === */}
      {!crmOpen && <div style={{position:'absolute', top:46, left:76, right:76, display:'flex', justifyContent:'space-between', alignItems:'center', opacity:titleP, zIndex:5}}>
        <div role="button" tabIndex={0} aria-label="Go to intro"
          onClick={()=>navigate('splash')}
          onKeyDown={ev=>{ if(ev.key==='Enter'||ev.key===' '){ ev.preventDefault(); navigate('splash'); } }}
          onMouseEnter={ev=>{ ev.currentTarget.style.opacity='0.6'; ev.currentTarget.style.transform='scale(1.03)'; }}
          onMouseLeave={ev=>{ ev.currentTarget.style.opacity='1'; ev.currentTarget.style.transform='scale(1)'; }}
          style={{display:'flex', alignItems:'center', gap:23, cursor:'pointer', transition:'opacity 200ms ease, transform 200ms ease', transformOrigin:'left center'}}>
          <UniverseMonogram size={67} progress={1} color="var(--gold)"/>
          <div style={{display:'flex', flexDirection:'column', gap:5}}>
            <UniverseWordmark size={27} color="var(--ink)" tight/>
            <VenusCredit size={11.5}/>
          </div>
        </div>
        <div style={{display:'flex', gap:19, alignItems:'center'}}>
          <div className="mono" style={{fontSize:14, letterSpacing:'0.24em', color:'var(--slate)'}}>RERA · {PROJECT.rera.split('/').slice(-2).join('/')}</div>
          <div style={{width:1, height:19, background:'var(--line)'}}/>
          <div className="mono" style={{fontSize:14, letterSpacing:'0.24em', color:'var(--slate)'}}>{new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}).toUpperCase()}</div>
          <div style={{width:1, height:19, background:'var(--line)'}}/>
          <LiveDot t={t}/>
        </div>
      </div>}

      {/* === LEFT BLOCK — editorial title + paragraph + stats (hidden while CRM open) === */}
      {!crmOpen && <LeftTitleBlock t={t} eT={eT} titleP={titleP} paraP={paraP} statsP={statsP} dens={dens}/>}

      {/* === BOTTOM FACT BAR — fills the extra 4:3 canvas height with a refined
          row of real project facts. Fades in with `dens` so the primary 16:10
          tablet (dens 0) is untouched; full presence on iPad Pro. === */}
      {!crmOpen && <BottomMeta eT={eT} dens={dens}/>}

      {/* === CLUSTER WRAPPER ============================================
          When arriving from /explore, the cluster (spokes + centre circle
          + 8 pieces) starts SHIFTED LEFT by 600px — the exact delta from
          home's RIGHT_CX (1880) back to explore's CX (1280) — so it sits
          in the same screen position the explore page just left it. After
          mount we flip a state and CSS-transition translateX(0) over
          820ms, gliding the cluster across to its home location. */}
      <div style={{
        position:'absolute', inset:0, zIndex:2,
        transform: (fromExplore && !slid) ? `translateX(-${HOME_SLIDE_X}px)` : 'translateX(0)',
        transition: 'transform 820ms cubic-bezier(0.65, 0, 0.30, 1)',
        willChange: 'transform',
        pointerEvents: 'none',  // re-enabled per child below
      }}>
      {/* === CONSTELLATION SPOKES (hidden while the mini-CRM is open) === */}
      {!crmOpen && <svg viewBox={`0 0 2560 ${H}`} preserveAspectRatio="none"
        style={{position:'absolute', inset:0, width:'100%', height:'100%', zIndex:2, pointerEvents:'none'}}>
        {modules.map((m, i) => {
          const angle = (i * Math.PI/4) - Math.PI/2;
          const innerX = RIGHT_CX + innerR * Math.cos(angle);
          const innerY = RCY + innerR * Math.sin(angle);
          const outerX = RIGHT_CX + outerR * Math.cos(angle);
          const outerY = RCY + outerR * Math.sin(angle);
          const focused = hovered === m.id || jumping === m.id;
          const baseOp = lineP * (focused ? 0.85 : 0.30);
          const phase = ((t * (focused ? 0.9 : 0.30)) % 1);
          const ex = innerX + (outerX - innerX) * phase;
          const ey = innerY + (outerY - innerY) * phase;
          return (
            <g key={m.id}>
              <line
                x1={innerX} y1={innerY} x2={outerX} y2={outerY}
                stroke="var(--gold-deep)" strokeWidth={focused ? 1.4 : 0.8}
                strokeDasharray={focused ? "4 6" : "2 7"}
                opacity={baseOp}
                style={{transition:'opacity 320ms, stroke-width 320ms'}}/>
              {focused && (
                <circle cx={ex} cy={ey} r="3.2" fill="var(--gold-soft)"
                  style={{filter:'drop-shadow(0 0 8px rgba(255,238,180,0.85))'}}/>
              )}
            </g>
          );
        })}
      </svg>}

      {/* === RIGHT CLUSTER — centre circle (logo) always shown; it IS the
          "centre button" that remains when the orbital tiles disappear === */}
      <CentreCircle t={t} circleP={circleP} buildingP={buildingP} centerLand={centerLand}/>

      {/* HIDDEN CRM TRIGGER — invisible circular hotspot over the centre
          circle. Triple-tap toggles the Sales-Desk console. No visible
          affordance; single taps do nothing (absorbed by the tap counter). */}
      <div
        onClick={handleCenterTap}
        style={{
          position:'absolute',
          left: RIGHT_CX - CIRCLE_R, top: RIGHT_CY - CIRCLE_R,
          width: CIRCLE_R * 2, height: CIRCLE_R * 2,
          borderRadius:'50%',
          zIndex: 6, pointerEvents: jumping ? 'none' : 'auto',
          cursor:'default', background:'transparent',
        }}/>

      {!crmOpen && modules.map((m, i) => {
        const angle = (i * Math.PI/4) - Math.PI/2;
        const x = RIGHT_CX + SAT_R * Math.cos(angle);
        const y = RIGHT_CY + SAT_R * Math.sin(angle);
        const start = orbitalStart + i * 0.10;
        const local = clamp((eT - start) / 0.7);
        const e = ease.outBack(local);
        const isHovered = hovered === m.id;
        const isJumping = jumping === m.id;
        const isOtherJumping = jumping && jumping !== m.id;

        const dxIn = (RIGHT_CX - x) * (1 - e) * 0.42;
        const dyIn = (RIGHT_CY - y) * (1 - e) * 0.42;

        return (
          <div key={m.id}
            style={{
              position:'absolute',
              left: x - TILE_SIZE/2,
              top:  y - TILE_SIZE/2,
              width: TILE_SIZE, height: TILE_SIZE,
              opacity: jumping ? (isJumping ? 1 : 0.18) : e,
              transform: jumping ? 'translate(0,0) scale(1)' : `translate(${dxIn}px, ${dyIn}px) scale(${0.4 + 0.6*e})`,
              filter: jumping && isOtherJumping ? 'blur(2px)' : 'none',
              transition: 'opacity 360ms ease, transform 360ms ease, filter 320ms ease',
              pointerEvents: jumping ? 'none' : 'auto',
              zIndex: 5,
              perspective: 900,
            }}>
            <SatelliteButton
              m={m} i={i} t={t}
              isHovered={isHovered} isJumping={isJumping}
              onMouseEnter={()=>setHovered(m.id)}
              onMouseLeave={()=>setHovered(null)}
              onClick={(ev)=>handleSatelliteClick(ev, m, i, x, y)}
            />
            {/* compact label */}
            <div style={{
              position:'absolute', top: TILE_SIZE + 15, left: '50%',
              transform: 'translateX(-50%)', textAlign:'center',
              minWidth: 210, pointerEvents:'none',
            }}>
              <div className="serif" style={{
                fontSize: 27, fontWeight: 400, letterSpacing:'-0.005em',
                color: (isHovered || isJumping) ? 'var(--gold-deep)' : 'var(--ink)',
                whiteSpace: 'nowrap',
                transition:'color 280ms',
                textShadow: isHovered || isJumping ? '0 0 14px rgba(255,238,180,0.6)' : 'none',
              }}>{m.label}</div>
            </div>
          </div>
        );
      })}
      </div>{/* === END CLUSTER WRAPPER === */}

      {/* === HIDDEN SALES-DESK CONSOLE (mini-CRM) === */}
      {crmOpen && <SalesDesk onClose={() => setCrmOpen(false)}/>}
    </div>
  );
}

// ============================================================================
// LEFT block — editorial headline + paragraph + stat grid + scan hint
// ============================================================================
function LeftTitleBlock({ t, eT, titleP, paraP, statsP }) {
  const cursorOn = (Math.sin(t * 9) > 0) && titleP > 0.95 && titleP < 1;
  // Personalised welcome — when a walk-in is selected in the mini-CRM the home
  // greets them by name, so the tablet handed to the customer feels curated.
  const cust = window.UNI_SESSION && window.UNI_SESSION.getCustomer();

  return (
    <div style={{
      position:'absolute',
      left: 116, top: '50%',
      transform: 'translateY(-50%)',
      width: 1239,
      zIndex: 5,
    }}>
      {/* eyebrow — greets the selected walk-in, else the standard locator line */}
      <div className="mono" style={{
        fontSize: 19, letterSpacing:'0.42em', color:'var(--gold-deep)',
        opacity: titleP, transform:`translateY(${(1-titleP)*8}px)`,
      }}>
        {cust ? `WELCOME · ${cust.name.toUpperCase()}` : 'THE UNIVERSE · NEHRU NAGAR · AHMEDABAD'}
      </div>
      {cust && (
        <div className="serif" style={{
          fontSize: 27, fontStyle:'italic', color:'var(--graphite)', marginTop: 12,
          opacity: titleP, transform:`translateY(${(1-titleP)*8}px)`,
        }}>
          Your private viewing of The Universe begins here.
        </div>
      )}

      {/* headline — two lines, "everything" italic gold */}
      <h1 className="serif" style={{
        margin:'29px 0 0', fontSize: 223, fontWeight: 300, lineHeight: 0.92,
        letterSpacing:'-0.035em',
        filter: `drop-shadow(0 0 ${30 * titleP}px rgba(255,238,180,0.32))`,
      }}>
        <span style={{display:'block', opacity: titleP, transform:`translateY(${(1-titleP)*16}px)`}}>
          Center of
        </span>
        <span style={{
          display:'block',
          color:'var(--gold-deep)', fontStyle:'italic',
          opacity: clamp((titleP - 0.4) / 0.6),
          transform:`translateY(${(1 - clamp((titleP - 0.4) / 0.6))*22}px)`,
        }}>
          everything.
          {cursorOn && (
            <span style={{
              display:'inline-block', width:'0.06em', marginLeft:'0.06em',
              height:'0.85em', verticalAlign:'-0.06em',
              background:'var(--gold-soft)',
              boxShadow:'0 0 14px rgba(232,216,179,0.7)',
            }}/>
          )}
        </span>
      </h1>

      {/* underline */}
      <svg viewBox="0 0 600 8" width="357" height="7" style={{marginTop:23, opacity: paraP}}>
        <path d="M 4 4 L 596 4" stroke="var(--gold)" strokeWidth="1.2" fill="none"
          strokeDasharray="600" strokeDashoffset={600 * (1 - clamp((eT - 1.0) / 0.9))}/>
        <circle cx="300" cy="4" r="3" fill="var(--gold-soft)" opacity={clamp((eT - 1.6) / 0.4)}/>
      </svg>

      {/* paragraph */}
      <div style={{
        marginTop: 36, maxWidth: 924,
        fontSize: 29, lineHeight: 1.5, color:'var(--graphite)',
        opacity: paraP, transform:`translateY(${(1-paraP)*10}px)`,
      }}>
        7 acres in the gravitational pull of Ahmedabad, with everything that
        matters orbiting at walking distance: the schools, the hospitals,
        the highway, the airport, and the living rooms of friends you haven't
        met yet.
      </div>

      {/* stats strip — single airy horizontal row, footnote band */}
      <div style={{
        marginTop: 40,
        display:'flex', alignItems:'stretch', gap: 27,
        opacity: statsP, transform: `translateY(${(1-statsP)*8}px)`,
      }}>
        {[
          { k: 'TOTAL LAND', v: '7',   sub: 'acres' },
          { k: 'TOWERS',     v: '10',  sub: 'high-rise' },
          { k: 'PODIUM',     v: '4',   sub: 'acre garden' },
          { k: 'TYPOLOGY',   v: '4 BHK', sub: 'plus penthouse' },
        ].map((s, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <div style={{width:1, alignSelf:'stretch', background:'var(--line)', opacity:0.7}}/>
            )}
            <div style={{display:'flex', flexDirection:'column', gap:6.5, minWidth:0}}>
              <div className="mono" style={{fontSize:15, letterSpacing:'0.32em', color:'var(--slate)'}}>{s.k}</div>
              <div style={{display:'flex', alignItems:'baseline', gap:8.5}}>
                <div className="serif" style={{fontSize:27, fontWeight:400, letterSpacing:'-0.01em', color:'var(--ink)', lineHeight:1}}>{s.v}</div>
                <div className="serif" style={{fontSize:17, fontStyle:'italic', color:'var(--graphite)'}}>{s.sub}</div>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* scan-the-orbit hint */}
      <div style={{
        marginTop: 52, display:'flex', alignItems:'center', gap:19,
        opacity: clamp((eT - 2.4) / 0.7),
      }}>
        <div className="mono" style={{
          fontSize: 16, letterSpacing:'0.36em', color:'var(--gold-deep)',
        }}>EXPLORE THE ORBIT</div>
        <svg width="48" height="12" viewBox="0 0 46 12">
          <line x1="0" y1="6" x2="40" y2="6" stroke="var(--gold-deep)" strokeWidth="1.4"
            strokeDasharray="3 3"/>
          <path d="M 36 1 L 45 6 L 36 11" stroke="var(--gold-deep)" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

// ============================================================================
// CentreCircle — logo monogram inside the cluster, with apartment sketch
// ============================================================================
function CentreCircle({ t, circleP, buildingP, centerLand }) {
  const D = CIRCLE_R * 2;
  return (
    <div style={{
      position:'absolute',
      left: RIGHT_CX - CIRCLE_R - 28, top: RIGHT_CY - CIRCLE_R - 28,
      width: D + 56, height: D + 56,
      zIndex: 5, pointerEvents:'none',
    }}>
      {/* halo */}
      <div style={{
        position:'absolute', inset:0, borderRadius:'50%',
        background:'radial-gradient(circle at center, rgba(232,215,168,0.20) 0%, rgba(255,250,235,0.08) 40%, transparent 72%)',
        opacity: circleP, transform: `scale(${0.85 + circleP*0.15})`,
        transition: 'opacity 540ms ease-out, transform 540ms ease-out',
      }}/>

      {/* concentric rings */}
      <svg viewBox={`0 0 ${D + 56} ${D + 56}`} style={{position:'absolute', inset:0}}>
        <circle cx={D/2 + 28} cy={D/2 + 28} r={CIRCLE_R} fill="rgba(255,250,235,0.55)"
          stroke="var(--gold)" strokeWidth="1.4"
          strokeDasharray={Math.PI * D} strokeDashoffset={Math.PI * D * (1 - circleP)}
          style={{filter:'drop-shadow(0 8px 28px rgba(176,138,63,0.20))'}}/>
        <circle cx={D/2 + 28} cy={D/2 + 28} r={CIRCLE_R + 14} fill="none"
          stroke="var(--gold-deep)" strokeOpacity="0.32" strokeWidth="0.7"
          strokeDasharray={Math.PI * (D + 28)} strokeDashoffset={Math.PI * (D + 28) * (1 - clamp(circleP*1.25 - 0.1))}/>
        {/* slowly-rotating dotted outer ring */}
        <circle cx={D/2 + 28} cy={D/2 + 28} r={CIRCLE_R + 26} fill="none"
          stroke="var(--gold-deep)" strokeOpacity={0.24 * circleP} strokeWidth="0.6"
          strokeDasharray="2 5"
          transform={`rotate(${(t * 6) % 360} ${D/2 + 28} ${D/2 + 28})`}/>
        {/* 8 tick marks at the satellite compass positions */}
        {Array.from({length:8}).map((_, i) => {
          const a = (i * Math.PI/4) - Math.PI/2;
          const r1 = CIRCLE_R + 4, r2 = CIRCLE_R + 12;
          const x1 = D/2 + 28 + r1*Math.cos(a), y1 = D/2 + 28 + r1*Math.sin(a);
          const x2 = D/2 + 28 + r2*Math.cos(a), y2 = D/2 + 28 + r2*Math.sin(a);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="var(--gold)" strokeWidth="1.2" opacity={0.85 * circleP}/>;
        })}
      </svg>

      {/* apartment sketch — inside circle, behind monogram */}
      <div style={{
        position:'absolute', left: 28 + 12, top: 28 + 6,
        width: D - 24, height: D - 12,
        opacity: 0.22 * buildingP,
        zIndex: 1, pointerEvents:'none',
      }}>
        <Apartment10 t={t} period={22}/>
      </div>

      {/* LANDING FLASH + ring expansion when an icon arrives */}
      {centerLand > 0 && (
        <React.Fragment key={'land-'+centerLand}>
          <div style={{
            position:'absolute', left: 28, top: 28, width: D, height: D, borderRadius:'50%',
            animation:'uniCenterFlash 700ms cubic-bezier(0.22,1,0.36,1) both',
            pointerEvents:'none', zIndex:6,
          }}/>
          {[0,1,2].map(i => (
            <div key={i} style={{
              position:'absolute', left: 28 - 6, top: 28 - 6,
              width: D + 12, height: D + 12, borderRadius:'50%',
              border:'2px solid var(--gold-soft)',
              animation: `uniCenterRing 900ms ${i*120}ms cubic-bezier(0.22,1,0.36,1) both`,
              pointerEvents:'none', zIndex:6,
            }}/>
          ))}
        </React.Fragment>
      )}

      {/* The U monogram — focal mark */}
      <div style={{
        position:'absolute', inset: 28,
        display:'flex', alignItems:'center', justifyContent:'center',
        zIndex: 5,
        opacity: clamp(circleP * 1.2),
        filter: `drop-shadow(0 0 ${22 * circleP}px rgba(232,215,168,0.55))`,
      }}>
        <UniverseMonogram size={CIRCLE_R * 1.32} progress={1} color="var(--gold-deep)"/>
      </div>
    </div>
  );
}

// ============================================================================
// SatelliteButton — round orbital tile
// ============================================================================
function SatelliteButton({ m, i, isHovered, isJumping, onClick, onMouseEnter, onMouseLeave, t }) {
  const Glyph = UIcons[m.id] || UIcons.story;
  const active = isHovered || isJumping;
  return (
    <div onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position:'relative', width:'100%', height:'100%', borderRadius:'50%',
        background: active
          ? 'linear-gradient(155deg, var(--tile-light) 0%, var(--tile) 60%, var(--tile-deep) 100%)'
          : 'linear-gradient(155deg, var(--tile) 0%, var(--tile-deep) 100%)',
        border:'1px solid '+(active ? 'var(--gold-soft)' : 'rgba(255,246,224,0.18)'),
        boxShadow: active
          ? '0 24px 48px rgba(50,32,12,0.34), 0 10px 22px rgba(50,32,12,0.20), 0 0 0 3px rgba(232,215,168,0.22), inset 0 1px 0 rgba(255,246,224,0.22), inset 0 -22px 40px rgba(50,32,12,0.30)'
          : '0 16px 30px rgba(50,32,12,0.20), 0 6px 14px rgba(50,32,12,0.14), inset 0 1px 0 rgba(255,246,224,0.16), inset 0 -22px 40px rgba(50,32,12,0.26)',
        transform: isHovered && !isJumping ? 'translateY(-6px) scale(1.06)' : 'translateY(0) scale(1)',
        transition:'background 350ms ease, transform 320ms cubic-bezier(0.22,1,0.36,1), box-shadow 350ms ease, border-color 280ms',
        animation: isJumping ? 'uniSatBlast 1200ms cubic-bezier(0.22,1,0.36,1) forwards' : 'none',
        cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center',
        overflow:'visible',
      }}>
      {/* ambient halo when active */}
      {active && (
        <div style={{
          position:'absolute', inset:-12, borderRadius:'50%',
          background:'radial-gradient(circle at center, rgba(232,215,168,0.32), transparent 70%)',
          pointerEvents:'none', filter:'blur(12px)', zIndex:-1,
        }}/>
      )}

      {/* keystone tick */}
      <div style={{
        position:'absolute', top:11.5, left:'50%', width:1.5, height:14, marginLeft:-0.75,
        background:'var(--on-tile)', opacity: active ? 0.95 : 0.55,
        transition:'opacity 280ms',
      }}/>

      {/* number badge */}
      <div className="mono" style={{
        position:'absolute', top:25, left:0, right:0, textAlign:'center',
        fontSize:11.5, letterSpacing:'0.36em', color:'var(--on-tile)',
        opacity: active ? 1 : 0.78, transition:'opacity 280ms',
      }}>0{i + 1}</div>

      {/* glyph — flies on tap (jump → spin → glide to centre).
          A gold halo "coin" rides under the icon during flight so it
          never disappears against a busy background. */}
      <div className="uni-sat-icon" style={{
        position:'relative',
        width: 101, height: 101, color: isJumping ? '#1a130a' : 'var(--on-tile)',
        marginTop: 15,
        animation: isJumping ? 'uniIconJumpFlipFly 500ms cubic-bezier(0.34, 1.18, 0.4, 1) forwards' : 'none',
        willChange: 'transform, opacity, filter',
        transformOrigin: 'center',
      }}>
        {isJumping && (
          <div style={{
            position:'absolute', inset: -17, borderRadius:'50%',
            background:'radial-gradient(circle at center, #fff8e0 0%, #ead7a8 50%, #c9a05e 100%)',
            boxShadow:'0 0 36px rgba(255,238,180,0.95), 0 0 14px rgba(176,138,63,0.65), inset 0 0 14px rgba(176,138,63,0.32)',
            animation:'uniIconHalo 500ms cubic-bezier(0.34, 1.18, 0.4, 1) forwards',
            zIndex: -1,
          }}/>
        )}
        <div style={{position:'relative', zIndex: 1}}>
          <Glyph hovered={isHovered} firing={isJumping} t={t}/>
        </div>
      </div>

      {/* base hairline */}
      <div style={{
        position:'absolute', left:'30%', right:'30%', bottom:15, height:1.2,
        background:'var(--on-tile)', opacity: active ? 0.7 : 0.35,
        transition:'opacity 280ms',
      }}/>
    </div>
  );
}

// ============================================================================
// CosmicDust — light-theme cosmos backdrop
// ============================================================================
function CosmicDust({ count = 110, opacity = 0.7 }) {
  const ref = React.useRef(null);
  const rafRef = React.useRef(0);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    let W = 0, H = 0;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const rng = (seed => () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 0xffffffff)(0xc05a1f);
    const dust = Array.from({ length: count }, () => {
      const isPlanet = rng() < 0.06;
      return {
        ax: rng() * (W || 800),
        ay: rng() * (H || 600),
        oa: rng() * Math.PI * 2,
        orbR: 8 + rng() * 32,
        os: 0.0006 + rng() * 0.0014,
        r: isPlanet ? 2.4 + rng() * 4.0 : 0.6 + rng() * 1.6,
        twink: rng() * Math.PI * 2,
        twinkS: 0.005 + rng() * 0.018,
        hue: rng() < 0.55 ? 'gold' : 'cream',
        baseAlpha: isPlanet ? 0.40 : 0.55 + rng() * 0.40,
        isPlanet,
      };
    });

    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(50, now - last); last = now;
      ctx.clearRect(0, 0, W, H);
      for (const p of dust) {
        p.oa += p.os * dt;
        p.twink += p.twinkS * dt;
        const x = p.ax + p.orbR * Math.cos(p.oa);
        const y = p.ay + p.orbR * Math.sin(p.oa);
        const a = p.baseAlpha * (0.45 + 0.55 * Math.sin(p.twink)) * opacity;
        const baseCol = p.hue === 'gold' ? '176,138,63' : '232,215,168';
        if (p.isPlanet) {
          const grd = ctx.createRadialGradient(x, y, 0, x, y, p.r * 5);
          grd.addColorStop(0, `rgba(${baseCol},${a})`);
          grd.addColorStop(0.45, `rgba(${baseCol},${a*0.28})`);
          grd.addColorStop(1, `rgba(${baseCol},0)`);
          ctx.fillStyle = grd;
          ctx.beginPath(); ctx.arc(x, y, p.r * 5, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = `rgba(${baseCol},${Math.min(1, a * 1.4)})`;
          ctx.beginPath(); ctx.arc(x, y, p.r, 0, Math.PI*2); ctx.fill();
        } else {
          ctx.fillStyle = `rgba(${baseCol},${a})`;
          ctx.beginPath(); ctx.arc(x, y, p.r, 0, Math.PI*2); ctx.fill();
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [count, opacity]);

  return <canvas ref={ref} style={{
    position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:1,
  }}/>;
}

// ============================================================================
// Apartment10 — 10-floor apartment sketch (slow construction loop)
// ============================================================================
function Apartment10({ t, period = 22, color = 'var(--gold-deep)' }) {
  const phase = (t / period) % 1;
  const fadeP = 1 - clamp((phase - 0.86) / 0.14);
  const SEG_DUR = 0.07;
  const reveal = (s) => ease.outQuart(clamp((phase - s) / SEG_DUR));
  const floors = [80, 120, 160, 200, 240, 280, 320, 360, 400, 440];
  return (
    <svg viewBox="0 0 400 540" preserveAspectRatio="xMidYMid meet" width="100%" height="100%"
      style={{display:'block'}}>
      <g stroke={color} strokeWidth="1.6" fill="none"
         strokeLinecap="round" strokeLinejoin="round" opacity={fadeP}>
        <line x1="20" y1="490" x2="380" y2="490" pathLength="1"
          strokeDasharray="1" strokeDashoffset={1 - reveal(0.00)}/>
        <line x1="60" y1="500" x2="340" y2="500" opacity="0.55" pathLength="1"
          strokeDasharray="1" strokeDashoffset={1 - reveal(0.02)}/>
        <line x1="80" y1="490" x2="80" y2="40" pathLength="1"
          strokeDasharray="1" strokeDashoffset={1 - reveal(0.06)}/>
        <line x1="320" y1="490" x2="320" y2="40" pathLength="1"
          strokeDasharray="1" strokeDashoffset={1 - reveal(0.10)}/>
        <line x1="80" y1="40" x2="320" y2="40" pathLength="1"
          strokeDasharray="1" strokeDashoffset={1 - reveal(0.14)}/>
        <line x1="76" y1="32" x2="324" y2="32" opacity="0.7" pathLength="1"
          strokeDasharray="1" strokeDashoffset={1 - reveal(0.16)}/>
        <line x1="200" y1="32" x2="200" y2="6" pathLength="1"
          strokeDasharray="1" strokeDashoffset={1 - reveal(0.20)}/>
        <circle cx="200" cy="3" r="3" opacity={reveal(0.22)}/>
        {floors.slice().reverse().map((y, i) => (
          <line key={'f'+i} x1="80" y1={y} x2="320" y2={y} pathLength="1"
            strokeDasharray="1" strokeDashoffset={1 - reveal(0.24 + i*0.030)}/>
        ))}
        <line x1="140" y1="40" x2="140" y2="440" opacity="0.55" pathLength="1"
          strokeDasharray="1" strokeDashoffset={1 - reveal(0.55)}/>
        <line x1="200" y1="40" x2="200" y2="440" opacity="0.55" pathLength="1"
          strokeDasharray="1" strokeDashoffset={1 - reveal(0.58)}/>
        <line x1="260" y1="40" x2="260" y2="440" opacity="0.55" pathLength="1"
          strokeDasharray="1" strokeDashoffset={1 - reveal(0.61)}/>
        <path d="M 174 490 L 174 458 Q 174 446 200 446 Q 226 446 226 458 L 226 490"
          pathLength="1" strokeDasharray="1" strokeDashoffset={1 - reveal(0.64)}/>
        {[
          { x: 92,  y: 88,  o: 0.68 },
          { x: 152, y: 168, o: 0.55 },
          { x: 272, y: 248, o: 0.62 },
          { x: 212, y: 328, o: 0.75 },
          { x: 92,  y: 408, o: 0.5 },
          { x: 272, y: 128, o: 0.6 },
        ].map((w, i) => (
          <rect key={'w'+i} x={w.x} y={w.y} width="36" height="20" rx="1"
            fill={color} stroke="none" opacity={w.o * reveal(0.50 + i*0.010)}/>
        ))}
      </g>
    </svg>
  );
}

// ============================================================================
// LiveDot — top-right pulsing live indicator
// ============================================================================
function LiveDot({ t }) {
  const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 2);
  return (
    <div style={{display:'flex', alignItems:'center', gap:8.5}}>
      <div style={{position:'relative', width:8.5, height:8.5}}>
        <div style={{position:'absolute', inset:0, borderRadius:'50%', background:'var(--available)'}}/>
        <div style={{position:'absolute', inset:-4, borderRadius:'50%', background:'var(--available)', opacity:0.32 * pulse, transform:`scale(${1 + pulse * 0.6})`}}/>
      </div>
      <div className="mono" style={{fontSize:14, letterSpacing:'0.24em', color:'var(--available)'}}>LIVE INVENTORY</div>
    </div>
  );
}

// ============================================================================
// 8 BESPOKE GLYPHS — light cream on dark beige tile body (unchanged)
// ============================================================================
const Sw = 1.25;
const Glow = (extra={}) => ({
  fill:'none', stroke:'currentColor', strokeWidth: Sw,
  strokeLinecap:'round', strokeLinejoin:'round', ...extra,
});

const UIcons = {
  story: ({ hovered, t }) => (
    <svg viewBox="0 0 100 100" width="100" height="100">
      <g {...Glow()}>
        <line x1="22" y1="78" x2="78" y2="78" opacity={0.95}/>
        <line x1="26" y1="64" x2="74" y2="64" opacity={0.78}/>
        <line x1="30" y1="50" x2="70" y2="50" opacity={0.62}/>
        <path d="M 36 26 V 50 M 50 22 V 50 M 64 26 V 50" strokeWidth={Sw} opacity={hovered ? 1 : 0.85}/>
        <path d="M 36 26 Q 36 18 50 18 Q 64 18 64 26"/>
      </g>
      <circle cx="50" cy={hovered ? 12 : 16} r="1.6" fill="var(--gold-soft)" style={{transition:'cy 600ms cubic-bezier(0.22,1,0.36,1)'}}/>
    </svg>
  ),
  location: ({ hovered, t }) => (
    <svg viewBox="0 0 100 100" width="100" height="100">
      <g {...Glow()}>
        <path d="M 50 22 C 38 22 30 31 30 42 C 30 56 50 80 50 80 C 50 80 70 56 70 42 C 70 31 62 22 50 22 Z"/>
        <circle cx="50" cy="42" r="6"/>
        <line x1="50" y1="6"  x2="50" y2="14" opacity={0.5}/>
        <line x1="50" y1="86" x2="50" y2="92" opacity={0.5}/>
        <line x1="6"  y1="50" x2="14" y2="50" opacity={0.5}/>
        <line x1="86" y1="50" x2="94" y2="50" opacity={0.5}/>
      </g>
      <ellipse cx="50" cy="86" rx={hovered ? 18 : 12} ry="2"
        fill="none" stroke="var(--gold)" strokeWidth="0.6" strokeDasharray="1 2"
        opacity={hovered ? 0.7 : 0.4}
        style={{transition:'rx 480ms cubic-bezier(0.22,1,0.36,1), opacity 480ms'}}/>
    </svg>
  ),
  masterplan: ({ hovered, t }) => (
    <svg viewBox="0 0 100 100" width="100" height="100">
      <g {...Glow()}>
        <rect x="20" y="22" width="60" height="56" rx="1"/>
        <line x1="35" y1="22" x2="35" y2="78" opacity={0.5}/>
        <line x1="50" y1="22" x2="50" y2="78" opacity={0.5}/>
        <line x1="65" y1="22" x2="65" y2="78" opacity={0.5}/>
        <line x1="20" y1="38" x2="80" y2="38" opacity={0.5}/>
        <line x1="20" y1="56" x2="80" y2="56" opacity={0.5}/>
      </g>
      <rect x="51" y="39" width="13" height="16" fill="currentColor" opacity={hovered ? 0.62 : 0.42}
        style={{transition:'opacity 320ms'}}/>
      <g {...Glow({strokeWidth: 0.8})} transform="translate(78 22)">
        <line x1="0" y1="0" x2="0" y2="-10"/>
        <path d="M 0 -10 L -2 -6 L 2 -6 Z" fill="currentColor"/>
      </g>
    </svg>
  ),
  residences: ({ hovered, t }) => (
    <svg viewBox="0 0 100 100" width="100" height="100">
      <g {...Glow()}>
        <rect x="20" y="28" width="60" height="46" rx="1"/>
        <line x1="50" y1="28" x2="50" y2="74"/>
        <line x1="50" y1="54" x2="80" y2="54"/>
        <line x1="20" y1="48" x2="50" y2="48"/>
        <path d="M 28 48 A 6 6 0 0 1 34 42" opacity={0.7}/>
        <path d="M 56 54 A 6 6 0 0 1 62 60" opacity={0.7}/>
        <rect x="30" y="56" width="14" height="14" rx="1" opacity={hovered ? 0.55 : 0.32} fill="currentColor" stroke="none"/>
        <line x1="20" y1="80" x2="80" y2="80" strokeWidth="0.5" opacity={0.5}/>
      </g>
    </svg>
  ),
  amenities: ({ hovered, t }) => (
    <svg viewBox="0 0 100 100" width="100" height="100">
      <g {...Glow()}>
        <circle cx="50" cy="34" r="11"/>
        <line x1="50" y1="45" x2="50" y2="68"/>
        <path d="M 30 60 Q 40 50 50 56 Q 60 50 70 60"/>
        <path d={`M 18 ${74 + (hovered ? Math.sin(t*4)*1.2 : 0)} Q 34 70 50 76 Q 66 82 82 ${74 + (hovered ? -Math.sin(t*4)*1.2 : 0)}`}/>
        <path d="M 14 84 Q 32 80 50 86 Q 68 92 86 84" opacity={0.6}/>
      </g>
    </svg>
  ),
  gallery: ({ hovered, t }) => (
    <svg viewBox="0 0 100 100" width="100" height="100">
      <g {...Glow()}>
        <rect x="26" y="34" width="48" height="34" rx="2"
          transform={`rotate(${hovered ? -8 : -5} 50 51)`}
          style={{transition:'transform 480ms cubic-bezier(0.22,1,0.36,1)'}}/>
        <rect x="22" y="30" width="56" height="38" rx="2"/>
        <circle cx="50" cy="49" r="10"/>
        <g opacity={0.78}>
          <line x1="50" y1="39" x2="50" y2="44"/>
          <line x1="50" y1="54" x2="50" y2="59"/>
          <line x1="40" y1="49" x2="45" y2="49"/>
          <line x1="55" y1="49" x2="60" y2="49"/>
          <line x1="42.9" y1="42" x2="46.4" y2="45.5" opacity={0.6}/>
          <line x1="53.6" y1="52.5" x2="57.1" y2="56" opacity={0.6}/>
          <line x1="42.9" y1="56" x2="46.4" y2="52.5" opacity={0.6}/>
          <line x1="53.6" y1="45.5" x2="57.1" y2="42" opacity={0.6}/>
        </g>
        <circle cx="50" cy="49" r="2.6" fill="currentColor" stroke="none"/>
        <line x1="22" y1="76" x2="38" y2="76" opacity={0.5}/>
      </g>
    </svg>
  ),
  tools: ({ hovered, t }) => (
    <svg viewBox="0 0 100 100" width="100" height="100">
      <g {...Glow()}>
        <rect x="22" y="22" width="56" height="56" rx="3"/>
        <line x1="22" y1="42" x2="78" y2="42"/>
      </g>
      <text x="50" y="64" fontSize="22" fill="currentColor" textAnchor="middle"
        fontFamily="Cormorant Garamond, serif" fontWeight="500">₹</text>
      <g {...Glow({strokeWidth: 1})}>
        <line x1="30" y1="36" x2="30" y2={hovered ? 28 : 32} style={{transition:'y2 420ms'}}/>
        <line x1="36" y1="36" x2="36" y2={hovered ? 30 : 34} style={{transition:'y2 460ms'}}/>
        <line x1="42" y1="36" x2="42" y2={hovered ? 26 : 30} style={{transition:'y2 500ms'}}/>
        <line x1="48" y1="36" x2="48" y2={hovered ? 32 : 34} style={{transition:'y2 540ms'}}/>
      </g>
      <g fill="currentColor" opacity={0.55}>
        <circle cx="32" cy="68" r="1.6"/>
        <circle cx="40" cy="68" r="1.6"/>
        <circle cx="48" cy="68" r="1.6"/>
        <circle cx="56" cy="68" r="1.6"/>
      </g>
    </svg>
  ),
  booking: ({ hovered, t }) => (
    <svg viewBox="0 0 100 100" width="100" height="100">
      <g {...Glow()}>
        <rect x="22" y="28" width="56" height="50" rx="3"/>
        <line x1="22" y1="42" x2="78" y2="42"/>
        <line x1="34" y1="22" x2="34" y2="34"/>
        <line x1="66" y1="22" x2="66" y2="34"/>
        <circle cx="34" cy="54" r="1.8" fill="currentColor" stroke="none" opacity={0.6}/>
        <circle cx="46" cy="54" r="1.8" fill="currentColor" stroke="none" opacity={0.6}/>
        <circle cx="58" cy="54" r="1.8" fill="currentColor" stroke="none" opacity={0.6}/>
        <circle cx="34" cy="64" r="1.8" fill="currentColor" stroke="none" opacity={0.6}/>
        <path d="M 38 60 L 46 68 L 64 50"
          strokeWidth="2" stroke="var(--gold-soft)" fill="none"
          strokeDasharray="40"
          strokeDashoffset={hovered ? 0 : 40}
          style={{transition:'stroke-dashoffset 560ms cubic-bezier(0.22,1,0.36,1)'}}/>
      </g>
    </svg>
  ),
};

// ============================================================================
// SALES DESK — hidden mini-CRM console (triple-tap the centre circle to open)
// ============================================================================
// Full-canvas cream/gold takeover. Header (project eyebrow + SALES DESK title +
// today's stats), a left WALK-INS list with stage filters, and a right detail
// pane for the active walk-in: preferences → recommended matches → journey.
// Everything is sized to the 2560×1600 canvas with NO page scroll; overflow is
// pushed into in-canvas glass popups.

// ── Seed data (guarded so it only defines once) ─────────────────────────────
if (typeof window !== 'undefined' && !window.SALES_DESK) {
  window.SALES_DESK = {
    stats: { walkInsToday: 5, awaitingSales: 1, liveNow: 3 },
    stages: [
      { key:'all',         label:'All',          count:5, dot:'var(--gold)' },
      { key:'awaiting',    label:'Awaiting sales', count:1, dot:'var(--venus-red)' },
      { key:'withsales',   label:'With sales',   count:1, dot:'var(--gold-deep)' },
      { key:'browsing',    label:'Browsing',     count:1, dot:'#7c8a6b' },
      { key:'negotiating', label:'Negotiating',  count:1, dot:'#c98a3b' },
      { key:'followup',    label:'Follow-up',    count:1, dot:'#8a7bb2' },
      { key:'closed',      label:'Closed',       count:0, dot:'#4f9d6a' },
    ],
    walkIns: [
      {
        id:'WI-2048', name:'Rohan Jain', initials:'RJ', stage:'withsales',
        config:'4 BHK · High floor', budget:'₹6.5–7.2 Cr', intent:'End-use + investment',
        agent:'Meera K.', ago:'4 min ago', phone:'+91 98250 11020', email:'rohan.jain@gmail.com',
        matchScore:94, session:'Live · 12 min',
        prefs:{ typology:'4 BHK', sqft:'3,400–3,600 sq.ft', budget:'₹6.5–7.2 Cr', purpose:'End-use', timeline:'This quarter',
                family:'4 — two children', source:'Referral · existing owner',
                mustHaves:['Riverfront view','High floor (20+)','Private elevator lobby','Corner unit'] },
        matches:[
          { no:'E-2104', tower:'Meridian', floor:'21st', bhk:'4 BHK', view:'Riverfront', sqft:'3,420 sq.ft', price:'₹6.84 Cr', match:96 },
          { no:'E-1903', tower:'Meridian', floor:'19th', bhk:'4 BHK', view:'Riverfront', sqft:'3,420 sq.ft', price:'₹6.61 Cr', match:92 },
          { no:'C-2201', tower:'Celeste',  floor:'22nd', bhk:'4 BHK', view:'City skyline', sqft:'3,510 sq.ft', price:'₹7.05 Cr', match:88 },
          { no:'C-2002', tower:'Celeste',  floor:'20th', bhk:'4 BHK', view:'Podium garden', sqft:'3,360 sq.ft', price:'₹6.40 Cr', match:84 },
        ],
        journey:[
          { label:'Walk-in registered', at:'11:58 AM', done:true,  current:false },
          { label:'Profile captured',   at:'12:03 PM', done:true,  current:false },
          { label:'Browsing units',     at:'12:06 PM', done:true,  current:false },
          { label:'With sales — Meera K.', at:'12:09 PM', done:false, current:true },
          { label:'Negotiation',        at:'—',        done:false, current:false },
          { label:'Booking',            at:'—',        done:false, current:false },
        ],
      },
      {
        id:'WI-2049', name:'Aisha Khan', initials:'AK', stage:'awaiting',
        config:'3 BHK · Mid floor', budget:'₹4.2–4.8 Cr', intent:'First home',
        agent:null, ago:'2 min ago', phone:'+91 99745 33218', email:'aisha.khan@outlook.com',
        matchScore:81, session:'Awaiting · 2 min',
        prefs:{ typology:'3 BHK', sqft:'2,580–2,650 sq.ft', budget:'₹4.2–4.8 Cr', purpose:'First home', timeline:'Next 6 months',
                family:'3 — one child', source:'Walk-in · hoarding',
                mustHaves:['Vastu compliant','Garden view','Covered parking ×2'] },
        matches:[
          { no:'A-1402', tower:'Aurora',  floor:'14th', bhk:'3 BHK', view:'Podium garden', sqft:'2,610 sq.ft', price:'₹4.35 Cr', match:90 },
          { no:'A-1605', tower:'Aurora',  floor:'16th', bhk:'3 BHK', view:'Garden + city', sqft:'2,640 sq.ft', price:'₹4.58 Cr', match:86 },
          { no:'S-1208', tower:'Solstice',floor:'12th', bhk:'3 BHK', view:'Avenue', sqft:'2,580 sq.ft', price:'₹4.20 Cr', match:79 },
          { no:'S-1509', tower:'Solstice',floor:'15th', bhk:'3 BHK', view:'Garden', sqft:'2,600 sq.ft', price:'₹4.44 Cr', match:75 },
        ],
        journey:[
          { label:'Walk-in registered', at:'12:11 PM', done:true,  current:false },
          { label:'Profile captured',   at:'12:13 PM', done:true,  current:false },
          { label:'Awaiting sales',     at:'12:13 PM', done:false, current:true },
          { label:'Browsing units',     at:'—',        done:false, current:false },
          { label:'Negotiation',        at:'—',        done:false, current:false },
          { label:'Booking',            at:'—',        done:false, current:false },
        ],
      },
      {
        id:'WI-2050', name:'Vikram Patel', initials:'VP', stage:'browsing',
        config:'4 BHK · Penthouse', budget:'₹9–12 Cr', intent:'Investment',
        agent:'Self-guided', ago:'9 min ago', phone:'+91 98980 77451', email:'vikram@patelventures.in',
        matchScore:88, session:'Live · 9 min',
        prefs:{ typology:'4 BHK / Penthouse', sqft:'5,600–6,200 sq.ft', budget:'₹9–12 Cr', purpose:'Investment', timeline:'Opportunistic',
                family:'2 — no children', source:'Channel partner',
                mustHaves:['Penthouse / top 3 floors','Terrace deck','Two-car private garage','Riverfront'] },
        matches:[
          { no:'M-PH01', tower:'Meridian', floor:'30th (PH)', bhk:'5 BHK', view:'Riverfront', sqft:'6,120 sq.ft', price:'₹11.8 Cr', match:95 },
          { no:'C-PH02', tower:'Celeste',  floor:'29th (PH)', bhk:'5 BHK', view:'City + river', sqft:'5,980 sq.ft', price:'₹11.2 Cr', match:90 },
          { no:'E-2810', tower:'Meridian', floor:'28th', bhk:'4 BHK', view:'Riverfront', sqft:'3,500 sq.ft', price:'₹9.10 Cr', match:82 },
          { no:'A-PH03', tower:'Aurora',   floor:'27th (PH)', bhk:'5 BHK', view:'Garden + skyline', sqft:'5,640 sq.ft', price:'₹9.95 Cr', match:78 },
        ],
        journey:[
          { label:'Walk-in registered', at:'11:53 AM', done:true,  current:false },
          { label:'Profile captured',   at:'11:57 AM', done:true,  current:false },
          { label:'Browsing units',     at:'12:01 PM', done:false, current:true },
          { label:'With sales',         at:'—',        done:false, current:false },
          { label:'Negotiation',        at:'—',        done:false, current:false },
          { label:'Booking',            at:'—',        done:false, current:false },
        ],
      },
      {
        id:'WI-2051', name:'Sneha Reddy', initials:'SR', stage:'negotiating',
        config:'4 BHK · River view', budget:'₹6–6.8 Cr', intent:'End-use',
        agent:'Arjun S.', ago:'22 min ago', phone:'+91 90080 22914', email:'sneha.reddy@gmail.com',
        matchScore:91, session:'Live · 24 min',
        prefs:{ typology:'4 BHK', sqft:'3,400–3,520 sq.ft', budget:'₹6–6.8 Cr', purpose:'End-use', timeline:'Ready to close',
                family:'5 — joint family', source:'Google · search ad',
                mustHaves:['Riverfront view','Pooja room','Servant quarter','Floor 15–22'] },
        matches:[
          { no:'E-1807', tower:'Meridian', floor:'18th', bhk:'4 BHK', view:'Riverfront', sqft:'3,420 sq.ft', price:'₹6.52 Cr', match:97 },
          { no:'E-1607', tower:'Meridian', floor:'16th', bhk:'4 BHK', view:'Riverfront', sqft:'3,420 sq.ft', price:'₹6.31 Cr', match:93 },
          { no:'C-1904', tower:'Celeste',  floor:'19th', bhk:'4 BHK', view:'River + city', sqft:'3,510 sq.ft', price:'₹6.74 Cr', match:88 },
          { no:'C-1704', tower:'Celeste',  floor:'17th', bhk:'4 BHK', view:'City', sqft:'3,360 sq.ft', price:'₹6.10 Cr', match:80 },
        ],
        journey:[
          { label:'Walk-in registered', at:'11:40 AM', done:true,  current:false },
          { label:'Profile captured',   at:'11:44 AM', done:true,  current:false },
          { label:'Browsing units',     at:'11:50 AM', done:true,  current:false },
          { label:'With sales — Arjun S.', at:'11:58 AM', done:true, current:false },
          { label:'Negotiation',        at:'12:04 PM', done:false, current:true },
          { label:'Booking',            at:'—',        done:false, current:false },
        ],
      },
      {
        id:'WI-2052', name:'Karan Mehta', initials:'KM', stage:'followup',
        config:'3 BHK · Garden view', budget:'₹4.5–5 Cr', intent:'Upgrade',
        agent:'Meera K.', ago:'1 hr ago', phone:'+91 97370 55620', email:'karan.mehta@zoho.com',
        matchScore:76, session:'Offline · follow-up',
        prefs:{ typology:'3 BHK', sqft:'2,560–2,640 sq.ft', budget:'₹4.5–5 Cr', purpose:'Upgrade from 2 BHK', timeline:'Within a year',
                family:'4 — two children', source:'Past site visit',
                mustHaves:['Garden view','Club access','School within 2 km'] },
        matches:[
          { no:'A-1102', tower:'Aurora',  floor:'11th', bhk:'3 BHK', view:'Podium garden', sqft:'2,610 sq.ft', price:'₹4.62 Cr', match:85 },
          { no:'S-1305', tower:'Solstice',floor:'13th', bhk:'3 BHK', view:'Garden', sqft:'2,580 sq.ft', price:'₹4.48 Cr', match:81 },
          { no:'A-0908', tower:'Aurora',  floor:'9th',  bhk:'3 BHK', view:'Avenue', sqft:'2,560 sq.ft', price:'₹4.30 Cr', match:74 },
          { no:'S-1006', tower:'Solstice',floor:'10th', bhk:'3 BHK', view:'Garden + city', sqft:'2,600 sq.ft', price:'₹4.55 Cr', match:70 },
        ],
        journey:[
          { label:'Walk-in registered', at:'10:48 AM', done:true,  current:false },
          { label:'Profile captured',   at:'10:52 AM', done:true,  current:false },
          { label:'Browsing units',     at:'10:59 AM', done:true,  current:false },
          { label:'With sales — Meera K.', at:'11:10 AM', done:true, current:false },
          { label:'Follow-up scheduled', at:'11:25 AM', done:false, current:true },
          { label:'Booking',            at:'—',        done:false, current:false },
        ],
      },
    ],
  };
}

// Resolve a stage key → its descriptor (label + dot colour).
function sdStage(key) {
  const stages = (window.SALES_DESK && window.SALES_DESK.stages) || [];
  return stages.find(s => s.key === key) || { key, label: key, dot: 'var(--gold)' };
}

function SdMiniIcon({ type }) {
  const c = { fill:'none', stroke:'currentColor', strokeWidth:1.7, strokeLinecap:'round', strokeLinejoin:'round' };
  if (type === 'phone') return <svg viewBox="0 0 24 24" width="100%" height="100%"><path {...c} d="M6.5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4Z"/></svg>;
  if (type === 'sms')   return <svg viewBox="0 0 24 24" width="100%" height="100%"><path {...c} d="M4 5h16v11H8l-4 3V5Z"/><path {...c} d="M8 9h8M8 12h5"/></svg>;
  if (type === 'units') return <svg viewBox="0 0 24 24" width="100%" height="100%"><rect {...c} x="4" y="4" width="7" height="16" rx="1"/><rect {...c} x="13" y="9" width="7" height="11" rx="1"/><path {...c} d="M6.5 7h2M6.5 10h2M6.5 13h2M15.5 12h2M15.5 15h2"/></svg>;
  if (type === 'search')return <svg viewBox="0 0 24 24" width="100%" height="100%"><circle {...c} cx="11" cy="11" r="6"/><path {...c} d="M16 16l4 4"/></svg>;
  if (type === 'mail')  return <svg viewBox="0 0 24 24" width="100%" height="100%"><rect {...c} x="3.5" y="5" width="17" height="14" rx="2"/><path {...c} d="M4 7l8 6 8-6"/></svg>;
  if (type === 'whatsapp') return <svg viewBox="0 0 24 24" width="100%" height="100%"><path {...c} d="M5 19l1.3-3.6A7 7 0 1 1 9 18.2L5 19Z"/><path {...c} d="M9.2 9.4c.2 2 1.6 3.4 3.4 3.6.5 0 .9-.4 1-.8.1-.4-.1-.6-.5-.8l-.8-.4c-.3-.1-.5 0-.7.2-.6-.3-1-.7-1.3-1.3.2-.2.3-.4.2-.7l-.4-.8c-.2-.4-.4-.6-.8-.5-.4.1-.8.5-.8 1Z"/></svg>;
  if (type === 'user')  return <svg viewBox="0 0 24 24" width="100%" height="100%"><circle {...c} cx="12" cy="8" r="3.4"/><path {...c} d="M5.5 19a6.5 6.5 0 0 1 13 0"/></svg>;
  if (type === 'users') return <svg viewBox="0 0 24 24" width="100%" height="100%"><circle {...c} cx="9" cy="8.5" r="2.8"/><path {...c} d="M4 18.5a5 5 0 0 1 10 0"/><path {...c} d="M15.5 6.2a2.8 2.8 0 0 1 0 5.2M16.5 13.6a5 5 0 0 1 3.5 4.9"/></svg>;
  if (type === 'clock') return <svg viewBox="0 0 24 24" width="100%" height="100%"><circle {...c} cx="12" cy="12" r="8"/><path {...c} d="M12 7.5V12l3 2"/></svg>;
  if (type === 'link')  return <svg viewBox="0 0 24 24" width="100%" height="100%"><path {...c} d="M9.5 14.5l5-5"/><path {...c} d="M8 12l-2 2a3 3 0 0 0 4.2 4.2l2-2"/><path {...c} d="M16 12l2-2a3 3 0 0 0-4.2-4.2l-2 2"/></svg>;
  if (type === 'building') return <svg viewBox="0 0 24 24" width="100%" height="100%"><rect {...c} x="6" y="3.5" width="12" height="17" rx="1"/><path {...c} d="M9 7h2M13 7h2M9 10.5h2M13 10.5h2M9 14h2M13 14h2M10.5 20.5v-3h3v3"/></svg>;
  if (type === 'ruler') return <svg viewBox="0 0 24 24" width="100%" height="100%"><rect {...c} x="3.5" y="9" width="17" height="6" rx="1"/><path {...c} d="M7 9v2.5M11 9v3M15 9v2.5M19 9v3" /></svg>;
  if (type === 'rupee') return <svg viewBox="0 0 24 24" width="100%" height="100%"><circle {...c} cx="12" cy="12" r="8.4"/><path {...c} d="M9.5 8.2h5M9.5 10.7h5M13.6 8.2c0 2.2-1.4 3.2-3.4 3.2l3.4 4.4"/></svg>;
  if (type === 'calendar') return <svg viewBox="0 0 24 24" width="100%" height="100%"><rect {...c} x="4" y="5.5" width="16" height="14" rx="2"/><path {...c} d="M4 9.5h16M8 4v3M16 4v3"/></svg>;
  if (type === 'sparkle') return <svg viewBox="0 0 24 24" width="100%" height="100%"><path {...c} d="M12 4l1.6 4.8L18.4 10l-4.8 1.6L12 16l-1.6-4.4L5.6 10l4.8-1.2L12 4Z"/></svg>;
  if (type === 'report') return <svg viewBox="0 0 24 24" width="100%" height="100%"><rect {...c} x="5" y="3.5" width="14" height="17" rx="2"/><path {...c} d="M8.5 8h7M8.5 11.5h7M8.5 15h4"/></svg>;
  if (type === 'arrowleft') return <svg viewBox="0 0 24 24" width="100%" height="100%"><path {...c} d="M11 6l-6 6 6 6M5 12h14"/></svg>;
  if (type === 'eye')   return <svg viewBox="0 0 24 24" width="100%" height="100%"><path {...c} d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"/><circle {...c} cx="12" cy="12" r="2.4"/></svg>;
  if (type === 'mute')  return <svg viewBox="0 0 24 24" width="100%" height="100%"><path {...c} d="M9 9l-3.5.2a1 1 0 0 0-1 1v3.6a1 1 0 0 0 1 1H8l4 3.4V6.6L10 8"/><path {...c} d="M16 9.5a4 4 0 0 1 0 5M4 4l16 16"/></svg>;
  if (type === 'up')    return <svg viewBox="0 0 24 24" width="100%" height="100%"><path {...c} d="M12 19V6M6 11l6-6 6 6"/></svg>;
  if (type === 'compass') return <svg viewBox="0 0 24 24" width="100%" height="100%"><circle {...c} cx="12" cy="12" r="8.4"/><path {...c} d="M15 9l-1.6 4.4L9 15l1.6-4.4L15 9Z"/></svg>;
  if (type === 'frame') return <svg viewBox="0 0 24 24" width="100%" height="100%"><path {...c} d="M4 8V5h3M20 8V5h-3M4 16v3h3M20 16v3h-3"/></svg>;
  if (type === 'star')  return <svg viewBox="0 0 24 24" width="100%" height="100%"><path {...c} d="M12 4l2.3 5.1 5.6.5-4.2 3.7 1.3 5.5L12 21.4l-4.3 2.9 1.3-5.5L4.1 9.6l5.6-.5L12 4Z"/></svg>;
  return null;
}

// map a free-text must-have to a fitting glyph, so the GRE chips read at a glance
function mustHaveIcon(label) {
  const s = (label || '').toLowerCase();
  if (/quiet|silent/.test(s)) return 'mute';
  if (/park|garden|view|pool|skyline|deck/.test(s)) return 'eye';
  if (/floor|high/.test(s)) return 'up';
  if (/corner|terrace|penthouse|frame/.test(s)) return 'frame';
  if (/vastu|compass|facing|direction/.test(s)) return 'compass';
  if (/parking|car/.test(s)) return 'building';
  return 'star';
}

// ── Sales-Desk session helpers (module scope so the panel stays readable) ────
const sdCard = {
  background:'rgba(255,255,255,0.62)', border:'1px solid var(--line)', borderRadius:18,
  boxShadow:'0 18px 50px rgba(40,30,12,0.07), inset 0 1px 0 rgba(255,255,255,0.6)',
  backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
};
const sdEyebrow = { fontSize:14, letterSpacing:'0.34em', color:'var(--slate)' };
const sdInput = { padding:'14px 16px', borderRadius:12, border:'1px solid var(--line)',
  background:'rgba(255,255,255,0.82)', fontSize:17, color:'var(--ink)', outline:'none', fontFamily:'inherit' };
const DISP_TONE = { 'Interested':'#3a9d6a', 'Needs time':'#d99a2b', 'Evaluating options':'#5b8fb0', 'Not interested':'#b0564a' };
const PRIO_TONE = { Hot:'#d8472f', Warm:'#d99a2b', Cold:'#5b8fb0' };
function sdDur(ms){ const s=Math.max(0,Math.round(ms/1000)); const m=Math.floor(s/60); const r=s%60; return m? `${m}m ${r}s` : `${r}s`; }

// LIVE session panel — replaces the console body once a journey is running.
function SdActivePanel({ sess, record, onEnd }) {
  const snap = sess.snapshot();
  const dur = sess.elapsed();
  const stats = [
    { v: sdDur(dur),                          k:'DURATION' },
    { v: snap.screens.length,                 k:'SCREENS VISITED' },
    { v: `${snap.modulesUsed}/${snap.modulesTotal}`, k:'MODULES USED' },
    { v: snap.eventCount,                     k:'INTERACTIONS' },
  ];
  const maxMs = (snap.screens[0] && snap.screens[0].ms) || 1;
  return (
    <div style={{position:'absolute', top:188, left:CRM_PAD, right:CRM_PAD, bottom:44, display:'flex', flexDirection:'column', gap:18}}>
      {/* live banner */}
      <div style={{...sdCard, padding:'24px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', flex:'0 0 auto'}}>
        <div style={{display:'flex', alignItems:'center', gap:18}}>
          <div style={{width:72, height:72, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
            background:'linear-gradient(150deg, var(--gold-soft), var(--gold))', boxShadow:'0 8px 20px rgba(176,138,63,0.28)'}}>
            <span className="serif" style={{fontSize:30, color:'#3a2c10'}}>{record ? record.initials : '—'}</span>
          </div>
          <div>
            <div className="mono" style={{display:'flex', alignItems:'center', gap:9, fontSize:12, letterSpacing:'0.24em', color:'#3a9d6a'}}>
              <span style={{width:9, height:9, borderRadius:'50%', background:'#3a9d6a', boxShadow:'0 0 0 4px rgba(58,157,106,0.18)'}}/>
              JOURNEY LIVE
            </div>
            <div className="serif" style={{fontSize:36, marginTop:6}}>{record ? record.name : 'Walk-in'}</div>
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          <div className="serif" style={{fontSize:52, fontWeight:300, lineHeight:0.9, color:'var(--ink)'}}>{sdDur(dur)}</div>
          <div className="mono" style={{fontSize:11, letterSpacing:'0.2em', color:'var(--slate)', marginTop:8}}>ELAPSED ON FLOOR</div>
        </div>
      </div>
      {/* live stat cards */}
      <div style={{display:'flex', gap:16, flex:'0 0 auto'}}>
        {stats.map(s => (
          <div key={s.k} style={{...sdCard, flex:'1 1 0', padding:'20px 22px'}}>
            <div className="serif" style={{fontSize:38, fontWeight:300, lineHeight:0.9, color:'var(--ink)'}}>{s.v}</div>
            <div className="mono" style={{fontSize:11, letterSpacing:'0.18em', color:'var(--gold-deep)', marginTop:9}}>{s.k}</div>
          </div>
        ))}
      </div>
      {/* live screen breakdown */}
      <div className="uni-crm-scroll" style={{...sdCard, padding:'22px 28px', flex:'1 1 auto', minHeight:0, overflowY:'auto'}}>
        <div className="mono" style={{...sdEyebrow, color:'var(--gold-deep)'}}>WHAT THEY ARE EXPLORING · LIVE</div>
        {snap.screens.length === 0 ? (
          <div style={{color:'var(--slate)', fontSize:17, marginTop:16}}>Waiting for the customer to start exploring…</div>
        ) : (
          <div style={{marginTop:16, display:'flex', flexDirection:'column', gap:11}}>
            {snap.screens.map(s => (
              <div key={s.path} style={{display:'flex', alignItems:'center', gap:16}}>
                <div className="serif" style={{fontSize:19, width:196, flex:'0 0 auto'}}>{s.label}</div>
                <div style={{flex:'1 1 auto', height:8, borderRadius:8, background:'rgba(10,10,10,0.05)', overflow:'hidden'}}>
                  <div style={{height:'100%', width:`${Math.max(6, Math.round(s.ms / maxMs * 100))}%`, borderRadius:8, background:'linear-gradient(90deg, var(--gold), var(--gold-deep))'}}/>
                </div>
                <div className="mono" style={{fontSize:13, color:'var(--graphite)', width:78, textAlign:'right', flex:'0 0 auto'}}>{sdDur(s.ms)}</div>
                <div className="mono" style={{fontSize:11, color:'var(--slate)', width:48, textAlign:'right', flex:'0 0 auto'}}>×{s.visits}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* end journey */}
      <button data-crm="1" onClick={onEnd} className="mono" style={{
        flex:'0 0 auto', cursor:'pointer', width:'100%',
        background:'linear-gradient(135deg, #b8463a, #8d2f25)', border:'1px solid #8d2f25',
        borderRadius:15, padding:'18px', fontSize:15, letterSpacing:'0.2em', color:'#fff', fontWeight:600,
        boxShadow:'0 12px 28px rgba(141,47,37,0.28)',
      }}>END JOURNEY &amp; CAPTURE OUTCOME →</button>
    </div>
  );
}

// END-OF-JOURNEY wrap-up form — captured before the session is saved.
function SdWrapForm({ record, onCancel, onSubmit }) {
  const [disp, setDisp] = React.useState(null);
  const [prio, setPrio] = React.useState(null);
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');
  const [remark, setRemark] = React.useState('');
  const DISPOS = ['Interested','Needs time','Evaluating options','Not interested'];
  const ready = disp && prio;
  const lastName = record ? record.name.split(' ').slice(-1)[0] : 'this walk-in';
  return (
    <div data-crm="1" style={{position:'absolute', inset:0, zIndex:70, background:'rgba(20,16,8,0.46)',
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)', display:'flex', alignItems:'center', justifyContent:'center',
      animation:'uniCinematicIn 240ms ease both'}}>
      <div style={{width:760, maxHeight:'92%', overflowY:'auto', background:'var(--ivory)', border:'1px solid var(--gold-soft)',
        borderRadius:22, boxShadow:'0 40px 100px rgba(20,14,4,0.32)', padding:'34px 38px'}}>
        <div className="mono" style={{...sdEyebrow, color:'var(--gold-deep)'}}>END JOURNEY · CAPTURE OUTCOME</div>
        <div className="serif" style={{fontSize:34, marginTop:8}}>How did it go with {lastName}?</div>

        <div style={{marginTop:26}}>
          <div className="mono" style={{fontSize:12, letterSpacing:'0.22em', color:'var(--slate)'}}>DISPOSITION</div>
          <div style={{display:'flex', flexWrap:'wrap', gap:10, marginTop:12}}>
            {DISPOS.map(d => { const on = disp===d; const c = DISP_TONE[d];
              return (
                <button key={d} onClick={()=>setDisp(d)} style={{cursor:'pointer', display:'flex', alignItems:'center', gap:9,
                  padding:'12px 18px', borderRadius:12, fontSize:16,
                  background: on ? c : 'rgba(255,255,255,0.7)', color: on ? '#fff' : 'var(--graphite)',
                  border:'1px solid '+(on ? c : 'var(--line)'), transition:'all 180ms', fontWeight: on ? 600 : 400}}>
                  <span style={{width:9, height:9, borderRadius:'50%', background: on ? '#fff' : c}}/>{d}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{marginTop:24}}>
          <div className="mono" style={{fontSize:12, letterSpacing:'0.22em', color:'var(--slate)'}}>PRIORITY</div>
          <div style={{display:'flex', gap:10, marginTop:12}}>
            {['Hot','Warm','Cold'].map(p => { const on = prio===p; const c = PRIO_TONE[p];
              return (
                <button key={p} onClick={()=>setPrio(p)} style={{cursor:'pointer', display:'flex', alignItems:'center', gap:9,
                  padding:'12px 22px', borderRadius:12, fontSize:16,
                  background: on ? c : 'rgba(255,255,255,0.7)', color: on ? '#fff' : 'var(--graphite)',
                  border:'1px solid '+(on ? c : 'var(--line)'), transition:'all 180ms', fontWeight: on ? 600 : 400}}>
                  <span style={{width:9, height:9, borderRadius:'50%', background: on ? '#fff' : c}}/>{p}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{marginTop:24}}>
          <div className="mono" style={{fontSize:12, letterSpacing:'0.22em', color:'var(--slate)'}}>NEXT FOLLOW-UP</div>
          <div style={{display:'flex', gap:12, marginTop:12}}>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{...sdInput, flex:'1 1 0'}}/>
            <input type="time" value={time} onChange={e=>setTime(e.target.value)} style={{...sdInput, flex:'1 1 0'}}/>
          </div>
        </div>

        <div style={{marginTop:24}}>
          <div className="mono" style={{fontSize:12, letterSpacing:'0.22em', color:'var(--slate)'}}>REMARK</div>
          <textarea value={remark} onChange={e=>setRemark(e.target.value)} rows={3}
            placeholder="Anything the next call should know…"
            style={{...sdInput, width:'100%', marginTop:12, resize:'none', lineHeight:1.4, boxSizing:'border-box'}}/>
        </div>

        <div style={{display:'flex', gap:12, marginTop:30}}>
          <button onClick={onCancel} className="mono" style={{flex:'0 0 auto', cursor:'pointer', padding:'16px 24px', borderRadius:13,
            background:'rgba(10,10,10,0.04)', border:'1px solid var(--line)', fontSize:14, letterSpacing:'0.16em', color:'var(--graphite)'}}>CANCEL</button>
          <button disabled={!ready}
            onClick={()=>onSubmit({ disposition:disp, priority:prio, followUpDate:date, followUpTime:time, remark:remark.trim() })}
            className="mono" style={{flex:'1 1 auto', cursor: ready ? 'pointer' : 'not-allowed', padding:'16px', borderRadius:13,
              background: ready ? 'linear-gradient(135deg, var(--gold), var(--gold-deep))' : 'rgba(10,10,10,0.08)',
              border:'1px solid '+(ready ? 'var(--gold-deep)' : 'var(--line)'), fontSize:15, letterSpacing:'0.18em',
              color: ready ? '#2a1d05' : 'var(--slate)', fontWeight:600}}>
            END SESSION &amp; SAVE REPORT →
          </button>
        </div>
      </div>
    </div>
  );
}

function sdFollowUp(r){
  if (!r.followUpDate && !r.followUpTime) return 'Not scheduled';
  const d = r.followUpDate ? new Date(r.followUpDate + 'T00:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '';
  return [d, r.followUpTime].filter(Boolean).join(' · ');
}

// SAVED report — the full record of one journey.
function SdReportView({ report, onClose }) {
  if (!report) return null;
  const r = report;
  const maxMs = (r.screens[0] && r.screens[0].ms) || 1;
  const started = new Date(r.startedAt).toLocaleString('en-GB',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
  const outcome = [
    { k:'DISPOSITION', v:r.disposition||'—', c:DISP_TONE[r.disposition]||'var(--ink)' },
    { k:'PRIORITY',    v:r.priority||'—',    c:PRIO_TONE[r.priority]||'var(--ink)' },
    { k:'NEXT FOLLOW-UP', v:sdFollowUp(r),   c:'var(--ink)' },
  ];
  return (
    <div data-crm="1" onClick={onClose} style={{position:'absolute', inset:0, zIndex:70, background:'rgba(20,16,8,0.46)',
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)', display:'flex', alignItems:'center', justifyContent:'center',
      animation:'uniCinematicIn 240ms ease both'}}>
      <div onClick={e=>e.stopPropagation()} style={{width:960, maxHeight:'92%', overflowY:'auto', background:'var(--ivory)',
        border:'1px solid var(--gold-soft)', borderRadius:22, boxShadow:'0 40px 100px rgba(20,14,4,0.32)', padding:'34px 40px'}}>
        {/* header */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
          <div>
            <div className="mono" style={{...sdEyebrow, color:'var(--gold-deep)'}}>JOURNEY REPORT · {started}</div>
            <div className="serif" style={{fontSize:36, marginTop:8}}>{r.customer ? r.customer.name : 'Walk-in'}</div>
          </div>
          <button onClick={onClose} className="mono" style={{cursor:'pointer', background:'rgba(10,10,10,0.05)',
            border:'1px solid var(--line)', borderRadius:999, padding:'10px 16px', fontSize:13, letterSpacing:'0.2em'}}>CLOSE ✕</button>
        </div>

        {/* outcome */}
        <div style={{display:'flex', gap:14, marginTop:22}}>
          {outcome.map(o => (
            <div key={o.k} style={{flex:'1 1 0', padding:'16px 18px', borderRadius:14, background:'rgba(255,255,255,0.6)', border:'1px solid var(--line)'}}>
              <div className="mono" style={{fontSize:11, letterSpacing:'0.2em', color:'var(--slate)'}}>{o.k}</div>
              <div className="serif" style={{fontSize:23, marginTop:7, color:o.c}}>{o.v}</div>
            </div>
          ))}
        </div>
        {r.remark ? (
          <div style={{marginTop:14, padding:'16px 18px', borderRadius:14, background:'rgba(201,160,94,0.10)', border:'1px solid var(--gold-soft)'}}>
            <div className="mono" style={{fontSize:11, letterSpacing:'0.2em', color:'var(--gold-deep)'}}>REMARK</div>
            <div className="serif" style={{fontSize:20, marginTop:7, color:'var(--ink)', lineHeight:1.3}}>{r.remark}</div>
          </div>
        ) : null}

        {/* engagement stats */}
        <div style={{display:'flex', gap:14, marginTop:18}}>
          {[
            { v:sdDur(r.durationMs), k:'TIME ON FLOOR' },
            { v:`${r.modulesUsed}/${r.modulesTotal}`, k:'MODULES USED' },
            { v:r.screens.length, k:'SCREENS VISITED' },
            { v:r.eventCount, k:'INTERACTIONS' },
          ].map(s => (
            <div key={s.k} style={{flex:'1 1 0', padding:'16px 18px', borderRadius:14, background:'rgba(255,255,255,0.6)', border:'1px solid var(--line)'}}>
              <div className="serif" style={{fontSize:30, fontWeight:300, color:'var(--ink)'}}>{s.v}</div>
              <div className="mono" style={{fontSize:10.5, letterSpacing:'0.16em', color:'var(--gold-deep)', marginTop:7}}>{s.k}</div>
            </div>
          ))}
        </div>

        {/* screens by time */}
        <div style={{marginTop:24}}>
          <div className="mono" style={{fontSize:12, letterSpacing:'0.22em', color:'var(--slate)'}}>WHERE THE TIME WENT</div>
          <div style={{marginTop:14, display:'flex', flexDirection:'column', gap:10}}>
            {r.screens.length ? r.screens.map(s => (
              <div key={s.path} style={{display:'flex', alignItems:'center', gap:16}}>
                <div className="serif" style={{fontSize:18, width:188, flex:'0 0 auto'}}>{s.label}</div>
                <div style={{flex:'1 1 auto', height:8, borderRadius:8, background:'rgba(10,10,10,0.05)', overflow:'hidden'}}>
                  <div style={{height:'100%', width:`${Math.max(6, Math.round(s.ms / maxMs * 100))}%`, borderRadius:8, background:'linear-gradient(90deg, var(--gold), var(--gold-deep))'}}/>
                </div>
                <div className="mono" style={{fontSize:13, color:'var(--graphite)', width:76, textAlign:'right', flex:'0 0 auto'}}>{sdDur(s.ms)}</div>
                <div className="mono" style={{fontSize:11, color:'var(--slate)', width:46, textAlign:'right', flex:'0 0 auto'}}>×{s.visits}</div>
              </div>
            )) : <div style={{color:'var(--slate)', fontSize:16}}>No screens recorded.</div>}
          </div>
        </div>

        {/* not used */}
        {r.notUsed.length ? (
          <div style={{marginTop:22}}>
            <div className="mono" style={{fontSize:12, letterSpacing:'0.22em', color:'var(--slate)'}}>NOT OPENED THIS VISIT</div>
            <div style={{display:'flex', flexWrap:'wrap', gap:9, marginTop:12}}>
              {r.notUsed.map(m => (
                <span key={m.path} style={{padding:'7px 14px', borderRadius:999, fontSize:14,
                  background:'rgba(10,10,10,0.03)', border:'1px solid var(--line)', color:'var(--slate)'}}>{m.label}</span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// REPORTS history — list of saved journeys.
function SdReportsList({ history, onOpen, onClose }) {
  return (
    <div data-crm="1" onClick={onClose} style={{position:'absolute', inset:0, zIndex:70, background:'rgba(20,16,8,0.46)',
      backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)', display:'flex', alignItems:'center', justifyContent:'center',
      animation:'uniCinematicIn 240ms ease both'}}>
      <div onClick={e=>e.stopPropagation()} style={{width:820, maxHeight:'90%', overflowY:'auto', background:'var(--ivory)',
        border:'1px solid var(--gold-soft)', borderRadius:22, boxShadow:'0 40px 100px rgba(20,14,4,0.32)', padding:'34px 38px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
          <div>
            <div className="mono" style={{...sdEyebrow, color:'var(--gold-deep)'}}>SAVED JOURNEY REPORTS</div>
            <div className="serif" style={{fontSize:34, marginTop:8}}>{history.length} recorded {history.length===1?'visit':'visits'}</div>
          </div>
          <button onClick={onClose} className="mono" style={{cursor:'pointer', background:'rgba(10,10,10,0.05)',
            border:'1px solid var(--line)', borderRadius:999, padding:'10px 16px', fontSize:13, letterSpacing:'0.2em'}}>CLOSE ✕</button>
        </div>
        {history.length === 0 ? (
          <div style={{padding:'48px 0', textAlign:'center', color:'var(--slate)', fontSize:18}}>
            No journeys recorded yet. Start one from a walk-in to capture a report.
          </div>
        ) : (
          <div style={{marginTop:22, display:'flex', flexDirection:'column', gap:11}}>
            {history.map(r => (
              <button key={r.id} onClick={()=>onOpen(r)} style={{cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:18,
                padding:'16px 20px', borderRadius:14, background:'rgba(255,255,255,0.65)', border:'1px solid var(--line)', transition:'all 200ms'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--gold)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--line)';}}>
                <div style={{width:48, height:48, borderRadius:'50%', flex:'0 0 auto', display:'flex', alignItems:'center', justifyContent:'center',
                  background:'linear-gradient(150deg, var(--gold-soft), var(--gold))'}}>
                  <span className="serif" style={{fontSize:19, color:'#3a2c10'}}>{r.customer ? r.customer.initials : '—'}</span>
                </div>
                <div style={{flex:'1 1 auto', minWidth:0}}>
                  <div className="serif" style={{fontSize:22}}>{r.customer ? r.customer.name : 'Walk-in'}</div>
                  <div className="mono" style={{fontSize:12, letterSpacing:'0.12em', color:'var(--slate)', marginTop:5}}>
                    {new Date(r.startedAt).toLocaleString('en-GB',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})} · {sdDur(r.durationMs)} · {r.modulesUsed}/{r.modulesTotal} modules
                  </div>
                </div>
                {r.disposition ? <span style={{padding:'6px 13px', borderRadius:999, fontSize:13, color:'#fff', background:DISP_TONE[r.disposition]||'var(--ink)', flex:'0 0 auto'}}>{r.disposition}</span> : null}
                {r.priority ? <span style={{padding:'6px 13px', borderRadius:999, fontSize:13, color:'#fff', background:PRIO_TONE[r.priority]||'var(--ink)', flex:'0 0 auto'}}>{r.priority}</span> : null}
                <span className="mono" style={{fontSize:13, color:'var(--gold-deep)', flex:'0 0 auto'}}>→</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SalesDesk({ onClose }) {
  const data = window.SALES_DESK;
  const sess = useUniSession();                 // live journey store (re-renders on change)
  const PANEL_W = CRM_PANEL_W;                   // 60% panel — keeps the centre logo visible on the right
  const [filter, setFilter] = React.useState('all');
  const [query, setQuery] = React.useState('');
  const [activeId, setActiveId] = React.useState(data.walkIns[0].id); // Rohan Jain
  const [view, setView] = React.useState(null);  // null | 'wrapup' | 'report' | 'reports'
  const [report, setReport] = React.useState(null);
  // 1-second tick so the live journey timer/stat cards advance
  const [, tick] = React.useState(0);
  React.useEffect(() => { const iv = setInterval(() => tick(x => x + 1), 1000); return () => clearInterval(iv); }, []);
  const live = sess.isActive();
  const liveCust = sess.getCustomer();
  const liveRecord = (live && liveCust) ? (data.walkIns.find(w => w.id === liveCust.id) || liveCust) : null;

  const q = query.trim().toLowerCase();
  const list = data.walkIns.filter(w => {
    if (filter !== 'all' && w.stage !== filter) return false;
    if (!q) return true;
    return [w.name, w.phone, w.config, w.intent, w.budget, w.id, (w.agent||'')]
      .join(' ').toLowerCase().includes(q);
  });
  const active = data.walkIns.find(w => w.id === activeId) || data.walkIns[0];
  const lastName = active.name.split(' ').slice(-1)[0];

  const card = {
    background:'rgba(255,253,249,0.74)',
    border:'1px solid var(--line)',
    borderRadius:22,
    boxShadow:'0 22px 54px rgba(40,30,12,0.07), inset 0 1px 0 rgba(255,255,255,0.7)',
    backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
  };
  const eyebrow = { fontSize:12.5, letterSpacing:'0.28em', color:'var(--slate)' };
  // glossy beveled gold coin avatar (reference look) — bezel ring via layered shadow
  const Coin = ({ size, fs, initials }) => (
    <div style={{ width:size, height:size, borderRadius:'50%', flex:'0 0 auto',
      display:'flex', alignItems:'center', justifyContent:'center',
      background:'radial-gradient(circle at 38% 30%, #fbeec4 0%, var(--gold) 44%, var(--gold-deep) 100%)',
      boxShadow:'0 0 0 '+Math.round(size*0.045)+'px rgba(255,255,255,0.7), 0 0 0 '+Math.round(size*0.07)+'px var(--gold-soft), inset 0 2px 7px rgba(255,255,255,0.65), inset 0 -'+Math.round(size*0.08)+'px '+Math.round(size*0.16)+'px rgba(120,84,20,0.42), 0 '+Math.round(size*0.14)+'px '+Math.round(size*0.3)+'px rgba(176,138,63,0.32)' }}>
      <span className="serif" style={{ fontSize:fs, color:'#3a2c10', letterSpacing:'0.02em' }}>{initials}</span>
    </div>
  );

  return (
    <div data-crm="1" style={{
      position:'absolute', left:0, top:0, bottom:0, width:PANEL_W, zIndex:50, overflow:'hidden',
      background:'linear-gradient(135deg, var(--ivory) 0%, var(--ivory-2) 46%, var(--ivory-3) 100%)',
      color:'var(--ink)',
      borderRight:'1px solid var(--line)',
      boxShadow:'28px 0 80px rgba(40,30,12,0.18)',
      animation:'uniCrmPanelIn 520ms cubic-bezier(0.22,1,0.36,1) both',
    }}>
      {/* faint cosmic backdrop kept from home for continuity */}
      <div style={{position:'absolute', inset:0, pointerEvents:'none',
        background:'radial-gradient(ellipse at 78% 8%, rgba(232,215,168,0.20) 0%, transparent 55%)'}}/>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div style={{position:'absolute', top:46, left:CRM_PAD, right:CRM_PAD, display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
        <div style={{display:'flex', alignItems:'flex-start', gap:22}}>
          {/* VG · Venus Group layered monogram */}
          <div style={{position:'relative', width:64, height:64, flex:'0 0 auto', marginTop:6}}>
            <span className="serif" style={{position:'absolute', left:0, top:-8, fontSize:58, fontWeight:300, color:'var(--gold-deep)', lineHeight:1}}>V</span>
            <span className="serif" style={{position:'absolute', left:27, top:8, fontSize:42, fontWeight:300, color:'var(--gold)', lineHeight:1}}>G</span>
          </div>
          <div>
            <div className="mono" style={{...eyebrow, color:'var(--gold-deep)'}}>VENUS GROUP · NEHRU NAGAR · CONSOLE</div>
            <h1 className="serif" style={{margin:'10px 0 0', fontSize:62, fontWeight:300, letterSpacing:'-0.03em', lineHeight:0.9}}>
              mini CRM
            </h1>
            <div className="serif" style={{marginTop:10, fontSize:20, fontStyle:'italic', color:'var(--graphite)'}}>
              Today’s walk-ins · journeys · recommended units
            </div>
          </div>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div className="mono" style={{display:'flex', alignItems:'center', gap:9,
            background:'rgba(255,255,255,0.6)', border:'1px solid var(--line)', borderRadius:999,
            padding:'12px 18px', fontSize:12.5, letterSpacing:'0.16em', color:'var(--graphite)'}}>
            <span style={{width:9, height:9, borderRadius:'50%', background:'#7bb661', boxShadow:'0 0 10px rgba(123,182,97,0.8)'}}/>
            System Online
          </div>
          <button onClick={()=>{ setReport(null); setView('reports'); }} className="mono" style={{
            display:'flex', alignItems:'center', gap:10, cursor:'pointer',
            background:'rgba(255,255,255,0.7)', border:'1px solid var(--line)',
            borderRadius:999, padding:'12px 18px', fontSize:13, letterSpacing:'0.2em',
            color:'var(--ink)', boxShadow:'0 8px 20px rgba(40,30,12,0.08)',
          }}><span style={{width:18, height:18}}><SdMiniIcon type="report"/></span>REPORTS{sess.getHistory().length ? ` · ${sess.getHistory().length}` : ''}</button>
          <button onClick={onClose} className="mono" style={{
            display:'flex', alignItems:'center', gap:10, cursor:'pointer',
            background:'rgba(255,255,255,0.7)', border:'1px solid var(--line)',
            borderRadius:999, padding:'12px 20px', fontSize:13, letterSpacing:'0.22em',
            color:'var(--ink)', boxShadow:'0 8px 20px rgba(40,30,12,0.08)',
          }}><span style={{width:18, height:18}}><SdMiniIcon type="arrowleft"/></span>BACK TO HOME</button>
        </div>
      </div>

      {/* centered gold accent under the title */}
      <div style={{position:'absolute', top:150, left:'50%', transform:'translateX(-50%)', width:170, height:3,
        borderRadius:2, background:'linear-gradient(90deg, transparent, var(--gold) 30%, var(--gold) 70%, transparent)', opacity:0.9}}/>

      {!live && (<React.Fragment>
      {/* ════════════════════════════════════════════════════════════════
          FULL HEADER · three sections:
            §1 walk-ins-today metadata + stage filter
            §2 customer runner strip (the live list, horizontally scrolling)
            §3 prominent search
         ════════════════════════════════════════════════════════════════ */}
      <div style={{position:'absolute', top:188, left:CRM_PAD, right:CRM_PAD, height:268, display:'flex', gap:20, alignItems:'stretch'}}>

        {/* §1 — WALK-INS TODAY (own card) */}
        <div style={{...card, flex:'0 0 344px', padding:'24px 26px', display:'flex', flexDirection:'column'}}>
          <div className="mono" style={{...eyebrow, fontSize:12, letterSpacing:'0.22em', color:'var(--gold-deep)'}}>WALK-INS · TODAY</div>
          <div style={{display:'flex', alignItems:'flex-end', gap:24, marginTop:18}}>
            {[
              { v:data.stats.walkInsToday, k:'TOTAL',   c:'var(--ink)' },
              { v:data.stats.liveNow,      k:'LIVE',    c:'var(--gold-deep)' },
              { v:data.stats.awaitingSales,k:'WAITING', c:'var(--venus-red)' },
            ].map((s,i) => (
              <div key={i} style={{display:'flex', flexDirection:'column'}}>
                <div className="serif" style={{fontSize:50, fontWeight:300, lineHeight:0.8, color:s.c}}>{s.v}</div>
                <div className="mono" style={{fontSize:10.5, letterSpacing:'0.2em', color:'var(--slate)', marginTop:9}}>{s.k}</div>
              </div>
            ))}
          </div>
          {/* compact stage filter — sized to keep 3 per row, 2 rows */}
          <div style={{display:'flex', flexWrap:'wrap', gap:6, marginTop:'auto'}}>
            {data.stages.filter(s => s.key==='all' || s.count>0).map(s => {
              const on = filter === s.key;
              return (
                <button key={s.key} onClick={()=>setFilter(s.key)} style={{
                  display:'flex', alignItems:'center', gap:5, cursor:'pointer',
                  padding:'6px 10px', borderRadius:999, fontSize:11.5, whiteSpace:'nowrap',
                  background: on ? 'var(--ink)' : 'rgba(255,255,255,0.6)',
                  color: on ? 'var(--ivory)' : 'var(--graphite)',
                  border:'1px solid '+(on ? 'var(--ink)' : 'var(--line)'), transition:'all 200ms',
                }}>
                  <span style={{width:6, height:6, borderRadius:'50%', background:s.dot, flex:'0 0 auto'}}/>
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* §2 — LIVE FLOOR runner strip (own card) */}
        <div style={{...card, flex:'1 1 auto', minWidth:0, padding:'24px 24px', display:'flex', flexDirection:'column'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
            <div className="mono" style={{...eyebrow, fontSize:12, letterSpacing:'0.22em', color:'var(--gold-deep)'}}>LIVE FLOOR · {list.length} SHOWN</div>
            <div className="mono" style={{display:'flex', alignItems:'center', gap:7, fontSize:10.5, letterSpacing:'0.16em', color:'var(--slate)'}}>
              AUTO-REFRESHING
              <span style={{width:7, height:7, borderRadius:'50%', background:'#7bb661', boxShadow:'0 0 8px rgba(123,182,97,0.8)', animation:'locLive 1.6s ease-in-out infinite'}}/>
            </div>
          </div>
          <div className="uni-crm-hscroll" style={{display:'flex', gap:13, marginTop:16, overflowX:'auto', overflowY:'hidden', paddingBottom:10, flex:'1 1 auto', alignItems:'stretch'}}>
            {list.map(w => {
              const on = w.id === activeId; const st = sdStage(w.stage);
              return (
                <button key={w.id} onClick={()=>{ setActiveId(w.id); window.UNI_SESSION.setCustomer(w); }} style={{
                  flex:'0 0 auto', width:206, textAlign:'left', cursor:'pointer',
                  display:'flex', flexDirection:'column', gap:11, padding:'15px 16px', borderRadius:16,
                  background: on ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.5)',
                  border:'1px solid '+(on ? 'var(--gold)' : 'var(--line)'),
                  boxShadow: on ? '0 14px 30px rgba(176,138,63,0.18)' : 'none', transition:'all 220ms',
                }}>
                  <div style={{display:'flex', alignItems:'center', gap:12}}>
                    <Coin size={42} fs={17} initials={w.initials}/>
                    <div style={{minWidth:0}}>
                      <div className="serif" style={{fontSize:21, lineHeight:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{w.name}</div>
                      <div className="mono" style={{fontSize:10.5, letterSpacing:'0.12em', color:'var(--slate)', marginTop:5}}>{w.ago}</div>
                    </div>
                  </div>
                  <div className="serif" style={{fontSize:21, color:'var(--ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{w.config}</div>
                  <div style={{display:'flex', alignItems:'center', gap:7}}>
                    <span style={{width:7, height:7, borderRadius:'50%', background:st.dot}}/>
                    <span className="mono" style={{fontSize:10.5, letterSpacing:'0.14em', color:'var(--graphite)'}}>{st.label.toUpperCase()}</span>
                  </div>
                </button>
              );
            })}
            {list.length === 0 && <div style={{alignSelf:'center', color:'var(--slate)', fontSize:16, padding:'0 20px'}}>No walk-ins in this stage.</div>}
          </div>
        </div>

        {/* §3 — FIND A WALK-IN (own card) */}
        <div style={{...card, flex:'0 0 372px', padding:'24px 26px', display:'flex', flexDirection:'column', justifyContent:'center'}}>
          <div className="mono" style={{...eyebrow, fontSize:12, letterSpacing:'0.22em', color:'var(--gold-deep)'}}>FIND A WALK-IN</div>
          <div style={{display:'flex', alignItems:'center', gap:13, marginTop:16,
            background:'rgba(255,255,255,0.85)', border:'1.5px solid '+(q ? 'var(--gold)' : 'var(--line)'), borderRadius:14, padding:'18px 18px',
            boxShadow: q ? '0 8px 24px rgba(176,138,63,0.16)' : '0 4px 14px rgba(40,30,12,0.05)', transition:'all 200ms'}}>
            <div style={{width:24, height:24, borderRadius:'50%', flex:'0 0 auto', display:'flex', alignItems:'center', justifyContent:'center',
              background:'rgba(201,160,94,0.14)', color: q ? 'var(--gold-deep)' : 'var(--slate)'}}>
              <div style={{width:15, height:15}}><SdMiniIcon type="search"/></div>
            </div>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Name, phone, unit interest…"
              style={{flex:'1 1 auto', minWidth:0, border:'none', outline:'none', background:'transparent', fontSize:18, color:'var(--ink)', fontFamily:'inherit'}}/>
            {q && <button onClick={()=>setQuery('')} aria-label="Clear" style={{flex:'0 0 auto', cursor:'pointer', border:'none', background:'rgba(10,10,10,0.05)', borderRadius:999, width:30, height:30, color:'var(--slate)', fontSize:15, lineHeight:1}}>✕</button>}
          </div>
          <div className="mono" style={{fontSize:11, letterSpacing:'0.14em', color:'var(--slate)', marginTop:14}}>Tap a customer to load their profile →</div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          BOTTOM 60% · two fields — LEFT customer profile + actions,
          RIGHT GRE interest + recommended matches.
         ════════════════════════════════════════════════════════════════ */}
      <div style={{position:'absolute', top:486, left:CRM_PAD, right:CRM_PAD, bottom:44, display:'flex', gap:24}}>

        {/* LEFT — customer profile card + action buttons */}
        <div style={{flex:'0 0 528px', display:'flex', flexDirection:'column', gap:18, minHeight:0}}>
          <div style={{...card, padding:'32px 32px', flex:'1 1 auto', display:'flex', flexDirection:'column', minHeight:0, overflow:'hidden'}}>
            {/* identity */}
            <div style={{display:'flex', alignItems:'center', gap:22}}>
              <Coin size={92} fs={38} initials={active.initials}/>
              <div style={{minWidth:0}}>
                <div className="serif" style={{fontSize:42, fontWeight:300, lineHeight:1}}>{active.name}</div>
                <div style={{display:'flex', alignItems:'center', gap:10, marginTop:13}}>
                  <span style={{display:'inline-flex', alignItems:'center', gap:7, padding:'5px 12px', borderRadius:999,
                    background:'rgba(10,10,10,0.04)', border:'1px solid var(--line)'}}>
                    <span style={{width:8, height:8, borderRadius:'50%', background:sdStage(active.stage).dot}}/>
                    <span className="mono" style={{fontSize:11.5, letterSpacing:'0.16em', color:'var(--graphite)'}}>{sdStage(active.stage).label.toUpperCase()}</span>
                  </span>
                  <span className="mono" style={{fontSize:12, letterSpacing:'0.14em', color:'var(--slate)'}}>{active.id}</span>
                </div>
              </div>
            </div>

            {/* contact + meta rows — each with a leading glyph */}
            <div style={{marginTop:26}}>
              {[
                ['phone','PHONE', active.phone], ['mail','EMAIL', active.email],
                ['user','ASSIGNED', active.agent || 'Unassigned'], ['clock','SESSION', active.session],
                ['link','SOURCE', active.prefs.source],
              ].map(([ic,k,v],i) => (
                <div key={k} style={{display:'flex', alignItems:'center', gap:14,
                  padding:'15px 0', borderTop: i ? '1px solid var(--line)' : 'none'}}>
                  <span style={{width:19, height:19, flex:'0 0 auto', color:'var(--gold-deep)'}}><SdMiniIcon type={ic}/></span>
                  <div className="mono" style={{fontSize:12, letterSpacing:'0.2em', color:'var(--slate)', flex:'0 0 auto'}}>{k}</div>
                  <div className="serif" style={{fontSize:20, color:'var(--ink)', textAlign:'right', marginLeft:'auto', minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{v}</div>
                </div>
              ))}
            </div>

            {/* quiet spacer — keeps the action grid anchored to the card base on
                taller canvases without leaving the rows stranded mid-card. */}
            <div style={{flex:'1 1 auto', minHeight:18, display:'flex', alignItems:'center'}}>
              <div style={{width:'100%', height:1, background:'linear-gradient(90deg, transparent, var(--line) 18%, var(--line) 82%, transparent)', opacity:0.7}}/>
            </div>

            {/* action buttons */}
            <div style={{paddingTop:20, display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:11}}>
              {[
                { t:'phone', l:'Call',     href:'tel:'+active.phone.replace(/[^+\d]/g,'') },
                { t:'sms',   l:'SMS',      href:'sms:'+active.phone.replace(/[^+\d]/g,'') },
                { t:'mail',  l:'Email',    href:'mailto:'+active.email },
                { t:'whatsapp', l:'WhatsApp', href:'https://wa.me/'+active.phone.replace(/[^\d]/g,'') },
              ].map(a => (
                <a key={a.l} href={a.href} target="_blank" rel="noreferrer" className="mono" style={{
                  display:'flex', flexDirection:'column', alignItems:'center', gap:8, textDecoration:'none',
                  padding:'15px 6px', borderRadius:13, background:'rgba(255,255,255,0.7)', border:'1px solid var(--line)',
                  color:'var(--ink)', transition:'all 200ms',
                }}
                  onMouseEnter={e=>{e.currentTarget.style.background='var(--ink)'; e.currentTarget.style.color='var(--ivory)';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.7)'; e.currentTarget.style.color='var(--ink)';}}>
                  <span style={{width:22, height:22, color:'inherit'}}><SdMiniIcon type={a.t}/></span>
                  <span style={{fontSize:11.5, letterSpacing:'0.14em'}}>{a.l.toUpperCase()}</span>
                </a>
              ))}
            </div>
          </div>
          {/* primary CTA — begins a tracked journey, then hands the
              personalised home to the customer (closes the console). */}
          <button onClick={()=>{ window.UNI_SESSION.start(active); onClose(); }} className="mono" style={{
            flex:'0 0 auto', cursor:'pointer', width:'100%',
            background:'linear-gradient(135deg, var(--gold), var(--gold-deep))', border:'1px solid var(--gold-deep)',
            borderRadius:15, padding:'18px', fontSize:15, letterSpacing:'0.18em', color:'#2a1d05', fontWeight:600,
            boxShadow:'0 12px 28px rgba(176,138,63,0.30)',
          }}>START JOURNEY WITH {lastName.toUpperCase()} →</button>
        </div>

        {/* RIGHT — GRE interest + recommended matches (scrolls within) */}
        <div className="uni-crm-scroll" style={{flex:'1 1 auto', minWidth:0, minHeight:0, overflowY:'auto', display:'flex', flexDirection:'column', gap:18, paddingRight:6}}>

          {/* GRE customer-interest summary */}
          <div style={{...card, padding:'28px 32px', flex:'0 0 auto'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
              <div>
                <div className="mono" style={{...eyebrow, color:'var(--gold-deep)'}}>GRE · CUSTOMER INTEREST</div>
                <div className="serif" style={{fontSize:31, marginTop:8}}>What {lastName} is looking for</div>
              </div>
              <div className="mono" style={{fontSize:12.5, letterSpacing:'0.18em', color:'var(--slate)'}}>INTENT · {active.intent.toUpperCase()}</div>
            </div>
            {/* the three headline interest points — each with a glyph */}
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16, marginTop:22}}>
              {[
                ['BHK / TYPOLOGY', active.prefs.typology, 'building'],
                ['SIZE SOUGHT',    active.prefs.sqft,     'ruler'],
                ['BUDGET',         active.prefs.budget,   'rupee'],
              ].map(([k,v,ic]) => (
                <div key={k} style={{padding:'18px 20px', borderRadius:16, background:'rgba(201,160,94,0.10)', border:'1px solid var(--gold-soft)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8}}>
                    <div className="mono" style={{fontSize:11, letterSpacing:'0.18em', color:'var(--gold-deep)'}}>{k}</div>
                    <span style={{width:30, height:30, borderRadius:9, flex:'0 0 auto', display:'flex', alignItems:'center', justifyContent:'center',
                      background:'rgba(255,255,255,0.7)', border:'1px solid var(--gold-soft)', color:'var(--gold-deep)'}}>
                      <span style={{width:17, height:17}}><SdMiniIcon type={ic}/></span>
                    </span>
                  </div>
                  <div className="serif" style={{fontSize:27, color:'var(--ink)', marginTop:10, lineHeight:1.08}}>{v}</div>
                </div>
              ))}
            </div>
            {/* secondary interest meta — small glyph + label + value */}
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'16px 26px', marginTop:24}}>
              {[
                ['PURPOSE', active.prefs.purpose, 'compass'], ['TIMELINE', active.prefs.timeline, 'calendar'], ['FAMILY', active.prefs.family, 'users'],
              ].map(([k,v,ic]) => (
                <div key={k}>
                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                    <span style={{width:16, height:16, flex:'0 0 auto', color:'var(--slate)'}}><SdMiniIcon type={ic}/></span>
                    <div className="mono" style={{fontSize:11.5, letterSpacing:'0.2em', color:'var(--slate)'}}>{k}</div>
                  </div>
                  <div className="serif" style={{fontSize:20, color:'var(--ink)', marginTop:7, lineHeight:1.15}}>{v}</div>
                </div>
              ))}
            </div>
            {/* must-haves — each chip carries a fitting glyph */}
            <div style={{display:'flex', flexWrap:'wrap', gap:9, marginTop:22}}>
              {active.prefs.mustHaves.map(m => (
                <span key={m} style={{display:'inline-flex', alignItems:'center', gap:8, padding:'8px 15px', borderRadius:999, fontSize:14,
                  background:'rgba(255,255,255,0.6)', border:'1px solid var(--gold-soft)', color:'var(--gold-deep)'}}>
                  <span style={{width:15, height:15, flex:'0 0 auto'}}><SdMiniIcon type={mustHaveIcon(m)}/></span>{m}</span>
              ))}
            </div>
          </div>

          {/* recommended matches */}
          <div style={{...card, padding:'24px 32px', flex:'0 0 auto'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
              <div>
                <div className="mono" style={{...eyebrow, color:'var(--gold-deep)'}}>RECOMMENDED MATCHES</div>
                <div className="serif" style={{fontSize:26, marginTop:8}}>{active.matches.length} units fit this profile</div>
              </div>
              <div className="mono" style={{display:'flex', alignItems:'center', gap:8, fontSize:13, letterSpacing:'0.16em', color:'var(--gold-deep)'}}>
                <span style={{width:16, height:16}}><SdMiniIcon type="sparkle"/></span>AI MATCH · {active.matchScore}% FIT</div>
            </div>
            <div style={{marginTop:18, display:'flex', flexDirection:'column', gap:12}}>
              {active.matches.map((u,i) => (
                <div key={u.no} style={{display:'flex', alignItems:'center', gap:16,
                  padding:'15px 20px', borderRadius:14, background:'rgba(255,255,255,0.55)', border:'1px solid var(--line)'}}>
                  <div className="mono" style={{width:34, height:34, borderRadius:'50%', flex:'0 0 auto',
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:14,
                    background:'rgba(201,160,94,0.16)', border:'1px solid var(--gold-soft)', color:'var(--gold-deep)'}}>{i+1}</div>
                  <div className="mono" style={{fontSize:17, letterSpacing:'0.08em', color:'var(--ink)', width:74, flex:'0 0 auto'}}>{u.no}</div>
                  <div style={{flex:'1 1 auto', minWidth:0}}>
                    <div className="serif" style={{fontSize:20, lineHeight:1.1}}>{u.tower} · {u.floor} · {u.bhk}</div>
                    <div style={{fontSize:14.5, color:'var(--graphite)', marginTop:3}}>{u.view} · {u.sqft}</div>
                  </div>
                  <div className="serif" style={{fontSize:24, color:'var(--gold-deep)', flex:'0 0 auto'}}>{u.price}</div>
                  <div style={{flex:'0 0 auto', display:'flex', flexDirection:'column', alignItems:'center', gap:1,
                    padding:'7px 13px', borderRadius:12, minWidth:64,
                    background:'rgba(123,182,97,0.14)', border:'1px solid rgba(123,182,97,0.38)'}}>
                    <div className="mono" style={{fontSize:9.5, letterSpacing:'0.16em', color:'#5b8a42'}}>MATCH</div>
                    <div className="serif" style={{fontSize:20, color:'#4e7d3a', lineHeight:1}}>{u.match}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </React.Fragment>)}

      {live && <SdActivePanel sess={sess} record={liveRecord} onEnd={()=>setView('wrapup')}/>}

      {view==='wrapup' && (
        <SdWrapForm record={liveRecord} onCancel={()=>setView(null)}
          onSubmit={(wrap)=>{ const rpt = sess.end(wrap); setReport(rpt); setView('report'); }}/>
      )}
      {view==='report' && <SdReportView report={report || sess.getHistory()[0]} onClose={()=>{ setView(null); setReport(null); }}/>}
      {view==='reports' && (
        <SdReportsList history={sess.getHistory()} onClose={()=>setView(null)}
          onOpen={(r)=>{ setReport(r); setView('report'); }}/>
      )}

    </div>
  );
}

// ── BOTTOM FACT BAR ──────────────────────────────────────────────────────────
// A refined horizontal strip of real project facts, anchored to the bottom. It
// appears ONLY as the canvas grows past the primary 16:10 tablet (gated by
// `dens`: 0 at H=1600 → 1 at H=1920), so it fills the extra 4:3 bottom space on
// iPad Pro and leaves the Tab S7 layout untouched. Facts come straight from
// PROJECT.stats (no fabrication).
function BottomMeta({ eT, dens }) {
  const d = clamp(dens);
  if (d <= 0.02) return null;                       // 16:10 tablet: absent
  const reveal = clamp((eT - 1.5) / 0.8);
  const appear = reveal * d;
  if (appear <= 0.001) return null;
  const lift = (1 - reveal) * 16;
  const s = PROJECT.stats;
  const facts = [
    { v: String(s.towers),    k: 'TOWERS' },
    { v: String(s.homes),     k: 'RESIDENCES' },
    { v: String(s.amenities), k: 'AMENITIES' },
    { v: s.saleable,          k: 'SALEABLE AREA' },
    { v: 'All 4 BHK',         k: 'TYPOLOGY' },
    { v: PROJECT.micromarket + ', ' + PROJECT.city, k: 'LOCATION' },
  ];
  const vSize = Math.round(34 + d * 7);
  const kSize = Math.round(12 + d * 1.5);
  return (
    <div style={{
      position:'absolute', left:116, right:76, bottom: Math.round(42 + d * 26),
      zIndex:5, opacity: appear, transform:`translateY(${lift}px)`, pointerEvents:'none',
    }}>
      <div style={{height:1, marginBottom: Math.round(20 + d * 8),
        background:'linear-gradient(90deg, rgba(176,138,63,0) 0%, rgba(176,138,63,0.32) 12%, rgba(176,138,63,0.32) 88%, rgba(176,138,63,0) 100%)'}}/>
      <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:24}}>
        {facts.map(f => (
          <div key={f.k} style={{display:'flex', flexDirection:'column', gap:7, alignItems:'flex-start'}}>
            <div className="serif" style={{fontSize:vSize, fontWeight:400, color:'var(--ink)', lineHeight:1, letterSpacing:'-0.01em', whiteSpace:'nowrap'}}>{f.v}</div>
            <div className="mono" style={{fontSize:kSize, letterSpacing:'0.22em', color:'var(--gold-deep)', whiteSpace:'nowrap'}}>{f.k}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.Home = Home;
window.SalesDesk = SalesDesk;
window.UIcons = UIcons;
window.HomeApartment10 = Apartment10;
window.HomeCosmicDust  = CosmicDust;
