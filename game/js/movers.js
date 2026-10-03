// Marea Humana · animales, coches y objetos que cruzan entre la gente
// ===== Cosas que pasan entre la gente: animales, coches y objetos =====
let movers = [], performers = [], pops = [], eventT = 0, MPUSH = 2, MPRES = .4, MSCARE = 4;
const rnd = (a, b) => a + Math.random() * (b - a);
function pop(x, y, text) { pops.push({ x, y, text, t: 0 }); if (pops.length > 10) pops.shift(); }
function openGateX() { const open = []; for (let i = 0; i < SLOTS; i++) if (gates[i]) open.push(slotX(i)); return open[(Math.random() * open.length) | 0] || WW / 2; }
function addMover(m) { movers.push(Object.assign({ t: 0, ang: 0, i: 0, push: 30, scare: 0, spin: 0, h: 0, home: [m.x, m.y] }, m)); }
function crowdPoint() { return [rnd(4, 36), rnd(22, 60)]; }
function spawnEvent(kind) {
  const side = Math.random() < .5;
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
        addMover({ kind: "dog", x: side ? -1.5 - n : WW + 1.5 + n, y: rnd(30, 60), pts: [[px, py], [qx, qy], [side ? WW + 3 : -3, rnd(30, 60)]], speed: 4.8, r: .35, push: 30, scare: 1.8, col: ["#8a5a34", "#d9b98a", "#2b2f35"][n], say: "¡GUAU!", sayEvery: 2 });
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
  }
}
function blast(x, y) {
  for (const a of ag) {
    const dx = a.x - x, dy = a.y - y, d = Math.hypot(dx, dy);
    if (d < 3.4 && d > .01) { const s = (1 - d / 3.4) * 6; a.vx += dx / d * s; a.vy += dy / d * s; a.p += (1 - d / 3.4) * 3; }
  }
  pop(x, y - 1, "¡BUM!"); burstAt(x, y, 90); shake = Math.min(1.2, shake + .8);
}
const turnTo = (a, b, m) => { let d = ((b - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; return a + clamp(d, -m, m); };
function stepMovers() {
  if (phase === "show" || phase === "evac") {
    eventT -= DT;
    if (eventT <= 0 && movers.length < 14) { spawnEvent(scene.events[(Math.random() * scene.events.length) | 0]); eventT = phase === "show" ? rnd(6, 9) : rnd(9, 13); }
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
    } else if (m.beh === "fly") {
      const q = Math.min(1, m.t / m.dur);
      m.x = m.sx + (m.tx - m.sx) * q; m.y = m.sy + (m.ty - m.sy) * q; m.h = Math.sin(q * Math.PI) * 9; m.ang = Math.atan2(m.ty - m.sy, m.tx - m.sx);
      if (q >= 1) { blast(m.x, m.y); m.dead = true; }
    } else {
      const [tx, ty] = m.pts[m.i], dx = tx - m.x, dy = ty - m.y, d = Math.hypot(dx, dy);
      if (d < .5) { m.i++; if (m.i >= m.pts.length) m.dead = true; }
      else { m.ang = turnTo(m.ang, Math.atan2(dy, dx), DT * 7); const sp = m.speed * (.6 + .4 * Math.max(0, Math.cos(m.ang - Math.atan2(dy, dx)))) / (1 + (m.hits || 0) * .3); m.x += Math.cos(m.ang) * sp * DT; m.y += Math.sin(m.ang) * sp * DT; }
      // las vallas del jugador frenan a los animales y coches: chocan y se dan la vuelta
      if (!m.bounced) for (const o of obs) {
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
    if (m.say && m.t >= (m.nextSay || 0) && m.y < WH) { pop(m.x, m.y - 1.6, m.say); m.nextSay = m.t + m.sayEvery; }
  }
  movers = movers.filter(m => !m.dead);
}
// empujones y miedo: la gente se aparta (o sale volando) cuando algo le pasa encima
function moverForces() {
  for (const m of movers) {
    if (m.air && !m.push) continue;
    m.hits = 0;
    const rad = Math.max(m.r + R, m.scare);
    const gx0 = clamp(Math.floor((m.x - rad) / CS), 0, GW - 1), gx1 = clamp(Math.floor((m.x + rad) / CS), 0, GW - 1);
    const gy0 = clamp(Math.floor((m.y - rad) / CS), 0, GH - 1), gy1 = clamp(Math.floor((m.y + rad) / CS), 0, GH - 1);
    for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++)
      for (let j = hashHead[gy * GW + gx]; j !== -1; j = hashNext[j]) {
        const a = ag[j], ex = a.x - m.x, ey = a.y - m.y, d = Math.hypot(ex, ey) || .01, nx = ex / d, ny = ey / d;
        if (d < m.r + R) { const ov = m.r + R - d; a.fx += nx * ov * m.push * MPUSH; a.fy += ny * ov * m.push * MPUSH; a.p += ov / R * MPRES; m.hits++; }
        if (m.scare && d < m.scare) { const s = (1 - d / m.scare) * MSCARE; a.fx += nx * s; a.fy += ny * s; }
      }
  }
}
function stepPerformers(dt) {
  for (const p of performers) {
    p.t += dt;
    const [cx, cy, r, w, ph] = p.orbit, a = ph + p.t * w;
    p.x = cx + Math.cos(a) * r; p.y = cy + Math.sin(a) * r; p.ang = a + (w >= 0 ? Math.PI / 2 : -Math.PI / 2);
  }
}

