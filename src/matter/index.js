import Matter from "matter-js";
import { COLLISION_CATEGORIES, PHYSICS_CONFIG } from "./config";
import { createBoundaries } from "./boundaries";
import {
  createMouseInteraction,
  resetDragState,
  updateMouseScrollOffset,
  isMouseDragging,
  applyMagneticAttraction,
  teardownMouseInteraction,
} from "./mouseInteraction";
import {
  loadPhysicalDomFromHtml,
  createChains,
  initPhysicalDomObjects,
} from "./domLoader";
import { setAbsoluteTransform, beginFrame } from "./transformManager";
import { onReload, setupKeyboardControls } from "./eventHandlers";

const { Engine, Render, Runner, Composite, Body } = Matter;

// Rebuilt with the world; only containers with loose children need this pass.
let containmentBoxes = [];

// Conditional render loop state (the canvas is only drawn while dragging or in
// debug mode; the engine itself keeps running).
let renderLoopActive = false;
let renderFrameId = null;
let lastViewportWidth = 0;
let lastViewportHeight = 0;
let visibilityPaused = false;
let disposed = false;
let uiFrameId = null;
let initializationTimeoutId = null;
let removeKeyboardControls = null;
let removeReloadListener = null;

function clampVelocities(engine) {
  const maxVelocity = PHYSICS_CONFIG.maxVelocity;
  const maxVelocitySq = maxVelocity * maxVelocity;
  const maxAngularVelocity = PHYSICS_CONFIG.maxAngularVelocity;
  const bodies = Composite.allBodies(engine.world);

  for (const body of bodies) {
    if (body.isStatic || body.isSleeping) continue;

    const velocity = body.velocity;
    const speedSq = velocity.x * velocity.x + velocity.y * velocity.y;

    if (speedSq > maxVelocitySq) {
      const speed = Math.sqrt(speedSq);
      const scale = maxVelocity / speed;
      Body.setVelocity(body, {
        x: velocity.x * scale,
        y: velocity.y * scale,
      });
    }

    const angularVelocity = body.angularVelocity;
    if (Math.abs(angularVelocity) > maxAngularVelocity) {
      Body.setAngularVelocity(
        body,
        Math.sign(angularVelocity) * maxAngularVelocity,
      );
    }
  }
}

window.defaultCategory = COLLISION_CATEGORIES.default;
window.wallCategory = COLLISION_CATEGORIES.wall;
window.stickyCategory = COLLISION_CATEGORIES.sticky;
window.debugMode = false;

function toggleDebugMode(enabled = !window.debugMode) {
  window.debugMode = enabled;

  if (window.render) {
    window.render.options.background = "transparent";
    window.render.options.showConstraints = true;
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

  updateRenderState();
  console.log(`Debug mode: ${window.debugMode ? "ON" : "OFF"}`);
}

// Viewport-sized, fixed overlay (not a document-sized canvas). Pointer events
// are relayed programmatically, so the canvas never needs to receive them.
function configureCanvasStyle(canvas, opacity) {
  canvas.style.position = "fixed";
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

// Fresh document/world measurements, read on every rebuild (resize) instead of
// reusing the initial body rect.
function measureWorldSize() {
  const rect = document.body.getBoundingClientRect();
  const doc = document.documentElement;
  return {
    width: Math.max(rect.width, doc.scrollWidth),
    height: Math.max(rect.height, doc.scrollHeight, document.body.scrollHeight),
  };
}

// Keeps the renderer view aligned with the scroll position and the canvas sized
// to the viewport. The `render.bounds` translate world → viewport coordinates.
function updateRenderBounds() {
  const render = window.render;
  if (!render) return;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (vw !== lastViewportWidth || vh !== lastViewportHeight) {
    lastViewportWidth = vw;
    lastViewportHeight = vh;
    render.options.width = vw;
    render.options.height = vh;
    render.canvas.width = vw;
    render.canvas.height = vh;
    render.canvas.style.width = vw + "px";
    render.canvas.style.height = vh + "px";
  }

  render.options.hasBounds = true;
  render.bounds.min.x = window.scrollX;
  render.bounds.min.y = window.scrollY;
  render.bounds.max.x = window.scrollX + vw;
  render.bounds.max.y = window.scrollY + vh;
}

function clearCanvas() {
  const render = window.render;
  if (!render) return;
  render.context.clearRect(0, 0, render.canvas.width, render.canvas.height);
}

function renderLoop() {
  renderFrameId = requestAnimationFrame(renderLoop);
  updateRenderBounds();
  Matter.Render.world(window.render);
}

function startRenderLoop() {
  if (renderLoopActive) return;
  renderLoopActive = true;
  renderFrameId = requestAnimationFrame(renderLoop);
}

function stopRenderLoop() {
  if (!renderLoopActive) return;
  renderLoopActive = false;
  if (renderFrameId !== null) {
    cancelAnimationFrame(renderFrameId);
    renderFrameId = null;
  }
  clearCanvas();
}

function shouldRender() {
  return Number(window.render?.canvas.style.opacity) !== 0 &&
    (window.debugMode || isMouseDragging());
}

function updateRenderState() {
  if (disposed || visibilityPaused) return;
  if (shouldRender()) {
    startRenderLoop();
  } else {
    stopRenderLoop();
  }
}

function initializePhysics() {
  if (disposed || window.engine) return;
  const body = document.body;

  if (!body) {
    console.log("Elements not found, retrying...");
    initializationTimeoutId = setTimeout(initializePhysics, 1000);
    return;
  }

  const test = document.getElementsByClassName("physical");
  const root = document.getElementById("root");

  if (test.length === 0) {
    console.log("Physical elements not found, retrying...");
    initializationTimeoutId = setTimeout(initializePhysics, 100);
    return;
  }

  window.engine = Engine.create();
  configureEngine(window.engine);

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const render = Render.create({
    element: document.body,
    engine: window.engine,
    options: {
      width: viewportWidth,
      height: viewportHeight,
      wireframes: false,
      showConstraints: true,
      background: "transparent",
      pixelRatio: 1,
    },
  });

  window.render = render;
  configureCanvasStyle(render.canvas, 1);
  updateRenderBounds();

  const physicalDomObjects = [];
  window.physicalDomObjects = physicalDomObjects;

  const runner = Runner.create({
    delta: PHYSICS_CONFIG.runnerDelta,
    maxFrameTime: PHYSICS_CONFIG.runnerMaxFrameTime,
    maxUpdates: PHYSICS_CONFIG.runnerMaxUpdates,
  });
  window.runner = runner;

  // Add velocity limiting before each update (registered once, for the engine
  // lifetime — never inside a rebuild).
  Matter.Events.on(window.engine, "beforeUpdate", function () {
    clampVelocities(window.engine);
  });
  Matter.Events.on(window.engine, "afterUpdate", maintainContainment);

  Runner.run(runner, window.engine);

  removeKeyboardControls = setupKeyboardControls(physicalDomObjects, render);

  document.addEventListener("keydown", handleDebugKey);
  window.addEventListener("scroll", handleScroll);
  window.addEventListener("resize", handleViewportResize);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Only the final font matters for the title hitbox; image geometry comes from
  // reserved intrinsic dimensions (width/height), not from load completion.
  document.fonts.ready.then(() => {
    if (disposed) return;
    loadPhysics(root, physicalDomObjects);
    // Start listening for width changes once the initial world is built.
    removeReloadListener = onReload(() => {
      if (disposed || !window.engine) return;
      loadPhysics(root, physicalDomObjects);
    });
  });

  startUiLoop(physicalDomObjects);

  // Expose an explicit teardown for diagnostics/lifecycle correctness.
  window.disposePhysics = disposePhysics;
}

function loadPhysics(root, physicalDomObjects) {
  console.log("Reloading physics...");

  // Drop any in-flight drag before tearing the world down.
  resetDragState();

  // Measure the new layout, not the old simulation's translated/rotated boxes.
  for (const obj of physicalDomObjects) {
    const style = obj.domElement.style;
    if (CSS.supports("translate", "0px")) {
      style.translate = "";
      style.rotate = "";
    } else {
      style.transform = "";
    }
    style.willChange = "auto";
  }
  physicalDomObjects.length = 0;
  Matter.Composite.clear(window.engine.world, false);
  Matter.Engine.clear(window.engine);

  const bodySize = measureWorldSize();
  const { ground, ceiling, leftWall, rightWall } = createBoundaries(bodySize);

  // Singleton mouse + mouse constraint: reused across every rebuild so canvas
  // listeners and engine callbacks do not accumulate.
  const mouseConstraint = createMouseInteraction(window.render, window.engine);

  loadPhysicalDomFromHtml(root, physicalDomObjects);
  initPhysicalDomObjects(physicalDomObjects);
  createChains(physicalDomObjects);
  containmentBoxes = physicalDomObjects.map((obj) => obj.physicalBody)
    .filter((body) => body.childBodies?.length > 0);

  Composite.add(window.engine.world, [
    ground,
    ceiling,
    leftWall,
    rightWall,
    mouseConstraint,
  ]);

  if (window.debugMode) toggleDebugMode(true);

  maintainContainment();
}

// Run after every physics step, not on a delayed timer or the display's frame rate.
function maintainContainment() {
  for (const box of containmentBoxes) box.containChildren();
}

function startUiLoop(physicalDomObjects) {
  function uiLoop() {
    if (!disposed) {
      if (!document.hidden) {
        beginFrame();
        applyMagneticAttraction(physicalDomObjects);
        for (const physicalDomObject of physicalDomObjects) {
          physicalDomObject.updateConstraint();
          setAbsoluteTransform(physicalDomObject);
        }
        updateRenderState();
      }
      uiFrameId = requestAnimationFrame(uiLoop);
    }
  }
  uiFrameId = requestAnimationFrame(uiLoop);
}

function handleDebugKey(e) {
  if (e.key === "Shift") {
    toggleDebugMode();
  }
}

function handleScroll() {
  updateMouseScrollOffset();
}

function handleViewportResize() {
  updateRenderBounds();
  updateMouseScrollOffset();
}

function handleVisibilityChange() {
  visibilityPaused = document.hidden;
  if (window.runner) {
    window.runner.enabled = !visibilityPaused;
  }
  if (visibilityPaused) {
    resetDragState();
    stopRenderLoop();
  } else {
    updateRenderState();
  }
}

function disposePhysics() {
  if (disposed) return;
  disposed = true;

  stopRenderLoop();
  cancelAnimationFrame(uiFrameId);
  clearTimeout(initializationTimeoutId);
  removeKeyboardControls?.();
  removeReloadListener?.();
  containmentBoxes = [];
  if (window.runner) {
    Runner.stop(window.runner);
  }
  teardownMouseInteraction();
  if (window.engine) {
    Matter.Events.off(window.engine);
    Composite.clear(window.engine.world, false);
    Engine.clear(window.engine);
  }
  window.render?.canvas.remove();

  document.removeEventListener("DOMContentLoaded", initializePhysics);
  document.removeEventListener("keydown", handleDebugKey);
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("resize", handleViewportResize);
  document.removeEventListener("visibilitychange", handleVisibilityChange);

  window.engine = null;
  window.render = null;
  window.runner = null;
  window.physicalDomObjects = null;
  window.disposePhysics = null;
}

document.addEventListener("DOMContentLoaded", initializePhysics);
