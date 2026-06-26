import { useEffect, useRef } from "react";
import type { WarpOptions } from "./types";
import { clamp } from "./mesh";

export interface ResolvedWarp {
  /** feTurbulence baseFrequency — small = big, smooth swirls. */
  freq: number;
  /** feDisplacementMap scale — how far pixels are pushed, in px. */
  intensity: number;
  /** numOctaves — turbulence detail. */
  octaves: number;
}

/**
 * Turn the user's `warp` prop into concrete filter numbers, or `null` when off.
 *
 * `scale` is inverted into a baseFrequency (bigger scale → lower frequency →
 * larger, smoother undulations). The defaults are tuned for a full-page mesh:
 * large, smooth molten swirls rather than fine ripples. Detail defaults to a
 * single octave — one smooth (Perlin-like) field is the blobby WebGL-shader
 * look; extra octaves add fine ripples that read as jitter once things move.
 */
export function resolveWarp(
  warp: boolean | WarpOptions | undefined
): ResolvedWarp | null {
  if (!warp) return null;
  const o = warp === true ? {} : warp;
  const scale = clamp(o.scale ?? 1, 0.2, 6);
  return {
    // 0.008 at scale 1 → roomy swirls; clamped so extremes stay sane.
    freq: 0.008 / scale,
    intensity: clamp(o.intensity ?? 55, 0, 300),
    octaves: clamp(Math.round(o.detail ?? 1), 1, 4),
  };
}

/**
 * The inline SVG `<filter>` that does the warping. It's zero-size and absolutely
 * positioned (it only defines a filter; nothing paints here). The blob layer
 * references it via `filter: url(#id)`.
 *
 * `feTurbulence` generates a noise field; `feDisplacementMap` pushes every pixel
 * of the source (the color blobs) along that field — circles become organic
 * swirls and waves.
 *
 * **Static vs. animated.** With `animate` off the filter is frozen: a fixed lens
 * the (also-static) colors sit in — zero cost, zero jitter. With `animate` on,
 * the colors are already drifting, so the filter region re-rasterizes every
 * frame regardless; we therefore evolve the *field itself* for free. The
 * morph is the WebGL-shader trick: rather than a fixed distortion that the
 * colors merely slide across (which wobbles at the noise's fine scale), the
 * noise slowly breathes between forms. To stay smooth we:
 *   - advance a phase by `dt × speed` (rate-integrated → a speed change bends
 *     the motion, never snaps it);
 *   - morph `baseFrequency` per-axis with slow, out-of-phase sines (anisotropic
 *     stretch that keeps shifting form) over a small range — small + slow reads
 *     as a flowing liquid, not a boil;
 *   - breathe `feDisplacementMap@scale` so the distortion swells and relaxes.
 * The region is oversized so the mesh's overscanned edges are never clipped.
 */
export function WarpFilter({
  id,
  warp,
  animate = false,
  speed = 1,
}: {
  id: string;
  warp: ResolvedWarp;
  animate?: boolean;
  speed?: number;
}) {
  const { freq, intensity, octaves } = warp;
  const turbRef = useRef<SVGFETurbulenceElement>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);
  const speedRef = useRef(speed);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    const turb = turbRef.current;
    const disp = dispRef.current;
    if (!animate || !turb || !disp) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let raf = 0;
    let last = 0;
    let phase = 0;
    const tick = (t: number) => {
      if (!last) last = t;
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      phase += dt * speedRef.current;
      // Per-axis frequency morph (±18% around `freq`), slow and out of phase so
      // the field stretches and reshapes rather than uniformly zooming.
      const fx = freq * (1 + 0.18 * Math.sin(phase * 0.5));
      const fy = freq * (1 + 0.18 * Math.sin(phase * 0.61 + 1.7));
      turb.setAttribute("baseFrequency", `${fx.toFixed(5)} ${fy.toFixed(5)}`);
      // Gentle ±12% breathing of the displacement strength.
      const sc = intensity * (1 + 0.12 * Math.sin(phase * 0.43 + 0.9));
      disp.setAttribute("scale", sc.toFixed(2));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      // Restore the canonical field — the rAF mutated these attributes directly,
      // so React won't reset them when animation stops.
      turb.setAttribute("baseFrequency", freq.toFixed(5));
      disp.setAttribute("scale", String(intensity));
    };
  }, [animate, freq, intensity]);

  return (
    <svg
      aria-hidden
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0 }}
    >
      <filter
        id={id}
        x="-50%"
        y="-50%"
        width="200%"
        height="200%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          ref={turbRef}
          type="fractalNoise"
          baseFrequency={freq.toFixed(5)}
          numOctaves={octaves}
          seed={7}
          // NOT "stitch": stitching quantizes baseFrequency to a tile-aligned
          // value, so morphing it snaps in discrete steps instead of flowing.
          // The region is oversized + content overscanned, so seams never show.
          stitchTiles="noStitch"
          result="noise"
        />
        <feDisplacementMap
          ref={dispRef}
          in="SourceGraphic"
          in2="noise"
          scale={intensity}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}
