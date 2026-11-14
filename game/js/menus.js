// Human Tsunami · title screen, venue picker and the next morning's newspaper
const pick = arr => arr[(Math.random() * arr.length) | 0];
const fill = (tpl, v) => tpl.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "");

// ---------- thumbnails of each venue (drawn once with its own floor) ----------
const THUMBS = {};
function sceneThumb(key) {
  if (THUMBS[key]) return THUMBS[key];
  const save = { obs, scene, gates, fences, guards };
  try {
    scene = SCENES[key]; gates = scene.gates.slice(); fences = []; guards = []; obs = [];
    seg(0, 0, 0, SH, .2, "edge"); seg(WW, 0, WW, SH, .2, "edge"); seg(0, 0, WW, 0, .2, "edge");
    scene.build();
    const big = buildStatic(), c = document.createElement("canvas");
    c.width = 288; c.height = 160; const g = c.getContext("2d");
    // the venue is rotated so the thumbnail is landscape, like on PC
    g.translate(288, 0); g.rotate(Math.PI / 2);
    g.drawImage(big, 0, 0, big.width, WH * TEXS, 0, 0, 160, 288);
    THUMBS[key] = c.toDataURL("image/jpeg", .8);
  } catch (e) { THUMBS[key] = ""; }
  ({ obs, scene, gates, fences, guards } = save);
  return THUMBS[key];
}

// ---------- title screen and venue picker ----------
let atTitle = false;
// the first thing you see: the logo over the live demo, START and the rest
function titleScreen() {
  if ((phase === "show" || phase === "evac") && !demo) return;
  atTitle = true;
  const total = totalStars(), max = realKeys().length * 3;
  showCard(`<div class="titlewrap">
      <div class="splat"></div>
      <h1 class="logo biglogo">${["HUMAN", "TSUNAMI"].map((w, j) => [...w].map((ch, i) => `<span class="lt" style="animation-delay:${((i + j * 5) * .09).toFixed(2)}s">${ch}</span>`).join("")).join("<br>")}</h1>
      <p class="tag">A safety simulator for events that go horribly wrong</p>
      <div class="titlebtns">
        <button class="go big" id="start">▶ START</button>
        ${(() => { const d = dailyPick(), b = dailyBest(), sc = SCENES[d.key], m = MODS_BY_ID[d.mod];
          return `<button id="daily" class="daily">📅 Daily challenge<small>${sc.name} + ${m.name}${b.dead !== undefined ? ` · your best today: ${b.dead.toLocaleString("en")} pancaked${b.stars === 3 ? " ★★★" : ""}` : " · +100 tickets for 3 stars"}</small></button>`; })()}
        ${(() => { const b = tourBest(); return `<button id="tour" class="tourb">🌍 World Tour<small>${b.score !== undefined ? `Best score ${b.score.toLocaleString("en")}` : "5 shows in a row, perks, no retries"}</small></button>`; })()}
        <div class="tsmall"><button id="shop">Shop <span class="tix">${TIX.toLocaleString("en")}</span></button>
        <button id="customs">🛠 Editor</button>
        <button id="options">Settings</button>
        ${window.steam ? '<button id="quit">Quit</button>' : ""}</div>
      </div>
      <p class="starline"><span class="starbig">★ ${total}</span> / ${max} stars · ${realKeys().length} venues</p>
    </div>`, "menu title");
}
function chooser() {
  if ((phase === "show" || phase === "evac") && !demo) return;
  atTitle = false;
  const best = loadBest(), total = totalStars(), max = realKeys().length * 3, medals = loadMedals(), st = loadStats();
  const nMedals = Object.values(medals).reduce((n, m) => n + m.length, 0), maxMedals = realKeys().length * Object.keys(MEDALS).length;
  showCard(`<div class="menuhead">
      <div class="title"><h1 class="logo">${["HUMAN", "TSUNAMI"].map((w, j) => [...w].map((ch, i) => `<span class="lt" style="animation-delay:${((i + j * 5) * .09).toFixed(2)}s">${ch}</span>`).join("")).join("<br>")}</h1></div>
      <div class="menuintro">
        <p class="tag">A safety simulator for events that go horribly wrong</p>
        <div class="row chaosrow"><button id="chaos" class="${chaosMode ? "go" : ""}">Total Chaos: ${chaosMode ? "ON" : "off"}</button><small>Events from every venue anywhere, plus two of today's twists at once.</small></div>
        <div class="row chaosrow"><button id="sandbox" class="${sandbox ? "go" : ""}">Sandbox: ${sandbox ? "ON" : "off"}</button><small>Every venue open, no budget, bigger crowds, and a button for every disaster. Nothing counts.</small></div>
        <p class="starline"><span class="starbig">★ ${total}</span> / ${max} stars · <span class="starbig medalcount">◆ ${nMedals}</span> / ${maxMedals} medals · stars unlock new venues</p>
        ${st.shows ? `<p class="career">Career: <b>${st.shows.toLocaleString("en")}</b> shows · <b>${st.trampled.toLocaleString("en")}</b> pancaked · <b>${st.saved.toLocaleString("en")}</b> got home fine · <b>${st.perfect}</b> flawless${st.abducted ? ` · <b>${st.abducted}</b> abducted` : ""} · worst day: <b>${st.worst.toLocaleString("en")}</b></p>` : ""}
      </div>
    </div>
    <div class="scenes">${Object.entries(SCENES).filter(([key, sc]) => !sc.hidden).map(([key, sc]) => {
      const b = best[key], open = isUnlocked(key);
      return `<button class="scene ${open ? "" : "locked"}" data-scene="${key}" ${open ? "" : "disabled"} title="${open ? sc.intro.replace(/"/g, "&quot;") : ""}">
        <span class="thumb"><img src="${sceneThumb(key)}" alt="">${open ? (b !== undefined ? `<em class="best">${"★".repeat(b)}${"☆".repeat(3 - b)}</em>` : `<em class="best new">NEW</em>`) : `<em class="lockbadge">LOCKED · ${sc.unlock} ★</em>`}</span>
        <span class="txt"><b>${sc.name}</b><span>${sc.tag}</span><small>${Math.min(5800, Math.round(sc.crowd * (BIG_VENUES[key] ? BIG_CROWD : 1))).toLocaleString("en")} people${BIG_VENUES[key] ? " · <b class=\"bigtag\">BIG VENUE</b>" : ""}</small>
        ${open ? `<span class="medals">${Object.entries(MEDALS).map(([m, d]) => `<i class="${(medals[key] || []).includes(m) ? "got" : ""}" title="${d.name}: ${d.desc}">${d.icon}</i>`).join("")}</span>` : ""}</span></button>`; }).join("")}</div>
    <div class="row"><button id="title">◀ Title</button><button id="secrets">🏆 Secrets ${loadSecrets().length}/10</button><button id="shop" class="go">Shop <span class="tix">${TIX.toLocaleString("en")}</span></button><button id="options">Options</button>${window.steam ? '<button id="fs">Full screen (F11)</button><button id="quit">Quit game</button>' : ""}</div>`, "menu");
  const b = $("#card .scene:not(:disabled)"); if (b) b.focus();
}

// ---------- upgrade shop ----------
let shopTab = "upg";
function showShop(tab) {
  loadShop(); if (tab) shopTab = tab;
  const tix = c => `<span class="tix">${c}</span>`, bought = NEXT.bought || [];
  let rows = "";
  if (shopTab === "upg") rows = Object.entries(UPGRADES).map(([k, u]) => {
    const lv = UPG[k] || 0, max = lv >= u.costs.length, cost = max ? 0 : u.costs[lv];
    return `<div class="upg"><i>${u.icon}</i><div><b>${u.name}</b><small>${u.desc}</small><span class="pips">${[0, 1, 2].map(n => `<em class="${n < lv ? "on" : ""}"></em>`).join("")}</span></div>
      <button data-buy="${k}" ${max || TIX < cost ? "disabled" : ""}>${max ? "MAX" : tix(cost)}</button></div>`;
  }).join("");
  else if (shopTab === "gear") rows = Object.entries(GEAR).map(([k, g]) => {
    const own = GEAR_OWN.includes(k), on = GEAR_ON.includes(k);
    return `<div class="upg${on ? " worn" : ""}"><i>${g.icon}</i><div><b>${g.name}</b><small class="good">+ ${g.good}</small><small class="bad">− ${g.bad}</small></div>
      ${own ? `<button data-wear="${k}" class="${on ? "go" : ""}" ${!on && GEAR_ON.length >= 3 ? "disabled" : ""}>${on ? "Worn" : "Wear"}</button>` : `<button data-gear="${k}" ${TIX < g.cost ? "disabled" : ""}>${tix(g.cost)}</button>`}</div>`;
  }).join("");
  else if (shopTab === "gadgets") rows = Object.entries(PROP_TYPES).filter(([k, p]) => p.gadget).map(([k, p]) => {
    const own = GADGETS_OWN.includes(k);
    return `<div class="upg${own ? " worn" : ""}"><i style="background:${p.col};color:#111214">◆</i><div><b>${p.name}</b><small>${p.desc}</small><small class="good">Place it with the Props tool · $${p.cost} from the budget</small></div>
      ${own ? `<button disabled>OWNED</button>` : `<button data-gadget="${k}" ${TIX < p.gadget ? "disabled" : ""}>${tix(p.gadget)}</button>`}</div>`;
  }).join("");
  else if (shopTab === "bm") rows = `<div class="bmhead">👽 <b>${bmWallet().toLocaleString("en")}</b> abducted people to trade · earned every time a UFO takes someone, in any venue</div>` + Object.entries(BM_ITEMS).map(([k, it]) => {
    const own = BM.own.includes(k);
    return `<div class="upg bmitem${own ? " worn" : ""}"><i>${it.icon}</i><div><b>${it.name}</b><small>${it.desc}</small></div>
      ${own ? `<button disabled>OWNED</button>` : `<button data-bm="${k}" ${bmWallet() < it.price ? "disabled" : ""}><span class="ab">👽 ${it.price}</span></button>`}</div>`;
  }).join("");
  else rows = todaysDeals().map(o => {
    const d = DEALS[o.k], got = bought.includes(o.id), g = o.gear && GEAR[o.gear], cost = g ? Math.round(g.cost * .6) : o.cost;
    return `<div class="upg deal"><i>${d.icon}</i><div><b>${g ? `${g.name} −40%` : d.name}</b><small>${g ? `${g.good} ${g.bad}` : d.desc}</small></div>
      <button data-deal="${o.id}" ${got || TIX < cost ? "disabled" : ""}>${got ? "SOLD" : tix(cost)}</button></div>`;
  }).join("") + `<p class="keys">New deals every day at midnight.${Object.keys(NEXT).filter(k => k !== "bought").length ? " Waiting for your next show: " + Object.entries(NEXT).filter(([k]) => k !== "bought").map(([k, v]) => ({ meteor: `+${v} meteors`, cow: `+${v} cows`, mega: `+${v} megaphone`, lucky: "lucky hat" })[k]).filter(Boolean).join(", ") + "." : ""}</p>`;
  const tabs = [["upg", "Upgrades"], ["gear", `Crowd gear <small>${GEAR_ON.length}/3 worn</small>`], ["gadgets", "Gadgets"], ["deals", "Today's deals"], ["bm", "This is definitely not a black market"]].map(([k, n]) => `<button data-tab="${k}" class="${shopTab === k ? "on" : ""}">${n}</button>`).join("");
  showCard(`<h2>${shopTab === "bm" ? "We don't exist" : "Shop"}</h2><p class="shopbal">You have <span class="tix big">${TIX.toLocaleString("en")}</span> tickets. Every show earns more: everyone who gets home, every star and every new medal pays.</p>
    <div class="row tabs">${tabs}</div>
    ${shopTab === "gear" ? `<p class="keys">Up to 3 pieces worn at once. About 1 in 5 people shows up wearing each one, in every venue.</p>` : ""}
    <div class="shop">${rows}</div><div class="row"><button class="go" id="pick">Back</button></div>`, "options shopcard" + (shopTab === "bm" ? " bmcard" : ""));
  const buy = c => { if (TIX < c) return false; TIX -= c; return true; };
  for (const b of document.querySelectorAll("[data-tab]")) b.onclick = ev => { ev.stopPropagation(); sfx("select"); showShop(b.dataset.tab); };
  for (const b of document.querySelectorAll("[data-buy]")) b.onclick = ev => {
    ev.stopPropagation(); const k = b.dataset.buy, u = UPGRADES[k], lv = UPG[k] || 0; if (lv >= u.costs.length || !buy(u.costs[lv])) return;
    UPG[k] = lv + 1; saveShop(); sfx("confirm"); showShop();
  };
  for (const b of document.querySelectorAll("[data-gear]")) b.onclick = ev => {
    ev.stopPropagation(); const k = b.dataset.gear; if (GEAR_OWN.includes(k) || !buy(GEAR[k].cost)) return;
    GEAR_OWN.push(k); if (GEAR_ON.length < 3) GEAR_ON.push(k); saveShop(); sfx("confirm"); showShop();
  };
  for (const b of document.querySelectorAll("[data-bm]")) b.onclick = ev => {
    ev.stopPropagation(); const k = b.dataset.bm, it = BM_ITEMS[k]; if (BM.own.includes(k) || bmWallet() < it.price) return;
    BM.spent += it.price; BM.own.push(k); saveShop(); sfx("confirm"); showShop(); toast(`${it.name}. Pleasure doing no business with you.`);
  };
  for (const b of document.querySelectorAll("[data-gadget]")) b.onclick = ev => {
    ev.stopPropagation(); const k = b.dataset.gadget; if (GADGETS_OWN.includes(k) || !buy(PROP_TYPES[k].gadget)) return;
    GADGETS_OWN.push(k); saveShop(); sfx("confirm"); showShop(); toast(`${PROP_TYPES[k].name} unlocked! Place it with the Props tool.`);
  };
  for (const b of document.querySelectorAll("[data-wear]")) b.onclick = ev => {
    ev.stopPropagation(); const k = b.dataset.wear; GEAR_ON = GEAR_ON.includes(k) ? GEAR_ON.filter(x => x !== k) : GEAR_ON.concat(k).slice(0, 3); saveShop(); sfx("select"); showShop();
  };
  for (const b of document.querySelectorAll("[data-deal]")) b.onclick = ev => {
    ev.stopPropagation(); const o = todaysDeals().find(d => d.id === b.dataset.deal); if (!o || (NEXT.bought || []).includes(o.id)) return;
    const cost = o.gear ? Math.round(GEAR[o.gear].cost * .6) : o.cost; if (!buy(cost)) return;
    NEXT.bought = (NEXT.bought || []).filter(id => id.split(":")[0] === o.id.split(":")[0]).concat(o.id);
    let msg = "";
    if (o.k === "sale") { GEAR_OWN.push(o.gear); if (GEAR_ON.length < 3) GEAR_ON.push(o.gear); msg = `${GEAR[o.gear].name}! Worn from the next show.`; }
    else if (o.k === "mystery") {
      const spare = Object.keys(GEAR).filter(k => !GEAR_OWN.includes(k));
      if (spare.length && Math.random() < .7) { const g = spare[(Math.random() * spare.length) | 0]; GEAR_OWN.push(g); if (GEAR_ON.length < 3) GEAR_ON.push(g); msg = `Mystery box: ${GEAR[g].name}!`; }
      else { const n = [40, 60, 90, 150, 250][(Math.random() * 5) | 0]; TIX += n; msg = `Mystery box: ${n} tickets!`; }
    } else if (o.k === "meteors") { NEXT.meteor = (NEXT.meteor || 0) + 3; msg = "+3 meteors next show."; }
    else if (o.k === "cows") { NEXT.cow = (NEXT.cow || 0) + 3; msg = "+3 cows next show."; }
    else if (o.k === "calm") { NEXT.mega = (NEXT.mega || 0) + 3; msg = "+3 megaphone uses next show."; }
    else if (o.k === "lucky") { NEXT.lucky = 1; msg = "Lucky hat on: +50% tickets next show."; }
    saveShop(); sfx("confirm"); showShop(); toast(msg);
  };
}
// ---------- options ----------
function showOptions() {
  const pct = v => Math.round(v * 100);
  showCard(`<h2>Options</h2>
    <label class="opt">Music <input type="range" id="volM" min="0" max="100" value="${pct(AU.musicVol)}"><span id="volMv">${pct(AU.musicVol)}%</span></label>
    <label class="opt">Sound effects <input type="range" id="volS" min="0" max="100" value="${pct(AU.sfxVol)}"><span id="volSv">${pct(AU.sfxVol)}%</span></label>
    <div class="row"><button id="optFx">Fancy effects: ${POST.on ? "on" : "off"}</button>${window.steam ? '<button id="fs">Full screen (F11)</button>' : ""}</div>
    <p class="keys">Glow, focus blur and contact shading. Turn them off if the game runs slowly (shortcut: G).</p>
    <div class="row"><button id="optCB">Colour-blind palette: ${CB ? "on" : "off"}</button></div>
    <p class="keys">Pressure colours from dark blue to yellow instead of green to red.</p>
    <div class="row"><button id="optShuffle">Moving entrances: ${shuffleGates ? "on" : "off"}</button></div>
    <p class="keys">On: the gates sit somewhere new every time you enter a venue. Off: fixed gates, and your plan is saved per venue.</p>
    <div class="row"><button id="howto">How to play</button><button id="optReset">Erase all progress</button></div>
    <div class="row"><button class="go" id="pick">Back</button></div>`, "options");
  $("#volM").oninput = e => { setVolume("m", e.target.value / 100); $("#volMv").textContent = e.target.value + "%"; };
  $("#volS").oninput = e => { setVolume("s", e.target.value / 100); $("#volSv").textContent = e.target.value + "%"; sfx("tick"); };
  $("#optFx").onclick = () => { POST.on = !POST.on; try { localStorage.setItem("mh.fx", POST.on ? "on" : "off"); } catch (er) { /* no storage */ } $("#optFx").textContent = "Fancy effects: " + (POST.on ? "on" : "off"); };
  $("#optCB").onclick = () => { CB = !CB; try { localStorage.setItem("mh.cb", CB ? "on" : "off"); } catch (er) { /* no storage */ } applyCB(); staticDirty = true; $("#optCB").textContent = "Colour-blind palette: " + (CB ? "on" : "off"); };
  $("#optShuffle").onclick = () => { shuffleGates = !shuffleGates; try { localStorage.setItem("mh.shuffle", shuffleGates ? "on" : "off"); } catch (er) { /* no storage */ } $("#optShuffle").textContent = "Moving entrances: " + (shuffleGates ? "on" : "off"); };
  let armed = false;
  $("#optReset").onclick = () => {
    if (!armed) { armed = true; $("#optReset").textContent = "Really? Click again to erase stars, medals, stats and plans"; return; }
    try { Object.keys(localStorage).filter(k => k.startsWith("mh.") && !["mh.vol", "mh.sound", "mh.fx", "mh.cb"].includes(k)).forEach(k => localStorage.removeItem(k)); } catch (er) { /* no storage */ }
    sandbox = false; chaosMode = false; loadScene("plaza"); startDemo(); chooser();
  };
}
function showHowTo() {
  showCard(`<h2>How to play</h2>
    <ol class="howto">
      <li><b>Plan.</b> Drag to draw fences (straight, freehand or prefab shapes), open or close gates at the bottom, place guards, stewards and props. The orange trails show where people will walk, red glows mark where they will pile up, and each exit says how busy it will get.</li>
      <li><b>Open the gates.</b> A random twist is drawn, the crowd pours in and heads for the show.</li>
      <li><b>Survive the show.</b> Animals, vehicles and worse will cross the crowd. Click to shout through the megaphone (3 uses): people calm down and step back.</li>
      <li><b>Everybody out.</b> When the show ends they all leave through the same gates. Most disasters happen here.</li>
    </ol>
    <p><b>Pressure</b> is what hurts people: watch the pressure view (H). Red means someone is about to go down. Narrow gaps, dead ends and too few gates are the usual suspects.</p>
    <p><b>An empty plan always fails.</b> With no fences, guards or props nobody is in charge: the crowd shoves harder, goes down sooner, and the show gets zero stars no matter what.</p>
    <p class="keys">Keys: 1–5 tools · Space start · H pressure · C camera · X street camera · V speed · P pause · Ctrl+Z undo · <b>O photo mode</b> (no HUD, everything frozen).</p>
    <p><b>Zero pancaked</b> earns three stars. Stars unlock venues. Each venue also has five optional medals.</p>
    <div class="row"><button class="go" id="pick">Got it</button></div>`, "options");
}
// button labels for the sandbox's disaster buttons
const EVENT_NAMES = { reversa: "Float reverses", expreso: "Not in service", desvio: "Change of plan", camion: "Sound truck", lockdown: "Lockdown", cambio: "Platform change", car: "Lost driver", dogs: "Loose dogs", beachballs: "Beach balls", icecream: "Ice cream truck", lion: "Lion", elephants: "Elephants", clowncar: "Clown car", balls: "Circus balls",
  cannon: "Human cannonball", unicycles: "Unicycles", mascot: "Mascot", flares: "Flares", ola: "The wave", ball: "Giant ball", medic: "Medical cart", oferta: "Flash sale", carrito: "Runaway cart",
  abuela: "Grandma", tubeman: "Tube man", limpieza: "Floor scrubber", oleaje: "Big swell", gaviotas: "Seagulls", flamenco: "Inflatable flamingo", bocina: "Ship's horn", ramo: "Bouquet toss",
  pastel: "Rolling cake", dron: "Drone crash", mariachis: "Mariachis", suegra: "Mother-in-law", carrera: "Horse race", desbocado: "Runaway horse", tractor: "Tractor", inundacion: "Toilet flood",
  rollos: "Golden rolls", plomero: "Plumber", alcalde: "Mayor selfies", perfume: "Perfume cloud", fuegos: "Fireworks", taxi: "Taxi", carroza: "Parade float", policia: "Mounted police",
  promesas: "Campaign promise", tortas: "Free sandwiches", acarreados: "Bus of supporters", botargas: "Duck mascots", huevazo: "Egg throw", salsa: "Salsa spill", taquero: "Free tacos",
  chile: "Exploding chili", abduccion: "Abduction", vacas: "Cows", agentes: "Men in black", alien: "Alien selfies", idolo: "Pop idol", maletas: "Loose luggage", k9: "Security dog",
  retraso: "Flight delay", tope: "Suicide dive", sillazo: "Chair shots", mascara: "Mask toss", rudo: "The villain", chona: "Doña Chona", referi: "Referees", countdown: "Countdown",
  ceo: "The CEO", robodog: "Robot dogs", merch: "Hoodie cannon", booster: "Booster landing", robotaxi: "Robotaxi", nft: "Free NFTs", penguins: "Penguin parade", giraffe: "Giraffe",
  gorilla: "Gorilla", alpaca: "Kevin the alpaca", bananas: "Banana truck", hippo: "Hippo yawn", sneeze: "Panda sneeze", wheel: "Cheese wheels", goat: "Goat", tumble: "Tumblers",
  mayor: "Mayor's speech", fondue: "Fondue fountain", bluecheese: "Blue cheese", horde: "Zombie horde", hearse: "Hearse", pumpkin: "Giant pumpkin", fog: "Fog machine", candy: "Candy spill",
  vampire: "Vampire", werewolf: "Werewolf", shark: "Shark!", sunscreen: "Sunscreen spill", gulls: "Seagulls", whale: "Inflatable whale", lifeguard: "Lifeguard", jetski: "Jet ski",
  jingle: "Second truck", hug: "Mascot hugs", dinos: "Dino parade", coaster: "Coaster derails", teacup: "Runaway teacup", churros: "Free churros", fireworks: "Sideways fireworks", line: "The line starts here" };
// ---------- the next morning's newspaper ----------
const PLACE = { plaza: "THE PLAZA", circo: "THE CIRCUS", estadio: "THE STADIUM", crucero: "THE CRUISE", hipodromo: "THE RACETRACK", ciudad: "THE CITY",
  viernes: "THE MALL", boda: "THE WEDDING OF THE YEAR", trono: "THE GOLDEN BATHROOM", mitin: "THE DUCK RALLY", taco: "THE TACO FESTIVAL", ovni: "DON CHUY'S CORNFIELD", aeropuerto: "THE AIRPORT", arena: "THE ARENA", nuclear: "THE NUCLEAR PLANT", guerra: "THE OLD BATTLEFIELD",
  fabrica: "THE DUCK FACTORY", procesion: "THE PROCESSION", marcha: "THE MARCH", metro: "THE METRO", mercado: "THE MARKET", laboratorio: "THE SECRET LAB", terminal: "THE BUS TERMINAL" };
const HEADLINES = {
  lazy: [
    "ORGANIZER OF {P} PLACES ZERO FENCES, ZERO GUARDS, ZERO ANYTHING; {D} PANCAKED",
    "\u201cI THOUGHT THEY WOULD ORGANIZE THEMSELVES\u201d: {P} SAFETY PLAN WAS A BLANK SHEET OF PAPER",
    "{N} PEOPLE, ZERO BARRIERS: {P} LEARNS WHAT A CROWD DOES WHEN NOBODY IS IN CHARGE",
  ],
  perfect: [
    "MIRACLE AT {P}: {N} GO IN, {N} COME OUT AND EVERYONE COMPLAINS ABOUT THE BATHROOMS",
    "NOBODY HURT AT {P}; EXPERTS BEG IT NEVER HAPPEN AGAIN BECAUSE IT RUINS THE STATISTICS",
    "HEAD OF SECURITY ACHIEVES THE IMPOSSIBLE, ASKS FOR A RAISE; REQUEST DENIED",
    "INCIDENT-FREE EVENT BORES THE PRESS: “THERE'S NO STORY,” REPORTERS SOB",
  ],
  some: [
    "“NO INCIDENTS” AT {P}, SAYS ORGANIZER, WHO SAW NOTHING",
    "{D} PANCAKED AT {P}; AUTHORITIES PROMISE “MORE FENCES THAN EVER”",
    "“IT COULD HAVE BEEN WORSE,” SAYS ORGANIZER, AND HE'S TECHNICALLY RIGHT",
  ],
  bad: [
    "CHAOS AT {P}: {D} PANCAKED AND ORGANIZER FLEES ON A BICYCLE",
    "“IT WAS A TOTAL SUCCESS,” INSISTS MAN IN CHARGE FROM THE TOP OF A TREE",
    "{D} PANCAKED; HEAD OF SECURITY BLAMES “PHYSICS”",
    "{P} WAKES UP LITTERED WITH UNCLAIMED SNEAKERS",
  ],
};
const EVENT_LINES = {
  ropesnap: "A velvet rope snapped under the pressure; organizers insist it was “mostly decorative”.",
  fencesmash: "A vehicle flattened a barrier and kept going, as if barriers were a suggestion.",
  lion: "A lion toured the crowd and posed for selfies with several fans.",
  elephants: "Three elephants paraded in without a ticket.",
  cannon: "A human cannonball landed at the front of the popcorn line; he says that counts.",
  clowncar: "The clown car did laps with no license plates.",
  car: "A driver drove into the plaza “because the GPS said so.”",
  dogs: "Several dogs joined the event and were the only ones who could actually dance.",
  ola: "The wave went around the stadium three times and once around the parking lot.",
  flares: "There were flares; the smoke still hasn't cleared.",
  oleaje: "The ship tilted and half the audience ended up in the pool.",
  gaviotas: "The seagulls made off with 300 tortas.",
  desbocado: "A runaway horse charged through the crowd and won somebody a bet.",
  fuegos: "The fireworks scared three buildings.",
  carroza: "The parade float double-parked.",
  chancla: "It rained flip-flops; the moms declined to comment.",
  palomas: "The pigeons got away with all the popcorn.",
};
// what the newspaper says about each of today's twists
const MOD_LINES = {
  wifi: "A free router drew a bigger crowd than the main event.",
  influencer: "An influencer livestreamed the entire event; she says it was “super authentic.”",
  rain: "It poured and nobody brought an umbrella, but everybody brought a speaker.",
  reggaeton: "The DJ played reggaeton nonstop for two hours.",
  moon: "For reasons science cannot explain, gravity dropped by half.",
  rush: "25% more tickets were sold than people fit; the organizer called it “a success.”",
  slowmo: "The entire crowd walked in slow motion, like a nineties music video.",
  chanclas: "It rained flip-flops; the moms declined to comment.",
  pigeons: "The pigeons got away with all the popcorn.",
  apagon: "The power went out several times; the electric company blamed “a squirrel.”",
  nino: "It was Children's Day: thousands of kids got in and not a single one came with an adult.",
  uniforme: "Everyone wore the same T-shirt; three families went home with the wrong family.",
  tio: "Somebody's uncle danced all night and swore he knew the owner.",
};
const QUOTES = [
  "“We had everything under control,” said the head of security from a tree.",
  "“The fences were decorative,” the organizer clarified.",
  "“I only came for the wifi,” said one witness.",
  "“Next time I'm wearing a helmet,” promised one attendee.",
  "“I didn't see anything, I was filming for my stories,” admitted a young man.",
  "“This never happened in my day,” said a lady who saw everything.",
  "“I'd organize it again,” insisted the man in charge, now missing both shoes.",
];
function showReport(stars, stuck, fresh) {
  window.__lastReport = () => showReport(stars, stuck, fresh);
  const p = PLACE[sceneKey] || scene.place || scene.name.toUpperCase(), v = { P: p, N: CROWD.toLocaleString("en"), D: dead.toLocaleString("en") };
  const head = fill(pick(LAZY ? HEADLINES.lazy : stars === 3 ? HEADLINES.perfect : stars ? HEADLINES.some : HEADLINES.bad), v);
  const lines = [...new Set([...eventLog].map(k => (scene.lines && scene.lines[k]) || EVENT_LINES[k]).filter(Boolean))].sort(() => Math.random() - .5).slice(0, 2);
  if (MOD && MOD.id !== "normal") {
    const ml = MOD.id.split("+").map(k => MOD_LINES[k]).filter(Boolean);
    for (const l of (ml.length ? ml : [`Today's twist: ${MOD.name.toLowerCase()}. Nobody announced it.`])) if (!lines.includes(l)) lines.unshift(l);
  }
  if (abducted) lines.unshift(`${abducted} attendees were abducted. Their families hope things go better for them up there.`);
  const date = new Date().toLocaleDateString("en", { weekday: "long", day: "numeric", month: "long" });
  sfx(stars >= 2 ? "win" : "lose"); if (fresh && fresh.length) setTimeout(() => sfx("confirm"), 900);
  // stars pop in one by one; a perfect show rains confetti over the paper
  const confetti = stars === 3 ? `<div class="confetti" aria-hidden="true">${Array.from({ length: 46 }, (_, i) => `<i style="left:${(Math.random() * 100).toFixed(1)}%;background:${CONF[i % CONF.length]};animation-delay:${(Math.random() * 1.6).toFixed(2)}s;animation-duration:${(2.4 + Math.random() * 1.8).toFixed(2)}s"></i>`).join("")}</div>` : "";
  showCard(`${confetti}<div class="paper">
      ${sandbox ? `<div class="sandtag">SANDBOX · this never happened</div>` : ""}${TOUR ? `<div class="sandtag tourtag">WORLD TOUR · show ${TOUR.i + 1}/${TOUR.keys.length} · ${Math.max(0, tourLeft()).toLocaleString("en")} pancakes left</div>` : ""}
      <div class="mast"><span>THE DAILY GOSSIP</span><small>${date} · Special edition · $5</small></div>
      <h2 class="head">${head}</h2>
      ${G3.photo ? `<figure><img src="${G3.photo}" alt="Event photo"><figcaption>${scene.name}, yesterday. Photo: an attendee who never once put their phone down.</figcaption></figure>` : ""}
      <div class="cols">
        <div class="story"><p>${lines.join(" ")}</p><p class="quote">${pick(scene.quotes || QUOTES)}</p></div>
        <div class="box">
          <div class="stars">${[0, 1, 2].map(k => `<span class="${k < stars ? "pop" : "off"}" style="animation-delay:${(.5 + k * .28).toFixed(2)}s">★</span>`).join("")}</div>
          <div class="stats">
            <span>Crowd</span><span>${CROWD.toLocaleString("en")}</span>
            <span>Made it out OK</span><span>${evacuated.toLocaleString("en")}</span>
            <span>Pancaked</span><span style="color:var(--danger)">${dead.toLocaleString("en")}</span>
            ${abducted ? `<span>Abducted</span><span>${abducted}</span>` : ""}
            <span>Trapped</span><span>${stuck}</span>
            <span>Evacuation</span><span>${Math.round(evacT)} s</span>
          </div>
        </div>
      </div>
      ${LAST_EARN ? `<p class="earn">+<span class="tix">${LAST_EARN}</span> tickets for the upgrade shop</p>` : ""}
      ${stars < 3 && fallTip() ? `<p class="tip"><b>Safety inspector:</b> ${fallTip()}</p>` : ""}
      ${fresh && fresh.length ? `<div class="newmedals">${fresh.map(m => `<span class="medal got"><i>${MEDALS[m].icon}</i><b>New medal: ${MEDALS[m].name}</b><small>${MEDALS[m].desc}</small></span>`).join("")}</div>` : ""}
    </div>
    <div class="row">${TOUR ? tourButtons() : `<button class="go" id="retry">Adjust the plan</button>${dead > 0 ? '<button id="whyBtn">📊 What went wrong?</button>' : ""}<button id="again">Run it again</button><button id="pick">Change venue</button>`}</div>`, "report");
}
