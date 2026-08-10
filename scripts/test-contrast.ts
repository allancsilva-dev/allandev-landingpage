import { wcagContrast, formatCss } from "culori";

type TokenPair = { name: string; fg: string; bg: string };

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

const raw: Record<string, string> = {
  "var(--allan-ink)": "oklch(0.955 0.018 230)",
  "var(--allan-ink-muted)": "oklch(0.76 0.04 235)",
  "var(--allan-bg-void)": "oklch(0.105 0.028 260)",
  "var(--allan-bg-surface)": "oklch(0.155 0.045 258)",
  "var(--allan-bg-elevated)": "oklch(0.205 0.06 257)",
  "var(--allan-cyan)": "oklch(0.78 0.16 180)",
  "var(--allan-blue)": "oklch(0.65 0.2 252)",
  "var(--allan-violet)": "oklch(0.64 0.23 302)",
  "var(--allan-magenta)": "oklch(0.7 0.22 335)",
  "var(--allan-success)": "oklch(0.76 0.17 150)",
  "var(--allan-danger)": "oklch(0.68 0.2 25)",
};

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
