// Human Tsunami · random hazards: TNT barrels and gas tanks left lying around the venue
// A few appear somewhere new on every visit and are shown while planning, with their blast radius.
// During the show they go off when the crowd squeezes them, when another explosion is close (chain
// reactions!) or when a kid with a sparkler finds them. A guard standing next to one keeps it safe.
const HAZ_TYPES = {
  tnt: { name: "TNT barrel", r: 3.4, col: "#d8322b", label: "TNT", fuse: 2 },
  gas: { name: "Gas tank", r: 3.8, col: "#4fb8ff", label: "GAS", fuse: 1.6 },
};
let HAZ_SPOTS = [], HAZ = [];
SCENE_MODELS.haz_tnt = (g, u) => {
  part(g, "cyl", "#c8261f", .42, 1, .42, 0, .5, 0); for (const y of [.18, .82]) part(g, "cyl", "#2b2d33", .44, .07, .44, 0, y, 0);
  part(g, "cyl", "#f4f1ea", .43, .26, .43, 0, .5, 0);   // the white TNT label band
  const fuse = part(g, "cyl", "#2b2d33", .03, .3, .03, .1, 1.12, 0); u.spark = part(g, "sph", basic("#ffd23a"), .09, .09, .09, .1, 1.3, 0); u.spark.visible = false;
  u.anim = (tt, m) => { u.spark.visible = m.lit > 0; if (m.lit > 0) { const s = .7 + Math.random() * .8; u.spark.scale.set(.09 * s, .09 * s, .09 * s); g.position.x += (Math.random() - .5) * .04; } fuse.visible = true; };
};
SCENE_MODELS.haz_gas = (g, u) => {
  part(g, "cyl", "#e8eef4", .3, 1.25, .3, 0, .62, 0); part(g, "sph", "#e8eef4", .3, .22, .3, 0, 1.25, 0);
  part(g, "cyl", "#2f7fd6", .31, .22, .31, 0, .75, 0); part(g, "cyl", "#d8322b", .08, .18, .08, 0, 1.5, 0);
  u.anim = (tt, m) => { if (m.lit > 0) g.rotation.z = Math.sin(tt * 40) * .06; };
};
// a new layout on every visit (called from loadScene, after the world is built)
function hazardsPick() {
  HAZ_SPOTS = [];
  if (sceneKey === "custom" || !blockedC) return;
  const n = 2 + (Math.random() < .5 ? 1 : 0);
  for (let tries = 0; tries < 400 && HAZ_SPOTS.length < n; tries++) {
    const x = 3 + Math.random() * (WW - 6), y = 12 + Math.random() * Math.max(4, FENCE_Y - 20), c = cellOf(x, y);
    if (blockedC[c] || !isFinite(fStage[c]) || fStage[c] < 5) continue;   // never in the front rows: that would always go off
    if (HAZ_SPOTS.some(h => (h.x - x) ** 2 + (h.y - y) ** 2 < 64)) continue;
    let nearGate = false; for (let i = 0; i < SLOTS; i++) if (Math.abs(slotX(i) - x) < 4 && y > FENCE_Y - 8) nearGate = true; if (nearGate) continue;
    HAZ_SPOTS.push({ x, y, kind: Math.random() < .55 ? "tnt" : "gas" });
  }
}
// at the start of the show the spots become real barrels and tanks
function hazardsStart() {
  HAZ = [];
  for (const s of HAZ_SPOTS) {
    addMover({ kind: "haz_" + s.kind, fixture: true, beh: "static", life: 1e9, x: s.x, y: s.y, ang: Math.random() * 6, r: .45, push: 14, scare: 0, lit: 0 });
    HAZ.push({ ...s, m: movers[movers.length - 1], state: "idle", t: 0, spark: 14 + Math.random() * 30, chk: 0 });
  }
}
const guardedHaz = h => guards.some(g => (g.x - h.x) ** 2 + (g.y - h.y) ** 2 < 9);
function hazardIgnite(h, fuse, why) {
  if (h.state !== "idle") return;
  h.state = "lit"; h.t = fuse ?? HAZ_TYPES[h.kind].fuse; h.m.lit = 1;
  if (!demo) { pop(h.x, h.y - 1.4, why || (h.kind === "tnt" ? "TSSSSS..." : "HISSSSS!")); if (h.t > .6) caption(h.kind === "tnt" ? "A TNT barrel is lit!" : "A gas tank is leaking!", true, 1600); }
  sfx(h.kind === "tnt" ? "fiu" : "siren");
}
function hazardBoom(h) {
  h.state = "gone"; h.m.dead = true;
  const R = HAZ_TYPES[h.kind].r;
  for (const a of ag) { const dx = a.x - h.x, dy = a.y - h.y, d = Math.hypot(dx, dy); if (d < R && d > .01) { const k = 1 - d / R; a.vx += dx / d * k * 7; a.vy += dy / d * k * 7; a.p += k * 3.5; if (Math.random() < .75) toss(a, 2.2 + k * 3.5, 1.1 + Math.random() * .5); } }
  pop(h.x, h.y - 1.2, h.kind === "tnt" ? "KABOOM!" : "WHOOOMPH!"); burstAt(h.x, h.y, 110); shake = Math.min(1.3, shake + .9); flash = Math.max(flash, .5);
  debris(h.x, h.y, .35, 60, 8, h.kind === "tnt" ? ["#c8261f", "#2b2d33", "#ff9a3c", "#ffd23a"] : ["#e8eef4", "#2f7fd6", "#ff9a3c", "#ffd23a"]);
  shockwave(h.x, h.y, true); hitStop(.3); sfx("boom"); if (typeof CRATERS !== "undefined") CRATERS.push([h.x, h.y, 1.8]);
  eventLog.add("hazard_" + h.kind);
  hazardChain(h.x, h.y, R + 1);
}
// explosions nearby light the fuse of other barrels and tanks
function hazardChain(x, y, r) { for (const h of HAZ) if (h.state === "idle" && (h.x - x) ** 2 + (h.y - y) ** 2 < (r || 4.4) ** 2) hazardIgnite(h, .45 + Math.random() * .4, "CHAIN REACTION!"); }
function hazardStep() {
  if (!HAZ.length) return;
  for (const h of HAZ) {
    if (h.state === "gone") continue;
    if (h.state === "idle") {
      // a kid with a sparkler wanders by (unless a guard is standing right there)
      if (fullAt && t > fullAt + h.spark) { if (guardedHaz(h)) { h.spark += 20; if (!demo) pop(h.x, h.y - 1.4, "NOT ON MY WATCH!"); } else hazardIgnite(h, null, "OOH, A SPARKLER!"); continue; }
      // the crowd squeezing it
      if (++h.chk % 15) continue;
      let n = 0; const need = guardedHaz(h) ? 14 : 7; for (const a of ag) if ((a.x - h.x) ** 2 + (a.y - h.y) ** 2 < 1.7 && a.ps > PCRIT * .45) n++;
      if (n >= need) hazardIgnite(h, null, h.kind === "tnt" ? "WHO KICKED THE BARREL?!" : "SOMEONE SAT ON THE VALVE!");
      continue;
    }
    if (h.state === "lit") {
      h.t -= DT;
      if (Math.random() < .5) puff(h.m.x + rnd(-.2, .2), h.m.y + rnd(-.2, .2), h.kind === "tnt" ? 1.2 : .6, h.kind === "tnt" ? "#ffd23a" : "#f4f4f4", .15, .5, .6);
      if (h.t <= 0) {
        if (h.kind === "tnt") hazardBoom(h);
        else {   // the gas tank takes off like a rocket, ploughing through the crowd, then blows up where it stops
          const an = Math.random() * 6.283; h.state = "rocket"; h.t = 1.6 + Math.random() * .8; h.vx = Math.cos(an) * 9; h.vy = Math.sin(an) * 9; h.m.beh = "static"; if (!demo) pop(h.x, h.y - 1.4, "WHEEEEE!");
        }
      }
      continue;
    }
    if (h.state === "rocket") {
      h.t -= DT; h.x += h.vx * DT; h.y += h.vy * DT;
      if (h.x < 1 || h.x > WW - 1) { h.vx *= -1; h.x = clamp(h.x, 1, WW - 1); }
      if (h.y < 1 || h.y > FENCE_Y - 1) { h.vy *= -1; h.y = clamp(h.y, 1, FENCE_Y - 1); }
      if (blockedC[cellOf(h.x, h.y)]) { h.vx *= -1; h.vy *= -1; h.x += h.vx * DT * 2; h.y += h.vy * DT * 2; }
      h.m.x = h.x; h.m.y = h.y; h.m.ang = Math.atan2(h.vy, h.vx); h.m.lit = 1;
      puff(h.x, h.y, .5, "#f4f4f4", .25, .7, .3);
      for (const a of ag) if ((a.x - h.x) ** 2 + (a.y - h.y) ** 2 < .8 && a.air <= 0) { toss(a, 1.4, 1); a.vx += h.vx * .4; a.vy += h.vy * .4; }
      if (h.t <= 0) hazardBoom(h);
    }
  }
}
// plan view: where the hazards are and how far they reach
function drawHazardSpots(g) {
  if (phase !== "plan" || !HAZ_SPOTS.length) return;
  for (const h of HAZ_SPOTS) {
    const T = HAZ_TYPES[h.kind];
    g.fillStyle = "rgba(216,50,43,.16)"; g.beginPath(); g.arc(h.x, h.y, T.r, 0, 7); g.fill();
    g.save(); g.setLineDash([.5, .3]); g.strokeStyle = "rgba(216,50,43,.9)"; g.lineWidth = .22; g.beginPath(); g.arc(h.x, h.y, T.r, 0, 7); g.stroke(); g.restore();
    g.fillStyle = T.col; g.strokeStyle = "#111214"; g.lineWidth = .16; g.beginPath(); g.arc(h.x, h.y, 1, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "#fff"; g.font = "900 .7px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(T.label, h.x, h.y + .03);
    g.fillStyle = "#ffd23a"; g.font = "900 .6px Rubik, sans-serif"; g.fillText("⚠ " + T.name.toUpperCase(), h.x, h.y - T.r - .5);
  }
}
