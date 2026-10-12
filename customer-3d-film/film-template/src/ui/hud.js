// Film titling and persistent HUD. All visible text comes from ../content.js.
import { el, img } from './dom.js';
import { K } from '../content.js';

/** The four sources of the film, and what each role is allowed to see. */
export const GOV_SYSTEMS = ['srcA', 'srcB', 'srcC', 'excel'];
export const GOV_DOMAINS = K.gov.domains;
export const GOV_ROLES = K.gov.roles;

/** The Snowflake application window. */
function appWindow(cls, section, tabs, live) {
  const tabEls = tabs.map((t) => el('span', { text: t }));
  const top = el('div.sa-top', null,
    el('div.sa-brand', null, img('snowflakeBlue'), el('b', { text: 'Snowflake' })),
    el('span.sa-sec', { text: section }),
    el('div.sa-tabs', null, ...tabEls),
    el('div.sa-live', null, el('i'), el('span', { text: live })),
    el('div.sa-acct', null, el('small', { text: K.trust.account }), el('b', { text: K.trust.accountName })));
  return { root: el(`div.snowapp.${cls}`, null, top), tabs: tabEls };
}

export function buildHud(ui) {
  const R = {};
  const add = (node) => { ui.append(node); return node; };
  const HL = K.headlines, [S1, S2, S3, S4] = K.steps;

  R.scrimB = add(el('div.scrim.b'));
  R.scrimL = add(el('div.scrim.l'));
  R.scrimT = add(el('div.scrim.t'));
  R.scrimFull = add(el('div.scrim.full'));

  // ── headlines ─────────────────────────────────────────────────────────────
  const H = {};
  const snow = img('snowflakeBlue').src;
  const SNOW = (...steps) => `<img src="${snow}" alt=""><b>Snowflake</b>${steps.map((s) => `<i>·</i><span>${s}</span>`).join('')}`;
  const BRAND = `<img src="${snow}" alt=""><b>Snowflake</b><span>${K.meta.brandTag}</span>`;
  const ORDER = K.director;
  const hl = (id, { h, sub = null, eyebrow = null, cls = '', ecls = '' }) => {
    const n = el(`div.hl${cls ? '.' + cls.split(' ').join('.') : ''}`);
    if (eyebrow) n.append(el(`div.eyebrow${ecls ? '.' + ecls : ''}`, { html: eyebrow }));
    const h1 = el('h1', { html: h });
    n.append(h1);
    if (sub) n.append(el('p', { html: sub }));
    n.h1 = h1;
    H[id] = add(n);
    return n;
  };
  // 1 · the site's objective
  hl('o1', { cls: 'mid', eyebrow: ORDER, ...HL.o1 });
  hl('o2', { cls: 'center big', ...HL.o2 });
  // 2 · the real problem
  hl('p1', { ...HL.p1 });
  // 3 · Snowflake enters
  hl('c0', { cls: 'center big', eyebrow: BRAND, ecls: 'brand', ...HL.c0 });
  hl('c1', { cls: 'third', eyebrow: BRAND, ecls: 'brand', ...HL.c1 });
  // 4 · one client record
  hl('f1', { eyebrow: BRAND, ecls: 'brand', ...HL.f1 });
  // 5 · one network
  hl('n1', { cls: 'wide two', eyebrow: SNOW(S1), ...HL.n1 });
  // 6 · access
  hl('g1', { eyebrow: SNOW(S2), ...HL.g1 });
  // 7 · business context
  hl('x1', { eyebrow: SNOW(S3), ...HL.x1 });
  // 8 · the trade, every day
  hl('mt', { eyebrow: SNOW(S3), ...HL.mt });
  // 9 · sector lever
  hl('ei', { eyebrow: SNOW(S3), ...HL.ei });
  // 10–12 · act everywhere
  hl('v1', { cls: 'center top', eyebrow: SNOW(S4), ...HL.v1 });
  hl('b1', { eyebrow: SNOW(S4, K.stepDash), ...HL.b1 });
  const ag = hl('ag1', { cls: 'steps', eyebrow: SNOW(S4, K.stepAgent), ...HL.ag1 });
  R.agSteps = [...ag.h1.querySelectorAll('span')];
  // 13 · impact
  hl('i0', { ...HL.i0 });
  // 14 · the objective, within reach again
  hl('z1', { cls: 'mid', eyebrow: ORDER, ...HL.z1 });
  R.H = H;

  R.end = add(el('div.endmark', null,
    el('div.mk', null, el('div.lgw', null, img('client')), el('i.x', { text: '×' }), img('snowflakeBlue'), el('div', null, el('span', { text: 'Snowflake' }), el('small', { text: K.meta.brandTag }))),
    el('p', { text: K.endLine })));

  // ── the site's objective, always in the corner ─────────────────────────
  const st = (cls, [k, v]) => el(`div.st${cls ? '.' + cls : ''}`, null, el('div.k', { text: k }), el('div.v', { text: v }));
  R.chipStates = {
    q: st('', K.chip.q),
    risk: st('risk', K.chip.risk),
    plan: st('ok', K.chip.plan),
  };
  R.chip = add(el('div.chip', null,
    el('div.main', null, el('div.k', { text: K.chip.label }), el('div.v', { html: K.chip.value })),
    el('div.state', null, ...Object.values(R.chipStates))));

  // ── spine: connect → secure → understand → act ────────────────────────────
  R.spine = add(el('div.spine', { 'data-step': '0' }, img('snowflakeBlue'),
    el('div.step.s1', { text: S1 }), el('div.sep'), el('div.step.s2', { text: S2 }), el('div.sep'), el('div.step.s3', { text: S3 }), el('div.sep'), el('div.step.s4', { text: S4 })));

  // ── data → relationships → business ───────────────────────────────────────
  R.dsteps = K.dsteps.map((t) => el('span', { text: t }));
  R.dstrip = add(el('div.dstrip', null, R.dsteps[0], el('i', { text: '→' }), R.dsteps[1], el('i', { text: '→' }), R.dsteps[2]));

  // ── who sees what ─────────────────────────────────────────────────────────
  {
    const LBL = K.gov.cellLabels;
    const cell = (v) => (v ? el(`div.hc.${v === 'all' ? 'all' : 'own'}`, { text: LBL[v] }) : el('div.hc.no', null, el('i.lk')));
    const role = ({ tag, who, scope, cells, inherit }) => el(`div.hrow${inherit ? '.ai' : ''}`, null,
      el('div.who', null, tag ? el('div.av', { text: tag }) : el('div.av.sn', null, img('snowflakeBlue')), el('div', null, el('b', { text: who }), el('span', { text: scope }))),
      ...(inherit ? [el('div.hai', null, el('i', { text: '⇄' }), el('span', { text: K.gov.inherit }))] : cells.map(cell)));
    R.govRows = GOV_ROLES.map(role);
    R.gov = add(el('div.gov', null,
      el('div.gh', null, img('snowflakeBlue'), el('div', null, el('b', { text: K.gov.title }), el('span', { text: K.gov.subtitle }))),
      el('div.hcols', null, el('span'), ...GOV_DOMAINS.map((t) => el('span', { text: t }))),
      ...R.govRows,
      el('div.hleg', null, el('span', null, el('i.lk'), K.gov.noAccess), el('span', null, K.gov.legend))));
  }

  // ── one network ───────────────────────────────────────────────────────────
  const [shN, ...shRest] = K.share;
  R.share = add(el('div.sharebar', null, el('b', { text: shN }), ...shRest.map((t) => el('span', { text: t }))));

  // ── in the tool: one client record ────────────────────────────────────────
  {
    const T = K.trust, RC = K.record, SR = K.sources;
    const w = appWindow('trust', T.section, T.tabs, T.live);
    w.tabs[1].classList.add('on');
    const SRC = [['srcA'], ['srcB'], ['srcC'], [null, SR.excel.plate]];
    R.trSources = SRC.map(([k, t]) => el('div.tr-s', null, k ? img(k, `m-${k}`) : el('span', { text: t }), el('i')));
    const row = (a, b) => {
      const st2 = ([sys, val], c) => el(`div.s.${c}`, null, el('b', { text: sys }), el('span', { text: val }));
      const r = el('div.tr-row', null, st2(a, 's1'), st2(b, 's2'));
      [r.s1, r.s2] = r.children;
      return r;
    };
    R.trRows = [row([SR.srcA.name, RC.client], [SR.srcA.name, RC.mission]), row([SR.srcC.name, RC.clientCode], [SR.srcB.name, RC.missionCode]), row([SR.excel.name, RC.clientExcel], [SR.excel.name, RC.missionExcel])];
    const res = (k, how, v) => { const r = el('div.tr-res', null, el('small', null, k, el('em', { text: how })), el('b', { text: v }), el('u', { text: '✓' })); r.ok = r.lastChild; return r; };
    R.trRes = [res(RC.labelClient, RC.how, RC.clientFull), res(RC.labelMission, RC.how, RC.missionFull)];
    R.trQual = el('div.tr-q', null, el('span', { text: RC.quality }), el('div', null, el('i')), el('b', { text: RC.qualityValue }));
    R.trIn = el('div.tr-in', null, el('h6', { text: T.inTools }), ...R.trRows);
    R.trust = add(w.root);
    w.root.append(el('div.sa-body.tr', null,
      el('div.tr-src', null, el('h6', null, T.sources, el('em', { text: T.sourcesLive })), el('div', null, ...R.trSources)),
      el('div.tr-flow', null, R.trIn, el('div.arr'),
        el('div.tr-out', null, el('h6', { text: T.out }), ...R.trRes, R.trQual))));
  }

  // ── the trade, every day: three short readings ────────────────────────────
  {
    const bar = ([label, pct, text, cls = '']) => el(`div.bt-r${cls ? '.' + cls : ''}`, null, el('span', { text: label }), el('div', null, el('i', { style: `width:${Math.min(100, pct)}%` })), el('b', { text }));
    const card = ([k, title, rows, note]) => el('div.bt', null, el('small', { text: k }), el('h5', { text: title }), el('div.bt-rows', null, ...rows.map(bar)), el('p', { html: note }));
    R.beats = K.beats.map(card);
    R.beatBox = add(el('div.beats', null, ...R.beats));
  }

  // ── sector lever (e.g. a new regulation), read in Source A ──────────────────
  const RG = K.reg;
  R.einv = add(el('div.einv', null,
    el('div.ei-h', null, img('srcA', 'm-srcA'), el('span', { text: RG.head })),
    el('div.ei-n', null, el('b', { text: RG.n1[0] }), el('span', { text: RG.n1[1] })),
    el('div.ei-n.ok', null, el('b', { text: RG.n2[0] }), el('span', { text: RG.n2[1] })),
    el('div.ei-cal', null, ...RG.cal.map(([k, v]) => el('div', null, el('small', { text: k }), el('span', { text: v }))))));

  // ── one context, every experience ─────────────────────────────────────────
  R.xask = add(el('div.xask', null, el('i', { text: K.sameQuestion }), el('span', { text: `« ${K.question} »` })));
  R.xbase = add(el('div.xbase', null, img('snowflakeBlue'), el('span', { html: K.oneContext })));

  // ── business impact: orders of magnitude, each with its hypothesis ────────
  const kpi = ([k, v, hyp]) => el('div.kt', null, el('b', { text: k }), el('span', { html: v }), el('em', { text: hyp }));
  R.kpis = K.impact.map(kpi);
  R.kpiNote = el('div.note', { text: K.impactNote });
  R.kpi = add(el('div.kpis', null, el('div.r', null, ...R.kpis), R.kpiNote));

  R.blackout = add(el('div.blackout'));
  return R;
}
