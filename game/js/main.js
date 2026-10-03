// Marea Humana · efectos, bucle principal y arranque
// ===== Efectos: cámara, estelas, luces, confeti =====
const CONF = ["#ff6fb1", "#5fd8ff", "#ffe066", "#a98bff", "#ff9a5c", "#ffffff", "#7dff9e"];
const TRAIL = Array.from({ length: 12 }, (_, i) => { const q = i / 11; return `rgba(${Math.round(255 - 55 * q)},${Math.round(140 + 95 * q)},${Math.round(50 + 205 * q)},.6)`; });
let cam = { z: 1, x: WW / 2, y: WH / 2 }, shake = 0, heatMix = 0, flash = 0, rings = [], confetti = [];
function resetFx() { cam = { z: 1, x: WW / 2, y: WH / 2 }; shake = 0; flash = 0; rings = []; confetti = []; puffs = []; sparks = []; rockets = []; ola = null; windF = { x: 0, t: 0 }; if (G3.tctx) G3.tctx.clearRect(0, 0, G3.trail.width, G3.trail.height); }
function confettiAt(x, y, h, n, spread) {
  for (let i = 0; i < n && confetti.length < 1400; i++) {
    const a = Math.random() * 6.283, v = Math.random() * spread;
    confetti.push({ x, y, h, vx: Math.cos(a) * v, vy: Math.sin(a) * v + spread * .25, vh: 2 + Math.random() * 6, rx: Math.random() * 6, ry: Math.random() * 6, rz: Math.random() * 6,
      vr: (Math.random() - .5) * 12, c: (Math.random() * CONF.length) | 0, life: 4 + Math.random() * 3 });
  }
}
function burst(n) { for (let i = 0; i < n; i += 20) { const b = scene.beams[(Math.random() * scene.beams.length) | 0]; confettiAt(b.x + (Math.random() - .5) * 4, b.y + 1, b.h || 7, 20, 7); } }
function burstAt(x, y, n) { confettiAt(x, y, 1, n, 6); }
function onDrop(first) {
  flash = 1; burst(260); sfx("cheer");
  caption(first ? "Física de multitudes real" : scene.acts[(Math.random() * scene.acts.length) | 0], false, 1900);
}
function onFall(x, y) {
  rings.push({ x, y, t: 0 }); shake = Math.min(.9, shake + .35); sfx("scream");
  if (dead === 0) { G3.wantPhoto = true; slowT = 1.8; focus = { x, y }; caption("¡Ay!", true, 1500); }
}
function updateFx(dt) {
  let tz = 1, ty = WH / 2, tx = WW / 2;
  if (phase === "show" || phase === "evac") {
    let sy = 0, n = 0;
    for (let i = 0; i < ag.length; i += 5) { const a = ag[i]; if (a.y < FENCE_Y) { sy += a.y; n++; } }
    tz = phase === "show" ? (surgeT > 0 ? 1.95 : 1.6) : 1.3;
    if (camMode === 1) tz *= 1.7; else if (camMode === 2) tz = 1;
    if (n > 40) ty = sy / n;
  }
  // cámara lenta con acercamiento al primer pisoteado
  if (slowT > 0 && focus) { tz = 2.7; ty = focus.y; tx = focus.x; }
  const kz = 1 - Math.pow(slowT > 0 ? .02 : .3, Math.max(dt, slowT > 0 ? .016 : 0));
  cam.z += (tz - cam.z) * kz; cam.y += (ty - cam.y) * kz * (slowT > 0 ? 1 : .6); cam.x += (tx - cam.x) * kz;
  const hw = WW / (2 * cam.z), hh = WH / (2 * cam.z);
  cam.x = clamp(cam.x, hw, WW - hw); cam.y = clamp(cam.y, hh, WH - hh);
  shake *= Math.pow(.03, dt); flash *= Math.pow(.04, dt);
  heatMix += ((heat || surgeT > 0 ? 1 : 0) - heatMix) * (1 - Math.pow(.015, dt));
  for (const r of rings) r.t += dt; rings = rings.filter(r => r.t < 1.3);
  for (const q of pops) q.t += Math.max(dt, .016); pops = pops.filter(q => q.t < 1.6);
  stepPerformers(dt);
  const drag = Math.pow(.35, dt);
  for (const c of confetti) {
    if (c.h > .03) { c.vx *= drag; c.vy *= drag; c.vh = Math.max(-2.2, c.vh - 6 * dt); c.x += (c.vx + Math.sin(c.rz * 2) * .6) * dt; c.y += c.vy * dt; c.h += c.vh * dt; c.rx += c.vr * dt; c.rz += c.vr * .7 * dt; }
    else { c.h = .03; c.rx = Math.PI / 2; c.life -= dt * .6; }
    c.life -= dt * .25;
  }
  confetti = confetti.filter(c => c.life > 0);
  // chispas de fuegos artificiales y humo (bengalas, polvo de la pista)
  const sd = Math.pow(.5, dt);
  for (const p of sparks) { p.vx *= sd; p.vy *= sd; p.vh = p.vh * sd - 6 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.h += p.vh * dt; p.life -= dt; }
  sparks = sparks.filter(p => p.life > 0 && p.h > 0);
  for (const p of puffs) { p.h += p.vh * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += dt * p.grow; p.life -= dt; }
  puffs = puffs.filter(p => p.life > 0);
}
function puff(x, y, h, col, r, life, vh) {
  if (puffs.length > 700) return;
  puffs.push({ x, y, h, col, r, life, max: life, vh: vh ?? 1.2, vx: (Math.random() - .5) * .6, vy: (Math.random() - .5) * .6, grow: .7 });
}
// ===== Bucle =====
const perf = { n: 0, sum: 0, level: 0 }, live3d = () => phase === "show" || phase === "evac";
let last = performance.now();
let paused = false, slowT = 0, focus = null, acc = 0;
function frame(now) {
  const real = Math.min(.1, (now - last) / 1000); last = now;
  const sp = paused ? 0 : speed * (slowT > 0 ? .22 : 1);
  if (slowT > 0) slowT -= real;
  if (phase === "show" || phase === "evac") {
    acc += real / DT * sp; const n = Math.min(10, Math.floor(acc)); acc -= n; if (acc > 10) acc = 0;
    for (let i = 0; i < n && (phase === "show" || phase === "evac"); i++) step();
    const ab = $("#abd"); ab.hidden = !abducted; if (abducted) ab.textContent = `Abducidos ${abducted}`;
    $("#status").textContent = phase === "show"
      ? (spawned < CROWD ? `Entrando ${spawned} / ${CROWD}` : `En el show · termina en ${Math.max(0, Math.ceil(fullAt + SHOW_TIME - t))} s`) + ` · Megáfono ${mega.n}`
      : `Evacuando · quedan ${ag.length} · Megáfono ${mega.n}`;
  } else if (phase === "plan") stepPreview(real);
  updateFx(real * (phase === "show" || phase === "evac" ? sp : 1));
  audioTick();
  render3D(now, real);
  // calidad automática: si el equipo no da abasto, quitamos sombras de la gente y bajamos resolución
  if (G3.renderer && live3d()) {
    perf.n++; perf.sum += real;
    if (perf.n >= 90) {
      if (perf.sum / perf.n > .045 && perf.level < 2) {
        perf.level++;
        if (perf.level === 1) for (const k in P) P[k].castShadow = false;
        if (perf.level === 2) { dpr = 1; G3.renderer.setPixelRatio(1); G3.sun.shadow.mapSize.set(1024, 1024); G3.sun.shadow.map && G3.sun.shadow.map.dispose(); G3.sun.shadow.map = null; }
      }
      perf.n = 0; perf.sum = 0;
    }
  }
  requestAnimationFrame(frame);
}

window.__game = { forceMod: id => { window.__forceMod = id; }, bestGates: () => { const ok = [...Array(SLOTS).keys()].filter(i => !(scene.noSlots || []).includes(i)); const pick = ok.length <= MAX_GATES ? ok : [0, 1, 2, 3, 4].map(k => ok[Math.round(k * (ok.length - 1) / 4)]); gates = gates.map((_, i) => pick.includes(i)); buildWorld(); }, unlockAll: () => { window.__unlockAll = true; }, event: k => spawnEvent(k), mp: (a, b, c) => { MPUSH = a; MPRES = b; MSCARE = c; }, scene: k => loadScene(k), setP: v => PCRIT = v, setSurge: v => SURGE = v, step, start, get s() { return { phase, dead, evacuated, left: ag.length, spawned, t, evacT }; },
  get ag() { return ag; }, setGates: g => { gates = g; buildWorld(); }, addFence: f => { fences.push({ ...f, len: Math.hypot(f.bx - f.ax, f.by - f.ay) }); buildWorld(); }, reset: () => { fences = []; backToPlan(); } };

function loadScene(key) {
  sceneKey = key; scene = SCENES[key]; CROWD = scene.crowd; FENCE_BUDGET = scene.fenceBudget; MAX_GATES = scene.maxGates;
  gates = scene.gates.slice(); fences = []; guards = []; performers = scene.performers();
  buildWorld(); backToPlan();
}
$("#bScene").addEventListener("click", chooser);
$("#card").addEventListener("click", e => {
  if (e.target.id === "resume") togglePause();
  if (e.target.id === "chaos") { chaosMode = !chaosMode; try { localStorage.setItem("mh.chaos", chaosMode ? "1" : "0"); } catch (er) { /* sin almacenamiento */ } chooser(); }
});
$("#bSound").textContent = "Sonido: " + (AU.on ? "sí" : "no");
$("#bSound").addEventListener("click", () => { audioInit(); $("#bSound").textContent = "Sonido: " + (audioToggle() ? "sí" : "no"); });
addEventListener("pointerdown", audioInit);
addEventListener("keydown", e => { if (e.key === "m" || e.key === "M") $("#bSound").click(); });
try { init3D(); } catch (err) {
  showCard(`<h2>Tu navegador no muestra 3D</h2><p>Este juego necesita WebGL. Prueba con Chrome, Edge, Firefox o Safari actualizados.</p>`);
}
resize(); loadScene("plaza"); chooser();
requestAnimationFrame(frame);
