// Human Tsunami · sound generated on the fly (no audio files)
// Music per venue style, crowd murmur and an effect for every event.
const AU = { ctx: null, master: null, music: null, crowd: null, crowdBand: null, noise: null, on: true, step: 0, nextT: 0, lastSfx: {} };
try { AU.on = localStorage.getItem("mh.sound") !== "off"; } catch (e) { /* no storage */ }
AU.musicVol = .8; AU.sfxVol = 1;
try { const v = JSON.parse(localStorage.getItem("mh.vol") || "{}"); if (Number.isFinite(v.m)) AU.musicVol = v.m; if (Number.isFinite(v.s)) AU.sfxVol = v.s; } catch (e) { /* no storage */ }
function setVolume(kind, v) {
  if (kind === "m") AU.musicVol = v; else AU.sfxVol = v;
  if (AU.ctx) (kind === "m" ? AU.musicBus : AU.sfx).gain.setTargetAtTime(v, AU.ctx.currentTime, .05);
  try { localStorage.setItem("mh.vol", JSON.stringify({ m: AU.musicVol, s: AU.sfxVol })); } catch (e) { /* no storage */ }
}

function audioInit() {
  if (AU.ctx) { if (AU.ctx.state === "suspended") AU.ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  const c = AU.ctx = new AC();
  AU.master = c.createGain(); AU.master.gain.value = AU.on ? .8 : 0;
  const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
  AU.master.connect(comp); comp.connect(c.destination);
  // two buses with their own volume (options menu): music, and everything else
  AU.musicBus = c.createGain(); AU.musicBus.gain.value = AU.musicVol; AU.musicBus.connect(AU.master);
  AU.sfx = c.createGain(); AU.sfx.gain.value = AU.sfxVol; AU.sfx.connect(AU.master);
  AU.music = c.createGain(); AU.music.gain.value = 0; AU.music.connect(AU.musicBus);
  AU.musicFilter = c.createBiquadFilter(); AU.musicFilter.type = "lowpass"; AU.musicFilter.frequency.value = 900; AU.musicFilter.connect(AU.music);
  // reusable white noise
  const len = c.sampleRate * 2, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  AU.noise = buf;
  // crowd murmur: noise filtered to the voice band
  const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
  AU.crowdBand = c.createBiquadFilter(); AU.crowdBand.type = "bandpass"; AU.crowdBand.frequency.value = 700; AU.crowdBand.Q.value = .7;
  AU.crowd = c.createGain(); AU.crowd.gain.value = 0;
  src.connect(AU.crowdBand); AU.crowdBand.connect(AU.crowd); AU.crowd.connect(AU.sfx); src.start();
  AU.nextT = c.currentTime + .1;
  loadSamples();
}
function audioToggle() {
  AU.on = !AU.on;
  try { localStorage.setItem("mh.sound", AU.on ? "on" : "off"); } catch (e) { /* no storage */ }
  if (AU.master) AU.master.gain.setTargetAtTime(AU.on ? .8 : 0, AU.ctx.currentTime, .05);
  return AU.on;
}

// ---------- instruments ----------
function env(g, t, a, peak, dec) { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0005, t + a + dec); }
function osc(type, freq, t, dur, peak, dest, glide) {
  const c = AU.ctx, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t); if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur);
  env(g, t, .005, peak, dur); o.connect(g); g.connect(dest || AU.sfx); o.start(t); o.stop(t + dur + .05);
}
function noise(t, dur, peak, type, freq, q, dest, sweep) {
  const c = AU.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = AU.noise; f.type = type; f.frequency.setValueAtTime(freq, t); if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur); f.Q.value = q || 1;
  env(g, t, .004, peak, dur); s.connect(f); f.connect(g); g.connect(dest || AU.sfx); s.start(t, Math.random()); s.stop(t + dur + .05);
}
const kick = (t, d) => osc("sine", 140, t, .32, .9, d, 40);
const snare = (t, d) => { noise(t, .16, .35, "bandpass", 1800, .8, d); osc("triangle", 190, t, .08, .2, d); };
const hat = (t, d, open) => noise(t, open ? .18 : .05, .12, "highpass", 8000, .7, d);
const note = n => 440 * Math.pow(2, (n - 69) / 12);

// ---------- music by style ----------
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
Object.assign(STYLES, {
  lounge: { bpm: 96, steps: 16, play(i, t, s, hot) {
    const d = AU.musicFilter, bar = Math.floor(AU.step / 16) % 4, chords = [[62, 65, 69, 72], [60, 64, 67, 71], [59, 62, 65, 69], [57, 60, 64, 67]];
    if (i === 0 || i === 10) osc("sine", 70, t, .3, .5, AU.music, 45);
    if (i % 4 === 3) noise(t, .04, .1, "bandpass", 3500, 2, d);
    if (i === 0 || i === 6 || i === 12) chords[bar].forEach(n => osc("sine", note(n), t, s * 4, .05, d));
    if (i % 4 === 0) osc("triangle", note(chords[bar][0] - 24), t, s * 2, .2, d);
    if (hot && i % 2 === 1) osc("sine", note(chords[bar][(i >> 1) % 4] + 12), t, .2, .06, d);
  } },
  mariachi: { bpm: 180, steps: 12, play(i, t, s, hot) {
    const d = AU.musicFilter, bar = Math.floor(AU.step / 12) % 4, roots = [62, 57, 62, 69], beat = i % 3;
    if (beat === 0) osc("triangle", note(roots[bar] - 24), t, s * 2, .4, d);
    else { osc("sawtooth", note(roots[bar] + 4), t, s * .5, .05, d); osc("sawtooth", note(roots[bar] + 7), t, s * .5, .05, d); }
    const mel = [74, 76, 78, 81, 78, 76, 74, 73, 74, 78, 81, 86];
    if (i % 3 !== 2 && (hot || i % 2 === 0)) { osc("sawtooth", note(mel[AU.step % 12]), t, s * 1.2, .07, d); osc("sawtooth", note(mel[AU.step % 12] - 3), t, s * 1.2, .05, d); }
  } },
  space: { bpm: 84, steps: 16, play(i, t, s, hot) {
    const d = AU.musicFilter, bar = Math.floor(AU.step / 16) % 4, roots = [57, 53, 55, 52];
    if (i === 0) [0, 3, 7, 10].forEach(n => osc("sine", note(roots[bar] + n), t, s * 15, .05, d));
    if (i % 8 === 0) osc("sine", 60, t, .5, .5, AU.music, 35);
    if (i % 2 === 0) { const c = AU.ctx, o = c.createOscillator(), l = c.createOscillator(), lg = c.createGain(), g = c.createGain(); o.type = "sine"; o.frequency.value = note(roots[bar] + 24 + [0, 7, 12, 15, 19, 15, 12, 7][(i >> 1) % 8]); l.frequency.value = 6; lg.gain.value = 9; l.connect(lg); lg.connect(o.frequency); env(g, t, .05, hot ? .09 : .05, s * 2); o.connect(g); g.connect(d); o.start(t); l.start(t); o.stop(t + s * 2.2); l.stop(t + s * 2.2); }
  } },
});
// ---------- recorded music (CC0, see game/music/CREDITS.md); the synthesized music is the fallback ----------
const TRACKS = { plaza: "party_1", circo: "silly_1", estadio: "dance_1", viernes: "funk_1", crucero: "party_3", boda: "jazz_1", hipodromo: "dnb_1",
  trono: "funk_2", ciudad: "party_2", mitin: "silly_2", taco: "funk_1", ovni: "space_1", aeropuerto: "party_4", arena: "action_1", rocket: "chip_2",
  zoo: "silly_1", cheese: "chip_1", zombie: "spooky_1", beach: "party_3", park: "chip_1", nuclear: "action_1", guerra: "dnb_1", fabrica: "action_1", procesion: "jazz_1", marcha: "party_2", metro: "dnb_1", mercado: "funk_2", laboratorio: "space_1" };
const MUS = { bufs: {}, loading: {}, cur: null, name: "" };
function musicBuffer(name) {
  const c = AU.ctx; if (MUS.bufs[name] || MUS.loading[name] || !c || typeof fetch !== "function" || c.constructor.name === "OfflineAudioContext") return MUS.bufs[name];
  MUS.loading[name] = true;
  fetch("music/" + name + ".ogg").then(r => r.arrayBuffer()).then(b => c.decodeAudioData(b)).then(buf => { MUS.bufs[name] = buf; }).catch(() => { /* missing: synth music */ });
  return null;
}
// crossfades to a track (or to silence with name = "")
function musicTrack(name, vol) {
  const c = AU.ctx; if (!c) return false;
  if (name && name !== MUS.name) {
    const buf = musicBuffer(name); if (!buf) return false;
    if (MUS.cur) { const o = MUS.cur; o.g.gain.setTargetAtTime(0, c.currentTime, .6); setTimeout(() => { try { o.s.stop(); } catch (e) { /* already stopped */ } }, 4000); }
    const s2 = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter();
    s2.buffer = buf; s2.loop = true; g.gain.value = 0; f.type = "lowpass"; f.frequency.value = 20000;
    s2.connect(f); f.connect(g); g.connect(AU.musicBus); s2.start(); MUS.cur = { s: s2, g, f }; MUS.name = name;
  }
  if (MUS.cur) MUS.cur.g.gain.setTargetAtTime(vol, c.currentTime, .5);
  return !!MUS.cur && MUS.name === name;
}
function audioTick() {
  const c = AU.ctx; if (!c || !AU.on) return;
  {
    // recorded music: calm track while planning, the venue's track in the show, muffled and quiet during the evacuation
    const ph = phase, want = ph === "plan" || ph === "done" ? "plan_1" : TRACKS[sceneKey] || "party_1";
    musicBuffer(TRACKS[sceneKey] || "party_1");
    const vol = ph === "show" ? (fullAt ? .85 : .6) : ph === "evac" ? .35 : .45;
    if (musicTrack(want, vol) && MUS.cur) {
      MUS.cur.f.frequency.setTargetAtTime(ph === "evac" ? 900 : ph === "show" && surgeT > 0 ? 20000 : ph === "show" ? 9000 : 2500, c.currentTime, .3);
      MUS.cur.s.playbackRate.setTargetAtTime(typeof slowT !== "undefined" && slowT > 0 ? .8 : 1, c.currentTime, .1);
      AU.music.gain.setTargetAtTime(0, c.currentTime, .3);   // the recording replaces the synth music
      audioCrowd(c); return;
    }
  }
  const live = phase === "show" || phase === "evac", st = STYLES[(scene && scene.music) || (sceneKey === "circo" ? "circus" : "edm")] || STYLES.edm;
  // music volume and filter depend on the moment of the show
  const hot = surgeT > 0, target = phase === "show" ? (fullAt ? .55 : .3) : phase === "evac" ? .12 : phase === "plan" ? .14 : 0;
  AU.music.gain.setTargetAtTime(target, c.currentTime, .4);
  AU.musicFilter.frequency.setTargetAtTime(phase === "show" ? (hot ? 9000 : fullAt ? 3800 : 1600) : 700, c.currentTime, .3);
  const s = 60 / st.bpm / (st.steps === 12 ? 3 : 4);
  while (AU.nextT < c.currentTime + .12) { st.play(AU.step % st.steps, AU.nextT, s, hot); AU.nextT += s; AU.step++; }
  audioCrowd(c);
}
function audioCrowd(c) {
  const live = phase === "show" || phase === "evac", hot = surgeT > 0;
  // the crowd gets louder and higher-pitched when squeezed
  let pr = 0; for (let i = 0; i < ag.length; i += 25) pr += ag[i].ps; pr = ag.length ? pr / Math.ceil(ag.length / 25) : 0;
  AU.crowd.gain.setTargetAtTime(live ? Math.min(.5, .04 + ag.length / 9000 + pr * .03 + (hot ? .12 : 0)) : 0, c.currentTime, .3);
  AU.crowdBand.frequency.setTargetAtTime(600 + pr * 120, c.currentTime, .3);
  // recorded loops: the crowd's murmur, panic when people are being crushed, and rain
  const n = ag.length, crush = Math.min(1, Math.max(0, pr - 2.2) / 3 + (typeof shake !== "undefined" ? shake * .6 : 0));
  loopGain("crowd_loop", live ? Math.min(.75, n / 3800 * (hot ? .9 : .55)) : 0);
  loopGain("panic_loop", live ? crush * .8 : 0);
  if (live && crush > .35 && Math.random() < crush * .05) voice("gasp", .35 + crush * .3, .7);
  if (phase === "show" && fullAt && Math.random() < .004) voice(Math.random() < .5 ? "mumble" : Math.random() < .5 ? "burp" : "cough", .3, 4);
  loopGain("rain_loop", live && MOD && MOD.rain ? .5 : 0);
  if (SMP.crowd_loop && AU.loops.crowd_loop) AU.crowd.gain.setTargetAtTime(0, c.currentTime, .3);   // the recording replaces the synthetic murmur
  // now and then the crowd starts a chant
  if (phase === "show" && fullAt && !hot && c.currentTime > (AU.nextChant || 0)) { AU.nextChant = c.currentTime + 16 + Math.random() * 14; playSample(Math.random() < .5 ? "chant_1" : "chant_2", .35); }
}

// ---------- recorded sounds (CC0, see game/audio/CREDITS.md); every one has a synthesized fallback ----------
const SMP = {};
const SAMPLE_FILES = ["crowd_loop", "panic_loop", "rain_loop", "roar_1", "roar_2", "roar_3", "cheer_1", "cheer_2", "cheer_3", "scream_1", "scream_2", "scream_3", "scream_4", "ooh", "chant_1", "chant_2", "surge",
  "moo", "baa", "trot", "oink", "cluck", "bark_1", "bark_2", "beast_1", "beast_2", "howl", "explosion", "bang_1", "bang_2", "crash_1", "crash_2", "glass", "hit_1", "hit_2", "splash_1", "splash_2", "spring", "gong", "bell",
  "ui_click", "ui_select", "ui_drop", "ui_error", "ui_confirm", "ui_back", "ui_erase", "ui_toggle", "jingle_win", "jingle_lose"];
// which recordings stand in for each synthesized effect: [names, volume, minimum seconds between plays]
const SAMPLE_FOR = {
  roar: [["beast_1", "beast_2"], .8, .4], bark: [["bark_1", "bark_2"], .6, .25], boom: [["explosion", "bang_1", "bang_2"], .8, .3], crash: [["crash_1", "crash_2", "hit_1", "hit_2"], .7, .2],
  splash: [["splash_1", "splash_2"], .8, .3], cheer: [["cheer_1", "cheer_2", "cheer_3"], .6, 1.5], scream: [["scream_1", "scream_2", "scream_3", "scream_4"], .45, 1.1],
  moo: [["moo"], .8, .5], bleat: [["baa"], .8, .5], neigh: [["trot"], .7, .8], crowdroar: [["roar_1", "roar_2", "roar_3"], .7, 2], ooh: [["ooh"], .5, 3], surge: [["surge"], .5, 4],
  tick: [["ui_toggle"], .35, .03], click: [["ui_click"], .5, .03], select: [["ui_select"], .5, .05], drop: [["ui_drop"], .6, .05], error: [["ui_error"], .5, .2], confirm: [["ui_confirm"], .6, .2],
  back: [["ui_back"], .5, .1], erase: [["ui_erase"], .5, .05], win: [["jingle_win"], .7, 1], lose: [["jingle_lose"], .7, 1], gong: [["gong"], .6, 1], bell: [["bell"], .5, .5], spring: [["spring"], .6, .3], glass: [["glass"], .6, .3],
  howl: [["howl"], .7, 1], oink: [["oink"], .7, .5], cluck: [["cluck"], .7, .3],
};
// ---------- voices (CC0, see game/audio/CREDITS.md): people, the announcer and creatures ----------
const VOICE_FILES = ["ann_female_1", "ann_female_2", "ann_female_3", "ann_female_congratulations", "ann_female_correct", "ann_female_game_over", "ann_female_go", "ann_female_hurry_up", "ann_female_mission_completed", "ann_female_mission_failed", "ann_female_new_highscore", "ann_female_objective_achieved", "ann_female_ready", "ann_female_time_over", "ann_female_war_call_for_backup", "ann_female_war_get_down", "ann_female_war_look_out", "ann_female_war_medic", "ann_female_wrong", "ann_male_1", "ann_male_2", "ann_male_3", "ann_male_congratulations", "ann_male_correct", "ann_male_game_over", "ann_male_go", "ann_male_hurry_up", "ann_male_mission_completed", "ann_male_mission_failed", "ann_male_new_highscore", "ann_male_objective_achieved", "ann_male_ready", "ann_male_time_over", "ann_male_war_call_for_backup", "ann_male_war_get_down", "ann_male_war_look_out", "ann_male_war_medic", "ann_male_wrong", "cr_alien_01", "cr_alien_03", "cr_alien_05", "cr_bug_01", "cr_bug_03", "cr_burp_01", "cr_cough_01", "cr_cute_01", "cr_cute_03", "cr_cute_05", "cr_cute_07", "cr_cute_09", "cr_die_01", "cr_die_03", "cr_eat_01", "cr_eat_03", "cr_grunt_01", "cr_grunt_03", "cr_howl", "cr_human_01", "cr_human_03", "cr_human_05", "cr_human_07", "cr_hurt_01", "cr_hurt_03", "cr_monster_01", "cr_monster_03", "cr_monster_05", "cr_monster_08", "cr_monster_12", "cr_ooh", "cr_snore", "female_falldeath", "female_gasp", "female_jump_1", "female_jump_2", "female_pain100", "female_pain25", "female_pain50", "female_pain75", "male_falldeath", "male_gasp", "male_jump_1", "male_jump_2", "male_pain100", "male_pain25", "male_pain50", "male_pain75", "pig_death", "pig_gasp", "pig_pain100", "pig_pain50"];
const VG = {   // voice groups
  ouch: ["male_pain25", "male_pain50", "male_pain75", "female_pain25", "female_pain50", "female_pain75", "male_pain100", "female_pain100"],
  splat: ["male_falldeath", "female_falldeath"], gasp: ["male_gasp", "female_gasp"], whee: ["male_jump_1", "male_jump_2", "female_jump_1", "female_jump_2"],
  pig: ["pig_pain50", "pig_pain100", "pig_gasp"], cute: ["cr_cute_01", "cr_cute_03", "cr_cute_05", "cr_cute_07", "cr_cute_09"], grunt: ["cr_grunt_01", "cr_grunt_03"],
  munch: ["cr_eat_01", "cr_eat_03"], snore: ["cr_snore"], zombie: ["cr_monster_01", "cr_monster_03", "cr_monster_05", "cr_monster_08", "cr_monster_12"],
  alien: ["cr_alien_01", "cr_alien_03", "cr_alien_05"], bug: ["cr_bug_01", "cr_bug_03"], howl: ["cr_howl"], burp: ["cr_burp_01"], cough: ["cr_cough_01"],
  ooh: ["cr_ooh"], hurt: ["cr_hurt_01", "cr_hurt_03"], mumble: ["cr_human_01", "cr_human_03", "cr_human_05", "cr_human_07"], die: ["cr_die_01", "cr_die_03"],
};
// shouts that also get a voice
const VOICE_BY_TEXT = { "BRAAAINS!": "zombie", "AWOOOO!": "howl", "OOK OOK!": "grunt", "MUNCH MUNCH!": "munch", "ZZZ...!": "snore", "WADDLE WADDLE!": "cute", "MWEEEH!": "cute",
  "MEEEH!": "cute", "AWWWWW!": "cute", "WIFI?": "alien", "VWOOOM!": "alien", "SCREEECH!": "bug", "ACHOO!": "cough", "PEE-YOO!": "cough", "NOOO!": "splat", "MY SPLEEN!": "ouch",
  "DIDN'T EVEN HURT!": "ouch", "MY PHONE!": "ouch", "WHEEE!": "whee", "WHEEEE!": "whee", "WHEEEEE!": "whee", "RAWR!": "zombie", "DINO DISCO!": "grunt", "OUTTA MY WAY!": "grunt",
  "SHARK!": "gasp", "THAT'S NOT MY DAUGHTER-IN-LAW!": "gasp", "SPICY!": "cough", "HROOOOAAAH!": "grunt", "SQUEEZE!": "cute", "FREE HUGS!": "cute", "OINK!": "pig", "BOO!": "zombie",
  "I VANT TO SHAKE YOUR HAND!": "zombie", "AHEM!": "cough", "MINE! MINE!": "cute", "COO COO!": "cute", "GRRR!": "grunt" };
const VOICE = { last: {}, ann: Math.random() < .5 ? "male" : "female" };
// trailer recording: voices are logged with the effects so they can be mixed afterwards
function logVoice(tag, gap) {
  if (!window.__sfxLog) return; const tt = vnow / 1000, L = window.__sfxLog, prev = L.findLast(e => e[0] === tag);
  if (!prev || tt - prev[1] > gap) L.push([tag, tt]);
}
function voice(group, vol, minGap) {
  logVoice("v:" + group, minGap ?? .35);
  const c = AU.ctx; if (!c || !AU.on) return false;
  const list = (VG[group] || [group]).filter(n => SMP[n]); if (!list.length) return false;
  const now = c.currentTime; if (now - (VOICE.last[group] || 0) < (minGap ?? .35)) return false;
  VOICE.last[group] = now; return playSample(list[(Math.random() * list.length) | 0], vol ?? .7, .92 + Math.random() * .16);
}
// the stadium announcer: one voice per show
function announce(line, vol) {
  logVoice("a:" + line, 1.2);
  const c = AU.ctx; if (!c || !AU.on) return;
  const n = `ann_${VOICE.ann}_${line}`; if (!SMP[n]) return;
  if (c.currentTime - (VOICE.last.ann || 0) < 1.2) return; VOICE.last.ann = c.currentTime;
  playSample(n, vol ?? .9, 1);
}
function loadSamples() {
  const c = AU.ctx; if (!c || AU.loading || typeof fetch !== "function" || c.constructor.name === "OfflineAudioContext") return;
  AU.loading = true; AU.loops = {};
  for (const n of VOICE_FILES) fetch("audio/voice/" + n + ".ogg").then(r => r.arrayBuffer()).then(b => c.decodeAudioData(b)).then(buf => { SMP[n] = buf; }).catch(() => { /* optional */ });
  for (const n of SAMPLE_FILES) fetch("audio/" + n + ".ogg").then(r => r.arrayBuffer()).then(b => c.decodeAudioData(b)).then(buf => { SMP[n] = buf; }).catch(() => { /* no file: the synth version plays instead */ });
}
function playSample(name, vol, rate) {
  const c = AU.ctx, b = SMP[name]; if (!c || !b || !AU.on) return false;
  const s = c.createBufferSource(), g = c.createGain(); s.buffer = b; s.playbackRate.value = rate || 1; g.gain.value = vol ?? .6; s.connect(g); g.connect(AU.sfx); s.start(); return true;
}
// looping beds that fade in and out
function loopGain(name, target) {
  const c = AU.ctx; if (!c || !SMP[name] || !AU.loops) return;
  let L = AU.loops[name];
  if (!L) { if (target <= 0) return; const s = c.createBufferSource(), g = c.createGain(); s.buffer = SMP[name]; s.loop = true; g.gain.value = 0; s.connect(g); g.connect(AU.sfx); s.start(); L = AU.loops[name] = { g }; }
  L.g.gain.setTargetAtTime(target, c.currentTime, .5);
}

// ---------- effects ----------
const SFX = {
  roar(t) { osc("sawtooth", 110, t, .9, .35, null, 55); noise(t, .9, .3, "lowpass", 600, 1, null, 200); },
  honk(t) { osc("square", 392, t, .14, .18); osc("square", 330, t + .18, .16, .18); },
  bark(t) { osc("square", 520, t, .07, .2, null, 300); osc("square", 520, t + .14, .07, .2, null, 300); },
  trumpet(t) { const c = AU.ctx, o = c.createOscillator(), g = c.createGain(); o.type = "sawtooth"; o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(900, t + .4); env(g, t, .05, .25, .8); o.connect(g); g.connect(AU.sfx); o.start(t); o.stop(t + .9); },
  boom(t) { osc("sine", 90, t, .8, .9, null, 30); noise(t, .6, .6, "lowpass", 1200, .7, null, 120); },
  crash(t) { noise(t, .35, .5, "bandpass", 2500, .6, null, 600); osc("square", 80, t, .15, .2); },
  whistle(t) { osc("sine", 2200, t, .25, .15); osc("sine", 2600, t + .12, .25, .15); },
  fiu(t) { osc("sine", 600, t, .7, .12, null, 2400); noise(t, .7, .08, "highpass", 3000, .5); },
  splash(t) { noise(t, .7, .5, "lowpass", 3000, .7, null, 300); },
  horn(t) { osc("sawtooth", 98, t, 1.6, .3); osc("sawtooth", 147, t, 1.6, .2); },
  quack(t) { osc("square", 700, t, .1, .12, null, 450); osc("square", 650, t + .16, .1, .12, null, 420); },
  neigh(t) { const c = AU.ctx, o = c.createOscillator(), l = c.createOscillator(), lg = c.createGain(), g = c.createGain(); o.type = "sawtooth"; o.frequency.value = 700; l.frequency.value = 18; lg.gain.value = 120; l.connect(lg); lg.connect(o.frequency); o.frequency.exponentialRampToValueAtTime(350, t + .7); env(g, t, .02, .18, .7); o.connect(g); g.connect(AU.sfx); o.start(t); l.start(t); o.stop(t + .8); l.stop(t + .8); },
  jingle(t) { [72, 76, 79, 84].forEach((n, i) => osc("sine", note(n), t + i * .12, .2, .12)); },
  cheer(t) { noise(t, 1.2, .35, "bandpass", 1100, .5); for (let k = 0; k < 8; k++) noise(t + Math.random() * .8, .08, .2, "bandpass", 1500 + Math.random() * 1500, 2); },
  scream(t) { const c = AU.ctx, o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain(); o.type = "sawtooth"; o.frequency.setValueAtTime(700 + Math.random() * 300, t); o.frequency.exponentialRampToValueAtTime(380, t + .6); f.type = "bandpass"; f.frequency.value = 1200; f.Q.value = 2; env(g, t, .02, .12, .6); o.connect(f); f.connect(g); g.connect(AU.sfx); o.start(t); o.stop(t + .7); },
  bleat(t) { const c = AU.ctx, o = c.createOscillator(), l = c.createOscillator(), lg = c.createGain(), f = c.createBiquadFilter(), g = c.createGain();
    o.type = "sawtooth"; o.frequency.setValueAtTime(420, t); o.frequency.linearRampToValueAtTime(380, t + .6); l.frequency.value = 11; lg.gain.value = 40; l.connect(lg); lg.connect(o.frequency);
    f.type = "bandpass"; f.frequency.value = 1100; f.Q.value = 1.5; env(g, t, .03, .2, .6); o.connect(f); f.connect(g); g.connect(AU.sfx); o.start(t); l.start(t); o.stop(t + .7); l.stop(t + .7); },
  tick(t) { osc("square", 1200, t, .02, .05); },
  moo(t) { const c = AU.ctx, o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain(); o.type = "sawtooth"; o.frequency.setValueAtTime(140, t); o.frequency.linearRampToValueAtTime(110, t + .9); f.type = "lowpass"; f.frequency.value = 700; env(g, t, .1, .3, .9); o.connect(f); f.connect(g); g.connect(AU.sfx); o.start(t); o.stop(t + 1.1); },
  ufo(t) { const c = AU.ctx, o = c.createOscillator(), l = c.createOscillator(), lg = c.createGain(), g = c.createGain(); o.type = "sine"; o.frequency.value = 500; l.frequency.value = 7; lg.gain.value = 260; l.connect(lg); lg.connect(o.frequency); env(g, t, .2, .14, 1.4); o.connect(g); g.connect(AU.sfx); o.start(t); l.start(t); o.stop(t + 1.6); l.stop(t + 1.6); },
  beep(t) { [0, .18, .36].forEach(d => osc("square", 1000, t + d, .08, .1)); },
  flash(t) { noise(t, .25, .4, "highpass", 4000, .7); osc("sine", 3000, t, .3, .1, null, 600); },
  siren(t) { const c = AU.ctx, o = c.createOscillator(), g = c.createGain(); o.type = "triangle"; o.frequency.setValueAtTime(600, t); o.frequency.linearRampToValueAtTime(1100, t + .5); o.frequency.linearRampToValueAtTime(600, t + 1); o.frequency.linearRampToValueAtTime(1100, t + 1.5); env(g, t, .05, .12, 1.6); o.connect(g); g.connect(AU.sfx); o.start(t); o.stop(t + 1.8); },
};
function sfx(name) {
  // when recording the trailer, effects are logged so they can be mixed later
  if (window.__sfxLog) { const tt = vnow / 1000, L = window.__sfxLog, prev = L.findLast(e => e[0] === name); if (!prev || tt - prev[1] > .12) L.push([name, tt]); }
  const c = AU.ctx; if (!c || !AU.on) return;
  const now = c.currentTime, sm = SAMPLE_FOR[name];
  if (sm) {   // a recording exists for this effect
    const ready = sm[0].filter(n => SMP[n]);
    if (ready.length) { if (now - (AU.lastSfx[name] || 0) < sm[2]) return; AU.lastSfx[name] = now; playSample(ready[(Math.random() * ready.length) | 0], sm[1], .94 + Math.random() * .12); return; }
  }
  if (!SFX[name]) return;
  if (now - (AU.lastSfx[name] || 0) < .12) return;
  AU.lastSfx[name] = now; SFX[name](now + .01);
}
// every onomatopoeia in the game makes a sound
const SFX_BY_TEXT = { "AAAAAAAAH!": "scream", "TELL MY MOM...": "scream", "DING DING!": "jingle", "TILT!": "beep", "BONUS!": "jingle", "STOP! POLICE!": "whistle", "WEEEEE-OOOO!": "siren", "BUSTED!": "cheer", "HE GOT AWAY!": "ooh", "LOL BYE!": "fiu", "FREE SAMPLES!": "jingle", "ELOTES! ESQUITES!": "honk", "ROAR!": "roar", "GRRR!": "roar", "MEEP MEEP!": "honk", "BEEEP!": "honk", "HONK!": "honk", "WOOF!": "bark", "YELP!": "bark",
  "PAWOOO!": "trumpet", "BOOM!": "boom", "CRASH!": "crash", "HALT!": "whistle", "WHOOOSH!": "fiu", "SPLASH!": "splash", "TOOOOOT!": "horn",
  "SQUAWK!": "quack", "NEIGHHH!": "neigh", "THEY'RE OFF!": "horn", "♪ ♫ ♪": "jingle", "OLEEE!": "cheer", "LET'S GOOO!": "cheer", "SETTLE DOWN!": "whistle", "COMING THROUGH!": "honk",
  "SALE!": "jingle", "♪ AY, AY, AY! ♪": "trumpet", "THAT'S NOT MY DAUGHTER-IN-LAW!": "scream", "IT'S CLOGGED!": "splash", "PHOTO WITH THE MAYOR!": "cheer",
  "QUACK!": "quack", "QUACK QUACK!": "quack", "FREE SANDWICHES!": "honk", "WE'RE HERE!": "horn", "SPLAT!": "crash", "SALSA SPILL!": "splash",
  "FREE TACOS!": "jingle", "VWOOOM!": "ufo", "MOOO!": "moo", "FLASH!": "flash", "HELLO, FANS!": "cheer", "BEEP-BEEP-BEEP!": "beep", "SNIFF, SNIFF!": "bark",
  "NOOO!": "scream", "FREE WIFI!": "jingle", "HEY BESTIES!": "cheer", "WHACK!": "crash", "COO COO!": "quack", "HERE COMES THE BOUQUET!": "cheer", "IT'S MINE!": "cheer",
  "EXCUSE ME, YOUNG MAN!": "honk", "WET FLOOR!": "beep", "THAT'S MY SONG!": "cheer", "ONE MORE! ONE MORE!": "cheer", "TAKE MY PICTURE, KIDDO!": "flash",
  "SUICIDE DIVE!": "fiu", "CHAIR SHOT!": "crash", "THE MASK!": "fiu", "OUTTA MY WAY!": "roar", "MAKE WAY, MIJOS!": "cheer", "BREAK IT UP!": "whistle", "DIDN'T EVEN HURT!": "scream",
  "VANILLA!": "jingle", "SANDWICHES!": "cheer", "SPICY!": "scream", "I'LL FIX IT!": "honk", "LOOK OVER HERE!": "flash",
  "SAY CHEESE!": "flash", "HOT DOGS! TWO FOR TEN!": "honk", "BALLOONS! GET YOUR BALLOONS!": "jingle", "DON'T MIND ME, I'M LIVE!": "cheer" };
function sfxFor(text) {
  const n = SFX_BY_TEXT[text] || (scene && scene.sfx && scene.sfx[text]); if (n) sfx(n);
  const v = VOICE_BY_TEXT[text]; if (v) voice(v, .75, .6);
  if (text === "3!" || text === "2!" || text === "1!") announce(text[0], 1);
}
