// Shared browser launcher for every tool: finds a Chromium on its own, picks GPU flags.
//   import { launch, URL } from './browser.mjs';
//   const browser = await launch();                  // headless, GPU auto
// Overrides (any tool): --chrome <path> or CHROME=<path> · --gpu metal|swiftshader|auto · --url <page>
//                       or FILM_URL=<page> (default http://localhost:8765/index.html)
// Playwright must be installed IN the project (ESM ignores NODE_PATH):
//   npm i -D playwright && npx playwright install chromium
import fs from 'fs';
import os from 'os';
import path from 'path';
import { chromium } from 'playwright';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : d; };

export const URL = opt('url', process.env.FILM_URL || 'http://localhost:8765/index.html');

/** Every Chromium we know how to find, most reliable first. */
function candidates() {
  const out = [];
  const forced = opt('chrome', process.env.CHROME);
  if (forced) out.push(forced);
  try { out.push(chromium.executablePath()); } catch { /* not installed for this Playwright version */ }
  // any Chromium previously downloaded by Playwright (another version is fine)
  const caches = [path.join(os.homedir(), 'Library/Caches/ms-playwright'), path.join(os.homedir(), '.cache/ms-playwright'),
    path.join(process.env.LOCALAPPDATA || '', 'ms-playwright')];
  for (const c of caches) {
    if (!fs.existsSync(c)) continue;
    for (const d of fs.readdirSync(c).filter((n) => /^chromium-\d+$/.test(n)).sort().reverse()) {
      out.push(path.join(c, d, 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'),
        path.join(c, d, 'chrome-mac/Chromium.app/Contents/MacOS/Chromium'),
        path.join(c, d, 'chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'),
        path.join(c, d, 'chrome-linux/chrome'), path.join(c, d, 'chrome-linux64/chrome'), path.join(c, d, 'chrome-win/chrome.exe'));
    }
  }
  // an installed Chrome
  out.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe');
  return out;
}

export function findChrome() {
  for (const p of candidates()) if (p && fs.existsSync(p)) return p;
  throw new Error('Aucun navigateur Chromium trouvé. Lancer : npx playwright install chromium  (ou passer --chrome <chemin>)');
}

/** GPU flags: Metal on macOS (fast, ~0.06 s/frame), software rendering elsewhere (slow but works everywhere). */
export function gpuArgs(gpu = opt('gpu', 'auto')) {
  const g = gpu === 'auto' ? (process.platform === 'darwin' ? 'metal' : 'swiftshader') : gpu;
  return g === 'metal'
    ? ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-webgpu']
    : ['--use-angle=swiftshader', '--ignore-gpu-blocklist', '--enable-unsafe-webgpu', '--enable-features=Vulkan', '--use-vulkan=swiftshader'];
}

export async function launch({ headless = true, gpu } = {}) {
  const executablePath = findChrome();
  return chromium.launch({ headless, args: gpuArgs(gpu), executablePath });
}
