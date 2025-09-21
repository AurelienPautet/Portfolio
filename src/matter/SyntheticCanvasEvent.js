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
      // Check if render is available
      if (!window.render || !window.render.canvas) {
        console.warn("Render canvas not available yet");
        return;
      }

      let syntheticEvent;
      if (eventType.startsWith("pointer")) {
        syntheticEvent = new PointerEvent(eventType, {
          pointerId: originalEvent.pointerId || 1,
          bubbles: true,
          cancelable: true,
          clientX: originalEvent.clientX + window.scrollX,
          clientY: originalEvent.clientY + window.scrollY,
          screenX: originalEvent.screenX + window.scrollX,
          screenY: originalEvent.screenY + window.scrollY,
          button: originalEvent.button,
          buttons: originalEvent.buttons,
          ctrlKey: originalEvent.ctrlKey,
          shiftKey: originalEvent.shiftKey,
          altKey: originalEvent.altKey,
          metaKey: originalEvent.metaKey,
          pressure: originalEvent.pressure || 0.5,
          pointerType: originalEvent.pointerType || "mouse",
        });
      } else {
        syntheticEvent = new MouseEvent(eventType, {
          bubbles: true,
          cancelable: true,
          clientX: originalEvent.clientX + window.scrollX,
          clientY: originalEvent.clientY + window.scrollY,
          screenX: originalEvent.screenX + window.scrollX,
          screenY: originalEvent.screenY + window.scrollY,
          button: originalEvent.button,
          buttons: originalEvent.buttons,
          ctrlKey: originalEvent.ctrlKey,
          shiftKey: originalEvent.shiftKey,
          altKey: originalEvent.altKey,
          metaKey: originalEvent.metaKey,
          relatedTarget: null,
        });
      }

      const originalPointerEvents = window.render.canvas.style.pointerEvents;
      window.render.canvas.style.pointerEvents = "auto";
      window.render.canvas.dispatchEvent(syntheticEvent);
      window.render.canvas.style.pointerEvents = originalPointerEvents;
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

    interactiveDiv.addEventListener("click", function (event) {
      createSyntheticCanvasEvent(event, "click");
    });

    interactiveDiv.addEventListener("dblclick", function (event) {
      createSyntheticCanvasEvent(event, "dblclick");
    });

    interactiveDiv.addEventListener("contextmenu", function (event) {
      createSyntheticCanvasEvent(event, "contextmenu");
    });

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
  }
);
