// Human Tsunami · scene: The Stadium (night, concert on the pitch)
// ---------- stadium dressing (visual only) ----------
const ESTADIO = { tex: {}, fx: [] };
SCENE_MODELS.estadio_fx = (g, u) => { u.anim = tt => { for (const f of ESTADIO.fx) f(tt); }; };   // invisible: drives flags, LED wall, ad boards
const ESTADIO_FONT = { T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"], S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"], N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"], M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  I: ["111", "010", "010", "010", "010", "010", "111"], H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"] };
// one painted texture per stand: 16 rows of seats (2 per tier), a red/white seat mosaic with a pixel word and waves, some fans
function ESTADIO_seatTex(key, len, word, centre) {
  if (ESTADIO.tex[key]) return ESTADIO.tex[key];
  const cols = Math.round(len * 2), SW = 8, RH = 16, c = document.createElement("canvas"); c.width = cols * SW; c.height = 16 * RH;
  const g = c.getContext("2d"), rand = rng(key.length * 7 + 3), bits = [];
  for (let r = 0; r < 7; r++) bits.push(word.split("").map(ch => ESTADIO_FONT[ch][r]).join("0"));
  const wpx = bits[0].length, start = Math.round(centre * 2 - wpx), shirts = ["#e2362e", "#ffffff", "#e2362e", "#1f4fa8", "#ffd23a", "#2b2f35", "#f4f4f0"], skin = ["#f1c9a5", "#d9a074", "#8d5a3b", "#f6d7bd"];
  g.fillStyle = "#2a2d34"; g.fillRect(0, 0, c.width, c.height);
  for (let r = 0; r < 16; r++) {            // r = 0 is the top row at the back
    g.fillStyle = "#3b3f48"; g.fillRect(0, r * RH + RH - 3, c.width, 3);                     // step edge
    for (let x = 0; x < cols; x++) {
      const px = Math.floor((x - start) / 2), py = (r - 1) >> 1, inWord = px >= -2 && px < wpx + 2;
      if (!inWord && x % 18 === 9) { g.fillStyle = "#ffd23a"; g.fillRect(x * SW + 1, r * RH + RH - 3, SW - 2, 2); continue; }   // stairway
      let col = "#d8322b";
      if (r === 15) col = "#1f4fa8"; else if (r === 0) col = "#f4f4f0";
      else if (inWord) { if (r >= 1 && r <= 14 && px >= 0 && px < wpx && bits[py][px] === "1") col = "#f7f7f2"; }
      else if (Math.abs(r - (7.5 + 4.5 * Math.sin(x * .17))) < 1.6) col = "#f7f7f2";
      else if (Math.abs(r - (7.5 + 4.5 * Math.sin(x * .17 + 1.1))) < .8) col = "#ffd23a";
      g.fillStyle = col; g.fillRect(x * SW + 1, r * RH + 2, SW - 2, RH - 6);
      g.fillStyle = "rgba(0,0,0,.22)"; g.fillRect(x * SW + 1, r * RH + RH - 6, SW - 2, 2);
      if (rand() < .3) {                    // a seated fan
        g.fillStyle = shirts[(rand() * shirts.length) | 0]; g.fillRect(x * SW + 1.5, r * RH + 7, SW - 3, 5);
        g.fillStyle = skin[(rand() * 4) | 0]; g.beginPath(); g.arc(x * SW + SW / 2, r * RH + 5.5, 2.4, 0, 7); g.fill();
      }
    }
  }
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return ESTADIO.tex[key] = t;
}
// stepped tiers rising away from the pitch. P: pitch-side corner at the viewer's left, R: along the stand, B: away from the pitch
function ESTADIO_stand(grp, o) {
  const N = 8, pos = [], uv = [], idx = [], conc = mat("#3a3e46", { roughness: .9 }), wall = mat("#262a31", { roughness: .9 });
  const pt = (a, b) => [o.P[0] + o.R[0] * a + o.B[0] * b, o.P[1] + o.R[1] * a + o.B[1] * b];
  const box = (m, a0, a1, b0, b1, y0, y1) => { const p = pt(a0, b0), q = pt(a1, b1); return part(grp, "box", m, Math.abs(q[0] - p[0]), y1 - y0, Math.abs(q[1] - p[1]), (p[0] + q[0]) / 2, (y0 + y1) / 2, (p[1] + q[1]) / 2); };
  for (let i = 0; i < N; i++) {
    const h = 2.6 + i * 1.1, b0 = o.off(i), b1 = o.off(i + 1), [a0, a1] = o.range(i), k = pos.length / 3;
    [[a0, b0, i], [a1, b0, i], [a1, b1, i + 1], [a0, b1, i + 1]].forEach(([a, b, v]) => { const p = pt(a, b); pos.push(p[0], h + .03, p[1]); uv.push(a / o.L, v / N); });
    idx.push(k, k + 1, k + 2, k, k + 2, k + 3);
    if (i > 0) box(conc, a0, a1, b0, b1, i < 2 ? 2.6 : 0, h);
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
  const key = "m" + o.tex.uuid, m = ESTADIO.tex[key] || (ESTADIO.tex[key] = new THREE.MeshBasicMaterial({ map: o.tex, side: THREE.DoubleSide, toneMapped: false, color: 0x9c9c9c }));
  grp.add(new THREE.Mesh(geo, m));
  // back wall, roof edge with a strip of floodlights, roof struts
  const bN = o.off(N), [r0, r1] = o.range(N - 1);
  box(wall, r0, r1, bN, bN + .7, 0, 15.2);
  box(mat("#d9dde3", { roughness: .5, metalness: .2 }), r0, r1, bN - 3.6, bN + .7, 15.2, 15.6);
  box(mat("#d8322b", { roughness: .5 }), r0, r1, bN - 3.75, bN - 3.6, 15.05, 15.75);
  for (let a = r0 + 2; a < r1 - 1; a += 3.2) { const l = box(basic("#fffbe8"), a, a + 1.5, bN - 3.5, bN - 2.9, 14.9, 15.18); l.castShadow = false; }
  for (let a = r0 + .5; a < r1; a += 9.4) box(wall, a, a + .35, bN - 3.4, bN, 14.6, 15.2);
}
function ESTADIO_adTex() {
  if (ESTADIO.tex.ad) return ESTADIO.tex.ad;
  const c = document.createElement("canvas"); c.width = 2048; c.height = 64; const g = c.getContext("2d");
  const ads = [["TSUNAMI COLA", "#e2362e", "#ffffff"], ["FENCE-IT", "#ffd23a", "#1b1d22"], ["WAVE AIR", "#22d3ee", "#0b2a3a"], ["GO GO GATES", "#ffffff", "#1f4fa8"],
               ["MEGA BURGER", "#ff7a1a", "#ffffff"], ["HUMAN TSUNAMI", "#7a2cff", "#ffffff"], ["STAY HYDRATED", "#35d07f", "#0c2e1c"], ["EXIT 3 >>>", "#1b1d22", "#ffd23a"]];
  g.font = "900 40px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  ads.forEach(([txt, bg, fg], i) => { g.fillStyle = bg; g.fillRect(i * 256, 0, 256, 64); g.fillStyle = fg; g.fillText(txt, i * 256 + 128, 35, 236); g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(i * 256 + 253, 0, 3, 64); });
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = THREE.RepeatWrapping; t.anisotropy = 8; return ESTADIO.tex.ad = t;
}
function ESTADIO_netTex() {
  if (ESTADIO.tex.net) return ESTADIO.tex.net;
  const c = document.createElement("canvas"); c.width = c.height = 32; const g = c.getContext("2d");
  g.fillStyle = "rgba(255,255,255,.1)"; g.fillRect(0, 0, 32, 32); g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.strokeRect(0, 0, 32, 32);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; return ESTADIO.tex.net = t;
}
// the LED wall behind the DJ: repainted a few times per second
function ESTADIO_screen() {
  if (ESTADIO.screen) return ESTADIO.screen;
  const c = document.createElement("canvas"); c.width = 440; c.height = 116; const g = c.getContext("2d");
  const tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding; let last = -1;
  const draw = tt => {
    if (Math.abs(tt - last) < .09) return; last = tt;
    const hue = (tt * 40) % 360, gr = g.createLinearGradient(0, 0, 440, 116);
    gr.addColorStop(0, `hsl(${hue},90%,45%)`); gr.addColorStop(.5, `hsl(${(hue + 70) % 360},95%,50%)`); gr.addColorStop(1, `hsl(${(hue + 150) % 360},90%,45%)`);
    g.fillStyle = gr; g.fillRect(0, 0, 440, 116);
    for (let i = 0; i < 44; i++) {          // equaliser bars
      const h = 12 + 44 * Math.abs(Math.sin(tt * (3 + (i % 5)) + i * 1.7)) * (.5 + .5 * Math.sin(i * .37 + tt));
      g.fillStyle = `hsla(${(hue + 180 + i * 4) % 360},100%,72%,.85)`; g.fillRect(i * 10 + 2, 116 - h, 6, h);
    }
    g.fillStyle = "rgba(0,0,0,.25)"; for (let y = 0; y < 116; y += 4) g.fillRect(0, y, 440, 1);
    g.font = "900 54px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = "rgba(0,0,0,.45)"; g.fillText("TSUNAMI LIVE", 223, 47); g.fillStyle = "#ffffff"; g.fillText("TSUNAMI LIVE", 220, 44);
    tex.needsUpdate = true;
  };
  draw(0); return ESTADIO.screen = { tex, draw };
}
SCENES.estadio = {
  name: "The Stadium", tag: "The cup final", outside: "#3b3f45", bulbH: 2.0, night: true, music: "edm",
  light: { sky: 0x8aa2e0, ground: 0x1e2228, hemi: .34, sun: 0xdfe8ff, sunI: .8 }, crowd: 2700, fenceBudget: 70, maxGates: 5, guards: 4,
  gates: [F, T, F, T, F, T, F], noSlots: [0, 6], slotWhy: "The stands are there", unlock: 2,
  intro: "Cup final: Deportivo Chancla vs Real Burrito. The fan zone is packed right up to the pitch-side barrier, every goal makes the whole stadium jump, and the two gangs in the stands REALLY don't like each other.",
  acts: ["What a chance!", "Off the post!", "The wave!", "Champions!"],
  events: ["mascot", "flares", "ola", "pelea", "medic", "pelea", "ola", "mascot", "flares"],
  goal: o => o.kind === "barrier", goalMaxY: 33,
  build() {
    rect(0, 0, 3.5, FENCE_Y, "stands"); rect(WW - 3.5, 0, WW, FENCE_Y, "stands"); rect(0, 0, WW, 5, "stands");
    rect(3.5, 5, WW - 3.5, 29.4, "pitch");   // the match is on: nobody in the fan zone gets onto the grass
    seg(3.5, 29.6, WW - 3.5, 29.6, .5, "barrier");
    rect(3.5, 30, 5.2, 37, "bench"); rect(34.8, 30, 36.5, 37, "bench");
  },
  ground(g, px) {
    g.fillStyle = "#3b3f45"; g.fillRect(0, 0, WW, WH);
    // grass with mower stripes in two greens, plus a fine cross-cut inside each stripe
    for (let y = 5, i = 0; y < FENCE_Y; y += 3, i++) {
      g.fillStyle = i % 2 ? "#33903f" : "#287536"; g.fillRect(3.5, y, WW - 7, Math.min(3, FENCE_Y - y));
      g.fillStyle = i % 2 ? "rgba(255,255,255,.035)" : "rgba(0,0,0,.05)"; for (let x = 3.5; x < WW - 3.5; x += 3) g.fillRect(x, y, 1.5, Math.min(3, FENCE_Y - y));
    }
    // the match pitch (top) and the fan zone (bottom, worn grass behind the barrier)
    g.fillStyle = "rgba(60,40,20,.28)"; g.fillRect(3.5, 30, WW - 7, FENCE_Y - 30);
    for (let k = 0; k < 900; k++) { g.fillStyle = k % 3 ? "rgba(90,70,40,.25)" : "rgba(200,190,150,.18)"; g.fillRect(3.5 + ((k * 37.3) % (WW - 7)), 30 + ((k * 13.7) % (FENCE_Y - 30)), .5, .3); }
    const L = () => { g.strokeStyle = "rgba(255,255,255,.95)"; g.lineWidth = .18; g.lineCap = "butt"; };
    L(); g.strokeRect(4.5, 6, 31, 22.5);
    g.beginPath(); g.moveTo(20, 6); g.lineTo(20, 28.5); g.stroke();
    g.beginPath(); g.arc(20, 17.25, 3.6, 0, 7); g.stroke();
    g.strokeRect(4.5, 10.5, 6, 13.5); g.strokeRect(29.5, 10.5, 6, 13.5); g.strokeRect(4.5, 14, 2.4, 6.5); g.strokeRect(33.1, 14, 2.4, 6.5);
    g.beginPath(); g.arc(8.6, 17.25, 3, -.95, .95); g.stroke(); g.beginPath(); g.arc(31.4, 17.25, 3, Math.PI - .95, Math.PI + .95); g.stroke();
    g.fillStyle = "#ffffff"; for (const [x, y] of [[20, 17.25], [8.6, 17.25], [31.4, 17.25]]) { g.beginPath(); g.arc(x, y, .25, 0, 7); g.fill(); }
    g.save(); g.globalAlpha = .18; g.font = "900 4px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#ffffff"; g.fillText("FAN ZONE", 20, 47); g.restore();
    // technical areas in front of the benches (dashed)
    // outside: concourse with painted stripes
    g.fillStyle = "#34383e"; g.fillRect(0, FENCE_Y, WW, WH - FENCE_Y);
    g.strokeStyle = "rgba(255,255,255,.25)"; g.lineWidth = .12;
    for (let x = 1; x < WW; x += 2.5) { g.beginPath(); g.moveTo(x, 68.5); g.lineTo(x + 1.2, 68.5); g.stroke(); }
  },
  decor(g) {
    // stands packed with fans
    const rand = rng(31), fans = ["#d8322b", "#ffffff", "#d8322b", "#1f4fa8", "#ffd23a", "#f4f4f0", "#2b2f35"];
    const stand = (x0, y0, x1, y1) => {
      g.fillStyle = "#24272d"; g.fillRect(x0, y0, x1 - x0, y1 - y0);
      for (let y = y0 + .3; y < y1; y += .55) for (let x = x0 + .3; x < x1; x += .5) {
        g.fillStyle = fans[(rand() * fans.length) | 0]; g.beginPath(); g.arc(x + (rand() - .5) * .1, y, .17, 0, 7); g.fill();
      }
    };
    stand(0, 0, 3.5, FENCE_Y); stand(WW - 3.5, 0, WW, FENCE_Y); stand(0, 0, WW, 5);
    // card mosaic in the back stand
    g.font = "900 3.6px Rubik, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = "rgba(216,50,43,.92)"; g.fillRect(9, .4, 22, 4.2);
    g.fillStyle = "#ffffff"; g.fillText("TSUNAMI", 20, 2.6);
    for (const o of obs) if (o.kind === "barrier") { g.lineWidth = o.th; g.strokeStyle = "#1c1d21"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
    g.fillStyle = "#1f4fa8"; for (const o of obs) if (o.kind === "bench") g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0);
  },
  bulbs: Array.from({ length: 16 }, (_, i) => [5 + i * 2, 30.1]),
  beams: [{ x: -7, y: -8, a: Math.atan2(44, 27), sweep: .22, h: 25, white: true }, { x: 47, y: -8, a: Math.atan2(44, -27), sweep: .22, h: 25, white: true },
          { x: -6, y: 69, a: Math.atan2(-33, 26), sweep: .22, h: 25, white: true }, { x: 46, y: 69, a: Math.atan2(-33, -26), sweep: .22, h: 25, white: true },
          { x: 14, y: 30, a: Math.PI / 2, sweep: .6, h: 9 }, { x: 26, y: 30, a: Math.PI / 2, sweep: .6, h: 9 }],
  extra3D(grp) {
    const E = ESTADIO; E.fx = [];
    const steel = mat("#9aa0a8", { metalness: .6, roughness: .4 }), dark = mat("#1b1d22", { roughness: .8 }), lamp = basic("#fffbe8");
    // ---- stands: three stepped tiers of seats with a mosaic, back wall and roof edge
    const side = i => i * 1.75, back = i => i < 2 ? i * 2.5 : 5 + (i - 2) * 1.75;
    ESTADIO_stand(grp, { P: [3.5, 66], R: [0, -1], B: [-1, 0], L: 76.5, off: side, range: i => i < 2 ? [0, 61] : [0, 76.5], tex: ESTADIO_seatTex("left", 76.5, "HUMAN", 30.5) });
    ESTADIO_stand(grp, { P: [36.5, -10.5], R: [0, 1], B: [1, 0], L: 76.5, off: side, range: i => i < 2 ? [15.5, 76.5] : [0, 76.5], tex: ESTADIO_seatTex("right", 76.5, "TSUNAMI", 46) });
    ESTADIO_stand(grp, { P: [0, 5], R: [1, 0], B: [0, -1], L: 40, off: back, range: () => [0, 40], tex: ESTADIO_seatTex("back", 40, "TSUNAMI", 20) });
    // ---- LED advertising boards on the stand fronts (scrolling)
    const adTex = ESTADIO_adTex(), adMat = E.adMat || (E.adMat = new THREE.MeshBasicMaterial({ map: adTex, toneMapped: false, color: 0xd0d0d0 }));
    for (const s of [-1, 1]) {
      const geo = new THREE.PlaneGeometry(53.4, 1); geo.attributes.uv.array.forEach((v, i, a) => { if (i % 2 === 0) a[i] = v * 53.4 / 32; });
      const m = new THREE.Mesh(geo, adMat); m.rotation.y = -s * Math.PI / 2; m.position.set(s < 0 ? 3.56 : WW - 3.56, 1.75, 39.3); grp.add(m);
      part(grp, "box", dark, .08, 1.16, 53.6, s < 0 ? 3.52 : WW - 3.52, 1.75, 39.3);
    }
    E.fx.push(tt => { adTex.offset.x = (tt * .035) % 1; });
    // ---- floodlight towers outside the corners, heads aimed at the centre spot
    for (const [x, y] of [[-7, -8], [47, -8], [-6, 69], [46, 69]]) {
      part(grp, "cyl", steel, .5, 25, .5, x, 12.5, y); part(grp, "cyl", dark, .9, 1, .9, x, .5, y);
      for (let k = 1; k < 5; k++) part(grp, "box", steel, 1.3, .12, 1.3, x, k * 5, y);
      const head = pivot(grp, x, 25.6, y); head.rotation.y = Math.atan2(20 - x, 36 - y); const tilt = pivot(head, 0, 0, 0); tilt.rotation.x = .5;
      part(tilt, "box", dark, 6.4, 4.2, .5, 0, 0, 0);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) part(tilt, "sph", lamp, .5, .5, .3, (c - 2) * 1.2, (r - 1) * 1.25, .3);
    }
    // ---- the two goals at the ends of the pitch, mouths facing the centre spot
    const white = mat("#ffffff", { roughness: .3 });
    const netM = E.netMat || (E.netMat = new THREE.MeshBasicMaterial({ map: ESTADIO_netTex(), transparent: true, side: THREE.DoubleSide, depthWrite: false, toneMapped: false, color: 0xb0b0b0 }));
    const net = (w, h, x, y, z, rx, ry) => { const g = new THREE.PlaneGeometry(w, h); g.attributes.uv.array.forEach((v, i, a) => { a[i] = v * (i % 2 ? h : w) * 2; }); const m = new THREE.Mesh(g, netM); m.position.set(x, y, z); m.rotation.set(rx, ry, 0, "YXZ"); grp.add(m); };
    for (const s of [-1, 1]) {
      const gx = s < 0 ? 4.5 : 35.5, back = gx + s * .9;
      for (const y of [15.05, 19.45]) { part(grp, "cyl", white, .1, 2.44, .1, gx, 1.22, y); part(grp, "cyl", white, .05, 1.9, .05, back, .95, y); }
      const bar = part(grp, "cyl", white, .1, 4.5, .1, gx, 2.44, 17.25); bar.rotation.x = Math.PI / 2;
      net(4.4, 1.9, back, .95, 17.25, 0, Math.PI / 2); net(4.4, 1.1, (gx + back) / 2, 2.2, 17.25, -Math.PI / 2, Math.PI / 2 + s * .6);
      for (const y of [15.05, 19.45]) net(.9, 1.9, (gx + back) / 2, .95, y, 0, 0);
    }
    // ---- dugouts on the benches, with stewards in yellow sitting in them
    const glass = mat("#9fd8ff", { transparent: true, opacity: .35, roughness: .15 });
    for (const s of [-1, 1]) {
      const bx = s < 0 ? 4.35 : 35.65, wallX = s < 0 ? 3.62 : 36.38, frontX = s < 0 ? 5.1 : 34.9;
      part(grp, "box", glass, 1.7, .08, 7, bx, 2.3, 33.5); part(grp, "box", mat("#1f4fa8"), 1.74, .14, .14, bx, 2.3, 30.05); part(grp, "box", mat("#1f4fa8"), 1.74, .14, .14, bx, 2.3, 36.95);
      for (const y of [30.08, 36.92]) { part(grp, "cyl", steel, .06, 1.8, .06, frontX, 1.4, y); part(grp, "box", glass, 1.6, 1.7, .06, bx, 1.4, y); }
      for (let k = 0; k < 6; k++) {
        const y = 30.8 + k * 1.08, vest = k % 3 === 2 ? "#ff7a1a" : "#e8f531";
        part(grp, "box", "#22252b", .5, .12, .5, wallX + s * -.45, .56, y);
        part(grp, "box", basic(vest, { color: lin(vest).multiplyScalar(.75) }), .34, .5, .46, wallX - s * .45, .9, y); part(grp, "sph", "#e9b98f", .24, .24, .24, wallX - s * .47, 1.3, y);
        part(grp, "box", "#22252b", .4, .16, .4, wallX - s * .75, .62, y);
      }
    }
    // ---- big waving flags up in the stands
    const flagAt = (x, y, h, face, cols, ph) => {
      const root = pivot(grp, x, h, y); root.rotation.y = face;
      part(root, "cyl", steel, .07, 4.6, .07, 0, 2.3, 0);
      const segs = []; let par = pivot(root, 0, 3.75, 0);
      for (let k = 0; k < 5; k++) { par = pivot(par, k ? .62 : .05, 0, 0); part(par, "box", basic(cols[k % cols.length], { color: lin(cols[k % cols.length]).multiplyScalar(.8) }), .64, 1.6, .05, .31, 0, 0); segs.push(par); }
      E.fx.push(tt => { root.rotation.z = Math.sin(tt * 1.7 + ph) * .16; segs.forEach((p, k) => { p.rotation.y = Math.sin(tt * 4.2 - k * .9 + ph) * (k ? .42 : .25); }); });
    };
    const RW = ["#e2362e", "#ffffff"], YB = ["#ffd23a", "#1f4fa8"], RR = ["#e2362e", "#e2362e", "#ffffff", "#e2362e", "#e2362e"];
    [[18, RW], [29, YB], [44, RR], [56, RW]].forEach(([y, c], i) => { flagAt(-2.6, y, 5.9, Math.PI / 2, c, i * 1.9); flagAt(42.6, y + 4, 5.9, -Math.PI / 2, [RW, RR, YB, RW][i], i * 2.3 + 1); });
    flagAt(3, -1.6, 5.9, 0, YB, .7); flagAt(33, -1.6, 5.9, 0, RR, 2.9);
  },
  performers: () => [{ kind: "estadio_fx", orbit: [20, 8, 0, 0, 0], h: 1, x: 0, y: 0, ang: 0, t: 0 }],
};

// ---------- the cup final: a real (tiny, silly) football match behind the barrier ----------
const TEAMS = [
  { name: "DEPORTIVO CHANCLA", short: "CHA", shirt: "#d8322b", shorts: "#ffffff", gk: "#35d07f", logo: "chancla", fans: "#ff4a3a" },
  { name: "REAL BURRITO", short: "BUR", shirt: "#1f4fa8", shorts: "#ffd23a", gk: "#ff9a3c", logo: "burrito", fans: "#3a7bff" },
];
const PITCH = { x0: 4.5, x1: 35.5, y0: 6, y1: 28.5, cy: 17.25, m0: 15.25, m1: 19.25 };
const MATCH = { score: [0, 0], ball: null, players: [], reset: 0, kickT: 0, last: -1, goals: 0 };
// comic crests, drawn on the scoreboard and (simplified) on the fans' chests
function teamLogo(g, team, x, y, r) {
  g.save(); g.translate(x, y);
  g.fillStyle = team.shirt; g.beginPath(); g.moveTo(-r, -r); g.lineTo(r, -r); g.lineTo(r, r * .2); g.quadraticCurveTo(0, r * 1.5, -r, r * .2); g.closePath(); g.fill();
  g.strokeStyle = "#ffffff"; g.lineWidth = r * .12; g.stroke();
  if (team.logo === "chancla") {   // a flip-flop, the most feared weapon in the country
    g.fillStyle = "#ffd23a"; g.beginPath(); g.ellipse(0, r * .05, r * .38, r * .7, -.35, 0, 7); g.fill();
    g.strokeStyle = "#1b1d22"; g.lineWidth = r * .12; g.beginPath(); g.moveTo(-r * .3, -r * .1); g.lineTo(r * .05, -r * .45); g.lineTo(r * .32, -r * .05); g.stroke();
  } else {                         // a burrito with a face
    g.fillStyle = "#f2d39a"; g.beginPath(); g.ellipse(0, 0, r * .75, r * .42, -.25, 0, 7); g.fill();
    g.fillStyle = "#7ac943"; g.fillRect(-r * .6, -r * .08, r * .25, r * .16);
    g.fillStyle = "#1b1d22"; for (const s of [-1, 1]) { g.beginPath(); g.arc(s * r * .18, -r * .08, r * .07, 0, 7); g.fill(); }
    g.beginPath(); g.arc(0, r * .08, r * .16, .2, Math.PI - .2); g.lineWidth = r * .07; g.strokeStyle = "#1b1d22"; g.stroke();
  }
  g.restore();
}
for (const [i, T] of TEAMS.entries()) {
  SCENE_PERSONS["est_p" + i] = { body: T.shirt, legs: T.shorts, hat: "hair", hatCol: i ? "#2b1d14" : "#e3b23c", shoes: "#151617",
    extra(g, u, b) { part(b, "box", "#ffffff", .05, .18, .14, .26, 1.05, 0); } };   // shirt number patch
  SCENE_PERSONS["est_gk" + i] = { body: T.gk, legs: "#151617", hat: "cap", hatCol: T.gk, shoes: "#151617",
    extra(g, u, b) { for (const s of [-1, 1]) part(b, "sph", "#ffffff", .1, .1, .1, .05, .78, s * .3); } };
  SCENE_PERSONS["est_fan" + i] = { body: T.fans, legs: "#2b2f35", hat: "hair", hatCol: T.fans, skin: "#e9b98f",
    extra(g, u, b) {   // scarf, face paint and the crest on the belly
      part(b, "box", i ? "#ffd23a" : "#ffffff", .3, .1, .5, 0, 1.42, 0);
      part(b, "cyl", "#ffffff", .2, .03, .2, .26, 1.0, 0).rotation.z = Math.PI / 2;
      part(b, i ? "sph" : "box", i ? "#f2d39a" : "#ffd23a", .08, i ? .1 : .16, i ? .16 : .06, .29, 1.0, 0);
      for (const s of [-1, 1]) part(b, "box", T.shirt, .02, .06, .1, .21, 1.6, s * .1);
    } };
}
SCENE_MODELS.est_ball = (g, u) => {
  const b = part(g, "sph", mat("#ffffff", { roughness: .4 }), .2, .2, .2, 0, .2, 0); u.ball = null; u.spinBall = b;
  for (let k = 0; k < 5; k++) { const a = k * 1.257; part(b, "sph", "#151617", .35, .35, .35, Math.cos(a) * .82, Math.sin(a) * .82, 0); }
  u.anim = (tt, m) => { b.rotation.z = -(m.roll || 0); g.position.y += m.bh || 0; };
};
function matchHome(team, k) {   // formation: keeper + 2 defenders + 2 forwards, sliding with the ball
  const dir = team ? -1 : 1;
  if (k === 0) return [team ? PITCH.x1 - .7 : PITCH.x0 + .7, PITCH.cy];
  const shift = MATCH.ball ? (MATCH.ball.x - 20) * .45 : 0;
  return [clamp(20 + dir * (k < 3 ? -8 : 3) + shift, PITCH.x0 + 1, PITCH.x1 - 1), [0, 11, 23.5, 13.5, 21][k]];
}
function matchKickoff() {
  const b = MATCH.ball; b.x = 20; b.y = PITCH.cy; b.vx = b.vy = 0; b.bh = 0; b.vh = 0; MATCH.reset = 0; MATCH.kickT = .8;
  for (const p of MATCH.players) { const [hx, hy] = matchHome(p.team, p.k); p.x = hx + (p.k ? (p.team ? 1.5 : -1.5) : 0); p.y = hy; }
}
function matchStart() {
  MATCH.score = [0, 0]; MATCH.players = []; MATCH.goals = 0;
  addMover({ kind: "est_ball", fixture: true, beh: "static", life: 1e9, x: 20, y: PITCH.cy, r: .2, push: 0, scare: 0, air: true, h: 0, vx: 0, vy: 0, roll: 0, tick: matchTick });
  MATCH.ball = movers[movers.length - 1];
  for (let team = 0; team < 2; team++) for (let k = 0; k < 5; k++) {
    addMover({ kind: k ? "est_p" + team : "est_gk" + team, fixture: true, beh: "static", life: 1e9, x: 20, y: PITCH.cy, r: .35, push: 0, scare: 0, air: true, h: 0, team, k, ang: team ? Math.PI : 0, speed: k ? 4.6 + Math.random() * .8 : 3.6 });
    MATCH.players.push(movers[movers.length - 1]);
  }
  matchKickoff();
}
function matchRun(p, tx, ty, sp) {
  const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy);
  if (d > .15) { const s = Math.min(sp * DT, d); p.x += dx / d * s; p.y += dy / d * s; p.ang = turnTo(p.ang, Math.atan2(dy, dx), DT * 9); }
  else p.ang = turnTo(p.ang, Math.atan2(MATCH.ball.y - p.y, MATCH.ball.x - p.x), DT * 5);
}
function matchTick(b) {
  if (MATCH.reset > 0) {   // celebrating: the scorer's team runs to the corner flag, everyone else sulks
    MATCH.reset -= DT; b.vx *= .9; b.vy *= .9; b.x += b.vx * DT; b.y += b.vy * DT;
    for (const p of MATCH.players) if (p.team === MATCH.last && p.k) matchRun(p, MATCH.last ? PITCH.x0 + 2 : PITCH.x1 - 2, PITCH.y1 - 1.5 - p.k * .6, 5);
    if (MATCH.reset <= 0) matchKickoff(); return;
  }
  // ball physics: rolling friction, little hops, bounces off the touchlines
  b.x += b.vx * DT; b.y += b.vy * DT; const f = Math.exp(-1.1 * DT); b.vx *= f; b.vy *= f;
  b.vh = (b.vh || 0) - 14 * DT; b.bh = Math.max(0, (b.bh || 0) + b.vh * DT); if (b.bh === 0 && b.vh < 0) b.vh = -b.vh * .45;
  b.roll += Math.hypot(b.vx, b.vy) * DT / .2;
  if (b.y < PITCH.y0 + .2 && b.vy < 0 || b.y > PITCH.y1 - .2 && b.vy > 0) b.vy *= -.7;
  const inMouth = b.y > PITCH.m0 && b.y < PITCH.m1;
  if (b.x < PITCH.x0 || b.x > PITCH.x1) {
    if (inMouth && b.bh < 2.3) { matchGoal(b.x > 20 ? 0 : 1); return; }
    b.vx *= -.7; b.x = clamp(b.x, PITCH.x0, PITCH.x1);
  }
  MATCH.kickT -= DT;
  const first = Math.random() < .5 ? 0 : 1;   // whoever reaches a loose ball first: no side always wins it
  for (let tt = 0; tt < 2; tt++) {
    const team = tt ? 1 - first : first, mates = MATCH.players.filter(p => p.team === team);
    let chaser = null, cd = 1e9;
    for (const p of mates) if (p.k) { const d = Math.hypot(p.x - b.x, p.y - b.y); if (d < cd) { cd = d; chaser = p; } }
    for (const p of mates) {
      if (p.k === 0) {   // keeper: slides along the line, dives at shots
        const gy = clamp(b.y, PITCH.m0 + .3, PITCH.m1 - .3), near = Math.abs(b.x - p.x) < 4;
        matchRun(p, p.team ? PITCH.x1 - .7 : PITCH.x0 + .7, near ? gy : PITCH.cy + (gy - PITCH.cy) * .5, near ? 5.5 : 3);
        if (Math.hypot(p.x - b.x, p.y - b.y) < .75 && MATCH.kickT <= 0 && b.bh < 1.8) {
          if (Math.random() < .72) { matchKick(p, b, team ? PITCH.x0 + 10 : PITCH.x1 - 10, rnd(PITCH.y0 + 2, PITCH.y1 - 2), 11, .5); pop(p.x, p.y - 1.4, ["SAVED!", "NOT TODAY!", "BOING!"][(Math.random() * 3) | 0]); }
          else { MATCH.kickT = .5; pop(p.x, p.y - 1.4, "BUTTERFINGERS!"); }
        }
        continue;
      }
      if (p === chaser) matchRun(p, b.x - (team ? -.3 : .3), b.y, p.speed);
      else { const [hx, hy] = matchHome(team, p.k); matchRun(p, hx, hy, p.speed * .7); }
      if (Math.hypot(p.x - b.x, p.y - b.y) < .55 && MATCH.kickT <= 0 && b.bh < .8) {
        const gx = team ? PITCH.x0 - .5 : PITCH.x1 + .5, dg = Math.abs(gx - p.x);
        if (dg < 10 && Math.random() < .4) { matchKick(p, b, gx, PITCH.cy + rnd(-3.2, 3.2), 13 + Math.random() * 4, Math.random() < .3 ? 4 : 1.5); if (Math.random() < .4) pop(p.x, p.y - 1.4, ["SHOOOT!", "BANANA KICK!", "BICYCLE KICK!"][(Math.random() * 3) | 0]); }
        else {
          const ahead = mates.filter(q => q.k && q !== p && (team ? q.x < p.x : q.x > p.x));
          const q = ahead[(Math.random() * ahead.length) | 0];
          if (q && Math.random() < .6) matchKick(p, b, q.x + (team ? -1.5 : 1.5), q.y, 9, .6);
          else matchKick(p, b, p.x + (team ? -5 : 5), clamp(p.y + rnd(-3, 3), PITCH.y0 + 1, PITCH.y1 - 1), 5.5, .2);
        }
      }
    }
  }
}
function matchKick(p, b, tx, ty, sp, lift) {
  const dx = tx - b.x, dy = ty - b.y, d = Math.hypot(dx, dy) || 1; b.vx = dx / d * sp; b.vy = dy / d * sp; b.vh = lift * 3; MATCH.kickT = .35;
}
function matchGoal(team) {
  MATCH.score[team]++; MATCH.goals++; MATCH.last = team; MATCH.reset = 4.5; const T = TEAMS[team], b = MATCH.ball;
  b.vx *= .2; b.vy *= .2;
  pop(b.x, b.y - 1.6, "GOOOOOL!"); caption(`GOAL! ${TEAMS[0].short} ${MATCH.score[0]} – ${MATCH.score[1]} ${TEAMS[1].short}`, true, 2600); sfx("cheer"); if (typeof eventLog !== "undefined") eventLog.add("gol");
  if (demo || phase !== "show") return;
  // the whole stadium jumps: stands bounce, the fan zone hops on the beat and leans on the barrier
  cheerT = Math.max(cheerT, 5); surgeT = Math.max(surgeT, 2.2);
  for (let k = 0; k < 8; k++) later(k * .42, () => {
    shake = Math.min(1.2, shake + .3); windF = { x: (k % 2 ? 1 : -1) * .9, t: .35 };
    for (let j = 0; j < 60 && ag.length; j++) { const a = ag[(Math.random() * ag.length) | 0]; if (a.ps < PCRIT * .5) toss(a, .45 + Math.random() * .4, .38); }
  });
  for (let k = 0; k < 6; k++) { const [x, y] = crowdPoint(); later(k * .3, () => pop(x, Math.max(34, y) - 1, ["GOOOL!", "OLE OLE OLE!", "WE ARE THE CHAMPIONS!", "I'M CRYING!", "HUG ME, STRANGER!", T.short + "! " + T.short + "!"][k])); }
  if (Math.random() < .45) later(3, () => spawnEvent("pelea"));   // the losing gang takes it personally
}
Object.assign(SCENES.estadio, {
  onStart() { matchStart(); },
  quotes: ["“We lost 4–3 but our gang won the fight in the fan zone,” said a man with a flip-flop in his hand.", "“The burrito is a legitimate crest,” insisted the club president.", "“I jumped so hard my shoes are still in orbit,” said one fan."],
  lines: {
    gol: "Every goal made the whole stadium jump; seismologists filed a complaint.",
    pelea: "The two fan gangs came down from the stands to settle things with flip-flops and burritos.",
    mascot: "The mascot invaded the fan zone and was cheered louder than the players.",
  },
  hud(g, w) {   // scoreboard with both crests
    const bw = 300, x = 18, y = 12;
    g.fillStyle = "rgba(17,18,20,.85)"; g.beginPath(); g.roundRect(x, y, bw, 44, 10); g.fill();
    teamLogo(g, TEAMS[0], x + 24, y + 21, 13); teamLogo(g, TEAMS[1], x + bw - 24, y + 21, 13);
    g.font = "900 13px Rubik, system-ui, sans-serif"; g.textBaseline = "middle"; g.fillStyle = "#ffffff";
    g.textAlign = "left"; g.fillText(TEAMS[0].short, x + 44, y + 22); g.textAlign = "right"; g.fillText(TEAMS[1].short, x + bw - 44, y + 22);
    g.textAlign = "center"; g.font = "900 22px Rubik, system-ui, sans-serif"; g.fillStyle = MATCH.reset > 0 && Math.sin(performance.now() / 80) > 0 ? "#ffd23a" : "#ffffff";
    g.fillText(phase === "plan" ? "VS" : `${MATCH.score[0]} – ${MATCH.score[1]}`, x + bw / 2, y + 23);
  },
  ev: {
    pelea() {   // the two gangs come down from opposite stands and meet in the fan zone
      const mx = rnd(12, 28), my = rnd(38, 56), gang = [];
      for (let team = 0; team < 2; team++) for (let k = 0; k < 6; k++) {
        const sx = team ? WW - 2 : 2, sy = my + rnd(-6, 6);
        addMover({ kind: "est_fan" + team, beh: "static", life: 22, x: sx, y: sy, r: .42, push: 22, scare: 1.6, team, tx: mx + (team ? 1 : -1) * rnd(.5, 1.6), ty: my + rnd(-1.4, 1.4), say: k ? "" : team ? "BURRITO POWER!" : "CHANCLA ARMY!", sayEvery: 3,
          tick(m) {
            const fight = m.t > 4 && m.t < 15, away = m.t >= 15, tx = away ? (m.team ? WW + 3 : -3) : m.tx + (fight ? Math.sin(m.t * 7 + m.y) * .5 : 0), ty = away ? m.y : m.ty + (fight ? Math.cos(m.t * 6 + m.x) * .5 : 0);
            const dx = tx - m.x, dy = ty - m.y, d = Math.hypot(dx, dy), sp = fight ? 3 : 4.2;
            if (d > .1) { m.x += dx / d * Math.min(d, sp * DT); m.y += dy / d * Math.min(d, sp * DT); m.ang = Math.atan2(dy, dx); }
            if (away && (m.x < -2 || m.x > WW + 2)) m.dead = true;
            if (fight && m.say && Math.random() < .05) {   // the dust cloud of a proper cartoon fight
              puff(mx + rnd(-1.5, 1.5), my + rnd(-1.2, 1.2), rnd(.3, 1.4), "#e8e2d0", rnd(.5, .9), 1, .3);
              if (Math.random() < .5) pop(mx + rnd(-1.5, 1.5), my - 1.5, ["POW!", "BONK!", "SLAP!", "YOUR TEAM STINKS!", "THWACK!", "NOT THE HAIR!", "*FLIP-FLOP NOISES*"][(Math.random() * 7) | 0]);
              for (const a of ag) { const ex = a.x - mx, ey = a.y - my, dd = Math.hypot(ex, ey); if (dd < 2.6 && dd > .01 && Math.random() < .08) { toss(a, 1 + Math.random() * 1.2, .8); a.vx += ex / dd * 2; a.vy += ey / dd * 2; } }
            }
          } });
        gang.push(movers[movers.length - 1]);
      }
      gang[0].say = "CHANCLA ARMY!"; gang[6].say = "BURRITO POWER!";
      caption("The fan gangs came down from the stands!", true, 2200);
    },
  },
});

SCENES.estadio.bounce = tt => cheerT > 0 ? Math.abs(Math.sin(tt * 9)) * .35 * Math.min(1, cheerT) : 0;
SCENES.estadio.rock = tt => cheerT > 0 ? Math.sin(tt * 9) * .012 * Math.min(1, cheerT) : 0;
