// Look-dev harness: seek to a time, apply a JS tweak to the live film (F = window.__film), re-render, screenshot.
// usage: node tools/look.mjs variants.json [--w 960] [--h 540] [--out tmp/look]
// variants.json: [{ "name": "v0", "t": 2, "js": "F.S.rig.god = 0;" }, ...]
import fs from 'fs';
import { launch, URL } from './browser.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const variants = JSON.parse(fs.readFileSync(args[0], 'utf8'));
const W = +opt('w', 960), H = +opt('h', 540), out = opt('out', 'tmp/look'), backend = opt('backend', 'webgpu');
fs.mkdirSync(out, { recursive: true });
const browser = await launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const logs = [];
page.on('console', (m) => { const t = m.text(); if (!/GroupMarkerNotSet|experimental on this platform|Automatic fallback to software/.test(t)) logs.push(`${m.type()}: ${t.slice(0, 700)}`); });
page.on('pageerror', (e) => logs.push('PAGEERROR ' + String(e.stack || e).slice(0, 900)));
await page.addInitScript(([b]) => { if (b === 'webgl') window.__forceWebGL = true; window.__quality = 'high'; window.__test = true; window.__pr = 1; }, [backend]);
await page.goto(URL);
await page.waitForFunction(() => window.__ready !== undefined && window.__ready !== false, null, { timeout: 900000 });
let lastT = null;
for (const v of variants) {
  const t1 = Date.now();
  try {
    if (v.t !== lastT) { await page.evaluate((t) => window.__film.seek(t, 2), v.t); lastT = v.t; }
    const info = await page.evaluate(async ([js, t]) => { const F = window.__film; const r = new Function('F', 'THREE', js)(F, null); await F.seek(t, 4); return r === undefined ? null : r; }, [v.js || '', v.t]);
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${out}/${v.name}.png`, timeout: 240000 });
    console.log(v.name, ((Date.now() - t1) / 1000).toFixed(1) + 's', info ? JSON.stringify(info).slice(0, 6000) : '');
  } catch (e) { console.log(v.name, 'ERR', String(e).slice(0, 600)); }
}
if (logs.length) console.log('--- console ---\n' + [...new Set(logs)].slice(0, 30).join('\n'));
await browser.close();
