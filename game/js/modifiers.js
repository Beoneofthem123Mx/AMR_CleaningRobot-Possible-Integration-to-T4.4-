// Marea Humana · condición del día: una sorpresa al azar en cada show
const MODS = [
  { id: "normal", name: "Día tranquilo", desc: "Ninguna sorpresa. Por ahora.", w: 3 },
  { id: "wifi", name: "Wifi gratis en una esquina", desc: "Un tercio del público solo quiere señal y se amontona junto al router.", w: 2, altShare: .33,
    start() {
      const spots = [[5, 26], [WW - 5, 26], [5, 52], [WW - 5, 52], [12, 40], [WW - 12, 40]].sort(() => Math.random() - .5);
      for (const [x, y] of spots) if (!blockedC[cellOf(x, y)] && isFinite(fStage[cellOf(x, y)]) && setAlt(x, y, 2.2)) {
        addMover({ kind: "router", beh: "static", x, y, life: 1e9, r: .3, push: 0, say: "¡WIFI GRATIS!", sayEvery: 6 }); break;
      }
    } },
  { id: "influencer", name: "Influencer en vivo", desc: "Camina transmitiendo y un tercio del público la sigue a todas partes.", w: 2, altShare: .32,
    start() {
      const pts = Array.from({ length: 12 }, () => crowdPoint());
      addMover({ kind: "influencer", x: openGateX(), y: 62, pts, speed: .9, r: .4, push: 15, scare: 0, say: "¡HOLA MIS AMORES!", sayEvery: 4,
        tick(m) { m.next = (m.next || 0) - DT; if (m.next <= 0) { m.next = 1.5; setAlt(m.x, m.y, 2.6); } } });
    } },
  { id: "rain", name: "Aguacero", desc: "Llueve a cántaros. Todos caminan más rápido y empujan más.", w: 2, speed: 1.2, rain: true },
  { id: "reggaeton", name: "Noche de reguetón", desc: "Los momentos fuertes llegan el doble de seguido. Nadie se queda quieto.", w: 2, dropMul: .5 },
  { id: "moon", name: "Gravedad lunar", desc: "Nadie sabe por qué, pero todos rebotan. Al menos aguantan más los apretones.", w: 1, pcritMul: 1.25, bounce: 3 },
  { id: "rush", name: "Hora pico", desc: "Llegó 25 % más gente de la que cabe. El organizador vendió boletos de más.", w: 2, crowdMul: 1.25 },
  { id: "slowmo", name: "Público en cámara lenta", desc: "Todos caminan como en película dramática. La evacuación será épica.", w: 1, speed: .7 },
  { id: "chanclas", name: "Lluvia de chanclas", desc: "Las mamás lanzan chanclas desde las orillas. Nadie sabe a quién apuntan.", w: 2, events: ["chancla", "chancla"],
    ev: { chancla() { for (let n = 0; n < 4; n++) { const [tx, ty] = crowdPoint(), sx = Math.random() < .5 ? -1 : WW + 1, sy = rnd(20, 60);
      addMover({ kind: "chancla", beh: "fly", x: sx, y: sy, sx, sy, tx, ty, dur: 1.2 + Math.random() * .6, r: .3, push: 0, air: true, small: true, say: n ? "" : "¡ZAS!", sayEvery: 9 }); }
      caption("¡Lluvia de chanclas!", true, 1600); } } },
  { id: "pigeons", name: "Palomas hambrientas", desc: "Alguien tiró palomitas. Las palomas se lanzan en picada sobre el público.", w: 2, events: ["palomas", "palomas"],
    ev: { palomas() { for (let n = 0; n < 7; n++) { const y = rnd(14, 60), side = Math.random() < .5;
      addMover({ kind: "gull", grey: true, x: side ? -3 - n : WW + 3 + n, y, pts: [crowdPoint(), [side ? WW + 4 : -4, y + rnd(-10, 10)]], speed: 6, r: .3, push: 0, scare: 2, air: true, h: 6 + n * .4, swoop: true, say: n ? "" : "¡CURRUCÚ!", sayEvery: 2 }); }
      caption("¡Ataque de palomas!", true, 1600); } } },
];
const MODS_BY_ID = Object.fromEntries(MODS.map(m => [m.id, m]));
function rollMod() {
  const total = MODS.reduce((s, m) => s + m.w, 0); let r = Math.random() * total;
  for (const m of MODS) { r -= m.w; if (r <= 0) return m; }
  return MODS[0];
}
// la ruleta: cambia de nombres rápido, se detiene y arranca el show
function startWithRoulette() {
  if (phase !== "plan" || !canStart()) return;
  audioInit();
  const pick = window.__forceMod ? MODS_BY_ID[window.__forceMod] : rollMod();
  showCard(`<div class="roulette"><small>Condición del día</small><h2 id="rl">…</h2><p id="rld">&nbsp;</p></div>`);
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
