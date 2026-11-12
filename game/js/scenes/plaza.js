// Human Tsunami · scene: The Plaza
// ---- visual helpers (look only; nothing here touches the simulation) ----
const PLZ = { fac: {}, awn: {} };
function plzText(g, txt, x, y, size, col) {   // floor text, readable on the rotated wide-screen view
  g.save(); g.translate(x, y); g.rotate(Math.PI / 2); g.font = `900 ${size}px Rubik, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillStyle = col; g.fillText(txt, 0, 0); g.restore();
}
function plzTrussMat() {
  if (PLZ.truss) return PLZ.truss;
  const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d");
  g.strokeStyle = "#aeb4bc"; g.lineWidth = 6; g.beginPath(); g.moveTo(2, 5); g.lineTo(62, 59); g.moveTo(2, 59); g.lineTo(62, 5); g.stroke();
  g.fillStyle = "#dfe3e8"; g.fillRect(0, 0, 64, 10); g.fillRect(0, 54, 64, 10); g.fillRect(0, 0, 5, 64); g.fillRect(59, 0, 5, 64);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return PLZ.truss = new THREE.MeshStandardMaterial({ map: t, alphaTest: .4, side: THREE.DoubleSide, roughness: .4, metalness: .3 });
}
// a square truss beam between two points given as (world x, height, world y)
function plzTruss(grp, ax, ah, ay, bx, bh, by, s) {
  s = s || .5; const d = new THREE.Vector3(bx - ax, bh - ah, by - ay), len = d.length();
  const geo = new THREE.BoxGeometry(len, s, s), uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * len / s);
  const m = new THREE.Mesh(geo, plzTrussMat()); m.position.set((ax + bx) / 2, (ah + bh) / 2, (ay + by) / 2);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), d.normalize()); m.castShadow = true; grp.add(m); return m;
}
function plzFacadeMat(col, trim, sign, shut) {
  const key = col + sign; if (PLZ.fac[key]) return PLZ.fac[key];
  const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d"), r = rng(col.charCodeAt(2) * 7 + sign.length);
  g.fillStyle = col; g.fillRect(0, 0, 256, 256);
  g.fillStyle = "rgba(255,255,255,.08)"; for (let y = 20; y < 160; y += 10) g.fillRect(0, y, 256, 1);
  g.fillStyle = trim; g.fillRect(0, 0, 256, 14); g.fillRect(0, 158, 256, 7);
  for (let rr = 0; rr < 2; rr++) for (let i = 0; i < 5; i++) {
    const x = 18 + i * 48, y = 30 + rr * 64, w = 28, h = 42;
    g.fillStyle = shut; g.fillRect(x - 10, y, 8, h); g.fillRect(x + w + 2, y, 8, h);
    g.fillStyle = "#fffaf0"; g.fillRect(x - 2, y - 2, w + 4, h + 4);
    g.fillStyle = r() < .3 ? "#f6d58a" : "#6fa3c4"; g.fillRect(x, y, w, h);
    g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w * .7, y); g.lineTo(x, y + h * .6); g.fill();
    g.fillStyle = "#fffaf0"; g.fillRect(x + w / 2 - 1, y, 2, h); g.fillRect(x, y + h / 2 - 1, w, 2);
    g.fillStyle = "#7a4a2a"; g.fillRect(x - 4, y + h + 2, w + 8, 5);
    for (let k = 0; k < 6; k++) { g.fillStyle = ["#ff5d8f", "#ffd23f", "#4caf50", "#4caf50"][(r() * 4) | 0]; g.beginPath(); g.arc(x - 2 + k * 6.4, y + h + 1, 3, 0, 7); g.fill(); }
  }
  g.fillStyle = "#26303d"; g.fillRect(10, 188, 156, 58); g.fillRect(222, 188, 26, 44);
  g.fillStyle = "rgba(255,255,255,.18)"; g.beginPath(); g.moveTo(10, 188); g.lineTo(80, 188); g.lineTo(30, 246); g.lineTo(10, 246); g.fill();
  g.fillStyle = "#ffd98a"; for (let k = 0; k < 5; k++) g.fillRect(22 + k * 30, 222, 14, 18);
  g.fillStyle = "#6b4526"; g.fillRect(178, 186, 34, 70); g.fillStyle = "#e3b23c"; g.fillRect(204, 222, 4, 4);
  g.fillStyle = "#1f2430"; g.fillRect(8, 166, 240, 19);
  g.fillStyle = "#ffffff"; g.font = "900 15px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(sign, 128, 176);
  g.fillStyle = "#8a8378"; g.fillRect(0, 248, 178, 8); g.fillRect(212, 248, 44, 8);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
  return PLZ.fac[key] = new THREE.MeshStandardMaterial({ map: t, roughness: .85 });
}
function plzAwnMat(a, b) { const k = a + b; return PLZ.awn[k] || (PLZ.awn[k] = new THREE.MeshStandardMaterial({ map: stripeTex([a, b], 10, true), roughness: .8, side: THREE.DoubleSide })); }
// building: face = 0 (+x), 1 (-x), 4 (+y world), 5 (-y world) gets the painted facade
function plzBuilding(grp, x0, x1, y0, y1, h, col, trim, sign, shut, face) {
  const wall = mat(col), mats = [wall, wall, mat("#b5583a"), wall, wall, wall]; mats[face] = plzFacadeMat(col, trim, sign, shut);
  const m = new THREE.Mesh(GEO.box, mats); m.scale.set(x1 - x0, h, y1 - y0); m.position.set((x0 + x1) / 2, h / 2, (y0 + y1) / 2); m.castShadow = true; grp.add(m);
  part(grp, "box", "#b5583a", x1 - x0 + .5, .25, y1 - y0 + .5, (x0 + x1) / 2, h + .12, (y0 + y1) / 2);
}
// big LED wall behind the band: one tiny canvas repainted a few times per second
SCENE_MODELS.plaza_screen = (g, u, m) => {
  const c = document.createElement("canvas"); c.width = 72; c.height = 22; const x = c.getContext("2d");
  const tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding; tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
  const scr = part(g, "box", new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), .1, 5, 16.4, 0, 3.4, 0); scr.castShadow = false;
  let last = -1;
  u.anim = tt => {
    const f = Math.floor(tt * 10); if (f === last) return; last = f;
    const mode = Math.floor(tt / 5) % 3, hue = (tt * 40) % 360;
    const gr = x.createLinearGradient(0, 0, 72, 22); gr.addColorStop(0, `hsl(${hue},85%,45%)`); gr.addColorStop(1, `hsl(${(hue + 90) % 360},85%,35%)`);
    x.fillStyle = gr; x.fillRect(0, 0, 72, 22);
    if (mode === 0) { for (let i = 0; i < 18; i++) { const h = 3 + Math.abs(Math.sin(tt * 5 + i * 1.3) * Math.cos(tt * 2.1 + i * .6)) * 17; x.fillStyle = `hsl(${(hue + 180 + i * 9) % 360},100%,68%)`; x.fillRect(i * 4 + 1, 22 - h, 3, h); } }
    else if (mode === 1) { for (let k = 0; k < 5; k++) { const rr = ((tt * 9 + k * 5) % 25) * 1.6; x.strokeStyle = `hsl(${(hue + 150 + k * 30) % 360},100%,72%)`; x.lineWidth = 2; x.beginPath(); x.arc(36, 11, rr, 0, 7); x.stroke(); } }
    else { for (let i = 0; i < 9; i++) { x.fillStyle = (i + f) % 2 ? "rgba(255,255,255,.22)" : "rgba(0,0,0,.18)"; x.fillRect(i * 8, 0, 8, 22); } }
    if (mode !== 0 || f % 4 < 3) { x.fillStyle = "#ffffff"; x.font = "900 11px Rubik, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(mode === 2 ? "LIVE!" : "PLAZA FEST", 36, mode === 0 ? 6 : 11); }
    tex.needsUpdate = true;
  };
};
// the band: toy musicians that bounce with the beat
SCENE_MODELS.plaza_band = (g, u, m) => {
  const b = pivot(g, 0, m.role === "drums" ? -.35 : 0, 0), y0 = b.position.y, dark = "#22242a";
  if (m.role !== "drums") for (const s of [-1, 1]) part(b, "cyl", dark, .07, .8, .07, 0, .4, s * .1);
  part(b, "sph", m.col, .2, .38, .26, 0, 1.15, 0);
  part(b, "sph", "#e0ac84", .15, .15, .15, .02, 1.65, 0);
  part(b, "sph", m.hair || "#2b1d14", .16, .12, .16, -.03, 1.74, 0);
  const arms = [-1, 1].map(s => { const p = pivot(b, 0, 1.38, s * .27); part(p, "cyl", m.col, .055, .5, .055, 0, -.25, 0); part(p, "sph", "#e0ac84", .07, .07, .07, 0, -.52, 0); return p; });
  if (m.role === "guitar" || m.role === "bass") {
    const gt = pivot(b, .22, 1.0, 0); gt.rotation.x = .5;
    part(gt, "box", m.inst || "#e53229", .1, .42, .34, 0, 0, 0); part(gt, "box", "#3a2a1c", .05, .08, .75, 0, .05, -.5);
    arms[0].rotation.z = 1.0; arms[1].rotation.z = .7;
  }
  if (m.role === "sing") { arms[1].rotation.z = 2.2; part(arms[1], "sph", "#111214", .07, .1, .07, 0, -.62, 0); }
  if (m.role === "drums") for (const p of arms) part(p, "cyl", "#e8d2a0", .018, .5, .018, .18, -.6, 0).rotation.z = 1.2;
  if (m.role === "keys") arms.forEach(p => { p.rotation.z = 1.1; });
  const ph = m.orbit[0] * .7;
  u.anim = tt => {
    b.position.y = y0 + Math.abs(Math.sin(tt * 6.2 + ph)) * (m.role === "drums" ? .05 : .16);
    if (m.role === "drums") arms.forEach((p, i) => { p.rotation.z = .9 + Math.sin(tt * 12.4 + i * Math.PI) * .5; });
    else if (m.role === "sing") { b.rotation.y = Math.sin(tt * 1.1) * 1.3; arms[0].rotation.z = 2.4 + Math.sin(tt * 6.2) * .5; }
    else if (m.role === "keys") arms.forEach((p, i) => { p.rotation.z = 1.1 + Math.sin(tt * 9 + i * 2) * .25; });
    else { b.rotation.y = Math.sin(tt * 1.6 + ph) * .5; arms[1].rotation.z = .7 + Math.sin(tt * 12.4) * .3; }
  };
};
SCENES.plaza = {
  name: "The Plaza", tag: "Free concert", outside: "#a39a8b", bulbH: 1.95,
  light: { sky: 0xfff1dc, ground: 0x9c8462, hemi: .68, sun: 0xffe3b5, sunI: 1.35 }, crowd: 3200, fenceBudget: 60, maxGates: 5, gates: [F, F, T, F, T, F, F],
  intro: "Free concert in the plaza today. Also passing through the plaza: cars, dogs and giant beach balls.",
  acts: ["They're playing the hit!", "Everybody to the front!", "Drop the bass!", "Shoving time!"],
  events: ["car", "dogs", "beachballs", "icecream", "car", "dogs"],
  goal: o => o.kind === "barrier", goalMaxY: 30,
  build() {
    rect(6, 0, 34, 11, "stage");
    rect(2.6, 7.4, 4.8, 9.6, "speaker"); rect(35.2, 7.4, 37.4, 9.6, "speaker");
    rect(18.6, 11, 21.4, 18.5, "catwalk");
    circ(RING.x, RING.y, 3.2, "platform");
    seg(0, 12.6, 17, 12.6, .5, "barrier"); seg(23, 12.6, WW, 12.6, .5, "barrier");
    seg(17, 12.6, 17, 18.4, .5, "barrier"); seg(23, 12.6, 23, 18.4, .5, "barrier");
    ringSegs(RING.x, RING.y, RING.r, 12, "barrier", (x, y) => y < RING.y - 2.5 && Math.abs(x - RING.x) < 3);
    rect(17.5, 39.5, 22.5, 44.5, "tent");
    rect(2.5, 52, 5.5, 55, "booth");
    rect(34.5, 52, 37.5, 55, "aid");
  },
  ground(g, px) {
    // warm stone paving: big slabs with joints and a little colour variation
    const rand = rng(11);
    g.fillStyle = "#d4c8b2"; g.fillRect(0, 0, WW, FENCE_Y);
    for (let y = 0; y < FENCE_Y; y += 2) for (let x = (y / 2) % 2 ? -1 : 0; x < WW; x += 2) {
      g.fillStyle = ["#d9cdb8", "#d2c5ae", "#dccfba", "#cfc1a8", "#d5c9b3"][(rand() * 5) | 0]; g.fillRect(x + .04, y + .04, 1.92, 1.92);
    }
    g.lineWidth = .07; g.strokeStyle = "rgba(110,92,66,.35)"; g.beginPath();
    for (let y = 0; y <= FENCE_Y; y += 2) { g.moveTo(0, y); g.lineTo(WW, y); }
    for (let y = 0; y < FENCE_Y; y += 2) for (let x = (y / 2) % 2 ? 1 : 0; x <= WW; x += 2) { g.moveTo(x, y); g.lineTo(x, y + 2); }
    g.stroke();
    // decorative rosette around the round platform
    for (let r = 9.5; r > 4; r -= 1.1) { g.strokeStyle = r % 2.2 < 1.1 ? "rgba(166,92,52,.45)" : "rgba(240,232,214,.7)"; g.lineWidth = .5; g.beginPath(); g.arc(RING.x, RING.y, r, 0, 7); g.stroke(); }
    for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283; g.strokeStyle = "rgba(166,92,52,.35)"; g.lineWidth = .12; g.beginPath(); g.moveTo(RING.x + Math.cos(a) * 5, RING.y + Math.sin(a) * 5); g.lineTo(RING.x + Math.cos(a) * 9.5, RING.y + Math.sin(a) * 9.5); g.stroke(); }
    // worn patches, drains, confetti
    for (let k = 0; k < 60; k++) { g.fillStyle = "rgba(90,70,45,.06)"; g.beginPath(); g.ellipse(rand() * WW, 14 + rand() * 50, .6 + rand() * 2.2, .4 + rand() * 1.4, rand() * 3, 0, 7); g.fill(); }
    for (const [x, y] of [[6, 30], [34, 30], [10, 58], [30, 58], [20, 62]]) { g.fillStyle = "#6d6a63"; g.fillRect(x - .45, y - .45, .9, .9); g.strokeStyle = "#3f3d39"; g.lineWidth = .06; for (let k = -.3; k <= .3; k += .15) { g.beginPath(); g.moveTo(x - .35, y + k); g.lineTo(x + .35, y + k); g.stroke(); } }
    const conf = ["#ff9ec7", "#9be7ff", "#ffe48a", "#b9a6ff", "#ffb38a", "#ffffff"];
    for (let k = 0; k < 1200; k++) { g.fillStyle = conf[k % conf.length]; g.globalAlpha = .6; g.fillRect(rand() * WW, rand() * FENCE_Y, .09, .09); }
    g.globalAlpha = 1;
    hazardLine(g, 20, 26.3, 20, 37, .18); hazardLine(g, 0, 50, 13, 50, .18); hazardLine(g, 27, 48.5, WW, 48.5, .18);
    // exit markings by the gates
    g.fillStyle = "rgba(255,255,255,.7)";
    for (let i = 0; i < SLOTS; i++) { const x = slotX(i); g.beginPath(); g.moveTo(x, 64.6); g.lineTo(x - .7, 63.4); g.lineTo(x + .7, 63.4); g.fill(); }
    // the street outside the gates
    g.fillStyle = "#3d3f44"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
    g.fillStyle = "#8f8c86"; g.fillRect(0, FENCE_Y, WW, 1.1);
    g.fillStyle = "rgba(255,255,255,.8)"; for (let x = 1; x < WW; x += 3) g.fillRect(x, 69.2, 1.6, .16);
    for (let k = 0; k < 6; k++) g.fillRect(17 + k * 1.1, 67.6, .55, 3.6);
  },
  decor(g) {
    // stage deck, painted on top of the stage block
    g.fillStyle = "#2b2d33"; g.fillRect(6, 0, 28, 11);
    g.fillStyle = "#383b43"; for (let x = 6; x < 34; x += 1.2) g.fillRect(x + .05, 0, 1.1, 11);
    g.fillStyle = "#e9b923"; g.fillRect(6, 10.6, 28, .4);
    g.fillStyle = "#151617"; for (const [x, y, w, h] of [[8, 2.2, 2.6, 1.6], [29.4, 2.2, 2.6, 1.6], [12, 8, 1.4, .8], [26.6, 8, 1.4, .8], [16, 8.6, 1, .7], [23, 8.6, 1, .7]]) g.fillRect(x, y, w, h);   // amps and wedges
    g.strokeStyle = "#151617"; g.lineWidth = .06; for (let k = 0; k < 7; k++) { g.beginPath(); g.moveTo(8 + k * 3.6, 10.5); g.quadraticCurveTo(10 + k * 3, 6, 19 + (k % 3), 4); g.stroke(); }   // cables
    for (const o of obs) if (o.kind === "speaker") { g.fillStyle = "#151617"; g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0); g.fillStyle = "#3a3d45"; g.beginPath(); g.arc((o.x0 + o.x1) / 2, (o.y0 + o.y1) / 2, .7, 0, 7); g.fill(); }
    g.fillStyle = "#33363d"; g.fillRect(18.6, 11, 2.8, 8); g.fillStyle = "#e9b923"; g.fillRect(18.6, 11, .12, 8); g.fillRect(21.28, 11, .12, 8);
    g.fillStyle = "#2b2d33"; g.beginPath(); g.arc(RING.x, RING.y, 3.2, 0, 7); g.fill();
    g.strokeStyle = "#e9b923"; g.lineWidth = .25; g.beginPath(); g.arc(RING.x, RING.y, 2.9, 0, 7); g.stroke();
    g.strokeStyle = "#ff3fa4"; g.lineWidth = .12; g.beginPath(); g.arc(RING.x, RING.y, 1.6, 0, 7); g.stroke();
    for (const o of obs) if (o.kind === "barrier") {
      g.lineCap = "square"; g.lineWidth = o.th; g.strokeStyle = "#5c6068"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke();
      g.lineWidth = o.th * .35; g.strokeStyle = "#c9ced6"; g.stroke();
    }
    // white tent with a striped roof, info booth and first aid
    g.fillStyle = "#f6f2ea"; g.fillRect(17.5, 39.5, 5, 5);
    for (let k = 0; k < 4; k++) { g.fillStyle = k % 2 ? "#e53229" : "#ffffff"; g.beginPath(); g.moveTo(20, 42); const a0 = k * Math.PI / 2; g.lineTo(20 + Math.cos(a0) * 3.6, 42 + Math.sin(a0) * 3.6); g.lineTo(20 + Math.cos(a0 + Math.PI / 2) * 3.6, 42 + Math.sin(a0 + Math.PI / 2) * 3.6); g.fill(); }
    g.fillStyle = "#2f7fd6"; g.fillRect(2.5, 52, 3, 3); g.fillStyle = "#ffffff"; g.font = "900 .9px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("i", 4, 53.5);
    g.fillStyle = "#f2f2ef"; g.fillRect(34.5, 52, 3, 3);
    g.fillStyle = "#d8322b"; g.fillRect(35.75, 52.6, .5, 1.8); g.fillRect(35.1, 53.25, 1.8, .5);
  },
  bulbs: Array.from({ length: 14 }, (_, i) => [7 + i * 2, 11.25]),
  beams: Array.from({ length: 6 }, (_, i) => ({ x: 8 + i * 4.8, y: 11, a: Math.PI / 2, sweep: .65 })),
  extra3D(grp) {
    // truss roof over the stage on four towers, with a row of hanging lights
    const H = 8.5, top = H + 1.8;
    for (const [x, y] of [[6.4, .6], [33.6, .6], [6.4, 10.4], [33.6, 10.4]]) plzTruss(grp, x, 1.8, y, x, top, y, .55);
    plzTruss(grp, 6.4, top, .6, 33.6, top, .6, .55); plzTruss(grp, 6.4, top, 10.4, 33.6, top, 10.4, .55);
    plzTruss(grp, 6.4, top, .6, 6.4, top, 10.4, .55); plzTruss(grp, 33.6, top, .6, 33.6, top, 10.4, .55);
    plzTruss(grp, 6.4, top - .4, 7, 33.6, top - .4, 7, .4);
    const lamp = mat("#1c1d21", { metalness: .6, roughness: .4 });
    for (let i = 0; i < 12; i++) {
      const x = 8.2 + i * 2.15, c = ["#ff5fb0", "#5fd8ff", "#ffe066", "#b98bff"][i % 4];
      part(grp, "cyl", lamp, .22, .45, .22, x, top - .85, 7); part(grp, "sph", basic(c), .16, .1, .16, x, top - 1.1, 7);
      part(grp, "cyl", lamp, .2, .4, .2, x, top - .5, 10.4); part(grp, "sph", basic("#fff3c4"), .14, .09, .14, x, top - .72, 10.4);
    }
    // roof canopy (dark, high above the band)
    const roof = part(grp, "box", mat("#24262c", { roughness: .7 }), 27.4, .12, 10, 20, top + .45, 5.5); roof.castShadow = true;
    // speaker towers on the stage wings
    for (const x of [8.4, 31.6]) for (let k = 0; k < 4; k++) { part(grp, "box", "#16171a", 1.4, .9, 1.2, x, 1.8 + .45 + k * .95, 2.2); part(grp, "cyl", "#3a3d45", .32, .05, .32, x, 1.8 + .45 + k * .95, 2.82).rotation.x = Math.PI / 2; }
    // drum riser, keyboard and mic stands
    part(grp, "box", "#3a3d45", 4.2, .35, 2.8, 20, 1.98, 3.4);
    part(grp, "box", "#151617", 1.6, .1, .5, 26, 2.7, 5.2); for (const s of [-1, 1]) part(grp, "cyl", "#8a8f99", .03, .9, .03, 26 + s * .6, 2.25, 5.2);
    for (const x of [14, 20, 24]) { part(grp, "cyl", "#8a8f99", .025, 1.5, .025, x, 2.55, 8.2); part(grp, "sph", "#111214", .07, .1, .07, x, 3.35, 8.2); }
    // café facades lining both sides of the square, outside the venue walls
    const shops = [["#f2c57c", "#c0583b", "CAFÉ", "#2f6b5a"], ["#a9cfe0", "#2f5d8a", "BAKERY", "#c0583b"], ["#f0a6a0", "#8a2f3b", "TACOS", "#2f6b5a"], ["#cfe3b0", "#4f7a32", "BOOKS", "#7a4a2a"], ["#f5e0b0", "#9a6a2a", "GELATO", "#2f5d8a"], ["#d6c2ea", "#5f3d8a", "RECORDS", "#c0583b"]];
    for (let k = 0; k < 6; k++) {
      const [col, trim, sign, shut] = shops[k], y0 = 2 + k * 10.6, y1 = y0 + 10, h = 9 + (k % 3) * 2.5;
      plzBuilding(grp, -7, -.3, y0, y1, h, col, trim, sign, shut, 0);
      const [c2, t2, s2, sh2] = shops[(k + 3) % 6]; plzBuilding(grp, 40.3, 47, y0, y1, h + ((k + 1) % 2) * 2, c2, t2, s2, sh2, 1);
      // striped awnings over the shop windows
      for (const [x, s] of [[-.3, 1], [40.3, -1]]) { const aw = new THREE.Mesh(GEO.box, plzAwnMat(k % 2 ? "#e53229" : "#2f7fd6", "#ffffff")); aw.scale.set(1.6, .08, 6); aw.position.set(x + s * .8, 3.2, (y0 + y1) / 2 - 1.5); aw.rotation.z = s * -.35; aw.castShadow = true; grp.add(aw); }
    }
    // bunting high over the square
    const flags = ["#ff4d6d", "#ffd23a", "#4fd8ff", "#7dff6a", "#c77dff"];
    for (const y of [22, 34, 46]) for (let i = 0; i < 20; i++) {
      const x = 1 + i * 2, sag = Math.sin(i / 19 * Math.PI) * 1.2;
      const f = part(grp, "cone", flags[(i + y) % 5], .32, .55, .06, x, 6.6 - sag, y); f.rotation.x = Math.PI;
    }
    // lamp posts hugging the walls
    for (const x of [.35, 39.65]) for (const y of [20, 32, 44, 56]) { part(grp, "cyl", "#2a2c31", .07, 4.2, .07, x, 2.1, y); part(grp, "sph", basic("#ffe6a8"), .22, .26, .22, x, 4.3, y); }
  },
  performers: () => [
    { kind: "plaza_screen", orbit: [20, .45, .01, 0, 0], h: 1.8, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "plaza_band", role: "sing", col: "#ff3fa4", hair: "#ffd23a", orbit: [20, 7.4, .01, 0, 0], h: 1.8, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "plaza_band", role: "guitar", col: "#2f7fd6", inst: "#e53229", orbit: [15.5, 6.6, .01, 0, 0], h: 1.8, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "plaza_band", role: "bass", col: "#151617", inst: "#ffd23a", hair: "#c0583b", orbit: [24.5, 6.6, .01, 0, 0], h: 1.8, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "plaza_band", role: "drums", col: "#7dff6a", orbit: [20, 3.4, .01, 0, 0], h: 2.15, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "plaza_band", role: "keys", col: "#ffd23a", orbit: [26, 4.6, .01, 0, 0], h: 1.8, x: 0, y: 0, ang: 0, t: 0 },
  ],

};
