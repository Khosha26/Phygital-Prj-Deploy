// Splash — LIGHT-THEME variant (cream paper substrate, dark gold accents).
//
// Same cinematic beats as the dark version, color-inverted for the bright
// tablet experience: ignition → cosmos → particles converge to the LOGO IMAGE
// pixel positions → real client logo materialises over the constellation →
// subtitle → venus credit → warp out into the EXPLORE puzzle.
//
// The dark version is preserved verbatim at `splash-dark.jsx` if you ever
// want to switch back — just swap the script tag in the HTML.
//
// Particles sample the actual `universe-logo-transparent.png` so the
// constellation traces the real client logo silhouette before the image
// itself fades in.

function ensureSplashKeys() {
  if (document.getElementById('splash-light-keys')) return;
  const s = document.createElement('style');
  s.id = 'splash-light-keys';
  s.textContent = `
    @keyframes spOrbitSpin    { from { transform: rotate(0deg);  } to { transform: rotate(360deg);  } }
    @keyframes spOrbitSpinRev { from { transform: rotate(0deg);  } to { transform: rotate(-360deg); } }
    @keyframes spHudPulse     { 0%,100% { opacity: 0.55; } 50% { opacity: 0.95; } }
    @keyframes spDotBreatheLight {
      0%,100% { transform: scale(1);    filter: drop-shadow(0 0 14px rgba(176,138,63,0.65)); }
      50%     { transform: scale(1.18); filter: drop-shadow(0 0 28px rgba(176,138,63,0.92)); }
    }
  `;
  document.head.appendChild(s);
}

// Logo display geometry inside the canvas (2560×1600). Centred slightly above middle.
const LOGO_W   = 720;
const LOGO_H   = LOGO_W * (787/1400);    // ≈ 405
const LOGO_CX  = 1280;
const LOGO_CY  = 760;
const LOGO_LFT = LOGO_CX - LOGO_W/2;
const LOGO_TOP = LOGO_CY - LOGO_H/2;

function Splash() {
  const t = useLoop();
  const [navigated, setNavigated] = React.useState(false);

  // Sample logo image pixels → particle target positions in canvas coords.
  const [logoTargets, setLogoTargets] = React.useState(null);
  React.useEffect(() => {
    ensureSplashKeys();
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement('canvas');
      cv.width = img.naturalWidth; cv.height = img.naturalHeight;
      const ctx = cv.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, cv.width, cv.height).data;
      const stride = 7;
      const out = [];
      for (let y = 0; y < cv.height; y += stride) {
        for (let x = 0; x < cv.width; x += stride) {
          const a = data[(y * cv.width + x) * 4 + 3];
          if (a > 180) {
            out.push({
              x: LOGO_LFT + (x / cv.width)  * LOGO_W,
              y: LOGO_TOP + (y / cv.height) * LOGO_H,
            });
          }
        }
      }
      for (let i = out.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [out[i], out[j]] = [out[j], out[i]];
      }
      setLogoTargets(out);
    };
    img.src = 'assets/brand/universe-logo-transparent.png';
  }, []);

  React.useEffect(() => {
    // Once the splash settles, hand off to the EXPLORE puzzle screen.
    const id = setTimeout(() => { setNavigated(true); navigate('explore'); }, 7800);
    return () => clearTimeout(id);
  }, []);

  // ---------- timing schedule ----------
  const ignite     = clamp((t - 0.0) / 0.5);
  const bloomFlash = clamp((t - 0.45)/0.18) * (1 - clamp((t - 0.63)/0.5));
  const cosmosP    = clamp((t - 0.6) / 1.2);
  const horizonP   = clamp((t - 0.7) / 1.1);
  const hudP       = clamp((t - 1.0) / 1.0);
  const convergeP  = clamp((t - 1.8) / 1.4);
  const bracketsP  = clamp((t - 2.2) / 0.6) * (1 - clamp((t - 3.6)/0.6));
  const ringsP     = clamp((t - 2.6) / 1.0);
  const logoP      = clamp((t - 3.4) / 1.2);
  const dispersP   = clamp((t - 4.2) / 0.9);
  const subP       = clamp((t - 4.7) / 0.9);
  const credP      = clamp((t - 5.4) / 1.0);
  const warpP      = clamp((t - 7.1) / 0.7);
  const fade       = navigated ? clamp((t - 7.3) / 0.5) : 0;

  // ---------- particle field ----------
  const N = 220;
  const particles = React.useMemo(() => Array.from({length:N}).map((_,i) => {
    const a = (i * 137.5) * Math.PI / 180;
    const r = 520 + (i*47 % 980);
    return {
      ox: LOGO_CX + Math.cos(a) * r,
      oy: LOGO_CY + Math.sin(a) * r * 0.7,
      seed: i,
      r: 0.6 + (i%4) * 0.45,
    };
  }), []);

  const targetFor = (p, i) => {
    if (logoTargets && logoTargets.length) {
      return logoTargets[i % logoTargets.length];
    }
    const a = (i * 137.5) * Math.PI / 180;
    return { x: LOGO_CX + Math.cos(a)*60, y: LOGO_CY + Math.sin(a)*60 };
  };

  const positions = particles.map((p, i) => {
    const tgt = targetFor(p, i);
    let cx, cy;
    if (t < 1.8) {
      const k = clamp((t - 0.6) / 1.2);
      const baseX = lerp(p.ox + (p.seed%7)*8, p.ox + Math.sin(t*0.7 + p.seed)*22, k);
      const baseY = lerp(p.oy + (p.seed%5)*6, p.oy + Math.cos(t*0.6 + p.seed)*18, k);
      cx = baseX; cy = baseY;
    } else if (t < 3.2) {
      const k = ease.inOutCubic((t - 1.8) / 1.4);
      cx = lerp(p.ox, tgt.x, k);
      cy = lerp(p.oy, tgt.y, k);
    } else if (t < 4.2) {
      cx = tgt.x + Math.sin(t*1.6 + p.seed) * 1.6;
      cy = tgt.y + Math.cos(t*1.4 + p.seed) * 1.6;
    } else {
      const k = ease.outQuart(dispersP);
      const a = Math.atan2(tgt.y - LOGO_CY, tgt.x - LOGO_CX) + (p.seed%7)*0.07;
      const dx = tgt.x + Math.cos(a) * 220 * k;
      const dy = tgt.y + Math.sin(a) * 220 * k;
      cx = dx; cy = dy;
    }
    return { x: cx, y: cy, r: p.r, seed: p.seed };
  });

  const streaks = (t > 1.8 && t < 3.2) ? particles.map((p, i) => {
    const tgt = targetFor(p, i);
    const k = ease.inOutCubic((t - 1.8) / 1.4);
    const cx = lerp(p.ox, tgt.x, k);
    const cy = lerp(p.oy, tgt.y, k);
    const back = Math.max(0, k - 0.12);
    const bx = lerp(p.ox, tgt.x, back);
    const by = lerp(p.oy, tgt.y, back);
    return { x1: bx, y1: by, x2: cx, y2: cy, op: (1 - Math.abs(k - 0.5) * 1.4) * 0.55 };
  }) : [];

  const particleAlpha = 1 - logoP * 0.55;

  const tw = (text, p) => text.slice(0, Math.round(text.length * clamp(p)));

  const warpScale = 1 + warpP * 0.42;

  // === LIGHT theme palette ================================================
  const PARTICLE_COL  = '#b08a3f';                  // dark gold dots on cream
  const STREAK_COL    = '#c9a05e';
  const LINE_COL      = '#b08a3f';
  const HUD_COL       = 'rgba(10,10,10,0.55)';
  const HUD_DOT       = '#b08a3f';

  return (
    <div style={{
      position:'absolute', inset:0,
      background:'radial-gradient(ellipse 70% 60% at 50% 48%, #ffffff 0%, #fff8ec 70%, #f3eddc 100%)',
      color:'#0a0a0a', overflow:'hidden',
      opacity: 1 - fade, transition:'opacity 0.55s ease',
    }}>
      <div style={{position:'absolute', inset:0, transform:`scale(${warpScale})`, transformOrigin:'50% 49%', transition:'transform 60ms linear'}}>

        {/* warm vignette — soft cream rim around an even brighter centre */}
        <div style={{position:'absolute', inset:0,
          background:'radial-gradient(circle at 50% 50%, transparent 30%, rgba(180,140,50,0.06) 75%, rgba(120,90,30,0.10) 100%)',
          pointerEvents:'none'}}/>

        {/* gold core glow that intensifies as logo materialises */}
        <div style={{
          position:'absolute', inset:0,
          background:`radial-gradient(ellipse 38% 32% at 50% 47%, rgba(216,181,115,${0.10 + 0.30*logoP}), transparent 70%)`,
          pointerEvents:'none',
        }}/>

        {/* pre-ignition pulse — a single dark-gold dot pulsing where the logo will appear */}
        {t < 0.7 && (
          <div style={{
            position:'absolute', left:'50%', top:'47%',
            width:15, height:15, marginLeft:-7.5, marginTop:-7.5,
            borderRadius:'50%', background:'#b08a3f',
            opacity: ignite,
            animation: 'spDotBreatheLight 0.8s ease-in-out infinite',
            boxShadow:'0 0 60px 10px rgba(176,138,63,0.55)',
          }}/>
        )}

        {/* bloom flash at ignition — cream burst over paper */}
        <div style={{
          position:'absolute', inset:0,
          background:'radial-gradient(circle at 50% 47%, rgba(245,228,180,0.78) 0%, rgba(216,181,115,0.42) 25%, transparent 55%)',
          opacity: bloomFlash * 0.85,
          pointerEvents:'none', mixBlendMode:'multiply',
        }}/>

        {/* horizon split line — dark gold across the page */}
        <div style={{
          position:'absolute', left:'50%', top:'47%',
          height:1, marginLeft:-1280*horizonP, width: 2560*horizonP,
          background:'linear-gradient(90deg, transparent, rgba(176,138,63,0.45) 18%, rgba(176,138,63,0.85) 50%, rgba(176,138,63,0.45) 82%, transparent)',
          opacity: 0.7 - 0.5*ringsP,
          boxShadow:'0 0 10px rgba(176,138,63,0.30)',
          pointerEvents:'none',
        }}/>

        {/* particles + connecting web + convergence streaks */}
        <svg viewBox="0 0 2560 1600" preserveAspectRatio="xMidYMid slice"
             style={{position:'absolute', inset:0, width:'100%', height:'100%', opacity: cosmosP * particleAlpha}}>
          {t < 3.4 && positions.map((a,i) => positions.slice(i+1, i+12).map((b,j) => {
            const d = Math.hypot(a.x-b.x, a.y-b.y);
            if (d > 110) return null;
            return <line key={`${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                         stroke={LINE_COL} strokeOpacity={0.32*(1-d/110)} strokeWidth="0.5"/>;
          }))}
          {streaks.map((s,i) => (
            <line key={`s${i}`} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                  stroke={STREAK_COL} strokeOpacity={s.op} strokeWidth="1"/>
          ))}
          {positions.map((p,i) => (
            <circle key={i} cx={p.x} cy={p.y} r={p.r}
                    fill={PARTICLE_COL}
                    opacity={(0.55 + 0.4*Math.sin(t*1.6 + p.seed))}/>
          ))}
        </svg>

        {/* orbital tick rings */}
        <svg viewBox="0 0 2560 1600" style={{position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', opacity: ringsP * 0.55 * (1 - logoP*0.4)}}>
          {[0,1,2].map(i => {
            const radius = 320 + i*88;
            const ticks = 60 + i*12;
            return (
              <g key={i} style={{transformOrigin:`${LOGO_CX}px ${LOGO_CY}px`, animation:`${i%2 ? 'spOrbitSpinRev' : 'spOrbitSpin'} ${48 + i*16}s linear infinite`}}>
                <circle cx={LOGO_CX} cy={LOGO_CY} r={radius} fill="none" stroke={LINE_COL} strokeWidth="0.5" strokeOpacity="0.18"/>
                {Array.from({length: ticks}).map((_,k) => {
                  const a = (k / ticks) * Math.PI * 2;
                  const major = k % 10 === 0;
                  const inner = radius - (major ? 11.5 : 5);
                  const outer = radius + (major ? 4 : 2);
                  return <line key={k}
                    x1={LOGO_CX + Math.cos(a)*inner} y1={LOGO_CY + Math.sin(a)*inner}
                    x2={LOGO_CX + Math.cos(a)*outer} y2={LOGO_CY + Math.sin(a)*outer}
                    stroke={LINE_COL} strokeWidth={major ? 1 : 0.5}
                    strokeOpacity={major ? 0.7 : 0.32}/>;
                })}
              </g>
            );
          })}
        </svg>

        {/* crosshair targeting brackets framing the logo */}
        <svg viewBox="0 0 2560 1600" style={{position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none'}}>
          {(() => {
            const rW = LOGO_W/2 + 63;
            const rH = LOGO_H/2 + 84;
            const tip = 38 * bracketsP;
            const op = bracketsP;
            const corners = [
              [LOGO_CX - rW, LOGO_CY - rH], [LOGO_CX + rW, LOGO_CY - rH],
              [LOGO_CX - rW, LOGO_CY + rH], [LOGO_CX + rW, LOGO_CY + rH]
            ];
            return corners.map(([x,y], i) => {
              const sx = i%2 === 0 ? 1 : -1;
              const sy = i < 2 ? 1 : -1;
              return (
                <g key={i} opacity={op}>
                  <line x1={x} y1={y} x2={x + sx*tip} y2={y} stroke={LINE_COL} strokeWidth="1.5"/>
                  <line x1={x} y1={y} x2={x} y2={y + sy*tip} stroke={LINE_COL} strokeWidth="1.5"/>
                  <circle cx={x} cy={y} r="3" fill={LINE_COL}/>
                </g>
              );
            });
          })()}
        </svg>

        {/* === REAL LOGO — monogram (gold) stacked over wordmark (black) === */}
        <div style={{
          position:'absolute',
          left: LOGO_LFT, top: LOGO_TOP,
          width: LOGO_W, height: LOGO_H,
          opacity: logoP,
          filter: `drop-shadow(0 0 ${28 * logoP}px rgba(176,138,63,${0.42*logoP}))`,
          transform: `scale(${0.96 + 0.04*logoP})`,
          transformOrigin: '50% 50%',
          transition: 'opacity 220ms ease, filter 220ms ease',
          pointerEvents:'none',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:21,
        }}>
          <UniverseMonogram size={294} progress={1} color="var(--gold-deep)"/>
          <UniverseWordmark size={84} color="var(--ink)"/>
        </div>

        {/* subtitle below the logo */}
        <div style={{
          position:'absolute', left:0, right:0,
          top: LOGO_TOP + LOGO_H + 38,
          display:'flex', justifyContent:'center',
          opacity: clamp(subP*1.3),
        }}>
          <div className="mono" style={{fontSize:19, letterSpacing:'0.42em', color:'rgba(10,10,10,0.65)', textTransform:'uppercase'}}>
            {tw('NEHRU NAGAR · AHMEDABAD · MMXXVI', subP)}
            <span style={{
              display:'inline-block', width:'0.55em', marginLeft:6,
              borderBottom:'1px solid #b08a3f',
              opacity: subP < 1 ? 0.5 + 0.5*Math.sin(t*8) : 0,
            }}>&nbsp;</span>
          </div>
        </div>

        {/* === VENUS CREDIT === */}
        <div style={{
          position:'absolute', left:0, right:0, bottom: 80,
          display:'flex', justifyContent:'center',
          opacity: credP, transform: `translateY(${(1-credP)*16}px)`,
        }}>
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:15}}>
            <div style={{height:1, width:63, background:'rgba(10,10,10,0.22)'}}/>
            <div className="mono" style={{fontSize:14, letterSpacing:'0.4em', color:'rgba(10,10,10,0.55)', textTransform:'uppercase'}}>
              A Venus Group of Companies project
            </div>
            <VenusWordmark size={29} color="#d63b50"/>
            <div className="serif" style={{fontSize:19, fontStyle:'italic', color:'rgba(10,10,10,0.55)'}}>
              35 years of timeless spaces
            </div>
          </div>
        </div>

        {/* === CORNER HUD CHROME === */}
        {(() => {
          const tlText = 'SALES SUITE · v1.0 · MMXXVI';
          const trText = 'LAT 23.0225° N · LON 72.5714° E';
          const blText = 'SEQ ∙ 0042 · TR-A1 · NEHRU NAGAR';
          const baseSty = {fontSize:14, letterSpacing:'0.32em', color:HUD_COL, textTransform:'uppercase', whiteSpace:'nowrap'};
          return (
            <>
              <div style={{position:'absolute', top: 48, left: 60, opacity: hudP, display:'flex', alignItems:'center', gap:15}}>
                <div style={{width:8, height:8, background:HUD_DOT,
                             animation:'spHudPulse 1.6s ease-in-out infinite',
                             boxShadow:'0 0 8px rgba(176,138,63,0.6)'}}/>
                <span className="mono" style={baseSty}>{tw(tlText, hudP)}</span>
              </div>
              <div style={{position:'absolute', top: 48, right: 60, opacity: hudP, display:'flex', alignItems:'center', gap:15}}>
                <span className="mono" style={baseSty}>{tw(trText, hudP)}</span>
                <div style={{width:8, height:8, border:'1px solid '+HUD_DOT, borderRadius:'50%',
                             animation:'spHudPulse 1.6s ease-in-out infinite'}}/>
              </div>
              <div style={{position:'absolute', bottom: 50, left: 60, opacity: hudP, display:'flex', alignItems:'center', gap:15}}>
                <span className="mono" style={baseSty}>{tw(blText, hudP)}</span>
              </div>
            </>
          );
        })()}

      </div>

      {/* exit flash — cream burst into the explore puzzle */}
      {warpP > 0 && (
        <div style={{
          position:'absolute', inset:0,
          background:'radial-gradient(circle at 50% 47%, rgba(255,250,235,0.95) 0%, rgba(232,216,179,0.5) 30%, transparent 60%)',
          opacity: warpP * 0.85,
          mixBlendMode:'screen', pointerEvents:'none',
        }}/>
      )}

      {/* skip CTA — explicit Explore handoff */}
      <div style={{position:'absolute', bottom: 48, right: 60, opacity: clamp((t-1.0)/0.6)}}>
        <Magnetic radius={130} strength={0.32}>
          <ShimmerSweep speed={1100} color="rgba(232,216,179,0.55)">
            <button onClick={() => { setNavigated(true); navigate('explore'); }} className="mono" style={{
              background:'transparent', border:'1px solid rgba(176,138,63,0.55)',
              color:'#b08a3f', padding:'15px 32px', borderRadius:105,
              fontSize:16, letterSpacing:'0.24em', textTransform:'uppercase',
              cursor:'pointer', fontWeight:600,
              transition:'background 240ms ease, border-color 240ms ease, color 240ms ease',
            }}
              onMouseEnter={ev=>{ ev.currentTarget.style.background='rgba(176,138,63,0.10)'; ev.currentTarget.style.borderColor='#b08a3f'; }}
              onMouseLeave={ev=>{ ev.currentTarget.style.background='transparent';            ev.currentTarget.style.borderColor='rgba(176,138,63,0.55)'; }}
            >Explore now →</button>
          </ShimmerSweep>
        </Magnetic>
      </div>
    </div>
  );
}

window.Splash = Splash;
