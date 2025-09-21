export default class PhysicalDomTree {
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.children = [];
  }
}

class PhysicalDomNode {
  constructor(domElement) {
    this.domElement = domElement;
    this.children = [];
    this.parent = null;
  }
}
