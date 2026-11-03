export function setupKeyboardControls(physicalDomObjects, render) {
  let canvasOpacity = Number(render.canvas.style.opacity || 1);

  const handleKeyDown = (e) => {
    if (e.key === "Control") {
      canvasOpacity = canvasOpacity === 1 ? 0 : 1;
      if (render && render.canvas) {
        render.canvas.style.opacity = canvasOpacity;
      }
    }
    if (e.key.toLowerCase() === "k") {
      for (const physicalDomObject of physicalDomObjects) {
        if (typeof physicalDomObject.removeConstraint === "function") {
          physicalDomObject.removeConstraint();
        }
      }
    }
    if (e.key.toLowerCase() === "l") {
      for (const physicalDomObject of physicalDomObjects) {
        if (typeof physicalDomObject.addConstraint === "function") {
          physicalDomObject.addConstraint();
        }
      }
    }
  };
  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}

export function onReload(functionName) {
  let resizeTimeout;
  let lastWidth = window.innerWidth;

  const handleResize = () => {
    // Only trigger if width actually changed (ignore mobile address bar show/hide)
    const currentWidth = window.innerWidth;
    if (currentWidth === lastWidth) {
      return;
    }
    lastWidth = currentWidth;

    // Debounce the resize event
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      functionName();
    }, 250);
  };
  window.addEventListener("resize", handleResize);
  return () => {
    window.removeEventListener("resize", handleResize);
    clearTimeout(resizeTimeout);
  };
}
