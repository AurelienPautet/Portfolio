// Behaviour checks for the physics layer, run in a real browser against a
// served build:
//
//   pnpm build && pnpm exec vite preview --port 5199 &
//   node scripts/verify-physics.mjs http://localhost:5199/
//
// Exits non-zero if any check fails. Uses the installed Google Chrome
// (BENCH_CHANNEL=chromium for Playwright's own build).
import { chromium } from "playwright";

const url = process.argv[2] || "http://localhost:5199/";
const channel = process.env.BENCH_CHANNEL || "chrome";
const browser = await chromium.launch(channel === "chromium" ? {} : { channel });

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
}

const stats = (page) => page.evaluate(() => window.physics.stats());
const awake = async (page) => (await stats(page)).awake;

async function open(options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...options });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    // Google Analytics requests fail on localhost; they are not ours to check.
    if (m.type() === "error" && !m.location().url.includes("google")) errors.push(m.text());
  });
  await page.goto(url, { waitUntil: "load" });
  await page.waitForFunction(() => window.physics?.stats, null, { timeout: 30000 });
  return { page, context, errors };
}

async function waitAsleep(page, ms = 8000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if ((await awake(page)) === 0) return true;
    await page.waitForTimeout(250);
  }
  return false;
}

const center = (box) => ({ x: box.x + box.width / 2, y: box.y + box.height / 2 });

// 1. Startup: held elements start asleep; free bodies settle and sleep.
{
  const { page, context, errors } = await open();
  const s = await stats(page);
  check("bodies created", s.dynamic > 200, `${s.dynamic} dynamic bodies`);
  check("whole page asleep after settling", await waitAsleep(page, 10000));
  const moved = await page.evaluate(() =>
    window.physicalDomObjects.filter((o) => !o.isFree && o.domElement.style.transform &&
      o.domElement.style.transform !== "translate(0px,0px)" &&
      o.domElement.style.transform !== "translate(0px, 0px)").length);
  check("held elements stay exactly in place at startup", moved === 0, `${moved} moved`);

  // 2. Drag a held word: it follows, then returns exactly and sleeps.
  const word = page.locator("#home .physical", { hasText: "freelancing" }).first();
  const start = center(await word.boundingBox());
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  for (let i = 1; i <= 15; i++) {
    await page.mouse.move(start.x + i * 12, start.y + i * 10);
    await page.waitForTimeout(16);
  }
  await page.waitForTimeout(400);
  const held = center(await word.boundingBox());
  const travel = Math.hypot(held.x - start.x, held.y - start.y);
  check("held word follows a drag", travel > 40 && travel < 200, `${Math.round(travel)} px of 234`);
  await page.mouse.up();
  check("everything asleep again after the drag", await waitAsleep(page));
  const back = center(await word.boundingBox());
  const error = Math.hypot(back.x - start.x, back.y - start.y);
  check("held word returns to its place", error < 0.5, `${error.toFixed(2)} px off`);

  // 3. Throw a skill logo: it stays inside the skills box.
  const logo = page.locator('#skills img[alt="React Logo"]');
  await logo.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const l = center(await logo.boundingBox());
  await page.mouse.move(l.x, l.y);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) {
    await page.mouse.move(l.x - i * 60, l.y - i * 80);
    await page.waitForTimeout(16);
  }
  await page.mouse.up();
  await waitAsleep(page);
  const inside = await page.evaluate(() => {
    const box = document.querySelector("#skills .blueprint-box").getBoundingClientRect();
    const logos = [...document.querySelectorAll("#skills .nonconstrained")];
    return logos.filter((el) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      return cx > box.left && cx < box.right && cy > box.top && cy < box.bottom;
    }).length + "/" + logos.length;
  });
  const [n, total] = inside.split("/").map(Number);
  check("thrown logos stay inside the skills box", n === total, inside);

  // 4. "NO": every body is released, falls, and the page goes back to sleep.
  await page.evaluate(() => document.getElementById("hire-me").scrollIntoView({ block: "center" }));
  await page.waitForTimeout(300);
  await page.locator("#hire-me button", { hasText: "NO" }).click();
  await page.waitForTimeout(1000);
  const released = await stats(page);
  check("NO releases every body", released.awake >= released.dynamic - 5, `${released.awake}/${released.dynamic} awake`);
  check("released pile settles and sleeps", await waitAsleep(page, 30000));
  check("no console errors (desktop)", errors.length === 0, errors.slice(0, 2).join(" | "));
  await context.close();
}

// 5. Touch: dragging a word with a finger moves it and does not scroll the page.
{
  const { page, context, errors } = await open({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  await waitAsleep(page, 10000);
  await page.waitForTimeout(500);
  const word = page.locator("#home .physical", { hasText: "Lyter" }).first();
  const start = center(await word.boundingBox());
  const cdp = await context.newCDPSession(page);
  const touch = (type, x, y) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }],
    });
  const scrollBefore = await page.evaluate(() => window.scrollY);
  await touch("touchStart", start.x, start.y);
  for (let i = 1; i <= 12; i++) {
    await touch("touchMove", start.x - i * 4, start.y + i * 12);
    await page.waitForTimeout(16);
  }
  await page.waitForTimeout(300);
  const during = center(await word.boundingBox());
  const scrollDuring = await page.evaluate(() => window.scrollY);
  await touch("touchEnd", 0, 0);
  check("touch drag moves the word", Math.hypot(during.x - start.x, during.y - start.y) > 20);
  check("touch drag does not scroll the page", scrollDuring === scrollBefore, `scrollY ${scrollBefore} → ${scrollDuring}`);
  check("asleep after the touch drag", await waitAsleep(page));
  check("no console errors (touch)", errors.length === 0, errors.slice(0, 2).join(" | "));
  await context.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
