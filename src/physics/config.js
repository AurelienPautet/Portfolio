// Rapier works in SI-like units and its tolerances (contact distance, sleep
// thresholds) are tuned for objects of about one unit. The page is laid out in
// CSS pixels, so the world uses 1 unit = 100 px and converts at the boundary.
export const PX_PER_UNIT = 100;
export const toUnits = (px) => px / PX_PER_UNIT;
export const toPx = (units) => units * PX_PER_UNIT;

// Collision layers. Held elements pass through each other: two springs pushing
// against each other through a contact would jam and never sleep. The element
// being dragged still pushes held ones aside, and free bodies (released, or
// `nonconstrained`) collide with everything. Sticky elements live in their own
// layers because their bodies are offset from where they appear.
export const COLLISION_CATEGORIES = {
  free: 0x0001,
  sticky: 0x0002,
  wall: 0x0004,
  held: 0x0008,
  dragged: 0x0010,
  draggedSticky: 0x0020,
};

/** Rapier interaction groups: membership in the high 16 bits, filter in the low 16. */
export const collisionGroups = (category, mask) =>
  ((category & 0xffff) << 16) | (mask & 0xffff);

export const PHYSICS_CONFIG = {
  // Fixed 60 Hz step, at most two catch-up steps per displayed frame.
  timestep: 1 / 60,
  maxStepsPerFrame: 2,
  // 1000 px/s², the same acceleration the Matter.js version used.
  gravity: 10,
  // Matter's frictionAir 0.02 per 60 Hz step ≈ 1.2 s⁻¹ of damping.
  linearDamping: 1.2,
  angularDamping: 1.2,
  // Matter.js needed a low cap (18 px per step) to stop fast bodies tunnelling
  // through walls, and its mouse drag bypassed it. Rapier uses continuous
  // collision detection, so thrown bodies can go much faster; the body being
  // dragged is not capped at all.
  maxSpeed: toUnits(3000),
  maxAngularSpeed: 0.35 * 60,
  // Frames without any awake body before the loop stops scheduling itself.
  idleFramesBeforePause: 30,
};

export const BODY_CONFIG = {
  restitution: 0.2,
  friction: 0.35,
  density: 1,
};

// Springs are expressed as a natural frequency (rad/s) and a damping ratio, so
// they behave the same whatever the element's mass.
export const SPRING_CONFIG = {
  // Holds an element at its place in the layout. Tuned against the Matter.js
  // version: a held element follows ~40% of a drag and snaps back in about
  // 150 ms. frequency × timestep stays under 1, where an explicit spring is stable.
  anchor: { frequency: 28, dampingRatio: 0.9 },
  // Elements with the `rotation` class pivot around a stiffer pin.
  pivot: { frequency: 35, dampingRatio: 0.9 },
  // Pulls the grabbed point of a dragged element towards the pointer: softer
  // for held elements (they stretch against their anchor), stiff for free
  // bodies so they track the pointer and can be thrown.
  drag: { frequency: 18, dampingRatio: 0.7 },
  dragFree: { frequency: 40, dampingRatio: 0.7 },
};

export const WALL_CONFIG = {
  offset: 248,
  thickness: 500,
  restitution: 0.15,
};

// Walls of hollow containers (cards, the skills box, chips), centred on the
// element's border. Matter.js needed 30 px walls to stop fast bodies tunnelling;
// Rapier's continuous collision detection keeps bodies in with thin ones.
export const COMPOSITE_WALL_THICKNESS = 4;

export const MAGNET_CONFIG = {
  minDistance: 5,
  maxDistance: 500,
  // 0.015 px/ms² at full strength in the Matter.js version = 150 units/s².
  acceleration: 150,
};

export const TRANSFORM_CONFIG = {
  positionRounding: 2,
  angleRounding: 10000,
};
