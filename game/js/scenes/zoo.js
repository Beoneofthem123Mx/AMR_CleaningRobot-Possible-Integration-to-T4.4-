// Human Tsunami · scene: Free Zoo Day (the baby panda's debut; the enclosures are more of a suggestion)
const ZPANDA = { x0: 11, x1: 29, y: 15 }, ZPOND = { x: 34, y: 43, r: 3.6 }, ZOO_FX = { yawn: 0, sneeze: 0 };
const zooNow = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

// ---------- the animals (all face +x) ----------
SCENE_MODELS.zoo_panda = (g, u, m) => {
  const s = m.big ? 2.6 : 1.5, b = pivot(g, 0, 0, 0); b.scale.setScalar(s);
  part(b, "sph", "#f7f5ef", .42, .4, .4, 0, .42, 0);                       // round white body
  for (const z of [-1, 1]) { part(b, "sph", "#1c1c1e", .16, .2, .14, .22, .2, z * .22); part(b, "sph", "#1c1c1e", .15, .15, .15, -.22, .18, z * .24); }
  part(b, "box", "#1c1c1e", .3, .14, .82, .05, .62, 0);                    // the black "shoulder band"
  const h = pivot(b, .3, .85, 0); u.head = h;
  part(h, "sph", "#ffffff", .34, .3, .34, 0, 0, 0);
  for (const z of [-1, 1]) { part(h, "sph", "#1c1c1e", .13, .13, .09, -.04, .27, z * .22); part(h, "sph", "#1c1c1e", .09, .12, .1, .26, .06, z * .13); part(h, "sph", "#ffffff", .03, .03, .03, .34, .08, z * .12); }
  part(h, "sph", "#1c1c1e", .06, .05, .07, .34, -.06, 0);
  part(h, "sph", "#ff9cbc", .05, .03, .05, .3, -.16, 0);
  if (!m.big) { const st = part(b, "cyl", "#6fbf3a", .04, .9, .04, .45, .55, .25); st.rotation.x = .5; part(b, "sph", "#8fdc5a", .12, .06, .2, .5, .95, .45); }
  u.anim = (tt) => {
    const sn = zooNow() < ZOO_FX.sneeze;
    b.rotation.z = Math.sin(tt * 1.6 + m.x) * .12;
    h.rotation.z = sn ? -.5 + Math.sin(tt * 30) * .2 : Math.sin(tt * 2.3) * .15;
    h.scale.setScalar(sn ? 1.18 : 1);
  };
};
SCENE_MODELS.zoo_penguin = (g, u, m) => {
  const b = pivot(g, 0, 0, 0), s = m.chick ? .6 : 1; b.scale.setScalar(s);
  part(b, "sph", "#17191d", .3, .48, .28, 0, .5, 0);
  part(b, "sph", "#f7f7f2", .2, .38, .22, .12, .46, 0);                    // white tummy
  part(b, "sph", "#17191d", .22, .22, .22, .02, 1.02, 0);
  for (const z of [-1, 1]) { part(b, "sph", "#ffffff", .06, .06, .05, .17, 1.07, z * .09); part(b, "sph", "#111", .03, .03, .03, .22, 1.07, z * .09); }
  const bk = part(b, "cone", "#ff9a1f", .06, .2, .06, .28, 1.0, 0); bk.rotation.z = -Math.PI / 2;
  for (const z of [-1, 1]) part(b, "box", "#ff9a1f", .22, .05, .12, .08, .03, z * .1);
  part(b, "box", m.col || "#d8322b", .05, .12, .4, .05, .82, 0);           // a little bow tie, it is a parade after all
  u.wings = [-1, 1].map(z => { const p = pivot(b, 0, .78, z * .27); part(p, "sph", "#17191d", .07, .32, .14, 0, -.25, 0); return p; });
  u.anim = (tt) => { b.rotation.x = Math.sin(tt * 9 + m.x * 3) * .2; };
};
SCENE_MODELS.zoo_giraffe = (g, u, m) => {
  const fur = "#f0b84a", spot = "#9a5a22";
  part(g, "sph", fur, 1.05, .6, .55, 0, 2.15, 0);
  for (const [x, z, y] of [[.4, .3, 2.5], [-.3, -.3, 2.55], [-.5, .25, 2.4], [.1, -.4, 2.3], [.55, -.15, 2.6], [-.1, .45, 2.2], [0, 0, 2.72]]) part(g, "sph", spot, .2, .08, .18, x, y, z);
  for (const [x, z] of [[.6, .3], [.6, -.3], [-.6, .3], [-.6, -.3]]) u.legs.push(leg(g, x, 1.95, z, .08, 1.95, fur));
  const n = pivot(g, .75, 2.4, 0); n.rotation.z = -.55; u.neck = n;
  part(n, "cyl", fur, .17, 2.3, .17, 0, 1.15, 0);
  for (let y = .3; y < 2.2; y += .45) part(n, "sph", spot, .1, .14, .19, 0, y, (y * 7 % 2 > 1 ? 1 : -1) * .03);
  part(n, "box", "#7a4220", .1, 2.1, .08, -.15, 1.1, 0);                    // mane
  const h = pivot(n, 0, 2.3, 0); h.rotation.z = 1.1;
  part(h, "sph", fur, .34, .2, .22, .15, 0, 0); part(h, "sph", "#e8c27a", .16, .14, .16, .44, -.04, 0);
  for (const z of [-1, 1]) { part(h, "cyl", "#7a4220", .04, .26, .04, -.05, .2, z * .1); part(h, "sph", "#3b2a20", .06, .06, .06, -.05, .34, z * .1); part(h, "sph", "#111", .05, .05, .05, .2, .08, z * .17); part(h, "sph", fur, .12, .05, .07, -.08, .05, z * .22); }
  if (m.hatTrophy) { part(h, "cyl", "#d8322b", .15, .09, .15, .3, -.2, 0); }  // a stolen cap in its mouth
  u.tail = pivot(g, -1, 2.3, 0); part(u.tail, "cyl", fur, .03, .9, .03, 0, -.45, 0); part(u.tail, "sph", "#3b2a20", .07, .12, .07, 0, -.9, 0);
  u.anim = (tt) => { n.rotation.z = -.55 + Math.sin(tt * .9 + m.x) * .18; n.rotation.x = Math.sin(tt * .6) * .2; };
};
SCENE_MODELS.zoo_gorilla = (g, u, m) => {
  const fur = "#3a3638", skin = "#6b5e5a", b = pivot(g, 0, 0, 0); b.scale.setScalar(1.45);
  part(b, "sph", fur, .55, .62, .62, -.05, .95, 0);                          // big hunched back
  part(b, "sph", "#57514f", .3, .38, .42, .26, .95, 0);                      // chest
  part(b, "sph", "#8f8a86", .4, .16, .42, -.25, 1.42, 0);                    // silver back stripe
  const h = pivot(b, .38, 1.48, 0); u.head = h;
  part(h, "sph", fur, .26, .27, .26, 0, 0, 0); part(h, "sph", "#2b2729", .2, .12, .2, -.03, .2, 0);
  part(h, "sph", skin, .2, .17, .22, .14, -.06, 0);
  for (const z of [-1, 1]) { part(h, "sph", "#ffffff", .05, .05, .04, .23, .06, z * .09); part(h, "sph", "#111", .025, .025, .025, .27, .06, z * .09); part(h, "sph", "#111", .04, .03, .03, .3, -.08, z * .04); }
  for (const z of [-1, 1]) u.legs.push(leg(b, -.2, .5, z * .28, .14, .5, fur));
  u.arms = [-1, 1].map(z => { const p = pivot(b, .3, 1.3, z * .55); part(p, "cyl", fur, .14, .95, .14, 0, -.48, 0); part(p, "sph", skin, .13, .1, .13, 0, -.98, 0); return p; });
  const ph = u.phone = pivot(u.arms[1], .05, -1.02, 0);
  part(ph, "box", "#151617", .06, .32, .18, 0, 0, 0); part(ph, "box", basic("#7fe0ff"), .02, .26, .14, .035, 0, 0);
  ph.visible = false;
  u.anim = (tt, mm) => {
    ph.visible = !!mm.stole;
    if (mm.stole) { u.arms[1].rotation.z = 2.2; u.arms[1].rotation.x = -.3; u.arms[0].rotation.z = Math.sin(tt * 6) * .3; h.rotation.y = Math.sin(tt * 2) * .3; }
    else { const pound = Math.sin(tt * 14) * .6; u.arms[0].rotation.z = 1.2 + pound; u.arms[1].rotation.z = 1.2 - pound; u.arms.forEach(p => p.rotation.x = 0); }
  };
};
SCENE_MODELS.zoo_alpaca = (g, u, m) => {
  const wool = m.col || "#f3e9d4", b = pivot(g, 0, 0, 0); b.scale.setScalar(1.35);
  for (const [x, y, z, r] of [[0, 1.05, 0, .42], [.3, 1.1, .12, .3], [-.3, 1.08, -.1, .32], [.15, 1.22, -.15, .3], [-.25, 1.2, .15, .28]]) part(b, "sph", wool, r * 1.1, r, r, x, y, z);
  for (const [x, z] of [[.3, .18], [.3, -.18], [-.3, .18], [-.3, -.18]]) u.legs.push(leg(b, x, .8, z, .07, .8, wool));
  const n = pivot(b, .45, 1.2, 0); n.rotation.z = -.25;
  part(n, "cyl", wool, .14, .8, .14, 0, .4, 0); part(n, "sph", wool, .2, .2, .2, 0, .82, 0);
  const h = pivot(n, .05, .88, 0);
  part(h, "sph", wool, .22, .2, .2, 0, 0, 0); part(h, "sph", "#d9c7a7", .14, .1, .12, .2, -.06, 0);
  for (const z of [-1, 1]) { part(h, "cone", wool, .05, .22, .05, -.05, .22, z * .1); part(h, "sph", "#111", .045, .045, .045, .14, .05, z * .12); part(h, "sph", ["#ff6fb1", "#5fd8ff"][z > 0 ? 0 : 1], .08, .08, .08, -.04, .3, z * .14); }
  part(h, "sph", "#ff6fb1", .25, .07, .25, -.05, .14, 0);                   // pink fluffy fringe
  part(b, "box", "#d8322b", .5, .05, .62, 0, 1.38, 0); part(b, "box", "#ffd23a", .5, .05, .64, 0, 1.4, 0); // festive blanket
  u.anim = (tt) => { b.position.y = Math.abs(Math.sin(tt * 9)) * .25; n.rotation.z = -.25 + Math.sin(tt * 9) * .1; };
};
SCENE_MODELS.zoo_hippo = (g, u, m) => {
  const c = "#8c7c9c", b = pivot(g, 0, 0, 0);
  part(b, "sph", c, 1.5, .8, 1, 0, .6, 0);
  part(b, "sph", "#a493b4", 1.1, .3, .7, 0, 1.18, 0);
  for (const z of [-1, 1]) { part(b, "sph", c, .16, .16, .14, .9, 1.42, z * .45); part(b, "sph", "#ff9cbc", .08, .08, .06, .92, 1.5, z * .45); part(b, "sph", "#ffffff", .12, .12, .12, 1.1, 1.22, z * .35); part(b, "sph", "#111", .06, .06, .06, 1.2, 1.24, z * .35); }
  const jawU = pivot(b, 1.1, .9, 0), jawL = pivot(b, 1.1, .9, 0);
  part(jawU, "sph", c, .75, .38, .7, .55, .12, 0); for (const z of [-1, 1]) part(jawU, "sph", "#5a4a6a", .06, .05, .06, 1.1, .22, z * .2);
  part(jawL, "sph", c, .7, .3, .66, .5, -.12, 0);
  const mouth = part(jawL, "sph", "#e85a7a", .55, .12, .5, .5, .02, 0);
  for (const z of [-1, 1]) part(jawL, "cone", "#fffbe8", .07, .26, .07, .95, .15, z * .32);
  u.anim = (tt) => {
    const y = zooNow() < ZOO_FX.yawn, open = y ? .9 + Math.sin(tt * 3) * .1 : Math.max(0, Math.sin(tt * .7)) * .15;
    jawU.rotation.z = open * .8; jawL.rotation.z = -open * .3; mouth.visible = open > .1;
    b.position.y = Math.sin(tt * 1.2) * .08;
  };
};
SCENE_MODELS.zoo_flamingo = (g, u, m) => {
  const p = "#ff7fae";
  part(g, "sph", p, .4, .26, .24, 0, 1.25, 0);
  part(g, "sph", "#ff5a95", .26, .14, .28, -.25, 1.3, 0);
  u.legs.push(leg(g, 0, 1.05, .05, .025, 1.05, "#e8507f"));
  const k = pivot(g, 0, 1.05, -.05); part(k, "cyl", "#e8507f", .025, .5, .025, 0, -.25, 0); k.rotation.z = 1.5;
  const n = pivot(g, .3, 1.35, 0); part(n, "cyl", p, .05, .7, .05, 0, .35, 0); n.rotation.z = -.3;
  const h = pivot(n, 0, .7, 0); part(h, "sph", p, .11, .1, .1, 0, 0, 0);
  const bk = part(h, "cone", "#1c1c1c", .05, .22, .05, .16, -.06, 0); bk.rotation.z = -2;
  u.anim = (tt) => { n.rotation.z = -.3 + Math.sin(tt * 1.4 + m.x) * .3; };
};
SCENE_MODELS.zoo_truck = (g, u, m) => {
  part(g, "box", "#ffd23a", 4.4, 1.9, 2.2, -.5, 1.35, 0);
  for (let x = -2.4; x < 1.6; x += .7) part(g, "box", "#3d9a5b", .3, 1.92, 2.22, x, 1.35, 0);
  part(g, "box", "#2f8f3a", 1.5, 1.7, 2.1, 2.4, 1.15, 0); part(g, "box", mat("#1d2733", { roughness: .2 }), .1, .7, 1.9, 3.15, 1.55, 0);
  for (const x of [-1.9, 2.4]) for (const s of [-1, 1]) { const w = part(g, "cyl", "#151617", .45, .3, .45, x, .45, s * 1.12); w.rotation.x = Math.PI / 2; }
  // giant banana on the roof
  const ban = pivot(g, -.5, 2.7, 0);
  for (let i = 0; i < 7; i++) { const a = (i - 3) * .22, sg = part(ban, "cyl", "#ffe14a", .32 - Math.abs(i - 3) * .03, .62, .32 - Math.abs(i - 3) * .03, Math.sin(a) * 2.6, (1 - Math.cos(a)) * 2.6 * .7, 0); sg.rotation.z = Math.PI / 2 - a; }
  part(ban, "sph", "#5a3b1f", .12, .12, .12, 2.1, .9, 0); part(ban, "sph", "#5a3b1f", .12, .12, .12, -2.1, .9, 0);
  u.banana = ban;
  u.anim = (tt) => { ban.position.y = 2.7 + Math.abs(Math.sin(tt * 4)) * .25; ban.rotation.x = Math.sin(tt * 2) * .15; };
};
SCENE_MODELS.zoo_banana = (g, u) => {
  u.ball = pivot(g, 0, .2, 0);
  for (let i = 0; i < 4; i++) { const a = (i - 1.5) * .35, sg = part(u.ball, "cyl", "#ffe14a", .07, .18, .07, Math.sin(a) * .35, (1 - Math.cos(a)) * .3, 0); sg.rotation.z = Math.PI / 2 - a; }
};
SCENE_MODELS.zoo_splash = (g, u, m) => {
  const w = mat("#7fd6ff", { transparent: true, opacity: .55, roughness: .1 });
  u.drops = Array.from({ length: 14 }, (_, i) => part(g, "sph", i % 3 ? w : "#ffffff", .3, .3, .3, 0, 0, 0));
  u.anim = (tt, mm) => {
    const q = Math.min(1, mm.t / 1.4);
    u.drops.forEach((d, i) => { const a = i / 14 * 6.283; d.position.set(Math.cos(a) * q * 2.4, Math.sin(q * Math.PI) * (2 + i % 3) , Math.sin(a) * q * 2.4); d.scale.setScalar(.35 * (1 - q * .5)); });
  };
};
SCENE_PERSONS.zoo_keeper = { body: "#7a8c3a", legs: "#c9b28a", hat: "none",
  extra(g, u, b) {
    part(b, "cyl", "#d9c79a", .3, .05, .3, 0, 1.78, 0); part(b, "sph", "#d9c79a", .17, .14, .17, 0, 1.8, 0);   // safari hat
    part(b, "box", "#ffd23a", .05, .14, .2, .21, 1.25, .1);                                                     // name tag
    const pole = part(b, "cyl", "#8a5a34", .03, 1.6, .03, .55, 1.6, .25); pole.rotation.z = -.9;
    const ring = part(b, "cyl", mat("#f4f4f2", { transparent: true, opacity: .55 }), .35, .3, .35, 1.25, 2.15, .25); ring.rotation.z = -.4;
  } };

// ---------- the venue ----------
SCENES.zoo = {
  name: "Free Zoo Day", tag: "The zookeeper left the gates open", outside: "#6f9e4a", bulbH: 1.7, music: "tropical", place: "THE CITY ZOO",
  light: { sky: 0xdff3ff, ground: 0x5a7a3a, hemi: .66, sun: 0xfff2d6, sunI: 1.15 }, crowd: 2700, fenceBudget: 65, maxGates: 5, guards: 4,
  gates: [F, T, T, F, F, F, F], unlock: 22,
  intro: "Free entry at the city zoo, and the baby panda is making her first public appearance. Every enclosure has a small leak, and so does the gorilla's.",
  acts: ["Awwww!", "She moved!", "Look at her little paws!", "Panda! Panda! Panda!"],
  events: ["penguins", "giraffe", "gorilla", "alpaca", "bananas", "hippo", "sneeze", "penguins"],
  goal: o => o.kind === "zoo_glass", goalMaxY: 17,
  heights: { zoo_glass: 1.5, zoo_pen: 1.1, zoo_hedge: 1.2, zoo_house: 3.2, zoo_pond: .35, zoo_kiosk: 2.4, zoo_rock: 1.4 },
  sfx: { "WADDLE WADDLE!": "quack", "OOK OOK!": "roar", "MY PHONE!": "scream", "SELFIE!": "flash", "MWEEEH!": "bleat", "COME BACK, KEVIN!": "whistle",
    "FREE BANANAS!": "honk", "SPLOOSH!": "splash", "HROOOOAAAH!": "trumpet", "ACHOO!": "boom", "AWWWWW!": "cheer", "MUNCH MUNCH!": "moo" },
  lines: {
    penguins: "A penguin parade crossed the main path in formal wear; nobody dared overtake them.",
    giraffe: "A giraffe strolled through the crowd and ate four sun hats and one toupee.",
    gorilla: "The gorilla escaped, stole a phone and posted forty selfies; he now has more followers than the zoo.",
    alpaca: "A zookeeper chased a runaway alpaca named Kevin for eleven laps with a butterfly net.",
    bananas: "The banana truck stopped for feeding time and was fed upon by the public instead.",
    hippo: "The hippo yawned; the first three rows are still drying off.",
    sneeze: "The baby panda sneezed once and three thousand people lost all self-control.",
  },
  quotes: ["“She sneezed. I was there. I will tell my grandchildren,” said a man in a bamboo hat.",
    "“The enclosures meet all regulations from 1974,” said the zoo director, holding an empty leash.",
    "“Kevin is an alpaca of great spirit,” said the zookeeper, still holding a net."],
  build() {
    // the panda's glass house: the crowd presses against the front glass
    seg(ZPANDA.x0, 0, ZPANDA.x0, ZPANDA.y, .35, "zoo_glass"); seg(ZPANDA.x1, 0, ZPANDA.x1, ZPANDA.y, .35, "zoo_glass");
    seg(ZPANDA.x0, ZPANDA.y, ZPANDA.x1, ZPANDA.y, .35, "zoo_glass");
    rect(0, 0, 9, 8, "zoo_house"); rect(31, 0, WW, 8, "zoo_house");
    // leaky enclosures down the sides
    rect(0, 18, 7, 31, "zoo_pen"); rect(33, 18, WW, 31, "zoo_pen");
    rect(0, 38, 7, 50, "zoo_pen");
    circ(ZPOND.x, ZPOND.y, ZPOND.r, "zoo_pond");
    // hedges that funnel everyone into the main path
    seg(7.5, 34.5, 13.5, 34.5, .9, "zoo_hedge"); seg(26.5, 34.5, 32.5, 34.5, .9, "zoo_hedge");
    circ(20, 25, 1.3, "zoo_rock");
    rect(9, 52, 12, 55, "zoo_kiosk"); rect(28, 52, 31, 55, "zoo_kiosk");
  },
  ground(g) {
    g.fillStyle = "#79b04f"; g.fillRect(0, 0, WW, WH);
    const rand = rng(31);
    for (let k = 0; k < 2600; k++) { g.fillStyle = k % 3 ? "rgba(40,90,30,.25)" : "rgba(190,230,120,.3)"; g.fillRect(rand() * WW, rand() * FENCE_Y, .08, .22); }
    // sandy paths: main avenue, side loops and the plaza in front of the panda
    g.fillStyle = "#e6cf98";
    g.fillRect(14, 15, 12, FENCE_Y - 15); g.fillRect(7.5, 31.5, 25, 2.4); g.fillRect(7.5, 50.5, 25, 2.4); g.fillRect(7.5, 15, 25, 3);
    g.fillRect(7.5, 15, 3, 51); g.fillRect(29.5, 15, 3, 51);
    g.beginPath(); g.ellipse(20, 20, 9.5, 5, 0, 0, 7); g.fill();
    g.fillStyle = "rgba(160,120,60,.18)"; for (let k = 0; k < 900; k++) g.fillRect(7.5 + rand() * 25, 15 + rand() * 51, .1, .1);
    // paw prints wandering off the path (someone is out)
    g.fillStyle = "rgba(70,50,30,.45)";
    for (let i = 0; i < 14; i++) { const x = 6 + i * 1.1, y = 46 - i * .9 + (i % 2) * .5; g.beginPath(); g.arc(x, y, .22, 0, 7); g.fill(); for (let t = 0; t < 3; t++) { g.beginPath(); g.arc(x - .2 + t * .2, y - .3, .08, 0, 7); g.fill(); } }
    // painted signage on the paths
    g.textAlign = "center"; g.textBaseline = "middle";
    g.font = "900 1.6px Rubik, sans-serif"; g.fillStyle = "rgba(255,255,255,.85)"; g.fillText("BABY PANDA ↑", 20, 40);
    g.font = "900 .7px Rubik, sans-serif"; g.fillStyle = "rgba(120,80,30,.85)";
    g.fillText("← PENGUINS", 11, 32.7); g.fillText("GIRAFFES →", 29, 32.7); g.fillText("← GORILLA (HAS YOUR PHONE)", 13.5, 51.7); g.fillText("HIPPO (WET) →", 27, 51.7);
    g.save(); g.translate(20, 60); g.font = "900 2.2px Rubik, sans-serif"; g.fillStyle = "#ffffff"; g.fillText("FREE ZOO DAY", 0, 0);
    g.font = "900 .7px Rubik, sans-serif"; g.fillStyle = "#3d6a2a"; g.fillText("PLEASE DO NOT FEED THE VISITORS", 0, 1.6); g.restore();
    // the street outside: asphalt with a zebra crossing (on theme)
    g.fillStyle = "#5d5f62"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
    g.fillStyle = "#f4f4f2"; for (let x = 16; x < 24; x += 1) g.fillRect(x, 68.5, .55, 2.6);
    g.fillStyle = "#e9b923"; for (let x = 1; x < WW; x += 3.5) g.fillRect(x, 71.4, 2, .2);
  },
  decor(g) {
    g.textAlign = "center"; g.textBaseline = "middle";
    // panda habitat: grass, rocks, a pool and a tyre swing (seen from above)
    g.fillStyle = "#5f9a3c"; g.fillRect(ZPANDA.x0, 0, ZPANDA.x1 - ZPANDA.x0, ZPANDA.y);
    g.fillStyle = "#8ccfe6"; g.beginPath(); g.ellipse(25.5, 4, 2, 1.4, 0, 0, 7); g.fill();
    g.fillStyle = "#9c968c"; for (const [x, y, r] of [[13.5, 3, 1.1], [15, 11, .8], [26.5, 10, 1]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    g.fillStyle = "#c9b28a"; g.beginPath(); g.ellipse(20, 9, 3, 2, 0, 0, 7); g.fill();
    g.font = "900 .8px Rubik, sans-serif"; g.fillStyle = "#ffffff"; g.fillText("MEI-MEI · 1ST APPEARANCE", 20, 13.6);
    for (const o of obs) if (o.kind === "zoo_glass") { g.lineCap = "round"; g.lineWidth = o.th; g.strokeStyle = "#bfeaff"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); g.lineWidth = .08; g.strokeStyle = "#ffffff"; g.stroke(); }
    // gift shop and café
    const house = (o, roof, label) => {
      g.fillStyle = roof; g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0);
      for (let x = o.x0, i = 0; x < o.x1; x += .9, i++) { g.fillStyle = i % 2 ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.08)"; g.fillRect(x, o.y0, .9, o.y1 - o.y0); }
      g.font = "900 1px Rubik, sans-serif"; g.fillStyle = "#ffffff"; g.fillText(label, (o.x0 + o.x1) / 2, (o.y0 + o.y1) / 2);
    };
    const hs = obs.filter(o => o.kind === "zoo_house"); house(hs[0], "#d8322b", "GIFT SHOP"); house(hs[1], "#2f6fc4", "CAFÉ");
    // the leaky enclosures
    const pens = obs.filter(o => o.kind === "zoo_pen"), pen = (o, floor, label) => {
      g.fillStyle = floor; g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0);
      g.strokeStyle = "#7a4a22"; g.lineWidth = .35; g.strokeRect(o.x0 + .18, o.y0 + .18, o.x1 - o.x0 - .36, o.y1 - o.y0 - .36);
      g.fillStyle = "#ffd23a"; g.font = "900 .62px Rubik, sans-serif"; g.fillText(label, (o.x0 + o.x1) / 2, o.y1 - .8);
    };
    pen(pens[0], "#bfe6f2", "PENGUINS"); pen(pens[1], "#d9b46a", "GIRAFFES"); pen(pens[2], "#6b8a46", "GORILLA");
    g.fillStyle = "#4fb4d8"; g.fillRect(.8, 19, 5.4, 6); g.fillStyle = "rgba(255,255,255,.5)"; for (let i = 0; i < 6; i++) g.fillRect(1.2 + i * .8, 20 + (i % 2), .4, .1);
    g.fillStyle = "#4a3426"; g.beginPath(); g.arc(3.5, 43, 1.6, 0, 7); g.fill(); g.fillStyle = "#3d7a2a"; g.beginPath(); g.arc(3.5, 43, 1.2, 0, 7); g.fill();
    // "leaks": the broken bits of fence
    g.strokeStyle = "#79b04f"; g.lineWidth = .5;
    for (const [x0, y0, x1, y1] of [[7, 26, 7, 28], [33, 21, 33, 23], [7, 44, 7, 46.5]]) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
    // the hippo pond
    g.fillStyle = "#e6cf98"; g.beginPath(); g.arc(ZPOND.x, ZPOND.y, ZPOND.r, 0, 7); g.fill();
    g.fillStyle = "#3e9cc4"; g.beginPath(); g.arc(ZPOND.x, ZPOND.y, ZPOND.r - .4, 0, 7); g.fill();
    g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = .08; for (let r = .8; r < ZPOND.r - .5; r += .8) { g.beginPath(); g.arc(ZPOND.x + .3, ZPOND.y - .2, r, 0, 7); g.stroke(); }
    g.fillStyle = "#4f9a3a"; for (const [x, y] of [[31.5, 41], [36.5, 45.8], [33, 46]]) { g.beginPath(); g.arc(x, y, .35, 0, 7); g.fill(); }
    // hedges with bumps
    for (const o of obs) if (o.kind === "zoo_hedge") {
      g.lineCap = "round"; g.lineWidth = o.th; g.strokeStyle = "#2f6a2a"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke();
      g.fillStyle = "#3f8a34"; for (let x = Math.min(o.ax, o.bx); x <= Math.max(o.ax, o.bx); x += .8) { g.beginPath(); g.arc(x, o.ay + (x * 13 % 2 - 1) * .1, .32, 0, 7); g.fill(); }
    }
    // panda statue rock in the plaza
    g.fillStyle = "#a9a39a"; g.beginPath(); g.arc(20, 25, 1.3, 0, 7); g.fill();
    // kiosks: bananas and souvenir bamboo hats
    const ks = obs.filter(o => o.kind === "zoo_kiosk");
    ks.forEach((o, i) => { for (let x = o.x0, j = 0; x < o.x1; x += .5, j++) { g.fillStyle = j % 2 ? "#ffe14a" : (i ? "#3d9a5b" : "#ff8fc6"); g.fillRect(x, o.y0, .5, o.y1 - o.y0); } });
  },
  bulbs: Array.from({ length: 13 }, (_, i) => [ZPANDA.x0 + .5 + i * 1.42, ZPANDA.y + .45]),
  beams: [{ x: 20, y: 16, a: -Math.PI / 2, sweep: .5, h: 9, white: true }, { x: 8, y: 34, a: -1.1, sweep: .4, h: 7, white: true }, { x: 32, y: 34, a: -2, sweep: .4, h: 7, white: true }],
  extra3D(grp) {
    // bamboo grove inside the panda house
    const stalk = (x, z, h) => { for (let y = 0; y < h; y += .9) { part(grp, "cyl", "#5aa83a", .09, .85, .09, x, y + .45, z); part(grp, "cyl", "#3f7f28", .1, .05, .1, x, y + .9, z); } part(grp, "sph", "#7dcf4a", .5, .25, .5, x + .2, h, z); };
    for (const [x, z, h] of [[12, 1, 5], [12.8, 1.5, 4.2], [13.5, .8, 5.6], [27.5, 1, 4.8], [28.2, 2, 5.4], [26.8, 6.5, 4], [12.3, 7, 4.4], [16.5, 1, 3.6]]) stalk(x, z, h);
    // climbing frame and tyre swing
    for (const x of [18, 22]) part(grp, "cyl", "#8a5a34", .12, 2.6, .12, x, 1.3, 6.5);
    part(grp, "box", "#8a5a34", 4.4, .15, .15, 20, 2.6, 6.5);
    const tyre = part(grp, "cyl", "#151617", .5, .25, .5, 20, 1.1, 6.5); tyre.rotation.x = Math.PI / 2;
    // billboard behind the habitat
    part(grp, "box", "#151617", 10, 3, .3, 20, 4.5, .2);
    part(grp, "box", basic("#ffffff"), 9.4, 2.4, .1, 20, 4.5, .4);
    part(grp, "sph", "#1c1c1e", .5, .5, .1, 17.2, 5, .45); part(grp, "sph", "#1c1c1e", .5, .5, .1, 22.8, 5, .45);
    part(grp, "box", basic("#ff6fb1"), 4, .5, .12, 20, 4, .48);
    // palm trees and leafy trees around the edge
    const palm = (x, z) => { part(grp, "cyl", "#8a6a44", .18, 4, .18, x, 2, z); for (let i = 0; i < 6; i++) { const l = part(grp, "sph", "#3f9a3a", 1.2, .12, .35, x + Math.cos(i) * .9, 4.1, z + Math.sin(i) * .9); l.rotation.y = -i; } };
    for (const [x, z] of [[8.2, 10.5], [31.8, 10.5], [1.5, 33], [38.5, 33], [1, 55], [39, 55], [38.5, 37]]) palm(x, z);
    const tree = (x, z) => { part(grp, "cyl", "#6b4a2b", .15, 1.6, .15, x, .8, z); part(grp, "sph", "#4f9a3a", 1.1, 1, 1.1, x, 2.2, z); };
    for (const [x, z] of [[3.5, 41.5], [5.5, 46.5], [36, 26.5], [2, 59], [38, 59]]) tree(x, z);
    // penguin iceberg and giraffe feeding platform
    part(grp, "cone", "#e8f6ff", 1.4, 1.6, 1.4, 3.5, .8, 28); part(grp, "cone", "#ffffff", .8, 2.2, .8, 4.4, 1.1, 27.6);
    part(grp, "cyl", "#8a5a34", .1, 3.6, .1, 36.5, 1.8, 20.5); part(grp, "box", "#a07040", 1.8, .15, 1.2, 36.5, 3.6, 20.5);
    part(grp, "sph", "#4f9a3a", .7, .5, .7, 36.5, 3.9, 20.5);
    // a big "PANDA ↑" signpost
    part(grp, "cyl", "#8a5a34", .08, 2.6, .08, 13.2, 1.3, 41.5); part(grp, "box", "#ffd23a", .12, .6, 2, 13.2, 2.4, 41.5);
    part(grp, "cyl", "#8a5a34", .08, 2.6, .08, 26.8, 1.3, 41.5); part(grp, "box", "#ff8fc6", .12, .6, 2, 26.8, 2.4, 41.5);
  },
  ev: {
    penguins(side) {
      const y = rnd(38, 58);
      for (let n = 0; n < 7; n++) addMover({ kind: "zoo_penguin", chick: n === 6, col: SHIRTS[n % SHIRTS.length], x: (side ? -1.5 : WW + 1.5) + (side ? -1 : 1) * n * 1.1, y: y + (n % 2) * .4,
        pts: [[20, y + rnd(-3, 3)], [side ? WW + 10 : -10, y + rnd(-4, 4)]], speed: 1.3, r: .35, push: 14, scare: 1.4, say: n ? "" : "WADDLE WADDLE!", sayEvery: 2.5 });
      caption("Penguin parade! Everyone make way", false, 1900);
    },
    giraffe(side) {
      addMover({ kind: "zoo_giraffe", x: 36, y: 24, pts: [[29, 26], crowdPoint(), crowdPoint(), [side ? -8 : WW + 8, rnd(40, 58)]], speed: .95, r: .8, push: 24, scare: 2.4, say: "MUNCH MUNCH!", sayEvery: 3.5 });
      caption("A giraffe is strolling through the crowd. Nobody makes eye contact", false, 2200);
    },
    gorilla() {
      const follow = followTick(9, 2.6, .4);
      addMover({ kind: "zoo_gorilla", x: 3.5, y: 44, pts: [crowdPoint(), crowdPoint(), crowdPoint(), [3.5, 44]], speed: 3, r: .6, push: 26, scare: 3.4, say: "OOK OOK!", sayEvery: 1.8,
        tick(m) {
          if (!m.stole && m.t > 4.5) { m.stole = true; m.scare = 0; m.push = 10; m.speed = 1; m.say = "SELFIE!"; m.nextSay = m.t + 1; pop(m.x, m.y - 1.8, "MY PHONE!"); caption("The gorilla stole a phone and is taking selfies", true, 2000); }
          if (m.stole) follow(m);
        } });
      caption("The gorilla is out!", true, 2000);
    },
    alpaca(side) {
      const sx = side ? -2 : WW + 2, sy = rnd(36, 56), pts = [crowdPoint(), crowdPoint(), crowdPoint(), [side ? WW + 8 : -8, rnd(36, 58)]];
      addMover({ kind: "zoo_alpaca", x: sx, y: sy, pts, speed: 4, r: .5, push: 18, scare: 2, say: "MWEEEH!", sayEvery: 2 });
      addMover({ kind: "zoo_keeper", x: sx + (side ? -3 : 3), y: sy, pts: pts.map(p => p.slice()), speed: 3.5, r: .45, push: 16, calm: 2, say: "COME BACK, KEVIN!", sayEvery: 3 });
      caption("A zookeeper is chasing a runaway alpaca", false, 2000);
    },
    bananas(side) {
      const y = rnd(40, 56), px = rnd(14, 26);
      addMover({ kind: "zoo_truck", x: side ? -5 : WW + 5, y, pts: [[px, y], [side ? WW + 7 : -7, y]], speed: 2.4, r: 1.3, push: 30, scare: 2.4, say: "FREE BANANAS!", sayEvery: 2.5,
        tick(m) {
          if (m.i === 1 && !m.parked) {
            m.parked = true; m.park = 5; m.scare = 0; m.push = 18;
            tempAttract(m.x, m.y, 3.4, 5, .3);
            for (let n = 0; n < 5; n++) { const tx = m.x + rnd(-6, 6), ty = clamp(m.y + rnd(-6, 6), 22, 62);
              addMover({ kind: "zoo_banana", beh: "fly", x: m.x, y: m.y, sx: m.x, sy: m.y, tx, ty, dur: .9 + Math.random() * .6, r: .2, push: 0, air: true, small: true, spin: 8 }); }
          }
          if (m.parked && m.park > 0) { m.park -= DT; m.speed = m.park > 0 ? 0 : 2.4; if (m.park <= 0) { m.scare = 2; m.push = 30; } }
        } });
      caption("Feeding time! The banana truck is here", false, 2000);
    },
    hippo() {
      ZOO_FX.yawn = zooNow() + 3200;
      pop(ZPOND.x, ZPOND.y - 2, "HROOOOAAAH!");
      later(1.1, () => {
        if (phase !== "show" && phase !== "evac") return;
        addMover({ kind: "zoo_splash", beh: "static", x: ZPOND.x - ZPOND.r - 1, y: ZPOND.y, life: 2.4, r: .3, push: 0, scare: 4.5 });
        pop(ZPOND.x - 4, ZPOND.y - 1, "SPLOOSH!"); shake = Math.min(1, shake + .4);
        for (let k = 0; k < 14; k++) puff(ZPOND.x - 3 + rnd(-2, 1), ZPOND.y + rnd(-3, 3), .5, "#9ee0ff", .5, 1.2, 2.5);
      });
      caption("The hippo is yawning…", false, 1800);
    },
    sneeze() {
      ZOO_FX.sneeze = zooNow() + 1500;
      pop(20, 8, "ACHOO!"); later(.6, () => { pop(20, 22, "AWWWWW!"); burstAt(20, 12, 60); });
      cheerT = 4; surgeT = Math.max(surgeT, 2.8);
      caption("The baby panda sneezed! The crowd lost its mind", true, 2400);
    },
  },
  performers: () => [
    { kind: "zoo_panda", orbit: [20, 9, 1.4, .35, 0], x: 0, y: 0, ang: 0, t: 0 },
    { kind: "zoo_panda", big: true, orbit: [15.5, 4.5, .01, 0, 0], x: 0, y: 0, ang: 0, t: 0 },
    { kind: "zoo_hippo", orbit: [ZPOND.x + .4, ZPOND.y, .01, 0, Math.PI], h: -.15, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "zoo_flamingo", orbit: [ZPOND.x, ZPOND.y, ZPOND.r - .5, .15, 1], x: 0, y: 0, ang: 0, t: 0 },
    { kind: "zoo_flamingo", orbit: [ZPOND.x, ZPOND.y, ZPOND.r - .5, .15, 1.8], x: 0, y: 0, ang: 0, t: 0 },
    { kind: "zoo_penguin", orbit: [3.5, 22, 1.6, .5, 0], x: 0, y: 0, ang: 0, t: 0 },
    { kind: "zoo_penguin", chick: true, orbit: [3.5, 22, 1.6, .5, .6], x: 0, y: 0, ang: 0, t: 0 },
    { kind: "zoo_giraffe", orbit: [36.5, 25, 1.4, -.12, 0], x: 0, y: 0, ang: 0, t: 0 },
    { kind: "zoo_gorilla", orbit: [3.5, 46.5, .9, .3, 0], x: 0, y: 0, ang: 0, t: 0 },
  ],
};
