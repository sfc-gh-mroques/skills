// The master timeline (GSAP): one business story, told in French.
//   the site's objective → fragmented data across 60 sites → CONNECT (software → one client record →
//   one network) → SECURE (who sees what) → UNDERSTAND (the business chain, the trade, e-invoicing) →
//   ACT (every experience, BI, the agent) → impact → the objective, within reach again.
// Everything is a tween on the film state, on tag state objects or on DOM nodes, so the film can be
// played, paused and scrubbed.
//
// Frame layout (kept constant so nothing ever collides):
//   title bottom-left (operational) or centred (strategic) · chapter spine top-right ·
//   objective chip bottom-right · panels on the right · the scene in the upper two thirds.
import gsap from 'gsap';
import { RIGS } from '../world/lighting.js';
import { GOV_ROLES } from '../ui/hud.js';
import { K } from '../content.js';

const T = {
  promise: 0, problem: 15, connect: 27, foundation: 45, network: 60, govern: 66, context: 76,
  metier: 89, einv: 101, every: 109, bi: 120, agents: 127, impact: 143, close: 152,
};
export const DURATION = 162;
export const TIMES = T;
export const ACTS = [
  ...[T.promise, T.problem, T.connect, T.foundation, T.network, T.govern, T.context, T.metier, T.einv, T.every, T.bi, T.agents, T.impact, T.close]
    .map((t, i) => ({ t, name: K.acts[i] })),
];

export function buildTimeline(S, UI, W) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
  const { hud, labels: L, apps, screens } = UI;
  const H = hud.H;
  const LY = S.layer, Lz = LY.Z, Ll = LY.L, Ln = LY.N, Lp = LY.P, Lg = LY.G;
  const TR = W.story.TRACE, P = W.story.P, IDS = W.story.ids;
  // centred titles are anchored on their own centre; horizontally centred blocks on theirs
  Object.values(H).forEach((h) => { if (h.classList.contains('center') && !h.classList.contains('top')) gsap.set(h, { yPercent: -50 }); });
  gsap.set([hud.xask, hud.dstrip], { xPercent: -50 });
  gsap.set(apps.sf.root, { '--ok': 0 });

  // ── helpers ───────────────────────────────────────────────────────────────
  const show = (e, t, d = 0.8, y = 0.7) => tl.fromTo(e, { autoAlpha: 0, y: `${y}em` }, { autoAlpha: 1, y: '0em', duration: d, ease: 'power2.out' }, t);
  const hide = (e, t, d = 0.5) => tl.to(e, { autoAlpha: 0, duration: d, ease: 'power1.in' }, t);
  /** a Snowflake window comes in from the right: the film steps into the tool */
  const open = (e, t, d = 0.75) => tl.fromTo(e, { autoAlpha: 0, x: '4.5em' }, { autoAlpha: 1, x: '0em', duration: d, ease: 'power3.out' }, t);
  const head = (id, t0, t1) => { show(H[id], t0); hide(H[id], t1 - 0.5); };
  const fade = (e, t, v, d = 0.6) => tl.to(e, { opacity: v, duration: d, ease: 'power1.inOut' }, t);
  const pop = (e, t, d = 0.45, y = 8) => tl.fromTo(e, { opacity: 0, y }, { opacity: 1, y: 0, duration: d, ease: 'power2.out' }, t);
  const to = (o, props, t, d = 1, ease = 'power2.inOut') => tl.to(o, { ...props, duration: d, ease }, t);
  const set = (o, props, t) => tl.set(o, props, t);
  const cam = (t0, t1, from, to2, ease = 'sine.inOut') => tl.fromTo(S.cam, from, { ...to2, duration: t1 - t0, ease, immediateRender: false }, t0);
  const camTo = (t0, t1, to2, ease = 'sine.inOut') => tl.to(S.cam, { ...to2, duration: t1 - t0, ease }, t0);
  const rig = (name, t, d = 0.001, extra = {}) => tl.to(S.rig, { ...RIGS[name], ...extra, duration: d, ease: 'sine.inOut' }, t);
  const post = (props, t, d = 0.001) => tl.to(S.post, { ...props, duration: d, ease: 'sine.inOut' }, t);
  const tagIn = (tag, t, d = 0.55) => tl.fromTo(tag.s, { o: 0, k: 0.84 }, { o: 1, k: 1, duration: d, ease: 'back.out(1.7)', immediateRender: false }, t);
  const tagOut = (tag, t, d = 0.4) => tl.to(tag.s, { o: 0, duration: d, ease: 'power1.in' }, t);
  const tagsOut = (tags, t, d = 0.4) => tags.forEach((g) => tagOut(g, t, d));
  const line = (key, t, d = 0.9, v = 1) => { if (!(key in Ll)) throw new Error(`unknown line ${key}`); return tl.to(Ll, { [key]: v, duration: d, ease: 'power2.inOut' }, t); };
  const node = (key, t, v = 1, d = 0.5) => { if (!(key in Ln)) throw new Error(`unknown node ${key}`); return tl.to(Ln, { [key]: v, duration: d, ease: v ? 'back.out(2)' : 'power1.in' }, t); };
  const zone = (key, t, d = 1.6, v = 1) => { if (!(key in Lz)) throw new Error(`unknown zone ${key}`); return tl.to(Lz, { [key]: v, duration: d, ease: 'power2.out' }, t); };
  const pulse = (key, t, v = 1, d = 0.6) => { if (!(key in Lp)) throw new Error(`unknown pulse ${key}`); return tl.to(Lp, { [key]: v, duration: d }, t); };
  const ringPulse = (i, x, z, t, r1 = 150, d = 2.6, s = 0.5) => { set(LY.R[i], { x, z, r: 0, s }, t); tl.to(LY.R[i], { r: r1, duration: d, ease: 'power1.out' }, t); tl.to(LY.R[i], { s: 0, duration: d * 0.6, ease: 'power1.in' }, t + d * 0.4); };
  /** a piece of software connects to Snowflake: the plate lights up → the connection point docks on it → it rises to the layer */
  const plugIn = (tag, key, t, { rise = 0.8 } = {}) => {
    tl.fromTo(tag.s, { lit: 0 }, { lit: 1, duration: 0.2, ease: 'power2.out', immediateRender: false }, t);
    tl.to(tag.s, { lit: 0, duration: 0.7, ease: 'power1.out' }, t + 0.24);
    tl.fromTo(tag.s, { plug: 0 }, { plug: 1, duration: 0.4, ease: 'back.out(2.6)', immediateRender: false }, t + 0.2);
    tl.fromTo(tag.s, { conn: 0 }, { conn: 1, duration: 0.3, immediateRender: false }, t + 0.36);
    if (key) { line(`conn_${key}`, t + 0.4, rise); node(`n_${key}`, t + 0.4 + rise * 0.86); }
  };
  const flash = (tag, t) => { tl.fromTo(tag.s, { lit: 0 }, { lit: 1, duration: 0.2, immediateRender: false }, t); tl.to(tag.s, { lit: 0, duration: 0.8 }, t + 0.24); };
  const spine = (step, t) => set(hud.spine, { attr: { 'data-step': String(step) } }, t);
  const chipState = (name, t) => Object.entries(hud.chipStates).forEach(([k, e]) => tl.to(e, { opacity: k === name ? 1 : 0, duration: 0.5 }, t));
  const chipBeat = (t) => tl.fromTo(hud.chip, { scale: 1 }, { scale: 1.08, duration: 0.28, yoyo: true, repeat: 1, ease: 'power2.out', transformOrigin: '100% 100%' }, t);
  /** how loud the Snowflake layer itself is: 1 = the subject of the shot, lower = a quiet structure behind it */
  const layerLevel = (v, t, d = 0.9) => to(LY, { edge: 0.1 + 0.9 * v, glow: 0.01 + 0.09 * v, grid: 0.1 + 0.4 * v }, t, d);
  /** a clean cut through black (between the open space and the map) */
  const dip = (t, d = 0.3) => { tl.to(S.post, { fade: 0, duration: d, ease: 'power1.in' }, t - d); tl.to(S.post, { fade: 1, duration: d * 1.6, ease: 'power1.out' }, t); };
  const inOffice = (t, on) => set(S.vis, on ? { office: 1, table: 0, room: 0, roof: 1, front: 1 } : { office: 0, table: 1, room: 1 }, t);

  // cameras: le pays (title bottom-left) · the software · the Rhône-Alpes heart of the network
  const STD = { px: -8, py: 168, pz: 226, tx: -8, ty: 0, tz: 6, fov: 28, ox: 0, oy: 0 };
  const SYS = { px: 4, py: 128, pz: 182, tx: 4, ty: 0, tz: -4, fov: 28, ox: 0, oy: 0 };
  const AURA = { px: 40, py: 74, pz: 116, tx: 40, ty: 0, tz: 26, fov: 30, ox: 0, oy: 0 };
  const TABLE_POST = { focus: 0, hero: 0, range: 190, bokeh: 0.9, aoR: 2.4, bloom: 0.13, vignette: 0.34, sat: 1.08, contrast: 1.05 };
  const OFFICE_POST = { ao: 1, aoR: 0.4, bloom: 0.08, vignette: 0.3, sat: 1.06, contrast: 1.04 };
  // the opening monitor, seen from Alex Martin's chair
  const DESK0 = { px: -0.9, py: 1.62, pz: 13.3, tx: -2.2, ty: 0.75, tz: -6, fov: 38, ox: 0, oy: 0 };
  const DESK1 = { px: 0.12, py: 1.24, pz: 11.3, tx: 0.12, ty: 1.04, tz: -6, fov: 38, ox: 0, oy: 0 };
  const SYS_IDS = ['srcA', 'srcB', 'srcC', 'excel'];
  const sysTags = SYS_IDS.map((k) => L.sys[k]);
  const cityTags = [L.zone.hq, L.zone.hero, ...L.cityOnMap];
  const QUIET = { app: 0.28, file: 0.28, iot: 0.28, zone: 0.4 };
  const sf = screens.salesforce, brand = screens.brand;

  // ════════════════════════════════════════════════════════════════════════
  // 1 · THE OBJECTIVE                                                 0:00 – 0:15
  // ════════════════════════════════════════════════════════════════════════
  const ASK = 8.4, OUT = 10.0;                          // the question; the cut onto the network
  inOffice(0, true);
  rig('day', 0);
  tl.fromTo(S.post, { fade: 0 }, { fade: 1, duration: 1.4, ease: 'power1.out' }, 0);
  set(S.post, { bokeh: 2.4, range: 6, focus: 6, hero: 0, ...OFFICE_POST }, 0);
  // the open space in the morning; a slow dolly towards the objective on Alex Martin's screen
  cam(0, ASK, DESK0, DESK1, 'sine.inOut');
  camTo(ASK, OUT, { pz: 11.5, py: 1.28 }, 'sine.inOut');
  fade(hud.scrimL, 0.4, 0.8, 1.0);
  to(S.post, { hero: 1, range: 1.2, bokeh: 3.2 }, 3.0, 1.6, 'sine.inOut');      // rack focus onto the objective
  tl.fromTo(sf.s, { o: 0 }, { o: 1, duration: 0.9, ease: 'power1.inOut', immediateRender: false }, 3.7);
  head('o1', 0.9, ASK);
  tl.fromTo(apps.sf.qty, { '--hi': 0 }, { '--hi': 1, duration: 0.5 }, 5.1);
  tl.fromTo(apps.sf.date, { '--hi': 0 }, { '--hi': 1, duration: 0.5 }, 6.1);
  // the question, centred: the screen of one site cannot answer it
  tl.to(sf.s, { o: 0, duration: 0.6 }, ASK - 0.1);
  to(S.w, { hero: 0.12 }, ASK - 0.1, 0.8);
  to(S.post, { hero: 0, range: 8, bokeh: 1.6 }, ASK, 1.0, 'sine.inOut');
  fade(hud.scrimL, ASK - 0.1, 0, 0.6);
  fade(hud.scrimFull, ASK, 0.52, 0.7);
  head('o2', ASK + 0.4, T.problem - 0.4);
  // … behind the question, the whole network: 60 sites on the map of the country
  dip(OUT, 0.35);
  inOffice(OUT, false);
  rig('studio', OUT);
  post(TABLE_POST, OUT);
  const P2 = { ...STD, py: 196, pz: 262, tz: 2 };
  cam(OUT, T.problem + 1, P2, STD, 'sine.out');
  fade(hud.scrimFull, T.problem - 1.2, 0, 0.9);
  fade(hud.scrimB, T.problem - 0.6, 1, 1.0);

  // ════════════════════════════════════════════════════════════════════════
  // 2 · ONE NETWORK, FRAGMENTED DATA                                  0:15 – 0:27
  // ════════════════════════════════════════════════════════════════════════
  const B = T.problem, ISL = B + 5.6;
  show(hud.chip, B + 0.3); chipState('q', B + 0.3);
  head('p1', B + 0.5, T.connect - 0.2);
  // every site is a signal of its own …
  to(LY, { sig: 1 }, B + 0.8, 3.0, 'none');
  // … and the answer is spread over three pieces of software and many spreadsheets
  sysTags.forEach((g, i) => tagIn(g, B + 1.4 + i * 0.3, 0.42));
  tagsOut(sysTags, ISL - 0.5, 0.4);
  camTo(B + 1, ISL, { px: 0, py: 150, pz: 204, tx: 0, tz: 4 }, 'sine.inOut');
  // the sites: Siège in Castelmar, Belmont, and the others, each an island
  camTo(ISL, T.connect, { ...AURA, py: 96, pz: 142, tz: 20 }, 'sine.inOut');
  to(LY, { sigDim: 0.6 }, ISL, 0.8);
  line('ring_hq', ISL + 0.6, 0.8); line('ring_hero', ISL + 0.8, 0.8);
  cityTags.forEach((g, i) => tagIn(g, ISL + 0.9 + i * 0.22, 0.45));
  tagsOut(cityTags, T.connect - 0.5, 0.4);

  // ════════════════════════════════════════════════════════════════════════
  // 3 · SNOWFLAKE: CONNECT ALL YOUR DATA                              0:27 – 0:45
  // ════════════════════════════════════════════════════════════════════════
  const C = T.connect, APPS = C + 6.0, PASS0 = C + 10.6, PASS1 = C + 15.6;
  show(hud.spine, C); spine(1, C + 0.2); fade(hud.scrimT, C, 1, 0.6);
  cam(C, C + 4.6, { ...AURA, py: 96, pz: 142, tz: 20 }, STD, 'sine.inOut');
  // the chapter title, centred, while the platform layer ignites behind it and spans the country
  fade(hud.scrimFull, C, 0.62, 0.5); fade(hud.scrimB, C, 0, 0.4);
  head('c0', C + 0.3, C + 5.0);
  to(LY, { sheet: 1, sigDim: 1 }, C + 0.9, 1.4);
  ringPulse(0, 40, 26, C + 0.9, 190, 3.6, 0.7);
  zone('region', C + 0.9, 2.2); zone('capital', C + 1.5, 1.6); zone('country', C + 2.0, 2.6);
  to(LY.connect, { IT: 1 }, C + 1.2, 2.6, 'power1.inOut');            // every site rises to the layer
  line('coast', C + 1.6, 2.0);
  P.flows.forEach((k, i) => line(k, C + 2.6 + (i % 12) * 0.08, 0.9));    // … and converges on one platform
  node('n_hub', C + 3.4); pulse('netFlow', C + 3.6);
  ringPulse(1, P.hub.x, P.hub.z, C + 3.6, 120, 2.6, 0.45);
  zone('brand', C + 3.4, 1.8);
  tl.fromTo(brand.s, { o: 0 }, { o: 1, duration: 1.0, ease: 'power1.out', immediateRender: false }, C + 4.9);
  to(Lg, { zone: 0.5 }, C + 4.0, 1.2);
  fade(hud.scrimFull, C + 4.4, 0, 0.8); fade(hud.scrimB, C + 4.6, 1, 0.6);
  head('c1', C + 5.1, T.foundation + 0.2);
  // the software of every site connects where it is
  cam(C + 4.6, PASS0, STD, SYS, 'power2.inOut');
  to(Lp, { netFlow: 0.4 }, APPS - 0.6, 0.8);
  sysTags.forEach((g, i) => tagIn(g, C + 5.4 + i * 0.06, 0.4));
  [['srcA', 0], ['srcB', 0.9], ['srcC', 1.8], ['excel', 2.7]].forEach(([k, dt]) => plugIn(L.sys[k], k, APPS + dt));
  pulse('appPing', APPS + 1.6); pulse('fileEvents', APPS + 3.0, 0.6);
  // — inside the Belmont open space: the same software, desk after desk, joins as the camera passes —
  tagsOut(sysTags, PASS0 - 0.6, 0.3);
  tl.to(brand.s, { o: 0, duration: 0.3 }, PASS0 - 0.6);
  dip(PASS0, 0.3);
  inOffice(PASS0, true); set(S.vis, { front: 0 }, PASS0);
  rig('day', PASS0);
  set(S.w, { hero: 0.6 }, PASS0);
  post({ focus: 0, hero: 0, range: 14, bokeh: 1.2, ...OFFICE_POST }, PASS0);
  fade(hud.scrimB, PASS0 - 0.3, 0.72, 0.5);
  cam(PASS0, PASS1, { px: -6, py: 1.5, pz: 7.4, tx: -2, ty: 1.0, tz: -6, fov: 46, ox: 0, oy: 0 }, { px: 13.5, py: 1.5, pz: 7.8, tx: 22, ty: 0.9, tz: -4 }, 'sine.inOut');
  const PK = (PASS1 - PASS0) / 5;
  const at = (s) => PASS0 + s * PK;
  const passIn = (id, t) => tagIn(L.pass[id], t - 0.3, 0.4);
  passIn('srcA', at(0.6)); plugIn(L.pass.srcA, 'in_srcA', at(0.9));
  passIn('srcB', at(1.5)); plugIn(L.pass.srcB, 'in_srcB', at(1.8));
  passIn('excel', at(2.5)); plugIn(L.pass.excel, 'in_excel', at(2.8));
  pulse('fileEvents', at(3.0), 1);
  passIn('srcC', at(3.5)); plugIn(L.pass.srcC, 'in_srcC', at(3.8));
  tagOut(L.pass.srcA, at(2.2), 0.3); tagOut(L.pass.srcB, at(3.1), 0.3); tagOut(L.pass.excel, at(4.1), 0.3);
  tagsOut([L.pass.srcC], PASS1 - 0.4, 0.3);
  // — back above le pays: everything is connected —
  dip(PASS1, 0.3);
  inOffice(PASS1, false);
  rig('studio', PASS1);
  post(TABLE_POST, PASS1);
  fade(hud.scrimB, PASS1, 1, 0.3);
  SYS_IDS.forEach((k) => { set(Ll, { [`conn_${k}`]: 1 }, PASS1); set(Ln, { [`n_${k}`]: 1 }, PASS1); });
  SYS_IDS.forEach((k) => set(L.sys[k].s, { plug: 1, conn: 1 }, PASS1));
  cam(PASS1, T.foundation - 0.3, { ...SYS, py: 134, pz: 190 }, SYS);
  sysTags.forEach((g, i) => tagIn(g, PASS1 + 0.15 + i * 0.05, 0.35));
  tl.to(brand.s, { o: 1, duration: 0.5 }, PASS1 + 0.1);
  ringPulse(1, P.hub.x, P.hub.z, PASS1 + 0.2, 160, 2.6, 0.4);
  pulse('netFlow', PASS1 + 0.2, 0.8);
  tagsOut(sysTags, T.foundation - 0.3, 0.35);

  // ════════════════════════════════════════════════════════════════════════
  // 4 · IN THE TOOL: ONE CLIENT RECORD                                0:45 – 1:00
  // ════════════════════════════════════════════════════════════════════════
  // le pays stays on the left; the Snowflake window opens on the right. The three spellings of the
  // same client leave their software and land in the window, where they become one record.
  const F = T.foundation, tr = hud.trust;
  const FAPP = { ...STD, py: 176, pz: 236, ox: -0.3 };
  {
    // where each incoming record lands (measured before anything moves the window; all sizes are relative to the frame)
    const box = tr.parentElement.getBoundingClientRect();
    L.fd.forEach((g) => g.forEach(({ target }, k) => {
      const r = hud.trRows[k].getBoundingClientRect();
      target.x = ((r.left + r.width * 0.5 - box.left) / box.width) * 2 - 1;
      target.y = 1 - ((r.top + r.height * 0.82 - box.top) / box.height) * 2;
    }));
  }
  cam(F - 0.3, F + 2.3, SYS, FAPP, 'power2.inOut');
  camTo(F + 2.3, T.network, { py: 170, pz: 228 }, 'sine.inOut');
  head('f1', F + 0.6, T.network - 0.2);
  tl.to(brand.s, { o: 0, duration: 0.5 }, F + 0.3);
  to(Lp, { netFlow: 0.25 }, F, 0.6);
  open(tr, F + 0.9);
  hud.trSources.forEach((e, i) => tl.fromTo(e, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, F + 1.3 + i * 0.08));
  hud.trRows.forEach((r) => { set([r.s1, r.s2], { opacity: 0 }, F); set(r, { '--m': 0 }, F); });
  hud.trRes.forEach((r) => { set(r, { opacity: 0 }, F); set(r.ok, { '--ok': 0 }, F); });
  set(hud.trQual, { opacity: 0, '--q': 0 }, F);
  L.fd.forEach((g, gi) => {
    const t = F + 1.9 + gi * 5.6, state = gi ? 's2' : 's1';
    // three pieces of software, three spellings of the same thing: one after the other they land in Snowflake
    g.forEach(({ tag, st }, k) => {
      const t0 = t + k * 0.42;
      tagIn(tag, t0, 0.3);
      tl.fromTo(st, { u: 0 }, { u: 1, duration: 1.1, ease: 'power2.inOut', immediateRender: false }, t0 + 0.34);
      tagOut(tag, t0 + 1.36, 0.2);
      tl.fromTo(hud.trRows[k][state], { opacity: 0 }, { opacity: 1, duration: 0.25 }, t0 + 1.4);
    });
    if (gi) hud.trRows.forEach((r) => { tl.to(r.s1, { opacity: 0, duration: 0.25 }, t + 1.0); tl.to(r, { '--m': 0, duration: 0.2 }, t + 1.0); });
    // they are the same client (the same mission): one record
    hud.trRows.forEach((r, k) => tl.to(r, { '--m': 1, duration: 0.25 }, t + 2.8 + k * 0.1));
    tl.fromTo(hud.trRes[gi], { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, t + 3.4);
    tl.fromTo(hud.trRes[gi].ok, { '--ok': 0 }, { '--ok': 1, duration: 0.35, ease: 'back.out(2.4)' }, t + 3.9);
  });
  const FQ = F + 1.9 + 5.6 + 4.5;
  tl.to(hud.trQual, { opacity: 1, duration: 0.3 }, FQ);
  tl.to(hud.trQual, { '--q': 1, duration: 0.9, ease: 'power2.out' }, FQ + 0.1);
  ringPulse(2, P.hub.x, P.hub.z, FQ, 120, 2.2, 0.4);
  hide(tr, T.network - 0.5);

  // ════════════════════════════════════════════════════════════════════════
  // 5 · 60 SITES, ONE OPERATING MODEL                              1:00 – 1:06
  // ════════════════════════════════════════════════════════════════════════
  const N0 = T.network;
  cam(N0, T.govern, FAPP, { ...STD, py: 186, pz: 250, ox: 0 }, 'power2.inOut');
  head('n1', N0 + 0.3, T.govern - 0.1);
  show(hud.share, N0 + 0.6, 0.5, 0.5);
  pulse('netFlow', N0 + 0.3, 1);
  ringPulse(0, P.hub.x, P.hub.z, N0 + 1.0, 200, 3.2, 0.65);
  tl.to(S.post, { bloom: 0.3, duration: 0.5, ease: 'power2.out' }, N0 + 1.0); tl.to(S.post, { bloom: 0.13, duration: 1.6, ease: 'sine.inOut' }, N0 + 1.5);
  hide(hud.share, T.govern - 0.5);

  // ════════════════════════════════════════════════════════════════════════
  // 6 · EVERYONE SEES WHAT THEY ARE ENTITLED TO SEE                   1:06 – 1:16
  // ════════════════════════════════════════════════════════════════════════
  const G = T.govern, GOV = { ...SYS, py: 140, pz: 196, ox: -0.28 };
  spine(2, G);
  cam(G, G + 2.2, { ...STD, py: 186, pz: 250, ox: 0 }, GOV, 'power2.inOut');
  camTo(G + 2.2, T.context, { py: 134, pz: 188 }, 'sine.inOut');
  layerLevel(0.15, G, 1.0);
  to(Lg, QUIET, G, 0.8);
  to(LY, { sigDim: 0.3 }, G, 0.8);
  to(Lp, { netFlow: 0.15, fileEvents: 0.2 }, G, 0.8);
  SYS_IDS.forEach((k) => set(L.sys[k].s, { conn: 0, mask: 0 }, G));
  sysTags.forEach((g, i) => tl.fromTo(g.s, { o: 0, k: 0.78 }, { o: 1, k: 0.9, duration: 0.4, ease: 'back.out(1.7)', immediateRender: false }, G + 1.4 + i * 0.05));
  head('g1', G + 0.3, T.context - 0.2);
  open(hud.gov, G + 0.6, 0.65);
  hud.govRows.forEach((r, i) => pop(r, G + 0.8 + i * 0.14, 0.4, 6));
  GOV_ROLES.forEach((role, i) => {
    const t = G + 2.0 + i * 1.8, masked = SYS_IDS.filter((k) => !role.sees.includes(k));
    hud.govRows.forEach((r, k) => tl.to(r, { '--on': k === i ? 1 : 0, duration: 0.3 }, t));
    SYS_IDS.forEach((k) => tl.to(L.sys[k].s, { mask: masked.includes(k) ? 1 : 0, duration: 0.4 }, t));
  });
  hide(hud.gov, T.context - 0.6);
  tagsOut(sysTags, T.context - 0.45);

  // ════════════════════════════════════════════════════════════════════════
  // 7 · CONNECT THE DATA. UNDERSTAND THE BUSINESS.                    1:16 – 1:29
  // ════════════════════════════════════════════════════════════════════════
  const X = T.context, CTX = { px: 0, py: 150, pz: 206, tx: 0, ty: 0, tz: 2, fov: 28, ox: 0, oy: 0 };
  spine(3, X);
  cam(X, X + 2.2, GOV, { ...CTX, py: 156, pz: 214 }, 'power2.inOut');
  camTo(X + 2.2, T.metier, { py: CTX.py, pz: CTX.pz }, 'sine.inOut');
  to(LY, { sigDim: 0.15 }, X, 1.0);
  layerLevel(0.05, X, 1.0);
  to(Lg, { app: 0.14, file: 0.14, iot: 0.14, zone: 0.25 }, X, 1.0);
  to(Lp, { netFlow: 0.08, fileEvents: 0.1 }, X, 1.0);
  head('x1', X + 0.3, T.metier - 0.2);
  // data → relationships → business
  const dstep = (i, t) => hud.dsteps.forEach((e, k) => tl.to(e, { color: k === i ? '#29b5e8' : k < i ? 'rgba(255,255,255,0.84)' : 'rgba(255,255,255,0.3)', duration: 0.4 }, t));
  show(hud.dstrip, X + 0.7, 0.6, 0.4); dstep(0, X + 0.7);
  // first: separate records, each known to a different piece of software
  IDS.forEach((id, i) => tagIn(L.ctx[id], X + 1.0 + i * 0.2, 0.4));
  // then the relationships, one after the other: the site itself becomes the model
  const CT = X + 3.4, STEP = 0.9;
  dstep(1, CT - 0.2);
  IDS.forEach((id, i) => {
    const t = CT + i * STEP, tag = L.ctx[id];
    if (i) line(`e_${IDS[i - 1]}`, t - 0.55, 0.6);
    node(`c_${id}`, t);
    line(`d_${id}`, t + 0.05, 0.6);
    tl.fromTo(tag.s, { link: 0 }, { link: 1, duration: 0.3, immediateRender: false }, t);
    flash(tag, t);
  });
  const CE = CT + IDS.length * STEP;
  dstep(2, CE); chipBeat(CE);
  ringPulse(0, 0, -10, CE, 150, 2.4, 0.5);
  pulse('ctxFlow', CE);
  Object.values(L.ctx).forEach((g) => flash(g, CE + 0.1));
  hide(hud.dstrip, T.metier - 0.5);
  tagsOut(Object.values(L.ctx), T.metier - 0.45);

  // ════════════════════════════════════════════════════════════════════════
  // 8 · THE TRADE, EVERY DAY: WORKLOAD · BENCHMARK · DECLARATIONS              1:29 – 1:41
  // ════════════════════════════════════════════════════════════════════════
  const M0 = T.metier, MT = { ...AURA, py: 82, pz: 126, ox: -0.26 };
  cam(M0, M0 + 2.0, CTX, MT, 'power2.inOut');
  camTo(M0 + 2.0, T.einv, { px: 44, tx: 44 }, 'sine.inOut');
  to(Lg, { ctx: 0.12 }, M0, 0.8); to(Lp, { ctxFlow: 0 }, M0, 0.8);
  to(LY, { sigDim: 0.5 }, M0, 0.8);
  head('mt', M0 + 0.3, T.einv - 0.2);
  show(hud.beatBox, M0 + 0.5, 0.5, 0.6);
  hud.beats.forEach((b, i) => {
    const t = M0 + 0.6 + i * 3.8;
    tl.fromTo(b, { autoAlpha: 0, x: '2em' }, { autoAlpha: 1, x: '0em', duration: 0.5, ease: 'power3.out', immediateRender: false }, t);
    if (i < hud.beats.length - 1) tl.to(b, { autoAlpha: 0, x: '-1em', duration: 0.35, ease: 'power1.in' }, t + 3.45);
  });
  // the sites each reading is about
  const beatTags = K.beatCities.map((ids) => ids.map((id) => (id === 'hero' || id === 'hq' ? L.zone[id] : L.city[id])));
  beatTags.forEach((g, i) => { const t = M0 + 0.8 + i * 3.8; g.forEach((tag, k) => { tagIn(tag, t + k * 0.15, 0.4); tagOut(tag, t + 3.2, 0.3); }); });
  line('ring_hero', M0 + 0.8, 0.5); line('ring_hq', M0, 0.3, 0);
  hide(hud.beatBox, T.einv - 0.5);

  // ════════════════════════════════════════════════════════════════════════
  // 9 · E-INVOICING: AN OPPORTUNITY, READ IN SOURCE A                    1:41 – 1:49
  // ════════════════════════════════════════════════════════════════════════
  const E0 = T.einv;
  cam(E0, T.every, { ...MT, px: 44, tx: 44 }, { ...STD, py: 176, pz: 236, ox: -0.28 }, 'power2.inOut');
  head('ei', E0 + 0.3, T.every - 0.2);
  open(hud.einv, E0 + 0.7);
  [...hud.einv.children].forEach((c, i) => pop(c, E0 + 0.9 + i * 0.25, 0.4, 6));
  to(LY, { sigDim: 1 }, E0 + 1.6, 0.6);
  ringPulse(1, P.hub.x, P.hub.z, E0 + 1.8, 200, 3.0, 0.6);
  line('ring_hero', E0, 0.4, 0);
  hide(hud.einv, T.every - 0.6);

  // ════════════════════════════════════════════════════════════════════════
  // 10 · ONE CONTEXT. EVERY EXPERIENCE.                               1:49 – 2:00
  // ════════════════════════════════════════════════════════════════════════
  const EV = T.every, WAKE = EV + 3.0, pb = screens.bi, bi = apps.bi;
  spine(4, EV);
  hide(hud.chip, EV - 0.4, 0.4);
  set(S.stage, { desk: 1, solo: 0, lit: 0 }, EV);
  rig('desk', EV);
  post({ focus: 0, hero: 0, range: 400, bokeh: 0.4, aoR: 3, bloom: 0.1, vignette: 0.3, sat: 1.04, contrast: 1.03 }, EV);
  cam(EV, T.bi, { px: 0, py: 41.6, pz: 484, tx: 0, ty: 26.0, tz: 311.2, fov: 28.4, ox: 0, oy: 0 }, { px: 0, py: 41.2, pz: 478, tx: 0, ty: 26.0, tz: 311.2 }, 'sine.inOut');
  head('v1', EV + 0.4, T.bi - 0.2);
  // the same question, asked everywhere …
  show(hud.xask, EV + 1.8, 0.5, 0.5);
  // … the same answer, everywhere
  const devs = [pb, screens.snowflake, screens.claude, screens.openai, screens.ops];
  set(bi.kpis, { autoAlpha: 1, y: 0 }, EV); set(bi.detail, { opacity: 0 }, EV); set(bi.cursor, { autoAlpha: 0 }, EV); set(bi.selRow, { '--row': 0 }, EV);
  devs.forEach((scr, i) => tl.fromTo(scr.s, { o: 0 }, { o: 1, duration: 0.45, immediateRender: false }, WAKE + i * 0.42));
  to(S.stage, { lit: 1 }, WAKE, 2.2, 'power1.out');
  tl.fromTo(bi.kpis[0], { '--sel': 0 }, { '--sel': 1, duration: 0.3 }, WAKE + 0.5);
  tl.fromTo(apps.ops.tiles[0], { '--sel': 0 }, { '--sel': 1, duration: 0.3 }, WAKE + 2.2);
  show(hud.xbase, WAKE + 2.8, 0.6, 0.5);
  hide(hud.xask, T.bi - 0.5); hide(hud.xbase, T.bi - 0.5);

  // ════════════════════════════════════════════════════════════════════════
  // 11 · BI — WHERE DO WE STAND?                                2:00 – 2:07
  // ════════════════════════════════════════════════════════════════════════
  const B0 = T.bi;
  set(S.stage, { solo: 1 }, B0);
  [screens.snowflake, screens.ops, screens.claude, screens.openai].forEach((s) => set(s.s, { o: 0 }, B0));
  cam(B0, T.agents, { px: -19.4, py: 33, pz: 406, tx: -11.8, ty: 29.3, tz: 311.2, fov: 26 }, { px: -18.1, py: 32.6, pz: 401.5, tx: -11.7, ty: 29.3, tz: 311.2 }, 'sine.out');
  post({ range: 40, bokeh: 1.6 }, B0);
  fade(hud.scrimL, B0, 0.7, 0.01);
  set(bi.kpis[0], { '--sel': 0 }, B0);
  head('b1', B0 + 0.3, T.agents - 0.2);
  show(hud.chip, B0 + 0.4, 0.5);
  tl.fromTo(bi.kpis[3], { '--sel': 0 }, { '--sel': 1, duration: 0.3 }, B0 + 1.3);
  tl.fromTo(bi.cursor, { autoAlpha: 0, x: 1070, y: 206 }, { autoAlpha: 1, x: 170, y: 348, duration: 0.8, ease: 'power2.inOut', force3D: false }, B0 + 1.9);
  tl.fromTo(bi.selRow, { '--row': 0 }, { '--row': 1, duration: 0.3 }, B0 + 2.7);
  tl.fromTo(bi.detail, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', force3D: false }, B0 + 3.0);
  tl.to(bi.cursor, { autoAlpha: 0, duration: 0.3 }, B0 + 3.5);
  chipState('risk', B0 + 3.2); chipBeat(B0 + 3.2);

  // ════════════════════════════════════════════════════════════════════════
  // 12 · THE AI ANALYSES. THE DIRECTOR DECIDES. THE SOFTWARE EXECUTES.  2:07 – 2:23
  // ════════════════════════════════════════════════════════════════════════
  const AG = T.agents, DEC = AG + 5.6, EXE = AG + 10.2, ag = apps.agent;
  const AGC = { ...CTX, py: 156, pz: 214, ox: -0.2 };
  const step = (i, t) => hud.agSteps.forEach((e, k) => tl.to(e, { opacity: k === i || i < 0 ? 1 : 0.42, duration: 0.4 }, t));
  tl.to(pb.s, { o: 0, duration: 0.01 }, AG);
  set(S.stage, { desk: 0, solo: 0, lit: 0 }, AG);
  rig('studio', AG);
  post(TABLE_POST, AG);
  fade(hud.scrimL, AG, 0, 0.01);
  layerLevel(0.06, AG, 0.01);
  to(Lg, { ctx: 0.35, app: 0.25, zone: 0.2 }, AG, 0.01); to(Lp, { ctxFlow: 0.12 }, AG, 0.01);
  hud.agSteps.forEach((e) => set(e, { opacity: 0.42 }, AG));
  cam(AG, T.impact, { ...AGC, py: 162, pz: 222 }, AGC, 'sine.inOut');
  fade(hud.scrimB, AG, 1, 0.01);
  head('ag1', AG + 0.3, T.impact - 0.2);
  show(ag.root, AG + 0.2, 0.6, 1);
  // why? — it analyses: the causes, traced through the business chain of the site
  step(0, AG + 0.5);
  set(ag.ask2, { opacity: 0 }, AG);
  tl.fromTo(ag.pageWhy, { opacity: 0 }, { opacity: 1, duration: 0.4 }, AG + 0.6);
  ag.causes.forEach((c) => set(c, { attr: { 'data-on': '0' } }, AG));
  const causeOn = (i, t) => set(ag.causes[i], { attr: { 'data-on': '1' } }, t);
  tl.fromTo(Ll, { trace: 0 }, { trace: TR.temps, duration: 1.0, ease: 'sine.inOut', immediateRender: false }, AG + 0.8);
  causeOn(1, AG + 1.8); line('rf_temps', AG + 1.8, 0.4); tagIn(L.risk.temps, AG + 1.9);
  tl.to(Ll, { trace: TR.factu, duration: 0.7, ease: 'sine.inOut' }, AG + 2.1);
  causeOn(0, AG + 2.8); line('rf_factu', AG + 2.8, 0.5); tagIn(L.risk.factu, AG + 2.9);
  tl.to(Ll, { trace: 1, duration: 1.0, ease: 'sine.inOut' }, AG + 3.2);
  causeOn(2, AG + 4.2); line('rf_echeance', AG + 4.2, 0.5); tagIn(L.risk.echeance, AG + 4.3);
  // what should we do? — the director decides: three actions, one approval
  step(1, DEC);
  tl.to(ag.ask1, { opacity: 0, duration: 0.25 }, DEC - 0.1); tl.to(ag.ask2, { opacity: 1, duration: 0.25 }, DEC + 0.05);
  tagsOut(Object.values(L.risk), DEC - 0.2);
  tl.to(ag.pageWhy, { opacity: 0, duration: 0.3 }, DEC - 0.1);
  tl.fromTo(ag.pageDo, { opacity: 0 }, { opacity: 1, duration: 0.4 }, DEC + 0.1);
  line('okf_factu', DEC + 0.4, 0.8); tagIn(L.opt.factu, DEC + 0.6);
  line('okf_temps', DEC + 0.9, 0.8); tagIn(L.opt.temps, DEC + 1.1);
  line('okf_echeance', DEC + 1.4, 0.8); tagIn(L.opt.echeance, DEC + 1.6);
  tl.fromTo(ag.go, { scale: 1 }, { scale: 1.05, duration: 0.18, yoyo: true, repeat: 1, transformOrigin: '100% 50%' }, DEC + 2.6);
  tl.fromTo(ag.opts, { '--on': 0 }, { '--on': 1, duration: 0.3 }, DEC + 2.8);
  tl.fromTo(ag.goDone, { opacity: 0 }, { opacity: 1, duration: 0.25 }, DEC + 2.8);
  tl.to(Ll, { trace: 0, rf_temps: 0, rf_factu: 0, rf_echeance: 0, duration: 0.7 }, DEC + 2.9);
  // the software executes: the decision is written back to Source A and Source B
  step(2, EXE);
  tl.to(ag.pageDo, { opacity: 0, duration: 0.3 }, EXE - 0.1);
  tl.fromTo(ag.pageExec, { opacity: 0 }, { opacity: 1, duration: 0.4 }, EXE + 0.1);
  tagsOut(Object.values(L.opt), EXE - 0.1);
  to(Lg, { app: 1 }, EXE - 0.2, 0.5);
  pulse('writeBack', EXE + 0.2);
  [['srcA', 0], ['srcB', 1]].forEach(([k, i]) => {
    const t = EXE + 0.4 + i * 0.9;
    set(L.sys[k].s, { mask: 0, alt: 0, conn: 0 }, EXE);
    tagIn(L.sys[k], t - 0.1, 0.4); flash(L.sys[k], t + 0.15);
    tl.fromTo(L.sys[k].s, { alt: 0 }, { alt: 1, duration: 0.3, immediateRender: false }, t + 0.2);
    pop(ag.wbs[i], t, 0.4, 6);
  });
  chipState('plan', EXE + 3.3); chipBeat(EXE + 3.3);
  step(-1, EXE + 3.6);
  hide(ag.root, T.impact - 0.6);
  tagsOut(['srcA', 'srcB'].map((k) => L.sys[k]), T.impact - 0.5);

  // ════════════════════════════════════════════════════════════════════════
  // 13 · WHAT CHANGES FOR THE NETWORK                                 2:23 – 2:32
  // ════════════════════════════════════════════════════════════════════════
  const I0 = T.impact;
  ['srcA', 'srcB'].forEach((k) => set(L.sys[k].s, { alt: 0 }, I0));
  cam(I0, I0 + 2.4, AGC, { ...STD, py: 176, pz: 236 }, 'power2.inOut');
  camTo(I0 + 2.4, T.close, { px: 0, tx: 0, py: 168, pz: 226 }, 'sine.inOut');
  tl.to(Ll, { okf_factu: 0, okf_temps: 0, okf_echeance: 0, duration: 0.5 }, I0);
  pulse('writeBack', I0, 0, 0.4);
  layerLevel(0.25, I0, 1.0);
  to(Lg, { app: 0.45, file: 0.4, iot: 0.4, ctx: 0.45, zone: 0.4 }, I0, 1);
  to(Lp, { netFlow: 0.6, fileEvents: 0.4, ctxFlow: 0.4 }, I0, 1);
  to(LY, { sigDim: 0.7 }, I0, 1);
  fade(hud.scrimFull, I0 + 0.2, 0.5, 0.8);
  head('i0', I0 + 0.3, T.close - 0.1);
  show(hud.kpi, I0 + 0.6, 0.5);
  hud.kpis.forEach((k) => set(k, { opacity: 0 }, I0));
  hud.kpis.forEach((k, i) => pop(k, I0 + 0.9 + i * 0.6, 0.45, 10));
  tl.fromTo(hud.kpiNote, { opacity: 0 }, { opacity: 1, duration: 0.5 }, I0 + 3.0);
  hide(hud.kpi, T.close - 0.6);

  // ════════════════════════════════════════════════════════════════════════
  // 14 · BACK IN BELMONT — THE OBJECTIVE IS WITHIN REACH AGAIN          2:32 – 2:42
  // ════════════════════════════════════════════════════════════════════════
  const Z = T.close, END = Z + 4.8;
  hide(hud.spine, Z - 0.5, 0.4); hide(hud.chip, Z - 0.5, 0.4);
  fade(hud.scrimB, Z - 0.4, 0, 0.4); fade(hud.scrimT, Z - 0.4, 0, 0.4); fade(hud.scrimFull, Z - 0.4, 0, 0.4);
  dip(Z, 0.35);
  // the same open space, the same screen — now connected
  inOffice(Z, true);
  set(S.w, { hero: 0.2 }, Z);
  rig('day', Z);
  set(S.post, { bokeh: 3.0, range: 1.2, focus: 6, hero: 1, ...OFFICE_POST, bloom: 0.06 }, Z);
  set(LY, { sheet: 0, sig: 0, sigDim: 0.5 }, Z);
  set(LY.connect, { IT: 0 }, Z);
  set(Lg, { app: 0.5, file: 0.4, ctx: 0, stub: 0, risk: 0, ok: 0, zone: 0 }, Z);
  set(Lp, { appPing: 0.6, ctxFlow: 0, netFlow: 0, fileEvents: 0.4 }, Z);
  cam(Z, DURATION, DESK1, { px: -0.16, py: 1.3, pz: 11.9, tx: -0.3, ty: 0.9, tz: -6 }, 'sine.out');
  set([apps.sf.qty, apps.sf.date], { '--hi': 0 }, Z);
  set(apps.sf.root, { '--ok': 1 }, Z);
  tl.fromTo(sf.s, { o: 0 }, { o: 1, duration: 0.7, ease: 'power1.out', immediateRender: false }, Z);
  fade(hud.scrimL, Z, 0.8, 0.6);
  head('z1', Z + 0.5, END + 0.1);
  // quiet end title
  tl.to(S.post, { fade: 0.04, duration: 1.2, ease: 'power1.inOut' }, END - 0.3);
  tl.to(sf.s, { o: 0, duration: 0.8 }, END - 0.3);
  to(S.w, { hero: 0 }, END - 0.3, 0.9);
  fade(hud.scrimL, END - 0.3, 0, 0.8);
  tl.fromTo(hud.end, { autoAlpha: 0, scale: 0.97 }, { autoAlpha: 1, scale: 1, duration: 1.1, ease: 'power2.out' }, END + 0.5);
  tl.to({}, { duration: 0.01 }, DURATION - 0.01);
  return tl;
}
