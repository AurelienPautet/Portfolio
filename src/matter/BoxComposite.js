import { Bodies, Composite, Constraint, Body } from "matter-js";
import MatterObject from "./MatterObject";

export default class BoxComposite extends MatterObject {
  constructor(
    x,
    y,
    width,
    height,
    options = {},
    customOptions = {},
    boxId = 1
  ) {
    super(x, y, width, height, options, customOptions, boxId);
    this.wallThickness = 30;
    this.bodyData = this.createBox();
    this.childBodies = []; // Track child bodies for containment
  }

  // Register a child body to be contained within this box
  registerChildBody(body) {
    this.childBodies.push(body);
  }

  // Get the inner bounds (accounting for wall thickness)
  getInnerBounds() {
    const body = this.bodyData.body;
    const padding = this.wallThickness / 2 + 5; // Extra padding to prevent edge cases
    return {
      minX: body.position.x - this.width / 2 + padding,
      maxX: body.position.x + this.width / 2 - padding,
      minY: body.position.y - this.height / 2 + padding,
      maxY: body.position.y + this.height / 2 - padding,
    };
  }

  // Constrain all registered child bodies to stay within bounds
  containChildren() {
    const bounds = this.getInnerBounds();
    const boxAngle = this.bodyData.body.angle;
    const boxCenter = this.bodyData.body.position;

    for (const childBody of this.childBodies) {
      if (!childBody || childBody.isStatic) continue;

      // Transform child position to box's local coordinate system
      const relX = childBody.position.x - boxCenter.x;
      const relY = childBody.position.y - boxCenter.y;

      // Rotate to box's local space
      const cos = Math.cos(-boxAngle);
      const sin = Math.sin(-boxAngle);
      const localX = relX * cos - relY * sin;
      const localY = relX * sin + relY * cos;

      // Check bounds in local space
      const halfWidth = this.width / 2 - this.wallThickness - 10;
      const halfHeight = this.height / 2 - this.wallThickness - 10;

      let needsCorrection = false;
      let newLocalX = localX;
      let newLocalY = localY;

      if (localX < -halfWidth) {
        newLocalX = -halfWidth + 20;
        needsCorrection = true;
      } else if (localX > halfWidth) {
        newLocalX = halfWidth - 20;
        needsCorrection = true;
      }

      if (localY < -halfHeight) {
        newLocalY = -halfHeight + 20;
        needsCorrection = true;
      } else if (localY > halfHeight) {
        newLocalY = halfHeight - 20;
        needsCorrection = true;
      }

      if (needsCorrection) {
        // Transform back to world space
        const cosBack = Math.cos(boxAngle);
        const sinBack = Math.sin(boxAngle);
        const newWorldX =
          newLocalX * cosBack - newLocalY * sinBack + boxCenter.x;
        const newWorldY =
          newLocalX * sinBack + newLocalY * cosBack + boxCenter.y;

        Body.setPosition(childBody, { x: newWorldX, y: newWorldY });
        Body.setVelocity(childBody, { x: 0, y: 0 });
      }
    }
  }

  createBox() {
    this.options.mass = this.options.mass || 1;
    const wallsOptions = {
      ...this.options,
      slop: 0.01,
      render: {
        fillStyle: "transparent",
        strokeStyle: "#ffffff",
        lineWidth: 1,
      },
    };

    const topWall = Bodies.rectangle(
      this.x,
      this.y - this.height / 2,
      this.width,
      this.wallThickness,
      {
        ...wallsOptions,
      }
    );
    const bottomWall = Bodies.rectangle(
      this.x,
      this.y + this.height / 2,
      this.width,
      this.wallThickness,
      {
        ...wallsOptions,
      }
    );
    const leftWall = Bodies.rectangle(
      this.x - this.width / 2,
      this.y,
      this.wallThickness,
      this.height,
      {
        ...wallsOptions,
      }
    );
    const rightWall = Bodies.rectangle(
      this.x + this.width / 2,
      this.y,
      this.wallThickness,
      this.height,
      {
        ...wallsOptions,
      }
    );

    var compoundBodyB = Body.create({
      parts: [topWall, bottomWall, leftWall, rightWall],
      collisionFilter: {
        category: this.category,
        mask: this.mask,
      },
      label: `BoxComposite-${this.boxId}`,
    });

    return {
      body: compoundBodyB,
      parts: { topWall, bottomWall, leftWall, rightWall },
    };
  }

  getCenter() {
    const body = this.bodyData.body;
    return {
      x: body.position.x,
      y: body.position.y,
    };
  }

  getAngle() {
    return this.bodyData.body.angle;
  }
}
