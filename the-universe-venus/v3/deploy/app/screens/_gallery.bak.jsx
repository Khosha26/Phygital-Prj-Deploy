// Gallery — three-column editorial viewer, replicated from the Embassy Citadel
// gallery layout (v4/gallery.html) and re-skinned in The Universe's ivory/gold
// brand on this app's React/Babel stack. The client rejected the prior 3D fanned
// card deck — this is our standard project gallery layout.
//
// REFERENCE LAYOUT (Embassy Citadel · v4/gallery.html — the stronger of the two
// references; Embassy One shares the same anatomy but Citadel maps 1:1 to our
// data and matches our just-rebuilt amenities screen):
//   · LEFT editorial rail  — eyebrow + big serif "Gallery" + tagline + rule, then
//     a CATEGORY list (All + 4 cats) where each row is icon-free label · NN count
//     and one row is active (gold tint).
//   · CENTER hero plate    — one large lead image (gold-hairline inner frame, a
//     Citadel × Embassy-One detail), soft caption gradient with tag + title, a
//     "View full screen" maximize chip, and a floating prev / NN—NN / next pill.
//     A tablet-safe DOUBLE-BUFFERED crossfade swaps the lead image with no
//     undecoded/blank frame revealed.
//   · RIGHT thumbs rail    — a vertical THUMBNAIL stack of every image in the
//     active category; active thumb carries a gold ring; scrolls when long.
//
// LIGHTBOX (full-screen, lives over the whole app like amenities does not need):
//   contain image + caption + prev/next + close + counter, ESC / ← / → keys,
//   pointer-swipe, and the same double-buffered crossfade. PANORAMA items
//   (src contains '-pano', 2:1 wide renders) are LETTERBOXED and made
//   horizontally PANNABLE — drag scrubs across the wide render with a hint.
//
// Data: GALLERY_ITEMS / GALLERY_CATS (window globals, data.jsx). Captions are
// CURATED (item.tag / item.title) — never auto-generated. Ends with
// window.Gallery = Gallery.

const GALLERY_KEYS_ID = 'uni-gallery-keys';
function ensureGalleryKeys() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(GALLERY_KEYS_ID)) return;
  const s = document.createElement('style');
  s.id = GALLERY_KEYS_ID;
  s.textContent = `
    @keyframes galHeroIn { 0%{opacity:0; transform:scale(1.05)} 100%{opacity:1; transform:scale(1.02)} }
    @keyframes galThumbIn { 0%{opacity:0; transform:translateX(14px)} 100%{opacity:1; transform:translateX(0)} }
    @keyframes uniPanoHint { 0%,100%{transform:translateX(0)} 50%{transform:translateX(7px)} }
    .gal-stack::-webkit-scrollbar { width: 8px; }
    .gal-stack::-webkit-scrollbar-track { background: transparent; }
    .gal-stack::-webkit-scrollbar-thumb { background: rgba(176,138,63,0.30); border-radius: 4px; }
    .gal-stack::-webkit-scrollbar-thumb:hover { background: rgba(176,138,63,0.55); }
    /* Double-buffered crossfade layer (hero + lightbox) */
    .uni-xf-img {
      position:absolute; inset:0; width:100%; height:100%;
      object-fit:cover; display:block; opacity:0;
      transition: opacity 280ms ease-out;
      transform: translateZ(0); -webkit-backface-visibility:hidden; backface-visibility:hidden;
      will-change: opacity;
    }
    .uni-xf-img.is-active { opacity:1; }
    .uni-lb-img {
      position:absolute; inset:0; width:100%; height:100%;
      object-fit:contain; display:block; opacity:0;
      transition: opacity 280ms ease-out;
      transform: translateZ(0); -webkit-backface-visibility:hidden; backface-visibility:hidden;
      will-change: opacity;
    }
    .uni-lb-img.is-active { opacity:1; }
  `;
  document.head.appendChild(s);
}

// Panorama detector — 2:1 wide renders are flagged by '-pano' in the src.
const isPano = (it) => !!it && typeof it.src === 'string' && it.src.indexOf('-pano') !== -1;
const pad2 = (n) => String(n).padStart(2, '0');

// ============================================================================
// XfadeImage — double-buffered crossfade. Two stacked <img> layers (A/B); on
// src change the NEXT image is decoded on the hidden buffer, then opacity-
// crossfaded in over the old one. No src swap on a visible layer → never reveals
// an undecoded/blank frame, which is the root cause of swap flicker on tablets.
// `cls` = 'uni-xf-img' (cover, hero) or 'uni-lb-img' (contain, lightbox).
// `styleFor(isFront)` lets the lightbox inject panorama pan styles per buffer.
// ============================================================================
function XfadeImage({ src, alt, cls, styleFor }) {
  const [srcA, setSrcA] = React.useState(src);
  const [srcB, setSrcB] = React.useState('');
  const [front, setFront] = React.useState(0);   // 0 = A shown, 1 = B shown
  const firstRef = React.useRef(true);

  React.useEffect(() => {
    if (firstRef.current) { firstRef.current = false; return; }
    const showA = front === 1;                    // fade INTO A if B is front
    const url = src;
    const img = new Image();
    const commit = () => {
      if (showA) { setSrcA(url); setFront(0); }
      else       { setSrcB(url); setFront(1); }
    };
    img.onload = commit;
    img.onerror = commit;
    img.src = url;
    if (img.complete && img.naturalWidth) commit();
  }, [src]);

  const sf = styleFor || (() => undefined);
  return (
    <React.Fragment>
      <img src={srcA} alt={alt || ''} draggable={false}
        className={cls + (front === 0 ? ' is-active' : '')}
        style={sf(front === 0)}
        onError={e => { e.currentTarget.style.opacity = 0; }} />
      {srcB && <img src={srcB} alt={alt || ''} draggable={false}
        className={cls + (front === 1 ? ' is-active' : '')}
        style={sf(front === 1)}
        onError={e => { e.currentTarget.style.opacity = 0; }} />}
    </React.Fragment>
  );
}

// ============================================================================
// CategoryRow — left-rail entry: label · NN count, active = gold tint.
// (mirrors amenities CategoryRow, sans the per-id self-drawing icon)
// ============================================================================
function CategoryRow({ label, count, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:18, width:'100%',
      height:70, padding:'0 24px', borderRadius:16,
      border:'1px solid '+(active ? 'rgba(176,138,63,0.45)' : 'transparent'),
      background: active ? 'rgba(255,250,235,0.96)' : 'transparent',
      boxShadow: active
        ? '0 18px 40px rgba(50,32,12,0.16), 0 6px 14px rgba(40,28,10,0.10)'
        : 'none',
      cursor:'pointer', textAlign:'left',
      transform: active ? 'translateY(-1px)' : 'none',
      transition:'background 240ms ease, border-color 240ms ease, box-shadow 280ms ease, transform 200ms ease',
    }}
      onMouseEnter={(ev)=>{ if(!active){ ev.currentTarget.style.background='rgba(255,250,235,0.55)'; ev.currentTarget.style.borderColor='rgba(176,138,63,0.18)'; }}}
      onMouseLeave={(ev)=>{ if(!active){ ev.currentTarget.style.background='transparent'; ev.currentTarget.style.borderColor='transparent'; }}}
    >
      <div className="mono" style={{
        flex:1, fontSize:16, letterSpacing:'0.26em', textTransform:'uppercase',
        color: active ? 'var(--ink)' : 'var(--graphite)', fontWeight: active ? 700 : 500,
      }}>{label}</div>
      <div className="mono" style={{
        fontSize:14, letterSpacing:'0.14em', fontVariantNumeric:'tabular-nums',
        padding:'5px 12px', borderRadius:11,
        border:'1px solid '+(active ? 'rgba(176,138,63,0.45)' : 'var(--line)'),
        background: active ? 'rgba(255,250,235,0.98)' : 'rgba(255,250,235,0.55)',
        color: active ? 'var(--gold-deep)' : 'var(--slate)',
      }}>{pad2(count)}</div>
    </button>
  );
}

// ============================================================================
// ThumbCard — right-rail thumbnail: photo + tag + title, active = gold ring.
// ============================================================================
function ThumbCard({ item, idx, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      position:'relative', width:'100%', height:150, flexShrink:0,
      borderRadius:18, overflow:'hidden', padding:0, cursor:'pointer',
      background:'#0c0a07',
      border:'1px solid '+(active ? 'var(--gold)' : 'rgba(176,138,63,0.22)'),
      boxShadow: active
        ? '0 0 0 2px var(--gold), 0 18px 36px rgba(50,32,12,0.34), 0 6px 12px rgba(40,28,10,0.14)'
        : '0 10px 24px rgba(50,32,12,0.20), 0 3px 6px rgba(40,28,10,0.10)',
      animation:`galThumbIn 460ms cubic-bezier(0.22,1,0.36,1) ${Math.min(idx,9)*48}ms both`,
      transition:'box-shadow 260ms ease, border-color 240ms ease, transform 240ms ease',
    }}
      onMouseEnter={(ev)=>{ if(!active){ ev.currentTarget.style.transform='translateX(-3px)'; ev.currentTarget.style.borderColor='rgba(176,138,63,0.5)'; const im=ev.currentTarget.querySelector('img'); if(im) im.style.transform='scale(1.06)'; }}}
      onMouseLeave={(ev)=>{ ev.currentTarget.style.transform='none'; if(!active) ev.currentTarget.style.borderColor='rgba(176,138,63,0.22)'; const im=ev.currentTarget.querySelector('img'); if(im) im.style.transform='scale(1)'; }}
    >
      <img src={item.src} alt={item.title} draggable={false} loading="lazy"
        style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover',
          opacity:0.94, transition:'transform 480ms cubic-bezier(0.22,1,0.36,1)'}}
        onError={e=>{ e.currentTarget.style.display='none'; e.currentTarget.parentElement.style.background='linear-gradient(135deg,#9d9684,#6a6356)'; }}/>
      <div style={{position:'absolute', inset:0, pointerEvents:'none',
        background:'linear-gradient(180deg, rgba(10,10,10,0.05) 0%, rgba(10,10,10,0.40) 50%, rgba(10,10,10,0.88) 100%)'}}/>
      {/* tag badge */}
      <div style={{position:'absolute', top:12, right:12, padding:'4px 11px', borderRadius:105,
        background:'rgba(14,12,9,0.62)', border:'1px solid rgba(232,215,168,0.42)', backdropFilter:'blur(6px)'}}>
        <span className="mono" style={{fontSize:10.5, letterSpacing:'0.22em', color:'var(--gold-soft)', textTransform:'uppercase'}}>{item.tag}</span>
      </div>
      {/* pano badge */}
      {isPano(item) && (
        <div style={{position:'absolute', top:12, left:12, padding:'4px 10px', borderRadius:105,
          background:'rgba(14,12,9,0.62)', border:'1px solid rgba(232,215,168,0.42)', backdropFilter:'blur(6px)'}}>
          <span className="mono" style={{fontSize:10, letterSpacing:'0.2em', color:'var(--gold-soft)', textTransform:'uppercase'}}>Pano</span>
        </div>
      )}
      {/* active check chip */}
      {active && (
        <div style={{position:'absolute', top:12, left:isPano(item)?68:12, width:26, height:26, borderRadius:'50%',
          background:'rgba(250,246,232,0.95)', border:'1px solid var(--gold)',
          display:'flex', alignItems:'center', justifyContent:'center', color:'var(--gold-deep)'}}>
          <Icons.check width={14} height={14}/>
        </div>
      )}
      {/* title */}
      <div style={{position:'absolute', left:16, right:16, bottom:14, textAlign:'left'}}>
        <span className="serif" style={{fontSize:22, fontWeight:300, letterSpacing:'-0.01em',
          color:'rgba(250,246,232,0.98)', textShadow:'0 4px 14px rgba(0,0,0,0.55)', lineHeight:1.08, display:'block'}}>
          {item.title}
        </span>
      </div>
    </button>
  );
}

// ============================================================================
// Gallery — the screen.
// ============================================================================
function Gallery() {
  ensureGalleryKeys();
  const t = useLoop();

  const allItems = GALLERY_ITEMS;
  const cats     = ['All', ...GALLERY_CATS];

  const [catIdx, setCatIdx] = React.useState(0);
  const [subIdx, setSubIdx] = React.useState(0);
  const [open, setOpen]     = React.useState(null);   // lightbox item or null
  const stackRef = React.useRef(null);

  const cat   = cats[catIdx];
  const items = React.useMemo(
    () => cat === 'All' ? allItems : allItems.filter(it => it.cat === cat),
    [cat, allItems]
  );
  const total = items.length;
  const item  = items[subIdx] || items[0];

  const e     = clamp((t - 0.0) / 0.55);   // header / rail reveal
  const eHero = clamp((t - 0.18) / 0.7);   // hero reveal

  const pickCategory = (i) => { setCatIdx(i); setSubIdx(0); };
  const pickSub = (i) => { if (total) setSubIdx((i + total) % total); };
  const prevSub = () => pickSub(subIdx - 1);
  const nextSub = () => pickSub(subIdx + 1);

  const catCount = (c) => c === 'All' ? allItems.length : allItems.filter(x => x.cat === c).length;

  // Keyboard ← / → within the active category (deck only — lightbox owns its keys).
  React.useEffect(() => {
    const onKey = (ev) => {
      if (open) return;
      if (ev.key === 'ArrowLeft')  prevSub();
      else if (ev.key === 'ArrowRight') nextSub();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [subIdx, catIdx, total, open]);

  // Keep the active thumb in view inside its scroll container.
  React.useEffect(() => {
    const stack = stackRef.current; if (!stack) return;
    const active = stack.querySelector('[data-active="1"]');
    if (!active) return;
    const aTop = active.offsetTop, aBot = aTop + active.offsetHeight;
    const pTop = stack.scrollTop, pBot = pTop + stack.clientHeight;
    if (aTop < pTop) stack.scrollTop = aTop - 10;
    else if (aBot > pBot) stack.scrollTop = aBot - stack.clientHeight + 10;
  }, [subIdx, catIdx]);

  return (
    <div style={{position:'absolute', inset:0, background:'transparent', color:'var(--ink)', overflow:'hidden'}}>
      <ScreenHeader title="Gallery" subtitle="Exteriors · retail · amenities · clubhouse interiors" idx="06"/>

      {/* ===== THREE-COLUMN STAGE ====================================== */}
      <div style={{position:'absolute', top:300, left:72, right:72, bottom:56, display:'flex', gap:34}}>

        {/* ---- LEFT EDITORIAL RAIL ---- */}
        <div style={{
          width:480, flexShrink:0, display:'flex', flexDirection:'column',
          opacity:e, transform:`translateY(${(1-e)*-14}px)`,
        }}>
          <div className="mono" style={{fontSize:15, letterSpacing:'0.42em', color:'var(--gold-deep)'}}>
            THE VISUAL WORLD · {allItems.length} RENDERS
          </div>
          <div className="serif" style={{fontSize:58, fontWeight:300, lineHeight:1.0, letterSpacing:'-0.025em', marginTop:14}}>
            Every view of<br/><em style={{fontStyle:'italic', color:'var(--gold-deep)'}}>the Universe.</em>
          </div>
          <div className="mono" style={{fontSize:13.5, letterSpacing:'0.28em', color:'var(--slate)', textTransform:'uppercase', marginTop:18}}>
            Exteriors · retail · amenities · clubhouse
          </div>
          <div style={{height:1, background:'linear-gradient(90deg, rgba(176,138,63,0.5) 0%, rgba(176,138,63,0.2) 60%, transparent 100%)', margin:'26px 0 22px'}}/>

          {/* Category list */}
          <div className="gal-stack" style={{display:'flex', flexDirection:'column', gap:8, flex:1, minHeight:0, overflowY:'auto'}}>
            {cats.map((c, i) => (
              <CategoryRow key={c} label={c} count={catCount(c)} active={i === catIdx} onClick={()=>pickCategory(i)}/>
            ))}
          </div>

          <div className="mono" style={{fontSize:12.5, letterSpacing:'0.26em', color:'var(--slate)', textTransform:'uppercase', marginTop:24, lineHeight:1.6}}>
            Tap any image to view full screen<br/>· panoramas pan ·
          </div>
        </div>

        {/* ---- CENTER HERO PLATE ---- */}
        <div style={{flex:1, minWidth:0, position:'relative', opacity:eHero, transform:`scale(${lerp(0.985,1,eHero)})`, transformOrigin:'center'}}>
          <div style={{
            position:'absolute', inset:0, borderRadius:28, overflow:'hidden',
            background:'#0c0a07', border:'1px solid rgba(176,138,63,0.34)',
            boxShadow:'0 40px 90px -24px rgba(50,32,12,0.5), 0 16px 36px -14px rgba(50,32,12,0.28), 0 0 0 1px rgba(232,215,168,0.14) inset',
            cursor: total ? 'zoom-in' : 'default',
            animation:'galHeroIn 620ms cubic-bezier(0.22,1,0.36,1) both',
          }}
            onClick={()=>{ if (item) setOpen(item); }}>

            {total === 0 ? (
              <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:'serif', fontSize:32, color:'rgba(250,246,232,0.5)'}}>No images in this category.</div>
            ) : (
              <XfadeImage src={item.src} alt={item.title} cls="uni-xf-img"/>
            )}

            <div style={{position:'absolute', inset:0, pointerEvents:'none',
              background:'linear-gradient(180deg, rgba(10,10,10,0.06) 0%, rgba(10,10,10,0.18) 48%, rgba(10,10,10,0.84) 100%)'}}/>
            {/* gold inner rim (Citadel × Embassy-One detail) */}
            <div style={{position:'absolute', inset:14, borderRadius:18, border:'1px solid rgba(232,215,168,0.28)', pointerEvents:'none'}}/>

            {/* panorama hint badge (top-left) */}
            {item && isPano(item) && (
              <div className="mono" style={{position:'absolute', top:30, left:30, padding:'8px 16px', borderRadius:105,
                background:'rgba(14,12,9,0.55)', border:'1px solid rgba(232,215,168,0.4)', backdropFilter:'blur(6px)', pointerEvents:'none',
                fontSize:12.5, letterSpacing:'0.24em', color:'var(--gold-soft)', textTransform:'uppercase'}}>Panorama</div>
            )}

            {/* maximize / full-screen chip (top-right) */}
            {item && (
              <button onClick={(ev)=>{ ev.stopPropagation(); setOpen(item); }} aria-label="View full screen"
                style={{position:'absolute', top:24, right:24, width:48, height:48, borderRadius:'50%',
                  background:'rgba(250,246,232,0.92)', border:'1px solid rgba(176,138,63,0.4)', color:'var(--gold-deep)',
                  display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', backdropFilter:'blur(6px)',
                  boxShadow:'0 6px 14px -4px rgba(50,32,12,0.3)', transition:'background 200ms ease, transform 160ms ease'}}
                onMouseEnter={(ev)=>{ev.currentTarget.style.background='var(--ivory)'; ev.currentTarget.style.transform='scale(1.06)';}}
                onMouseLeave={(ev)=>{ev.currentTarget.style.background='rgba(250,246,232,0.92)'; ev.currentTarget.style.transform='scale(1)';}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 1-1 1h-4"/></svg>
              </button>
            )}

            {/* caption (bottom-left) */}
            {item && (
              <div style={{position:'absolute', left:48, right:48, bottom:104, pointerEvents:'none'}}>
                <div className="mono" style={{fontSize:14, letterSpacing:'0.4em', color:'var(--gold-soft)'}}>
                  {cat.toUpperCase()} · {pad2(subIdx + 1)} OF {pad2(total)}
                </div>
                <div className="serif" style={{fontSize:68, fontWeight:300, lineHeight:0.98, letterSpacing:'-0.025em', marginTop:10,
                  color:'#fff7e6', textShadow:'0 6px 26px rgba(0,0,0,0.55)'}}>
                  {item.title}
                </div>
                <div style={{display:'flex', alignItems:'center', gap:16, marginTop:16}}>
                  <div style={{padding:'7px 16px', borderRadius:105, background:'rgba(20,14,6,0.5)',
                    border:'1px solid rgba(232,215,168,0.40)', backdropFilter:'blur(6px)'}}>
                    <span className="mono" style={{fontSize:12.5, letterSpacing:'0.22em', color:'var(--gold-soft)', textTransform:'uppercase'}}>
                      {item.tag}
                    </span>
                  </div>
                  <div style={{fontSize:17, color:'rgba(250,246,232,0.82)', fontStyle:'italic'}}>Tap to view full screen</div>
                </div>
              </div>
            )}

            {/* prev / counter / next control pill (overlay foot) */}
            {total > 1 && (
              <div style={{position:'absolute', left:0, right:0, bottom:34, display:'flex', justifyContent:'center'}}>
                <div onClick={(ev)=>ev.stopPropagation()} style={{display:'flex', alignItems:'center', gap:22, padding:'10px 16px', borderRadius:999,
                  background:'rgba(250,246,232,0.92)', border:'1px solid rgba(176,138,63,0.36)',
                  boxShadow:'0 16px 34px -10px rgba(50,32,12,0.45), 0 5px 12px rgba(40,28,10,0.18)', backdropFilter:'blur(8px)'}}>
                  <button onClick={prevSub} aria-label="previous" style={ctrlBtnStyle()}
                    onMouseEnter={(ev)=>{ev.currentTarget.style.background='var(--ivory)'; ev.currentTarget.style.transform='scale(1.06)';}}
                    onMouseLeave={(ev)=>{ev.currentTarget.style.background='rgba(250,246,232,0.95)'; ev.currentTarget.style.transform='scale(1)';}}>
                    <Icons.back width={20} height={20}/>
                  </button>
                  <div className="mono" style={{fontSize:18, letterSpacing:'0.1em', color:'var(--ink)', fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap', padding:'0 6px'}}>
                    {pad2(subIdx + 1)}<span style={{color:'var(--gold-deep)', margin:'0 6px', opacity:0.7}}>/</span>{pad2(total)}
                  </div>
                  <button onClick={nextSub} aria-label="next" style={ctrlBtnStyle()}
                    onMouseEnter={(ev)=>{ev.currentTarget.style.background='var(--ivory)'; ev.currentTarget.style.transform='scale(1.06)';}}
                    onMouseLeave={(ev)=>{ev.currentTarget.style.background='rgba(250,246,232,0.95)'; ev.currentTarget.style.transform='scale(1)';}}>
                    <Icons.arrow width={20} height={20}/>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ---- RIGHT THUMBNAIL STACK ---- */}
        <div style={{
          width:360, flexShrink:0, display:'flex', flexDirection:'column',
          opacity:e, transform:`translateY(${(1-e)*-14}px)`,
        }}>
          <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', paddingBottom:14,
            borderBottom:'1px solid var(--line)', marginBottom:16}}>
            <div className="mono" style={{fontSize:13, letterSpacing:'0.36em', color:'var(--gold-deep)', textTransform:'uppercase'}}>
              In this set
            </div>
            <div className="mono" style={{fontSize:13, letterSpacing:'0.2em', color:'var(--slate)', fontVariantNumeric:'tabular-nums'}}>
              {pad2(total)} TOTAL
            </div>
          </div>

          <div ref={stackRef} className="gal-stack" style={{flex:1, minHeight:0, overflowY:'auto', overflowX:'hidden',
            display:'flex', flexDirection:'column', gap:12, paddingRight:6}}>
            {items.map((it, idx) => (
              <div key={it.id} data-active={idx === subIdx ? '1' : '0'}>
                <ThumbCard item={it} idx={idx} active={idx === subIdx} onClick={()=>pickSub(idx)}/>
              </div>
            ))}
          </div>
        </div>
      </div>

      {open && <Lightbox item={open} items={items} onChange={setOpen} onClose={()=>setOpen(null)}/>}
    </div>
  );
}

function ctrlBtnStyle() {
  return {
    width:48, height:48, borderRadius:'50%', flexShrink:0,
    background:'rgba(250,246,232,0.95)', border:'1px solid rgba(176,138,63,0.36)',
    color:'var(--gold-deep)', display:'flex', alignItems:'center', justifyContent:'center',
    cursor:'pointer', transition:'background 220ms ease, transform 200ms ease',
    boxShadow:'0 6px 14px -4px rgba(50,32,12,0.3)',
  };
}

// ============================================================================
// Lightbox — full-bleed viewer, double-buffered crossfade, ESC / ← / → keys.
//   · Standard image: pointer-swipe + arrow keys + arrow buttons → prev/next.
//   · Panorama image: LETTERBOXED (contain) AND horizontally PANNABLE — drag
//     scrubs across the wide render; a hint pulses. Prev/next via arrow buttons.
// ============================================================================
function Lightbox({ item, items, onChange, onClose }) {
  const t = useLoop();
  const fadeIn = clamp(t/0.4);
  const idx = items.findIndex(x => x.id === item.id);
  const pano = isPano(item);

  const prev = () => onChange(items[(idx - 1 + items.length) % items.length]);
  const next = () => onChange(items[(idx + 1) % items.length]);

  // Pan state (panorama). Reset on image change.
  const [panX, setPanX] = React.useState(0);
  React.useEffect(() => { setPanX(0); }, [item.id]);

  const stageRef = React.useRef(null);
  const dragRef = React.useRef({ active:false, x:0, base:0, moved:false });

  const onLbDown = (e) => {
    dragRef.current = { active:true, x:e.clientX, base:panX, moved:false };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch(_){}
  };
  const onLbMove = (e) => {
    const d = dragRef.current;
    if (!d.active) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 5) d.moved = true;
    if (pano) {
      const el = stageRef.current;
      const boxW = el ? el.clientWidth : 1800;
      const boxH = el ? el.clientHeight : 1100;
      const imgW = boxH * 2;                          // 2:1 image scaled to box height
      const overflow = Math.max(0, (imgW - boxW) / 2 + 80);
      setPanX(clamp(d.base + dx, -overflow, overflow));
    }
  };
  const onLbUp = (e) => {
    const d = dragRef.current;
    if (!d.active) return;
    d.active = false;
    const dx = e.clientX - d.x;
    if (!pano) {
      const TH = 80;
      if (dx < -TH) next();
      else if (dx > TH) prev();
    }
  };

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape')     onClose();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx]);

  // Per-buffer panorama style — a 2:1 image laid out at width:200% centred so it
  // overflows the box symmetrically; translateX(panX) scrubs it. Standard images
  // use the .uni-lb-img contain CSS (styleFor returns undefined).
  const panoStyleFor = (isThisFront) => (pano && isThisFront)
    ? { objectFit:'contain', height:'100%', width:'200%', left:'50%', marginLeft:'-100%',
        transform:`translateX(${panX}px)`,
        transition: dragRef.current.active ? 'none' : 'opacity 280ms ease-out, transform 220ms cubic-bezier(0.22,1,0.36,1)' }
    : undefined;

  return (
    <div onClick={onClose} style={{
      position:'absolute', inset:0, zIndex:50,
      background:`rgba(0,0,0,${0.94*fadeIn})`,
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:'86%', height:'86%', position:'relative', borderRadius:15, overflow:'hidden', background:'#000',
        opacity: fadeIn, transform:`scale(${0.96+0.04*fadeIn})`,
        transition:'opacity 220ms ease',
      }}>

        {/* Double-buffered image stage */}
        <div ref={stageRef}
          onPointerDown={onLbDown} onPointerMove={onLbMove} onPointerUp={onLbUp} onPointerCancel={onLbUp}
          style={{position:'absolute', inset:0, background:'#000', cursor:'grab', touchAction:'none', overflow:'hidden'}}>
          <XfadeImage src={item.src} alt={item.title} cls="uni-lb-img" styleFor={panoStyleFor}/>
        </div>

        {/* caption gradient + content */}
        <div style={{position:'absolute', inset:0, background:'linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.85))', pointerEvents:'none'}}/>
        <div style={{position:'absolute', left:50, bottom:50, color:'var(--ivory)', pointerEvents:'none', maxWidth:'70%'}}>
          <div className="mono" style={{fontSize:15, letterSpacing:'0.3em', opacity:0.9, color:'var(--gold-soft)'}}>{item.tag}</div>
          <div className="serif" style={{fontSize:63, fontWeight:300, marginTop:15, letterSpacing:'-0.015em', lineHeight:1.0}}>{item.title}</div>
        </div>

        {/* panorama "drag to pan" hint */}
        {pano && (
          <div className="mono" style={{
            position:'absolute', top:25, left:25, display:'flex', alignItems:'center', gap:11,
            padding:'11px 19px', borderRadius:105,
            background:'rgba(245,241,232,0.1)', color:'var(--ivory)',
            fontSize:14, letterSpacing:'0.2em', textTransform:'uppercase',
            backdropFilter:'blur(6px)', pointerEvents:'none',
          }}>
            <span>Drag to pan</span>
            <svg width="20" height="14" viewBox="0 0 24 14" fill="none" stroke="var(--gold-soft)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{animation:'uniPanoHint 1.6s ease-in-out infinite'}}>
              <path d="M4 7 L20 7 M8 3 L4 7 L8 11 M16 3 L20 7 L16 11"/>
            </svg>
          </div>
        )}

        {/* counter + close (top-right) */}
        <div style={{position:'absolute', top:25, right:25, display:'flex', gap:11, alignItems:'center'}}>
          <div className="mono" style={{padding:'11px 19px', borderRadius:105, background:'rgba(245,241,232,0.1)', color:'var(--ivory)', fontSize:14, letterSpacing:'0.2em', backdropFilter:'blur(6px)'}}>
            {pad2(idx+1)} / {pad2(items.length)}
          </div>
          <button onClick={onClose} aria-label="close" style={{
            width:54, height:54, borderRadius:'50%',
            background:'rgba(245,241,232,0.1)', border:'1px solid rgba(245,241,232,0.3)',
            color:'var(--ivory)', display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', backdropFilter:'blur(6px)',
            transition:'background 200ms ease, transform 160ms ease',
          }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(245,241,232,0.2)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(245,241,232,0.1)';}}>
            <Icons.close width={22} height={22}/>
          </button>
        </div>

        {/* prev / next */}
        {items.length > 1 && (
          <React.Fragment>
            <button onClick={prev} aria-label="previous" style={lbNavBtn('left')}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(245,241,232,0.2)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(245,241,232,0.08)';}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6 L9 12 L15 18"/></svg>
            </button>
            <button onClick={next} aria-label="next" style={lbNavBtn('right')}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(245,241,232,0.2)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(245,241,232,0.08)';}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6 L15 12 L9 18"/></svg>
            </button>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

function lbNavBtn(side) {
  return {
    position:'absolute', top:'50%', [side]:28, marginTop:-37,
    width:74, height:74, borderRadius:'50%',
    background:'rgba(245,241,232,0.08)', border:'1px solid rgba(245,241,232,0.22)',
    color:'var(--ivory)', display:'flex', alignItems:'center', justifyContent:'center',
    cursor:'pointer', backdropFilter:'blur(8px)', zIndex:3,
    transition:'background 200ms ease, transform 160ms ease',
  };
}

window.Gallery = Gallery;
