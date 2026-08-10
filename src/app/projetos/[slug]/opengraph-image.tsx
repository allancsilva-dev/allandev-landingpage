import { ImageResponse } from "next/og";
import { getPublishedProject } from "@/lib/content/projects";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamicParams = false;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const item = await getPublishedProject((await params).slug);
  if (!item) return new Response(null, { status: 404 });

  const { titulo, resumo, stack } = item.project;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 24,
        width: "100%",
        height: "100%",
        padding: 80,
        background: "oklch(0.105 0.028 260)",
        fontFamily: "Onest",
        color: "oklch(0.955 0.018 230)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span
          style={{
            fontSize: 20,
            fontFamily: '"JetBrains Mono"',
            color: "oklch(0.78 0.16 180)",
          }}
        >
          ALLANDEV
        </span>
        <span
          style={{
            fontSize: 14,
            fontFamily: '"JetBrains Mono"',
            color: "oklch(0.76 0.04 235)",
          }}
        >
          / PROJETO
        </span>
      </div>
      <div
        style={{
          fontSize: 64,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          maxWidth: "80%",
        }}
      >
        {titulo}
      </div>
      <div
        style={{
          fontSize: 24,
          color: "oklch(0.76 0.04 235)",
          maxWidth: "70%",
        }}
      >
        {resumo}
      </div>
      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 24,
        }}
      >
        {stack.slice(0, 5).map((tech) => (
          <span
            key={tech}
            style={{
              padding: "6px 16px",
              border: "1px solid oklch(0.78 0.16 180 / 0.35)",
              borderRadius: 6,
              fontSize: 16,
              fontFamily: '"JetBrains Mono"',
              color: "oklch(0.78 0.16 180)",
            }}
          >
            {tech}
          </span>
        ))}
      </div>
    </div>,
    { ...size },
  );
}
