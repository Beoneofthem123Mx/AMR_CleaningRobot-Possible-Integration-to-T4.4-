// Human Tsunami · scene: The Circus
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

// ---------- the menagerie: fantasy animals, clowns on balls, jugglers who miss ----------
SCENE_MODELS.unicorn = (g, u, m) => {
  const c = "#fbf7ff";
  part(g, "sph", c, 1.05, .46, .42, 0, 1.4, 0);
  const nk = part(g, "cyl", c, .18, .9, .18, .95, 1.85, 0); nk.rotation.z = -.6;
  part(g, "sph", c, .36, .2, .17, 1.38, 2.15, 0); part(g, "sph", "#ffd1ea", .16, .13, .14, 1.68, 2.1, 0);
  toyEyes(g, 1.42, 2.25, .14, .07);
  const horn = part(g, "cone", mat("#ffd23a", { metalness: .5, roughness: .25 }), .07, .55, .07, 1.5, 2.55, 0); horn.rotation.z = -.5;
  ["#ff3b2f", "#ff9a3c", "#ffd23a", "#4fd86a", "#4fb8ff", "#a98bff"].forEach((col, i) => part(g, "box", col, .14, .14, .07, 1.15 - i * .12, 2.35 - i * .1, 0));   // rainbow mane
  for (const [x, z] of [[.75, .2], [.75, -.2], [-.75, .2], [-.75, -.2]]) { const lg = leg(g, x, 1.25, z, .11, 1.25, c); part(lg, "cyl", "#ffd23a", .13, .14, .13, 0, -1.2, 0); u.legs.push(lg); }
  u.tail = pivot(g, -1.05, 1.5, 0); ["#ff3b2f", "#ffd23a", "#4fb8ff"].forEach((col, i) => part(u.tail, "cyl", col, .06, .8, .06, 0, -.4, (i - 1) * .07));
  u.anim = (tt) => { g.children[0].position.y = 1.4 + Math.abs(Math.sin(tt * 7)) * .12; };
};
SCENE_MODELS.dragon = (g, u, m) => {
  const c = "#3fae5a", belly = "#e8d27a";
  part(g, "sph", c, 1.5, .8, .8, 0, 1.6, 0); part(g, "sph", belly, 1.1, .5, .55, .1, 1.35, 0);
  const nk = part(g, "cyl", c, .3, 1.2, .3, 1.3, 2.3, 0); nk.rotation.z = -.7;
  const head = pivot(g, 1.95, 2.85, 0); u.head = head;
  part(head, "sph", c, .55, .38, .4, 0, 0, 0); part(head, "sph", c, .4, .22, .3, .45, -.08, 0);
  for (const s of [-1, 1]) part(head, "cone", "#f4ecd8", .08, .35, .08, -.2, .35, s * .18).rotation.z = .5;
  toyEyes(head, .2, .15, .22, .12);
  for (let i = 0; i < 6; i++) part(g, "cone", "#d8322b", .14, .35, .14, .9 - i * .45, 2.4 - Math.abs(i - 1) * .06, 0);   // back spikes
  u.wings = [-1, 1].map(s => { const p = pivot(g, .1, 2.2, s * .6); const w = part(p, "box", mat("#2c7c43", { side: THREE.DoubleSide }), 1.4, .05, 1.7, 0, 0, s * .85); w.rotation.y = s * .2; return p; });
  for (const [x, z] of [[.8, .45], [.8, -.45], [-.8, .45], [-.8, -.45]]) u.legs.push(leg(g, x, 1, z, .22, 1, c));
  u.tail = pivot(g, -1.4, 1.5, 0); part(u.tail, "cone", c, .3, 2, .3, 0, -1, 0).rotation.z = .2;
};
SCENE_MODELS.griffin = (g, u, m) => {
  part(g, "sph", "#d9a04a", .9, .42, .4, 0, .9, 0);                                            // lion body
  part(g, "sph", "#f4f4f2", .42, .42, .4, .8, 1.3, 0);                                         // eagle head
  const bk = part(g, "cone", "#ffb23a", .12, .35, .12, 1.25, 1.25, 0); bk.rotation.z = -1.7;
  toyEyes(g, 1.05, 1.42, .16, .09);
  u.wings = [-1, 1].map(s => { const p = pivot(g, 0, 1.25, s * .35); part(p, "box", "#8a5a34", 1.1, .05, 1.8, 0, 0, s * .9); part(p, "box", "#f4f4f2", .5, .06, 1.6, .3, .02, s * .9); return p; });
  for (const [x, z] of [[.5, .2], [.5, -.2], [-.5, .2], [-.5, -.2]]) u.legs.push(leg(g, x, .75, z, .12, .75, x > 0 ? "#ffb23a" : "#c98f3e"));
  u.tail = pivot(g, -.9, 1, 0); part(u.tail, "cyl", "#c58c3c", .04, .9, .04, 0, -.45, 0);
};
SCENE_MODELS.monkey = (g, u, m) => {
  part(g, "sph", "#7a4a2a", .28, .3, .25, 0, .65, 0); part(g, "sph", "#7a4a2a", .24, .22, .22, .12, 1.05, 0); part(g, "sph", "#e3b48a", .14, .12, .16, .3, 1.0, 0);
  toyEyes(g, .28, 1.12, .09, .06);
  for (const s of [-1, 1]) part(g, "sph", "#e3b48a", .08, .1, .04, .05, 1.1, s * .25);
  part(g, "cyl", "#d8322b", .12, .14, .12, .1, 1.3, 0);   // tiny bellhop hat
  for (const s of [-1, 1]) u.legs.push(leg(g, 0, .45, s * .12, .06, .45, "#7a4a2a"));
  u.arms = [-1, 1].map(s => { const p = pivot(g, .05, .85, s * .24); part(p, "cyl", "#7a4a2a", .05, .55, .05, 0, -.27, 0); return p; });
  u.tail = pivot(g, -.25, .6, 0); part(u.tail, "cyl", "#7a4a2a", .03, .8, .03, 0, .4, 0);
  if (m.banana) part(g, "cone", "#ffd23a", .05, .25, .05, .35, .8, .25);
};
SCENE_MODELS.ballclown = (g, u, m) => {
  const ball = new THREE.Group(); g.add(ball); ball.position.y = .85; u.rollBall = ball;
  const cols = ["#d8322b", "#ffd23a", "#2f7fd6", "#f4ecd8"];
  for (let i = 0; i < 4; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(.85, 12, 10, i * Math.PI / 2, Math.PI / 2), mat(cols[i])); s.castShadow = true; ball.add(s); }
  const b = pivot(g, 0, 1.6, 0); u.body = b;
  for (const s of [-1, 1]) leg(b, 0, .1, s * .12, .085, .5, "#2f7fd6");
  part(b, "sph", m.col || "#ff6fb1", .27, .4, .3, 0, .45, 0);
  part(b, "sph", "#fbe9d7", .21, .21, .21, .02, 1.0, 0); part(b, "sph", "#ff3b2f", .07, .07, .07, .24, .98, 0);
  for (const s of [-1, 1]) { part(b, "sph", "#111214", .034, .042, .034, .21, 1.05, s * .075); part(b, "sph", "#ff5a3c", .13, .13, .13, -.02, 1.07, s * .19); }
  part(b, "cone", "#ffd23a", .12, .4, .12, 0, 1.36, 0);
  u.arms = [-1, 1].map(s => { const p = pivot(b, 0, .7, s * .28); part(p, "cyl", m.col || "#ff6fb1", .045, .52, .045, 0, -.26, 0); return p; });
  u.anim = (tt, mm) => {
    ball.rotation.z = -(mm.roll || 0); const w = Math.sin(tt * 5 + mm.x) * .22 + Math.sin(tt * 11.3) * .07;
    b.rotation.x = w; b.rotation.z = Math.sin(tt * 3.7 + mm.y) * .15; b.position.y = 1.6 + Math.abs(Math.sin(tt * 6)) * .05;
    u.arms.forEach((p, i) => { p.rotation.x = (i ? 1 : -1) * (1.3 + Math.sin(tt * 9 + i) * .5); });   // pinwheeling for balance
  };
};
SCENE_PERSONS.circo_juggler = { body: "#a98bff", legs: "#ffd23a", hat: "cap", hatCol: "#d8322b",
  extra(g, u, b) { for (const s of [-1, 1]) part(b, "sph", "#ff5a3c", .12, .12, .12, -.02, 1.68, s * .19); part(b, "sph", "#ff3b2f", .07, .07, .07, .3, 1.6, 0);
    u.pins = [0, 1, 2].map(i => { const p = pivot(g, 0, 0, 0); part(p, "cyl", ["#ffffff", "#d8322b", "#ffd23a"][i], .05, .4, .05, 0, 0, 0); return p; });
    u.anim = (tt, m) => { u.pins.forEach((p, i) => { const a = tt * 9 + i * 2.1, k = m.falling ? 1.8 : .5; p.position.set(Math.cos(a) * k, 2.2 + Math.sin(a * 1.3) * k, Math.sin(a) * k); p.rotation.set(a, a * 1.4, 0); }); }; } };

// someone or something drops out of the sky onto the crowd
function circoSplat(x, y, r, say) {
  pop(x, y - 1, say); shake = Math.min(1.2, shake + .5); sfx("boom");
  for (const a of ag) { const dx = a.x - x, dy = a.y - y, d = Math.hypot(dx, dy); if (d < r && d > .01) { toss(a, 1 + (1 - d / r) * 1.8, .9); a.vx += dx / d * 2.2; a.vy += dy / d * 2.2; a.p += .9; } }
  for (let k = 0; k < 8; k++) puff(x + rnd(-1, 1), y + rnd(-1, 1), .3, "#e8d3a2", .5, 1.4, .5);
}
Object.assign(SCENES.circo, {
  events: ["lion", "elephants", "clowncar", "unicorn", "cannon", "ballclowns", "jugglers", "dragon", "monkeys", "griffin", "balls", "cannon", "unicycles", "jugglers", "ballclowns"],
  ev: {
    cannon() {   // the human cannonball, aimed straight into the audience, in volleys
      const n = 1 + ((Math.random() * 3) | 0);
      for (let k = 0; k < n; k++) later(k * 1.1, () => {
        const [tx, ty] = crowdPoint();
        for (let j = 0; j < 6; j++) puff(34.8 - .8 - j * .3, 7.6 + .8 + j * .3, 1.6, "#cfcac0", .6, 1.2, .8);
        pop(34.8, 6.4, ["BOOM!", "KA-BLAM!", "FIRE!"][k % 3]); sfx("boom"); shake = Math.min(1, shake + .35);
        addMover({ kind: "flyer", beh: "fly", x: 34.8, y: 7.6, sx: 34.8, sy: 7.6, tx, ty, dur: 1.5 + Math.random() * .6, r: .4, push: 0, air: true, say: ["WHOOOSH!", "INCOMIIING!", "MY CAPE!"][k % 3], sayEvery: 9 });
      });
      caption(n > 1 ? "Human cannonball volley!" : "The human cannonball!", true, 1900);
    },
    unicorn(side) {
      const p1 = crowdPoint(), p2 = crowdPoint();
      addMover({ kind: "unicorn", x: side ? -2 : WW + 2, y: rnd(30, 55), pts: [p1, p2, [side ? WW + 4 : -4, rnd(25, 60)]], speed: 4.6, r: 1, push: 35, scare: 3, say: "NEIGH-BOW!", sayEvery: 2.2,
        tick(m) { if (Math.random() < .35) puff(m.x - Math.cos(m.ang), m.y - Math.sin(m.ang), 1.2, ["#ff6fb1", "#ffd23a", "#4fb8ff", "#7dff6a", "#a98bff"][(Math.random() * 5) | 0], .35, 1.6, .3); } });
      caption("A unicorn?! In THIS economy?", true, 2000);
    },
    dragon(side) {
      const y = rnd(36, 52);
      addMover({ kind: "dragon", x: side ? -4 : WW + 4, y, pts: [[20 + rnd(-6, 6), y + rnd(-5, 5)], [side ? WW + 6 : -6, y + rnd(-6, 6)]], speed: 2.4, r: 1.6, push: 55, scare: 5, say: "RAWRRR!", sayEvery: 2.4,
        tick(m) {   // sneezes fire every so often: people jump out of the way, a few get toasted hair
          m.fire = (m.fire || 2) - DT; if (m.fire > 0) return; m.fire = 2.6 + Math.random() * 1.5;
          const fx = m.x + Math.cos(m.ang) * 3, fy = m.y + Math.sin(m.ang) * 3;
          for (let k = 0; k < 14; k++) puff(m.x + Math.cos(m.ang) * (2 + k * .25), m.y + Math.sin(m.ang) * (2 + k * .25), 2.6 - k * .08, ["#ff3b2f", "#ff9a3c", "#ffd23a"][k % 3], .4 + k * .04, .8, .2);
          for (const a of ag) { const dx = a.x - fx, dy = a.y - fy, d = Math.hypot(dx, dy); if (d < 2.4 && d > .01) { a.vx += dx / d * 3; a.vy += dy / d * 3; a.p += .5; if (Math.random() < .25) toss(a, 1.2, .8); } }
          pop(fx, fy - 1, ["HOT HOT HOT!", "MY EYEBROWS!", "ACHOO! *FIRE*"][(Math.random() * 3) | 0]);
        } });
      caption("Here be dragons (it's friendly, mostly)", true, 2200);
    },
    griffin(side) {
      const [tx, ty] = crowdPoint();
      addMover({ kind: "griffin", air: true, h: 6, x: side ? -4 : WW + 4, y: rnd(20, 40), pts: [[tx, ty], [side ? WW + 6 : -6, rnd(20, 60)]], speed: 5, r: .9, push: 0, scare: 0, say: "SKREEEE!", sayEvery: 2,
        tick(m) {   // dives at a hat, snatches somebody and drops them a bit further on
          const [px, py] = m.pts[0], d = Math.hypot(px - m.x, py - m.y);
          if (m.i === 0) m.h = Math.max(1.2, Math.min(6, d * .5));
          else { m.h = Math.min(7, m.h + DT * 3); if (!m.dropped && m.t > (m.grabT || 0) + 1.2 && m.grabT) { m.dropped = true; const a = ag[(Math.random() * ag.length) | 0]; if (a) { toss(a, 3.2, 1.3); pop(a.x, a.y - 1, "PUT ME DOWN!"); } } }
          if (m.i === 1 && !m.grabT) { m.grabT = m.t; pop(m.x, m.y - 1.5, "YOINK!"); }
        } });
      caption("A griffin is circling the audience", false, 1900);
    },
    monkeys(side) {
      for (let n = 0; n < 5; n++) {
        const pts = [crowdPoint(), crowdPoint(), crowdPoint(), [side ? -3 : WW + 3, rnd(20, 60)]];
        addMover({ kind: "monkey", x: 20 + rnd(-2, 2), y: 6 + n * .3, pts: [[20, 19], ...pts], speed: 5.4, r: .3, push: 10, scare: 1.4, agile: true, small: true, banana: n % 2 === 0, say: n ? "" : "OOK OOK!", sayEvery: 1.5,
          tick(m) { if (Math.random() < .004) pop(m.x, m.y - 1, ["MY WALLET!", "BANANA TAX", "OOK!", "HE TOOK MY HAT!"][(Math.random() * 4) | 0]); } });
      }
      caption("The monkeys escaped (with the snacks)", true, 1900);
    },
    ballclowns(side) {
      for (let n = 0; n < 3; n++) {
        const y0 = rnd(26, 58), pts = [crowdPoint(), crowdPoint(), [side ? WW + 3 : -3, rnd(26, 60)]];
        addMover({ kind: "ballclown", x: side ? -2 - n * 2.5 : WW + 2 + n * 2.5, y: y0, pts, speed: 2.2, r: .85, push: 28, scare: 1.4, col: ["#ff6fb1", "#4fd86a", "#a98bff"][n], say: n ? "" : "WOBBLE WOBBLE!", sayEvery: 2.4,
          tick(m) { m.roll = (m.roll || 0) + m.speed * DT / .85;
            if (!m.fell && Math.random() < .0025) { m.fell = true; pop(m.x, m.y - 1.6, "WHOOPS!"); later(.3, () => { for (const a of ag) { const d = Math.hypot(a.x - m.x, a.y - m.y); if (d < 1.6) toss(a, 1.4, .8); } }); } } });
      }
      caption("Clowns balancing on giant balls!", false, 1900);
    },
    jugglers() {   // a trapeze act of jugglers loses its grip: they rain down on the audience
      const n = 2 + ((Math.random() * 3) | 0);
      for (let k = 0; k < n; k++) later(k * .7, () => {
        const [x, y] = crowdPoint();
        addMover({ kind: "circo_juggler", air: true, h: 14, x, y, pts: [[x + 40, y]], speed: .02, r: .4, push: 0, scare: 0, say: "OOPS!", sayEvery: 9, falling: true, vh: 0,
          tick(m) { m.vh -= 14 * DT; m.h += m.vh * DT; if (m.h <= 0) { m.dead = true; circoSplat(m.x, m.y, 2.2, ["SPLAT!", "TA-DA?", "NAILED IT", "OUCH!"][(Math.random() * 4) | 0]); } } });
      });
      caption("The jugglers missed the trick...", true, 2000);
    },
  },
});
SCENES.circo.lines = Object.assign(SCENES.circo.lines || {}, {
  unicorn: "A unicorn trotted through the stands leaving a rainbow and several confused accountants.",
  dragon: "The dragon sneezed twice; the popcorn is now pre-heated.",
  griffin: "A griffin carried one fan two rows forward. He calls it an upgrade.",
  monkeys: "Five monkeys in bellhop hats confiscated the snacks of section C.",
  ballclowns: "Clowns on giant balls rolled over the audience with total confidence and no brakes.",
  jugglers: "The flying jugglers dropped the trick, the pins and then themselves.",
  cannon: "The human cannonball landed in row 14, as planned (nobody planned it).",
});
