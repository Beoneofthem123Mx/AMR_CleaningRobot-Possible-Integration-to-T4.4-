// Marea Humana · mundo, obstáculos y utilidades
const $ = s => document.querySelector(s);
const cv = $("#cv"), ov = $("#ov"), octx = ov.getContext("2d");
// ===== Mundo (metros) =====
const WW = 40, WH = 72, SH = 78, CS = .5, GW = WW / CS, GH = SH / CS;  // SH: la calle sigue fuera de cuadro
const R = .24, DT = 1 / 60;
let PCRIT = 8.5;
let CROWD = 3200, FENCE_BUDGET = 60, MAX_GATES = 5;
const SHOW_TIME = 40;
const FENCE_Y = 66, SLOTS = 7, SLOT_W = 2.6;
const slotX = i => WW * (i + .5) / SLOTS;
let gates = [false, false, true, false, true, false, false], scene;
let fences = [];           // vallas del jugador {ax,ay,bx,by,len}

// ===== Obstáculos =====
let obs = [], buckets, BKS = 2, BW = Math.ceil(WW / BKS), BH = Math.ceil(SH / BKS);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
function seg(ax, ay, bx, by, th, kind) { obs.push({ t: "s", ax, ay, bx, by, th, kind }); }
function rect(x0, y0, x1, y1, kind) { obs.push({ t: "r", x0, y0, x1, y1, kind }); }
function circ(x, y, r, kind) { obs.push({ t: "c", x, y, r, kind }); }
// ===== Escenarios =====
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
const RING = { x: 20, y: 21.5, r: 4.8 };     // plaza: plataforma redonda
const PISTA = { x: 20, y: 25, r: 7.6 };      // circo: la pista

const SCENES = {};
