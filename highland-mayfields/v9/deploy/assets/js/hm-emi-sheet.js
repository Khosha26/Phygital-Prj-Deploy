/* ===== HM PRICE SHEET — self-contained, namespaced HMPriceSheet =====
   Floating right-side drawer with 3 tabs:
     1. Payment Plans  — BSP input (total ₹ OR rate/sq.ft) + plan switcher + milestone schedule
     2. Charges        — BSP-inclusive / additional / super & elite finishing / PLC / key terms
     3. EMI Calculator — price + down-payment + rate + tenure → monthly EMI
   Data source of truth: data/payment.json (BSP is sales-entered; never fabricated).
   ================================================================= */
(function () {
  if (window.HMPriceSheet) return; // idempotent

  var SUPER_SQFT_FALLBACK = 2770;

  /* ---------- data path detection (loaded from home.html AND screens/*.html) ---------- */
  function dataPaths() {
    var inScreens = location.pathname.indexOf('/screens/') !== -1;
    return inScreens
      ? ['../data/payment.json', 'data/payment.json']
      : ['data/payment.json', '../data/payment.json'];
  }
  function loadData() {
    var paths = dataPaths();
    function tryPath(i) {
      if (i >= paths.length) return Promise.reject(new Error('payment.json not found'));
      return fetch(paths[i], { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .catch(function () { return tryPath(i + 1); });
    }
    return tryPath(0);
  }

  /* ---------- formatting (Indian system) ---------- */
  function fmtINR(n) {
    if (n == null || !isFinite(n)) return '';
    n = Math.round(n);
    var sign = n < 0 ? '-' : '';
    var s = String(Math.abs(n));
    var last3 = s.slice(-3), rest = s.slice(0, -3);
    if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); last3 = ',' + last3; }
    return sign + '₹' + rest + last3;
  }
  function fmtNum(n) { return fmtINR(n).replace('₹', ''); }
  function approx(n) {
    if (!isFinite(n) || n <= 0) return '';
    if (n >= 1e7) return '≈ ₹' + (n / 1e7).toFixed(2) + ' Cr';
    if (n >= 1e5) return '≈ ₹' + (n / 1e5).toFixed(2) + ' L';
    return '';
  }
  function digits(str) { var d = (str || '').replace(/[^\d]/g, ''); return d ? parseInt(d, 10) : 0; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- EMI math ---------- */
  function calcEMI(P, annual, years) {
    if (!P || P <= 0) return null;
    var r = annual / 12 / 100, n = years * 12, emi;
    if (r === 0) emi = P / n;
    else { var pow = Math.pow(1 + r, n); emi = P * r * pow / (pow - 1); }
    return { emi: emi, total: emi * n, interest: emi * n - P };
  }

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- shared session state ---------- */
  var state = {
    bsp: 0,            // resolved total base sale price (₹)
    bspMode: 'total',  // 'total' | 'rate'
    plan: 0,           // active plan index
    superSqft: SUPER_SQFT_FALLBACK,
    data: null
  };

  /* ---------- build shell DOM ---------- */
  var root = document.createElement('div');
  root.id = 'hmps-root';
  root.setAttribute('aria-hidden', 'true');

  root.innerHTML =
    '<div id="hmps-scrim" data-hmps-dismiss></div>' +
    '<aside id="hmps-drawer" role="dialog" aria-modal="false" aria-labelledby="hmps-title" tabindex="-1">' +
      '<div class="hmps-head">' +
        '<div>' +
          '<p class="hmps-eyebrow">Highland Mayfields · Tower 7 &amp; 8</p>' +
          '<h2 class="hmps-title" id="hmps-title">Payment &amp; Pricing</h2>' +
          '<p class="hmps-sub">3 BHK + 3W · Indicative</p>' +
        '</div>' +
        '<button class="hmps-close" type="button" aria-label="Close" data-hmps-dismiss>&times;</button>' +
      '</div>' +

      '<div class="hmps-tabs" role="tablist" aria-label="Pricing sheet">' +
        '<button class="hmps-tab" id="hmps-tab-plans" role="tab" aria-selected="true" aria-controls="hmps-p-plans">Payment Plans</button>' +
        '<button class="hmps-tab" id="hmps-tab-charges" role="tab" aria-selected="false" aria-controls="hmps-p-charges">Charges</button>' +
        '<button class="hmps-tab" id="hmps-tab-emi" role="tab" aria-selected="false" aria-controls="hmps-p-emi">EMI</button>' +
      '</div>' +

      '<div class="hmps-body">' +

        /* ---- PLANS panel ---- */
        '<section class="hmps-panel hmps-active" id="hmps-p-plans" role="tabpanel" aria-labelledby="hmps-tab-plans">' +
          '<div class="hmps-bsp">' +
            '<div class="hmps-frow">' +
              '<span class="hmps-flabel">Price (BSP)</span>' +
              '<div class="hmps-seg" role="group" aria-label="Price entry mode">' +
                '<button type="button" class="hmps-seg-b hmps-on" data-bsp-mode="total">Total ₹</button>' +
                '<button type="button" class="hmps-seg-b" data-bsp-mode="rate">Rate / sq.ft</button>' +
              '</div>' +
            '</div>' +
            '<div class="hmps-bsp-inwrap">' +
              '<input class="hmps-amt-in" id="hmps-bsp" type="text" inputmode="numeric" ' +
                'placeholder="Enter total base price (₹)" aria-label="Base sale price">' +
            '</div>' +
            '<p class="hmps-amt-hint" id="hmps-bsp-hint">Enter the agreed base price to build the schedule.</p>' +
          '</div>' +

          '<div class="hmps-chips" id="hmps-plan-chips" role="tablist" aria-label="Payment plan"></div>' +
          '<p class="hmps-plan-tag" id="hmps-plan-tag"></p>' +
          '<div class="hmps-sched" id="hmps-plan-table" aria-live="polite"></div>' +
          '<p class="hmps-disclaim">Indicative — BSP entered by sales; final terms per Apartment Buyer Agreement.</p>' +
        '</section>' +

        /* ---- CHARGES panel ---- */
        '<section class="hmps-panel" id="hmps-p-charges" role="tabpanel" aria-labelledby="hmps-tab-charges">' +
          '<div id="hmps-charges"></div>' +
        '</section>' +

        /* ---- EMI panel ---- */
        '<section class="hmps-panel" id="hmps-p-emi" role="tabpanel" aria-labelledby="hmps-tab-emi">' +
          '<div class="hmps-field">' +
            '<div class="hmps-frow"><span class="hmps-flabel">Property Price</span></div>' +
            '<input class="hmps-amt-in" id="hmps-price" type="text" inputmode="numeric" placeholder="Enter price (₹)" aria-label="Property price in rupees">' +
            '<p class="hmps-amt-hint" id="hmps-price-hint"></p>' +
          '</div>' +
          '<div class="hmps-field">' +
            '<div class="hmps-frow"><span class="hmps-flabel">Down Payment</span><span class="hmps-fval" id="hmps-dp-v">20%</span></div>' +
            '<input class="hmps-range" id="hmps-dp" type="range" min="10" max="50" step="1" value="20" aria-label="Down payment percent">' +
          '</div>' +
          '<div class="hmps-field">' +
            '<div class="hmps-frow"><span class="hmps-flabel">Interest Rate</span><span class="hmps-fval" id="hmps-rt-v">8.50%</span></div>' +
            '<input class="hmps-range" id="hmps-rt" type="range" min="7" max="12" step="0.05" value="8.5" aria-label="Interest rate percent">' +
          '</div>' +
          '<div class="hmps-field">' +
            '<div class="hmps-frow"><span class="hmps-flabel">Tenure</span><span class="hmps-fval" id="hmps-tn-v">20 yrs</span></div>' +
            '<input class="hmps-range" id="hmps-tn" type="range" min="5" max="30" step="1" value="20" aria-label="Loan tenure years">' +
          '</div>' +
          '<div class="hmps-results">' +
            '<div class="hmps-emi">' +
              '<p class="hmps-emi-lab">Monthly EMI</p>' +
              '<p class="hmps-emi-val" id="hmps-emi"><span class="hmps-emi-empty">Enter a property price</span></p>' +
              '<p class="hmps-emi-cr" id="hmps-emi-cr"></p>' +
            '</div>' +
            '<div class="hmps-grid">' +
              '<div class="hmps-cell"><p class="hmps-cell-lab">Loan Amount</p><p class="hmps-cell-val" id="hmps-loan">—</p></div>' +
              '<div class="hmps-cell"><p class="hmps-cell-lab">Total Interest</p><p class="hmps-cell-val" id="hmps-int">—</p></div>' +
              '<div class="hmps-cell"><p class="hmps-cell-lab">Total Payable</p><p class="hmps-cell-val" id="hmps-pay">—</p></div>' +
            '</div>' +
            '<p class="hmps-disclaim">Indicative computation. Final rates, eligibility and charges are set by the lender.</p>' +
          '</div>' +
        '</section>' +
      '</div>' +
    '</aside>';

  function attach() {
    (document.body || document.documentElement).appendChild(root);

    var drawer   = root.querySelector('#hmps-drawer');
    var tabPlans = root.querySelector('#hmps-tab-plans');
    var tabChg   = root.querySelector('#hmps-tab-charges');
    var tabEmi   = root.querySelector('#hmps-tab-emi');
    var panPlans = root.querySelector('#hmps-p-plans');
    var panChg   = root.querySelector('#hmps-p-charges');
    var panEmi   = root.querySelector('#hmps-p-emi');
    var lastFocus = null;
    var emiPrefilled = false;

    /* ---- tabs ---- */
    function selectTab(which) {
      var map = { plans: tabPlans, charges: tabChg, emi: tabEmi };
      var pans = { plans: panPlans, charges: panChg, emi: panEmi };
      Object.keys(map).forEach(function (k) {
        var on = k === which;
        map[k].setAttribute('aria-selected', on ? 'true' : 'false');
        pans[k].classList.toggle('hmps-active', on);
      });
      if (which === 'emi') maybePrefillEmi();
    }
    tabPlans.addEventListener('click', function () { selectTab('plans'); });
    tabChg.addEventListener('click',   function () { selectTab('charges'); });
    tabEmi.addEventListener('click',   function () { selectTab('emi'); });

    /* ================= PLANS ================= */
    var bspIn   = root.querySelector('#hmps-bsp');
    var bspHint = root.querySelector('#hmps-bsp-hint');
    var bspSeg  = root.querySelectorAll('[data-bsp-mode]');
    var chipsEl = root.querySelector('#hmps-plan-chips');
    var planTag = root.querySelector('#hmps-plan-tag');
    var tableEl = root.querySelector('#hmps-plan-table');

    function resolveBsp() {
      var raw = digits(bspIn.value);
      state.bsp = state.bspMode === 'rate' ? raw * state.superSqft : raw;
      // BSP hint
      if (!raw) {
        bspHint.textContent = 'Enter the agreed base price to build the schedule.';
      } else if (state.bspMode === 'rate') {
        bspHint.textContent = fmtNum(raw) + '/sq.ft × ' + fmtNum(state.superSqft) +
          ' sq.ft  =  ' + fmtINR(state.bsp) + '  ' + approx(state.bsp);
      } else {
        bspHint.textContent = fmtINR(state.bsp) + '  ' + approx(state.bsp);
      }
    }

    bspIn.addEventListener('input', function () { resolveBsp(); renderSchedule(); });

    bspSeg.forEach(function (b) {
      b.addEventListener('click', function () {
        var mode = b.getAttribute('data-bsp-mode');
        if (mode === state.bspMode) return;
        state.bspMode = mode;
        bspSeg.forEach(function (x) { x.classList.toggle('hmps-on', x === b); });
        bspIn.placeholder = mode === 'rate'
          ? 'Enter rate per sq.ft (₹)' : 'Enter total base price (₹)';
        resolveBsp(); renderSchedule();
      });
    });

    function renderChips() {
      if (!state.data) return;
      chipsEl.innerHTML = state.data.plans.map(function (p, i) {
        return '<button type="button" class="hmps-chip' + (i === state.plan ? ' hmps-on' : '') +
          '" role="tab" aria-selected="' + (i === state.plan) + '" data-plan="' + i + '">' +
          '<span class="hmps-chip-c">' + esc(p.code) + '</span>' +
          '<span class="hmps-chip-s">' + esc(p.short) + '</span></button>';
      }).join('');
      Array.prototype.forEach.call(chipsEl.querySelectorAll('[data-plan]'), function (c) {
        c.addEventListener('click', function () {
          var i = +c.getAttribute('data-plan');
          if (i === state.plan) return;
          state.plan = i;
          Array.prototype.forEach.call(chipsEl.querySelectorAll('[data-plan]'), function (x) {
            var on = +x.getAttribute('data-plan') === i;
            x.classList.toggle('hmps-on', on);
            x.setAttribute('aria-selected', on);
          });
          renderSchedule(true);
        });
      });
    }

    function renderSchedule(animate) {
      if (!state.data) return;
      var plan = state.data.plans[state.plan];
      if (!plan) return;
      planTag.textContent = (plan.name ? plan.name : '') +
        (plan.tagline ? ' — ' + plan.tagline : '');

      var bsp = state.bsp;
      var rows = plan.milestones.map(function (m) {
        var amt = bsp > 0 ? fmtINR(bsp * m.pct / 100) : '—';
        var extra = m.extra ? '<span class="hmps-extra">' + esc(m.extra) + '</span>' : '';
        return '<tr>' +
          '<td class="hmps-st"><span class="hmps-st-name">' + esc(m.stage) + '</span>' + extra + '</td>' +
          '<td class="hmps-pc">' + m.pct + '%</td>' +
          '<td class="hmps-am">' + amt + '</td>' +
          '</tr>';
      }).join('');

      var totalPct = plan.milestones.reduce(function (a, m) { return a + m.pct; }, 0);
      var totalAmt = bsp > 0 ? fmtINR(bsp) : '—';

      var html =
        '<table class="hmps-mtable"><thead><tr>' +
          '<th>Stage</th><th class="hmps-pc">%</th><th class="hmps-am">Amount</th>' +
        '</tr></thead><tbody>' + rows + '</tbody>' +
        '<tfoot><tr>' +
          '<td class="hmps-st"><span class="hmps-st-name">Total (BSP)</span></td>' +
          '<td class="hmps-pc">' + totalPct + '%</td>' +
          '<td class="hmps-am">' + totalAmt + '</td>' +
        '</tr></tfoot></table>';

      if (animate && !reduceMotion) {
        tableEl.classList.remove('hmps-swap');
        // force reflow then re-add for retrigger
        void tableEl.offsetWidth;
        tableEl.innerHTML = html;
        tableEl.classList.add('hmps-swap');
      } else {
        tableEl.innerHTML = html;
      }
    }

    /* ================= CHARGES ================= */
    function chargeSection(sec, optsRender) {
      if (!sec) return '';
      var head = '<div class="hmps-csec-head">' +
        '<span class="hmps-csec-label">' + esc(sec.label) + '</span>';
      if (sec.tag) {
        var optional = /optional/i.test(sec.tag);
        head += '<span class="hmps-tagchip' + (optional ? ' hmps-tag-opt' : '') + '">' + esc(sec.tag) + '</span>';
      }
      head += '</div>';
      var meta = '';
      if (sec.note)   meta += '<span class="hmps-csec-note">' + esc(sec.note) + '</span>';
      if (sec.saving) meta += '<span class="hmps-csec-save">Saving · ' + esc(sec.saving) + '</span>';
      if (meta) meta = '<div class="hmps-csec-meta">' + meta + '</div>';

      var items = (sec.items || []).map(function (it) {
        var name = '<span class="hmps-it-name' + (it.highlight ? ' hmps-it-hi' : '') + '">' + esc(it.name) + '</span>';
        var sub = it.sub ? '<span class="hmps-it-sub">' + esc(it.sub) + '</span>' : '';
        var right = it.rate
          ? '<span class="hmps-it-rate">' + esc(it.rate) + '</span>'
          : (it.desc ? '<span class="hmps-it-desc">' + esc(it.desc) + '</span>' : '');
        return '<div class="hmps-it">' +
          '<div class="hmps-it-l">' + name + sub + '</div>' +
          (right ? '<div class="hmps-it-r">' + right + '</div>' : '') +
          '</div>';
      }).join('');

      return '<div class="hmps-csec">' + head + meta + '<div class="hmps-it-list">' + items + '</div></div>';
    }

    function renderCharges() {
      if (!state.data) return;
      var d = state.data;
      var html = '';
      html += chargeSection(d.bspInclusive);
      html += chargeSection(d.additional);
      html += chargeSection(d.superFinishing);
      html += chargeSection(d.eliteFinishing);

      // PLC table
      if (d.plc) {
        var prows = (d.plc.rows || []).map(function (r) {
          return '<tr><td>' + esc(r.floor) + '</td><td class="hmps-pc">' + esc(r.floorPlc) +
            '</td><td class="hmps-pc">' + esc(r.facing) + '</td></tr>';
        }).join('');
        html += '<div class="hmps-csec">' +
          '<div class="hmps-csec-head"><span class="hmps-csec-label">' + esc(d.plc.label) + '</span></div>' +
          '<table class="hmps-plc"><thead><tr><th>Floor</th><th class="hmps-pc">Floor PLC</th><th class="hmps-pc">Facing</th></tr></thead>' +
          '<tbody>' + prows + '</tbody></table>' +
          (d.plc.facingNote ? '<p class="hmps-csec-note hmps-plc-note">' + esc(d.plc.facingNote) + '</p>' : '') +
          '</div>';
      }

      // key terms (small print — first few)
      if (d.terms && d.terms.length) {
        var keep = d.terms.slice(0, 4);
        html += '<div class="hmps-terms"><p class="hmps-terms-h">Key Terms</p><ul>' +
          keep.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') +
          '</ul></div>';
      }

      html += '<p class="hmps-disclaim">' +
        esc((d._meta && d._meta.disclaimer) || 'All prices indicative — Apartment Buyer Agreement shall supersede.') +
        '</p>';

      root.querySelector('#hmps-charges').innerHTML = html;
    }

    /* ================= EMI ================= */
    var dp = root.querySelector('#hmps-dp'), rt = root.querySelector('#hmps-rt'), tn = root.querySelector('#hmps-tn');
    var dpV = root.querySelector('#hmps-dp-v'), rtV = root.querySelector('#hmps-rt-v'), tnV = root.querySelector('#hmps-tn-v');
    var priceIn = root.querySelector('#hmps-price'), priceHint = root.querySelector('#hmps-price-hint');
    var emiEl = root.querySelector('#hmps-emi'), emiCr = root.querySelector('#hmps-emi-cr');
    var loanEl = root.querySelector('#hmps-loan'), intEl = root.querySelector('#hmps-int'), payEl = root.querySelector('#hmps-pay');

    function fillTrack(el) {
      var min = +el.min, max = +el.max;
      el.style.setProperty('--hmps-fill', ((el.value - min) / (max - min) * 100) + '%');
    }
    function recomputeEmi() {
      var P = digits(priceIn.value);
      priceHint.textContent = P ? approx(P) : '';
      var dpPct = +dp.value, rate = +rt.value, yrs = +tn.value;
      var loan = P > 0 ? P * (1 - dpPct / 100) : 0;
      var res = calcEMI(loan, rate, yrs);
      if (!res) {
        emiEl.innerHTML = '<span class="hmps-emi-empty">Enter a property price</span>';
        emiCr.textContent = '';
        loanEl.textContent = intEl.textContent = payEl.textContent = '—';
        return;
      }
      emiEl.textContent = fmtINR(res.emi) + ' /mo';
      emiCr.textContent = approx(res.emi);
      loanEl.textContent = fmtINR(loan);
      intEl.textContent  = fmtINR(res.interest);
      payEl.textContent  = fmtINR(loan + res.interest);
    }
    function maybePrefillEmi() {
      if (emiPrefilled) return;
      if (state.bsp > 0 && !digits(priceIn.value)) {
        priceIn.value = fmtNum(state.bsp);
        emiPrefilled = true;
        recomputeEmi();
      }
    }
    dp.addEventListener('input', function () { dpV.textContent = dp.value + '%'; fillTrack(dp); recomputeEmi(); });
    rt.addEventListener('input', function () { rtV.textContent = (+rt.value).toFixed(2) + '%'; fillTrack(rt); recomputeEmi(); });
    tn.addEventListener('input', function () { tnV.textContent = tn.value + ' yrs'; fillTrack(tn); recomputeEmi(); });
    priceIn.addEventListener('input', function () { emiPrefilled = true; recomputeEmi(); });
    [dp, rt, tn].forEach(fillTrack);

    /* ---- Escape closes (non-modal palette: no focus trap, screen behind stays usable) ---- */
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); api.close(); }
    }

    /* only the ✕ (data-hmps-dismiss) closes — no scrim / outside-click dismiss */
    root.addEventListener('click', function (e) {
      var t = e.target;
      if (t.hasAttribute && t.hasAttribute('data-hmps-dismiss')) api.close();
    });

    /* ---- drag the window by its header (mouse + touch via Pointer Events) ---- */
    var head = root.querySelector('.hmps-head');
    var dragX = 0, dragY = 0;            // current offset from centred origin (px)
    var dragging = false, sX = 0, sY = 0, sDX = 0, sDY = 0;

    function setOffset(x, y) {
      dragX = x; dragY = y;
      drawer.style.setProperty('--hmps-dx', x + 'px');
      drawer.style.setProperty('--hmps-dy', y + 'px');
    }
    function clampMag(v, m) { return Math.max(-m, Math.min(m, v)); }

    head.addEventListener('pointerdown', function (e) {
      if (e.target.closest && e.target.closest('.hmps-close')) return; // let ✕ work
      dragging = true; sX = e.clientX; sY = e.clientY; sDX = dragX; sDY = dragY;
      drawer.classList.add('hmps-dragging');
      try { head.setPointerCapture(e.pointerId); } catch (_) {}
    });
    head.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var r = drawer.getBoundingClientRect();
      var maxX = Math.max(0, (window.innerWidth  - r.width)  / 2);
      var maxY = Math.max(0, (window.innerHeight - r.height) / 2);
      setOffset(clampMag(sDX + (e.clientX - sX), maxX),
                clampMag(sDY + (e.clientY - sY), maxY));
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      drawer.classList.remove('hmps-dragging');
      try { head.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    head.addEventListener('pointerup', endDrag);
    head.addEventListener('pointercancel', endDrag);

    var api = {
      open: function () {
        if (root.classList.contains('hmps-open')) return;
        lastFocus = document.activeElement;
        setOffset(0, 0);                 // always open centred, then drag from there
        root.classList.add('hmps-open');
        root.setAttribute('aria-hidden', 'false');
        document.addEventListener('keydown', onKey, true);
        var btn = drawer.querySelector('.hmps-close');
        if (btn) setTimeout(function () { btn.focus(); }, 60);
      },
      close: function () {
        if (!root.classList.contains('hmps-open')) return;
        root.classList.remove('hmps-open');
        root.setAttribute('aria-hidden', 'true');
        document.removeEventListener('keydown', onKey, true);
        if (lastFocus && lastFocus.focus) lastFocus.focus();
      },
      toggle: function () { root.classList.contains('hmps-open') ? this.close() : this.open(); },
      selectTab: selectTab
    };
    window.HMPriceSheet = api;

    /* auto-wire any [data-hmps-open] trigger */
    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-hmps-open]') : null;
      if (t) { e.preventDefault(); api.open(); }
    });

    /* ---- load data + populate ---- */
    loadData().then(function (d) {
      state.data = d;
      state.superSqft = (d._meta && d._meta.config && d._meta.config.superSqft) ||
        (d.config && d.config.superSqft) || SUPER_SQFT_FALLBACK;
      renderChips();
      renderSchedule();
      renderCharges();
    }).catch(function (err) {
      tableEl.innerHTML = '<p class="hmps-amt-hint">Unable to load payment plans. ' + esc(err.message) + '</p>';
      root.querySelector('#hmps-charges').innerHTML = '<p class="hmps-amt-hint">Unable to load charges.</p>';
    });

    recomputeEmi();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();
})();
