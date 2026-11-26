import PhysicalDomObject from "./PhysicalDomObject";

/** Collects every `.physical` element under `startingElement`, parents first. */
export function loadPhysicalDomFromHtml(startingElement, physicalDomObjects, parent = null) {
  let current = parent;
  if (startingElement.classList.contains("physical")) {
    const { width, height } = startingElement.getBoundingClientRect();
    // Hidden responsive decorations and empty text spans have zero area and
    // would get a zero mass. A width-change rebuild picks them up once visible.
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
      current = new PhysicalDomObject(startingElement, parent);
      parent?.childrens.push(current);
      physicalDomObjects.push(current);
    }
  }
  for (const child of startingElement.children) {
    loadPhysicalDomFromHtml(child, physicalDomObjects, current);
  }
}

export function initPhysicalDomObjects(sim, physicalDomObjects) {
  for (const object of physicalDomObjects) object.init(sim);
  for (const object of physicalDomObjects) object.registerWithContainer();
  for (const object of physicalDomObjects) {
    if (object.containerChildren) {
      sim.addContainer(object.physicalBody, object.containerChildren);
    }
  }
}
