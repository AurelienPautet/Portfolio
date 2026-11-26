My portfolio, with a physics engine integrated using Rapier (WebAssembly) and React.

Every element with the `physical` class gets a rigid body; see `src/physics/PhysicalDomObject.js`
for the classes that control it.

## Checks

```bash
pnpm build && pnpm exec vite preview --port 5199 &
node scripts/verify-physics.mjs http://localhost:5199/   # behaviour checks
node scripts/bench-physics.mjs http://localhost:5199/    # CPU and style-write benchmark
```
