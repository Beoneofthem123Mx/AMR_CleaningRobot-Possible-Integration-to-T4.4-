// Human Tide · today's twist: a random surprise every show
const MODS = [
  { id: "normal", name: "A quiet day", desc: "No surprises. For now.", w: 3 },
  { id: "wifi", name: "Free wifi in one corner", desc: "A third of the crowd only cares about signal and piles up around the router.", w: 2, altShare: .33,
    start() {
      const spots = [[5, 26], [WW - 5, 26], [5, 52], [WW - 5, 52], [12, 40], [WW - 12, 40]].sort(() => Math.random() - .5);
      for (const [x, y] of spots) if (!blockedC[cellOf(x, y)] && isFinite(fStage[cellOf(x, y)]) && setAlt(x, y, 2.2)) {
        addMover({ kind: "router", beh: "static", x, y, life: 1e9, r: .3, push: 0, say: "FREE WIFI!", sayEvery: 6 }); break;
      }
    } },
  { id: "influencer", name: "Influencer going live", desc: "She wanders around livestreaming and a third of the crowd follows her everywhere.", w: 2, altShare: .32,
    start() {
      const pts = Array.from({ length: 12 }, () => crowdPoint());
      addMover({ kind: "influencer", x: openGateX(), y: 62, pts, speed: .9, r: .4, push: 15, scare: 0, say: "HEY BESTIES!", sayEvery: 4,
        tick(m) { m.next = (m.next || 0) - DT; if (m.next <= 0) { m.next = 1.5; setAlt(m.x, m.y, 2.6); } } });
    } },
  { id: "rain", name: "Downpour", desc: "It's raining cats and dogs. Everyone walks faster and shoves harder.", w: 2, speed: 1.2, rain: true },
  { id: "reggaeton", name: "Reggaeton night", desc: "The big moments come twice as often. Nobody stands still.", w: 2, dropMul: .5 },
  { id: "moon", name: "Moon gravity", desc: "Nobody knows why, but everyone bounces. At least they can take more squeezing.", w: 1, pcritMul: 1.25, bounce: 3 },
  { id: "rush", name: "Rush hour", desc: "25% more people showed up than fit. The organizer oversold the tickets.", w: 2, crowdMul: 1.25 },
  { id: "slowmo", name: "Slow-motion crowd", desc: "Everyone walks like it's the end of a dramatic movie. The evacuation will be epic.", w: 1, speed: .7 },
  { id: "chanclas", name: "Flip-flop storm", desc: "Moms are hurling flip-flops from the sidelines. Nobody knows who they're aiming at, but everyone feels guilty.", w: 2, events: ["chancla", "chancla"],
    ev: { chancla() { for (let n = 0; n < 4; n++) { const [tx, ty] = crowdPoint(), sx = Math.random() < .5 ? -1 : WW + 1, sy = rnd(20, 60);
      addMover({ kind: "chancla", beh: "fly", x: sx, y: sy, sx, sy, tx, ty, dur: 1.2 + Math.random() * .6, r: .3, push: 0, air: true, small: true, say: n ? "" : "WHACK!", sayEvery: 9 }); }
      caption("Incoming flip-flops! Duck!", true, 1600); } } },
  { id: "pigeons", name: "Hungry pigeons", desc: "Someone spilled popcorn. The pigeons are dive-bombing the crowd.", w: 2, events: ["palomas", "palomas"],
    ev: { palomas() { for (let n = 0; n < 7; n++) { const y = rnd(14, 60), side = Math.random() < .5;
      addMover({ kind: "gull", grey: true, x: side ? -3 - n : WW + 3 + n, y, pts: [crowdPoint(), [side ? WW + 4 : -4, y + rnd(-10, 10)]], speed: 6, r: .3, push: 0, scare: 2, air: true, h: 6 + n * .4, swoop: true, say: n ? "" : "COO COO!", sayEvery: 2 }); }
      caption("Pigeon attack!", true, 1600); } } },
  { id: "apagon", name: "Blackouts", desc: "The power goes out and comes back whenever it feels like it. Everyone whips out their phone and walks blind.", w: 2, speed: .92, events: ["apagon", "apagon"],
    ev: { apagon() { const d = rnd(5, 8); blackT = d; sfx("boom"); caption("The lights went out!", true, 1800);
      later(d, () => { if (phase === "show") { cheerT = 3; burst(160); sfx("cheer"); caption("The lights are back! Nobody knows where their group went", false, 1800); } }); } } },
  { id: "nino", name: "Children's Day", desc: "Kids get in free. They're tiny, ridiculously fast, there are tons of them and they bounce like rubber balls.", w: 2, speed: 1.18, crowdMul: 1.15, sizeMul: .66, pcritMul: 1.2 },
  { id: "uniforme", name: "Mandatory uniform", desc: "The sponsor handed out identical T-shirts to everyone. Nobody can find their group.", w: 2, uniform: true },
  { id: "tio", name: "The party uncle", desc: "The uncle showed up. He dances, yells, hugs everyone and a fifth of the crowd follows him.", w: 2, altShare: .2,
    start() {
      const lines = ["THAT'S MY SONG!", "TAKE MY PICTURE, KIDDO!", "I KNOW THE OWNER!", "ONE MORE! ONE MORE!", "BACK IN MY DAY THIS WAS ALL FIELDS!", "TURN IT UP, DJ!"];
      addMover({ kind: "tio", x: openGateX(), y: 62, pts: Array.from({ length: 12 }, () => crowdPoint()), speed: .8, r: .4, push: 15, scare: 0, say: lines[0], sayEvery: 3.5,
        tick(m) { m.next = (m.next || 0) - DT; if (m.next <= 0) { m.next = 1.5; setAlt(m.x, m.y, 2.6); } if (m.t >= (m.nextSay || 0) - .05) m.say = pick(lines); } });
    } },
];
const MODS_BY_ID = Object.fromEntries(MODS.map(m => [m.id, m]));
// in chaos mode two of today's twists are combined
function comboMod(a, b) {
  if (a.id === "normal") return b; if (b.id === "normal" || a.id === b.id) return a;
  const prod = k => (a[k] || 1) * (b[k] || 1);
  return { id: a.id + "+" + b.id, name: `${a.name} + ${b.name}`, desc: `${a.desc} Also: ${b.desc.charAt(0).toLowerCase() + b.desc.slice(1)}`,
    speed: prod("speed"), pcritMul: prod("pcritMul"), crowdMul: prod("crowdMul"), dropMul: prod("dropMul"), sizeMul: prod("sizeMul"), bounce: a.bounce || b.bounce, rain: a.rain || b.rain, uniform: a.uniform || b.uniform,
    altShare: Math.max(a.altShare || 0, b.altShare || 0) || undefined, events: (a.events || []).concat(b.events || []), ev: { ...(a.ev || {}), ...(b.ev || {}) },
    start() { if (a.start) a.start(); if (b.start) b.start(); } };
}
function rollMod() {
  const total = MODS.reduce((s, m) => s + m.w, 0); let r = Math.random() * total;
  for (const m of MODS) { r -= m.w; if (r <= 0) return m; }
  return MODS[0];
}
// the roulette: flips through names fast, stops and starts the show
function startWithRoulette() {
  if (phase !== "plan" || !canStart()) return;
  audioInit();
  let pick = window.__forceMod ? MODS_BY_ID[window.__forceMod] : rollMod();
  if (chaosMode && !window.__forceMod) { let b = rollMod(), n = 0; while (b.id === pick.id && n++ < 5) b = rollMod(); pick = comboMod(pick.id === "normal" ? rollMod() : pick, b); }
  showCard(`<div class="roulette"><small>Today's twist</small><h2 id="rl">…</h2><p id="rld">&nbsp;</p></div>`);
  let k = 0, done = false;
  const names = MODS.map(m => m.name);
  const spin = setInterval(() => { $("#rl").textContent = names[k++ % names.length]; sfx("tick"); }, 70);
  const go = () => { if (done) return; done = true; clearInterval(spin); hideCard(); start(pick); showModChip(pick); };
  setTimeout(() => { clearInterval(spin); $("#rl").textContent = pick.name; $("#rld").textContent = pick.desc; sfx("cheer"); }, 1300);
  setTimeout(go, 3300);
  $("#card").onclick = () => { if (k > 8) go(); };
}
function showModChip(m) {
  const el = $("#mod");
  if (!m || m.id === "normal") { el.hidden = true; return; }
  el.hidden = false; el.textContent = m.name;
}
