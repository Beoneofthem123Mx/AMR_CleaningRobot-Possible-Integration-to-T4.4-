// Human Tsunami · secret achievements: hidden until you stumble into them (also sent to Steam as SECRET_<ID>)
const SECRETS = {
  COW_STRIKE:   { icon: "🐄", name: "Udderly Ridiculous", desc: "A single cow bounce knocked over 10 people.", hint: "Something heavy, with spots, from above." },
  ORBIT:        { icon: "🚀", name: "Houston, We Have a Fan", desc: "20 people launched into orbit in one show.", hint: "Some people are springier than others." },
  DOMINO:       { icon: "🁢", name: "Domino Theory", desc: "A stumble chain of 60 people in one show.", hint: "One trip, then another, then another…" },
  SPEEDRUN:     { icon: "⚡", name: "Express Evacuation", desc: "Everyone out in under 12 seconds, nobody pancaked.", hint: "Wide doors, empty rooms." },
  PATIENT_ZERO: { icon: "🧟", name: "Patient Zero", desc: "1,000 zombies at the same time.", hint: "Something is going around." },
  WRONG_SPORT:  { icon: "🐉", name: "Wrong Sport", desc: "A goal was scored while a dragon was in the stadium.", hint: "Football, but with more fire." },
  TILT:         { icon: "🎰", name: "TILT!", desc: "50 pinball falls in one show.", hint: "Ding ding ding ding…" },
  LUCKY:        { icon: "☄️", name: "Lucky Bastards", desc: "A meteor hit the venue and pancaked nobody.", hint: "Aim for the empty bits." },
  SHOPAHOLIC:   { icon: "🛍️", name: "Retail Therapy", desc: "Someone carried nine shopping bags at once.", hint: "One more shop. Just one more." },
  PANCAKE_FAN:  { icon: "🥞", name: "Pancake Enthusiast", desc: "You clicked the PANCAKED counter 25 times. Why?", hint: "It's right there at the top. Just… click it." },
};
const SEC = { yeets: 0, pinball: 0, badge: 0 };   // per-show counters
const loadSecrets = () => { try { return JSON.parse(localStorage.getItem("mh.secrets") || "[]") || []; } catch (e) { return []; } };
function unlockSecret(id) {
  if (!SECRETS[id] || (typeof demo !== "undefined" && demo) || (typeof window !== "undefined" && window.__manual)) return;
  const got = loadSecrets(); if (got.includes(id)) return;
  got.push(id); try { localStorage.setItem("mh.secrets", JSON.stringify(got)); } catch (e) { /* no storage */ }
  achieve("SECRET_" + id);
  const s = SECRETS[id], el = document.createElement("div"); el.className = "secretpop";
  el.innerHTML = `<i>${s.icon}</i><div><small>🏆 SECRET ACHIEVEMENT · ${got.length}/10</small><b>${s.name}</b><span>${s.desc}</span></div>`;
  document.querySelector("#frame").appendChild(el); setTimeout(() => el.remove(), 5200);
  sfx("cheer"); if (typeof burstAt === "function") burstAt(WW / 2, 20, 60);
}
function resetSecretCounters() { SEC.yeets = 0; SEC.pinball = 0; }
function showSecrets() {
  const got = loadSecrets();
  showCard(`<h2>Secret achievements · ${got.length}/10</h2><p class="keys">Nobody tells you how to get these. That's the point.</p>
    <div class="shop">${Object.entries(SECRETS).map(([id, s]) => got.includes(id)
      ? `<div class="upg worn"><i>${s.icon}</i><div><b>${s.name}</b><small>${s.desc}</small></div></div>`
      : `<div class="upg"><i>?</i><div><b>???</b><small>${s.hint}</small></div></div>`).join("")}</div>
    <div class="row"><button class="go" id="pick">Back</button></div>`, "options shopcard");
}
// the pancake counter is clickable, for no reason at all
(function () { const b = document.querySelector("#badge"); if (b) b.addEventListener("click", () => { SEC.badge++; b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); if (SEC.badge >= 25) unlockSecret("PANCAKE_FAN"); }); })();
