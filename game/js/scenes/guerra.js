// Human Tsunami · scene: Battle Reenactment Day (an old training field; the organizers swear the minefields were cleared)
const MINE_ZONES = [{ x: 8, y: 34, r: 4.6 }, { x: 31, y: 45, r: 4.2 }, { x: 19, y: 55, r: 3.8 }];
const WAR = { mines: [], craters: [], booms: 0 };
const BUNKER = { x0: 29, y0: 29, x1: 37, y1: 35 };
// bury the mines for this visit: most inside the marked fields, a few strays outside them (all faintly visible while planning)
function warBury() {
  WAR.mines = []; WAR.layout = SLOT_XS || "fixed";
  const free = (x, y) => x > 1 && x < WW - 1 && y > 12 && y < FENCE_Y - 4 && !blockedC[cellOf(x, y)];
  for (const z of MINE_ZONES) for (let k = 0, tries = 0; k < 7 && tries < 60; tries++) {
    const a = Math.random() * 6.283, rr = Math.sqrt(Math.random()) * z.r * .9, x = z.x + Math.cos(a) * rr, y = z.y + Math.sin(a) * rr;
    if (free(x, y)) { WAR.mines.push({ x, y, live: true }); k++; }
  }
  for (let k = 0, tries = 0; k < 3 && tries < 80; tries++) {
    const x = 3 + Math.random() * (WW - 6), y = 16 + Math.random() * 42;
    if (free(x, y) && !MINE_ZONES.some(z => Math.hypot(x - z.x, y - z.y) < z.r + 1.5)) { WAR.mines.push({ x, y, live: true }); k++; }
  }
}
// a mine goes off: people nearby go down, everyone around gets thrown
function mineBoom(m) {
  m.live = false; WAR.booms++; WAR.craters.push([m.x, m.y]); eventLog.add("mina");
  // whoever is right on top goes down; everyone around flies (a big scare, not a crush)
  for (const a of ag) {
    const dx = a.x - m.x, dy = a.y - m.y, d = Math.hypot(dx, dy) || .01;
    if (d < 1.4) { a.dmg = 1.3; a.p += 5; }
    else if (d < 3.6) { const s = (1 - d / 3.6) * 5; a.vx += dx / d * s; a.vy += dy / d * s; a.p += (1 - d / 3.6) * .6; toss(a, 1.4 + (1 - d / 3.6) * 2.5, .9 + Math.random() * .4); }
  }
  pop(m.x, m.y - 1, "BOOM!"); burstAt(m.x, m.y, 50); shake = Math.min(1.2, shake + .7);
  for (let k = 0; k < 10; k++) puff(m.x + (Math.random() - .5) * 1.5, m.y + (Math.random() - .5) * 1.5, .4 + Math.random(), k % 2 ? "#5a4a3a" : "#8a7a62", .7 + Math.random() * .6, 2.5, 1.4);
  sfx("boom"); if (WAR.booms === 1) caption("A MINE! They said the field was cleared!", true, 2400);
}
SCENE_PERSONS.ww_soldier = { body: "#5b6b3a", legs: "#4a5530", hat: "none",
  extra(g, u, b) { part(b, "sph", "#4a5530", .23, .15, .23, 0, 1.76, 0); part(b, "cyl", "#4a5530", .26, .02, .26, 0, 1.7, 0); } };
SCENE_MODELS.ww_tank = (g, u, m) => {
  const ol = mat("#5b6b3a", { roughness: .8 }), dk = mat("#2b2d27", { roughness: .9 });
  part(g, "box", ol, 3.6, .9, 2.2, 0, .95, 0); part(g, "box", ol, 2.6, .35, 2.0, -.1, 1.55, 0);
  for (const s of [-1, 1]) { part(g, "box", dk, 3.9, .75, .45, 0, .45, s * 1.1); for (let i = 0; i < 5; i++) { const w = part(g, "cyl", "#3a3c34", .3, .48, .3, -1.4 + i * .7, .4, s * 1.1); w.rotation.x = Math.PI / 2; } }
  const tur = pivot(g, -.1, 1.95, 0); part(tur, "sph", ol, .95, .45, .85, 0, 0, 0);
  const barrel = part(tur, "cyl", dk, .09, 2.2, .09, 1.5, .05, 0); barrel.rotation.z = Math.PI / 2;
  part(tur, "cyl", "#f4f1ea", .25, .05, .25, -.1, .42, 0);   // a white star-less roundel: just a hatch
  u.anim = tt => { tur.rotation.y = Math.sin(tt * .4) * .5; };
};
SCENE_MODELS.ww_plane = (g, u) => {
  const red = mat("#c8402e", { roughness: .5 }), cream = mat("#efe4c8", { roughness: .6 });
  const body = part(g, "cyl", red, .35, 3.2, .35, 0, 0, 0); body.rotation.z = Math.PI / 2;
  for (const y of [-.25, .55]) part(g, "box", cream, .9, .07, 5.2, .3, y, 0);
  for (const z of [-1.6, 1.6]) part(g, "cyl", "#3a2a20", .03, .8, .03, .3, .15, z);
  part(g, "box", red, .5, .6, .07, -1.5, .35, 0); part(g, "box", cream, .4, .05, 1.4, -1.5, .1, 0);
  u.prop = pivot(g, 1.65, 0, 0); part(u.prop, "box", "#2b2d27", .05, 1.3, .12, 0, 0, 0);
  u.anim = tt => { u.prop.rotation.x = tt * 40; };
};
SCENES.guerra = {
  name: "Battle Reenactment Day", tag: "Some of the mines are still live", outside: "#5a5040", bulbH: 1.8, music: "brass",
  light: { sky: 0xe8e4d8, ground: 0x5a5040, hemi: .58, sun: 0xfff0d0, sunI: 1.1 }, crowd: 3000, fenceBudget: 125, maxGates: 5, guards: 4,
  gates: [F, T, F, F, F, T, F], unlock: 36,
  intro: "A battle reenactment on an old training field: costumed reenactors, a vintage tank, a biplane and plenty of mud. The organizers swear they cleared the three minefields. They didn't, not all of them, and a few mines are hiding outside the signs too.",
  acts: ["Charge!", "For the reenactment!", "Hold the line!", "Nobody step on the red signs!"],
  events: ["tanque", "avion", "canon", "perro", "desfile", "tanque"],
  goal: o => o.kind === "barrier", goalMaxY: 14,
  heights: { reviewstand: 1.6, sandbags: .9, bunker: 2.2, wire: .9 },
  lines: {
    mina: "Several of the 'cleared' mines turned out to be extremely not cleared.",
    tanque: "A vintage tank drove through the picnic area and won the battle against a hot dog stand.",
    avion: "A biplane dropped leaflets promising free soup at the bunker. There was no soup.",
    canon: "The cannon salute was louder than anyone expected, including the cannon.",
    perro: "A mine-sniffing dog found a mine. Exactly the way you are imagining.",
    desfile: "The reenactors marched straight through the crowd because 'that's how it was in the history books'.",
  },
  quotes: ["“Historically accurate,” insisted a reenactor with mud up to his helmet.", "“The map said the mines were over there. The map was from 1944,” admitted the organizer.", "“I came for the soup,” said a man still looking for the soup."],
  build() {
    rect(9, 0, 31, 5, "reviewstand");
    seg(4, 7.5, WW - 4, 7.5, .3, "barrier");
    rect(2, 24, 14, 25.2, "sandbags"); rect(26, 22, 38, 23.2, "sandbags"); rect(13, 41, 26, 42.2, "sandbags");
    rect(BUNKER.x0, BUNKER.y0, BUNKER.x1, BUNKER.y1, "bunker");
    seg(2, 49, 9, 51, .15, "wire"); seg(31, 52, 38, 50, .15, "wire");
  },
  ground(g) {
    g.fillStyle = "#7a6a4e"; g.fillRect(0, 0, WW, WH);
    const r = rng(1944);
    for (let k = 0; k < 160; k++) { g.fillStyle = r() < .5 ? "rgba(70,110,50,.35)" : "rgba(60,45,30,.3)"; g.beginPath(); g.ellipse(r() * WW, r() * FENCE_Y, .8 + r() * 2.2, .5 + r() * 1.4, r() * 3, 0, 7); g.fill(); }
    // tank tracks and old craters
    g.strokeStyle = "rgba(40,30,20,.35)"; g.lineWidth = .35;
    for (const off of [-.7, .7]) { g.beginPath(); g.moveTo(-1, 60 + off); g.bezierCurveTo(12, 50 + off, 28, 64 + off, 41, 46 + off); g.stroke(); }
    for (let k = 0; k < 10; k++) { const x = r() * WW, y = 12 + r() * 50; g.fillStyle = "rgba(40,30,20,.35)"; g.beginPath(); g.arc(x, y, .6 + r() * .9, 0, 7); g.fill(); }
    // minefields: faded red rings with warning text
    for (const z of MINE_ZONES) {
      g.fillStyle = "rgba(200,40,30,.12)"; g.beginPath(); g.arc(z.x, z.y, z.r, 0, 7); g.fill();
      g.strokeStyle = "rgba(200,40,30,.7)"; g.lineWidth = .18; g.setLineDash([.6, .4]); g.beginPath(); g.arc(z.x, z.y, z.r, 0, 7); g.stroke(); g.setLineDash([]);
      g.font = "900 .75px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "rgba(200,40,30,.85)"; g.fillText("DANGER · MINES", z.x, z.y);
    }
    g.fillStyle = "#5a5040"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
  },
  decor(g) {
    g.fillStyle = "#6b5a3a"; g.fillRect(9, 0, 22, 5);
    g.font = "900 1px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#efe4c8"; g.fillText("REENACTMENT DAY · HISTORICALLY ACCURATE-ISH", 20, 2.6);
    for (const o of obs) if (o.kind === "barrier") { g.lineWidth = .25; g.strokeStyle = "#efe4c8"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
    for (const o of obs) if (o.kind === "sandbags") for (let x = o.x0 + .3; x < o.x1; x += .6) { g.fillStyle = "#b9a477"; g.beginPath(); g.ellipse(x, (o.y0 + o.y1) / 2, .32, .5, 0, 0, 7); g.fill(); }
    g.fillStyle = "#8a8a80"; g.fillRect(BUNKER.x0, BUNKER.y0, BUNKER.x1 - BUNKER.x0, BUNKER.y1 - BUNKER.y0);
    g.fillStyle = "#2b2d27"; g.fillRect(BUNKER.x0 + 1, BUNKER.y1 - .4, BUNKER.x1 - BUNKER.x0 - 2, .25);
    for (const o of obs) if (o.kind === "wire") { g.strokeStyle = "#3a3c34"; g.lineWidth = .08; g.beginPath(); for (let q = 0; q <= 1.0001; q += .05) { const x = o.ax + (o.bx - o.ax) * q, y = o.ay + (o.by - o.ay) * q + (Math.round(q * 20) % 2 ? .2 : -.2); g.lineTo(x, y); } g.stroke(); }
  },
  bulbs: [[6, 6], [13, 6], [20, 6], [27, 6], [34, 6]],
  beams: [{ x: 10, y: 2, a: Math.PI / 2, sweep: .6, h: 6, white: true }, { x: 30, y: 2, a: Math.PI / 2, sweep: .6, h: 6, white: true }],
  extra3D(grp) {
    // warning signs on posts around every minefield
    for (const z of MINE_ZONES) for (let k = 0; k < 4; k++) {
      const a = k / 4 * 6.283 + .4, x = z.x + Math.cos(a) * (z.r + .3), y = z.y + Math.sin(a) * (z.r + .3);
      part(grp, "cyl", "#6b4a2b", .05, 1.4, .05, x, .7, y);
      const s = part(grp, "box", "#c8281e", .05, .5, .7, x, 1.35, y); s.rotation.y = -a;
      const s2 = part(grp, "box", "#f4f1ea", .06, .1, .5, x, 1.38, y); s2.rotation.y = -a;
    }
    // barbed wire posts
    for (const o of obs) if (o.kind === "wire") for (let q = 0; q <= 1; q += .25) part(grp, "cyl", "#4a3a2a", .05, 1.1, .05, o.ax + (o.bx - o.ax) * q, .55, o.ay + (o.by - o.ay) * q);
    // a flagpole with a plain festival banner (no real insignia)
    part(grp, "cyl", "#d9d4c4", .06, 6, .06, 4, 3, 3); part(grp, "box", "#efe4c8", .05, 1.2, 1.8, 4, 5.2, 3.95);
  },
  fx(g) {
    if (phase === "plan" && (WAR.layout !== (SLOT_XS || "fixed") || !WAR.mines.length)) warBury();
    for (const m of WAR.mines) if (m.live) { g.fillStyle = "rgba(70,55,40,.6)"; g.beginPath(); g.arc(m.x, m.y, .32, 0, 7); g.fill(); g.fillStyle = "rgba(140,120,90,.5)"; g.beginPath(); g.arc(m.x, m.y, .12, 0, 7); g.fill(); }
    for (const [x, y] of WAR.craters) { g.fillStyle = "rgba(30,22,15,.6)"; g.beginPath(); g.arc(x, y, 1.15, 0, 7); g.fill(); g.strokeStyle = "rgba(120,100,70,.6)"; g.lineWidth = .15; g.beginPath(); g.arc(x, y, 1.25, 0, 7); g.stroke(); }
  },
  hud(g, w) {
    if (phase === "plan") return;
    const live = WAR.mines.filter(m => m.live).length;
    g.fillStyle = "rgba(17,18,20,.82)"; g.beginPath(); g.roundRect(10, 8, 230, 26, 10); g.fill();
    g.font = "900 12px Rubik, system-ui, sans-serif"; g.textAlign = "left"; g.textBaseline = "middle"; g.fillStyle = "#ffffff";
    g.fillText(`MINES GONE OFF: ${WAR.booms} · still buried: ${live}`, 18, 21);
  },
  onStart() {   // same mines for every attempt of this visit (you saw them while planning); they are all live again
    if (WAR.layout !== (SLOT_XS || "fixed") || !WAR.mines.length) warBury(); else for (const m of WAR.mines) m.live = true;
    WAR.craters = []; WAR.booms = 0;
  },
  step() {
    if (phase !== "show" && phase !== "evac") return;
    for (const m of WAR.mines) {
      if (!m.live) continue;
      let hit = false;
      for (const a of ag) if (Math.abs(a.x - m.x) < .55 && Math.abs(a.y - m.y) < .55 && !(a.air > 0)) { hit = true; break; }
      if (!hit) for (const mv of movers) if (!mv.air && (mv.kind === "ww_tank" || mv.kind === "dog" || mv.kind === "ww_soldier") && Math.hypot(mv.x - m.x, mv.y - m.y) < (mv.r || .4) + .3) { hit = true; break; }
      if (hit) mineBoom(m);
    }
  },
  ev: {
    tanque(side) {
      const y = rnd(28, 58);
      addMover({ kind: "ww_tank", x: side ? -4 : WW + 4, y, pts: [[side ? WW + 5 : -5, y + rnd(-6, 6)]], speed: 2.2, r: 1.5, push: 45, scare: 3, say: "CLANK CLANK!", sayEvery: 2 });
      caption("The vintage tank is crossing the field!", true, 2000);
    },
    avion(side) {
      const y = rnd(20, 50);
      addMover({ kind: "ww_plane", air: true, h: 9, x: side ? -8 : WW + 8, y, pts: [[side ? WW + 10 : -10, y + rnd(-10, 10)]], speed: 9, r: 1, push: 0, say: "BRRRRRR!", sayEvery: 1.5 });
      later(1.6, () => { if (phase !== "show") return; burstAt(20, y, 80); tempAttract((BUNKER.x0 + BUNKER.x1) / 2, BUNKER.y1 + 1.6, 2.6, 6, .4); pop(33, BUNKER.y1 + 2, "FREE SOUP?!"); caption("Leaflets: FREE SOUP AT THE BUNKER (right next to a minefield)", true, 2600); });
    },
    canon() {
      flash = Math.max(flash, .9); shake = Math.min(1.4, shake + .9); sfx("boom"); pop(20, 8, "BANG!");
      for (const a of ag) { const d = Math.hypot(a.x - 20, a.y - 9); if (d < 10) { a.vy += (1 - d / 10) * 4; a.p += (1 - d / 10) * 1.5; } }
      caption("Cannon salute! Everyone at the front jumps back", true, 2000);
    },
    perro() {
      const z = MINE_ZONES[(Math.random() * MINE_ZONES.length) | 0];
      addMover({ kind: "dog", col: "#8a5a34", x: openGateX(), y: SH, pts: [[z.x + rnd(-2, 2), z.y + rnd(-2, 2)], [z.x + rnd(-3, 3), z.y + rnd(-3, 3)], crowdPoint(), [openGateX(), SH + 3]], speed: 3.4, r: .35, push: 15, scare: 1.2, say: "SNIFF SNIFF", sayEvery: 2.2 });
      caption("A mine-sniffing dog is on the job", false, 1800);
    },
    desfile(side) {
      const y = rnd(30, 56);
      for (let n = 0; n < 6; n++) addMover({ kind: "ww_soldier", x: (side ? -2 : WW + 2) + (side ? -1 : 1) * n * 1.1, y: y + (n % 2) * .8, pts: [[side ? WW + 4 : -4, y + (n % 2) * .8]], speed: 1.5, r: .4, push: 15, scare: .8, say: n ? "" : "LEFT! RIGHT!", sayEvery: 2.5 });
      caption("The reenactors march right through the crowd", false, 2000);
    },
  },
  performers: () => [{ kind: "ww_tank", orbit: [35, 3.6, .01, 0, Math.PI / 2], x: 0, y: 0, ang: Math.PI, t: 0 }, { kind: "ww_soldier", orbit: [20, 3.4, .01, 0, 0], x: 0, y: 0, ang: Math.PI / 2, t: 0 }],
};
