// Human Tsunami · venue, flow fields, crowd and phases
function buildWorld() {
  obs = [];
  // venue edges
  seg(0, 0, 0, SH, .2, "edge"); seg(WW, 0, WW, SH, .2, "edge"); seg(0, 0, WW, 0, .2, "edge");
  scene.build();
  // entrance fence with gates
  let x = 0;
  for (let i = 0; i < SLOTS; i++) {
    const g0 = slotX(i) - SLOT_W / 2, g1 = slotX(i) + SLOT_W / 2;
    seg(x, FENCE_Y, g0, FENCE_Y, .3, "fence");
    if (!gates[i]) seg(g0, FENCE_Y, g1, FENCE_Y, .3, "closed");
    x = g1;
  }
  seg(x, FENCE_Y, WW, FENCE_Y, .3, "fence");
  for (const f of fences) seg(f.ax, f.ay, f.bx, f.by, .35, "player");
  for (const gd of guards) circ(gd.x, gd.y, .35, "guard");
  // spatial buckets
  buckets = Array.from({ length: BW * BH }, () => []);
  obs.forEach((o, i) => {
    const [x0, y0, x1, y1] = bbox(o);
    for (let by = Math.max(0, Math.floor((y0 - 1) / BKS)); by <= Math.min(BH - 1, Math.floor((y1 + 1) / BKS)); by++)
      for (let bx = Math.max(0, Math.floor((x0 - 1) / BKS)); bx <= Math.min(BW - 1, Math.floor((x1 + 1) / BKS)); bx++) buckets[by * BW + bx].push(i);
  });
  buildFields();
  staticDirty = true;
  resetPreview();
}
function bbox(o) {
  if (o.t === "r") return [o.x0, o.y0, o.x1, o.y1];
  if (o.t === "c") return [o.x - o.r, o.y - o.r, o.x + o.r, o.y + o.r];
  return [Math.min(o.ax, o.bx) - o.th, Math.min(o.ay, o.by) - o.th, Math.max(o.ax, o.bx) + o.th, Math.max(o.ay, o.by) + o.th];
}
// signed distance to the surface and outward normal
function contact(o, px, py) {
  if (o.t === "c") { const dx = px - o.x, dy = py - o.y, d = Math.hypot(dx, dy) || 1e-6; return [dx / d, dy / d, d - o.r]; }
  if (o.t === "r") {
    if (px > o.x0 && px < o.x1 && py > o.y0 && py < o.y1) {
      const m = [px - o.x0, o.x1 - px, py - o.y0, o.y1 - py], k = m.indexOf(Math.min(...m));
      return [[-1, 1, 0, 0][k], [0, 0, -1, 1][k], -m[k]];
    }
    const cx = clamp(px, o.x0, o.x1), cy = clamp(py, o.y0, o.y1), dx = px - cx, dy = py - cy, d = Math.hypot(dx, dy) || 1e-6;
    return [dx / d, dy / d, d];
  }
  const vx = o.bx - o.ax, vy = o.by - o.ay, l2 = vx * vx + vy * vy || 1e-9;
  const t = clamp(((px - o.ax) * vx + (py - o.ay) * vy) / l2, 0, 1);
  const cx = o.ax + vx * t, cy = o.ay + vy * t, dx = px - cx, dy = py - cy, d = Math.hypot(dx, dy);
  if (d < 1e-6) { const l = Math.sqrt(l2); return [-vy / l, vx / l, -o.th / 2]; }
  return [dx / d, dy / d, d - o.th / 2];
}

// ===== Flow fields =====
let blockedC, fStage, fExit, dirS, dirE;
function buildFields() {
  blockedC = new Uint8Array(GW * GH);
  obs.forEach(o => {
    const [x0, y0, x1, y1] = bbox(o);
    for (let gy = Math.max(0, Math.floor((y0 - R) / CS)); gy <= Math.min(GH - 1, Math.floor((y1 + R) / CS)); gy++)
      for (let gx = Math.max(0, Math.floor((x0 - R) / CS)); gx <= Math.min(GW - 1, Math.floor((x1 + R) / CS)); gx++)
        if (contact(o, (gx + .5) * CS, (gy + .5) * CS)[2] < R * .8) blockedC[gy * GW + gx] = 1;
  });
  // show goal: right up against the pit barriers
  const front = obs.filter(o => scene.goal(o));
  fStage = dijkstra(id => {
    if (blockedC[id]) return false;
    const px = (id % GW + .5) * CS, py = ((id / GW) | 0) * CS + CS / 2;
    if (py > scene.goalMaxY) return false;
    return front.some(o => contact(o, px, py)[2] < 1.1);
  });
  fExit = dijkstra(id => !blockedC[id] && ((id / GW) | 0) >= GH - 2);
  dirS = dirField(fStage); dirE = dirField(fExit);
  baseS = null; attr = null; altF = null; altDir = null;
}
// moving goals: a sale, a bridal bouquet, a walking celebrity
let baseS = null, attr = null, altF = null, altDir = null;
function goalField(x, y, r) {
  const f = dijkstra(id => !blockedC[id] && Math.hypot((id % GW + .5) * CS - x, ((id / GW) | 0) * CS + CS / 2 - y) < r);
  return f.some(isFinite) ? f : null;
}
// part of the crowd (share) switches goals: fans follow the idol, singles go for the bouquet
let attF = null, attDir = null, attShare = .5;
function setAttractor(x, y, r, share) {
  const f = goalField(x, y, r || 2.5); if (!f) return false;
  attF = f; attDir = dirField(f); attShare = share ?? attShare; attr = { x, y, r: r || 2.5 }; return true;
}
function clearAttractor() { attF = null; attDir = null; attr = null; }
// only part of the crowd (those with a.alt) heads to another goal
function setAlt(x, y, r) { const f = goalField(x, y, r || 2.5); if (!f) return false; altF = f; altDir = dirField(f); return true; }
function clearAlt() { altF = null; altDir = null; }
function dijkstra(goal) {
  const d = new Float64Array(GW * GH).fill(Infinity), heap = [];
  const push = (v, id) => { heap.push([v, id]); let i = heap.length - 1; while (i) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let s = i; if (l < heap.length && heap[l][0] < heap[s][0]) s = l; if (r < heap.length && heap[r][0] < heap[s][0]) s = r; if (s === i) break; [heap[s], heap[i]] = [heap[i], heap[s]]; i = s; } } return top; };
  for (let id = 0; id < GW * GH; id++) if (goal(id)) { d[id] = 0; push(0, id); }
  while (heap.length) {
    const [v, id] = pop(); if (v > d[id]) continue;
    const x = id % GW, y = (id / GW) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
      const n = ny * GW + nx; if (blockedC[n]) continue;
      if (dx && dy && (blockedC[y * GW + nx] || blockedC[ny * GW + x])) continue;
      const nv = v + (dx && dy ? 1.4142 : 1) * CS;
      if (nv < d[n]) { d[n] = nv; push(nv, n); }
    }
  }
  return d;
}
function dirField(f) {
  const dir = new Float32Array(GW * GH * 2);
  for (let id = 0; id < GW * GH; id++) {
    if (!isFinite(f[id])) continue;
    const x = id % GW, y = (id / GW) | 0;
    let gx = 0, gy = 0, bw = 0, bx = 0, by = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
      if (dx && dy && (blockedC[y * GW + nx] || blockedC[ny * GW + x])) continue;
      const v = f[ny * GW + nx]; if (!isFinite(v)) continue;
      const w = (f[id] - v) / Math.hypot(dx, dy); if (w > 0) { gx += dx * w; gy += dy * w; }
      if (w > bw) { bw = w; bx = dx; by = dy; }
    }
    // adding the best neighbor breaks ties (e.g. right between two gates)
    gx += bx * bw * 1.5; gy += by * bw * 1.5;
    const l = Math.hypot(gx, gy);
    if (l) { dir[id * 2] = gx / l; dir[id * 2 + 1] = gy / l; }
  }
  return dir;
}
const cellOf = (x, y) => clamp(Math.floor(y / CS), 0, GH - 1) * GW + clamp(Math.floor(x / CS), 0, GW - 1);

// ===== Crowd =====
const SHIRTS = ["#d8433b","#2f6fc4","#e8b631","#3d9a5b","#8a4fbf","#e07a2e","#f4f4f0","#2b2f35","#3fb3c4","#d0679b","#7a8c3a","#9b5a3c"];
const HEAT = ["#2c4fd6","#2f86e0","#2fb8d0","#33c08a","#5cc63c","#b8d230","#f2c530","#f39424","#ec5a22","#e0322b"];
let surgeT = 0, nextDrop = 0, drops = 0, SURGE = [.55, 1.1];
let abducted = 0, slipT = 0, MOD = null, eventLog = new Set(), mega = { n: 3, active: [] };
let ag = [], fallen = [], phase = "plan", spawned = 0, fullAt = 0, t = 0, evacT = 0, dead = 0, evacuated = 0;
let hashHead = new Int32Array(GW * GH), hashNext = new Int32Array(0);

function looks() {
  const r = Math.random();
  const L = { m: r < .3 ? 0 : r < .5 ? 1 : r < .68 ? 2 : r < .84 ? 3 : 4, sc: Math.random() < .05 ? .72 : .88 + Math.random() * .2,
    sk: (Math.random() * 5) | 0, pc: (Math.random() * 6) | 0, hc: (Math.random() * 6) | 0, ac: (Math.random() * SHIRTS.length) | 0, st: (Math.random() * 3) | 0, wp: Math.random() * 6,
    c: (Math.random() * SHIRTS.length) | 0 };
  // today's twists: Children's Day (everyone tiny) and mandatory uniform (everyone identical)
  // accessories: 1 balloon, 2 party hat, 3 umbrella, 4 kid on the shoulders, 5 wide sun hat
  const r2 = Math.random();
  L.acc = r2 < .06 ? 1 : r2 < .11 ? 2 : r2 < .14 ? 3 : r2 < .17 ? 4 : r2 < .22 ? 5 : 0;
  if (MOD && MOD.rain && Math.random() < .45) L.acc = 3;
  if (MOD && MOD.sizeMul) L.sc *= MOD.sizeMul;
  if (MOD && MOD.uniform) { L.c = L.ac = MOD.uc || 0; L.pc = 0; }
  return L;
}
function spawn() {
  const x = .6 + Math.random() * (WW - 1.2), y = WH + .6 + Math.random() * (SH - WH - 1.2);
  for (let i = Math.max(0, ag.length - 400); i < ag.length; i++) { const a = ag[i]; if ((a.x - x) ** 2 + (a.y - y) ** 2 < .4) return; }
  const e = Math.random();
  ag.push({ x, y, vx: 0, vy: -.5, h: -Math.PI / 2, v0: (1.35 + Math.random() * .5) * (MOD && MOD.speed || 1), alt: !!(MOD && MOD.altShare && Math.random() < MOD.altShare), fol: Math.random(), lift: 0, beam: false, tol: .8 + e * e * 26,
    leave: Math.random() * 16, ph: Math.random() * 6.28, dance: false, p: 0, ...looks(), ps: 0, dmg: 0, fx: 0, fy: 0 });
  spawned++;
}

// more people show up mid-show (e.g. a truckload of bused-in supporters)
function spawnAt(x, y, n) {
  let k = 0;
  for (let tries = 0; tries < n * 4 && k < n; tries++) {
    const px = x + (Math.random() - .5) * 6, py = y + (Math.random() - .5) * 4;
    if (blockedC[cellOf(px, py)]) continue;
    const e = Math.random();
    ag.push({ x: px, y: py, vx: 0, vy: 0, h: 0, v0: 1.4 + Math.random() * .5, alt: false, fol: Math.random(), lift: 0, beam: false, tol: .8 + e * e * 26, leave: Math.random() * 16, ph: Math.random() * 6.28, dance: false, p: 0, ...looks(), ps: 0, dmg: 0, fx: 0, fy: 0 });
    k++;
  }
  CROWD += k; spawned += k; return k;
}
function step() {
  t += DT;
  const evac = phase === "evac"; if (evac) evacT += DT;
  if (phase === "show") {
    for (let k = 0; k < 30 && spawned < CROWD; k++) spawn();
    if (spawned >= CROWD) {
      if (!fullAt) { fullAt = t; nextDrop = t + 6; drops = 0; caption("The show begins", false, 2200); burst(140); }
      if (t > nextDrop && t < fullAt + SHOW_TIME - 5) { surgeT = 3.5; nextDrop = t + (10 + Math.random() * 5) * (MOD && MOD.dropMul || 1); onDrop(drops++ === 0); }
      if (t > fullAt + SHOW_TIME) startEvac();
    }
  }
  if (surgeT > 0) surgeT -= DT;
  hashHead.fill(-1); if (hashNext.length < ag.length) hashNext = new Int32Array(ag.length * 2);
  for (let i = 0; i < ag.length; i++) { const a = ag[i], id = cellOf(a.x, a.y); hashNext[i] = hashHead[id]; hashHead[id] = i; a.p = 0; a.fx = 0; a.fy = 0; a.beam = false; }
  for (let i = 0; i < ag.length; i++) {
    const a = ag[i], cx = clamp(Math.floor(a.x / CS), 0, GW - 1), cy = clamp(Math.floor(a.y / CS), 0, GH - 1);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
      for (let j = hashHead[ny * GW + nx]; j !== -1; j = hashNext[j]) {
        if (j <= i) continue;
        const b = ag[j], ex = b.x - a.x, ey = b.y - a.y, d2 = ex * ex + ey * ey;
        if (d2 >= 4 * R * R || d2 < 1e-10) continue;
        const d = Math.sqrt(d2), ov = 2 * R - d, f = 60 * ov, ux = ex / d, uy = ey / d;
        a.fx -= ux * f; a.fy -= uy * f; b.fx += ux * f; b.fy += uy * f;
        const pp = ov / (2 * R) * 3; a.p += pp; b.p += pp;
      }
    }
  }
  stepGlobal(); stepMovers(); moverForces(); calmForces();
  const out = [];
  for (const a of ag) {
    const leaving = evac && evacT > a.leave;
    if (windF.t > 0) a.fx += windF.x * 2.2 * Math.min(1, windF.t);
    const useAtt = !leaving && attF && a.fol < attShare, useAlt = !useAtt && !leaving && a.alt && altF;
    const id = cellOf(a.x, a.y), f = leaving ? fExit : useAtt ? attF : useAlt ? altF : fStage, dir = leaving ? dirE : useAtt ? attDir : useAlt ? altDir : dirS;
    const surging = surgeT > 0 && !evac;
    let want = leaving ? a.v0 * 1.25 : surging ? (f[id] > a.tol * SURGE[0] ? a.v0 * SURGE[1] : 0) : (f[id] > a.tol ? a.v0 : 0);
    // people who already made it dance and never stop moving
    a.dance = phase === "show" && !leaving && fullAt > 0 && f[id] <= a.tol + 1;
    if (a.dance) { a.fx += Math.cos(t * 5.5 + a.ph) * .9; a.fy += Math.sin(t * 4.3 + a.ph * 1.7) * .9; a.h += Math.sin(t * 2.7 + a.ph) * .04; }
    let dx = dir[id * 2], dy = dir[id * 2 + 1];
    if (!isFinite(f[id])) {
      // stuck in a blocked cell: look for the nearest free cell
      const gx = id % GW, gy = (id / GW) | 0; let best = Infinity;
      for (let oy = -2; oy <= 2; oy++) for (let ox = -2; ox <= 2; ox++) {
        const nx = gx + ox, ny = gy + oy; if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
        const v = isFinite(f[ny * GW + nx]) ? Math.hypot(ox, oy) + f[ny * GW + nx] * 1e-3 : Infinity;
        if (v < best) { best = v; const l = Math.hypot(ox, oy); dx = ox / l; dy = oy / l; }
      }
      want = isFinite(best) ? a.v0 * .6 : 0;
    }
    if (leaving && f[id] === 0) { dx = 0; dy = 1; }
    // a UFO beam lifts people up
    if (a.beam) a.lift += DT * .75; else if (a.lift > 0) a.lift = Math.max(0, a.lift - DT * 1.5);
    if (a.lift > 0) { want = 0; a.fx *= .2; a.fy *= .2; }
    if (a.lift > 1.5) { abducted++; continue; }
    const tau = slipT > 0 ? 2.2 : .5;   // on the slippery floor nobody can stop
    a.vx += ((dx * want - a.vx) / tau + a.fx) * DT;
    a.vy += ((dy * want - a.vy) / tau + a.fy) * DT;
    const sp = Math.hypot(a.vx, a.vy); if (sp > 2.6) { a.vx *= 2.6 / sp; a.vy *= 2.6 / sp; }
    a.x += a.vx * DT; a.y += a.vy * DT;
    if (sp > .15) a.h = Math.atan2(a.vy, a.vx);
    // collisions with the stage, fences and gate fence
    const bk = buckets[clamp(Math.floor(a.y / BKS), 0, BH - 1) * BW + clamp(Math.floor(a.x / BKS), 0, BW - 1)];
    for (const oi of bk) {
      const [nx, ny, d] = contact(obs[oi], a.x, a.y);
      if (d >= R) continue;
      const ov = R - d; a.x += nx * ov; a.y += ny * ov;
      const vn = a.vx * nx + a.vy * ny; if (vn < 0) { a.vx -= vn * nx; a.vy -= vn * ny; }
      a.p += ov / R * 1.5;
    }
    a.x = clamp(a.x, R, WW - R);
    if (!evac) a.y = Math.min(a.y, SH - R);
    a.ps += (a.p - a.ps) * .1;
    const pc = PCRIT * (MOD && MOD.pcritMul || 1);
    if (a.p > pc) a.dmg += (a.p - pc) * DT * 1.6; else a.dmg = Math.max(0, a.dmg - DT * .4);
    if (a.dmg >= 1) { fallen.push(a); onFall(a.x, a.y); setDead(dead + 1); continue; }
    if (evac && a.y > SH - .6) { evacuated++; continue; }
    out.push(a);
  }
  ag = out;
  if (evac && (ag.length === 0 || evacT > 100)) finish();
}

// ===== Steam: achievements and records =====
// window.steam is set by the desktop app (desktop/preload.js); without Steam, this does nothing
const achieve = id => { try { window.steam && window.steam.achieve(id); } catch (e) { /* no Steam */ } };
let sceneKey = "plaza";
function loadBest() { try { return JSON.parse(localStorage.getItem("mh.best") || "{}"); } catch (e) { return {}; } }
const totalStars = () => Object.values(loadBest()).reduce((s, v) => s + v, 0);
const isUnlocked = key => !!window.__unlockAll || totalStars() >= (SCENES[key].unlock || 0);
function saveBest(key, stars) {
  const best = loadBest(); if ((best[key] ?? -1) >= stars) return;
  best[key] = stars; try { localStorage.setItem("mh.best", JSON.stringify(best)); } catch (e) { /* no storage */ }
}

// ===== Phases =====
function canStart() {
  for (let i = 0; i < SLOTS; i++) if (gates[i] && !isFinite(fStage[cellOf(slotX(i), FENCE_Y + 1.5)])) {
    toast("A fence leaves a gate with no path to the stage. Clear the way."); return false;
  }
  return true;
}
// the button goes through the today's-twist roulette; tests call start() directly
function start(mod) {
  if (!canStart()) return;
  MOD = mod || MODS_BY_ID.normal; CROWD = Math.round(scene.crowd * (MOD.crowdMul || 1));
  clearAttractor(); clearAlt(); abducted = 0; slipT = 0; timers = []; attrT = 0; eventLog = new Set(); mega = { n: 3, active: [] };
  phase = "show"; t = 0; spawned = 0; fullAt = 0; surgeT = 0; ag = []; fallen = []; movers = []; pops = []; eventT = 7; ambientT = 5; windF = { x: 0, t: 0 }; ola = null; rockets = []; sparks = []; puffs = []; cheerT = 0; evacuated = 0; evacT = 0; setDead(0, true); resetFx();
  caption("The gates are open!", false, 2200); ui();
  if (MOD.uniform) MOD.uc = (Math.random() * SHIRTS.length) | 0;
  if (MOD.start) MOD.start();
  if (scene.onStart) scene.onStart();
  G3.photo = null;
}
function startEvac() { phase = "evac"; evacT = 0; surgeT = 0; clearAttractor(); clearAlt(); if (!G3.photo) G3.wantPhoto = true; sfx("siren"); caption("Show's over. Everybody out!", false, 2600); ui(); }
function finish() {
  if (demo) { startDemo(); return; }
  phase = "done";
  const stuck = ag.length, pct = (dead + stuck) / CROWD;
  const stars = dead === 0 && stuck === 0 ? 3 : pct <= .01 ? 2 : pct <= .03 ? 1 : 0;
  saveBest(sceneKey, stars);
  achieve("FIRST_SHOW");
  if (stars === 3) achieve("PERFECT_" + sceneKey.toUpperCase());
  const best = loadBest();
  if (Object.keys(SCENES).every(k => (best[k] ?? 0) >= 1)) achieve("ALL_SCENES");
  if (Object.keys(SCENES).every(k => best[k] === 3)) achieve("ALL_STARS");
  if (dead >= 500) achieve("TRAGEDY");
  if (abducted >= 100) achieve("SPACE_TOURISM");
  if (stars === 3 && mega.n === 0) achieve("LOUD_AND_SAFE");
  try { const seen = new Set(JSON.parse(localStorage.getItem("mh.mods") || "[]")); seen.add(MOD.id); localStorage.setItem("mh.mods", JSON.stringify([...seen])); if (seen.size >= 6) achieve("MOD_COLLECTOR"); } catch (e) { /* no storage */ }
  showReport(stars, stuck); ui(); return;
  showCard(`<h2>${stars === 3 ? "Nobody got hurt" : stars ? "Venue evacuated" : "It was a tragedy"}</h2>
    <div class="stars">${[0, 1, 2].map(k => `<span class="${k < stars ? "" : "off"}">★</span>`).join("")}</div>
    <div class="stats">
      <span>Crowd</span><span>${CROWD}</span>
      <span>Made it out OK</span><span>${evacuated}</span>
      <span>Trampled</span><span style="color:var(--danger)">${dead}</span>
      <span>Still trapped</span><span>${stuck}</span>
      <span>Evacuation time</span><span>${Math.round(evacT)} s</span>
    </div>
    <p>${stars === 3 ? "Perfect plan. Try again with fewer fences or fewer gates." : "Check the pressure view: red is where people get squished. Your plan has been saved."}</p>
    <div class="row"><button class="go" id="retry">Adjust the plan</button><button id="pick">Change venue</button></div>`);
  ui();
}
function backToPlan() {
  phase = "plan"; paused = false; slowT = 0; ag = []; fallen = []; movers = []; pops = []; MOD = null; $("#abd").hidden = true; showModChip(null); clearAttractor(); clearAlt(); spawned = 0; t = 0; evacT = 0; surgeT = 0; setDead(0, true); resetFx();
  hideCard(); caption("You plan it", false, 0); resetPreview(); ui();
}

