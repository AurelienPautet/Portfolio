import Matter from "matter-js";

export function setupKeyboardControls(physicalDomObjects, render) {
  let canvasOpacity = 0;

  document.addEventListener("keydown", function (e) {
    if (e.key === "Control") {
      canvasOpacity = canvasOpacity === 1 ? 0 : 1;
      if (render && render.canvas) {
        render.canvas.style.opacity = canvasOpacity;
      }
    }
    if (e.key.toLowerCase() === "k") {
      for (const physicalDomObject of physicalDomObjects) {
        if (typeof physicalDomObject.removeConstraint === "function") {
          physicalDomObject.removeConstraint();
        }
      }
    }
    if (e.key.toLowerCase() === "l") {
      for (const physicalDomObject of physicalDomObjects) {
        if (typeof physicalDomObject.addConstraint === "function") {
          physicalDomObject.addConstraint();
        }
      }
    }
  });
}

export function setupScrollPhysics(physicalDomObjects) {
  let lastScrollY = window.scrollY;
  let lastTimestamp = performance.now();

  window.addEventListener("scroll", function () {
    return;
    const currentScrollY = window.scrollY;
    const currentTimestamp = performance.now();
    const deltaY = currentScrollY - lastScrollY;
    const deltaTime = (currentTimestamp - lastTimestamp) / 1000;
    const velocityY = deltaTime > 0 ? deltaY / deltaTime : 0;

    for (const physicalDomObject of physicalDomObjects) {
      if (
        physicalDomObject.physicalBody &&
        physicalDomObject.physicalBody.bodyData.body
      ) {
        const forceMagnitude = -0.00005 * velocityY;
        Matter.Body.applyForce(
          physicalDomObject.physicalBody.bodyData.body,
          physicalDomObject.physicalBody.bodyData.body.position,
          { x: 0, y: forceMagnitude }
        );
      }
    }

    lastScrollY = currentScrollY;
    lastTimestamp = currentTimestamp;
  });
}
