"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { ImageZoom, type ZoomItem } from "@/components/ui/image-zoom";

type GalleryImage = {
  src: string;
  alt: string;
  legenda?: string;
  largura?: number;
  altura?: number;
};

export function Gallery({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const close = useCallback(() => setIndex(null), []);

  const items: ZoomItem[] = images.map((image) => ({
    src: image.src,
    alt: image.alt,
    legenda: image.legenda,
    width: image.largura ?? 1600,
    height: image.altura ?? 900,
  }));

  return (
    <figure
      className="mdx-gallery"
      role="group"
      aria-label="Galeria do projeto"
    >
      <div className="mdx-gallery-grid">
        {items.map((item, position) => (
          <div key={item.src} className="mdx-gallery-item">
            <button
              type="button"
              onClick={() => setIndex(position)}
              aria-label={`Ampliar: ${item.alt}`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                width={item.width}
                height={item.height}
                sizes="(max-width: 767px) 100vw, 50vw"
              />
            </button>
            {item.legenda && <figcaption>{item.legenda}</figcaption>}
          </div>
        ))}
      </div>
      <ImageZoom
        items={items}
        index={index}
        onIndex={setIndex}
        onClose={close}
      />
    </figure>
  );
}
