import { TRANSFORM_CONFIG } from "./config";

// Writes each moved element's pose as a single inline `transform`. One style
// write per element per frame (the Matter.js version wrote `translate` and
// `rotate` separately, two style mutations), and nothing at all for elements
// whose body and ancestors did not move this frame.

const round = (value, precision) => Math.round(value * precision) / precision;

function writeTransform(object, x, y, angle) {
  const cache = object._transformCache;
  const rx = round(x, TRANSFORM_CONFIG.positionRounding);
  const ry = round(y, TRANSFORM_CONFIG.positionRounding);
  const ra = round(angle, TRANSFORM_CONFIG.angleRounding);
  if (cache.x === rx && cache.y === ry && cache.angle === ra) return;
  cache.x = rx;
  cache.y = ry;
  cache.angle = ra;
  object.domElement.style.transform =
    ra === 0 ? `translate(${rx}px,${ry}px)` : `translate(${rx}px,${ry}px) rotate(${ra}rad)`;
}

// `will-change` promotes an element to its own GPU layer: worth it while it
// moves, wasted memory once it rests.
function setWillChange(object, on) {
  if (object._willChange === on) return;
  object._willChange = on;
  object.domElement.style.willChange = on ? "transform" : "auto";
}

function needsUpdate(object, frame, scrolled) {
  for (let current = object; current; current = current.parent) {
    const body = current.physicalBody;
    if (!body) continue;
    if (body.movedFrame === frame) return true;
    if (scrolled && body.isSticky) return true;
  }
  return false;
}

function isMoving(object) {
  for (let current = object; current; current = current.parent) {
    const body = current.physicalBody;
    if (body && !body.isAtRest()) return true;
  }
  return false;
}

/**
 * Cumulative 2D transform (a, b, c, d, e, f) of an element's physical ancestors,
 * built from the local poses written for them earlier in this pass.
 */
function ancestorMatrix(object) {
  const chain = [];
  for (let current = object.parent; current; current = current.parent) chain.push(current);
  let A = 1, B = 0, C = 0, D = 1, E = 0, F = 0;
  for (let i = chain.length - 1; i >= 0; i--) {
    const { localPos, localAngle } = chain[i];
    const cos = Math.cos(localAngle);
    const sin = Math.sin(localAngle);
    const nA = cos * A - sin * B;
    const nB = sin * A + cos * B;
    const nC = cos * C - sin * D;
    const nD = sin * C + cos * D;
    const nE = cos * E - sin * F + localPos.x;
    const nF = sin * E + cos * F + localPos.y;
    A = nA; B = nB; C = nC; D = nD; E = nE; F = nF;
  }
  return { A, B, C, D, E, F };
}

function updateObject(object) {
  const body = object.physicalBody;
  const center = body.getCenter();
  const angle = body.getAngle();
  const parent = object.parent;

  if (!parent?.physicalBody) {
    object.localPos.x = center.x;
    object.localPos.y = center.y;
    object.localAngle = angle;
    writeTransform(object, center.x - object.initialPos.x, center.y - object.initialPos.y, angle);
    return;
  }

  // The element is laid out inside its parent's (already moved) box: express
  // the body pose in the parent's frame.
  const m = ancestorMatrix(object);
  const det = m.A * m.D - m.B * m.C;
  if (Math.abs(det) < 1e-10) return;
  const inv = 1 / det;
  const dx = center.x - m.E;
  const dy = center.y - m.F;
  const localX = (m.D * dx - m.C * dy) * inv;
  const localY = (-m.B * dx + m.A * dy) * inv;
  object.localPos.x = localX;
  object.localPos.y = localY;
  object.localAngle = angle - Math.atan2(m.B, m.A);
  writeTransform(
    object,
    localX - object.initialPos.x + parent.initialPos.x,
    localY - object.initialPos.y + parent.initialPos.y,
    angle - parent.physicalBody.getAngle(),
  );
}

/** Resets cached transforms before a rebuild measures the layout again. */
export function clearTransforms(physicalDomObjects) {
  for (const object of physicalDomObjects) {
    object.domElement.style.transform = "";
    object.domElement.style.willChange = "auto";
    object._transformCache = null;
  }
}

/**
 * Applies this frame's poses to the DOM. Parents come before their children in
 * `physicalDomObjects`, so a child always reads its parent's fresh local pose.
 */
export function updateTransforms(physicalDomObjects, frame, scrolled) {
  for (const object of physicalDomObjects) {
    if (!object.physicalBody) continue;
    if (!object._transformCache) {
      object._transformCache = { x: 0, y: 0, angle: 0 };
      object._willChange = false;
      object.localPos.x = object.initialPos.x;
      object.localPos.y = object.initialPos.y;
      object.localAngle = 0;
    }
    if (!needsUpdate(object, frame, scrolled)) {
      if (object._willChange && !isMoving(object)) setWillChange(object, false);
      continue;
    }
    setWillChange(object, isMoving(object));
    updateObject(object);
  }
}
