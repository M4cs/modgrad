/**
 * Generates an inline SVG fractal-noise data URL (the soft film grain you see
 * on Arc / Stripe style gradients). Uses feTurbulence — being vector, the
 * browser re-rasterizes it at the native device pixel density, so it stays
 * crisp on any display.
 *
 * `scale` is a fineness knob (smaller = finer); `frequency` / `octaves` give
 * full manual control over the underlying feTurbulence.
 */
export function grainDataUrl(opts = {}) {
    const { scale = 180, frequency, octaves = 2 } = opts;
    // High baseFrequency => small noise cells => fine, high-resolution grain.
    // 0.72 at the default scale; clamped so extreme values stay sane.
    const freq = frequency ?? 130 / clamp(scale, 24, 1200);
    const oct = Math.max(1, Math.round(octaves));
    // The tile is intentionally large so its repetition is imperceptible, while a
    // higher device-pixel render keeps each grain dot sharp.
    const tile = 300;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tile}" height="${tile}">
  <filter id="n" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="${freq.toFixed(4)}" numOctaves="${oct}" stitchTiles="stitch"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#n)"/>
</svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
function clamp(v, lo, hi) {
    return Math.min(hi, Math.max(lo, v));
}
