// Human Tide · scene: The Golden Throne (grand opening of the world's most luxurious public toilet)
SCENES.trono = {
  name: "The Golden Throne", tag: "Grand opening of the world's fanciest toilet", outside: "#b9b4a8", bulbH: 2.4, music: "brass",
  light: { sky: 0xfff6e0, ground: 0x8f8670, hemi: .6, sun: 0xfff0d0, sunI: 1.3 }, crowd: 2800, fenceBudget: 60, maxGates: 5, guards: 4,
  gates: [F, T, F, T, F, F, F], unlock: 7,
  intro: "The city spent its entire budget on a gold toilet with wifi, music and a vanilla scent. Today they cut the ribbon, and everyone wants to be the first to use it.",
  acts: ["Cut the ribbon!", "Dibs on first flush!", "Open up already!", "Smells like vanilla!"],
  events: ["inundacion", "rollos", "plomero", "alcalde", "perfume", "rollos"],
  goal: o => o.kind === "barrier", goalMaxY: 20,
  lines: {
    inundacion: "The toilet clogged at its own grand opening and sprayed eau de cologne all over the plaza.",
    rollos: "24-karat toilet paper rolls came rolling through.",
    plomero: "A plumber saved the day and asked to be paid in cash.",
    alcalde: "The mayor cut the ribbon with two-meter scissors and took 400 selfies.",
    perfume: "A cloud of vanilla perfume left everyone dancing.",
  },
  quotes: ["“It's a toilet, but it's OUR toilet,” declared the mayor.", "“Four hours in line and totally worth it,” insisted the first user.", "“The giant scissors were my idea,” bragged the image consultant."],
  build() {
    rect(12, 0, 28, 7, "pavilion");
    seg(3, 8.8, WW - 3, 8.8, .4, "barrier");
    for (let y = 18; y < 62; y += 6) { rect(1, y, 3.5, y + 2.4, "portapotty"); rect(WW - 3.5, y, WW - 1, y + 2.4, "portapotty"); }
    circ(20, 36, 2, "fountain");
    for (const x of [12, 28]) for (const y of [20, 52]) circ(x, y, .35, "post");
  },
  ground(g) {
    g.fillStyle = "#d9d3c4"; g.fillRect(0, 0, WW, WH);
    for (let y = 0, i = 0; y < FENCE_Y; y += 1.5, i++) for (let x = 0, j = 0; x < WW; x += 3, j++) { g.fillStyle = (i + j) % 2 ? "#d2cbba" : "#ddd7c9"; g.fillRect(x + (i % 2) * 1.5, y, 3, 1.5); }
    // red carpet up to the throne
    g.fillStyle = "#b2232c"; g.fillRect(17.5, 7, 5, 59);
    g.fillStyle = "#e3b23c"; g.fillRect(17.5, 7, .2, 59); g.fillRect(22.3, 7, .2, 59);
    g.fillStyle = "#b9b4a8"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
  },
  decor(g) {
    // marble pavilion with the golden throne
    g.fillStyle = "#f4f1ea"; g.fillRect(12, 0, 16, 7);
    for (let x = 12.6; x < 28; x += 2.2) { g.fillStyle = "#e6e0d2"; g.fillRect(x, 0, .8, 7); }
    const gold = g.createRadialGradient(20, 3.5, .3, 20, 3.5, 3); gold.addColorStop(0, "#fff3a0"); gold.addColorStop(1, "#c9961a");
    g.fillStyle = gold; g.beginPath(); g.ellipse(20, 3.5, 1.6, 2.1, 0, 0, 7); g.fill();
    g.fillStyle = "#8a6510"; g.beginPath(); g.ellipse(20, 3.8, .8, 1.1, 0, 0, 7); g.fill();
    g.font = "900 1px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#8a6510"; g.fillText("GOLDEN PUBLIC TOILET · FREE ENTRY", 20, 6.4);
    // ribbon with a bow
    for (const o of obs) if (o.kind === "barrier") { g.lineWidth = .35; g.strokeStyle = "#d8322b"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
    g.fillStyle = "#d8322b"; g.beginPath(); g.ellipse(18.8, 8.8, 1, .5, .4, 0, 7); g.ellipse(21.2, 8.8, 1, .5, -.4, 0, 7); g.fill();
    // porta-potties (the usual ones)
    for (const o of obs) if (o.kind === "portapotty") { g.fillStyle = "#2f7fd6"; g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0); g.fillStyle = "#ffffff"; g.fillRect(o.x0 + .5, o.y0 + .4, 1.4, .3); }
    // fountain shaped like a... throne
    g.fillStyle = "#e3b23c"; g.beginPath(); g.arc(20, 36, 2, 0, 7); g.fill(); g.fillStyle = "#7fd6f0"; g.beginPath(); g.ellipse(20, 36.2, 1.2, 1.5, 0, 0, 7); g.fill();
    for (const o of obs) if (o.kind === "post") { g.fillStyle = "#e3b23c"; g.beginPath(); g.arc(o.x, o.y, o.r, 0, 7); g.fill(); }
    g.strokeStyle = "#b2232c"; g.lineWidth = .15; g.beginPath(); g.moveTo(12, 20); g.lineTo(12, 52); g.moveTo(28, 20); g.lineTo(28, 52); g.stroke();
  },
  bulbs: Array.from({ length: 28 }, (_, i) => [3.5 + i * 1.22, 9.2]),
  beams: [{ x: 13, y: 7, a: Math.PI / 2, sweep: .5, h: 8 }, { x: 27, y: 7, a: Math.PI / 2, sweep: .5, h: 8 }, { x: 20, y: 7, a: Math.PI / 2, sweep: .7, h: 8, white: true }],
  extra3D(grp) {
    // golden dome over the pavilion, and columns
    const dome = new THREE.Mesh(new THREE.SphereGeometry(4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat("#e3b23c", { metalness: .9, roughness: .2 }));
    dome.position.set(20, 3.2, 3.5); dome.scale.set(1.6, .9, .85); dome.castShadow = true; grp.add(dome);
    part(grp, "sph", mat("#fff3a0", { metalness: .9, roughness: .15 }), .5, .5, .5, 20, 7, 3.5);
    for (const x of [13, 27]) for (const y of [.8, 6.2]) part(grp, "cyl", "#f4f1ea", .35, 3.2, .35, x, 1.6, y);
    // giant scissors stuck in the ground next to the ribbon
    for (const s of [-1, 1]) { const bl = part(grp, "box", mat("#c9ced6", { metalness: .8, roughness: .2 }), 2.2, .12, .25, 22.8, 1.4, 8.4); bl.rotation.z = s * .5; bl.rotation.y = .3; }
  },
  ev: {
    inundacion() {
      later(.01, () => { for (const a of ag) { const dx = a.x - 20, dy = a.y - 4, d = Math.hypot(dx, dy); if (d < 18) { a.vx += dx / d * 2.4 * (1 - d / 18); a.vy += dy / d * 2.4 * (1 - d / 18); } } });
      slipT = 6; for (let k = 0; k < 40; k++) puff(20 + rnd(-8, 8), rnd(9, 20), .2, "#7fd6f0", .6, 3, .1);
      pop(20, 8, "IT'S CLOGGED!"); caption("The throne is clogged! Cologne everywhere", true, 2400); shake = Math.min(1, shake + .5);
    },
    rollos() { for (let n = 0; n < 5; n++) addMover({ kind: "roll", beh: "bounce", x: rnd(14, 26), y: 11, vx: rnd(-4, 4), vy: rnd(2, 5), r: .5, push: 10, life: 12 }); caption("24-karat toilet paper rolls!", false, 1600); },
    plomero() { const gx = openGateX(); addMover({ kind: "plumber", x: gx, y: SH, pts: [[gx, 62], [20, 12], [gx, 62], [gx, SH + 3]], speed: 1.7, r: .45, push: 25, calm: 3, say: "I'LL FIX IT!", sayEvery: 3 }); caption("The plumber is here", false, 1600); },
    alcalde() {
      const pts = [crowdPoint(), crowdPoint(), crowdPoint(), [openGateX(), SH + 3]];
      addMover({ kind: "mayor", x: 20, y: 10, pts, speed: 1.2, r: .45, push: 25, scare: 0, say: "PHOTO WITH THE MAYOR!", sayEvery: 3, tick: followTick(12, 2.8, .4) });
      caption("The mayor is coming down for selfies!", true, 2000);
    },
    perfume() { const [x, y] = crowdPoint(); for (let k = 0; k < 50; k++) puff(x + rnd(-4, 4), y + rnd(-4, 4), rnd(.5, 2), "#ffb3e0", .8, 4, .4); cheerT = 4; pop(x, y, "VANILLA!"); caption("Vanilla perfume cloud", false, 1600); },
  },
  performers: () => [],
};
