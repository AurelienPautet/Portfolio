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
    boxId = 1,
  ) {
    super(x, y, width, height, options, customOptions, boxId);
    this.bodyData = this.createBox();
  }

  createBox() {
    const side = this.width;
    const height = (Math.sqrt(3) / 2) * side;

    const triangleVertices = [
      { x: -side / 2, y: height / 3 },
      { x: side / 2, y: height / 3 },
      { x: 0, y: (-2 * height) / 3 },
    ];

    return {
      body: Bodies.fromVertices(this.x, this.y, triangleVertices, {
        ...this.options,
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
