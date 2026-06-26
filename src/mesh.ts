import type { GradientStop, GradientVariant } from "./types";

export interface Layer {
  color: string;
  x: number;
  y: number;
  size: number;
  falloff: number;
  opacity: number;
}

/** Tiny deterministic PRNG so auto-layout & animation are stable per `seed`. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pleasant default placements for common blob counts (corners → edges → center).
const ANCHORS: Record<number, [number, number][]> = {
  1: [[50, 45]],
  2: [
    [25, 25],
    [78, 80],
  ],
  3: [
    [22, 20],
    [82, 30],
    [48, 88],
  ],
  4: [
    [20, 22],
    [82, 18],
    [22, 84],
    [84, 82],
  ],
  5: [
    [18, 20],
    [84, 22],
    [20, 82],
    [86, 84],
    [50, 50],
  ],
};

function anchorFor(i: number, n: number): [number, number] {
  const table = ANCHORS[n];
  if (table) return table[i]!;
  // Fall back to an even ring for larger counts.
  const t = (i / n) * Math.PI * 2;
  return [50 + Math.cos(t) * 34, 50 + Math.sin(t) * 34];
}

/** Resolve user stops + a variant into concrete, positioned blob layers. */
export function resolveLayers(
  colors: GradientStop[],
  seed: number
): Layer[] {
  const rand = mulberry32(seed + 1);
  const n = colors.length;
  return colors.map((stop, i) => {
    const s = typeof stop === "string" ? { color: stop } : stop;
    const [ax, ay] = anchorFor(i, n);
    const jitter = (k: number) => (rand() - 0.5) * k;
    return {
      color: s.color,
      x: s.x ?? clamp(ax + jitter(10), 0, 100),
      y: s.y ?? clamp(ay + jitter(10), 0, 100),
      size: s.size ?? 68,
      falloff: s.falloff ?? 1,
      opacity: s.opacity ?? 1,
    };
  });
}

export function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

/** A single blob layer → its CSS radial-gradient background.
 *
 * Every stop is the SAME hue with only its alpha changing. That matters: the
 * bare `transparent` keyword is transparent *black*, so fading a color to it
 * drags the edge through dark semi-transparent values — a faint dark ring that
 * visibly shimmers in sparse corners as the blob drifts. Keeping one hue and
 * letting `color-mix` interpolate alpha (premultiplied) removes the fringe, and
 * the extra stops smooth out banding. */
export function blobBackground(l: Layer): string {
  const c = (a: number) => withAlpha(l.color, a);
  const s = l.size;
  // `falloff` lets a blob hold its core color longer before easing out.
  const hold = clamp(l.falloff, 0, 1);
  const stops = [
    `${c(1)} 0%`,
    `${c(0.88)} ${(s * 0.22 * hold).toFixed(1)}%`,
    `${c(0.55)} ${(s * 0.48).toFixed(1)}%`,
    `${c(0.22)} ${(s * 0.7).toFixed(1)}%`,
    `${c(0.06)} ${(s * 0.86).toFixed(1)}%`,
    `${c(0)} ${s.toFixed(1)}%`,
  ].join(", ");
  return `radial-gradient(circle at ${l.x.toFixed(2)}% ${l.y.toFixed(
    2
  )}%, ${stops})`;
}

/** Non-mesh variants render as one flat background string. */
export function flatBackground(
  variant: Exclude<GradientVariant, "mesh" | "aurora">,
  layers: Layer[],
  angle: number
): string {
  const list = layers.map((l) => l.color);
  const stops = list
    .map((c, i) => `${c} ${(i / (list.length - 1)) * 100}%`)
    .join(", ");
  if (variant === "linear") return `linear-gradient(${angle}deg, ${stops})`;
  if (variant === "conic")
    return `conic-gradient(from ${angle}deg at 50% 50%, ${stops})`;
  return `radial-gradient(circle at 50% 35%, ${stops})`; // radial
}

/** The color at a given alpha, hue preserved. color-mix in srgb interpolates
 * premultiplied, so mixing toward `transparent` keeps the original hue instead
 * of darkening — exactly what we need for fringe-free blob edges. */
function withAlpha(color: string, a: number): string {
  return `color-mix(in srgb, ${color} ${(a * 100).toFixed(1)}%, transparent)`;
}
