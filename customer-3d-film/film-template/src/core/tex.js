// Procedural textures drawn on canvases (no external assets).
import * as THREE from 'three/webgpu';
import { rng } from './kit.js';

export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

export function toTex(canvas, { srgb = true, repeat = null, aniso = 8, mip = true } = {}) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  t.anisotropy = aniso;
  t.generateMipmaps = mip;
  t.minFilter = mip ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
  return t;
}

/** Tileable value noise, returns Float32Array(size*size) in 0..1. */
function valueNoise(size, cells, seed) {
  const r = rng(seed);
  const grid = new Float32Array(cells * cells);
  for (let i = 0; i < grid.length; i++) grid[i] = r();
  const out = new Float32Array(size * size);
  const sm = (t) => t * t * (3 - 2 * t);
  for (let y = 0; y < size; y++) {
    const gy = (y / size) * cells, y0 = Math.floor(gy), ty = sm(gy - y0), y1 = (y0 + 1) % cells;
    for (let x = 0; x < size; x++) {
      const gx = (x / size) * cells, x0 = Math.floor(gx), tx = sm(gx - x0), x1 = (x0 + 1) % cells;
      const a = grid[y0 * cells + x0], b = grid[y0 * cells + x1], c = grid[y1 * cells + x0], d = grid[y1 * cells + x1];
      out[y * size + x] = a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
    }
  }
  return out;
}
function fbm(size, seed, octaves = 4, base = 4) {
  const out = new Float32Array(size * size);
  let amp = 0.5, tot = 0;
  for (let o = 0; o < octaves; o++) {
    const n = valueNoise(size, base << o, seed + o * 101);
    for (let i = 0; i < out.length; i++) out[i] += n[i] * amp;
    tot += amp; amp *= 0.5;
  }
  for (let i = 0; i < out.length; i++) out[i] /= tot;
  return out;
}
function fromField(size, fn) {
  const [c, g] = makeCanvas(size, size);
  const img = g.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const v = fn(i);
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = Math.max(0, Math.min(255, v * 255));
    img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}

export function buildTextures() {
  const T = {};

  // Brushed steel: streaks run along U (around a cylinder) -> circumferential brushing.
  {
    const size = 512;
    const streak = new Float32Array(size);
    const r = rng(11);
    for (let y = 0; y < size; y++) streak[y] = r();
    const soft = fbm(size, 5, 3, 3);
    const c = fromField(size, (i) => {
      const y = (i / size) | 0;
      const s = (streak[y] * 0.6 + streak[(y + 1) % size] * 0.25 + streak[(y + 3) % size] * 0.15);
      return 0.70 + s * 0.22 + (soft[i] - 0.5) * 0.16;
    });
    T.brushed = toTex(c, { srgb: false, repeat: [1, 1] });
    T.brushedV = toTex(c, { srgb: false, repeat: [1, 1] });
    T.brushedV.rotation = Math.PI / 2;
  }
  // Soft mottling for floors and painted surfaces (roughness modulation).
  {
    const size = 512;
    const a = fbm(size, 21, 5, 3), b = fbm(size, 77, 3, 24);
    T.mottle = toTex(fromField(size, (i) => 0.72 + (a[i] - 0.5) * 0.42 + (b[i] - 0.5) * 0.12), { srgb: false, repeat: [1, 1] });
    T.mottleColor = toTex(fromField(size, (i) => 0.93 + (a[i] - 0.5) * 0.12), { srgb: true, repeat: [1, 1] });
  }
  // Fine grain for matte model surfaces.
  {
    const size = 256;
    const a = fbm(size, 9, 3, 32);
    T.grain = toTex(fromField(size, (i) => 0.86 + (a[i] - 0.5) * 0.26), { srgb: false, repeat: [1, 1] });
  }
  // Cleanroom wall panels: one tile = one 1.2 m panel.
  {
    const [c, g] = makeCanvas(256, 512);
    g.fillStyle = '#f1f1ee'; g.fillRect(0, 0, 256, 512);
    const grad = g.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, 'rgba(0,0,0,0.10)'); grad.addColorStop(0.04, 'rgba(0,0,0,0)'); grad.addColorStop(0.96, 'rgba(0,0,0,0)'); grad.addColorStop(1, 'rgba(0,0,0,0.10)');
    g.fillStyle = grad; g.fillRect(0, 0, 256, 512);
    g.fillStyle = 'rgba(70,74,80,0.55)'; g.fillRect(0, 0, 2, 512); g.fillRect(254, 0, 2, 512);
    T.panel = toTex(c, { srgb: true, repeat: [1, 1] });
  }
  // Platform grating.
  {
    const [c, g] = makeCanvas(128, 128);
    g.fillStyle = '#3a3e44'; g.fillRect(0, 0, 128, 128);
    g.fillStyle = '#15171a';
    for (let y = 0; y < 8; y++) for (let x = 0; x < 4; x++) g.fillRect(x * 32 + 5, y * 16 + 3, 22, 10);
    T.grating = toTex(c, { srgb: true, repeat: [1, 1] });
  }
  // Corrugated / ribbed surface (dock doors, containers): normal-ish bump as grayscale.
  {
    const [c, g] = makeCanvas(64, 64);
    for (let y = 0; y < 64; y++) {
      const v = 0.5 + 0.5 * Math.sin((y / 64) * Math.PI * 2 * 4);
      g.fillStyle = `rgb(${v * 255},${v * 255},${v * 255})`;
      g.fillRect(0, y, 64, 1);
    }
    T.ribs = toTex(c, { srgb: false, repeat: [1, 1] });
  }
  return T;
}

/** Office-block facade: window grid with a few lit rooms. Returns {map, emissiveMap}. */
export function facadeTextures(seed, cols, rows, { lit = 0.35, warm = '#ffd9a0' } = {}) {
  const cw = 48, ch = 64;
  const [c, g] = makeCanvas(cols * cw, rows * ch);
  const [e, ge] = makeCanvas(cols * cw, rows * ch);
  g.fillStyle = '#d9dcdf'; g.fillRect(0, 0, c.width, c.height);
  ge.fillStyle = '#000'; ge.fillRect(0, 0, e.width, e.height);
  const r = rng(seed);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = x * cw + 5, py = y * ch + 10, w = cw - 10, h = ch - 22;
      const on = r() < lit;
      g.fillStyle = on ? '#8f9aa3' : '#27313b';
      g.fillRect(px, py, w, h);
      if (on) {
        const k = 0.55 + r() * 0.45;
        ge.globalAlpha = k; ge.fillStyle = warm; ge.fillRect(px, py, w, h); ge.globalAlpha = 1;
      }
    }
  }
  return { map: toTex(c, { srgb: true }), emissiveMap: toTex(e, { srgb: true }) };
}

/** Text plate (signs, tags, nameplates). */
export function labelTexture(lines, { w = 512, h = 160, bg = '#1c2026', fg = '#ffffff', font = '600 72px "Albert Sans", sans-serif', sub = '500 30px "IBM Plex Mono", monospace', subColor = '#9aa4ae', border = null, radius = 0, align = 'center' } = {}) {
  const [c, g] = makeCanvas(w, h);
  if (bg) {
    g.fillStyle = bg;
    if (radius) { g.beginPath(); g.roundRect(0, 0, w, h, radius); g.fill(); } else g.fillRect(0, 0, w, h);
  }
  if (border) { g.strokeStyle = border; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6); }
  g.textAlign = align; g.textBaseline = 'middle';
  const x = align === 'center' ? w / 2 : 28;
  const main = Array.isArray(lines) ? lines[0] : lines;
  const second = Array.isArray(lines) ? lines[1] : null;
  g.fillStyle = fg; g.font = font;
  g.fillText(main, x, second ? h * 0.40 : h * 0.53);
  if (second) { g.fillStyle = subColor; g.font = sub; g.fillText(second, x, h * 0.76); }
  return toTex(c, { srgb: true });
}
