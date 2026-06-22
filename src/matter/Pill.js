import { Bodies } from "matter-js";
import MatterObject from "./MatterObject";

// A capsule / "pill" collider: a rectangle whose corners are fully rounded on
// the shorter axis, giving a stadium shape that roughly follows a rounded logo.
export default class Pill extends MatterObject {
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
    this.bodyData = this.createPill();
  }

  createPill() {
    const radius = Math.min(this.width, this.height) / 2;
    return {
      body: Bodies.rectangle(this.x, this.y, this.width, this.height, {
        ...this.options,
        chamfer: { radius },
        slop: 0.01,
        render: {
          wireframes: true,
          fillStyle: "transparent",
          strokeStyle: "#ffffff",
          lineWidth: 1,
        },
        collisionFilter: {
          category: this.category,
          mask: this.mask,
        },
      }),
    };
  }
}
