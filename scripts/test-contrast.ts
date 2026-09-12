import { readFileSync } from "node:fs";
import { wcagContrast, formatCss } from "culori";

type TokenPair = { name: string; fg: string; bg: string };

// Read the tokens from the stylesheet instead of restating them here: a copy
// would keep this gate passing against colors the app no longer uses.
function readTokens(path: string): Record<string, string> {
  const css = readFileSync(path, "utf8");
  const tokens: Record<string, string> = {};
  for (const match of css.matchAll(
    /(--allan-[a-z-]+)\s*:\s*(oklch\([^)]+\))\s*;/g,
  ))
    tokens[`var(${match[1]})`] = match[2]!;
  return tokens;
}

function parseOklch(raw: string): { l: number; c: number; h: number } | null {
  const m = raw.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
  if (!m) return null;
  return { l: Number(m[1]), c: Number(m[2]), h: Number(m[3]) };
}

function oklchToHex(raw: string): string | null {
  const parsed = parseOklch(raw);
  if (!parsed) return null;
  try {
    return formatCss({ mode: "oklch", l: parsed.l, c: parsed.c, h: parsed.h });
  } catch {
    return null;
  }
}

const pairs: TokenPair[] = [
  { name: "ink on void", fg: "var(--allan-ink)", bg: "var(--allan-bg-void)" },
  {
    name: "ink-muted on void",
    fg: "var(--allan-ink-muted)",
    bg: "var(--allan-bg-void)",
  },
  {
    name: "ink on surface",
    fg: "var(--allan-ink)",
    bg: "var(--allan-bg-surface)",
  },
  {
    name: "ink-muted on surface",
    fg: "var(--allan-ink-muted)",
    bg: "var(--allan-bg-surface)",
  },
  {
    name: "ink on elevated",
    fg: "var(--allan-ink)",
    bg: "var(--allan-bg-elevated)",
  },
  { name: "cyan on void", fg: "var(--allan-cyan)", bg: "var(--allan-bg-void)" },
  {
    name: "success on void",
    fg: "var(--allan-success)",
    bg: "var(--allan-bg-void)",
  },
  {
    name: "danger on void",
    fg: "var(--allan-danger)",
    bg: "var(--allan-bg-void)",
  },
];

const raw = readTokens("src/app/globals.css");

const missing = [...new Set(pairs.flatMap((p) => [p.fg, p.bg]))].filter(
  (token) => !raw[token],
);
if (missing.length > 0) {
  console.error(`Tokens ausentes em globals.css: ${missing.join(", ")}`);
  process.exit(1);
}

const MIN_NORMAL = 4.5;
const MIN_LARGE = 3;

let failed = 0;
for (const pair of pairs) {
  const fgHex = oklchToHex(raw[pair.fg] ?? "");
  const bgHex = oklchToHex(raw[pair.bg] ?? "");
  if (!fgHex || !bgHex) {
    console.error(`Falha ao converter ${pair.name}: fg=${fgHex}, bg=${bgHex}`);
    failed++;
    continue;
  }
  const ratio = wcagContrast(fgHex, bgHex);
  const pass = ratio >= MIN_NORMAL;
  const passLarge = ratio >= MIN_LARGE;
  const status = pass ? "OK" : passLarge ? "OK (large)" : "FAIL";
  if (!pass) failed++;
  console.log(`${status.padEnd(12)} ${ratio.toFixed(2)}:1  ${pair.name}`);
}

if (failed > 0) {
  console.error(`\n${failed} par(es) reprovaram WCAG AA (min ${MIN_NORMAL}:1)`);
  process.exit(1);
}
console.log("\nTodos os pares passam WCAG AA.");
