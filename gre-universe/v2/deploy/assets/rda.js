/* ─────────────────────────────────────────────────────────────────────────
   RealDesk Analytics — offline-first usage client for phygital kiosk PWAs.
   Drop ONE tag into every page (parent + each screen), same origin:

     <script src="assets/rda.js"
             data-base="https://analytics.khosha.tech"
             data-slug="<project-slug>"
             data-token="rdk_xxx"
             data-label=""></script>

   What it records (all offline-durable, synced when online):
     • app_open    — once per session (new visit / >30min idle)
     • page_view   — every screen/document load          (target = screen name)
     • asset_call  — every media/asset the page loads     (target = file name)
     • session_end — on leave, with duration_ms
     • custom      — RDA.track('booking'|'emi_calc'|... , target, value, meta)

   Rules honoured (per the RealDesk contract):
     - UUID per event + per session, persisted; retries resend same ids (server dedupes by pk).
     - device_uid = one UUID, persisted forever on the device.
     - 200 → clear sent · 400 → drop batch (don't loop) · 401/404 → stop+warn
       · 429/5xx/413/network → keep buffer, retry later.
     - batches ≤1000 events; ts = ISO-8601 with timezone.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  var S = document.currentScript || (function(){var s=document.getElementsByTagName('script');return s[s.length-1];})();
  var BASE  = (S && S.getAttribute('data-base')  || '').replace(/\/$/, '');
  var SLUG  =  S && S.getAttribute('data-slug')  || '';
  var TOKEN =  S && S.getAttribute('data-token') || '';
  var LABEL = (S && S.getAttribute('data-label')) || localStorage.getItem('rda_label') || null;
  if (!BASE || !SLUG || !TOKEN || !('indexedDB' in window)) return;   // not configured → silent no-op

  var DEV_KEY='rda_did', SESS_KEY='rda_sess', LOCK_KEY='rda_lock', IDLE=30*60*1000, MAX=1000;

  function uuid(){ return (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){var r=Math.random()*16|0;return (c==='x'?r:(r&0x3|0x8)).toString(16);}); }
  function now(){ return new Date().toISOString(); }
  function deviceUid(){ var d=localStorage.getItem(DEV_KEY); if(!d){ d=uuid(); try{localStorage.setItem(DEV_KEY,d);}catch(e){} } return d; }

  // session shared across same-origin frames; rolls over after 30 min idle
  function session(touch){
    var s=null; try{ s=JSON.parse(localStorage.getItem(SESS_KEY)||'null'); }catch(e){}
    var t=Date.now(), fresh=false;
    if(!s || (t - (s.last||0)) > IDLE){ s={ id:uuid(), started_at:now(), last:t }; fresh=true; }
    if(touch){ s.last=t; try{ localStorage.setItem(SESS_KEY, JSON.stringify(s)); }catch(e){} }
    s.fresh=fresh; return s;
  }

  // IndexedDB buffer (durable across offline / reload / power cycle)
  var dbp=new Promise(function(res){ try{ var r=indexedDB.open('rda',1);
    r.onupgradeneeded=function(){ r.result.createObjectStore('ev',{keyPath:'id'}); };
    r.onsuccess=function(){res(r.result);}; r.onerror=function(){res(null);}; }catch(e){res(null);} });
  function buf(ev){ dbp.then(function(db){ if(db) try{ db.transaction('ev','readwrite').objectStore('ev').put(ev);}catch(e){} }); }
  function readAll(){ return dbp.then(function(db){ return new Promise(function(res){ if(!db)return res([]);
    var out=[]; try{ var c=db.transaction('ev').objectStore('ev').openCursor();
      c.onsuccess=function(e){var cur=e.target.result; if(cur){out.push(cur.value); if(out.length<5000)cur.continue(); else res(out);} else res(out);};
      c.onerror=function(){res(out);}; }catch(e){res(out);} }); }); }
  function drop(ids){ dbp.then(function(db){ if(!db)return; try{ var st=db.transaction('ev','readwrite').objectStore('ev'); ids.forEach(function(id){st.delete(id);}); }catch(e){} }); }

  function track(type,target,value,meta){
    var s=session(true);
    buf({ id:uuid(), type:type, target:(target!=null?String(target):null),
          value:(value==null?null:value), ts:now(), meta:meta||{}, _sid:s.id, _sstart:s.started_at });
    schedule();
  }

  // ── sync ──────────────────────────────────────────────────────────────
  var busy=false, timer=null;
  function schedule(){ if(timer) return; timer=setTimeout(function(){ timer=null; sync(); }, 1800); }
  function locked(){ var v=+(localStorage.getItem(LOCK_KEY)||0); return Date.now()-v < 12000; }   // soft cross-frame throttle
  function lock(on){ try{ on?localStorage.setItem(LOCK_KEY,Date.now()):localStorage.removeItem(LOCK_KEY);}catch(e){} }

  function sync(){
    if(busy || !navigator.onLine || locked()) return;
    busy=true; lock(true);
    readAll().then(function(evs){
      if(!evs.length){ busy=false; lock(false); return; }
      var batch=evs.slice(0,MAX), sid=batch[0]._sid, sstart=batch[0]._sstart;
      var body={ slug:SLUG,
        device:{ device_uid:deviceUid(), label:LABEL, user_agent:navigator.userAgent, platform:navigator.platform||'' },
        session:{ id:sid, started_at:sstart },
        events: batch.map(function(e){ return { id:e.id, type:e.type, target:e.target, value:e.value, ts:e.ts, meta:e.meta }; }) };
      fetch(BASE+'/api/ingest',{ method:'POST', keepalive:true,
        headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+TOKEN },
        body: JSON.stringify(body) })
      .then(function(r){
        var ids=batch.map(function(e){return e.id;});
        if(r.status===200){ drop(ids); busy=false; lock(false); if(evs.length>batch.length) setTimeout(sync,400); return; }
        if(r.status===400){ drop(ids); busy=false; lock(false); return; }                 // malformed → drop, no loop
        if(r.status===401){ console.warn('[RDA] bad write token'); busy=false; lock(false); return; }
        if(r.status===404){ console.warn('[RDA] slug not registered — re-run the deploy skill'); busy=false; lock(false); return; }
        busy=false; lock(false);                                                            // 413/429/5xx → keep, retry later
      })
      .catch(function(){ busy=false; lock(false); });                                       // network → keep buffer
    }).catch(function(){ busy=false; lock(false); });
  }

  // ── wiring ────────────────────────────────────────────────────────────
  // canonical asset name: assets-relative path, no query, no extension  → "lanterns/3d/spring", "home/btn-place", "floorplans/hi/3br"
  function assetName(raw){
    var p; try{ p=new URL(raw, location.href).pathname; }catch(e){ p=raw.split('?')[0]; }
    var n=p.replace(/^.*\/assets\//,'').replace(/^\.?\//,'').replace(/\.[a-z0-9]+$/i,'');
    if(!n){ n=(p.split('/').pop()||raw).replace(/\.[a-z0-9]+$/i,''); }
    return n || raw;
  }
  function pageName(){
    var t=(document.title||'').trim();
    if(t){ var parts=t.split(/[·|–-]/); return parts[parts.length-1].trim() || t; }
    return (location.pathname.split('/').pop()||'index').replace(/\.html?$/,'') || 'index';
  }
  function start(){
    var s=session(true);
    if(s.fresh) track('app_open', pageName());
    track('page_view', pageName());
    try{
      var seen={};
      var po=new PerformanceObserver(function(list){
        list.getEntries().forEach(function(e){
          if(!e.name || seen[e.name]) return;
          if(/^(img|css|script|link|fetch|xmlhttprequest|other|video|audio)$/.test(e.initiatorType||'')){
            seen[e.name]=1;
            track('asset_call', assetName(e.name), Math.round(e.duration||0), { url:e.name, kind:e.initiatorType });
          }
        });
      });
      po.observe({ type:'resource', buffered:true });
    }catch(e){}
    setInterval(sync, 60000);
    window.addEventListener('online', sync);
    document.addEventListener('visibilitychange', function(){ if(document.visibilityState==='hidden') sync(); });
    window.addEventListener('pagehide', function(){
      var s2=session(true); track('session_end', pageName(), Date.now()-Date.parse(s2.started_at), { session_id:s2.id }); sync();
    });
    sync();
  }
  // public API for custom events: RDA.track('booking','3BR',1,{...}) · RDA.label('SP Road kiosk 1')
  window.RDA={ track:track, sync:sync, label:function(l){ LABEL=l; try{localStorage.setItem('rda_label',l);}catch(e){} } };
  if(document.readyState!=='loading') start(); else document.addEventListener('DOMContentLoaded', start);
})();
