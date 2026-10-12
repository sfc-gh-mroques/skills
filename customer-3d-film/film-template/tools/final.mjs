// Final checks on the built page: (1) phone-width poster: no horizontal scroll, stage letterboxed, play button usable;
// (2) end of film: playback stops and the transport comes back; (3) replay from the end restarts at 0.
import fs from 'fs';
import { launch, URL } from './browser.mjs';
const out = 'tmp/final'; fs.mkdirSync(out, { recursive: true });
const browser = await launch();
const logs = [];
const open = async (w, h) => {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  page.on('console', (m) => { const t = m.text(); if (!/GroupMarkerNotSet|experimental on this platform|Automatic fallback to software/.test(t)) logs.push(`${w}px ${m.type()}: ${t.slice(0, 300)}`); });
  page.on('pageerror', (e) => logs.push(`${w}px PAGEERROR ` + String(e.stack || e).slice(0, 600)));
  await page.addInitScript(() => { window.__quality = 'low'; });
  await page.goto(URL);
  await page.waitForFunction(() => window.__ready !== undefined && window.__ready !== false, null, { timeout: 900000 });
  await page.waitForTimeout(1200);
  return page;
};
// 1 · phone width
{
  const page = await open(400, 780);
  const m = await page.evaluate(() => { const s = document.getElementById('stage').getBoundingClientRect(); const b = document.getElementById('film-play').getBoundingClientRect(); const h1 = document.querySelector('.poster h1').getBoundingClientRect();
    return { scrollW: document.documentElement.scrollWidth, innerW: innerWidth, stage: [Math.round(s.left), Math.round(s.top), Math.round(s.width), Math.round(s.height)], play: [Math.round(b.width), Math.round(b.height)], h1: [Math.round(h1.left), Math.round(h1.right)], h1Font: getComputedStyle(document.querySelector('.poster h1')).fontSize, eyebrowFont: getComputedStyle(document.querySelector('.poster .eyebrow')).fontSize }; });
  console.log('phone 400×780', JSON.stringify(m));
  await page.screenshot({ path: `${out}/phone_poster.png`, timeout: 240000 });
  await page.close();
}
// 2 · end of film and replay
{
  const page = await open(960, 540);
  await page.click('#film-play');
  await page.waitForTimeout(800);
  await page.evaluate(() => { window.__film.film.time = window.__film.film.duration - 0.25; });
  await page.waitForFunction(() => !window.__film.film.playing, null, { timeout: 240000 });
  const st = () => page.evaluate(() => ({ t: +window.__film.film.time.toFixed(2), playing: window.__film.film.playing, bar: document.querySelector('.bar').classList.contains('show'), time: document.querySelector('.bar .time').textContent, act: document.querySelector('.bar .act').textContent }));
  console.log('at end        ', JSON.stringify(await st()));
  await page.screenshot({ path: `${out}/end.png`, timeout: 240000 });
  await page.keyboard.press('Space');
  await page.waitForTimeout(2500);
  console.log('space = replay', JSON.stringify(await st()));
  await page.close();
}
console.log(logs.length ? '--- console ---\n' + [...new Set(logs)].join('\n') : 'console: clean');
await browser.close();
