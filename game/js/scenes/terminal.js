// Human Tsunami · scene: The Bus Terminal (five bays, buses come and go at random bays; the crowd chases whichever doors are open)
const TERM = { bays: [6, 13, 20, 27, 34], buses: [], t: 3, strike: 0, boarded: 0, key: "", field: null };
const ROUTES = [["AIRPORT", "#2f7fd6"], ["BEACH", "#ffb238"], ["DOWNTOWN", "#7ac943"], ["GRANDMA'S HOUSE", "#ff6fb1"], ["NOWHERE", "#a98bff"], ["THE MOON (EXPRESS)", "#d8322b"], ["LAST BUS", "#2b2f35"]];
SCENE_MODELS.term_bus = (g, u, m) => {
  const col = m.col || "#2f7fd6", dd = m.double;
  part(g, "box", col, 2.6, dd ? 4.2 : 2.6, 10, 0, dd ? 2.3 : 1.6, 0); part(g, "box", "#f4f4f0", 2.62, .35, 10.02, 0, 1, 0);
  for (let k = 0; k < 5; k++) for (let f = 0; f < (dd ? 2 : 1); f++) part(g, "box", "#1b2a3a", 2.64, .8, 1.4, 0, 2.2 + f * 1.8, -3.8 + k * 1.9);
  part(g, "box", "#1b2a3a", 2.64, 1.2, .1, 0, 2, 5.02); for (const z of [-4, 3.6]) for (const s of [-1, 1]) { const w = part(g, "cyl", "#151617", .5, .4, .5, s * 1.25, .5, z); w.rotation.z = Math.PI / 2; }
  part(g, "box", "#7a8088", .05, 2, 1.2, 1.31, 1.3, 2.5);   // the door, on the platform side
  u.heads = []; const r = rng(5); for (let k = 0; k < 30; k++) { const h = part(g, "sph", SKIN[(r() * SKIN.length) | 0], .2, .22, .2, (r() < .5 ? -1 : 1) * 1.15, 2.2 + (dd && r() < .5 ? 1.8 : 0), -4 + r() * 8); h.visible = false; u.heads.push(h); }
  u.anim = (tt, mm) => { const n = Math.round((mm.fill || 0) * u.heads.length); u.heads.forEach((h, i) => { h.visible = i < n; }); g.position.y += mm.moving ? Math.sin(tt * 20) * .03 : 0; };
};
SCENE_MODELS.term_cart = (g) => { part(g, "box", "#9aa0a8", 1.2, .1, .8, 0, .4, 0); for (let i = 0; i < 4; i++) part(g, "box", ["#d8322b", "#2f7fd6", "#ffd23a", "#3a3d45"][i], .5, .4, .6, (i % 2 - .5) * .55, .65 + (i >> 1) * .42, 0); for (const z of [-.3, .3]) for (const x of [-.5, .5]) { const w = part(g, "cyl", "#151617", .12, .06, .12, x, .12, z); w.rotation.x = Math.PI / 2; } };
SCENES.terminal = {
  name: "The Bus Terminal", tag: "Your bus is the one leaving", outside: "#5d6168", bulbH: 2.6, music: "lounge",
  light: { sky: 0xfff6e0, ground: 0x55585e, hemi: .58, sun: 0xfff0d8, sunI: 1.05 }, crowd: 3000, fenceBudget: 85, maxGates: 5, guards: 4,
  gates: [F, T, F, T, F, T, F], unlock: 50,
  intro: "Friday 6 pm at the bus terminal. Buses pull into five bays at random, fill up and leave; the crowd runs to whichever doors are open. Boarding counts as getting home. Queues help. Nobody makes queues.",
  acts: ["Now boarding!", "Last call!", "Have your ticket ready!", "Departing in 1 minute!"],
  events: ["huelga", "doble", "maletas", "perro", "doble", "maletas"],
  goal: o => o.kind === "barrier", goalMaxY: 12,
  heights: { bay: .3, kiosk: 1.6, bench: .5, pillar: 4 },
  lines: {
    buses: "Buses came, buses went, and nobody got on the one they wanted.",
    huelga: "The drivers went on strike for twenty seconds to demand longer naps (they have heard about the march).",
    doble: "A double-decker bus arrived and swallowed half the terminal.",
    maletas: "Runaway luggage carts rolled through the crowd collecting shins.",
    perro: "A lost dog boarded three buses and got off at the last one.",
  },
  quotes: ["“I let four buses go to get a window seat,” said a commuter. “There are no window seats.”", "“The schedule is more of a mood,” admitted the terminal manager.", "“I'm going to Grandma's. Every bus goes to Grandma's if you believe,” said a child."],
  build() {
    rect(0, 0, WW, 6, "bay");
    for (const x of TERM.bays) rect(x - 1.6, 6, x + 1.6, 7.2, "bay");
    // the platform fence has a 2.4 m gap at every bay, like a ticket gate
    let x0 = 2; for (const x of TERM.bays) { seg(x0, 9.5, x - 1.2, 9.5, .3, "barrier"); x0 = x + 1.2; } seg(x0, 9.5, WW - 2, 9.5, .3, "barrier");
    for (const x of [8, 20, 32]) circ(x, 30, .6, "pillar");
    rect(16, 44, 24, 47, "kiosk"); rect(3, 38, 9, 39.2, "bench"); rect(31, 38, 37, 39.2, "bench");
  },
  ground(g) {
    g.fillStyle = "#b9bcc2"; g.fillRect(0, 0, WW, WH);
    for (let y = 10; y < FENCE_Y; y += 2) for (let x = 0; x < WW; x += 2) { g.fillStyle = (x + y) % 4 ? "#b3b6bc" : "#c0c3c9"; g.fillRect(x + .04, y + .04, 1.92, 1.92); }
    g.fillStyle = "#3e4148"; g.fillRect(0, 0, WW, 7.2);   // the road where buses dock
    g.fillStyle = "#f4f4f0"; for (let x = 1; x < WW; x += 3) g.fillRect(x, 3, 1.5, .2);
    TERM.bays.forEach((x, i) => { g.fillStyle = "#ffd23a"; g.fillRect(x - 1.6, 7.2, 3.2, .3); g.font = "900 1px Rubik, sans-serif"; g.textAlign = "center"; g.fillStyle = "#1b1d22"; g.fillText("BAY " + (i + 1), x, 8.6); });
    // painted queue lanes nobody uses
    g.strokeStyle = "rgba(47,127,214,.35)"; g.lineWidth = .15; g.setLineDash([.6, .4]); for (const x of TERM.bays) { g.beginPath(); g.moveTo(x - .8, 10); g.lineTo(x - .8, 22); g.moveTo(x + .8, 10); g.lineTo(x + .8, 22); g.stroke(); } g.setLineDash([]);
    g.fillStyle = "#6b6e74"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
  },
  decor(g) { for (const o of obs) if (o.kind === "barrier") { g.lineWidth = .3; g.strokeStyle = "#ffd23a"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); } },
  bulbs: TERM.bays.map(x => [x, 10.1]),
  beams: [{ x: 20, y: 12, a: -Math.PI / 2, sweep: .4, h: 6, white: true }],
  extra3D(grp) {
    // a long canopy over the bays on columns, a departures board, a ticket kiosk
    part(grp, "box", "#e8e2d4", WW, .3, 5, 20, 5, 8.5); for (let x = 2; x < WW; x += 6) part(grp, "cyl", "#8a8f99", .12, 5, .12, x, 2.5, 10.6);
    part(grp, "box", "#1b1d22", 9, 2.2, .3, 20, 6.4, 11); part(grp, "box", basic("#ffd23a", { color: lin("#ffd23a").multiplyScalar(.7) }), 8.6, .3, .32, 20, 7.2, 11);
    part(grp, "box", "#2f7fd6", 8, 2.6, 3, 20, 1.3, 45.5); part(grp, "box", "#f4f4f0", 8.2, .4, 3.2, 20, 2.8, 45.5);
  },
  hud(g, w) {
    const x = 18, y = 12, bw = Math.min(280, w * .25);
    g.fillStyle = "rgba(17,18,20,.88)"; g.beginPath(); g.roundRect(x - 8, y - 8, bw + 16, 26 + Math.max(1, TERM.buses.length) * 16, 10); g.fill();
    g.font = "900 12px Rubik, system-ui, sans-serif"; g.textAlign = "left"; g.textBaseline = "top"; g.fillStyle = "#ffd23a";
    g.fillText(phase === "plan" ? "DEPARTURES · buses pick a bay at random" : TERM.strike > 0 ? "DEPARTURES · DRIVERS ON STRIKE" : `DEPARTURES · ${TERM.boarded} home`, x, y - 1);
    g.font = "700 11px Rubik, system-ui, sans-serif";
    TERM.buses.forEach((b, i) => { g.fillStyle = b.col; g.fillRect(x, y + 18 + i * 16, 8, 10); g.fillStyle = "#fff"; g.fillText(`BAY ${b.bay + 1} · ${b.route} · ${b.state === "board" ? Math.round(b.fill * 100) + "% FULL" : b.state === "in" ? "ARRIVING" : "LEAVING"}`, x + 14, y + 17 + i * 16); });
  },
  rock: tt => TERM.buses.some(b => b.moving) ? Math.sin(tt * 41) * .003 : 0,
  onStart() { Object.assign(TERM, { buses: [], t: 3, strike: 0, boarded: 0, key: "", field: null }); },
  step() {
    if (phase !== "show" && phase !== "evac") return;
    TERM.t -= DT; if (TERM.strike > 0) TERM.strike -= DT;
    // a new bus every few seconds at a free bay (at most three docked at once)
    if (TERM.t <= 0 && TERM.strike <= 0 && TERM.buses.length < 3) {
      TERM.t = 4 + Math.random() * 4; const freeBays = TERM.bays.map((_, i) => i).filter(i => !TERM.buses.some(b => b.bay === i));
      if (freeBays.length) {
        const bay = freeBays[(Math.random() * freeBays.length) | 0], [route, col] = ROUTES[(Math.random() * ROUTES.length) | 0], dbl = TERM.double > 0;
        if (dbl) TERM.double--;
        addMover({ kind: "term_bus", fixture: true, beh: "static", life: 1e9, x: -8, y: 2.6, ang: 0, r: 2, push: 0, air: true, h: 0, col, double: dbl, fill: 0 });
        TERM.buses.push({ m: movers[movers.length - 1], bay, route, col, state: "in", fill: 0, cap: dbl ? 130 : 65, t: 0, moving: true });
        if (!demo) pop(TERM.bays[bay], 9, `${route} → BAY ${bay + 1}`);
      }
    }
    for (const b of TERM.buses) {
      const m = b.m, bx = TERM.bays[b.bay]; b.t += DT;
      if (b.state === "in") { m.x += (bx - m.x) * Math.min(1, DT * 1.8); m.ang = 0; m.moving = b.moving = true; if (Math.abs(m.x - bx) < .15) { b.state = "board"; b.t = 0; m.moving = b.moving = false; if (!demo) sfx("beep"); } }
      else if (b.state === "board") {
        for (let i = ag.length - 1; i >= 0 && b.fill < 1; i--) { const a = ag[i]; if (a.air > 0) continue; if ((a.x - bx) ** 2 + (a.y - 8.4) ** 2 < 3.6) { ag.splice(i, 1); evacuated++; TERM.boarded++; b.fill = Math.min(1, b.fill + 1 / b.cap); } }
        m.fill = b.fill;
        if (b.fill >= 1 || b.t > 11) { b.state = "out"; if (!demo) pop(bx, 9, b.fill >= 1 ? "BUS FULL!" : "DEPARTING!"); for (const a of ag) if ((a.x - bx) ** 2 + (a.y - 8.4) ** 2 < 5) { toss(a, .8, .5); if (!demo && Math.random() < .1) pop(a.x, a.y - 1, ["WAIT FOR ME!", "THAT WAS MY BUS!", "NOOO!"][(Math.random() * 3) | 0]); } eventLog.add("buses"); }
      } else { m.x += 14 * DT; m.moving = b.moving = true; if (m.x > WW + 10) { m.dead = true; b.gone = true; } }
    }
    TERM.buses = TERM.buses.filter(b => !b.gone);
    // the crowd heads for the doors of the docked buses (recomputed whenever the set of docked buses changes)
    const docked = TERM.buses.filter(b => b.state === "board").map(b => b.bay).sort(), key = docked.join(",");
    if (phase === "show" && key !== TERM.key) {
      TERM.key = key;
      if (docked.length) { const f = dijkstra(id => !blockedC[id] && docked.some(i => Math.hypot((id % GW + .5) * CS - TERM.bays[i], ((id / GW) | 0) * CS + CS / 2 - 8.4) < 1.3)); attF = f; attDir = dirField(f); attShare = .75; attr = { x: TERM.bays[docked[0]], y: 10, r: 1.6 }; }
      else clearAttractor();
    }
  },
  ev: {
    huelga() { TERM.strike = 18; for (const b of TERM.buses) if (b.state !== "out") b.state = "out"; caption("Drivers' strike! No buses for a while", true, 2200); pop(20, 12, "ON STRIKE!"); for (let k = 0; k < 5; k++) { const [x, y] = crowdPoint(); later(.4 + k * .3, () => pop(x, y - 1, ["SERIOUSLY?!", "I HAVE A PLANE TO CATCH", "BOOOO!", "I'LL WALK!", "CLASSIC."][k])); } },
    doble() { TERM.double = 2; caption("Double-decker buses incoming!", false, 1800); },
    maletas(side) { for (let n = 0; n < 4; n++) addMover({ kind: "term_cart", beh: "bounce", x: side ? 2 : WW - 2, y: rnd(20, 56), vx: (side ? 1 : -1) * rnd(3, 4.5), vy: rnd(-1.5, 1.5), r: .6, push: 25, life: 10 }); caption("Runaway luggage carts!", true, 1600); },
    perro(side) { const pts = [crowdPoint(), [TERM.bays[1], 11], crowdPoint(), [TERM.bays[3], 11], [side ? WW + 3 : -3, 40]]; addMover({ kind: "dog", x: side ? -2 : WW + 2, y: 40, pts, speed: 5, r: .35, push: 12, scare: 2, col: "#d9b98a", agile: true, say: "WOOF!", sayEvery: 1.6 }); caption("A lost dog is looking for its bus", false, 1600); },
  },
  performers: () => [],
};
