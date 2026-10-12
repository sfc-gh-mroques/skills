// Material library (PBR, physically plausible roughness, restrained palette).
import * as THREE from 'three/webgpu';

export function buildMaterials(T) {
  const m = {};
  const std = (name, p) => { const mat = new THREE.MeshStandardMaterial(p); mat.name = name; m[name] = mat; return mat; };
  const phys = (name, p) => { const mat = new THREE.MeshPhysicalMaterial(p); mat.name = name; m[name] = mat; return mat; };
  const basic = (name, p) => { const mat = new THREE.MeshBasicMaterial(p); mat.name = name; m[name] = mat; return mat; };
  const hdr = (r, g, b, k) => new THREE.Color(r * k, g * k, b * k);

  // ── metals ────────────────────────────────────────────────────────────────
  std('steel', { color: 0xc0c4c9, metalness: 1, roughness: 0.34, roughnessMap: T.brushed });
  std('steelV', { color: 0xc0c4c9, metalness: 1, roughness: 0.34, roughnessMap: T.brushedV });
  std('steelPolish', { color: 0xd4d7da, metalness: 1, roughness: 0.16 });
  std('steelDark', { color: 0x7b8087, metalness: 1, roughness: 0.5, roughnessMap: T.mottle });
  std('alu', { color: 0xd3d6d8, metalness: 1, roughness: 0.52, roughnessMap: T.mottle });
  std('grating', { color: 0xffffff, map: T.grating, metalness: 0.7, roughness: 0.55 });

  std('aluDark', { color: 0xa9adb1, metalness: 1, roughness: 0.42 });
  std('titanium', { color: 0x8d9094, metalness: 1, roughness: 0.3 });
  std('screenGlass', { color: 0x040506, metalness: 0, roughness: 0.05, envMapIntensity: 1.5 });
  std('deskTop', { color: 0x0c0f13, roughness: 0.3, metalness: 0 });

  // ── architecture ──────────────────────────────────────────────────────────
  std('wall', { color: 0xdedfdc, map: T.panel, roughness: 0.62, metalness: 0 });
  std('wallPlain', { color: 0xecece9, roughness: 0.65 });
  std('ceiling', { color: 0x3d4248, roughness: 0.9 });
  std('floor', { color: 0x8f969c, roughness: 0.26, roughnessMap: T.mottle, metalness: 0 });
  std('concrete', { color: 0x8d9094, roughness: 0.9, roughnessMap: T.mottle });
  std('structure', { color: 0xd0d3d5, roughness: 0.55, metalness: 0.1 });
  std('beam', { color: 0x565c63, roughness: 0.6, metalness: 0.2 });
  std('frame', { color: 0x9da2a8, metalness: 0.9, roughness: 0.4 });

  // ── paints / plastics ─────────────────────────────────────────────────────
  std('white', { color: 0xe9eaea, roughness: 0.45 });
  std('lightGray', { color: 0xc9ccce, roughness: 0.5 });
  std('midGray', { color: 0x8a8f95, roughness: 0.55 });
  std('anthracite', { color: 0x33373d, roughness: 0.55 });
  std('black', { color: 0x17191c, roughness: 0.7 });
  std('rubber', { color: 0x1d1f22, roughness: 0.88 });
  std('blueGray', { color: 0x5e7384, roughness: 0.5 });
  std('yellow', { color: 0xe2aa12, roughness: 0.5 });
  std('orange', { color: 0xd9682b, roughness: 0.55 });
  std('rackBlue', { color: 0x2f5d8c, roughness: 0.55 });
  std('red', { color: 0xb8322b, roughness: 0.5 });
  std('green', { color: 0x3a9a5d, roughness: 0.5 });
  std('insulation', { color: 0xd9dadb, metalness: 0.85, roughness: 0.45, roughnessMap: T.mottle });

  // ── glass ─────────────────────────────────────────────────────────────────
  std('glass', { color: 0xdfeaf0, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.14, depthWrite: false, envMapIntensity: 1.6 });
  m.glass.userData.noCast = true;
  std('glassClear', { color: 0xe8f1f5, roughness: 0.03, metalness: 0, transparent: true, opacity: 0.05, depthWrite: false, envMapIntensity: 0.9 });
  m.glassClear.userData.noCast = true;
  std('glassDark', { color: 0x6c8494, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.34, depthWrite: false, envMapIntensity: 1.8 });
  m.glassDark.userData.noCast = true;
  std('poly', { color: 0xe8f0f4, roughness: 0.12, transparent: true, opacity: 0.2, depthWrite: false });
  m.poly.userData.noCast = true;

  // ── light sources ─────────────────────────────────────────────────────────
  basic('led', { color: hdr(1.0, 0.97, 0.92, 5.5) });
  m.led.userData.noCast = true;
  basic('ledSoft', { color: hdr(1.0, 0.96, 0.9, 2.2) });
  m.ledSoft.userData.noCast = true;
  basic('lampGreen', { color: hdr(0.25, 1.0, 0.45, 2.4) });
  basic('lampAmber', { color: hdr(1.0, 0.62, 0.12, 2.6) });
  basic('lampRed', { color: hdr(1.0, 0.2, 0.15, 0.5) });
  basic('lampWhite', { color: hdr(1.0, 1.0, 1.0, 2.0) });
  for (const k of ['lampGreen', 'lampAmber', 'lampRed', 'lampWhite']) m[k].userData.noCast = true;

  // ── goods ─────────────────────────────────────────────────────────────────
  std('cardboard', { color: 0xb08b62, roughness: 0.88 });
  std('carton', { color: 0xf1f1ee, roughness: 0.6 });
  std('wrap', { color: 0xe6eaec, roughness: 0.28, metalness: 0 });
  std('pallet', { color: 0xa98d68, roughness: 0.9 });
  std('drum', { color: 0x2d5f93, roughness: 0.42 });
  std('bag', { color: 0xdcdcd6, roughness: 0.8 });
  phys('vialGlass', { color: 0xf4fbff, roughness: 0.03, metalness: 0, transparent: true, opacity: 0.26, depthWrite: false, envMapIntensity: 2.2 });
  m.vialGlass.userData.noCast = true;
  std('liquid', { color: 0xe9e2c4, roughness: 0.15, transparent: true, opacity: 0.86 });
  std('capAlu', { color: 0xd9dbdd, metalness: 1, roughness: 0.3 });
  std('flipCap', { color: 0x2a7f97, roughness: 0.4 });

  // ── people ────────────────────────────────────────────────────────────────
  std('gown', { color: 0xe9ecee, roughness: 0.82 });
  std('glove', { color: 0x3f79b5, roughness: 0.55 });
  std('visor', { color: 0x1c2228, roughness: 0.15, metalness: 0.3 });
  std('skin', { color: 0xc49a80, roughness: 0.6 });
  std('hair', { color: 0x2a2320, roughness: 0.5 });
  std('suit', { color: 0x1f2630, roughness: 0.72 });
  std('shirt', { color: 0xe8eaec, roughness: 0.7 });
  std('shoe', { color: 0x131417, roughness: 0.4 });

  // ── model / table world ───────────────────────────────────────────────────
  std('model', { color: 0xd2d6d9, roughness: 0.74, roughnessMap: T.grain });
  std('modelWarm', { color: 0xcfcdc8, roughness: 0.75, roughnessMap: T.grain });
  std('modelDark', { color: 0x565b62, roughness: 0.7, roughnessMap: T.grain });
  std('modelMetal', { color: 0xb9bdc1, metalness: 1, roughness: 0.4 });
  std('table', { color: 0x0b0d10, roughness: 0.5, metalness: 0.3, roughnessMap: T.mottle });
  std('plate', { color: 0x1d2127, roughness: 0.62, metalness: 0.1, roughnessMap: T.grain });
  std('road', { color: 0x2a2f36, roughness: 0.75 });
  std('roadMark', { color: 0x3d444c, roughness: 0.7 });
  std('water', { color: 0x0a1118, roughness: 0.08, metalness: 0.6 });
  std('roomFloor', { color: 0x040506, roughness: 0.92, metalness: 0 });

  m.hdr = hdr;
  return m;
}
