// Lighting: one sun/key with shadows, a hemisphere fill, and two image-based environments
// (daylight hall / dark studio) blended by a uniform so the film can cross-fade between looks.
import * as THREE from 'three/webgpu';
import { pmremTexture, mix, uniform, color as tslColor } from 'three/tsl';

function emissive(r, g, b, k = 1) {
  return new THREE.MeshBasicMaterial({ color: new THREE.Color(r * k, g * k, b * k), side: THREE.DoubleSide });
}

/** Simplified emissive proxy of the hall, seen from a point 2.5 m above the floor. */
function dayEnvScene() {
  const s = new THREE.Scene();
  const add = (w, h, d, x, y, z, m) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y - 2.5, z); s.add(o); };
  const wall = emissive(0.72, 0.79, 0.88, 0.5), floor = emissive(0.44, 0.5, 0.58, 0.3), ceil = emissive(0.28, 0.32, 0.38, 0.1);
  add(70, 0.2, 30, 0, -0.1, 0, floor);
  add(70, 0.2, 30, 0, 9.6, 0, ceil);
  add(70, 9.5, 0.2, 0, 4.75, -14.2, wall);
  add(70, 9.5, 0.2, 0, 4.75, 14.2, wall);
  add(0.2, 9.5, 30, -32.2, 4.75, 0, wall);
  add(0.2, 9.5, 30, 32.2, 4.75, 0, wall);
  // clerestory glazing: cool sky light from both long walls
  add(40, 2.9, 0.2, -10, 7.05, -14.0, emissive(0.74, 0.86, 1.0, 7));
  add(60, 2.9, 0.2, 0, 7.05, 14.0, emissive(0.7, 0.83, 1.0, 3));
  // skylights above the process hall: sky, plus the warm bounce of the sun patches below them
  for (const x of [-22, -12, -4, 4]) add(6, 0.1, 2.4, x, 9.45, -9, emissive(0.9, 0.95, 1.0, 8));
  add(22, 0.1, 2.6, -2, 0.05, -4.2, emissive(1.0, 0.84, 0.62, 1.1));
  // linear LED fixtures
  const led = emissive(0.94, 0.97, 1, 8);
  for (const z of [-10.5, -3.5, 3.5, 10.5]) for (let x = -28; x <= 28; x += 8) add(5.5, 0.05, 0.4, x, 8.7, z, led);
  // dock doors: daylight
  add(0.2, 3.7, 3.2, -32.0, 1.85, 5.2, emissive(0.9, 0.95, 1, 6));
  add(0.2, 3.7, 3.2, 32.0, 1.85, 1.6, emissive(0.9, 0.95, 1, 6));
  return s;
}

/** Dark studio with large soft sources: key from front-left, top fill, cool back rim. */
function studioEnvScene() {
  const s = new THREE.Scene();
  const add = (w, h, d, x, y, z, m, rx = 0, rz = 0) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.rotation.set(rx, 0, rz); s.add(o); };
  add(400, 400, 400, 0, 0, 0, emissive(0.03, 0.035, 0.045, 1));
  add(120, 0.5, 90, -10, 110, 20, emissive(1, 0.98, 0.95, 3.2));          // top softbox
  add(0.5, 60, 150, -150, 60, 60, emissive(1, 0.95, 0.88, 4.2), 0, -0.4);  // key strip, left
  add(170, 26, 0.5, 20, 44, -170, emissive(0.72, 0.86, 1.0, 2.6));        // cool rim, back
  add(0.5, 40, 90, 160, 40, 30, emissive(1, 0.9, 0.8, 0.9), 0, 0.4);       // weak warm kicker, right
  add(400, 0.5, 400, 0, -60, 0, emissive(0.02, 0.022, 0.026, 1));          // floor
  return s;
}

export function buildLighting(E) {
  const { scene, renderer } = E;
  const pm = new THREE.PMREMGenerator(renderer);
  const envDay = pm.fromScene(dayEnvScene(), 0.015, 0.1, 500).texture;
  const envStudio = pm.fromScene(studioEnvScene(), 0.03, 0.1, 1000).texture;
  const uMix = uniform(0), uEnv = uniform(1);
  scene.environmentNode = mix(pmremTexture(envDay), pmremTexture(envStudio), uMix).mul(uEnv);

  const sun = new THREE.DirectionalLight(0xffffff, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(E.q.shadow, E.q.shadow);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  sun.shadow.radius = 2.2;
  scene.add(sun, sun.target);
  E.sun = sun;
  const hemi = new THREE.HemisphereLight(0xe6eef6, 0x8f9296, 0.4);
  scene.add(hemi);

  scene.background = new THREE.Color(0, 0, 0);
  scene.fog = new THREE.Fog(0x000000, 100, 1000);

  const dirDay = new THREE.Vector3(-0.47, 0.77, -0.43).normalize();   // morning sun through the skylights, from the back-left: the hall is back-lit
  const dirStudio = new THREE.Vector3(-0.42, 0.82, 0.38).normalize();
  const cDaySun = new THREE.Color(1.0, 0.8, 0.58), cStudioSun = new THREE.Color(1.0, 0.97, 0.94);
  const bgDay = new THREE.Color(1.45, 1.75, 2.15), bgStudio = new THREE.Color(0.006, 0.007, 0.01);
  const fogDay = new THREE.Color(0.8, 0.84, 0.9), fogStudio = new THREE.Color(0.006, 0.007, 0.01);
  const tmp = new THREE.Vector3();

  /**
   * rig: { studio: 0..1 (day → studio), sun, hemi, env, exposure, fogNear, fogFar,
   *        shadowSize (half extent), cx, cz (shadow centre) }
   */
  function apply(rig) {
    const k = rig.studio;
    uMix.value = rig.envMix ?? k;                       // which environment the materials reflect (0 = the hall, 1 = the studio)
    uEnv.value = rig.env;
    tmp.copy(dirDay).lerp(dirStudio, k).normalize();
    const dist = Math.max(80, rig.shadowSize * 2.2);
    sun.target.position.set(rig.cx, 0, rig.cz);
    sun.position.set(rig.cx + tmp.x * dist, tmp.y * dist, rig.cz + tmp.z * dist);
    sun.color.copy(cDaySun).lerp(cStudioSun, k);
    sun.intensity = rig.sun;
    hemi.intensity = rig.hemi;
    const cam = sun.shadow.camera, s = rig.shadowSize;
    if (cam.right !== s || cam.far !== dist * 2) {
      cam.left = -s; cam.right = s; cam.top = s; cam.bottom = -s; cam.near = 1; cam.far = dist * 2;
      cam.updateProjectionMatrix();
    }
    sun.shadow.normalBias = 0.02 + s * 0.0006;
    // the daylight sky must be gone before the roof opens, so it falls away faster than the rest of the rig
    const kb = 1 - Math.pow(1 - k, 3);
    scene.background.copy(bgDay).lerp(bgStudio, kb);
    scene.fog.color.copy(fogDay).lerp(fogStudio, kb);
    scene.fog.near = rig.fogNear; scene.fog.far = rig.fogFar;
    renderer.toneMappingExposure = rig.exposure;
    E.U.god.value = rig.god ?? 0;
    E.setGod((rig.god ?? 0) > 0.01);
  }
  return { sun, hemi, apply, dirDay, cDaySun };
}

export const RIGS = {
  // morning sun through the clerestory, cool fill, light haze
  day: { studio: 0, envMix: 0, sun: 24, hemi: 0.05, env: 0.22, exposure: 1.0, fogNear: 60, fogFar: 900, shadowSize: 40, cx: 0, cz: 0, god: 0.5 },
  // dark studio: the enterprise as a model on the operations table
  studio: { studio: 1, envMix: 1, sun: 3.5, hemi: 0.04, env: 0.42, exposure: 1.0, fogNear: 300, fogFar: 1300, shadowSize: 150, cx: 0, cz: -10, god: 0 },
  // inside the model: a bright, clean plant (steel reflects the hall), so connections read as crisp cyan accents
  dive: { studio: 1, envMix: 0.45, sun: 5, hemi: 0.28, env: 0.7, exposure: 1.22, fogNear: 60, fogFar: 600, shadowSize: 42, cx: 0, cz: 0, god: 0 },
  // the experience desk: product-shot key, contact shadows on the desk itself
  desk: { studio: 1, envMix: 1, sun: 2.4, hemi: 0.05, env: 0.6, exposure: 1.0, fogNear: 2000, fogFar: 6000, shadowSize: 130, cx: 0, cz: 340, god: 0 },
  // the room around the table
  room: { studio: 1, envMix: 1, sun: 3.0, hemi: 0.04, env: 0.4, exposure: 1.0, fogNear: 400, fogFar: 1600, shadowSize: 150, cx: 0, cz: -10, god: 0 },
};
