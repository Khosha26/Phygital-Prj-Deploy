/* Universe — interactive Block Massing GLB viewer (offline, ES module).
   Orbit / zoom · tap a tower -> highlight + camera ease + info (postMessage to parent). */
import * as THREE from 'three';
import { GLTFLoader } from './lib/GLTFLoader.js';

// tower facts (from the real PDF / block specs + TOWERS data)
const INFO = {
  A:{floors:'21',homes:84,type:'4 BHK',cluster:'North Edge',view:'North · BRTS frontage',color:0x8fb96a},
  B:{floors:'21',homes:84,type:'4 BHK',cluster:'North Edge',view:'North · BRTS frontage',color:0x8fb96a},
  C:{floors:'20',homes:38,type:'4 BHK',cluster:'West Court',view:'Central garden',color:0xbcd7ea},
  D:{floors:'20',homes:38,type:'4 BHK',cluster:'West Court',view:'Central garden',color:0xbcd7ea},
  E:{floors:'20',homes:76,type:'4 BHK + PH',cluster:'Crown',view:'Skyline · largest homes',color:0x6f8fc9},
  F:{floors:'20',homes:76,type:'4 BHK + PH',cluster:'Crown',view:'Skyline · largest homes',color:0x6f8fc9},
  G:{floors:'20',homes:76,type:'4 BHK',cluster:'Park Wing',view:'Podium & sports garden',color:0xe2895a},
  H:{floors:'20',homes:76,type:'4 BHK',cluster:'Park Wing',view:'Podium & sports garden',color:0xe2895a},
  I:{floors:'20',homes:38,type:'4 BHK',cluster:'Pool Court',view:'Swimming pool deck',color:0xe6cf8f},
  J:{floors:'20',homes:38,type:'4 BHK',cluster:'Pool Court',view:'Swimming pool deck',color:0xe6cf8f},
};
const TOWER_IMG = '../../building-twin.jpg';   // project elevation render (real asset)

const host = document.getElementById('stage');
const scene = new THREE.Scene();
scene.background = null;                       // transparent → blends with cream canvas

const cam = new THREE.PerspectiveCamera(34, 1, 0.1, 4000);
const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
host.appendChild(renderer.domElement);

const hemi = new THREE.HemisphereLight(0xffffff,0xc9cdd3,1.05); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff4e2,2.2);
sun.position.set(-60,90,40); sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048); sun.shadow.bias=-0.0004;
Object.assign(sun.shadow.camera,{near:1,far:400,left:-90,right:90,top:90,bottom:-90});
scene.add(sun);
const fill=new THREE.DirectionalLight(0xdfe7ff,0.5); fill.position.set(60,40,-40); scene.add(fill);

// ---- orbit (hand-rolled) ----
const target=new THREE.Vector3(0,4,0);
const sph={radius:90,theta:-0.55,phi:0.72};
function applyCam(){
  sph.phi=Math.max(0.12,Math.min(Math.PI*0.49,sph.phi));
  cam.position.set(
    target.x+sph.radius*Math.sin(sph.phi)*Math.sin(sph.theta),
    target.y+sph.radius*Math.cos(sph.phi),
    target.z+sph.radius*Math.sin(sph.phi)*Math.cos(sph.theta));
  cam.lookAt(target);
}

// Horizontal framing offset (fraction of viewport width). The parent app has a
// library panel covering the left edge, so we shift the cluster RIGHT to sit
// centred in the *visible* area. setViewOffset shifts only the projection — the
// orbit still pivots around the cluster, so dragging feels natural. 0 = dead centre.
const _params = new URLSearchParams(location.search);
let offsetFrac = _params.get('panel') === '0' ? 0 : 0.055;
let towerSphere = null;
function applyOffset(){
  const w = host.clientWidth || 1, h = host.clientHeight || 1;
  cam.aspect = w / h;
  if (offsetFrac) cam.setViewOffset(w, h, -offsetFrac * w, 0, w, h);
  else cam.clearViewOffset();
  cam.updateProjectionMatrix();
}
// The distance that exactly frames the cluster at the current aspect. We keep
// `baseRadius` so zoom limits + reframe-on-resize are RELATIVE to the model's
// real size (works no matter how the GLB is scaled).
let baseRadius = null;
function computeFitRadius(){
  const vFov = cam.fov * Math.PI / 180;
  const aspect = (host.clientWidth / host.clientHeight) || 1.6;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
  return towerSphere.radius / Math.sin(Math.min(vFov, hFov) / 2) * 1.12;
}
// Fit the tower cluster so it fills BOTH axes at the current aspect, then apply
// the horizontal offset. Re-runnable → called on load AND on every resize, so the
// framing stays centred + complete at any device aspect ratio. `resetZoom` true
// re-centres + resets the zoom (load / panel-toggle); false preserves the user's
// current zoom factor across a resize.
function frameCluster(resetZoom){
  if (!towerSphere) return;
  if (host.clientWidth < 2 || host.clientHeight < 2) return;   // not laid out yet
  const prevRatio = (baseRadius && !resetZoom) ? sph.radius / baseRadius : 1;
  target.copy(towerSphere.center);
  baseRadius = computeFitRadius();
  sph.radius = baseRadius * prevRatio;
  applyOffset();
  applyCam();
}
function zoomBy(factor){
  if (!baseRadius) { sph.radius *= factor; applyCam(); return; }
  sph.radius = Math.max(baseRadius * 0.32, Math.min(baseRadius * 2.6, sph.radius * factor));
  applyCam();
}
// Parent → viewer: update the offset live when the library panel opens / closes.
window.addEventListener('message', e => {
  const d = e.data; if (!d || d.type !== 'massing-offset') return;
  offsetFrac = +d.frac || 0;
  frameCluster(true);
});

// ---- input: 1-finger / left-drag = orbit · 2-finger pinch = zoom + pan ·
//             wheel = zoom · shift/right-drag = pan · double-tap = reset view ----
const el = renderer.domElement;
let drag = null, pinch = null, lastTap = 0;
const RIGHT = new THREE.Vector3();
function panBy(dx, dy){
  const r = sph.radius * 0.0016;
  RIGHT.crossVectors(new THREE.Vector3(0,1,0), new THREE.Vector3().subVectors(cam.position, target)).normalize();
  target.addScaledVector(RIGHT, dx * r); target.y += dy * r;
}
const touchMid = ts => ({ x:(ts[0].clientX+ts[1].clientX)/2, y:(ts[0].clientY+ts[1].clientY)/2 });
const touchDist = ts => Math.hypot(ts[0].clientX-ts[1].clientX, ts[0].clientY-ts[1].clientY) || 1;

el.addEventListener('mousedown', e => { drag = { x:e.clientX, y:e.clientY, pan:e.shiftKey||e.button===2, moved:false }; });
window.addEventListener('mousemove', e => {
  if (!drag) return;
  const dx = e.clientX-drag.x, dy = e.clientY-drag.y;
  if (Math.abs(dx)+Math.abs(dy) > 3) drag.moved = true;
  if (drag.pan) panBy(dx, dy);
  else { sph.theta -= dx*0.005; sph.phi -= dy*0.005; }
  drag.x = e.clientX; drag.y = e.clientY; applyCam();
});
window.addEventListener('mouseup', () => { drag = null; });
el.addEventListener('contextmenu', e => e.preventDefault());

el.addEventListener('touchstart', e => {
  if (e.touches.length === 2) {
    drag = null;
    pinch = { d: touchDist(e.touches), m: touchMid(e.touches) };
  } else if (e.touches.length === 1) {
    const t = e.touches[0];
    // double-tap → reset to the framed view
    const now = e.timeStamp || performance.now();
    if (now - lastTap < 300) { frameCluster(true); lastTap = 0; }
    else lastTap = now;
    drag = { x:t.clientX, y:t.clientY, pan:false, moved:false };
  }
}, { passive:true });
el.addEventListener('touchmove', e => {
  if (pinch && e.touches.length === 2) {
    const d = touchDist(e.touches), m = touchMid(e.touches);
    zoomBy(pinch.d / d);                       // spread fingers → zoom in
    panBy(m.x - pinch.m.x, m.y - pinch.m.y);   // drag two fingers → pan
    pinch.d = d; pinch.m = m;
  } else if (drag && e.touches.length === 1) {
    const t = e.touches[0];
    const dx = t.clientX-drag.x, dy = t.clientY-drag.y;
    if (Math.abs(dx)+Math.abs(dy) > 3) drag.moved = true;
    sph.theta -= dx*0.005; sph.phi -= dy*0.005;
    drag.x = t.clientX; drag.y = t.clientY; applyCam();
  }
}, { passive:true });
el.addEventListener('touchend', e => { if (e.touches.length === 0) { drag = null; pinch = null; } });
el.addEventListener('wheel', e => { e.preventDefault(); zoomBy(1 + Math.sign(e.deltaY)*0.08); }, { passive:false });

// ---- load GLB ----
const towers={}; let selected=null, easing=null;
new GLTFLoader().load('./universe-massing.glb', (gltf)=>{
  const root=gltf.scene; scene.add(root);
  // shadows + collect towers
  root.traverse(o=>{
    if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; if(Array.isArray(o.material)) o.material.forEach(m=>m.side=THREE.DoubleSide); else o.material.side=THREE.DoubleSide; }
    const m=o.name.match(/^Tower_([A-J])/);
    if(m){ towers[m[1]]=o; o.userData.tid=m[1];
      o.traverse(c=>{ if(c.isMesh){ c.userData.tid=m[1]; c.userData.baseEmis=c.material.emissive?c.material.emissive.clone():null; } }); }
  });
  // frame to the TOWERS (not the big ground plane). Use the bounding SPHERE so
  // the whole cluster fits in BOTH axes at any orbit angle / viewport aspect —
  // the towers stay centred and never run off-screen. Distance is derived from
  // the camera FOV (vertical) and the host aspect (horizontal), taking whichever
  // is tighter, plus a small margin.
  const box=new THREE.Box3();
  Object.values(towers).forEach(o=>box.expandByObject(o));
  towerSphere=box.getBoundingSphere(new THREE.Sphere());
  frameCluster(true);                                  // fit + apply horizontal offset
  // re-fit across the next few frames in case the iframe was still laying out
  // when the model finished loading (host size 0 → fit would be wrong).
  let tries=0; const settle=()=>{ if(tries++>6)return; frameCluster(true); requestAnimationFrame(settle); };
  requestAnimationFrame(settle);
  document.getElementById('loading').style.display='none';
}, undefined, err=>{ document.getElementById('loading').textContent='Failed to load model'; console.error(err); });

// ---- raycast select ----
const ray=new THREE.Raycaster(), ptr=new THREE.Vector2();
function highlight(tid){
  Object.entries(towers).forEach(([k,o])=>o.traverse(c=>{ if(c.isMesh&&c.material.emissive){
    c.material.emissive.setHex(k===tid?0x000000:0x000000);
    c.material.emissiveIntensity = (k===tid)?0:0; }}));
  // emissive glow on selected
  if(tid&&towers[tid]) towers[tid].traverse(c=>{ if(c.isMesh&&c.material.emissive){ c.material.emissive.setHex(INFO[tid].color); c.material.emissiveIntensity=0.5; }});
}
function selectTower(tid){
  selected=tid; highlight(tid);
  if(tid){ easeTo(towers[tid]); showPanel(tid); window.parent&&window.parent.postMessage({type:'massing-tower',id:tid},'*'); }
  else hidePanel();
}
el.addEventListener('click',e=>{
  if(drag&&drag.moved) return;
  const r=el.getBoundingClientRect();
  ptr.x=((e.clientX-r.left)/r.width)*2-1; ptr.y=-((e.clientY-r.top)/r.height)*2+1;
  ray.setFromCamera(ptr,cam);
  const hits=ray.intersectObjects(Object.values(towers),true);
  selectTower(hits.length?hits[0].object.userData.tid:null);
});
// zoom NEAR the tapped tower (centre on it + pull the camera in)
function easeTo(o){ const b=new THREE.Box3().setFromObject(o); const c=b.getCenter(new THREE.Vector3());
  const toR=Math.max(30,(baseRadius||sph.radius)*0.55);
  easing={t:0,fromT:target.clone(),toT:new THREE.Vector3(c.x,c.y,c.z),fromR:sph.radius,toR}; }

const panel=document.getElementById('panel');
const dot=document.getElementById('p-dot');
function showPanel(tid){ const d=INFO[tid];
  document.getElementById('p-img').src=TOWER_IMG;
  document.getElementById('p-id').textContent='TOWER '+tid;
  document.getElementById('p-cl').textContent=(d.cluster||'').toUpperCase();
  document.getElementById('p-fl').textContent=d.floors;
  document.getElementById('p-ho').textContent=d.homes;
  document.getElementById('p-ty').textContent=d.type;
  document.getElementById('p-vw').textContent=d.view;
  document.getElementById('p-sw').style.background='#'+d.color.toString(16).padStart(6,'0');
  panel.classList.add('show'); dot.classList.add('show'); anchorPanel(); }
function hidePanel(){ panel.classList.remove('show'); dot.classList.remove('show'); }
document.getElementById('p-close').addEventListener('click',()=>selectTower(null));

// Keep the card + dot "attached" to the selected tower: project its top-centre to
// screen space every frame and place the dot there, the card beside it (flipping /
// clamping so it never leaves the viewport).
const _anchor=new THREE.Vector3();
function anchorPanel(){
  if(!selected||!towers[selected]) return;
  const b=new THREE.Box3().setFromObject(towers[selected]);
  _anchor.set((b.min.x+b.max.x)/2, b.max.y, (b.min.z+b.max.z)/2).project(cam);
  const w=host.clientWidth, h=host.clientHeight;
  const sx=(_anchor.x*0.5+0.5)*w, sy=(-_anchor.y*0.5+0.5)*h;
  dot.style.left=sx+'px'; dot.style.top=sy+'px';
  const pw=panel.offsetWidth||252, ph=panel.offsetHeight||300;
  let px=sx+28, py=sy-ph*0.42;
  if(px+pw>w-12) px=sx-28-pw;                 // flip to the left if it would clip the right edge
  px=Math.max(12,Math.min(w-pw-12,px));
  py=Math.max(12,Math.min(h-ph-12,py));
  panel.style.left=px+'px'; panel.style.top=py+'px';
}

function resize(){ const w=host.clientWidth,h=host.clientHeight; renderer.setSize(w,h,false); applyOffset(); frameCluster(false); }
window.addEventListener('resize',resize); resize(); applyCam();
function tick(){ requestAnimationFrame(tick);
  if(easing){ easing.t=Math.min(1,easing.t+0.05); const e=1-Math.pow(1-easing.t,3);
    target.lerpVectors(easing.fromT,easing.toT,e); sph.radius=easing.fromR+(easing.toR-easing.fromR)*e; applyCam(); if(easing.t>=1)easing=null; }
  if(selected) anchorPanel();          // card + dot follow the tower as you orbit
  renderer.render(scene,cam); }
tick();
window.UniverseMassing={ select:selectTower };
