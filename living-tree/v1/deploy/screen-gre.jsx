// ============================================================
// GRE App — Guest Relations · external integration placeholder
// ============================================================
function GREScreen({ onBack }) {
  // faux onboarding UI sitting blurred behind the message
  const faux = (
    <div style={{
      position: "absolute", inset: 0, filter: "blur(15px) saturate(0.8)",
      opacity: 0.52, pointerEvents: "none", transform: "scale(1.07)",
    }}>
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 230,
        background: "rgba(15,24,19,0.92)", borderRight: `1px solid ${THEME.line}`,
        padding: 26, display: "flex", flexDirection: "column", gap: 14,
      }}>
        <div style={{ height: 38, width: 150, background: THEME.goldSoft, borderRadius: 8 }}/>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{
            height: 36, borderRadius: 9,
            background: i === 1 ? THEME.goldSoft : "rgba(255,255,255,0.04)",
          }}/>
        ))}
      </div>
      <div style={{
        position: "absolute", left: 286, top: 64, right: 78, bottom: 70,
        background: "rgba(19,32,26,0.94)", border: `1px solid ${THEME.line}`,
        borderRadius: 20, padding: 38,
      }}>
        <div style={{ display: "flex", gap: 14, marginBottom: 36 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
              <div style={{ height: 8, borderRadius: 99, background: i <= 1 ? THEME.gold : "rgba(255,255,255,0.1)" }}/>
              <div style={{ height: 10, width: "62%", background: "rgba(255,255,255,0.08)", borderRadius: 4 }}/>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 30 }}>
          <div style={{ width: 116, height: 116, borderRadius: "50%", background: THEME.goldSoft, border: `1px solid ${THEME.line}` }}/>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 17 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div style={{ height: 9, width: 96, background: "rgba(255,255,255,0.1)", borderRadius: 4, marginBottom: 8 }}/>
                <div style={{ height: 46, background: "rgba(255,255,255,0.05)", border: `1px solid ${THEME.lineSoft}`, borderRadius: 11 }}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ScreenShell title="GRE App" eyebrow="Guest Relations · Customer Onboarding" onBack={onBack} scroll={false} pad={false}>
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
              <circle cx="16" cy="11" r="5.2"/><path d="M5.5 27c0-6 4.4-9.4 10.5-9.4S26.5 21 26.5 27"/>
            </svg>
          </div>
          <div style={{ fontFamily: THEME.serif, fontSize: 31, fontWeight: 500, marginBottom: 11 }}>
            Customer Onboarding
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.75, color: THEME.dim, marginBottom: 24 }}>
            A dedicated GRE application — visitor capture, walk-in onboarding and
            concierge workflows for your guest relations team.
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
window.SCREENS.gre = GREScreen;
