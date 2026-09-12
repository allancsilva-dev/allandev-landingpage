import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { createHighlighter, type BundledLanguage } from "shiki";
import { monoFontFiles, svgToPng } from "./lib/raster";
import { escapeXml, readPalette } from "./lib/tokens";
import { codeShotSchema, type CodeShot } from "../src/lib/content/code-shots";
import { z } from "zod";

const run = promisify(execFile);

const root = process.env.CODE_SHOTS_ROOT ?? path.resolve(process.cwd(), "..");
const updateHashes = process.argv.includes("--update-hashes");

const FONT_SIZE = 15;
const LINE_HEIGHT = 24;
const ADVANCE = FONT_SIZE * 0.6; // JetBrains Mono is exactly 600/1000 em.
const PAD = 30;
const GUTTER = 4; // digits reserved for the original line number
const MAX_COLS = 112; // wider than this stops being readable on a phone

const palette = readPalette();
const manifestPath = path.join(process.cwd(), "content", "code-shots.json");

const manifest = z
  .array(codeShotSchema)
  .parse(JSON.parse(await readFile(manifestPath, "utf8")));

/**
 * Reads the blob out of the commit object rather than the working tree: a dirty
 * file or a checked-out branch must not be able to change what gets published.
 */
async function readSource(shot: CodeShot) {
  const repo = path.join(root, shot.sourceRepo);
  try {
    const { stdout } = await run(
      "git",
      ["-C", repo, "show", `${shot.ref}:${shot.path}`],
      { maxBuffer: 8 * 1024 * 1024 },
    );
    return stdout;
  } catch (error) {
    throw new Error(
      `code-shot "${shot.id}": não consegui ler ${shot.sourceRepo}/${shot.path} em ${shot.ref.slice(0, 8)} — ${(error as Error).message.split("\n")[0]}`,
    );
  }
}

function extract(shot: CodeShot, source: string) {
  const all = source.split("\n");
  let lines: string[];
  let firstLine: number;

  if (shot.linhas) {
    const [from, to] = shot.linhas;
    if (to > all.length)
      throw new Error(
        `code-shot "${shot.id}": arquivo tem ${all.length} linhas, pedi até ${to}`,
      );
    lines = all.slice(from - 1, to);
    firstLine = from;
  } else {
    const start = all.findIndex((line) =>
      line.includes(`#region ${shot.region}`),
    );
    if (start === -1)
      throw new Error(
        `code-shot "${shot.id}": marcador "#region ${shot.region}" não existe em ${shot.path}`,
      );
    const relativeEnd = all
      .slice(start + 1)
      .findIndex((line) => line.includes("#endregion"));
    if (relativeEnd === -1)
      throw new Error(`code-shot "${shot.id}": falta o "#endregion"`);
    lines = all.slice(start + 1, start + 1 + relativeEnd);
    firstLine = start + 2;
  }

  // Trim blank edges, then dedent so a deeply nested block doesn't waste half
  // the image on indentation.
  while (lines.length && !lines[0]!.trim()) {
    lines.shift();
    firstLine += 1;
  }
  while (lines.length && !lines.at(-1)!.trim()) lines.pop();
  if (!lines.length) throw new Error(`code-shot "${shot.id}": trecho vazio`);

  const indent = Math.min(
    ...lines
      .filter((line) => line.trim())
      .map((line) => line.match(/^\s*/)![0].length),
  );
  return { lines: lines.map((line) => line.slice(indent)), firstLine };
}

const highlighter = await createHighlighter({
  themes: ["tokyo-night"],
  langs: [
    ...new Set(manifest.map((shot) => shot.language)),
  ] as BundledLanguage[],
});

function toSvg(lines: string[], firstLine: number, language: BundledLanguage) {
  const overflow = lines.findIndex((line) => line.length > MAX_COLS);
  if (overflow !== -1)
    throw new Error(
      `linha ${firstLine + overflow} passa de ${MAX_COLS} colunas — escolha um trecho mais estreito`,
    );

  const cols = Math.max(...lines.map((line) => line.length), 32);
  const gutterWidth = GUTTER * ADVANCE + 14;
  const width = Math.ceil(PAD * 2 + gutterWidth + cols * ADVANCE);
  const height = Math.ceil(PAD * 2 + lines.length * LINE_HEIGHT);
  const { tokens } = highlighter.codeToTokens(lines.join("\n"), {
    lang: language,
    theme: "tokyo-night",
  });

  const body = tokens
    .map((line, row) => {
      const y = PAD + row * LINE_HEIGHT + FONT_SIZE;
      let col = 0;
      const spans = line
        .map((token) => {
          const x = PAD + gutterWidth + col * ADVANCE;
          col += token.content.length;
          if (!token.content.trim()) return "";
          return `<tspan x="${x.toFixed(2)}" fill="${token.color ?? palette.ink}">${escapeXml(token.content)}</tspan>`;
        })
        .join("");
      const number = String(firstLine + row).padStart(GUTTER, " ");
      return `<text y="${y}" xml:space="preserve"><tspan x="${PAD}" fill="${palette["ink-muted"]}" fill-opacity="0.45">${number}</tspan>${spans}</text>`;
    })
    .join("\n    ");

  return {
    width,
    height,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${palette["bg-surface"]}"/>
  <line x1="${PAD + gutterWidth - 10}" y1="${PAD - 6}" x2="${PAD + gutterWidth - 10}" y2="${height - PAD + 6}" stroke="${palette.cyan}" stroke-opacity="0.18"/>
  <g font-family="JetBrains Mono" font-size="${FONT_SIZE}">
    ${body}
  </g>
</svg>`,
  };
}

const fonts = await monoFontFiles();
const outDir = path.join(process.cwd(), "public", "code-shots");
await mkdir(outDir, { recursive: true });

const generated = [];
const rewritten: CodeShot[] = [];

for (const shot of manifest) {
  const { lines, firstLine } = extract(shot, await readSource(shot));
  const sourceHash = `sha256:${createHash("sha256").update(lines.join("\n")).digest("hex")}`;

  if (sourceHash !== shot.expectedHash) {
    if (!updateHashes)
      throw new Error(
        `snippet ${shot.id} mudou na origem — revise o diff e rode \`pnpm code-shots --update-hashes\`\n  esperado: ${shot.expectedHash}\n  atual:    ${sourceHash}`,
      );
    console.log(`  hash atualizado: ${shot.id}`);
  }
  rewritten.push({ ...shot, expectedHash: sourceHash });

  const { svg, width, height } = toSvg(
    lines,
    firstLine,
    shot.language as BundledLanguage,
  );
  await writeFile(
    path.join(outDir, `${shot.id}.png`),
    await svgToPng(svg, width, fonts, "JetBrains Mono"),
  );
  generated.push({
    id: shot.id,
    file: `/code-shots/${shot.id}.png`,
    width,
    height,
    sourceHash,
  });
  console.log(`  ${shot.id} → ${width}×${height} (${lines.length} linhas)`);
}

if (updateHashes)
  await writeFile(manifestPath, `${JSON.stringify(rewritten, null, 2)}\n`);

await writeFile(
  path.join(process.cwd(), "content", "code-shots.generated.json"),
  `${JSON.stringify(generated, null, 2)}\n`,
);

console.log(`Code-shots gerados: ${generated.length}.`);
