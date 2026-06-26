import { useEffect, useRef } from "react";
import { mulberry32 } from "./mesh";

interface MotionOpts {
  count: number;
  animate: boolean;
  speed: number;
  interactive: boolean;
  seed: number;
}

/**
 * Drives per-layer transforms with a single rAF loop: slow sinusoidal drift
 * (animate) and/or easing toward the pointer (interactive). Returns refs to
 * attach to each layer element. No-ops (and parks the loop) when idle.
 */
export function useLayerMotion({
  count,
  animate,
  speed,
  interactive,
  seed,
}: MotionOpts) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const pointer = useRef({ x: 0, y: 0 }); // target, normalized -0.5..0.5
  const current = useRef({ x: 0, y: 0 }); // eased pointer

  // Stable per-layer motion params derived from the seed.
  const params = useRef(
    Array.from({ length: count }, (_, i) => {
      const rand = mulberry32(seed * 1000 + i + 1);
      return {
        ampX: 4 + rand() * 5,
        ampY: 4 + rand() * 5,
        phaseX: rand() * Math.PI * 2,
        phaseY: rand() * Math.PI * 2,
        freqX: 0.6 + rand() * 0.6,
        freqY: 0.6 + rand() * 0.6,
        pull: 6 + rand() * 8, // how far this layer chases the pointer (%)
      };
    })
  );

  useEffect(() => {
    if (!interactive) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = e.clientX / window.innerWidth - 0.5;
      pointer.current.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [interactive]);

  useEffect(() => {
    const els = refs.current;
    // Respect the OS "reduce motion" setting for the ambient drift.
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const drift = animate && !reduce;
    if (!drift && !interactive) {
      els.forEach((el) => el && (el.style.transform = ""));
      return;
    }
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const time = ((t - start) / 1000) * speed;
      // ease pointer toward target
      current.current.x += (pointer.current.x - current.current.x) * 0.06;
      current.current.y += (pointer.current.y - current.current.y) * 0.06;
      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        const p = params.current[i];
        if (!el || !p) continue;
        let dx = 0;
        let dy = 0;
        if (drift) {
          dx += Math.sin(time * p.freqX + p.phaseX) * p.ampX;
          dy += Math.cos(time * p.freqY + p.phaseY) * p.ampY;
        }
        if (interactive) {
          dx += current.current.x * p.pull;
          dy += current.current.y * p.pull;
        }
        el.style.transform = `translate3d(${dx.toFixed(2)}%, ${dy.toFixed(
          2
        )}%, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate, interactive, speed]);

  return refs;
}
