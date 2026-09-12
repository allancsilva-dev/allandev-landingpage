import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { decompress } from "wawoff2";

const cacheDir = path.join(process.cwd(), ".cache", "fonts");

/**
 * resvg reads TTF/OTF only, and Fontsource ships WOFF2. Decompress once into a
 * gitignored cache so no font binary has to be committed here — the licence and
 * the file both stay with the `@fontsource` package.
 */
async function fontFile(fontsourceFile: string, out: string) {
  const target = path.join(cacheDir, out);
  if (existsSync(target)) return target;
  const woff2 = await readFile(
    path.join(process.cwd(), "node_modules", "@fontsource", fontsourceFile),
  );
  await mkdir(cacheDir, { recursive: true });
  await writeFile(target, Buffer.from(await decompress(woff2)));
  return target;
}

export async function monoFontFiles() {
  return [
    await fontFile(
      "jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2",
      "jetbrains-mono-400.ttf",
    ),
    await fontFile(
      "jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2",
      "jetbrains-mono-700.ttf",
    ),
  ];
}

export async function displayFontFiles() {
  return [
    await fontFile(
      "press-start-2p/files/press-start-2p-latin-400-normal.woff2",
      "press-start-2p-400.ttf",
    ),
  ];
}

/**
 * Rasterises at 2x so the image stays sharp on dense displays.
 *
 * System fonts stay loaded as a fallback: the Fontsource subsets cover Latin
 * only, and a snippet containing an arrow or a box-drawing character would
 * otherwise render as tofu instead of falling back to a font that has it.
 */
export async function svgToPng(
  svg: string,
  cssWidth: number,
  fontFiles: string[],
  defaultFontFamily: string,
) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: cssWidth * 2 },
    font: { fontFiles, loadSystemFonts: true, defaultFontFamily },
  });
  return Buffer.from(resvg.render().asPng());
}
