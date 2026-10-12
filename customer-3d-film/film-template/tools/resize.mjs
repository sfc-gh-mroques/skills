// Like times.mjs, but the page loads at one size and is resized before the frames are taken (a viewer going full screen).
// usage: node tools/resize.mjs "60,93" [--w 800] [--h 450] [--w2 1600] [--h2 900] [--out tmp/rs] — base: node tools/times.mjs "1,3.5,12" [--w 1280] [--h 720] [--backend webgpu|webgl] [--out tmp/f] [--pr 1] [--q high]
import fs from 'fs';
import { launch, URL } from './browser.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const times = args[0].split(',').map(Number);
const W = +opt('w', 800), H = +opt('h', 450), W2 = +opt('w2', 1600), H2 = +opt('h2', 900), backend = opt('backend', 'webgpu'), out = opt('out', 'tmp/f'), q = opt('q', 'high'), pr = +opt('pr', 1), tm = opt('tm', '');
fs.mkdirSync(out, { recursive: true });
const browser = await launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const logs = [];
page.on('console', (m) => { const t = m.text(); if (!/GroupMarkerNotSet|experimental on this platform|Automatic fallback to software/.test(t)) logs.push(`${m.type()}: ${t.slice(0, 700)}`); });
page.on('pageerror', (e) => logs.push('PAGEERROR ' + String(e.stack || e).slice(0, 900)));
await page.addInitScript(([b, q, pr, tm]) => { if (b === 'webgl') window.__forceWebGL = true; window.__quality = q; window.__test = true; window.__pr = pr; if (tm) window.__tm = tm; }, [backend, q, pr, tm]);
const t0 = Date.now();
await page.goto(URL);
await page.waitForFunction(() => window.__ready !== undefined && window.__ready !== false, null, { timeout: 900000 }).catch(() => logs.push('TIMEOUT waiting ready'));
console.log('ready in', ((Date.now() - t0) / 1000).toFixed(1), 's', await page.evaluate(() => window.__ready));
await page.setViewportSize({ width: W2, height: H2 });
await page.waitForTimeout(800);
for (const t of times) {
  const t1 = Date.now();
  try {
    const res = await page.evaluate((t) => window.__film.seek(t, 4), t);
    await page.waitForTimeout(250);
    const name = `t${String(t.toFixed(1)).padStart(5, '0')}`;
    await page.screenshot({ path: `${out}/${name}.png`, timeout: 240000 });
    console.log(name, ((Date.now() - t1) / 1000).toFixed(1) + 's', JSON.stringify(res));
  } catch (e) { console.log(t, 'ERR', String(e).slice(0, 500)); }
}
if (logs.length) console.log('--- console ---\n' + [...new Set(logs)].slice(0, 30).join('\n'));
await browser.close();
