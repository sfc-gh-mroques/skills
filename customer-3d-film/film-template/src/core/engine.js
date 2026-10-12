// Renderer + render pipeline (WebGPU with automatic WebGL2 fallback).
import * as THREE from 'three/webgpu';
import {
  pass, mrt, output, normalView, uniform, screenUV, screenCoordinate, vec2, vec3, vec4, float, mix, smoothstep,
  renderOutput, luminance, interleavedGradientNoise, length,
} from 'three/tsl';
import { ao } from 'three/addons/tsl/display/GTAONode.js';
import { dof } from 'three/addons/tsl/display/DepthOfFieldNode.js';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { fxaa } from 'three/addons/tsl/display/FXAANode.js';
import { gaussianBlur } from 'three/addons/tsl/display/GaussianBlurNode.js';
import { godrays } from 'three/addons/tsl/display/GodraysNode.js';

// Some Chromium builds with experimental WebGPU flags reject the `swizzle` view member: retry without it.
if (typeof GPUTexture !== 'undefined' && !GPUTexture.prototype.__filmPatched) {
  const orig = GPUTexture.prototype.createView;
  GPUTexture.prototype.createView = function (d) {
    try { return orig.call(this, d); } catch (e) {
      if (d && 'swizzle' in d) { const { swizzle, ...rest } = d; return orig.call(this, rest); }
      throw e;
    }
  };
  GPUTexture.prototype.__filmPatched = true;
}

// Anti-aliasing: MSAA cannot be combined with depth-sampling effects on WebGPU, so the film
// supersamples (pixel-ratio floor) and finishes with FXAA.
export const QUALITY = {
  high: { ao: true, dof: true, bloom: true, god: true, pr: 2, minPr: 1.5, shadow: 4096 },
  medium: { ao: true, dof: true, bloom: true, god: false, pr: 1.5, minPr: 1.25, shadow: 2048 },
  low: { ao: false, dof: false, bloom: true, god: false, pr: 1, minPr: 1, shadow: 2048 },
};

export async function createEngine(canvas, { forceWebGL = false, quality = 'high' } = {}) {
  let renderer;
  const make = async (webgl) => {
    const r = new THREE.WebGPURenderer({ canvas, antialias: false, forceWebGL: webgl, powerPreference: 'high-performance' });
    await r.init();
    return r;
  };
  try { renderer = await make(forceWebGL); } catch (err) {
    console.warn('WebGPU init failed, falling back to WebGL2', err);
    renderer = await make(true);
  }
  const backend = renderer.backend.isWebGPUBackend ? 'webgpu' : 'webgl2';
  // Khronos PBR Neutral keeps brand colours true: the Snowflake cyan stays crisp instead of greying out
  renderer.toneMapping = window.__tm === 'aces' ? THREE.ACESFilmicToneMapping : window.__tm === 'agx' ? THREE.AgXToneMapping : THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.1, 3000);

  const U = {
    focus: uniform(10), range: uniform(8), bokeh: uniform(0),
    ao: uniform(1), bloom: uniform(0.16), vignette: uniform(0.28), grain: uniform(0.022),
    fade: uniform(1), sat: uniform(1.12), contrast: uniform(1.12), frame: uniform(0),
    god: uniform(0), godColor: uniform(new THREE.Color(1.0, 0.86, 0.66)),
  };

  const E = {
    renderer, scene, camera, U, backend, quality, q: QUALITY[quality], pipeline: null, aoPass: null,
    width: 1, height: 1, pixelRatio: 1, sun: null, godOn: false,
  };

  E.buildPipeline = () => {
    const q = E.q;
    const pipeline = E.pipeline ?? new THREE.RenderPipeline(renderer);
    pipeline.outputColorTransform = false;
    const scenePass = pass(scene, camera, { samples: 0 });
    if (q.ao) scenePass.setMRT(mrt({ output, normal: normalView }));
    let col = scenePass.getTextureNode('output');
    const depth = scenePass.getTextureNode('depth');
    const viewZ = scenePass.getViewZNode();
    E.aoPass = null;
    if (q.ao) {
      const normal = scenePass.getTextureNode('normal');
      const aoPass = ao(depth, normal, camera);
      aoPass.resolutionScale = 0.5;
      aoPass.radius.value = 0.5;
      aoPass.samples.value = 12;
      aoPass.thickness.value = 1.2;
      E.aoPass = aoPass;
      const aoSoft = gaussianBlur(aoPass.getTextureNode(), null, 2);
      const occ = mix(float(1), aoSoft.r, U.ao);
      col = vec4(col.rgb.mul(occ), col.a);
    }
    E.godNode = null;
    if (q.god && E.sun) {
      try {
        const g = godrays(depth, camera, E.sun);
        E.godNode = g;
        g.raymarchSteps.value = E.godOn ? 56 : 1; g.density.value = 8.0; g.maxDensity.value = 0.5; g.distanceAttenuation.value = 0.3;
        g.resolutionScale = 0.5;
        const shafts = gaussianBlur(g.getTextureNode(), null, 2.4);
        col = vec4(col.rgb.add(vec3(U.godColor).mul(shafts.r).mul(U.god)), col.a);
      } catch (err) { console.warn('volumetric light unavailable', err); }
    }
    if (q.dof) col = dof(col, viewZ, U.focus, U.range, U.bokeh);
    if (q.bloom) {
      const b = bloom(col, 1, 0.55, 1.0);
      col = col.add(b.mul(U.bloom));
    }
    const display = fxaa(renderOutput(col));
    let c = display.rgb;
    c = c.sub(0.5).mul(U.contrast).add(0.5);
    c = mix(vec3(luminance(c)), c, U.sat);
    const d = length(screenUV.sub(0.5).mul(vec2(1.0, 0.72)));
    c = c.mul(mix(float(1).sub(U.vignette), float(1), smoothstep(0.78, 0.22, d)));
    const n = interleavedGradientNoise(screenCoordinate.add(U.frame));
    c = c.add(n.sub(0.5).mul(U.grain));
    c = c.mul(U.fade);
    pipeline.outputNode = vec4(c, 1);
    pipeline.needsUpdate = true;
    E.pipeline = pipeline;
  };

  /** Volumetric sun shafts stay compiled in the pipeline; outside daylight shots they march a single step. */
  E.setGod = (on) => {
    on = !!on && E.q.god;
    if (on === E.godOn) return;
    E.godOn = on;
    if (E.godNode) E.godNode.raymarchSteps.value = on ? 56 : 1;
  };

  E.setQuality = (name) => {
    if (!QUALITY[name] || name === E.quality) return;
    E.quality = name; E.q = QUALITY[name];
    E.buildPipeline();
    E.resize(E.width, E.height);
  };

  E.resize = (w, h) => {
    E.width = w; E.height = h;
    const pr = (window.__pr ?? Math.min(E.q.pr, Math.max(window.devicePixelRatio || 1, E.q.minPr))) * (E.scale ?? 1);
    E.pixelRatio = pr;
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  let frame = 0;
  E.render = () => {
    U.frame.value = (frame++ % 64) * 7.31;
    E.pipeline.render();
  };

  E.buildPipeline();
  return E;
}
