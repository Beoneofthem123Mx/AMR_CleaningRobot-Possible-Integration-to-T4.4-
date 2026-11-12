// Human Tsunami · post-processing: HDR bloom, tilt-shift "miniature" focus, vignette and color grade.
// Everything is drawn into an HDR target first, then composited with ACES tone mapping.
const POST = { on: true, ready: false, w: 0, h: 0, rt: {}, mat: {}, quad: null, cam: null, scn: null, dof: .4, bloom: .6 };

function postMat(frag, uniforms) {
  return new THREE.ShaderMaterial({ uniforms, depthTest: false, depthWrite: false,
    vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }", fragmentShader: frag });
}
function initPost() {
  try {
    POST.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); POST.scn = new THREE.Scene();
    POST.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)); POST.quad.frustumCulled = false; POST.scn.add(POST.quad);
    POST.mat.copy = postMat(`uniform sampler2D t; uniform vec2 px; varying vec2 vUv;
      void main() { vec3 c = texture2D(t, vUv + px * vec2(-.5, -.5)).rgb + texture2D(t, vUv + px * vec2(.5, -.5)).rgb + texture2D(t, vUv + px * vec2(-.5, .5)).rgb + texture2D(t, vUv + px * vec2(.5, .5)).rgb;
        gl_FragColor = vec4(c * .25, 1.); }`, { t: { value: null }, px: { value: new THREE.Vector2() } });
    POST.mat.bright = postMat(`uniform sampler2D t; uniform float thr; varying vec2 vUv;
      void main() { vec3 c = texture2D(t, vUv).rgb; float l = max(c.r, max(c.g, c.b));
        float s = max(0., l - thr) / max(l, 1e-4); gl_FragColor = vec4(c * s, 1.); }`,
      { t: { value: null }, thr: { value: 1 } });
    POST.mat.blur = postMat(`uniform sampler2D t; uniform vec2 dir; varying vec2 vUv;
      void main() { vec3 c = texture2D(t, vUv).rgb * .2270270;
        c += (texture2D(t, vUv + dir * 1.3846154).rgb + texture2D(t, vUv - dir * 1.3846154).rgb) * .3162162;
        c += (texture2D(t, vUv + dir * 3.2307692).rgb + texture2D(t, vUv - dir * 3.2307692).rgb) * .0702703;
        gl_FragColor = vec4(c, 1.); }`, { t: { value: null }, dir: { value: new THREE.Vector2() } });
    POST.mat.comp = postMat(`uniform sampler2D tS, tD, tB0, tB1, tB2, tZ; uniform float bloom, dof, focus, vig, sat, warm, ca, ao, near, far; uniform vec2 px; varying vec2 vUv;
      float viewZ(vec2 uv) { float z = texture2D(tZ, uv).x * 2. - 1.; return 2. * near * far / (far + near - z * (far - near)); }
      void main() {
        // chromatic aberration on impacts: red and blue slide apart from the center
        vec2 off = (vUv - .5) * ca;
        vec3 c = vec3(texture2D(tS, vUv + off).r, texture2D(tS, vUv).g, texture2D(tS, vUv - off).b);
        // contact shading from the depth buffer: whatever sits lower than its neighbours gets darker, so people pop off the floor
        if (ao > 0.) {
          float z0 = viewZ(vUv), occ = 0.;
          for (int i = 0; i < 8; i++) {
            float a = float(i) * .7854; vec2 d = vec2(cos(a), sin(a)) * px * (i - (i / 2) * 2 == 0 ? 2.5 : 5.);
            occ += clamp((z0 - viewZ(vUv + d)) / .9, 0., 1.);
          }
          c *= 1. - ao * min(1., occ / 4.5);
        }
        float d = abs(vUv.y - focus); c = mix(c, texture2D(tD, vUv).rgb, smoothstep(.16, .5, d) * dof);
        c += (texture2D(tB0, vUv).rgb * .55 + texture2D(tB1, vUv).rgb * .75 + texture2D(tB2, vUv).rgb) * bloom;
        float l = dot(c, vec3(.2126, .7152, .0722)); c = mix(vec3(l), c, sat); c = pow(c, vec3(1.07)) * 1.03;
        c *= vec3(1. + warm, 1., 1. - warm);
        { float lum = dot(c, vec3(.2126, .7152, .0722));   // split tone: teal-ish shadows, warm highlights (a gentle film look)
          c += mix(vec3(-.012, .004, .022), vec3(.02, .008, -.016), smoothstep(.15, .8, lum)); }
        vec2 q = vUv - .5; c *= 1. - vig * dot(q, q) * 1.8;
        gl_FragColor = vec4(max(c, 0.), 1.);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
        gl_FragColor.rgb += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - .5) / 255.;  // dither against banding
      }`, { tS: { value: null }, tD: { value: null }, tB0: { value: null }, tB1: { value: null }, tB2: { value: null }, tZ: { value: null },
        ca: { value: 0 }, ao: { value: 0 }, near: { value: 1 }, far: { value: 500 }, px: { value: new THREE.Vector2() },
        bloom: { value: .6 }, dof: { value: .4 }, focus: { value: .5 }, vig: { value: .35 }, sat: { value: 1.12 }, warm: { value: .02 } });
    POST.ready = true;
  } catch (e) { POST.on = false; }
}
function postTargets(w, h) {
  for (const k in POST.rt) POST.rt[k].dispose();
  const isGL2 = G3.renderer.capabilities.isWebGL2;
  const mk = (s, extra) => new THREE.WebGLRenderTarget(Math.max(1, Math.round(w / s)), Math.max(1, Math.round(h / s)),
    Object.assign({ type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false }, extra || {}));
  let depth = null;
  if (isGL2) { depth = new THREE.DepthTexture(w, h); depth.type = THREE.UnsignedIntType; depth.minFilter = depth.magFilter = THREE.NearestFilter; }
  POST.hasDepth = !!depth;
  POST.rt = { scene: mk(1, { depthBuffer: true, samples: isGL2 ? 4 : 0, depthTexture: depth }), d0: mk(2), d1: mk(2), b0: mk(4), b0t: mk(4), b1: mk(8), b1t: mk(8), b2: mk(16), b2t: mk(16) };
  POST.w = w; POST.h = h;
}
function postPass(mat, target) { POST.quad.material = mat; G3.renderer.setRenderTarget(target); G3.renderer.render(POST.scn, POST.cam); }
function postBlur(src, tmp, spread) {
  const m = POST.mat.blur;
  m.uniforms.t.value = src.texture; m.uniforms.dir.value.set(spread / src.width, 0); postPass(m, tmp);
  m.uniforms.t.value = tmp.texture; m.uniforms.dir.value.set(0, spread / src.height); postPass(m, src);
}
function postDown(src, dst, bright) {
  const m = bright ? POST.mat.bright : POST.mat.copy;
  m.uniforms.t.value = src.texture; if (!bright) m.uniforms.px.value.set(1 / src.width, 1 / src.height);
  postPass(m, dst);
}
// how strong each effect is right now: night scenes glow more, the slow-motion replay focuses harder
function postLook() {
  const night = !!scene.night, live = phase === "show" || phase === "evac";
  const slow = typeof slowT !== "undefined" && slowT > 0;
  POST.bloom += ((night ? 1.7 : .8) + (typeof black !== "undefined" ? black * .6 : 0) - POST.bloom) * .1;
  POST.dof += ((slow ? .95 : live ? .6 : .3) - POST.dof) * .08;
  const c = POST.mat.comp.uniforms;
  c.bloom.value = POST.bloom; c.dof.value = POST.dof; c.vig.value = night ? .3 : .26; c.sat.value = night ? 1.15 : 1.12; c.warm.value = night ? 0 : .025;
  POST.mat.bright.uniforms.thr.value = night ? (typeof cine !== "undefined" && cine > .01 ? .75 : .42) : 2.0;   // the street camera is close to lit windows: less glow
}
function renderFrame() {
  const r = G3.renderer;
  if (!POST.on || !POST.ready) { r.setRenderTarget(null); r.render(G3.scene, G3.camera); return; }
  const v = r.getDrawingBufferSize(new THREE.Vector2());
  if (v.x !== POST.w || v.y !== POST.h) postTargets(v.x, v.y);
  const T = POST.rt;
  r.setRenderTarget(T.scene); r.render(G3.scene, G3.camera);
  postLook();
  postDown(T.scene, T.d0); postBlur(T.d0, T.d1, 1.4);       // soft copy for the tilt-shift blur
  postDown(T.d0, T.b0, true); postBlur(T.b0, T.b0t, 1);     // bright parts, three sizes of glow
  postDown(T.b0, T.b1); postBlur(T.b1, T.b1t, 1);
  postDown(T.b1, T.b2); postBlur(T.b2, T.b2t, 1);
  const c = POST.mat.comp.uniforms;
  c.tZ.value = T.scene.depthTexture; c.ao.value = POST.hasDepth ? (scene.night ? .42 : .5) : 0; c.px.value.set(1 / v.x, 1 / v.y);
  c.near.value = G3.camera.near; c.far.value = G3.camera.far;
  c.ca.value = Math.min(.003, (typeof shake !== "undefined" ? shake : 0) * .003 + (typeof flash !== "undefined" ? flash : 0) * .0015);
  c.tS.value = T.scene.texture; c.tD.value = T.d0.texture; c.tB0.value = T.b0.texture; c.tB1.value = T.b1.texture; c.tB2.value = T.b2.texture;
  postPass(POST.mat.comp, null);
}
