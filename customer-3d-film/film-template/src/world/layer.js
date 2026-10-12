// The Snowflake layer: one consistent visual metaphor for the whole film.
//   sheet   – a thin luminous plane above the physical world (zones grow and merge into one governed layer)
//   lines   – threads from physical signals up to the layer, relationships inside it, lanes to partners
//   nodes   – where a system or business object meets the layer
//   pulses  – controlled flow along lines
//   signals – the "dozens of disconnected signals" of the opening
import * as THREE from 'three/webgpu';
import { positionWorld, cameraPosition, uniform, float, vec2, vec3, abs, max, min, length, smoothstep, fract, fwidth, clamp, uv, exp, normalize } from 'three/tsl';
import { Line2 } from 'three/addons/lines/webgpu/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';

export const LAYER_Y = 15;
const SNOW = new THREE.Color(0x29b5e8);
const hdr = (hex, k) => new THREE.Color(hex).multiplyScalar(k);

export const ZONES = {
  region: { c: [42, 24], h: [24, 19], site: true },        // la région du client: the heart of the network
  capital: { c: [0, -49], h: [8, 7], site: true },           // Capitale
  country: { c: [-10, -2], h: [102, 100] },               // the whole country, one layer
  brand: { c: [-10, 105.5], h: [40, 7.5] },              // the tab that carries the platform's name
};

function subdivide(pts, step) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], n = Math.max(1, Math.ceil(a.distanceTo(b) / step));
    for (let k = 0; k < n; k++) out.push(a.clone().lerp(b, k / n));
  }
  out.push(pts[pts.length - 1].clone());
  return out;
}

export function buildLayer(E) {
  const group = new THREE.Group();
  group.name = 'snowflake-layer';

  // ── sheet ─────────────────────────────────────────────────────────────────
  const U = {
    opacity: uniform(1), fill: uniform(0.016), grid: uniform(0.5), edge: uniform(1), structure: uniform(0), glow: uniform(0.1), under: uniform(0),
    color: uniform(hdr(0x29b5e8, 1.55)),
    rings: [0, 1, 2].map(() => ({ c: uniform(new THREE.Vector2()), r: uniform(0), s: uniform(0) })),
  };
  const zoneU = {};
  const p = positionWorld.xz;
  const R = float(6);
  const smin = (a, b, k) => { const h = max(float(k).sub(abs(a.sub(b))), 0).div(k); return min(a, b).sub(h.mul(h).mul(k).mul(0.25)); };
  const pxLine = (d, px) => float(1).sub(smoothstep(px * 0.5 - 0.5, px * 0.5 + 0.5, abs(d).div(fwidth(d).max(1e-4))));
  let sd = float(1e4), structure = float(0);
  for (const [name, z] of Object.entries(ZONES)) {
    const grow = uniform(0);
    zoneU[name] = grow;
    const half = vec2(z.h[0], z.h[1]).mul(grow);
    const q = abs(p.sub(vec2(z.c[0], z.c[1]))).sub(half).add(R);
    const d = length(max(q, 0)).add(min(max(q.x, q.y), 0)).sub(R).add(float(1).sub(smoothstep(0, 0.03, grow)).mul(1000));
    sd = smin(sd, d, 12);
    if (z.site) structure = max(structure, pxLine(d, 1.2).mul(smoothstep(0.9, 1.0, grow)));
  }
  const inside = smoothstep(1.0, -1.0, sd);
  const gridLine = (cell) => {
    const c = p.div(cell);
    const fw = fwidth(c);
    const f = abs(fract(c.sub(0.5)).sub(0.5)).div(fw.max(1e-5));
    return float(1).sub(min(min(f.x, f.y), 1)).mul(clamp(float(1).sub(max(fw.x, fw.y).mul(2.2)), 0, 1));
  };
  const grid = gridLine(4).mul(0.035).add(gridLine(20).mul(0.24));
  let rings = float(0);
  for (const r of U.rings) {
    const dr = length(p.sub(r.c)).sub(r.r);
    rings = rings.add(exp(abs(dr).mul(-0.55)).mul(r.s));
  }
  // seen at a grazing angle (or from underneath) the sheet must stay a hairline structure, never a wall of colour
  const facing = abs(normalize(cameraPosition.sub(positionWorld)).y);
  const solid = clamp(facing.mul(1.8), 0.12, 1).mul(float(1).sub(U.under.mul(0.82)));
  const border = pxLine(sd, 1.5).add(exp(sd.negate().max(0).mul(-0.36)).mul(U.glow).mul(inside).mul(solid));
  const alpha = clamp(inside.mul(U.fill.mul(solid).add(grid.mul(U.grid).mul(float(1).sub(U.under.mul(0.45)))).add(rings.mul(solid)).add(structure.mul(U.structure).mul(0.55))).add(border.mul(U.edge)), 0, 1).mul(U.opacity);
  const sheetMat = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  sheetMat.colorNode = U.color;
  sheetMat.opacityNode = alpha;
  sheetMat.fog = false;
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(340, 262).rotateX(-Math.PI / 2), sheetMat);
  sheet.position.set(0, LAYER_Y, -10);
  sheet.renderOrder = 6;
  sheet.frustumCulled = false;
  group.add(sheet);

  // ── lines ─────────────────────────────────────────────────────────────────
  // Each kind of source connects with its own behaviour (never one generic blue line):
  //   app  – enterprise applications: clean solid connector
  //   ot   – MES / SCADA / historians: continuous operational stream (flowing dashes)
  //   iot  – sensors: faint carrier, live pulses do the talking
  //   file – documents / files: dotted, discrete ingestion events
  //   prism– Apache Iceberg: open-table access in place (a frame, nothing flows)
  const GROUPS = {
    stub: { color: hdr(0xd9dee3, 0.9), width: 1.1 },
    app: { color: hdr(0x29b5e8, 2.3), width: 1.7 },
    ot: { color: hdr(0x29b5e8, 2.7), width: 1.9, dashed: true, dash: 0.5, gap: 0.34, flow: 1.9 },
    iot: { color: hdr(0x29b5e8, 1.3), width: 1.0 },
    file: { color: hdr(0xe2f1f8, 1.7), width: 1.5, dashed: true, dash: 0.16, gap: 0.5, flow: 0 },
    prism: { color: hdr(0x7fd6f5, 1.3), width: 1.1 },
    ctx: { color: hdr(0x29b5e8, 3.2), width: 2.7 },
    risk: { color: hdr(0xf2a33a, 3.4), width: 2.6 },
    ok: { color: hdr(0x37c98b, 2.8), width: 2.2 },
    lane: { color: hdr(0x29b5e8, 3.2), width: 3.6, scaled: true },
    laneGlow: { color: hdr(0x29b5e8, 0.5), width: 14, follow: 'lane', scaled: true },
    zone: { color: hdr(0xffffff, 1.15), width: 1.7 },
    old: { color: hdr(0x9aa3ad, 0.9), width: 1.2, dashed: true, dash: 1.6, gap: 1.3 },
    option: { color: hdr(0xffffff, 1.9), width: 1.9, dashed: true, dash: 1.0, gap: 0.7, flow: 3 },
    market: { color: hdr(0x29b5e8, 3.0), width: 2.6, scaled: true },
    marketGlow: { color: hdr(0x29b5e8, 0.5), width: 11, follow: 'market', scaled: true },
  };
  const groups = {};
  for (const [name, g] of Object.entries(GROUPS)) {
    const op = uniform(1);
    const mat = new THREE.Line2NodeMaterial({ color: g.color, linewidth: g.width, dashed: !!g.dashed, dashSize: g.dash ?? 1, gapSize: g.gap ?? 1, alphaToCoverage: false });
    mat.transparent = false;
    mat.blending = THREE.AdditiveBlending;
    mat.depthWrite = false;
    mat.fog = false;
    mat.opacityNode = op.mul(smoothstep(1.0, 0.25, uv().x.abs()));
    groups[name] = { mat, op, width: g.width, flow: g.flow ?? 0, follow: g.follow ?? null, scaled: !!g.scaled, lines: [] };
  }
  const lines = {};
  /** Register a polyline. pts: Vector3[]; drive: optional (S) => reveal 0..1 (otherwise S.L[key]). */
  function line(key, groupName, pts, { step = 1.6, drive = null } = {}) {
    const sub = subdivide(pts, step);
    const flat = [];
    for (const v of sub) flat.push(v.x, v.y, v.z);
    const geo = new LineGeometry();
    geo.setPositions(flat);
    const g = groups[groupName];
    const obj = new Line2(geo, g.mat);
    if (GROUPS[groupName].dashed) obj.computeLineDistances();
    obj.frustumCulled = false;
    obj.renderOrder = 10;
    obj.visible = false;
    group.add(obj);
    const rec = { key, obj, geo, segs: sub.length - 1, pts: sub, drive, group: groupName, len: 0, cum: [0] };
    for (let i = 1; i < sub.length; i++) { rec.len += sub[i].distanceTo(sub[i - 1]); rec.cum.push(rec.len); }
    lines[key] = rec;
    g.lines.push(rec);
    return rec;
  }

  // ── nodes on the layer ────────────────────────────────────────────────────
  const nodeMat = new THREE.MeshBasicMaterial({ color: hdr(0x29b5e8, 3.0), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
  const nodeMatRisk = new THREE.MeshBasicMaterial({ color: hdr(0xf2a33a, 4), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
  const ringGeo = new THREE.RingGeometry(0.62, 0.9, 40).rotateX(-Math.PI / 2);
  const dotGeo = new THREE.CircleGeometry(0.3, 24).rotateX(-Math.PI / 2);
  const nodes = {};
  function node(key, x, z, size = 1) {
    const g = new THREE.Group();
    const ring = new THREE.Mesh(ringGeo, nodeMat), dot = new THREE.Mesh(dotGeo, nodeMat);
    g.add(ring, dot);
    g.position.set(x, LAYER_Y + 0.02, z);
    g.renderOrder = 11; ring.renderOrder = 11; dot.renderOrder = 11;
    g.visible = false;
    group.add(g);
    nodes[key] = { g, ring, dot, size, pos: new THREE.Vector3(x, LAYER_Y, z) };
    return nodes[key];
  }

  // ── signal points ─────────────────────────────────────────────────────────
  const sigGeo = new THREE.SphereGeometry(1, 12, 8);
  const sigMat = new THREE.MeshBasicMaterial({ color: hdr(0xffffff, 1.7), fog: false });
  const sigMatRisk = new THREE.MeshBasicMaterial({ color: hdr(0xf2a33a, 3.4), fog: false });
  const signals = [];
  let sigMesh = null, sigMeshRisk = null;
  /** Register a signal point. cls: 'IT' | 'OT' | 'IoT' | 'EXT'. */
  function signal(pos, cls, { risk = false, size = 0.22, stub = 2.2, sweep = null } = {}) {
    const i = signals.length;
    const top = pos.clone(); top.y += stub;
    const delay = ((i * 0.618034) % 1);
    const rec = { i, pos, cls, risk, size, delay, top };
    signals.push(rec);
    line(`stub_${i}`, 'stub', [pos, top], { step: 0.5, drive: (S) => clamp01((S.sig * 1.6 - delay) / 0.6) });
    const kind = { IT: 'app', OT: 'ot', IoT: 'iot', EXT: 'lane' }[cls] ?? 'app';
    line(`sig_${i}`, kind, [top, new THREE.Vector3(pos.x, LAYER_Y, pos.z)], { step: 0.9, drive: sweep ?? ((S) => clamp01(((S.connect[cls] ?? 0) * 1.7 - delay) / 0.7)) });
    return rec;
  }
  function finalizeSignals() {
    const normal = signals.filter((s) => !s.risk), risky = signals.filter((s) => s.risk);
    sigMesh = new THREE.InstancedMesh(sigGeo, sigMat, normal.length);
    sigMeshRisk = new THREE.InstancedMesh(sigGeo, sigMatRisk, Math.max(1, risky.length));
    for (const m of [sigMesh, sigMeshRisk]) { m.frustumCulled = false; m.renderOrder = 9; group.add(m); }
    sigMesh.userData.list = normal; sigMeshRisk.userData.list = risky;
  }

  // ── pulses ────────────────────────────────────────────────────────────────
  const pulseGeo = new THREE.SphereGeometry(1, 10, 8), packetGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const pulseSets = {};
  /**
   * A set of bright points travelling along registered lines.
   * dir: +1 / −1; stepped: N → discrete hops (file ingestion events); jitter: irregular spacing (live sensor signals)
   */
  function pulses(name, keys, { count = 2, speed = 9, size = 0.38, color = hdr(0xbfeaff, 4.2), dir = 1, stepped = 0, jitter = 0 } = {}) {
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
    const mesh = new THREE.InstancedMesh(stepped ? packetGeo : pulseGeo, mat, keys.length * count);
    mesh.frustumCulled = false; mesh.renderOrder = 12; mesh.visible = false;
    group.add(mesh);
    const phase = keys.map((k, i) => (jitter ? ((i * 0.754877) % 1) * jitter : 0));
    pulseSets[name] = { mesh, keys, count, speed, size, dir, stepped, phase };
  }

  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const m4 = new THREE.Matrix4(), v3 = new THREE.Vector3(), zeroM = new THREE.Matrix4().makeScale(0, 0, 0);
  const pointAt = (rec, d, out) => {
    const cum = rec.cum;
    let lo = 0, hi = cum.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (cum[mid] <= d) lo = mid; else hi = mid; }
    const t = (d - cum[lo]) / Math.max(1e-6, cum[hi] - cum[lo]);
    return out.copy(rec.pts[lo]).lerp(rec.pts[hi], clamp01(t));
  };

  /** Fields the film state needs for this layer. */
  function defaults() {
    const S = {
      sheet: 0, fill: 0.016, grid: 0.5, edge: 1, structure: 0, glow: 0.1,
      sig: 0, sigDim: 1, sweep: -400, connect: { IT: 0, OT: 0, IoT: 0, EXT: 0 },
      Z: {}, L: {}, N: {}, P: {}, G: {}, R: [{ x: 0, z: 0, r: 0, s: 0 }, { x: 0, z: 0, r: 0, s: 0 }, { x: 0, z: 0, r: 0, s: 0 }],
    };
    for (const k of Object.keys(ZONES)) S.Z[k] = 0;
    for (const [k, rec] of Object.entries(lines)) if (!rec.drive) S.L[k] = 0;
    for (const k of Object.keys(nodes)) S.N[k] = 0;
    for (const k of Object.keys(pulseSets)) S.P[k] = 0;
    for (const k of Object.keys(groups)) S.G[k] = 1;
    return S;
  }

  function apply(S, time, pixelRatio, cam, stageWidth = 960) {
    const wide = Math.min(2.6, Math.max(1, stageWidth / 960));     // 'scaled' groups: constant weight relative to the frame
    U.under.value = cam.y < LAYER_Y ? 1 : 0;
    U.opacity.value = S.sheet; U.fill.value = S.fill; U.grid.value = S.grid; U.edge.value = S.edge; U.structure.value = S.structure; U.glow.value = S.glow;
    sheet.visible = S.sheet > 0.002;
    for (const k of Object.keys(ZONES)) zoneU[k].value = S.Z[k];
    S.R.forEach((r, i) => { U.rings[i].c.value.set(r.x, r.z); U.rings[i].r.value = r.r; U.rings[i].s.value = r.s; });
    const gv = (name) => S.G[groups[name].follow ?? name];
    for (const [name, g] of Object.entries(groups)) { g.op.value = gv(name); g.mat.linewidth = g.width * pixelRatio * (g.scaled ? wide : 1); if (g.flow) g.mat.dashOffset = -time * g.flow; }
    for (const rec of Object.values(lines)) {
      const r = rec.drive ? rec.drive(S) : S.L[rec.key];
      const n = Math.round(rec.segs * clamp01(r));
      rec.obj.visible = n > 0 && gv(rec.group) > 0.003;
      if (n > 0) rec.geo.instanceCount = n;
    }
    for (const [k, n] of Object.entries(nodes)) {
      const s = S.N[k];
      n.g.visible = s > 0.003;
      if (s > 0.003) {
        const breathe = 1 + 0.06 * Math.sin(time * 2.2 + n.pos.x * 0.3);
        n.g.scale.setScalar(n.size * s * breathe);
      }
    }
    // signals: appear with a stagger, pulse faintly
    for (const mesh of [sigMesh, sigMeshRisk]) {
      if (!mesh) continue;
      const list = mesh.userData.list;
      mesh.visible = S.sig > 0.002 && list.length > 0;
      if (!mesh.visible) continue;
      list.forEach((s, i) => {
        const a = clamp01((S.sig * 1.6 - s.delay) / 0.35) * S.sigDim;
        const near = Math.min(4.2, Math.max(0.3, cam.distanceTo(s.pos) / 70));
        const k = s.size * near * a * (1 + 0.18 * Math.sin(time * 3 + s.i * 1.7));
        m4.makeScale(k, k, k).setPosition(s.pos);
        mesh.setMatrixAt(i, a > 0 ? m4 : zeroM);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
    // pulses
    for (const [name, ps] of Object.entries(pulseSets)) {
      const a = S.P[name];
      ps.mesh.visible = a > 0.003;
      if (!ps.mesh.visible) continue;
      let idx = 0;
      for (let ki = 0; ki < ps.keys.length; ki++) {
        const key = ps.keys[ki];
        const rec = lines[key];
        const shown = rec.drive ? rec.drive(S) : S.L[key];
        for (let c = 0; c < ps.count; c++) {
          let u = ((time * ps.speed) / Math.max(1, rec.len) + c / ps.count + ps.phase[ki]) % 1;
          if (ps.stepped) u = Math.floor(u * ps.stepped) / ps.stepped;
          if (ps.dir < 0) u = 1 - u;
          const vis = u <= shown ? Math.sin(Math.PI * u) : 0;
          const k0 = ps.size * a * Math.min(1, vis * 3);
          if (k0 > 0.001) { pointAt(rec, u * rec.len, v3); const k = k0 * Math.min(2.6, Math.max(0.35, cam.distanceTo(v3) / 90)); m4.makeScale(k, k, k).setPosition(v3); ps.mesh.setMatrixAt(idx, m4); } else ps.mesh.setMatrixAt(idx, zeroM);
          idx++;
        }
      }
      ps.mesh.instanceMatrix.needsUpdate = true;
    }
  }

  return { group, line, node, signal, finalizeSignals, pulses, defaults, apply, lines, nodes, signals, ZONES, groups };
}
