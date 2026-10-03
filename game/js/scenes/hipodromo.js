// Marea Humana · escenario: El Hipódromo (Gran Premio)
// La pista cruza el recinto de lado a lado; el público se pega a la valla para ver la carrera.
const TRACK_Y = 12.6;
SCENES.hipodromo = {
  name: "El Hipódromo", tag: "Gran Premio", outside: "#7aa35a", bulbH: 1.2, music: "brass",
  light: { sky: 0xfff0d8, ground: 0x6d6448, hemi: .6, sun: 0xffe6c2, sunI: 1.3 }, crowd: 3300, fenceBudget: 70, maxGates: 5, guards: 4,
  gates: [F, T, F, T, F, T, F], unlock: 6,
  intro: "Día de Gran Premio. Los caballos pasan pegados a la valla, el público se amontona para ver la meta y algún caballo se desboca.",
  acts: ["¡Recta final!", "¡Foto finish!", "¡Arrancan!", "¡Gana por una nariz!"],
  events: ["carrera", "carrera", "desbocado", "tractor", "carrera", "desbocado", "dogs"],
  goal: o => o.kind === "rail", goalMaxY: 20,
  build() {
    seg(0, TRACK_Y, WW, TRACK_Y, .4, "rail");
    rect(0, 17, 5, 50, "grandstand"); rect(WW - 5, 17, WW, 50, "grandstand");
    rect(16, 44, 24, 46.5, "tote");
    circ(20, 31, 2.2, "winner");
    rect(7, 54, 10.5, 57.5, "popcorn"); rect(29.5, 54, 33, 57.5, "candy");
  },
  ground(g) {
    g.fillStyle = "#7aa35a"; g.fillRect(0, 0, WW, WH);
    const rand = rng(17);
    for (let k = 0; k < 1500; k++) { g.fillStyle = k % 2 ? "rgba(40,80,30,.22)" : "rgba(170,210,120,.25)"; g.fillRect(rand() * WW, rand() * WH, .08, .22); }
    // pista de arena con huellas
    g.fillStyle = "#b9895a"; g.fillRect(0, 0, WW, TRACK_Y);
    for (let k = 0; k < 900; k++) { g.fillStyle = k % 3 ? "rgba(90,60,30,.25)" : "rgba(240,210,170,.25)"; g.fillRect(rand() * WW, .3 + rand() * (TRACK_Y - .6), .08, .14); }
    // meta a cuadros
    for (let y = 0, i = 0; y < TRACK_Y; y += .5, i++) for (let c = 0; c < 2; c++) { g.fillStyle = (i + c) % 2 ? "#ffffff" : "#151617"; g.fillRect(30 + c * .5, y, .5, .5); }
    // explanada frente a la valla
    g.fillStyle = "#c8c2b0"; g.fillRect(5, TRACK_Y, WW - 10, 8);
    g.fillStyle = "#9a9c98"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
  },
  decor(g) {
    for (const o of obs) if (o.kind === "rail") { g.lineWidth = .35; g.strokeStyle = "#ffffff"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
    g.lineWidth = .25; g.strokeStyle = "#ffffff"; g.beginPath(); g.moveTo(0, .4); g.lineTo(WW, .4); g.stroke();
    // cajones de salida
    g.fillStyle = "#2f6b3a"; g.fillRect(0, .6, 3.2, TRACK_Y - 1.2);
    g.fillStyle = "#e8e2d0"; for (let y = 1; y < TRACK_Y - .6; y += 1.4) g.fillRect(.2, y, 3, .2);
    // tribunas con público
    const rand = rng(9), fans = ["#d8322b", "#2f6fc4", "#e8b631", "#f4f4f0", "#3d9a5b", "#8a4fbf", "#ff8fc6"];
    for (const o of obs) if (o.kind === "grandstand") {
      g.fillStyle = "#e8e2d4"; g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0);
      for (let y = o.y0 + .4; y < o.y1; y += .55) for (let x = o.x0 + .3; x < o.x1; x += .5) { g.fillStyle = fans[(rand() * fans.length) | 0]; g.beginPath(); g.arc(x, y, .17, 0, 7); g.fill(); }
    }
    // pizarra de apuestas
    g.fillStyle = "#1b2a1f"; g.fillRect(16, 44, 8, 2.5);
    g.font = "700 .7px Rubik, sans-serif"; g.textAlign = "left"; g.textBaseline = "middle"; g.fillStyle = "#ffd23a";
    ["1 RELÁMPAGO 3-1", "2 TORNADO 5-2", "3 PIMIENTA 7-1"].forEach((t, i) => g.fillText(t, 16.3, 44.5 + i * .75));
    // círculo de ganadores con flores
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
    // techos de las tribunas y poste de la meta
    for (const x of [2.5, WW - 2.5]) { const roof = part(grp, "box", mat("#2f6b3a", { roughness: .5 }), 5.5, .3, 34, x, 6, 33.5); roof.receiveShadow = true; }
    for (const x of [.4, WW - .4]) for (let y = 19; y < 50; y += 7.5) part(grp, "cyl", "#e8e2d4", .15, 6, .15, x, 3, y);
    part(grp, "cyl", "#ffffff", .12, 4, .12, 30.5, 2, TRACK_Y + .2);
    part(grp, "sph", "#d8322b", .4, .4, .4, 30.5, 4.2, TRACK_Y + .2);
  },
  performers: () => [],
};
