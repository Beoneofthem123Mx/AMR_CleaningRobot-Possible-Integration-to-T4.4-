// Human Tsunami · "What went wrong?": what the crowd did, square metre by square metre, and why people went down
// During the show: max pressure, crowd-time and "stuck" time per 1 m cell. After it: the three worst hotspots,
// each with a cause (gate bottleneck, stage crush, your own barrier, a corner, a surge) and a concrete tip.
const PM = { w: 40, h: 72, p: null, d: null, s: null, f: null, n: 0, key: "" };
let ANALYSIS = null, analysisView = false;
function pmReset() {
  PM.w = Math.ceil(WW); PM.h = Math.ceil(SH); const n = PM.w * PM.h;
  PM.p = new Float32Array(n); PM.d = new Float32Array(n); PM.s = new Float32Array(n); PM.f = new Float32Array(n); PM.exits = new Array(SLOTS).fill(0); PM.side = 0; PM.times = []; PM.evacAt = null; PM.snaps = []; PM.view = -1; PM.n = 0; PM.key = sceneKey; ANALYSIS = null; analysisView = false;
}
function pmSample() {   // every few steps: cheap
  if (!PM.p) return; ++PM.n; if (phase === "evac" && PM.evacAt === null) PM.evacAt = PM.n * DT;
  if (PM.n % 120 === 0 && PM.snaps.length < 160) {   // every 2 s: a snapshot of where people were and how squeezed, for the timelapse
    const n = PM.w * PM.h, d = new Uint8Array(n), p = new Uint8Array(n);
    for (const a of ag) { const c = (Math.min(PM.h - 1, Math.max(0, a.y | 0))) * PM.w + Math.min(PM.w - 1, Math.max(0, a.x | 0)); if (d[c] < 255) d[c]++; const q = Math.min(255, a.ps / PCRIT * 200) | 0; if (q > p[c]) p[c] = q; }
    PM.snaps.push({ t: PM.n * DT, d, p, f: PM.times.length });
  }
  if (PM.n % 6) return;
  for (const a of ag) {
    const c = (Math.min(PM.h - 1, Math.max(0, a.y | 0))) * PM.w + Math.min(PM.w - 1, Math.max(0, a.x | 0));
    if (a.ps > PM.p[c]) PM.p[c] = a.ps; PM.d[c]++;
    if (a.ps > PCRIT * .3 && Math.hypot(a.vx, a.vy) < .3) PM.s[c]++;
  }
}
function pmExit(a) {   // which way out each person took (for the exit-flow chart)
  if (!PM.exits || demo) return;
  if (a.y > SH - .6) { let bi = 0, bd = 1e9; for (let i = 0; i < SLOTS; i++) { const d = Math.abs(slotX(i) - a.x) + (gates[i] ? 0 : 50); if (d < bd) { bd = d; bi = i; } } PM.exits[bi]++; } else PM.side++;
}
function fallTimeline() {   // when people went down: during the show or on the way out
  const T = PM.times || []; if (T.length < 3) return "";
  const end = Math.max(PM.n * DT, 1), nb = 36, b = new Array(nb).fill(0); for (const x of T) b[Math.min(nb - 1, Math.floor(x / end * nb))]++;
  const mx = Math.max(...b), ev = PM.evacAt !== null ? PM.evacAt / end : 1, inEv = T.filter(x => PM.evacAt !== null && x >= PM.evacAt).length, share = inEv / T.length;
  const bars = b.map((n, i) => `<rect x="${i * 10 + 1}" y="${40 - Math.round(n / mx * 38)}" width="8" height="${Math.max(n ? 2 : 0, Math.round(n / mx * 38))}" rx="1.5" fill="${i / nb >= ev ? "#ff3b2f" : "#ffb238"}"/>`).join("");
  return `<div class="flow"><b>When people went down</b><svg viewBox="0 0 360 52" class="tl">${bars}${ev < 1 ? `<line x1="${ev * 360}" x2="${ev * 360}" y1="0" y2="42" stroke="#fff" stroke-dasharray="3 3"/><text x="${ev * 360 + 4}" y="50" fill="#c9ccd2" font-size="9">evacuation</text>` : ""}<text x="0" y="50" fill="#c9ccd2" font-size="9">doors open</text></svg>
    <small>${share > .6 ? `${Math.round(share * 100)}% went down on the way out: the exits are your problem. More gates, wider gates, and keep the area in front of them clear.` : share < .25 ? `Most went down during the show itself: the front and the flow toward the stage need pens, guards and water.` : `Both the show and the exit hurt: fix the worst hotspot first.`}</small></div>`;
}
function exitFlow() {
  if (!PM.exits) return "";
  const rows = PM.exits.map((n, i) => ({ n, i })).filter(r => gates[r.i] || r.n > 5); if (PM.side) rows.push({ n: PM.side, i: -1 });
  const tot = rows.reduce((s, r) => s + r.n, 0); if (tot < 20) return "";
  const max = Math.max(...rows.map(r => r.n)), open = rows.length, hot = rows.find(r => open >= 3 && r.n / tot > 1.6 / open), idle = rows.find(r => r.i >= 0 && gates[r.i] && r.n / tot < .25 / open);
  return `<div class="flow"><b>Exit flow</b>${rows.map(r => `<div class="fr${hot === r ? " hot" : ""}"><span>${r.i < 0 ? "Side exit" : "Gate " + (r.i + 1)}</span><i style="width:${Math.max(2, Math.round(r.n / max * 100))}%"></i><em>${Math.round(r.n / tot * 100)}%</em></div>`).join("")}
    ${hot ? `<small>${hot.i < 0 ? "The side exit" : "Gate " + (hot.i + 1)} took ${Math.round(hot.n / tot * 100)}% of everybody. Make it wide, or open a gate next to it.</small>` : idle ? `<small>Gate ${idle.i + 1} was open but almost nobody used it: steer people to it with a barrier.</small>` : `<small>The crowd spread well over your exits.</small>`}</div>`;
}
function pmFall(x, y) { if (!PM.f) return; PM.times.push(PM.n * DT); const c = (Math.min(PM.h - 1, Math.max(0, y | 0))) * PM.w + Math.min(PM.w - 1, Math.max(0, x | 0)); PM.f[c]++; }
function analyze() {
  if (!PM.p || PM.key !== sceneKey) return null;
  // hotspots: cells weighted by falls and pressure, picked greedily with a 5 m exclusion radius
  const score = new Float32Array(PM.p.length); for (let i = 0; i < score.length; i++) score[i] = PM.f[i] * 3 + Math.max(0, PM.p[i] / PCRIT - .55) * 4 + PM.s[i] * .002;
  const spots = [], taken = new Uint8Array(score.length);
  for (let k = 0; k < 3; k++) {
    let bi = -1, bs = .6; for (let i = 0; i < score.length; i++) if (!taken[i] && score[i] > bs) { bs = score[i]; bi = i; }
    if (bi < 0) break;
    const x = bi % PM.w + .5, y = ((bi / PM.w) | 0) + .5; let falls = 0;
    for (let i = 0; i < score.length; i++) { const cx = i % PM.w + .5, cy = ((i / PM.w) | 0) + .5; if ((cx - x) ** 2 + (cy - y) ** 2 < 25) { taken[i] = 1; falls += PM.f[i]; } }
    spots.push({ x, y, falls, ...explain(x, y) });
  }
  return { spots, total: dead };
}
function explain(x, y) {
  const nearFence = fences.some(f => contact({ t: "s", ax: f.ax, ay: f.ay, bx: f.bx, by: f.by, th: .35 }, x, y)[2] < 1.6);
  let gate = -1; for (let i = 0; i < SLOTS; i++) if (Math.abs(slotX(i) - x) < 4 && y > FENCE_Y - 7) gate = i;
  const f = fStage[cellOf(clamp(x, .3, WW - .3), clamp(y, .3, SH - .3))];
  let wall = false; for (const o of obs) { if (o.kind === "player" || o.kind === "fence" || o.kind === "closed") continue; if (contact(o, x, y)[2] < 1.4) { wall = true; break; } }
  if (gate >= 0) return { cause: "Bottleneck at a gate", tip: gates[gate] ? "This gate was jammed. Make it wide, open another one next to it, or put a steward a few metres before it to slow people down." : "People piled up at a closed stretch of fence. Open a gate here (or an emergency gate during the show)." };
  if (nearFence) return { cause: "Your barrier made a squeeze point", tip: "People were pushed against your own barrier. Leave a gap, angle it toward the flow, or swap it for foam so it absorbs the squeeze." };
  if (isFinite(f) && f < 3.5) return { cause: "Crush at the front", tip: "Everybody pushed for the front row. Split the front into pens with short foam barriers, and add water or first aid behind them." };
  if (wall) return { cause: "Trapped against the scenery", tip: "The flow ran into a wall or an obstacle and had nowhere to go. A short barrier in front of it turns the crowd away before they reach it." };
  return { cause: "Open-floor surge", tip: "No wall here: the crowd surged during a drop or an event. Pens, a megaphone tower, or a megaphone click at the right moment calm these down." };
}
function showAnalysis() {
  ANALYSIS = ANALYSIS || analyze(); analysisView = true; hideCard();
  camMode = 0; camFree = null; evCam = null; slowT = 0; cam.z = 1; cam.x = WW / 2; cam.y = WH / 2; if (typeof camLabel === "function") camLabel(); const st = document.querySelector("#status"); if (st) st.hidden = true;
  const a = ANALYSIS, el = document.querySelector("#analysis") || document.querySelector("#frame").appendChild(Object.assign(document.createElement("div"), { id: "analysis", className: "analysis" }));
  el.hidden = false;
  el.innerHTML = `<h3>What went wrong?</h3><p class="lg"><i class="h1"></i>pressure <i class="h2"></i>crush <b>✕</b> someone went down <b class="num">1</b> hotspot</p>` +
    (a && a.spots.length ? a.spots.map((s, i) => `<div class="spot"><b class="num">${i + 1}</b><div><b>${s.cause}</b>${s.falls ? ` · ${s.falls} down here` : ""}<small>${s.tip}</small></div></div>`).join("")
      : `<p>Nothing dramatic: no real hotspot. Whatever happened, it was spread out.</p>`) + fallTimeline() + exitFlow() +
    (PM.snaps && PM.snaps.length > 3 ? `<div class="flow"><b>Replay the crowd</b><div class="scrub"><button id="anPlay">▶</button><input type="range" id="anT" min="0" max="${PM.snaps.length}" value="${PM.snaps.length}"><span id="anTL">all</span></div><small>Drag to watch the pressure build second by second. All the way right shows the whole show.</small></div>` : "") +
    `<div class="row"><button class="go" id="anRetry">Adjust the plan</button><button id="anBack">Back to the report</button></div>`;
  const sl = el.querySelector("#anT"), lab = el.querySelector("#anTL"), pl = el.querySelector("#anPlay"); let timer = null;
  const setV = v => { PM.view = v >= PM.snaps.length ? -1 : v; sl.value = v; const s = PM.snaps[PM.view]; lab.textContent = PM.view < 0 ? "all" : `${Math.floor(s.t / 60)}:${String(Math.floor(s.t % 60)).padStart(2, "0")}${PM.evacAt !== null && s.t >= PM.evacAt ? " · exit" : ""}`; };
  if (sl) {
    sl.oninput = () => { clearInterval(timer); timer = null; pl.textContent = "▶"; setV(+sl.value); };
    pl.onclick = () => { if (timer) { clearInterval(timer); timer = null; pl.textContent = "▶"; return; } let v = PM.view < 0 ? 0 : PM.view; pl.textContent = "❚❚"; timer = setInterval(() => { setV(v); if (++v > PM.snaps.length) { clearInterval(timer); timer = null; pl.textContent = "▶"; } }, 140); };
    PM.stopScrub = () => { clearInterval(timer); timer = null; PM.view = -1; };
  }
  el.querySelector("#anRetry").onclick = () => { if (PM.stopScrub) PM.stopScrub(); el.hidden = true; paused = false; backToPlan(); };
  el.querySelector("#anBack").onclick = () => { if (PM.stopScrub) PM.stopScrub(); el.hidden = true; analysisView = false; if (window.__lastReport) window.__lastReport(); };
}
function hideAnalysisPanel() { const el = document.querySelector("#analysis"); if (el) el.hidden = true; analysisView = false; if (PM.stopScrub) PM.stopScrub(); }
// drawn on the floor layer: during the analysis view, and faintly while planning the next attempt
function drawAnalysis(g) {
  if (!PM.p || PM.key !== sceneKey || !(analysisView || (phase === "plan" && ANALYSIS))) return;
  const al = analysisView ? 1 : .45;
  if (analysisView && PM.view >= 0 && PM.snaps[PM.view]) {   // timelapse frame: density as the cell's opacity, pressure as its colour
    const s = PM.snaps[PM.view];
    for (let i = 0; i < s.d.length; i++) { if (!s.d[i]) continue; const x = i % PM.w, y = (i / PM.w) | 0, q = Math.min(1, s.p[i] / 200), dd = Math.min(1, s.d[i] / 5);
      g.fillStyle = q > .3 ? `rgba(255,${Math.round(220 - 190 * q)},${Math.round(60 - 40 * q)},${(.25 + .6 * dd).toFixed(2)})` : `rgba(79,184,255,${(.12 + .5 * dd).toFixed(2)})`; g.fillRect(x, y, 1, 1); }
    return;
  }
  for (let i = 0; i < PM.p.length; i++) {
    const v = PM.p[i] / PCRIT; if (v < .25) continue;
    const x = i % PM.w, y = (i / PM.w) | 0, q = Math.min(1, (v - .25) / .9);
    g.fillStyle = `rgba(${255},${Math.round(220 - 190 * q)},${Math.round(60 - 40 * q)},${((.15 + .5 * q) * al).toFixed(3)})`; g.fillRect(x, y, 1, 1);
    if (PM.s[i] > 40) { g.fillStyle = `rgba(122,44,255,${(.35 * al).toFixed(3)})`; g.fillRect(x + .35, y + .35, .3, .3); }
    if (PM.f[i]) { g.strokeStyle = `rgba(20,20,22,${(.8 * al).toFixed(3)})`; g.lineWidth = .12; g.beginPath(); g.moveTo(x + .2, y + .2); g.lineTo(x + .8, y + .8); g.moveTo(x + .8, y + .2); g.lineTo(x + .2, y + .8); g.stroke(); }
  }
  if (ANALYSIS) ANALYSIS.spots.forEach((s, i) => {
    g.strokeStyle = `rgba(255,255,255,${al})`; g.lineWidth = .3; g.beginPath(); g.arc(s.x, s.y, 3, 0, 7); g.stroke();
    g.fillStyle = `rgba(17,18,20,${al})`; g.beginPath(); g.arc(s.x, s.y - 3.6, 1, 0, 7); g.fill();
    g.fillStyle = `rgba(255,210,58,${al})`; g.font = "900 1.3px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(i + 1), s.x, s.y - 3.55);
  });
}
