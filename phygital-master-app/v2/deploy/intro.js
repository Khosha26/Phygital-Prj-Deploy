/* Phygital — cinematic intro
   Particles fly in from every side → form the dp logo at centre → keep animating.
   Interactions on the logo:
     • drag  → rotate the logo a full 360° (inertia, eases back to auto-spin)
     • swipe → particles spray outward in the swipe's direction, then SPRING back
               and re-form (per-particle dynamic offset + spring).
   Fingerprint "Tap to enter" button flashes pink, then dissolves into the kiosk.
   WebGL (GPU). Exposes nothing; self-contained. */
(function () {
  const root = document.getElementById("intro");
  const canvas = document.getElementById("introfx");
  if (!root || !canvas) return;

  const gl =
    canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: true }) ||
    canvas.getContext("experimental-webgl", { alpha: true, premultipliedAlpha: false, antialias: true });
  if (!gl) { root.parentNode && root.parentNode.removeChild(root); return; }

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W, H, aspect = 1, cx = 0, cy = 0, N = 0;
  let FOCAL = 1, DEPTH = 1, maxScale = 1;
  let anchors = [];

  const LX = -0.13, LY = -0.87, LZ = -0.48;
  const AUTO = 0.46, TILT = 0.14;   // match the main-screen logo: in-place Y-spin

  // rotation = automatic only (centred, in place). NO drag-rotate.
  let rotY = -0.3, rotX = TILT;
  let pointerDown = false, moved = 0, lastX = 0, lastY = 0, lastMoveT = 0, downT = 0;
  let lastT = 0, t0 = 0, form = 0;
  let running = true, rafId = 0, entering = false, buttonShown = false;

  // per-particle disturb offset — particles float OUTWARD when swiped, and only
  // re-form after 3s of no touch. Uploaded as a dynamic attr.
  let offX, offY, offZ, vX, vY, vZ, tgtX, tgtY, tgtZ; let scatterActive = false;
  let lastDisturb = -1e9;           // ms of last touch activity
  const IDLE_REFORM = 3000;         // wait 3s of no touch, then re-form
  const RK = 9, RC = 5.4;           // reform spring (slow ~2s return)
  const FLOAT_TAU = 1.8;            // s — light damping so knocked-loose particles keep floating
  const MAXOFF = 920;               // clamp so a fully-destructed logo stays near-screen

  const FORM_DELAY = 0.25, FORM_DUR = reduce ? 0.4 : 2.1;

  const VERT = `
    precision highp float;
    attribute vec3 aTarget;
    attribute vec4 aStart;
    attribute vec4 aR;
    attribute vec2 aR2;
    attribute vec3 aOffset;
    uniform float uTime, uForm, uRotY, uRotX, uFocal, uCx, uCy, uDpr, uMaxScale, uReduce;
    uniform vec2 uRes; uniform vec3 uLight;
    varying float vAlpha; varying float vLight;
    float easeOut(float x){ return 1.0 - pow(1.0 - x, 3.0); }
    void main(){
      float t = uTime;
      float lf = clamp((uForm - aStart.w) / max(1.0 - aStart.w, 0.001), 0.0, 1.0);
      float e = easeOut(lf);
      float jx = mix(0.0, sin(t*aR.x + aR.z) * aR.y, e * (1.0 - uReduce));
      float jy = mix(0.0, cos(t*aR.x*0.9 + aR.z) * aR.y, e * (1.0 - uReduce));
      vec3 tgt = vec3(aTarget.x + jx, aTarget.y + jy, aTarget.z);
      vec3 model = mix(aStart.xyz, tgt, e) + aOffset * e;   // scatter only once formed
      float x = model.x, y = model.y, z = model.z;
      float sy = sin(uRotY), cyr = cos(uRotY);
      float sx = sin(uRotX), cxr = cos(uRotX);
      float x1 =  x*cyr + z*sy;
      float z1 = -x*sy + z*cyr;
      float y1 =  y*cxr - z1*sx;
      float z2 =  y*sx + z1*cxr;
      float scale = uFocal/(uFocal+z2);
      float px = uCx + x1*scale;
      float py = uCy + y1*scale;
      float depth = scale/uMaxScale;
      float tw = mix(0.7 + 0.3*sin(t*aR2.y + aR.z), 1.0, uReduce);
      float inv = 1.0/max(length(vec3(x1,y1,z2)),0.0001);
      float light = (x1*inv)*uLight.x + (y1*inv)*uLight.y + (z2*inv)*uLight.z;
      light = light*0.5+0.5; light*=light;
      vLight = light;
      vAlpha = min(1.0, aR2.x * tw * (0.78 + 0.22*depth)) * (0.25 + 0.75*e);
      vec2 ndc = vec2(px/uRes.x*2.0-1.0, 1.0 - py/uRes.y*2.0);
      gl_Position = vec4(ndc, 0.0, 1.0);
      gl_PointSize = max(1.0, aR.w * scale * uDpr * 2.0);
    }`;

  const FRAG = `
    precision mediump float;
    varying float vAlpha; varying float vLight;
    void main(){
      vec2 c = gl_PointCoord - 0.5; float d = length(c);
      if (d > 0.5) discard;
      float soft = smoothstep(0.5, 0.40, d);
      float g = (52.0 + 195.0*vLight)/255.0;
      float b = (126.0 + 110.0*vLight)/255.0;
      gl_FragColor = vec4(254.0/255.0, g, b, vAlpha*soft);
    }`;

  function compile(type, src) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn("intro shader", gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog); gl.useProgram(prog);
  const loc = {
    aTarget: gl.getAttribLocation(prog, "aTarget"),
    aStart: gl.getAttribLocation(prog, "aStart"),
    aR: gl.getAttribLocation(prog, "aR"),
    aR2: gl.getAttribLocation(prog, "aR2"),
    aOffset: gl.getAttribLocation(prog, "aOffset"),
    uTime: gl.getUniformLocation(prog, "uTime"), uForm: gl.getUniformLocation(prog, "uForm"),
    uRotY: gl.getUniformLocation(prog, "uRotY"), uRotX: gl.getUniformLocation(prog, "uRotX"),
    uFocal: gl.getUniformLocation(prog, "uFocal"), uCx: gl.getUniformLocation(prog, "uCx"),
    uCy: gl.getUniformLocation(prog, "uCy"), uDpr: gl.getUniformLocation(prog, "uDpr"),
    uMaxScale: gl.getUniformLocation(prog, "uMaxScale"), uReduce: gl.getUniformLocation(prog, "uReduce"),
    uRes: gl.getUniformLocation(prog, "uRes"), uLight: gl.getUniformLocation(prog, "uLight"),
  };
  const bT = gl.createBuffer(), bS = gl.createBuffer(), bR = gl.createBuffer(),
        bR2 = gl.createBuffer(), bOff = gl.createBuffer();
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.clearColor(0, 0, 0, 0);

  function sample(image) {
    aspect = image.width / image.height;
    const ow = 300, oh = Math.round(ow / aspect);
    const off = document.createElement("canvas"); off.width = ow; off.height = oh;
    const o = off.getContext("2d"); o.drawImage(image, 0, 0, ow, oh);
    const d = o.getImageData(0, 0, ow, oh).data;
    const pts = []; const step = 2;
    for (let y = 0; y < oh; y += step) for (let x = 0; x < ow; x += step) {
      if (d[(y * ow + x) * 4 + 3] > 128 && Math.random() < 0.92) pts.push([x / ow, y / oh]);
    }
    return pts;
  }

  function layout() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    gl.viewport(0, 0, canvas.width, canvas.height);

    const GH = Math.min(H * 0.46, W * 0.5);
    const GW = GH * aspect;
    cx = W * 0.5; cy = H * 0.44;
    DEPTH = GW * 0.22; FOCAL = GH * 1.85;
    maxScale = FOCAL / (FOCAL - (GW * 0.5 + DEPTH));

    N = anchors.length;
    const tA = new Float32Array(N * 3), sA = new Float32Array(N * 4),
          rA = new Float32Array(N * 4), r2A = new Float32Array(N * 2);
    offX = new Float32Array(N); offY = new Float32Array(N); offZ = new Float32Array(N);
    vX = new Float32Array(N); vY = new Float32Array(N); vZ = new Float32Array(N);
    tgtX = new Float32Array(N); tgtY = new Float32Array(N); tgtZ = new Float32Array(N);  // for proximity hit-test
    const RAD = Math.max(W, H) * 0.72;
    for (let i = 0; i < N; i++) {
      const nx = anchors[i][0], ny = anchors[i][1];
      tA[i * 3] = (nx - 0.5) * GW; tA[i * 3 + 1] = (ny - 0.5) * GH; tA[i * 3 + 2] = (Math.random() - 0.5) * DEPTH;
      tgtX[i] = tA[i * 3]; tgtY[i] = tA[i * 3 + 1]; tgtZ[i] = tA[i * 3 + 2];
      const ang = Math.random() * Math.PI * 2;
      const dist = (0.9 + Math.random() * 0.8) * RAD;
      sA[i * 4] = Math.cos(ang) * dist; sA[i * 4 + 1] = Math.sin(ang) * dist;
      sA[i * 4 + 2] = (Math.random() - 0.5) * DEPTH * 6.0; sA[i * 4 + 3] = Math.random() * 0.5;
      rA[i * 4] = 0.8 + Math.random() * 1.6; rA[i * 4 + 1] = GW * (0.012 + Math.random() * 0.024);
      rA[i * 4 + 2] = Math.random() * Math.PI * 2; rA[i * 4 + 3] = 1.0 + Math.random() * 1.5;
      r2A[i * 2] = 0.6 + Math.random() * 0.4; r2A[i * 2 + 1] = 1.1 + Math.random() * 2.0;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, bT); gl.bufferData(gl.ARRAY_BUFFER, tA, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, bS); gl.bufferData(gl.ARRAY_BUFFER, sA, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, bR); gl.bufferData(gl.ARRAY_BUFFER, rA, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, bR2); gl.bufferData(gl.ARRAY_BUFFER, r2A, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, bOff); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(N * 3), gl.DYNAMIC_DRAW);
    gl.uniform2f(loc.uRes, W, H); gl.uniform1f(loc.uDpr, DPR);
    gl.uniform3f(loc.uLight, LX, LY, LZ); gl.uniform1f(loc.uReduce, reduce ? 1 : 0);
  }

  function bind(b, l, n) { gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, n, gl.FLOAT, false, 0, 0); }

  // LOCAL disturb: only the particles under the finger (screen proximity) get
  // knocked loose, pushed along the swipe direction. They spring back (~2s).
  // sx,sy = pointer in CSS px; dirx,diry = normalised swipe direction; strength scaled by speed.
  function swipeAt(sx, sy, dirx, diry, strength) {
    if (form < 0.6 || !offX) return;
    const sinY = Math.sin(rotY), cosY = Math.cos(rotY);
    const sinX = Math.sin(rotX), cosX = Math.cos(rotX);
    const R = Math.min(W, H) * 0.13;       // finger influence radius
    const R2 = R * R;
    const push = Math.min(130 + strength * 190, 540);
    let hit = false;
    for (let i = 0; i < N; i++) {
      // current model position (target + live offset) → project to screen
      const x = tgtX[i] + offX[i], y = tgtY[i] + offY[i], z = tgtZ[i] + offZ[i];
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;
      const scale = FOCAL / (FOCAL + z2);
      const px = cx + x1 * scale, py = cy + y1 * scale;
      const ddx = px - sx, ddy = py - sy;
      const d2 = ddx * ddx + ddy * ddy;
      if (d2 > R2) continue;
      const fall = 1 - Math.sqrt(d2) / R;   // 1 at finger → 0 at edge
      const m = push * fall;
      vX[i] += dirx * m + (Math.random() - 0.5) * m * 0.7;
      vY[i] += diry * m + (Math.random() - 0.5) * m * 0.7;
      vZ[i] += (Math.random() - 0.5) * m * 0.5;
      hit = true;
    }
    if (hit) scatterActive = true;
  }

  const offBuf = () => { // pack + upload current offsets
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { arr[i * 3] = offX[i]; arr[i * 3 + 1] = offY[i]; arr[i * 3 + 2] = offZ[i]; }
    gl.bindBuffer(gl.ARRAY_BUFFER, bOff); gl.bufferSubData(gl.ARRAY_BUFFER, 0, arr);
  };

  // FLOAT: knocked-loose particles keep drifting outward (light damping), clamped.
  function floatStep(dt) {
    const damp = Math.exp(-dt / FLOAT_TAU);
    for (let i = 0; i < N; i++) {
      offX[i] += vX[i] * dt; offY[i] += vY[i] * dt; offZ[i] += vZ[i] * dt;
      vX[i] *= damp; vY[i] *= damp; vZ[i] *= damp;
      if (offX[i] > MAXOFF) { offX[i] = MAXOFF; if (vX[i] > 0) vX[i] = 0; }
      else if (offX[i] < -MAXOFF) { offX[i] = -MAXOFF; if (vX[i] < 0) vX[i] = 0; }
      if (offY[i] > MAXOFF) { offY[i] = MAXOFF; if (vY[i] > 0) vY[i] = 0; }
      else if (offY[i] < -MAXOFF) { offY[i] = -MAXOFF; if (vY[i] < 0) vY[i] = 0; }
    }
  }
  // REFORM: after 3s idle, a slow spring pulls every particle home (~2s).
  function reformStep(dt) {
    let energy = 0;
    for (let i = 0; i < N; i++) {
      vX[i] += (-RK * offX[i] - RC * vX[i]) * dt;
      vY[i] += (-RK * offY[i] - RC * vY[i]) * dt;
      vZ[i] += (-RK * offZ[i] - RC * vZ[i]) * dt;
      offX[i] += vX[i] * dt; offY[i] += vY[i] * dt; offZ[i] += vZ[i] * dt;
      energy += Math.abs(offX[i]) + Math.abs(offY[i]) + Math.abs(vX[i]) + Math.abs(vY[i]);
    }
    if (energy / N < 0.05) {
      for (let i = 0; i < N; i++) { offX[i] = offY[i] = offZ[i] = vX[i] = vY[i] = vZ[i] = 0; }
      scatterActive = false; offBuf();
    }
  }

  function frame(now) {
    if (!running) return;
    if (!t0) t0 = now;
    const t = now / 1000;
    const dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0.016; lastT = now;
    const elapsed = (now - t0) / 1000;
    form = Math.max(0, Math.min(1, (elapsed - FORM_DELAY) / FORM_DUR));

    // auto-spin in place (centred), always — like the main screen.
    if (!reduce) rotY += AUTO * dt * (0.4 + 0.6 * form);
    rotX += (TILT - rotX) * 0.05;
    if (scatterActive) {
      const idle = now - lastDisturb;
      if (idle >= IDLE_REFORM) reformStep(dt);   // 3s of no touch → slowly re-form
      else floatStep(dt);                        // otherwise keep floating outward
      if (scatterActive) offBuf();
    }

    if (!buttonShown && form >= 0.98) { buttonShown = true; root.classList.add("ready"); }

    gl.clear(gl.COLOR_BUFFER_BIT); gl.useProgram(prog);
    bind(bT, loc.aTarget, 3); bind(bS, loc.aStart, 4); bind(bR, loc.aR, 4);
    bind(bR2, loc.aR2, 2); bind(bOff, loc.aOffset, 3);
    gl.uniform1f(loc.uTime, t); gl.uniform1f(loc.uForm, form);
    gl.uniform1f(loc.uRotY, rotY); gl.uniform1f(loc.uRotX, rotX);
    gl.uniform1f(loc.uFocal, FOCAL); gl.uniform1f(loc.uCx, cx); gl.uniform1f(loc.uCy, cy);
    gl.uniform1f(loc.uMaxScale, maxScale);
    gl.drawArrays(gl.POINTS, 0, N);
    rafId = requestAnimationFrame(frame);
  }

  /* ---------- interaction: swipe = destruct → reform (NO rotation) ----------
     The logo always auto-spins in place; a swipe just blows the particles
     outward from the shape and they spring back. A clean tap enters. */
  canvas.addEventListener("pointerdown", (e) => {
    pointerDown = true; moved = 0; lastX = e.clientX; lastY = e.clientY;
    lastMoveT = downT = lastDisturb = performance.now();
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!pointerDown) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    const dist = Math.hypot(dx, dy);
    moved += dist;
    const now = performance.now(); const dtm = Math.max(8, now - lastMoveT); lastMoveT = now;
    lastDisturb = now;                                // any swipe activity holds off the reform
    const speed = dist / dtm;                         // px per ms
    if (dist > 1.5) {
      const len = dist || 1;
      swipeAt(e.clientX, e.clientY, dx / len, dy / len, speed);
    }
    lastX = e.clientX; lastY = e.clientY;
  });
  const up = (e) => {
    if (!pointerDown) return;
    pointerDown = false;
    try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
    // NOTE: tapping the logo/empty area does NOT enter — only the button does.
  };
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);

  /* ---------- enter (button flashes pink, then dissolve to kiosk) ---------- */
  function goFullscreen() {
    const el = document.documentElement;
    const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if (fn) { try { Promise.resolve(fn.call(el)).catch(() => {}); } catch (_) {} }
  }
  function enter() {
    if (entering) return; entering = true;
    goFullscreen();                       // true fullscreen → hides the tablet's top/bottom browser bars
    const btn = document.getElementById("introEnter");
    if (btn) btn.classList.add("go");
    try { window.handfx && window.handfx.resume(); } catch (_) {}
    setTimeout(() => { root.classList.add("out"); }, 240);  // let the colour change read
    setTimeout(() => {
      running = false; if (rafId) cancelAnimationFrame(rafId);
      root.style.display = "none";
    }, 240 + 700);
  }
  const btn = document.getElementById("introEnter");
  if (btn) btn.addEventListener("click", (e) => { e.stopPropagation(); enter(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") enter(); });

  try { window.handfx && window.handfx.pause(); } catch (_) {}

  const img = new Image();
  img.onload = () => { anchors = sample(img); layout(); rafId = requestAnimationFrame(frame); };
  img.src = "./assets/logos/phygital-glyph.png";

  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => { DPR = Math.min(window.devicePixelRatio || 1, 2); if (anchors.length && running) layout(); }, 120);
  });
})();
