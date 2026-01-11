import { initScene } from './initScene.js';
import { createLoop } from './loop.js';
import { setupResize } from './resize.js';
import { setupControls } from '../controls/controls.js';

export const all = (container, objects) => {
  const { scene, camera, renderer } = initScene(container);
  const { setActiveControls } = setupControls(camera, renderer, scene, container, objects);
  setupResize(camera, renderer, container);

  return { scene, camera, renderer, setActiveControls, createLoop };
}