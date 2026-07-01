import { chromium } from 'playwright';
const BASE='http://localhost:8210/index.html';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:2560,height:1600},deviceScaleFactor:1});
const p=await c.newPage();
await p.goto(BASE,{waitUntil:'domcontentloaded'});
await p.evaluate(async()=>{try{localStorage.clear();}catch(e){} if(caches){const k=await caches.keys();await Promise.all(k.map(x=>caches.delete(x)));} if(navigator.serviceWorker){const r=await navigator.serviceWorker.getRegistrations();await Promise.all(r.map(x=>x.unregister()));}});
await p.goto(BASE,{waitUntil:'domcontentloaded'});
await p.waitForSelector('#dlOffer:not([hidden]) #dlBtn');
await p.click('#dlBtn');
for(let i=0;i<400;i++){const n=await p.evaluate(()=>document.querySelectorAll('#dlList .dl-row').length);if(n>=20)break;await p.waitForTimeout(30);}
await p.waitForTimeout(100);
const dbg=await p.evaluate(()=>{
  const l=document.getElementById('dlList');
  const cs=getComputedStyle(l);
  // measure paint: is parent .dl-main / .dl-progwrap hiding? check ancestor opacity/visibility
  let anc=[], e=l;
  while(e && e.id!=='dlGate'){const s=getComputedStyle(e);anc.push({id:e.id||e.className,vis:s.visibility,op:s.opacity,disp:s.display,h:s.height,ov:s.overflow});e=e.parentElement;}
  const rows=[...l.querySelectorAll('.dl-row')];
  const visRows=rows.filter(r=>{const rc=r.getBoundingClientRect();return rc.bottom>826 && rc.top<1094;});
  return {mask:cs.webkitMaskImage||cs.maskImage, ancestors:anc, visRowCount:visRows.length,
    firstVisText:visRows[0]?.textContent, firstVisRect:visRows[0]?(r=>({y:r.y|0,h:r.height|0}))(visRows[0].getBoundingClientRect()):null};
});
console.log(JSON.stringify(dbg,null,1));
await p.locator('#dlList').screenshot({path:'/Users/mi1k/Documents/Projects/highland-mayfields/sales-suite/app/_shot-listonly.png'}).catch(e=>console.log('elshot err',e.message));
await b.close();
