// Marea Humana · escenario: El Taco Gigante (récord mundial; todos quieren una mordida)
SCENES.taco = {
  name: "El Taco Gigante", tag: "Récord mundial de taco", outside: "#9a8f7a", bulbH: 2.2, music: "mariachi",
  light: { sky: 0xfff1d6, ground: 0x7a6a50, hemi: .6, sun: 0xffe2b0, sunI: 1.3 }, crowd: 3600, fenceBudget: 70, maxGates: 5, guards: 4,
  gates: [F, F, T, F, T, F, F], unlock: 12,
  intro: "Prepararon un taco de 28 metros para romper el récord mundial. Hay trompo, salsa por litros, chiles que explotan y un taquero que regala tacos al que lo alcance.",
  acts: ["¡Que no falte la salsa!", "¡Otro de pastor!", "¡Con todo, joven!", "¡Récord mundial!"],
  events: ["salsa", "taquero", "chile", "mariachis", "dogs", "taquero"],
  goal: o => o.kind === "barrier", goalMaxY: 20,
  lines: {
    salsa: "Se regó un tambo de salsa y el suelo quedó como pista de hielo.",
    taquero: "Un taquero repartió tacos gratis en movimiento y lo siguieron tres cuadras.",
    chile: "Un chile habanero explotó y nadie lloró… mucho.",
    mariachis: "Los mariachis acompañaron cada mordida.",
    dogs: "Los perros callejeros se llevaron el récord de tacos comidos.",
  },
  quotes: ["«Le faltó sal», opinó un crítico gastronómico.", "«Yo traje mis tortillas por si acaso», dijo una señora precavida.", "«El récord es nuestro, pero el taco ya no», lamentó el chef."],
  build() {
    rect(5, 0, 35, 7, "tacotable");
    seg(2, 8.6, WW - 2, 8.6, .4, "barrier");
    circ(20, 40, 1.3, "trompo");
    rect(1, 20, 4.5, 28, "taqueria"); rect(WW - 4.5, 20, WW - 1, 28, "taqueria"); rect(1, 46, 4.5, 54, "taqueria"); rect(WW - 4.5, 46, WW - 1, 54, "taqueria");
    rect(14, 52, 26, 54, "salsabar");
  },
  ground(g) {
    g.fillStyle = "#d9c9a8"; g.fillRect(0, 0, WW, WH);
    for (let y = 0, i = 0; y < FENCE_Y; y += 1, i++) for (let x = 0; x < WW; x += 1) { g.fillStyle = (Math.floor(x) + i) % 2 ? "#d2c19e" : "#dccdab"; g.fillRect(x, y, 1, 1); }
    g.fillStyle = "#9a8f7a"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
  },
  decor(g) {
    g.fillStyle = "#8a5a34"; g.fillRect(5, 0, 30, 7);
    g.font = "900 .9px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#ffd23a"; g.fillText("RÉCORD MUNDIAL · 28 METROS DE TACO", 20, 6.4);
    for (const o of obs) if (o.kind === "barrier") { g.lineWidth = .3; g.strokeStyle = "#3d9a5b"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
    for (const o of obs) if (o.kind === "taqueria") { g.fillStyle = "#d8322b"; g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0); for (let y = o.y0; y < o.y1; y += 1) { g.fillStyle = "#ffffff"; g.fillRect(o.x0, y, o.x1 - o.x0, .4); } }
    g.fillStyle = "#f4f4f2"; g.fillRect(14, 52, 12, 2);
    for (let x = 14.5, i = 0; x < 26; x += 1.4, i++) { g.fillStyle = ["#d8322b", "#3d9a5b", "#ff9a3c", "#7a3a1a"][i % 4]; g.beginPath(); g.arc(x + .4, 53, .4, 0, 7); g.fill(); }
    // papel picado colgando sobre el público
    const cols = ["#ff3fa4", "#ffd23a", "#22d3ee", "#7dff6a", "#ff6a3c", "#a98bff"];
    for (let y = 16; y < 62; y += 9) for (let x = 1, i = 0; x < WW; x += 1.2, i++) { g.fillStyle = cols[(i + y) % cols.length]; g.globalAlpha = .85; g.fillRect(x, y + Math.sin(i) * .3, .9, .7); }
    g.globalAlpha = 1;
  },
  bulbs: Array.from({ length: 30 }, (_, i) => [2.5 + i * 1.22, 9]),
  beams: [{ x: 10, y: 7, a: Math.PI / 2, sweep: .5, h: 7 }, { x: 30, y: 7, a: Math.PI / 2, sweep: .5, h: 7 }],
  extra3D(grp) {
    // el taco: tortilla doblada (dos medias lunas) con relleno encima
    for (const z of [1.8, 5.2]) { const t = part(grp, "sph", mat("#f2d48a", { roughness: .9 }), 14.5, 1.2, 1.5, 20, 1.6, z); t.rotation.x = z < 3 ? -.5 : .5; }
    part(grp, "sph", "#e9c46a", 14.2, .5, 2.4, 20, 1.2, 3.5);
    for (let x = 7; x < 33; x += .8) {
      part(grp, "sph", ["#7a3a1a", "#a8401f", "#8f4a1c"][Math.round(x * 2) % 3], .55, .4, .9, x + Math.sin(x) * .2, 2.2, 3.5);
      part(grp, "sph", ["#3d9a5b", "#ffffff", "#d8322b", "#ffd23a"][Math.round(x * 3) % 4], .22, .16, .22, x + .3, 2.75, 3.1 + Math.cos(x * 1.7) * .6);
    }
    // el trompo de pastor con piña
    const tr = new THREE.Group(); tr.position.set(20, 0, 40); grp.add(tr);
    part(tr, "cyl", "#5d6470", .06, 3.4, .06, 0, 1.7, 0);
    const meat = part(tr, "cone", "#b5541c", .9, 2, .9, 0, 1.8, 0); meat.rotation.x = Math.PI;
    part(tr, "sph", "#ffd23a", .35, .45, .35, 0, 3.1, 0); part(tr, "cone", "#3d9a5b", .2, .4, .2, 0, 3.6, 0);
    G3.trompo = tr;
  },
  ev: {
    salsa() { const [x, y] = crowdPoint(); slipT = 7; for (let k = 0; k < 45; k++) puff(x + rnd(-5, 5), y + rnd(-4, 4), .1, "#c4241c", .5, 5, .02); pop(x, y, "¡SE REGÓ LA SALSA!"); caption("¡Salsa en el piso! Nadie puede frenar", true, 2200); },
    taquero() {
      const pts = [crowdPoint(), crowdPoint(), crowdPoint(), crowdPoint(), [openGateX(), SH + 3]];
      addMover({ kind: "tacocart", x: openGateX(), y: SH, pts, speed: 1.3, r: .8, push: 10, say: "¡TACOS GRATIS!", sayEvery: 3, tick: followTick(12, 3.2, .3) });
      caption("¡Un taquero regala tacos al que lo alcance!", true, 2000);
    },
    chile() {
      const [tx, ty] = crowdPoint();
      addMover({ kind: "chile", beh: "fly", x: 20, y: 40, sx: 20, sy: 40, tx, ty, dur: 1.4, r: .2, push: 0, air: true, say: "¡PICA!", sayEvery: 9 });
      later(1.45, () => { for (let k = 0; k < 30; k++) puff(tx + rnd(-2, 2), ty + rnd(-2, 2), rnd(.5, 2), "#ff6a3c", .6, 2.5, 1); });
      caption("¡Voló un chile habanero!", true, 1800);
    },
    mariachis() { SCENES.boda.ev.mariachis(); },
  },
  performers: () => [{ kind: "taquero", orbit: [20, 41.6, .01, 0, 0], x: 0, y: 0, ang: -Math.PI / 2, t: 0 }],
};
