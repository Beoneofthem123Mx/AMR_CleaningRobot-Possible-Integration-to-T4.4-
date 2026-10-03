// Marea Humana · escenario: Llega la Estrella (aeropuerto lleno de fans esperando a su ídolo)
SCENES.aeropuerto = {
  name: "Llega la Estrella", tag: "Sala de llegadas internacionales", outside: "#8a8f99", bulbH: 2.4, music: "lounge",
  light: { sky: 0xf4f8ff, ground: 0x7a808a, hemi: .7, sun: 0xf8fbff, sunI: 1.05 }, crowd: 3800, fenceBudget: 70, maxGates: 5, guards: 5,
  gates: [F, F, T, F, T, F, F], unlock: 16,
  intro: "Tres mil fans esperan a su ídolo pop en la sala de llegadas. Cuando sale, todos lo siguen. Hay maletas sueltas, carritos eléctricos y un perro que lo huele todo.",
  acts: ["¡Ya aterrizó!", "¡Te amamos!", "¡Una foto, una foto!", "¡Mírame a mí!"],
  events: ["idolo", "maletas", "carrito", "k9", "idolo", "retraso"],
  goal: o => o.kind === "barrier", goalMaxY: 20,
  lines: {
    idolo: "El ídolo salió por la puerta equivocada y tres mil personas lo siguieron hasta el estacionamiento.",
    maletas: "Varias maletas escaparon de la banda y recorrieron la sala solas.",
    carrito: "Un carrito eléctrico pitó durante dos horas seguidas.",
    k9: "El perro antidrogas encontró únicamente tortas.",
    retraso: "El vuelo se retrasó tres veces; los fans no se movieron ni un centímetro.",
  },
  quotes: ["«Me miró. Bueno, miró hacia acá», aseguró una fan.", "«Yo solo quería recoger mi maleta», dijo un pasajero que salió en la tele.", "«Nunca habíamos visto algo así», reconoció el aeropuerto."],
  build() {
    rect(10, 0, 30, 4, "arrivals");
    seg(2, 7, 17, 7, .3, "barrier"); seg(23, 7, WW - 2, 7, .3, "barrier");
    seg(17, 7, 17, 14, .3, "barrier"); seg(23, 7, 23, 14, .3, "barrier"); seg(17, 14, 23, 14, .3, "barrier");
    rect(5, 22, 11, 38, "carousel"); rect(29, 22, 35, 38, "carousel");
    circ(20, 46, 1.6, "info");
    for (let x = 4; x < 36; x += 8) rect(x, 56, x + 4, 57.5, "counter");
  },
  ground(g) {
    g.fillStyle = "#e6e9ee"; g.fillRect(0, 0, WW, WH);
    for (let y = 0, i = 0; y < FENCE_Y; y += 1.2, i++) for (let x = 0, j = 0; x < WW; x += 1.2, j++) { g.fillStyle = (i + j) % 2 ? "#dfe3e9" : "#eceff3"; g.fillRect(x, y, 1.2, 1.2); }
    // pasillo de llegada
    g.fillStyle = "#3f6fb5"; g.fillRect(17, 4, 6, 10);
    g.fillStyle = "#8a8f99"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
  },
  decor(g) {
    g.fillStyle = "#9fc4e8"; g.fillRect(10, 0, 20, 4); g.fillStyle = "#c9ced6"; for (let x = 10; x < 30; x += 2.5) g.fillRect(x, 0, .2, 4);
    g.font = "900 1.1px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#151617"; g.fillText("LLEGADAS · ARRIVALS", 20, 2);
    for (const o of obs) if (o.kind === "barrier") { g.lineWidth = .25; g.strokeStyle = "#ffd23a"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
    for (const o of obs) if (o.kind === "carousel") {
      g.fillStyle = "#4a4d55"; g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0);
      g.fillStyle = "#2b2d33"; g.fillRect(o.x0 + 1, o.y0 + 1, o.x1 - o.x0 - 2, o.y1 - o.y0 - 2);
      for (let y = o.y0 + .3; y < o.y1; y += 1.3) { g.fillStyle = ["#d8322b", "#2f6fc4", "#3d9a5b", "#e8b631"][Math.round(y) % 4]; g.fillRect(o.x0 + .15, y, .7, .5); g.fillRect(o.x1 - .85, y + .6, .7, .5); }
    }
    g.fillStyle = "#2f6fc4"; g.beginPath(); g.arc(20, 46, 1.6, 0, 7); g.fill(); g.fillStyle = "#ffffff"; g.font = "900 1.4px Rubik, sans-serif"; g.fillText("i", 20, 46.1);
    for (const o of obs) if (o.kind === "counter") { g.fillStyle = "#5d6470"; g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0); }
    // pancartas de fans
    const rand = rng(7), signs = ["TE AMO", "¡CÁSATE CONMIGO!", "MIRA AQUÍ", "FIRMA MI BRAZO", "#1 FAN"];
    g.font = "900 .45px Rubik, sans-serif";
    for (let k = 0; k < 16; k++) { const x = 3 + rand() * 34, y = 10 + rand() * 44; g.fillStyle = ["#ff6fb1", "#ffffff", "#ffd23a"][k % 3]; g.fillRect(x - 1, y - .35, 2, .7); g.fillStyle = "#151617"; g.fillText(signs[k % signs.length], x, y + .02); }
  },
  bulbs: Array.from({ length: 20 }, (_, i) => [2.5 + i * 1.9, 7.3]),
  beams: [{ x: 20, y: 4, a: Math.PI / 2, sweep: .4, h: 9, white: true }, { x: 12, y: 4, a: Math.PI / 2, sweep: .6, h: 9 }, { x: 28, y: 4, a: Math.PI / 2, sweep: .6, h: 9 }],
  extra3D(grp) {
    // pantalla de vuelos colgando y columnas
    part(grp, "box", "#151617", 8, 2.2, .3, 20, 6, 18);
    part(grp, "box", basic("#ffd23a"), 7.6, .25, .32, 20, 6.6, 18); part(grp, "box", basic("#7dff6a"), 7.6, .25, .32, 20, 6, 18); part(grp, "box", basic("#ff3b2f"), 7.6, .25, .32, 20, 5.4, 18);
    for (const x of [2, 38]) for (let y = 16; y < 60; y += 14) part(grp, "box", "#c9ced6", .8, 7, .8, x, 3.5, y);
  },
  ev: {
    idolo() {
      const pts = [[20, 10], [20, 16], crowdPoint(), crowdPoint(), crowdPoint(), [openGateX(), 64], [openGateX(), SH + 3]];
      addMover({ kind: "idol", x: 20, y: 2, pts, speed: 1.5, r: .45, push: 20, calm: 2.2, say: "¡HOLA, FANS!", sayEvery: 3, tick: followTick(18, 3, .65) });
      for (let n = 0; n < 2; n++) addMover({ kind: "bodyguard", x: 19 + n * 2, y: 1, pts: pts.map(([x, y]) => [x + (n ? 1.1 : -1.1), y + .4]), speed: 1.5, r: .55, push: 45, scare: 1.6 });
      caption("¡SALIÓ! ¡AHÍ VA!", true, 2400); flash = .8; cheerT = 3;
    },
    maletas() {
      for (let n = 0; n < 6; n++) { const c = n % 2 ? 11.5 : 28.5; addMover({ kind: "suitcase", beh: "bounce", x: c, y: rnd(24, 36), vx: (n % 2 ? 1 : -1) * rnd(2, 4), vy: rnd(-3, 3), r: .45, push: 12, life: 12, col: pick(["#d8322b", "#2f6fc4", "#e8b631", "#8a4fbf", "#151617"]) }); }
      caption("¡Las maletas escaparon de la banda!", false, 1800);
    },
    carrito() { const y = rnd(40, 62), side = Math.random() < .5; addMover({ kind: "aircart", x: side ? -3 : WW + 3, y, pts: [[side ? WW + 4 : -4, y + rnd(-3, 3)]], speed: 3, r: 1, push: 35, scare: 2.6, say: "¡PI-PI-PI!", sayEvery: 1.2 }); caption("Un carrito eléctrico quiere pasar", false, 1600); },
    k9() { const gx = openGateX(); addMover({ kind: "dog", col: "#3b2a20", x: gx, y: SH, pts: [crowdPoint(), crowdPoint(), crowdPoint(), [gx, SH + 3]], speed: 2.4, r: .35, push: 15, scare: 1.4, say: "¡SNIF, SNIF!", sayEvery: 3 }); caption("Pasa el perro de seguridad", false, 1500); },
    retraso() { caption("Aviso: el vuelo viene retrasado (otra vez)", false, 2400); pop(20, 9, "¡NOOO!"); cheerT = 0; surgeT = 0; for (const a of ag) a.vx *= .2; },
  },
  performers: () => [],
};
