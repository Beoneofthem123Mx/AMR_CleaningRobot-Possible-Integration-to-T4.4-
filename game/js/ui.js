// Human Tsunami · plan editing and interface
// ===== Plan editing =====
let tool = "fence", drag = null;
const fenceUsed = () => fences.reduce((s, f) => s + fenceCost(f), 0) + props.reduce((s, p) => s + PROP_TYPES[p.type].cost, 0);   // dollars spent
const fenceLeft = () => FENCE_BUDGET * 10 - fenceUsed();
const snap = v => Math.round(v * 2) / 2;
cv.addEventListener("pointerdown", ev => {
  // during the show, each click uses the megaphone (three times per show)
  if (phase === "show" || phase === "evac") {
    const [x, y] = toWorld(ev);
    if (mega.n <= 0) { caption("The megaphone is out of battery.", true, 1400); return; }
    mega.n--; mega.active.push({ x, y, t: 3.5 }); rings.push({ x, y, t: 0, mega: true });
    pop(x, y, "CALM DOWN, PLEASE!"); sfx("whistle"); return;
  }
  if (phase !== "plan") return;
  const [x, y] = toWorld(ev);
  if (tool === "gate") {
    if (Math.abs(y - FENCE_Y) > 3) { toast("Tap a gate on the fence at the bottom."); return; }
    const i = clamp(Math.floor(x / (WW / SLOTS)), 0, SLOTS - 1), open = gates.filter(Boolean).length;
    if ((scene.noSlots || []).includes(i)) { toast(`${scene.slotWhy}: that gate can't be opened.`); return; }
    if (gates[i] && open <= 1) { toast("You need at least one open gate."); return; }
    if (!gates[i] && open >= MAX_GATES) { toast(`There's only enough staff for ${MAX_GATES} gates.`); return; }
    gates[i] = !gates[i]; buildWorld(); ui(); return;
  }
  if (tool === "guard") {
    if (guards.length >= (scene.guards || 3)) { toast("No guards left. Erase one to move it."); return; }
    const gx = snap(x), gy = snap(y), id = cellOf(gx, gy);
    if (gy >= FENCE_Y - .5 || blockedC[id] || !isFinite(fStage[id])) { toast("Put the guard somewhere the crowd will actually be."); return; }
    guards.push({ kind: "guard", x: gx, y: gy, ang: -Math.PI / 2, t: 0 }); buildWorld(); ui(); return;
  }
  if (tool === "prop") {
    const pt = PROP_TYPES[propType], px = snap(x), py = snap(y);
    if (fenceLeft() < pt.cost) { toast(`Not enough budget for a ${pt.name.toLowerCase()} ($${pt.cost}).`); return; }
    if (propType === "screen" && props.some(p => p.type === "screen")) { toast("One big screen per venue. The sponsor is cheap."); return; }
    if (py >= FENCE_Y - 2.5 || py < 1 || px < 1 || px > WW - 1 || blockedC[cellOf(px, py)] || !isFinite(fStage[cellOf(px, py)])) { toast("Put it somewhere the crowd can actually reach (and not on top of the gates)."); return; }
    props.push({ type: propType, x: px, y: py }); buildWorld(); ui(); return;
  }
  if (tool === "erase") {
    const gi = guards.findIndex(gd => Math.hypot(gd.x - x, gd.y - y) < 1.2);
    if (gi >= 0) { guards.splice(gi, 1); buildWorld(); ui(); return; }
    const pi = props.findIndex(p => Math.hypot(p.x - x, p.y - y) < PROP_TYPES[p.type].r + .8);
    if (pi >= 0) { props.splice(pi, 1); buildWorld(); ui(); return; }
    let best = -1, bd = 1.2;
    fences.forEach((f, i) => { const d = contact({ t: "s", ...f, th: 0 }, x, y)[2]; if (d < bd) { bd = d; best = i; } });
    if (best >= 0) { fences.splice(best, 1); buildWorld(); ui(); }
    return;
  }
  drag = { ax: snap(x), ay: snap(y), bx: snap(x), by: snap(y), type: fenceType }; cv.setPointerCapture(ev.pointerId);
});
cv.addEventListener("pointermove", ev => {
  if (!drag) return;
  const [x, y] = toWorld(ev); let bx = snap(x), by = snap(y);
  const left = fenceLeft() / FENCE_TYPES[drag.type].cost, l = Math.hypot(bx - drag.ax, by - drag.ay);
  if (l > left) { bx = drag.ax + (bx - drag.ax) * left / l; by = drag.ay + (by - drag.ay) * left / l; }
  drag.bx = clamp(bx, 0, WW); drag.by = clamp(by, 0, WH);
  const cost = Math.hypot(drag.bx - drag.ax, drag.by - drag.ay) * FENCE_TYPES[drag.type].cost;
  $("#cFence").textContent = `$${Math.round(fenceLeft())} − ${Math.round(cost)}`;   // live price while drawing
});
const endDrag = () => {
  if (!drag) return;
  const len = Math.hypot(drag.bx - drag.ax, drag.by - drag.ay);
  if (len >= 1) { fences.push({ ...drag, len: Math.round(len * 10) / 10 }); buildWorld(); }
  else if (fenceLeft() < FENCE_TYPES[fenceType].cost) toast("You're out of budget. Erase something or pick a cheaper fence.");
  drag = null; ui();
};
cv.addEventListener("pointerup", endDrag); cv.addEventListener("pointercancel", endDrag);

// ===== Flow preview (the trails from the video) =====
let preview = [];
function resetPreview() { preview = []; }
function seedParticle() {
  const open = []; for (let i = 0; i < SLOTS; i++) if (gates[i]) open.push(i);
  const i = open[(Math.random() * open.length) | 0];
  const x = slotX(i) + (Math.random() - .5) * SLOT_W * .8, y = FENCE_Y + .6 + Math.random() * 3;
  return { x, y, trail: [], age: 0, life: 6 + Math.random() * 4 };
}
function stepPreview(dt) {
  while (preview.length < 220) { const p = seedParticle(); p.age = Math.random() * p.life; preview.push(p); }
  for (let k = 0; k < preview.length; k++) {
    let p = preview[k]; p.age += dt;
    const id = cellOf(p.x, p.y);
    if (p.age > p.life || !isFinite(fStage[id]) || fStage[id] < .6) { preview[k] = seedParticle(); continue; }
    const sp = 7 + (k % 5);
    p.x += (dirS[id * 2] + (Math.random() - .5) * .5) * sp * dt; p.y += (dirS[id * 2 + 1] + (Math.random() - .5) * .5) * sp * dt;
    p.trail.push(p.x, p.y, fStage[id]); if (p.trail.length > 90) p.trail.splice(0, 3);
  }
}

// ===== Interface =====
let toastTimer, capTimer;
function caption(text, yellow, ms) {
  const el = $("#caption"); el.textContent = text; el.classList.toggle("yellow", !!yellow); el.style.opacity = 1;
  clearTimeout(capTimer); if (ms) capTimer = setTimeout(() => el.style.opacity = 0, ms);
}
function toast(text) { caption(text, true, 2600); }
function setDead(n, quiet) {
  const first = dead === 0 && n > 0;
  dead = n; $("#dead").textContent = n;
  if (!quiet) { const b = $("#badge"); b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); }
  if (first && !quiet) caption("And we don't like that.", true, 2600);
}
function showCard(html, kind) {
  const c = $("#card"); c.innerHTML = html; c.className = "card" + (kind ? " " + kind : ""); c.onclick = null;
  $("#overlay").hidden = false; const b = $("#card .go"); if (b) b.focus();
}
function hideCard() { $("#overlay").hidden = true; }
function ui() {
  const plan = phase === "plan";
  $("#cFence").textContent = `$${Math.round(fenceLeft())}`;
  $("#tFence").firstChild.textContent = FENCE_TYPES[fenceType].name + " ";
  renderPicker(plan);
  $("#cGuard").textContent = `${(scene.guards || 3) - guards.length}`;
  $("#cGate").textContent = `${gates.filter(Boolean).length}/${MAX_GATES}`;
  document.querySelectorAll("[data-tool]").forEach(b => { b.disabled = !plan; b.classList.toggle("on", b.dataset.tool === tool); });
  $("#bGo").textContent = plan ? "Open gates" : phase === "done" ? "Open gates" : "Stop";
  $("#bGo").disabled = phase === "done";
  $("#status").hidden = plan || (typeof demo !== "undefined" && demo);
  $("#bScene").disabled = !plan;
}
// pause and keyboard shortcuts for playing on PC
function togglePause() {
  if ((phase !== "show" && phase !== "evac") || demo) return;
  paused = !paused;
  if (paused) showCard(`<h2>Paused</h2><p>Everyone is frozen in place. Nobody's complaining, for now.</p>
    <div class="row"><button class="go" id="resume">Resume</button><button id="retry">Back to planning</button><button id="pick">Menu</button></div>`);
  else hideCard();
}
addEventListener("keydown", e => {
  if (e.target && e.target.tagName === "INPUT") return;
  const k = e.key.toLowerCase(), cardOpen = !$("#overlay").hidden;
  if (k === "escape" || k === "p") { if (phase === "show" || phase === "evac") togglePause(); else if (phase === "plan" && !cardOpen) chooser(); return; }
  if (cardOpen) return;
  if (phase === "plan") {
    const tools = { "1": "fence", "2": "gate", "3": "guard", "4": "erase", "5": "prop" };
    if (k === "5" && tool === "prop") { const ks = Object.keys(PROP_TYPES); pickProp(ks[(ks.indexOf(propType) + 1) % ks.length]); return; }
    if (k === "1" && tool === "fence") { const ks = Object.keys(FENCE_TYPES); pickFence(ks[(ks.indexOf(fenceType) + 1) % ks.length]); return; }
    if (tools[k]) { tool = tools[k]; ui(); return; }
    if (k === " " || k === "enter") { e.preventDefault(); startWithRoulette(); return; }
  }
  if (k === "h") $("#bHeat").click();
  if (k === "c") $("#bCam").click();
  if (k === "v") $("#bSpeed").click();
  if (k === "g") {  // glow and focus effects on/off (for slower PCs)
    POST.on = !POST.on; try { localStorage.setItem("mh.fx", POST.on ? "on" : "off"); } catch (er) { /* no storage */ }
    caption(POST.on ? "Fancy effects: ON" : "Fancy effects: OFF (faster)", false, 1400);
  }
});
document.querySelectorAll("[data-tool]").forEach(b => b.addEventListener("click", () => {
  tool = b.dataset.tool; ui();
  if (tool === "gate") toast("Tap the fence at the bottom to open or close gates.");
  if (tool === "guard") toast("Tap the venue to place a guard: they calm people down and stop animals and cars.");
  if (tool === "prop") toast("Tap the venue to place the selected prop. It's paid from the same budget as fences.");
}));
$("#bGo").addEventListener("click", () => phase === "plan" ? startWithRoulette() : backToPlan());
let heat = false, speed = 1;
$("#bHeat").addEventListener("click", () => { heat = !heat; $("#bHeat").classList.toggle("on", heat); });
$("#bCam").addEventListener("click", () => { camMode = (camMode + 1) % 3; $("#bCam").textContent = "Camera: " + ["auto", "close", "far"][camMode]; });
$("#bSpeed").addEventListener("click", () => { speed = speed === 1 ? 2 : speed === 2 ? 4 : 1; $("#bSpeed").textContent = speed + "×"; });
$("#card").addEventListener("click", e => {
  const sk = e.target.closest("[data-scene]");
  if (sk) { loadScene(sk.dataset.scene); hideCard(); caption("You plan it", false, 0); }
  if (e.target.id === "retry") { paused = false; backToPlan(); }
  if (e.target.id === "pick") chooser();
  if (e.target.id === "quit" && window.steam) window.steam.quit();
  if (e.target.id === "fs" && window.steam) window.steam.toggleFullscreen();
});


// picker row above the toolbar: fence materials or props, depending on the tool
function pickFence(type) { fenceType = type; tool = "fence"; ui(); toast(`${FENCE_TYPES[type].name} · $${FENCE_TYPES[type].cost}/m — ${FENCE_TYPES[type].desc}`); }
function pickProp(type) { propType = type; tool = "prop"; ui(); toast(`${PROP_TYPES[type].name} · $${PROP_TYPES[type].cost} — ${PROP_TYPES[type].desc}`); }
let pickerFor = "";
function renderPicker(plan) {
  const el = $("#ftypes"), want = plan && (tool === "fence" || tool === "prop") ? tool : "";
  el.hidden = !want;
  if (want && want !== pickerFor) {
    pickerFor = want;
    const list = want === "fence" ? FENCE_TYPES : PROP_TYPES;
    el.innerHTML = Object.entries(list).map(([k, f]) =>
      `<button data-k="${k}" title="${f.desc}"><i style="background:${f.col}"></i>${f.name}<span class="cnt">$${f.cost}${want === "fence" ? "/m" : ""}</span></button>`).join("");
    el.querySelectorAll("button").forEach(b => b.addEventListener("click", () => want === "fence" ? pickFence(b.dataset.k) : pickProp(b.dataset.k)));
  }
  const cur = want === "fence" ? fenceType : propType;
  el.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.k === cur));
}
