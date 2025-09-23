import { Bodies, Composite } from "matter-js";
import MatterObject from "./MatterObject";
export default class Box extends MatterObject {
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
      body: Bodies.rectangle(this.x, this.y, this.width, this.height, {
        ...this.options,
        render: {
          wireframes: true,
          fillStyle: "transparent",
          strokeStyle: "red",
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
