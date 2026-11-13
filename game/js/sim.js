// Human Tsunami · venue, flow fields, crowd and phases
// an unmanaged crowd: the less the player placed, the wilder people get (UNM 1 = nothing placed at all)
let UNM = 0, LAZY = false;
// how "managed" the crowd feels: barriers and gadgets count, the free guards only a little.
// Below PLAN_NEED the crowd is partly unmanaged (shoves harder, goes down sooner); bigger crowds need more
function planSafety() {
  return fences.reduce((s, f) => s + (f.len || 0), 0) / 12 + guards.filter(g => g.role !== "slow").length * .3 + guards.filter(g => g.role === "slow").length * .5
    + props.reduce((s, p) => s + (PROP_TYPES[p.type] && PROP_TYPES[p.type].gadget ? 1.6 : 1.2), 0) + gates.reduce((s, g) => s + (g === GATE_SIZES.wide.k ? .5 : 0), 0);
}
const PLAN_NEED = () => 4.5 + Math.min(5800, (scene.crowd || 3000) * (isBig() ? BIG_CROWD : 1)) / 1000;
let megaUsed = false, FOAM_K = .7, AID_DMG = .75, AID_HEAL = 1.4;   // whether the megaphone was used this show (for the Hands off medal)
function buildWorld() {
  obs = [];
  // venue edges
  for (const xw of [0, WW]) {   // side walls, with today's emergency exit cut into one of them
    if (ROUTE.side && xw === (ROUTE.side < 0 ? 0 : WW)) { seg(xw, 0, xw, ROUTE.ey0, .2, "edge"); seg(xw, ROUTE.ey1, xw, SH, .2, "edge"); }
    else seg(xw, 0, xw, SH, .2, "edge");
  }
  seg(0, 0, WW, 0, .2, "edge");
  scene.build();
  // entrance fence with gates
  let x = 0;
  for (let i = 0; i < SLOTS; i++) {
    const g0 = Math.max(x, slotX(i) - gateW(i) / 2), g1 = slotX(i) + gateW(i) / 2;
    if (g0 > x + .01) seg(x, FENCE_Y, g0, FENCE_Y, .3, "fence");
    if (!gates[i]) seg(g0, FENCE_Y, g1, FENCE_Y, .3, "closed");
    x = g1;
  }
  seg(x, FENCE_Y, WW, FENCE_Y, .3, "fence");
  for (const f of fences) {
    const type = f.type || "steel", o = seg(f.ax, f.ay, f.bx, f.by, type === "concrete" || type === "foam" ? .5 : type === "cones" ? .3 : .35, "player");
    o.ftype = type; o.fence = f; if (type === "cones") o.soft = true;
  }
  for (const gd of guards) circ(gd.x, gd.y, .35, "guard");
  for (const pr of props) { const o = circ(pr.x, pr.y, PROP_TYPES[pr.type].r, "prop"); o.ptype = pr.type; if (pr.type === "bouncy") o.ftype = "foam"; }
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
  if (ROUTE.side) {   // the way out is the side exit, not the gates people came in through
    const col = ROUTE.side < 0 ? 0 : GW - 1;
    fExit = dijkstra(id => { if (blockedC[id] || id % GW !== col) return false; const py = ((id / GW) | 0) * CS + CS / 2; return py > ROUTE.ey0 + .3 && py < ROUTE.ey1 - .3; });
  } else fExit = dijkstra(id => !blockedC[id] && ((id / GW) | 0) >= GH - 2);
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
let abducted = 0, slipT = 0, MOD = null, eventLog = new Set(), mega = { n: 3, active: [] }; megaUsed = false;
// shopping: people pop into the venue shops and come back out buried in bags
let SHOW_LUCKY = false, insured = 0;
let SHOPPERS = [], SHOP_DOORS = [], shopT = 0;
const SHOP_CRIES = ["SALE!!", "I REGRET NOTHING", "BAGS!", "ONE MORE STORE", "MY CREDIT CARD!", "IT WAS 90% OFF", "WORTH IT"];
let ag = [], fallen = [], phase = "plan", spawned = 0, fullAt = 0, t = 0, evacT = 0, dead = 0, evacuated = 0;
let hashHead = new Int32Array(GW * GH), hashNext = new Int32Array(0);

const VENUE_OUTFITS = {
  plaza: ["tourist", "superhero", "wizard", "clown"], circo: ["clown", "clown", "king", "wizard"], estadio: ["fan", "fan", "fan", "viking"],
  viernes: ["tourist", "hotdog", "superhero"], crucero: ["sailor", "pirate", "pirate", "swimmer", "tourist"], boda: ["tux", "tux", "king"],
  hipodromo: ["cowboy", "cowboy", "tux"], trono: ["king", "knight", "tux"], ciudad: ["superhero", "chef", "hotdog", "wizard"],
  mitin: ["duck", "duck", "tux"], taco: ["chef", "luchador", "hotdog"], ovni: ["astronaut", "astronaut", "wizard"],
  aeropuerto: ["tourist", "tourist", "astronaut"], arena: ["luchador", "luchador", "luchador", "king"], rocket: ["astronaut", "astronaut", "superhero"],
  zoo: ["banana", "tourist", "cowboy"], cheese: ["chef", "cowboy", "knight"], zombie: ["zombie", "zombie", "ghost", "wizard"],
  beach: ["swimmer", "swimmer", "pirate", "sailor"], park: ["clown", "superhero", "banana", "wizard"], nuclear: ["hazmat", "hazmat", "astronaut"],
  guerra: ["soldier", "soldier", "knight", "viking"],
  fabrica: ["hazmat", "chef", "tourist"], procesion: ["tux", "tourist", "king"], marcha: ["superhero", "clown", "duck", "tourist"],
  metro: ["tux", "tourist", "astronaut"], mercado: ["chef", "banana", "hotdog", "cowboy"], laboratorio: ["hazmat", "astronaut", "zombie", "wizard"],
};
const WACKY = ["hotdog", "banana", "astronaut", "knight", "wizard", "viking", "duck", "ghost", "pirate", "superhero", "clown"];
function looks() {
  const r = Math.random();
  const L = { m: r < .3 ? 0 : r < .5 ? 1 : r < .68 ? 2 : r < .84 ? 3 : 4, sc: Math.random() < .05 ? .72 : .88 + Math.random() * .2,
    sk: (Math.random() * 5) | 0, pc: (Math.random() * 6) | 0, hc: (Math.random() * 6) | 0, ac: (Math.random() * SHIRTS.length) | 0, st: (Math.random() * 3) | 0, wp: Math.random() * 6,
    c: (Math.random() * SHIRTS.length) | 0 };
  // today's twists: Children's Day (everyone tiny) and mandatory uniform (everyone identical)
  // accessories: 1 balloon, 2 party hat, 3 umbrella, 4 kid on the shoulders, 5 wide sun hat
  const r2 = Math.random();
  L.acc = r2 < .04 ? 1 : r2 < .09 ? 2 : r2 < .12 ? 3 : r2 < .15 ? 4 : r2 < .2 ? 5 : r2 < .225 ? 6 : r2 < .25 ? 7 : 0;   // not too many balloons and signs, or nobody sees the faces
  // build, gait, hair style and clothes (0 long, 1 short sleeves, 2 shorts, 3 both)
  const r3 = Math.random(), r4 = Math.random(), r5 = Math.random();
  L.bw = .82 + Math.random() * .5; L.ws = r3 < .45 ? 0 : r3 < .58 ? 1 : r3 < .7 ? 2 : r3 < .82 ? 3 : r3 < .92 ? 4 : 5;
  L.hs = r4 < .5 ? 0 : r4 < .64 ? 1 : r4 < .78 ? 2 : r4 < .92 ? 3 : 4; L.cl = r5 < .4 ? 0 : r5 < .7 ? 1 : r5 < .85 ? 2 : 3;
  // body types: kids, tall people, big round people, grandparents, and fans in full costume (bear, dino, chicken)
  const rt = Math.random();
  if (rt < .08) { L.sc = .56 + Math.random() * .1; L.bw = .85; L.ws = Math.random() < .6 ? 1 : 2; L.v0m = 1.12; L.m = L.m === 3 ? 0 : L.m; if (Math.random() < .25) L.acc = 1; L.kid = 1; }
  else if (rt < .14) { L.sc = 1.15 + Math.random() * .12; L.bw = .76 + Math.random() * .12; L.tall = 1; }
  else if (rt < .22) { L.sc = 1 + Math.random() * .08; L.bw = 1.45 + Math.random() * .25; L.ws = 4; L.v0m = .9; }
  else if (rt < .27) { L.sc = .86 + Math.random() * .08; L.ws = 5; L.v0m = .78; L.old = 1; L.hs = Math.random() < .4 ? 4 : 0; L.m = L.m === 4 ? 0 : L.m; if (Math.random() < .35) L.acc = 5; }
  else if (rt < .31) { L.cos = 1 + ((Math.random() * 3) | 0); L.sc = 1 + Math.random() * .12; L.bw = 1.15; L.m = 0; L.hs = 4; L.acc = 0; L.cl = 0; }
  // dressed for the occasion: about a quarter wear the venue's outfits, and a few weirdos show up anywhere
  const th = VENUE_OUTFITS[sceneKey], ro = Math.random();
  if (!L.cos && typeof OUTFIT_ID !== "undefined" && !(MOD && MOD.uniform)) {
    const name = th && ro < .26 ? th[(Math.random() * th.length) | 0] : ro > .94 ? WACKY[(Math.random() * WACKY.length) | 0] : null;
    if (name && OUTFIT_ID[name]) {
      L.cos = OUTFIT_ID[name]; L.cl = 0; L.m = 0;
      if (!["zombie", "tourist", "superhero", "swimmer", "fan", "ghost", "banana", "hotdog", "duck", "luchador"].includes(name)) L.hs = 4;   // hats and helmets sit on a bald head
      if (name === "tourist") L.acc = 5; else if (L.acc === 1 || L.acc === 3 || L.acc === 5 || L.acc === 4) L.acc = 0;
      if (name === "zombie" || name === "ghost") L.v0m = .85;
    }
  }
  L.springy = Math.random() < .12;
  if (GEAR_ON.length && !(typeof window !== "undefined" && window.__manual)) for (const k of GEAR_ON) if (!L.gear && Math.random() < .2) L.gear = k;
  if (L.gear === "helmet" || L.gear === "pockets") L.v0m = (L.v0m || 1) * .9;
  if (L.gear === "bubble") L.springy = true;
  if (MOD && MOD.rain && Math.random() < .45) L.acc = 3;
  if (MOD && MOD.sizeMul) L.sc *= MOD.sizeMul;
  if (scene && scene.look) scene.look(L);
  if (MOD && MOD.look && !(MOD.uniform)) MOD.look(L);   // twists that dress or change everyone   // venue-specific touches (protest signs, metro backpacks)
  if (MOD && MOD.uniform) { L.c = L.ac = MOD.uc || 0; L.pc = 0; L.cos = 0; }
  return L;
}
function spawn() {
  const x = .6 + Math.random() * (WW - 1.2), y = WH + .6 + Math.random() * (SH - WH - 1.2);
  for (let i = Math.max(0, ag.length - 400); i < ag.length; i++) { const a = ag[i]; if ((a.x - x) ** 2 + (a.y - y) ** 2 < .4) return; }
  const e = Math.random();
  ag.push({ x, y, vx: 0, vy: -.5, h: -Math.PI / 2, v0: (1.35 + Math.random() * .5) * (MOD && MOD.speed || 1), alt: Math.random() < altShare(), fol: Math.random(), lift: 0, beam: false, tol: .8 + e * e * 26,
    leave: Math.random() * 16, ph: Math.random() * 6.28, dance: false, p: 0, ...looks(), ps: 0, dmg: 0, fx: 0, fy: 0 });
  { const a = ag[ag.length - 1]; if (a.v0m) a.v0 *= a.v0m; }   // kids run, grandparents stroll
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
  const medics = props.filter(p => p.type === "medic"), stewards = guards.filter(g => g.role === "slow");
  const evac = phase === "evac"; if (evac) evacT += DT;
  if (phase === "show") {
    for (let k = 0; k < 30 && spawned < CROWD; k++) spawn();
    if (spawned >= CROWD) {
      if (!fullAt) { fullAt = t; nextDrop = t + 6; drops = 0; caption("The show begins", false, 2200); burst(140); }
      if (ROUTE.b && fullAt && !ROUTE.done && t > fullAt + SHOW_TIME * .45) {   // the band jumps to the B-stage and the crowd follows
        ROUTE.done = true; tempAttract(ROUTE.bx, ROUTE.by, 3.2, SHOW_TIME * .55 + 1, .85); caption("Surprise! The band moves to the B-stage", true, 2600); pop(ROUTE.bx, ROUTE.by - 1.5, "B-STAGE!"); sfx("cheer");
      }
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
  const out = []; let pmax = 0;
  for (const a of ag) {
    const leaving = evac && evacT > a.leave;
    if (windF.t > 0) a.fx += windF.x * 2.2 * Math.min(1, windF.t);
    const useAtt = !leaving && attF && a.fol < attShare, useAlt = !useAtt && !leaving && a.alt && altF;
    const id = cellOf(a.x, a.y), f = leaving ? fExit : useAtt ? attF : useAlt ? altF : fStage, dir = leaving ? dirE : useAtt ? attDir : useAlt ? altDir : dirS;
    const surging = surgeT > 0 && !evac;
    let want = leaving ? a.v0 * (1.25 + .45 * UNM) : surging ? (f[id] > a.tol * SURGE[0] ? a.v0 * SURGE[1] * (1 + .5 * UNM) : 0) : (f[id] > a.tol * (1 - .6 * UNM) ? a.v0 * (1 + .3 * UNM) : 0);   // nobody in charge: everyone pushes
    // people who already made it dance and never stop moving
    a.dance = phase === "show" && !leaving && fullAt > 0 && f[id] <= a.tol + 1;
    if (a.dance) { a.fx += Math.cos(t * 5.5 + a.ph) * .9; a.fy += Math.sin(t * 4.3 + a.ph * 1.7) * .9; a.h += Math.sin(t * 2.7 + a.ph) * .04; }
    let dx = dir[id * 2], dy = dir[id * 2 + 1];
    if (leaving && ROUTE.side && a.y > ROUTE.ey0 && a.y < ROUTE.ey1 && (ROUTE.side < 0 ? a.x < 1.6 : a.x > WW - 1.6)) { const yc = (ROUTE.ey0 + ROUTE.ey1) / 2; dx = ROUTE.side; dy = clamp((yc - a.y) * .35, -.8, .8); const l = Math.hypot(dx, dy); dx /= l; dy /= l; }   // at the side exit: out, away from the corners
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
    if (a.shop >= 0 && !leaving && !surging) {   // off to the shops
      const d = SHOP_DOORS[a.shop], ex = d[0] - a.x, ey = d[1] - a.y, dl = Math.hypot(ex, ey);
      if (dl < .75) { a.shopOut = t + 2 + Math.random() * 4; a.vx = a.vy = 0; SHOPPERS.push(a); continue; }
      dx = ex / dl; dy = ey / dl; want = a.v0 * .95;
    } else if (a.shop >= 0 && (leaving || surging)) a.shop = -1;
    if (a.shop >= 0 && t - a.shopGo > 14) a.shop = -1;   // gave up, the queue was too long
    // a UFO beam lifts people up
    if (a.beam) a.lift += DT * .75; else if (a.lift > 0) a.lift = Math.max(0, a.lift - DT * 1.5);
    for (const sw of stewards) if ((a.x - sw.x) ** 2 + (a.y - sw.y) ** 2 < STEWARD_R * STEWARD_R) { want *= .5; break; }
    if (freezeT > 0) { want = 0; a.vx *= .85; a.vy *= .85; a.p *= .6; }   // the pause remote
    if (a.sit > t) { want = 0; a.vx *= .9; a.vy *= .9; }   // sitting on the floor (sit-ins)
    if (a.tb && a.tb.st > 0) want *= .45;   // stumbling (twobody.js): busy not falling over
    if (a.gear) {   // crowd gear from the shop: every piece helps and hurts
      const gr = a.gear;
      if (leaving && (gr === "skates" || gr === "cape")) want *= gr === "skates" ? 1.3 : 1.2;
      if (surging && gr === "cape") want *= 1.15;
      if (gr === "ducks" && a.y > FENCE_Y - 3) want *= .8;
      if (gr === "skates" && Math.random() < .0015 && toss(a, 1.1, .7) && !demo && Math.random() < .3) pop(a.x, a.y - 1, "WIPEOUT!");
      if (gr === "propeller" && (a.ps > PCRIT * .75 ? Math.random() < .01 : Math.random() < .0004) && a.air <= 0) { toss(a, 2.6, 1.5); if (!demo && Math.random() < .4) pop(a.x, a.y - 1.2, "WHIRRRR!"); }
      if (gr === "glasses" && Math.random() < .02) { a.fx += (Math.random() - .5) * 6; a.fy += (Math.random() - .5) * 6; }
    }
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
    let soft = false;
    for (const oi of bk) {
      const o = obs[oi], [nx, ny, d] = contact(o, a.x, a.y);
      if (d >= R) continue;
      if (o.soft && a.p > 2.2) continue;   // cones: squeezed people simply step over them
      const ov = R - d; a.x += nx * ov; a.y += ny * ov;
      const vn = a.vx * nx + a.vy * ny; if (vn < 0) { a.vx -= vn * nx; a.vy -= vn * ny; }
      const ft = o.ftype;
      a.p += ov / R * (ft === "concrete" ? 2.2 : ft === "foam" ? .35 : ft === "cones" ? .5 : 1.5);
      if (ft === "foam") soft = true;
      if (ft === "rope" && a.p > PCRIT * .4) o.fence.strain = (o.fence.strain || 0) + (a.p - PCRIT * .4) * DT;
    }
    if (soft) a.p *= FOAM_K;   // foam padding soaks up the squeeze
    if (leaving && ROUTE.side && a.y > ROUTE.ey0 && a.y < ROUTE.ey1) a.x = clamp(a.x, -3, WW + 3); else a.x = clamp(a.x, R, WW - R);
    if (!evac) a.y = Math.min(a.y, SH - R);
    a.ps += (a.p - a.ps) * .1; if (a.ps > pmax) pmax = a.ps;
    if (a.air > 0) { a.air -= DT; if (a.air <= 0 && a.yeet) {   // crash landing from orbit
      a.yeet = 0; shake = Math.min(1.2, shake + .25); debris(a.x, a.y, .2, 10, 3.5); shockwave(a.x, a.y); for (let k = 0; k < 6; k++) puff(a.x + (Math.random() - .5), a.y + (Math.random() - .5), .15, scene.night ? "#6a6870" : "#e6dcc4", .3, .9, .4);
      if (!demo && Math.random() < .6) pop(a.x, a.y - 1, ["OOF!", "CRUNCH!", "I'M OK!", "10/10 LANDING", "SPLAT!"][(Math.random() * 5) | 0]);
      for (const b of ag) if (b !== a && (b.x - a.x) ** 2 + (b.y - a.y) ** 2 < 1.2) { b.vx += (b.x - a.x) * 3; b.vy += (b.y - a.y) * 3; toss(b, .8, .6); }   // knocks the neighbours over
    } }
    const pc = PCRIT * (MOD && MOD.pcritMul || 1) * (1 - .3 * UNM) * (bm("probe") ? 1.2 : 1);
    // first aid tents: people nearby get patched up, so squeezes hurt half as much and heal faster
    let aid = false; if (medics.length) for (const md of medics) if ((a.x - md.x) ** 2 + (a.y - md.y) ** 2 < 36) { aid = true; break; }
    if (a.gear === "ducks") a.p *= .8;
    if (a.p > pc) a.dmg += (a.p - pc) * DT * (aid ? AID_DMG : 1.6) * (a.gear === "helmet" ? .75 : a.gear === "bubble" ? .7 : 1); else a.dmg = Math.max(0, a.dmg - DT * (aid ? AID_HEAL : .4));
    if (a.dmg >= 1 && bm("insurance") && insured < 20 && !demo) { insured++; abducted++; for (let k = 0; k < 4; k++) puff(a.x, a.y, 1 + k, "#7dff6a", .4, .8, 1.5); if (Math.random() < .5) pop(a.x, a.y - 1, "BEAMED UP!"); continue; }   // mothership insurance
    if (a.dmg >= 1) { a.fallAt = t; a.fallSpin = (Math.random() - .5) * 2.4; a.fallLimb = Math.random() * 6.28; pickFall(a); fallen.push(a); if (!demo) lastFalls.push([a.x, a.y, evac ? 1 : 0]); onFall(a.x, a.y); setDead(dead + 1); continue; }
    if (evac && (a.y > SH - .6 || a.x < -.4 || a.x > WW + .4 || (ROUTE.side && leaving && a.y > ROUTE.ey0 - .6 && a.y < ROUTE.ey1 + .6 && (ROUTE.side < 0 ? a.x < .55 : a.x > WW - .55)))) { evacuated++; continue; }
    out.push(a);
  }
  ag = out;
  TwoBody.update(ag, DT);   // torsos on elastic joints, stumbles and domino chains (twobody.js)
  if (SHOP_DOORS.length && !demo && phase === "show") shopStep();
  if (props.length) gadgetStep();
  if (!demo && spawned > 150) crowdShouts();
  if (yeetT > 0) yeetT -= DT;
  if (freezeT > 0) freezeT -= DT;
  if (scene.step && !demo) scene.step();
  if (MOD && MOD.step && !demo) MOD.step();   // venue mechanics (reactor heat, land mines)
  if (surgeT > 0 && !demo && ag.length && Math.random() < .25) { const a = ag[(Math.random() * ag.length) | 0]; if (a.dance && toss(a, .9 + Math.random() * .9) && Math.random() < .3) pop(a.x, a.y - 1, ["WHEEE!", "YEET!", "WOOO!"][(Math.random() * 3) | 0]); }
  // a calm evacuation is boring to watch: after 2 s with nobody squeezed the clock runs fast
  calmT = evac && pmax < PCRIT * .4 ? calmT + DT : 0;
  // velvet ropes snap when the crowd leans on them too hard
  let snapped = false;
  for (const f of fences) {
    if (f.type !== "rope") continue;
    f.strain = (f.strain || 0) * .985;
    if (f.strain > 14) { f.broken = true; snapped = true; const mx = (f.ax + f.bx) / 2, my = (f.ay + f.by) / 2; pop(mx, my, "SNAP!"); burstAt(mx, my, 20); eventLog.add("ropesnap"); }
  }
  if (snapped) { fences = fences.filter(f => !f.broken); buildWorld(); }
  if (evac && (ag.length === 0 || evacT > 100)) finish();
}

// ===== Steam: achievements and records =====
// window.steam is set by the desktop app (desktop/preload.js); without Steam, this does nothing
const achieve = id => { try { window.steam && window.steam.achieve(id); } catch (e) { /* no Steam */ } };
let sceneKey = "plaza";
// medals: four optional challenges per venue
const MEDALS = {
  budget:   { icon: "$", name: "On a budget", desc: "At most 5 pancaked spending $200 or less" },
  handsoff: { icon: "✋", name: "Hands off", desc: "Zero pancaked without guards or the megaphone" },
  chaos:    { icon: "🌀", name: "Chaos survivor", desc: "Under 1% pancaked in Total Chaos mode" },
  disaster: { icon: "☠", name: "Catastrophe", desc: "500 or more pancaked. On purpose, we assume." },
  architect: { icon: "▲", name: "Architect", desc: "At most 5 pancaked without opening a single extra gate: fences and stewards only" },
};
function loadJSON(key, def) { try { return JSON.parse(localStorage.getItem(key) || "null") || def; } catch (e) { return def; } }
function saveJSON(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* no storage */ } }
const loadMedals = () => loadJSON("mh.medals", {});
const loadStats = () => loadJSON("mh.stats", { shows: 0, trampled: 0, abducted: 0, saved: 0, perfect: 0, worst: 0 });
// returns the medals earned in this show that the player didn't have yet
function awardMedals(stars, stuck, megaUsed) {
  const got = [], spent = typeof fenceUsed === "function" ? fenceUsed() : 0, pct = (dead + stuck) / CROWD;
  if (dead + stuck <= 5 && spent <= 200) got.push("budget");
  if (stars === 3 && guards.length === 0 && !megaUsed) got.push("handsoff");
  if (chaosMode && pct < .01) got.push("chaos");
  if (dead >= 500) got.push("disaster");
  if (dead + stuck <= 5 && gates.every((g, i) => g === scene.gates[i])) got.push("architect");
  const all = loadMedals(), mine = all[sceneKey] || [], fresh = got.filter(m => !mine.includes(m));
  if (fresh.length) { all[sceneKey] = mine.concat(fresh); saveJSON("mh.medals", all); }
  return fresh;
}
function loadBest() { try { return JSON.parse(localStorage.getItem("mh.best") || "{}"); } catch (e) { return {}; } }
const totalStars = () => Object.values(loadBest()).reduce((s, v) => s + v, 0);
const isUnlocked = key => !!window.__unlockAll || sandbox || totalStars() >= (SCENES[key].unlock || 0);
function saveBest(key, stars) {
  const best = loadBest(); if ((best[key] ?? -1) >= stars) return;
  best[key] = stars; try { localStorage.setItem("mh.best", JSON.stringify(best)); } catch (e) { /* no storage */ }
}

// ===== Phases =====
// today's route: classic, side exit, B-stage or both; each part is only used if it really works in this venue
function pickRoute() {
  ROUTE = { side: 0, ey0: 0, ey1: 0, b: false, bx: 0, by: 0, done: false };
  const r = Math.random(), wantSide = r < .35 || r >= .75, wantB = r >= .55;
  if (wantSide) for (let tries = 0; tries < 10; tries++) {
    const side = Math.random() < .5 ? -1 : 1, yc = 16 + Math.random() * (FENCE_Y - 30);
    ROUTE.side = side; ROUTE.ey0 = yc - 5.5; ROUTE.ey1 = yc + 5.5; buildWorld();
    const col = side < 0 ? 0 : GW - 1; let free = 0;
    for (let y = ROUTE.ey0 + .5; y < ROUTE.ey1 - .5; y += CS) if (!blockedC[cellOf(col * CS + CS / 2, y)]) free++;
    let reach = true; for (let i = 0; i < SLOTS; i++) if (gates[i] && !isFinite(fExit[cellOf(slotX(i), FENCE_Y - 1.2)])) reach = false;
    let fromStage = false; for (let id = 0; id < GW * GH && !fromStage; id++) if (fStage[id] === 0 && isFinite(fExit[id])) fromStage = true;
    if (free >= 15 && reach && fromStage) break;
    ROUTE.side = 0; buildWorld();
  }
  if (wantB) for (let tries = 0; tries < 40; tries++) {
    const x = 6 + Math.random() * (WW - 12), y = FENCE_Y * .45 + Math.random() * (FENCE_Y * .55 - 14);
    let ok = isFinite(fStage[cellOf(x, y)]) && fStage[cellOf(x, y)] > 6;
    for (let a = 0; a < 6.28 && ok; a += .8) if (blockedC[cellOf(x + Math.cos(a) * 2.6, y + Math.sin(a) * 2.6)]) ok = false;
    if (ok) { ROUTE.b = true; ROUTE.bx = x; ROUTE.by = y; break; }
  }
  buildWorld();
}
// a fresh uneven layout: seven gates with random gaps between them (never overlapping)
function slotLayout() {
  const min = SLOT_W + 1.2, lo = SLOT_W / 2 + .5, hi = WW - SLOT_W / 2 - .5, slack = hi - lo - (SLOTS - 1) * min;
  const w = Array.from({ length: SLOTS + 1 }, () => Math.pow(Math.random(), 1.6) + .05), sum = w.reduce((s, v) => s + v, 0);
  const xs = []; let x = lo + slack * w[0] / sum;
  for (let i = 0; i < SLOTS; i++) { if (i) x += min + slack * w[i] / sum; xs.push(x); }
  return xs;
}
// a gate works if nothing of the venue stands right behind or in front of it and the stage can be reached from it
function slotOK(i) {
  const x = slotX(i), yin = FENCE_Y - 1.2, yout = FENCE_Y + 1.2;
  for (const dx of [-.8, 0, .8]) if (blockedC[cellOf(x + dx, yin)] || blockedC[cellOf(x + dx, yout)]) return false;
  return isFinite(fStage[cellOf(x, yin)]);
}
// moves the entrances: new positions, and the venue's usual number of open gates picked among the ones that work
function shuffleSlots() {
  const want = scene.gates.filter(Boolean).length, need = Math.max(want, Math.min(SLOTS, scene.maxGates || want));
  for (let tries = 0; tries < 12; tries++) {
    SLOT_XS = slotLayout(); SLOT_BAD = []; gates = Array(SLOTS).fill(false); buildWorld();
    const ok = [...Array(SLOTS).keys()].filter(slotOK);
    if (ok.length < need) continue;
    SLOT_BAD = [...Array(SLOTS).keys()].filter(i => !ok.includes(i));
    const pick = ok.slice().sort(() => Math.random() - .5).slice(0, want);
    gates = gates.map((_, i) => pick.includes(i)); buildWorld(); return true;
  }
  SLOT_XS = null; SLOT_BAD = []; gates = scene.gates.slice(); buildWorld(); return false;
}
// chaos: throw someone into the air (they somersault and land on their feet, unhurt)
// springy people (about 1 in 8) don't just stumble when something hits them: they leave the atmosphere
const YEET_CRIES = ["AAAAAAAAH!", "WHEEEEEEEE!", "TO INFINITY!", "I CAN FLY!", "YEEEEET!", "TELL MY MOM...", "NOT AGAAAIN!", "BYEEEEE!"];
let yeetT = 0;
function yeet(a, dx, dy) {
  if (a.air > 0 || a.lift > 0 || yeetT > 0) return false;
  yeetT = .2;
  a.airD = a.air = 1.7 + Math.random() * 1.1; a.airH = 6 + Math.random() * 7; a.yeet = 1;
  a.airSpin = (Math.random() < .5 ? -1 : 1) * (2 + Math.random() * 3); a.airYaw = (Math.random() - .5) * 16;
  if (dx !== undefined) { const l = Math.hypot(dx, dy) || 1; a.vx = dx / l * 2.6; a.vy = dy / l * 2.6; }
  if (!demo && ++SEC.yeets >= 20) unlockSecret("ORBIT");
  if (!demo) { pop(a.x, a.y - 1.4, YEET_CRIES[(Math.random() * YEET_CRIES.length) | 0]); sfx("fiu"); }
  return true;
}
function toss(a, h, d) {
  if (a.air > 0 || a.lift > 0) return false;
  a.airD = a.air = d || .75 + Math.random() * .4; a.airH = h || 1.2 + Math.random() * 1.2;
  a.airSpin = Math.random() < .5 ? -1 : 1; a.airYaw = (Math.random() - .5) * 4; return true;
}
function canStart() {
  for (let i = 0; i < SLOTS; i++) if (gates[i] && !isFinite(fStage[cellOf(slotX(i), FENCE_Y + 1.5)])) {
    toast("A fence leaves a gate with no path to the stage. Clear the way."); return false;
  }
  return true;
}
// the button goes through the today's-twist roulette; tests call start() directly
// share of the crowd that heads for the alternative goal (a twist like free wifi, or the player's big screen)
const altShare = () => (MOD && MOD.altShare) || (scene && scene.altShare) || (props.some(p => p.type === "screen") ? .25 : 0);
let planFences = null;
// where people fell in the last show of this venue: shown on the plan and explained in the paper
let lastFalls = [], lastFallsScene = "", calmT = 0;
// one sentence telling the player where it went wrong
// rag-doll styles: 0 backflop, 1 faceplant, 2 spinning top, 3 launched by the crowd, 4 pancake then plank
function pickFall(a) {
  const forced = a.forceFall, r = Math.random(); a.forceFall = undefined;   // powers (anvil, meteor) pick the fall
  if (!demo) setTimeout(() => { if (a.fallType === 5 && ++SEC.pinball >= 50) unlockSecret("TILT"); }, 0);
  a.fallType = forced !== undefined ? forced : r < .14 ? 0 : r < .27 ? 1 : r < .38 ? 2 : r < .5 ? 3 : r < .6 ? 4 : r < .7 ? 5 : r < .8 ? 6 : r < .9 ? 7 : 8;
  a.fx0 = a.x; a.fy0 = a.y;
  if (a.fallType === 3 || a.fallType === 5 || a.fallType === 8) {   // thrown along the push (or anywhere), but only onto free floor
    const sp = Math.hypot(a.vx, a.vy), an = sp > .2 ? Math.atan2(a.vy, a.vx) + (Math.random() - .5) * .8 : Math.random() * 6.283;
    for (const d of a.fallType === 3 ? [2.2, 1.5, .9] : [3.4, 2.4, 1.5, .9]) {
      const x = a.x + Math.cos(an) * d, y = a.y + Math.sin(an) * d;
      if (x > R && x < WW - R && y > R && y < SH - R && !blockedC[cellOf(x, y)]) { a.x = x; a.y = y; a.h = an; return; }
    }
    a.fallType = 0;
  }
}
function fallTip() {
  if (LAZY) return "You opened the gates without placing a single fence, guard or prop. An event with nothing in it gets zero stars, always. Draw barriers in front of the stage, put stewards by the exits, add water or first aid.";
  if (!lastFalls.length) return "";
  const evacN = lastFalls.filter(f => f[2]).length, nearGates = lastFalls.filter(f => f[1] > FENCE_Y - 6).length;
  let gi = 0, gb = -1; for (let i = 0; i < SLOTS; i++) { if (!gates[i]) continue; const n = lastFalls.filter(f => Math.abs(f[0] - slotX(i)) < SLOT_W * 1.6 && f[1] > FENCE_Y - 8).length; if (n > gb) { gb = n; gi = i; } }
  const when = evacN > lastFalls.length * .6 ? "on the way out" : evacN < lastFalls.length * .3 ? "during the show" : "both during the show and on the way out";
  const where = nearGates > lastFalls.length * .5 ? `right at one of the open gates` : "in the middle of the crowd";
  const fix = nearGates > lastFalls.length * .5 ? "Open more gates, spread them apart, or slow people down there with stewards and wave breakers."
    : "Give the crowd room: break up the push toward the stage with short fences, guards or a big screen elsewhere.";
  return `Most got pancaked ${where}, ${when}. ${fix} The red marks on the plan show exactly where.`;
}   // the plan as drawn, so fences broken during a show come back afterwards
function start(mod) {
  planFences = fences.map(f => ({ ax: f.ax, ay: f.ay, bx: f.bx, by: f.by, len: f.len, type: f.type }));
  if (!demo) { lastFalls = []; lastFallsScene = sceneKey; }
  if (!canStart()) return;
  MOD = mod || MODS_BY_ID.normal; CROWD = Math.min(5800, Math.round(scene.crowd * (isBig() && !demo ? BIG_CROWD : 1) * (MOD.crowdMul || 1) * (sandbox && !demo ? sandCrowd : 1)));
  clearAttractor(); clearAlt(); abducted = 0; slipT = 0; timers = []; attrT = 0; eventLog = new Set(); mega = { n: 3 + upg("battery"), active: [] }; megaUsed = false;
  LAZY = !demo && !sandbox && fences.length === 0 && guards.length === 0 && props.length === 0;
  UNM = demo || sandbox ? 0 : clamp(1 - planSafety() / PLAN_NEED(), 0, 1);
  ROUTE.done = false;
  FOAM_K = .7 - .1 * upg("foam"); AID_DMG = .75 - .15 * upg("medic"); AID_HEAL = 1.4 + .4 * upg("medic");
  phase = "show"; t = 0; spawned = 0; fullAt = 0; surgeT = 0; ag = []; fallen = []; movers = []; pops = []; eventT = 7; ambientT = 5; windF = { x: 0, t: 0 }; ola = null; rockets = []; sparks = []; puffs = []; cheerT = 0; evacuated = 0; evacT = 0; calmT = 0; setDead(0, true); resetFx();
  caption("The gates are open!", false, 2200); ui();
  if (!demo) { VOICE.ann = Math.random() < .5 ? "male" : "female"; announce("go"); }
  if (MOD.uniform) MOD.uc = (Math.random() * SHIRTS.length) | 0;
  if (MOD.start) MOD.start();
  const scr = props.find(p => p.type === "screen");
  if (scr && !MOD.altShare) setAlt(scr.x, scr.y, PROP_TYPES.screen.r + 2.2);
  if (scene.onStart) scene.onStart();
  TwoBody.init(WW, WH); TwoBody.onStumble = (a, depth) => { if (a.springy && !depth && Math.random() < .35 && yeet(a)) return; if (!demo && Math.random() < (depth ? .02 : .06)) pop(a.x, a.y - 1.1, depth ? ["DOMINO!", "NOT ME TOO!", "WHOA-OA!"][(Math.random() * 3) | 0] : ["WHOA!", "OOPS!", "WATCH IT!", "MY BALANCE!"][(Math.random() * 4) | 0]); };
  SHOPPERS = []; shopT = 0; shoutT = 3; insured = 0; resetPowers(); resetSecretCounters(); CRATERS = []; POWER_USED = false; SHOW_LUCKY = false;
  if (!demo && !window.__manual && (NEXT.meteor || NEXT.cow || NEXT.mega || NEXT.lucky)) {   // the deals bought for this show
    charges.meteor += NEXT.meteor || 0; charges.cow += NEXT.cow || 0; mega.n += NEXT.mega || 0; SHOW_LUCKY = !!NEXT.lucky;
    delete NEXT.meteor; delete NEXT.cow; delete NEXT.mega; delete NEXT.lucky; saveShop();
  } SHOP_DOORS = scene.shopDoors ? scene.shopDoors() : [];
  G3.photo = null;
}
function startEvac() { for (const a of SHOPPERS) shopOut(a); SHOPPERS = []; if (!demo) announce("time_over"); phase = "evac"; evacT = 0; surgeT = 0; clearAttractor(); clearAlt(); if (!G3.photo) G3.wantPhoto = true; sfx("siren"); caption("Show's over. Everybody out!", false, 2600); ui(); }
function finish() {
  if (demo) { startDemo(); return; }
  phase = "done";
  const stuck = ag.length, pct = (dead + stuck) / CROWD;
  // nothing placed at all = no stars, whatever happened: you have to plan something
  const stars = LAZY ? 0 : dead === 0 && stuck === 0 ? 3 : pct <= .015 ? 2 : pct <= .05 ? 1 : 0;
  LAST_EARN = 0;
  if (sandbox) { showReport(stars, stuck, []); ui(); return; }   // sandbox: nothing is saved, nothing is earned
  const st = loadStats(); st.shows++; st.trampled += dead; st.abducted += abducted; st.saved += evacuated; if (stars === 3) st.perfect++; st.worst = Math.max(st.worst, dead); saveJSON("mh.stats", st);
  const fresh = awardMedals(stars, stuck, megaUsed);
  // tickets for the shop: something for showing up, more for everyone who got home, stars and new medals
  LAST_EARN = Math.round((10 + Math.floor(evacuated / 60) + stars * 20 + fresh.length * 30) * (gearOn("glasses") ? 1.2 : 1) * (SHOW_LUCKY ? 1.5 : 1)); loadShop(); TIX += LAST_EARN; saveShop();
  setTimeout(() => announce(dead >= 500 ? "game_over" : stars === 3 ? (Math.random() < .5 ? "mission_completed" : "congratulations") : stars ? "objective_achieved" : "mission_failed"), 700);
  if (fresh.length) setTimeout(() => announce("new_highscore"), 2300);
  if (Object.values(loadMedals()).reduce((n, m) => n + m.length, 0) >= 20) achieve("MEDAL_COLLECTOR");
  saveBest(sceneKey, stars);
  achieve("FIRST_SHOW");
  if (stars === 3) achieve("PERFECT_" + sceneKey.toUpperCase());
  const best = loadBest();
  if (Object.keys(SCENES).every(k => (best[k] ?? 0) >= 1)) achieve("ALL_SCENES");
  if (Object.keys(SCENES).every(k => best[k] === 3)) achieve("ALL_STARS");
  if (dead >= 500) achieve("TRAGEDY");
  if (abducted >= 100) achieve("SPACE_TOURISM");
  if (dead === 0 && stuck === 0 && evacT < 12) unlockSecret("SPEEDRUN");
  if (TwoBody.stats.chain >= 60) unlockSecret("DOMINO");
  if (stars === 3 && mega.n === 0) achieve("LOUD_AND_SAFE");
  try { const seen = new Set(JSON.parse(localStorage.getItem("mh.mods") || "[]")); seen.add(MOD.id); localStorage.setItem("mh.mods", JSON.stringify([...seen])); if (seen.size >= 6) achieve("MOD_COLLECTOR"); } catch (e) { /* no storage */ }
  showReport(stars, stuck, fresh); ui(); return;
  showCard(`<h2>${stars === 3 ? "Nobody got hurt" : stars ? "Venue evacuated" : "It was a tragedy"}</h2>
    <div class="stars">${[0, 1, 2].map(k => `<span class="${k < stars ? "" : "off"}">★</span>`).join("")}</div>
    <div class="stats">
      <span>Crowd</span><span>${CROWD}</span>
      <span>Made it out OK</span><span>${evacuated}</span>
      <span>Pancaked</span><span style="color:var(--danger)">${dead}</span>
      <span>Still trapped</span><span>${stuck}</span>
      <span>Evacuation time</span><span>${Math.round(evacT)} s</span>
    </div>
    <p>${stars === 3 ? "Perfect plan. Try again with fewer fences or fewer gates." : "Check the pressure view: red is where people get squished. Your plan has been saved."}</p>
    <div class="row"><button class="go" id="retry">Adjust the plan</button><button id="pick">Change venue</button></div>`);
  ui();
}
function backToPlan() {
  if (planFences && fences.length !== planFences.length) { fences = planFences.map(f => ({ ...f })); buildWorld(); }
  planFences = null;
  phase = "plan"; paused = false; slowT = 0; ag = []; fallen = []; movers = []; pops = []; MOD = null; $("#abd").hidden = true; showModChip(null); clearAttractor(); clearAlt(); spawned = 0; t = 0; evacT = 0; surgeT = 0; setDead(0, true); resetFx();
  hideCard(); caption("You plan it", false, 0); resetPreview(); ui();
}


// a few calm people near a shop door decide they need something right now
function shopStep() {
  shopT -= DT;
  if (shopT <= 0 && ag.length > 40) {
    shopT = (.35 + Math.random() * .5) / (scene.shopRate || 1);
    for (let k = 0; k < 6; k++) {
      const a = ag[(Math.random() * ag.length) | 0];
      if (a.shop >= 0 || (a.bags || 0) > 5 || a.ps > PCRIT * .3 || a.air > 0 || a.lift > 0 || a.acc === 4) continue;
      let best = -1, bd = 14 * 14;
      for (let i = 0; i < SHOP_DOORS.length; i++) { const d = SHOP_DOORS[i], q = (d[0] - a.x) ** 2 + (d[1] - a.y) ** 2; if (q < bd && i !== a.lastShop) { bd = q; best = i; } }
      if (best >= 0) { a.shop = best; a.shopGo = t; break; }
    }
  }
  if (SHOPPERS.length) {
    const keep = [];
    for (const a of SHOPPERS) if (t > a.shopOut) shopOut(a); else keep.push(a);
    SHOPPERS = keep;
  }
}
function shopOut(a) {
  const d = SHOP_DOORS[a.shop] || SHOP_DOORS[0];
  a.x = d[0] + d[2] * .5 + (Math.random() - .5) * .4; a.y = d[1] + d[3] * .5 + (Math.random() - .5) * .4;
  a.vx = d[2] * .8; a.vy = d[3] * .8; a.h = Math.atan2(a.vy, a.vx);
  const was = a.bags || 0; a.bags = Math.min(9, was + 2 + ((Math.random() * 3) | 0)); if (a.bags >= 9) unlockSecret("SHOPAHOLIC"); a.lastShop = a.shop; a.shop = -1;
  a.v0 *= .86; a.bagC = a.bagC || ((Math.random() * 6) | 0);
  ag.push(a);
  if (Math.random() < .3) { pop(a.x, a.y - 1, SHOP_CRIES[(Math.random() * SHOP_CRIES.length) | 0]); }
}

// gadgets from the shop at work
function gadgetStep() {
  for (const pr of props) {
    const k = pr.type; if (!PROP_TYPES[k] || !PROP_TYPES[k].gadget) continue;
    pr.t = (pr.t || 0) - DT;
    if (k === "megatower" && pr.t <= 0 && phase === "show") {   // yells CALM DOWN on its own
      pr.t = 5; mega.active.push({ x: pr.x, y: pr.y, t: 2 }); rings.push({ x: pr.x, y: pr.y, t: 0, mega: true }); if (!demo && Math.random() < .5) pop(pr.x, pr.y - 2, ["CALM DOWN!", "PLEASE BREATHE!", "NO PUSHING!"][(Math.random() * 3) | 0]);
    } else if (k === "pills" && pr.t <= 0) {   // one calming pill at the most squeezed person in range
      pr.t = .9; let best = null, bp = PCRIT * .45;
      for (const a of ag) { if (a.ps <= bp) continue; if ((a.x - pr.x) ** 2 + (a.y - pr.y) ** 2 < 64) { bp = a.ps; best = a; } }
      if (best) { best.p = 0; best.ps *= .3; best.dmg *= .4; for (let q = 0; q <= 1; q += .25) puff(pr.x + (best.x - pr.x) * q, pr.y + (best.y - pr.y) * q, 1.2, "#ff6fb1", .12, .35, 0);
        for (const a of ag) if ((a.x - best.x) ** 2 + (a.y - best.y) ** 2 < 2.5) { a.p *= .4; a.dmg *= .7; }
        if (!demo && Math.random() < .15) pop(best.x, best.y - 1, ["AHHH...", "SO CHILL", "PEW! *RELAXES*", "I LOVE EVERYONE"][(Math.random() * 4) | 0]); }
    } else if (k === "hotdogs" && pr.t <= 0 && phase === "show" && fullAt) {   // free food at the emptiest open spot
      pr.t = 9; let bx = 0, by = 0, bn = 1e9;
      for (let k2 = 0; k2 < 14; k2++) { const [x, y] = crowdPoint(); if (blockedC[cellOf(x, y)] || !isFinite(fStage[cellOf(x, y)])) continue; let n = 0; for (let i = 0; i < ag.length; i += 4) if ((ag[i].x - x) ** 2 + (ag[i].y - y) ** 2 < 16) n++; if (n < bn) { bn = n; bx = x; by = y; } }
      if (bn < 1e9) { tempAttract(bx, by, 2.4, 4, .22); for (let q = 0; q <= 1; q += .2) puff(pr.x + (bx - pr.x) * q, pr.y + (by - pr.y) * q, 1 + Math.sin(q * Math.PI) * 4, "#ff9a3c", .2, .6, 0); burstAt(bx, by, 25); if (!demo) pop(bx, by - 1, "FREE HOT DOGS!"); sfx("boom"); }
    } else if (k === "fan") {   // pushes everyone in front of it toward the gates
      for (const a of ag) { const dx = a.x - pr.x, dy = a.y - pr.y; if (dy > -1 && dy < 7 && Math.abs(dx) < 2.5 + dy * .4) { a.vy += 1.2 * DT; if (Math.random() < .002) puff(a.x, a.y, 1.4, "#ffffff", .15, .4, 0); } }
    } else if (k === "tubeman") {   // hypnotic: people nearby slow down to watch
      for (const a of ag) if ((a.x - pr.x) ** 2 + (a.y - pr.y) ** 2 < 16) { a.vx *= .97; a.vy *= .97; a.p *= .8; }
    } else if (k === "trampoline" && phase === "evac") {   // BOING: straight toward the nearest open gate
      for (const a of ag) { if (a.air > 0 || (a.x - pr.x) ** 2 + (a.y - pr.y) ** 2 > 1.1) continue;
        let gx = WW / 2, gd = 1e9; for (let i = 0; i < SLOTS; i++) if (gates[i] && Math.abs(slotX(i) - a.x) < gd) { gd = Math.abs(slotX(i) - a.x); gx = slotX(i); }
        const dx = gx - a.x, dy = FENCE_Y - 1 - a.y, d = Math.hypot(dx, dy) || 1, jump = Math.min(d - .5, 7);
        a.x += dx / d * jump; a.y += dy / d * jump; toss(a, 3 + Math.random() * 2, 1.1); if (!demo && Math.random() < .2) pop(a.x, a.y - 1, ["BOING!", "WHEEE!", "SEE YA!"][(Math.random() * 3) | 0]); }
    }
  }
}
