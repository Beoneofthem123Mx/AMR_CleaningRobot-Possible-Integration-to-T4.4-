// Records the Human Tsunami trailer from the real game.
//   xvfb-run -a -s "-screen 0 1920x1080x24" node steam/trailer/trailer.cjs
// Needs Playwright (with Chromium) and ffmpeg with libx264. Writes steam/trailer/human_tsunami_trailer.mp4.
// Frames are generated one by one (the game's manual mode), so the result is smooth even on a slow PC.
const { _electron, chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const ROOT = path.resolve(__dirname, "../.."), WORK = path.join(__dirname, "work"), FPS = 30;
const ONLY = process.env.ONLY ? process.env.ONLY.split(",").map(Number) : null;

// script: title cards and gameplay shots
const B = 60 / 124;  // one beat of the game's EDM track: cuts land on the beat
const SEG = [
  // cold open: the counter already climbing
  { clip: "plaza", warm: 0, secs: B * 7, cam: 0, crush: true, hot: true },
  { card: "THIS IS YOUR FAULT.", dur: B * 2, style: "yellow" },
  { card: "HUMAN<br>TSUNAMI", logo: true, dur: B * 4, bg: "arena" },
  { card: "STEP 1:<br>PLAN THE EVENT", dur: B * 3, bg: "plaza" },
  { clip: "plaza", plan: true, warm: 0, secs: B * 7, cam: 0, fences: [[.2, 10, 40, 18, 46], [.9, 30, 40, 22, 46], [1.6, 14, 58, 14, 50], [2.3, 26, 58, 26, 50]] },
  { card: "STEP 2:<br>OPEN THE GATES", dur: B * 3, bg: "plaza" },
  { clip: "plaza", warm: 2.5, secs: B * 7, cam: 2 },
  { card: "STEP 3:<br>EVERYTHING GOES WRONG", dur: B * 3, style: "yellow" },
  { clip: "circo", warm: 28, secs: B * 4, cam: 1, ev: [[-1.5, "elephants"], [-.4, "cannon"]], hot: true },
  { clip: "ovni", warm: 26, secs: B * 4, cam: 0, ev: [[-2, "abduccion"]], hot: true },
  { clip: "arena", warm: 26, secs: B * 4, cam: 1, ev: [[-1.3, "tope"], [-.4, "sillazo"]], hot: true },
  { clip: "ciudad", warm: 26, secs: B * 4, cam: 0, ev: [[-.8, "fuegos"]], hot: true },
  { clip: "plaza", warm: 26, secs: B * 4, cam: 1, mod: "rain", ev: [[-.6, "dogs"]], hot: true },
  { clip: "zoo", warm: 26, secs: B * 4, cam: 1, ev: [[-1.6, "giraffe"], [-1.2, "penguins"]], hot: true },
  { clip: "rocket", warm: 26, secs: B * 4, cam: 0, ev: [[-2.2, "booster"], [-.3, "ceo"]], hot: true },
  { clip: "cheese", warm: 26, secs: B * 4, cam: 1, ev: [[-1.4, "wheel"], [-.4, "tumble"]], hot: true },
  { clip: "zombie", warm: 26, secs: B * 4, cam: 1, ev: [[-1.2, "horde"]], hot: true },
  { clip: "mitin", warm: 26, secs: B * 4, cam: 1, ev: [[-1.5, "botargas"], [-.2, "promesas"]], hot: true },
  { clip: "boda", warm: 26, secs: B * 4, cam: 1, ev: [[-1, "ramo"], [.3, "suegra"]], hot: true },
  { card: "18 VENUES", dur: B * 2, bg: "circo" },
  { card: "13 RANDOM TWISTS", dur: B * 2, bg: "ciudad" },
  { card: "1 MEGAPHONE", dur: B * 2, style: "yellow" },
  { clip: "estadio", warm: 28, secs: B * 6, cam: 1, ev: [[.3, "mega", 20, 34], [1.2, "mega", 14, 42]] },
  { card: "TOMORROW'S<br>HEADLINES", dur: B * 3, bg: "mitin" },
  { clip: "arena", warm: 0, secs: B * 7, cam: 0, report: true, zoom: 1.75 },
  { card: "HUMAN<br>TSUNAMI", sub: "Coming soon to Steam · cheaper than a coffee", dur: B * 9, bg: "arena", end: true },
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
  // when only some shots are re-recorded, keep the sound effects of the others
  const sfx = ONLY && fs.existsSync(sfxFile) ? JSON.parse(fs.readFileSync(sfxFile)).filter(e => !ONLY.includes(e.seg)) : [];
  for (let i = 0; i < SEG.length; i++) {
    const g = SEG[i]; if (!g.clip || (ONLY && !ONLY.includes(i))) continue;
    const dir = path.join(WORK, "seg" + i); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const t0 = await w.evaluate(g => {
      __game.reset(); __game.scene(g.clip); document.querySelector("#overlay").hidden = true;
      if (!g.crush && !g.plan && !g.report) __game.bestGates();
      camMode = g.cam; heat = !!g.heat;
      if (g.plan) {  // planning shot: fences appear one by one while the venue waits
        window.__pending = (g.fences || []).map(([at, ax, ay, bx, by]) => [at, "fence", { ax, ay, bx, by }]);
        for (let k = 0; k < 20; k++) __game.tick(1 / 60);
        return vnow / 1000;
      }
      __game.start(MODS_BY_ID[g.mod || "normal"]); if (g.mod) showModChip(MOD); else document.querySelector("#mod").hidden = true;
      const evs = (g.ev || []).slice().sort((a, b) => a[0] - b[0]);
      const pre = evs.length ? Math.min(0, evs[0][0]) : 0;
      let steps = Math.round((g.warm + pre) * 60);
      if (g.crush) { // with the default gates the evacuation jams: record from the first trampled person
        for (let k = 0; k < 60 * 140 && __game.s.dead < 4; k++) __game.step();
        // replay the slow-motion close-up on the latest fall, as the game does for the first one
        const f = fallen[fallen.length - 1];
        if (f) { slowT = 1.8; focus = { x: f.x, y: f.y }; }
      } else if (g.report) { // run the whole show; the newspaper appears at the end
        for (let k = 0; k < 60 * 300 && !(fullAt && t > fullAt + 13); k++) __game.step();
        camMode = 1; for (let k = 0; k < 30; k++) __game.tick(1 / 60);  // render once so the paper gets its photo
        for (let k = 0; k < 60 * 300 && ["show", "evac"].includes(__game.s.phase); k++) __game.step();
      } else for (let k = 0; k < steps; k++) __game.step();
      movers = movers.filter(m => m.kind === "router" || m.kind === "influencer");
      for (const [at, e] of evs) if (at < 0) { __game.event(e); }
      const lead = -pre; for (let k = 0; k < lead * 60; k++) __game.step();
      for (let k = 0; k < 20; k++) __game.tick(1 / 60); // let the camera settle
      window.__pending = evs.filter(e => e[0] >= 0);
      return vnow / 1000;
    }, g);
    const n = Math.round(g.secs * FPS);
    for (let f = 0; f < n; f++) {
      await w.evaluate(([f, fps]) => {
        const tt = f / fps;
        for (const e of window.__pending.filter(e => e[0] <= tt)) {
          if (e[1] === "fence") __game.addFence(e[2]);
          else if (e[1] === "mega") { mega.active.push({ x: e[2], y: e[3], t: 3.5 }); rings.push({ x: e[2], y: e[3], t: 0, mega: true }); sfx("whistle"); }
          else __game.event(e[1]);
        }
        window.__pending = window.__pending.filter(e => e[0] > tt); __game.tick(1 / fps);
      }, [f, FPS]);
      await frame.screenshot({ path: path.join(dir, String(f).padStart(5, "0") + ".png") });
    }
    const log = await w.evaluate(() => { const L = window.__sfxLog; window.__sfxLog = []; return L; });
    sfx.push({ seg: i, list: log.map(([nm, t]) => [nm, Math.max(0, t - t0)]).filter(e => e[1] < g.secs) });
    console.log("clip", i, g.clip, n, "frames, trampled:", (await w.evaluate(() => __game.s.dead)));
  }
  fs.writeFileSync(sfxFile, JSON.stringify(sfx));
  // soundtrack: the game's own music and effects, rendered offline
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
    const q = new URLSearchParams({ w: 1920, h: 1080, mode: g.end || g.logo ? "full" : "card", bg: g.bg, text: g.card, sub: g.sub || "", style: g.style || "" });
    await p.goto("file://" + path.join(ROOT, "steam/art/capsule.html") + "?" + q);
    await p.waitForSelector("body[data-ready]"); await p.waitForTimeout(200);
    if (g.end || g.logo) await p.evaluate(sub => { const t = document.querySelector(".tag"); if (t) { if (sub) t.textContent = sub; else t.remove(); } }, g.sub || "");
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
        "-vf", "scale=-2:1080:flags=lanczos,crop=1920:1080" + (g.zoom ? `,crop=iw/${g.zoom}:ih/${g.zoom},scale=1920:1080:flags=lanczos` : ""), ...enc, out]);
    }
  });
  fs.writeFileSync(path.join(WORK, "list.txt"), parts.map(p => `file '${p}'`).join("\n"));
  const final = path.join(__dirname, "human_tsunami_trailer.mp4");
  sh("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", path.join(WORK, "list.txt"), "-i", path.join(WORK, "audio.wav"),
    "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-maxrate", "7M", "-bufsize", "14M", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
    "-af", "afade=t=out:st=" + (SEG.reduce((s, g) => s + (g.card ? g.dur : g.secs), 0) - 1) + ":d=1", "-shortest", "-movflags", "+faststart", final]);
  console.log("done:", final);
}

(async () => {
  fs.mkdirSync(WORK, { recursive: true });
  const stage = process.env.STAGE || "all";
  if (stage === "all" || stage === "clips") await captureClips();
  if (stage === "all" || stage === "cards") await renderCards();
  if (stage === "all" || stage === "assemble") assemble();
})();
