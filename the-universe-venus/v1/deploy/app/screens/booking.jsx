// Booking — gamified flow:
//   1) Customer details (auto-completion checkmarks per field, score ticker)
//   2) Pick typology + tower
//   3) Schedule & confirm
//   4) Confetti + handshake confirmation
// Each step transition fires a particle burst, an achievement toast, and an
// XP-style progress fill. Buttons live separately from particles via z-index.

const BOOKING_KEYS_ID = 'uni-booking-gamified-keys';
function ensureBookingKeys() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(BOOKING_KEYS_ID)) return;
  const s = document.createElement('style');
  s.id = BOOKING_KEYS_ID;
  s.textContent = `
    @keyframes uniBadgePop {
      0%   { transform: scale(0.7); }
      50%  { transform: scale(1.18); }
      100% { transform: scale(1); }
    }
    @keyframes uniBadgeStamp {
      0%   { transform: scale(0.8) rotate(-12deg); }
      55%  { transform: scale(1.15) rotate(4deg); }
      100% { transform: scale(1) rotate(0deg); }
    }
    @keyframes uniAchSlide {
      0%   { opacity: 0; transform: translateX(-50%) translateY(-22px) scale(0.94); }
      14%  { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
      78%  { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
      100% { opacity: 0; transform: translateX(-50%) translateY(-12px) scale(0.96); }
    }
    @keyframes uniStepIn {
      0%   { opacity: 0; transform: translateX(40px); filter: blur(6px); }
      100% { opacity: 1; transform: translateX(0);    filter: blur(0); }
    }
    @keyframes uniFieldCheckPop {
      0%   { transform: translateY(-50%) scale(0); }
      55%  { transform: translateY(-50%) scale(1.22); }
      100% { transform: translateY(-50%) scale(1); }
    }
    @keyframes uniTowerSelected {
      0%   { transform: scale(1); }
      40%  { transform: scale(1.06); box-shadow: 0 0 0 6px rgba(232,215,168,0.30); }
      100% { transform: scale(1); }
    }
  `;
  document.head.appendChild(s);
}

// Live canvas-height density: 0 on the 16:10 Tab S7 (H=1600), 1 on iPad Pro 4:3
// (H=1920). Grows figures + touch targets so each step fills the taller canvas.
// (`dlerp` is a shared global defined in tools.jsx, which loads before this file.)
function useBookingDens() {
  const read = () => {
    const H = (typeof window !== 'undefined' && window.UNIVERSE_CANVAS && window.UNIVERSE_CANVAS.H) || 1600;
    return Math.max(0, Math.min(1, (H - 1600) / 320));
  };
  const [d, setD] = React.useState(read);
  React.useEffect(() => {
    const on = () => setD(read());
    on();
    window.addEventListener('resize', on);
    window.addEventListener('orientationchange', on);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', on);
    return () => {
      window.removeEventListener('resize', on);
      window.removeEventListener('orientationchange', on);
      if (window.visualViewport) window.visualViewport.removeEventListener('resize', on);
    };
  }, []);
  return d;
}

function Booking() {
  ensureBookingKeys();
  const dens = useBookingDens();
  const [step, setStep] = React.useState(1);
  const [customer, setCustomer] = React.useState({ ...SAMPLE_CUSTOMER });
  const [pick, setPick] = React.useState({ block: TYPOLOGIES[2].code, towerId: 'C' });
  const [schedule, setSchedule] = React.useState({ visitDate:'', visitTime:'10:00', notes:'' });
  const [bursts, fireBurst] = useBurst(900);
  const [stepFlash, setStepFlash] = React.useState(0);    // bumps each step transition
  const [achievement, setAchievement] = React.useState(null);

  const ty = TYPOLOGIES.find(x => x.code === pick.block);
  const tw = TOWERS.find(x => x.id === pick.towerId);

  // each step's completion score 0..1 — drives gamified progress fill
  const customerScore = scoreCustomer(customer);
  const residenceScore = pick.block && pick.towerId ? 1 : 0;
  const scheduleScore = (schedule.visitDate ? 0.5 : 0) + (schedule.visitTime ? 0.5 : 0);
  const stepScores = [customerScore, residenceScore, scheduleScore, 1];

  const ACHIEVEMENT_TITLES = [
    'DETAILS CAPTURED · +1',
    'RESIDENCE LOCKED · +1',
    'VISIT SCHEDULED · +1',
    'BOOKING COMPLETE',
  ];

  const advance = (ev) => {
    if (step >= 4) return;
    // reward burst at the button center
    if (ev) {
      const root = document.querySelector('.tablet-bezel').getBoundingClientRect();
      const scale = root.width / 2560;
      const r = ev.currentTarget.getBoundingClientRect();
      const cx = (r.left + r.width / 2 - root.left) / scale;
      const cy = (r.top  + r.height / 2 - root.top) / scale;
      fireBurst(cx, cy, { count: 16 });
    }
    // achievement toast
    setAchievement({ id: Date.now(), label: ACHIEVEMENT_TITLES[step - 1] });
    setTimeout(() => setAchievement(null), 1700);
    setStepFlash(f => f + 1);
    // RealDesk intent event: a completed booking (step 3 → confirmation)
    if (step === 3 && typeof window !== 'undefined' && window.RDA) {
      try { window.RDA.track('booking', (schedule && (schedule.date || schedule.time)) ? 'scheduled' : 'confirmed', 1, { step: 'confirm' }); } catch (e) {}
    }
    setStep(step + 1);
  };

  return (
    <div style={{position:'absolute', inset:0, background:'transparent', color:'var(--ink)', overflow:'hidden'}}>
      <ScreenHeader title="Booking" subtitle="Reserve a residence at The Universe" idx="08"/>

      {/* === GAMIFIED PROGRESS ===
          XP-bar style: 4 step badges connected by a gold fill that animates
          smoothly as steps advance. Each badge pops with a spring on
          activation; completed steps show a checkmark. */}
      <GamifiedProgress step={step} stepScores={stepScores} flashKey={stepFlash}/>

      {/* achievement toast */}
      <AchievementToast a={achievement}/>

      {/* burst layer for tap rewards (sits behind the buttons) */}
      <BurstLayer bursts={bursts} zIndex={4}/>

      <div style={{position:'absolute', top:dlerp(dens,372,360), left:60, right:60, bottom:dlerp(dens,140,150), overflow:'hidden'}}>
        <StepFader stepKey={step}>
          {step === 1 && <StepCustomer customer={customer} setCustomer={setCustomer} dens={dens}/>}
          {step === 2 && <StepResidence pick={pick} setPick={setPick} fireBurst={fireBurst} dens={dens}/>}
          {step === 3 && <StepSchedule schedule={schedule} setSchedule={setSchedule} fireBurst={fireBurst} dens={dens}/>}
          {step === 4 && <StepConfirm customer={customer} ty={ty} tw={tw} schedule={schedule} dens={dens}/>}
        </StepFader>
      </div>

      {/* footer nav */}
      <div style={{position:'absolute', bottom:dlerp(dens,48,56), left:60, right:60, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <button onClick={()=>setStep(Math.max(1, step-1))} disabled={step===1} className="mono"
          onMouseDown={e=>{ if(step>1) e.currentTarget.style.transform='scale(0.97)'; }}
          onMouseUp={e=>{ e.currentTarget.style.transform='scale(1)'; }}
          onMouseLeave={e=>{ e.currentTarget.style.transform='scale(1)'; }}
          style={{
          padding:dlerp(dens,21,25)+'px '+dlerp(dens,40,48)+'px', borderRadius:105, border:'1px solid var(--line)', background:'transparent',
          color: step===1 ? 'var(--muted)' : 'var(--ink)',
          fontSize:dlerp(dens,19,23), letterSpacing:'0.2em', textTransform:'uppercase',
          opacity: step===1 ? 0.4 : 1, cursor: step===1 ? 'default' : 'pointer',
          transition:'transform 160ms cubic-bezier(0.22,1,0.36,1)',
        }}>← Back</button>

        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:dlerp(dens,11,14)}}>
          <div className="mono" style={{fontSize:dlerp(dens,16,19), letterSpacing:'0.34em', color:'var(--slate)'}}>STEP {step} OF 4</div>
          <ScoreReadout step={step} score={stepScores[step-1] || 0}/>
        </div>

        {step < 4 ? (
          <NextButton onTap={advance} label={step === 3 ? 'Confirm booking →' : 'Next step →'} dens={dens}/>
        ) : (
          <button onClick={()=>navigate('home')} className="mono"
            onMouseDown={e=>{ e.currentTarget.style.transform='scale(0.97)'; }}
            onMouseUp={e=>{ e.currentTarget.style.transform='scale(1)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform='scale(1)'; }}
            style={{
            padding:dlerp(dens,21,25)+'px '+dlerp(dens,40,48)+'px', borderRadius:105, border:'1px solid var(--gold)', background:'var(--night)', color:'var(--gold)',
            fontSize:dlerp(dens,19,23), letterSpacing:'0.2em', textTransform:'uppercase', cursor:'pointer',
            transition:'transform 160ms cubic-bezier(0.22,1,0.36,1)',
          }}>Back to home →</button>
        )}
      </div>

      {/* ── COMING SOON — an OPAQUE ivory scrim fully hides the live form behind
          it; the module reads as built-but-not-yet-open, with a clear way home ── */}
      <div style={{position:'absolute', inset:0, zIndex:60, display:'flex', alignItems:'center', justifyContent:'center',
        background:'linear-gradient(135deg, var(--ivory) 0%, var(--ivory-2) 46%, var(--ivory-3) 100%)'}}>
        <div style={{textAlign:'center', maxWidth:780, padding:'58px 66px', borderRadius:26,
          background:'rgba(255,253,248,0.9)', border:'1px solid var(--line)',
          boxShadow:'0 30px 80px rgba(40,30,12,0.16), inset 0 1px 0 rgba(255,255,255,0.7)'}}>
          <div className="mono" style={{fontSize:16, letterSpacing:'0.36em', color:'var(--gold-deep)'}}>MODULE · 08 / BOOKING</div>
          <div className="serif" style={{fontSize:84, fontWeight:300, letterSpacing:'-0.03em', lineHeight:0.95, marginTop:18, color:'var(--ink)'}}>
            Coming <span style={{fontStyle:'italic', color:'var(--gold-deep)'}}>soon</span>
          </div>
          <div style={{width:80, height:1, margin:'26px auto 0', background:'linear-gradient(90deg, transparent, var(--gold), transparent)'}}/>
          <div className="serif" style={{fontSize:25, color:'var(--graphite)', marginTop:26, lineHeight:1.5}}>
            Online reservations open shortly. Until then, our sales team will gladly reserve your residence in person.
          </div>
          <button onClick={()=>navigate('home')} className="mono"
            onMouseDown={e=>{ e.currentTarget.style.transform='scale(0.97)'; }}
            onMouseUp={e=>{ e.currentTarget.style.transform='scale(1)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform='scale(1)'; }}
            style={{marginTop:40, display:'inline-flex', alignItems:'center', gap:12, cursor:'pointer',
              padding:'20px 42px', borderRadius:105, border:'1px solid var(--gold-deep)',
              background:'linear-gradient(135deg, var(--gold), var(--gold-deep))', color:'#2a1d05',
              fontSize:18, letterSpacing:'0.2em', fontWeight:600, textTransform:'uppercase',
              boxShadow:'0 14px 30px rgba(176,138,63,0.30)', transition:'transform 160ms cubic-bezier(0.22,1,0.36,1)'}}>
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
}

// === Score helper — how complete is the customer step? ====================
function scoreCustomer(c) {
  let s = 0;
  if (c.name && c.name.trim().length > 1) s += 0.30;
  if (c.phone && c.phone.replace(/\D/g, '').length >= 10) s += 0.25;
  if (c.email && /@/.test(c.email)) s += 0.25;
  if (c.pan && c.pan.length >= 5) s += 0.20;
  return Math.min(1, s);
}

// === GamifiedProgress — XP-bar with step badges ============================
function GamifiedProgress({ step, stepScores, flashKey }) {
  const STEPS = ['Customer', 'Residence', 'Schedule', 'Confirm'];
  const fill = ((step - 1) + (stepScores[step - 1] || 0)) / 3;
  return (
    <div style={{position:'absolute', top:240, left:60, right:60, zIndex:5}}>
      {/* the connector bar (positioned behind badges) */}
      <div style={{position:'absolute', top:32, left:32, right:32, height:5, borderRadius:3, background:'rgba(176,138,63,0.15)'}}>
        <div style={{
          height:'100%', borderRadius:3,
          width: `${Math.min(1, fill) * 100}%`,
          background:'linear-gradient(90deg, var(--gold-deep) 0%, var(--gold) 50%, var(--gold-soft) 100%)',
          boxShadow:'0 0 23px rgba(232,215,168,0.65)',
          transition:'width 620ms cubic-bezier(0.22,1,0.36,1)',
        }}/>
      </div>

      <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:21, position:'relative'}}>
        {STEPS.map((s, i) => {
          const n = i + 1;
          const done = step > n;
          const cur  = step === n;
          return (
            <div key={s} style={{display:'flex', flexDirection:'column', alignItems:'center', gap:15, flex:'0 0 auto'}}>
              <div
                key={`badge-${flashKey}-${n}`}
                style={{
                  width:71, height:71, borderRadius:'50%',
                  background: done ? 'var(--gold-deep)' : (cur ? 'var(--gold)' : 'var(--ivory)'),
                  border: '2.6px solid '+(done ? 'var(--gold-deep)' : (cur ? 'var(--gold)' : 'rgba(176,138,63,0.30)')),
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color: done ? 'var(--ivory)' : (cur ? '#1a130a' : 'var(--slate)'),
                  fontFamily:'JetBrains Mono', fontSize:23, fontWeight:700,
                  transition:'background 280ms, border-color 280ms, color 280ms, box-shadow 280ms',
                  boxShadow: cur ? '0 0 0 8px rgba(232,215,168,0.22), 0 8px 24px rgba(176,138,63,0.32)' : (done ? '0 5px 16px rgba(176,138,63,0.25)' : 'none'),
                  animation: cur ? 'uniBadgePop 520ms cubic-bezier(0.22,1,0.36,1)' : (done ? 'uniBadgeStamp 460ms cubic-bezier(0.22,1,0.36,1)' : 'none'),
                }}>
                {done ? <Icons.check width={29} height={29}/> : n}
              </div>
              <div className="mono" style={{
                fontSize:16, letterSpacing:'0.28em', textTransform:'uppercase',
                color: done || cur ? 'var(--ink)' : 'var(--muted)',
                transition:'color 240ms',
              }}>{s}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// === Achievement toast — slides in from top, fades after 1.7s ============
function AchievementToast({ a }) {
  if (!a) return null;
  return (
    <div key={a.id} style={{
      position:'absolute', top:130, left:'50%', transform:'translateX(-50%)',
      zIndex:30,
      animation: 'uniAchSlide 1700ms ease-out forwards',
      pointerEvents:'none',
    }}>
      <div style={{
        display:'flex', alignItems:'center', gap:19,
        padding:'19px 38px', borderRadius:105,
        background:'linear-gradient(90deg, var(--gold-deep), var(--gold))',
        boxShadow:'0 17px 53px rgba(176,138,63,0.45), 0 0 0 5px rgba(232,215,168,0.20)',
        color:'#1a130a',
      }}>
        <span style={{fontSize:25}}>★</span>
        <span className="mono" style={{fontSize:18, letterSpacing:'0.32em', fontWeight:700}}>{a.label}</span>
      </div>
    </div>
  );
}

// === Score readout — small "x% complete" ticker under STEP X OF 4 =========
function ScoreReadout({ step, score }) {
  const pct = Math.round(score * 100);
  return (
    <div style={{display:'flex', alignItems:'center', gap:13}}>
      <div style={{width:179, height:5, borderRadius:3, background:'rgba(176,138,63,0.16)', overflow:'hidden'}}>
        <div style={{
          height:'100%', borderRadius:3,
          width: `${pct}%`,
          background:'var(--gold)',
          transition:'width 480ms cubic-bezier(0.22,1,0.36,1)',
        }}/>
      </div>
      <div className="mono" style={{fontSize:15, letterSpacing:'0.24em', color:'var(--gold-deep)', minWidth:57, textAlign:'left'}}>{pct}%</div>
    </div>
  );
}

// === StepFader — cross-fade + slide between steps ========================
function StepFader({ stepKey, children }) {
  return (
    <div key={stepKey}
      style={{
        position:'absolute', inset:0,
        display:'flex', flexDirection:'column', justifyContent:'center',
        animation: 'uniStepIn 520ms cubic-bezier(0.22,1,0.36,1) both',
      }}>
      {children}
    </div>
  );
}

// === NextButton — magnetic-CTA-style with tap reward burst ===============
function NextButton({ onTap, label, dens = 0 }) {
  const d = dens;
  return (
    <button onClick={onTap} className="mono"
      style={{
        position:'relative',
        padding:dlerp(d,25,30)+'px '+dlerp(d,50,58)+'px', borderRadius:105,
        border:'1px solid var(--gold-deep)',
        background:'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)',
        color:'#1a130a',
        fontSize:dlerp(d,19,23), letterSpacing:'0.22em', textTransform:'uppercase',
        cursor:'pointer', fontWeight:700,
        boxShadow:'0 17px 38px rgba(176,138,63,0.45), 0 6px 17px rgba(176,138,63,0.20), inset 0 1px 0 rgba(255,255,255,0.42)',
        transition:'transform 200ms cubic-bezier(0.22,1,0.36,1), box-shadow 200ms ease',
      }}
      onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={e   => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseLeave={e=> { e.currentTarget.style.transform = 'scale(1)'; }}>
      {label}
    </button>
  );
}

function StepCustomer({ customer, setCustomer, dens = 0 }) {
  const d = dens;
  const set = (k, v) => setCustomer({ ...customer, [k]: v });
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:dlerp(d,53,80), height:'100%', alignItems:'stretch'}}>
      {/* LEFT — pitch, vertically centred */}
      <div style={{display:'flex', flexDirection:'column', justifyContent:'center', gap:dlerp(d,32,44)}}>
        <div className="serif" style={{fontSize:dlerp(d,76,92), fontWeight:300, lineHeight:1.05, letterSpacing:'-0.025em'}}>
          Tell us a little about <em style={{fontStyle:'italic', color:'var(--gold-deep)'}}>you.</em>
        </div>
        <div style={{fontSize:dlerp(d,25,31), color:'var(--graphite)', lineHeight:1.5}}>
          We use this information to personalise your visit, your cost sheet, and your home-loan options.
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:13, padding:dlerp(d,25,32)+'px '+dlerp(d,29,34)+'px', background:'var(--ivory-2)', border:'1px solid var(--line)', borderRadius:15}}>
          <div className="mono" style={{fontSize:dlerp(d,15,18), letterSpacing:'0.3em', color:'var(--gold-deep)'}}>YOUR PRIVACY</div>
          <div style={{fontSize:dlerp(d,19,23), color:'var(--graphite)', lineHeight:1.55}}>
            Your details are stored only on this tablet. Our sales team will reach out within 24 hours.
          </div>
        </div>
      </div>

      {/* RIGHT — fields grouped at the vertical centre (mirrors the left pitch
          column) so they never stretch apart into dead space on the taller
          iPad canvas. */}
      <div style={{display:'flex', flexDirection:'column', justifyContent:'center', gap:dlerp(d,22,30), paddingTop:dlerp(d,6,18), paddingBottom:dlerp(d,6,18)}}>
        <Field label="Full name" v={customer.name}  set={v=>set('name', v)} dens={d}/>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:dlerp(d,19,26)}}>
          <Field label="Phone"     v={customer.phone} set={v=>set('phone',v)} dens={d}/>
          <Field label="Email"     v={customer.email} set={v=>set('email',v)} dens={d}/>
        </div>
        <Field label="PAN"       v={customer.pan || ''} set={v=>set('pan',  v)} dens={d}/>
        <div style={{display:'flex', alignItems:'center', gap:19, padding:dlerp(d,21,28)+'px '+dlerp(d,25,30)+'px', borderRadius:15, background:'var(--ivory-2)', border:'1px solid var(--line)'}}>
          <input id="loan" type="checkbox" checked={!!customer.loanPreApproved} onChange={e=>set('loanPreApproved', e.target.checked)}/>
          <label htmlFor="loan" className="serif" style={{fontSize:dlerp(d,23,28)}}>I have a home-loan pre-approval</label>
        </div>
      </div>
    </div>
  );
}

// Helper — compute burst position in design-space from a click event
function tapPos(ev) {
  const root = document.querySelector('.tablet-bezel');
  if (!root) return { cx: 1280, cy: 800 };
  const rb = root.getBoundingClientRect();
  const scale = rb.width / 2560;
  const r = ev.currentTarget.getBoundingClientRect();
  return {
    cx: (r.left + r.width / 2 - rb.left) / scale,
    cy: (r.top  + r.height / 2 - rb.top) / scale,
  };
}

function StepResidence({ pick, setPick, fireBurst, dens = 0 }) {
  const d = dens;
  const ty = TYPOLOGIES.find(x => x.code === pick.block);
  const tw = TOWERS.find(x => x.id === pick.towerId);

  const onTowerTap = (ev, id) => {
    if (id !== pick.towerId) {
      const { cx, cy } = tapPos(ev);
      fireBurst(cx, cy, { count: 10 });
    }
    setPick({ ...pick, towerId: id });
  };

  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1.1fr', gap:dlerp(d,53,72), height:'100%', alignItems:'center'}}>
      <div style={{display:'flex', flexDirection:'column', justifyContent:'center', gap:dlerp(d,32,42)}}>
        <div className="serif" style={{fontSize:dlerp(d,76,92), fontWeight:300, lineHeight:1.05, letterSpacing:'-0.025em'}}>
          Which residence calls to <em style={{fontStyle:'italic', color:'var(--gold-deep)'}}>you?</em>
        </div>
        <div style={{fontSize:dlerp(d,25,31), color:'var(--graphite)', lineHeight:1.5}}>
          Pick a typology and a tower. We'll lock the unit list to give you priority access at our next visit.
        </div>

        {/* Live preview card — confirms the choice with warmth */}
        <div key={`preview-${pick.block}-${pick.towerId}`} style={{
          padding:dlerp(d,32,40)+'px '+dlerp(d,36,44)+'px', borderRadius:17, marginTop:8,
          background:'linear-gradient(145deg, var(--tile) 0%, var(--tile-deep) 100%)',
          color:'var(--on-tile)',
          boxShadow:'0 23px 53px rgba(50,32,12,0.30), inset 0 1px 0 rgba(255,246,224,0.18)',
          animation: 'uniTowerSelected 520ms cubic-bezier(0.22,1,0.36,1)',
        }}>
          <div className="mono" style={{fontSize:dlerp(d,15,18), letterSpacing:'0.32em', color:'rgba(250,246,232,0.7)'}}>SELECTED</div>
          <div className="serif" style={{fontSize:dlerp(d,44,54), fontWeight:400, lineHeight:1.1, marginTop:13, letterSpacing:'-0.01em'}}>
            {ty?.name} <span style={{fontStyle:'italic', color:'var(--gold-soft)'}}>· Tower {tw?.id}</span>
          </div>
          <div style={{display:'flex', gap:dlerp(d,32,44), marginTop:dlerp(d,21,28), flexWrap:'wrap'}}>
            <div>
              <div className="mono" style={{fontSize:dlerp(d,14,17), letterSpacing:'0.28em', color:'rgba(250,246,232,0.55)'}}>TICKET</div>
              <div className="serif" style={{fontSize:dlerp(d,27,33), marginTop:4}}>{ty ? formatINR(ty.price,{decimals:2}) : '—'}</div>
            </div>
            <div>
              <div className="mono" style={{fontSize:dlerp(d,14,17), letterSpacing:'0.28em', color:'rgba(250,246,232,0.55)'}}>AVAILABLE</div>
              <div className="serif" style={{fontSize:dlerp(d,27,33), marginTop:4}}>{tw ? towerSummary(tw.id).available : '—'} units</div>
            </div>
            <div>
              <div className="mono" style={{fontSize:dlerp(d,14,17), letterSpacing:'0.28em', color:'rgba(250,246,232,0.55)'}}>CLUSTER</div>
              <div className="serif" style={{fontSize:dlerp(d,27,33), marginTop:4}}>{tw?.cluster}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{display:'flex', flexDirection:'column', justifyContent:'center', gap:dlerp(d,25,34)}}>
        <div>
          <div className="mono" style={{fontSize:dlerp(d,15,18), letterSpacing:'0.28em', color:'var(--slate)'}}>TYPOLOGY</div>
          <select style={{width:'100%', marginTop:11, fontSize:dlerp(d,24,30), minHeight:dlerp(d,76,92)}} value={pick.block} onChange={e=>setPick({...pick, block:e.target.value})}>
            {TYPOLOGIES.map(x => <option key={x.code} value={x.code}>{x.name} ({formatINR(x.price,{decimals:2})})</option>)}
          </select>
        </div>
        <div>
          <div className="mono" style={{fontSize:dlerp(d,15,18), letterSpacing:'0.28em', color:'var(--slate)'}}>PREFERRED TOWER</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:dlerp(d,15,19), marginTop:dlerp(d,15,19)}}>
            {TOWERS.map(t => {
              const sel = t.id === pick.towerId;
              return (
                <button key={t.id}
                  onClick={(ev)=>onTowerTap(ev, t.id)}
                  style={{
                    position:'relative',
                    padding:dlerp(d,29,40)+'px 0', borderRadius:17,
                    border:'1px solid '+(sel ? 'var(--gold-deep)' : 'rgba(176,138,63,0.18)'),
                    background: sel
                      ? 'linear-gradient(180deg, var(--tile-light) 0%, var(--tile) 60%, var(--tile-deep) 100%)'
                      : 'var(--ivory-2)',
                    color: sel ? 'var(--on-tile)' : 'var(--ink)',
                    cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:6,
                    boxShadow: sel
                      ? '0 19px 40px rgba(50,32,12,0.32), inset 0 1px 0 rgba(255,246,224,0.22), 0 0 0 3px rgba(232,215,168,0.20)'
                      : '0 5px 15px rgba(10,10,10,0.04)',
                    transition:'transform 220ms cubic-bezier(0.22,1,0.36,1), box-shadow 220ms ease, background 240ms',
                    animation: sel ? 'uniTowerSelected 460ms cubic-bezier(0.22,1,0.36,1)' : 'none',
                  }}>
                  <div className="display" style={{fontSize:dlerp(d,36,44), fontWeight:600, letterSpacing:'0.06em'}}>{t.id}</div>
                  <div className="mono" style={{fontSize:dlerp(d,13,16), letterSpacing:'0.2em', color: sel ? 'rgba(250,246,232,0.7)' : 'var(--slate)'}}>{towerSummary(t.id).available} avail</div>
                  {sel && (
                    <div style={{
                      position:'absolute', top:-10, right:-10,
                      width:32, height:32, borderRadius:'50%',
                      background:'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      boxShadow:'0 5px 13px rgba(176,138,63,0.45)',
                      animation:'uniFieldCheckPop 420ms cubic-bezier(0.22,1,0.36,1) both',
                      color:'#fff',
                    }}>
                      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12l4 4 10-10"/>
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepSchedule({ schedule, setSchedule, fireBurst, dens = 0 }) {
  const D = dens;
  const set = (k, v) => setSchedule({ ...schedule, [k]: v });
  // Available slots — next 14 days
  const today = new Date();
  const days = Array.from({length: 14}, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() + i + 1);
    return d;
  });

  const onDateTap = (ev, key) => {
    if (key !== schedule.visitDate) {
      const { cx, cy } = tapPos(ev);
      fireBurst(cx, cy, { count: 9 });
    }
    set('visitDate', key);
  };
  const onTimeTap = (ev, slot) => {
    if (slot !== schedule.visitTime) {
      const { cx, cy } = tapPos(ev);
      fireBurst(cx, cy, { count: 8 });
    }
    set('visitTime', slot);
  };

  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:dlerp(D,53,72), height:'100%', alignItems:'center'}}>
      <div style={{display:'flex', flexDirection:'column', justifyContent:'center'}}>
        <div className="serif" style={{fontSize:dlerp(D,76,92), fontWeight:300, lineHeight:1.05, letterSpacing:'-0.025em'}}>
          When can we host <em style={{fontStyle:'italic', color:'var(--gold-deep)'}}>you?</em>
        </div>
        <div style={{fontSize:dlerp(D,25,31), color:'var(--graphite)', lineHeight:1.5, marginTop:dlerp(D,25,32)}}>
          Visit our show home at Stratum @ Venus Grounds. The space takes about 60 to 75 minutes to walk through.
        </div>
        <div style={{
          padding:dlerp(D,27,34)+'px '+dlerp(D,32,38)+'px', borderRadius:17,
          background:'linear-gradient(145deg, var(--tile) 0%, var(--tile-deep) 100%)',
          color:'var(--on-tile)',
          marginTop:dlerp(D,34,44), display:'flex', alignItems:'center', gap:dlerp(D,23,28),
          boxShadow:'0 21px 46px rgba(50,32,12,0.28), inset 0 1px 0 rgba(255,246,224,0.18)',
        }}>
          <div style={{
            width:dlerp(D,63,76), height:dlerp(D,63,76), borderRadius:'50%',
            background:'rgba(232,215,168,0.20)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'var(--gold-soft)', flex:'none',
          }}>
            <Icons.location width={dlerp(D,32,38)} height={dlerp(D,32,38)}/>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:6}}>
            <div className="serif" style={{fontSize:dlerp(D,27,33), fontWeight:400}}>Stratum @ Venus Grounds</div>
            <div className="mono" style={{fontSize:dlerp(D,15,18), letterSpacing:'0.24em', color:'rgba(250,246,232,0.7)'}}>NEHRU NAGAR · AHMEDABAD · 380015</div>
          </div>
        </div>
      </div>

      <div style={{display:'flex', flexDirection:'column', justifyContent:'center', gap:dlerp(D,25,32), height:'100%'}}>
        <div className="mono" style={{fontSize:dlerp(D,15,18), letterSpacing:'0.28em', color:'var(--slate)'}}>PICK A DATE</div>
        <div className="scroll" style={{display:'flex', gap:dlerp(D,13,16), paddingBottom:11, overflow:'auto', flex:'none'}}>
          {days.map((d) => {
            const key = d.toISOString().slice(0,10);
            const sel = schedule.visitDate === key;
            return (
              <button key={key} onClick={(ev)=>onDateTap(ev, key)} style={{
                flexShrink:0, padding:dlerp(D,23,30)+'px '+dlerp(D,27,32)+'px', borderRadius:17,
                border:'1px solid '+(sel ? 'var(--gold-deep)' : 'rgba(176,138,63,0.16)'),
                background: sel
                  ? 'linear-gradient(180deg, var(--tile-light) 0%, var(--tile) 60%, var(--tile-deep) 100%)'
                  : 'var(--ivory-2)',
                color: sel ? 'var(--on-tile)' : 'var(--ink)',
                display:'flex', flexDirection:'column', alignItems:'center', gap:dlerp(D,6,9), minWidth:dlerp(D,111,128), cursor:'pointer',
                boxShadow: sel
                  ? '0 19px 36px rgba(50,32,12,0.32), inset 0 1px 0 rgba(255,246,224,0.20), 0 0 0 3px rgba(232,215,168,0.18)'
                  : '0 4px 13px rgba(10,10,10,0.03)',
                transition:'transform 220ms cubic-bezier(0.22,1,0.36,1), box-shadow 220ms ease, background 240ms',
                animation: sel ? 'uniTowerSelected 460ms cubic-bezier(0.22,1,0.36,1)' : 'none',
              }}>
                <div className="mono" style={{fontSize:dlerp(D,14,17), letterSpacing:'0.22em', color: sel ? 'rgba(250,246,232,0.7)' : 'var(--slate)'}}>{d.toLocaleDateString('en',{weekday:'short'}).toUpperCase()}</div>
                <div className="serif" style={{fontSize:dlerp(D,38,46), fontWeight:400, lineHeight:1}}>{d.getDate()}</div>
                <div className="mono" style={{fontSize:dlerp(D,14,17), letterSpacing:'0.18em', color: sel ? 'rgba(232,215,168,0.85)' : 'var(--muted)'}}>{d.toLocaleDateString('en',{month:'short'}).toUpperCase()}</div>
              </button>
            );
          })}
        </div>

        <div className="mono" style={{fontSize:dlerp(D,15,18), letterSpacing:'0.28em', color:'var(--slate)', marginTop:dlerp(D,15,20)}}>PREFERRED TIME</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:dlerp(D,15,18)}}>
          {['10:00','12:00','14:00','16:00','17:30','19:00'].map(slot => {
            const sel = slot === schedule.visitTime;
            return (
              <button key={slot} onClick={(ev)=>onTimeTap(ev, slot)} className="mono" style={{
                padding:dlerp(D,23,30)+'px 0', borderRadius:15,
                border:'1px solid '+(sel ? 'var(--gold-deep)' : 'rgba(176,138,63,0.16)'),
                background: sel
                  ? 'linear-gradient(180deg, var(--tile-light) 0%, var(--tile) 100%)'
                  : 'var(--ivory-2)',
                color: sel ? 'var(--on-tile)' : 'var(--ink)',
                fontSize:dlerp(D,19,23), letterSpacing:'0.18em', cursor:'pointer', fontWeight: sel ? 700 : 500,
                boxShadow: sel
                  ? '0 15px 29px rgba(50,32,12,0.28), inset 0 1px 0 rgba(255,246,224,0.20)'
                  : '0 3px 11px rgba(10,10,10,0.03)',
                transition:'transform 220ms cubic-bezier(0.22,1,0.36,1), box-shadow 220ms ease, background 240ms',
                animation: sel ? 'uniTowerSelected 420ms cubic-bezier(0.22,1,0.36,1)' : 'none',
              }}>{slot}</button>
            );
          })}
        </div>

        <div style={{display:'flex', flexDirection:'column', flex:'1 1 auto', minHeight:dlerp(D,150,180)}}>
          <div className="mono" style={{fontSize:dlerp(D,15,18), letterSpacing:'0.28em', color:'var(--slate)'}}>SPECIAL REQUESTS (OPTIONAL)</div>
          <textarea value={schedule.notes} onChange={e=>set('notes', e.target.value)} placeholder="e.g. lake-facing unit, vaastu compliance, schools nearby..."
            style={{width:'100%', marginTop:11, fontSize:dlerp(D,24,29), flex:'1 1 auto', resize:'none'}}/>
        </div>
      </div>
    </div>
  );
}

function StepConfirm({ customer, ty, tw, schedule, dens = 0 }) {
  const D = dens;
  const t = useLoop();
  // Trigger confetti shortly after the check finishes drawing
  const [fire, setFire] = React.useState(0);
  React.useEffect(() => {
    const t1 = setTimeout(() => setFire(f => f + 1), 1200);
    return () => clearTimeout(t1);
  }, []);

  return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:dlerp(D,32,42), height:'100%', textAlign:'center', position:'relative'}}>
      <ConfettiCannon trigger={fire} originX="50%" originY="32%"/>
      {/* gold check ring */}
      <div style={{position:'relative', width:dlerp(D,231,272), height:dlerp(D,231,272)}}>
        <svg viewBox="0 0 100 100" width={dlerp(D,231,272)} height={dlerp(D,231,272)} style={{position:'relative', zIndex:2}}>
          <circle cx="50" cy="50" r="46" fill="none" stroke="var(--gold)" strokeWidth="1.2"
            strokeDasharray={Math.PI*92} strokeDashoffset={Math.PI*92*(1-clamp(t/0.9))}/>
          <path d="M 32 52 L 45 64 L 70 38" fill="none" stroke="var(--gold-deep)" strokeWidth="4"
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="80" strokeDashoffset={80*(1-clamp((t-0.6)/0.5))}/>
        </svg>
        {/* contained pulse ring — stays within the 220px frame */}
        {[0,1].map(i => {
          const phase = ((t + i*0.7) % 2.4) / 2.4;
          return (
            <div key={i} style={{
              position:'absolute', top:'50%', left:'50%',
              width: 132, height: 132, borderRadius:'50%',
              border:'2px solid var(--gold)',
              transform: `translate(-50%, -50%) scale(${0.85 + phase * 0.55})`,
              opacity: Math.max(0, 0.5 * (1 - phase)),
              pointerEvents:'none',
            }}/>
          );
        })}
      </div>

      <div className="mono" style={{fontSize:dlerp(D,19,23), letterSpacing:'0.36em', color:'var(--gold-deep)'}}>YOUR VISIT IS CONFIRMED</div>
      <div className="serif" style={{fontSize:dlerp(D,95,114), fontWeight:300, letterSpacing:'-0.025em', lineHeight:1.05, maxWidth:1680}}>
          We look forward to hosting you, <em style={{fontStyle:'italic', color:'var(--gold-deep)'}}>{(customer.name||'').split(' ').slice(-1)[0]}.</em>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'auto auto auto', gap:dlerp(D,95,120), marginTop:dlerp(D,25,32)}}>
        <Detail dens={D} k="WHEN"  v={schedule.visitDate ? new Date(schedule.visitDate).toLocaleDateString('en-GB',{weekday:'long', day:'2-digit', month:'long'}) : 'TBD'} sub={schedule.visitTime}/>
        <Detail dens={D} k="WHERE" v="Stratum @ Venus Grounds" sub="Nehru Nagar, Ahmedabad"/>
        <Detail dens={D} k="WHAT"  v={ty.name} sub={'Tower ' + tw.id + ' · ' + tw.cluster}/>
      </div>

      <div className="serif" style={{fontSize:dlerp(D,25,30), color:'var(--slate)', marginTop:dlerp(D,34,42), fontStyle:'italic', maxWidth:945}}>
        Booking ID · UNI-{Math.floor(Math.random() * 9000 + 1000)} · A confirmation has been queued for your records.
      </div>
    </div>
  );
}

function Detail({ k, v, sub, dens = 0 }) {
  const d = dens;
  return (
    <div>
      <div className="mono" style={{fontSize:dlerp(d,15,18), letterSpacing:'0.32em', color:'var(--slate)'}}>{k}</div>
      <div className="serif" style={{fontSize:dlerp(d,34,42), fontWeight:400, marginTop:11, letterSpacing:'-0.005em'}}>{v}</div>
      {sub && <div className="mono" style={{fontSize:dlerp(d,15,18), letterSpacing:'0.22em', color:'var(--gold-deep)', marginTop:8, textTransform:'uppercase'}}>{sub}</div>}
    </div>
  );
}

function Field({ label, v, set, span = 1, dens = 0 }) {
  const d = dens;
  const filled = v && v.toString().trim().length > 1;
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{gridColumn: 'span ' + span, position:'relative'}}>
      <div className="mono" style={{
        fontSize:dlerp(d,15,18), letterSpacing:'0.28em',
        color: filled ? 'var(--gold-deep)' : 'var(--slate)',
        transition:'color 280ms',
      }}>{label.toUpperCase()}</div>
      <div style={{position:'relative', marginTop:dlerp(d,11,14)}}>
        <input type="text" value={v} onChange={e=>set(e.target.value)}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          style={{
            width:'100%', paddingRight: 74,
            fontSize:dlerp(d,24,30), minHeight:dlerp(d,76,92),
            borderColor: focused ? 'var(--gold)' : (filled ? 'rgba(176,138,63,0.40)' : 'var(--line)'),
            background: filled ? 'rgba(232,215,168,0.10)' : 'var(--ivory-2)',
            transition:'border-color 240ms, background 240ms',
          }}/>
        {/* completion check — pops in when field becomes filled */}
        {filled && (
          <div key={'chk-' + label} style={{
            position:'absolute', right:18, top:'50%',
            width:dlerp(d,38,44), height:dlerp(d,38,44), borderRadius:'50%',
            background:'linear-gradient(180deg, var(--gold) 0%, var(--gold-deep) 100%)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 5px 15px rgba(176,138,63,0.40)',
            animation:'uniFieldCheckPop 420ms cubic-bezier(0.22,1,0.36,1) both',
            color:'#fff',
          }}>
            <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l4 4 10-10"/>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

window.Booking = Booking;
