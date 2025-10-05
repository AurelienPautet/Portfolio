import Matter from "matter-js";

import PhysicalDomObject from "./PhysicalDomObject";
import BoxComposite from "./BoxComposite";
import Box from "./Box";
import Circle from "./Circle";
import Triangle from "./Triangle";

var Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite,
  Constraint = Matter.Constraint,
  Mouse = Matter.Mouse,
  MouseConstraint = Matter.MouseConstraint;

var render = null;
var body = null;

var canvasOpacity = 0;
window.defaultCategory = 0x0001;
window.wallCategory = 0x0004;
window.stickyCategory = 0x0002;

window.render = null;

document.addEventListener("DOMContentLoaded", function initializePhysics() {
  body = document.body;
  window.scrollTo(0, 0);
  if (!body) {
    console.log("Elements not found, retrying...");
    setTimeout(initializePhysics, 1000);
    return;
  }
  var bodySize = body.getBoundingClientRect();

  let test = document.getElementsByClassName("physical");

  if (test.length === 0) {
    console.log(" dqsd Elements not found, retrying...");
    setTimeout(initializePhysics, 100);
    return;
  }

  window.engine = Engine.create();

  render = Render.create({
    element: document.body,
    engine: window.engine,
    options: {
      width: bodySize.width,
      height: bodySize.height,
      wireframes: false,
      background: "transparent",
    },
  });

  window.render = render;
  render.canvas.style.position = "absolute";
  render.canvas.style.top = "0";
  render.canvas.style.left = "0";
  render.canvas.style.zIndex = "1000";
  render.canvas.style.pointerEvents = "none";
  render.canvas.style.opacity = canvasOpacity;
  render.canvas.style.overflow = "hidden";

  var ground = Bodies.rectangle(
    Math.floor(bodySize.width / 2),
    Math.floor(bodySize.height) + 248,
    Math.floor(bodySize.width) * 2,
    500,
    {
      isStatic: true,
      restitution: 0.5,
      render: { fillStyle: "blue" },
      collisionFilter: { category: window.wallCategory },
    }
  );

  var ceiling = Bodies.rectangle(
    Math.floor(bodySize.width / 2),
    -248,
    Math.floor(bodySize.width) * 2,
    500,
    {
      isStatic: true,
      render: { fillStyle: "gray" },
      collisionFilter: { category: window.wallCategory },
    }
  );
  var leftWall = Bodies.rectangle(
    -248,
    Math.floor(bodySize.height / 2),
    500,
    Math.floor(bodySize.height) * 2,
    {
      isStatic: true,
      render: { fillStyle: "gray" },
      collisionFilter: { category: window.wallCategory },
    }
  );
  var rightWall = Bodies.rectangle(
    Math.floor(bodySize.width) + 248,
    Math.floor(bodySize.height / 2),
    500,
    Math.floor(bodySize.height) * 2,
    {
      isStatic: true,
      render: { fillStyle: "gray" },
      collisionFilter: { category: window.wallCategory },
    }
  );

  var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(window.engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        angularStiffness: 0.2,
        damping: 0.1,
        render: {
          visible: true,
        },
      },
    });

  let physicalDomObjects = [];

  async function waitForImages() {
    const images = document.querySelectorAll("img.physical");
    const imagePromises = Array.from(images).map((img) => {
      return new Promise((resolve) => {
        if (img.complete && img.naturalHeight !== 0) {
          resolve();
        } else {
          img.addEventListener("load", resolve);
          img.addEventListener("error", resolve); // Resolve even on error to prevent hanging
        }
      });
    });

    await Promise.all(imagePromises);
  }

  function loadPhysicalDomFromHtml(
    startingElement,
    parentPhysicalDomObject = null,
    physicalDomObject = null
  ) {
    if (
      startingElement.classList.contains("physical") ||
      startingElement.classList.contains("chain-container")
    ) {
      physicalDomObject = new PhysicalDomObject(
        startingElement,
        { angle: 0, restitution: 0.5 },
        parentPhysicalDomObject
      );
      parentPhysicalDomObject?.childrens.push(physicalDomObject);
      physicalDomObjects.push(physicalDomObject);
    }
    for (let i = 0; i < startingElement.children.length; i++) {
      loadPhysicalDomFromHtml(
        startingElement.children[i],
        physicalDomObject,
        physicalDomObject
      );
    }
  }

  function createChains() {
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

  function initPhysicalDomObjects() {
    for (const physicalDomObject of physicalDomObjects) {
      if (physicalDomObject.domElement.classList.contains("circle")) {
        physicalDomObject.init(Circle);
      } else if (physicalDomObject.domElement.classList.contains("triangle")) {
        physicalDomObject.init(Triangle);
      } else if (physicalDomObject.childrens.length === 0) {
        physicalDomObject.init(Box);
      } else {
        physicalDomObject.init(BoxComposite);
      }
    }
  }

  waitForImages().then(() => {
    loadPhysicalDomFromHtml(body);
    initPhysicalDomObjects();
    createChains();
  });

  mouseConstraint.collisionFilter.mask =
    window.defaultCategory | window.stickyCategory | window.wallCategory;
  mouseConstraint.collisionFilter.category =
    window.defaultCategory | window.stickyCategory | window.wallCategory;

  Composite.add(window.engine.world, [
    ground,
    ceiling,
    leftWall,
    rightWall,
    mouseConstraint,
  ]);
  var runner = Runner.create({
    delta: 1000 / 120,
  });

  window.engine.timing.timeScale = 1;
  window.engine.velocityIterations = 8;
  window.engine.positionIterations = 5;
  window.engine.constraintIterations = 2;
  window.engine.enableSleeping = true;
  Runner.run(runner, window.engine);
  Render.run(render);

  const parentDataPool = new Array(32);
  for (let i = 0; i < 32; i++) {
    parentDataPool[i] = { x: 0, y: 0, cos: 0, sin: 0 };
  }

  const supportsIndividualTransforms = CSS.supports("translate", "0px");
  const pendingDOMUpdates = [];
  let isFlushScheduled = false;

  function flushDOMUpdates() {
    isFlushScheduled = false;
    for (let i = 0; i < pendingDOMUpdates.length; i++) {
      const update = pendingDOMUpdates[i];
      if (supportsIndividualTransforms) {
        update.element.style.translate = update.translateStr;
        update.element.style.rotate = update.rotateStr;
      } else {
        update.element.style.transform = update.transformStr;
      }
    }
    pendingDOMUpdates.length = 0;
  }

  function scheduleDOMUpdate(element, x, y, angle) {
    pendingDOMUpdates.push({
      element: element,
      translateStr: x + "px " + y + "px",
      rotateStr: angle + "rad",
      transformStr:
        "translate3d(" + x + "px," + y + "px,0)rotateZ(" + angle + "rad)",
    });

    if (!isFlushScheduled) {
      isFlushScheduled = true;
      Promise.resolve().then(flushDOMUpdates);
    }
  }

  function setAbsoluteTransform(PhysicalDomObject) {
    const physicalBody = PhysicalDomObject.physicalBody;
    const center = physicalBody.getCenter();
    const x = center.x;
    const y = center.y;
    const angle = physicalBody.getAngle();
    const element = PhysicalDomObject.domElement;
    const initialPos = PhysicalDomObject.initialPos;

    if (!PhysicalDomObject._transformCache) {
      PhysicalDomObject._transformCache = {
        x: -999999,
        y: -999999,
        angle: -999999,
      };
      element.style.willChange = "transform";
    }
    const cache = PhysicalDomObject._transformCache;

    const parent = PhysicalDomObject.parent;
    if (!parent) {
      const localPos = PhysicalDomObject.localPos;
      localPos.x = x;
      localPos.y = y;
      PhysicalDomObject.localAngle = angle;

      const finalX = x - initialPos.x;
      const finalY = y - initialPos.y;
      const roundedX = Math.round(finalX * 2) / 2;
      const roundedY = Math.round(finalY * 2) / 2;
      const roundedAngle = Math.round(angle * 100) / 100;

      if (
        cache.x !== roundedX ||
        cache.y !== roundedY ||
        cache.angle !== roundedAngle
      ) {
        cache.x = roundedX;
        cache.y = roundedY;
        cache.angle = roundedAngle;
        scheduleDOMUpdate(element, roundedX, roundedY, roundedAngle);
      }
      return;
    }

    let correctionX = -initialPos.x;
    let correctionY = -initialPos.y;
    let angleCorrection = angle;
    let cumulativeA = 1,
      cumulativeB = 0,
      cumulativeC = 0,
      cumulativeD = 1;
    let cumulativeE = 0,
      cumulativeF = 0;
    let parentCount = 0;
    let currentParent = parent;
    let isFirstParent = true;

    while (currentParent !== null && parentCount < 32) {
      if (isFirstParent) {
        const parentInitial = currentParent.initialPos;
        correctionX += parentInitial.x;
        correctionY += parentInitial.y;
        angleCorrection -= currentParent.physicalBody.getAngle();
        isFirstParent = false;
      }

      const localPos = currentParent.localPos;
      const localAngle = currentParent.localAngle;
      const data = parentDataPool[parentCount];
      data.x = localPos.x;
      data.y = localPos.y;
      data.cos = Math.cos(localAngle);
      data.sin = Math.sin(localAngle);

      parentCount++;
      currentParent = currentParent.parent;
    }

    for (let i = parentCount - 1; i >= 0; i--) {
      const p = parentDataPool[i];
      const pCos = p.cos,
        pSin = p.sin,
        px = p.x,
        py = p.y;

      const newA = pCos * cumulativeA - pSin * cumulativeB;
      const newB = pSin * cumulativeA + pCos * cumulativeB;
      const newC = pCos * cumulativeC - pSin * cumulativeD;
      const newD = pSin * cumulativeC + pCos * cumulativeD;
      const newE = pCos * cumulativeE - pSin * cumulativeF + px;
      const newF = pSin * cumulativeE + pCos * cumulativeF + py;

      cumulativeA = newA;
      cumulativeB = newB;
      cumulativeC = newC;
      cumulativeD = newD;
      cumulativeE = newE;
      cumulativeF = newF;
    }

    const cumulativeRotation = Math.atan2(cumulativeB, cumulativeA);
    const det = cumulativeA * cumulativeD - cumulativeB * cumulativeC;
    if (Math.abs(det) < 1e-10) return;

    const invDet = 1 / det;
    const invA = cumulativeD * invDet;
    const invB = -cumulativeB * invDet;
    const invC = -cumulativeC * invDet;
    const invD = cumulativeA * invDet;
    const invE =
      (cumulativeC * cumulativeF - cumulativeD * cumulativeE) * invDet;
    const invF =
      (cumulativeB * cumulativeE - cumulativeA * cumulativeF) * invDet;

    const localX = invA * x + invC * y + invE;
    const localY = invB * x + invD * y + invF;
    const localAngle = angle - cumulativeRotation;

    const localPos = PhysicalDomObject.localPos;
    localPos.x = localX;
    localPos.y = localY;
    PhysicalDomObject.localAngle = localAngle;

    const finalX = localX + correctionX;
    const finalY = localY + correctionY;
    const roundedX = Math.round(finalX * 2) / 2;
    const roundedY = Math.round(finalY * 2) / 2;
    const roundedAngle = Math.round(angleCorrection * 100) / 100;

    if (
      cache.x !== roundedX ||
      cache.y !== roundedY ||
      cache.angle !== roundedAngle
    ) {
      cache.x = roundedX;
      cache.y = roundedY;
      cache.angle = roundedAngle;
      scheduleDOMUpdate(element, roundedX, roundedY, roundedAngle);
    }
  }

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

  let lastScrollY = window.scrollY;
  let lastTimestamp = performance.now();

  window.addEventListener("scroll", function () {
    const currentScrollY = window.scrollY;
    const currentTimestamp = performance.now();
    const deltaY = currentScrollY - lastScrollY;
    const deltaTime = (currentTimestamp - lastTimestamp) / 1000; // seconds
    const velocityY = deltaTime > 0 ? deltaY / deltaTime : 0;
    for (const physicalDomObject of physicalDomObjects) {
      if (
        physicalDomObject.physicalBody &&
        physicalDomObject.physicalBody.bodyData.body
      ) {
        const forceMagnitude = 1 * -0.00005 * velocityY;
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

  function uiLoop() {
    for (const physicalDomObject of physicalDomObjects) {
      physicalDomObject.updateConstraint();
      setAbsoluteTransform(physicalDomObject);
    }

    requestAnimationFrame(uiLoop);
  }
  uiLoop();
});
