/* Phygital — Experiences kiosk
   Tries the live DB API first (/api/projects); falls back to the
   embedded seed so the screen also opens straight from the file system.
   The seed shape is identical to a `projects` table row. */

// Segments shown as filter chips. Order = display order. "all" is virtual.
const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "Sales Suite", label: "Sales Suite" },
  { key: "GRE", label: "GRE" },
  { key: "CRM", label: "CRM" },
  { key: "Booking", label: "Booking" },
  { key: "AI Assistant", label: "AI Assistant" },
];

const SEED = [
  {
    name: "Universe",
    description: "Premium residences sales suite.",
    category: "Sales Suite",
    logo: "./assets/logos/universe.png",
    app_url: "",                  // /apps/<slug>/ when bundled locally
    live_url: "https://the-universe-salessuite.netlify.app/",
    sort_order: 1,
  },
  {
    name: "Living Tree",
    description: "Interactive sales experience for Kalyani Developers.",
    category: "Sales Suite",
    logo: "./assets/logos/livingtree.png",
    app_url: "",
    live_url: "https://living-tree.netlify.app/",
    sort_order: 2,
  },
  {
    name: "Embassy Citadel",
    description: "Ultra-luxury tower sales suite — a world unto itself.",
    category: "Sales Suite",
    logo: "./assets/logos/embassy.png",
    app_url: "",
    live_url: "https://magenta-twilight-6d2628.netlify.app/",
    sort_order: 3,
  },
  {
    name: "Embassy Developments",
    description: "Explore Embassy's projects across India.",
    category: "Sales Suite",
    logo: "./assets/logos/embassy-developments.png",
    app_url: "",
    live_url: "https://sunny-squirrel-3f220f.netlify.app/",
    sort_order: 4,
  },
  {
    name: "Embassy Citadel GRE",
    description: "Guest relations experience for Embassy Citadel.",
    category: "GRE",
    logo: "./assets/logos/embassy.png",
    app_url: "",
    live_url: "https://embassy-citadel-gre.netlify.app/",
    sort_order: 6,
  },
  {
    name: "Embassy AI",
    description: "AI concierge chatbot for Embassy Developments.",
    category: "AI Assistant",
    logo: "./assets/logos/embassy.png",
    app_url: "",
    live_url: "https://embassy-chat-concierge.netlify.app/",
    sort_order: 5,
  },
];

const OPEN_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>';

// Offline resilience: every successful DB fetch is saved to localStorage.
// If the database/connection errors, we render the last-saved copy instead.
// The cache is only overwritten on the next successful fetch (next app open),
// never deleted — so the kiosk keeps working if the VPS is briefly unreachable.
const CACHE_KEY = "phygital.projects.cache.v1";
let servedFromCache = false;

async function loadProjects() {
  try {
    const res = await fetch("/api/projects", { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) throw new Error("empty");
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (_) {}
    servedFromCache = false;
    return data;
  } catch (_) {
    // DB unavailable → fall back to the last-saved copy, then the embedded seed
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (Array.isArray(cached) && cached.length) { servedFromCache = true; return cached; }
    } catch (_) {}
    servedFromCache = true;
    return SEED;
  }
}

// reflect offline/cached state on the status pill
function markConnectionState() {
  const pill = document.querySelector(".status__live");
  if (!pill) return;
  if (servedFromCache) { pill.classList.add("cached"); pill.innerHTML = "<i></i> saved"; }
  else { pill.classList.remove("cached"); pill.innerHTML = "<i></i> live"; }
}

function el(tag, cls, html) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
}

// The URL the kiosk opens for a project: prefer the locally-bundled build
// (offline, same-origin), then fall back to a live deployed URL.
function targetUrl(p) {
  const a = (p.app_url || "").trim();
  const l = (p.live_url || "").trim();
  return a || l || "";
}

const SOON_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 2"/></svg>';

function makeTile(p) {
  // Dummy "Coming soon" placeholder — muted, not clickable.
  if (p.coming_soon) {
    const t = el("div", "tile tile--soon");
    t.setAttribute("aria-label", `${labelFor(p.category)} — coming soon`);
    const ic = el("span", "tile__icon");
    ic.appendChild(el("span", "tile__soonglyph", SOON_ICON));
    t.appendChild(ic);
    t.appendChild(el("span", "tile__name", "Coming soon"));
    t.appendChild(el("span", "tile__badge", `<i></i>Coming soon`));
    return t;
  }

  const url = targetUrl(p);
  const ready = !!url;
  const tile = el("button", `tile ${ready ? "tile--live" : "tile--pending"}`);
  tile.type = "button";
  tile.setAttribute(
    "aria-label",
    ready ? `Open ${p.name}` : `${p.name} — not deployed yet`
  );

  const icon = el("span", "tile__icon");
  const img = el("img");
  img.src = p.logo;
  img.alt = `${p.name} logo`;
  img.loading = "eager";          // load now (during the intro) — no pop-in on entry
  img.decoding = "async";
  img.fetchPriority = "high";
  icon.appendChild(img);
  icon.appendChild(el("span", "tile__open", OPEN_ICON));
  tile.appendChild(icon);

  tile.appendChild(el("span", "tile__name", p.name));
  const desc = p.description || p.sub;
  if (desc) tile.appendChild(el("span", "tile__sub", desc));
  tile.appendChild(
    el("span", "tile__badge", `<i></i>${ready ? "Open" : "Awaiting deploy"}`)
  );

  tile.addEventListener("click", () => {
    if (ready) {
      openViewer(url, p.name);
    } else {
      toast(`<b>${p.name}</b> isn't deployed yet — publish it via /phygital-deploy`);
    }
  });
  return tile;
}

/* ---------- fullscreen experience viewer ---------- */
const viewer = {
  root: null, frame: null, loading: null, label: null, closeBtn: null, open: false,
};

function initViewer() {
  viewer.root = document.getElementById("viewer");
  viewer.frame = document.getElementById("viewerFrame");
  viewer.loading = document.getElementById("viewerLoading");
  viewer.label = document.getElementById("viewerLoadLabel");
  viewer.closeBtn = document.getElementById("viewerClose");
  if (!viewer.root) return;

  viewer.closeBtn.addEventListener("click", closeViewer);
  viewer.frame.addEventListener("load", () => {
    // only hide the veil once a real experience (not about:blank) has loaded
    if (viewer.open) viewer.loading.classList.remove("on");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && viewer.open) closeViewer();
  });
}

// Keep the whole app in true fullscreen (set once the user enters from the
// intro). Re-assert on any tap so the tablet's top/bottom browser bars stay hidden.
function goFullscreen() {
  if (document.fullscreenElement || document.webkitFullscreenElement) return;
  const el = document.documentElement;
  const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
  if (fn) { try { Promise.resolve(fn.call(el)).catch(() => {}); } catch (_) {} }
}

function openViewer(url, name) {
  if (!viewer.root) return;
  viewer.open = true;
  viewer.label.textContent = name ? `Loading ${name}…` : "Loading…";
  viewer.loading.classList.add("on");
  viewer.frame.src = url;
  viewer.root.classList.add("on");
  viewer.root.setAttribute("aria-hidden", "false");
  document.body.classList.add("viewing");
  // free the GPU for the experience: stop the particle logo + background FX
  if (window.handfx) window.handfx.pause();
  // stay in true fullscreen (re-assert; the #viewer overlay already covers the
  // whole fullscreen viewport, so no need to switch the fullscreen element).
  goFullscreen();
}

function closeViewer() {
  if (!viewer.root || !viewer.open) return;
  viewer.open = false;
  viewer.root.classList.remove("on");
  viewer.root.setAttribute("aria-hidden", "true");
  document.body.classList.remove("viewing");
  // bring the particle logo + background FX back to life
  if (window.handfx) window.handfx.resume();
  // stay fullscreen (do NOT exit) so the tablet's bars don't reappear on the kiosk
  // after the fade, unload the experience so its audio/timers/SW stop
  setTimeout(() => {
    if (!viewer.open) viewer.frame.src = "about:blank";
  }, 320);
}

let allProjects = [];     // real projects from the DB / seed
let displayProjects = []; // real + dummy "coming soon" placeholders (what we render)
let activeCat = "all";

// PREVIEW: dummy "Coming soon" placeholder tiles, 2 per category, so the
// vertical down-scroll can be seen with every category populated.
// Flip to false (or delete makeDummies) to show only real projects.
const SHOW_DUMMIES = true;
function makeDummies() {
  if (!SHOW_DUMMIES) return [];
  const out = [];
  CATEGORIES.filter((c) => c.key !== "all").forEach((c) => {
    for (let i = 1; i <= 2; i++) {
      out.push({
        name: "Coming soon",
        category: c.key,
        coming_soon: true,
        live_url: "",
        app_url: "",
        sort_order: 900 + i,
      });
    }
  });
  return out;
}

const labelFor = (key) =>
  (CATEGORIES.find((c) => c.key === key) || {}).label || key;
const countFor = (key) =>
  key === "all" ? displayProjects.length
                : displayProjects.filter((p) => (p.category || "") === key).length;

function buildCats() {
  const nav = document.getElementById("cats");
  if (!nav) return;
  nav.innerHTML = "";
  CATEGORIES.forEach((c) => {
    const chip = el(
      "button",
      `cat ${c.key === activeCat ? "cat--on" : ""}`,
      `${c.label}<span class="cat__n">${countFor(c.key)}</span>`
    );
    chip.type = "button";
    chip.addEventListener("click", () => {
      if (activeCat === c.key) return;
      activeCat = c.key;
      buildCats();
      renderGrid();
    });
    nav.appendChild(chip);
  });
}

const bySort = (a, b) => (a.sort_order || 0) - (b.sort_order || 0);

// One category "shelf": a small label header + a wrapping row of icons.
// Shelves stack vertically, so the catalog scrolls DOWN (no horizontal scroll).
function makeShelf(key, list) {
  const shelf = el("section", "shelf");
  const head = el("h3", "shelf__label",
    `${labelFor(key)}<span class="shelf__n">${list.length}</span>`);
  head.appendChild(el("span", "shelf__line"));
  shelf.appendChild(head);
  const row = el("div", "shelf__row");
  list.slice().sort(bySort).forEach((p) => row.appendChild(makeTile(p)));
  shelf.appendChild(row);
  return shelf;
}

function renderGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  // Which categories to show, in display order.
  const keys =
    activeCat === "all"
      ? CATEGORIES.filter((c) => c.key !== "all").map((c) => c.key)
      : [activeCat];

  let rendered = 0;
  keys.forEach((key) => {
    const list = displayProjects.filter((p) => (p.category || "") === key);
    if (!list.length) return;             // skip a category with nothing to show
    grid.appendChild(makeShelf(key, list));
    rendered++;
  });

  if (!rendered) {
    grid.appendChild(
      el("div", "empty", `Coming soon — apps in <b>${labelFor(activeCat)}</b> will appear here.`)
    );
  }
}

let toastTimer;
function toast(html) {
  const t = document.getElementById("toast");
  t.innerHTML = html;
  t.classList.add("toast--show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("toast--show"), 3600);
}

// Warm the cache during the intro so entering the kiosk is smooth:
//  • decode every unique tile logo up front (no lazy pop-in)
//  • prefetch each live experience URL (low priority) so it opens faster
function preloadAssets(list) {
  const logos = new Set(), urls = new Set();
  list.forEach((p) => {
    if (p.logo) logos.add(p.logo);
    const u = (p.live_url || "").trim();
    if (u) urls.add(u);
  });
  logos.forEach((src) => { const im = new Image(); im.decoding = "async"; im.src = src; });
  urls.forEach((u) => {
    try {
      const l = document.createElement("link");
      l.rel = "prefetch"; l.href = u;   // cross-origin document prefetch (no crossOrigin attr)
      document.head.appendChild(l);
    } catch (_) {}
  });
}

function tickClock() {
  const c = document.getElementById("clock");
  if (!c) return;
  const d = new Date();
  c.textContent = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

(async function init() {
  tickClock();
  setInterval(tickClock, 15000);
  initViewer();
  allProjects = await loadProjects();
  displayProjects = allProjects.concat(makeDummies());
  markConnectionState();
  buildCats();
  renderGrid();
  // While the intro is on screen, warm everything so the kiosk is instant:
  // decode every tile logo + prefetch each live experience.
  preloadAssets(displayProjects);
})();
