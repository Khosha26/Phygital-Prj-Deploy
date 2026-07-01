// The Universe · MASTER PLAN EXPLORER (Module 04) — FULL-SCREEN IMMERSIVE.
// The selected plan fills the entire screen as an edge-to-edge backdrop with
// pan / pinch / wheel zoom + double-tap reset. A translucent, collapsible glass
// library card floats over the plan; the header / lockup / EXPLORE-OVERVIEW pill
// float in a translucent top bar. Interactive gold pins (data-driven PINS{})
// overlay each plan — tap a pin to ease/zoom toward it and open an info popover.
// "Block Massing" swaps the flat image for the live interactive 3D GLB viewer
// (iframe) — orbit / zoom / tap-a-tower for info. This screen is SELF-CONTAINED
// and intentionally does NOT link into the separate Inventory flow.
//
// Matches index.html's 2560×1600 scaled-canvas convention.
// Component name PlanExplorerScreen · route 'masterplan-explorer'.

const MPX_PLANS = [
  { id:'ramp-ground',   title:'Ramp Marking — Ground Floor Plan',                          tags:['GROUND FLOOR','PARKING'],            cats:['Parking','Ground Floor'], img:'assets/masterplan/plans/ramp-ground.png?v=3',         icon:'parking' },
  { id:'retail-zp',     title:'Retail — Zoning & Parking — Basement 1 (Retail Parking)',    tags:['BASEMENT 1','RETAIL','PARKING'],     cats:['Retail','Parking'],       img:'assets/masterplan/plans/retail-zoning-parking.png?v=2', icon:'bag' },
  { id:'retail-ground', title:'Retail Marking — Ground Floor',                              tags:['GROUND FLOOR','RETAIL'],             cats:['Retail','Ground Floor'],  img:'assets/masterplan/plans/retail-ground.png?v=2',       icon:'tag' },
  { id:'retail-first',  title:'Retail Marking — First Floor',                              tags:['FIRST FLOOR','RETAIL'],              cats:['Retail','First Floor'],   img:'assets/masterplan/plans/retail-first.png?v=2',        icon:'stairs' },
  { id:'circ-ab',       title:'Circulation — Tower A & B',                                 tags:['MULTI-TOWER','CIRCULATION'],         cats:['Circulation'],            img:'assets/masterplan/plans/circulation-ab.png?v=2',      icon:'circ' },
  { id:'circ-cdhij',    title:'Circulation — Tower C, D, H, I & J',                         tags:['MULTI-TOWER','CIRCULATION'],         cats:['Circulation'],            img:'assets/masterplan/plans/circulation-cdhij.png?v=2',   icon:'circ' },
  { id:'circ-efg',      title:'Circulation — Tower E, F & G',                              tags:['MULTI-TOWER','CIRCULATION'],         cats:['Circulation'],            img:'assets/masterplan/plans/circulation-efg.png?v=2',     icon:'circ' },
  { id:'block-massing', title:'Block Massing',                                             tags:['MASTER PLAN','MASSING','3D'],        cats:[],                         img:'assets/masterplan/plans/block-massing.png',           icon:'massing' },
];

const MPX_FILTERS = ['All','Circulation','Retail','Parking','Ground Floor','First Floor'];

// ── pin accent palette by kind (matches inventory.jsx LM_KIND vocabulary) ──
const MPX_KIND = {
  landscape:'#9bbf7a', social:'#c98a6a', wellness:'#7fa8c9', sport:'#c9a05e',
  family:'#b59bd0', retail:'#d9b56b', entry:'#e0c48a', parking:'#9aa0a6',
  context:'#c97f6a', tower:'#c9a05e', core:'#8fb1c9', plaza:'#9bbf7a', ramp:'#9aa0a6',
};
// compact line-glyphs (24-box, currentColor) — reused from inventory.jsx vocab
const MPX_PIN_GLYPH = {
  landscape:'M5 18 Q9 9 12 14 Q15 9 19 18 M12 14 V7',
  social:'M4 16 L12 6 L20 16 Z M9 16 V12 H15 V16',
  wellness:'M4 14 Q8 10 12 14 T20 14 M4 18 Q8 14 12 18 T20 18',
  sport:'M12 4 A8 8 0 1 0 12 20 A8 8 0 1 0 12 4 M4 12 H20 M12 4 Q7 12 12 20 Q17 12 12 4',
  family:'M8 8 A2 2 0 1 0 8 7.9 M8 11 V17 M5 14 H11 M16 8 A2 2 0 1 0 16 7.9 M16 11 V17 M13 14 H19',
  retail:'M5 9 H19 L18 19 H6 Z M8 9 V7 A4 4 0 0 1 16 7 V9',
  entry:'M7 20 V7 H17 V20 M7 7 L12 4 L17 7 M13 13 H13.5',
  parking:'M8 19 V6 H13 A4 4 0 0 1 13 14 H8',
  context:'M6 18 V8 H10 V18 M14 18 V5 H18 V18 M4 18 H20',
  core:'M12 3 V21 M3 12 H21 M6 6 L18 18 M18 6 L6 18',
  plaza:'M4 20 H20 M7 20 V10 H17 V20 M10 10 V6 H14 V10',
  ramp:'M4 19 L20 7 M4 19 H20 M11 13 V19',
  tower:null, // towers draw a letter, not a glyph
};

// ── PINS — data-driven { planId: [ {x%,y%, label, sub, kind, detail[] } ] } ──
// Coords are PERCENT of the plan image (0–100). main-mp reuses inventory.jsx's
// LANDMARKS facts + the 10 towers; the others get sensible inferred pins.
const PINS = {
  // ── MAIN MASTER PLAN — landmarks (from inventory LANDMARKS) + 10 towers ──
  'main-mp': [
    // landmarks
    { x:57, y:53, kind:'landscape', label:'Central Landscape Garden', sub:'4-acre podium green',
      detail:['The gravitational core — a 4-acre landscaped garden every tower opens onto','Crystal garden, mound garden, flowering & seating gardens','Accent trees & terraced seating'] },
    { x:59, y:35, kind:'social', label:'The Clubhouse · G+1', sub:'L-shaped club · gym · pool',
      detail:['Single L-shaped clubhouse anchoring the central area','G+1 clubhouse with gym & swimming pool','Banquet, café, library & co-working, indoor games, guest rooms'] },
    { x:53, y:42, kind:'wellness', label:'Swimming Pool & Jacuzzi', sub:'Central pool deck',
      detail:['Swimming pool & jacuzzi in the central podium','Pool deck with clubhouse grand stair','Changing rooms at clubhouse'] },
    { x:74, y:21, kind:'sport', label:'Sports Court · Pickleball', sub:'Outdoor courts',
      detail:['Outdoor pickleball court on the 2nd floor','Sports garden, running track & box cricket','Children’s playground'] },
    { x:41, y:83, kind:'retail', label:'High-Street Retail · G+1', sub:'47 shops',
      detail:['G+1 high-street retail along the frontage','47 shops — 25 ground floor + 22 first floor','Merged corner shops; retail parking at basement'] },
    { x:57, y:91, kind:'entry', label:'Grand Arrival Foyer', sub:'Double-height entry',
      detail:['Double-height foyer entry for blocks C–J','Entrance water feature & arrival court'] },
    { x:67, y:66, kind:'parking', label:'Parking · 3 Basements + GF', sub:'4 parking levels',
      detail:['Four levels of parking — 3 basements + ground floor','Separate apartment & retail ramps'] },
    { x:74, y:34, kind:'context', label:'Stratum · Phase 1', sub:'Operational · adjacent',
      detail:['Phase 1 (Stratum) is operational, right next door','Home to Reliance, Accenture, Citi, Siemens, Tech Mahindra & more','Proof the address already works'] },
    // 10 towers (lettered pins) — positions from inventory TOWER_PT scaled to %
    { x:51, y:17, kind:'tower', tower:'E', label:'Tower E', sub:'Crown · 4 BHK + Penthouse', detail:['20 floors · 76 homes','Skyline · the largest homes','Pairs with Tower F'] },
    { x:67, y:21, kind:'tower', tower:'F', label:'Tower F', sub:'Crown · 4 BHK + Penthouse', detail:['20 floors · 76 homes','Skyline · the largest homes','Pairs with Tower E'] },
    { x:47, y:35, kind:'tower', tower:'D', label:'Tower D', sub:'West Court · 4 BHK', detail:['20 floors · 38 homes','Central-garden facing','Pairs with Tower C'] },
    { x:73, y:45, kind:'tower', tower:'G', label:'Tower G', sub:'Park Wing · 4 BHK', detail:['20 floors · 76 homes','Podium & sports-garden facing','Pairs with Tower H'] },
    { x:47, y:61, kind:'tower', tower:'C', label:'Tower C', sub:'West Court · 4 BHK', detail:['20 floors · 38 homes','Central-garden facing','Pairs with Tower D'] },
    { x:73, y:72, kind:'tower', tower:'H', label:'Tower H', sub:'Park Wing · 4 BHK', detail:['20 floors · 76 homes','Podium & sports-garden facing','Pairs with Tower G'] },
    { x:29, y:72, kind:'tower', tower:'B', label:'Tower B', sub:'North Edge · 4 BHK', detail:['21 floors · 84 homes','North · BRTS frontage','Pairs with Tower A'] },
    { x:35, y:72, kind:'tower', tower:'A', label:'Tower A', sub:'North Edge · 4 BHK', detail:['21 floors · 84 homes','North · BRTS frontage','Pairs with Tower B'] },
    { x:51, y:78, kind:'tower', tower:'J', label:'Tower J', sub:'Pool Court · 4 BHK', detail:['20 floors · 38 homes','Swimming-pool-deck facing','Pairs with Tower I'] },
    { x:63, y:78, kind:'tower', tower:'I', label:'Tower I', sub:'Pool Court · 4 BHK', detail:['20 floors · 38 homes','Swimming-pool-deck facing','Pairs with Tower J'] },
  ],

  // ── RAMP MARKING — GROUND FLOOR ──
  'ramp-ground': [
    { x:20, y:78, kind:'entry',   label:'Apartment Ramp Entry', sub:'Resident vehicle access', detail:['Dedicated apartment vehicle ramp down to basements','Keeps resident & retail traffic separate'] },
    { x:78, y:74, kind:'ramp',    label:'Retail Parking Ramp', sub:'Visitor / retail access', detail:['Separate ramp serving retail parking at Basement 1','Independent of the resident circulation core'] },
    { x:50, y:46, kind:'parking', label:'Ground-Floor Parking Bays', sub:'Surface stack', detail:['Marked ground-floor parking adjacent to the cores','Feeds the three basement levels below'] },
    { x:52, y:88, kind:'entry',   label:'Arrival Drop-Off', sub:'Porte-cochère', detail:['Covered drop-off at the grand foyer','Pause-and-go lane keeps the ramp clear'] },
    { x:30, y:30, kind:'core',    label:'North Circulation Core', sub:'Lift + stair', detail:['Vertical core linking GF to the parking basements'] },
    { x:72, y:36, kind:'core',    label:'East Circulation Core', sub:'Lift + stair', detail:['Vertical core linking GF to the parking basements'] },
  ],

  // ── RETAIL — ZONING & PARKING · BASEMENT 1 ──
  'retail-zp': [
    { x:50, y:30, kind:'retail',  label:'Retail Parking Zone', sub:'Basement 1', detail:['Dedicated retail parking floor, zoned away from resident bays','Direct lift access up to the high-street level'] },
    { x:24, y:58, kind:'ramp',    label:'Retail Ramp In', sub:'Down ramp', detail:['Retail visitors descend via their own ramp','No overlap with apartment circulation'] },
    { x:76, y:60, kind:'ramp',    label:'Retail Ramp Out', sub:'Up ramp', detail:['One-way exit ramp back to street level'] },
    { x:50, y:74, kind:'parking', label:'Visitor Bays', sub:'Marked stalls', detail:['Visitor & shopper parking allocation','Signage-led wayfinding to retail lifts'] },
    { x:38, y:42, kind:'core',    label:'Retail Lift Core', sub:'To G+1 high street', detail:['Express retail core to ground & first-floor shops'] },
  ],

  // ── RETAIL MARKING — GROUND FLOOR ──
  'retail-ground': [
    { x:50, y:18, kind:'retail',  label:'High-Street Frontage', sub:'25 ground shops', detail:['25 ground-floor shops along the high-street frontage','Active edge facing the BRTS / arrival road'] },
    { x:22, y:50, kind:'entry',   label:'West Retail Entry', sub:'Pedestrian plaza', detail:['Shaded pedestrian entry into the retail spine'] },
    { x:78, y:50, kind:'entry',   label:'East Retail Entry', sub:'Pedestrian plaza', detail:['Second pedestrian access from the east'] },
    { x:50, y:62, kind:'plaza',   label:'Retail Plaza', sub:'Open court', detail:['Open plaza knitting the shopfronts together','Seating & landscape pause points'] },
    { x:50, y:90, kind:'parking', label:'Retail Drop-Off', sub:'Kerbside', detail:['Kerbside shopper drop-off at the frontage'] },
    { x:65, y:30, kind:'core',    label:'Retail Lift / Stair', sub:'To first floor', detail:['Vertical link up to the 22 first-floor shops'] },
  ],

  // ── RETAIL MARKING — FIRST FLOOR ──
  'retail-first': [
    { x:50, y:20, kind:'retail',  label:'First-Floor Shops', sub:'22 shops', detail:['22 first-floor shops above the high street','Merged corner units for anchor tenants'] },
    { x:28, y:52, kind:'core',    label:'West Vertical Core', sub:'Lift + escalator', detail:['Connects first-floor retail to the ground plaza'] },
    { x:72, y:52, kind:'core',    label:'East Vertical Core', sub:'Lift + escalator', detail:['Second vertical connection to ground level'] },
    { x:50, y:48, kind:'plaza',   label:'Upper Galleria Walk', sub:'Connecting deck', detail:['Sheltered first-floor walkway linking the shops','Overlooks the retail plaza below'] },
    { x:50, y:82, kind:'social',  label:'Café / F&B Cluster', sub:'Terrace edge', detail:['F&B cluster with a terrace overlooking the frontage'] },
  ],

  // ── CIRCULATION plans — share a compact entry / drop-off / core set ──
  'circ-ab': [
    { x:32, y:30, kind:'tower',   tower:'A', label:'Tower A Core', sub:'North Edge', detail:['Resident lift & stair core for Tower A'] },
    { x:62, y:32, kind:'tower',   tower:'B', label:'Tower B Core', sub:'North Edge', detail:['Resident lift & stair core for Tower B'] },
    { x:48, y:80, kind:'entry',   label:'A&B Drop-Off', sub:'Arrival court', detail:['Shared arrival drop-off serving the A&B cluster'] },
    { x:48, y:55, kind:'plaza',   label:'Cluster Court', sub:'Landscape link', detail:['Landscaped court linking both tower lobbies to the garden'] },
  ],
  'circ-cdhij': [
    { x:30, y:34, kind:'tower',   tower:'C', label:'Tower C Core', sub:'West Court', detail:['Resident lift & stair core for Tower C'] },
    { x:46, y:26, kind:'tower',   tower:'D', label:'Tower D Core', sub:'West Court', detail:['Resident lift & stair core for Tower D'] },
    { x:70, y:38, kind:'tower',   tower:'H', label:'Tower H Core', sub:'Park Wing', detail:['Resident lift & stair core for Tower H'] },
    { x:42, y:74, kind:'tower',   tower:'J', label:'Tower J Core', sub:'Pool Court', detail:['Resident lift & stair core for Tower J'] },
    { x:62, y:76, kind:'tower',   tower:'I', label:'Tower I Core', sub:'Pool Court', detail:['Resident lift & stair core for Tower I'] },
    { x:50, y:90, kind:'entry',   label:'Shared Foyer Entry', sub:'Double-height', detail:['Double-height arrival foyer serving blocks C–J'] },
  ],
  'circ-efg': [
    { x:34, y:28, kind:'tower',   tower:'E', label:'Tower E Core', sub:'Crown', detail:['Resident lift & stair core for Tower E'] },
    { x:62, y:30, kind:'tower',   tower:'F', label:'Tower F Core', sub:'Crown', detail:['Resident lift & stair core for Tower F'] },
    { x:78, y:54, kind:'tower',   tower:'G', label:'Tower G Core', sub:'Park Wing', detail:['Resident lift & stair core for Tower G'] },
    { x:48, y:80, kind:'entry',   label:'E&F Drop-Off', sub:'Arrival court', detail:['Shared arrival drop-off serving the crown cluster'] },
    { x:50, y:56, kind:'plaza',   label:'Garden Link', sub:'To podium', detail:['Landscaped link from the lobbies into the central garden'] },
  ],
};

// ── INTERACTIVE MARKERS — the highlighted/dashed zones baked into each plan.
//    Each marker draws a pulsing GLOW over its box + a numbered POINTER at the
//    centre; tapping the pointer zooms into the zone and opens a centred info card.
//    box {x,y,w,h} = percent of the plan image's contain-fit rect.
const MARKERS = {
  'ramp-ground': [
    { num:1, color:'red', box:{x:49.03,y:31.58,w:2.00,h:9.76}, title:'Apartment Ramp',
      sub:'Resident vehicle access', detail:['Dedicated apartment ramp down to the parking basements','Keeps resident traffic clear of the retail circulation'] },
    { num:2, color:'red', box:{x:37.71,y:57.00,w:2.14,h:11.14}, title:'Parking Ramp · West',
      sub:'Ground → basement', detail:['West vehicle ramp linking the ground floor to basement parking','Feeds the western stack of parking bays'] },
    { num:3, color:'red', box:{x:52.69,y:57.64,w:8.22,h:2.67}, title:'Central Drive Aisle',
      sub:'Ground-floor circulation', detail:['Primary ground-floor drive aisle through the parking field','Connects both ramps to the surface bays & cores'] },
  ],
  'retail-zp': [
    { num:1, color:'magenta', box:{x:38.5,y:15.5,w:19.5,h:11.0}, title:'Retail · Plaza North',
      sub:'High street · Units 1–2', detail:['Prime plaza-facing retail frontage along the north edge','Anchor shopfronts (Units 1 & 2) opening to the arrival plaza','Maximum footfall from the landscaped plaza'] },
    { num:2, color:'magenta', box:{x:52.5,y:34.0,w:6.8,h:14.0}, title:'Retail · Plaza East',
      sub:'High street · Unit 3', detail:['East plaza-facing retail strip','Unit 3 — corner shop with dual frontage','Lift & stair access up to the first-floor shops'] },
    { num:3, color:'red', box:{x:53.59,y:49.10,w:5.74,h:4.46}, title:'Vehicle Ramp',
      sub:'Ground → Basement-1 parking', detail:['Dedicated vehicle ramp down to Basement-1 parking','Separates retail-visitor & resident circulation','Two-way controlled access'] },
    { num:4, color:'magenta', box:{x:53.53,y:53.35,w:5.80,h:6.48}, title:'Retail · South Block',
      sub:'High street · Plaza edge', detail:['Southern retail units completing the plaza spine','Rear-corridor service access','Continuous active frontage to the plaza'] },
    { num:5, color:'red', box:{x:75.84,y:27.84,w:1.90,h:13.28}, title:'Basement-1 Parking',
      sub:'Retail parking zone', detail:['Dedicated retail / visitor parking at Basement 1','Marked bay rows with wide drive aisles','Direct lift cores up to the retail level'] },
    { num:6, color:'green', box:{x:89.23,y:15.09,w:5.14,h:5.42}, title:'Services & MEP',
      sub:'Plant / utility zone', detail:['Mechanical, electrical & plumbing services zone','Segregated from public parking circulation','Supports the retail & basement levels'] },
  ],
  'retail-ground': [
    { num:1, color:'gold', box:{x:44.0,y:10.5,w:28.0,h:11.5}, title:'High-Street Retail · North',
      sub:'Ground-floor shops', detail:['The principal ground-floor retail frontage along the north edge','Continuous shopfronts opening to the landscaped boulevard','Highest-visibility units in the development'] },
    { num:2, color:'gold', box:{x:65.5,y:25.0,w:12.0,h:33.0}, title:'Retail Spine · East',
      sub:'Ground-floor shops', detail:['Retail units lining the eastern edge of the podium','Direct frontage to the internal street & parking court','A mix of standard & corner-shop formats'] },
    { num:3, color:'teal', box:{x:40.5,y:20.5,w:6.0,h:8.0}, title:'Grand Arrival Court',
      sub:'Drop-off & roundabout', detail:['Signature arrival roundabout & covered drop-off','Welcomes residents and retail visitors alike','Sets the address’s first impression'] },
    { num:4, color:'blue', box:{x:45.0,y:27.0,w:18.0,h:31.0}, title:'Surface Parking Court',
      sub:'Ground-floor parking', detail:['Organised ground-floor parking field at the core','Wide drive aisles feeding the basement ramps','Screened from the retail frontage by landscape'] },
    { num:5, color:'gold', box:{x:47.0,y:62.0,w:12.5,h:6.0}, title:'Retail Plaza · South',
      sub:'Shops & arrival', detail:['Southern retail cluster framing the secondary arrival','Café & convenience formats at the plaza edge','Pedestrian-friendly active frontage'] },
    { num:6, color:'green', box:{x:27.0,y:55.0,w:17.0,h:32.0}, title:'Garden Residences Wing',
      sub:'Low-rise homes + garden', detail:['Intimate low-rise residential blocks in the south-west wing','Private landscaped garden & community lawn','The quietest, most green-fronted address in the scheme'] },
  ],
  'retail-first': [
    { num:1, color:'gold', box:{x:47.5,y:13.8,w:30.0,h:13.0}, title:'First-Floor Retail · North',
      sub:'First-floor shops', detail:['First-floor retail frontage above the high street','Larger-format units & showrooms','Linked to the ground floor by escalators & lifts'] },
    { num:2, color:'gold', box:{x:72.5,y:25.0,w:9.0,h:37.0}, title:'First-Floor Retail · East',
      sub:'First-floor shops', detail:['Eastern first-floor retail wrapping the podium','Terraced units overlooking the amenity deck','Premium upper-level shop formats'] },
    { num:3, color:'blue', box:{x:55.5,y:35.5,w:10.0,h:8.0}, title:'Swimming Pool & Deck',
      sub:'Amenity podium', detail:['Resort-style swimming pool & sun deck','Pool-side lounge and changing rooms','The heart of the first-floor amenity podium'] },
    { num:4, color:'green', box:{x:55.0,y:49.0,w:13.0,h:16.0}, title:'Central Lawn & Garden',
      sub:'Open green', detail:['Expansive central lawn for events & play','Landscaped gardens framing the green','The development’s signature open space'] },
    { num:5, color:'purple', box:{x:47.0,y:70.0,w:25.0,h:9.0}, title:'Clubhouse & Amenities',
      sub:'Indoor amenities', detail:['Clubhouse with gym, banquet & indoor games','Café, library & co-working lounges','Direct access from the amenity podium'] },
    { num:6, color:'red', box:{x:68.0,y:41.0,w:10.0,h:20.0}, title:'Running Track & Sports',
      sub:'Active zone', detail:['Curved running / jogging track around the green','Outdoor fitness & sports pockets','Wraps the lawn for an active edge'] },
  ],
  'circ-ab': [
    { num:1, color:'teal', box:{x:33,y:2,w:5,h:9}, title:'Site Entry · North Drive',
      sub:'Vehicle entry', detail:['Main vehicular entry into the development from the north','Feeds the surface parking & basement ramps'] },
    { num:2, color:'blue', box:{x:40,y:30,w:24,h:28}, title:'Parking Circulation',
      sub:'Surface parking court', detail:['One-way circulation loop through the surface parking','Aisles feed every core & the basement ramp'] },
    { num:3, color:'green', box:{x:28,y:52,w:7,h:7}, title:'Way to Basement',
      sub:'Basement ramp', detail:['Ramp down to the basement parking levels','Branches off the main internal drive'] },
    { num:4, color:'magenta', box:{x:18,y:63,w:15,h:11}, title:'Tower B',
      sub:'Residential core + lobby', detail:['Tower B lobby, entrance & residential core','Drop-off court at the tower forecourt','Direct lift access to all floors'] },
    { num:5, color:'magenta', box:{x:24,y:83,w:14,h:10}, title:'Tower A',
      sub:'Residential core + lobby', detail:['Tower A lobby, entrance & residential core','Independent arrival within the garden wing','Direct lift access to all floors'] },
  ],
  'circ-efg': [
    { num:1, color:'magenta', box:{x:37,y:13,w:11,h:13}, title:'Tower E',
      sub:'Residential core + lobby', detail:['Tower E lobby & residential core','Entrance lobby off the north drive','Lift & stair access to all floors'] },
    { num:2, color:'magenta', box:{x:49,y:13,w:12,h:13}, title:'Tower F',
      sub:'Residential core + lobby', detail:['Tower F lobby & residential core','Shares the north arrival with Tower E','Lift & stair access to all floors'] },
    { num:3, color:'magenta', box:{x:55,y:37,w:10,h:13}, title:'Tower G',
      sub:'Residential core + lobby', detail:['Tower G lobby & residential core','Eastern arrival & drop-off','Lift & stair access to all floors'] },
    { num:4, color:'purple', box:{x:44,y:22,w:8,h:7}, title:'Double-Height Entrance Foyer',
      sub:'Grand arrival', detail:['Double-height entrance foyer for the E–F cluster','A signature arrival volume','Connects lobby, drop-off & cores'] },
    { num:5, color:'red', box:{x:54,y:39,w:6,h:7}, title:'Drop-off Court',
      sub:'Arrival', detail:['Covered drop-off serving Tower G','Pause-and-go lane keeps the drive clear'] },
    { num:6, color:'blue', box:{x:42,y:33,w:4,h:13}, title:'Way to Basement',
      sub:'Basement ramp', detail:['Ramp down to basement parking','Separated from the resident drop-off'] },
  ],
  'circ-cdhij': [
    { num:1, color:'magenta', box:{x:32,y:30,w:8,h:14}, title:'Tower D',
      sub:'Residential core + lobby', detail:['Tower D lobby & residential core','West-court arrival','Lift & stair access to all floors'] },
    { num:2, color:'magenta', box:{x:32,y:45,w:8,h:13}, title:'Tower C',
      sub:'Residential core + lobby', detail:['Tower C lobby & residential core','Pairs with Tower D on the west court','Lift & stair access to all floors'] },
    { num:3, color:'magenta', box:{x:35,y:61,w:10,h:9}, title:'Tower J',
      sub:'Residential core + lobby', detail:['Tower J lobby & residential core','Pool-court arrival','Lift & stair access to all floors'] },
    { num:4, color:'magenta', box:{x:45,y:61,w:10,h:9}, title:'Tower I',
      sub:'Residential core + lobby', detail:['Tower I lobby & residential core','Pairs with Tower J on the pool court','Lift & stair access to all floors'] },
    { num:5, color:'magenta', box:{x:57,y:55,w:9,h:14}, title:'Tower H',
      sub:'Residential core + lobby', detail:['Tower H lobby & residential core','Park-wing arrival & drop-off','Lift & stair access to all floors'] },
    { num:6, color:'red', box:{x:45,y:55,w:10,h:6}, title:'Way to Basement & Drop-off',
      sub:'Arrival + ramp', detail:['Central drop-off with the basement ramp alongside','Serves the C–J cluster','Keeps resident & service traffic ordered'] },
  ],
};
// circulation plans carry an animated coloured-arrow overlay (extracted from the artwork)
const CIRC = {
  'circ-ab':   { arrows:'assets/masterplan/plans/circulation-ab-arrows.png?v=1',    glow:'rgba(70,185,105,0.95)' },
  'circ-efg':  { arrows:'assets/masterplan/plans/circulation-efg-arrows.png?v=1',   glow:'rgba(72,130,235,0.95)' },
  'circ-cdhij':{ arrows:'assets/masterplan/plans/circulation-cdhij-arrows.png?v=1', glow:'rgba(235,72,62,0.95)' },
};
// per-colour glow / pin palette
const MK_COLOR = {
  red:     { line:'rgba(229,57,53,0.92)',  fill:'rgba(255,72,66,0.50)',  pin:'#e5392f', ring:'rgba(229,57,53,0.40)', glow:'rgba(255,72,66,0.75)' },
  magenta: { line:'rgba(206,42,150,0.94)', fill:'rgba(236,72,180,0.42)', pin:'#cf2c96', ring:'rgba(206,42,150,0.40)', glow:'rgba(236,72,180,0.70)' },
  green:   { line:'rgba(40,150,84,0.94)',  fill:'rgba(70,180,110,0.42)', pin:'#239a54', ring:'rgba(40,150,84,0.40)',  glow:'rgba(70,180,110,0.70)' },
  gold:    { line:'rgba(201,150,40,0.95)', fill:'rgba(232,180,70,0.40)', pin:'#c2922e', ring:'rgba(201,150,40,0.40)', glow:'rgba(235,185,80,0.72)' },
  blue:    { line:'rgba(70,120,210,0.93)', fill:'rgba(96,150,235,0.36)', pin:'#3f74d6', ring:'rgba(70,120,210,0.40)', glow:'rgba(110,160,240,0.70)' },
  teal:    { line:'rgba(28,150,160,0.93)', fill:'rgba(60,185,195,0.40)', pin:'#1f9aa6', ring:'rgba(28,150,160,0.40)', glow:'rgba(70,200,210,0.70)' },
  purple:  { line:'rgba(150,80,190,0.93)', fill:'rgba(178,110,215,0.36)', pin:'#9a52be', ring:'rgba(150,80,190,0.40)', glow:'rgba(190,120,225,0.70)' },
};

// ── inline plan-type glyphs (gold, simple, consistent · 24×24 viewBox) ──
function MpxGlyph({ type, size = 22, stroke = 'currentColor' }){
  const P = { fill:'none', stroke, strokeWidth:1.6, strokeLinecap:'round', strokeLinejoin:'round' };
  const G = {
    parking: <g {...P}><path d="M8 19 V5 h5.5 a4 4 0 0 1 0 8 H8"/></g>,
    bag:     <g {...P}><path d="M5.5 8 H18.5 L17.4 20 H6.6 Z"/><path d="M8.5 8 V6.5 a3.5 3.5 0 0 1 7 0 V8"/></g>,
    tag:     <g {...P}><path d="M12.5 4 H20 V11.5 L11 20.5 L3.5 13 Z"/><circle cx="16.4" cy="7.6" r="1.3"/></g>,
    stairs:  <g {...P}><path d="M4 20 H8 V16 H12 V12 H16 V8 H20"/></g>,
    circ:    <g {...P}><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7.6 7.4 L11 15.8 M16.4 7.4 L13 15.8 M8 6 H16"/></g>,
    massing: <g {...P}><path d="M5 18 V11 h4 v7 M10 18 V7 h4 v11 M15 18 V13 h4 v5 M3.5 18 H20.5"/></g>,
    map:     <g {...P}><path d="M9 4 L3.5 6 V20 L9 18 L15 20 L20.5 18 V4 L15 6 Z"/><path d="M9 4 V18 M15 6 V20"/></g>,
  };
  return <svg viewBox="0 0 24 24" width={size} height={size} style={{display:'block'}}>{G[type]||G.map}</svg>;
}

function ensureMpxKeys(){
  if (typeof document==='undefined' || document.getElementById('uni-mpx-keys')) return;
  const s=document.createElement('style'); s.id='uni-mpx-keys';
  s.textContent=`@keyframes mpxFade{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}
    @keyframes mpxImg{0%{opacity:0}100%{opacity:1}}
    @keyframes mpxPinIn{0%{opacity:0;transform:translate(-50%,-50%) scale(0.4)}60%{opacity:1}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}
    @keyframes mpxPulse{0%{transform:scale(1);opacity:0.55}70%{transform:scale(2.3);opacity:0}100%{transform:scale(2.3);opacity:0}}
    @keyframes mpxPop{0%{opacity:0;transform:translateY(10px) scale(0.96)}100%{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes mkGlow{0%,100%{box-shadow:0 0 0 1px,0 0 8px 1px,0 0 16px 3px}50%{box-shadow:0 0 0 1.5px,0 0 20px 5px,0 0 42px 13px}}
    @keyframes mpxGlowCore{0%,100%{opacity:0.16}50%{opacity:0.44}}
    @keyframes mkCardIn{0%{opacity:0;transform:translate(-50%,-50%) scale(0.94)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}
    @keyframes circPulse{0%,100%{opacity:0.28}50%{opacity:1}}
    .mpx-scroll::-webkit-scrollbar{width:8px}
    .mpx-scroll::-webkit-scrollbar-thumb{background:rgba(176,138,63,0.32);border-radius:8px}
    .mpx-scroll::-webkit-scrollbar-track{background:transparent}
    .mpx-pin{transition:transform .18s ease}
    .mpx-pin:hover{transform:translate(-50%,-58%) scale(1.08)}`;
  document.head.appendChild(s);
}

// frosted-glass surface tokens (cream translucent + gold hairline)
const MPX_GLASS = {
  background:'rgba(248,244,236,0.78)',
  backdropFilter:'blur(22px) saturate(1.25)', WebkitBackdropFilter:'blur(22px) saturate(1.25)',
  border:'1px solid rgba(201,160,94,0.42)',
  boxShadow:'0 24px 60px rgba(40,30,12,0.22), inset 0 1px 0 rgba(255,255,255,0.6)',
};
const MPX_GLASS_SOLID = {
  background:'rgba(252,250,245,0.86)',
  backdropFilter:'blur(20px) saturate(1.2)', WebkitBackdropFilter:'blur(20px) saturate(1.2)',
  border:'1px solid rgba(201,160,94,0.34)',
  boxShadow:'0 14px 36px rgba(40,30,12,0.16)',
};

function PlanExplorerScreen(){
  ensureMpxKeys();
  const [sel, setSel]       = React.useState('block-massing');   // open on the interactive 3D massing
  const [filter, setFilter] = React.useState('All');
  const [query, setQuery]   = React.useState('');
  const [panelOpen, setPanelOpen] = React.useState(true);
  const [pinSel, setPinSel] = React.useState(null);        // index of open pin popover
  const [appear, setAppear] = React.useState(false);       // staggered pin reveal
  const [imgAR, setImgAR]   = React.useState(null);        // natural aspect of the loaded plan (for pin alignment)
  const [activeMk, setActiveMk] = React.useState(null);    // index of the open marker (centred info card)

  // pan / zoom transform state
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan]   = React.useState({ x:0, y:0 });
  const boxRef = React.useRef(null);
  const g = React.useRef({ active:false, mode:null, startD:0, startZoom:1, sx:0, sy:0, px:0, py:0, midX:0, midY:0, lastTap:0, ltx:0, lty:0 });

  const filtered = React.useMemo(()=>{
    const q = query.trim().toLowerCase();
    return MPX_PLANS.filter(p=>{
      const okCat = filter==='All' || p.cats.includes(filter);
      const okQ   = !q || p.title.toLowerCase().includes(q);
      return okCat && okQ;
    });
  }, [filter, query]);

  const selPlan = sel ? MPX_PLANS.find(p=>p.id===sel) : null;
  const isMassing = sel === 'block-massing';

  // Keep the 3D massing cluster centred in the area RIGHT of the library panel:
  // tell the viewer to shift its framing when the panel opens / closes.
  const massingFrameRef = React.useRef(null);
  const postMassingOffset = React.useCallback(() => {
    const f = massingFrameRef.current;
    if (!f || !f.contentWindow) return;
    try { f.contentWindow.postMessage({ type:'massing-offset', frac: panelOpen ? 0.055 : 0 }, '*'); } catch(_) {}
  }, [panelOpen]);
  React.useEffect(() => { postMassingOffset(); }, [panelOpen, isMassing, postMassingOffset]);
  // The plan artworks are already self-annotated (their own labels / arrows / legends),
  // so redundant 2D pins are intentionally OFF — they only cluttered the clean plans.
  // The interactive layer is the Block Massing 3D. Flip SHOW_PINS to re-enable per-plan pins.
  const SHOW_PINS = false;
  const pins = SHOW_PINS ? (PINS[sel] || []) : [];
  const markers = MARKERS[sel] || [];          // interactive highlighted zones for this plan

  // reset transform + pin state + re-trigger pin reveal whenever the plan changes
  React.useEffect(()=>{
    setZoom(1); setPan({x:0,y:0}); setPinSel(null); setActiveMk(null); setAppear(false); setImgAR(null);
    const id = requestAnimationFrame(()=>requestAnimationFrame(()=>setAppear(true)));
    return ()=>cancelAnimationFrame(id);
  }, [sel]);

  // compute the image's contain-fit rect (design units) — shared by markers + zoom
  // Every plan sits RIGHT-of-centre (big left pad) so it balances the floating
  // library panel on the left — matches the approved Master-Plan layout reference.
  const PLAN_PAD = { L:600, R:80, Y:40 };
  const fitRect = () => {
    const { L:PADL, R:PADR, Y:PADY } = PLAN_PAD, CW=2560, CH=1600;
    const aw=CW-PADL-PADR, ah=CH-2*PADY, cAR=aw/ah;
    let rx=PADL,ry=PADY,rw=aw,rh=ah;
    if(imgAR){ if(imgAR>cAR){ rh=aw/imgAR; ry=PADY+(ah-rh)/2; rw=aw; rx=CW-PADR-rw; }
               else { rw=ah*imgAR; rx=CW-PADR-rw; rh=ah; ry=PADY; } }
    return { rx,ry,rw,rh, CW,CH };
  };

  // Per-plan vertical nudge for the marker highlights (box + numbered pointer),
  // measured in % of the fitted plan height. Positive = move DOWN. The MARKERS
  // were authored a touch high vs the artwork features, so we bring them down to
  // sit on the markings; ramp reads highest so it gets a bigger nudge. Tune per
  // plan here — geometry (fitRect) is verified pixel-exact, so this is the only
  // lever needed to land pins on features.
  const MK_DY_BY_PLAN = { 'ramp-ground': 4 };
  const mkDY = MK_DY_BY_PLAN[sel] != null ? MK_DY_BY_PLAN[sel] : 2;

  // NOTE: Master Plan Explorer is self-contained and does NOT link into the
  // Inventory flow — the 3D massing viewer is for exploring the massing only.

  // ── pan / zoom gesture handlers (mirrors inventory.jsx) ──
  const clampPan = (p, z) => {
    const el = boxRef.current; if(!el) return p; const r = el.getBoundingClientRect();
    const mx = Math.max(0, ((z-1)/2) * r.width), my = Math.max(0, ((z-1)/2) * r.height);
    return { x: Math.max(-mx, Math.min(mx, p.x)), y: Math.max(-my, Math.min(my, p.y)) };
  };
  const cl = (v,mn,mx)=>Math.max(mn,Math.min(mx,v));

  const onTouchStart = (e) => {
    if(isMassing) return;
    const tc = e.touches, el = boxRef.current, r = el?el.getBoundingClientRect():{left:0,top:0};
    if (tc.length===2){ const [a,b]=[tc[0],tc[1]]; g.current.mode='pinch'; g.current.active=true;
      g.current.startD=Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY)||1; g.current.startZoom=zoom;
      g.current.px=pan.x; g.current.py=pan.y; g.current.midX=(a.clientX+b.clientX)/2-r.left; g.current.midY=(a.clientY+b.clientY)/2-r.top;
    } else if (tc.length===1){ const now=performance.now(), p0=tc[0];
      if (now-g.current.lastTap<320 && Math.hypot(p0.clientX-g.current.ltx,p0.clientY-g.current.lty)<40){ setZoom(1); setPan({x:0,y:0}); g.current.lastTap=0; g.current.active=false; return; }
      g.current.lastTap=now; g.current.ltx=p0.clientX; g.current.lty=p0.clientY;
      if (zoom>1){ g.current.mode='pan'; g.current.active=true; g.current.sx=p0.clientX; g.current.sy=p0.clientY; g.current.px=pan.x; g.current.py=pan.y; }
      else { g.current.mode=null; g.current.active=false; }
    }
  };
  const onTouchMove = (e) => {
    if(!g.current.active) return; if(e.cancelable) e.preventDefault(); const tc=e.touches, el=boxRef.current, r=el?el.getBoundingClientRect():{left:0,top:0,width:1,height:1};
    if (g.current.mode==='pinch' && tc.length===2){ const [a,b]=[tc[0],tc[1]]; const nd=Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY)||1;
      const nz=cl(g.current.startZoom*(nd/g.current.startD),1,5); const cx=(a.clientX+b.clientX)/2-r.left, cy=(a.clientY+b.clientY)/2-r.top; const k=nz/g.current.startZoom;
      setZoom(nz); setPan(clampPan({x:(cx-g.current.midX)+g.current.px*k, y:(cy-g.current.midY)+g.current.py*k}, nz));
    } else if (g.current.mode==='pan' && tc.length===1){ const p0=tc[0]; setPan(clampPan({x:g.current.px+(p0.clientX-g.current.sx), y:g.current.py+(p0.clientY-g.current.sy)}, zoom)); }
  };
  const onTouchEnd = (e) => { if(e.touches.length===0){ g.current.active=false; g.current.mode=null; } };
  const onMouseDown = (e) => { if(isMassing||zoom<=1) return; g.current.mode='mouse'; g.current.active=true; g.current.sx=e.clientX; g.current.sy=e.clientY; g.current.px=pan.x; g.current.py=pan.y; };
  const onMouseMove = (e) => { if(!g.current.active||g.current.mode!=='mouse') return; setPan(clampPan({x:g.current.px+(e.clientX-g.current.sx), y:g.current.py+(e.clientY-g.current.sy)}, zoom)); };
  const endMouse = () => { if(g.current.mode==='mouse'){ g.current.active=false; g.current.mode=null; } };
  const onWheel = (e) => { if(isMassing) return; if(e.cancelable) e.preventDefault(); const el=boxRef.current, r=el?el.getBoundingClientRect():{left:0,top:0,width:1,height:1};
    const cx=e.clientX-r.left-r.width/2, cy=e.clientY-r.top-r.height/2; const nz=cl(zoom*(1+(e.deltaY>0?-0.12:0.12)),1,5); const k=nz/zoom;
    setZoom(nz); setPan(clampPan({x:cx-(cx-pan.x)*k, y:cy-(cy-pan.y)*k}, nz)); };

  React.useEffect(() => { const el=boxRef.current; if(!el) return; const tm=(e)=>onTouchMove(e), wh=(e)=>onWheel(e);
    el.addEventListener('touchmove',tm,{passive:false}); el.addEventListener('wheel',wh,{passive:false});
    return ()=>{ el.removeEventListener('touchmove',tm); el.removeEventListener('wheel',wh); }; }, [zoom, pan.x, pan.y, isMassing]);

  // ease toward a pin: zoom to ~2.1× centred on the pin (%→px on the box)
  const easeToPin = (p, i) => {
    setPinSel(s => s===i ? null : i);
    if (pinSel===i) return;          // toggling closed — leave transform
    const el = boxRef.current; if(!el) return; const r = el.getBoundingClientRect();
    const nz = 2.1;
    // world point (centre-origin) of the pin at zoom=1
    const wx = (p.x/100 - 0.5) * r.width;
    const wy = (p.y/100 - 0.5) * r.height;
    setZoom(nz);
    setPan(clampPan({ x:-wx*nz, y:-wy*nz }, nz));
  };

  // ── MARKER nav: tap a pointer → zoom into its zone (held upper-centre, so the
  //    centred info card sits below it) + open the card; collapse the library. ──
  const easeToMarker = (m, i) => {
    if (activeMk === i){ closeMarker(); return; }     // tapping the open one closes it
    // NB: the transform pans in DESIGN units (the 2560×1600 canvas is transform-scaled),
    // so all of this math must be in design units too — using screen px under-shoots the
    // centring whenever the kiosk renders the canvas at anything other than 1:1.
    const { rx,ry,rw,rh, CW,CH } = fitRect();
    const b = m.box;
    const mX = rx + (b.x + b.w/2)/100*rw, mY = ry + (b.y + b.h/2 + mkDY)/100*rh;   // marker centre (design px, incl. nudge)
    const wx = mX - CW/2, wy = mY - CH/2;                                   // centre-origin
    const wFrac = (b.w/100*rw)/CW, hFrac = (b.h/100*rh)/CH;
    const tfx = 0.5, tfy = 0.40;                                           // bring the zone to centre (card sits below)
    // start from a "fit the zone to ~62% of the view" zoom, then bump it up until
    // the target point can actually reach centre (a near-edge zone needs more pan
    // headroom — i.e. more zoom — before it can be panned to the middle).
    let nz = cl(0.62 / Math.max(wFrac, hFrac, 0.05), 1.9, 3.2);
    for (let it=0; it<10; it++){
      const px0=(tfx-0.5)*CW - wx*nz, py0=(tfy-0.5)*CH - wy*nz;
      const mX=((nz-1)/2)*CW, mY=((nz-1)/2)*CH;
      if ((Math.abs(px0)<=mX+0.5 && Math.abs(py0)<=mY+0.5) || nz>=3.2) break;
      nz = Math.min(3.2, nz+0.2);
    }
    const maxX = ((nz-1)/2)*CW, maxY = ((nz-1)/2)*CH;
    const px = cl((tfx-0.5)*CW - wx*nz, -maxX, maxX);
    const py = cl((tfy-0.5)*CH - wy*nz, -maxY, maxY);
    setZoom(nz); setPan({ x:px, y:py });
    setActiveMk(i); setPinSel(null); setPanelOpen(false);
  };
  const closeMarker = () => { setActiveMk(null); setZoom(1); setPan({x:0,y:0}); setPanelOpen(true); };

  const transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
  const moveT = g.current.active ? 'none' : 'transform 460ms cubic-bezier(0.22,1,0.36,1)';

  // Full-bleed backdrop — extends 800 design-px past the 2560×1600 canvas on every
  // side so on off-ratio devices (4:3 iPad etc.) it fills the letterbox instead of
  // showing the surround as top/bottom bands. The plan image / 3D iframe stay at
  // canvas bounds (framing & pin alignment unchanged) — ONLY the backdrop bleeds.
  // Mirrors the live-map screen; the frame clips the overflow.
  const bleedBg = isMassing
    // massing paints its continuous backdrop at the VIEWPORT level (index.html),
    // through the transparent bezel → no separate bleed here (would re-introduce a
    // seam at the canvas edge). Keep transparent so the frame radial shows through.
    ? 'transparent'
    : (markers.length
        ? 'radial-gradient(1600px 1050px at 52% 46%, #f5eee6, #e9e1d4 82%)'
        : 'radial-gradient(1400px 900px at 50% 44%, #faf7f0, #e3dccd 78%)');

  return (
    <div style={{ position:'absolute', inset:0, background:'transparent', overflow:'visible',
      fontFamily:"'Inter',system-ui,sans-serif", color:'var(--ink)' }}>

      {/* full-bleed backdrop — fills the letterbox on off-ratio devices (no bars) */}
      <div style={{ position:'absolute', top:-800, right:-800, bottom:-800, left:-800,
        zIndex:0, background: bleedBg, transition:'background 360ms ease' }}/>

      {/* ════════ FULL-SCREEN PLAN CANVAS (edge to edge) ════════ */}
      {!isMassing && selPlan && (
        <div ref={boxRef}
          onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onTouchCancel={onTouchEnd}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={endMouse} onMouseLeave={endMouse}
          onClick={(e)=>{ if(e.target===e.currentTarget) setPinSel(null); }}
          style={{ position:'absolute', inset:0, overflow:'hidden', touchAction:'none',
            background:'transparent',   // the full-bleed backdrop layer behind shows through
            cursor: zoom>1 ? (g.current.mode==='mouse'?'grabbing':'grab') : 'default' }}>

          <div key={selPlan.id} style={{ position:'absolute', inset:0, transform, transformOrigin:'center',
            transition:moveT, willChange:'transform', animation:'mpxImg 460ms ease both' }}>
            <img src={selPlan.img} alt={selPlan.title} draggable="false"
              onLoad={(e)=>setImgAR(e.target.naturalWidth/Math.max(1,e.target.naturalHeight))}
              onClick={(e)=>{ if(e.target===e.currentTarget) setPinSel(null); }}
              style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain', display:'block',
                userSelect:'none', pointerEvents:'none',
                // all plans pushed right-of-centre to clear the library panel & balance the screen
                padding:'40px 80px 40px 600px', objectPosition:'right center',
                filter: markers.length ? 'none' : 'drop-shadow(0 20px 50px rgba(60,44,18,0.16))' }}/>

            {/* ── ANIMATED CIRCULATION ARROWS — colour-extracted overlay that pulses/glows ── */}
            {CIRC[sel] && (
              <img src={CIRC[sel].arrows} alt="" draggable="false"
                style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain', objectPosition:'right center',
                  display:'block', padding:'40px 80px 40px 600px', pointerEvents:'none', userSelect:'none', zIndex:3,
                  filter:`drop-shadow(0 0 4px ${CIRC[sel].glow}) drop-shadow(0 0 11px ${CIRC[sel].glow})`,
                  animation:'circPulse 1.7s ease-in-out infinite' }}/>
            )}

            {/* ── INTERACTIVE PINS ── anchored to the image's ACTUAL contain-fit rect
                 (so pins land exactly on plan features regardless of plan aspect ratio) */}
            {(()=>{ const { rx,ry,rw,rh } = fitRect();
              return (
              <div style={{ position:'absolute', left:rx, top:ry, width:rw, height:rh, pointerEvents:'none' }}>
                {/* ── INTERACTIVE MARKERS — glow on each highlighted zone + numbered pointer ── */}
                {markers.map((m, i)=>{
                  const c = MK_COLOR[m.color] || MK_COLOR.red;
                  const on = activeMk===i;
                  const cx = m.box.x + m.box.w/2, cy = m.box.y + m.box.h/2 + mkDY;
                  const k  = 1/zoom;   // counter-scale so the pointer keeps screen size
                  return (
                  <React.Fragment key={'mk'+i}>
                    {/* glowing highlight box */}
                    <div style={{ position:'absolute', left:m.box.x+'%', top:(m.box.y+mkDY)+'%', width:m.box.w+'%', height:m.box.h+'%',
                      borderRadius:5, border:'1.5px solid', color:c.line, pointerEvents:'none', zIndex:on?5:4,
                      opacity:appear?(on?1:0.92):0, transition:'opacity .3s',
                      animation:`mkGlow 1.9s ease-in-out ${i*0.2}s infinite` }}>
                      <div style={{ position:'absolute', inset:0, borderRadius:4, background:c.fill,
                        animation:`mpxGlowCore 1.9s ease-in-out ${i*0.2}s infinite` }}/>
                    </div>
                    {/* numbered pointer */}
                    <div className="mpx-pin" onClick={(e)=>{ e.stopPropagation(); easeToMarker(m, i); }}
                      style={{ position:'absolute', left:cx+'%', top:cy+'%',
                        transform:`translate(-50%,-50%) scale(${k})`, transformOrigin:'center',
                        pointerEvents:'auto', cursor:'pointer', zIndex:on?9:7,
                        opacity:appear?1:0,
                        animation:appear?`mpxPinIn 460ms cubic-bezier(0.22,1,0.36,1) ${i*60}ms both`:'none' }}>
                      <span style={{ position:'absolute', left:'50%', top:'50%', width:48, height:48, marginLeft:-24, marginTop:-24,
                        borderRadius:'50%', border:`2px solid ${c.pin}`, animation:'mpxPulse 2.4s ease-out infinite', pointerEvents:'none' }}/>
                      <span style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center',
                        width:on?44:38, height:on?44:38, borderRadius:'50%',
                        background:`radial-gradient(circle at 38% 30%, #fff8ee, ${c.pin})`,
                        border:'2px solid #fff8ec',
                        boxShadow:`0 0 0 3px ${c.ring}, 0 8px 20px rgba(40,30,12,0.4), 0 0 18px 2px ${c.glow}`,
                        transition:'all .18s' }}>
                        <span className="mono" style={{ fontSize:on?18:16, fontWeight:800, color:'#fff', textShadow:'0 1px 2px rgba(0,0,0,0.4)' }}>{m.num}</span>
                      </span>
                    </div>
                  </React.Fragment>);
                })}
                {pins.map((p, i)=>{
                  const col = MPX_KIND[p.kind] || 'var(--gold)';
                  const on  = pinSel===i;
                  const k   = 1/zoom;   // counter-scale so pins keep screen size
                  return (
                    <div key={i} className="mpx-pin"
                      onClick={(e)=>{ e.stopPropagation(); easeToPin(p, i); }}
                      style={{ position:'absolute', left:p.x+'%', top:p.y+'%',
                        transform:`translate(-50%,-50%) scale(${k})`, transformOrigin:'center',
                        pointerEvents:'auto', cursor:'pointer', zIndex:on?6:5,
                        opacity:appear?1:0,
                        animation:appear?`mpxPinIn 460ms cubic-bezier(0.22,1,0.36,1) ${i*40}ms both`:'none' }}>
                      {/* pulse ring */}
                      <span style={{ position:'absolute', left:'50%', top:'50%', width:46, height:46, marginLeft:-23, marginTop:-23,
                        borderRadius:'50%', border:`2px solid ${col}`,
                        animation:'mpxPulse 2.4s ease-out infinite', pointerEvents:'none' }}/>
                      {/* gold disc */}
                      <span style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center',
                        width:on?52:46, height:on?52:46, borderRadius:'50%',
                        background:'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)',
                        border:`2px solid ${on?'#fff8e0':'rgba(255,250,235,0.85)'}`,
                        boxShadow:on?`0 0 0 4px ${col}55, 0 10px 26px rgba(40,30,12,0.4)`:'0 8px 20px rgba(40,30,12,0.34)',
                        color:'#1a130a', transition:'all .18s' }}>
                        {p.kind==='tower'
                          ? <span className="display" style={{ fontSize:on?24:21, fontWeight:700, color:'#1a130a', lineHeight:1 }}>{p.tower}</span>
                          : <svg viewBox="0 0 24 24" width={on?26:23} height={on?26:23} fill="none" stroke="#1a130a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={MPX_PIN_GLYPH[p.kind]||MPX_PIN_GLYPH.context}/></svg>}
                      </span>

                      {/* ── POPOVER ── anchored above the pin */}
                      {on && (
                        <div onClick={(e)=>e.stopPropagation()} style={{ position:'absolute', left:'50%', bottom:'calc(100% + 16px)',
                          transform:'translateX(-50%)', width:380, zIndex:9, cursor:'default',
                          ...MPX_GLASS, borderRadius:20, padding:'20px 22px 18px',
                          animation:'mpxPop 240ms cubic-bezier(0.22,1,0.36,1) both' }}>
                          <button onClick={(e)=>{ e.stopPropagation(); setPinSel(null); }} aria-label="Close"
                            style={{ position:'absolute', top:13, right:13, width:30, height:30, borderRadius:'50%', cursor:'pointer',
                              background:'rgba(255,255,255,0.6)', border:'1px solid rgba(176,138,63,0.32)', color:'var(--gold-deep)', fontSize:14, lineHeight:1 }}>✕</button>
                          <div style={{ display:'flex', alignItems:'center', gap:13, marginBottom:12, paddingRight:30 }}>
                            <span style={{ width:42, height:42, borderRadius:12, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                              border:`1px solid ${col}`, background:`${col}1f`, color:col }}>
                              {p.kind==='tower'
                                ? <span className="display" style={{ fontSize:20, fontWeight:700, color:col }}>{p.tower}</span>
                                : <svg viewBox="0 0 24 24" width={23} height={23} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={MPX_PIN_GLYPH[p.kind]||MPX_PIN_GLYPH.context}/></svg>}
                            </span>
                            <div style={{ minWidth:0 }}>
                              <div className="serif" style={{ fontSize:23, fontWeight:500, color:'var(--ink)', lineHeight:1.1 }}>{p.label}</div>
                              <div className="mono" style={{ fontSize:11, letterSpacing:'0.16em', color:'var(--gold-deep)', marginTop:4, fontWeight:600 }}>{(p.sub||'').toUpperCase()}</div>
                            </div>
                          </div>
                          <div style={{ height:1, background:'rgba(176,138,63,0.2)', margin:'0 0 12px' }}/>
                          {(p.detail||[]).map((d,j)=>(
                            <div key={j} style={{ display:'flex', gap:10, marginBottom:8 }}>
                              <span style={{ marginTop:8, width:5, height:5, borderRadius:'50%', background:col, flexShrink:0 }}/>
                              <span style={{ fontSize:15, lineHeight:1.42, color:'var(--graphite)' }}>{d}</span>
                            </div>
                          ))}
                          {/* caret */}
                          <span style={{ position:'absolute', left:'50%', top:'100%', width:16, height:16, marginLeft:-8, marginTop:-8,
                            background:'rgba(248,244,236,0.78)', borderRight:'1px solid rgba(201,160,94,0.42)', borderBottom:'1px solid rgba(201,160,94,0.42)',
                            transform:'rotate(45deg)' }}/>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ); })()}
          </div>
        </div>
      )}

      {/* ════════ BLOCK MASSING — live 3D viewer ════════ */}
      {/* Iframe stays at canvas bounds so the camera framing (tuned for 16:10) is
          preserved on every device. The transparent scene lets the full-bleed
          backdrop behind it fill the letterbox — no top/bottom bars. */}
      {isMassing && (
        <div key="massing" style={{ position:'absolute', inset:0, zIndex:1,
          background:'transparent', animation:'mpxImg 460ms ease both' }}>
          <iframe ref={massingFrameRef} title="Block Massing 3D" src="assets/masterplan/massing3d/index.html?panel=1&v=4"
            onLoad={()=>postMassingOffset()}
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:'none', background:'transparent' }}/>
        </div>
      )}

      {/* ════════ CENTRED MARKER INFO CARD — appears when a pointer is tapped ════════ */}
      {activeMk!=null && markers[activeMk] && (()=>{ const m=markers[activeMk]; const c=MK_COLOR[m.color]||MK_COLOR.red;
        return (
        <React.Fragment>
          {/* dim backdrop (tap to close) */}
          <div onClick={closeMarker} style={{ position:'absolute', inset:0, zIndex:30,
            background:'radial-gradient(1300px 900px at 50% 30%, rgba(20,14,4,0.10), rgba(20,14,4,0.40))',
            animation:'mpxImg 320ms ease both' }}/>
          {/* floating card, centred */}
          <div style={{ position:'absolute', left:'50%', top:'61%', zIndex:32, width:640,
            ...MPX_GLASS, borderRadius:26, padding:'30px 34px 28px',
            transform:'translate(-50%,-50%)', animation:'mkCardIn 340ms cubic-bezier(0.22,1,0.36,1) both' }}>
            <button onClick={closeMarker} aria-label="Close"
              style={{ position:'absolute', top:18, right:18, width:38, height:38, borderRadius:'50%', cursor:'pointer',
                background:'rgba(255,255,255,0.65)', border:'1px solid rgba(176,138,63,0.32)', color:'var(--gold-deep)', fontSize:16, lineHeight:1 }}>✕</button>
            <div style={{ display:'flex', alignItems:'center', gap:18, marginBottom:16, paddingRight:38 }}>
              {/* numbered colour badge */}
              <span style={{ width:58, height:58, borderRadius:16, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                background:`radial-gradient(circle at 38% 30%, #fff8ee, ${c.pin})`, border:'2px solid #fff8ec',
                boxShadow:`0 0 0 4px ${c.ring}, 0 0 22px 2px ${c.glow}` }}>
                <span className="mono" style={{ fontSize:24, fontWeight:800, color:'#fff', textShadow:'0 1px 2px rgba(0,0,0,0.4)' }}>{m.num}</span>
              </span>
              <div style={{ minWidth:0 }}>
                <div className="mono" style={{ fontSize:11.5, letterSpacing:'0.22em', fontWeight:700, color:c.pin, marginBottom:5 }}>{(m.sub||'').toUpperCase()}</div>
                <div className="serif" style={{ fontSize:34, fontWeight:500, color:'var(--ink)', lineHeight:1.05 }}>{m.title}</div>
              </div>
            </div>
            <div style={{ height:1, background:'rgba(176,138,63,0.22)', margin:'0 0 16px' }}/>
            {(m.detail||[]).map((d,j)=>(
              <div key={j} style={{ display:'flex', gap:13, marginBottom:11 }}>
                <span style={{ marginTop:9, width:7, height:7, borderRadius:'50%', background:c.pin, flexShrink:0, boxShadow:`0 0 8px ${c.glow}` }}/>
                <span style={{ fontSize:17, lineHeight:1.46, color:'var(--graphite)' }}>{d}</span>
              </div>
            ))}
            <div style={{ marginTop:18, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span className="mono" style={{ fontSize:11, letterSpacing:'0.16em', color:'var(--slate)' }}>
                {(activeMk+1)} / {markers.length} · ZONE</span>
              <button onClick={closeMarker} className="mono" style={{ padding:'11px 22px', borderRadius:100, cursor:'pointer',
                fontSize:12, letterSpacing:'0.14em', fontWeight:700, color:'#1a130a',
                background:'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)', border:'none' }}>CLOSE ✕</button>
            </div>
          </div>
        </React.Fragment>); })()}

      {/* soft top scrim so the floating bar reads over busy plans */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:230, zIndex:14, pointerEvents:'none',
        background:'linear-gradient(180deg, rgba(244,239,230,0.72), transparent)' }}/>

      {/* ════════ SHARED HEADER — identical to every other screen (no glass field) ════════ */}
      <ScreenHeader title="Master Plan Explorer" subtitle="Browse plan overlays — circulation · retail · parking · zoning" idx="04"/>

      {/* ════════ FLOATING LEFT LIBRARY PANEL (collapsible) ════════ */}
      <div style={{ position:'absolute', top:250, bottom:44, left:72, zIndex:24,
        display:'flex', alignItems:'stretch', pointerEvents:'none',
        transform: panelOpen ? 'translateX(0)' : 'translateX(-676px)',
        transition:'transform 460ms cubic-bezier(0.22,1,0.36,1)' }}>

        <div style={{ width:620, display:'flex', flexDirection:'column', borderRadius:26, overflow:'hidden', pointerEvents:'auto',
          ...MPX_GLASS, animation:'mpxFade 420ms ease both' }}>

          {/* search + filter */}
          <div style={{ padding:'26px 26px 16px', display:'flex', gap:13 }}>
            <div style={{ flex:1, display:'flex', alignItems:'center', gap:13, padding:'0 20px', height:66, borderRadius:16,
              background:'rgba(255,255,255,0.72)', border:'1px solid rgba(176,138,63,0.28)' }}>
              <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="var(--slate)" strokeWidth="1.7" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20 L16.2 16.2"/></svg>
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search plans…"
                style={{ flex:1, border:'none', outline:'none', background:'transparent', fontSize:21, color:'var(--ink)', fontFamily:'inherit' }}/>
            </div>
            <button aria-label="Filter" style={{ width:66, height:66, borderRadius:16, flexShrink:0, cursor:'pointer',
              background:'rgba(255,255,255,0.72)', border:'1px solid rgba(176,138,63,0.28)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--gold-deep)' }}>
              <svg viewBox="0 0 24 24" width={26} height={26} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5 H21 M6 12 H18 M10 19 H14"/></svg>
            </button>
          </div>

          {/* filter chips */}
          <div style={{ padding:'0 26px 18px', display:'flex', flexWrap:'wrap', gap:9 }}>
            {MPX_FILTERS.map(f=>{ const on=filter===f;
              return <button key={f} onClick={()=>setFilter(f)} className="mono" style={{ padding:'11px 18px', borderRadius:100, cursor:'pointer', fontSize:17, letterSpacing:'0.08em', fontWeight:on?700:600,
                border: on?'1px solid transparent':'1px solid rgba(176,138,63,0.3)',
                background:on?'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)':'rgba(255,255,255,0.6)',
                color:on?'#1a130a':'var(--graphite)', transition:'all .18s' }}>{f}</button>;
            })}
          </div>

          {/* library label + count */}
          <div style={{ padding:'2px 28px 14px', display:'flex', alignItems:'baseline', justifyContent:'space-between',
            borderBottom:'1px solid rgba(176,138,63,0.2)' }}>
            <span className="mono" style={{ fontSize:18, letterSpacing:'0.28em', color:'var(--gold-deep)', fontWeight:700 }}>PLAN LIBRARY</span>
            <span className="mono" style={{ fontSize:18, letterSpacing:'0.18em', color:'var(--slate)' }}>{filtered.length} PLANS</span>
          </div>

          {/* scrollable plan list — fields styled like the home nav tiles
              (dark-beige --tile surface, cream --on-tile text/icons, gold hairline,
              soft shadow). Bigger tap targets + floor-compliant type. */}
          <div className="mpx-scroll" style={{ flex:1, overflowY:'auto', padding:'16px 18px' }}>
            {filtered.map(p=>{ const on=sel===p.id;
              return (
                <button key={p.id} onClick={()=>setSel(p.id)} className="mpx-galcard" style={{ width:'100%', textAlign:'left', cursor:'pointer',
                  display:'flex', alignItems:'center', gap:20, padding:'20px 22px', marginBottom:14, borderRadius:20, position:'relative',
                  background: on
                    ? 'linear-gradient(155deg, var(--tile-light) 0%, var(--tile) 60%, var(--tile-deep) 100%)'
                    : 'linear-gradient(155deg, var(--tile) 0%, var(--tile-deep) 100%)',
                  border: '1px solid '+(on ? 'var(--gold-soft)' : 'rgba(255,246,224,0.18)'),
                  boxShadow: on
                    ? '0 24px 48px rgba(50,32,12,0.34), 0 10px 22px rgba(50,32,12,0.20), 0 0 0 3px rgba(232,215,168,0.22), inset 0 1px 0 rgba(255,246,224,0.22), inset 0 -22px 40px rgba(50,32,12,0.30)'
                    : '0 16px 30px rgba(50,32,12,0.20), 0 6px 14px rgba(50,32,12,0.14), inset 0 1px 0 rgba(255,246,224,0.16), inset 0 -22px 40px rgba(50,32,12,0.26)' }}>
                  <span style={{ width:64, height:64, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                    background: on?'rgba(255,246,224,0.18)':'rgba(255,246,224,0.10)',
                    border:'1px solid rgba(255,246,224,0.28)', color:'var(--on-tile)' }}>
                    <MpxGlyph type={p.icon} size={32}/>
                  </span>
                  <span style={{ flex:1, minWidth:0 }}>
                    <span className="serif" style={{ display:'block', fontSize:27, fontWeight:600, color:'var(--on-tile)', lineHeight:1.18,
                      whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.title}</span>
                    <span style={{ display:'flex', flexWrap:'wrap', gap:'5px 14px', marginTop:8 }}>
                      {p.tags.map(tag=>(
                        <span key={tag} className="mono" style={{ fontSize:17, letterSpacing:'0.16em', color:'rgba(250,246,232,0.66)', fontWeight:600 }}>{tag}</span>
                      ))}
                    </span>
                  </span>
                  {on
                    ? <span style={{ width:46, height:46, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                        background:'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)', color:'#1a130a', boxShadow:'0 4px 12px rgba(20,14,4,0.4)' }}>
                        <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6 L15 12 L9 18"/></svg>
                      </span>
                    : <span style={{ flexShrink:0, color:'rgba(250,246,232,0.5)', fontSize:30, lineHeight:1, marginRight:4 }}>›</span>}
                </button>
              );
            })}
            {filtered.length===0 && (
              <div style={{ padding:'48px 18px', textAlign:'center', color:'var(--slate)', fontSize:20 }}>No plans match your search.</div>
            )}
          </div>

          {/* footer */}
          <div style={{ padding:'16px 28px', borderTop:'1px solid rgba(176,138,63,0.2)', background:'rgba(255,255,255,0.32)' }}>
            <span className="mono" style={{ fontSize:17, letterSpacing:'0.14em', color:'var(--slate)' }}>
              {isMassing ? 'Drag to orbit · tap a tower in 3D' : markers.length ? `Tap any of the ${markers.length} glowing points to explore · pinch / scroll to zoom` : 'Pinch / scroll to zoom the plan'}</span>
          </div>
        </div>

        {/* collapse handle (chevron) — clings to the panel edge, always visible */}
        <button onClick={()=>setPanelOpen(o=>!o)} aria-label={panelOpen?'Collapse panel':'Expand panel'}
          style={{ alignSelf:'center', marginLeft:-1, width:46, height:104, cursor:'pointer', pointerEvents:'auto', flexShrink:0,
            borderRadius:'0 16px 16px 0', border:'1px solid rgba(201,160,94,0.42)', borderLeft:'none',
            background:'rgba(248,244,236,0.92)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
            boxShadow:'8px 0 22px rgba(40,30,12,0.14)', display:'flex', alignItems:'center', justifyContent:'center',
            color:'var(--gold-deep)' }}>
          <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: panelOpen?'rotate(0deg)':'rotate(180deg)', transition:'transform .4s' }}><path d="M15 6 L9 12 L15 18"/></svg>
        </button>
      </div>

      {/* ════════ ZOOM CONTROLS (hidden in 3D mode — viewer has its own) ════════ */}
      {!isMassing && (
        <div style={{ position:'absolute', bottom:44, right:48, display:'flex', flexDirection:'column', gap:9, zIndex:22 }}>
          {[['plus',()=>{ setZoom(z=>cl(z+0.4,1,5)); }],
            ['minus',()=>{ const nz=cl(zoom-0.4,1,5); setZoom(nz); setPan(p=>clampPan(p,nz)); }]].map(([ic,fn])=>(
            <button key={ic} onClick={fn} style={{ width:54, height:54, borderRadius:'50%', ...MPX_GLASS_SOLID, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', color:'var(--gold-deep)' }}>
              {ic==='plus'?<Icons.plus width={22} height={22}/>:<Icons.minus width={22} height={22}/>}
            </button>
          ))}
          <button onClick={()=>{ setZoom(1); setPan({x:0,y:0}); setPinSel(null); setActiveMk(null); }} className="mono"
            style={{ ...MPX_GLASS_SOLID, borderRadius:27, padding:'12px 0', width:54, fontSize:10.5, letterSpacing:'0.12em', cursor:'pointer', color:'var(--gold-deep)', fontWeight:700 }}>RESET</button>
        </div>
      )}

      {/* ════════ SELECTED-PLAN CAPTION (bottom-centre, floating) ════════ */}
      {selPlan && (
        <div key={'cap'+selPlan.id} style={{ position:'absolute', bottom:44, left:'50%', transform:'translateX(-50%)', zIndex:18,
          display:'flex', alignItems:'center', gap:14, padding:'14px 24px', borderRadius:100, ...MPX_GLASS_SOLID,
          animation:'mpxPop 380ms cubic-bezier(0.22,1,0.36,1) both' }}>
          <span style={{ width:40, height:40, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
            background:'rgba(243,240,230,0.9)', border:'1px solid rgba(176,138,63,0.34)', color:'var(--gold-deep)' }}>
            <MpxGlyph type={selPlan.icon} size={20}/>
          </span>
          <div className="serif" style={{ fontSize:26, fontWeight:500, color:'var(--ink)', lineHeight:1.05 }}>{selPlan.title}</div>
          <span style={{ width:1, height:24, background:'rgba(176,138,63,0.3)' }}/>
          <div style={{ display:'flex', gap:14 }}>
            {selPlan.tags.map(tag=>(
              <span key={tag} className="mono" style={{ fontSize:17, letterSpacing:'0.16em', color:'var(--slate)', fontWeight:600 }}>{tag}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

window.PlanExplorerScreen = PlanExplorerScreen;
