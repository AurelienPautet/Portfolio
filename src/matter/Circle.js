import { Bodies, Composite } from "matter-js";

export default class Circle {
  constructor(
    x,
    y,
    width,
    height,
    options = {},
    customOptions = {},
    boxId = 1
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.options = options;
    this.customOptions = customOptions;
    this.boxId = boxId;
    this.bodyData = this.createBox();
  }

  createBox() {
    console.log(this.options);
    let category = window.defaultCategory;
    if (this.customOptions.isSticky) {
      category = window.stickyCategory;
    }
    let mask = window.wallCategory | window.defaultCategory;
    if (this.customOptions.isSticky) {
      mask = window.stickyCategory | window.wallCategory;
    }
    console.log(category, mask, this.customOptions.isSticky);
    return {
      body: Bodies.circle(this.x, this.y, this.width / 2, {
        ...this.options,
        render: {
          wireframes: true,
          fillStyle: "transparent",
          strokeStyle: "red",
          lineWidth: 1,
        },
        collisionFilter: {
          category: category,
          mask: mask,
        },
      }),
    };
  }

  getCenter() {
    if (this.customOptions.isSticky) {
      return {
        x: this.bodyData.body.position.x - window.scrollX,
        y: this.bodyData.body.position.y - window.scrollY,
      };
    }
    return {
      x: this.bodyData.body.position.x,
      y: this.bodyData.body.position.y,
    };
  }
  getAngle() {
    return this.bodyData.body.angle;
  }
}
