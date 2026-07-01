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
// wait until between 40 and 120 files so list is full & streaming
for(let i=0;i<400;i++){
  const n=await p.evaluate(()=>document.querySelectorAll('#dlList .dl-row').length);
  const done=await p.evaluate(()=>!document.getElementById('dlDone').hidden);
  if(n>=20 || done) break;
  await p.waitForTimeout(30);
}
await p.waitForTimeout(120);
await p.screenshot({path:'/Users/mi1k/Documents/Projects/highland-mayfields/sales-suite/app/_shot-mid.png'});
const st=await p.evaluate(()=>({count:document.getElementById('dlCount').textContent,rows:document.querySelectorAll('#dlList .dl-row').length,now:document.getElementById('dlNowFile').textContent}));
console.log('shot at',JSON.stringify(st));
await b.close();
