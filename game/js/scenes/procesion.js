// Human Tsunami · scene: The Procession (a float with the Saviour statue is carried along the streets; most of the crowd follows it)
// The humour is the crowd (pushing for a better look, candle wax, the brass band), never the figure on the float.
const PROC = { route: [[20, 60], [8, 50], [8, 30], [20, 18], [32, 30], [32, 50], [20, 60]], q: 0, x: 20, y: 60, ang: 0, alt: 0 };
SCENE_MODELS.proc_float = (g, u) => {
  const wood = mat("#7a4a22", { roughness: .6 }), gold = mat("#d9a830", { metalness: .7, roughness: .3 });
  part(g, "box", gold, 3.2, .5, 2.2, 0, 1.0, 0); part(g, "box", "#5a1a24", 3.3, .6, 2.3, 0, .55, 0);           // the platform and its velvet skirt
  for (const [x, z] of [[1.5, 1], [1.5, -1], [-1.5, 1], [-1.5, -1]]) { part(g, "cyl", gold, .06, 1.2, .06, x, 1.8, z); part(g, "sph", basic("#ffe7a0"), .1, .16, .1, x, 2.45, z); }
  for (let i = 0; i < 10; i++) part(g, "sph", ["#ffffff", "#ffd1ea", "#ffd23a"][i % 3], .18, .14, .18, -1.3 + (i % 5) * .65, 1.32, i < 5 ? .85 : -.85);   // flowers
  const fig = pivot(g, 0, 1.25, 0);   // the statue: a robed figure with a halo, arms open
  part(fig, "cone", "#7a1f2b", .55, 1.6, .55, 0, .8, 0); part(fig, "box", "#f4f1ea", .12, .9, .62, .08, 1.0, 0);
  part(fig, "sph", "#e0b48a", .2, .22, .2, 0, 1.78, 0); part(fig, "sph", "#4a2e1a", .21, .16, .21, -.04, 1.86, 0);
  for (const s of [-1, 1]) { const ar = pivot(fig, 0, 1.45, s * .28); ar.rotation.x = s * -.9; part(ar, "cyl", "#7a1f2b", .07, .5, .07, 0, -.25, 0); }
  const halo = part(fig, "cyl", basic("#ffe48a"), .38, .03, .38, -.12, 2.1, 0); halo.rotation.z = Math.PI / 2 - .2;
  u.anim = tt => { g.rotation.z = Math.sin(tt * 1.6) * .03; g.position.y += Math.abs(Math.sin(tt * 1.6)) * .06; halo.material.color.setScalar(1.6 + Math.sin(tt * 2) * .3); };
};
SCENE_PERSONS.proc_bearer = { body: "#5a1a24", legs: "#2b2f35", hat: "hair", hatCol: "#2b1d14", extra(g, u, b) { part(b, "box", "#f4f1ea", .3, .14, .52, 0, 1.6, 0); } };
SCENE_PERSONS.proc_band = { body: "#1f3a7a", legs: "#1f3a7a", hat: "cap", hatCol: "#1f3a7a", extra(g, u, b) { const t = part(b, "cyl", "#e3b23c", .05, .5, .05, .45, 1.5, .12); t.rotation.z = -Math.PI / 2; part(b, "cone", "#e3b23c", .1, .16, .1, .74, 1.5, .12).rotation.z = -Math.PI / 2; } };
SCENE_PERSONS.proc_nun = { body: "#1b1d22", legs: "#1b1d22", dress: true, hat: "veil", hatCol: "#1b1d22" };
function procPoint(q) {   // position along the route, q in [0, 1)
  const R = PROC.route, segs = R.length - 1, f = ((q % 1) + 1) % 1 * segs, i = Math.floor(f), k = f - i, a = R[i], b = R[i + 1];
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, Math.atan2(b[1] - a[1], b[0] - a[0])];
}
SCENES.procesion = {
  name: "The Procession", tag: "Everyone wants to touch the float", outside: "#a59a86", bulbH: 2.4, music: "brass",
  light: { sky: 0xffe0b0, ground: 0x6a5a48, hemi: .55, sun: 0xffd9a0, sunI: 1.15 }, crowd: 2800, fenceBudget: 80, maxGates: 5, guards: 4,
  gates: [F, T, F, T, F, T, F], unlock: 40, altShare: .62,
  intro: "The town's big procession: the float with the Saviour is carried around the square, and two thirds of the crowd follow it everywhere, pushing for a better look. Keep a path open for the float and the bearers.",
  acts: ["Make way for the float!", "Candles up!", "The band strikes up!", "Petals!"],
  events: ["banda", "incienso", "petalos", "velas", "banda", "petalos", "lluvia"],
  goal: o => o.kind === "barrier", goalMaxY: 12,
  heights: { church: 6, balcony: 3, kiosk: 1.6 },
  lines: {
    banda: "The brass band played the same march fourteen times and nobody complained (out loud).",
    incienso: "So much incense that half the procession walked into the other half.",
    petalos: "Grandmas on the balconies threw so many petals that the float briefly disappeared.",
    velas: "Candle wax dripped on three hundred shoes. A record, says the parish.",
    lluvia: "It rained. Four hundred umbrellas opened at once, a bit too close to each other.",
  },
  quotes: ["“I got so close I can now say I pushed a bearer,” said a proud aunt.", "“Next year we'll walk it twice as slow,” said the band leader.", "“The float has right of way, always,” reminded the parish priest."],
  build() {
    rect(10, 0, 30, 7, "church");
    seg(6, 9.5, WW - 6, 9.5, .4, "barrier");
    for (const y of [16, 34, 52]) { rect(0, y, 2.2, y + 6, "balcony"); rect(WW - 2.2, y, WW, y + 6, "balcony"); }
    rect(18.2, 37.5, 21.8, 41, "kiosk");
  },
  ground(g) {
    g.fillStyle = "#c9b48e"; g.fillRect(0, 0, WW, WH);
    for (let y = 0, i = 0; y < FENCE_Y; y += 1, i++) for (let x = (i % 2) * .5; x < WW; x += 1) { g.fillStyle = (x * 7 + y * 3) % 5 < 2 ? "#bfa982" : "#d2bf9a"; g.fillRect(x + .04, y + .04, .92, .92); }
    // the route: a carpet of coloured sawdust (the 'alfombra') the float walks on
    g.lineCap = "round"; g.lineJoin = "round"; g.lineWidth = 3.2; g.strokeStyle = "rgba(170,40,60,.55)"; g.beginPath(); PROC.route.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
    g.lineWidth = 2.2; g.setLineDash([.6, .5]); g.strokeStyle = "rgba(255,210,58,.6)"; g.beginPath(); PROC.route.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); g.setLineDash([]);
    const rand = rng(5); for (let k = 0; k < 500; k++) { const [x, y] = procPoint(rand()); g.fillStyle = ["#ff6fb1", "#ffffff", "#ffd23a", "#7ac943"][k % 4]; g.fillRect(x + (rand() - .5) * 3, y + (rand() - .5) * 3, .12, .12); }
    g.fillStyle = "#8f8574"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
  },
  decor(g) {
    g.fillStyle = "#e8dcc2"; g.fillRect(10, 0, 20, 7); g.fillStyle = "#b08a4a"; g.beginPath(); g.arc(20, 3.5, 2.2, 0, 7); g.fill();
    g.fillStyle = "#5a1a24"; g.fillRect(18.6, 4, 2.8, 3);
    for (const o of obs) if (o.kind === "balcony") { g.fillStyle = "#e3d0b0"; g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0); g.fillStyle = "#7a1f2b"; g.fillRect(o.x0, o.y0 + 1, o.x1 - o.x0, 4); }
    for (const o of obs) if (o.kind === "barrier") { g.lineWidth = .3; g.strokeStyle = "#7a4a22"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
  },
  bulbs: Array.from({ length: 12 }, (_, i) => [8 + i * 2.2, 10.2]),
  beams: [{ x: 14, y: 6, a: Math.PI / 2, sweep: .5, h: 8, white: true }, { x: 26, y: 6, a: Math.PI / 2, sweep: .5, h: 8, white: true }],
  extra3D(grp) {
    // church front: bell tower and a rose window; balconies with hanging banners
    part(grp, "box", "#e8dcc2", 4, 14, 4, 20, 7, 2); part(grp, "cone", "#b5482a", 3, 3.6, 3, 20, 15.8, 2).rotation.y = Math.PI / 4;
    part(grp, "cyl", basic("#ffd23a"), .8, .1, .8, 20, 11, 4.05).rotation.x = Math.PI / 2;
    for (const o of obs) if (o.kind === "balcony") {
      const x = o.x0 < 5 ? o.x1 : o.x0; for (let k = 0; k < 3; k++) { const b = part(grp, "box", ["#7a1f2b", "#ffd23a", "#f4f1ea"][k], .05, 1.6, 1.4, x + (o.x0 < 5 ? .05 : -.05), 2.2, o.y0 + 1 + k * 2); b.castShadow = false; }
      for (let k = 0; k < 2; k++) part(grp, "sph", "#e0ac84", .2, .2, .2, x + (o.x0 < 5 ? .3 : -.3), 3.4, o.y0 + 2 + k * 2);   // grandmas leaning out
    }
    for (let i = 0; i < 26; i++) { const [x, y] = procPoint(i / 26); for (const s of [-1, 1]) part(grp, "cyl", basic("#fff2c0"), .04, .22, .04, x + s * 2.2, .11, y + s * .4); }   // candles along the carpet
  },
  onStart() { PROC.q = 0; PROC.alt = 0; },
  step() {
    if (phase !== "show" && phase !== "evac") return;
    // the float advances slowly, but stops when people block it (and the bearers complain)
    let blocked = 0; for (const a of ag) if ((a.x - PROC.x) ** 2 + (a.y - PROC.y) ** 2 < 4.4) blocked++;
    const sp = fullAt ? (blocked > 6 ? .0012 : .0042) : .002; PROC.q = (PROC.q + sp * DT * 10) % 1;
    const [x, y, an] = procPoint(PROC.q); PROC.x = x; PROC.y = y; PROC.ang = an;
    for (const a of ag) { const dx = a.x - x, dy = a.y - y, d2 = dx * dx + dy * dy; if (d2 < 5 && d2 > .01) { const d = Math.sqrt(d2); a.vx += dx / d * 3 * DT * 8; a.vy += dy / d * 3 * DT * 8; a.p += .25; } }   // bearers shove
    PROC.alt -= DT; if (PROC.alt <= 0 && phase === "show") { PROC.alt = 1.2; setAlt(x, y, 3.4); }
    if (blocked > 6 && Math.random() < .01 && !demo) pop(x, y - 2, ["MAKE WAY!", "COMING THROUGH, BLESS YOU!", "MIND THE FLOAT!", "LIFT TOGETHER!"][(Math.random() * 4) | 0]);
    const fl = movers.find(m => m.kind === "proc_float"); if (fl) { fl.x = x; fl.y = y; fl.ang = an; }
    for (const m of movers) if (m.bearer !== undefined) { const off = m.bearer, c = Math.cos(an), s = Math.sin(an); m.x = x + c * off[0] - s * off[1]; m.y = y + s * off[0] + c * off[1]; m.ang = an; }
  },
  ev: {
    banda(side) {
      for (let n = 0; n < 6; n++) { const q = (PROC.q - .04 - n * .008 + 1) % 1, [x, y] = procPoint(q);
        addMover({ kind: "proc_band", beh: "static", life: 18, x: x + rnd(-1, 1), y: y + rnd(-1, 1), r: .45, push: 15, scare: 1, q, say: n ? "" : "♪ TA-RA-RAAA ♪", sayEvery: 3,
          tick(m) { m.q = (m.q + .0042 * DT * 10) % 1; const [tx, ty, an] = procPoint(m.q); m.x += (tx + Math.sin(n) - m.x) * .05; m.y += (ty + Math.cos(n) - m.y) * .05; m.ang = an; } }); }
      caption("The brass band joins the procession", false, 1800);
    },
    incienso() {
      for (let k = 0; k < 40; k++) puff(PROC.x + rnd(-4, 4), PROC.y + rnd(-4, 4), rnd(.5, 2.5), "#ece6da", rnd(1, 1.8), 4, .25);
      for (const a of ag) if ((a.x - PROC.x) ** 2 + (a.y - PROC.y) ** 2 < 30) { a.vx += rnd(-1.5, 1.5); a.vy += rnd(-1.5, 1.5); }
      pop(PROC.x, PROC.y - 2, "*COUGH COUGH*"); caption("Incense cloud! Nobody can see a thing", true, 1800);
    },
    petalos() {
      for (const y of [19, 37, 55]) for (const x of [1.5, WW - 1.5]) burstAt(x, y, 40);
      cheerT = 3; sfx("cheer"); caption("Petals from the balconies!", false, 1800);
      for (let k = 0; k < 4; k++) { const [x, y] = crowdPoint(); later(k * .3, () => pop(x, y - 1, ["ACHOO!", "PETALS IN MY MOUTH!", "SO BEAUTIFUL!", "WHO THREW A WHOLE ROSE?"][k])); }
    },
    velas() {
      for (let k = 0; k < 6; k++) { const [x, y] = crowdPoint(); later(k * .25, () => { pop(x, y - 1, ["HOT WAX!", "MY SHOE!", "OUCH, CANDLE!"][k % 3]); for (const a of ag) if ((a.x - x) ** 2 + (a.y - y) ** 2 < 2) { a.vx += rnd(-2, 2); a.vy += rnd(-2, 2); } }); }
      caption("Candle wax everywhere", false, 1600);
    },
    lluvia() { windF = { x: 0, t: 0 }; for (const a of ag) if (Math.random() < .35) a.acc = 3; pop(20, 30, "UMBRELLAS!"); caption("It's raining: four hundred umbrellas open at once", true, 2000); },
  },
  performers: () => [{ kind: "proc_nun", orbit: [16, 8.3, .01, 0, 0], x: 0, y: 0, ang: Math.PI / 2, t: 0 }, { kind: "proc_nun", orbit: [24, 8.3, .01, 0, 0], x: 0, y: 0, ang: Math.PI / 2, t: 0 }],
};
// the float and its bearers exist for the whole show
const _procStart = SCENES.procesion.onStart;
SCENES.procesion.onStart = () => {
  _procStart();
  const [x, y, an] = procPoint(0);
  addMover({ kind: "proc_float", fixture: true, beh: "static", life: 1e9, x, y, ang: an, r: 1.6, push: 0, scare: 0, air: true, h: 0 });
  for (const off of [[1.6, 1.4], [0, 1.4], [-1.6, 1.4], [1.6, -1.4], [0, -1.4], [-1.6, -1.4]]) addMover({ kind: "proc_bearer", fixture: true, beh: "static", life: 1e9, bearer: off, x, y, r: .4, push: 0, scare: 0, air: true, h: 0 });
};
