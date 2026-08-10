import type { ReactNode } from "react";

export function Gallery({
  images,
}: {
  images: { src: string; alt: string; legenda?: string }[];
}) {
  return (
    <figure
      className="mdx-gallery"
      role="group"
      aria-label="Galeria do projeto"
    >
      <div className="mdx-gallery-grid">
        {images.map((img) => (
          <div key={img.src} className="mdx-gallery-item">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt={img.alt} loading="lazy" />
            {img.legenda && <figcaption>{img.legenda}</figcaption>}
          </div>
        ))}
      </div>
    </figure>
  );
}

export function VideoPlayer({
  src,
  poster,
  titulo,
}: {
  src: string;
  poster: string;
  titulo: string;
}) {
  return (
    <figure className="mdx-video" role="group">
      <video
        controls
        preload="none"
        poster={poster}
        aria-label={titulo}
        style={{ width: "100%", borderRadius: "8px" }}
      >
        <source src={src} type="video/mp4" />
      </video>
      <figcaption>{titulo}</figcaption>
    </figure>
  );
}

export function Callout({
  variant = "info",
  children,
}: {
  variant?: "info" | "warning" | "tip";
  children: ReactNode;
}) {
  return (
    <aside className={`mdx-callout mdx-callout-${variant}`} role="note">
      {children}
    </aside>
  );
}

export function Architecture({
  titulo,
  diagrama,
  legenda,
}: {
  titulo: string;
  diagrama: string;
  legenda?: string;
}) {
  return (
    <figure className="mdx-architecture" role="group">
      <figcaption className="mdx-architecture-title">{titulo}</figcaption>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={diagrama}
        alt={`Diagrama de arquitetura: ${titulo}`}
        loading="lazy"
      />
      {legenda && <p>{legenda}</p>}
    </figure>
  );
}

export function DecisionsTable({
  decisoes,
}: {
  decisoes: { decisao: string; alternativas: string; motivo: string }[];
}) {
  return (
    <div className="mdx-table-wrap" role="table" aria-label="Decisões técnicas">
      <div className="mdx-table" role="rowgroup">
        <div className="mdx-table-row mdx-table-head" role="row">
          <span role="columnheader">Decisão</span>
          <span role="columnheader">Alternativas</span>
          <span role="columnheader">Motivo</span>
        </div>
        {decisoes.map((d) => (
          <div className="mdx-table-row" role="row" key={d.decisao}>
            <span role="cell">{d.decisao}</span>
            <span role="cell">{d.alternativas}</span>
            <span role="cell">{d.motivo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Metrics({
  resultados,
}: {
  resultados: { valor: string; rotulo: string; contexto: string }[];
}) {
  return (
    <div className="mdx-metrics" role="list" aria-label="Resultados">
      {resultados.map((r) => (
        <div className="mdx-metric" role="listitem" key={r.rotulo}>
          <strong>{r.valor}</strong>
          <span>{r.rotulo}</span>
          <p>{r.contexto}</p>
        </div>
      ))}
    </div>
  );
}
