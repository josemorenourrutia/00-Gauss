import * as THREE from 'three';

export function setupArtisticLighting(scene) {
  const ambient = new THREE.AmbientLight(0xffffff, 0.15);
  scene.add(ambient);

  const spot = new THREE.SpotLight(0xffeedd, 1.2);
  spot.position.set(4, 6, 2);
  spot.angle = Math.PI / 6;
  spot.penumbra = 0.4;
  spot.castShadow = true;
  spot.shadow.mapSize.width = 1024;
  spot.shadow.mapSize.height = 1024;
  spot.shadow.bias = -0.0005;
  scene.add(spot);

  const rim = new THREE.PointLight(0x44aaff, 0.5);
  rim.position.set(-3, 3, -4);
  scene.add(rim);
}
