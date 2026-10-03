// Human Tide · scene: The Cheese Chase (a village rolls giant cheeses down a hill and chases them, as it has for 600 years)
const CHILL = { x0: 16.5, x1: 23.5, y0: 8, y1: 42 };   // the race course down the middle of the hill
const CH_FONDUE = [4.5, 31], CH_COLS = ["#d8322b", "#2f6fc4", "#3d9a5b", "#8a4fbf", "#ff7a3c"];
let CHEESE_GEO = null;
function cheeseGeo() {
  if (CHEESE_GEO) return CHEESE_GEO;
  const cut = .95, body = new THREE.CylinderGeometry(1, 1, 1, 30, 1, false, cut / 2, Math.PI * 2 - cut);
  CHEESE_GEO = { body, cut };
  return CHEESE_GEO;
}
// a wheel of cheese with a wedge cut out; u.ball spins it as it rolls
SCENE_MODELS.cheese_wheel = (g, u, m) => {
  const r = m.r || 1, w = r * .55, blue = !!m.blue, rind = blue ? "#9fb6c8" : "#e8a92a", inner = blue ? "#e6eef0" : "#ffd96a";
  u.ball = pivot(g, 0, r, 0);
  const wheel = pivot(u.ball, 0, 0, 0); wheel.rotation.x = Math.PI / 2;
  const G = cheeseGeo(), body = new THREE.Mesh(G.body, mat(rind, { roughness: .55 })); body.userData.shared = true;
  body.scale.set(r, w, r); body.castShadow = true; wheel.add(body);
  // the two faces of the cut (paler inside) and the label on the rind
  for (const a of [G.cut / 2, -G.cut / 2]) {
    const f = pivot(wheel, 0, 0, 0); f.rotation.y = a + Math.PI / 2;
    part(f, "box", inner, r, w * .98, .02, r / 2, 0, 0);
  }
  for (const s of [-1, 1]) part(wheel, "cyl", inner, r * .97, .02, r * .97, 0, s * w * .5, 0).visible = false;
  for (const s of [-1, 1]) { const lab = part(u.ball, "cyl", blue ? "#2f5f8f" : "#d8322b", r * .38, .03, r * .38, 0, 0, s * w * .51); lab.rotation.x = Math.PI / 2; }
  // holes (swiss style) or blue veins
  for (let i = 0; i < 7; i++) { const a = i * 2.3, rr = r * (.3 + (i % 3) * .2); for (const s of [-1, 1]) { const h = part(u.ball, "cyl", blue ? "#2f5f8f" : "#c98a1a", r * .08, .03, r * .08, Math.cos(a) * rr, Math.sin(a) * rr, s * w * .5); h.rotation.x = Math.PI / 2; } }
  if (blue) u.anim = (tt, mm) => { if (Math.random() < .5) puff(mm.x + (Math.random() - .5) * 2, mm.y + (Math.random() - .5) * 2, .6, "#9bd84a", .5, 1.6, .8); };
  else if (m.beh !== "bounce") u.anim = (tt, mm) => { mm.spin = (mm.spin || 0) + .016 * (mm.speed || 3) / r; };
};
// a cheese-runner in costume: striped shirt, number bib and a cheese-wedge hat
SCENE_PERSONS.cheese_runner = { body: "#ffd23a", legs: "#2b3a55", hat: "none",
  extra(g, u, b, m) {
    const c = m.col || "#d8322b";
    for (let y = .95; y < 1.45; y += .16) part(b, "box", c, .41, .06, .53, 0, y, 0);
    part(b, "box", "#ffffff", .05, .22, .22, .2, 1.18, 0); part(b, "box", "#151617", .06, .08, .08, .21, 1.18, 0);
    const hat = part(b, "cone", "#ffc93a", .2, .32, .2, 0, 1.9, 0); hat.rotation.z = -.25;
    part(b, "sph", "#e8a92a", .05, .05, .05, .05, 1.92, .12);
  } };
// a runner tumbling head over heels downhill
SCENE_MODELS.cheese_tumbler = (g, u, m) => {
  const hub = pivot(g, 0, .95, 0), inner = pivot(hub, 0, -.95, 0);
  personModel(inner, u, SCENE_PERSONS.cheese_runner, m);
  const sp = 8 + Math.random() * 5;
  u.anim = (tt, mm) => { hub.rotation.z = -tt * sp; if (u.arms) u.arms.forEach((p, i) => p.rotation.z = 2.6 + Math.sin(tt * 14 + i) * .4); };
};
// the runaway goat (it has eaten a rosette)
SCENE_MODELS.cheese_goat = (g, u, m) => {
  const c = "#f2efe9";
  part(g, "sph", c, .55, .38, .32, 0, .85, 0);
  const head = u.head = pivot(g, .55, 1.15, 0);
  part(head, "sph", c, .2, .18, .16, .1, 0, 0); part(head, "sph", "#ffc4c4", .08, .07, .1, .27, -.05, 0);
  for (const s of [-1, 1]) { const h = part(head, "cone", "#8a7a5a", .05, .28, .05, -.02, .2, s * .08); h.rotation.z = .6; part(head, "sph", "#111214", .03, .03, .03, .2, .05, s * .1); part(head, "sph", c, .1, .04, .05, 0, .02, s * .18); }
  part(head, "cone", "#d9d3c4", .05, .18, .05, .15, -.2, 0).rotation.z = Math.PI;
  part(g, "cyl", "#2f6fc4", .14, .03, .14, .3, .95, .3).rotation.x = Math.PI / 2;
  for (const [x, z] of [[.35, .18], [.35, -.18], [-.35, .18], [-.35, -.18]]) u.legs.push(leg(g, x, .6, z, .05, .6, "#d9d3c4"));
  u.tail = pivot(g, -.55, 1.0, 0); part(u.tail, "cone", c, .05, .15, .05, 0, .07, 0);
};
// the Cheese Queen: crown, golden cape and a cheese-wedge sceptre
SCENE_PERSONS.cheese_queen = { body: "#ffd23a", legs: "#e3b23c", hat: "hair", hatCol: "#c76a2a", dress: true,
  extra(g, u, b) {
    for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; part(b, "cone", basic("#ffe48a"), .04, .14, .04, -.02 + Math.cos(a) * .12, 1.86, Math.sin(a) * .12); }
    part(b, "cyl", "#e3b23c", .14, .05, .14, -.02, 1.8, 0);
    part(b, "box", "#b2232c", .05, 1.1, .6, -.22, 1.0, 0);
    part(b, "box", "#ffffff", .06, .08, .62, -.21, 1.5, 0);
    part(b, "cyl", "#e3b23c", .025, .8, .025, .3, 1.1, .35);
    const w = part(b, "cone", "#ffc93a", .14, .28, .14, .3, 1.6, .35); w.rotation.x = .3;
    part(b, "box", "#d8322b", .05, .18, .5, .2, 1.25, 0);
  } };
// a tractor towing a cheese the size of a car
SCENE_MODELS.cheese_tractor = (g, u, m) => {
  part(g, "box", "#3d9a5b", 1.6, .8, 1.1, .5, 1.0, 0); part(g, "box", "#3d9a5b", .8, 1.1, 1.0, -.2, 1.7, 0);
  part(g, "box", mat("#1d2733", { roughness: .2 }), .82, .5, 1.02, -.2, 1.95, 0);
  part(g, "box", "#ffd23a", .9, .06, 1.2, -.2, 2.3, 0);
  part(g, "cyl", "#2b2f35", .06, .7, .06, 1.0, 1.7, .3);
  for (const s of [-1, 1]) { const w = part(g, "cyl", "#151617", .7, .35, .7, -.3, .7, s * .7); w.rotation.x = Math.PI / 2; const f = part(g, "cyl", "#151617", .4, .25, .4, 1.0, .4, s * .6); f.rotation.x = Math.PI / 2; part(g, "cyl", "#ffd23a", .3, .37, .3, -.3, .7, s * .7).rotation.x = Math.PI / 2; }
  part(g, "box", "#6b4a2b", 3.2, .2, 2.2, -2.6, .55, 0);
  for (const s of [-1, 1]) { const w = part(g, "cyl", "#151617", .4, .25, .4, -2.6, .4, s * 1.15); w.rotation.x = Math.PI / 2; }
  const ch = pivot(g, -2.6, 0, 0); SCENE_MODELS.cheese_wheel(ch, {}, { r: 1.5, beh: "static" });
  ch.children[0].rotation.z = .6; ch.position.y = .3;
  part(g, "box", "#ffffff", 1.6, .25, .02, -2.6, 2.6, 0);
  u.anim = (tt) => { g.position.y += Math.abs(Math.sin(tt * 9)) * .05; };
};
// the fondue fountain that pops up at the stall
SCENE_MODELS.cheese_fondue = (g, u) => {
  part(g, "cyl", mat("#c9ced6", { metalness: .8, roughness: .25 }), .7, .3, .7, 0, .15, 0);
  const tiers = [[.6, .5], [.42, .9], [.26, 1.3]].map(([r, y]) => { part(g, "cyl", mat("#c9ced6", { metalness: .8, roughness: .25 }), r, .06, r, 0, y, 0); return part(g, "cyl", "#ffd23a", r * .98, .22, r * .98, 0, y - .14, 0); });
  part(g, "cyl", "#ffd23a", .08, 1.2, .08, 0, 1.0, 0); part(g, "sph", "#ffd23a", .14, .14, .14, 0, 1.65, 0);
  u.anim = (tt) => { tiers.forEach((t, i) => { t.scale.y = .22 + Math.sin(tt * 6 + i) * .05; }); };
};

SCENES.cheese = {
  name: "The Cheese Chase", tag: "Annual downhill cheese rolling championship", place: "CHEESE HILL", outside: "#5f8f3a", bulbH: 2.2, music: "brass",
  light: { sky: 0xeaf6ff, ground: 0x4f7a2a, hemi: .62, sun: 0xfff1d0, sunI: 1.3 }, crowd: 3000, fenceBudget: 64, maxGates: 5, guards: 4,
  gates: [F, F, T, T, T, F, F], unlock: 24,
  heights: { cheese_podium: 1.3, cheese_hay: .9, cheese_rope: .8, cheese_amb: 2.4, cheese_stall: 2.2, cheese_hedge: 1.6, cheese_ramp: 1.1 },
  sfx: { "CHEESE!": "cheer", "MEEEH!": "moo", "WHEEE!": "scream", "PUTT PUTT!": "honk", "AHEM!": "trumpet", "FREE FONDUE!": "jingle", "PEE-YOO!": "scream", "MY CHEESE!": "crash", "MY SPLEEN!": "crash", "NEE-NAW!": "siren" },
  intro: "Six hundred years of tradition: the village throws a wheel of cheese down a cliff-steep hill and grown adults chase it. The ambulance is already parked and the crowd insists on standing exactly where the cheese lands.",
  acts: ["Chase the cheese!", "Long live the Queen!", "Roll! Roll! Roll!", "Mind the goat!"],
  events: ["wheel", "goat", "tumble", "tractor", "mayor", "fondue", "bluecheese", "wheel"],
  goal: o => o.kind === "cheese_rope", goalMaxY: 44,
  lines: {
    wheel: "Three wheels of aged cheddar left the course at 70 km/h and plowed through the spectators, as tradition demands.",
    goat: "A goat ate the finish tape, two rosettes and the mayor's notes, then fled downhill.",
    tumble: "Several contestants rolled down the hill head over heels; one of them finished ahead of the cheese.",
    tractor: "A tractor towed in a cheese the size of a hatchback, 'for next year'.",
    mayor: "The mayor gave a 40-minute speech about dairy heritage; nobody listened, which calmed everyone down.",
    fondue: "A free fondue fountain caused the biggest stampede of the afternoon.",
    bluecheese: "The rival village sneaked in a wheel of blue cheese; the smell cleared half the hill.",
  },
  quotes: ["“The cheese always wins. We just chase it to show respect,” explained the four-time champion from a stretcher.",
    "“I came for the cheese, I'm leaving with a cast,” said a satisfied spectator.",
    "“That blue cheese was a declaration of war,” said the Cheese Queen, still holding her sceptre."],
  build() {
    rect(0, 0, WW, 1.6, "cheese_hedge");
    rect(15, 1.6, 25, 6, "cheese_podium");
    seg(CHILL.x0, 7, CHILL.x0, CHILL.y1, .3, "cheese_rope"); seg(CHILL.x1, 7, CHILL.x1, CHILL.y1, .3, "cheese_rope");
    seg(CHILL.x0, CHILL.y1, CHILL.x1, CHILL.y1, .3, "cheese_rope");
    seg(15, 6.8, CHILL.x0, 7, .3, "cheese_rope"); seg(25, 6.8, CHILL.x1, 7, .3, "cheese_rope");
    rect(1.5, 3, 6.5, 8, "tent"); rect(33.5, 3, 38.5, 8, "tent"); rect(8, 2.5, 12, 6.5, "tent");
    rect(2, 29, 7, 33, "cheese_stall");
    rect(33, 27, 38.5, 30, "cheese_amb");
    // hay bale terraces across the hill: the gaps are the bottlenecks
    for (const [x0, x1] of [[1.5, 6], [9, 15.5], [24.5, 31], [34, 38.5]]) rect(x0, 47.5, x1, 48.7, "cheese_hay");
    for (const [x0, x1] of [[4, 11], [14, 18], [22, 26], [29, 36]]) rect(x0, 53.5, x1, 54.7, "cheese_hay");
  },
  ground(g) {
    // the hill: darker at the summit, lighter at the bottom, painted slope bands
    const grd = g.createLinearGradient(0, 0, 0, FENCE_Y); grd.addColorStop(0, "#4f8a2c"); grd.addColorStop(1, "#86bf4e");
    g.fillStyle = grd; g.fillRect(0, 0, WW, FENCE_Y);
    const rand = rng(31);
    for (let k = 0; k < 3200; k++) { g.fillStyle = k % 3 ? "rgba(30,70,20,.22)" : "rgba(200,240,140,.25)"; g.fillRect(rand() * WW, rand() * FENCE_Y, .07, .22); }
    // contour lines (the hill is steep, so many of them)
    g.lineWidth = .08; g.strokeStyle = "rgba(30,60,15,.35)";
    for (let k = 0; k < 14; k++) {
      const y0 = 6 + k * 4.2 + k * k * .05; g.beginPath();
      for (let x = 0; x <= WW; x += 1) g.lineTo(x, y0 + Math.sin(x * .25 + k) * .7 + Math.abs(x - 20) * -.06);
      g.stroke();
    }
    // daisies and clover
    for (let k = 0; k < 400; k++) { g.fillStyle = k % 4 ? "#ffffff" : "#ffd23a"; g.beginPath(); g.arc(rand() * WW, rand() * FENCE_Y, .07, 0, 7); g.fill(); }
    // the course: trampled grass and mud
    const mud = g.createLinearGradient(CHILL.x0, 0, CHILL.x1, 0); mud.addColorStop(0, "#7a9a3a"); mud.addColorStop(.5, "#8a6a3a"); mud.addColorStop(1, "#7a9a3a");
    g.fillStyle = mud; g.fillRect(CHILL.x0, 7, CHILL.x1 - CHILL.x0, CHILL.y1 - 7);
    for (let k = 0; k < 600; k++) { g.fillStyle = k % 2 ? "rgba(70,45,20,.35)" : "rgba(150,190,80,.3)"; g.fillRect(CHILL.x0 + rand() * 7, 7 + rand() * (CHILL.y1 - 7), .25, .12); }
    // chevrons: DOWNHILL (in case anyone was confused)
    g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = .3;
    for (let y = 12; y < CHILL.y1 - 2; y += 5) { g.beginPath(); g.moveTo(18.2, y); g.lineTo(20, y + 1.4); g.lineTo(21.8, y); g.stroke(); }
    // fallen cheese crumbs
    for (let k = 0; k < 200; k++) { g.fillStyle = "#ffd23a"; g.globalAlpha = .7; g.fillRect(rand() * WW, 8 + rand() * 50, .14, .1); }
    g.globalAlpha = 1;
    // the village lane at the bottom
    g.fillStyle = "#9a8a6a"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
    for (let x = 0, i = 0; x < WW; x += .9, i++) for (let y = FENCE_Y + (i % 2) * .4; y < WH; y += .8) { g.fillStyle = "rgba(60,50,35,.25)"; g.fillRect(x, y, .8, .05); g.fillRect(x, y, .05, .7); }
  },
  decor(g) {
    // hedge at the summit
    const rand = rng(8);
    g.fillStyle = "#2f5a1e"; g.fillRect(0, 0, WW, 1.6);
    for (let x = .4; x < WW; x += .7) { g.fillStyle = rand() < .5 ? "#3d7a2a" : "#2a4f18"; g.beginPath(); g.arc(x, .8 + rand() * .3, .55, 0, 7); g.fill(); }
    // the podium with the start ramp and the queen's carpet
    g.fillStyle = "#e8d3a2"; g.fillRect(15, 1.6, 10, 4.4);
    g.fillStyle = "#b2232c"; g.fillRect(18, 1.6, 4, 4.4);
    g.fillStyle = "#e3b23c"; g.fillRect(15, 1.6, 10, .2); g.fillRect(15, 5.8, 10, .2);
    for (const [x, n] of [[16.4, "2"], [20, "1"], [23.6, "3"]]) { g.font = "900 1.1px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#151617"; g.fillText(n, x, 4.6); }
    // start line and finish line
    for (let x = CHILL.x0, i = 0; x < CHILL.x1; x += .5, i++) for (let r = 0; r < 2; r++) { g.fillStyle = (i + r) % 2 ? "#151617" : "#ffffff"; g.fillRect(x, CHILL.y1 - 1.6 + r * .5, .5, .5); }
    g.fillStyle = "#ffffff"; g.fillRect(CHILL.x0, 8.6, CHILL.x1 - CHILL.x0, .25);
    g.font = "900 .75px Rubik, sans-serif"; g.textAlign = "center"; g.fillStyle = "#ffffff"; g.fillText("START", 20, 9.6); g.fillText("FINISH", 20, CHILL.y1 - 2.3);
    // giant hillside lettering
    g.save(); g.font = "900 2.3px Rubik, sans-serif"; g.fillStyle = "rgba(255,255,255,.45)";
    g.translate(9, 22); g.rotate(-Math.PI / 2); g.fillText("CHEESE", 0, 0); g.restore();
    g.save(); g.font = "900 2.3px Rubik, sans-serif"; g.fillStyle = "rgba(255,255,255,.45)";
    g.translate(31, 22); g.rotate(Math.PI / 2); g.fillText("CHASE", 0, 0); g.restore();
    g.font = "900 .7px Rubik, sans-serif"; g.fillStyle = "rgba(255,255,255,.7)"; g.fillText("EST. 1420 · NO REFUNDS", 20, 45.4);
    // ropes on stakes
    for (const o of obs) if (o.kind === "cheese_rope") {
      g.lineWidth = .14; g.strokeStyle = "#f4ecd8"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke();
      const len = Math.hypot(o.bx - o.ax, o.by - o.ay); for (let s = 0; s <= len; s += 2) { g.fillStyle = "#6b4a2b"; g.beginPath(); g.arc(o.ax + (o.bx - o.ax) * s / len, o.ay + (o.by - o.ay) * s / len, .18, 0, 7); g.fill(); }
    }
    // tents: striped village marquees
    for (const o of obs) if (o.kind === "tent") {
      const cx = (o.x0 + o.x1) / 2, cy = (o.y0 + o.y1) / 2, w = o.x1 - o.x0;
      for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#f4ecd8" : CH_COLS[(o.x0 | 0) % 5]; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, w * .72, i / 8 * 6.283 + .39, (i + 1) / 8 * 6.283 + .39); g.fill(); }
    }
    // hay bales
    for (const o of obs) if (o.kind === "cheese_hay") {
      g.fillStyle = "#e3c25c"; g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0);
      g.strokeStyle = "rgba(140,100,30,.6)"; g.lineWidth = .06;
      for (let x = o.x0 + .3; x < o.x1; x += .25) { g.beginPath(); g.moveTo(x, o.y0); g.lineTo(x - .15, o.y1); g.stroke(); }
      g.strokeStyle = "#8a5a34"; g.lineWidth = .08; for (let x = o.x0 + 1.1; x < o.x1 - .2; x += 1.4) { g.beginPath(); g.moveTo(x, o.y0); g.lineTo(x, o.y1); g.stroke(); }
    }
    // the fondue stall
    g.fillStyle = "#ffd23a"; g.fillRect(2, 29, 5, 4);
    for (let x = 2, i = 0; x < 7; x += .5, i++) { g.fillStyle = i % 2 ? "#d8322b" : "#ffffff"; g.fillRect(x, 29, .5, 1.2); }
    g.font = "900 .6px Rubik, sans-serif"; g.fillStyle = "#151617"; g.fillText("FONDUE", 4.5, 31.8);
    // the ambulance, waiting patiently
    g.fillStyle = "#f4f4f2"; g.fillRect(33, 27, 5.5, 3);
    g.fillStyle = "#e8b631"; g.fillRect(33, 28.3, 5.5, .4);
    g.fillStyle = "#d8322b"; g.fillRect(35.2, 27.6, 1.2, .35); g.fillRect(35.62, 27.2, .35, 1.2);
    g.fillStyle = "#2f6fc4"; g.fillRect(37.6, 27.1, .3, .8); g.fillRect(37.6, 29.1, .3, .8);
    // bunting across the hill
    for (const y of [12, 33]) for (let x = .5, i = 0; x < WW; x += 1.1, i++) {
      if (x > CHILL.x0 - .5 && x < CHILL.x1 + .2 && y > 10) { /* above the course too */ }
      g.fillStyle = CH_COLS[i % 5]; g.beginPath(); g.moveTo(x, y); g.lineTo(x + .9, y); g.lineTo(x + .45, y + .7); g.fill();
    }
    g.strokeStyle = "rgba(255,255,255,.6)"; g.lineWidth = .05; for (const y of [12, 33]) { g.beginPath(); g.moveTo(0, y); g.lineTo(WW, y); g.stroke(); }
    // welcome banner over the entrance
    g.fillStyle = "#b2232c"; g.fillRect(8, FENCE_Y - 2.4, 24, 1.1);
    g.font = "900 .75px Rubik, sans-serif"; g.fillStyle = "#ffd23a"; g.fillText("WELCOME TO THE 606th CHEESE CHASE", 20, FENCE_Y - 1.82);
  },
  bulbs: [...Array.from({ length: 9 }, (_, i) => [15.5 + i * 1.12, 6.4]), ...Array.from({ length: 8 }, (_, i) => [CHILL.x0, 10 + i * 4.4]), ...Array.from({ length: 8 }, (_, i) => [CHILL.x1, 10 + i * 4.4])],
  beams: [{ x: 15, y: 3, a: Math.PI / 2 + .4, sweep: .4, h: 7, white: true }, { x: 25, y: 3, a: Math.PI / 2 - .4, sweep: .4, h: 7, white: true }],
  extra3D(grp) {
    // start ramp at the summit and a giant cheese on a plinth
    const rp = pivot(grp, 20, 1.3, 6.3); const ramp = part(rp, "box", "#8a5a34", 3, .15, 2.4, 0, .3, 0); ramp.rotation.x = -.35;
    part(grp, "cyl", "#e8d3a2", 1.3, .6, 1.3, 20, 1.6, 3.6);
    const big = pivot(grp, 20, 1.9, 3.4); big.rotation.y = .7; SCENE_MODELS.cheese_wheel(big, {}, { r: 1.3, beh: "static" });
    // bunting poles and strings across the hill
    for (const y of [12, 33]) {
      for (const x of [.6, WW - .6]) part(grp, "cyl", "#e8e2d0", .08, 3.4, .08, x, 1.7, y);
      for (let x = 1, i = 0; x < WW - 1; x += 1.4, i++) { const f = part(grp, "cone", CH_COLS[i % 5], .28, .5, .06, x, 3.0, y); f.rotation.x = Math.PI; }
    }
    // the ambulance: cab, red cross and siren
    part(grp, "box", "#f4f4f2", 1.5, 1.8, 2.8, 38, 1.1, 28.5);
    part(grp, "box", mat("#1d2733", { roughness: .2 }), .1, .6, 2.4, 38.75, 1.6, 28.5);
    part(grp, "box", "#d8322b", 1.6, .4, .1, 35.8, 2.42, 28.5); part(grp, "box", "#d8322b", .4, .02, 1.6, 35.8, 2.42, 28.5);
    part(grp, "box", basic("#4fa0ff"), .25, .2, 1.2, 37.8, 2.55, 28.5);
    for (const x of [34, 37.5]) for (const z of [26.9, 30.1]) { const w = part(grp, "cyl", "#151617", .45, .3, .45, x, .45, z); w.rotation.x = Math.PI / 2; }
    // fondue stall awning and a cauldron
    const aw = part(grp, "box", "#d8322b", 5.4, .12, 1.6, 4.5, 2.6, 29.4); aw.rotation.x = .25;
    part(grp, "cyl", "#2b2f35", .6, .5, .6, 4.5, 2.45, 31.3); part(grp, "cyl", "#ffd23a", .55, .05, .55, 4.5, 2.72, 31.3);
    // podium steps and flags
    part(grp, "box", "#f4f4f2", 2, .6, 1.4, 16.4, 1.6, 4.6); part(grp, "box", "#f4f4f2", 2, .3, 1.4, 23.6, 1.45, 4.6);
    for (const x of [15.4, 24.6]) { part(grp, "cyl", "#e8e2d0", .06, 4, .06, x, 3.3, 2); part(grp, "box", "#ffd23a", .9, .6, .04, x + .45, 4.9, 2); }
    // a few stacked spare cheeses by the tents
    for (const [x, z] of [[7.6, 9], [32.4, 9]]) for (let k = 0; k < 3; k++) part(grp, "cyl", "#e8a92a", .7, .35, .7, x, .18 + k * .36, z);
  },
  ev: {
    wheel() {
      for (let n = 0; n < 3; n++) later(n * .7, () => {
        if (phase !== "show" && phase !== "evac") return;
        addMover({ kind: "cheese_wheel", beh: "bounce", air: true, x: rnd(18.5, 21.5), y: 13, vx: rnd(-2.5, 2.5), vy: rnd(6, 8), r: 1.05, push: 38, scare: 2.2, life: 7.5, say: "CHEESE!", sayEvery: 2.2 });
      });
      for (let n = 0; n < 3; n++) addMover({ kind: "cheese_runner", col: pick(CH_COLS), x: rnd(18, 22), y: 9, pts: [[rnd(18, 22), 40], [rnd(18, 22), 41.5]], speed: 4.5, r: .4, push: 0 });
      cheerT = 2; caption("The cheese is away! Straight into the crowd", true, 2000);
    },
    goat() {
      const gx = openGateX();
      addMover({ kind: "cheese_goat", x: CHILL.x0 - 1, y: 9, pts: [crowdPoint(), crowdPoint(), crowdPoint(), [gx, 64], [gx, SH + 3]], speed: 5.2, r: .5, push: 20, scare: 2.8, say: "MEEEH!", sayEvery: 2 });
      caption("A goat ate the finish tape and is loose on the hill!", true, 2000);
    },
    tumble() {
      for (let n = 0; n < 5; n++) {
        const x0 = rnd(17.5, 22.5), [cx, cy] = crowdPoint();
        addMover({ kind: "cheese_tumbler", col: CH_COLS[n], x: x0, y: 10 + n * .6, pts: [[x0, 30], [cx, Math.max(36, cy)], [cx + rnd(-4, 4), 62], [cx, SH + 3]], speed: 4.2, r: .5, push: 18, scare: 1.4, say: n ? (n === 2 ? "MY SPLEEN!" : "") : "WHEEE!", sayEvery: 2.6 });
      }
      caption("Contestants tumbling head over heels downhill!", true, 2000);
    },
    tractor() {
      const y = rnd(36, 46), side = Math.random() < .5;
      addMover({ kind: "cheese_tractor", x: side ? -5 : WW + 5, y, pts: [[side ? WW + 7 : -7, y + rnd(-3, 3)]], speed: 2.1, r: 1.6, push: 42, scare: 3, dust: true, say: "PUTT PUTT!", sayEvery: 1.8 });
      caption("A tractor is towing a cheese the size of a car", false, 1900);
    },
    mayor() {
      const gx = openGateX();
      addMover({ kind: "mayor", x: gx, y: SH, pts: [[gx, 58], [20, 50], crowdPoint(), crowdPoint(), [gx, SH + 3]], speed: 1.3, r: .4, push: 8, calm: 5, say: "AHEM!", sayEvery: 3.5 });
      later(2.5, () => { if (phase === "show") pop(20, 50, "ZZZ...!"); });
      caption("The mayor's speech. Nobody is listening (it's calming)", false, 2000);
    },
    fondue() {
      const [x, y] = CH_FONDUE;
      addMover({ kind: "cheese_fondue", beh: "static", x: x + 3.4, y: y + 1, life: 8, r: .7, push: 0, say: "FREE FONDUE!", sayEvery: 2.6 });
      tempAttract(x + 4, y + 1, 2.6, 6, .35);
      caption("Free fondue at the stall!", true, 1900);
    },
    bluecheese() {
      const side = Math.random() < .5, y = rnd(32, 46);
      addMover({ kind: "cheese_wheel", blue: true, x: side ? -2 : WW + 2, y, pts: [crowdPoint(), [side ? WW + 4 : -4, y + rnd(-6, 6)]], speed: 2.6, r: 1, push: 25, scare: 4.5, say: "PEE-YOO!", sayEvery: 2 });
      caption("The rival village rolled in a blue cheese! The smell!", true, 2100);
    },
  },
  performers: () => [
    { kind: "cheese_queen", orbit: [20, 3.6, 1.6, .5, 0], h: 1.3, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "cheese_runner", col: "#2f6fc4", orbit: [16.4, 4.6, .01, 0, 0], h: 1.9, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "cheese_runner", col: "#3d9a5b", orbit: [23.6, 4.6, .01, 0, 0], h: 1.6, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "cheese_goat", orbit: [36, 15, 1.5, .6, 0], x: 0, y: 0, ang: 0, t: 0 },
  ],
};
