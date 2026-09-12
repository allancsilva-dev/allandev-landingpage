"use client";

import { useCallback, useRef, useState } from "react";
import { CodeShotFrame, type CodeShotView } from "@/components/code-shot-frame";

/**
 * Tabs follow the ARIA pattern with roving tabindex: only the active tab is in
 * the tab order, and the arrow keys move between panels (S8).
 */
export function CodeShowcase({
  shots,
  rodape,
}: {
  shots: CodeShotView[];
  rodape: string;
}) {
  const [active, setActive] = useState(0);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const focusTab = useCallback((index: number) => {
    setActive(index);
    tabsRef.current[index]?.focus();
  }, []);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const last = shots.length - 1;
    if (event.key === "ArrowDown" || event.key === "ArrowRight")
      focusTab(active === last ? 0 : active + 1);
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft")
      focusTab(active === 0 ? last : active - 1);
    else if (event.key === "Home") focusTab(0);
    else if (event.key === "End") focusTab(last);
    else return;
    event.preventDefault();
  };

  const shot = shots[active];

  // Reserve the tallest panel up front so switching tabs never moves the page.
  const maxRatio = Math.max(...shots.map((item) => item.height / item.width));

  return (
    <div
      className="code-showcase"
      style={{ "--shot-max-ratio": maxRatio } as React.CSSProperties}
    >
      <div
        className="code-showcase-tabs"
        role="tablist"
        aria-label="Trechos de código"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
      >
        {shots.map((item, index) => (
          <button
            key={item.src}
            ref={(node) => {
              tabsRef.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`code-tab-${index}`}
            aria-controls={`code-panel-${index}`}
            aria-selected={index === active}
            tabIndex={index === active ? 0 : -1}
            onClick={() => setActive(index)}
          >
            <span className="code-showcase-tab-file">{item.titulo}</span>
            <span className="code-showcase-tab-project">{item.projeto}</span>
          </button>
        ))}
      </div>

      <div
        className="code-showcase-panel"
        role="tabpanel"
        id={`code-panel-${active}`}
        aria-labelledby={`code-tab-${active}`}
        tabIndex={0}
      >
        {shot && (
          <CodeShotFrame
            shot={shot}
            sizes="(max-width: 1023px) 100vw, 62vw"
            rights={false}
          />
        )}
      </div>

      <p className="code-showcase-rodape">{rodape}</p>
    </div>
  );
}
