import Matter from "matter-js";
import { COLLISION_CATEGORIES } from "./config";

const { Mouse, MouseConstraint } = Matter;

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

  return mouseConstraint;
}
