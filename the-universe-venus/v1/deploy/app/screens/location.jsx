// Location — REAL, expandable Leaflet tile map of The Universe (Nehru Nagar).
// ─────────────────────────────────────────────────────────────────────────
//  · Live tile map (zoom in for real street/building detail — not a flat image).
//    DEFAULT = VECTOR (Carto Voyager); toggle → SATELLITE (Esri World Imagery).
//  · Functional pins: every POI marker + every rail row selects its landmark.
//  · On select → the surroundings BLUR (focus vignette), a glowing line FLIES
//    from the project to the destination, and the camera follows it with a
//    cinematic pull-back, settling framed on both endpoints.
//  · Floating liquid-glass HUD + POI rail over a full-bleed map.
//  Needs network for live tiles (kiosk has wifi); dark fallback if offline.
//  Data: MAP_VIEW + LOCATION_ADVANTAGES + PROJECT.location (app/data.jsx).

const LOC_KEYS_ID = 'uni-location-leaflet-keys';
function ensureLocKeys() {
  if (typeof document === 'undefined' || document.getElementById(LOC_KEYS_ID)) return;
  const s = document.createElement('style'); s.id = LOC_KEYS_ID;
  s.textContent = `
  .leaflet-container{ background:#ece6dc; font-family:'Inter',system-ui,sans-serif; outline:none; }
  .uni-divicon{ background:transparent; border:none; }
  .uni-poi{ position:absolute; left:0; top:0; transform:translate(-50%,-50%); cursor:pointer; }
  .uni-poi .dot{ width:34px;height:34px;border-radius:50%; display:flex;align-items:center;justify-content:center;
     font-size:16px;font-weight:800;color:#1a130a; background:var(--shade,#c9a05e); border:2px solid #fff8e0;
     box-shadow:0 4px 12px rgba(0,0,0,0.55); transition:transform .25s cubic-bezier(0.22,1,0.36,1), box-shadow .25s, opacity .3s; }
  .uni-poi.dim .dot{ opacity:0.36; }
  .uni-poi.sel .dot{ transform:scale(1.32); box-shadow:0 0 0 4px rgba(255,248,224,0.42), 0 0 28px var(--shade); }
  .uni-poi .tip{ position:absolute; left:50%; bottom:42px; transform:translateX(-50%); white-space:nowrap;
     background:var(--shade); color:#1a130a; font-family:'JetBrains Mono',monospace; font-size:12px;font-weight:700;
     padding:6px 13px;border-radius:13px; box-shadow:0 5px 14px rgba(0,0,0,0.5); }
  .uni-proj{ position:absolute; left:0; top:0; transform:translate(-50%,-50%); width:60px;height:60px; }
  .uni-proj .core{ position:absolute; inset:11px; border-radius:50%; background:#0a0807; border:3px solid #ead7a8;
     display:flex;align-items:center;justify-content:center; box-shadow:0 0 22px rgba(232,215,168,0.75); z-index:3; }
  .uni-proj .ring{ position:absolute; left:50%;top:50%; border-radius:50%; border:2px solid #ead7a8;
     transform:translate(-50%,-50%); animation:uniProjRing 2.8s ease-out infinite; }
  @keyframes uniProjRing{ 0%{width:30px;height:30px;opacity:0.75;} 100%{width:152px;height:152px;opacity:0;} }
  .uni-fly-line{ filter:drop-shadow(0 0 6px rgba(232,215,168,0.95)); }
  .uni-comet{ filter:drop-shadow(0 0 9px rgba(255,248,224,0.95)); }
  .loc-vignette{ position:absolute; inset:0; pointer-events:none; z-index:5; opacity:0; transition:opacity .65s ease;
     background:radial-gradient(ellipse 60% 62% at 50% 52%, transparent 40%, rgba(6,8,12,0.62) 100%);
     -webkit-backdrop-filter:blur(3px); backdrop-filter:blur(3px);
     -webkit-mask-image:radial-gradient(ellipse 58% 60% at 50% 52%, transparent 42%, #000 92%);
     mask-image:radial-gradient(ellipse 58% 60% at 50% 52%, transparent 42%, #000 92%); }
  .loc-vignette.on{ opacity:1; }
  @keyframes locRowIn{ 0%{opacity:0;transform:translateX(16px);} 100%{opacity:1;transform:translateX(0);} }
  @keyframes locCardIn{ 0%{opacity:0;transform:translateY(14px) scale(0.97);} 100%{opacity:1;transform:translateY(0) scale(1);} }
  @keyframes locLive{ 0%,100%{opacity:0.95;} 50%{opacity:0.45;} }
  @keyframes poiPop{ 0%{opacity:0;transform:scale(0.2);} 60%{opacity:1;transform:scale(1.14);} 100%{opacity:1;transform:scale(1);} }
  .uni-catbtn{ transition:transform 180ms cubic-bezier(0.22,1,0.36,1), box-shadow 180ms ease, border-color 180ms ease, background 180ms ease; }
  .uni-catbtn:hover{ background:rgba(255,255,255,0.78) !important; border-color:rgba(176,138,63,0.5) !important; box-shadow:0 12px 28px rgba(176,138,63,0.2) !important; }
  .uni-catbtn:active{ transform:scale(0.985); }
  .uni-catbtn:hover .uni-catbtn-arrow{ transform:translateX(5px); }
  .uni-catbtn-arrow{ transition:transform 220ms cubic-bezier(0.22,1,0.36,1); }
  .uni-back-cats{ transition:transform 160ms ease-out, color 160ms ease; }
  .uni-back-cats:hover{ color:var(--gold-deep) !important; }
  .uni-back-cats:active{ transform:scale(0.97); }
  .loc-rail-scroll::-webkit-scrollbar{ width:8px; }
  .loc-rail-scroll::-webkit-scrollbar-thumb{ background:rgba(176,138,63,0.32); border-radius:8px; }
  .loc-rail-scroll::-webkit-scrollbar-track{ background:transparent; }
  `;
  document.head.appendChild(s);
}

// ── geo helpers ─────────────────────────────────────────────────────────────
function bearingDeg(from, to) {
  const dLat = to.lat - from.lat;
  const dLng = (to.lng - from.lng) * Math.cos((from.lat + to.lat) / 2 * Math.PI / 180);
  return (Math.atan2(dLng, dLat) * 180 / Math.PI + 360) % 360;
}
function bearingWord(deg) {
  const d = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return d[Math.round(((deg % 360 + 360) % 360) / 22.5) % 16];
}
function geoKm(from, to) {
  const dLat = (to.lat - from.lat) * 111;
  const dLng = (to.lng - from.lng) * 111 * Math.cos(from.lat * Math.PI / 180);
  return Math.hypot(dLat, dLng);
}

const CAT_META = {
  'Connectivity': { glyph:'↗', shade:'#d8b573' },
  'Education':    { glyph:'◆', shade:'#c9a05e' },
  'Healthcare':   { glyph:'✚', shade:'#e3c787' },
  'Lifestyle':    { glyph:'★', shade:'#ead7a8' },
  'On-site':      { glyph:'◉', shade:'#fff8e0' },
};

function useEnrichedPois() {
  return React.useMemo(() => {
    const o = PROJECT.location.coords;
    return LOCATION_ADVANTAGES.map(p => {
      const bearing = bearingDeg(o, { lat:p.lat, lng:p.lng });
      const km = geoKm(o, { lat:p.lat, lng:p.lng });
      const onsite = p.cat === 'On-site' || km < 0.18;
      return { ...p, bearing, km, onsite, meta: CAT_META[p.cat] || { glyph:'·', shade:'#c9a05e' } };
    });
  }, []);
}

function poiHtml(p, sel, anySel, popIn, idx) {
  // popIn → the category just opened: pins fade/scale in, staggered, so the map
  // "reveals" the landmarks in sync with the rail list opening on the right.
  const anim = popIn ? `animation:poiPop .52s cubic-bezier(0.22,1,0.36,1) ${(idx || 0) * 55}ms both;` : '';
  return `<div class="uni-poi ${sel ? 'sel' : ''} ${anySel && !sel ? 'dim' : ''}" style="--shade:${p.meta.shade}">
    ${sel ? `<div class="tip">${p.label} · ${p.dist}</div>` : ''}
    <div class="dot" style="${anim}">${p.meta.glyph}</div>
  </div>`;
}

// ════════════════════════════════════════════════════════════════════════
//  LocationScreen (root)
// ════════════════════════════════════════════════════════════════════════
function LocationScreen() {
  ensureLocKeys();
  const allPois = useEnrichedPois();
  const origin = PROJECT.location.coords;

  const [layer, setLayer] = React.useState('vector');   // DEFAULT = vector
  const [cat, setCat] = React.useState(null);            // null = category menu; else a category is open
  const [selectedLabel, setSelectedLabel] = React.useState(null);
  const [focusOn, setFocusOn] = React.useState(false);

  const mapElRef = React.useRef(null);
  const mapRef = React.useRef(null);
  const tilesRef = React.useRef({});
  const markersRef = React.useRef({});
  const lineRef = React.useRef(null);
  const cometRef = React.useRef(null);
  const animRef = React.useRef(0);
  const timerRef = React.useRef(null);
  const prevCatRef = React.useRef(null);  // detects a fresh category open → pins pop in

  // one summary card per category (glyph, count, nearest landmark) for the menu
  const catSummaries = React.useMemo(() => {
    const names = Array.from(new Set(LOCATION_ADVANTAGES.map(p => p.cat)));
    return names.map(name => {
      const items = allPois.filter(p => p.cat === name);
      const nearest = items.reduce((a, b) => (a && a.km <= b.km ? a : b), null);
      const meta = CAT_META[name] || { glyph: '·', shade: '#c9a05e' };
      return { name, glyph: meta.glyph, shade: meta.shade, count: items.length, nearest };
    });
  }, [allPois]);

  // no category open → no landmark pins; a category open → only its pins
  const filtered = React.useMemo(
    () => (cat ? allPois.filter(p => p.cat === cat) : []),
    [cat, allPois]
  );
  const selected = allPois.find(p => p.label === selectedLabel) || null;
  const coordStr = `${origin.lat.toFixed(4)}°N · ${origin.lng.toFixed(4)}°E · ${PROJECT.location.pincode}`;

  const openCat = (name) => { setSelectedLabel(null); setCat(name); };
  const backToCats = () => { setSelectedLabel(null); setCat(null); };

  // opening a category → camera glides out to FRAME that category's landmarks
  // (with the project), so the reveal of its pins reads as one motion.
  React.useEffect(() => {
    const map = mapRef.current; if (!map || !cat) return;
    const pins = allPois.filter(p => p.cat === cat);
    if (!pins.length) return;
    if (pins.length === 1) {
      map.flyTo([pins[0].lat, pins[0].lng], 15.5, { duration: 0.7 });
    } else {
      const b = L.latLngBounds(pins.map(p => [p.lat, p.lng]));
      b.extend([origin.lat, origin.lng]);
      map.flyToBounds(b.pad(0.18), { duration: 0.72, easeLinearity: 0.25,
        paddingTopLeft: L.point(90, 200), paddingBottomRight: L.point(560, 130), maxZoom: 15.5 });
    }
  }, [cat]); // eslint-disable-line

  // ── create the Leaflet map once ──
  React.useEffect(() => {
    if (!mapElRef.current || mapRef.current || typeof L === 'undefined') return;
    const map = L.map(mapElRef.current, {
      center: [origin.lat, origin.lng], zoom: 15, minZoom: 11, maxZoom: 19,
      zoomControl: false, attributionControl: false, zoomSnap: 0, zoomDelta: 0.6,
      wheelPxPerZoomLevel: 80, fadeAnimation: true, inertia: true,
    });
    mapRef.current = map;

    // CSS-transform fix: the whole app canvas is `transform: scale(...)`, which
    // throws off Leaflet's clientX/Y → container-point conversion. Compensate
    // by the live scale so clicks/drags land correctly at any device size.
    map.mouseEventToContainerPoint = function (e) {
      const c = this._container, r = c.getBoundingClientRect();
      const sx = (r.width / c.offsetWidth) || 1, sy = (r.height / c.offsetHeight) || 1;
      return L.point((e.clientX - r.left) / sx, (e.clientY - r.top) / sy);
    };

    const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, keepBuffer: 6 });
    const vec = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 20, subdomains: 'abcd', keepBuffer: 6 });
    tilesRef.current = { satellite: sat, vector: vec };
    vec.addTo(map);

    const projIcon = L.divIcon({
      className: 'uni-divicon', iconSize: [0, 0], iconAnchor: [0, 0],
      html: `<div class="uni-proj"><div class="ring"></div><div class="ring" style="animation-delay:1.4s"></div>
        <div class="core"><img src="assets/brand/universe-monogram-transparent.png" style="width:24px;height:26px" draggable="false"/></div></div>`,
    });
    L.marker([origin.lat, origin.lng], { icon: projIcon, interactive: false, zIndexOffset: 1000 }).addTo(map);

    setTimeout(() => map.invalidateSize(), 60);
    return () => { cancelAnimationFrame(animRef.current); map.remove(); mapRef.current = null; };
  }, []);

  // ── tile-layer toggle ──
  React.useEffect(() => {
    const map = mapRef.current, ts = tilesRef.current;
    if (!map || !ts.satellite) return;
    const show = layer === 'satellite' ? ts.satellite : ts.vector;
    const hide = layer === 'satellite' ? ts.vector : ts.satellite;
    if (map.hasLayer(hide)) map.removeLayer(hide);
    if (!map.hasLayer(show)) show.addTo(map);
  }, [layer]);

  // ── (re)build POI markers when filter / selection changes ──
  React.useEffect(() => {
    const map = mapRef.current; if (!map) return;
    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    markersRef.current = {};
    const anySel = !!selectedLabel;
    // pop the pins in only when the CATEGORY changed — not on every selection,
    // otherwise they'd re-animate each time you tap a landmark.
    const popIn = prevCatRef.current !== cat;
    prevCatRef.current = cat;
    filtered.forEach((p, i) => {
      const sel = p.label === selectedLabel;
      const icon = L.divIcon({ className: 'uni-divicon', iconSize: [0, 0], iconAnchor: [0, 0], html: poiHtml(p, sel, anySel, popIn, i) });
      const m = L.marker([p.lat, p.lng], { icon, riseOnHover: true, zIndexOffset: sel ? 900 : 0 }).addTo(map);
      m.on('click', () => setSelectedLabel(prev => prev === p.label ? null : p.label));
      markersRef.current[p.label] = m;
    });
  }, [filtered, selectedLabel, cat]);

  // ── selection → (1) camera frames both, THEN (2) clean line draw + blur ──
  // Sequenced so the line never draws while the map is still moving (that made
  // it look like it "floated" before snapping into place).
  React.useEffect(() => {
    const map = mapRef.current; if (!map) return;
    cancelAnimationFrame(animRef.current);
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (lineRef.current)  { map.removeLayer(lineRef.current);  lineRef.current = null; }
    if (cometRef.current) { map.removeLayer(cometRef.current); cometRef.current = null; }

    if (!selected) {
      setFocusOn(false);
      if (!map.getBounds().pad(-0.15).contains([origin.lat, origin.lng])) map.flyTo([origin.lat, origin.lng], 15, { duration: 0.55 });
      return;
    }
    setFocusOn(true);

    const from = { lat: origin.lat, lng: origin.lng };
    const to   = { lat: selected.lat, lng: selected.lng };
    const shade = selected.meta.shade;

    // PHASE 1 — camera glides out to frame project → destination (reveals the
    // distance). NO line yet, so nothing floats while the map is in motion.
    const padBounds = L.latLngBounds([[from.lat, from.lng], [to.lat, to.lng]]).pad(0.12);
    const FLY = 0.62; // seconds — snappy camera move
    map.flyToBounds(padBounds, { duration: FLY, easeLinearity: 0.25,
      paddingTopLeft: L.point(90, 210), paddingBottomRight: L.point(540, 150), maxZoom: 15.5 });

    // PHASE 2 — once the camera has settled, draw a CLEAN line FROM the project
    // pin TO the destination pin over the now-static map (comet rides the tip).
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (!mapRef.current) return;
      const line = L.polyline([[from.lat, from.lng], [from.lat, from.lng]],
        { className: 'uni-fly-line', color: shade, weight: 4, opacity: 0.96, lineCap: 'round' }).addTo(map);
      const comet = L.circleMarker([from.lat, from.lng],
        { className: 'uni-comet', radius: 7, color: '#fff8e0', weight: 2, fillColor: shade, fillOpacity: 1 }).addTo(map);
      lineRef.current = line; cometRef.current = comet;
      const easeIO = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const dur = 560, t0 = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - t0) / dur), te = easeIO(t);
        const cur = { lat: from.lat + (to.lat - from.lat) * te, lng: from.lng + (to.lng - from.lng) * te };
        line.setLatLngs([[from.lat, from.lng], [cur.lat, cur.lng]]);
        comet.setLatLng([cur.lat, cur.lng]);
        if (t < 1) animRef.current = requestAnimationFrame(step);
      };
      animRef.current = requestAnimationFrame(step);
    }, FLY * 1000 + 90);

    return () => { cancelAnimationFrame(animRef.current); if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } };
  }, [selectedLabel]); // eslint-disable-line

  return (
    <div style={{ position:'absolute', inset:0, background:'transparent', color:'var(--ink)', overflow:'visible' }}>

      {/* ── FULL-BLEED LIVE MAP ── extends 800 design-px beyond the canvas on
           every side so it fills the letterbox at ANY aspect ratio / device
           (frame clips the overflow). The map stays centred on the project, so
           pins & framing are unchanged; only the dead bars are now live map. */}
      <div ref={mapElRef} style={{ position:'absolute', top:-800, right:-800, bottom:-800, left:-800, zIndex:0 }}/>

      {/* focus blur / vignette (on select) */}
      <div className={'loc-vignette' + (focusOn ? ' on' : '')}/>

      {/* HUD · identity (top-left, floats) */}
      <div style={{ position:'absolute', top:34, left:124, display:'flex', flexDirection:'column', gap:11, zIndex:6, pointerEvents:'none' }}>
        <div style={{ display:'flex', alignItems:'center', gap:11 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'#7ed957', boxShadow:'0 0 13px rgba(126,217,87,0.85)', animation:'locLive 1.6s ease-in-out infinite' }}/>
          <div className="mono" style={{ fontSize:13.5, letterSpacing:'0.34em', color:'rgba(232,215,168,0.92)', textShadow:'0 1px 8px rgba(0,0,0,0.9)' }}>NEHRU NAGAR · AHMEDABAD</div>
        </div>
        <div className="serif" style={{ fontSize:50, fontWeight:300, letterSpacing:'-0.01em', color:'#faf6e8', lineHeight:1, textShadow:'0 2px 20px rgba(0,0,0,0.8)' }}>The Universe</div>
        <div className="mono" style={{ fontSize:13.5, letterSpacing:'0.22em', color:'rgba(255,248,224,0.88)', textShadow:'0 1px 8px rgba(0,0,0,0.9)' }}>{coordStr}</div>
      </div>

      {/* HUD · SATELLITE / MAP toggle (top-centre) */}
      <LayerToggle layer={layer} onPick={setLayer}/>

      {/* HUD · fact chips (bottom-left) */}
      <div style={{ position:'absolute', bottom:30, left:30, zIndex:6, display:'flex', gap:13 }}>
        <FactChip label="ARTERIAL" value="60 m BRTS road"/>
        <FactChip label="ON ROAD" value="Opp. Jhansi Ki Rani BRTS"/>
        <FactChip label="PHASE 1" value="Stratum · adjacent"/>
      </div>

      {/* HUD · live-map note (bottom-centre) */}
      <div className="mono" style={{ position:'absolute', bottom:36, left:'50%', transform:'translateX(-50%)', zIndex:6, pointerEvents:'none',
        fontSize:12.5, letterSpacing:'0.26em', color:'rgba(255,248,224,0.7)', textShadow:'0 1px 6px rgba(0,0,0,0.9)' }}>
        LIVE MAP · CHOOSE A CATEGORY · THEN TAP A LANDMARK
      </div>

      {/* zoom + reset controls (bottom, left of the buttons) */}
      <div style={{ position:'absolute', bottom:40, right:740, display:'flex', flexDirection:'column', gap:8, zIndex:7 }}>
        <button onClick={() => mapRef.current && mapRef.current.zoomIn(0.8)}  style={mapZoomBtn}><Icons.plus width={22} height={22}/></button>
        <button onClick={() => mapRef.current && mapRef.current.zoomOut(0.8)} style={mapZoomBtn}><Icons.minus width={22} height={22}/></button>
        <button onClick={() => { setSelectedLabel(null); mapRef.current && mapRef.current.flyTo([origin.lat, origin.lng], 15, { duration: 0.5 }); }}
          className="mono" style={{ ...mapZoomBtn, height:'auto', padding:'12px 0', fontSize:11, letterSpacing:'0.14em' }}>RESET</button>
      </div>

      {/* floating glass back button */}
      <button onClick={() => navigate('home')} aria-label="Back" style={{
        position:'absolute', top:30, left:30, zIndex:9, width:60, height:60, borderRadius:'50%',
        ...glassChrome, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--gold-deep)',
      }}><Icons.back width={26} height={26}/></button>

      {/* floating category buttons — pinned to the right edge, vertically
          CENTERED. No full-height panel: each button opens its landmarks
          inline (accordion). The flex-centered wrapper keeps the stack
          balanced top↔bottom as it grows / shrinks dynamically. */}
      <div style={{ position:'absolute', top:0, right:34, bottom:0, width:660, zIndex:8,
        display:'flex', alignItems:'center', justifyContent:'flex-end', pointerEvents:'none' }}>
        <PoiRail
          catSummaries={catSummaries}
          activeCat={cat}
          onToggleCat={(name)=> (cat===name ? backToCats() : openCat(name))}
          pois={filtered}
          selectedLabel={selectedLabel}
          onSelect={setSelectedLabel}
        />
      </div>
    </div>
  );
}

// ── shared liquid-glass chrome — cream + gold hairline (matches every other
//    screen's floating glass, e.g. masterplan-explorer's MPX_GLASS) ──
const glassChrome = {
  background: 'rgba(248,244,236,0.82)',
  border: '1px solid rgba(201,160,94,0.42)',
  backdropFilter: 'blur(22px) saturate(1.25)', WebkitBackdropFilter: 'blur(22px) saturate(1.25)',
  boxShadow: '0 18px 48px rgba(40,30,12,0.22), inset 0 1px 0 rgba(255,255,255,0.6)',
};
const mapZoomBtn = {
  width:54, height:54, borderRadius:'50%', ...glassChrome,
  display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--gold-deep)',
};

// ════════════════════════════════════════════════════════════════════════
//  LayerToggle — SATELLITE / MAP segmented control (top-centre)
// ════════════════════════════════════════════════════════════════════════
function LayerToggle({ layer, onPick }) {
  const opts = [['satellite', 'SATELLITE'], ['vector', 'MAP']];
  return (
    <div style={{ position:'absolute', top:30, left:'50%', transform:'translateX(-50%)', zIndex:7,
      padding:6, borderRadius:100, display:'flex', gap:5, ...glassChrome }}>
      {opts.map(([key, label]) => {
        const sel = layer === key;
        return (
          <button key={key} onClick={() => onPick(key)} className="mono" style={{
            padding:'15px 40px', borderRadius:100, cursor:'pointer', whiteSpace:'nowrap',
            border:'1px solid ' + (sel ? 'var(--gold-deep)' : 'transparent'),
            background: sel ? 'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)' : 'transparent',
            color: sel ? '#1a130a' : 'var(--graphite)',
            fontSize:15, letterSpacing:'0.24em', fontWeight: sel ? 800 : 600,
            boxShadow: sel ? '0 6px 16px rgba(50,32,12,0.4)' : 'none',
            transition:'all 260ms cubic-bezier(0.22,1,0.36,1)',
          }}>{label}</button>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  FactChip — bottom-left HUD (defensible facts only)
// ════════════════════════════════════════════════════════════════════════
function FactChip({ label, value }) {
  return (
    <div style={{ padding:'13px 19px', borderRadius:14, minWidth:128, ...glassChrome,
      display:'flex', flexDirection:'column', gap:4 }}>
      <div className="mono" style={{ fontSize:11, letterSpacing:'0.32em', color:'var(--gold-deep)' }}>{label}</div>
      <div className="serif" style={{ fontSize:22, fontWeight:400, color:'var(--ink)', lineHeight:1.1 }}>{value}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  PoiRail — compact right-edge accordion. Each category is a glass button;
//  tapping one opens ITS landmarks inline (right there) — no full-height
//  panel. The parent wrapper centers this stack vertically, so it stays
//  balanced top↔bottom as groups expand / collapse.
// ════════════════════════════════════════════════════════════════════════
function PoiRail({ catSummaries, activeCat, onToggleCat, pois, selectedLabel, onSelect }) {
  return (
    <div className="loc-rail-scroll" style={{
      pointerEvents:'auto', width:'100%',
      maxHeight:'calc(100% - 56px)', overflowY:'auto', overflowX:'hidden',
      display:'flex', flexDirection:'column', gap:13, paddingRight:4,
    }}>
      {catSummaries.map((s, i) => {
        const open = activeCat === s.name;
        return (
          <div key={s.name} style={{
            flex:'0 0 auto', borderRadius:22, overflow:'hidden',
            animation:'locRowIn 440ms cubic-bezier(0.22,1,0.36,1) both', animationDelay:`${i * 55}ms`,
            background: open ? 'rgba(248,244,236,0.9)' : 'transparent',
            border: '1px solid ' + (open ? 'rgba(201,160,94,0.46)' : 'transparent'),
            backdropFilter: open ? 'blur(26px) saturate(1.25)' : 'none', WebkitBackdropFilter: open ? 'blur(26px) saturate(1.25)' : 'none',
            boxShadow: open ? '0 30px 80px rgba(40,30,12,0.26)' : 'none',
          }}>
            <CategoryButton s={s} open={open} onClick={() => onToggleCat(s.name)}/>
            {open && (
              <div style={{ padding:'4px 16px 18px', display:'flex', flexDirection:'column', gap:11 }}>
                {pois.map((p, j) => (
                  <LandmarkRow key={p.label} p={p} sel={p.label === selectedLabel} idx={j}
                    onClick={() => onSelect(p.label === selectedLabel ? null : p.label)}/>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// the main category button — collapsed = standalone glass pill; open = header
function CategoryButton({ s, open, onClick }) {
  return (
    <button onClick={onClick} className="uni-catbtn" style={{
      display:'flex', alignItems:'center', gap:26, textAlign:'left', width:'100%',
      padding:'32px 36px', borderRadius:32, cursor:'pointer',
      border:'1px solid ' + (open ? 'transparent' : 'rgba(201,160,94,0.42)'),
      background: open ? 'transparent' : 'rgba(248,244,236,0.82)',
      backdropFilter: open ? 'none' : 'blur(26px) saturate(1.25)', WebkitBackdropFilter: open ? 'none' : 'blur(26px) saturate(1.25)',
      boxShadow: open ? 'none' : '0 18px 48px rgba(40,30,12,0.22), inset 0 1px 0 rgba(255,255,255,0.6)',
    }}>
      <div style={{ width:104, height:104, borderRadius:'50%', flexShrink:0,
        background:`radial-gradient(circle at 32% 28%, ${s.shade}, ${s.shade}cc)`, color:'#1a130a',
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:44, fontWeight:700,
        boxShadow:`0 0 22px ${s.shade}66, 0 8px 18px rgba(40,30,12,0.2), inset 0 1px 0 rgba(255,255,255,0.5)` }}>{s.glyph}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div className="serif" style={{ fontSize:46, fontWeight:400, lineHeight:1.08, color:'var(--ink)' }}>{s.name}</div>
        <div className="mono" style={{ fontSize:17, letterSpacing:'0.14em', color: open ? 'var(--gold-deep)' : 'var(--slate)', marginTop:10, textTransform:'uppercase' }}>
          {s.count} LANDMARK{s.count === 1 ? '' : 'S'}{s.nearest ? ` · NEAREST ${s.nearest.time}` : ''}
        </div>
      </div>
      <div className="uni-catbtn-arrow serif" style={{ flexShrink:0, fontSize:42, color:'var(--gold-deep)', fontWeight:300,
        transform: open ? 'rotate(90deg)' : 'none', transition:'transform 280ms cubic-bezier(0.22,1,0.36,1)' }}>→</div>
    </button>
  );
}

// compact landmark row shown inside an open category
function LandmarkRow({ p, sel, idx, onClick }) {
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:17, textAlign:'left', width:'100%',
      padding:'17px 20px', borderRadius:18, cursor:'pointer',
      transition:'background 200ms ease, border-color 200ms ease, box-shadow 200ms ease',
      animation:'locRowIn 360ms cubic-bezier(0.22,1,0.36,1) both', animationDelay:`${idx * 45}ms`,
      border:'1px solid ' + (sel ? 'rgba(176,138,63,0.55)' : 'rgba(176,138,63,0.14)'),
      background: sel ? 'linear-gradient(180deg, rgba(234,215,168,0.55), rgba(201,160,94,0.20))' : 'rgba(255,255,255,0.55)',
      boxShadow: sel ? '0 8px 20px rgba(176,138,63,0.22)' : 'inset 0 1px 0 rgba(255,255,255,0.6)',
    }}>
      <div style={{ width:52, height:52, borderRadius:'50%', flexShrink:0,
        background: sel ? p.meta.shade : 'rgba(243,240,230,0.9)', color: sel ? '#1a130a' : 'var(--gold-deep)',
        border: sel ? 'none' : '1px solid rgba(176,138,63,0.3)',
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700,
        boxShadow: sel ? '0 0 14px ' + p.meta.shade + 'aa' : 'none', transition:'all 200ms' }}>{p.meta.glyph}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div className="serif" style={{ fontSize:27, fontWeight:400, lineHeight:1.12, color:'var(--ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.label}</div>
        <div className="mono" style={{ fontSize:13, letterSpacing:'0.16em', color:'var(--slate)', marginTop:5, textTransform:'uppercase' }}>{p.onsite ? 'ON SITE' : bearingWord(p.bearing) + ' OF SITE'}</div>
      </div>
      <div style={{ textAlign:'right', flexShrink:0, minWidth:78 }}>
        <div className="serif" style={{ fontSize:26, fontWeight:400, color: sel ? 'var(--gold-deep)' : 'var(--ink)', lineHeight:1 }}>{p.time}</div>
        <div className="mono" style={{ fontSize:13, letterSpacing:'0.1em', color:'var(--slate)', marginTop:5 }}>{p.dist}</div>
      </div>
    </button>
  );
}

function SelectedDetail({ poi, onClear }) {
  const heading = bearingWord(poi.bearing);
  const distPct = Math.min(1, poi.km / 14);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, animation:'locCardIn 460ms cubic-bezier(0.22,1,0.36,1) both' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
        <div className="mono" style={{ fontSize:13, letterSpacing:'0.34em', color:'var(--gold-deep)' }}>{poi.cat.toUpperCase()}{poi.onsite ? ' · ON SITE' : ' · ROUTE TRACED'}</div>
        <button onClick={onClear} aria-label="close" style={{
          width:36, height:36, borderRadius:'50%', flexShrink:0, border:'1px solid rgba(176,138,63,0.34)',
          background:'rgba(255,255,255,0.6)', color:'var(--gold-deep)', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:300 }}>×</button>
      </div>
      <div style={{ display:'flex', alignItems:'flex-start', gap:15 }}>
        <div style={{ width:54, height:54, borderRadius:'50%', background:poi.meta.shade, color:'#1a130a', flexShrink:0,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:700,
          boxShadow:'0 0 24px rgba(201,160,94,0.5), 0 6px 16px rgba(40,30,12,0.25)' }}>{poi.meta.glyph}</div>
        <div className="serif" style={{ fontSize:34, fontWeight:400, lineHeight:1.12, letterSpacing:'-0.01em', color:'var(--ink)' }}>{poi.label}</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
        <Telemetry label="DISTANCE"   value={poi.dist} accent={poi.meta.shade}/>
        <Telemetry label="DRIVE TIME" value={poi.time} accent={poi.meta.shade}/>
        <Telemetry label="HEADING"    value={poi.onsite ? '—' : heading} accent={poi.meta.shade}/>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        <div style={{ height:6, borderRadius:3, background:'rgba(176,138,63,0.18)', overflow:'hidden' }}>
          <div style={{ height:'100%', borderRadius:3, width:`${distPct * 100}%`,
            background:'linear-gradient(90deg, var(--gold-deep) 0%, var(--gold) 50%, var(--gold-soft) 100%)',
            boxShadow:'0 0 12px rgba(201,160,94,0.5)', transition:'width 720ms cubic-bezier(0.22,1,0.36,1)' }}/>
        </div>
        <div className="mono" style={{ fontSize:12, letterSpacing:'0.2em', color:'var(--slate)' }}>
          {poi.onsite ? 'ON / ADJACENT TO SITE' : `${heading} OF SITE · ${poi.dist} BY ROAD · ${poi.time}`}
        </div>
      </div>
    </div>
  );
}

function Telemetry({ label, value, accent }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
      <div className="mono" style={{ fontSize:11, letterSpacing:'0.3em', color:'var(--slate)' }}>{label}</div>
      <div className="serif" style={{ fontSize:24, fontWeight:400, color: accent || 'var(--ink)', lineHeight:1.1 }}>{value}</div>
    </div>
  );
}

window.Location = LocationScreen;
