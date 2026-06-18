// Custom line icons for Living Tree menu — drawn from architectural primitives.
// Stroke-based, 1.5px, consistent visual weight.

const IconFloorPlan = ({ size = 56, stroke = "currentColor", strokeWidth = 1.4 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none"
       stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="10" width="48" height="44" rx="1"/>
    <path d="M8 30 L34 30"/>
    <path d="M34 10 L34 54"/>
    <path d="M34 42 L56 42"/>
    <path d="M20 30 L20 26 M26 30 L26 26"/>
    <path d="M34 18 L38 18 M34 24 L38 24"/>
    <circle cx="44" cy="22" r="1.2" fill={stroke}/>
    <circle cx="18" cy="44" r="1.2" fill={stroke}/>
  </svg>
);

const IconMasterPlan = ({ size = 56, stroke = "currentColor", strokeWidth = 1.4 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none"
       stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M32 6 L56 18 L56 46 L32 58 L8 46 L8 18 Z"/>
    <path d="M32 6 L32 58"/>
    <path d="M8 18 L56 46"/>
    <path d="M56 18 L8 46"/>
    <circle cx="32" cy="32" r="4"/>
  </svg>
);

const IconLocation = ({ size = 56, stroke = "currentColor", strokeWidth = 1.4 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none"
       stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M32 8 C22 8 14 16 14 26 C14 38 32 56 32 56 C32 56 50 38 50 26 C50 16 42 8 32 8 Z"/>
    <circle cx="32" cy="26" r="6"/>
  </svg>
);

const IconAdvantages = ({ size = 56, stroke = "currentColor", strokeWidth = 1.4 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none"
       stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {/* leaf — references Living Tree mark */}
    <path d="M14 50 C14 30 28 14 50 14 C50 36 36 50 14 50 Z"/>
    <path d="M14 50 L40 24"/>
    <path d="M22 42 L32 42 M26 38 L34 30"/>
  </svg>
);

// Living Tree mark — a stylised canopy + trunk
const LivingTreeMark = ({ size = 48, color = "currentColor", strokeWidth = 1.3 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none"
       stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="32" cy="24" r="16"/>
    <circle cx="20" cy="20" r="9"/>
    <circle cx="44" cy="20" r="9"/>
    <circle cx="32" cy="14" r="9"/>
    <path d="M32 38 L32 58"/>
    <path d="M32 46 L26 50 M32 50 L38 54"/>
  </svg>
);

const MENU_ITEMS = [
  { key: "floor",     label: "Floor Plans",  hint: "2 / 3 / 4 BHK residences",  Icon: IconFloorPlan },
  { key: "master",    label: "Master Plan",  hint: "Layout & amenities",        Icon: IconMasterPlan },
  { key: "location",  label: "Location",     hint: "Sarjapur · East Bangalore", Icon: IconLocation },
  { key: "advantages",label: "Advantages",   hint: "Why Living Tree",           Icon: IconAdvantages },
];

Object.assign(window, {
  IconFloorPlan, IconMasterPlan, IconLocation, IconAdvantages,
  LivingTreeMark, MENU_ITEMS,
});
