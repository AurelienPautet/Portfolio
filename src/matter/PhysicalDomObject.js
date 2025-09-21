import { Composite } from "matter-js";

export default class PhysicalDomObject {
  static domElementIdCounter = 0;

  constructor(domElement, options = {}, parent = null) {
    this.domElement = domElement;
    this.options = options;
    this.initialPos = { x: 0, y: 0 };
    this.initialSize = { width: 0, height: 0 };
    this.localPos = { x: 0, y: 0 };
    this.localAngle = 0;
    this.physicalBody = null;
    this.parent = parent;
    this.children = [];
  }
  init(physicalBodyClass) {
    PhysicalDomObject.domElementIdCounter += 1;
    const rect = this.domElement.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = rect.left + width / 2;
    const y = rect.top + height / 2;
    this.initialPos = { x: x, y: y };
    this.initialSize = { width: width, height: height };
    if (physicalBodyClass) {
      console.log(physicalBodyClass);
      this.physicalBody = new physicalBodyClass(
        x,
        y,
        width,
        height,
        this.options,
        PhysicalDomObject.domElementIdCounter
      );
      Composite.add(window.engine.world, [
        this.physicalBody.compositeData.composite,
      ]);
    }
  }
}
