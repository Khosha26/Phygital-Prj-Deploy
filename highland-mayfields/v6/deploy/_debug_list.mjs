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
await p.waitForTimeout(2500);
const info=await p.evaluate(()=>{
  const l=document.getElementById('dlList');
  const r=l.getBoundingClientRect();
  const cs=getComputedStyle(l);
  const rows=l.querySelectorAll('.dl-row');
  const f=rows[0]?.getBoundingClientRect();
  const fcs=rows[0]?getComputedStyle(rows[0]):null;
  const nameEl=rows[0]?.querySelector('.dl-rname');
  const ncs=nameEl?getComputedStyle(nameEl):null;
  return {
    listRect:{x:r.x|0,y:r.y|0,w:r.width|0,h:r.height|0},
    listDisplay:cs.display, listOverflow:cs.overflow, listHeight:cs.height,
    nRows:rows.length,
    firstRowRect:f?{x:f.x|0,y:f.y|0,w:f.width|0,h:f.height|0}:null,
    rowColor:fcs?.color, rowOpacity:fcs?.opacity, rowFontSize:fcs?.fontSize,
    nameColor:ncs?.color, nameText:nameEl?.textContent,
    scrollTop:l.scrollTop, scrollH:l.scrollHeight
  };
});
console.log(JSON.stringify(info,null,1));
await b.close();
