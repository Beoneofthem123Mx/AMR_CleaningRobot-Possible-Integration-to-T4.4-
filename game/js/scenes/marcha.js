// Human Tsunami · scene: The Protest March (comic demands only: naps, longer weekends, free wifi)
const MARCHA = { t: 6, k: 0 };
const CHANTS = [["WHAT DO WE WANT?", "LONGER NAPS!"], ["WHEN DO WE WANT IT?", "AFTER LUNCH!"], ["THE PEOPLE, UNITED,", "WANT FREE WIFI!"], ["NO MORE", "MONDAYS!"], ["HEY HEY, HO HO,", "TINY SPOONS HAVE GOT TO GO!"], ["WE WANT", "THREE-DAY WEEKENDS!"]];
SCENE_PERSONS.marcha_cop = { body: "#1f2a44", legs: "#1f2a44", hat: "cap", hatCol: "#111214", shoes: "#111214",
  extra(g, u, b) { part(b, "box", mat("#bfe3ff", { transparent: true, opacity: .6, roughness: .1 }), .06, 1.0, .7, .35, 1.0, 0); part(b, "sph", mat("#bfe3ff", { transparent: true, opacity: .5 }), .24, .2, .24, .05, 1.7, 0); } };
SCENE_PERSONS.marcha_leader = { body: "#d8322b", legs: "#2b2f35", hat: "hair", hatCol: "#2b1d14",
  extra(g, u, b) { const m = part(b, "cone", "#f4f4f0", .14, .3, .14, .42, 1.62, 0); m.rotation.z = -Math.PI / 2; } };
SCENE_PERSONS.marcha_contra = { body: "#7a7f88", legs: "#4a4d55", hat: "cap", hatCol: "#4a4d55", extra(g, u, b) { part(b, "box", "#f4f4f0", .04, .5, .7, .1, 2.25, 0); part(b, "cyl", "#8a6a44", .02, .8, .02, .1, 1.7, 0); } };
SCENE_MODELS.marcha_banner = (g, u) => {   // two marchers carrying a five-metre banner between poles
  for (const z of [-2.2, 2.2]) { part(g, "sph", "#d8322b", .27, .42, .3, 0, 1, z); part(g, "sph", "#e0ac84", .2, .2, .2, .02, 1.6, z); part(g, "cyl", "#8a6a44", .04, 2.6, .04, .2, 1.6, z); }
  const b = part(g, "box", "#f4f1ea", .05, 1.2, 4.4, .2, 2.4, 0); const t = part(g, "box", "#d8322b", .06, .3, 4.2, .2, 2.65, 0); u.anim = tt => { b.position.x = .2 + Math.sin(tt * 2) * .08; t.position.x = b.position.x; };
};
SCENE_PERSONS.marcha_drummer = { body: "#1f4fa8", legs: "#2b2f35", hat: "cap", hatCol: "#d8322b", extra(g, u, b) { const d = part(b, "cyl", "#d8322b", .3, .3, .3, .35, .95, 0); d.rotation.z = Math.PI / 2; part(b, "cyl", "#f4f1ea", .31, .05, .31, .35, .95, 0).rotation.z = Math.PI / 2; } };
SCENE_MODELS.marcha_drone = (g, u) => { part(g, "box", "#2b2f35", .7, .15, .7, 0, 0, 0); u.rot = []; for (const [x, z] of [[.4, .4], [.4, -.4], [-.4, .4], [-.4, -.4]]) u.rot.push(part(g, "box", "#c9ced6", .5, .02, .06, x, .12, z)); part(g, "sph", "#111214", .1, .1, .1, .3, -.12, 0); part(g, "sph", basic("#ff3b2f"), .05, .05, .05, -.3, .05, 0); u.anim = tt => u.rot.forEach((r, i) => { r.rotation.y = tt * 40 + i; }); };
SCENE_MODELS.marcha_truck = (g, u) => {   // a slow sound truck with a speaker stack and a guy on top with a megaphone
  part(g, "box", "#2f7fd6", 4.6, 1.8, 2.2, 0, 1.3, 0); part(g, "box", "#f4f4f0", 1.4, 1.4, 2.2, 2.9, 1.1, 0); part(g, "box", "#1b2a3a", .1, .7, 1.8, 3.62, 1.4, 0);
  for (const z of [-.8, .8]) for (const x of [-1.6, 1.6]) { const w = part(g, "cyl", "#151617", .42, .3, .42, x, .42, z * 1.2); w.rotation.x = Math.PI / 2; }
  u.spk = []; for (const z of [-.6, .6]) { part(g, "box", "#111214", .9, 1.2, .9, -1.2, 2.8, z); u.spk.push(part(g, "cyl", "#3a3d45", .3, .1, .3, -.74, 2.8, z)); u.spk[u.spk.length - 1].rotation.z = Math.PI / 2; }
  part(g, "box", "#ffd23a", 4.4, .5, .06, 0, 1.6, 1.13); part(g, "sph", "#d8322b", .25, .4, .28, .6, 2.6, 0); part(g, "sph", "#e0ac84", .18, .18, .18, .6, 3.1, 0);
  u.anim = tt => { const k = 1 + Math.max(0, Math.sin(tt * 9)) * .25; for (const s of u.spk) s.scale.set(.3 * k, .1, .3 * k); };
};
SCENES.marcha = {
  name: "The Protest March", tag: "Longer naps, now!", outside: "#8d8f94", bulbH: 2.2, music: "edm",
  light: { sky: 0xf0f4ff, ground: 0x60646a, hemi: .62, sun: 0xfff6e8, sunI: 1.1 }, crowd: 3400, fenceBudget: 85, maxGates: 5, guards: 5,
  gates: [T, F, T, F, T, F, T], unlock: 42,
  intro: "Thousands march to City Hall demanding longer naps, three-day weekends and the end of tiny spoons. Everyone wants to be at the front for the speeches. The police are very polite and very slow.",
  acts: ["What do we want?!", "Louder!", "One more chant!", "Signs up!"],
  events: ["policia", "globos", "dron", "contra", "pancarta", "tambores", "policia", "globos", "pancarta", "desvio", "camion", "camion"],
  goal: o => o.kind === "barrier", goalMaxY: 14,
  heights: { cityhall: 7, steps: .8, statue: 3.4, kiosk: 1.6 },
  look(L) { if (Math.random() < .42) L.acc = Math.random() < .8 ? 6 : 7; },   // signs and flags everywhere
  lines: {
    desvio: "Halfway through, the organisers moved the speech to the statue. The front row turned around and met the back row.",
    camion: "A sound truck rolled up the avenue at walking speed playing the same protest song eleven times.",
    policia: "A line of riot police asked everyone to disperse 'whenever it's convenient'.",
    globos: "Water balloons flew from a balcony. Nobody knows which side threw them; everybody got wet.",
    dron: "A news drone filmed the march and accidentally live-streamed a man eating a torta.",
    contra: "A counter-protest in favour of Mondays crossed the march. Both sides agreed the coffee was bad.",
    pancarta: "A five-metre banner reading LONGER NAPS NOW crossed the crowd and took several hats with it.",
    tambores: "The drum line played so loud that the sit-in briefly became a dance-in.",
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
    // the avenue: tall buildings on both sides with balconies full of neighbours, trees, and a banner across the street
    const blds = ["#e3d0b0", "#c9b6e0", "#b9d8c2", "#f0c2a8", "#cfd8e8"];
    for (let k = 0; k < 6; k++) for (const s of [-1, 1]) {
      const y = 16 + k * 8.5, x = s < 0 ? -4 : WW + 4, h = 9 + (k % 3) * 3;
      part(grp, "box", blds[(k + (s > 0 ? 2 : 0)) % blds.length], 7, h, 8, x, h / 2, y);
      for (let f = 1; f < h / 3; f++) { part(grp, "box", "#2b2f3a", .1, 1.1, 1.4, x - s * 3.52, f * 3 + .2, y - 2); part(grp, "box", "#2b2f3a", .1, 1.1, 1.4, x - s * 3.52, f * 3 + .2, y + 2);
        if ((k + f) % 2) { part(grp, "box", "#8a8f99", .9, .1, 2.6, x - s * 3.95, f * 3 - .45, y); part(grp, "sph", SKIN[(k + f) % SKIN.length], .2, .22, .2, x - s * 3.85, f * 3 + .15, y + ((k * 3 + f) % 3 - 1) * .7);
          const fl = part(grp, "box", ["#d8322b", "#ffd23a", "#2f7fd6", "#7ac943"][(k + f) % 4], .04, .8, 1.1, x - s * 4.3, f * 3 - .9, y); fl.castShadow = false; } }
    }
    for (let y = 18; y < 62; y += 7) for (const x of [10.5, 29.5]) { part(grp, "cyl", "#6b4a2a", .15, 2.2, .15, x, 1.1, y); part(grp, "sph", "#4f9a3a", 1.3, 1.1, 1.3, x, 2.9, y); }
    for (const x of [1, WW - 1]) part(grp, "cyl", "#8a8f99", .08, 6.5, .08, x, 3.25, 24);
    const ban = part(grp, "box", "#ffd23a", WW - 2, 1.2, .06, 20, 5.6, 24); ban.castShadow = false;
    const bt = part(grp, "box", "#d8322b", WW - 2.2, .25, .07, 20, 5.05, 24); bt.castShadow = false;

    for (let x = 8; x < 33; x += 3) part(grp, "cyl", "#f0ebe0", .4, 6.5, .4, x, 3.25, 6.2);   // columns
    part(grp, "box", "#e8e2d4", 30, 1.2, 7, 20, 7.6, 3); part(grp, "box", "#d9d2c0", 30, 2.6, .5, 20, 9.4, 6.4);
    part(grp, "cyl", "#2b2f35", .04, 3, .04, 20, 10.5, 3); const fl = part(grp, "box", "#2fae5a", .02, .9, 1.4, 20, 11.5, 3.7); fl.castShadow = false;
    // the statue of a very tired founder, holding a pillow
    part(grp, "box", "#a9abb0", 1.6, 2, 1.6, 20, 1, 36); part(grp, "sph", "#7a8f6a", .5, .8, .5, 20, 2.8, 36); part(grp, "sph", "#7a8f6a", .3, .3, .3, 20, 3.8, 36); part(grp, "box", "#7a8f6a", .5, .3, .7, 20.4, 3.2, 36);
    // a lectern with microphones on the steps
    part(grp, "box", "#7a4a22", .9, 1.2, .6, 20, 1.4, 8.2); part(grp, "cyl", "#2b2f35", .02, .5, .02, 20, 2.2, 8.4);
  },
  onStart() { MARCHA.t = 6; MARCHA.k = 0; MARCHA.sit = 9; },
  step() {
    if (phase !== "show" || demo || !fullAt) return;
    // sit-ins: every so often a group sits down in the middle of the street, and everyone has to walk around them
    MARCHA.sit -= DT;
    if (MARCHA.sit <= 0) {
      MARCHA.sit = 10 + Math.random() * 5; const [cx, cy] = crowdPoint(); let n = 0;
      for (const a of ag) if ((a.x - cx) ** 2 + (a.y - cy) ** 2 < 6 && n < 30) { a.sit = t + 6; n++; }
      if (n > 5) { pop(cx, cy - 1.5, ["SIT-IN!", "WE SHALL NOT BE MOVED!", "NAP PROTEST!"][(Math.random() * 3) | 0]); caption("A sit-in blocks the street", false, 1500); }
    }
    MARCHA.t -= DT;
    if (MARCHA.t <= 0) {   // a chant ripples through the crowd: the call from the front, the answer from everybody
      MARCHA.t = 8 + Math.random() * 4; const [a, b] = CHANTS[MARCHA.k++ % CHANTS.length];
      pop(20, 9, a); sfx("cheer");
      later(1.1, () => { for (let k = 0; k < 5; k++) { const [x, y] = crowdPoint(); pop(x, Math.max(14, y) - 1, b); } cheerT = Math.max(cheerT, 1.6); });
    }
  },
  ev: {
    pancarta(side) {   // a giant banner carried right through the crowd
      const x = rnd(14, 26);
      addMover({ kind: "marcha_banner", x, y: FENCE_Y + 2, pts: [[x + rnd(-3, 3), 30], [x, 16]], speed: 1.2, r: 2.2, push: 20, scare: 1, say: "LONGER NAPS NOW!", sayEvery: 3, ang: -Math.PI / 2 });
      caption("Here comes the giant banner", false, 1600);
    },
    tambores(side) {
      for (let n = 0; n < 6; n++) addMover({ kind: "marcha_drummer", x: side ? -1 - n : WW + 1 + n, y: 40 + (n % 2) * 2, pts: [[side ? WW + 4 : -4, 40 + (n % 2) * 2]], speed: 1.6, r: .45, push: 18, scare: 1.2, say: n ? "" : "BOOM BOOM TSS!", sayEvery: 1.2,
        tick(m) { if (Math.random() < .02) { cheerT = Math.max(cheerT, .6); } } });
      caption("The drum line joins the march", false, 1600);
    },
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
    desvio() {   // change of plan: the speech moves to the statue, and the front of the march turns around into the back
      tempAttract(20, 36, 3.4, 9, .6); caption("Change of plan! The speech moves to the statue", true, 2400); pop(20, 9, "EVERYONE TO THE STATUE!"); sfx("cheer");
      later(.8, () => { for (let k = 0; k < 4; k++) { const [x, y] = crowdPoint(); pop(x, y - 1, ["WHICH STATUE?", "WE JUST GOT HERE!", "TURN AROUND!", "THIS WAY! NO, THAT WAY!"][k]); } });
    },
    camion(side) {   // a sound truck crawls up the middle of the avenue to the front
      const x = rnd(17, 23); addMover({ kind: "marcha_truck", x, y: FENCE_Y + 4, pts: [[x, 40], [x, 18], [side ? -7 : WW + 7, 17]], speed: .85, r: 2, push: 24, scare: 1.1, say: "♪ LONGER NAPS! ♪", sayEvery: 2.6, ang: -Math.PI / 2,
        tick(m) { if (Math.random() < .03) cheerT = Math.max(cheerT, .5); } });
      caption("A sound truck joins the march", false, 1700);
    },
    contra(side) {
      const y = rnd(30, 52);
      for (let n = 0; n < 8; n++) addMover({ kind: "marcha_contra", x: side ? -1 - n * 1.2 : WW + 1 + n * 1.2, y: y + rnd(-1.5, 1.5), pts: [[side ? WW + 4 : -4, y + rnd(-3, 3)]], speed: 1.8, r: .45, push: 22, scare: 1, say: n ? "" : "WE LOVE MONDAYS!", sayEvery: 2.5 });
      caption("A counter-protest in favour of Mondays!", true, 2000); pop(20, y - 2, "BOOOO!");
    },
  },
  performers: () => [{ kind: "marcha_leader", orbit: [20, 7.6, .01, 0, 0], h: .8, x: 0, y: 0, ang: Math.PI / 2, t: 0 }],
};
