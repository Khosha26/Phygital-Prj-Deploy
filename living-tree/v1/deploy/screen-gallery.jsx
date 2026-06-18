// ============================================================
// Gallery Screen — Living Tree · Kalyani Developers
// Category tabs · image grid · fullscreen lightbox w/ swipe
// Cinematic video poster experience
// ============================================================

(function () {

  // ─── inject keyframes once ─────────────────────────────────
  if (!document.getElementById('gallery-kf')) {
    const s = document.createElement('style');
    s.id = 'gallery-kf';
    s.textContent = `
      @keyframes gal-fadeIn     { from { opacity:0 }               to { opacity:1 } }
      @keyframes gal-fadeUp     { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:none } }
      @keyframes gal-scaleIn    { from { opacity:0; transform:scale(0.93) }     to { opacity:1; transform:scale(1) } }
      @keyframes gal-lbOpen     { from { opacity:0; transform:scale(0.92) }     to { opacity:1; transform:scale(1) } }
      @keyframes gal-imgSlideL  { from { opacity:0; transform:translateX(-36px) }  to { opacity:1; transform:none } }
      @keyframes gal-imgSlideR  { from { opacity:0; transform:translateX(36px) }   to { opacity:1; transform:none } }
      @keyframes gal-shimmer {
        0%   { background-position: -600px 0 }
        100% { background-position:  600px 0 }
      }
      @keyframes gal-pulse2 { 0%,100% { opacity:.7 } 50% { opacity:1 } }
      @keyframes gal-progressPulse {
        0%   { width: 0% }
        40%  { width: 58% }
        70%  { width: 75% }
        100% { width: 82% }
      }
      .gal-thumb:hover .gal-thumb-overlay { opacity:1 !important; }
      .gal-thumb:hover .gal-thumb-img     { transform:scale(1.055) !important; }
      .gal-video-card:hover .gal-vid-overlay { opacity:1 !important; }
      .gal-video-card:hover .gal-vid-img     { transform:scale(1.04) !important; }
      .gal-video-card:hover .gal-vid-play    { transform:scale(1.14) !important; }
      .gal-tab-btn:hover { background: rgba(217,178,122,0.1) !important; }
      .gal-nav-btn:hover { background: rgba(217,178,122,0.18) !important; border-color: rgba(217,178,122,0.6) !important; }
      .gal-close-btn:hover { background: rgba(217,178,122,0.18) !important; }
    `;
    document.head.appendChild(s);
  }

  // ─── video catalogue ────────────────────────────────────────
  const VIDEO_ITEMS = [
    { id:'vid-01', poster:'assets/renders/render-04.jpg',
      title:'LivingTree — Cinematic Reveal',
      duration:'3:42', label:'Launch Film',
      desc:'An aerial journey through 25 acres of curated green, unveiling the ten towers at dusk.' },
    { id:'vid-02', poster:'assets/renders/masterplan-03.jpg',
      title:'Master Plan Walkthrough',
      duration:'2:18', label:'Feature Film',
      desc:'Navigate the flowing-roots masterplan and discover 65 amenities across two clubhouses.' },
    { id:'vid-03', poster:'assets/renders/render-05.jpg',
      title:'Tower Numbering & Views',
      duration:'1:55', label:'Orientation Film',
      desc:'A structured tour of all ten towers, clusters, and their unique aspect views.' },
    { id:'vid-04', poster:'assets/renders/cover-01.png',
      title:'Designed for Life — Brand Film',
      duration:'4:10', label:'Brand Film',
      desc:'The philosophy of a residence rooted in luxury, branching into the future.' },
  ];

  // ─── All tabs ────────────────────────────────────────────────
  const ALL_TABS = [...GALLERY_CATS, 'Videos'];

  // ─── Thumbnail shimmer placeholder ─────────────────────────
  const Shimmer = () => (
    <div style={{
      position:'absolute', inset:0, borderRadius:8,
      background:'linear-gradient(90deg,rgba(217,178,122,0.04) 25%,rgba(217,178,122,0.09) 50%,rgba(217,178,122,0.04) 75%)',
      backgroundSize:'600px 100%',
      animation:'gal-shimmer 1.4s infinite linear',
    }}/>
  );

  // ─── Thumbnail component ─────────────────────────────────────
  const Thumb = ({ item, index, onOpen }) => {
    const [loaded, setLoaded] = React.useState(false);
    return (
      <div
        className="gal-thumb"
        onClick={() => onOpen(item)}
        style={{
          position:'relative', overflow:'hidden',
          borderRadius:8,
          border:`1px solid ${THEME.line}`,
          cursor:'pointer',
          aspectRatio: item.cat === 'Floor Plans' ? '4/3' : item.cat === 'Masterplan' ? '16/9' : '3/2',
          background: THEME.panel,
          animation:`gal-fadeUp 0.5s ease ${(index % 6) * 0.07}s both`,
          boxShadow:'0 6px 28px rgba(0,0,0,0.45)',
          transition:'box-shadow 0.3s',
        }}
      >
        {!loaded && <Shimmer />}
        <img
          className="gal-thumb-img"
          src={item.src}
          alt={item.title}
          onLoad={() => setLoaded(true)}
          style={{
            width:'100%', height:'100%', objectFit:'cover', display:'block',
            transition:'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)',
          }}
        />
        {/* subtle gold vignette */}
        <div style={{
          position:'absolute', inset:0,
          background:'linear-gradient(160deg,transparent 55%,rgba(10,18,13,0.72) 100%)',
          pointerEvents:'none',
        }}/>
        {/* hover overlay */}
        <div
          className="gal-thumb-overlay"
          style={{
            position:'absolute', inset:0, opacity:0,
            background:'rgba(10,18,13,0.48)',
            backdropFilter:'blur(1px)',
            display:'flex', alignItems:'flex-end',
            padding:'14px 16px',
            transition:'opacity 0.3s',
          }}
        >
          <div>
            <div style={{
              fontSize:9, letterSpacing:2.2, textTransform:'uppercase',
              color:THEME.gold, marginBottom:4,
            }}>{item.tag}</div>
            <div style={{
              fontFamily:THEME.serif, fontSize:14, color:THEME.cream, lineHeight:1.3,
            }}>{item.title}</div>
          </div>
          <div style={{
            marginLeft:'auto',
            width:32, height:32, borderRadius:'50%',
            background:'rgba(217,178,122,0.25)',
            border:`1px solid ${THEME.lineStrong}`,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke={THEME.gold} strokeWidth="2" strokeLinecap="round">
              <path d="M3 13L13 3M6 3h7v7"/>
            </svg>
          </div>
        </div>
        {/* tag chip bottom-right (always visible) */}
        <div style={{
          position:'absolute', bottom:10, right:10,
          padding:'3px 9px', borderRadius:999,
          background:'rgba(10,18,13,0.72)',
          border:`1px solid ${THEME.lineSoft}`,
          fontSize:9, letterSpacing:1.8, color:THEME.dim,
          textTransform:'uppercase', pointerEvents:'none',
        }}>{item.tag}</div>
      </div>
    );
  };

  // ─── Video card component ────────────────────────────────────
  const VideoCard = ({ item, index, onOpen }) => {
    const [loaded, setLoaded] = React.useState(false);
    return (
      <div
        className="gal-video-card"
        onClick={() => onOpen(item)}
        style={{
          position:'relative', overflow:'hidden',
          borderRadius:10,
          border:`1px solid ${THEME.line}`,
          cursor:'pointer',
          background:THEME.panel,
          animation:`gal-fadeUp 0.5s ease ${index * 0.09}s both`,
          boxShadow:'0 8px 36px rgba(0,0,0,0.5)',
        }}
      >
        {/* poster */}
        <div style={{ position:'relative', aspectRatio:'16/9', overflow:'hidden' }}>
          {!loaded && <Shimmer />}
          <img
            className="gal-vid-img"
            src={item.poster}
            alt={item.title}
            onLoad={() => setLoaded(true)}
            style={{
              width:'100%', height:'100%', objectFit:'cover', display:'block',
              transition:'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)',
              filter:'brightness(0.72) saturate(0.88)',
            }}
          />
          {/* cinematic dark overlay */}
          <div style={{
            position:'absolute', inset:0,
            background:'linear-gradient(180deg,rgba(10,18,13,0.22) 0%,rgba(10,18,13,0.62) 100%)',
            pointerEvents:'none',
          }}/>
          {/* hover overlay */}
          <div
            className="gal-vid-overlay"
            style={{
              position:'absolute', inset:0, opacity:0,
              background:'rgba(10,18,13,0.35)',
              transition:'opacity 0.35s',
            }}
          />
          {/* duration badge */}
          <div style={{
            position:'absolute', top:10, right:10,
            padding:'3px 9px', borderRadius:999,
            background:'rgba(10,18,13,0.8)',
            border:`1px solid ${THEME.lineSoft}`,
            fontSize:10, letterSpacing:0.8, color:THEME.cream,
          }}>{item.duration}</div>
          {/* label chip */}
          <div style={{
            position:'absolute', top:10, left:10,
            padding:'3px 9px', borderRadius:999,
            background:'rgba(217,178,122,0.18)',
            border:`1px solid ${THEME.lineStrong}`,
            fontSize:9, letterSpacing:2, color:THEME.gold,
            textTransform:'uppercase',
          }}>{item.label}</div>
          {/* Play button */}
          <div
            className="gal-vid-play"
            style={{
              position:'absolute', inset:0,
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            <div style={{
              width:54, height:54, borderRadius:'50%',
              background:'rgba(217,178,122,0.22)',
              border:`1.5px solid rgba(217,178,122,0.7)`,
              backdropFilter:'blur(8px)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
            }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill={THEME.gold}>
                <path d="M6 4l12 6-12 6V4z"/>
              </svg>
            </div>
          </div>
        </div>
        {/* info strip */}
        <div style={{ padding:'14px 16px 16px' }}>
          <div style={{
            fontFamily:THEME.serif, fontSize:16, fontWeight:500,
            color:THEME.cream, marginBottom:5, lineHeight:1.25,
          }}>{item.title}</div>
          <div style={{
            fontSize:11, color:THEME.dim, lineHeight:1.6,
          }}>{item.desc}</div>
        </div>
      </div>
    );
  };

  // ─── Lightbox ───────────────────────────────────────────────
  const Lightbox = ({ items, startIndex, onClose }) => {
    const [idx, setIdx]         = React.useState(startIndex);
    const [dir, setDir]         = React.useState(null);   // 'left' | 'right'
    const [key, setKey]         = React.useState(0);
    const [imgLoaded, setLoaded]= React.useState(false);
    const dragRef               = React.useRef({ startX: 0, dragging: false });

    const go = React.useCallback((delta) => {
      setDir(delta > 0 ? 'right' : 'left');
      setLoaded(false);
      setKey(k => k + 1);
      setIdx(i => (i + delta + items.length) % items.length);
    }, [items.length]);

    // keyboard nav
    React.useEffect(() => {
      const handler = (e) => {
        if (e.key === 'ArrowRight') go(1);
        if (e.key === 'ArrowLeft')  go(-1);
        if (e.key === 'Escape')     onClose();
      };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }, [go, onClose]);

    // pointer drag
    const onPointerDown = (e) => {
      dragRef.current = { startX: e.clientX, dragging: true };
    };
    const onPointerUp = (e) => {
      if (!dragRef.current.dragging) return;
      const dx = e.clientX - dragRef.current.startX;
      dragRef.current.dragging = false;
      if (Math.abs(dx) > 44) go(dx < 0 ? 1 : -1);
    };

    const item = items[idx];
    const anim = dir === 'right' ? 'gal-imgSlideR 0.38s cubic-bezier(0.25,0.46,0.45,0.94) both'
               : dir === 'left'  ? 'gal-imgSlideL 0.38s cubic-bezier(0.25,0.46,0.45,0.94) both'
               : 'gal-lbOpen 0.42s cubic-bezier(0.34,1.56,0.64,1) both';

    return (
      <div
        style={{
          position:'fixed', inset:0, zIndex:9999,
          background:'rgba(6,12,8,0.97)',
          backdropFilter:'blur(24px)',
          display:'flex', flexDirection:'column',
          animation:'gal-fadeIn 0.25s ease',
        }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {/* top bar */}
        <div style={{
          height:64, flexShrink:0,
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'0 32px',
          borderBottom:`1px solid ${THEME.lineSoft}`,
          background:'rgba(10,18,13,0.6)',
        }}>
          {/* counter */}
          <div style={{
            fontFamily:THEME.serif, fontSize:18, fontWeight:500, color:THEME.cream,
          }}>
            <span style={{ color:THEME.gold }}>{idx + 1}</span>
            <span style={{ color:THEME.dim, fontSize:14 }}> / {items.length}</span>
          </div>
          {/* title + tag */}
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:9, letterSpacing:3, textTransform:'uppercase', color:THEME.gold, marginBottom:4 }}>
              {item.tag || item.cat}
            </div>
            <div style={{ fontFamily:THEME.serif, fontSize:19, fontWeight:500, color:THEME.cream }}>
              {item.title}
            </div>
          </div>
          {/* close */}
          <button
            className="gal-close-btn"
            onClick={onClose}
            style={{
              width:42, height:42, borderRadius:'50%',
              background:'rgba(255,255,255,0.06)',
              border:`1px solid ${THEME.line}`,
              color:THEME.cream, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:18, lineHeight:1,
              transition:'background 0.2s, border-color 0.2s',
            }}
          >×</button>
        </div>

        {/* main image area */}
        <div style={{ flex:1, position:'relative', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', userSelect:'none' }}>
          {/* prev */}
          <button
            className="gal-nav-btn"
            onClick={(e) => { e.stopPropagation(); go(-1); }}
            style={{
              position:'absolute', left:28, zIndex:10,
              width:48, height:48, borderRadius:'50%',
              background:'rgba(10,18,13,0.7)',
              border:`1px solid ${THEME.line}`,
              color:THEME.cream, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:22, lineHeight:1,
              transition:'background 0.2s, border-color 0.2s',
            }}
          >←</button>

          {/* image */}
          <div style={{ position:'relative', maxWidth:'92%', maxHeight:'100%' }}>
            {!imgLoaded && (
              <div style={{
                position:'absolute', inset:0,
                background:THEME.panel,
                display:'flex', alignItems:'center', justifyContent:'center',
                zIndex:2,
              }}>
                <div style={{
                  width:36, height:36, borderRadius:'50%',
                  border:`2px solid ${THEME.lineSoft}`,
                  borderTopColor:THEME.gold,
                  animation:'gal-pulse2 1s linear infinite',
                }}/>
              </div>
            )}
            <img
              key={key}
              src={item.src}
              alt={item.title}
              onLoad={() => setLoaded(true)}
              draggable={false}
              style={{
                maxWidth:'100%', maxHeight:'calc(100vh - 160px)',
                objectFit:'contain', display:'block',
                borderRadius:6,
                boxShadow:'0 32px 100px rgba(0,0,0,0.7)',
                animation:anim,
                opacity: imgLoaded ? 1 : 0,
                transition:'opacity 0.2s',
              }}
            />
          </div>

          {/* next */}
          <button
            className="gal-nav-btn"
            onClick={(e) => { e.stopPropagation(); go(1); }}
            style={{
              position:'absolute', right:28, zIndex:10,
              width:48, height:48, borderRadius:'50%',
              background:'rgba(10,18,13,0.7)',
              border:`1px solid ${THEME.line}`,
              color:THEME.cream, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:22, lineHeight:1,
              transition:'background 0.2s, border-color 0.2s',
            }}
          >→</button>
        </div>

        {/* bottom dot strip */}
        <div style={{
          height:48, flexShrink:0,
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        }}>
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDir(i > idx ? 'right' : 'left'); setLoaded(false); setKey(k=>k+1); setIdx(i); }}
              style={{
                width: i === idx ? 24 : 7,
                height:7, borderRadius:999,
                background: i === idx ? THEME.gold : THEME.lineSoft,
                border:'none', cursor:'pointer', padding:0,
                transition:'width 0.3s, background 0.3s',
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  // ─── Video player overlay ─────────────────────────────────
  const VideoPlayer = ({ item, onClose }) => {
    const [progress] = React.useState(0);

    // keyboard close
    React.useEffect(() => {
      const handler = (e) => { if (e.key === 'Escape') onClose(); };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
      <div style={{
        position:'fixed', inset:0, zIndex:9999,
        background:'rgba(4,10,6,0.98)',
        display:'flex', flexDirection:'column',
        animation:'gal-fadeIn 0.3s ease',
      }}>
        {/* top bar */}
        <div style={{
          height:64, flexShrink:0,
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'0 32px',
          borderBottom:`1px solid ${THEME.lineSoft}`,
        }}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8,
            padding:'4px 12px', borderRadius:999,
            background:'rgba(217,178,122,0.1)',
            border:`1px solid ${THEME.lineStrong}`,
            fontSize:9, letterSpacing:2.5, color:THEME.gold, textTransform:'uppercase',
          }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:THEME.gold, animation:'gal-pulse2 1.4s ease-in-out infinite' }}/>
            Preview
          </div>
          <div style={{ fontFamily:THEME.serif, fontSize:20, fontWeight:500, color:THEME.cream }}>
            {item.title}
          </div>
          <button
            className="gal-close-btn"
            onClick={onClose}
            style={{
              width:42, height:42, borderRadius:'50%',
              background:'rgba(255,255,255,0.06)',
              border:`1px solid ${THEME.line}`,
              color:THEME.cream, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:18, lineHeight:1,
              transition:'background 0.2s',
            }}
          >×</button>
        </div>

        {/* poster + play area */}
        <div style={{ flex:1, position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
          {/* poster image */}
          <div style={{
            position:'relative', borderRadius:8, overflow:'hidden',
            boxShadow:'0 40px 120px rgba(0,0,0,0.8)',
            animation:'gal-lbOpen 0.5s cubic-bezier(0.34,1.56,0.64,1)',
            maxWidth:960, width:'80%',
          }}>
            <img
              src={item.poster}
              alt={item.title}
              style={{
                width:'100%', display:'block',
                aspectRatio:'16/9', objectFit:'cover',
                filter:'brightness(0.65) saturate(0.8)',
              }}
            />
            {/* cinematic overlay */}
            <div style={{
              position:'absolute', inset:0,
              background:'linear-gradient(180deg,rgba(6,12,8,0.18) 0%,rgba(6,12,8,0.7) 100%)',
            }}/>
            {/* large play button */}
            <div style={{
              position:'absolute', inset:0,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <div style={{
                width:88, height:88, borderRadius:'50%',
                background:'rgba(217,178,122,0.2)',
                border:`2px solid rgba(217,178,122,0.65)`,
                backdropFilter:'blur(12px)',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 16px 64px rgba(0,0,0,0.6), 0 0 0 16px rgba(217,178,122,0.06)',
                animation:'gal-pulse2 2s ease-in-out infinite',
              }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill={THEME.gold}>
                  <path d="M8 5v14l11-7L8 5z"/>
                </svg>
              </div>
            </div>
            {/* info strip bottom */}
            <div style={{
              position:'absolute', bottom:0, left:0, right:0,
              padding:'28px 28px 22px',
              background:'linear-gradient(180deg,transparent,rgba(6,12,8,0.92))',
              display:'flex', alignItems:'flex-end', justifyContent:'space-between',
            }}>
              <div>
                <div style={{ fontSize:9, letterSpacing:2.5, textTransform:'uppercase', color:THEME.gold, marginBottom:5 }}>
                  {item.label}
                </div>
                <div style={{ fontFamily:THEME.serif, fontSize:22, fontWeight:500, color:THEME.cream, marginBottom:6 }}>
                  {item.title}
                </div>
                <div style={{ fontSize:12, color:THEME.dim, maxWidth:480, lineHeight:1.6 }}>
                  {item.desc}
                </div>
              </div>
              <div style={{
                fontSize:20, fontFamily:THEME.serif, color:THEME.dim,
                letterSpacing:1,
              }}>{item.duration}</div>
            </div>
          </div>
        </div>

        {/* faux progress bar area */}
        <div style={{
          height:72, flexShrink:0, padding:'0 40px',
          display:'flex', flexDirection:'column', justifyContent:'center', gap:10,
        }}>
          {/* scrubber */}
          <div style={{
            height:3, borderRadius:999,
            background:'rgba(217,178,122,0.15)',
            position:'relative', overflow:'hidden',
          }}>
            <div style={{
              height:'100%', borderRadius:999,
              background:`linear-gradient(90deg, ${THEME.gold}, ${THEME.goldDeep})`,
              animation:'gal-progressPulse 6s ease-in-out infinite',
              boxShadow:`0 0 8px rgba(217,178,122,0.5)`,
            }}/>
          </div>
          {/* time / controls row */}
          <div style={{
            display:'flex', alignItems:'center', gap:18,
            fontSize:11, color:THEME.dim,
          }}>
            <span style={{ fontVariantNumeric:'tabular-nums', letterSpacing:0.5 }}>0:00</span>
            <div style={{ display:'flex', gap:14 }}>
              {/* rewind */}
              <button style={{ background:'none', border:'none', cursor:'pointer', color:THEME.dim, fontSize:13, padding:0 }}>⏮</button>
              {/* play/pause */}
              <div style={{
                width:30, height:30, borderRadius:'50%',
                background:THEME.goldSoft,
                border:`1px solid ${THEME.lineStrong}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                cursor:'pointer',
              }}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill={THEME.gold}>
                  <path d="M6 3h2v10H6V3zm4 0h2v10h-2V3z"/>
                </svg>
              </div>
              {/* forward */}
              <button style={{ background:'none', border:'none', cursor:'pointer', color:THEME.dim, fontSize:13, padding:0 }}>⏭</button>
            </div>
            <span style={{ fontVariantNumeric:'tabular-nums', letterSpacing:0.5 }}>{item.duration}</span>
            <div style={{ marginLeft:'auto', fontSize:10, letterSpacing:2, textTransform:'uppercase', color:THEME.gold }}>
              Preview · Full video available on request
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── Main GalleryScreen ──────────────────────────────────────
  function GalleryScreen({ onBack, navigate }) {
    const [activeTab, setActiveTab] = React.useState('Hero Render');
    const [lightbox, setLightbox]   = React.useState(null);  // { items, index }
    const [videoItem, setVideoItem] = React.useState(null);

    // filter items by tab
    const tabItems = React.useMemo(() => {
      if (activeTab === 'Videos') return [];
      return GALLERY_ITEMS.filter(it => it.cat === activeTab);
    }, [activeTab]);

    const openLightbox = React.useCallback((item) => {
      const idx = tabItems.findIndex(i => i.id === item.id);
      setLightbox({ items: tabItems, index: idx < 0 ? 0 : idx });
    }, [tabItems]);

    const closeLightbox = React.useCallback(() => setLightbox(null), []);
    const closeVideo    = React.useCallback(() => setVideoItem(null), []);

    // count per category for the tab badge
    const catCount = React.useMemo(() => {
      const m = {};
      for (const cat of GALLERY_CATS) {
        m[cat] = GALLERY_ITEMS.filter(i => i.cat === cat).length;
      }
      m['Videos'] = VIDEO_ITEMS.length;
      return m;
    }, []);

    return (
      <>
        <ScreenShell
          title="Gallery"
          eyebrow="Renders · Plans · Visuals"
          onBack={onBack}
          scroll={true}
          pad={false}
        >
          {/* Tab bar */}
          <div style={{
            position:'sticky', top:0, zIndex:20,
            background:'rgba(9,16,11,0.86)',
            backdropFilter:'blur(16px)',
            WebkitBackdropFilter:'blur(16px)',
            borderBottom:`1px solid ${THEME.lineSoft}`,
            padding:'0 40px',
            display:'flex', alignItems:'center', gap:4,
            height:54,
          }}>
            {ALL_TABS.map(tab => {
              const active = tab === activeTab;
              return (
                <button
                  key={tab}
                  className="gal-tab-btn"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    display:'flex', alignItems:'center', gap:6,
                    padding:'7px 16px', borderRadius:999,
                    background: active ? THEME.goldSoft : 'transparent',
                    border: active ? `1px solid ${THEME.lineStrong}` : '1px solid transparent',
                    color: active ? THEME.gold : THEME.dim,
                    cursor:'pointer',
                    fontSize:11, fontWeight: active ? 600 : 400,
                    letterSpacing: active ? 0.8 : 0.4,
                    textTransform:'uppercase',
                    fontFamily:THEME.sans,
                    transition:'all 0.22s',
                    whiteSpace:'nowrap',
                  }}
                >
                  {tab}
                  <span style={{
                    fontSize:9.5, fontWeight:500, letterSpacing:0,
                    color: active ? THEME.gold : 'rgba(244,234,216,0.38)',
                    fontFamily:THEME.sans,
                  }}>{catCount[tab]}</span>
                </button>
              );
            })}

            {/* right side: category description */}
            <div style={{
              marginLeft:'auto',
              fontSize:11, color:THEME.dim, letterSpacing:0.3,
              fontStyle:'italic', fontFamily:THEME.serif,
            }}>
              {activeTab === 'Hero Render'  && 'Architectural renders — day and night'}
              {activeTab === 'Masterplan'   && '25 acres · 10 towers · flowing-roots layout'}
              {activeTab === 'Landscape'    && 'Brand identity & site imagery'}
              {activeTab === 'Floor Plans'  && '1 · 2 · 2.5 · 3 BHK — East & West variants'}
              {activeTab === 'Brochure'     && 'Printed collateral & marketing assets'}
              {activeTab === 'Videos'       && 'Cinematic films — available on request'}
            </div>
          </div>

          {/* content area */}
          <div style={{ padding:'32px 40px 52px' }}>

            {/* ─ Image grid ─ */}
            {activeTab !== 'Videos' && (
              <>
                {tabItems.length === 0 ? (
                  <div style={{
                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                    height:400, gap:14,
                  }}>
                    <div style={{
                      width:56, height:56, borderRadius:'50%',
                      background:THEME.goldSoft, border:`1px solid ${THEME.lineStrong}`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={THEME.gold} strokeWidth="1.5" strokeLinecap="round">
                        <rect x="3" y="3" width="18" height="18" rx="3"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                      </svg>
                    </div>
                    <div style={{ fontFamily:THEME.serif, fontSize:20, color:THEME.dim }}>No assets in this category yet</div>
                  </div>
                ) : (
                  <div style={{
                    display:'grid',
                    gridTemplateColumns:
                      activeTab === 'Floor Plans' ? 'repeat(3, 1fr)'
                      : activeTab === 'Masterplan' ? '1fr'
                      : activeTab === 'Brochure'  ? 'repeat(2, 1fr)'
                      : 'repeat(2, 1fr)',
                    gap: activeTab === 'Masterplan' ? 0 : 20,
                  }}>
                    {tabItems.map((item, i) => (
                      <Thumb key={item.id} item={item} index={i} onOpen={openLightbox} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ─ Videos tab ─ */}
            {activeTab === 'Videos' && (
              <>
                {/* intro eyebrow */}
                <div style={{
                  marginBottom:28,
                  display:'flex', alignItems:'baseline', gap:16,
                }}>
                  <div style={{ fontFamily:THEME.serif, fontSize:26, fontWeight:400, color:THEME.cream }}>
                    Cinematic Films
                  </div>
                  <div style={{
                    fontSize:11, color:THEME.dim, letterSpacing:0.3, fontStyle:'italic',
                  }}>Full-resolution films available on request from the sales team.</div>
                </div>
                <div style={{
                  display:'grid',
                  gridTemplateColumns:'repeat(2, 1fr)',
                  gap:22,
                }}>
                  {VIDEO_ITEMS.map((item, i) => (
                    <VideoCard key={item.id} item={item} index={i} onOpen={setVideoItem} />
                  ))}
                </div>
              </>
            )}

          </div>
        </ScreenShell>

        {/* Lightbox portal */}
        {lightbox && (
          <Lightbox
            items={lightbox.items}
            startIndex={lightbox.index}
            onClose={closeLightbox}
          />
        )}

        {/* Video player portal */}
        {videoItem && (
          <VideoPlayer item={videoItem} onClose={closeVideo} />
        )}
      </>
    );
  }

  window.SCREENS = window.SCREENS || {};
  window.SCREENS['gallery'] = GalleryScreen;

})();
