#!/usr/bin/env bash
# Builds the publishable copy of the page into ./dist for the Artifact tool:
# the page body without its own <html>/<head>/<body> wrapper, plus data.js, app.js and assets.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf dist && mkdir -p dist/assets
cp data.js app.js dist/
cp assets/* dist/assets/
python3 - <<'PY'
import re
s = open("index.html").read()
for pat in [r'<!doctype html>\s*', r'<html[^>]*>\s*', r'<head>\s*', r'<meta charset[^>]*>\s*',
            r'<meta name="viewport"[^>]*>\s*', r'</head>\s*', r'<body>\s*', r'</body>\s*', r'</html>\s*']:
    s = re.sub(pat, '', s, count=1, flags=re.I)
open("dist/black-ops.html", "w").write(s)
PY
echo "Built dist/black-ops.html"
