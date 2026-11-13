// Human Tsunami · today's twist: a random surprise every show
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
// ---- even more twists: each one breaks a different rule of the universe ----
// drop one of the player's chaos powers somewhere, for free (used by the sky-falling twists)
function freePower(kind, x, y) { const keep = power, n = charges[kind] || 0; power = kind; charges[kind] = n + 1; usePower(x, y); power = keep; charges[kind] = n; }
const anyOutfit = () => { const ids = OUTFITS.map((o, i) => o ? i : 0).filter(Boolean); return ids[(Math.random() * ids.length) | 0]; };
MODS.push(
  { id: "giants", icon: "🦒", name: "Giant Day", desc: "Everyone woke up two sizes bigger. They are slow, they are enormous, and there is NOT enough room.", w: 1, sizeMul: 1.35, speed: .85, pcritMul: .9 },
  { id: "tiny", icon: "🐜", name: "Shrink-ray accident", desc: "A lab next door had a bad day. Everyone is tiny, fast and bouncy.", w: 1, sizeMul: .62, speed: 1.25, bounce: 2.4, crowdMul: 1.15 },
  { id: "bouncy", icon: "🎈", name: "Bouncy castle day", desc: "Everybody is made of rubber today: anything that touches them sends them into orbit.", w: 2, look(L) { L.springy = true; } },
  { id: "costumes", icon: "🎭", name: "Costume party", desc: "The flyer said 'fancy dress'. Every single person came as something.", w: 2, look(L) { L.cos = anyOutfit(); L.hs = 4; L.m = 0; L.cl = 0; } },
  { id: "grandmas", icon: "👵", name: "Grandma convention", desc: "Bingo night got moved here by mistake. Slow walkers, sharp elbows, lots of umbrellas.", w: 1, speed: .8, pcritMul: 1.15,
    look(L) { L.old = 1; L.ws = 5; L.hs = Math.random() < .5 ? 4 : 0; if (Math.random() < .35) L.acc = Math.random() < .5 ? 5 : 3; } },
  { id: "rollers", icon: "🛼", name: "Roller disco", desc: "The sponsor handed out roller skates at the door. Fast exits, spectacular wipeouts.", w: 1, speed: 1.2, look(L) { if (Math.random() < .7) L.gear = "skates"; } },
  { id: "props", icon: "🚁", name: "Propeller hat giveaway", desc: "Free propeller hats for everyone. Some of them actually work.", w: 1, look(L) { if (Math.random() < .7) L.gear = "propeller"; } },
  { id: "cowrain", icon: "🐄", name: "It's raining cows", desc: "Meteorologists can't explain it. Cows fall from the sky and bounce. Moo.", w: 2, events: ["vacas", "vacas", "vacas"],
    ev: { vacas() { for (let k = 0; k < 2; k++) later(k * .8, () => { const [x, y] = crowdPoint(); freePower("cow", x, y); }); caption("It's raining cows!", true, 1600); } } },
  { id: "meteors", icon: "☄️", name: "Meteor shower", desc: "Astronomers called it 'a light show'. They were wrong about the 'light' part.", w: 1, events: ["meteoros", "meteoros"],
    ev: { meteoros() { const [x, y] = crowdPoint(); freePower("meteor", x, y); caption("Meteor incoming!", true, 1600); } } },
  { id: "anvils", icon: "⚓", name: "Cartoon physics", desc: "Today the laws of physics come from Saturday morning TV. Watch out for anvils.", w: 1, events: ["yunques", "yunques"],
    ev: { yunques() { for (let k = 0; k < 3; k++) later(k * .5, () => { const [x, y] = crowdPoint(); freePower("anvil", x, y); }); caption("Anvils from the sky!", true, 1600); } } },
  { id: "bananas", icon: "🍌", name: "Banana truck spill", desc: "A banana truck tipped over at the entrance. The floor is now a comedy.", w: 1,
    start() { for (let k = 0; k < 12; k++) { const [x, y] = crowdPoint(); addMover({ kind: "peel", beh: "static", life: 1e9, x, y, r: .3, push: 0, air: true, h: 0, say: "", tick: m => {
      for (const a of ag) { if (a.air > 0 || (a.slipT || 0) > t) continue; if ((a.x - m.x) ** 2 + (a.y - m.y) ** 2 < 1.2) { a.slipT = t + 3; if (!(a.springy && yeet(a))) { toss(a, 1.3 + Math.random(), .8); a.airSpin = Math.random() < .5 ? -1.5 : 1.5; } } } } }); } } },
  { id: "outbreak", icon: "🧟", name: "Zombie outbreak", desc: "A few guests are… not well. Anyone they bump into turns green and starts shambling.", w: 1,
    start() { MOD.zt = 0; }, step() {
      if (phase !== "show") return; MOD.zt = (MOD.zt || 0) - DT; if (MOD.zt > 0) return; MOD.zt = .25;
      const zid = OUTFIT_ID.zombie, zs = ag.filter(a => a.cos === zid);
      if (zs.length < 12 && fullAt === 0 && ag.length > 200) { const a = ag[(Math.random() * ag.length) | 0]; a.cos = zid; a.hs = 4; a.v0 *= .8; }
      const cells = new Set(zs.map(z => ((z.x | 0) << 8) | (z.y | 0)));   // every square metre with a zombie in it
      let bitten = 0;
      for (const b of ag) if (b.cos !== zid && cells.has(((b.x | 0) << 8) | (b.y | 0)) && Math.random() < .1 && bitten < 7) {
        bitten++; b.cos = zid; b.hs = 4; b.v0 *= .8; if (Math.random() < .08) pop(b.x, b.y - 1, ["BRAAAINS!", "I FEEL FUNNY", "GRAAAH!", "WHY IS MY ARM GREEN?"][(Math.random() * 4) | 0]);
      }
    } },
  { id: "aliens", icon: "🛸", name: "Alien tourists", desc: "A UFO is parked above the venue. It keeps beaming people up for 'selfies'.", w: 1, events: ["ovni:abduccion", "ovni:abduccion"] },
  { id: "dragon", icon: "🐉", name: "A dragon RSVP'd", desc: "Nobody remembers inviting it. It sneezes fire when excited, and it is very excited.", w: 1, events: ["circo:dragon", "circo:dragon"] },
  { id: "pirates", icon: "🏴‍☠️", name: "Pirate invasion", desc: "Pirates heard there was a party. They brought cannons. Arrr.", w: 1, events: ["crucero:piratas", "crucero:piratas"] },
  { id: "clones", icon: "👯", name: "Clone day", desc: "The cloning machine was left on overnight. More of everyone, everywhere.", w: 1, crowdMul: 1.1, events: ["laboratorio:clones", "laboratorio:clones"] },
  { id: "heat", icon: "🥵", name: "Heatwave", desc: "41 °C in the shade. Everyone is slow, sweaty and fainting at the slightest squeeze.", w: 1, speed: .85, pcritMul: .85 },
  { id: "disco", icon: "🪩", name: "Disco inferno", desc: "The DJ refuses to stop dropping the beat. Every drop, everybody jumps.", w: 1, dropMul: .35, bounce: 2.2 },
);
const MODS_BY_ID = Object.fromEntries(MODS.map(m => [m.id, m]));
// in chaos mode two of today's twists are combined
function comboMod(a, b) {
  if (a.id === "normal") return b; if (b.id === "normal" || a.id === b.id) return a;
  const prod = k => (a[k] || 1) * (b[k] || 1);
  return { id: a.id + "+" + b.id, name: `${a.name} + ${b.name}`, desc: `${a.desc} Also: ${b.desc.charAt(0).toLowerCase() + b.desc.slice(1)}`,
    speed: prod("speed"), pcritMul: prod("pcritMul"), crowdMul: prod("crowdMul"), dropMul: prod("dropMul"), sizeMul: prod("sizeMul"), bounce: a.bounce || b.bounce, rain: a.rain || b.rain, uniform: a.uniform || b.uniform,
    altShare: Math.max(a.altShare || 0, b.altShare || 0) || undefined, events: (a.events || []).concat(b.events || []), ev: { ...(a.ev || {}), ...(b.ev || {}) },
    look: a.look || b.look ? L => { if (a.look) a.look(L); if (b.look) b.look(L); } : undefined,
    step: a.step || b.step ? () => { if (a.step) a.step(); if (b.step) b.step(); } : undefined,
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
  // a slot machine: the reel spins past every twist and clunks onto today's one
  const ICON = { normal: "☕", wifi: "📶", influencer: "🤳", rain: "🌧️", reggaeton: "💃", moon: "🌙", rush: "🎟️", slowmo: "🐌", chanclas: "🩴", pigeons: "🐦", apagon: "💡", nino: "🧒", uniforme: "👕", tio: "🕺" };
  const COLS = ["#ff6fb1", "#ffd23a", "#4fb8ff", "#7dff6a", "#a98bff", "#ff9a3c"];
  const cell = (m, i) => `<div class="rcell" style="--c:${COLS[i % COLS.length]}"><i>${ICON[m.id] || m.icon || "🎲"}</i><b>${m.name}</b></div>`;
  const other = () => { let m; do m = MODS[(Math.random() * MODS.length) | 0]; while (m.id === pick.id && MODS.length > 1); return m; };
  const strip = []; for (let i = 0; i < 26; i++) strip.push(other());
  strip.push(pick, other());
  showCard(`<div class="roulette slot">
      <div class="bulbs">${Array.from({ length: 18 }, (_, i) => `<span style="animation-delay:${(i * .06).toFixed(2)}s"></span>`).join("")}</div>
      <small>Today's twist</small>
      <div class="reelbox"><div class="reel" id="reel">${[MODS[0]].concat(strip).map(cell).join("")}</div><div class="payline"></div></div>
      <div class="lever" id="lever"><span></span></div>
      <h2 id="rl">&nbsp;</h2><p id="rld">&nbsp;</p><div class="rconf" id="rconf"></div>
    </div>`, "twist");
  let done = false, k = 0;
  const reel = $("#reel"), CH = 64, target = (strip.length - 2) * CH;   // land the pick on the payline (second visible row)
  requestAnimationFrame(() => { reel.style.transition = "transform 1.9s cubic-bezier(.12,.75,.18,1.04)"; reel.style.transform = `translateY(${-target}px)`; $("#lever").classList.add("pulled"); });
  const tick = setInterval(() => { k++; sfx("tick"); }, 85);
  const go = () => { if (done) return; done = true; clearInterval(tick); hideCard(); start(pick); showModChip(pick); };
  setTimeout(() => {
    clearInterval(tick); sfx("cheer");
    $("#rl").innerHTML = `<span class="stamp">${ICON[pick.id] || pick.icon || "🎲"} ${pick.name}</span>`; $("#rld").textContent = pick.desc;
    $("#rconf").innerHTML = Array.from({ length: 26 }, (_, i) => `<i style="left:${(Math.random() * 100).toFixed(1)}%;background:${COLS[i % COLS.length]};animation-delay:${(Math.random() * .3).toFixed(2)}s;--dx:${((Math.random() - .5) * 160).toFixed(0)}px"></i>`).join("");
    document.querySelector(".roulette.slot").classList.add("won");
  }, 2050);
  setTimeout(go, 4300);
  $("#card").onclick = () => { if (k > 8) go(); };
}
function showModChip(m) {
  const el = $("#mod");
  if (!m || m.id === "normal") { el.hidden = true; return; }
  el.hidden = false; el.textContent = m.name;
}
