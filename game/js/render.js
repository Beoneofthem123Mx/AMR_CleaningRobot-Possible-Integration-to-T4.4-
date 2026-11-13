// Human Tsunami · 3D rendering
// ===== 3D rendering (three.js) =====
const TEXS = 16, FXS = 10;                 // pixels per meter: ground texture and effects layer
// VIEW_FLIP -1 turns the top view around: the stage sits on the other side and the crowd flows the other way
let VIEW_FLIP = 1;
let S = 10, dpr = 1, staticLayer = null, staticDirty = true, camMode = 0, LAND = false;  // LAND: landscape monitor
const G3 = {};
const lin = hex => new THREE.Color(hex).convertSRGBToLinear();
const SKIN = ["#f1c9a5", "#e0ac84", "#c68a5e", "#8d5a3b", "#5e3a24"];
const PANTS = ["#2b3a55", "#1f2328", "#4b5563", "#6b4f3a", "#2f4a3a", "#3d3f8f"];
const HAIR = ["#2b1d14", "#14110f", "#6b4a2b", "#c9a15a", "#3b2a20", "#a8401f"];
const GLOW = ["#7dff6a", "#ff4fd8", "#4fd8ff", "#fff04f"];
const toLin = arr => arr.map(h => { const c = lin(h); return [c.r, c.g, c.b]; });
let SHIRT_L, HEAT_L, SKIN_L, PANTS_L, HAIR_L, GLOW_L;

function resize() {
  const bar = $("#bar"); if (bar) document.documentElement.style.setProperty("--barh", bar.offsetHeight + "px");
  const r = $("#wrap").getBoundingClientRect();
  // on landscape screens (PC) the venue is rotated: the stage ends up on the left
  LAND = r.width > r.height;
  const ar = LAND ? WH / WW : WW / WH;
  const w = Math.min(r.width, r.height * ar), h = w / ar;
  dpr = Math.min(1.75, window.devicePixelRatio || 1); S = w / WW;
  if (G3.camera) { G3.camera.aspect = ar; G3.camera.updateProjectionMatrix(); }
  for (const c of [cv, ov]) { c.style.width = w + "px"; c.style.height = h + "px"; }
  ov.width = Math.round(w * dpr); ov.height = Math.round(h * dpr);
  $("#frame").style.fontSize = Math.max(11, Math.min(w, h) * .042) + "px";
  if (G3.renderer) { G3.renderer.setPixelRatio(dpr); G3.renderer.setSize(w, h, false); }
}
new ResizeObserver(resize).observe($("#wrap"));

function rng(seed) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
// ground texture: all the flat drawings of the venue
function buildStatic() {
  const c = document.createElement("canvas"); c.width = WW * TEXS; c.height = SH * TEXS;
  const g = c.getContext("2d"); g.scale(TEXS, TEXS);
  g.fillStyle = scene.outside; g.fillRect(0, 0, WW, SH);
  scene.ground(g, 1 / TEXS);
  groundFinish(g, true);
  scene.decor(g);
  groundFinish(g, false);
  for (const o of obs) if (o.kind === "fence" || o.kind === "closed") {
    g.lineCap = "butt"; g.lineWidth = .3; g.strokeStyle = "#7d7f7c";
    g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke();
  }
  return c;
}
// shared polish on every painted floor: soft contact shadows under tall things, fine grain, light vignette
let NOISE_PAT = null;
function groundFinish(g, before) {
  if (before) {
    g.save(); g.filter = `blur(${Math.max(2, TEXS * .45)}px)`; g.fillStyle = "rgba(0,0,0,.32)"; g.strokeStyle = "rgba(0,0,0,.32)";
    for (const o of obs) {
      const h = HEIGHTS[o.kind] || (scene.heights && scene.heights[o.kind]); if (!h || h < .5) continue;
      if (o.t === "r") g.fillRect(o.x0 - .25, o.y0 - .25, o.x1 - o.x0 + .5, o.y1 - o.y0 + .5);
      else if (o.t === "c") { g.beginPath(); g.arc(o.x, o.y, o.r + .3, 0, 7); g.fill(); }
      else { g.lineWidth = o.th + .6; g.lineCap = "round"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
    }
    g.restore(); return;
  }
  if (!NOISE_PAT) {
    const n = document.createElement("canvas"); n.width = n.height = 128; const ng = n.getContext("2d"), id = ng.createImageData(128, 128), r = rng(31);
    for (let i = 0; i < id.data.length; i += 4) { const v = r() < .5 ? 0 : 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = r() * 38; }
    ng.putImageData(id, 0, 0); NOISE_PAT = n;
  }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = g.createPattern(NOISE_PAT, "repeat"); g.fillRect(0, 0, g.canvas.width, g.canvas.height);
  const vg = g.createRadialGradient(g.canvas.width / 2, g.canvas.height * .45, g.canvas.width * .35, g.canvas.width / 2, g.canvas.height * .45, g.canvas.height * .75);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.18)"); g.fillStyle = vg; g.fillRect(0, 0, g.canvas.width, g.canvas.height);
  g.restore();
}
function drawFence(g, f, ghost) {
  g.lineCap = "round"; g.lineWidth = .35; g.strokeStyle = ghost && drag && drag.over ? "#ff2d2d" : FENCE_TYPES[f.type || "steel"].col; g.globalAlpha = ghost ? .8 : 1;
  g.beginPath(); g.moveTo(f.ax, f.ay); g.lineTo(f.bx, f.by); g.stroke();
  g.lineCap = "butt"; g.strokeStyle = "#1c1c1c"; g.setLineDash([.5, .5]); g.lineWidth = .35; g.stroke(); g.setLineDash([]); g.globalAlpha = 1;
}

// ---------- shared materials and parts ----------
const MATS = {};
function mat(hex, o) { const key = hex + JSON.stringify(o || {}); return MATS[key] || (MATS[key] = new THREE.MeshStandardMaterial(Object.assign({ color: lin(hex), roughness: .7 }, o || {}))); }
function basic(hex, o) { const key = "b" + hex + JSON.stringify(o || {}); return MATS[key] || (MATS[key] = new THREE.MeshBasicMaterial(Object.assign({ color: lin(hex), toneMapped: false }, o || {}))); }
let GEO;
function part(parent, geo, m, sx, sy, sz, x, y, z) {
  const mesh = new THREE.Mesh(GEO[geo], typeof m === "string" ? mat(m) : m);
  mesh.scale.set(sx, sy, sz); mesh.position.set(x, y, z); mesh.castShadow = true; parent.add(mesh); return mesh;
}
function pivot(parent, x, y, z) { const p = new THREE.Group(); p.position.set(x, y, z); parent.add(p); return p; }
function leg(parent, x, y, z, r, h, hex) { const p = pivot(parent, x, y, z); part(p, "cyl", hex, r, h, r, 0, -h / 2, 0); return p; }
function stripeTex(cols, bands, horiz) {
  const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d");
  for (let i = 0; i < bands; i++) { g.fillStyle = cols[i % cols.length]; if (horiz) g.fillRect(0, i * 128 / bands, 128, 128 / bands + 1); else g.fillRect(i * 128 / bands, 0, 128 / bands + 1, 128); }
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
}

function inst0(geo, material, n, sc) {
  const m = new THREE.InstancedMesh(geo, material, n); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false;
  m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3); sc.add(m); return m;
}
// a small flock of birds circling high over day venues (their shadows cross the crowd)
function birds(tt, on) {
  if (!G3.birds) {
    G3.birds = []; const cols = ["#2b2d33", "#8a8f99", "#f4f4f2", "#6b4a2b"];   // crows, pigeons, gulls, sparrows
    for (let i = 0; i < 16; i++) {
      const m = mat(cols[i % 4], { roughness: .8 }), sz = i % 4 === 2 ? 1.35 : i % 4 === 3 ? .7 : 1;
      const b = new THREE.Group(); b.scale.setScalar(sz); part(b, "sph", m, .16, .1, .1, 0, 0, 0); part(b, "cone", "#e8a020", .03, .08, .03, .19, 0, 0).rotation.z = -Math.PI / 2;
      const wl = pivot(b, 0, 0, -.06), wr = pivot(b, 0, 0, .06); part(wl, "box", m, .2, .02, .55, 0, 0, -.27); part(wr, "box", m, .2, .02, .55, 0, 0, .27);
      b.userData = { wl, wr, ph: i * .9, r: 7 + (i % 5) * 3, off: [(i % 4) * 1.3 - 2, (i % 3) * 1.1], hh: 9 + (i % 4) * 2.2, sp: .12 + (i % 3) * .05, dir: i % 2 ? 1 : -1 }; b.traverse(o => { o.castShadow = true; }); G3.scene.add(b); G3.birds.push(b);
    }
  }
  for (const b of G3.birds) {
    b.visible = on; if (!on) continue;
    const u = b.userData, a = (tt * u.sp + u.ph * .12) * u.dir;
    b.position.set(WW / 2 + Math.cos(a) * u.r + u.off[0], u.hh + Math.sin(tt * .7 + u.ph) * .6, SH * .45 + Math.sin(a) * u.r * 1.3 + u.off[1]);
    b.rotation.y = -a - Math.PI / 2 * u.dir; const f = Math.sin(tt * 9 + u.ph * 4) * .7; u.wl.rotation.x = f; u.wr.rotation.x = -f;
  }
}
function updateAmbient(tt, dtR) {
  const night = !!scene.night;
  birds(tt, !night && !(MOD && MOD.rain));
  G3.clouds.visible = !night;
  if (!night) { const map = G3.clouds.material.alphaMap; map.offset.x = tt * .004; map.offset.y = tt * .0025; }
  G3.motes.visible = night;
  if (night) {
    const cols = [[1, .85, .4], [.5, 1, .6], [.6, .8, 1], [1, .5, .9]];
    G3.moteData.forEach((d, i) => {
      const x = d.x + Math.sin(tt * d.s + d.p) * 1.2, y = d.y + Math.cos(tt * d.s * .8 + d.p) * 1.2, h = d.h + Math.sin(tt * d.s * 1.6 + d.p) * .4;
      M4.makeTranslation(x, h, y); G3.motes.setMatrixAt(i, M4);
      const tw = .5 + .5 * Math.sin(tt * 3 * d.s + d.p * 3), c = cols[i % 4];
      G3.motes.instanceColor.setXYZ(i, c[0] * 2.5 * tw, c[1] * 2.5 * tw, c[2] * 2.5 * tw);
    });
    G3.motes.instanceMatrix.needsUpdate = true; G3.motes.instanceColor.needsUpdate = true;
  }
}
function init3D() {
  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .9;
  G3.renderer = renderer; G3.landing = [];
  const sc = G3.scene = new THREE.Scene(); sc.background = new THREE.Color(0x141516);
  G3.camera = new THREE.PerspectiveCamera(30, WW / WH, 1, 500); G3.camera.up.set(0, 0, -1);
  G3.hemi = new THREE.HemisphereLight(0xffffff, 0x8a8478, .9); sc.add(G3.hemi);
  const sun = G3.sun = new THREE.DirectionalLight(0xfff1dc, 1.5);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0006; sun.shadow.normalBias = .02;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 220; sc.add(sun); sc.add(sun.target);
  GEO = {
    sph: new THREE.SphereGeometry(1, 16, 12), cyl: new THREE.CylinderGeometry(1, 1, 1, 12), box: new THREE.BoxGeometry(1, 1, 1), cone: new THREE.ConeGeometry(1, 1, 14),
  };
  // ground and effects layer
  // wide ground around the venue, only seen by the street-level camera
  G3.skirt = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ roughness: 1 }));
  G3.skirt.rotation.x = -Math.PI / 2; G3.skirt.position.set(WW / 2, -.04, SH / 2); G3.skirt.receiveShadow = true; sc.add(G3.skirt);
  G3.ground = new THREE.Mesh(new THREE.PlaneGeometry(WW, SH), new THREE.MeshStandardMaterial({ roughness: .95 }));
  G3.ground.rotation.x = -Math.PI / 2; G3.ground.position.set(WW / 2, 0, SH / 2); G3.ground.receiveShadow = true; sc.add(G3.ground);
  G3.fxCv = document.createElement("canvas"); G3.fxCv.width = WW * FXS; G3.fxCv.height = SH * FXS; G3.fx = G3.fxCv.getContext("2d");
  G3.trail = document.createElement("canvas"); G3.trail.width = G3.fxCv.width; G3.trail.height = G3.fxCv.height; G3.tctx = G3.trail.getContext("2d");
  G3.fxTex = new THREE.CanvasTexture(G3.fxCv); G3.fxTex.encoding = THREE.sRGBEncoding;
  const fxPlane = new THREE.Mesh(new THREE.PlaneGeometry(WW, SH), new THREE.MeshBasicMaterial({ map: G3.fxTex, transparent: true, depthWrite: false, toneMapped: false }));
  fxPlane.rotation.x = -Math.PI / 2; fxPlane.position.set(WW / 2, .03, SH / 2); fxPlane.renderOrder = 1; sc.add(fxPlane); G3.fxPlane = fxPlane;
  // player fences: yellow and black stripes in world coordinates
  const fc = document.createElement("canvas"); fc.width = fc.height = 64; const fg = fc.getContext("2d");
  fg.fillStyle = "#f2c230"; fg.fillRect(0, 0, 64, 64); fg.fillStyle = "#1c1c1c";
  for (let i = -64; i < 128; i += 32) { fg.beginPath(); fg.moveTo(i, 0); fg.lineTo(i + 16, 0); fg.lineTo(i + 80, 64); fg.lineTo(i + 64, 64); fg.fill(); }
  const ft = new THREE.CanvasTexture(fc); ft.encoding = THREE.sRGBEncoding; ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(WW / 1.2, SH / 1.2);
  G3.fenceMat = new THREE.MeshStandardMaterial({ map: ft, roughness: .6 });
  G3.ballTex = { cball: stripeTex(["#d8322b", "#f3e7cf", "#2f7fd6", "#e8b631"], 8, false), beach: stripeTex(["#ffffff", "#d8322b", "#ffffff", "#2f6fc4", "#ffffff", "#e8b631"], 6, false) };
  // light beam: cone with a gradient
  const gc = document.createElement("canvas"); gc.width = 4; gc.height = 128; const gg = gc.getContext("2d");
  const grd = gg.createLinearGradient(0, 0, 0, 128); grd.addColorStop(0, "#ffffff"); grd.addColorStop(1, "#000000"); gg.fillStyle = grd; gg.fillRect(0, 0, 4, 128);
  G3.beamAlpha = new THREE.CanvasTexture(gc);
  G3.beamGeo = new THREE.ConeGeometry(3.4, 34, 24, 1, true); G3.beamGeo.translate(0, -17, 0); G3.beamGeo.rotateX(-Math.PI / 2);
  // drifting cloud shadows (day) and floating light motes (night)
  const cc = document.createElement("canvas"); cc.width = cc.height = 256; const cg = cc.getContext("2d"), cr = rng(9);
  for (let k = 0; k < 9; k++) {
    const x = cr() * 256, y = cr() * 256, r = 30 + cr() * 60;
    for (const [dx, dy] of [[0, 0], [256, 0], [-256, 0], [0, 256], [0, -256]]) {
      const gr = cg.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r); gr.addColorStop(0, "rgba(0,0,0,1)"); gr.addColorStop(1, "rgba(0,0,0,0)");
      cg.fillStyle = gr; cg.beginPath(); cg.ellipse(x + dx, y + dy, r * 1.6, r, .4, 0, 7); cg.fill();
    }
  }
  const ct = new THREE.CanvasTexture(cc); ct.wrapS = ct.wrapT = THREE.RepeatWrapping; ct.repeat.set(.55, .55 * SH / WW);
  G3.clouds = new THREE.Mesh(new THREE.PlaneGeometry(WW + 40, SH + 40), new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: ct, transparent: true, opacity: .16, depthWrite: false }));
  G3.clouds.rotation.x = -Math.PI / 2; G3.clouds.position.set(WW / 2, .02, SH / 2); G3.clouds.renderOrder = 0; sc.add(G3.clouds);
  G3.motes = inst0(new THREE.SphereGeometry(.05, 6, 4), new THREE.MeshBasicMaterial({ toneMapped: false }), 160, sc);
  G3.motes.count = 160;
  G3.moteData = Array.from({ length: 160 }, () => ({ x: Math.random() * WW, y: Math.random() * WH, h: .6 + Math.random() * 3.5, p: Math.random() * 7, s: .3 + Math.random() * .6 }));
  G3.dyn = new THREE.Group(); sc.add(G3.dyn);       // spotlights and beams (change with the venue)
  G3.moverGrp = new THREE.Group(); sc.add(G3.moverGrp);
  G3.perfGrp = new THREE.Group(); sc.add(G3.perfGrp);
  // confetti
  G3.conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(.24, .15), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, toneMapped: false }), 1400);
  G3.conf.instanceMatrix.setUsage(THREE.DynamicDrawUsage); G3.conf.frustumCulled = false; G3.conf.count = 0;
  G3.conf.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(1400 * 3), 3); sc.add(G3.conf);
  CONF_L = toLin(CONF);
  const inst = (geo, material, n) => { const m = new THREE.InstancedMesh(geo, material, n); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; m.count = 0; m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3); sc.add(m); return m; };
  G3.chunk = inst(new THREE.TetrahedronGeometry(.24, 0), new THREE.MeshStandardMaterial({ roughness: .7, flatShading: true }), 900); G3.chunk.castShadow = true;
  G3.spark = inst(new THREE.SphereGeometry(.11, 6, 4), new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), 1500);
  // little ghosts that float up from the trampled: a pale body, two eyes and a glowing halo
  G3.ghostBody = inst(new THREE.CapsuleGeometry(.2, .3, 3, 10), new THREE.MeshBasicMaterial({ transparent: true, opacity: .78, depthWrite: false }), 260);
  G3.ghostEye = inst(new THREE.SphereGeometry(.045, 6, 4), new THREE.MeshBasicMaterial({ color: 0x15171c }), 520);
  { const wg = new THREE.SphereGeometry(.16, 8, 5); wg.scale(.35, 1, 1.6); wg.translate(0, .02, .2); G3.ghostWing = inst(wg, new THREE.MeshBasicMaterial({ transparent: true, opacity: .7, depthWrite: false }), 520); }   // little angel wings
  G3.ghostHalo = inst(new THREE.TorusGeometry(.17, .03, 6, 16), new THREE.MeshBasicMaterial({ toneMapped: false }), 260);
  G3.puff = inst(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshBasicMaterial({ transparent: true, opacity: .3, depthWrite: false }), 800);
  SHOE_L = toLin(["#1c1c20", "#f2f2f2", "#d8322b", "#2f6fc4", "#6b4a2b", "#1c1c20", "#e8b631"]);
  COS_L = [null].concat(toLin(["#8a5a34", "#4caf50", "#f4f4f0"])); COS_X = [null].concat(toLin(["#5e3a20", "#ffd23a", "#f2a52b", "#e53935"]));
  SHIRT_L = toLin(SHIRTS); HEAT_L = toLin(HEAT); if (typeof applyCB === "function") applyCB(); SKIN_L = toLin(SKIN); PANTS_L = toLin(PANTS); HAIR_L = toLin(HAIR); GLOW_L = toLin(GLOW);
  initPeople();
  initPost();
  resize();
}

// ---------- 3D venue ----------
const HEIGHTS = { stage: 1.8, speaker: 3.2, catwalk: 1.3, platform: 1.35, barrier: 1.1, booth: 2.4, aid: 2.4,
  canvas: 3.4, curtain: 5.5, wall: 1.3, curb: .7, pole: 4.5, popcorn: 2.5, candy: 2.5, cannon: 1.1, fence: 1.1, closed: 1.1, player: .95,
  stands: 2.6, bench: 1, hull: 1.2, pool: .15, jacuzzi: .45, lounger: .45, bar: 1.2, outerrail: .9, rail: 1, startgate: 2.2,
  grandstand: 2.2, tote: 4, winner: .3, fountain: .7,
  shop: 3.2, megastore: 3.4, escalator: 1.2, kiosk: 1.6, gazebo: .4, bench: .5, caketable: .9, pavilion: .5, portapotty: 2.4, post: 1,
  riser: 1.2, foodtruck: 2.6, tacotable: 1, taqueria: 2.6, salsabar: 1, barn: 4, farmhouse: 3, haybale: 1, arrivals: 4, carousel: .6, info: 1.1, counter: 1.1,
  ring: 1.0, ramp: .4, merch: 2.2 };
// building facades: repeating windows (they light up at night)
function windowTex() {
  const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d"), r = rng(12);
  g.fillStyle = "#2e3340"; g.fillRect(0, 0, 64, 64);
  for (let y = 4; y < 64; y += 16) for (let x = 4; x < 64; x += 16) { g.fillStyle = r() < .55 ? "#ffd98a" : "#1a1d26"; g.fillRect(x, y, 9, 10); }
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function buildingUV(geo) {
  const p = geo.attributes.position, n = geo.attributes.normal, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    if (Math.abs(n.getY(i)) > .5) { uv[i * 2] = p.getX(i) / WW; uv[i * 2 + 1] = 1 - p.getZ(i) / SH; }
    else { uv[i * 2] = (p.getX(i) + p.getZ(i)) / 3; uv[i * 2 + 1] = p.getY(i) / 3; }
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); return geo;
}
function worldUV(geo) {
  // tops show the painted floor plan; side walls take one solid color from just inside the piece, instead of smeared streaks
  const p = geo.attributes.position, n = geo.attributes.normal, uv = new Float32Array(p.count * 2);
  geo.computeBoundingBox(); const bb = geo.boundingBox, cx = (bb.min.x + bb.max.x) / 2, cz = (bb.min.z + bb.max.z) / 2;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), z = p.getZ(i);
    if (n && Math.abs(n.getY(i)) < .5) { x = cx + (x - cx) * .2; z = cz + (z - cz) * .2; }
    uv[i * 2] = x / WW; uv[i * 2 + 1] = 1 - z / SH;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); return geo;
}
function buildStatic3D() {
  staticDirty = false;
  if (G3.static) { G3.scene.remove(G3.static); G3.static.traverse(o => { if (o.geometry && !o.userData.shared) o.geometry.dispose(); }); }
  const grp = G3.static = new THREE.Group(); G3.scene.add(grp); G3.woofers = [];
  staticLayer = buildStatic();
  if (G3.groundTex) G3.groundTex.dispose();
  const tex = G3.groundTex = new THREE.CanvasTexture(staticLayer); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 8;
  G3.ground.material.map = tex; G3.ground.material.needsUpdate = true;
  const m = new THREE.MeshStandardMaterial({ map: tex, roughness: .85 });
  G3.scene.background.set(scene.night ? 0x070a12 : 0x141516);
  G3.skirt.material.color.set(scene.outside).multiplyScalar(.8);
  G3.fxPlane.material.color.setScalar(scene.night ? .5 : 1);  // keep floor markings under the bloom threshold at night
  if (!G3.winTex) G3.winTex = windowTex();
  const side = new THREE.MeshStandardMaterial({ map: G3.winTex, roughness: .7, emissiveMap: G3.winTex, emissive: new THREE.Color(scene.night ? 0xffffff : 0x000000), emissiveIntensity: scene.night ? .8 : 0 });
  for (const o of obs) {
    if (o.kind === "building") {
      const geo = new THREE.BoxGeometry(o.x1 - o.x0, o.hb, o.y1 - o.y0); geo.translate((o.x0 + o.x1) / 2, o.hb / 2, (o.y0 + o.y1) / 2); buildingUV(geo);
      const mesh = new THREE.Mesh(geo, [side, side, m, m, side, side]); mesh.castShadow = true; mesh.receiveShadow = true; grp.add(mesh); continue;
    }
    if (o.kind === "player" || o.kind === "prop") {
      // pieces placed while planning drop in from above with a bounce
      const sub = new THREE.Group(); grp.add(sub);
      if (o.kind === "player") buildFence3D(sub, o); else buildProp3D(sub, o);
      const key = o.kind === "player" ? `f${o.ax.toFixed(2)},${o.ay.toFixed(2)},${o.bx.toFixed(2)},${o.by.toFixed(2)}` : `p${o.ptype}${o.x.toFixed(2)},${o.y.toFixed(2)}`;
      if (!DROP_SEEN.has(key)) { DROP_SEEN.add(key); if (phase === "plan") { sub.position.y = 3; G3.landing.push({ g: sub, t0: performance.now(), x: o.kind === "player" ? (o.ax + o.bx) / 2 : o.x, y: o.kind === "player" ? (o.ay + o.by) / 2 : o.y }); } }
      continue;
    }
    const h = HEIGHTS[o.kind] || (scene.heights && scene.heights[o.kind]); if (!h && o.kind !== "tent") continue;
    let geo;
    if (o.kind === "tent") { geo = new THREE.ConeGeometry(Math.SQRT2 * 2.5, 3.4, 4, 1); geo.rotateY(Math.PI / 4); geo.translate((o.x0 + o.x1) / 2, 1.7, (o.y0 + o.y1) / 2); }
    else if (o.t === "r") { geo = new THREE.BoxGeometry(o.x1 - o.x0, h, o.y1 - o.y0); geo.translate((o.x0 + o.x1) / 2, h / 2, (o.y0 + o.y1) / 2); }
    else if (o.t === "c") { geo = new THREE.CylinderGeometry(o.kind === "pole" ? o.r * .7 : o.r, o.r, h, 24); geo.translate(o.x, h / 2, o.y); }
    else { const len = Math.hypot(o.bx - o.ax, o.by - o.ay); geo = new THREE.BoxGeometry(len + o.th * .5, h, o.th); geo.rotateY(-Math.atan2(o.by - o.ay, o.bx - o.ax)); geo.translate((o.ax + o.bx) / 2, h / 2, (o.ay + o.by) / 2); }
    if (o.kind !== "tent") worldUV(geo);
    if (o.kind === "tent" && !G3.tentMat) G3.tentMat = new THREE.MeshStandardMaterial({ map: stripeTex(["#d8322b", "#f6f1e7"], 8, false), roughness: .7 });   // clean candy stripes
    const mesh = new THREE.Mesh(geo, o.kind === "tent" ? G3.tentMat : o.kind === "player" ? G3.fenceMat : o.kind === "pole" ? mat("#c9a14a", { metalness: .5, roughness: .35 }) : m);
    mesh.castShadow = true; mesh.receiveShadow = true; grp.add(mesh);
    if ((o.kind === "stands" || o.kind === "grandstand" || (o.kind === "bench" && sceneKey === "boda")) && o.t === "r" && !scene.noFans) {   // seated toy fans / guests that bounce during the show
      const spots = [], r = rng(Math.round(o.x0 * 31 + o.y0 * 17)), rows = (a0, a1) => a1 - a0 < 1.2 ? [(a0 + a1) / 2] : Array.from({ length: Math.floor((a1 - a0 - .75) / .62) + 1 }, (_, i) => a0 + .45 + i * .62);
      for (const y of rows(o.y0, o.y1)) for (const x of rows(o.x0, o.x1)) if (r() < (o.kind === "bench" ? .7 : .82)) spots.push([x + (r() - .5) * .12, y + (r() - .5) * .12, r()]);
      if (spots.length) {
        const n = spots.length, body = new THREE.InstancedMesh(new THREE.SphereGeometry(.22, 7, 5), FAN_MAT, n), head = new THREE.InstancedMesh(new THREE.SphereGeometry(.17, 7, 5), FAN_MAT, n);
        const M = new THREE.Matrix4(), cB = new THREE.Color(), cH = new THREE.Color();
        spots.forEach(([x, y, q], i) => {
          M.makeScale(1, 1.25, 1).setPosition(x, h + .28, y); body.setMatrixAt(i, M);
          M.makeScale(1, 1, 1).setPosition(x, h + .68, y); head.setMatrixAt(i, M);
          body.setColorAt(i, cB.set(SHIRTS[(q * 997 | 0) % SHIRTS.length])); head.setColorAt(i, cH.set(SKIN[(q * 331 | 0) % SKIN.length]));
        });
        for (const im of [body, head]) { im.castShadow = false; im.receiveShadow = true; im.frustumCulled = false; grp.add(im); }
      }
    }
    if (o.kind === "speaker" && o.t === "r") {   // woofers on the crowd side that pump with the beat
      const cx = (o.x0 + o.x1) / 2, w = Math.min(o.x1 - o.x0, 3), rim = mat("#2b2e36", { roughness: .5 }), cone = mat("#15161a", { roughness: .8 }), cap = mat("#3a3d47", { metalness: .4, roughness: .4 });
      for (const yy of [h * .32, h * .7]) {
        const pv = pivot(grp, cx, yy, o.y1 + .02); G3.woofers.push(pv);
        const r = Math.min(w * .32, h * .17);
        const d = part(pv, "cyl", rim, r * 1.12, .05, r * 1.12, 0, 0, 0); d.rotation.x = Math.PI / 2;
        const c = part(pv, "cone", cone, r, .22, r, 0, 0, .06); c.rotation.x = -Math.PI / 2;
        part(pv, "sph", cap, r * .28, r * .28, r * .18, 0, 0, .05);
      }
    }
    if (o.kind === "pool" || o.kind === "jacuzzi" || o.kind === "fountain" || o.kind === "zoo_pond") {   // a moving water surface on top
      if (!G3.poolMat) G3.poolMat = waterify(new THREE.MeshStandardMaterial({ color: 0x0f7fc0, roughness: .06, metalness: .05, transparent: true, opacity: .82 }), 2.2);
      const wg = o.t === "r" ? new THREE.PlaneGeometry(o.x1 - o.x0 - .3, o.y1 - o.y0 - .3) : new THREE.CircleGeometry(Math.max(.2, o.r - .25), 28);
      const wm = new THREE.Mesh(wg, G3.poolMat); wm.rotation.x = -Math.PI / 2;
      wm.position.set(o.t === "r" ? (o.x0 + o.x1) / 2 : o.x, h + .012, o.t === "r" ? (o.y0 + o.y1) / 2 : o.y); grp.add(wm);
    }
  }
  // open gates: red arches
  for (let i = 0; i < SLOTS; i++) if (gates[i]) {
    const cx = slotX(i), red = mat("#d8322b", { roughness: .4 }), white = mat("#f4f1ea", { roughness: .5 });
    for (const s of [-1, 1]) {   // striped round posts with a white foot
      const p = part(grp, "cyl", red, .16, 2.5, .16, cx + s * gateW(i) / 2, 1.25, FENCE_Y); p.userData.shared = true;
      for (const y of [.7, 1.5]) { const r = part(grp, "cyl", white, .17, .18, .17, cx + s * gateW(i) / 2, y, FENCE_Y); r.userData.shared = true; }
      const f = part(grp, "cyl", white, .24, .14, .24, cx + s * gateW(i) / 2, .07, FENCE_Y); f.userData.shared = true;
    }
    const bar = part(grp, "box", red, gateW(i) + .4, .34, .34, cx, 2.55, FENCE_Y); bar.userData.shared = true;
    if (!G3.exitMat) {   // a lit green EXIT sign, readable from above and from the street
      const c = document.createElement("canvas"); c.width = 256; c.height = 96; const g = c.getContext("2d");
      g.fillStyle = "#11a650"; g.fillRect(0, 0, 256, 96); g.strokeStyle = "#ffffff"; g.lineWidth = 6; g.strokeRect(6, 6, 244, 84);
      g.fillStyle = "#ffffff"; g.font = "900 54px Rubik, system-ui, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("EXIT", 150, 50);
      g.beginPath(); g.moveTo(30, 48); g.lineTo(62, 26); g.lineTo(62, 38); g.lineTo(84, 38); g.lineTo(84, 58); g.lineTo(62, 58); g.lineTo(62, 70); g.closePath(); g.fill();
      const tx = new THREE.CanvasTexture(c); tx.encoding = THREE.sRGBEncoding; tx.anisotropy = 4;
      G3.exitMat = new THREE.MeshStandardMaterial({ map: tx, emissiveMap: tx, emissive: new THREE.Color(0xffffff), emissiveIntensity: .35, roughness: .5 });
    }
    G3.exitMat.emissiveIntensity = scene.night ? 1.1 : .35;
    for (const z of [-.19, .19]) { const sign = part(grp, "box", G3.exitMat, 1.3, .5, .04, cx, 2.55, FENCE_Y + z); sign.userData.shared = true; if (z > 0) sign.rotation.y = Math.PI; }
    const top = part(grp, "box", G3.exitMat, 1.3, .04, .5, cx, 2.73, FENCE_Y); top.userData.shared = true; top.rotation.x = 0;
  }
  G3.trompo = null;
  if (scene.extra3D) scene.extra3D(grp);
  grp.traverse(o => { if (o.isMesh && GEO && Object.values(GEO).includes(o.geometry)) o.userData.shared = true; });
  // stage spotlights and light beams
  G3.dyn.clear();
  const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(.24, 10, 8), new THREE.MeshBasicMaterial({ toneMapped: false }), scene.bulbs.length);
  bulbs.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(scene.bulbs.length * 3), 3);
  scene.bulbs.forEach(([x, y], i) => { bulbs.setMatrixAt(i, new THREE.Matrix4().makeTranslation(x, scene.bulbH, y)); });
  G3.bulbs = bulbs; G3.dyn.add(bulbs);
  G3.beams = scene.beams.map(b => {
    const mesh = new THREE.Mesh(G3.beamGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, alphaMap: G3.beamAlpha, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
    mesh.position.set(b.x, b.h || 7, b.y); G3.dyn.add(mesh); return mesh;
  });
  // night venues: laser beams fanning out from the stage over the crowd
  G3.lasers = [];
  if (scene.night && scene.beams.length) {
    const src = scene.beams[0], src2 = scene.beams[scene.beams.length - 1], lg = new THREE.CylinderGeometry(.09, .09, 1, 6, 1, true); lg.translate(0, .5, 0); lg.rotateX(Math.PI / 2);
    for (let i = 0; i < 8; i++) {
      const b = i % 2 ? src2 : src, lm = new THREE.Mesh(lg, new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0x30ff6a : i % 3 === 1 ? 0xff3fd0 : 0x40c8ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
      lm.position.set(b.x, (b.h || 7) - .5, b.y); lm.scale.z = 70; lm.userData.ph = i * .8; G3.dyn.add(lm); G3.lasers.push(lm);
    }
  }
  // lighting depends on the venue
  G3.hemi.color.set(scene.light.sky); G3.hemi.groundColor.set(scene.light.ground); G3.hemi.intensity = scene.light.hemi;
  G3.sun.color.set(scene.light.sun); G3.sun.intensity = scene.light.sunI;
  // fixed performers
  G3.perfGrp.clear();
  for (const p of performers) { p.obj = buildModel(p); G3.perfGrp.add(p.obj); }
}

// ---------- the player's fences: one look per material ----------
function buildFence3D(grp, o) {
  const len = Math.hypot(o.bx - o.ax, o.by - o.ay), ang = -Math.atan2(o.by - o.ay, o.bx - o.ax), mx = (o.ax + o.bx) / 2, my = (o.ay + o.by) / 2;
  const slab = (h, w, material, y0, extra) => {
    const geo = new THREE.BoxGeometry(len + (extra ?? w * .5), h, w); geo.rotateY(ang); geo.translate(mx, (y0 || 0) + h / 2, my); worldUV(geo);
    const mesh = new THREE.Mesh(geo, material); mesh.castShadow = true; mesh.receiveShadow = true; grp.add(mesh); return mesh;
  };
  const along = (step, fn) => { const n = Math.max(1, Math.round(len / step)); for (let i = 0; i <= n; i++) { const q = i / n; fn(o.ax + (o.bx - o.ax) * q, o.ay + (o.by - o.ay) * q, i); } };
  const shared = m => { m.userData.shared = true; return m; };
  switch (o.ftype) {
    case "concrete":   // grey jersey barrier with a lighter cap
      slab(.7, .55, mat("#a3a7ad", { roughness: .95 })); slab(.18, .32, mat("#c3c6cb", { roughness: .9 }), .7);
      break;
    case "foam":       // fat blue padding with white bands
      slab(1.05, .55, mat("#3fa9e0", { roughness: .85 })); slab(.12, .58, mat("#ffffff", { roughness: .8 }), .5);
      break;
    case "rope":       // brass posts and a red velvet rope
      along(1.4, (x, y) => { shared(part(grp, "cyl", mat("#d6a640", { metalness: .7, roughness: .3 }), .05, .95, .05, x, .475, y)); shared(part(grp, "sph", mat("#d6a640", { metalness: .7, roughness: .3 }), .09, .09, .09, x, .98, y)); shared(part(grp, "cyl", mat("#2b2b2b"), .16, .05, .16, x, .025, y)); });
      slab(.07, .07, mat("#b3122a", { roughness: .6 }), .78, 0);
      break;
    case "cones":      // traffic cones
      along(.8, (x, y) => { shared(part(grp, "cone", mat("#ff6a1a", { roughness: .6 }), .17, .5, .17, x, .25, y)); shared(part(grp, "cyl", mat("#ffffff"), .1, .06, .1, x, .3, y)); shared(part(grp, "box", mat("#ff6a1a"), .38, .04, .38, x, .02, y)); });
      break;
    default:           // steel barrier, yellow and black
      slab(.95, o.th, G3.fenceMat);
  }
}

// ---------- the player's props ----------
function buildProp3D(grp, o) {
  const sh = m => { m.userData.shared = true; return m; }, x = o.x, y = o.y;
  if (o.ptype === "water") {        // water cooler on a little table, with a stack of cups
    sh(part(grp, "box", "#e9e4d8", 1.4, .75, .8, x, .375, y));                                   // table
    sh(part(grp, "box", "#1e88e5", 1.42, .14, .82, x, .7, y));                                    // blue tablecloth band
    for (const dx of [-.35, .3]) {                                                                // two big water jugs on stands
      sh(part(grp, "cyl", "#f4f4f2", .24, .35, .24, x + dx, .95, y));
      sh(part(grp, "sph", mat("#6fd0ff", { roughness: .05, metalness: .1, transparent: true, opacity: .8 }), .27, .4, .27, x + dx, 1.45, y));
      sh(part(grp, "cyl", "#2f6fc4", .07, .08, .07, x + dx, 1.86, y));
    }
    for (let k = 0; k < 4; k++) sh(part(grp, "cyl", "#ffffff", .07, .14, .06, x - .55 + k * .12, .84, y + .3));   // paper cups
    const sign = part(grp, "box", basic("#4fc3f7"), .9, .32, .04, x, 2.3, y); sh(sign); sh(part(grp, "cyl", "#d9dde2", .025, 1.4, .025, x, 1.55, y - .04));
  } else if (o.ptype === "medic") { // white tent with a big red cross on the roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.45, 1.1, 4, 1), mat("#f7f7f5", { roughness: .8 })); roof.rotation.y = Math.PI / 4; roof.position.set(x, 1.95, y); roof.castShadow = true; grp.add(roof);
    sh(part(grp, "box", "#f7f7f5", 2, 1.4, 2, x, .7, y));
    sh(part(grp, "box", basic("#e53935"), 1.1, .06, .32, x, 2.42, y)); sh(part(grp, "box", basic("#e53935"), .32, .06, 1.1, x, 2.42, y));
    sh(part(grp, "box", "#e53935", .05, .5, .5, x + 1.01, .9, y));
    for (const [dx, dz, ry] of [[0, 1.01, 0], [0, -1.01, 0], [-1.01, 0, 1]]) {   // red crosses on every side and a dark doorway
      sh(part(grp, "box", basic("#e53935"), ry ? .04 : .6, .18, ry ? .6 : .04, x + dx, 1.05, y + dz)); sh(part(grp, "box", basic("#e53935"), ry ? .04 : .18, .6, ry ? .18 : .04, x + dx, 1.05, y + dz));
    }
    sh(part(grp, "box", "#3a2f2a", .04, .9, .6, x + 1.02, .45, y + .55));
    G3.medicLights = G3.medicLights || []; const lt = part(grp, "sph", basic("#ff3b30"), .14, .14, .14, x, 2.62, y); G3.medicLights.push(lt);
  } else if (o.ptype === "megatower") {   // a pole with three loudspeakers and a warning light
    sh(part(grp, "cyl", "#8a8f99", .08, 3.4, .08, x, 1.7, y)); for (let k = 0; k < 3; k++) { const a = k * 2.094, c = sh(part(grp, "cone", "#f4f4f0", .28, .55, .28, x + Math.cos(a) * .3, 3.2, y + Math.sin(a) * .3)); c.rotation.set(Math.sin(a) * 1.4, 0, -Math.cos(a) * 1.4); }
    sh(part(grp, "sph", basic("#ffd23a"), .15, .15, .15, x, 3.6, y)); sh(part(grp, "cyl", "#3a3d45", .5, .15, .5, x, .08, y));
  } else if (o.ptype === "pills") {   // a pink turret with a pill-shaped barrel
    sh(part(grp, "cyl", "#3a3d45", .45, .4, .45, x, .2, y)); sh(part(grp, "sph", "#ff6fb1", .42, .38, .42, x, .7, y));
    const b = sh(part(grp, "cyl", "#ffffff", .1, .7, .1, x, .85, y - .35)); b.rotation.x = Math.PI / 2 - .3; sh(part(grp, "sph", "#ffd23a", .12, .12, .12, x, .95, y - .7)); toyEyes(grp, x + .3, .85, .14, .07);
  } else if (o.ptype === "bouncy") {   // an inflatable castle with turrets
    sh(part(grp, "cyl", "#a98bff", 1.4, .9, 1.4, x, .45, y)); for (let k = 0; k < 4; k++) { const a = k * 1.571 + .785; sh(part(grp, "cyl", ["#ff6fb1", "#ffd23a", "#4fb8ff", "#7ac943"][k], .3, 1.6, .3, x + Math.cos(a) * 1.1, .8, y + Math.sin(a) * 1.1)); sh(part(grp, "cone", "#ff3b2f", .32, .4, .32, x + Math.cos(a) * 1.1, 1.8, y + Math.sin(a) * 1.1)); }
  } else if (o.ptype === "hotdogs") {   // a cannon on wheels with a hot dog in the barrel
    const b = sh(part(grp, "cyl", "#2a2b2d", .25, 1.1, .25, x, .7, y)); b.rotation.x = -.8; for (const s2 of [-1, 1]) { const w = sh(part(grp, "cyl", "#8a5a34", .32, .1, .32, x + s2 * .35, .32, y)); w.rotation.z = Math.PI / 2; }
    const hd = sh(part(grp, "cyl", "#c0402a", .1, .5, .1, x, 1.2, y - .4)); hd.rotation.x = -.8; sh(part(grp, "box", "#ff9a3c", .5, .3, .3, x, .25, y + .4));
  } else if (o.ptype === "fan") {   // a giant fan facing the gates
    sh(part(grp, "box", "#3a3d45", .5, 1.4, .3, x, .7, y)); const r = sh(part(grp, "cyl", "#4fb8ff", .7, .12, .7, x, 1.5, y + .2)); r.rotation.x = Math.PI / 2; sh(part(grp, "sph", "#f4f4f0", .15, .15, .15, x, 1.5, y + .3));
  } else if (o.ptype === "tubeman") {   // a wacky waving tube man
    sh(part(grp, "cyl", "#3a3d45", .3, .4, .3, x, .2, y)); sh(part(grp, "cyl", "#7ac943", .14, 2.6, .14, x, 1.7, y)); sh(part(grp, "sph", "#7ac943", .2, .2, .2, x, 3.1, y)); toyEyes(grp, x + .15, 3.15, .08, .06);
    for (const s2 of [-1, 1]) { const ar = sh(part(grp, "cyl", "#7ac943", .07, .9, .07, x, 2.6, y + s2 * .35)); ar.rotation.x = s2 * .8; }
  } else if (o.ptype === "trampoline") {   // a round trampoline with a springy mat
    sh(part(grp, "cyl", "#22d3ee", .9, .1, .9, x, .45, y)); sh(part(grp, "cyl", "#111214", .78, .11, .78, x, .46, y)); for (let k = 0; k < 4; k++) { const a = k * 1.571; sh(part(grp, "cyl", "#8a8f99", .04, .45, .04, x + Math.cos(a) * .8, .22, y + Math.sin(a) * .8)); }
  } else if (o.ptype === "screen") { // big screen on two legs, tilted so it reads from above
    for (const s of [-1, 1]) sh(part(grp, "box", "#2b2f35", .14, 2.6, .14, x, 1.3, y + s * 1.5));
    const scr = new THREE.Group(); scr.position.set(x, 2.9, y); scr.rotation.z = .9; grp.add(scr);
    sh(part(scr, "box", "#151617", .16, 1.9, 3.4, 0, 0, 0));
    const tex = screenTex(), face = new THREE.Mesh(new THREE.PlaneGeometry(3.15, 1.7), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
    face.rotation.y = Math.PI / 2; face.rotation.z = Math.PI / 2; face.position.x = .09; scr.add(face);
  }
}
let SCREEN_TEX = null;
function screenTex() {
  if (SCREEN_TEX) return SCREEN_TEX;
  const c = document.createElement("canvas"); c.width = 256; c.height = 140; const g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 256, 140); gr.addColorStop(0, "#7e57c2"); gr.addColorStop(.5, "#ff3fa4"); gr.addColorStop(1, "#ffd23a");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 140);
  g.fillStyle = "rgba(255,255,255,.9)"; g.font = "900 34px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("LIVE", 128, 52);
  g.font = "700 18px Rubik, sans-serif"; g.fillText("BEST SEAT IN THE HOUSE", 128, 96);
  SCREEN_TEX = new THREE.CanvasTexture(c); SCREEN_TEX.encoding = THREE.sRGBEncoding; return SCREEN_TEX;
}

// ---------- people: 5 models built from instanced parts ----------
// 0 classic, 1 cap, 2 long hair, 3 backpack, 4 partygoer with glow stick
let P = {};
const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), Vp = new THREE.Vector3(), Vs = new THREE.Vector3();
const Bm = new Float32Array(9), Bt = new Float32Array(3), LB = new Float32Array(12);
const loc = (sx, sy, sz, x, y, z) => new Float32Array([sx, 0, 0, 0, sy, 0, 0, 0, sz, x, y, z]);
const LOCAL = {
  torso: loc(1, 1, 1.05, 0, .98, 0), head: loc(1, 1, 1, .02, 1.6, 0), hair: loc(1.5, 1.35, 1.5, -.045, 1.655, 0),
  eyeL: loc(1, 1.25, 1, .19, 1.65, -.078), eyeR: loc(1, 1.25, 1, .19, 1.65, .078), mouth: loc(.5, 1, 1, .205, 1.53, 0),
  afro: loc(2.05, 1.9, 2.05, -.04, 1.69, 0), bun: loc(.5, .5, .5, -.1, 1.86, 0), tail: loc(.55, 1, .4, -.23, 1.5, 0),
  sign: loc(1, 1, 1, .08, 2.42, .27), signPole: loc(1.6, .55, 1.6, .08, 2.02, .27), flag: loc(1, .8, 1.25, .08, 2.5, -.2),
  cap: loc(1.45, 1.05, 1.45, -.02, 1.79, 0), brim: loc(1.25, 1, 1.15, .2, 1.765, 0), long: loc(1.3, 1, 1.4, -.17, 1.5, 0), pack: loc(1, 1, 1, -.2, 1.2, 0),
  // accessories: party hat, wide sun hat, balloon string, umbrella pole and canopy, kid on the shoulders
  phat: loc(1.2, 1.2, 1.2, 0, 1.95, 0), whatB: loc(1.25, 1, 1.25, 0, 1.76, 0), whatT: loc(1.4, 1, 1.4, 0, 1.84, 0), string: loc(1, 1, 1, -.05, 2.08, .26),
  pole: loc(1, 1, 1, .05, 1.85, .2), umb: loc(1, 1, 1, .05, 2.3, .1), kidT: loc(.5, .55, .78, -.05, 1.98, 0), kidH: loc(.82, .82, .82, -.03, 2.32, 0),
};
const LBAL = new Float32Array([1, 0, 0, 0, 1.15, 0, 0, 0, 1, 0, 0, 0]), LT = new Float32Array(12), LW = new Float32Array(12), WOB = { lean: 0, rock: 0 };
// tilt a local part matrix around the hips (lean: forward, rock: sideways); layout is 3 columns then the position
function wob(L, lean, rock) {
  const cl = Math.cos(lean), sl = Math.sin(lean), cr = Math.cos(rock), sr = Math.sin(rock), py = .55;
  const m = [cl, sl * cr, sl * sr, -sl, cl * cr, cl * sr, 0, -sr, cr];   // rotation: lean around z, then rock around x
  for (let c = 0; c < 3; c++) { const x = L[c * 3], y = L[c * 3 + 1], z = L[c * 3 + 2]; L[c * 3] = m[0] * x + m[3] * y + m[6] * z; L[c * 3 + 1] = m[1] * x + m[4] * y + m[7] * z; L[c * 3 + 2] = m[2] * x + m[5] * y + m[8] * z; }
  const x = L[9], y = L[10] - py, z = L[11]; L[9] = m[0] * x + m[3] * y + m[6] * z; L[10] = m[1] * x + m[4] * y + m[7] * z + py; L[11] = m[2] * x + m[5] * y + m[8] * z;
}
function wobPt(src) { LW.set(src); wob(LW, WOB.lean, WOB.rock); return LW; }
const LE = new Float32Array(12), LH = new Float32Array(12), XB = new Float32Array(12), FACE = { state: 0, open: 0, lift: 0 };
function lifted(src) { LH.set(src); LH[10] += FACE.lift; return LH; }
const bounceOut = q => { const n = 7.5625, d = 2.75; return q < 1 / d ? n * q * q : q < 2 / d ? n * (q -= 1.5 / d) * q + .75 : q < 2.5 / d ? n * (q -= 2.25 / d) * q + .9375 : n * (q -= 2.625 / d) * q + .984375; };
// like setBase, but tipped backwards by "tip" radians around the body's side axis (0 = standing, PI/2 = flat on the back)
// general rag-doll pose: yaw h, then pitch (+ tips onto the back, - onto the face) around the side axis,
// then roll around the forward axis; kF/kU/kS stretch each body axis (squash and stretch)
function setPose(x, y, z, h, sc, pitch, roll, kF, kU, kS) {
  const c = Math.cos(h), s = Math.sin(h), cp = Math.cos(pitch), sp = Math.sin(pitch), cr = Math.cos(roll), sr = Math.sin(roll);
  const F = [c * cp, sp, s * cp], U1 = [-c * sp, cp, -s * sp], S0 = [-s, 0, c];
  for (let i = 0; i < 3; i++) {
    const U = U1[i] * cr + S0[i] * sr, S = -U1[i] * sr + S0[i] * cr;
    Bm[i * 3] = F[i] * sc * kF; Bm[i * 3 + 1] = U * sc * kU; Bm[i * 3 + 2] = S * sc * kS;
  }
  Bt[0] = x; Bt[1] = y; Bt[2] = z;
}
// jelly wobble after a landing: big at first, dying out fast
const jiggle = (age, f, d) => age < 0 ? 0 : Math.exp(-age * d) * Math.sin(age * f);
function ragdoll(a, tt) {
  const age = t - (a.fallAt ?? -9), ty = a.fallType || 0, ph = tt * 22 + (a.fallLimb || 0), R = RAG;
  R.armL = 2.4; R.armR = 2.1; R.legL = .5; R.legR = -.5; R.open = 0;
  let x = a.x, z = a.y, y = .26, yaw = a.h + (a.fallSpin || 0), pitch = Math.PI / 2, roll = 0, kF = 1, kU = 1, kS = 1, land = 0;
  if (ty === 0) {            // BACKFLOP: arms windmill, topple backwards, bounce twice, spread-eagle
    const q = clamp(age / .75, 0, 1), e = bounceOut(q), fl = (1 - q) * (1 - q);
    pitch = e * Math.PI / 2; yaw = a.h + (a.fallSpin || 0) * e; y = .04 + .22 * e + Math.sin(q * Math.PI) * .4; land = .27;
    R.armL = 2.4 + Math.sin(ph) * 1.6 * fl; R.armR = 2.1 + Math.cos(ph * 1.3) * 1.6 * fl; R.legL = .55 + Math.sin(ph * .9) * .9 * fl; R.legR = -.5 + Math.cos(ph * 1.1) * .9 * fl; R.open = fl;
    const j = jiggle(age - .27, 34, 5) * .28; kF = 1 - j; kU = 1 + j * .4; kS = 1 + j * .4;
  } else if (ty === 1) {     // FACEPLANT: a little hop, slam face-down, legs kick up in the air, skid forward
    const hop = clamp(age / .22, 0, 1), fallq = clamp((age - .22) / .3, 0, 1), after = age - .52;
    pitch = -.25 * Math.sin(hop * Math.PI) - (Math.PI / 2) * fallq * fallq;
    y = .05 + Math.sin(hop * Math.PI) * .45 + .23 * fallq * fallq;
    const sk = clamp(after / .35, 0, 1), skid = (1 - (1 - sk) * (1 - sk)) * .55 * (after > 0 ? 1 : 0);
    x += Math.cos(yaw) * skid; z += Math.sin(yaw) * skid;
    if (after > 0) { pitch += jiggle(after, 18, 4) * .22; const j = jiggle(after, 30, 6) * .3; kF = 1 - j; kU = 1 + j * .3; kS = 1 + j * .3; }
    const kick = after > 0 ? Math.max(0, 1 - after / 1.4) : 0;
    R.armL = 2.9 + Math.sin(ph * 1.4) * .5 * (after < 0 ? 1 : kick); R.armR = 3.0 + Math.cos(ph * 1.2) * .5 * (after < 0 ? 1 : kick);   // superman arms
    R.legL = -.4 - (1.6 + Math.sin(ph * 1.1) * .7) * kick; R.legR = -.3 - (1.6 + Math.cos(ph) * .7) * kick;                             // legs bicycling up behind
    R.open = after < .3 ? 1 : 0; land = .52;
  } else if (ty === 2) {     // SPINNING TOP: spins faster and faster with arms out, wobbles, keels over sideways
    const q = clamp(age / 1.15, 0, 1), spin = Math.min(age, 1) * Math.min(age, 1) * 26, tip = clamp((age - .7) / .35, 0, 1);
    yaw = a.h + spin * (a.fallSpin > 0 ? 1 : -1);
    const wob = Math.sin(age * 16) * .25 * clamp(age / .6, 0, 1) * (1 - tip);
    pitch = wob * .6; roll = wob + bounceOut(tip) * Math.PI / 2 * (a.fallSpin > 0 ? 1 : -1);
    y = .02 + .26 * tip + Math.abs(Math.sin(age * 9)) * .12 * (1 - tip);
    R.armL = Math.PI / 2 + Math.sin(ph) * .3; R.armR = Math.PI / 2 + Math.cos(ph) * .3; R.legL = .3 * (1 - tip) + .5 * tip; R.legR = -.3 * (1 - tip) - .5 * tip; R.open = 1 - tip * .6;
    const j = jiggle(age - 1.05, 32, 5) * .3; kS = 1 - j; kF = 1 + j * .3; kU = 1 + j * .3; land = 1.05;
  } else if (ty === 3) {     // LAUNCHED: the crowd shoots them up, a backflip in the air, a splat on landing
    const fly = .8, q = clamp(age / fly, 0, 1), after = age - fly;
    x = a.fx0 + (a.x - a.fx0) * q; z = a.fy0 + (a.y - a.fy0) * q;
    y = .26 + Math.sin(q * Math.PI) * 2.2 + (after > 0 ? Math.abs(jiggle(after, 14, 6)) * .35 : 0);
    pitch = q * (Math.PI * 2 + Math.PI / 2); yaw = a.h + (a.fallSpin || 0) * .3;
    R.armL = 2.6 + Math.sin(ph * 1.6) * .8 * (1 - q); R.armR = 2.6 + Math.cos(ph * 1.5) * .8 * (1 - q); R.legL = .9; R.legR = -.9; R.open = 1 - clamp(after, 0, 1);
    if (after > 0) { const j = jiggle(after, 28, 4.5) * .42; kF = 1 - j; kU = 1 + j * .45; kS = 1 + j * .45; }
    if (!a.landed && after >= 0) { a.landed = 1; for (let k = 0; k < 6; k++) puff(a.x + (Math.random() - .5) * 1.2, a.y + (Math.random() - .5) * 1.2, .15, scene.night ? "#6a6870" : "#e6dcc4", .25, .9, .4); shake = Math.min(1, shake + .25); pop(a.x, a.y - .5, "SPLAT!"); }
    land = fly;
  } else if (ty === 5) {     // PINBALL: shot across the floor, ricocheting left and right, spinning flat, DING DING
    const dur = 1.4, q = clamp(age / dur, 0, 1), after = age - dur, e = 1 - (1 - q) * (1 - q), an = a.h;
    const zig = Math.sin(q * Math.PI * 5) * .7 * (1 - q);
    x = a.fx0 + (a.x - a.fx0) * e - Math.sin(an) * zig; z = a.fy0 + (a.y - a.fy0) * e + Math.cos(an) * zig;
    pitch = Math.PI / 2 * clamp(age / .15, 0, 1); yaw = a.h + age * 16 * (1 - q) * (a.fallSpin > 0 ? 1 : -1);
    y = .26 + Math.abs(Math.sin(q * Math.PI * 5)) * .35 * (1 - q);
    R.armL = 2.4 + Math.sin(ph * 1.7) * 1.4 * (1 - q); R.armR = 2.2 + Math.cos(ph * 1.5) * 1.4 * (1 - q); R.legL = .5 + Math.sin(ph) * .8 * (1 - q); R.legR = -.5 - Math.cos(ph) * .8 * (1 - q); R.open = 1 - q;
    if (after > 0) { const j = jiggle(after, 30, 5) * .35; kF = 1 - j; kU = 1 + j * .35; kS = 1 + j * .35; }
    if (!a.dinged && q > .3) { a.dinged = 1; pop(x, z - .6, ["DING DING!", "TILT!", "BONUS!"][(a.fallLimb * 3 | 0) % 3]); }
    land = dur;
  } else if (ty === 6) {     // HELICOPTER: spins up like a propeller, hovers for a heartbeat, drops like a sack
    const up = clamp(age / 1, 0, 1), drop = clamp((age - 1.05) / .3, 0, 1), after = age - 1.35;
    yaw = a.h + age * age * 22 * (a.fallSpin > 0 ? 1 : -1);
    y = .02 + Math.sin(up * Math.PI / 2) * 1.7 * (1 - drop * drop) + .24 * drop + (after > 0 ? Math.abs(jiggle(after, 16, 6)) * .3 : 0);
    pitch = drop * Math.PI / 2; roll = Math.sin(age * 7) * .15 * (1 - drop);
    R.armL = Math.PI / 2 + Math.sin(ph) * .15; R.armR = Math.PI / 2 - Math.sin(ph) * .15; R.legL = .25 + Math.sin(ph * 1.3) * .5 * (1 - drop); R.legR = -.25 - Math.sin(ph * 1.3) * .5 * (1 - drop); R.open = 1;
    if (after > 0) { const j = jiggle(after, 26, 5) * .38; kF = 1 - j; kU = 1 + j * .4; kS = 1 + j * .4; }
    land = 1.35;
  } else if (ty === 7) {     // DEAD BUG: knees turn to jelly, wobble down, flip on the back and kick all four limbs in the air
    const melt = clamp(age / .7, 0, 1), tip = clamp((age - .6) / .3, 0, 1), after = age - .9, kick = after > 0 ? Math.max(0, 1 - after / 2.6) : 1;
    kU = Math.max(.35, 1 - .45 * melt + Math.sin(age * 24) * .22 * (1 - tip)); kF = kS = 1 / Math.sqrt(kU);
    pitch = bounceOut(tip) * Math.PI / 2; y = .02 + .24 * tip;
    if (tip >= 1) { R.armL = 1.7 + Math.sin(ph * 1.5) * .6 * kick; R.armR = 1.6 + Math.cos(ph * 1.7) * .6 * kick; R.legL = 1.5 + Math.sin(ph * 1.2) * .7 * kick; R.legR = 1.4 + Math.cos(ph * 1.4) * .7 * kick; }
    else { R.armL = 2.6 + Math.sin(ph) * .8; R.armR = 2.5 + Math.cos(ph) * .8; R.legL = .5 * Math.sin(age * 24); R.legR = -.5 * Math.sin(age * 24); }
    R.open = 1; land = .9;
  } else if (ty === 8) {     // CARTWHEEL: rolls sideways like a starfish three times and ends up on its side
    const dur = 1.2, q = clamp(age / dur, 0, 1), after = age - dur, an = a.h, sg = a.fallSpin > 0 ? 1 : -1;
    x = a.fx0 + (a.x - a.fx0) * q; z = a.fy0 + (a.y - a.fy0) * q;
    yaw = an - Math.PI / 2 * sg; roll = sg * (q * Math.PI * 6 + q * Math.PI / 2); pitch = 0;
    y = .25 + .55 * Math.abs(Math.cos(q * Math.PI * 6)) * (1 - q) + (after > 0 ? Math.abs(jiggle(after, 18, 6)) * .25 : 0);
    R.armL = R.armR = Math.PI * .8; R.legL = .7; R.legR = -.7; R.open = 1 - clamp(after, 0, 1);
    if (after > 0) { const j = jiggle(after, 28, 5) * .3; kS = 1 - j; kF = 1 + j * .3; kU = 1 + j * .3; }
    land = dur;
  } else {                   // PANCAKE: flattened like a cartoon, springs back BOING, then falls over like a plank
    const sq = clamp(age / .12, 0, 1), boing = age - .45, tip = clamp((age - .9) / .45, 0, 1);
    let k = 1 - .65 * sq;
    if (boing > 0) k = 1 + jiggle(boing, 26, 4) * .5 - (1 - clamp(boing / .15, 0, 1)) * .65;
    kU = Math.max(.3, k); kF = kS = 1 / Math.sqrt(kU);
    pitch = tip * tip * Math.PI / 2 * (a.fallSpin > 0 ? 1 : -1); y = .02 + .25 * tip;
    if (tip >= 1) { const j = jiggle(age - 1.35, 30, 6) * .3; kF = 1 - j; kU = 1 + j * .3; }
    R.armL = .3 + 2.4 * tip; R.armR = .3 + 2.2 * tip; R.legL = .1 + .4 * tip; R.legR = -.1 - .4 * tip; R.open = sq; land = 1.35;
  }
  setPose(x, y, z, yaw, a.sc, pitch, roll, kF, kU, kS);
  return age >= land;
}
const RAG = { armL: 0, armR: 0, legL: 0, legR: 0, open: 0 };
function setTilt(x, y, z, h, sc, tip) {
  // Bm is row-major; its columns are the body's forward, up and side axes in the world (same as setBase)
  const c = Math.cos(h), s = Math.sin(h), ct = Math.cos(tip), st = Math.sin(tip);
  const F = [c * ct, st, s * ct], U = [-c * st, ct, -s * st], S = [-s, 0, c];   // forward tips up, up tips backwards
  for (let i = 0; i < 3; i++) { Bm[i * 3] = F[i] * sc; Bm[i * 3 + 1] = U[i] * sc; Bm[i * 3 + 2] = S[i] * sc; }
  Bt[0] = x; Bt[1] = y; Bt[2] = z;
}

function initPeople() {
  const rimify = m => { m.onBeforeCompile = sh => { sh.uniforms.uRim = RIM; sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nuniform float uRim;").replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
    float rimF = 1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0);
    totalEmissiveRadiance += diffuseColor.rgb * pow(rimF, 2.6) * uRim;`); }; m.customProgramCacheKey = () => "rim"; return m; };
  const N = 6000, std = o => rimify(new THREE.MeshStandardMaterial(Object.assign({ roughness: .78, flatShading: true }, o || {})));   // faceted, chunky toy look
  const mk = (geo, material, n) => {
    const m = new THREE.InstancedMesh(geo, material, n); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3); m.instanceColor.setUsage(THREE.DynamicDrawUsage);
    m.castShadow = true; m.frustumCulled = false; m.count = 0; G3.scene.add(m); return m;
  };
  // soft clay-figure people: a pill body, a big round head and rounded limbs
  // wobbly toy people: a pear-shaped body, a big round head sitting right on it, dot eyes, noodle arms, stubby legs
  const pear = [];
  for (let i = 0; i <= 6; i++) { const q = i / 6, y = -.42 + q * .84, r = .05 + Math.sin(Math.PI * Math.pow(q, .82)) * (.27 - q * .1); pear.push(new THREE.Vector2(Math.max(.02, r), y)); }
  const pearGeo = new THREE.LatheGeometry(pear, 7);
  P.torso = mk(pearGeo, std({ roughness: .58 }), N);
  P.head = mk(new THREE.IcosahedronGeometry(.215, 1), std({ roughness: .5 }), N);   // a faceted ball
  P.eye = mk(new THREE.SphereGeometry(.034, 5, 4), new THREE.MeshStandardMaterial({ color: 0x111214, roughness: .25 }), N * 2); P.eye.castShadow = false;
  P.eyeW = mk(new THREE.SphereGeometry(.034, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .3 }), N * 2); P.eyeW.castShadow = false;
  P.xbar = mk(new THREE.BoxGeometry(.02, .1, .022), new THREE.MeshStandardMaterial({ color: 0x111214, roughness: .4 }), N * 2); P.xbar.castShadow = false;   // X eyes of the trampled
  P.brow = mk(new THREE.BoxGeometry(.022, .02, .075), new THREE.MeshStandardMaterial({ color: 0x1a1210, roughness: .6 }), N * 2); P.brow.castShadow = false;   // worried eyebrows
  P.mouth = mk(new THREE.SphereGeometry(.05, 8, 6), new THREE.MeshStandardMaterial({ color: 0x3a1414, roughness: .5 }), N); P.mouth.castShadow = false;
  P.arm = mk(new THREE.CapsuleGeometry(.05, .48, 1, 5), std({ roughness: .6 }), N * 2);
  P.leg = mk(new THREE.CapsuleGeometry(.09, .42, 1, 5), std({ roughness: .7 }), N * 2);
  P.hand = mk(new THREE.IcosahedronGeometry(.066, 0), std({ roughness: .55 }), N * 2); P.hand.castShadow = false;   // round mitten hands
  P.ear = mk(new THREE.SphereGeometry(.09, 8, 6), std({ roughness: .6 }), N * 3); P.ear.castShadow = false;            // costume ears, combs
  P.spike = mk(new THREE.ConeGeometry(.075, .2, 6), std({ roughness: .5 }), N * 3); P.spike.castShadow = false;        // dino spikes, beaks
  P.shoe = mk(new THREE.SphereGeometry(.075, 6, 4), std({ roughness: .45 }), N * 2); P.shoe.castShadow = false;   // chunky toy shoes
  P.sign = mk(new THREE.BoxGeometry(.035, .42, .58), std({ roughness: .8 }), N);
  P.hair = mk(new THREE.SphereGeometry(.138, 8, 4, 0, Math.PI * 2, 0, Math.PI * .56), std({ roughness: .9 }), N);
  P.cap = mk(new THREE.CylinderGeometry(.14, .145, .1, 10), std({ roughness: .5 }), N);
  P.brim = mk(new THREE.BoxGeometry(.18, .025, .22), std({ roughness: .5 }), N);
  P.long = mk(new THREE.BoxGeometry(.1, .4, .27), std({ roughness: .9 }), N);
  P.pack = mk(new THREE.BoxGeometry(.17, .34, .28), std({ roughness: .6 }), N);
  P.glow = mk(new THREE.CylinderGeometry(.028, .028, .42, 6), new THREE.MeshBasicMaterial({ toneMapped: false }), N);
  P.glow.castShadow = false;
  P.phat = mk(new THREE.ConeGeometry(.1, .3, 10), std({ roughness: .5 }), N);
  P.what = mk(new THREE.CylinderGeometry(.34, .34, .03, 14), std({ roughness: .8 }), N);
  P.whatTop = mk(new THREE.CylinderGeometry(.13, .15, .14, 10), std({ roughness: .8 }), N);
  P.balloon = mk(new THREE.SphereGeometry(.2, 10, 8), std({ roughness: .25, metalness: .1 }), N);
  P.string = mk(new THREE.BoxGeometry(.012, .9, .012), std(), N * 2); P.string.castShadow = false;
  P.umb = mk(new THREE.ConeGeometry(.5, .2, 12), std({ roughness: .55, side: THREE.DoubleSide }), N);
  P.bag = mk(new THREE.BoxGeometry(1, 1, 1), std({ roughness: .75 }), N * 3);   // shopping bags and the box tower on the head
  // sweat drops on the squeezed, cartoon stars circling the heads of the trampled
  P.drop = mk(new THREE.SphereGeometry(.035, 8, 6), new THREE.MeshStandardMaterial({ color: 0x9fd8ff, roughness: .05, metalness: .1, emissive: 0x1a4a6a }), N); P.drop.castShadow = false;
  const starG = new THREE.OctahedronGeometry(.11, 0); starG.scale(1, 1, .4);
  P.star = mk(starG, new THREE.MeshBasicMaterial({ toneMapped: false }), 1800); P.star.castShadow = false;
}
// body base: rotation, scale and position (optionally lying down)
function setBase(x, y, z, h, sc, lying) {
  const c = Math.cos(h) * sc, s = Math.sin(h) * sc;
  if (lying) { Bm[0] = 0; Bm[1] = c; Bm[2] = -s; Bm[3] = -sc; Bm[4] = 0; Bm[5] = 0; Bm[6] = 0; Bm[7] = s; Bm[8] = c; }
  else { Bm[0] = c; Bm[1] = 0; Bm[2] = -s; Bm[3] = 0; Bm[4] = sc; Bm[5] = 0; Bm[6] = s; Bm[7] = 0; Bm[8] = c; }
  Bt[0] = x; Bt[1] = y; Bt[2] = z;
}
function emit(mesh, idx, l) {
  const a = mesh.instanceMatrix.array, o = idx * 16;
  for (let i = 0; i < 3; i++) {
    const b0 = Bm[i * 3], b1 = Bm[i * 3 + 1], b2 = Bm[i * 3 + 2];
    a[o + i] = b0 * l[0] + b1 * l[3] + b2 * l[6];
    a[o + 4 + i] = b0 * l[1] + b1 * l[4] + b2 * l[7];
    a[o + 8 + i] = b0 * l[2] + b1 * l[5] + b2 * l[8];
    a[o + 12 + i] = b0 * l[9] + b1 * l[10] + b2 * l[11] + Bt[i];
  }
  a[o + 3] = 0; a[o + 7] = 0; a[o + 11] = 0; a[o + 15] = 1;
}
function limb(px, py, pz, th, len, extra) {
  const c = Math.cos(th), s = Math.sin(th), d = len / 2 + (extra || 0);
  LB[0] = c; LB[1] = -s; LB[2] = 0; LB[3] = s; LB[4] = c; LB[5] = 0; LB[6] = 0; LB[7] = 0; LB[8] = 1;
  LB[9] = px + s * d; LB[10] = py - c * d; LB[11] = pz; return LB;
}
function colW(mesh, idx, r, g, b) { const a = mesh.instanceColor.array; a[idx * 3] = r; a[idx * 3 + 1] = g; a[idx * 3 + 2] = b; }

function renderPeople(tt, dtR, vb) {
  const C = { eyeW: 0, ear: 0, spike: 0, hand: 0, brow: 0, shoe: 0, drop: 0, star: 0, eye: 0, xbar: 0, mouth: 0, sign: 0, torso: 0, head: 0, arm: 0, leg: 0, hair: 0, cap: 0, brim: 0, long: 0, pack: 0, glow: 0, phat: 0, what: 0, whatTop: 0, balloon: 0, string: 0, umb: 0, bag: 0 }; COST_C = C;
  if (typeof TwoBody !== "undefined") { const cp = G3.camera.position; TwoBody.setViewer(cp.x, cp.z, cp.y); }
  const hm = heatMix, surging = surgeT > 0, red = HEAT_L[HEAT_L.length - 1], detail = cam.z > 1.3 || cine > .01, cap = P.torso.instanceMatrix.count;
  PLOD.n = 0;
  const draw = (a, down) => {
    // level of detail: only the people nearest the camera get faces, limbs, costumes and gear (the budget keeps the FPS up)
    const full = down || ((a.x - ccx) ** 2 + (a.y - ccz) ** 2 < PLOD.r2 && PLOD.n++ < PLOD.max);
    let bob = 0, armL = 0, armR = 0, legL = 0, legR = 0, sway = 0;
    if (down) {
      // rag-doll fall: topple backwards with a bounce, limbs flailing, then lie spread-eagled
      ragdoll(a, tt);
      armL = RAG.armL; armR = RAG.armR; legL = RAG.legL; legR = RAG.legR;
      FACE.state = 3; FACE.open = RAG.open;
    }
    else if (surging && a.dance && ((a.ph * 997) | 0) % 70 === 0) {
      // crowd surfing: carried overhead during the drop, waving
      setBase(a.x, 1.72 + Math.sin(tt * 5 + a.ph) * .07, a.y, a.h + Math.sin(tt * .8 + a.ph) * .6, a.sc, true); FACE.state = 2; FACE.open = .8;
      armL = 2.7 + Math.sin(tt * 9 + a.ph) * .3; armR = 2.7 - Math.sin(tt * 9 + a.ph) * .3; legL = Math.sin(tt * 7) * .3; legR = -legL;
    } else {
      const sp = Math.hypot(a.vx, a.vy), ws = a.ws || 0;
      // gaits: 0 normal, 1 bouncy, 2 quick little steps, 3 strut with big arms, 4 waddle, 5 tired shuffle
      a.wp += sp * dtR * (ws === 2 ? 8 : ws === 5 ? 3.6 : ws === 3 ? 4.4 : 5.2);
      const sw = Math.sin(a.wp) * Math.min(ws === 2 ? .45 : ws === 3 ? 1 : ws === 5 ? .4 : .75, sp * .55);
      bob = Math.abs(Math.cos(a.wp)) * Math.min(ws === 1 ? .16 : .06, sp * (ws === 1 ? .11 : .04));
      const as = ws === 3 ? 1.5 : ws === 5 ? .3 : ws === 4 ? .5 : .9;
      armL = -sw * as; armR = sw * as; legL = sw; legR = -sw;
      if (ws === 4) sway = Math.sin(a.wp) * .09 * Math.min(1, sp);   // waddlers rock from side to side
      if (ws === 5) { armL += .25; armR += .25; }                     // arms hanging forward
      if (a.dance) {
        const ph = tt * (surging ? 9.5 : 6.5) + a.ph, j = Math.abs(Math.sin(ph));
        bob = j * (surging ? .3 : .13); legL = -j * .15; legR = j * .15;
        if (surging || a.m === 4 || a.st === 1) { armL = 2.75 + Math.sin(ph) * .3; armR = 2.75 - Math.sin(ph) * .3; }
        else if (a.st === 0) { armR = 2.35 + Math.sin(ph) * .55; armL = .3 * Math.sin(ph * .5); }
        else { armL = armR = 1.1 + Math.sin(ph * 2) * .45; }
      }
      const olaD = ola ? Math.abs(a.x - ola.x) : 99;
      if (olaD < 2.6 || (cheerT > 0 && a.dance)) {
        const ph = tt * 8 + a.ph; armL = 2.95 + Math.sin(ph) * .12; armR = 2.95 - Math.sin(ph) * .12;
        bob = olaD < 2.6 ? .4 * (1 - olaD / 2.6) : .18 * Math.abs(Math.sin(ph));
      }
      if ((scene.night || black > .4) && (a.dance || black > .4) && a.ph < 2.2 && !surging) { armR = 2.55 + Math.sin(tt * 2 + a.ph) * .15; a.phone = true; } else a.phone = false;
      if (a.ps > PCRIT * .55) { const ph = tt * 15 + a.ph; armL = 2.3 + Math.sin(ph) * .55; armR = 2.3 + Math.cos(ph) * .55; }
      if (MOD && MOD.bounce && a.dance) bob *= MOD.bounce;
      if (a.lift > 0) { bob = a.lift * 6; armL = armR = 2.9 + Math.sin(tt * 12 + a.ph) * .3; legL = Math.sin(tt * 9 + a.ph) * .6; legR = -legL; }
      if ((a.acc === 1 || a.acc === 3 || a.acc === 6) && !surging && a.ps < PCRIT * .55) armR = 2.7;  // holding the balloon / umbrella / sign up
      if (a.acc === 7) armL = 2.8 + Math.sin(tt * 7 + a.ph) * .25;   // waving a flag
      if (a.sit > t) { bob = -.42; legL = legR = 1.5; armL = 2.6 + Math.sin(tt * 3 + a.ph) * .2; armR = .4; }   // sitting on the ground, one fist up
      if ((a.cos === 13 || a.cos === 20) && a.ps < PCRIT * .55) { armL = 1.45 + Math.sin(tt * 3 + a.ph) * .12; armR = 1.5 + Math.cos(tt * 3 + a.ph) * .12; }   // zombies and ghosts: arms out front
      if (a.bags && a.ps < PCRIT * .55) { armL = armR = .22 + Math.sin(tt * 9 + a.ph) * .05; bob *= .5; }   // arms dragged down by the shopping
      if (a.air > 0) {
        const q = 1 - a.air / (a.airD || 1), up = Math.sin(q * Math.PI) * (a.airH || 1.6);
        setPose(a.x, up + .02, a.y, a.h + q * (a.airYaw || 0), a.sc, q * Math.PI * 2 * (a.airSpin || 1), Math.sin(q * Math.PI) * .5 * (a.airSpin || 1), 1, 1 + Math.sin(q * Math.PI) * .12, 1);
        const ph = tt * 20 + a.ph; armL = 2.6 + Math.sin(ph) * 1.1; armR = 2.4 + Math.cos(ph * 1.2) * 1.1; legL = Math.sin(ph * .9) * 1.1; legR = -Math.sin(ph * .9) * 1.1;
        FACE.state = 1; FACE.open = 1;
      } else setBase(a.x - Math.sin(a.h) * sway, bob, a.y + Math.cos(a.h) * sway, a.h, a.sc, false);
    }
    // clothes: blend into the pressure color; red when in danger
    const k = down ? .5 : 1, hq = HEAT_L[clamp(Math.floor(a.ps / PCRIT * HEAT_L.length), 0, HEAT_L.length - 1)];
    const OU = a.cos > 3 ? OUTFITS[a.cos] : null;
    const sh = OU ? lc(OU.b) : a.cos ? COS_L[a.cos] : SHIRT_L[a.c], pa = OU ? lc(OU.l) : a.cos ? COS_L[a.cos] : PANTS_L[a.pc];   // costumes are one color head to toe
    let r, g, b;
    if (!down && a.dmg > .45) { r = red[0]; g = red[1]; b = red[2]; }
    else { r = sh[0] + (hq[0] - sh[0]) * hm; g = sh[1] + (hq[1] - sh[1]) * hm; b = sh[2] + (hq[2] - sh[2]) * hm; }
    if (a.rad && a.rad > t) { r = .3; g = 1.7; b = .35; }   // radioactive glow after a meltdown
    r *= k; g *= k; b *= k;
    const bw = a.bw || 1;   // build: slim to chunky
    LT.set(LOCAL.torso); LT[0] *= bw; LT[8] *= bw;
    if (!down) {   // soft body: stretch on the way up, squash on landing
      const st = 1 + clamp(bob, 0, .4) * .9 - (bob < .02 && (a.dance || a.ws === 1) ? .07 : 0), sq = 1 / Math.sqrt(st);
      LT[0] *= sq; LT[1] *= sq; LT[2] *= sq; LT[3] *= st; LT[4] *= st; LT[5] *= st; LT[6] *= sq; LT[7] *= sq; LT[8] *= sq; LT[10] = LOCAL.torso[10] * (1 + (st - 1) * .4);
      FACE.lift = (st - 1) * .45;
      const sqz = clamp((a.ps / PCRIT - .45) / .55, 0, 1);   // squeezed in the crowd: thinner and taller, like a toothpaste tube
      if (sqz > 0) { const nx = 1 - .2 * sqz, ny = 1 + .12 * sqz; LT[0] *= nx; LT[1] *= nx; LT[2] *= nx; LT[3] *= ny; LT[4] *= ny; LT[5] *= ny; LT[6] *= nx; LT[7] *= nx; LT[8] *= nx; FACE.lift += .1 * sqz; }
    } else FACE.lift = 0;
    if (!down) {   // wobble: lean forward with speed and rock from foot to foot, the head follows
      const spd = Math.min(1.4, Math.hypot(a.vx, a.vy)), tb = a.tb, tbOn = tb && tb.lod < 2 && a.air <= 0;
      let lean = spd * .16 + (a.ps > PCRIT * .55 ? .12 : 0) + (a.old ? .2 : 0), rock = Math.sin(a.wp) * .11 * Math.min(1, spd + .3);
      if (tbOn) {   // two-body physics: the torso sways on its elastic joint (twobody.js); stumblers windmill their arms
        lean = lean * .5 + tb.lean * .85; rock = rock * .5 + tb.rock * .85;
        if (tb.st > 0) { const ph = tt * 16 + a.ph; armL = 2.2 + Math.sin(ph) * 1.2; armR = 2.0 + Math.cos(ph * 1.1) * 1.2; }
      }
      wob(LT, lean, rock); WOB.lean = lean; WOB.rock = rock;
    }
    emit(P.torso, C.torso, LT); colW(P.torso, C.torso++, r, g, b);
    const skn = OU ? (OU.s ? lc(OU.s) : SKIN_L[a.sk]) : a.cos ? COS_L[a.cos] : SKIN_L[a.sk];
    const HD = down ? LOCAL.head : wobPt(lifted(LOCAL.head)); emit(P.head, C.head, HD); colW(P.head, C.head++, skn[0] * k, skn[1] * k, skn[2] * k);
    if (detail && full) {
      // expressions: 0 calm, 1 squeezed (wide eyes, O mouth), 2 cheering (squint, big grin), 3 trampled (X eyes)
      if (!down && FACE.state !== 2) { const sq = a.ps / PCRIT; FACE.state = sq > .55 ? 1 : (surging || cheerT > 0) && a.dance ? 2 : 0; FACE.open = sq > .55 ? Math.min(1, (sq - .4) * 1.6) : FACE.state === 2 ? .6 : 0; }
      const place = L => down ? L : wobPt(lifted(L));
      if (FACE.state === 3) {
        for (const [ex, ez] of [[.19, -.07], [.19, .07]]) for (const r of [.8, -.8]) { XB[0] = 1; XB[1] = 0; XB[2] = 0; XB[3] = 0; XB[4] = Math.cos(r); XB[5] = Math.sin(r); XB[6] = 0; XB[7] = -Math.sin(r); XB[8] = Math.cos(r); XB[9] = ex + .01; XB[10] = 1.65; XB[11] = ez; emit(P.xbar, C.xbar, XB); colW(P.xbar, C.xbar++, .07, .07, .08); }
      } else for (const e of [LOCAL.eyeL, LOCAL.eyeR]) {
        LE.set(e); const big = FACE.state === 1 ? 1.55 : 1, squint = FACE.state === 2 ? .35 : FACE.state === 0 && (tt * .35 + a.ph * .37) % 1 < .035 ? .12 : 1;   // calm people blink now and then
        // googly eyes: a big white ball and a pupil that rattles around inside it (wilder when running or squeezed)
        const jig = .012 + Math.min(.02, Math.hypot(a.vx, a.vy) * .008) + (FACE.state === 1 ? .014 : 0), side = e === LOCAL.eyeL ? 0 : 2.1;
        const wy = LE[10], wz = LE[11];
        LE[0] = 1.15 * big; LE[4] = 1.85 * big * squint; LE[8] = 1.85 * big; LE[9] = .175; emit(P.eyeW, C.eyeW, place(LE)); colW(P.eyeW, C.eyeW++, 1.1, 1.1, 1.1);
        LE[0] = .9 * big; LE[4] = .95 * big * squint; LE[8] = .95 * big; LE[9] = .222;
        LE[10] = wy + Math.sin(tt * 13 + a.ph * 3 + side) * jig * squint; LE[11] = wz + Math.cos(tt * 11 + a.ph * 2 + side * 1.7) * jig;
        emit(P.eye, C.eye, place(LE)); colW(P.eye, C.eye++, .05, .05, .06);
      }
      if (FACE.state === 1 && C.brow < cap * 2 - 2) for (const sd of [-1, 1]) {   // squeezed: brows shoot up and tilt into a worried tent
        const r = -sd * .45, c0 = Math.cos(r), s0 = Math.sin(r);
        XB[0] = 1; XB[1] = 0; XB[2] = 0; XB[3] = 0; XB[4] = c0; XB[5] = s0; XB[6] = 0; XB[7] = -s0; XB[8] = c0; XB[9] = .188; XB[10] = 1.745 + FACE.open * .02; XB[11] = sd * .075;
        emit(P.brow, C.brow, place(XB)); colW(P.brow, C.brow++, .08, .06, .05);
      }
      if (FACE.open > .05 || FACE.state === 2) {   // mouth: an O when scared or flailing, a wide grin when cheering
        LE.set(LOCAL.mouth); const o = FACE.open;
        if (FACE.state === 2) { LE[4] *= .45; LE[8] *= 1.7; } else { LE[4] *= .6 + o * 1.1; LE[8] *= .7 + o * .5; }
        emit(P.mouth, C.mouth, place(LE)); colW(P.mouth, C.mouth++, .23, .06, .06);
      }
      if (FACE.state === 1 && C.drop < cap) {   // a sweat drop slides down the side of the head
        const q = (tt * .9 + a.ph) % 1; LE.set(LOCAL.mouth); LE[0] = 1.5; LE[4] = 2.1; LE[8] = 1.5; LE[9] = .1; LE[10] = 1.8 - q * .3; LE[11] = (a.ph % 2 < 1 ? -1 : 1) * .2;
        emit(P.drop, C.drop, place(LE)); colW(P.drop, C.drop++, .8, .95, 1.2);
      }
    }
    FACE.state = 0; FACE.open = 0;
    if (full && a.cos && C.spike < cap * 3 - 8 && C.ear < cap * 3 - 8 && C.bag < cap * 3 - 8) costume(a, down, k);
    if (full && a.gear && hm < .7 && C.spike < cap * 3 - 8 && C.ear < cap * 3 - 8 && C.bag < cap * 3 - 8) gearParts(a, down, k, tt);
    const hc0 = a.old ? GREY_L : HAIR_L[a.hc], hs = a.hs || 0;   // hair: 0 short, 1 afro, 2 bun, 3 ponytail, 4 bald
    // pressure view: hair and caps take the pressure color too, so the map reads from above
    const hh = clamp((hm - .5) * 2, 0, 1);   // only the real pressure view (H), not the warning tint during a drop
    const hc = hh > .01 ? HC.set(hc0[0] + (hq[0] - hc0[0]) * hh, hc0[1] + (hq[1] - hc0[1]) * hh, hc0[2] + (hq[2] - hc0[2]) * hh) : hc0;
    if (a.m !== 1 && hs === 4) { /* bald and proud */ }
    else if (a.m !== 1 && hs === 1) { emit(P.hair, C.hair, LOCAL.afro); colW(P.hair, C.hair++, hc[0] * k, hc[1] * k, hc[2] * k); }
    else if (a.m === 1) {
      const cc = hh > .01 ? hc : SHIRT_L[a.ac];
      emit(P.cap, C.cap, LOCAL.cap); colW(P.cap, C.cap++, cc[0] * k, cc[1] * k, cc[2] * k);
      emit(P.brim, C.brim, LOCAL.brim); colW(P.brim, C.brim++, cc[0] * k, cc[1] * k, cc[2] * k);
    } else {
      emit(P.hair, C.hair, LOCAL.hair); colW(P.hair, C.hair++, hc[0] * k, hc[1] * k, hc[2] * k);
      if (hs === 2) { emit(P.head, C.head, LOCAL.bun); colW(P.head, C.head++, hc[0] * k, hc[1] * k, hc[2] * k); }
      else if (hs === 3) { emit(P.head, C.head, LOCAL.tail); colW(P.head, C.head++, hc[0] * k, hc[1] * k, hc[2] * k); }
    }
    if (a.acc && !down && hh < .4) {   // accessories hide during the pressure view
      const ac = SHIRT_L[a.ac];
      if (a.acc === 1) {        // balloon on a string, swaying
        LBAL[9] = -.12 + Math.sin(tt * 1.7 + a.ph) * .1; LBAL[10] = 2.72 + Math.sin(tt * 2.3 + a.ph) * .07; LBAL[11] = .3;
        emit(P.balloon, C.balloon, LBAL); colW(P.balloon, C.balloon++, ac[0] * 1.15, ac[1] * 1.15, ac[2] * 1.15);
        emit(P.string, C.string, LOCAL.string); colW(P.string, C.string++, .8, .8, .8);
      } else if (a.acc === 2) { emit(P.phat, C.phat, LOCAL.phat); colW(P.phat, C.phat++, ac[0], ac[1], ac[2]); }
      else if (a.acc === 3) {   // umbrella
        emit(P.umb, C.umb, LOCAL.umb); colW(P.umb, C.umb++, ac[0], ac[1], ac[2]);
        emit(P.string, C.string, LOCAL.pole); colW(P.string, C.string++, .15, .15, .15);
      } else if (a.acc === 4) { // kid on the shoulders
        const kc = SHIRT_L[(a.ac + 3) % SHIRT_L.length];
        emit(P.torso, C.torso, LOCAL.kidT); colW(P.torso, C.torso++, kc[0] * k, kc[1] * k, kc[2] * k);
        emit(P.head, C.head, LOCAL.kidH); colW(P.head, C.head++, skn[0] * k, skn[1] * k, skn[2] * k);
      } else if (a.acc === 6) { // protest-style sign on a stick
        const bobS = Math.sin(tt * 6 + a.ph) * .05; LT.set(LOCAL.sign); LT[10] += bobS;
        emit(P.sign, C.sign, LT); colW(P.sign, C.sign++, ac[0] * 1.1, ac[1] * 1.1, ac[2] * 1.1);
        emit(P.string, C.string, LOCAL.signPole); colW(P.string, C.string++, .85, .8, .7);
      } else if (a.acc === 7) { // little flag
        LT.set(LOCAL.flag); LT[10] += Math.sin(tt * 7 + a.ph) * .08; LT[11] += Math.sin(tt * 7 + a.ph) * .12;
        emit(P.sign, C.sign, LT); colW(P.sign, C.sign++, ac[0] * 1.1, ac[1] * 1.1, ac[2] * 1.1);
      } else if (a.acc === 5) { // wide sun hat
        emit(P.what, C.what, LOCAL.whatB); colW(P.what, C.what++, .78, .62, .32);
        emit(P.whatTop, C.whatTop, LOCAL.whatT); colW(P.whatTop, C.whatTop++, .74, .58, .3);
      }
    }
    if (full && a.bags && !down && hh < .4 && C.bag < P.bag.instanceMatrix.count - 12) {   // overloaded shopper: bags on both hands, boxes on the head
      const n = a.bags, sw = Math.sin(tt * 6 + a.ph) * .07, az2 = .22 * bw + .05;
      for (let i = 0; i < Math.min(n, 4); i++) {
        const side = i % 2 ? 1 : -1, j = i >> 1, bc = BAG_L[((a.bagC | 0) + i) % BAG_L.length];
        LT.fill(0); LT[0] = .34; LT[4] = .44 + j * .04; LT[8] = .17;
        LT[9] = .1 + sw * (j + 1) - j * .08; LT[10] = .48 - j * .04; LT[11] = side * (az2 + .14 + j * .13);
        emit(P.bag, C.bag, LT); colW(P.bag, C.bag++, bc[0], bc[1], bc[2]);
      }
      for (let j = 0; j < n - 4; j++) {   // the tower of boxes, swaying more the higher it gets
        const bc = BAG_L[((a.bagC | 0) + j + 3) % BAG_L.length], wob = Math.sin(tt * 3.1 + a.ph + j * .7) * .035 * (j + 1);
        LT.fill(0); LT[0] = .4 - j * .035; LT[4] = .22; LT[8] = .36 - j * .03;
        LT[9] = wob; LT[10] = 2.02 + j * .23; LT[11] = Math.cos(tt * 2.3 + a.ph + j) * .02 * (j + 1);
        emit(P.bag, C.bag, LT); colW(P.bag, C.bag++, bc[0] * .9, bc[1] * .9, bc[2] * .9);
      }
    }
    if ((!detail || !full) && !down) return;
    const az = .22 * bw + .05, bare = a.cl === 1 || a.cl === 3;   // short sleeves show skin
    const ar = bare ? skn[0] * k : r, agc = bare ? skn[1] * k : g, ab = bare ? skn[2] * k : b;
    emit(P.arm, C.arm, limb(0, 1.28, -az, armL, .56)); colW(P.arm, C.arm++, ar, agc, ab);
    emit(P.arm, C.arm, limb(0, 1.28, az, armR, .56)); colW(P.arm, C.arm++, ar, agc, ab);
    for (const [th, z] of [[armL, -az], [armR, az]]) {   // a hand at the end of each noodle arm
      LE[0] = 1; LE[1] = 0; LE[2] = 0; LE[3] = 0; LE[4] = 1; LE[5] = 0; LE[6] = 0; LE[7] = 0; LE[8] = 1;
      LE[9] = Math.sin(th) * .64; LE[10] = 1.28 - Math.cos(th) * .64; LE[11] = z;
      emit(P.hand, C.hand, LE); colW(P.hand, C.hand++, skn[0] * k, skn[1] * k, skn[2] * k);
    }
    if (a.phone && !down) { emit(P.glow, C.glow, limb(0, 1.4, .25, armR, .42, .3)); colW(P.glow, C.glow++, 2.4, 2.4, 2.2); }
    else if (a.m === 4) { const gc = GLOW_L[a.ac % GLOW_L.length]; emit(P.glow, C.glow, limb(0, 1.4, .25, armR, .42, .42)); colW(P.glow, C.glow++, gc[0] * 1.6, gc[1] * 1.6, gc[2] * 1.6); }
    const lg = a.cl >= 2 ? skn : pa;   // shorts show skin
    const pr = lg[0] + (hq[0] - lg[0]) * hm * .8, pg = lg[1] + (hq[1] - lg[1]) * hm * .8, pb = lg[2] + (hq[2] - lg[2]) * hm * .8;
    emit(P.leg, C.leg, limb(0, .62, -.12, legL * .8, .56)); colW(P.leg, C.leg++, pr * k, pg * k, pb * k);
    emit(P.leg, C.leg, limb(0, .62, .12, legR * .8, .56)); colW(P.leg, C.leg++, pr * k, pg * k, pb * k);
    const shc = SHOE_L[(a.pc + a.c) % SHOE_L.length];
    for (const [th, z] of [[legL * .8, -.12], [legR * .8, .12]]) {
      LE[0] = 1.55; LE[1] = 0; LE[2] = 0; LE[3] = 0; LE[4] = .7; LE[5] = 0; LE[6] = 0; LE[7] = 0; LE[8] = 1.1;
      LE[9] = Math.sin(th) * .6 + .05; LE[10] = .62 - Math.cos(th) * .6 + .02; LE[11] = z;
      emit(P.shoe, C.shoe, LE); colW(P.shoe, C.shoe++, shc[0] * k, shc[1] * k, shc[2] * k);
    }
    if (a.m === 2) { emit(P.long, C.long, LOCAL.long); colW(P.long, C.long++, hc[0] * k, hc[1] * k, hc[2] * k); }
    if (a.m === 3) { const cc = SHIRT_L[a.ac]; emit(P.pack, C.pack, LOCAL.pack); colW(P.pack, C.pack++, cc[0] * k, cc[1] * k, cc[2] * k); }
  };
  // street camera: nobody stands in front of the lens
  const ccx = G3.camera.position.x, ccz = G3.camera.position.z, near = cine > .01 ? 2.4 * 2.4 : -1;
  // street camera: skip everyone behind the lens or outside the field of view (plus a margin for shadows)
  let fx = 0, fz = 0, cosH = -2;
  if (cine > .01) { G3.camera.getWorldDirection(CAM_V); const l = Math.hypot(CAM_V.x, CAM_V.z) || 1; fx = CAM_V.x / l; fz = CAM_V.z / l; cosH = Math.cos(Math.min(1.45, Math.atan(Math.tan(G3.camera.fov * Math.PI / 360) * G3.camera.aspect) + .35)); }
  for (const a of ag) {
    if (a.x < vb[0] || a.x > vb[1] || a.y < vb[2] || a.y > vb[3]) continue;
    const dx = a.x - ccx, dz = a.y - ccz, d2 = dx * dx + dz * dz; if (d2 < near) continue;
    if (cosH > -2 && d2 > 4 && (dx * fx + dz * fz) < cosH * Math.sqrt(d2)) continue;
    draw(a, false);
  }
  // grow or shrink the full-detail circle so about PLOD.max people get it
  PLOD.r2 = clamp(PLOD.r2 * (PLOD.n >= PLOD.max ? .88 : PLOD.n < PLOD.max * .8 ? 1.08 : 1), 9, 40000);
  for (const a of fallen) {
    if (C.torso >= cap - 1) break; draw(a, true);
    const age = t - (a.fallAt ?? -99);
    if (age > [.45, .7, 1.1, .9, 1.45, 1.4, 1.5, .9, 1.25][a.fallType || 0] && age < 5.5 && C.star < 1797) {   // stars once they have landed   // dizzy stars over the head for a few seconds
      const hx = Bm[1] * 1.62 + Bt[0], hy = Bm[4] * 1.62 + Bt[1], hz = Bm[7] * 1.62 + Bt[2], fade = Math.min(1, (5 - age) / .8);
      for (let k = 0; k < 3; k++) {
        const an = tt * 4.5 + k * 2.094 + a.ph, o = C.star * 16, s = .9 * fade * a.sc, A = P.star.instanceMatrix.array, ca = Math.cos(tt * 6 + k), sa = Math.sin(tt * 6 + k);
        A.fill(0, o, o + 16); A[o] = ca * s; A[o + 2] = -sa * s; A[o + 5] = s; A[o + 8] = sa * s; A[o + 10] = ca * s; A[o + 15] = 1;
        A[o + 12] = hx + Math.cos(an) * .3; A[o + 13] = hy + .3 + Math.sin(an * 2) * .04; A[o + 14] = hz + Math.sin(an) * .3;
        colW(P.star, C.star++, 2.2, 1.8, .35);
      }
    }
  }
  for (const key in C) { const m = P[key]; m.count = C[key]; m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; }
}

// ---------- 3D animals, cars and objects (facing +x) ----------
// big googly toy eyes on both sides of a head (x forward, z sideways)
function toyEyes(g, x, y, z, r) {
  for (const s of [-1, 1]) { part(g, "sph", "#ffffff", r, r, r, x, y, s * z); part(g, "sph", "#111214", r * .55, r * .6, r * .55, x + r * .5, y + r * .05, s * (z + r * .35)); }
}
function buildModel(m) {
  const g = new THREE.Group(), u = g.userData; u.legs = []; u.kind = m.kind;
  switch (m.kind) {
    case "elephant": {
      part(g, "sph", "#8d9095", 1.5, 1, .95, 0, 1.8, 0);
      part(g, "sph", "#969a9f", .72, .72, .72, 1.38, 2.2, 0);
      for (const s of [-1, 1]) part(g, "sph", "#7d8086", .12, .62, .55, 1.12, 2.25, s * .66);
      toyEyes(g, 1.78, 2.45, .34, .14);
      u.trunk = pivot(g, 1.95, 2.0, 0); part(u.trunk, "cyl", "#8d9095", .16, 1.4, .16, 0, -.7, 0);
      for (const [x, z] of [[.8, .5], [.8, -.5], [-.8, .5], [-.8, -.5]]) u.legs.push(leg(g, x, 1.3, z, .3, 1.3, "#858990"));
      part(g, "box", "#b8232c", 1.35, .12, 1.95, 0, 2.75, 0);
      for (const s of [-1, 1]) part(g, "box", "#e3b23c", 1.37, .08, .12, 0, 2.74, s * .98);
      part(g, "cone", "#e3b23c", .16, .55, .16, 1.38, 3.05, 0);
      u.tail = pivot(g, -1.45, 1.9, 0); part(u.tail, "cyl", "#7d8086", .04, .7, .04, 0, -.35, 0);
      break;
    }
    case "lion": {
      part(g, "sph", "#d9a04a", .95, .45, .42, 0, .9, 0);
      part(g, "sph", "#8a4b1e", .58, .58, .58, .8, 1.15, 0);
      part(g, "sph", "#e3b05e", .32, .32, .32, 1.05, 1.12, 0);
      part(g, "sph", "#2a1a10", .09, .07, .09, 1.36, 1.14, 0);
      toyEyes(g, 1.2, 1.32, .16, .09);
      for (const s of [-1, 1]) part(g, "sph", "#8a4b1e", .12, .14, .08, .95, 1.62, s * .3);
      for (const [x, z] of [[.55, .22], [.55, -.22], [-.55, .22], [-.55, -.22]]) u.legs.push(leg(g, x, .75, z, .14, .75, "#c98f3e"));
      u.tail = pivot(g, -.9, 1, 0); part(u.tail, "cyl", "#c58c3c", .04, .9, .04, 0, -.45, 0); part(u.tail, "sph", "#5a2e12", .12, .12, .12, 0, -.9, 0);
      break;
    }
    case "horse": case "racehorse": case "policehorse": {
      const c = m.col || (m.kind === "policehorse" ? "#3b2a20" : "#f2efe9");
      part(g, "sph", c, 1.1, .45, .4, 0, 1.4, 0);
      const nk = part(g, "cyl", c, .18, .9, .18, .95, 1.85, 0); nk.rotation.z = -.6;
      part(g, "sph", c, .36, .2, .17, 1.38, 2.15, 0); part(g, "sph", c === "#f2efe9" ? "#e8c8b8" : "#5a3d2a", .16, .13, .14, 1.68, 2.1, 0);
      for (const s of [-1, 1]) part(g, "cone", c, .05, .18, .05, 1.2, 2.38, s * .08);
      toyEyes(g, 1.42, 2.25, .14, .07);
      part(g, "box", c === "#f2efe9" ? "#bdb5a8" : "#1d140c", .7, .12, .05, .9, 2.0, 0);   // mane
      if (m.kind === "horse") { part(g, "cone", "#d8322b", .1, .4, .1, 1.15, 2.45, 0); part(g, "box", "#2f6fc4", .62, .1, .86, 0, 1.85, 0); }
      for (const [x, z] of [[.75, .2], [.75, -.2], [-.75, .2], [-.75, -.2]]) { const lg = leg(g, x, 1.25, z, .11, 1.25, c); part(lg, "cyl", "#2a2220", .13, .14, .13, 0, -1.2, 0); u.legs.push(lg); }
      u.tail = pivot(g, -1.05, 1.5, 0); part(u.tail, "cyl", c === "#f2efe9" ? "#bdb5a8" : "#1d140c", .06, .8, .06, 0, -.4, 0);
      // rider: colored silks in the race, blue uniform for the police
      const silk = m.kind === "policehorse" ? "#1f2a44" : m.silk || "#d8322b";
      if (m.kind !== "horse") {
        part(g, "box", m.kind === "policehorse" ? "#2b2f35" : "#ffffff", .6, .08, .8, 0, 1.86, 0);
        const rx = m.kind === "racehorse" ? .2 : 0;   // toy rider: pear body, big head, dot eyes
        part(g, "sph", silk, .24, .32, .26, rx, 2.2, 0);
        part(g, "sph", "#e0ac84", .19, .19, .19, rx + .12, 2.64, 0);
        for (const sd of [-1, 1]) part(g, "sph", "#111214", .03, .04, .03, rx + .3, 2.68, sd * .07);
        part(g, "sph", silk, .2, .1, .2, rx + .1, 2.78, 0); part(g, "box", silk, .14, .02, .22, rx + .28, 2.76, 0);
        if (m.kind === "policehorse") part(g, "box", "#ffd23a", .05, .12, .25, 0, 2.25, .2);
      }
      break;
    }
    case "dog": {
      const c = m.col;
      part(g, "sph", c, .45, .22, .2, 0, .45, 0); part(g, "sph", c, .2, .19, .19, .45, .64, 0); part(g, "sph", "#1c1c1c", .06, .05, .06, .66, .63, 0);
      toyEyes(g, .55, .71, .09, .05);
      for (const s of [-1, 1]) { const ear = part(g, "sph", "#3b2a20", .05, .14, .08, .4, .74, s * .15); ear.rotation.x = s * .5; }
      for (const [x, z] of [[.28, .1], [.28, -.1], [-.28, .1], [-.28, -.1]]) u.legs.push(leg(g, x, .4, z, .065, .4, c));
      u.tail = pivot(g, -.42, .55, 0); part(u.tail, "cyl", c, .035, .35, .035, 0, -.17, 0); u.tail.rotation.z = 2.3;
      break;
    }
    case "juggler": case "unicycle": case "flyer": case "dj": case "guard": case "influencer": {
      const clown = m.kind === "juggler" || m.kind === "unicycle";
      const body = m.kind === "flyer" ? "#d8322b" : m.kind === "dj" ? "#1c1c1c" : m.kind === "guard" ? (m.role === "slow" ? "#4fc3f7" : "#d7f53a") : m.kind === "influencer" ? "#ff6fb1" : m.col || "#2f6fc4";
      const base = m.kind === "unicycle" ? .65 : 0;
      if (m.kind === "unicycle") { const w = part(g, "cyl", "#1c1c1c", .32, .08, .32, 0, .32, 0); w.rotation.x = Math.PI / 2; part(g, "cyl", "#9aa0a6", .03, .45, .03, 0, .65, 0); u.wheel = w; }
      const bodyG = pivot(g, 0, base, 0); u.body = bodyG;
      part(bodyG, "sph", body, .27, .44, .3, 0, 1.0, 0); part(bodyG, "sph", body, .2, .22, .22, 0, 1.34, 0);   // toy pear body
      part(bodyG, "sph", clown ? "#fbe9d7" : "#e0ac84", .2, .2, .2, .02, 1.62, 0);
      for (const s of [-1, 1]) part(bodyG, "sph", "#111214", .034, .042, .034, .21, 1.67, s * .075);
      if (clown) { part(bodyG, "sph", "#ff3b2f", .07, .07, .07, .23, 1.6, 0); for (const s of [-1, 1]) part(bodyG, "sph", "#ff5a3c", .12, .12, .12, -.02, 1.68, s * .18); }
      if (m.kind === "guard") { part(bodyG, "cyl", m.role === "slow" ? "#1b5e86" : "#20252b", .2, .09, .2, -.01, 1.8, 0); part(bodyG, "box", m.role === "slow" ? "#1b5e86" : "#20252b", .2, .025, .24, .17, 1.77, 0); }
      if (m.kind === "flyer") part(bodyG, "sph", "#c9ced6", .22, .15, .22, 0, 1.72, 0);
      if (m.kind === "dj") { for (const s of [-1, 1]) part(bodyG, "sph", "#e53229", .07, .09, .07, .02, 1.64, s * .2); part(g, "box", "#2b2d33", .6, .95, 1.6, .6, .48, 0); part(g, "box", basic("#22d3ee"), .62, .08, 1.62, .6, .9, 0); }
      if (m.kind === "influencer") {
        part(bodyG, "sph", "#f5d36b", .22, .24, .22, -.05, 1.7, 0);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(.32, .04, 6, 20), basic("#ffffff")); ring.position.set(.75, 2, 0); ring.rotation.y = Math.PI / 2; g.add(ring);
        part(g, "cyl", "#222", .02, 2, .02, .75, 1, 0); part(g, "box", "#151617", .03, .16, .09, .45, 1.75, .2);
      }
      if (m.kind === "guard" && m.role === "slow") {   // steward: a round SLOW paddle held up high
        part(g, "cyl", "#e9e4d8", .025, 1.5, .025, .1, 1.9, .34); const pad = part(g, "cyl", basic("#ff9a1a"), .34, .05, .34, .1, 2.75, .34); pad.rotation.z = Math.PI / 2 * 0;
        part(g, "cyl", "#ffffff", .22, .06, .22, .1, 2.76, .34);
      }
      if (m.kind === "guard") { part(bodyG, "cyl", "#151617", .15, .09, .15, .01, 1.76, 0); part(bodyG, "box", "#151617", .16, .02, .22, .13, 1.73, 0); part(bodyG, "box", "#ff9a3c", .21, .04, .27, 0, 1.2, 0); }
      if (m.kind !== "flyer") for (const s of [-1, 1]) u.legs.push(leg(bodyG, 0, .8, s * .1, .06, .8, clown ? "#e8b631" : "#22252b"));
      u.arms = [-1, 1].map(s => { const p = pivot(bodyG, 0, 1.4, s * .25); part(p, "cyl", body, .05, .6, .05, 0, -.3, 0); return p; });
      if (m.kind === "juggler") u.balls = ["#e8b631", "#d8322b", "#3d9a5b"].map(c => part(g, "sph", c, .1, .1, .1, 0, 2, 0));
      if (m.kind === "flyer") { bodyG.rotation.z = -Math.PI / 2; bodyG.position.y = .2; }
      break;
    }
    case "mascot": {
      part(g, "sph", m.col, .75, .9, .75, 0, 1.05, 0); part(g, "sph", "#ffffff", .5, .55, .55, .3, 1.0, 0);
      const head = u.head = pivot(g, .05, 2.1, 0);
      part(head, "sph", m.col, .58, .55, .58, 0, 0, 0);
      for (const s of [-1, 1]) { part(head, "sph", "#ffffff", .16, .16, .16, .44, .12, s * .2); part(head, "sph", "#111214", .07, .07, .07, .58, .12, s * .2); part(head, "sph", m.col, .16, .22, .12, -.05, .5, s * .32); }
      part(head, "sph", "#ffd23a", .14, .1, .2, .55, -.12, 0);
      u.arms = [-1, 1].map(s => { const p = pivot(g, 0, 1.55, s * .75); part(p, "cyl", m.col, .14, .7, .14, 0, -.35, 0); part(p, "sph", "#ffffff", .17, .17, .17, 0, -.75, 0); return p; });
      for (const s of [-1, 1]) u.legs.push(leg(g, 0, .55, s * .3, .16, .55, m.col));
      break;
    }
    case "router": {
      part(g, "cyl", "#4a4d55", .06, 1.3, .06, 0, .65, 0);
      part(g, "box", "#f4f4f2", .6, .14, .4, 0, 1.36, 0);
      for (const s of [-1, 1]) part(g, "cyl", "#1c1c1c", .025, .45, .025, -.1, 1.62, s * .15);
      u.waves = [1, 2, 3].map(i => { const w = new THREE.Mesh(new THREE.TorusGeometry(.4 * i, .04, 6, 24, Math.PI), basic("#4fd8ff", { transparent: true, opacity: .8 })); w.position.set(0, 1.9, 0); w.rotation.y = Math.PI / 2; g.add(w); return w; });
      break;
    }
    case "chancla": {
      part(g, "box", "#2f7fd6", .5, .05, .2, 0, 0, 0); part(g, "box", "#ffd23a", .08, .1, .18, .1, .05, 0);
      u.spin = true; break;
    }
    case "flare": {
      part(g, "cyl", "#2b2d33", .05, .9, .05, 0, 1.2, 0);
      part(g, "sph", basic(m.col), .18, .18, .18, 0, 1.7, 0);
      break;
    }
    case "medic": {
      for (const [x, z] of [[.6, .55], [-.6, .55], [.6, -.55], [-.6, -.55]]) { const w = part(g, "cyl", "#151617", .3, .2, .3, x, .3, z); w.rotation.x = Math.PI / 2; }
      part(g, "box", "#f4f4f2", 2, .6, 1.2, 0, .65, 0);
      for (const [x, z] of [[.8, .55], [-.8, .55], [.8, -.55], [-.8, -.55]]) part(g, "cyl", "#9aa0a8", .03, 1, .03, x, 1.45, z);
      part(g, "box", "#f4f4f2", 1.9, .08, 1.25, 0, 1.95, 0);
      part(g, "box", "#d8322b", .7, .02, .2, 0, 2.0, 0); part(g, "box", "#d8322b", .2, .02, .7, 0, 2.0, 0);
      u.siren = [part(g, "box", basic("#ff3b2f"), .15, .12, .3, .4, 2.06, .2), part(g, "box", basic("#2f7fff"), .15, .12, .3, .4, 2.06, -.2)];
      break;
    }
    case "gull": {
      const gc = m.grey ? "#8b8f99" : "#f4f4f2";
      part(g, "sph", gc, .35, .13, .14, 0, 0, 0); part(g, "sph", m.grey ? "#5d6470" : "#f4f4f2", .1, .1, .1, .3, .06, 0);
      const bk = part(g, "cone", "#ff9a3c", .04, .14, .04, .43, .05, 0); bk.rotation.z = -Math.PI / 2;
      u.wings = [-1, 1].map(s => { const p = pivot(g, 0, .05, s * .08); part(p, "box", "#b9bec6", .26, .03, .62, 0, 0, s * .31); return p; });
      break;
    }
    case "flamingo": {
      part(g, "sph", "#ff7ab8", 1, .55, .75, 0, 1.0, 0);
      const nk = part(g, "cyl", "#ff7ab8", .2, 1.5, .2, .75, 1.75, 0); nk.rotation.z = -.35;
      part(g, "sph", "#ff7ab8", .3, .3, .3, 1.0, 2.5, 0);
      const bk = part(g, "cone", "#151617", .1, .35, .1, 1.3, 2.4, 0); bk.rotation.z = -2.2;
      u.bob = true;
      break;
    }
    case "tractor": {
      for (const [x, z, r] of [[-.4, .7, .6], [-.4, -.7, .6], [.8, .6, .35], [.8, -.6, .35]]) { const w = part(g, "cyl", "#151617", r, .3, r, x, r, z); w.rotation.x = Math.PI / 2; }
      part(g, "box", "#3d8a3a", 1.8, .8, 1.1, .2, 1.0, 0);
      part(g, "box", mat("#9fd3e8", { roughness: .2 }), .8, .8, 1, -.3, 1.8, 0);
      part(g, "box", "#8a8f99", .3, .25, 2.4, -1.4, .25, 0);
      break;
    }
    case "float": {
      part(g, "box", "#7a2cff", 4.6, 1, 2.4, 0, .7, 0);
      for (let i = 0; i < 8; i++) part(g, "box", ["#ffd23a", "#ff3fa4", "#22d3ee", "#7dff6a"][i % 4], .55, .9, 2.45, -2 + i * .57, .55, 0);
      part(g, "box", "#e3b23c", 4.4, .15, 2.2, 0, 1.27, 0);
      part(g, "sph", "#ffd23a", .95, .95, .95, 1.3, 2.4, 0);
      for (const s of [-1, 1]) { part(g, "sph", "#ffffff", .24, .24, .24, 2.05, 2.6, s * .35); part(g, "sph", "#111214", .1, .1, .1, 2.25, 2.6, s * .35); }
      for (const [x, z, c] of [[-1.8, .8, "#ff3fa4"], [-1.8, -.8, "#22d3ee"], [-.3, .9, "#7dff6a"]]) { part(g, "cyl", "#ffffff", .02, 1.4, .02, x, 2, z); part(g, "sph", c, .3, .36, .3, x, 2.85, z); }
      u.dancers = [[-1.2, .4], [-1.2, -.4], [-.2, 0]].map(([x, z], i) => { const d = pivot(g, x, 1.35, z); part(d, "sph", SHIRTS[i * 4], .22, .34, .24, 0, .55, 0); part(d, "sph", "#e0ac84", .17, .17, .17, 0, 1.02, 0); for (const sd of [-1, 1]) part(d, "sph", "#111214", .028, .035, .028, .16, 1.06, sd * .06); return d; });   // toy dancers
      break;
    }
    case "car": case "icecream": case "clowncar": {
      const L = m.kind === "car" ? 4.2 : m.kind === "icecream" ? 5 : 2.6, Wd = m.kind === "car" ? 1.9 : m.kind === "icecream" ? 2.2 : 1.5;
      const bodyC = m.kind === "car" ? m.col : m.kind === "icecream" ? "#fbf4ee" : "#ffd23a";
      const wr = m.kind === "clowncar" ? .5 : .38;
      for (const [x, z] of [[L * .3, Wd / 2], [-L * .3, Wd / 2], [L * .3, -Wd / 2], [-L * .3, -Wd / 2]]) { const w = part(g, "cyl", "#151617", wr, .3, wr, x, wr, z); w.rotation.x = Math.PI / 2; const hb = part(g, "cyl", "#e8e8ea", wr * .45, .32, wr * .45, x, wr, z); hb.rotation.x = Math.PI / 2; }
      if (m.kind === "car") {
        // a chubby toy convertible: rounded body, windshield, chrome bumpers and a driver you can see
        const paint = mat(bodyC, { metalness: .25, roughness: .3 }), chrome = mat("#d9dde2", { metalness: .8, roughness: .2 });
        part(g, "sph", paint, L / 2, .5, Wd / 2, 0, .8, 0);
        part(g, "sph", mat("#b8463a", { roughness: .7 }), 1.05, .2, Wd * .36, -.3, 1.18, 0);              // the open cockpit: red leather seats
        const ws = part(g, "box", mat("#bfe3ff", { roughness: .05, metalness: .3, transparent: true, opacity: .5 }), .05, .42, Wd * .7, .55, 1.42, 0); ws.rotation.z = .45;
        for (const x of [L / 2 - .02, -L / 2 + .02]) part(g, "box", chrome, .16, .16, Wd * .9, x, .52, 0);
        for (const s of [-1, 1]) { part(g, "sph", basic("#fff6c8"), .1, .14, .17, L / 2 - .15, .88, s * .58); part(g, "sph", basic("#ff2a2a"), .07, .1, .14, -L / 2 + .12, .9, s * .62); }
        part(g, "sph", m.taxi ? "#2f6fc4" : "#f2f2ef", .26, .3, .24, -.35, 1.35, .3);                       // driver: shirt
        part(g, "sph", "#e0ac84", .21, .21, .21, -.3, 1.78, .3);                                               // head
        for (const s of [-1, 1]) part(g, "sph", "#111214", .03, .04, .03, -.1, 1.82, .3 + s * .07);
        const wheelArm = part(g, "cyl", "#151617", .2, .03, .2, .15, 1.45, .3); wheelArm.rotation.z = 1.1;     // steering wheel
        if (m.taxi) { part(g, "box", "#ffd23a", .45, .22, .8, -1.1, 1.45, 0); part(g, "box", "#151617", L * .6, .07, .03, 0, .8, Wd / 2 + .01); }
      } else if (m.kind === "icecream") {
        part(g, "box", bodyC, L, 2.1, Wd, 0, 1.35, 0);
        part(g, "box", "#ff8fc6", L + .02, .35, Wd + .02, 0, .95, 0);
        part(g, "box", "#ff8fc6", 1.1, 1.4, Wd * .95, L / 2 + .5, .95, 0);
        const cone = part(g, "cone", "#e8c07a", .55, 1.3, .55, 0, 3.0, 0); cone.rotation.x = Math.PI;
        part(g, "sph", "#ffd1ea", .65, .6, .65, 0, 3.75, 0); part(g, "sph", "#d8322b", .15, .15, .15, 0, 4.4, 0);
      } else {
        part(g, "box", bodyC, L, .8, Wd, 0, .85, 0);
        [["#d8322b", .8, .4], ["#2f6fc4", -.6, -.45], ["#3d9a5b", .2, -.3], ["#8a4fbf", -.9, .35]].forEach(([c, x, z]) => part(g, "sph", c, .18, .18, .18, x, 1.25, z));
        part(g, "sph", "#fbe9d7", .32, .32, .32, -.2, 1.7, 0);
        part(g, "sph", "#ff3b2f", .1, .1, .1, .12, 1.7, 0);
        for (const s of [-1, 1]) part(g, "sph", "#ff5a3c", .2, .2, .2, -.3, 1.8, s * .3);
        part(g, "cone", "#2f6fc4", .2, .5, .2, -.2, 2.2, 0);
        u.flower = part(g, "sph", "#ff6fb1", .14, .14, .14, .8, 1.5, .5);
      }
      break;
    }
    default:
      if (PERSONS[m.kind] || SCENE_PERSONS[m.kind]) personModel(g, u, PERSONS[m.kind] || SCENE_PERSONS[m.kind], m);
      else if (EXTRA_MODELS[m.kind] || SCENE_MODELS[m.kind]) (EXTRA_MODELS[m.kind] || SCENE_MODELS[m.kind])(g, u, m);
      break;
    case "beach": case "cball": {
      const ball = new THREE.Mesh(GEO.sph, new THREE.MeshStandardMaterial({ map: G3.ballTex[m.kind], roughness: .35 }));
      ball.scale.setScalar(m.r); ball.position.y = m.r; ball.castShadow = true; g.add(ball); u.ball = ball;
      break;
    }
  }
  return g;
}
function animateModel(m, tt) {
  const g = m.obj, u = g.userData, moving = m.kind !== "juggler" && m.kind !== "dj" && m.kind !== "guard";
  const f = m.kind === "elephant" ? 3 : m.kind === "lion" || m.kind === "racehorse" ? 13 : m.kind === "dog" ? 14 : m.kind === "horse" || m.kind === "policehorse" ? 7 : 9;
  u.legs.forEach((p, i) => { p.rotation.z = moving ? Math.sin(tt * f + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * .45 : 0; });
  if (u.trunk) u.trunk.rotation.z = -.35 + Math.sin(tt * 2.2) * .35;
  if (u.tail) u.tail.rotation.x = Math.sin(tt * (m.kind === "dog" ? 18 : 5)) * .5;
  if (u.arms) u.arms.forEach((p, i) => { p.rotation.z = m.kind === "juggler" ? 1.3 + Math.sin(tt * 10 + i * Math.PI) * .3 : m.kind === "flyer" ? 2.9 : (i ? 1 : -1) * 0 + Math.sin(tt * 9 + i) * .4; p.rotation.x = m.kind === "unicycle" ? (i ? 1.2 : -1.2) : 0; });
  if (u.balls) u.balls.forEach((b, i) => { const a = tt * 5 + i * 2.1; b.position.set(.45 + Math.cos(a) * .25, 2.1 + Math.abs(Math.sin(a)) * .9, Math.sin(a) * .35); });
  if (u.body && m.kind === "unicycle") { u.body.rotation.x = Math.sin(tt * 4 + m.x) * .12; u.wheel.rotation.y = tt * 6; }
  if (u.ball) u.ball.rotation.z = -m.spin;
  if (u.flower) u.flower.scale.setScalar(.14 + Math.abs(Math.sin(tt * 6)) * .08);
  if (u.anim) u.anim(tt, m);
  if (u.waves) u.waves.forEach((w, i) => { w.material.opacity = .25 + .75 * Math.max(0, Math.sin(tt * 4 - i)); });
  if (u.spin) g.rotation.z = tt * 14;
  if (u.wings) u.wings.forEach((p, i) => { p.rotation.x = (i ? 1 : -1) * Math.sin(tt * 12 + m.x) * .6; });
  if (u.head) u.head.rotation.x = Math.sin(tt * 5) * .15;
  if (u.siren) { const on = Math.sin(tt * 12) > 0; u.siren[0].visible = on; u.siren[1].visible = !on; }
  if (u.bob) g.position.y += Math.abs(Math.sin(tt * 3 + m.x)) * .3;
  if (u.dancers) u.dancers.forEach((d, i) => { d.position.y = 1.35 + Math.abs(Math.sin(tt * 7 + i)) * .25; d.rotation.y = tt * 2 + i; });
  if (m.kind === "dj" && u.arms) u.arms.forEach((p, i) => { p.rotation.z = phase === "show" ? 2.5 + Math.sin(tt * 7.5 + i * Math.PI) * .45 : .3; });
  if (m.kind === "guard" && u.arms) { u.arms[1].rotation.z = phase === "show" || phase === "evac" ? 2.6 + Math.sin(tt * 6) * .35 : 0; u.arms[0].rotation.z = 0; }
  if (m.kind === "mascot" && u.arms) u.arms.forEach((p, i) => { p.rotation.x = (i ? -1 : 1) * (.6 + Math.sin(tt * 8 + i) * .5); });
}

// ---------- camera, layers and frame ----------
const RAY = new THREE.Raycaster(), PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), HIT = new THREE.Vector3(), NDC = new THREE.Vector2();
function toWorld(ev) {
  const r = cv.getBoundingClientRect();
  NDC.set((ev.clientX - r.left) / r.width * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  RAY.setFromCamera(NDC, G3.camera); RAY.ray.intersectPlane(PLANE, HIT);
  return [HIT.x, HIT.z];
}
// street-level camera: a slow orbit among the crowd, looking across it instead of down at it
let cine = 0, cineAng = 0, cineDist = 13, cineH = 0;   // cineH: trailer only, a raised crane shot looking down
const SKY_DAY = new THREE.Color(0x8fd0ff), SKY_NIGHT = new THREE.Color(0x0b1030), SKY_TMP = new THREE.Color();
// living water: rolling wave normals for sun glints and a sky-colored sheen at grazing angles
// seated fans in the stands: instanced, and the vertex shader makes each one hop on its own beat
const FAN = { time: { value: 0 }, amp: { value: 0 }, ola: { value: -99 } };
const FAN_MAT = new THREE.MeshStandardMaterial({ roughness: .6 });
FAN_MAT.onBeforeCompile = sh => {
  sh.uniforms.uT = FAN.time; sh.uniforms.uA = FAN.amp; sh.uniforms.uO = FAN.ola;
  sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nuniform float uT, uA, uO;").replace("#include <begin_vertex>", `#include <begin_vertex>
    { float id = float(gl_InstanceID); float ph = fract(sin(id * 12.9898) * 43758.5453) * 6.283;
      transformed.y += abs(sin(uT * 7.0 + ph)) * uA * (.6 + .4 * fract(id * .37)) / 1.2;
      float od = abs(instanceMatrix[3].x - uO); transformed.y += max(0., 1. - od / 2.6) * .55; }`);   // the wave rolls through the stands too
};
FAN_MAT.customProgramCacheKey = () => "fans";
const RIM = { value: .42 }, DROP_SEEN = new Set(); let prints = [];
let SHOE_L = null, COS_L = null, COS_X = null; const GREY_L = [.72, .72, .74];
// costume extras, in body space: bear ears, dino back spikes, chicken comb and beak
function partM(x, y, z, rz, sx, sy, sz) {
  const c = Math.cos(rz), s = Math.sin(rz);
  LE[0] = c * sx; LE[1] = -s * sy; LE[2] = 0; LE[3] = s * sx; LE[4] = c * sy; LE[5] = 0; LE[6] = 0; LE[7] = 0; LE[8] = sz; LE[9] = x; LE[10] = y; LE[11] = z; return LE;
}
function costume(a, down, k) {
  const C = COST_C, put = (mesh, idx, L, col) => { emit(mesh, idx, down ? L : wobPt(lifted(L))); colW(mesh, idx, col[0] * k, col[1] * k, col[2] * k); }, x2 = COS_X[a.cos];
  if (a.cos > 3) {   // themed outfits: pieces built from spheres (r .09 × s), cones (.075 × .2 × s) and boxes (metres)
    const o = OUTFITS[a.cos]; if (!o || !o.p) return;
    const pt = (kind, x, y, z, sx, sy, sz, col, rz) => { const m = kind === "s" ? P.ear : kind === "c" ? P.spike : P.bag, key = kind === "s" ? "ear" : kind === "c" ? "spike" : "bag"; put(m, C[key]++, partM(x, y, z, rz || 0, sx, sy, sz), lc(col)); };
    o.p(pt, a); return;
  }
  if (a.cos === 1) for (const sd of [-1, 1]) put(P.ear, C.ear++, partM(-.02, 1.78, sd * .14, 0, 1, 1, .7), x2);
  else if (a.cos === 2) {
    put(P.ear, C.ear++, partM(.17, 1.58, 0, 0, .8, .55, 1.1), x2);   // a big snout
    for (const [x, y, r] of [[-.12, 1.8, .5], [-.2, 1.62, .9], [-.27, 1.3, 1.25], [-.28, 1.05, 1.4], [-.24, .8, 1.5]]) put(P.spike, C.spike++, partM(x, y, 0, r, 1, 1, .5), x2);
  } else {
    for (const [x, y] of [[.06, 1.8], [-.03, 1.83], [-.11, 1.79]]) put(P.ear, C.ear++, partM(x, y, 0, 0, .55, .6, .4), COS_X[4]);
    put(P.spike, C.spike++, partM(.24, 1.57, 0, -Math.PI / 2, .8, .8, .8), x2);
  }
}
// crowd gear from the shop, drawn on top of whatever the person wears
function gearParts(a, down, k, tt) {
  const C = COST_C, pt = (kind, x, y, z, sx, sy, sz, col, rz) => { const m = kind === "s" ? P.ear : kind === "c" ? P.spike : P.bag, key = kind === "s" ? "ear" : kind === "c" ? "spike" : "bag", c = lc(col);
    emit(m, C[key], down ? partM(x, y, z, rz || 0, sx, sy, sz) : wobPt(lifted(partM(x, y, z, rz || 0, sx, sy, sz)))); colW(m, C[key]++, c[0] * k, c[1] * k, c[2] * k); };
  const g = a.gear;
  if (g === "helmet") { pt("s", -.02, 1.8, 0, 2.7, 1.5, 2.7, "#ffd23a"); pt("b", .14, 1.79, 0, .2, .03, .4, "#f2c230"); }
  else if (g === "bubble") { pt("s", 0, 1.08, 0, 4.2, 5.2, 4.2, "#bfe6ff"); for (let i = 0; i < 6; i++) pt("s", Math.cos(i) * .34, .85 + (i % 3) * .2, Math.sin(i) * .34, .45, .45, .45, "#e8f6ff"); }
  else if (g === "skates") for (const z of [-.12, .12]) { pt("b", .04, .05, z, .3, .07, .12, "#ff3fa4"); for (const x of [-.06, .14]) pt("s", x, 0, z, .45, .45, .45, "#ffd23a"); }
  else if (g === "propeller") { pt("s", -.02, 1.82, 0, 1.9, .9, 1.9, "#d8322b"); pt("b", -.02, 1.93, 0, .02, .1, .02, "#111214"); const sp = (tt * 18 + a.ph) % 6.283;
    pt("b", -.02 + Math.cos(sp) * .0, 1.99, 0, .5 * Math.abs(Math.cos(sp)) + .04, .02, .5 * Math.abs(Math.sin(sp)) + .04, "#ffd23a"); }
  else if (g === "glasses") { pt("s", .21, 1.68, -.075, .42, .5, .65, "#ff2a2a"); pt("s", .21, 1.68, .075, .42, .5, .65, "#2fa8ff"); pt("b", .2, 1.72, 0, .02, .04, .32, "#f4f4f0"); }
  else if (g === "cape") { const fl = Math.sin(tt * 9 + a.ph) * .08; pt("b", -.26 - Math.abs(fl), .98, 0, .05, .95, .6, "#d8322b", .15 + fl); pt("s", .2, 1.12, 0, .6, .7, .3, "#ffd23a"); }
  else if (g === "pockets") for (const z of [-.15, .15]) { pt("b", .03, .45, z * 1.35, .2, .2, .06, "#8a7a4a"); pt("b", .03, .54, z * 1.38, .21, .03, .07, "#6b5d38"); }
  else if (g === "ducks") { pt("s", 0, .9, 0, 4.6, 1.2, 4.6, "#ffd23a"); pt("s", .38, 1.06, 0, 1.4, 1.4, 1.4, "#ffd23a"); pt("c", .52, 1.05, 0, .7, .7, .7, "#ff9a3c", -Math.PI / 2); }
}
const BAG_L = [[.95, .25, .45], [1, .8, .2], [.25, .65, .95], [.95, .95, .9], [.45, .85, .35], [.7, .45, .95], [.6, .42, .28]].map(c => c.map(v => v * v));
// themed outfits (a.cos 4+): body colour, legs, optional skin (masks, zombies), pieces
const LC = {}; const lc = h => LC[h] || (LC[h] = toLin([h])[0]);
const OUTFITS = [null, null, null, null,
  { n: "pirate", b: "#f4f4f0", l: "#2b2f35", p(pt, a) { pt("b", -.02, 1.9, 0, .5, .1, .34, "#1b1d22"); pt("c", -.02, 1.99, 0, 1.3, .6, 1.3, "#1b1d22"); pt("b", .02, 1.9, 0, .52, .03, .36, "#e3b23c");
      pt("s", .21, 1.69, .075, .55, .6, .5, "#111214"); pt("b", .1, 1.72, 0, .02, .02, .44, "#111214"); pt("b", .2, 1.05, 0, .04, .7, .1, "#d8322b", .7);
      if (a.ph < 2.5) { pt("s", -.02, 1.46, .3, 1.15, 1.3, 1.1, "#3fae5a"); pt("c", .08, 1.48, .3, .8, .8, .8, "#ff9a3c", -Math.PI / 2); pt("s", -.04, 1.56, .3, .7, .7, .7, "#d8322b"); } } },
  { n: "clown", b: "#ff6fb1", l: "#ffd23a", p(pt) { pt("s", .25, 1.6, 0, .9, .9, .9, "#ff2a2a"); for (const z of [-1, 1]) pt("s", -.04, 1.76, z * .19, 1.6, 1.4, 1.2, z > 0 ? "#ff9a3c" : "#4fb8ff"); pt("c", -.02, 2.0, 0, 1.5, 1.6, 1.5, "#ffd23a"); pt("s", -.02, 2.17, 0, .6, .6, .6, "#ffffff"); pt("s", .26, 1.15, 0, .7, .7, .7, "#ffffff"); pt("s", .27, .95, 0, .7, .7, .7, "#ffffff"); } },
  { n: "astronaut", b: "#f4f4f0", l: "#e6e6e2", p(pt) { pt("b", -.26, 1.12, 0, .16, .42, .34, "#d9dde3"); pt("s", .2, 1.67, 0, .5, .9, 2.1, "#1f3a7a"); pt("b", .05, 1.86, 0, .02, .16, .02, "#c9ced6"); pt("s", .05, 1.95, 0, .5, .5, .5, "#ff3b2f"); pt("b", .27, 1.22, .08, .02, .1, .1, "#2f7fd6"); } },
  { n: "knight", b: "#9aa0a8", l: "#6b7078", p(pt) { pt("s", -.02, 1.76, 0, 2.6, 1.6, 2.6, "#b8bec6"); pt("b", .22, 1.69, 0, .02, .03, .22, "#111214"); pt("c", -.06, 2.02, 0, .9, 2, .9, "#d8322b"); pt("b", .06, 1.0, .34, .32, .42, .05, "#d8322b"); pt("b", .07, 1.0, .37, .1, .3, .02, "#ffd23a"); } },
  { n: "hotdog", b: "#e8a050", l: "#e8a050", p(pt) { pt("s", .2, 1.2, 0, 1.3, 6, 1.4, "#c0402a"); pt("b", .32, 1.2, 0, .03, .6, .05, "#ffd23a", .3); pt("s", .01, 1.78, 0, 1.2, 1.8, 2.4, "#e8a050"); } },
  { n: "banana", b: "#ffd23a", l: "#ffd23a", s: "#ffe27a", p(pt) { pt("c", -.03, 2.0, 0, .7, 1.4, .7, "#6b4a2a"); for (const z of [-1, 1]) pt("s", 0, 1.38, z * .3, 1.4, 2.6, .5, "#f2c230"); pt("s", .02, .62, 0, 1.2, .7, 1.2, "#6b4a2a"); } },
  { n: "tourist", b: "#22d3ee", l: "#f4e3c0", p(pt) { for (const z of [-1, 1]) pt("s", .21, 1.68, z * .075, .4, .5, .7, "#111214"); pt("b", .27, 1.13, 0, .1, .13, .2, "#1b1d22"); pt("s", .32, 1.13, 0, .45, .45, .45, "#9aa0a8"); for (let i = 0; i < 4; i++) pt("s", .22, .9 + i * .14, (i % 2 ? .1 : -.1), .5, .5, .3, "#ff6fb1"); } },
  { n: "tux", b: "#1b1d22", l: "#1b1d22", p(pt) { for (const z of [-1, 1]) pt("s", .22, 1.42, z * .06, .55, .45, .6, "#d8322b"); pt("b", .2, 1.15, 0, .03, .35, .12, "#f4f4f0"); pt("b", -.02, 1.97, 0, .26, .32, .26, "#111214"); pt("b", -.02, 1.83, 0, .44, .03, .44, "#111214"); pt("b", -.02, 1.86, 0, .27, .05, .27, "#d8322b"); } },
  { n: "sailor", b: "#f4f4f0", l: "#1f3a7a", p(pt) { pt("s", -.02, 1.84, 0, 1.9, .6, 1.9, "#f4f4f0"); pt("b", -.02, 1.84, 0, .3, .04, .3, "#1f3a7a"); pt("b", -.2, 1.36, 0, .05, .2, .42, "#1f3a7a"); pt("b", .23, 1.32, 0, .03, .12, .12, "#d8322b"); } },
  { n: "zombie", b: "#6b7a5a", l: "#4a3b2a", s: "#9fc48a", p(pt) { pt("b", .18, .98, .1, .04, .2, .14, "#3b4a2a", .4); pt("b", .1, 1.22, -.2, .04, .14, .1, "#8a2f2f"); pt("s", -.02, 1.8, .08, .6, .5, .6, "#5a4a3a"); } },
  { n: "chef", b: "#f4f4f0", l: "#2b2f35", p(pt) { pt("s", -.02, 1.98, 0, 1.8, 2.4, 1.8, "#ffffff"); pt("b", -.02, 1.82, 0, .3, .08, .3, "#f4f4f0"); pt("b", .24, 1.0, 0, .02, .5, .3, "#e3e3de"); pt("s", .2, 1.52, .1, .4, .4, .4, "#d8322b"); } },
  { n: "cowboy", b: "#c0583b", l: "#3a5f8a", p(pt) { pt("b", -.02, 1.83, 0, .66, .04, .56, "#7a4a2a"); pt("b", -.02, 1.93, 0, .28, .2, .28, "#7a4a2a"); pt("b", -.02, 1.86, 0, .29, .04, .29, "#2b1d14"); pt("s", .21, 1.38, 0, .6, .6, .5, "#e3b23c"); pt("b", .1, .78, 0, .3, .05, .3, "#e3b23c"); } },
  { n: "duck", b: "#ffd23a", l: "#ff9a3c", s: "#ffd23a", p(pt) { pt("s", .24, 1.58, 0, 1.4, .5, 1.5, "#ff9a3c"); pt("s", -.04, 1.86, 0, .5, .9, .4, "#ffd23a"); for (const z of [-1, 1]) pt("s", -.05, 1.15, z * .3, .5, 1.6, 1.2, "#f2c230"); } },
  { n: "luchador", b: "#d8322b", l: "#1f4fa8", s: "#1f4fa8", p(pt) { for (const z of [-1, 1]) pt("s", .17, 1.68, z * .075, .55, .75, .6, "#ffffff"); pt("c", -.02, 1.86, 0, .8, .8, .8, "#ffd23a"); pt("b", .2, 1.5, 0, .02, .04, .2, "#ffd23a"); pt("b", 0, .82, 0, .5, .12, .5, "#ffd23a"); } },
  { n: "hazmat", b: "#ffd23a", l: "#ffd23a", p(pt) { pt("s", -.07, 1.65, 0, 2.6, 2.7, 2.7, "#ffd23a"); pt("s", .14, 1.66, 0, .8, 1.4, 2.4, "#6aa6c8"); pt("b", -.26, 1.12, 0, .14, .4, .3, "#3a3d45"); pt("s", .25, 1.48, 0, .5, .5, .5, "#2b2f35"); } },
  { n: "soldier", b: "#5b6b3a", l: "#4a5530", p(pt) { pt("s", -.01, 1.8, 0, 2.8, 1.3, 2.8, "#4a5530"); pt("b", -.25, 1.1, 0, .14, .36, .3, "#6b5a3a"); pt("b", .22, .95, 0, .05, .06, .44, "#3a3d2a"); } },
  { n: "ghost", b: "#f4f4f0", l: "#f4f4f0", s: "#f4f4f0", p(pt) { pt("s", .02, .55, 0, 3.2, 1.6, 3.2, "#f4f4f0"); pt("s", .22, 1.5, 0, .7, .8, .9, "#111214"); } },
  { n: "king", b: "#8a1c2b", l: "#e3b23c", p(pt) { for (let i = 0; i < 5; i++) { const an = i / 5 * 6.283; pt("c", -.02 + Math.cos(an) * .13, 1.92, Math.sin(an) * .13, .6, .9, .6, "#ffd23a"); } pt("b", -.02, 1.86, 0, .3, .06, .3, "#ffd23a"); pt("b", -.24, 1.0, 0, .05, .95, .55, "#d8322b"); pt("b", -.2, 1.46, 0, .2, .07, .6, "#f4f4f0"); } },
  { n: "swimmer", b: "#ff6fb1", l: "#f1c9a5", p(pt) { pt("s", 0, .95, 0, 4.4, 1.1, 4.4, "#ffd23a"); pt("s", .02, .97, 0, 3.4, 1.2, 3.4, "#ff3b2f"); for (const z of [-1, 1]) pt("s", .2, 1.68, z * .075, .5, .55, .6, "#22d3ee"); pt("b", .12, 1.85, .14, .03, .3, .03, "#ff9a3c"); } },
  { n: "fan", b: "#d8322b", l: "#f4f4f0", p(pt, a) { const c = a.ph < 3.14 ? "#d8322b" : "#1f4fa8"; pt("b", .12, 2.1, .3, .07, .4, .14, c); pt("b", .12, 2.33, .3, .07, .12, .05, c); pt("b", .21, 1.66, 0, .02, .08, .2, a.ph < 3.14 ? "#ffffff" : "#ffd23a"); pt("b", 0, 1.43, 0, .32, .1, .5, a.ph < 3.14 ? "#ffffff" : "#ffd23a"); } },
  { n: "viking", b: "#7a4a2a", l: "#5a3b22", p(pt) { pt("s", -.02, 1.8, 0, 2.6, 1.4, 2.6, "#9aa0a8"); for (const z of [-1, 1]) pt("c", -.02, 1.96, z * .26, 1, 1.7, 1, "#f4ecd8", -z * .9); pt("s", .2, 1.48, 0, 1.4, 1.5, 1.6, "#e3a040"); } },
  { n: "superhero", b: "#2f6fc4", l: "#d8322b", p(pt) { pt("b", -.24, 1.0, 0, .05, 1.0, .6, "#d8322b"); pt("b", .2, 1.68, 0, .03, .08, .3, "#111214"); pt("s", .25, 1.12, 0, .8, .9, .3, "#ffd23a"); } },
  { n: "wizard", b: "#5f3d8a", l: "#3a2a5a", p(pt) { pt("c", -.02, 2.08, 0, 2.2, 3.4, 2.2, "#5f3d8a"); pt("b", -.02, 1.84, 0, .5, .03, .5, "#5f3d8a"); pt("s", .2, 1.42, 0, 1.3, 2.4, 1.6, "#e8e8e8"); for (let i = 0; i < 3; i++) pt("s", .05, 2.0 + i * .14, .13 - i * .04, .35, .35, .35, "#ffd23a"); } },
];
const OUTFIT_ID = Object.fromEntries(OUTFITS.map((o, i) => o && [o.n, i]).filter(Boolean));
const PLOD = { r2: 900, n: 0, max: 1100 };   // people drawn with full detail per frame
let COST_C = null; const HC = { 0: 0, 1: 0, 2: 0, set(r, g, b) { this[0] = r; this[1] = g; this[2] = b; return this; } };   // rim light strength on people (stronger at night so the crowd reads in the dark)
const WATER = { time: { value: 0 }, sky: { value: new THREE.Color(0x9fdcff) } };
function waterify(m, scale) {
  m.onBeforeCompile = sh => {
    sh.uniforms.uTime = WATER.time; sh.uniforms.uSky = WATER.sky;
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vWP;").replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vWP; uniform float uTime; uniform vec3 uSky;")
      .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
      { vec2 p = vWP.xz * ${scale.toFixed(2)}; float a = uTime;
        vec3 wn = vec3(sin(p.x * .9 + a * 1.3) * .5 + sin(p.x * 2.3 + p.y * 1.7 - a * 2.1) * .3 + sin(p.y * 5.1 + a * 2.9) * .18,
                       6.0,
                       cos(p.y * .8 - a * 1.1) * .5 + sin(p.x * 1.9 - p.y * 2.6 + a * 1.7) * .3 + cos(p.x * 4.7 - a * 3.3) * .18);
        normal = normalize((viewMatrix * vec4(normalize(wn), 0.0)).xyz); }`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
      totalEmissiveRadiance += uSky * pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 5.0) * .3;
      { vec2 q = vWP.xz * ${(scale * .6).toFixed(2)}; float a = uTime;   // dancing light ripples, readable from above
        float w = sin(q.x * 3.1 + sin(q.y * 2.3 + a * 1.4) * 1.6) + sin(q.y * 2.7 + sin(q.x * 1.9 - a * 1.1) * 1.6);
        totalEmissiveRadiance += vec3(.55, .85, 1.0) * smoothstep(1.25, 1.85, w) * .28; }`);
  };
  m.customProgramCacheKey = () => "water" + scale; return m;
}
// far-away scenery for the street camera: rolling hills and toy trees by day, a city skyline at night
function buildHorizon() {
  if (G3.horizon) { G3.scene.remove(G3.horizon); G3.horizon.traverse(o => { if (o.geometry && !o.userData.shared) o.geometry.dispose(); }); }
  const grp = G3.horizon = new THREE.Group(), r = rng(sceneKey.length * 97 + 13), cx = WW / 2, cz = SH / 2, night = !!scene.night && sceneKey !== "ovni";   // the UFO lands in the countryside
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S3 = new THREE.Vector3(), C = new THREE.Color();
  const wet = sceneKey === "crucero" ? () => true : sceneKey === "beach" ? x => x < 2 : () => false;   // no trees or towers standing in the sea
  if (sceneKey === "crucero") { grp.visible = false; G3.scene.add(grp); return; }
  if (night) {
    const n = 90, im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ map: G3.winTex, color: 0x8a90a8, fog: true }), n);
    for (let i = 0; i < n; i++) { const a = i / n * 6.283 + r() * .05, d = 120 + r() * 40, w = 6 + r() * 10, h = 8 + r() * 34;
      if (wet(cx + Math.cos(a) * d)) { M.makeScale(0, 0, 0); im.setMatrixAt(i, M); continue; }
      M.compose(V.set(cx + Math.cos(a) * d, h / 2 - .5, cz + Math.sin(a) * d), Q.setFromAxisAngle(V.clone().set(0, 1, 0), -a), S3.set(w, h, w)); im.setMatrixAt(i, M); im.setColorAt(i, C.setHSL(.62, .2, .2 + r() * .25)); }
    grp.add(im);
  } else {
    const base = new THREE.Color(scene.outside || "#7aa35a"), hill = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 8, 0, 6.283, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ roughness: 1 }), 26);
    for (let i = 0; i < 26; i++) { const a = i / 26 * 6.283 + r() * .2, d = 150 + r() * 50, w = 30 + r() * 40, h = 8 + r() * 16;
      if (wet(cx + Math.cos(a) * d)) { M.makeScale(0, 0, 0); hill.setMatrixAt(i, M); continue; }
      M.compose(V.set(cx + Math.cos(a) * d, -1, cz + Math.sin(a) * d), Q.identity(), S3.set(w, h, w * .8)); hill.setMatrixAt(i, M); hill.setColorAt(i, C.setRGB(.36 + r() * .1, .55 + r() * .12, .3 + r() * .08).lerp(base, .25)); }
    grp.add(hill);
    const nt = 120, trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(.25, .3, 1, 6), mat("#6b4a2b"), nt), top = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshStandardMaterial({ roughness: .9 }), nt);
    for (let i = 0; i < nt; i++) { const a = r() * 6.283, d = 70 + r() * 70, s2 = 1.6 + r() * 1.8, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
      if (wet(x)) { M.makeScale(0, 0, 0); trunk.setMatrixAt(i, M); top.setMatrixAt(i, M); continue; }
      M.compose(V.set(x, s2 * .8, z), Q.identity(), S3.set(s2, s2 * 1.6, s2)); trunk.setMatrixAt(i, M);
      M.compose(V.set(x, s2 * 2.1, z), Q.identity(), S3.set(s2 * 1.3, s2 * 1.4, s2 * 1.3)); top.setMatrixAt(i, M); top.setColorAt(i, C.setHSL(.27 + r() * .08, .5, .3 + r() * .12)); }
    grp.add(trunk, top);
    if (!["beach", "crucero", "ovni", "guerra", "hipodromo", "cheese"].includes(sceneKey)) {   // a colorful town around town venues
      const nh = 70, house = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: .8 }), nh), roof = new THREE.InstancedMesh(new THREE.ConeGeometry(.75, 1, 4), new THREE.MeshStandardMaterial({ roughness: .8 }), nh);
      const HC = ["#f2c57c", "#a9cfe0", "#f0a6a0", "#cfe3b0", "#e8d6f0", "#ffe08a", "#f4f4f2"];
      for (let i = 0; i < nh; i++) {
        const a = r() * 6.283, d = 62 + r() * 40, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d, w = 4 + r() * 5, h = 4 + r() * (r() < .2 ? 16 : 7), Q2 = Q.clone().setFromAxisAngle(new THREE.Vector3(0, 1, 0), r() * 3);
        M.compose(V.set(x, h / 2, z), Q2, S3.set(w, h, w * (.7 + r() * .5))); house.setMatrixAt(i, M); house.setColorAt(i, C.set(HC[(r() * HC.length) | 0]));
        M.compose(V.set(x, h + w * .3, z), Q2.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4)), S3.set(w * 1.05, w * .6, w * 1.05)); roof.setMatrixAt(i, M); roof.setColorAt(i, C.set(["#c0583b", "#8a2f3b", "#4f5a6a"][i % 3]));
      }
      grp.add(house, roof);
    }
    themedHorizon(grp, HORIZON_THEME[sceneKey], r, cx, cz, wet);
    if (scene.night) for (const o of [hill, trunk, top]) o.material = o.material.clone(), o.material.color.setScalar(.25);   // moonlit countryside
  }
  grp.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; o.frustumCulled = false; } });
  grp.visible = false; G3.scene.add(grp);
}
// what stands behind the venue: downtown towers, a factory district, an airfield
const HORIZON_THEME = { marcha: "city", metro: "city", terminal: "city", mitin: "city", viernes: "city", mercado: "city", trono: "city", fabrica: "industry", rocket: "airfield", aeropuerto: "airfield", nuclear: "industry" };
function themedHorizon(grp, theme, r, cx, cz, wet) {
  if (!theme) return;
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S3 = new THREE.Vector3(), C = new THREE.Color(), UP = new THREE.Vector3(0, 1, 0);
  const ring = (d0, d1) => { for (let k = 0; k < 20; k++) { const a = r() * 6.283, d = d0 + r() * (d1 - d0), x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; if (!wet(x)) return [x, z, a]; } return [cx, cz + d0, 0]; };
  if (theme === "city") {   // glass and concrete towers with lit windows, a couple of cranes
    const n = 46, tower = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ map: G3.winTex || (G3.winTex = windowTex()), roughness: .5, metalness: .1 }), n);
    const TC = ["#c9d3de", "#9fb3c8", "#d8d2c4", "#b8c4cf", "#e4e0d6", "#8fa3b8"];
    for (let i = 0; i < n; i++) { const [x, z, a] = ring(72, 120), w = 8 + r() * 10, h = 18 + r() * r() * 60;
      M.compose(V.set(x, h / 2, z), Q.setFromAxisAngle(UP, -a), S3.set(w, h, w * (.7 + r() * .5))); tower.setMatrixAt(i, M); tower.setColorAt(i, C.set(TC[(r() * TC.length) | 0])); }
    grp.add(tower);
    const cr = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat("#e8b631"), 6);
    for (let i = 0; i < 3; i++) { const [x, z, a] = ring(68, 92), h = 34 + r() * 14;
      M.compose(V.set(x, h / 2, z), Q.identity(), S3.set(1.2, h, 1.2)); cr.setMatrixAt(i * 2, M);
      M.compose(V.set(x, h, z), Q.setFromAxisAngle(UP, r() * 6), S3.set(22, 1, 1)); M.multiply(new THREE.Matrix4().makeTranslation(.3, 0, 0)); cr.setMatrixAt(i * 2 + 1, M); }
    grp.add(cr);
  } else if (theme === "industry") {   // chimneys with red bands, silos, saw-tooth warehouses
    const nc = 9, ch = new THREE.InstancedMesh(new THREE.CylinderGeometry(.8, 1, 1, 12), mat("#a29a92"), nc), band = new THREE.InstancedMesh(new THREE.CylinderGeometry(.82, .82, 1, 12), mat("#d8322b"), nc * 2);
    for (let i = 0; i < nc; i++) { const [x, z] = ring(70, 105), s2 = 1.4 + r() * 1.2, h = 26 + r() * 22;
      M.compose(V.set(x, h / 2, z), Q.identity(), S3.set(s2, h, s2)); ch.setMatrixAt(i, M);
      for (const [k, f] of [[0, .92], [1, .78]]) { M.compose(V.set(x, h * f, z), Q.identity(), S3.set(s2 * (.82 + .14 * f), 2, s2 * (.82 + .14 * f))); band.setMatrixAt(i * 2 + k, M); } }
    const ns = 14, silo = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, 16), new THREE.MeshStandardMaterial({ roughness: .4, metalness: .5 }), ns), dome = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 8, 0, 6.283, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ roughness: .4, metalness: .5 }), ns);
    for (let i = 0; i < ns; i++) { const [x, z] = ring(62, 92), rr = 3 + r() * 2.5, h = 9 + r() * 10;
      M.compose(V.set(x, h / 2, z), Q.identity(), S3.set(rr, h, rr)); silo.setMatrixAt(i, M); silo.setColorAt(i, C.set(["#d9dde2", "#c3c9cf", "#e8e4da"][i % 3]));
      M.compose(V.set(x, h, z), Q.identity(), S3.set(rr, rr * .5, rr)); dome.setMatrixAt(i, M); dome.setColorAt(i, C.set("#bfc5cc")); }
    const nw = 16, wh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: .8 }), nw), tooth = new THREE.InstancedMesh(new THREE.CylinderGeometry(.6, .6, 1, 3), new THREE.MeshStandardMaterial({ roughness: .7 }), nw * 4);
    for (let i = 0; i < nw; i++) { const [x, z, a] = ring(56, 84), w = 14 + r() * 12, d = 9 + r() * 6, h = 6 + r() * 4, q = Q.clone().setFromAxisAngle(UP, -a + Math.PI / 2);
      M.compose(V.set(x, h / 2, z), q, S3.set(w, h, d)); wh.setMatrixAt(i, M); wh.setColorAt(i, C.set(["#8a6f5a", "#6f7a84", "#a8916f", "#7d8a6a"][i % 4]));
      for (let k = 0; k < 4; k++) { const off = new THREE.Vector3((k - 1.5) * w / 4, 0, 0).applyQuaternion(q); const q2 = q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2));
        M.compose(V.set(x + off.x, h + 1, z + off.z), q2, S3.set(2, d, 2.2)); tooth.setMatrixAt(i * 4 + k, M); tooth.setColorAt(i * 4 + k, C.set("#9fb7c9")); } }
    grp.add(ch, band, silo, dome, wh, tooth);
  } else if (theme === "airfield") {   // hangars with curved roofs, a control tower, a windsock
    const nh = 7, hg = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, 18, 1, false, 0, Math.PI), new THREE.MeshStandardMaterial({ roughness: .5, metalness: .4 }), nh);
    for (let i = 0; i < nh; i++) { const [x, z, a] = ring(60, 88), s2 = 9 + r() * 5;
      M.compose(V.set(x, 0, z), Q.setFromAxisAngle(UP, -a).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2)).multiply(new THREE.Quaternion().setFromAxisAngle(UP, -Math.PI / 2)), S3.set(s2, s2 * 2.4, s2 * .9)); hg.setMatrixAt(i, M); hg.setColorAt(i, C.set(["#c9ced4", "#e6e2d8", "#aeb7c0"][i % 3])); }
    grp.add(hg);
    const [tx, tz] = ring(70, 80);
    const t1 = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.2, 28, 14), mat("#e6e2d8")); t1.position.set(tx, 14, tz);
    const t2 = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 3.2, 3.6, 10), new THREE.MeshStandardMaterial({ color: lin("#2a4a66"), roughness: .15, metalness: .6 })); t2.position.set(tx, 29.6, tz);
    const t3 = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, .6, 10), mat("#f4f4f0")); t3.position.set(tx, 31.6, tz);
    const t4 = new THREE.Mesh(new THREE.ConeGeometry(.5, 2.4, 6), mat("#d8322b")); t4.position.set(tx, 33.2, tz);
    grp.add(t1, t2, t3, t4);
  }
}
// sky dome for the street camera: gradient, sun glow, drifting clouds by day, stars and a moon by night
function skyDome() {
  if (G3.sky) return G3.sky;
  const m = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false,
    uniforms: { hor: { value: new THREE.Color() }, top: { value: new THREE.Color() }, night: { value: 0 }, dim: { value: 1 }, time: { value: 0 }, sunD: { value: new THREE.Vector3(-.45, .38, -.55).normalize() } },
    vertexShader: `varying vec3 vD; void main() { vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position.z = gl_Position.w * .9999; }`,
    fragmentShader: `uniform vec3 hor, top, sunD; uniform float night, dim, time; varying vec3 vD;
      float h2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n2(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(h2(i), h2(i + vec2(1, 0)), f.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), f.x), f.y); }
      void main() {
        vec3 d = normalize(vD); float y = d.y;
        vec3 c = mix(hor, top, pow(clamp(y, 0., 1.), .55));
        c = mix(c, hor * .92, smoothstep(.0, -.08, y));
        float sd = max(dot(d, sunD), 0.);
        if (night < .5) {
          c += vec3(1., .9, .7) * (pow(sd, 6.) * .22 + pow(sd, 60.) * .5) + vec3(1., .97, .9) * smoothstep(.9993, .9996, sd) * 3.;
          vec2 uv = d.xz / (y + .18) * 2.2 + vec2(time * .012, time * .004);
          float cl = n2(uv) * .55 + n2(uv * 2.1) * .3 + n2(uv * 4.3) * .15; cl = smoothstep(.55, .78, cl) * smoothstep(0., .25, y);
          c = mix(c, vec3(1.) * (.92 + .08 * y) + vec3(.06, .03, 0.) * pow(sd, 4.), cl * .85);
        } else {
          vec2 g = floor(d.xz / (y + .35) * 160.); float st = step(.9965, h2(g)) * smoothstep(.02, .3, y) * (.6 + .4 * sin(time * 3. + h2(g + 7.) * 40.));
          c += vec3(.9, .95, 1.) * st * 1.4;
          vec3 md = normalize(vec3(.5, .42, -.6)); float mm = max(dot(d, md), 0.);
          c += vec3(.95, .95, .85) * smoothstep(.9992, .9995, mm) * 1.6 + vec3(.2, .25, .45) * pow(mm, 30.) * .5;
        }
        gl_FragColor = vec4(c * dim, 1.);
      }` });
  G3.sky = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 16), m); G3.sky.frustumCulled = false; G3.sky.renderOrder = -10; G3.scene.add(G3.sky);
  return G3.sky;
}
const SKY_TOP_D = new THREE.Color(0x3f8fe0), SKY_TOP_N = new THREE.Color(0x02040c), GOLD_SUN = new THREE.Color(0xff8a3c), GOLD_SKY = new THREE.Color(0xffc49a), GOLD_HOR = new THREE.Color(0xff9a5a), GOLD_TOP = new THREE.Color(0x5a74c8), SKY_RAIN = new THREE.Color(0xaab3bd), SKY_RAIN_TOP = new THREE.Color(0x6c7684);
const CAM_T = new THREE.Vector3(), CAM_T2 = new THREE.Vector3(), CAM_V = new THREE.Vector3(), CAM_RC = { ray: new THREE.Raycaster() };
function cineCamera(dt) {
  cineAng += dt * .11;
  const night = !!scene.night, c = G3.camera, d = Math.max(cineDist, CINE_MIN()), h = cineH || 1.9 + d * .16;
  const cx = cam.x + Math.sin(cineAng * .7) * 2, cy = cam.y;
  c.fov = 52; c.near = .3; c.far = 600; c.updateProjectionMatrix();
  c.up.set(0, 1, 0);
  c.position.set(clamp(cx + Math.cos(cineAng) * d, 1.5, WW - 1.5), h + shake * .2, clamp(cy + Math.sin(cineAng) * d, 2, SH - 2));
  // don't film through walls: if scenery stands between the subject and the lens, slide the lens in front of it
  const tgt = CAM_T.set(cx, cineH ? .3 : 1.5, cy);
  if (G3.static && ((CAM_RC.n = (CAM_RC.n || 0) + 1) % 6 === 0 || CAM_RC.k === undefined)) {
    const dir = CAM_V.copy(c.position).sub(tgt), len = dir.length(); dir.normalize();
    CAM_RC.ray.set(tgt, dir); CAM_RC.ray.far = len; const hit = CAM_RC.ray.intersectObject(G3.static, true).find(o => o.distance > 1.2 && o.object.visible);
    CAM_RC.k = hit ? Math.max(.25, (hit.distance - .6) / len) : 1;
    // the subject may stand inside a big object (stands, a wall): look from the lens side too, and rise over it
    const p0 = CAM_V.copy(c.position).lerp(tgt, 1 - CAM_RC.k), back = CAM_T2.copy(tgt).sub(p0); const bl = back.length(); back.normalize();
    CAM_RC.ray.set(p0, back); CAM_RC.ray.far = bl; const hit2 = CAM_RC.ray.intersectObject(G3.static, true).find(o => o.distance < bl - 1.5 && o.object.visible);
    CAM_RC.u = (hit2 && CAM_RC.k > .5) || CAM_RC.k * len < 3.2 ? 3.4 : 0;   // a small lift when sliding in was not enough or left the lens against a wall
  }
  CAM_RC.uy = (CAM_RC.uy || 0) + ((CAM_RC.u || 0) - (CAM_RC.uy || 0)) * Math.min(1, (dt || .016) * 3);
  CAM_RC.s = (CAM_RC.s ?? 1) + ((CAM_RC.k ?? 1) - (CAM_RC.s ?? 1)) * Math.min(1, (dt || .016) * 4);
  if (CAM_RC.s < .999) c.position.lerpVectors(tgt, c.position, CAM_RC.s).setY(Math.max(c.position.y, 1.2));
  c.position.y += CAM_RC.uy;
  c.lookAt(tgt);
  SKY_TMP.copy(night ? SKY_NIGHT : SKY_DAY).lerp(GOLD_HOR, night ? 0 : (G3.golden || 0) * .85).lerp(SKY_RAIN, night ? 0 : (G3.wet || 0) * .8).multiplyScalar(1 - .85 * black);
  G3.scene.background.copy(SKY_TMP);
  if (!G3.scene.fog) G3.scene.fog = new THREE.Fog(0xffffff, 30, 190);
  G3.scene.fog.color.copy(SKY_TMP); G3.skirt.visible = true;
  if (!G3.horizon || G3.horizon.userData.key !== sceneKey) { buildHorizon(); G3.horizon.userData.key = sceneKey; }
  G3.horizon.visible = true;
  const sky = skyDome(), su = sky.material.uniforms; sky.visible = true; sky.position.copy(c.position);
  su.hor.value.copy(SKY_TMP).multiplyScalar(1 / Math.max(.15, 1 - .85 * black)); su.top.value.copy(night ? SKY_TOP_N : SKY_TOP_D).lerp(GOLD_TOP, night ? 0 : (G3.golden || 0) * .6).lerp(SKY_RAIN_TOP, night ? 0 : (G3.wet || 0) * .85); su.night.value = night ? 1 : 0; su.dim.value = 1 - .85 * black; su.time.value = performance.now() / 1000;
  const sun = G3.sun; sun.target.position.set(cx, 0, cy); sun.position.set(cx - 22, 60, cy - 28);
  const sc = sun.shadow.camera, ext = 34; sc.left = -ext; sc.right = ext; sc.top = ext * 1.4; sc.bottom = -ext * 1.4; sc.updateProjectionMatrix();
  return [-1e9, 1e9, -1e9, 1e9];
}
function updateCamera(dt) {
  if (camMode === 4 && !demo) { cine = 1; return cineCamera(dt || 0); }
  if (cine) {   // back to the usual view from above
    cine = 0; const c = G3.camera; c.fov = 30; c.near = 1; c.far = 500; c.updateProjectionMatrix();
    G3.scene.fog = null; G3.scene.background.set(scene.night ? 0x070a12 : 0x141516);
  }
  G3.skirt.visible = false; if (G3.sky) G3.sky.visible = false; if (G3.horizon) G3.horizon.visible = false;
  const base = ((LAND ? WW : WH) / 2) / Math.tan(15 * Math.PI / 180), z = Math.min(cam.z, ZMAX()), h = base / z;
  const tilt = clamp((z - 1) * .5, 0, .42);
  const FL = VIEW_FLIP, dx = LAND ? -FL : 0, dz = LAND ? 0 : FL;   // the screen's "down" direction in the world (FL -1: the venue is seen from the other side)
  const sx = (Math.random() - .5) * shake, sy = (Math.random() - .5) * shake;
  const lift = h * Math.sin(tilt) * .12, tx = cam.x + sx + dx * lift, tz = cam.y + sy + dz * lift;
  const roll = windF.t > 0 ? windF.x * .1 * Math.min(1, windF.t) * Math.sin(Math.min(1, (3.6 - windF.t) * 2) * Math.PI / 2) : 0;
  G3.camera.up.set(LAND ? FL : roll, 0, LAND ? roll : -FL);
  G3.camera.position.set(tx + dx * h * Math.sin(tilt), h * Math.cos(tilt), tz + dz * h * Math.sin(tilt));
  G3.camera.lookAt(tx, 0, tz);
  const sun = G3.sun, ext = WW / z * .9 + 8;
  sun.target.position.set(tx, 0, tz); sun.position.set(tx - 22, 60, tz - 28);
  const c = sun.shadow.camera; c.left = -ext; c.right = ext; c.top = ext * 1.4; c.bottom = -ext * 1.4; c.updateProjectionMatrix();
  return [tx - WW / (2 * z) - 4, tx + WW / (2 * z) + 4, tz - WH / (2 * z) - 6, tz + WH / (2 * z) + 8];
}
function updateFxLayer(live) {
  const g = G3.fx, k = FXS;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, G3.fxCv.width, G3.fxCv.height);
  if (live) {
    const t = G3.tctx;
    t.globalCompositeOperation = "destination-out"; t.fillStyle = "rgba(0,0,0,.06)"; t.fillRect(0, 0, G3.trail.width, G3.trail.height);
    t.globalCompositeOperation = "source-over";
    const s = Math.max(1, .18 * k);
    for (const a of ag) {
      if (a.vx * a.vx + a.vy * a.vy < .3) continue;
      const f = fStage[cellOf(a.x, a.y)];
      t.fillStyle = TRAIL[isFinite(f) ? clamp(Math.floor(f / 50 * 11), 0, 11) : 11];
      t.fillRect(a.x * k - s / 2, a.y * k - s / 2, s, s);
    }
    g.globalAlpha = .9; g.drawImage(G3.trail, 0, 0); g.globalAlpha = 1;
  } else if (phase === "plan") G3.tctx.clearRect(0, 0, G3.trail.width, G3.trail.height);
  g.scale(k, k);
  // red shadow under those who fell
  // blackout: every phone flashlight throws a small pool of light ahead of its owner
  if (black > .25 && (phase === "show" || phase === "evac")) {
    g.save(); g.globalCompositeOperation = "lighter"; g.fillStyle = `rgba(255,250,225,${(.11 * black).toFixed(3)})`;
    let n = 0; for (const a of ag) { if (!a.phone) continue; if (++n > 700) break; const fx = a.x + Math.cos(a.h) * 1.1, fy = a.y + Math.sin(a.h) * 1.1; g.beginPath(); g.ellipse(fx, fy, 1.1, .7, a.h, 0, 7); g.fill(); }
    g.restore();
  }
  // night: glow sticks spill a little colored light on the floor around their owners
  if (scene.night && black < .25 && (phase === "show" || phase === "evac")) {
    g.save(); g.globalCompositeOperation = "lighter"; let n = 0;
    for (const a of ag) { if (a.m !== 4) continue; if (++n > 500) break; g.fillStyle = GLOW[a.ac % GLOW.length]; g.globalAlpha = .09; g.beginPath(); g.arc(a.x, a.y, .6, 0, 7); g.fill(); }
    g.restore();
  }
  // rain: little splash rings popping on the floor
  if (MOD && MOD.rain && (phase === "show" || phase === "evac")) {
    const now = performance.now() / 1000;
    for (let i = 0; i < 70; i++) {
      const sd = i * 12.9898, life = .55, ph = (now / life + (Math.sin(sd) * 43758.5 % 1)) % 1, cyc = Math.floor(now / life + (Math.sin(sd) * 43758.5 % 1));
      const rx = Math.abs(Math.sin(sd * 1.7 + cyc * 3.1) * 9973 % WW), ry = Math.abs(Math.cos(sd * 2.3 + cyc * 1.7) * 7919 % SH);
      g.strokeStyle = `rgba(235,245,255,${(.75 * (1 - ph)).toFixed(3)})`; g.lineWidth = .09; g.beginPath(); g.arc(rx, ry, .08 + ph * .35, 0, 7); g.stroke();
    }
  }
  // confetti litter on the floor
  for (const [x, y, ci, r, kind] of litter) {
    if (kind === 1) { g.globalAlpha = 1; g.fillStyle = ["#1c1c20", "#f2f2f2", "#d8322b", "#2f6fc4", "#6b4a2b", "#1c1c20", "#e8b631"][ci]; g.save(); g.translate(x, y); g.rotate(r); g.beginPath(); g.ellipse(0, 0, .2, .12, 0, 0, 7); g.fill(); g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(-.05, 0, .09, .06, 0, 0, 7); g.fill(); g.restore(); continue; }
    g.fillStyle = CONF[ci % CONF.length]; g.globalAlpha = .9; g.save(); g.translate(x, y); g.rotate(r); g.fillRect(-.17, -.1, .34, .2); g.restore(); }
  g.globalAlpha = 1;
  // today's route: the side exit (green, with arrows pointing out) and the B-stage pad
  if (ROUTE.side) {
    const xw = ROUTE.side < 0 ? 0 : WW, sd = ROUTE.side, yc = (ROUTE.ey0 + ROUTE.ey1) / 2, pul = phase === "evac" ? .5 + .5 * Math.sin(performance.now() / 150) : 1;
    g.fillStyle = `rgba(47,174,90,${(.35 * pul).toFixed(3)})`; g.fillRect(sd < 0 ? 0 : WW - 4, ROUTE.ey0, 4, ROUTE.ey1 - ROUTE.ey0);
    g.fillStyle = `rgba(47,174,90,${(.85 * pul).toFixed(3)})`;
    for (const dy of [-1.8, 0, 1.8]) { const ax = xw - sd * 2.6, ay = yc + dy; g.beginPath(); g.moveTo(ax + sd * 1.5, ay); g.lineTo(ax, ay - .7); g.lineTo(ax, ay + .7); g.fill(); }
    g.save(); g.translate(xw - sd * 4.6, yc); g.rotate(sd < 0 ? Math.PI / 2 : -Math.PI / 2); g.font = "900 .9px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("WAY OUT", 0, 0); g.restore();
  }
  if (ROUTE.b) {
    const on = ROUTE.done && phase === "show", r = 2.8;
    g.fillStyle = on ? "rgba(255,111,177,.45)" : "rgba(255,111,177,.2)"; g.beginPath(); g.arc(ROUTE.bx, ROUTE.by, r, 0, 7); g.fill();
    g.strokeStyle = "rgba(255,111,177,.9)"; g.lineWidth = .18; g.setLineDash(on ? [] : [.5, .35]); g.beginPath(); g.arc(ROUTE.bx, ROUTE.by, r, 0, 7); g.stroke(); g.setLineDash([]);
    g.fillStyle = "#ffffff"; g.font = "900 1px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("B-STAGE", ROUTE.bx, ROUTE.by);
  }
  if (scene.fx) scene.fx(g);   // venue floor effects, in venue meters
  // footprints and tire marks of heavy visitors
  for (const [x, y, tr, an] of prints) {
    g.fillStyle = "rgba(60,45,30,.22)";
    if (tr) { g.save(); g.translate(x, y); g.rotate(an); g.fillRect(-.5, -.18, 1, .36); g.restore(); }
    else { g.beginPath(); g.arc(x, y, .32, 0, 7); g.fill(); }
  }
  // meteor craters: scorched ring, dark pit, glowing cracks
  if (phase !== "plan") for (const [cx, cy, cr] of CRATERS) {
    g.fillStyle = "rgba(40,30,25,.55)"; g.beginPath(); g.arc(cx, cy, cr * 1.25, 0, 7); g.fill();
    g.fillStyle = "rgba(20,16,14,.8)"; g.beginPath(); g.arc(cx, cy, cr * .8, 0, 7); g.fill();
    g.strokeStyle = "rgba(255,140,40,.8)"; g.lineWidth = .1; for (let k2 = 0; k2 < 7; k2++) { const an = k2 * .9 + cx; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(an) * cr * 1.2, cy + Math.sin(an) * cr * 1.2); g.stroke(); }
  }
  // under each trampled person: a comic "impact" starburst that pops out as they land
  for (const a of fallen) {
    const age = t - (a.fallAt ?? -9), q = Math.min(1, age / .35), r = (.55 + .45 * (1 - Math.pow(1 - q, 3))) * (age < .35 ? 1.25 - .25 * q : 1), rot = (a.fallLimb || 0);
    g.fillStyle = "rgba(255,206,60,.42)"; g.beginPath();
    for (let k2 = 0; k2 < 18; k2++) { const an = rot + k2 * Math.PI / 9, rr = (k2 % 2 ? .55 : 1) * r * 1.15; g.lineTo(a.x + Math.cos(an) * rr, a.y + Math.sin(an) * rr); }
    g.fill(); g.fillStyle = "rgba(200,30,30,.3)"; g.beginPath(); g.arc(a.x, a.y, r * .55, 0, 7); g.fill();
  }
  drawAnalysis(g);
  if (phase === "plan" && lastFalls.length && lastFallsScene === sceneKey) {
    // where people fell last time: soft red stains with an X on the worst spots
    g.fillStyle = "rgba(229,50,41,.16)";
    for (const [x, y] of lastFalls) { g.beginPath(); g.arc(x, y, .9, 0, 7); g.fill(); }
    g.strokeStyle = "rgba(160,20,20,.75)"; g.lineWidth = .12;
    for (let i = 0; i < lastFalls.length; i += 6) { const [x, y] = lastFalls[i]; g.beginPath(); g.moveTo(x - .3, y - .3); g.lineTo(x + .3, y + .3); g.moveTo(x + .3, y - .3); g.lineTo(x - .3, y + .3); g.stroke(); }
  }
  if (phase !== "plan") gateBadges.length = 0;
  if (phase === "plan" && G3.dangerOn !== false) {
    // bottleneck preview: red where the trails pile up (scaled by how big the crowd is)
    const k = scene.crowd / 3000, pulse = .75 + .25 * Math.sin(performance.now() / 260);
    for (let j = 0; j < dangerH; j++) for (let i = 0; i < dangerW; i++) {
      const d = danger[j * dangerW + i] * k; if (d < 6) continue;
      const q = Math.min(1, (d - 6) / 14);
      g.fillStyle = `rgba(229,50,41,${(.1 + q * .28) * pulse})`; g.beginPath(); g.arc((i + .5) * DG, (j + .5) * DG, DG * (.6 + q * .5), 0, 7); g.fill();
    }
    // load on each open gate during the evacuation: people per gate, minus the help of stewards nearby
    const open = []; for (let i = 0; i < SLOTS; i++) if (gates[i]) open.push(i);
    gateBadges.length = 0;
    if (ROUTE.side) {   // everyone leaves through the side exit (about as wide as three gates)
      const x = ROUTE.side < 0 ? 1.2 : WW - 1.2, y = (ROUTE.ey0 + ROUTE.ey1) / 2, help = guards.filter(gd => gd.role === "slow" && Math.hypot(gd.x - x, gd.y - y) < 10).length;
      const load = scene.crowd / 4.2 / (1 + help * .18); gateBadges.push([x, load > 900 ? 2 : load > 600 ? 1 : 0, y]);
    } else for (const i of open) {
      const x = slotX(i), help = guards.filter(gd => gd.role === "slow" && Math.hypot(gd.x - x, gd.y - FENCE_Y) < 9).length;
      const load = scene.crowd / open.length / (1 + help * .18), lvl = load > 900 ? 2 : load > 600 ? 1 : 0;
      gateBadges.push([x, lvl]);
    }
  }
  if (phase === "plan") {
    g.lineCap = "round"; g.lineWidth = .22;
    for (const p of preview) {
      const tr = p.trail; if (tr.length < 6) continue;
      const fade = Math.min(1, p.age / .6, (p.life - p.age) / .8);
      for (let i = 3; i < tr.length; i += 3) {
        const q = clamp(tr[i + 2] / 60, 0, 1), al = (i / tr.length) * .6 * fade;
        g.strokeStyle = `rgba(${Math.round(255 - q * 50)},${Math.round(140 + q * 95)},${Math.round(60 + q * 195)},${al.toFixed(3)})`;
        g.beginPath(); g.moveTo(tr[i - 3], tr[i - 2]); g.lineTo(tr[i], tr[i + 1]); g.stroke();
      }
    }
  }
  // range of water stations and first aid tents
  for (const pr of props) {
    const rad = pr.type === "water" ? PROP_TYPES.water.calm : pr.type === "medic" ? PROP_TYPES.medic.heal : 0; if (!rad) continue;
    g.fillStyle = pr.type === "water" ? "rgba(79,195,247,.12)" : "rgba(229,57,53,.08)"; g.strokeStyle = pr.type === "water" ? "rgba(79,195,247,.6)" : "rgba(229,57,53,.5)"; g.lineWidth = .1;
    g.beginPath(); g.arc(pr.x, pr.y, rad, 0, 7); g.fill(); g.stroke();
  }
  // area each guard calms
  for (const gd of guards) {
    const slow = gd.role === "slow";
    g.fillStyle = slow ? "rgba(79,195,247,.14)" : "rgba(215,245,58,.14)"; g.strokeStyle = slow ? "rgba(79,195,247,.75)" : "rgba(215,245,58,.7)"; g.lineWidth = .12;
    if (slow) g.setLineDash([.5, .35]);
    g.beginPath(); g.arc(gd.x, gd.y, slow ? STEWARD_R : GUARD_CALM, 0, 7); g.fill(); g.stroke(); g.setLineDash([]);
  }
  if (drag) for (const [x0, y0, x1, y1] of dragSegs()) drawFence(g, { ax: x0, ay: y0, bx: x1, by: y1, type: drag.type }, true);
  g.lineWidth = .14;
  for (const r of rings) {
    if (r.wave) { if (r.t > .7) continue; const q = r.t / .7; g.lineWidth = (r.wave > 1 ? .7 : .35) * (1 - q); g.strokeStyle = `rgba(255,255,255,${(.9 * (1 - q)).toFixed(3)})`; g.beginPath(); g.arc(r.x, r.y, .5 + q * (r.wave > 1 ? 9 : 4), 0, 7); g.stroke(); g.lineWidth = .14; continue; }
    if (r.mega) { if (r.t < 0) continue; g.lineWidth = .3; g.strokeStyle = `rgba(255,210,58,${(1 - r.t / 1.3).toFixed(3)})`; g.beginPath(); g.arc(r.x, r.y, .5 + r.t * 4.5, 0, 7); g.stroke(); g.lineWidth = .14; continue; }
    g.strokeStyle = `rgba(229,50,41,${(1 - r.t / 1.3).toFixed(3)})`; g.beginPath(); g.arc(r.x, r.y, .3 + r.t * 1.8, 0, 7); g.stroke();
  }
  // megaphone area and goal that moved
  for (const mg of mega.active) { g.fillStyle = "rgba(255,210,58,.12)"; g.beginPath(); g.arc(mg.x, mg.y, MEGA_R(), 0, 7); g.fill(); }
  if (attr && phase !== "plan") { g.strokeStyle = "rgba(255,80,160,.8)"; g.lineWidth = .25; g.setLineDash([.6, .4]); g.beginPath(); g.arc(attr.x, attr.y, attr.r + .4 + Math.sin(performance.now() / 150) * .2, 0, 7); g.stroke(); g.setLineDash([]); }
  G3.fxTex.needsUpdate = true;
}
const Vproj = new THREE.Vector3();
function drawOverlay() {
  const g = octx; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, ov.width, ov.height);
  const ppm = ov.height / ((LAND ? WW : WH) / cam.z);
  g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
  const placed = [[ov.width / 2, ov.height * .1, ov.width * .38, ov.height * .2]], fsz = Math.round(Math.max(12, .95 * ppm));   // the counter at the top stays clear
  g.font = `900 ${fsz}px Rubik, system-ui, sans-serif`;
  for (const q of pops.slice().sort((a, b) => a.t - b.t)) {   // newest first: they get the free spots
    Vproj.set(q.x, 2.5 + q.t * 1.4, q.y).project(G3.camera); if (Vproj.z > 1) continue;
    let x = (Vproj.x + 1) / 2 * ov.width, y = (1 - Vproj.y) / 2 * ov.height; const sc = 1 + Math.max(0, .25 - q.t) * 2;
    // keep bubbles from piling on top of each other: nudge up, or drop it if the area is crowded
    const w = g.measureText(q.text).width * sc + 8, hgt = fsz * 1.15 * sc; let ok = false;
    for (let tries = 0; tries < 4 && !ok; tries++) {
      ok = !placed.some(r => Math.abs(r[0] - x) * 2 < r[2] + w && Math.abs(r[1] - y) * 2 < r[3] + hgt);
      if (!ok) y -= hgt;
    }
    if (!ok) continue; placed.push([x, y, w, hgt]);
    g.save(); g.translate(x, y); g.scale(sc, sc); g.globalAlpha = Math.min(1, (1.6 - q.t) / .5);
    g.lineWidth = Math.max(3, .22 * ppm); g.strokeStyle = "#111214"; g.strokeText(q.text, 0, 0); g.fillStyle = "#ffd23a"; g.fillText(q.text, 0, 0);
    g.restore();
  }
  if (cine < .01) for (const [gx, lvl, gy] of gateBadges) {   // plan: how busy each exit will be (top views only)
    Vproj.set(gx, .4, gy ?? FENCE_Y + 1.2).project(G3.camera);
    const x = (Vproj.x + 1) / 2 * ov.width, y = (1 - Vproj.y) / 2 * ov.height, fs = Math.round(Math.max(12, .7 * ppm)), txt = ["EXIT OK", "BUSY EXIT", "CRUSH RISK"][lvl];
    g.globalAlpha = 1; g.font = `900 ${fs}px Rubik, system-ui, sans-serif`; const w = g.measureText(txt).width + fs;
    g.fillStyle = ["#2fae5a", "#f0a91e", "#e53229"][lvl]; g.beginPath(); g.roundRect(x - w / 2, y - fs * .8, w, fs * 1.6, fs * .8); g.fill();
    g.lineWidth = 2; g.strokeStyle = "#111214"; g.stroke(); g.fillStyle = "#fff"; g.fillText(txt, x, y + 1);
  }
  if (scene.hud && !demo) { g.save(); scene.hud(g, ov.width, ov.height); g.restore(); }   // venue meters
  if (flash > .01) { g.globalAlpha = 1; g.fillStyle = `rgba(255,255,255,${(flash * .22).toFixed(3)})`; g.fillRect(0, 0, ov.width, ov.height); }
}
const TODS = [
  { id: "morning", gold: 0, sun: .92, hemi: 1.05, tint: "#fff0dc", sky: "#cfe6ff", k: .6 },
  { id: "noon", gold: 0, sun: 1.05, hemi: 1, tint: null },
  { id: "afternoon", gold: .35, sun: 1, hemi: .98, tint: null },
  { id: "sunset", gold: .75, sun: .95, hemi: .9, tint: "#ff9a5a", sky: "#ffb48a", k: .25 },
  { id: "overcast", gold: 0, sun: .55, hemi: 1.18, tint: "#dfe4ea", sky: "#c9d0d8", k: .7 },
];
let TOD = TODS[1]; const TD_COL = new THREE.Color();
const gateBadges = [];
let CONF_L;
const EUL = new THREE.Euler();
function renderChunks() {
  const m = G3.chunk; if (!m) return; let n = 0;
  for (const c of chunks) {
    if (n >= 900) break;
    Vp.set(c.x, c.h, c.y); Q.setFromEuler(EUL.set(c.r, c.r * .7, c.r * 1.3)); Vs.setScalar(c.s * Math.min(1, c.life * 2));
    M4.compose(Vp, Q, Vs); M4.toArray(m.instanceMatrix.array, n * 16);
    const cc = linArr(c.c); m.instanceColor.array[n * 3] = cc[0]; m.instanceColor.array[n * 3 + 1] = cc[1]; m.instanceColor.array[n * 3 + 2] = cc[2];
    n++;
  }
  m.count = n; m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true;
}
function renderConfetti() {
  const m = G3.conf; let n = 0;
  for (const c of confetti) {
    if (n >= 1400) break;
    Vp.set(c.x, c.h, c.y); Q.setFromEuler(EUL.set(c.rx, c.ry, c.rz)); Vs.setScalar(Math.min(1, c.life * 1.5));
    M4.compose(Vp, Q, Vs); M4.toArray(m.instanceMatrix.array, n * 16);
    const cc = CONF_L[c.c]; m.instanceColor.array[n * 3] = cc[0]; m.instanceColor.array[n * 3 + 1] = cc[1]; m.instanceColor.array[n * 3 + 2] = cc[2];
    n++;
  }
  m.count = n; m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true;
}
const LINC = {};
const linArr = hex => LINC[hex] || (LINC[hex] = (c => [c.r, c.g, c.b])(lin(hex)));
// rain: drops falling around the camera
function renderRain(tt) {
  if (!G3.rain) {
    G3.rain = new THREE.InstancedMesh(new THREE.BoxGeometry(.03, .9, .03), new THREE.MeshBasicMaterial({ color: 0xbcd4ff, transparent: true, opacity: .45, depthWrite: false }), 900);
    G3.rain.frustumCulled = false; G3.rain.instanceMatrix.setUsage(THREE.DynamicDrawUsage); G3.scene.add(G3.rain);
    G3.drops = Array.from({ length: 900 }, () => [Math.random(), Math.random(), Math.random() * 30]);
  }
  const on = MOD && MOD.rain && (phase === "show" || phase === "evac");
  G3.rain.visible = !!on; if (!on) return;
  const a = G3.rain.instanceMatrix.array;
  G3.drops.forEach((d, i) => {
    d[2] -= .9; if (d[2] < 0) { d[2] = 30; d[0] = Math.random(); d[1] = Math.random(); }
    const o = i * 16; a.fill(0, o, o + 16); a[o] = a[o + 5] = a[o + 10] = 1; a[o + 12] = d[0] * WW; a[o + 13] = d[2]; a[o + 14] = d[1] * WH; a[o + 15] = 1;
  });
  G3.rain.instanceMatrix.needsUpdate = true;
}
function renderParticles() {
  const sm = G3.spark; let n = 0;
  for (const p of sparks) {
    if (n >= 1500) break;
    const a = sm.instanceMatrix.array, o = n * 16, s = Math.min(1, p.life);
    a.fill(0, o, o + 16); a[o] = a[o + 5] = a[o + 10] = s; a[o + 12] = p.x; a[o + 13] = p.h; a[o + 14] = p.y; a[o + 15] = 1;
    const c = linArr(p.col); sm.instanceColor.array.set([c[0] * 3, c[1] * 3, c[2] * 3], n * 3); n++;
  }
  sm.count = n; sm.instanceMatrix.needsUpdate = true; sm.instanceColor.needsUpdate = true;
  const pm = G3.puff; n = 0;
  for (const p of puffs) {
    if (n >= 800) break;
    const a = pm.instanceMatrix.array, o = n * 16, s = p.r * Math.min(1, p.life / (p.max * .4));
    a.fill(0, o, o + 16); a[o] = a[o + 5] = a[o + 10] = s; a[o + 12] = p.x; a[o + 13] = p.h; a[o + 14] = p.y; a[o + 15] = 1;
    pm.instanceColor.array.set(linArr(p.col), n * 3); n++;
  }
  pm.count = n; pm.instanceMatrix.needsUpdate = true; pm.instanceColor.needsUpdate = true;
}
function renderGhosts(tt) {
  const b = G3.ghostBody, e = G3.ghostEye, h = G3.ghostHalo, wgm = G3.ghostWing; let n = 0;
  const up0 = LAND ? [VIEW_FLIP, 0] : [0, -VIEW_FLIP], up = [0, 0];   // screen-up in the world, so faces look at the camera
  for (const g of ghosts) {
    up[0] = up0[0]; up[1] = up0[1];
    if (n >= 260) break;
    const q = g.t / g.life, sc = (q < .12 ? q / .12 : q > .75 ? Math.max(0, (1 - q) / .25) : 1) * g.s;
    const x = g.x + Math.sin(tt * 2.2 + g.ph) * .25 * q * 3, y = g.y + Math.cos(tt * 1.7 + g.ph) * .2 * q * 3, hh = .5 + g.t * 1.25;
    M4.makeScale(sc, sc * (1 + Math.sin(tt * 5 + g.ph) * .06), sc); M4.setPosition(x, hh, y); b.setMatrixAt(n, M4); b.instanceColor.setXYZ(n, .7, .93, 1.1);
    if (cine > .01) {   // street camera: the eyes sit on the side facing the lens
      const dx = G3.camera.position.x - x, dz = G3.camera.position.z - y, dl = Math.hypot(dx, dz) || 1;
      up[0] = -dx / dl; up[1] = -dz / dl;
    }
    for (const s2 of [-1, 1]) { M4.makeScale(sc, sc, sc); const fo = cine > .01 ? .19 : .1; M4.setPosition(x - up[0] * fo * sc + s2 * up[1] * .08 * sc, hh + .3 * sc, y - up[1] * fo * sc + s2 * up[0] * .08 * sc); e.setMatrixAt(n * 2 + (s2 > 0 ? 1 : 0), M4); }
    M4.makeRotationX(Math.PI / 2); M4.scale(Vs.set(sc, sc, sc)); M4.setPosition(x, hh + .58 * sc, y); h.setMatrixAt(n, M4); h.instanceColor.setXYZ(n, 2.6, 2.1, .7);
    { const flap = Math.sin(tt * 14 + g.ph) * .55;   // wings sticking out to both sides, flapping
      for (const sd of [-1, 1]) {
        const dx = up[1] * sd, dz = -up[0] * sd; EUL.set(-.35 - flap, Math.atan2(dx, dz), 0, "YXZ"); Q.setFromEuler(EUL); Vs.setScalar(sc);
        Vp.set(x + up[0] * .06 * sc + dx * .1 * sc, hh + .12 * sc, y + up[1] * .06 * sc + dz * .1 * sc); M4.compose(Vp, Q, Vs);
        wgm.setMatrixAt(n * 2 + (sd > 0 ? 1 : 0), M4); wgm.instanceColor.setXYZ(n * 2 + (sd > 0 ? 1 : 0), 1.3, 1.35, 1.4);
      } }
    n++;
  }
  b.count = n; e.count = n * 2; h.count = n; wgm.count = n * 2; wgm.instanceMatrix.needsUpdate = true; wgm.instanceColor.needsUpdate = true;
  b.instanceMatrix.needsUpdate = e.instanceMatrix.needsUpdate = h.instanceMatrix.needsUpdate = true; b.instanceColor.needsUpdate = h.instanceColor.needsUpdate = true;
}
function render3D(now, dtR) {
  if (!G3.renderer) return;
  if (staticDirty) buildStatic3D();
  const tt = now / 1000, live = phase === "show" || phase === "evac";
  { const beat = live && fullAt ? Math.pow(Math.max(0, Math.sin(tt * Math.PI * 124 / 60)), 10) * (surgeT > 0 ? .3 : .16) : 0;   // speakers thump
    for (const pv of G3.woofers || []) { pv.scale.set(1 + beat * .5, 1 + beat * .5, 1 + beat * 2.2); } }
  for (const d of G3.landing) {   // fences and props landing
    const q = Math.min(1, (performance.now() - d.t0) / 420); d.g.position.y = (1 - bounceOut(q)) * 3;
    if (q >= 1 && !d.done) { d.done = true; for (let k = 0; k < 3; k++) puff(d.x + (Math.random() - .5) * 1.5, d.y + (Math.random() - .5) * 1.5, .2, "#e6dcc4", .25, .6, .3); }
  }
  G3.landing = G3.landing.filter(d => !d.done);
  if (G3.medicLights) { G3.medicLights = G3.medicLights.filter(l => l.parent); const on = Math.sin(tt * 6) > 0 ? 1 : .25; for (const l of G3.medicLights) l.material.color.setRGB(2.4 * on, .3 * on, .25 * on); }   // blinking beacon
  if (G3.exitMat) G3.exitMat.emissiveIntensity = (scene.night ? 1.1 : .35) + (phase === "evac" ? (scene.night ? .9 : 1.4) * (.5 + .5 * Math.sin(tt * 7)) : 0);   // exits pulse during the evacuation
  FAN.time.value = tt; FAN.ola.value = ola ? ola.x : -99; FAN.amp.value = live && fullAt ? (surgeT > 0 || cheerT > 0 ? .32 : .1) : .02;
  RIM.value = scene.night ? (cine > .01 ? .9 : .5) : .42; WATER.time.value = tt;   // from above the bloom already lifts the crowd at night
  // rain: the floor slowly gets wet (darker and shiny), and dries after the show
  const wetT = live && MOD && MOD.rain ? 1 : 0; G3.wet = (G3.wet || 0) + (wetT - (G3.wet || 0)) * Math.min(1, dtR * (wetT ? .25 : .5));
  { const gm = G3.ground.material, w = G3.wet; gm.roughness = .95 - .7 * w; gm.metalness = .15 * w; gm.color.setScalar((scene.night ? 1 : .9) - .36 * w); /* light floors a touch darker so the crowd pops */ } WATER.sky.value.set(scene.night ? 0x1a2550 : 0x5fb8e8).multiplyScalar(1 - .85 * black);
  // blackout: the light fades slowly and comes back all at once
  const bt = blackT > 0 && live ? 1 : 0; black += (bt - black) * (1 - Math.pow(bt ? .15 : .002, dtR));
  // golden hour: on day venues the light warms toward sunset as the show goes on, and stays warm for the way out
  // time of day (picked on every visit to a day venue): morning, noon, afternoon, sunset or overcast
  const td = scene.night ? null : TOD;
  const gTarget = scene.night ? 0 : Math.max(td ? td.gold : 0, !live ? 0 : phase === "evac" ? 1 : fullAt ? clamp((t - fullAt) / SHOW_TIME, 0, 1) : 0);
  G3.golden = (G3.golden || 0) + (gTarget - (G3.golden || 0)) * Math.min(1, dtR * (live ? .8 : 3)); const gold = G3.golden * .95;
  G3.sun.color.set(scene.light.sun).lerp(GOLD_SUN, gold); G3.hemi.color.set(scene.light.sky).lerp(GOLD_SKY, gold * .8);
  G3.hemi.intensity = scene.light.hemi * (1 - .8 * black) * (1 - .12 * gold); G3.sun.intensity = scene.light.sunI * (1 - .9 * black) * (1 + .08 * gold) * (1 - .4 * (G3.wet || 0));   // rain: overcast
  if (td) { G3.sun.intensity *= td.sun; G3.hemi.intensity *= td.hemi; if (td.tint) { G3.sun.color.lerp(TD_COL.set(td.tint), td.k); G3.hemi.color.lerp(TD_COL.set(td.sky), td.k * .7); } }
  const vb = updateCamera(dtR);
  {   // the venue moves under your feet: the ship rolls, machines rumble, stadiums bounce (scene.rock), plus every big shake
    const tt2 = vnow / 1000, base = scene.rock ? scene.rock(tt2) : 0, sh = Math.min(1.5, shake);
    const roll = base + sh * Math.sin(tt2 * 37) * .022, bounce = (scene.bounce ? scene.bounce(tt2) : 0) + sh * Math.sin(tt2 * 29) * .12;
    if (roll) G3.camera.rotateZ(roll * (camMode === 4 ? 1.4 : 1));
    if (bounce) G3.camera.position.y += bounce;
  }
  // spotlights and beams
  const cols = ["#ff9ec7", "#9be7ff", "#ffe48a", "#b9a6ff", "#ffb38a"].map(lin);
  scene.bulbs.forEach((_, i) => {
    const on = live ? .35 + .9 * Math.max(0, Math.sin(now / (surgeT > 0 ? 90 : 220) + i * .9)) : .9, c = cols[i % 5];
    G3.bulbs.instanceColor.array[i * 3] = c.r * on * 2; G3.bulbs.instanceColor.array[i * 3 + 1] = c.g * on * 2; G3.bulbs.instanceColor.array[i * 3 + 2] = c.b * on * 2;
  });
  G3.bulbs.instanceColor.needsUpdate = true;
  const inten = phase === "show" ? (fullAt ? 1 : .45) + (surgeT > 0 ? .9 : 0) : phase === "evac" ? .3 : 0;
  scene.beams.forEach((bm, i) => {
    const mesh = G3.beams[i], ang = bm.a + Math.sin(now / (surgeT > 0 ? 380 : 1000 + i * 130) + i * 1.7) * bm.sweep;
    mesh.visible = inten > 0; mesh.material.opacity = Math.min(.3, .085 * inten);
    if (bm.white) mesh.material.color.setRGB(1, .97, .9); else mesh.material.color.setHSL(((now / 22 + i * 60) % 360) / 360, 1, .6);
    mesh.lookAt(bm.x + Math.cos(ang) * 20, 0, bm.y + Math.sin(ang) * 20);
  });
  // stage smoke machines puff during the drop at night venues
  if (scene.night && live && surgeT > 0 && scene.beams.length && Math.random() < .5) {
    const bm = scene.beams[(Math.random() * scene.beams.length) | 0];
    puff(bm.x + (Math.random() - .5) * 3, bm.y + 1 + Math.random() * 2, .4, "#b9c2d6", .5 + Math.random() * .4, 3.2, .25);
  }
  for (const lm of G3.lasers || []) {   // lasers sweep with the music, wild during the drop
    const on = live && fullAt ? (surgeT > 0 ? 1 : .35) : 0, ph = lm.userData.ph, sp = surgeT > 0 ? 1.6 : .5;
    lm.visible = on > 0; lm.material.opacity = on * (.55 + .45 * Math.sin(tt * 9 + ph * 3));
    lm.lookAt(lm.position.x + Math.sin(tt * sp + ph) * 22, 0, lm.position.z + 30 + Math.cos(tt * sp * .7 + ph) * 12);
  }
  // animals, cars and objects
  const alive = new Set();
  for (const m of movers.concat(performers, guards)) {
    if (!m.obj) { m.obj = buildModel(m); if (!m.obj.parent) G3.moverGrp.add(m.obj); if (phase === "plan" && m.kind === "guard") m.dropT = performance.now(); }
    if (m.kind === "flare" && Math.random() < .7) puff(m.x + (Math.random() - .5) * .3, m.y, 1.6, m.col, .25, 3.5, 1.4);
    if ((m.kind === "elephant" || m.kind === "zoo_hippo" || m.kind === "tractor" || m.kind === "cheese_wheel") && live) {   // heavy things stamp marks into the floor
      m.stepD = (m.stepD || 0) + Math.hypot(m.x - (m.px ?? m.x), m.y - (m.py ?? m.y)); m.px = m.x; m.py = m.y;
      if (m.stepD > 1.1 && m.x > 0 && m.x < WW && m.y > 0 && m.y < SH) { m.stepD = 0; m.side = -(m.side || 1); const nx = -Math.sin(m.ang) * .45 * m.side, ny = Math.cos(m.ang) * .45 * m.side; prints.push([m.x + nx, m.y + ny, m.kind === "tractor" ? 1 : 0, m.ang]); if (prints.length > 400) prints.shift(); }
    }
    if (m.dust && m.y > 0 && m.y < WH && Math.random() < .6) puff(m.x - Math.cos(m.ang) * .9, m.y - Math.sin(m.ang) * .9, .3, "#c9a77a", .3, 1.6, .5);
    alive.add(m.obj);
    const dq = m.dropT ? Math.min(1, (performance.now() - m.dropT) / 450) : 1; if (dq >= 1) m.dropT = 0;   // guards hop into place
    m.obj.position.set(m.x, (m.h || 0) + (m.kind === "beach" ? 1.7 + Math.abs(Math.sin(tt * 3 + m.x)) * .6 : 0) + (1 - bounceOut(dq)) * 3.5, m.y);
    m.obj.rotation.y = -m.ang;
    animateModel(m, tt);
  }
  for (const o of G3.moverGrp.children.slice()) if (!alive.has(o)) G3.moverGrp.remove(o);
  if (G3.trompo) G3.trompo.rotation.y = tt * 1.5;
  updateAmbient(tt, dtR);
  if (scene.frame3D) scene.frame3D(tt, dtR);   // per-venue animation hook
  renderPeople(tt, dtR, vb);
  renderChunks(); renderConfetti();
  renderParticles();
  renderGhosts(tt);
  updateFxLayer(live);
  renderRain(tt);
  renderFrame();
  // photo for the newspaper: halfway through the show or at the first trampling
  if (live && (G3.wantPhoto || (fullAt && !G3.photo && t > fullAt + 12))) { try { G3.photo = cv.toDataURL("image/jpeg", .62); } catch (e) { /* no photo */ } G3.wantPhoto = false; }
  drawOverlay();
}

