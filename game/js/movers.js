// Marea Humana · animales, coches y objetos que cruzan entre la gente
// ===== Cosas que pasan entre la gente: animales, coches y objetos =====
let blackT = 0, black = 0;  // apagón: segundos restantes y oscuridad visible (0..1)
let movers = [], performers = [], pops = [], eventT = 0, MPUSH = 2, MPRES = .4, MSCARE = 4;
const rnd = (a, b) => a + Math.random() * (b - a);
function pop(x, y, text, h) {
  // no repetir la misma onomatopeya encima de sí misma
  if (pops.some(q => q.text === text && q.t < 1.1 && Math.abs(q.x - x) < 4 && Math.abs(q.y - y) < 4)) return;
  pops.push({ x, y, text, t: 0, h }); if (pops.length > 10) pops.shift(); if (typeof sfxFor === "function") sfxFor(text);
}
// modo caos total: cualquier evento de cualquier escenario puede pasar en cualquier lugar
let chaosMode = false;
try { chaosMode = localStorage.getItem("mh.chaos") === "1"; } catch (e) { /* sin almacenamiento */ }
const GENERIC_EVENTS = ["car", "icecream", "dogs", "beachballs", "lion", "elephants", "clowncar", "balls", "cannon", "unicycles", "mascot", "flares", "ola",
  "ball", "medic", "oleaje", "gaviotas", "flamenco", "bocina", "carrera", "desbocado", "fuegos", "taxi", "carroza", "policia"];
function chaosPool() {
  const own = Object.entries(SCENES).flatMap(([k, sc]) => Object.keys(sc.ev || {}).map(e => k + ":" + e));
  return GENERIC_EVENTS.concat(own);
}
// fuerzas globales: oleaje del barco, la ola del estadio y fuegos artificiales
let windF = { x: 0, t: 0 }, ola = null, rockets = [], sparks = [], puffs = [], cheerT = 0;
// guardias de seguridad que coloca el jugador
let guards = [];
const GUARD_CALM = 3.6;
function openGateX() { const open = []; for (let i = 0; i < SLOTS; i++) if (gates[i]) open.push(slotX(i)); return open[(Math.random() * open.length) | 0] || WW / 2; }
function addMover(m) { movers.push(Object.assign({ t: 0, ang: 0, i: 0, push: 30, scare: 0, spin: 0, h: 0, home: [m.x, m.y] }, m)); }
function crowdPoint() { return [rnd(4, 36), rnd(22, 60)]; }
// cámara de director: al empezar un evento, la cámara automática se asoma unos segundos a su protagonista
let evCam = null;
function spawnEvent(kind) {
  const before = new Set(movers);
  spawnEventRaw(kind);
  let best = null;
  for (const m of movers) if (!before.has(m) && !m.small && m.kind !== "router" && (!best || m.r > best.r)) best = m;
  if (best) evCam = { m: best, t: 3.2 };
}
function spawnEventRaw(kind) {
  const side = Math.random() < .5;
  if (kind.includes(":")) { const [sk, k] = kind.split(":"); eventLog.add(k); SCENES[sk].ev[k](side); return; }
  eventLog.add(kind);
  // eventos propios de cada escenario o de la condición del día
  const own = (scene.ev && scene.ev[kind]) || (MOD && MOD.ev && MOD.ev[kind]);
  if (own) { own(side); return; }
  switch (kind) {
    case "car": {
      const y = rnd(46, 60), col = ["#d8322b", "#2f6fc4", "#f2f2ef", "#2b2f35", "#e8b631"][(Math.random() * 5) | 0];
      addMover({ kind: "car", x: side ? -4 : WW + 4, y, pts: [[side ? WW + 5 : -5, y + rnd(-3, 3)]], speed: 5.5, r: 1.15, push: 45, scare: 3.5, col, say: "¡PIIIP!", sayEvery: 1.4 });
      caption("¡Un coche en la plaza!", true, 1800); break;
    }
    case "icecream": {
      const y = rnd(54, 62);
      addMover({ kind: "icecream", x: side ? -5 : WW + 5, y, pts: [[side ? WW + 6 : -6, y]], speed: 2.6, r: 1.35, push: 45, scare: 2.5, say: "♪ ♫ ♪", sayEvery: 1.2 });
      caption("Pasa el camión de helados", false, 1800); break;
    }
    case "dogs": {
      for (let n = 0; n < 3; n++) {
        const [px, py] = crowdPoint(), [qx, qy] = crowdPoint();
        addMover({ kind: "dog", x: side ? -1.5 - n : WW + 1.5 + n, y: rnd(30, 60), pts: [[px, py], [qx, qy], [side ? WW + 3 : -3, rnd(30, 60)]], speed: 4.8, r: .35, push: 15, scare: 1.8, col: ["#8a5a34", "#d9b98a", "#2b2f35"][n], say: "¡GUAU!", sayEvery: 2 });
      }
      caption("¡Perros sueltos!", true, 1800); break;
    }
    case "beachballs": {
      for (let n = 0; n < 4; n++) addMover({ kind: "beach", beh: "bounce", x: rnd(6, 34), y: rnd(16, 30), vx: rnd(-3, 3), vy: rnd(1, 3), r: 1, push: 10, life: 14, air: true });
      caption("¡Pelotas gigantes sobre el público!", false, 1800); break;
    }
    case "lion": {
      const a = rnd(.2, .8) * Math.PI, ox = PISTA.x + Math.cos(a) * (PISTA.r + 2.5), oy = PISTA.y + Math.sin(a) * (PISTA.r + 2.5);
      const p1 = crowdPoint(), p2 = crowdPoint(), gx = openGateX();
      addMover({ kind: "lion", x: 20, y: 6, pts: [[20, 19], [PISTA.x + Math.cos(a) * 4, PISTA.y + Math.sin(a) * 4], [ox, oy], p1, p2, [gx, 64], [gx, SH + 3]], speed: 6.2, r: .7, push: 30, scare: 4.5, say: "¡ROAR!", sayEvery: 1.8 });
      caption("¡Se escapó el león!", true, 2200); break;
    }
    case "elephants": {
      const y = rnd(34, 44);
      for (let n = 0; n < 3; n++) addMover({ kind: "elephant", x: (side ? -3 : WW + 3) + (side ? -1 : 1) * n * 4, y: y + n * .4, pts: [[side ? WW + 18 : -18, y + n * .4 + rnd(-2, 2)]], speed: 1.8, r: 1.35, push: 60, scare: 2.8, say: n ? "" : "¡PAWOO!", sayEvery: 3 });
      caption("¡Desfile de elefantes!", true, 2000); break;
    }
    case "clowncar": {
      const loop = [[3.5, 62], [3.5, 37], [36.5, 37], [36.5, 62], [3.5, 62], [3.5, 50], [WW + 4, 50]];
      addMover({ kind: "clowncar", x: -3, y: 62, pts: side ? loop : loop.map(([x, y]) => [WW - x, y]), speed: 4.2, r: 1, push: 25, scare: 2.6, say: "¡MEC MEC!", sayEvery: 1.6 });
      caption("¡El coche de los payasos!", false, 1800); break;
    }
    case "balls": {
      for (let n = 0; n < 3; n++) addMover({ kind: "cball", beh: "bounce", x: rnd(10, 30), y: rnd(36, 42), vx: rnd(-4, 4), vy: rnd(-4, 4), r: .9, push: 16, life: 12 });
      caption("¡Pelotas de circo!", false, 1800); break;
    }
    case "cannon": {
      const [tx, ty] = crowdPoint();
      addMover({ kind: "flyer", beh: "fly", x: 34.8, y: 7.6, sx: 34.8, sy: 7.6, tx, ty, dur: 1.9, r: .4, push: 0, air: true, say: "¡FIUUU!", sayEvery: 9 });
      caption("¡La bala humana!", true, 1900); break;
    }
    case "unicycles": {
      for (let n = 0; n < 4; n++) {
        const p1 = crowdPoint(), p2 = crowdPoint();
        const ux = side ? -1 - n * 1.5 : WW + 1 + n * 1.5, uy = rnd(30, 58);
        addMover({ kind: "unicycle", x: ux, y: uy, pts: [p1, p2, [ux, uy]], speed: 2.4, r: .42, push: 25, scare: 1.2, col: SHIRTS[n * 3 % SHIRTS.length], say: n ? "" : "¡HONK!", sayEvery: 2.5 });
      }
      caption("Payasos en monociclo", false, 1800); break;
    }
    case "mascot": {
      const p1 = crowdPoint(), p2 = crowdPoint();
      addMover({ kind: "mascot", x: side ? -1.5 : WW + 1.5, y: rnd(25, 55), pts: [p1, p2, [side ? WW + 3 : -3, rnd(25, 55)]], speed: 2.6, r: .8, push: 25, scare: 1.2, col: "#d8322b", say: "¡VAMOS!", sayEvery: 2.4 });
      caption("¡La mascota se metió a la cancha!", false, 1800); break;
    }
    case "flares": {
      for (let n = 0; n < 4; n++) { const [x, y] = crowdPoint(); addMover({ kind: "flare", beh: "static", x, y, life: 9, r: .2, push: 0, scare: 1.8, col: ["#ff3b2f", "#ff7ad9", "#ffd23a", "#ff3b2f"][n] }); }
      caption("¡Bengalas en la afición!", true, 1800); break;
    }
    case "ola": ola = { x: -4, dir: 1, speed: 11 }; caption("¡La ola!", false, 1800); pop(4, 30, "¡OLEEE!"); break;
    case "ball":
      addMover({ kind: "cball", beh: "bounce", x: rnd(10, 30), y: rnd(20, 30), vx: rnd(-4, 4), vy: rnd(2, 5), r: 1.3, push: 16, life: 14 });
      caption("¡Balón gigante!", false, 1600); break;
    case "medic": {
      const [x, y] = crowdPoint();
      addMover({ kind: "medic", x: -3, y: 63, pts: [[x, 63], [x, y], [x, 63], [WW + 4, 63]], speed: 2.2, r: .9, push: 25, scare: 1.5, calm: 3, say: "¡PASO!", sayEvery: 2.2 });
      caption("Pasa el carrito de primeros auxilios", false, 1800); break;
    }
    case "oleaje": {
      windF = { x: side ? 1 : -1, t: 3.6 };
      caption("¡Oleaje! El barco se inclina", true, 2200); pop(20, 20, "¡SPLASH!"); shake = Math.min(1.2, shake + .6); break;
    }
    case "gaviotas": {
      for (let n = 0; n < 5; n++) {
        const y = rnd(14, 60), swoop = n === 0;
        const pts = swoop ? [crowdPoint(), [side ? WW + 4 : -4, y + rnd(-8, 8)]] : [[side ? WW + 4 : -4, y + rnd(-10, 10)]];
        addMover({ kind: "gull", x: side ? -3 - n * 2 : WW + 3 + n * 2, y, pts, speed: 7, r: .35, push: 0, scare: swoop ? 2.2 : 0, air: true, h: 6 + n, swoop, say: n ? "" : "¡CUAC!", sayEvery: 1.5 });
      }
      caption("¡Gaviotas!", false, 1500); break;
    }
    case "flamenco":
      addMover({ kind: "flamingo", beh: "bounce", x: rnd(8, 32), y: rnd(14, 24), vx: rnd(-3, 3), vy: rnd(2, 4), r: 1.2, push: 12, life: 15 });
      caption("¡Se soltó el flamenco inflable!", false, 1800); break;
    case "bocina":
      caption("¡Bocinazo del capitán!", false, 1800); pop(20, 6, "¡TUUUUU!"); shake = Math.min(1, shake + .4); cheerT = 2.5; break;
    case "carrera": {
      for (let n = 0; n < 6; n++) {
        const lane = 2.2 + n * 1.6;
        addMover({ kind: "racehorse", x: -2 - Math.random() * 2, y: lane, pts: [[20, lane + rnd(-.5, .5)], [WW + 6, lane]], speed: 9 + Math.random() * 2, r: .7, push: 0, col: ["#5a3a22", "#2b1d14", "#8a5a34", "#d9c3a0", "#3b2a20", "#6b4a2b"][n], silk: SHIRTS[(n * 5) % SHIRTS.length], dust: true });
      }
      caption("¡Arrancan!", false, 1500); pop(3, 6, "¡ARRANCAN!"); break;
    }
    case "desbocado": {
      const lane = rnd(4, 10), jx = rnd(10, 30), gx = openGateX();
      addMover({ kind: "racehorse", x: -2, y: lane, pts: [[jx, lane], [jx + 2, 16], crowdPoint(), crowdPoint(), [gx, 64], [gx, SH + 5]], speed: 7.5, r: .75, push: 25, scale: 1, scare: 3.5, col: "#2b1d14", silk: "#ffd23a", dust: true, say: "¡IIIIH!", sayEvery: 2 });
      caption("¡Caballo desbocado!", true, 2000); break;
    }
    case "tractor":
      addMover({ kind: "tractor", x: -3, y: 7, pts: [[WW + 4, 7]], speed: 2.2, r: 1.1, push: 0, dust: true });
      caption("El tractor empareja la pista", false, 1600); break;
    case "fuegos": {
      for (let n = 0; n < 6; n++) rockets.push({ x: rnd(4, 36), y: rnd(20, 58), h: 16, vh: 26 + Math.random() * 8, fuse: .7 + Math.random() * .7, delay: n * .35, col: ["#ff4fd8", "#4fd8ff", "#ffd23a", "#7dff6a", "#ff6a3c", "#ffffff"][n] });
      caption("¡Fuegos artificiales!", false, 1800); cheerT = 4; break;
    }
    case "taxi": {
      const y = [32.5, 47.5, 63][(Math.random() * 3) | 0];
      addMover({ kind: "car", taxi: true, x: side ? -4 : WW + 4, y, pts: [[side ? WW + 5 : -5, y]], speed: 4.8, r: 1.15, push: 45, scare: 3.2, col: "#f2c230", say: "¡PIIIP!", sayEvery: 1.3 });
      caption("¡Un taxi se metió al festival!", true, 1800); break;
    }
    case "carroza":
      addMover({ kind: "float", x: 20, y: SH + 3, pts: [[20, 50], [20, 34], [side ? 30 : 10, 32.5], [side ? WW + 6 : -6, 32.5]], speed: 1.5, r: 1.9, push: 30, scare: 3.6, say: "♪ ♫ ♪", sayEvery: 1.6 });
      caption("¡Llega el desfile!", false, 1800); break;
    case "policia": {
      const pts = [[9.5, 62], [9.5, 32.5], [30.5, 32.5], [30.5, 62], [WW + 4, 62]];
      addMover({ kind: "policehorse", x: -3, y: 62, pts, speed: 2.4, r: .7, push: 20, scare: 0, calm: 4.5, say: "¡CALMA!", sayEvery: 3 });
      caption("Llega la policía montada", false, 1800); break;
    }
  }
}
function blast(x, y) {
  for (const a of ag) {
    const dx = a.x - x, dy = a.y - y, d = Math.hypot(dx, dy);
    if (d < 3.4 && d > .01) { const s = (1 - d / 3.4) * 6; a.vx += dx / d * s; a.vy += dy / d * s; a.p += (1 - d / 3.4) * 3; }
  }
  pop(x, y - 1, "¡BUM!"); burstAt(x, y, 90); shake = Math.min(1.2, shake + .8);
}
// meta temporal: todos corren a un punto unos segundos (una oferta, el ramo, tacos gratis)
let attrT = 0, timers = [];
// acciones con retraso medido en tiempo de simulación (respeta la velocidad 2× y 4×)
function later(secs, fn) { timers.push({ t: secs, fn }); }
function tempAttract(x, y, r, secs, share) { if (setAttractor(x, y, r, share ?? .5)) attrT = secs; }
// la meta sigue a un personaje mientras camina (una estrella, un alien, el alcalde)
function followTick(secs, r, share) {
  return m => { m.ft = (m.ft || 0) + DT; m.nt = (m.nt || 0) - DT;
    if (m.ft < secs && m.nt <= 0 && phase === "show") { m.nt = 1.2; if (setAttractor(m.x, m.y, r || 2.4, share ?? .4)) attrT = 1.6; } };
}
function smallHit(x, y) {
  for (const a of ag) { const dx = a.x - x, dy = a.y - y, d = Math.hypot(dx, dy); if (d < 1.4 && d > .01) { a.vx += dx / d * 2.5; a.vy += dy / d * 2.5; } }
  pop(x, y, "¡ZAS!"); burstAt(x, y, 8);
}
const turnTo = (a, b, m) => { let d = ((b - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; return a + clamp(d, -m, m); };
function stepMovers() {
  if (phase === "show" || phase === "evac") {
    eventT -= DT;
    if (eventT <= 0 && movers.length < 16) {
      const pool = chaosMode ? chaosPool() : scene.events.concat(MOD && MOD.events || []);
      spawnEvent(pool[(Math.random() * pool.length) | 0]); eventT = phase === "show" ? rnd(5.5, 8.5) : rnd(9, 13);
    }
  }
  for (const m of movers) {
    m.t += DT;
    if (m.beh === "bounce") {
      if (m.hits > 2 && !m.air) { m.vx *= .985; m.vy *= .985; }
      m.x += m.vx * DT; m.y += m.vy * DT; m.spin += Math.hypot(m.vx, m.vy) / m.r * DT;
      if (m.x < m.r + 1.4 && m.vx < 0 || m.x > WW - m.r - 1.4 && m.vx > 0) m.vx *= -1;
      if (m.y < m.r + 12 && m.vy < 0 || m.y > FENCE_Y - m.r - 1 && m.vy > 0) m.vy *= -1;
      if (!m.air) {
        const bk = buckets[clamp(Math.floor(m.y / BKS), 0, BH - 1) * BW + clamp(Math.floor(m.x / BKS), 0, BW - 1)];
        for (const oi of bk) {
          const o = obs[oi]; if (o.kind === "edge") continue;
          const [nx, ny, d] = contact(o, m.x, m.y); if (d >= m.r) continue;
          m.x += nx * (m.r - d); m.y += ny * (m.r - d);
          const vn = m.vx * nx + m.vy * ny; if (vn < 0) { m.vx -= 2 * vn * nx; m.vy -= 2 * vn * ny; }
        }
      }
      m.life -= DT; if (m.life <= 0) m.dead = true;
      m.ang = Math.atan2(m.vy, m.vx);
    } else if (m.beh === "static") {
      m.life -= DT; if (m.life <= 0) m.dead = true;
    } else if (m.beh === "hover") {
      // vuela despacio de punto en punto a cierta altura
      const [tx, ty] = m.pts[m.i], dx = tx - m.x, dy = ty - m.y, d = Math.hypot(dx, dy);
      if (d < .4) { m.wait = (m.wait || 0) + DT; if (m.wait > (m.pause || 0)) { m.wait = 0; m.i++; if (m.i >= m.pts.length) m.dead = true; } }
      else { m.x += dx / d * m.speed * DT; m.y += dy / d * m.speed * DT; }
      m.ang += DT * (m.spinRate || 0);
      if (m.tick) m.tick(m);
    } else if (m.beh === "fly") {
      const q = Math.min(1, m.t / m.dur);
      m.x = m.sx + (m.tx - m.sx) * q; m.y = m.sy + (m.ty - m.sy) * q; m.h = Math.sin(q * Math.PI) * 9; m.ang = Math.atan2(m.ty - m.sy, m.tx - m.sx);
      if (q >= 1) { if (m.small) smallHit(m.x, m.y); else blast(m.x, m.y); m.dead = true; }
    } else {
      const [tx, ty] = m.pts[m.i], dx = tx - m.x, dy = ty - m.y, d = Math.hypot(dx, dy);
      if (d < .5) { m.i++; if (m.i >= m.pts.length) m.dead = true; }
      else { m.ang = turnTo(m.ang, Math.atan2(dy, dx), DT * 7); const sp = m.speed * (.6 + .4 * Math.max(0, Math.cos(m.ang - Math.atan2(dy, dx)))) / (1 + (m.hits || 0) * .3); m.x += Math.cos(m.ang) * sp * DT; m.y += Math.sin(m.ang) * sp * DT; }
      if (m.kind === "gull") m.h = m.swoop && m.i === 0 ? Math.max(1.6, Math.min(6, d * .35)) : Math.min(7, (m.h || 6) + DT * 3);
      // un guardia de seguridad detiene a animales y vehículos
      if (!m.bounced && !m.air && m.push) for (const gd of guards) {
        const ex = m.x - gd.x, ey = m.y - gd.y, dd = Math.hypot(ex, ey);
        if (dd < m.r + .9) {
          pop(gd.x, gd.y - 1.4, "¡ALTO!"); achieve("GUARDIAN"); if (m.kind === "lion") achieve("LION_TAMER");
          m.bounced = true; m.ang += Math.PI; m.pts = [m.home || [m.x + ex * 20, m.y + ey * 20]]; m.i = 0; m.speed *= 1.1; break;
        }
      }
      // las vallas del jugador frenan a los animales y coches: chocan y se dan la vuelta
      if (!m.bounced && !m.air && m.kind !== "racehorse" && m.kind !== "tractor") for (const o of obs) {
        if (o.kind !== "player") continue;
        const [nx, ny, dd] = contact(o, m.x, m.y);
        if (dd < m.r) {
          m.x += nx * (m.r - dd); m.y += ny * (m.r - dd);
          pop(m.x, m.y - 1.4, m.kind === "lion" ? "¡GRRR!" : m.kind === "dog" ? "¡AUU!" : "¡CRASH!"); shake = Math.min(1, shake + .3);
          if (m.kind === "lion") achieve("LION_TAMER");
          m.bounced = true; m.ang += Math.PI; m.pts = [m.home || [m.x + nx * 30, m.y + ny * 30]]; m.i = 0; m.speed *= 1.2; break;
        }
      }
    }
    if (m.tick && m.beh !== "hover") m.tick(m);
    if (m.say && m.t >= (m.nextSay || 0) && m.y < WH) { pop(m.x, m.y - 1.6, m.say); m.nextSay = m.t + m.sayEvery; }
  }
  movers = movers.filter(m => !m.dead);
}
// empujones y miedo: la gente se aparta (o sale volando) cuando algo le pasa encima
function moverForces() {
  for (const m of movers) {
    if (m.air && !m.push && !m.abduct) continue;
    m.lastHits = m.hits || 0; m.hits = 0;
    const rad = Math.max(m.r + R, m.scare, m.abduct && m.beamOn ? m.abduct : 0);
    const gx0 = clamp(Math.floor((m.x - rad) / CS), 0, GW - 1), gx1 = clamp(Math.floor((m.x + rad) / CS), 0, GW - 1);
    const gy0 = clamp(Math.floor((m.y - rad) / CS), 0, GH - 1), gy1 = clamp(Math.floor((m.y + rad) / CS), 0, GH - 1);
    for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++)
      for (let j = hashHead[gy * GW + gx]; j !== -1; j = hashNext[j]) {
        const a = ag[j], ex = a.x - m.x, ey = a.y - m.y, d = Math.hypot(ex, ey) || .01, nx = ex / d, ny = ey / d;
        if (m.abduct && m.beamOn && d < m.abduct) a.beam = true;
        if (d < m.r + R) { const ov = m.r + R - d, k = m.push * MPUSH / (1 + (m.lastHits || 0) * .12); a.fx += nx * ov * k; a.fy += ny * ov * k; a.p += ov / R * MPRES; m.hits++; }
        if (m.scare && d < m.scare) { const s = (1 - d / m.scare) * MSCARE; a.fx += nx * s; a.fy += ny * s; }
      }
  }
}
// la policía montada, el carrito médico y los guardias calman a la gente cercana
function calmForces() {
  const sources = guards.map(g => [g.x, g.y, GUARD_CALM]);
  for (const m of movers) if (m.calm) sources.push([m.x, m.y, m.calm]);
  for (const mg of mega.active) sources.push([mg.x, mg.y, 5.5, true]);
  for (const [x, y, rad, push] of sources) {
    const gx0 = clamp(Math.floor((x - rad) / CS), 0, GW - 1), gx1 = clamp(Math.floor((x + rad) / CS), 0, GW - 1);
    const gy0 = clamp(Math.floor((y - rad) / CS), 0, GH - 1), gy1 = clamp(Math.floor((y + rad) / CS), 0, GH - 1);
    for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++)
      for (let j = hashHead[gy * GW + gx]; j !== -1; j = hashNext[j]) {
        const a = ag[j], ex = a.x - x, ey = a.y - y, d2 = ex * ex + ey * ey;
        if (d2 < rad * rad) { a.p *= push ? .35 : .55; if (push) { const d = Math.sqrt(d2) || 1; a.fx += ex / d * 2.6; a.fy += ey / d * 2.6; } }
      }
  }
}
// fuerzas que afectan a todos: el barco se inclina, la ola, los fuegos
function stepGlobal() {
  if (windF.t > 0) windF.t -= DT;
  if (slipT > 0) slipT -= DT;
  if (blackT > 0) blackT -= DT;
  if (attrT > 0) { attrT -= DT; if (attrT <= 0) clearAttractor(); }
  for (const tm of timers) { tm.t -= DT; if (tm.t <= 0 && !tm.done) { tm.done = true; tm.fn(); } }
  timers = timers.filter(tm => !tm.done);
  for (const mg of mega.active) mg.t -= DT; mega.active = mega.active.filter(mg => mg.t > 0);
  if (cheerT > 0) cheerT -= DT;
  if (ola) { ola.x += ola.dir * ola.speed * DT; if (ola.x > WW + 4) ola = null; }
  for (const r of rockets) {
    if (r.delay > 0) { r.delay -= DT; continue; }
    if (!r.launched) { r.launched = true; r.h = 0; pop(r.x, r.y, "¡FIUUU!", 3); }
    r.h += r.vh * DT; r.fuse -= DT;
    if (r.fuse <= 0) {
      r.dead = true; pop(r.x, r.y, "¡BUM!", r.h);
      for (let k = 0; k < 70; k++) {
        const th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1), v = 7 + Math.random() * 4;
        sparks.push({ x: r.x, y: r.y, h: r.h, vx: Math.sin(ph) * Math.cos(th) * v, vy: Math.sin(ph) * Math.sin(th) * v, vh: Math.cos(ph) * v, col: r.col, life: 1.4 + Math.random() * .6 });
      }
    }
  }
  rockets = rockets.filter(r => !r.dead);
}
function stepPerformers(dt) {
  for (const p of performers) {
    p.t += dt;
    const [cx, cy, r, w, ph] = p.orbit, a = ph + p.t * w;
    p.x = cx + Math.cos(a) * r; p.y = cy + Math.sin(a) * r; p.ang = a + (w >= 0 ? Math.PI / 2 : -Math.PI / 2);
  }
}

