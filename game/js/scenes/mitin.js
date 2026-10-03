// Human Tide · scene: The Duck Rally (fictional campaign, genuinely absurd promises)
const PROMISES = ["Optional Mondays!", "Wifi on the Moon!", "Tacos at 1998 prices!", "Zero traffic on Tuesdays!", "Mandatory naps!",
  "A duck in every home!", "Rain only at night!", "Traffic lights that wait for everyone!", "Double AND triple Christmas bonus!", "Birthdays twice a year!"];
SCENES.mitin = {
  name: "The Duck Rally", tag: "Closing campaign rally", outside: "#a6a197", bulbH: 2.0, music: "brass",
  light: { sky: 0xfff3e0, ground: 0x7d786c, hemi: .6, sun: 0xffecd0, sunI: 1.3 }, crowd: 3400, fenceBudget: 70, maxGates: 5, guards: 4,
  gates: [F, T, F, T, F, T, F], unlock: 10,
  intro: "Candidate Duck's closing campaign rally. There are free sandwiches, busloads of supporters keep rolling in and there's a brand-new promise every five minutes.",
  acts: ["Vote Duck!", "Quack, quack, quack!", "We can see it, we can feel it!", "Promise kept!"],
  events: ["promesas", "tortas", "acarreados", "botargas", "huevazo", "promesas"],
  goal: o => o.kind === "barrier", goalMaxY: 22,
  lines: {
    promesas: "The candidate promised “optional Mondays” and the crowd got way too excited.",
    tortas: "The free sandwiches ran out in forty seconds; the line is still there.",
    acarreados: "Busloads of supporters showed up with no idea what they were there for.",
    botargas: "Three duck mascots danced nonstop, with no breaks and no contract.",
    huevazo: "An egg sailed across the sky and hit an advisor instead of the candidate.",
  },
  quotes: ["“Quack,” the candidate told the press.", "“They gave me a sandwich and a cap; I'm still thinking about my vote,” confessed one attendee.", "“Two million people showed up,” estimated the campaign team."],
  build() {
    rect(8, 0, 32, 8, "stage");
    rect(4, 2, 7, 6, "speaker"); rect(33, 2, 36, 6, "speaker");
    seg(2, 9.6, WW - 2, 9.6, .4, "barrier");
    rect(17, 32, 23, 35, "riser");
    rect(1, 40, 4, 48, "foodtruck"); rect(WW - 4, 40, WW - 1, 48, "foodtruck");
  },
  ground(g) {
    g.fillStyle = "#c9c3b5"; g.fillRect(0, 0, WW, WH);
    const rand = rng(41);
    for (let k = 0; k < 1300; k++) { g.fillStyle = ["#ffd23a", "#2f6fc4", "#ffffff"][k % 3]; g.globalAlpha = .5; g.fillRect(rand() * WW, rand() * FENCE_Y, .25, .12); }
    g.globalAlpha = 1;
    g.fillStyle = "#a6a197"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
  },
  decor(g) {
    g.fillStyle = "#2f6fc4"; g.fillRect(8, 0, 24, 8);
    g.fillStyle = "#ffd23a"; g.fillRect(8, 6.5, 24, 1.5);
    g.font = "900 2.4px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#ffd23a"; g.fillText("VOTE DUCK!", 20, 3.2);
    g.font = "900 .9px Rubik, sans-serif"; g.fillStyle = "#2f6fc4"; g.fillText("CHANGE WE CAN QUACK", 20, 7.3);
    g.fillStyle = "#151617"; for (const o of obs) if (o.kind === "speaker") g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0);
    for (const o of obs) if (o.kind === "barrier") { g.lineWidth = o.th; g.strokeStyle = "#2b2f35"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
    g.fillStyle = "#4a4d55"; g.fillRect(17, 32, 6, 3); g.fillStyle = "#151617"; for (let x = 17.5; x < 23; x += 1.4) g.fillRect(x, 32.4, .8, .5);
    for (const o of obs) if (o.kind === "foodtruck") { g.fillStyle = "#ff6a3c"; g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0); g.fillStyle = "#ffd23a"; g.fillRect(o.x0 + .3, o.y0 + 1, o.x1 - o.x0 - .6, 6); }
    // banners and balloons
    const rand = rng(2);
    for (let k = 0; k < 18; k++) { const x = 2 + rand() * 36, y = 14 + rand() * 48; g.fillStyle = "#ffffff"; g.fillRect(x - .9, y - .35, 1.8, .7); g.fillStyle = "#2f6fc4"; g.font = "900 .4px Rubik, sans-serif"; g.fillText("DUCK 2030", x, y + .03); }
  },
  bulbs: Array.from({ length: 30 }, (_, i) => [2.5 + i * 1.22, 10]),
  beams: [{ x: 12, y: 8, a: Math.PI / 2, sweep: .6, h: 8 }, { x: 28, y: 8, a: Math.PI / 2, sweep: .6, h: 8 }],
  extra3D(grp) {
    // giant inflatable duck behind the stage
    part(grp, "sph", "#ffd23a", 4, 3, 3.2, 20, 4.8, 3);
    part(grp, "sph", "#ffd23a", 2, 2, 2, 23.5, 8.5, 3);
    part(grp, "sph", "#ff9a3c", 1.3, .45, 1.1, 25.6, 8.2, 3);
    for (const s of [-1, 1]) { part(grp, "sph", "#ffffff", .5, .5, .5, 24.8, 9.2, 3 + s * .9); part(grp, "sph", "#111214", .25, .25, .25, 25.2, 9.3, 3 + s * .9); }
    part(grp, "box", "#2f6fc4", .4, 1.2, .1, 20, 2.6, 7.95);
    // yellow and blue balloons
    for (let i = 0; i < 12; i++) { const x = 2 + i * 3.3, y = i % 2 ? 9.2 : 9.9; part(grp, "cyl", "#ffffff", .01, 3, .01, x, 1.5, y); part(grp, "sph", i % 2 ? "#2f6fc4" : "#ffd23a", .35, .45, .35, x, 3.2, y); }
  },
  ev: {
    promesas() { caption(`Promise: ${pick(PROMISES)}`, true, 2600); burst(200); cheerT = 2; pop(20, 9, "QUACK!"); },
    tortas() {
      const side = Math.random() < .5, x = side ? 5.5 : WW - 5.5, y = 44;
      addMover({ kind: "truck", col: "#ff6a3c", x: side ? -6 : WW + 6, y: 56, pts: [[x, 56], [x, 52]], speed: 3, r: 1.4, push: 30, scare: 2, say: "FREE SANDWICHES!", sayEvery: 2.5 });
      later(3, () => { if (phase === "show") { tempAttract(x, 50, 3, 8, .45); pop(x, 50, "SANDWICHES!"); } });
      caption("Free sandwiches! Nobody push (everybody pushes)", true, 2200);
    },
    acarreados() {
      const side = Math.random() < .5, x = side ? 10 : 30;
      addMover({ kind: "bus", x: side ? -6 : WW + 6, y: 61, pts: [[x, 61], [x, 61], [side ? WW + 8 : -8, 61]], speed: 4, r: 1.6, push: 40, scare: 3, say: "WE'RE HERE!", sayEvery: 4 });
      later(2.2, () => { if (phase === "show") { const n = spawnAt(x, 58, 220); pop(x, 58, `+${n} SUPPORTERS`); } });
      caption("A busload of supporters just arrived!", true, 2200);
    },
    botargas() { for (let n = 0; n < 3; n++) addMover({ kind: "duckmascot", x: openGateX(), y: SH + n, pts: [crowdPoint(), crowdPoint(), crowdPoint(), [openGateX(), SH + 3]], speed: 1.8, r: .7, push: 10, scare: 1.4, say: n ? "" : "QUACK QUACK!", sayEvery: 3 }); caption("The duck mascots have arrived!", false, 1600); },
    huevazo() {
      const [sx, sy] = crowdPoint();
      addMover({ kind: "egg", beh: "fly", x: sx, y: sy, sx, sy, tx: rnd(12, 28), ty: 8.5, dur: 1.2, r: .2, push: 0, air: true, small: true, say: "SPLAT!", sayEvery: 9 });
      caption("Egg attack! Missed by three meters", false, 1500);
    },
  },
  performers: () => [{ kind: "duckmascot", orbit: [20, 5.2, .01, 0, 0], h: 1.8, x: 0, y: 0, ang: Math.PI / 2, t: 0 }],
};
