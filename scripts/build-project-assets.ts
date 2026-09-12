import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { displayFontFiles, monoFontFiles, svgToPng } from "./lib/raster";
import { escapeXml, readPalette } from "./lib/tokens";

const exec = promisify(execFile);
const root = process.cwd();
const outRoot = path.join(root, "public/images/projects");

const architectures = [
  {
    slug: "nexos-erp",
    title: "REQUISIÇÃO FINANCEIRA",
    nodes: [
      "NEXT.JS",
      "9 GUARDS",
      "NESTJS API",
      "SCHEMA / TENANT",
      "POSTGRESQL",
    ],
    note: "BULLMQ + REDIS processam rotinas assíncronas",
  },
  {
    slug: "renowa",
    title: "SINCRONIZAÇÃO OFFLINE-FIRST",
    nodes: [
      "APP + SQLITE",
      "OUTBOX LOCAL",
      "PUSH IDEMPOTENTE",
      "CHANGE FEED",
      "POSTGRESQL",
    ],
    note: "base_version torna conflitos explícitos",
  },
  {
    slug: "nexos-booking",
    title: "AGENDAMENTO SEM CONFLITO",
    nodes: ["NEXT.JS", "NESTJS API", "TRANSAÇÃO", "RLS / TENANT", "POSTGRESQL"],
    note: "OUTBOX + SOCKET.IO propagam mudanças confirmadas",
  },
  {
    slug: "gestor-financeiro",
    title: "LEDGER FINANCEIRO",
    nodes: ["WEB / MOBILE", "API V1", "SERVIÇOS", "LEDGER", "POSTGRESQL"],
    note: "uma fonte de verdade alimenta saldos e métricas",
  },
] as const;

function diagramSvg(
  item: (typeof architectures)[number],
  palette: Record<string, string>,
) {
  const width = 1600;
  const nodeWidth = 232;
  const gap = 54;
  const start = (width - (nodeWidth * 5 + gap * 4)) / 2;
  const nodes = item.nodes
    .map((label, index) => {
      const x = start + index * (nodeWidth + gap);
      const arrow =
        index === 4
          ? ""
          : `<path d="M ${x + nodeWidth + 12} 450 H ${x + nodeWidth + gap - 12}" stroke="${palette.cyan}" stroke-width="5"/><path d="M ${x + nodeWidth + gap - 24} 438 L ${x + nodeWidth + gap - 12} 450 L ${x + nodeWidth + gap - 24} 462" fill="none" stroke="${palette.cyan}" stroke-width="5"/>`;
      return `${arrow}<rect x="${x}" y="350" width="${nodeWidth}" height="200" rx="18" fill="${palette["bg-elevated"]}" stroke="${index % 2 ? palette.violet : palette.blue}" stroke-width="4"/><text x="${x + nodeWidth / 2}" y="455" fill="${palette.ink}" font-family="JetBrains Mono" font-size="25" font-weight="700" text-anchor="middle">${escapeXml(label)}</text>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><rect width="1600" height="900" fill="${palette["bg-void"]}"/><path d="M0 112H1600M0 788H1600" stroke="${palette["bg-elevated"]}" stroke-width="2"/><text x="800" y="180" fill="${palette.cyan}" font-family="Press Start 2P" font-size="30" text-anchor="middle">${escapeXml(item.title)}</text>${nodes}<text x="800" y="690" fill="${palette["ink-muted"]}" font-family="JetBrains Mono" font-size="25" text-anchor="middle">${escapeXml(item.note)}</text></svg>`;
}

async function webpFromPng(png: Buffer, destination: string) {
  const temp = `${destination}.png`;
  await writeFile(temp, png);
  await exec("cwebp", ["-quiet", "-q", "88", temp, "-o", destination]);
  await exec("rm", [temp]);
}

async function buildArchitectures() {
  const palette = readPalette();
  const fonts = [...(await monoFontFiles()), ...(await displayFontFiles())];
  for (const item of architectures) {
    const dir = path.join(outRoot, item.slug);
    await mkdir(dir, { recursive: true });
    const png = await svgToPng(
      diagramSvg(item, palette),
      800,
      fonts,
      "JetBrains Mono",
    );
    await webpFromPng(png, path.join(dir, "architecture.webp"));
  }
}

const gestorSource = path.resolve(
  root,
  "../gestor-financeiro/docs/REVIEW_REPORTS/evidence",
);
const desktop = path.join(gestorSource, "2026-07-19_web-drilldown-f3-12");
const mobile = path.join(
  gestorSource,
  "2026-07-15_mobile-metas-ios/gf-evidence-02-ativas.png",
);

async function embeddedImage(file: string) {
  return `data:image/png;base64,${(await readFile(file)).toString("base64")}`;
}

async function buildGestorFrame(
  source: string,
  destination: string,
  cover = false,
) {
  const palette = readPalette();
  const width = cover ? 1920 : 1600;
  const height = cover ? 1080 : 900;
  const image = await embeddedImage(source);
  const scale = cover ? 1.2 : 1;
  const x = (width - 1280 * scale) / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="${palette["bg-void"]}"/><image href="${image}" x="${x}" y="0" width="${1280 * scale}" height="${900 * scale}"/><rect x="${x}" y="${height - 126}" width="${256 * scale}" height="126" fill="#fff"/><text x="${x + 24}" y="${height - 60}" fill="#334155" font-family="JetBrains Mono" font-size="18">AMBIENTE DE DEMONSTRAÇÃO</text></svg>`;
  const png = await svgToPng(
    svg,
    width / 2,
    await monoFontFiles(),
    "JetBrains Mono",
  );
  await webpFromPng(png, destination);
}

async function buildGestorMobile(destination: string) {
  const palette = readPalette();
  const image = await embeddedImage(mobile);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><rect width="1600" height="900" fill="${palette["bg-void"]}"/><rect x="584" y="24" width="432" height="852" rx="50" fill="#020617" stroke="${palette.violet}" stroke-width="5"/><clipPath id="phone"><rect x="602" y="42" width="396" height="816" rx="34"/></clipPath><image href="${image}" x="602" y="42" width="396" height="861" preserveAspectRatio="xMidYMin slice" clip-path="url(#phone)"/></svg>`;
  const png = await svgToPng(svg, 800, [], "sans-serif");
  await webpFromPng(png, destination);
}

async function buildGestor() {
  const dir = path.join(outRoot, "gestor-financeiro");
  await mkdir(dir, { recursive: true });
  await buildGestorFrame(
    path.join(desktop, "01-dashboard.png"),
    path.join(dir, "cover.webp"),
    true,
  );
  await buildGestorFrame(
    path.join(desktop, "01-dashboard.png"),
    path.join(dir, "dashboard.webp"),
  );
  await buildGestorFrame(
    path.join(desktop, "03-extrato-conta.png"),
    path.join(dir, "accounts.webp"),
  );
  await buildGestorMobile(path.join(dir, "goals-mobile.webp"));
}

await buildArchitectures();
await buildGestor();
console.log("Project diagrams and Gestor evidence built.");
