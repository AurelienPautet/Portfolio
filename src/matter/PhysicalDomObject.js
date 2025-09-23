import { Composite, Constraint } from "matter-js";

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
    this.children = [];
    this.constraint = null;
    this.originalInertia = null;
    this.originalInverseInertia = null;
    this.originalStatic = domElement.classList.contains("static");
    this.originalSticky = domElement.classList.contains("sticky");
    this.originalRotation = domElement.classList.contains("rotation");
  }
  init(physicalBodyClass) {
    PhysicalDomObject.domElementIdCounter += 1;
    const rect = this.domElement.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = rect.left + width / 2;
    const y = rect.top + height / 2;
    this.initialPos = { x: x, y: y };
    this.initialSize = { width: width, height: height };
    if (physicalBodyClass) {
      console.log(physicalBodyClass);
      this.physicalBody = new physicalBodyClass(
        x,
        y,
        width,
        height,
        this.options,
        { isSticky: this.originalSticky },
        PhysicalDomObject.domElementIdCounter
      );
      Composite.add(window.engine.world, [this.physicalBody.bodyData.body]);
      this.addConstraint();
    }
  }
  addConstraint() {
    console.log(this.physicalBody);
    console.log(this.initialPos.x);

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
      this.originalInertia = this.physicalBody.bodyData.body.inertia;
      this.originalInverseInertia =
        this.physicalBody.bodyData.body.inverseInertia;

      if (!this.originalRotation) {
        this.physicalBody.bodyData.body.inertia = Infinity;
        this.physicalBody.bodyData.body.inverseInertia = 0;
      }

      const constraint = Constraint.create({
        bodyB: this.physicalBody.bodyData.body,
        pointA: {
          x: this.initialPos.x,
          y: this.initialPos.y,
        },
        length: 1,
        stiffness: this.originalRotation ? 1 : 0.02,
        damping: 1,
        angularStiffness: 1,
        render: {
          visible: true,
        },
      });
      Composite.add(window.engine.world, [constraint]);
      this.constraint = constraint;
    }
    console.log("Constraint added");
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
}
