// Human Tsunami · level editor: build a venue, test it, save it, share it as a code (the same JSON a Workshop item would carry)
const ED_TOOLS = {
  stage:  { icon: "🎤", name: "Stage", drag: true, desc: "Drag a box: the stage. A barrier goes in front of it; that's where the crowd wants to be." },
  wall:   { icon: "🧱", name: "Wall", line: true, desc: "Drag a line: a solid wall." },
  block:  { icon: "🏢", name: "Building", drag: true, desc: "Drag a box: a building nobody can walk through." },
  kiosk:  { icon: "🏪", name: "Kiosk", drag: true, desc: "Drag a box: a small stand." },
  tent:   { icon: "⛺", name: "Tent", drag: true, desc: "Drag a box: a striped tent." },
  pool:   { icon: "🏊", name: "Pool", drag: true, desc: "Drag a box: water. Nobody walks into it (on purpose)." },
  pole:   { icon: "📍", name: "Pole", desc: "Click: a pole in the way." },
  erase:  { icon: "🧽", name: "Erase", desc: "Click a piece to remove it." },
};
const ED_EVENTS = ["car", "icecream", "dogs", "beachballs", "lion", "elephants", "clowncar", "mascot", "flares", "ola", "medic", "gaviotas", "fuegos", "taxi", "carroza", "policia"];
const ED_FLOORS = ["#c9bfa6", "#9aa0a6", "#7fae5a", "#e6d3a0", "#4a5160", "#c8b4d8"];
let EDIT = false, edTool = "stage", edDrag = null, CUSTOM = null, customId = null;
const blankVenue = () => ({ v: 1, name: "My venue", crowd: 2500, budget: 80, maxGates: 4, night: false, floor: 0, gates: [false, true, false, true, false, true, false], events: ["car", "dogs", "mascot", "ola"],
  items: [{ k: "stage", x0: 10, y0: 2, x1: 30, y1: 9 }] });
const loadCustom = () => { try { return JSON.parse(localStorage.getItem("mh.custom") || "[]") || []; } catch (e) { return []; } };
const saveCustomList = l => { try { localStorage.setItem("mh.custom", JSON.stringify(l)); } catch (e) { /* no storage */ } };
const venueCode = d => "HT1:" + btoa(unescape(encodeURIComponent(JSON.stringify(d))));
function parseVenueCode(code) {
  try { const s = code.trim(); if (!s.startsWith("HT1:")) return null; const d = JSON.parse(decodeURIComponent(escape(atob(s.slice(4)))));
    if (!d || !Array.isArray(d.items) || !Array.isArray(d.gates)) return null; d.crowd = clamp(+d.crowd || 2500, 500, 5800); d.budget = clamp(+d.budget || 80, 20, 300); return d; } catch (e) { return null; }
}
// the custom scene reads CUSTOM every time the world is rebuilt
SCENES.custom = {
  name: "Custom venue", tag: "Made by you", outside: "#6b6e74", bulbH: 2.2, music: "edm", crowd: 2500, fenceBudget: 80, maxGates: 4, guards: 3, unlock: 1e9, hidden: true,
  light: { sky: 0xfff4e0, ground: 0x6a6a6a, hemi: .6, sun: 0xfff0d8, sunI: 1.1 },
  gates: [false, true, false, true, false, true, false], intro: "A venue made in the level editor.", acts: ["Showtime!", "Louder!", "One more!"], events: ["car", "dogs"],
  goal: o => o.kind === "barrier", goalMaxY: 30, quotes: ["“I built this myself and I regret everything,” said the organizer."], lines: {},
  build() {
    const d = CUSTOM || blankVenue();
    for (const it of d.items) {
      if (it.k === "wall") seg(it.x0, it.y0, it.x1, it.y1, .45, "wall");
      else if (it.k === "pole") circ(it.x0, it.y0, .5, "pole");
      else if (it.k === "stage") { rect(it.x0, it.y0, it.x1, it.y1, "stage"); seg(it.x0 - .5, it.y1 + 1.4, it.x1 + .5, it.y1 + 1.4, .4, "barrier"); }
      else rect(it.x0, it.y0, it.x1, it.y1, it.k === "block" ? "shop" : it.k === "pool" ? "pool" : it.k);
    }
  },
  ground(g) {
    const d = CUSTOM || blankVenue(); g.fillStyle = ED_FLOORS[d.floor || 0]; g.fillRect(0, 0, WW, WH);
    for (let y = 0; y < FENCE_Y; y += 2) for (let x = 0; x < WW; x += 2) { g.fillStyle = (x + y) % 4 ? "rgba(0,0,0,.04)" : "rgba(255,255,255,.05)"; g.fillRect(x + .05, y + .05, 1.9, 1.9); }
    g.fillStyle = "#6b6e74"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
  },
  decor(g) {
    for (const o of obs) {
      if (o.kind === "stage") { g.fillStyle = "#1b1d22"; g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0); g.fillStyle = "#ff3fa4"; g.fillRect(o.x0, o.y1 - .3, o.x1 - o.x0, .3); }
      else if (o.kind === "shop") { g.fillStyle = "#4a4d55"; g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0); }
      else if (o.kind === "pool") { g.fillStyle = "#4fb8ff"; g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0); }
      else if (o.kind === "kiosk") { g.fillStyle = "#ffb238"; g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0); }
      else if (o.kind === "barrier" || o.kind === "wall") { g.lineCap = "butt"; g.lineWidth = o.th; g.strokeStyle = o.kind === "wall" ? "#5b2a1c" : "#1c1d21"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
      else if (o.kind === "pole") { g.fillStyle = "#4a3426"; g.beginPath(); g.arc(o.x, o.y, o.r, 0, 7); g.fill(); }
    }
  },
  bulbs: [], beams: [], performers: () => [],
};
function applyCustom(d) {   // copy the editable settings onto the scene before it loads
  CUSTOM = d; const S = SCENES.custom;
  Object.assign(S, { name: d.name || "Custom venue", crowd: d.crowd, fenceBudget: d.budget, maxGates: d.maxGates, night: !!d.night, gates: d.gates.slice(), events: d.events && d.events.length ? d.events.slice() : ["car"] });
  S.light = d.night ? { sky: 0x8aa2e0, ground: 0x1e2228, hemi: .34, sun: 0xdfe8ff, sunI: .8 } : { sky: 0xfff4e0, ground: 0x6a6a6a, hemi: .6, sun: 0xfff0d8, sunI: 1.1 };
  const st = d.items.filter(i => i.k === "stage"); S.goalMaxY = st.length ? Math.max(...st.map(i => i.y1 + 3)) : 30;
}
function openEditor(d, id) {
  applyCustom(d || blankVenue()); customId = id ?? null; EDIT = true; edTool = "stage";
  const was = shuffleGates; shuffleGates = false; loadScene("custom"); shuffleGates = was; hideCard(); edPanel(); caption("Level editor: build your venue", false, 1800);
}
function edPanel() {
  const d = CUSTOM, el = $("#ftypes"); el.hidden = false; el.style.display = ""; pickerFor = "editor";
  el.innerHTML = `<div class="ptitle">Level editor · ${d.name}</div>` + Object.entries(ED_TOOLS).map(([k, t]) => `<button data-ed="${k}" class="${edTool === k ? "on" : ""}" title="${t.desc}">${t.icon} ${t.name}</button>`).join("") +
    `<span class="sep"></span><button data-edx="settings">⚙ Settings</button><button data-edx="test" class="go">▶ Test it</button><button data-edx="save">💾 Save</button><button data-edx="share">🔗 Share code</button><button data-edx="exit">✕ Exit</button>`;
  el.querySelectorAll("[data-ed]").forEach(b => b.onclick = () => { edTool = b.dataset.ed; edPanel(); toast(ED_TOOLS[edTool].desc); });
  el.querySelectorAll("[data-edx]").forEach(b => b.onclick = () => edAction(b.dataset.edx));
}
function edRebuild() { buildWorld(); ui(); if (EDIT) edPanel(); }
function edAction(k) {
  if (k === "test") { if (!CUSTOM.items.some(i => i.k === "stage")) { toast("Add a stage first: that's where the crowd wants to go."); return; } EDIT = false; applyCustom(CUSTOM); const was = shuffleGates; shuffleGates = false; loadScene("custom"); shuffleGates = was; ui(); caption("Test run: plan it like any venue, then open the gates", false, 2400); return; }
  if (k === "save") { const l = loadCustom(); if (customId === null) { customId = Date.now(); l.push({ id: customId, d: CUSTOM }); } else { const it = l.find(x => x.id === customId); if (it) it.d = CUSTOM; else l.push({ id: customId, d: CUSTOM }); } saveCustomList(l); toast(`Saved “${CUSTOM.name}”.`); sfx("confirm"); return; }
  if (k === "share") { const code = venueCode(CUSTOM); try { navigator.clipboard.writeText(code); } catch (e) { /* no clipboard */ }
    showCard(`<h2>Share “${CUSTOM.name}”</h2><p>Copied to the clipboard. Anyone can paste this code in Custom venues → Paste a code.</p><textarea class="edcode" readonly>${code}</textarea><div class="row"><button class="go" id="edBack">Back to the editor</button></div>`, "options");
    $("#edBack").onclick = () => { hideCard(); edPanel(); }; return; }
  if (k === "exit") { EDIT = false; customMenu(); return; }
  if (k === "settings") {
    const d = CUSTOM;
    showCard(`<h2>Venue settings</h2>
      <label class="opt">Name <input id="edName" value="${(d.name || "").replace(/"/g, "&quot;")}" maxlength="28"></label>
      <label class="opt">Crowd <input type="range" id="edCrowd" min="500" max="5800" step="100" value="${d.crowd}"><span id="edCrowdV">${d.crowd}</span></label>
      <label class="opt">Budget <input type="range" id="edBudget" min="20" max="300" step="5" value="${d.budget}"><span id="edBudgetV">$${d.budget * 10}</span></label>
      <label class="opt">Gates open at most <input type="range" id="edGates" min="1" max="7" value="${d.maxGates}"><span id="edGatesV">${d.maxGates}</span></label>
      <div class="row"><button id="edNight">${d.night ? "🌙 Night" : "☀ Day"}</button><button id="edFloor">Floor colour ${(d.floor || 0) + 1}</button></div>
      <p class="keys">Events that can happen:</p><div class="row edevents">${ED_EVENTS.map(e => `<button data-ev="${e}" class="${d.events.includes(e) ? "on" : ""}">${EVENT_NAMES[e] || e}</button>`).join("")}</div>
      <div class="row"><button class="go" id="edDone">Done</button></div>`, "options");
    const num = (id, f) => { $(id).oninput = e => f(+e.target.value); };
    num("#edCrowd", v => { d.crowd = v; $("#edCrowdV").textContent = v; }); num("#edBudget", v => { d.budget = v; $("#edBudgetV").textContent = "$" + v * 10; }); num("#edGates", v => { d.maxGates = v; $("#edGatesV").textContent = v; });
    $("#edNight").onclick = () => { d.night = !d.night; $("#edNight").textContent = d.night ? "🌙 Night" : "☀ Day"; };
    $("#edFloor").onclick = () => { d.floor = ((d.floor || 0) + 1) % ED_FLOORS.length; $("#edFloor").textContent = "Floor colour " + (d.floor + 1); };
    document.querySelectorAll(".edevents [data-ev]").forEach(b => b.onclick = () => { const e = b.dataset.ev; d.events = d.events.includes(e) ? d.events.filter(x => x !== e) : d.events.concat(e); b.classList.toggle("on"); });
    $("#edDone").onclick = () => { d.name = $("#edName").value.trim() || "My venue"; applyCustom(d); const was = shuffleGates; shuffleGates = false; loadScene("custom"); shuffleGates = was; EDIT = true; hideCard(); edPanel(); };
  }
}
// pointer: drag boxes and lines, click poles, erase, toggle gates
function edDown(x, y) {
  if (Math.abs(y - FENCE_Y) < 2.5) { const i = clamp(Math.floor(x / (WW / SLOTS)), 0, SLOTS - 1); CUSTOM.gates[i] = !CUSTOM.gates[i]; if (!CUSTOM.gates.some(Boolean)) CUSTOM.gates[i] = true; gates = CUSTOM.gates.slice(); edRebuild(); return; }
  if (y > FENCE_Y - .5) return;
  if (edTool === "erase") { let bi = -1, bd = 1.5; CUSTOM.items.forEach((it, i) => { const d = it.k === "wall" ? contact({ t: "s", ax: it.x0, ay: it.y0, bx: it.x1, by: it.y1, th: .45 }, x, y)[2] : it.k === "pole" ? Math.hypot(x - it.x0, y - it.y0) - .5 : (x > Math.min(it.x0, it.x1) && x < Math.max(it.x0, it.x1) && y > Math.min(it.y0, it.y1) && y < Math.max(it.y0, it.y1) ? 0 : 9); if (d < bd) { bd = d; bi = i; } });
    if (bi >= 0) { CUSTOM.items.splice(bi, 1); edRebuild(); sfx("erase"); } return; }
  if (edTool === "pole") { CUSTOM.items.push({ k: "pole", x0: snap(x), y0: snap(y) }); edRebuild(); sfx("drop"); return; }
  edDrag = { x: snap(x), y: snap(y) };
}
function edUp(x, y) {
  if (!edDrag) return; const a = edDrag; edDrag = null; const bx = snap(clamp(x, 0, WW)), by = snap(clamp(y, 0, FENCE_Y - 1));
  if (ED_TOOLS[edTool].line) { if (Math.hypot(bx - a.x, by - a.y) < 1) return; CUSTOM.items.push({ k: "wall", x0: a.x, y0: a.y, x1: bx, y1: by }); }
  else { const x0 = Math.min(a.x, bx), x1 = Math.max(a.x, bx), y0 = Math.min(a.y, by), y1 = Math.max(a.y, by); if (x1 - x0 < 1 || y1 - y0 < 1) return; CUSTOM.items.push({ k: edTool, x0, y0, x1, y1 }); }
  edRebuild(); sfx("drop");
}
// the custom venues menu (from the title screen)
function customMenu() {
  EDIT = false; const l = loadCustom();
  showCard(`<h2>Custom venues</h2><p class="keys">Build your own venue, test it, and share it with a code. Codes are plain text: paste them anywhere.</p>
    <div class="shop">${l.length ? l.map(it => `<div class="upg"><i>🏟</i><div><b>${it.d.name}</b><small>${it.d.crowd.toLocaleString("en")} people · ${it.d.items.length} pieces</small></div>
      <div class="row"><button data-cplay="${it.id}" class="go">Play</button><button data-cedit="${it.id}">Edit</button><button data-ccode="${it.id}">Code</button><button data-cdel="${it.id}">✕</button></div></div>`).join("") : `<p>No custom venues yet.</p>`}</div>
    <div class="row"><button class="go" id="cNew">＋ New venue</button><button id="cPaste">📋 Paste a code</button><button id="pick">Back</button></div>`, "options shopcard");
  const find = id => l.find(x => String(x.id) === String(id));
  document.querySelectorAll("[data-cplay]").forEach(b => b.onclick = () => { const it = find(b.dataset.cplay); applyCustom(it.d); customId = it.id; const was = shuffleGates; shuffleGates = false; loadScene("custom"); shuffleGates = was; hideCard(); caption(`${it.d.name}: you plan it`, false, 2200); });
  document.querySelectorAll("[data-cedit]").forEach(b => b.onclick = () => { const it = find(b.dataset.cedit); openEditor(JSON.parse(JSON.stringify(it.d)), it.id); });
  document.querySelectorAll("[data-ccode]").forEach(b => b.onclick = () => { const it = find(b.dataset.ccode), code = venueCode(it.d); try { navigator.clipboard.writeText(code); } catch (e) { /* no clipboard */ } toast("Code copied to the clipboard."); });
  document.querySelectorAll("[data-cdel]").forEach(b => b.onclick = () => { saveCustomList(l.filter(x => String(x.id) !== String(b.dataset.cdel))); customMenu(); });
  $("#cNew").onclick = () => openEditor(blankVenue(), null);
  $("#cPaste").onclick = () => {
    showCard(`<h2>Paste a venue code</h2><textarea class="edcode" id="cCode" placeholder="HT1:..."></textarea><div class="row"><button class="go" id="cImport">Import</button><button id="cBack">Back</button></div>`, "options");
    $("#cBack").onclick = customMenu;
    $("#cImport").onclick = () => { const d = parseVenueCode($("#cCode").value); if (!d) { toast("That doesn't look like a venue code."); return; } const ll = loadCustom(); ll.push({ id: Date.now(), d }); saveCustomList(ll); customMenu(); toast(`Imported “${d.name}”.`); };
  };
}
