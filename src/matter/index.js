import Matter from "matter-js";

import PhysicalDomObject from "./PhysicalDomObject";
import BoxComposite from "./BoxComposite";
import Box from "./Box";
import Circle from "./Circle";

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
    setTimeout(initializePhysics, 100);
    return;
  }
  var bodySize = body.getBoundingClientRect();

  console.log(bodySize);

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
  function loadPhysicalDomFromHtml(
    startingElement,
    parentPhysicalDomObject = null,
    physicalDomObject = null
  ) {
    if (startingElement.classList.contains("physical")) {
      physicalDomObject = new PhysicalDomObject(
        startingElement,
        { angle: 0, restitution: 1 },
        parentPhysicalDomObject
      );
      parentPhysicalDomObject?.children.push(physicalDomObject);
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

  function initPhysicalDomObjects() {
    for (const physicalDomObject of physicalDomObjects) {
      if (physicalDomObject.domElement.classList.contains("circle")) {
        physicalDomObject.init(Circle);
      } else if (physicalDomObject.children.length === 0) {
        physicalDomObject.init(Box);
      } else {
        physicalDomObject.init(BoxComposite);
      }
    }
  }

  loadPhysicalDomFromHtml(body);
  initPhysicalDomObjects();
  console.log(physicalDomObjects);

  // create box composites with unique IDs
  /*   var boxA = new PhysicalDomObject(
    test,
    { angle: 0, restitution: 1 },
    BoxComposite
  );

  var boxB = new PhysicalDomObject(
    test2,
    { angle: 0, restitution: 1 },
    BoxComposite,
    boxA
  );

  var boxC = new PhysicalDomObject(
    test3,
    { angle: 0, restitution: 1 },
    Box,
    boxB
  ); */

  // add all of the bodies to the world
  console.log(mouseConstraint);

  mouseConstraint.collisionFilter.mask =
    window.defaultCategory | window.stickyCategory | window.wallCategory;
  mouseConstraint.collisionFilter.category =
    window.defaultCategory | window.stickyCategory | window.wallCategory;
  console.log(mouseConstraint);

  Composite.add(window.engine.world, [
    ground,
    ceiling,
    leftWall,
    rightWall,
    mouseConstraint,
  ]);
  var runner = Runner.create({
    delta: 1000 / 120,
    isFixed: true,
  });

  window.engine.timing.timeScale = 1;
  window.engine.velocityIterations = 10;
  window.engine.positionIterations = 8;
  window.engine.constraintIterations = 2;
  window.engine.enableSleeping = false;
  Runner.run(runner, window.engine);
  Render.run(render);

  function setAbsoluteTransform(PhysicalDomObject) {
    const x = PhysicalDomObject.physicalBody.getCenter().x;
    const y = PhysicalDomObject.physicalBody.getCenter().y;
    const angle = PhysicalDomObject.physicalBody.getAngle();
    const element = PhysicalDomObject.domElement;
    let cumulativeMatrix = new DOMMatrix();
    let parent = PhysicalDomObject.parent;
    let correction = {
      x: -PhysicalDomObject.initialPos.x,
      y: -PhysicalDomObject.initialPos.y,
    };

    let angleCorrection = PhysicalDomObject.physicalBody.getAngle();
    const parentChain = [];
    let i = 0;
    while (parent !== null) {
      if (i == 0) {
        correction.x += +parent.initialPos.x;
        correction.y += +parent.initialPos.y;
        angleCorrection -= parent.physicalBody.getAngle();
      }
      i++;
      const matrix = new DOMMatrix()
        .translate(parent.localPos.x, parent.localPos.y)
        .rotate((parent.localAngle * 180) / Math.PI);
      parentChain.push({ matrix });
      parent = parent.parent;
    }

    for (let i = parentChain.length - 1; i >= 0; i--) {
      const parentInfo = parentChain[i];
      cumulativeMatrix = cumulativeMatrix.multiply(parentInfo.matrix);
    }

    const cumulativeTranslateX = cumulativeMatrix.m41;
    const cumulativeTranslateY = cumulativeMatrix.m42;
    const cumulativeRotation = Math.atan2(
      cumulativeMatrix.m12,
      cumulativeMatrix.m11
    );
    const inverseMatrix = cumulativeMatrix.inverse();

    const localPoint = new DOMPoint(x, y).matrixTransform(inverseMatrix);
    const localAngle = angle - cumulativeRotation;

    PhysicalDomObject.localPos = { x: localPoint.x, y: localPoint.y };
    PhysicalDomObject.localAngle = localAngle;

    element.style.transform = `translate(${localPoint.x + correction.x}px, ${
      localPoint.y + correction.y
    }px) rotate(${angleCorrection}rad)`;
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
      console.log(
        physicalDomObject.physicalBody,
        physicalDomObject.physicalBody.bodyData.body
      );
      if (
        physicalDomObject.physicalBody &&
        physicalDomObject.physicalBody.bodyData.body
      ) {
        const forceMagnitude = 0.00005 * velocityY;
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
