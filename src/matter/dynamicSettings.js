import Matter from "matter-js";

function changeGravity(gravity) {
  if (window.engine && window.engine.world) {
    window.engine.world.gravity.y = gravity;
  }
}

function changeTimeScale(timeScale) {
  if (window.engine) {
    window.engine.timing.timeScale = timeScale;
  }
}

export { changeGravity, changeTimeScale };
