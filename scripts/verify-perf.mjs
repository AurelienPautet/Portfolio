// CLI validation harness (no browser). Exercises the two logic seams that were
// changed — the mouse/engine lifecycle and the transform early-skip — against
// the real Matter.js build and the app's modules.
//
//   bash scripts/verify-perf.sh
import Matter from "matter-js";

// --- Minimal browser globals used by the modules under test -----------------

function makeCanvas() {
  const listeners = {};
  return {
    style: {},
    clientWidth: 1280,
    clientHeight: 800,
    width: 1280,
    height: 800,
    getAttribute() {
      return null;
    },
    getBoundingClientRect() {
      return { left: 0, top: 0, width: 1280, height: 800 };
    },
    addEventListener(type, fn) {
      (listeners[type] ||= []).push(fn);
    },
    removeEventListener(type, fn) {
      const arr = listeners[type] || [];
      const i = arr.indexOf(fn);
      if (i >= 0) arr.splice(i, 1);
    },
    dispatchEvent(event) {
      for (const fn of listeners[event.type] || []) fn(event);
      return true;
    },
    listenerCount(type) {
      return (listeners[type] || []).length;
    },
  };
}

const docListeners = {};
const windowListeners = {};
function removeListener(listeners, type, fn) {
  const items = listeners[type] || [];
  const index = items.indexOf(fn);
  if (index >= 0) items.splice(index, 1);
}
globalThis.window = {
  scrollX: 0,
  scrollY: 0,
  pageXOffset: 0,
  pageYOffset: 0,
  innerWidth: 1280,
  innerHeight: 800,
  addEventListener(type, fn) {
    (windowListeners[type] ||= []).push(fn);
  },
  removeEventListener(type, fn) {
    removeListener(windowListeners, type, fn);
  },
  requestAnimationFrame() {
    return 1;
  },
  cancelAnimationFrame() {},
};
globalThis.document = {
  documentElement: { scrollLeft: 0, scrollTop: 0 },
  body: { scrollLeft: 0, scrollTop: 0, parentNode: null },
  addEventListener(type, fn) {
    (docListeners[type] ||= []).push(fn);
  },
  removeEventListener(type, fn) {
    removeListener(docListeners, type, fn);
  },
};
globalThis.CSS = { supports: () => true };

// --- Imports (after globals are in place) -----------------------------------

const { createMouseInteraction, resetDragState, updateMouseScrollOffset, getMouse, teardownMouseInteraction } =
  await import("../src/matter/mouseInteraction.js");
const { setAbsoluteTransform, beginFrame } = await import(
  "../src/matter/transformManager.js"
);
const { onReload, setupKeyboardControls } = await import("../src/matter/eventHandlers.js");

let failures = 0;
function assert(cond, msg) {
  if (cond) {
    console.log(`  ok  ${msg}`);
  } else {
    failures++;
    console.error(`  FAIL ${msg}`);
  }
}
const flush = () => new Promise((r) => setTimeout(r, 0));

// --- 1. Lifecycle: one Mouse + MouseConstraint across 20 rebuilds -----------

console.log("1. Mouse/MouseConstraint lifecycle");
{
  const canvas = makeCanvas();
  const engine = Matter.Engine.create();
  const render = { canvas };

  let firstConstraint;
  for (let i = 0; i < 20; i++) {
    Matter.Composite.clear(engine.world, false);
    Matter.Engine.clear(engine);
    const c = createMouseInteraction(render, engine);
    Matter.Composite.add(engine.world, c);
    if (i === 0) firstConstraint = c;
    assert(c === firstConstraint, `rebuild ${i}: same MouseConstraint instance`);
  }

  // Matter attaches 7 canvas listeners + 1 engine beforeUpdate callback, once.
  const totalListeners = ["mousemove", "mousedown", "mouseup", "wheel", "touchmove", "touchstart", "touchend"]
    .reduce((sum, t) => sum + canvas.listenerCount(t), 0);
  assert(totalListeners === 7, `canvas listeners constant at 7 (got ${totalListeners})`);

  const beforeUpdateCount = (engine.events?.beforeUpdate || []).length;
  assert(beforeUpdateCount === 1, `engine beforeUpdate callbacks constant at 1 (got ${beforeUpdateCount})`);

  // resetDragState clears in-flight drag.
  const mouse = getMouse();
  mouse.button = 0;
  firstConstraint.body = { id: 1 };
  firstConstraint.constraint.bodyB = { id: 1 };
  resetDragState();
  assert(mouse.button === -1, "resetDragState clears mouse button");
  assert(firstConstraint.body === null, "resetDragState clears dragged body");
  assert(firstConstraint.constraint.bodyB === null, "resetDragState clears constraint.bodyB");
  teardownMouseInteraction();
  assert(canvas.listenerCount("mousemove") === 0, "teardown removes canvas mouse listeners");
  assert(docListeners.mousemove.length === 0 && windowListeners.blur.length === 0,
    "teardown removes document and blur handlers");
  // Engine subscriptions are removed by the owning physics lifecycle.
  Matter.Events.off(engine);
}

// --- 2. Pointer → world coordinate mapping at nonzero scroll -----------------

console.log("2. Pointer → world mapping");
{
  const canvas = makeCanvas();
  const engine = Matter.Engine.create();
  const render = { canvas };
  createMouseInteraction(render, engine);

  window.scrollX = 100;
  window.scrollY = 50;
  window.pageXOffset = 100;
  window.pageYOffset = 50;
  updateMouseScrollOffset();

  const mouse = getMouse();
  // A relayed event carries viewport coords; the browser derives pageX/Y.
  const event = { pageX: 300, pageY: 170, changedTouches: undefined };
  mouse.mousemove(event);
  assert(
    mouse.position.x === 300 && mouse.position.y === 170,
    `world position (${mouse.position.x}, ${mouse.position.y}) equals client + scroll`,
  );

  // Scroll without moving: offset shifts the world position.
  window.scrollY = 200;
  window.pageYOffset = 200;
  updateMouseScrollOffset();
  assert(mouse.position.y === 320, `scroll-only shift re-maps Y (got ${mouse.position.y})`);

  window.scrollX = 0;
  window.scrollY = 0;
  window.pageXOffset = 0;
  window.pageYOffset = 0;
  updateMouseScrollOffset();
}

// --- 3. Transform early-skip: settled skips, sticky/moving-parent don't -----

console.log("3. Transform early-skip");
function fakeBody(opts = {}) {
  return {
    isStatic: !!opts.isStatic,
    isSleeping: !!opts.isSleeping,
    position: opts.position || { x: 0, y: 0 },
    angle: opts.angle || 0,
    velocity: { x: 0, y: 0 },
    angularVelocity: 0,
    bounds: { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } },
  };
}
function fakeObj({ body, sticky = false, parent = null, calls }) {
  return {
    originalSticky: sticky,
    parent,
    initialPos: { x: 100, y: 200 },
    localPos: { x: 100, y: 200 },
    localAngle: 0,
    domElement: { style: {} },
    physicalBody: {
      getCenter() {
        calls.center++;
        return { x: body.position.x, y: body.position.y };
      },
      getAngle() {
        calls.angle++;
        return body.angle;
      },
      bodyData: { body },
    },
  };
}

{
  // Static (settled) object: computed once, then skipped.
  const calls = { center: 0, angle: 0 };
  const body = fakeBody({ isStatic: true, position: { x: 100, y: 200 } });
  const obj = fakeObj({ body, calls });

  beginFrame();
  setAbsoluteTransform(obj);
  await flush();
  assert(calls.center === 1, "settled object computed once (frame 1)");

  beginFrame();
  setAbsoluteTransform(obj);
  await flush();
  assert(calls.center === 1, "settled object skipped on frame 2 (no getCenter)");

  body.position.x += 25;
  beginFrame();
  setAbsoluteTransform(obj);
  await flush();
  assert(calls.center === 2 && obj.domElement.style.translate === "25px 0px",
    "explicitly repositioned static object redraws its transform");
}

{
  const calls = { center: 0, angle: 0 };
  const parentBody = fakeBody({ isStatic: true });
  const parent = fakeObj({ body: parentBody, calls: { center: 0, angle: 0 } });
  const child = fakeObj({ body: fakeBody({ isSleeping: true }), parent, calls });
  beginFrame();
  setAbsoluteTransform(parent);
  setAbsoluteTransform(child);
  parentBody.position.x += 20;
  beginFrame();
  setAbsoluteTransform(parent);
  setAbsoluteTransform(child);
  await flush();
  assert(calls.center === 2, "repositioned static parent invalidates sleeping child");
  parent.originalSticky = true;
  beginFrame();
  setAbsoluteTransform(child);
  await flush();
  assert(calls.center === 3, "sticky ancestors keep sleeping children synchronized");
}

{
  // Sticky object: never skipped (scroll-dependent).
  const calls = { center: 0, angle: 0 };
  const body = fakeBody({ isStatic: true, position: { x: 100, y: 200 } });
  const obj = fakeObj({ body, sticky: true, calls });

  beginFrame();
  setAbsoluteTransform(obj);
  beginFrame();
  setAbsoluteTransform(obj);
  await flush();
  assert(calls.center === 2, "sticky object recomputes every frame");
}

{
  // Sleeping child of a moving parent: not skipped.
  const calls = { center: 0, angle: 0 };
  const parentBody = fakeBody({ isStatic: false, isSleeping: false, position: { x: 0, y: 0 } });
  const parentObj = fakeObj({ body: parentBody, calls: { center: 0, angle: 0 } });
  const childBody = fakeBody({ isStatic: true, isSleeping: true, position: { x: 100, y: 200 } });
  const childObj = fakeObj({ body: childBody, parent: parentObj, calls });

  beginFrame();
  setAbsoluteTransform(childObj);
  await flush();
  assert(calls.center === 1, "child of moving parent computed on frame 1");
  beginFrame();
  setAbsoluteTransform(childObj);
  await flush();
  assert(calls.center === 2, "child of moving parent not frozen on frame 2");
}

console.log("4. Keyboard and resize lifecycle");
{
  const canvas = makeCanvas();
  canvas.style.opacity = "1";
  const removeKeys = setupKeyboardControls([], { canvas });
  docListeners.keydown[0]({ key: "Control" });
  assert(Number(canvas.style.opacity) === 0, "Control hides an initially visible canvas");
  docListeners.keydown[0]({ key: "Control" });
  assert(Number(canvas.style.opacity) === 1, "Control restores canvas visibility");
  removeKeys();
  assert(docListeners.keydown.length === 0, "keyboard cleanup removes handlers");

  let rebuilds = 0;
  const removeResize = onReload(() => rebuilds++);
  window.innerWidth = 800;
  windowListeners.resize[0]();
  removeResize();
  await new Promise((resolve) => setTimeout(resolve, 300));
  assert(rebuilds === 0 && windowListeners.resize.length === 0,
    "resize cleanup cancels pending rebuild and removes handler");
}

console.log("5. Physics startup, rebuild and disposal");
{
  teardownMouseInteraction();
  const queuedFrames = new Map();
  let nextFrame = 1;
  globalThis.requestAnimationFrame = (callback) => {
    const id = nextFrame++;
    queuedFrames.set(id, callback);
    return id;
  };
  globalThis.cancelAnimationFrame = (id) => queuedFrames.delete(id);
  const canvas = makeCanvas();
  let removed = false;
  canvas.remove = () => { removed = true; };
  const oldCreate = Matter.Render.create;
  const oldRun = Matter.Runner.run;
  const oldStop = Matter.Runner.stop;
  Matter.Render.create = ({ engine, options }) => ({
    canvas, engine, options,
    bounds: { min: {}, max: {} },
    context: { clearRect() {} },
  });
  Matter.Runner.run = () => {};
  Matter.Runner.stop = () => {};
  window.innerWidth = 1280;
  window.innerHeight = 800;
  document.documentElement.scrollWidth = 1280;
  document.documentElement.scrollHeight = 3000;
  document.body.scrollHeight = 3000;
  document.body.getBoundingClientRect = () => ({
    width: window.innerWidth, height: document.body.scrollHeight,
  });
  const node = {
    children: [], dataset: {}, style: {},
    classList: { contains: (name) => ["physical", "nonconstrained"].includes(name) },
    getBoundingClientRect: () => ({
      left: 10 + (parseFloat(node.style.translate) || 0),
      top: 100, width: 40, height: 30,
    }),
  };
  const root = {
    children: [node], classList: { contains: () => false },
  };
  const element = (classes, rect, children = []) => ({
    children, dataset: {}, style: {},
    classList: { contains: (name) => classes.split(" ").includes(name) },
    getBoundingClientRect: () => rect,
  });
  const dimensions = [[80,80,true],[64,80],[64,80],[64,80],[60,40,true],
    [64,80],[64,80],[96,40],[60,60,true],[60,60,true],[60,60,true],
    [60,60],[60,60,true],[60,60,true]];
  const logos = dimensions.map(([width, height, circle], i) => element(
    `physical nonconstrained${circle ? " circle" : ""}`,
    { left: 464 + (i % 3) * 112, top: 740 + Math.floor(i / 3) * 112, width, height },
  ));
  root.children.push(element("physical static",
    { left: 400, top: 600, width: 434, height: 626 }, logos));
  root.children.push(element("physical circle", { left: 0, top: 0, width: 0, height: 0 }));
  root.children.push(element("physical", { left: 240, top: 15000, width: 8, height: 0 }));
  globalThis.parent = null;
  document.getElementsByClassName = () => [node];
  document.getElementById = () => root;
  document.fonts = { ready: Promise.resolve() };
  document.hidden = false;
  await import("../src/matter/index.js");
  docListeners.DOMContentLoaded[0]();
  await flush();
  assert(window.engine.world.bodies.length === 20,
    "startup creates physical objects and four world boundaries without image loading");
  assert(window.physicalDomObjects.every((obj) =>
    obj.initialSize.width > 0 && obj.initialSize.height > 0),
    "hidden decorations and empty line boxes never create zero-area bodies");
  assert(canvas.width === 1280 && canvas.height === 800,
    "startup canvas is viewport-sized, independent of document height");
  const originalEngine = window.engine;
  const callbackCount = originalEngine.events.beforeUpdate.length;

  const skills = window.physicalDomObjects.find((o) => o.originalStatic);
  const skillBodies = skills.physicalBody.childBodies;
  const boxBody = skills.physicalBody.bodyData.body;
  assert(boxBody.parts.every((part) => part.isStatic && part.inverseMass === 0 &&
    part.inverseInertia === 0), "locked compound walls have consistent static mass/inertia");
  const backgroundBodies = Array.from({ length: 200 }, (_, i) =>
    Matter.Bodies.rectangle(1100 + (i % 10) * 12, 1500 + Math.floor(i / 10) * 12, 8, 8));
  Matter.Composite.add(window.engine.world, backgroundBodies);
  let escapes = 0;
  for (let frame = 0; frame < 360; frame++) {
    // Sustained outward force stresses the same wall-crossing failure as a
    // heavy falling pile or the magnet, with the app's actual velocity clamp.
    for (const body of skillBodies) {
      Matter.Body.applyForce(body, body.position, { x: 0, y: body.mass * 0.015 });
    }
    Matter.Engine.update(window.engine, 1000 / 60);
    for (const body of skillBodies) {
      if (body.vertices.some((vertex) =>
        vertex.x < boxBody.position.x - 217 - 0.1 ||
        vertex.x > boxBody.position.x + 217 + 0.1 ||
        vertex.y < boxBody.position.y - 313 - 0.1 ||
        vertex.y > boxBody.position.y + 313 + 0.1)) escapes++;
    }
  }
  assert(escapes === 0, `falling skills stay inside locked box under load (${escapes} escapes)`);

  const angle = Math.PI / 6, cos = Math.cos(angle), sin = Math.sin(angle);
  Matter.Body.setAngle(boxBody, angle);
  const wideLogo = skillBodies[7];
  Matter.Body.setAngle(wideLogo, angle + 0.4);
  Matter.Body.setPosition(wideLogo, {
    x: boxBody.position.x + cos * 210, y: boxBody.position.y + sin * 210,
  });
  Matter.Body.setVelocity(wideLogo, { x: cos * 6 - sin * 3, y: sin * 6 + cos * 3 });
  skills.physicalBody.containChildren();
  const frameBounds = skills.physicalBody.containmentFrame();
  assert(wideLogo.vertices.every((vertex) => {
    const dx = vertex.x - boxBody.position.x, dy = vertex.y - boxBody.position.y;
    return Math.abs(dx * cos + dy * sin) <= frameBounds.halfWidth + 1e-8 &&
      Math.abs(-dx * sin + dy * cos) <= frameBounds.halfHeight + 1e-8;
  }), "rotated box contains the entire rotated logo, not only its centre");
  const velocity = Matter.Body.getVelocity(wideLogo);
  assert(Math.abs(velocity.x * cos + velocity.y * sin) < 1e-8 &&
    Math.abs(-velocity.x * sin + velocity.y * cos - 3) < 1e-8,
    "containment preserves tangential velocity and removes outward velocity only");

  for (const fn of docListeners.keydown) fn({ key: "k" });
  assert(boxBody.parts.every((part) => !part.isStatic && part.inverseMass > 0),
    "release restores dynamic mass to every compound part");
  assert(window.engine.world.bodies.every((body) =>
    [body.position.x, body.position.y, body.angle].every(Number.isFinite)),
    "full release keeps the entire world finite");
  const released = skillBodies[0];
  Matter.Body.setPosition(released, { x: boxBody.position.x, y: boxBody.position.y + 600 });
  Matter.Engine.update(window.engine, 1000 / 60);
  assert(released.position.y - boxBody.position.y > 500,
    "released skill box no longer confines its children");
  for (const fn of docListeners.keydown) fn({ key: "l" });
  assert(boxBody.parts.every((part) => part.isStatic && part.inverseMass === 0),
    "relocking restores consistent static compound walls");

  node.style.translate = "30px 0px";
  window.innerWidth = 800;
  window.innerHeight = 844;
  document.documentElement.scrollWidth = 800;
  document.documentElement.scrollHeight = 5000;
  document.body.scrollHeight = 5000;
  for (const fn of [...windowListeners.resize]) fn();
  await new Promise((resolve) => setTimeout(resolve, 300));
  assert(window.engine === originalEngine && window.engine.events.beforeUpdate.length === callbackCount,
    "resize rebuild keeps engine and callback count constant");
  assert(canvas.width === 800 && canvas.height === 844,
    "resize refreshes viewport canvas dimensions");
  assert(window.physicalDomObjects[0].initialPos.x === 30,
    "resize measures layout after removing previous physics translation");
  assert(window.engine.world.bodies.some((body) => body.isStatic && body.position.x === 1048) &&
    window.engine.world.bodies.some((body) => body.isStatic && body.position.y === 5248),
    "resize refreshes world width and document-height boundaries");

  const dispose = window.disposePhysics;
  dispose();
  dispose();
  assert(removed && queuedFrames.size === 0 && window.engine === null,
    "disposal removes overlay, cancels frames and is idempotent");
  assert(["resize", "scroll", "blur"].every((type) => (windowListeners[type] || []).length === 0) &&
    ["keydown", "mousedown", "mousemove", "mouseup", "visibilitychange", "DOMContentLoaded"]
      .every((type) => (docListeners[type] || []).length === 0),
    "disposal removes lifecycle and interaction listeners");
  Matter.Render.create = oldCreate;
  Matter.Runner.run = oldRun;
  Matter.Runner.stop = oldStop;
}

console.log("6. Actual event relay selects objects after scrolling");
{
  // Matches browser-observed constructor behavior: without a view, synthetic
  // pageX/Y equal clientX/Y; with a view they include that window's scroll.
  class BrowserMouseEvent {
    constructor(type, options = {}) {
      this.type = type;
      Object.assign(this, options);
      this.clientX = options.clientX || 0;
      this.clientY = options.clientY || 0;
      this.view = options.view || null;
    }
    get pageX() { return this.clientX + (this.view?.scrollX || 0); }
    get pageY() { return this.clientY + (this.view?.scrollY || 0); }
  }
  globalThis.MouseEvent = BrowserMouseEvent;
  globalThis.PointerEvent = BrowserMouseEvent;
  const root = makeCanvas();
  document.getElementById = () => root;
  await import("../src/matter/SyntheticCanvasEvent.js");
  docListeners.DOMContentLoaded[0]();

  for (const scrollY of [0, 1000]) {
    window.scrollY = window.pageYOffset = scrollY;
    const canvas = makeCanvas();
    const engine = Matter.Engine.create();
    window.render = { canvas };
    window.engine = engine;
    const interaction = createMouseInteraction(window.render, engine);
    const body = Matter.Bodies.rectangle(300, scrollY + 400, 60, 60);
    Matter.Composite.add(engine.world, [body, interaction]);

    for (const input of ["mouse", "touch"]) {
      resetDragState();
      const point = { clientX: 300, clientY: 400 };
      let pointerPageY;
      const capture = (event) => { pointerPageY = event.pageY; };
      canvas.addEventListener("pointerdown", capture);
      if (input === "mouse") {
        root.dispatchEvent(new MouseEvent("mousedown", {
          ...point, button: 0, buttons: 1, bubbles: true, view: window,
        }));
      } else {
        root.dispatchEvent({ type: "touchstart", changedTouches: [point] });
      }
      Matter.Engine.update(engine, 1000 / 60);
      assert(interaction.body === body,
        `${input} relay selects intended body at scrollY=${scrollY}`);
      assert(getMouse().position.y === scrollY + 400,
        `${input} relay keeps pointer in document coordinates at scrollY=${scrollY}`);
      if (input === "touch") {
        assert(pointerPageY === scrollY + 400,
          `pointer relay preserves window scroll at scrollY=${scrollY}`);
      }
      if (input === "mouse") {
        root.dispatchEvent(new MouseEvent("mouseup", { ...point, view: window }));
      } else {
        root.dispatchEvent({ type: "touchend", changedTouches: [point] });
      }
      Matter.Engine.update(engine, 1000 / 60);
      assert(interaction.body === null, `${input} release clears grabbed body`);
      canvas.removeEventListener("pointerdown", capture);
      Matter.Body.setPosition(body, { x: 300, y: scrollY + 400 });
    }
    teardownMouseInteraction();
    Matter.Events.off(engine);
  }
}

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
