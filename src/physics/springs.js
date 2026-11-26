import { toUnits } from "./config";

// Springs are applied as impulses before each step. Their strength scales with
// the body's mass, so `frequency` (rad/s) and `dampingRatio` alone set the feel.
//
// Unlike a Matter.js constraint, a spring never wakes a sleeping body that is
// already where it should be. That is what lets the page go fully idle.

// Below this distance (px) a sleeping body counts as being on its anchor, and
// below this speed (px/s) a push is too small to wake a sleeping body. Waking a
// body resets Rapier's sleep timer, so waking on every tiny push would keep a
// parent and its children waking each other forever.
const WAKE_DISTANCE = 0.5;
const WAKE_SPEED = 2;

const speed = (v) => Math.hypot(v.x, v.y);

function springImpulse(mass, { frequency, dampingRatio }, error, velocity, dt) {
  const k = frequency * frequency;
  const c = 2 * dampingRatio * frequency;
  return mass * (k * error - c * velocity) * dt;
}

/**
 * Holds a body at a point of the layout: fixed in the page, fixed relative to
 * its parent body (rotating with it), or fixed in the viewport for sticky
 * elements, whose anchor follows the scroll position.
 */
export class AnchorSpring {
  constructor(body, { parent = null, x, y, sticky = false, config }) {
    this.body = body;
    this.parent = parent;
    // Page position (no parent) or offset in the parent's frame, in units.
    this.localX = toUnits(x);
    this.localY = toUnits(y);
    this.sticky = sticky;
    this.config = config;
  }

  target(out) {
    if (this.parent) {
      const p = this.parent.rb.translation();
      const a = this.parent.rb.rotation();
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      out.x = p.x + this.localX * cos - this.localY * sin;
      out.y = p.y + this.localX * sin + this.localY * cos;
    } else {
      out.x = this.localX;
      out.y = this.localY;
      if (this.sticky) {
        out.x += toUnits(window.scrollX);
        out.y += toUnits(window.scrollY);
      }
    }
    return out;
  }

  apply(dt, scratch) {
    const rb = this.body.rb;
    if (rb.isFixed()) return;
    const parentRb = this.parent?.rb;
    const parentMoving = parentRb && !parentRb.isFixed() && !parentRb.isSleeping();
    const target = this.target(scratch);
    const pos = rb.translation();
    const ex = target.x - pos.x;
    const ey = target.y - pos.y;

    if (rb.isSleeping()) {
      // Asleep on its anchor, and its parent is not carrying it away.
      const far = ex * ex + ey * ey >= toUnits(WAKE_DISTANCE) ** 2;
      const carried = parentMoving && speed(parentRb.velocityAtPoint(target)) >= toUnits(WAKE_SPEED);
      if (!far && !carried) return;
      rb.wakeUp();
    }

    const v = rb.linvel();
    let vx = v.x;
    let vy = v.y;
    if (parentMoving) {
      const pv = parentRb.velocityAtPoint(target);
      vx -= pv.x;
      vy -= pv.y;
    }
    const mass = rb.mass();
    const ix = springImpulse(mass, this.config, ex, vx, dt);
    const iy = springImpulse(mass, this.config, ey, vy, dt);
    rb.applyImpulse({ x: ix, y: iy }, false);
    // The parent feels the pull too (dragging a word tugs at its card).
    if (parentRb && parentRb.isDynamic()) {
      const wake = parentRb.isSleeping() &&
        Math.hypot(ix, iy) / parentRb.mass() >= toUnits(WAKE_SPEED);
      if (!parentRb.isSleeping() || wake) {
        parentRb.applyImpulseAtPoint({ x: -ix, y: -iy }, target, wake);
      }
    }
  }
}

/** Pulls the grabbed point of a body towards the pointer. */
export class DragSpring {
  constructor(body, pageX, pageY, config) {
    this.body = body;
    this.config = config;
    const pos = body.rb.translation();
    const a = body.rb.rotation();
    const dx = toUnits(pageX) - pos.x;
    const dy = toUnits(pageY) - pos.y;
    // Grab point in the body's own frame, so it turns with the body.
    this.localX = dx * Math.cos(a) + dy * Math.sin(a);
    this.localY = -dx * Math.sin(a) + dy * Math.cos(a);
    this.targetX = toUnits(pageX);
    this.targetY = toUnits(pageY);
  }

  setTarget(pageX, pageY) {
    this.targetX = toUnits(pageX);
    this.targetY = toUnits(pageY);
  }

  /** Grab point in page units. */
  grabPoint() {
    const rb = this.body.rb;
    const pos = rb.translation();
    const a = rb.rotation();
    return {
      x: pos.x + this.localX * Math.cos(a) - this.localY * Math.sin(a),
      y: pos.y + this.localX * Math.sin(a) + this.localY * Math.cos(a),
    };
  }

  apply(dt) {
    const rb = this.body.rb;
    if (rb.isFixed()) return;
    const point = this.grabPoint();
    const v = rb.velocityAtPoint(point);
    const mass = rb.mass();
    rb.applyImpulseAtPoint(
      {
        x: springImpulse(mass, this.config, this.targetX - point.x, v.x, dt),
        y: springImpulse(mass, this.config, this.targetY - point.y, v.y, dt),
      },
      point,
      true,
    );
  }
}
