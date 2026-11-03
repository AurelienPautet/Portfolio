import Matter from "matter-js";

function isTouchingMatterObject(clientX, clientY) {
  if (!window.engine || !window.engine.world) return false;
  clientX += window.scrollX;
  clientY += window.scrollY;
  const bodies = window.engine.world.bodies;
  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i];
    if (body.isStatic) continue;
    if (Matter.Query && Matter.Query.point) {
      const result = Matter.Query.point([body], { x: clientX, y: clientY });
      if (result.length > 0) return true;
    } else {
      const bounds = body.bounds;
      if (
        clientX >= bounds.min.x &&
        clientX <= bounds.max.x &&
        clientY >= bounds.min.y &&
        clientY <= bounds.max.y
      ) {
        return true;
      }
    }
  }
  return false;
}

document.addEventListener(
  "DOMContentLoaded",
  function initializeSyntheticEvents() {
    const interactiveDiv = document.getElementById("root");
    if (!interactiveDiv) {
      setTimeout(initializeSyntheticEvents, 100);
      return;
    }

    function createSyntheticCanvasEvent(originalEvent, eventType) {
      if (!window.render || !window.render.canvas) return;
      const canvas = window.render.canvas;
      // Client coordinates (viewport-relative) are relayed unchanged; Matter's
      // Mouse adds a scroll offset to map them into world coordinates.
      let clientX, clientY;
      if (
        originalEvent.clientX !== undefined &&
        originalEvent.clientY !== undefined
      ) {
        clientX = originalEvent.clientX;
        clientY = originalEvent.clientY;
      } else if (
        originalEvent.pageX !== undefined &&
        originalEvent.pageY !== undefined
      ) {
        clientX = originalEvent.pageX - window.scrollX;
        clientY = originalEvent.pageY - window.scrollY;
      } else {
        clientX = 0;
        clientY = 0;
      }
      let syntheticEvent;
      if (eventType.startsWith("pointer") || eventType.startsWith("touch")) {
        const mappedEventType = eventType.replace("touch", "pointer");
        syntheticEvent = new PointerEvent(mappedEventType, {
          view: window,
          pointerId: originalEvent.pointerId || originalEvent.identifier || 1,
          bubbles: true,
          cancelable: true,
          clientX: clientX,
          clientY: clientY,
          screenX: originalEvent.screenX || clientX,
          screenY: originalEvent.screenY || clientY,
          button: originalEvent.button || 0,
          buttons:
            originalEvent.buttons || (eventType.includes("down") ? 1 : 0),
          ctrlKey: originalEvent.ctrlKey || false,
          shiftKey: originalEvent.shiftKey || false,
          altKey: originalEvent.altKey || false,
          metaKey: originalEvent.metaKey || false,
          pressure: originalEvent.pressure || originalEvent.force || 0.5,
          pointerType: originalEvent.pointerType || "touch",
          width: originalEvent.radiusX || originalEvent.width || 1,
          height: originalEvent.radiusY || originalEvent.height || 1,
        });
      } else {
        syntheticEvent = new MouseEvent(eventType, {
          // Matter reads pageX/Y. Without a view, constructed events lose the
          // window scroll offset even though clientX/Y are correct.
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: clientX,
          clientY: clientY,
          screenX: originalEvent.screenX || clientX,
          screenY: originalEvent.screenY || clientY,
          button: originalEvent.button || 0,
          buttons: originalEvent.buttons || 0,
          ctrlKey: originalEvent.ctrlKey || false,
          shiftKey: originalEvent.shiftKey || false,
          altKey: originalEvent.altKey || false,
          metaKey: originalEvent.metaKey || false,
          relatedTarget: null,
        });
      }
      canvas.dispatchEvent(syntheticEvent);
    }

    interactiveDiv.addEventListener("mousemove", function (event) {
      createSyntheticCanvasEvent(event, "mousemove");
    });

    interactiveDiv.addEventListener("mousedown", function (event) {
      createSyntheticCanvasEvent(event, "mousedown");
    });

    interactiveDiv.addEventListener("mouseup", function (event) {
      createSyntheticCanvasEvent(event, "mouseup");
    });

    interactiveDiv.addEventListener(
      "touchstart",
      function (event) {
        for (let i = 0; i < event.changedTouches.length; i++) {
          const touch = event.changedTouches[i];

          createSyntheticCanvasEvent(touch, "pointerdown");
          createSyntheticCanvasEvent(touch, "mousedown");
        }
      },
      { passive: false },
    );

    interactiveDiv.addEventListener(
      "touchmove",
      function (event) {
        for (let i = 0; i < event.changedTouches.length; i++) {
          const touch = event.changedTouches[i];
          if (isTouchingMatterObject(touch.clientX, touch.clientY)) {
            event.preventDefault();
          }
          createSyntheticCanvasEvent(touch, "pointermove");
          createSyntheticCanvasEvent(touch, "mousemove");
        }
      },
      { passive: false },
    );

    interactiveDiv.addEventListener(
      "touchend",
      function (event) {
        for (let i = 0; i < event.changedTouches.length; i++) {
          const touch = event.changedTouches[i];

          createSyntheticCanvasEvent(touch, "pointerup");
          createSyntheticCanvasEvent(touch, "mouseup");
        }
      },
      { passive: false },
    );

    interactiveDiv.addEventListener("pointerdown", function (event) {
      createSyntheticCanvasEvent(event, "pointerdown");
    });

    interactiveDiv.addEventListener("pointerup", function (event) {
      createSyntheticCanvasEvent(event, "pointerup");
    });

    interactiveDiv.addEventListener("pointermove", function (event) {
      createSyntheticCanvasEvent(event, "pointermove");
    });

    interactiveDiv.addEventListener("pointercancel", function (event) {
      createSyntheticCanvasEvent(event, "pointercancel");
    });

    interactiveDiv.addEventListener("wheel", function (event) {
      createSyntheticCanvasEvent(event, "wheel");
    });
  },
);
