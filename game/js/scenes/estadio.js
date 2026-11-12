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
  name: "The Stadium", tag: "Concert on the pitch", outside: "#3b3f45", bulbH: 2.0, night: true, music: "edm",
  light: { sky: 0x8aa2e0, ground: 0x1e2228, hemi: .34, sun: 0xdfe8ff, sunI: .8 }, crowd: 3600, fenceBudget: 70, maxGates: 5, guards: 4,
  gates: [F, T, F, T, F, T, F], noSlots: [0, 6], slotWhy: "The stands are there", unlock: 2,
  intro: "The final turned into a concert. Fans flood the pitch, flares are lit, the mascot is on the loose and the wave will not stop.",
  acts: ["What a GOLAZO of a song!", "Everybody jump!", "The wave!", "Champions!"],
  events: ["mascot", "flares", "ola", "ball", "medic", "flares", "ola", "mascot"],
  goal: o => o.kind === "barrier", goalMaxY: 30,
  build() {
    rect(0, 0, 3.5, FENCE_Y, "stands"); rect(WW - 3.5, 0, WW, FENCE_Y, "stands"); rect(0, 0, WW, 5, "stands");
    rect(8, 5, 32, 11, "stage");
    rect(4.2, 6, 7, 10, "speaker"); rect(33, 6, 35.8, 10, "speaker");
    seg(3.5, 12.4, WW - 3.5, 12.4, .5, "barrier");
    rect(17, 61, 23, 62, "goal");
    rect(3.5, 30, 5.2, 37, "bench"); rect(34.8, 30, 36.5, 37, "bench");
  },
  ground(g, px) {
    g.fillStyle = "#3b3f45"; g.fillRect(0, 0, WW, WH);
    // grass with mower stripes in two greens, plus a fine cross-cut inside each stripe
    for (let y = 5, i = 0; y < FENCE_Y; y += 3, i++) {
      g.fillStyle = i % 2 ? "#33903f" : "#287536"; g.fillRect(3.5, y, WW - 7, Math.min(3, FENCE_Y - y));
      g.fillStyle = i % 2 ? "rgba(255,255,255,.035)" : "rgba(0,0,0,.05)"; for (let x = 3.5; x < WW - 3.5; x += 3) g.fillRect(x, y, 1.5, Math.min(3, FENCE_Y - y));
    }
    // darker run-off strip along the touchlines and behind the goal
    g.fillStyle = "rgba(10,40,18,.35)"; g.fillRect(3.5, 12.6, 1.1, FENCE_Y - 12.6); g.fillRect(WW - 4.6, 12.6, 1.1, FENCE_Y - 12.6); g.fillRect(3.5, 62.4, WW - 7, FENCE_Y - 62.4);
    // crisp white markings
    const L = () => { g.strokeStyle = "rgba(255,255,255,.95)"; g.lineWidth = .2; g.lineCap = "butt"; };
    L(); g.strokeRect(5, 14, 30, 47);
    g.beginPath(); g.moveTo(5, 37.5); g.lineTo(35, 37.5); g.stroke();
    g.beginPath(); g.arc(20, 37.5, 5, 0, 7); g.stroke();
    g.strokeRect(11, 49, 18, 12); g.strokeRect(15.5, 57, 9, 4);          // south penalty and goal areas
    g.beginPath(); g.arc(20, 53, 4.2, Math.PI + .95, -.95); g.stroke();   // the "D"
    g.strokeRect(11, 14, 18, 12); g.strokeRect(15.5, 14, 9, 4);           // north areas (the stage hides that goal)
    g.beginPath(); g.arc(20, 22, 4.2, .95, Math.PI - .95); g.stroke();
    for (const [cx, cy, a0] of [[5, 14, 0], [35, 14, Math.PI / 2], [35, 61, Math.PI], [5, 61, -Math.PI / 2]]) { g.beginPath(); g.arc(cx, cy, 1, a0, a0 + Math.PI / 2); g.stroke(); }
    g.fillStyle = "#ffffff"; for (const [x, y] of [[20, 37.5], [20, 53], [20, 22]]) { g.beginPath(); g.arc(x, y, .28, 0, 7); g.fill(); }
    // technical areas in front of the benches (dashed)
    g.setLineDash([.5, .35]); g.lineWidth = .12;
    g.strokeRect(5.2, 29.5, 1.6, 8); g.strokeRect(33.2, 29.5, 1.6, 8); g.setLineDash([]);
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
    // stage with LED screen
    g.fillStyle = "#16171b"; g.fillRect(8, 5, 24, 6);
    const led = g.createLinearGradient(9, 0, 31, 0); led.addColorStop(0, "#7a2cff"); led.addColorStop(.5, "#ff3fa4"); led.addColorStop(1, "#22d3ee");
    g.fillStyle = led; g.fillRect(9, 5.4, 22, 1.4);
    g.fillStyle = "#2b2d33"; for (let x = 9; x < 31; x += 2.2) g.fillRect(x, 8, 1.4, .8);
    g.fillStyle = "#101114"; for (const o of obs) if (o.kind === "speaker") g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0);
    for (const o of obs) if (o.kind === "barrier") { g.lineWidth = o.th; g.strokeStyle = "#1c1d21"; g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.stroke(); }
    // goal: net seen from above
    g.fillStyle = "rgba(255,255,255,.28)"; g.fillRect(17, 61, 6, 1);
    g.strokeStyle = "rgba(255,255,255,.8)"; g.lineWidth = .04;
    for (let x = 17; x <= 23.01; x += .25) { g.beginPath(); g.moveTo(x, 61); g.lineTo(x, 62); g.stroke(); }
    for (let y = 61; y <= 62.01; y += .25) { g.beginPath(); g.moveTo(17, y); g.lineTo(23, y); g.stroke(); }
    g.strokeStyle = "#ffffff"; g.lineWidth = .16; g.strokeRect(17.08, 61.08, 5.84, .84);
    // stage floor: LED edge, monitor wedges, cable runs, set list tape
    g.fillStyle = "#22d3ee"; g.fillRect(8.2, 10.7, 23.6, .16); g.fillStyle = "#ff3fa4"; g.fillRect(8.2, 5.1, .16, 5.6); g.fillRect(31.64, 5.1, .16, 5.6);
    g.fillStyle = "#3a3d45"; for (let x = 10; x < 31; x += 3.3) { g.beginPath(); g.moveTo(x, 10.4); g.lineTo(x + 1.1, 10.4); g.lineTo(x + .9, 9.8); g.lineTo(x + .2, 9.8); g.fill(); }
    g.strokeStyle = "rgba(255,210,58,.5)"; g.lineWidth = .06; g.beginPath(); g.moveTo(9, 9.4); g.bezierCurveTo(14, 8.6, 17, 9.9, 20, 9.2); g.bezierCurveTo(24, 8.4, 27, 9.8, 31, 9.1); g.stroke();
    g.fillStyle = "#1f4fa8"; for (const o of obs) if (o.kind === "bench") g.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0);
  },
  bulbs: Array.from({ length: 16 }, (_, i) => [9 + i * 1.47, 11.3]),
  beams: [{ x: -7, y: -8, a: Math.atan2(44, 27), sweep: .22, h: 25, white: true }, { x: 47, y: -8, a: Math.atan2(44, -27), sweep: .22, h: 25, white: true },
          { x: -6, y: 69, a: Math.atan2(-33, 26), sweep: .22, h: 25, white: true }, { x: 46, y: 69, a: Math.atan2(-33, -26), sweep: .22, h: 25, white: true },
          { x: 14, y: 11, a: Math.PI / 2, sweep: .6, h: 9 }, { x: 26, y: 11, a: Math.PI / 2, sweep: .6, h: 9 }],
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
    // ---- goal with a net (inside its own obstacle)
    const white = mat("#ffffff", { roughness: .3 });
    for (const x of [17.1, 22.9]) { part(grp, "cyl", white, .1, 2.44, .1, x, 1.22, 61.1); part(grp, "cyl", white, .05, 1.9, .05, x, .95, 61.92); const st = part(grp, "cyl", white, .05, 1, .05, x, 2.17, 61.5); st.rotation.x = -.95; }
    const bar = part(grp, "cyl", white, .1, 5.9, .1, 20, 2.44, 61.1); bar.rotation.z = Math.PI / 2;
    const netM = E.netMat || (E.netMat = new THREE.MeshBasicMaterial({ map: ESTADIO_netTex(), transparent: true, side: THREE.DoubleSide, depthWrite: false, toneMapped: false, color: 0xb0b0b0 }));
    const net = (w, h, x, y, z, rx, ry) => { const g = new THREE.PlaneGeometry(w, h); g.attributes.uv.array.forEach((v, i, a) => { a[i] = v * (i % 2 ? h : w) * 2; }); const m = new THREE.Mesh(g, netM); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); grp.add(m); };
    net(5.8, 1.9, 20, .95, 61.92, 0, 0); net(5.8, 1, 20, 2.17, 61.5, -Math.PI / 2 + .6, 0);
    for (const x of [17.1, 22.9]) net(.82, 1.9, x, .95, 61.51, 0, Math.PI / 2);
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
    // ---- concert stage: truss, LED wall, lamp bar, taller speaker stacks
    const truss = mat("#c9ced6", { metalness: .7, roughness: .35 });
    for (const x of [8.5, 31.5]) for (const y of [5.5, 10.5]) { part(grp, "box", truss, .45, 8.4, .45, x, 6, y); part(grp, "box", dark, .8, .3, .8, x, 1.95, y); }
    for (const y of [5.5, 10.5]) { part(grp, "box", truss, 23.5, .45, .45, 20, 10.2, y); for (let x = 9.5; x < 31; x += 1.5) { const d = part(grp, "box", truss, .08, .62, .08, x, 10.2, y); d.rotation.z = (Math.round(x / 1.5) % 2 ? 1 : -1) * .6; } }
    for (const x of [8.5, 20, 31.5]) part(grp, "box", truss, .45, .45, 5.4, x, 10.2, 8);
    part(grp, "box", dark, 22.6, 6.4, .35, 20, 5.9, 5.55);
    const scr = ESTADIO_screen(), sm = new THREE.Mesh(new THREE.PlaneGeometry(22, 5.8), E.scrMat || (E.scrMat = new THREE.MeshBasicMaterial({ map: scr.tex, toneMapped: false })));
    sm.position.set(20, 5.9, 5.74); grp.add(sm); E.fx.push(scr.draw);
    const cans = [];
    for (let i = 0; i < 12; i++) {
      const x = 10 + i * 1.82, hue = ["#ff3fa4", "#22d3ee", "#ffd23a", "#7a2cff"][i % 4];
      part(grp, "cyl", dark, .34, .5, .34, x, 9.7, 10.5); cans.push(part(grp, "sph", new THREE.MeshBasicMaterial({ color: lin(hue), toneMapped: false }), .3, .16, .3, x, 9.42, 10.5));
    }
    E.fx.push(tt => cans.forEach((c, i) => { const k = .45 + 1.1 * Math.max(0, Math.sin(tt * 5 + i * 1.3)); c.material.color.copy(lin(["#ff3fa4", "#22d3ee", "#ffd23a", "#7a2cff"][i % 4])).multiplyScalar(k); }));
    for (const o of obs) if (o.kind === "speaker") {
      const cx = (o.x0 + o.x1) / 2;
      for (let k = 0; k < 2; k++) { part(grp, "box", "#17181c", 2.5 - k * .3, 1.5, 3.4 - k * .4, cx, 3.95 + k * 1.5, 8); part(grp, "box", "#3a3d45", 2.52 - k * .3, .06, 3.42 - k * .4, cx, 3.2 + k * 1.5, 8); }
      for (let k = 0; k < 4; k++) for (const dx of [-.6, .6]) {
        const c = part(grp, "cyl", "#2d3038", .5, .06, .5, cx + dx * (k > 1 ? .85 : 1), .8 + k * 1.52, k < 2 ? 10.02 : 9.72 + (k === 3 ? -.2 : 0)); c.rotation.x = Math.PI / 2;
        const d = part(grp, "cyl", "#0c0d10", .24, .08, .24, c.position.x, c.position.y, c.position.z + .01); d.rotation.x = Math.PI / 2;
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
  performers: () => [{ kind: "estadio_fx", orbit: [20, 8, 0, 0, 0], h: 1, x: 0, y: 0, ang: 0, t: 0 }, { kind: "dj", orbit: [20, 8.4, .01, 0, 0], h: 1.8, x: 0, y: 0, ang: Math.PI / 2, t: 0 }],
};
