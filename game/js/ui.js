// Marea Humana · edición del plan e interfaz
// ===== Edición del plan =====
let tool = "fence", drag = null;
const fenceUsed = () => fences.reduce((s, f) => s + f.len, 0);
const snap = v => Math.round(v * 2) / 2;
cv.addEventListener("pointerdown", ev => {
  // durante el show, cada clic usa el megáfono (tres veces por show)
  if (phase === "show" || phase === "evac") {
    const [x, y] = toWorld(ev);
    if (mega.n <= 0) { caption("Ya no queda batería en el megáfono.", true, 1400); return; }
    mega.n--; mega.active.push({ x, y, t: 3.5 }); rings.push({ x, y, t: 0, mega: true });
    pop(x, y, "¡CALMA, POR FAVOR!"); sfx("whistle"); return;
  }
  if (phase !== "plan") return;
  const [x, y] = toWorld(ev);
  if (tool === "gate") {
    if (Math.abs(y - FENCE_Y) > 3) { toast("Toca una puerta de la reja de abajo."); return; }
    const i = clamp(Math.floor(x / (WW / SLOTS)), 0, SLOTS - 1), open = gates.filter(Boolean).length;
    if ((scene.noSlots || []).includes(i)) { toast(`${scene.slotWhy}: no se puede abrir esa puerta.`); return; }
    if (gates[i] && open <= 1) { toast("Necesitas al menos una puerta abierta."); return; }
    if (!gates[i] && open >= MAX_GATES) { toast(`Solo hay personal para ${MAX_GATES} puertas.`); return; }
    gates[i] = !gates[i]; buildWorld(); ui(); return;
  }
  if (tool === "guard") {
    if (guards.length >= (scene.guards || 3)) { toast("No quedan guardias. Borra uno para moverlo."); return; }
    const gx = snap(x), gy = snap(y), id = cellOf(gx, gy);
    if (gy >= FENCE_Y - .5 || blockedC[id] || !isFinite(fStage[id])) { toast("Pon al guardia en una zona donde esté el público."); return; }
    guards.push({ kind: "guard", x: gx, y: gy, ang: -Math.PI / 2, t: 0 }); buildWorld(); ui(); return;
  }
  if (tool === "erase") {
    const gi = guards.findIndex(gd => Math.hypot(gd.x - x, gd.y - y) < 1.2);
    if (gi >= 0) { guards.splice(gi, 1); buildWorld(); ui(); return; }
    let best = -1, bd = 1.2;
    fences.forEach((f, i) => { const d = contact({ t: "s", ...f, th: 0 }, x, y)[2]; if (d < bd) { bd = d; best = i; } });
    if (best >= 0) { fences.splice(best, 1); buildWorld(); ui(); }
    return;
  }
  drag = { ax: snap(x), ay: snap(y), bx: snap(x), by: snap(y) }; cv.setPointerCapture(ev.pointerId);
});
cv.addEventListener("pointermove", ev => {
  if (!drag) return;
  const [x, y] = toWorld(ev); let bx = snap(x), by = snap(y);
  const left = FENCE_BUDGET - fenceUsed(), l = Math.hypot(bx - drag.ax, by - drag.ay);
  if (l > left) { bx = drag.ax + (bx - drag.ax) * left / l; by = drag.ay + (by - drag.ay) * left / l; }
  drag.bx = clamp(bx, 0, WW); drag.by = clamp(by, 0, WH);
});
const endDrag = () => {
  if (!drag) return;
  const len = Math.hypot(drag.bx - drag.ax, drag.by - drag.ay);
  if (len >= 1) { fences.push({ ...drag, len: Math.round(len * 10) / 10 }); buildWorld(); }
  else if (FENCE_BUDGET - fenceUsed() < 1) toast("No te quedan metros de valla. Borra alguna.");
  drag = null; ui();
};
cv.addEventListener("pointerup", endDrag); cv.addEventListener("pointercancel", endDrag);

// ===== Vista previa del flujo (las estelas del video) =====
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

// ===== Interfaz =====
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
  if (first && !quiet) caption("Y eso no nos gusta.", true, 2600);
}
function showCard(html, kind) {
  const c = $("#card"); c.innerHTML = html; c.className = "card" + (kind ? " " + kind : ""); c.onclick = null;
  $("#overlay").hidden = false; const b = $("#card .go"); if (b) b.focus();
}
function hideCard() { $("#overlay").hidden = true; }
function ui() {
  const plan = phase === "plan";
  $("#cFence").textContent = `${Math.round(FENCE_BUDGET - fenceUsed())} m`;
  $("#cGuard").textContent = `${(scene.guards || 3) - guards.length}`;
  $("#cGate").textContent = `${gates.filter(Boolean).length}/${MAX_GATES}`;
  document.querySelectorAll("[data-tool]").forEach(b => { b.disabled = !plan; b.classList.toggle("on", b.dataset.tool === tool); });
  $("#bGo").textContent = plan ? "Abrir puertas" : phase === "done" ? "Abrir puertas" : "Detener";
  $("#bGo").disabled = phase === "done";
  $("#status").hidden = plan || (typeof demo !== "undefined" && demo);
  $("#bScene").disabled = !plan;
}
// pausa y atajos de teclado para jugar en PC
function togglePause() {
  if ((phase !== "show" && phase !== "evac") || demo) return;
  paused = !paused;
  if (paused) showCard(`<h2>Pausa</h2><p>La gente se quedó congelada. Nadie se queja, por ahora.</p>
    <div class="row"><button class="go" id="resume">Continuar</button><button id="retry">Volver a planear</button><button id="pick">Menú</button></div>`);
  else hideCard();
}
addEventListener("keydown", e => {
  if (e.target && e.target.tagName === "INPUT") return;
  const k = e.key.toLowerCase(), cardOpen = !$("#overlay").hidden;
  if (k === "escape" || k === "p") { if (phase === "show" || phase === "evac") togglePause(); else if (phase === "plan" && !cardOpen) chooser(); return; }
  if (cardOpen) return;
  if (phase === "plan") {
    const tools = { "1": "fence", "2": "gate", "3": "guard", "4": "erase" };
    if (tools[k]) { tool = tools[k]; ui(); return; }
    if (k === " " || k === "enter") { e.preventDefault(); startWithRoulette(); return; }
  }
  if (k === "h") $("#bHeat").click();
  if (k === "c") $("#bCam").click();
  if (k === "v") $("#bSpeed").click();
});
document.querySelectorAll("[data-tool]").forEach(b => b.addEventListener("click", () => {
  tool = b.dataset.tool; ui();
  if (tool === "gate") toast("Toca la reja de abajo para abrir o cerrar puertas.");
  if (tool === "guard") toast("Toca la plaza para poner un guardia: calma a la gente y detiene animales y coches.");
}));
$("#bGo").addEventListener("click", () => phase === "plan" ? startWithRoulette() : backToPlan());
let heat = false, speed = 1;
$("#bHeat").addEventListener("click", () => { heat = !heat; $("#bHeat").classList.toggle("on", heat); });
$("#bCam").addEventListener("click", () => { camMode = (camMode + 1) % 3; $("#bCam").textContent = "Cámara: " + ["auto", "cerca", "lejos"][camMode]; });
$("#bSpeed").addEventListener("click", () => { speed = speed === 1 ? 2 : speed === 2 ? 4 : 1; $("#bSpeed").textContent = speed + "×"; });
$("#card").addEventListener("click", e => {
  const sk = e.target.closest("[data-scene]");
  if (sk) { loadScene(sk.dataset.scene); hideCard(); caption("Tú lo planeas", false, 0); }
  if (e.target.id === "retry") { paused = false; backToPlan(); }
  if (e.target.id === "pick") chooser();
  if (e.target.id === "quit" && window.steam) window.steam.quit();
  if (e.target.id === "fs" && window.steam) window.steam.toggleFullscreen();
});

