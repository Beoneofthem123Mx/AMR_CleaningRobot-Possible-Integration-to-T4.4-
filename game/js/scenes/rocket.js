// Human Tsunami · scene: Launch Day (a billionaire's private rocket launch, open to the public "for the vibes")
const RPAD = { x: 20, y: 8 }, RBAR_Y = 17;
let ROCKET_FX = { fire: -99, shake: -99 };   // sim times when the engine lit up / the rocket rattled

// ---------- custom models ----------
// the rocket itself (a performer, so it can rattle and spit fire during the countdown)
SCENE_MODELS.rocket_ship = (g, u) => {
  const steel = mat("#eef0f2", { metalness: .55, roughness: .3 }), dark = mat("#22252b", { metalness: .5, roughness: .4 });
  const r = pivot(g, 0, 0, 0);
  part(r, "cyl", dark, 1.5, 1.2, 1.5, 0, .6, 0);                       // engine skirt
  for (const [x, z] of [[.6, 0], [-.6, 0], [0, .6], [0, -.6], [0, 0]]) part(r, "cone", dark, .32, .7, .32, x, .1, z);
  part(r, "cyl", steel, 1.35, 13, 1.35, 0, 7.7, 0);                     // main body
  part(r, "cyl", mat("#ff5a1f", { roughness: .4 }), 1.37, .7, 1.37, 0, 4.2, 0);   // orange stripes
  part(r, "cyl", mat("#ff5a1f", { roughness: .4 }), 1.37, .4, 1.37, 0, 11.6, 0);
  part(r, "cyl", mat("#15171c", { metalness: .4, roughness: .3 }), 1.37, .35, 1.37, 0, 12.4, 0);
  part(r, "cone", steel, 1.35, 3.6, 1.35, 0, 16, 0);                      // nose cone
  part(r, "sph", mat("#ff5a1f"), .25, .25, .25, 0, 17.8, 0);
  for (let i = 0; i < 4; i++) {                                           // fins
    const p = pivot(r, 0, 0, 0); p.rotation.y = i * Math.PI / 2 + Math.PI / 4;
    part(p, "box", mat("#ff5a1f", { roughness: .45 }), 1.9, 2.6, .14, 1.9, 1.9, 0);
  }
  // logo panels and a round porthole with a tiny billionaire waving
  for (const s of [-1, 1]) {
    part(r, "box", basic("#15171c"), .05, 3.4, 1.0, s * 1.36, 8, 0);
    part(r, "box", basic("#ff5a1f"), .06, 2.8, .4, s * 1.37, 8, 0);
  }
  part(r, "cyl", mat("#7fd0ff", { roughness: .1, metalness: .4 }), .45, .1, .45, 0, 13.4, 1.33).rotation.x = Math.PI / 2;
  // engine fire
  u.flame = pivot(g, 0, 0, 0);
  part(u.flame, "cone", basic("#ffd23a"), 1.2, 3, 1.2, 0, -1.2, 0).rotation.x = Math.PI;
  part(u.flame, "cone", basic("#ff5a1f"), .8, 4.4, .8, 0, -1.9, 0).rotation.x = Math.PI;
  u.anim = (tt) => {
    const now = typeof t === "number" ? t : 0, fire = now - ROCKET_FX.fire < 2.6 && now >= ROCKET_FX.fire, rattle = now - ROCKET_FX.shake < 3 && now >= ROCKET_FX.shake;
    u.flame.visible = fire; if (fire) u.flame.scale.set(1, .7 + Math.random() * .6, 1);
    r.position.x = rattle ? Math.sin(tt * 60) * .06 : 0; r.rotation.z = rattle ? Math.sin(tt * 37) * .012 : 0;
  };
};
// the billionaire: puffer vest, backwards cap, phone on a selfie stick (always live)
SCENE_PERSONS.rocket_ceo = { body: "#15171c", legs: "#3a4252", hat: "cap", hatCol: "#ff5a1f", scale: 1.05,
  extra(g, u, b) {
    part(b, "sph", "#c9ced6", .23, .3, .29, -.01, 1.12, 0);                      // puffer vest
    part(b, "box", "#ff5a1f", .05, .14, .14, .22, 1.25, .1);                       // logo patch
    const st = pivot(b, .1, 1.35, .3); st.rotation.x = -.5; st.rotation.z = -.5;
    part(st, "cyl", "#2b2f35", .02, .9, .02, 0, .45, 0);
    part(st, "box", "#151617", .03, .26, .14, 0, .92, 0);
    u.rec = part(st, "sph", basic("#ff2a2a"), .04, .04, .04, .03, 1.02, .05);
    u.anim = (tt) => { u.rec.visible = Math.sin(tt * 8) > 0; };
  } };
// ground crew in white suits and bubble helmets
SCENE_PERSONS.rocket_astro = { body: "#f4f4f2", legs: "#f4f4f2", hat: "none", scale: 1.05,
  extra(g, u, b) {
    part(b, "sph", mat("#bfe8ff", { transparent: true, opacity: .55, roughness: .1 }), .24, .24, .24, .02, 1.66, 0);
    part(b, "box", "#c9ced6", .3, .45, .4, -.24, 1.15, 0);   // backpack
    part(b, "box", "#ff5a1f", .05, .1, .3, .2, 1.3, 0);
  } };
// the robot dog: a yellow box on four bendy legs with a lidar for a head
SCENE_MODELS.rocket_robodog = (g, u) => {
  const y = mat("#ffd23a", { roughness: .45 }), k = mat("#22252b", { metalness: .5, roughness: .35 });
  part(g, "box", y, 1.0, .32, .45, 0, .72, 0);
  part(g, "box", k, .7, .1, .47, 0, .9, 0);
  u.head = pivot(g, .55, .82, 0);
  part(u.head, "box", k, .3, .22, .3, .1, 0, 0);
  u.eye = part(u.head, "sph", basic("#5fe0ff"), .08, .08, .14, .26, .02, 0);
  part(u.head, "cyl", k, .07, .14, .07, .05, .17, 0);
  for (const [x, z] of [[.38, .22], [.38, -.22], [-.38, .22], [-.38, -.22]]) {
    const p = leg(g, x, .62, z, .06, .32, "#22252b"); u.legs.push(p);
    part(p, "cyl", y, .055, .3, .055, -.08, -.45, 0).rotation.z = .5;
  }
  u.anim = (tt) => { u.head.rotation.y = Math.sin(tt * 2.5) * .5; u.eye.visible = Math.sin(tt * 10) > -.6; };
};
// the reusable booster: grid fins, landing legs and a rocket-motor exhaust while it lands
SCENE_MODELS.rocket_booster = (g, u, m) => {
  const steel = mat("#e6e8ea", { metalness: .55, roughness: .35 }), dark = mat("#22252b", { metalness: .5, roughness: .4 });
  part(g, "cyl", steel, 1.1, 9, 1.1, 0, 5.2, 0);
  part(g, "cyl", mat("#ff5a1f"), 1.12, .6, 1.12, 0, 8.2, 0);
  part(g, "cyl", dark, 1.12, .5, 1.12, 0, 9.3, 0); part(g, "cyl", steel, .9, .3, .9, 0, 9.8, 0); part(g, "box", mat("#ff5a1f"), 1.2, .05, .25, 0, 9.96, 0);
  part(g, "cyl", mat("#9aa0a8", { metalness: .7, roughness: .5 }), 1.12, 1.5, 1.12, 0, 1.4, 0);   // soot
  for (let i = 0; i < 4; i++) {
    const p = pivot(g, 0, 0, 0); p.rotation.y = i * Math.PI / 2 + Math.PI / 4;
    const lg = part(p, "box", dark, 2.3, .14, .22, 1.5, 1.2, 0); lg.rotation.z = .55;
    part(p, "box", mat("#5a5f68", { metalness: .6 }), .6, .08, .7, 1.25, 9.9, 0);      // grid fins
  }
  u.flame = pivot(g, 0, 0, 0);
  part(u.flame, "cone", basic("#ffd23a"), .9, 2.4, .9, 0, -.6, 0).rotation.x = Math.PI;
  part(u.flame, "cone", basic("#ff7a2f"), .55, 3.8, .55, 0, -1.4, 0).rotation.x = Math.PI;
  u.anim = (tt, mm) => { u.flame.visible = !!mm.burn; if (mm.burn) u.flame.scale.set(1, .8 + Math.random() * .5, 1); };
};
// the driverless car: white wedge, spinning lidar, nobody at the wheel
SCENE_MODELS.rocket_car = (g, u) => {
  const body = mat("#f2f3f5", { metalness: .35, roughness: .3 });
  part(g, "box", body, 3.6, .6, 1.8, 0, .6, 0);
  part(g, "box", mat("#1d2733", { roughness: .1, metalness: .6 }), 2.0, .55, 1.7, -.3, 1.15, 0);
  part(g, "box", body, 1.6, .06, 1.66, -.35, 1.45, 0);
  for (const [x, z] of [[1.1, .9], [-1.1, .9], [1.1, -.9], [-1.1, -.9]]) part(g, "cyl", "#151617", .36, .26, .36, x, .36, z).rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) part(g, "box", basic("#7fe0ff"), .05, .1, .55, 1.8, .7, s * .55);
  part(g, "box", mat("#ff5a1f"), 3.62, .12, 1.82, 0, .78, 0);
  u.lidar = pivot(g, -.3, 1.55, 0);
  part(u.lidar, "cyl", "#22252b", .25, .25, .25, 0, .1, 0);
  part(u.lidar, "box", basic("#ff2a2a"), .05, .08, .3, .24, .12, 0);
  u.anim = (tt) => { u.lidar.rotation.y = tt * 12; };
};
// a $400 hoodie, tumbling through the air
SCENE_MODELS.rocket_hoodie = (g, u, m) => {
  const c = m.col || "#15171c", s = pivot(g, 0, 0, 0);
  part(s, "box", c, .5, .12, .55, 0, 0, 0);
  for (const z of [-1, 1]) part(s, "box", c, .18, .1, .4, .05, 0, z * .42);
  part(s, "sph", c, .18, .12, .18, .3, .02, 0);
  part(s, "box", "#ff5a1f", .2, .14, .2, 0, .01, 0);
  u.anim = (tt) => { s.rotation.x = tt * 9; s.rotation.z = tt * 5; };
};
// "free NFT": a cardboard box with a QR code and a tiny parachute
SCENE_MODELS.rocket_box = (g, u) => {
  const s = pivot(g, 0, 0, 0);
  part(s, "box", "#c79a5e", .5, .4, .5, 0, .2, 0);
  part(s, "box", "#a77a40", .52, .06, .1, 0, .41, 0);
  part(s, "box", "#151617", .3, .02, .3, 0, .42, 0);
  part(s, "box", "#ffffff", .1, .03, .1, .05, .43, .05);
  const chute = part(g, "sph", "#ff5a1f", .6, .3, .6, 0, 1.4, 0);
  u.anim = (tt) => { s.rotation.y = tt * 2; chute.rotation.y = -tt; };
};

SCENES.rocket = {
  name: "Launch Day", tag: "A billionaire goes to space (again)", place: "THE LAUNCH PAD", outside: "#c9a46e", bulbH: 1.2, night: false, music: "space",
  light: { sky: 0xcfe8ff, ground: 0xc8a070, hemi: .55, sun: 0xfff0d8, sunI: 1.25 }, crowd: 3200, fenceBudget: 70, maxGates: 5, guards: 4,
  gates: [F, F, T, T, F, F, F], unlock: 20,
  intro: "YeetX founder Rex Gigabuck is launching himself into space for the fourth time this year, and the public is invited \"for the vibes\". Expect countdowns, robot dogs, merch cannons and boosters landing slightly too close.",
  acts: ["T-minus vibes!", "To the moon!", "Disrupt gravity!", "Like and subscribe!", "Wen launch?"],
  events: ["countdown", "ceo", "robodog", "merch", "booster", "robotaxi", "nft", "countdown"],
  goal: o => o.kind === "rocket_barrier", goalMaxY: 21,
  heights: { rocket_barrier: 1.1, rocket_pad: .5, rocket_tower: .5, rocket_tank: 5, rocket_control: 2.6, rocket_vip: 1.8, rocket_merch: 2.4, rocket_potty: 2.4, rocket_dish: 1.2 },
  sfx: { "3!": "tick", "2!": "tick", "1!": "tick", "HOLD!": "siren", "BEEP BOOP!": "beep", "WOOF.EXE!": "bark", "SMASH THAT LIKE BUTTON!": "cheer", "FREE HOODIE!": "fiu",
    "TOUCHDOWN!": "boom", "RECYCLING!": "fiu", "PLEASE STAND CLEAR!": "beep", "RECALCULATING!": "honk", "FREE NFT!": "jingle", "FROM THE TOP!": "horn", "NO PHOTOS! (PHOTOS OK)!": "flash" },
  lines: {
    countdown: "The countdown reached \"1\" eleven times; the rocket remained, technically, on the ground.",
    ceo: "Rex Gigabuck livestreamed himself walking through the crowd for 40 minutes; peak viewership: his mom and 2 million bots.",
    robodog: "A robot dog patrolled the crowd, scanned everyone's face and tried to sell them a subscription.",
    merch: "The merch cannon fired $400 hoodies into the crowd; nobody got one in their size.",
    booster: "The reusable booster landed perfectly, eleven meters from where it should have, three meters from a family picnic.",
    robotaxi: "A self-driving car with nobody inside drove through the crowd announcing that it was \"safer than humans\".",
    nft: "An \"NFT airdrop\" turned out to be cardboard boxes containing a QR code that leads to another QR code.",
  },
  quotes: ["“Today we take one small step for man and one giant leap for my quarterly earnings,” said Rex Gigabuck.",
    "“I don't know what's going on but I got a hoodie,” said a fan who came for the free parking.",
    "“The launch went flawlessly. Define launch,” added a YeetX spokesperson."],
  build() {
    seg(0, RBAR_Y, WW, RBAR_Y, .4, "rocket_barrier");
    rect(13.5, 2.5, 26.5, 13.5, "rocket_pad");
    rect(27.5, 4.5, 31, 8, "rocket_tower");
    circ(5, 7, 2.2, "rocket_tank"); circ(35.5, 7, 2.2, "rocket_tank");
    rect(2, 11, 9.5, 15, "rocket_control");
    // the crowd area: VIP bleachers in the middle and merch/potties making bottlenecks
    rect(12.5, 27, 27.5, 32, "rocket_vip");
    rect(0, 36, 7, 42, "rocket_merch"); rect(33, 36, WW, 42, "rocket_merch");
    rect(15, 45, 25, 47.5, "rocket_potty");
    circ(5.5, 52, 1.4, "rocket_dish"); circ(34.5, 52, 1.4, "rocket_dish");
  },
  ground(g) {
    // desert sand with ripples and pebbles
    g.fillStyle = "#dcb47c"; g.fillRect(0, 0, WW, WH);
    const rand = rng(77);
    for (let k = 0; k < 2600; k++) { g.fillStyle = k % 3 ? "rgba(150,100,50,.18)" : "rgba(255,240,205,.35)"; g.fillRect(rand() * WW, rand() * FENCE_Y, .14, .07); }
    g.strokeStyle = "rgba(160,110,60,.18)"; g.lineWidth = .12;
    for (let y = 18; y < FENCE_Y; y += 1.6) { g.beginPath(); for (let x = 0; x <= WW; x += 1) g.lineTo(x, y + Math.sin(x * .45 + y) * .35); g.stroke(); }
    // cracks in the dry ground
    g.strokeStyle = "rgba(120,80,40,.3)"; g.lineWidth = .06;
    for (let k = 0; k < 40; k++) { let x = rand() * WW, y = 18 + rand() * 45; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 4; s++) { x += rand() * 1.4 - .7; y += rand() * 1.4 - .7; g.lineTo(x, y); } g.stroke(); }
    // scorched concrete apron behind the barrier
    g.fillStyle = "#b9b3a8"; g.fillRect(0, 0, WW, RBAR_Y);
    const scorch = g.createRadialGradient(RPAD.x, RPAD.y, 1, RPAD.x, RPAD.y, 12); scorch.addColorStop(0, "rgba(30,25,20,.55)"); scorch.addColorStop(1, "rgba(30,25,20,0)");
    g.fillStyle = scorch; g.fillRect(0, 0, WW, RBAR_Y);
    g.strokeStyle = "rgba(90,85,80,.35)"; g.lineWidth = .05;
    for (let x = 0; x < WW; x += 4) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, RBAR_Y); g.stroke(); }
    for (let y = 0; y < RBAR_Y; y += 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(WW, y); g.stroke(); }
    // hazard stripe along the barrier
    hazardLine(g, 0, RBAR_Y - .6, WW, RBAR_Y - .6, .7);
    // giant logo painted on the sand
    g.save(); g.translate(20, 39); g.globalAlpha = .28;
    g.fillStyle = "#ff5a1f"; g.beginPath(); g.moveTo(-7, 3); g.lineTo(0, -5); g.lineTo(7, 3); g.lineTo(3.5, 3); g.lineTo(0, -1); g.lineTo(-3.5, 3); g.fill();
    g.font = "900 3.2px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("YEETX", 0, 6.8);
    g.restore();
    // landing zone target that is definitely not in the crowd
    g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = .25;
    g.beginPath(); g.arc(28, 57, 3, 0, 7); g.stroke(); g.beginPath(); g.arc(28, 57, 1.6, 0, 7); g.stroke();
    g.font = "900 .8px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "rgba(255,255,255,.7)"; g.fillText("BOOSTER LANDING ZONE (PROBABLY)", 28, 61);
    // tire tracks
    g.strokeStyle = "rgba(110,75,40,.25)"; g.lineWidth = .18;
    for (const dz of [0, 1.5]) { g.beginPath(); g.moveTo(0, 55 + dz); g.bezierCurveTo(12, 50 + dz, 24, 60 + dz, WW, 52 + dz); g.stroke(); }
    // the road at the bottom
    g.fillStyle = "#4a4640"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
    g.fillStyle = "#e9d27a"; for (let x = 1; x < WW; x += 3) g.fillRect(x, 69.4, 1.6, .18);
  },
  decor(g) {
    g.textAlign = "center"; g.textBaseline = "middle";
    // barrier
    for (const o of obs) if (o.kind === "rocket_barrier") { g.lineWidth = o.th; g.strokeStyle = "#f4f4f2"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
    for (let x = 1; x < WW; x += 2) { g.fillStyle = "#ff5a1f"; g.fillRect(x, RBAR_Y - .2, 1, .4); }
    // the pad: launch markings
    g.fillStyle = "#8d8a84"; g.fillRect(13.5, 2.5, 13, 11);
    g.strokeStyle = "#f4f4f2"; g.lineWidth = .2; g.strokeRect(14, 3, 12, 10);
    g.strokeStyle = "#ffd23a"; g.lineWidth = .3; g.beginPath(); g.arc(RPAD.x, RPAD.y, 3.6, 0, 7); g.stroke();
    g.fillStyle = "#3a3632"; g.beginPath(); g.arc(RPAD.x, RPAD.y, 2.6, 0, 7); g.fill();
    g.font = "900 .7px Rubik, sans-serif"; g.fillStyle = "#f4f4f2"; g.fillText("PAD 39-ISH", RPAD.x, 12.4);
    for (const o of obs) if (o.kind === "rocket_tower") { g.fillStyle = "#5a5f68"; g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0); }
    // fuel tanks
    for (const o of obs) if (o.kind === "rocket_tank") {
      g.fillStyle = "#f2f3f5"; g.beginPath(); g.arc(o.x, o.y, o.r, 0, 7); g.fill();
      g.strokeStyle = "#c9ced6"; g.lineWidth = .15; g.beginPath(); g.arc(o.x, o.y, o.r * .7, 0, 7); g.stroke();
      g.font = "900 .55px Rubik, sans-serif"; g.fillStyle = "#ff5a1f"; g.fillText(o.x < 20 ? "LOX" : "VIBES", o.x, o.y);
    }
    // mission control trailer
    g.fillStyle = "#f4f4f2"; g.fillRect(2, 11, 7.5, 4); g.fillStyle = "#15171c"; g.fillRect(2.4, 11.4, 6.7, 1.1);
    g.font = "900 .55px Rubik, sans-serif"; g.fillStyle = "#5fe0ff"; g.fillText("MISSION CONTROL", 5.75, 11.95);
    g.fillStyle = "#ff5a1f"; g.font = "900 .5px Rubik, sans-serif"; g.fillText("(INTERN)", 5.75, 13.6);
    // VIP bleachers
    g.fillStyle = "#2b2f35"; g.fillRect(12.5, 27, 15, 5);
    for (let y = 27.5; y < 32; y += .8) { g.fillStyle = "#3a4252"; g.fillRect(12.8, y, 14.4, .5); }
    g.fillStyle = "#ffd23a"; g.font = "900 .9px Rubik, sans-serif"; g.fillText("VIP · INVESTORS ONLY", 20, 29.5);
    g.fillStyle = "#c9ced6"; g.font = "700 .5px Rubik, sans-serif"; g.fillText("(SERIES Z AND ABOVE)", 20, 30.8);
    // merch tents
    for (const o of obs) if (o.kind === "rocket_merch") {
      for (let x = o.x0, i = 0; x < o.x1; x += .7, i++) { g.fillStyle = i % 2 ? "#15171c" : "#ff5a1f"; g.fillRect(x, o.y0, .7, o.y1 - o.y0); }
      g.fillStyle = "#f4f4f2"; g.fillRect(o.x0 + .6, o.y0 + 2.2, o.x1 - o.x0 - 1.2, 1.6);
      g.fillStyle = "#15171c"; g.font = "900 .55px Rubik, sans-serif"; g.fillText("HOODIES $400", (o.x0 + o.x1) / 2, o.y0 + 3);
    }
    // porta-potties
    for (const o of obs) if (o.kind === "rocket_potty") for (let x = o.x0, i = 0; x < o.x1 - .1; x += 1.25, i++) {
      g.fillStyle = i % 2 ? "#2f6fc4" : "#3f86e0"; g.fillRect(x + .05, o.y0, 1.15, o.y1 - o.y0);
      g.fillStyle = "#f4f4f2"; g.beginPath(); g.arc(x + .62, o.y0 + 1.25, .25, 0, 7); g.fill();
    }
    // satellite dishes
    for (const o of obs) if (o.kind === "rocket_dish") {
      g.fillStyle = "#e6e8ea"; g.beginPath(); g.arc(o.x, o.y, o.r, 0, 7); g.fill();
      g.strokeStyle = "#9aa0a8"; g.lineWidth = .1; for (let r = .4; r < o.r; r += .4) { g.beginPath(); g.arc(o.x, o.y, r, 0, 7); g.stroke(); }
    }
    // welcome banner over the gates
    g.fillStyle = "#15171c"; g.fillRect(4, FENCE_Y - 2.4, WW - 8, 1.1);
    g.fillStyle = "#ff5a1f"; g.font = "900 .75px Rubik, sans-serif"; g.fillText("WELCOME TO LAUNCH DAY · BY ENTERING YOU AGREE TO BE IN THE LIVESTREAM", 20, FENCE_Y - 1.85);
  },
  bulbs: Array.from({ length: 20 }, (_, i) => [1 + i * 2, RBAR_Y]),
  beams: [{ x: 20, y: 14, a: -Math.PI / 2, sweep: .2, h: 4, white: true }, { x: 4, y: 16, a: -1.2, sweep: .4, h: 8, white: true }, { x: 36, y: 16, a: -1.9, sweep: .4, h: 8, white: true }],
  extra3D(grp) {
    // launch tower: four legs, cross bracing and an access arm reaching to the rocket
    const steel = mat("#5a5f68", { metalness: .6, roughness: .45 }), red = mat("#d8322b", { roughness: .5 });
    for (const [x, z] of [[27.8, 4.8], [30.7, 4.8], [27.8, 7.7], [30.7, 7.7]]) part(grp, "box", steel, .25, 19, .25, x, 9.5, z);
    for (let h = 1.5; h < 19; h += 2.2) {
      part(grp, "box", h % 4.4 < 2.2 ? red : steel, 3.2, .18, .18, 29.25, h, 4.8); part(grp, "box", h % 4.4 < 2.2 ? red : steel, 3.2, .18, .18, 29.25, h, 7.7);
      part(grp, "box", steel, .18, .18, 3.2, 27.8, h, 6.25); part(grp, "box", steel, .18, .18, 3.2, 30.7, h, 6.25);
    }
    part(grp, "box", steel, 6.8, .4, 1, 24.4, 14.5, 7); part(grp, "box", mat("#22252b"), 1.2, 1.1, 1.2, 21.7, 14.7, 7.3);
    part(grp, "box", steel, 3.6, .3, .8, 29.25, 19.2, 6.25); part(grp, "sph", basic("#ff2a2a"), .25, .25, .25, 29.25, 19.6, 6.25);
    // fuel tanks with domes and the mission-control trailer roof dish
    for (const x of [5, 35.5]) { part(grp, "sph", "#f2f3f5", 2.2, 1, 2.2, x, 5, 7); part(grp, "box", "#ff5a1f", 4.45, .4, .2, x, 3.5, 7); }
    part(grp, "cyl", "#c9ced6", .08, 1.4, .08, 7.8, 3.3, 13); const d = part(grp, "sph", "#e6e8ea", .8, .25, .8, 7.8, 4, 13); d.rotation.z = .6;
    // giant screen behind the barrier with the livestream
    part(grp, "box", "#15171c", 8, 4.6, .3, 11, 4.8, 15.6);
    part(grp, "box", basic("#5fe0ff"), 7.4, 3.4, .1, 11, 5.1, 15.8);
    part(grp, "box", basic("#ff2a2a"), 1.2, .5, .1, 8.2, 6.4, 15.86);
    for (const x of [7.5, 14.5]) part(grp, "box", "#2b2f35", .2, 2.6, .2, x, 1.3, 15.6);
    // merch cannon truck (by the barrier, aimed at the crowd)
    part(grp, "box", "#15171c", 3.2, 1.2, 1.8, 33.5, .9, 14.5);
    const c = pivot(grp, 33.5, 1.9, 14.5); c.rotation.x = .9;
    part(c, "cyl", mat("#ff5a1f", { metalness: .4, roughness: .4 }), .35, 2.4, .35, 0, 1, 0);
    // dish tops over the crowd
    for (const x of [5.5, 34.5]) { const s = part(grp, "sph", "#e6e8ea", 1.4, .35, 1.4, x, 2.1, 52); s.rotation.x = .5; part(grp, "cyl", "#9aa0a8", .05, .8, .05, x, 2.6, 51.6); }
    // VIP bleacher awning
    part(grp, "box", "#ff5a1f", 15.4, .15, 1.2, 20, 3.6, 31.6);
    for (const x of [12.8, 27.2]) part(grp, "box", "#2b2f35", .15, 1.9, .15, x, 2.7, 31.6);
  },
  ev: {
    countdown() {
      const restart = Math.random() < .5;
      caption("T-minus 3! The whole crowd leans forward", true, 2000);
      const smoke = () => { for (let k = 0; k < 16; k++) puff(RPAD.x + rnd(-3, 3), RPAD.y + rnd(-3, 3), .5, k % 2 ? "#f4f0e8" : "#d9d2c5", 1.2, 3.5, 1.4); };
      later(.1, () => { if (phase === "show") { pop(RPAD.x, 15, "3!", 6); ROCKET_FX.shake = t; } });
      later(1.1, () => { if (phase === "show") pop(RPAD.x, 15, "2!", 6); });
      later(2.1, () => { if (phase === "show") { pop(RPAD.x, 15, "1!", 6); ROCKET_FX.fire = t; smoke(); surgeT = Math.max(surgeT, 2.4); shake = Math.min(1, shake + .4); cheerT = 3; } });
      later(3.4, () => {
        if (phase !== "show") return;
        pop(RPAD.x, 15, "HOLD!", 6); smoke();
        caption(pick(["HOLD! HOLD! A seagull looked at the engine", "HOLD! Someone forgot to charge the rocket", "HOLD! The CEO wants a better camera angle"]), true, 2000);
        if (restart) later(2, () => { if (phase === "show") { pop(RPAD.x, 17, "FROM THE TOP!", 6); SCENES.rocket.ev.countdown.call(null, true); } });
      });
    },
    ceo() {
      const gx = openGateX(), p1 = crowdPoint(), p2 = crowdPoint(), p3 = crowdPoint(), pts = [[gx, 56], p1, p2, p3, [gx, SH + 3]];
      addMover({ kind: "rocket_ceo", x: gx, y: SH, pts, speed: .95, r: .4, push: 12, say: "SMASH THAT LIKE BUTTON!", sayEvery: 3.5, tick: followTick(15, 3, .45) });
      for (const s of [-1, 1]) addMover({ kind: "bodyguard", x: gx + s * 1.2, y: SH + 1.5, pts: pts.map(([x, y]) => [x + s * 1.2, y + 1]), speed: .95, r: .5, push: 22, say: s > 0 ? "NO PHOTOS! (PHOTOS OK)!" : "", sayEvery: 5 });
      caption("Rex Gigabuck is livestreaming from the crowd! Everyone wants to be in frame", true, 2400);
    },
    robodog() {
      for (let n = 0; n < 2; n++) {
        const sx = n ? WW + 1.5 : -1.5, sy = rnd(26, 58);
        addMover({ kind: "rocket_robodog", x: sx, y: sy, pts: [crowdPoint(), crowdPoint(), crowdPoint(), [n ? -3 : WW + 3, rnd(26, 58)]], speed: 2.6, r: .5, push: 18, scare: 1.6, say: n ? "WOOF.EXE!" : "BEEP BOOP!", sayEvery: 2.6 });
      }
      caption("Robot dogs are patrolling the crowd. They don't know what a dog is", false, 2000);
    },
    merch() {
      const first = crowdPoint();
      for (let n = 0; n < 5; n++) later(n * .45, () => {
        if (phase !== "show") return;
        const [tx, ty] = n ? crowdPoint() : first;
        addMover({ kind: "rocket_hoodie", beh: "fly", x: 33.5, y: 15, sx: 33.5, sy: 15, tx, ty, dur: 1.3, r: .25, push: 0, air: true, small: true, col: pick(["#15171c", "#ff5a1f", "#f4f4f2", "#5a5f68"]), say: n ? "" : "FREE HOODIE!", sayEvery: 9 });
      });
      later(1.5, () => { if (phase === "show") { tempAttract(first[0], first[1], 2.8, 6, .4); pop(first[0], first[1], "IT'S MINE!"); } });
      caption("The merch cannon is firing $400 hoodies into the crowd!", true, 2200);
    },
    booster() {
      const [x, y] = [rnd(8, 32), rnd(34, 56)];
      caption("The booster is coming back! It's aiming for the landing zone... roughly", true, 2400);
      addMover({ kind: "rocket_booster", beh: "hover", x, y, h: 36, pts: [[x, y], [x + rnd(-4, 4), -30]], speed: 4, pause: 6.5, r: 1.2, push: 0, scare: 0, air: true, burn: true,
        tick(m) {
          if (m.i === 0) {
            const q = Math.min(1, m.t / 4.2); m.h = 36 * (1 - q) * (1 - q);
            if (m.h < 10) { m.scare = 3.2; if (Math.random() < .5) puff(x + rnd(-2.5, 2.5), y + rnd(-2.5, 2.5), .3, "#d6b98c", 1, 2.2, .8); }
            if (q >= 1 && !m.landed) {
              m.landed = true; m.burn = false; m.push = 35; m.scare = 1.5; pop(x, y - 2, "TOUCHDOWN!", 6); pop(x, y - 1, "BOOM!"); shake = Math.min(1.2, shake + .8); burstAt(x, y, 40);
              for (const a of ag) { const dx = a.x - x, dy = a.y - y, d = Math.hypot(dx, dy); if (d < 3.6 && d > .01) { const s = (1 - d / 3.6) * 3.5; a.vx += dx / d * s; a.vy += dy / d * s; } }
              for (let k = 0; k < 30; k++) puff(x + rnd(-3.5, 3.5), y + rnd(-3.5, 3.5), .4, "#d6b98c", 1.4, 3, .9);
              cheerT = 3;
            }
          } else {
            if (!m.lift) { m.lift = true; m.burn = true; m.push = 0; m.scare = 0; pop(m.x, m.y - 2, "RECYCLING!", 6); }
            m.h += DT * 9;
          }
        } });
    },
    robotaxi() {
      const side = Math.random() < .5, y0 = rnd(50, 58), pts = [[side ? 12 : 28, y0 + rnd(-3, 3)], [side ? 22 : 18, rnd(36, 44)], [side ? 30 : 10, rnd(48, 58)], [side ? WW + 5 : -5, rnd(50, 58)]];
      addMover({ kind: "rocket_car", x: side ? -4 : WW + 4, y: y0, pts, speed: 3.2, r: 1.15, push: 38, scare: 2.8, say: "PLEASE STAND CLEAR!", sayEvery: 2.4,
        tick(m) { m.rc = (m.rc || 0) + DT; if (m.rc > 4.5) { m.rc = 0; pop(m.x, m.y - 1.6, "RECALCULATING!"); } } });
      caption("A self-driving car with nobody inside is 'helping'", true, 2000);
    },
    nft() {
      const first = crowdPoint();
      for (let n = 0; n < 6; n++) {
        const [tx, ty] = n ? crowdPoint() : first, sx = tx + rnd(-6, 6);
        addMover({ kind: "rocket_box", beh: "fly", x: sx, y: 10, sx, sy: 10, tx, ty, dur: 1.6 + n * .15, r: .25, push: 0, air: true, small: true, say: n ? "" : "FREE NFT!", sayEvery: 9 });
      }
      later(1.8, () => { if (phase === "show") { tempAttract(first[0], first[1], 2.6, 5, .35); pop(first[0], first[1], "IT'S MINE!"); } });
      caption("Free NFT airdrop! (It's a cardboard box with a QR code)", true, 2200);
    },
  },
  performers: () => [
    { kind: "rocket_ship", orbit: [RPAD.x, RPAD.y, .001, 0, 0], h: .5, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "rocket_astro", orbit: [RPAD.x, RPAD.y, 4.6, .35, 0], h: .5, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "rocket_astro", orbit: [RPAD.x, RPAD.y, 4.6, .35, Math.PI], h: .5, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "rocket_robodog", orbit: [RPAD.x, RPAD.y, 5.6, -.5, 1], h: .5, x: 0, y: 0, ang: 0, t: 0 },
  ],
};
