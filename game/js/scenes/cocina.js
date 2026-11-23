// Human Tsunami · scene: The Kitchen at 3 AM (a crowd of cockroaches rushes a dropped birthday cake; the floor is full of comic traps)
const KIT = {
  cake: { x0: 11, y0: 0, x1: 29, y1: 6.5 },
  fridge: { x0: 0, y0: 13, x1: 6.5, y1: 30 }, stove: { x0: 33.5, y0: 15, x1: 40, y1: 31 },
  hot: [[31.6, 19, 2.1], [31.6, 26.5, 2.1]],           // the oven door leaks heat onto the floor in front of the stove
  glue: { x0: 4, y0: 37, x1: 11.5, y1: 42 },           // a glue trap somebody forgot
  drain: [20, 34, 2.4],                                 // the floor drain pulls whoever gets close
  traps: [[14.5, 51], [26.5, 24.5], [32, 46]],          // mouse traps: they snap when a crowd piles onto them
  trapCd: [0, 0, 0], tick: 0,
};
const ROACH_COLS = ["#5a2e14", "#4a2410", "#6b3518", "#3e1e0c"];

// ---------- models ----------
// a cartoon cockroach standing on two legs: shell, four arms, antennae (performers and the king)
function roachModel(g, u, s, crown) {
  const shell = "#4a2410", leg = "#2a1206";
  for (const z of [-1, 1]) u.legs ? u.legs.push(leg_(g, z)) : null;
  function leg_(gg, z) { const p = pivot(gg, 0, .8 * s, z * .12 * s); part(p, "cyl", leg, .05 * s, .8 * s, .05 * s, 0, -.4 * s, 0); return p; }
  const b = u.body = pivot(g, 0, 0, 0);
  part(b, "sph", "#6b3518", .26 * s, .42 * s, .24 * s, 0, 1.15 * s, 0);
  part(b, "sph", shell, .3 * s, .48 * s, .28 * s, -.1 * s, 1.18 * s, 0);
  part(b, "box", "#1e0c04", .02 * s, .8 * s, .02 * s, -.39 * s, 1.2 * s, 0);
  const head = pivot(b, .05 * s, 1.72 * s, 0);
  part(head, "sph", "#6b3a1c", .19 * s, .17 * s, .19 * s, 0, 0, 0);
  for (const z of [-1, 1]) {
    part(head, "sph", basic("#ffffff"), .06 * s, .07 * s, .06 * s, .15 * s, .04 * s, z * .08 * s);
    part(head, "sph", basic("#111214"), .03 * s, .035 * s, .03 * s, .19 * s, .04 * s, z * .085 * s);
    const an = part(head, "cyl", leg, .015 * s, .7 * s, .015 * s, .15 * s, .4 * s, z * .1 * s); an.rotation.set(z * .35, 0, -.6);
  }
  if (crown) for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; part(head, "cone", "#ffd23a", .05 * s, .16 * s, .05 * s, Math.cos(a) * .12 * s, .2 * s, Math.sin(a) * .12 * s); }
  u.arms = [];
  for (const [y, z] of [[1.42, -1], [1.42, 1], [1.05, -1], [1.05, 1]]) { const p = pivot(b, 0, y * s, z * .26 * s); part(p, "cyl", leg, .04 * s, .5 * s, .04 * s, 0, -.25 * s, 0); u.arms.push(p); }
  return head;
}
SCENE_MODELS.kit_king = (g, u, m) => {
  u.legs = []; const head = roachModel(g, u, 1.6, true), ph = m.ap || 0;
  u.anim = (tt) => { const live = phase === "show" || phase === "evac";
    u.arms.forEach((p, i) => { p.rotation.z = 2.4 + Math.sin(tt * (live ? 8 : 2) + i + ph) * .5; p.rotation.x = (i % 2 ? .3 : -.3); });
    u.body.position.y = live ? Math.abs(Math.sin(tt * 4 + ph)) * .25 : 0; head.rotation.z = Math.sin(tt * 4 + ph) * .2; };
};
SCENE_MODELS.kit_dancer = (g, u, m) => {
  u.legs = []; roachModel(g, u, 1.1, false); const ph = m.ap || 0;
  u.anim = (tt) => { const live = phase === "show" || phase === "evac";
    u.arms.forEach((p, i) => { p.rotation.z = (live ? 1.6 : .4) + Math.sin(tt * 10 + i * 1.6 + ph) * .7; });
    u.body.rotation.y = live ? Math.sin(tt * 3 + ph) * .8 : 0; u.body.position.y = live ? Math.abs(Math.sin(tt * 7 + ph)) * .18 : 0; };
};
// the cleaning robot: a disc with a bumper, a status light, spinning side brushes and a dust bin full of victims
SCENE_MODELS.kit_robot = (g, u) => {
  part(g, "cyl", "#2b2f35", 1.25, .35, 1.25, 0, .25, 0); part(g, "cyl", "#d9dde2", 1.2, .08, 1.2, 0, .46, 0);
  part(g, "cyl", "#151617", 1.28, .2, 1.28, 0, .2, 0);
  part(g, "cyl", "#9aa0a8", .35, .06, .35, -.2, .52, 0); part(g, "box", "#151617", .5, .04, .9, .9, .5, 0);
  u.led = part(g, "sph", basic("#4fd86a"), .1, .1, .1, .6, .55, 0);
  u.brushes = [-1, 1].map(z => { const p = pivot(g, .9, .1, z * .8); for (let i = 0; i < 3; i++) { const br = part(p, "box", "#ffd23a", .7, .03, .06, 0, 0, 0); br.rotation.y = i * 2.09; } return p; });
  u.anim = (tt) => { u.brushes.forEach((p, i) => { p.rotation.y = tt * 14 * (i ? 1 : -1); }); u.led.material = basic(Math.sin(tt * 6) > 0 ? "#4fd86a" : "#ff3b2f"); };
};
// a giant pink slipper (it comes down from the sky)
SCENE_MODELS.kit_slipper = (g, u) => {
  part(g, "box", "#ff6fb1", 2.2, .35, 5, 0, .18, 0); part(g, "box", "#ffa6d0", 2.25, .1, 5.05, 0, .4, 0);
  const toe = part(g, "sph", "#ff6fb1", 1.15, .7, 1.4, 0, .5, 1.4); toe.scale.y = .55;
  part(g, "sph", "#ffffff", .5, .5, .5, 0, 1.0, 1.9);   // the pompom
};
// the house cat, curious about the noise
SCENE_MODELS.kit_cat = (g, u) => {
  const fur = "#e88a3a";
  part(g, "sph", fur, .9, .7, 1.6, 0, 1.4, 0); part(g, "sph", fur, .6, .55, .6, 0, 2.1, 1.5);
  for (const s of [-1, 1]) { part(g, "cone", fur, .2, .4, .2, s * .3, 2.6, 1.5); part(g, "sph", basic("#a6ff3a"), .1, .14, .06, s * .22, 2.2, 2.05); part(g, "cyl", fur, .14, 1.2, .14, s * .5, .6, .9); part(g, "cyl", fur, .14, 1.2, .14, s * .5, .6, -1); }
  for (let i = 0; i < 3; i++) part(g, "box", "#b5602a", 1.82, .12, .3, 0, 1.6 + i * .2, -.6 + i * .5);
  const tail = part(g, "cyl", fur, .12, 1.8, .12, 0, 2.2, -1.8); tail.rotation.x = -.6;
};
SCENE_MODELS.kit_fly = (g, u) => {
  part(g, "sph", "#2b3a2a", .35, .3, .3, 0, 0, 0); for (const s of [-1, 1]) part(g, "sph", basic("#d8322b"), .14, .16, .14, .3, .08, s * .14);
  u.wings = [-1, 1].map(s => { const p = pivot(g, -.05, .2, s * .1); part(p, "sph", mat("#dff4ff", { transparent: true, opacity: .55 }), .4, .03, .2, -.1, 0, s * .3); return p; });
  u.anim = (tt) => u.wings.forEach((p, i) => { p.rotation.x = Math.sin(tt * 60) * .6 * (i ? 1 : -1); });
};
SCENE_MODELS.kit_ant = (g, u) => {
  for (const [x, r] of [[-.5, .3], [0, .22], [.4, .25]]) part(g, "sph", "#1b1d22", r, r * .8, r * .8, x, .35, 0);
  for (const s of [-1, 1]) for (const x of [-.2, 0, .2]) { const l = part(g, "cyl", "#1b1d22", .03, .6, .03, x, .2, s * .25); l.rotation.x = s * .9; }
  part(g, "box", "#e8b86a", .7, .4, .6, 0, .85, 0);   // carrying a crumb twice its size
};
SCENE_MODELS.kit_crumb = (g) => { for (let i = 0; i < 9; i++) part(g, "box", ["#e8b86a", "#d89a4a", "#f4d08a"][i % 3], .35 + (i % 3) * .1, .25, .3, Math.cos(i * 2.4) * .8, .14, Math.sin(i * 2.4) * .8).rotation.y = i; };

// ---------- the venue ----------
SCENES.cocina = {
  name: "The Kitchen at 3 AM", tag: "Free cake. Run when the light comes on.", outside: "#2b2622", bulbH: 2.4, night: true, music: "spooky",
  light: { sky: 0xffd7a0, ground: 0x2a2018, hemi: .55, sun: 0xfff0d0, sunI: .9 }, crowd: 3200, fenceBudget: 80, maxGates: 5, guards: 4,
  gates: [F, T, F, T, F, T, F], unlock: 52, place: "THE KITCHEN",
  heights: { cake: 2.6, fridge: 16, stove: 9, kbin: 5, motel: 1.6, kcounter: 9 },
  sfx: { "SNAP!": "crash", "BEEP BOOP!": "beep", "DIRT DETECTED.": "beep", "PSSSSSHT!": "splash", "MEOW?": "quack", "INCOMING SLIPPER!": "horn", "THWACK!": "boom",
    "HOT HOT HOT!": "scream", "I'M STUCK!": "ooh", "WHOOSH!": "fiu", "FREE CRUMBS!": "jingle", "THE LIGHT! RUN!": "scream" },
  intro: "It's 3 AM. Somebody dropped an entire birthday cake behind the counter and three thousand cockroaches heard about it. Between them and the frosting: a glue trap, the floor drain, mouse traps, a hot oven and a cleaning robot that just woke up.",
  acts: ["Frosting for everyone!", "The cake is not a lie!", "Crumb drop!", "Long live the Roach King!"],
  events: ["robot", "chancla", "spray", "luz", "migas", "gato", "robot", "chancla"],
  goal: o => o.kind === "barrier", goalMaxY: 13,
  lines: {
    robot: "The cleaning robot woke up at 3 AM, found three thousand cockroaches and decided they were 'dirt'.",
    chancla: "A giant pink slipper fell from the sky. Witnesses heard someone upstairs yell 'I SAW ONE!'.",
    spray: "Someone sprayed bug spray; it smelled like 'mountain breeze' and cleared the area in seconds.",
    luz: "The kitchen light came on and the entire crowd tried to hide under the same fridge.",
    migas: "A rain of toast crumbs fell from the counter and the crowd fought over every one of them.",
    gato: "The house cat came to see what the noise was and stepped on several opinions.",
    snap: "A mouse trap went off under a crowd of roaches, who are fine, and very offended.",
  },
  quotes: ["“We survived the dinosaurs. We'll survive the cleaning robot,” said a cockroach, before getting vacuumed.",
    "“It's not a party until someone screams from the stairs,” said the Roach King from the top of the cake.",
    "“The glue trap was VIP access,” insisted a roach who has not moved in four hours."],
  look(L) {   // everyone in this kitchen is a cockroach
    if (typeof OUTFIT_ID !== "undefined" && OUTFIT_ID.roach) { L.cos = OUTFIT_ID.roach; L.hs = 4; L.cl = 0; L.m = 0; if (L.acc !== 6 && L.acc !== 7) L.acc = 0; L.kid = 0; }
  },
  ambient() {   // kitchen street life: a buzzing fly, or an ant hauling a crumb straight through the crowd
    const side = Math.random() < .5, y = rnd(16, 58);
    if (Math.random() < .5) addMover({ kind: "kit_fly", ambient: true, air: true, h: 3 + Math.random() * 2, x: side ? -3 : WW + 3, y, pts: [crowdPoint(), crowdPoint(), [side ? WW + 4 : -4, y + rnd(-10, 10)]], speed: 3.5, r: .3, push: 0, scare: 1.2, say: "BZZZZZ", sayEvery: 3 });
    else addMover({ kind: "kit_ant", ambient: true, x: side ? -2 : WW + 2, y, pts: [[side ? WW + 3 : -3, y + rnd(-4, 4)]], speed: 1.1, r: .5, push: 10, scare: 0, say: ["EXCUSE ME, CRUMB COMING THROUGH", "THIS ONE'S FOR THE QUEEN", "UNION BREAK IN 5"][(Math.random() * 3) | 0], sayEvery: 5 });
  },
  onStart() { KIT.trapCd = [0, 0, 0]; KIT.tick = 0; },
  build() {
    const C = KIT.cake;
    rect(C.x0, C.y0, C.x1, C.y1, "cake");
    seg(9, 6.5, 9, 11, .3, "barrier"); seg(31, 6.5, 31, 11, .3, "barrier"); seg(9, 11, 31, 11, .3, "barrier");   // the plate's rim
    rect(KIT.fridge.x0, KIT.fridge.y0, KIT.fridge.x1, KIT.fridge.y1, "fridge");
    rect(KIT.stove.x0, KIT.stove.y0, KIT.stove.x1, KIT.stove.y1, "stove");
    circ(6, 50, 2, "kbin");                              // the trash can
    rect(34, 52, 39, 55.5, "motel");                     // "Roach Motel"
    rect(0, 0, 9, 8, "kcounter"); rect(31, 0, WW, 8, "kcounter");
  },
  step() {
    if (phase !== "show" && phase !== "evac") return;
    KIT.tick++;
    const G = KIT.glue, [dx0, dy0, dr] = KIT.drain;
    for (const a of ag) {
      if (a.air > 0) continue;
      for (const [x, y, r] of KIT.hot) { const dx = a.x - x, dy = a.y - y, d = Math.hypot(dx, dy); if (d < r && d > .01) { a.vx += dx / d * 9 * DT; a.vy += dy / d * 9 * DT; a.p += .05;
        if (d < r * .45 && Math.random() < .004) { if (toss(a, 1.6 + Math.random(), .9) && Math.random() < .3) pop(a.x, a.y - 1, "HOT HOT HOT!"); } } }
      if (a.x > G.x0 && a.x < G.x1 && a.y > G.y0 && a.y < G.y1) { a.vx *= 1 - 6 * DT; a.vy *= 1 - 6 * DT; if (Math.random() < .0006) pop(a.x, a.y - 1, "I'M STUCK!"); }
      { const dx = dx0 - a.x, dy = dy0 - a.y, d = Math.hypot(dx, dy); if (d < dr && d > .05) { a.vx += dx / d * 2.2 * DT; a.vy += dy / d * 2.2 * DT;
        if (d < .55 && toss(a, 2.6, 1.1)) { a.vx -= dx / d * 3; a.vy -= dy / d * 3; if (Math.random() < .25) pop(a.x, a.y - 1, "WHOOSH!"); } } }
    }
    if (KIT.tick % 6 === 0) KIT.traps.forEach(([x, y], i) => {   // mouse traps snap when a crowd piles on them
      KIT.trapCd[i] -= DT * 6; if (KIT.trapCd[i] > 0) return;
      let n = 0; for (const a of ag) if ((a.x - x) ** 2 + (a.y - y) ** 2 < 1.6) n++;
      if (n < 5) return;
      KIT.trapCd[i] = 7; for (const a of ag) { const d = Math.hypot(a.x - x, a.y - y); if (d < 1.8 && !(a.springy && yeet(a, a.x - x, a.y - y))) toss(a, 2.4 + Math.random() * 1.6, 1 + Math.random() * .4); }
      pop(x, y - 1.2, "SNAP!"); shockwave(x, y, false); shake = Math.min(1.2, shake + .5); hitStop(.08); eventLog.add("snap");
      for (let k = 0; k < 8; k++) puff(x + rnd(-.8, .8), y + rnd(-.5, .5), .3, "#d9c7a0", .25, .7, 1);
    });
    if (KIT.tick % 30 === 0) for (const [x, y] of KIT.hot) puff(x + rnd(-1, 1), y + rnd(-1.5, 1.5), .2, "#ffd9b0", .35, 1.2, .9);   // heat shimmer off the oven door
  },
  ground(g) {
    // black-and-white linoleum, a bit sticky
    g.fillStyle = "#e8e2d4"; g.fillRect(0, 0, WW, WH);
    for (let y = 0; y < FENCE_Y; y += 2) for (let x = 0; x < WW; x += 2) if (((x + y) / 2) % 2) { g.fillStyle = "#2b2a2e"; g.fillRect(x, y, 2, 2); }
    const r = rng(41);
    for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(120,80,30,${(.08 + r() * .12).toFixed(2)})`; g.beginPath(); g.ellipse(r() * WW, 8 + r() * 56, .5 + r() * 1.6, .3 + r() * 1, r() * 3, 0, 7); g.fill(); }   // grease and juice stains
    for (let k = 0; k < 260; k++) { g.fillStyle = ["#e8b86a", "#d89a4a", "#f4d08a", "#8a5a2a"][k % 4]; g.fillRect(r() * WW, 8 + r() * 56, .1 + r() * .18, .08 + r() * .14); }   // crumbs everywhere
    // the hot floor in front of the oven
    for (const [x, y, rr] of KIT.hot) { const gr = g.createRadialGradient(x, y, .2, x, y, rr); gr.addColorStop(0, "rgba(255,110,40,.55)"); gr.addColorStop(1, "rgba(255,110,40,0)"); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); }
    // the glue trap
    const G = KIT.glue; g.fillStyle = "#f4e7b0"; g.fillRect(G.x0, G.y0, G.x1 - G.x0, G.y1 - G.y0); g.fillStyle = "rgba(220,190,60,.55)"; g.fillRect(G.x0 + .3, G.y0 + .3, G.x1 - G.x0 - .6, G.y1 - G.y0 - .6);
    g.font = "900 .7px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#7a5a10"; g.fillText("STICKY! (VIP AREA)", (G.x0 + G.x1) / 2, (G.y0 + G.y1) / 2);
    // the floor drain
    const [x, y, dr] = KIT.drain; const dg = g.createRadialGradient(x, y, .3, x, y, dr); dg.addColorStop(0, "rgba(40,60,80,.5)"); dg.addColorStop(1, "rgba(40,60,80,0)"); g.fillStyle = dg; g.beginPath(); g.arc(x, y, dr, 0, 7); g.fill();
    g.fillStyle = "#9aa0a8"; g.beginPath(); g.arc(x, y, .9, 0, 7); g.fill(); g.fillStyle = "#2b2f35"; for (let k = -2; k <= 2; k++) g.fillRect(x - .7, y + k * .3 - .06, 1.4, .12);
    // under the door: where the roaches come in
    g.fillStyle = "#3a2a1e"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
    g.fillStyle = "#1a120c"; g.fillRect(0, FENCE_Y + 3, WW, .5);
    g.font = "900 .9px Rubik, sans-serif"; g.fillStyle = "rgba(255,210,58,.8)"; g.fillText("UNDER THE DOOR · NO HUMANS · WIPE YOUR SIX FEET", 20, 71);
  },
  decor(g) {
    const C = KIT.cake;
    // the dropped cake on its plate, seen from above
    g.fillStyle = "#f4f4f0"; g.beginPath(); g.ellipse(20, 3.5, 11.5, 6, 0, 0, 7); g.fill();
    g.fillStyle = "#ff9ac8"; g.fillRect(C.x0, C.y0, C.x1 - C.x0, C.y1 - C.y0);
    g.fillStyle = "#ffffff"; for (let x = C.x0 + .5; x < C.x1; x += 1.4) { g.beginPath(); g.arc(x, C.y1 - .2, .45, 0, 7); g.fill(); }
    g.font = "900 1px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#d8322b"; g.fillText("HAPPY BIRTHDAY KEVIN", 20, 3.2);
    for (const o of obs) if (o.kind === "barrier") { g.lineWidth = o.th; g.strokeStyle = "#c9ced6"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
    // fridge, stove and counters from above
    const F2 = KIT.fridge; g.fillStyle = "#e9eef2"; g.fillRect(F2.x0, F2.y0, F2.x1 - F2.x0, F2.y1 - F2.y0); g.fillStyle = "#c9ced6"; g.fillRect(F2.x1 - .5, F2.y0 + 1, .3, F2.y1 - F2.y0 - 2);
    const S = KIT.stove; g.fillStyle = "#3a3d45"; g.fillRect(S.x0, S.y0, S.x1 - S.x0, S.y1 - S.y0);
    for (const yy of [19, 26.5]) for (const xx of [35.5, 38.2]) { g.strokeStyle = "#ff5a1f"; g.lineWidth = .2; g.beginPath(); g.arc(xx, yy, 1, 0, 7); g.stroke(); }
    g.fillStyle = "#b08a5a"; g.fillRect(0, 0, 9, 8); g.fillRect(31, 0, 9, 8);
    // the trash can and the Roach Motel
    g.fillStyle = "#7a8088"; g.beginPath(); g.arc(6, 50, 2, 0, 7); g.fill();
    g.fillStyle = "#ffd23a"; g.fillRect(34, 52, 5, 3.5); g.fillStyle = "#d8322b"; g.font = "900 .55px Rubik, sans-serif"; g.fillText("ROACH MOTEL", 36.5, 53.3); g.fillText("CHECK IN, NEVER OUT", 36.5, 54.2);
    // mouse traps: little wooden boards with a spring
    for (const [x, y] of KIT.traps) { g.fillStyle = "#c8945a"; g.fillRect(x - .9, y - .45, 1.8, .9); g.strokeStyle = "#9aa0a8"; g.lineWidth = .08; g.strokeRect(x - .7, y - .3, 1.4, .6); g.fillStyle = "#ffd23a"; g.fillRect(x + .35, y - .12, .3, .24); }
    // painted on the floor: the way to the cake
    g.font = "900 1.4px Rubik, sans-serif"; g.fillStyle = "#ffd23a"; g.strokeStyle = "#151617"; g.lineWidth = .25;
    g.strokeText("THIS WAY TO THE CAKE", 20, 45); g.fillText("THIS WAY TO THE CAKE", 20, 45);
  },
  bulbs: [...Array.from({ length: 10 }, (_, i) => [10 + i * 2.2, 11.5])],
  beams: [{ x: 4, y: 12, a: .3, sweep: .4, h: 12, white: true }, { x: 36, y: 12, a: Math.PI - .3, sweep: .4, h: 12, white: true }],
  extra3D(grp) {
    // the cake: three pink layers, frosting drops and one candle (lit)
    const C = KIT.cake, cx = (C.x0 + C.x1) / 2, cy = (C.y0 + C.y1) / 2 + .2;
    part(grp, "cyl", "#f4f4f0", 11, .3, 6.2, cx, .15, cy);
    part(grp, "box", "#ffffff", C.x1 - C.x0 + .1, .35, C.y1 - C.y0 + .1, cx, 2.6, cy - .2);
    for (let x = C.x0 + .5; x < C.x1; x += 1.4) part(grp, "sph", "#ffffff", .4, .55, .4, x, 2.4, C.y1 - .1);
    for (let i = 0; i < 9; i++) part(grp, "sph", ["#d8322b", "#ffd23a", "#4fb8ff"][i % 3], .25, .25, .25, C.x0 + 1.5 + i * 1.9, 2.95, cy - 1.5 + (i % 2));
    part(grp, "cyl", "#4fb8ff", .18, 2.4, .18, 27, 4, 1.5); part(grp, "sph", basic("#ffb238"), .25, .5, .25, 27, 5.5, 1.5);
    // the fridge (huge), with magnets and a handle
    const F2 = KIT.fridge;
    part(grp, "box", "#c9ced6", .3, 6, .5, F2.x1 + .15, 7, F2.y0 + 3); part(grp, "box", "#151617", F2.x1 - F2.x0, .4, F2.y1 - F2.y0 + .05, (F2.x0 + F2.x1) / 2, .2, (F2.y0 + F2.y1) / 2);
    for (const [y, z, c] of [[10, 18, "#d8322b"], [12, 22, "#ffd23a"], [9, 25, "#4fb8ff"], [13.5, 27, "#7ac943"]]) part(grp, "box", c, .15, .9, 1.2, F2.x1 + .08, y, z);
    part(grp, "box", basic("#fff6c8"), .2, .3, 14, F2.x1 + .05, .25, (F2.y0 + F2.y1) / 2);   // the light leaking from under the fridge door
    // the stove with glowing burners and an oven door
    const S = KIT.stove, sx = (S.x0 + S.x1) / 2, sy = (S.y0 + S.y1) / 2;
    part(grp, "box", "#2b2f35", .2, 4, 12, S.x0 - .05, 3.5, sy);
    part(grp, "box", basic("#ff7a2a"), .1, 2.2, 9, S.x0 - .15, 3.5, sy);
    for (const yy of [19, 26.5]) for (const xx of [35.5, 38.2]) part(grp, "cyl", basic("#ff5a1f"), 1, .1, 1, xx, 9.05, yy);
    part(grp, "cyl", "#9aa0a8", 2, 2.2, 2, 38.2, 10.2, 26.5);   // a pot on the back burner
    // counters with drawers
    for (const [x0, x1] of [[0, 9], [31, WW]]) { part(grp, "box", "#e8e2d4", x1 - x0 + .2, .4, 8.3, (x0 + x1) / 2, 9.2, 4);
      for (let x = x0 + 1.5; x < x1; x += 3) part(grp, "box", "#9a7448", 2.4, 2, .1, x, 6.5, 8.05); }
    // trash can with a banana peel over the rim
    const lid = part(grp, "cyl", "#5a5f66", 2.1, .25, 2.1, 6.6, 5.3, 50); lid.rotation.z = -.4;
    for (const s of [-1, 1]) { const p = part(grp, "box", "#ffd23a", .5, 1.4, .2, 4.4, 4.6, 50 + s * .4); p.rotation.z = .7 * s; }
    // the Roach Motel
    const rf = part(grp, "cyl", "#d8322b", 1.9, 5.2, 1.9, 36.5, 1.6, 53.75); rf.rotation.z = Math.PI / 2; rf.scale.set(1.8, 5.2, 1.2);
    // mouse traps in 3D
    for (const [x, y] of KIT.traps) { part(grp, "box", "#c8945a", 1.8, .15, .9, x, .08, y); part(grp, "box", "#c9ced6", 1.4, .05, .05, x, .2, y - .3); part(grp, "box", "#c9ced6", .05, .05, .6, x - .7, .2, y); part(grp, "box", "#ffd23a", .3, .1, .24, x + .5, .2, y); }
    // spilled things: a giant spoon, a sugar cube, a pea
    const sp = part(grp, "box", "#c9ced6", 7, .12, .5, 26, .1, 58); sp.rotation.y = .4; part(grp, "sph", "#c9ced6", 1, .25, .7, 29.3, .15, 56.6);
    part(grp, "box", "#ffffff", 1.2, 1.2, 1.2, 15, .6, 14.5); part(grp, "sph", "#7ac943", .6, .6, .6, 24, .6, 40);
    // kitchen walls all round (one-sided planes facing in, so the camera can look through them from outside), with a tiled band
    const wallM = new THREE.MeshStandardMaterial({ color: lin("#e9dcc0"), roughness: .9 }), tileM = new THREE.MeshStandardMaterial({ color: lin("#bcd6e0"), roughness: .4 });
    const wall = (w, x, z, ry) => { for (const [m, h, y] of [[tileM, 6, 3], [wallM, 22, 17]]) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); pl.position.set(x, y, z); pl.rotation.y = ry; pl.receiveShadow = true; grp.add(pl); } };
    wall(WW + 4, 20, -1.2, 0); wall(SH + 14, -1.5, SH / 2, Math.PI / 2); wall(SH + 14, WW + 1.5, SH / 2, -Math.PI / 2); wall(WW + 4, 20, SH + 6, Math.PI);
    for (let x = 1; x < WW; x += 2) part(grp, "box", "#a8c4d0", .05, 6, .05, x, 3, -1.15);   // grout lines on the back wall
    // the kitchen wall behind the cake: a clock that says 3:00
    const c = document.createElement("canvas"); c.width = c.height = 128; const x2 = c.getContext("2d");
    x2.fillStyle = "#f4f4f0"; x2.beginPath(); x2.arc(64, 64, 60, 0, 7); x2.fill(); x2.strokeStyle = "#151617"; x2.lineWidth = 6; x2.stroke();
    x2.lineWidth = 8; x2.beginPath(); x2.moveTo(64, 64); x2.lineTo(64, 24); x2.moveTo(64, 64); x2.lineTo(96, 64); x2.stroke();
    const tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding;
    const clock = new THREE.Mesh(new THREE.CircleGeometry(2, 32), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); clock.position.set(20, 15, -1.1); grp.add(clock);
  },
  ev: {
    robot(side) {
      const pts = [crowdPoint(), crowdPoint(), crowdPoint(), crowdPoint(), [side ? WW + 3 : -3, rnd(30, 56)]];
      addMover({ kind: "kit_robot", x: side ? -2 : WW + 2, y: rnd(30, 56), pts, speed: 2.3, r: 1.3, push: 40, scare: 2.8, say: "DIRT DETECTED.", sayEvery: 3,
        tick(m) { if (Math.random() < .012) pop(m.x, m.y - 1.4, ["BEEP BOOP!", "SUCTION: MAXIMUM", "YOU ARE ALL DIRT", "RETURNING TO DOCK... JUST KIDDING"][(Math.random() * 4) | 0]); } });
      caption("The cleaning robot woke up! It thinks you are dirt", true, 2200);
    },
    chancla() {
      const [x, y] = crowdPoint(); pop(x, y - 2, "INCOMING SLIPPER!");
      caption("Someone upstairs yelled 'I SAW ONE!'", true, 1800);
      later(1.2, () => {
        if (phase !== "show" && phase !== "evac") return;
        addMover({ kind: "kit_slipper", beh: "static", x, y, life: 2.5, r: 1.2, push: 0 });
        for (const a of ag) { const dx = a.x - x, dy = a.y - y, d = Math.hypot(dx, dy); if (d < 3.4 && !(a.springy && yeet(a, dx, dy))) toss(a, 2 + Math.random() * 2, .9 + Math.random() * .4); else if (d < 6 && d > .01) { a.vx += dx / d * 3; a.vy += dy / d * 3; } }
        pop(x, y - 1.5, "THWACK!"); shockwave(x, y, true); shake = Math.min(1.5, shake + 1); hitStop(.2); sfx("boom");
      });
    },
    spray() {
      const [x, y] = crowdPoint(); pop(x, y - 1.5, "PSSSSSHT!");
      for (let k = 0; k < 10; k++) later(k * .3, () => {
        if (phase !== "show" && phase !== "evac") return;
        for (let n = 0; n < 6; n++) puff(x + rnd(-3, 3), y + rnd(-3, 3), .4 + Math.random(), n % 2 ? "#b8f0a0" : "#e8ffe0", .6 + Math.random() * .5, 2.4, .25);
        for (const a of ag) { const dx = a.x - x, dy = a.y - y, d = Math.hypot(dx, dy); if (d < 5.5 && d > .01) { a.vx += dx / d * 1.4; a.vy += dy / d * 1.4; a.p += .15; } }
      });
      later(1.5, () => pop(x + 2, y - 1, "COUGH COUGH!"));
      caption("Bug spray! (scent: mountain breeze)", true, 1900);
    },
    luz() {
      flash = Math.max(flash, 1.2); pop(20, 30, "THE LIGHT! RUN!");
      for (const a of ag) { const dx = a.x - 20, dy = a.y - 34, d = Math.hypot(dx, dy) || 1; a.vx += dx / d * 3.5; a.vy += dy / d * 3.5; a.p += .1; }
      caption("Someone turned on the kitchen light! SCATTER!", true, 2000);
    },
    migas() {
      const [x, y] = crowdPoint();
      addMover({ kind: "kit_crumb", beh: "static", x, y, life: 8, r: .5, push: 0 });
      for (let k = 0; k < 14; k++) puff(x + rnd(-2, 2), y + rnd(-2, 2), 5 + Math.random() * 3, "#e8b86a", .2, 1, -2);
      pop(x, y - 1, "FREE CRUMBS!"); tempAttract(x, y, 2.6, 5, .4);
      caption("Toast crumbs are falling from the counter!", false, 1800);
    },
    gato(side) {
      const y = rnd(28, 56);
      addMover({ kind: "kit_cat", x: side ? -3 : WW + 3, y, pts: [crowdPoint(), [side ? WW + 5 : -5, y + rnd(-6, 6)]], speed: 2.6, r: 1.5, push: 30, scare: 3.4, say: "MEOW?", sayEvery: 3 });
      caption("The cat came to see what the noise was", true, 1900);
    },
  },
  performers: () => [
    { kind: "kit_king", ap: .3, orbit: [20, 3.4, .9, .5, 0], h: 3, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "kit_dancer", ap: 1.2, orbit: [14.5, 3, .5, .4, 0], h: 3, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "kit_dancer", ap: 2.4, orbit: [25.5, 3, .5, .4, 0], h: 3, x: 0, y: 0, ang: 0, t: 0 },
  ],
};
