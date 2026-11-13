// Human Tsunami · World Tour: a roguelite run of five shows in a row
// Random venues, a random twist each, one pancake allowance for the whole tour and a perk picked
// from three after every show. No retries: the plan you start the show with is the plan you get.
const TOUR_PERKS = {
  budget: { icon: "💰", name: "Sponsor money", desc: "+20% barrier budget for the rest of the tour." },
  guards: { icon: "🕶", name: "Off-duty cousins", desc: "+2 guards in every venue." },
  mega:   { icon: "🔋", name: "Spare batteries", desc: "+2 megaphone uses every show." },
  live:   { icon: "🧰", name: "Emergency kit", desc: "+1 emergency gate and +1 free pizza every show." },
  chill:  { icon: "🪻", name: "Lavender mist", desc: "People take 8% more squeezing before they go down." },
  gate:   { icon: "✂️", name: "Bolt cutters", desc: "You may open one more gate." },
  lives:  { icon: "📜", name: "Insurance policy", desc: "+150 to the pancake allowance." },
  walls:  { icon: "🚧", name: "Spare fence panels", desc: "+2 drop-in barriers during every show." },
};
let TOUR = null;
const tourN = k => TOUR && TOUR.perks[k] || 0;
const tourHere = () => !!TOUR && !TOUR.over && TOUR.keys[TOUR.i] === sceneKey;
const tourMod = () => tourHere() ? TOUR.mods[TOUR.i] : null;
const tourLeft = () => TOUR ? TOUR.allow - TOUR.dead : 0;
const tourBest = () => { try { return JSON.parse(localStorage.getItem("mh.tour") || "{}"); } catch (e) { return {}; } };
function tourStart() {
  if (sandbox) { toast("Turn Sandbox off first: the tour counts for real."); return; }
  const open = realKeys().filter(k => isUnlocked(k)).sort(() => Math.random() - .5);
  if (open.length < 3) { toast("Unlock at least 3 venues to go on tour."); return; }
  const twists = MODS.filter(m => m.id !== "normal");
  const n = Math.min(5, open.length), keys = open.slice(0, n);
  TOUR = { keys, mods: keys.map(() => twists[(Math.random() * twists.length) | 0].id), i: 0, dead: 0, allow: 250 + 50 * n, stars: [], perks: {}, over: false, won: false, recorded: -1 };
  DAILY = null; tourIntro();
}
// before each show: where we are, what's next, what is left
function tourIntro() {
  const T = TOUR, sc = SCENES[T.keys[T.i]], m = MODS_BY_ID[T.mods[T.i]];
  const perks = Object.entries(T.perks).map(([k, n]) => `<span class="tperk">${TOUR_PERKS[k].icon} ${TOUR_PERKS[k].name}${n > 1 ? " ×" + n : ""}</span>`).join("") || "<small>No perks yet. Survive a show to pick one.</small>";
  showCard(`<div class="tour">
      <small class="tkick">World Tour · show ${T.i + 1} of ${T.keys.length}</small>
      <h2>${sc.name}</h2>
      <p class="ttwist">${m.icon || "🎲"} <b>${m.name}</b> · ${m.desc}</p>
      <div class="tstops">${T.keys.map((k, j) => `<span class="${j < T.i ? "done" : j === T.i ? "now" : ""}">${j < T.i ? "★".repeat(T.stars[j] || 0) || "✓" : j + 1}<i>${SCENES[k].name}</i></span>`).join("")}</div>
      <div class="tallow"><b>${tourLeft().toLocaleString("en")}</b> pancakes left in the tour allowance<small>Go over it and the tour is cancelled. Zero stars also ends it.</small></div>
      <div class="tperks">${perks}</div>
      <div class="row"><button class="go" id="tourGo">Plan this show ▶</button><button id="tourQuit">Abandon the tour</button></div>
    </div>`, "tourcard");
}
function tourGo() { hideCard(); loadScene(TOUR.keys[TOUR.i]); caption(`World Tour ${TOUR.i + 1}/${TOUR.keys.length}: plan it. No second tries.`, true, 2800); }
// called from finish() once per show
function tourRecord(stars, dead) {
  if (!tourHere() || TOUR.recorded === TOUR.i) return;
  TOUR.recorded = TOUR.i; TOUR.stars[TOUR.i] = stars; TOUR.dead += dead;
  if (tourLeft() < 0 || stars === 0) TOUR.over = true;
  else if (TOUR.i === TOUR.keys.length - 1) { TOUR.over = true; TOUR.won = true; }
}
const tourScore = () => TOUR.stars.reduce((s, x) => s + 1000 + 300 * (x || 0), 0) - TOUR.dead + (TOUR.won ? 2000 : 0);
// the report's buttons while on tour
function tourButtons() {
  if (!TOUR) return "";
  return TOUR.over ? `<button class="go" id="tourEnd">${TOUR.won ? "🏆 Tour complete!" : "Tour over"} ▶</button>` : `<button class="go" id="tourPerk">Pick a perk ▶</button>${dead > 0 ? '<button id="whyBtn">📊 What went wrong?</button>' : ""}`;
}
function tourPerkCard() {
  const ks = Object.keys(TOUR_PERKS).sort(() => Math.random() - .5).slice(0, 3);
  showCard(`<div class="tour"><small class="tkick">World Tour · pick one</small><h2>The promoter offers you a perk</h2>
    <div class="tpick">${ks.map(k => `<button data-perk="${k}"><i>${TOUR_PERKS[k].icon}</i><b>${TOUR_PERKS[k].name}</b><small>${TOUR_PERKS[k].desc}</small></button>`).join("")}</div></div>`, "tourcard");
}
function tourTakePerk(k) {
  TOUR.perks[k] = (TOUR.perks[k] || 0) + 1; if (k === "lives") TOUR.allow += 150;
  TOUR.i++; sfx("confirm"); tourIntro();
}
function tourEnd() {
  const T = TOUR, score = tourScore(), b = tourBest(), fresh = !(b.score >= score);
  if (fresh) { try { localStorage.setItem("mh.tour", JSON.stringify({ score, won: T.won, dead: T.dead, shows: T.stars.length })); } catch (e) { /* no storage */ } }
  let bonus = 0; if (T.won) { bonus = 50 * T.keys.length; loadShop(); TIX += bonus; saveShop(); achieve("TOUR_COMPLETE"); if (T.stars.every(x => x === 3)) achieve("TOUR_FLAWLESS"); }
  showCard(`<div class="tour"><small class="tkick">World Tour · ${T.won ? "complete" : "cancelled"}</small>
    <h2>${T.won ? "What a tour. Mostly unflattened." : tourLeft() < 0 ? "The insurers pulled the plug" : "The promoter has stopped answering"}</h2>
    <div class="tstops">${T.keys.map((k, j) => `<span class="${j < T.stars.length ? "done" : ""}">${j < T.stars.length ? "★".repeat(T.stars[j] || 0) || "✗" : "–"}<i>${SCENES[k].name}</i></span>`).join("")}</div>
    <div class="tallow"><b>${score.toLocaleString("en")}</b> tour score${fresh ? " · NEW BEST" : ` · best ${b.score.toLocaleString("en")}`}<small>${T.dead.toLocaleString("en")} pancaked in total${bonus ? ` · +${bonus} tickets` : ""}</small></div>
    <div class="row"><button class="go" id="tourAgain">New tour</button><button id="tourTitle">Title screen</button></div></div>`, "tourcard");
  TOUR = null;
}
$("#card").addEventListener("click", e => {
  const id = e.target.closest && (e.target.closest("button") || {}).id;
  if (e.target.closest && e.target.closest("#tour")) tourStart();
  if (id === "tourGo") tourGo();
  if (id === "tourQuit") { TOUR = null; titleScreen(); }
  if (id === "tourPerk") tourPerkCard();
  const pk = e.target.closest && e.target.closest("[data-perk]"); if (pk && TOUR) tourTakePerk(pk.dataset.perk);
  if (id === "tourEnd") tourEnd();
  if (id === "tourAgain") tourStart();
  if (id === "tourTitle") titleScreen();
});
