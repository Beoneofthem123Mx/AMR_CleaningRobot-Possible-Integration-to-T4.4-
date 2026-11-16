// Human Tsunami · scene: The Racetrack (Grand Prix)
// The track crosses the venue from side to side; the crowd presses against the rail to watch the race.
const TRACK_Y = 12.6;
const HIPO = { gap: 0, gx: 20, t: 0 };   // track invasion: a gap in the rail while people are on the track
// odd racers (they run in the races next to the horses)
SCENE_MODELS.hip_horseman = (g, u) => {   // a human running, with a horse sitting on their shoulders
  for (const s of [-1, 1]) { const lg = leg(g, 0, 1.0, s * .14, .09, 1, "#2b2f35"); part(lg, "box", "#f4f4f0", .22, .1, .12, .06, -1, 0); u.legs.push(lg); }
  part(g, "sph", "#d8322b", .3, .45, .3, 0, 1.45, 0); part(g, "sph", "#e0ac84", .2, .2, .2, .05, 2.0, 0); toyEyes(g, .2, 2.05, .1, .05);
  const c = "#8a5a34"; part(g, "sph", c, .7, .3, .28, -.05, 2.55, 0); const nk = part(g, "cyl", c, .12, .55, .12, .55, 2.85, 0); nk.rotation.z = -.6;
  part(g, "sph", c, .24, .14, .12, .82, 3.05, 0); toyEyes(g, .9, 3.12, .1, .05);
  for (const [x, z] of [[.4, .18], [.4, -.18], [-.45, .18], [-.45, -.18]]) { const l = part(g, "cyl", c, .07, .6, .07, x, 2.2, z); l.rotation.z = x > 0 ? -.4 : .4; }
  part(g, "box", "#d8322b", .3, .05, .4, -.05, 2.86, 0);   // the horse even wears racing silks
};
SCENE_MODELS.hip_pig = (g, u) => {   // a pig chasing a banana hung from a stick strapped to its own back
  const pk = "#f4a6b8"; part(g, "sph", pk, .6, .4, .42, 0, .65, 0); part(g, "sph", pk, .3, .28, .28, .6, .78, 0); part(g, "cyl", "#e88aa2", .12, .1, .12, .86, .74, 0).rotation.z = Math.PI / 2;
  toyEyes(g, .8, .9, .12, .05); for (const s of [-1, 1]) part(g, "cone", pk, .07, .16, .07, .55, 1.05, s * .14);
  for (const [x, z] of [[.35, .2], [.35, -.2], [-.35, .2], [-.35, -.2]]) { const lg = leg(g, x, .45, z, .07, .45, pk); u.legs.push(lg); }
  const st = part(g, "cyl", "#8a6a44", .025, 1.6, .025, .55, 1.35, 0); st.rotation.z = -1.05;
  part(g, "cyl", "#f4f4f0", .008, .45, .008, 1.25, 1.55, 0);
  const b = pivot(g, 1.25, 1.3, 0); u.banana = b; const p1 = part(b, "sph", "#ffd23a", .06, .2, .06, 0, 0, 0); p1.rotation.z = .5; part(b, "sph", "#6b4a2b", .03, .03, .03, -.08, .17, 0);
  part(g, "box", "#2f7fd6", .5, .06, .5, 0, 1.05, 0);   // a tiny saddle, nobody on it
  u.anim = tt => { if (u.banana) u.banana.rotation.z = Math.sin(tt * 9) * .5; };
};
SCENE_MODELS.hip_ostrich = (g, u) => {   // grandma on an ostrich
  part(g, "sph", "#2b2d33", .6, .45, .45, 0, 1.6, 0); part(g, "sph", "#f4f4f0", .25, .2, .3, -.55, 1.7, 0);
  const nk = part(g, "cyl", "#e8c8b8", .07, 1.1, .07, .55, 2.25, 0); nk.rotation.z = -.35; part(g, "sph", "#e8c8b8", .16, .14, .14, .78, 2.8, 0); part(g, "cone", "#ff9a3c", .05, .18, .05, .95, 2.78, 0).rotation.z = -Math.PI / 2; toyEyes(g, .85, 2.86, .1, .045);
  for (const s of [-1, 1]) { const lg = leg(g, 0, 1.3, s * .18, .06, 1.3, "#e8c8b8"); u.legs.push(lg); }
  part(g, "sph", "#a98bff", .25, .3, .25, -.1, 2.25, 0); part(g, "sph", "#e0ac84", .17, .17, .17, -.05, 2.65, 0); part(g, "sph", "#f4f4f0", .2, .14, .2, -.1, 2.78, 0); toyEyes(g, .09, 2.68, .09, .04);
  part(g, "cyl", "#8a6a44", .02, .6, .02, .25, 2.5, .2).rotation.z = -.8;   // waving her walking stick
};
SCENE_MODELS.hip_panto = (g, u) => {   // a two-person horse costume: four sneakers, cheap head, googly eyes
  const c = "#c8a27a"; part(g, "sph", c, .95, .42, .38, 0, 1.25, 0); part(g, "box", "#7a5a3a", .05, .5, .78, 0, 1.25, 0);
  const hd = pivot(g, .9, 1.6, 0); u.head = hd; part(hd, "sph", c, .32, .24, .22, .15, .1, 0); for (const s of [-1, 1]) { part(hd, "sph", "#ffffff", .1, .1, .1, .32, .26, s * .1); part(hd, "sph", "#111214", .045, .045, .045, .4, .26, s * .1); }
  for (const [x, z] of [[.55, .17], [.55, -.17], [-.55, .17], [-.55, -.17]]) { const lg = leg(g, x, 1, z, .1, 1, "#2f5fb0"); part(lg, "box", ["#f4f4f0", "#d8322b"][x > 0 ? 0 : 1], .26, .1, .14, .07, -1, 0); u.legs.push(lg); }
  u.anim = tt => { if (u.head) u.head.rotation.z = Math.sin(tt * 3.1) * .35; };
};
const ODD_RACERS = [["hip_horseman", "WHO'S RIDING WHO?!", 8.5], ["hip_pig", "ALMOST... ALMOST...", 7], ["hip_ostrich", "OUTTA MY WAY, SONNY!", 10.5], ["hip_panto", "LEFT! NO, YOUR LEFT!", 6.5]];
SCENES.hipodromo = {
  name: "The Racetrack", tag: "Grand Prix", outside: "#7aa35a", bulbH: 1.2, music: "brass",
  light: { sky: 0xfff0d8, ground: 0x6d6448, hemi: .6, sun: 0xffe6c2, sunI: 1.3 }, crowd: 3300, fenceBudget: 70, maxGates: 5, guards: 4,
  gates: [F, T, F, T, F, T, F], unlock: 6,
  intro: "Grand Prix day. The horses thunder right along the rail, the crowd piles up to see the finish line, and every now and then a horse bolts.",
  acts: ["Final stretch!", "Photo finish!", "And they're off!", "Wins by a nose!"],
  events: ["carrera", "carrera", "desbocado", "tractor", "carrera", "desbocado", "dogs", "invasion", "invasion"],
  goal: o => o.kind === "rail", goalMaxY: 20,
  build() {
    if (HIPO.gap > 0) { seg(0, TRACK_Y, HIPO.gx - 3, TRACK_Y, .4, "rail"); seg(HIPO.gx + 3, TRACK_Y, WW, TRACK_Y, .4, "rail"); }   // the gate in the rail is open
    else seg(0, TRACK_Y, WW, TRACK_Y, .4, "rail");
    rect(0, 17, 5, 50, "grandstand"); rect(WW - 5, 17, WW, 50, "grandstand");
    rect(16, 44, 24, 46.5, "tote");
    circ(20, 31, 2.2, "winner");
    rect(7, 54, 10.5, 57.5, "popcorn"); rect(29.5, 54, 33, 57.5, "candy");
  },
  ground(g) {
    g.fillStyle = "#7aa35a"; g.fillRect(0, 0, WW, WH);
    const rand = rng(17);
    for (let k = 0; k < 1500; k++) { g.fillStyle = k % 2 ? "rgba(40,80,30,.22)" : "rgba(170,210,120,.25)"; g.fillRect(rand() * WW, rand() * WH, .08, .22); }
    // dirt track with hoofprints
    g.fillStyle = "#b9895a"; g.fillRect(0, 0, WW, TRACK_Y);
    for (let k = 0; k < 900; k++) { g.fillStyle = k % 3 ? "rgba(90,60,30,.25)" : "rgba(240,210,170,.25)"; g.fillRect(rand() * WW, .3 + rand() * (TRACK_Y - .6), .08, .14); }
    // checkered finish line
    for (let y = 0, i = 0; y < TRACK_Y; y += .5, i++) for (let c = 0; c < 2; c++) { g.fillStyle = (i + c) % 2 ? "#ffffff" : "#151617"; g.fillRect(30 + c * .5, y, .5, .5); }
    // infield lawn: mowed stripes, a horseshoe in flowers, betting-slip litter
    for (let y = TRACK_Y + 8, i = 0; y < FENCE_Y; y += 2.4, i++) { g.fillStyle = i % 2 ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)"; g.fillRect(5, y, WW - 10, 2.4); }
    g.save(); g.translate(20, 38); g.strokeStyle = "#e8b631"; g.lineWidth = .8; g.lineCap = "round"; g.beginPath(); g.arc(0, 0, 3.4, Math.PI * .15, Math.PI * .85, true); g.stroke();
    g.fillStyle = "#d8322b"; for (let k = 0; k < 14; k++) { const a = Math.PI * .15 - k * Math.PI * 1.3 / 13; g.beginPath(); g.arc(Math.cos(a) * 3.4, Math.sin(a) * 3.4, .22, 0, 7); g.fill(); } g.restore();
    { const r2 = rng(88); for (let k = 0; k < 90; k++) { g.fillStyle = ["#fff6c8", "#ffffff", "#ffd8e6"][k % 3]; g.save(); g.translate(5 + r2() * (WW - 10), TRACK_Y + 9 + r2() * (FENCE_Y - TRACK_Y - 12)); g.rotate(r2() * 3); g.fillRect(-.18, -.1, .36, .2); g.restore(); } }
    // distance poles painted along the rail
    for (let x = 4; x < WW; x += 8) { g.fillStyle = "#ffffff"; g.fillRect(x, TRACK_Y - .6, .3, .3); g.fillStyle = "#d8322b"; g.fillRect(x + .3, TRACK_Y - .6, .3, .3); }
    // apron in front of the rail
    g.fillStyle = "#c8c2b0"; g.fillRect(5, TRACK_Y, WW - 10, 8);
    g.fillStyle = "#9a9c98"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
  },
  decor(g) {
    for (const o of obs) if (o.kind === "rail") { g.lineWidth = .35; g.strokeStyle = "#ffffff"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
    g.lineWidth = .25; g.strokeStyle = "#ffffff"; g.beginPath(); g.moveTo(0, .4); g.lineTo(WW, .4); g.stroke();
    // starting gates
    g.fillStyle = "#2f6b3a"; g.fillRect(0, .6, 3.2, TRACK_Y - 1.2);
    g.fillStyle = "#e8e2d0"; for (let y = 1; y < TRACK_Y - .6; y += 1.4) g.fillRect(.2, y, 3, .2);
    // grandstands full of spectators
    const rand = rng(9), fans = ["#d8322b", "#2f6fc4", "#e8b631", "#f4f4f0", "#3d9a5b", "#8a4fbf", "#ff8fc6"];
    for (const o of obs) if (o.kind === "grandstand") {
      g.fillStyle = "#e8e2d4"; g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0);
      for (let y = o.y0 + .4; y < o.y1; y += .55) for (let x = o.x0 + .3; x < o.x1; x += .5) { g.fillStyle = fans[(rand() * fans.length) | 0]; g.beginPath(); g.arc(x, y, .17, 0, 7); g.fill(); }
    }
    // betting board
    g.fillStyle = "#1b2a1f"; g.fillRect(16, 44, 8, 2.5);
    g.font = "700 .7px Rubik, sans-serif"; g.textAlign = "left"; g.textBaseline = "middle"; g.fillStyle = "#ffd23a";
    ["1 LIGHTNING 3-1", "2 TORNADO 5-2", "3 PEPPER 7-1"].forEach((t, i) => g.fillText(t, 16.3, 44.5 + i * .75));
    // winner's circle with flowers
    g.fillStyle = "#3d7a3a"; g.beginPath(); g.arc(20, 31, 2.2, 0, 7); g.fill();
    for (let k = 0; k < 60; k++) { const a = rand() * 6.28, r = rand() * 2; g.fillStyle = ["#d8322b", "#ffd23a", "#ffffff", "#ff8fc6"][k % 4]; g.beginPath(); g.arc(20 + Math.cos(a) * r, 31 + Math.sin(a) * r, .16, 0, 7); g.fill(); }
    const stand = (o, a, b, top) => {
      for (let x = o.x0, i = 0; x < o.x1; x += .5, i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(x, o.y0, .5, o.y1 - o.y0); }
      g.fillStyle = top; g.beginPath(); g.arc((o.x0 + o.x1) / 2, (o.y0 + o.y1) / 2, .8, 0, 7); g.fill();
    };
    for (const o of obs) if (o.kind === "popcorn") stand(o, "#2f6b3a", "#fbf4e4", "#f5d36b");
    for (const o of obs) if (o.kind === "candy") stand(o, "#ff8fc6", "#fbf4e4", "#ffd1ea");
  },
  bulbs: Array.from({ length: 20 }, (_, i) => [1 + i * 2, TRACK_Y + .3]),
  beams: [{ x: 5, y: 20, a: -.3, sweep: .4, h: 9 }, { x: 35, y: 20, a: Math.PI + .3, sweep: .4, h: 9 }, { x: 20, y: 48, a: -Math.PI / 2, sweep: .5, h: 7 }],
  extra3D(grp) {
    // grandstand roofs and finish post
    for (const x of [2.5, WW - 2.5]) { const roof = part(grp, "box", mat("#2f6b3a", { roughness: .5 }), 5.5, .3, 34, x, 6, 33.5); roof.receiveShadow = true; }
    for (const x of [.4, WW - .4]) for (let y = 19; y < 50; y += 7.5) part(grp, "cyl", "#e8e2d4", .15, 6, .15, x, 3, y);
    part(grp, "cyl", "#ffffff", .12, 4, .12, 30.5, 2, TRACK_Y + .2);
    part(grp, "sph", "#d8322b", .4, .4, .4, 30.5, 4.2, TRACK_Y + .2);
  },
  lines: {
    invasion: "Someone shouted that a winning ticket was lying on the track. Several hundred people went to look for it. The horses were not consulted.",
    oddrace: "The race was won by a pig chasing a banana, according to the photo finish. The stewards are reviewing it.",
  },
  onStart() { HIPO.gap = 0; HIPO.t = 0; },
  step() {
    if (HIPO.gap <= 0 || (phase !== "show" && phase !== "evac")) return;
    HIPO.t += DT; let on = 0; for (const a of ag) if (a.y < TRACK_Y - .2) on++;
    if (HIPO.t > 35) for (const a of ag) if (a.y < TRACK_Y - .2) { a.y = TRACK_Y + 1.2 + Math.random(); a.x = clamp(a.x, HIPO.gx - 2.5, HIPO.gx + 2.5); a.vx = a.vy = 0; }   // the stewards drag the last ones back
    if ((HIPO.t > 12 && on === 0) || HIPO.t > 35) { HIPO.gap = 0; buildWorld(); if (!demo) pop(HIPO.gx, TRACK_Y + 1, "GATE CLOSED!"); }
  },
  ev: {
    carrera(how) {   // the race: horses, and now and then something that is definitely not a horse
      const odd = Math.random() < .15 ? 6 : Math.random() < .7 ? 1 + (Math.random() < .4 ? 1 : 0) : 0, lanes = [0, 1, 2, 3, 4, 5].sort(() => Math.random() - .5);
      for (let k = 0; k < 6; k++) {
        const n = lanes[k], lane = 2.2 + n * 1.6, hit = how === "invaded" ? { push: 22, scare: 2.4 } : { push: 0 };
        if (k < odd) { const [kind, say, sp] = ODD_RACERS[(Math.random() * ODD_RACERS.length) | 0];
          addMover({ kind, x: -2 - Math.random() * 2, y: lane, pts: [[20, lane + rnd(-.5, .5)], [WW + 6, lane]], speed: sp + Math.random() * 1.5, r: .7, dust: true, say, sayEvery: 2.2, ...hit }); }
        else addMover({ kind: "racehorse", x: -2 - Math.random() * 2, y: lane, pts: [[20, lane + rnd(-.5, .5)], [WW + 6, lane]], speed: 9 + Math.random() * 2, r: .7, col: ["#5a3a22", "#2b1d14", "#8a5a34", "#d9c3a0", "#3b2a20", "#6b4a2b"][n], silk: SHIRTS[(n * 5) % SHIRTS.length], dust: true, ...hit });
      }
      caption(odd === 6 ? "And they're off! ...wait, those aren't horses" : odd ? "And they're off! (one of them is not a horse)" : "And they're off!", false, 1800); pop(3, 6, "THEY'RE OFF!"); if (odd) eventLog.add("oddrace");
      if (odd && !demo) later(1.4, () => pop(20, TRACK_Y + 2, ["IS THAT LEGAL?!", "PLACE YOUR BETS ON THE PIG!", "I'M CALLING MY BOOKIE!", "THAT'S MY GRANDMA!"][(Math.random() * 4) | 0]));
    },
    invasion() {   // a gate in the rail opens and part of the crowd runs onto the track, right before a race
      if (HIPO.gap > 0) return;
      HIPO.gap = 1; HIPO.t = 0; HIPO.gx = rnd(10, WW - 10); buildWorld();
      tempAttract(HIPO.gx + rnd(-6, 6), TRACK_Y - 5, 3, 8, .4); sfx("whistle");
      caption("Someone dropped a winning ticket on the track!", true, 2400); pop(HIPO.gx, TRACK_Y + 1, "THE GATE IS OPEN!");
      later(.8, () => { for (let k = 0; k < 3; k++) { const [x, y] = crowdPoint(); pop(x, y - 1, ["MY TICKET!", "IT'S A MILLION!", "TO THE TRACK!"][k]); } });
      later(6, () => { if (phase === "show") { scene.ev.carrera("invaded"); caption("...and here come the horses", true, 2000); } });
    },
  },
  performers: () => [],
};
