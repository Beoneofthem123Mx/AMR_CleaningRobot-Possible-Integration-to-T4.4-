// Human Tsunami · scene: Factory Open Day (conveyor belts that carry people along, hot ovens, robot arms and presses)
const FAB = { belts: [[4, 22, 36, 24.4, 1], [4, 40, 36, 42.4, -1]], ovens: [[7, 31, 2.2], [33, 31, 2.2], [20, 52, 2.4]], boxes: [], arms: [], t: 0 };
SCENE_PERSONS.fab_worker = { body: "#2f6fc4", legs: "#1f2a44", hat: "cap", hatCol: "#ffd23a", shoes: "#2b2f35",
  extra(g, u, b) { part(b, "box", "#ff7a1a", .32, .3, .5, .02, 1.1, 0); part(b, "box", "#f4f4f0", .04, .1, .3, .3, 1.12, 0); } };
SCENE_PERSONS.fab_boss = { body: "#2b2f35", legs: "#2b2f35", hat: "cap", hatCol: "#f4f4f0", extra(g, u, b) { part(b, "box", "#d8322b", .04, .3, .08, .28, 1.2, 0); part(b, "box", "#c9ced6", .06, .3, .22, .25, .95, .3); } };
SCENE_MODELS.fab_robot = (g, u) => {   // a loose robot arm on wheels
  part(g, "box", "#ff7a1a", 1.1, .5, .9, 0, .45, 0); for (const z of [-.5, .5]) { const w = part(g, "cyl", "#151617", .25, .15, .25, 0, .25, z); w.rotation.x = Math.PI / 2; }
  const arm = pivot(g, 0, .7, 0); part(arm, "box", "#ffd23a", .25, 1.4, .25, 0, .7, 0); const fore = pivot(arm, 0, 1.4, 0); part(fore, "box", "#ffd23a", .2, 1.1, .2, 0, .55, 0);
  part(fore, "box", "#2b2f35", .4, .12, .4, 0, 1.15, 0); toyEyes(g, .55, .55, .22, .1);
  u.anim = tt => { arm.rotation.z = Math.sin(tt * 3) * .9; fore.rotation.z = Math.cos(tt * 4.3) * 1.1; arm.rotation.y = tt * 2; };
};
SCENE_MODELS.fab_box = (g, u, m) => { u.ball = pivot(g, 0, .45, 0); part(u.ball, "box", "#c8a06a", .9, .9, .9, 0, 0, 0); part(u.ball, "box", "#d8322b", .92, .12, .3, 0, .3, 0); u.anim = (tt, mm) => { u.ball.rotation.z = -(mm.spin || 0); }; };
const FAB_SAYS = ["HARD HATS ON!", "FREE SAMPLES AT THE END!", "DON'T TOUCH THE RED BUTTON", "THAT'S NOT A SLIDE!", "MIND THE BELT!"];
SCENES.fabrica = {
  name: "Factory Open Day", tag: "Mind the conveyor belt", outside: "#6b6f76", bulbH: 3.2, music: "edm",
  light: { sky: 0xfff4e0, ground: 0x5a5a5a, hemi: .58, sun: 0xfff0d8, sunI: 1.05 }, crowd: 2700, fenceBudget: 95, maxGates: 5, guards: 4,
  gates: [F, T, F, T, F, T, F], unlock: 38,
  intro: "The rubber-duck factory opens its doors. The free samples are at the back, behind two conveyor belts that carry anyone who steps on them sideways, and three ovens nobody should hug.",
  acts: ["Samples for everyone!", "Watch the belts!", "Hard hats on!", "Fresh from the oven!"],
  events: ["robot", "cajas", "horno", "turno", "robot", "cajas", "sirena"],
  goal: o => o.kind === "barrier", goalMaxY: 13,
  heights: { counter: 1.2, oven: 2.6, belt: .35, machine: 3, silo: 5 },
  lines: {
    robot: "A robot arm escaped the line and hugged visitors at an industrial pace.",
    cajas: "An avalanche of rubber-duck boxes rolled through the open day.",
    horno: "An oven door blew open and gave half the crowd an instant tan.",
    turno: "Shift change: three hundred workers crossed the crowd to clock out on time.",
    sirena: "Someone pressed the red button. The siren was 'just a test', apparently.",
  },
  quotes: ["“The belts are a feature,” said the plant manager.", "“I came for a duck and left on a conveyor belt,” said a visitor.", "“Next year, a fence,” promised the safety officer."],
  build() {
    rect(9, 0, 31, 6.5, "counter");
    seg(5, 9, WW - 5, 9, .4, "barrier");
    for (const [x0, y0, x1, y1] of FAB.belts) rect(x0, y0, x1, y1, "belt");
    for (const [x, y, r] of FAB.ovens) circ(x, y, r, "oven");
    rect(0, 14, 3, 20, "machine"); rect(WW - 3, 14, WW, 20, "machine"); circ(4, 58, 2, "silo"); circ(WW - 4, 58, 2, "silo");
  },
  ground(g) {
    g.fillStyle = "#8d9096"; g.fillRect(0, 0, WW, WH);
    const rand = rng(77); for (let k = 0; k < 1500; k++) { g.fillStyle = k % 2 ? "rgba(0,0,0,.07)" : "rgba(255,255,255,.05)"; g.fillRect(rand() * WW, rand() * FENCE_Y, .3, .2); }
    // yellow walkways and hazard stripes around the ovens
    g.strokeStyle = "#f2c230"; g.lineWidth = .18; g.setLineDash([.8, .5]);
    for (const x of [2, WW - 2]) { g.beginPath(); g.moveTo(x, 64); g.lineTo(x, 10); g.stroke(); }
    g.setLineDash([]);
    for (const [x, y, r] of FAB.ovens) { g.save(); g.beginPath(); g.arc(x, y, r + 1.4, 0, 7); g.arc(x, y, r + .3, 0, 7, true); g.clip(); for (let k = -20; k < 20; k++) { g.fillStyle = k % 2 ? "#f2c230" : "#1c1c1c"; g.fillRect(x + k * .6, y - 5, .6, 10); } g.restore(); }
    g.fillStyle = "#6b6f76"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
  },
  decor(g) {
    g.fillStyle = "#ffd23a"; g.fillRect(9, 0, 22, 6.5); g.fillStyle = "#d8322b"; g.fillRect(9, 5.3, 22, 1.2);
    g.font = "900 1.4px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#111214"; g.fillText("FREE RUBBER DUCKS", 20, 2.8);
    for (const o of obs) if (o.kind === "barrier") { g.lineWidth = .3; g.strokeStyle = "#f2c230"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
    for (const [x0, y0, x1, y1, d] of FAB.belts) {   // rubber belts with arrows showing which way they drag you
      g.fillStyle = "#2b2d33"; g.fillRect(x0, y0, x1 - x0, y1 - y0); g.fillStyle = "#4a4d55"; g.fillRect(x0, y0, x1 - x0, .15); g.fillRect(x0, y1 - .15, x1 - x0, .15);
      g.fillStyle = "#f2c230"; for (let x = x0 + 1; x < x1 - 1; x += 2.2) { g.beginPath(); g.moveTo(x + d * .6, (y0 + y1) / 2); g.lineTo(x - d * .3, y0 + .35); g.lineTo(x - d * .3, y1 - .35); g.fill(); }
    }
    for (const [x, y, r] of FAB.ovens) { g.fillStyle = "#3a3d45"; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = "#ff7a1a"; g.beginPath(); g.arc(x, y, r * .55, 0, 7); g.fill(); }
  },
  bulbs: Array.from({ length: 14 }, (_, i) => [6 + i * 2.15, 9.6]),
  beams: [{ x: 12, y: 3, a: Math.PI / 2, sweep: .6, h: 8, white: true }, { x: 28, y: 3, a: Math.PI / 2, sweep: .6, h: 8, white: true }],
  extra3D(grp) {
    FAB.boxes = []; FAB.arms = [];
    const steel = mat("#9aa0a8", { metalness: .6, roughness: .4 }), dark = mat("#2b2d33", { roughness: .8 });
    // conveyor belts: rollers, side rails and boxes riding along
    for (const [x0, y0, x1, y1, d] of FAB.belts) {
      for (const z of [y0 - .05, y1 + .05]) part(grp, "box", steel, x1 - x0, .12, .1, (x0 + x1) / 2, .5, z);
      for (let x = x0 + .5; x < x1; x += 3) for (const z of [y0, y1]) part(grp, "cyl", dark, .08, .5, .08, x, .25, z);
      for (let k = 0; k < 6; k++) { const b = part(grp, "box", mat(["#c8a06a", "#ffd23a", "#d8322b"][k % 3]), .7, .55, .7, x0 + k * 5.4, .65, (y0 + y1) / 2); FAB.boxes.push([b, x0, x1, d, k * 5.4]); }
    }
    // ovens: brick drums with a glowing mouth and a chimney puffing
    for (const [x, y, r] of FAB.ovens) {
      part(grp, "cyl", mat("#8a3f2a", { roughness: .9 }), r, 2.6, r, x, 1.3, y);
      const glow = part(grp, "sph", basic("#ff7a1a"), r * .55, .5, r * .55, x, 2.62, y); FAB.arms.push(["glow", glow]);
      part(grp, "cyl", dark, .35, 4, .35, x + r * .5, 4.6, y);
    }
    // robot arms swinging over the belts
    for (const [x, y] of [[12, 27], [28, 37], [20, 18]]) {
      part(grp, "cyl", "#ff7a1a", .5, .6, .5, x, .3, y);
      const a = pivot(grp, x, .6, y), b1 = part(a, "box", "#ffd23a", .3, 2.2, .3, 0, 1.1, 0), el = pivot(a, 0, 2.2, 0); part(el, "box", "#ffd23a", .25, 1.8, .25, 0, .9, 0); part(el, "box", "#2b2f35", .5, .15, .5, 0, 1.8, 0);
      FAB.arms.push(["arm", a, el, x + y]);
    }
    // presses at the side machines
    for (const x of [1.5, WW - 1.5]) { part(grp, "box", dark, 2.6, .4, 5.6, x, 3.2, 17); const p = part(grp, "box", steel, 2.2, 1, 4.8, x, 3, 17); FAB.arms.push(["press", p]); }
    for (const [x, y] of [[4, 58], [WW - 4, 58]]) { part(grp, "cone", "#c9ced6", 2, 1.2, 2, x, 5.6, y); }
    grp.add(Object.assign(new THREE.Group(), { name: "fabfx" }));
  },
  frame3D(tt) {
    for (const [b, x0, x1, d, off] of FAB.boxes) { const L = x1 - x0 - 1; b.position.x = x0 + .5 + (((off + tt * 1.6 * d) % L) + L) % L; }
    for (const it of FAB.arms) {
      if (it[0] === "glow") it[1].scale.setScalar(.9 + Math.sin(tt * 7 + it[1].position.x) * .12);
      else if (it[0] === "arm") { it[1].rotation.y = tt * .9 + it[3]; it[1].rotation.z = Math.sin(tt * 1.7 + it[3]) * .6; it[2].rotation.z = Math.sin(tt * 2.3 + it[3]) * 1.1 - .6; }
      else { const q = Math.max(0, Math.sin(tt * 2.2 + it[1].position.x)); it[1].position.y = 3 - q * 1.6; }
    }
  },
  // the floor hums: presses thump and the ovens rumble
  rock: tt => Math.sin(tt * 31) * .003 + Math.max(0, Math.sin(tt * 2.2) - .96) * .25,
  bounce: tt => Math.max(0, Math.sin(tt * 2.2) - .96) * 2.2,
  step() {
    if (phase !== "show" && phase !== "evac") return;
    FAB.t -= DT;
    for (const a of ag) {
      for (const [x0, y0, x1, y1, d] of FAB.belts) if (a.x > x0 && a.x < x1 && a.y > y0 - .2 && a.y < y1 + .2) { a.vx += d * 6 * DT; a.vx = clamp(a.vx, -3.2, 3.2); }   // the belt drags you sideways
      for (const [x, y, r] of FAB.ovens) { const dx = a.x - x, dy = a.y - y, d = Math.hypot(dx, dy); if (d < r + 1.1 && d > .01) { a.vx += dx / d * 1.8 * DT * 10; a.vy += dy / d * 1.8 * DT * 10; a.p += .12; if (Math.random() < .002 && !demo) pop(a.x, a.y - 1, ["HOT HOT HOT!", "MY EYEBROWS!", "OUCH!"][(Math.random() * 3) | 0]); } }
    }
    if (FAB.t <= 0 && fullAt) { FAB.t = 5 + Math.random() * 4; const a = ag[(Math.random() * ag.length) | 0]; if (a && a.x > 4 && a.x < 36 && a.y > 21 && a.y < 44) pop(a.x, a.y - 1.1, ["WHEEE, A RIDE!", "I'M A PRODUCT NOW!", "THIS IS NOT THE EXIT!"][(Math.random() * 3) | 0]); }
  },
  ev: {
    robot(side) {
      const pts = [crowdPoint(), crowdPoint(), crowdPoint(), [side ? WW + 3 : -3, rnd(26, 56)]];
      addMover({ kind: "fab_robot", x: side ? -2 : WW + 2, y: rnd(26, 56), pts, speed: 2.6, r: .8, push: 40, scare: 2.4, say: "HUG.EXE", sayEvery: 2.4,
        tick(m) { if (Math.random() < .01) pop(m.x, m.y - 1.6, ["BEEP BOOP!", "ERROR 404: PERSONAL SPACE", "HUGGING HUMANS", "PLEASE HOLD STILL"][(Math.random() * 4) | 0]); } });
      caption("A robot arm escaped the assembly line!", true, 2000);
    },
    cajas(side) {
      for (let n = 0; n < 6; n++) addMover({ kind: "fab_box", beh: "bounce", x: side ? 2 : WW - 2, y: rnd(26, 56), vx: (side ? 1 : -1) * rnd(3, 5), vy: rnd(-2, 2), r: .55, push: 18, life: 10 });
      caption("Box avalanche!", true, 1800); pop(side ? 4 : WW - 4, 30, "LOOK OUT!");
    },
    horno() {
      const [x, y] = FAB.ovens[(Math.random() * FAB.ovens.length) | 0];
      for (let k = 0; k < 20; k++) puff(x + rnd(-1, 1), y + rnd(-1, 1), 2.6 + k * .1, ["#ff3b2f", "#ff9a3c", "#ffd23a"][k % 3], .6 + k * .05, 1.2, .8);
      for (const a of ag) { const dx = a.x - x, dy = a.y - y, d = Math.hypot(dx, dy); if (d < 6 && d > .01) { a.vx += dx / d * 4; a.vy += dy / d * 4; if (d < 4 && Math.random() < .4) { if (!(a.springy && yeet(a, dx, dy))) toss(a, 1.5, .8); } } }
      pop(x, y - 2.5, "WHOOOMPH!"); shake = Math.min(1.2, shake + .7); sfx("boom"); caption("An oven door blew open!", true, 1800);
    },
    turno(side) {
      for (let n = 0; n < 8; n++) { const y = rnd(28, 60); addMover({ kind: n === 0 ? "fab_boss" : "fab_worker", x: side ? -1 - n : WW + 1 + n, y, pts: [[side ? WW + 3 : -3, y + rnd(-6, 6)]], speed: 3.2 + Math.random(), r: .45, push: 18, scare: 1, say: n ? "" : "CLOCK OUT TIME!", sayEvery: 2.5,
        tick(m) { if (Math.random() < .004) pop(m.x, m.y - 1.4, FAB_SAYS[(Math.random() * FAB_SAYS.length) | 0]); } }); }
      caption("Shift change! The workers are crossing", false, 1800);
    },
    sirena() { blackT = 3; sfx("siren"); flash = .6; caption("Someone pressed the red button", true, 2000); pop(20, 12, "WEEE-OOOO!"); later(4, () => caption("It was just a test. Probably.", false, 1800)); },
  },
  performers: () => [{ kind: "fab_boss", orbit: [20, 4, .01, 0, 0], h: 1.2, x: 0, y: 0, ang: Math.PI / 2, t: 0 }],
};
