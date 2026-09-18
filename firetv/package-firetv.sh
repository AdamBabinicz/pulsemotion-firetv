#!/usr/bin/env bash
# Build the PulseMotion TV web bundle and zip it as a Fire TV *packaged* web app.
# Amazon: "Create a zip file containing all of the files in the project folder",
# with index.html at the archive root.
set -euo pipefail

echo "▶ Building production bundle…"
pnpm build

OUT="firetv/pulsemotion-firetv.zip"
rm -f "$OUT"

echo "▶ Packaging dist/ → $OUT"
( cd dist && zip -r -q "../$OUT" . )

echo "✅ Packaged: $OUT"
echo "   Load it in Web App Tester → Packaged Apps tab, or copy to /sdcard/amazonwebapps/."
