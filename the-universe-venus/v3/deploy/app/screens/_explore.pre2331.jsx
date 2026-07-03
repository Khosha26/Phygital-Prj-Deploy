// Explore — auto-assembling cosmic handoff between Splash and Home.
//
// Light theme. The 8 module pieces start scattered around the canvas. As soon
// as the screen loads they AUTO-FLY one-by-one into their orbital slots
// (timed sequence driven by useLoop). After the last piece lands the U
// monogram drops into the centre. Then a big gold "EXPLORE NOW →" CTA
// appears in the centre — a single tap takes the user to /home.
//
// The user is a spectator: pieces auto-place, no per-piece taps required.
// The headline morphs through three states (assembling → welcome → ready).
// Skip → CTA bottom-right is preserved.

const EXPLORE_KEYS_ID = 'uni-explore-puzzle-keys';
function ensureExploreKeys() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(EXPLORE_KEYS_ID)) return;
  const s = document.createElement('style');
  s.id = EXPLORE_KEYS_ID;
  s.textContent = `
    @keyframes uniSlotPulse {
      0%, 100% { box-shadow: 0 0 0 1px rgba(176,138,63,0.22), 0 0 14px rgba(232,215,168,0.30); }
      50%      { box-shadow: 0 0 0 1px rgba(176,138,63,0.55), 0 0 30px rgba(232,215,168,0.75); }
    }
    @keyframes uniPieceWiggle {
      0%, 100% { transform: rotate(var(--wig, 0deg)) translateY(0); }
      50%      { transform: rotate(calc(var(--wig, 0deg) * -0.7)) translateY(-6px); }
    }
    @keyframes uniPieceLock {
      0%   { box-shadow: 0 18px 36px rgba(50,32,12,0.20); }
      30%  { box-shadow: 0 0 0 12px rgba(232,215,168,0.32),
                          0 0 70px 20px rgba(232,215,168,0.55); }
      60%  { box-shadow: 0 0 0 22px rgba(232,215,168,0); }
      100% { box-shadow: 0 18px 36px rgba(50,32,12,0.22); }
    }
    @keyframes uniCenterDrop {
      0%   { transform: translate(-50%, -50%) translateY(-220px) scale(0.4) rotate(-22deg); opacity: 0; }
      55%  { transform: translate(-50%, -50%) translateY(10px)   scale(1.10) rotate(2deg);  opacity: 1; }
      75%  { transform: translate(-50%, -50%) translateY(-4px)   scale(0.97) rotate(0deg);  opacity: 1; }
      100% { transform: translate(-50%, -50%) translateY(0)      scale(1)    rotate(0deg);  opacity: 1; }
    }
    @keyframes uniCtaPulse {
      0%, 100% { box-shadow: 0 17px 38px rgba(176,138,63,0.47),
                              0 0 0 4px rgba(232,215,168,0.22),
                              0 0 60px rgba(232,215,168,0.36); }
      50%      { box-shadow: 0 17px 38px rgba(176,138,63,0.55),
                              0 0 0 8px rgba(232,215,168,0.34),
                              0 0 100px rgba(232,215,168,0.70); }
    }
    @keyframes uniCtaIn {
      0%   { opacity: 0; transform: translate(-50%, -50%) translateY(20px) scale(0.85); filter: blur(8px); }
      100% { opacity: 1; transform: translate(-50%, -50%) translateY(0)    scale(1);    filter: blur(0); }
    }
    @keyframes uniHintArrow {
      0%, 100% { transform: translateX(0); opacity: 0.7; }
      50%      { transform: translateX(8px); opacity: 1; }
    }
    @keyframes uniReadyHeadlineIn {
      0%   { opacity: 0; transform: translateY(10px); filter: blur(6px); }
      100% { opacity: 1; transform: translateY(0);    filter: blur(0); }
    }
  `;
  document.head.appendChild(s);
}

function Explore() {
  ensureExploreKeys();
  const t = useLoop();
  const [exiting, setExiting] = React.useState(false);
  const [bursts, fireBurst] = useBurst(900);
  const firedRef = React.useRef({});  // piece-landing burst dedupe
  const modules = PROJECT.modules;
  const UIcons = window.UIcons || {};
  const Apartment10 = window.HomeApartment10;
  const CosmicDust  = window.HomeCosmicDust;

  // Geometry — match Home so the transition feels like the puzzle settling.
  // CY tracks the LIVE canvas height so the cosmos sits optically centred and the
  // screen reads full at BOTH 16:10 (H 1600 → CY ≈ 832, unchanged) and 4:3 iPad
  // (H 1920 → CY ≈ 998) with no empty bottom band.
  const CANVAS_H = (typeof window !== 'undefined' && window.UNIVERSE_CANVAS && window.UNIVERSE_CANVAS.H) || 1600;
  const CX = 1280, CY = Math.round(CANVAS_H * 0.52);
  const SAT_R = 460;
  const TILE  = 172;
  const CIRCLE_R = 220;

  // Auto-placement timing
  const FIRST_AT     = 0.5;            // first piece starts flying at 0.5s
  const STEP         = 0.30;           // stagger between pieces
  const FLIGHT_DUR   = 0.85;           // tween length
  const LAST_LAND    = FIRST_AT + 7 * STEP + FLIGHT_DUR; // ≈ 3.45s
  const CENTER_AT    = LAST_LAND + 0.05;                  // monogram drops
  const CENTER_DUR   = 0.92;
  const READY_AT     = CENTER_AT + CENTER_DUR + 0.25;     // ≈ 4.67s

  // Scatter positions (manually balanced)
  const SCATTER = React.useMemo(() => ([
    { sx: 240,  sy: 350,  rot:  -8 },
    { sx: 2120, sy: 360,  rot:  10 },
    { sx: 2350, sy: 880,  rot:  -6 },
    { sx: 2200, sy: 1320, rot:   7 },
    { sx: 1280, sy: 1430, rot:   0 },
    { sx: 360,  sy: 1320, rot:  -7 },
    { sx: 220,  sy: 880,  rot:   8 },
    { sx: 760,  sy: 220,  rot:  -5 },
  ]), []);

  // Per-module geometry
  const pieces = React.useMemo(() => modules.map((m, i) => {
    const angle = (i * Math.PI / 4) - Math.PI / 2;
    const tx = CX + SAT_R * Math.cos(angle);
    const ty = CY + SAT_R * Math.sin(angle);
    return { m, i, tx, ty, angle, ...SCATTER[i] };
  }), []);

  // Compute live placement progress for each piece
  const placement = pieces.map((p) => {
    const startAt = FIRST_AT + p.i * STEP;
    const local   = clamp((t - startAt) / FLIGHT_DUR);
    const e       = ease.outBack(local);
    const flying  = local > 0 && local < 1;
    const placed  = local >= 1;
    return { ...p, startAt, local, e, flying, placed };
  });

  const placedCount = placement.reduce((acc, p) => acc + (p.placed ? 1 : 0), 0);
  const allPlaced   = placedCount === 8;
  const centerLanded = t >= CENTER_AT + CENTER_DUR;
  const ready       = t >= READY_AT;

  // Fire a burst as each piece lands (once)
  React.useEffect(() => {
    placement.forEach((p) => {
      if (p.placed && !firedRef.current[p.m.id]) {
        firedRef.current[p.m.id] = true;
        fireBurst(p.tx, p.ty, { count: 12 });
      }
    });
    // eslint-disable-next-line
  }, [placedCount]);

  // Auto-transition to home shortly after the centre logo lands. The home
  // page detects the `uni-from-explore` flag and slides the entire orbital
  // cluster from EXPLORE-CENTRE → HOME-RIGHT with a CSS transform — that's
  // where the user sees the icons + monogram glide into place. Doing the
  // slide on the home side avoids fighting the route-transition cross-fade.
  const handoffRef = React.useRef(false);
  React.useEffect(() => {
    if (!centerLanded || handoffRef.current) return;
    handoffRef.current = true;
    setTimeout(() => {
      try { sessionStorage.setItem('uni-from-explore', '1'); } catch(_) {}
      navigate('home');
    }, 720);   // brief settling pause so the user sees the formed cosmos
  }, [centerLanded]);

  // No-op on explore — slide happens on home
  const handoff = false;
  const SLIDE_X = 0;

  const handleSkip = () => {
    try { sessionStorage.setItem('uni-from-explore', '1'); } catch(_) {}
    setExiting(true);
    setTimeout(() => navigate('home'), 320);
  };

  const titleP = clamp((t - 0.0) / 0.6);
  const slotsP = clamp((t - 0.4) / 0.6);

  // Three headline states (no CTA gate — last state plays during auto-handoff)
  let eyebrow, headlineLead, headlineGold;
  if (!allPlaced) {
    eyebrow      = 'ASSEMBLING YOUR UNIVERSE';
    headlineLead = <>Assembling your </>;
    headlineGold = <>universe…</>;
  } else if (!centerLanded) {
    eyebrow      = 'CENTRE LOCKING IN';
    headlineLead = <>Welcome to </>;
    headlineGold = <>The Universe.</>;
  } else {
    eyebrow      = 'ENTERING THE UNIVERSE';
    headlineLead = <>Welcome to </>;
    headlineGold = <>The Universe.</>;
  }

  return (
    <div style={{
      position:'absolute', inset:0,
      background:'transparent', color:'var(--ink)', overflow:'hidden',
      transition:'opacity 320ms ease, transform 320ms ease',
      opacity: exiting ? 0 : 1,
      transform: exiting ? 'scale(0.985)' : 'scale(1)',
    }}>
      {/* Light cosmic backdrop — same visual language as Home */}
      {CosmicDust && <CosmicDust count={90} opacity={0.55}/>}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none', zIndex:1,
        background:'radial-gradient(ellipse at 50% 52%, rgba(255,250,235,0.50) 0%, rgba(255,250,235,0.10) 40%, transparent 78%)',
      }}/>

      <BurstLayer bursts={bursts} zIndex={4}/>

      {/* TOP — eyebrow + headline. Fades out when the handoff begins so the
          cluster slide can dominate visually. */}
      <div style={{
        position:'absolute', top: 116, left: 0, right: 0, textAlign:'center', zIndex:5,
        opacity: handoff ? 0 : titleP,
        transform: `translateY(${(1 - titleP) * 13}px)`,
        transition: 'opacity 480ms ease-out',
      }}>
        <div className="mono" style={{fontSize:21, letterSpacing:'0.46em', color:'var(--gold-deep)'}}>
          {eyebrow}
        </div>
        <div className="serif" style={{
          marginTop: 21, fontSize: 70, fontWeight: 300, letterSpacing:'-0.01em',
          color:'var(--ink)',
        }}>
          {headlineLead}<span style={{color:'var(--gold-deep)', fontStyle:'italic'}}>{headlineGold}</span>
        </div>
      </div>

      {/* SLOT OUTLINES — pulsing rings at each orbital position; fade once filled */}
      {placement.map((p) => {
        const isPlaced = p.placed;
        return (
          <div key={'slot-'+p.i} style={{
            position:'absolute',
            left: p.tx - TILE/2, top: p.ty - TILE/2,
            width: TILE, height: TILE,
            borderRadius:'50%',
            border: isPlaced ? '1px solid rgba(176,138,63,0)' : '1.5px dashed rgba(176,138,63,0.45)',
            opacity: slotsP * (isPlaced ? 0 : 1),
            animation: isPlaced ? 'none' : 'uniSlotPulse 2.1s ease-in-out infinite',
            transition: 'opacity 336ms, border-color 336ms',
            zIndex: 2,
          }}/>
        );
      })}

      {/* Centre slot — pulses harder once the 8 are in, then yields to monogram */}
      <div style={{
        position:'absolute',
        left: CX - CIRCLE_R, top: CY - CIRCLE_R,
        width: CIRCLE_R*2, height: CIRCLE_R*2,
        borderRadius:'50%',
        border: centerLanded ? '1px solid rgba(176,138,63,0)'
              : (allPlaced ? '1.7px solid rgba(176,138,63,0.65)' : '1.3px dashed rgba(176,138,63,0.32)'),
        opacity: slotsP * (centerLanded ? 0 : 1),
        animation: centerLanded ? 'none' : 'uniSlotPulse 2.1s ease-in-out infinite',
        transition: 'opacity 504ms, border-color 504ms',
        zIndex: 2,
      }}/>

      {/* === CLUSTER WRAPPER ============================================
          When `handoff` flips, this whole group glides 600px to the right
          so the centre logo + 8 orbital pieces + spokes land in EXACTLY
          the same screen position the home page paints them — perfect
          continuity across the route change. */}
      <div style={{
        position:'absolute', inset:0, zIndex:4, pointerEvents:'none',
        transform: handoff ? `translateX(${SLIDE_X}px)` : 'translateX(0)',
        transition: 'transform 720ms cubic-bezier(0.65, 0, 0.30, 1)',
        willChange: 'transform',
      }}>
      {/* Constellation spokes — draw in once each piece lands */}
      <svg viewBox={`0 0 2560 ${CANVAS_H}`} preserveAspectRatio="none"
        style={{position:'absolute', inset:0, width:'100%', height:'100%', zIndex:3, pointerEvents:'none'}}>
        {placement.map((p, i) => {
          if (!p.placed) return null;
          const innerX = CX + (CIRCLE_R + 23) * Math.cos(p.angle);
          const innerY = CY + (CIRCLE_R + 23) * Math.sin(p.angle);
          const outerX = CX + (SAT_R - TILE/2 - 17) * Math.cos(p.angle);
          const outerY = CY + (SAT_R - TILE/2 - 17) * Math.sin(p.angle);
          return (
            <line key={i}
              x1={innerX} y1={innerY} x2={outerX} y2={outerY}
              stroke="var(--gold-deep)" strokeWidth="1.3"
              strokeDasharray="4 6" opacity={0.55}/>
          );
        })}
      </svg>

      {/* CENTRE PIECE — drops in once all 8 satellites are placed */}
      {allPlaced && (
        <div style={{
          position:'absolute', left: CX, top: CY,
          width: CIRCLE_R*2, height: CIRCLE_R*2,
          marginLeft: -CIRCLE_R, marginTop: -CIRCLE_R,
          zIndex: 4,
          pointerEvents: 'none',
        }}>
          <div style={{
            position:'absolute', left: '50%', top: '50%',
            width: CIRCLE_R*2, height: CIRCLE_R*2,
            animation: 'uniCenterDrop 920ms cubic-bezier(0.34,1.56,0.64,1) both',
          }}>
            {/* outer halo */}
            <div style={{
              position:'absolute', inset: 0, borderRadius:'50%',
              background:'radial-gradient(circle at center, rgba(232,215,168,0.22) 0%, rgba(255,250,235,0.06) 40%, transparent 72%)',
            }}/>
            {/* main circle */}
            <div style={{
              position:'absolute', inset: 0, borderRadius:'50%',
              background: 'rgba(255,250,235,0.55)',
              border: '1.6px solid var(--gold)',
              boxShadow: ready
                ? '0 29px 84px rgba(176,138,63,0.34), 0 0 63px rgba(232,215,168,0.58)'
                : '0 8px 34px rgba(176,138,63,0.21)',
              transition: 'box-shadow 504ms ease',
            }}/>
            {/* tick marks at 8 satellite positions */}
            <svg viewBox="0 0 100 100" style={{position:'absolute', inset:0}}>
              {Array.from({length:8}).map((_, i) => {
                const a = (i * Math.PI/4) - Math.PI/2;
                const r1 = 50, r2 = 56;
                const x1 = 50 + r1*Math.cos(a), y1 = 50 + r1*Math.sin(a);
                const x2 = 50 + r2*Math.cos(a), y2 = 50 + r2*Math.sin(a);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="var(--gold)" strokeWidth="1.3" opacity={0.85}/>;
              })}
            </svg>
            {/* apartment sketch backdrop */}
            <div style={{
              position:'absolute', left: 38, top: 25, right: 38, bottom: 29,
              opacity: ready ? 0.32 : 0.18,
              transition:'opacity 630ms',
            }}>
              {Apartment10 && <Apartment10 t={t} period={20}/>}
            </div>
            {/* monogram */}
            <div style={{
              position:'absolute', inset:0,
              display:'flex', alignItems:'center', justifyContent:'center',
              filter: ready ? 'drop-shadow(0 0 29px rgba(232,215,168,0.65))' : 'none',
              transition:'filter 504ms ease',
            }}>
              <UniverseMonogram size={CIRCLE_R * 1.3} progress={1} color="var(--gold-deep)"/>
            </div>
          </div>
        </div>
      )}

      {/* No CTA — once centre lands the screen auto-transitions to /home. */}

      {/* PUZZLE PIECES — auto-fly from scatter to slot */}
      {placement.map((p) => {
        const Glyph = UIcons[p.m.id];
        const { e, placed: isPlaced, flying } = p;
        // Tween position from scatter → slot using outBack(e)
        const x = p.sx + (p.tx - p.sx) * e;
        const y = p.sy + (p.ty - p.sy) * e;
        // Subtle wiggle until it starts flying
        const wig = (e === 0) ? p.rot : 0;
        // Scale: slight pop while flying, settle to 1 once placed
        const scale = isPlaced ? 1 : (flying ? (0.92 + 0.08 * e) : 1);
        return (
          <div key={p.m.id} style={{
            position:'absolute',
            left: x - TILE/2, top: y - TILE/2,
            width: TILE, height: TILE,
            zIndex: 5,
            pointerEvents: 'none',
          }}>
            <div style={{
              '--wig': wig + 'deg',
              width:'100%', height:'100%', borderRadius:'50%',
              background: isPlaced
                ? 'linear-gradient(155deg, var(--tile-light) 0%, var(--tile) 60%, var(--tile-deep) 100%)'
                : 'linear-gradient(155deg, var(--tile) 0%, var(--tile-deep) 100%)',
              border: '1px solid '+(isPlaced ? 'var(--gold-soft)' : 'rgba(255,246,224,0.18)'),
              boxShadow: isPlaced
                ? '0 25px 50px rgba(50,32,12,0.34), 0 13px 27px rgba(50,32,12,0.20), 0 0 0 3px rgba(232,215,168,0.22), inset 0 1px 0 rgba(255,246,224,0.22), inset 0 -23px 42px rgba(50,32,12,0.30)'
                : '0 17px 32px rgba(50,32,12,0.20), 0 6px 15px rgba(50,32,12,0.14), inset 0 1px 0 rgba(255,246,224,0.16), inset 0 -23px 42px rgba(50,32,12,0.26)',
              animation: (e === 0)
                ? `uniPieceWiggle 5.6s ease-in-out ${p.i * 0.4}s infinite`
                : (isPlaced ? 'uniPieceLock 756ms cubic-bezier(0.22,1,0.36,1)' : 'none'),
              transform: `scale(${scale})`,
              transformOrigin: 'center',
              display:'flex', alignItems:'center', justifyContent:'center',
              position:'relative',
            }}>
              {/* keystone tick */}
              <div style={{
                position:'absolute', top:12, left:'50%', width:1.6, height:14, marginLeft:-0.8,
                background:'var(--on-tile)', opacity:0.6,
              }}/>
              {/* number badge */}
              <div className="mono" style={{
                position:'absolute', top:25, left:0, right:0, textAlign:'center',
                fontSize:12, letterSpacing:'0.36em', color:'var(--on-tile)', opacity:0.85,
              }}>0{p.i + 1}</div>
              {/* glyph */}
              <div style={{ width:101, height:101, marginTop:15, color:'var(--on-tile)' }}
                   className="uni-sat-icon">
                {Glyph && <Glyph hovered={false} firing={false} t={t}/>}
              </div>
              {/* base hairline */}
              <div style={{
                position:'absolute', left:'30%', right:'30%', bottom:15, height:1.3,
                background:'var(--on-tile)', opacity:0.45,
              }}/>
            </div>
            {/* label below — fades in once placed */}
            <div className="serif" style={{
              position:'absolute', top: TILE + 15, left:'50%', transform:'translateX(-50%)',
              fontSize: 23, fontWeight: 400, letterSpacing:'-0.005em',
              color:'var(--ink)', whiteSpace:'nowrap',
              opacity: isPlaced ? 1 : 0,
              transition:'opacity 504ms 210ms',
            }}>{p.m.label}</div>
          </div>
        );
      })}
      </div>{/* === END CLUSTER WRAPPER === */}

      {/* PROGRESS METER — bottom centre. Fades during handoff. */}
      <div style={{
        position:'absolute', left: 0, right: 0, bottom: 105,
        display:'flex', flexDirection:'column', alignItems:'center', gap: 15,
        zIndex: 6,
        opacity: handoff ? 0 : titleP,
        transition: 'opacity 480ms ease-out',
      }}>
        <div style={{display:'flex', alignItems:'center', gap:19}}>
          <div className="mono" style={{fontSize:16, letterSpacing:'0.36em', color:'var(--gold-deep)', minWidth:72, textAlign:'right', fontWeight: 600}}>
            {placedCount}/8
          </div>
          <div style={{width:357, height:4, background:'rgba(176,138,63,0.16)', borderRadius:2, overflow:'hidden'}}>
            <div style={{
              width: `${(placedCount/8) * 100}%`, height:'100%',
              background:'linear-gradient(90deg, var(--gold-deep) 0%, var(--gold) 50%, var(--gold-soft) 100%)',
              boxShadow:'0 0 17px rgba(232,215,168,0.65)',
              transition:'width 567ms cubic-bezier(0.22,1,0.36,1)',
            }}/>
          </div>
          <div className="mono" style={{fontSize:16, letterSpacing:'0.36em', color:'var(--slate)', minWidth:72, textAlign:'left'}}>
            {Math.round((placedCount/8)*100)}%
          </div>
        </div>
        <div className="mono" style={{fontSize:13, letterSpacing:'0.42em', color:'var(--slate)'}}>
          {!allPlaced
            ? 'PIECES LOCKING INTO ORBIT…'
            : (centerLanded ? 'ENTERING THE UNIVERSE…' : 'CENTRE LOCKING IN…')}
        </div>
      </div>

      {/* SKIP CTA bottom-right (still requires a tap). Fades during handoff. */}
      <div style={{
        position:'absolute', bottom: 50, right: 63, zIndex:8,
        opacity: handoff ? 0 : clamp((t-1.0)/0.6),
        transition: 'opacity 480ms ease-out',
        pointerEvents: handoff ? 'none' : 'auto',
      }}>
        <Magnetic radius={137} strength={0.32}>
          <ShimmerSweep speed={1100} color="rgba(232,216,179,0.55)">
            <button onClick={handleSkip} className="mono" style={{
              background:'transparent', border:'1px solid rgba(176,138,63,0.55)',
              color:'#b08a3f', padding:'15px 32px', borderRadius:105,
              fontSize:15, letterSpacing:'0.24em', textTransform:'uppercase',
              cursor:'pointer', fontWeight:600,
              transition:'background 240ms ease, border-color 240ms ease, color 240ms ease',
            }}
              onMouseEnter={ev=>{ ev.currentTarget.style.background='rgba(176,138,63,0.10)'; ev.currentTarget.style.borderColor='#b08a3f'; }}
              onMouseLeave={ev=>{ ev.currentTarget.style.background='transparent';            ev.currentTarget.style.borderColor='rgba(176,138,63,0.55)'; }}
            >Skip ahead →</button>
          </ShimmerSweep>
        </Magnetic>
      </div>
    </div>
  );
}

window.Explore = Explore;
