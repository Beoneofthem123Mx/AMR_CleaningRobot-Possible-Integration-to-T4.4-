// Human Tsunami · world, obstacles and utilities
const $ = s => document.querySelector(s);
const cv = $("#cv"), ov = $("#ov"), octx = ov.getContext("2d");
// ===== World (meters) =====
const WW = 40, WH = 72, SH = 78, CS = .5, GW = WW / CS, GH = SH / CS;  // SH: the street continues off-frame
const R = .24, DT = 1 / 60;
let PCRIT = 8.5;
let CROWD = 3200, FENCE_BUDGET = 60, MAX_GATES = 5;
const SHOW_TIME = 45;
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
  stewards: { icon: "S+", name: "Steward agency deal", desc: "+3 stewards available in every venue, per level", costs: [80, 180, 360] },
  chaos:   { icon: "☄", name: "Chaos kit",            desc: "+1 meteor, bowling ball, anvil, cow and banana per show, per level", costs: [70, 170, 350] },
};
// crowd gear: things the audience wears. Equip up to 3; about 20% of people show up wearing each one. Every item helps AND hurts.
const GEAR = {
  helmet:    { icon: "⛑", name: "Hard hats",        cost: 120, good: "Wearers take 25% less squeeze damage", bad: "...and walk 10% slower" },
  bubble:    { icon: "◎", name: "Bubble wrap suits", cost: 160, good: "Wearers take 30% less damage", bad: "...but anything that hits them sends them into orbit" },
  skates:    { icon: "⛸", name: "Roller skates",     cost: 140, good: "Wearers leave 30% faster when the show ends", bad: "...and wipe out randomly on the way" },
  propeller: { icon: "✣", name: "Propeller hats",    cost: 180, good: "Squeezed wearers can take off and hop out of the crush", bad: "...sometimes they take off for no reason at all" },
  glasses:   { icon: "◐", name: "3D glasses",        cost: 110, good: "+20% tickets after every show", bad: "...wearers wander around and bump into people" },
  cape:      { icon: "⚑", name: "Hero capes",        cost: 150, good: "Wearers run 20% faster to the exits", bad: "...and push 15% harder in the drops" },
  pockets:   { icon: "▤", name: "Cargo shorts",      cost: 130, good: "+1 charge of every chaos power", bad: "...the pockets are full: wearers 10% slower" },
  ducks:     { icon: "🦆", name: "Rubber duck rings", cost: 100, good: "Wearers bounce off each other: 20% less pressure", bad: "...and get stuck in doorways (slower at the gates)" },
};
// today's deals: three random offers that change every day
const DEALS = {
  mystery: { icon: "?", name: "Mystery box", desc: "A random piece of gear you don't have yet, or a pile of tickets" },
  meteors: { icon: "☄", name: "Meteor shower", desc: "Next show: +3 meteors" },
  lucky:   { icon: "✿", name: "Lucky hat", desc: "Next show: +50% tickets" },
  cows:    { icon: "🐄", name: "Cow delivery", desc: "Next show: +3 cows" },
  calm:    { icon: "))", name: "Spare batteries", desc: "Next show: +3 megaphone uses" },
  sale:    { icon: "%", name: "Gear clearance", desc: "A random piece of gear at 40% off" },
};
let GEAR_OWN = [], GEAR_ON = [], NEXT = {}, GADGETS_OWN = [];
// "This is definitely not a black market": overpowered stuff, paid in people the UFOs took (nobody asks where they went)
const BM_ITEMS = {
  beam:      { icon: "🛸", name: "Borrowed tractor beam", price: 60, desc: "Chaos power, 2 per show: beams everyone in a 3 m crush straight up and drops them somewhere roomy." },
  freeze:    { icon: "⏸", name: "Universal pause remote", price: 120, desc: "Chaos power, 1 per show: the whole crowd freezes for 4 seconds and the pressure drains away." },
  antigrav:  { icon: "🪐", name: "Anti-gravity button", price: 150, desc: "Chaos power, 1 per show: gravity switches off for a moment. Everyone floats, nobody is squeezed." },
  clones:    { icon: "👯", name: "Cloned stewards", price: 90, desc: "+5 stewards available in every venue. They all look exactly the same. Don't ask." },
  probe:     { icon: "🧠", name: "Calm probe", price: 200, desc: "Everybody takes 20% more squeezing before going down. Side effects: none (that we'll admit to)." },
  insurance: { icon: "👽", name: "Mothership insurance", price: 300, desc: "The first 20 people who would get pancaked each show are beamed up instead. They count as abducted." },
};
let BM = { own: [], spent: 0 };
const bm = k => !(typeof window !== "undefined" && window.__manual) && BM.own.includes(k);
const bmWallet = () => { try { const st = JSON.parse(localStorage.getItem("mh.stats") || "{}"); return Math.max(0, (st.abducted || 0) - BM.spent); } catch (e) { return 0; } };
const gadgetOpen = k => !PROP_TYPES[k] || !PROP_TYPES[k].gadget || (typeof sandbox !== "undefined" && sandbox) || (typeof window !== "undefined" && window.__unlockAll) || GADGETS_OWN.includes(k);
const gearOn = k => !(typeof window !== "undefined" && window.__manual) && GEAR_ON.includes(k);
let UPG = {}, TIX = 0, LAST_EARN = 0;
function loadShop() {
  try { UPG = JSON.parse(localStorage.getItem("mh.upg") || "{}") || {}; TIX = +(localStorage.getItem("mh.tix") || 0) || 0; } catch (e) { UPG = {}; TIX = 0; }
  try { const g = JSON.parse(localStorage.getItem("mh.gear") || "{}") || {}; GEAR_OWN = (g.own || []).filter(k => GEAR[k]); GADGETS_OWN = g.gadgets || []; BM = Object.assign({ own: [], spent: 0 }, g.bm || {}); GEAR_ON = (g.on || []).filter(k => GEAR_OWN.includes(k)).slice(0, 3); NEXT = g.next || {}; } catch (e) { GEAR_OWN = []; GEAR_ON = []; NEXT = {}; }
}
function saveShop() { try { localStorage.setItem("mh.upg", JSON.stringify(UPG)); localStorage.setItem("mh.tix", String(TIX)); localStorage.setItem("mh.gear", JSON.stringify({ own: GEAR_OWN, on: GEAR_ON, next: NEXT, gadgets: GADGETS_OWN, bm: BM })); } catch (e) { /* no storage */ } }
// the deals of the day: seeded by the date, so they change at midnight and survive restarts
function todaysDeals() {
  const d = new Date(), seed = d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate(); let x = seed;
  const r = () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
  const keys = Object.keys(DEALS).sort(() => r() - .5).slice(0, 3), spare = Object.keys(GEAR).filter(k => !GEAR_OWN.includes(k));
  return keys.map((k, i) => ({ k, id: seed + ":" + i, cost: k === "mystery" ? 90 : k === "sale" ? 0 : 35 + Math.round(r() * 30), gear: k === "sale" && spare.length ? spare[Math.floor(r() * spare.length)] : null })).filter(o => o.k !== "sale" || o.gear);
}
const upg = k => (typeof window !== "undefined" && window.__manual) ? 0 : (UPG[k] || 0);   // recordings and tests play without upgrades
const MEGA_R = () => 5.5 * (1 + .2 * upg("loud"));
loadShop();
let SLOT_XS = null, SLOT_BAD = [];
// today's route: side (-1/+1) puts the way out on a side wall between ey0 and ey1; b moves the show to a B-stage at (bx, by) halfway through
let ROUTE = { side: 0, ey0: 0, ey1: 0, b: false, bx: 0, by: 0, done: false };
const slotX = i => SLOT_XS ? SLOT_XS[i] : WW * (i + .5) / SLOTS;
// gate sizes: gates[i] is false (closed), true/1 (normal), .7 (narrow) or 1.45 (wide)
const GATE_SIZES = { narrow: { k: .7, name: "Narrow gate", cost: 0, desc: "Slows the crowd at the entrance, but also at the exit" }, normal: { k: 1, name: "Normal gate", cost: 0, desc: "The standard size" }, wide: { k: 1.45, name: "Wide gate", cost: 60, desc: "Lets everyone in and out much faster. $60 from the budget" } };
let gateSize = "normal";
// big open venues: far more people, so the camera can't get as close (fewer details to draw up close)
const BIG_VENUES = { plaza: 1, estadio: 1, ciudad: 1, marcha: 1, mitin: 1, guerra: 1, hipodromo: 1, beach: 1, park: 1, aeropuerto: 1, procesion: 1 };
const isBig = () => typeof sceneKey !== "undefined" && !!BIG_VENUES[sceneKey];
const BIG_CROWD = 1.65, CAM_FREE = () => typeof window !== "undefined" && window.__manual;
const ZMAX = () => CAM_FREE() ? 5 : isBig() ? 1.85 : 3.4, CINE_MIN = () => CAM_FREE() ? 4 : isBig() ? 14 : 7;
const gateK = i => gates[i] === true ? 1 : +gates[i] || 1, gateW = i => SLOT_W * gateK(i);
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
  // gadgets: unlocked once in the shop (tickets), then placed during planning like any prop
  megatower: { gadget: 200, name: "Megaphone tower", cost: 90, col: "#ffd23a", r: .5, desc: "A megaphone on a pole that yells CALM DOWN by itself every few seconds (6.5 m)." },
  pills:     { gadget: 260, name: "Chill-pill turret", cost: 110, col: "#ff6fb1", r: .5, desc: "Shoots calming pills at the most squeezed person within 8 m. Pew. Ahh." },
  bouncy:    { gadget: 150, name: "Bouncy castle", cost: 80, col: "#a98bff", r: 1.4, desc: "A soft inflatable wall: people bounce off it instead of getting crushed against it." },
  hotdogs:   { gadget: 180, name: "Hot-dog cannon", cost: 70, col: "#ff9a3c", r: .5, desc: "Fires free hot dogs at the emptiest spot in the venue: part of the crowd runs after them." },
  fan:       { gadget: 120, name: "Giant fan", cost: 60, col: "#4fb8ff", r: .6, desc: "Blows the crowd gently toward the gates (7 m in front of it)." },
  tubeman:   { gadget: 100, name: "Inflatable tube man", cost: 50, col: "#7ac943", r: .4, desc: "So hypnotic that people around it (4 m) slow down to stare." },
  trampoline: { gadget: 240, name: "Exit trampoline", cost: 100, col: "#22d3ee", r: .9, desc: "When the show ends, anyone who steps on it is launched toward the nearest open gate." },
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
