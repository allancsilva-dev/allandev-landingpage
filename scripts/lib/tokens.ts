import { readFileSync } from "node:fs";
import path from "node:path";
import { formatHex, parse } from "culori";

/**
 * The raster scripts have to paint in sRGB, but the palette only exists as
 * OKLCH in the stylesheet. Read it from there instead of restating hex values
 * here — a copy would drift the day a token changes.
 */
export function readPalette(): Record<string, string> {
  const css = readFileSync(
    path.join(process.cwd(), "src", "app", "globals.css"),
    "utf8",
  );
  const palette: Record<string, string> = {};
  for (const match of css.matchAll(
    /(--allan-[a-z-]+)\s*:\s*(oklch\([^)]+\))\s*;/g,
  )) {
    const color = parse(match[2]!);
    if (color) palette[match[1]!.replace("--allan-", "")] = formatHex(color)!;
  }
  return palette;
}

export const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
