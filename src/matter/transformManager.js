import { TRANSFORM_CONFIG } from "./config";

const supportsIndividualTransforms = CSS.supports("translate", "0px");
const pendingDOMUpdates = [];
let isFlushScheduled = false;

// Incremented once per UI frame (see beginFrame). Used to key per-frame caches.
let frameId = 0;

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
    // Fresh object (or fresh rebuild): reset the will-change hint baseline.
    physicalDomObject.domElement.style.willChange = "auto";
    physicalDomObject._willChangeOn = false;
  }
  return physicalDomObject._transformCache;
}

// will-change is a memory hint: keep it only while an object is actually moving.
function setWillChange(physicalDomObject, on) {
  if (on) {
    if (physicalDomObject._willChangeOn) return;
    physicalDomObject._willChangeOn = true;
    physicalDomObject.domElement.style.willChange = "transform";
  } else {
    if (!physicalDomObject._willChangeOn) return;
    physicalDomObject._willChangeOn = false;
    physicalDomObject.domElement.style.willChange = "auto";
  }
}

// An object is "settled" when it and its whole ancestor chain are static or
// sleeping. Sticky objects are excluded: their DOM transform follows the scroll
// offset, so they must keep recomputing.
function isSettled(physicalDomObject) {
  let current = physicalDomObject;
  while (current) {
    if (current.originalSticky) return false;
    const body = current.physicalBody?.bodyData?.body;
    if (!body) return false;
    if (!body.isStatic && !body.isSleeping) return false;
    current = current.parent;
  }
  // A sleeping/static body can still be repositioned explicitly (containment,
  // resize or a parent correction). Sleeping flags alone cannot invalidate it.
  const poses = physicalDomObject._restPoses ||= [];
  let changed = false;
  let depth = 0;
  for (current = physicalDomObject; current; current = current.parent) {
    const body = current.physicalBody.bodyData.body;
    const previous = poses[depth];
    if (!previous || previous.body !== body || previous.x !== body.position.x ||
      previous.y !== body.position.y || previous.angle !== body.angle) {
      changed = true;
      poses[depth] = { body, x: body.position.x, y: body.position.y, angle: body.angle };
    }
    depth++;
  }
  if (poses.length !== depth) changed = true;
  poses.length = depth;
  physicalDomObject._restPoseChanged = changed;
  return true;
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
      roundedAngle,
    );
  }
}

// Cumulative transform of an ancestor chain (direct parent up to the root),
// composed in the same order as the original buildParentMatrix. Cached per
// frame on the chain head so sibling children share one computation.
function getChainState(chainHead) {
  if (chainHead._chainFrame === frameId && chainHead._chainState) {
    return chainHead._chainState;
  }

  const chain = [];
  let current = chainHead;
  while (current !== null && chain.length < TRANSFORM_CONFIG.maxParentDepth) {
    chain.push(current);
    current = current.parent;
  }

  let A = 1,
    B = 0,
    C = 0,
    D = 1,
    E = 0,
    F = 0;

  for (let i = chain.length - 1; i >= 0; i--) {
    const localPos = chain[i].localPos;
    const localAngle = chain[i].localAngle;
    const pCos = Math.cos(localAngle);
    const pSin = Math.sin(localAngle);
    const px = localPos.x;
    const py = localPos.y;

    const nA = pCos * A - pSin * B;
    const nB = pSin * A + pCos * B;
    const nC = pCos * C - pSin * D;
    const nD = pSin * C + pCos * D;
    const nE = pCos * E - pSin * F + px;
    const nF = pSin * E + pCos * F + py;

    A = nA;
    B = nB;
    C = nC;
    D = nD;
    E = nE;
    F = nF;
  }

  const state = { A, B, C, D, E, F };
  chainHead._chainFrame = frameId;
  chainHead._chainState = state;
  return state;
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
  const chain = getChainState(parent);
  const cumulativeRotation = Math.atan2(chain.B, chain.A);

  const inverse = invertMatrix(chain.A, chain.B, chain.C, chain.D, chain.E, chain.F);
  if (!inverse) return;

  const localX = inverse.invA * x + inverse.invC * y + inverse.invE;
  const localY = inverse.invB * x + inverse.invD * y + inverse.invF;
  const localAngle = angle - cumulativeRotation;

  const localPos = physicalDomObject.localPos;
  localPos.x = localX;
  localPos.y = localY;
  physicalDomObject.localAngle = localAngle;

  const correctionX = -physicalDomObject.initialPos.x + parent.initialPos.x;
  const correctionY = -physicalDomObject.initialPos.y + parent.initialPos.y;
  const angleCorrection = angle - parent.physicalBody.getAngle();

  const finalX = localX + correctionX;
  const finalY = localY + correctionY;
  const roundedX = roundValue(finalX, TRANSFORM_CONFIG.positionRounding);
  const roundedY = roundValue(finalY, TRANSFORM_CONFIG.positionRounding);
  const roundedAngle = roundValue(angleCorrection, TRANSFORM_CONFIG.angleRounding);

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
      roundedAngle,
    );
  }
}

/** Call once per UI frame before transforming objects. */
export function beginFrame() {
  frameId++;
}

export function setAbsoluteTransform(physicalDomObject) {
  const physicalBody = physicalDomObject.physicalBody;
  if (!physicalBody || !physicalBody.bodyData?.body) return;

  const cache = initializeTransformCache(physicalDomObject);

  // Skip at-rest objects once their resting transform has been drawn, keeping
  // will-change off while they sleep.
  if (isSettled(physicalDomObject)) {
    if (physicalDomObject._settled && !physicalDomObject._restPoseChanged) {
      return;
    }
    physicalDomObject._settled = true;
    setWillChange(physicalDomObject, false);
  } else {
    physicalDomObject._settled = false;
    setWillChange(physicalDomObject, true);
  }

  const center = physicalBody.getCenter();
  const x = center.x;
  const y = center.y;
  const angle = physicalBody.getAngle();

  const parent = physicalDomObject.parent;

  if (!parent) {
    transformSimple(physicalDomObject, x, y, angle, cache);
  } else {
    transformComplex(physicalDomObject, x, y, angle, cache, parent);
  }
}
