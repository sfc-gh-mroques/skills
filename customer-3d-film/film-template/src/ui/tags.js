// Labels anchored to points of the 3D world (system plates, business objects, zones).
// Each tag has a state object { o: opacity, s: scale, lift: extra leader height } animated by the timeline.
import * as THREE from 'three/webgpu';
import { el } from './dom.js';

const v = new THREE.Vector3();
const KEYS = ['plug', 'lit', 'mask', 'alt', 'conn', 'link'];

export function createTags(root) {
  const layer = el('div.tags');
  root.append(layer);
  const list = [];
  /**
   * @param {string} id
   * @param {HTMLElement} body content element
   * @param {THREE.Vector3|Function} anchor world position (or getter)
   * @param {object} opt leader: em height of the leader line; dx: em shift; side: 'up' | 'down'; cls
   */
  function add(id, body, anchor, { leader = 3, dx = 0, cls = '', side = 'up', dot = true } = {}) {
    const wrap = el(`div.tag${cls ? '.' + cls : ''}`);
    const inner = el('div.tag-in');
    const stem = el('div.tag-stem');
    inner.append(body);
    if (leader > 0) inner.append(stem);
    if (dot && leader > 0) inner.append(el('div.tag-dot'));
    wrap.append(inner);
    wrap.dataset.side = side;
    wrap.style.setProperty('--leader', `${leader}em`);
    wrap.style.setProperty('--dx', `${dx}em`);
    layer.append(wrap);
    const t = { id, wrap, inner, body, anchor, s: { o: 0, k: 1, plug: 0, lit: 0, mask: 0, alt: 0, conn: 0, link: 0 }, c: { plug: -1, lit: -1, mask: -1, alt: -1, conn: -1, link: -1 }, shown: false, x: 0, y: 0, behind: false };
    list.push(t);
    return t;
  }
  const byId = (id) => list.find((t) => t.id === id);

  /** occluder: optional {x0,x1,y0,y1} in stage fractions where tags must hide (e.g. the VP silhouette). */
  function update(camera, w, h, occluder = null) {
    for (const t of list) {
      const o = t.s.o;
      if (o < 0.004) { if (t.shown) { t.wrap.style.display = 'none'; t.shown = false; } continue; }
      const a = typeof t.anchor === 'function' ? t.anchor(camera) : t.anchor;
      v.copy(a).project(camera);
      const behind = v.z > 1 || v.z < -1;
      const x = (v.x * 0.5 + 0.5) * w, y = (-v.y * 0.5 + 0.5) * h;
      let hide = behind;
      if (!hide && occluder) { const fx = x / w, fy = y / h; hide = fx > occluder.x0 && fx < occluder.x1 && fy > occluder.y0 && fy < occluder.y1; }
      if (hide) { if (t.shown) { t.wrap.style.display = 'none'; t.shown = false; } continue; }
      if (!t.shown) { t.wrap.style.display = 'block'; t.shown = true; }
      t.x = x; t.y = y;
      t.wrap.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      t.inner.style.opacity = o.toFixed(3);
      t.inner.style.setProperty('--k', t.s.k.toFixed(3));
      for (const key of KEYS) {
        const val = t.s[key];
        if (Math.abs(val - t.c[key]) > 0.004) { t.c[key] = val; t.wrap.style.setProperty(`--${key}`, val.toFixed(3)); }
      }
    }
  }
  return { add, byId, update, list, layer };
}
