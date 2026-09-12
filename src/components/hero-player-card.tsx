"use client";

import Image from "next/image";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import type { PointerEvent } from "react";
import { homeContent } from "@/lib/home-content";

const { identity, hud } = homeContent.hero;

export function HeroPlayerCard() {
  const reduceMotion = useReducedMotion();

  function tilt(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || matchMedia("(pointer: coarse)").matches) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    event.currentTarget.style.setProperty("--rx", `${-y * 5}deg`);
    event.currentTarget.style.setProperty("--ry", `${x * 6}deg`);
    event.currentTarget.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
    event.currentTarget.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
  }

  function reset(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.style.setProperty("--rx", "0deg");
    event.currentTarget.style.setProperty("--ry", "0deg");
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className="player-card pixel-corners"
        aria-label={`${identity.name}, ${identity.line}`}
        onPointerMove={tilt}
        onPointerLeave={reset}
        initial={false}
      >
        <div className="player-portrait">
          <Image
            src="/images/allan-arcade-portrait.webp"
            width={1024}
            height={1024}
            sizes="(max-width: 767px) 72vw, 220px"
            priority
            alt="Retrato em pixel art de Allan Carvalho trabalhando em um laptop"
          />
        </div>
        <strong>{identity.name}</strong>
        <p>{identity.line}</p>
        <dl>
          {hud.map((item) => (
            <div key={item.value}>
              <dt>{item.value}</dt>
              <dd>{item.label}</dd>
            </div>
          ))}
        </dl>
      </m.div>
    </LazyMotion>
  );
}
