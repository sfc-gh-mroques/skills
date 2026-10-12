// Poster (start card) and transport: play / pause, scrub with act markers, full screen, keyboard.
import { el } from './dom.js';
import { K } from '../content.js';

const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

export function buildControls(ui, stage, film, acts) {
  const C = {};
  // ── poster ────────────────────────────────────────────────────────────────
  const loading = el('div.load', { text: K.meta.loading });
  const play = el('button.playbtn', { type: 'button', 'aria-label': K.meta.playLabel, id: 'film-play' });
  play.hidden = true;
  const poster = el('div.poster', null, el('div.in', null,
    el('div.eyebrow', { text: K.meta.posterEyebrow }),
    el('h1', { text: K.meta.posterQuestion }),
    loading, play,
    el('div.keys', { text: K.meta.keys })));
  ui.append(poster);

  // ── transport bar ─────────────────────────────────────────────────────────
  const icon = el('span.ic-play');
  const btn = el('button', { type: 'button', 'aria-label': K.meta.toggleLabel, id: 'film-toggle' }, icon);
  const time = el('div.time', { text: `0:00 / ${fmt(film.duration)}` });
  const fill = el('div.fill');
  const act = el('div.act');
  const track = el('div.track', { role: 'slider', 'aria-label': K.meta.trackLabel, tabindex: '0', id: 'film-track' }, fill, act);
  acts.forEach((a) => { if (a.t > 0) { const k = el('div.tick'); k.style.left = `${(a.t / film.duration) * 100}%`; track.append(k); } });
  const fs = el('button', { type: 'button', 'aria-label': K.meta.fullscreenLabel, id: 'film-fullscreen' }, el('span.ic-fs'));
  const bar = el('div.bar', null, btn, time, track, fs);
  ui.append(bar);

  const actAt = (t) => { let cur = acts[0]; for (const a of acts) if (t >= a.t - 0.001) cur = a; return cur; };
  let hideTimer = 0, started = false;
  const reveal = () => {
    if (!started) return;
    bar.classList.add('show'); stage.classList.remove('idle');
    clearTimeout(hideTimer);
    if (film.playing) hideTimer = setTimeout(() => { bar.classList.remove('show'); stage.classList.add('idle'); }, 2400);
  };
  const syncIcon = () => { icon.className = film.playing ? 'ic-pause' : 'ic-play'; };

  C.start = () => {
    started = true;
    poster.hidden = true;
    ui.classList.remove('preroll');
    film.seek(0); film.play();
    syncIcon(); reveal();
  };
  C.toggle = () => {
    if (!started) { if (film.ready) C.start(); return; }
    if (film.time >= film.duration - 0.05) film.seek(0);
    film.playing ? film.pause() : film.play();
    syncIcon(); reveal();
  };
  C.jump = (dir) => {
    if (!started) return;
    const t = film.time;
    let target;
    if (dir > 0) target = (acts.find((a) => a.t > t + 0.2) || { t: film.duration - 0.05 }).t;
    else { const prev = acts.filter((a) => a.t < t - 1.5); target = prev.length ? prev[prev.length - 1].t : 0; }
    film.seek(target); reveal();
  };
  C.fullscreen = () => {
    const root = document.getElementById('app');
    try {
      if (document.fullscreenElement) document.exitFullscreen?.();
      else (root.requestFullscreen?.() || Promise.resolve()).catch?.(() => {});
    } catch (e) { /* not available in this viewer */ }
  };
  C.ready = () => { loading.hidden = true; play.hidden = false; };
  C.onEnd = () => { syncIcon(); reveal(); };
  C.update = () => {
    const t = film.time;
    fill.style.width = `${(t / film.duration) * 100}%`;
    time.textContent = `${fmt(t)} / ${fmt(film.duration)}`;
    const a = actAt(t);
    if (act.textContent !== a.name) act.textContent = a.name;
    act.style.left = `${Math.min(94, Math.max(6, (t / film.duration) * 100))}%`;
  };

  play.addEventListener('click', C.start);
  btn.addEventListener('click', C.toggle);
  fs.addEventListener('click', C.fullscreen);
  let drag = false;
  const scrub = (e) => { const r = track.getBoundingClientRect(); film.seek(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * film.duration); };
  track.addEventListener('pointerdown', (e) => { drag = true; track.setPointerCapture(e.pointerId); scrub(e); });
  track.addEventListener('pointermove', (e) => { if (drag) scrub(e); });
  track.addEventListener('pointerup', () => { drag = false; });
  stage.addEventListener('pointermove', reveal);
  stage.addEventListener('click', (e) => { if (started && e.target === stage.querySelector('#gl')) C.toggle(); });
  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (k === ' ' || k === 'k' || k === 'K' || k === 'Enter') { e.preventDefault(); C.toggle(); }
    else if (k === 'ArrowRight') { e.preventDefault(); C.jump(1); }
    else if (k === 'ArrowLeft') { e.preventDefault(); C.jump(-1); }
    else if (k === 'f' || k === 'F') C.fullscreen();
    else if (k === 'Home' || k === 'r' || k === 'R') { if (started) { film.seek(0); reveal(); } }
  });
  return C;
}
