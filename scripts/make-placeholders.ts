import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { displayFontFiles, svgToPng } from "./lib/raster";
import { escapeXml, readPalette } from "./lib/tokens";

/**
 * Real screenshots do not exist yet, and shipping a case with no media would
 * hide the layout bugs that only show up at final dimensions. These stand-ins
 * carry the exact aspect ratio each slot will get, so swapping in real files
 * later is a copy, not a re-layout.
 */
const palette = readPalette();
const fonts = await displayFontFiles();

const slots = [
  { slot: "capa", width: 1920, height: 1080, rotulo: "CAPA" },
  { slot: "galeria-1", width: 1600, height: 900, rotulo: "GALERIA 01" },
  { slot: "galeria-2", width: 1600, height: 900, rotulo: "GALERIA 02" },
  { slot: "galeria-3", width: 1600, height: 900, rotulo: "GALERIA 03" },
  { slot: "galeria-4", width: 1600, height: 900, rotulo: "GALERIA 04" },
  { slot: "video-poster", width: 1280, height: 720, rotulo: "DEMO" },
];

const projects = [
  { slug: "nexos-erp", nome: "NEXOS ERP", accent: palette.cyan! },
  { slug: "renowa", nome: "RENOWA", accent: palette.violet! },
];

function placeholderSvg({
  width,
  height,
  nome,
  rotulo,
  accent,
}: {
  width: number;
  height: number;
  nome: string;
  rotulo: string;
  accent: string;
}) {
  const cell = Math.round(width / 24);
  const bracket = Math.round(width / 28);
  const inset = Math.round(width / 40);
  const nomeSize = Math.round(width / 32);
  const rotuloSize = Math.round(width / 64);
  const right = width - inset;
  const bottom = height - inset;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <pattern id="grid" width="${cell}" height="${cell}" patternUnits="userSpaceOnUse">
      <path d="M ${cell} 0 L 0 0 0 ${cell}" fill="none" stroke="${accent}" stroke-opacity="0.14" stroke-width="1"/>
    </pattern>
    <radialGradient id="glow" cx="50%" cy="42%" r="62%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="${palette["bg-void"]}"/>
  <rect width="${width}" height="${height}" fill="url(#grid)"/>
  <rect width="${width}" height="${height}" fill="url(#glow)"/>
  <g stroke="${accent}" stroke-width="3" fill="none">
    <path d="M ${inset} ${inset + bracket} L ${inset} ${inset} L ${inset + bracket} ${inset}"/>
    <path d="M ${right - bracket} ${inset} L ${right} ${inset} L ${right} ${inset + bracket}"/>
    <path d="M ${inset} ${bottom - bracket} L ${inset} ${bottom} L ${inset + bracket} ${bottom}"/>
    <path d="M ${right - bracket} ${bottom} L ${right} ${bottom} L ${right} ${bottom - bracket}"/>
  </g>
  <text x="${width / 2}" y="${height / 2}" text-anchor="middle" font-family="Press Start 2P" font-size="${nomeSize}" fill="${palette.ink}">${escapeXml(nome)}</text>
  <text x="${width / 2}" y="${height / 2 + nomeSize * 1.9}" text-anchor="middle" font-family="Press Start 2P" font-size="${rotuloSize}" fill="${accent}">${escapeXml(rotulo)}</text>
</svg>`;
}

const outDir = path.join(process.cwd(), "public", "images", "placeholders");
await mkdir(outDir, { recursive: true });

let count = 0;
for (const project of projects)
  for (const { slot, width, height, rotulo } of slots) {
    const svg = placeholderSvg({
      width,
      height,
      rotulo,
      nome: project.nome,
      accent: project.accent,
    });
    // Already authored at final pixel size, so rasterise 1:1 rather than 2x.
    const png = await svgToPng(svg, width / 2, fonts, "Press Start 2P");
    await writeFile(path.join(outDir, `${project.slug}-${slot}.png`), png);
    count += 1;
  }

console.log(`Placeholders gerados: ${count}.`);
