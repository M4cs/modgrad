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
export declare function mulberry32(seed: number): () => number;
/** Resolve user stops + a variant into concrete, positioned blob layers. */
export declare function resolveLayers(colors: GradientStop[], seed: number): Layer[];
export declare function clamp(v: number, lo: number, hi: number): number;
/** A single blob layer → its CSS radial-gradient background.
 *
 * Every stop is the SAME hue with only its alpha changing. That matters: the
 * bare `transparent` keyword is transparent *black*, so fading a color to it
 * drags the edge through dark semi-transparent values — a faint dark ring that
 * visibly shimmers in sparse corners as the blob drifts. Keeping one hue and
 * letting `color-mix` interpolate alpha (premultiplied) removes the fringe, and
 * the extra stops smooth out banding. */
export declare function blobBackground(l: Layer): string;
/** Non-mesh variants render as one flat background string. */
export declare function flatBackground(variant: Exclude<GradientVariant, "mesh" | "aurora">, layers: Layer[], angle: number): string;
