import { Bodies, Composite } from "matter-js";

export default class Box {
  constructor(x, y, width, height, options = {}, boxId = 1) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.options = options;
    this.boxId = boxId;
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
      }),
    };
  }

  getCenter() {
    return {
      x: this.bodyData.body.position.x,
      y: this.bodyData.body.position.y,
    };
  }
  getAngle() {
    return this.bodyData.body.angle;
  }
}
