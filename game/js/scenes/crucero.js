// Marea Humana · escenario: El Crucero (fiesta en la cubierta)
SCENES.crucero = {
  name: "El Crucero", tag: "Fiesta en altamar", outside: "#1d6fa5", bulbH: 1.6, music: "tropical",
  light: { sky: 0xeaf6ff, ground: 0x5b7286, hemi: .6, sun: 0xfff4e0, sunI: 1.3 }, crowd: 2600, fenceBudget: 60, maxGates: 5, guards: 3,
  gates: [F, F, T, F, T, F, F], noSlots: [0, 6], slotWhy: "Ahí está el casco del barco", unlock: 4,
  intro: "Fiesta en la cubierta con alberca al centro. El mar mueve el barco de lado a lado y las gaviotas no respetan a nadie.",
  acts: ["¡Fiesta en altamar!", "¡Todos a la alberca!", "¡Arriba las manos!", "¡Capitán, más fuerte!"],
  events: ["oleaje", "gaviotas", "flamenco", "bocina", "oleaje", "gaviotas", "flamenco"],
  goal: o => o.kind === "barrier", goalMaxY: 20,
  build() {
    rect(0, 0, 3, FENCE_Y, "hull"); rect(WW - 3, 0, WW, FENCE_Y, "hull"); rect(0, 0, WW, 2.5, "hull");
    seg(3, 11, 12, 2.5, 1, "hull"); seg(WW - 3, 11, WW - 12, 2.5, 1, "hull");
    rect(13, 2.5, 27, 8, "stage");
    seg(5.6, 9.6, WW - 5.6, 9.6, .5, "barrier");
    rect(14, 30, 26, 42, "pool");
    circ(8, 36, 1.7, "jacuzzi"); circ(32, 36, 1.7, "jacuzzi");
    for (const x of [6, 9.5, 29.5, 33]) for (let y = 47; y < 58; y += 3.2) rect(x, y, x + 1, y + 2, "lounger");
    rect(16, 52, 24, 55, "bar");
  },
  ground(g) {
    // mar con olas
    g.fillStyle = "#1d6fa5"; g.fillRect(0, 0, WW, WH);
    const rand = rng(5);
    g.strokeStyle = "rgba(255,255,255,.18)"; g.lineWidth = .12;
    for (let k = 0; k < 260; k++) { const x = rand() * WW, y = rand() * WH; g.beginPath(); g.arc(x, y, .8 + rand(), Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    // cubierta de teca
    g.fillStyle = "#b98a57"; g.fillRect(3, 2.5, WW - 6, FENCE_Y - 2.5);
    g.strokeStyle = "rgba(80,50,25,.35)"; g.lineWidth = .05;
    for (let x = 3; x < WW - 3; x += .4) { g.beginPath(); g.moveTo(x, 2.5); g.lineTo(x, FENCE_Y); g.stroke(); }
    for (let y = 4, i = 0; y < FENCE_Y; y += 3, i++) for (let x = 3 + (i % 2) * .2; x < WW - 3; x += .8) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + .4, y); g.stroke(); }
    // muelle de abordaje
    g.fillStyle = "#9a9c98"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
    g.fillStyle = "#e8b631"; for (let x = 1; x < WW; x += 3) g.fillRect(x, 70.6, 1.5, .25);
  },
  decor(g) {
    // casco blanco con franja azul y ojos de buey
    const hull = (x0, y0, x1, y1) => { g.fillStyle = "#f4f4f2"; g.fillRect(x0, y0, x1 - x0, y1 - y0); };
    hull(0, 0, 3, FENCE_Y); hull(WW - 3, 0, WW, FENCE_Y); hull(0, 0, WW, 2.5);
    g.fillStyle = "#1f4fa8"; g.fillRect(.4, 0, .5, FENCE_Y); g.fillRect(WW - .9, 0, .5, FENCE_Y);
    g.fillStyle = "#2b5a8a"; for (let y = 4; y < FENCE_Y; y += 2.4) { g.beginPath(); g.arc(1.9, y, .3, 0, 7); g.arc(WW - 1.9, y, .3, 0, 7); g.fill(); }
    // proa
    g.fillStyle = "#1d6fa5"; g.beginPath(); g.moveTo(0, 0); g.lineTo(12, 0); g.lineTo(0, 13); g.fill(); g.beginPath(); g.moveTo(WW, 0); g.lineTo(WW - 12, 0); g.lineTo(WW, 13); g.fill();
    for (const o of obs) if (o.kind === "hull" && o.t === "s") { g.lineWidth = 1.2; g.strokeStyle = "#f4f4f2"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
    // escenario con toldo a rayas
    for (let x = 13, i = 0; x < 27; x += 1, i++) { g.fillStyle = i % 2 ? "#ffffff" : "#1f8fd6"; g.fillRect(x, 2.5, 1, 5.5); }
    for (const o of obs) if (o.kind === "barrier") { g.lineWidth = o.th; g.strokeStyle = "#e6e6e3"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
    // alberca, jacuzzis, camastros y bar
    g.fillStyle = "#ffffff"; g.fillRect(13.6, 29.6, 12.8, 12.8);
    const water = g.createLinearGradient(14, 30, 26, 42); water.addColorStop(0, "#5fd3f0"); water.addColorStop(1, "#1aa3d6");
    g.fillStyle = water; g.fillRect(14, 30, 12, 12);
    g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = .08; for (let y = 31; y < 42; y += 1.3) { g.beginPath(); g.moveTo(14.4, y); g.quadraticCurveTo(20, y + .5, 25.6, y); g.stroke(); }
    for (const o of obs) if (o.kind === "jacuzzi") { g.fillStyle = "#ffffff"; g.beginPath(); g.arc(o.x, o.y, o.r + .3, 0, 7); g.fill(); g.fillStyle = "#6fe0f5"; g.beginPath(); g.arc(o.x, o.y, o.r, 0, 7); g.fill(); }
    for (const o of obs) if (o.kind === "lounger") { g.fillStyle = "#ffffff"; g.fillRect(o.x0, o.y0, 1, 2); g.fillStyle = "#1f8fd6"; g.fillRect(o.x0 + .15, o.y0 + .2, .7, 1.2); }
    g.fillStyle = "#6b4a2b"; g.fillRect(16, 52, 8, 3); g.fillStyle = "#f2c230"; g.fillRect(16.3, 52.3, 7.4, .5);
    // salvavidas
    for (const [x, y] of [[4, 20], [36, 20], [4, 45], [36, 45]]) { g.strokeStyle = "#ff6a2c"; g.lineWidth = .3; g.beginPath(); g.arc(x, y, .55, 0, 7); g.stroke(); }
  },
  bulbs: [...Array.from({ length: 22 }, (_, i) => [3.5, 12 + i * 2.4]), ...Array.from({ length: 22 }, (_, i) => [WW - 3.5, 12 + i * 2.4])],
  beams: Array.from({ length: 4 }, (_, i) => ({ x: 15 + i * 3.4, y: 8, a: Math.PI / 2, sweep: .55, h: 6 })),
  extra3D(grp) {
    // botes salvavidas sobre el casco
    for (const y of [16, 28, 40, 52]) for (const x of [1.5, WW - 1.5]) part(grp, "sph", "#ff6a2c", .7, .55, 2.2, x, 1.6, y);
  },
  performers: () => [{ kind: "dj", orbit: [20, 5, .01, 0, 0], h: 1.8, x: 0, y: 0, ang: Math.PI / 2, t: 0 }],
};
