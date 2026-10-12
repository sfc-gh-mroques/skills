// HTML "screens" registered on quads of the 3D world: the element is mapped onto the four projected
// corners with a homography (matrix3d), so real UI stays crisp while sitting on a monitor in the scene.
import * as THREE from 'three/webgpu';
import { el } from './dom.js';

const p = new THREE.Vector3();

function adj(m) {
  return [
    m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4],
    m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5],
    m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3],
  ];
}
function mul(a, b) {
  const c = new Array(9);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { let s = 0; for (let k = 0; k < 3; k++) s += a[3 * i + k] * b[3 * k + j]; c[3 * i + j] = s; }
  return c;
}
function basis(x1, y1, x2, y2, x3, y3, x4, y4) {
  const m = [x1, x2, x3, y1, y2, y3, 1, 1, 1];
  const a = adj(m);
  const vx = a[0] * x4 + a[1] * y4 + a[2], vy = a[3] * x4 + a[4] * y4 + a[5], vz = a[6] * x4 + a[7] * y4 + a[8];
  return mul(m, [vx, 0, 0, 0, vy, 0, 0, 0, vz]);
}
/** matrix3d mapping a w×h rect (origin top-left) onto quad TL, TR, BR, BL (pixels). */
function homography(w, h, q) {
  const s = basis(0, 0, w, 0, 0, h, w, h);
  const d = basis(q[0].x, q[0].y, q[1].x, q[1].y, q[3].x, q[3].y, q[2].x, q[2].y);
  const t = mul(d, adj(s));
  for (let i = 0; i < 9; i++) t[i] /= t[8];
  return `matrix3d(${t[0]},${t[3]},0,${t[6]},${t[1]},${t[4]},0,${t[7]},0,0,1,0,${t[2]},${t[5]},0,${t[8]})`;
}

export function createScreens(root) {
  const layer = el('div.screens');
  root.append(layer);
  const list = [];
  // Browsers rasterise a perspective-mapped layer at its own CSS size and let the GPU resample it. A layer much
  // larger than its on-screen quad would alias; a smaller one would blur. So each screen is re-laid out at a
  // raster factor f that keeps the layer just above its on-screen size: the UI is always drawn 1:1, as vectors.
  const STEPS = []; for (let f = 0.1; f < 2.6; f *= 2 ** 0.25) STEPS.push(f);
  const setLod = (s, f) => {
    s.f = f;
    s.wrap.style.width = `${(s.lw * f).toFixed(2)}px`; s.wrap.style.height = `${(s.lh * f).toFixed(2)}px`;
    s.wrap.style.setProperty('--f', f.toFixed(4));
    s.content.style.transform = `scale(${f.toFixed(4)})`;
  };
  /** content: element designed for exactly lw × lh CSS px; corners: () => [TL,TR,BR,BL] world Vector3 */
  function add(id, content, lw, lh, corners) {
    const wrap = el('div.screen');
    wrap.dataset.id = id;
    content.style.width = `${lw}px`; content.style.height = `${lh}px`;
    wrap.append(content);
    layer.append(wrap);
    const s = { id, wrap, content, lw, lh, f: 1, corners, s: { o: 0 }, shown: false, q: [0, 1, 2, 3].map(() => ({ x: 0, y: 0 })) };
    setLod(s, 1);
    list.push(s);
    return s;
  }
  function update(camera, w, h) {
    for (const s of list) {
      if (s.s.o < 0.004) { if (s.shown) { s.wrap.style.display = 'none'; s.shown = false; } continue; }
      const cs = typeof s.corners === 'function' ? s.corners() : s.corners;
      let ok = true;
      for (let i = 0; i < 4; i++) {
        p.copy(cs[i]).project(camera);
        if (p.z > 1 || p.z < -1) ok = false;
        s.q[i].x = (p.x * 0.5 + 0.5) * w; s.q[i].y = (-p.y * 0.5 + 0.5) * h;
      }
      if (!ok) { if (s.shown) { s.wrap.style.display = 'none'; s.shown = false; } continue; }
      if (!s.shown) { s.wrap.style.display = 'block'; s.shown = true; }
      const q = s.q;
      const pw = Math.max(Math.hypot(q[1].x - q[0].x, q[1].y - q[0].y), Math.hypot(q[2].x - q[3].x, q[2].y - q[3].y));
      const ph = Math.max(Math.hypot(q[3].x - q[0].x, q[3].y - q[0].y), Math.hypot(q[2].x - q[1].x, q[2].y - q[1].y));
      const ideal = Math.max(pw / s.lw, ph / s.lh);
      if (ideal > s.f || ideal < s.f / 1.5) setLod(s, STEPS.find((f) => f >= ideal * 1.1) ?? STEPS[STEPS.length - 1]);
      s.wrap.style.transform = homography(s.lw * s.f, s.lh * s.f, s.q);
      s.wrap.style.opacity = s.s.o.toFixed(3);
    }
  }
  return { add, update, list };
}
