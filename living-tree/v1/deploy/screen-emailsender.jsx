// ============================================================
// Email Sender Screen — LivingTree Sales Suite
// Two-pane: LEFT composer · RIGHT live preview
// ============================================================

function EmailSenderScreen({ onBack, navigate }) {
  // ── Inject keyframes + styles once ──────────────────────────
  React.useEffect(() => {
    if (document.getElementById('emailsender-styles')) return;
    const el = document.createElement('style');
    el.id = 'emailsender-styles';
    el.textContent = `
      @keyframes esSlideIn {
        from { opacity: 0; transform: translateX(-18px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      @keyframes esSlideInRight {
        from { opacity: 0; transform: translateX(18px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      @keyframes esFadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes esScaleFade {
        from { opacity: 0; transform: scale(0.88); }
        to   { opacity: 1; transform: scale(1); }
      }
      @keyframes esPulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(217,178,122,0.55); }
        50%       { box-shadow: 0 0 0 9px rgba(217,178,122,0); }
      }
      @keyframes esSent {
        0%   { transform: scale(0.7); opacity: 0; }
        60%  { transform: scale(1.08); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes esBreath {
        0%, 100% { opacity: 0.7; }
        50%       { opacity: 1; }
      }
      .es-input {
        width: 100%; box-sizing: border-box;
        background: rgba(10,18,13,0.7);
        border: 1px solid rgba(217,178,122,0.22);
        border-radius: 10px;
        color: #f4ead8; font-family: Inter, sans-serif; font-size: 13px;
        padding: 10px 14px; outline: none;
        transition: border-color 0.25s, background 0.25s;
      }
      .es-input:focus {
        border-color: rgba(217,178,122,0.65);
        background: rgba(15,24,19,0.9);
        box-shadow: 0 0 0 3px rgba(217,178,122,0.07);
      }
      .es-input::placeholder { color: rgba(244,234,216,0.3); }
      .es-textarea {
        width: 100%; box-sizing: border-box; resize: none;
        background: rgba(10,18,13,0.7);
        border: 1px solid rgba(217,178,122,0.22);
        border-radius: 10px;
        color: #f4ead8; font-family: Inter, sans-serif; font-size: 13px;
        line-height: 1.7; padding: 12px 14px; outline: none;
        transition: border-color 0.25s, background 0.25s;
      }
      .es-textarea:focus {
        border-color: rgba(217,178,122,0.65);
        background: rgba(15,24,19,0.9);
        box-shadow: 0 0 0 3px rgba(217,178,122,0.07);
      }
      .es-textarea::placeholder { color: rgba(244,234,216,0.3); }
      .es-tpl-btn {
        padding: 7px 13px; border-radius: 8px; border: 1px solid rgba(217,178,122,0.22);
        background: transparent; color: rgba(244,234,216,0.7);
        font-family: Inter, sans-serif; font-size: 11.5px; font-weight: 500;
        cursor: pointer; transition: all 0.2s; white-space: nowrap;
        letter-spacing: 0.2px;
      }
      .es-tpl-btn:hover {
        background: rgba(217,178,122,0.1); color: #f4ead8;
        border-color: rgba(217,178,122,0.45);
      }
      .es-tpl-btn.active {
        background: rgba(217,178,122,0.18);
        border-color: rgba(217,178,122,0.7);
        color: #d9b27a; font-weight: 600;
      }
      .es-attach-toggle {
        display: flex; align-items: center; gap: 9px;
        padding: 8px 12px; border-radius: 9px;
        border: 1px solid rgba(217,178,122,0.18);
        background: rgba(10,18,13,0.5);
        cursor: pointer; transition: all 0.22s;
        user-select: none;
      }
      .es-attach-toggle:hover {
        background: rgba(217,178,122,0.08);
        border-color: rgba(217,178,122,0.38);
      }
      .es-attach-toggle.checked {
        background: rgba(217,178,122,0.12);
        border-color: rgba(217,178,122,0.55);
      }
      .es-scrollbar::-webkit-scrollbar { width: 4px; }
      .es-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .es-scrollbar::-webkit-scrollbar-thumb { background: rgba(217,178,122,0.25); border-radius: 99px; }
    `;
    document.head.appendChild(el);
  }, []);

  // ── Sales rep (session context) ──────────────────────────────
  const REP = {
    name: 'Priya Nair',
    designation: 'Senior Sales Consultant',
    phone: PROJECT.contact.phone,
    email: PROJECT.contact.email,
    site: PROJECT.contact.site,
    rera: PROJECT.rera,
  };

  // ── Templates ────────────────────────────────────────────────
  const TEMPLATES = [
    {
      id: 'intro',
      label: 'Project Introduction',
      subject: 'Introduction — LivingTree by Kalyani Developers, North Bengaluru',
      body: `Dear ${SAMPLE_CUSTOMER.name},

Thank you for your interest in LivingTree by Kalyani Developers — a landmark 25-acre luxury residential community set within the KIADB Aerospace Park in North Bengaluru.

LivingTree is designed across ten tree-named towers, offering 1, 2, 2.5 and 3 BHK residences that combine thoughtful Vastu-compliant planning with 20 acres of curated open greens and 65 world-class amenities spread across two signature clubhouses.

Located just 15 minutes from Kempegowda International Airport, this is a community built for four generations — where aerospace-corridor connectivity meets a life lived among nature.

I would love to walk you through the project in detail at your convenience. Please find the attached brochure and master plan for your initial review.

Warm regards,`,
    },
    {
      id: 'price',
      label: 'Price & Floor Plans',
      subject: `LivingTree — Pricing Overview & Floor Plans (${SAMPLE_CUSTOMER.name})`,
      body: `Dear ${SAMPLE_CUSTOMER.name},

Following our conversation, I am pleased to share the current pricing and unit configurations available at LivingTree.

Our residences are offered across the following typologies:

  • 2 BHK + Study (2.5 BHK) — from Rs. 89 L onwards
  • 3 BHK Smart              — from Rs. 1.05 Cr onwards
  • 3 BHK Optimal            — from Rs. 1.32 Cr onwards
  • 3 BHK Luxe (Aspen Tower) — from Rs. 1.68 Cr onwards

All units feature double balconies, no common walls, and are available in East- or West-facing orientations. Floor plans are enclosed for your review.

Please note that the above pricing is indicative and subject to floor premiums and GST. I am happy to prepare a detailed cost sheet tailored to any specific unit you shortlist.

Warm regards,`,
    },
    {
      id: 'sitevisit',
      label: 'Site Visit Invitation',
      subject: "You're Invited — LivingTree Site Visit & Experience",
      body: `Dear ${SAMPLE_CUSTOMER.name},

It was a pleasure connecting with you. I would like to personally invite you to experience LivingTree at our Sales Pavilion — a guided visit that brings the community to life in a way no brochure can.

During the visit, you will have the opportunity to:

  • Tour the 25-acre masterplan and model apartment
  • Walk through both signature clubhouses and the flowing-roots landscape
  • Meet our project team and have all your questions answered
  • Select your preferred unit orientation (East or West)

We conduct guided visits on weekdays from 10 AM to 6 PM, and on weekends by appointment. The experience typically takes 90 minutes and includes a complimentary consultation with our design team.

Please let me know your preferred date and time, and I will arrange everything for you.

Warm regards,`,
    },
    {
      id: 'postvisit',
      label: 'Post-Visit Follow-up',
      subject: 'Thank You for Visiting LivingTree — Next Steps',
      body: `Dear ${SAMPLE_CUSTOMER.name},

Thank you for visiting LivingTree today — it was a genuine pleasure showing you the community in person.

I hope the experience gave you a clear sense of the scale, quality and thoughtfulness that Kalyani Developers has brought to this project. As promised, I am attaching the full brochure, floor plans, and the cost sheet for the units we discussed.

Key details to keep in mind:

  • Possession: September 2029 (Phase 1)
  • RERA: ${PROJECT.rera}
  • Booking amount: Rs. 2 Lakhs (fully adjustable against cost)
  • Home loan assistance available through partnered banks

If you would like to reserve a unit or have any further questions, I am available at ${PROJECT.contact.phone} or by reply to this email. The units at your preferred floor and orientation are currently available, but inventory at this stage moves quickly.

Looking forward to welcoming you home.

Warm regards,`,
    },
    {
      id: 'booking',
      label: 'Booking Confirmation',
      subject: 'Booking Confirmation — LivingTree, Unit Reserved in Your Name',
      body: `Dear ${SAMPLE_CUSTOMER.name},

Congratulations — and a very warm welcome to the LivingTree family!

This email confirms that your chosen residence at LivingTree by Kalyani Developers has been successfully reserved in your name. Your booking details are as follows:

  Project    : LivingTree by Kalyani Developers
  Location   : KIADB Aerospace Park, Jala Hobli, Bengaluru North — 560064
  RERA No.   : ${PROJECT.rera}
  Possession : September 2029 (Phase 1)

Our team will be in touch within 48 hours to share the complete payment schedule, allotment letter, and your dedicated relationship manager's contact details.

In the meantime, please do not hesitate to reach me directly at ${PROJECT.contact.phone} for any questions or clarifications.

Once again — welcome home. We look forward to this journey together.

Warm regards,`,
    },
  ];

  // ── State ────────────────────────────────────────────────────
  const [activeTemplate, setActiveTemplate] = React.useState(TEMPLATES[0]);
  const [toName,  setToName]  = React.useState(SAMPLE_CUSTOMER.name);
  const [toEmail, setToEmail] = React.useState(SAMPLE_CUSTOMER.email);
  const [subject, setSubject] = React.useState(TEMPLATES[0].subject);
  const [body,    setBody]    = React.useState(TEMPLATES[0].body);
  const [attachments, setAttachments] = React.useState({
    brochure: true, masterplan: true, floorplans: false,
    pricesheet: false, rera: false, costsheet: false,
  });
  const [sending, setSending] = React.useState(false);
  const [sent,    setSent]    = React.useState(false);

  const selectTemplate = React.useCallback((tpl) => {
    setActiveTemplate(tpl);
    const personalized = tpl.body.replace(new RegExp(SAMPLE_CUSTOMER.name, 'g'), toName || SAMPLE_CUSTOMER.name);
    setSubject(tpl.subject);
    setBody(personalized);
  }, [toName]);

  const toggleAttachment = (key) => {
    setAttachments(a => ({ ...a, [key]: !a[key] }));
  };

  const handleSend = () => {
    if (sending || !toEmail) return;
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 1400);
  };

  const attachmentList = [
    { key: 'brochure',   label: 'Project Brochure',  size: '8.4 MB' },
    { key: 'masterplan', label: 'Master Plan',        size: '3.1 MB' },
    { key: 'floorplans', label: 'Floor Plans',        size: '5.6 MB' },
    { key: 'pricesheet', label: 'Price Sheet',        size: '0.9 MB' },
    { key: 'rera',       label: 'RERA Certificate',   size: '1.2 MB' },
    { key: 'costsheet',  label: 'Cost Sheet',         size: '1.4 MB' },
  ];

  const activeAttachments = attachmentList.filter(a => attachments[a.key]);

  const HIGHLIGHTS = [
    { v: '25 Acres',   l: 'Total Land'  },
    { v: '20 Acres',   l: 'Open Green'  },
    { v: '10',         l: 'Towers'      },
    { v: '65+',        l: 'Amenities'   },
    { v: '15 min',     l: 'to Airport'  },
    { v: "Sept '29",   l: 'Possession'  },
  ];

  // ── SENT state ───────────────────────────────────────────────
  if (sent) {
    return (
      <ScreenShell title="Email Sender" eyebrow="Sales Communications · Follow-up" onBack={onBack} scroll={false} pad={false}>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            textAlign: 'center', padding: '56px 64px',
            background: 'rgba(15,24,19,0.95)',
            border: '1px solid ' + THEME.lineStrong,
            borderRadius: 28,
            boxShadow: '0 48px 120px rgba(0,0,0,0.65)',
            animation: 'esSent 0.65s cubic-bezier(0.34,1.56,0.64,1)',
            maxWidth: 480,
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', margin: '0 auto 28px',
              background: 'rgba(127,185,85,0.15)',
              border: '1.5px solid rgba(127,185,85,0.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'esPulse 2s ease-in-out infinite',
            }}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#7fb955" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="7,19 14,26 29,11"/>
              </svg>
            </div>
            <div style={{ fontFamily: THEME.serif, fontSize: 34, fontWeight: 500, marginBottom: 10, color: THEME.cream }}>
              Email Sent
            </div>
            <div style={{ fontSize: 13.5, color: THEME.dim, lineHeight: 1.75, marginBottom: 8 }}>
              Your message to{' '}
              <span style={{ color: THEME.cream, fontWeight: 600 }}>{toName}</span>{' '}
              has been dispatched successfully.
            </div>
            <div style={{ fontSize: 12, color: 'rgba(244,234,216,0.45)', marginBottom: 32 }}>
              {toEmail} &nbsp;·&nbsp; {activeAttachments.length} attachment{activeAttachments.length !== 1 ? 's' : ''}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => { setSent(false); }}
                style={{
                  padding: '10px 22px', borderRadius: 999,
                  background: THEME.glass, border: '1px solid ' + THEME.line,
                  color: THEME.cream, fontFamily: THEME.sans, fontSize: 12,
                  fontWeight: 600, letterSpacing: 0.5, cursor: 'pointer',
                }}>
                New Email
              </button>
              {navigate && (
                <button
                  onClick={() => navigate('minicrm')}
                  style={{
                    padding: '10px 22px', borderRadius: 999,
                    background: 'linear-gradient(135deg, #d9b27a, #b9874a)',
                    border: 'none', color: '#1a2620',
                    fontFamily: THEME.sans, fontSize: 12,
                    fontWeight: 700, letterSpacing: 0.5, cursor: 'pointer',
                  }}>
                  Log in CRM →
                </button>
              )}
            </div>
          </div>
        </div>
      </ScreenShell>
    );
  }

  // ── MAIN LAYOUT ──────────────────────────────────────────────
  return (
    <ScreenShell title="Email Sender" eyebrow="Sales Communications · Follow-up" onBack={onBack} scroll={false} pad={false}>
      <div style={{
        position: 'absolute', inset: 0, top: 0,
        display: 'flex', overflow: 'hidden',
      }}>

        {/* ══════════════════════════════════════
            LEFT — COMPOSER  (544 px)
        ══════════════════════════════════════ */}
        <div style={{
          width: 544, flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          borderRight: '1px solid ' + THEME.line,
          background: 'rgba(9,16,11,0.72)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          animation: 'esSlideIn 0.48s cubic-bezier(0.4,0,0.2,1) backwards',
          overflow: 'hidden',
        }}>

          {/* Composer header */}
          <div style={{
            padding: '18px 26px 14px',
            borderBottom: '1px solid ' + THEME.lineSoft,
            flexShrink: 0,
          }}>
            <div style={{ fontSize: 9.5, letterSpacing: 3, textTransform: 'uppercase', color: THEME.gold, marginBottom: 5 }}>
              Compose
            </div>
            <div style={{ fontFamily: THEME.serif, fontSize: 22, fontWeight: 500, color: THEME.cream }}>
              New Follow-up Email
            </div>
          </div>

          {/* Scrollable form */}
          <div className="es-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '18px 26px 0' }}>

            {/* Template picker */}
            <div style={{ marginBottom: 18 }}>
              <EsLabel>Template</EsLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    className={'es-tpl-btn' + (activeTemplate.id === tpl.id ? ' active' : '')}
                    onClick={() => selectTemplate(tpl)}>
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient */}
            <div style={{ marginBottom: 13 }}>
              <EsLabel>Recipient</EsLabel>
              <div style={{ display: 'flex', gap: 9, marginTop: 7 }}>
                <input
                  className="es-input"
                  style={{ flex: 1 }}
                  placeholder="Full name"
                  value={toName}
                  onChange={e => setToName(e.target.value)}
                />
                <input
                  className="es-input"
                  style={{ flex: 1.5 }}
                  placeholder="Email address"
                  value={toEmail}
                  onChange={e => setToEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Subject */}
            <div style={{ marginBottom: 13 }}>
              <EsLabel>Subject</EsLabel>
              <input
                className="es-input"
                style={{ marginTop: 7 }}
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
            </div>

            {/* Body */}
            <div style={{ marginBottom: 16 }}>
              <EsLabel>Message Body</EsLabel>
              <textarea
                className="es-textarea"
                style={{ marginTop: 7, height: 210 }}
                value={body}
                onChange={e => setBody(e.target.value)}
              />
            </div>

            {/* Attachments */}
            <div style={{ marginBottom: 22 }}>
              <EsLabel>Attachments</EsLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginTop: 8 }}>
                {attachmentList.map(a => (
                  <div
                    key={a.key}
                    className={'es-attach-toggle' + (attachments[a.key] ? ' checked' : '')}
                    onClick={() => toggleAttachment(a.key)}>
                    <div style={{
                      width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                      border: '1.5px solid ' + (attachments[a.key] ? THEME.gold : 'rgba(217,178,122,0.3)'),
                      background: attachments[a.key] ? THEME.gold : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}>
                      {attachments[a.key] && (
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="#1a2620" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1.5,4.5 3.5,6.5 7.5,2.5"/>
                        </svg>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 12, fontWeight: 500,
                        color: attachments[a.key] ? THEME.cream : THEME.dim,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        transition: 'color 0.2s',
                      }}>{a.label}</div>
                      <div style={{ fontSize: 10, color: 'rgba(244,234,216,0.38)', marginTop: 1 }}>{a.size}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer / Send */}
          <div style={{
            padding: '14px 26px',
            borderTop: '1px solid ' + THEME.lineSoft,
            background: 'rgba(9,16,11,0.6)',
            flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: THEME.dim }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={THEME.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
              {activeAttachments.length === 0
                ? 'No attachments'
                : activeAttachments.length + ' file' + (activeAttachments.length > 1 ? 's' : '') + ' attached'}
            </div>
            <button
              onClick={handleSend}
              disabled={sending || !toEmail}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '11px 26px', borderRadius: 999, border: 'none',
                background: sending ? 'rgba(217,178,122,0.3)' : 'linear-gradient(135deg, #d9b27a, #b9874a)',
                color: sending ? THEME.gold : '#1a2620',
                fontFamily: THEME.sans, fontSize: 13, fontWeight: 700,
                letterSpacing: 0.5, cursor: sending ? 'default' : 'pointer',
                boxShadow: sending ? 'none' : '0 10px 28px rgba(217,178,122,0.28)',
                transition: 'all 0.3s',
                minWidth: 128,
              }}>
              {sending ? (
                React.createElement(React.Fragment, null,
                  React.createElement('span', { style: { animation: 'esBreath 0.8s ease-in-out infinite' } }, '●'),
                  ' Sending…'
                )
              ) : (
                React.createElement(React.Fragment, null,
                  'Send Email',
                  React.createElement('svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2.2', strokeLinecap: 'round', strokeLinejoin: 'round' },
                    React.createElement('line', { x1: '22', y1: '2', x2: '11', y2: '13' }),
                    React.createElement('polygon', { points: '22 2 15 22 11 13 2 9 22 2' })
                  )
                )
              )}
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════
            RIGHT — LIVE EMAIL PREVIEW
        ══════════════════════════════════════ */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          animation: 'esSlideInRight 0.52s cubic-bezier(0.4,0,0.2,1) 0.08s backwards',
          overflow: 'hidden',
        }}>
          {/* Preview header */}
          <div style={{
            padding: '16px 26px 13px',
            borderBottom: '1px solid ' + THEME.lineSoft,
            background: 'rgba(15,24,19,0.5)',
            flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 9.5, letterSpacing: 3, textTransform: 'uppercase', color: THEME.gold, marginBottom: 4 }}>
                Live Preview
              </div>
              <div style={{ fontFamily: THEME.serif, fontSize: 18, fontWeight: 500, color: THEME.cream }}>
                As the customer sees it
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 13px', borderRadius: 999,
              background: 'rgba(127,185,85,0.1)',
              border: '1px solid rgba(127,185,85,0.3)',
              fontSize: 11, color: '#7fb955', fontWeight: 600, letterSpacing: 0.5,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#7fb955', boxShadow: '0 0 7px #7fb955',
                animation: 'esBreath 1.8s ease-in-out infinite',
              }}/>
              Updates live
            </div>
          </div>

          {/* Email mockup viewport */}
          <div className="es-scrollbar" style={{
            flex: 1, overflowY: 'auto',
            padding: '22px 24px 30px',
            background: 'rgba(8,14,10,0.35)',
          }}>
            <div style={{
              maxWidth: 620, margin: '0 auto',
              background: '#0f1813',
              border: '1px solid ' + THEME.line,
              borderRadius: 13,
              overflow: 'hidden',
              boxShadow: '0 28px 72px rgba(0,0,0,0.52)',
            }}>

              {/* Email client chrome */}
              <div style={{
                background: 'rgba(8,12,10,0.85)',
                borderBottom: '1px solid ' + THEME.lineSoft,
                padding: '9px 16px',
                display: 'flex', alignItems: 'center', gap: 9,
              }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  {['#ff5f56','#ffbd2e','#27c93f'].map(c => (
                    <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }}/>
                  ))}
                </div>
                <div style={{ flex: 1, textAlign: 'center', color: 'rgba(244,234,216,0.32)', fontSize: 11, letterSpacing: 0.2 }}>
                  {subject || '(no subject)'}
                </div>
              </div>

              {/* Email meta */}
              <div style={{
                padding: '11px 20px',
                borderBottom: '1px solid ' + THEME.lineSoft,
                background: 'rgba(12,20,15,0.6)',
                display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                <EsMetaRow label="From" value={REP.name + ' <' + REP.email + '>'}/>
                <EsMetaRow label="To"   value={(toName || '—') + ' <' + (toEmail || '—') + '>'}/>
                <EsMetaRow label="Subj" value={subject || '(no subject)'}/>
              </div>

              {/* Branded email body */}
              <div>

                {/* Brand header band */}
                <div style={{
                  background: 'linear-gradient(135deg, #0d1f16 0%, #1a2e20 100%)',
                  borderBottom: '2px solid ' + THEME.gold,
                  padding: '24px 28px 20px',
                  display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <img
                    src="assets/renders/cover-01.png"
                    alt="LivingTree"
                    style={{ width: 52, height: 52, objectFit: 'contain', flexShrink: 0, opacity: 0.9 }}
                  />
                  <div>
                    <div style={{ fontFamily: THEME.serif, fontSize: 21, fontWeight: 500, color: THEME.cream, lineHeight: 1.1 }}>
                      LivingTree
                    </div>
                    <div style={{ fontSize: 9, letterSpacing: 2.5, color: THEME.gold, textTransform: 'uppercase', marginTop: 3 }}>
                      by Kalyani Developers · Bengaluru
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontSize: 9, color: 'rgba(244,234,216,0.4)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                      Designed for Life.
                    </div>
                  </div>
                </div>

                {/* Body content */}
                <div style={{ padding: '24px 28px 0' }}>

                  {/* Personalized greeting */}
                  <div style={{
                    fontFamily: THEME.serif, fontSize: 17, fontWeight: 500,
                    color: THEME.cream, marginBottom: 16, lineHeight: 1.35,
                  }}>
                    {toName ? 'Dear ' + toName + ',' : 'Dear Customer,'}
                  </div>

                  {/* Body text */}
                  <div style={{
                    fontSize: 12.5, lineHeight: 1.82, color: 'rgba(244,234,216,0.8)',
                    whiteSpace: 'pre-wrap', fontFamily: THEME.sans, marginBottom: 24,
                  }}>
                    {body.replace(/^Dear [^\n]+\n\n?/, '')}
                  </div>

                  {/* Signature line (closing) */}
                  <div style={{ fontFamily: THEME.sans, fontSize: 13, color: THEME.dim, lineHeight: 1.7 }}>
                    <span style={{ color: THEME.gold, fontWeight: 600 }}>{REP.name}</span>
                  </div>

                  {/* Project highlights block */}
                  <div style={{
                    margin: '20px 0',
                    padding: '16px 18px',
                    background: 'rgba(10,18,13,0.55)',
                    border: '1px solid ' + THEME.lineSoft,
                    borderRadius: 9,
                  }}>
                    <div style={{ fontSize: 8.5, letterSpacing: 3, textTransform: 'uppercase', color: THEME.gold, marginBottom: 13 }}>
                      Project at a Glance
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 6px' }}>
                      {HIGHLIGHTS.map((h, i) => (
                        <div key={i} style={{
                          textAlign: 'center',
                          padding: '7px 0',
                          borderRight: (i % 3 !== 2) ? '1px solid ' + THEME.lineSoft : 'none',
                        }}>
                          <div style={{ fontFamily: THEME.serif, fontSize: 19, fontWeight: 500, color: THEME.cream, lineHeight: 1 }}>
                            {h.v}
                          </div>
                          <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(244,234,216,0.42)', marginTop: 3 }}>
                            {h.l}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attachments list */}
                  {activeAttachments.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 8.5, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(244,234,216,0.4)', marginBottom: 9 }}>
                        Attachments ({activeAttachments.length})
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {activeAttachments.map(a => (
                          <div key={a.key} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '4px 10px',
                            background: 'rgba(217,178,122,0.08)',
                            border: '1px solid ' + THEME.lineSoft,
                            borderRadius: 5,
                            fontSize: 11, color: THEME.dim,
                          }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={THEME.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                            </svg>
                            {a.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Signature block */}
                  <div style={{ borderTop: '1px solid ' + THEME.lineSoft, paddingTop: 18, marginTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(217,178,122,0.14)',
                        border: '1px solid ' + THEME.line,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: THEME.serif, fontSize: 15, color: THEME.gold,
                      }}>
                        {REP.name.split(' ').map(w => w[0]).join('')}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 12.5, color: THEME.cream, marginBottom: 2 }}>{REP.name}</div>
                        <div style={{ fontSize: 11, color: THEME.dim, marginBottom: 1 }}>{REP.designation}</div>
                        <div style={{ fontSize: 11, color: THEME.dim, marginBottom: 7 }}>LivingTree Sales Pavilion, North Bengaluru</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 14px' }}>
                          <EsSigItem icon="phone" text={REP.phone}/>
                          <EsSigItem icon="email" text={REP.email}/>
                          <EsSigItem icon="web"   text={REP.site}/>
                        </div>
                        <div style={{ marginTop: 7, fontSize: 9.5, color: 'rgba(244,234,216,0.32)', letterSpacing: 0.2 }}>
                          RERA · {REP.rera}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{
                    margin: '20px 0 0',
                    padding: '13px 0 26px',
                    borderTop: '1px solid ' + THEME.lineSoft,
                    fontSize: 9.5, color: 'rgba(244,234,216,0.28)',
                    lineHeight: 1.7, textAlign: 'center',
                  }}>
                    This email and any attachments are intended solely for the named recipient and may contain confidential information.<br/>
                    &copy; 2024 Kalyani Developers &nbsp;·&nbsp; Plot 7, KIADB Aerospace Park, Jala Hobli, Bengaluru North — 560064
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </ScreenShell>
  );
}

// ── Helper components (scoped names to avoid collision) ──────
function EsLabel({ children }) {
  return (
    <div style={{
      fontSize: 9.5, letterSpacing: 2.5, textTransform: 'uppercase',
      color: 'rgba(217,178,122,0.7)', fontWeight: 600,
    }}>{children}</div>
  );
}

function EsMetaRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
      <span style={{
        fontSize: 9.5, letterSpacing: 1.5, textTransform: 'uppercase',
        color: 'rgba(217,178,122,0.5)', fontWeight: 600, width: 34, flexShrink: 0,
      }}>{label}</span>
      <span style={{
        color: 'rgba(244,234,216,0.7)', fontSize: 11,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{value}</span>
    </div>
  );
}

function EsSigItem({ icon, text }) {
  const paths = {
    phone: React.createElement('path', { d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.58a16 16 0 0 0 5.51 5.51l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z' }),
    email: [
      React.createElement('path', { key: 'r', d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' }),
      React.createElement('polyline', { key: 'p', points: '22,6 12,13 2,6' }),
    ],
    web: [
      React.createElement('circle', { key: 'c', cx: '12', cy: '12', r: '10' }),
      React.createElement('line',   { key: 'l', x1: '2', y1: '12', x2: '22', y2: '12' }),
      React.createElement('path',   { key: 'p', d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' }),
    ],
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(244,234,216,0.5)' }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={THEME.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {paths[icon]}
      </svg>
      <span style={{ fontSize: 10.5 }}>{text}</span>
    </div>
  );
}

// ── Register ─────────────────────────────────────────────────
window.SCREENS = window.SCREENS || {};
window.SCREENS['emailsender'] = EmailSenderScreen;
