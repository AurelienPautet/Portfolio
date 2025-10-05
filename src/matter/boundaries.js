import Matter from "matter-js";
import { COLLISION_CATEGORIES, WALL_CONFIG } from "./config";

const { Bodies } = Matter;

export function createBoundaries(bodySize) {
  const ground = Bodies.rectangle(
    Math.floor(bodySize.width / 2),
    Math.floor(bodySize.height) + WALL_CONFIG.offset,
    Math.floor(bodySize.width) * 2,
    WALL_CONFIG.thickness,
    {
      isStatic: true,
      restitution: WALL_CONFIG.restitution,
      render: { fillStyle: "blue" },
      collisionFilter: { category: COLLISION_CATEGORIES.wall },
    }
  );

  const ceiling = Bodies.rectangle(
    Math.floor(bodySize.width / 2),
    -WALL_CONFIG.offset,
    Math.floor(bodySize.width) * 2,
    WALL_CONFIG.thickness,
    {
      isStatic: true,
      render: { fillStyle: "gray" },
      collisionFilter: { category: COLLISION_CATEGORIES.wall },
    }
  );

  const leftWall = Bodies.rectangle(
    -WALL_CONFIG.offset,
    Math.floor(bodySize.height / 2),
    WALL_CONFIG.thickness,
    Math.floor(bodySize.height) * 2,
    {
      isStatic: true,
      render: { fillStyle: "gray" },
      collisionFilter: { category: COLLISION_CATEGORIES.wall },
    }
  );

  const rightWall = Bodies.rectangle(
    Math.floor(bodySize.width) + WALL_CONFIG.offset,
    Math.floor(bodySize.height / 2),
    WALL_CONFIG.thickness,
    Math.floor(bodySize.height) * 2,
    {
      isStatic: true,
      render: { fillStyle: "gray" },
      collisionFilter: { category: COLLISION_CATEGORIES.wall },
    }
  );

  return { ground, ceiling, leftWall, rightWall };
}
