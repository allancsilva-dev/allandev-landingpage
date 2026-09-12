"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

type Video = { src: string; poster: string; titulo: string };

/**
 * Only one demo plays at a time (S7). A module-level handle is enough: the
 * cards never render in separate roots, and a context would add a provider for
 * a single mutable reference.
 */
let playing: HTMLVideoElement | null = null;

const mimeFor = (src: string) =>
  src.endsWith(".webm") ? "video/webm" : "video/mp4";

export function ProjectCardMedia({
  capa,
  video,
  titulo,
  sizes,
  priority = false,
}: {
  capa: { src: string; alt: string };
  video?: Video;
  titulo: string;
  sizes: string;
  priority?: boolean;
}) {
  const [active, setActive] = useState(false);
  // A demo that fails to load falls back to the poster silently — the visitor
  // gets no error, just a card without a play button.
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const release = useCallback((element: HTMLVideoElement) => {
    element.pause();
    if (playing === element) playing = null;
    // Drop the buffered data instead of leaving it attached to a detached node.
    element.removeAttribute("src");
    element.load();
  }, []);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;

    playing?.pause();
    playing = element;
    void element.play().catch(() => setFailed(true));

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) element.pause();
      },
      { threshold: 0.35 },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      release(element);
    };
  }, [active, release]);

  if (active && video && !failed)
    return (
      <video
        ref={videoRef}
        className="project-media-video"
        controls
        playsInline
        preload="none"
        poster={video.poster}
        aria-label={video.titulo}
        onError={() => {
          setFailed(true);
          setActive(false);
        }}
      >
        <source src={video.src} type={mimeFor(video.src)} />
      </video>
    );

  return (
    <>
      <Image
        src={capa.src}
        alt={capa.alt}
        width={960}
        height={540}
        sizes={sizes}
        priority={priority}
      />
      {video && !failed && (
        <button
          type="button"
          className="project-play"
          aria-label={`Reproduzir demonstração de ${titulo}`}
          onClick={(event) => {
            // The heading link stretches over the whole card; without this the
            // click would navigate instead of playing.
            event.preventDefault();
            event.stopPropagation();
            setActive(true);
          }}
        >
          <Play size={15} aria-hidden="true" />
          REPRODUZIR
        </button>
      )}
    </>
  );
}
