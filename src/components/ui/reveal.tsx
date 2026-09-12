"use client";

import { useEffect, useRef, type ReactNode } from "react";

const BELOW_FOLD = 0.9;
const FAILSAFE_MS = 6000;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Only elements the visitor has not seen yet may start hidden. */
function isBelowFold(element: Element) {
  return element.getBoundingClientRect().top >= window.innerHeight * BELOW_FOLD;
}

function observeReveal(elements: HTMLElement[], stagger: number) {
  const pending = elements.filter(isBelowFold);
  if (pending.length === 0) return () => {};

  pending.forEach((element, index) => {
    element.dataset.reveal = "pending";
    if (stagger) element.style.transitionDelay = `${index * stagger}ms`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries)
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).dataset.reveal = "in";
          observer.unobserve(entry.target);
        }
    },
    { rootMargin: "0px 0px -12% 0px" },
  );
  for (const element of pending) observer.observe(element);

  // Failsafe: a full-page screenshot or an inactive tab never scrolls, and an
  // element that is waiting for an intersection that will not happen would ship
  // blank. Nothing stays hidden for longer than this.
  const failsafe = window.setTimeout(() => {
    for (const element of pending)
      if (element.dataset.reveal === "pending") element.dataset.reveal = "in";
    observer.disconnect();
  }, FAILSAFE_MS);

  return () => {
    window.clearTimeout(failsafe);
    observer.disconnect();
  };
}

/**
 * Scroll reveal that starts from the visible state.
 *
 * The server sends plain markup with no hidden style, so content is there
 * without JavaScript and for crawlers. Only after mount, and only for elements
 * still below the fold, does the client opt into the hidden-then-animate state.
 * Under `prefers-reduced-motion` nothing is ever hidden.
 */
export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return;
    return observeReveal([element], 0);
  }, []);

  return (
    <div className={className} ref={ref}>
      {children}
    </div>
  );
}

/**
 * Staggers the direct children of a list or grid without adding a wrapper:
 * the rendered element *is* the list, so grid and list semantics stay intact.
 */
export function RevealGroup({
  as: Tag = "div",
  className,
  stagger = 60,
  children,
  ...rest
}: {
  as?: "div" | "ol" | "ul";
  className?: string;
  stagger?: number;
  children: ReactNode;
} & { "aria-label"?: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container || prefersReducedMotion()) return;
    return observeReveal([...container.children] as HTMLElement[], stagger);
  }, [stagger]);

  return (
    <Tag
      className={className}
      ref={
        ref as React.Ref<HTMLDivElement & HTMLOListElement & HTMLUListElement>
      }
      {...rest}
    >
      {children}
    </Tag>
  );
}
