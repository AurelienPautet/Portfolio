import { Bodies, Body, Sleeping } from "matter-js";
import MatterObject from "./MatterObject";

function boundaryCorrection(min, max, half) {
  if (max - min > half * 2) return -(min + max) / 2;
  return min < -half ? -half - min : max > half ? half - max : 0;
}

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

  // A safety net for discrete collision detection, only while the box is locked.
  // Normal contacts remain the solver's job; allow its small penetration slop.
  containChildren() {
    const frame = this.containmentFrame();
    if (!frame) return;
    for (const body of this.childBodies) this.containChild(body, frame);
  }

  containmentFrame() {
    const box = this.bodyData.body;
    if (!box.isStatic || this.childBodies.length === 0) return null;
    const frame = this._containmentFrame ||= {
      halfWidth: Math.max(0, (this.width - this.wallThickness) / 2) + 0.25,
      halfHeight: Math.max(0, (this.height - this.wallThickness) / 2) + 0.25,
    };
    frame.x = box.position.x;
    frame.y = box.position.y;
    if (frame.angle !== box.angle) {
      frame.angle = box.angle;
      frame.cos = Math.cos(box.angle);
      frame.sin = Math.sin(box.angle);
    }
    return frame;
  }

  containChild(body, frame = this.containmentFrame()) {
    if (!frame || !body || body.isStatic) return;
    const { x, y, cos, sin, halfWidth, halfHeight } = frame;
    const bounds = body.bounds;
    if (cos === 1 && sin === 0 &&
      bounds.min.x >= x - halfWidth && bounds.max.x <= x + halfWidth &&
      bounds.min.y >= y - halfHeight && bounds.max.y <= y + halfHeight) return;

    // Use the entire rotated shape, not only its centre. Matter's bounds may
    // include velocity padding, so inspect vertices only near a wall.
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const vertex of body.vertices) {
      const dx = vertex.x - x, dy = vertex.y - y;
      const localX = dx * cos + dy * sin;
      const localY = -dx * sin + dy * cos;
      minX = Math.min(minX, localX); maxX = Math.max(maxX, localX);
      minY = Math.min(minY, localY); maxY = Math.max(maxY, localY);
    }
    const shiftX = boundaryCorrection(minX, maxX, halfWidth);
    const shiftY = boundaryCorrection(minY, maxY, halfHeight);
    if (shiftX === 0 && shiftY === 0) return;

    Body.setPosition(body, {
      x: body.position.x + shiftX * cos - shiftY * sin,
      y: body.position.y + shiftX * sin + shiftY * cos,
    });
    const velocity = Body.getVelocity(body);
    let vx = velocity.x * cos + velocity.y * sin;
    let vy = -velocity.x * sin + velocity.y * cos;
    // Remove only velocity through a wall; preserve tangential motion/rotation.
    if (shiftX * vx < 0) vx = 0;
    if (shiftY * vy < 0) vy = 0;
    Body.setVelocity(body, { x: vx * cos - vy * sin, y: vx * sin + vy * cos });
    if (body.isSleeping) Sleeping.set(body, false);
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
