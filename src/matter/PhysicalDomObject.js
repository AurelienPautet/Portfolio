export default class PhysicalDomObject {
  static domElementIdCounter = 0;

  constructor(domElement, options = {}, physicalBodyClass = null) {
    this.domElement = domElement;
    this.options = options;
    this.initialPos = { x: 0, y: 0 };
    this.initialSize = { width: 0, height: 0 };
    this.physicalBodyClass = physicalBodyClass;
    this.init();
    this.physicalBody = null;
    this.parent = null;
    this.children = [];
  }
  init() {
    PhysicalDomObject.domElementIdCounter += 1;
    const rect = this.domElement.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = rect.left + width / 2;
    const y = rect.top + height / 2;
    this.initialPos = { x: x, y: y };
    this.initialSize = { width: width, height: height };
    if (this.physicalBodyClass) {
      this.physicalBody = new this.physicalBodyClass(
        x,
        y,
        width,
        height,
        this.options,
        PhysicalDomObject.domElementIdCounter
      );
    }
  }
}
