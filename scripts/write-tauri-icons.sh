#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/src-tauri/icons-b64"
DST="$ROOT/src-tauri/icons"
mkdir -p "$DST"
for f in "$SRC"/*.b64; do
  name="$(basename "$f" .b64)"
  base64 -d < "$f" > "$DST/$name"
done
echo "Materialized icons into $DST"
