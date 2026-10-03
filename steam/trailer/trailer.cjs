// Graba el tráiler de Marea Humana a partir del juego real.
//   xvfb-run -a -s "-screen 0 1920x1080x24" node steam/trailer/trailer.cjs
// Necesita Playwright (con Chromium) y ffmpeg con libx264. Escribe steam/trailer/marea_humana_trailer.mp4.
// Los cuadros se generan uno por uno (modo manual del juego), así que el resultado es fluido aunque la PC sea lenta.
const { _electron, chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const ROOT = path.resolve(__dirname, "../.."), WORK = path.join(__dirname, "work"), FPS = 30;
const ONLY = process.env.ONLY ? process.env.ONLY.split(",").map(Number) : null;

// guion: tarjetas de texto y tomas del juego
const SEG = [
  { card: "DE LOS CREADORES DE<br>NADA EN PARTICULAR", dur: 2.2, bg: "ciudad" },
  { clip: "plaza", warm: 2.5, secs: 4.5, cam: 2 },
  { card: "TÚ ORGANIZAS<br>EL EVENTO", dur: 1.6, bg: "plaza" },
  { clip: "plaza", warm: 24, secs: 3.5, cam: 0, heat: true, ev: [[-1.2, "car"]] },
  { card: "LA GENTE HACE<br>LO QUE QUIERE", dur: 1.6, bg: "plaza" },
  { clip: "circo", warm: 28, secs: 4, cam: 1, ev: [[-1.5, "elephants"], [-.4, "cannon"], [1.6, "balls"]] },
  { card: "HAY ELEFANTES", dur: 1.1, bg: "circo" },
  { clip: "ovni", warm: 26, secs: 4.5, cam: 0, ev: [[-2, "abduccion"], [1.8, "vacas"]] },
  { card: "HAY OVNIS", dur: 1.0, bg: "ciudad" },
  { clip: "boda", warm: 26, secs: 3.5, cam: 1, ev: [[-1, "ramo"], [.3, "suegra"]] },
  { card: "HAY SUEGRAS", dur: 1.0, bg: "circo" },
  { clip: "mitin", warm: 26, secs: 3.5, cam: 1, ev: [[-1.5, "botargas"], [-.2, "promesas"], [1.2, "huevazo"]] },
  { card: "HAY UN CANDIDATO<br>QUE ES UN PATO", dur: 1.4, bg: "mitin" },
  { clip: "crucero", warm: 26, secs: 1.4, cam: 0, ev: [[-.6, "oleaje"]], hot: true },
  { clip: "hipodromo", warm: 26, secs: 1.4, cam: 0, ev: [[-1.5, "carrera"]], hot: true },
  { clip: "taco", warm: 26, secs: 1.4, cam: 1, ev: [[-.4, "salsa"]], hot: true },
  { clip: "aeropuerto", warm: 26, secs: 1.4, cam: 1, ev: [[-1.2, "idolo"]], hot: true },
  { clip: "trono", warm: 26, secs: 1.4, cam: 0, ev: [[-.3, "inundacion"]], hot: true },
  { clip: "ciudad", warm: 26, secs: 1.4, cam: 0, ev: [[-.8, "fuegos"]], hot: true },
  { clip: "viernes", warm: 26, secs: 1.4, cam: 1, ev: [[-.8, "oferta"]], hot: true },
  { clip: "estadio", warm: 26, secs: 1.4, cam: 0, ev: [[-.5, "ola"], [-.4, "flares"]], hot: true },
  { clip: "arena", warm: 26, secs: 1.6, cam: 1, ev: [[-1.3, "tope"], [-.4, "sillazo"]], hot: true },
  { card: "14 ESCENARIOS<br>CERO PERMISOS", dur: 1.8, bg: "circo" },
  { clip: "plaza", warm: 0, secs: 6, cam: 0, crush: true, hot: true },
  { card: "¿CUÁNTOS PISOTEADOS<br>AGUANTA TU CONCIENCIA?", dur: 2.2, bg: "plaza" },
  { card: "MAREA<br>HUMANA", sub: "Próximamente en Steam · precio ridículo", dur: 3.4, bg: "circo", end: true },
];

const sh = (cmd, args) => execFileSync(cmd, args, { stdio: ["ignore", "ignore", "inherit"] });

async function captureClips() {
  const app = await _electron.launch({ args: ["--no-sandbox", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "."], cwd: ROOT,
    executablePath: process.env.ELECTRON_PATH || path.join(ROOT, "node_modules/electron/dist/electron") });
  const w = await app.firstWindow();
  w.on("pageerror", e => console.log("ERR", e.message));
  await app.evaluate(({ BrowserWindow }) => { const b = BrowserWindow.getAllWindows()[0]; b.setContentSize(1920, 1080); b.center(); });
  await w.waitForTimeout(2500);
  await w.evaluate(() => { __game.manual(true); __game.unlockAll(); window.__sfxLog = []; document.querySelector("#overlay").hidden = true;
    for (const s of ["#status", ".bar", "#mod"]) document.querySelectorAll(s).forEach(e => e.style.visibility = "hidden"); });
  const frame = w.locator("#frame"), sfxFile = path.join(WORK, "sfx.json");
  // si solo se regraban algunas tomas, se conservan los efectos de las demás
  const sfx = ONLY && fs.existsSync(sfxFile) ? JSON.parse(fs.readFileSync(sfxFile)).filter(e => !ONLY.includes(e.seg)) : [];
  for (let i = 0; i < SEG.length; i++) {
    const g = SEG[i]; if (!g.clip || (ONLY && !ONLY.includes(i))) continue;
    const dir = path.join(WORK, "seg" + i); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const t0 = await w.evaluate(g => {
      __game.reset(); __game.scene(g.clip); document.querySelector("#overlay").hidden = true;
      if (!g.crush) __game.bestGates();
      camMode = g.cam; heat = !!g.heat; __game.start(MODS_BY_ID.normal); document.querySelector("#mod").hidden = true;
      const evs = (g.ev || []).slice().sort((a, b) => a[0] - b[0]);
      const pre = evs.length ? Math.min(0, evs[0][0]) : 0;
      let steps = Math.round((g.warm + pre) * 60);
      if (g.crush) { // con las puertas de fábrica, la evacuación se atasca: grabamos desde el primer pisoteado
        for (let k = 0; k < 60 * 140 && __game.s.dead === 0; k++) __game.step();
      } else for (let k = 0; k < steps; k++) __game.step();
      movers = movers.filter(m => m.kind === "router" || m.kind === "influencer");
      for (const [at, e] of evs) if (at < 0) { __game.event(e); }
      const lead = -pre; for (let k = 0; k < lead * 60; k++) __game.step();
      for (let k = 0; k < 20; k++) __game.tick(1 / 60); // que la cámara se acomode
      window.__pending = evs.filter(e => e[0] >= 0);
      return vnow / 1000;
    }, g);
    const n = Math.round(g.secs * FPS);
    for (let f = 0; f < n; f++) {
      await w.evaluate(([f, fps]) => { const tt = f / fps; for (const e of window.__pending.filter(e => e[0] <= tt)) __game.event(e[1]); window.__pending = window.__pending.filter(e => e[0] > tt); __game.tick(1 / fps); }, [f, FPS]);
      await frame.screenshot({ path: path.join(dir, String(f).padStart(5, "0") + ".png") });
    }
    const log = await w.evaluate(() => { const L = window.__sfxLog; window.__sfxLog = []; return L; });
    sfx.push({ seg: i, list: log.map(([nm, t]) => [nm, Math.max(0, t - t0)]).filter(e => e[1] < g.secs) });
    console.log("clip", i, g.clip, n, "cuadros, muertos:", (await w.evaluate(() => __game.s.dead)));
  }
  fs.writeFileSync(sfxFile, JSON.stringify(sfx));
  // banda sonora: la música y los efectos del propio juego, renderizados sin conexión
  const plan = { segs: SEG.map(g => ({ dur: g.card ? g.dur : g.secs, card: !!g.card, hot: !!g.hot, end: !!g.end })), sfx };
  const wavB64 = await w.evaluate(async plan => {
    const total = plan.segs.reduce((s, g) => s + g.dur, 0) + 1.5, sr = 44100, off = new OfflineAudioContext(2, Math.ceil(sr * total), sr);
    AU.ctx = null; AU.on = true; const OrigAC = window.AudioContext; window.AudioContext = function () { return off; }; audioInit(); window.AudioContext = OrigAC;
    const st = STYLES.edm, s = 60 / st.bpm / 4; let t = 0, step = 0;
    const starts = []; { let a = 0; for (const g of plan.segs) { starts.push(a); a += g.dur; } }
    plan.segs.forEach((g, i) => {
      const a = starts[i];
      AU.music.gain.setTargetAtTime(g.card ? .4 : .6, a, .05);
      AU.musicFilter.frequency.setTargetAtTime(g.card ? 900 : g.hot ? 9000 : 4200, a, .08);
      AU.crowd.gain.setTargetAtTime(g.card ? .03 : g.hot ? .35 : .22, a, .2);
      if (g.card) { SFX.boom(a + .01); if (g.end) { SFX.cheer(a + .2); SFX.jingle(a + .5); } }
    });
    const endMusic = total - 1.2;
    while (t < endMusic) { AU.step = step; const hot = plan.segs.some((g, i) => g.hot && t >= starts[i] && t < starts[i] + g.dur); st.play(step % st.steps, t, s, hot); t += s; step++; }
    AU.music.gain.setTargetAtTime(0, endMusic, .3); AU.crowd.gain.setTargetAtTime(0, endMusic - 1, .3);
    for (const { seg, list } of plan.sfx) for (const [nm, tt] of list) if (SFX[nm]) SFX[nm](starts[seg] + tt + .01);
    const buf = await off.startRendering(), L = buf.getChannelData(0), R = buf.getChannelData(1), n = L.length;
    const out = new DataView(new ArrayBuffer(44 + n * 4));
    const str = (o, s2) => { for (let k = 0; k < s2.length; k++) out.setUint8(o + k, s2.charCodeAt(k)); };
    str(0, "RIFF"); out.setUint32(4, 36 + n * 4, true); str(8, "WAVEfmt "); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 2, true);
    out.setUint32(24, sr, true); out.setUint32(28, sr * 4, true); out.setUint16(32, 4, true); out.setUint16(34, 16, true); str(36, "data"); out.setUint32(40, n * 4, true);
    for (let k = 0; k < n; k++) { out.setInt16(44 + k * 4, Math.max(-1, Math.min(1, L[k])) * 32767, true); out.setInt16(46 + k * 4, Math.max(-1, Math.min(1, R[k])) * 32767, true); }
    const bytes = new Uint8Array(out.buffer); let bin = ""; for (let k = 0; k < bytes.length; k += 32768) bin += String.fromCharCode.apply(null, bytes.subarray(k, k + 32768));
    return btoa(bin);
  }, plan);
  fs.writeFileSync(path.join(WORK, "audio.wav"), Buffer.from(wavB64, "base64"));
  await app.close();
}

async function renderCards() {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  for (let i = 0; i < SEG.length; i++) {
    const g = SEG[i]; if (!g.card) continue;
    const q = new URLSearchParams({ w: 1920, h: 1080, mode: g.end ? "full" : "card", bg: g.bg, text: g.card, sub: g.sub || "" });
    await p.goto("file://" + path.join(ROOT, "steam/art/capsule.html") + "?" + q);
    await p.waitForSelector("body[data-ready]"); await p.waitForTimeout(200);
    if (g.end) await p.evaluate(sub => { const t = document.querySelector(".tag"); if (t) t.textContent = sub; }, g.sub);
    await p.locator("#c").screenshot({ path: path.join(WORK, `card${i}.png`) });
  }
  await b.close();
}

function assemble() {
  const parts = [];
  SEG.forEach((g, i) => {
    const out = path.join(WORK, `part${i}.mp4`); parts.push(out);
    const enc = ["-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(FPS)];
    if (g.card) {
      const n = Math.round(g.dur * FPS);
      sh("ffmpeg", ["-y", "-loglevel", "error", "-loop", "1", "-i", path.join(WORK, `card${i}.png`), "-frames:v", String(n),
        "-vf", `scale=2112:1188,zoompan=z='1+0.06*on/${n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=${FPS}`, ...enc, out]);
    } else {
      sh("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(WORK, "seg" + i, "%05d.png"),
        "-vf", "scale=-2:1080:flags=lanczos,crop=1920:1080", ...enc, out]);
    }
  });
  fs.writeFileSync(path.join(WORK, "list.txt"), parts.map(p => `file '${p}'`).join("\n"));
  const final = path.join(__dirname, "marea_humana_trailer.mp4");
  sh("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", path.join(WORK, "list.txt"), "-i", path.join(WORK, "audio.wav"),
    "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
    "-af", "afade=t=out:st=" + (SEG.reduce((s, g) => s + (g.card ? g.dur : g.secs), 0) - 1) + ":d=1", "-shortest", "-movflags", "+faststart", final]);
  console.log("listo:", final);
}

(async () => {
  fs.mkdirSync(WORK, { recursive: true });
  const stage = process.env.STAGE || "all";
  if (stage === "all" || stage === "clips") await captureClips();
  if (stage === "all" || stage === "cards") await renderCards();
  if (stage === "all" || stage === "assemble") assemble();
})();
