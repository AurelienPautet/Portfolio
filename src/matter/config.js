export const COLLISION_CATEGORIES = {
  default: 0x0001,
  wall: 0x0004,
  sticky: 0x0002,
};

export const PHYSICS_CONFIG = {
  timeScale: 1,
  velocityIterations: 10,
  positionIterations: 8,
  constraintIterations: 3,
  enableSleeping: true,
  runnerDelta: 1000 / 60,
  runnerMaxFrameTime: 1000 / 45,
  runnerMaxUpdates: 2,
  maxVelocity: 18,
  maxAngularVelocity: 0.35,
};

export const WALL_CONFIG = {
  offset: 248,
  thickness: 500,
  restitution: 0.15,
};

export const MAGNET_CONFIG = {
  minDistance: 5,
  maxDistance: 500,
  baseForce: 0.015,
};

export const TRANSFORM_CONFIG = {
  positionRounding: 2,
  angleRounding: 10000,
  maxParentDepth: 32,
};
