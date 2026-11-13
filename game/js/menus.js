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
function chooser() {
  if ((phase === "show" || phase === "evac") && !demo) return;
  const best = loadBest(), total = totalStars(), max = Object.keys(SCENES).length * 3, medals = loadMedals(), st = loadStats();
  const nMedals = Object.values(medals).reduce((n, m) => n + m.length, 0), maxMedals = Object.keys(SCENES).length * Object.keys(MEDALS).length;
  showCard(`<div class="menuhead">
      <div class="title"><h1 class="logo">${["HUMAN", "TSUNAMI"].map((w, j) => [...w].map((ch, i) => `<span class="lt" style="animation-delay:${((i + j * 5) * .09).toFixed(2)}s">${ch}</span>`).join("")).join("<br>")}</h1></div>
      <div class="menuintro">
        <p class="tag">A safety simulator for events that go horribly wrong</p>
        <p>Place the fences, the gates and the guards. Then the people pour in and absolutely everything happens. During the show, <b>click</b> to use the megaphone. Too much pressure and people go down — and get trampled.</p>
        <div class="row chaosrow"><button id="chaos" class="${chaosMode ? "go" : ""}">Total Chaos: ${chaosMode ? "ON" : "off"}</button><small>Events from every venue anywhere, plus two of today's twists at once.</small></div>
        <div class="row chaosrow"><button id="sandbox" class="${sandbox ? "go" : ""}">Sandbox: ${sandbox ? "ON" : "off"}</button><small>Every venue open, no budget, bigger crowds, and a button for every disaster. Nothing counts.</small></div>
        <p class="starline"><span class="starbig">★ ${total}</span> / ${max} stars · <span class="starbig medalcount">◆ ${nMedals}</span> / ${maxMedals} medals · stars unlock new venues</p>
        ${st.shows ? `<p class="career">Career: <b>${st.shows.toLocaleString("en")}</b> shows · <b>${st.trampled.toLocaleString("en")}</b> trampled · <b>${st.saved.toLocaleString("en")}</b> got home fine · <b>${st.perfect}</b> flawless${st.abducted ? ` · <b>${st.abducted}</b> abducted` : ""} · worst day: <b>${st.worst.toLocaleString("en")}</b></p>` : ""}
      </div>
    </div>
    <div class="scenes">${Object.entries(SCENES).map(([key, sc]) => {
      const b = best[key], open = isUnlocked(key);
      return `<button class="scene ${open ? "" : "locked"}" data-scene="${key}" ${open ? "" : "disabled"} title="${open ? sc.intro.replace(/"/g, "&quot;") : ""}">
        <span class="thumb"><img src="${sceneThumb(key)}" alt="">${open ? (b !== undefined ? `<em class="best">${"★".repeat(b)}${"☆".repeat(3 - b)}</em>` : `<em class="best new">NEW</em>`) : `<em class="lockbadge">LOCKED · ${sc.unlock} ★</em>`}</span>
        <span class="txt"><b>${sc.name}</b><span>${sc.tag}</span><small>${sc.crowd.toLocaleString("en")} people</small>
        ${open ? `<span class="medals">${Object.entries(MEDALS).map(([m, d]) => `<i class="${(medals[key] || []).includes(m) ? "got" : ""}" title="${d.name}: ${d.desc}">${d.icon}</i>`).join("")}</span>` : ""}</span></button>`; }).join("")}</div>
    <p class="keys">Shortcuts: <b>1–5</b> tools (press again to switch fence/prop type) · <b>Space</b> opens gates · <b>H</b> pressure · <b>C</b> camera · <b>X</b> street view · <b>Wheel</b> zoom · <b>WASD</b>/right-drag pan · <b>V</b> speed · <b>M</b> sound · <b>G</b> effects · <b>Esc</b> pause</p>
    <div class="row"><button id="shop" class="go">Upgrade shop <span class="tix">${TIX.toLocaleString("en")}</span></button><button id="options">Options</button><button id="howto">How to play</button>${window.steam ? '<button id="fs">Full screen (F11)</button><button id="quit">Quit game</button>' : ""}</div>`, "menu");
  const b = $("#card .scene:not(:disabled)"); if (b) b.focus();
}

// ---------- upgrade shop ----------
function showShop() {
  loadShop();
  const rows = Object.entries(UPGRADES).map(([k, u]) => {
    const lv = UPG[k] || 0, max = lv >= u.costs.length, cost = max ? 0 : u.costs[lv];
    return `<div class="upg"><i>${u.icon}</i><div><b>${u.name}</b><small>${u.desc}</small><span class="pips">${[0, 1, 2].map(n => `<em class="${n < lv ? "on" : ""}"></em>`).join("")}</span></div>
      <button data-buy="${k}" ${max || TIX < cost ? "disabled" : ""}>${max ? "MAX" : `<span class="tix">${cost}</span>`}</button></div>`;
  }).join("");
  showCard(`<h2>Upgrade shop</h2><p class="shopbal">You have <span class="tix big">${TIX.toLocaleString("en")}</span> tickets. Every show earns more: everyone who gets home, every star and every new medal pays.</p>
    <div class="shop">${rows}</div><div class="row"><button class="go" id="pick">Back</button></div>`, "options shopcard");
  for (const b of document.querySelectorAll("[data-buy]")) b.onclick = ev => {
    ev.stopPropagation(); const k = b.dataset.buy, u = UPGRADES[k], lv = UPG[k] || 0; if (lv >= u.costs.length || TIX < u.costs[lv]) return;
    TIX -= u.costs[lv]; UPG[k] = lv + 1; saveShop(); sfx("confirm"); showShop();
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
    <div class="row"><button id="optShuffle">Moving entrances: ${shuffleGates ? "on" : "off"}</button></div>
    <p class="keys">On: the gates sit somewhere new every time you enter a venue. Off: fixed gates, and your plan is saved per venue.</p>
    <div class="row"><button id="optReset">Erase all progress</button></div>
    <div class="row"><button class="go" id="pick">Back</button></div>`, "options");
  $("#volM").oninput = e => { setVolume("m", e.target.value / 100); $("#volMv").textContent = e.target.value + "%"; };
  $("#volS").oninput = e => { setVolume("s", e.target.value / 100); $("#volSv").textContent = e.target.value + "%"; sfx("tick"); };
  $("#optFx").onclick = () => { POST.on = !POST.on; try { localStorage.setItem("mh.fx", POST.on ? "on" : "off"); } catch (er) { /* no storage */ } $("#optFx").textContent = "Fancy effects: " + (POST.on ? "on" : "off"); };
  $("#optShuffle").onclick = () => { shuffleGates = !shuffleGates; try { localStorage.setItem("mh.shuffle", shuffleGates ? "on" : "off"); } catch (er) { /* no storage */ } $("#optShuffle").textContent = "Moving entrances: " + (shuffleGates ? "on" : "off"); };
  let armed = false;
  $("#optReset").onclick = () => {
    if (!armed) { armed = true; $("#optReset").textContent = "Really? Click again to erase stars, medals, stats and plans"; return; }
    try { Object.keys(localStorage).filter(k => k.startsWith("mh.") && !["mh.vol", "mh.sound", "mh.fx"].includes(k)).forEach(k => localStorage.removeItem(k)); } catch (er) { /* no storage */ }
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
    <p><b>Zero trampled</b> earns three stars. Stars unlock venues. Each venue also has five optional medals.</p>
    <div class="row"><button class="go" id="pick">Got it</button></div>`, "options");
}
// button labels for the sandbox's disaster buttons
const EVENT_NAMES = { car: "Lost driver", dogs: "Loose dogs", beachballs: "Beach balls", icecream: "Ice cream truck", lion: "Lion", elephants: "Elephants", clowncar: "Clown car", balls: "Circus balls",
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
  viernes: "THE MALL", boda: "THE WEDDING OF THE YEAR", trono: "THE GOLDEN BATHROOM", mitin: "THE DUCK RALLY", taco: "THE TACO FESTIVAL", ovni: "DON CHUY'S CORNFIELD", aeropuerto: "THE AIRPORT", arena: "THE ARENA", nuclear: "THE NUCLEAR PLANT", guerra: "THE OLD BATTLEFIELD" };
const HEADLINES = {
  lazy: [
    "ORGANIZER OF {P} PLACES ZERO FENCES, ZERO GUARDS, ZERO ANYTHING; {D} TRAMPLED",
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
    "{D} TRAMPLED AT {P}; AUTHORITIES PROMISE “MORE FENCES THAN EVER”",
    "“IT COULD HAVE BEEN WORSE,” SAYS ORGANIZER, AND HE'S TECHNICALLY RIGHT",
  ],
  bad: [
    "CHAOS AT {P}: {D} TRAMPLED AND ORGANIZER FLEES ON A BICYCLE",
    "“IT WAS A TOTAL SUCCESS,” INSISTS MAN IN CHARGE FROM THE TOP OF A TREE",
    "{D} TRAMPLED; HEAD OF SECURITY BLAMES “PHYSICS”",
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
      ${sandbox ? `<div class="sandtag">SANDBOX · this never happened</div>` : ""}
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
            <span>Trampled</span><span style="color:var(--danger)">${dead.toLocaleString("en")}</span>
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
    <div class="row"><button class="go" id="retry">Adjust the plan</button><button id="again">Run it again</button><button id="pick">Change venue</button></div>`, "report");
}
