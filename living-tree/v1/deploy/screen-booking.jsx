// ============================================================
// BookingScreen — multi-step EOI / booking flow
// Steps: 1 Customer · 2 Unit · 3 Loan · 4 Payment · 5 Review · 6 Confirmed
// ============================================================

(function () {
  /* ── inject keyframes once ── */
  if (!document.getElementById("bk-styles")) {
    const s = document.createElement("style");
    s.id = "bk-styles";
    s.textContent = `
      @keyframes bkFadeUp   { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
      @keyframes bkFadeIn   { from { opacity:0; } to { opacity:1; } }
      @keyframes bkSlideR   { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
      @keyframes bkSlideL   { from { opacity:0; transform:translateX(-40px); } to { opacity:1; transform:translateX(0); } }
      @keyframes bkScalePop { from { opacity:0; transform:scale(0.86); } to { opacity:1; transform:scale(1); } }
      @keyframes bkPulse    { 0%,100%{ box-shadow:0 0 0 0 rgba(217,178,122,0.45);} 50%{box-shadow:0 0 0 12px rgba(217,178,122,0);} }
      @keyframes bkSeal     { 0%{ opacity:0; transform:scale(0.5) rotate(-20deg); } 60%{ transform:scale(1.1) rotate(3deg); } 100%{ opacity:1; transform:scale(1) rotate(0deg); } }
      @keyframes bkCheck    { from{ stroke-dashoffset:80; } to{ stroke-dashoffset:0; } }
      @keyframes bkGlow     { 0%,100%{ opacity:0.6; } 50%{ opacity:1; } }
      @keyframes bkBreathe  { 0%,100%{ transform:scale(1); } 50%{ transform:scale(1.03); } }
      @keyframes bkNudge    { 0%,100%{ transform:translateX(0);} 50%{transform:translateX(4px);} }
      @keyframes bkConfettiDrop {
        0%   { transform: translateY(-20px) rotate(0deg); opacity:1; }
        100% { transform: translateY(120px) rotate(720deg); opacity:0; }
      }

      /* Scrollbar */
      .bk-scroll::-webkit-scrollbar { width: 4px; }
      .bk-scroll::-webkit-scrollbar-track { background: transparent; }
      .bk-scroll::-webkit-scrollbar-thumb { background: rgba(217,178,122,0.25); border-radius: 4px; }

      /* Input on-theme */
      .bk-input {
        width: 100%; box-sizing: border-box;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(217,178,122,0.22);
        border-radius: 10px; padding: 12px 16px;
        color: #f4ead8; font-family: Inter, sans-serif; font-size: 13px;
        outline: none; transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
      }
      .bk-input::placeholder { color: rgba(244,234,216,0.32); }
      .bk-input:focus {
        border-color: rgba(217,178,122,0.6);
        background: rgba(217,178,122,0.06);
        box-shadow: 0 0 0 3px rgba(217,178,122,0.10);
      }
      .bk-input.bk-error { border-color: rgba(240,100,80,0.6); }
      .bk-input.bk-ok { border-color: rgba(127,185,85,0.55); }

      .bk-select {
        appearance: none; -webkit-appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23d9b27a' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
        background-repeat: no-repeat; background-position: right 14px center;
        padding-right: 36px;
      }
      .bk-select option { background: #13201a; color: #f4ead8; }

      /* Bank chip hover */
      .bk-bank:hover { border-color: rgba(217,178,122,0.6) !important; background: rgba(217,178,122,0.09) !important; transform: translateY(-1px); }
      .bk-bank { transition: all 0.22s; }

      /* CTA button glow on hover */
      .bk-cta:hover { filter: brightness(1.08); transform: translateY(-1px); box-shadow: 0 18px 44px rgba(217,178,122,0.35) !important; }
      .bk-cta { transition: all 0.22s; }

      /* Tower card */
      .bk-tower:hover { border-color: rgba(217,178,122,0.55) !important; background: rgba(217,178,122,0.08) !important; }
      .bk-tower { transition: all 0.22s; }
    `;
    document.head.appendChild(s);
  }

  /* ── constants ── */
  const T = THEME;
  const STEPS = [
    { n: 1, label: "Your Details" },
    { n: 2, label: "Select Unit" },
    { n: 3, label: "Home Loan" },
    { n: 4, label: "Payment Plan" },
    { n: 5, label: "Review" },
    { n: 6, label: "Confirmed" },
  ];

  const PARTNER_BANKS = [
    { id: "hdfc",   name: "HDFC Bank",            color: "#004C8F", badge: "Preferred Partner" },
    { id: "sbi",    name: "State Bank of India",  color: "#2960A2", badge: "Government Bank" },
    { id: "icici",  name: "ICICI Bank",            color: "#F05E23", badge: "" },
    { id: "axis",   name: "Axis Bank",             color: "#800000", badge: "" },
    { id: "lic",    name: "LIC Housing Finance",   color: "#1A6340", badge: "Low EMI" },
    { id: "bajaj",  name: "Bajaj Housing Finance", color: "#003399", badge: "Fast Approval" },
    { id: "kotak",  name: "Kotak Mahindra Bank",   color: "#EF1C21", badge: "" },
  ];

  /* ── payment plan milestones as % of total price ── */
  const PAYMENT_MILESTONES = [
    { label: "Booking Amount",             pct: 0.05,  due: "On Booking",             note: "Token / EOI to block the unit" },
    { label: "Agreement of Sale",          pct: 0.10,  due: "Within 30 days",          note: "Sale Agreement execution" },
    { label: "Foundation & Plinth",        pct: 0.10,  due: "On Completion",           note: "Slab-linked milestone" },
    { label: "Ground Floor Slab",          pct: 0.07,  due: "On Completion",           note: "Structure milestone" },
    { label: "1st – 6th Floor Slab",       pct: 0.10,  due: "On Completion",           note: "Structure milestone" },
    { label: "7th – 12th Floor Slab",      pct: 0.10,  due: "On Completion",           note: "Structure milestone" },
    { label: "13th – 18th Floor Slab",     pct: 0.10,  due: "On Completion",           note: "Structure milestone" },
    { label: "19th – 24th Floor Slab",     pct: 0.10,  due: "On Completion",           note: "Structure milestone" },
    { label: "Brick-work & Plaster",       pct: 0.08,  due: "On Completion",           note: "Internal finishes" },
    { label: "Flooring & Tiling",          pct: 0.05,  due: "On Completion",           note: "Internal finishes" },
    { label: "OC & Handover",              pct: 0.10,  due: "September 2029",          note: "Balance on possession" },
    { label: "GST & Registration",         pct: 0.05,  due: "As applicable",           note: "Statutory charges" },
  ];

  /* ── tiny helpers ── */
  function fINR(n) { return formatINR(n, { decimals: 2 }); }
  function fINRFull(n) { return formatINRFull(n); }
  function generateBookingID() {
    const ts = Date.now().toString(36).toUpperCase();
    const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
    return "LT-" + ts + "-" + rnd;
  }

  /* ── Step Progress Bar ── */
  function StepBar({ current }) {
    return (
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 0, marginBottom: 28 } },
        STEPS.map(function(s, i) {
          const done = s.n < current;
          const active = s.n === current;
          return React.createElement(React.Fragment, { key: s.n },
            React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 } },
              React.createElement("div", {
                style: {
                  width: 30, height: 30, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: done ? 14 : 11, fontWeight: 700,
                  background: done
                    ? "linear-gradient(135deg, " + T.gold + ", " + T.goldDeep + ")"
                    : active ? "rgba(217,178,122,0.18)" : "rgba(255,255,255,0.05)",
                  border: "1.5px solid " + (done ? T.gold : active ? "rgba(217,178,122,0.6)" : "rgba(217,178,122,0.2)"),
                  color: done ? T.ink : active ? T.gold : T.dim,
                  transition: "all 0.4s",
                  boxShadow: active ? "0 0 12px rgba(217,178,122,0.25)" : "none",
                  animation: active ? "bkPulse 2.4s ease infinite" : "none",
                }
              }, done ? "✓" : s.n),
              React.createElement("div", {
                style: {
                  fontSize: 9.5, fontWeight: 600, letterSpacing: 0.4,
                  textTransform: "uppercase",
                  color: active ? T.gold : done ? "rgba(217,178,122,0.75)" : "rgba(244,234,216,0.35)",
                  whiteSpace: "nowrap", transition: "color 0.3s",
                }
              }, s.label)
            ),
            i < STEPS.length - 1 && React.createElement("div", {
              style: {
                flex: 1, height: 1.5, marginBottom: 20, marginLeft: 4, marginRight: 4,
                background: done
                  ? "linear-gradient(90deg, " + T.gold + ", rgba(217,178,122,0.5))"
                  : "rgba(217,178,122,0.15)",
                transition: "background 0.5s",
              }
            })
          );
        })
      )
    );
  }

  /* ── Field wrapper ── */
  function Field({ label, required, children, error }) {
    return (
      React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } },
        React.createElement("label", {
          style: {
            fontSize: 10.5, fontWeight: 600, letterSpacing: 0.8,
            textTransform: "uppercase", color: error ? "rgba(240,120,100,0.9)" : T.gold,
          }
        }, label, required && React.createElement("span", { style: { color: "rgba(240,100,80,0.7)", marginLeft: 3 } }, "*")),
        children,
        error && React.createElement("div", {
          style: { fontSize: 11, color: "rgba(240,110,90,0.85)", letterSpacing: 0.3 }
        }, error)
      )
    );
  }

  /* ── Panel card ── */
  function Panel({ children, style, animate }) {
    style = style || {};
    animate = animate !== false;
    return React.createElement("div", {
      style: Object.assign({
        background: "rgba(19,32,26,0.88)",
        border: "1px solid " + T.line,
        borderRadius: 18,
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.38)",
        animation: animate ? "bkFadeUp 0.45s ease backwards" : "none",
      }, style)
    }, children);
  }

  /* ── STEP 1: Customer Details ── */
  function Step1({ form, setForm, errors, setErrors }) {
    function update(k, v) {
      setForm(function(f) { return Object.assign({}, f, { [k]: v }); });
      if (errors[k]) setErrors(function(e) { return Object.assign({}, e, { [k]: null }); });
    }

    const fields = [
      { key: "name",       label: "Full Name",          placeholder: "e.g. Aravind Kumar",     type: "text",  required: true  },
      { key: "phone",      label: "Mobile Number",      placeholder: "+91 98800 12345",         type: "tel",   required: true  },
      { key: "email",      label: "Email Address",      placeholder: "name@example.com",        type: "email", required: true  },
      { key: "pan",        label: "PAN Number",         placeholder: "ABCPK1234D (optional)",   type: "text",  required: false },
      { key: "occupation", label: "Occupation",         placeholder: "e.g. Software Engineer",  type: "text",  required: false },
      { key: "employer",   label: "Employer / Company", placeholder: "e.g. Wipro Aerospace",    type: "text",  required: false },
    ];

    return React.createElement("div", { style: { animation: "bkSlideR 0.38s ease backwards" } },
      React.createElement("div", {
        style: { fontFamily: T.serif, fontSize: 30, fontWeight: 400, marginBottom: 4, color: T.cream, letterSpacing: 0.3 }
      }, "Tell us about yourself"),
      React.createElement("div", {
        style: { fontSize: 12.5, color: T.dim, marginBottom: 26, letterSpacing: 0.2 }
      }, "Your details are safe with us — shared only with the Kalyani sales team."),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 24px" } },
        fields.map(function(f) {
          return React.createElement(Field, { key: f.key, label: f.label, required: f.required, error: errors[f.key] },
            React.createElement("input", {
              type: f.type,
              className: "bk-input" + (errors[f.key] ? " bk-error" : form[f.key] ? " bk-ok" : ""),
              placeholder: f.placeholder,
              value: form[f.key] || "",
              onChange: function(e) { update(f.key, e.target.value); }
            })
          );
        })
      ),
      React.createElement("div", {
        style: {
          marginTop: 22, padding: "10px 16px", borderRadius: 10,
          background: "rgba(127,185,85,0.08)", border: "1px solid rgba(127,185,85,0.2)",
          fontSize: 11, color: "rgba(244,234,216,0.65)", display: "flex", gap: 10, alignItems: "flex-start",
        }
      },
        React.createElement("span", { style: { color: T.green, fontSize: 14, lineHeight: 1 } }, "🔒"),
        React.createElement("span", null, "Your data is protected under the IT Act, 2000. RERA: " + PROJECT.rera)
      )
    );
  }

  /* ── STEP 2: Select Unit ── */
  function Step2({ form, setForm }) {
    const [selTower,  setSelTower]  = React.useState(form.tower    || null);
    const [selTypo,   setSelTypo]   = React.useState(form.typology || null);
    const [selFloor,  setSelFloor]  = React.useState(form.floor    || "");
    const [selFacing, setSelFacing] = React.useState(form.facing   || "east");

    React.useEffect(function() {
      setForm(function(f) { return Object.assign({}, f, { tower: selTower, typology: selTypo, floor: selFloor, facing: selFacing }); });
    }, [selTower, selTypo, selFloor, selFacing]);

    const availTowers = TOWERS.filter(function(t) { return t.available > 0; });
    const chosenTower = selTower ? TOWERS.find(function(t) { return t.id === selTower; }) : null;
    const availTypos  = TYPOLOGIES.filter(function(ty) { return !ty.soldOut; });
    const chosenTypo  = selTypo ? TYPOLOGIES.find(function(t) { return t.code === selTypo; }) : null;
    const unitPrice   = chosenTypo
      ? (selFacing === "east" ? chosenTypo.east.saleable : chosenTypo.west.saleable) * 9500
      : null;

    return React.createElement("div", { style: { animation: "bkSlideR 0.38s ease backwards" } },
      React.createElement("div", { style: { fontFamily: T.serif, fontSize: 30, fontWeight: 400, marginBottom: 4 } }, "Choose your residence"),
      React.createElement("div", { style: { fontSize: 12.5, color: T.dim, marginBottom: 22 } }, "Select your preferred tower, typology, facing, and floor."),

      /* TOWER GRID */
      React.createElement("div", { style: { marginBottom: 22 } },
        React.createElement("div", { style: { fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: T.gold, marginBottom: 10 } }, "Tower"),
        React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8 } },
          availTowers.map(function(tw) {
            const active = selTower === tw.id;
            return React.createElement("button", {
              key: tw.id, className: "bk-tower",
              onClick: function() { setSelTower(tw.id); },
              style: {
                padding: "9px 16px", borderRadius: 10,
                background: active ? "rgba(217,178,122,0.18)" : "rgba(255,255,255,0.04)",
                border: "1px solid " + (active ? "rgba(217,178,122,0.7)" : "rgba(217,178,122,0.2)"),
                color: active ? T.gold : T.dim, cursor: "pointer",
                fontSize: 12, fontWeight: active ? 700 : 500, letterSpacing: 0.3,
                display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2,
                minWidth: 90, textAlign: "left",
                boxShadow: active ? "0 4px 16px rgba(217,178,122,0.18)" : "none",
              }
            },
              React.createElement("span", { style: { fontSize: 13, fontWeight: 700 } }, tw.name),
              React.createElement("span", { style: { fontSize: 9.5, opacity: 0.75, letterSpacing: 0.4 } }, "T" + tw.no + " · " + tw.available + " avail")
            );
          })
        ),
        chosenTower && React.createElement("div", {
          style: {
            marginTop: 10, padding: "10px 14px", borderRadius: 10,
            background: "rgba(217,178,122,0.06)", border: "1px solid " + T.lineSoft,
            fontSize: 11.5, color: T.dim, animation: "bkFadeIn 0.3s ease",
          }
        },
          React.createElement("span", { style: { color: T.gold, fontWeight: 600 } }, chosenTower.name),
          " · " + chosenTower.view + " · " + chosenTower.cluster + " cluster"
        )
      ),

      /* TYPOLOGY */
      React.createElement("div", { style: { marginBottom: 22 } },
        React.createElement("div", { style: { fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: T.gold, marginBottom: 10 } }, "Typology"),
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
          availTypos.map(function(ty) {
            const active = selTypo === ty.code;
            return React.createElement("button", {
              key: ty.code, className: "bk-tower",
              onClick: function() { setSelTypo(ty.code); },
              style: {
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px", borderRadius: 12, textAlign: "left", cursor: "pointer",
                background: active ? "rgba(217,178,122,0.13)" : "rgba(255,255,255,0.03)",
                border: "1px solid " + (active ? "rgba(217,178,122,0.65)" : "rgba(217,178,122,0.18)"),
                boxShadow: active ? "0 4px 20px rgba(217,178,122,0.15)" : "none",
              }
            },
              React.createElement("div", null,
                React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: active ? T.gold : T.cream } }, ty.name),
                React.createElement("div", { style: { fontSize: 10.5, color: T.dim, marginTop: 2 } }, ty.summary)
              ),
              React.createElement("div", { style: { textAlign: "right", flexShrink: 0, marginLeft: 20 } },
                React.createElement("div", { style: { fontSize: 14, fontWeight: 700, color: T.gold } }, "from " + fINR(ty.priceFrom)),
                React.createElement("div", { style: { fontSize: 9.5, color: T.dim, marginTop: 2 } }, ty.east.saleable + "–" + ty.west.saleable + " sft saleable")
              )
            );
          })
        )
      ),

      /* FACING + FLOOR */
      selTypo && React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, animation: "bkFadeIn 0.4s ease" } },
        React.createElement("div", null,
          React.createElement("div", { style: { fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: T.gold, marginBottom: 10 } }, "Facing"),
          React.createElement("div", { style: { display: "flex", gap: 10 } },
            ["east", "west"].map(function(facing) {
              const facingActive = selFacing === facing;
              return React.createElement("button", {
                key: facing,
                onClick: function() { setSelFacing(facing); },
                style: {
                  flex: 1, padding: "11px 14px", borderRadius: 10, cursor: "pointer",
                  background: facingActive ? "rgba(217,178,122,0.15)" : "rgba(255,255,255,0.04)",
                  border: "1px solid " + (facingActive ? "rgba(217,178,122,0.65)" : "rgba(217,178,122,0.2)"),
                  color: facingActive ? T.gold : T.dim, fontWeight: facingActive ? 700 : 500,
                  fontSize: 12, transition: "all 0.2s", textAlign: "left",
                }
              },
                facing === "east" ? "🌅 East" : "🌇 West",
                chosenTypo && React.createElement("div", { style: { fontSize: 10, marginTop: 3, opacity: 0.75, fontWeight: 400 } },
                  facing === "east" ? chosenTypo.east.view : chosenTypo.west.view
                )
              );
            })
          )
        ),
        React.createElement("div", null,
          React.createElement("div", { style: { fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: T.gold, marginBottom: 10 } }, "Preferred Floor"),
          React.createElement("select", {
            className: "bk-input bk-select",
            value: selFloor,
            onChange: function(e) { setSelFloor(e.target.value); }
          },
            React.createElement("option", { value: "" }, "Any available floor"),
            Array.from({ length: 24 }, function(_, i) { return i + 1; }).map(function(fl) {
              return React.createElement("option", { key: fl, value: fl },
                "Floor " + fl + (fl === 1 ? " (Ground +1)" : fl >= 20 ? " — Penthouse zone" : "")
              );
            })
          )
        )
      ),

      /* PRICE PREVIEW */
      chosenTypo && React.createElement("div", {
        style: {
          marginTop: 22, padding: "16px 20px", borderRadius: 14,
          background: "rgba(217,178,122,0.08)", border: "1px solid rgba(217,178,122,0.3)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          animation: "bkFadeUp 0.35s ease",
        }
      },
        React.createElement("div", null,
          React.createElement("div", { style: { fontSize: 11, letterSpacing: 0.5, color: T.gold, marginBottom: 4, fontWeight: 600 } }, "Indicative All-In Price"),
          React.createElement("div", { style: { fontSize: 11, color: T.dim } },
            (chosenTypo[selFacing] || chosenTypo.east).saleable + " sft saleable · " + (selFacing === "east" ? "East" : "West") + "-facing" + (selFloor ? " · Floor " + selFloor : "")
          )
        ),
        React.createElement("div", { style: { textAlign: "right" } },
          React.createElement("div", { style: { fontFamily: T.serif, fontSize: 28, fontWeight: 500, color: T.gold } }, fINR(unitPrice)),
          React.createElement("div", { style: { fontSize: 10, color: T.dim } }, "₹9,500/sft approx. · confirm with sales")
        )
      )
    );
  }

  /* ── STEP 3: Home Loan ── */
  function Step3({ form, setForm }) {
    const [want,    setWant]    = React.useState(form.wantLoan === undefined ? null : form.wantLoan);
    const [selBank, setSelBank] = React.useState(form.preferredBank || null);

    React.useEffect(function() {
      setForm(function(f) { return Object.assign({}, f, { wantLoan: want, preferredBank: selBank }); });
    }, [want, selBank]);

    const opts = [
      { val: true,  icon: "✓", label: "Yes, I need a home loan",         sub: "Get connected with our banking partners" },
      { val: false, icon: "✗", label: "No, self-funded / pre-approved",  sub: "Proceed directly to payment schedule" },
    ];

    return React.createElement("div", { style: { animation: "bkSlideR 0.38s ease backwards" } },
      React.createElement("div", { style: { fontFamily: T.serif, fontSize: 30, fontWeight: 400, marginBottom: 4 } }, "Home loan assistance"),
      React.createElement("div", { style: { fontSize: 12.5, color: T.dim, marginBottom: 28 } }, "We work with 7 pre-approved partner banks to ensure the fastest loan sanction."),

      /* Yes / No */
      React.createElement("div", { style: { display: "flex", gap: 16, marginBottom: 30 } },
        opts.map(function(opt) {
          const isActive = want === opt.val;
          return React.createElement("button", {
            key: String(opt.val),
            onClick: function() { setWant(opt.val); if (!opt.val) setSelBank(null); },
            style: {
              flex: 1, padding: "20px 22px", borderRadius: 16, textAlign: "left", cursor: "pointer",
              background: isActive ? (opt.val ? "rgba(127,185,85,0.13)" : "rgba(217,178,122,0.13)") : "rgba(255,255,255,0.03)",
              border: "1.5px solid " + (isActive ? (opt.val ? "rgba(127,185,85,0.55)" : "rgba(217,178,122,0.55)") : "rgba(217,178,122,0.18)"),
              color: T.cream, transition: "all 0.25s",
              boxShadow: isActive ? "0 6px 22px rgba(0,0,0,0.22)" : "none",
            }
          },
            React.createElement("div", {
              style: {
                width: 36, height: 36, borderRadius: "50%", marginBottom: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 700,
                background: isActive ? (opt.val ? "rgba(127,185,85,0.25)" : "rgba(217,178,122,0.22)") : "rgba(255,255,255,0.06)",
                border: "1px solid " + (isActive ? (opt.val ? "rgba(127,185,85,0.5)" : "rgba(217,178,122,0.5)") : "rgba(217,178,122,0.2)"),
                color: isActive ? (opt.val ? T.green : T.gold) : T.dim,
              }
            }, opt.icon),
            React.createElement("div", { style: { fontSize: 14, fontWeight: 700, color: isActive ? T.cream : T.dim, marginBottom: 4 } }, opt.label),
            React.createElement("div", { style: { fontSize: 11.5, color: T.dim } }, opt.sub)
          );
        })
      ),

      /* Bank selection */
      want === true && React.createElement("div", { style: { animation: "bkFadeUp 0.4s ease backwards" } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 16 } },
          React.createElement("div", { style: { flex: 1, height: 1, background: T.lineSoft } }),
          React.createElement("div", { style: { fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: T.gold, whiteSpace: "nowrap" } }, "Pre-Approved Partner Banks"),
          React.createElement("div", { style: { flex: 1, height: 1, background: T.lineSoft } })
        ),
        React.createElement("div", { style: { fontSize: 11.5, color: T.dim, marginBottom: 14 } }, "All listed banks have pre-approved LivingTree — faster processing, preferred rates."),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 } },
          PARTNER_BANKS.map(function(b) {
            const bankActive = selBank === b.id;
            return React.createElement("button", {
              key: b.id, className: "bk-bank",
              onClick: function() { setSelBank(bankActive ? null : b.id); },
              style: {
                padding: "14px 12px", borderRadius: 12, cursor: "pointer", textAlign: "center",
                background: bankActive ? "rgba(217,178,122,0.12)" : "rgba(255,255,255,0.03)",
                border: "1.5px solid " + (bankActive ? "rgba(217,178,122,0.65)" : "rgba(217,178,122,0.18)"),
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                boxShadow: bankActive ? "0 4px 18px rgba(217,178,122,0.18)" : "none",
              }
            },
              React.createElement("div", {
                style: {
                  width: 38, height: 38, borderRadius: "50%",
                  background: b.color + "22",
                  border: "2px solid " + b.color + "44",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 800, color: b.color, fontFamily: T.sans,
                }
              }, b.name.split(" ").map(function(w) { return w[0]; }).join("").slice(0, 3)),
              React.createElement("div", { style: { fontSize: 11, fontWeight: 600, color: bankActive ? T.gold : T.cream, lineHeight: 1.25 } }, b.name),
              b.badge && React.createElement("div", {
                style: {
                  fontSize: 8.5, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase",
                  padding: "2px 7px", borderRadius: 99,
                  background: "rgba(127,185,85,0.15)", color: T.green, border: "1px solid rgba(127,185,85,0.3)",
                }
              }, b.badge),
              bankActive && React.createElement("div", { style: { fontSize: 9, color: T.gold, fontWeight: 600 } }, "Selected ✓")
            );
          })
        ),
        React.createElement("div", {
          style: {
            marginTop: 16, padding: "10px 14px", borderRadius: 10,
            background: "rgba(217,178,122,0.06)", border: "1px solid " + T.lineSoft,
            fontSize: 11, color: T.dim,
          }
        },
          React.createElement("span", { style: { color: T.gold, fontWeight: 600 } }, "Note: "),
          "Loan eligibility and interest rates are subject to bank policies. Our home loan desk will contact you within 24 hours."
        )
      ),

      want === false && React.createElement("div", {
        style: {
          padding: "18px 22px", borderRadius: 14,
          background: "rgba(127,185,85,0.07)", border: "1px solid rgba(127,185,85,0.25)",
          fontSize: 13, color: T.dim, animation: "bkFadeIn 0.3s ease",
        }
      },
        React.createElement("span", { style: { color: T.green, fontWeight: 700 } }, "Great — "),
        "We will move directly to the payment schedule. You can still approach our banking partners later if needed."
      )
    );
  }

  /* ── STEP 4: Payment Schedule ── */
  function Step4({ form }) {
    const chosenTypo  = form.typology ? TYPOLOGIES.find(function(t) { return t.code === form.typology; }) : null;
    const sft         = chosenTypo ? (form.facing === "west" ? chosenTypo.west.saleable : chosenTypo.east.saleable) : 0;
    const totalPrice  = sft ? sft * 9500 : (chosenTypo ? chosenTypo.priceFrom : 13200000);
    const [highlighted, setHighlighted] = React.useState(null);

    const cumulative = React.useMemo(function() {
      let acc = 0;
      return PAYMENT_MILESTONES.map(function(m) {
        acc += m.pct;
        return Object.assign({}, m, { cum: acc, amount: Math.round(totalPrice * m.pct) });
      });
    }, [totalPrice]);

    return React.createElement("div", { style: { animation: "bkSlideR 0.38s ease backwards" } },
      React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 } },
        React.createElement("div", null,
          React.createElement("div", { style: { fontFamily: T.serif, fontSize: 30, fontWeight: 400, marginBottom: 4 } }, "Payment schedule"),
          React.createElement("div", { style: { fontSize: 12.5, color: T.dim } }, "Construction-linked plan — 12 milestones tied to build progress.")
        ),
        React.createElement("div", { style: { textAlign: "right" } },
          React.createElement("div", { style: { fontSize: 10, letterSpacing: 0.6, color: T.gold, fontWeight: 600, marginBottom: 3 } }, "Total Consideration"),
          React.createElement("div", { style: { fontFamily: T.serif, fontSize: 26, color: T.gold } }, fINR(totalPrice)),
          React.createElement("div", { style: { fontSize: 10, color: T.dim } }, chosenTypo ? chosenTypo.name : "Unit")
        )
      ),

      React.createElement("div", { style: { borderRadius: 14, overflow: "hidden", border: "1px solid " + T.line } },
        /* header */
        React.createElement("div", {
          style: {
            display: "grid", gridTemplateColumns: "24px 1fr 140px 110px 100px",
            padding: "10px 16px", gap: 12,
            background: "rgba(217,178,122,0.1)",
            borderBottom: "1px solid " + T.line,
          }
        },
          ["#", "Milestone", "Amount", "Cumulative", "Due"].map(function(h) {
            return React.createElement("div", {
              key: h,
              style: { fontSize: 9.5, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: T.gold }
            }, h);
          })
        ),

        /* rows */
        cumulative.map(function(m, i) {
          const isFirst = i === 0;
          const isLast  = i === cumulative.length - 1;
          const isHov   = highlighted === i;
          return React.createElement("div", {
            key: i,
            onMouseEnter: function() { setHighlighted(i); },
            onMouseLeave: function() { setHighlighted(null); },
            style: {
              display: "grid", gridTemplateColumns: "24px 1fr 140px 110px 100px",
              padding: "11px 16px", gap: 12, cursor: "default",
              background: isHov ? "rgba(217,178,122,0.07)"
                : isFirst ? "rgba(127,185,85,0.07)"
                : isLast ? "rgba(217,178,122,0.06)"
                : i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent",
              borderBottom: i < cumulative.length - 1 ? "1px solid " + T.lineSoft : "none",
              transition: "background 0.18s",
            }
          },
            React.createElement("div", { style: { fontSize: 10, color: T.dim, fontWeight: 600, paddingTop: 1 } }, i + 1),
            React.createElement("div", null,
              React.createElement("div", { style: { fontSize: 12.5, fontWeight: 600, color: isFirst ? T.green : isLast ? T.gold : T.cream } }, m.label),
              React.createElement("div", { style: { fontSize: 10, color: T.dim, marginTop: 2 } }, m.note)
            ),
            React.createElement("div", { style: { fontFamily: T.serif, fontSize: 14, fontWeight: 600, color: isFirst ? T.green : T.cream } }, fINRFull(m.amount)),
            React.createElement("div", null,
              React.createElement("div", { style: { height: 3, borderRadius: 99, background: "rgba(255,255,255,0.06)", marginBottom: 4, overflow: "hidden" } },
                React.createElement("div", {
                  style: {
                    height: "100%", width: (m.cum * 100) + "%", borderRadius: 99,
                    background: "linear-gradient(90deg, " + T.green + ", " + T.gold + ")",
                    transition: "width 0.6s ease",
                  }
                })
              ),
              React.createElement("div", { style: { fontSize: 10, color: T.dim } }, (m.cum * 100).toFixed(0) + "%")
            ),
            React.createElement("div", { style: { fontSize: 10.5, color: T.dim } }, m.due)
          );
        })
      ),

      React.createElement("div", { style: { marginTop: 14, fontSize: 10.5, color: "rgba(244,234,216,0.45)", letterSpacing: 0.2 } },
        "* Amounts are indicative at ₹9,500/sft. Stamp duty, registration and GST as applicable. Final consideration in the Sale Agreement supersedes."
      )
    );
  }

  /* ── STEP 5: Review & Confirm ── */
  function Step5({ form }) {
    const chosenTypo  = form.typology ? TYPOLOGIES.find(function(t) { return t.code === form.typology; }) : null;
    const chosenTower = form.tower ? TOWERS.find(function(t) { return t.id === form.tower; }) : null;
    const sft         = chosenTypo ? (form.facing === "west" ? chosenTypo.west.saleable : chosenTypo.east.saleable) : 0;
    const totalPrice  = sft ? sft * 9500 : (chosenTypo ? chosenTypo.priceFrom : 13200000);
    const bookingAmt  = Math.round(totalPrice * 0.05);
    const selBank     = form.preferredBank ? PARTNER_BANKS.find(function(b) { return b.id === form.preferredBank; }) : null;

    const sections = [
      { section: "Customer", items: [
        { label: "Name",        value: form.name       || "—" },
        { label: "Mobile",      value: form.phone      || "—" },
        { label: "Email",       value: form.email      || "—" },
        form.pan        ? { label: "PAN",        value: form.pan        } : null,
        form.occupation ? { label: "Occupation", value: form.occupation } : null,
      ].filter(Boolean) },
      { section: "Unit", items: [
        { label: "Tower",       value: chosenTower ? "Tower " + chosenTower.no + " — " + chosenTower.name : "—" },
        { label: "Typology",    value: chosenTypo ? chosenTypo.name : "—" },
        { label: "Facing",      value: form.facing === "east" ? "East" : "West" },
        { label: "Floor",       value: form.floor || "Any available" },
        { label: "Area",        value: sft ? sft + " sft saleable" : "—" },
        { label: "Total Price", value: fINR(totalPrice), highlight: true },
      ] },
      { section: "Home Loan", items: [
        { label: "Loan required",  value: form.wantLoan === true ? "Yes" : form.wantLoan === false ? "No — self-funded" : "Not selected" },
        selBank ? { label: "Preferred bank", value: selBank.name } : null,
      ].filter(Boolean) },
    ];

    return React.createElement("div", { style: { animation: "bkSlideR 0.38s ease backwards" } },
      React.createElement("div", { style: { fontFamily: T.serif, fontSize: 30, fontWeight: 400, marginBottom: 4 } }, "Review your booking"),
      React.createElement("div", { style: { fontSize: 12.5, color: T.dim, marginBottom: 22 } }, "Please verify all details before confirming. You can go back to edit any step."),

      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 22 } },
        sections.map(function(r) {
          return React.createElement(Panel, {
            key: r.section, animate: false,
            style: { padding: "18px 20px" }
          },
            React.createElement("div", {
              style: { fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: T.gold, marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid " + T.lineSoft }
            }, r.section),
            React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 9 } },
              r.items.map(function(it) {
                return React.createElement("div", { key: it.label, style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 } },
                  React.createElement("span", { style: { fontSize: 11, color: T.dim, flexShrink: 0 } }, it.label),
                  React.createElement("span", {
                    style: {
                      fontSize: it.highlight ? 14 : 12, fontWeight: it.highlight ? 700 : 500,
                      color: it.highlight ? T.gold : T.cream,
                      fontFamily: it.highlight ? T.serif : T.sans, textAlign: "right",
                    }
                  }, it.value)
                );
              })
            )
          );
        }),

        /* Token summary — spans both columns */
        React.createElement(Panel, {
          animate: false,
          style: {
            padding: "18px 20px", gridColumn: "1 / -1",
            background: "rgba(217,178,122,0.08)", borderColor: "rgba(217,178,122,0.38)",
          }
        },
          React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
            React.createElement("div", null,
              React.createElement("div", { style: { fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: T.gold, marginBottom: 6 } }, "Token / Booking Amount (5%)"),
              React.createElement("div", { style: { fontSize: 11.5, color: T.dim } }, "Payable today to block your unit. Adjustable against final consideration.")
            ),
            React.createElement("div", { style: { textAlign: "right" } },
              React.createElement("div", { style: { fontFamily: T.serif, fontSize: 32, color: T.gold } }, fINR(bookingAmt)),
              React.createElement("div", { style: { fontSize: 10, color: T.dim } }, fINRFull(bookingAmt))
            )
          )
        )
      ),

      React.createElement("div", {
        style: {
          padding: "12px 18px", borderRadius: 10,
          background: "rgba(127,185,85,0.07)", border: "1px solid rgba(127,185,85,0.22)",
          fontSize: 11, color: T.dim,
        }
      },
        React.createElement("span", { style: { color: T.green, fontWeight: 700 } }, "RERA Registered · "),
        PROJECT.rera + " · By confirming, you agree to the booking terms. This is an Expression of Interest (EOI) and is refundable subject to terms."
      )
    );
  }

  /* ── STEP 6: Booking Confirmed ── */
  function Step6({ form, bookingId }) {
    const chosenTypo  = form.typology ? TYPOLOGIES.find(function(t) { return t.code === form.typology; }) : null;
    const chosenTower = form.tower ? TOWERS.find(function(t) { return t.id === form.tower; }) : null;
    const sft         = chosenTypo ? (form.facing === "west" ? chosenTypo.west.saleable : chosenTypo.east.saleable) : 0;
    const totalPrice  = sft ? sft * 9500 : (chosenTypo ? chosenTypo.priceFrom : 13200000);
    const bookingAmt  = Math.round(totalPrice * 0.05);

    const nextSteps = [
      { n: "01", label: "Sales team call",      desc: "Our executive will call you within 2 hours to confirm details." },
      { n: "02", label: "Document collection",  desc: "Share KYC — Aadhaar, PAN, address proof." },
      { n: "03", label: "Token payment",        desc: "Transfer " + fINR(bookingAmt) + " to formally block your unit." },
      { n: "04", label: "Sale Agreement",       desc: "Agreement of Sale executed within 30 days of token payment." },
    ];

    const confetti = React.useMemo(function() {
      return Array.from({ length: 22 }, function(_, i) {
        return {
          id: i,
          left: 20 + Math.random() * 60,
          color: ["#d9b27a", "#7fb955", "#f4ead8", "#b9874a"][i % 4],
          size: 4 + Math.random() * 6,
          delay: Math.random() * 0.8,
          dur: 1.4 + Math.random() * 1.2,
        };
      });
    }, []);

    return React.createElement("div", { style: { textAlign: "center", animation: "bkFadeUp 0.5s ease backwards" } },
      /* confetti layer */
      React.createElement("div", { style: { position: "relative", height: 0, pointerEvents: "none" } },
        confetti.map(function(c) {
          return React.createElement("div", {
            key: c.id,
            style: {
              position: "absolute", left: c.left + "%", top: 0,
              width: c.size, height: c.size, borderRadius: "50%",
              background: c.color,
              animation: "bkConfettiDrop " + c.dur + "s ease " + c.delay + "s forwards",
            }
          });
        })
      ),

      /* seal */
      React.createElement("div", {
        style: {
          width: 100, height: 100, borderRadius: "50%", margin: "0 auto 20px",
          background: "linear-gradient(135deg, " + T.gold + ", " + T.goldDeep + ")",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "bkSeal 0.9s cubic-bezier(0.34,1.56,0.64,1) 0.15s both",
          boxShadow: "0 0 0 8px rgba(217,178,122,0.12), 0 0 0 16px rgba(217,178,122,0.06), 0 20px 60px rgba(217,178,122,0.3)",
        }
      },
        React.createElement("svg", { width: 48, height: 48, viewBox: "0 0 48 48", fill: "none" },
          React.createElement("polyline", {
            points: "10,26 20,36 38,14",
            stroke: T.ink, strokeWidth: "3.5", strokeLinecap: "round", strokeLinejoin: "round",
            strokeDasharray: "80", strokeDashoffset: "0",
            style: { animation: "bkCheck 0.6s ease 0.7s both" }
          })
        )
      ),

      React.createElement("div", { style: { fontFamily: T.serif, fontSize: 36, fontWeight: 400, marginBottom: 6, letterSpacing: 0.3 } }, "Booking Initiated"),
      React.createElement("div", { style: { fontSize: 13, color: T.dim, marginBottom: 24, maxWidth: 480, margin: "0 auto 24px" } },
        "Your Expression of Interest for a residence at LivingTree has been registered. Our sales team will reach you shortly."
      ),

      /* Booking ID */
      React.createElement("div", {
        style: {
          display: "inline-flex", alignItems: "center", gap: 12, padding: "12px 24px",
          borderRadius: 999, border: "1.5px solid " + T.lineStrong,
          background: "rgba(217,178,122,0.08)", marginBottom: 30,
          animation: "bkFadeIn 0.6s ease 0.6s backwards",
        }
      },
        React.createElement("span", { style: { fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: T.dim } }, "Booking ID"),
        React.createElement("span", { style: { fontFamily: T.serif, fontSize: 18, color: T.gold, letterSpacing: 1 } }, bookingId)
      ),

      /* unit summary chips */
      React.createElement("div", {
        style: {
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
          maxWidth: 660, margin: "0 auto 28px",
          animation: "bkFadeUp 0.5s ease 0.5s backwards",
        }
      },
        [
          { label: "Unit",         value: chosenTower ? chosenTower.name + " T" + chosenTower.no : "—" },
          { label: "Typology",     value: chosenTypo ? chosenTypo.name : "—" },
          { label: "Token Amount", value: fINR(bookingAmt) },
        ].map(function(it) {
          return React.createElement("div", {
            key: it.label,
            style: {
              padding: "14px 18px", borderRadius: 14,
              background: "rgba(19,32,26,0.85)", border: "1px solid " + T.line,
              textAlign: "center",
            }
          },
            React.createElement("div", { style: { fontSize: 9.5, letterSpacing: 0.8, textTransform: "uppercase", color: T.dim, marginBottom: 6 } }, it.label),
            React.createElement("div", { style: { fontFamily: T.serif, fontSize: 16, color: T.cream } }, it.value)
          );
        })
      ),

      /* next steps */
      React.createElement("div", { style: { maxWidth: 640, margin: "0 auto 24px", textAlign: "left", animation: "bkFadeUp 0.5s ease 0.7s backwards" } },
        React.createElement("div", { style: { fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: T.gold, marginBottom: 14, textAlign: "center" } }, "What happens next"),
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
          nextSteps.map(function(s, i) {
            return React.createElement("div", {
              key: s.n,
              style: {
                display: "flex", gap: 14, alignItems: "flex-start", padding: "12px 16px",
                borderRadius: 12,
                background: i === 0 ? "rgba(127,185,85,0.08)" : "rgba(255,255,255,0.025)",
                border: "1px solid " + (i === 0 ? "rgba(127,185,85,0.28)" : T.lineSoft),
                animation: "bkFadeUp 0.4s ease " + (0.8 + i * 0.1) + "s backwards",
              }
            },
              React.createElement("div", {
                style: {
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: i === 0 ? "rgba(127,185,85,0.22)" : "rgba(217,178,122,0.12)",
                  border: "1px solid " + (i === 0 ? "rgba(127,185,85,0.5)" : "rgba(217,178,122,0.35)"),
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9.5, fontWeight: 700, color: i === 0 ? T.green : T.gold, letterSpacing: 0.5,
                }
              }, s.n),
              React.createElement("div", null,
                React.createElement("div", { style: { fontSize: 12.5, fontWeight: 700, color: T.cream, marginBottom: 2 } }, s.label),
                React.createElement("div", { style: { fontSize: 11, color: T.dim } }, s.desc)
              )
            );
          })
        )
      ),

      /* contact */
      React.createElement("div", { style: { fontSize: 11, color: T.dim, animation: "bkFadeIn 0.5s ease 1.2s backwards" } },
        "Questions? Call ",
        React.createElement("span", { style: { color: T.gold, fontWeight: 600 } }, PROJECT.contact.phone),
        "  or email  ",
        React.createElement("span", { style: { color: T.gold } }, PROJECT.contact.email)
      )
    );
  }

  /* ── Validation ── */
  function validate(step, form) {
    const errs = {};
    if (step === 1) {
      if (!form.name || form.name.trim().length < 2)                        errs.name     = "Please enter your full name";
      if (!form.phone || !/^[+\d\s\-]{8,}$/.test(form.phone))              errs.phone    = "Enter a valid mobile number";
      if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))   errs.email    = "Enter a valid email address";
    }
    if (step === 2) {
      if (!form.tower)    errs.tower    = "Please select a tower";
      if (!form.typology) errs.typology = "Please select a typology";
    }
    if (step === 3) {
      if (form.wantLoan === null || form.wantLoan === undefined) errs.loan = "Please indicate loan preference";
    }
    return errs;
  }

  /* ── MAIN BookingScreen ── */
  function BookingScreen({ onBack, navigate }) {
    const [step,    setStep]    = React.useState(1);
    const [form,    setForm]    = React.useState({
      name:         SAMPLE_CUSTOMER.name,
      phone:        SAMPLE_CUSTOMER.phone,
      email:        SAMPLE_CUSTOMER.email,
      pan:          SAMPLE_CUSTOMER.pan,
      occupation:   "",
      employer:     "",
      tower:        null,
      typology:     null,
      floor:        "",
      facing:       "east",
      wantLoan:     null,
      preferredBank: null,
    });
    const [errors,    setErrors]  = React.useState({});
    const [bookingId]             = React.useState(generateBookingID);

    function goNext() {
      const errs = validate(step, form);
      if (Object.keys(errs).length > 0) { setErrors(errs); return; }
      setErrors({});
      setStep(function(s) { return Math.min(s + 1, 6); });
    }
    function goBack() {
      setStep(function(s) { return Math.max(s - 1, 1); });
    }

    const isConfirmed = step === 6;
    const chosenTypo  = form.typology ? TYPOLOGIES.find(function(t) { return t.code === form.typology; }) : null;
    const sft         = chosenTypo ? (form.facing === "west" ? chosenTypo.west.saleable : chosenTypo.east.saleable) : 0;
    const totalPrice  = sft ? sft * 9500 : (chosenTypo ? chosenTypo.priceFrom : null);

    return React.createElement(ScreenShell, {
      title: "Book a Residence",
      eyebrow: "Expression of Interest · LivingTree",
      onBack: onBack,
      scroll: false,
      pad: false,
    },
      React.createElement("div", {
        style: {
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }
      },
        /* scrollable body */
        React.createElement("div", {
          className: "bk-scroll",
          style: { flex: 1, overflowY: "auto", overflowX: "hidden", padding: "28px 60px 24px" }
        },
          !isConfirmed && React.createElement(StepBar, { current: step }),

          /* Step content card */
          React.createElement(Panel, { style: { padding: "30px 34px", maxWidth: 900, margin: "0 auto" } },
            step === 1 && React.createElement(Step1, { form: form, setForm: setForm, errors: errors, setErrors: setErrors }),
            step === 2 && React.createElement(Step2, { form: form, setForm: setForm }),
            step === 3 && React.createElement(Step3, { form: form, setForm: setForm }),
            step === 4 && React.createElement(Step4, { form: form }),
            step === 5 && React.createElement(Step5, { form: form }),
            step === 6 && React.createElement(Step6, { form: form, bookingId: bookingId }),

            /* validation error banner */
            Object.keys(errors).length > 0 && step <= 3 && React.createElement("div", {
              style: {
                marginTop: 16, padding: "11px 16px", borderRadius: 10,
                background: "rgba(240,80,60,0.08)", border: "1px solid rgba(240,80,60,0.3)",
                fontSize: 11.5, color: "rgba(240,140,120,0.9)",
                animation: "bkFadeIn 0.3s ease",
              }
            }, "Please fill in all required fields before continuing.")
          )
        ),

        /* Footer CTA bar */
        React.createElement("div", {
          style: {
            flexShrink: 0, padding: "16px 60px",
            background: "rgba(9,16,11,0.85)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            borderTop: "1px solid " + T.line,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }
        },
          /* left info */
          React.createElement("div", { style: { display: "flex", gap: 24, alignItems: "center" } },
            totalPrice && step >= 2 && React.createElement("div", null,
              React.createElement("div", { style: { fontSize: 9.5, letterSpacing: 0.8, textTransform: "uppercase", color: T.dim } }, "Selected unit"),
              React.createElement("div", { style: { fontFamily: T.serif, fontSize: 17, color: T.gold } }, fINR(totalPrice))
            ),
            form.name && step >= 1 && React.createElement("div", null,
              React.createElement("div", { style: { fontSize: 9.5, letterSpacing: 0.8, textTransform: "uppercase", color: T.dim } }, "Customer"),
              React.createElement("div", { style: { fontSize: 13, color: T.cream } }, form.name)
            )
          ),

          /* right nav */
          React.createElement("div", { style: { display: "flex", gap: 12, alignItems: "center" } },
            !isConfirmed && React.createElement("div", { style: { fontSize: 11, color: T.dim, marginRight: 4 } }, "Step " + step + " of " + (STEPS.length - 1)),

            /* back */
            step > 1 && !isConfirmed && React.createElement("button", {
              onClick: goBack,
              style: {
                padding: "11px 22px", borderRadius: 999,
                background: T.glass, border: "1px solid " + T.line,
                color: T.cream, fontSize: 12, fontWeight: 600, cursor: "pointer",
                letterSpacing: 0.5, transition: "all 0.2s",
              },
              onMouseEnter: function(e) { e.currentTarget.style.background = T.goldSoft; e.currentTarget.style.borderColor = T.lineStrong; },
              onMouseLeave: function(e) { e.currentTarget.style.background = T.glass; e.currentTarget.style.borderColor = T.line; }
            }, "← Back"),

            /* next / confirm */
            !isConfirmed && React.createElement("button", {
              className: "bk-cta",
              onClick: goNext,
              style: {
                padding: "12px 28px", borderRadius: 999,
                background: step === 5
                  ? "linear-gradient(135deg, " + T.green + ", #4a9e2a)"
                  : "linear-gradient(135deg, " + T.gold + ", " + T.goldDeep + ")",
                border: "none", color: T.ink, fontSize: 13, fontWeight: 700, cursor: "pointer",
                letterSpacing: 0.5, boxShadow: "0 12px 32px rgba(217,178,122,0.28)",
                display: "flex", alignItems: "center", gap: 8,
              }
            },
              step === 5 ? "Confirm Booking" : "Continue",
              React.createElement("span", { style: { animation: "bkNudge 1.8s ease-in-out infinite" } }, "→")
            ),

            /* return home after confirmation */
            isConfirmed && React.createElement("button", {
              className: "bk-cta",
              onClick: onBack,
              style: {
                padding: "12px 28px", borderRadius: 999,
                background: "linear-gradient(135deg, " + T.gold + ", " + T.goldDeep + ")",
                border: "none", color: T.ink, fontSize: 13, fontWeight: 700, cursor: "pointer",
                letterSpacing: 0.5, boxShadow: "0 12px 32px rgba(217,178,122,0.28)",
              }
            }, "Return to Home")
          )
        )
      )
    );
  }

  window.SCREENS = window.SCREENS || {};
  window.SCREENS["booking"] = BookingScreen;

})();
