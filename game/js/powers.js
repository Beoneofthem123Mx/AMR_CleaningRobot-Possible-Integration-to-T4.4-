// Human Tsunami · the player's chaos powers during the show: meteors, a giant bowling ball, an anvil, a cow, banana peels
// Pick one in the bar under the view and click the venue. Limited charges per show (more in the shop).
// What they flatten counts as pancaked, like everything else: they are for fun, not for stars.
const POWERS = {
  mega:   { icon: "📣", name: "Megaphone", desc: "Calms people down around the click" },
  meteor: { icon: "☄️", name: "Meteor", n: 1, desc: "A small meteor. Big crater. Nobody saw it coming." },
  bowl:   { icon: "🎳", name: "Bowling ball", n: 1, desc: "A giant bowling ball rolls through the click from the edge" },
  anvil:  { icon: "⚓", name: "Anvil", n: 1, desc: "Classic cartoon anvil. CLANG." },
  cow:    { icon: "🐄", name: "Cow", n: 1, desc: "A cow falls from the sky and bounces. MOOO." },
  banana: { icon: "🍌", name: "Banana peels", n: 2, desc: "Everybody who steps there does a backflip" },
};
let power = "mega", charges = {};
function resetPowers() { power = "mega"; charges = {}; for (const [k, p] of Object.entries(POWERS)) if (p.n) charges[k] = p.n + (typeof upg === "function" ? upg("chaos") : 0) + (typeof gearOn === "function" && gearOn("pockets") ? 1 : 0); }
function usePower(x, y) {
  if ((charges[power] || 0) <= 0 && !sandbox) { caption(`No ${POWERS[power].name.toLowerCase()} left this show.`, true, 1400); power = "mega"; ui(); return; }
  if (!sandbox) charges[power]--;
  eventLog.add("power_" + power); POWER_USED = true;
  const kind = power; if (!sandbox && charges[power] <= 0) power = "mega";
  ui(); sfx("click");
  if (kind === "meteor") {
    rings.push({ x, y, t: 0 }); pop(x, y - 1, "LOOK UP!");
    addMover({ kind: "meteor", beh: "static", life: 4, x: x + 14, y: y - 18, sx: x + 14, sy: y - 18, tx: x, ty: y, r: .9, push: 0, air: true, h: 40, say: "", tick(m) {
      const q = Math.min(1, m.t / 1.3); m.x = m.sx + (m.tx - m.sx) * q; m.y = m.sy + (m.ty - m.sy) * q; m.h = 40 * (1 - q); m.ang = Math.atan2(m.ty - m.sy, m.tx - m.sx);
      puff(m.x, m.y, m.h + .5, Math.random() < .5 ? "#ff9a3c" : "#ffd23a", .7, .7, .2); if (Math.random() < .5) puff(m.x, m.y, m.h + 1, "#5a5560", 1, 1.6, .4);
      if (q >= 1 && !m.hit) {
        m.hit = true; m.dead = true; blast(x, y); flash = Math.max(flash, .5); shake = Math.min(1.5, shake + 1);
        for (const a of ag) { const d = Math.hypot(a.x - x, a.y - y); if (d < 1.2) { a.dmg = 1.6; a.forceFall = [3, 5, 6, 8][(Math.random() * 4) | 0]; } else if (d < 3.6 && Math.random() < .35) yeet(a, a.x - x, a.y - y); }
        for (let k = 0; k < 24; k++) { const an = k / 24 * 6.283; puff(x + Math.cos(an) * 2, y + Math.sin(an) * 2, .3, "#6a6058", .9, 2, .6); }
        pop(x, y - 2, "KA-THOOOM!"); CRATERS.push([x, y, 2.6]);
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
        m.h = 0; m.landed = true; sfx("crash"); shake = Math.min(1.4, shake + .7); pop(x, y - 1.3, "CLANG!");
        for (const a of ag) { const d = Math.hypot(a.x - x, a.y - y); if (d < .95) { a.dmg = 1.6; a.forceFall = 4; } else if (d < 2.2) { a.vx += (a.x - x) / d * 3; a.vy += (a.y - y) / d * 3; toss(a, .7, .5); } }
        for (let k = 0; k < 8; k++) puff(x + rnd(-1, 1), y + rnd(-1, 1), .2, "#d9ccb0", .4, 1.2, .5);
      } } });
    rings.push({ x, y, t: 0 });
  } else if (kind === "cow") {
    addMover({ kind: "cow", beh: "static", life: 9, x, y, r: 1, push: 0, air: true, h: 26, vh: 0, bounces: 0, say: "MOOOOO!", sayEvery: 2.5, ang: Math.random() * 6, tick(m) {
      m.vh -= 24 * DT; m.h += m.vh * DT; m.ang += DT * 3;
      if (m.h <= 0) {
        m.h = 0; m.vh = 9 - m.bounces * 3; m.bounces++; m.x += rnd(-2.5, 2.5); m.y += rnd(-2.5, 2.5); sfx("moo"); shake = Math.min(1.2, shake + .45);
        pop(m.x, m.y - 1.5, ["BOING!", "MOO-HOO!", "UDDER CHAOS!"][Math.min(2, m.bounces - 1)]);
        for (const a of ag) { const d = Math.hypot(a.x - m.x, a.y - m.y); if (d < 2.3 && d > .01) { if (d < .8 && m.bounces === 1) { a.dmg = 1.6; a.forceFall = 4; } else if (!yeet(a, a.x - m.x, a.y - m.y)) toss(a, 1.5, .8); } }
        if (m.bounces >= 3) { m.dead = true; pop(m.x, m.y - 1.5, "MOO. (BOW)"); }
      } } });
  } else if (kind === "banana") {
    addMover({ kind: "peel", beh: "static", life: 10, x, y, r: .3, push: 0, air: true, h: 0, say: "", tick(m) {
      for (const a of ag) { if (a.air > 0 || (a.slipT || 0) > t) continue; const d = (a.x - m.x) ** 2 + (a.y - m.y) ** 2;
        if (d < 1.4) { a.slipT = t + 3; if (!(a.springy && yeet(a))) { toss(a, 1.4 + Math.random(), .8); a.airSpin = Math.random() < .5 ? -1.5 : 1.5; } if (Math.random() < .15) pop(a.x, a.y - 1, ["WHOOPS!", "BANANA!", "MY DIGNITY!"][(Math.random() * 3) | 0]); } } } });
    pop(x, y - 1, "PEEL!");
  }
}
let CRATERS = [], POWER_USED = false;
