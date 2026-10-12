// The map table: a stylised map of the country carrying the Client network.
// 60 sites as small office markers and pins; the data of each site rises to the Snowflake layer.
import * as THREE from 'three/webgpu';
import { Builder, G, M, V, rng } from '../core/kit.js';
import { K } from '../content.js';

/** lon/lat → table coordinates (x east, z south), equirectangular around 46.6° N. */
export const geo = (lon, lat) => [(lon - 2.4) * 15.14, (46.6 - lat) * 22];
export const MAP_TOP = 0.6;

// fictional country outline (lon, lat), generated — replace with the client's real country
const OUTLINE = [[2.6, 51.62], [3.16, 51.57], [3.72, 51.53], [4.29, 51.5], [4.86, 51.44], [5.42, 51.31], [5.93, 51.1], [6.38, 50.83], [6.8, 50.54], [7.2, 50.24], [7.62, 49.94], [8.03, 49.64], [8.43, 49.31], [8.77, 48.95], [9.02, 48.54], [9.19, 48.12], [9.32, 47.68], [9.43, 47.25], [9.53, 46.8], [9.58, 46.34], [9.55, 45.88], [9.4, 45.44], [9.1, 45.03], [8.71, 44.67], [8.28, 44.35], [7.86, 44.05], [7.48, 43.75], [7.11, 43.44], [6.73, 43.13], [6.31, 42.85], [5.84, 42.61], [5.34, 42.42], [4.82, 42.24], [4.3, 42.07], [3.76, 41.89], [3.19, 41.73], [2.6, 41.62], [1.99, 41.6], [1.39, 41.68], [0.82, 41.84], [0.28, 42.04], [-0.24, 42.25], [-0.77, 42.44], [-1.3, 42.64], [-1.81, 42.87], [-2.27, 43.16], [-2.65, 43.51], [-2.94, 43.9], [-3.17, 44.31], [-3.38, 44.72], [-3.58, 45.12], [-3.75, 45.53], [-3.88, 45.95], [-3.92, 46.37], [-3.87, 46.8], [-3.77, 47.22], [-3.64, 47.62], [-3.55, 48.03], [-3.49, 48.45], [-3.43, 48.9], [-3.32, 49.35], [-3.11, 49.79], [-2.79, 50.17], [-2.37, 50.51], [-1.89, 50.79], [-1.38, 51.04], [-0.86, 51.27], [-0.32, 51.48], [0.24, 51.64], [0.83, 51.73], [1.43, 51.74], [2.03, 51.69]];
const ISLAND = [[9.3, 43.11], [9.61, 42.98], [9.84, 42.64], [9.8, 42.18], [9.61, 41.82], [9.3, 41.61], [8.96, 41.76], [8.8, 42.18], [8.76, 42.64], [8.96, 43.04]];

/** The sites that carry a name in the film (siège = hq, site héros = hero): names and lon/lat live in content.js. */
export const CITIES = K.cities;
// the rest of the 60 sites (lon, lat): dense in la région du client, a few further away
const OTHERS = [
  [4.87, 45.52], [4.75, 44.56], [5.27, 45.59], [5.59, 45.36], [5.91, 45.69], [6.23, 46.19], [5.22, 46.2], [4.39, 44.62],
  [3.88, 45.04], [4.07, 46.04], [3.43, 46.13], [4.83, 46.31], [6.08, 44.56], [6.39, 45.68], [6.48, 46.37], [5.02, 44.73],
  [4.83, 45.07], [4.6, 44.73], [5.37, 44.75], [4.72, 45.99], [5.65, 46.26], [6.53, 45.48], [4.67, 45.24], [5.48, 45.06],
  [5.93, 45.2], [5.1, 45.35], [4.97, 45.83], [5.74, 45.9], [6.63, 45.94], [4.25, 45.7], [3.55, 45.55], [5.31, 44.94],
  [4.9, 44.38], [2.44, 44.93], [3.33, 46.57], [4.85, 46.78], [5.04, 47.32], [6.02, 47.24], [4.81, 43.95], [5.37, 43.3],
  [3.88, 43.61], [1.44, 43.6], [-0.58, 44.84], [-1.55, 47.22], [3.06, 50.63], [7.75, 48.58], [2.21, 48.9], [2.45, 48.75],
  [1.91, 47.9], [1.26, 45.83], [7.27, 43.7],
];

export function buildTable(E, mats) {
  const group = new THREE.Group();
  group.name = 'table';
  const b = new Builder();
  const r = rng(909);
  const A = {};

  mats.modelGlass = mats.modelGlass || Object.assign(new THREE.MeshStandardMaterial({ color: 0x24313d, roughness: 0.15, metalness: 0.5 }), { name: 'modelGlass' });
  const land = Object.assign(new THREE.MeshStandardMaterial({ color: 0xe9ecee, roughness: 0.82, metalness: 0 }), { name: 'land' });
  const shore = Object.assign(new THREE.MeshStandardMaterial({ color: 0x7f8f9c, roughness: 0.7 }), { name: 'shore' });
  const sea = Object.assign(new THREE.MeshStandardMaterial({ color: 0x142231, roughness: 0.55, metalness: 0.1 }), { name: 'sea' });
  const green = Object.assign(new THREE.MeshStandardMaterial({ color: 0x23a743, roughness: 0.4, emissive: 0x23a743, emissiveIntensity: 0.35 }), { name: 'clientGreen' });
  const roof = Object.assign(new THREE.MeshStandardMaterial({ color: 0x1f6f3a, roughness: 0.5 }), { name: 'clientRoof' });
  mats.clientGreen = green;

  // ── the table, the sea, the land ──
  b.rbox(mats.table, 316, 8, 240, 0, -4.5, -10, 0.5);
  b.box(mats.black, 240, 62, 170, 0, -39.4, -10);
  b.rbox(sea, 300, 0.3, 226, 0, 0.1, -6, 0.2);
  const shape = (pts, grow = 0) => {
    const xz = pts.map(([lo, la]) => geo(lo, la));
    if (grow) { const cx = xz.reduce((a, p) => a + p[0], 0) / xz.length, cz = xz.reduce((a, p) => a + p[1], 0) / xz.length; return xz.map(([x, z]) => [cx + (x - cx) * (1 + grow), cz + (z - cz) * (1 + grow)]); }
    return xz;
  };
  // extruded in XY, laid flat: (x, y=z_map, depth) → (x, −depth, z_map)
  const slab = (mat, pts, depth, top) => b.add(mat, G.extrude(pts, depth), M(0, top, 0, Math.PI / 2, 0, 0));
  slab(shore, shape(OUTLINE, 0.012), 0.5, MAP_TOP - 0.12);
  slab(land, shape(OUTLINE), 0.5, MAP_TOP);
  slab(shore, shape(ISLAND, 0.06), 0.5, MAP_TOP - 0.12);
  slab(land, shape(ISLAND), 0.5, MAP_TOP);
  A.outline = shape(OUTLINE);

  // ── sites: named offices (small buildings) and pins for the others ──
  const pin = (x, z, s = 1) => {
    b.cyl(mats.white, 0.16 * s, 1.6 * s, x, MAP_TOP + 0.8 * s, z, 'y', 8);
    b.sphere(green, 0.62 * s, x, MAP_TOP + 1.75 * s, z, 1, 1, 1, 14, 10);
    b.cyl(green, 0.7 * s, 0.06, x, MAP_TOP + 0.03, z, 'y', 18);
  };
  const office = (x, z, w, h, d) => {
    b.rbox(mats.model, w, h, d, x, MAP_TOP + h / 2, z, 0.08);
    b.box(mats.modelGlass, w + 0.02, h * 0.18, d + 0.02, x, MAP_TOP + h * 0.62, z);
    b.box(roof, w + 0.25, 0.22, d + 0.25, x, MAP_TOP + h + 0.11, z);
  };
  A.city = {}; A.cityBase = {};
  for (const [id, c] of Object.entries(CITIES)) {
    const [x, z] = geo(...c.ll);
    if (c.hq) { office(x, z, 3.6, 7.2, 3.2); office(x + 3.2, z + 0.8, 2.6, 3.6, 2.6); }
    else if (c.hero) { office(x, z, 3.4, 3.4, 2.8); office(x - 2.6, z - 0.6, 2.0, 2.4, 2.0); }
    else office(x, z, 2.6, 2.6 + r() * 1.4, 2.2);
    b.cyl(green, 3.0, 0.05, x, MAP_TOP + 0.03, z, 'y', 32);
    A.city[id] = V(x, MAP_TOP + (c.hq ? 7.6 : 4.0), z);
    A.cityBase[id] = V(x, MAP_TOP, z);
  }
  A.dots = OTHERS.map(([lo, la]) => { const [x, z] = geo(lo, la); pin(x, z, 0.8 + r() * 0.25); return V(x, MAP_TOP + 1.8, z); });
  A.sites = [...Object.values(A.city), ...A.dots];        // 9 + 51 = 60

  group.add(b.build('table-static'));
  return { group, anchors: A, update: () => {} };
}
