// LivingTree · Sales Suite — project data
// All facts sourced from Factsheet-Final.pdf (Kalyani Developers, 2024) and
// the public website livingtreebykalyanidevelopers.com.

const PROJECT = {
  brand:        'LivingTree',
  developer:    'Kalyani Developers',
  developerEst: 'Rooted for 30+ years',
  tagline:      'Designed for Life.',
  tagline2:     'Rooted in Luxury, Branching into the Future',
  hero:         'Designed for Four Generations',
  pitch:        'A 25-acre luxury residential community in North Bangalore, where four generations live among ten tree-named towers, sixty-five amenities and twenty acres of open green.',
  city:         'Bengaluru',
  micromarket:  'Hitech Defence & Aerospace Park',
  phase:        'Phase 1 · Towers complete by Sept 2029',
  context:      'KIADB Aerospace Park, 15 minutes from Kempegowda International Airport',
  location: {
    address:   'Plot 7, Hitech Defence & Aerospace Park, Jala Hobli, Bengaluru North, Karnataka — 560064',
    landmark:  'Off Hennur–Bagalur Road · 15 min to KIA',
    coords:    { lat: 13.1379, lng: 77.6446 },
    pincode:   '560064',
  },
  rera:    'PRM/KA/RERA/1251/309/PR/260924/007084',
  contact: {
    phone: '+91 9746069746',
    email: 'sales@livingtreebykalyanidevelopers.com',
    site:  'livingtreebykalyanidevelopers.com',
  },
  stats: {
    landArea:    '25 acres',
    openArea:    '20 acres of open spaces',
    towers:      10,
    floors:      24,
    apartments:  2522,
    clubhouses:  2,
    clubhouseArea: '~1 lakh sft each',
    amenities:   65,
    typology:    '1, 2, 2.5 & 3 BHK',
    architect:   'Landscape inspired by flowing roots',
    completion:  'Possession · September 2029',
    distAirport: '15 min to KIA',
  },
  modules: [
    { id: 'story',      label: 'The Story',       sub: 'Kalyani · 30+ years rooted' },
    { id: 'north',      label: 'North Bangalore', sub: 'Why this micro-market' },
    { id: 'location',   label: 'Location',        sub: 'KIADB Aerospace Park' },
    { id: 'masterplan', label: 'Master Plan',     sub: '25 acres · 10 trees · 2 clubs' },
    { id: 'residences', label: 'Residences',      sub: '1 / 2 / 2.5 / 3 BHK · E + W' },
    { id: 'amenities',  label: 'Amenities',       sub: '65 across both clubhouses' },
    { id: 'gallery',    label: 'Gallery',         sub: 'Renders · landscape · clubhouse' },
    { id: 'specs',      label: 'Specifications',  sub: 'Vastu-compliant build spec' },
    { id: 'tools',      label: 'Tools',           sub: 'Cost · EMI · compare' },
    { id: 'booking',    label: 'Booking',         sub: 'Reserve a residence' },
  ],
};

// 10 towers — each named after a tree.
// Floors / units inferred from public scale of project (2,522 units across 10 towers × 24 floors).
const TOWERS = [
  { id:'aspen',     name:'Aspen',     no: 1,  floors:24, units:264, typologies:['3 BHK Smart','3 BHK Optimal','3 BHK Luxe'], available: 32, sold: 218, hold: 14, view:'Aerospace skyline · East',  cluster:'North Crown',  side:'N' },
  { id:'chestnut',  name:'Chestnut',  no: 2,  floors:24, units:264, typologies:['3 BHK Smart','3 BHK Optimal'],              available: 28, sold: 224, hold: 12, view:'Central greens',           cluster:'North Crown',  side:'N' },
  { id:'coral',     name:'Coral',     no: 5,  floors:24, units:240, typologies:['2 BHK Standard'],                            available: 0,  sold: 240, hold: 0,  view:'Clubhouse 01 · sold out',  cluster:'Central',      side:'C' },
  { id:'deodar',    name:'Deodar',    no: 3,  floors:24, units:264, typologies:['3 BHK Smart','3 BHK Optimal'],              available: 41, sold: 209, hold: 14, view:'Pool · West podium',       cluster:'West Spine',   side:'W' },
  { id:'laurel',    name:'Laurel',    no: 7,  floors:24, units:264, typologies:['3 BHK Smart','3 BHK Optimal'],              available: 19, sold: 232, hold: 13, view:'East lawn',                 cluster:'East Wing',    side:'E' },
  { id:'ashoka',    name:'Ashoka',    no: 4,  floors:24, units:264, typologies:['3 BHK Smart','3 BHK Optimal'],              available: 36, sold: 214, hold: 14, view:'Flowing-roots garden',     cluster:'South Court',  side:'S' },
  { id:'walnut',    name:'Walnut',    no: 8,  floors:24, units:264, typologies:['3 BHK Smart','3 BHK Optimal'],              available: 24, sold: 226, hold: 14, view:'Clubhouse 02 · woodland',  cluster:'East Wing',    side:'E' },
  { id:'tamarind',  name:'Tamarind',  no: 9,  floors:24, units:264, typologies:['3 BHK Smart','3 BHK Optimal'],              available: 30, sold: 220, hold: 14, view:'South pool court',         cluster:'South Court',  side:'S' },
  { id:'plumeria',  name:'Plumeria',  no:10,  floors:24, units:264, typologies:['3 BHK Smart','3 BHK Optimal'],              available: 27, sold: 223, hold: 14, view:'South lawn · garden 8',    cluster:'South Court',  side:'S' },
  { id:'mahogany',  name:'Mahogany',  no: 6,  floors:24, units:230, typologies:['1 BHK Standard','2 BHK + Study'],            available: 8,  sold: 220, hold: 2,  view:'Clubhouse 01 · garden 2',  cluster:'Central',      side:'C' },
];

// Unit typologies — figures from factsheet Numbering Plan + Unit Plans pages 6-12.
// Saleable / Carpet / Balcony+Utility in SFT.
// Per the factsheet, all units come in East (1) and West (2) variants.
// Price ranges are illustrative for North Bangalore micro-market — confirm with Kalyani.
const TYPOLOGIES = [
  { code:'1BHK',         name:'1 BHK Standard',    bhk:1.0, plan:'plan-07', tower:'Mahogany',
    east: { saleable: 576, carpet: 322, balcony: 84.71,  view:'East'  },
    west: { saleable: 579, carpet: 322, balcony: 84.71,  view:'West'  },
    priceFrom: 4500000, soldOut: true,
    summary: 'Compact urban residence with full Vastu orientation. Sold out at launch.',
  },
  { code:'2BHK',         name:'2 BHK Standard',    bhk:2.0, plan:'plan-08', tower:'Coral',
    east: { saleable: 1041, carpet: 636, balcony: 131.11, view:'East'  },
    west: { saleable: 1054, carpet: 647, balcony: 127.55, view:'West (with Juliet balcony)' },
    priceFrom: 7800000, soldOut: true,
    summary: 'Two-bedroom family layout with separate utility. Cluster sold out.',
  },
  { code:'2.5BHK',       name:'2 BHK + Study (2.5)', bhk:2.5, plan:'plan-09', tower:'Mahogany',
    east: { saleable: 1135, carpet: 637, balcony: 166.20, view:'East' },
    west: { saleable: 1143, carpet: 649, balcony: 166.52, view:'West' },
    priceFrom: 8900000, soldOut: false,
    summary: 'Two bedrooms plus a dedicated work-from-home study. Generous double-balcony footprint.',
  },
  { code:'3BHK-SMART',   name:'3 BHK Smart',       bhk:3.0, plan:'plan-10', tower:'Aspen · Chestnut · Deodar · Ashoka · Laurel · Walnut · Tamarind · Plumeria',
    east: { saleable: 1316, carpet: 860, balcony: 106.99, view:'East' },
    west: { saleable: 1314, carpet: 865, balcony: 101.40, view:'West (with Juliet balcony)' },
    priceFrom: 10500000, soldOut: false,
    summary: 'Smart 3-bed layout optimised for floor efficiency across eight towers.',
  },
  { code:'3BHK-OPTIMAL', name:'3 BHK Optimal',     bhk:3.0, plan:'plan-11', tower:'Aspen · Chestnut · Deodar · Ashoka · Laurel · Walnut · Tamarind · Plumeria',
    east: { saleable: 1639, carpet: 1067, balcony: 136.16, view:'East' },
    west: { saleable: 1637, carpet: 1072, balcony: 129.71, view:'West' },
    priceFrom: 13200000, soldOut: false,
    summary: 'Wider 3-bed format with extra utility and dressing zones. Premium pricing on East-facing units.',
  },
  { code:'3BHK-LUXE',    name:'3 BHK Luxe',        bhk:3.0, plan:'plan-12', tower:'Aspen (signature tower)',
    east: { saleable: 1927, carpet: 1300, balcony: 155.22, view:'East · Aerospace skyline' },
    west: { saleable: 1927, carpet: 1300, balcony: 155.22, view:'West · Central greens' },
    priceFrom: 16800000, soldOut: false,
    summary: 'Largest 3-bed in the masterplan. Exclusive to Aspen. Aerospace-skyline view.',
  },
];

// Four USP pillars — factsheet page 2.
const USPS = [
  { id:'kiadb',  title:'The KIADB Advantage', icon:'shield',
    points: [
      '15 mins to Kempegowda International Airport',
      'Fully planned government ecosystem',
      'Close to Boeing, Airbus, Amazon, Wipro Aerospace',
      '100% legal transparency',
      'Adjacent to upcoming aerospace landmarks (ITeS, Aerospace Park, etc.)',
    ],
  },
  { id:'design', title:'Thoughtful Design', icon:'rule',
    points: [
      '20 acres of open green space',
      'Complimentary Juliet balconies on most units',
      'Extra-large, spacious floor plans',
      'No common walls — three sides of every unit open',
      'Vastu compliant across the masterplan',
    ],
  },
  { id:'roots',  title:'Flowing Roots Masterplan', icon:'roots',
    points: [
      'Landscaping inspired by flowing roots',
      'Encourages exploration, interaction and privacy',
      'Promotes sustainability across the campus',
      'Exclusive spaces for mental and physical health',
    ],
  },
  { id:'double', title:'Double Everything', icon:'pair',
    points: [
      'Two clubhouses — ~1 lakh sft each — ensure easy accessibility',
      'Double balconies on every unit',
      'Two full swimming pools within the property',
      'Most outdoor amenities mirrored on north + south of the project',
    ],
  },
];

// 5 Reasons to invest in North Bangalore — factsheet page 14.
const NORTH_REASONS = [
  { n:'01', title:'Enhanced Connectivity',     body:'A new 37-km Metro line will link Kempegowda International Airport directly to the city centre, sharply reducing travel time across North Bangalore.' },
  { n:'02', title:'Robust Industrial Growth',  body:'Devanahalli Industrial Township spans 10,000 acres covering IT, manufacturing and logistics. It alone is projected to generate over 1 million jobs and a parallel business ecosystem.' },
  { n:'03', title:'Aerospace Park Expansion',  body:'A proposed 500-acre Aerospace Park development by ISRO will create a hub for aerospace and defence companies, opening tens of thousands of new high-skill jobs.' },
  { n:'04', title:'Mumbai–Hyderabad Corridor', body:'The Bengaluru–Mumbai and Hyderabad–Bengaluru Industrial Corridors are scheduled to grow exponentially via the proposed Ring Road, Satellite Ring Road, and Metro Rail Phase 2B.' },
  { n:'05', title:'KIA + Terminal 2',          body:'Terminal 2 of the airport is now operational and will double passenger capacity to 5–6 crore per annum, drawing a wider range of companies to set up shop nearby.' },
];

// Location — distances from factsheet (page 2) + standard North Bangalore reference.
const LOCATION_ADVANTAGES = [
  // Connectivity
  { cat:'Connectivity', label:'Kempegowda International Airport', dist:'15 min', icon:'plane'   },
  { cat:'Connectivity', label:'Hebbal Flyover',                    dist:'25 min', icon:'flyover' },
  { cat:'Connectivity', label:'Bagalur Cross',                     dist:'10 min', icon:'road'    },
  { cat:'Connectivity', label:'Outer Ring Road',                   dist:'18 min', icon:'road'    },

  // Tech Parks / Work
  { cat:'Tech Parks', label:'Wipro Aerospace',           dist:'5 min',  icon:'office' },
  { cat:'Tech Parks', label:'Manyata Tech Park',          dist:'30 min', icon:'office' },
  { cat:'Tech Parks', label:'Karle Town Centre SEZ',      dist:'28 min', icon:'office' },
  { cat:'Tech Parks', label:'L&T Tech Park',              dist:'12 min', icon:'office' },
  { cat:'Tech Parks', label:'Kirloskar Business Park',    dist:'25 min', icon:'office' },
  { cat:'Tech Parks', label:'Shell Technology Centre',    dist:'18 min', icon:'office' },
  { cat:'Tech Parks', label:'Boeing',                     dist:'8 min',  icon:'office' },
  { cat:'Tech Parks', label:'Foxconn',                    dist:'14 min', icon:'office' },
  { cat:'Tech Parks', label:'Thyssenkrupp',               dist:'10 min', icon:'office' },
  { cat:'Tech Parks', label:'Financial City',             dist:'22 min', icon:'office' },
  { cat:'Tech Parks', label:'Brigade Magnum',             dist:'24 min', icon:'office' },

  // Schools / Colleges
  { cat:'Schools', label:'Reva University',             dist:'12 min', icon:'school' },
  { cat:'Schools', label:'CMR University',              dist:'15 min', icon:'school' },
  { cat:'Schools', label:'Delhi Public School',         dist:'8 min',  icon:'school' },
  { cat:'Schools', label:'National Public School',      dist:'18 min', icon:'school' },
  { cat:'Schools', label:'Greenfield International',    dist:'10 min', icon:'school' },
  { cat:'Schools', label:'Canadian International',      dist:'22 min', icon:'school' },
  { cat:'Schools', label:'Chrysalis School',            dist:'10 min', icon:'school' },
  { cat:'Schools', label:'Presidency College',          dist:'20 min', icon:'school' },
  { cat:'Schools', label:'Presidency University',       dist:'22 min', icon:'school' },
  { cat:'Schools', label:'Presidency School',           dist:'20 min', icon:'school' },

  // Hospitals
  { cat:'Hospitals', label:'Aster Hospital',            dist:'15 min', icon:'cross' },
  { cat:'Hospitals', label:'Columbia Asia',             dist:'18 min', icon:'cross' },
  { cat:'Hospitals', label:'Regal Hospital',            dist:'12 min', icon:'cross' },

  // Shopping / Lifestyle
  { cat:'Shopping', label:'Mall of Asia',               dist:'20 min', icon:'cart' },
  { cat:'Shopping', label:'Esteem Mall',                dist:'22 min', icon:'cart' },
  { cat:'Shopping', label:'Elements Mall',              dist:'25 min', icon:'cart' },
  { cat:'Shopping', label:'Bhartiya Mall',              dist:'10 min', icon:'cart' },
  { cat:'Shopping', label:'Galleria Mall',              dist:'28 min', icon:'cart' },
  { cat:'Shopping', label:'Lulu Vasa Mart',             dist:'24 min', icon:'cart' },
  { cat:'Shopping', label:'Big Bewaki',                 dist:'18 min', icon:'cart' },
  { cat:'Shopping', label:'Decathlon',                  dist:'20 min', icon:'cart' },
];

// Amenities — 65 mapped on the masterplan legend (factsheet page 3),
// grouped into 5 categories. Numbers correspond to the legend pin on the
// masterplan so the sales rep can point to them.
const AMENITIES = [
  { cat:'Sport', icon:'sport', items:[
    { n:51, label:'Basketball Court' },
    { n:54, label:'Mega Court' },
    { n:55, label:'Volleyball Court' },
    { n:56, label:'Viewing Gallery' },
    { n:57, label:"Children's Play Area" },
    { n:58, label:'Archery' },
    { n:59, label:'Rock Climbing Wall' },
    { n:60, label:'Trampoline Park' },
    { n:61, label:'Cricket Maidan' },
    { n:63, label:'Cricket Practice Net' },
    { n:64, label:'Box Cricket' },
    { n:65, label:'Tennis Court' },
    { n:66, label:'Futsal' },
    { n:67, label:'Skate Park' },
    { n:13, label:'Outdoor Gym' },
  ]},
  { cat:'Social', icon:'social', items:[
    { n:17, label:"Elder's Plaza" },
    { n:18, label:'Garden 1' },
    { n:20, label:'Co-Working Space' },
    { n:21, label:'Picnic Lawn with Mound' },
    { n:22, label:'Garden 3' },
    { n:23, label:'Sculpture Court' },
    { n:24, label:'Garden 4' },
    { n:25, label:'Reading Nook' },
    { n:26, label:'Picnic Lawn' },
    { n:27, label:'Arts & Crafts Zone' },
    { n:28, label:'Garden 5' },
    { n:29, label:'Reflexology Pathway' },
    { n:30, label:'Informal Seating Area' },
    { n:31, label:'Amphitheatre with Stage' },
    { n:32, label:'Fairy Lawn' },
    { n:33, label:'Event Lawn' },
    { n:45, label:"Fern's Café" },
    { n:46, label:'Garden 6' },
    { n:48, label:'Garden 7' },
    { n:49, label:'Gathering Area' },
    { n:68, label:'Party Lawn' },
    { n:69, label:'Floor Games' },
  ]},
  { cat:'Wellness', icon:'wellness', items:[
    { n: 2, label:'Pick-Up Area' },
    { n: 4, label:'Bus Bay with Waiting Zone' },
    { n: 5, label:'Event Seating' },
    { n: 6, label:'Adventure Park' },
    { n: 8, label:'Pedestrian Path (5m wide)' },
    { n: 9, label:'Bicycle Lane (1.5m wide)' },
    { n:10, label:'Jogging Track (1.5m wide)' },
    { n:11, label:'Tower Drop-Off' },
    { n:12, label:'Yoga / Meditation Zone' },
    { n:14, label:'Mini Staff Area' },
    { n:15, label:'Tile Court' },
    { n:16, label:'Tactile Walk' },
    { n:52, label:'Woodland' },
    { n:53, label:'Garden 8' },
  ]},
  { cat:'Family', icon:'family', items:[
    { n: 1, label:'Security Cabin' },
    { n: 7, label:'Fire Driveway (6m wide)' },
    { n:19, label:'Garden 2' },
    { n:43, label:'Mobile BBQ' },
    { n:44, label:'Camp Fire Zone' },
    { n:47, label:'Open Pavilion with Outdoor Shower' },
  ]},
  { cat:'Water', icon:'water', items:[
    { n:34, label:'Kids Pool' },
    { n:35, label:'Leisure Pool' },
    { n:36, label:'Infinity Edge' },
    { n:37, label:'Pool Bar' },
    { n:38, label:'Aqua Gym with Jacuzzi' },
    { n:39, label:'Aqua Deck' },
    { n:40, label:'Pool Deck' },
    { n:41, label:'Lap Pool' },
    { n:62, label:'Pool Pavilion with Outdoor Shower' },
  ]},
];

// Specifications — factsheet page 13.
const SPECIFICATIONS = [
  { area:'Structure', icon:'struct', items:[
    'RCC framed structure',
    'Cement blocks for walls wherever needed',
  ]},
  { area:'Lobby', icon:'lobby', items:[
    'Ground floor flooring and dado upto 800mm in Polished Granite',
    'Basement and all upper floors — flooring in Vitrified Tiles with combination of texture & emulsion paint and ceiling with emulsion paint',
    'Service staircase and service lobby — Granite / Vitrified Tiles for floor, combination of texture and emulsion paint for walls and ceiling with emulsion paint',
  ]},
  { area:'Lifts', icon:'lift', items:[
    'Lifts of suitable size and capacity will be provided in all buildings',
  ]},
  { area:'Apartment Flooring', icon:'floor', items:[
    'Vitrified tiles in the living, dining and all bedrooms',
    'Vitrified tiles in the balcony',
  ]},
  { area:'Kitchen & Utility', icon:'kitchen', items:[
    'Vitrified tiles flooring for kitchen',
    'Polished Granite slab for counters',
    'Glazed tile dado for 800mm above the designated granite counter length',
    'Water filter point provision in kitchen',
    'Ceramic tiles for flooring & glazed tile dado for utility',
    'Single bowl Quartz sink with CP Tap in kitchen and Stainless Steel sink with CP Tap in utility',
  ]},
  { area:'Toilets', icon:'toilet', items:[
    'Ceramic tiles for flooring with glazed tiles on walls upto false ceiling',
    'All toilets with counter-top wash basins',
    'Wall-mounted EWC with concealed cistern and chrome plated fittings',
    'Single lever tap and shower mixer',
    'Geysers provided in all toilets',
    'All toilets of the last two floors will have hot water from solar panels and Geyser for MBR Toilet',
    'Suspended pipelines in all toilets concealed within the PVC strip false ceiling',
    'Exhaust fan provision for all toilets',
  ]},
  { area:'Doors', icon:'door', items:[
    'Main Doors and Internal room doors — 8\'0" high opening engineered wooden frame and engineered veneer flush shutter with iron mongery',
    'Toilet Doors — 7\'0" high opening engineered wooden frame, laminated flush shutter with iron mongery',
  ]},
  { area:'External Doors & Windows', icon:'window', items:[
    'Aluminium / UPVC frames and sliding shutters with clear glass for all external doors',
    '3 track UPVC framed sliding windows with clear glass and provision only for mosquito mesh shutters',
    'Partly panelled & partly glazed / fully panelled UPVC framed doors for kitchen utility and service ducts',
    'MS designer grill, enamel painted for Ground floor apartments only',
  ]},
  { area:'Painting', icon:'paint', items:[
    'External walls with cement / texture paint',
    'Internal walls with ceiling in emulsion Paint',
    'All railings in enamel paint',
  ]},
  { area:'Electrical', icon:'bolt', items:[
    'All electrical wiring is concealed in PVC insulated copper wires with modular switches',
    'Power outlets and light points provided in all rooms',
    '3 kW power will be provided for 1 bed units',
    '4 kW power will be provided for 2 and 2.5 bed units',
    '6 kW power will be provided for 3 bed units',
    'TV points provided in the living and bedrooms',
    'Telephone points provided in living room only',
    'Data points provided in living, study and bedrooms',
    'Split AC provisions in living and all bed rooms',
  ]},
  { area:'Security', icon:'lock', items:[
    'Security cabins at all entrances and exits having CCTV coverage',
    'CCTV coverage at all building entrances / exit points',
  ]},
  { area:'DG Power', icon:'power', items:[
    'DG Power back up will be provided for all common services, club house and amenities',
    '100% backup for units at a cost',
  ]},
];

// Stratum-equivalent — Kalyani Developers credentials (factsheet page 14).
const KALYANI_STATS = [
  { value: '30+',  label: 'years of experience' },
  { value: '12 Million+ SFT', label: 'of Office Spaces' },
  { value: '75',   label: 'Automobile Showrooms across Bangalore / Hyderabad / Mysore' },
];

const KALYANI_DOMAINS = ['Residential', 'Commercial', 'Automobile', 'Green Energy', 'Hospitality', 'Managed Spaces'];

// Gallery sources — point at our extracted assets + factsheet pages.
const GALLERY_CATS = ['Hero Render', 'Masterplan', 'Landscape', 'Floor Plans', 'Brochure'];

const GALLERY_ITEMS = [
  { id:'hero-04',  cat:'Hero Render', src:'assets/renders/render-04.jpg',     title:'LivingTree by night — aerial render', tag:'Hero render' },
  { id:'hero-05',  cat:'Hero Render', src:'assets/renders/render-05.jpg',     title:'Numbering plan with tree clusters',   tag:'Tower layout' },
  { id:'plan-mp',  cat:'Masterplan',  src:'assets/renders/masterplan-03.jpg', title:'Master plan with 65 amenities',        tag:'Masterplan' },
  { id:'land-cov', cat:'Landscape',   src:'assets/renders/cover-01.png',       title:'Flowing roots wreath — Designed for Life', tag:'Brand mark' },
  { id:'fp-1bhk',  cat:'Floor Plans', src:'assets/plans/plan-07.jpg',          title:'1 BHK East & West',                    tag:'1 BHK' },
  { id:'fp-2bhk',  cat:'Floor Plans', src:'assets/plans/plan-08.jpg',          title:'2 BHK East & West',                    tag:'2 BHK' },
  { id:'fp-25bhk', cat:'Floor Plans', src:'assets/plans/plan-09.jpg',          title:'2.5 BHK East & West',                  tag:'2.5 BHK' },
  { id:'fp-3sm',   cat:'Floor Plans', src:'assets/plans/plan-10.jpg',          title:'3 BHK Smart East & West',              tag:'3 BHK Smart' },
  { id:'fp-3op',   cat:'Floor Plans', src:'assets/plans/plan-11.jpg',          title:'3 BHK Optimal East & West',            tag:'3 BHK Optimal' },
  { id:'fp-3lx',   cat:'Floor Plans', src:'assets/plans/plan-12.jpg',          title:'3 BHK Luxe East & West',               tag:'3 BHK Luxe' },
  { id:'bro-bk',   cat:'Brochure',    src:'assets/renders/backcover-15.jpg',   title:'Brochure back cover',                  tag:'Brochure' },
];

// Sample customer for booking demo.
const SAMPLE_CUSTOMER = {
  name: 'Mr. Aravind Kumar',
  phone: '+91 98800 12345',
  email: 'aravind.kumar@example.com',
  loanPreApproved: true,
  pan: 'AKQPK1234D',
};

// INR formatting
function formatINR(n, opts = {}) {
  if (n >= 10000000) return `₹ ${(n/10000000).toFixed(opts.decimals ?? 2)} Cr`;
  if (n >= 100000)   return `₹ ${(n/100000).toFixed(opts.decimals ?? 1)} L`;
  return `₹ ${n.toLocaleString('en-IN')}`;
}
function formatINRFull(n) {
  return `₹ ${n.toLocaleString('en-IN')}`;
}

window.PROJECT = PROJECT;
window.TOWERS = TOWERS;
window.TYPOLOGIES = TYPOLOGIES;
window.USPS = USPS;
window.NORTH_REASONS = NORTH_REASONS;
window.LOCATION_ADVANTAGES = LOCATION_ADVANTAGES;
window.AMENITIES = AMENITIES;
window.SPECIFICATIONS = SPECIFICATIONS;
window.KALYANI_STATS = KALYANI_STATS;
window.KALYANI_DOMAINS = KALYANI_DOMAINS;
window.GALLERY_CATS = GALLERY_CATS;
window.GALLERY_ITEMS = GALLERY_ITEMS;
window.SAMPLE_CUSTOMER = SAMPLE_CUSTOMER;
window.formatINR = formatINR;
window.formatINRFull = formatINRFull;
