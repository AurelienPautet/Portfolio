// Physics/rendering benchmark, run against a served build:
//
//   pnpm build && pnpm exec vite preview --port 5199 &
//   node scripts/bench-physics.mjs http://localhost:5199/ [runs]
//
// For each profile (desktop, and a 390px viewport with the CPU slowed 4x) it
// records three 3-second windows: idle at the top of the page (10 s after load),
// right after the
// "NO" button of the hire-me section releases every body, and 10 s later.
// Each metric is the median over `runs` page loads. Works with the Matter.js
// and the Rapier builds (it reads `window.physics.stats()` when available).
import { chromium } from "playwright";

const url = process.argv[2] || "http://localhost:5199/";
const runs = Number(process.argv[3] || 3);

const PROFILES = [
  { name: "desktop", cpu: 1, width: 1440, height: 900 },
  { name: "phone (390px, CPU x4)", cpu: 4, width: 390, height: 844 },
];

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

// Installed in the page once physics is up.
function installProbes() {
  window.__bench = { mutations: 0, frames: [], steps: [] };
  new MutationObserver((list) => {
    window.__bench.mutations += list.length;
  }).observe(document.body, { attributes: true, attributeFilter: ["style"], subtree: true });

  let last = performance.now();
  const frame = (t) => {
    window.__bench.frames.push(t - last);
    last = t;
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  // Matter.js build: time each engine step through its events.
  const events = window.engine?.events;
  if (events?.beforeUpdate && events?.afterUpdate) {
    let start = 0;
    events.beforeUpdate.unshift(() => { start = performance.now(); });
    events.afterUpdate.push(() => window.__bench.steps.push(performance.now() - start));
  }
}

function readProbes(seconds) {
  const b = window.__bench;
  let awake;
  let bodies;
  let steps = b.steps;
  if (window.physics?.stats) {
    const s = window.physics.stats();
    awake = s.awake;
    bodies = s.dynamic;
    steps = s.stepTimes;
  } else {
    const all = window.engine.world.bodies;
    bodies = all.filter((x) => !x.isStatic).length;
    awake = all.filter((x) => !x.isStatic && !x.isSleeping).length;
  }
  const frames = [...b.frames].sort((x, y) => x - y);
  const out = {
    awake,
    bodies,
    stepMs: steps.length ? steps.reduce((x, y) => x + y, 0) / steps.length : 0,
    styleWritesPerS: b.mutations / seconds,
    frameP95: frames[Math.floor(frames.length * 0.95)] || 0,
    longFrames: frames.filter((f) => f > 25).length,
  };
  b.mutations = 0;
  b.frames = [];
  b.steps.length = 0;
  if (window.physics?.stats) window.physics.stats().stepTimes.length = 0;
  return out;
}

async function measure(page, cdp, ms) {
  const metrics = async () =>
    Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]));
  await page.evaluate(readProbes, 1); // reset counters
  const a = await metrics();
  await page.waitForTimeout(ms);
  const b = await metrics();
  const seconds = b.Timestamp - a.Timestamp;
  const perS = (key) => ((b[key] - a[key]) / seconds) * 1000;
  return {
    mainThreadPct: perS("TaskDuration") / 10,
    scriptMsPerS: perS("ScriptDuration"),
    styleMsPerS: perS("RecalcStyleDuration"),
    ...(await page.evaluate(readProbes, seconds)),
  };
}

async function runOnce(browser, profile) {
  const page = await browser.newPage({ viewport: { width: profile.width, height: profile.height } });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Performance.enable");
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: profile.cpu });

  const t0 = Date.now();
  await page.goto(url, { waitUntil: "load" });
  await page.waitForFunction(() => window.physicalDomObjects?.length > 0, null, { timeout: 30000 });
  const readyMs = Date.now() - t0;
  // Let free bodies (skill logos, the pyramid) finish settling first.
  await page.waitForTimeout(10000);
  await page.evaluate(installProbes);

  const idle = await measure(page, cdp, 3000);
  await page.evaluate(() => document.getElementById("hire-me").scrollIntoView({ block: "center" }));
  await page.waitForTimeout(800);
  await page.locator("#hire-me button", { hasText: "NO" }).click();
  const afterNo = await measure(page, cdp, 3000);
  await page.waitForTimeout(7000);
  const settled = await measure(page, cdp, 3000);
  await page.close();
  return { readyMs, idle, afterNo, settled };
}

// Uses the installed Google Chrome by default (BENCH_CHANNEL=chromium for
// Playwright's own build, after `pnpm exec playwright install chromium`).
const channel = process.env.BENCH_CHANNEL || "chrome";
const browser = await chromium.launch(channel === "chromium" ? {} : { channel });
const report = {};
for (const profile of PROFILES) {
  const samples = [];
  for (let i = 0; i < runs; i++) samples.push(await runOnce(browser, profile));
  const summary = { readyMs: median(samples.map((s) => s.readyMs)) };
  for (const phase of ["idle", "afterNo", "settled"]) {
    summary[phase] = {};
    for (const key of Object.keys(samples[0][phase])) {
      summary[phase][key] = +median(samples.map((s) => s[phase][key])).toFixed(2);
    }
  }
  report[profile.name] = summary;
}
await browser.close();
console.log(JSON.stringify(report, null, 2));
