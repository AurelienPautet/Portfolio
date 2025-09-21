import { Bodies, Composite, Constraint, Body } from "matter-js";

export default class BoxComposite {
  constructor(x, y, width, height, options = {}, boxId = 1) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.options = options;
    this.boxId = boxId;
    this.wallThickness = 5;
    this.bodyData = this.createBoxComposite();
  }

  createBoxComposite() {
    this.options.mass = this.options.mass || 1;
    const wallGroup = -this.boxId;
    const wallsOptions = {
      ...this.options,
      collisionFilter: { group: wallGroup },
      category: 0x0001,
      mask: 0xffff,
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

    var compoundBodyB = Body.create({
      parts: [topWall, bottomWall, leftWall, rightWall],
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
