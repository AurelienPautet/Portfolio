import {
  BODY_CONFIG,
  COLLISION_CATEGORIES,
  COMPOSITE_WALL_THICKNESS,
  PHYSICS_CONFIG,
  WALL_CONFIG,
  collisionGroups,
  toPx,
  toUnits,
} from "./config";

const CAP_SEGMENTS = 8;
const CIRCLE_SEGMENTS = 16;

// Local outlines (px, relative to the body origin) are kept for every collider:
// the debug overlay draws them and container walls use them to keep children in.
function rectOutline(cx, cy, hw, hh) {
  return [
    { x: cx - hw, y: cy - hh },
    { x: cx + hw, y: cy - hh },
    { x: cx + hw, y: cy + hh },
    { x: cx - hw, y: cy + hh },
  ];
}

function circleOutline(radius) {
  const points = [];
  for (let i = 0; i < CIRCLE_SEGMENTS; i++) {
    const a = (i / CIRCLE_SEGMENTS) * Math.PI * 2;
    points.push({ x: radius * Math.cos(a), y: radius * Math.sin(a) });
  }
  return points;
}

// A capsule along the element's long axis: two straight sides capped by
// semicircles. Rapier's capsule is vertical, so a horizontal pill rotates it.
function capsuleOutline(radius, straightHalf, vertical) {
  const points = [];
  for (let i = 0; i <= CAP_SEGMENTS; i++) {
    const a = -Math.PI * (i / CAP_SEGMENTS);
    points.push([radius * Math.cos(a), -straightHalf + radius * Math.sin(a)]);
  }
  for (let i = 0; i <= CAP_SEGMENTS; i++) {
    const a = Math.PI - Math.PI * (i / CAP_SEGMENTS);
    points.push([radius * Math.cos(a), straightHalf + radius * Math.sin(a)]);
  }
  return points.map(([x, y]) => (vertical ? { x, y } : { x: y, y: x }));
}

// Equilateral triangle with its centroid on the body origin (as Matter placed it).
function triangleOutline(side) {
  const h = (Math.sqrt(3) / 2) * side;
  return [
    { x: -side / 2, y: h / 3 },
    { x: side / 2, y: h / 3 },
    { x: 0, y: (-2 * h) / 3 },
  ];
}

/**
 * Walls of a hollow container, never more than a quarter of its size so small
 * elements (a bordered chip around a word) are not filled by their walls.
 */
export function containerWallThickness(width, height) {
  return Math.min(COMPOSITE_WALL_THICKNESS, Math.min(width, height) / 4);
}

/**
 * Collider descriptions for one element. Returns [{ desc, outline }], sizes in px.
 */
function buildParts(R, kind, width, height) {
  const u = toUnits;
  switch (kind) {
    case "circle": {
      const r = width / 2;
      return [{ desc: R.ColliderDesc.ball(u(r)), outline: circleOutline(r) }];
    }
    case "pill": {
      const vertical = height >= width;
      const radius = (vertical ? width : height) / 2;
      const straightHalf = ((vertical ? height : width) - radius * 2) / 2;
      if (straightHalf < 0.5) {
        return [{ desc: R.ColliderDesc.ball(u(radius)), outline: circleOutline(radius) }];
      }
      const desc = R.ColliderDesc.capsule(u(straightHalf), u(radius));
      if (!vertical) desc.setRotation(Math.PI / 2);
      return [{ desc, outline: capsuleOutline(radius, straightHalf, vertical) }];
    }
    case "triangle": {
      const outline = triangleOutline(width);
      const hull = new Float32Array(outline.flatMap((p) => [u(p.x), u(p.y)]));
      return [{ desc: R.ColliderDesc.convexHull(hull), outline }];
    }
    case "container": {
      // A hollow box: four walls on one rigid body, so children can sit inside.
      const t = containerWallThickness(width, height);
      const hw = width / 2;
      const hh = height / 2;
      return [
        [0, -hh, hw, t / 2],
        [0, hh, hw, t / 2],
        [-hw, 0, t / 2, hh],
        [hw, 0, t / 2, hh],
      ].map(([cx, cy, w, h]) => ({
        desc: R.ColliderDesc.cuboid(u(w), u(h)).setTranslation(u(cx), u(cy)),
        outline: rectOutline(cx, cy, w, h),
      }));
    }
    default:
      return [{
        desc: R.ColliderDesc.cuboid(u(width / 2), u(height / 2)),
        outline: rectOutline(0, 0, width / 2, height / 2),
      }];
  }
}

/** One rigid body driven by Rapier, with its pose cached in page pixels. */
export class PhysicsBody {
  constructor(sim, { x, y, width, height, kind = "box", fixed = false, sticky = false, asleep = false }) {
    const R = sim.R;
    this.sim = sim;
    this.kind = kind;
    this.width = width;
    this.height = height;
    this.isSticky = sticky;
    this.x = x;
    this.y = y;
    this.angle = 0;
    // Frame number of the last pose change; the DOM pass only touches those.
    this.movedFrame = 0;
    this.childBodies = [];

    const desc = (fixed ? R.RigidBodyDesc.fixed() : R.RigidBodyDesc.dynamic())
      .setTranslation(toUnits(x), toUnits(y))
      .setLinearDamping(PHYSICS_CONFIG.linearDamping)
      .setAngularDamping(PHYSICS_CONFIG.angularDamping)
      .setCcdEnabled(true)
      .setSleeping(asleep && !fixed);
    this.rb = sim.world.createRigidBody(desc);
    this.rb.userData = this;

    // Set for real by updateCollisionRole() once the body's role is known.
    this.category = COLLISION_CATEGORIES.free;
    this.mask = 0;
    this.anchor = null;
    this.dragged = false;

    this.outlines = [];
    this.colliders = [];
    for (const { desc: colliderDesc, outline } of buildParts(R, kind, width, height)) {
      colliderDesc
        .setRestitution(BODY_CONFIG.restitution)
        .setFriction(BODY_CONFIG.friction)
        .setDensity(BODY_CONFIG.density)
        .setCollisionGroups(collisionGroups(this.category, this.mask));
      this.colliders.push(sim.world.createCollider(colliderDesc, this.rb));
      this.outlines.push(outline);
    }
    // Rough size used to prefer the most specific body under the pointer.
    this.area = width * height;
    sim.register(this);
  }

  syncPose(frame) {
    const t = this.rb.translation();
    this.x = toPx(t.x);
    this.y = toPx(t.y);
    this.angle = this.rb.rotation();
    this.movedFrame = frame;
  }

  getCenter() {
    if (this.isSticky) return { x: this.x - window.scrollX, y: this.y - window.scrollY };
    return { x: this.x, y: this.y };
  }

  getAngle() {
    return this.angle;
  }

  isStatic() {
    return this.rb.isFixed();
  }

  isAtRest() {
    return this.rb.isFixed() || this.rb.isSleeping();
  }

  setStatic(isStatic) {
    const R = this.sim.R;
    if (this.rb.isFixed() === isStatic) return;
    this.rb.setBodyType(isStatic ? R.RigidBodyType.Fixed : R.RigidBodyType.Dynamic, true);
    this.sim.touch(this);
  }

  /** Picks the collision layer from the body's current role. */
  updateCollisionRole() {
    const C = COLLISION_CATEGORIES;
    const held = this.anchor !== null || this.rb.isFixed();
    if (this.isWall) {
      this.setCollisionFilter(C.wall, 0xffff);
    } else if (this.dragged && held && this.isSticky) {
      this.setCollisionFilter(C.draggedSticky, C.sticky | C.wall);
    } else if (this.dragged) {
      this.setCollisionFilter(C.dragged, C.free | C.held | C.wall);
    } else if (held && this.isSticky) {
      this.setCollisionFilter(C.sticky, C.draggedSticky | C.wall);
    } else if (held) {
      this.setCollisionFilter(C.held, C.free | C.dragged | C.wall);
    } else {
      this.setCollisionFilter(C.free, C.free | C.held | C.dragged | C.wall);
    }
  }

  setCollisionFilter(category, mask) {
    if (this.category === category && this.mask === mask) return;
    this.category = category;
    this.mask = mask;
    const groups = collisionGroups(category, mask);
    for (const collider of this.colliders) collider.setCollisionGroups(groups);
  }

  /** Moves the body to a page position (px) and keeps its velocity. */
  setPosition(x, y) {
    this.rb.setTranslation({ x: toUnits(x), y: toUnits(y) }, true);
    this.sim.touch(this);
  }

  /** Outline of every collider in page pixels, for the debug overlay. */
  worldOutlines() {
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    return this.outlines.map((outline) =>
      outline.map((p) => ({
        x: this.x + p.x * cos - p.y * sin,
        y: this.y + p.x * sin + p.y * cos,
      })),
    );
  }
}

/** The four static walls around the whole document. */
export function createBoundaries(sim, size) {
  const { offset, thickness } = WALL_CONFIG;
  const w = Math.floor(size.width);
  const h = Math.floor(size.height);
  const specs = [
    [w / 2, h + offset, w * 2, thickness], // ground
    [w / 2, -(offset - 74), w * 2, thickness], // ceiling
    [-offset, h / 2, thickness, h * 2], // left
    [w + offset, h / 2, thickness, h * 2], // right
  ];
  return specs.map(([x, y, width, height]) => {
    const wall = new PhysicsBody(sim, { x, y, width, height, fixed: true });
    wall.isWall = true;
    wall.updateCollisionRole();
    for (const collider of wall.colliders) collider.setRestitution(WALL_CONFIG.restitution);
    return wall;
  });
}
