// Human Tsunami · scene: Secret Lab Open House (aliens in tubes, failed experiments, scientists throwing chemicals, a teleporter)
const LAB = { tubes: [[6, 22], [34, 22], [6, 44], [34, 44]], tele: [20, 30, 1.6], teleT: 0, sci: 0 };
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
  events: ["escape", "quimicos", "blob", "laser", "clones", "pollo", "quimicos"],
  goal: o => o.kind === "barrier", goalMaxY: 12,
  heights: { machine: 3, tube: 3.2, console: 1.2, tele: .2 },
  lines: {
    escape: "Specimen 51 escaped its tube, took twelve selfies and left through gate 3.",
    quimicos: "The scientists threw unlabelled flasks at the visitors; some people are now very tall.",
    blob: "A friendly green blob rolled through the crowd absorbing hats.",
    laser: "A laser swept the hall for 'calibration purposes'.",
    clones: "The cloning machine sneezed and eighty identical visitors walked out.",
    pollo: "Experiment 7, a three-metre chicken, crossed the open house at a dignified pace.",
    tele: "The teleporter sent dozens of people to random spots. One of them is still in the gift shop.",
  },
  quotes: ["“Everyone who glows will stop glowing eventually,” said a scientist.", "“The teleporter is 98% safe,” said the brochure.", "“This lab does not exist,” said a man in sunglasses to reporters."],
  build() {
    rect(8, 0, 32, 6, "machine");
    seg(5, 9, WW - 5, 9, .4, "barrier");
    for (const [x, y] of LAB.tubes) circ(x, y, 1.3, "tube");
    rect(1, 56, 5, 59, "console"); rect(WW - 5, 56, WW - 1, 59, "console");
  },
  ground(g) {
    g.fillStyle = "#4a5160"; g.fillRect(0, 0, WW, WH);
    for (let y = 0; y < FENCE_Y; y += 2) for (let x = 0; x < WW; x += 2) { g.fillStyle = (x + y) % 4 ? "#4f5666" : "#454c5a"; g.fillRect(x + .04, y + .04, 1.92, 1.92); }
    g.strokeStyle = "rgba(125,255,106,.35)"; g.lineWidth = .1; for (let k = 0; k < 18; k++) { g.beginPath(); g.moveTo(20, 30); g.lineTo(20 + Math.cos(k * .35) * 30, 30 + Math.sin(k * .35) * 30); g.stroke(); }
    const [tx, ty, tr] = LAB.tele; g.fillStyle = "#1b2a3a"; g.beginPath(); g.arc(tx, ty, tr + .5, 0, 7); g.fill();
    g.strokeStyle = "#22d3ee"; g.lineWidth = .2; for (let r = .4; r < tr; r += .4) { g.beginPath(); g.arc(tx, ty, r, 0, 7); g.stroke(); }
    g.font = "900 .7px Rubik, sans-serif"; g.textAlign = "center"; g.fillStyle = "#22d3ee"; g.fillText("TELEPORTER · STEP ON AT YOUR OWN RISK", tx, ty + tr + 1.2);
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
    for (const x of [3, WW - 3]) { part(grp, "box", "#2b2f3a", 4, 1.2, 3, x, .6, 57.5); for (let k = 0; k < 4; k++) part(grp, "sph", basic(["#ff3fa4", "#7dff6a", "#ffd23a", "#22d3ee"][k]), .1, .1, .1, x - 1.2 + k * .8, 1.25, 56.5); }
  },
  frame3D(tt) {
    for (const p of LAB.parts || []) {
      if (p[0] === "core") p[1].scale.setScalar(1 + Math.sin(tt * 5) * .08);
      else if (p[0] === "alien") { p[1].position.y = 1.6 + Math.sin(tt * 1.3 + p[2]) * .25; p[1].rotation.y = Math.sin(tt * .7 + p[2]) * .8; }
      else { p[1].position.y = .3 + ((tt * .9) % 1) * 1.8; p[1].material.opacity = .6 * (1 - (tt * .9) % 1); }
    }
  },
  onStart() { LAB.teleT = 0; LAB.sci = 6; },
  step() {
    if (phase !== "show" && phase !== "evac") return;
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
    clones() { const n = ag.length < 5400 ? spawnAt(20, 54, 80) : 0; pop(20, 52, n ? `+${n} CLONES!` : "CLONE ERROR"); caption("The cloning machine sneezed", true, 1800); sfx("ufo"); },
    pollo(side) { const y = rnd(28, 52); addMover({ kind: "lab_chicken", x: side ? -3 : WW + 3, y, pts: [[side ? WW + 4 : -4, y + rnd(-6, 6)]], speed: 1.6, r: 1.3, push: 45, scare: 3, say: "BAWK.", sayEvery: 2.6 }); caption("Experiment 7 is walking around", true, 1800); },
  },
  performers: () => [{ kind: "lab_sci", orbit: [20, 7.6, 2.5, .4, 0], h: 0, x: 0, y: 0, ang: 0, t: 0 }],
};
