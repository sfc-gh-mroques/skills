// Layout probe: at each time, list on-screen labels/HUD boxes, report overlaps and clipping.
// usage: node tools/overlap.mjs "17,22,33" [--w 960] [--h 540] [--dump] [--js "F.S.cam.px=..."]
import { launch, URL } from './browser.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes(`--${k}`);
const times = args[0].split(',').map(Number);
const W = +opt('w', 960), H = +opt('h', 540), js = opt('js', '');
const browser = await launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const logs = [];
page.on('console', (m) => { const t = m.text(); if (!/GroupMarkerNotSet|experimental on this platform|Automatic fallback to software/.test(t)) logs.push(`${m.type()}: ${t.slice(0, 400)}`); });
page.on('pageerror', (e) => logs.push('PAGEERROR ' + String(e.stack || e).slice(0, 600)));
await page.addInitScript(() => { window.__quality = 'low'; window.__test = true; window.__pr = 1; });
await page.goto(URL);
await page.waitForFunction(() => window.__ready !== undefined && window.__ready !== false, null, { timeout: 900000 });
for (const t of times) {
  await page.evaluate((t) => window.__film.seek(t, 1), t);
  if (js) await page.evaluate(async ([js, t]) => { const F = window.__film; new Function('F', js)(F); await F.seek(t, 2); }, [js, t]);
  const boxes = await page.evaluate(() => {
    const out = [];
    const vis = (e) => { let o = 1; for (let n = e; n && n.id !== 'ui'; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden') return 0; o *= parseFloat(cs.opacity); } return o; };
    const push = (name, e, kind) => { const o = vis(e); if (o < 0.45) return; const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return; out.push({ name, kind, x0: Math.round(r.left), y0: Math.round(r.top), x1: Math.round(r.right), y1: Math.round(r.bottom) }); };
    const textRects = (name, e, kind) => { const o = vis(e); if (o < 0.45) return; const rg = document.createRange(); rg.selectNodeContents(e); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const r of rg.getClientRects()) { if (r.width < 1) continue; x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom); } if (x1 > x0) out.push({ name, kind, x0: Math.round(x0), y0: Math.round(y0), x1: Math.round(x1), y1: Math.round(y1) }); };
    const F = window.__film;
    for (const t of F.UI ? document.querySelectorAll('.tag') : []) {
      if (getComputedStyle(t).display === 'none') continue;
      const inner = t.querySelector('.tag-in'); if (!inner || parseFloat(inner.style.opacity || '1') < 0.45) continue;
      const body = inner.firstElementChild; const id = [...document.querySelectorAll('.tag')].indexOf(t);
      const name = (body.textContent || '').trim().slice(0, 26) || (body.querySelector('img') ? 'logo' : 'tag');
      let r = body.getBoundingClientRect(); r = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
      const grow = (e) => { if (!e) return; const q = e.getBoundingClientRect(); if (q.width < 1) return; r.left = Math.min(r.left, q.left); r.top = Math.min(r.top, q.top); r.right = Math.max(r.right, q.right); r.bottom = Math.max(r.bottom, q.bottom); };
      if (body.classList.contains('sys')) {
        for (const sp of body.querySelectorAll('.cap span')) if (parseFloat(getComputedStyle(sp).opacity) > 0.5) grow(sp);
        const plug = body.querySelector('.plug'); if (plug && parseFloat(getComputedStyle(t).getPropertyValue('--plug') || '0') > 0.5) grow(plug);
      }
      const masked = parseFloat(getComputedStyle(t).getPropertyValue('--mask') || '0') > 0.5;
      out.push({ name: `tag:${name}`, kind: t.classList.contains('vtag') ? 'vtag' : masked ? 'maskedtag' : 'tag', x0: Math.round(r.left), y0: Math.round(r.top), x1: Math.round(r.right), y1: Math.round(r.bottom) });
    }
    document.querySelectorAll('.hl').forEach((h) => { [...h.children].forEach((c) => textRects(`hl:${(c.textContent || '').trim().slice(0, 22)}`, c, 'hl')); });
    for (const sel of ['.chip', '.spine', '.gov', '.agent', '.kpis', '.dstrip', '.xask', '.xbase', '.mstage', '.backbone', '.endmark', '.legend', '.snowapp', '.sharebar']) document.querySelectorAll(sel).forEach((e) => push(sel, e, 'hud'));
    document.querySelectorAll('.screen').forEach((e) => { if (e.style.display !== 'none' && parseFloat(e.style.opacity || '1') > 0.45) { const r = e.getBoundingClientRect(); out.push({ name: `screen:${e.dataset.id}`, kind: 'screen', x0: Math.round(r.left), y0: Math.round(r.top), x1: Math.round(r.right), y1: Math.round(r.bottom) }); } });
    return out;
  });
  const issues = [];
  for (let i = 0; i < boxes.length; i++) {
    const a = boxes[i];
    if (a.kind !== 'screen' && (a.x0 < 4 || a.y0 < 4 || a.x1 > W - 4 || a.y1 > H - 4)) issues.push(`CLIP  ${a.name} [${a.x0},${a.y0},${a.x1},${a.y1}]`);
    for (let j = i + 1; j < boxes.length; j++) {
      const b = boxes[j];
      if (a.kind === 'screen' && b.kind === 'screen') continue;
      if (a.kind === 'hl' && b.kind === 'hl') continue;
      if ((a.kind === 'vtag' && b.name === '.snowapp') || (b.kind === 'vtag' && a.name === '.snowapp')) continue;   // records fly over the window on purpose
      if ((a.kind === 'screen' || b.kind === 'screen') && (a.kind === 'hud' || b.kind === 'hud' || a.kind === 'hl' || b.kind === 'hl')) { /* reported, but tagged */ }
      const ox = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0), oy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
      if (ox > 2 && oy > 2) issues.push(`OVER  ${a.name}  ×  ${b.name}  (${ox}×${oy})`);
    }
  }
  console.log(`\n== t=${t}  boxes=${boxes.length}  issues=${issues.length}`);
  if (flag('dump')) for (const b of boxes) console.log(`   ${b.kind.padEnd(9)} ${b.name.padEnd(34)} ${b.x0},${b.y0} → ${b.x1},${b.y1}`);
  for (const s of issues) console.log('   ' + s);
}
if (logs.length) console.log('--- console ---\n' + [...new Set(logs)].slice(0, 20).join('\n'));
await browser.close();
