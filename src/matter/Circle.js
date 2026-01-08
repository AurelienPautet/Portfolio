import { Bodies, Composite } from "matter-js";
import MatterObject from "./MatterObject";

export default class Circle extends MatterObject {
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
    this.bodyData = this.createBox();
  }

  createBox() {
    return {
      body: Bodies.circle(this.x, this.y, this.width / 2, {
        ...this.options,
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
