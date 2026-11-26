#!/usr/bin/env bash
# Reproducible asset optimization for the physics portfolio.
# - Convert the ten project thumbnails to WebP (quality 80) + responsive derivatives.
# - Convert the Blueprint font (OTF) to full WOFF2 (FontTools).
# - Generate a small favicon from the 500x500 logo.
# Requires: cwebp (brew install webp), python3 with fontTools+brotli, sips (macOS).
set -euo pipefail
cd "$(dirname "$0")/.."

CWEBP="$(command -v cwebp || echo /opt/homebrew/bin/cwebp)"
PY="$(command -v python3 || echo python3)"
THUMBS=public/projectThumbnails

# "name width height" — intrinsic dimensions of each original thumbnail.
while read -r name w h; do
  [ -z "$name" ] && continue

  src=""
  for ext in png jpeg jpg; do
    if [ -f "$THUMBS/$name.$ext" ]; then src="$THUMBS/$name.$ext"; break; fi
  done
  [ -z "$src" ] && { echo "missing source for $name" >&2; exit 1; }

  # full-size WebP (same dimensions)
  "$CWEBP" -q 80 -quiet "$src" -o "$THUMBS/$name.webp"

  # responsive derivatives by width (aspect ratio preserved via 0 height)
  if [ "$w" -gt 480 ]; then
    "$CWEBP" -q 80 -quiet -resize 480 0 "$src" -o "$THUMBS/$name-480.webp"
  fi
  if [ "$w" -gt 960 ]; then
    "$CWEBP" -q 80 -quiet -resize 960 0 "$src" -o "$THUMBS/$name-960.webp"
  fi
done <<'DIMS'
GudrunGallery 1600 900
MindCap 618 872
RustTracer 1710 1073
TextFoundry 1012 916
LaFineEquipe 1627 869
WiiGameBien 1212 841
TransatFourchettas 1170 2532
Fourchettas 1858 875
GrammarCorrector 410 287
SiteGallery 2482 2000
YoutubeDownloader 236 246
DIMS

# Font: full WOFF2 conversion (no glyph subsetting).
"$PY" - <<'PYEOF'
from fontTools.ttLib import TTFont
f = TTFont("public/fonts/Bluprintdemo-YOMv.otf", recalcTimestamp=False)
f.flavor = "woff2"
f.save("public/fonts/Bluprintdemo-YOMv.woff2")
print("woff2 written")
PYEOF

# Favicon (64px and 32px) from the 500x500 logo.
sips -z 64 64 public/logo.png --out public/favicon.png >/dev/null
sips -z 32 32 public/logo.png --out public/favicon-32.png >/dev/null

echo "done"
