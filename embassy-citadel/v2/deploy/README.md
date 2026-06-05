# Embassy Citadel — Sales Suite

Interactive sales-suite kiosk app for **Embassy Citadel · Worli · Mumbai** — a 79-floor, 312-meter ultra-luxury tower. 13 production screens cover gallery, masterplan, amenities, location, inventory, floor plans, unit detail, tools, and project narrative.

PWA installable · offline-capable · Safari/iPad optimized · fully self-contained (~60 MB, all gallery/amenities/masterplan media bundled in — nothing loaded from outside the folder).

---

## Quick start

Open `index.html` (auto-redirects to `intro.html`), or serve the folder:

```bash
cd deploy && python3 -m http.server 8090
```

Then open `http://localhost:8090/`.

For LAN access from a tablet:

```bash
cd deploy && python3 -m http.server 8090 --bind 0.0.0.0
# then visit http://<your-lan-ip>:8090/ from the device
```

---

## Ship to Netlify

Drag this folder onto **https://app.netlify.com/drop** — zero build step required.

Other hosts work the same way (folder is fully self-contained, no env, no API keys):

| Host | One-liner |
|---|---|
| **Netlify** | drag-drop the folder to `app.netlify.com/drop`, or `netlify deploy --dir=. --prod` |
| **Vercel** | `vercel deploy . --prod` |
| **Cloudflare Pages** | `wrangler pages deploy .` |
| **GitHub Pages** | push contents to `gh-pages` branch or `/docs` |
| **S3 + CloudFront** | `aws s3 sync . s3://your-bucket --delete` |

For PWA install on iOS Safari you need **HTTPS** in production — all the above provide it.

---

## Tech notes

- **Display targets**: iPad Pro 11" / 13" (1194×834, 1366×1024), Samsung Tab S7 (1024×768 / 768×1024), 65" 4K display (3840×2160), iPhone 14 Pro (393×852 / 852×393). All landscape-first; portrait works on phones.
- **Scale-to-fit**: each screen's 1440×900 design canvas auto-scales via `transform: scale(min(vw/1440, vh/900))` on the inner `.stage-inner` wrapper — works on any landscape viewport. The outer body bone/paper bg fills the letterbox area so there are no white patches around the stage.
- **PWA**: installable via Add to Home Screen (iOS Safari) or browser install prompt (Chrome/Edge). Service worker `sw.js` (`citadel-v16`) precaches all 13 HTMLs, core static assets, manifest, and icons on first visit, and **cache-first Google Fonts** (Cormorant Garamond + Inter) so the web-fonts load instantly from cache on every screen and work fully offline (kills the font-swap flicker). All other media (gallery slides, hero photography) is warmed into the same cache by the boot preloader and runtime-cached on fetch — full offline support after the first visit. Bump the `CACHE` constant to push updates to already-installed apps.
- **Boot preloader**: `intro.html` warms the *entire* experience while the user is on the threshold screen — every image is fetched **and decoded**, the heavy `<object>` SVGs (`inventory.svg`, `floor-units.svg`) and all 12 inner screens are fetched into cache, and the web-fonts are actively loaded via the Font Loading API. A gold hairline under the tap zone shows progress; the experience is marked ready (`body.boot-done`) once critical assets are cached — typically ~1s on warm cache. Result: **screens never load their images on open** — they paint fully formed from cache, no pop-in, no flicker. The "Tap to Enter" morph waits (behind the cream veil) for home's critical assets before navigating, capped so it can never hang.
- **Transitions**: 220ms cream-veil between screens (down from 420ms in earlier builds) — fast enough to feel near-instant, slow enough to mask the cold-load. Touch-prefetch fires `<link rel="prefetch">` on `pointerdown` so the next screen is already in cache by the time `click` fires.
- **Safari polish**: `viewport-fit=cover`, safe-area-insets, no-double-tap-zoom, no overflow-bounce, `--vh` CSS var refreshed on resize/orientation to dodge the iOS URL-bar dynamic height bug.

---

## File inventory

**13 production HTML screens** (the full sales-suite flow):

| File | Purpose |
|---|---|
| `intro.html` | Threshold / hold-to-enter |
| `home.html` | Constellation index of all chapters |
| `gallery.html` | Project imagery |
| `masterplan.html` | Site & tower masterplan |
| `amenities.html` | Wellness, sky club, sky garden, outdoors |
| `location.html` | Full-bleed map + POIs |
| `inventory.html` | Tower inventory entry |
| `inventory-floors.html` | Floor selector |
| `floor-plan.html` | BHK comparison + unit overlay |
| `floor-units.html` | Per-floor unit grid |
| `unit-detail.html` | Single residence detail |
| `tools.html` | EMI, FSI, area calculators |
| `about.html` | Developer timeline, trust marks, story |

**PWA core**: `index.html` (redirect to `intro.html`), `manifest.webmanifest`, `sw.js`

**Icons**: `assets/favicon-32.png`, `assets/apple-touch-icon.png` (180×180), `assets/icon-192.png`, `assets/icon-512.png`, `assets/icon-512-maskable.png` (+ SVG sources)

**Imagery** (`assets/`): `bg-paper.png`, `tower.png`, `tower-elevation.png`, `floor-units.svg`, `inventory.svg`, `embassy-citadel-logo.svg`
**Bundled media** (all self-contained — previously referenced from a parent folder, now copied in so the deploy works standalone on Netlify and caches fully offline):
- `assets/photography/` — 12 hero + brochure + bridge JPEGs (about / amenities / gallery / masterplan heroes)
- `assets/presentation/` — 33 gallery slide JPEGs (`pg-01`…`pg-56`)
- `assets/generated/` — 3 amenities hero PNGs (pool / sky-lounge / skyline)
- `assets/references/` — 3 tower reference PNGs · `assets/masterplan/site-plan.png` · `assets/intro-v2/building.png`

---

## Test offline

1. Open `intro.html` once with the network on (populates the SW cache).
2. Disable wifi / enable airplane mode.
3. Reload — every screen still loads from cache.

Verified: 5/5 random screens load offline after first visit.

---

## Updating

After edits, bump `CACHE` in `sw.js` to a new version (e.g. `citadel-v16` → `citadel-v17`) and re-upload. Already-installed apps auto-invalidate the old cache on next launch.

If you maintain a separate source folder (e.g. `../v4/`), sync to deploy:

```bash
rsync -a --delete "../v4/" "./" --exclude '.DS_Store'
```
