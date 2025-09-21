import Matter from "matter-js";

import PhysicalDomObject from "./PhysicalDomObject";
import BoxComposite from "./BoxComposite";
import Box from "./Box";

var Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite,
  Constraint = Matter.Constraint,
  Mouse = Matter.Mouse,
  MouseConstraint = Matter.MouseConstraint;

function getOffset(el) {
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY,
    width: rect.width,
    height: rect.height,
  };
}

var render = null;
var body = null;

window.render = null;

document.addEventListener("DOMContentLoaded", function initializePhysics() {
  body = document.body;
  if (!body) {
    console.log("Elements not found, retrying...");
    setTimeout(initializePhysics, 100);
    return;
  }
  var bodySize = body.getBoundingClientRect();

  console.log(bodySize);

  let test = document.getElementById("test");

  if (!test) {
    console.log("Elements not found, retrying...");
    setTimeout(initializePhysics, 100);
    return;
  }

  let initialPos = getOffset(test);
  let test2 = document.getElementById("test2");
  let initialPos2 = getOffset(test2);
  let test3 = document.getElementById("test3");
  let initialPos3 = getOffset(test3);
  console.log(initialPos);
  console.log(initialPos2);
  console.log(initialPos3);

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
  render.canvas.style.opacity = 1;

  var ground = Bodies.rectangle(
    Math.floor(bodySize.width / 2),
    Math.floor(bodySize.height),
    Math.floor(bodySize.width) * 2,
    5,
    {
      isStatic: true,
      restitution: 0.5,
      render: { fillStyle: "blue" },
    }
  );

  var ceiling = Bodies.rectangle(
    Math.floor(bodySize.width / 2),
    0,
    Math.floor(bodySize.width) * 2,
    5,
    {
      isStatic: true,
      render: { fillStyle: "gray" },
    }
  );
  var leftWall = Bodies.rectangle(
    0,
    Math.floor(bodySize.height / 2),
    5,
    Math.floor(bodySize.height) * 2,
    {
      isStatic: true,
      render: { fillStyle: "gray" },
    }
  );
  var rightWall = Bodies.rectangle(
    Math.floor(bodySize.width),
    Math.floor(bodySize.height / 2),
    5,
    Math.floor(bodySize.height) * 2,
    {
      isStatic: true,
      render: { fillStyle: "gray" },
    }
  );

  var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(window.engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.02,
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
      if (physicalDomObject.children.length === 0) {
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
  window.engine.velocityIterations = 8;
  window.engine.positionIterations = 6;
  window.engine.constraintIterations = 2;
  window.engine.enableSleeping = true;
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

  function uiLoop() {
    for (const physicalDomObject of physicalDomObjects) {
      console.log(physicalDomObject);
      setAbsoluteTransform(physicalDomObject);
    }

    requestAnimationFrame(uiLoop);
  }
  uiLoop();
});
