// Capture du film à des instants donnés (Playwright, rendu logiciel, WebGL forcé).
// usage: node tools/capture.mjs --times "8,14,20" --out /tmp/x/v1 [--play] [--url …] [--gpu metal|swiftshader] [--chrome <chemin>] [--w 1280 --h 720]
import fs from 'fs';
import { launch, URL } from './browser.mjs';
const a = process.argv.slice(2);
const opt = (k, d) => { const i = a.indexOf(`--${k}`); return i >= 0 ? a[i + 1] : d; };
const times = opt('times', '8,14,20,26,32,60').split(',').map(Number);
const out = opt('out', '/tmp/film_review/v1'), url = URL;
const W = +opt('w', 1280), H = +opt('h', 720), play = a.includes('--play');
fs.mkdirSync(out, { recursive: true });
const b = await launch();
const p = await b.newPage({ viewport: { width: W, height: H } });
await p.addInitScript(() => { window.__forceWebGL = true; window.__quality = 'low'; window.__test = true; window.__pr = 1; });
p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
p.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
await p.goto(url);
await p.waitForFunction(() => window.__ready !== undefined && window.__ready !== false, null, { timeout: 600000 });
console.log('ready', await p.evaluate(() => window.__ready), 'duration', await p.evaluate(() => window.__film.film.duration));
if (play) await p.click('#film-play').catch((e) => console.log('no play button', e.message));
for (const t of times) {
  await p.evaluate(async (t) => { await window.__film.seek(t, 4); }, t);
  await p.waitForTimeout(150);
  const f = `${out}/f_${t.toFixed(1).padStart(5, '0')}.png`;
  await p.screenshot({ path: f, timeout: 120000 });
  console.log(f);
}
await b.close();
