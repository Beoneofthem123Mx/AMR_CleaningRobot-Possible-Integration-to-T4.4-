// Human Tsunami · sky life: more kinds of birds per venue, and very random things crossing the sky
// Purely visual (nothing here collides with the crowd), built from a few low-poly parts.
const TROPICAL = new Set(["beach", "crucero", "zoo", "taco", "boda"]);
// ---------- resident birds: eagles everywhere by day, parrots/toucans/flamingos in tropical venues, bats at night ----------
function buildFauna() {
  if (G3.fauna) G3.scene.remove(G3.fauna);   // built from the shared GEO primitives: nothing to dispose
  const grp = G3.fauna = new THREE.Group(); grp.userData.key = sceneKey; G3.scene.add(grp); G3.faunaList = [];
  const add = (g, u) => { g.userData = u; g.traverse(o => { if (o.isMesh) o.castShadow = true; }); grp.add(g); G3.faunaList.push(g); };
  const wing = (b, m, len, w) => { const wl = pivot(b, 0, 0, -.06), wr = pivot(b, 0, 0, .06); part(wl, "box", m, w, .02, len, 0, 0, -len / 2); part(wr, "box", m, w, .02, len, 0, 0, len / 2); return [wl, wr]; };
  if (scene.night) {   // bats, fluttering in jerky loops
    for (let i = 0; i < 12; i++) { const b = new THREE.Group(), m = mat("#1b1820", { roughness: .9 }); part(b, "sph", m, .1, .08, .08, 0, 0, 0); for (const s of [-1, 1]) part(b, "cone", m, .03, .07, .03, .05, .07, s * .04);
      const [wl, wr] = wing(b, m, .32, .18); add(b, { kind: "bat", wl, wr, ph: i * 1.7, r: 5 + (i % 4) * 2.5, hh: 5 + (i % 3) * 1.5, sp: .35 + (i % 3) * .1, cx: 6 + (i * 7.3) % (WW - 12), cz: 14 + (i * 11.1) % (SH - 30) }); }
    return;
  }
  for (let i = 0; i < 2; i++) {   // eagles: big, gliding, very high
    const b = new THREE.Group(), m = mat("#5a3a22", { roughness: .8 }); b.scale.setScalar(2.2);
    part(b, "sph", m, .22, .12, .12, 0, 0, 0); part(b, "sph", "#f4f4f0", .09, .09, .09, .2, .03, 0); part(b, "cone", "#e8b631", .03, .08, .03, .29, .02, 0).rotation.z = -Math.PI / 2;
    part(b, "box", m, .14, .02, .2, -.22, 0, 0); const [wl, wr] = wing(b, m, .85, .26); add(b, { kind: "eagle", wl, wr, ph: i * 3, r: 26 + i * 9, hh: 20 + i * 5, sp: .05 + i * .02, dir: i ? 1 : -1 });
  }
  if (TROPICAL.has(sceneKey)) {
    const PAR = [["#d8322b", "#2f7fd6"], ["#7ac943", "#ffd23a"], ["#2f7fd6", "#ffd23a"], ["#ff9a3c", "#7ac943"]];
    PAR.forEach(([c1, c2], i) => {   // parrots: bright, long tails, circling low
      const b = new THREE.Group(), m = mat(c1, { roughness: .6 }); b.scale.setScalar(1.2);
      part(b, "sph", m, .15, .1, .1, 0, 0, 0); part(b, "sph", c2, .08, .08, .08, .14, .04, 0); part(b, "cone", "#2b2d33", .035, .07, .035, .22, .02, 0).rotation.z = -Math.PI / 2;
      part(b, "box", c2, .4, .02, .07, -.3, -.02, 0); const [wl, wr] = wing(b, m, .38, .16); add(b, { kind: "bird", wl, wr, ph: i * 1.6, r: 6 + i * 1.8, hh: 6 + i * .8, sp: .22 + i * .03, dir: i % 2 ? 1 : -1, off: [i * 1.5 - 2, 3] });
    });
    { const b = new THREE.Group(), m = mat("#111214", { roughness: .6 }); b.scale.setScalar(1.4);   // a toucan with an enormous beak
      part(b, "sph", m, .15, .1, .1, 0, 0, 0); part(b, "sph", "#f4f4f0", .06, .07, .07, .1, .02, 0); part(b, "sph", "#ff9a3c", .17, .06, .06, .3, .02, 0);
      const [wl, wr] = wing(b, m, .35, .16); add(b, { kind: "bird", wl, wr, ph: 5, r: 9, hh: 8, sp: .18, dir: 1, off: [3, -4] }); }
    for (let i = 0; i < 3; i++) {   // flamingos: pink, neck forward, legs trailing behind
      const b = new THREE.Group(), m = mat("#ff8fb8", { roughness: .7 }); b.scale.setScalar(1.6);
      part(b, "sph", m, .16, .09, .09, 0, 0, 0); part(b, "cyl", m, .02, .3, .02, .26, .02, 0).rotation.z = Math.PI / 2; part(b, "sph", m, .05, .05, .05, .42, .02, 0); part(b, "cone", "#2b2d33", .025, .07, .025, .48, 0, 0).rotation.z = -Math.PI / 2;
      part(b, "cyl", "#ff6f9f", .012, .4, .012, -.32, -.02, 0).rotation.z = Math.PI / 2;
      const [wl, wr] = wing(b, m, .5, .18); add(b, { kind: "bird", wl, wr, ph: 2 + i * 1.1, r: 14, hh: 11 + i * .6, sp: .1, dir: -1, off: [i * 2.2 - 2, i * 1.4] });
    }
  }
}
function faunaTick(tt) {
  if (!G3.fauna || G3.fauna.userData.key !== sceneKey || G3.fauna.userData.night !== !!scene.night) { buildFauna(); G3.fauna.userData.night = !!scene.night; }
  for (const b of G3.faunaList) {
    const u = b.userData;
    if (u.kind === "bat") {
      const a = tt * u.sp * 3 + u.ph; b.position.set(u.cx + Math.cos(a) * u.r + Math.sin(tt * 5 + u.ph) * .6, u.hh + Math.sin(tt * 3.3 + u.ph) * 1.2, u.cz + Math.sin(a * 1.3) * u.r);
      b.rotation.y = -a - Math.PI / 2; const f = Math.sin(tt * 22 + u.ph) * 1.1; u.wl.rotation.x = f; u.wr.rotation.x = -f; continue;
    }
    const a = (tt * u.sp + u.ph * .12) * (u.dir || 1), off = u.off || [0, 0];
    b.position.set(WW / 2 + Math.cos(a) * u.r + off[0], u.hh + Math.sin(tt * .6 + u.ph) * (u.kind === "eagle" ? 1.5 : .5), SH * .45 + Math.sin(a) * u.r * 1.2 + off[1]);
    b.rotation.y = -a - Math.PI / 2 * (u.dir || 1);
    if (u.kind === "eagle") { const f = .15 + Math.sin(tt * .8 + u.ph) * .08; u.wl.rotation.x = f; u.wr.rotation.x = -f; b.rotation.z = Math.sin(tt * .4 + u.ph) * .2; }   // gliding, barely a flap
    else { const f = Math.sin(tt * 10 + u.ph * 4) * .75; u.wl.rotation.x = f; u.wr.rotation.x = -f; }
  }
}
// ---------- cameos: something very random crosses the sky every half a minute or so ----------
const CAMEOS = {
  shark: { say: ["IS THAT A FLYING SHARK?!", "SHARKNADO!", "NOT AGAIN!", "WHY DOES IT HAVE WINGS?!"], h: [5, 9], dur: 9, build(g) {
    const m = mat("#8a96a3", { roughness: .5 }); part(g, "sph", m, 1.6, .5, .5, 0, 0, 0); part(g, "sph", "#e8eef4", 1.3, .3, .42, .1, -.18, 0);
    part(g, "cone", m, .2, .7, .1, -.1, .6, 0); const tail = pivot(g, -1.5, 0, 0); part(tail, "cone", m, .15, .7, .08, -.25, .3, 0).rotation.z = .6; part(tail, "cone", m, .12, .5, .07, -.2, -.25, 0).rotation.z = 2.4;
    for (const s of [-1, 1]) { const f = part(g, "box", m, .5, .04, .9, .2, -.1, s * .6); f.rotation.x = s * .4; }
    part(g, "box", "#f4f4f0", .05, .08, .5, 1.35, -.12, 0); toyEyes(g, 1.2, .15, .28, .09);
    g.userData.anim = (gg, q, tt) => { tail.rotation.y = Math.sin(tt * 8) * .5; gg.rotation.z = Math.sin(tt * 3) * .12; };
  } },
  toaster: { say: ["A FLYING TOASTER?!", "IS THAT A SCREENSAVER?", "MY BREAKFAST!"], h: [8, 12], dur: 11, build(g) {
    part(g, "box", "#c9ced4", .8, .6, .5, 0, 0, 0); part(g, "box", "#2b2d33", .5, .05, .1, 0, .31, .1); part(g, "box", "#2b2d33", .5, .05, .1, 0, .31, -.1);
    part(g, "box", "#d9a05a", .4, .25, .08, 0, .38, .1);
    const wl = pivot(g, 0, .1, -.26), wr = pivot(g, 0, .1, .26); part(wl, "box", "#f4f4f0", .5, .03, .7, 0, 0, -.35); part(wr, "box", "#f4f4f0", .5, .03, .7, 0, 0, .35);
    g.userData.anim = (gg, q, tt) => { const f = Math.sin(tt * 7) * .8; wl.rotation.x = f; wr.rotation.x = -f; };
  } },
  duck: { say: ["GIANT DUCK!", "IT'S SO BEAUTIFUL", "QUACK?"], h: [10, 14], dur: 18, build(g) {
    g.scale.setScalar(3); part(g, "sph", "#ffd23a", .7, .55, .55, 0, 0, 0); part(g, "sph", "#ffd23a", .4, .4, .4, .55, .55, 0); part(g, "cone", "#ff9a3c", .15, .35, .12, .98, .5, 0).rotation.z = -Math.PI / 2; toyEyes(g, .8, .7, .22, .08);
    part(g, "cyl", "#f4f4f0", .01, 3, .01, 0, -1.9, 0);
    g.userData.anim = (gg, q, tt) => { gg.rotation.z = Math.sin(tt * 1.2) * .1; gg.rotation.x = Math.sin(tt * .9) * .08; };
  } },
  cow: { say: ["IT'S RAINING... A COW", "MOOOO?!", "THAT COW HAS A PARACHUTE!"], h: [9, 13], dur: 13, fall: true, build(g) {
    part(g, "sph", "#f4f4f0", .7, .4, .35, 0, 0, 0); part(g, "sph", "#111214", .25, .2, .2, .1, .15, .2); part(g, "sph", "#f4f4f0", .25, .22, .2, .65, .15, 0); part(g, "sph", "#ffb3c1", .12, .1, .14, .85, .08, 0);
    for (const [x, z] of [[.4, .2], [.4, -.2], [-.4, .2], [-.4, -.2]]) part(g, "cyl", "#f4f4f0", .07, .4, .07, x, -.4, z);
    part(g, "sph", "#d8322b", 1.6, .6, 1.6, 0, 2.6, 0); for (const [x, z] of [[1.2, 0], [-1.2, 0], [0, 1.2], [0, -1.2]]) part(g, "cyl", "#f4f4f0", .01, 2.4, .01, x * .5, 1.3, z * .5);
    g.userData.anim = (gg, q, tt) => { gg.rotation.z = Math.sin(tt * 1.5) * .25; };
  } },
  witch: { say: ["IS THAT A WITCH?!", "SHE'S LATE FOR SOMETHING", "NICE BROOM!"], h: [7, 11], dur: 8, build(g) {
    part(g, "cyl", "#8a6a44", .05, 2, .05, 0, 0, 0).rotation.z = Math.PI / 2; part(g, "cone", "#c8a060", .25, .5, .25, -1.1, 0, 0).rotation.z = Math.PI / 2;
    part(g, "sph", "#2b2d33", .25, .35, .25, 0, .4, 0); part(g, "sph", "#7ac943", .18, .18, .18, .1, .85, 0); part(g, "cone", "#2b2d33", .25, .5, .25, .05, 1.15, 0); part(g, "cyl", "#2b2d33", .4, .03, .4, .05, .95, 0);
    g.userData.anim = (gg, q, tt) => { gg.position.y += Math.sin(tt * 4) * .2; };
  } },
  burger: { say: ["A BURGER BALLOON!", "I'M SO HUNGRY", "FREE BURGERS?"], h: [12, 16], dur: 20, build(g) {
    g.scale.setScalar(2); part(g, "sph", "#d99a4a", 1, .55, 1, 0, .5, 0); part(g, "cyl", "#5a3a22", 1, .3, 1, 0, 0, 0); part(g, "cyl", "#7ac943", 1.05, .08, 1.05, 0, .17, 0); part(g, "cyl", "#ffd23a", 1.02, .06, 1.02, 0, -.17, 0); part(g, "cyl", "#d99a4a", 1, .2, 1, 0, -.3, 0);
    part(g, "box", "#8a6a44", .5, .4, .5, 0, -1.6, 0); for (const [x, z] of [[.4, .4], [-.4, .4], [.4, -.4], [-.4, -.4]]) part(g, "cyl", "#f4f4f0", .01, 1.2, .01, x * .6, -.9, z * .6);
  } },
  ptero: { say: ["PTERODACTYL!", "WHAT YEAR IS IT?!", "RUN!!"], h: [8, 12], dur: 7, build(g) {
    g.scale.setScalar(2); const m = mat("#7a8f6a", { roughness: .7 }); part(g, "sph", m, .4, .15, .15, 0, 0, 0); part(g, "cone", m, .08, .5, .08, .55, .05, 0).rotation.z = -Math.PI / 2; part(g, "cone", m, .06, .35, .06, .25, .2, 0).rotation.z = 2.2;
    const wl = pivot(g, 0, 0, -.1), wr = pivot(g, 0, 0, .1); part(wl, "cone", m, .4, 1.4, .02, 0, 0, -.7).rotation.x = Math.PI / 2; part(wr, "cone", m, .4, 1.4, .02, 0, 0, .7).rotation.x = -Math.PI / 2;
    g.userData.anim = (gg, q, tt) => { const f = Math.sin(tt * 5) * .6; wl.rotation.x = f; wr.rotation.x = -f; };
  } },
  whale: { say: ["IS THAT A WHALE?!", "THE WHALE IS FLYING", "I SHOULD SIT DOWN"], h: [16, 20], dur: 24, build(g) {
    g.scale.setScalar(3.2); const m = mat("#3a5a8a", { roughness: .6 }); part(g, "sph", m, 2, .8, .8, 0, 0, 0); part(g, "sph", "#d8dde2", 1.6, .4, .6, .2, -.35, 0);
    const tail = pivot(g, -1.9, 0, 0); part(tail, "box", m, .5, .06, 1.4, -.3, 0, 0); toyEyes(g, 1.4, .1, .55, .12);
    g.userData.anim = (gg, q, tt) => { tail.rotation.z = Math.sin(tt * 1.4) * .35; gg.rotation.z = Math.sin(tt * .5) * .05; };
  } },
  sofa: { say: ["A FLYING SOFA?!", "IS HE READING?!", "THAT'S MY COUCH!"], h: [8, 12], dur: 12, build(g) {
    part(g, "box", "#a98bff", 1.8, .4, .8, 0, 0, 0); part(g, "box", "#8a6be0", 1.8, .7, .2, 0, .45, -.3); for (const s of [-1, 1]) part(g, "box", "#8a6be0", .2, .5, .8, s * .9, .25, 0);
    part(g, "sph", "#2f7fd6", .22, .3, .22, 0, .5, 0); part(g, "sph", "#e0ac84", .17, .17, .17, 0, .95, .05); part(g, "box", "#f4f4f0", .5, .4, .02, 0, .75, .3);
    g.userData.anim = (gg, q, tt) => { gg.rotation.x = Math.sin(tt * 1.3) * .08; };
  } },
  planes: { say: ["PAPER PLANES!", "WHO FOLDED THOSE?", "INCOMING!"], h: [6, 9], dur: 9, build(g) {
    for (let k = 0; k < 6; k++) { const p = pivot(g, -k * 1.2, (k % 2) * .4, (k - 2.5) * 1.1); part(p, "cone", "#f4f4f0", .25, .9, .05, 0, 0, 0).rotation.z = -Math.PI / 2; }
    g.userData.anim = (gg, q, tt) => { gg.children.forEach((c, i) => { c.position.y = (i % 2) * .4 + Math.sin(tt * 3 + i) * .25; }); };
  } },
  vducks: { say: ["DUCKS!", "THEY'RE HEADING SOUTH", "V FOR VENUE!"], h: [12, 15], dur: 14, build(g) {
    for (let k = 0; k < 7; k++) { const s = k % 2 ? 1 : -1, d = Math.ceil(k / 2), p = pivot(g, -d * 1.4, 0, s * d * 1.2), m = mat("#8a6a44", { roughness: .8 });
      part(p, "sph", m, .2, .12, .12, 0, 0, 0); part(p, "sph", "#2f8a4a", .09, .09, .09, .2, .05, 0); part(p, "cone", "#ffd23a", .03, .08, .03, .29, .04, 0).rotation.z = -Math.PI / 2;
      const wl = pivot(p, 0, 0, -.06), wr = pivot(p, 0, 0, .06); part(wl, "box", m, .2, .02, .5, 0, 0, -.25); part(wr, "box", m, .2, .02, .5, 0, 0, .25); p.userData = { wl, wr, ph: k }; }
    g.userData.anim = (gg, q, tt) => { gg.children.forEach(c => { if (c.userData.wl) { const f = Math.sin(tt * 9 + c.userData.ph) * .7; c.userData.wl.rotation.x = f; c.userData.wr.rotation.x = -f; } }); };
  } },
};
const CAMEO = { t: 12, live: [] };
function cameoTick(tt, dt) {
  CAMEO.t -= dt;
  const show = phase === "show" || phase === "evac" || phase === "plan";
  if (CAMEO.t <= 0 && show && CAMEO.live.length < 2) {
    const cruise = sceneKey === "crucero";
    CAMEO.t = (cruise ? 10 : 20) + Math.random() * (cruise ? 12 : 25);
    const keys = Object.keys(CAMEOS).filter(k => !(k === "vducks" && scene.night)), kind = cruise && Math.random() < .55 ? "shark" : keys[(Math.random() * keys.length) | 0];
    spawnCameo(kind);
  }
  for (const c of CAMEO.live) {
    c.age += dt; const q = c.age / c.dur, g = c.g;
    g.position.set(c.x0 + (c.x1 - c.x0) * q, c.fall ? c.h * (1 - q * .7) : c.h + Math.sin(q * Math.PI) * .8, c.z0 + (c.z1 - c.z0) * q);
    if (g.userData.anim) g.userData.anim(g, q, tt);
    if (!c.said && c.age > 1.6 && (phase === "show" || phase === "evac") && !demo && typeof crowdPoint === "function" && ag.length) { c.said = 1; const [x, y] = crowdPoint(), s = CAMEOS[c.kind].say; pop(x, y - 1, s[(Math.random() * s.length) | 0]); }
  }
  CAMEO.live = CAMEO.live.filter(c => { if (c.age < c.dur) return true; G3.scene.remove(c.g); return false; });
}
function spawnCameo(kind) {
  const C = CAMEOS[kind]; if (!C) return; const g = new THREE.Group(); C.build(g); g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  const leftToRight = Math.random() < .5, z0 = rnd(8, SH - 12), z1 = clamp(z0 + rnd(-14, 14), 4, SH - 4), h = rnd(C.h[0], C.h[1]) * (kind === "shark" && sceneKey === "crucero" ? .7 : 1);
  const x0 = leftToRight ? -30 : WW + 30, x1 = leftToRight ? WW + 30 : -30;
  g.rotation.y = -Math.atan2(z1 - z0, x1 - x0); G3.scene.add(g);
  CAMEO.live.push({ kind, g, age: 0, dur: C.dur * (.85 + Math.random() * .3), x0, x1, z0, z1, h, fall: C.fall });
}
function clearCameos() { for (const c of CAMEO.live) G3.scene.remove(c.g); CAMEO.live = []; CAMEO.t = 8 + Math.random() * 10; }
