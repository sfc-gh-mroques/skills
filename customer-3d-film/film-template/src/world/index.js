// World assembly: the Belmont open space, the map of the country, the room and the Snowflake layer.
import * as THREE from 'three/webgpu';
import { buildOffice, heroStandIn } from './office.js';
import { buildLighting } from './lighting.js';
import { buildTable } from './country.js';
import { buildRoom } from './room.js';
import { buildLayer } from './layer.js';
import { buildStory } from './story.js';

/** Give a group its own (transparent-capable) materials so it can be dissolved. */
function fadable(group) {
  const mats = new Map();
  group.traverse((o) => {
    if (!o.isMesh) return;
    let m = mats.get(o.material);
    if (!m) { m = o.material.clone(); m.transparent = true; mats.set(o.material, m); m.userData.baseOpacity = o.material.opacity ?? 1; }
    o.material = m;
    o.userData.cast = o.castShadow;
  });
  let last = -1;
  return (k) => {
    if (k === last) return;
    last = k;
    group.visible = k > 0.004;
    for (const m of mats.values()) m.opacity = m.userData.baseOpacity * k;
    group.traverse((o) => { if (o.isMesh) { o.castShadow = o.userData.cast && k > 0.5; if (o.material.depthWrite !== undefined && !o.material.userData.noCast) o.material.depthWrite = k > 0.6; } });
  };
}

export function buildWorld(E, mats, T) {
  const { scene } = E;
  const W = { anchors: {}, updaters: [] };
  W.light = buildLighting(E);

  // the hero place: the open space of Site Belmont
  const plant = new THREE.Group();
  plant.name = 'office';
  scene.add(plant);
  W.plant = plant;
  const hall = buildOffice(mats);
  W.heroStandIn = heroStandIn(hall.heroScreen);
  hall.gallery.add(W.heroStandIn);
  plant.add(hall.shell, hall.front, hall.roof, hall.gallery);
  W.hall = hall;
  W.anchors.office = hall.anchors;
  W.setRoof = fadable(hall.roof);
  W.setGallery = fadable(hall.gallery);

  // the network: the map of the country on the table
  const table = buildTable(E, mats);
  scene.add(table.group);
  W.table = table;
  W.anchors.table = table.anchors;
  W.updaters.push(table.update);

  const room = buildRoom(mats);
  scene.add(room.group);
  W.room = room;
  W.anchors.room = room.anchors;

  const layer = buildLayer(E);
  scene.add(layer.group);
  W.layer = layer;
  W.story = buildStory(W, layer);

  W.update = (t) => { for (const u of W.updaters) u(t); };
  return W;
}
