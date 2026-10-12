// All labels anchored in the world — Client vertical (network of sites).
// Software plates (with the Snowflake connection point), sites on the map, business objects of Site Belmont.
import * as THREE from 'three/webgpu';
import { el, img } from './dom.js';
import { K } from '../content.js';

function sys({ logo = null, logoCls = '', text = null, cap = '', alt = null, plug = true }) {
  const plate = el('div.plate');
  if (logo) plate.append(img(logo, logoCls));
  if (text) plate.append(el('span', { text }));
  if (plug) plate.append(el('div.plug', null, img('snowflakeBlue')));
  const capEl = el('div.cap', null, el('span.main', { text: cap }));
  capEl.append(el('span.conn', null, el('i'), K.connected));
  if (alt) capEl.append(el('span.alt', { text: alt }));
  return el('div.sys', null, plate, capEl);
}
const ctx = (t, n, cls = '') => el(`div.ctx${cls ? '.' + cls.split(' ').join('.') : ''}`, null, el('span.t', { text: t }), el('span.n', { text: n }));
const zone = (logo, name, region) => el('div.zone', null, el('div.plate', null, img(logo)), el('div.n', null, name, el('small', { text: region })));
const city = (name) => el('div.isl', null, el('span', { text: name }));
const vchip = (system, value) => el('div.vchip', null, el('b', { text: system }), el('span', { text: value }));

export function buildLabels(tags, W) {
  const P = W.story.P;
  const L = { sys: {}, pass: {}, zone: {}, city: {}, ctx: {}, risk: {}, opt: {}, fd: [] };
  const add = (id, node, anchor, opt) => { const t = tags.add(id, node, anchor, opt); t.wrap.append(el('div.lock')); t.node = node; return t; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  // ── the software of every site, on the map ─────────────────────────────
  const S = (id, def, leader, dx = 0) => (L.sys[id] = add(id, sys(def), P[id], { leader, dx }));
  const SR = K.sources;
  S('srcA', { logo: 'srcA', logoCls: 'lg-srcA', cap: SR.srcA.cap, alt: SR.srcA.alt }, 2.6, -2);
  S('srcB', { logo: 'srcB', logoCls: 'lg-srcB', cap: SR.srcB.cap, alt: SR.srcB.alt }, 13, 0);
  S('srcC', { logo: 'srcC', logoCls: 'lg-srcC', cap: SR.srcC.cap, alt: SR.srcC.alt }, 2.6, -6);
  S('excel', { text: SR.excel.plate, cap: SR.excel.cap }, 1.6, 3);

  // ── the same software, on the desks of the Belmont open space ──────────────
  const pass = (id, def, leader = 1.7, dx = 0) => (L.pass[id] = add(`in_${id}`, sys(def), P[`in_${id}`], { leader, dx }));
  pass('srcA', { logo: 'srcA', logoCls: 'lg-srcA', cap: SR.srcA.capOffice }, 1.4);
  pass('srcB', { logo: 'srcB', logoCls: 'lg-srcB', cap: SR.srcB.capOffice }, 1.8);
  pass('excel', { text: SR.excel.plate, cap: SR.excel.capOffice }, 1.8);
  pass('srcC', { logo: 'srcC', logoCls: 'lg-srcC', cap: SR.srcC.capOffice }, 1.8);

  // ── sites of the network ───────────────────────────────────────────────
  L.zone.hq = add('z_hq', zone('client', K.cities.hq.role, K.cities.hq.name), P.city_hq, { leader: K.cities.hq.tag[0], dx: K.cities.hq.tag[1] });
  L.zone.hero = add('z_hero', zone('client', K.cities.hero.role, K.cities.hero.name), P.city_hero, { leader: K.cities.hero.tag[0], dx: K.cities.hero.tag[1] });
  const cityTag = (id, name, leader, dx = 0) => (L.city[id] = add(`city_${id}`, city(name), P[`city_${id}`], { leader, dx }));
  L.cityOnMap = [];
  for (const [id, leader, dx, onMap = true] of K.cityTags) { const t = cityTag(id, K.cities[id].name, leader, dx); if (onMap) L.cityOnMap.push(t); }

  // ── one client record: three systems, three spellings → the Snowflake window ──
  const smooth = (u) => u * u * (3 - 2 * u);
  const groups = [
    [['srcA', SR.srcA.name, K.record.client, V(0, 2.4, 0)], ['srcC', SR.srcC.name, K.record.clientCode, V(0, 2.4, 0)], ['excel', SR.excel.name, K.record.clientExcel, V(0, 6, 0)]],
    [['srcA', SR.srcA.name, K.record.mission, V(0, 2.4, 0)], ['srcB', SR.srcB.name, K.record.missionCode, V(0, 2.4, 0)], ['excel', SR.excel.name, K.record.missionExcel, V(0, 6.5, 0)]],
  ];
  const ray = new THREE.Vector3(), dir = new THREE.Vector3(), tgt = new THREE.Vector3();
  groups.forEach((g, gi) => {
    L.fd.push(g.map(([src, name, value, off], k) => {
      const a = (P[src] || V(0, 5, 0)).clone().add(off), v = new THREE.Vector3(), st = { u: 0 }, target = { x: 0, y: 0 };
      const tag = add(`fd_${gi}_${k}`, vchip(name, value), (camera) => {
        const u = smooth(Math.min(1, Math.max(0, st.u)));
        if (u <= 0 || !camera) return a;
        ray.set(target.x, target.y, 0.5).unproject(camera);
        dir.copy(ray).sub(camera.position).normalize();
        tgt.copy(camera.position).addScaledVector(dir, a.distanceTo(camera.position) * 0.86);
        return v.copy(a).lerp(tgt, u);
      }, { leader: 0, dot: false, cls: 'vtag' });
      return { tag, st, target };
    }));
  });

  // ── business context of Site Belmont: one chain, from the client to the deadline ──
  const c = (id, t, n, leader, dx = 0) => (L.ctx[id] = add(`c_${id}`, ctx(t, n, 'obj'), P[`c_${id}`], { leader, dx, cls: 'ctxtag objtag' }));
  for (const [id, t, n] of K.chain) c(id, t, n, 2.0);

  // ── what the agent finds, and what it proposes ────────────────────────────
  const rk = (id, t, n, leader, dx = 0) => (L.risk[id] = add(`r_${id}`, ctx(t, n, 'risk'), P[`c_${id}`], { leader, dx, cls: 'ctxtag' }));
  for (const [id, t, n] of K.risks) rk(id, t, n, 3.0);
  const ok = (id, t, n, leader, dx = 0) => (L.opt[id] = add(`o_${id}`, ctx(t, n, 'ok'), P[`c_${id}`], { leader, dx, cls: 'ctxtag' }));
  for (const [id, t, n] of K.options) ok(id, t, n, 3.0);
  // e-invoicing opportunity, found in Source A data
  L.einv = add('t_einv', ctx(K.regTag[0], K.regTag[1], 'risk'), P.city_hero, { leader: 5.6, dx: -4, cls: 'ctxtag' });
  return L;
}
