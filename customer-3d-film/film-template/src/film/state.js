// Film state: one plain object animated by the GSAP master timeline, applied to the engine every frame.
import * as THREE from 'three/webgpu';
import { RIGS } from '../world/lighting.js';
import { FLOOR_Y } from '../world/room.js';

export function createState(W) {
  return {
    cam: { px: 0.4, py: 6.1, pz: 13.5, tx: -0.4, ty: 5.2, tz: -6, fov: 40, ox: 0, oy: 0 },
    rig: { ...RIGS.day },
    post: { focus: 0, hero: 0, range: 8, bokeh: 0, ao: 1, aoR: 0.5, bloom: 0.16, vignette: 0.28, fade: 1, sat: 1.12, contrast: 1.12 },
    vis: { office: 1, roof: 1, front: 1, gallery: 1, table: 1, room: 0 },
    stage: { desk: 0, solo: 0, lit: 0 },                 // the experience desk: staged / monitor only / screen light
    w: { hero: 1 },                                        // brightness of the hero monitor stand-in
    layer: W.layer.defaults(),
  };
}

const tgt = new THREE.Vector3();
// the experience desk stands in front of the operations table, against its own navy backdrop
const STAGING = { desk: [0, 340] };

export function applyState(S, t, E, W) {
  const { camera, U } = E;
  // camera
  camera.position.set(S.cam.px, S.cam.py, S.cam.pz);
  tgt.set(S.cam.tx, S.cam.ty, S.cam.tz);
  camera.lookAt(tgt);
  let dirty = false;
  if (camera.fov !== S.cam.fov) { camera.fov = S.cam.fov; dirty = true; }
  const ox = Math.round(S.cam.ox * E.width), oy = Math.round(S.cam.oy * E.height);
  if (ox || oy) camera.setViewOffset(E.width, E.height, -ox, -oy, E.width, E.height);
  else if (camera.view && camera.view.enabled) { camera.clearViewOffset(); dirty = false; }
  if (dirty) camera.updateProjectionMatrix();
  const dist = camera.position.distanceTo(tgt);
  // scale near/far with the shot so depth precision stays good from macro to table scale
  const near = Math.max(0.08, Math.min(8, dist * 0.02)), far = Math.max(600, dist * 14);
  if (Math.abs(camera.near - near) > near * 0.2 || Math.abs(camera.far - far) > far * 0.2) { camera.near = near; camera.far = far; camera.updateProjectionMatrix(); }

  // lighting + post
  W.light.apply(S.rig);
  // focus: a fixed distance, the shot target (0), or pulled onto the hero monitor (post.hero → 1)
  let focus = S.post.focus > 0 ? S.post.focus : dist;
  if (S.post.hero > 0) focus += (camera.position.distanceTo(W.hall.heroScreen.center) - focus) * S.post.hero;
  U.focus.value = focus;
  U.range.value = S.post.range; U.bokeh.value = S.post.bokeh;
  U.ao.value = S.post.ao; if (E.aoPass) E.aoPass.radius.value = S.post.aoR;
  U.bloom.value = S.post.bloom; U.vignette.value = S.post.vignette; U.fade.value = S.post.fade;
  U.sat.value = S.post.sat; U.contrast.value = S.post.contrast;

  // visibility
  W.setRoof(S.vis.roof);
  W.setGallery(S.vis.gallery);
  W.plant.visible = S.vis.office > 0.5;
  W.hall.front.visible = S.vis.front > 0.5;
  W.table.group.visible = S.vis.table > 0.5;
  W.room.group.visible = S.vis.room > 0.5;
  if (W.room.group.visible) W.anchors.room.place({ desk: S.stage.desk > 0.5 ? STAGING.desk : null, solo: S.stage.solo > 0.5, lit: S.stage.lit });

  // world animation
  W.update(t);
  W.heroStandIn.material.color.setScalar(0.92 * S.w.hero);
  W.layer.apply(S.layer, t, E.pixelRatio, camera.position, E.width);
}

export { STAGING, FLOOR_Y };
