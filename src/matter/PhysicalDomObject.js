import { Composite, Constraint } from "matter-js";
import Matter from "matter-js";
export default class PhysicalDomObject {
  static domElementIdCounter = 0;

  constructor(domElement, options = {}, parent = null) {
    this.domElement = domElement;
    this.options = options;
    this.initialPos = { x: 0, y: 0 };
    this.initialSize = { width: 0, height: 0 };
    this.localPos = { x: 0, y: 0 };
    this.localAngle = 0;
    this.physicalBody = null;
    this.parent = parent;
    this.childrens = [];
    this.constraint = null;
    this.originalInertia = null;
    this.originalInverseInertia = null;
    this.originalStatic = domElement.classList.contains("static");
    this.originalSticky = domElement.classList.contains("sticky");
    this.originalRotation = domElement.classList.contains("rotation");
    this.chainedTo = null;
  }
  init(physicalBodyClass) {
    PhysicalDomObject.domElementIdCounter += 1;
    const rect = this.domElement.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = rect.left + window.scrollX + width / 2;
    const y = rect.top + window.scrollY + height / 2;
    this.initialPos = { x: x, y: y };
    this.initialSize = { width: width, height: height };
    if (physicalBodyClass) {
      this.physicalBody = new physicalBodyClass(
        x,
        y,
        width,
        height,
        this.options,
        { isSticky: this.originalSticky },
        PhysicalDomObject.domElementIdCounter
      );
      this.physicalBody.bodyData.body.render.visible = false;
      if (!this.domElement.classList.contains("chain-container")) {
        Composite.add(window.engine.world, this.physicalBody.bodyData.body);
        this.addConstraint();
      }
    }
  }

  addChainTo() {
    if (!this.chainedTo) {
      return;
    }
    this.setInertiaToInfinity();
    if (this.chainedTo.bodyData?.body.inverseInertia !== 0) {
      this.chainedTo.setInertiaToInfinity();
    }
    const chainLength = Math.sqrt(
      (this.initialPos.x - this.chainedTo.initialPos.x) ** 2 +
        (this.initialPos.y - this.chainedTo.initialPos.y) ** 2
    );
    const chain = Constraint.create({
      bodyB: this.physicalBody.bodyData.body,
      bodyA: this.chainedTo.physicalBody.bodyData.body,
      pointA: { x: 0, y: 0 },
      pointB: { x: 0, y: 0 },
      stiffness: 0.9,
      length: chainLength,
      render: {
        visible: false,
      },
    });
    Composite.add(window.engine.world, chain);
  }

  setInertiaToInfinity() {
    this.originalInertia = this.physicalBody.bodyData.body.inertia;
    this.originalInverseInertia =
      this.physicalBody.bodyData.body.inverseInertia;

    if (!this.originalRotation) {
      this.physicalBody.bodyData.body.inertia = Infinity;
      this.physicalBody.bodyData.body.inverseInertia = 0;
    }
  }

  addConstraint() {
    if (this.originalStatic) {
      this.physicalBody.bodyData.body.isStatic = true;
    }

    if (this.domElement.classList.contains("nonconstrained")) {
      return;
    }

    if (this.physicalBody) {
      if (this.constraint) {
        return;
      }

      this.setInertiaToInfinity();

      parent = this.parent;
      if (parent?.domElement.classList.contains("chain-container")) {
        parent = null;
      }
      const constraintObject = parent
        ? parent.physicalBody.bodyData.body
        : null;

      const constraintPointA = {
        x: this.initialPos.x - (parent?.initialPos.x || 0),
        y: this.initialPos.y - (parent?.initialPos.y || 0),
      };
      const constraint = Constraint.create({
        bodyB: this.physicalBody.bodyData.body,
        pointA: constraintPointA,
        bodyA: constraintObject,
        length: 1,
        stiffness: this.originalRotation ? 1 : 0.2,
        damping: 1,
        angularStiffness: 1,
        render: {
          visible: false,
        },
      });

      Composite.add(window.engine.world, [constraint]);

      this.constraint = constraint;
    }
  }

  removeConstraint() {
    this.physicalBody.bodyData.body.isStatic = false;
    this.physicalBody.bodyData.body.collisionFilter.category =
      window.defaultCategory;
    this.physicalBody.bodyData.body.collisionFilter.mask =
      window.defaultCategory | window.wallCategory;
    if (this.constraint) {
      if (this.originalInertia !== null) {
        this.physicalBody.bodyData.body.inertia = this.originalInertia;
        this.physicalBody.bodyData.body.inverseInertia =
          this.originalInverseInertia;
      }
      Composite.remove(window.engine.world, this.constraint);
      this.constraint = null;
    }
  }

  updateConstraint() {
    if (this.constraint && this.originalSticky) {
      this.constraint.pointA.x = this.initialPos.x + window.scrollX;
      this.constraint.pointA.y = this.initialPos.y + window.scrollY;
    }
  }

  makeStaticWhenAtRest() {}
}
