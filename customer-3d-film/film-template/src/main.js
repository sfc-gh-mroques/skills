// Film bootstrap: engine → world → UI → timeline → playback loop.
import * as THREE from 'three/webgpu';
import { createEngine } from './core/engine.js';
import { buildTextures } from './core/tex.js';
import { buildMaterials } from './core/mats.js';
import { buildWorld } from './world/index.js';
import { createState, applyState } from './film/state.js';
import { buildTimeline, DURATION, ACTS } from './film/timeline.js';
import { buildHud } from './ui/hud.js';
import { createTags } from './ui/tags.js';
import { createScreens } from './ui/screens.js';
import { buildSalesforce, buildBI, buildAgent, buildSnowflakeUI, buildOpsApp, buildClaude, buildOpenAI } from './ui/apps.js';
import { buildLabels } from './ui/labels.js';
import { buildControls } from './ui/controls.js';
import { el, img } from './ui/dom.js';
import { K } from './content.js';

const stage = document.getElementById('stage');
const canvas = document.getElementById('gl');
const ui = document.getElementById('ui');
const TEST = !!window.__test;
const raf = () => new Promise((r) => requestAnimationFrame(r));

async function boot() {
  ui.classList.add('preroll');
  const film = { time: 0, playing: false, ready: false, duration: DURATION };
  film.seek = (t) => { film.time = Math.min(DURATION, Math.max(0, t)); };
  film.play = () => { film.playing = true; };
  film.pause = () => { film.playing = false; };
  const controls = buildControls(ui, stage, film, ACTS);

  await Promise.all(['700 40px "Inter"', '500 20px "Inter"', '500 20px "IBM Plex Mono"', '400 20px "IBM Plex Mono"', '600 20px "Open Sans"', '400 20px "Open Sans"'].map((f) => document.fonts.load(f).catch(() => null)));
  const hash = location.hash || '';
  const E = await createEngine(canvas, { forceWebGL: hash.includes('webgl') || !!window.__forceWebGL, quality: window.__quality || (hash.includes('low') ? 'low' : 'high') });
  const T = buildTextures();
  const mats = buildMaterials(T);
  const W = buildWorld(E, mats, T);
  const S = createState(W);

  // ── UI ─────────────────────────────────────────────────────────────────────
  const hud = buildHud(ui);
  const tags = createTags(ui);
  const screens = createScreens(ui);
  hud.scrimFull.after(tags.layer, ui.querySelector('.screens'));
  const apps = { sf: buildSalesforce(), bi: buildBI(), agent: buildAgent(), snw: buildSnowflakeUI(), ops: buildOpsApp(), claude: buildClaude(), openai: buildOpenAI() };
  const dev = W.anchors.room.screens;
  // every screen is real HTML, re-rasterised at its on-screen size, so the UI stays razor-sharp in any shot
  const scr = {
    salesforce: screens.add('salesforce', apps.sf.root, 1280, 720, () => W.hall.heroScreen.corners),
    bi: screens.add('monitor', apps.bi.root, 1280, 720, () => dev.monitor.corners),
    snowflake: screens.add('laptop', apps.snw.root, 1280, 800, () => dev.laptop.corners),
    ops: screens.add('tablet', apps.ops.root, 1024, 715, () => dev.tablet.corners),
    claude: screens.add('phoneA', apps.claude.root, 390, 829, () => dev.phoneA.corners),
    openai: screens.add('phoneB', apps.openai.root, 390, 829, () => dev.phoneB.corners),
  };
  // the platform's name, lying on the layer itself (real type, so it stays sharp in perspective)
  const brandmark = el('div.brandmark', null, img('snowflakeBlue'), el('div.t', null, el('b', { text: 'Snowflake' }), el('span', { text: K.meta.brandTag })));
  scr.brand = screens.add('brand', brandmark, 1440, 220, () => W.story.P.brand);
  hud.blackout.before(apps.agent.root);
  const labels = buildLabels(tags, W);
  const UI = { hud, labels, apps, screens: scr };
  // the frame is sized first: the timeline measures where things land inside the tool windows
  { const r = stage.getBoundingClientRect(); ui.style.setProperty('--sw', `${Math.max(2, Math.round(r.width))}px`); }
  const tl = buildTimeline(S, UI, W);

  // ── sizing ─────────────────────────────────────────────────────────────────
  let sw = 1, sh = 1;
  const fit = () => {
    const r = stage.getBoundingClientRect();
    sw = Math.max(2, Math.round(r.width)); sh = Math.max(2, Math.round(r.height));
    ui.style.setProperty('--sw', `${sw}px`);
    E.resize(sw, sh);
  };
  fit();
  window.addEventListener('resize', fit);
  if (window.ResizeObserver) new ResizeObserver(fit).observe(stage);

  // ── frame ──────────────────────────────────────────────────────────────────
  const draw = (t) => {
    tl.time(t, true);
    applyState(S, t, E, W);
    E.camera.updateMatrixWorld();
    tags.update(E.camera, sw, sh);
    screens.update(E.camera, sw, sh);
    E.render();
  };

  // adaptive quality: keep the film smooth on modest GPUs
  const gov = { acc: 0, n: 0, cool: 0, level: 0 };
  const govern = (dt) => {
    if (TEST || !film.playing) return;
    gov.acc += dt; gov.n++;
    if (gov.cool > 0) { gov.cool -= dt; gov.acc = 0; gov.n = 0; return; }
    if (gov.n < 45) return;
    const avg = gov.acc / gov.n; gov.acc = 0; gov.n = 0;
    if (avg > 0.03 && gov.level < 4) {
      gov.level++; gov.cool = 2.5;
      if (gov.level === 1) { E.scale = 0.82; E.resize(sw, sh); }
      else if (gov.level === 2) { E.scale = 0.66; E.resize(sw, sh); }
      else if (gov.level === 3) { E.scale = 0.8; E.setQuality('medium'); }
      else { E.scale = 0.85; E.setQuality('low'); }
    }
  };

  let last = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (film.playing) {
      film.time = Math.min(DURATION, film.time + dt);
      if (film.time >= DURATION) { film.playing = false; controls.onEnd(); }
    }
    draw(film.ready && ui.classList.contains('preroll') ? 2.6 : film.time);
    controls.update();
    govern(dt);
    requestAnimationFrame(loop);
  };

  window.__film = {
    E, W, S, tl, film, UI,
    async seek(t, frames = 3) {
      ui.classList.remove('preroll'); document.querySelector('.poster').hidden = true;
      film.playing = false; film.time = t;
      for (let i = 0; i < frames; i++) { if (TEST) { draw(t); controls.update(); } await raf(); }
      return { t, calls: E.renderer.info.render.drawCalls, tris: E.renderer.info.render.triangles };
    },
  };

  // ── warm-up: compile every look before the first play, at a small size ────
  if (!TEST) {
    canvas.style.opacity = '0';                        // the warm-up frames are never shown
    const keep = [sw, sh];
    E.scale = 0.25; E.resize(sw, sh);
    for (const t of [2.6, 9, 12, 18, 24, 30, 34, 39, 42, 47, 53, 58, 62, 68, 72, 79, 85, 91, 96, 103, 107, 112, 117, 122, 129, 134, 139, 145, 150, 154, 160]) { draw(t); await raf(); }
    E.scale = 1; E.resize(keep[0], keep[1]);
  }
  film.ready = true;
  draw(2.6);                                           // the poster frame
  canvas.style.opacity = '1';
  controls.ready();
  if (TEST) draw(2.6); else requestAnimationFrame(loop);
  window.__ready = true;
}
boot().catch((e) => {
  console.error('BOOT FAIL', (e && e.stack) || e);
  window.__ready = 'error';
  const l = document.querySelector('.poster .load');
  if (l) l.textContent = K.meta.bootFail;
});
