function cloneMatrix(M) {
  return M.map(row => row.slice());
}

function planesFromMatrix(matrix) {
  return matrix.map(row => ({
    a: row[0],
    b: row[1],
    c: row[2],
    d: row[3]
  }));
}

function eliminateColumnInteger(matrix, col) {
  const M = cloneMatrix(matrix);
  const pivot = M[col][col];

  for (let row = col + 1; row < M.length; row++) {
    const lambda = M[row][col];
    if (lambda === 0) continue;

    for (let k = col; k < M[row].length; k++) {
      M[row][k] = pivot * M[row][k] - lambda * M[col][k];
    }
  }

  return M;
}

export function gaussStepsInteger(matrix) {
  const steps = [];
  let current = cloneMatrix(matrix);

  steps.push(cloneMatrix(current)); // paso 0

  for (let col = 0; col < current.length - 1; col++) {
    current = eliminateColumnInteger(current, col);
    steps.push(cloneMatrix(current));
  }

  return steps;
}

export async function animateGauss(steps, delay = 1000) {
  for (let i = 0; i < steps.length; i++) {
    const planes = planesFromMatrix(steps[i]);
    updatePlanesInScene(planes); // TU función Three.js
    await new Promise(r => setTimeout(r, delay));
  }
}

/**
 * Actualiza los planos en la escena a partir de su representación algebraica
 * @param {Array} planes - Array de objetos {a, b, c, d}
 */
function updatePlanesInScene(planes) {
  planes.forEach((plane, i) => {
    // planesMeshes[i] es el Mesh de Three.js que representa cada plano
    const mesh = planesMeshes[i];

    // Actualizamos los coeficientes
    mesh.userData.a = plane.a;
    mesh.userData.b = plane.b;
    mesh.userData.c = plane.c;
    mesh.userData.d = plane.d;

    // Calculamos la normal
    const normal = new THREE.Vector3(plane.a, plane.b, plane.c);
    const length = normal.length();
    normal.normalize();

    // Rotación: alineamos la normal del plano con el eje Z original
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      normal
    );

    mesh.setRotationFromQuaternion(quaternion);

    // Posición: movemos el plano según la ecuación
    mesh.position.copy(normal).multiplyScalar(plane.d / length);
  });

  // Actualizamos la recta de intersección (si existe)
  if (intersectionLine) scene.remove(intersectionLine);

  const result = planeIntersectionLineGeneral(
    planes[0],
    planes[1]
  );

  if (result) {
    intersectionLine = drawIntersectionLine(result);
    scene.add(intersectionLine);
  } else {
    intersectionLine = null; // desaparece si los planos son paralelos o coincidentes
  }
}


