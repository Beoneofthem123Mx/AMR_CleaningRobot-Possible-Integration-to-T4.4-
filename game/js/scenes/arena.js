// Human Tide · scene: The Arena (lucha libre grand final; the wrestlers don't respect the ropes)
const LRING = { x0: 15, y0: 6, x1: 25, y1: 16 }, MASKS = ["#d8322b", "#2f6fc4", "#e3b23c", "#3d9a5b", "#ff6fb1", "#a98bff"];
SCENES.arena = {
  name: "The Arena", tag: "Lucha libre grand final", outside: "#1d1a22", bulbH: 2.3, night: true, music: "brass",
  light: { sky: 0x9a8fd0, ground: 0x221d2a, hemi: .38, sun: 0xfff0e0, sunI: .95 }, crowd: 3200, fenceBudget: 70, maxGates: 5, guards: 4,
  gates: [F, F, T, F, T, F, F], unlock: 18,
  intro: "Lucha libre grand final: mask vs. hair. The wrestlers dive into the crowd, chairs are flying and an 84-year-old grandma wants to get in the ring.",
  acts: ["Lucha! Lucha! Lucha!", "Get down from there!", "Rudos! Rudos!", "Técnicos! Técnicos!"],
  events: ["tope", "sillazo", "mascara", "rudo", "chona", "tope", "referi"],
  goal: o => o.kind === "barrier", goalMaxY: 20,
  lines: {
    tope: "A wrestler hit a suicide dive onto the third row; the third row was not ready.",
    sillazo: "Folding chairs flew in both directions; nobody knows who started it.",
    mascara: "The rudo ripped off a mask and flung it into the crowd; three different people claim to have it.",
    rudo: "The rudo left the ring to brawl with the crowd and lost by disqualification.",
    chona: "Doña Chona, 84, tried to climb into the ring and got the biggest ovation of the night.",
    referi: "The referees called for calm; nobody listened, not even the wrestlers.",
  },
  quotes: ["“The ropes are more of a suggestion,” explained Místico Pato.", "“I just came for the beers,” said a fan holding a folding chair.",
    "“Back in my day, the rudos were actually rough,” said Doña Chona after applying a headlock."],
  build() {
    rect(0, 0, 17.5, 4.5, "stands"); rect(22.5, 0, WW, 4.5, "stands"); rect(17.5, 0, 22.5, 4.5, "ramp");
    seg(13.5, 4.5, 13.5, 17.5, .4, "barrier"); seg(26.5, 4.5, 26.5, 17.5, .4, "barrier"); seg(13.5, 17.5, 26.5, 17.5, .4, "barrier");
    rect(LRING.x0, LRING.y0, LRING.x1, LRING.y1, "ring");
    rect(0, 13, 3.4, 44, "stands"); rect(WW - 3.4, 13, WW, 44, "stands");
    rect(2, 52, 6, 56, "merch"); rect(34, 52, 38, 56, "merch");
  },
  ground(g) {
    g.fillStyle = "#2a2530"; g.fillRect(0, 0, WW, WH);
    // spotlight glow on the floor and dropped cups
    const glow = g.createRadialGradient(20, 26, 2, 20, 26, 26); glow.addColorStop(0, "rgba(255,240,200,.18)"); glow.addColorStop(1, "rgba(255,240,200,0)");
    g.fillStyle = glow; g.fillRect(0, 0, WW, FENCE_Y);
    const rand = rng(23);
    for (let k = 0; k < 500; k++) { g.fillStyle = ["#e3b23c", "#ffffff", "#d8322b"][k % 3]; g.globalAlpha = .35; g.fillRect(rand() * WW, 18 + rand() * (FENCE_Y - 18), .2, .2); }
    g.globalAlpha = 1;
    g.fillStyle = "#18151c"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
  },
  decor(g) {
    // stands with a seated (painted) crowd
    const rand = rng(5);
    for (const o of obs) if (o.kind === "stands") {
      g.fillStyle = "#3a3442"; g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0);
      for (let y = o.y0 + .4; y < o.y1 - .2; y += .7) for (let x = o.x0 + .4; x < o.x1 - .2; x += .7) {
        g.fillStyle = SHIRTS[(rand() * SHIRTS.length) | 0]; g.beginPath(); g.arc(x + rand() * .1, y, .24, 0, 7); g.fill();
      }
    }
    // entrance ramp with neon
    g.fillStyle = "#15131a"; g.fillRect(17.5, 0, 5, 4.5); g.fillStyle = "#ff3fa4"; g.fillRect(17.6, 0, .15, 4.5); g.fillRect(22.25, 0, .15, 4.5);
    // barriers
    for (const o of obs) if (o.kind === "barrier") { g.lineWidth = o.th; g.strokeStyle = "#c9ced6"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
    // the ring: blue canvas, red apron and logo
    g.fillStyle = "#b2232c"; g.fillRect(LRING.x0, LRING.y0, LRING.x1 - LRING.x0, LRING.y1 - LRING.y0);
    g.fillStyle = "#2f6fc4"; g.fillRect(LRING.x0 + .5, LRING.y0 + .5, LRING.x1 - LRING.x0 - 1, LRING.y1 - LRING.y0 - 1);
    g.strokeStyle = "rgba(255,255,255,.25)"; g.lineWidth = .1; g.strokeRect(LRING.x0 + .9, LRING.y0 + .9, LRING.x1 - LRING.x0 - 1.8, LRING.y1 - LRING.y0 - 1.8);
    g.font = "900 1.5px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "rgba(255,255,255,.85)"; g.fillText("LUCHA", 20, 10.3);
    g.font = "900 .7px Rubik, sans-serif"; g.fillText("MASK VS. HAIR", 20, 11.8);
    // mask and beer stands
    for (const o of obs) if (o.kind === "merch") {
      g.fillStyle = "#151617"; g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0);
      for (let i = 0; i < 6; i++) { g.fillStyle = MASKS[i]; g.beginPath(); g.ellipse(o.x0 + .6 + (i % 3) * 1.4, o.y0 + 1 + ((i / 3) | 0) * 1.6, .45, .55, 0, 0, 7); g.fill(); }
    }
  },
  bulbs: [...Array.from({ length: 12 }, (_, i) => [13.5, 5 + i * 1.1]), ...Array.from({ length: 12 }, (_, i) => [26.5, 5 + i * 1.1]), ...Array.from({ length: 11 }, (_, i) => [14.2 + i * 1.16, 17.5])],
  beams: [{ x: 4, y: 20, a: -.3, sweep: .5, h: 14 }, { x: 36, y: 20, a: Math.PI + .3, sweep: .5, h: 14 }, { x: 20, y: 2, a: Math.PI / 2, sweep: .3, h: 10, white: true },
          { x: 4, y: 60, a: -.9, sweep: .4, h: 9 }, { x: 36, y: 60, a: -2.2, sweep: .4, h: 9 }],
  extra3D(grp) {
    // ring posts and ropes
    const top = 1.0, corners = [[LRING.x0, LRING.y0], [LRING.x1, LRING.y0], [LRING.x1, LRING.y1], [LRING.x0, LRING.y1]];
    corners.forEach(([x, y], i) => { part(grp, "cyl", i % 2 ? "#d8322b" : "#2f6fc4", .16, 1.5, .16, x + (x < 20 ? .25 : -.25), top + .75, y + (y < 11 ? .25 : -.25)); });
    const ropeCol = ["#d8322b", "#f4f4f2", "#2f6fc4"];
    for (let k = 0; k < 3; k++) {
      const h = top + .45 + k * .4, c = ropeCol[k];
      part(grp, "box", c, LRING.x1 - LRING.x0 - .5, .06, .06, 20, h, LRING.y0 + .25); part(grp, "box", c, LRING.x1 - LRING.x0 - .5, .06, .06, 20, h, LRING.y1 - .25);
      part(grp, "box", c, .06, .06, LRING.y1 - LRING.y0 - .5, LRING.x0 + .25, h, 11); part(grp, "box", c, .06, .06, LRING.y1 - LRING.y0 - .5, LRING.x1 - .25, h, 11);
    }
    // giant screen over the ramp
    part(grp, "box", "#151617", 8, 4.2, .4, 20, 5.2, .3);
    part(grp, "box", basic("#ff3fa4"), 7.4, 3.6, .1, 20, 5.2, .55);
    part(grp, "box", basic("#ffd23a"), 5.2, .7, .1, 20, 5.6, .62);
  },
  ev: {
    tope() {
      const [tx, ty] = crowdPoint(), sx = rnd(16.5, 23.5), col = pick(MASKS);
      addMover({ kind: "luchador", col, beh: "fly", x: sx, y: LRING.y1, sx, sy: LRING.y1, tx, ty: Math.max(22, ty), dur: 1.4, r: .45, push: 0, air: true, say: "SUICIDE DIVE!", sayEvery: 9 });
      later(1.45, () => { if (phase === "show") addMover({ kind: "luchador", col, x: tx, y: Math.max(22, ty), pts: [crowdPoint(), [openGateX(), SH + 3]], speed: 1.4, r: .45, push: 25, scare: 1.5, say: "DIDN'T EVEN HURT!", sayEvery: 4 }); });
      caption("Suicide dive into the crowd!", true, 2000);
    },
    sillazo() {
      for (let n = 0; n < 6; n++) {
        const out = n % 2 === 0, [cx, cy] = crowdPoint(), rx = rnd(16, 24), ry = rnd(7, 15);
        addMover({ kind: "chair", beh: "fly", x: out ? rx : cx, y: out ? ry : cy, sx: out ? rx : cx, sy: out ? ry : cy, tx: out ? cx : rx, ty: out ? cy : ry, dur: 1 + Math.random() * .6,
          r: .3, push: 0, air: true, small: true, spin: 9, say: n ? "" : "CHAIR SHOT!", sayEvery: 9 });
      }
      caption("Chairs are flying! Nobody knows who started it", true, 1900);
    },
    mascara() {
      const [tx, ty] = crowdPoint();
      addMover({ kind: "mask", beh: "fly", x: 20, y: 11, sx: 20, sy: 11, tx, ty, dur: 1.5, r: .2, push: 0, air: true, small: true, spin: 6, col: pick(MASKS), say: "THE MASK!", sayEvery: 9 });
      later(1.6, () => { if (phase === "show") { tempAttract(tx, ty, 2.8, 6, .35); pop(tx, ty, "IT'S MINE!"); } });
      caption("The rudo ripped off a mask and threw it into the crowd!", true, 2200);
    },
    rudo() {
      addMover({ kind: "luchador", col: "#151617", rudo: true, x: rnd(15, 25), y: 18.6, pts: [crowdPoint(), crowdPoint(), [openGateX(), SH + 3]], speed: 1.9, r: .5, push: 30, scare: 3, say: "OUTTA MY WAY!", sayEvery: 3 });
      caption("The rudo came down to fight the crowd!", true, 1900);
    },
    chona() {
      const gx = openGateX();
      addMover({ kind: "abuela", x: gx, y: SH, pts: [[gx, 50], [20, 30], [20, 18.8], [20, 30], [gx, SH + 3]], speed: 1.1, r: .4, push: 12, say: "MAKE WAY, MIJOS!", sayEvery: 3.5, tick: followTick(16, 3, .35) });
      cheerT = 3; caption("Doña Chona, 84, wants to get in the ring!", true, 2200);
    },
    referi() {
      for (let n = 0; n < 3; n++) addMover({ kind: "referi", x: openGateX() + n, y: SH + n, pts: [crowdPoint(), crowdPoint(), [openGateX(), SH + 3]], speed: 1.8, r: .45, push: 15, calm: 3.5, say: n ? "" : "BREAK IT UP!", sayEvery: 3 });
      caption("The referees are here to restore order (they can't)", false, 1800);
    },
  },
  performers: () => [
    { kind: "luchador", col: "#e3b23c", orbit: [20, 11, 2.4, 1.3, 0], h: 1.0, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "luchador", col: "#151617", rudo: true, orbit: [20, 11, 2.4, 1.3, Math.PI], h: 1.0, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "referi", orbit: [20, 11, .8, -.7, 0], h: 1.0, x: 0, y: 0, ang: 0, t: 0 },
  ],
};
