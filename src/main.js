import * as THREE from 'three';
import { all } from './core/all.js';

import nerdamer from 'nerdamer';
import 'nerdamer/Algebra';
import 'nerdamer/Calculus';
import 'nerdamer/Solve';
import 'nerdamer/Extra';

import 'katex/dist/katex.min.css';


import {
  gaussStepsInteger,
  animateStep,
  initialStep
} from './Gauss/Gauss.js';

import {
  createWorldAxes,
  attachTextToPlane,
  planeArrayToEquation,
  logRendererInfo,
  planesFromMatrix,
  updatePlaneText,
} from './utils/utils.js';

import {
  updatePoint,
} from './objects/objects.js';

import { objectsGauss } from './Gauss/objectsGauss.js';

import { renderAllSteps, renderAllStepsLatex } from './latex/gaussSteps.js';

const container = document.getElementById('app');

export const { scene, camera, renderer, setActiveControls, createLoop } = all(container);
// camera.position.set(10, 3, 4);
const axes = createWorldAxes(6);
scene.add(axes);

scene.add(...objectsGauss.planes);
scene.add(...objectsGauss.lines);
scene.add(objectsGauss.point);

const initialMatrix = [
  [2, 1, 1, 1],
  [1, 2, 3, 4],
  [4, -2, 3, 1]
];

function det3x3(m) {
  return (
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  );
}

function solveSystemWithNerdamer(matrix) {
  const vars = ['x', 'y', 'z'];

  const equations = matrix.map(row =>
    `${row[0]}*x + ${row[1]}*y + ${row[2]}*z = ${row[3]}`
  );
  const sol = nerdamer.solveEquations(equations);

  return {
    x: nerdamer(sol[0][1]).text(),
    y: nerdamer(sol[1][1]).text(),
    z: nerdamer(sol[2][1]).text(),
  };
}


let steps, currentStep = 0;
let point;
let planesMatrix,
  numPaso = document.getElementById('numPaso');

const nextButton = document.getElementById('nextButton');
const prevButton = document.getElementById('prevButton');
const detDiv = document.getElementById('det');
prevButton.disabled = true;


attachTextToPlane(objectsGauss.planes[0], planeArrayToEquation(initialMatrix[0]));//, 0x3443EB)
attachTextToPlane(objectsGauss.planes[1], planeArrayToEquation(initialMatrix[1]));//, 0x3443EB)
attachTextToPlane(objectsGauss.planes[2], planeArrayToEquation(initialMatrix[2]));//, 0x3443EB)

applyNewMatrix(initialMatrix);

// Tamaño del grid (en unidades) y número de divisiones
const size = 20;       // ancho y largo del grid
const divisions = 20;  // cuántas líneas

const gridHelper = new THREE.GridHelper(size, divisions, 0x888888, 0xcccccc);
// Añadir a la escena
scene.add(gridHelper);

const loop = createLoop(() => {
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
}, () => {
  renderer.render(scene, camera);
}, setActiveControls);
// loop.stop();


function readMatrixFromUI() {
  const inputs = document.querySelectorAll('#matrix-ui input');
  const matrix = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];

  inputs.forEach(input => {
    const r = parseInt(input.dataset.r);
    const c = parseInt(input.dataset.c);
    matrix[r][c] = parseFloat(input.value);
  });

  return matrix;
}

function applyNewMatrix(initialMatrix = readMatrixFromUI()) {

  const det = det3x3(initialMatrix);
  detDiv.innerHTML = 'Det = ' + det;
  if (Math.abs(det) < 1.e-5) return;

  point = solveSystemWithNerdamer(initialMatrix);
  if (point) {
    updatePoint(objectsGauss.point, point); // esfera para resaltar
  }

  // 1. Recalcular pasos de Gauss
  steps = gaussStepsInteger(initialMatrix);
  // steps.forEach((step, i) => {
  //   console.log(`Paso ${i}:`);
  //   console.table(step.matrix);
  // });
  renderAllSteps(steps)

  // 4. Lanzar animación
  planesMatrix = steps.map(step => (planesFromMatrix(step.matrix)));
  initialStep(planesMatrix[0], planesMatrix[0], point)
  // logRendererInfo(renderer);
}

function updateAllPlaneText() {
  updatePlaneText(objectsGauss.planes[0].userData.textMesh, planeArrayToEquation(steps[currentStep].matrixLatex[0]));//, 0x3443EB)
  updatePlaneText(objectsGauss.planes[1].userData.textMesh, planeArrayToEquation(steps[currentStep].matrixLatex[1]));//, 0x3443EB)
  updatePlaneText(objectsGauss.planes[2].userData.textMesh, planeArrayToEquation(steps[currentStep].matrixLatex[2]));//, 0x3443EB)

}

document.getElementById('applyMatrix').onclick = () => {
  applyNewMatrix();
  currentStep = 0;
  numPaso.innerHTML = 'Paso';
  nextButton.disabled = currentStep === steps.length - 1;
  prevButton.disabled = currentStep === 0;

  updateAllPlaneText();
};


nextButton.addEventListener('click', () => {
  animateStep(planesMatrix[currentStep], planesMatrix[currentStep + 1], point);
  currentStep++;
  numPaso.innerHTML = `Paso ${currentStep}`

  nextButton.disabled = currentStep === steps.length - 1;
  prevButton.disabled = currentStep === 0;

  updateAllPlaneText();
});

prevButton.addEventListener('click', () => {
  animateStep(planesMatrix[currentStep], planesMatrix[currentStep - 1], point);
  currentStep--;
  numPaso.innerHTML = `Paso ${currentStep === 0 ? '' : currentStep}`

  nextButton.disabled = currentStep === steps.length - 1;
  prevButton.disabled = currentStep === 0;

  updateAllPlaneText();
});

