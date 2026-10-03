// Marea Humana · escenario: El Estadio (de noche, concierto en la cancha)
SCENES.estadio = {
  name: "El Estadio", tag: "Concierto en la cancha", outside: "#3b3f45", bulbH: 2.0, night: true, music: "edm",
  light: { sky: 0x9fb4e6, ground: 0x2a2e34, hemi: .5, sun: 0xe4ecff, sunI: 1.15 }, crowd: 3600, fenceBudget: 70, maxGates: 5, guards: 4,
  gates: [F, T, F, T, F, T, F], noSlots: [0, 6], slotWhy: "Ahí están las gradas", unlock: 2,
  intro: "La final terminó en concierto. La afición llena la cancha, hay bengalas, la mascota anda suelta y la ola no se detiene.",
  acts: ["¡Golazo de canción!", "¡Todos a saltar!", "¡La ola!", "¡Campeones!"],
  events: ["mascot", "flares", "ola", "ball", "medic", "flares", "ola", "mascot"],
  goal: o => o.kind === "barrier", goalMaxY: 30,
  build() {
    rect(0, 0, 3.5, FENCE_Y, "stands"); rect(WW - 3.5, 0, WW, FENCE_Y, "stands"); rect(0, 0, WW, 5, "stands");
    rect(8, 5, 32, 11, "stage");
    rect(4.2, 6, 7, 10, "speaker"); rect(33, 6, 35.8, 10, "speaker");
    seg(3.5, 12.4, WW - 3.5, 12.4, .5, "barrier");
    rect(17, 61, 23, 62, "goal");
    rect(3.5, 30, 5.2, 37, "bench"); rect(34.8, 30, 36.5, 37, "bench");
  },
  ground(g, px) {
    g.fillStyle = "#3b3f45"; g.fillRect(0, 0, WW, WH);
    // pasto con franjas de podadora
    for (let y = 5, i = 0; y < FENCE_Y; y += 3, i++) { g.fillStyle = i % 2 ? "#2f7d3a" : "#2a7334"; g.fillRect(3.5, y, WW - 7, 3); }
    g.strokeStyle = "rgba(255,255,255,.75)"; g.lineWidth = .14;
    g.strokeRect(5, 14, 30, 50.5);
    g.beginPath(); g.moveTo(5, 39); g.lineTo(35, 39); g.stroke();
    g.beginPath(); g.arc(20, 39, 5, 0, 7); g.stroke();
    g.strokeRect(11, 52, 18, 12.5); g.strokeRect(15.5, 59.5, 9, 5);
    g.beginPath(); g.arc(20, 52, 3, Math.PI, 0); g.stroke();
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(20, 39, .25, 0, 7); g.fill();
    // afuera: explanada con rayas pintadas
    g.fillStyle = "#34383e"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
    g.strokeStyle = "rgba(255,255,255,.25)"; g.lineWidth = .12;
    for (let x = 1; x < WW; x += 2.5) { g.beginPath(); g.moveTo(x, 68.5); g.lineTo(x + 1.2, 68.5); g.stroke(); }
  },
  decor(g) {
    // gradas llenas de afición
    const rand = rng(31), fans = ["#d8322b", "#ffffff", "#d8322b", "#1f4fa8", "#ffd23a", "#f4f4f0", "#2b2f35"];
    const stand = (x0, y0, x1, y1) => {
      g.fillStyle = "#24272d"; g.fillRect(x0, y0, x1 - x0, y1 - y0);
      for (let y = y0 + .3; y < y1; y += .55) for (let x = x0 + .3; x < x1; x += .5) {
        g.fillStyle = fans[(rand() * fans.length) | 0]; g.beginPath(); g.arc(x + (rand() - .5) * .1, y, .17, 0, 7); g.fill();
      }
    };
    stand(0, 0, 3.5, FENCE_Y); stand(WW - 3.5, 0, WW, FENCE_Y); stand(0, 0, WW, 5);
    // mosaico en la grada de atrás
    g.font = "900 3.6px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = "rgba(216,50,43,.92)"; g.fillRect(9, .4, 22, 4.2);
    g.fillStyle = "#ffffff"; g.fillText("MAREA", 20, 2.6);
    // escenario con pantalla LED
    g.fillStyle = "#16171b"; g.fillRect(8, 5, 24, 6);
    const led = g.createLinearGradient(9, 0, 31, 0); led.addColorStop(0, "#7a2cff"); led.addColorStop(.5, "#ff3fa4"); led.addColorStop(1, "#22d3ee");
    g.fillStyle = led; g.fillRect(9, 5.4, 22, 1.4);
    g.fillStyle = "#2b2d33"; for (let x = 9; x < 31; x += 2.2) g.fillRect(x, 8, 1.4, .8);
    g.fillStyle = "#101114"; for (const o of obs) if (o.kind === "speaker") g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0);
    for (const o of obs) if (o.kind === "barrier") { g.lineWidth = o.th; g.strokeStyle = "#1c1d21"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
    g.fillStyle = "#ffffff"; g.fillRect(17, 61, 6, 1);
    g.fillStyle = "#1f4fa8"; for (const o of obs) if (o.kind === "bench") g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0);
  },
  bulbs: Array.from({ length: 16 }, (_, i) => [9 + i * 1.47, 11.3]),
  beams: [{ x: 4, y: 4, a: Math.PI / 4, sweep: .3, h: 18, white: true }, { x: 36, y: 4, a: 3 * Math.PI / 4, sweep: .3, h: 18, white: true },
          { x: 4, y: 62, a: -Math.PI / 4, sweep: .3, h: 18, white: true }, { x: 36, y: 62, a: -3 * Math.PI / 4, sweep: .3, h: 18, white: true },
          { x: 14, y: 11, a: Math.PI / 2, sweep: .6, h: 7 }, { x: 26, y: 11, a: Math.PI / 2, sweep: .6, h: 7 }],
  extra3D(grp) {
    // torres de iluminación y portería
    for (const [x, y] of [[1.5, 1.5], [38.5, 1.5], [1.5, 64.5], [38.5, 64.5]]) {
      part(grp, "cyl", mat("#9aa0a8", { metalness: .6, roughness: .4 }), .35, 18, .35, x, 9, y);
      part(grp, "box", basic("#fffbe8"), 3, 1.6, .4, x, 18.3, y);
    }
    const white = mat("#ffffff", { roughness: .3 });
    for (const x of [17.1, 22.9]) part(grp, "cyl", white, .08, 2.4, .08, x, 1.2, 61.5);
    const bar = part(grp, "cyl", white, .08, 5.8, .08, 20, 2.4, 61.5); bar.rotation.z = Math.PI / 2;
  },
  performers: () => [{ kind: "dj", orbit: [20, 8.4, .01, 0, 0], h: 1.8, x: 0, y: 0, ang: Math.PI / 2, t: 0 }],
};
