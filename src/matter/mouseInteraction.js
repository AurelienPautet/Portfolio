import Matter from "matter-js";
import { COLLISION_CATEGORIES } from "./config";

const { Mouse, MouseConstraint, Body } = Matter;

let isRightMouseDown = false;
let mousePosition = { x: 0, y: 0 };

export function createMouseInteraction(render, engine) {
  const mouse = Mouse.create(render.canvas);

  const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      angularStiffness: 0.2,
      damping: 0.1,
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

  // Mouse events
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

  return mouseConstraint;
}

export function applyMagneticAttraction(physicalDomObjects) {
  if (!isRightMouseDown) return;

  for (const physicalDomObject of physicalDomObjects) {
    if (
      physicalDomObject.physicalBody &&
      physicalDomObject.physicalBody.bodyData.body &&
      !physicalDomObject.constraint
    ) {
      const body = physicalDomObject.physicalBody.bodyData.body;
      const bodyPos = body.position;

      const dx = mousePosition.x - bodyPos.x;
      const dy = mousePosition.y - bodyPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5 && distance < 300) {
        const forceMagnitude = 0.01 * body.mass;
        const forceX = (dx / distance) * forceMagnitude;
        const forceY = (dy / distance) * forceMagnitude;

        Body.applyForce(body, bodyPos, {
          x: forceX,
          y: forceY,
        });
      }
    }
  }
}
