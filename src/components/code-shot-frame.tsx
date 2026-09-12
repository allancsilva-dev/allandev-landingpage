"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { Terminal } from "@/components/ui/terminal";
import { ImageZoom, type ZoomItem } from "@/components/ui/image-zoom";

export type CodeShotView = ZoomItem & {
  titulo: string;
  linguagem: string;
  projeto: string;
  descricao: string;
};

/**
 * The snippet ships as a raster because the repositories are private — there is
 * no source text in the page and no highlighter on the client. That is a
 * curation decision, not a copy protection: the image can still be downloaded,
 * screenshotted or read by OCR, and nothing here pretends otherwise.
 */
export function CodeShotFrame({
  shot,
  sizes = "(max-width: 900px) 100vw, 900px",
  rights = true,
}: {
  shot: CodeShotView;
  sizes?: string;
  /** The showcase prints one shared notice below the tabs instead. */
  rights?: boolean;
}) {
  const [zoomed, setZoomed] = useState(false);
  const close = useCallback(() => setZoomed(false), []);

  return (
    <figure className="code-shot">
      <Terminal
        abaLabel={`${shot.titulo} · ${shot.linguagem} · ${shot.projeto}`}
      >
        <button
          type="button"
          className="code-shot-image"
          onClick={() => setZoomed(true)}
          aria-label={`Ampliar imagem de código: ${shot.titulo}`}
        >
          <Image
            src={shot.src}
            alt={shot.alt}
            width={shot.width}
            height={shot.height}
            sizes={sizes}
          />
        </button>
      </Terminal>
      <figcaption className="code-shot-caption">{shot.descricao}</figcaption>
      {rights && (
        <p className="code-shot-rights">
          © Allan Carvalho · código proprietário, exibido para avaliação técnica
        </p>
      )}
      <ImageZoom
        items={[shot]}
        index={zoomed ? 0 : null}
        onIndex={() => undefined}
        onClose={close}
      />
    </figure>
  );
}
