// Human Tide · scene: The Circus
SCENES.circo = {
  name: "The Circus", tag: "Gala performance", outside: "#79a25a", bulbH: .95,
  light: { sky: 0xffd9a8, ground: 0x6a4a2a, hemi: .5, sun: 0xffd9a0, sunI: 1.1 }, crowd: 2800,
  extra3D(grp) {
    const gr = pivot(grp, 34.8, 1.5, 7.6); gr.rotation.y = 2.35;
    const b = part(gr, "cyl", mat("#2a2b2d", { metalness: .6, roughness: .3 }), .5, 3.4, .5, 1.1, .7, 0); b.rotation.z = -1.05;
    const rim = part(gr, "cyl", "#d8322b", .58, .4, .58, 2.55, 1.55, 0); rim.rotation.z = -1.05;
    for (const s of [-1, 1]) { const w = part(gr, "cyl", "#151617", .6, .2, .6, 0, .6, s * .7); w.rotation.x = Math.PI / 2; }
  }, fenceBudget: 70, maxGates: 5, gates: [F, T, F, F, F, T, F],
  intro: "Gala show under the big top. The animals don't always stay in the ring: lions, elephants, the clown car and the human cannonball.",
  acts: ["Ta-da!", "Applause!", "The grand finale!", "Louder!"],
  events: ["lion", "elephants", "clowncar", "balls", "cannon", "unicycles", "lion", "cannon"],
  goal: o => o.kind === "curb", goalMaxY: FENCE_Y,
  build() {
    rect(0, 0, 1.4, FENCE_Y, "canvas"); rect(WW - 1.4, 0, WW, FENCE_Y, "canvas"); rect(0, 0, WW, 1.4, "canvas");
    rect(11, 1.4, 29, 5, "curtain");
    seg(17, 5, 17, 18.3, .5, "wall"); seg(23, 5, 23, 18.3, .5, "wall");
    ringSegs(PISTA.x, PISTA.y, PISTA.r, 24, "curb", (x, y) => y < PISTA.y && Math.abs(x - PISTA.x) < 3.2);
    circ(7, 25, .6, "pole"); circ(33, 25, .6, "pole"); circ(20, 45, .6, "pole");
    rect(3, 51, 7, 54.5, "popcorn"); rect(33, 51, 37, 54.5, "candy");
    rect(32.5, 5.5, 37.2, 9.5, "cannon");
  },
  ground(g) {
    g.fillStyle = "#d4bc8a"; g.fillRect(0, 0, WW, FENCE_Y);
    g.fillStyle = "#79a25a"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
    const rand = rng(11);
    for (let k = 0; k < 2600; k++) { g.fillStyle = k % 3 ? "rgba(120,86,40,.18)" : "rgba(255,245,215,.35)"; g.fillRect(rand() * WW, rand() * FENCE_Y, .12, .07); }
    for (let k = 0; k < 900; k++) { g.fillStyle = k % 2 ? "rgba(40,80,30,.25)" : "rgba(170,210,120,.3)"; g.fillRect(rand() * WW, FENCE_Y + rand() * (WH - FENCE_Y), .08, .2); }
    g.fillStyle = "#c9b38a"; g.fillRect(0, 69, WW, 1.6);
    const conf = ["#ff6fb1", "#5fd8ff", "#ffe066", "#a98bff", "#ffffff"];
    for (let k = 0; k < 700; k++) { g.fillStyle = conf[k % conf.length]; g.globalAlpha = .6; g.fillRect(rand() * WW, rand() * FENCE_Y, .09, .09); }
    g.globalAlpha = 1;
  },
  decor(g) {
    // red-and-white striped big-top canvas
    const stripes = (x0, y0, x1, y1, vertical) => {
      g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
      for (let s = 0, i = 0; s < (vertical ? y1 - y0 : x1 - x0); s += 1.2, i++) {
        g.fillStyle = i % 2 ? "#f3e7cf" : "#cf2f2c";
        if (vertical) g.fillRect(x0, y0 + s, x1 - x0, 1.2); else g.fillRect(x0 + s, y0, 1.2, y1 - y0);
      }
      g.restore();
    };
    stripes(0, 0, 1.4, FENCE_Y, true); stripes(WW - 1.4, 0, WW, FENCE_Y, true); stripes(0, 0, WW, 1.4, false);
    g.fillStyle = "#e3b23c"; g.fillRect(1.4, 1.4, WW - 2.8, .15); g.fillRect(1.4, 1.4, .15, FENCE_Y - 1.4); g.fillRect(WW - 1.55, 1.4, .15, FENCE_Y - 1.4);
    // curtain and performers' walkway
    g.fillStyle = "#8f1b24"; g.fillRect(11, 1.4, 18, 3.6);
    g.strokeStyle = "rgba(255,255,255,.12)"; g.lineWidth = .12;
    for (let x = 11.6; x < 29; x += .9) { g.beginPath(); g.moveTo(x, 1.5); g.lineTo(x, 5); g.stroke(); }
    g.fillStyle = "#e3b23c"; g.fillRect(11, 1.4, 18, .35); g.fillRect(11, 4.7, 18, .3);
    g.font = "900 2.1px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#f5d36b"; g.fillText("CIRCUS", 20, 3.25);
    g.fillStyle = "#c4aa77"; g.fillRect(17, 5, 6, 13.5);
    g.fillStyle = "#b2232c"; g.fillRect(19, 5, 2, 13.5);
    for (const o of obs) if (o.kind === "wall") { g.lineCap = "square"; g.lineWidth = o.th; g.strokeStyle = "#5b2a1c"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
    // ring
    g.fillStyle = "#e8d3a2"; g.beginPath(); g.arc(PISTA.x, PISTA.y, PISTA.r, 0, 7); g.fill();
    g.strokeStyle = "rgba(150,110,60,.18)"; g.lineWidth = .1;
    for (let r = 1.5; r < PISTA.r; r += 1.5) { g.beginPath(); g.arc(PISTA.x, PISTA.y, r, 0, 7); g.stroke(); }
    g.fillStyle = "#e3b23c"; g.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? .7 : 1.6; g.lineTo(PISTA.x + Math.cos(a) * r, PISTA.y + Math.sin(a) * r); }
    g.fill();
    for (const o of obs) if (o.kind === "curb") {
      g.lineCap = "butt"; g.lineWidth = .62; g.strokeStyle = o.alt ? "#f4ecd8" : "#c8282a";
      g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke();
    }
    // tent poles
    for (const o of obs) if (o.kind === "pole") {
      g.fillStyle = "#4a3426"; g.beginPath(); g.arc(o.x, o.y, o.r, 0, 7); g.fill();
      g.strokeStyle = "#c9a14a"; g.lineWidth = .15; g.beginPath(); g.arc(o.x, o.y, o.r * .7, 0, 7); g.stroke();
    }
    // popcorn and cotton candy stands
    const stand = (o, a, b, top) => {
      for (let x = o.x0, i = 0; x < o.x1; x += .5, i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(x, o.y0, .5, o.y1 - o.y0); }
      g.fillStyle = top; g.beginPath(); g.arc((o.x0 + o.x1) / 2, (o.y0 + o.y1) / 2, .9, 0, 7); g.fill();
    };
    for (const o of obs) if (o.kind === "popcorn") stand(o, "#d8322b", "#fbf4e4", "#f5d36b");
    for (const o of obs) if (o.kind === "candy") stand(o, "#ff8fc6", "#fbf4e4", "#ffd1ea");
    // human cannonball cannon
    for (const o of obs) if (o.kind === "cannon") {
      g.fillStyle = "#3b5d8f"; g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0);
      g.fillStyle = "#e3b23c"; for (let x = o.x0 + .3; x < o.x1; x += .9) g.fillRect(x, o.y0 + .15, .4, .4);
      g.save(); g.translate(34.8, 7.6); g.rotate(2.35);
      g.fillStyle = "#2a2b2d"; g.fillRect(-.5, -.55, 3.4, 1.1); g.fillStyle = "#d8322b"; g.fillRect(2.4, -.62, .5, 1.24);
      g.restore();
      g.fillStyle = "#151617"; g.beginPath(); g.arc(34.2, 6.6, .55, 0, 7); g.arc(35.6, 8.6, .55, 0, 7); g.fill();
    }
    // bunting over the entrance
    for (let x = 1, i = 0; x < WW - 1; x += 1.1, i++) {
      g.fillStyle = ["#d8322b", "#e3b23c", "#2f7fd6", "#3d9a5b"][i % 4];
      g.beginPath(); g.moveTo(x, FENCE_Y - 1.8); g.lineTo(x + .9, FENCE_Y - 1.8); g.lineTo(x + .45, FENCE_Y - 1.1); g.fill();
    }
  },
  bulbs: Array.from({ length: 24 }, (_, i) => { const a = i / 24 * Math.PI * 2; return [PISTA.x + Math.cos(a) * (PISTA.r + .55), PISTA.y + Math.sin(a) * (PISTA.r + .55)]; }),
  beams: [{ x: 7, y: 25, a: 0, sweep: .5, h: 12 }, { x: 33, y: 25, a: Math.PI, sweep: .5, h: 12 }, { x: 20, y: 5, a: Math.PI / 2, sweep: .45, h: 9 },
          { x: 2, y: 62, a: -Math.PI / 3, sweep: .4, h: 8 }, { x: 38, y: 62, a: -2 * Math.PI / 3, sweep: .4, h: 8 }],
  performers: () => [
    { kind: "elephant", orbit: [PISTA.x, PISTA.y, 4.4, .2, 0], x: 0, y: 0, ang: 0, t: 0 },
    { kind: "horse", orbit: [PISTA.x, PISTA.y, 6, -.42, 0], x: 0, y: 0, ang: 0, t: 0, col: "#f2efe9" },
    { kind: "horse", orbit: [PISTA.x, PISTA.y, 6, -.42, Math.PI], x: 0, y: 0, ang: 0, t: 0, col: "#8a5a34" },
    { kind: "juggler", orbit: [PISTA.x, PISTA.y + 1.5, .01, 0, 0], x: 0, y: 0, ang: 0, t: 0 },
  ],
};
