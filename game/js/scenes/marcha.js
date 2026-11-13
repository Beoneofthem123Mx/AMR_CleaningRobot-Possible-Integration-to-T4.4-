// Human Tsunami · scene: The Protest March (comic demands only: naps, longer weekends, free wifi)
const MARCHA = { t: 6, k: 0 };
const CHANTS = [["WHAT DO WE WANT?", "LONGER NAPS!"], ["WHEN DO WE WANT IT?", "AFTER LUNCH!"], ["THE PEOPLE, UNITED,", "WANT FREE WIFI!"], ["NO MORE", "MONDAYS!"], ["HEY HEY, HO HO,", "TINY SPOONS HAVE GOT TO GO!"], ["WE WANT", "THREE-DAY WEEKENDS!"]];
SCENE_PERSONS.marcha_cop = { body: "#1f2a44", legs: "#1f2a44", hat: "cap", hatCol: "#111214", shoes: "#111214",
  extra(g, u, b) { part(b, "box", mat("#bfe3ff", { transparent: true, opacity: .6, roughness: .1 }), .06, 1.0, .7, .35, 1.0, 0); part(b, "sph", mat("#bfe3ff", { transparent: true, opacity: .5 }), .24, .2, .24, .05, 1.7, 0); } };
SCENE_PERSONS.marcha_leader = { body: "#d8322b", legs: "#2b2f35", hat: "hair", hatCol: "#2b1d14",
  extra(g, u, b) { const m = part(b, "cone", "#f4f4f0", .14, .3, .14, .42, 1.62, 0); m.rotation.z = -Math.PI / 2; } };
SCENE_PERSONS.marcha_contra = { body: "#7a7f88", legs: "#4a4d55", hat: "cap", hatCol: "#4a4d55", extra(g, u, b) { part(b, "box", "#f4f4f0", .04, .5, .7, .1, 2.25, 0); part(b, "cyl", "#8a6a44", .02, .8, .02, .1, 1.7, 0); } };
SCENE_MODELS.marcha_drone = (g, u) => { part(g, "box", "#2b2f35", .7, .15, .7, 0, 0, 0); u.rot = []; for (const [x, z] of [[.4, .4], [.4, -.4], [-.4, .4], [-.4, -.4]]) u.rot.push(part(g, "box", "#c9ced6", .5, .02, .06, x, .12, z)); part(g, "sph", "#111214", .1, .1, .1, .3, -.12, 0); part(g, "sph", basic("#ff3b2f"), .05, .05, .05, -.3, .05, 0); u.anim = tt => u.rot.forEach((r, i) => { r.rotation.y = tt * 40 + i; }); };
SCENES.marcha = {
  name: "The Protest March", tag: "Longer naps, now!", outside: "#8d8f94", bulbH: 2.2, music: "edm",
  light: { sky: 0xf0f4ff, ground: 0x60646a, hemi: .62, sun: 0xfff6e8, sunI: 1.1 }, crowd: 3400, fenceBudget: 85, maxGates: 5, guards: 5,
  gates: [T, F, T, F, T, F, T], unlock: 42,
  intro: "Thousands march to City Hall demanding longer naps, three-day weekends and the end of tiny spoons. Everyone wants to be at the front for the speeches. The police are very polite and very slow.",
  acts: ["What do we want?!", "Louder!", "One more chant!", "Signs up!"],
  events: ["policia", "globos", "dron", "contra", "policia", "globos"],
  goal: o => o.kind === "barrier", goalMaxY: 14,
  heights: { cityhall: 7, steps: .8, statue: 3.4, kiosk: 1.6 },
  look(L) { if (Math.random() < .42) L.acc = Math.random() < .8 ? 6 : 7; },   // signs and flags everywhere
  lines: {
    policia: "A line of riot police asked everyone to disperse 'whenever it's convenient'.",
    globos: "Water balloons flew from a balcony. Nobody knows which side threw them; everybody got wet.",
    dron: "A news drone filmed the march and accidentally live-streamed a man eating a torta.",
    contra: "A counter-protest in favour of Mondays crossed the march. Both sides agreed the coffee was bad.",
  },
  quotes: ["“We'll be back next week, after a nap,” said the organizers.", "“My sign said MORE NAPS but someone sat on it,” said a protester.", "“Very orderly, apart from everything,” said the police chief."],
  build() {
    rect(6, 0, 34, 6, "cityhall"); rect(10, 6, 30, 8.5, "steps");
    seg(5, 11, WW - 5, 11, .4, "barrier");
    circ(20, 36, 1.6, "statue");
    rect(1, 48, 4, 52, "kiosk"); rect(WW - 4, 48, WW - 1, 52, "kiosk");
  },
  ground(g) {
    g.fillStyle = "#a9abb0"; g.fillRect(0, 0, WW, WH);
    for (let y = 0; y < FENCE_Y; y += 2) for (let x = 0; x < WW; x += 2) { g.fillStyle = (x + y) % 4 ? "#a3a5aa" : "#b0b2b6"; g.fillRect(x + .05, y + .05, 1.9, 1.9); }
    // a painted street with chalk messages
    g.fillStyle = "#5c5f66"; g.fillRect(12, 14, 16, FENCE_Y - 14); g.fillStyle = "#f4f4f0"; for (let y = 16; y < FENCE_Y; y += 4) g.fillRect(19.85, y, .3, 2);
    g.save(); g.globalAlpha = .55; g.font = "900 1.4px Rubik, sans-serif"; g.textAlign = "center"; g.fillStyle = "#ffd23a";
    for (const [x, y, w, r] of [[15, 24, "NAPS!", -.2], [25, 46, "NO MONDAYS", .15], [16, 58, "BIGGER SPOONS", -.1], [27, 20, "WIFI 4 ALL", .2]]) { g.save(); g.translate(x, y); g.rotate(r); g.fillText(w, 0, 0); g.restore(); }
    g.restore();
    g.fillStyle = "#7d8088"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
  },
  decor(g) {
    g.fillStyle = "#e8e2d4"; g.fillRect(6, 0, 28, 6); g.fillStyle = "#c9c2b0"; for (let x = 8; x < 33; x += 3) g.fillRect(x, 1, .8, 5);
    g.fillStyle = "#d9d2c0"; g.fillRect(10, 6, 20, 2.5); g.font = "900 1.2px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#3a3d45"; g.fillText("CITY HALL", 20, 3);
    for (const o of obs) if (o.kind === "barrier") { g.lineWidth = .35; g.strokeStyle = "#2f6fc4"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
    g.fillStyle = "#8a8f99"; g.beginPath(); g.arc(20, 36, 1.6, 0, 7); g.fill();
  },
  bulbs: Array.from({ length: 13 }, (_, i) => [7 + i * 2.15, 11.6]),
  beams: [{ x: 12, y: 7, a: Math.PI / 2, sweep: .55, h: 8, white: true }, { x: 28, y: 7, a: Math.PI / 2, sweep: .55, h: 8, white: true }],
  extra3D(grp) {
    for (let x = 8; x < 33; x += 3) part(grp, "cyl", "#f0ebe0", .4, 6.5, .4, x, 3.25, 6.2);   // columns
    part(grp, "box", "#e8e2d4", 30, 1.2, 7, 20, 7.6, 3); part(grp, "box", "#d9d2c0", 30, 2.6, .5, 20, 9.4, 6.4);
    part(grp, "cyl", "#2b2f35", .04, 3, .04, 20, 10.5, 3); const fl = part(grp, "box", "#2fae5a", .02, .9, 1.4, 20, 11.5, 3.7); fl.castShadow = false;
    // the statue of a very tired founder, holding a pillow
    part(grp, "box", "#a9abb0", 1.6, 2, 1.6, 20, 1, 36); part(grp, "sph", "#7a8f6a", .5, .8, .5, 20, 2.8, 36); part(grp, "sph", "#7a8f6a", .3, .3, .3, 20, 3.8, 36); part(grp, "box", "#7a8f6a", .5, .3, .7, 20.4, 3.2, 36);
    // a lectern with microphones on the steps
    part(grp, "box", "#7a4a22", .9, 1.2, .6, 20, 1.4, 8.2); part(grp, "cyl", "#2b2f35", .02, .5, .02, 20, 2.2, 8.4);
  },
  onStart() { MARCHA.t = 6; MARCHA.k = 0; },
  step() {
    if (phase !== "show" || demo || !fullAt) return;
    MARCHA.t -= DT;
    if (MARCHA.t <= 0) {   // a chant ripples through the crowd: the call from the front, the answer from everybody
      MARCHA.t = 8 + Math.random() * 4; const [a, b] = CHANTS[MARCHA.k++ % CHANTS.length];
      pop(20, 9, a); sfx("cheer");
      later(1.1, () => { for (let k = 0; k < 5; k++) { const [x, y] = crowdPoint(); pop(x, Math.max(14, y) - 1, b); } cheerT = Math.max(cheerT, 1.6); });
    }
  },
  ev: {
    policia(side) {
      const y0 = 63;
      for (let n = 0; n < 9; n++) addMover({ kind: "marcha_cop", x: 4 + n * 4, y: y0 + 2, pts: [[4 + n * 4, 40], [4 + n * 4, y0 + 4]], speed: .9, r: .45, push: 30, scare: 1.4, say: n === 4 ? "PLEASE DISPERSE... WHEN CONVENIENT" : "", sayEvery: 5,
        tick(m) { if (Math.random() < .002) pop(m.x, m.y - 1.4, ["EXCUSE US!", "SORRY, SIR!", "MIND THE SHIELD!", "LOVELY SIGN!"][(Math.random() * 4) | 0]); } });
      caption("A line of (very polite) riot police", true, 2000);
    },
    globos(side) {
      for (let n = 0; n < 8; n++) { const [tx, ty] = crowdPoint(), sx = side ? 2 : WW - 2, sy = rnd(48, 52);
        addMover({ kind: "beach", beh: "fly", x: sx, y: sy, sx, sy, tx, ty, dur: 1 + Math.random() * .6, r: .3, push: 0, air: true, small: true, say: "" }); }
      later(1.3, () => pop(20, 40, "SPLASH!")); caption("Water balloons from a balcony!", false, 1800);
    },
    dron() {
      addMover({ kind: "marcha_drone", beh: "hover", air: true, h: 6, x: -3, y: 30, pts: [crowdPoint(), crowdPoint(), crowdPoint(), [WW + 4, 20]], speed: 3, pause: 1.5, r: .4, push: 0, say: "LIVE ON CHANNEL 7", sayEvery: 4,
        tick(m) { if (Math.random() < .01) { pop(m.x, m.y + 1, ["HI MOM!", "AM I ON TV?", "*WAVES*"][(Math.random() * 3) | 0]); } } });
      caption("A news drone is filming!", false, 1600);
    },
    contra(side) {
      const y = rnd(30, 52);
      for (let n = 0; n < 8; n++) addMover({ kind: "marcha_contra", x: side ? -1 - n * 1.2 : WW + 1 + n * 1.2, y: y + rnd(-1.5, 1.5), pts: [[side ? WW + 4 : -4, y + rnd(-3, 3)]], speed: 1.8, r: .45, push: 22, scare: 1, say: n ? "" : "WE LOVE MONDAYS!", sayEvery: 2.5 });
      caption("A counter-protest in favour of Mondays!", true, 2000); pop(20, y - 2, "BOOOO!");
    },
  },
  performers: () => [{ kind: "marcha_leader", orbit: [20, 7.6, .01, 0, 0], h: .8, x: 0, y: 0, ang: Math.PI / 2, t: 0 }],
};
