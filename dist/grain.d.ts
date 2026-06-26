export interface GrainOptions {
    /** Fineness knob: smaller = finer/denser grain. Default 180. */
    scale?: number;
    /** Directly set the SVG noise `baseFrequency` (overrides `scale`). */
    frequency?: number;
    /** `numOctaves` — more = softer/cloudier, fewer = tighter speckle. Default 2. */
    octaves?: number;
}
/**
 * Generates an inline SVG fractal-noise data URL (the soft film grain you see
 * on Arc / Stripe style gradients). Uses feTurbulence — being vector, the
 * browser re-rasterizes it at the native device pixel density, so it stays
 * crisp on any display.
 *
 * `scale` is a fineness knob (smaller = finer); `frequency` / `octaves` give
 * full manual control over the underlying feTurbulence.
 */
export declare function grainDataUrl(opts?: GrainOptions): string;
