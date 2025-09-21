import Matter from "matter-js";

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

function createBoxComposite(x, y, width, height, options = {}, boxId = 1) {
  const wallThickness = 10;
  const wallGroup = -boxId;
  const volume = width * height;
  const density = 0.0001;
  const mass = density * volume;
  const angle = options.angle || 0;
  options.angle = 0;
  options.mass = mass;

  const wallsOptions = {
    ...options,
    collisionFilter: { group: wallGroup },
    category: 0x0001,
    mask: 0xffff,
    render: { fillStyle: "red" },
  };

  const topWall = Bodies.rectangle(x, y - height / 2, width, wallThickness, {
    ...wallsOptions,
  });
  const bottomWall = Bodies.rectangle(x, y + height / 2, width, wallThickness, {
    ...wallsOptions,
  });
  const leftWall = Bodies.rectangle(x - width / 2, y, wallThickness, height, {
    ...wallsOptions,
  });
  const rightWall = Bodies.rectangle(x + width / 2, y, wallThickness, height, {
    ...wallsOptions,
  });

  const boxComposite = Composite.create();
  Composite.add(boxComposite, [topWall, bottomWall, leftWall, rightWall]);

  const diagonalLength = Math.sqrt(width * width + height * height);

  const constraints = [
    Constraint.create({
      bodyA: topWall,
      bodyB: leftWall,
      pointA: { x: -width / 2, y: 0 },
      pointB: { x: 0, y: -height / 2 },
      length: 0,
      stiffness: 1,
    }),
    Constraint.create({
      bodyA: topWall,
      bodyB: rightWall,
      pointA: { x: width / 2, y: 0 },
      pointB: { x: 0, y: -height / 2 },
      length: 0,
      stiffness: 1,
    }),
    Constraint.create({
      bodyA: bottomWall,
      bodyB: leftWall,
      pointA: { x: -width / 2, y: 0 },
      pointB: { x: 0, y: height / 2 },
      length: 0,
      stiffness: 1,
    }),
    Constraint.create({
      bodyA: bottomWall,
      bodyB: rightWall,
      pointA: { x: width / 2, y: 0 },
      pointB: { x: 0, y: height / 2 },
      length: 0,
      stiffness: 1,
    }),
    Constraint.create({
      bodyA: topWall,
      bodyB: bottomWall,
      pointA: { x: -width / 2, y: 0 },
      pointB: { x: width / 2, y: 0 },
      length: diagonalLength,
      stiffness: 0.8,
      render: { visible: false },
    }),
    Constraint.create({
      bodyA: topWall,
      bodyB: bottomWall,
      pointA: { x: width / 2, y: 0 },
      pointB: { x: -width / 2, y: 0 },
      length: diagonalLength,
      stiffness: 0.8,
      render: { visible: false },
    }),
  ];
  Composite.add(boxComposite, constraints);
  Composite.rotate(boxComposite, angle, {
    x: x + width / 2,
    y: y + height / 2,
  });
  return {
    composite: boxComposite,
    walls: { topWall, bottomWall, leftWall, rightWall },
  };
}
var render = null;
var body = null;

// Make render available globally for SyntheticCanvasEvent.js
window.render = null;

document.addEventListener("DOMContentLoaded", function initializePhysics() {
  body = document.body;
  if (!body) {
    // Elements don't exist yet, try again in 100ms
    console.log("Elements not found, retrying...");
    setTimeout(initializePhysics, 100);
    return;
  }
  var bodySize = body.getBoundingClientRect();

  console.log(bodySize);

  let test = document.getElementById("test");

  if (!test) {
    // Elements don't exist yet, try again in 100ms
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

  // create an engine
  var engine = Engine.create();

  // create renderer with absolute positioning
  render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      width: bodySize.width,
      height: bodySize.height,
      wireframes: false,
      background: "transparent",
    },
  });

  // Make render available globally for SyntheticCanvasEvent.js
  window.render = render;

  // Style the canvas to be absolutely positioned on top
  render.canvas.style.position = "absolute";
  render.canvas.style.top = "0";
  render.canvas.style.left = "0";
  render.canvas.style.zIndex = "1000";
  render.canvas.style.pointerEvents = "none"; // Disable pointer events so HTML elements can receive real events
  render.canvas.style.opacity = 1;

  var ground = Bodies.rectangle(
    Math.floor(bodySize.width / 2),
    Math.floor(bodySize.height) - 50,
    Math.floor(bodySize.width) * 2,
    50,
    {
      isStatic: true,
      restitution: 0.5,
      render: { fillStyle: "gray" },
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
    mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.002,
        render: {
          visible: true,
        },
      },
    });

  // create box composites with unique IDs
  var boxA = createBoxComposite(
    initialPos.x + initialPos.width / 2,
    initialPos.y + initialPos.height / 2,
    initialPos.width,
    initialPos.height,
    { angle: 0, restitution: 1 },
    1 // Box ID 1
  );

  var boxB = createBoxComposite(
    initialPos2.x + initialPos2.width / 2,
    initialPos2.y + initialPos2.height / 2,
    initialPos2.width,
    initialPos2.height,
    {
      frictionStatic: 0,
      restitution: 0,
      friction: 0,
      frictionAir: 0,
      velocity: { x: 10, y: 0 },
    },
    2 // Box ID 2
  );

  var boxC = createBoxComposite(
    initialPos3.x + initialPos3.width / 2,
    initialPos3.y + initialPos3.height / 2,
    initialPos3.width,
    initialPos3.height,
    {},
    3
  );

  var ground = Bodies.rectangle(
    Math.floor(bodySize.width / 2),
    Math.floor(bodySize.height) - 50,
    Math.floor(bodySize.width) * 2,
    50,
    {
      isStatic: true,
      restitution: 0.5,
      render: { fillStyle: "gray" },
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

  // add all of the bodies to the world
  Composite.add(engine.world, [
    boxA.composite,
    boxB.composite,
    boxC.composite,
    ground,
    ceiling,
    leftWall,
    rightWall,
    mouseConstraint,
  ]);

  // create runner with higher time step resolution for better collision detection
  var runner = Runner.create({
    delta: 1000 / 120, // 120 FPS instead of default 60 FPS for higher resolution
    isFixed: true, // Use fixed time stepping for consistent physics
  });

  // Configure engine for better collision detection
  engine.timing.timeScale = 1; // Normal time scale
  engine.velocityIterations = 8; // Increase from default 4 to 8 for better collision resolution
  engine.positionIterations = 6; // Increase from default 6 for better position correction
  engine.constraintIterations = 2; // Keep constraint iterations at 2

  // run the engine and renderer
  Runner.run(runner, engine);
  Render.run(render);

  // Debug function to test specific rotation cases

  function setAbsoluteTransform(element, x, y, angle) {
    // Build the complete transformation matrix from all parents
    let cumulativeMatrix = new DOMMatrix(); // Identity matrix
    let parent = element.parentElement;
    const parentChain = [];

    // Collect all parents
    while (parent && parent !== document.body) {
      const style = window.getComputedStyle(parent);
      if (style.transform && style.transform !== "none") {
        const matrix = new DOMMatrixReadOnly(style.transform);
        parentChain.push({
          element: parent.id || parent.tagName,
          matrix: matrix,
          transform: style.transform,
        });
      }
      parent = parent.parentElement;
    }

    // Apply transformations from outermost to innermost
    for (let i = parentChain.length - 1; i >= 0; i--) {
      const parentInfo = parentChain[i];
      cumulativeMatrix = cumulativeMatrix.multiply(parentInfo.matrix);
    }

    // Extract cumulative translation and rotation
    const cumulativeTranslateX = cumulativeMatrix.m41;
    const cumulativeTranslateY = cumulativeMatrix.m42;
    const cumulativeRotation = Math.atan2(
      cumulativeMatrix.m12,
      cumulativeMatrix.m11
    );
    const inverseMatrix = cumulativeMatrix.inverse();

    // Transform the target global position to local coordinates
    const localPoint = new DOMPoint(x, y).matrixTransform(inverseMatrix);
    const localAngle = angle - cumulativeRotation;

    // Apply the local transformation
    element.style.transform = `translate(${localPoint.x}px, ${localPoint.y}px) rotate(${localAngle}rad)`;
  }

  function uiLoop() {
    // Calculate center position of boxA composite
    const boxACenter = Composite.bounds(boxA.composite);
    const boxACenterX = (boxACenter.min.x + boxACenter.max.x) / 2;
    const boxACenterY = (boxACenter.min.y + boxACenter.max.y) / 2;

    // Calculate center position of boxB composite
    const boxBCenter = Composite.bounds(boxB.composite);
    const boxBCenterX = (boxBCenter.min.x + boxBCenter.max.x) / 2;
    const boxBCenterY = (boxBCenter.min.y + boxBCenter.max.y) / 2;

    // Get the angle of the top wall as representative of box rotation
    const boxCCenter = Composite.bounds(boxC.composite);
    const boxCCenterX = (boxCCenter.min.x + boxCCenter.max.x) / 2;
    const boxCCenterY = (boxCCenter.min.y + boxCCenter.max.y) / 2;

    const boxAAngle = boxA.walls.topWall.angle;
    const boxBAngle = boxB.walls.topWall.angle;
    const boxCAngle = boxC.walls.topWall.angle;

    // Pass the ACTUAL physics coordinates, not displacements
    setAbsoluteTransform(
      document.getElementById("test"),
      boxACenterX,
      boxACenterY,
      boxAAngle
    );

    setAbsoluteTransform(
      document.getElementById("test2"),
      boxBCenterX,
      boxBCenterY,
      boxBAngle
    );

    setAbsoluteTransform(
      document.getElementById("test3"),
      boxCCenterX,
      boxCCenterY,
      boxCAngle
    );

    let testTranslationX = new DOMMatrixReadOnly(test.style.transform).m41;
    let testTranslationY = new DOMMatrixReadOnly(test.style.transform).m42;
    test.style.transform = `translate(${
      testTranslationX - initialPos.x - test.offsetWidth / 2
    }px, ${
      testTranslationY - initialPos.y - test.offsetHeight / 2
    }px) rotate(${boxAAngle}rad)`;
    let test2TranslationX = new DOMMatrixReadOnly(test2.style.transform).m41;
    let test2TranslationY = new DOMMatrixReadOnly(test2.style.transform).m42;
    test2.style.transform = `translate(${
      test2TranslationX +
      test.offsetWidth / 2 +
      initialPos.x -
      initialPos2.x -
      test2.offsetWidth / 2
    }px, ${
      test2TranslationY +
      test.offsetHeight / 2 +
      initialPos.y -
      initialPos2.y -
      test2.offsetHeight / 2
    }px) rotate(${boxBAngle - boxAAngle}rad)`;
    let test3TranslationX = new DOMMatrixReadOnly(test3.style.transform).m41;
    let test3TranslationY = new DOMMatrixReadOnly(test3.style.transform).m42;
    test3.style.transform = `translate(${
      test3TranslationX +
      test2.offsetWidth / 2 +
      initialPos2.x -
      initialPos3.x -
      test3.offsetWidth / 2
    }px, ${
      test3TranslationY +
      test2.offsetHeight / 2 +
      initialPos2.y -
      initialPos3.y -
      test3.offsetHeight / 2
    }px) rotate(${boxCAngle - boxBAngle}rad)`;

    requestAnimationFrame(uiLoop);
  }
  uiLoop();
});
