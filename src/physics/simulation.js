import {
  MAGNET_CONFIG,
  PHYSICS_CONFIG,
  SPRING_CONFIG,
  toPx,
  toUnits,
} from "./config";
import { DragSpring } from "./springs";
import { containerWallThickness } from "./body";

const STEP_SAMPLES = 600;

function boundaryCorrection(min, max, half) {
  if (max - min > half * 2) return -(min + max) / 2;
  return min < -half ? -half - min : max > half ? half - max : 0;
}

/**
 * The Rapier world plus everything the page adds on top of it: springs, the
 * pointer drag, the right-click magnet, container walls and per-step stats.
 */
export class Simulation {
  constructor(R) {
    this.R = R;
    this.frame = 0;
    this.gravityY = PHYSICS_CONFIG.gravity;
    this.timeScale = 1;
    this.stepTimes = [];
    this.scratch = { x: 0, y: 0 };
    this.reset();
  }

  reset() {
    this.world?.free();
    this.world = new this.R.World({ x: 0, y: this.gravityY });
    this.world.timestep = PHYSICS_CONFIG.timestep * this.timeScale;
    this.bodies = new Set();
    this.springs = new Set();
    this.containers = [];
    // Bodies that were awake after the previous step.
    this.active = new Set();
    this.drag = null;
    this.magnet = null;
  }

  register(body) {
    this.bodies.add(body);
  }

  /** Marks a body as changed outside of a step (teleport, type change). */
  touch(body) {
    body.syncPose(this.frame);
    if (!body.rb.isFixed()) this.active.add(body);
    this.wakeLoop?.();
  }

  addSpring(spring) {
    this.springs.add(spring);
  }

  removeSpring(spring) {
    this.springs.delete(spring);
  }

  addContainer(box, children) {
    const wall = containerWallThickness(box.width, box.height);
    const halfWidth = Math.max(0, (box.width - wall) / 2) + 0.25;
    const halfHeight = Math.max(0, (box.height - wall) / 2) + 0.25;
    this.containers.push({ box, children, halfWidth, halfHeight });
  }

  setGravity(scale) {
    this.gravityY = PHYSICS_CONFIG.gravity * scale;
    this.world.gravity = { x: 0, y: this.gravityY };
    this.wakeAll();
  }

  setTimeScale(scale) {
    this.timeScale = scale;
    this.world.timestep = PHYSICS_CONFIG.timestep * scale;
  }

  wakeAll() {
    for (const body of this.bodies) {
      if (!body.rb.isFixed()) body.rb.wakeUp();
    }
  }

  /** True while anything can still change without new input. */
  isBusy() {
    return this.active.size > 0 || this.drag !== null || this.magnet !== null;
  }

  // --- Pointer ---------------------------------------------------------------

  /** The most specific movable body under a page point (px), if any. */
  pick(pageX, pageY) {
    let best = null;
    this.world.intersectionsWithPoint({ x: toUnits(pageX), y: toUnits(pageY) }, (collider) => {
      const body = collider.parent()?.userData;
      if (body && !body.isWall && !body.rb.isFixed() && (!best || body.area < best.area)) {
        best = body;
      }
      return true;
    });
    return best;
  }

  startDrag(body, pageX, pageY) {
    this.endDrag();
    const config = body.anchor ? SPRING_CONFIG.drag : SPRING_CONFIG.dragFree;
    this.drag = new DragSpring(body, pageX, pageY, config);
    body.dragged = true;
    body.updateCollisionRole();
    body.rb.wakeUp();
  }

  moveDrag(pageX, pageY) {
    this.drag?.setTarget(pageX, pageY);
  }

  endDrag() {
    if (!this.drag) return;
    const body = this.drag.body;
    this.drag = null;
    body.dragged = false;
    if (this.bodies.has(body)) body.updateCollisionRole();
  }

  setMagnet(pageX, pageY) {
    this.magnet = { x: toUnits(pageX), y: toUnits(pageY) };
  }

  clearMagnet() {
    this.magnet = null;
  }

  // --- Stepping --------------------------------------------------------------

  applyMagnet(dt) {
    const { minDistance, maxDistance, acceleration } = MAGNET_CONFIG;
    const min = toUnits(minDistance);
    const max = toUnits(maxDistance);
    for (const body of this.bodies) {
      if (body.isWall || body.anchor || body.rb.isFixed()) continue;
      const p = body.rb.translation();
      const dx = this.magnet.x - p.x;
      const dy = this.magnet.y - p.y;
      const d2 = dx * dx + dy * dy;
      if (d2 <= min * min || d2 >= max * max) continue;
      const d = Math.sqrt(d2);
      const ratio = 1 - d / max;
      const j = (body.rb.mass() * acceleration * ratio * ratio * dt) / d;
      body.rb.applyImpulse({ x: dx * j, y: dy * j }, true);
    }
  }

  clampVelocities() {
    const maxSpeed = PHYSICS_CONFIG.maxSpeed;
    const maxAngular = PHYSICS_CONFIG.maxAngularSpeed;
    for (const body of this.active) {
      const rb = body.rb;
      if (!rb.isDynamic() || rb.isSleeping() || body.dragged) continue;
      const v = rb.linvel();
      const speed2 = v.x * v.x + v.y * v.y;
      if (speed2 > maxSpeed * maxSpeed) {
        const s = maxSpeed / Math.sqrt(speed2);
        rb.setLinvel({ x: v.x * s, y: v.y * s }, false);
      }
      const w = rb.angvel();
      if (Math.abs(w) > maxAngular) rb.setAngvel(Math.sign(w) * maxAngular, false);
    }
  }

  // A safety net for container walls while the container is locked in place.
  containChildren() {
    for (const { box, children, halfWidth, halfHeight } of this.containers) {
      if (!box.rb.isFixed()) continue;
      const cos = Math.cos(box.angle);
      const sin = Math.sin(box.angle);
      for (const child of children) {
        if (!this.active.has(child) || child.rb.isFixed()) continue;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const outline of child.worldOutlines()) {
          for (const p of outline) {
            const dx = p.x - box.x;
            const dy = p.y - box.y;
            const lx = dx * cos + dy * sin;
            const ly = -dx * sin + dy * cos;
            if (lx < minX) minX = lx;
            if (lx > maxX) maxX = lx;
            if (ly < minY) minY = ly;
            if (ly > maxY) maxY = ly;
          }
        }
        const sx = boundaryCorrection(minX, maxX, halfWidth);
        const sy = boundaryCorrection(minY, maxY, halfHeight);
        if (sx === 0 && sy === 0) continue;
        child.rb.setTranslation(
          { x: toUnits(child.x + sx * cos - sy * sin), y: toUnits(child.y + sx * sin + sy * cos) },
          true,
        );
        // Keep only the velocity along the wall.
        const v = child.rb.linvel();
        let vx = v.x * cos + v.y * sin;
        let vy = -v.x * sin + v.y * cos;
        if (sx * vx < 0) vx = 0;
        if (sy * vy < 0) vy = 0;
        child.rb.setLinvel({ x: vx * cos - vy * sin, y: vx * sin + vy * cos }, true);
        child.syncPose(this.frame);
      }
    }
  }

  step() {
    const start = performance.now();
    const dt = this.world.timestep;
    this.frame++;

    for (const spring of this.springs) spring.apply(dt, this.scratch);
    this.drag?.apply(dt);
    if (this.magnet) this.applyMagnet(dt);
    this.clampVelocities();

    this.world.step();

    // Sync every body that is awake now, and those that fell asleep this step
    // (their final resting pose still has to reach the DOM).
    const previous = this.active;
    const active = new Set();
    this.world.forEachActiveRigidBody((rb) => {
      const body = rb.userData;
      if (!body) return;
      body.syncPose(this.frame);
      active.add(body);
    });
    for (const body of previous) {
      if (!active.has(body) && this.bodies.has(body)) body.syncPose(this.frame);
    }
    this.active = active;
    this.containChildren();

    const elapsed = performance.now() - start;
    if (this.stepTimes.length >= STEP_SAMPLES) this.stepTimes.shift();
    this.stepTimes.push(elapsed);
  }

  stats() {
    let dynamic = 0;
    for (const body of this.bodies) if (!body.rb.isFixed()) dynamic++;
    return { awake: this.active.size, dynamic, dragging: this.drag !== null, stepTimes: this.stepTimes };
  }

  /** Grab line for the overlay, in page pixels. */
  dragLine() {
    if (!this.drag) return null;
    const p = this.drag.grabPoint();
    return {
      from: { x: toPx(p.x), y: toPx(p.y) },
      to: { x: toPx(this.drag.targetX), y: toPx(this.drag.targetY) },
    };
  }

  dispose() {
    this.world?.free();
    this.world = null;
    this.bodies.clear();
    this.springs.clear();
    this.active.clear();
  }
}

