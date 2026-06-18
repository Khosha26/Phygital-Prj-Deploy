// ============================================================
// Mini CRM — external integration placeholder
// ============================================================
function MiniCRMScreen({ onBack }) {
  // faux CRM dashboard sitting blurred behind the message
  const faux = (
    <div style={{
      position: "absolute", inset: 0, filter: "blur(15px) saturate(0.8)",
      opacity: 0.52, pointerEvents: "none", transform: "scale(1.07)",
      padding: 44, display: "flex", flexDirection: "column", gap: 22,
    }}>
      {/* stat tiles */}
      <div style={{ display: "flex", gap: 20 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 110, borderRadius: 16, padding: 22,
            background: "rgba(19,32,26,0.92)", border: `1px solid ${THEME.line}`,
          }}>
            <div style={{ height: 9, width: 70, background: "rgba(255,255,255,0.1)", borderRadius: 4, marginBottom: 16 }}/>
            <div style={{ height: 30, width: 110, background: THEME.goldSoft, borderRadius: 6 }}/>
          </div>
        ))}
      </div>
      {/* board + chart */}
      <div style={{ display: "flex", gap: 20, flex: 1 }}>
        <div style={{
          flex: 2, borderRadius: 16, padding: 22, display: "flex", gap: 16,
          background: "rgba(19,32,26,0.92)", border: `1px solid ${THEME.line}`,
        }}>
          {["New", "Contacted", "Visit", "Booked"].map((c, i) => (
            <div key={c} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 11 }}>
              <div style={{ height: 8, width: "70%", background: THEME.goldSoft, borderRadius: 99 }}/>
              {Array.from({ length: 3 - (i % 2) }).map((_, j) => (
                <div key={j} style={{ height: 60, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: `1px solid ${THEME.lineSoft}` }}/>
              ))}
            </div>
          ))}
        </div>
        <div style={{
          flex: 1, borderRadius: 16, padding: 22,
          background: "rgba(19,32,26,0.92)", border: `1px solid ${THEME.line}`,
          display: "flex", alignItems: "flex-end", gap: 12,
        }}>
          {[40, 70, 52, 88, 64, 78].map((h, i) => (
            <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 6, background: i % 2 ? THEME.goldSoft : "rgba(217,178,122,0.3)" }}/>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <ScreenShell title="Mini CRM" eyebrow="Leads · Pipeline · Follow-ups" onBack={onBack} scroll={false} pad={false}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {faux}
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,18,13,0.5)" }}/>
        <div style={{
          position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
          width: 540, textAlign: "center", padding: "50px 48px",
          background: "rgba(19,32,26,0.93)", border: `1px solid ${THEME.lineStrong}`,
          borderRadius: 26, boxShadow: "0 44px 110px rgba(0,0,0,0.62)",
          animation: "scaleFadeIn 0.7s cubic-bezier(0.34,1.56,0.64,1)",
        }}>
          <div style={{
            width: 74, height: 74, borderRadius: "50%", margin: "0 auto 24px",
            background: THEME.goldSoft, border: `1px solid ${THEME.lineStrong}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="34" height="34" viewBox="0 0 32 32" fill="none" stroke={THEME.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 26V14M13 26V8M21 26V17M29 26V11"/>
            </svg>
          </div>
          <div style={{ fontFamily: THEME.serif, fontSize: 31, fontWeight: 500, marginBottom: 11 }}>
            Leads &amp; Pipeline
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.75, color: THEME.dim, marginBottom: 24 }}>
            A full CRM — lead capture, pipeline stages, follow-up reminders and
            sales analytics for your team.
          </div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 9,
            padding: "11px 21px", borderRadius: 999,
            background: THEME.goldSoft, border: `1px solid ${THEME.lineStrong}`,
            fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase", color: THEME.gold, fontWeight: 600,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: THEME.green, boxShadow: `0 0 8px ${THEME.green}` }}/>
            External application — integrable into Sales Suite
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}
window.SCREENS = window.SCREENS || {};
window.SCREENS.minicrm = MiniCRMScreen;
