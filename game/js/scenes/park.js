// Human Tsunami · scene: Grand Opening (Wonderlandia, a theme park that is legally distinct from every other theme park)
const PARK_COAST = { x: 30, y: 22, r: 5.5 }, PARK_CARO = { x: 9.5, y: 31, r: 3.6 }, PARK_CUPS = { x: 30.5, y: 42, r: 3.6 }, PARK_ROPE_Y = 11;
const PARK_FX = { carGone: -99 };   // sim time until which the coaster car is "temporarily elsewhere"
const PARK_TH = a => 4.6 + 1.4 * Math.sin(2 * a) + .6 * Math.sin(3 * a + 1);     // height of the coaster track at angle a
const PARK_DTH = a => 2.8 * Math.cos(2 * a) + 1.8 * Math.cos(3 * a + 1);
const PARK_COLS = ["#ff4d8d", "#ffd23a", "#4fc8ff", "#7ddc5a", "#b77dff", "#ff8a3c"];

// ---------- custom models ----------
// Mousebear: the official mascot. Bear body, mouse ears, a smile that never ends. Lawyers say it's fine.
const PARK_MASCOT = (g, u, m) => {
  const fur = "#9a5a2e", b = pivot(g, 0, 0, 0); u.mb = b;
  part(b, "sph", fur, .5, .55, .5, 0, 1.05, 0);                                    // round body
  part(b, "sph", "#f2d2a6", .3, .36, .4, .22, 1.0, 0);                             // tummy
  part(b, "cyl", "#d8322b", .52, .35, .52, 0, .62, 0);                             // red shorts...
  for (const z of [-1, 1]) part(b, "sph", "#ffd23a", .07, .1, .07, .48, .68, z * .16);   // ...with two big buttons
  for (const z of [-1, 1]) u.legs.push(leg(b, 0, .5, z * .22, .13, .45, fur));
  for (const z of [-1, 1]) part(b, "sph", "#ffd23a", .24, .1, .14, .12, .04, z * .22);   // yellow clown shoes
  const h = pivot(b, .05, 1.85, 0); u.hd = h;
  part(h, "sph", fur, .52, .48, .52, 0, 0, 0);                                     // giant head
  part(h, "sph", "#f2d2a6", .3, .22, .34, .38, -.12, 0);                           // muzzle
  part(h, "sph", "#151617", .1, .08, .12, .66, -.04, 0);                           // nose
  part(h, "box", "#151617", .05, .06, .36, .6, -.24, 0);                           // the smile
  part(h, "sph", "#ffffff", .12, .17, .1, .42, .14, .16); part(h, "sph", "#151617", .06, .08, .05, .52, .14, .16);   // one normal eye
  part(h, "sph", "#ffffff", .17, .22, .14, .4, .16, -.18); part(h, "sph", "#151617", .05, .05, .05, .55, .2, -.2);  // one slightly too big eye
  for (const z of [-1, 1]) { part(h, "cyl", "#151617", .34, .06, .34, -.05, .55, z * .4).rotation.x = z * .45; part(h, "sph", fur, .1, .1, .08, .1, .38, z * .32); } // mouse ears + bear ears
  part(h, "box", "#d8322b", .06, .08, .16, .1, .62, 0);                            // tiny bow
  u.arms = [-1, 1].map(z => { const p = pivot(b, .05, 1.35, z * .48); part(p, "cyl", fur, .12, .6, .12, 0, -.3, 0); part(p, "sph", "#ffffff", .16, .16, .16, 0, -.64, 0); return p; });
  if (m && m.zip) part(b, "box", "#c9ced6", .04, .5, .04, -.5, 1.2, 0);           // the zipper is visible. it is always visible
  u.anim = (tt, mm) => {
    const hug = mm && mm.hug;
    u.arms.forEach((p, i) => { p.rotation.x = (i ? 1 : -1) * (hug ? .25 + Math.sin(tt * 7) * .25 : 1.2 + Math.sin(tt * 6 + i * 3) * .6); p.rotation.z = hug ? 1.3 : (i ? 2.4 + Math.sin(tt * 8) * .5 : .2); });
    h.rotation.z = Math.sin(tt * 3) * .12; h.rotation.x = Math.sin(tt * 2.3) * .15;
  };
};
SCENE_MODELS.park_mascot = PARK_MASCOT;

// a teacup with a saucer, a handle and a little rider screaming politely
const PARK_CUP = (p, col, rider) => {
  part(p, "cyl", "#f4f4f2", 1.15, .12, 1.15, 0, .1, 0);
  part(p, "cyl", col, .95, .9, .7, 0, .65, 0);
  part(p, "cyl", "#ffffff", .97, .14, .97, 0, 1.08, 0);
  for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; part(p, "sph", "#ffffff", .14, .14, .06, Math.cos(a) * .86, .7, Math.sin(a) * .86); }
  const hd = part(p, "cyl", col, .22, .12, .22, 1.02, .75, 0); hd.rotation.x = Math.PI / 2;
  part(p, "cyl", "#ffd23a", .25, .7, .25, 0, .55, 0);                             // steering wheel post
  part(p, "cyl", "#ffd23a", .3, .05, .3, 0, .95, 0);
  if (rider) { part(p, "sph", SHIRTS[(col.length * 7) % SHIRTS.length], .26, .3, .26, -.4, 1.1, 0); part(p, "sph", "#e0b48a", .17, .17, .17, -.4, 1.5, 0); }
};
SCENE_MODELS.park_teacup = (g, u, m) => {
  const s = pivot(g, 0, 0, 0); PARK_CUP(s, m.col || "#ff4d8d", true); s.scale.setScalar(1.05);
  u.anim = (tt) => { s.rotation.y = tt * 7; s.rotation.z = Math.sin(tt * 5) * .12; };
};
// the teacup ride: a turning pink platter with three spinning cups
SCENE_MODELS.park_teacups = (g, u) => {
  part(g, "cyl", "#ff9cc8", 3.5, .25, 3.5, 0, .12, 0);
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; part(g, "sph", i % 2 ? "#ffffff" : "#ffd23a", .25, .15, .25, Math.cos(a) * 3.35, .3, Math.sin(a) * 3.35); }
  part(g, "cyl", "#f4f4f2", .5, 1.4, .5, 0, .8, 0); const pot = part(g, "sph", "#4fc8ff", .9, .75, .9, 0, 1.9, 0);   // giant teapot in the middle
  part(g, "cone", "#4fc8ff", .25, .9, .25, .95, 2.1, 0).rotation.z = -1; part(g, "sph", "#ffd23a", .2, .2, .2, 0, 2.7, 0);
  u.cups = [0, 1, 2].map(i => { const a = i / 3 * 6.283, p = pivot(g, Math.cos(a) * 2.1, .25, Math.sin(a) * 2.1); PARK_CUP(p, PARK_COLS[i * 2], i !== 1); p.scale.setScalar(.8); return p; });
  u.anim = (tt) => { u.cups.forEach((c, i) => { c.rotation.y = tt * (2.5 + i); }); pot.rotation.y = tt; };
};
// the carousel: striped roof, a mirror pillar, and horses that go up and down (one of them is a cow)
SCENE_MODELS.park_carousel = (g, u) => {
  part(g, "cyl", "#e8c86a", 3.5, .3, 3.5, 0, .15, 0);
  part(g, "cyl", mat("#bfe8ff", { metalness: .7, roughness: .15 }), .7, 3.6, .7, 0, 2, 0);
  const roof = pivot(g, 0, 3.8, 0);
  for (let i = 0; i < 12; i++) { const p = pivot(roof, 0, 0, 0); p.rotation.y = i / 12 * 6.283; const c = part(p, "box", i % 2 ? "#ffffff" : "#ff4d8d", 3.7, .12, 1, 1.85, .55, 0); c.rotation.z = .3; }
  part(roof, "cone", "#ff4d8d", 1.3, 1.4, 1.3, 0, 1.6, 0); part(roof, "sph", "#ffd23a", .3, .3, .3, 0, 2.4, 0);
  for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283; part(roof, "sph", basic(i % 2 ? "#fff3a0" : "#ffb0d8"), .12, .12, .12, Math.cos(a) * 3.55, 0, Math.sin(a) * 3.55); }
  u.horses = [];
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * 6.283, x = Math.cos(a) * 2.5, z = Math.sin(a) * 2.5, cow = i === 3;
    part(g, "cyl", "#ffd23a", .05, 3.6, .05, x, 2, z);
    const hp = pivot(g, x, 1.2, z); hp.rotation.y = -a + Math.PI / 2 + Math.PI;
    const col = cow ? "#ffffff" : PARK_COLS[i];
    part(hp, "box", col, .9, .38, .3, 0, 0, 0);
    if (cow) { part(hp, "sph", "#151617", .16, .12, .1, .1, .1, .12); part(hp, "sph", "#151617", .12, .1, .1, -.25, .05, -.12); }
    const nk = part(hp, "box", col, .2, .55, .24, .42, .28, 0); nk.rotation.z = -.4;
    part(hp, "box", col, .38, .2, .22, .62, .5, 0);
    part(hp, "box", cow ? "#ff9cc8" : "#ffd23a", .3, .08, .32, 0, .22, 0);          // saddle
    for (const [lx, lz] of [[.35, .1], [.35, -.1], [-.35, .1], [-.35, -.1]]) { const l = part(hp, "box", col, .08, .45, .08, lx, -.35, lz); l.rotation.z = lx > 0 ? -.6 : .6; }
    if (cow) for (const s of [-1, 1]) part(hp, "cone", "#f2e6c8", .05, .2, .05, .62, .7, s * .1);
    u.horses.push(hp);
  }
  u.anim = (tt) => { u.horses.forEach((h, i) => { h.position.y = 1.2 + Math.sin(tt * 2.4 + i * 1.1) * .35; }); };
};
// the coaster car: two red cars with riders who regret everything
SCENE_MODELS.park_coaster = (g, u, m) => {
  const body = pivot(g, 0, 0, 0); u.car = body;
  for (const [x, c] of [[.75, "#d8322b"], [-.75, "#2f6fc4"]]) {
    part(body, "box", c, 1.35, .55, 1.15, x, .55, 0);
    part(body, "box", "#151617", 1.1, .1, .95, x, .84, 0);
    for (const z of [-.25, .25]) {
      part(body, "sph", SHIRTS[((x > 0 ? 3 : 7) + (z > 0 ? 1 : 0)) % SHIRTS.length], .2, .28, .2, x - .1, 1.05, z);
      part(body, "sph", "#e0b48a", .15, .15, .15, x - .1, 1.45, z);
      for (const s of [-1, 1]) { const a = part(body, "cyl", "#e0b48a", .05, .5, .05, x - .1, 1.6, z + s * .14); a.rotation.x = s * .35; }
    }
    for (const z of [-.5, .5]) for (const wx of [-.45, .45]) part(body, "cyl", "#2b2f35", .16, .1, .16, x + wx, .2, z).rotation.x = Math.PI / 2;
  }
  part(body, "box", "#ffd23a", .3, .5, 1.17, 1.5, .5, 0);
  part(body, "sph", basic("#fff3a0"), .1, .1, .1, 1.66, .6, .35); part(body, "sph", basic("#fff3a0"), .1, .1, .1, 1.66, .6, -.35);
  u.anim = (tt, mm) => {
    if (mm.flying) { body.rotation.x = tt * 6; body.rotation.z = tt * 4; return; }
    if (mm.wreck) { body.rotation.z = Math.PI * .9; body.position.y = 1.1; return; }
    const a = Math.atan2(mm.y - PARK_COAST.y, mm.x - PARK_COAST.x);
    g.position.y = PARK_TH(a); body.rotation.z = Math.atan(PARK_DTH(a) / PARK_COAST.r);
    g.visible = typeof t !== "number" || !(t < PARK_FX.carGone && t > PARK_FX.carGone - 9);
  };
};
// the dinosaur parade float: a flatbed with a volcano and three dinosaurs doing the hustle
SCENE_MODELS.park_dinofloat = (g, u) => {
  part(g, "box", "#7ddc5a", 4.6, .6, 2.6, 0, .55, 0);
  for (let x = -2.1; x < 2.3; x += .6) part(g, "sph", PARK_COLS[Math.abs(Math.round(x * 3)) % 6], .3, .3, .3, x, .55, 1.3);
  for (const x of [-1.6, 1.6]) for (const s of [-1, 1]) part(g, "cyl", "#151617", .4, .25, .4, x, .35, s * 1.25).rotation.x = Math.PI / 2;
  part(g, "cone", "#8a5a34", 1, 1.6, 1, -1.6, 1.65, 0); part(g, "sph", basic("#ff7a2f"), .35, .2, .35, -1.6, 2.45, 0);   // papier-mâché volcano
  part(g, "cyl", "#d8322b", .3, 1.8, .3, 2, 1.6, -.9); part(g, "box", basic("#ffd23a"), .1, .8, 1.4, 2, 2.3, -.9);     // speaker tower
  u.dinos = [];
  const dino = (x, z, col, s) => {
    const p = pivot(g, x, .85, z); p.scale.setScalar(s);
    part(p, "sph", col, .45, .5, .35, 0, .7, 0);
    part(p, "sph", "#fff3a0", .3, .35, .25, .15, .65, 0);
    const n = pivot(p, .2, 1.1, 0); part(n, "sph", col, .32, .25, .25, .25, .1, 0); part(n, "box", "#ffffff", .1, .06, .3, .5, 0, 0);
    for (const zz of [-1, 1]) { part(n, "sph", "#ffffff", .07, .07, .07, .35, .25, zz * .12); part(n, "sph", "#151617", .035, .035, .035, .4, .26, zz * .12); }
    const tail = part(p, "cone", col, .2, .9, .2, -.6, .5, 0); tail.rotation.z = 1.9;
    for (let i = 0; i < 4; i++) part(p, "cone", "#ff8a3c", .07, .2, .07, -.25 + i * .15, 1.15 - i * .05, 0);
    const arms = [-1, 1].map(zz => { const a = pivot(p, .3, .85, zz * .25); part(a, "cyl", col, .05, .25, .05, 0, -.12, 0); return a; });
    for (const zz of [-1, 1]) part(p, "cyl", col, .1, .35, .1, 0, .15, zz * .18);
    u.dinos.push({ p, n, arms });
  };
  dino(-.2, .5, "#4fc8ff", 1.1); dino(.8, -.4, "#b77dff", .95); dino(1.4, .7, "#ff4d8d", .8);
  u.anim = (tt) => u.dinos.forEach((d, i) => {
    const b = tt * 8 + i * 1.7;
    d.p.position.y = .85 + Math.abs(Math.sin(b)) * .25; d.p.rotation.y = Math.sin(tt * 2 + i) * .7;
    d.n.rotation.z = Math.sin(b) * .3; d.arms.forEach((a, k) => { a.rotation.z = 1.5 + Math.sin(b + k * Math.PI) * 1.2; });
  });
};
// the churro cart: umbrella, a churro the size of a canoe, and a vendor who gave up on pricing
SCENE_MODELS.park_churrocart = (g, u) => {
  part(g, "box", "#ffd23a", 2.2, 1, 1.3, 0, .9, 0);
  part(g, "box", "#d8322b", 2.25, .2, 1.35, 0, 1.45, 0);
  for (const s of [-1, 1]) part(g, "cyl", "#151617", .35, .15, .35, -.3, .35, s * .7).rotation.x = Math.PI / 2;
  part(g, "cyl", "#8a8f96", .04, 1.6, .04, -.6, 2.2, 0);
  const um = pivot(g, -.6, 3, 0); u.um = um;
  for (let i = 0; i < 8; i++) { const p = pivot(um, 0, 0, 0); p.rotation.y = i / 8 * 6.283; const c = part(p, "box", i % 2 ? "#ffffff" : "#d8322b", 1.3, .06, .55, .65, -.2, 0); c.rotation.z = -.3; }
  const ch = part(g, "cyl", "#c9873a", .22, 2.6, .22, .3, 2.0, 0); ch.rotation.z = -1.2;              // the giant churro
  for (let i = 0; i < 5; i++) { const r = part(g, "cyl", "#a86a28", .23, .06, .23, .3 + (i - 2) * .45 * Math.cos(.37), 2.0 + (i - 2) * .45 * Math.sin(.37), 0); r.rotation.z = -1.2; }
  u.anim = (tt) => { um.rotation.y = tt * 1.5; };
};
SCENE_MODELS.park_churro = (g, u) => {
  u.ball = pivot(g, 0, .2, 0);
  const c = part(u.ball, "cyl", "#c9873a", .07, .55, .07, 0, 0, 0); c.rotation.z = Math.PI / 2;
  part(u.ball, "box", "#ffffff", .12, .1, .16, -.25, 0, 0);
};
// a firework rocket mounted (by an intern) horizontally
SCENE_MODELS.park_rocket = (g, u, m) => {
  const s = pivot(g, 0, 0, 0);
  const b = part(s, "cyl", m.col || "#ff4d8d", .14, .8, .14, 0, 0, 0); b.rotation.z = -Math.PI / 2;
  part(s, "cone", "#ffd23a", .15, .3, .15, .55, 0, 0).rotation.z = -Math.PI / 2;
  part(s, "cone", basic("#ff9a3c"), .14, .7, .14, -.75, 0, 0).rotation.z = Math.PI / 2;
  const st = part(s, "cyl", "#c9873a", .02, 1.2, .02, -.5, 0, .08); st.rotation.z = Math.PI / 2;
  u.anim = (tt) => { s.rotation.x = tt * 15; };
};
// the castle's fireworks show, looping forever above the towers
SCENE_MODELS.park_sky = (g, u) => {
  u.bursts = [0, 1, 2, 3, 4].map(i => {
    const c = pivot(g, (i - 2) * 4.2, 11 + (i % 2) * 2.5, -1 - (i % 3)), col = PARK_COLS[i];
    const pts = Array.from({ length: 12 }, (_, k) => part(c, "sph", basic(k % 3 ? col : "#ffffff"), .2, .2, .2, 0, 0, 0));
    return { c, pts, ph: i * .53 };
  });
  u.anim = (tt) => u.bursts.forEach(b => {
    const q = ((tt * .45 + b.ph) % 1.2) / 1.2, on = q < .75, r = Math.sqrt(q / .75) * 2.6;
    b.c.visible = on;
    b.pts.forEach((p, k) => { const a = k / 12 * 6.283, e = (k % 2) * .5; p.position.set(Math.cos(a) * r, Math.sin(a) * r - q * q * 2, Math.sin(a + e) * r * .4); p.scale.setScalar(.2 * (1 - q * .9)); });
  });
};
// "the line starts here": a bored teenager holding a big arrow sign
SCENE_PERSONS.park_teen = { body: "#ff4d8d", legs: "#2b3a55", hat: "cap", hatCol: "#ffd23a",
  extra(g, u, b) {
    part(b, "box", "#ffffff", .05, .14, .2, .2, 1.3, .1);
    const pole = part(b, "cyl", "#8a8f96", .03, 2.6, .03, .3, 1.7, .3);
    part(b, "box", "#ffd23a", .08, .8, 1.6, .3, 3, .3); part(b, "box", "#d8322b", .09, .3, 1, .3, 3, .3);
    part(b, "cone", "#d8322b", .25, .35, .25, .3, 3, -.45).rotation.x = -Math.PI / 2;
  } };

// ---------- the venue ----------
SCENES.park = {
  name: "Grand Opening", tag: "The theme park opens today. Most rides do too.", place: "WONDERLANDIA", outside: "#7cc45a", bulbH: 1.2, music: "circus",
  light: { sky: 0xe6f4ff, ground: 0x6a9a4a, hemi: .64, sun: 0xfff2d6, sunI: 1.2 }, crowd: 3300, fenceBudget: 70, maxGates: 5, guards: 4,
  gates: [F, F, F, F, F, T, T], unlock: 30,
  intro: "Wonderlandia opens its gates today with a castle, fireworks and a mascot who is definitely not a mouse. Most rides passed inspection; the others passed near an inspector.",
  acts: ["Welcome to Wonderlandia!", "Fireworks!", "Make magic memories!", "Most rides open soon!", "Wave at Mousebear!"],
  events: ["hug", "dinos", "coaster", "teacup", "churros", "fireworks", "line", "hug"],
  goal: o => o.kind === "park_rope", goalMaxY: 14,
  heights: { park_rope: 1.0, park_hedge: 1.1, park_castle: .4, park_tower: .4, park_statue: 1.1, park_carousel: .35, park_teacups: .3, park_stall: 2.4, park_flowers: .45, park_booth: 2.2 },
  sfx: { "FREE HUGS!": "cheer", "SQUEEZE!": "honk", "DINO DISCO!": "roar", "RAWR!": "roar", "WHEEEEE!": "scream", "OFF THE RAILS!": "crash", "RUNAWAY TEACUP!": "crash",
    "FREE CHURROS!": "jingle", "SIDEWAYS!": "fiu", "OOOOH!": "cheer", "THE LINE STARTS HERE!": "whistle", "RIDE IS CLOSED!": "horn", "IT'S MINE!": "cheer", "RIDE REOPENED!": "jingle", "WELCOME TO WONDERLANDIA!": "trumpet" },
  lines: {
    hug: "Mousebear, the park's legally distinct mascot, hugged 400 people; the costume will be burned.",
    dinos: "The dinosaur parade float played the same disco song 63 times; the T-rex's arms were too short to stop it.",
    coaster: "The roller coaster car left the track during its first lap and completed the ride inside the crowd.",
    teacup: "A teacup detached from the teacup ride and spun through the park, still carrying a man who refuses to get out.",
    churros: "The churro cart offered free churros \"for the first ten guests\"; there were three thousand first ten guests.",
    fireworks: "The opening fireworks were installed sideways; the crowd was given a very close view.",
    line: "A teenager with a sign announced \"the line for the new ride starts here\"; the ride had not been built yet.",
  },
  quotes: ["“Every ride is safe. Some rides are also fun,” said the Wonderlandia CEO from inside his car, with the doors locked.",
    "“I waited six hours for the teacups and then a teacup came to me,” said a visitor, still dizzy.",
    "“Mousebear is a bear. The ears are a medical condition,” clarified the park's legal department."],
  build() {
    // the castle at the top, with the rope line where everyone wants to be for the fireworks
    rect(9, 0, 31, 7, "park_castle"); circ(5.5, 4, 2.6, "park_tower"); circ(34.5, 4, 2.6, "park_tower");
    seg(7, PARK_ROPE_Y, 33, PARK_ROPE_Y, .3, "park_rope");
    seg(1, PARK_ROPE_Y, 6.4, PARK_ROPE_Y, .8, "park_hedge"); seg(33.6, PARK_ROPE_Y, 39, PARK_ROPE_Y, .8, "park_hedge");
    // the mascot statue in the plaza splits the crowd
    circ(20, 21, 1.6, "park_statue");
    // the rides
    circ(PARK_CARO.x, PARK_CARO.y, PARK_CARO.r, "park_carousel");
    circ(PARK_CUPS.x, PARK_CUPS.y, PARK_CUPS.r, "park_teacups");
    for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283 + .2; circ(PARK_COAST.x + Math.cos(a) * PARK_COAST.r, PARK_COAST.y + Math.sin(a) * PARK_COAST.r, .35, "park_post"); }
    // flower beds and food stalls: the bottlenecks
    circ(20, 33, 1.8, "park_flowers"); rect(14, 40, 18, 42, "park_flowers"); rect(22, 40, 26, 42, "park_flowers");
    rect(0, 46, 5.5, 52, "park_stall"); rect(34.5, 51, WW, 57, "park_stall"); rect(16, 50, 24, 52.5, "park_booth");
  },
  ground(g) {
    // lawn
    g.fillStyle = "#7cc45a"; g.fillRect(0, 0, WW, WH);
    const rand = rng(303);
    for (let k = 0; k < 2600; k++) { g.fillStyle = k % 3 ? "rgba(40,100,30,.22)" : "rgba(200,240,140,.3)"; g.fillRect(rand() * WW, rand() * FENCE_Y, .08, .22); }
    // painted paths: pink pavement with a tile pattern
    g.fillStyle = "#f6d6c8";
    g.fillRect(13, 8, 14, FENCE_Y - 8); g.fillRect(0, 8, WW, 6.5);
    g.beginPath(); g.ellipse(20, 22, 10, 6.5, 0, 0, 7); g.fill();
    g.beginPath(); g.arc(PARK_CARO.x, PARK_CARO.y, PARK_CARO.r + 2.2, 0, 7); g.fill(); g.fillRect(PARK_CARO.x, 28.5, 6, 5);
    g.beginPath(); g.arc(PARK_CUPS.x, PARK_CUPS.y, PARK_CUPS.r + 2.2, 0, 7); g.fill(); g.fillRect(25, 39.5, 6, 5);
    g.fillRect(2, 54, 36, 5);
    g.strokeStyle = "rgba(200,120,120,.25)"; g.lineWidth = .05;
    for (let x = 13; x <= 27; x += 1) { g.beginPath(); g.moveTo(x, 8); g.lineTo(x, FENCE_Y); g.stroke(); }
    for (let y = 8; y < FENCE_Y; y += 1) { g.beginPath(); g.moveTo(13, y); g.lineTo(27, y); g.stroke(); }
    // yellow-brick centre stripe and colored dots
    g.fillStyle = "#ffd23a"; for (let y = 14.5; y < FENCE_Y; y += 1.2) g.fillRect(19.3, y, 1.4, .8);
    for (let k = 0; k < 500; k++) { g.fillStyle = PARK_COLS[k % 6]; g.globalAlpha = .45; g.fillRect(13 + rand() * 14, 8 + rand() * 58, .1, .1); }
    g.globalAlpha = 1;
    // flower beds painted around the lawn
    const bed = (x, y, r) => { g.fillStyle = "#5a3b22"; g.beginPath(); g.ellipse(x, y, r, r * .6, 0, 0, 7); g.fill(); for (let k = 0; k < r * 30; k++) { const a = rand() * 6.283, d = Math.sqrt(rand()) * r * .9; g.fillStyle = PARK_COLS[k % 6]; g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * .6, .14, 0, 7); g.fill(); } };
    for (const [x, y, r] of [[4, 18, 1.6], [36.5, 30, 1.4], [3, 40, 1.2], [8, 60, 1.5], [32, 60, 1.5], [37, 46, 1.2]]) bed(x, y, r);
    // big lettering
    g.textAlign = "center"; g.textBaseline = "middle";
    g.save(); g.translate(20, 61.5); g.font = "900 2.6px Rubik, sans-serif"; g.lineWidth = .25; g.strokeStyle = "#d8322b"; g.strokeText("WELCOME", 0, 0);
    g.fillStyle = "#ffffff"; g.fillText("WELCOME", 0, 0);
    g.font = "900 .6px Rubik, sans-serif"; g.fillStyle = "#7a3a5a"; g.fillText("TO THE HAPPIEST PLACE THAT IS LEGALLY ALLOWED TO SAY SO", 0, 1.9); g.restore();
    g.save(); g.translate(20, 45.5); g.globalAlpha = .55;
    g.fillStyle = "#b77dff"; g.font = "900 2px Rubik, sans-serif"; g.fillText("WONDERLANDIA", 0, 0);
    g.font = "900 .7px Rubik, sans-serif"; g.fillStyle = "#d8322b"; g.fillText("★ GRAND OPENING ★", 0, 1.5); g.restore();
    // signs painted on the paths
    g.font = "900 .62px Rubik, sans-serif"; g.fillStyle = "rgba(122,58,90,.85)";
    g.fillText("← CAROUSEL (MOSTLY HORSES)", 8.5, 26); g.fillText("TEACUPS (WAIT: 340 MIN) →", 31, 36.6);
    g.fillText("↑ CASTLE & FIREWORKS ↑", 20, 30); g.fillText("COASTER (OPEN-ISH) ↗", 31, 15.2);
    // queue maze markings around the teacups
    g.strokeStyle = "rgba(216,50,43,.55)"; g.lineWidth = .1; g.setLineDash([.4, .3]);
    for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(25.5, 47 + k * .9); g.lineTo(36, 47 + k * .9); g.stroke(); }
    g.setLineDash([]);
    // the coaster's shadow on the ground
    g.strokeStyle = "rgba(30,40,30,.18)"; g.lineWidth = 1.1; g.beginPath(); g.arc(PARK_COAST.x + .6, PARK_COAST.y + .4, PARK_COAST.r, 0, 7); g.stroke();
    // the parking lot at the bottom
    g.fillStyle = "#55585c"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
    g.fillStyle = "#f4f4f2"; for (let x = 1; x < WW; x += 2.6) g.fillRect(x, 69.8, .12, 2.2);
    g.fillStyle = "#ffd23a"; g.font = "900 .6px Rubik, sans-serif"; g.fillText("PARKING $60 · LOT \"GRUMPY\"", 20, 68.4);
  },
  decor(g) {
    g.textAlign = "center"; g.textBaseline = "middle";
    // castle footprint and moat strip in front of it
    g.fillStyle = "#f2b8d6"; g.fillRect(9, 0, 22, 7);
    g.fillStyle = "#6fc8ef"; g.fillRect(0, 7.2, WW, 1.4);
    g.fillStyle = "rgba(255,255,255,.5)"; for (let x = .5; x < WW; x += 1.7) g.fillRect(x, 7.7, .6, .1);
    g.fillStyle = "#8a5a34"; g.fillRect(17.5, 7, 5, 1.8);                       // drawbridge
    for (const o of obs) if (o.kind === "park_tower") { g.fillStyle = "#e89cc4"; g.beginPath(); g.arc(o.x, o.y, o.r, 0, 7); g.fill(); }
    // hedges at the sides, velvet rope line with brass posts in front of the castle
    for (const o of obs) if (o.kind === "park_hedge") {
      g.lineCap = "round"; g.lineWidth = o.th; g.strokeStyle = "#2f6a2a"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke();
      for (let x = o.ax; x <= o.bx; x += .7) { g.fillStyle = (x * 10 | 0) % 3 ? "#3f8a34" : PARK_COLS[(x | 0) % 6]; g.beginPath(); g.arc(x, o.ay, (x * 10 | 0) % 3 ? .3 : .14, 0, 7); g.fill(); }
    }
    g.lineWidth = .18; g.strokeStyle = "#d8322b"; g.beginPath();
    for (let x = 7; x <= 33; x += .5) g.lineTo(x, PARK_ROPE_Y + Math.abs(Math.sin((x - 7) / 2 * Math.PI)) * .25);
    g.stroke();
    g.fillStyle = "#e3b23c"; for (let x = 7; x <= 33; x += 2) { g.beginPath(); g.arc(x, PARK_ROPE_Y, .2, 0, 7); g.fill(); }
    // statue pedestal
    g.fillStyle = "#d9d2c5"; g.beginPath(); g.arc(20, 21, 1.6, 0, 7); g.fill();
    g.font = "900 .35px Rubik, sans-serif"; g.fillStyle = "#7a6a5a"; g.fillText("OUR FOUNDER", 20, 22.1);
    // carousel and teacup bases (the rides themselves are 3D)
    g.fillStyle = "#e8c86a"; g.beginPath(); g.arc(PARK_CARO.x, PARK_CARO.y, PARK_CARO.r, 0, 7); g.fill();
    g.fillStyle = "#ff9cc8"; g.beginPath(); g.arc(PARK_CUPS.x, PARK_CUPS.y, PARK_CUPS.r, 0, 7); g.fill();
    // flower beds (obstacles)
    for (const o of obs) if (o.kind === "park_flowers") {
      g.fillStyle = "#4f9a3a";
      if (o.t === "c") { g.beginPath(); g.arc(o.x, o.y, o.r, 0, 7); g.fill(); } else g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0);
      const rd = rng(Math.round(o.t === "c" ? o.x * 7 : o.x0 * 13));
      for (let k = 0; k < 40; k++) {
        let x, y; if (o.t === "c") { const a = rd() * 6.283, d = Math.sqrt(rd()) * o.r * .9; x = o.x + Math.cos(a) * d; y = o.y + Math.sin(a) * d; } else { x = o.x0 + .2 + rd() * (o.x1 - o.x0 - .4); y = o.y0 + .2 + rd() * (o.y1 - o.y0 - .4); }
        g.fillStyle = PARK_COLS[k % 6]; g.beginPath(); g.arc(x, y, .16, 0, 7); g.fill();
      }
    }
    // food stalls: striped roofs with the menu painted on top
    const stall = (o, a, b, label) => {
      for (let x = o.x0, i = 0; x < o.x1; x += .6, i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(x, o.y0, Math.min(.6, o.x1 - x), o.y1 - o.y0); }
      g.fillStyle = "#ffffff"; g.fillRect(o.x0 + .4, (o.y0 + o.y1) / 2 - .5, o.x1 - o.x0 - .8, 1);
      g.font = "900 .5px Rubik, sans-serif"; g.fillStyle = "#151617"; g.fillText(label, (o.x0 + o.x1) / 2, (o.y0 + o.y1) / 2);
    };
    const st = obs.filter(o => o.kind === "park_stall");
    stall(st[0], "#ffd23a", "#d8322b", "CHURROS $14"); stall(st[1], "#4fc8ff", "#ffffff", "TURKEY LEG $38");
    const bo = obs.find(o => o.kind === "park_booth");
    stall(bo, "#b77dff", "#ff9cc8", "PHOTO WITH MOUSEBEAR · $45");
    // welcome banner over the gates
    g.fillStyle = "#b77dff"; g.fillRect(3, FENCE_Y - 2.4, WW - 6, 1.1);
    g.fillStyle = "#ffffff"; g.font = "900 .7px Rubik, sans-serif"; g.fillText("WONDERLANDIA · GRAND OPENING · NO REFUNDS · NO REFUNDS", 20, FENCE_Y - 1.85);
  },
  bulbs: Array.from({ length: 14 }, (_, i) => [7 + i * 2, PARK_ROPE_Y]),
  beams: [{ x: 20, y: 7, a: -Math.PI / 2, sweep: .7, h: 8 }, { x: 6, y: 9, a: -1.2, sweep: .5, h: 8 }, { x: 34, y: 9, a: -1.9, sweep: .5, h: 8 }],
  extra3D(grp) {
    // the castle: pink walls, crenellations, towers with blue roofs, and plywood bracing visible from behind
    const pink = mat("#f6c0dc", { roughness: .6 }), pinkD = mat("#e89cc4", { roughness: .6 }), blue = mat("#3f7fe0", { roughness: .45 }), gold = mat("#e3b23c", { metalness: .6, roughness: .3 });
    part(grp, "box", pink, 22, 5.5, 5, 20, 2.75, 3.5);
    for (let x = 9.5; x < 31; x += 1.4) part(grp, "box", pinkD, .7, .7, 5, x, 5.85, 3.5);
    part(grp, "box", mat("#3a2418"), 4, 3.6, .3, 20, 1.8, 6.05);                           // the gate
    part(grp, "cyl", mat("#3a2418"), 2, .3, 2, 20, 3.6, 6.05).rotation.x = Math.PI / 2;
    for (let x = 18.4; x < 21.8; x += .5) part(grp, "box", "#8a8f96", .08, 3.4, .08, x, 1.9, 6.25);  // portcullis
    const tower = (x, z, r, h, roofH) => {
      part(grp, "cyl", pink, r, h, r, x, h / 2, z);
      for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283; part(grp, "box", pinkD, .5, .6, .5, x + Math.cos(a) * r * .9, h + .3, z + Math.sin(a) * r * .9); }
      part(grp, "cone", blue, r * 1.15, roofH, r * 1.15, x, h + .6 + roofH / 2, z);
      part(grp, "cyl", "#8a8f96", .04, 1.4, .04, x, h + .6 + roofH + .7, z);
      part(grp, "box", PARK_COLS[(x | 0) % 6], .9, .5, .04, x + .45, h + .6 + roofH + 1.1, z);
      for (let y = 2; y < h - 1; y += 2.2) part(grp, "box", basic("#fff3a0"), .4, .7, .1, x, y, z + r + .02);
    };
    tower(5.5, 4, 2.4, 8, 4); tower(34.5, 4, 2.4, 8, 4); tower(20, 2.5, 2.2, 11, 5); tower(12, 2, 1.2, 7.5, 2.6); tower(28, 2, 1.2, 7.5, 2.6);
    // the castle sign
    part(grp, "box", "#b77dff", 10, 1.4, .2, 20, 6.8, 6.2);
    part(grp, "box", basic("#ffffff"), 9.4, .9, .05, 20, 6.8, 6.32);
    for (let i = 0; i < 12; i++) part(grp, "box", basic(PARK_COLS[i % 6]), .5, .5, .06, 15.9 + i * .75, 6.8, 6.36);
    // plywood bracing behind the "castle" (it's a facade)
    for (const x of [11, 16, 24, 29]) { const b = part(grp, "box", "#c9a46e", .2, 6, .2, x, 2.5, .6); b.rotation.x = .5; }
    // the coaster: two rails and ties on a wavy loop, held up by posts
    const C = PARK_COAST, N = 64, P = (a, r) => [C.x + Math.cos(a) * r, PARK_TH(a), C.y + Math.sin(a) * r];
    const rail = mat("#d8322b", { metalness: .4, roughness: .4 }), tie = mat("#2b2f35", { roughness: .6 }), post = mat("#ffd23a", { metalness: .3, roughness: .5 });
    for (let i = 0; i < N; i++) {
      const a0 = i / N * 6.283, a1 = (i + 1) / N * 6.283;
      for (const r of [C.r - .5, C.r + .5]) {
        const [x0, y0, z0] = P(a0, r), [x1, y1, z1] = P(a1, r), len = Math.hypot(x1 - x0, y1 - y0, z1 - z0);
        const s = part(grp, "box", rail, .14, .14, len + .05, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); s.lookAt(x1, y1, z1);
      }
      const am = (a0 + a1) / 2, p = pivot(grp, C.x + Math.cos(am) * C.r, PARK_TH(am) - .1, C.y + Math.sin(am) * C.r); p.rotation.y = -am;
      part(p, "box", tie, 1.25, .08, .18, 0, 0, 0);
    }
    for (let k = 0; k < 8; k++) {
      const a = k / 8 * 6.283 + .2, x = C.x + Math.cos(a) * C.r, z = C.y + Math.sin(a) * C.r, h = PARK_TH(a);
      part(grp, "cyl", post, .18, h, .18, x, h / 2, z); part(grp, "box", post, .2, .2, 1.3, x, h - .25, z).rotation.y = -a + Math.PI / 2;
    }
    // the giant statue: Mousebear, 4 m tall, slightly cross-eyed
    const sp = pivot(grp, 20, 1.1, 21); sp.scale.setScalar(2.2); sp.rotation.y = Math.PI / 2;
    PARK_MASCOT(sp, { legs: [] }, { zip: true });
    // stall awnings, balloon bunches, lamp posts and trees
    const awn = (x0, x1, z, col) => { for (let x = x0, i = 0; x < x1; x += .6, i++) { const a = part(grp, "box", i % 2 ? "#ffffff" : col, .6, .08, 1.2, x + .3, 2.3, z); a.rotation.x = .35; } };
    awn(0, 5.5, 52.6, "#d8322b"); awn(34.5, 40, 50.4, "#4fc8ff"); awn(16, 24, 53.1, "#b77dff");
    const balloons = (x, z) => { for (let i = 0; i < 6; i++) { const a = i, bx = x + Math.cos(a) * .35, bz = z + Math.sin(a) * .35, by = 3.2 + (i % 3) * .3; part(grp, "cyl", "#dddddd", .01, by - 1, .01, x, (by + 1) / 2, z); part(grp, "sph", mat(PARK_COLS[i], { roughness: .25 }), .3, .36, .3, bx, by, bz); } };
    balloons(13.2, 14.2); balloons(26.8, 14.2); balloons(13.2, 58); balloons(26.8, 58);
    for (const [x, z] of [[12.6, 24], [27.4, 24], [12.6, 36], [27.4, 36], [12.6, 48], [27.4, 48]]) {
      part(grp, "cyl", "#2b2f35", .08, 3.2, .08, x, 1.6, z); part(grp, "sph", basic("#fff3a0"), .25, .25, .25, x, 3.3, z);
      part(grp, "box", PARK_COLS[(x * z | 0) % 6], .05, .9, .5, x + .1, 2.4, z);
    }
    const tree = (x, z, s) => { part(grp, "cyl", "#6b4a2b", .15, 1.6 * s, .15, x, .8 * s, z); part(grp, "sph", "#4f9a3a", 1 * s, 1.1 * s, 1 * s, x, 2.1 * s, z); part(grp, "sph", "#5fb04a", .6 * s, .6 * s, .6 * s, x + .4, 2.7 * s, z - .3); };
    for (const [x, z, s] of [[1.5, 22, 1.1], [38.5, 37, 1], [1.5, 58, 1.2], [38.5, 61, 1], [2, 34, .9], [38.5, 15.5, .9]]) tree(x, z, s);
    // a "COMING SOON" ride that is just a crane and a sign
    part(grp, "box", "#ffd23a", .3, 7, .3, 2.2, 3.5, 44); part(grp, "box", "#ffd23a", 4.5, .3, .3, 4, 7, 44);
    part(grp, "box", "#ffffff", .1, 1.2, 2.6, .4, 1.2, 43); part(grp, "box", "#d8322b", .12, .4, 2.2, .45, 1.2, 43);
  },
  ev: {
    hug(side) {
      const gx = openGateX(), pts = [[gx, 58], crowdPoint(), crowdPoint(), crowdPoint(), [side ? -4 : WW + 4, rnd(30, 50)]];
      addMover({ kind: "park_mascot", hug: true, x: gx, y: SH, pts, speed: 1.5, r: .7, push: 14, say: "FREE HUGS!", sayEvery: 3.2,
        tick(m) { (m.fol || (m.fol = followTick(12, 2.8, .35)))(m); m.sq = (m.sq || 0) + DT; if (m.sq > 4.5) { m.sq = 0; pop(m.x, m.y - 2.2, "SQUEEZE!"); } } });
      caption("Mousebear is giving free hugs! Nobody asks who is inside", true, 2200);
    },
    dinos(side) {
      const y = rnd(36, 52);
      addMover({ kind: "park_dinofloat", x: side ? -5 : WW + 5, y, pts: [[20, y + rnd(-3, 3)], [side ? WW + 7 : -7, y + rnd(-3, 3)]], speed: 1.4, r: 1.9, push: 26, scare: 2.4, say: "DINO DISCO!", sayEvery: 2.8,
        tick(m) { m.rw = (m.rw || 0) + DT; if (m.rw > 3.7) { m.rw = 0; pop(m.x + 1, m.y - 2.2, "RAWR!"); } } });
      caption("The dinosaur parade float is here! It only knows one song", false, 2200);
    },
    coaster() {
      const car = performers.find(p => p.kind === "park_coaster"); if (!car) return;
      const a = Math.atan2(car.y - PARK_COAST.y, car.x - PARK_COAST.x), h0 = PARK_TH(a), [tx, ty] = [rnd(8, 32), rnd(28, 52)];
      PARK_FX.carGone = t + 8;
      pop(car.x, car.y - 2, "WHEEEEE!", 6);
      addMover({ kind: "park_coaster", flying: true, beh: "fly", x: car.x, y: car.y, sx: car.x, sy: car.y, tx, ty, dur: 2, r: .9, push: 0, air: true, small: true, say: "", sayEvery: 9,
        tick(m) {
          const q = Math.min(1, m.t / m.dur); m.h = h0 * (1 - q) + Math.sin(q * Math.PI) * 6;
          if (Math.random() < .5) puff(m.x, m.y, m.h, "#f4f4f2", .3, 1, .4);
          if (m.dead && !m.boom) {
            m.boom = true; pop(m.x, m.y - 1.6, "OFF THE RAILS!"); shake = Math.min(1, shake + .5); burstAt(m.x, m.y, 30);
            for (const ag1 of ag) { const dx = ag1.x - m.x, dy = ag1.y - m.y, d = Math.hypot(dx, dy); if (d < 2.8 && d > .01) { const s = (1 - d / 2.8) * 2; ag1.vx += dx / d * s; ag1.vy += dy / d * s; ag1.p += (1 - d / 2.8) * .4; } }
            for (let k = 0; k < 10; k++) puff(m.x + rnd(-1.5, 1.5), m.y + rnd(-1.5, 1.5), .3, "#c9b28a", .6, 1.6, .8);
            addMover({ kind: "park_coaster", wreck: true, beh: "static", x: m.x, y: m.y, ang: m.ang, life: 3.5, r: .9, push: 8, scare: 1.4 });
          }
        } });
      later(8, () => { if (phase === "show") pop(PARK_COAST.x, PARK_COAST.y - 3, "RIDE REOPENED!", 6); });
      caption("The roller coaster car left the track! The riders are still screaming", true, 2400);
    },
    teacup() {
      const a = rnd(2.2, 4.2), x = PARK_CUPS.x + Math.cos(a) * (PARK_CUPS.r + 1.3), y = PARK_CUPS.y + Math.sin(a) * (PARK_CUPS.r + 1.3), sp = rnd(3.5, 4.5);
      addMover({ kind: "park_teacup", beh: "bounce", x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 1.1, push: 14, life: 11, col: pick(PARK_COLS), say: "RUNAWAY TEACUP!", sayEvery: 3.5 });
      caption("A teacup broke free from the teacup ride! The rider refuses to get out", true, 2200);
    },
    churros(side) {
      const y = rnd(42, 58), px = rnd(10, 30);
      addMover({ kind: "park_churrocart", x: side ? -4 : WW + 4, y, pts: [[px, y], [side ? WW + 6 : -6, y]], speed: 2.2, r: 1.2, push: 26, scare: 2, say: "FREE CHURROS!", sayEvery: 2.6,
        tick(m) {
          if (m.i === 1 && !m.parked) {
            m.parked = true; m.park = 5; m.scare = 0; m.push = 16;
            tempAttract(m.x, m.y, 3.2, 5, .3);
            for (let n = 0; n < 5; n++) { const tx = m.x + rnd(-6, 6), ty = clamp(m.y + rnd(-6, 6), 22, 62);
              addMover({ kind: "park_churro", beh: "fly", x: m.x, y: m.y, sx: m.x, sy: m.y, tx, ty, dur: .9 + Math.random() * .6, r: .2, push: 0, air: true, small: true }); }
            later(1.2, () => { if (phase === "show") pop(m.x, m.y - 1.8, "IT'S MINE!"); });
          }
          if (m.parked && m.park > 0) { m.park -= DT; m.speed = m.park > 0 ? 0 : 2.2; if (m.park <= 0) { m.scare = 2; m.push = 26; } }
        } });
      caption("Free churros! (For the first ten guests)", false, 2000);
    },
    fireworks() {
      caption("The opening fireworks were installed... sideways", true, 2200);
      pop(20, 9, "OOOOH!", 4);
      for (let n = 0; n < 3; n++) rockets.push({ x: 8 + n * 12, y: 4, h: 10, vh: 22 + Math.random() * 6, fuse: .6 + Math.random() * .4, delay: n * .3, col: PARK_COLS[n * 2] });
      for (let n = 0; n < 6; n++) later(.8 + n * .35, () => {
        if (phase !== "show") return;
        const sx = rnd(9, 31), [tx, ty] = crowdPoint();
        addMover({ kind: "park_rocket", beh: "fly", x: sx, y: 9, sx, sy: 9, tx, ty, dur: 1.1, r: .2, push: 0, air: true, small: true, col: PARK_COLS[n % 6], say: n ? "" : "SIDEWAYS!", sayEvery: 9,
          tick(m) { if (Math.random() < .7) puff(m.x, m.y, m.h, "#ffe9b0", .25, .8, .3); if (m.dead && !m.fl) { m.fl = true; flash = Math.max(flash, .3); for (let k = 0; k < 6; k++) puff(m.x, m.y, .5, PARK_COLS[k], .4, 1.2, 1.5); } } });
      });
      cheerT = 3;
    },
    line() {
      const [x, y] = pick([[3, 40], [37, 32], [3, 24]]);
      addMover({ kind: "park_teen", beh: "static", x, y, ang: x < 20 ? 0 : Math.PI, life: 8, r: .4, push: 0, say: "THE LINE STARTS HERE!", sayEvery: 2.8 });
      later(.3, () => { if (phase === "show") tempAttract(x, y, 3.5, 5, .22); });
      later(5.3, () => { if (phase === "show") pop(x, y - 2, "RIDE IS CLOSED!"); });
      caption("\"The line for the new ride starts HERE!\" Everyone runs", true, 2200);
    },
  },
  performers: () => [
    { kind: "park_carousel", orbit: [PARK_CARO.x, PARK_CARO.y, .001, .55, 0], h: .35, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "park_teacups", orbit: [PARK_CUPS.x, PARK_CUPS.y, .001, -.45, 0], h: .3, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "park_coaster", orbit: [PARK_COAST.x, PARK_COAST.y, PARK_COAST.r, 1.1, 0], x: 0, y: 0, ang: 0, t: 0 },
    { kind: "park_sky", orbit: [20, 2, .001, 0, 0], x: 0, y: 0, ang: 0, t: 0 },
    { kind: "park_mascot", orbit: [20, 9.6, .8, .35, 0], x: 0, y: 0, ang: 0, t: 0 },
    { kind: "park_teen", orbit: [PARK_CUPS.x, PARK_CUPS.y + PARK_CUPS.r + .7, .01, 0, 0], x: 0, y: 0, ang: 0, t: 0 },
  ],
};
