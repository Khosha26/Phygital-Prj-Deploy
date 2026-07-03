// THE STORY — interactive CHAPTER EXPLORER (one screen, 2560×1600, no scroll).
//
// Layout matches the approved reference comp:
//   · LEFT: editorial header (shared ScreenHeader) → CHAPTER label → the active
//     chapter's spread → a glass PAGER PILL (← 05 / 05 →) pinned bottom-left.
//   · RIGHT: a single rounded GLASS PANEL — "the story field" — that holds the
//     brand lockup (top), "EXPLORE THE STORY · TAP A CHAPTER", a vertical
//     CHAPTER TIMELINE RAIL (five numbered, clickable nodes on a gold spine;
//     the active one glows + reads VIEWING →), a developer footer, and a
//     floating "+" button (advances to the next chapter).
//   · A giant faint chapter numeral floats in the gutter between the two.
// Every chapter is tappable and cross-fades the left spread — fully functional.
// Cream/gold editorial theme + shared ScreenHeader for cross-screen consistency.

const STORY_KEYS_ID = 'uni-story-chapters-keys';
function ensureStoryKeys() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STORY_KEYS_ID)) return;
  const s = document.createElement('style');
  s.id = STORY_KEYS_ID;
  s.textContent = `
    @keyframes uniStAurora { 0%{transform:translate3d(-3%,-2%,0) scale(1.05) rotate(0);opacity:.5}
      50%{transform:translate3d(4%,3%,0) scale(1.18) rotate(8deg);opacity:.8}
      100%{transform:translate3d(-3%,-2%,0) scale(1.05) rotate(0);opacity:.5} }
    @keyframes uniStBreathe { 0%,100%{transform:scale(1);opacity:.30} 50%{transform:scale(1.14);opacity:.55} }
    @keyframes uniStUnder { from{transform:scaleX(0)} to{transform:scaleX(1)} }
    @keyframes uniStStage { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes uniStNum   { from{opacity:0;transform:translateY(40px) scale(0.96)} to{opacity:.055;transform:translateY(0) scale(1)} }
    @keyframes uniStTicker{ from{transform:translateX(0)} to{transform:translateX(-50%)} }
    @keyframes uniStPulse { 0%,100%{box-shadow:0 0 0 0 rgba(201,160,94,0.0)} 50%{box-shadow:0 0 0 7px rgba(201,160,94,0.16)} }
    @keyframes uniStNudge { 0%,100%{transform:translateX(0)} 50%{transform:translateX(5px)} }
    @keyframes uniStRise  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes uniStPlus  { 0%,100%{box-shadow:0 14px 34px rgba(26,17,10,0.4), 0 0 0 0 rgba(201,160,94,0.0)} 50%{box-shadow:0 14px 34px rgba(26,17,10,0.4), 0 0 0 8px rgba(201,160,94,0.12)} }
  `;
  document.head.appendChild(s);
}

const ST_EASE = 'cubic-bezier(0.22,1,0.36,1)';

function storyReveal(t, start, span, dy) {
  const e = ease.outQuart(clamp((t - start) / span, 0, 1));
  return { opacity: e, transform: `translateY(${(1 - e) * (dy ?? 24)}px)` };
}
function StoryCount({ t, start, span, value }) {
  const e = ease.outQuart(clamp((t - start) / span, 0, 1));
  return <>{Math.round(value * e).toLocaleString('en-IN')}</>;
}
function StoryDetailRow({ label, value }) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:24, padding:'16px 0', borderBottom:'1px solid var(--line)'}}>
      <div className="mono" style={{fontSize:15, letterSpacing:'0.24em', color:'var(--slate)', textTransform:'uppercase'}}>{label}</div>
      <div className="serif" style={{fontSize:30, fontWeight:400, color:'var(--ink)', textAlign:'right', lineHeight:1.1}}>{value}</div>
    </div>
  );
}

function Story() {
  ensureStoryKeys();
  const t = useLoop();
  const P = PROJECT;
  const S = P.stats;
  const tenants = STRATUM_TENANTS;

  // Land on The Vision (chapter 01) by default.
  const [active, setActive] = React.useState(0);    // chapter index 0–4
  const [touched, setTouched] = React.useState(false); // has the user clicked a chapter yet?
  const pick = (i) => { setActive(i); setTouched(true); };

  // arrow-key navigation between chapters
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { setActive(a=>Math.min(4,a+1)); setTouched(true); }
      if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  { setActive(a=>Math.max(0,a-1)); setTouched(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const STATS = [
    { key:'homes',  value:S.homes,    suffix:'',   label:'Residences',     sub:'All 4 BHK + penthouses' },
    { key:'towers', value:S.towers,   suffix:'',   label:'Towers',         sub:'Five mirrored clusters' },
    { key:'amen',   value:S.amenities,suffix:'',   label:'Amenities',      sub:'Sport · wellness · social' },
    { key:'sqft',   value:28,         suffix:' L', label:'Sq.ft built-up', sub:'≈ 28,28,402 sq.ft' },
  ];
  const TEAM = [
    { role:'Architect',  name:S.architect,  loc:'Master plan & towers' },
    { role:'Structural', name:S.structural, loc:'Consulting engineers' },
    { role:'Landscape',  name:S.landscape,  loc:'Sausalito, California' },
    { role:'Interior',   name:S.interior,   loc:'Singapore' },
    { role:'Lighting',   name:S.lighting,   loc:'Architectural lighting' },
  ];
  const CHAPTERS = [
    { key:'vision',    num:'01', title:'The Vision',      teaser:'Why the Universe' },
    { key:'developer', num:'02', title:'The Developer',   teaser:'35+ years · Stratum live' },
    { key:'design',    num:'03', title:'Design Team',     teaser:'Five world studios' },
    { key:'master',    num:'04', title:'Master Plan',     teaser:'Ten towers · 624 homes' },
    { key:'stratum',   num:'05', title:'Phase-1 Stratum', teaser:'Reliance · Citi · Siemens' },
  ];
  const ch = CHAPTERS[active];
  const next = () => { setActive(a => (a + 1) % CHAPTERS.length); setTouched(true); };

  // ── LEFT-STAGE content per chapter (rendered on the ivory stage, not a modal) ──
  function stageBody(key) {
    if (key === 'vision') {
      return (
        <div style={{height:'100%', display:'flex', flexDirection:'column'}}>
          <div className="eyebrow gold" style={{flexShrink:0, fontSize:17, letterSpacing:'0.44em'}}>{P.developer.toUpperCase()} · {P.phase.toUpperCase()}</div>
          <div className="serif" style={{flexShrink:0, fontSize:114, fontWeight:300, lineHeight:0.94, letterSpacing:'-0.035em', color:'var(--ink)', marginTop:18}}>
            Center of <em style={{fontStyle:'italic', color:'var(--gold-deep)'}}>everything.</em>
          </div>
          <div style={{flexShrink:0, marginTop:18, height:3, width:420, transformOrigin:'left center',
            background:'linear-gradient(90deg, var(--gold-deep), var(--gold) 55%, transparent)',
            animation:`uniStUnder 1000ms ${ST_EASE} 0.25s both`}}/>
          <div className="serif" style={{flexShrink:0, fontSize:30, fontWeight:300, fontStyle:'italic', color:'var(--graphite)', lineHeight:1.42, marginTop:30, maxWidth:1120}}>
            {P.pitch}
          </div>
          {/* cinematic client render — fills the mid-height, brings the hero in */}
          <div style={{flex:1, minHeight:0, marginTop:30, marginBottom:30, position:'relative', borderRadius:22, overflow:'hidden',
            border:'1px solid var(--line)', boxShadow:'0 24px 60px rgba(40,30,12,0.18), inset 0 1px 0 rgba(255,255,255,0.5)'}}>
            <img src="assets/renders/client/ext-hero-twilight.jpg" alt="The Universe at dusk"
              style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover',
                transform:`scale(${1.04 + Math.sin(t*0.5)*0.012})`, transition:'transform 1.2s ease-out'}}
              onError={e=>{ e.currentTarget.style.opacity=0; }}/>
            <div style={{position:'absolute', inset:0, background:'linear-gradient(90deg, rgba(10,8,4,0.55), rgba(10,8,4,0.12) 42%, transparent 70%)'}}/>
            <div style={{position:'absolute', left:34, bottom:30, right:34, display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:24}}>
              <div>
                <div className="mono" style={{fontSize:13, letterSpacing:'0.32em', color:'var(--gold-soft)', textTransform:'uppercase'}}>Artist's impression</div>
                <div className="serif" style={{fontSize:42, fontWeight:300, color:'#fdf8ec', lineHeight:1.05, marginTop:8, textShadow:'0 4px 22px rgba(0,0,0,0.5)'}}>The Universe at dusk</div>
              </div>
              <div className="mono" style={{flexShrink:0, fontSize:12.5, letterSpacing:'0.24em', color:'rgba(253,248,236,0.78)', padding:'10px 18px', borderRadius:999, border:'1px solid rgba(253,248,236,0.32)', background:'rgba(10,8,4,0.28)', backdropFilter:'blur(6px)', WebkitBackdropFilter:'blur(6px)'}}>NEHRU NAGAR · AHMEDABAD</div>
            </div>
          </div>
          {/* live proof band — sits at the bottom under the render */}
          <div style={{flexShrink:0, display:'grid', gridTemplateColumns:'repeat(4,1fr)', border:'1px solid var(--line)', borderRadius:20, overflow:'hidden', background:'linear-gradient(180deg,var(--ivory-2),var(--ivory-3))'}}>
            {STATS.map((d,i)=>(
              <div key={d.key} style={{padding:'24px 28px', borderLeft:i===0?'none':'1px solid var(--line)'}}>
                <div className="serif" style={{fontSize:70, fontWeight:300, lineHeight:0.9, letterSpacing:'-0.04em', color:'var(--ink)', fontVariantNumeric:'tabular-nums'}}>
                  <StoryCount t={t} start={0.3+i*0.1} span={0.8} value={d.value}/>
                  <span style={{fontSize:36, color:'var(--gold-deep)', fontStyle:'italic'}}>{d.suffix}</span>
                </div>
                <div className="mono" style={{fontSize:13, letterSpacing:'0.28em', color:'var(--gold-deep)', marginTop:11, textTransform:'uppercase'}}>{d.label}</div>
                <div style={{fontSize:14.5, color:'var(--slate)', marginTop:6}}>{d.sub}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (key === 'developer') {
      const doubled = [...tenants, ...tenants];
      return (
        <div style={{height:'100%', display:'flex', flexDirection:'column'}}>
          <div style={{flexShrink:0, fontSize:32, color:'var(--graphite)', lineHeight:1.62, maxWidth:1240}}>
            For over three-and-a-half decades, <strong style={{color:'var(--ink)'}}>{P.developer}</strong> has crafted timeless
            spaces across {P.city}. {P.developerEst}. Phase 1 — <strong style={{color:'var(--ink)'}}>Stratum @ Venus Grounds</strong> —
            is already operational, a commercial landmark home to global names. <em className="serif" style={{fontStyle:'italic', color:'var(--gold-deep)', fontSize:34}}>the&nbsp;Universe</em> rises beside it as the residential crown.
          </div>
          {/* tenant proof block — pushed to the bottom to fill the height */}
          <div style={{marginTop:'auto'}}>
            <div style={{display:'flex', alignItems:'center', gap:16, marginBottom:22}}>
              <div className="eyebrow" style={{fontSize:15, letterSpacing:'0.36em', color:'var(--venus-red)'}}>STRATUM · PHASE-1 TENANTS — ALREADY OPERATIONAL</div>
              <div style={{flex:1, height:1, background:'var(--line)'}}/>
            </div>
            <div style={{position:'relative', overflow:'hidden', padding:'2px 0',
              maskImage:'linear-gradient(90deg,transparent,black 6%,black 94%,transparent)',
              WebkitMaskImage:'linear-gradient(90deg,transparent,black 6%,black 94%,transparent)'}}>
              <div style={{display:'flex', width:'max-content', gap:16, animation:'uniStTicker 42s linear infinite'}}>
                {doubled.map((name,i)=>(
                  <div key={i} style={{display:'flex', alignItems:'center', gap:14, whiteSpace:'nowrap', padding:'20px 32px', borderRadius:999, border:'1px solid var(--line)', background:'rgba(255,255,255,0.7)'}}>
                    <span style={{width:8, height:8, borderRadius:'50%', background:'var(--gold)', boxShadow:'0 0 9px var(--gold-glow)'}}/>
                    <span className="serif" style={{fontSize:30, fontWeight:400, color:'var(--ink)'}}>{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }
    if (key === 'design') {
      return (
        <div style={{height:'100%', display:'flex', flexDirection:'column'}}>
          <div style={{flexShrink:0, fontSize:30, color:'var(--graphite)', lineHeight:1.55, marginBottom:34, maxWidth:1160}}>
            Five specialist studios, each a leader in its craft, brought together for one Ahmedabad address.
          </div>
          <div style={{flex:1, minHeight:0, display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:18}}>
            {TEAM.map((m,i)=>(
              <div key={m.role} style={{display:'flex', flexDirection:'column', justifyContent:'center', padding:'30px 24px', borderRadius:20,
                background:'linear-gradient(160deg, var(--tile) 0%, var(--tile-deep) 100%)',
                border:'1px solid rgba(255,246,224,0.18)', color:'#fdf8ec',
                boxShadow:'0 16px 40px rgba(50,32,12,0.26), inset 0 1px 0 rgba(255,246,224,0.16)',
                animation:`uniStRise 520ms ${ST_EASE} ${i*70}ms both`}}>
                <div className="mono" style={{fontSize:12, letterSpacing:'0.26em', color:'var(--gold-soft)'}}>{m.role.toUpperCase()}</div>
                <div className="serif" style={{fontSize:36, fontWeight:400, lineHeight:1.04, marginTop:14, letterSpacing:'-0.01em'}}>{m.name}</div>
                <div style={{fontSize:14.5, color:'rgba(250,246,232,0.72)', fontStyle:'italic', marginTop:12}}>{m.loc}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (key === 'master') {
      return (
        <div style={{height:'100%', display:'flex', flexDirection:'column'}}>
          <div style={{flexShrink:0, fontSize:30, color:'var(--graphite)', lineHeight:1.55, marginBottom:30, maxWidth:1160}}>
            Ten towers and {S.homes} exclusively 4&nbsp;BHK homes on a {S.plotArea} plot, master-planned by {S.architect}.
          </div>
          <div style={{flex:1, minHeight:0, display:'grid', gridTemplateColumns:'1fr 1fr', columnGap:64}}>
            <div style={{display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
              <StoryDetailRow label="Plot area"     value={S.plotArea}/>
              <StoryDetailRow label="Built-up area" value={S.builtUp}/>
              <StoryDetailRow label="Saleable"      value={S.saleable}/>
              <StoryDetailRow label="Storeys"       value={S.storeys}/>
            </div>
            <div style={{display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
              <StoryDetailRow label="Towers"        value={S.towers}/>
              <StoryDetailRow label="Residences"    value={`${S.homes} homes`}/>
              <StoryDetailRow label="Typology"      value={S.typology}/>
              <StoryDetailRow label="Amenities"     value={`${S.amenities} curated`}/>
            </div>
          </div>
        </div>
      );
    }
    if (key === 'stratum') {
      return (
        <div style={{height:'100%', display:'flex', flexDirection:'column'}}>
          <div className="serif" style={{flexShrink:0, fontSize:34, fontWeight:300, color:'var(--graphite)', lineHeight:1.5, marginBottom:36, maxWidth:1180}}>
            Phase 1, <strong style={{color:'var(--ink)', fontWeight:500}}>Stratum @ Venus Grounds</strong>, is live and trading — proof of execution
            before a single Universe home is sold. {tenants.length}+ marquee occupiers already call it home.
          </div>
          {/* tenant proof grid — stretches to fill the full vertical height */}
          <div style={{flex:1, minHeight:0, display:'grid', gridTemplateColumns:'repeat(4,1fr)', gridTemplateRows:'repeat(3,1fr)', gap:22}}>
            {tenants.map((name,i)=>(
              <div key={name} style={{display:'flex', alignItems:'center', gap:18, padding:'0 30px', borderRadius:18,
                border:'1px solid var(--line)', background:'var(--ivory)',
                boxShadow:'0 12px 30px rgba(40,30,12,0.05)',
                animation:`uniStRise 460ms ${ST_EASE} ${i*40}ms both`}}>
                <span style={{width:11, height:11, borderRadius:'50%', background:'var(--gold)', boxShadow:'0 0 10px var(--gold-glow)', flexShrink:0}}/>
                <span className="serif" style={{fontSize:30, fontWeight:400, color:'var(--ink)', lineHeight:1.1}}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  }

  // ── right chapter-rail width (no enclosing panel) ─────────────────────────
  const RAIL_W = 672;

  return (
    <div style={{position:'absolute', inset:0, background:'transparent', color:'var(--ink)', overflow:'hidden'}}>

      {/* ambient backdrop */}
      <div style={{position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden'}}>
        <div style={{position:'absolute', top:'-24%', right:'-12%', width:1320, height:1320,
          background:'radial-gradient(circle at 50% 50%, rgba(201,160,94,0.18), rgba(234,215,168,0.09) 38%, transparent 66%)',
          filter:'blur(26px)', animation:'uniStAurora 24s ease-in-out infinite'}}/>
        <div style={{position:'absolute', bottom:'-28%', left:'-16%', width:1180, height:1180,
          background:'radial-gradient(circle at 50% 50%, rgba(176,138,63,0.12), transparent 62%)',
          filter:'blur(30px)', animation:'uniStAurora 32s ease-in-out infinite reverse'}}/>
      </div>

      {/* giant faint chapter numeral — floats in the gutter behind the gap */}
      <div key={'num'+active} className="serif" aria-hidden="true" style={{position:'absolute', top:70,
        right:RAIL_W + 86, fontSize:470, fontWeight:300, lineHeight:1,
        color:'var(--ink)', opacity:0.055, pointerEvents:'none', letterSpacing:'-0.04em', zIndex:0,
        animation:`uniStNum 700ms ${ST_EASE} both`}}>{ch.num}</div>

      {/* shared header — left title block + right brand lockup (sits atop the panel) */}
      <ScreenHeader title="The Story" subtitle="Venus Group · the centre of everything in Ahmedabad" idx="01"/>

      {/* ════════════════ LEFT — the active chapter spread ════════════════ */}
      <div style={{position:'absolute', top:322, left:72, right:RAIL_W+144, bottom:48,
        display:'flex', flexDirection:'column',
        ...storyReveal(t, 0.10, 0.85, 26)}}>

        {/* chapter label */}
        <div style={{flexShrink:0, display:'flex', alignItems:'center', gap:20, marginBottom:28}}>
          <div className="mono" style={{fontSize:15, letterSpacing:'0.34em', color:'var(--gold-deep)', fontWeight:700}}>CHAPTER {ch.num}</div>
          <div style={{width:64, height:1.5, background:'linear-gradient(90deg,var(--gold-deep),var(--gold))'}}/>
          <div className="serif" style={{fontSize:30, fontWeight:400, fontStyle:'italic', color:'var(--slate)'}}>{ch.title}</div>
        </div>

        {/* the cross-fading spread — fills the available height */}
        <div key={ch.key} style={{flex:1, minHeight:0, position:'relative', animation:`uniStStage 480ms ${ST_EASE} both`}}>
          {stageBody(ch.key)}
        </div>

        {/* ── glass PAGER PILL (← 05 / 05 →) bottom-left ── */}
        <div style={{flexShrink:0, marginTop:26, alignSelf:'flex-start', display:'flex', alignItems:'center',
          padding:6, borderRadius:999, gap:6,
          background:'rgba(255,255,255,0.72)', border:'1px solid var(--line)',
          boxShadow:'0 18px 44px rgba(40,30,12,0.10), inset 0 1px 0 rgba(255,255,255,0.7)',
          backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)'}}>
          <button onClick={()=>{ setActive(a=>Math.max(0,a-1)); setTouched(true); }} disabled={active===0}
            style={{width:64, height:64, borderRadius:'50%', border:'none', background:'transparent',
              display:'flex', alignItems:'center', justifyContent:'center', cursor:active===0?'default':'pointer',
              opacity:active===0?0.3:1, color:'var(--ink)', transition:`all 200ms ${ST_EASE}`}}
            onMouseEnter={e=>{ if(active!==0){ e.currentTarget.style.background='var(--ivory-3)'; } }}
            onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; }}>
            <span style={{transform:'rotate(180deg)', display:'flex'}}><Icons.arrow width={24} height={24}/></span>
          </button>
          <div className="mono" style={{minWidth:118, textAlign:'center', fontSize:16, letterSpacing:'0.16em', color:'var(--slate)'}}>
            <span className="serif" style={{fontSize:32, color:'var(--ink)', fontWeight:400}}>{ch.num}</span>
            <span style={{margin:'0 10px', color:'var(--line)'}}>/</span>
            <span style={{fontSize:18}}>05</span>
          </div>
          <button onClick={()=>{ setActive(a=>Math.min(4,a+1)); setTouched(true); }} disabled={active===4}
            style={{width:64, height:64, borderRadius:'50%', border:'none', background:'transparent',
              display:'flex', alignItems:'center', justifyContent:'center', cursor:active===4?'default':'pointer',
              opacity:active===4?0.3:1, color:'var(--ink)', transition:`all 200ms ${ST_EASE}`}}
            onMouseEnter={e=>{ if(active!==4){ e.currentTarget.style.background='var(--ivory-3)'; } }}
            onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; }}>
            <Icons.arrow width={24} height={24}/>
          </button>
        </div>
      </div>

      {/* ════════════════ RIGHT — chapter rail (no panel), tall fields ════════════════ */}
      <div style={{position:'absolute', top:322, right:48, width:RAIL_W, bottom:48,
        display:'flex', flexDirection:'column', ...storyReveal(t, 0.26, 0.9, 30)}}>

        {/* rail header — the call to interact (aligns with the left chapter label) */}
        <div style={{flexShrink:0, marginBottom:28}}>
          <div className="eyebrow gold" style={{fontSize:15, letterSpacing:'0.4em'}}>EXPLORE THE STORY</div>
          <div style={{display:'flex', alignItems:'center', gap:10, marginTop:12, color:'var(--slate)'}}>
            <span className="mono" style={{fontSize:14, letterSpacing:'0.24em'}}>TAP A CHAPTER</span>
            {!touched && <span style={{display:'inline-flex', color:'var(--gold-deep)', animation:'uniStNudge 1.6s ease-in-out infinite'}}><Icons.arrow width={16} height={16}/></span>}
          </div>
        </div>

        {/* the timeline — five tall fields that fill the full height */}
        <div style={{position:'relative', flex:1, minHeight:0}}>
          <div style={{display:'flex', flexDirection:'column', gap:18, position:'relative', height:'100%'}}>
            {/* gold spine — node-01 centre → node-05 centre, behind the fields */}
            <div style={{position:'absolute', left:51, top:'10%', bottom:'10%', width:2, background:'var(--line)', zIndex:0}}/>
            <div style={{position:'absolute', left:51, top:'10%', width:2, zIndex:0,
              background:'linear-gradient(180deg,var(--gold-deep),var(--gold))', boxShadow:'0 0 10px var(--gold-glow)',
              height:`${Math.max(0, ((active+0.5)/CHAPTERS.length - 0.10)*100)}%`,
              transition:`height 460ms ${ST_EASE}`}}/>
            {CHAPTERS.map((c,i)=>{ const on=i===active;
              const start=0.4+i*0.07; const e=ease.outQuart(clamp((t-start)/0.7,0,1));
              return (
                <button key={c.key} onClick={()=>pick(i)}
                  style={{ textAlign:'left', cursor:'pointer', font:'inherit', position:'relative', zIndex:1,
                    flex:1, minHeight:0,
                    display:'flex', alignItems:'center', gap:22, padding:'0 26px 0 18px', borderRadius:22,
                    opacity:e, transform:`translateY(${(1-e)*18}px)`,
                    background: on?'linear-gradient(150deg, rgba(255,251,242,0.96), rgba(247,238,220,0.92))':'rgba(255,255,255,0.66)',
                    border: on?'1.5px solid rgba(201,160,94,0.62)':'1px solid var(--line)',
                    boxShadow: on?'0 0 0 4px rgba(201,160,94,0.12), 0 22px 54px rgba(176,138,63,0.20)':'0 8px 22px rgba(50,32,12,0.05)',
                    transition:`background 260ms ${ST_EASE}, box-shadow 260ms ${ST_EASE}, border-color 260ms, transform 200ms ${ST_EASE}` }}
                  onMouseEnter={ev=>{ if(!on){ ev.currentTarget.style.boxShadow='0 18px 44px rgba(50,32,12,0.14)'; ev.currentTarget.style.borderColor='rgba(201,160,94,0.45)'; ev.currentTarget.style.transform=`translateY(${(1-e)*18-3}px)`; } }}
                  onMouseLeave={ev=>{ if(!on){ ev.currentTarget.style.boxShadow='0 8px 22px rgba(50,32,12,0.05)'; ev.currentTarget.style.borderColor='var(--line)'; ev.currentTarget.style.transform=`translateY(${(1-e)*18}px)`; } }}>
                  {/* node */}
                  <span style={{position:'relative', zIndex:1, width:62, height:62, borderRadius:'50%', flexShrink:0,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    background: on?'radial-gradient(circle at 38% 32%, #2a1f12, #120c06 70%)':'var(--ivory)',
                    border: on?'2px solid var(--gold)':'1.5px solid var(--line)',
                    color: on?'#f7ecd2':'var(--ink)',
                    boxShadow: on?'0 10px 24px rgba(26,17,10,0.4)':'inset 0 1px 0 rgba(255,255,255,0.8)',
                    animation: (on && !touched)?'uniStPulse 2s ease-in-out infinite':'none' }}>
                    <span className="serif" style={{fontSize:26, fontWeight:500, lineHeight:1}}>{c.num}</span>
                  </span>
                  {/* text */}
                  <span style={{flex:1, minWidth:0}}>
                    <span className="serif" style={{display:'block', fontSize:33, fontWeight:400, color:'var(--ink)', lineHeight:1.05, letterSpacing:'-0.01em'}}>{c.title}</span>
                    <span style={{display:'block', fontSize:16, color:on?'var(--gold-deep)':'var(--slate)', marginTop:7, lineHeight:1.3}}>{c.teaser}</span>
                  </span>
                  {/* trailing affordance */}
                  {on
                    ? <span className="mono" style={{flexShrink:0, fontSize:11.5, letterSpacing:'0.18em', color:'var(--gold-deep)', fontWeight:700, display:'flex', alignItems:'center', gap:8}}>VIEWING<Icons.arrow width={15} height={15}/></span>
                    : <span style={{flexShrink:0, color:'rgba(120,98,54,0.4)', fontSize:26, lineHeight:1}}>›</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

window.Story = Story;
