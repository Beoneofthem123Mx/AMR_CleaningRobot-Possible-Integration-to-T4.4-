// Human Tsunami · scene: Zombie Walk (Halloween street party in the old town square; the band is literally dead)
const ZMAN = { x0: 6, x1: 34, y1: 4 }, ZSTAGE = { x0: 11, y0: 4, x1: 29, y1: 9 }, ZWELL = { x: 20, y: 31, r: 1.6 };
const ZCOSTUME = ["#7a2a8a", "#d8322b", "#2f6fc4", "#e36a12", "#f4f4f2", "#3d9a5b", "#151617"];

// ---------- custom people ----------
SCENE_PERSONS.zombie_walker = { body: "#5d6650", legs: "#3b3a33", hat: "hair", hatCol: "#3a2a1c", skin: "#8fbf6a",
  extra(g, u, b, m) {
    const c = m.col || "#7a2a8a", v = m.v || 0;
    part(b, "box", c, .22, .3, .3, .06, 1.05, .05);                       // what's left of the costume
    part(b, "box", c, .05, .14, .2, .2, .86, -.08); part(b, "box", "#3b3a33", .05, .12, .12, .2, 1.22, .1);
    for (const s of [-1, 1]) { part(b, "sph", basic("#d8ff3a"), .035, .035, .035, .15, 1.68, s * .06); }  // glowing undead eyes
    part(b, "box", "#5a1a12", .04, .04, .1, .16, 1.58, 0);                // gaping mouth
    if (v === 1) part(b, "cone", mat("#ffffff", { transparent: true, opacity: .55 }), .3, .9, .3, -.2, 1.3, 0);  // zombie bride
    else if (v === 2) { part(b, "cyl", "#151617", .14, .3, .14, 0, 1.9, 0); part(b, "cyl", "#151617", .22, .03, .22, 0, 1.76, 0); }  // undead gentleman
    else if (v === 3) part(b, "box", "#d8322b", .05, .45, .1, .2, 1.15, 0);  // office zombie with tie
    const sh = rnd(0, 6);
    u.anim = (tt) => {  // arms straight out, shambling sway
      if (u.arms) u.arms.forEach((p, i) => { p.rotation.z = 1.45 + Math.sin(tt * 2.2 + i + sh) * .12; p.rotation.x = (i ? .12 : -.12); });
      if (u.body) { u.body.rotation.x = Math.sin(tt * 2.2 + sh) * .12; u.body.rotation.z = -.15; }
    };
  } };
SCENE_PERSONS.zombie_vamp = { body: "#151617", legs: "#151617", hat: "hair", hatCol: "#0a0a0a", skin: "#e8e2f0", scale: 1.05,
  extra(g, u, b) {
    const cape = part(b, "box", "#151617", .06, 1.1, .7, -.24, 1.05, 0); cape.rotation.z = .12;
    part(b, "box", "#b2232c", .05, 1.0, .6, -.21, 1.05, 0);
    part(b, "box", "#151617", .1, .35, .8, -.12, 1.62, 0);                // tall collar
    part(b, "box", "#e3b23c", .05, .5, .1, .2, 1.15, .02); part(b, "sph", "#e3b23c", .1, .1, .1, .21, 1.3, 0);  // mayoral sash and medal
    for (const s of [-1, 1]) part(b, "cone", "#ffffff", .02, .06, .02, .16, 1.56, s * .03);
    for (const s of [-1, 1]) part(b, "sph", basic("#ff3b2f"), .03, .03, .03, .15, 1.68, s * .06);
  } };
SCENE_PERSONS.zombie_wolf = { body: "#6b4a2b", legs: "#5a3a8a", hat: "none", skin: "#7a5a3a", scale: 1.15,
  extra(g, u, b) {
    part(b, "sph", "#7a5a3a", .22, .22, .22, .02, 1.66, 0);
    part(b, "sph", "#7a5a3a", .16, .1, .1, .22, 1.6, 0); part(b, "sph", "#151617", .04, .04, .04, .37, 1.62, 0);  // snout
    for (const s of [-1, 1]) { part(b, "cone", "#5a3a22", .06, .18, .06, -.02, 1.88, s * .11); part(b, "sph", basic("#ffd23a"), .035, .035, .035, .18, 1.72, s * .08); }
    part(b, "sph", "#8a6a4a", .2, .3, .26, .06, 1.15, 0);                // furry chest
    for (const z of [-.15, 0, .15]) part(b, "box", "#d8d0c0", .02, .2, .03, .22, .82, z);  // torn shorts
  } };

// ---------- custom models ----------
SCENE_MODELS.zombie_skel = (g, u, m) => {
  const bone = "#efe9d8", inst = m.inst || "guitar";
  for (const s of [-1, 1]) u.legs.push(leg(g, 0, .85, s * .11, .035, .85, bone));
  const b = pivot(g, 0, 0, 0);
  part(b, "box", bone, .14, .1, .34, 0, .9, 0);                                    // pelvis
  part(b, "cyl", bone, .03, .45, .03, -.02, 1.12, 0);                             // spine
  for (let i = 0; i < 4; i++) part(b, "box", bone, .2 - i * .015, .035, .4 - i * .03, .02, 1.22 + i * .08, 0);  // ribs
  const head = u.skull = pivot(b, .02, 1.65, 0);
  part(head, "sph", bone, .17, .17, .16, 0, 0, 0); part(head, "box", bone, .1, .08, .2, .08, -.12, 0);
  for (const s of [-1, 1]) part(head, "sph", basic("#7dff6a"), .045, .05, .045, .14, .03, s * .065);  // glowing sockets
  part(head, "box", "#151617", .02, .02, .12, .17, -.12, 0);
  if (m.hat) { part(head, "cyl", "#151617", .13, .26, .13, -.02, .25, 0); part(head, "cyl", "#151617", .22, .03, .22, -.02, .12, 0); part(head, "cyl", "#7a2a8a", .135, .05, .135, -.02, .16, 0); }
  u.arms = [-1, 1].map(s => { const p = pivot(b, 0, 1.45, s * .22); part(p, "cyl", bone, .025, .6, .025, 0, -.3, 0); part(p, "sph", bone, .05, .05, .05, 0, -.62, 0); return p; });
  if (inst === "guitar") { part(b, "sph", "#7a2a8a", .26, .08, .3, .3, 1.05, .1); part(b, "box", "#151617", .6, .04, .06, .65, 1.2, .1); part(b, "sph", basic("#7dff6a"), .06, .02, .06, .3, 1.1, .1); }
  else if (inst === "drums") {
    part(g, "cyl", "#d8322b", .45, .45, .45, .55, .45, 0); part(g, "cyl", "#efe9d8", .46, .02, .46, .55, .69, 0);
    for (const s of [-1, 1]) { part(g, "cyl", "#151617", .22, .25, .22, .55, .85, s * .45); part(g, "cyl", mat("#e3b23c", { metalness: .7, roughness: .3 }), .3, .02, .3, .3, 1.25, s * .6); }
  }
  else if (inst === "organ") { part(g, "box", "#3a1a2a", .5, .9, 1.2, .55, .45, 0); part(g, "box", "#f4f4f2", .25, .04, 1.1, .45, .92, 0); for (let i = 0; i < 5; i++) part(g, "cyl", mat("#c9a14a", { metalness: .7, roughness: .3 }), .05, .8 + i * .15, .05, .8, 1.2 + i * .07, -.4 + i * .2); }
  else { const t = part(b, "cyl", "#e3b23c", .05, .5, .05, .45, 1.55, .12); t.rotation.z = -Math.PI / 2; const c = part(b, "cone", "#e3b23c", .12, .16, .12, .72, 1.55, .12); c.rotation.z = -Math.PI / 2; }
  const ph = m.ap || 0;
  u.anim = (tt) => {
    const live = phase === "show" || phase === "evac";
    head.rotation.z = Math.sin(tt * 7 + ph) * (live ? .25 : .05); head.position.y = 1.65 + Math.abs(Math.sin(tt * 7 + ph)) * .05;
    b.position.y = live ? Math.abs(Math.sin(tt * 3.5 + ph)) * .08 : 0;
    u.legs.forEach(p => p.rotation.z = 0);
    if (inst === "drums") u.arms.forEach((p, i) => { p.rotation.z = 1.0 + Math.sin(tt * 14 + i * Math.PI) * .45; });
    else if (inst === "trumpet") u.arms.forEach(p => { p.rotation.z = 1.6; });
    else if (inst === "organ") u.arms.forEach((p, i) => { p.rotation.z = 1.2 + Math.sin(tt * 10 + i * 2) * .2; });
    else u.arms.forEach((p, i) => { p.rotation.z = i ? .9 + Math.sin(tt * 12) * .3 : 1.2; });
  };
};
SCENE_MODELS.zombie_pumpkin = (g, u, m) => {
  const r = m.r || 1.4; u.ball = pivot(g, 0, r, 0);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; part(u.ball, "sph", i % 2 ? "#e36a12" : "#f07a1e", r * .55, r * .9, r * .55, Math.cos(a) * r * .45, 0, Math.sin(a) * r * .45); }
  part(u.ball, "cyl", "#3d6a2a", r * .12, r * .4, r * .12, 0, r * .95, 0);
  const glow = basic("#ffd23a");
  for (const s of [-1, 1]) { const e = part(u.ball, "cone", glow, r * .16, r * .22, r * .05, r * .92, r * .25, s * r * .3); e.rotation.z = -Math.PI / 2; }
  part(u.ball, "box", glow, r * .1, r * .14, r * .7, r * .95, -r * .28, 0);
  for (const s of [-1, 1]) part(u.ball, "box", "#e36a12", r * .12, r * .1, r * .1, r * .98, -r * .2, s * r * .15);  // teeth gaps
};
SCENE_MODELS.zombie_hearse = (g, u) => {
  const black = mat("#151617", { metalness: .5, roughness: .25 }), chrome = mat("#c9ced6", { metalness: .9, roughness: .2 });
  part(g, "box", black, 5.2, .9, 2, 0, .75, 0);
  part(g, "box", black, 3.6, 1.0, 1.9, -.6, 1.65, 0);
  part(g, "box", mat("#5a2a7a", { roughness: .5 }), 2.6, .7, 1.94, -.9, 1.7, 0);   // purple curtains
  part(g, "box", mat("#1d2733", { roughness: .1 }), .1, .7, 1.7, 1.2, 1.7, 0);     // windscreen
  part(g, "box", "#8a5a34", 2.2, .35, .7, -1.0, 2.25, 0);                           // coffin on the roof rack (for show)
  part(g, "box", "#e3b23c", .1, .36, .72, -1.6, 2.25, 0); part(g, "box", "#e3b23c", .1, .36, .72, -.4, 2.25, 0);
  part(g, "box", chrome, .1, .3, 2, 2.6, .6, 0); part(g, "box", chrome, 5.2, .06, 2.02, 0, 1.1, 0);
  for (const s of [-1, 1]) part(g, "sph", basic("#d8ff3a"), .12, .12, .12, 2.62, .8, s * .7);
  for (const x of [-1.7, 1.6]) for (const s of [-1, 1]) { const w = part(g, "cyl", "#0a0a0a", .42, .3, .42, x, .42, s * 1); w.rotation.x = Math.PI / 2; }
  for (const s of [-1, 1]) { const f = part(g, "sph", "#ff6fb1", .2, .2, .2, 2.0, 1.25, s * .9); }  // wreaths of plastic flowers
};
SCENE_MODELS.zombie_bat = (g, u) => {
  part(g, "sph", "#1c1424", .28, .2, .2, 0, 0, 0); part(g, "sph", "#1c1424", .15, .14, .14, .25, .05, 0);
  for (const s of [-1, 1]) { part(g, "cone", "#1c1424", .05, .12, .05, .25, .2, s * .07); part(g, "sph", basic("#ff3b2f"), .03, .03, .03, .37, .08, s * .05); }
  u.wings = [-1, 1].map(s => { const p = pivot(g, 0, .05, s * .1); part(p, "box", "#3a1a4a", .45, .03, .8, 0, 0, s * .4); part(p, "cone", "#3a1a4a", .2, .5, .03, -.15, 0, s * .6).rotation.x = Math.PI / 2; return p; });
};
SCENE_MODELS.zombie_bucket = (g, u) => {
  const pb = part(g, "cyl", "#e36a12", .45, .55, .45, 0, .45, 0); pb.rotation.z = 1.35;
  for (const s of [-1, 1]) part(g, "box", basic("#ffd23a"), .02, .12, .12, .12, .7, s * .15);
  const cols = ["#ff3b2f", "#ffd23a", "#7dff6a", "#ff6fb1", "#4fd8ff", "#a98bff"];
  for (let i = 0; i < 26; i++) { const a = i * 2.39, d = .5 + (i % 6) * .28; part(g, "box", cols[i % 6], .2, .1, .12, Math.cos(a) * d + .6, .06, Math.sin(a) * d); }
};

// ---------- the venue ----------
SCENES.zombie = {
  name: "Zombie Walk", tag: "Costumes mandatory. Brains optional.", outside: "#140f1c", bulbH: 1.1, night: true, music: "space",
  light: { sky: 0x8f6fe0, ground: 0x0f160c, hemi: .46, sun: 0xc8ffc0, sunI: .78 }, crowd: 3000, fenceBudget: 70, maxGates: 5, guards: 4,
  gates: [F, F, T, F, T, F, F], unlock: 26, place: "THE OLD TOWN SQUARE",
  heights: { zmansion: 6, zstage: 1.2, zgrave: .35, zcrypt: 3.4, ztree: 3.2, zwell: .9, ztomb: 1.2, zcandy: 2.2 },
  sfx: { "BRAAAINS!": "roar", "AWOOOO!": "roar", "BOING!": "boom", "FSSSSHHH!": "splash", "FREE CANDY!": "jingle", "SCREEECH!": "quack",
    "I VANT TO SHAKE YOUR HAND!": "scream", "VOTE FOR ME!": "cheer", "MIND THE COFFIN!": "horn", "BOO!": "scream" },
  intro: "Ten thousand people dressed as the undead are shambling into the old town square. The headliners are a band of actual skeletons, the fog machine has no off switch, and nobody can tell the real monsters from the costumes.",
  acts: ["Thriller! Thriller!", "Raise the dead!", "Bone-chilling solo!", "Grave rave!"],
  events: ["horde", "hearse", "pumpkin", "fog", "candy", "vampire", "werewolf", "horde"],
  goal: o => o.kind === "barrier", goalMaxY: 13,
  lines: {
    horde: "A horde of shambling zombies crossed the square groaning for brains; nobody had any to spare.",
    hearse: "A hearse drove through the crowd looking for parking; the passenger in the back did not complain.",
    pumpkin: "A giant inflatable pumpkin broke its moorings and bowled through the costumes like a seasonal wrecking ball.",
    fog: "The fog machine went off at full power and the square became a slippery cloud of purple soup.",
    candy: "A bucket of candy hit the cobblestones and three hundred grown adults fought over a single fun-size bar.",
    vampire: "A swarm of bats announced a vampire, who turned out to be the mayor shaking hands for reelection.",
    werewolf: "The moon came out and a werewolf ran through the crowd; witnesses insist it was not a costume.",
  },
  quotes: ["“I'm not in costume, I've just been in this line since Tuesday,” said one zombie.",
    "“We've been dead for two hundred years and we've never played a crowd this lively,” said the skeleton drummer.",
    "“The bats were not authorized by the city,” clarified the mayor, still wearing fangs."],
  build() {
    rect(ZMAN.x0, 0, ZMAN.x1, ZMAN.y1, "zmansion");
    rect(ZSTAGE.x0, ZSTAGE.y0, ZSTAGE.x1, ZSTAGE.y1, "zstage");
    seg(9, 4, 9, 11, .4, "barrier"); seg(31, 4, 31, 11, .4, "barrier"); seg(9, 11, 31, 11, .4, "barrier");
    rect(0, 14, 8, 46, "zgrave");                      // the graveyard (fenced off)
    rect(33, 17, WW, 25, "zcrypt");                    // the family crypt
    circ(ZWELL.x, ZWELL.y, ZWELL.r, "zwell");
    circ(13.5, 22, .55, "ztree"); circ(27, 21, .55, "ztree"); circ(30, 40, .55, "ztree"); circ(11.5, 41, .55, "ztree");
    // loose tombstones from the old churchyard: a row that squeezes the crowd
    for (const x of [10, 13.5, 17, 23, 26.5, 30, 35]) rect(x - .6, 49, x + .6, 49.5, "ztomb");
    rect(34, 33, 39, 37, "zcandy");
  },
  ground(g) {
    g.fillStyle = "#2a2433"; g.fillRect(0, 0, WW, WH);
    // cobblestones, a bit sticky
    const rand = rng(31);
    for (let y = 0, row = 0; y < FENCE_Y; y += .7, row++) for (let x = (row % 2) * .45; x < WW; x += .9) {
      const l = 30 + rand() * 14; g.fillStyle = `hsl(${265 + rand() * 30},${12 + rand() * 10}%,${l * .55}%)`;
      g.beginPath(); g.ellipse(x + .45, y + .35, .4, .3, 0, 0, 7); g.fill();
    }
    // spooky glow toward the stage
    const glow = g.createRadialGradient(20, 8, 2, 20, 8, 30); glow.addColorStop(0, "rgba(140,255,120,.22)"); glow.addColorStop(1, "rgba(140,255,120,0)");
    g.fillStyle = glow; g.fillRect(0, 0, WW, FENCE_Y);
    // paint splatters (purple and slime green) and shuffling footprints
    for (let k = 0; k < 90; k++) { g.fillStyle = k % 2 ? "rgba(125,255,106,.28)" : "rgba(169,90,255,.3)"; g.beginPath(); g.arc(rand() * WW, 12 + rand() * 54, .2 + rand() * .7, 0, 7); g.fill(); }
    g.fillStyle = "rgba(160,30,40,.45)";
    for (let k = 0; k < 40; k++) { const x = 4 + (k % 8) * 4.6 + Math.sin(k) * .6, y = 64 - k * 1.1 % 44; g.beginPath(); g.ellipse(x + (k % 2) * .35, y, .14, .26, .2, 0, 7); g.fill(); }
    // the street outside
    g.fillStyle = "#17141c"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
    g.fillStyle = "#e36a12"; for (let x = 1; x < WW; x += 4) g.fillRect(x, 69, 2.2, .3);
    g.font = "900 .9px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "rgba(125,255,106,.75)";
    g.fillText("COSTUMES MANDATORY · BRAINS OPTIONAL · NO REAL BITING", 20, 71);
  },
  decor(g) {
    // the haunted mansion seen from above: slate roof with glowing skylights
    g.fillStyle = "#2b2236"; g.fillRect(ZMAN.x0, 0, ZMAN.x1 - ZMAN.x0, ZMAN.y1);
    g.strokeStyle = "rgba(0,0,0,.4)"; g.lineWidth = .08; for (let y = .4; y < ZMAN.y1; y += .5) { g.beginPath(); g.moveTo(ZMAN.x0, y); g.lineTo(ZMAN.x1, y); g.stroke(); }
    g.fillStyle = "#ffd23a"; for (let x = 8; x < 33; x += 3) g.fillRect(x, 1.4, .8, 1.1);
    // stage: rotten floorboards
    g.fillStyle = "#3a2a22"; g.fillRect(ZSTAGE.x0, ZSTAGE.y0, ZSTAGE.x1 - ZSTAGE.x0, ZSTAGE.y1 - ZSTAGE.y0);
    g.strokeStyle = "rgba(0,0,0,.45)"; g.lineWidth = .06; for (let x = ZSTAGE.x0; x < ZSTAGE.x1; x += .6) { g.beginPath(); g.moveTo(x, ZSTAGE.y0); g.lineTo(x, ZSTAGE.y1); g.stroke(); }
    g.fillStyle = "#7a2a8a"; g.fillRect(ZSTAGE.x0, ZSTAGE.y1 - .35, ZSTAGE.x1 - ZSTAGE.x0, .35);
    g.font = "900 .7px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#7dff6a"; g.fillText("THE GRATEFUL DEAD (ACTUALLY)", 20, ZSTAGE.y1 - .9);
    for (const o of obs) if (o.kind === "barrier") { g.lineWidth = o.th; g.strokeStyle = "#5a4a66"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
    // graveyard: dead grass, tombstones, iron fence
    g.fillStyle = "#24301e"; g.fillRect(0, 14, 8, 32);
    const rand = rng(7);
    for (let k = 0; k < 300; k++) { g.fillStyle = k % 2 ? "rgba(60,80,40,.6)" : "rgba(20,30,15,.6)"; g.fillRect(rand() * 8, 14 + rand() * 32, .06, .25); }
    g.strokeStyle = "#151617"; g.lineWidth = .18; g.strokeRect(.1, 14.1, 7.8, 31.8);
    g.fillStyle = "#151617"; for (let y = 14; y <= 46; y += .8) { g.beginPath(); g.arc(8, y, .12, 0, 7); g.fill(); }
    // crypt
    g.fillStyle = "#4a4552"; g.fillRect(33, 17, 7, 8); g.fillStyle = "#3a3542"; g.fillRect(33, 17, 7, 1.2); g.fillRect(33, 23.8, 7, 1.2);
    g.fillStyle = "#c9ced6"; g.font = "900 .55px Rubik, sans-serif"; g.fillText("R.I.P. FAMILY", 36.5, 21.2); g.fillText("VLADMORE", 36.5, 22);
    // well and its wet stones
    g.fillStyle = "#3a3542"; g.beginPath(); g.arc(ZWELL.x, ZWELL.y, ZWELL.r, 0, 7); g.fill();
    g.fillStyle = "#4fd86a"; g.beginPath(); g.arc(ZWELL.x, ZWELL.y, ZWELL.r * .65, 0, 7); g.fill();
    // dead trees (crowns of bare twigs seen from above)
    for (const o of obs) if (o.kind === "ztree") {
      g.strokeStyle = "#1a120c"; g.lineWidth = .14;
      for (let i = 0; i < 7; i++) { const a = i * .9 + o.x, l = 1.6 + (i % 3) * .5; g.beginPath(); g.moveTo(o.x, o.y); g.lineTo(o.x + Math.cos(a) * l, o.y + Math.sin(a) * l); g.stroke(); }
      g.fillStyle = "#2a1c12"; g.beginPath(); g.arc(o.x, o.y, o.r, 0, 7); g.fill();
    }
    for (const o of obs) if (o.kind === "ztomb") { g.fillStyle = "#8a8794"; g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0); }
    // candy stall
    for (const o of obs) if (o.kind === "zcandy") {
      for (let x = o.x0, i = 0; x < o.x1; x += .5, i++) { g.fillStyle = i % 2 ? "#e36a12" : "#151617"; g.fillRect(x, o.y0, .5, o.y1 - o.y0); }
      g.fillStyle = "#ffd23a"; g.font = "900 .6px Rubik, sans-serif"; g.fillText("CANDY", (o.x0 + o.x1) / 2, (o.y0 + o.y1) / 2);
    }
    // the giant spiderweb sign painted on the cobblestones
    const wx = 20, wy = 41, wr = 6.2;
    g.strokeStyle = "rgba(235,235,245,.55)"; g.lineWidth = .1;
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx + Math.cos(a) * wr, wy + Math.sin(a) * wr * .7); g.stroke(); }
    for (let r = 1; r < wr; r += 1) { g.beginPath(); for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI * 2, rr = r * (i % 2 ? .93 : 1); g.lineTo(wx + Math.cos(a) * rr, wy + Math.sin(a) * rr * .7); } g.stroke(); }
    g.font = "900 2px Rubik, sans-serif"; g.fillStyle = "#7dff6a"; g.strokeStyle = "#151617"; g.lineWidth = .25;
    g.strokeText("ZOMBIE WALK", wx, wy + .2); g.fillText("ZOMBIE WALK", wx, wy + .2);
    g.font = "900 .7px Rubik, sans-serif"; g.fillStyle = "#e36a12"; g.fillText("SHAMBLE THIS WAY →", wx, wy + 2.2);
    // a painted spider in the corner
    g.fillStyle = "#151617"; g.beginPath(); g.arc(wx + 3.8, wy - 2.4, .45, 0, 7); g.fill();
    g.strokeStyle = "#151617"; g.lineWidth = .08; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + .2; g.beginPath(); g.moveTo(wx + 3.8, wy - 2.4); g.lineTo(wx + 3.8 + Math.cos(a) * .9, wy - 2.4 + Math.sin(a) * .9); g.stroke(); }
  },
  bulbs: [...Array.from({ length: 12 }, (_, i) => [9.8 + i * 1.86, 11.6]), ...Array.from({ length: 6 }, (_, i) => [8.4, 4.6 + i * 1.2]), ...Array.from({ length: 6 }, (_, i) => [31.6, 4.6 + i * 1.2])],
  beams: [{ x: 12, y: 5, a: Math.PI / 2 + .5, sweep: .6, h: 10 }, { x: 28, y: 5, a: Math.PI / 2 - .5, sweep: .6, h: 10 }, { x: 20, y: 3, a: Math.PI / 2, sweep: .4, h: 9, white: true },
          { x: 3, y: 60, a: -.9, sweep: .4, h: 7 }, { x: 37, y: 60, a: -2.2, sweep: .4, h: 7 }],
  extra3D(grp) {
    // mansion towers, glowing windows and the door
    for (const x of [ZMAN.x0 + 1.5, ZMAN.x1 - 1.5]) {
      part(grp, "cyl", "#3a3046", 1.5, 9, 1.5, x, 4.5, 2); part(grp, "cone", "#5a2a7a", 1.9, 3.2, 1.9, x, 10.6, 2);
      part(grp, "box", basic("#ffd23a"), .6, 1, .1, x, 7.5, 3.45);
    }
    part(grp, "cone", "#3a2448", 2.6, 4, 2.6, 20, 8, 2);
    for (let x = 9.5; x < 31; x += 3) if (Math.abs(x - 20) > 2) for (const y of [3, 5]) part(grp, "box", basic(x % 2 ? "#ffd23a" : "#7dff6a"), .8, 1.1, .08, x, y, 4.05);
    part(grp, "box", basic("#ff8a1a"), 1, 1.4, .1, 20, 6.8, 4.05);
    // the glowing ZOMBIE WALK sign over the mansion
    const c = document.createElement("canvas"); c.width = 512; c.height = 128; const x2 = c.getContext("2d");
    x2.fillStyle = "#140f1c"; x2.fillRect(0, 0, 512, 128); x2.strokeStyle = "rgba(230,230,245,.7)"; x2.lineWidth = 2;
    for (let i = 0; i < 9; i++) { x2.beginPath(); x2.moveTo(0, 0); x2.lineTo(Math.cos(i / 16 * Math.PI) * 220, Math.sin(i / 16 * Math.PI) * 220); x2.stroke(); }
    for (let r = 40; r < 220; r += 40) { x2.beginPath(); x2.arc(0, 0, r, 0, Math.PI / 2); x2.stroke(); }
    x2.font = "900 76px Rubik, sans-serif"; x2.textAlign = "center"; x2.textBaseline = "middle"; x2.fillStyle = "#7dff6a"; x2.fillText("ZOMBIE WALK", 280, 66);
    const tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding;
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(12, 3), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, side: THREE.DoubleSide }));
    sign.position.set(20, 9, 3.2); sign.rotation.x = -.5; grp.add(sign);
    for (const s of [-1, 1]) part(grp, "cyl", "#151617", .08, 3, .08, 20 + s * 5.5, 7.5, 3);
    // moon
    part(grp, "sph", basic("#f4f0c8"), 2.2, 2.2, 2.2, 33, 15, -6);
    // graveyard: tombstones, crosses and an iron fence
    const r = rng(19);
    for (let y = 16; y < 45; y += 2.6) for (let x = 1.5; x < 7.5; x += 2.2) {
      const jx = x + r() * .5, jy = y + r() * .6, k = r();
      if (k < .55) { part(grp, "box", "#8a8794", .55, .8, .16, jx, .75, jy); const t = part(grp, "cyl", "#8a8794", .275, .16, .275, jx, 1.15, jy); t.rotation.x = Math.PI / 2; }
      else if (k < .85) { part(grp, "box", "#6f6c7a", .1, 1.1, .1, jx, .9, jy); part(grp, "box", "#6f6c7a", .55, .1, .1, jx, 1.15, jy); }
      else part(grp, "box", "#5d5a68", .7, .5, .35, jx, .6, jy);
    }
    for (let y = 14.2; y <= 46; y += .8) part(grp, "cyl", "#151617", .04, 1.4, .04, 8, .7, y);
    for (const h of [.5, 1.3]) part(grp, "box", "#151617", .06, .06, 32, 8, h, 30);
    for (let x = .2; x < 8; x += .8) part(grp, "cyl", "#151617", .04, 1.4, .04, x, .7, 46);
    // tombstones on the square
    for (const o of obs) if (o.kind === "ztomb") { const t = part(grp, "cyl", "#8a8794", .6, .5, .6, (o.x0 + o.x1) / 2, 1.2, (o.y0 + o.y1) / 2); t.rotation.x = Math.PI / 2; t.scale.z = .25; }
    // crypt roof and angel
    const roof = part(grp, "cone", "#3a3542", 5.4, 2, 5.4, 36.5, 4.4, 21); roof.rotation.y = Math.PI / 4; roof.scale.z = 1.15;
    part(grp, "sph", "#8a8794", .35, .6, .35, 33.5, 4.2, 21); part(grp, "sph", "#8a8794", .2, .2, .2, 33.5, 5, 21);
    // dead trees: bare branches
    for (const o of obs) if (o.kind === "ztree") for (let i = 0; i < 5; i++) {
      const a = i * 1.26 + o.x, br = part(grp, "cyl", "#2a1c12", .07, 2.2, .07, o.x + Math.cos(a) * .7, 3.6 + (i % 2) * .5, o.y + Math.sin(a) * .7);
      br.rotation.set(Math.sin(a) * .8, 0, -Math.cos(a) * .8);
    }
    // the well: a roof and a bucket
    for (const s of [-1, 1]) part(grp, "box", "#3a2a22", .15, 2, .15, ZWELL.x + s * 1.2, 1.5, ZWELL.y);
    const wr = part(grp, "cone", "#5a2a7a", 2, 1, 1.2, ZWELL.x, 2.9, ZWELL.y); wr.rotation.y = Math.PI / 4;
    // jack-o'-lanterns everywhere
    const jack = (x, y, s) => {
      part(grp, "sph", "#e36a12", s, s * .8, s, x, s * .8, y); part(grp, "cyl", "#3d6a2a", s * .12, s * .4, s * .12, x, s * 1.7, y);
      for (const k of [-1, 1]) part(grp, "box", basic("#ffd23a"), s * .25, s * .25, .05, x + k * s * .35, s * 1.0, y + s * .95);
      part(grp, "box", basic("#ffd23a"), s * .8, s * .18, .05, x, s * .55, y + s * .97);
    };
    for (const [x, y, s] of [[10, 12, .45], [30, 12, .45], [13, 12, .35], [27, 12, .35], [9, 46.5, .5], [2, 62, .55], [38, 62, .55], [33, 38, .5], [39, 38.5, .4], [32, 26, .5], [18, 32.6, .35], [22, 32.6, .35], [36, 47, .45], [5, 48, .45]]) jack(x, y, s);
    // a stack of hay and a scarecrow by the candy stall
    part(grp, "box", "#e3c25c", 1.4, .8, .9, 36.5, .4, 38.5); part(grp, "cyl", "#3a2a22", .06, 2.2, .06, 37, 1.9, 38.5);
    part(grp, "box", "#7a2a8a", .2, .7, 1, 37, 2.2, 38.5); part(grp, "sph", "#e36a12", .3, .3, .3, 37, 2.85, 38.5);
  },
  ev: {
    horde(side) {
      const y = rnd(30, 58);
      for (let n = 0; n < 8; n++) {
        const yy = y + rnd(-3, 3);
        addMover({ kind: "zombie_walker", col: pick(ZCOSTUME), v: n % 4, x: (side ? -2 : WW + 2) + (side ? -1 : 1) * n * 1.4, y: yy,
          pts: [[20 + rnd(-6, 6), yy + rnd(-4, 4)], [side ? WW + 6 : -6, yy + rnd(-6, 6)]], speed: .8 + Math.random() * .3, r: .45, push: 22, scare: 2.2,
          say: n % 3 ? "" : "BRAAAINS!", sayEvery: 3 + n * .3 });
      }
      caption("A horde of real-looking zombies is shambling through the crowd!", true, 2200);
    },
    hearse(side) {
      const y = rnd(52, 60);
      addMover({ kind: "zombie_hearse", x: side ? -4 : WW + 4, y, pts: [[side ? WW + 6 : -6, y + rnd(-2, 2)]], speed: 3.4, r: 1.3, push: 40, scare: 3.2, say: "MIND THE COFFIN!", sayEvery: 2.4 });
      caption("A hearse is looking for parking in the middle of the party", true, 1900);
    },
    pumpkin() {
      addMover({ kind: "zombie_pumpkin", beh: "bounce", x: rnd(12, 28), y: 16, vx: rnd(-3, 3), vy: rnd(2.5, 3.5), r: 1.4, push: 14, life: 13, say: "BOING!", sayEvery: 2.6 });
      caption("The giant inflatable pumpkin broke loose!", false, 1900);
    },
    fog() {
      const [fx, fy] = crowdPoint();
      pop(fx, fy - 1, "FSSSSHHH!"); slipT = Math.max(slipT, 2.2);
      for (let k = 0; k < 8; k++) later(k * .3, () => {
        for (let n = 0; n < 9; n++) puff(fx + rnd(-5, 5), fy + rnd(-4, 4), .3 + Math.random() * .5, n % 3 ? "#9a7fd0" : "#7dff9a", .45 + Math.random() * .4, 2.5 + Math.random() * 1.2, .2);
      });
      caption("The fog machine went off! The cobblestones are slippery", true, 2000);
    },
    candy() {
      const [cx, cy] = crowdPoint();
      addMover({ kind: "zombie_bucket", beh: "static", x: cx, y: cy, life: 8, r: .4, push: 0 });
      pop(cx, cy - 1, "FREE CANDY!"); tempAttract(cx, cy, 2.6, 5, .35);
      caption("Someone spilled a whole bucket of candy!", true, 1900);
    },
    vampire(side) {
      for (let n = 0; n < 7; n++) {
        const y = rnd(14, 60);
        addMover({ kind: "zombie_bat", x: side ? -2 - n * 1.5 : WW + 2 + n * 1.5, y, pts: [[20 + rnd(-8, 8), rnd(20, 50)], [side ? WW + 4 : -4, y + rnd(-10, 10)]],
          speed: 6 + Math.random() * 2, r: .3, push: 0, scare: 0, air: true, h: 3.5 + Math.random() * 3, say: n ? "" : "SCREEECH!", sayEvery: 2 });
      }
      later(1.5, () => {
        if (phase !== "show") return;
        addMover({ kind: "zombie_vamp", x: 32.6, y: 21, pts: [[30, 27], crowdPoint(), crowdPoint(), [openGateX(), 64], [openGateX(), SH + 3]], speed: 1.1, r: .45, push: 12, calm: 3,
          say: "I VANT TO SHAKE YOUR HAND!", sayEvery: 3.5, tick: followTick(12, 2.6, .3) });
        later(5, () => { if (phase === "show") { caption("Plot twist: the vampire is the mayor", false, 2200); pop(30, 28, "VOTE FOR ME!"); } });
      });
      caption("Bats! Something is coming out of the crypt...", true, 2000);
    },
    werewolf() {
      flash = Math.max(flash, 1); pop(6, 15, "AWOOOO!");
      const gx = openGateX();
      later(.8, () => {
        if (phase !== "show") return;
        addMover({ kind: "zombie_wolf", x: 8.6, y: 30, pts: [crowdPoint(), crowdPoint(), [gx, 63], [gx, SH + 3]], speed: 4.6, r: .5, push: 25, scare: 3.4, say: "AWOOOO!", sayEvery: 2.2 });
      });
      caption("The moon came out... that werewolf is NOT a costume!", true, 2200);
    },
  },
  performers: () => [
    { kind: "zombie_skel", inst: "guitar", ap: .6, orbit: [14.5, 6.5, .01, 0, 0], h: 1.2, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "zombie_skel", inst: "drums", ap: 1.5, orbit: [18, 5.2, .01, 0, 0], h: 1.2, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "zombie_skel", inst: "trumpet", hat: true, orbit: [21.5, 7.2, .8, .6, 0], h: 1.2, x: 0, y: 0, ang: 0, t: 0 },
    { kind: "zombie_skel", inst: "organ", ap: 2.7, orbit: [25.5, 5.5, .01, 0, 0], h: 1.2, x: 0, y: 0, ang: 0, t: 0 },
  ],
};
