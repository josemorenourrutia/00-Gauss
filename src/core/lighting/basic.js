import * as THREE from 'three';

export function setupBasicLighting(scene) {
  // const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  // scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 0.5);
  key.position.set(5, 10, 7.5);
  key.castShadow = true;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xffffff, 0.4);
  fill.position.set(-5, 2, -3);
  fill.castShadow = true;
  scene.add(fill);

  const back = new THREE.DirectionalLight(0xffffff, 0.3);
  back.position.set(0, 5, -10);
  back.castShadow = true;
  scene.add(back);
}
