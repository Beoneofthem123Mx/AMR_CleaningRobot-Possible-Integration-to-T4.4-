// Human Tsunami · scene: Secret Lab Open House (aliens in tubes, failed experiments, scientists throwing chemicals, a teleporter)
const LAB = { tubes: [[6, 22], [34, 22], [6, 44], [34, 44]], tele: [20, 30, 1.6], teleT: 0, sci: 0,
  zap: [25, 33, 33, 40], zapOn: false, zapT: 4, grav: [11, 54, 3.4], portals: null };   // laser grid (switches on and off), zero-g room, temporary portals
SCENE_PERSONS.lab_sci = { body: "#f4f4f0", legs: "#3a5f8a", hat: "hair", hatCol: "#e8e8e8", shoes: "#2b2f35",
  extra(g, u, b) { for (const s of [-1, 1]) part(b, "sph", mat("#bfe3ff", { roughness: .05, transparent: true, opacity: .7 }), .07, .07, .05, .3, 1.68, s * .08); part(b, "cyl", basic("#7dff6a"), .06, .2, .06, .3, 1.0, .3); } };
SCENE_MODELS.lab_blob = (g, u) => { const b = part(g, "sph", mat("#7dff6a", { transparent: true, opacity: .8, roughness: .1 }), 1, .7, 1, 0, .6, 0); toyEyes(g, .7, .9, .3, .16); u.anim = tt => { b.scale.set(1 + Math.sin(tt * 6) * .1, .7 - Math.sin(tt * 6) * .08, 1 + Math.cos(tt * 6) * .1); }; };
SCENE_MODELS.lab_alien = (g, u) => {   // the escaped specimen: tall, skinny, three eyes, very fast
  for (const s of [-1, 1]) u.legs.push(leg(g, 0, .7, s * .1, .05, .7, "#9fe0ff"));
  part(g, "sph", "#9fe0ff", .2, .45, .22, 0, 1.1, 0); part(g, "sph", "#9fe0ff", .38, .32, .36, .05, 1.75, 0);
  for (const z of [-.15, 0, .15]) part(g, "sph", "#111214", .07, .1, .07, .35, 1.8 + (z ? 0 : .08), z);
  u.arms = [-1, 1].map(s => { const p = pivot(g, 0, 1.35, s * .22); part(p, "cyl", "#9fe0ff", .03, .7, .03, 0, -.35, 0); return p; });
};
SCENE_MODELS.lab_laser = (g) => { const b = part(g, "box", basic("#ff3b2f", { transparent: true, opacity: .75 }), .12, 1.6, 18, 0, .9, 0); b.castShadow = false; part(g, "box", basic("#ffd0d0"), .04, 1.6, 18, 0, .9, 0); };
SCENE_MODELS.lab_flask = (g) => { part(g, "sph", mat("#ff6fb1", { transparent: true, opacity: .75 }), .16, .16, .16, 0, 0, 0); part(g, "cyl", "#e8e8e8", .04, .12, .04, 0, .16, 0); };
SCENE_MODELS.lab_chicken = (g, u) => {   // a failed experiment: a three-metre chicken
  part(g, "sph", "#f4f4f0", 1.2, 1, .9, 0, 1.8, 0); part(g, "sph", "#f4f4f0", .5, .55, .5, .9, 2.8, 0); part(g, "cone", "#ff9a3c", .18, .4, .18, 1.4, 2.75, 0).rotation.z = -Math.PI / 2;
  part(g, "sph", "#d8322b", .15, .25, .08, .9, 3.4, 0); toyEyes(g, 1.2, 2.95, .2, .12);
  for (const s of [-1, 1]) u.legs.push(leg(g, 0, 1, s * .4, .08, 1, "#ff9a3c"));
};
const LAB_EFFECTS = [
  ["SHRINK!", a => { a.sc *= .6; }], ["I'M HUGE!", a => { a.sc = Math.min(1.7, a.sc * 1.45); a.bw = (a.bw || 1) * 1.2; }],
  ["I GLOW!", a => { a.rad = t + 12; }], ["I CAN FLY!", a => { toss(a, 5 + Math.random() * 3, 1.8); }], ["ZOOOM!", a => { a.v0 *= 1.6; }],
];
SCENES.laboratorio = {
  name: "Secret Lab Open House", tag: "Nothing to see here (please look)", outside: "#3e4450", bulbH: 2.6, music: "space", night: true,
  light: { sky: 0x9fd8ff, ground: 0x2a3040, hemi: .42, sun: 0xd8f0ff, sunI: .85 }, crowd: 2900, fenceBudget: 85, maxGates: 5, guards: 5,
  gates: [F, T, F, T, F, T, F], unlock: 48,
  intro: "The secret government lab is having an open house (it's not secret anymore). The Big Machine demo is at the back, aliens float in tubes, the teleporter in the middle sends whoever steps on it somewhere random, and the scientists keep throwing chemicals at people 'for science'.",
  acts: ["Behold the Big Machine!", "For science!", "Do not touch the tubes!", "Results are… inconclusive!"],
  events: ["escape", "quimicos", "blob", "laser", "clones", "pollo", "quimicos", "brecha", "portal", "portal", "lockdown", "lockdown"],
  goal: o => o.kind === "barrier", goalMaxY: 12,
  heights: { machine: 3, tube: 3.2, console: 1.2, tele: .2, blast: 2.6 },
  lines: {
    lockdown: "A lockdown dropped blast doors across the hall for eight seconds. The only way through was the middle, which everybody found at once.",
    escape: "Specimen 51 escaped its tube, took twelve selfies and left through gate 3.",
    quimicos: "The scientists threw unlabelled flasks at the visitors; some people are now very tall.",
    blob: "A friendly green blob rolled through the crowd absorbing hats.",
    laser: "A laser swept the hall for 'calibration purposes'.",
    clones: "The cloning machine sneezed and eighty identical visitors walked out.",
    pollo: "Experiment 7, a three-metre chicken, crossed the open house at a dignified pace.",
    tele: "The teleporter sent dozens of people to random spots. One of them is still in the gift shop.",
    brecha: "Containment breach: every tube cracked at once and the specimens went to look for the snack bar.",
    portal: "Two portals opened in the crowd. A man walked through one forty times 'to check'.",
  },
  quotes: ["“Everyone who glows will stop glowing eventually,” said a scientist.", "“The teleporter is 98% safe,” said the brochure.", "“This lab does not exist,” said a man in sunglasses to reporters."],
  build() {
    rect(8, 0, 32, 6, "machine");
    seg(5, 9, WW - 5, 9, .4, "barrier");
    for (const [x, y] of LAB.tubes) circ(x, y, 1.3, "tube");
    rect(1, 56, 5, 59, "console"); rect(WW - 5, 56, WW - 1, 59, "console");
    if (LAB.lock > 0) { seg(1, 37, 15.5, 37, .5, "blast"); seg(24.5, 37, WW - 1, 37, .5, "blast"); }   // lockdown: blast doors with one gap in the middle
  },
  ground(g) {
    g.fillStyle = "#4a5160"; g.fillRect(0, 0, WW, WH);
    for (let y = 0; y < FENCE_Y; y += 2) for (let x = 0; x < WW; x += 2) { g.fillStyle = (x + y) % 4 ? "#4f5666" : "#454c5a"; g.fillRect(x + .04, y + .04, 1.92, 1.92); }
    g.strokeStyle = "rgba(125,255,106,.35)"; g.lineWidth = .1; for (let k = 0; k < 18; k++) { g.beginPath(); g.moveTo(20, 30); g.lineTo(20 + Math.cos(k * .35) * 30, 30 + Math.sin(k * .35) * 30); g.stroke(); }
    const [tx, ty, tr] = LAB.tele; g.fillStyle = "#1b2a3a"; g.beginPath(); g.arc(tx, ty, tr + .5, 0, 7); g.fill();
    g.strokeStyle = "#22d3ee"; g.lineWidth = .2; for (let r = .4; r < tr; r += .4) { g.beginPath(); g.arc(tx, ty, r, 0, 7); g.stroke(); }
    g.font = "900 .7px Rubik, sans-serif"; g.textAlign = "center"; g.fillStyle = "#22d3ee"; g.fillText("TELEPORTER · STEP ON AT YOUR OWN RISK", tx, ty + tr + 1.2);
    { const [x0, y0, x1, y1] = LAB.zap; g.fillStyle = "rgba(255,59,47,.14)"; g.fillRect(x0, y0, x1 - x0, y1 - y0); g.strokeStyle = "#ff3b2f"; g.lineWidth = .15; g.setLineDash([.5, .3]); g.strokeRect(x0, y0, x1 - x0, y1 - y0); g.setLineDash([]);
      g.font = "900 .7px Rubik, sans-serif"; g.textAlign = "center"; g.fillStyle = "#ff3b2f"; g.fillText("LASER GRID · TESTING IN PROGRESS", (x0 + x1) / 2, y1 + .9); }
    { const [gx, gy, gr] = LAB.grav; g.fillStyle = "rgba(169,139,255,.18)"; g.beginPath(); g.arc(gx, gy, gr, 0, 7); g.fill(); g.strokeStyle = "#a98bff"; g.lineWidth = .15; g.beginPath(); g.arc(gx, gy, gr, 0, 7); g.stroke();
      g.font = "900 .7px Rubik, sans-serif"; g.textAlign = "center"; g.fillStyle = "#a98bff"; g.fillText("ZERO-G ROOM", gx, gy + gr + .9); }
    g.fillStyle = "#33384a"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
  },
  decor(g) {
    g.fillStyle = "#2b2f3a"; g.fillRect(8, 0, 24, 6); for (let x = 9; x < 31; x += 2) { g.fillStyle = ["#7dff6a", "#22d3ee", "#ff3fa4"][x % 3]; g.fillRect(x, 1, .8, .5); }
    for (const o of obs) if (o.kind === "barrier") { g.lineWidth = .3; g.strokeStyle = "#ffd23a"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
  },
  bulbs: Array.from({ length: 13 }, (_, i) => [7 + i * 2.15, 9.7]),
  beams: [{ x: 12, y: 4, a: Math.PI / 2, sweep: .6, h: 8 }, { x: 28, y: 4, a: Math.PI / 2, sweep: .6, h: 8 }, { x: 20, y: 30, a: Math.PI / 2, sweep: 3, h: 6 }],
  extra3D(grp) {
    LAB.parts = [];
    // the Big Machine: coils, a glowing core and arcs
    part(grp, "box", "#2b2f3a", 24, 3, 6, 20, 1.5, 3);
    for (const x of [12, 28]) { part(grp, "cyl", "#b87333", .9, 4.5, .9, x, 3, 3); for (let k = 0; k < 6; k++) part(grp, "cyl", "#d9a830", 1, .12, 1, x, 1.4 + k * .6, 3); part(grp, "sph", "#c9ced6", .9, .9, .9, x, 5.6, 3); }
    const core = part(grp, "sph", basic("#7dff6a"), 1.4, 1.4, 1.4, 20, 4.2, 3); LAB.parts.push(["core", core]);
    // specimen tubes: glass, green liquid and a floating alien in each
    const glass = mat("#bfe3ff", { transparent: true, opacity: .35, roughness: .05 });
    for (const [x, y] of LAB.tubes) {
      part(grp, "cyl", "#2b2f3a", 1.4, .4, 1.4, x, .2, y); part(grp, "cyl", "#2b2f3a", 1.4, .3, 1.4, x, 3.35, y);
      part(grp, "cyl", basic("#3fae5a", { color: lin("#3fae5a").multiplyScalar(.6), transparent: true, opacity: .55 }), 1.15, 2.8, 1.15, x, 1.8, y);
      part(grp, "cyl", glass, 1.3, 3, 1.3, x, 1.8, y);
      const al = pivot(grp, x, 1.6, y); part(al, "sph", "#9fe0ff", .25, .45, .25, 0, 0, 0); part(al, "sph", "#9fe0ff", .4, .32, .38, 0, .6, 0); for (const z of [-.13, .13]) part(al, "sph", "#111214", .08, .11, .08, .32, .66, z);
      LAB.parts.push(["alien", al, x + y]);
    }
    // the teleporter: a ring of pylons and a spinning halo
    const [tx, ty, tr] = LAB.tele; for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283; part(grp, "cyl", "#c9ced6", .12, 2, .12, tx + Math.cos(a) * (tr + .3), 1, ty + Math.sin(a) * (tr + .3)); }
    const halo = part(grp, "cyl", basic("#22d3ee", { transparent: true, opacity: .5 }), tr, .05, tr, tx, 2.1, ty); LAB.parts.push(["halo", halo]);
    { const [x0, y0, x1, y1] = LAB.zap; LAB.bars = [];
      for (const [x, y] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) part(grp, "cyl", "#3a3d45", .12, 1.6, .12, x, .8, y);
      for (let k = 0; k < 4; k++) { const b = part(grp, "box", basic("#ff3b2f", { transparent: true, opacity: .8 }), x1 - x0, .04, .04, (x0 + x1) / 2, .4 + k * .35, y0); b.castShadow = false; LAB.bars.push(b);
        const b2 = part(grp, "box", basic("#ff3b2f", { transparent: true, opacity: .8 }), x1 - x0, .04, .04, (x0 + x1) / 2, .4 + k * .35, y1); b2.castShadow = false; LAB.bars.push(b2);
        for (const x of [x0, x1]) { const b3 = part(grp, "box", basic("#ff3b2f", { transparent: true, opacity: .8 }), .04, .04, y1 - y0, x, .4 + k * .35, (y0 + y1) / 2); b3.castShadow = false; LAB.bars.push(b3); } } }
    { const [gx, gy, gr] = LAB.grav; const ring = part(grp, "cyl", basic("#a98bff", { transparent: true, opacity: .35 }), gr, .05, gr, gx, 3, gy); ring.castShadow = false; LAB.parts.push(["gring", ring]);
      for (let k = 0; k < 8; k++) { const b = part(grp, "sph", basic("#e0d4ff"), .1, .1, .1, gx + Math.cos(k) * gr * .7, 1 + (k % 3) * .6, gy + Math.sin(k) * gr * .7); LAB.parts.push(["mote", b, k]); } }
    for (const x of [.6, WW - .6]) for (let y = 12; y < 64; y += 8) { part(grp, "cyl", "#8a8f99", .18, 6, .18, x, 3, y).rotation.x = Math.PI / 2; part(grp, "cyl", "#b87333", .12, 1.4, .12, x, 1.2 + (y % 3) * .4, y + 2); }
    for (const x of [3, WW - 3]) { part(grp, "box", "#2b2f3a", 4, 1.2, 3, x, .6, 57.5); for (let k = 0; k < 4; k++) part(grp, "sph", basic(["#ff3fa4", "#7dff6a", "#ffd23a", "#22d3ee"][k]), .1, .1, .1, x - 1.2 + k * .8, 1.25, 56.5); }
  },
  frame3D(tt) {
    for (const p of LAB.parts || []) {
      if (p[0] === "core") p[1].scale.setScalar(1 + Math.sin(tt * 5) * .08);
      else if (p[0] === "alien") { p[1].position.y = 1.6 + Math.sin(tt * 1.3 + p[2]) * .25; p[1].rotation.y = Math.sin(tt * .7 + p[2]) * .8; }
      else if (p[0] === "gring") p[1].rotation.y = tt * .6;
      else if (p[0] === "mote") { p[1].position.y = 1 + Math.sin(tt * 1.2 + p[2]) * .8 + (p[2] % 3) * .4; }
      else { p[1].position.y = .3 + ((tt * .9) % 1) * 1.8; p[1].material.opacity = .6 * (1 - (tt * .9) % 1); }
    }
    for (const b of LAB.bars || []) { b.visible = LAB.zapOn || (phase === "plan" && Math.sin(tt * 3) > .6); if (b.visible) b.material.opacity = .55 + Math.sin(tt * 40) * .3; }
    if (LAB.portals) for (const [i, pt] of LAB.portals.entries()) { if (Math.random() < .5) puff(pt[0] + Math.cos(tt * 6 + i) * 1.2, pt[1] + Math.sin(tt * 6 + i) * 1.2, 1 + Math.random(), i ? "#4fb8ff" : "#ff9a3c", .25, .6, .3); }
  },
  onStart() { LAB.lock = 0; LAB.teleT = 0; LAB.sci = 6; LAB.zapOn = false; LAB.zapT = 4; LAB.portals = null; },
  step() {
    if (phase !== "show" && phase !== "evac") return;
    if (LAB.lock > 0) { LAB.lock -= DT; if (LAB.lock <= 0) { buildWorld(); if (!demo) { pop(20, 36, "DOORS OPEN!"); sfx("beep"); } } }
    // the laser grid switches on 3 s out of every 7: anyone caught inside gets zapped out
    LAB.zapT -= DT; if (LAB.zapT <= 0) { LAB.zapOn = !LAB.zapOn; LAB.zapT = LAB.zapOn ? 3 : 4; if (LAB.zapOn && !demo) { pop((LAB.zap[0] + LAB.zap[2]) / 2, LAB.zap[1] - 1, "GRID ON!"); sfx("beep"); } }
    if (LAB.zapOn) { const [x0, y0, x1, y1] = LAB.zap, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      for (const a of ag) if (a.x > x0 && a.x < x1 && a.y > y0 && a.y < y1) { const dx = a.x - cx, dy = a.y - cy, d = Math.hypot(dx, dy) || 1; a.vx += dx / d * 9 * DT; a.vy += dy / d * 9 * DT; a.p += .2; if (Math.random() < .004) { toss(a, 1, .6); if (!demo) pop(a.x, a.y - 1, ["ZAP!", "BZZZT!", "MY HAIR!"][(Math.random() * 3) | 0]); } } }
    // the zero-g room: people float around inside and nobody gets squeezed
    { const [gx, gy, gr] = LAB.grav; for (const a of ag) if ((a.x - gx) ** 2 + (a.y - gy) ** 2 < gr * gr) { a.p *= .5; if (a.air <= 0 && Math.random() < .02) toss(a, 1.2 + Math.random() * 1.4, 1.6); } }
    // portals: walk into the orange one, come out of the blue one
    if (LAB.portals) { const [[ax, ay], [bx, by]] = LAB.portals; for (const a of ag) if ((a.x - ax) ** 2 + (a.y - ay) ** 2 < 1.4 && Math.random() < .4) { a.x = bx + (Math.random() - .5) * 2; a.y = by + (Math.random() - .5) * 2; if (!demo && Math.random() < .1) pop(a.x, a.y - 1, ["WHOA!", "AGAIN!", "WHERE AM I?"][(Math.random() * 3) | 0]); } }
    // the teleporter: anyone standing on it is beamed to a random free spot
    LAB.teleT -= DT;
    if (LAB.teleT <= 0) {
      LAB.teleT = .6; const [tx, ty, tr] = LAB.tele;
      for (const a of ag) if ((a.x - tx) ** 2 + (a.y - ty) ** 2 < tr * tr && a.air <= 0 && Math.random() < .35) {
        const [nx, ny] = crowdPoint(); if (blockedC[cellOf(nx, ny)]) continue;
        puff(a.x, a.y, 1, "#22d3ee", .5, .8, .5); a.x = nx; a.y = ny; a.vx = a.vy = 0; puff(nx, ny, 1, "#22d3ee", .5, .8, .5); eventLog.add("tele");
        if (!demo && Math.random() < .25) pop(nx, ny - 1, ["BZZT!", "WHERE AM I?", "I CAN TASTE COLOURS", "AGAIN! AGAIN!"][(Math.random() * 4) | 0]);
      }
    }
  },
  ev: {
    escape(side) {
      addMover({ kind: "lab_alien", x: LAB.tubes[0][0] + 2, y: LAB.tubes[0][1], pts: [crowdPoint(), crowdPoint(), crowdPoint(), [openGateX(), SH + 3]], speed: 5.2, r: .45, push: 22, scare: 3.2, agile: true, say: "ZORP!", sayEvery: 2,
        tick(m) { if (Math.random() < .01) pop(m.x, m.y - 1.8, ["SELFIE?", "TAKE ME TO YOUR NACHOS", "ZORP ZORP!", "I COME IN PEACE (FAST)"][(Math.random() * 4) | 0]); } });
      caption("Specimen 51 escaped!", true, 2000); sfx("siren");
    },
    quimicos(side) {
      for (let n = 0; n < 5; n++) later(n * .4, () => {
        const sx = side ? 3 : WW - 3, sy = 56, [tx, ty] = crowdPoint();
        addMover({ kind: "lab_flask", beh: "static", life: 2, x: sx, y: sy, sx, sy, tx, ty, r: .2, push: 0, air: true, h: 1.5, say: "", tick(m) {
          const q = Math.min(1, m.t / 1); m.x = m.sx + (m.tx - m.sx) * q; m.y = m.sy + (m.ty - m.sy) * q; m.h = 1.5 + Math.sin(q * Math.PI) * 5;
          if (q >= 1 && !m.hit) { m.hit = true; m.dead = true; const fx = LAB_EFFECTS[(Math.random() * LAB_EFFECTS.length) | 0];
            for (let k = 0; k < 8; k++) puff(tx + rnd(-1, 1), ty + rnd(-1, 1), .4, ["#ff6fb1", "#7dff6a", "#a98bff"][k % 3], .6, 1.2, .5);
            let n2 = 0; for (const a of ag) if ((a.x - tx) ** 2 + (a.y - ty) ** 2 < 3) { fx[1](a); n2++; }
            pop(tx, ty - 1.2, n2 ? fx[0] : "SPLOOSH!"); } } });
      });
      caption("The scientists are throwing chemicals! For science!", true, 2000);
    },
    blob(side) { addMover({ kind: "lab_blob", beh: "bounce", x: side ? 3 : WW - 3, y: rnd(24, 50), vx: (side ? 1 : -1) * 2.5, vy: rnd(-1.5, 1.5), r: 1, push: 20, life: 14, say: "BLORP!", sayEvery: 2.5 }); caption("A friendly blob is loose", false, 1800); },
    laser() {
      const y0 = rnd(20, 50); addMover({ kind: "lab_laser", beh: "static", life: 5, x: 0, y: y0, r: .1, push: 0, air: true, say: "", tick(m) {
        m.x = (m.t / 5) * WW; if (Math.random() < .5) puff(m.x, m.y + rnd(-8, 8), .8, "#ff3b2f", .2, .3, 0); m.ang = 0;
        for (const a of ag) if (Math.abs(a.x - m.x) < .6 && Math.abs(a.y - m.y) < 9 && a.air <= 0) { a.vx += 2; toss(a, .9, .5); } } });
      caption("Laser calibration in progress. Jump!", true, 1800); pop(4, y0 - 2, "PEW PEW!");
    },
    clones() { if (phase !== "show") return; const n = ag.length < 5400 ? spawnAt(20, 54, 80) : 0; pop(20, 52, n ? `+${n} CLONES!` : "CLONE ERROR"); caption("The cloning machine sneezed", true, 1800); sfx("ufo"); },
    lockdown() {   // blast doors slam down across the hall: one narrow way through for eight seconds
      if (LAB.lock > 0) return; LAB.lock = 8;
      for (const a of ag) if (Math.abs(a.y - 37) < .7 && (a.x < 15.5 || a.x > 24.5)) a.y += a.y < 37 ? -.8 : .8;   // nobody gets cut in half
      buildWorld(); caption("LOCKDOWN! Blast doors are coming down", true, 2200); pop(20, 35, "LOCKDOWN!"); sfx("siren"); shake = Math.min(1, shake + .4);
    },
    brecha() {   // containment breach: every tube cracks at once
      flash = Math.max(flash, .8); shake = Math.min(1.2, shake + .6); sfx("siren"); caption("CONTAINMENT BREACH!", true, 2400);
      for (const [x, y] of LAB.tubes) { for (let k = 0; k < 10; k++) puff(x + rnd(-1, 1), y + rnd(-1, 1), rnd(.5, 3), "#3fae5a", .6, 1.6, .6); debris(x, y, 1.5, 14, 4, ["#bfe3ff", "#9fd8ff", "#3fae5a"]);
        addMover({ kind: "lab_alien", x: x + 2, y, pts: [crowdPoint(), crowdPoint(), [openGateX(), SH + 3]], speed: 4.6, r: .45, push: 22, scare: 3, agile: true, say: "", sayEvery: 9 }); }
      pop(20, 20, "WEE-OO WEE-OO!");
    },
    portal() {
      const a = crowdPoint(), b = crowdPoint(); if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 10) return; LAB.portals = [a, b];
      later(10, () => { LAB.portals = null; }); pop(a[0], a[1] - 1.5, "PORTAL!"); pop(b[0], b[1] - 1.5, "...PORTAL?"); caption("Two portals opened in the crowd", true, 1800); sfx("ufo");
    },
    pollo(side) { const y = rnd(28, 52); addMover({ kind: "lab_chicken", x: side ? -3 : WW + 3, y, pts: [[side ? WW + 4 : -4, y + rnd(-6, 6)]], speed: 1.6, r: 1.3, push: 45, scare: 3, say: "BAWK.", sayEvery: 2.6 }); caption("Experiment 7 is walking around", true, 1800); },
  },
  performers: () => [{ kind: "lab_sci", orbit: [20, 7.6, 2.5, .4, 0], h: 0, x: 0, y: 0, ang: 0, t: 0 }],
};
