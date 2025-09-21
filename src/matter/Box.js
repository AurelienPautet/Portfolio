import { Bodies, Composite } from "matter-js";

export default class Box {
  constructor(x, y, width, height, options = {}, boxId = 1) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.options = options;
    this.boxId = boxId;
    this.compositeData = this.createBoxComposite();
  }

  createBox() {
    return {
      composite: Bodies.rectangle(
        this.x,
        this.y,
        this.width,
        this.height,
        this.options
      ),
    };
  }

  getCenter() {
    return {
      x: this.compositeData.composite.position.x,
      y: this.compositeData.composite.position.y,
    };
  }
  getAngle() {
    return this.compositeData.composite.angle;
  }
}
