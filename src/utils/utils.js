import * as THREE from 'three';

import nerdamer from 'nerdamer';
import 'nerdamer/Algebra';
import 'nerdamer/Solve';

// ---------- 3️⃣ Funciones matemáticas ----------

// Generar pasos de Gauss (sin denominadores)
export function cloneMatrix(M) { return M.map(r => r.slice()); }

// Convertir matriz en objetos planos
export function planesFromMatrix(matrix) {
  return matrix.map(row => ({ a: row[0], b: row[1], c: row[2], d: row[3] }));
}

const BASE_NORMAL = new THREE.Vector3(0, 0, 1);

export function interpolatePlane(plane, from, to, t, point) {
  plane.userData.a = THREE.MathUtils.lerp(from.a, to.a, t);
  plane.userData.b = THREE.MathUtils.lerp(from.b, to.b, t);
  plane.userData.c = THREE.MathUtils.lerp(from.c, to.c, t);
  plane.userData.d = THREE.MathUtils.lerp(from.d, to.d, t);


  // Normal y rotación
  const normal = new THREE.Vector3(plane.userData.a, plane.userData.b, plane.userData.c);
  // const length = normal.length();
  normal.normalize();

  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    BASE_NORMAL,
    normal
  );
  plane.setRotationFromQuaternion(quaternion);
  // Posición
  // plane.position.copy(normal).multiplyScalar(plane.userData.d / length);
  plane.position.copy(point);
}

export function intersectionPointOfThreePlanes(p1, p2, p3) {

  // Construir matriz de coeficientes
  const A = [
    [p1.a, p1.b, p1.c],
    [p2.a, p2.b, p2.c],
    [p3.a, p3.b, p3.c]
  ];
  const D = [p1.d, p2.d, p3.d];

  // Determinante de A
  const detA =
    A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
    A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
    A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);

  if (Math.abs(detA) < 1e-8) return null; // Planos no se intersectan en un punto único

  // Determinantes para Cramer
  const detX =
    D[0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
    A[0][1] * (D[1] * A[2][2] - A[1][2] * D[2]) +
    A[0][2] * (D[1] * A[2][1] - A[1][1] * D[2]);

  const detY =
    A[0][0] * (D[1] * A[2][2] - A[1][2] * D[2]) -
    D[0] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
    A[0][2] * (A[1][0] * D[2] - D[1] * A[2][0]);

  const detZ =
    A[0][0] * (A[1][1] * D[2] - D[1] * A[2][1]) -
    A[0][1] * (A[1][0] * D[2] - D[1] * A[2][0]) +
    D[0] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);

  return new THREE.Vector3(detX / detA, detY / detA, detZ / detA);
}

export function planeDirection(p1, p2) {
  const n1 = new THREE.Vector3(p1.a, p1.b, p1.c).normalize();
  const n2 = new THREE.Vector3(p2.a, p2.b, p2.c).normalize();
  return new THREE.Vector3().crossVectors(n1, n2).normalize();
}

export function updatePointDirectionLine(p1, p2) {
  const n1 = new THREE.Vector3(p1.a, p1.b, p1.c);
  const n2 = new THREE.Vector3(p2.a, p2.b, p2.c);
  const direction = new THREE.Vector3().crossVectors(n1, n2);
  const denom = direction.lengthSq();
  if (denom < 1e-8) return null;
  const term1 = new THREE.Vector3().crossVectors(n2, direction).multiplyScalar(p1.d);
  const term2 = new THREE.Vector3().crossVectors(direction, n1).multiplyScalar(p2.d);
  const point = term1.add(term2).divideScalar(denom);
  return { point, direction: direction.normalize() };
}

export function arePlanesProportional(p1, p2, eps = 1e-8) {
  const [a1, b1, c1, d1] = p1;
  const [a2, b2, c2, d2] = p2;

  // Normales nulas → no es un plano válido
  const n1 = Math.sqrt(a1 * a1 + b1 * b1 + c1 * c1);
  const n2 = Math.sqrt(a2 * a2 + b2 * b2 + c2 * c2);
  if (n1 < eps || n2 < eps) return false;

  let lambda = null;

  function checkRatio(x, y) {
    if (Math.abs(y) < eps) return Math.abs(x) < eps;
    const r = x / y;
    if (lambda === null) {
      lambda = r;
      return true;
    }
    return Math.abs(r - lambda) < eps;
  }

  return (
    checkRatio(a1, a2) &&
    checkRatio(b1, b2) &&
    checkRatio(c1, c2) &&
    checkRatio(d1, d2)
  );
}

function getPlaneNormalFromMesh(planeMesh) {
  const normal = new THREE.Vector3(0, 0, 1);
  return normal.applyQuaternion(planeMesh.quaternion).normalize();
}
export function updateArrowNormal(planeMesh, arrowNormal) {
  if (!arrowNormal) return;

  arrowNormal.position.copy(planeMesh.position);   // origen
  const normal = new THREE.Vector3(0, 0, 1);
  normal.applyQuaternion(planeMesh.quaternion);//.normalize();
  arrowNormal.setDirection(normal);                // dirección
}

function createAxis({
  direction,
  color,
  length = 3,
  radius = 0.01,
  headLength = 0.8, //0.4,
  headRadius = 0.1 //0.12
}) {
  const group = new THREE.Group();

  // Cuerpo (cilindro)
  const bodyGeo = new THREE.CylinderGeometry(radius, radius, length, 16);
  const bodyMat = new THREE.MeshBasicMaterial({ color });
  const body = new THREE.Mesh(bodyGeo, bodyMat);

  // Punta (cono)
  const headGeo = new THREE.ConeGeometry(headRadius, headLength, 16);
  const headMat = new THREE.MeshBasicMaterial({ color });
  const head = new THREE.Mesh(headGeo, headMat);

  // Alineación (el cilindro está en Y)
  const axis = direction.clone().normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    axis
  );

  body.quaternion.copy(quat);
  head.quaternion.copy(quat);

  // Posiciones
  body.position.copy(axis).multiplyScalar(length / 2);
  head.position.copy(axis).multiplyScalar(length + headLength / 2);

  group.add(body, head);
  return group;
}

export function createWorldAxes(length = 5) {
  const axes = new THREE.Group();

  axes.add(createAxis({
    direction: new THREE.Vector3(1, 0, 0),
    color: 0xff0000,
    length
  }));

  axes.add(createAxis({
    direction: new THREE.Vector3(0, 1, 0),
    color: 0x00ff00,
    length
  }));

  axes.add(createAxis({
    direction: new THREE.Vector3(0, 0, 1),
    color: 0x0000ff,
    length
  }));

  return axes;
}

function threeColorToCSS(hex) {
  return '#' + hex.toString(16).padStart(6, '0');
}

function hexToRGB(hex) {
  return {
    r: (hex >> 16) & 255,
    g: (hex >> 8) & 255,
    b: hex & 255
  };
}

function createTextTexture(text, color = '#000000') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;

  const ctx = canvas.getContext('2d');

  // 🔴 IMPORTANTE: limpiar, no pintar fondo
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ctx.lineWidth = 3;
  // ctx.strokeStyle = 'black';
  // ctx.fillStyle = '#ffffff';//color;
  // ctx.fillStyle = 'rgba(255,255,255,1)';
  ctx.fillStyle = 'white';//'rgba(255,255,255,1)';
  ctx.font = '24px Arial';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';

  const margin = 20;

  ctx.fillText(
    text,
    canvas.width - margin,
    margin
  );

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;
  texture.userData = { canvas, ctx, texture }
  return texture;
}

export function updatePlaneText(textMesh, newText) {
  const { ctx, canvas, texture } = textMesh.userData;

  // limpiar canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // dibujar nuevo texto
  ctx.fillStyle = 'white';//'rgba(255,255,255,1)';
  ctx.font = '24px Arial';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(newText, canvas.width - 20, 10);

  // actualizar textura
  texture.needsUpdate = true;
}

export function createTextPlane(text, color) {
  const texture = createTextTexture(text, color);

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,     // 🔥 obligatorio
    side: THREE.DoubleSide,
    depthWrite: false      // evita artefactos
  });

  const geometry = new THREE.PlaneGeometry(2.5, 1.2);
  const textMesh = new THREE.Mesh(geometry, material)
  textMesh.userData = texture.userData
  return textMesh;
}

export function attachTextToPlane(planeMesh, text, color, offset = 0.01) {
  const textMesh = createTextPlane(text, color);

  textMesh.isText = true;

  textMesh.position.set(0, 0, offset) // pequeño offset normal
    .add(new THREE.Vector3((6 - 2.5) / 2, (6 - 1.2) / 2, 0))
  planeMesh.add(textMesh);
  planeMesh.userData.textMesh = textMesh;

  return textMesh;
}

export function planeObjectToArray(planeObj) {
  return [planeObj.a, planeObj.b, planeObj.c, planeObj.d];
}

export function planeArrayToEquation([a, b, c, d]) {
  const terms = ['x', 'y', 'z'];
  let equation = '';

  for (let i = 0; i < 3; i++) {
    const coef = [a, b, c][i];

    if (coef === 0) continue; // omitimos términos 0

    // Signo
    if (equation.length > 0) {
      equation += coef > 0 ? ' + ' : ' - ';
    } else {
      if (coef < 0) equation += '-';
    }

    // Valor absoluto del coeficiente
    const absCoef = Math.abs(coef);

    // Mostrar coeficiente solo si != 1
    equation += absCoef === 1 ? terms[i] : absCoef + terms[i];
  }

  equation += ' = ' + d;

  return equation;
}

export function disposeMesh(mesh) {
  if (!mesh) return;

  // 1. Eliminar de la escena si está
  // if (mesh.parent) {
  //   mesh.parent.remove(mesh);
  // }

  // 2. Recorrer y liberar hijos
  mesh.traverse(obj => {
    // Geometría
    if (obj.geometry) {
      obj.geometry.dispose();
    }

    // Material(es)
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach(mat => disposeMaterial(mat));
      } else {
        disposeMaterial(obj.material);
      }
    }
  });
}

function disposeMaterial(material) {
  // Texturas
  for (const key in material) {
    const value = material[key];
    if (value && value.isTexture) {
      value.dispose();
    }
  }
  material.dispose();
}


export function logRendererInfo(renderer, label = '') {
  console.log(
    label,
    'Geometries:', renderer.info.memory.geometries,
    'Textures:', renderer.info.memory.textures,
    'Programs:', renderer.info.programs?.length ?? 'n/a',
    'Calls:', renderer.info.render.calls
  );
}


export function drawText(ctx, text, options = {}) {
  const {
    width = ctx.canvas.width,
    height = ctx.canvas.height,
    font = '48px Arial',
    color = '#ffffff',
    align = 'right',
    baseline = 'top',
    padding = 20
  } = options;

  // limpiar canvas
  ctx.clearRect(0, 0, width, height);

  // texto
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;

  const x = align === 'right' ? width - padding : padding;
  const y = padding;

  ctx.fillText(text, x, y);
}

export function solveSystemWithNerdamer(matrix) {
  const vars = ['x', 'y', 'z'];

  const equations = matrix.map(row =>
    `${row[0]}*x + ${row[1]}*y + ${row[2]}*z = ${row[3]}`
  );
  console.log("🚀 ~ main.js:63 ~ solveSystemWithNerdamer ~ equations:", equations)

  console.log(`solve(${equations}, ${vars})`)
  // const sol = nerdamer.solve(equations, vars);
  // const sol = nerdamer('solve("1*x + 1*y + 1*z = 1","1*x + 2*y + 3*z = 4","4*x + -2*y + 3*z = 1", "x,y,z"')
  const sol = nerdamer.solveEquations(equations);
  // var sol = nerdamer.solveEquations(['x+y=1', '2*x=6', '4*z+y=6']);
  console.log("🚀 ~ main.js:70 ~ solveSystemWithNerdamer ~ sol:", sol)
  let e = nerdamer(sol[0][1]).toTeX();
  console.log(e);

  return {
    x: nerdamer(sol[0][1]).toTeX(),
    y: nerdamer(sol[1][1]).toTeX(),
    z: nerdamer(sol[2][1]).toTeX(),
  };
}


export function backwardSubstitutionLatex(matrix) {
  const steps = [];
  const vars = {}; // aquí guardamos z, y, x como expresiones nerdamer

  const n = matrix.length;

  for (let i = n - 1; i >= 0; i--) {
    const row = matrix[i];
    const varName = ['x', 'y', 'z'][i];

    let expr = nerdamer(row[3].toString()); // término independiente

    let latexStep = `${row[3]}`;

    for (let j = i + 1; j < n; j++) {
      const coef = row[j];
      const v = ['x', 'y', 'z'][j];

      if (coef !== 0) {
        expr = expr.subtract(
          nerdamer(coef.toString()).multiply(vars[v])
        );

        latexStep += ` - (${coef})\\cdot ${vars[v].toTeX()}`;
      }
    }

    expr = expr.divide(row[i]);
    vars[varName] = expr;

    steps.push(`
\\begin{aligned}
${row[i]}${varName} &= ${latexStep} \\\\
${varName} &= ${expr.toTeX()}
\\end{aligned}
    `);
  }

  return {
    steps: steps.reverse(), // x, y, z en orden
    solution: {
      x: vars.x.toTeX(),
      y: vars.y.toTeX(),
      z: vars.z.toTeX()
    }
  };
}


