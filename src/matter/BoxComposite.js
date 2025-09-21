import { Bodies, Composite, Constraint } from "matter-js";

export default class BoxComposite {
  constructor(x, y, width, height, options = {}, boxId = 1) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.options = options;
    this.boxId = boxId;
    this.wallThickness = 5;
    this.compositeData = this.createBoxComposite();
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

    const boxComposite = Composite.create();
    Composite.add(boxComposite, [topWall, bottomWall, leftWall, rightWall]);

    const diagonalLength = Math.sqrt(
      this.width * this.width + this.height * this.height
    );

    const constraints = [
      Constraint.create({
        bodyA: topWall,
        bodyB: leftWall,
        pointA: { x: -this.width / 2, y: 0 },
        pointB: { x: 0, y: -this.height / 2 },
        length: 0,
        stiffness: 1,
      }),
      Constraint.create({
        bodyA: topWall,
        bodyB: rightWall,
        pointA: { x: this.width / 2, y: 0 },
        pointB: { x: 0, y: -this.height / 2 },
        length: 0,
        stiffness: 1,
      }),
      Constraint.create({
        bodyA: bottomWall,
        bodyB: leftWall,
        pointA: { x: -this.width / 2, y: 0 },
        pointB: { x: 0, y: this.height / 2 },
        length: 0,
        stiffness: 1,
      }),
      Constraint.create({
        bodyA: bottomWall,
        bodyB: rightWall,
        pointA: { x: this.width / 2, y: 0 },
        pointB: { x: 0, y: this.height / 2 },
        length: 0,
        stiffness: 1,
      }),
      Constraint.create({
        bodyA: topWall,
        bodyB: bottomWall,
        pointA: { x: -this.width / 2, y: 0 },
        pointB: { x: this.width / 2, y: 0 },
        length: diagonalLength,
        stiffness: 0.8,
        render: { visible: false },
      }),
      Constraint.create({
        bodyA: topWall,
        bodyB: bottomWall,
        pointA: { x: this.width / 2, y: 0 },
        pointB: { x: -this.width / 2, y: 0 },
        length: diagonalLength,
        stiffness: 0.8,
        render: { visible: false },
      }),
    ];
    Composite.add(boxComposite, constraints);

    return {
      composite: boxComposite,
      walls: { topWall, bottomWall, leftWall, rightWall },
    };
  }

  getCenter() {
    const BoxCenter = Composite.bounds(this.compositeData.composite);
    return {
      x: (BoxCenter.min.x + BoxCenter.max.x) / 2,
      y: (BoxCenter.min.y + BoxCenter.max.y) / 2,
    };
  }

  getAngle() {
    return this.compositeData.walls.topWall.angle;
  }
}
