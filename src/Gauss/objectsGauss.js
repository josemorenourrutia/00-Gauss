import { createPlane, createCylinder, createPoint, createArrow } from '../objects/objects.js';

export const objectsGauss = {
  planes: [],
  lines: [],
  point: createPoint(),
}

objectsGauss.planes.push(createPlane({ color: 0xEB3443 }));
objectsGauss.planes.push(createPlane({ color: 0x34EB43 }));
objectsGauss.planes.push(createPlane({ color: 0x3443EB }));

objectsGauss.lines.push(createCylinder());
objectsGauss.lines.push(createCylinder());
objectsGauss.lines.push(createCylinder());

objectsGauss.planes[0].add(createArrow({ length: 6, color: 0xEB3443 }));
objectsGauss.planes[1].add(createArrow({ length: 6, color: 0x34EB43 }));
objectsGauss.planes[2].add(createArrow({ length: 6, color: 0x3443EB }));

