// Opt-in bounds for a single line of plain text. Leave the layout/line box alone:
// its font box locates the baseline, while Canvas measures the painted glyphs.
export function getTextInkRect(element) {
  if (element.children.length) return null;

  const range = document.createRange();
  range.selectNodeContents(element);
  if (range.getClientRects().length !== 1) return null;

  const textRect = range.getBoundingClientRect();
  const style = getComputedStyle(element);
  const context = document.createElement("canvas").getContext("2d");
  if (!context || !("letterSpacing" in context)) return null;

  context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  context.letterSpacing = style.letterSpacing;
  context.fontKerning = style.fontKerning;
  context.direction = style.direction;

  // innerText includes CSS text-transform (the title is rendered uppercase).
  const metrics = context.measureText(element.innerText.trim());
  const width = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
  const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  if (!Number.isFinite(metrics.fontBoundingBoxAscent) || width <= 0 || height <= 0) {
    return null;
  }

  return {
    left: textRect.left - metrics.actualBoundingBoxLeft,
    top: textRect.top + metrics.fontBoundingBoxAscent - metrics.actualBoundingBoxAscent,
    width,
    height,
  };
}
