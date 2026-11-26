import { TRANSFORM_CONFIG } from "./config";

// Writes each moved element's pose as a single inline `transform`. One style
// write per element per frame (the Matter.js version wrote `translate` and
// `rotate` separately, two style mutations), and nothing at all for elements
// whose body and ancestors did not move this frame.

const round = (value, precision) => Math.round(value * precision) / precision;

// While bodies fly around (after "NO" or "YES" ~900 move at once), an element
// is only written when it can matter on screen: its body is near the viewport,
// or it is still drawn near the viewport (so it has to move away), or an
// ancestor was written this frame (its drawing moved with that ancestor).
// Anything else keeps its latest pose pending until it comes within range.
const OFFSCREEN_MARGIN = 300;
let staleCount = 0;
let currentFrame = 0;

function isNear(x, y, size) {
  const reach = OFFSCREEN_MARGIN + size;
  const left = window.scrollX - reach;
  const top = window.scrollY - reach;
  return x > left && x < left + window.innerWidth + 2 * reach &&
    y > top && y < top + window.innerHeight + 2 * reach;
}

function shouldWrite(object) {
  const body = object.physicalBody;
  if (body.isSticky) return true;
  const size = Math.max(body.width, body.height);
  if (isNear(body.x, body.y, size)) return true;
  if (isNear(object._shown.x, object._shown.y, size)) return true;
  for (let current = object.parent; current; current = current.parent) {
    if (current._writtenFrame === currentFrame) return true;
  }
  return false;
}

function setStale(object, stale) {
  if (object._stale === stale) return;
  object._stale = stale;
  staleCount += stale ? 1 : -1;
}

/** True while some element still shows an outdated pose (off-screen). */
export function hasStaleTransforms() {
  return staleCount > 0;
}

function apply(object) {
  const { x, y, angle, bodyX, bodyY } = object._pending;
  const cache = object._transformCache;
  setStale(object, false);
  object._writtenFrame = currentFrame;
  object._shown.x = bodyX;
  object._shown.y = bodyY;
  if (cache.x === x && cache.y === y && cache.angle === angle) return;
  cache.x = x;
  cache.y = y;
  cache.angle = angle;
  object.domElement.style.transform =
    angle === 0 ? `translate(${x}px,${y}px)` : `translate(${x}px,${y}px) rotate(${angle}rad)`;
}

// A child is drawn inside its ancestors, so they must show their current pose
// before the child's transform (relative to them) means anything.
function applyStaleAncestors(object) {
  const stale = [];
  for (let current = object.parent; current; current = current.parent) {
    if (current._stale) stale.push(current);
  }
  for (let i = stale.length - 1; i >= 0; i--) apply(stale[i]);
}

function writeTransform(object, x, y, angle) {
  const body = object.physicalBody;
  object._pending = {
    x: round(x, TRANSFORM_CONFIG.positionRounding),
    y: round(y, TRANSFORM_CONFIG.positionRounding),
    angle: round(angle, TRANSFORM_CONFIG.angleRounding),
    bodyX: body.x,
    bodyY: body.y,
  };
  if (!shouldWrite(object)) {
    setStale(object, true);
    return;
  }
  applyStaleAncestors(object);
  apply(object);
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
    object._pending = null;
    object._stale = false;
  }
  staleCount = 0;
}

function flushIfNear(object) {
  if (!object._stale || !shouldWrite(object)) return;
  applyStaleAncestors(object);
  apply(object);
}

/**
 * Applies this frame's poses to the DOM. Parents come before their children in
 * `physicalDomObjects`, so a child always reads its parent's fresh local pose.
 */
export function updateTransforms(physicalDomObjects, frame, scrolled) {
  currentFrame = frame;
  for (const object of physicalDomObjects) {
    if (!object.physicalBody) continue;
    if (!object._transformCache) {
      object._transformCache = { x: 0, y: 0, angle: 0 };
      // Where the element is drawn, in page pixels (its layout position).
      object._shown = { x: object.initialPos.x, y: object.initialPos.y };
      object._willChange = false;
      object.localPos.x = object.initialPos.x;
      object.localPos.y = object.initialPos.y;
      object.localAngle = 0;
    }
    if (!needsUpdate(object, frame, scrolled)) {
      // Scrolled into range since its last move: show its current pose.
      if (scrolled && object._stale) flushIfNear(object);
      if (object._willChange && !isMoving(object)) setWillChange(object, false);
      continue;
    }
    updateObject(object);
    setWillChange(object, !object._stale && isMoving(object));
  }
}
