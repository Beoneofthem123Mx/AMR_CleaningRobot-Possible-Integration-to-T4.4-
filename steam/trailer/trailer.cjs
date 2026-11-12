// Records the Human Tsunami trailer from the real game.
//   xvfb-run -a -s "-screen 0 1920x1080x24" node steam/trailer/trailer.cjs
// Needs Playwright (with Chromium) and ffmpeg with libx264. Writes steam/trailer/human_tsunami_trailer.mp4.
// Frames are generated one by one (the game's manual mode), so the result is smooth even on a slow PC.
const { _electron, chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const ROOT = path.resolve(__dirname, "../.."), WORK = path.join(__dirname, "work"), FPS = 30;
// recorded CC0 music bed (game/music); set TRACK= to an empty value for the old synthesized music
const TRACK = process.env.TRACK ?? "dance_1";
const ONLY = process.env.ONLY ? process.env.ONLY.split(",").map(Number) : null;

// script: title cards and gameplay shots
const B = 60 / 124;  // one beat of the game's EDM track: cuts land on the beat
const SEG = [
  // cold open: the counter already climbing
  { clip: "plaza", warm: 0, secs: B * 7, cam: 0, crush: true, hot: true },
  { card: "THIS IS YOUR FAULT.", dur: B * 2, style: "yellow" },
  { card: "HUMAN<br>TSUNAMI", logo: true, dur: B * 4, bg: "arena" },
  { card: "STEP 1:<br>PLAN THE EVENT", dur: B * 3, bg: "plaza" },
  { clip: "plaza", plan: true, warm: 0, secs: B * 8, cam: 0, fences: [[.2, 10, 40, 18, 46, "steel"], [.7, 30, 40, 22, 46, "concrete"]],
    shapes: [[1.2, "ring", 9, 30, 12, 32, "cones"], [1.8, "zigzag", 20, 47, 20, 58, "rope"], [2.4, "pen", 27, 50, 35, 56, "foam"]],
    stewards: [[3.0, 14.3, 62], [3.3, 25.7, 62], [3.6, 11, 59], [3.9, 29, 59]] },
  { card: "STEP 2:<br>OPEN THE GATES", dur: B * 3, bg: "plaza" },
  { clip: "plaza", warm: 2.5, secs: B * 7, cam: 2 },
  { card: "STEP 3:<br>EVERYTHING GOES WRONG", dur: B * 3, style: "yellow" },
  // crane shot at the front of the crowd: people topple one by one (the game's own fall, just triggered on cue)
  { clip: "plaza", warm: 26, secs: B * 4, cam: 4, cine: [5.2, -1.75, 4.2], look: [14, 35.5], hot: true,
    ev: [[.1, "topple", 13, 35, 1], [.45, "topple", 15, 35.5, 2], [.8, "topple", 12, 36, 2], [1.1, "topple", 16, 36, 2], [1.4, "topple", 14, 36.5, 3]] },
  { clip: "circo", warm: 28, secs: B * 4, cam: 4, cine: [9, 1.2], ev: [[-1.5, "elephants"], [-.4, "cannon"]], hot: true },
  { clip: "ovni", warm: 26, secs: B * 4, cam: 0, ev: [[-2, "abduccion"]], hot: true },
  { clip: "arena", warm: 26, secs: B * 4, cam: 1, ev: [[-1.3, "tope"], [-.4, "sillazo"]], hot: true },
  { clip: "ciudad", warm: 26, secs: B * 4, cam: 4, cine: [5, 1.5708], ev: [[-.8, "fuegos"]], hot: true },
  { clip: "crucero", warm: 26, secs: B * 4, cam: 4, cine: [16, 1.2], ev: [[-.8, "flamenco"]], hot: true },
  { clip: "plaza", warm: 26, secs: B * 4, cam: 1, mod: "rain", ev: [[-.6, "dogs"]], hot: true },
  { clip: "zoo", warm: 26, secs: B * 4, cam: 1, ev: [[-1.6, "giraffe"], [-1.2, "penguins"]], hot: true },
  { clip: "rocket", warm: 26, secs: B * 4, cam: 0, ev: [[-2.2, "booster"], [-.3, "ceo"]], hot: true },
  { clip: "cheese", warm: 26, secs: B * 4, cam: 1, ev: [[-1.4, "wheel"], [-.4, "tumble"]], hot: true },
  { clip: "zombie", warm: 26, secs: B * 4, cam: 1, ev: [[-1.2, "horde"]], hot: true },
  { clip: "beach", warm: 26, secs: B * 4, cam: 1, ev: [[-1.6, "whale"], [-1.2, "shark"]], hot: true },
  { clip: "park", warm: 26, secs: B * 4, cam: 1, ev: [[-1.5, "dinos"], [-.6, "coaster"]], hot: true },
  { card: "20 VENUES", dur: B * 2, bg: "circo" },
  { card: "FENCES OF<br>ANY SHAPE", dur: B * 2, bg: "ciudad" },
  { card: "FLOPPY<br>RAG DOLLS", dur: B * 2, style: "yellow" },
  { card: "SANDBOX MODE", dur: B * 2, bg: "arena" },
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
      camMode = g.cam; heat = !!g.heat; cineH = 0; if (g.cine) { cineDist = g.cine[0]; cineAng = g.cine[1]; cineH = g.cine[2] || 0; }
      if (g.plan) {  // planning shot: fences appear one by one while the venue waits
        window.__pending = (g.fences || []).map(([at, ax, ay, bx, by, type]) => [at, "fence", { ax, ay, bx, by, type }])
          .concat((g.shapes || []).map(([at, shape, ax, ay, bx, by, type]) => [at, "shape", { shape, ax, ay, bx, by, type }]))
          .concat((g.stewards || []).map(([at, x, y]) => [at, "steward", x, y]));
        for (let k = 0; k < 20; k++) __game.tick(1 / 60);
        return vnow / 1000;
      }
      __game.start(MODS_BY_ID[g.mod || "normal"]); if (g.mod) showModChip(MOD); else document.querySelector("#mod").hidden = true;
      const evs = (g.ev || []).slice().sort((a, b) => a[0] - b[0]);
      const pre = evs.length ? Math.min(0, evs[0][0]) : 0;
      let steps = Math.round((g.warm + pre) * 60);
      if (g.crush) { // with the default gates the evacuation jams: record from the first trampled person
        for (let k = 0; k < 60 * 140 && __game.s.dead < (g.close ? 14 : 4); k++) __game.step();
        // replay the slow-motion close-up on the latest fall, as the game does for the first one
        const f = fallen[fallen.length - 1];
        if (f) { slowT = 1.8; focus = { x: f.x, y: f.y }; if (g.close) { cam.x = f.x; cam.y = f.y - 1; } }
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
      if (g.look) { cam.x = g.look[0]; cam.y = g.look[1]; for (let k = 0; k < 4; k++) __game.tick(1 / 60); }
      return vnow / 1000;
    }, g);
    const n = Math.round(g.secs * FPS);
    for (let f = 0; f < n; f++) {
      await w.evaluate(([f, fps]) => {
        const tt = f / fps;
        for (const e of window.__pending.filter(e => e[0] <= tt)) {
          if (e[1] === "fence") __game.addFence(e[2]);
          else if (e[1] === "shape") { for (const [x0, y0, x1, y1] of shapeSegs(e[2].shape, e[2].ax, e[2].ay, e[2].bx, e[2].by)) fences.push({ ax: x0, ay: y0, bx: x1, by: y1, len: Math.hypot(x1 - x0, y1 - y0), type: e[2].type }); buildWorld(); sfx("drop"); }
          else if (e[1] === "steward") { guards.push({ kind: "guard", role: "slow", x: e[2], y: e[3], ang: -Math.PI / 2, t: 0 }); buildWorld(); sfx("drop"); }
          else if (e[1] === "topple") { ag.filter(a => !a.dmg || a.dmg < 1).sort((p, q) => Math.hypot(p.x - e[2], p.y - e[3]) - Math.hypot(q.x - e[2], q.y - e[3])).slice(0, e[4]).forEach(a => { a.dmg = 1.2; }); }
          else if (e[1] === "mega") { mega.active.push({ x: e[2], y: e[3], t: 3.5 }); rings.push({ x: e[2], y: e[3], t: 0, mega: true }); sfx("whistle"); }
          else __game.event(e[1]);
        }
        window.__pending = window.__pending.filter(e => e[0] > tt); __game.tick(1 / fps);
      }, [f, FPS]);
      await frame.screenshot({ path: path.join(dir, String(f).padStart(5, "0") + ".png") });
    }
    const log = await w.evaluate(() => { const L = window.__sfxLog; window.__sfxLog = []; return L; });
    sfx.push({ seg: i, list: log.filter(([nm, t]) => t >= t0 - .02).map(([nm, t]) => [nm, Math.max(0, t - t0)]).filter(e => e[1] < g.secs) });
    console.log("clip", i, g.clip, n, "frames, trampled:", (await w.evaluate(() => __game.s.dead)));
  }
  fs.writeFileSync(sfxFile, JSON.stringify(sfx));
  // soundtrack: the game's own music and effects, rendered offline
  const plan = { recorded: !!TRACK, segs: SEG.map(g => ({ dur: g.card ? g.dur : g.secs, card: !!g.card, hot: !!g.hot, end: !!g.end })), sfx };
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
      AU.crowd.gain.setTargetAtTime(0, a, .05);   // the recorded crowd bed replaces the synthetic murmur
    });
    const endMusic = total - 1.2;
    while (!plan.recorded && t < endMusic) { AU.step = step; const hot = plan.segs.some((g, i) => g.hot && t >= starts[i] && t < starts[i] + g.dur); st.play(step % st.steps, t, s, hot); t += s; step++; }
    AU.music.gain.setTargetAtTime(0, endMusic, .3); AU.crowd.gain.setTargetAtTime(0, endMusic - 1, .3);
    // the game's recorded sounds and voices, decoded into the offline context
    await Promise.all(SAMPLE_FILES.map(n => ["audio/" + n, n]).concat(VOICE_FILES.map(n => ["audio/voice/" + n, n])).map(([u, n]) =>
      fetch(u + ".ogg").then(r => r.arrayBuffer()).then(b => off.decodeAudioData(b)).then(bf => { SMP[n] = bf; }).catch(() => {})));
    const at = (name, time, vol, rate) => { const b = SMP[name]; if (!b) return false; const src = off.createBufferSource(), g = off.createGain();
      src.buffer = b; src.playbackRate.value = rate || 1; g.gain.value = vol; src.connect(g); g.connect(AU.sfx); src.start(time); return true; };
    const pickOf = l => l[(Math.random() * l.length) | 0], ann = Math.random() < .5 ? "male" : "female";
    for (const { seg, list } of plan.sfx) for (const [nm, tt] of list) {
      const time = starts[seg] + tt + .01;
      if (nm.startsWith("v:")) { const g = VG[nm.slice(2)]; if (g) at(pickOf(g), time, .7, .92 + Math.random() * .16); continue; }
      if (nm.startsWith("a:")) { at(`ann_${ann}_${nm.slice(2)}`, time, .9); continue; }
      const sm = SAMPLE_FOR[nm]; if (sm && at(pickOf(sm[0]), time, sm[1], .94 + Math.random() * .12)) continue;
      if (SFX[nm]) SFX[nm](time);
    }
    // a bed of crowd noise under the gameplay shots, louder in the hot ones
    plan.segs.forEach((g, i) => { if (g.card || !SMP.crowd_loop) return; const src = off.createBufferSource(), gn = off.createGain(); src.buffer = SMP.crowd_loop; src.loop = true;
      gn.gain.value = g.hot ? .45 : .3; src.connect(gn); gn.connect(AU.sfx); src.start(starts[i]); src.stop(starts[i] + g.dur); });
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
  const total = SEG.reduce((s, g) => s + (g.card ? g.dur : g.secs), 0);
  // the music bed: loops if shorter than the trailer, sits under the game's sound effects, fades out at the end
  const music = TRACK ? ["-stream_loop", "-1", "-i", path.join(ROOT, "game/music", TRACK + ".ogg")] : [];
  const mix = TRACK ? `[2:a]volume=0.85,atrim=0:${total},afade=t=in:d=0.4[m];[1:a]volume=1.1[f];[f][m]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.95,afade=t=out:st=${total - 1.6}:d=1.6[a]`
    : `[1:a]afade=t=out:st=${total - 1}:d=1[a]`;
  sh("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", path.join(WORK, "list.txt"), "-i", path.join(WORK, "audio.wav"), ...music,
    "-filter_complex", mix, "-map", "0:v", "-map", "[a]", "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-maxrate", "7M", "-bufsize", "14M", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
    "-shortest", "-movflags", "+faststart", final]);
  console.log("done:", final);
}

(async () => {
  fs.mkdirSync(WORK, { recursive: true });
  const stage = process.env.STAGE || "all";
  if (stage === "all" || stage === "clips") await captureClips();
  if (stage === "all" || stage === "cards") await renderCards();
  if (stage === "all" || stage === "assemble") assemble();
})();
