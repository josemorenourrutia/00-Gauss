import * as THREE from 'three';

// import { Line2 } from 'three/examples/jsm/lines/Line2.js';
// import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
// import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';


export function createPlane({ color = 0x00aaff } = {}) {

  const geometry = new THREE.PlaneGeometry(6, 6);
  const material = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,
    // depthWrite: false      // 🔥 MUY IMPORTANTE para transparencias
  });

  const planeMesh = new THREE.Mesh(geometry, material);
  planeMesh.castShadow = true;   // proyecta sombra
  planeMesh.receiveShadow = true;
  return planeMesh;
}

export function updatePlane(planeMesh, plane, center) {
  const normal = new THREE.Vector3(plane.a, plane.b, plane.c).normalize();

  // Rotación
  const defaultNormal = new THREE.Vector3(0, 0, 1);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    defaultNormal,
    normal
  );
  planeMesh.setRotationFromQuaternion(quaternion);

  // Posición
  const distance = plane.d / Math.sqrt(plane.a * plane.a + plane.b * plane.b + plane.c * plane.c);
  // planeMesh.position.copy(normal).multiplyScalar(distance);
  if (center) planeMesh.position.copy(center);
  // return planeMesh;
  planeMesh.userData = plane;
}


export function updateCenterPlane(planeMesh, center) {
  planeMesh.position.copy(center);
}

export function updateCenterCylinder(cylinderMesh, center) {
  cylinderMesh.position.copy(center);
}


// export function createPlane({ plane, center = new THREE.Vector3(), color = 0x00aaff }) {
//   const normal = new THREE.Vector3(plane.a, plane.b, plane.c).normalize();
//   // planeMesh.position.copy(normal).multiplyScalar(distance);
//   if (!center) {
//     const distance = plane.d / Math.sqrt(plane.a * plane.a + plane.b * plane.b + plane.c * plane.c);
//     center.copy(normal).multiplyScalar(distance);
//   }

//   const geometry = new THREE.PlaneGeometry(6, 6);
//   const material = new THREE.MeshBasicMaterial({
//     color,
//     side: THREE.DoubleSide,
//     transparent: true,
//     opacity: 0.8,
//     // depthWrite: false      // 🔥 MUY IMPORTANTE para transparencias
//   });

//   const planeMesh = new THREE.Mesh(geometry, material);
//   // Rotación
//   const defaultNormal = new THREE.Vector3(0, 0, 1);
//   const quaternion = new THREE.Quaternion().setFromUnitVectors(
//     defaultNormal,
//     normal
//   );
//   planeMesh.setRotationFromQuaternion(quaternion);

//   // Posición
//   planeMesh.position.copy(center);
//   planeMesh.castShadow = true;   // proyecta sombra
//   planeMesh.receiveShadow = true;
//   planeMesh.userData = plane;
//   return planeMesh;
// }


// export function drawIntersectionLine(result, length = 20) {
//   const dir = result.direction.clone().normalize();
//   const p0 = result.point.clone();

//   const p1 = p0.clone().add(dir.clone().multiplyScalar(length));
//   const p2 = p0.clone().add(dir.clone().multiplyScalar(-length));

//   const geometry = new LineGeometry();
//   geometry.setPositions([
//     p1.x, p1.y, p1.z,
//     p2.x, p2.y, p2.z
//   ]);

//   const material = new LineMaterial({
//     color: 0xffff00,
//     linewidth: 4,          // 🔥 grosor en píxeles
//     dashed: false
//   });

//   // IMPORTANTE: resolución en píxeles
//   material.resolution.set(window.innerWidth, window.innerHeight);

//   const line = new Line2(geometry, material);
//   line.computeLineDistances();
//   return line;
// }

export function createCylinder({
  length = 6.1 * Math.SQRT2,
  radius = 0.05,
  color = 0x000000
} = {}) {

  const geometry = new THREE.CylinderGeometry(radius, radius, length, 16);
  const material = new THREE.MeshBasicMaterial({
    color,
    // transparent: true,
    // opacity: 0.9
  });

  return new THREE.Mesh(geometry, material);
}

export function updateCylinder(cylinder, result) {
  if (!result) {
    return;
  }

  const dir = result.direction.clone().normalize();
  const center = result.point;

  // Orientación: eje Y → dirección
  const axis = new THREE.Vector3(0, 1, 0);
  cylinder.quaternion.setFromUnitVectors(axis, dir);

  // Posición
  cylinder.position.copy(center);
}

export function createPoint() {

  // Creamos una esfera pequeña para resaltar el punto
  const geometry = new THREE.SphereGeometry(0.2, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
  return new THREE.Mesh(geometry, material);

}

export function updatePoint(point, center) {
  point.position.copy(center);
}

export function createArrow({ length = 1, color = 0x000000 }) {
  return new THREE.ArrowHelper(undefined, undefined, length, color);

}

function getPlaneNormalFromMesh(planeMesh) {
  const normal = new THREE.Vector3(0, 0, 1);
  return normal.applyQuaternion(planeMesh.quaternion).normalize();
}

export function updateArrowNormal(planeMesh, arrowNormal, length = 1) {
  if (!arrowNormal) return;

  const normal = getPlaneNormalFromMesh(planeMesh);

  arrowNormal.position.copy(planeMesh.position);   // origen
  arrowNormal.setDirection(normal);                // dirección
  arrowNormal.setLength(length);
}

