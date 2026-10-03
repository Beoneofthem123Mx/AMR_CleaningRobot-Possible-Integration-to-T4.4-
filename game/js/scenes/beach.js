// Human Tsunami · scene: Free Ice Cream Beach (one giant cone, forty thousand people, zero shade)
// the sea fills the left side; its shoreline drifts a little to the left as you walk down the beach
const BEACH_SHORE = y => 10.4 - 3.4 * clamp(y, 0, 56) / 56;
const BEACH_WATER = y => BEACH_SHORE(y) - .35 + Math.sin(y * 1.3) * .22;   // painted water edge (always inside the sea obstacle)
const BEACH_TOWER = { x: 35.75, y: 25.75 };
const BEACH_PARASOLS = [[14, 18, "#ff5a5f"], [21, 21, "#2f9fe0"], [28, 17.5, "#ffd23a"], [32, 31, "#3dbf7a"], [13, 28, "#ff8fc6"], [19, 31.5, "#ff9a1f"],
  [26, 27, "#8a4fbf"], [15, 38.5, "#2f9fe0"], [23, 39, "#ff5a5f"], [30, 39.5, "#ffd23a"], [12, 53, "#3dbf7a"], [20, 52.5, "#ff8fc6"], [28, 53.5, "#2f9fe0"], [35, 52, "#ff9a1f"]];
const BEACH_FLAVORS = ["#ff8fc6", "#9ff0c8", "#7a4a2a", "#fff3c9", "#ffd23a", "#c9a0ff"];
const BEACH_pt = () => [rnd(12, 34), rnd(16, 56)];
// rescale a part relative to the size it was built with
const BEACH_sc = (o, x, y, z) => { const b = o.userData.s0 || (o.userData.s0 = o.scale.clone()); o.scale.set(b.x * x, b.y * (y ?? x), b.z * (z ?? x)); };
const BEACH_live = () => phase === "show" || phase === "evac";

// ---------- models (all face +x) ----------
// the shark fin (it is Gary from accounting in a costume, but nobody knows that yet)
SCENE_MODELS.beach_fin = (g, u, m) => {
  const b = pivot(g, 0, 0, 0), grey = mat("#5d6f80", { roughness: .4 });
  const fin = part(b, "cone", grey, .9, 1.7, .9, 0, .75, 0); fin.scale.z = .12; fin.rotation.z = .35;
  part(b, "cone", "#e9eef2", .5, .3, .08, .05, .1, 0);
  const foam = mat("#ffffff", { transparent: true, opacity: .8 });
  u.foam = [0, 1, 2, 3, 4].map(i => part(b, "sph", foam, .35, .1, .35, -.4 - i * .55, .05, (i % 2 - .5) * .5));
  u.anim = (tt) => { b.position.y = Math.sin(tt * 3) * .12; b.rotation.x = Math.sin(tt * 1.7) * .08; u.foam.forEach((f, i) => BEACH_sc(f, .6 + .4 * Math.abs(Math.sin(tt * 4 + i)))); };
};
// the giant ice cream cone that IS the stage (well, it stands on it)
SCENE_MODELS.beach_cone = (g, u) => {
  const c = pivot(g, 0, 0, 0);
  const cone = part(c, "cone", mat("#d9a25a", { roughness: .8 }), 2.3, 5.6, 2.3, 0, 2.8, 0); cone.rotation.x = Math.PI;
  for (let i = 0; i < 4; i++) part(c, "cyl", "#b8823e", 2.05 - i * .45, .08, 2.05 - i * .45, 0, 4.8 - i * 1.2, 0);   // waffle rings
  const top = pivot(c, 0, 5.6, 0); u.top = top;
  part(top, "sph", "#ff8fc6", 2.4, 1.8, 2.4, 0, .9, 0);          // strawberry
  part(top, "sph", "#9ff0c8", 2, 1.6, 2, .2, 2.6, -.1);          // mint
  part(top, "sph", "#7a4a2a", 1.6, 1.3, 1.6, -.1, 4, .1);        // chocolate
  part(top, "sph", basic("#ff2b3a"), .5, .5, .5, 0, 5.4, 0);     // the cherry glows a little
  const st = part(top, "cyl", "#2f8f3a", .05, .9, .05, .2, 6, 0); st.rotation.z = -.4;
  for (let i = 0; i < 40; i++) { const a = i * 2.4, r = 1.2 + (i % 5) * .2, y = .8 + (i % 7) * .55; const sp = part(top, "box", BEACH_FLAVORS[(i + 2) % 6] === "#7a4a2a" ? "#2f9fe0" : ["#ffd23a", "#2f9fe0", "#ff5a5f", "#ffffff", "#3dbf7a"][i % 5], .32, .08, .08, Math.cos(a) * r, y, Math.sin(a) * r); sp.rotation.y = a; }
  for (const [x, z, l] of [[2.1, .3, 1.4], [-1.6, 1.4, 1], [.4, -2.2, 1.8]]) { part(top, "cyl", "#ff8fc6", .22, l, .22, x, .2 - l / 2, z); part(top, "sph", "#ff8fc6", .26, .3, .26, x, .2 - l, z); }
  u.anim = (tt) => { c.rotation.y = tt * .25; top.rotation.z = Math.sin(tt * 1.3) * .04; top.scale.y = 1 + Math.sin(tt * 2.6) * .025; };
};
// a giant inflatable whale (somebody's pool toy, 6 meters long, escaped)
SCENE_MODELS.beach_whale = (g, u, m) => {
  const b = pivot(g, 0, 0, 0), blue = mat("#3fa4ff", { roughness: .25 }), belly = mat("#e6f6ff", { roughness: .25 });
  part(b, "sph", blue, 2.2, 1.4, 1.5, 0, 1.4, 0);
  part(b, "sph", belly, 1.9, .9, 1.25, .2, 1.05, 0);
  const tail = pivot(b, -2, 1.6, 0); u.tail = tail;
  part(tail, "cyl", blue, .45, 1.2, .45, -.4, .3, 0).rotation.z = 1.1;
  for (const z of [-1, 1]) { const f = part(tail, "sph", blue, .9, .15, .5, -1.1, .8, z * .45); f.rotation.y = z * .4; }
  for (const z of [-1, 1]) { const fl = part(b, "sph", blue, .7, .14, .4, .5, .9, z * 1.45); fl.rotation.x = z * .5; part(b, "sph", "#ffffff", .25, .25, .12, 1.45, 1.8, z * .95); part(b, "sph", "#111", .12, .12, .08, 1.6, 1.82, z * .98); part(b, "sph", "#ff8fc6", .2, .1, .08, 1.65, 1.45, z * 1.05); }
  part(b, "box", "#1d3f7a", .5, .06, 1.2, 2.05, 1.25, 0);    // a smile
  part(b, "cyl", "#ffd23a", .12, .2, .12, -.2, 2.85, 0);     // the inflation valve
  const sp = pivot(b, .8, 2.7, 0); u.spout = sp;
  const water = mat("#9fe3ff", { transparent: true, opacity: .7 });
  for (let i = 0; i < 5; i++) part(sp, "sph", water, .2, .4, .2, Math.cos(i * 1.26) * .35, .6 + (i % 2) * .3, Math.sin(i * 1.26) * .35);
  u.anim = (tt) => {
    const k = Math.abs(Math.sin(tt * 2.6)); b.position.y = k * 1.6; b.scale.set(1 + (1 - k) * .12, 1 - (1 - k) * .14, 1 + (1 - k) * .12);
    tail.rotation.z = Math.sin(tt * 3) * .3; sp.scale.setScalar(.6 + .5 * Math.abs(Math.sin(tt * 1.4)));
  };
};
// a jet ski with a man in a tank top who thinks the beach is a lane
SCENE_MODELS.beach_jetski = (g, u, m) => {
  const b = pivot(g, 0, 0, 0);
  part(b, "box", "#f4f4f2", 2.2, .45, .9, 0, .4, 0);
  const nose = part(b, "cone", "#f4f4f2", .45, .8, .45, 1.45, .4, 0); nose.rotation.z = -Math.PI / 2; nose.scale.z = 2;
  part(b, "box", "#ff2fa0", 2.25, .12, .92, 0, .6, 0);
  part(b, "box", "#1c1c1e", .9, .2, .55, -.3, .75, 0);                  // seat
  part(b, "cyl", "#2b2f35", .05, .6, .05, .55, .9, 0).rotation.x = Math.PI / 2;
  part(b, "box", "#2b2f35", .1, .4, .1, .55, .75, 0);
  // the rider: tank top, sunglasses, zero regrets
  const r = pivot(b, -.2, .85, 0);
  part(r, "sph", "#f2f2ef", .26, .38, .3, 0, .45, 0); part(r, "sph", "#e0a77a", .17, .19, .17, .05, .98, 0);
  part(r, "box", "#111", .06, .07, .3, .2, 1.02, 0); part(r, "sph", "#e9b923", .18, .08, .18, -.02, 1.15, 0);
  for (const z of [-1, 1]) { const a = part(r, "cyl", "#e0a77a", .06, .55, .06, .35, .55, z * .25); a.rotation.z = -1.1; part(r, "cyl", "#2f6fc4", .08, .5, .08, .15, .05, z * .17).rotation.z = -1.3; }
  const spray = mat("#dff6ff", { transparent: true, opacity: .75 });
  u.spray = [0, 1, 2, 3, 4, 5].map(i => part(b, "sph", spray, .35, .35, .35, -1.3 - i * .35, .4, (i % 2 ? 1 : -1) * (.3 + i * .12)));
  u.anim = (tt, mm) => {
    b.rotation.x = Math.sin(tt * 11) * .06; b.position.y = Math.abs(Math.sin(tt * 7)) * .18; b.rotation.z = .08;
    const sand = mm && mm.onSand; u.spray.forEach((s, i) => { s.material = sand ? mat("#e7c88f") : spray; BEACH_sc(s, .5 + .6 * Math.abs(Math.sin(tt * 9 + i))); });
  };
};
// a striped beach parasol (also flies very well)
SCENE_MODELS.beach_parasol = (g, u, m) => {
  const col = m.col || "#ff5a5f", p = pivot(g, 0, 0, 0);
  part(p, "cyl", "#f4f4f2", .05, 2.3, .05, 0, 1.15, 0);
  const can = pivot(p, 0, 2.25, 0); u.can = can;
  part(can, "cone", col, 1.6, .55, 1.6, 0, 0, 0);
  for (let i = 0; i < 4; i++) { const s = part(can, "cone", "#ffffff", 1.62, .56, .25, 0, .005, 0); s.rotation.y = i * Math.PI / 4; }
  part(can, "sph", col, .1, .1, .1, 0, .3, 0);
  if (m.flying) u.anim = (tt) => { p.rotation.x = tt * 7; p.rotation.z = tt * 4; };
  else u.anim = (tt) => { can.rotation.y = Math.sin(tt * .8 + (m.x || 0)) * .1; };
};
// the ice cream truck (the OTHER one, with the jingle)
SCENE_MODELS.beach_truck = (g, u) => {
  part(g, "box", "#ffd9ec", 4.2, 2, 2.2, -.4, 1.4, 0);
  for (let x = -2.3; x < 1.6; x += .8) part(g, "box", "#9ff0c8", .38, 2.02, 2.22, x, 1.4, 0);
  part(g, "box", "#ff8fc6", 1.4, 1.6, 2.1, 2.35, 1.2, 0); part(g, "box", mat("#1d2733", { roughness: .2 }), .1, .7, 1.9, 3.06, 1.55, 0);
  part(g, "box", "#2b2f35", 2.2, .9, .1, -.4, 1.7, 1.12);                 // serving hatch
  for (const x of [-1.9, 2.3]) for (const s of [-1, 1]) { const w = part(g, "cyl", "#151617", .45, .3, .45, x, .45, s * 1.12); w.rotation.x = Math.PI / 2; }
  const cone = pivot(g, -.4, 2.4, 0); u.cone = cone;
  const c = part(cone, "cone", "#d9a25a", .55, 1.4, .55, 0, .7, 0); c.rotation.x = Math.PI;
  part(cone, "sph", "#c9a0ff", .7, .55, .7, 0, 1.55, 0); part(cone, "sph", basic("#ff2b3a"), .14, .14, .14, 0, 2.1, 0);
  u.notes = [0, 1, 2].map(i => part(g, "sph", basic(["#ff4fd8", "#4fd8ff", "#ffd23a"][i]), .16, .16, .16, 0, 3.5, 0));
  u.anim = (tt) => { cone.rotation.y = tt * 2; cone.position.y = 2.4 + Math.abs(Math.sin(tt * 5)) * .25; u.notes.forEach((n, i) => { const q = (tt * .8 + i / 3) % 1; n.position.set(-.4 + Math.sin(q * 9 + i) * .6, 3 + q * 2.4, Math.cos(q * 7) * .5); BEACH_sc(n, 1 - q * .6); }); };
};
// a seagull, optionally holding a stolen ice cream
SCENE_MODELS.beach_gull = (g, u, m) => {
  const b = pivot(g, 0, 0, 0); b.scale.setScalar(1.3);
  part(b, "sph", "#f7f7f2", .38, .2, .2, 0, 0, 0); part(b, "sph", "#f7f7f2", .14, .13, .13, .32, .08, 0);
  part(b, "sph", "#8f98a3", .3, .08, .22, -.1, .12, 0);
  for (const z of [-1, 1]) part(b, "sph", "#111", .03, .03, .03, .4, .12, z * .08);
  const bk = part(b, "cone", "#ffb02e", .04, .18, .04, .52, .05, 0); bk.rotation.z = -Math.PI / 2;
  u.wings = [-1, 1].map(z => { const p = pivot(b, 0, .1, z * .15); part(p, "box", "#c9ced6", .3, .03, .7, 0, 0, z * .35); part(p, "box", "#2b2f35", .2, .035, .15, -.03, 0, z * .7); return p; });
  const ic = pivot(b, .58, -.05, 0); u.ic = ic;
  const c = part(ic, "cone", "#d9a25a", .1, .3, .1, 0, -.15, 0); c.rotation.x = Math.PI; part(ic, "sph", m.col || "#ff8fc6", .14, .12, .14, 0, .02, 0);
  u.anim = (tt, mm) => { ic.visible = !!(mm && mm.cone); u.wings.forEach((w, i) => { w.rotation.x = (i ? 1 : -1) * Math.sin(tt * 14) * .6; }); };
};
// a dropped ice cream scoop on its way down
SCENE_MODELS.beach_drop = (g, u, m) => {
  const s = pivot(g, 0, 0, 0);
  const c = part(s, "cone", "#d9a25a", .14, .4, .14, 0, -.2, 0); c.rotation.x = Math.PI; part(s, "sph", m.col || "#9ff0c8", .2, .17, .2, 0, .05, 0);
  u.anim = (tt) => { s.rotation.z = tt * 8; s.rotation.x = tt * 5; };
};
// a five-litre bottle of SPF 100, squirting
SCENE_MODELS.beach_bottle = (g, u) => {
  const b = pivot(g, 0, 0, 0); b.rotation.z = -1.35;
  part(b, "cyl", "#ff9a1f", .45, 1.3, .3, 0, .65, 0); part(b, "box", "#ffffff", .5, .5, .32, 0, .7, 0); part(b, "box", "#2f9fe0", .3, .12, .33, 0, .8, 0);
  part(b, "cyl", "#ffd23a", .2, .3, .2, 0, 1.45, 0);
  const lotion = mat("#fffbe8", { roughness: .15 });
  u.goo = [0, 1, 2, 3, 4, 5, 6].map(i => part(g, "sph", lotion, .5, .08, .4, 1.6 + i * .5, .05, Math.sin(i * 2) * .5));
  u.anim = (tt) => { b.scale.set(1, 1 - Math.abs(Math.sin(tt * 4)) * .2, 1 + Math.abs(Math.sin(tt * 4)) * .25); u.goo.forEach((s, i) => BEACH_sc(s, Math.min(1.6, .3 + tt * .4 + i * .05))); };
};
// a foam strip that rolls in and out along the shoreline
SCENE_MODELS.beach_wave = (g, u, m) => {
  const w = pivot(g, 0, 0, 0), len = m.len || 12;
  const foam = mat("#cfe9ee", { transparent: true, opacity: .6, roughness: .6 }), crest = mat("#4fb8d0", { transparent: true, opacity: .35, roughness: .4 });
  part(w, "box", crest, .5, .08, len, -.55, .04, 0);
  u.blobs = []; for (let z = -len / 2; z <= len / 2; z += .7) u.blobs.push(part(w, "sph", foam, .16, .05, .32, (z * 7 % 3) * .06, .05, z));
  u.anim = (tt) => { const q = Math.sin(tt * .9 + (m.ph || 0)); w.position.x = q * .7 - .4; u.blobs.forEach((b, i) => BEACH_sc(b, .7 + .5 * Math.max(0, q), 1, 1 + Math.sin(tt * 2 + i) * .2)); };
};
// people
SCENE_PERSONS.beach_lifeguard = { body: "#e0a77a", legs: "#d8322b", hat: "hair", hatCol: "#ffd23a", scale: 1.08,
  extra(g, u, b) {
    part(b, "box", "#111", .06, .07, .3, .2, 1.62, 0);                                          // sunglasses
    part(b, "box", "#f4f4f2", .04, .07, .03, .22, 1.52, -.05);                                  // zinc on the nose
    part(b, "sph", "#c98f62", .23, .14, .3, .08, 1.28, 0);                                      // pecs (glistening)
    const can = part(b, "box", "#d8322b", .9, .2, .2, -.15, 1.15, .32); can.rotation.z = .6;   // rescue can
    part(b, "cyl", "#ffffff", .015, .3, .015, .15, 1.38, -.08);                                 // whistle lanyard
    u.anim = (tt) => { b.rotation.z = Math.sin(tt * 1.2) * .08; };
  } };
SCENE_PERSONS.beach_mascot = { body: "#ff8fc6", legs: "#d9a25a", hat: "none", scale: 1.15,
  extra(g, u, b, m) {
    const col = m.col || "#ff8fc6";
    part(b, "sph", col, .48, .44, .48, 0, 1.85, 0);                                  // giant scoop head
    for (const z of [-1, 1]) { part(b, "sph", "#ffffff", .1, .12, .08, .4, 1.92, z * .15); part(b, "sph", "#111", .05, .06, .05, .47, 1.92, z * .15); }
    part(b, "box", "#d8322b", .06, .06, .3, .45, 1.72, 0);                            // smile
    part(b, "sph", basic("#ff2b3a"), .12, .12, .12, 0, 2.32, 0);                       // cherry hat
    for (let i = 0; i < 6; i++) part(b, "box", ["#ffd23a", "#2f9fe0", "#3dbf7a"][i % 3], .14, .04, .04, Math.cos(i) * .35, 2.05 + (i % 2) * .1, Math.sin(i) * .35);
    const c = part(b, "cone", "#d9a25a", .32, .8, .32, 0, 1.15, 0); c.rotation.x = Math.PI;   // waffle-cone costume
  } };
SCENE_PERSONS.beach_server = { body: "#f4f4f2", legs: "#ff8fc6", hat: "cap", hatCol: "#ff8fc6",
  extra(g, u, b) {
    part(b, "box", "#ff8fc6", .05, .4, .4, .2, 1.1, 0);                     // apron
    const c = part(b, "cone", "#d9a25a", .1, .3, .1, .4, 1.25, .3); c.rotation.x = Math.PI; part(b, "sph", "#9ff0c8", .13, .11, .13, .4, 1.43, .3);
  } };

// ---------- the venue ----------
SCENES.beach = {
  name: "Free Ice Cream Beach", tag: "One truck. Forty thousand flavors of panic.", place: "THE CITY BEACH", outside: "#e9cf93", bulbH: 1.4, night: false, music: "tropical",
  light: { sky: 0xe4f6ff, ground: 0xe8d29a, hemi: .7, sun: 0xfff4dc, sunI: 1.3 }, crowd: 2000, fenceBudget: 65, maxGates: 5, guards: 4,
  gates: [F, F, F, T, F, F, F], unlock: 28,
  intro: "MegaMelt is giving away free ice cream from a nine-meter cone at the top of the city beach. It is 41°C, there is no shade, and the sea has opinions.",
  acts: ["Free scoops!", "Brain freeze!", "Sprinkles for everyone!", "Melt-Melt-MegaMelt!", "One per person! (lol)"],
  events: ["shark", "sunscreen", "gulls", "whale", "lifeguard", "jetski", "jingle", "shark"],
  goal: o => o.kind === "beach_rail", goalMaxY: 13.5,
  heights: { beach_stage: 1.2, beach_rail: 1.1, beach_cabin: 2.4, beach_snack: 2.6, beach_tower: .5, beach_parasol: .5 },
  sfx: { "DUN DUN!": "horn", "SHARK!": "scream", "IT'S JUST GARY!": "cheer", "SPLORT!": "splash", "WHEEEE!": "scream", "MINE! MINE!": "quack",
    "SQUEAK!": "honk", "I'M COMING!": "trumpet", "VROOOOM!": "horn", "SORRY!": "whistle", "FREE SPRINKLES!": "jingle", "MY PARASOL!": "fiu", "BRAIN FREEZE!": "scream" },
  lines: {
    shark: "A shark fin patrolled the shoreline for ten minutes; it was Gary from accounting, who \"just wanted some personal space\".",
    sunscreen: "A man sat on a five-litre bottle of SPF 100 and turned forty meters of sand into a waterslide.",
    gulls: "A squadron of seagulls stole 312 ice creams in under a minute, a new municipal record.",
    whale: "A six-meter inflatable whale escaped from a birthday party and bounced across the beach like it owned the place.",
    lifeguard: "The lifeguard ran in slow motion for the entire afternoon; nobody was drowning, but everybody felt safer.",
    jetski: "A jet ski drove out of the sea, up the beach and through the snack bar queue, then asked for directions back to the sea.",
    jingle: "A second ice cream truck started playing its jingle at the wrong end of the beach; half the crowd turned around at once.",
  },
  quotes: ["“There is enough ice cream for everybody,” said the MegaMelt spokesperson, standing next to one freezer.",
    "“I came for a free cone and I'm leaving with a tan, a seagull bite and a philosophy,” said a man in a towel.",
    "“I was not a shark. I was a mood,” said Gary from accounting."],
  build() {
    // the sea: stepped bands that follow the shoreline
    for (let y = 0; y < 56; y += 4) rect(0, y, BEACH_SHORE(y), y + 4, "beach_sea");
    // the cone stage and its crowd rail
    rect(15, .5, 33, 8.5, "beach_stage");
    seg(BEACH_SHORE(11) - .3, 11, WW, 11, .4, "beach_rail");
    // lifeguard tower and parasols (little islands everyone bumps into)
    rect(BEACH_TOWER.x - 1.75, BEACH_TOWER.y - 1.75, BEACH_TOWER.x + 1.75, BEACH_TOWER.y + 1.75, "beach_tower");
    for (const [x, y] of BEACH_PARASOLS) circ(x, y, .55, "beach_parasol");
    // changing cabins and the snack bar: a wall with three gaps across the beach
    rect(9.5, 44.5, 16, 48, "beach_cabin"); rect(22, 44.5, 29, 48, "beach_snack"); rect(33, 44.5, WW, 48, "beach_cabin");
  },
  ground(g) {
    // sand
    g.fillStyle = "#f3dca6"; g.fillRect(0, 0, WW, WH);
    const rand = rng(53);
    for (let k = 0; k < 3200; k++) { g.fillStyle = k % 3 ? "rgba(190,150,90,.22)" : "rgba(255,250,230,.45)"; g.fillRect(rand() * WW, rand() * FENCE_Y, .09, .09); }
    g.strokeStyle = "rgba(200,160,100,.18)"; g.lineWidth = .1;
    for (let y = 14; y < 56; y += 2.2) { g.beginPath(); for (let x = 10; x <= WW; x += 1) g.lineTo(x, y + Math.sin(x * .5 + y) * .3); g.stroke(); }
    // wet sand and the sea
    g.fillStyle = "#d9bb80"; g.beginPath(); g.moveTo(0, 0);
    for (let y = 0; y <= 56; y += .5) g.lineTo(BEACH_WATER(y) + 1.1 + Math.sin(y * .7) * .25, y);
    g.lineTo(0, 57.2); g.fill();
    const sea = g.createLinearGradient(0, 0, 10, 0); sea.addColorStop(0, "#1769b0"); sea.addColorStop(.55, "#2aa5d6"); sea.addColorStop(1, "#6fe0e6");
    g.fillStyle = sea; g.beginPath(); g.moveTo(0, 0);
    for (let y = 0; y <= 56; y += .5) g.lineTo(BEACH_WATER(y), y);
    g.lineTo(0, 56); g.fill();
    // foam along the edge and whitecaps out at sea
    g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = .22; g.beginPath();
    for (let y = 0; y <= 56; y += .5) g.lineTo(BEACH_WATER(y), y); g.stroke();
    g.strokeStyle = "rgba(255,255,255,.45)"; g.lineWidth = .12;
    for (const off of [.9, 2.1]) { g.beginPath(); for (let y = 0; y <= 56; y += .5) g.lineTo(BEACH_WATER(y) - off + Math.sin(y * .9 + off) * .2, y); g.stroke(); }
    g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = .1;
    for (let k = 0; k < 70; k++) { const y = rand() * 55, x = rand() * (BEACH_WATER(y) - 3); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + .4, y - .25, x + .8, y); g.stroke(); }
    // rocks of the breakwater at the bottom of the sea
    for (let x = .3; x < BEACH_WATER(56) - .3; x += .7) { g.fillStyle = (x * 10 | 0) % 2 ? "#8a8a86" : "#a3a29c"; g.beginPath(); g.arc(x, 55.6 + Math.sin(x * 3) * .2, .45, 0, 7); g.fill(); }
    // towels, buckets and abandoned sandcastles
    const towel = (x, y, a, c1, c2) => { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = c1; g.fillRect(-.7, -1.1, 1.4, 2.2); g.fillStyle = c2; for (let s = -1.1; s < 1.1; s += .44) g.fillRect(-.7, s, 1.4, .2); g.restore(); };
    for (let k = 0; k < 26; k++) { const y = 14 + rand() * 42, x = BEACH_SHORE(y) + 1.6 + rand() * (WW - BEACH_SHORE(y) - 3); towel(x, y, rand() * 3, SHIRTS[k % SHIRTS.length], "rgba(255,255,255,.75)"); }
    for (const [x, y] of [[17, 25], [33, 41], [25.5, 34]]) {
      g.fillStyle = "#d9b571"; g.beginPath(); g.arc(x, y, 1.1, 0, 7); g.fill(); g.fillStyle = "#c9a35e"; g.fillRect(x - .45, y - .45, .9, .9);
      g.fillStyle = "#e6c88a"; for (const [dx, dy] of [[-.7, -.7], [.7, -.7], [-.7, .7], [.7, .7]]) { g.beginPath(); g.arc(x + dx, y + dy, .3, 0, 7); g.fill(); }
      g.fillStyle = "#ff5a5f"; g.fillRect(x + .9, y - .2, .4, .45);
    }
    // footprints heading for the ice cream
    g.fillStyle = "rgba(150,110,60,.3)";
    for (let i = 0; i < 18; i++) { const x = 20 + Math.sin(i * .6) * 1.5 + (i % 2) * .4, y = 55 - i * 2.2; g.beginPath(); g.ellipse(x, y, .12, .22, 0, 0, 7); g.fill(); }
    // painted messages in the sand
    g.textAlign = "center"; g.textBaseline = "middle";
    g.save(); g.translate(24, 15.5); g.font = "900 1.6px Rubik, sans-serif"; g.fillStyle = "rgba(255,90,140,.55)"; g.fillText("↑ FREE ICE CREAM ↑", 0, 0); g.restore();
    g.font = "900 .7px Rubik, sans-serif"; g.fillStyle = "rgba(120,80,40,.6)"; g.fillText("ONE PER PERSON · PER LIFETIME", 24, 16.8);
    g.save(); g.translate(26, 34.5); g.rotate(-.06); g.font = "italic 900 2.6px Rubik, sans-serif"; g.fillStyle = "rgba(255,255,255,.55)"; g.fillText("MegaMelt", 0, 0);
    g.font = "900 .6px Rubik, sans-serif"; g.fillStyle = "rgba(120,80,40,.55)"; g.fillText("NOW 30% LESS MELTY", 0, 1.8); g.restore();
    g.save(); g.translate(BEACH_SHORE(30) + 1.4, 30); g.rotate(-Math.PI / 2 + .06); g.font = "900 .6px Rubik, sans-serif"; g.fillStyle = "rgba(255,255,255,.75)"; g.fillText("NO SWIMMING AFTER EATING ICE CREAM (OR BEFORE)", 0, 0); g.restore();
    // the boardwalk
    g.fillStyle = "#c79a5e"; g.fillRect(0, 57.5, WW, FENCE_Y - 57.5);
    for (let y = 57.5; y < FENCE_Y; y += .45) { g.fillStyle = (y * 4.4 | 0) % 2 ? "rgba(90,60,30,.18)" : "rgba(255,230,190,.1)"; g.fillRect(0, y, WW, .4); }
    g.fillStyle = "rgba(70,45,20,.4)"; for (let y = 57.5; y < FENCE_Y; y += .45) for (let x = (y * 7 % 3); x < WW; x += 3.2) g.fillRect(x, y, .06, .4);
    g.fillStyle = "#a57a45"; g.fillRect(0, 57.2, WW, .35);
    g.font = "900 .8px Rubik, sans-serif"; g.fillStyle = "rgba(255,255,255,.85)"; g.fillText("BOARDWALK · NO RUNNING · NO SHARKS", 20, 63.2);
    // the street outside
    g.fillStyle = "#5d5f62"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
    g.fillStyle = "#ffffff"; for (let x = 1; x < WW; x += 2.4) g.fillRect(x, 69.4, 1.2, .16);
    g.fillStyle = "#ff8fc6"; g.font = "900 .7px Rubik, sans-serif"; g.fillText("ICE CREAM TRUCK PARKING ONLY", 31, 71);
  },
  decor(g) {
    g.textAlign = "center"; g.textBaseline = "middle";
    // the stage: pink and white stripes, a big logo
    for (let x = 15, i = 0; x < 33; x += 1, i++) { g.fillStyle = i % 2 ? "#ffd9ec" : "#ff8fc6"; g.fillRect(x, .5, 1, 8); }
    g.fillStyle = "#ffffff"; g.fillRect(15, 7.2, 18, 1.3);
    g.font = "italic 900 1px Rubik, sans-serif"; g.fillStyle = "#e0347a"; g.fillText("MEGAMELT FREE SCOOP DAY", 24, 7.85);
    // crowd rail: red and white
    for (const o of obs) if (o.kind === "beach_rail") { g.lineCap = "butt"; g.lineWidth = o.th; g.strokeStyle = "#f4f4f2"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); g.strokeStyle = "#d8322b"; g.setLineDash([.6, .6]); g.stroke(); g.setLineDash([]); }
    // lifeguard tower deck
    const tw = obs.find(o => o.kind === "beach_tower");
    g.fillStyle = "#e9e3d4"; g.fillRect(tw.x0, tw.y0, tw.x1 - tw.x0, tw.y1 - tw.y0); g.fillStyle = "#d8322b"; g.fillRect(tw.x0, tw.y0 + 1.3, tw.x1 - tw.x0, .9);
    g.font = "900 .5px Rubik, sans-serif"; g.fillStyle = "#ffffff"; g.fillText("LIFEGUARD", BEACH_TOWER.x, BEACH_TOWER.y);
    // parasol bases: little cool boxes
    for (const o of obs) if (o.kind === "beach_parasol") { g.fillStyle = "#2f9fe0"; g.beginPath(); g.arc(o.x, o.y, o.r, 0, 7); g.fill(); g.fillStyle = "#ffffff"; g.fillRect(o.x - .35, o.y - .1, .7, .2); }
    // changing cabins and the snack bar
    for (const o of obs) if (o.kind === "beach_cabin") {
      for (let x = o.x0, i = 0; x < o.x1; x += .6, i++) { g.fillStyle = i % 2 ? "#ffffff" : "#2f9fe0"; g.fillRect(x, o.y0, .6, o.y1 - o.y0); }
      g.fillStyle = "rgba(255,255,255,.9)"; g.fillRect(o.x0 + .4, o.y0 + 1.2, o.x1 - o.x0 - .8, 1.1);
      g.font = "900 .5px Rubik, sans-serif"; g.fillStyle = "#1769b0"; g.fillText("CHANGING ROOMS", (o.x0 + o.x1) / 2, o.y0 + 1.75);
    }
    for (const o of obs) if (o.kind === "beach_snack") {
      for (let x = o.x0, i = 0; x < o.x1; x += .7, i++) { g.fillStyle = i % 2 ? "#ffd23a" : "#ff9a1f"; g.fillRect(x, o.y0, .7, o.y1 - o.y0); }
      g.fillStyle = "#2b2f35"; g.fillRect(o.x0 + .3, o.y0 + .9, o.x1 - o.x0 - .6, 1.6);
      g.font = "900 .55px Rubik, sans-serif"; g.fillStyle = "#ffd23a"; g.fillText("SNACK BAR", (o.x0 + o.x1) / 2, o.y0 + 1.45);
      g.font = "700 .38px Rubik, sans-serif"; g.fillStyle = "#ffffff"; g.fillText("(WE DON'T HAVE ICE CREAM)", (o.x0 + o.x1) / 2, o.y0 + 2.05);
    }
    // a welcome banner over the gates
    g.fillStyle = "#ff8fc6"; g.fillRect(4, FENCE_Y - 2.4, WW - 8, 1.1);
    g.fillStyle = "#ffffff"; g.font = "900 .72px Rubik, sans-serif"; g.fillText("WELCOME TO FREE SCOOP DAY · SUNSCREEN NOT INCLUDED · SEAGULLS NOT AFFILIATED", 20, FENCE_Y - 1.85);
  },
  bulbs: Array.from({ length: 16 }, (_, i) => [11.5 + i * 1.85, 11]),
  beams: [{ x: 24, y: 9, a: -Math.PI / 2, sweep: .5, h: 6, white: true }, { x: 16, y: 9, a: -1.2, sweep: .35, h: 5, white: true }, { x: 32, y: 9, a: -1.9, sweep: .35, h: 5, white: true }],
  extra3D(grp) {
    // parasol canopies over every base
    for (const [x, y, col] of BEACH_PARASOLS) SCENE_MODELS.beach_parasol(pivot(grp, x, 0, y), {}, { col, x });
    // lifeguard tower: four legs, a deck, a hut with a red roof and a flag
    const wood = mat("#e9e3d4"), red = mat("#d8322b");
    for (const [dx, dz] of [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]]) part(grp, "box", wood, .2, 2.4, .2, BEACH_TOWER.x + dx, 1.2, BEACH_TOWER.y + dz);
    part(grp, "box", wood, 3.6, .2, 3.6, BEACH_TOWER.x, 2.4, BEACH_TOWER.y);
    part(grp, "box", "#ffffff", 2.4, 1.6, 2.2, BEACH_TOWER.x + .4, 3.3, BEACH_TOWER.y);
    part(grp, "box", red, 2.8, .25, 2.6, BEACH_TOWER.x + .4, 4.25, BEACH_TOWER.y);
    part(grp, "box", red, .2, 1.4, 1.2, BEACH_TOWER.x - 1.6, 1.1, BEACH_TOWER.y - .6).rotation.z = .5;   // ladder
    part(grp, "cyl", "#8a8a86", .04, 2.2, .04, BEACH_TOWER.x + 1.5, 5.2, BEACH_TOWER.y - 1);
    part(grp, "box", "#ffd23a", .8, .5, .04, BEACH_TOWER.x + 1.1, 6, BEACH_TOWER.y - 1);
    // stage back wall with a giant "FREE" sign and speaker stacks
    part(grp, "box", "#ffffff", 18, 3.2, .3, 24, 2.8, .7);
    part(grp, "box", basic("#ff4f9a"), 9, 1.6, .12, 24, 3.4, .9);
    part(grp, "box", basic("#ffffff"), 7.6, .9, .14, 24, 3.4, .92);
    for (const x of [16.5, 31.5]) { part(grp, "box", "#1c1c1e", 1.6, 3.2, 1.4, x, 2.8, 2); part(grp, "cyl", "#3a3a3c", .5, .1, .5, x, 3.6, 2.75).rotation.x = Math.PI / 2; part(grp, "cyl", "#3a3a3c", .35, .1, .35, x, 2.3, 2.75).rotation.x = Math.PI / 2; }
    // freezers on the stage, glowing a little
    for (const x of [19, 29]) { part(grp, "box", "#f4f4f2", 2.2, 1, 1.1, x, 1.7, 6.8); part(grp, "box", basic("#bff3ff"), 2, .05, .9, x, 2.22, 6.8); }
    // buoys and a pedal boat swan out at sea
    for (let y = 6; y < 54; y += 6) { part(grp, "sph", (y / 6) % 2 ? "#ff5a1f" : "#f4f4f2", .3, .3, .3, 2.2 + Math.sin(y) * .4, .2, y); }
    part(grp, "box", "#f4f4f2", 1.8, .5, 1.2, 4, .25, 38); part(grp, "cyl", "#f4f4f2", .14, 1.2, .14, 4.9, .9, 38); part(grp, "sph", "#f4f4f2", .3, .25, .25, 5.05, 1.5, 38);
    part(grp, "cone", "#ffb02e", .08, .25, .08, 5.35, 1.45, 38).rotation.z = -Math.PI / 2;
    // palm trees along the right edge and boardwalk lamps
    const palm = (x, z) => { for (let k = 0; k < 6; k++) part(grp, "cyl", "#9a7448", .2 - k * .015, .8, .2 - k * .015, x + k * .08, .4 + k * .75, z); for (let i = 0; i < 7; i++) { const l = part(grp, "sph", "#3f9a3a", 1.4, .1, .35, x + .5 + Math.cos(i * .9) * 1, 4.6, z + Math.sin(i * .9) * 1); l.rotation.y = -i * .9; l.rotation.z = -.25; } part(grp, "sph", "#6b4a2b", .2, .2, .2, x + .45, 4.4, z); };
    for (const [x, z] of [[39.2, 14], [39.3, 36], [39.2, 54]]) palm(x, z);
    for (const x of [.6, 39.4]) { part(grp, "cyl", "#2b2f35", .07, 3.2, .07, x, 1.6, 59); part(grp, "sph", basic("#fff2c0"), .25, .25, .25, x, 3.3, 59); }
    // the street: the brand's own truck parked outside, empty
    part(grp, "box", "#ffd9ec", 5, 2, 2.2, 32, 1.4, 70.5); part(grp, "box", "#ff8fc6", 5.02, .4, 2.22, 32, 1.1, 70.5);
  },
  ev: {
    shark() {
      const pts = []; for (let y = 4; y <= 56; y += 4) pts.push([BEACH_SHORE(y) - 1.6, y]);
      pts.push([-4, 58]);
      addMover({ kind: "beach_fin", x: BEACH_SHORE(0) - 2, y: -3, pts, speed: 2.8, r: .5, push: 0, scare: 5.6, say: "DUN DUN!", sayEvery: 2.2,
        tick(m) { m.sc = (m.sc || 0) - DT; if (m.sc <= 0 && m.y > 6) { m.sc = 3.5; pop(m.x + 4, m.y - 1, "SHARK!"); }
          if (m.i === pts.length - 1 && !m.gary) { m.gary = true; m.say = ""; m.scare = 0; pop(m.x + 2, m.y - 2, "IT'S JUST GARY!"); } } });
      caption("SHARK! A fin is cruising along the shoreline", true, 2200);
    },
    sunscreen() {
      const [x, y] = BEACH_pt();
      addMover({ kind: "beach_bottle", beh: "static", x, y, life: 6, r: .5, push: 0, scare: 1.6 });
      pop(x, y - 1.2, "SPLORT!"); slipT = 5.5;
      later(.8, () => { if (BEACH_live()) pop(x + 2, y - .5, "WHEEEE!"); });
      for (let k = 0; k < 16; k++) puff(x + rnd(-3, 3), y + rnd(-2, 2), .1, "#fffbe8", .7, 1.6, .4);
      caption("Someone sat on a 5-litre bottle of SPF 100. The beach is now a slip'n'slide", true, 2400);
    },
    gulls(side) {
      for (let n = 0; n < 6; n++) {
        const [px, py] = BEACH_pt(), y0 = rnd(14, 50), col = BEACH_FLAVORS[n % BEACH_FLAVORS.length];
        addMover({ kind: "beach_gull", x: side ? -3 - n * 1.8 : WW + 3 + n * 1.8, y: y0, pts: [[px, py], [side ? WW + 5 : -5, py + rnd(-8, 8)]], speed: 6.5, r: .35, push: 0, scare: 2, air: true, h: 6, col,
          say: n ? "" : "MINE! MINE!", sayEvery: 1.8,
          tick(m) {
            const [tx, ty] = m.pts[m.i] || [m.x, m.y], d = Math.hypot(tx - m.x, ty - m.y);
            m.h = m.i === 0 ? Math.max(1.4, Math.min(6, d * .35)) : Math.min(7, m.h + DT * 3);
            if (m.i === 1 && !m.cone) { m.cone = true; m.scare = 0; if (n < 2) pop(m.x, m.y - 1, "MINE! MINE!");
              if (n % 2) { const [dx, dy] = BEACH_pt(); addMover({ kind: "beach_drop", beh: "fly", x: m.x, y: m.y, sx: m.x, sy: m.y, tx: dx, ty: dy, dur: 1.2, r: .2, push: 0, air: true, small: true, col }); } }
          } });
      }
      caption("Seagulls! They're not here for the music", false, 1900);
    },
    whale(side) {
      addMover({ kind: "beach_whale", beh: "bounce", x: side ? 14 : 32, y: rnd(16, 24), vx: (side ? 1 : -1) * rnd(2, 3.2), vy: rnd(1.5, 2.6), r: 1.8, push: 12, scare: 2.2, life: 14, say: "SQUEAK!", sayEvery: 2.4 });
      caption("A six-meter inflatable whale is bouncing across the beach", false, 2100);
    },
    lifeguard() {
      const sea = [BEACH_SHORE(32) + .6, 32], p1 = BEACH_pt(), p2 = BEACH_pt();
      addMover({ kind: "beach_lifeguard", x: BEACH_TOWER.x - 2.3, y: BEACH_TOWER.y + 1.5, pts: [p1, sea, p2, [BEACH_TOWER.x - 2.3, BEACH_TOWER.y + 2]], speed: .85, r: .45, push: 10, calm: 4.5, say: "I'M COMING!", sayEvery: 3.6,
        tick(m) { if (Math.random() < .03) puff(m.x - Math.cos(m.ang) * .5, m.y - Math.sin(m.ang) * .5, .1, "#ead29a", .4, 1.2, .3); } });
      cheerT = Math.max(cheerT, 2);
      caption("The lifeguard is running in slow motion. Nobody is drowning. Everyone feels calmer", false, 2400);
    },
    jetski() {
      const yIn = rnd(26, 40), land = [BEACH_SHORE(yIn) + 1, yIn], p1 = BEACH_pt(), p2 = BEACH_pt();
      addMover({ kind: "beach_jetski", x: -3, y: yIn - 14, pts: [[3, yIn - 8], [BEACH_SHORE(yIn) - 2, yIn - 2], land, p1, p2, [WW + 5, rnd(20, 40)]], speed: 6, r: 1, push: 32, scare: 2.8, say: "VROOOOM!", sayEvery: 2,
        tick(m) {
          const sand = m.x > BEACH_SHORE(m.y) + .2;
          if (sand && !m.onSand) {
            m.onSand = true; m.speed = 3.4; shake = Math.min(1, shake + .35); pop(m.x, m.y - 1.6, "SORRY!");
            for (let k = 0; k < 2; k++) { const [tx, ty] = BEACH_pt(); addMover({ kind: "beach_parasol", flying: true, beh: "fly", x: m.x, y: m.y, sx: m.x, sy: m.y, tx, ty, dur: 1.4, r: .3, push: 0, air: true, small: true, col: BEACH_PARASOLS[k * 5][2], say: k ? "" : "MY PARASOL!", sayEvery: 9 }); }
          }
          if (m.onSand && Math.random() < .25) puff(m.x - Math.cos(m.ang) * 1.2, m.y - Math.sin(m.ang) * 1.2, .2, "#e7c88f", .6, 1, .6);
        } });
      caption("A jet ski just drove out of the sea and onto the beach", true, 2100);
    },
    jingle(side) {
      const px = side ? 14 : 30, y = 53;
      addMover({ kind: "beach_truck", x: side ? -5 : WW + 5, y, pts: [[px, y], [side ? -6 : WW + 6, y]], speed: 2.6, r: 1.3, push: 28, scare: 2, say: "FREE SPRINKLES!", sayEvery: 2.6,
        tick(m) {
          if (m.i === 1 && !m.parked) { m.parked = true; m.park = 6; m.scare = 0; m.push = 14; tempAttract(m.x, m.y - 2.5, 3.2, 6, .45); }
          if (m.parked && m.park > 0) { m.park -= DT; m.speed = m.park > 0 ? 0 : 2.6; if (m.park <= 0) { m.scare = 2; m.push = 28; } }
        } });
      caption("A SECOND ice cream truck is playing its jingle at the wrong end of the beach!", true, 2300);
    },
  },
  performers: () => [
    { kind: "beach_cone", orbit: [24, 4.4, .001, 0, 0], h: 1.2, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "beach_mascot", col: "#ff8fc6", orbit: [24, 4.6, 3.6, .45, 0], h: 1.2, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "beach_mascot", col: "#9ff0c8", orbit: [24, 4.6, 3.6, .45, Math.PI], h: 1.2, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "beach_server", orbit: [19, 7.6, .8, .6, 0], h: 1.2, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "beach_server", orbit: [29, 7.6, .8, -.6, 1], h: 1.2, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "beach_lifeguard", orbit: [BEACH_TOWER.x - .9, BEACH_TOWER.y, .001, 0, Math.PI / 2], h: 2.5, x: 0, y: 0, ang: 0, t: 0 },
    ...[8, 22, 36, 49].map((y, i) => ({ kind: "beach_wave", len: 12, ph: i * 1.7, orbit: [BEACH_WATER(y) - .2, y, .001, 0, -Math.PI / 2], h: 0, x: 0, y: 0, ang: 0, t: 0 })),
  ],
};
