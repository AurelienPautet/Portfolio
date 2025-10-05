import Matter from "matter-js";
import { COLLISION_CATEGORIES, PHYSICS_CONFIG } from "./config";
import { createBoundaries } from "./boundaries";
import { createMouseInteraction } from "./mouseInteraction";
import {
  waitForImages,
  loadPhysicalDomFromHtml,
  createChains,
  initPhysicalDomObjects,
} from "./domLoader";
import { setAbsoluteTransform } from "./transformManager";
import { setupKeyboardControls, setupScrollPhysics } from "./eventHandlers";

const { Engine, Render, Runner, Composite } = Matter;

window.defaultCategory = COLLISION_CATEGORIES.default;
window.wallCategory = COLLISION_CATEGORIES.wall;
window.stickyCategory = COLLISION_CATEGORIES.sticky;

function configureCanvasStyle(canvas, opacity) {
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.zIndex = "1000";
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
  window.scrollTo(0, 0);

  if (!body) {
    console.log("Elements not found, retrying...");
    setTimeout(initializePhysics, 1000);
    return;
  }

  const bodySize = body.getBoundingClientRect();
  const test = document.getElementsByClassName("physical");

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
      background: "transparent",
    },
  });

  window.render = render;
  configureCanvasStyle(render.canvas, 0);

  const { ground, ceiling, leftWall, rightWall } = createBoundaries(bodySize);
  const mouseConstraint = createMouseInteraction(render, window.engine);

  const physicalDomObjects = [];

  waitForImages().then(() => {
    loadPhysicalDomFromHtml(body, physicalDomObjects);
    initPhysicalDomObjects(physicalDomObjects);
    createChains(physicalDomObjects);
  });

  Composite.add(window.engine.world, [
    ground,
    ceiling,
    leftWall,
    rightWall,
    mouseConstraint,
  ]);

  const runner = Runner.create({
    delta: PHYSICS_CONFIG.runnerDelta,
  });

  configureEngine(window.engine);
  Runner.run(runner, window.engine);
  Render.run(render);

  setupKeyboardControls(physicalDomObjects, render);
  setupScrollPhysics(physicalDomObjects);

  function uiLoop() {
    for (const physicalDomObject of physicalDomObjects) {
      physicalDomObject.updateConstraint();
      setAbsoluteTransform(physicalDomObject);
    }
    requestAnimationFrame(uiLoop);
  }
  uiLoop();
}

document.addEventListener("DOMContentLoaded", initializePhysics);
