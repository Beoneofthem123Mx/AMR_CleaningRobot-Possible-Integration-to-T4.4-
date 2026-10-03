// Human Tsunami · scene: Close Encounter (a UFO landed in a cornfield and the whole town showed up)
const RANCH = { x: 20, y: 14, r: 6.5 };
SCENES.ovni = {
  name: "Close Encounter", tag: "Landing confirmed (more or less)", outside: "#3a4a2a", bulbH: .9, night: true, music: "space",
  light: { sky: 0x6f90f0, ground: 0x121a10, hemi: .32, sun: 0xa8f0a0, sunI: .65 }, crowd: 2600, fenceBudget: 70, maxGates: 5, guards: 4,
  gates: [F, T, F, T, F, T, F], unlock: 14,
  intro: "A UFO landed in Don Chuy's cornfield. The whole town showed up with their phones out. There are cows, men in black, an alien who wants selfies and a beam that lifts people right off the ground.",
  acts: ["They're watching us!", "Wave hello!", "Film it, film it!", "They come in peace!"],
  events: ["abduccion", "vacas", "agentes", "alien", "abduccion", "vacas"],
  goal: o => o.kind === "barrier", goalMaxY: 26,
  lines: {
    abduccion: "A green beam lifted several attendees; one came back with a souvenir keychain.",
    vacas: "The cows crossed the cornfield without making eye contact with anyone.",
    agentes: "Some men in black asked everyone to look at a little light. Nobody remembers anything.",
    alien: "An alien took selfies with half the town and asked for the wifi password.",
  },
  quotes: ["“I always said there was something weird about that cornfield,” said Don Chuy.", "“They abducted me and sent me back because I didn't have my ID on me,” said a neighbor.", "“There was no UFO,” clarified a man in dark sunglasses."],
  build() {
    ringSegs(RANCH.x, RANCH.y, RANCH.r, 18, "barrier", () => false);
    rect(1, 30, 8, 40, "barn"); circ(5, 44, 1.6, "silo");
    rect(33, 32, 39, 37, "farmhouse");
    rect(31, 52, 34, 54.5, "haybale"); rect(7, 56, 10, 58.5, "haybale");
  },
  ground(g) {
    g.fillStyle = "#2f3f22"; g.fillRect(0, 0, WW, WH);
    // cornfield rows
    for (let x = 0; x < WW; x += .9) { g.fillStyle = "rgba(20,30,12,.6)"; g.fillRect(x, 0, .25, FENCE_Y); g.fillStyle = "rgba(120,150,60,.35)"; g.fillRect(x + .4, 0, .15, FENCE_Y); }
    // crop circle
    g.fillStyle = "#4a5a2a"; g.beginPath(); g.arc(RANCH.x, RANCH.y, RANCH.r, 0, 7); g.fill();
    g.strokeStyle = "rgba(200,255,150,.45)"; g.lineWidth = .3;
    for (let r = 1.5; r < RANCH.r; r += 1.4) { g.beginPath(); g.arc(RANCH.x, RANCH.y, r, 0, 7); g.stroke(); }
    for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; g.beginPath(); g.arc(RANCH.x + Math.cos(a) * 4, RANCH.y + Math.sin(a) * 4, .9, 0, 7); g.stroke(); }
    g.fillStyle = "#4a3a2a"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
  },
  decor(g) {
    for (const o of obs) if (o.kind === "barrier") { g.lineWidth = .25; g.strokeStyle = "#ffd23a"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
    g.fillStyle = "#8f2a1c"; g.fillRect(1, 30, 7, 10); g.strokeStyle = "#f4f4f2"; g.lineWidth = .2; g.strokeRect(1.4, 30.4, 6.2, 9.2); g.beginPath(); g.moveTo(1.4, 30.4); g.lineTo(7.6, 39.6); g.moveTo(7.6, 30.4); g.lineTo(1.4, 39.6); g.stroke();
    g.fillStyle = "#c9ced6"; g.beginPath(); g.arc(5, 44, 1.6, 0, 7); g.fill();
    g.fillStyle = "#e8e2d0"; g.fillRect(33, 32, 6, 5); g.fillStyle = "#6b4a2b"; g.fillRect(33, 32, 6, 1.4);
    for (const o of obs) if (o.kind === "haybale") { g.fillStyle = "#e3c25c"; g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0); }
    g.font = "900 .8px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#ffd23a";
    g.fillText("PRIVATE PROPERTY · NO ABDUCTIONS", RANCH.x, RANCH.y + RANCH.r + 1.2);
  },
  bulbs: Array.from({ length: 18 }, (_, i) => { const a = i / 18 * 6.283; return [RANCH.x + Math.cos(a) * (RANCH.r + .5), RANCH.y + Math.sin(a) * (RANCH.r + .5)]; }),
  beams: [{ x: 20, y: 14, a: Math.PI / 2, sweep: 1.4, h: 12 }, { x: 20, y: 14, a: -Math.PI / 2 + .6, sweep: 1.4, h: 12 }, { x: 4, y: 62, a: -.8, sweep: .3, h: 6, white: true }, { x: 36, y: 62, a: -2.3, sweep: .3, h: 6, white: true }],
  extra3D(grp) {
    // barn roof, silo and farmhouse
    const roof = part(grp, "box", "#5a1a12", 7.6, .4, 10.6, 4.5, 4.1, 35); roof.rotation.z = .08;
    part(grp, "cyl", "#c9ced6", 1.6, 7, 1.6, 5, 3.5, 44); part(grp, "sph", "#9aa0a8", 1.6, .8, 1.6, 5, 7, 44);
  },
  ev: {
    abduccion() {
      const pts = [crowdPoint(), crowdPoint(), crowdPoint(), [rnd(5, 35), -12]];
      addMover({ kind: "ufo", beh: "hover", x: RANCH.x, y: RANCH.y, h: 8, pts, speed: 3.2, pause: 3.5, r: 2, push: 0, air: true, abduct: 2.3, beamOn: false,
        say: "VWOOOM!", sayEvery: 3.5, tick(m) { m.beamOn = !!m.wait && m.wait > .5 && m.i < 3; } });
      caption("The UFO is beaming people up!", true, 2200);
    },
    vacas() {
      const y = rnd(30, 58), side = Math.random() < .5;
      for (let n = 0; n < 4; n++) addMover({ kind: "cow", x: (side ? -2 : WW + 2) + (side ? -1 : 1) * n * 2.6, y: y + rnd(-2, 2), pts: [[side ? WW + 12 : -12, y + rnd(-6, 6)]], speed: 1.6, r: .9, push: 35, scare: 2, say: n ? "" : "MOOO!", sayEvery: 3 });
      addMover({ kind: "cow", float: true, beh: "hover", x: rnd(8, 32), y: rnd(25, 50), h: 2, pts: [[rnd(8, 32), rnd(20, 40)], [rnd(8, 32), -15]], speed: 1.2, r: .9, push: 0, air: true, tick(m) { m.h = Math.min(16, m.h + DT * .9); } });
      caption("Cows! And one of them is floating", true, 1800);
    },
    agentes() {
      for (let n = 0; n < 3; n++) addMover({ kind: "mib", x: openGateX() + n, y: SH + n, pts: [crowdPoint(), crowdPoint(), [openGateX(), SH + 3]], speed: 2, r: .45, push: 20, calm: 4, say: n ? "" : "LOOK OVER HERE!", sayEvery: 4 });
      later(4, () => { if (phase === "show") { flash = 1.4; pop(20, 40, "FLASH!"); cheerT = 0; for (const a of ag) a.ps *= .3; } });
      caption("Some men in black have arrived", false, 1800);
    },
    alien() {
      addMover({ kind: "alien", x: RANCH.x, y: RANCH.y + 2, pts: [[RANCH.x, RANCH.y + RANCH.r + 3], crowdPoint(), crowdPoint(), [RANCH.x, RANCH.y]], speed: .9, r: .35, push: 10, say: "WIFI?", sayEvery: 3.5, tick: followTick(13, 2.8, .45) });
      caption("An alien came out! Everyone wants a selfie", true, 2200);
    },
  },
  performers: () => [{ kind: "ufo", orbit: [RANCH.x, RANCH.y, .01, 0, 0], h: 3.2, x: 0, y: 0, ang: 0, t: 0, beamOn: false }],
};
