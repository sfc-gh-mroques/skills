// The hero place: the open space of Site Belmont (Client network).
// A bright, modern accounting office: desk benches, screens, a glazed meeting room, a view on the Vercors.
// Contract kept from the kit: { shell, front, roof, gallery, heroScreen } + anchors for the CONNECT pass.
import * as THREE from 'three/webgpu';
import { Builder, V, rng } from '../core/kit.js';
import { makeCanvas, toTex } from '../core/tex.js';
import { K } from '../content.js';

const SANS = '"Inter", "Open Sans", sans-serif';
export const OFFICE = { X0: -32, X1: 32, Z0: -14, Z1: 14, H: 3.4, deskY: 0.74 };

/** A desktop screen, drawn once per kind (the pass desks show their own software). */
function screenTex(kind, seed) {
  const [c, g] = makeCanvas(640, 384);
  const r = rng(seed);
  const C = {
    srcA: ['#16182e', '#ffffff', K.sources.srcA.screen],
    srcB: ['#3a3741', '#e6007e', K.sources.srcB.screen],
    excel: ['#1d6f42', '#ffffff', K.sources.excel.screen],
    srcC: ['#d93914', '#ffffff', K.sources.srcC.screen],
    sheet: ['#1d6f42', '#ffffff', K.sources.excel.sheet],
    app: ['#16182e', '#ffffff', K.sources.srcA.screenApp],
  }[kind];
  g.fillStyle = '#f5f7f9'; g.fillRect(0, 0, 640, 384);
  g.fillStyle = C[0]; g.fillRect(0, 0, 640, 58);
  g.fillStyle = C[1]; g.font = `600 26px ${SANS}`; g.textBaseline = 'middle'; g.fillText(C[2], 22, 30);
  if (kind === 'excel' || kind === 'sheet') {
    g.strokeStyle = '#c9d1d6'; g.lineWidth = 1;
    for (let y = 74; y < 384; y += 22) { g.beginPath(); g.moveTo(0, y); g.lineTo(640, y); g.stroke(); }
    for (let x = 40; x < 640; x += 86) { g.beginPath(); g.moveTo(x, 64); g.lineTo(x, 384); g.stroke(); }
    g.fillStyle = '#6b7780';
    for (let y = 80; y < 380; y += 22) for (let x = 48; x < 620; x += 86) if (r() > 0.25) g.fillRect(x, y + 6, 20 + r() * 50, 8);
  } else {
    const card = (x, y, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(x, y, w, h); g.strokeStyle = '#dde3e8'; g.strokeRect(x, y, w, h); };
    card(18, 76, 290, 130); card(326, 76, 296, 130); card(18, 222, 604, 146);
    g.fillStyle = C[0]; g.fillRect(36, 120, 120, 30); g.fillRect(344, 120, 90, 30);
    g.fillStyle = kind === 'srcB' ? '#e6007e' : kind === 'srcC' ? '#d93914' : '#29b5e8';
    for (let i = 0; i < 10; i++) { const h = 30 + r() * 90; g.fillRect(40 + i * 56, 356 - h, 30, h); }
    g.fillStyle = '#b4bec6'; g.fillRect(36, 170, 200, 10); g.fillRect(344, 170, 230, 10);
  }
  return toTex(c);
}

/** The view through the curtain wall: a soft winter sky over the Vercors. */
function viewTex() {
  const [c, g] = makeCanvas(2048, 512);
  const sky = g.createLinearGradient(0, 0, 0, 512);
  sky.addColorStop(0, '#9fc3dd'); sky.addColorStop(0.55, '#dbe8f1'); sky.addColorStop(1, '#eef2f4');
  g.fillStyle = sky; g.fillRect(0, 0, 2048, 512);
  const ridge = (y0, amp, col, seed) => {
    const r = rng(seed); g.fillStyle = col; g.beginPath(); g.moveTo(0, 512);
    let y = y0; for (let x = 0; x <= 2048; x += 32) { y += (r() - 0.5) * amp; y = Math.min(y0 + amp, Math.max(y0 - amp, y)); g.lineTo(x, y); }
    g.lineTo(2048, 512); g.fill();
  };
  ridge(250, 70, '#9cadbb', 4); ridge(320, 40, '#aebdc8', 7); ridge(390, 20, '#c7d0d6', 9);
  // the town below: low roofs
  const r = rng(11);
  for (let x = 0; x < 2048; x += 18 + r() * 30) { const h = 16 + r() * 40; g.fillStyle = r() > 0.5 ? '#d9d4cc' : '#c9c2b8'; g.fillRect(x, 470 - h, 14 + r() * 26, h + 42); }
  return toTex(c);
}

/** The wall sign of the site. */
function signTex() {
  const [c, g] = makeCanvas(1024, 320);
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 1024, 320);
  g.fillStyle = '#121a24'; g.font = `800 132px ${SANS}`; g.textBaseline = 'middle'; g.fillText(K.office.wall, 70, 128);
  g.fillStyle = '#21a33a'; for (let i = 0; i < 3; i++) g.fillRect(520 + i * 46, 70, 28, 110);
  g.fillStyle = '#4b5864'; g.font = `500 54px ${SANS}`; g.fillText(K.office.wallSub, 72, 248);
  return toTex(c);
}

/** Bright stand-in for the hero monitor (the live Source A dashboard is an HTML layer registered on it). */
export function heroStandIn(hero) {
  const [c, g] = makeCanvas(1280, 720);
  g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, 1280, 720);
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 1280, 98);
  g.fillStyle = '#2563eb'; g.fillRect(0, 98, 1280, 3);
  g.fillStyle = '#2563eb'; g.beginPath(); g.ellipse(52, 49, 26, 17, 0, 0, Math.PI * 2); g.fill();
  const card = (x, y, w, h) => { g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(x, y, w, h, 6); g.fill(); g.strokeStyle = '#dddbda'; g.lineWidth = 1; g.stroke(); };
  card(22, 119, 1236, 80); card(22, 215, 771, 483); card(809, 215, 449, 483);
  g.fillStyle = '#080707'; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  g.font = `600 24px "Open Sans", sans-serif`; g.fillText(K.office.screenTitle, 104, 172);
  g.font = `600 56px "Open Sans", sans-serif`; g.fillText(K.monitor.objValue, 48, 352); g.fillText(K.monitor.dueValue, 379, 352);
  g.fillStyle = '#b9b7b5';
  for (const [x, y, w] of [[48, 250, 210], [48, 392, 160], [379, 392, 230], [48, 470, 120], [300, 470, 200], [540, 470, 150], [834, 250, 110], [834, 300, 330], [834, 330, 280], [834, 390, 200], [834, 450, 220]])
    g.fillRect(x, y, w, 12);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(hero.w, hero.h), new THREE.MeshBasicMaterial({ map: toTex(c), color: new THREE.Color(1.5, 1.5, 1.5) }));
  m.position.copy(hero.center);
  m.position.z += 0.0006;
  return m;
}

export function buildOffice(mats) {
  const shell = new Builder(), front = new Builder(), roof = new Builder(), gal = new Builder();
  const { X0, X1, Z0, Z1, H, deskY } = OFFICE;
  const W = X1 - X0, L = Z1 - Z0;
  const r = rng(77);
  const A = { screens: {} };
  const extra = new THREE.Group();          // textured planes (screens, view, sign)
  const glowMat = (tex, k = 1.2) => new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(k, k, k) });
  const plane = (grp, w, h, mat, x, y, z, ry = 0, rx = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.set(rx, ry, 0, 'YXZ'); grp.add(m); return m; };

  const oak = mats.oak || (mats.oak = Object.assign(new THREE.MeshStandardMaterial({ color: 0xcdbfa9, roughness: 0.62 }), { name: 'oak' }));
  const carpet = mats.carpet || (mats.carpet = Object.assign(new THREE.MeshStandardMaterial({ color: 0x8e979e, roughness: 0.95 }), { name: 'carpet' }));
  const desk = mats.deskWhite || (mats.deskWhite = Object.assign(new THREE.MeshStandardMaterial({ color: 0xf4f4f2, roughness: 0.42 }), { name: 'deskWhite' }));
  const fabric = mats.fabric || (mats.fabric = Object.assign(new THREE.MeshStandardMaterial({ color: 0x33495e, roughness: 0.9 }), { name: 'fabric' }));
  const sofa = mats.sofa || (mats.sofa = Object.assign(new THREE.MeshStandardMaterial({ color: 0x7c97a8, roughness: 0.9 }), { name: 'sofa' }));

  // ── envelope: oak floor, carpet zones, white walls, a curtain wall onto the mountains ──
  shell.box(oak, W + 0.6, 0.3, L + 0.6, 0, -0.15, 0);
  shell.box(carpet, 50, 0.012, 22, -3, 0.006, -2);
  shell.box(mats.wallPlain, 0.3, H, L, X0 - 0.15, H / 2, 0);
  shell.box(mats.wallPlain, 0.3, H, L, X1 + 0.15, H / 2, 0);
  // curtain wall (back, z = Z0)
  const bays = 24, bw = W / bays;
  for (let i = 0; i <= bays; i++) shell.box(mats.frame, 0.08, H, 0.12, X0 + i * bw, H / 2, Z0);
  shell.box(mats.frame, W, 0.1, 0.14, 0, 0.05, Z0); shell.box(mats.frame, W, 0.1, 0.14, 0, H - 0.05, Z0);
  shell.box(mats.glassClear, W, H, 0.02, 0, H / 2, Z0 - 0.02);
  plane(extra, 150, 28, glowMat(viewTex(), 1.25), 0, 9, Z0 - 40);
  // front wall (towards the camera) with the entrance
  front.box(mats.wallPlain, W, H, 0.3, 0, H / 2, Z1 + 0.15);

  // ── ceiling: white panels, linear lights ──
  roof.box(mats.white, W + 0.6, 0.12, L + 0.6, 0, H + 0.06, 0);
  for (let z = -11; z <= 11; z += 4.4) for (let x = -26; x <= 26; x += 8.6) {
    roof.box(mats.white, 6.2, 0.06, 0.24, x, H - 0.03, z);
    roof.box(mats.ledSoft, 6.0, 0.02, 0.16, x, H - 0.07, z);
  }

  // ── desk benches: four rows of facing desks, every seat with its screen ──
  const screenKinds = ['app', 'sheet', 'app', 'app', 'sheet'];
  const texCache = {};
  const stex = (k, s) => (texCache[k + s] ||= glowMat(screenTex(k, s), 1.15));
  const seat = (x, z, face) => {               // face: +1 the person faces −z (screen at z − 0.45)
    const cz = z + face * 0.62;
    shell.box(fabric, 0.5, 0.08, 0.48, x, 0.47, cz);
    shell.box(fabric, 0.48, 0.5, 0.07, x, 0.8, cz + face * 0.25);
    shell.cyl(mats.anthracite, 0.03, 0.42, x, 0.22, cz, 'y', 8);
    shell.cyl(mats.anthracite, 0.26, 0.04, x, 0.03, cz, 'y', 16);
  };
  const person = (x, z, face, shirt) => {
    const cz = z + face * 0.6;
    shell.rbox(shirt, 0.4, 0.56, 0.26, x, 0.84, cz, 0.1);
    shell.sphere(mats.skin, 0.11, x, 1.27, cz - face * 0.02, 1, 1.12, 1, 14, 10);
    shell.sphere(mats.hair, 0.115, x, 1.31, cz + face * 0.02, 1, 0.9, 1, 14, 10);
    shell.rbox(shirt, 0.1, 0.34, 0.1, x - 0.22, 0.86, cz - face * 0.16, 0.04);
    shell.rbox(shirt, 0.1, 0.34, 0.1, x + 0.22, 0.86, cz - face * 0.16, 0.04);
  };
  const shirts = [mats.shirt, fabric, mats.blueGray || fabric, sofa];
  const station = (x, z, face, kind, seed, who = r() < 0.45) => {
    shell.box(desk, 1.56, 0.035, 0.78, x, deskY, z);
    shell.box(mats.anthracite, 0.04, deskY, 0.7, x - 0.74, deskY / 2, z);
    // monitor on its arm, facing the seat
    const sz = z - face * 0.18;
    shell.rbox(mats.anthracite, 0.64, 0.4, 0.03, x, deskY + 0.42, sz, 0.008);
    shell.box(mats.steelDark, 0.04, 0.24, 0.04, x, deskY + 0.12, sz - face * 0.03);
    shell.box(mats.anthracite, 0.4, 0.012, 0.14, x, deskY + 0.025, z + face * 0.16);
    const scr = plane(extra, 0.6, 0.36, stex(kind, seed % 3), x, deskY + 0.42, sz + face * 0.017, face > 0 ? 0 : Math.PI);
    seat(x, z, face);
    if (who) person(x, z, face, shirts[seed % shirts.length]);
    return { p: V(x, deskY + 0.42, sz), scr };
  };
  const rowsZ = [3.6, -1.4, -6.4];
  const xs = [-25.6, -24, -22.4, -20.8, -15.2, -13.6, -12, -10.4, -4.8, -3.2, -1.6, 0, 1.6, 6.8, 8.4, 10, 11.6, 13.2];
  let n = 0;
  for (const z of rowsZ) for (const x of xs) {
    // the four pass desks get the software of the network (row 3.6, seen over the shoulder)
    if (z === 3.6 && [-3.2, 1.6, 6.8, 11.6].includes(x)) continue;
    station(x, z - 0.4, -1, screenKinds[n % 5], n, r() < 0.5); station(x, z + 0.4, 1, screenKinds[(n + 2) % 5], n + 7, r() < 0.4); n++;
  }
  const pass = [['srcA', -3.2], ['srcB', 1.6], ['excel', 6.8], ['srcC', 11.6]];
  for (const [k, x] of pass) {
    station(x, 3.2, -1, k, 1, false);
    const s = station(x, 4.0, 1, k, 2, false);
    A.screens[k] = { p: s.p.clone() };
  }
  // low storage between benches, plants
  for (const z of rowsZ) for (const x of [-18.2, -7.6, 4.2]) {
    shell.rbox(mats.white, 1.6, 0.72, 1.4, x, 0.36, z, 0.03);
    shell.cyl(mats.anthracite, 0.22, 0.4, x, 0.92, z, 'y', 16);
    for (let k = 0; k < 4; k++) shell.sphere(mats.green, 0.28 + r() * 0.1, x + (r() - 0.5) * 0.3, 1.3 + r() * 0.35, z + (r() - 0.5) * 0.3, 1, 1.2, 1, 10, 8);
  }
  for (const [x, z] of [[-30.5, -12.6], [-30.5, 12.4], [30.4, 12.6], [17.6, -12.6], [-14, -12.8]]) {
    shell.cyl(mats.white, 0.32, 0.6, x, 0.3, z, 'y', 16);
    for (let k = 0; k < 6; k++) shell.sphere(mats.green, 0.34 + r() * 0.12, x + (r() - 0.5) * 0.4, 0.95 + k * 0.22, z + (r() - 0.5) * 0.4, 1, 1.3, 1, 10, 8);
  }

  // ── glazed meeting room (right, back) and lounge (right, front) ──
  const mx0 = 19, mx1 = 31.7, mz0 = -13.7, mz1 = -4.6;
  for (let x = mx0; x <= mx1 + 0.01; x += (mx1 - mx0) / 5) shell.box(mats.frame, 0.06, H, 0.06, x, H / 2, mz1);
  for (let z = mz0; z <= mz1 + 0.01; z += (mz1 - mz0) / 4) shell.box(mats.frame, 0.06, H, 0.06, mx0, H / 2, z);
  shell.box(mats.glassClear, mx1 - mx0, H, 0.016, (mx0 + mx1) / 2, H / 2, mz1);
  shell.box(mats.glassClear, 0.016, H, mz1 - mz0, mx0, H / 2, (mz0 + mz1) / 2);
  shell.rbox(oak, 6.4, 0.06, 2.4, 25.4, 0.74, -9.2, 0.03);
  shell.box(mats.anthracite, 0.12, 0.72, 1.6, 23, 0.36, -9.2); shell.box(mats.anthracite, 0.12, 0.72, 1.6, 27.8, 0.36, -9.2);
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) {
    shell.box(fabric, 0.5, 0.08, 0.5, 23.2 + i * 1.45, 0.47, -9.2 + s * 1.6);
    shell.box(fabric, 0.48, 0.5, 0.07, 23.2 + i * 1.45, 0.8, -9.2 + s * 1.86);
  }
  shell.rbox(mats.anthracite, 2.6, 1.5, 0.06, 25.4, 1.6, mz0 + 0.3, 0.02);
  plane(extra, 2.5, 1.4, stex('app', 9), 25.4, 1.6, mz0 + 0.34);
  // lounge
  shell.rbox(sofa, 3.2, 0.42, 0.9, 25.4, 0.24, 5.2, 0.12); shell.rbox(sofa, 3.2, 0.5, 0.22, 25.4, 0.62, 5.6, 0.1);
  shell.cyl(oak, 0.55, 0.04, 25.4, 0.42, 3.8, 'y', 24); shell.cyl(mats.anthracite, 0.05, 0.4, 25.4, 0.2, 3.8, 'y', 8);
  // sign of the site, on the left wall
  plane(extra, 4.2, 1.31, glowMat(signTex(), 1.05), X0 + 0.02, 2.0, 2.6, Math.PI / 2);

  // ── Alex Martin's desk (front, centre): the opening monitor faces the camera ──
  const dx = 0.55, dz = 9.62, dy = deskY;
  gal.rbox(desk, 1.9, 0.035, 0.86, dx, dy, dz, 0.012);
  for (const s of [-1, 1]) gal.rbox(mats.anthracite, 0.05, dy, 0.76, dx + s * 0.88, dy / 2, dz, 0.01);
  const sw = 0.92, sh = 0.5175, sy = dy + 0.02 + 0.13 + sh / 2, sz = dz - 0.16;
  gal.rbox(mats.anthracite, sw + 0.024, sh + 0.024, 0.022, dx, sy, sz, 0.008);
  gal.rbox(mats.steelDark, 0.05, 0.17, 0.03, dx, dy + 0.1, sz - 0.03, 0.008);
  gal.rbox(mats.steelDark, 0.28, 0.014, 0.2, dx, dy + 0.025, sz - 0.03, 0.006);
  gal.rbox(mats.anthracite, 0.44, 0.014, 0.14, dx - 0.05, dy + 0.025, dz + 0.2, 0.004);
  gal.rbox(mats.anthracite, 0.065, 0.024, 0.11, dx + 0.36, dy + 0.03, dz + 0.2, 0.01);
  gal.cyl(mats.white, 0.042, 0.1, dx - 0.62, dy + 0.068, dz + 0.1, 'y', 20);
  gal.rbox(mats.white, 0.21, 0.012, 0.29, dx + 0.66, dy + 0.024, dz + 0.08, 0.004);
  const zf = sz + 0.0125;
  const heroScreen = {
    w: sw, h: sh, center: V(dx, sy, zf),
    corners: [V(dx - sw / 2, sy + sh / 2, zf), V(dx + sw / 2, sy + sh / 2, zf), V(dx + sw / 2, sy - sh / 2, zf), V(dx - sw / 2, sy - sh / 2, zf)],
  };

  const shellG = shell.build('office-shell');
  // the envelope lets the daylight in: only furniture casts shadows
  for (const m of shellG.children) if (/wallPlain|frame|glass/.test(m.name)) m.castShadow = false;
  shellG.add(extra);
  return {
    shell: shellG,
    front: front.build('office-front', { cast: false }),
    roof: roof.build('office-roof', { cast: false }),
    gallery: gal.build('office-desk'),
    heroScreen,
    anchors: A,
  };
}
