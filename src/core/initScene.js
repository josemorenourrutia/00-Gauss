import * as THREE from 'three';

export function initScene(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x999999);

  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(10, 3, 4);

  // camera.position.set(8, 2, 1);
  // camera.position.set(6, 2, 1);
  // camera.position.set(3, 3, 6);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // o BasicShadowMap, VSMShadowMap, etc.
  container.appendChild(renderer.domElement);

  return { scene, camera, renderer, container };
}
