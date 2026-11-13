// Human Tsunami · the player's chaos powers during the show: meteors, a giant bowling ball, an anvil, a cow, banana peels
// Pick one in the bar under the view and click the venue. Limited charges per show (more in the shop).
// What they flatten counts as pancaked, like everything else: they are for fun, not for stars.
const POWERS = {
  mega:   { icon: "📣", name: "Megaphone", desc: "Calms people down around the click" },
  // live decisions: change the venue while the crowd is in it
  egate:   { icon: "🚪", name: "Emergency gate", n: 2, live: true, desc: "Click a closed gate at the bottom to throw it open (wide) right now" },
  wall:    { icon: "🚧", name: "Drop barrier", n: 3, live: true, desc: "Click two points: a steel barrier (up to 7 m) drops between them, mid-show" },
  steward: { icon: "🦺", name: "Move steward", n: 99, live: true, desc: "Click a steward or guard, then click where they should run to" },
  pizza:   { icon: "🍕", name: "Free pizza", n: 2, live: true, desc: "Drops free pizza at the click: part of the crowd runs there for a few seconds" },
  meteor: { icon: "☄️", name: "Meteor", n: 1, desc: "A small meteor. Big crater. Nobody saw it coming." },
  bowl:   { icon: "🎳", name: "Bowling ball", n: 1, desc: "A giant bowling ball rolls through the click from the edge" },
  anvil:  { icon: "⚓", name: "Anvil", n: 1, desc: "Classic cartoon anvil. CLANG." },
  cow:    { icon: "🐄", name: "Cow", n: 1, desc: "A cow falls from the sky and bounces. MOOO." },
  banana: { icon: "🍌", name: "Banana peels", n: 2, desc: "Everybody who steps there does a backflip" },
  beam:     { icon: "🛸", name: "Tractor beam", bm: 2, desc: "Beams the crush up and drops them somewhere roomy" },
  freeze:   { icon: "⏸", name: "Pause remote", bm: 1, desc: "Everyone freezes for 4 seconds; the pressure drains" },
  antigrav: { icon: "🪐", name: "Anti-gravity", bm: 1, desc: "Gravity off for a moment: everyone floats" },
};
let power = "mega", charges = {}, pendingWall = null, pendingGuard = null;
let freezeT = 0;
function resetPowers() { power = "mega"; charges = {}; freezeT = 0; pendingWall = null; pendingGuard = null; for (const [k, p] of Object.entries(POWERS)) if (p.bm) charges[k] = bm(k) || (typeof sandbox !== "undefined" && sandbox) ? p.bm : 0; for (const [k, p] of Object.entries(POWERS)) if (p.n) charges[k] = p.n + (typeof upg === "function" ? upg("chaos") : 0) + (typeof gearOn === "function" && gearOn("pockets") ? 1 : 0); }
function usePower(x, y) {
  if ((charges[power] || 0) <= 0 && !sandbox) { caption(`No ${POWERS[power].name.toLowerCase()} left this show.`, true, 1400); power = "mega"; ui(); return; }
  if (!sandbox) charges[power]--;
  eventLog.add("power_" + power); POWER_USED = true;
  const kind = power; if (!sandbox && charges[power] <= 0) power = "mega";
  ui(); sfx("click");
  if (kind === "egate") {   // open the nearest closed gate, wide
    let best = -1, bd = 6; for (let i = 0; i < SLOTS; i++) { if (gates[i] || badSlots().includes(i)) continue; const d = Math.abs(slotX(i) - x) + Math.max(0, Math.abs(y - FENCE_Y) - 4); if (d < bd) { bd = d; best = i; } }
    if (best < 0) { charges.egate++; power = "egate"; ui(); caption("Click a CLOSED gate on the fence at the bottom.", true, 1600); return; }
    gates[best] = GATE_SIZES.wide.k; buildWorld(); pop(slotX(best), FENCE_Y - 2, "EMERGENCY EXIT!"); sfx("siren"); shockwave(slotX(best), FENCE_Y - 1); eventLog.add("egate"); return;
  }
  if (kind === "wall") {   // two clicks: start, then end
    if (!pendingWall) { pendingWall = [x, y]; charges.wall++; power = "wall"; ui(); rings.push({ x, y, t: 0, mega: true }); caption("Now click where the barrier ends", false, 1400); return; }
    let [ax, ay] = pendingWall, dx = x - ax, dy = y - ay, L = Math.hypot(dx, dy); pendingWall = null;
    if (L < .8) { charges.wall++; ui(); return; } if (L > 7) { x = ax + dx / L * 7; y = ay + dy / L * 7; L = 7; }
    fences.push({ ax, ay, bx: x, by: y, len: L, type: "steel" }); buildWorld(); sfx("drop"); pop((ax + x) / 2, (ay + y) / 2 - 1, "BARRIER!"); debris((ax + x) / 2, (ay + y) / 2, .3, 10, 3); eventLog.add("wall"); return;
  }
  if (kind === "steward") {   // pick someone, then send them
    if (!pendingGuard) { let best = null, bd = 6.25; for (const g of guards) { const d = (g.x - x) ** 2 + (g.y - y) ** 2; if (d < bd) { bd = d; best = g; } }
      charges.steward++; power = "steward"; ui(); if (!best) { caption("Click on one of your stewards or guards first", true, 1400); return; }
      pendingGuard = best; rings.push({ x: best.x, y: best.y, t: 0, mega: true }); caption("Now click where they should go", false, 1400); return; }
    pendingGuard.tx = clamp(x, 1, WW - 1); pendingGuard.ty = clamp(y, 1, FENCE_Y - 1); pop(pendingGuard.x, pendingGuard.y - 1.4, ["ON IT!", "ROGER!", "MOVING!"][(Math.random() * 3) | 0]); pendingGuard = null; charges.steward++; power = "steward"; ui(); return;
  }
  if (kind === "pizza") {
    tempAttract(x, y, 2.6, 5, .35); pop(x, y - 1, "FREE PIZZA!"); burstAt(x, y, 30); for (let k = 0; k < 8; k++) puff(x + rnd(-1, 1), y + rnd(-1, 1), .4, "#ffb238", .35, 1, .5); sfx("jingle"); eventLog.add("pizza"); return;
  }
  if (kind === "meteor") {
    rings.push({ x, y, t: 0 }); pop(x, y - 1, "LOOK UP!");
    addMover({ kind: "meteor", beh: "static", life: 4, x: x + 14, y: y - 18, sx: x + 14, sy: y - 18, tx: x, ty: y, r: .9, push: 0, air: true, h: 40, say: "", tick(m) {
      const q = Math.min(1, m.t / 1.3); m.x = m.sx + (m.tx - m.sx) * q; m.y = m.sy + (m.ty - m.sy) * q; m.h = 40 * (1 - q); m.ang = Math.atan2(m.ty - m.sy, m.tx - m.sx);
      puff(m.x, m.y, m.h + .5, Math.random() < .5 ? "#ff9a3c" : "#ffd23a", .7, .7, .2); if (Math.random() < .5) puff(m.x, m.y, m.h + 1, "#5a5560", 1, 1.6, .4);
      if (q >= 1 && !m.hit) {
        m.hit = true; m.dead = true; blast(x, y); flash = Math.max(flash, .5); shake = Math.min(1.5, shake + 1);
        let crushed = 0; for (const a of ag) { const d = Math.hypot(a.x - x, a.y - y); if (d < 1.2) { crushed++; a.dmg = 1.6; a.forceFall = [3, 5, 6, 8][(Math.random() * 4) | 0]; } else if (d < 3.6 && Math.random() < .35) yeet(a, a.x - x, a.y - y); }
        if (!crushed && phase === "show" && ag.length > 300) unlockSecret("LUCKY");
        for (let k = 0; k < 24; k++) { const an = k / 24 * 6.283; puff(x + Math.cos(an) * 2, y + Math.sin(an) * 2, .3, "#6a6058", .9, 2, .6); }
        pop(x, y - 2, "KA-THOOOM!"); CRATERS.push([x, y, 2.6]); debris(x, y, .4, 90, 10, ["#5a5560", "#3e3a40", "#ff9a3c", "#ffd23a", "#8a7f6a"]); hitStop(.45);
      } } });
  } else if (kind === "bowl") {
    const from = y > SH / 2 ? [x + (Math.random() - .5) * 6, SH + 2] : [-2, y], d = Math.hypot(x - from[0], y - from[1]) || 1;
    addMover({ kind: "bowling", beh: "bounce", x: from[0], y: from[1], vx: (x - from[0]) / d * 9, vy: (y - from[1]) / d * 9, r: 1.05, push: 60, scare: 2.5, life: 7, say: "STRIIIKE!", sayEvery: 2.4 });
    pop(x, y - 1, "STRIKE INCOMING!");
  } else if (kind === "anvil") {
    addMover({ kind: "anvil", beh: "static", life: 6, x, y, r: .6, push: 0, air: true, h: 22, vh: 0, say: "", tick(m) {
      if (m.landed) { m.h = 0; return; }
      m.vh -= 30 * DT; m.h += m.vh * DT;
      if (m.h <= 0) {
        m.h = 0; m.landed = true; sfx("crash"); shake = Math.min(1.4, shake + .7); pop(x, y - 1.3, "CLANG!"); debris(x, y, .2, 24, 5); shockwave(x, y, true); hitStop(.2);
        for (const a of ag) { const d = Math.hypot(a.x - x, a.y - y); if (d < .95) { a.dmg = 1.6; a.forceFall = 4; } else if (d < 2.2) { a.vx += (a.x - x) / d * 3; a.vy += (a.y - y) / d * 3; toss(a, .7, .5); } }
        for (let k = 0; k < 8; k++) puff(x + rnd(-1, 1), y + rnd(-1, 1), .2, "#d9ccb0", .4, 1.2, .5);
      } } });
    rings.push({ x, y, t: 0 });
  } else if (kind === "cow") {
    addMover({ kind: "cow", beh: "static", life: 9, x, y, r: 1, push: 0, air: true, h: 26, vh: 0, bounces: 0, say: "MOOOOO!", sayEvery: 2.5, ang: Math.random() * 6, tick(m) {
      m.vh -= 24 * DT; m.h += m.vh * DT; m.ang += DT * 3;
      if (m.h <= 0) {
        m.h = 0; m.vh = 9 - m.bounces * 3; m.bounces++; m.x += rnd(-2.5, 2.5); m.y += rnd(-2.5, 2.5); sfx("moo"); shake = Math.min(1.2, shake + .45);
        pop(m.x, m.y - 1.5, ["BOING!", "MOO-HOO!", "UDDER CHAOS!"][Math.min(2, m.bounces - 1)]); debris(m.x, m.y, .2, 16, 4.5); shockwave(m.x, m.y, m.bounces === 1);
        let hit = 0; for (const a of ag) { const d = Math.hypot(a.x - m.x, a.y - m.y); if (d < 2.3 && d > .01) { hit++; if (d < .8 && m.bounces === 1) { a.dmg = 1.6; a.forceFall = 4; } else if (!yeet(a, a.x - m.x, a.y - m.y)) toss(a, 1.5, .8); } }
        if (hit >= 10) unlockSecret("COW_STRIKE");
        if (m.bounces >= 3) { m.dead = true; pop(m.x, m.y - 1.5, "MOO. (BOW)"); }
      } } });
  } else if (kind === "beam") {   // everyone in the crush goes up the beam and comes down where there's room
    let tx = x, ty = y, tn = 1e9;
    for (let k = 0; k < 16; k++) { const [px, py] = crowdPoint(); if (blockedC[cellOf(px, py)] || !isFinite(fStage[cellOf(px, py)])) continue; let n = 0; for (let i = 0; i < ag.length; i += 3) if ((ag[i].x - px) ** 2 + (ag[i].y - py) ** 2 < 16) n++; if (n < tn) { tn = n; tx = px; ty = py; } }
    let moved = 0;
    for (const a of ag) if ((a.x - x) ** 2 + (a.y - y) ** 2 < 9 && moved < 60) { moved++; a.x = tx + (Math.random() - .5) * 3; a.y = ty + (Math.random() - .5) * 3; a.p = 0; a.ps *= .2; a.dmg *= .3; toss(a, 4, 1.2); }
    for (let k = 0; k < 18; k++) { puff(x + rnd(-1.5, 1.5), y + rnd(-1.5, 1.5), rnd(.5, 6), "#7dff6a", .5, 1, .8); puff(tx + rnd(-1.5, 1.5), ty + rnd(-1.5, 1.5), rnd(.5, 5), "#7dff6a", .5, 1, -.4); }
    pop(x, y - 2, `BEAMED ${moved}!`); sfx("ufo"); shockwave(tx, ty);
  } else if (kind === "freeze") {
    freezeT = 4; flash = Math.max(flash, .5); pop(WW / 2, 30, "⏸ PAUSED"); caption("Everybody freezes. Breathe.", true, 2000); sfx("beep");
  } else if (kind === "antigrav") {
    for (const a of ag) { if (!toss(a, 1.4 + Math.random() * 2.2, 1.6 + Math.random() * .8)) continue; a.p = 0; a.ps *= .2; a.dmg *= .5; a.airSpin = (Math.random() - .5) * 1.5; }
    pop(WW / 2, 30, "ZERO G!"); caption("Gravity has left the building", true, 2000); sfx("ufo"); shake = Math.min(1, shake + .4);
  } else if (kind === "banana") {
    addMover({ kind: "peel", beh: "static", life: 10, x, y, r: .3, push: 0, air: true, h: 0, say: "", tick(m) {
      for (const a of ag) { if (a.air > 0 || (a.slipT || 0) > t) continue; const d = (a.x - m.x) ** 2 + (a.y - m.y) ** 2;
        if (d < 1.4) { a.slipT = t + 3; if (!(a.springy && yeet(a))) { toss(a, 1.4 + Math.random(), .8); a.airSpin = Math.random() < .5 ? -1.5 : 1.5; } if (Math.random() < .15) pop(a.x, a.y - 1, ["WHOOPS!", "BANANA!", "MY DIGNITY!"][(Math.random() * 3) | 0]); } } } });
    pop(x, y - 1, "PEEL!");
  }
}
let CRATERS = [], POWER_USED = false;
