// Human Tsunami · two-body comedy physics for crowd agents
//
// Works with the game's own crowd simulation (sim.js): every agent there is already a particle on the
// ground plane (x, y, vx, vy) that the flow field steers and the crowd pushes around. This module treats
// that particle as the PELVIS (navigation and ground friction stay in sim.js) and adds a second, heavier
// body on top: the TORSO + HEAD, a 3D point joined to the hips by an elastic point-to-point constraint.
//
//   1. Two bodies: pelvis (driven by the sim) and torso (simulated here), joined by a spring-damper that
//      keeps them L metres apart, plus an "upright torque" (a soft spring toward the point straight above
//      the hips) that is deliberately weak and under-damped: people wobble, overshoot and whip around
//      when they start, stop or get shoved. The torso pulls back on the pelvis (feedback), so a falling
//      torso drags its legs along.
//   2. Stumble: when two neighbours bump with a relative speed above a threshold, the one hit stumbles
//      for 1.5 s: the constraint and the upright torque go soft, the torso gets a random sideways shove,
//      and part of the impact is passed on to the people in front of it (domino effect, with decay).
//   3. Level of detail by distance to the camera, refreshed a slice of the crowd at a time:
//        LOD 0 (near) full two-body physics, collisions and stumbles;
//        LOD 1 (mid)  pelvis still collides and stumbles, torso is kinematic (placed from the velocity);
//        LOD 2 (far)  no physics at all, the renderer uses its plain animation.
//      All updates run from one central batch loop (update), capped by an agent budget and a time
//      budget per step; agents left over carry their elapsed time to the next step, so a huge crowd
//      never freezes the browser.
//
// Usage: TwoBody.init(worldW, worldH); every sim step TwoBody.update(agents, dt, time);
// every frame TwoBody.setViewer(x, y, height). Read a.tb.lean / a.tb.rock (radians) and a.tb.st
// (stumble seconds left) when drawing. Tune TwoBody.CFG.
const TwoBody = (() => {
  const CFG = {
    hip: .95, L: .62,                 // hip height and hip-to-torso distance (m)
    torsoMass: 1.5, pelvisMass: 1,    // top-heavy on purpose: quick turns whip the torso around
    k: 260, c: 9,                     // elastic constraint: stiffness and damping (per kg)
    kUp: 34, cUp: 2.1,                // upright torque: soft and under-damped = comedy sway
    wobble: 2.2,                      // random jiggle while walking (m/s² per m/s of speed)
    feedback: .22,                    // share of the torso's pull that goes back into the pelvis
    stumbleSpeed: 3.1,                // relative bump speed that starts a stumble (m/s)
    hitterSpeed: 2.4,                 // and the one doing the hitting must really be moving
    stumbleTime: 1.5, stumbleSoft: .3, stumbleShove: 2.2, cooldown: .7,
    domino: .85, dominoRange: 1.1, dominoDepth: 6,
    contact: .58,                     // centre distance that counts as a bump (2 × radius + a bit)
    nearR: 30, midR: 70, hyst: 4,     // LOD distances to the camera (m)
    lodSlices: 8,                     // the LOD of the whole crowd is refreshed over this many steps
    budget: 700,                      // max full-physics agents per step (the rest wait their turn)
    msBudget: 2.5,                    // and max milliseconds per step
    maxDt: .05,
  };
  const V = { x: 0, y: 0, h: 60 };
  let W = 40, H = 80, cs = .6, gw = 1, gh = 1, head = null, next = null, lodCursor = 0, physCursor = 0;
  const queue = [];
  const stats = { near: 0, mid: 0, far: 0, stumbles: 0, chain: 0, physics: 0 };
  let onStumble = null;

  function init(worldW, worldH) {
    W = worldW; H = worldH; gw = Math.ceil(W / cs) + 2; gh = Math.ceil(H / cs) + 2;
    head = new Int32Array(gw * gh); next = new Int32Array(8192); lodCursor = physCursor = 0; stats.stumbles = stats.chain = 0; queue.length = 0;
  }
  function setViewer(x, y, h) { V.x = x; V.y = y; V.h = h; }
  function state(a) {
    return a.tb || (a.tb = { lod: 2, tx: a.x, ty: a.y, tz: CFG.hip + CFG.L, vx: 0, vy: 0, vz: 0, st: 0, cd: 0, acc: 0, lean: 0, rock: 0, kMul: 1, pvx: 0, pvy: 0 });
  }
  const cell = (x, y) => (Math.min(gh - 1, Math.max(0, Math.floor(y / cs) + 1)) * gw + Math.min(gw - 1, Math.max(0, Math.floor(x / cs) + 1)));

  // ---- 3. level of detail: a slice of the crowd per step, with hysteresis
  function refreshLod(ag) {
    const n = ag.length; if (!n) return;
    const slice = Math.ceil(n / CFG.lodSlices);
    for (let k = 0; k < slice; k++) {
      lodCursor = (lodCursor + 1) % n;
      const a = ag[lodCursor], tb = state(a), d = Math.hypot(a.x - V.x, a.y - V.y, V.h);
      let lod = tb.lod;
      if (lod === 0 && d > CFG.nearR + CFG.hyst) lod = 1; else if (lod > 0 && d < CFG.nearR) lod = 0;
      if (lod === 1 && d > CFG.midR + CFG.hyst) lod = 2; else if (lod === 2 && d < CFG.midR) lod = 1;
      if (lod === 2 && tb.lod !== 2) { tb.lean = tb.rock = 0; tb.vx = tb.vy = tb.vz = 0; }
      if (lod === 0 && tb.lod !== 0) { tb.tx = a.x; tb.ty = a.y; tb.tz = CFG.hip + CFG.L; tb.vx = a.vx; tb.vy = a.vy; tb.vz = 0; tb.acc = 0; }
      tb.lod = lod;
    }
  }

  // ---- 1. the torso on its elastic constraint, with the upright torque
  function stepTorso(a, tb, dt) {
    const ax = a.x, ay = a.y, az = CFG.hip;
    let dx = tb.tx - ax, dy = tb.ty - ay, dz = tb.tz - az;
    const len = Math.hypot(dx, dy, dz) || 1e-4, nx = dx / len, ny = dy / len, nz = dz / len;
    const rvx = tb.vx - a.vx, rvy = tb.vy - a.vy, rvz = tb.vz, vn = rvx * nx + rvy * ny + rvz * nz;
    const soft = tb.kMul, fs = -(CFG.k * soft) * (len - CFG.L) - CFG.c * vn;
    let fx = fs * nx, fy = fs * ny, fz = fs * nz;
    // upright: pull the torso toward the point straight above the hips (horizontal only, imperfect)
    const kUp = CFG.kUp * soft, cUp = CFG.cUp * (tb.st > 0 ? .4 : 1);
    fx += -kUp * dx - cUp * rvx; fy += -kUp * dy - cUp * rvy;
    fz += -9.81 * .15;   // a little sag, so a soft (stumbling) body droops
    // constraint + upright act on both bodies; the walking jiggle only shakes the torso
    const cfx = fx, cfy = fy, sp = Math.hypot(a.vx, a.vy), j = CFG.wobble * sp + (tb.st > 0 ? 6 : 0);
    fx += (Math.random() - .5) * j; fy += (Math.random() - .5) * j;
    const im = 1 / CFG.torsoMass;
    tb.vx += fx * im * dt; tb.vy += fy * im * dt; tb.vz += fz * im * dt;
    tb.tx += tb.vx * dt; tb.ty += tb.vy * dt; tb.tz += tb.vz * dt;
    // keep the joint from stretching like chewing gum
    dx = tb.tx - ax; dy = tb.ty - ay; dz = tb.tz - az; const l2 = Math.hypot(dx, dy, dz);
    if (l2 > CFG.L * 1.6) { const s = CFG.L * 1.6 / l2; tb.tx = ax + dx * s; tb.ty = ay + dy * s; tb.tz = az + dz * s; }
    if (tb.tz < CFG.hip * .5) { tb.tz = CFG.hip * .5; if (tb.vz < 0) tb.vz = 0; }
    // reaction on the pelvis: the torso drags the legs along
    const fb = CFG.feedback / CFG.pelvisMass;
    a.vx -= cfx * fb * dt; a.vy -= cfy * fb * dt;
    poseFrom(a, tb);
  }
  // LOD 1: the torso is kinematic, leaning against the pelvis acceleration (no integration)
  function kinematicTorso(a, tb, dt) {
    const axc = (a.vx - tb.pvx) / Math.max(dt, 1e-3), ayc = (a.vy - tb.pvy) / Math.max(dt, 1e-3);
    tb.pvx = a.vx; tb.pvy = a.vy;
    const lag = .012, k = Math.min(1, dt * 8);
    tb.tx += ((a.x - axc * lag) - tb.tx) * k; tb.ty += ((a.y - ayc * lag) - tb.ty) * k; tb.tz = CFG.hip + CFG.L;
    poseFrom(a, tb);
    if (tb.st > 0) tb.rock += Math.sin(tb.st * 14) * .3 * (tb.st / CFG.stumbleTime);
  }
  function poseFrom(a, tb) {   // torso offset → lean (forward) and rock (sideways) in the agent's frame
    const ox = tb.tx - a.x, oy = tb.ty - a.y, oz = Math.max(.15, tb.tz - CFG.hip), c = Math.cos(a.h || 0), s = Math.sin(a.h || 0);
    tb.lean = Math.max(-1.1, Math.min(1.1, Math.atan2(ox * c + oy * s, oz)));
    tb.rock = Math.max(-1.1, Math.min(1.1, Math.atan2(-ox * s + oy * c, oz)));
  }

  // ---- 2. bumps, stumbles and the domino chain
  function stumble(a, nx, ny, impact, depth) {
    const tb = state(a); if (tb.st > 0 || tb.cd > 0 || tb.lod === 2) return;
    tb.st = CFG.stumbleTime; tb.kMul = CFG.stumbleSoft; stats.stumbles++; if (depth) stats.chain++;
    const side = Math.random() < .5 ? -1 : 1, sh = CFG.stumbleShove * (.6 + Math.random() * .8);
    tb.vx += (-ny * side) * sh + nx * impact * .5; tb.vy += (nx * side) * sh + ny * impact * .5;   // random sideways shove + the hit
    a.vx += nx * impact * .3; a.vy += ny * impact * .3;
    if (onStumble) onStumble(a, depth);
    if (depth < CFG.dominoDepth) queue.push(a, nx, ny, impact * CFG.domino, depth + 1);
  }
  function domino(ag, a, nx, ny, impact, depth) {   // pass part of the hit to the people in front
    if (impact < .2) return;
    const r = CFG.dominoRange, gx0 = Math.floor((a.x - r) / cs) + 1, gx1 = Math.floor((a.x + r) / cs) + 1, gy0 = Math.floor((a.y - r) / cs) + 1, gy1 = Math.floor((a.y + r) / cs) + 1;
    for (let gy = Math.max(0, gy0); gy <= Math.min(gh - 1, gy1); gy++) for (let gx = Math.max(0, gx0); gx <= Math.min(gw - 1, gx1); gx++)
      for (let i = head[gy * gw + gx]; i >= 0; i = next[i]) {
        const b = ag[i]; if (b === a) continue;
        const ex = b.x - a.x, ey = b.y - a.y, d = Math.hypot(ex, ey); if (d > r || d < 1e-3) continue;
        const ahead = (ex * nx + ey * ny) / d; if (ahead < .3) continue;
        const k = impact * ahead * (1 - .5 * d / r);
        b.vx += nx * k * .5; b.vy += ny * k * .5;
        if (k > CFG.stumbleSpeed * .3) stumble(b, nx, ny, k, depth);
      }
  }

  // ---- the central batch loop: call once per simulation step
  function update(ag, dt) {
    if (!head) init(W, H);
    const n = ag.length; stats.near = stats.mid = stats.far = 0; stats.physics = 0;
    if (!n) return;
    // huge crowds: fewer full-physics agents and a shorter mid range (the camera can't get close in big venues anyway)
    const huge = n > 4000; CFG.budget = huge ? 380 : 700; CFG.midR = huge ? 48 : 70; CFG.nearR = huge ? 24 : 30;
    refreshLod(ag);
    // spatial hash over the agents that still have physics (near + mid)
    if (next.length < n) next = new Int32Array(n * 2);
    head.fill(-1);
    for (let i = 0; i < n; i++) {
      const tb = ag[i].tb; if (!tb || tb.lod === 2) { stats.far++; continue; }
      if (tb.lod === 0) stats.near++; else stats.mid++;
      const c = cell(ag[i].x, ag[i].y); next[i] = head[c]; head[c] = i;
      if (tb.st > 0) { tb.st -= dt; tb.kMul = CFG.stumbleSoft + (1 - CFG.stumbleSoft) * smooth(1 - tb.st / CFG.stumbleTime); if (tb.st <= 0) { tb.st = 0; tb.kMul = 1; tb.cd = CFG.cooldown; } }
      else if (tb.cd > 0) tb.cd -= dt;
    }
    // bumps between neighbours (pelvis level, near and mid)
    const c2 = CFG.contact * CFG.contact;
    for (let i = 0; i < n; i++) {
      const a = ag[i], tb = a.tb; if (!tb || tb.lod === 2 || a.air > 0) continue;
      const gx = Math.floor(a.x / cs) + 1, gy = Math.floor(a.y / cs) + 1;
      for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
        const cx = gx + ox, cy = gy + oy; if (cx < 0 || cy < 0 || cx >= gw || cy >= gh) continue;
        for (let j = head[cy * gw + cx]; j >= 0; j = next[j]) {
          if (j <= i) continue;
          const b = ag[j], ex = b.x - a.x, ey = b.y - a.y, d2 = ex * ex + ey * ey; if (d2 > c2 || d2 < 1e-6) continue;
          const d = Math.sqrt(d2), nx = ex / d, ny = ey / d;
          const ua = a.vx * nx + a.vy * ny, ub = -(b.vx * nx + b.vy * ny), closing = ua + ub;   // ua: a heading into b, ub: b into a
          if (closing < CFG.stumbleSpeed || Math.max(ua, ub) < CFG.hitterSpeed) continue;
          if (ua >= ub) stumble(b, nx, ny, closing, 0); else stumble(a, -nx, -ny, closing, 0);   // the one who got hit stumbles
        }
      }
    }
    // domino chains, breadth first
    for (let q = 0; q < queue.length; q += 5) domino(ag, queue[q], queue[q + 1], queue[q + 2], queue[q + 3], queue[q + 4]);
    queue.length = 0;
    // torso updates: near agents get full physics within the budget, the rest wait with their time saved
    const t0 = typeof performance !== "undefined" ? performance.now() : 0;
    let done = 0;
    for (let i = 0; i < n; i++) { const tb = ag[i].tb; if (tb && tb.lod < 2) tb.acc += dt; }
    for (let k = 0; k < n && done < CFG.budget; k++) {
      physCursor = (physCursor + 1) % n;
      const a = ag[physCursor], tb = a.tb; if (!tb || tb.lod === 2 || tb.acc <= 0) continue;
      const h = Math.min(tb.acc, CFG.maxDt); tb.acc = 0;
      if (tb.lod === 0) { stepTorso(a, tb, h); done++; } else kinematicTorso(a, tb, h);
      if ((k & 63) === 63 && t0 && performance.now() - t0 > CFG.msBudget) break;
    }
    stats.physics = done;
  }
  const smooth = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };

  return { CFG, stats, init, update, setViewer, state, stumble, set onStumble(f) { onStumble = f; } };
})();
if (typeof module !== "undefined") module.exports = TwoBody;
