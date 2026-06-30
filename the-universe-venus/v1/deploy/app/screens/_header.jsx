// Reusable screen header — back button + title + Universe brand mark on the right.
// Sizes match the home screen's editorial scale so every screen reads consistently
// when the 2560×1600 design is scaled to a tablet.
function ScreenHeader({ title, subtitle, idx }) {
  const t = useLoop();
  const e = clamp(t/0.5);
  return (
    <div style={{position:'absolute',top:54,left:72,right:72,display:'flex',justifyContent:'space-between',alignItems:'flex-end', opacity:e, transform:`translateY(${(1-e)*-12}px)`, zIndex: 10}}>
      <div style={{display:'flex',alignItems:'flex-end',gap:34}}>
        <button onClick={()=>navigate('home')} style={{
          width:78,height:78,borderRadius:'50%',
          border:'1.4px solid var(--line)', background:'transparent',
          display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'var(--ink)',
          transition:'all 240ms',
        }}
          onMouseEnter={ev=>{ev.currentTarget.style.background='var(--gold)'; ev.currentTarget.style.color='#0a0807'; ev.currentTarget.style.borderColor='var(--gold)';}}
          onMouseLeave={ev=>{ev.currentTarget.style.background='transparent'; ev.currentTarget.style.color='var(--ink)'; ev.currentTarget.style.borderColor='var(--line)';}}
        >
          <Icons.back width={28} height={28}/>
        </button>
        <div>
          <div className="mono" style={{fontSize:18, letterSpacing:'0.42em', color:'var(--gold-deep)'}}>MODULE · {idx}</div>
          <div className="serif" style={{fontSize:96, fontWeight:300, letterSpacing:'-0.025em', lineHeight:1, marginTop:12}}>{title}</div>
          {subtitle && <div style={{fontSize:24, color:'var(--slate)', marginTop:14, lineHeight:1.4, fontStyle:'italic'}}>{subtitle}</div>}
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:22}}>
        <UniverseMonogram size={68} progress={1} color="var(--gold-deep)"/>
        <div style={{display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end'}}>
          <UniverseWordmark size={26} color="var(--ink)" tight/>
          <VenusCredit size={13}/>
        </div>
      </div>
    </div>
  );
}
window.ScreenHeader = ScreenHeader;
