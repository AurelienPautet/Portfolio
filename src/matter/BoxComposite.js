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
    this.bodyData = this.createBoxComposite();
  }

  createBoxComposite() {
    this.options.mass = this.options.mass || 1;
    const wallsOptions = {
      ...this.options,
      render: { fillStyle: "red" },
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

    console.log(this.category);

    var compoundBodyB = Body.create({
      parts: [topWall, bottomWall, leftWall, rightWall],
      collisionFilter: {
        category: this.category,
        mask: this.mask,
      },
    });

    console.log("Composite box body", compoundBodyB);

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
