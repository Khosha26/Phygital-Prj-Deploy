import { chromium } from 'playwright';

const BASE='http://localhost:8210/index.html';
const SHOT='/Users/mi1k/Documents/Projects/highland-mayfields/sales-suite/app';
const errors=[];

const browser=await chromium.launch();
// a brand-new context is already pristine (empty localStorage, no caches, no SW) — that IS
// the fresh first-run state. We avoid an explicit clear+reload because that re-registers the
// SW mid-run and the first-claim controllerchange reload would race our screenshots.
const ctx=await browser.newContext({ viewport:{width:2560,height:1600}, deviceScaleFactor:1 });
const page=await ctx.newPage();
page.on('console', m=>{ if(m.type()==='error') errors.push(m.text()); });
page.on('pageerror', e=>errors.push('PAGEERROR: '+e.message));

// prove fresh state, then load
await page.goto(BASE, {waitUntil:'domcontentloaded'});
const fresh=await page.evaluate(async ()=>{
  const ls=localStorage.length; const cs=window.caches?(await caches.keys()).length:-1;
  return {ls,cs};
});
console.log('FRESH STATE — localStorage keys:',fresh.ls,'| cache buckets:',fresh.cs);

// wait for offer state
await page.waitForSelector('#dlOffer:not([hidden]) #dlBtn', {timeout:15000});
console.log('OFFER state shown');

// start download
await page.click('#dlBtn');

// capture mid-download: some rows present AND not complete
let midShot=false, midInfo=null;
for(let i=0;i<400;i++){
  const st=await page.evaluate(()=>{
    const rows=[...document.querySelectorAll('#dlList .dl-row')].map(r=>({
      type:r.querySelector('.dl-rtype')?.textContent,
      name:r.querySelector('.dl-rname')?.textContent,
      size:r.querySelector('.dl-rsize')?.textContent
    }));
    return {
      rows, nRows:rows.length,
      count:document.getElementById('dlCount')?.textContent,
      now:document.getElementById('dlNowFile')?.textContent,
      nowVisible:!document.getElementById('dlNow')?.hidden,
      pct:document.getElementById('dlPct')?.textContent,
      doneVisible:!document.getElementById('dlDone')?.hidden
    };
  });
  if(!midShot && st.nRows>=8 && !st.doneVisible){
    midInfo=st;
    // element screenshot of the whole gate: forces a fresh subtree raster so the live ticker
    // (which mutates every frame) captures cleanly. Full-page raster races the mutation in
    // headless chromium; a real 60fps display shows the stream live (verified via DOM state).
    await page.locator('#dlGate').screenshot({path:SHOT+'/_shot-mid.png'});
    midShot=true;
    console.log('MID captured:', st.nRows,'rows | count=',st.count,'| now=',JSON.stringify(st.now),'nowVisible=',st.nowVisible,'| pct=',st.pct);
    console.log('  sample rows:', JSON.stringify(st.rows.slice(-4)));
  }
  if(st.doneVisible) break;
  await page.waitForTimeout(50);
}

// wait for done
await page.waitForSelector('#dlDone:not([hidden])', {timeout:60000});
await page.waitForTimeout(600);
const doneInfo=await page.evaluate(()=>({
  msg:document.getElementById('dlDoneMsg')?.textContent,
  summary:document.getElementById('dlSummary')?.textContent,
  summaryHidden:document.getElementById('dlSummary')?.hidden,
  expandHidden:document.getElementById('dlExpand')?.hidden,
  count:document.getElementById('dlCount')?.textContent
}));
console.log('DONE:', JSON.stringify(doneInfo));
await page.screenshot({path:SHOT+'/_shot-done.png'});

// test expand
await page.click('#dlExpand');
await page.waitForTimeout(400);
const exp=await page.evaluate(()=>({
  fullRows:document.querySelectorAll('#dlFullList .dl-row').length,
  fullHidden:document.getElementById('dlFullList')?.hidden,
  label:document.getElementById('dlExpand')?.textContent
}));
console.log('EXPAND:', JSON.stringify(exp));
await page.screenshot({path:SHOT+'/_shot-expanded.png'});

console.log('CONSOLE ERRORS:', errors.length, errors.slice(0,8));

// assertions
const problems=[];
if(!midShot) problems.push('never captured a mid-download frame with rows');
if(midInfo && !/\.(webp|jpg|png|mp4|woff2|css|js|svg|json)/i.test(JSON.stringify(midInfo.rows))) problems.push('mid rows lack real filenames');
if(midInfo && !/(KB|MB)/.test(JSON.stringify(midInfo.rows))) problems.push('mid rows lack sizes');
if(!/works fully offline/i.test(doneInfo.summary||'')) problems.push('done summary missing offline confirmation');
if(!/\d+ assets/i.test(doneInfo.summary||'')) problems.push('done summary missing asset count');
if(exp.fullRows<100) problems.push('expand list has too few rows: '+exp.fullRows);
if(errors.length) problems.push('console errors: '+errors.length);

console.log(problems.length? ('FAIL: '+problems.join(' | ')) : 'ALL ASSERTIONS PASSED');
await browser.close();
process.exit(problems.length?1:0);
