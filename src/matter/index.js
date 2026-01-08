import Matter from "matter-js";
import { COLLISION_CATEGORIES, PHYSICS_CONFIG } from "./config";
import { createBoundaries } from "./boundaries";
import {
  createMouseInteraction,
  applyMagneticAttraction,
} from "./mouseInteraction";
import {
  waitForImages,
  loadPhysicalDomFromHtml,
  createChains,
  initPhysicalDomObjects,
} from "./domLoader";
import { setAbsoluteTransform } from "./transformManager";
import {
  onReload,
  setupKeyboardControls,
  setupScrollPhysics,
} from "./eventHandlers";
import { changeGravity, changeTimeScale } from "./dynamicSettings";

const { Engine, Render, Runner, Composite, Body } = Matter;

function clampVelocities(engine) {
  const maxVelocity = PHYSICS_CONFIG.maxVelocity;
  const bodies = Composite.allBodies(engine.world);

  for (const body of bodies) {
    if (body.isStatic) continue;

    const velocity = body.velocity;
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);

    if (speed > maxVelocity) {
      const scale = maxVelocity / speed;
      Body.setVelocity(body, {
        x: velocity.x * scale,
        y: velocity.y * scale,
      });
    }
  }
}

window.defaultCategory = COLLISION_CATEGORIES.default;
window.wallCategory = COLLISION_CATEGORIES.wall;
window.stickyCategory = COLLISION_CATEGORIES.sticky;
window.debugMode = false;

function toggleDebugMode() {
  window.debugMode = !window.debugMode;

  if (window.render) {
    window.render.options.background = "transparent";
  }

  if (window.physicalDomObjects) {
    window.physicalDomObjects.forEach((obj) => {
      if (obj.physicalBody?.bodyData?.body) {
        obj.physicalBody.bodyData.body.render.visible = window.debugMode;
        if (window.debugMode) {
          obj.physicalBody.bodyData.body.render.fillStyle = "transparent";
          obj.physicalBody.bodyData.body.render.strokeStyle = "#ffffff";
          obj.physicalBody.bodyData.body.render.lineWidth = 1;
        }
      }
      if (obj.constraint) {
        obj.constraint.render.visible = window.debugMode;
        if (window.debugMode) {
          obj.constraint.render.strokeStyle = "#ffffff";
          obj.constraint.render.lineWidth = 1;
        }
      }
    });
  }

  const world = window.engine?.world;
  if (world) {
    world.constraints.forEach((constraint) => {
      constraint.render.visible =
        window.debugMode || constraint.label === "Mouse Constraint";
      if (window.debugMode && constraint.label !== "Mouse Constraint") {
        constraint.render.strokeStyle = "#ffffff";
        constraint.render.lineWidth = 1;
      }
    });

    world.bodies.forEach((body) => {
      if (!body.isStatic) return;
      body.render.visible = window.debugMode;
      if (window.debugMode) {
        body.render.fillStyle = "transparent";
        body.render.strokeStyle = "#ffffff";
        body.render.lineWidth = 1;
      }
    });
  }

  console.log(`Debug mode: ${window.debugMode ? "ON" : "OFF"}`);
}

function configureCanvasStyle(canvas, opacity) {
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.zIndex = "9999";
  canvas.style.pointerEvents = "none";
  canvas.style.opacity = opacity;
  canvas.style.overflow = "hidden";
}

function configureEngine(engine) {
  engine.timing.timeScale = PHYSICS_CONFIG.timeScale;
  engine.velocityIterations = PHYSICS_CONFIG.velocityIterations;
  engine.positionIterations = PHYSICS_CONFIG.positionIterations;
  engine.constraintIterations = PHYSICS_CONFIG.constraintIterations;
  engine.enableSleeping = PHYSICS_CONFIG.enableSleeping;
}

function initializePhysics() {
  const body = document.body;

  if (!body) {
    console.log("Elements not found, retrying...");
    setTimeout(initializePhysics, 1000);
    return;
  }

  const bodySize = body.getBoundingClientRect();
  const test = document.getElementsByClassName("physical");
  const root = document.getElementById("root");

  if (test.length === 0) {
    console.log("Physical elements not found, retrying...");
    setTimeout(initializePhysics, 100);
    return;
  }

  window.engine = Engine.create();

  const render = Render.create({
    element: document.body,
    engine: window.engine,
    options: {
      width: bodySize.width,
      height: bodySize.height,
      wireframes: false,
      showConstraints: true,
      background: "transparent",
    },
  });

  window.render = render;
  configureCanvasStyle(render.canvas, 1);
  let physicalDomObjects = [];
  window.physicalDomObjects = physicalDomObjects;

  waitForImages().then(() => {
    loadPhysics(root, physicalDomObjects, bodySize);
  });

  setTimeout(() => {
    onReload(() => {
      loadPhysics(body, physicalDomObjects, bodySize);
    });
  }, 2000);

  const runner = Runner.create({
    delta: PHYSICS_CONFIG.runnerDelta,
  });

  configureEngine(window.engine);

  // Add velocity limiting before each update
  Matter.Events.on(window.engine, "beforeUpdate", function () {
    clampVelocities(window.engine);
  });

  Runner.run(runner, window.engine);
  Render.run(render);

  setupKeyboardControls(physicalDomObjects, render);
  setupScrollPhysics(physicalDomObjects);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Shift") {
      toggleDebugMode();
    }
  });

  function uiLoop() {
    applyMagneticAttraction(physicalDomObjects);
    for (const physicalDomObject of physicalDomObjects) {
      physicalDomObject.updateConstraint();
      setAbsoluteTransform(physicalDomObject);
    }

    requestAnimationFrame(uiLoop);
  }
  uiLoop();
}

function loadPhysics(body, physicalDomObjects, bodySize) {
  console.log("Reloading physics...");
  physicalDomObjects.length = 0;
  Matter.Composite.clear(window.engine.world, false);

  let { ground, ceiling, leftWall, rightWall } = createBoundaries(bodySize);
  let mouseConstraint = createMouseInteraction(render, window.engine);
  loadPhysicalDomFromHtml(body, physicalDomObjects);
  initPhysicalDomObjects(physicalDomObjects);
  createChains(physicalDomObjects);

  // One-time containment check 5 seconds after initialization

  Composite.add(window.engine.world, [
    ground,
    ceiling,
    leftWall,
    rightWall,
    mouseConstraint,
  ]);
}

setTimeout(() => {
  containAllChildren(physicalDomObjects);
}, 5000);

// Contain all children within their parent BoxComposite bounds
function containAllChildren(physicalDomObjects) {
  for (const obj of physicalDomObjects) {
    if (obj.physicalBody?.containChildren) {
      obj.physicalBody.containChildren();
    }
    // Also check individual objects
    if (obj.constrainToParentBounds) {
      obj.constrainToParentBounds();
    }
  }
}

document.addEventListener("DOMContentLoaded", initializePhysics);
