// Human Tsunami · scene: The Cruise (deck party)
// ---- visual helpers (look only; nothing here touches the simulation) ----
const CRU = {};
function cruWaterTex() {   // tileable sea texture with wave crests, scrolled every frame
  if (CRU.tex) return CRU.tex;
  const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d"), r = rng(21);
  const gr = g.createLinearGradient(0, 0, 256, 256); gr.addColorStop(0, "#1468a8"); gr.addColorStop(.5, "#1b7cc0"); gr.addColorStop(1, "#135f9c"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  for (let k = 0; k < 90; k++) {
    const x = r() * 256, y = r() * 256, w = 10 + r() * 26;
    for (const [dx, dy] of [[0, 0], [256, 0], [-256, 0], [0, 256], [0, -256]]) {
      g.strokeStyle = `rgba(255,255,255,${.12 + r() * .25})`; g.lineWidth = 1.5 + r() * 2;
      g.beginPath(); g.moveTo(x + dx - w / 2, y + dy); g.quadraticCurveTo(x + dx, y + dy - 4, x + dx + w / 2, y + dy); g.stroke();
    }
  }
  for (let k = 0; k < 400; k++) { g.fillStyle = `rgba(160,220,255,${r() * .18})`; g.fillRect(r() * 256, r() * 256, 2, 2); }
  const t = CRU.tex = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(36, 36); return t;
}
function cruFoamTex() {
  if (CRU.foam) return CRU.foam;
  const c = document.createElement("canvas"); c.width = 64; c.height = 256; const g = c.getContext("2d"), r = rng(4);
  for (let k = 0; k < 260; k++) { const x = r() * 64, y = r() * 256, rr = 2 + r() * 6; g.fillStyle = `rgba(255,255,255,${(1 - x / 64) * (.5 + r() * .5)})`; g.beginPath(); g.arc(x * .9, y, rr, 0, 7); g.fill(); }
  const t = CRU.foam = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
// the open sea around the ship, with foam churning along the hull
SCENE_MODELS.cru_sea = (g, u) => {
  const tex = cruWaterTex(), sea = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), waterify(new THREE.MeshStandardMaterial({ map: tex, roughness: .14, metalness: .1 }), 1));
  sea.rotation.x = -Math.PI / 2; sea.position.set(0, -.02, 0); sea.receiveShadow = true; g.add(sea);
  const ft = cruFoamTex(), foams = [];
  for (const [x, flip] of [[-2.2, 1], [WW + 2.2, -1]]) {   // the group sits at the venue center: offsets are relative
    const mtl = new THREE.MeshBasicMaterial({ map: ft.clone(), transparent: true, depthWrite: false, opacity: .9 }); mtl.map.needsUpdate = true; mtl.map.repeat.set(1, 6);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(4.4, SH + 30), mtl); f.rotation.x = -Math.PI / 2; f.rotation.z = flip > 0 ? 0 : Math.PI; f.position.set(x - WW / 2, .02, 0); g.add(f); foams.push(mtl);
  }
  const bow = new THREE.MeshBasicMaterial({ map: ft.clone(), transparent: true, depthWrite: false }); bow.map.needsUpdate = true; bow.map.repeat.set(5, 1);
  const bw = new THREE.Mesh(new THREE.PlaneGeometry(WW + 16, 6), bow); bw.rotation.x = -Math.PI / 2; bw.rotation.z = Math.PI / 2; bw.scale.set(1, 1, 1); bw.position.set(0, .02, -SH / 2 - 9); bw.rotation.z = 0; g.add(bw);
  u.anim = tt => {
    tex.offset.set(tt * .006, tt * .025);
    foams.forEach((m, i) => { m.map.offset.y = tt * .09 * (i ? -1 : 1); m.opacity = .75 + Math.sin(tt * 1.7 + i) * .15; });
    bow.map.offset.x = tt * .05; bow.opacity = .6 + Math.sin(tt * 2.1) * .2;
  };
};
// funnel smoke
SCENE_MODELS.cru_smoke = (g, u, m) => { let next = 0; u.anim = tt => { if (tt > next) { next = tt + .35; puff(m.x + (Math.random() - .5) * .4, m.y, 15.5, "#e9edf2", .7, 4.5, 1.4); } }; };
// floating pool toys that bob and drift in little circles
SCENE_MODELS.cru_float = (g, u, m) => {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.55, .2, 8, 18), mat(m.col, { roughness: .35 })); ring.rotation.x = Math.PI / 2; ring.castShadow = true; g.add(ring);
  if (m.duck) { part(g, "sph", "#ffd23a", .35, .3, .3, 0, .3, 0); part(g, "sph", "#ffd23a", .2, .2, .2, .25, .55, 0); part(g, "cone", "#ff8a1a", .07, .14, .07, .45, .55, 0).rotation.z = -Math.PI / 2; }
  u.anim = tt => { g.position.y = .2 + Math.sin(tt * 2 + m.orbit[4]) * .06; ring.rotation.z = tt * .4; };
};
SCENES.crucero = {
  name: "The Cruise", tag: "Party on the high seas", outside: "#1d6fa5", bulbH: 1.6, music: "tropical",
  light: { sky: 0xeaf6ff, ground: 0x5b7286, hemi: .6, sun: 0xfff4e0, sunI: 1.3 }, crowd: 2600, fenceBudget: 60, maxGates: 5, guards: 3,
  gates: [F, F, T, F, T, F, F], noSlots: [0, 6], slotWhy: "That's the ship's hull", unlock: 4,
  intro: "Deck party with a pool in the middle. The sea rocks the ship from side to side and the seagulls respect no one.",
  acts: ["Party on the high seas!", "Everybody in the pool!", "Hands in the air!", "Captain, crank it up!"],
  events: ["oleaje", "gaviotas", "flamenco", "bocina", "oleaje", "gaviotas", "flamenco"],
  goal: o => o.kind === "barrier", goalMaxY: 20,
  build() {
    rect(0, 0, 3, FENCE_Y, "hull"); rect(WW - 3, 0, WW, FENCE_Y, "hull"); rect(0, 0, WW, 2.5, "hull");
    seg(3, 11, 12, 2.5, 1, "hull"); seg(WW - 3, 11, WW - 12, 2.5, 1, "hull");
    rect(13, 2.5, 27, 8, "stage");
    seg(5.6, 9.6, WW - 5.6, 9.6, .5, "barrier");
    rect(14, 30, 26, 42, "pool");
    circ(8, 36, 1.7, "jacuzzi"); circ(32, 36, 1.7, "jacuzzi");
    for (const x of [6, 9.5, 29.5, 33]) for (let y = 47; y < 58; y += 3.2) rect(x, y, x + 1, y + 2, "lounger");
    rect(16, 52, 24, 55, "bar");
  },
  ground(g) {
    // sea with waves
    g.fillStyle = "#1d6fa5"; g.fillRect(0, 0, WW, WH);
    const rand = rng(5);
    g.strokeStyle = "rgba(255,255,255,.18)"; g.lineWidth = .12;
    for (let k = 0; k < 260; k++) { const x = rand() * WW, y = rand() * WH; g.beginPath(); g.arc(x, y, .8 + rand(), Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    // teak deck
    g.fillStyle = "#b98a57"; g.fillRect(3, 2.5, WW - 6, FENCE_Y - 2.5);
    g.strokeStyle = "rgba(80,50,25,.35)"; g.lineWidth = .05;
    for (let x = 3; x < WW - 3; x += .4) { g.beginPath(); g.moveTo(x, 2.5); g.lineTo(x, FENCE_Y); g.stroke(); }
    for (let y = 4, i = 0; y < FENCE_Y; y += 3, i++) for (let x = 3 + (i % 2) * .2; x < WW - 3; x += .8) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + .4, y); g.stroke(); }
    // boarding dock
    g.fillStyle = "#9a9c98"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
    g.fillStyle = "#e8b631"; for (let x = 1; x < WW; x += 3) g.fillRect(x, 70.6, 1.5, .25);
  },
  decor(g) {
    // white hull with a blue stripe and portholes
    const hull = (x0, y0, x1, y1) => { g.fillStyle = "#f4f4f2"; g.fillRect(x0, y0, x1 - x0, y1 - y0); };
    hull(0, 0, 3, FENCE_Y); hull(WW - 3, 0, WW, FENCE_Y); hull(0, 0, WW, 2.5);
    g.fillStyle = "#1f4fa8"; g.fillRect(.4, 0, .5, FENCE_Y); g.fillRect(WW - .9, 0, .5, FENCE_Y);
    g.fillStyle = "#2b5a8a"; for (let y = 4; y < FENCE_Y; y += 2.4) { g.beginPath(); g.arc(1.9, y, .3, 0, 7); g.arc(WW - 1.9, y, .3, 0, 7); g.fill(); }
    // bow
    g.fillStyle = "#1d6fa5"; g.beginPath(); g.moveTo(0, 0); g.lineTo(12, 0); g.lineTo(0, 13); g.fill(); g.beginPath(); g.moveTo(WW, 0); g.lineTo(WW - 12, 0); g.lineTo(WW, 13); g.fill();
    for (const o of obs) if (o.kind === "hull" && o.t === "s") { g.lineWidth = 1.2; g.strokeStyle = "#f4f4f2"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
    // stage with striped awning
    for (let x = 13, i = 0; x < 27; x += 1, i++) { g.fillStyle = i % 2 ? "#ffffff" : "#1f8fd6"; g.fillRect(x, 2.5, 1, 5.5); }
    for (const o of obs) if (o.kind === "barrier") { g.lineWidth = o.th; g.strokeStyle = "#e6e6e3"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
    // pool, hot tubs, sun loungers and bar
    g.fillStyle = "#ffffff"; g.fillRect(13.6, 29.6, 12.8, 12.8);
    const water = g.createLinearGradient(14, 30, 26, 42); water.addColorStop(0, "#5fd3f0"); water.addColorStop(1, "#1aa3d6");
    g.fillStyle = water; g.fillRect(14, 30, 12, 12);
    g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = .08; for (let y = 31; y < 42; y += 1.3) { g.beginPath(); g.moveTo(14.4, y); g.quadraticCurveTo(20, y + .5, 25.6, y); g.stroke(); }
    for (const o of obs) if (o.kind === "jacuzzi") { g.fillStyle = "#ffffff"; g.beginPath(); g.arc(o.x, o.y, o.r + .3, 0, 7); g.fill(); g.fillStyle = "#6fe0f5"; g.beginPath(); g.arc(o.x, o.y, o.r, 0, 7); g.fill(); }
    for (const o of obs) if (o.kind === "lounger") { g.fillStyle = "#ffffff"; g.fillRect(o.x0, o.y0, 1, 2); g.fillStyle = "#1f8fd6"; g.fillRect(o.x0 + .15, o.y0 + .2, .7, 1.2); }
    g.fillStyle = "#6b4a2b"; g.fillRect(16, 52, 8, 3); g.fillStyle = "#f2c230"; g.fillRect(16.3, 52.3, 7.4, .5);
    // lido deck markings: shuffleboard courts, pool deck tiles, a big painted logo
    g.strokeStyle = "rgba(255,255,255,.7)"; g.lineWidth = .1;
    for (const x of [5.5, 32.5]) { g.strokeRect(x, 14, 2, 10); g.beginPath(); for (let k = 1; k < 4; k++) { g.moveTo(x, 14 + k * 2.5); g.lineTo(x + 2, 14 + k * 2.5); } g.stroke(); }
    g.fillStyle = "#e8e2d4"; g.fillRect(12.6, 28.6, 14.8, 1); g.fillRect(12.6, 42.4, 14.8, 1); g.fillRect(12.6, 28.6, 1, 14.8); g.fillRect(26.4, 28.6, 1, 14.8);
    g.fillStyle = "#1f8fd6"; for (let x = 12.6; x < 27.4; x += 1) { g.fillRect(x, 28.6, .5, .5); g.fillRect(x + .5, 42.9, .5, .5); }
    g.save(); g.translate(20, 22); g.rotate(Math.PI / 2); g.font = "900 2.2px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = "rgba(255,255,255,.55)"; g.fillText("LIDO DECK", 0, 0); g.restore();
    g.fillStyle = "rgba(0,0,0,.06)"; for (let k = 0; k < 40; k++) g.fillRect(3 + (k * 7.3) % 34, 12 + (k * 13.7) % 52, .4, .4);
    // life rings
    for (const [x, y] of [[4, 20], [36, 20], [4, 45], [36, 45]]) { g.strokeStyle = "#ff6a2c"; g.lineWidth = .3; g.beginPath(); g.arc(x, y, .55, 0, 7); g.stroke(); }
  },
  bulbs: [...Array.from({ length: 22 }, (_, i) => [3.5, 12 + i * 2.4]), ...Array.from({ length: 22 }, (_, i) => [WW - 3.5, 12 + i * 2.4])],
  beams: Array.from({ length: 4 }, (_, i) => ({ x: 15 + i * 3.4, y: 8, a: Math.PI / 2, sweep: .55, h: 6 })),
  extra3D(grp) {
    const white = mat("#f4f4f2", { roughness: .5 }), navy = mat("#1f4fa8"), steel = mat("#c9ced6", { metalness: .6, roughness: .35 });
    // hull sides dropping into the sea, outside the deck
    for (const x of [-.25, WW + .25]) { part(grp, "box", white, .5, 3.2, SH + 14, x, -1.4, SH / 2 - 7); part(grp, "box", navy, .52, .45, SH + 14, x, -.2, SH / 2 - 7); }
    // railings on top of the hull walls
    for (const x of [2.7, WW - 2.7]) {
      part(grp, "box", steel, .06, .06, FENCE_Y - 12, x, 2.2, 12 + (FENCE_Y - 12) / 2); part(grp, "box", steel, .04, .04, FENCE_Y - 12, x, 1.75, 12 + (FENCE_Y - 12) / 2);
      for (let y = 12; y < FENCE_Y; y += 1.6) part(grp, "cyl", steel, .03, 1, .03, x, 1.7, y);
    }
    // lifeboats hanging from davits outside the rail
    for (const y of [16, 26, 36, 46, 56]) for (const [x, s] of [[-1.3, -1], [WW + 1.3, 1]]) {
      part(grp, "sph", "#ff6a2c", .75, .55, 2.4, x, 2.6, y); part(grp, "box", "#ffffff", .9, .12, 3.8, x, 2.95, y);
      for (const dy of [-1.6, 1.6]) { const d = part(grp, "box", steel, 1.8, .12, .12, x - s * .6, 3.9, y + dy); d.rotation.z = s * .4; part(grp, "cyl", "#2b2f35", .015, 1, .015, x, 3.4, y + dy); }
    }
    // bridge and funnel at the bow, beyond the deck
    part(grp, "box", white, 26, 6, 9, 20, 3, -5.2); part(grp, "box", white, 18, 3, 7, 20, 7.5, -5.6);
    part(grp, "box", basic("#7fd6f0"), 24, .9, .1, 20, 4.4, -.66); part(grp, "box", basic("#7fd6f0"), 16, .8, .1, 20, 7.8, -2.06);
    for (let i = 0; i < 11; i++) part(grp, "box", "#2b5a8a", .12, .9, .12, 9 + i * 2.2, 4.4, -.6);
    part(grp, "box", navy, 26.2, .35, 9.2, 20, 6.05, -5.2);
    const fun = part(grp, "cyl", "#e53229", 1.6, 4.5, 2.3, 20, 11.2, -6.5); fun.scale.set(1.6, 4.5, 2.3);
    part(grp, "cyl", "#151617", 1.62, .5, 2.32, 20, 13.3, -6.5);
    part(grp, "cyl", steel, .05, 4, .05, 26, 11, -4); part(grp, "sph", basic("#ff3030"), .12, .12, .12, 26, 13.1, -4);
    // flags and a string of pennants from the funnel to the stern
    const pen = ["#ff4d6d", "#ffd23a", "#4fd8ff", "#7dff6a", "#ffffff"];
    for (const x of [8, 32]) for (let i = 0; i < 18; i++) { const y = 2 + i * 3.6, f = part(grp, "cone", pen[i % 5], .28, .5, .05, x, 6.2 - Math.sin(i / 17 * Math.PI) * 1.4, y); f.rotation.x = Math.PI; }
    // umbrellas over the loungers (high enough to walk under) and a bar canopy
    for (const [x, y, c] of [[7.5, 49, "#ff6a2c"], [7.5, 55, "#1f8fd6"], [31, 49, "#1f8fd6"], [31, 55, "#ff6a2c"], [10.5, 52, "#ffd23a"], [34.5, 52, "#ffd23a"]]) {
      part(grp, "cyl", "#e9e4d8", .04, 2.6, .04, x, 1.3, y); part(grp, "cone", c, 1.4, .45, 1.4, x, 2.75, y);
    }
    part(grp, "box", mat("#f2c230"), 9, .15, 4, 20, 3.1, 53.5); for (const [x, y] of [[16.2, 52.2], [23.8, 52.2], [16.2, 54.8], [23.8, 54.8]]) part(grp, "cyl", "#6b4a2b", .06, 1.9, .06, x, 2.1, y);
  },
  performers: () => [
    { kind: "dj", orbit: [20, 5, .01, 0, 0], h: 1.8, x: 0, y: 0, ang: Math.PI / 2, t: 0 },
    { kind: "cru_sea", orbit: [WW / 2, SH / 2, .001, 0, -Math.PI / 2], h: 0, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "cru_smoke", orbit: [20, -6.5, .001, 0, 0], h: 0, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "cru_float", col: "#ff4d6d", orbit: [18, 34, 1.2, .25, 0], h: .2, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "cru_float", col: "#ffd23a", duck: true, orbit: [22, 38, 1.4, -.2, 2], h: .2, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "cru_float", col: "#7dff6a", orbit: [20, 32.5, .9, .3, 4], h: .2, x: 0, y: 0, ang: 0, t: 0 },
  ],
};
