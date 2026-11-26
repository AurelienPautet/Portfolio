import { toPx } from "./config";

// Viewport-sized canvas on top of the page. It draws the grab line while a body
// is dragged and, in debug mode (Shift), every collider outline and spring.
// When neither is needed it is cleared once and left alone.

export class Overlay {
  constructor() {
    this.canvas = document.createElement("canvas");
    const s = this.canvas.style;
    s.position = "fixed";
    s.top = "0";
    s.left = "0";
    s.zIndex = "9999";
    s.pointerEvents = "none";
    s.opacity = "1";
    document.body.appendChild(this.canvas);
    this.context = this.canvas.getContext("2d");
    this.dirty = false;
    this.resize();
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (this.canvas.width !== w) this.canvas.width = w;
    if (this.canvas.height !== h) this.canvas.height = h;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
  }

  isHidden() {
    return Number(this.canvas.style.opacity) === 0;
  }

  clear() {
    if (!this.dirty) return;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.dirty = false;
  }

  draw(sim, debug) {
    const line = sim.dragLine();
    if ((!debug && !line) || this.isHidden()) {
      this.clear();
      return;
    }
    const ctx = this.context;
    const sx = window.scrollX;
    const sy = window.scrollY;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.strokeStyle = "#ffffff";
    this.dirty = true;

    if (debug) {
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const body of sim.bodies) {
        for (const outline of body.worldOutlines()) {
          outline.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x - sx, p.y - sy);
            else ctx.lineTo(p.x - sx, p.y - sy);
          });
          ctx.closePath();
        }
      }
      ctx.stroke();

      ctx.beginPath();
      const target = { x: 0, y: 0 };
      for (const spring of sim.springs) {
        spring.target(target);
        ctx.moveTo(toPx(target.x) - sx, toPx(target.y) - sy);
        ctx.lineTo(spring.body.x - sx, spring.body.y - sy);
      }
      ctx.stroke();
    }

    if (line) {
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(line.from.x - sx, line.from.y - sy);
      ctx.lineTo(line.to.x - sx, line.to.y - sy);
      ctx.stroke();
    }
  }

  remove() {
    this.canvas.remove();
  }
}
