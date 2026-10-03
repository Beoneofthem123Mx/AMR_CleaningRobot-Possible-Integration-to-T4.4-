// Marea Humana · sonido generado en el momento (sin archivos de audio)
// Música por estilo de escenario, murmullo de la multitud y efectos para cada evento.
const AU = { ctx: null, master: null, music: null, crowd: null, crowdBand: null, noise: null, on: true, step: 0, nextT: 0, lastSfx: {} };
try { AU.on = localStorage.getItem("mh.sound") !== "off"; } catch (e) { /* sin almacenamiento */ }

function audioInit() {
  if (AU.ctx) { if (AU.ctx.state === "suspended") AU.ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  const c = AU.ctx = new AC();
  AU.master = c.createGain(); AU.master.gain.value = AU.on ? .8 : 0;
  const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
  AU.master.connect(comp); comp.connect(c.destination);
  AU.music = c.createGain(); AU.music.gain.value = 0; AU.music.connect(AU.master);
  AU.musicFilter = c.createBiquadFilter(); AU.musicFilter.type = "lowpass"; AU.musicFilter.frequency.value = 900; AU.musicFilter.connect(AU.music);
  // ruido blanco reutilizable
  const len = c.sampleRate * 2, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  AU.noise = buf;
  // murmullo de la multitud: ruido filtrado en la banda de la voz
  const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
  AU.crowdBand = c.createBiquadFilter(); AU.crowdBand.type = "bandpass"; AU.crowdBand.frequency.value = 700; AU.crowdBand.Q.value = .7;
  AU.crowd = c.createGain(); AU.crowd.gain.value = 0;
  src.connect(AU.crowdBand); AU.crowdBand.connect(AU.crowd); AU.crowd.connect(AU.master); src.start();
  AU.nextT = c.currentTime + .1;
}
function audioToggle() {
  AU.on = !AU.on;
  try { localStorage.setItem("mh.sound", AU.on ? "on" : "off"); } catch (e) { /* sin almacenamiento */ }
  if (AU.master) AU.master.gain.setTargetAtTime(AU.on ? .8 : 0, AU.ctx.currentTime, .05);
  return AU.on;
}

// ---------- instrumentos ----------
function env(g, t, a, peak, dec) { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0005, t + a + dec); }
function osc(type, freq, t, dur, peak, dest, glide) {
  const c = AU.ctx, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t); if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur);
  env(g, t, .005, peak, dur); o.connect(g); g.connect(dest || AU.master); o.start(t); o.stop(t + dur + .05);
}
function noise(t, dur, peak, type, freq, q, dest, sweep) {
  const c = AU.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = AU.noise; f.type = type; f.frequency.setValueAtTime(freq, t); if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur); f.Q.value = q || 1;
  env(g, t, .004, peak, dur); s.connect(f); f.connect(g); g.connect(dest || AU.master); s.start(t, Math.random()); s.stop(t + dur + .05);
}
const kick = (t, d) => osc("sine", 140, t, .32, .9, d, 40);
const snare = (t, d) => { noise(t, .16, .35, "bandpass", 1800, .8, d); osc("triangle", 190, t, .08, .2, d); };
const hat = (t, d, open) => noise(t, open ? .18 : .05, .12, "highpass", 8000, .7, d);
const note = n => 440 * Math.pow(2, (n - 69) / 12);

// ---------- música por estilo ----------
const STYLES = {
  edm: { bpm: 124, steps: 16, play(i, t, s, hot) {
    const bar = Math.floor(AU.step / 16) % 4, roots = [57, 53, 48, 55], root = roots[bar], d = AU.musicFilter;
    if (i % 4 === 0) kick(t, AU.music);
    if (i % 8 === 4) snare(t, d);
    if (i % 2 === 1) hat(t, d, i % 4 === 3);
    if (i % 4 === 2) osc("sawtooth", note(root - 12), t, s * 1.6, .22, d);
    if (hot && i % 2 === 0) osc("square", note(root + [12, 15, 19, 24][(i / 2) % 4]), t, s * .9, .09, d);
  } },
  circus: { bpm: 168, steps: 12, play(i, t, s, hot) {
    const d = AU.musicFilter, beat = i % 3, bar = Math.floor(AU.step / 12) % 4, roots = [60, 55, 60, 67];
    if (beat === 0) osc("triangle", note(roots[bar] - 24), t, s * 2, .45, d);
    else { osc("square", note(roots[bar] + 4), t, s * .8, .07, d); osc("square", note(roots[bar] + 7), t, s * .8, .07, d); }
    const mel = [72, 76, 79, 76, 74, 77, 81, 77, 72, 79, 76, 72];
    if (hot || i % 2 === 0) osc("triangle", note(mel[(AU.step) % mel.length]), t, s * .9, .16, d);
  } },
  tropical: { bpm: 104, steps: 16, play(i, t, s, hot) {
    const d = AU.musicFilter, bar = Math.floor(AU.step / 16) % 4, roots = [60, 65, 67, 60];
    if (i === 0 || i === 8) kick(t, AU.music);
    if (i % 2 === 1) noise(t, .06, .08, "highpass", 6000, .5, d);
    if (i === 3 || i === 6 || i === 11 || i === 14) osc("sine", note(roots[bar] - 12), t, s * 2, .3, d);
    const mel = [0, 4, 7, 12, 7, 4, 9, 7];
    if (i % 2 === 0 && (hot || i % 4 === 0)) { osc("sine", note(roots[bar] + 12 + mel[(i / 2) % 8]), t, .35, .16, d); osc("sine", note(roots[bar] + 24 + mel[(i / 2) % 8]), t, .2, .05, d); }
  } },
  brass: { bpm: 120, steps: 16, play(i, t, s, hot) {
    const d = AU.musicFilter;
    if (i % 8 === 0) kick(t, AU.music);
    if (i % 4 === 2) snare(t, d);
    if (hot && i % 2 === 1) noise(t, .05, .15, "bandpass", 2400, 1, d);
    const fan = [67, 0, 67, 72, 0, 76, 0, 79, 0, 76, 72, 0, 74, 0, 79, 0];
    if (fan[i]) { osc("sawtooth", note(fan[i]), t, s * 1.4, .1, d); osc("sawtooth", note(fan[i] - 12), t, s * 1.4, .08, d); }
  } },
};
function audioTick() {
  const c = AU.ctx; if (!c || !AU.on) return;
  const live = phase === "show" || phase === "evac", st = STYLES[(scene && scene.music) || (sceneKey === "circo" ? "circus" : "edm")] || STYLES.edm;
  // volumen y filtro de la música según el momento del show
  const hot = surgeT > 0, target = phase === "show" ? (fullAt ? .55 : .3) : phase === "evac" ? .12 : phase === "plan" ? .14 : 0;
  AU.music.gain.setTargetAtTime(target, c.currentTime, .4);
  AU.musicFilter.frequency.setTargetAtTime(phase === "show" ? (hot ? 9000 : fullAt ? 3800 : 1600) : 700, c.currentTime, .3);
  const s = 60 / st.bpm / (st.steps === 12 ? 3 : 4);
  while (AU.nextT < c.currentTime + .12) { st.play(AU.step % st.steps, AU.nextT, s, hot); AU.nextT += s; AU.step++; }
  // la multitud suena más fuerte y más aguda cuando se aprieta
  let pr = 0; for (let i = 0; i < ag.length; i += 25) pr += ag[i].ps; pr = ag.length ? pr / Math.ceil(ag.length / 25) : 0;
  AU.crowd.gain.setTargetAtTime(live ? Math.min(.5, .04 + ag.length / 9000 + pr * .03 + (hot ? .12 : 0)) : 0, c.currentTime, .3);
  AU.crowdBand.frequency.setTargetAtTime(600 + pr * 120, c.currentTime, .3);
}

// ---------- efectos ----------
const SFX = {
  roar(t) { osc("sawtooth", 110, t, .9, .35, null, 55); noise(t, .9, .3, "lowpass", 600, 1, null, 200); },
  honk(t) { osc("square", 392, t, .14, .18); osc("square", 330, t + .18, .16, .18); },
  bark(t) { osc("square", 520, t, .07, .2, null, 300); osc("square", 520, t + .14, .07, .2, null, 300); },
  trumpet(t) { const c = AU.ctx, o = c.createOscillator(), g = c.createGain(); o.type = "sawtooth"; o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(900, t + .4); env(g, t, .05, .25, .8); o.connect(g); g.connect(AU.master); o.start(t); o.stop(t + .9); },
  boom(t) { osc("sine", 90, t, .8, .9, null, 30); noise(t, .6, .6, "lowpass", 1200, .7, null, 120); },
  crash(t) { noise(t, .35, .5, "bandpass", 2500, .6, null, 600); osc("square", 80, t, .15, .2); },
  whistle(t) { osc("sine", 2200, t, .25, .15); osc("sine", 2600, t + .12, .25, .15); },
  fiu(t) { osc("sine", 600, t, .7, .12, null, 2400); noise(t, .7, .08, "highpass", 3000, .5); },
  splash(t) { noise(t, .7, .5, "lowpass", 3000, .7, null, 300); },
  horn(t) { osc("sawtooth", 98, t, 1.6, .3); osc("sawtooth", 147, t, 1.6, .2); },
  quack(t) { osc("square", 700, t, .1, .12, null, 450); osc("square", 650, t + .16, .1, .12, null, 420); },
  neigh(t) { const c = AU.ctx, o = c.createOscillator(), l = c.createOscillator(), lg = c.createGain(), g = c.createGain(); o.type = "sawtooth"; o.frequency.value = 700; l.frequency.value = 18; lg.gain.value = 120; l.connect(lg); lg.connect(o.frequency); o.frequency.exponentialRampToValueAtTime(350, t + .7); env(g, t, .02, .18, .7); o.connect(g); g.connect(AU.master); o.start(t); l.start(t); o.stop(t + .8); l.stop(t + .8); },
  jingle(t) { [72, 76, 79, 84].forEach((n, i) => osc("sine", note(n), t + i * .12, .2, .12)); },
  cheer(t) { noise(t, 1.2, .35, "bandpass", 1100, .5); for (let k = 0; k < 8; k++) noise(t + Math.random() * .8, .08, .2, "bandpass", 1500 + Math.random() * 1500, 2); },
  scream(t) { const c = AU.ctx, o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain(); o.type = "sawtooth"; o.frequency.setValueAtTime(700 + Math.random() * 300, t); o.frequency.exponentialRampToValueAtTime(380, t + .6); f.type = "bandpass"; f.frequency.value = 1200; f.Q.value = 2; env(g, t, .02, .12, .6); o.connect(f); f.connect(g); g.connect(AU.master); o.start(t); o.stop(t + .7); },
  siren(t) { const c = AU.ctx, o = c.createOscillator(), g = c.createGain(); o.type = "triangle"; o.frequency.setValueAtTime(600, t); o.frequency.linearRampToValueAtTime(1100, t + .5); o.frequency.linearRampToValueAtTime(600, t + 1); o.frequency.linearRampToValueAtTime(1100, t + 1.5); env(g, t, .05, .12, 1.6); o.connect(g); g.connect(AU.master); o.start(t); o.stop(t + 1.8); },
};
function sfx(name) {
  const c = AU.ctx; if (!c || !AU.on || !SFX[name]) return;
  const now = c.currentTime; if (now - (AU.lastSfx[name] || 0) < .12) return;
  AU.lastSfx[name] = now; SFX[name](now + .01);
}
// cada onomatopeya del juego suena
const SFX_BY_TEXT = { "¡ROAR!": "roar", "¡GRRR!": "roar", "¡MEC MEC!": "honk", "¡PIIIP!": "honk", "¡HONK!": "honk", "¡GUAU!": "bark", "¡AUU!": "bark",
  "¡PAWOO!": "trumpet", "¡BUM!": "boom", "¡CRASH!": "crash", "¡ALTO!": "whistle", "¡FIUUU!": "fiu", "¡SPLASH!": "splash", "¡TUUUUU!": "horn",
  "¡CUAC!": "quack", "¡IIIIH!": "neigh", "¡ARRANCAN!": "horn", "♪ ♫ ♪": "jingle", "¡OLEEE!": "cheer", "¡VAMOS!": "cheer", "¡CALMA!": "whistle", "¡PASO!": "honk" };
function sfxFor(text) { const n = SFX_BY_TEXT[text]; if (n) sfx(n); }
