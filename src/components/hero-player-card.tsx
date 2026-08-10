"use client";

import Image from "next/image";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { useEffect, useState, type PointerEvent } from "react";

export function HeroPlayerCard() {
  const reduceMotion = useReducedMotion();
  const [booting, setBooting] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    try {
      if (sessionStorage.getItem("allandev-hero-boot") !== "1") {
        const reveal = window.setTimeout(() => setBooting(true), 0);
        const timer = window.setTimeout(() => {
          sessionStorage.setItem("allandev-hero-boot", "1");
          setBooting(false);
        }, 2200);
        return () => {
          window.clearTimeout(reveal);
          window.clearTimeout(timer);
        };
      }
    } catch {
      return;
    }
  }, [reduceMotion]);

  function skipBoot() {
    try {
      sessionStorage.setItem("allandev-hero-boot", "1");
    } catch {}
    setBooting(false);
  }

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
        className="player-card"
        aria-label="Allan Carvalho, desenvolvedor full-stack e infraestrutura"
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
          {booting && (
            <div className="hero-boot" role="status" aria-live="polite">
              <span>Allan.Dev OS</span>
              <strong>CARREGANDO PERFIL...</strong>
              <button type="button" onClick={skipBoot}>PULAR</button>
            </div>
          )}
        </div>
        <strong>ALLAN CARVALHO</strong>
        <p>Full Stack Developer · Infraestrutura</p>
        <dl>
          <div><dt>FULL</dt><dd>Da infra à interface</dd></div>
          <div><dt>24H</dt><dd>Retorno inicial</dd></div>
        </dl>
      </m.div>
    </LazyMotion>
  );
}
