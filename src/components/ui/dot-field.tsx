"use client";

import {
  memo,
  useEffect,
  useId,
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
} from "react";

/*
 * Adapted from React Bits DotField (TS-TW): typed for the strict tsconfig,
 * cursor tracked in viewport coordinates so it stays aligned inside a fixed
 * layer while the page scrolls, and a static frame under reduced motion.
 */

const TWO_PI = Math.PI * 2;

const layerStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
};

interface Dot {
  ax: number;
  ay: number;
  sx: number;
  sy: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
}

interface DotFieldSettings {
  dotRadius: number;
  dotSpacing: number;
  cursorRadius: number;
  cursorForce: number;
  bulgeOnly: boolean;
  bulgeStrength: number;
  sparkle: boolean;
  waveAmplitude: number;
  gradientFrom: string;
  gradientTo: string;
}

type DotFieldProps = Partial<DotFieldSettings> & {
  glowRadius?: number;
  glowColor?: string;
} & ComponentPropsWithoutRef<"div">;

export const DotField = memo(function DotField({
  dotRadius = 1.5,
  dotSpacing = 14,
  cursorRadius = 500,
  cursorForce = 0.1,
  bulgeOnly = true,
  bulgeStrength = 67,
  glowRadius = 160,
  sparkle = false,
  waveAmplitude = 0,
  gradientFrom = "rgba(168, 85, 247, 0.35)",
  gradientTo = "rgba(180, 151, 207, 0.25)",
  glowColor = "#120F17",
  className,
  style,
  ...rest
}: DotFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const settings: DotFieldSettings = {
    dotRadius,
    dotSpacing,
    cursorRadius,
    cursorForce,
    bulgeOnly,
    bulgeStrength,
    sparkle,
    waveAmplitude,
    gradientFrom,
    gradientTo,
  };
  const settingsRef = useRef(settings);
  const rebuildRef = useRef<(() => void) | null>(null);
  const glowId = `dot-field-glow-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    settingsRef.current = settings;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const glowEl = glowRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 };
    const size = { w: 0, h: 0 };
    let dots: Dot[] = [];
    let engagement = 0;
    let glowOpacity = 0;
    let frameCount = 0;
    let raf: number | null = null;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    function buildDots(w: number, h: number) {
      const p = settingsRef.current;
      const step = p.dotRadius + p.dotSpacing;
      const cols = Math.floor(w / step);
      const rows = Math.floor(h / step);
      const padX = (w % step) / 2;
      const padY = (h % step) / 2;
      const next: Dot[] = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const ax = padX + col * step + step / 2;
          const ay = padY + row * step + step / 2;
          next.push({ ax, ay, sx: ax, sy: ay, vx: 0, vy: 0, x: ax, y: ay });
        }
      }
      dots = next;
    }

    function draw() {
      if (!ctx) return;
      frameCount++;
      const p = settingsRef.current;
      const { w, h } = size;
      const t = frameCount * 0.02;

      const targetEngagement = Math.min(mouse.speed / 5, 1);
      engagement += (targetEngagement - engagement) * 0.06;
      if (engagement < 0.001) engagement = 0;
      const eng = engagement;

      glowOpacity += (eng - glowOpacity) * 0.08;
      if (glowEl) {
        glowEl.setAttribute("cx", String(mouse.x));
        glowEl.setAttribute("cy", String(mouse.y));
        glowEl.style.opacity = String(glowOpacity);
      }

      ctx.clearRect(0, 0, w, h);
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, p.gradientFrom);
      grad.addColorStop(1, p.gradientTo);
      ctx.fillStyle = grad;

      const cr = p.cursorRadius;
      const crSq = cr * cr;
      const rad = p.dotRadius / 2;

      ctx.beginPath();
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        if (!d) continue;
        const dx = mouse.x - d.ax;
        const dy = mouse.y - d.ay;
        const distSq = dx * dx + dy * dy;

        if (distSq < crSq && eng > 0.01) {
          const dist = Math.sqrt(distSq);
          const angle = Math.atan2(dy, dx);
          if (p.bulgeOnly) {
            const falloff = 1 - dist / cr;
            const push = falloff * falloff * p.bulgeStrength * eng;
            d.sx += (d.ax - Math.cos(angle) * push - d.sx) * 0.15;
            d.sy += (d.ay - Math.sin(angle) * push - d.sy) * 0.15;
          } else {
            const move = (500 / dist) * (mouse.speed * p.cursorForce);
            d.vx += Math.cos(angle) * -move;
            d.vy += Math.sin(angle) * -move;
          }
        } else if (p.bulgeOnly) {
          d.sx += (d.ax - d.sx) * 0.1;
          d.sy += (d.ay - d.sy) * 0.1;
        }

        if (!p.bulgeOnly) {
          d.vx *= 0.9;
          d.vy *= 0.9;
          d.x = d.ax + d.vx;
          d.y = d.ay + d.vy;
          d.sx += (d.x - d.sx) * 0.1;
          d.sy += (d.y - d.sy) * 0.1;
        }

        let drawX = d.sx;
        let drawY = d.sy;
        if (p.waveAmplitude > 0) {
          drawY += Math.sin(d.ax * 0.03 + t) * p.waveAmplitude;
          drawX += Math.cos(d.ay * 0.03 + t * 0.7) * p.waveAmplitude * 0.5;
        }

        let r = rad;
        if (p.sparkle) {
          const hash = ((i * 2654435761) ^ (frameCount >> 3)) >>> 0;
          if (hash % 100 < 3) r = rad * 1.8;
        }
        ctx.moveTo(drawX + r, drawY);
        ctx.arc(drawX, drawY, r, 0, TWO_PI);
      }
      ctx.fill();
    }

    function doResize() {
      const parent = canvas?.parentElement;
      if (!canvas || !ctx || !parent) return;
      const rect = parent.getBoundingClientRect();
      size.w = rect.width;
      size.h = rect.height;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildDots(rect.width, rect.height);
      if (reducedMotion) draw();
    }

    function resize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(doResize, 100);
    }

    function onMouseMove(event: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    }

    function updateMouseSpeed() {
      const dx = mouse.prevX - mouse.x;
      const dy = mouse.prevY - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      mouse.speed += (dist - mouse.speed) * 0.5;
      if (mouse.speed < 0.001) mouse.speed = 0;
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
    }

    function tick() {
      draw();
      raf = requestAnimationFrame(tick);
    }

    doResize();
    window.addEventListener("resize", resize);
    rebuildRef.current = () => {
      if (size.w > 0 && size.h > 0) buildDots(size.w, size.h);
      if (reducedMotion) draw();
    };

    // Reduced motion: one static frame, no cursor tracking or animation loop.
    if (reducedMotion) {
      return () => {
        clearTimeout(resizeTimer);
        window.removeEventListener("resize", resize);
      };
    }

    const speedInterval = setInterval(updateMouseSpeed, 20);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      clearInterval(speedInterval);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  useEffect(() => {
    rebuildRef.current?.();
  }, [dotRadius, dotSpacing]);

  // Inline layout styles: the field must not depend on a stylesheet being
  // loaded or Tailwind scanning this file to get a non-zero size.
  return (
    <div
      className={className}
      aria-hidden="true"
      {...rest}
      style={{ position: "relative", width: "100%", height: "100%", ...style }}
    >
      <canvas ref={canvasRef} style={layerStyle} />
      <svg style={{ ...layerStyle, pointerEvents: "none" }}>
        <defs>
          <radialGradient id={glowId}>
            <stop offset="0%" stopColor={glowColor} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle
          ref={glowRef}
          cx="-9999"
          cy="-9999"
          r={glowRadius}
          fill={`url(#${glowId})`}
          style={{ opacity: 0, willChange: "opacity" }}
        />
      </svg>
    </div>
  );
});
