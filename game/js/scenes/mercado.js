// Human Tsunami · scene: The Market (rows of stalls; people hop from stall to stall and the vendors yell their deals)
const MKT = { stalls: [], t: 0 };
const MKT_GOODS = [["FRUIT", "#ff9a3c"], ["TACOS", "#d8322b"], ["CHEESE", "#ffd23a"], ["FISH", "#4fb8ff"], ["FLOWERS", "#ff6fb1"], ["CANDY", "#a98bff"], ["SOCKS", "#7ac943"], ["TOYS", "#22d3ee"], ["SPICES", "#c0583b"], ["BREAD", "#e3b23c"]];
const MKT_YELLS = ["DEAL!", "TWO FOR ONE!", "TASTE IT, IT'S FREE!", "WHAT ARE YOU LOOKING FOR, BOSS?", "CHEAPER THAN ONLINE!", "LAST ONES!", "BUY THREE, CRY ONCE!", "FRESH, FRESH, FRESH!", "FOR YOU, SPECIAL PRICE!", "COME, COME, COME!"];
(function () {   // three rows of stalls, back to back, with aisles between
  const rows = [18, 32, 46];
  for (const y of rows) for (const x of [4, 12, 24, 32]) MKT.stalls.push({ x0: x, y0: y, x1: x + 5, y1: y + 3.2, g: MKT_GOODS[MKT.stalls.length % MKT_GOODS.length] });
})();
SCENE_PERSONS.mkt_vendor = { body: "#f4f4f0", legs: "#2b2f35", hat: "cap", hatCol: "#d8322b", extra(g, u, b) { part(b, "box", "#ffd23a", .3, .5, .52, .02, .95, 0); } };
SCENE_MODELS.mkt_chicken = (g) => { part(g, "sph", "#f4f4f0", .3, .26, .22, 0, .4, 0); part(g, "sph", "#f4f4f0", .14, .16, .14, .24, .62, 0); part(g, "cone", "#ff9a3c", .05, .12, .05, .38, .6, 0).rotation.z = -Math.PI / 2; part(g, "sph", "#d8322b", .05, .07, .03, .24, .78, 0); toyEyes(g, .32, .66, .06, .04); };
SCENE_MODELS.mkt_cart = (g) => { part(g, "box", "#9aa0a8", .9, .1, .7, 0, .25, 0); part(g, "box", "#9aa0a8", .06, 1.3, .7, -.45, .9, 0); for (let i = 0; i < 4; i++) part(g, "box", ["#c8a06a", "#ffd23a", "#ff9a3c"][i % 3], .7, .4, .6, 0, .5 + i * .42, 0); for (const z of [-.3, .3]) { const w = part(g, "cyl", "#151617", .2, .1, .2, .3, .2, z); w.rotation.x = Math.PI / 2; } };
SCENE_MODELS.mkt_fruit = (g, u, m) => { u.ball = pivot(g, 0, .3, 0); part(u.ball, "sph", m.col || "#ff9a3c", .3, .3, .3, 0, 0, 0); part(u.ball, "cone", "#3d9a5b", .06, .14, .06, 0, .3, 0); u.anim = (tt, mm) => { u.ball.rotation.z = -(mm.spin || 0); }; };
SCENES.mercado = {
  name: "The Market", tag: "Special price, just for you", outside: "#9a8c74", bulbH: 2.6, music: "mariachi",
  light: { sky: 0xfff0d0, ground: 0x6a5a40, hemi: .6, sun: 0xffe8c0, sunI: 1.15 }, crowd: 3000, fenceBudget: 75, maxGates: 5, guards: 4,
  gates: [F, T, F, T, F, T, F], unlock: 46, shopRate: 3,
  intro: "Saturday market: twelve stalls in three rows and a mango stand at the back giving away free samples. Everyone wanders from stall to stall, the vendors shout their deals and the aisles are exactly one person too narrow.",
  acts: ["Free mango samples!", "Last ones!", "Two for one!", "Special price!"],
  events: ["oferta", "frutas", "gallinas", "diablito", "oferta", "frutas", "derrame", "derrame"],
  goal: o => o.kind === "barrier", goalMaxY: 12,
  heights: { stall: 1.1, mango: 1.3, crates: .9 },
  lines: {
    derrame: "The fish stall's tank burst. For twelve seconds one aisle was an ice rink that smelled of tuna.",
    oferta: "A flash deal at one stall moved half the market in eleven seconds.",
    frutas: "A pyramid of oranges collapsed and rolled down every aisle.",
    gallinas: "The chickens from the poultry stall went shopping on their own.",
    diablito: "A man with a hand truck stacked with boxes crossed the market shouting 'GOLPE AVISA'.",
  },
  quotes: ["“I came for tomatoes and left with a parrot,” said a shopper.", "“Special price, special crowd,” said the mango vendor.", "“The aisles are fine, it's the people that are wide,” said the market inspector."],
  shopDoors() {   // the counter of every stall, on the aisle side
    return MKT.stalls.map(s => s.y0 === 32 ? [(s.x0 + s.x1) / 2, s.y1 + .5, 0, 1] : [(s.x0 + s.x1) / 2, s.y0 - .5, 0, -1]);
  },
  build() {
    rect(10, 0, 30, 6, "mango");
    seg(6, 8.5, WW - 6, 8.5, .4, "barrier");
    for (const s of MKT.stalls) rect(s.x0, s.y0, s.x1, s.y1, "stall");
    rect(1, 58, 4, 62, "crates"); rect(WW - 4, 58, WW - 1, 62, "crates");
  },
  ground(g) {
    g.fillStyle = "#b8a98c"; g.fillRect(0, 0, WW, WH);
    const rand = rng(13); for (let k = 0; k < 1800; k++) { g.fillStyle = ["rgba(0,0,0,.06)", "rgba(255,255,255,.06)", "rgba(120,80,40,.12)"][k % 3]; g.fillRect(rand() * WW, rand() * FENCE_Y, .25, .18); }
    for (let k = 0; k < 90; k++) { g.fillStyle = ["#ff9a3c", "#7ac943", "#d8322b", "#ffd23a"][k % 4]; g.beginPath(); g.arc(rand() * WW, 10 + rand() * 50, .12, 0, 7); g.fill(); }   // squashed fruit
    g.fillStyle = "#8d826e"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
  },
  decor(g) {
    g.fillStyle = "#ff9a3c"; g.fillRect(10, 0, 20, 6); g.font = "900 1.3px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#ffffff"; g.fillText("FREE MANGOS", 20, 3);
    for (const s of MKT.stalls) {
      g.fillStyle = "#7a4a22"; g.fillRect(s.x0, s.y0, s.x1 - s.x0, s.y1 - s.y0);
      for (let x = s.x0, i = 0; x < s.x1; x += .5, i++) { g.fillStyle = i % 2 ? s.g[1] : "#f4f1ea"; g.fillRect(x, s.y0, .5, s.y1 - s.y0); }
      g.font = "900 .8px Rubik, sans-serif"; g.fillStyle = "#111214"; g.fillText(s.g[0], (s.x0 + s.x1) / 2, (s.y0 + s.y1) / 2);
    }
    for (const o of obs) if (o.kind === "barrier") { g.lineWidth = .3; g.strokeStyle = "#7a4a22"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
  },
  bulbs: Array.from({ length: 13 }, (_, i) => [7 + i * 2.15, 9.2]),
  beams: [{ x: 14, y: 4, a: Math.PI / 2, sweep: .6, h: 7, white: true }, { x: 26, y: 4, a: Math.PI / 2, sweep: .6, h: 7, white: true }],
  extra3D(grp) {
    // striped awnings on poles over every stall, piles of goods on the counters
    for (const s of MKT.stalls) {
      const cx = (s.x0 + s.x1) / 2, cy = (s.y0 + s.y1) / 2;
      for (const [x, y] of [[s.x0 + .1, s.y0 + .1], [s.x1 - .1, s.y0 + .1], [s.x0 + .1, s.y1 - .1], [s.x1 - .1, s.y1 - .1]]) part(grp, "cyl", "#8a6a44", .05, 2.4, .05, x, 1.2, y);
      const aw = part(grp, "box", mat(s.g[1], { roughness: .7 }), s.x1 - s.x0 + .5, .08, s.y1 - s.y0 + .8, cx, 2.45, cy); aw.rotation.x = s.y0 === 32 ? .12 : -.12;
      for (let k = 0; k < 6; k++) part(grp, "sph", [s.g[1], "#7ac943", "#ffd23a"][k % 3], .2, .18, .2, s.x0 + .7 + k * .7, 1.25, cy + (k % 2 ? .4 : -.4));
    }
    part(grp, "cone", "#ff9a3c", 2.2, 2, 2.2, 20, 2.3, 3);   // the mango pyramid
    for (let k = 0; k < 18; k++) part(grp, "sph", "#ffb238", .25, .25, .25, 18 + (k % 6) * .8, 1.6 + Math.floor(k / 6) * .4, 2 + (k % 3) * .7);
    // string lights over the aisles
    for (const y of [16, 30, 44]) for (let x = 2; x < WW; x += 1.6) part(grp, "sph", basic(["#ffd23a", "#ff6fb1", "#4fb8ff"][Math.round(x) % 3]), .08, .08, .08, x, 3.6 + Math.sin(x * .6) * .15, y);
  },
  onStart() {
    for (const s of MKT.stalls) { const back = s.y0 === 32 ? s.y0 + .9 : s.y1 - .9;
      addMover({ kind: "mkt_vendor", fixture: true, beh: "static", life: 1e9, x: (s.x0 + s.x1) / 2, y: back, ang: s.y0 === 32 ? Math.PI / 2 : -Math.PI / 2, r: .3, push: 0, scare: 0, air: true, h: 1.1, stall: s }); }
    MKT.t = 1; MKT.spill = null;
  },
  step() {
    if (MKT.spill && (phase === "show" || phase === "evac")) {   // the slippery aisle: anyone running through it may go down
      const S = MKT.spill; S.t -= DT; if (S.t <= 0) MKT.spill = null;
      else { if (Math.random() < .25) puff(S.x + rnd(-S.r, S.r), S.y + rnd(-.8, .8), .3, "#7fd3ff", .35, .8, .4);
        for (const a of ag) if (Math.abs(a.x - S.x) < S.r && Math.abs(a.y - S.y) < 1.4 && a.air <= 0 && Math.hypot(a.vx, a.vy) > .7 && Math.random() < .012) { toss(a, .35, .25); if (!demo && Math.random() < .2) pop(a.x, a.y - 1, ["WHOA!", "SLIPPERY!", "MY BACK!", "IT SMELLS LIKE TUNA!"][(Math.random() * 4) | 0]); } }
    }
    if (phase !== "show" || demo) return;
    MKT.t -= DT; if (MKT.t > 0) return; MKT.t = .45 + Math.random() * .5;
    const vs = movers.filter(m => m.kind === "mkt_vendor"), v = vs[(Math.random() * vs.length) | 0]; if (!v) return;
    let near = 0; for (const a of ag) if ((a.x - v.x) ** 2 + (a.y - v.y) ** 2 < 12) { near++; if (near > 2) break; }
    if (near > 2 || Math.random() < .2) pop(v.x, v.y - 1.4, MKT_YELLS[(Math.random() * MKT_YELLS.length) | 0]);
  },
  ev: {
    derrame() {   // the fish tank bursts: one aisle turns into an ice rink for twelve seconds
      const y = [17, 31, 45][(Math.random() * 3) | 0] - .4; MKT.spill = { x: 20, y, r: 14, t: 12 };
      for (let k = 0; k < 14; k++) puff(rnd(6, 34), y + rnd(-1, 1), .5, "#7fd3ff", .5, 1.4, .6);
      pop(20, y - 1.5, "SPLOOSH! WET FLOOR!"); caption("The fish tank burst: slippery aisle!", true, 2000); sfx("splash");
    },
    oferta() {
      const s = MKT.stalls[(Math.random() * MKT.stalls.length) | 0], x = (s.x0 + s.x1) / 2, y = s.y0 === 32 ? s.y1 + 1 : s.y0 - 1;
      tempAttract(x, y, 2.5, 6, .45); pop(x, y - 1.5, `${s.g[0]}: 90% OFF!`); sfx("jingle"); caption(`Flash deal at the ${s.g[0].toLowerCase()} stall!`, true, 2000);
    },
    frutas(side) {
      for (let n = 0; n < 12; n++) addMover({ kind: "mkt_fruit", beh: "bounce", x: rnd(8, 32), y: rnd(12, 15), vx: rnd(-3, 3), vy: rnd(2, 5), r: .3, push: 8, life: 9, col: ["#ff9a3c", "#ffd23a", "#7ac943", "#d8322b"][n % 4] });
      caption("The orange pyramid collapsed!", true, 1800); pop(20, 12, "AVALANCHE!");
    },
    gallinas(side) {
      for (let n = 0; n < 5; n++) addMover({ kind: "mkt_chicken", x: side ? -1 - n : WW + 1 + n, y: rnd(20, 56), pts: [crowdPoint(), crowdPoint(), [side ? WW + 3 : -3, rnd(20, 60)]], speed: 5, r: .25, push: 6, scare: 2.2, agile: true, small: true, say: n ? "" : "BAWK BAWK!", sayEvery: 1.4 });
      caption("The chickens got out!", true, 1600);
    },
    diablito(side) {
      const y = [17, 31, 45][(Math.random() * 3) | 0] - .4;
      addMover({ kind: "mkt_cart", x: side ? -2 : WW + 2, y, pts: [[side ? WW + 3 : -3, y]], speed: 3.4, r: .6, push: 35, scare: 2, say: "GOLPE AVISA!", sayEvery: 2 });
      caption("Hand truck coming through the aisle!", false, 1600);
    },
  },
  performers: () => [],
};
