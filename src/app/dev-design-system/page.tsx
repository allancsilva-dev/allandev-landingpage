"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HUDCard } from "@/components/ui/hud-card";
import { Terminal } from "@/components/ui/terminal";
import { Marquee } from "@/components/ui/marquee";

const swatches = [
  { name: "--allan-bg-void", color: "var(--allan-bg-void)" },
  { name: "--allan-bg-surface", color: "var(--allan-bg-surface)" },
  { name: "--allan-bg-elevated", color: "var(--allan-bg-elevated)" },
  { name: "--allan-ink", color: "var(--allan-ink)" },
  { name: "--allan-ink-muted", color: "var(--allan-ink-muted)" },
  { name: "--allan-blue", color: "var(--allan-blue)" },
  { name: "--allan-cyan", color: "var(--allan-cyan)" },
  { name: "--allan-violet", color: "var(--allan-violet)" },
  { name: "--allan-magenta", color: "var(--allan-magenta)" },
  { name: "--allan-success", color: "var(--allan-success)" },
  { name: "--allan-danger", color: "var(--allan-danger)" },
];

const contrastPairs = [
  { fg: "--allan-ink", bg: "--allan-bg-void", label: "ink on void" },
  {
    fg: "--allan-ink-muted",
    bg: "--allan-bg-void",
    label: "ink-muted on void",
  },
  { fg: "--allan-ink", bg: "--allan-bg-surface", label: "ink on surface" },
  {
    fg: "--allan-ink-muted",
    bg: "--allan-bg-surface",
    label: "ink-muted on surface",
  },
  { fg: "--allan-ink", bg: "--allan-bg-elevated", label: "ink on elevated" },
  { fg: "--allan-cyan", bg: "--allan-bg-void", label: "cyan on void" },
  { fg: "--allan-success", bg: "--allan-bg-void", label: "success on void" },
  { fg: "--allan-danger", bg: "--allan-bg-void", label: "danger on void" },
];

const MIN_NORMAL = 4.5;

/**
 * Painting one pixel and reading it back gives real sRGB bytes for any color
 * the browser can parse — `fillStyle` echoes oklch()/lab() strings unchanged.
 */
function toRgb(color: string): [number, number, number] | null {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
  if (a === 0) return null;
  return [r!, g!, b!];
}

function luminance(rgb: [number, number, number]) {
  const [r, g, b] = rgb.map((channel) => {
    const v = channel / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastOf(fgToken: string, bgToken: string): number | null {
  const styles = getComputedStyle(document.documentElement);
  const fg = toRgb(styles.getPropertyValue(fgToken).trim());
  const bg = toRgb(styles.getPropertyValue(bgToken).trim());
  if (!fg || !bg) return null;
  const [light, dark] = [luminance(fg), luminance(bg)].sort(
    (a, b) => b - a,
  ) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

const PENDING: (number | null)[] = [];
let measured: (number | null)[] | null = null;

/** Cached so the snapshot stays referentially stable across renders. */
function readRatios() {
  measured ??= contrastPairs.map((pair) => contrastOf(pair.fg, pair.bg));
  return measured;
}

export default function DesignSystemPage() {
  const ratios = useSyncExternalStore(
    () => () => {},
    readRatios,
    () => PENDING,
  );

  return (
    <main className="ds-page">
      <h1>Design System — Allan.Dev</h1>

      <div className="ds-group">
        <h2>Paleta</h2>
        <div className="ds-row">
          {swatches.map((sw) => (
            <div key={sw.name}>
              <div className="ds-swatch" style={{ background: sw.color }} />
              <span className="ds-label">{sw.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ds-group">
        <h2>Contraste WCAG AA</h2>
        <p style={{ color: "var(--allan-ink-muted)", marginBottom: "1rem" }}>
          Mínimo: 4.5:1 normal / 3:1 grande · Todos os pares aprovados
        </p>
        {contrastPairs.map((p, index) => {
          const ratio = ratios[index];
          return (
            <div className="ds-contrast-row" key={p.label}>
              <span
                className={`ds-ratio ${
                  ratio === undefined
                    ? ""
                    : ratio !== null && ratio >= MIN_NORMAL
                      ? "ds-ratio-pass"
                      : "ds-ratio-fail"
                }`}
              >
                {ratio === undefined
                  ? "—"
                  : ratio === null
                    ? "erro"
                    : `${ratio.toFixed(2)}:1`}
              </span>
              <span
                style={{
                  font: "0.74rem var(--font-mono)",
                  color: "var(--allan-ink-muted)",
                }}
              >
                {p.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="ds-group">
        <h2>Tipografia</h2>
        <div
          className="ds-row"
          style={{ flexDirection: "column", alignItems: "flex-start" }}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2rem",
              margin: 0,
            }}
          >
            Press Start 2P — Display
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "1.5rem",
              margin: 0,
            }}
          >
            Onest — Corpo
          </p>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.9rem",
              margin: 0,
            }}
          >
            JetBrains Mono — Técnico
          </p>
        </div>
      </div>

      <div className="ds-group">
        <h2>Buttons</h2>
        <div className="ds-row">
          <Button variant="primary" onClick={() => {}}>
            PRIMARY CTA
          </Button>
          <Button variant="secondary" onClick={() => {}}>
            SECONDARY
          </Button>
          <Button variant="primary" onClick={() => {}} disabled>
            DISABLED
          </Button>
        </div>
      </div>

      <div className="ds-group">
        <h2>Badge</h2>
        <div className="ds-row">
          <Badge variant="available">DISPONÍVEL</Badge>
          <Badge variant="progress">EM ANDAMENTO</Badge>
          <Badge variant="delivered">ENTREGUE</Badge>
        </div>
      </div>

      <div className="ds-group">
        <h2>HUD Card</h2>
        <div className="ds-row">
          <HUDCard value="24h" label="RETORNO NA PRIMEIRA ANÁLISE" />
          <HUDCard value="FULL" label="DA INFRA À INTERFACE" />
        </div>
      </div>

      <div className="ds-group">
        <h2>Terminal</h2>
        <div className="ds-row narrow">
          <Terminal abaLabel="sobre.md" prompt="allan@allandev:~$ cat sobre.md">
            <p>Texto de exemplo dentro da moldura de terminal.</p>
            <p className="terminal-highlight">
              ✓ Destaque em ciano com fonte mono.
            </p>
          </Terminal>
        </div>
      </div>

      <div className="ds-group">
        <h2>Marquee</h2>
        <Marquee
          items={["TYPESCRIPT", "JAVA", "NEXT.JS", "REACT", "DOCKER", "LINUX"]}
          direction="left"
        />
        <div style={{ marginTop: "1rem" }}>
          <Marquee
            items={["POSTGRESQL", "NODE.JS", "CI/CD", "GIT"]}
            direction="right"
            speed={55}
          />
        </div>
      </div>

      <div className="ds-group">
        <h2>MDX Components</h2>
        <p style={{ color: "var(--allan-ink-muted)", marginBottom: "1rem" }}>
          Gallery, VideoPlayer, Callout, Architecture, DecisionsTable, Metrics —
          disponíveis dentro de MDX.
        </p>
      </div>
    </main>
  );
}
