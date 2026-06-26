# modgrad

Beautiful, optionally animated **mesh / blurry / grainy gradient backgrounds** for
React. One component, zero runtime dependencies, SSR-safe, no canvas or WebGL.

Reproduce the soft Arc-card look, build flowing animated hero backgrounds, or wash a
translucent gradient over a photo — all from a single `<Gradient />`.

```bash
bun add modgrad   # or npm / pnpm / yarn
```

## Quick start

Drop it into any `position: relative` container — it fills the parent:

```tsx
import { Gradient } from "modgrad";

function Card() {
  return (
    <div style={{ position: "relative", borderRadius: 24, overflow: "hidden" }}>
      <Gradient preset="arc" grain />
      <div style={{ position: "relative", padding: 32 }}>Your content</div>
    </div>
  );
}
```

That's it. The gradient is `position: absolute; inset: 0`, `pointer-events: none`, and
`aria-hidden`, so it sits behind your content without interfering.

## Recipes

```tsx
// The Arc card gradient
<Gradient preset="arc" grain={0.16} />

// Custom mesh of your brand colors
<Gradient colors={["#e8385e", "#b13ad8", "#4920d0", "#f6d8ec"]} grain blur={30} />

// Living, animated hero background that reacts to the cursor
<Gradient preset="sunset" animate interactive grain />

// Translucent overlay on top of a photo / video
<div style={{ position: "relative" }}>
  <img src="/photo.jpg" />
  <Gradient
    colors={["#ff5e62", "#7b2ff7", "#1fa2ff"]}
    opacity={0.7}
    blendMode="overlay"
  />
</div>

// Full-viewport app background
<Gradient preset="ocean" fixed animate />

// Precise control: place each color blob yourself (x/y are 0–100)
<Gradient
  colors={[
    { color: "#e8385e", x: 20, y: 18, size: 70 },
    { color: "#4920d0", x: 75, y: 90, size: 80 },
  ]}
/>
```

## Props

| Prop          | Type                                                    | Default     | Description                                                            |
| ------------- | ------------------------------------------------------- | ----------- | --------------------------------------------------------------------- |
| `colors`      | `(string \| Blob)[]`                                    | —           | The colors. A `Blob` is `{ color, x?, y?, size?, falloff?, opacity? }`. |
| `preset`      | `PresetName`                                            | —           | A curated palette + layout (see below). `colors` overrides it.        |
| `variant`     | `"mesh" \| "aurora" \| "linear" \| "radial" \| "conic"` | `"mesh"`    | How the colors are arranged.                                          |
| `angle`       | `number`                                                | `135`       | Angle for `linear` / `conic`.                                         |
| `background`  | `string`                                                | preset/dark | Solid color painted behind every layer.                               |
| `grain`       | `boolean \| number`                                     | `false`     | SVG film grain. `true` = `0.15`, or pass `0`–`1`.                     |
| `grainScale`  | `number`                                                | `180`       | Grain tile size in px (smaller = finer).                              |
| `blur`        | `number`                                                | `0`         | Gaussian blur on the color layers, in px.                             |
| `animate`     | `boolean \| { speed?: number }`                         | `false`     | Slow organic drift. Honors `prefers-reduced-motion`.                  |
| `interactive` | `boolean`                                               | `false`     | Layers drift toward the pointer.                                      |
| `opacity`     | `number`                                                | `1`         | Overall opacity (for overlays).                                       |
| `blendMode`   | CSS `mix-blend-mode`                                    | —           | Blend against what's behind it (for overlays).                        |
| `fixed`       | `boolean`                                               | `false`     | Render as a fixed full-viewport layer.                                |
| `zIndex`      | `number`                                                | —           | Stacking order.                                                       |
| `seed`        | `number`                                                | `1`         | Deterministic auto-layout & animation seed.                           |
| `className` / `style` / `children` | —                                  | —           | Forwarded to the root element.                                        |

## Variants

- **mesh** — layered radial "blobs", one per color. The smooth Arc/Stripe look. Default.
- **aurora** — same blobs blended with `screen` for glowing, neon overlaps.
- **linear** / **radial** / **conic** — classic CSS gradients across your colors.

## Presets

`arc` · `sunset` · `ocean` · `aurora` · `peach` · `mint` · `dusk` · `candy` · `mono` · `ember`

```tsx
import { presets } from "modgrad";
Object.keys(presets); // inspect or remix any palette
```

## How it works

- **Mesh** = stacked `radial-gradient` layers over a base color, auto-placed toward the
  corners/edges (override with explicit `x`/`y`).
- **Grain** = an inline `feTurbulence` SVG noise tile blended with `overlay` — crisp at
  any DPI, weighs nothing, no image assets.
- **Blur** is applied only to the color layers, so grain stays sharp on top.
- **Animate / interactive** drive per-layer `translate3d` from a single
  `requestAnimationFrame` loop (GPU-friendly, parks itself when idle).

No canvas, no WebGL, no dependencies — just DOM and CSS, so it renders on the server and
streams fine.

## Development

```bash
bun install
bun run dev    # live demo gallery at http://localhost:3000
bun run build  # emits dist/ (ESM + .d.ts)
```

## License

MIT
