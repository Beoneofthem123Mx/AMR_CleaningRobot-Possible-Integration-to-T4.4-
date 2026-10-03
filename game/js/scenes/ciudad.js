// Marea Humana · escenario: La Ciudad (festival nocturno; toda la ciudad es el escenario)
const BLOCKS_X = [[0, 7], [12, 17.5], [22.5, 28], [33, WW]], BLOCKS_Y = [[20, 30], [35, 45], [50, 60]];
SCENES.ciudad = {
  name: "La Ciudad", tag: "Festival nocturno", outside: "#2a2d33", bulbH: 2.2, night: true, music: "edm",
  light: { sky: 0x6c7fb8, ground: 0x1d2028, hemi: .42, sun: 0xbccbff, sunI: .85 }, crowd: 3800, fenceBudget: 80, maxGates: 5, guards: 5,
  gates: [F, T, F, T, F, T, F], unlock: 9,
  intro: "Toda la ciudad es el escenario. Calles llenas entre edificios altos, fuegos artificiales, un desfile y taxis que no saben que la calle está cerrada.",
  acts: ["¡La ciudad está de fiesta!", "¡Más fuerte!", "¡Todas las calles cantan!", "¡Último tema!"],
  events: ["fuegos", "taxi", "carroza", "policia", "fuegos", "dogs", "taxi"],
  goal: o => o.kind === "barrier", goalMaxY: 20,
  build() {
    rect(12, 0, 28, 5, "stage");
    rect(8.5, 1, 11, 4, "speaker"); rect(29, 1, 31.5, 4, "speaker");
    seg(0, 6.4, WW, 6.4, .5, "barrier");
    circ(20, 13.5, 1.8, "fountain");
    const rand = rng(77);
    for (const [x0, x1] of BLOCKS_X) for (const [y0, y1] of BLOCKS_Y) { const b = rect(x0, y0, x1, y1, "building"); b.hb = 6 + Math.floor(rand() * 10); b.tone = (rand() * 4) | 0; }
  },
  ground(g) {
    g.fillStyle = "#2a2d33"; g.fillRect(0, 0, WW, WH);
    // plaza de adoquín
    g.fillStyle = "#4a4b52"; g.fillRect(0, 6.4, WW, 13.6);
    g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = .05;
    for (let x = 0; x < WW; x += .6) { g.beginPath(); g.moveTo(x, 6.4); g.lineTo(x, 20); g.stroke(); }
    for (let y = 6.4; y < 20; y += .6) { g.beginPath(); g.moveTo(0, y); g.lineTo(WW, y); g.stroke(); }
    // banquetas alrededor de las manzanas
    g.fillStyle = "#5b5d63";
    for (const [x0, x1] of BLOCKS_X) for (const [y0, y1] of BLOCKS_Y) g.fillRect(x0 - .9, y0 - .9, x1 - x0 + 1.8, y1 - y0 + 1.8);
    // líneas de carril y pasos de cebra
    g.strokeStyle = "rgba(255,210,58,.55)"; g.lineWidth = .12; g.setLineDash([1, 1]);
    for (const x of [9.5, 20, 30.5]) { g.beginPath(); g.moveTo(x, 20); g.lineTo(x, FENCE_Y); g.stroke(); }
    for (const y of [32.5, 47.5, 63]) { g.beginPath(); g.moveTo(0, y); g.lineTo(WW, y); g.stroke(); }
    g.setLineDash([]);
    g.fillStyle = "rgba(255,255,255,.55)";
    for (const x of [9.5, 20, 30.5]) for (const y of [32.5, 47.5]) for (let k = -2; k <= 2; k++) g.fillRect(x - 2.2, y + k * .6 - .15, 4.4, .3);
    g.fillStyle = "#24272c"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
  },
  decor(g) {
    // azoteas: tinacos, aires acondicionados y luces
    const rand = rng(3), tones = ["#3a3e48", "#46404a", "#3b4640", "#4a4438"];
    for (const o of obs) if (o.kind === "building") {
      g.fillStyle = tones[o.tone]; g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0);
      g.strokeStyle = "rgba(255,255,255,.12)"; g.lineWidth = .15; g.strokeRect(o.x0 + .2, o.y0 + .2, o.x1 - o.x0 - .4, o.y1 - o.y0 - .4);
      for (let k = 0; k < 4; k++) { g.fillStyle = "#8a8f99"; g.fillRect(o.x0 + .6 + rand() * (o.x1 - o.x0 - 2), o.y0 + .6 + rand() * (o.y1 - o.y0 - 2), .9, .7); }
      g.fillStyle = "#1c1d22"; g.beginPath(); g.arc(o.x0 + (o.x1 - o.x0) * .7, o.y0 + 1.6, .6, 0, 7); g.fill();
      g.fillStyle = "#ff4fd8"; g.fillRect(o.x0 + .3, o.y1 - .5, o.x1 - o.x0 - .6, .12);
    }
    // escenario con pantalla y fuente
    g.fillStyle = "#121318"; g.fillRect(12, 0, 16, 5);
    const led = g.createLinearGradient(12, 0, 28, 0); led.addColorStop(0, "#22d3ee"); led.addColorStop(.5, "#ff3fa4"); led.addColorStop(1, "#ffd23a");
    g.fillStyle = led; g.fillRect(12.5, .3, 15, 1.2);
    g.fillStyle = "#0e0f12"; for (const o of obs) if (o.kind === "speaker") g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0);
    for (const o of obs) if (o.kind === "barrier") { g.lineWidth = o.th; g.strokeStyle = "#16171b"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
    g.fillStyle = "#c9ced6"; g.beginPath(); g.arc(20, 13.5, 1.8, 0, 7); g.fill(); g.fillStyle = "#3fa9e0"; g.beginPath(); g.arc(20, 13.5, 1.4, 0, 7); g.fill();
  },
  bulbs: [...Array.from({ length: 12 }, (_, i) => [12.6 + i * 1.35, 5.3]),
          ...[9.5, 20, 30.5].flatMap(x => [22, 27, 37, 42, 52, 57].map(y => [x + (x === 20 ? 2.2 : 0), y]))],
  beams: [{ x: 14, y: 5, a: Math.PI / 2, sweep: .7, h: 7 }, { x: 20, y: 5, a: Math.PI / 2, sweep: .7, h: 7 }, { x: 26, y: 5, a: Math.PI / 2, sweep: .7, h: 7 },
          { x: 3, y: 19, a: 0.4, sweep: .5, h: 20, white: true }, { x: 37, y: 19, a: Math.PI - .4, sweep: .5, h: 20, white: true }],
  extra3D(grp) {
    // faroles en las calles
    const lampMat = mat("#2a2c31", { metalness: .5, roughness: .4 }), glow = basic("#ffd98a");
    for (const x of [7.6, 32.4]) for (const y of [22, 30, 37, 45, 52, 60]) {
      part(grp, "cyl", lampMat, .08, 3.6, .08, x, 1.8, y); part(grp, "sph", glow, .22, .22, .22, x, 3.65, y);
    }
  },
  performers: () => [{ kind: "dj", orbit: [20, 2.8, .01, 0, 0], h: 1.8, x: 0, y: 0, ang: Math.PI / 2, t: 0 }],
};
