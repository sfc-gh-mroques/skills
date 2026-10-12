// Render the film to MP4, frame by frame (deterministic: seek(t) then screenshot, piped into ffmpeg).
// usage: node tools/render-mp4.mjs [--out dist/film.mp4] [--fps 30] [--w 1920 --h 1080]
//        [--from 0] [--to <duration>] [--q high] [--gpu auto|metal|swiftshader] [--chrome <chemin>] [--pad 1.5]
import { launch, URL } from './browser.mjs';
import { spawn } from 'child_process';

const a = process.argv.slice(2);
const opt = (k, d) => { const i = a.indexOf(`--${k}`); return i >= 0 ? a[i + 1] : d; };
const out = opt('out', 'dist/film.mp4'), fps = +opt('fps', 30), W = +opt('w', 1920), H = +opt('h', 1080);
const q = opt('q', 'high'), gpu = opt('gpu', 'auto'), pad = +opt('pad', 1.5);
const url = URL;

const b = await launch({ gpu });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await p.addInitScript(([q]) => { window.__test = true; window.__quality = q; window.__pr = 1; }, [q]);
p.on('pageerror', (e) => console.error('PAGEERROR', e.message));
await p.goto(url);
await p.waitForFunction(() => window.__ready !== undefined && window.__ready !== false, null, { timeout: 900000 });
// hide the player chrome: transport bar, cursor, poster
await p.addStyleTag({ content: '.bar,.poster{display:none!important} *{cursor:none!important}' });
const D = await p.evaluate(() => window.__film.film.duration);
const t0 = +opt('from', 0), t1 = +opt('to', D);
const n = Math.round((t1 - t0) * fps);
console.log(`duration ${D}s · rendering ${n} frames ${W}x${H}@${fps} (${gpu}, ${q})`);

const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
  '-vf', `fade=t=in:st=0:d=0.6,fade=t=out:st=${Math.max(0, (t1 - t0) - 0.8)}:d=0.8,tpad=start_duration=${pad}:stop_duration=${pad}:color=black`,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const start = Date.now();
for (let i = 0; i < n; i++) {
  const t = t0 + i / fps;
  await p.evaluate(async (t) => { await window.__film.seek(t, 1); }, t);
  const buf = await p.screenshot({ type: 'jpeg', quality: 92, timeout: 120000 });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  if (i % 60 === 0) {
    const el = (Date.now() - start) / 1000, eta = (el / (i + 1)) * (n - i - 1);
    console.log(`frame ${i}/${n} t=${t.toFixed(1)}s · ${(el / (i + 1)).toFixed(2)}s/frame · ETA ${Math.round(eta / 60)} min`);
  }
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
await b.close();
console.log('done', out, `${Math.round((Date.now() - start) / 1000)}s`);
