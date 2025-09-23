import { Bodies, Composite } from "matter-js";

export default class MatterObject {
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
    this.category = window.defaultCategory;
    this.mask = window.wallCategory | window.defaultCategory;
    if (this.customOptions.isSticky) {
      this.category = window.stickyCategory;
      this.mask = window.stickyCategory | window.wallCategory;
    }
    this.bodyData = null;
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
