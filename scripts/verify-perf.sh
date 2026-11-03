#!/usr/bin/env bash
# Bundles and runs the CLI validation harness. The app uses Vite-style
# (extensionless) imports, so a bundling step resolves them for Node.
set -euo pipefail
cd "$(dirname "$0")/.."

ESBUILD="$(find node_modules/.pnpm -path '*/esbuild/bin/esbuild' -type f -print -quit)"
[ -z "$ESBUILD" ] && { echo "esbuild not found in node_modules/.pnpm" >&2; exit 1; }

OUT=node_modules/.tmp/verify-perf.bundle.mjs
"$ESBUILD" scripts/verify-perf.mjs --bundle --format=esm --platform=node --outfile="$OUT"
node "$OUT"
