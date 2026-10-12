// The room around the operations table, and the "experience desk": one monitor, a laptop, a tablet and two
// phones. Everything is modelled at human scale (metres) and multiplied by K, so the enterprise reads as a
// model on a table. The device displays are HTML layers registered on the quads returned here.
import * as THREE from 'three/webgpu';
import { Builder, G, M } from '../core/kit.js';
import { makeCanvas, toTex } from '../core/tex.js';

export const K = 80;          // 1 m of "room" = 80 world units
export const FLOOR_Y = -72;   // table top (y = 0) sits 0.9 m above the room floor
export const DESK_TOP = 1.02; // height of the experience desk (m)

/** Rounded-rectangle outline, counter-clockwise, centred on the origin. */
function rrect(w, h, r, n = 7) {
  const pts = [];
  const cs = [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, 90], [-w / 2 + r, -h / 2 + r, 180], [w / 2 - r, -h / 2 + r, 270]];
  for (const [cx, cy, a0] of cs) for (let i = 0; i <= n; i++) { const a = ((a0 + (i / n) * 90) * Math.PI) / 180; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return pts;
}
/** A thin rounded slab in the XY plane of matrix m: front face at z = 0, body towards −z. */
function slab(b, mat, w, h, t, r, m, bevel = 0) {
  const g = G.extrude(rrect(w - bevel * 2, h - bevel * 2, Math.max(0.0005, r - bevel)), Math.max(0.0002, t - bevel * 2), bevel);
  b.add(mat, g, m.clone().multiply(M(0, 0, -(t - bevel))));
}
const quad = (m, w, h, cy = 0, z = 0.0004) => [[-w / 2, h / 2 + cy], [w / 2, h / 2 + cy], [w / 2, -h / 2 + cy], [-w / 2, -h / 2 + cy]].map(([x, y]) => new THREE.Vector3(x, y, z).applyMatrix4(m));

/** A laptop keyboard, drawn once: six rows of keys in a dark well. */
function keyboardMaterial() {
  const [c, g] = makeCanvas(1024, 420);
  g.fillStyle = '#08090b'; g.fillRect(0, 0, 1024, 420);
  const key = (x, y, w, h) => { g.fillStyle = '#1c1e22'; g.beginPath(); g.roundRect(x, y, w, h, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,0.07)'; g.fillRect(x + 6, y + 2, w - 12, 1.5); };
  const rows = [
    { y: 10, h: 38, keys: Array(14).fill(1) },
    { y: 58, h: 62, keys: [...Array(13).fill(1), 1.5] },
    { y: 130, h: 62, keys: [1.5, ...Array(13).fill(1)] },
    { y: 202, h: 62, keys: [1.8, ...Array(11).fill(1), 1.8] },
    { y: 274, h: 62, keys: [2.3, ...Array(10).fill(1), 2.3] },
    { y: 346, h: 62, keys: [1, 1, 1, 1.3, 5.4, 1.3, 1, 1, 1, 1] },
  ];
  for (const r of rows) {
    const total = r.keys.reduce((a, k) => a + k, 0), gap = 8, unit = (1004 - gap * (r.keys.length - 1)) / total;
    let x = 10;
    for (const k of r.keys) { key(x, r.y, unit * k, r.h); x += unit * k + gap; }
  }
  const mat = new THREE.MeshStandardMaterial({ map: toTex(c), roughness: 0.6, metalness: 0 });
  mat.name = 'keyboard';
  return mat;
}

export function buildRoom(mats) {
  const group = new THREE.Group();
  group.name = 'room';
  const A = {};

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), mats.roomFloor);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = FLOOR_Y;
  group.add(floor);

  // ── the experience desk ───────────────────────────────────────────────────
  const desk = new THREE.Group();
  const TOP = DESK_TOP;
  const b = new Builder();        // the desk and the monitor
  const o = new Builder();        // the other devices (hidden when one screen is shown on its own)
  b.rbox(mats.deskTop, 2.7, 0.034, 1.06, 0, TOP - 0.017, 0, 0.012);
  for (const s of [-1, 1]) { b.rbox(mats.steelDark, 0.06, TOP - 0.034, 0.06, s * 1.2, (TOP - 0.034) / 2, 0.02, 0.01); b.rbox(mats.steelDark, 0.07, 0.022, 0.86, s * 1.2, 0.011, 0, 0.008); }
  const Q = {}, pools = [];
  /** soft light a lit screen throws on the desk in front of it */
  const pool = (x, z, w, d, ry = 0) => pools.push([x, z, w, d, ry]);

  // monitor (27"): slim uniform bezel, aluminium neck and foot
  {
    const w = 0.597, h = 0.336, z = -0.36, m = M(0, TOP + 0.09 + h / 2, z);
    slab(b, mats.black, w + 0.014, h + 0.014, 0.018, 0.005, m.clone().multiply(M(0, 0, -0.0006)), 0.0015);
    b.rbox(mats.aluDark, 0.05, 0.24, 0.02, 0, TOP + 0.12, z - 0.03, 0.006);
    b.rbox(mats.aluDark, 0.25, 0.01, 0.19, 0, TOP + 0.005, z - 0.02, 0.004);
    Q.monitor = quad(m, w, h);
    pool(0, z + 0.2, 0.9, 0.42);
  }
  // laptop (14"): aluminium unibody, keyboard well, glass trackpad, lid open ~107°
  {
    const x = -0.52, z = 0.02, ry = 0.3, ML = M(x, TOP, z, 0, ry, 0);
    o.add(mats.alu, G.rbox(0.3126, 0.0115, 0.2212, 0.005), ML.clone().multiply(M(0, 0.00575, 0)));
    o.add(keyboardMaterial(), G.plane(0.278, 0.108), ML.clone().multiply(M(0, 0.01165, -0.036, -Math.PI / 2, 0, 0)));
    o.add(mats.aluDark, G.box(0.124, 0.0004, 0.076), ML.clone().multiply(M(0, 0.0117, 0.066)));
    const lid = ML.clone().multiply(M(0, 0.0115, -0.1086, -0.3, 0, 0));
    slab(o, mats.alu, 0.3126, 0.2152, 0.0046, 0.008, lid.clone().multiply(M(0, 0.1076, -0.0006)), 0.001);
    slab(o, mats.screenGlass, 0.309, 0.2116, 0.0005, 0.0066, lid.clone().multiply(M(0, 0.1076, 0)));
    Q.laptop = quad(lid, 0.3024, 0.189, 0.1106);
    pool(x + 0.03, z + 0.03, 0.42, 0.3, ry);
  }
  // tablet (11"), landscape on a folio stand
  {
    const x = 0.47, z = 0.2, ry = -0.32, lean = 0.34, h = 0.1785;
    const MT = M(x, TOP + 0.004 + (h / 2) * Math.cos(lean), z, 0, ry, 0).multiply(M(0, 0, 0, -lean, 0, 0));
    slab(o, mats.aluDark, 0.2476, h, 0.006, 0.012, MT.clone().multiply(M(0, 0, -0.0005)), 0.001);
    slab(o, mats.screenGlass, 0.2456, h - 0.002, 0.0005, 0.0112, MT);
    o.add(mats.anthracite, G.rbox(0.2476, 0.004, 0.13, 0.002), M(x, TOP + 0.002, z, 0, ry, 0).multiply(M(0, 0, -0.045)));
    o.add(mats.anthracite, G.rbox(0.2476, 0.13, 0.004, 0.002), MT.clone().multiply(M(0, -0.012, -0.036, 0.68, 0, 0)));
    Q.tablet = quad(MT, 0.2292, 0.16, 0);
    pool(x, z + 0.1, 0.36, 0.24, ry);
  }
  // two phones on slim stands
  const phone = (key, x, z, ry) => {
    const lean = 0.25, w = 0.0715, h = 0.1466;
    const MP = M(x, TOP + 0.011 + (h / 2) * Math.cos(lean), z, 0, ry, 0).multiply(M(0, 0, 0, -lean, 0, 0));
    slab(o, mats.titanium, w, h, 0.0079, 0.0118, MP.clone().multiply(M(0, 0, -0.0004)), 0.0012);
    slab(o, mats.screenGlass, w - 0.0014, h - 0.0014, 0.0005, 0.0112, MP);
    o.add(mats.titanium, G.rbox(0.0012, 0.019, 0.0034, 0.0005), MP.clone().multiply(M(w / 2 + 0.0003, 0.018, -0.0042)));     // side button
    o.add(mats.titanium, G.rbox(0.0012, 0.011, 0.0034, 0.0005), MP.clone().multiply(M(-w / 2 - 0.0003, 0.03, -0.0042)));      // volume
    o.add(mats.titanium, G.rbox(0.0012, 0.011, 0.0034, 0.0005), MP.clone().multiply(M(-w / 2 - 0.0003, 0.014, -0.0042)));
    o.add(mats.anthracite, G.rbox(0.084, 0.011, 0.062, 0.004), M(x, TOP + 0.0055, z - 0.014, 0, ry, 0));
    o.add(mats.anthracite, G.rbox(0.026, 0.085, 0.005, 0.002), MP.clone().multiply(M(0, -0.03, -0.024, 0.62, 0, 0)));
    Q[key] = quad(MP, 0.0667, 0.1418, 0);
    pool(x, z + 0.02, 0.15, 0.1, ry);
  };
  phone('phoneA', -0.245, 0.37, 0.19);
  phone('phoneB', 0.255, 0.37, -0.19);

  const base = b.build('desk', { cast: true, receive: true });
  const others = o.build('devices', { cast: true, receive: true });
  desk.add(base, others);

  // light pools (one shared additive material; opacity follows how many screens are awake)
  const poolMat = (() => {
    const [c, g] = makeCanvas(128, 128);
    const grd = g.createRadialGradient(64, 64, 2, 64, 64, 62);
    grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.45, 'rgba(255,255,255,0.32)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    return new THREE.MeshBasicMaterial({ map: toTex(c), color: new THREE.Color(0.55, 0.72, 0.9), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  })();
  const poolMeshes = pools.map(([x, z, w, d, ry], i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), poolMat);
    m.rotation.set(-Math.PI / 2, ry, 0, 'YXZ');
    m.position.set(x, TOP + 0.0012, z);
    m.renderOrder = 3;
    (i === 0 ? desk : others).add(m);
    return m;
  });

  // studio backdrop: near-black navy with a soft halo behind the monitor (never a wall of blue)
  {
    const [c, g] = makeCanvas(512, 288);
    const grd = g.createRadialGradient(256, 196, 10, 256, 196, 250);
    grd.addColorStop(0, '#0d1b2a'); grd.addColorStop(0.5, '#070f18'); grd.addColorStop(1, '#020509');
    g.fillStyle = grd; g.fillRect(0, 0, 512, 288);
    const cyc = new THREE.Mesh(new THREE.PlaneGeometry(8, 4.5), new THREE.MeshBasicMaterial({ map: toTex(c), fog: false }));
    cyc.position.set(0, 2.1, -2.3);
    desk.add(cyc);
  }
  desk.scale.setScalar(K);
  desk.visible = false;
  group.add(desk);
  A.desk = desk;
  A.screens = {};
  for (const [k, local] of Object.entries(Q)) A.screens[k] = { local, corners: local.map(() => new THREE.Vector3()) };

  /**
   * Stage the desk. desk: [x, z] of the desk centre (devices face +z) or null; solo: only the monitor;
   * lit: 0..1 how much light the screens throw on the desk.
   */
  A.place = ({ desk: dp = null, solo = false, lit = 0 } = {}) => {
    if (!dp) { desk.visible = false; return; }
    desk.visible = true;
    others.visible = !solo;
    poolMat.opacity = 0.16 * lit;
    poolMeshes.forEach((m) => { m.visible = lit > 0.01; });
    if (desk.position.x !== dp[0] || desk.position.z !== dp[1] || desk.position.y !== FLOOR_Y) {
      desk.position.set(dp[0], FLOOR_Y, dp[1]);
      desk.updateMatrixWorld(true);
      for (const s of Object.values(A.screens)) s.local.forEach((p, i) => s.corners[i].copy(p).applyMatrix4(desk.matrixWorld));
    }
  };
  A.place({});
  return { group, anchors: A };
}
