# Performance implementation note

Implementation of the recommendations in `AUDIT_PERFORMANCES.md` (audit of 2026-11-02).
The original audit file is left intact as the baseline. No new browser performance
scores are claimed here. Asset sizes, CLI checks and the browser correctness check
for the scroll regression are described below.

## Measured asset sizes

| Asset | Before | After |
| --- | ---: | ---: |
| Ten project thumbnails (full-size, served) | 2 985 754 B | 416 632 B (WebP q80) |
| Blueprint font | 371 752 B (OTF) | 109 348 B (WOFF2, full) |
| Favicon (logo.png 500×500) | 550 117 B | 9 924 B (64px) + 2 721 B (32px) |

Responsive WebP derivatives are also generated (`-480`, `-960`) and referenced via
`srcset`, so offscreen/low-DPR thumbs fetch the smaller candidates. Original PNG/JPEG
files are retained (not deleted) pending visual verification.

## Changes by section

1. **Mouse/MouseConstraint lifecycle** — one `Mouse` and one `MouseConstraint` are
   created per engine lifetime and reinserted into the cleared world on rebuild;
   `resetDragState()` clears an in-flight drag before each rebuild. `disposePhysics()`
   (exposed on `window`) stops the runner/render/ui loops, clears pending lifecycle
   work, removes the Matter mouse canvas listeners and all engine events.
2. **Viewport-sized renderer** — the canvas is a `position: fixed` overlay sized to the
   viewport; `render.bounds` map world → viewport coordinates, refreshed from
   `window.scrollX/Y` and resized on viewport change. The render loop runs only while
   a drag or debug mode is active and clears the canvas when it stops. World bounds are
   re-measured on every rebuild (no reused initial `bodySize`). Pointer/touch mapping
   uses client coordinates plus an explicit scroll offset on the Matter mouse.
   Loops pause/resume on `visibilitychange`.
3. **Images / decoupling** — the global `waitForImages()` barrier is removed. Physics
   initializes after `document.fonts.ready` (title hitbox) with image geometry coming
   from reserved intrinsic `width`/`height` (see `src/imageDimensions.ts`). Thumbnails
   and education/experience logos are lazy-loaded (`loading="lazy"`, `decoding="async"`)
   with intrinsic dimensions reserved; the intrinsically sized Node skill logo also
   reserves its dimensions. Broken images no longer hang initialization.
4. **Favicon / font** — new `favicon.png`/`favicon-32.png` linked in `index.html`;
   full WOFF2 conversion with `font-display: swap` in `@font-face` (no glyph subsetting).
5. **MagneticEffect** — no React commits on idle `mousemove`; last position held in a
   ref and applied once per frame via `requestAnimationFrame` to CSS variables on the
   overlay. Fade/release preserved; rAF and listeners cleaned up; window `blur` resets
   drag state.
6. **Transform math** — `setAbsoluteTransform` skips settled (static/sleeping) objects
   whose ancestor chain is also settled, once their resting transform is drawn; sticky
   objects are excluded (scroll-dependent) and moving parents invalidate children.
   Parent-chain cumulative matrices are cached per frame per chain head. `will-change`
   is applied only while an object moves and reset to `auto` at rest.
7. **Synthetic event relay** — removed the unused `getBoundingClientRect()` read and the
   `pointerEvents` style toggling; coordinates relayed as client coords (scroll handled
   by the mouse offset). MouseEvent and PointerEvent explicitly receive `view: window`
   so their page coordinates also include the document scroll.

## Validation

- `pnpm build` — success (JS 345.69 kB / gzip 106.50 kB; CSS 24.30 kB / gzip 5.76 kB).
- After the scroll correction, the build remains successful (JS 345.72 kB / gzip
  106.51 kB). A browser test through the DOM event relay selected the intended body,
  moved it with the pointer, and released it at scroll Y=0, 1000 and 3000. Each scenario
  passed. This was a scripted DOM-event test in a real browser; physical touchscreen
  input was not tested.
- `pnpm lint` — the same 4 pre-existing errors only (1 `@ts-ignore` in `HomeHireMe.tsx`,
  3 `any` in `vite-env.d.ts`); no new errors.
- `bash scripts/verify-perf.sh` (bundled with the repo's esbuild) — all checks pass:
  - 20 rebuilds keep the same `MouseConstraint` instance, 7 canvas listeners, 1 engine
    `beforeUpdate` callback (constant).
  - `resetDragState` clears button/body/constraint state.
  - pointer → world mapping equals client + scroll, and re-maps on scroll-only change.
  - settled objects skip transform math after first draw; sticky objects and children
    of moving parents keep recomputing.
  - explicit repositioning of static bodies and parents invalidates cached transforms;
    sticky ancestors also invalidate sleeping children.
  - keyboard/resize cleanup cancels subscriptions and pending rebuilds.
  - startup and a real physics-world rebuild with a simulated DOM preserve callback
    counts, refresh canvas/world dimensions and remove stale transforms before measurement.
  - disposal cancels animation frames, removes the canvas and interaction/lifecycle
    listeners, and can be called twice safely.
  - the real event relay, with browser-observed constructor semantics, selects and
    releases the intended Matter body through mouse and touch paths at both zero and
    nonzero scroll. This test failed before adding the event view and passes afterward.

The full-font conversion preserves the original character map and glyph advance
widths. All full-size WebP thumbnails preserve their original pixel dimensions.

The harness is run against the real `matter-js` build and the app modules; it needs a
bundling step because the app uses extensionless imports (Vite-style):

```sh
bash scripts/verify-perf.sh
```

## Reproducibility

`scripts/optimize-assets.sh` regenerates all WebP derivatives, the WOFF2 font, and the
favicon from the committed originals (`cwebp`, python3 + fontTools/brotli, `sips`).

## Remaining issues / caveats

- A browser probe confirmed a regression in the initial relay implementation: without
  `view: window`, a synthetic mouse event at client Y=404 still reported page Y=404
  after scrolling 1000px. Matter consequently targeted Y=404 instead of Y=1404 and
  selected no body. Providing the window view fixes the constructor's page coordinates;
  the regression test now exercises the actual relay rather than supplying precomputed
  page coordinates directly to Matter.
- A render loop runs while the primary button is held even if no body is grabbed; it
  stops as soon as the button is released. Negligible and avoids a one-tick grab gap.
- Original thumbnail PNG/JPEGs and the OTF font are retained in `public/` and still
  copied to `dist/`; remove them after visual verification to trim the bundle.
- The scroll drag regression was browser-verified as described above. Broader visual,
  debug and real-device touch behavior remains unverified. These correctness checks
  do not establish an FPS gain.

## Physics stability follow-up — 2026-11-03

The Scrawl shows skills escaping between #1 (0:04) and #2 (0:08), whereas the full
release at #6 (0:26) is considered acceptable. Normal startup did not reproduce an
escape in the sampled local or public desktop browser runs. A deterministic stress
fixture using the app's real initialization and engine update hooks did reproduce a
wall crossing with fourteen logos, two hundred background bodies and sustained force
through the floor. This is a stress reproduction, not a claim that the precise
recorded timing has been reproduced.

Two changes address the containment failure without increasing global solver iterations:

- Locked compound boxes now use `Body.setStatic` rather than assigning `isStatic`.
  Every wall receives zero inverse mass/inertia, and unlocking restores its dynamic
  properties. An already-static box no longer needs a redundant world spring.
- A cached list of containers checks registered loose children after each physics
  step, replacing the single delayed correction. The check is disabled as soon as
  the box is released. It uses the entire child shape in box coordinates, including
  rotation, and removes only velocity directed through the offending wall. Tangential
  velocity and angular motion remain intact.

The follow-up mobile release check also exposed zero-area bodies from six hidden
responsive decorations and an empty text span. Their mass was zero and their saved
inertia was invalid; non-finite coordinates existed even before pressing NO. The DOM
loader now excludes elements with non-positive/non-finite dimensions, and word
separation no longer emits empty words. Responsive rebuilds reintroduce decorations
when their dimensions become positive. This removes invalid work from the solver
rather than trying to clamp NaN values after propagation.

The common interior case exits using the existing bounds. Vertex checks are limited
to bodies near walls; the container frame and trigonometry are reused. This adds a
targeted safety net for the skills rather than another pass over all DOM objects.
No new FPS improvement is claimed.

`bash scripts/verify-perf.sh` covers the loaded falling scene, static compound mass,
rotated bounds, tangential velocity, release/relock, resize, teardown and the earlier
scroll interaction regression. Bounds checks in the stress fixture use actual
vertices, because Matter's broadphase bounds include velocity padding and can extend
beyond a wall even when the shape itself has not escaped.

The integrated regression fixture also includes a zero-size hidden circle and a
zero-height text span; both are excluded and all world coordinates remain finite
through full release. The four pre-existing lint errors remain unchanged.

Final browser checks passed at 1280×800 and after resizing to 390×844: fourteen logos
remained contained, all coordinates stayed finite, no zero-area bodies were present,
and only one containment callback was registered. Pressing the real React NO button
then restored dynamic compound parts with no non-finite bodies. These checks used
desktop browser viewport resizing, not a physical phone. The development server is
available at http://localhost:5174/; the public site was not deployed in this task.

## Rapier migration (2026-11-26)

Matter.js was replaced by Rapier 0.21 (`@dimforge/rapier2d-simd`, WebAssembly), in
`src/physics/` (the old `src/matter/` is gone). Measured with `scripts/bench-physics.mjs`,
median of 3 page loads per build, both builds served locally and run back to back in
Google Chrome. The "phone" profile is a 390 px viewport with the CPU throttled 4×.

| | Matter.js | Rapier |
| --- | ---: | ---: |
| Idle, desktop: main thread busy | 8.4% | 2.9% |
| Idle, phone: main thread busy | 10.9% | 2.7% |
| Idle: physics script time | 53–60 ms/s | 1.3–1.6 ms/s |
| Idle: awake bodies | 195–201 | 0 |
| After "NO", phone: main thread busy | 56% | 47% |
| 10 s after "NO", phone: main thread busy | 43% | 18% |
| 10 s after "NO", phone: style writes | 7 962/s | 1 574/s |
| 10 s after "NO": awake bodies | 43–56 | 0 |
| Physics step under load (phone) | 1.35–1.61 ms | 0.71–0.91 ms |

Frame rates are not compared: the laptop ran on battery and Chrome's energy saver
capped both builds at 30 fps at different moments.

Why idle is nearly free now:

- Matter.js wakes every body attached to a constraint on every step, so ~200 held
  elements never slept. Held elements now use hand-written springs
  (`src/physics/springs.js`) that never wake a body already on its anchor, have no
  gravity while held, and start asleep.
- The single `requestAnimationFrame` loop stops scheduling itself once nothing is
  awake; input, scrolling (sticky elements), gravity changes and releases restart it.
- Held elements do not collide with each other (collision layers in `config.js`):
  two springs pushing through a contact jammed and jittered forever. The dragged
  element still pushes held ones aside; free bodies collide with everything.
- Each moved element gets one inline `transform` per frame instead of separate
  `translate` and `rotate` writes, and elements whose body and ancestors did not
  move are not touched at all.

Costs:

- Rapier's WebAssembly is 2.4 MB (906 kB gzipped) plus 42 kB of JS. It is imported
  lazily, so the page renders without it (main bundle 107 kB → 81 kB gzipped) and
  physics starts once it arrives (~0.1 s later locally; longer on a slow network).
  If it fails to load, the page stays static. `public/assets/.htaccess` asks
  Apache to gzip it and to cache hashed build files for a year.
- Dragging and throwing were tuned against the Matter.js build: a held element
  follows about 40% of a drag and snaps back in ~200 ms; a thrown free body leaves
  at pointer speed (the velocity cap no longer applies to the dragged body, and
  continuous collision detection replaces it against tunnelling).
- `chain-container` support was dropped (no element used it).

`scripts/verify-perf.*` tested Matter.js internals and were removed;
`scripts/verify-physics.mjs` checks the behaviour in a real browser instead.

### Every word is a body (2026-11-26)

Descriptions, bullet points, dates, places and chip labels now render through
`PhysicalText` (one inline-block span per word), taking the page from 254 to 914
bodies. Same benchmark, same machine:

| | 254 bodies | 914 bodies |
| --- | ---: | ---: |
| Idle, phone: main thread busy | 2.7% | 3.1% |
| Right after "NO", phone: main thread busy | 47% | 68% |
| Physics step after "NO", phone | 0.9 ms | 4.1 ms |
| Time until the "NO" pile is fully asleep | ~15 s | ~17.5 s |

Idle stays free because held bodies sleep. While the pile falls, elements more
than 300 px outside the viewport get no style writes; their pose is applied when
they are scrolled into range. Container walls now scale with the container
(`containerWallThickness`), so bordered chips can hold their words.
