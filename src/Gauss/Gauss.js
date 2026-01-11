import {
  cloneMatrix,
  interpolatePlane,
  planeDirection,
} from '../utils/utils.js';

import { updateCylinder } from '../objects/objects.js';

import { objectsGauss } from './objectsGauss.js';

import nerdamer from 'nerdamer';
import 'nerdamer/Algebra';
// import 'nerdamer/Calculus';
import 'nerdamer/Solve';
// import 'nerdamer/Extra';


function eliminateColumnInteger(matrix, col) {
  const M = cloneMatrix(matrix);
  const MLatex = cloneMatrix(matrix);
  const pivot = M[col][col];
  let text = [];
  for (let row = col + 1; row < M.length; row++) {
    const lambda = M[row][col];
    if (lambda === 0) continue;
    text.push(String.raw`${pivot} \cdot F_${row + 1} ${lambda < 0 ? `+${-lambda}` : `-${lambda}`} \cdot F_${col + 1}`)
    for (let k = col; k < M[row].length; k++) {
      M[row][k] = pivot * M[row][k] - lambda * M[col][k];
    }
  }
  return { text, matrix: M, matrixLatex: M };
}

function backSubstitution(matrix, matrixLatex, col) {
  const M = cloneMatrix(matrix);
  const MLatex = cloneMatrix(matrixLatex);

  const pivot = M[col - 1][col - 1];
  const pivotLatex = nerdamer(M[col - 1][col - 1]).toString();

  const k = M.length;
  for (let row = col - 1; row >= 0; row--) {
    M[row][k] -= M[col][k] * M[row][col];
    M[row][col] = 0;

    // let expr = nerdamer(MLatex[row][k]);
    MLatex[row][k] = nerdamer(MLatex[row][k]).subtract(
      nerdamer(MLatex[col][k].toString()).multiply(MLatex[row][col])
    ).toString();
    // MLatex[row][k] = expr;
    MLatex[row][col] = 0;
  }
  M[col - 1][k] /= pivot;
  M[col - 1][col - 1] = 1;

  MLatex[col - 1][k] = nerdamer(MLatex[col - 1][k]).divide(pivotLatex).toString();
  MLatex[col - 1][col - 1] = 1;

  return { text: "", matrix: M, matrixLatex: MLatex };
}

export function gaussStepsInteger(matrix) {
  const steps = [];
  let current = cloneMatrix(matrix);
  steps.push({ text: "", matrix: current, matrixLatex: cloneMatrix(current) });
  for (let col = 0; col < current.length - 1; col++) {
    const ret = eliminateColumnInteger(current, col);
    current = ret.matrix;
    steps.push({ text: ret.text, matrix: cloneMatrix(current), matrixLatex: cloneMatrix(current) });
  }

  const eps = 1e-9;

  let currentLatex = cloneMatrix(current);
  let expr = nerdamer(currentLatex[current.length - 1][current.length - 0]).toString();
  expr = nerdamer(expr).divide(currentLatex[current.length - 1][current.length - 1])
  currentLatex[current.length - 1][current.length - 0] = expr.toString();
  currentLatex[current.length - 1][current.length - 1] = 1;

  current[current.length - 1][current.length - 0] /= current[current.length - 1][current.length - 1]
  current[current.length - 1][current.length - 1] = 1

  for (let col = current.length - 1; col > 0; col--) {
    if (Math.abs(current[col][col]) < eps) {
      throw new Error('Sistema singular o indeterminado');
    }
    const ret = backSubstitution(current, currentLatex, col);
    current = ret.matrix;
    currentLatex = ret.matrixLatex;
    steps.push({ text: "", matrix: cloneMatrix(current), matrixLatex: cloneMatrix(currentLatex) });
  }

  return steps;
}

export function initialStep(fromPlanes, toPlanes, point) {

  for (let i = 0, k = objectsGauss.planes.length; i < k; i++) {
    interpolatePlane(objectsGauss.planes[i], fromPlanes[i], toPlanes[i], 0, point);
  }
  for (let i = 0, k = objectsGauss.planes.length; i < k; i++) {
    let direction = planeDirection(
      fromPlanes[i],
      fromPlanes[(i + 1) % k]
    );
    if (direction) {
      updateCylinder(objectsGauss.lines[i], { point, direction });
    }
  }

}


export function animateStep(fromPlanes, toPlanes, point, duration = 1.5) {
  let t = 0;

  function animate() {
    t += 0.016 / duration; // incrementa por frame (~60fps)
    if (t > 1) t = 1;

    for (let i = 0, k = objectsGauss.planes.length; i < k; i++) {
      interpolatePlane(objectsGauss.planes[i], fromPlanes[i], toPlanes[i], t, point);
    }

    for (let i = 0, k = objectsGauss.planes.length; i < k; i++) {
      const direction = planeDirection(
        objectsGauss.planes[i].userData,
        objectsGauss.planes[(i + 1) % k].userData
      );
      if (direction) {
        updateCylinder(objectsGauss.lines[i], { point, direction });
      }
    }

    if (t < 1) {
      requestAnimationFrame(animate);
    }
  }

  animate();
}



// // ---------- 6️⃣ Animación paso a paso ----------
// export async function animateGauss(steps, delay = 1000) {
//   for (let i = 0; i < steps.length; i++) {
//     const planes = planesFromMatrix(steps[i]);
//     updatePlanesInScene(planes);
//     console.log("Paso", i);
//     await new Promise(r => setTimeout(r, delay));
//   }
// }
