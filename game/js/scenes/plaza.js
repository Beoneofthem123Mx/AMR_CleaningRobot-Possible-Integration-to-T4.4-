// Human Tide · scene: The Plaza
SCENES.plaza = {
  name: "The Plaza", tag: "Free concert", outside: "#b3b4af", bulbH: 1.95,
  light: { sky: 0xdfe8f2, ground: 0x6f6a60, hemi: .55, sun: 0xfff1dc, sunI: 1.25 }, crowd: 3200, fenceBudget: 60, maxGates: 5, gates: [F, F, T, F, T, F, F],
  intro: "Free concert in the plaza today. Also passing through the plaza: cars, dogs and giant beach balls.",
  acts: ["They're playing the hit!", "Everybody to the front!", "Drop the bass!", "Shoving time!"],
  events: ["car", "dogs", "beachballs", "icecream", "car", "dogs"],
  goal: o => o.kind === "barrier", goalMaxY: 30,
  build() {
    rect(6, 0, 34, 11, "stage");
    rect(2.6, 7.4, 4.8, 9.6, "speaker"); rect(35.2, 7.4, 37.4, 9.6, "speaker");
    rect(18.6, 11, 21.4, 18.5, "catwalk");
    circ(RING.x, RING.y, 3.2, "platform");
    seg(0, 12.6, 17, 12.6, .5, "barrier"); seg(23, 12.6, WW, 12.6, .5, "barrier");
    seg(17, 12.6, 17, 18.4, .5, "barrier"); seg(23, 12.6, 23, 18.4, .5, "barrier");
    ringSegs(RING.x, RING.y, RING.r, 12, "barrier", (x, y) => y < RING.y - 2.5 && Math.abs(x - RING.x) < 3);
    rect(17.5, 39.5, 22.5, 44.5, "tent");
    rect(2.5, 52, 5.5, 55, "booth");
    rect(34.5, 52, 37.5, 55, "aid");
  },
  ground(g, px) {
    g.fillStyle = "#bdbdb8"; g.fillRect(0, 0, WW, WH);
    g.fillStyle = "#b3b4af"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
    g.lineWidth = px; g.strokeStyle = "rgba(255,255,255,.14)"; g.beginPath();
    for (let x = 0; x <= WW; x += 1) { g.moveTo(x, 0); g.lineTo(x, WH); }
    for (let y = 0; y <= WH; y += 1) { g.moveTo(0, y); g.lineTo(WW, y); }
    g.stroke();
    g.strokeStyle = "rgba(0,0,0,.07)"; g.beginPath();
    for (let x = 0; x <= WW; x += 4) { g.moveTo(x, 0); g.lineTo(x, WH); }
    for (let y = 0; y <= WH; y += 4) { g.moveTo(0, y); g.lineTo(WW, y); }
    g.stroke();
    const rand = rng(7), conf = ["#ff9ec7", "#9be7ff", "#ffe48a", "#b9a6ff", "#ffb38a", "#ffffff"];
    for (let k = 0; k < 1400; k++) { g.fillStyle = conf[k % conf.length]; g.globalAlpha = .55; g.fillRect(rand() * WW, rand() * WH, .09, .09); }
    g.globalAlpha = 1;
    hazardLine(g, 20, 26.3, 20, 37, .18); hazardLine(g, 0, 50, 13, 50, .18); hazardLine(g, 27, 48.5, WW, 48.5, .18);
  },
  decor(g) {
    g.fillStyle = "#dcdcd8"; g.fillRect(6, 0, 28, 11);
    g.strokeStyle = "#3a3c3e"; g.lineWidth = .14; g.strokeRect(6.4, .4, 27.2, 10.2);
    g.setLineDash([.25, .25]); g.lineWidth = .3;
    for (const y of [1.6, 6.3, 10.1]) { g.beginPath(); g.moveTo(6.6, y); g.lineTo(33.4, y); g.stroke(); }
    g.setLineDash([]);
    g.lineWidth = .08; g.strokeStyle = "rgba(0,0,0,.25)";
    for (const x of [12, 20, 28]) { g.beginPath(); g.moveTo(x, .4); g.lineTo(x, 10.6); g.stroke(); }
    g.fillStyle = "#2a2b2d";
    [[8, 2.6, 3, 1.4], [12.6, 3.4, 1.2, .6], [24.6, 3.4, 1.2, .6], [28.6, 2.8, 1.4, .8], [9, 7.6, 1, .5], [30, 7.6, 1, .5], [14, 8, .8, .5], [25, 8, .8, .5]].forEach(([x, y, w, h]) => g.fillRect(x, y, w, h));
    g.fillStyle = "#5a3b1f"; g.fillRect(18.6, 3, 2.8, 2.2);
    g.fillStyle = "#c7883a"; for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) if ((i + j) % 2) g.fillRect(18.7 + i * .65, 3.1 + j * .65, .55, .55);
    g.fillStyle = "#151617";
    for (const o of obs) if (o.kind === "speaker") { g.fillRect(o.x0, o.y0, (o.x1 - o.x0) / 2 - .05, o.y1 - o.y0); g.fillRect(o.x0 + (o.x1 - o.x0) / 2 + .05, o.y0 + .5, (o.x1 - o.x0) / 2 - .05, o.y1 - o.y0 - .5); }
    g.fillStyle = "#d4d4d0"; g.fillRect(18.6, 11, 2.8, 8);
    g.fillStyle = "#ececea"; g.beginPath(); g.arc(RING.x, RING.y, 3.2, 0, 7); g.fill();
    g.strokeStyle = "#2f3133"; g.lineWidth = .4; g.beginPath(); g.arc(RING.x, RING.y, 1.6, 0, 7); g.stroke();
    for (const o of obs) if (o.kind === "barrier") {
      g.lineCap = "square"; g.lineWidth = o.th; g.strokeStyle = "#26282a"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke();
      g.lineWidth = o.th * .3; g.strokeStyle = "#4a4d50"; g.stroke();
    }
    g.fillStyle = "#ebebe8"; g.fillRect(17.5, 39.5, 5, 5);
    g.fillStyle = "#d7d7d3"; g.beginPath(); g.moveTo(22.5, 39.5); g.lineTo(22.5, 44.5); g.lineTo(20, 42); g.fill();
    g.fillStyle = "#cfcfcb"; g.beginPath(); g.moveTo(17.5, 44.5); g.lineTo(22.5, 44.5); g.lineTo(20, 42); g.fill();
    g.fillStyle = "#2f7fd6"; g.fillRect(2.5, 52, 3, 3); g.strokeStyle = "#215da0"; g.lineWidth = .15; g.strokeRect(2.6, 52.1, 2.8, 2.8);
    g.fillStyle = "#f2f2ef"; g.fillRect(34.5, 52, 3, 3);
    g.fillStyle = "#d8322b"; g.fillRect(35.75, 52.6, .5, 1.8); g.fillRect(35.1, 53.25, 1.8, .5);
  },
  bulbs: Array.from({ length: 14 }, (_, i) => [7 + i * 2, 11.25]),
  beams: Array.from({ length: 6 }, (_, i) => ({ x: 8 + i * 4.8, y: 11, a: Math.PI / 2, sweep: .65 })),
  performers: () => [],
};
