// Human Tsunami · 3D models of characters and objects for the comedy venues
// They all face +x and are built from simple parts (spheres, cylinders and boxes).

// ---------- people with style ----------
// body: clothes, legs: pants, skin, hat: hat type, extra(g, u, bodyG): accessories
const PERSONS = {
  abuela: { body: "#8a4fbf", legs: "#5d3a7a", hat: "bun", hatCol: "#d9d9d9", scale: .9,
    extra(g, u, b) { for (const s of [-1, 1]) part(b, "box", s > 0 ? "#ff6fb1" : "#ffd23a", .25, .3, .1, .05, .95, s * .38); part(b, "sph", "#c9ced6", .05, .05, .05, .16, 1.68, .07); } },
  suegra: { body: "#2b2f35", legs: "#2b2f35", hat: "bun", hatCol: "#3b2a20", extra(g, u, b) { part(b, "box", "#d8322b", .22, .25, .12, .1, 1.0, .35); } },
  mariachi: { body: "#151617", legs: "#151617", hat: "sombrero", hatCol: "#151617",
    extra(g, u, b, m) {
      for (let y = 1.0; y < 1.35; y += .12) part(b, "sph", "#e3b23c", .03, .03, .03, .2, y, .1);
      const inst = m.inst || "guitar";
      if (inst === "guitar") { part(b, "sph", "#c7883a", .22, .08, .28, .3, 1.05, .1); part(b, "box", "#5a3b1f", .5, .04, .06, .55, 1.15, .1); }
      else if (inst === "trumpet") { const t = part(b, "cyl", "#e3b23c", .05, .5, .05, .45, 1.55, .12); t.rotation.z = -Math.PI / 2; part(b, "cone", "#e3b23c", .1, .14, .1, .72, 1.55, .12).rotation.z = -Math.PI / 2; }
      else part(b, "box", "#7a4a22", .55, .08, .16, .3, 1.35, .25);
    } },
  plumber: { body: "#2f6fc4", legs: "#2f6fc4", hat: "cap", hatCol: "#d8322b",
    extra(g, u, b) { part(b, "sph", "#3b2a20", .12, .04, .16, .14, 1.58, 0); const p = part(b, "cyl", "#7a4a22", .03, .8, .03, .35, 1.0, .25); p.rotation.z = -.4; part(b, "sph", "#d8322b", .14, .09, .14, .5, .65, .25); } },
  mayor: { body: "#2b2f35", legs: "#2b2f35", hat: "none",
    extra(g, u, b) { part(b, "box", "#d8322b", .04, .4, .12, .19, 1.15, 0); part(b, "box", "#e3b23c", .05, .4, .5, .2, 1.25, 0); for (const s of [-1, 1]) { const bl = part(b, "box", "#c9ced6", 1.1, .05, .12, .9, 1.3, s * .1); bl.rotation.y = s * .25; } part(b, "sph", "#e3b23c", .12, .12, .12, .35, 1.3, 0); } },
  mib: { body: "#151617", legs: "#151617", hat: "none",
    extra(g, u, b) { part(b, "box", "#0a0a0a", .06, .05, .26, .14, 1.67, 0); part(b, "box", "#ffffff", .05, .3, .08, .19, 1.2, 0); } },
  bodyguard: { body: "#151617", legs: "#151617", hat: "none", scale: 1.15, extra(g, u, b) { part(b, "box", "#0a0a0a", .06, .05, .26, .14, 1.67, 0); } },
  idol: { body: "#f4f4f2", legs: "#f4f4f2", hat: "hair", hatCol: "#ff6fb1",
    extra(g, u, b) { part(b, "box", "#0a0a0a", .06, .06, .26, .14, 1.67, 0); for (let i = 0; i < 6; i++) part(b, "sph", basic("#ffe48a"), .035, .035, .035, .2, .95 + i * .09, (i % 2 - .5) * .2); } },
  bride: { body: "#ffffff", legs: "#ffffff", hat: "veil", hatCol: "#ffffff", dress: true,
    extra(g, u, b) { part(b, "sph", "#ff8fc6", .12, .12, .12, .3, 1.2, .2); } },
  groom: { body: "#1c1c1c", legs: "#1c1c1c", hat: "none", extra(g, u, b) { part(b, "box", "#ffffff", .05, .3, .1, .19, 1.25, 0); part(b, "box", "#d8322b", .05, .06, .14, .2, 1.4, 0); } },
  taquero: { body: "#f4f4f2", legs: "#2b3a55", hat: "chef", hatCol: "#ffffff", extra(g, u, b) { part(b, "box", "#d8322b", .05, .5, .32, .19, 1.0, 0); } },
  tio: { body: "#ff7a3c", legs: "#c9b28a", hat: "none", scale: 1.05,
    extra(g, u, b) {
      part(b, "sph", "#ff7a3c", .26, .28, .28, .06, 1.0, 0);  // the belly
      for (const [y, z] of [[1.28, .12], [1.08, -.12], [1.2, -.2], [.98, .16], [1.35, -.05]]) part(b, "sph", "#ffe48a", .06, .06, .04, .24, y, z);
      part(b, "box", "#0a0a0a", .06, .05, .26, .14, 1.67, 0);  // sunglasses
      part(b, "cyl", "#2f8f3a", .05, .24, .05, .3, 1.05, .32); part(b, "cyl", "#e8e2d0", .03, .05, .03, .3, 1.2, .32);
    } },
  luchador: { body: "#d39a6a", legs: "#2b2f35", hat: "none", scale: 1.12,
    extra(g, u, b, m) {
      const c = m.col || "#d8322b";
      part(b, "sph", c, .165, .17, .165, .02, 1.66, 0);  // the mask
      for (const s of [-1, 1]) { part(b, "sph", "#ffffff", .05, .035, .045, .15, 1.69, s * .065); part(b, "sph", "#111214", .02, .02, .02, .19, 1.69, s * .065); }
      part(b, "box", c, .36, .2, .4, 0, .84, 0);  // wrestling trunks
      if (m.rudo) part(b, "box", "#6b1a8a", .06, .85, .52, -.24, 1.0, 0);  // villain's cape
    } },
  referi: { body: "#f4f4f2", legs: "#151617", hat: "none",
    extra(g, u, b) { for (let y = .92; y < 1.42; y += .13) part(b, "box", "#151617", .4, .05, .52, 0, y, 0); part(b, "box", "#151617", .05, .06, .16, .21, 1.45, 0); } },
  balloonman: { body: "#3d9a5b", legs: "#2b3a55", hat: "cap", hatCol: "#d8322b",
    extra(g, u, b) {
      // a bunch of balloons on long strings, bobbing above the crowd
      const cols = ["#ff4d6d", "#ffd23a", "#4fd8ff", "#7dff6a", "#c77dff", "#ff9a3c", "#ffffff"];
      const bunch = pivot(g, .2, 0, .3); u.bunch = bunch;
      cols.forEach((c, i) => {
        const a = i / cols.length * 6.283, x = Math.cos(a) * .32, z = Math.sin(a) * .32, y = 2.75 + (i % 3) * .18;
        part(bunch, "cyl", "#dddddd", .008, y - 1.3, .008, x * .5, (y + 1.3) / 2, z * .5);
        part(bunch, "sph", mat(c, { roughness: .25, metalness: .1 }), .22, .26, .22, x, y, z);
      });
      u.anim = tt => { bunch.rotation.y = Math.sin(tt * .9) * .4; bunch.rotation.z = Math.sin(tt * 1.3) * .06; };
    } },
  hotdog: { body: "#f4f4f2", legs: "#2b2f35", hat: "chef", hatCol: "#ffffff",
    extra(g, u, b) {
      part(g, "box", "#d8322b", .9, .55, .7, .85, .75, 0); part(g, "box", "#f4f4f2", .92, .1, .72, .85, 1.07, 0);
      for (const s of [-1, 1]) { const w = part(g, "cyl", "#151617", .16, .08, .16, .85, .16, s * .38); w.rotation.x = Math.PI / 2; }
      part(g, "cyl", "#2b2f35", .02, 1.1, .02, .85, 1.6, 0); const um = part(g, "cone", "#ffd23a", .75, .3, .75, .85, 2.2, 0);
      part(g, "sph", "#c7883a", .32, .07, .08, .7, 1.16, .15); part(g, "sph", "#d8322b", .28, .05, .05, .7, 1.2, .15);
    } },
  photographer: { body: "#4a4d55", legs: "#2b2f35", hat: "cap", hatCol: "#151617",
    extra(g, u, b) { part(b, "box", "#151617", .16, .14, .2, .22, 1.62, 0); part(b, "cyl", "#2b2f35", .06, .14, .06, .32, 1.62, 0).rotation.z = Math.PI / 2; part(b, "box", "#e3b23c", .06, .2, .12, -.02, 1.1, .3); } },
  mime: { body: "#f4f4f2", legs: "#151617", hat: "none", skin: "#ffffff",
    extra(g, u, b) {
      for (let y = .98; y < 1.4; y += .12) part(b, "box", "#151617", .4, .045, .52, 0, y, 0);
      part(b, "cyl", "#151617", .17, .06, .17, -.01, 1.78, 0); part(b, "cyl", "#151617", .1, .12, .1, -.01, 1.86, 0);
      part(b, "box", "#d8322b", .04, .12, .2, .19, 1.42, 0);
    } },
  selfie: { body: "#ff6fb1", legs: "#2f6fc4", hat: "hair", hatCol: "#ffd23a",
    extra(g, u, b) { const st = part(b, "cyl", "#2b2f35", .015, 1.1, .015, .45, 2.0, .2); st.rotation.z = -.6; part(b, "box", basic("#cfe8ff"), .04, .16, .09, .78, 2.45, .2); } },
  shopper: { body: "#3d9a5b", legs: "#2b3a55", hat: "cap", hatCol: "#e8b631", extra(g, u, b) { for (const s of [-1, 1]) part(b, "box", "#ffffff", .3, .35, .12, .02, .9, s * .4); } },
};
function personModel(g, u, P, m) {
  const sc = P.scale || 1, root = pivot(g, 0, 0, 0); root.scale.setScalar(sc);
  const b = pivot(root, 0, 0, 0); u.body = b;
  if (P.dress) { part(b, "cone", P.body, .55, 1.3, .55, 0, .65, 0); }
  else for (const s of [-1, 1]) u.legs.push(leg(b, 0, .8, s * .1, .06, .8, P.legs));
  part(b, "sph", P.body, .2, .38, .26, 0, 1.15, 0);
  part(b, "sph", P.skin || "#e0ac84", .15, .15, .15, .02, 1.65, 0);
  const hc = P.hatCol || "#2b1d14";
  if (P.hat === "sombrero") { part(b, "cyl", hc, .55, .04, .55, 0, 1.76, 0); part(b, "cyl", hc, .17, .25, .17, 0, 1.88, 0); part(b, "cyl", "#e3b23c", .56, .02, .56, 0, 1.79, 0); }
  else if (P.hat === "cap") { part(b, "cyl", hc, .15, .09, .15, .01, 1.76, 0); part(b, "box", hc, .16, .02, .22, .13, 1.73, 0); }
  else if (P.hat === "bun") { part(b, "sph", hc, .16, .12, .16, -.02, 1.72, 0); part(b, "sph", hc, .09, .09, .09, -.1, 1.84, 0); }
  else if (P.hat === "chef") { part(b, "cyl", hc, .14, .3, .14, 0, 1.88, 0); part(b, "sph", hc, .19, .12, .19, 0, 2.05, 0); }
  else if (P.hat === "veil") { part(b, "sph", hc, .17, .14, .17, -.02, 1.7, 0); part(b, "cone", mat("#ffffff", { transparent: true, opacity: .6 }), .35, 1.1, .35, -.25, 1.25, 0); }
  else if (P.hat === "hair") { part(b, "sph", hc, .17, .13, .17, -.02, 1.72, 0); }
  else part(b, "sph", "#2b1d14", .15, .1, .15, -.02, 1.71, 0);
  u.arms = [-1, 1].map(s => { const p = pivot(b, 0, 1.4, s * .25); part(p, "cyl", P.body, .05, .6, .05, 0, -.3, 0); return p; });
  if (P.extra) P.extra(g, u, b, m);
}

// ---------- animals and objects ----------
const EXTRA_MODELS = {
  chair(g, u, m) {
    const metal = mat("#9aa0a8", { metalness: .7, roughness: .35 });
    part(g, "box", metal, .5, .05, .5, 0, .5, 0); part(g, "box", metal, .05, .55, .5, -.25, .8, 0);
    for (const [x, z] of [[.22, .22], [.22, -.22], [-.22, .22], [-.22, -.22]]) part(g, "cyl", metal, .025, .5, .025, x, .25, z);
  },
  mask(g, u, m) {
    const c = m.col || "#d8322b";
    part(g, "sph", c, .28, .34, .12, 0, .3, 0);
    for (const s of [-1, 1]) part(g, "sph", "#ffffff", .08, .06, .05, .06, .36, s * .1);
  },
  cow(g, u, m) {
    part(g, "sph", "#f4f4f2", 1.0, .55, .5, 0, 1.15, 0);
    for (const [x, z] of [[.3, .3], [-.4, -.35], [-.1, .45]]) part(g, "sph", "#151617", .32, .3, .1, x, 1.3, z);
    part(g, "sph", "#f4f4f2", .32, .3, .28, 1.05, 1.35, 0); part(g, "sph", "#ffb3c6", .18, .14, .2, 1.32, 1.25, 0);
    for (const s of [-1, 1]) part(g, "cone", "#e8e2d0", .05, .2, .05, 1.0, 1.65, s * .18);
    for (const [x, z] of [[.6, .25], [.6, -.25], [-.6, .25], [-.6, -.25]]) u.legs.push(leg(g, x, .85, z, .09, .85, "#f4f4f2"));
    u.tail = pivot(g, -1, 1.3, 0); part(u.tail, "cyl", "#151617", .03, .7, .03, 0, -.35, 0);
    if (m.float) u.anim = (tt) => { g.rotation.z = Math.sin(tt * 1.3) * .5; };
  },
  alien(g, u) {
    for (const s of [-1, 1]) u.legs.push(leg(g, 0, .45, s * .08, .05, .45, "#7dff6a"));
    part(g, "sph", "#7dff6a", .15, .3, .18, 0, .7, 0);
    part(g, "sph", "#7dff6a", .32, .28, .32, .03, 1.2, 0);
    for (const s of [-1, 1]) part(g, "sph", "#0a0a0a", .07, .12, .1, .27, 1.22, s * .13);
    for (const s of [-1, 1]) { part(g, "cyl", "#7dff6a", .015, .3, .015, 0, 1.55, s * .12); part(g, "sph", basic("#fff04f"), .05, .05, .05, 0, 1.72, s * .12); }
    u.arms = [-1, 1].map(s => { const p = pivot(g, 0, .9, s * .17); part(p, "cyl", "#7dff6a", .03, .4, .03, 0, -.2, 0); return p; });
    u.anim = (tt) => { u.arms[1].rotation.z = 2.5 + Math.sin(tt * 8) * .4; };
  },
  ufo(g, u, m) {
    const disc = part(g, "sph", mat("#c9ced6", { metalness: .8, roughness: .25 }), 3.2, .55, 3.2, 0, 0, 0);
    part(g, "sph", mat("#7fe0ff", { transparent: true, opacity: .7, roughness: .1 }), 1.3, .9, 1.3, 0, .45, 0);
    u.lights = Array.from({ length: 10 }, (_, i) => { const a = i / 10 * 6.283; return part(g, "sph", basic("#7dff6a"), .16, .16, .16, Math.cos(a) * 2.9, -.05, Math.sin(a) * 2.9); });
    u.beam = new THREE.Mesh(new THREE.CylinderGeometry(.5, m.abduct || 2.2, 8, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0x9dff8a, transparent: true, opacity: .22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
    u.beam.position.y = -4; g.add(u.beam);
    u.anim = (tt, mm) => { disc.rotation.y = tt * 1.5; u.lights.forEach((l, i) => l.visible = (Math.floor(tt * 6) + i) % 3 === 0); u.beam.visible = !!mm.beamOn; g.position.y += Math.sin(tt * 2) * .3; };
  },
  cart(g, u) {
    const wire = mat("#c9ced6", { metalness: .7, roughness: .3, wireframe: true });
    part(g, "box", wire, 1, .6, .65, 0, .75, 0);
    part(g, "box", "#d8322b", .08, .5, .65, -.55, 1.0, 0);
    for (const [x, z] of [[.4, .28], [-.4, .28], [.4, -.28], [-.4, -.28]]) part(g, "sph", "#151617", .09, .09, .09, x, .1, z);
    part(g, "box", "#ffd23a", .5, .35, .4, 0, .85, 0);
  },
  tubeman(g, u, m) {
    const col = m.col || "#ff3b2f"; u.segs = [];
    let parent = g;
    for (let i = 0; i < 6; i++) { const p = pivot(parent, 0, i ? .55 : .3, 0); part(p, "cyl", col, .28, .6, .28, 0, .3, 0); u.segs.push(p); parent = p; }
    part(parent, "sph", col, .32, .32, .32, 0, .7, 0);
    for (const s of [-1, 1]) part(parent, "sph", "#ffffff", .1, .1, .1, .25, .78, s * .12);
    u.anim = (tt) => { u.segs.forEach((p, i) => { p.rotation.z = Math.sin(tt * 4 + i * .9) * .35; p.rotation.x = Math.cos(tt * 3.1 + i) * .25; }); };
  },
  scrubber(g, u) {
    part(g, "box", "#2f7fd6", 1.4, .7, .9, 0, .5, 0); part(g, "cyl", "#ffd23a", .5, .1, .5, .6, .1, 0);
    part(g, "box", "#151617", .1, .9, .5, -.7, 1.1, 0);
    part(g, "cone", "#ffd23a", .25, .6, .25, -1.1, .3, .7);
  },
  cake(g, u, m) {
    const r = m.r || 1.2; u.ball = pivot(g, 0, r * .9, 0);
    for (const [y, s] of [[-.5, 1], [0, .75], [.45, .5]]) { part(u.ball, "cyl", "#fbf4ee", r * s, r * .45, r * s, 0, y * r, 0); part(u.ball, "cyl", "#ff8fc6", r * s * 1.02, r * .07, r * s * 1.02, 0, y * r + r * .22, 0); }
    part(u.ball, "sph", "#d8322b", r * .14, r * .14, r * .14, 0, r * .85, 0);
  },
  drone(g, u) {
    part(g, "box", "#2b2f35", .5, .14, .5, 0, 0, 0); part(g, "sph", "#151617", .1, .1, .1, .25, -.05, 0);
    u.props = [[.45, .45], [-.45, .45], [.45, -.45], [-.45, -.45]].map(([x, z]) => { part(g, "cyl", "#2b2f35", .03, .1, .03, x, .08, z); return part(g, "box", mat("#9aa0a8", { transparent: true, opacity: .6 }), .5, .01, .06, x, .14, z); });
    part(g, "sph", basic("#ff3b2f"), .04, .04, .04, -.2, .08, 0);
    u.anim = (tt) => { u.props.forEach((p, i) => p.rotation.y = tt * 40 + i); };
  },
  bouquet(g) { part(g, "cone", "#3d9a5b", .12, .35, .12, 0, -.1, 0); for (let i = 0; i < 7; i++) part(g, "sph", ["#ff8fc6", "#ffffff", "#ffd23a"][i % 3], .1, .1, .1, Math.cos(i) * .12, .12, Math.sin(i) * .12); },
  egg(g) { part(g, "sph", "#fbf4e4", .12, .16, .12, 0, 0, 0); },
  chile(g) { const c = part(g, "cone", "#d8322b", .12, .45, .12, 0, 0, 0); c.rotation.z = -Math.PI / 2; part(g, "cyl", "#3d9a5b", .03, .12, .03, -.25, 0, 0); },
  roll(g, u, m) {
    u.ball = pivot(g, 0, .35, 0);
    const r = part(u.ball, "cyl", "#ffffff", .3, .45, .3, 0, 0, 0); r.rotation.x = Math.PI / 2;
    const c = part(u.ball, "cyl", "#c9a77a", .1, .47, .1, 0, 0, 0); c.rotation.x = Math.PI / 2;
  },
  suitcase(g, u, m) {
    u.ball = pivot(g, 0, .4, 0);
    part(u.ball, "box", m.col || "#d8322b", .75, .55, .3, 0, 0, 0); part(u.ball, "box", "#151617", .2, .08, .06, 0, .32, 0);
    for (const s of [-1, 1]) part(u.ball, "box", "#ffffff", .05, .56, .31, s * .2, 0, 0);
  },
  bus(g) {
    part(g, "box", "#e8b631", 8, 2.6, 2.4, 0, 1.6, 0);
    part(g, "box", mat("#1d2733", { roughness: .2 }), 7.6, .8, 2.42, -.1, 2.2, 0);
    part(g, "box", "#ffffff", 8.02, .3, 2.42, 0, 1.2, 0);
    for (const x of [-2.8, 2.6]) for (const s of [-1, 1]) { const w = part(g, "cyl", "#151617", .5, .3, .5, x, .5, s * 1.2); w.rotation.x = Math.PI / 2; }
    part(g, "box", "#f4f4f2", .1, 2.6, 2.4, 4, 1.6, 0);
  },
  truck(g, u, m) {
    part(g, "box", m.col || "#ff6a3c", 5, 2.4, 2.3, 0, 1.6, 0);
    part(g, "box", "#2b2f35", 3, .1, .1, -.3, 2.2, 1.16);
    part(g, "box", "#ffd23a", 3.2, .5, .15, -.3, 2.9, 1.2);
    part(g, "box", "#ff6a3c", 1.4, 1.6, 2.2, 3, 1.2, 0);
    for (const x of [-1.6, 2.6]) for (const s of [-1, 1]) { const w = part(g, "cyl", "#151617", .45, .3, .45, x, .45, s * 1.15); w.rotation.x = Math.PI / 2; }
  },
  tacocart(g, u) {
    part(g, "box", "#3d9a5b", 1.6, .9, .9, 0, .7, 0); part(g, "box", "#d8322b", 1.62, .2, .92, 0, 1.2, 0);
    part(g, "cyl", "#e8e2d0", .03, 1.5, .03, 0, 1.9, 0);
    const umb = part(g, "cone", "#ffd23a", 1.1, .4, 1.1, 0, 2.7, 0);
    for (const s of [-1, 1]) { const w = part(g, "cyl", "#151617", .25, .1, .25, -.5, .25, s * .45); w.rotation.x = Math.PI / 2; }
    personModel(pivot(g, -1.1, 0, 0), u, PERSONS.taquero, {});
    u.umb = umb; u.anim = (tt) => { u.umb.rotation.y = tt; };
  },
  duckmascot(g, u) {
    part(g, "sph", "#ffd23a", .7, .85, .7, 0, 1.0, 0);
    const h = u.head = pivot(g, .05, 2.0, 0);
    part(h, "sph", "#ffd23a", .5, .48, .5, 0, 0, 0);
    part(h, "sph", "#ff9a3c", .32, .1, .3, .45, -.08, 0);
    for (const s of [-1, 1]) { part(h, "sph", "#ffffff", .13, .13, .13, .36, .12, s * .18); part(h, "sph", "#111214", .06, .06, .06, .48, .12, s * .18); }
    part(h, "box", "#2f6fc4", .5, .14, .55, 0, .38, 0);
    u.arms = [-1, 1].map(s => { const p = pivot(g, 0, 1.45, s * .68); part(p, "sph", "#ffd23a", .15, .45, .25, 0, -.3, 0); return p; });
    for (const s of [-1, 1]) u.legs.push(leg(g, 0, .5, s * .28, .1, .5, "#ff9a3c"));
  },
  aircart(g, u) {
    part(g, "box", "#f4f4f2", 2.4, .6, 1.2, 0, .6, 0); part(g, "box", "#2f6fc4", 2.42, .12, 1.22, 0, .95, 0);
    for (const [x, z] of [[.9, .65], [-.9, .65], [.9, -.65], [-.9, -.65]]) { const w = part(g, "cyl", "#151617", .25, .2, .25, x, .25, z); w.rotation.x = Math.PI / 2; }
    for (const x of [.8, -.8]) part(g, "cyl", "#9aa0a8", .03, 1, .03, x, 1.4, 0);
    part(g, "box", "#f4f4f2", 2, .06, 1.2, 0, 1.9, 0);
    u.siren = [part(g, "box", basic("#ffd23a"), .15, .12, .3, .4, 1.96, 0), part(g, "box", basic("#ff9a3c"), .15, .12, .3, -.4, 1.96, 0)];
  },
};
