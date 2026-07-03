// THE STORY — interactive CHAPTER EXPLORER (one screen, 2560×ADAPTIVE, no scroll).
//
// Layout matches the approved reference comp:
//   · LEFT: editorial header (shared ScreenHeader) → CHAPTER label → the active
//     chapter's spread → a glass PAGER PILL (← 05 / 05 →) pinned bottom-left.
//   · RIGHT: a vertical CHAPTER TIMELINE RAIL (five numbered, clickable nodes on
//     a gold spine; the active one glows + reads VIEWING →).
//   · A giant faint chapter numeral floats in the gutter between the two.
// Every chapter is tappable and cross-fades the left spread — fully functional.
// Cream/gold editorial theme + shared ScreenHeader for cross-screen consistency.
// Root is inset:0 with TOP-anchored header and BOTTOM-anchored pager/rail so the
// spread fills the adaptive canvas (1600 → 1920) with no empty band.

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
    @keyframes uniStStage { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes uniStNum   { from{opacity:0;transform:translateY(34px) scale(0.965)} to{opacity:.05;transform:translateY(0) scale(1)} }
    @keyframes uniStTicker{ from{transform:translateX(0)} to{transform:translateX(-50%)} }
    @keyframes uniStPulse { 0%,100%{box-shadow:0 0 0 0 rgba(201,160,94,0.0)} 50%{box-shadow:0 0 0 7px rgba(201,160,94,0.16)} }
    @keyframes uniStNudge { 0%,100%{transform:translateX(0)} 50%{transform:translateX(5px)} }
    @keyframes uniStRise  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
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

// A spec card — mono label stacked OVER a large serif value, filling its cell.
// Replaces the old label-left / value-right row that left a wide empty gutter.
function StorySpec({ label, value, icon, i }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:28, padding:'0 38px',
      borderRadius:20, border:'1px solid var(--line)',
      background:'linear-gradient(158deg, var(--ivory) 0%, var(--ivory-2) 100%)',
      boxShadow:'0 10px 26px rgba(40,30,12,0.05), inset 0 1px 0 rgba(255,255,255,0.7)',
      animation:`uniStRise 480ms ${ST_EASE} ${i*55}ms both`}}>
      <span style={{width:74, height:74, borderRadius:18, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
        background:'radial-gradient(circle at 38% 30%, var(--ivory) 0%, var(--ivory-3) 100%)',
        border:'1px solid rgba(201,160,94,0.34)', color:'var(--gold-deep)',
        boxShadow:'inset 0 1px 0 rgba(255,255,255,0.8)'}}><StoryGlyph type={icon} size={38}/></span>
      <div style={{display:'flex', flexDirection:'column', gap:11, minWidth:0}}>
        <div className="mono" style={{fontSize:16, letterSpacing:'0.26em', color:'var(--gold-deep)', textTransform:'uppercase'}}>{label}</div>
        <div className="serif" style={{fontSize:44, fontWeight:400, color:'var(--ink)', lineHeight:1.0, letterSpacing:'-0.02em'}}>{value}</div>
      </div>
    </div>
  );
}

// A project image that fills a flex cell. Subtle ease-out entrance (opacity +
// translateY, transform/opacity only). A soft ivory gradient sits behind it, so
// if the file ever 404s the onError hides the <img> and the placeholder shows —
// no broken-image icon. Optional overlay children (scrim + caption) render above.
function StoryImg({ src, alt, radius = 18, delay = 0, pos = 'center', style, children }) {
  return (
    <div style={{ position:'relative', overflow:'hidden', borderRadius:radius,
      background:'linear-gradient(150deg, var(--ivory-2) 0%, var(--ivory-3) 100%)',
      border:'1px solid var(--line)',
      boxShadow:'0 12px 30px rgba(40,30,12,0.07), inset 0 1px 0 rgba(255,255,255,0.55)', ...style }}>
      <img src={src} alt={alt} draggable="false"
        style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:pos,
          animation:`uniStRise 520ms ${ST_EASE} ${delay}ms both` }}
        onError={e=>{ e.currentTarget.style.display='none'; }}/>
      {children}
    </div>
  );
}

// A caption overlay (scrim + mono kicker + serif line) pinned to an image's foot.
function ImgCaption({ kicker, title }) {
  return (
    <>
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        background:'linear-gradient(0deg, rgba(10,8,4,0.62), rgba(10,8,4,0.05) 44%, transparent 64%)' }}/>
      <div style={{ position:'absolute', left:28, right:28, bottom:24 }}>
        <div className="mono" style={{ fontSize:13, letterSpacing:'0.3em', color:'var(--gold-soft)', textTransform:'uppercase' }}>{kicker}</div>
        <div className="serif" style={{ fontSize:31, fontWeight:300, color:'#fdf8ec', lineHeight:1.1, marginTop:7, textShadow:'0 3px 16px rgba(0,0,0,0.5)' }}>{title}</div>
      </div>
    </>
  );
}

// Inline line-icon set for the chapter stages. Single stroke weight, gold via
// currentColor, 24-unit viewBox. Keeps the cards lively without any raster asset.
function StoryGlyph({ type, size = 40, stroke = 'currentColor' }) {
  const P = { fill:'none', stroke, strokeWidth:1.5, strokeLinecap:'round', strokeLinejoin:'round' };
  const G = {
    heritage: <g {...P}><path d="M4 20.5h16"/><path d="M4 9 12 4l8 5"/><path d="M5.4 9.6V20m13.2-10.4V20"/><path d="M9 12v6M12 12v6M15 12v6"/></g>,
    live:     <g {...P}><path d="M3 12h3.4l1.7-5.4 3.4 11.4 1.9-7 1.4 3.5H21"/></g>,
    tenants:  <g {...P}><path d="M4 20.5V8.4l6.4-2.4V20.5M10.4 20.5V4l9 3.2v13.3"/><path d="M13.4 8.6h2.6M13.4 12h2.6M13.4 15.4h2.6M6.6 12h1.8M6.6 15.4h1.8"/></g>,
    area:     <g {...P}><rect x="4" y="4" width="16" height="16" rx="1"/><path d="M9 4v16M15 4v16M4 9h16M4 15h16" opacity="0.42"/></g>,
    layers:   <g {...P}><path d="M12 3.5 21 8l-9 4.5L3 8z"/><path d="m3 12 9 4.5L21 12"/><path d="m3 16 9 4.5L21 16" opacity="0.5"/></g>,
    tag:      <g {...P}><path d="M12.6 4H20v7.4L11 20.4 3.6 13z"/><circle cx="16.3" cy="7.7" r="1.3"/></g>,
    floors:   <g {...P}><path d="M6 20.5V5h12v15.5"/><path d="M6 9.4h12M6 13h12M6 16.6h12"/></g>,
    towers:   <g {...P}><path d="M4 20.5h16"/><path d="M5.5 20.5V9h4v11.5M10.5 20.5V4h4v16.5M15.5 20.5V11h4v9.5"/></g>,
    home:     <g {...P}><path d="M4 11 12 4l8 7"/><path d="M6 9.8V20h12V9.8"/><path d="M10 20v-5.6h4V20"/></g>,
    key:      <g {...P}><circle cx="8" cy="8" r="3.6"/><path d="m10.6 10.6 8.4 8.4M16 16l1.8-1.8M14 18l1.6 1.6"/></g>,
    star:     <g {...P}><path d="M12 3.5c.4 4 1.5 5.1 5.5 5.5-4 .4-5.1 1.5-5.5 5.5-.4-4-1.5-5.1-5.5-5.5 4-.4 5.1-1.5 5.5-5.5z"/><circle cx="18" cy="17.5" r="1.4"/></g>,
  };
  return <svg viewBox="0 0 24 24" width={size} height={size} style={{display:'block'}}>{G[type]||G.star}</svg>;
}

// Tenant crest + sector for the Phase-1 Stratum proof grid. Monogram = a refined
// initial crest (no external brand logos — kiosk runs offline); sector is the
// occupier's well-known industry, not a fabricated metric.
const TENANT_META = {
  'Reliance Retail':       { mono:'RR', cat:'Retail',       logo:'reliance-retail.svg' },
  'Accenture':             { mono:'Ac', cat:'Consulting',   logo:'accenture.svg' },
  'Kraft Heinz':           { mono:'KH', cat:'FMCG',         logo:'kraft-heinz.svg' },
  'Ericsson':              { mono:'Er', cat:'Telecom',      logo:'ericsson.svg' },
  'Citi':                  { mono:'Ci', cat:'Banking',      logo:'citi.svg' },
  'Tech Mahindra':         { mono:'TM', cat:'IT Services',  logo:'tech-mahindra.svg' },
  'Siemens':               { mono:'Si', cat:'Engineering',  logo:'siemens.svg' },
  'Kotak Mahindra':        { mono:'KM', cat:'Financial',    logo:'kotak.svg' },
  'Central Bank of India': { mono:'CB', cat:'Banking',      logo:'central-bank.svg' },
  'Tata AIG':              { mono:'TA', cat:'Insurance',    logo:'tata-aig.png' },
  'New India Assurance':   { mono:'NI', cat:'Insurance',    logo:'new-india.svg' },
  'Active 8':              { mono:'A8', cat:'Lifestyle',    logo:null },
};

function Story() {
  ensureStoryKeys();
  const t = useLoop();
  const P = PROJECT;
  const S = P.stats;
  const tenants = STRATUM_TENANTS;
  const H = (typeof window !== 'undefined' && window.UNIVERSE_CANVAS && window.UNIVERSE_CANVAS.H) || 1600;
  const dens = clamp((H - 1600) / 320); // 0 on 16:10 tablet → 1 on iPad Pro 4:3

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

  // ── LEFT-STAGE content per chapter (rendered on the ivory stage, not a modal) ──
  function stageBody(key) {
    if (key === 'vision') {
      return (
        <div style={{height:'100%', display:'flex', flexDirection:'column'}}>
          <div className="eyebrow gold" style={{flexShrink:0, fontSize:18, letterSpacing:'0.44em'}}>{P.developer.toUpperCase()} · {P.phase.toUpperCase()}</div>
          <div className="serif" style={{flexShrink:0, fontSize:116, fontWeight:300, lineHeight:0.94, letterSpacing:'-0.035em', color:'var(--ink)', marginTop:18}}>
            Center of <em style={{fontStyle:'italic', color:'var(--gold-deep)'}}>everything.</em>
          </div>
          <div style={{flexShrink:0, marginTop:18, height:3, width:420, transformOrigin:'left center',
            background:'linear-gradient(90deg, var(--gold-deep), var(--gold) 55%, transparent)',
            animation:`uniStUnder 1000ms ${ST_EASE} 0.25s both`}}/>
          <div className="serif" style={{flexShrink:0, fontSize:31, fontWeight:300, fontStyle:'italic', color:'var(--graphite)', lineHeight:1.42, marginTop:28, maxWidth:1180}}>
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
            <div style={{position:'absolute', left:36, bottom:32, right:36, display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:24}}>
              <div>
                <div className="mono" style={{fontSize:14, letterSpacing:'0.32em', color:'var(--gold-soft)', textTransform:'uppercase'}}>Artist's impression</div>
                <div className="serif" style={{fontSize:46, fontWeight:300, color:'#fdf8ec', lineHeight:1.05, marginTop:9, textShadow:'0 4px 22px rgba(0,0,0,0.5)'}}>The Universe at dusk</div>
              </div>
              <div className="mono" style={{flexShrink:0, fontSize:13.5, letterSpacing:'0.24em', color:'rgba(253,248,236,0.82)', padding:'11px 20px', borderRadius:999, border:'1px solid rgba(253,248,236,0.32)', background:'rgba(10,8,4,0.28)', backdropFilter:'blur(6px)', WebkitBackdropFilter:'blur(6px)'}}>NEHRU NAGAR · AHMEDABAD</div>
            </div>
          </div>
          {/* live proof band — sits at the bottom under the render */}
          <div style={{flexShrink:0, display:'grid', gridTemplateColumns:'repeat(4,1fr)', border:'1px solid var(--line)', borderRadius:20, overflow:'hidden', background:'linear-gradient(180deg,var(--ivory-2),var(--ivory-3))'}}>
            {STATS.map((d,i)=>(
              <div key={d.key} style={{padding:'26px 30px', borderLeft:i===0?'none':'1px solid var(--line)'}}>
                <div className="serif" style={{fontSize:72, fontWeight:300, lineHeight:0.9, letterSpacing:'-0.04em', color:'var(--ink)', fontVariantNumeric:'tabular-nums'}}>
                  <StoryCount t={t} start={0.3+i*0.1} span={0.8} value={d.value}/>
                  <span style={{fontSize:38, color:'var(--gold-deep)', fontStyle:'italic'}}>{d.suffix}</span>
                </div>
                <div className="mono" style={{fontSize:14, letterSpacing:'0.28em', color:'var(--gold-deep)', marginTop:12, textTransform:'uppercase'}}>{d.label}</div>
                <div style={{fontSize:16, color:'var(--slate)', marginTop:7}}>{d.sub}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (key === 'developer') {
      const doubled = [...tenants, ...tenants];
      const PROOF = [
        { cap:'Heritage',  icon:'heritage', k:'35', sup:'+', u:'Years of craft',     d:'Timeless spaces across Ahmedabad' },
        { cap:'Execution', icon:'live',     k:'Live', sup:'', u:'Phase 1 · Stratum', d:'Operational and trading today' },
        { cap:'Tenants',   icon:'tenants',  k:String(tenants.length), sup:'', u:'Marquee occupiers', d:'Global names already in residence' },
      ];
      return (
        <div style={{height:'100%', display:'flex', flexDirection:'column'}}>
          {/* lead */}
          <div className="serif" style={{flexShrink:0, fontSize:34, fontWeight:300, color:'var(--graphite)', lineHeight:1.5, maxWidth:1300, marginBottom:32}}>
            For over three-and-a-half decades, <strong style={{color:'var(--ink)', fontWeight:500}}>{P.developer}</strong> has crafted timeless
            spaces across {P.city}. Phase 1, <strong style={{color:'var(--ink)', fontWeight:500}}>Stratum @ Venus Grounds</strong>, is already
            operational: a commercial landmark home to global names. <em style={{fontStyle:'italic', color:'var(--gold-deep)'}}>the&nbsp;Universe</em> rises beside it as the residential crown.
          </div>
          {/* three proof pillars — fill the middle band */}
          <div style={{flex:1, minHeight:0, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:22, marginBottom:32}}>
            {PROOF.map((p,i)=>(
              <div key={p.u} style={{display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'40px 42px', borderRadius:20,
                border:'1px solid var(--line)', background:'linear-gradient(158deg, var(--ivory), var(--ivory-2))',
                boxShadow:'0 10px 26px rgba(40,30,12,0.05), inset 0 1px 0 rgba(255,255,255,0.7)',
                animation:`uniStRise 500ms ${ST_EASE} ${i*80}ms both`}}>
                <div>
                  <div className="mono" style={{fontSize:14, letterSpacing:'0.32em', color:'var(--slate)', textTransform:'uppercase'}}>{p.cap}</div>
                  <div style={{marginTop:14, height:2.5, width:46, background:'linear-gradient(90deg,var(--gold-deep),var(--gold))'}}/>
                </div>
                {/* icon badge fills the middle void of the pillar */}
                <div style={{display:'flex', justifyContent:'center'}}>
                  <span style={{width:128, height:128, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                    background:'radial-gradient(circle at 38% 30%, var(--ivory) 0%, var(--ivory-3) 100%)',
                    border:'1px solid rgba(201,160,94,0.30)', color:'var(--gold-deep)',
                    boxShadow:'inset 0 1px 0 rgba(255,255,255,0.8), 0 16px 34px rgba(40,30,12,0.07)'}}>
                    <StoryGlyph type={p.icon} size={62}/>
                  </span>
                </div>
                <div>
                  <div className="serif" style={{fontSize:100, fontWeight:300, lineHeight:0.86, letterSpacing:'-0.035em', color:'var(--ink)'}}>
                    {p.k}<sup style={{fontSize:42, color:'var(--gold-deep)', fontStyle:'italic', verticalAlign:'super'}}>{p.sup}</sup>
                  </div>
                  <div className="mono" style={{fontSize:15, letterSpacing:'0.24em', color:'var(--gold-deep)', textTransform:'uppercase', marginTop:18}}>{p.u}</div>
                  <div style={{fontSize:17, color:'var(--slate)', marginTop:9, lineHeight:1.35}}>{p.d}</div>
                </div>
              </div>
            ))}
          </div>
          {/* tenant proof marquee — anchored to the bottom */}
          <div style={{flexShrink:0}}>
            <div style={{display:'flex', alignItems:'center', gap:18, marginBottom:18}}>
              <div className="eyebrow" style={{fontSize:15, letterSpacing:'0.34em', color:'var(--venus-red)'}}>STRATUM · PHASE-1 TENANTS, ALREADY OPERATIONAL</div>
              <div style={{flex:1, height:1, background:'var(--line)'}}/>
            </div>
            <div style={{position:'relative', overflow:'hidden', padding:'2px 0',
              maskImage:'linear-gradient(90deg,transparent,black 6%,black 94%,transparent)',
              WebkitMaskImage:'linear-gradient(90deg,transparent,black 6%,black 94%,transparent)'}}>
              <div style={{display:'flex', width:'max-content', gap:16, animation:'uniStTicker 42s linear infinite'}}>
                {doubled.map((name,i)=>(
                  <div key={i} style={{display:'flex', alignItems:'center', gap:14, whiteSpace:'nowrap', padding:'20px 32px', borderRadius:999, border:'1px solid var(--line)', background:'rgba(255,255,255,0.7)'}}>
                    <span style={{width:8, height:8, borderRadius:'50%', background:'var(--gold)', boxShadow:'0 0 9px var(--gold-glow)'}}/>
                    <span className="serif" style={{fontSize:31, fontWeight:400, color:'var(--ink)'}}>{name}</span>
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
          <div className="serif" style={{flexShrink:0, fontSize:34, fontWeight:300, color:'var(--graphite)', lineHeight:1.5, marginBottom:30, maxWidth:1280}}>
            Five specialist studios, each a leader in its craft, brought together for one Ahmedabad address.
          </div>
          {/* full-width editorial roster — each studio a tall row that fills the column */}
          <div style={{flex:1, minHeight:0, display:'flex', flexDirection:'column', gap:14}}>
            {TEAM.map((m,i)=>(
              <div key={m.role} style={{flex:1, minHeight:0, display:'flex', alignItems:'center', gap:40, padding:'0 46px 0 38px', borderRadius:20,
                border:'1px solid var(--line)', background:'linear-gradient(150deg, var(--ivory), var(--ivory-2))',
                boxShadow:'0 10px 26px rgba(40,30,12,0.05), inset 0 1px 0 rgba(255,255,255,0.7)',
                animation:`uniStRise 500ms ${ST_EASE} ${i*70}ms both`}}>
                <div className="serif" style={{flexShrink:0, width:96, fontSize:78, fontWeight:300, color:'var(--gold)', lineHeight:1, letterSpacing:'-0.04em', opacity:0.92, fontVariantNumeric:'tabular-nums'}}>0{i+1}</div>
                <div style={{flex:1, minWidth:0}}>
                  <div className="mono" style={{fontSize:15, letterSpacing:'0.28em', color:'var(--gold-deep)', textTransform:'uppercase'}}>{m.role}</div>
                  <div className="serif" style={{fontSize:54, fontWeight:400, color:'var(--ink)', lineHeight:1.0, marginTop:8, letterSpacing:'-0.015em'}}>{m.name}</div>
                </div>
                <div style={{flexShrink:0, maxWidth:360, textAlign:'right', fontSize:21, color:'var(--graphite)', fontStyle:'italic', lineHeight:1.3}}>{m.loc}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (key === 'master') {
      const SPECS = [
        { label:'Plot area',     value:S.plotArea,            icon:'area' },
        { label:'Built-up area', value:S.builtUp,             icon:'layers' },
        { label:'Saleable',      value:S.saleable,            icon:'tag' },
        { label:'Storeys',       value:S.storeys,             icon:'floors' },
        { label:'Towers',        value:String(S.towers),      icon:'towers' },
        { label:'Residences',    value:`${S.homes} homes`,    icon:'home' },
        { label:'Typology',      value:S.typology,            icon:'key' },
        { label:'Amenities',     value:`${S.amenities} curated`, icon:'star' },
      ];
      return (
        <div style={{height:'100%', display:'flex', flexDirection:'column'}}>
          <div className="serif" style={{flexShrink:0, fontSize:34, fontWeight:300, color:'var(--graphite)', lineHeight:1.5, marginBottom:30, maxWidth:1280}}>
            Ten towers and {S.homes} exclusively 4&nbsp;BHK homes on a {S.plotArea} plot, master-planned by <strong style={{color:'var(--ink)', fontWeight:500}}>{S.architect}</strong>.
          </div>
          {/* spec grid — 2 × 4 stacked-label cards that fill the full height evenly */}
          <div style={{flex:1, minHeight:0, display:'grid', gridTemplateColumns:'1fr 1fr', gridTemplateRows:'repeat(4,1fr)', gap:18}}>
            {SPECS.map((d,i)=>(<StorySpec key={d.label} label={d.label} value={d.value} icon={d.icon} i={i}/>))}
          </div>
        </div>
      );
    }
    if (key === 'stratum') {
      return (
        <div style={{height:'100%', display:'flex', flexDirection:'column'}}>
          <div className="serif" style={{flexShrink:0, fontSize:34, fontWeight:300, color:'var(--graphite)', lineHeight:1.5, marginBottom:32, maxWidth:1280}}>
            Phase 1, <strong style={{color:'var(--ink)', fontWeight:500}}>Stratum @ Venus Grounds</strong>, is live and trading: proof of execution
            before a single Universe home is sold. {tenants.length} marquee occupiers already call it home.
          </div>
          {/* tenant proof grid — stretches to fill the full vertical height */}
          <div style={{flex:1, minHeight:0, display:'grid', gridTemplateColumns:'repeat(4,1fr)', gridTemplateRows:'repeat(3,1fr)', gap:22}}>
            {tenants.map((name,i)=>{ const m=TENANT_META[name]||{mono:name.slice(0,2).toUpperCase(), cat:'Occupier', logo:null};
              return (
              <div key={name} style={{display:'flex', alignItems:'center', gap:24, padding:'0 28px', borderRadius:18,
                border:'1px solid var(--line)', background:'linear-gradient(158deg, var(--ivory), var(--ivory-2))',
                boxShadow:'0 12px 30px rgba(40,30,12,0.05), inset 0 1px 0 rgba(255,255,255,0.7)',
                animation:`uniStRise 460ms ${ST_EASE} ${i*40}ms both`}}>
                {/* real occupier logo on a clean white plate; monogram only if no logo */}
                <span style={{width:152, height:92, borderRadius:14, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                  padding:'14px 18px', background:'#fffefb', border:'1px solid var(--line)',
                  boxShadow:'inset 0 1px 0 rgba(255,255,255,0.9), 0 6px 16px rgba(40,30,12,0.07)'}}>
                  {m.logo
                    ? <img src={`assets/tenants/${m.logo}`} alt={name} draggable="false"
                        style={{maxWidth:'100%', maxHeight:'100%', objectFit:'contain', display:'block'}}/>
                    : <span className="serif" style={{fontSize:34, fontWeight:500, color:'var(--gold-deep)', letterSpacing:'0.04em', lineHeight:1}}>{m.mono}</span>}
                </span>
                <div style={{flex:1, minWidth:0}}>
                  <span className="serif" style={{display:'block', fontSize:28, fontWeight:400, color:'var(--ink)', lineHeight:1.12, letterSpacing:'-0.01em'}}>{name}</span>
                  <span style={{display:'flex', alignItems:'center', gap:10, marginTop:10}}>
                    <span style={{width:8, height:8, borderRadius:'50%', background:'var(--gold)', boxShadow:'0 0 9px var(--gold-glow)', flexShrink:0}}/>
                    <span className="mono" style={{fontSize:13, letterSpacing:'0.22em', color:'var(--gold-deep)', textTransform:'uppercase'}}>{m.cat}</span>
                  </span>
                </div>
              </div>
            );})}
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
      <div key={'num'+active} className="serif" aria-hidden="true" style={{position:'absolute', top:96,
        right:RAIL_W + 86, fontSize:480, fontWeight:300, lineHeight:1,
        color:'var(--ink)', opacity:0.05, pointerEvents:'none', letterSpacing:'-0.04em', zIndex:0,
        animation:`uniStNum 700ms ${ST_EASE} both`}}>{ch.num}</div>

      {/* shared header — left title block + right brand lockup (sits atop the panel) */}
      <ScreenHeader title="The Story" subtitle="Venus Group · the centre of everything in Ahmedabad" idx="01"/>

      {/* ════════════════ LEFT — the active chapter spread ════════════════ */}
      <div style={{position:'absolute', top:322, left:72, right:RAIL_W+144, bottom:48,
        display:'flex', flexDirection:'column',
        ...storyReveal(t, 0.10, 0.85, 26)}}>

        {/* chapter label */}
        <div style={{flexShrink:0, display:'flex', alignItems:'center', gap:22, marginBottom:30}}>
          <div className="mono" style={{fontSize:16, letterSpacing:'0.34em', color:'var(--gold-deep)', fontWeight:700}}>CHAPTER {ch.num}</div>
          <div style={{width:72, height:1.5, background:'linear-gradient(90deg,var(--gold-deep),var(--gold))'}}/>
          <div className="serif" style={{fontSize:33, fontWeight:400, fontStyle:'italic', color:'var(--slate)'}}>{ch.title}</div>
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
        <div style={{flexShrink:0, marginBottom:30}}>
          <div className="eyebrow gold" style={{fontSize:16, letterSpacing:'0.4em'}}>EXPLORE THE STORY</div>
          <div style={{display:'flex', alignItems:'center', gap:10, marginTop:13, color:'var(--slate)'}}>
            <span className="mono" style={{fontSize:15, letterSpacing:'0.24em'}}>TAP A CHAPTER</span>
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
                    display:'flex', alignItems:'center', gap:24, padding:'0 28px 0 18px', borderRadius:22,
                    opacity:e, transform:`translateY(${(1-e)*18}px)`,
                    background: on?'linear-gradient(150deg, rgba(255,251,242,0.96), rgba(247,238,220,0.92))':'rgba(255,255,255,0.66)',
                    border: on?'1.5px solid rgba(201,160,94,0.62)':'1px solid var(--line)',
                    boxShadow: on?'0 0 0 4px rgba(201,160,94,0.12), 0 22px 54px rgba(176,138,63,0.20)':'0 8px 22px rgba(50,32,12,0.05)',
                    transition:`background 260ms ${ST_EASE}, box-shadow 260ms ${ST_EASE}, border-color 260ms, transform 200ms ${ST_EASE}` }}
                  onMouseEnter={ev=>{ if(!on){ ev.currentTarget.style.boxShadow='0 18px 44px rgba(50,32,12,0.14)'; ev.currentTarget.style.borderColor='rgba(201,160,94,0.45)'; ev.currentTarget.style.transform=`translateY(${(1-e)*18-3}px)`; } }}
                  onMouseLeave={ev=>{ if(!on){ ev.currentTarget.style.boxShadow='0 8px 22px rgba(50,32,12,0.05)'; ev.currentTarget.style.borderColor='var(--line)'; ev.currentTarget.style.transform=`translateY(${(1-e)*18}px)`; } }}>
                  {/* node */}
                  <span style={{position:'relative', zIndex:1, width:66, height:66, borderRadius:'50%', flexShrink:0,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    background: on?'radial-gradient(circle at 38% 32%, #2a1f12, #120c06 70%)':'var(--ivory)',
                    border: on?'2px solid var(--gold)':'1.5px solid var(--line)',
                    color: on?'#f7ecd2':'var(--ink)',
                    boxShadow: on?'0 10px 24px rgba(26,17,10,0.4)':'inset 0 1px 0 rgba(255,255,255,0.8)',
                    animation: (on && !touched)?'uniStPulse 2s ease-in-out infinite':'none' }}>
                    <span className="serif" style={{fontSize:28, fontWeight:500, lineHeight:1}}>{c.num}</span>
                  </span>
                  {/* text */}
                  <span style={{flex:1, minWidth:0}}>
                    <span className="serif" style={{display:'block', fontSize:35, fontWeight:400, color:'var(--ink)', lineHeight:1.05, letterSpacing:'-0.01em'}}>{c.title}</span>
                    <span style={{display:'block', fontSize:17, color:on?'var(--gold-deep)':'var(--slate)', marginTop:8, lineHeight:1.3}}>{c.teaser}</span>
                  </span>
                  {/* trailing affordance */}
                  {on
                    ? <span className="mono" style={{flexShrink:0, fontSize:12, letterSpacing:'0.18em', color:'var(--gold-deep)', fontWeight:700, display:'flex', alignItems:'center', gap:8}}>VIEWING<Icons.arrow width={15} height={15}/></span>
                    : <span style={{flexShrink:0, color:'rgba(120,98,54,0.4)', fontSize:27, lineHeight:1}}>›</span>}
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
