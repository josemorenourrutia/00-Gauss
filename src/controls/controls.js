import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

/**
 * Configura OrbitControls y TransformControls para un escenario.
 * @param {THREE.Camera} camera 
 * @param {THREE.Renderer} renderer 
 * @param {THREE.Scene} scene 
 * @returns {{orbit: OrbitControls, transform: TransformControls, attachObject: function, detachObject: function}}
 */

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


export function setupControls(camera, renderer, scene, container, objects) {
  // OrbitControls
  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enableDamping = true;
  orbit.dampingFactor = 0.05;

  // TransformControls
  const transform = new TransformControls(camera, renderer.domElement);
  scene.add(transform.getHelper());

  let selectedObject = null;
  // 🔹 Evita conflictos: sabremos si TransformControls está manipulando algo
  let isTransforming = false;

  function setActiveControls(active) {
    orbit.enabled = active;
    transform.enabled = active;
    if (!active) {
      selectedObject = null;
      transform.detach();
    }
  }

  // Función para adjuntar un objeto a TransformControls
  function attachObject(object) {
    if (!object || !transform.enabled) return;
    selectedObject = object;
    transform.attach(object);
    orbit.enabled = false;
  }

  // Función para desadjuntar el objeto
  function detachObject() {
    if (!transform.enabled) return;
    selectedObject = null;
    transform.detach();
    orbit.enabled = true;
  }

  transform.addEventListener('dragging-changed', (event) => {
    if (!transform.enabled) return;
    isTransforming = event.value;
    orbit.enabled = !event.value;
  });

  // 🔹 Evita que TransformControls cause deselect
  transform.addEventListener('mouseDown', () => {
    if (!transform.enabled) return;
    isTransforming = true;
  });
  transform.addEventListener('mouseUp', () => {
    if (!transform.enabled) return;
    setTimeout(() => (isTransforming = false), 50);
  });

  container.addEventListener('pointerdown', (event) => {
    if (!transform.enabled || !objects) return;

    if (isTransforming) return;
    mouse.x = (event.clientX / container.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / container.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(objects, false);
    if (intersects.length > 0) {
      attachObject(intersects[0].object);
    } else {
      detachObject();
    }
  });

  window.addEventListener('keydown', (event) => {
    switch (event.key.toLowerCase()) {
      case 't':
        transform.setMode('translate');
        break;
      case 'r':
        transform.setMode('rotate');
        break;
      case 's':
        transform.setMode('scale');
        break;
      case 'w':
        transform.setSpace('wold');
        break;
      case 'l':
        transform.setSpace('local');
        break;
    }
  });


  // Evitar conflicto al arrastrar
  // transform.addEventListener('dragging-changed', (event) => {
  //   orbit.enabled = !event.value;
  //   console.log("🚀 ~ controls.js:41 ~ setupControls ~ orbit:", orbit)
  // });

  return { orbit, transform, attachObject, detachObject, setActiveControls };
}
