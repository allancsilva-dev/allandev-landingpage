#!/usr/bin/env bash
set -euo pipefail

INPUT="${1:?Usage: $0 <input-video> [output-prefix]}"
PREFIX="${2:-video}"

QUALITY="${QUALITY:-28}"
SCALE="${SCALE:-1280:-2}"

echo "Encoding $INPUT → ${PREFIX}.mp4 (H.264, 720p, CRF=$QUALITY, no audio)"

ffmpeg -nostdin -i "$INPUT" \
  -vf "scale=$SCALE,fps=24" \
  -c:v libx264 \
  -preset slow \
  -crf "$QUALITY" \
  -pix_fmt yuv420p \
  -an \
  -movflags +faststart \
  -y "${PREFIX}.mp4"

echo "Generating poster: ${PREFIX}-poster.webp"
ffmpeg -nostdin -i "$INPUT" \
  -vf "scale=$SCALE,select=eq(n\\,0)" \
  -q:v 80 \
  -y "${PREFIX}-poster.webp"

SIZE=$(du -h "${PREFIX}.mp4" | cut -f1)
echo "Done: ${PREFIX}.mp4 ($SIZE)"
