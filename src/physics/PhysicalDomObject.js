import { PhysicsBody } from "./body";
import { SPRING_CONFIG } from "./config";
import { AnchorSpring } from "./springs";
import { getTextInkRect } from "./textBounds";

/**
 * A DOM element with the `physical` class and the body that moves it.
 *
 * Classes on the element:
 *   static          fixed in place until released
 *   nonconstrained  free body (falls, can be thrown), kept inside a parent container
 *   rotation        pinned at its centre but free to turn
 *   sticky          anchored in the viewport instead of the page
 *   circle / pill / triangle   collider shape (box by default; a box with
 *                   physical children becomes a hollow container)
 */
export default class PhysicalDomObject {
  constructor(domElement, parent = null) {
    this.domElement = domElement;
    this.parent = parent;
    this.childrens = [];
    this.initialPos = { x: 0, y: 0 };
    this.initialSize = { width: 0, height: 0 };
    this.localPos = { x: 0, y: 0 };
    this.localAngle = 0;
    this.physicalBody = null;
    this.constraint = null;
    const classes = domElement.classList;
    this.originalStatic = classes.contains("static");
    this.originalSticky = classes.contains("sticky");
    this.originalRotation = classes.contains("rotation");
    this.isFree = classes.contains("nonconstrained");
  }

  shapeKind() {
    const classes = this.domElement.classList;
    if (classes.contains("circle")) return "circle";
    if (classes.contains("pill")) return "pill";
    if (classes.contains("triangle")) return "triangle";
    return this.childrens.length === 0 ? "box" : "container";
  }

  init(sim) {
    const rect = this.domElement.getBoundingClientRect();
    const inkRect = this.domElement.dataset.physicsBounds === "text"
      ? getTextInkRect(this.domElement)
      : null;
    const bounds = inkRect || rect;
    const { width, height } = bounds;
    const x = bounds.left + window.scrollX + width / 2;
    const y = bounds.top + window.scrollY + height / 2;
    if (inkRect) {
      // Rotate the DOM around the same centre as its body when it is released.
      this.domElement.style.transformOrigin =
        `${bounds.left - rect.left + width / 2}px ${bounds.top - rect.top + height / 2}px`;
      // Let hover decorations use the same ink box without resizing the element.
      const offsets = {
        left: bounds.left - rect.left,
        top: bounds.top - rect.top,
        right: rect.left + rect.width - bounds.left - width,
        bottom: rect.top + rect.height - bounds.top - height,
      };
      for (const [edge, offset] of Object.entries(offsets)) {
        this.domElement.style.setProperty(`--physics-ink-${edge}`, `${offset}px`);
      }
    }
    this.initialPos = { x, y };
    this.initialSize = { width, height };

    this.physicalBody = new PhysicsBody(sim, {
      x,
      y,
      width,
      height,
      kind: this.shapeKind(),
      fixed: this.originalStatic,
      sticky: this.originalSticky,
      // Held elements start asleep on their anchor: nothing to simulate until
      // something touches them. Free bodies start awake so they can settle.
      asleep: !this.isFree,
    });
    this.sim = sim;
    this.addConstraint({ initial: true });
  }

  /** Free children of a container are kept inside its walls. */
  registerWithContainer() {
    if (!this.isFree || !this.parent?.physicalBody) return;
    if (this.parent.shapeKind() !== "container") return;
    this.parent.containerChildren ||= [];
    this.parent.containerChildren.push(this.physicalBody);
  }

  addConstraint({ initial = false } = {}) {
    const body = this.physicalBody;
    if (!body) return;
    if (this.originalStatic) {
      body.setStatic(true);
      body.updateCollisionRole();
      return;
    }
    if (this.isFree) {
      body.updateCollisionRole();
      return;
    }
    if (this.constraint) return;

    // Matter.js gave held bodies infinite inertia; Rapier locks their rotation.
    if (!this.originalRotation) body.rb.lockRotations(true, false);
    // A held body has no weight, so its spring rests exactly on the anchor.
    body.rb.setGravityScale(0, false);

    const parent = this.parent?.physicalBody ? this.parent : null;
    this.constraint = new AnchorSpring(body, {
      parent: parent?.physicalBody ?? null,
      x: this.initialPos.x - (parent?.initialPos.x ?? 0),
      y: this.initialPos.y - (parent?.initialPos.y ?? 0),
      sticky: this.originalSticky && !parent,
      config: this.originalRotation ? SPRING_CONFIG.pivot : SPRING_CONFIG.anchor,
    });
    body.anchor = this.constraint;
    body.updateCollisionRole();
    this.sim.addSpring(this.constraint);
    // Re-locking (the L key) pulls released bodies back; at startup they are
    // already on their anchor and stay asleep.
    if (!initial) {
      body.rb.wakeUp();
      this.sim.wakeLoop?.();
    }
  }

  removeConstraint() {
    const body = this.physicalBody;
    if (!body) return;
    body.setStatic(false);
    if (this.constraint) {
      this.sim.removeSpring(this.constraint);
      this.constraint = null;
      body.anchor = null;
      body.rb.lockRotations(false, false);
    }
    body.updateCollisionRole();
    body.rb.setGravityScale(1, false);
    body.rb.wakeUp();
    this.sim.touch(body);
  }
}
