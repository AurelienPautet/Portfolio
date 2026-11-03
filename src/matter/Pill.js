import { Bodies } from "matter-js";
import MatterObject from "./MatterObject";

// Matter has no capsule body. Build one as a single convex polygon: two straight
// sides capped by semicircles, oriented along the element's long axis.
const CAP_SEGMENTS = 8;

function capsuleVertices(radius, length, vertical) {
  const points = [];
  const straight = length / 2;

  for (let i = 0; i <= CAP_SEGMENTS; i++) {
    const angle = -Math.PI * (i / CAP_SEGMENTS);
    points.push([
      radius * Math.cos(angle),
      -straight + radius * Math.sin(angle),
    ]);
  }
  for (let i = 0; i <= CAP_SEGMENTS; i++) {
    const angle = Math.PI - Math.PI * (i / CAP_SEGMENTS);
    points.push([
      radius * Math.cos(angle),
      straight + radius * Math.sin(angle),
    ]);
  }

  // The maths above builds a vertical capsule; swap axes for a horizontal one.
  return points.map(([x, y]) => (vertical ? { x, y } : { x: y, y: x }));
}

export default class Pill extends MatterObject {
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
    this.bodyData = this.createPill();
  }

  createPill() {
    const vertical = this.height >= this.width;
    const radius = (vertical ? this.width : this.height) / 2;
    const length = (vertical ? this.height : this.width) - radius * 2;

    const bodyOptions = {
      ...this.options,
      slop: 0.01,
      label: `Pill-${this.boxId}`,
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
    };

    if (length < 1) {
      return { body: Bodies.circle(this.x, this.y, radius, bodyOptions) };
    }

    const vertices = capsuleVertices(radius, length, vertical);
    return { body: Bodies.fromVertices(this.x, this.y, [vertices], bodyOptions) };
  }
}
