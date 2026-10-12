// Dump everything a viewer can read at given times, for proofreading: the poster, titles, panels, Snowflake windows,
// device screens and world tags. usage: node tools/copy.mjs "t1,t2" [--short]
// Not covered (they are drawn, not typed): the small in-world signage painted on canvases (src/world/screens3d.js).
import { launch, URL } from './browser.mjs';
const times = process.argv[2].split(',').map(Number);
const SHORT = process.argv.includes('--short');
const browser = await launch();
const page = await browser.newPage({ viewport: { width: 960, height: 540 }, deviceScaleFactor: 1 });
await page.addInitScript(() => { window.__quality = 'low'; window.__test = true; window.__pr = 1; });
await page.goto(URL);
await page.waitForFunction(() => window.__ready !== undefined && window.__ready !== false, null, { timeout: 900000 });
console.log('── page');
console.log('   TITLE  ' + await page.title());
console.log('   POSTER ' + await page.evaluate(() => [...document.querySelectorAll('.poster .eyebrow, .poster h1, .poster .keys')].map((e) => e.textContent.trim().replace(/\s+/g, ' ')).join(' | ')));
for (const t of times) {
  await page.evaluate((t) => window.__film.seek(t, 1), t);
  const rows = await page.evaluate((SHORT) => {
    const vis = (e) => { let o = 1; for (let n = e; n && n.id !== 'ui'; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden') return 0; o *= parseFloat(cs.opacity); } return o; };
    const txt = (e) => e.innerText.replace(/\s*\n\s*/g, ' / ').replace(/\s+/g, ' ').trim();
    const cut = (s, n) => (SHORT ? s.slice(0, n) : s);
    /** every visible piece of text under an element, in document order (text nodes, so mixed content is not lost) */
    const texts = (root) => {
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), out = [];
      for (let n = w.nextNode(); n; n = w.nextNode()) { const s = n.nodeValue.replace(/\s+/g, ' ').trim(); if (s && vis(n.parentElement) > 0.5) out.push(s); }
      return out.join(' · ');
    };
    const out = [];
    document.querySelectorAll('.hl').forEach((h) => { if (vis(h) < 0.5) return; const parts = [...h.children].filter((c) => vis(c) > 0.5).map((c) => { const spans = [...c.querySelectorAll(':scope > span')]; const sw = [...c.querySelectorAll('.sw > span')]; return spans.length && c.tagName === 'H1' ? spans.filter((s) => vis(s) > 0.3).map(txt).join(' / ') : sw.length ? sw.filter((s) => vis(s) > 0.5).map(txt).join(' / ') : txt(c); }); out.push('TITLE  ' + parts.join('  |  ')); });
    const spine = document.querySelector('.spine');
    if (spine && vis(spine) > 0.5) out.push(`SPINE  ${texts(spine)}  (active step: ${spine.dataset.step})`);
    for (const [sel, name] of [['.backbone', 'CARD'], ['.sharebar', 'BAR'], ['.snowapp', 'WINDOW'], ['.gov', 'PANEL'], ['.mstage', 'MODELS'], ['.xask', 'ASK'], ['.xbase', 'BASE'], ['.dstrip', 'STRIP'], ['.agent', 'AGENT'], ['.kpis', 'KPIS'], ['.endmark', 'END'], ['.chip', 'CHIP']]) document.querySelectorAll(sel).forEach((e) => { if (vis(e) < 0.5) return; out.push(`${name.padEnd(6)} ` + cut(texts(e), 330)); });
    document.querySelectorAll('.screen').forEach((e) => { if (e.style.display === 'none' || parseFloat(e.style.opacity || '1') < 0.45) return; const s = texts(e); if (s) out.push(`SCREEN ${e.dataset.id}: ` + cut(s, 330)); });
    const tags = [...document.querySelectorAll('.tag')].filter((t) => getComputedStyle(t).display !== 'none' && parseFloat(t.querySelector('.tag-in').style.opacity || '1') > 0.5).map((t) => texts(t.querySelector('.tag-in').firstElementChild) || '(logo)');
    if (tags.length) out.push('TAGS   ' + cut(tags.join('  ‖  '), 520));
    return out;
  }, SHORT);
  console.log(`\n── ${String(Math.floor(t / 60))}:${String(Math.floor(t % 60)).padStart(2, '0')}  (t=${t})`);
  for (const r of rows) console.log('   ' + r);
}
await browser.close();
