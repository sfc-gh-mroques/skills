// Story geometry — Client vertical (network of sites) on the map of the country.
// Where each system, site and business object lives, and how it meets the Snowflake layer.
import * as THREE from 'three/webgpu';
import { V } from '../core/kit.js';
import { LAYER_Y } from './layer.js';
import { K } from '../content.js';

export function buildStory(W, layer) {
  const A = W.anchors, T = A.table, O = A.office;
  const Y = LAYER_Y;
  const P = {};
  const ring = (cx, cz, rad, y = Y + 0.08, n = 40) => Array.from({ length: n + 1 }, (_, i) => V(cx + Math.cos((i / n) * 6.2832) * rad, y, cz + Math.sin((i / n) * 6.2832) * rad));
  const rise = (p) => [p.clone(), V(p.x, Y, p.z)];
  const C = T.city;

  // ── the three applications of every site (+ the Excel exports), seen on the map ──
  const sys = {
    // each source sits above a named city of the map (content.js: sources.<id>.city)
    srcA: { p: C[K.sources.srcA.city].clone().add(V(0, 0.4, 0)), kind: 'app' },
    srcB: { p: C[K.sources.srcB.city].clone().add(V(0, 0.4, 0)), kind: 'app' },
    srcC: { p: C[K.sources.srcC.city].clone().add(V(0, 0.4, 0)), kind: 'app' },
    excel: { p: C[K.sources.excel.city].clone().add(V(0, 0.4, 0)), kind: 'file' },
    // the same software on the desks of the Belmont open space (CONNECT pass)
    in_srcA: { p: O.screens.srcA.p.clone().add(V(0, 0.24, 0)), kind: 'app' },
    in_srcB: { p: O.screens.srcB.p.clone().add(V(0, 0.24, 0)), kind: 'app' },
    in_excel: { p: O.screens.excel.p.clone().add(V(0, 0.24, 0)), kind: 'file' },
    in_srcC: { p: O.screens.srcC.p.clone().add(V(0, 0.24, 0)), kind: 'app' },
  };
  for (const [id, s] of Object.entries(sys)) {
    P[id] = s.p;
    layer.line(`conn_${id}`, s.kind, rise(s.p), { step: 0.6 });
    layer.node(`n_${id}`, s.p.x, s.p.z, id.startsWith('in_') ? 0.5 : 0.9);
  }
  layer.pulses('appPing', ['conn_srcA', 'conn_srcB', 'conn_srcC', 'conn_excel'], { count: 1, speed: 5.5, size: 0.34 });
  layer.pulses('fileEvents', ['conn_excel', 'conn_in_excel'], { count: 3, speed: 2.1, size: 0.2, stepped: 7, color: new THREE.Color(0xffffff).multiplyScalar(3.4) });
  layer.pulses('writeBack', ['conn_srcA', 'conn_srcB'], { count: 2, speed: 7, size: 0.42, dir: -1, color: new THREE.Color(0x9ff0c8).multiplyScalar(4) });

  // ── 60 sites: each one a signal, rising to the layer, then converging on the platform ──
  P.hub = V(14, Y, 6);
  const flows = [];
  T.sites.forEach((p, i) => {
    layer.signal(p.clone(), 'IT', { stub: 1.2, size: 0.2 });
    layer.line(`flow_${i}`, 'app', [V(p.x, Y + 0.05, p.z), V(P.hub.x, Y + 0.05, P.hub.z)], { step: 2 });
    flows.push(`flow_${i}`);
  });
  layer.finalizeSignals();
  layer.node('n_hub', P.hub.x, P.hub.z, 2.6);
  layer.pulses('netFlow', flows, { count: 1, speed: 16, size: 0.42 });
  P.flows = flows;
  layer.line('coast', 'zone', T.outline.concat([T.outline[0]]).map(([x, z]) => V(x, Y + 0.02, z)), { step: 3 });

  // ── named sites (zone tags) ──
  for (const [id, p] of Object.entries(C)) P[`city_${id}`] = p;
  layer.line('ring_hero', 'zone', ring(C.hero.x, C.hero.z, 4.2, 0.9), { step: 0.5 });
  layer.line('ring_hq', 'zone', ring(C.hq.x, C.hq.z, 4.2, 0.9), { step: 0.5 });

  // ── business context: the objects of Site Belmont, as one chain on the layer ──
  // Client → Mission → Collaborateur → Temps → Facturation → Recouvrement → Échéance
  const R0 = C.hero;
  const obj = {
    client: [-44, 12], mission: [-62, -12], collab: [-30, -34], temps: [0, -12], factu: [34, -34], recouv: [62, -12], echeance: [44, 12],
  };
  const ids = Object.keys(obj);
  ids.forEach((id, i) => {
    const [x, z] = obj[id];
    layer.node(`c_${id}`, x, z, 1.3);
    // every object is anchored in the same site: the drop lands on Belmont
    layer.line(`d_${id}`, 'ctx', [V(x, Y, z), V(R0.x + (i - 3) * 0.5, R0.y + 0.3, R0.z)], { step: 1.4 });
    P[`c_${id}`] = V(x, Y, z);
  });
  const edges = {};
  for (let i = 1; i < ids.length; i++) edges[`e_${ids[i - 1]}`] = [obj[ids[i - 1]], obj[ids[i]]];
  for (const [k, pts] of Object.entries(edges)) layer.line(k, 'ctx', pts.map(([x, z]) => V(x, Y + 0.04, z)), { step: 1.2 });
  layer.pulses('ctxFlow', Object.keys(edges), { count: 2, speed: 11, size: 0.3 });

  // causal trace for the agent: from the client to the deadline
  const tracePts = ids.map((id) => obj[id]);
  layer.line('trace', 'risk', tracePts.map(([x, z]) => V(x, Y + 0.1, z)), { step: 1.0 });
  let tot = 0; const cum = [0];
  for (let i = 1; i < tracePts.length; i++) { tot += Math.hypot(tracePts[i][0] - tracePts[i - 1][0], tracePts[i][1] - tracePts[i - 1][1]); cum.push(tot); }
  const TRACE = {}; ids.forEach((id, i) => { TRACE[id] = cum[i] / tot; });
  for (const id of ['temps', 'factu', 'echeance']) {
    layer.line(`rf_${id}`, 'risk', ring(obj[id][0], obj[id][1], 3.2), { step: 0.4 });
    layer.line(`okf_${id}`, 'ok', ring(obj[id][0], obj[id][1], 3.8), { step: 0.4 });
  }
  // e-invoicing: the clients without an approved platform, found in Source A
  layer.line('rf_einv', 'risk', ring(C.hero.x, C.hero.z, 9, Y + 0.1), { step: 0.6 });

  // the platform's name, lying on the layer (south, over the sea)
  P.brand = [V(-46, Y + 0.06, 100), V(26, Y + 0.06, 100), V(26, Y + 0.06, 111), V(-46, Y + 0.06, 111)];

  return { P, obj, TRACE, sys, ids };
}
