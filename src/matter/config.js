export const COLLISION_CATEGORIES = {
  default: 0x0001,
  wall: 0x0004,
  sticky: 0x0002,
};

export const PHYSICS_CONFIG = {
  timeScale: 1,
  velocityIterations: 8,
  positionIterations: 5,
  constraintIterations: 2,
  enableSleeping: false,
  runnerDelta: 1000 / 120,
};

export const WALL_CONFIG = {
  offset: 248,
  thickness: 500,
  restitution: 0.5,
};

export const TRANSFORM_CONFIG = {
  positionRounding: 2,
  angleRounding: 10000,
  maxParentDepth: 32,
};
