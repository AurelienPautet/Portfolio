import Matter from "matter-js";
import { COLLISION_CATEGORIES, MAGNET_CONFIG } from "./config";

const { Mouse, MouseConstraint, Body } = Matter;

// Module-level singletons: one Mouse and one MouseConstraint per engine lifetime.
// Recreating them on every physics rebuild leaks canvas listeners and engine
// `beforeUpdate` callbacks (see AUDIT_PERFORMANCES.md §1).
let mouse = null;
let mouseConstraint = null;

let isRightMouseDown = false;
let mousePosition = { x: 0, y: 0 };
let areMouseListenersAttached = false;

function handleMouseDown(e) {
  if (e.button === 2) isRightMouseDown = true;
}

function handleMouseUp(e) {
  if (e.button === 2) isRightMouseDown = false;
}

function handleMouseMove(e) {
  mousePosition.x = e.clientX + window.scrollX;
  mousePosition.y = e.clientY + window.scrollY;
}

function attachMouseListeners() {
  if (areMouseListenersAttached) return;

  // Register once: loadPhysics can run multiple times on resize.
  document.addEventListener("mousedown", handleMouseDown);
  document.addEventListener("mouseup", handleMouseUp);
  document.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("blur", resetDragState);

  areMouseListenersAttached = true;
}

/**
 * Creates the singleton Mouse + MouseConstraint, bound to the renderer canvas,
 * and keeps the position in document/world coordinates via a scroll offset.
 */
export function createMouseInteraction(render, engine) {
  if (mouse && mouseConstraint) {
    return mouseConstraint;
  }

  mouse = Mouse.create(render.canvas);
  Mouse.setScale(mouse, { x: 1, y: 1 });
  updateMouseScrollOffset();

  mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.12,
      angularStiffness: 0.15,
      damping: 0.2,
      render: {
        visible: true,
        strokeStyle: "#ffffff",
        lineWidth: 2,
      },
    },
  });

  mouseConstraint.collisionFilter.mask =
    COLLISION_CATEGORIES.default |
    COLLISION_CATEGORIES.sticky |
    COLLISION_CATEGORIES.wall;
  mouseConstraint.collisionFilter.category =
    COLLISION_CATEGORIES.default |
    COLLISION_CATEGORIES.sticky |
    COLLISION_CATEGORIES.wall;

  attachMouseListeners();

  return mouseConstraint;
}

/** Keeps Matter's mouse position in world coordinates as the page scrolls. */
export function updateMouseScrollOffset() {
  if (!mouse) return;
  Mouse.setOffset(mouse, { x: window.scrollX, y: window.scrollY });
}

/** Returns the Matter Mouse instance (for drag state / render decisions). */
export function getMouse() {
  return mouse;
}

/** Resets any in-flight drag before the world is rebuilt. */
export function resetDragState() {
  if (mouse) {
    mouse.button = -1;
    mouse.sourceEvents.mousemove = null;
    mouse.sourceEvents.mousedown = null;
    mouse.sourceEvents.mouseup = null;
    mouse.sourceEvents.mousewheel = null;
  }
  if (mouseConstraint) {
    mouseConstraint.body = null;
    if (mouseConstraint.constraint) {
      mouseConstraint.constraint.bodyB = null;
      mouseConstraint.constraint.pointB = null;
    }
  }
  isRightMouseDown = false;
}

/** True while the left button (or a touch) is actively dragging a body. */
export function isMouseDragging() {
  return !!mouse && mouse.button === 0;
}

/**
 * Removes the canvas listeners Matter's Mouse attached. Exposed for an explicit
 * engine teardown path.
 */
export function teardownMouseInteraction() {
  resetDragState();
  document.removeEventListener("mousedown", handleMouseDown);
  document.removeEventListener("mouseup", handleMouseUp);
  document.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("blur", resetDragState);
  areMouseListenersAttached = false;
  if (mouse && mouseConstraint) {
    const canvas = mouse.element;
    if (canvas) {
      canvas.removeEventListener("mousemove", mouse.mousemove);
      canvas.removeEventListener("mousedown", mouse.mousedown);
      canvas.removeEventListener("mouseup", mouse.mouseup);
      canvas.removeEventListener("wheel", mouse.mousewheel);
      canvas.removeEventListener("touchmove", mouse.mousemove);
      canvas.removeEventListener("touchstart", mouse.mousedown);
      canvas.removeEventListener("touchend", mouse.mouseup);
    }
  }
  mouse = null;
  mouseConstraint = null;
}

export function applyMagneticAttraction(physicalDomObjects) {
  if (!isRightMouseDown) return;

  const minDistanceSq = MAGNET_CONFIG.minDistance * MAGNET_CONFIG.minDistance;
  const maxDistanceSq = MAGNET_CONFIG.maxDistance * MAGNET_CONFIG.maxDistance;

  for (const physicalDomObject of physicalDomObjects) {
    if (
      physicalDomObject.physicalBody &&
      physicalDomObject.physicalBody.bodyData.body &&
      !physicalDomObject.constraint
    ) {
      const body = physicalDomObject.physicalBody.bodyData.body;
      if (body.isStatic) continue;

      const bodyPos = body.position;

      const dx = mousePosition.x - bodyPos.x;
      const dy = mousePosition.y - bodyPos.y;
      const distanceSq = dx * dx + dy * dy;

      if (distanceSq <= minDistanceSq || distanceSq >= maxDistanceSq) {
        continue;
      }

      const distance = Math.sqrt(distanceSq);
      const invDistance = 1 / distance;
      const distanceRatio = 1 - distance / MAGNET_CONFIG.maxDistance;
      const forceMagnitude =
        MAGNET_CONFIG.baseForce * body.mass * distanceRatio * distanceRatio;

      Body.applyForce(body, bodyPos, {
        x: dx * invDistance * forceMagnitude,
        y: dy * invDistance * forceMagnitude,
      });
    }
  }
}
