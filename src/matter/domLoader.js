import PhysicalDomObject from "./PhysicalDomObject";
import BoxComposite from "./BoxComposite";
import Box from "./Box";
import Circle from "./Circle";
import Triangle from "./Triangle";
import Pill from "./Pill";

const DEFAULT_BODY_OPTIONS = {
  angle: 0,
  restitution: 0.2,
  friction: 0.35,
  frictionAir: 0.02,
  frictionStatic: 0.5,
  sleepThreshold: 40,
};

export async function waitForImages() {
  const images = document.querySelectorAll("img.physical");
  const imagePromises = Array.from(images).map((img) => {
    return new Promise((resolve) => {
      if (img.complete && img.naturalHeight !== 0) {
        resolve();
      } else {
        img.addEventListener("load", resolve);
        img.addEventListener("error", resolve);
      }
    });
  });

  await Promise.all(imagePromises);
}

export function loadPhysicalDomFromHtml(
  startingElement,
  physicalDomObjects,
  parentPhysicalDomObject = null,
  physicalDomObject = null,
) {
  if (
    startingElement.classList.contains("physical") ||
    startingElement.classList.contains("chain-container")
  ) {
    physicalDomObject = new PhysicalDomObject(
      startingElement,
      { ...DEFAULT_BODY_OPTIONS },
      parentPhysicalDomObject,
    );
    parentPhysicalDomObject?.childrens.push(physicalDomObject);
    physicalDomObjects.push(physicalDomObject);
  }
  for (let i = 0; i < startingElement.children.length; i++) {
    loadPhysicalDomFromHtml(
      startingElement.children[i],
      physicalDomObjects,
      physicalDomObject,
      physicalDomObject,
    );
  }
}

export function createChains(physicalDomObjects) {
  for (const physicalDomObject of physicalDomObjects) {
    if (physicalDomObject.domElement.classList.contains("chain-container")) {
      for (let i = 0; i < physicalDomObject.childrens.length - 1; i++) {
        physicalDomObject.childrens[i].chainedTo =
          physicalDomObject.childrens[i + 1];
        physicalDomObject.childrens[i].addChainTo();
      }
    }
  }
}

export function initPhysicalDomObjects(physicalDomObjects) {
  for (const physicalDomObject of physicalDomObjects) {
    if (physicalDomObject.domElement.classList.contains("circle")) {
      physicalDomObject.init(Circle);
    } else if (physicalDomObject.domElement.classList.contains("pill")) {
      physicalDomObject.init(Pill);
    } else if (physicalDomObject.domElement.classList.contains("triangle")) {
      physicalDomObject.init(Triangle);
    } else if (physicalDomObject.childrens.length === 0) {
      physicalDomObject.init(Box);
    } else {
      physicalDomObject.init(BoxComposite);
    }
  }
}
