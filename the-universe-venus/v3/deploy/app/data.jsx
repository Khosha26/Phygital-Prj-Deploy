// The Universe · Sales Suite · Project data
// ─────────────────────────────────────────────────────────────────────────
// SOURCE OF TRUTH: _build-docs/02-project-facts.md (extracted verbatim from
// the Venus Group client dump — Excel inventory + Amenities/Layout/Unit PDFs).
//
// FACTUAL (from dump): tower count & blocks, floors per block, units/floor,
//   RERA carpet sizes per type, 33 amenities, location, design team, areas.
// PLACEHOLDER (NOT in dump — flagged, swap when Venus provides):
//   · prices  · per-unit facing/view  · per-unit availability status
//   · RERA number  · possession date
// ─────────────────────────────────────────────────────────────────────────

const PROJECT = {
  brand:        'the UNIVERSE',
  developer:    'Venus Group',
  developerEst: 'Venus Grounds · Crafting timeless spaces',
  tagline:      'Center of everything.',
  pitch:        'A world of 10 towers, all-4BHK living and a 33-amenity clubhouse, at the centre of Nehru Nagar, Ahmedabad.',
  city:         'Ahmedabad',
  micromarket:  'Nehru Nagar',
  phase:        'Phase 2 · Venus Grounds',
  context:      'Phase 1 (Stratum) is operational, home to Reliance, Accenture, Citi, Siemens, Tech Mahindra & more',
  location: {
    address:   'Surendra Mangaldas Rd, Nehru Nagar, Ahmedabad 380015',
    landmark:  'Opposite Jhansi Ki Rani BRTS · adjacent to Stratum (Phase 1)',
    coords:    { lat: 23.0230, lng: 72.5363 },   // real — opp. Jhansi Ki Rani BRTS
    pincode:   '380015',
  },
  rera:    'RERA · to be confirmed',          // PLACEHOLDER — not in dump
  stats: {
    plotArea:    '3,18,485 sq.ft',
    builtUp:     '28,55,241 sq.ft',
    saleable:    '27,34,929 sq.ft',
    towers:      10,
    homes:       624,
    typology:    '4 BHK + Penthouses',
    storeys:     'A–B: 3B + G + 22 · C–J: 3B + G + 21',
    amenities:   33,
    architect:   'Hafeez Contractor',
    structural:  'Ducon Consultants',
    landscape:   'SWA',
    interior:    'HBA',
    lighting:    'LET',
    completion:  'Possession · to be confirmed',  // PLACEHOLDER
  },
  modules: [
    { id: 'story',      label: 'The Story',     sub: 'Venus Group · timeless spaces' },
    { id: 'location',   label: 'Location',      sub: 'Center of Ahmedabad · Nehru Nagar' },
    { id: 'masterplan', label: 'Master Plan',   sub: 'Plans · circulation · retail · massing' },
    { id: 'residences', label: 'Residences',    sub: 'Compare 4 BHK floor plans' },
    { id: 'amenities',  label: 'Amenities',     sub: '33 across sport, wellness, social' },
    { id: 'gallery',    label: 'Gallery',       sub: 'Exteriors · retail · clubhouse' },
    { id: 'inventory',  label: 'Inventory',     sub: 'Master plan · towers · units' },
    { id: 'booking',    label: 'Booking',       sub: 'Reserve a residence today' },
  ],
};

// ─── BLOCK SPECS ───────────────────────────────────────────────────────────
// Real per-block structure. Five mirror-identical block-pairs (A&B, C&D, E&F,
// G&H, I&J). typFloors = [first,last] typical residential floors; phFloor =
// the penthouse level (duplex to the floor above); upf = units per floor.
// `slots` = position→type→RERA carpet (sq.ft) from the client KEY PLANs.
// Type names & carpet areas reconciled against THE_UNIVERSE_PLANS_PDF_03
// (client, 2026-07-03): each pair has mirror-paired plans, so the same Type
// label repeats across mirrored positions exactly as the client's key plans
// show it (e.g. A&B pos 1&4 = Type 1, pos 2&3 = Type 2). Carpet (sq.ft) =
// (unit + balcony + wash) m² × 10.7639, matching every "TOTAL CARPET AREA".
const BLOCK_SPECS = {
  'A&B': {
    pair:'A&B', typFloors:[1,20], phFloor:21, upf:4,
    slots:[
      { pos:1, type:'Type 1', sqft:1547.22 },
      { pos:2, type:'Type 2', sqft:1545.93 },
      { pos:3, type:'Type 2', sqft:1545.93 },
      { pos:4, type:'Type 1', sqft:1547.22 },
    ],
    ph:[
      { pos:1, type:'Penthouse 1', sqft:2995.41 },
      { pos:2, type:'Penthouse 2', sqft:3000.68 },
      { pos:3, type:'Penthouse 3', sqft:3000.68 },
      { pos:4, type:'Penthouse 4', sqft:2995.41 },
    ],
  },
  'C&D': {
    pair:'C&D', typFloors:[2,19], phFloor:20, upf:2,
    slots:[
      { pos:1, type:'Type 1', sqft:2071.96 },
      { pos:2, type:'Type 2', sqft:1755.07 },
    ],
    ph:[
      { pos:1, type:'Penthouse 1', sqft:3985.48 },
      { pos:2, type:'Penthouse 2', sqft:3314.45 },
    ],
  },
  'E&F': {
    // Client Type scheme (PDF_03): Type 1 = pos 1 (& mirror pos 2), Type 2 =
    // pos 4, Type 3 = pos 3 on normal floors. Type 4 (182.71 m² → 2233.85 sq.ft)
    // is the SMALLER pos-3 unit only on the four refuge floors (5, 8, 12, 17),
    // where the refuge cut-out shrinks that quadrant; not modelled per-floor
    // here — typical floors show the full Type 3 (2465 sq.ft).
    pair:'E&F', typFloors:[2,19], phFloor:20, upf:4,
    slots:[
      { pos:1, type:'Type 1', sqft:2507.26 },
      { pos:2, type:'Type 1', sqft:2507.26 },
      { pos:3, type:'Type 3', sqft:2465.00 },
      { pos:4, type:'Type 2', sqft:2459.25 },
    ],
    ph:[
      { pos:1, type:'Penthouse 1', sqft:4689.98 },
      { pos:2, type:'Penthouse 2', sqft:4689.98 },
      { pos:3, type:'Penthouse 3', sqft:4611.62 },
      { pos:4, type:'Penthouse 4', sqft:4601.07 },
    ],
  },
  'G&H': {
    pair:'G&H', typFloors:[2,19], phFloor:20, upf:4,
    slots:[
      { pos:1, type:'Type 1', sqft:2071.10 },
      { pos:2, type:'Type 2', sqft:1772.94 },
      { pos:3, type:'Type 2', sqft:1772.94 },
      { pos:4, type:'Type 1', sqft:2071.10 },
    ],
    ph:[
      { pos:1, type:'Penthouse 1', sqft:3857.60 },
      { pos:2, type:'Penthouse 2', sqft:3313.70 },
      { pos:3, type:'Penthouse 3', sqft:3313.70 },
      { pos:4, type:'Penthouse 4', sqft:3857.60 },
    ],
  },
  'I&J': {
    pair:'I&J', typFloors:[2,19], phFloor:20, upf:2,
    slots:[
      { pos:1, type:'Type 1', sqft:2082.73 },
      { pos:2, type:'Type 2', sqft:1776.17 },
    ],
    ph:[
      { pos:1, type:'Penthouse 1', sqft:3856.53 },
      { pos:2, type:'Penthouse 2', sqft:3341.47 },
    ],
  },
};

// ─── TOWERS (10, A–J) ──────────────────────────────────────────────────────
// floors = topmost selectable floor (penthouse level). totalUnits real.
// `view` is a marketing descriptor (per-unit facing NOT in dump → generic).
const TOWERS = [
  { id:'A', name:'Tower A', pair:'A&B', cluster:'North Edge',  floors:21, totalUnits:84, type:'4 BHK',             view:'North · BRTS frontage' },
  { id:'B', name:'Tower B', pair:'A&B', cluster:'North Edge',  floors:21, totalUnits:84, type:'4 BHK',             view:'North · BRTS frontage' },
  { id:'C', name:'Tower C', pair:'C&D', cluster:'West Court',  floors:20, totalUnits:38, type:'4 BHK',             view:'Central garden' },
  { id:'D', name:'Tower D', pair:'C&D', cluster:'West Court',  floors:20, totalUnits:38, type:'4 BHK',             view:'Central garden' },
  { id:'E', name:'Tower E', pair:'E&F', cluster:'Crown',       floors:20, totalUnits:76, type:'4 BHK + Penthouse', view:'Skyline · largest homes' },
  { id:'F', name:'Tower F', pair:'E&F', cluster:'Crown',       floors:20, totalUnits:76, type:'4 BHK + Penthouse', view:'Skyline · largest homes' },
  { id:'G', name:'Tower G', pair:'G&H', cluster:'Park Wing',   floors:20, totalUnits:76, type:'4 BHK',             view:'Podium & sports garden' },
  { id:'H', name:'Tower H', pair:'G&H', cluster:'Park Wing',   floors:20, totalUnits:76, type:'4 BHK',             view:'Podium & sports garden' },
  { id:'I', name:'Tower I', pair:'I&J', cluster:'Pool Court',  floors:20, totalUnits:38, type:'4 BHK',             view:'Swimming pool deck' },
  { id:'J', name:'Tower J', pair:'I&J', cluster:'Pool Court',  floors:20, totalUnits:38, type:'4 BHK',             view:'Swimming pool deck' },
];

// Real unit floor-plan images — extracted from the client PDF
// (THE_UNIVERSE_PLANS_PDF_03, 2026-07-03), full RERA plates keyed by
// block-pair → position (typical) + PH (penthouse fallback).
// NOTE on E&F filenames: images are named by POSITION, not the client's Type
// number. unit-block-EF-type-3.jpg = pos-3 plan (client Type 3, 2465 sq.ft,
// normal floors); unit-block-EF-type-4.jpg = pos-4 plan (client Type 2,
// 2459 sq.ft). So pos 4 → the "type-4" file is correct — the file holds the
// pos-4 drawing regardless of the client's Type-2 label.
const PLAN_IMG = {
  'A&B': { 1:'unit-block-AB-type-1-4', 2:'unit-block-AB-type-2-3', 3:'unit-block-AB-type-2-3', 4:'unit-block-AB-type-1-4', PH:'unit-block-AB-type-1-4' },
  'C&D': { 1:'unit-block-CD-type-1',   2:'unit-block-CD-type-2',   PH:'unit-block-CD-type-1' },
  'E&F': { 1:'unit-block-EF-type-1-2', 2:'unit-block-EF-type-1-2', 3:'unit-block-EF-type-3', 4:'unit-block-EF-type-4', PH:'unit-block-EF-type-1-2' },
  'G&H': { 1:'unit-block-G-type-1-4',  2:'unit-block-G-type-2-3',  3:'unit-block-G-type-2-3', 4:'unit-block-G-type-1-4', PH:'unit-block-G-type-1-4' },
  'I&J': { 1:'unit-block-IJ-type-1',   2:'unit-block-IJ-type-1b',  PH:'unit-block-IJ-type-1' },
};
function planImg(pair, pos, isPH){
  const m = PLAN_IMG[pair] || {};
  const name = (isPH ? m.PH : m[pos]) || m[pos] || 'masterplan-06-typical-floor';
  return `assets/plans/${name}.jpg`;
}

// PLACEHOLDER pricing — single ₹/sq.ft rate so cost-sheet / EMI / cards all
// compute. NOT from the dump. Replace DUMMY_RATE (or per-unit prices) with the
// Venus price list when it arrives. Set to null to switch to "Price on request".
const DUMMY_RATE = 9500;  // ₹ per sq.ft (placeholder, Nehru Nagar premium est.)

// ─── INVENTORY GENERATORS ──────────────────────────────────────────────────
// Deterministic so the floor plate is stable across renders. Availability is
// PLACEHOLDER (not in dump): hashed → ~68% available / 24% sold / 8% hold.
// Status palette — shared by the inventory drill-down (floorselect / floorplate
// / unitdetail). Each entry carries color/dot/soft/line/label/key so the cards,
// pills, legends and elevation rail all read from one source of truth.
// FOUR live statuses, strong distinct colours so a unit's state reads instantly
// on a 65" screen: Available (green) · Booked (blue) · Blocked (amber) · Sold
// (red). `color` = full button/ink, `dot` = brighter chip, `fill` = the solid-
// button wash, `on` = text colour on the filled button.
const STATUS = {
  available: { key:'available', label:'Available', color:'#3f8f52', dot:'#66bd6a',
               soft:'rgba(63,143,82,0.16)',  line:'rgba(63,143,82,0.42)',
               fill:'rgba(63,143,82,0.92)',  on:'#f2fbf1' },
  booked:    { key:'booked',    label:'Booked',    color:'#3d6fb0', dot:'#5f97d6',
               soft:'rgba(61,111,176,0.16)', line:'rgba(61,111,176,0.42)',
               fill:'rgba(61,111,176,0.92)', on:'#f1f6fc' },
  blocked:   { key:'blocked',   label:'Blocked',   color:'#c2892b', dot:'#e0a838',
               soft:'rgba(194,137,43,0.18)', line:'rgba(194,137,43,0.44)',
               fill:'rgba(194,137,43,0.94)', on:'#fff9ec' },
  sold:      { key:'sold',      label:'Sold',      color:'#a8514a', dot:'#cc7a70',
               soft:'rgba(168,81,74,0.15)',  line:'rgba(168,81,74,0.40)',
               fill:'rgba(150,86,80,0.88)',  on:'#fbeeec' },
};
STATUS.hold = STATUS.blocked;   // legacy alias — any old 'hold' reference maps to Blocked

function _hash(str){ let h=2166136261; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619);} return (h>>>0); }
function unitStatus(unitId){
  const r = _hash(unitId) % 100;
  if (r < 62) return 'available';
  if (r < 78) return 'booked';
  if (r < 87) return 'blocked';
  return 'sold';
}

// Floor number → display label
function floorLabel(tower, floor){
  const spec = BLOCK_SPECS[tower.pair];
  if (floor === spec.phFloor) return 'Penthouse Level';
  const n = floor; const s = (n%10===1&&n%100!==11)?'st':(n%10===2&&n%100!==12)?'nd':(n%10===3&&n%100!==13)?'rd':'th';
  return `${n}${s} Floor`;
}

// List of selectable floors for a tower, top (penthouse) first.
function buildFloors(towerId){
  const tower = TOWERS.find(t=>t.id===towerId); if(!tower) return [];
  const spec = BLOCK_SPECS[tower.pair];
  const floors = [];
  // penthouse level
  floors.push({ floor: spec.phFloor, label:'Penthouse Level', kind:'penthouse', units: spec.ph.length });
  for (let f = spec.typFloors[1]; f >= spec.typFloors[0]; f--){
    floors.push({ floor:f, label: floorLabel(tower,f), kind:'typical', units: spec.upf });
  }
  return floors; // already top-down
}

// Units on a given floor of a tower.
function buildUnits(towerId, floor){
  const tower = TOWERS.find(t=>t.id===towerId); if(!tower) return [];
  const spec = BLOCK_SPECS[tower.pair];
  const isPH = floor === spec.phFloor;
  const slots = isPH ? spec.ph : spec.slots;
  return slots.map(s => {
    const no = `${tower.id}-${floor}${String(s.pos).padStart(2,'0')}`;
    return {
      id: no, no, tower: tower.id, towerName: tower.name, pair: tower.pair,
      floor, pos: s.pos, type: s.type, sqft: s.sqft, isPenthouse: isPH,
      bhk: '4 BHK', facing: tower.view,          // facing PLACEHOLDER (tower-level)
      status: unitStatus(no),
      price: DUMMY_RATE ? Math.round(s.sqft * DUMMY_RATE) : null,  // PLACEHOLDER
      plan: planImg(tower.pair, s.pos, isPH),     // real assets/plans/*.jpg
    };
  });
}

// Tower-level availability summary (computed from placeholder unit status).
function towerSummary(towerId){
  const floors = buildFloors(towerId);
  let available=0, booked=0, blocked=0, sold=0, total=0;
  floors.forEach(fl => buildUnits(towerId, fl.floor).forEach(u => {
    total++;
    if(u.status==='available')available++;
    else if(u.status==='booked')booked++;
    else if(u.status==='blocked')blocked++;
    else sold++;
  }));
  // `hold` kept for back-compat = booked + blocked (both non-available, non-sold)
  return { available, booked, blocked, sold, hold: booked+blocked, total };
}

// ─── TYPOLOGIES (for Residences plan-comparison) ───────────────────────────
// One representative typical 4BHK per block-pair + the premium E&F penthouse.
// sqft = RERA carpet. price PLACEHOLDER (null).
const TYPOLOGIES = [
  { code:'AB-4BHK', pair:'A&B', name:'4 BHK · A & B',     sqft:1547.22, price:null, bhk:4, plan:'assets/plans/unit-block-AB-type-1-4.jpg', tag:'Compact 4BHK' },
  { code:'CD-4BHK', pair:'C&D', name:'4 BHK · C & D',     sqft:2071.96, price:null, bhk:4, plan:'assets/plans/unit-block-CD-type-1.jpg',  tag:'Garden-facing' },
  { code:'EF-4BHK', pair:'E&F', name:'4 BHK · E & F',     sqft:2507.26, price:null, bhk:4, plan:'assets/plans/unit-block-EF-type-1-2.jpg', tag:'Largest 4BHK' },
  { code:'GH-4BHK', pair:'G&H', name:'4 BHK · G & H',     sqft:2071.10, price:null, bhk:4, plan:'assets/plans/unit-block-G-type-1-4.jpg',  tag:'Park-facing' },
  { code:'IJ-4BHK', pair:'I&J', name:'4 BHK · I & J',     sqft:2082.73, price:null, bhk:4, plan:'assets/plans/unit-block-IJ-type-1.jpg',   tag:'Pool-facing' },
  { code:'EF-PENT', pair:'E&F', name:'Penthouse · E & F', sqft:4689.98, price:null, bhk:4, plan:'assets/plans/unit-block-EF-type-4.jpg',   tag:'Signature penthouse' },
];
// PLACEHOLDER prices from DUMMY_RATE (replace with Venus list; set DUMMY_RATE=null for "Price on request").
TYPOLOGIES.forEach(t => { t.price = DUMMY_RATE ? Math.round(t.sqft * DUMMY_RATE) : null; });

// ─── PRICE SHEET (basic, transparent build-up) ─────────────────────────────
// unitPriceSheet(unit) → a simple cost breakdown for the Unit Detail screen.
// All rates PLACEHOLDER (replace with the Venus price list when received).
function unitPriceSheet(unit){
  if(!unit) return null;
  const rate       = DUMMY_RATE || 0;                              // ₹/sq.ft base
  const base       = Math.round(unit.sqft * rate);                 // base consideration
  const floorRise  = Math.round(unit.sqft * 30 * Math.max(0, (unit.floor||1) - 1)); // ₹30/sq.ft per floor
  const plc        = unit.isPenthouse ? Math.round(base * 0.05) : Math.round(base * 0.02); // preferred-location
  const subtotal   = base + floorRise + plc;
  const gst        = Math.round(subtotal * 0.05);                  // 5% GST (under-construction)
  const reg        = Math.round(subtotal * 0.049);                 // stamp duty + registration (Gujarat ≈4.9%)
  const total      = subtotal + gst + reg;
  return { rate, sqft: unit.sqft, base, floorRise, plc, subtotal, gst, reg, total };
}

// ─── SALES DESK · mini-CRM (hidden console, triple-tap the home centre) ─────
// Mock walk-in pipeline modelled on the Venus "Sales Desk" reference screens.
// All data illustrative (kiosk-captured leads); wire to a real CRM later.
const SALES_DESK = {
  stats: { walkInsToday: 5, awaitingSales: 1, liveNow: 3 },
  stages: [
    { key:'all',         label:'All',         count:5, dot:'var(--gold)' },
    { key:'awaiting',    label:'Awaiting',    count:1, dot:'#d99a2b' },
    { key:'withsales',   label:'With Sales',  count:1, dot:'#c9a05e' },
    { key:'browsing',    label:'Browsing',    count:1, dot:'#7fa8c9' },
    { key:'negotiating', label:'Negotiating', count:1, dot:'#d96f5a' },
    { key:'followup',    label:'Follow-up',   count:1, dot:'#9f7fd0' },
    { key:'closed',      label:'Closed',      count:0, dot:'#7bb661' },
  ],
  walkIns: [
    { id:'TU-260508-0612', name:'Mr. Rohan Jain', initials:'RJ', stage:'awaiting',
      config:'3 BHK', budget:'₹2.8 Cr', intent:'Both', agent:null, ago:'4m ago',
      phone:'+91 98765 11290', email:'rohan@jainco.com', matchScore:65, session:'3 min',
      prefs:{ typology:'3 BHK', sqft:'1,750–1,900 sq.ft', budget:'₹2.8 Cr', purpose:'Both', timeline:'3–6 months', family:'2 members', source:'Instagram lead', mustHaves:['Quiet zone','Park view'] },
      matches:[
        { no:'A-0801', tower:'Tower A', floor:'8th Floor',  bhk:'3 BHK', view:'Park view', sqft:'1,810 sq.ft', price:'₹2.78 Cr', match:82 },
        { no:'A-1001', tower:'Tower A', floor:'10th Floor', bhk:'3 BHK', view:'Park view', sqft:'1,810 sq.ft', price:'₹2.89 Cr', match:80 },
        { no:'B-0701', tower:'Tower B', floor:'7th Floor',  bhk:'3 BHK', view:'Park view', sqft:'1,860 sq.ft', price:'₹2.84 Cr', match:74 },
      ],
      journey:[
        { label:'Walk-in registered', at:'+0m · Reception', done:true },
        { label:'OTP verified',       at:'+2m · Self',      done:true },
        { label:'Preferences captured',at:'+3m · Self',     done:true, current:true },
      ] },
    { id:'TU-260508-0455', name:'Mr. Karan Patel', initials:'KP', stage:'browsing',
      config:'3 BHK', budget:'₹3.2 Cr', intent:'Investment', agent:null, ago:'13m ago',
      phone:'+91 98220 33410', email:'karan.patel@gmail.com', matchScore:58, session:'8 min',
      prefs:{ typology:'3 BHK', sqft:'1,800–2,000 sq.ft', budget:'₹3.2 Cr', purpose:'Investment', timeline:'6–12 months', family:'4 members', source:'Walk-in', mustHaves:['High floor','Corner unit'] },
      matches:[
        { no:'A-1201', tower:'Tower A', floor:'12th Floor', bhk:'3 BHK', view:'City view',   sqft:'1,810 sq.ft', price:'₹3.05 Cr', match:78 },
        { no:'C-0901', tower:'Tower C', floor:'9th Floor',  bhk:'4 BHK', view:'Garden view', sqft:'2,072 sq.ft', price:'₹3.20 Cr', match:71 },
      ],
      journey:[
        { label:'Walk-in registered', at:'+0m · Reception', done:true },
        { label:'OTP verified',       at:'+1m · Self',      done:true },
        { label:'Browsing units',     at:'+9m · Self',      done:true, current:true },
      ] },
    { id:'TU-260508-0124', name:'Mr. Pratik Shah', initials:'PS', stage:'withsales',
      config:'4 BHK', budget:'₹4.8 Cr', intent:'To live in', agent:'Karan N.', ago:'23m ago',
      phone:'+91 99099 71200', email:'pratik.shah@live.com', matchScore:84, session:'21 min',
      prefs:{ typology:'4 BHK', sqft:'2,450–2,550 sq.ft', budget:'₹4.8 Cr', purpose:'To live in', timeline:'0–3 months', family:'5 members', source:'Referral', mustHaves:['Park view','Vastu compliant'] },
      matches:[
        { no:'E-1501', tower:'Tower E', floor:'15th Floor', bhk:'4 BHK', view:'Skyline',   sqft:'2,507 sq.ft', price:'₹4.76 Cr', match:88 },
        { no:'F-1401', tower:'Tower F', floor:'14th Floor', bhk:'4 BHK', view:'Skyline',   sqft:'2,507 sq.ft', price:'₹4.82 Cr', match:85 },
        { no:'G-1101', tower:'Tower G', floor:'11th Floor', bhk:'4 BHK', view:'Park view', sqft:'2,071 sq.ft', price:'₹4.55 Cr', match:79 },
      ],
      journey:[
        { label:'Walk-in registered',  at:'+0m · Reception', done:true },
        { label:'Preferences captured',at:'+4m · Self',      done:true },
        { label:'Assigned to Karan N.',at:'+12m · Floor',    done:true },
        { label:'With sales',          at:'+18m · Karan N.', done:true, current:true },
      ] },
    { id:'TU-260508-0301', name:'Mrs. Anjali Mehta', initials:'AM', stage:'negotiating',
      config:'4 BHK Premium', budget:'₹6.5 Cr', intent:'To live in', agent:'Riya P.', ago:'49m ago',
      phone:'+91 90999 84512', email:'anjali.mehta@outlook.com', matchScore:91, session:'38 min',
      prefs:{ typology:'4 BHK Premium', sqft:'4,600–4,800 sq.ft', budget:'₹6.5 Cr', purpose:'To live in', timeline:'0–3 months', family:'6 members', source:'Channel partner', mustHaves:['Penthouse','Private terrace'] },
      matches:[
        { no:'E-2101', tower:'Tower E', floor:'Penthouse',  bhk:'4 BHK + PH', view:'Skyline · largest', sqft:'4,690 sq.ft', price:'₹6.42 Cr', match:93 },
        { no:'F-2101', tower:'Tower F', floor:'Penthouse',  bhk:'4 BHK + PH', view:'Skyline · largest', sqft:'4,690 sq.ft', price:'₹6.58 Cr', match:90 },
      ],
      journey:[
        { label:'Walk-in registered',  at:'+0m · Reception', done:true },
        { label:'Preferences captured',at:'+5m · Self',      done:true },
        { label:'Assigned to Riya P.', at:'+15m · Floor',    done:true },
        { label:'Negotiating',         at:'+40m · Riya P.',  done:true, current:true },
      ] },
    { id:'TU-260508-0288', name:'Mr. Vivek Nair', initials:'VN', stage:'followup',
      config:'4 BHK', budget:'₹5.1 Cr', intent:'To live in', agent:'Riya P.', ago:'1h 12m ago',
      phone:'+91 97140 25588', email:'vivek.nair@zoho.com', matchScore:76, session:'16 min',
      prefs:{ typology:'4 BHK', sqft:'2,050–2,200 sq.ft', budget:'₹5.1 Cr', purpose:'To live in', timeline:'3–6 months', family:'4 members', source:'Hoarding', mustHaves:['Pool view','Two parking'] },
      matches:[
        { no:'I-1101', tower:'Tower I', floor:'11th Floor', bhk:'4 BHK', view:'Pool deck', sqft:'2,083 sq.ft', price:'₹5.02 Cr', match:81 },
        { no:'J-1201', tower:'Tower J', floor:'12th Floor', bhk:'4 BHK', view:'Pool deck', sqft:'2,083 sq.ft', price:'₹5.10 Cr', match:78 },
      ],
      journey:[
        { label:'Walk-in registered',  at:'+0m · Reception', done:true },
        { label:'Preferences captured',at:'+6m · Self',      done:true },
        { label:'Site tour done',      at:'+30m · Riya P.',  done:true },
        { label:'Follow-up scheduled', at:'+1h · Riya P.',   done:true, current:true },
      ] },
  ],
};

// ─── LOCATION ──────────────────────────────────────────────────────────────
// Nehru Nagar, Ahmedabad. Distances are micro-market estimates pending a
// verified location sheet from Venus (flag: confirm exact km/min).
// lat/lng are real approximate landmark coordinates (for map bearing/projection).
// dist/time are micro-market estimates — confirm against a Venus location sheet.
const LOCATION_ADVANTAGES = [
  { cat:'Connectivity', label:'Jhansi Ki Rani BRTS',          dist:'On road', time:'0 min',  lat:23.0230, lng:72.5363 },
  { cat:'Connectivity', label:'S. G. Highway',                dist:'4.1 km',  time:'10 min', lat:23.0290, lng:72.5070 },
  { cat:'Connectivity', label:'Ahmedabad Railway Station',    dist:'9.6 km',  time:'20 min', lat:23.0276, lng:72.6010 },
  { cat:'Connectivity', label:'SVPI International Airport',    dist:'12.4 km', time:'26 min', lat:23.0772, lng:72.6347 },

  { cat:'Education', label:'IIM Ahmedabad',                   dist:'2.1 km', time:'5 min',  lat:23.0327, lng:72.5302 },
  { cat:'Education', label:'Ahmedabad University',            dist:'3.0 km', time:'8 min',  lat:23.0372, lng:72.5430 },
  { cat:'Education', label:'CEPT University',                 dist:'3.8 km', time:'10 min', lat:23.0365, lng:72.5483 },
  { cat:'Education', label:'National Institute of Design',    dist:'3.6 km', time:'10 min', lat:23.0301, lng:72.5512 },

  { cat:'Healthcare', label:'Shalby Hospital',               dist:'4.0 km', time:'10 min', lat:23.0140, lng:72.5310 },
  { cat:'Healthcare', label:'Sterling Hospital',             dist:'4.4 km', time:'11 min', lat:23.0470, lng:72.5160 },
  { cat:'Healthcare', label:'CIMS Hospital',                 dist:'7.5 km', time:'18 min', lat:23.0640, lng:72.5430 },

  { cat:'Lifestyle',  label:'ITC Narmada',                   dist:'2.7 km', time:'7 min',  lat:23.0380, lng:72.5070 },
  { cat:'Lifestyle',  label:'Hyatt Regency Ahmedabad',       dist:'3.9 km', time:'10 min', lat:23.0382, lng:72.5060 },
  { cat:'Lifestyle',  label:'Ahmedabad One Mall',            dist:'3.5 km', time:'9 min',  lat:23.0386, lng:72.5290 },
  { cat:'Lifestyle',  label:'CG Road',                       dist:'4.0 km', time:'10 min', lat:23.0258, lng:72.5600 },

  { cat:'On-site',    label:'Stratum @ Venus Grounds (Phase 1)', dist:'Adjacent', time:'0 min', lat:23.0236, lng:72.5360 },
  { cat:'On-site',    label:'G+1 high-street retail',            dist:'On-site',  time:'0 min', lat:23.0228, lng:72.5366 },
];

// Real bundled map view (Esri) centred on the project — for the Location screen.
const MAP_VIEW = {
  center:    { lat:23.0230, lng:72.5363 },
  bounds:    { west:72.5183337, east:72.5542663, south:23.0126651, north:23.0333341 },
  satellite: 'assets/maps/sat-universe.jpg',
  vector:    'assets/maps/vec-universe.jpg',
  widthKm:   4.0,
};

// Stratum (Phase 1) tenants — Story screen credibility marquee.
const STRATUM_TENANTS = [
  'Reliance Retail', 'Accenture', 'Kraft Heinz', 'Ericsson',
  'Citi', 'Tech Mahindra', 'Siemens', 'Kotak Mahindra',
  'Central Bank of India', 'Tata AIG', 'New India Assurance', 'Active 8',
];

// ─── AMENITIES (the real 33, grouped into 5 experiences) ───────────────────
// Names reconciled VERBATIM against the client amenity key plans in
// THE_UNIVERSE_PLANS_PDF_03 (2026-07-03): Ground floor + Podium (First-floor
// open) + Covered clubhouse (First floor) + Second floor. Pure service items
// (Drop-off, Entrance Lobby, Restrooms, Utility Rooms, Society Mgmt Office) are
// intentionally excluded from the experiential set. level: GF | Podium |
// Clubhouse(covered, FF) | L2(Second).  img → assets/renders/client/<name>.jpg
// IMAGES: mapped by ACTUAL pixel content, verified render-by-render (2026-07-03).
// ⚠ The legacy outdoor render FILENAMES are scrambled — they lie about content
// (e.g. amen-basketball.jpg is really a kids splash-pad; amen-courtyard-walk.jpg
// is really box cricket; amen-tennis-aerial.jpg is really a retail arcade). So
// each `img` below points at the file that TRULY depicts that amenity, not the
// file whose name matches. Interior views (café/banquet/gym/games/…) are the
// reliable studioHBA renders. "approx" = closest real image; a few gardens share
// a render, and these have NO true render yet (flagged): Podcast Pod, The Studio,
// Petal Garden, Accent Trees, Outdoor Fitness, Water Feature, Double-height Foyer.
const AMENITY_GROUPS = [
  { id:'sport', label:'Sport & Play', accent:'#c9a05e', hero:'ext-towers-green-dusk',
    items:[
      { name:'Basketball Court',        level:'GF',     img:'amen-lounge-aerial' },      // real outdoor basketball
      { name:'Badminton Court',         level:'GF',     img:'amen-badminton-indoor' },
      { name:'Box Cricket',             level:'Podium', img:'amen-courtyard-walk' },      // real box cricket
      { name:'Pickleball Court',        level:'L2',     img:'ext-towers-green-dusk' },    // real aerial court
      { name:'Outdoor Fitness',         level:'Podium', img:'amen-kids-playground' },     // approx — the CLUB gym building
      { name:'Jogging & Walking Track', level:'Podium', img:'amen-box-cricket' },         // real joggers on track
    ]},
  { id:'wellness', label:'Wellness & Pool', accent:'#7fa8c9', hero:'amen-gym-club-pano',
    items:[
      { name:'Swimming Pool',                     level:'Podium',    img:'amen-event-lawn-pano' },      // real ground-level pool
      { name:'The Wellness Club · Lower',         level:'Clubhouse', img:'amen-wellness-strength' },
      { name:'The Wellness Club · Upper',         level:'L2',        img:'amen-wellness-cardio' },
      { name:'The Studio',                        level:'Clubhouse', img:'amen-multipurpose' },         // approx (no studio render)
      { name:'The Grand Stairway',                level:'Podium',    img:'amen-kids-water-pano' },       // real pool + grand stair
    ]},
  { id:'social', label:'Social & Club', accent:'#c98a6a', hero:'amen-banquet',
    items:[
      { name:'Guest Rooms',    level:'Clubhouse', img:'amen-guest-rooms' },
      { name:'Banquet',        level:'Clubhouse', img:'amen-banquet' },
      { name:'The Lounge',     level:'Clubhouse', img:'amen-lounge-living' },
      { name:'Café Universe',  level:'Clubhouse', img:'amen-cafe' },
      { name:'Podcast Pod',    level:'Clubhouse', img:'amen-multipurpose' },              // approx (no podcast render)
      { name:'Meeting Room',   level:'Clubhouse', img:'amen-meeting-room' },
      { name:'Learning Room',  level:'Clubhouse', img:'amen-learning-room' },
      { name:'Indoor Games',   level:'Clubhouse', img:'amen-indoor-games' },
      { name:'Gen-z Lounge',   level:'Clubhouse', img:'amen-genz-lounge' },
      { name:'Garden Theatre', level:'Podium',    img:'amen-club-garden' },               // real open-air theatre lawn
      { name:'Banquet Garden', level:'Podium',    img:'amen-pool-clubhouse-stair' },      // real club garden
    ]},
  { id:'family', label:'Family & Kids', accent:'#9bbf7a', hero:'amen-basketball',
    items:[
      { name:'Toddler’s Den',           level:'Clubhouse', img:'amen-toddlers-den' },
      { name:'Children’s Playground',   level:'Podium',    img:'amen-grass-mound' },       // real playground
      { name:'Changing Rooms',          level:'Clubhouse', img:'amen-changing-rooms' },
    ]},
  { id:'landscape', label:'Landscape & Leisure', accent:'#b59b6a', hero:'amen-club-garden',
    items:[
      { name:'Water Feature',   level:'GF',     img:'amen-basketball' },        // approx — kids splash-pad (no water-feature render)
      { name:'Lawn',            level:'GF',     img:'amen-pool-day' },           // aerial central lawn
      { name:'Seating Garden',  level:'GF',     img:'amen-clubhouse-aerial' },   // courtyard seating
      { name:'Step Seating',    level:'GF',     img:'amen-club-garden' },        // step seating at theatre
      { name:'Mound Garden',    level:'GF',     img:'amen-jogging-track' },      // real mound garden
      { name:'Crystal Garden',  level:'Podium', img:'amen-pool-clubhouse-stair' },// club garden walkway
      { name:'Petal Garden',    level:'Podium', img:'amen-pool-clubhouse-stair' },// approx (shares garden)
      { name:'Accent Trees',    level:'Podium', img:'amen-clubhouse-aerial' },   // approx — courtyard trees
    ]},
];
const AMENITY_COUNT = AMENITY_GROUPS.reduce((n,g)=>n+g.items.length,0); // 33

// Back-compat shape (cat/icon/items[string]) for any screen not yet upgraded.
const AMENITIES = AMENITY_GROUPS.map(g => ({ cat:g.label, icon:g.id, items:g.items.map(i=>i.name) }));

// ─── GALLERY (real client renders) ─────────────────────────────────────────
const GALLERY_CATS = ['Exteriors', 'Retail', 'Amenities', 'Clubhouse'];
const R = (name) => `assets/renders/client/${name}.jpg`;
// Titles/categories verified against ACTUAL pixel content (filenames are
// scrambled — see AMENITY_GROUPS note). Clubhouse category now uses the real
// studioHBA interior renders.
const GALLERY_ITEMS = [
  // ── Exteriors ──
  { id:'g-ext-1', cat:'Exteriors', src:R('ext-hero-twilight'),      tag:'Twilight',    title:'The Universe, twin towers' },
  { id:'g-ext-2', cat:'Exteriors', src:R('ext-tower-corner-day'),   tag:'Elevation',   title:'Tower elevation by day' },
  { id:'g-ext-3', cat:'Exteriors', src:R('retail-arcade-pano'),     tag:'Streetscape', title:'Towers over the retail podium' },
  { id:'g-ext-4', cat:'Exteriors', src:R('retail-storefront'),      tag:'Arrival',     title:'The arrival gateway' },
  // ── Retail ──
  { id:'g-ret-1', cat:'Retail', src:R('ext-towers-day'),        tag:'High-street', title:'The retail arcade' },
  { id:'g-ret-2', cat:'Retail', src:R('retail-podium-aerial'),  tag:'Storefront',  title:'Boutique storefronts' },
  { id:'g-ret-3', cat:'Retail', src:R('amen-tennis-aerial'),    tag:'Aerial',      title:'Retail podium, from above' },
  // ── Amenities ──
  { id:'g-am-1',  cat:'Amenities', src:R('amen-event-lawn-pano'),   tag:'Pool',     title:'The swimming pool' },
  { id:'g-am-2',  cat:'Amenities', src:R('amen-kids-water-pano'),   tag:'Pool',     title:'Pool & grand stair' },
  { id:'g-am-3',  cat:'Amenities', src:R('amen-gym-club-pano'),     tag:'Pool',     title:'The pool, from above' },
  { id:'g-am-4',  cat:'Amenities', src:R('amen-badminton-indoor'),  tag:'Sport',    title:'Indoor badminton' },
  { id:'g-am-5',  cat:'Amenities', src:R('amen-kids-playground'),   tag:'Sport',    title:'Basketball court' },
  { id:'g-am-6',  cat:'Amenities', src:R('amen-courtyard-walk'),    tag:'Sport',    title:'Box cricket' },
  { id:'g-am-7',  cat:'Amenities', src:R('ext-towers-green-dusk'),  tag:'Sport',    title:'Sports court, from above' },
  { id:'g-am-8',  cat:'Amenities', src:R('amen-basketball'),        tag:'Family',   title:"Children's play zone" },
  { id:'g-am-9',  cat:'Amenities', src:R('amen-club-garden'),       tag:'Social',   title:'Open-air theatre lawn' },
  { id:'g-am-10', cat:'Amenities', src:R('amen-box-cricket'),       tag:'Wellness', title:'The jogging track' },
  // ── Clubhouse (real interiors) ──
  { id:'g-cl-1', cat:'Clubhouse', src:R('amen-clubhouse-aerial'),  tag:'Clubhouse', title:'The Club pavilion' },
  { id:'g-cl-2', cat:'Clubhouse', src:R('amen-wellness-cardio'),   tag:'Wellness',  title:'The gymnasium' },
  { id:'g-cl-3', cat:'Clubhouse', src:R('amen-cafe'),              tag:'Café',      title:'Café & lounge' },
  { id:'g-cl-4', cat:'Clubhouse', src:R('amen-banquet'),           tag:'Events',    title:'The banquet hall' },
  { id:'g-cl-5', cat:'Clubhouse', src:R('amen-indoor-games'),      tag:'Games',     title:'Indoor games lounge' },
  { id:'g-cl-6', cat:'Clubhouse', src:R('amen-genz-lounge'),       tag:'Teens',     title:'Teen & board-game lounge' },
  { id:'g-cl-7', cat:'Clubhouse', src:R('amen-toddlers-den'),      tag:'Kids',      title:"Crèche & toddlers' den" },
  { id:'g-cl-8', cat:'Clubhouse', src:R('amen-changing-rooms'),    tag:'Wellness',  title:'Changing rooms' },
];
// Legacy aliases (some screens reference these names)
const SITE_PHOTOS = GALLERY_ITEMS.filter(g=>g.cat==='Exteriors');
const RENDER_PHOTOS = GALLERY_ITEMS.filter(g=>g.cat==='Amenities'||g.cat==='Retail');
const CLUBHOUSE_PHOTOS = GALLERY_ITEMS.filter(g=>g.cat==='Clubhouse');

// Sample customer (booking demo)
const SAMPLE_CUSTOMER = {
  name: 'Mr. Aarav Mehta',
  phone: '+91 98980 21234',
  email: 'aarav.mehta@example.com',
  loanPreApproved: true,
  pan: 'ABCDE1234F',
};

// Format INR (lakh/crore convention). Handles null → "Price on request".
function formatINR(n, opts = {}) {
  if (n == null) return 'Price on request';
  if (n >= 10000000) return `₹ ${(n/10000000).toFixed(opts.decimals ?? 2)} Cr`;
  if (n >= 100000)   return `₹ ${(n/100000).toFixed(opts.decimals ?? 1)} L`;
  return `₹ ${n.toLocaleString('en-IN')}`;
}
function formatINRFull(n) {
  if (n == null) return 'Price on request';
  return `₹ ${n.toLocaleString('en-IN')}`;
}
// sqft formatter
function fmtSqft(n){ return `${Number(n).toLocaleString('en-IN',{maximumFractionDigits:0})} sq.ft`; }

// ─── EXPORTS ───────────────────────────────────────────────────────────────
window.PROJECT = PROJECT;
window.STATUS = STATUS;
window.BLOCK_SPECS = BLOCK_SPECS;
window.TOWERS = TOWERS;
window.TYPOLOGIES = TYPOLOGIES;
window.buildFloors = buildFloors;
window.buildUnits = buildUnits;
window.towerSummary = towerSummary;
window.unitStatus = unitStatus;
window.floorLabel = floorLabel;
window.LOCATION_ADVANTAGES = LOCATION_ADVANTAGES;
window.MAP_VIEW = MAP_VIEW;
window.STRATUM_TENANTS = STRATUM_TENANTS;
window.AMENITY_GROUPS = AMENITY_GROUPS;
window.AMENITY_COUNT = AMENITY_COUNT;
window.AMENITIES = AMENITIES;
window.GALLERY_CATS = GALLERY_CATS;
window.GALLERY_ITEMS = GALLERY_ITEMS;
window.SITE_PHOTOS = SITE_PHOTOS;
window.RENDER_PHOTOS = RENDER_PHOTOS;
window.CLUBHOUSE_PHOTOS = CLUBHOUSE_PHOTOS;
window.SAMPLE_CUSTOMER = SAMPLE_CUSTOMER;
window.formatINR = formatINR;
window.formatINRFull = formatINRFull;
window.fmtSqft = fmtSqft;
window.unitPriceSheet = unitPriceSheet;
window.SALES_DESK = SALES_DESK;
