import { useEffect, useRef } from "react";
import { mulberry32 } from "./mesh";

interface MotionOpts {
  count: number;
  animate: boolean;
  speed: number;
  interactive: boolean;
  seed: number;
  /** Multiplies the ambient drift amplitude. >1 makes the colors travel
   * further — used by `warp` so the static deformation visibly flows. */
  driftScale?: number;
}

/**
 * Drives per-layer transforms with a single rAF loop: slow organic drift
 * (animate) and/or easing toward the pointer (interactive). Returns refs to
 * attach to each layer element. No-ops (and parks the loop) when idle.
 *
 * Smoothness is the whole game here, especially under `warp` (the colors slide
 * through a fixed displacement field, so any stutter in the drift is magnified
 * into a visible jump). Two things guarantee it:
 *
 *  1. **Rate-integrated phase, not `elapsed × speed`.** We advance a phase
 *     accumulator by `dt × speed` each frame. Changing `speed` then only
 *     changes the *derivative* of motion — the position is continuous across
 *     the change, so the speed slider never snaps. `speed` and `driftScale`
 *     live in refs (not effect deps) so the loop is never torn down and
 *     restarted mid-flight (which used to reset the clock and jump every blob).
 *
 *  2. **Sum of two incommensurate sines per axis.** A single sine dead-stops
 *     and reverses at each peak — through a warp that reads as a snap. Adding a
 *     second sine at an irrational-ish frequency ratio makes the path
 *     quasi-periodic: it effectively never repeats, the two components almost
 *     never peak together, and it stays perfectly smooth (C∞). That is the
 *     "infinite, randomized, jitter-free" displacement.
 */
export function useLayerMotion({
  count,
  animate,
  speed,
  interactive,
  seed,
  driftScale = 1,
}: MotionOpts) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const pointer = useRef({ x: 0, y: 0 }); // target, normalized -0.5..0.5
  const current = useRef({ x: 0, y: 0 }); // eased pointer

  // Live knobs read inside the rAF loop so changing them never restarts it.
  const speedRef = useRef(speed);
  const driftScaleRef = useRef(driftScale);
  useEffect(() => {
    speedRef.current = speed;
    driftScaleRef.current = driftScale;
  }, [speed, driftScale]);

  // Stable per-layer motion params derived from the seed. Each axis is a sum of
  // a slow primary sine and a faster, smaller secondary sine at a deliberately
  // non-integer frequency ratio, so the combined path never loops.
  const params = useRef(
    Array.from({ length: count }, (_, i) => {
      const rand = mulberry32(seed * 1000 + i + 1);
      return {
        ampX: 4 + rand() * 5,
        ampY: 4 + rand() * 5,
        ampX2: 1.5 + rand() * 2.5,
        ampY2: 1.5 + rand() * 2.5,
        phaseX: rand() * Math.PI * 2,
        phaseY: rand() * Math.PI * 2,
        phaseX2: rand() * Math.PI * 2,
        phaseY2: rand() * Math.PI * 2,
        freqX: 0.5 + rand() * 0.35,
        freqY: 0.5 + rand() * 0.35,
        freqX2: 1.27 + rand() * 0.6,
        freqY2: 1.27 + rand() * 0.6,
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
    let last = 0;
    // Rate-integrated drift clock (seconds × speed). Kept continuous so a live
    // speed change bends the motion instead of snapping it.
    let phase = 0;
    const tick = (t: number) => {
      if (!last) last = t;
      // Clamp dt so a backgrounded tab (one huge frame) can't lurch the phase.
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      if (drift) phase += dt * speedRef.current;
      const ds = driftScaleRef.current;
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
          dx +=
            (Math.sin(phase * p.freqX + p.phaseX) * p.ampX +
              Math.sin(phase * p.freqX2 + p.phaseX2) * p.ampX2) *
            ds;
          dy +=
            (Math.cos(phase * p.freqY + p.phaseY) * p.ampY +
              Math.cos(phase * p.freqY2 + p.phaseY2) * p.ampY2) *
            ds;
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
    // `speed`/`driftScale` intentionally excluded — read from refs so the loop
    // is never restarted (which would reset the clock and jump every layer).
  }, [animate, interactive]);

  return refs;
}
