import * as THREE from 'three';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';

export async function setupHDRLighting(scene, renderer) {
  const loader = new HDRLoader();
  const envMap = await loader.loadAsync('/industrial_sunset_puresky_4k.hdr');

  // envMap.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = envMap;
  scene.background = envMap;

  // const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  // dirLight.position.set(10, 10, 10);
  // scene.add(dirLight);
}
