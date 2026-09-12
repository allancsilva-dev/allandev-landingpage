"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export type ZoomItem = {
  src: string;
  alt: string;
  width: number;
  height: number;
  legenda?: string;
};

/**
 * One modal shared by the project gallery and the code showcase, so the two
 * can't drift on focus handling or keyboard behaviour. Uses the native
 * `<dialog>` — it already gives the focus trap, the backdrop and Escape.
 */
export function ImageZoom({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: ZoomItem[];
  index: number | null;
  onIndex: (next: number) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = index !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, [onClose]);

  const item = index === null ? undefined : items[index];

  return (
    <dialog
      ref={dialogRef}
      className="image-zoom"
      aria-label="Visualização ampliada"
      onKeyDown={(event) => {
        if (items.length < 2 || index === null) return;
        if (event.key === "ArrowRight") {
          event.preventDefault();
          onIndex((index + 1) % items.length);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          onIndex((index - 1 + items.length) % items.length);
        }
      }}
    >
      {item && (
        <figure className="image-zoom-figure">
          <Image
            src={item.src}
            alt={item.alt}
            width={item.width}
            height={item.height}
            sizes="100vw"
            style={{ width: "auto", height: "auto" }}
          />
          {item.legenda && <figcaption>{item.legenda}</figcaption>}
          {items.length > 1 && (
            <p className="image-zoom-counter" aria-live="polite">
              {(index ?? 0) + 1} / {items.length}
            </p>
          )}
        </figure>
      )}
      <button
        type="button"
        className="image-zoom-close"
        onClick={onClose}
        aria-label="Fechar visualização"
      >
        <X size={18} aria-hidden="true" />
      </button>
    </dialog>
  );
}
