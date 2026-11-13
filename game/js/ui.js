// Human Tsunami · plan editing and interface
// ===== Plan editing =====
let tool = "fence", drag = null;
const maxGuards = () => sandbox ? 16 : (scene.guards || 3) + upg("guards");
const nStewards = () => guards.filter(g => g.role === "slow").length, nGuards = () => guards.length - nStewards();
const fenceUsed = () => gates.reduce((s, g) => s + (g === GATE_SIZES.wide.k ? GATE_SIZES.wide.cost : 0), 0) + fences.reduce((s, f) => s + fenceCost(f), 0) + props.reduce((s, p) => s + PROP_TYPES[p.type].cost, 0) + nStewards() * GUARD_ROLES.slow.cost;   // dollars spent
const fenceLeft = () => sandbox ? 1e9 : FENCE_BUDGET * 10 - fenceUsed();
const snap = v => Math.round(v * 2) / 2;
cv.addEventListener("pointerdown", ev => {
  if (ev.button !== 0) return;   // right/middle button pans the camera
  // during the show, each click uses the megaphone (three times per show)
  if (phase === "show" || phase === "evac") {
    const [x, y] = toWorld(ev);
    if (power !== "mega") { usePower(x, y); return; }
    if (mega.n <= 0 && !sandbox) { caption("The megaphone is out of battery.", true, 1400); return; }
    if (!sandbox) mega.n--; megaUsed = true; mega.active.push({ x, y, t: 3.5 }); rings.push({ x, y, t: 0, mega: true }, { x, y, t: -.18, mega: true }, { x, y, t: -.36, mega: true });   // three sound waves
    shake = Math.min(1, shake + .25); pop(x, y, "CALM DOWN, PLEASE!"); sfx("whistle"); ui(); return;
  }
  if (phase !== "plan") return;
  const [x, y] = toWorld(ev);
  if (tool === "gate") {
    if (Math.abs(y - FENCE_Y) > 3) { toast("Tap a gate on the fence at the bottom."); return; }
    const i = clamp(Math.floor(x / (WW / SLOTS)), 0, SLOTS - 1), open = gates.filter(Boolean).length;
    if (badSlots().includes(i)) { toast(`${SLOT_XS ? "Something is in the way" : scene.slotWhy}: that gate can't be opened.`); return; }
    if (gates[i] && open <= 1) { toast("You need at least one open gate."); return; }
    if (!gates[i] && open >= MAX_GATES) { toast(`There's only enough staff for ${MAX_GATES} gates.`); return; }
    const want = GATE_SIZES[gateSize].k;
    if (gates[i] && gateK(i) !== want) {   // an open gate in another size: resize it
      if (want === GATE_SIZES.wide.k && fenceLeft() < GATE_SIZES.wide.cost) { toast(`A wide gate costs $${GATE_SIZES.wide.cost}.`); return; }
      gates[i] = want; buildWorld(); ui(); sfx("select"); toast(`${GATE_SIZES[gateSize].name}.`); return;
    }
    if (!gates[i] && want === GATE_SIZES.wide.k && fenceLeft() < GATE_SIZES.wide.cost) { toast(`A wide gate costs $${GATE_SIZES.wide.cost}.`); return; }
    gates[i] = gates[i] ? false : want; buildWorld(); ui(); sfx("select"); return;
  }
  if (tool === "guard") {
    if (guardRole === "slow") {
      if (nStewards() >= (sandbox ? 20 : GUARD_ROLES.slow.max + 3 * upg("stewards") + (bm("clones") ? 5 : 0))) { toast("That's every steward the agency had."); return; }
      if (fenceLeft() < GUARD_ROLES.slow.cost) { toast(`A steward costs $${GUARD_ROLES.slow.cost}. Erase something first.`); return; }
    } else if (nGuards() >= maxGuards()) { toast("No guards left. Erase one to move it, or hire stewards from the budget."); return; }
    const gx = snap(x), gy = snap(y), id = cellOf(gx, gy);
    if (gy >= FENCE_Y - .5 || blockedC[id] || !isFinite(fStage[id])) { toast("Put the guard somewhere the crowd will actually be."); return; }
    guards.push({ kind: "guard", role: guardRole, x: gx, y: gy, ang: -Math.PI / 2, t: 0 }); buildWorld(); ui(); sfx("drop"); return;
  }
  if (tool === "prop") {
    const pt = PROP_TYPES[propType], px = snap(x), py = snap(y);
    if (fenceLeft() < pt.cost) { toast(`Not enough budget for a ${pt.name.toLowerCase()} ($${pt.cost}).`); return; }
    if (propType === "screen" && props.some(p => p.type === "screen")) { toast("One big screen per venue. The sponsor is cheap."); return; }
    if (py >= FENCE_Y - 2.5 || py < 1 || px < 1 || px > WW - 1 || blockedC[cellOf(px, py)] || !isFinite(fStage[cellOf(px, py)])) { toast("Put it somewhere the crowd can actually reach (and not on top of the gates)."); return; }
    props.push({ type: propType, x: px, y: py }); buildWorld(); ui(); sfx("drop"); return;
  }
  if (tool === "erase") {
    const gi = guards.findIndex(gd => Math.hypot(gd.x - x, gd.y - y) < 1.2);
    if (gi >= 0) { guards.splice(gi, 1); buildWorld(); ui(); sfx("erase"); return; }
    const pi = props.findIndex(p => Math.hypot(p.x - x, p.y - y) < PROP_TYPES[p.type].r + .8);
    if (pi >= 0) { props.splice(pi, 1); buildWorld(); ui(); sfx("erase"); return; }
    let best = -1, bd = 1.2;
    fences.forEach((f, i) => { const d = contact({ t: "s", ...f, th: 0 }, x, y)[2]; if (d < bd) { bd = d; best = i; } });
    if (best >= 0) { const gid = fences[best].g; if (gid) fences = fences.filter(f => f.g !== gid); else fences.splice(best, 1); buildWorld(); ui(); sfx("erase"); }
    return;
  }
  drag = { ax: snap(x), ay: snap(y), bx: snap(x), by: snap(y), type: fenceType, shape: fenceShape, pts: [[x, y]] }; cv.setPointerCapture(ev.pointerId);
});
cv.addEventListener("pointermove", ev => {
  if (!drag) return;
  const [x, y] = toWorld(ev); let bx = snap(x), by = snap(y);
  const left = fenceLeft() / FENCE_TYPES[drag.type].cost, l = Math.hypot(bx - drag.ax, by - drag.ay);
  if (drag.shape === "line" && l > left) { bx = drag.ax + (bx - drag.ax) * left / l; by = drag.ay + (by - drag.ay) * left / l; }
  drag.bx = clamp(bx, 0, WW); drag.by = clamp(by, 0, WH);
  if (drag.shape === "free") {   // freehand: drop a point every meter or so, while the budget lasts
    const p = drag.pts[drag.pts.length - 1], cx = clamp(x, 0, WW), cy = clamp(y, 0, WH);
    if (Math.hypot(cx - p[0], cy - p[1]) >= 1 && dragLen() + 1 <= left) drag.pts.push([Math.round(cx * 4) / 4, Math.round(cy * 4) / 4]);
  }
  const cost = dragLen() * FENCE_TYPES[drag.type].cost; drag.over = cost > fenceLeft() + .01;
  if (!sandbox) $("#cFence").textContent = `$${Math.round(fenceLeft())} − ${Math.round(cost)}`;   // live price while drawing
});
const dragSegs = () => drag ? shapeSegs(drag.shape, drag.ax, drag.ay, drag.bx, drag.by, drag.pts) : [];
const dragLen = () => dragSegs().reduce((s, q) => s + Math.hypot(q[2] - q[0], q[3] - q[1]), 0);
const endDrag = () => {
  if (!drag) return;
  const segs = dragSegs(), len = dragLen();
  if (drag.over) sfx("error");
  if (drag.over) toast(`That ${FENCE_SHAPES[drag.shape].name.toLowerCase()} costs $${Math.round(len * FENCE_TYPES[drag.type].cost)}. Make it smaller or pick a cheaper fence.`);
  else if (len >= 1 && segs.length) {
    const gid = segs.length > 1 ? "g" + Date.now().toString(36) + ((Math.random() * 1e4) | 0) : undefined;   // prefabs are erased as one piece
    for (const [x0, y0, x1, y1] of segs) fences.push({ ax: x0, ay: y0, bx: x1, by: y1, len: Math.round(Math.hypot(x1 - x0, y1 - y0) * 10) / 10, type: drag.type, g: gid });
    buildWorld(); sfx("drop");
  } else if (fenceLeft() < FENCE_TYPES[fenceType].cost) toast("You're out of budget. Erase something or pick a cheaper fence.");
  drag = null; ui();
};
cv.addEventListener("pointerup", endDrag); cv.addEventListener("pointercancel", endDrag);

// ===== Flow preview (the trails from the video) =====
let preview = [];
// crowding map of the preview: cells where many trails slow down and pile up are future crush points
const DG = 2, dangerW = Math.ceil(WW / DG), dangerH = Math.ceil(SH / DG); let danger = new Float32Array(dangerW * dangerH);
function resetPreview() { preview = []; danger.fill(0); }
function seedParticle() {
  const open = []; for (let i = 0; i < SLOTS; i++) if (gates[i]) open.push(i);
  const i = open[(Math.random() * open.length) | 0];
  const x = slotX(i) + (Math.random() - .5) * SLOT_W * .8, y = FENCE_Y + .6 + Math.random() * 3;
  return { x, y, trail: [], age: 0, life: 6 + Math.random() * 4 };
}
function stepPreview(dt) {
  for (let i = 0; i < danger.length; i++) danger[i] *= Math.exp(-dt / 4);
  while (preview.length < 220) { const p = seedParticle(); p.age = Math.random() * p.life; preview.push(p); }
  for (let k = 0; k < preview.length; k++) {
    let p = preview[k]; p.age += dt;
    const id = cellOf(p.x, p.y);
    if (p.age > p.life || !isFinite(fStage[id]) || fStage[id] < .6) {
      // where trails arrive is where the crowd will press: pile it into the danger map
      if (isFinite(fStage[id]) && fStage[id] < .6) danger[clamp((p.y / DG) | 0, 0, dangerH - 1) * dangerW + clamp((p.x / DG) | 0, 0, dangerW - 1)] += 1;
      preview[k] = seedParticle(); continue;
    }
    const sp = 7 + (k % 5);
    p.x += (dirS[id * 2] + (Math.random() - .5) * .5) * sp * dt; p.y += (dirS[id * 2 + 1] + (Math.random() - .5) * .5) * sp * dt;
    p.trail.push(p.x, p.y, fStage[id]); if (p.trail.length > 90) p.trail.splice(0, 3);
  }
}

// ===== Interface =====
let toastTimer, capTimer;
const MILESTONES = { 10: "10 pancaked. Thoughts and prayers.", 50: "50 pancaked. HR would like a word.", 100: "100 PANCAKED — a new personal worst!", 250: "250. The insurance company just hung up.",
  500: "500 PANCAKED. This is now a documentary.", 1000: "1,000. They will name the law after you.", 2000: "2,000. At this point it's just impressive." };
function caption(text, yellow, ms) {
  const el = $("#caption"); el.textContent = text; el.classList.toggle("yellow", !!yellow); el.style.opacity = 1;
  clearTimeout(capTimer); if (ms) capTimer = setTimeout(() => el.style.opacity = 0, ms);
}
function toast(text) { caption(text, true, 2600); }
function setDead(n, quiet) {
  const first = dead === 0 && n > 0;
  dead = n; $("#dead").textContent = n + (window.__deadOffset || 0);   // trailer recordings keep one running total
  if (!quiet) { const b = $("#badge"); b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); }
  if (first && !quiet) caption("And we don't like that.", true, 2600);
  const ms = MILESTONES[n]; if (ms && !quiet) { caption(ms, true, 2600); { const el = $("#caption"); el.classList.remove("slam"); void el.offsetWidth; el.classList.add("slam"); setTimeout(() => el.classList.remove("slam"), 2700); } flash = Math.max(flash, .8); slowT = Math.max(slowT, .5); sfx("boom"); shake = Math.min(1, shake + .5); announce(n >= 500 ? "game_over" : "war_call_for_backup"); }
}
function showCard(html, kind) {
  const c = $("#card"); c.innerHTML = html; c.className = "card" + (kind ? " " + kind : ""); c.onclick = null;
  const menu = (kind || "").startsWith("menu") || kind === "options" || (typeof demo !== "undefined" && demo);   // no game toolbar behind the menus
  $("#bar").style.visibility = menu ? "hidden" : ""; $("#ftypes").style.display = menu ? "none" : "";
  $("#overlay").hidden = false; const b = $("#card .go"); if (b) b.focus();
}
function hideCard() { $("#overlay").hidden = true; $("#bar").style.visibility = ""; $("#ftypes").style.display = ""; }
function ui() {
  const plan = phase === "plan";
  $("#cFence").textContent = sandbox ? "∞" : `$${Math.round(fenceLeft())}`;
  $("#tFence").firstChild.textContent = FENCE_TYPES[fenceType].name + " ";
  renderPicker(plan);
  $("#cGuard").textContent = `${maxGuards() - nGuards()}`;
  $("#cGate").textContent = `${gates.filter(Boolean).length}/${MAX_GATES}`;
  document.querySelectorAll("[data-tool]").forEach(b => { b.disabled = !plan; b.classList.toggle("on", b.dataset.tool === tool); });
  $("#bGo").textContent = plan ? "Open gates" : phase === "done" ? "Open gates" : "Stop";
  $("#bGo").disabled = phase === "done";
  $("#status").hidden = plan || (typeof demo !== "undefined" && demo);
  $("#bScene").disabled = !plan;
  trackPlan();
}
// ===== The plan: saved per venue, with undo =====
const planKey = () => "mh.plan." + (sandbox ? "sb." : "") + sceneKey;
const planState = () => JSON.stringify({ gates, fences: fences.map(f => ({ ax: f.ax, ay: f.ay, bx: f.bx, by: f.by, len: f.len, type: f.type || "steel", g: f.g })), guards: guards.map(g => [g.x, g.y, g.role || "calm"]), props });
let lastPlan = null, planHistory = [], undoing = false;
function applyPlan(json) {
  try {
    const o = JSON.parse(json);
    if (!Array.isArray(o.gates) || o.gates.length !== SLOTS || !o.gates.some(Boolean)) return false;
    gates = o.gates.map((g, i) => !!g && !badSlots().includes(i) ? (g === true ? true : +g || true) : false); if (!gates.some(Boolean)) gates = scene.gates.slice();
    fences = (o.fences || []).filter(f => FENCE_TYPES[f.type] && [f.ax, f.ay, f.bx, f.by, f.len].every(Number.isFinite)).map(f => ({ ...f }));
    guards = (o.guards || []).filter(g => Number.isFinite(g[0]) && Number.isFinite(g[1])).map(([x, y, role]) => ({ kind: "guard", role: GUARD_ROLES[role] ? role : "calm", x, y, ang: -Math.PI / 2, t: 0 }));
    props = (o.props || []).filter(p => PROP_TYPES[p.type] && Number.isFinite(p.x) && Number.isFinite(p.y)).map(p => ({ type: p.type, x: p.x, y: p.y }));
    buildWorld(); return true;
  } catch (e) { return false; }
}
function trackPlan() {
  if (phase !== "plan" || demo) return;
  const cur = planState();
  if (lastPlan !== null && cur !== lastPlan && !undoing) { planHistory.push(lastPlan); if (planHistory.length > 80) planHistory.shift(); }
  if (cur !== lastPlan && !window.__manual) { try { localStorage.setItem(planKey(), cur); } catch (e) { /* no storage */ } }
  lastPlan = cur;
}
function loadPlan() {
  planHistory = []; lastPlan = null;
  let saved = null; try { if (!window.__manual) saved = localStorage.getItem(planKey()); } catch (e) { /* no storage */ }   // recordings and tests start clean
  return !!saved && applyPlan(saved);
}
function undoPlan() {
  if (phase !== "plan" || !planHistory.length) { toast("Nothing to undo."); return; }
  undoing = true; applyPlan(planHistory.pop()); ui(); undoing = false;
}
function clearPlan() {
  if (phase !== "plan") return;
  gates = scene.gates.slice(); fences = []; guards = []; props = []; buildWorld(); ui(); toast("Plan cleared. Ctrl+Z brings it back.");
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
  if (k === "enter" && atTitle && !$("#overlay").hidden && $("#card").classList.contains("title")) { chooser(); return; }
  if (k === "escape" || k === "p") { if (phase === "show" || phase === "evac") togglePause(); else if (phase === "plan" && !cardOpen) chooser(); return; }
  if (cardOpen) return;
  if (phase === "plan" && k === "z" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); undoPlan(); return; }
  if (phase === "plan" && (k === "delete" || k === "backspace")) { e.preventDefault(); clearPlan(); return; }
  if (e.ctrlKey || e.metaKey) return;
  if (phase === "plan") {
    const tools = { "1": "fence", "2": "gate", "3": "guard", "4": "erase", "5": "prop" };
    if (k === "5" && tool === "prop") { const ks = Object.keys(PROP_TYPES).filter(gadgetOpen); pickProp(ks[(ks.indexOf(propType) + 1) % ks.length]); return; }
    if (k === "3" && tool === "guard") { pickRole(guardRole === "calm" ? "slow" : "calm"); return; }
    if (k === "f" && tool === "fence") { const ks = Object.keys(FENCE_SHAPES); pickShape(ks[(ks.indexOf(fenceShape) + 1) % ks.length]); return; }
    if (k === "1" && tool === "fence") { const ks = Object.keys(FENCE_TYPES); pickFence(ks[(ks.indexOf(fenceType) + 1) % ks.length]); return; }
    if (tools[k]) { tool = tools[k]; ui(); return; }
    if (k === " " || k === "enter") { e.preventDefault(); startWithRoulette(); return; }
  }
  if (k === "h") $("#bHeat").click();
  if (k === "c") $("#bCam").click();
  if (k === "x") { camMode = camMode === 4 ? 0 : 4; camFree = null; camLabel(); }   // street-level camera
  if (k === "v") $("#bSpeed").click();
  if (k === "g") {  // glow and focus effects on/off (for slower PCs)
    POST.on = !POST.on; try { localStorage.setItem("mh.fx", POST.on ? "on" : "off"); } catch (er) { /* no storage */ }
    caption(POST.on ? "Fancy effects: ON" : "Fancy effects: OFF (faster)", false, 1400);
  }
});
document.querySelectorAll("[data-tool]").forEach(b => b.addEventListener("click", () => {
  tool = b.dataset.tool; pickerClosed = ""; ui();
  if (tool === "gate") toast("Pick a gate size, then tap a gate at the bottom to open, resize or close it.");
  if (tool === "guard") toast("Tap the venue to place security. Guards calm people; stewards slow them down before a bottleneck.");
  if (tool === "prop") toast("Tap the venue to place the selected prop. It's paid from the same budget as fences.");
}));
// Stop doesn't throw the show away: it pauses and asks whether to keep going, start over or go back to planning
$("#bGo").addEventListener("click", () => phase === "plan" ? startWithRoulette() : phase === "done" ? backToPlan() : stopMenu());
function stopMenu() {
  if ((phase !== "show" && phase !== "evac") || demo) return;
  paused = true;
  showCard(`<h2>Stopped</h2><p>The show is frozen right where it was. ${dead ? `${dead.toLocaleString("en")} pancaked so far.` : "Nobody hurt so far."}</p>
    <div class="row"><button class="go" id="resume">Keep going</button><button id="again">Start this show over</button><button id="retry">Back to planning</button></div>`);
}
let heat = false, speed = 1;
$("#bHeat").addEventListener("click", () => { heat = !heat; $("#bHeat").classList.toggle("on", heat); });
const camLabel = () => { $("#bCam").textContent = "Camera: " + ["auto", "close", "far", "free", "street"][camMode]; };
$("#bCam").addEventListener("click", () => { camMode = camMode === 3 ? 0 : camMode === 2 ? 4 : camMode === 4 ? 0 : camMode + 1; camFree = null; camLabel(); });
// ===== Free camera: wheel zooms toward the cursor, right/middle drag or WASD/arrows pan =====
function freeCam() { if (camMode !== 3 || !camFree) { camFree = { z: Math.max(1, cam.z), x: cam.x, y: cam.y }; camMode = 3; camLabel(); } return camFree; }
function clampFree() { const f = camFree, hw = WW / (2 * f.z), hh = WH / (2 * f.z); f.x = clamp(f.x, hw, WW - hw); f.y = clamp(f.y, hh, WH - hh); }
cv.addEventListener("wheel", ev => {
  ev.preventDefault(); if (demo) return;
  if (camMode === 4) { cineDist = clamp(cineDist * Math.exp(ev.deltaY * .0012), CINE_MIN(), 34); return; }   // street camera: the wheel moves it closer or farther
  const [wx, wy] = toWorld(ev), f = freeCam(), z0 = f.z, z1 = clamp(z0 * Math.exp(-ev.deltaY * .0015), 1, ZMAX());
  f.x = wx + (f.x - wx) * z0 / z1; f.y = wy + (f.y - wy) * z0 / z1; f.z = z1; clampFree();
  if (z1 <= 1.001 && phase === "plan") { camMode = 0; camFree = null; camLabel(); }   // fully zoomed out while planning: back to auto
}, { passive: false });
let panDrag = null;
cv.addEventListener("contextmenu", ev => ev.preventDefault());
cv.addEventListener("pointerdown", ev => {
  if ((ev.button !== 1 && ev.button !== 2) || demo) return;
  ev.preventDefault(); const [x, y] = toWorld(ev); panDrag = { x, y }; freeCam(); cv.setPointerCapture(ev.pointerId);
});
cv.addEventListener("pointermove", ev => {
  if (!panDrag || !camFree) return;
  const [x, y] = toWorld(ev); camFree.x += (panDrag.x - x) * .9; camFree.y += (panDrag.y - y) * .9; clampFree();
});
addEventListener("pointerup", () => { panDrag = null; });
const keysDown = new Set();
addEventListener("keydown", e => { if (!e.ctrlKey && !e.metaKey) keysDown.add(e.key.toLowerCase()); });
addEventListener("keyup", e => keysDown.delete(e.key.toLowerCase()));
addEventListener("blur", () => keysDown.clear());
function camKeys(dt) {
  if (demo || !$("#overlay").hidden) return;
  const r = (keysDown.has("d") || keysDown.has("arrowright") ? 1 : 0) - (keysDown.has("a") || keysDown.has("arrowleft") ? 1 : 0);
  const u = (keysDown.has("w") || keysDown.has("arrowup") ? 1 : 0) - (keysDown.has("s") || keysDown.has("arrowdown") ? 1 : 0);
  const zz = (keysDown.has("e") || keysDown.has("+") || keysDown.has("=") ? 1 : 0) - (keysDown.has("q") || keysDown.has("-") ? 1 : 0);
  if (!r && !u && !zz) return;
  if (camMode === 4) { cineAng += r * dt * 1.2; cineDist = clamp(cineDist * Math.exp(-(u + zz) * 1.2 * dt), CINE_MIN(), 34); return; }
  const f = freeCam(), sp = 28 / f.z * dt;
  // screen right/up in world coordinates (the venue is rotated on wide screens)
  if (LAND) { f.y += r * sp * VIEW_FLIP; f.x += u * sp * VIEW_FLIP; } else { f.x += r * sp * VIEW_FLIP; f.y -= u * sp * VIEW_FLIP; }
  f.z = clamp(f.z * Math.exp(zz * 1.6 * dt), 1, ZMAX()); clampFree();
}
$("#bSpeed").addEventListener("click", () => { speed = speed === 1 ? 2 : speed === 2 ? 4 : speed === 4 ? .5 : 1; $("#bSpeed").textContent = (speed === .5 ? "0.5" : speed) + "×"; });
$("#card").addEventListener("click", e => {
  const sk = e.target.closest("[data-scene]");
  if (sk) { loadScene(sk.dataset.scene); hideCard(); caption(!SLOT_XS ? "You plan it" : ROUTE.side && ROUTE.b ? "New route: B-stage mid-show, and they leave by the side exit" : ROUTE.side ? "New route: after the show they leave by the side exit" : ROUTE.b ? "New route: halfway through, the show moves to the B-stage" : "The entrances moved! You plan it", false, 0); }
  if (e.target.id === "retry") { paused = false; backToPlan(); }
  if (e.target.id === "pick") { if (atTitle) titleScreen(); else chooser(); }
  if (e.target.closest && e.target.closest("#start")) chooser();
  if (e.target.id === "title") titleScreen();
  if (e.target.id === "options") showOptions();
  if (e.target.closest && e.target.closest("#shop")) showShop();
  if (e.target.id === "howto") showHowTo();
  if (e.target.id === "again") { paused = false; backToPlan(); startWithRoulette(); }
  if (e.target.id === "quit" && window.steam) window.steam.quit();
  if (e.target.id === "fs" && window.steam) window.steam.toggleFullscreen();
});


// picker row above the toolbar: fence materials or props, depending on the tool
function pickFence(type) { fenceType = type; tool = "fence"; ui(); toast(`${FENCE_TYPES[type].name} · $${FENCE_TYPES[type].cost}/m — ${FENCE_TYPES[type].desc}`); }
function pickProp(type) { propType = type; tool = "prop"; ui(); toast(`${PROP_TYPES[type].name} · $${PROP_TYPES[type].cost} — ${PROP_TYPES[type].desc}`); }
function pickShape(k) { fenceShape = k; tool = "fence"; ui(); toast(`${FENCE_SHAPES[k].name} — ${FENCE_SHAPES[k].desc}`); }
function pickRole(k) { guardRole = k; tool = "guard"; ui(); toast(`${GUARD_ROLES[k].name} — ${GUARD_ROLES[k].desc}`); }
let pickerFor = "", pickerClosed = "";
const PICK_TITLE = { fence: "Barrier type & shape", prop: "Props", guard: "Security", gate: "Gate size", powers: "Megaphone & chaos powers", sand: "Sandbox" };
// every picker gets a title and a close button; it pops back up when its tool is picked again
function pickerChrome(el, want) {
  const k = want.startsWith("mayhem") ? "Mayhem" : PICK_TITLE[want] || "";
  el.insertAdjacentHTML("afterbegin", `<div class="ptitle">${k}</div><button class="pclose" title="Hide">✕</button>`);
  el.querySelector(".pclose").addEventListener("click", ev => { ev.stopPropagation(); pickerClosed = want; el.hidden = true; });
}
function renderPicker(plan) {
  const live = phase === "show" || phase === "evac";
  const el = $("#ftypes"), want = plan && (tool === "fence" || tool === "prop" || tool === "guard" || tool === "gate") ? tool : sandbox && live && !demo ? "mayhem:" + sceneKey : live && !demo ? "powers" : sandbox && plan ? "sand" : "";
  if (want === "powers") {   // chaos powers: rebuilt every time, the charges change
    pickerFor = want;
    el.innerHTML = Object.entries(POWERS).filter(([k, p]) => !p.bm || bm(k) || sandbox).map(([k, p]) => { const n = k === "mega" ? mega.n : charges[k] || 0;
      return `<button data-pw="${k}" class="${power === k ? "on" : ""}" title="${p.desc}" ${n <= 0 ? "disabled" : ""}>${p.icon} ${p.name}<span class="cnt">×${n}</span></button>`; }).join("");
    pickerChrome(el, want); el.hidden = pickerClosed === want;
    el.querySelectorAll("button[data-pw]").forEach(b => b.addEventListener("click", () => { power = b.dataset.pw; ui(); if (power !== "mega") toast(`${POWERS[power].name}: ${POWERS[power].desc}. Click the venue.`); }));
    return;
  }
  el.hidden = !want || pickerClosed === want;
  if (want && want !== pickerFor) {
    pickerFor = want;
    if (want.startsWith("mayhem")) {
      // sandbox: one button per disaster
      const evs = [...new Set(scene.events)];
      el.innerHTML = evs.map(k => `<button data-ev="${k}">${EVENT_NAMES[k] || k}</button>`).join("") +
        `<button data-ev="*" class="go">Anything!</button><button data-ev="!drop">Music drop</button><button data-ev="!more">+300 people</button><button data-ev="!dark">Blackout</button><button data-ev="!end">End show</button>`;
      el.querySelectorAll("button").forEach(b => b.addEventListener("click", () => mayhem(b.dataset.ev)));
    } else if (want === "sand") {
      el.innerHTML = `<button data-sand="crowd"></button><span class="sandnote">Sandbox: no budget, no limits, nothing counts. Pick the fence or props tool to build.</span>`;
      el.querySelector("button").addEventListener("click", () => { sandCrowd = sandCrowd === 1 ? 1.5 : sandCrowd === 1.5 ? .5 : 1; ui(); });
    } else if (want === "gate") {   // gate sizes: click a closed gate to open it in this size, an open one to resize it
      el.innerHTML = Object.entries(GATE_SIZES).map(([k, g]) => `<button data-k="${k}" title="${g.desc}"><i style="background:#d8322b;width:${Math.round(g.k * 14)}px"></i>${g.name}<span class="cnt">${g.cost && !sandbox ? "$" + g.cost : "free"}</span></button>`).join("");
      el.querySelectorAll("button").forEach(b => b.addEventListener("click", () => { gateSize = b.dataset.k; ui(); toast(`${GATE_SIZES[gateSize].name}: ${GATE_SIZES[gateSize].desc}. Click a gate to open or resize it.`); }));
    } else if (want === "guard") {
      el.innerHTML = Object.entries(GUARD_ROLES).map(([k, f]) => `<button data-k="${k}" title="${f.desc}"><i style="background:${f.col}"></i>${f.name}<span class="cnt">${f.cost && !sandbox ? "$" + f.cost : f.cost ? "" : "free"}</span></button>`).join("");
      el.querySelectorAll("button").forEach(b => b.addEventListener("click", () => pickRole(b.dataset.k)));
    } else {
      const list = want === "fence" ? FENCE_TYPES : PROP_TYPES;
      el.innerHTML = Object.entries(list).filter(([k]) => want === "fence" || gadgetOpen(k)).map(([k, f]) =>
        `<button data-k="${k}" title="${f.desc}"><i style="background:${f.col}"></i>${f.name}<span class="cnt">${sandbox ? "" : "$" + f.cost + (want === "fence" ? "/m" : "")}</span></button>`).join("") +
        (want === "fence" ? `<span class="sep"></span>` + Object.entries(FENCE_SHAPES).map(([k, f]) => `<button data-shape="${k}" title="${f.desc}">${f.name}</button>`).join("") : "");
      el.querySelectorAll("button[data-k]").forEach(b => b.addEventListener("click", () => want === "fence" ? pickFence(b.dataset.k) : pickProp(b.dataset.k)));
      el.querySelectorAll("button[data-shape]").forEach(b => b.addEventListener("click", () => pickShape(b.dataset.shape)));
    }
  }
  if (want && !el.querySelector(".pclose")) pickerChrome(el, want);
  if (want === "sand") el.querySelector("button[data-sand]").textContent = `Crowd size: ×${sandCrowd} (${Math.min(5800, Math.round(scene.crowd * sandCrowd)).toLocaleString("en")})`;
  const cur = want === "fence" ? fenceType : want === "guard" ? guardRole : want === "gate" ? gateSize : propType;
  el.querySelectorAll("button[data-shape]").forEach(b => b.classList.toggle("on", b.dataset.shape === fenceShape));
  el.querySelectorAll("button[data-k]").forEach(b => b.classList.toggle("on", b.dataset.k === cur));
}
// sandbox buttons during the show
function mayhem(k) {
  if (phase !== "show" && phase !== "evac") return;
  if (k === "*") { const pool = chaosPool(); spawnEvent(pool[(Math.random() * pool.length) | 0]); }
  else if (k === "!drop") { surgeT = 3.5; onDrop(false); }
  else if (k === "!more") { const n = ag.length < 5600 ? spawnAt(openGateX(), 60, 300) : 0; pop(20, 58, n ? `+${n} PEOPLE!` : "FULL!"); }
  else if (k === "!dark") { blackT = 6; sfx("boom"); caption("Lights out!", true, 1500); }
  else if (k === "!end") { if (phase === "show") startEvac(); }
  else spawnEvent(k);
}

// every button clicks
document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("button"); if (b && !b.disabled) sfx(b.id === "pick" || b.id === "retry" ? "back" : "click"); }, true);
