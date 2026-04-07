import Matter from "matter-js";
import { COLLISION_CATEGORIES, MAGNET_CONFIG } from "./config";

const { Mouse, MouseConstraint, Body } = Matter;

let isRightMouseDown = false;
let mousePosition = { x: 0, y: 0 };
let areMouseListenersAttached = false;

function attachMouseListeners() {
  if (areMouseListenersAttached) return;

  // Register listeners once because loadPhysics can run multiple times on resize.
  document.addEventListener("mousedown", (e) => {
    if (e.button === 2) {
      isRightMouseDown = true;
    }
  });

  document.addEventListener("mouseup", (e) => {
    if (e.button === 2) {
      isRightMouseDown = false;
    }
  });

  document.addEventListener("mousemove", (e) => {
    mousePosition.x = e.clientX + window.scrollX;
    mousePosition.y = e.clientY + window.scrollY;
  });

  areMouseListenersAttached = true;
}

export function createMouseInteraction(render, engine) {
  const mouse = Mouse.create(render.canvas);

  const mouseConstraint = MouseConstraint.create(engine, {
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
