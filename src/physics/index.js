import { PHYSICS_CONFIG } from "./config";
import { createBoundaries } from "./body";
import { loadPhysicalDomFromHtml, initPhysicalDomObjects } from "./domLoader";
import { clearTransforms, hasStaleTransforms, updateTransforms } from "./transformManager";
import { Overlay } from "./overlay";
import { createInput } from "./input";
import { Simulation } from "./simulation";

// Rapier is WebAssembly (~0.9 MB gzipped). It is imported lazily so the page
// renders and becomes usable without waiting for it; physics starts when it
// arrives. If it fails to load, the page simply stays static.
const rapierPromise = import("@dimforge/rapier2d-simd");

let sim = null;
let overlay = null;
let input = null;
let physicalDomObjects = [];
let debugMode = false;
let disposed = false;

// Loop state. The loop stops scheduling frames once the world has been asleep
// for a moment, and any input or state change restarts it.
let frameId = null;
let lastTime = 0;
let accumulator = 0;
let idleFrames = 0;
let lastScrollX = 0;
let lastScrollY = 0;
let hasSticky = false;

function wake() {
  idleFrames = 0;
  if (frameId !== null || disposed || document.hidden || !sim) return;
  lastTime = performance.now();
  accumulator = 0;
  frameId = requestAnimationFrame(loop);
}

function loop(now) {
  frameId = null;
  if (disposed || !sim) return;

  const step = PHYSICS_CONFIG.timestep;
  accumulator += Math.min((now - lastTime) / 1000, step * PHYSICS_CONFIG.maxStepsPerFrame);
  lastTime = now;
  let steps = 0;
  while (accumulator >= step && steps < PHYSICS_CONFIG.maxStepsPerFrame) {
    sim.step();
    accumulator -= step;
    steps++;
  }

  const scrolled = window.scrollX !== lastScrollX || window.scrollY !== lastScrollY;
  lastScrollX = window.scrollX;
  lastScrollY = window.scrollY;
  if (steps > 0 || scrolled) updateTransforms(physicalDomObjects, sim.frame, scrolled);
  overlay.draw(sim, debugMode);

  if (sim.isBusy() || debugMode) idleFrames = 0;
  else idleFrames++;
  if (idleFrames < PHYSICS_CONFIG.idleFramesBeforePause) {
    frameId = requestAnimationFrame(loop);
  }
}

function measureWorldSize() {
  const rect = document.body.getBoundingClientRect();
  const doc = document.documentElement;
  return {
    width: Math.max(rect.width, doc.scrollWidth),
    height: Math.max(rect.height, doc.scrollHeight, document.body.scrollHeight),
  };
}

function build(root) {
  input?.reset();
  // Measure the layout, not the previous simulation's moved elements.
  clearTransforms(physicalDomObjects);
  physicalDomObjects.length = 0;
  sim.reset();

  createBoundaries(sim, measureWorldSize());
  loadPhysicalDomFromHtml(root, physicalDomObjects);
  initPhysicalDomObjects(sim, physicalDomObjects);
  hasSticky = physicalDomObjects.some((o) => o.originalSticky);
  wake();
}

// --- Page-facing API --------------------------------------------------------

function setDebug(enabled = !debugMode) {
  debugMode = enabled;
  console.log(`Debug mode: ${debugMode ? "ON" : "OFF"}`);
  wake();
}

export function changeGravity(scale) {
  if (!sim) return;
  sim.setGravity(scale);
  wake();
}

export function changeTimeScale(scale) {
  if (!sim) return;
  sim.setTimeScale(scale);
  wake();
}

function releaseAll() {
  for (const object of physicalDomObjects) object.removeConstraint();
  wake();
}

function lockAll() {
  for (const object of physicalDomObjects) object.addConstraint();
  wake();
}

// --- Events -----------------------------------------------------------------

function onKeyDown(e) {
  if (e.key === "Shift") setDebug();
  if (e.key === "Control" && overlay) {
    overlay.canvas.style.opacity = overlay.isHidden() ? "1" : "0";
    wake();
  }
  const key = e.key.toLowerCase();
  if (key === "k") releaseAll();
  if (key === "l") lockAll();
}

function onScroll() {
  // Sticky elements follow the viewport, a drag target follows the page, and
  // elements that moved off-screen get their pose once scrolled into view.
  if (hasSticky || input?.isDragging() || hasStaleTransforms()) wake();
}

let resizeTimeout = null;
let lastWidth = window.innerWidth;
function onResize() {
  overlay?.resize();
  // Rebuild only when the width changes (not for a mobile address bar).
  if (window.innerWidth === lastWidth) return;
  lastWidth = window.innerWidth;
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (!disposed && sim) build(document.getElementById("root"));
  }, 250);
}

function onVisibilityChange() {
  if (document.hidden) {
    input?.reset();
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = null;
  } else {
    wake();
  }
}

// --- Lifecycle --------------------------------------------------------------

async function start() {
  const root = document.getElementById("root");
  if (!root || root.getElementsByClassName("physical").length === 0) {
    setTimeout(start, 100);
    return;
  }

  let R;
  try {
    R = await rapierPromise;
    // Only the final font matters for the title's hitbox.
    await document.fonts.ready;
  } catch (error) {
    console.warn("Physics disabled: Rapier failed to load.", error);
    return;
  }
  if (disposed) return;

  sim = new Simulation(R);
  sim.wakeLoop = wake;
  overlay = new Overlay();
  input = createInput(() => sim, wake);
  window.physicalDomObjects = physicalDomObjects;
  window.physics = {
    stats: () => sim.stats(),
    wake,
    releaseAll,
    lockAll,
    setDebug,
    dispose: disposePhysics,
  };

  document.addEventListener("keydown", onKeyDown);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVisibilityChange);

  build(root);
}

function disposePhysics() {
  if (disposed) return;
  disposed = true;
  if (frameId !== null) cancelAnimationFrame(frameId);
  frameId = null;
  clearTimeout(resizeTimeout);
  input?.dispose();
  document.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", onResize);
  document.removeEventListener("visibilitychange", onVisibilityChange);
  clearTransforms(physicalDomObjects);
  overlay?.remove();
  sim?.dispose();
  sim = null;
  window.physicalDomObjects = null;
  window.physics = null;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
