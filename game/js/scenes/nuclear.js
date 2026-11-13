// Human Tsunami · scene: Meltdown Open Day (a nuclear plant opens its doors; the uranium core heats up if too many people crowd it)
const CORE = { x: 20, y: 34, r: 2.6 }, CORE_HOT = 7;   // within CORE_HOT meters of the core, people heat it up
const NUKE = { heat: 0, warned: false, booms: 0, n: 0, rods: [], towers: [] };
function nukeMeltdown() {
  NUKE.heat = 35; NUKE.warned = false; NUKE.booms++; eventLog.add("meltdown");
  caption("NUCLEAR REACTION!", true, 3200); flash = 2.2; shake = 1.6; sfx("boom"); later(.25, () => sfx("boom")); sfx("siren");
  if (!demo) announce("war_get_down");
  for (const a of ag) {
    const dx = a.x - CORE.x, dy = a.y - CORE.y, d = Math.hypot(dx, dy) || .01;
    if (d < CORE.r + 1.8) { a.dmg = 1.3; a.p += 6; }   // closest ones go down (rag dolls)
    else if (d < 12) { const s = (1 - d / 12) * 9; a.vx += dx / d * s; a.vy += dy / d * s; a.p += (1 - d / 12) * 2.5; toss(a, 2 + (1 - d / 12) * 4, 1.1 + Math.random() * .5); }
    if (d < 14) a.rad = t + 9;   // and everyone nearby glows green for a while
  }
  for (let k = 0; k < 40; k++) { const an = Math.random() * 6.28, rr = Math.random() * 3; puff(CORE.x + Math.cos(an) * rr, CORE.y + Math.sin(an) * rr, 1 + Math.random() * 3, k % 3 ? "#9dff6a" : "#e8ffb0", .9 + Math.random() * 1.2, 4 + Math.random() * 2, 2.2 + Math.random() * 1.5); }
  for (let k = 0; k < 26; k++) { const an = k / 26 * 6.283; puff(CORE.x + Math.cos(an) * 2.6, CORE.y + Math.sin(an) * 2.6, 7, "#c8ff8a", 1.6, 5, .8); }   // mushroom cap
  pop(CORE.x, CORE.y - 3, "KA-BOOOOM!"); burstAt(CORE.x, CORE.y, 120);
}
// a hyperboloid cooling tower
function nukeTower(grp, x, y, r, h) {
  const pts = []; for (let i = 0; i <= 12; i++) { const q = i / 12; pts.push(new THREE.Vector2(r * (1 - .32 * Math.sin(Math.PI * Math.pow(q, .8))), q * h)); }
  const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 24), mat("#d8d4cc", { roughness: .9, side: THREE.DoubleSide }));
  m.position.set(x, 0, y); m.castShadow = true; m.receiveShadow = true; grp.add(m);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(r * .7, r * .7, .6, 24, 1, true), mat("#d8322b", { side: THREE.DoubleSide })); band.position.set(x, h - .9, y); grp.add(band);
  NUKE.towers.push([x, y, h]);
}
SCENE_PERSONS.nuke_guide = { body: "#f4f4f2", legs: "#2b3a55", hat: "cap", hatCol: "#f2c230" };
SCENE_PERSONS.nuke_inspector = { body: "#f2c230", legs: "#f2c230", hat: "none", skin: "#f2c230",
  extra(g, u, b) { part(b, "sph", mat("#bfe3ff", { roughness: .05, transparent: true, opacity: .6 }), .2, .16, .2, .1, 1.64, 0); part(b, "box", "#111214", .12, .14, .12, -.15, 1.1, 0); } };
SCENE_PERSONS.nuke_glowie = { body: "#9dff6a", legs: "#2f8f3a", hat: "none", skin: "#9dff6a", scale: 1.35,
  extra(g, u, b) { part(b, "cyl", "#2f8f3a", .02, .4, .02, 0, 1.98, 0); part(b, "sph", basic("#d9ff6a"), .09, .09, .09, 0, 2.2, 0); } };
SCENE_MODELS.nuke_barrel = (g, u, m) => {
  u.ball = pivot(g, 0, .45, 0); const roll = pivot(u.ball, 0, 0, 0); roll.rotation.x = Math.PI / 2;
  part(roll, "cyl", "#f2c230", .42, .95, .42, 0, 0, 0);
  for (const y of [-.3, .3]) part(roll, "cyl", "#111214", .43, .06, .43, 0, y, 0);
  part(roll, "cyl", basic("#9dff6a"), .3, .97, .3, 0, 0, 0);
  u.anim = tt => { roll.rotation.y = tt * 8; };
};
SCENES.nuclear = {
  name: "Meltdown Open Day", tag: "Please do not hug the reactor", outside: "#7d8088", bulbH: 2.4, music: "edm",
  light: { sky: 0xf4fff0, ground: 0x6a7068, hemi: .62, sun: 0xf8fff0, sunI: 1.2 }, crowd: 3200, fenceBudget: 80, maxGates: 5, guards: 4,
  gates: [F, T, F, F, F, T, F], unlock: 32,
  intro: "The nuclear plant throws an open day. The tour stage is at the back, and the glowing uranium core sits right in the middle of the way. Every person standing near it warms it up. Let too many crowd around it and… well.",
  acts: ["Welcome to the plant!", "Totally safe!", "Don't touch the glowing thing!", "Smile, you're slightly radioactive!"],
  events: ["barriles", "mascota", "inspector", "simulacro", "fuga", "barriles"],
  goal: o => o.kind === "barrier", goalMaxY: 14,
  heights: { visitor: 1.4, tank: 2.6, control: 3.2, pipe: 1.1 },
  lines: {
    meltdown: "The core melted down mid-tour; several visitors now glow in the dark and can read in bed without a lamp.",
    barriles: "A few barrels of 'definitely just paint' rolled across the open day.",
    mascota: "Glowie, the plant's mascot, was hugged by four hundred people and is now a little radioactive himself.",
    inspector: "A safety inspector in a hazmat suit said 'everything is fine' eleven times.",
    simulacro: "An evacuation drill started in the middle of the real evacuation.",
    fuga: "A steam pipe burst and gave everyone a free facial.",
  },
  quotes: ["“The glow is part of the experience,” said the plant's PR team.", "“I came for the gift shop,” said a visitor who now glows faintly green.", "“We will need a slightly bigger fence,” admitted the head engineer."],
  build() {
    rect(8, 0, 32, 5.5, "visitor");
    seg(5, 7.5, WW - 5, 7.5, .3, "barrier");
    circ(CORE.x, CORE.y, CORE.r, "core");
    circ(5.2, 20, 3, "tower"); circ(WW - 5.2, 20, 3, "tower");
    rect(1, 46, 7, 52, "tank"); rect(WW - 7, 46, WW - 1, 52, "control");
    rect(14, 57, 26, 58.2, "pipe");
  },
  ground(g) {
    g.fillStyle = "#9aa0a6"; g.fillRect(0, 0, WW, WH);
    for (let y = 0; y < FENCE_Y; y += 4) { g.fillStyle = "rgba(0,0,0,.06)"; g.fillRect(0, y, WW, .08); }
    for (let x = 0; x < WW; x += 4) { g.fillStyle = "rgba(0,0,0,.06)"; g.fillRect(x, 0, .08, FENCE_Y); }
    // the hot zone around the core: yellow and black hazard ring
    g.save(); g.beginPath(); g.arc(CORE.x, CORE.y, CORE_HOT + .4, 0, 7); g.arc(CORE.x, CORE.y, CORE_HOT - .4, 0, 7, true); g.clip();
    for (let k = -60; k < 60; k++) { g.fillStyle = k % 2 ? "#f2c230" : "#1c1c1c"; g.beginPath(); g.moveTo(CORE.x + k * .9, CORE.y - 9); g.lineTo(CORE.x + k * .9 + .9, CORE.y - 9); g.lineTo(CORE.x + k * .9 + 6, CORE.y + 9); g.lineTo(CORE.x + k * .9 + 5.1, CORE.y + 9); g.fill(); }
    g.restore();
    g.fillStyle = "rgba(242,194,48,.12)"; g.beginPath(); g.arc(CORE.x, CORE.y, CORE_HOT - .4, 0, 7); g.fill();
    // a trefoil painted under the reactor
    g.fillStyle = "#f2c230"; g.beginPath(); g.arc(CORE.x, CORE.y, CORE.r + .9, 0, 7); g.fill(); g.fillStyle = "#1c1c1c";
    for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + k * 2.094; g.beginPath(); g.moveTo(CORE.x, CORE.y); g.arc(CORE.x, CORE.y, CORE.r + .8, a - .52, a + .52); g.fill(); }
    // green visitor walkway lines
    g.strokeStyle = "rgba(47,174,90,.6)"; g.lineWidth = .3; g.setLineDash([1, .6]);
    for (const x of [9, 31]) { g.beginPath(); g.moveTo(x, 62); g.lineTo(x, 10); g.stroke(); }
    g.setLineDash([]);
    g.fillStyle = "#8a8d92"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
  },
  decor(g) {
    g.fillStyle = "#2f6fc4"; g.fillRect(8, 0, 24, 5.5);
    g.font = "900 1.1px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#ffffff"; g.fillText("OPEN DAY · ASK US ANYTHING", 20, 3);
    g.font = "900 .7px Rubik, sans-serif"; g.fillStyle = "#1c1c1c"; g.fillText("DO NOT CROWD THE CORE", CORE.x, CORE.y + CORE_HOT + 1.2);
    for (const o of obs) if (o.kind === "barrier") { g.lineWidth = .25; g.strokeStyle = "#f2c230"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
    for (const o of obs) if (o.kind === "tank" || o.kind === "control") { g.fillStyle = o.kind === "tank" ? "#c9ced6" : "#4b5563"; g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0); }
    g.fillStyle = "#7a7f88"; g.fillRect(14, 57, 12, 1.2);
    for (const o of obs) if (o.kind === "tower") { g.fillStyle = "#d8d4cc"; g.beginPath(); g.arc(o.x, o.y, o.r, 0, 7); g.fill(); g.fillStyle = "#5a5d63"; g.beginPath(); g.arc(o.x, o.y, o.r * .66, 0, 7); g.fill(); }
  },
  bulbs: [[6, 6], [12, 6], [18, 6], [22, 6], [28, 6], [34, 6]],
  beams: [{ x: 12, y: 2, a: Math.PI / 2, sweep: .7, h: 7, white: true }, { x: 28, y: 2, a: Math.PI / 2, sweep: .7, h: 7, white: true }],
  extra3D(grp) {
    NUKE.rods = []; NUKE.towers = [];
    // the reactor: a steel drum, seven glowing fuel rods and a cage on top
    part(grp, "cyl", mat("#3a3f47", { metalness: .6, roughness: .35 }), CORE.r, .6, CORE.r, CORE.x, .3, CORE.y);
    part(grp, "cyl", mat("#bfe3ff", { roughness: .05, transparent: true, opacity: .25 }), CORE.r * .92, 2.6, CORE.r * .92, CORE.x, 1.9, CORE.y);
    for (let k = 0; k < 7; k++) {
      const a = k / 6 * 6.283, rr = k === 6 ? 0 : 1.15, m = new THREE.MeshBasicMaterial({ color: 0x9dff6a, toneMapped: false });
      const rod = new THREE.Mesh(GEO.cyl, m); rod.scale.set(.24, 2.3, .24); rod.position.set(CORE.x + Math.cos(a) * rr, 1.75, CORE.y + Math.sin(a) * rr); grp.add(rod); NUKE.rods.push(m);
    }
    for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283; part(grp, "cyl", "#f2c230", .07, 3.2, .07, CORE.x + Math.cos(a) * CORE.r * .95, 1.6, CORE.y + Math.sin(a) * CORE.r * .95); }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(CORE.r * .95, .1, 6, 28), mat("#f2c230")); ring.rotation.x = Math.PI / 2; ring.position.set(CORE.x, 3.2, CORE.y); grp.add(ring);
    nukeTower(grp, 5.2, 20, 3, 11); nukeTower(grp, WW - 5.2, 20, 3, 11);
    // storage tank and control room details
    part(grp, "cyl", "#c9ced6", 2.6, 2.4, 2.6, 4, 2.6 + 1.2, 49);
    part(grp, "box", basic("#7fd0ff"), .05, .6, 4.5, WW - 7.03, 2.2, 49);
  },
  frame3D(tt) {
    const v = NUKE.heat / 100, pulse = .75 + .25 * Math.sin(tt * (4 + v * 14));
    const c = v < .5 ? [.6 + v * 1.6, 1.6, .4] : [1.6 + (v - .5) * 2, 1.6 - (v - .5) * 2.4, .3];   // green, yellow, then angry red
    for (const m of NUKE.rods) m.color.setRGB(c[0] * pulse, Math.max(.2, c[1]) * pulse, c[2] * pulse);
    for (const [x, y, h] of NUKE.towers) if (Math.random() < .12) puff(x + (Math.random() - .5) * 1.2, y + (Math.random() - .5) * 1.2, h, "#f2f2f2", .9, 3.5, 1.2);   // steam
  },
  fx(g) {   // live glow of the hot zone (stronger as it heats up)
    const v = NUKE.heat / 100; if (v < .05) return;
    g.fillStyle = `rgba(255,${Math.round(220 - v * 180)},40,${(.08 + v * .3 * (.7 + .3 * Math.sin(performance.now() / (300 - v * 220)))).toFixed(3)})`;
    g.beginPath(); g.arc(CORE.x, CORE.y, CORE_HOT, 0, 7); g.fill();
  },
  hud(g, w) {   // the CORE TEMP meter
    const v = NUKE.heat / 100, x = 18, y = 16, bw = Math.min(260, w * .24), bh = 14, hot = v > .8 && Math.sin(performance.now() / 90) > 0;
    g.fillStyle = "rgba(17,18,20,.82)"; g.beginPath(); g.roundRect(x - 8, y - 8, bw + 16, bh + 34, 10); g.fill();
    g.font = "900 12px Rubik, system-ui, sans-serif"; g.textAlign = "left"; g.textBaseline = "top"; g.fillStyle = hot ? "#ff4d3d" : "#ffffff";
    g.fillText(phase === "plan" ? "CORE TEMP · keep the crowd off the hazard ring" : `CORE TEMP ${Math.round(NUKE.heat)}%${NUKE.booms ? ` · meltdowns: ${NUKE.booms}` : ""}`, x, y - 1);
    g.fillStyle = "#33363d"; g.fillRect(x, y + 18, bw, bh);
    g.fillStyle = `hsl(${Math.round(120 - 120 * v)},85%,${hot ? 62 : 50}%)`; g.fillRect(x, y + 18, bw * v, bh);
    g.fillStyle = "rgba(255,255,255,.8)"; g.fillRect(x + bw * .6, y + 16, 2, bh + 4);
  },
  onStart() { NUKE.heat = 0; NUKE.warned = false; NUKE.booms = 0; },
  step() {
    if (phase !== "show" && phase !== "evac") return;
    let n = 0; for (const a of ag) { const dx = a.x - CORE.x, dy = a.y - CORE.y; if (dx * dx + dy * dy < CORE_HOT * CORE_HOT) n++; }
    NUKE.n = n; NUKE.heat = clamp(NUKE.heat + ((n - 55) / 55) * 5 * DT, 0, 100);
    if (NUKE.heat > 60 && !NUKE.warned) { NUKE.warned = true; caption("Core temperature rising! Keep people away from the reactor", true, 2600); sfx("siren"); }
    if (NUKE.heat < 45) NUKE.warned = false;
    if (NUKE.heat >= 100) nukeMeltdown();
  },
  ev: {
    barriles(side) {
      const y = rnd(26, 58);
      for (let n = 0; n < 3; n++) addMover({ kind: "nuke_barrel", x: (side ? -2 : WW + 2) + (side ? -1 : 1) * n * 2.2, y: y + rnd(-2, 2), pts: [[side ? WW + 4 : -4, y + rnd(-5, 5)]], speed: 3.2, r: .55, push: 30, scare: 1.5, say: n ? "" : "CLANG!", sayEvery: 1.5 });
      caption("Barrels of 'definitely just paint' are rolling!", true, 2000);
    },
    mascota() {
      addMover({ kind: "nuke_glowie", x: openGateX(), y: SH, pts: [crowdPoint(), [CORE.x, CORE.y + CORE_HOT + 1.5], crowdPoint(), [openGateX(), SH + 3]], speed: 1.3, r: .5, push: 15, say: "STAY RADIANT!", sayEvery: 3.5, tick: followTick(12, 2.6, .35) });
      caption("Glowie the mascot is here! Everyone wants a hug", true, 2200);
    },
    inspector() {
      addMover({ kind: "nuke_inspector", x: openGateX(), y: SH, pts: [[CORE.x + 4, CORE.y + 6], [CORE.x - 4, CORE.y + 6], crowdPoint(), [openGateX(), SH + 3]], speed: 1.6, r: .45, push: 15, calm: 4, say: "EVERYTHING IS FINE", sayEvery: 3.5 });
      caption("A safety inspector in a hazmat suit", false, 1800);
    },
    simulacro(side) {
      const x = side ? 6 : WW - 6, y = 60;
      tempAttract(x, y, 3, 6, .45); pop(x, y - 2, "ASSEMBLY POINT!"); sfx("siren");
      caption("Evacuation drill! Half the crowd runs to the assembly point", true, 2400);
    },
    fuga(side) {
      const x = side ? 15 : 25, y = 57.6;
      for (let i = 0; i < 14; i++) later(i * .25, () => {
        if (phase !== "show" && phase !== "evac") return;
        puff(x + rnd(-1, 1), y, .5, "#ffffff", .7, 1.6, 1.6);
        for (const a of ag) { const dx = a.x - x, dy = a.y - y, d = Math.hypot(dx, dy); if (d < 4.5 && d > .01) { a.vx += dx / d * 2.2; a.vy += dy / d * 2.2; } }
      });
      pop(x, y - 1, "HISSSSS!"); caption("A steam pipe burst!", true, 1800);
    },
  },
  performers: () => [{ kind: "nuke_guide", orbit: [20, 4, .01, 0, 0], x: 0, y: 0, ang: Math.PI / 2, t: 0 }],
};
