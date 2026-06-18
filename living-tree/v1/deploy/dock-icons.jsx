// Secondary dock icons — slim line set.

const IconInventory = ({ size = 28, stroke = "currentColor", sw = 1.4 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="5" width="9" height="9" rx="0.5"/>
    <rect x="18" y="5" width="9" height="9" rx="0.5"/>
    <rect x="5" y="18" width="9" height="9" rx="0.5"/>
    <rect x="18" y="18" width="9" height="9" rx="0.5"/>
    <circle cx="22.5" cy="22.5" r="2"/>
  </svg>
);

const IconTools = ({ size = 28, stroke = "currentColor", sw = 1.4 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="2"/>
    <line x1="5" y1="9" x2="7" y2="9"/>
    <line x1="11" y1="9" x2="27" y2="9"/>
    <circle cx="22" cy="16" r="2"/>
    <line x1="5" y1="16" x2="20" y2="16"/>
    <line x1="24" y1="16" x2="27" y2="16"/>
    <circle cx="13" cy="23" r="2"/>
    <line x1="5" y1="23" x2="11" y2="23"/>
    <line x1="15" y1="23" x2="27" y2="23"/>
  </svg>
);

const IconBrand = ({ size = 28, stroke = "currentColor", sw = 1.4 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 7 C5 6 6 5 7 5 L14 5 C15 5 16 6 16 7 L16 27 L5 27 Z"/>
    <path d="M27 7 C27 6 26 5 25 5 L18 5 C17 5 16 6 16 7 L16 27 L27 27 Z"/>
    <line x1="8" y1="10" x2="13" y2="10"/>
    <line x1="8" y1="14" x2="13" y2="14"/>
    <line x1="19" y1="10" x2="24" y2="10"/>
    <line x1="19" y1="14" x2="24" y2="14"/>
  </svg>
);

const IconOverview = ({ size = 28, stroke = "currentColor", sw = 1.4 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="16" cy="16" r="11"/>
    <line x1="16" y1="14" x2="16" y2="22"/>
    <circle cx="16" cy="10" r="0.8" fill={stroke}/>
  </svg>
);

const IconBooking = ({ size = 28, stroke = "currentColor", sw = 1.4 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="7" width="22" height="20" rx="1"/>
    <line x1="5" y1="13" x2="27" y2="13"/>
    <line x1="10" y1="4" x2="10" y2="9"/>
    <line x1="22" y1="4" x2="22" y2="9"/>
    <circle cx="11" cy="19" r="0.9" fill={stroke}/>
    <circle cx="16" cy="19" r="0.9" fill={stroke}/>
    <circle cx="21" cy="19" r="0.9" fill={stroke}/>
    <circle cx="11" cy="23" r="0.9" fill={stroke}/>
    <circle cx="16" cy="23" r="0.9" fill={stroke}/>
  </svg>
);

const IconGRE = ({ size = 28, stroke = "currentColor", sw = 1.4 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 26 C16 26 7 20 7 13 C7 9 9.5 6 13 6 C14.5 6 15.5 6.6 16 7.5 C16.5 6.6 17.5 6 19 6 C22.5 6 25 9 25 13 C25 20 16 26 16 26 Z"/>
    <circle cx="16" cy="13" r="1.5"/>
  </svg>
);

const IconInquire = ({ size = 28, stroke = "currentColor", sw = 1.4 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9 C6 7.5 7 7 8 7 L24 7 C25 7 26 7.5 26 9 L26 20 C26 21.5 25 22 24 22 L13 22 L8 26 L8 22 C7 22 6 21.5 6 20 Z"/>
  </svg>
);

const IconGallery = ({ size = 28, stroke = "currentColor", sw = 1.4 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="7" width="22" height="18" rx="1.5"/>
    <circle cx="11.5" cy="13" r="2.2"/>
    <path d="M6 22 L13 16 L18 20 L22 17 L26 21"/>
  </svg>
);

const IconEmail = ({ size = 28, stroke = "currentColor", sw = 1.4 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="7" width="24" height="18" rx="2"/>
    <path d="M5 9 L16 17 L27 9"/>
  </svg>
);

const IconCRM = ({ size = 28, stroke = "currentColor", sw = 1.4 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="12" r="4"/>
    <path d="M4 25 C4 19.5 7.5 17 11 17 C14.5 17 18 19.5 18 25"/>
    <line x1="22" y1="11" x2="28" y2="11"/>
    <line x1="22" y1="16" x2="28" y2="16"/>
    <line x1="22" y1="21" x2="28" y2="21"/>
  </svg>
);

// Leaf — used by ambient particle system
const Leaf = ({ size = 16, fill = "currentColor", opacity = 1, rotate = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} style={{ opacity, transform: `rotate(${rotate}deg)` }}>
    <path d="M3 21 C3 11 11 3 21 3 C21 13 13 21 3 21 Z"/>
    <path d="M3 21 L21 3" stroke={fill} strokeWidth="0.6" fill="none" opacity="0.4"/>
  </svg>
);

Object.assign(window, {
  IconInventory, IconTools, IconBrand, IconOverview, IconBooking, IconGRE, IconInquire,
  IconGallery, IconEmail, IconCRM,
  Leaf,
});
