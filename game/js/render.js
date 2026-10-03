// Marea Humana · dibujo 3D
// ===== Dibujo 3D (three.js) =====
const TEXS = 16, FXS = 10;                 // píxeles por metro: textura del suelo y capa de efectos
let S = 10, dpr = 1, staticLayer = null, staticDirty = true, camMode = 0, LAND = false;  // LAND: monitor horizontal
const G3 = {};
const lin = hex => new THREE.Color(hex).convertSRGBToLinear();
const SKIN = ["#f1c9a5", "#e0ac84", "#c68a5e", "#8d5a3b", "#5e3a24"];
const PANTS = ["#2b3a55", "#1f2328", "#4b5563", "#6b4f3a", "#2f4a3a", "#3d3f8f"];
const HAIR = ["#2b1d14", "#14110f", "#6b4a2b", "#c9a15a", "#3b2a20", "#a8401f"];
const GLOW = ["#7dff6a", "#ff4fd8", "#4fd8ff", "#fff04f"];
const toLin = arr => arr.map(h => { const c = lin(h); return [c.r, c.g, c.b]; });
let SHIRT_L, HEAT_L, SKIN_L, PANTS_L, HAIR_L, GLOW_L;

function resize() {
  const r = $("#wrap").getBoundingClientRect();
  // en pantallas horizontales (PC) el recinto se gira: el escenario queda a la izquierda
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
// textura del suelo: todos los dibujos planos del escenario
function buildStatic() {
  const c = document.createElement("canvas"); c.width = WW * TEXS; c.height = SH * TEXS;
  const g = c.getContext("2d"); g.scale(TEXS, TEXS);
  g.fillStyle = scene.outside; g.fillRect(0, 0, WW, SH);
  scene.ground(g, 1 / TEXS);
  scene.decor(g);
  for (const o of obs) if (o.kind === "fence" || o.kind === "closed") {
    g.lineCap = "butt"; g.lineWidth = .3; g.strokeStyle = "#7d7f7c";
    g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke();
  }
  return c;
}
function drawFence(g, f, ghost) {
  g.lineCap = "round"; g.lineWidth = .35; g.strokeStyle = ghost ? "rgba(255,210,58,.75)" : "#f2c230";
  g.beginPath(); g.moveTo(f.ax, f.ay); g.lineTo(f.bx, f.by); g.stroke();
  g.lineCap = "butt"; g.strokeStyle = "#1c1c1c"; g.setLineDash([.5, .5]); g.lineWidth = .35; g.stroke(); g.setLineDash([]);
}

// ---------- materiales y piezas compartidas ----------
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

function init3D() {
  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .9;
  G3.renderer = renderer;
  const sc = G3.scene = new THREE.Scene(); sc.background = new THREE.Color(0x141516);
  G3.camera = new THREE.PerspectiveCamera(30, WW / WH, 1, 500); G3.camera.up.set(0, 0, -1);
  G3.hemi = new THREE.HemisphereLight(0xffffff, 0x8a8478, .9); sc.add(G3.hemi);
  const sun = G3.sun = new THREE.DirectionalLight(0xfff1dc, 1.5);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0006; sun.shadow.normalBias = .02;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 220; sc.add(sun); sc.add(sun.target);
  GEO = {
    sph: new THREE.SphereGeometry(1, 16, 12), cyl: new THREE.CylinderGeometry(1, 1, 1, 12), box: new THREE.BoxGeometry(1, 1, 1), cone: new THREE.ConeGeometry(1, 1, 14),
  };
  // suelo y capa de efectos
  G3.ground = new THREE.Mesh(new THREE.PlaneGeometry(WW, SH), new THREE.MeshStandardMaterial({ roughness: .95 }));
  G3.ground.rotation.x = -Math.PI / 2; G3.ground.position.set(WW / 2, 0, SH / 2); G3.ground.receiveShadow = true; sc.add(G3.ground);
  G3.fxCv = document.createElement("canvas"); G3.fxCv.width = WW * FXS; G3.fxCv.height = SH * FXS; G3.fx = G3.fxCv.getContext("2d");
  G3.trail = document.createElement("canvas"); G3.trail.width = G3.fxCv.width; G3.trail.height = G3.fxCv.height; G3.tctx = G3.trail.getContext("2d");
  G3.fxTex = new THREE.CanvasTexture(G3.fxCv); G3.fxTex.encoding = THREE.sRGBEncoding;
  const fxPlane = new THREE.Mesh(new THREE.PlaneGeometry(WW, SH), new THREE.MeshBasicMaterial({ map: G3.fxTex, transparent: true, depthWrite: false, toneMapped: false }));
  fxPlane.rotation.x = -Math.PI / 2; fxPlane.position.set(WW / 2, .03, SH / 2); fxPlane.renderOrder = 1; sc.add(fxPlane);
  // vallas del jugador: rayas amarillas y negras en coordenadas del mundo
  const fc = document.createElement("canvas"); fc.width = fc.height = 64; const fg = fc.getContext("2d");
  fg.fillStyle = "#f2c230"; fg.fillRect(0, 0, 64, 64); fg.fillStyle = "#1c1c1c";
  for (let i = -64; i < 128; i += 32) { fg.beginPath(); fg.moveTo(i, 0); fg.lineTo(i + 16, 0); fg.lineTo(i + 80, 64); fg.lineTo(i + 64, 64); fg.fill(); }
  const ft = new THREE.CanvasTexture(fc); ft.encoding = THREE.sRGBEncoding; ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(WW / 1.2, SH / 1.2);
  G3.fenceMat = new THREE.MeshStandardMaterial({ map: ft, roughness: .6 });
  G3.ballTex = { cball: stripeTex(["#d8322b", "#f3e7cf", "#2f7fd6", "#e8b631"], 8, false), beach: stripeTex(["#ffffff", "#d8322b", "#ffffff", "#2f6fc4", "#ffffff", "#e8b631"], 6, false) };
  // haz de luz: cono con degradado
  const gc = document.createElement("canvas"); gc.width = 4; gc.height = 128; const gg = gc.getContext("2d");
  const grd = gg.createLinearGradient(0, 0, 0, 128); grd.addColorStop(0, "#ffffff"); grd.addColorStop(1, "#000000"); gg.fillStyle = grd; gg.fillRect(0, 0, 4, 128);
  G3.beamAlpha = new THREE.CanvasTexture(gc);
  G3.beamGeo = new THREE.ConeGeometry(3.4, 34, 24, 1, true); G3.beamGeo.translate(0, -17, 0); G3.beamGeo.rotateX(-Math.PI / 2);
  G3.dyn = new THREE.Group(); sc.add(G3.dyn);       // focos y haces (cambian con el escenario)
  G3.moverGrp = new THREE.Group(); sc.add(G3.moverGrp);
  G3.perfGrp = new THREE.Group(); sc.add(G3.perfGrp);
  // confeti
  G3.conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(.24, .15), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, toneMapped: false }), 1400);
  G3.conf.instanceMatrix.setUsage(THREE.DynamicDrawUsage); G3.conf.frustumCulled = false; G3.conf.count = 0;
  G3.conf.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(1400 * 3), 3); sc.add(G3.conf);
  CONF_L = toLin(CONF);
  SHIRT_L = toLin(SHIRTS); HEAT_L = toLin(HEAT); SKIN_L = toLin(SKIN); PANTS_L = toLin(PANTS); HAIR_L = toLin(HAIR); GLOW_L = toLin(GLOW);
  initPeople();
  resize();
}

// ---------- recinto 3D ----------
const HEIGHTS = { stage: 1.8, speaker: 3.2, catwalk: 1.3, platform: 1.35, barrier: 1.1, booth: 2.4, aid: 2.4,
  canvas: 3.4, curtain: 5.5, wall: 1.3, curb: .7, pole: 4.5, popcorn: 2.5, candy: 2.5, cannon: 1.1, fence: 1.1, closed: 1.1, player: .95 };
function worldUV(geo) {
  const p = geo.attributes.position, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) { uv[i * 2] = p.getX(i) / WW; uv[i * 2 + 1] = 1 - p.getZ(i) / SH; }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); return geo;
}
function buildStatic3D() {
  staticDirty = false;
  if (G3.static) { G3.scene.remove(G3.static); G3.static.traverse(o => { if (o.geometry && !o.userData.shared) o.geometry.dispose(); }); }
  const grp = G3.static = new THREE.Group(); G3.scene.add(grp);
  staticLayer = buildStatic();
  if (G3.groundTex) G3.groundTex.dispose();
  const tex = G3.groundTex = new THREE.CanvasTexture(staticLayer); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 8;
  G3.ground.material.map = tex; G3.ground.material.needsUpdate = true;
  const m = new THREE.MeshStandardMaterial({ map: tex, roughness: .85 });
  for (const o of obs) {
    const h = HEIGHTS[o.kind]; if (!h && o.kind !== "tent") continue;
    let geo;
    if (o.kind === "tent") { geo = new THREE.ConeGeometry(Math.SQRT2 * 2.5, 3.4, 4, 1); geo.rotateY(Math.PI / 4); geo.translate((o.x0 + o.x1) / 2, 1.7, (o.y0 + o.y1) / 2); }
    else if (o.t === "r") { geo = new THREE.BoxGeometry(o.x1 - o.x0, h, o.y1 - o.y0); geo.translate((o.x0 + o.x1) / 2, h / 2, (o.y0 + o.y1) / 2); }
    else if (o.t === "c") { geo = new THREE.CylinderGeometry(o.kind === "pole" ? o.r * .7 : o.r, o.r, h, 24); geo.translate(o.x, h / 2, o.y); }
    else { const len = Math.hypot(o.bx - o.ax, o.by - o.ay); geo = new THREE.BoxGeometry(len + o.th * .5, h, o.th); geo.rotateY(-Math.atan2(o.by - o.ay, o.bx - o.ax)); geo.translate((o.ax + o.bx) / 2, h / 2, (o.ay + o.by) / 2); }
    worldUV(geo);
    const mesh = new THREE.Mesh(geo, o.kind === "player" ? G3.fenceMat : o.kind === "pole" ? mat("#c9a14a", { metalness: .5, roughness: .35 }) : m);
    mesh.castShadow = true; mesh.receiveShadow = true; grp.add(mesh);
  }
  // puertas abiertas: arcos rojos
  for (let i = 0; i < SLOTS; i++) if (gates[i]) {
    const cx = slotX(i), red = mat("#d8322b", { roughness: .45 });
    for (const s of [-1, 1]) { const p = part(grp, "box", red, .28, 2.5, .28, cx + s * SLOT_W / 2, 1.25, FENCE_Y); p.userData.shared = true; }
    const bar = part(grp, "box", red, SLOT_W + .3, .32, .3, cx, 2.5, FENCE_Y); bar.userData.shared = true;
    const sign = part(grp, "box", mat("#ffffff"), 1.2, .5, .08, cx, 2.5, FENCE_Y - .2); sign.userData.shared = true;
  }
  if (scene.extra3D) scene.extra3D(grp);
  grp.traverse(o => { if (o.isMesh && GEO && Object.values(GEO).includes(o.geometry)) o.userData.shared = true; });
  // focos y haces de luz del escenario
  G3.dyn.clear();
  const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(.24, 10, 8), new THREE.MeshBasicMaterial({ toneMapped: false }), scene.bulbs.length);
  bulbs.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(scene.bulbs.length * 3), 3);
  scene.bulbs.forEach(([x, y], i) => { bulbs.setMatrixAt(i, new THREE.Matrix4().makeTranslation(x, scene.bulbH, y)); });
  G3.bulbs = bulbs; G3.dyn.add(bulbs);
  G3.beams = scene.beams.map(b => {
    const mesh = new THREE.Mesh(G3.beamGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, alphaMap: G3.beamAlpha, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
    mesh.position.set(b.x, b.h || 7, b.y); G3.dyn.add(mesh); return mesh;
  });
  // luz según el escenario
  G3.hemi.color.set(scene.light.sky); G3.hemi.groundColor.set(scene.light.ground); G3.hemi.intensity = scene.light.hemi;
  G3.sun.color.set(scene.light.sun); G3.sun.intensity = scene.light.sunI;
  // artistas fijos
  G3.perfGrp.clear();
  for (const p of performers) { p.obj = buildModel(p); G3.perfGrp.add(p.obj); }
}

// ---------- personas: 5 modelos con piezas instanciadas ----------
// 0 clásico, 1 gorra, 2 melena, 3 mochila, 4 fiestero con barra luminosa
let P = {};
const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), Vp = new THREE.Vector3(), Vs = new THREE.Vector3();
const Bm = new Float32Array(9), Bt = new Float32Array(3), LB = new Float32Array(12);
const loc = (sx, sy, sz, x, y, z) => new Float32Array([sx, 0, 0, 0, sy, 0, 0, 0, sz, x, y, z]);
const LOCAL = {
  torso: loc(.82, 1, 1.32, 0, 1.17, 0), head: loc(1, 1, 1, .02, 1.62, 0), hair: loc(1, 1, 1, -.012, 1.635, 0),
  cap: loc(1, 1, 1, -.005, 1.71, 0), brim: loc(1, 1, 1, .13, 1.68, 0), long: loc(1, 1, 1, -.1, 1.5, 0), pack: loc(1, 1, 1, -.2, 1.2, 0),
};
function initPeople() {
  const N = 4200, std = o => new THREE.MeshStandardMaterial(Object.assign({ roughness: .78 }, o || {}));
  const mk = (geo, material, n) => {
    const m = new THREE.InstancedMesh(geo, material, n); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3); m.instanceColor.setUsage(THREE.DynamicDrawUsage);
    m.castShadow = true; m.frustumCulled = false; m.count = 0; G3.scene.add(m); return m;
  };
  P.torso = mk(new THREE.CapsuleGeometry(.17, .32, 2, 8), std(), N);
  P.head = mk(new THREE.SphereGeometry(.125, 8, 6), std({ roughness: .6 }), N);
  P.arm = mk(new THREE.BoxGeometry(.09, .6, .1), std(), N * 2);
  P.leg = mk(new THREE.BoxGeometry(.12, .8, .14), std(), N * 2);
  P.hair = mk(new THREE.SphereGeometry(.138, 8, 4, 0, Math.PI * 2, 0, Math.PI * .56), std({ roughness: .9 }), N);
  P.cap = mk(new THREE.CylinderGeometry(.14, .145, .1, 10), std({ roughness: .5 }), N);
  P.brim = mk(new THREE.BoxGeometry(.18, .025, .22), std({ roughness: .5 }), N);
  P.long = mk(new THREE.BoxGeometry(.1, .4, .27), std({ roughness: .9 }), N);
  P.pack = mk(new THREE.BoxGeometry(.17, .34, .28), std({ roughness: .6 }), N);
  P.glow = mk(new THREE.CylinderGeometry(.028, .028, .42, 6), new THREE.MeshBasicMaterial({ toneMapped: false }), N);
  P.glow.castShadow = false;
}
// base del cuerpo: giro, escala y posición (y opcionalmente tumbado)
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
  const C = { torso: 0, head: 0, arm: 0, leg: 0, hair: 0, cap: 0, brim: 0, long: 0, pack: 0, glow: 0 };
  const hm = heatMix, surging = surgeT > 0, red = HEAT_L[HEAT_L.length - 1], detail = cam.z > 1.3, cap = P.torso.instanceMatrix.count;
  const draw = (a, down) => {
    let bob = 0, armL = 0, armR = 0, legL = 0, legR = 0;
    if (down) { setBase(a.x, .17, a.y, a.h, a.sc, true); armL = 2.9; armR = 2.2; legL = .25; legR = -.2; }
    else {
      const sp = Math.hypot(a.vx, a.vy);
      a.wp += sp * dtR * 5.2;
      const sw = Math.sin(a.wp) * Math.min(.75, sp * .55);
      bob = Math.abs(Math.cos(a.wp)) * Math.min(.06, sp * .04);
      armL = -sw * .9; armR = sw * .9; legL = sw; legR = -sw;
      if (a.dance) {
        const ph = tt * (surging ? 9.5 : 6.5) + a.ph, j = Math.abs(Math.sin(ph));
        bob = j * (surging ? .3 : .13); legL = -j * .15; legR = j * .15;
        if (surging || a.m === 4 || a.st === 1) { armL = 2.75 + Math.sin(ph) * .3; armR = 2.75 - Math.sin(ph) * .3; }
        else if (a.st === 0) { armR = 2.35 + Math.sin(ph) * .55; armL = .3 * Math.sin(ph * .5); }
        else { armL = armR = 1.1 + Math.sin(ph * 2) * .45; }
      }
      if (a.ps > PCRIT * .55) { const ph = tt * 15 + a.ph; armL = 2.3 + Math.sin(ph) * .55; armR = 2.3 + Math.cos(ph) * .55; }
      setBase(a.x, bob, a.y, a.h, a.sc, false);
    }
    // ropa: se funde con el color de presión; en peligro, roja
    const k = down ? .5 : 1, hq = HEAT_L[clamp(Math.floor(a.ps / PCRIT * HEAT_L.length), 0, HEAT_L.length - 1)];
    const sh = SHIRT_L[a.c], pa = PANTS_L[a.pc];
    let r, g, b;
    if (!down && a.dmg > .45) { r = red[0]; g = red[1]; b = red[2]; }
    else { r = sh[0] + (hq[0] - sh[0]) * hm; g = sh[1] + (hq[1] - sh[1]) * hm; b = sh[2] + (hq[2] - sh[2]) * hm; }
    r *= k; g *= k; b *= k;
    emit(P.torso, C.torso, LOCAL.torso); colW(P.torso, C.torso++, r, g, b);
    const skn = SKIN_L[a.sk]; emit(P.head, C.head, LOCAL.head); colW(P.head, C.head++, skn[0] * k, skn[1] * k, skn[2] * k);
    const hc = HAIR_L[a.hc];
    if (a.m === 1) {
      const cc = SHIRT_L[a.ac];
      emit(P.cap, C.cap, LOCAL.cap); colW(P.cap, C.cap++, cc[0] * k, cc[1] * k, cc[2] * k);
      emit(P.brim, C.brim, LOCAL.brim); colW(P.brim, C.brim++, cc[0] * k, cc[1] * k, cc[2] * k);
    } else { emit(P.hair, C.hair, LOCAL.hair); colW(P.hair, C.hair++, hc[0] * k, hc[1] * k, hc[2] * k); }
    if (!detail && !down) return;
    emit(P.arm, C.arm, limb(0, 1.4, -.25, armL, .6)); colW(P.arm, C.arm++, r, g, b);
    emit(P.arm, C.arm, limb(0, 1.4, .25, armR, .6)); colW(P.arm, C.arm++, r, g, b);
    if (a.m === 4) { const gc = GLOW_L[a.ac % GLOW_L.length]; emit(P.glow, C.glow, limb(0, 1.4, .25, armR, .42, .42)); colW(P.glow, C.glow++, gc[0] * 1.6, gc[1] * 1.6, gc[2] * 1.6); }
    const pr = pa[0] + (hq[0] - pa[0]) * hm * .8, pg = pa[1] + (hq[1] - pa[1]) * hm * .8, pb = pa[2] + (hq[2] - pa[2]) * hm * .8;
    emit(P.leg, C.leg, limb(0, .84, -.1, legL, .8)); colW(P.leg, C.leg++, pr * k, pg * k, pb * k);
    emit(P.leg, C.leg, limb(0, .84, .1, legR, .8)); colW(P.leg, C.leg++, pr * k, pg * k, pb * k);
    if (a.m === 2) { emit(P.long, C.long, LOCAL.long); colW(P.long, C.long++, hc[0] * k, hc[1] * k, hc[2] * k); }
    if (a.m === 3) { const cc = SHIRT_L[a.ac]; emit(P.pack, C.pack, LOCAL.pack); colW(P.pack, C.pack++, cc[0] * k, cc[1] * k, cc[2] * k); }
  };
  for (const a of ag) { if (a.x < vb[0] || a.x > vb[1] || a.y < vb[2] || a.y > vb[3]) continue; draw(a, false); }
  for (const a of fallen) { if (C.torso >= cap - 1) break; draw(a, true); }
  for (const key in C) { const m = P[key]; m.count = C[key]; m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; }
}

// ---------- animales, coches y objetos en 3D (mirando a +x) ----------
function buildModel(m) {
  const g = new THREE.Group(), u = g.userData; u.legs = []; u.kind = m.kind;
  switch (m.kind) {
    case "elephant": {
      part(g, "sph", "#8d9095", 1.5, 1, .95, 0, 1.8, 0);
      part(g, "sph", "#969a9f", .72, .72, .72, 1.38, 2.2, 0);
      for (const s of [-1, 1]) part(g, "sph", "#7d8086", .12, .62, .55, 1.12, 2.25, s * .66);
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
      part(g, "sph", "#2a1a10", .07, .07, .07, 1.36, 1.12, 0);
      for (const [x, z] of [[.55, .22], [.55, -.22], [-.55, .22], [-.55, -.22]]) u.legs.push(leg(g, x, .75, z, .1, .75, "#c98f3e"));
      u.tail = pivot(g, -.9, 1, 0); part(u.tail, "cyl", "#c58c3c", .04, .9, .04, 0, -.45, 0); part(u.tail, "sph", "#5a2e12", .12, .12, .12, 0, -.9, 0);
      break;
    }
    case "horse": {
      const c = m.col || "#f2efe9";
      part(g, "sph", c, 1.1, .45, .4, 0, 1.4, 0);
      const nk = part(g, "cyl", c, .18, .9, .18, .95, 1.85, 0); nk.rotation.z = -.6;
      part(g, "box", c, .55, .25, .22, 1.35, 2.15, 0);
      part(g, "cone", "#d8322b", .1, .4, .1, 1.15, 2.45, 0);
      part(g, "box", "#2f6fc4", .62, .1, .86, 0, 1.85, 0);
      for (const [x, z] of [[.75, .2], [.75, -.2], [-.75, .2], [-.75, -.2]]) u.legs.push(leg(g, x, 1.25, z, .08, 1.25, c));
      u.tail = pivot(g, -1.05, 1.5, 0); part(u.tail, "cyl", c === "#f2efe9" ? "#bdb5a8" : "#3a2414", .06, .8, .06, 0, -.4, 0);
      break;
    }
    case "dog": {
      const c = m.col;
      part(g, "sph", c, .45, .2, .18, 0, .45, 0); part(g, "sph", c, .17, .17, .17, .45, .62, 0); part(g, "sph", "#1c1c1c", .05, .05, .05, .62, .62, 0);
      for (const [x, z] of [[.28, .1], [.28, -.1], [-.28, .1], [-.28, -.1]]) u.legs.push(leg(g, x, .4, z, .05, .4, c));
      u.tail = pivot(g, -.42, .55, 0); part(u.tail, "cyl", c, .035, .35, .035, 0, -.17, 0); u.tail.rotation.z = 2.3;
      break;
    }
    case "juggler": case "unicycle": case "flyer": {
      const body = m.kind === "flyer" ? "#d8322b" : m.col || "#2f6fc4";
      const base = m.kind === "unicycle" ? .65 : 0;
      if (m.kind === "unicycle") { const w = part(g, "cyl", "#1c1c1c", .32, .08, .32, 0, .32, 0); w.rotation.x = Math.PI / 2; part(g, "cyl", "#9aa0a6", .03, .45, .03, 0, .65, 0); u.wheel = w; }
      const bodyG = pivot(g, 0, base, 0); u.body = bodyG;
      part(bodyG, "sph", body, .2, .38, .26, 0, 1.15, 0);
      part(bodyG, "sph", "#fbe9d7", .15, .15, .15, .02, 1.65, 0);
      part(bodyG, "sph", "#ff3b2f", .055, .055, .055, .17, 1.65, 0);
      if (m.kind === "flyer") part(bodyG, "sph", "#c9ced6", .17, .12, .17, 0, 1.72, 0);
      else for (const s of [-1, 1]) part(bodyG, "sph", "#ff5a3c", .1, .1, .1, -.02, 1.7, s * .14);
      if (m.kind !== "flyer") for (const s of [-1, 1]) u.legs.push(leg(bodyG, 0, .8, s * .1, .06, .8, "#e8b631"));
      u.arms = [-1, 1].map(s => { const p = pivot(bodyG, 0, 1.4, s * .25); part(p, "cyl", body, .05, .6, .05, 0, -.3, 0); return p; });
      if (m.kind === "juggler") u.balls = ["#e8b631", "#d8322b", "#3d9a5b"].map(c => part(g, "sph", c, .1, .1, .1, 0, 2, 0));
      if (m.kind === "flyer") { bodyG.rotation.z = -Math.PI / 2; bodyG.position.y = .2; }
      break;
    }
    case "car": case "icecream": case "clowncar": {
      const L = m.kind === "car" ? 4.2 : m.kind === "icecream" ? 5 : 2.6, Wd = m.kind === "car" ? 1.9 : m.kind === "icecream" ? 2.2 : 1.5;
      const bodyC = m.kind === "car" ? m.col : m.kind === "icecream" ? "#fbf4ee" : "#ffd23a";
      const wr = m.kind === "clowncar" ? .5 : .38;
      for (const [x, z] of [[L * .3, Wd / 2], [-L * .3, Wd / 2], [L * .3, -Wd / 2], [-L * .3, -Wd / 2]]) { const w = part(g, "cyl", "#151617", wr, .28, wr, x, wr, z); w.rotation.x = Math.PI / 2; }
      if (m.kind === "car") {
        part(g, "box", mat(bodyC, { metalness: .3, roughness: .35 }), L, .65, Wd, 0, .65, 0);
        part(g, "box", mat("#1d2733", { roughness: .15, metalness: .5 }), 2.1, .55, Wd * .9, -.2, 1.22, 0);
        part(g, "box", mat(bodyC, { metalness: .3, roughness: .35 }), 1.7, .07, Wd * .88, -.25, 1.52, 0);
        for (const s of [-1, 1]) part(g, "box", basic("#fff6c8"), .06, .16, .35, L / 2, .75, s * .6);
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
    case "beach": case "cball": {
      const ball = new THREE.Mesh(GEO.sph, new THREE.MeshStandardMaterial({ map: G3.ballTex[m.kind], roughness: .35 }));
      ball.scale.setScalar(m.r); ball.position.y = m.r; ball.castShadow = true; g.add(ball); u.ball = ball;
      break;
    }
  }
  return g;
}
function animateModel(m, tt) {
  const g = m.obj, u = g.userData, moving = m.kind !== "juggler";
  const f = m.kind === "elephant" ? 3 : m.kind === "lion" ? 11 : m.kind === "dog" ? 14 : m.kind === "horse" ? 8 : 9;
  u.legs.forEach((p, i) => { p.rotation.z = moving ? Math.sin(tt * f + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * .45 : 0; });
  if (u.trunk) u.trunk.rotation.z = -.35 + Math.sin(tt * 2.2) * .35;
  if (u.tail) u.tail.rotation.x = Math.sin(tt * (m.kind === "dog" ? 18 : 5)) * .5;
  if (u.arms) u.arms.forEach((p, i) => { p.rotation.z = m.kind === "juggler" ? 1.3 + Math.sin(tt * 10 + i * Math.PI) * .3 : m.kind === "flyer" ? 2.9 : (i ? 1 : -1) * 0 + Math.sin(tt * 9 + i) * .4; p.rotation.x = m.kind === "unicycle" ? (i ? 1.2 : -1.2) : 0; });
  if (u.balls) u.balls.forEach((b, i) => { const a = tt * 5 + i * 2.1; b.position.set(.45 + Math.cos(a) * .25, 2.1 + Math.abs(Math.sin(a)) * .9, Math.sin(a) * .35); });
  if (u.body && m.kind === "unicycle") { u.body.rotation.x = Math.sin(tt * 4 + m.x) * .12; u.wheel.rotation.y = tt * 6; }
  if (u.ball) u.ball.rotation.z = -m.spin;
  if (u.flower) u.flower.scale.setScalar(.14 + Math.abs(Math.sin(tt * 6)) * .08);
}

// ---------- cámara, capas y cuadro ----------
const RAY = new THREE.Raycaster(), PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), HIT = new THREE.Vector3(), NDC = new THREE.Vector2();
function toWorld(ev) {
  const r = cv.getBoundingClientRect();
  NDC.set((ev.clientX - r.left) / r.width * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  RAY.setFromCamera(NDC, G3.camera); RAY.ray.intersectPlane(PLANE, HIT);
  return [HIT.x, HIT.z];
}
function updateCamera() {
  const base = ((LAND ? WW : WH) / 2) / Math.tan(15 * Math.PI / 180), z = cam.z, h = base / z;
  const tilt = clamp((z - 1) * .5, 0, .42);
  const dx = LAND ? -1 : 0, dz = LAND ? 0 : 1;   // dirección "hacia abajo" de la pantalla en el mundo
  const sx = (Math.random() - .5) * shake, sy = (Math.random() - .5) * shake;
  const lift = h * Math.sin(tilt) * .12, tx = cam.x + sx + dx * lift, tz = cam.y + sy + dz * lift;
  G3.camera.up.set(LAND ? 1 : 0, 0, LAND ? 0 : -1);
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
  // sombra roja bajo quienes cayeron
  g.fillStyle = "rgba(200,30,30,.28)";
  for (const a of fallen) { g.beginPath(); g.arc(a.x, a.y, .7, 0, 7); g.fill(); }
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
  if (drag) drawFence(g, drag, true);
  g.lineWidth = .14;
  for (const r of rings) { g.strokeStyle = `rgba(229,50,41,${(1 - r.t / 1.3).toFixed(3)})`; g.beginPath(); g.arc(r.x, r.y, .3 + r.t * 1.8, 0, 7); g.stroke(); }
  G3.fxTex.needsUpdate = true;
}
const Vproj = new THREE.Vector3();
function drawOverlay() {
  const g = octx; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, ov.width, ov.height);
  const ppm = ov.height / ((LAND ? WW : WH) / cam.z);
  g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
  for (const q of pops) {
    Vproj.set(q.x, 2.5 + q.t * 1.4, q.y).project(G3.camera);
    const x = (Vproj.x + 1) / 2 * ov.width, y = (1 - Vproj.y) / 2 * ov.height, sc = 1 + Math.max(0, .25 - q.t) * 2;
    g.save(); g.translate(x, y); g.scale(sc, sc); g.globalAlpha = Math.min(1, (1.6 - q.t) / .5);
    g.font = `900 ${Math.round(Math.max(12, .95 * ppm))}px Rubik, system-ui, sans-serif`;
    g.lineWidth = Math.max(3, .22 * ppm); g.strokeStyle = "#111214"; g.strokeText(q.text, 0, 0); g.fillStyle = "#ffd23a"; g.fillText(q.text, 0, 0);
    g.restore();
  }
  if (flash > .01) { g.globalAlpha = 1; g.fillStyle = `rgba(255,255,255,${(flash * .22).toFixed(3)})`; g.fillRect(0, 0, ov.width, ov.height); }
}
let CONF_L;
const EUL = new THREE.Euler();
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
function render3D(now, dtR) {
  if (!G3.renderer) return;
  if (staticDirty) buildStatic3D();
  const tt = now / 1000, live = phase === "show" || phase === "evac";
  const vb = updateCamera();
  // focos y haces
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
    mesh.material.color.setHSL(((now / 22 + i * 60) % 360) / 360, 1, .6);
    mesh.lookAt(bm.x + Math.cos(ang) * 20, 0, bm.y + Math.sin(ang) * 20);
  });
  // animales, coches y objetos
  const alive = new Set();
  for (const m of movers.concat(performers)) {
    if (!m.obj) { m.obj = buildModel(m); G3.moverGrp.add(m.obj); }
    alive.add(m.obj);
    m.obj.position.set(m.x, (m.h || 0) + (m.kind === "beach" ? 1.7 + Math.abs(Math.sin(tt * 3 + m.x)) * .6 : 0), m.y);
    m.obj.rotation.y = -m.ang;
    animateModel(m, tt);
  }
  for (const o of G3.moverGrp.children.slice()) if (!alive.has(o)) G3.moverGrp.remove(o);
  renderPeople(tt, dtR, vb);
  renderConfetti();
  updateFxLayer(live);
  G3.renderer.render(G3.scene, G3.camera);
  drawOverlay();
}

