// Tablet screensaver — looped Remotion-rendered MP4 in a centred 80% popup
// over a blurred backdrop of the underlying app.
//
// Triggers after 30 s of no input (`useIdleTrigger`). Dismisses on any
// pointer/touch/wheel/keyboard event with the dismiss handler stopping
// propagation so a stray tap doesn't activate the underlying app.
//
// The MP4 itself contains the dark-beige tint, the Universe logo lockup,
// the "Center of everything." headline, and the wordmark — rendered via
// Remotion at /Users/mi1k/Documents/Khosha system/remotion (composition
// `UniverseSaver`).

const SAVER_ENTER_KEYS = 'uni-saver-fade-keys';
function ensureSaverFadeKeys() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(SAVER_ENTER_KEYS)) return;
  const s = document.createElement('style');
  s.id = SAVER_ENTER_KEYS;
  s.textContent = `
    @keyframes uniSaverBackdropIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes uniSaverPopupIn {
      from { opacity: 0; transform: scale(0.94); }
      to   { opacity: 1; transform: scale(1);    }
    }
    @keyframes uniSaverHintBlink {
      0%, 100% { opacity: 0.55; }
      50%      { opacity: 1; }
    }
  `;
  document.head.appendChild(s);
}

function ScreenSaver({ onDismiss }) {
  ensureSaverFadeKeys();
  const videoRef = React.useRef(null);

  // Try to play the video on mount — autoplay+muted is required by some
  // browsers, even on user-instigated mounts.
  React.useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const play = () => v.play().catch(() => {});
    play();
    const id = setTimeout(play, 50);
    return () => clearTimeout(id);
  }, []);

  // Dismiss on any user input — capture phase so the app underneath
  // never sees the event.
  React.useEffect(() => {
    const dismiss = (ev) => {
      if (ev) { try { ev.stopPropagation(); ev.preventDefault(); } catch(_){} }
      onDismiss();
    };
    const events = ['pointerdown', 'mousedown', 'touchstart', 'keydown', 'wheel'];
    events.forEach(e => window.addEventListener(e, dismiss, { passive: false, capture: true }));
    return () => events.forEach(e => window.removeEventListener(e, dismiss, { capture: true }));
  }, [onDismiss]);

  return (
    <div style={{
      position:'fixed', inset:0, zIndex: 99999,
      pointerEvents:'auto',
    }}>
      {/* === Backdrop — solid black. Fully opaque so there's no grey blur /
              shadow halo behind the popup; the card reads as a clean panel
              floating on black. */}
      <div style={{
        position:'absolute', inset:0,
        background:'#000000',
        animation:'uniSaverBackdropIn 600ms ease both',
      }}/>

      {/* === Centred 16:9 popup ======================================
              The saver video is 1920×1080 (16:9). The popup is sized to the
              video's aspect and fit within the viewport (whichever of width /
              height constrains) so the FULL frame — logo, "Center of everything."
              headline and wordmark — is always shown with NO crop, on any device
              aspect (16:10 tablet, 4:3 iPad). Floats centred on the black backdrop. */}
      <div style={{
        position:'absolute', inset:0,
        display:'flex', alignItems:'center', justifyContent:'center',
        animation:'uniSaverPopupIn 720ms cubic-bezier(0.22,1,0.36,1) both',
      }}>
      <div style={{
        position:'relative',
        width:'min(84vw, calc(84vh * 16 / 9))',
        aspectRatio:'16 / 9',
        borderRadius: 32,
        overflow:'hidden',
        border:'1px solid rgba(232,215,168,0.32)',
        boxShadow:
          '0 0 60px rgba(232,215,168,0.14), ' +
          'inset 0 1px 0 rgba(255,255,255,0.16)',
        background:'#0a0a0a',
      }}>
        <video
          ref={videoRef}
          src="assets/saver/universe-saver.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          style={{
            position:'absolute', inset:0,
            width:'100%', height:'100%',
            objectFit:'cover',
            display:'block',
            pointerEvents:'none',
          }}
        />

        {/* Soft "tap anywhere to return" hint, bottom-right of the popup */}
        <div style={{
          position:'absolute', right: 36, bottom: 30, zIndex:5,
          display:'flex', alignItems:'center', gap:14,
          color:'rgba(250,246,232,0.62)',
          animation: 'uniSaverHintBlink 1.8s ease-in-out infinite',
          textShadow:'0 2px 12px rgba(0,0,0,0.55)',
          pointerEvents:'none',
        }}>
          <div style={{
            width:8, height:8, borderRadius:'50%',
            background:'#ead7a8',
            boxShadow:'0 0 10px rgba(232,215,168,0.6)',
          }}/>
          <div className="mono" style={{
            fontSize:14, letterSpacing:'0.36em', textTransform:'uppercase',
          }}>
            Tap anywhere to return
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

// useIdleTrigger — fires `onIdle` after `idleMs` of no input. Resets on
// any pointer / touch / keyboard activity.
function useIdleTrigger(idleMs, onIdle, active) {
  React.useEffect(() => {
    if (!active) return;
    let timer = setTimeout(onIdle, idleMs);
    const reset = () => { clearTimeout(timer); timer = setTimeout(onIdle, idleMs); };
    const events = ['mousemove','mousedown','touchstart','touchmove','keydown','wheel','pointerdown'];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    return () => {
      clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, reset));
    };
  }, [idleMs, onIdle, active]);
}

window.ScreenSaver = ScreenSaver;
window.useIdleTrigger = useIdleTrigger;
