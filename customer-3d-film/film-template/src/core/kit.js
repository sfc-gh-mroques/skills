// Modelling kit: a merging builder + small geometric helpers.
// Everything static goes through Builder so each zone ends up as one mesh per material.
import * as THREE from 'three/webgpu';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

const _e = new THREE.Euler();
const _q = new THREE.Quaternion();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
/** Compose a matrix from position / euler rotation / scale. */
export function M(x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) {
  _e.set(rx, ry, rz, 'XYZ');
  _q.setFromEuler(_e);
  return new THREE.Matrix4().compose(_p.set(x, y, z), _q, _s.set(sx, sy, sz));
}

/** Deterministic RNG (mulberry32). */
export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const cache = new Map();
function cached(key, make) {
  let g = cache.get(key);
  if (!g) {
    g = make();
    if (!g.index) g = mergeVertices(g, 1e-5);
    cache.set(key, g);
  }
  return g;
}
const r4 = (n) => Math.round(n * 10000) / 10000;

export const G = {
  box: (w, h, d) => cached(`b|${r4(w)}|${r4(h)}|${r4(d)}`, () => new THREE.BoxGeometry(w, h, d)),
  rbox: (w, h, d, r = 0.02, seg = 2) =>
    cached(`rb|${r4(w)}|${r4(h)}|${r4(d)}|${r4(r)}|${seg}`, () => new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4))),
  cyl: (rt, rb, h, seg = 24, open = false) =>
    cached(`c|${r4(rt)}|${r4(rb)}|${r4(h)}|${seg}|${open}`, () => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open)),
  sphere: (r, ws = 24, hs = 16, phiS = 0, phiL = Math.PI * 2, thS = 0, thL = Math.PI) =>
    cached(`s|${r4(r)}|${ws}|${hs}|${r4(phiS)}|${r4(phiL)}|${r4(thS)}|${r4(thL)}`, () => new THREE.SphereGeometry(r, ws, hs, phiS, phiL, thS, thL)),
  torus: (R, r, rs = 10, ts = 32, arc = Math.PI * 2) => cached(`t|${r4(R)}|${r4(r)}|${rs}|${ts}|${r4(arc)}`, () => new THREE.TorusGeometry(R, r, rs, ts, arc)),
  capsule: (r, len, cs = 6, rs = 14) => cached(`cap|${r4(r)}|${r4(len)}|${cs}|${rs}`, () => new THREE.CapsuleGeometry(r, len, cs, rs)),
  plane: (w, h) => cached(`p|${r4(w)}|${r4(h)}`, () => new THREE.PlaneGeometry(w, h)),
  ring: (ri, ro, seg = 48) => cached(`r|${r4(ri)}|${r4(ro)}|${seg}`, () => new THREE.RingGeometry(ri, ro, seg)),
  /** Surface of revolution from a [[r,y],...] profile. Not cached (profiles are unique). */
  lathe: (profile, seg = 48) => new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg),
  /** Extrusion of a 2D outline [[x,y],...] along z by depth. */
  extrude: (outline, depth, bevel = 0) => {
    const sh = new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x, y)));
    const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments: 12 });
    return mergeVertices(g, 1e-5);
  },
};

const UP = new THREE.Vector3(0, 1, 0);
/** Matrix placing a unit-Y cylinder between two points. */
export function between(a, b) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const q = new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize());
  const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
  return { m: new THREE.Matrix4().compose(mid, q, new THREE.Vector3(1, 1, 1)), len };
}

export class Builder {
  constructor() {
    this.buckets = new Map();
    this.inst = new Map();
  }
  /** Add any geometry with a world matrix. */
  add(mat, geometry, m) {
    const g = geometry.clone();
    if (m) g.applyMatrix4(m);
    let b = this.buckets.get(mat);
    if (!b) this.buckets.set(mat, (b = []));
    b.push(g);
    return this;
  }
  box(mat, w, h, d, x, y, z, rx = 0, ry = 0, rz = 0) { return this.add(mat, G.box(w, h, d), M(x, y, z, rx, ry, rz)); }
  rbox(mat, w, h, d, x, y, z, r = 0.02, rx = 0, ry = 0, rz = 0) { return this.add(mat, G.rbox(w, h, d, r), M(x, y, z, rx, ry, rz)); }
  /** Cylinder along an axis ('y' default, 'x' or 'z'). */
  cyl(mat, r, h, x, y, z, axis = 'y', seg = 24, rTop = r) {
    const rx = axis === 'z' ? Math.PI / 2 : 0;
    const rz = axis === 'x' ? Math.PI / 2 : 0;
    return this.add(mat, G.cyl(rTop, r, h, seg), M(x, y, z, rx, 0, rz));
  }
  sphere(mat, r, x, y, z, sx = 1, sy = 1, sz = 1, ws = 24, hs = 16) { return this.add(mat, G.sphere(r, ws, hs), M(x, y, z, 0, 0, 0, sx, sy, sz)); }
  /** Straight rod between two points. */
  rod(mat, a, b, r, seg = 10) {
    const { m, len } = between(a, b);
    return this.add(mat, G.cyl(r, r, len, seg), m);
  }
  /** Pipe along a polyline with rounded elbows. pts: Vector3[] */
  pipe(mat, pts, r, bend = r * 2.2, seg = 14) {
    const n = pts.length;
    const ends = [];
    for (let i = 0; i < n; i++) {
      if (i === 0 || i === n - 1) { ends.push([pts[i].clone(), pts[i].clone()]); continue; }
      const dIn = new THREE.Vector3().subVectors(pts[i - 1], pts[i]);
      const dOut = new THREE.Vector3().subVectors(pts[i + 1], pts[i]);
      const bIn = Math.min(bend, dIn.length() * 0.45), bOut = Math.min(bend, dOut.length() * 0.45);
      const a = pts[i].clone().addScaledVector(dIn.normalize(), bIn);
      const c = pts[i].clone().addScaledVector(dOut.normalize(), bOut);
      ends.push([a, c]);
      const curve = new THREE.QuadraticBezierCurve3(a, pts[i], c);
      this.add(mat, new THREE.TubeGeometry(curve, 8, r, seg, false));
    }
    for (let i = 0; i < n - 1; i++) {
      const a = ends[i][1], b = ends[i + 1][0];
      if (a.distanceTo(b) > 1e-4) this.rod(mat, a, b, r, seg);
    }
    return this;
  }
  /** Box whose UVs are projected from world position (su, sv = metres per texture tile). */
  boxUV(mat, w, h, d, x, y, z, su = 1, sv = su) {
    const g = G.box(w, h, d).clone();
    g.applyMatrix4(M(x, y, z));
    projUV(g, su, sv);
    let b = this.buckets.get(mat);
    if (!b) this.buckets.set(mat, (b = []));
    b.push(g);
    return this;
  }
  /** Register one instance of an instanced part. */
  instance(key, geometry, mat, m, color) {
    let rec = this.inst.get(key);
    if (!rec) this.inst.set(key, (rec = { geometry, mat, ms: [], colors: [] }));
    rec.ms.push(m);
    if (color !== undefined) rec.colors.push(color);
    return this;
  }
  /** Merge everything into a Group: one mesh per material. */
  build(name, { cast = true, receive = true } = {}) {
    const group = new THREE.Group();
    group.name = name;
    for (const [mat, list] of this.buckets) {
      const merged = mergeGeometries(list, false);
      if (!merged) { console.warn('merge failed', name, mat.name); continue; }
      for (const g of list) g.dispose();
      const mesh = new THREE.Mesh(merged, mat);
      mesh.name = `${name}:${mat.name || 'mat'}`;
      mesh.castShadow = cast && !mat.userData.noCast;
      mesh.receiveShadow = receive && !mat.userData.noReceive;
      if (mat.transparent) mesh.renderOrder = mat.userData.order ?? 2;
      group.add(mesh);
    }
    for (const [key, rec] of this.inst) {
      const im = new THREE.InstancedMesh(rec.geometry, rec.mat, rec.ms.length);
      im.name = `${name}:inst:${key}`;
      rec.ms.forEach((m, i) => im.setMatrixAt(i, m));
      if (rec.colors.length === rec.ms.length) rec.colors.forEach((c, i) => im.setColorAt(i, new THREE.Color(c)));
      im.instanceMatrix.needsUpdate = true;
      im.castShadow = cast && !rec.mat.userData.noCast;
      im.receiveShadow = receive && !rec.mat.userData.noReceive;
      im.computeBoundingSphere();
      group.add(im);
    }
    this.buckets.clear();
    this.inst.clear();
    return group;
  }
}

/** Planar UV projection from position (dominant normal axis), su/sv in metres per tile. */
export function projUV(geometry, su = 1, sv = su) {
  const pos = geometry.attributes.position, nor = geometry.attributes.normal, uv = geometry.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const nx = Math.abs(nor.getX(i)), ny = Math.abs(nor.getY(i)), nz = Math.abs(nor.getZ(i));
    let u, v;
    if (ny >= nx && ny >= nz) { u = pos.getX(i) / su; v = pos.getZ(i) / sv; }
    else if (nx >= nz) { u = pos.getZ(i) / su; v = pos.getY(i) / sv; }
    else { u = pos.getX(i) / su; v = pos.getY(i) / sv; }
    uv.setXY(i, u, v);
  }
  return geometry;
}

/** Standalone mesh helper for dynamic parts. */
export function mesh(geometry, mat, x = 0, y = 0, z = 0, { cast = true, receive = true } = {}) {
  const m = new THREE.Mesh(geometry, mat);
  m.position.set(x, y, z);
  m.castShadow = cast;
  m.receiveShadow = receive;
  return m;
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp01 = (t) => Math.min(1, Math.max(0, t));
export const smooth = (t) => { t = clamp01(t); return t * t * (3 - 2 * t); };
/** 0→1 ramp between two times. */
export const ramp = (t, a, b) => clamp01((t - a) / (b - a));
