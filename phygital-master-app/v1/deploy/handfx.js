/* Phygital — 3D floating logo particles (WebGL)
   Identical look to the canvas version, now GPU-accelerated so it stays light
   and smooth on tablets (Tab S7) and phones:
   - particles form the Phygital "dp" logo, extruded into a thin 3D slab
   - slow continuous 360° auto-spin + drag-to-rotate (with inertia)
   - gentle per-particle orbit + twinkle
   - directional spotlight shading: lit side bright/white-pink, far side in shadow
   All per-particle math runs in the vertex shader (the GPU), so the CPU is idle.
   Right side of screen, opacity set on .handfx in CSS.

   Exposes window.handfx = { pause(), resume() } so the launcher can fully stop
   the animation while a fullscreen experience is open (frees the GPU). */
(function () {
  const canvas = document.getElementById("handfx");
  if (!canvas) return;

  const gl =
    canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: true }) ||
    canvas.getContext("experimental-webgl", { alpha: true, premultipliedAlpha: false, antialias: true });
  if (!gl) { canvas.style.display = "none"; return; }

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W, H, aspect = 1, cx = 0, cy = 0, N = 0;
  let FOCAL = 1, DEPTH = 1, maxScale = 1, GWv = 1;
  let anchors = [];

  const AUTO = 0.46;          // rad/sec auto-spin (~13.5s / revolution)
  const TILT = 0.14;          // resting X tilt for a 3D read
  const MAXVEL = 0.22;

  // Spotlight direction (from upper-front) used to LIGHT the particles.
  const LX = -0.13, LY = -0.87, LZ = -0.48;

  // rotation state (interactive)
  let rotY = -0.3, rotX = TILT, velY = 0, velX = 0;
  let dragging = false, lastX = 0, lastY = 0, lastT = 0;
  let running = true, rafId = 0;

  /* ---------------- shaders ---------------- */
  const VERT = `
    precision highp float;
    attribute vec3 aPos;      // mx, my, mz
    attribute vec4 aR;        // js, ja, ph, size
    attribute vec2 aR2;       // baseAlpha, twSpeed
    uniform float uTime, uRotY, uRotX, uFocal, uCx, uCy, uDpr, uMaxScale, uReduce;
    uniform vec2  uRes;
    uniform vec3  uLight;
    varying float vAlpha;
    varying float vLight;
    void main() {
      float t = uTime;
      float jx = mix(sin(t * aR.x + aR.z) * aR.y, 0.0, uReduce);
      float jy = mix(cos(t * aR.x * 0.9 + aR.z) * aR.y, 0.0, uReduce);
      float x = aPos.x + jx;
      float y = aPos.y + jy;
      float z = aPos.z;
      float sy = sin(uRotY), cy = cos(uRotY);
      float sx = sin(uRotX), cx = cos(uRotX);
      float x1 =  x * cy + z * sy;
      float z1 = -x * sy + z * cy;
      float y1 =  y * cx - z1 * sx;
      float z2 =  y * sx + z1 * cx;
      float scale = uFocal / (uFocal + z2);
      float px = uCx + x1 * scale;
      float py = uCy + y1 * scale;
      float depth = scale / uMaxScale;                 // back→front 0..1
      float tw = mix(0.7 + 0.3 * sin(t * aR2.y + aR.z), 1.0, uReduce);

      // volumetric lighting (matches the canvas version exactly)
      float inv = 1.0 / max(length(vec3(x1, y1, z2)), 0.0001);
      float lf = (x1 * inv) * uLight.x + (y1 * inv) * uLight.y + (z2 * inv) * uLight.z;
      float light = lf * 0.5 + 0.5;
      light *= light;
      vLight = light;
      // Depth-of-light lives in the COLOR (lit→white-pink, shadow→deep pink).
      // Alpha stays high & near-flat so the dp shape reads dense and crisp.
      vAlpha = min(1.0, aR2.x * tw * (0.78 + 0.22 * depth));

      vec2 ndc = vec2(px / uRes.x * 2.0 - 1.0, 1.0 - py / uRes.y * 2.0);
      gl_Position = vec4(ndc, 0.0, 1.0);
      gl_PointSize = max(1.0, aR.w * scale * uDpr * 2.0);
    }`;

  const FRAG = `
    precision mediump float;
    varying float vAlpha;
    varying float vLight;
    void main() {
      vec2 c = gl_PointCoord - 0.5;
      float d = length(c);
      if (d > 0.5) discard;
      float soft = smoothstep(0.5, 0.40, d);           // solid disc, AA edge only (matches canvas)
      float g = (52.0 + 195.0 * vLight) / 255.0;        // lit → white-pink
      float b = (126.0 + 110.0 * vLight) / 255.0;
      gl_FragColor = vec4(254.0 / 255.0, g, b, vAlpha * soft);
    }`;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn("handfx shader:", gl.getShaderInfoLog(s)); return null;
    }
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const loc = {
    aPos: gl.getAttribLocation(prog, "aPos"),
    aR: gl.getAttribLocation(prog, "aR"),
    aR2: gl.getAttribLocation(prog, "aR2"),
    uTime: gl.getUniformLocation(prog, "uTime"),
    uRotY: gl.getUniformLocation(prog, "uRotY"),
    uRotX: gl.getUniformLocation(prog, "uRotX"),
    uFocal: gl.getUniformLocation(prog, "uFocal"),
    uCx: gl.getUniformLocation(prog, "uCx"),
    uCy: gl.getUniformLocation(prog, "uCy"),
    uDpr: gl.getUniformLocation(prog, "uDpr"),
    uMaxScale: gl.getUniformLocation(prog, "uMaxScale"),
    uReduce: gl.getUniformLocation(prog, "uReduce"),
    uRes: gl.getUniformLocation(prog, "uRes"),
    uLight: gl.getUniformLocation(prog, "uLight"),
  };

  const bufPos = gl.createBuffer();
  const bufR = gl.createBuffer();
  const bufR2 = gl.createBuffer();

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  /* ---------------- sampling (same as before) ---------------- */
  function sample(image) {
    aspect = image.width / image.height;
    const ow = 320, oh = Math.round(ow / aspect);
    const off = document.createElement("canvas");
    off.width = ow; off.height = oh;
    const o = off.getContext("2d");
    o.drawImage(image, 0, 0, ow, oh);
    const d = o.getImageData(0, 0, ow, oh).data;
    const pts = [];
    const step = 2;
    for (let y = 0; y < oh; y += step) {
      for (let x = 0; x < ow; x += step) {
        if (d[(y * ow + x) * 4 + 3] > 128 && Math.random() < 0.92) {
          pts.push([x / ow, y / oh]);
        }
      }
    }
    return pts;
  }

  /* ---------------- (re)build geometry ---------------- */
  function layout() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    gl.viewport(0, 0, canvas.width, canvas.height);

    const GH = Math.min(H * 0.82, W * 0.62);
    const GW = GH * aspect; GWv = GW;
    cx = W * 0.76; cy = H * 0.5;
    DEPTH = GW * 0.22;
    FOCAL = GH * 1.85;
    maxScale = FOCAL / (FOCAL - (GW * 0.5 + DEPTH));

    N = anchors.length;
    const pos = new Float32Array(N * 3);
    const r = new Float32Array(N * 4);
    const r2 = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) {
      const nx = anchors[i][0], ny = anchors[i][1];
      pos[i * 3] = (nx - 0.5) * GW;
      pos[i * 3 + 1] = (ny - 0.5) * GH;
      pos[i * 3 + 2] = (Math.random() - 0.5) * DEPTH;
      r[i * 4] = 0.8 + Math.random() * 1.6;             // js
      r[i * 4 + 1] = GW * (0.012 + Math.random() * 0.024); // ja
      r[i * 4 + 2] = Math.random() * Math.PI * 2;        // ph
      r[i * 4 + 3] = 1.0 + Math.random() * 1.5;          // size
      r2[i * 2] = 0.6 + Math.random() * 0.4;             // baseAlpha
      r2[i * 2 + 1] = 1.1 + Math.random() * 2.0;         // twSpeed
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, bufPos); gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufR); gl.bufferData(gl.ARRAY_BUFFER, r, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufR2); gl.bufferData(gl.ARRAY_BUFFER, r2, gl.STATIC_DRAW);

    gl.uniform2f(loc.uRes, W, H);
    gl.uniform1f(loc.uDpr, DPR);
    gl.uniform3f(loc.uLight, LX, LY, LZ);
    gl.uniform1f(loc.uReduce, reduce ? 1 : 0);
  }

  /* ---------------- render loop ---------------- */
  function frame(now) {
    if (!running) return;
    const t = now / 1000;
    const dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0.016;
    lastT = now;

    if (!dragging) {
      if (!reduce) rotY += AUTO * dt;
      rotY += velY; velY *= 0.94;
      rotX += velX; velX *= 0.9;
      rotX += (TILT - rotX) * 0.03;
    }

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufPos);
    gl.enableVertexAttribArray(loc.aPos); gl.vertexAttribPointer(loc.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufR);
    gl.enableVertexAttribArray(loc.aR); gl.vertexAttribPointer(loc.aR, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufR2);
    gl.enableVertexAttribArray(loc.aR2); gl.vertexAttribPointer(loc.aR2, 2, gl.FLOAT, false, 0, 0);

    gl.uniform1f(loc.uTime, t);
    gl.uniform1f(loc.uRotY, rotY);
    gl.uniform1f(loc.uRotX, rotX);
    gl.uniform1f(loc.uFocal, FOCAL);
    gl.uniform1f(loc.uCx, cx);
    gl.uniform1f(loc.uCy, cy);
    gl.uniform1f(loc.uMaxScale, maxScale);

    gl.drawArrays(gl.POINTS, 0, N);
    rafId = requestAnimationFrame(frame);
  }

  /* ---------------- drag to rotate ---------------- */
  canvas.addEventListener("pointerdown", (e) => {
    dragging = true; lastX = e.clientX; lastY = e.clientY; velY = velX = 0;
    canvas.classList.add("dragging");
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = (e.clientX - lastX) * 0.007, dy = (e.clientY - lastY) * 0.007;
    rotY += dx; rotX = Math.max(-1.2, Math.min(1.2, rotX + dy));
    velY = Math.max(-MAXVEL, Math.min(MAXVEL, dx));
    velX = Math.max(-MAXVEL, Math.min(MAXVEL, dy));
    lastX = e.clientX; lastY = e.clientY;
  });
  const end = (e) => {
    if (!dragging) return;
    dragging = false; canvas.classList.remove("dragging");
    try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
  };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);

  /* ---------------- pause / resume (frees the GPU while an experience is open) */
  window.handfx = {
    pause() { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = 0; },
    resume() {
      if (running) return;
      running = true; lastT = 0;
      if (anchors.length) { DPR = Math.min(window.devicePixelRatio || 1, 2); layout(); }
      rafId = requestAnimationFrame(frame);
    },
  };

  // never get permanently stuck: if the GPU drops the context (tab backgrounded,
  // driver reset on a tablet), recover cleanly instead of freezing.
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    if (rafId) cancelAnimationFrame(rafId); rafId = 0;
  }, false);
  canvas.addEventListener("webglcontextrestored", () => {
    if (anchors.length) { layout(); }
    if (running) { lastT = 0; rafId = requestAnimationFrame(frame); }
  }, false);

  // resume rendering when the tab/app comes back to the foreground
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && running && !rafId) { lastT = 0; rafId = requestAnimationFrame(frame); }
  });

  const img = new Image();
  img.onload = () => { anchors = sample(img); layout(); rafId = requestAnimationFrame(frame); };
  img.src = "./assets/logos/phygital-glyph.png";

  let resizeT;
  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      if (anchors.length && running) layout();
    }, 120);
  });
})();
