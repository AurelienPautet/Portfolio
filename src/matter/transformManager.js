import { TRANSFORM_CONFIG } from "./config";

const parentDataPool = new Array(TRANSFORM_CONFIG.maxParentDepth);
for (let i = 0; i < TRANSFORM_CONFIG.maxParentDepth; i++) {
  parentDataPool[i] = { x: 0, y: 0, cos: 0, sin: 0 };
}

const supportsIndividualTransforms = CSS.supports("translate", "0px");
const pendingDOMUpdates = [];
let isFlushScheduled = false;

function flushDOMUpdates() {
  isFlushScheduled = false;
  for (let i = 0; i < pendingDOMUpdates.length; i++) {
    const update = pendingDOMUpdates[i];
    if (supportsIndividualTransforms) {
      update.element.style.translate = update.translateStr;
      update.element.style.rotate = update.rotateStr;
    } else {
      update.element.style.transform = update.transformStr;
    }
  }
  pendingDOMUpdates.length = 0;
}

function scheduleDOMUpdate(element, x, y, angle) {
  pendingDOMUpdates.push({
    element: element,
    translateStr: x + "px " + y + "px",
    rotateStr: angle + "rad",
    transformStr:
      "translate3d(" + x + "px," + y + "px,0)rotateZ(" + angle + "rad)",
  });

  if (!isFlushScheduled) {
    isFlushScheduled = true;
    Promise.resolve().then(flushDOMUpdates);
  }
}

function initializeTransformCache(physicalDomObject) {
  if (!physicalDomObject._transformCache) {
    physicalDomObject._transformCache = {
      x: -999999,
      y: -999999,
      angle: -999999,
    };
    physicalDomObject.domElement.style.willChange = "transform";
  }
  return physicalDomObject._transformCache;
}

function roundValue(value, precision) {
  return Math.round(value * precision) / precision;
}

function transformSimple(physicalDomObject, x, y, angle, cache) {
  const localPos = physicalDomObject.localPos;
  localPos.x = x;
  localPos.y = y;
  physicalDomObject.localAngle = angle;

  const finalX = x - physicalDomObject.initialPos.x;
  const finalY = y - physicalDomObject.initialPos.y;
  const roundedX = roundValue(finalX, TRANSFORM_CONFIG.positionRounding);
  const roundedY = roundValue(finalY, TRANSFORM_CONFIG.positionRounding);
  const roundedAngle = roundValue(angle, TRANSFORM_CONFIG.angleRounding);

  if (
    cache.x !== roundedX ||
    cache.y !== roundedY ||
    cache.angle !== roundedAngle
  ) {
    cache.x = roundedX;
    cache.y = roundedY;
    cache.angle = roundedAngle;
    scheduleDOMUpdate(
      physicalDomObject.domElement,
      roundedX,
      roundedY,
      roundedAngle
    );
  }
}

function buildParentMatrix(parent, initialPos, angle) {
  let correctionX = -initialPos.x;
  let correctionY = -initialPos.y;
  let angleCorrection = angle;
  let cumulativeA = 1,
    cumulativeB = 0,
    cumulativeC = 0,
    cumulativeD = 1;
  let cumulativeE = 0,
    cumulativeF = 0;
  let parentCount = 0;
  let currentParent = parent;
  let isFirstParent = true;

  while (
    currentParent !== null &&
    parentCount < TRANSFORM_CONFIG.maxParentDepth
  ) {
    if (isFirstParent) {
      const parentInitial = currentParent.initialPos;
      correctionX += parentInitial.x;
      correctionY += parentInitial.y;
      angleCorrection -= currentParent.physicalBody.getAngle();
      isFirstParent = false;
    }

    const localPos = currentParent.localPos;
    const localAngle = currentParent.localAngle;
    const data = parentDataPool[parentCount];
    data.x = localPos.x;
    data.y = localPos.y;
    data.cos = Math.cos(localAngle);
    data.sin = Math.sin(localAngle);

    parentCount++;
    currentParent = currentParent.parent;
  }

  for (let i = parentCount - 1; i >= 0; i--) {
    const p = parentDataPool[i];
    const pCos = p.cos,
      pSin = p.sin,
      px = p.x,
      py = p.y;

    const newA = pCos * cumulativeA - pSin * cumulativeB;
    const newB = pSin * cumulativeA + pCos * cumulativeB;
    const newC = pCos * cumulativeC - pSin * cumulativeD;
    const newD = pSin * cumulativeC + pCos * cumulativeD;
    const newE = pCos * cumulativeE - pSin * cumulativeF + px;
    const newF = pSin * cumulativeE + pCos * cumulativeF + py;

    cumulativeA = newA;
    cumulativeB = newB;
    cumulativeC = newC;
    cumulativeD = newD;
    cumulativeE = newE;
    cumulativeF = newF;
  }

  return {
    correctionX,
    correctionY,
    angleCorrection,
    cumulativeA,
    cumulativeB,
    cumulativeC,
    cumulativeD,
    cumulativeE,
    cumulativeF,
  };
}

function invertMatrix(a, b, c, d, e, f) {
  const det = a * d - b * c;
  if (Math.abs(det) < 1e-10) return null;

  const invDet = 1 / det;
  return {
    invA: d * invDet,
    invB: -b * invDet,
    invC: -c * invDet,
    invD: a * invDet,
    invE: (c * f - d * e) * invDet,
    invF: (b * e - a * f) * invDet,
  };
}

function transformComplex(physicalDomObject, x, y, angle, cache, parent) {
  const matrix = buildParentMatrix(parent, physicalDomObject.initialPos, angle);
  const cumulativeRotation = Math.atan2(matrix.cumulativeB, matrix.cumulativeA);

  const inverse = invertMatrix(
    matrix.cumulativeA,
    matrix.cumulativeB,
    matrix.cumulativeC,
    matrix.cumulativeD,
    matrix.cumulativeE,
    matrix.cumulativeF
  );

  if (!inverse) return;

  const localX = inverse.invA * x + inverse.invC * y + inverse.invE;
  const localY = inverse.invB * x + inverse.invD * y + inverse.invF;
  const localAngle = angle - cumulativeRotation;

  const localPos = physicalDomObject.localPos;
  localPos.x = localX;
  localPos.y = localY;
  physicalDomObject.localAngle = localAngle;

  const finalX = localX + matrix.correctionX;
  const finalY = localY + matrix.correctionY;
  const roundedX = roundValue(finalX, TRANSFORM_CONFIG.positionRounding);
  const roundedY = roundValue(finalY, TRANSFORM_CONFIG.positionRounding);
  const roundedAngle = roundValue(
    matrix.angleCorrection,
    TRANSFORM_CONFIG.angleRounding
  );

  if (
    cache.x !== roundedX ||
    cache.y !== roundedY ||
    cache.angle !== roundedAngle
  ) {
    cache.x = roundedX;
    cache.y = roundedY;
    cache.angle = roundedAngle;
    scheduleDOMUpdate(
      physicalDomObject.domElement,
      roundedX,
      roundedY,
      roundedAngle
    );
  }
}

export function setAbsoluteTransform(physicalDomObject) {
  const physicalBody = physicalDomObject.physicalBody;
  const center = physicalBody.getCenter();
  const x = center.x;
  const y = center.y;
  const angle = physicalBody.getAngle();

  const cache = initializeTransformCache(physicalDomObject);
  const parent = physicalDomObject.parent;

  if (!parent) {
    transformSimple(physicalDomObject, x, y, angle, cache);
  } else {
    transformComplex(physicalDomObject, x, y, angle, cache, parent);
  }
}
