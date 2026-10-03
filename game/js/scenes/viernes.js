// Human Tsunami · scene: Black Friday (mall-wide sales)
const SHOPS = [
  { y: 10, side: 0, name: "SOCK-O-RAMA", col: "#ff6fb1" }, { y: 22, side: 0, name: "EVERYTHING $10", col: "#ffd23a" },
  { y: 34, side: 0, name: "BATTERIES GALORE", col: "#7dff6a" }, { y: 46, side: 0, name: "PHONE CASES", col: "#4fd8ff" },
  { y: 10, side: 1, name: "TOASTERS PRO", col: "#ff9a3c" }, { y: 22, side: 1, name: "MATTRESSES NOW", col: "#a98bff" },
  { y: 34, side: 1, name: "BLENDERS 3000", col: "#ff3b2f" }, { y: 46, side: 1, name: "GAMER CHAIRS", col: "#3fb3c4" },
];
const SALES = ["SOCKS 2-FOR-1", "$1 TOASTERS", "BATTERIES 99% OFF", "FREE MATTRESSES", "TALKING BLENDERS", "CHAIRS AT PANIC PRICES"];
SCENES.viernes = {
  name: "Black Friday", tag: "90% off everything", outside: "#8f8a80", bulbH: 2.8, music: "lounge",
  light: { sky: 0xffffff, ground: 0x8a8278, hemi: .7, sun: 0xfff8ec, sunI: 1.0 }, crowd: 3000, fenceBudget: 60, maxGates: 5, guards: 4,
  gates: [F, F, T, F, T, F, F], noSlots: [0, 6], slotWhy: "There are shops there", unlock: 3,
  intro: "The mall doors are opening. Everyone came for the half-price giant TV, but every so often a flash sale pops up at some other store.",
  acts: ["Last few left!", "Today only!", "Grab two!", "Run, run, run!"],
  events: ["oferta", "oferta", "carrito", "abuela", "tubeman", "limpieza", "oferta"],
  goal: o => o.kind === "barrier", goalMaxY: 20,
  lines: {
    oferta: "A flash sale moved three thousand people in eleven seconds.",
    carrito: "A runaway shopping cart ran over several customers with great dignity.",
    abuela: "A grandma crossed the aisle using the spinning-elbow technique.",
    tubeman: "The inflatable tube man out-danced everyone.",
    limpieza: "Someone mopped in the middle of the chaos; there were forty artistic slips.",
  },
  quotes: ["“I only came in for batteries,” said a man who left with three TVs.", "“The price was incredible; everything else, not so much,” said one shopper.", "“We'll be back next year,” threatened the manager."],
  build() {
    for (const sh of SHOPS) rect(sh.side ? WW - 6 : 0, sh.y, sh.side ? WW : 6, sh.y + 10, "shop");
    rect(0, 0, 6, 10, "shop"); rect(WW - 6, 0, WW, 10, "shop"); rect(0, 56, 6, FENCE_Y, "shop"); rect(WW - 6, 56, WW, FENCE_Y, "shop");
    rect(9, 0, 31, 6, "megastore");
    seg(6, 7.6, WW - 6, 7.6, .4, "barrier");
    rect(17, 26, 23, 36, "escalator");
    circ(20, 50, 1.8, "fountain");
    rect(10, 42, 12.5, 44.5, "kiosk"); rect(27.5, 42, 30, 44.5, "kiosk");
  },
  ground(g) {
    g.fillStyle = "#e9e4da"; g.fillRect(0, 0, WW, WH);
    // checkerboard marble floor
    for (let y = 0, i = 0; y < FENCE_Y; y += 2, i++) for (let x = 6, j = 0; x < WW - 6; x += 2, j++) { g.fillStyle = (i + j) % 2 ? "#e2dccf" : "#f1ede5"; g.fillRect(x, y, 2, 2); }
    g.strokeStyle = "rgba(160,150,130,.25)"; g.lineWidth = .04; for (let x = 6; x <= WW - 6; x += 2) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, FENCE_Y); g.stroke(); }
    g.fillStyle = "#8f8a80"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
    g.fillStyle = "#ffffff"; for (let x = 2; x < WW; x += 4) g.fillRect(x, 69, 2.2, .3);
  },
  decor(g) {
    g.textAlign = "center"; g.textBaseline = "middle";
    const shop = (x0, y0, x1, y1, name, col) => {
      g.fillStyle = "#3a3d44"; g.fillRect(x0, y0, x1 - x0, y1 - y0);
      g.fillStyle = col; g.fillRect(x0 + .3, y0 + .3, x1 - x0 - .6, 1.2);
      g.save(); g.translate((x0 + x1) / 2 + (x0 < 10 ? -.6 : .6), (y0 + y1) / 2); g.rotate(Math.PI / 2);
      g.font = "900 .85px Rubik, sans-serif"; g.fillStyle = "#ffffff"; g.fillText(name, 0, 0); g.restore();
    };
    for (const sh of SHOPS) shop(sh.side ? WW - 6 : 0, sh.y, sh.side ? WW : 6, sh.y + 10, sh.name, sh.col);
    for (const [x0, y0, x1, y1] of [[0, 0, 6, 10], [WW - 6, 0, WW, 10], [0, 56, 6, FENCE_Y], [WW - 6, 56, WW, FENCE_Y]]) { g.fillStyle = "#4a4d55"; g.fillRect(x0, y0, x1 - x0, y1 - y0); }
    // the TV store
    g.fillStyle = "#151617"; g.fillRect(9, 0, 22, 6);
    for (let x = 10; x < 30; x += 3.4) { const gr = g.createLinearGradient(x, 0, x + 3, 0); gr.addColorStop(0, "#22d3ee"); gr.addColorStop(1, "#7a2cff"); g.fillStyle = gr; g.fillRect(x, .6, 3, 2); }
    g.fillStyle = "#ffd23a"; g.fillRect(9, 3.4, 22, 2.2);
    g.font = "900 1.5px Rubik, sans-serif"; g.fillStyle = "#d8322b"; g.fillText("MEGA SCREENS -50%", 20, 4.55);
    for (const o of obs) if (o.kind === "barrier") { g.lineWidth = .2; g.strokeStyle = "#d8322b"; g.setLineDash([.5, .5]); g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); g.setLineDash([]); }
    // escalator, fountain and kiosks
    g.fillStyle = "#9aa0a8"; g.fillRect(17, 26, 6, 10); g.fillStyle = "#5d6470"; for (let y = 26.4; y < 36; y += .5) g.fillRect(17.4, y, 5.2, .2);
    g.fillStyle = "#c9ced6"; g.beginPath(); g.arc(20, 50, 1.8, 0, 7); g.fill(); g.fillStyle = "#3fa9e0"; g.beginPath(); g.arc(20, 50, 1.4, 0, 7); g.fill();
    for (const o of obs) if (o.kind === "kiosk") { g.fillStyle = "#ff6fb1"; g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0); g.fillStyle = "#ffffff"; g.fillRect(o.x0 + .3, o.y0 + .3, o.x1 - o.x0 - .6, .5); }
    // hanging sale signs
    g.font = "900 1.1px Rubik, sans-serif";
    for (const [x, y, t] of [[13.5, 22, "EVERYTHING MUST GO!"], [26.5, 22, "90% OFF*"], [13.5, 50, "*ON SELECTED ITEMS"]]) {
      g.save(); g.translate(x, y); g.rotate(Math.PI / 2); g.fillStyle = "rgba(216,50,43,.9)"; g.fillRect(-7.5, -.8, 15, 1.6); g.fillStyle = "#ffffff"; g.fillText(t, 0, .05); g.restore(); }
  },
  bulbs: Array.from({ length: 22 }, (_, i) => [7 + i * 1.2, 7.2]),
  beams: [{ x: 12, y: 6, a: Math.PI / 2, sweep: .6, h: 7 }, { x: 28, y: 6, a: Math.PI / 2, sweep: .6, h: 7 }],
  extra3D(grp) {
    // potted palms in the aisle
    for (const [x, y] of [[8, 20], [32, 20], [8, 52], [32, 52]]) { part(grp, "cyl", "#c9ced6", .5, .6, .5, x, .3, y); part(grp, "cyl", "#6b4a2b", .08, 2, .08, x, 1.6, y); for (let k = 0; k < 6; k++) { const l = part(grp, "box", "#3d8a3a", 1.2, .05, .3, x + Math.cos(k) * .5, 2.6, y + Math.sin(k) * .5); l.rotation.y = k; l.rotation.z = -.4; } }
  },
  ev: {
    oferta() {
      const sh = pick(SHOPS), x = sh.side ? WW - 9.5 : 9.5, y = sh.y + 5;
      tempAttract(x, y, 4.2, 5.5);
      pop(x, y, "SALE!"); caption(`Flash sale: ${pick(SALES)}!`, true, 2400); flash = .6; cheerT = 1;
      addMover({ kind: "tubeman", beh: "static", x, y, life: 7, r: .4, push: 0, col: sh.col });
    },
    carrito() {
      for (let n = 0; n < 3; n++) addMover({ kind: "cart", beh: "bounce", x: rnd(10, 30), y: rnd(14, 24), vx: rnd(-4, 4), vy: rnd(2, 5), r: .6, push: 18, life: 12 });
      caption("Runaway shopping carts!", false, 1600);
    },
    abuela() {
      const [x, y] = crowdPoint(), gx = openGateX();
      addMover({ kind: "abuela", x: gx, y: SH + 1, pts: [[gx, 62], [x, y], [20, 12], [gx, 62], [gx, SH + 3]], speed: 1.6, r: .45, push: 45, scare: 1.4, say: "EXCUSE ME, YOUNG MAN!", sayEvery: 2.6 });
      caption("A grandma is coming for her blender", false, 1800);
    },
    tubeman() { const [x, y] = crowdPoint(); addMover({ kind: "tubeman", beh: "static", x, y, life: 12, r: .4, push: 0, scare: 1, col: pick(["#ff3b2f", "#7dff6a", "#4fd8ff"]) }); caption("Someone inflated a dancing tube man", false, 1500); },
    limpieza() {
      const y = rnd(20, 55), side = Math.random() < .5;
      addMover({ kind: "scrubber", x: side ? 7 : WW - 7, y, pts: [[side ? WW - 7 : 7, y]], speed: 1.6, r: .8, push: 20, say: "WET FLOOR!", sayEvery: 2.5 });
      slipT = 7; caption("Wet floor! Nobody can stop", true, 2000);
    },
  },
  performers: () => [],
};
