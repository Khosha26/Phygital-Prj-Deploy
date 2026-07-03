// ============================================================================
// UNI_SESSION — walk-in journey tracker for the Sales-Desk mini-CRM.
// ----------------------------------------------------------------------------
// A tiny vanilla store (no framework) that lives on window so EVERY screen and
// the route dispatcher can feed it, while React components subscribe for live
// updates. It powers three things the sales floor asked for:
//   1. a SELECTED customer → personalises the home welcome,
//   2. a live SESSION → captures which screens/tools were used, for how long,
//      how many were never opened, and every button tap during the visit,
//   3. an ENDED session → a saved, reportable record (disposition, priority,
//      follow-up, remark) kept in localStorage so a report can be reopened.
// Date.now()/new Date() are fine here (browser runtime), unlike workflow scripts.
// ============================================================================
(function () {
  if (typeof window === 'undefined' || window.UNI_SESSION) return;

  const HKEY = 'uni_session_history_v1';

  // Auto-end a walk-in that's been left idle so an abandoned visit is still
  // captured (as an INCOMPLETE record) instead of lingering forever. Tunable.
  const IDLE_MS = 15 * 60 * 1000;         // 15 minutes of no screen activity
  const IDLE_CHECK_MS = 30 * 1000;        // how often we test for idleness
  const MOVE_DEBOUNCE_MS = 3 * 1000;      // throttle for noisy pointermove/scroll

  // The home "tools" a customer can use. notUsed is computed against these.
  const TRACK_MODULES = ['story','location','masterplan','residences','amenities','gallery','inventory','tools','booking'];
  const LABELS = {
    home:'Home', story:'The Story', location:'Location', masterplan:'Master Plan',
    'masterplan-explorer':'Plan Explorer', residences:'Residences', amenities:'Amenities',
    gallery:'Gallery', inventory:'Inventory', floors:'Floor Select', floor:'Floor Plate',
    unit:'Unit Detail', tools:'Calculators', booking:'Booking', explore:'Explore',
    splash:'Cover', 'splash-dark':'Cover',
  };
  // child route → the parent module it belongs to (for "used / not used")
  const ROLLUP = { floors:'inventory', floor:'inventory', unit:'inventory', 'masterplan-explorer':'masterplan' };

  const now = () => Date.now();
  const loadHist = () => { try { return JSON.parse(localStorage.getItem(HKEY)) || []; } catch (e) { return []; } };
  const saveHist = (h) => { try { localStorage.setItem(HKEY, JSON.stringify(h.slice(0, 50))); } catch (e) {} };

  const S = {
    customer: null,   // selected customer (drives the personalised welcome)
    active: false,    // a journey is being tracked
    startedAt: 0,
    lastActivity: 0,  // ts of last user activity — drives the idle auto-end
    screen: null,     // current screen path
    screenAt: 0,      // when the current screen was entered
    times: {},        // path → accumulated ms
    visits: {},       // path → visit count
    events: [],       // { t, label, screen } for each button tap
    history: loadHist(),
    listeners: new Set(),
  };

  const emit = () => S.listeners.forEach((fn) => { try { fn(); } catch (e) {} });

  function flushScreen() {
    if (S.active && S.screen && S.screenAt) {
      S.times[S.screen] = (S.times[S.screen] || 0) + (now() - S.screenAt);
      S.screenAt = now(); // re-anchor so a live snapshot never double-counts
    }
  }

  function label(path) { return LABELS[path] || (path ? path[0].toUpperCase() + path.slice(1) : '—'); }

  function buildReport(wrap) {
    flushScreen();
    const used = new Set();
    Object.keys(S.visits).forEach((p) => used.add(ROLLUP[p] || p));
    const screens = Object.entries(S.times)
      .map(([p, ms]) => ({ path: p, label: label(p), ms, visits: S.visits[p] || 0 }))
      .sort((a, b) => b.ms - a.ms);
    const notUsed = TRACK_MODULES.filter((m) => !used.has(m)).map((m) => ({ path: m, label: label(m) }));
    return {
      id: 'RPT-' + S.startedAt,
      customer: S.customer ? { id: S.customer.id, name: S.customer.name, initials: S.customer.initials, phone: S.customer.phone, email: S.customer.email } : null,
      startedAt: S.startedAt,
      endedAt: now(),
      durationMs: S.startedAt ? now() - S.startedAt : 0,
      screens,
      notUsed,
      events: S.events.slice(-60),
      eventCount: S.events.length,
      topScreen: screens[0] || null,
      modulesUsed: TRACK_MODULES.length - notUsed.length,
      modulesTotal: TRACK_MODULES.length,
      ...(wrap || {}),
    };
  }

  const API = {
    TRACK_MODULES,
    label,
    // — selection (personalisation) —
    setCustomer(c) { S.customer = c; emit(); },
    getCustomer() { return S.customer; },
    // — session lifecycle —
    isActive() { return S.active; },
    start(c) {
      if (c) S.customer = c;
      S.active = true;
      S.startedAt = now();
      S.lastActivity = now();  // fresh session counts as activity right now
      S.times = {}; S.visits = {}; S.events = [];
      S.screen = null; S.screenAt = 0;
      API.trackScreen('home');
      emit();
    },
    trackScreen(path) {
      if (!S.active || !path) return;
      flushScreen();
      S.screen = path;
      S.screenAt = now();
      S.visits[path] = (S.visits[path] || 0) + 1;
      emit();
    },
    trackTap(label) {
      if (!S.active || !label) return;
      S.events.push({ t: now(), label: String(label).slice(0, 44), screen: S.screen });
    },
    elapsed() { return S.active && S.startedAt ? now() - S.startedAt : 0; },
    // live preview of the report without ending the session
    snapshot() { return buildReport(); },
    end(wrap) {
      if (!S.active) return null;
      const report = buildReport(wrap);
      S.history.unshift(report);
      saveHist(S.history);
      S.active = false;
      S.customer = null;
      S.screen = null; S.screenAt = 0;
      emit();
      return report;
    },
    getHistory() { return S.history; },
    subscribe(fn) { S.listeners.add(fn); return () => S.listeners.delete(fn); },
  };

  // — global tap capture — logs every button/link tap during an active session.
  // Skips anything inside the CRM panel itself (data-crm) so ending the journey
  // doesn't pollute the customer's own interaction log.
  document.addEventListener('click', (e) => {
    if (!S.active) return;
    // ignore every tap inside the Sales-Desk console (starting/ending the
    // journey is the salesperson's action, not the customer's exploration)
    if (e.target.closest && e.target.closest('[data-crm]')) return;
    let n = e.target, hops = 0, hit = false, lbl = '';
    while (n && n.nodeType === 1 && hops < 6) {
      const tag = n.tagName;
      const role = n.getAttribute && n.getAttribute('role');
      let clickable = (tag === 'BUTTON' || tag === 'A' || role === 'button');
      // home module circles + dock are pointer-cursor <div>s, not <button>s —
      // treat any pointer-cursor element as a tappable control.
      if (!clickable) { try { clickable = getComputedStyle(n).cursor === 'pointer'; } catch (e2) {} }
      if (clickable) {
        hit = true;
        const txt = ((n.getAttribute && n.getAttribute('aria-label')) || n.textContent || '').replace(/\s+/g, ' ').trim();
        if (txt) { lbl = txt; break; }   // labelled control — done
        // unlabelled (e.g. an icon) → keep climbing for a labelled wrapper
      }
      n = n.parentElement; hops++;
    }
    if (hit) API.trackTap(lbl || ('Tap · ' + label(S.screen)));
  }, true);

  // — idle auto-end — a walk-in left untouched for IDLE_MS is ended and saved as
  // an INCOMPLETE record, so abandoned visits are captured rather than lost. We
  // only track a "last activity" timestamp here; navigation (e.g. back to the
  // attract screen) is another module's concern, signalled via a CustomEvent.
  let lastMoveBump = 0;

  function bumpActivity() { S.lastActivity = now(); }

  // pointermove / wheel / scroll fire in bursts — throttle so we don't thrash.
  function bumpActivityThrottled() {
    const t = now();
    if (t - lastMoveBump < MOVE_DEBOUNCE_MS) return;
    lastMoveBump = t;
    S.lastActivity = t;
  }

  function autoEndIfIdle() {
    if (typeof window === 'undefined') return;
    if (!S.active) return;                       // idempotent: nothing to end
    if (now() - S.lastActivity < IDLE_MS) return;
    // end() is itself a no-op once inactive, so this can't double-save.
    const report = API.end({
      incomplete: true,
      endedReason: 'idle-timeout',
      disposition: 'Incomplete — idle timeout (15 min)',
    });
    if (report) {
      try { window.dispatchEvent(new CustomEvent('uni-session-timeout', { detail: report })); } catch (e) {}
    }
  }

  if (typeof window !== 'undefined') {
    const passiveCapture = { passive: true, capture: true };
    ['pointerdown', 'click', 'keydown', 'touchstart'].forEach((ev) =>
      window.addEventListener(ev, bumpActivity, passiveCapture));
    ['pointermove', 'wheel', 'scroll'].forEach((ev) =>
      window.addEventListener(ev, bumpActivityThrottled, passiveCapture));
    setInterval(autoEndIfIdle, IDLE_CHECK_MS);
  }

  window.UNI_SESSION = API;

  // React bridge — re-renders a component whenever the session changes.
  window.useUniSession = function () {
    const [, force] = React.useState(0);
    React.useEffect(() => window.UNI_SESSION.subscribe(() => force((x) => x + 1)), []);
    return window.UNI_SESSION;
  };
})();
