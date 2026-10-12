// Application screens. All visible text comes from ../content.js.
// Source A site dashboard, BI network report, agent panel, Snowflake Intelligence, Source A ops app, AI assistants.
import { el, img } from './dom.js';
import { K } from '../content.js';

const pair = (cls, a, b) => { const A = el('div.s.s1', null, ...[].concat(a)), B = el('div.s.s2', null, ...[].concat(b)); return { root: el(`div.pair${cls ? '.' + cls : ''}`, null, A, B), s1: A, s2: B }; };
const Q1 = K.question;
const source = () => el('div.src', null, img('snowflakeBlue'), el('span', { text: K.assistant.src }));

/** Source A site dashboard — the opening screen. Logical size 1280 × 720. */
export function buildSalesforce() {
  const R = {}, M = K.monitor;
  R.qty = el('b', { text: M.objValue });
  R.date = el('b', { text: M.dueValue });
  const root = el('div.sf', null,
    el('div.sf-top', null, img('srcA'), el('div.app', { text: M.app }), el('div.search', { text: M.search }), el('div.ava')),
    el('div.sf-tabs', null, ...M.tabsBefore.map((t) => el('span', { text: t })), el('span.on', { text: M.tabOn }), ...M.tabsAfter.map((t) => el('span', { text: t }))),
    el('div.sf-body', null,
      el('div.card.sf-head', null,
        el('div.ico', { text: M.icon }),
        el('div.ttl', null, el('small', { text: M.kicker }), el('b', { text: M.title })),
        ...M.fields.map(([k, v]) => el('div.f', null, el('small', { text: k }), el('span', { text: v }))),
        el('div.badge', null, el('span.a', { text: M.badge[0] }), el('span.b', { text: M.badge[1] }))),
      el('div.card.sf-commit', null,
        el('h3', { text: M.commitTitle }),
        el('div.pair2', null,
          el('div.big', null, el('small', { text: M.objLabel }), R.qty, el('span', { text: M.objUnit })),
          el('div.big', null, el('small', { text: M.dueLabel }), R.date, el('span', { text: M.dueUnit }))),
        el('div.rows', null,
          ...M.rows.map(([k, v]) => el('div', null, el('small', { text: k }), el('span', { text: v }))),
          el('div.status', null, el('small', { text: M.status[0] }), el('span.a', { text: M.status[1] }), el('span.b', { text: M.status[2] })))),
      el('div.card.sf-act', null,
        el('h3', { text: M.activityTitle }),
        ...M.activity.map(([k, v, quote]) => el('div.it', null, el('i'), el('div', null, el('b', { text: k }), quote ? el('div.q', { text: v }) : v))))));
  R.root = root;
  return R;
}

/** BI report — network performance. Logical size 1280 × 720. */
export function buildBI() {
  const R = {}, B = K.bi;
  const kpi = ([label, value, unit, note, cls = '']) => el(`div.vis.kpi${cls ? '.' + cls : ''}`, null, el('small', { text: label }), el('b', { html: `${value}${unit ? `<u>${unit}</u>` : ''}` }), el('em', { text: note }));
  R.kpis = B.kpis.map(kpi);
  const row = (cells, sel) => { const tr = el(`tr${sel ? '.sel' : ''}`); cells.forEach((c, i) => tr.append(el(`td${i === 4 ? '.late' : ''}`, { text: c }))); return tr; };
  R.selRow = row(B.rows[0], true);
  const table = el('table', null,
    el('tr', null, ...B.head.map((t) => el('th', { text: t }))),
    R.selRow, ...B.rows.slice(1).map((r) => row(r)));
  const heights = B.bars;
  const bars = el('div.bars', null, ...heights.map((h, i) => el(`i${i === heights.length - 1 ? '.lo' : ''}`, { style: `height:${h}%` })));
  const axis = el('div.axis', null, ...B.months.map((t) => el('span', { text: t })));
  const hbar = ([label, pct, text, hot]) => el('div.hb', null, el('span', { text: label }), el('div', null, el(`i${hot ? '.hot' : ''}`, { style: `width:${pct}%` })), el('b', { text }));
  const capacity = el('div.vis.c12', null, el('div.vt', { text: B.capTitle }), el('div.hbs', null, ...B.cap.map(hbar)));
  const poles = el('div.vis.c22', null, el('div.vt', { text: B.polesTitle }), el('div.hbs', null, ...B.poles.map(hbar)));
  R.detail = el('div.vis.detail', null,
    el('div.vt', { text: B.selTitle }),
    el('div.who', null, el('b', { text: B.selName }), el('span', { text: B.selInfo })),
    el('div.dates', null,
      el('div.d', null, el('small', { text: B.objLabel }), el('b', { text: B.obj })),
      el('div.arrow'),
      el('div.d.late', null, el('small', { text: B.projLabel }), el('b', { text: B.proj })),
      el('div.gap', null, el('b', { text: B.gap }), el('small', { text: B.gapLabel }))),
    el('div.track', null, el('i'), el('u'), el('span.p', { text: B.obj }), el('span.q', { text: B.proj })));
  const delivery = el('div.vis.chart.c21', null, el('div.vt', { text: B.monthsTitle }), bars, axis);
  R.cursor = el('div.cursor');
  R.root = el('div.pbi', null,
    el('div.pbi-top', null, img('bi'), el('span.nm', { text: B.name }), el('span.crumb', { text: B.crumb }), el('div.r', null, el('span', { text: B.live }), el('i'))),
    el('div.pbi-bar', null, ...B.menu.map((t) => el('span', { text: t }))),
    el('div.pbi-canvas', null,
      el('div.pbi-h', null, el('b', { text: B.title }), el('span', { text: B.period })),
      el('div.pbi-kpis', null, ...R.kpis),
      el('div.pbi-main', null, el('div.vis.c11', null, el('div.vt', { text: B.tableTitle }), table), delivery, capacity, poles, R.detail)),
    el('div.pbi-filters', { text: B.filters }),
    el('div.pbi-tabs', null, el('span.on', { text: B.tabOn }), ...B.tabs.map((t) => el('span', { text: t }))),
    R.cursor);
  return R;
}

/** Snowflake Intelligence on the laptop. Logical 1280 × 800. */
export function buildSnowflakeUI() {
  const U = K.snowUI;
  const root = el('div.snw', null,
    el('div.snw-side', null, img('snowflakeWhite'), ...U.side.map((t, i) => el(`span${i === 3 ? '.on' : ''}`, { text: t }))),
    el('div.snw-main', null,
      el('div.snw-top', null, el('b', { text: U.title }), el('span', { text: U.ctx })),
      el('div.snw-q', null, el('i', { text: U.asker }), el('div.q', { text: Q1 })),
      el('div.snw-a', null, img('snowflakeBlue'), el('div.a', null,
        el('small', { text: U.answerLabel }), el('b', { html: U.answer }),
        el('div.spark', null, ...K.bi.bars.map((h) => el('i', { style: `height:${h}%` }))),
        el('em', { text: U.note })))));
  return { root };
}

/** Source A operational app on the tablet. Logical 1024 × 715. */
export function buildOpsApp() {
  const tile = ([label, value, unit, note, cls = '']) => el(`div.tile${cls ? '.' + cls : ''}`, null, el('small', { text: label }), el('b', { html: `${value}${unit ? `<u>${unit}</u>` : ''}` }), el('em', { text: note }));
  const [t1, ...rest] = K.ops.tiles.map(tile);
  const root = el('div.ops', null,
    el('div.ops-top', null, img('srcA'), el('b', { text: K.sources.srcA.name }), el('span', { text: K.cities.hero.role }), el('i')),
    el('div.ops-h', { text: K.ops.head }),
    el('div.ops-grid', null, t1, ...rest));
  return { root, tiles: [t1] };
}

/** AI assistants on phones. Logical 390 × 829. */
function buildAssistant(logo, name, cls) {
  const AS = K.assistant;
  const root = el(`div.asst.${cls}`, null,
    el('div.island'),
    el('div.asst-top', null, img(logo), el('b', { text: name })),
    el('div.asst-body', null, el('div.bub', { text: Q1 }), el('div.rep', null, el('p', { text: AS.pre }), el('b', { html: AS.value }), el('p', { text: AS.post }), source())),
    el('div.asst-in', { text: `${AS.write} ${name}…` }));
  return { root };
}
export const buildClaude = () => buildAssistant('snowflakeBlue', K.assistant.a1, 'claude');
export const buildOpenAI = () => buildAssistant('client', K.assistant.a2, 'oai');

/** The agent: the AI analyses, the director decides, the software executes. */
export function buildAgent() {
  const R = {}, G = K.agent;
  const cause = ([name, value, src]) => el('div.cause', null, el('b', { text: name }), el('em', { text: value }), el('small', { text: src }));
  R.causes = G.causes.map(cause);
  R.ansTitle = el('h4', { text: G.answer });
  R.pageWhy = el('div.page', null, R.ansTitle, ...R.causes);
  const opt = (l, [name, sub]) => el('div.opt', null, el('div.l', { text: l }), el('b', { text: name }), el('small', { text: sub }), el('i', { text: '✓' }));
  R.opts = G.options.map((o, i) => opt(String(i + 1), o));
  R.goDone = el('i', { text: G.approved });
  R.who = el('div.who', null, el('u', { text: G.approverInitials }), el('span', { text: G.approver }));
  R.go = el('div.go', null, R.who, el('b', null, G.approve, R.goDone));
  R.pageDo = el('div.page', null, el('h5', { text: G.planTitle }), ...R.opts, R.go);
  const wb = (logo, text, name, what) => el('div.wb', null, el('div.lg', null, logo ? img(logo) : el('span', { text })), el('div', null, el('b', { text: name }), el('small', { text: what })), el('i', { text: '✓' }));
  R.wbs = G.exec.map(([logo, name, what]) => wb(logo, null, name, what));
  R.pageExec = el('div.page', null, el('h5', { text: G.execTitle }), ...R.wbs);
  const ask = pair('', el('span', { text: G.why }), el('span', { text: G.what }));
  R.ask = el('div.ask', null, ask.root); R.ask1 = ask.s1; R.ask2 = ask.s2;
  R.root = el('div.agent', null,
    el('div.agent-top', null, img('snowflakeBlue'), el('div', null, el('b', { text: G.title }), el('small', { text: G.ctx })), el('div.ctxsrc', null, img('snowflakeBlue'), el('span', { text: G.data }))),
    el('div.agent-body', null, R.ask, el('div.pages', null, R.pageWhy, R.pageDo, R.pageExec)));
  return R;
}
