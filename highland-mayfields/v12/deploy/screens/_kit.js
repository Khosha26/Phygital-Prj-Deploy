/* ============================================================
   HIGHLAND MAYFIELDS — SCREEN KIT JS  (window.HMKit)
   Back nav · reveal stagger · floating window · lightbox · swipe ·
   tap ripple · count-up · constant sales-tools FAB injection.
   Each screen: set window.HM_SCREEN_INFO={title, html} for the FAB "Info" action.
   ============================================================ */
(function(){
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var $  = function(s,r){ return (r||document).querySelector(s); };
  var $$ = function(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };

  /* ---------- background + grain auto-inject (so screens stay lean) ---------- */
  function ensureBg(){
    if(!$('.scr-bg')){ var b=document.createElement('div'); b.className='scr-bg'; document.body.insertBefore(b,document.body.firstChild); }
    if(!$('.scr-bgimg')){ var w=document.createElement('div'); w.className='scr-bgimg'; document.body.insertBefore(w,document.body.firstChild); }
    if(!$('.scr-bgline')){ var ln=document.createElement('div'); ln.className='scr-bgline'; document.body.insertBefore(ln,document.body.firstChild); }
    if(!$('.scr-grain')){ var g=document.createElement('div'); g.className='scr-grain'; document.body.insertBefore(g,document.body.firstChild); }
  }

  /* ---------- back navigation ---------- */
  function back(){
    try{ if(window.parent && window.parent!==window){ window.parent.postMessage('hm:screen-close','*'); return; } }catch(e){}
    if(history.length>1) history.back();
  }

  /* ---------- reveal-on-load (staggered) ---------- */
  function reveal(){
    var els=$$('[data-reveal]');
    els.forEach(function(el,i){ if(!el.style.getPropertyValue('--d')) el.style.setProperty('--d', Math.min(i*70,900)+'ms'); });
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ var s=$('.scr'); if(s) s.classList.add('ready'); }); });
  }

  /* ---------- tap ripple ---------- */
  function rippleOn(el){
    el.addEventListener('pointerdown', function(e){
      if(reduce) return; var r=el.getBoundingClientRect();
      var ink=document.createElement('span'); ink.className='k-ripple-ink';
      var d=Math.max(r.width,r.height)*1.4;
      ink.style.width=ink.style.height=d+'px';
      ink.style.left=(e.clientX-r.left)+'px'; ink.style.top=(e.clientY-r.top)+'px';
      var cs=getComputedStyle(el); if(cs.position==='static') el.style.position='relative';
      if(cs.overflow==='visible') el.style.overflow='hidden';
      el.appendChild(ink); setTimeout(function(){ ink.remove(); },650);
    }, {passive:true});
  }
  function bindRipples(root){ $$('.k-card.int,.k-btn,.k-chip,[data-ripple]',root).forEach(rippleOn); }

  /* ---------- swipe ---------- */
  function swipe(el, opts){
    opts=opts||{}; var x0=0,y0=0,t0=0,tracking=false;
    el.addEventListener('touchstart',function(e){ var t=e.touches[0]; x0=t.clientX; y0=t.clientY; t0=Date.now(); tracking=true; },{passive:true});
    el.addEventListener('touchend',function(e){
      if(!tracking) return; tracking=false; var t=e.changedTouches[0];
      var dx=t.clientX-x0, dy=t.clientY-y0, dt=Date.now()-t0;
      if(dt<800 && Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)*1.4){ if(dx<0&&opts.onLeft)opts.onLeft(); else if(dx>0&&opts.onRight)opts.onRight(); }
      else if(dt<800 && Math.abs(dy)>50 && Math.abs(dy)>Math.abs(dx)*1.4){ if(dy<0&&opts.onUp)opts.onUp(); else if(dy>0&&opts.onDown)opts.onDown(); }
    },{passive:true});
  }

  /* ---------- count-up ([data-count="123"] optional data-suffix) ---------- */
  function countUp(el){
    var target=parseFloat(el.getAttribute('data-count'))||0, suf=el.getAttribute('data-suffix')||'', dur=1100, t0=null;
    if(reduce){ el.textContent=target+suf; return; }
    function step(ts){ if(!t0)t0=ts; var p=Math.min((ts-t0)/dur,1); var e=1-Math.pow(1-p,3);
      el.textContent=Math.round(target*e)+suf; if(p<1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  function bindCounts(root){ $$('[data-count]',root).forEach(function(el){
    var io=new IntersectionObserver(function(en){ en.forEach(function(x){ if(x.isIntersecting){ countUp(el); io.disconnect(); } }); });
    io.observe(el); }); }

  /* ---------- generic floating window ---------- */
  var floatEl, scrimEl;
  function ensureFloat(){
    if(floatEl) return;
    scrimEl=document.createElement('div'); scrimEl.className='k-float-scrim'; scrimEl.addEventListener('click',closeFloat);
    floatEl=document.createElement('div'); floatEl.className='k-float'; floatEl.setAttribute('role','dialog');
    floatEl.innerHTML='<div class="k-float-head"><span class="ttl"></span><button class="x" aria-label="Close">✕</button></div><div class="k-float-body"></div>';
    floatEl.querySelector('.x').addEventListener('click',closeFloat);
    document.body.appendChild(scrimEl); document.body.appendChild(floatEl);
  }
  function openFloat(title, html, opts){
    opts=opts||{}; ensureFloat(); floatEl.querySelector('.ttl').textContent=title||'';
    floatEl.className='k-float'+(opts.center!==false?' center':'')+(opts.wide?' wide':'')+(opts.left?' left':'');
    var body=floatEl.querySelector('.k-float-body'); if(typeof html==='string') body.innerHTML=html; else { body.innerHTML=''; body.appendChild(html); }
    scrimEl.classList.add('on'); requestAnimationFrame(function(){ floatEl.classList.add('on'); }); bindRipples(floatEl);
  }
  function closeFloat(){ if(floatEl){ floatEl.classList.remove('on'); scrimEl.classList.remove('on'); } }

  /* ---------- lightbox ---------- */
  var lb, lbItems=[], lbIdx=0;
  function ensureLb(){
    if(lb) return;
    lb=document.createElement('div'); lb.className='k-lightbox';
    lb.innerHTML='<button class="k-lb-close" aria-label="Close">✕</button>'+
      '<button class="k-lb-nav prev" aria-label="Previous">‹</button>'+
      '<img alt=""><div class="k-lb-cap"></div>'+
      '<button class="k-lb-nav next" aria-label="Next">›</button>';
    document.body.appendChild(lb);
    lb.querySelector('.k-lb-close').addEventListener('click',closeLb);
    lb.querySelector('.prev').addEventListener('click',function(e){e.stopPropagation();lbGo(-1);});
    lb.querySelector('.next').addEventListener('click',function(e){e.stopPropagation();lbGo(1);});
    lb.addEventListener('click',function(e){ if(e.target===lb) closeLb(); });
    swipe(lb,{onLeft:function(){lbGo(1);},onRight:function(){lbGo(-1);}});
    document.addEventListener('keydown',function(e){ if(!lb.classList.contains('on'))return;
      if(e.key==='Escape')closeLb(); if(e.key==='ArrowRight')lbGo(1); if(e.key==='ArrowLeft')lbGo(-1); });
  }
  function lbRender(){ var it=lbItems[lbIdx]||{}; lb.querySelector('img').src=it.src||''; lb.querySelector('.k-lb-cap').textContent=it.title||''; }
  function lbGo(d){ lbIdx=(lbIdx+d+lbItems.length)%lbItems.length; lbRender(); }
  function lightbox(items,i){ ensureLb(); lbItems=items||[]; lbIdx=i||0; lbRender(); lb.classList.add('on'); }
  function closeLb(){ if(lb) lb.classList.remove('on'); }

  /* ---------- constant sales-tools FAB (Price/EMI · Annotate · Info) ---------- */
  function injectFab(){
    if($('#fab')) return;
    var fab=document.createElement('div'); fab.className='fab'; fab.id='fab'; fab.setAttribute('role','group'); fab.setAttribute('aria-label','Sales tools');
    var info = window.HM_SCREEN_INFO ?
      '<button class="fab-action" id="fabInfo" type="button"><svg class="fi" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.6v.3"/></svg> This Screen</button>' : '';
    fab.innerHTML=
      '<div class="fab-actions">'+
        '<button class="fab-action" id="fabEmi" type="button"><svg class="fi" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9.3 11h5.4M9.3 11c2.4 0 2.4 3 0 3h-.9l3 3"/></svg> EMI · Price Sheet</button>'+
        '<button class="fab-action" id="fabAnnot" type="button"><svg class="fi" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l4-1L19 8l-3-3L5 16z"/><path d="M14 7l3 3"/></svg> Annotate</button>'+
        info+
      '</div>'+
      '<button class="fab-toggle" id="fabToggle" type="button" aria-expanded="false" aria-label="Sales tools">'+
        '<svg class="fi fi-open" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>'+
        '<svg class="fi fi-close" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'+
      '</button>';
    document.body.appendChild(fab);
    var fabToggle=$('#fabToggle');
    function fabClose(){ fab.classList.remove('open'); fabToggle.setAttribute('aria-expanded','false'); }
    fabToggle.addEventListener('click',function(){ var o=fab.classList.toggle('open'); fabToggle.setAttribute('aria-expanded',o?'true':'false'); });
    $('#fabEmi').addEventListener('click',function(){ fabClose(); if(window.HMPriceSheet) HMPriceSheet.open(); });
    $('#fabAnnot').addEventListener('click',function(){ fabClose(); if(window.HMAnnotate) HMAnnotate.toggle(); });
    if($('#fabInfo')) $('#fabInfo').addEventListener('click',function(){ fabClose(); var i=window.HM_SCREEN_INFO; if(i) openFloat(i.title,i.html); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&fab.classList.contains('open')) fabClose(); });
    document.addEventListener('pointerdown',function(e){ if(fab.classList.contains('open')&&!fab.contains(e.target)) fabClose(); },true);
    // load tool modules
    ['../assets/js/hm-emi-sheet.js','../assets/js/hm-annotate.js'].forEach(function(src){
      if(!document.querySelector('script[src="'+src+'"]')){ var s=document.createElement('script'); s.src=src; s.defer=true; document.body.appendChild(s); }
    });
  }

  /* ---------- wire back button + esc ---------- */
  function wireChrome(){
    $$('.scr-back,[data-back]').forEach(function(b){ b.addEventListener('click',back); });
    document.addEventListener('keydown',function(e){ if(e.key!=='Escape') return; if($('.k-float.on')){ closeFloat(); return; } if($('.k-lightbox.on')){ closeLb(); return; } back(); });
  }

  /* ---------- decode-gate: reveal only once imagery has actually painted ----------
     Kills the black-flash / half-decoded / red-fallback reveal seen on real Android/iPad,
     where the screen showed before its hero image (or dynamically-built cut-out) finished decoding. */
  function decodeImgs(imgs){
    return Promise.all((imgs||[]).map(function(im){
      if(!im) return Promise.resolve();
      var cap=new Promise(function(r){ setTimeout(r,700); });   // per-image cap
      if(im.decode){ return Promise.race([ im.decode().catch(function(){}), cap ]); }
      if(im.complete) return Promise.resolve();
      return Promise.race([ new Promise(function(r){ im.addEventListener('load',r,{once:true}); im.addEventListener('error',r,{once:true}); }), cap ]);
    }));
  }
  function visibleHeroImgs(){
    return $$('img').filter(function(im){
      if(im.loading==='lazy') return false;
      if(!(im.getAttribute('src')||im.currentSrc)) return false;
      var r=im.getBoundingClientRect(); if(r.width<48||r.height<48) return false;
      var cs=getComputedStyle(im); return cs.display!=='none' && cs.visibility!=='hidden';
    });
  }
  function signalReady(){ try{ if(window.parent&&window.parent!==window) window.parent.postMessage('hm:screen-ready','*'); }catch(_){}}
  function whenHeroReady(cb){
    var done=false, fire=function(){ if(done)return; done=true; cb(); };
    var run=function(){ decodeImgs(visibleHeroImgs()).then(function(){ requestAnimationFrame(function(){ requestAnimationFrame(fire); }); }); };
    if(document.readyState==='complete') run(); else window.addEventListener('load', run, {once:true});
    setTimeout(fire, 1800);   // hard safety cap — never hang on a slow/missing asset
  }
  /* screens call HMKit.gate(imgs, cb) before revealing dynamically-built imagery
     (tower cut-out, gallery day/night switch, villa reveal) so the new pixels are decoded first */
  function gate(imgs, cb){ var done=false, f=function(){ if(done)return; done=true; try{cb();}catch(_){} };
    decodeImgs([].concat(imgs)).then(function(){ requestAnimationFrame(function(){ requestAnimationFrame(f); }); });
    setTimeout(f, 1400); }

  /* PRELOAD+DECODE a list of image srcs in the background (throttled, idle) so every popup /
     detail / lightbox image is already decoded in THIS document before it's shown — the
     permanent cure for the on-tap black/blurry flash on the real device. Idempotent. */
  var _preloaded={};
  function preload(srcs, conc){
    var list=[].concat(srcs||[]).filter(function(s){ return s && !_preloaded[s]; }); if(!list.length) return 0;
    var CONC=conc||4, i=0, active=0;
    function pump(){ while(active<CONC && i<list.length){ (function(src){ _preloaded[src]=1; active++;
      var im=new Image(); im.decoding='async'; im.src=src;
      var done=function(){ active--; pump(); };
      if(im.decode){ im.decode().then(done,done); } else { im.onload=done; im.onerror=done; }
    })(list[i++]); } }
    (window.requestIdleCallback||function(fn){ setTimeout(fn,120); })(pump);
    return list.length;
  }

  function init(){
    if(!document.getElementById('hm-freeze-css')){ var _fs=document.createElement('style'); _fs.id='hm-freeze-css';
      _fs.textContent='html.hm-frozen *{animation-play-state:paused!important}'; document.head.appendChild(_fs); }
    ensureBg(); wireChrome(); injectFab();
    bindRipples(document); bindCounts(document);
    /* gate the FIRST reveal + the parent 'ready' signal on the hero image painting */
    whenHeroReady(function(){ reveal(); signalReady(); });
    // accept parent ping
    window.addEventListener('message',function(e){
      if(!e) return;
      if(e.data==='hm:screen-show'){ document.documentElement.classList.remove('hm-frozen');
        try{ window.dispatchEvent(new Event('hm:shown')); }catch(_){}
        var s=$('.scr'); if(s){ s.classList.remove('ready'); void s.offsetWidth; }
        whenHeroReady(function(){ reveal(); signalReady(); }); }
      else if(e.data==='hm:screen-hide'){ document.documentElement.classList.add('hm-frozen');
        $$('video').forEach(function(v){ try{ v.pause(); }catch(_){}} );
        try{ window.dispatchEvent(new Event('hm:hidden')); }catch(_){}
      }
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();

  window.HMKit={ back:back, openFloat:openFloat, closeFloat:closeFloat, lightbox:lightbox, swipe:swipe,
    countUp:countUp, ripple:rippleOn, bindRipples:bindRipples, reveal:reveal, gate:gate, ready:signalReady, preload:preload };
})();
