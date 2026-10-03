// Marea Humana · efectos, bucle principal y arranque
// ===== Efectos: cámara, estelas, luces, confeti =====
const CONF = ["#ff6fb1", "#5fd8ff", "#ffe066", "#a98bff", "#ff9a5c", "#ffffff", "#7dff9e"];
const TRAIL = Array.from({ length: 12 }, (_, i) => { const q = i / 11; return `rgba(${Math.round(255 - 55 * q)},${Math.round(140 + 95 * q)},${Math.round(50 + 205 * q)},.6)`; });
let cam = { z: 1, x: WW / 2, y: WH / 2 }, shake = 0, heatMix = 0, flash = 0, rings = [], confetti = [];
function resetFx() { cam = { z: 1, x: WW / 2, y: WH / 2 }; shake = 0; flash = 0; rings = []; confetti = []; if (G3.tctx) G3.tctx.clearRect(0, 0, G3.trail.width, G3.trail.height); }
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
  flash = 1; burst(260);
  caption(first ? "Física de multitudes real" : scene.acts[(Math.random() * scene.acts.length) | 0], false, 1900);
}
function onFall(x, y) { rings.push({ x, y, t: 0 }); shake = Math.min(.9, shake + .35); }
function updateFx(dt) {
  let tz = 1, ty = WH / 2;
  if (phase === "show" || phase === "evac") {
    let sy = 0, n = 0;
    for (let i = 0; i < ag.length; i += 5) { const a = ag[i]; if (a.y < FENCE_Y) { sy += a.y; n++; } }
    tz = phase === "show" ? (surgeT > 0 ? 1.95 : 1.6) : 1.3;
    if (camMode === 1) tz *= 1.7; else if (camMode === 2) tz = 1;
    if (n > 40) ty = sy / n;
  }
  if (camMode === 1 && phase !== "plan") ty = ty;
  const kz = 1 - Math.pow(.3, dt);
  cam.z += (tz - cam.z) * kz; cam.y += (ty - cam.y) * kz * .6;
  const hw = WW / (2 * cam.z), hh = WH / (2 * cam.z);
  cam.x = clamp(WW / 2, hw, WW - hw); cam.y = clamp(cam.y, hh, WH - hh);
  shake *= Math.pow(.03, dt); flash *= Math.pow(.04, dt);
  heatMix += ((heat || surgeT > 0 ? 1 : 0) - heatMix) * (1 - Math.pow(.015, dt));
  for (const r of rings) r.t += dt; rings = rings.filter(r => r.t < 1.3);
  for (const q of pops) q.t += dt; pops = pops.filter(q => q.t < 1.6);
  stepPerformers(dt);
  const drag = Math.pow(.35, dt);
  for (const c of confetti) {
    if (c.h > .03) { c.vx *= drag; c.vy *= drag; c.vh = Math.max(-2.2, c.vh - 6 * dt); c.x += (c.vx + Math.sin(c.rz * 2) * .6) * dt; c.y += c.vy * dt; c.h += c.vh * dt; c.rx += c.vr * dt; c.rz += c.vr * .7 * dt; }
    else { c.h = .03; c.rx = Math.PI / 2; c.life -= dt * .6; }
    c.life -= dt * .25;
  }
  confetti = confetti.filter(c => c.life > 0);
}
// ===== Bucle =====
const perf = { n: 0, sum: 0, level: 0 }, live3d = () => phase === "show" || phase === "evac";
let last = performance.now();
function frame(now) {
  const real = Math.min(.1, (now - last) / 1000); last = now;
  if (phase === "show" || phase === "evac") {
    const n = Math.min(10, Math.round(real / DT * speed));
    for (let i = 0; i < n && (phase === "show" || phase === "evac"); i++) step();
    $("#status").textContent = phase === "show"
      ? (spawned < CROWD ? `Entrando ${spawned} / ${CROWD}` : `En el show · termina en ${Math.max(0, Math.ceil(fullAt + SHOW_TIME - t))} s`)
      : `Evacuando · quedan ${ag.length}`;
  } else if (phase === "plan") stepPreview(real);
  updateFx(real * (phase === "show" || phase === "evac" ? speed : 1));
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

window.__game = { mp: (a, b, c) => { MPUSH = a; MPRES = b; MSCARE = c; }, scene: k => loadScene(k), setP: v => PCRIT = v, setSurge: v => SURGE = v, step, start, get s() { return { phase, dead, evacuated, left: ag.length, spawned, t, evacT }; },
  get ag() { return ag; }, setGates: g => { gates = g; buildWorld(); }, addFence: f => { fences.push({ ...f, len: Math.hypot(f.bx - f.ax, f.by - f.ay) }); buildWorld(); }, reset: () => { fences = []; backToPlan(); } };

function loadScene(key) {
  sceneKey = key; scene = SCENES[key]; CROWD = scene.crowd; FENCE_BUDGET = scene.fenceBudget; MAX_GATES = scene.maxGates;
  gates = scene.gates.slice(); fences = []; performers = scene.performers();
  buildWorld(); backToPlan();
}
function chooser() {
  if (phase === "show" || phase === "evac") return;
  showCard(`<h2>Marea Humana</h2>
    <p>Tú eres responsable de la seguridad. Traza vallas y abre puertas antes de que entre la gente. Si alguien aguanta demasiada presión, cae y lo pisotean.</p>
    <ul>
      <li><b>Valla:</b> arrastra para trazar una valla.</li>
      <li><b>Puertas:</b> toca la reja de abajo para abrir o cerrar entradas.</li>
      <li><b>Presión:</b> pinta a la multitud de azul a rojo.</li>
    </ul>
    <p><b>Elige escenario:</b></p>
    <div class="scenes">${Object.entries(SCENES).map(([key, sc]) => { const b = loadBest()[key]; return `<button class="scene" data-scene="${key}"><b>${sc.name}${b !== undefined ? ` <em class="best">${"★".repeat(b)}${"☆".repeat(3 - b)}</em>` : ""}</b><span>${sc.tag} · ${sc.crowd.toLocaleString("es")} personas</span><small>${sc.intro}</small></button>`; }).join("")}</div>
    ${window.steam ? '<div class="row"><button id="fs">Pantalla completa (F11)</button><button id="quit">Salir del juego</button></div>' : ""}`);
  const b = $("#card .scene"); if (b) b.focus();
}
$("#bScene").addEventListener("click", chooser);
try { init3D(); } catch (err) {
  showCard(`<h2>Tu navegador no muestra 3D</h2><p>Este juego necesita WebGL. Prueba con Chrome, Edge, Firefox o Safari actualizados.</p>`);
}
resize(); loadScene("plaza"); chooser();
requestAnimationFrame(frame);
