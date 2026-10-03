// Human Tide · title screen, venue picker and the next morning's newspaper
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
    c.width = 108; c.height = 60; const g = c.getContext("2d");
    // the venue is rotated so the thumbnail is landscape, like on PC
    g.translate(108, 0); g.rotate(Math.PI / 2);
    g.drawImage(big, 0, 0, big.width, WH * TEXS, 0, 0, 60, 108);
    THUMBS[key] = c.toDataURL("image/jpeg", .8);
  } catch (e) { THUMBS[key] = ""; }
  ({ obs, scene, gates, fences, guards } = save);
  return THUMBS[key];
}

// ---------- title screen and venue picker ----------
function chooser() {
  if ((phase === "show" || phase === "evac") && !demo) return;
  const best = loadBest(), total = totalStars(), max = Object.keys(SCENES).length * 3;
  showCard(`<div class="title">
      <h1 class="logo">HUMAN<br>TIDE</h1>
      <p class="tag">A safety simulator for events that go horribly wrong</p>
    </div>
    <p>You place the fences, the gates and the guards. Then the people pour in and absolutely everything happens. During the show, <b>click</b> to use the megaphone. If someone takes too much pressure, they go down and get trampled.</p>
    <div class="row chaosrow"><button id="chaos" class="${chaosMode ? "go" : ""}">Total Chaos mode: ${chaosMode ? "on" : "off"}</button><small>Events from every venue can happen anywhere, plus two of today's twists at once.</small></div>
    <p class="keys">Shortcuts: <b>1–4</b> tools · <b>Space</b> opens gates · <b>H</b> pressure · <b>C</b> camera · <b>V</b> speed · <b>M</b> sound · <b>Esc</b> pause</p>
    <p class="starline">You have <b>${total} of ${max}</b> stars. Stars unlock new venues.</p>
    <div class="scenes">${Object.entries(SCENES).map(([key, sc]) => {
      const b = best[key], open = isUnlocked(key);
      return `<button class="scene" data-scene="${key}" ${open ? "" : "disabled"}>
        <img src="${sceneThumb(key)}" alt="">
        <span class="txt"><b>${sc.name}${b !== undefined ? ` <em class="best">${"★".repeat(b)}${"☆".repeat(3 - b)}</em>` : ""}</b>
        <span>${sc.tag} · ${sc.crowd.toLocaleString("en")} people</span>
        ${open ? `<small>${sc.intro}</small>` : `<span class="lock">Unlocks at ${sc.unlock} stars</span>`}</span></button>`; }).join("")}</div>
    ${window.steam ? '<div class="row"><button id="fs">Full screen (F11)</button><button id="quit">Quit game</button></div>' : ""}`, "menu");
  const b = $("#card .scene:not(:disabled)"); if (b) b.focus();
}

// ---------- the next morning's newspaper ----------
const PLACE = { plaza: "THE PLAZA", circo: "THE CIRCUS", estadio: "THE STADIUM", crucero: "THE CRUISE", hipodromo: "THE RACETRACK", ciudad: "THE CITY",
  viernes: "THE MALL", boda: "THE WEDDING OF THE YEAR", trono: "THE GOLDEN BATHROOM", mitin: "THE DUCK RALLY", taco: "THE TACO FESTIVAL", ovni: "DON CHUY'S CORNFIELD", aeropuerto: "THE AIRPORT", arena: "THE ARENA" };
const HEADLINES = {
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
function showReport(stars, stuck) {
  const p = PLACE[sceneKey] || scene.place || scene.name.toUpperCase(), v = { P: p, N: CROWD.toLocaleString("en"), D: dead.toLocaleString("en") };
  const head = fill(pick(stars === 3 ? HEADLINES.perfect : stars ? HEADLINES.some : HEADLINES.bad), v);
  const lines = [...eventLog].map(k => (scene.lines && scene.lines[k]) || EVENT_LINES[k]).filter(Boolean).sort(() => Math.random() - .5).slice(0, 2);
  if (MOD && MOD.id !== "normal") {
    const ml = MOD.id.split("+").map(k => MOD_LINES[k]).filter(Boolean);
    lines.unshift(...(ml.length ? ml : [`Today's twist: ${MOD.name.toLowerCase()}. Nobody announced it.`]));
  }
  if (abducted) lines.unshift(`${abducted} attendees were abducted. Their families hope things go better for them up there.`);
  const date = new Date().toLocaleDateString("en", { weekday: "long", day: "numeric", month: "long" });
  showCard(`<div class="paper">
      <div class="mast"><span>THE DAILY GOSSIP</span><small>${date} · Special edition · $5</small></div>
      <h2 class="head">${head}</h2>
      ${G3.photo ? `<figure><img src="${G3.photo}" alt="Event photo"><figcaption>${scene.name}, yesterday. Photo: an attendee who never once put their phone down.</figcaption></figure>` : ""}
      <div class="cols">
        <div class="story"><p>${lines.join(" ")}</p><p class="quote">${pick(scene.quotes || QUOTES)}</p></div>
        <div class="box">
          <div class="stars">${[0, 1, 2].map(k => `<span class="${k < stars ? "" : "off"}">★</span>`).join("")}</div>
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
    </div>
    <div class="row"><button class="go" id="retry">Adjust the plan</button><button id="pick">Change venue</button></div>`, "report");
}
