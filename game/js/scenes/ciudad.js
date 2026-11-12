// Human Tsunami · scene: The City (night festival; the whole city is the stage)
const BLOCKS_X = [[0, 7], [12, 17.5], [22.5, 28], [33, WW]], BLOCKS_Y = [[20, 30], [35, 45], [50, 60]];
// ---- purely visual helpers (roof layouts, lamps, shop fronts, signs, LED stage) ----
const CITY_ROOF = ["tile", "garden", "gravel", "pool", "gravel", "garden", "garden", "tile", "pool", "gravel", "pool", "tile"];
const CITY_COLS = ["#ffd98a", "#ff5fb0", "#3fe0ff", "#9dff6a", "#ffb03a"];
// every roof gets a type and a list of things standing on it; used by both the painting and the 3D props
function cityRoofs() {
  const r = rng(909);
  return obs.filter(o => o.kind === "building").map((o, i) => {
    const w = o.x1 - o.x0, d = o.y1 - o.y0, type = CITY_ROOF[i % 12], it = [], flip = r() < .5, fx = r() < .5;
    const P = (k, ax, ay, e) => it.push(Object.assign({ k, x: o.x0 + (fx ? 1 - ax : ax) * w, y: o.y0 + (flip ? 1 - ay : ay) * d }, e || {}));
    const side = (o.x0 + o.x1) / 2 < WW / 2 ? 1 : -1;   // billboards face the nearest inner street
    if (type === "tile") { P("chim", .3, .3); P("chim", .7, .7); P("ant", .5, .5); P("sky", .28, .68); P("sky", .72, .3); }
    else if (type === "gravel") {
      P("tank", .3, .2); P("hut", .7, .82); P("ac", .25, .5); P("ac", .25, .64); P("ac", .72, .3); P("sky", .68, .55); P("sky", .3, .84); P("ant", .82, .1);
      it.push({ k: "bill", x: side > 0 ? o.x1 - .5 : o.x0 + .5, y: o.y0 + d * .5, side, n: i });
    } else if (type === "garden") {
      P("tree", .22, .14); P("tree", .78, .16); P("tree", .2, .86); P("tree", .8, .84); P("tree", .5, .36, { big: 1 }); P("hut", .5, .62); P("fairy", .5, .5);
    } else {
      P("pool", .5, .42, { pw: w * .56, pd: d * .36 }); P("para", .2, .78); P("para", .5, .82); P("para", .8, .78); P("hut", .8, .1); P("ac", .2, .1); P("ant", .5, .08);
    }
    return { o, i, type, it, w, d };
  });
}
// wall lanterns, corner lamp posts and shop fronts: everything hugs a building wall
function cityWalls() {
  const walls = [];
  for (const [x0, x1] of BLOCKS_X) for (const [y0, y1] of BLOCKS_Y) {
    if (x0 > 0) walls.push({ x: x0, y: y0, len: y1 - y0, nx: -1, ny: 0 });
    if (x1 < WW) walls.push({ x: x1, y: y0, len: y1 - y0, nx: 1, ny: 0 });
    walls.push({ x: x0, y: y0, len: x1 - x0, nx: 0, ny: -1 }, { x: x0, y: y1, len: x1 - x0, nx: 0, ny: 1 });
  }
  return walls;
}
function cityLamps() {
  const L = [];
  for (const wl of cityWalls()) for (const f of wl.len > 8 ? [.17, .5, .83] : [.28, .72]) {
    const along = f * wl.len; L.push({ x: wl.x + (wl.nx ? 0 : along), y: wl.y + (wl.nx ? along : 0), nx: wl.nx, ny: wl.ny });
  }
  for (const [x0, x1] of BLOCKS_X) for (const [y0, y1] of BLOCKS_Y) for (const [cx, sx] of [[x0, -1], [x1, 1]]) for (const [cy, sy] of [[y0, -1], [y1, 1]])
    if (cx > 0 && cx < WW) L.push({ x: cx + sx * .12, y: cy + sy * .12, nx: 0, ny: 0, post: 1 });
  return L;
}
function cityInst(grp, geo, m, list) {
  if (!list.length) return;
  const im = new THREE.InstancedMesh(GEO[geo], m, list.length), M = new THREE.Matrix4(), q = new THREE.Quaternion();
  list.forEach((a, i) => im.setMatrixAt(i, M.compose(new THREE.Vector3(a[3], a[4], a[5]), q, new THREE.Vector3(a[0], a[1], a[2]))));
  im.userData.shared = true; im.frustumCulled = false; grp.add(im);
}
const CITY_TEX = {}; let CITY_PLANE;
function cityTex(key, w, h, draw) {
  if (CITY_TEX[key]) return CITY_TEX[key];
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
  t.userData = { mat: new THREE.MeshBasicMaterial({ map: t, toneMapped: false }) }; return CITY_TEX[key] = t;
}
function cityPanel(grp, tex, w, h, x, y, z, ry, tilt) {
  const p = pivot(grp, x, y, z); p.rotation.y = ry;
  const m = new THREE.Mesh(CITY_PLANE || (CITY_PLANE = new THREE.PlaneGeometry(1, 1)), tex.userData.mat);
  m.scale.set(w, h, 1); m.rotation.x = -(tilt || 0); m.userData.shared = true; p.add(m); return p;
}
function cityNeon(text, col) {
  return cityTex("neon" + text + col, 256, 96, (c, w, h) => {
    c.fillStyle = "#0a0b10"; c.fillRect(0, 0, w, h);
    c.strokeStyle = col; c.lineWidth = 6; c.strokeRect(7, 7, w - 14, h - 14);
    c.font = "900 54px Rubik, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
    c.shadowColor = col; c.shadowBlur = 12; c.fillStyle = "#ffffff"; c.fillText(text, w / 2, h / 2 + 3, w - 34);
    c.fillStyle = col; c.globalAlpha = .55; c.fillText(text, w / 2, h / 2 + 3, w - 34);
  });
}
const CITY_ADS = [["CITY FEST", "TONIGHT!", "#ff3fa4", "#ffd23a"], ["FIZZ!", "COLA", "#22d3ee", "#ffffff"], ["MEGA", "BURGER", "#ffb03a", "#d8322b"], ["SLEEP", "LATER", "#8a4fbf", "#9dff6a"]];
function cityAd(n) {
  const [a, b, c0, c1] = CITY_ADS[n % CITY_ADS.length];
  return cityTex("ad" + n % CITY_ADS.length, 256, 128, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, c0); gr.addColorStop(1, "#1a1030"); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.fillStyle = c1; c.beginPath(); c.arc(w * .82, h * .3, 30, 0, 7); c.fill();
    c.strokeStyle = "#ffffff"; c.lineWidth = 6; c.strokeRect(5, 5, w - 10, h - 10);
    c.textAlign = "left"; c.textBaseline = "middle"; c.fillStyle = "#ffffff"; c.font = "900 50px Rubik, sans-serif"; c.fillText(a, 18, h * .36, w * .62);
    c.fillStyle = c1; c.font = "900 44px Rubik, sans-serif"; c.fillText(b, 18, h * .72, w - 36);
  });
}
// the plaza stage: animated LED wall and LED deck, truss with colour-cycling lamps
SCENE_MODELS.ciudad_stage = (g, u) => {
  const cv = document.createElement("canvas"); cv.width = 96; cv.height = 32; const c = cv.getContext("2d");
  const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding; tex.magFilter = THREE.NearestFilter; tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter;
  const wallM = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), deckM = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, color: 0x8a8a8a });
  const plane = CITY_PLANE || (CITY_PLANE = new THREE.PlaneGeometry(1, 1)), steel = mat("#23252b", { metalness: .6, roughness: .4 });
  part(g, "box", "#0b0c10", 15.4, 5.6, .3, 0, 4.7, .45);
  const wall = new THREE.Mesh(plane, wallM); wall.scale.set(15, 5.2, 1); wall.position.set(0, 4.7, .62); g.add(wall);
  const deck = new THREE.Mesh(plane, deckM); deck.scale.set(13, 2.4, 1); deck.rotation.x = -Math.PI / 2; deck.position.set(0, 1.83, 3.6); g.add(deck);
  // truss: four towers, front and back beams, side beams
  for (const sx of [-7.75, 7.75]) for (const z of [.5, 4.7]) { for (const dx of [-.18, .18]) part(g, "box", steel, .09, 7.6, .09, sx + dx, 5.6, z); for (let y = 2.4; y < 9.2; y += .8) part(g, "box", steel, .45, .06, .06, sx, y, z); }
  for (const z of [.5, 4.7]) for (const y of [9.1, 9.5]) part(g, "box", steel, 15.9, .09, .09, 0, y, z);
  for (const sx of [-7.75, 7.75]) part(g, "box", steel, .09, .09, 4.2, sx, 9.3, 2.6);
  u.lamps = [];
  for (let i = 0; i < 9; i++) {
    const x = -6.8 + i * 1.7, lm = new THREE.MeshBasicMaterial({ toneMapped: false });
    part(g, "cyl", "#15161a", .2, .45, .2, x, 8.75, 4.7); part(g, "sph", lm, .19, .1, .19, x, 8.5, 4.7); u.lamps.push(lm);
  }
  u.strips = [-7.75, 7.75].map(sx => { const sm = new THREE.MeshBasicMaterial({ toneMapped: false }); part(g, "box", sm, .16, 6.6, .06, sx, 5.4, 4.95); return sm; });
  let last = -1;
  u.anim = tt => {
    if (tt - last < .07 && tt >= last) return; last = tt;
    const W = 96, H = 32, beat = Math.abs(Math.sin(tt * 4.2));
    c.fillStyle = `hsl(${(tt * 35) % 360},85%,${14 + beat * 8}%)`; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 24; i++) {
      const hh = (.18 + .8 * Math.abs(Math.sin(tt * 3.1 + i * .7) * Math.sin(tt * 1.3 + i * .31))) * H;
      c.fillStyle = `hsl(${(tt * 70 + i * 15) % 360},100%,58%)`; c.fillRect(i * 4 + .5, H - hh, 3, hh);
      c.fillStyle = "#ffffff"; c.fillRect(i * 4 + .5, H - hh - 1.5, 3, 1);
    }
    if (Math.floor(tt / 2.5) % 2) { c.fillStyle = "rgba(8,8,20,.72)"; c.fillRect(8, 8, 80, 16); c.fillStyle = "#ffffff"; c.font = "900 13px Rubik, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("CITY FEST", 48, 16.5, 74); }
    tex.needsUpdate = true;
    u.lamps.forEach((lm, i) => lm.color.setHSL((tt * .25 + i / 9) % 1, 1, (Math.floor(tt * 4) + i) % 3 ? .55 : .8));
    u.strips.forEach((sm, i) => sm.color.setHSL((tt * .4 + i * .5) % 1, 1, .45 + beat * .25));
  };
};
SCENES.ciudad = {
  name: "The City", tag: "Night festival", outside: "#2a2d33", bulbH: 2.2, night: true, music: "edm",
  light: { sky: 0x5c70b0, ground: 0x15181f, hemi: .32, sun: 0xb0c0ff, sunI: .6 }, crowd: 3800, fenceBudget: 80, maxGates: 5, guards: 5,
  gates: [F, F, T, F, T, F, F], unlock: 9,
  intro: "The whole city is the stage. Packed streets between tall buildings, fireworks, a parade and taxis that didn't get the memo that the street is closed.",
  acts: ["The whole city is partying!", "Louder!", "Every street is singing!", "Last song!"],
  events: ["fuegos", "taxi", "carroza", "policia", "fuegos", "dogs", "taxi"],
  goal: o => o.kind === "barrier", goalMaxY: 20,
  build() {
    rect(12, 0, 28, 5, "stage");
    rect(8.5, 1, 11, 4, "speaker"); rect(29, 1, 31.5, 4, "speaker");
    seg(0, 6.4, WW, 6.4, .5, "barrier");
    circ(20, 13.5, 1.8, "fountain");
    const rand = rng(77);
    for (const [x0, x1] of BLOCKS_X) for (const [y0, y1] of BLOCKS_Y) { const b = rect(x0, y0, x1, y1, "building"); b.hb = 6 + Math.floor(rand() * 10); b.tone = (rand() * 4) | 0; }
  },
  ground(g) {
    const r = rng(41);
    g.fillStyle = "#282a31"; g.fillRect(0, 0, WW, WH);
    // asphalt: speckle, worn patches, tar seams
    for (let k = 0; k < 3000; k++) { g.fillStyle = r() < .5 ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.16)"; g.fillRect(r() * WW, 20 + r() * (WH - 20), .1 + .22 * r(), .1); }
    for (let k = 0; k < 16; k++) { g.fillStyle = "rgba(0,0,0,.13)"; g.fillRect(r() * WW, 20 + r() * 44, 1 + r() * 2.2, .8 + r() * 1.6); }
    g.strokeStyle = "rgba(0,0,0,.3)"; g.lineWidth = .05;
    for (let k = 0; k < 14; k++) { const x = r() * WW, y = 21 + r() * 43; g.beginPath(); g.moveTo(x, y); g.lineTo(x + r() * 2 - 1, y + 1 + r()); g.lineTo(x + r() * 2 - 1, y + 2 + r() * 1.5); g.stroke(); }
    // cobblestone plaza with a ring pattern around the fountain and a warm carpet in front of the stage
    g.fillStyle = "#4d4e56"; g.fillRect(0, 6.4, WW, 13.6);
    g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = .05;
    for (let x = 0; x < WW; x += .6) { g.beginPath(); g.moveTo(x, 6.4); g.lineTo(x, 20); g.stroke(); }
    for (let y = 6.4; y < 20; y += .6) { g.beginPath(); g.moveTo(0, y); g.lineTo(WW, y); g.stroke(); }
    for (let k = 0; k < 500; k++) { g.fillStyle = r() < .5 ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.12)"; g.fillRect(Math.floor(r() * 66) * .6 + .04, 6.4 + Math.floor(r() * 22) * .6 + .04, .52, .52); }
    g.save(); g.beginPath(); g.rect(0, 6.65, WW, 13.35); g.clip();
    [[6.6, "#6b5a52", .9], [5.4, "#585962", .5], [4.5, "#7a6558", .7], [3.2, "#62636c", .5], [2.5, "#8a7060", .5]].forEach(([rad, col, lw]) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.arc(20, 13.5, rad, 0, 7); g.stroke(); });
    g.strokeStyle = "rgba(0,0,0,.22)"; g.lineWidth = .05;
    for (let k = 0; k < 32; k++) { const a = k / 32 * 6.283; g.beginPath(); g.moveTo(20 + Math.cos(a) * 2.1, 13.5 + Math.sin(a) * 2.1); g.lineTo(20 + Math.cos(a) * 7, 13.5 + Math.sin(a) * 7); g.stroke(); }
    g.restore();
    g.fillStyle = "#6a5a55"; g.fillRect(0, 19.4, WW, .6); g.fillStyle = "#7d6a60"; for (let x = 0; x < WW; x += 1.2) g.fillRect(x, 19.4, .6, .6);
    // sidewalks around the blocks: curb, paving joints, light spilling out of the shops
    for (const [x0, x1] of BLOCKS_X) for (const [y0, y1] of BLOCKS_Y) {
      g.fillStyle = "#666973"; g.fillRect(x0 - .9, y0 - .9, x1 - x0 + 1.8, y1 - y0 + 1.8);
      g.strokeStyle = "rgba(0,0,0,.22)"; g.lineWidth = .04;
      for (let x = x0 - .9; x <= x1 + .9; x += .9) { g.beginPath(); g.moveTo(x, y0 - .9); g.lineTo(x, y1 + .9); g.stroke(); }
      for (let y = y0 - .9; y <= y1 + .9; y += .9) { g.beginPath(); g.moveTo(x0 - .9, y); g.lineTo(x1 + .9, y); g.stroke(); }
      g.strokeStyle = "#9da1ab"; g.lineWidth = .14; g.strokeRect(x0 - .9, y0 - .9, x1 - x0 + 1.8, y1 - y0 + 1.8);
      g.strokeStyle = "rgba(255,196,120,.3)"; g.lineWidth = .7; g.strokeRect(x0 - .4, y0 - .4, x1 - x0 + .8, y1 - y0 + .8);
    }
    // lane lines, edge lines, stop lines and crosswalks
    g.strokeStyle = "rgba(255,210,58,.6)"; g.lineWidth = .12; g.setLineDash([1, 1]);
    for (const x of [9.5, 20, 30.5]) { g.beginPath(); g.moveTo(x, 20); g.lineTo(x, FENCE_Y); g.stroke(); }
    for (const y of [32.5, 47.5, 63]) { g.beginPath(); g.moveTo(0, y); g.lineTo(WW, y); g.stroke(); }
    g.setLineDash([]);
    g.fillStyle = "#282a31";
    for (const x of [9.5, 20, 30.5]) for (const y of [32.5, 47.5]) g.fillRect(x - 1.6, y - 1.6, 3.2, 3.2);
    g.fillStyle = "rgba(255,255,255,.62)";
    for (const x of [9.5, 20, 30.5]) for (const y of [32.5, 47.5]) for (let k = -2; k <= 2; k++) {
      g.fillRect(x - 1.5 + (k + 2) * .62, y - 2.45, .36, .75); g.fillRect(x - 1.5 + (k + 2) * .62, y + 1.7, .36, .75);
      g.fillRect(x - 2.45, y - 1.5 + (k + 2) * .62, .75, .36); g.fillRect(x + 1.7, y - 1.5 + (k + 2) * .62, .75, .36);
    }
    for (const x of [9.5, 20, 30.5]) for (let k = -2; k <= 2; k++) { g.fillRect(x - 1.5 + (k + 2) * .62, 20.3, .36, .9); g.fillRect(x - 1.5 + (k + 2) * .62, 60.2, .36, .9); }
    // direction arrows
    g.fillStyle = "rgba(255,255,255,.45)";
    for (const x of [9.5, 20, 30.5]) for (const y of [26, 41, 56]) for (const [dx, up] of [[-.8, 1], [.8, -1]]) {
      g.beginPath(); g.moveTo(x + dx, y - up * .9); g.lineTo(x + dx - .32, y - up * .3); g.lineTo(x + dx - .1, y - up * .3); g.lineTo(x + dx - .1, y + up * .8); g.lineTo(x + dx + .1, y + up * .8); g.lineTo(x + dx + .1, y - up * .3); g.lineTo(x + dx + .32, y - up * .3); g.fill();
    }
    // manhole covers and drains
    for (const [x, y] of [[9, 24.5], [10.2, 39], [20.6, 28], [19.3, 43.5], [30, 38], [31, 54.5], [9.8, 57], [20.5, 53], [4, 32], [15, 33.2], [25.5, 47], [36, 48.2], [14, 62.5], [27, 63.6], [20, 33.4], [30.6, 24]]) {
      g.fillStyle = "#17181c"; g.beginPath(); g.arc(x, y, .38, 0, 7); g.fill();
      g.strokeStyle = "#5d616b"; g.lineWidth = .07; g.beginPath(); g.arc(x, y, .34, 0, 7); g.stroke(); g.beginPath(); g.arc(x, y, .18, 0, 7); g.stroke();
      g.beginPath(); g.moveTo(x - .34, y); g.lineTo(x + .34, y); g.moveTo(x, y - .34); g.lineTo(x, y + .34); g.stroke();
    }
    g.fillStyle = "#15161a"; for (const [x0, x1] of BLOCKS_X) for (const [y0, y1] of BLOCKS_Y) for (const y of [y0 + 2.5, y1 - 2.5]) { if (x0 > 0) g.fillRect(x0 - 1.25, y - .3, .3, .6); if (x1 < WW) g.fillRect(x1 + .95, y - .3, .3, .6); }
    // festival confetti trodden into the street
    for (let k = 0; k < 900; k++) { g.fillStyle = CITY_COLS[k % 5]; g.globalAlpha = .5; g.fillRect(r() * WW, 6.6 + r() * 59, .1, .1); }
    g.globalAlpha = 1;
    // warm pools of light under every lamp
    for (const l of cityLamps()) {
      const x = l.x + l.nx * .5, y = l.y + l.ny * .5, rad = l.post ? 2.6 : 2, gr = g.createRadialGradient(x, y, .1, x, y, rad);
      gr.addColorStop(0, "rgba(255,206,130,.5)"); gr.addColorStop(.45, "rgba(255,190,110,.2)"); gr.addColorStop(1, "rgba(255,190,110,0)");
      g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    // the street outside the gates
    g.fillStyle = "#24272c"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
    for (let k = 0; k < 500; k++) { g.fillStyle = r() < .5 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.16)"; g.fillRect(r() * WW, FENCE_Y + r() * (WH - FENCE_Y), .1 + .2 * r(), .1); }
    g.strokeStyle = "rgba(255,255,255,.4)"; g.lineWidth = .12; g.setLineDash([1.2, 1.2]); g.beginPath(); g.moveTo(0, 69.5); g.lineTo(WW, 69.5); g.stroke(); g.setLineDash([]);
  },
  decor(g) {
    const r = rng(3), box = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x - w / 2, y - h / 2, w, h); };
    for (const { o, type, it, w, d } of cityRoofs()) {
      const x0 = o.x0, y0 = o.y0, x1 = o.x1, y1 = o.y1, cx = (x0 + x1) / 2;
      if (type === "tile") {
        const a = y0 + w / 2, b = y1 - w / 2, poly = (col, ...p) => { g.fillStyle = col; g.beginPath(); p.forEach(([x, y], k) => k ? g.lineTo(x, y) : g.moveTo(x, y)); g.fill(); };
        poly("#d06a44", [x0, y0], [x1, y0], [cx, a]); poly("#a84a30", [x1, y0], [x1, y1], [cx, b], [cx, a]);
        poly("#96412b", [x0, y1], [x1, y1], [cx, b]); poly("#c25c3b", [x0, y0], [x0, y1], [cx, b], [cx, a]);
        g.strokeStyle = "rgba(60,15,5,.28)"; g.lineWidth = .06; for (let k = .3; k < w / 2; k += .3) g.strokeRect(x0 + k, y0 + k, w - 2 * k, d - 2 * k);
        g.strokeStyle = "#f09a6a"; g.lineWidth = .16; g.beginPath(); g.moveTo(x0, y0); g.lineTo(cx, a); g.lineTo(x1, y0); g.moveTo(x0, y1); g.lineTo(cx, b); g.lineTo(x1, y1); g.moveTo(cx, a); g.lineTo(cx, b); g.stroke();
        g.strokeStyle = "#7a3220"; g.lineWidth = .22; g.strokeRect(x0 + .11, y0 + .11, w - .22, d - .22);
      } else if (type === "gravel") {
        g.fillStyle = "#7d828e"; g.fillRect(x0, y0, w, d);
        for (let k = 0; k < 260; k++) { g.fillStyle = r() < .5 ? "rgba(255,255,255,.16)" : "rgba(0,0,0,.2)"; g.fillRect(x0 + .3 + r() * (w - .7), y0 + .3 + r() * (d - .7), .1, .1); }
        g.strokeStyle = "#4b4f59"; g.lineWidth = .1; g.beginPath(); g.moveTo(x0 + .6, y0 + d * .42); g.lineTo(x1 - .6, y0 + d * .42); g.moveTo(x0 + w * .5, y0 + .6); g.lineTo(x0 + w * .5, y1 - .6); g.stroke();
        g.strokeStyle = "#b9bec9"; g.lineWidth = .3; g.strokeRect(x0 + .15, y0 + .15, w - .3, d - .3);
        g.strokeStyle = "#ffd23a"; g.lineWidth = .08; g.beginPath(); g.arc(cx, y0 + d * .42, .9, 0, 7); g.stroke();
      } else if (type === "garden") {
        g.fillStyle = "#8a6f52"; g.fillRect(x0, y0, w, d); g.fillStyle = "#4fa84f"; g.fillRect(x0 + .4, y0 + .4, w - .8, d - .8);
        g.fillStyle = "#62bd5c"; for (let y = y0 + .4; y < y1 - .9; y += 1.2) g.fillRect(x0 + .4, y, w - .8, .6);
        g.fillStyle = "#e6d5a8"; g.fillRect(x0 + .4, y0 + d * .5 - .35, w - .8, .7); g.fillRect(cx - .35, y0 + .4, .7, d - .8);
        g.beginPath(); g.arc(cx, y0 + d * .5, 1.1, 0, 7); g.fill();
        for (let k = 0; k < 70; k++) { const e = (r() * 4) | 0, t = r(); g.fillStyle = ["#ff6fb1", "#ffd23a", "#ffffff", "#ff7a3c"][k % 4]; g.beginPath(); g.arc(e < 2 ? x0 + .7 + t * (w - 1.4) : e === 2 ? x0 + .7 : x1 - .7, e === 0 ? y0 + .7 : e === 1 ? y1 - .7 : y0 + .7 + t * (d - 1.4), .12, 0, 7); g.fill(); }
      } else {
        g.fillStyle = "#c2946a"; g.fillRect(x0, y0, w, d);
        g.strokeStyle = "rgba(60,30,10,.25)"; g.lineWidth = .04; for (let y = y0 + .3; y < y1; y += .3) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); }
        g.strokeStyle = "#e8e2d6"; g.lineWidth = .28; g.strokeRect(x0 + .14, y0 + .14, w - .28, d - .28);
      }
      for (const p of it) {
        if (p.k === "sky") { box(p.x, p.y, 1.5, 1.1, "#22242b"); box(p.x, p.y, 1.2, .8, "#ffe9b0"); g.fillStyle = "#22242b"; g.fillRect(p.x - .03, p.y - .4, .06, .8); }
        else if (p.k === "pool") {
          box(p.x + .15, p.y + .2, p.pw + .5, p.pd + .5, "rgba(0,0,0,.25)"); box(p.x, p.y, p.pw + .5, p.pd + .5, "#f4f1ea"); box(p.x, p.y, p.pw, p.pd, "#2fd8e2");
          for (const lx of [-.3, 0, .3]) for (const s of [-1, 1]) { box(p.x + lx * p.pw * 1.1, p.y + s * (p.pd / 2 + .95), .55, 1.1, "#ffffff"); box(p.x + lx * p.pw * 1.1, p.y + s * (p.pd / 2 + 1.05), .45, .6, ["#ff5fb0", "#ffd23a", "#3f8cff"][Math.round(lx * 3.4) + 1]); }
        }
        else if (p.k === "tree") { g.fillStyle = "#6b5138"; g.beginPath(); g.arc(p.x, p.y, .55, 0, 7); g.fill(); g.fillStyle = "rgba(0,0,0,.28)"; g.beginPath(); g.arc(p.x + .3, p.y + .35, p.big ? 1.3 : .95, 0, 7); g.fill(); }
        else if (p.k === "para") { g.fillStyle = "rgba(0,0,0,.28)"; g.beginPath(); g.arc(p.x + .25, p.y + .3, .9, 0, 7); g.fill(); }
        else if (p.k === "tank") { g.fillStyle = "rgba(0,0,0,.3)"; g.beginPath(); g.arc(p.x + .3, p.y + .35, .85, 0, 7); g.fill(); }
        else if (p.k === "hut") box(p.x + .25, p.y + .3, 1.8, 1.8, "rgba(0,0,0,.3)");
        else if (p.k === "ac") box(p.x + .15, p.y + .2, 1.1, .9, "rgba(0,0,0,.3)");
        else if (p.k === "chim") box(p.x + .15, p.y + .2, .8, .8, "rgba(0,0,0,.3)");
      }
    }
    // stage with LED deck, and fountain
    g.fillStyle = "#121318"; g.fillRect(12, 0, 16, 5);
    g.strokeStyle = "#3a3d47"; g.lineWidth = .08; for (let x = 12; x <= 28; x += 2) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 5); g.stroke(); }
    const led = g.createLinearGradient(12, 0, 28, 0); led.addColorStop(0, "#22d3ee"); led.addColorStop(.5, "#ff3fa4"); led.addColorStop(1, "#ffd23a");
    g.fillStyle = led; g.fillRect(12.5, .3, 15, .5); g.fillRect(12.2, 4.75, 15.6, .18);
    g.fillStyle = "#0e0f12"; for (const o of obs) if (o.kind === "speaker") { g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0); g.strokeStyle = "#3a3d47"; g.lineWidth = .1; g.strokeRect(o.x0 + .15, o.y0 + .15, o.x1 - o.x0 - .3, o.y1 - o.y0 - .3); for (const yy of [.8, 2.2]) { g.fillStyle = "#2b2e36"; g.beginPath(); g.arc((o.x0 + o.x1) / 2, o.y0 + yy, .55, 0, 7); g.fill(); g.fillStyle = "#0e0f12"; } }
    for (const o of obs) if (o.kind === "barrier") { g.lineWidth = o.th; g.strokeStyle = "#16171b"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); g.lineWidth = .1; g.strokeStyle = "#ffd23a"; g.setLineDash([.6, .6]); g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); g.setLineDash([]); }
    g.fillStyle = "#c9ced6"; g.beginPath(); g.arc(20, 13.5, 1.8, 0, 7); g.fill(); g.fillStyle = "#3fa9e0"; g.beginPath(); g.arc(20, 13.5, 1.4, 0, 7); g.fill();
    g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = .07; for (const rad of [.5, .95]) { g.beginPath(); g.arc(20, 13.5, rad, 0, 7); g.stroke(); }
    g.fillStyle = "#e8ecf2"; g.beginPath(); g.arc(20, 13.5, .28, 0, 7); g.fill();
  },
  bulbs: [...Array.from({ length: 12 }, (_, i) => [12.6 + i * 1.35, 5.3]),
          ...[9.5, 20, 30.5].flatMap(x => [22, 27, 37, 42, 52, 57].map(y => [x + (x === 20 ? 2.2 : 0), y]))],
  beams: [{ x: 14, y: 5, a: Math.PI / 2, sweep: .7, h: 7 }, { x: 20, y: 5, a: Math.PI / 2, sweep: .7, h: 7 }, { x: 26, y: 5, a: Math.PI / 2, sweep: .7, h: 7 },
          { x: 3, y: 19, a: 0.4, sweep: .5, h: 20, white: true }, { x: 37, y: 19, a: Math.PI - .4, sweep: .5, h: 20, white: true }],
  extra3D(grp) {
    const steel = mat("#2a2c31", { metalness: .5, roughness: .4 }), glow = basic("#ffd98a"), r = rng(515);
    // lamps: wall lanterns on brackets and thin posts tight against the building corners
    const posts = [], arms = [], heads = [], caps = [];
    for (const l of cityLamps()) {
      if (l.post) { posts.push([.05, 4.1, .05, l.x, 2.05, l.y]); heads.push([.2, .2, .2, l.x, 4.2, l.y]); caps.push([.26, .08, .26, l.x, 4.42, l.y]); }
      else { const x = l.x + l.nx * .38, y = l.y + l.ny * .38; arms.push([l.nx ? .4 : .05, .05, l.nx ? .05 : .4, l.x + l.nx * .2, 3.95, l.y + l.ny * .2]); heads.push([.16, .2, .16, x, 3.72, y]); caps.push([.2, .06, .2, x, 3.93, y]); }
    }
    cityInst(grp, "cyl", steel, posts); cityInst(grp, "box", steel, arms); cityInst(grp, "sph", glow, heads); cityInst(grp, "cyl", steel, caps);
    // warm pools of light on the pavement under every lamp
    if (!CITY_TEX.pool) {
      const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d"), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, "rgba(255,210,140,.55)"); gr.addColorStop(.5, "rgba(255,190,110,.2)"); gr.addColorStop(1, "rgba(255,180,100,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      CITY_TEX.pool = new THREE.CanvasTexture(c);
    }
    const poolM = new THREE.MeshBasicMaterial({ map: CITY_TEX.pool, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }), pools = [];
    for (const h of heads) pools.push([3.6, 1, 3.6, h[3], .05, h[5]]);
    if (pools.length) { const pg = new THREE.PlaneGeometry(1, 1); pg.rotateX(-Math.PI / 2); const im = new THREE.InstancedMesh(pg, poolM, pools.length), M = new THREE.Matrix4(), q = new THREE.Quaternion();
      pools.forEach((a, i) => im.setMatrixAt(i, M.compose(new THREE.Vector3(a[3], a[4], a[5]), q, new THREE.Vector3(a[0], a[1], a[2])))); im.renderOrder = 2; im.frustumCulled = false; grp.add(im); }
    // shop fronts at street level: glowing windows, sign strips and awnings (all flat on the walls, awnings 3 m up)
    const WIN = ["#ffe2a0", "#ffd98a", "#9fe8ff", "#ffc0e0", "#fff1c8"], AWN = ["#d8322b", "#2f6fc4", "#3d9a5b", "#e8a020", "#8a4fbf"];
    const wins = WIN.map(() => []), signs = CITY_COLS.map(() => []), awns = AWN.map(() => []), doors = [];
    for (const wl of cityWalls()) {
      const n = Math.round(wl.len / 2.5), sw = wl.len / n;
      for (let k = 0; k < n; k++) {
        const along = (k + .5) * sw, x = wl.x + (wl.nx ? wl.nx * .03 : along), y = wl.y + (wl.nx ? along : wl.ny * .03), c = (r() * 5) | 0, ww = sw - .55;
        const sz = (a, h, t) => wl.nx ? [t, h, a] : [a, h, t];
        wins[c].push([...sz(ww, 1.75, .08), x, 1.3, y]);
        doors.push([...sz(.12, 1.9, .1), x + (wl.nx ? 0 : ww * .2), 1.25, y + (wl.nx ? ww * .2 : 0)]);
        signs[(r() * 5) | 0].push([...sz(ww, .34, .1), x, 2.5, y]);
        if (r() < .7) awns[(r() * 5) | 0].push([...sz(sw - .25, .09, .55), x + wl.nx * .26, 3.02, y + wl.ny * .26]);
      }
    }
    // shop windows: a lit interior with shelves and a few shoppers' silhouettes, tinted per shop (not a flat white panel)
    if (!CITY_TEX.shopWin) {
      const c = document.createElement("canvas"); c.width = 128; c.height = 96; const g = c.getContext("2d"), q = rng(77);
      const gr = g.createLinearGradient(0, 0, 0, 96); gr.addColorStop(0, "#fff6dc"); gr.addColorStop(1, "#b9a68a"); g.fillStyle = gr; g.fillRect(0, 0, 128, 96);
      g.fillStyle = "rgba(60,45,35,.55)"; for (const y of [26, 50, 74]) g.fillRect(4, y, 120, 4);
      for (let k = 0; k < 40; k++) { g.fillStyle = `hsla(${q() * 360},55%,${45 + q() * 20}%,.75)`; const y = [14, 38, 62][k % 3]; g.fillRect(6 + q() * 112, y + q() * 4, 4 + q() * 6, 10); }
      g.fillStyle = "rgba(40,30,30,.45)"; for (let k = 0; k < 3; k++) { const x = 20 + q() * 90; g.beginPath(); g.arc(x, 58, 7, 0, 7); g.fill(); g.fillRect(x - 8, 64, 16, 32); }
      g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.moveTo(10, 0); g.lineTo(34, 0); g.lineTo(4, 96); g.lineTo(-20, 96); g.fill();   // glass reflection
      g.strokeStyle = "#2a2c31"; g.lineWidth = 4; g.strokeRect(2, 2, 124, 92); g.beginPath(); g.moveTo(64, 0); g.lineTo(64, 96); g.stroke();
      const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; CITY_TEX.shopWin = t;
    }
    WIN.forEach((c, i) => cityInst(grp, "box", new THREE.MeshBasicMaterial({ map: CITY_TEX.shopWin, color: new THREE.Color(c).multiplyScalar(.82), toneMapped: false }), wins[i])); const SHOP_WORDS = ["PIZZA", "24H", "SHOES", "PHONES", "NOODLES", "DONUTS", "TOYS", "VINYL", "SUSHI", "KEBAB"];
    CITY_COLS.forEach((c, i) => [0, 1].forEach(half => {   // shop name boards: two names per color
      const cv2 = document.createElement("canvas"); cv2.width = 256; cv2.height = 40;
      const g = cv2.getContext("2d"); g.fillStyle = c; g.fillRect(0, 0, 256, 40); g.fillStyle = "rgba(0,0,0,.78)"; g.font = "900 30px Rubik, system-ui, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(SHOP_WORDS[(i * 2 + half) % SHOP_WORDS.length], 128, 22); const t = new THREE.CanvasTexture(cv2); t.encoding = THREE.sRGBEncoding;
      cityInst(grp, "box", new THREE.MeshBasicMaterial({ map: t, color: 0xdddddd, toneMapped: false }), signs[i].filter((_, k) => k % 2 === half));
    }));
    AWN.forEach((c, i) => cityInst(grp, "box", mat(c), awns[i])); cityInst(grp, "box", mat("#1c1d22"), doors);
    // string lights high above the streets (4.3 m and up), from building to building
    const bulbs = CITY_COLS.map(() => []), wires = []; let bi = 0;
    const string = (ax, ay, bx, by, h) => {
      wires.push([Math.abs(bx - ax) + .03, .025, Math.abs(by - ay) + .03, (ax + bx) / 2, h + .12, (ay + by) / 2]);
      for (let k = 1; k < 9; k++) { const f = k / 9; bulbs[bi++ % 5].push([.11, .11, .11, ax + (bx - ax) * f, h - Math.sin(f * Math.PI) * .55, ay + (by - ay) * f]); }
    };
    for (let i = 0; i < 3; i++) for (const [y0, y1] of BLOCKS_Y) for (const f of [.12, .37, .63, .88]) string(BLOCKS_X[i][1], y0 + (y1 - y0) * f, BLOCKS_X[i + 1][0], y0 + (y1 - y0) * f, 5.1);
    for (let j = 0; j < 2; j++) for (const [x0, x1] of BLOCKS_X) for (const f of [.25, .75]) string(x0 + (x1 - x0) * f, BLOCKS_Y[j][1], x0 + (x1 - x0) * f, BLOCKS_Y[j + 1][0], 5.1);
    CITY_COLS.forEach((c, i) => cityInst(grp, "sph", basic(c), bulbs[i])); cityInst(grp, "box", mat("#111216"), wires);
    // rooftops
    const grey = mat("#aab0bb", { metalness: .3, roughness: .5 }), dark = mat("#3a3d45"), leaf = [mat("#3f9a4a"), mat("#58b85a"), mat("#2f8048")], fairy = CITY_COLS.map(() => []);
    for (const { o, i, it } of cityRoofs()) {
      const h = o.hb;
      for (const p of it) {
        if (p.k === "tank") { for (const [dx, dy] of [[-.4, -.4], [.4, -.4], [-.4, .4], [.4, .4]]) part(grp, "box", steel, .08, .9, .08, p.x + dx, h + .45, p.y + dy); part(grp, "cyl", "#b0703c", .68, 1.3, .68, p.x, h + 1.55, p.y); part(grp, "cone", "#8a5630", .76, .5, .76, p.x, h + 2.45, p.y); }
        else if (p.k === "ac") { part(grp, "box", grey, 1, .6, .8, p.x, h + .3, p.y); part(grp, "cyl", dark, .27, .04, .27, p.x, h + .62, p.y); }
        else if (p.k === "hut") { part(grp, "box", "#d9d2c4", 1.6, 2, 1.6, p.x, h + 1, p.y); part(grp, "box", dark, 1.8, .12, 1.8, p.x, h + 2.06, p.y); part(grp, "box", basic("#ffd98a"), .6, 1.3, .05, p.x, h + .7, p.y + .81); part(grp, "box", basic("#ffd98a"), .6, 1.3, .05, p.x, h + .7, p.y - .81); }
        else if (p.k === "ant") { part(grp, "cyl", steel, .04, 3.2, .04, p.x, h + 1.6, p.y); part(grp, "box", steel, .9, .04, .04, p.x, h + 2.5, p.y); part(grp, "box", steel, .6, .04, .04, p.x, h + 2.85, p.y); part(grp, "sph", basic("#ff3030"), .12, .12, .12, p.x, h + 3.25, p.y); }
        else if (p.k === "chim") { part(grp, "box", "#a04a32", .6, 1.3, .6, p.x, h + .65, p.y); part(grp, "box", dark, .76, .12, .76, p.x, h + 1.36, p.y); }
        else if (p.k === "tree") { const s = p.big ? 1.35 : 1; part(grp, "cyl", "#7a5536", .12 * s, 1.2 * s, .12 * s, p.x, h + .6 * s, p.y); part(grp, "sph", leaf[i % 3], .85 * s, .75 * s, .85 * s, p.x, h + 1.6 * s, p.y); part(grp, "sph", leaf[(i + 1) % 3], .55 * s, .5 * s, .55 * s, p.x + .25, h + 2.15 * s, p.y - .15); }
        else if (p.k === "para") { part(grp, "cyl", "#e8e8e8", .03, 2, .03, p.x, h + 1, p.y); part(grp, "cone", ["#ff5fb0", "#ffd23a", "#3f8cff"][(p.x * 7 | 0) % 3], 1, .45, 1, p.x, h + 2.1, p.y); }
        else if (p.k === "sky") part(grp, "box", basic("#ffe2a0"), 1.2, .06, .8, p.x, h + .04, p.y);
        else if (p.k === "pool") { part(grp, "box", basic("#2fe6ee"), p.pw, .05, p.pd, p.x, h + .03, p.y); for (const s of [-.3, 0, .3]) part(grp, "box", basic("#b8fbff"), p.pw * .8, .06, .05, p.x, h + .035, p.y + s * p.pd); }
        else if (p.k === "fairy") { for (let k = 0; k < 28; k++) { const a = k / 28 * 6.283, rx = (o.x1 - o.x0) / 2 - .5, ry = (o.y1 - o.y0) / 2 - .5; fairy[k % 5].push([.09, .09, .09, p.x + Math.cos(a) * rx, h + 2.5 + Math.sin(a * 6) * .12, p.y + Math.sin(a) * ry]); }
          for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) part(grp, "cyl", steel, .03, 2.6, .03, p.x + sx * ((o.x1 - o.x0) / 2 - .4), h + 1.3, p.y + sy * ((o.y1 - o.y0) / 2 - .4)); }
        else if (p.k === "bill") {
          for (const dy of [-1.5, 1.5]) part(grp, "box", steel, .1, 2, .1, p.x - p.side * .2, h + 1, p.y + dy);
          part(grp, "box", "#15161a", .16, 2.5, 4.8, p.x - p.side * .12, h + 2.7, p.y).rotation.z = p.side * .3;
          cityPanel(grp, cityAd(p.n), 4.6, 2.3, p.x, h + 2.7, p.y, p.side * Math.PI / 2, .3);
        }
      }
    }
    CITY_COLS.forEach((c, i) => cityInst(grp, "sph", basic(c), fairy[i]));
    // neon signs high on the facades
    [["HOTEL", "#ff5fb0", 7, 25, 1], ["BAR", "#3fe0ff", 12, 40, -1], ["CINEMA", "#ffd23a", 17.5, 24.5, 1], ["JAZZ", "#9dff6a", 22.5, 39.5, -1], ["PIZZA", "#ffb03a", 28, 55, 1], ["24H", "#3fe0ff", 33, 25.5, -1], ["KARAOKE", "#ff5fb0", 33, 54, -1], ["ARCADE", "#9dff6a", 7, 55.5, 1], ["DINER", "#ffb03a", 17.5, 40.5, 1]]
      .forEach(([t, c, x, y, s]) => cityPanel(grp, cityNeon(t, c), 3.3, 1.25, x + s * .09, 4.9, y, s * Math.PI / 2));
    [["CITY FEST", "#ff5fb0", 3.5], ["LIVE TONIGHT", "#3fe0ff", 14.75], ["DANCE", "#ffd23a", 25.25], ["OPEN LATE", "#9dff6a", 36.5]].forEach(([t, c, x]) => cityPanel(grp, cityNeon(t, c), 4, 1.5, x, 4.9, 19.91, Math.PI));
  },
  performers: () => [{ kind: "dj", orbit: [20, 2.8, .01, 0, 0], h: 1.8, x: 0, y: 0, ang: Math.PI / 2, t: 0 },
                     { kind: "ciudad_stage", orbit: [20, 0, 0, 0, -Math.PI / 2], h: 0, x: 20, y: 0, ang: 0, t: 0 }],
};
