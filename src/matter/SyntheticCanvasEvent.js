document.addEventListener(
  "DOMContentLoaded",
  function initializeSyntheticEvents() {
    const interactiveDiv = document.getElementById("root");
    if (!interactiveDiv) {
      console.error("Interactive div not found");
      setTimeout(initializeSyntheticEvents, 100);
      return;
    }

    function createSyntheticCanvasEvent(originalEvent, eventType) {
      if (!window.render || !window.render.canvas) {
        console.warn("Render canvas not available yet");
        return;
      }

      const canvas = window.render.canvas;
      const canvasRect = canvas.getBoundingClientRect();

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

      const canvasX = clientX - canvasRect.left;
      const canvasY = clientY - canvasRect.top;

      let syntheticEvent;

      if (eventType.startsWith("pointer") || eventType.startsWith("touch")) {
        const mappedEventType = eventType.replace("touch", "pointer");
        syntheticEvent = new PointerEvent(mappedEventType, {
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

      const originalPointerEvents = canvas.style.pointerEvents;
      canvas.style.pointerEvents = "auto";
      const eventDispatched = canvas.dispatchEvent(syntheticEvent);
      canvas.style.pointerEvents = originalPointerEvents;
    }

    // Mouse events
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
      { passive: false }
    );

    interactiveDiv.addEventListener(
      "touchmove",
      function (event) {
        event.preventDefault();
        for (let i = 0; i < event.changedTouches.length; i++) {
          const touch = event.changedTouches[i];
          createSyntheticCanvasEvent(touch, "pointermove");
          createSyntheticCanvasEvent(touch, "mousemove");
        }
      },
      { passive: false }
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
      { passive: false }
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

    console.log("Synthetic event listeners initialized");
  }
);
