// Pointer input for the simulation, read straight from document events.
//
// - Left button / touch on a body: drag it (a spring pulls the grabbed point
//   towards the pointer).
// - Right button held: magnet, free bodies are pulled towards the pointer.
//
// Positions are kept in client coordinates and turned into page coordinates
// when used, so scrolling while dragging keeps the target under the pointer.

export function createInput(getSim, wake) {
  let clientX = 0;
  let clientY = 0;
  let pointerId = null;
  let magnetOn = false;

  const pageX = () => clientX + window.scrollX;
  const pageY = () => clientY + window.scrollY;

  const updateTargets = () => {
    const sim = getSim();
    if (!sim) return;
    if (sim.drag) sim.moveDrag(pageX(), pageY());
    if (magnetOn) sim.setMagnet(pageX(), pageY());
  };

  function onPointerDown(e) {
    clientX = e.clientX;
    clientY = e.clientY;
    const sim = getSim();
    if (!sim) return;
    if (e.button === 2) {
      magnetOn = true;
      sim.setMagnet(pageX(), pageY());
      wake();
      return;
    }
    if (e.button !== 0 || pointerId !== null) return;
    const body = sim.pick(pageX(), pageY());
    if (!body) return;
    pointerId = e.pointerId;
    sim.startDrag(body, pageX(), pageY());
    wake();
  }

  function onPointerMove(e) {
    if (pointerId !== null && e.pointerId !== pointerId) return;
    clientX = e.clientX;
    clientY = e.clientY;
    if (pointerId !== null || magnetOn) {
      updateTargets();
      wake();
    }
  }

  function endDrag(e) {
    if (e && e.button === 2) {
      magnetOn = false;
      getSim()?.clearMagnet();
      return;
    }
    if (e && pointerId !== null && e.pointerId !== pointerId) return;
    pointerId = null;
    getSim()?.endDrag();
  }

  // While a touch drags a body, keep the page from scrolling under it.
  function onTouchMove(e) {
    if (pointerId !== null && e.cancelable) e.preventDefault();
  }

  function onScroll() {
    if (pointerId !== null || magnetOn) updateTargets();
  }

  function reset() {
    pointerId = null;
    magnetOn = false;
    const sim = getSim();
    sim?.endDrag();
    sim?.clearMagnet();
  }

  document.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerup", endDrag);
  document.addEventListener("pointercancel", endDrag);
  document.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("blur", reset);

  return {
    isDragging: () => pointerId !== null,
    reset,
    dispose() {
      reset();
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", endDrag);
      document.removeEventListener("pointercancel", endDrag);
      document.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("blur", reset);
    },
  };
}
