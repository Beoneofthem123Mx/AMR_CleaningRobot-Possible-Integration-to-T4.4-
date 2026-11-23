// Human Tsunami · easter eggs: every venue hides one small satirical object. Double-click it to find it.
// Each one is a secret achievement (sent to Steam as SECRET_EGG_<VENUE>), listed in the Secrets screen.
const EGGS = {
  plaza:       ["sign", "#ffd23a", "Safety Theatre", "A 'Wet floor' sign in a bone-dry plaza. It has been here since 2009. It is load-bearing now."],
  circo:       ["box", "#d8322b", "Clown Car Parking Ticket", "The clown car got a parking ticket. 47 clowns are appealing it, one at a time."],
  estadio:     ["screen", "#4fb8ff", "VAR Check", "The video referee is watching cat videos. The decision will take a further eight minutes."],
  viernes:     ["box", "#f4f4f0", "Receipt Mountain", "A single receipt, three metres long, for one pair of socks."],
  crucero:     ["box", "#ff9a3c", "Shareholders First", "A lifeboat with a sign: RESERVED FOR SHAREHOLDERS. It has a minibar."],
  boda:        ["box", "#ff6fb1", "The Seventh Toaster", "Gift number seven is also a toaster. The couple now owns more toasters than forks."],
  hipodromo:   ["figure", "#8a5a2b", "Insider Trading", "A horse reading the betting odds. It has bet on itself to lose."],
  trono:       ["bin", "#e8b631", "Luxury, Out of Order", "A solid gold toilet with an OUT OF ORDER sign. Very exclusive."],
  ciudad:      ["scooter", "#7ac943", "Last-Mile Mobility", "A rental e-scooter stuck in a tree. It is still charging you by the minute."],
  mitin:       ["bin", "#2f7fd6", "Promises, Recycled", "A recycling bin full of campaign promises. Most of them were already recycled once."],
  taco:        ["sign", "#7ac943", "Guac Is Extra", "A sign: GUACAMOLE IS EXTRA. Under it, smaller: SO IS THE TACO."],
  ovni:        ["figure", "#9fe0ff", "Rate Your Abduction", "An alien handing out satisfaction surveys. Please rate your abduction from 1 to 5 probes."],
  aeropuerto:  ["bin", "#4fb8ff", "The 100 ml Rule", "A bin of confiscated water bottles. On the other side, water for sale at 9 dollars."],
  arena:       ["figure", "#d8322b", "Tax Season", "A masked wrestler doing his taxes. Folding chairs are not deductible."],
  rocket:      ["box", "#c9ced4", "Plan B(illionaire)", "A spare rocket labelled PLAN B. It only has one seat."],
  zoo:         ["duck", "#2b2d33", "Influencer Penguin", "A penguin with a selfie stick. It has more followers than the zoo."],
  cheese:      ["box", "#fff2c0", "The Saddest Cheese", "A wheel of lactose-free, fat-free, flavour-free cheese. Nobody has touched it."],
  zombie:      ["figure", "#7ac943", "Undead Job Market", "A zombie with an OPEN TO WORK badge. Ten years of experience in brains."],
  beach:       ["sign", "#ff6fb1", "Beachfront Property", "A sandcastle with a SOLD sign. The developer promises luxury condos by high tide."],
  park:        ["sign", "#a98bff", "Fast Pass to a Bench", "A queue sign: WAIT FROM HERE: 9 HOURS. For a bench."],
  nuclear:     ["duck", "#ffd23a", "Radioactive Duck", "A rubber duck in a tiny hazmat suit. It glows a little. It is fine. Probably."],
  guerra:      ["duck", "#f4f4f0", "Armed Dove", "A dove of peace wearing a helmet. It has seen things."],
  fabrica:     ["screen", "#ffd23a", "Employee of the Month", "EMPLOYEE OF THE MONTH: Robot Arm #3. For the 40th month in a row."],
  procesion:   ["box", "#f4f1ea", "Blessed Wi-Fi", "A Wi-Fi router with a halo. Password: AMEN. Five bars, guaranteed."],
  marcha:      ["sign", "#d8322b", "Meta Protest", "A lone protester with a sign: WE DEMAND FEWER SIGNS."],
  metro:       ["screen", "#ff9a3c", "Arriving Soon™", "The departures board says NEXT TRAIN: SOON. It has said that since Tuesday."],
  mercado:     ["box", "#2f7fd6", "Totally Original", "A stall selling Adibas, Nikey and Gucchi. All 100% authentic, says the vendor, winking."],
  laboratorio: ["bin", "#7dff6a", "Do Not Drink", "A coffee mug labelled NOT A SAMPLE. It is bubbling. Someone drank half."],
  terminal:    ["sign", "#ffd23a", "Schedule Valid Since 1987", "A bus timetable printed in 1987. It is still the most accurate thing in the terminal."],
  cocina:      ["box", "#ff6fb1", "Kevin's Diet Plan", "A sticky note on the floor: 'NO MORE CAKE AFTER MIDNIGHT. — Kevin'. The cake is on the floor. It is past midnight."],
};
for (const [k, e] of Object.entries(EGGS)) SECRETS["EGG_" + k.toUpperCase()] = { icon: "🥚", name: e[2], desc: e[3], hint: `Something odd is hiding in ${SCENES[k] ? SCENES[k].name : k}. Double-click it.`, egg: true };
const EGG_POS = {};
// a fixed spot per venue, near the side walls, where people walk but nothing important is
function eggPos() {
  if (!EGGS[sceneKey] || !blockedC) return null;
  if (EGG_POS[sceneKey]) return EGG_POS[sceneKey];
  let seed = 7; for (const ch of sceneKey) seed = seed * 31 + ch.charCodeAt(0); const r = rng(seed % 100000);
  for (let k = 0; k < 300; k++) {
    const side = r() < .5, x = side ? 1.2 + r() * 2.2 : WW - 1.2 - r() * 2.2, y = 12 + r() * Math.max(4, FENCE_Y - 18), c = cellOf(x, y);
    if (blockedC[c] || !isFinite(fStage[c])) continue;
    return (EGG_POS[sceneKey] = { x, y });
  }
  return (EGG_POS[sceneKey] = { x: 2, y: FENCE_Y - 6 });
}
// the small object itself (built with the rest of the venue)
function eggs3D(grp) {
  const p = eggPos(); if (!p) return; const [shape, col] = EGGS[sceneKey], g = pivot(grp, p.x, 0, p.y); g.rotation.y = Math.PI / 2 * ((p.x * 7 | 0) % 4);
  if (shape === "sign") { part(g, "cyl", "#8a8f99", .04, 1.1, .04, 0, .55, 0); part(g, "box", col, .05, .55, .75, 0, 1.15, 0); part(g, "box", "#111214", .06, .08, .5, 0, 1.2, 0); }
  else if (shape === "box") { part(g, "box", col, .55, .45, .55, 0, .23, 0); part(g, "box", "#d8322b", .57, .08, .12, 0, .3, 0); part(g, "box", "#d8322b", .12, .08, .57, 0, .3, 0); }
  else if (shape === "screen") { part(g, "cyl", "#2b2d33", .05, 1.2, .05, 0, .6, 0); part(g, "box", "#1b1d22", .1, .5, .8, 0, 1.35, 0); part(g, "box", basic(col), .11, .4, .7, 0, 1.35, 0); }
  else if (shape === "bin") { part(g, "cyl", col, .28, .6, .28, 0, .3, 0); part(g, "cyl", "#2b2d33", .3, .06, .3, 0, .62, 0); }
  else if (shape === "scooter") { part(g, "box", col, .9, .08, .22, 0, .12, 0); part(g, "cyl", "#2b2d33", .03, .9, .03, .4, .55, 0); part(g, "box", "#2b2d33", .05, .05, .45, .4, 1, 0); }
  else if (shape === "duck") { part(g, "sph", col, .32, .26, .26, 0, .26, 0); part(g, "sph", col, .17, .17, .17, .2, .55, 0); part(g, "cone", "#ff9a3c", .07, .16, .07, .38, .55, 0).rotation.z = -Math.PI / 2; }
  else { part(g, "sph", col, .25, .45, .25, 0, .5, 0); part(g, "sph", col, .2, .2, .2, 0, 1.05, 0); for (const z of [-.08, .08]) part(g, "sph", "#111214", .04, .04, .04, .17, 1.1, z); }
}
// a little glint now and then, the only hint
let eggT = 3;
function eggTick(dt) {
  const p = eggPos(); if (!p || demo) return;
  eggT -= dt; if (eggT > 0) return; eggT = 6 + Math.random() * 5;
  if (typeof sparks !== "undefined") for (let k = 0; k < 6; k++) sparks.push({ x: p.x + (Math.random() - .5) * .3, y: p.y + (Math.random() - .5) * .3, h: .9 + Math.random() * .5, vx: (Math.random() - .5) * 1.2, vy: (Math.random() - .5) * 1.2, vh: 1 + Math.random(), life: .6, col: "#fff2a8" });
}
function eggClick(x, y) {
  const p = eggPos(); if (!p || (x - p.x) ** 2 + (y - p.y) ** 2 > 2.2) return false;
  const e = EGGS[sceneKey]; pop(p.x, p.y - 1.4, "🥚 " + e[2].toUpperCase() + "!"); caption(e[3], true, 4200); sfx("jingle");
  if (typeof burstAt === "function") burstAt(p.x, p.y, 40);
  unlockSecret("EGG_" + sceneKey.toUpperCase()); return true;
}
document.querySelector("#cv").addEventListener("dblclick", ev => { if (typeof toWorld !== "function") return; const [x, y] = toWorld(ev); eggClick(x, y); });
