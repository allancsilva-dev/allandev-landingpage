"use client";

import Image from "next/image";
import {
  LazyMotion,
  domAnimation,
  m,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import type { PointerEvent } from "react";

export function HomeStage() {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const smoothX = useSpring(pointerX, { stiffness: 130, damping: 22 });
  const smoothY = useSpring(pointerY, { stiffness: 130, damping: 22 });
  const rotateY = useTransform(smoothX, [0, 1], [-3.5, 3.5]);
  const rotateX = useTransform(smoothY, [0, 1], [3, -3]);
  const glowX = useTransform(smoothX, [0, 1], ["26%", "74%"]);
  const glowY = useTransform(smoothY, [0, 1], ["20%", "78%"]);

  function trackPointer(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || window.matchMedia("(pointer: coarse)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width);
    pointerY.set((event.clientY - bounds.top) / bounds.height);
  }

  function resetPointer() {
    pointerX.set(0.5);
    pointerY.set(0.5);
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className="home-stage"
        onPointerMove={trackPointer}
        onPointerLeave={resetPointer}
        style={{ rotateX, rotateY }}
      >
        <m.span
          className="home-stage-glow"
          aria-hidden="true"
          style={{ left: glowX, top: glowY }}
        />
        <span className="home-stage-circuit circuit-a" aria-hidden="true" />
        <span className="home-stage-circuit circuit-b" aria-hidden="true" />
        <span className="home-stage-circuit circuit-c" aria-hidden="true" />
        <div className="home-stage-image">
          <Image
            src="/images/nexos-tech-logo.png"
            width={1024}
            height={1024}
            sizes="(max-width: 767px) 92vw, (max-width: 1199px) 62vw, 58vw"
            loading="eager"
            alt="Logo Nexos Tech em azul, ciano, violeta e magenta, empresa fundada por Allan"
          />
        </div>
        <span className="home-stage-coordinate coordinate-a" aria-hidden="true">
          NODE / ALLAN-01
        </span>
        <span className="home-stage-coordinate coordinate-b" aria-hidden="true">
          SYSTEM ONLINE
        </span>
        <span className="home-stage-status">
          <span aria-hidden="true" />
          INFRA · SOFTWARE · OPERAÇÃO
        </span>
      </m.div>
    </LazyMotion>
  );
}
