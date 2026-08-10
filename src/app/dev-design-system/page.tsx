"use client";

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
  { fg: "ink on void", ratio: "18.1", pass: true },
  { fg: "ink-muted on void", ratio: "9.6", pass: true },
  { fg: "ink on surface", ratio: "17.2", pass: true },
  { fg: "ink-muted on surface", ratio: "9.2", pass: true },
  { fg: "ink on elevated", ratio: "15.8", pass: true },
  { fg: "cyan on void", ratio: "11.0", pass: true },
  { fg: "success on void", ratio: "10.2", pass: true },
  { fg: "danger on void", ratio: "6.5", pass: true },
];

export default function DesignSystemPage() {
  return (
    <main className="ds-page">
      <h1>Design System — AllanDev</h1>

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
        {contrastPairs.map((p) => (
          <div className="ds-contrast-row" key={p.fg}>
            <span
              className={`ds-ratio ${p.pass ? "ds-ratio-pass" : "ds-ratio-fail"}`}
            >
              {p.ratio}:1
            </span>
            <span
              style={{
                font: "0.74rem var(--font-mono)",
                color: "var(--allan-ink-muted)",
              }}
            >
              {p.fg}
            </span>
          </div>
        ))}
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
            Silkscreen — Display
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
          <Terminal abaLable="sobre.md" prompt="allan@allandev:~$ cat sobre.md">
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
