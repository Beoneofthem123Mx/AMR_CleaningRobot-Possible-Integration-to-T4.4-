// Human Tide · scene: Wedding of the Year (influencers who invited the entire internet)
SCENES.boda = {
  name: "Wedding of the Year", tag: "Influencer wedding", outside: "#6f9a4f", bulbH: 2.6, music: "mariachi",
  light: { sky: 0xfff3e0, ground: 0x5f7a45, hemi: .6, sun: 0xffe9cc, sunI: 1.25 }, crowd: 2600, fenceBudget: 60, maxGates: 5, guards: 4,
  gates: [F, T, F, T, F, T, F], unlock: 5,
  intro: "The couple livestreamed the invitation and the entire internet showed up. There's a six-tier cake, mariachis, a drone and a mother-in-law with opinions.",
  acts: ["Kiss! Kiss! Kiss!", "Long live the newlyweds!", "First dance!", "Wedding! Wedding! Wedding!"],
  events: ["ramo", "pastel", "dron", "mariachis", "suegra", "ramo"],
  goal: o => o.kind === "barrier", goalMaxY: 20,
  lines: {
    ramo: "The bouquet landed in the crowd and set off the most intense race of the night.",
    pastel: "The six-tier cake rolled across the garden; nobody tasted it, everybody dodged it.",
    dron: "The livestream drone crash-landed on the cousins' table.",
    mariachis: "The mariachis played “El Rey” eleven times in a row.",
    suegra: "The mother-in-law toured the garden announcing “that is NOT my daughter-in-law.”",
  },
  quotes: ["“It was the happiest day of our lives, and the most viral,” said the bride.", "“I don't know a single person here,” admitted one guest.", "“Nobody close the open bar,” demanded the uncle who's at every wedding."],
  build() {
    rect(12, 0, 28, 6, "gazebo");
    seg(4, 8.2, WW - 4, 8.2, .4, "barrier");
    for (let y = 12; y < 32; y += 2.6) { rect(5, y, 17, y + .6, "bench"); rect(23, y, 35, y + .6, "bench"); }
    rect(30, 44, 36, 48, "caketable");
    rect(3, 44, 9, 48, "bar");
    circ(8, 58, 1.2, "tree"); circ(32, 58, 1.2, "tree"); circ(3, 25, 1.2, "tree"); circ(37, 25, 1.2, "tree");
  },
  ground(g) {
    g.fillStyle = "#6f9a4f"; g.fillRect(0, 0, WW, WH);
    const rand = rng(23);
    for (let k = 0; k < 2200; k++) { g.fillStyle = k % 2 ? "rgba(40,80,30,.2)" : "rgba(180,220,120,.25)"; g.fillRect(rand() * WW, rand() * WH, .07, .2); }
    // aisle with carpet and petals
    g.fillStyle = "#f4f4f2"; g.fillRect(18, 6, 4, 34);
    for (let k = 0; k < 220; k++) { g.fillStyle = ["#ff8fc6", "#ffffff", "#ffd1ea"][k % 3]; g.fillRect(18 + rand() * 4, 6 + rand() * 34, .15, .1); }
    // checkered dance floor
    for (let y = 46, i = 0; y < 60; y += 1.4, i++) for (let x = 13, j = 0; x < 27; x += 1.4, j++) { g.fillStyle = (i + j) % 2 ? "#151617" : "#f4f4f2"; g.fillRect(x, y, 1.4, 1.4); }
    g.fillStyle = "#c8b48a"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
  },
  decor(g) {
    // gazebo with flowers
    g.fillStyle = "#f4f4f2"; g.fillRect(12, 0, 16, 6);
    const rand = rng(4);
    for (let k = 0; k < 140; k++) { g.fillStyle = ["#ff8fc6", "#ffffff", "#ffd23a", "#ff6fb1"][k % 4]; g.beginPath(); g.arc(12 + rand() * 16, rand() * 6, .2, 0, 7); g.fill(); }
    g.font = "900 1.3px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#d8322b";
    g.fillText("#WEDDINGGOALS", 20, 3);
    for (const o of obs) if (o.kind === "barrier") { g.lineWidth = .2; g.strokeStyle = "#ffffff"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
    for (const o of obs) if (o.kind === "bench") { g.fillStyle = "#f4f4f2"; g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0); g.fillStyle = "#ff8fc6"; for (let x = o.x0 + .3; x < o.x1; x += 1.2) g.fillRect(x, o.y0 + .1, .4, .4); }
    for (const o of obs) if (o.kind === "caketable" || o.kind === "bar") { g.fillStyle = "#f4f4f2"; g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0); }
    for (const o of obs) if (o.kind === "tree") { g.fillStyle = "#3d7a3a"; g.beginPath(); g.arc(o.x, o.y, o.r + .5, 0, 7); g.fill(); }
    g.font = "900 .9px Rubik, sans-serif"; g.fillStyle = "#2b2f35"; g.fillText("OPEN BAR", 6, 46); g.fillText("CAKE", 33, 46);
  },
  bulbs: Array.from({ length: 26 }, (_, i) => [4 + i * 1.28, 8.6]),
  beams: [{ x: 14, y: 6, a: Math.PI / 2, sweep: .5, h: 7 }, { x: 26, y: 6, a: Math.PI / 2, sweep: .5, h: 7 }],
  extra3D(grp) {
    // flower arch, six-tier cake and trees
    for (const x of [13, 27]) part(grp, "cyl", "#f4f4f2", .2, 3.6, .2, x, 1.8, 6);
    const arch = new THREE.Mesh(new THREE.TorusGeometry(7, .25, 8, 30, Math.PI), mat("#ff8fc6")); arch.position.set(20, 3.6, 6); grp.add(arch);
    for (let i = 0; i < 6; i++) { const r = 1.6 - i * .22; part(grp, "cyl", "#fbf4ee", r, .45, r, 33, 1.05 + i * .45, 46); part(grp, "cyl", "#ff8fc6", r + .02, .06, r + .02, 33, 1.25 + i * .45, 46); }
    part(grp, "sph", "#d8322b", .25, .25, .25, 33, 3.9, 46);
    for (const o of obs) if (o.kind === "tree") { part(grp, "cyl", "#6b4a2b", .25, 2.4, .25, o.x, 1.2, o.y); part(grp, "sph", "#3d8a3a", 1.6, 1.4, 1.6, o.x, 3.2, o.y); }
  },
  ev: {
    ramo() {
      const [tx, ty] = crowdPoint();
      addMover({ kind: "bouquet", beh: "fly", x: 20, y: 4, sx: 20, sy: 4, tx, ty, dur: 1.6, r: .2, push: 0, air: true, small: true, say: "HERE COMES THE BOUQUET!", sayEvery: 9 });
      later(1.7, () => { if (phase === "show") { tempAttract(tx, ty, 2.8, 6, .3); pop(tx, ty, "IT'S MINE!"); } });
      caption("The bride is throwing the bouquet!", true, 2000);
    },
    pastel() { addMover({ kind: "cake", beh: "bounce", x: 33, y: 50, vx: rnd(-4, -2), vy: rnd(-1, 2), r: 1.2, push: 20, life: 13 }); caption("The cake fell over and it's rolling!", true, 1800); },
    dron() {
      const [tx, ty] = crowdPoint();
      addMover({ kind: "drone", beh: "hover", x: 20, y: 30, h: 5, pts: [crowdPoint(), crowdPoint(), [tx, ty]], speed: 4, r: .3, push: 0, air: true, pause: .3,
        tick(m) { if (m.i >= 2) { m.h = Math.max(.3, m.h - DT * 2.5); if (m.h <= .3 && !m.boom) { m.boom = true; smallHit(m.x, m.y); pop(m.x, m.y, "CRASH!"); m.dead = true; } } } });
      caption("The livestream drone lost signal", false, 1800);
    },
    mariachis() {
      const y = rnd(36, 58), side = Math.random() < .5, insts = ["guitar", "trumpet", "violin", "guitar", "trumpet"];
      for (let n = 0; n < 5; n++) addMover({ kind: "mariachi", inst: insts[n], x: (side ? -2 : WW + 2) + (side ? -1 : 1) * n * 1.1, y: y + (n % 2) * .8, pts: [[side ? WW + 8 : -8, y + rnd(-3, 3)]], speed: 1.3, r: .4, push: 20, calm: 2.5, say: n ? "" : "♪ AY, AY, AY! ♪", sayEvery: 2.5 });
      caption("The mariachis have arrived!", false, 1800);
    },
    suegra() {
      const pts = [crowdPoint(), crowdPoint(), crowdPoint(), [openGateX(), SH + 3]];
      addMover({ kind: "suegra", x: openGateX(), y: SH, pts, speed: 1.8, r: .45, push: 30, scare: 3, say: "THAT'S NOT MY DAUGHTER-IN-LAW!", sayEvery: 3 });
      caption("The mother-in-law is here", true, 1800);
    },
  },
  performers: () => [
    { kind: "bride", orbit: [20, 3.4, .55, 1.6, 0], h: .4, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "groom", orbit: [20, 3.4, .55, 1.6, Math.PI], h: .4, x: 0, y: 0, ang: 0, t: 0 },
  ],
};
