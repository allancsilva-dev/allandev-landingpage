"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const STATUSES = ["MONTANDO AMBIENTE", "ABRINDO CONEXÕES", "PRONTO"] as const;
const STEP_MS = 620;
/** DESIGN.md caps the boot at 2,5s; three steps stay under it. */
const TOTAL_MS = STATUSES.length * STEP_MS;
const SESSION_KEY = "allandev-hero-boot";

function remember() {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // Best-effort: a blocked storage only means it may replay this session.
  }
}

let decision: boolean | null = null;

/**
 * Decided once, on the client, and cached so the snapshot stays referentially
 * stable. The server snapshot is always `false`, which is what keeps hydration
 * clean and the hero visible without JavaScript.
 */
function shouldBoot() {
  if (decision === null) {
    let seen = true;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      seen = true;
    }
    decision =
      !seen && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  return decision;
}

/**
 * Boot layer over the whole hero — first visit of the session only, skippable,
 * and never shown under reduced motion.
 *
 * The hero markup is server-rendered as `children` and stays in the DOM, so the
 * LCP image loads underneath while the layer is up. `inert` takes the covered
 * hero out of tab order instead of hiding it.
 *
 * No percentage counter: the page is static, so a progress number would be fake
 * progress, which DESIGN.md forbids.
 */
export function HeroStage({ children }: { children: ReactNode }) {
  const armed = useSyncExternalStore(
    () => () => {},
    shouldBoot,
    () => false,
  );
  const [dismissed, setDismissed] = useState(false);
  const [step, setStep] = useState(0);
  const booting = armed && !dismissed;

  useEffect(() => {
    if (!booting) return;
    const ticks = STATUSES.map((_, index) =>
      window.setTimeout(() => setStep(index), index * STEP_MS),
    );
    const end = window.setTimeout(() => {
      remember();
      setDismissed(true);
    }, TOTAL_MS);
    return () => {
      for (const tick of ticks) window.clearTimeout(tick);
      window.clearTimeout(end);
    };
  }, [booting]);

  function start() {
    remember();
    setDismissed(true);
  }

  return (
    <>
      {/* display: contents keeps the hero grid intact while inert applies. */}
      <div style={{ display: "contents" }} inert={booting}>
        {children}
      </div>
      {booting && (
        <div
          className="hero-boot"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <p className="hero-boot-brand">ALLAN.DEV OS</p>
          <p className="hero-boot-status">{STATUSES[step]}</p>
          <div className="hero-boot-bar" aria-hidden="true">
            <i style={{ animationDuration: `${TOTAL_MS}ms` }} />
          </div>
          <button className="hero-boot-start" type="button" onClick={start}>
            <span aria-hidden="true">▸</span> PRESS START
          </button>
        </div>
      )}
    </>
  );
}
