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
 * The noise is opaque grayscale centered on mid-gray, NOT black-with-alpha.
 * That's deliberate: blended with `overlay`, mid-gray noise both *lightens*
 * (cells > 0.5) and *darkens* (cells < 0.5) the gradient under it, so it
 * dithers away 8-bit colour banding — including in the dark regions, where a
 * black-only grain (overlay of black darkens at best, no-ops near black) can
 * never nudge a pixel up across a band edge. A flat mid-gray cell leaves the
 * pixel untouched, so the gradient's mean colour is preserved.
 *
 * `scale` is a fineness knob (smaller = finer); `frequency` / `octaves` give
 * full manual control over the underlying feTurbulence.
 */
export function grainDataUrl(opts: GrainOptions = {}): string {
  const { scale = 180, frequency, octaves = 2 } = opts;
  // High baseFrequency => small noise cells => fine, high-resolution grain.
  // 0.72 at the default scale; clamped so extreme values stay sane.
  const freq = frequency ?? 130 / clamp(scale, 24, 1200);
  const oct = Math.max(1, Math.round(octaves));
  // The tile is intentionally large so its repetition is imperceptible, while a
  // higher device-pixel render keeps each grain dot sharp.
  const tile = 300;
  // fractalNoise's red channel sits in ~[0,1] clustered around 0.5. Replicate
  // it across R/G/B (monochrome grain), force alpha opaque, and stretch the
  // contrast a touch (×CONTRAST about 0.5) so the dither has enough amplitude
  // to span a banding step without the grain reading as heavy. Built as a
  // matrix: out = CONTRAST·R + (0.5 − 0.5·CONTRAST).
  const CONTRAST = 1.35;
  const bias = (0.5 - 0.5 * CONTRAST).toFixed(4);
  const row = `${CONTRAST} 0 0 0 ${bias}`;
  const matrix = `${row}  ${row}  ${row}  0 0 0 0 1`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tile}" height="${tile}">
  <filter id="n" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="${freq.toFixed(
      4
    )}" numOctaves="${oct}" stitchTiles="stitch"/>
    <feColorMatrix type="matrix" values="${matrix}"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#n)"/>
</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}
