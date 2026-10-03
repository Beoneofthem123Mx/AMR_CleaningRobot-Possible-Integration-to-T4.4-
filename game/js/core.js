// Human Tide · world, obstacles and utilities
const $ = s => document.querySelector(s);
const cv = $("#cv"), ov = $("#ov"), octx = ov.getContext("2d");
// ===== World (meters) =====
const WW = 40, WH = 72, SH = 78, CS = .5, GW = WW / CS, GH = SH / CS;  // SH: the street continues off-frame
const R = .24, DT = 1 / 60;
let PCRIT = 8.5;
let CROWD = 3200, FENCE_BUDGET = 60, MAX_GATES = 5;
const SHOW_TIME = 40;
const FENCE_Y = 66, SLOTS = 7, SLOT_W = 2.6;
const slotX = i => WW * (i + .5) / SLOTS;
let gates = [false, false, true, false, true, false, false], scene;
let fences = [];           // player fences {ax,ay,bx,by,len}

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
