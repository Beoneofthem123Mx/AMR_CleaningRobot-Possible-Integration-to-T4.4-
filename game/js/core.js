// Human Tsunami · world, obstacles and utilities
const $ = s => document.querySelector(s);
const cv = $("#cv"), ov = $("#ov"), octx = ov.getContext("2d");
// ===== World (meters) =====
const WW = 40, WH = 72, SH = 78, CS = .5, GW = WW / CS, GH = SH / CS;  // SH: the street continues off-frame
const R = .24, DT = 1 / 60;
let PCRIT = 8.5;
let CROWD = 3200, FENCE_BUDGET = 60, MAX_GATES = 5;
const SHOW_TIME = 40;
const FENCE_Y = 66, SLOTS = 7, SLOT_W = 2.6;
// gate positions: evenly spaced by default; each visit to a venue can shuffle them into a new, uneven layout
// ===== upgrade shop: tickets earned after every show buy permanent upgrades (3 levels each) =====
const UPGRADES = {
  budget:  { icon: "$",  name: "Bigger budget",       desc: "+15% fence money per level, in every venue", costs: [60, 150, 320] },
  battery: { icon: "+",  name: "Megaphone batteries", desc: "+1 megaphone use per show, per level", costs: [80, 190, 380] },
  loud:    { icon: "))", name: "Louder megaphone",    desc: "+20% megaphone reach per level", costs: [60, 140, 300] },
  steward: { icon: "S",  name: "Steward training",    desc: "Stewards slow people down 0.7 m further per level", costs: [70, 160, 330] },
  guards:  { icon: "G",  name: "Extra security",      desc: "+1 guard in every venue, per level", costs: [90, 210, 420] },
  calm:    { icon: "~",  name: "Charming guards",     desc: "Guards calm people 15% further per level", costs: [60, 140, 300] },
  foam:    { icon: "o",  name: "Softer foam",         desc: "Foam walls soak up more of the squeeze", costs: [50, 120, 260] },
  medic:   { icon: "✚",  name: "Better first aid",    desc: "First aid tents protect and heal more", costs: [70, 160, 340] },
};
let UPG = {}, TIX = 0, LAST_EARN = 0;
function loadShop() { try { UPG = JSON.parse(localStorage.getItem("mh.upg") || "{}") || {}; TIX = +(localStorage.getItem("mh.tix") || 0) || 0; } catch (e) { UPG = {}; TIX = 0; } }
function saveShop() { try { localStorage.setItem("mh.upg", JSON.stringify(UPG)); localStorage.setItem("mh.tix", String(TIX)); } catch (e) { /* no storage */ } }
const upg = k => (typeof window !== "undefined" && window.__manual) ? 0 : (UPG[k] || 0);   // recordings and tests play without upgrades
const MEGA_R = () => 5.5 * (1 + .2 * upg("loud"));
loadShop();
let SLOT_XS = null, SLOT_BAD = [];
const slotX = i => SLOT_XS ? SLOT_XS[i] : WW * (i + .5) / SLOTS;
const badSlots = () => SLOT_XS ? SLOT_BAD : ((typeof scene !== "undefined" && scene && scene.noSlots) || []);
let shuffleGates = (() => { try { return localStorage.getItem("mh.shuffle") !== "off"; } catch (e) { return true; } })();
let gates = [false, false, true, false, true, false, false], scene;
let fences = [];           // player fences {ax,ay,bx,by,len,type}
// fence materials the player can buy (cost per meter; the budget is FENCE_BUDGET * 10 dollars)
const FENCE_TYPES = {
  steel:    { name: "Barrier", cost: 10, col: "#f2c230", desc: "Stops people and small animals. Cars and elephants knock it over." },
  concrete: { name: "Concrete", cost: 20, col: "#9aa0a8", desc: "Stops absolutely everything. But it's hard: people squeezed against it get hurt faster." },
  rope:     { name: "Velvet rope", cost: 4, col: "#c8282a", desc: "Cheap and classy. Snaps if the crowd leans on it. Animals and cars go right through." },
  cones:    { name: "Cones", cost: 2.5, col: "#ff7a1a", desc: "People walk around them... until they're squeezed, then they step over. Nothing else cares." },
  foam:     { name: "Foam wall", cost: 16, col: "#3fa9e0", desc: "Soft padding that soaks up pressure: nobody gets crushed against it. Vehicles bounce off." },
};
let fenceType = "steel", fenceShape = "line";
// ways to lay a fence: a straight line, a freehand curve, or a prefab you drag out
const FENCE_SHAPES = {
  line:   { name: "Straight", desc: "Drag from one end to the other." },
  free:   { name: "Freehand", desc: "Drag any curve you like." },
  ring:   { name: "Ring", desc: "Drag from the center outwards. The opening faces where you let go." },
  funnel: { name: "Funnel", desc: "Drag from the narrow end to the wide end. Feeds people in gently." },
  zigzag: { name: "Zigzag queue", desc: "Drag along the way people walk. The switchbacks slow everyone down." },
  pen:    { name: "Pen", desc: "Drag a box. The door is on the side where you let go." },
};
// builds the list of straight pieces [ax, ay, bx, by] for a shape dragged from a to b (pts: freehand points)
function shapeSegs(shape, ax, ay, bx, by, pts) {
  const out = [], add = (x0, y0, x1, y1) => { if (Math.hypot(x1 - x0, y1 - y0) >= .6) out.push([x0, y0, x1, y1]); };
  const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy), ux = L ? dx / L : 1, uy = L ? dy / L : 0, nx = -uy, ny = ux;
  if (shape === "free") { for (let i = 1; i < (pts || []).length; i++) add(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]); }
  else if (shape === "ring") {
    const r = Math.max(2, L), n = clamp(Math.round(6.283 * r / 2), 8, 30), a0 = Math.atan2(dy, dx), gap = Math.min(1.2, 1.5 / r);
    for (let k = 0; k < n; k++) {
      const t0 = a0 + gap + (6.283 - 2 * gap) * k / n, t1 = a0 + gap + (6.283 - 2 * gap) * (k + 1) / n;
      add(ax + Math.cos(t0) * r, ay + Math.sin(t0) * r, ax + Math.cos(t1) * r, ay + Math.sin(t1) * r);
    }
  } else if (shape === "funnel") {
    const w = Math.max(5, L * .9) / 2, neck = 1.5;
    for (const s of [-1, 1]) add(ax + nx * neck * s, ay + ny * neck * s, bx + nx * w * s, by + ny * w * s);
  } else if (shape === "zigzag") {
    const n = Math.max(2, Math.floor(L / 3) + 1), half = 3.2;
    for (let k = 0; k < n; k++) {
      const q = n > 1 ? k / (n - 1) : 0, cx = ax + dx * q, cy = ay + dy * q, s = k % 2 ? 1 : -1;
      add(cx + nx * half * s, cy + ny * half * s, cx - nx * 1.2 * s, cy - ny * 1.2 * s);
    }
    for (const s of [-1, 1]) add(ax + nx * half * s, ay + ny * half * s, bx + nx * half * s, by + ny * half * s);
  } else if (shape === "pen") {
    const x0 = Math.min(ax, bx), x1 = Math.max(ax, bx), y0 = Math.min(ay, by), y1 = Math.max(ay, by), mx = (x0 + x1) / 2, d = Math.min(1.5, (x1 - x0) / 2 - .5);
    add(x0, ay, x1, ay); add(x0, y0, x0, y1); add(x1, y0, x1, y1);   // far side and the two walls
    if (d > 0) { add(x0, by, mx - d, by); add(mx + d, by, x1, by); }  // near side with a door in the middle
  } else add(ax, ay, bx, by);
  return out.map(([x0, y0, x1, y1]) => [clamp(x0, 0, WW), clamp(y0, 0, WH), clamp(x1, 0, WW), clamp(y1, 0, WH)]);
}
// security staff: guards calm people and stop animals; stewards slow everyone who walks past (crowd metering)
const GUARD_ROLES = {
  calm: { name: "Guard", col: "#d7f53a", desc: "Calms people nearby and stops animals and vehicles." },
  slow: { name: "Steward", col: "#4fc3f7", cost: 40, max: 10, desc: "Holds a SLOW sign: everyone within 3 m walks at half speed. Put them before a bottleneck. Hired from the fence budget." },
};
let guardRole = "calm";
let STEWARD_R = 3;
const fenceCost = f => f.len * FENCE_TYPES[f.type || "steel"].cost;
// props the player can place with the same budget
const PROP_TYPES = {
  water:  { name: "Water station", cost: 60, col: "#4fc3f7", r: .6, calm: 3, desc: "Free water: people within 3 m calm down." },
  medic:  { name: "First aid tent", cost: 120, col: "#e53935", r: 1.1, heal: 6, desc: "People within 6 m get patched up: squeezes hurt half as much and heal faster." },
  screen: { name: "Big screen", cost: 150, col: "#7e57c2", r: .9, desc: "Shows the show: about a quarter of the crowd watches it instead of crushing at the stage." },
};
let props = [], propType = "water";   // placed props {type, x, y}

// ===== Obstacles =====
let obs = [], buckets, BKS = 2, BW = Math.ceil(WW / BKS), BH = Math.ceil(SH / BKS);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
function seg(ax, ay, bx, by, th, kind) { const o = { t: "s", ax, ay, bx, by, th, kind }; obs.push(o); return o; }
function rect(x0, y0, x1, y1, kind) { const o = { t: "r", x0, y0, x1, y1, kind }; obs.push(o); return o; }
function circ(x, y, r, kind) { const o = { t: "c", x, y, r, kind }; obs.push(o); return o; }
// ===== Venues =====
const F = false, T = true;
const hazardLine = (g, ax, ay, bx, by, w) => {
  g.lineCap = "butt"; g.lineWidth = w; g.strokeStyle = "#e9b923"; g.setLineDash([]);
  g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
  g.strokeStyle = "#1c1c1c"; g.setLineDash([.45, .45]); g.stroke(); g.setLineDash([]);
};
function ringSegs(cx, cy, r, n, kind, skip) {
  for (let k = 0; k < n; k++) {
    const a0 = (k + .5) / n * Math.PI * 2, a1 = (k + 1.5) / n * Math.PI * 2;
    const ax = cx + Math.cos(a0) * r, ay = cy + Math.sin(a0) * r, bx = cx + Math.cos(a1) * r, by = cy + Math.sin(a1) * r;
    if (skip((ax + bx) / 2, (ay + by) / 2)) continue;
    seg(ax, ay, bx, by, .5, kind);
    obs[obs.length - 1].alt = k % 2;
  }
}
const RING = { x: 20, y: 21.5, r: 4.8 };     // plaza: round platform
const PISTA = { x: 20, y: 25, r: 7.6 };      // circus: the ring

const SCENES = {};
// venue files can bring their own 3D models: SCENE_MODELS[kind] = (group, u, mover) => {...},
// SCENE_PERSONS[kind] = { body, legs, hat, hatCol, scale, extra(g, u, body, mover) } (same format as PERSONS)
const SCENE_MODELS = {}, SCENE_PERSONS = {};
