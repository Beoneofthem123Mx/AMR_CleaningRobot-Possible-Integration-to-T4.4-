// Human Tsunami · scene: Rush Hour Metro (trains arrive on two tracks, people pack into the doors until the train is full, then the next one comes on the other track)
const METRO = { cap: 280, state: "wait", t: 4, track: 0, fill: 0, boarded: 0, train: null, rumble: 0, doors: [] };
// track 0: along the back wall (train runs along x); track 1: along the left wall (train runs along y)
const METRO_TRACKS = [{ stop: [20, 2.6], from: [-34, 2.6], to: [74, 2.6], ang: 0, doors: [-12, -6, 0, 6, 12].map(d => [20 + d, 6.3]) },
                      { stop: [2.6, 36], from: [2.6, 96], to: [2.6, -40], ang: -Math.PI / 2, doors: [-12, -6, 0, 6, 12].map(d => [6.3, 36 + d]) }];
SCENE_MODELS.metro_train = (g, u) => {
  const body = mat("#d9dde3", { metalness: .4, roughness: .35 }), stripe = mat("#2f9e5a");
  part(g, "box", body, 30, 3, 2.9, 0, 1.75, 0); part(g, "box", stripe, 30.05, .35, 2.95, 0, 1.2, 0); part(g, "box", "#9aa0a8", 30, .25, 2.6, 0, 3.35, 0);
  for (const s of [-1, 1]) { part(g, "box", "#2b2f35", .2, 2.5, 2.8, s * 15.05, 1.8, 0); part(g, "sph", basic("#fff3c0"), .2, .2, .05, s * 15.12, 1.2, .9); part(g, "sph", basic("#fff3c0"), .2, .2, .05, s * 15.12, 1.2, -.9); }
  for (let k = 0; k < 10; k++) part(g, "box", "#1b2a3a", 2, 1, 2.95, -13 + k * 2.9, 2.35, 0);   // windows
  for (const d of [-12, -6, 0, 6, 12]) part(g, "box", "#7a8088", 1.4, 2.4, 2.92, d, 1.5, 0);    // doors
  // passengers squashed against the windows: more heads as the train fills
  u.heads = []; const r = rng(9);
  for (let k = 0; k < 60; k++) { const h = part(g, "sph", SKIN[(r() * SKIN.length) | 0], .2, .22, .2, -14 + r() * 28, 2.2 + r() * .3, (r() < .5 ? -1 : 1) * 1.36); h.visible = false; u.heads.push(h); }
  u.anim = (tt, m) => { const n = Math.round((m.fill || 0) * u.heads.length); u.heads.forEach((h, i) => { h.visible = i < n; if (i < n) h.scale.x = 1 + (m.fill > .9 ? .35 : 0); }); g.position.y += m.moving ? Math.sin(tt * 30) * .02 : 0; };
};
SCENE_PERSONS.metro_busker = { body: "#a98bff", legs: "#2b2f35", hat: "hair", hatCol: "#6b4a2a", extra(g, u, b) { part(b, "sph", "#c7883a", .22, .08, .28, .3, 1.05, .1); part(b, "box", "#5a3b1f", .5, .04, .06, .55, 1.15, .1); } };
SCENE_MODELS.metro_rat = (g) => { part(g, "sph", "#6b6f76", .25, .14, .14, 0, .14, 0); part(g, "sph", "#6b6f76", .12, .1, .1, .25, .17, 0); part(g, "cyl", "#d9a0a0", .015, .35, .015, -.35, .1, 0).rotation.z = Math.PI / 2; toyEyes(g, .32, .22, .05, .035); };
SCENES.metro = {
  name: "Rush Hour Metro", tag: "Next train in 2 minutes (lie)", outside: "#55585e", bulbH: 2.8, music: "edm",
  light: { sky: 0xe8f0ff, ground: 0x4a4d55, hemi: .55, sun: 0xf0f6ff, sunI: .95 }, crowd: 3200, fenceBudget: 80, maxGates: 5, guards: 4,
  gates: [F, T, F, T, F, T, F], noSlots: [0], slotWhy: "That's the side track", unlock: 44,
  intro: "Rush hour on the metro platform. Trains come in on the back track and on the side track, one at a time; everyone squeezes into the doors until the train is full, then the next one comes on the OTHER track. Boarding counts as getting home.",
  acts: ["Mind the gap!", "Doors closing!", "Please move down inside the car!", "Next train!"],
  events: ["musico", "ratas", "retraso", "mochilas", "musico", "ratas"],
  goal: o => o.kind === "barrier", goalMaxY: 62,
  heights: { track: .05, pillar: 4, bench: .5, kiosk: 1.6 },
  lines: {
    trains: "Trains came and went full; nobody remembers getting on, everybody remembers getting off.",
    musico: "A busker played the same song for every single train.",
    ratas: "Three rats crossed the platform with more confidence than the commuters.",
    retraso: "A delay was announced 'for operational reasons'; the platform reached 140% capacity.",
    mochilas: "Giant backpacks took up exactly the room of one more person each.",
  },
  quotes: ["“I let three trains go to get a seat. There are no seats,” said a commuter.", "“The doors close by themselves. Usually on someone,” said the station manager.", "“Mind the gap, mind the crowd, mind your business,” read a sign."],
  look(L) { if (Math.random() < .25) L.bags = 1 + ((Math.random() * 2) | 0); },   // commuters with shopping and gym bags
  build() {
    rect(0, 0, WW, 5.2, "track"); rect(0, 5.2, 5.2, 62, "track");
    seg(5.2, 5.6, WW, 5.6, .3, "barrier"); seg(5.6, 5.6, 5.6, 62, .3, "barrier");
    for (const [x, y] of [[14, 20], [26, 20], [14, 40], [26, 40], [20, 54]]) circ(x, y, .7, "pillar");
    rect(32, 28, 38, 30, "bench"); rect(32, 46, 38, 48, "bench"); rect(30, 58, 36, 62, "kiosk");
  },
  ground(g) {
    g.fillStyle = "#c9ccd2"; g.fillRect(0, 0, WW, WH);
    for (let y = 0; y < FENCE_Y; y += 1.5) for (let x = 0; x < WW; x += 1.5) { g.fillStyle = (x + y) % 3 ? "#c3c6cc" : "#d0d3d8"; g.fillRect(x + .03, y + .03, 1.44, 1.44); }
    // the tracks: dark pits with rails and sleepers
    const track = (x0, y0, x1, y1, along) => {
      g.fillStyle = "#2a2b2f"; g.fillRect(x0, y0, x1 - x0, y1 - y0); g.fillStyle = "#5a4a3a";
      if (along === "x") { for (let x = x0; x < x1; x += 1) g.fillRect(x, y0 + .8, .4, y1 - y0 - 1.6); g.fillStyle = "#b8bec6"; g.fillRect(x0, y0 + 1.6, x1 - x0, .15); g.fillRect(x0, y1 - 1.75, x1 - x0, .15); }
      else { for (let y = y0; y < y1; y += 1) g.fillRect(x0 + .8, y, x1 - x0 - 1.6, .4); g.fillStyle = "#b8bec6"; g.fillRect(x0 + 1.6, y0, .15, y1 - y0); g.fillRect(x1 - 1.75, y0, .15, y1 - y0); }
    };
    track(0, 0, WW, 5.2, "x"); track(0, 5.2, 5.2, 62, "y");
    // yellow tactile strips along both platform edges and MIND THE GAP
    g.fillStyle = "#ffd23a"; g.fillRect(5.6, 5.8, WW - 5.6, .6); g.fillRect(5.8, 5.6, .6, 56.4);
    g.font = "900 1px Rubik, sans-serif"; g.textAlign = "center"; g.fillStyle = "#1b1d22"; for (const x of [12, 24, 34]) g.fillText("MIND THE GAP", x, 7.5);
    g.save(); g.translate(7.6, 36); g.rotate(Math.PI / 2); for (const d of [-16, 0, 16]) g.fillText("MIND THE GAP", d, 0); g.restore();
    g.fillStyle = "#6b6e74"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
  },
  decor(g) { for (const o of obs) if (o.kind === "pillar") { g.fillStyle = "#e8e2d4"; g.beginPath(); g.arc(o.x, o.y, o.r, 0, 7); g.fill(); } },
  bulbs: Array.from({ length: 12 }, (_, i) => [8 + i * 2.7, 8]),
  beams: [{ x: 20, y: 10, a: -Math.PI / 2, sweep: .3, h: 6, white: true }],
  extra3D(grp) {
    part(grp, "box", "#e8e2d4", WW, .3, 3, 20, 5.2, 4); part(grp, "box", "#2f9e5a", WW, .5, .1, 20, 4.6, 5.55);
    for (const [x, y] of [[14, 20], [26, 20], [14, 40], [26, 40], [20, 54]]) { part(grp, "box", "#2f9e5a", 1.5, .5, 1.5, x, 3.2, y); }
    const sign = part(grp, "box", "#1b1d22", 6, 1.2, .1, 20, 4.5, 9); sign.castShadow = false;
    // station name board over the side track
    part(grp, "box", "#d8322b", .1, 1, 8, 6.2, 3.2, 36); part(grp, "box", "#ffffff", .12, .4, 6, 6.2, 3.2, 36);
  },
  hud(g, w) {
    const x = 18, y = 14, bw = Math.min(240, w * .22), f = METRO.fill;
    g.fillStyle = "rgba(17,18,20,.85)"; g.beginPath(); g.roundRect(x - 8, y - 8, bw + 16, 52, 10); g.fill();
    g.font = "900 12px Rubik, system-ui, sans-serif"; g.textAlign = "left"; g.textBaseline = "top"; g.fillStyle = "#ffffff";
    const st = METRO.state === "board" ? `TRAIN ${METRO.track ? "B (side)" : "A (back)"} BOARDING` : METRO.state === "wait" ? `NEXT: TRACK ${METRO.track ? "B (side)" : "A (back)"}` : "DEPARTING";
    g.fillText(phase === "plan" ? "Trains alternate between the back and the side track" : `${st} · ${METRO.boarded} home`, x, y - 1);
    g.fillStyle = "#33363d"; g.fillRect(x, y + 18, bw, 14); g.fillStyle = f > .9 ? "#ff4d3d" : "#2f9e5a"; g.fillRect(x, y + 18, bw * f, 14);
  },
  rock: tt => METRO.rumble * Math.sin(tt * 43) * .01,
  bounce: tt => METRO.rumble * Math.sin(tt * 37) * .1,
  onStart() {
    Object.assign(METRO, { state: "wait", t: 6, track: 0, fill: 0, boarded: 0, rumble: 0, att: -1, fields: null });
    const T = METRO_TRACKS[0];
    addMover({ kind: "metro_train", fixture: true, beh: "static", life: 1e9, x: T.from[0], y: T.from[1], ang: T.ang, r: 2, push: 0, air: true, h: 0, fill: 0 });
    METRO.train = movers[movers.length - 1];
  },
  step() {
    if (phase !== "show" && phase !== "evac") return;
    const tr = METRO.train, T = METRO_TRACKS[METRO.track]; if (!tr) return;
    // everyone rushes to the doors of the train that's coming (and runs to the other track when it changes)
    if (!METRO.fields) METRO.fields = METRO_TRACKS.map(K => { const f = dijkstra(id => !blockedC[id] && K.doors.some(([dx, dy]) => Math.hypot((id % GW + .5) * CS - dx, ((id / GW) | 0) * CS + CS / 2 - dy) < 1.5)); return [f, dirField(f)]; });
    if (phase === "show" && METRO.att !== METRO.track) { METRO.att = METRO.track; [attF, attDir] = METRO.fields[METRO.track]; attShare = .8; attr = { x: T.stop[0], y: T.stop[1] + 4, r: 2 }; }
    METRO.t -= DT; METRO.rumble = Math.max(0, METRO.rumble - DT * .5);
    const go = (to, k) => { tr.x += (to[0] - tr.x) * k; tr.y += (to[1] - tr.y) * k; };
    if (METRO.state === "wait") {   // the train glides in
      tr.moving = true; tr.ang = T.ang; go(T.stop, Math.min(1, DT * 1.4)); METRO.rumble = .8;
      if (Math.hypot(tr.x - T.stop[0], tr.y - T.stop[1]) < .2 && METRO.t <= 0) { METRO.state = "board"; METRO.t = 9; tr.moving = false; if (!demo) { pop(T.stop[0], T.stop[1] + 4, "DOORS OPENING!"); sfx("beep"); } }
    } else if (METRO.state === "board") {   // everyone near a door squeezes in
      for (let i = ag.length - 1; i >= 0 && METRO.fill < 1; i--) {
        const a = ag[i]; if (a.air > 0) continue;
        for (const [dx, dy] of T.doors) if ((a.x - dx) ** 2 + (a.y - dy) ** 2 < 3.2) { ag.splice(i, 1); evacuated++; METRO.boarded++; METRO.fill = Math.min(1, METRO.fill + 1 / METRO.cap); break; }
      }
      tr.fill = METRO.fill;
      if (METRO.fill >= 1 || METRO.t <= 0) {
        METRO.state = "leave"; METRO.t = 4; if (!demo) { pop(T.stop[0], T.stop[1] + 4, METRO.fill >= 1 ? "TRAIN FULL! DOORS CLOSING!" : "DOORS CLOSING!"); sfx("beep"); }
        for (const a of ag) for (const [dx, dy] of T.doors) if ((a.x - dx) ** 2 + (a.y - dy) ** 2 < 3) { toss(a, .9, .6); if (!demo && Math.random() < .08) pop(a.x, a.y - 1, ["MY BAG!", "HOLD THE DOOR!", "NOOOO!", "I'LL TAKE THE NEXT ONE"][(Math.random() * 4) | 0]); }
      }
    } else {   // off it goes, and the next one comes on the other track
      tr.moving = true; METRO.rumble = 1; const d = [T.to[0] - tr.x, T.to[1] - tr.y], L = Math.hypot(...d) || 1; tr.x += d[0] / L * 16 * DT; tr.y += d[1] / L * 16 * DT;
      if (L < 2 || METRO.t <= 0) { METRO.track = 1 - METRO.track; const N = METRO_TRACKS[METRO.track]; tr.x = N.from[0]; tr.y = N.from[1]; tr.ang = N.ang; METRO.fill = 0; tr.fill = 0; METRO.state = "wait"; METRO.t = 3; eventLog.add("trains"); if (!demo) caption(`Next train: ${METRO.track ? "SIDE" : "BACK"} track`, false, 1800); }
    }
  },
  ev: {
    musico() { const [x, y] = crowdPoint(); addMover({ kind: "metro_busker", beh: "static", life: 16, x, y, r: .5, push: 10, scare: 1.2, say: "♪ WONDERWALL ♪", sayEvery: 3 }); caption("A busker started playing", false, 1600); },
    ratas(side) {
      for (let n = 0; n < 3; n++) addMover({ kind: "metro_rat", x: side ? 6 : WW + 1, y: rnd(20, 56), pts: [crowdPoint(), [side ? WW + 3 : 4, rnd(20, 60)]], speed: 6, r: .25, push: 8, scare: 3, small: true, say: n ? "" : "SQUEAK!", sayEvery: 1.5,
        tick(m) { if (Math.random() < .01) pop(m.x, m.y - 1, ["EEK! A RAT!", "IT'S HUGE!", "IT TOOK MY SANDWICH!"][(Math.random() * 3) | 0]); } });
      caption("Rats on the platform!", true, 1600);
    },
    retraso() { if (METRO.state === "wait") METRO.t = 10; caption("“There is a delay due to operational reasons”", true, 2400); pop(20, 9, "*DING DONG*"); sfx("beep"); for (let k = 0; k < 4; k++) { const [x, y] = crowdPoint(); later(.5 + k * .3, () => pop(x, y - 1, ["UGH!", "AGAIN?!", "I'M GONNA BE LATE!", "CLASSIC."][k])); } },
    mochilas() { for (const a of ag) if (Math.random() < .2) a.bags = Math.min(9, (a.bags || 0) + 3); caption("Giant backpacks everywhere", false, 1600); },
  },
  performers: () => [],
};
