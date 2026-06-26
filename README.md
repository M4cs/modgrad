# modgrad

Beautiful, optionally animated **mesh / blurry / grainy gradient backgrounds** for
React. One component, zero runtime dependencies, SSR-safe, no canvas or WebGL.

Reproduce the soft Arc-card look, build flowing animated hero backgrounds, or wash a
translucent gradient over a photo — all from a single `<Gradient />`.

**[→ Live demo](https://m4cs.github.io/modgrad/)**

```bash
bun add modgrad   # or npm / pnpm / yarn
```

## Quick start

The easiest way — **wrap your content** and it sits on top automatically (no
`position` or `z-index` wiring needed):

```tsx
import { Gradient } from "modgrad";

function Card() {
  return (
    <Gradient preset="arc" grain style={{ borderRadius: 24, padding: 32 }}>
      <h1>Your content</h1>
    </Gradient>
  );
}
```

When you pass children, `<Gradient>` renders a self-contained box: the gradient
fills it and the children sit above (their flex/grid layout is preserved, and
they stay interactive).

### As a background layer (no children)

With no children it's a bare fill layer — drop it into your own
`position: relative` container. Because it's absolutely positioned, **sibling
content must be elevated** (give it `position: relative` / a `z-index`), or it
will be painted under the gradient:

```tsx
<div style={{ position: "relative" }}>
  <Gradient preset="arc" grain />
  <div style={{ position: "relative", zIndex: 1 }}>Your content</div>
</div>
```

(Prefer the wrapper form above — it avoids this entirely.) The layer is
`pointer-events: none` and `aria-hidden`, so it never blocks clicks.

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

// Theme-aware: follows the OS, or force light/dark
<Gradient preset="arc" theme="system" />
<Gradient
  theme="dark"
  background={{ light: "#f4ecff", dark: "#160a2e" }}
  colors={{
    light: ["#f4768f", "#c98bff", "#7c6cff"],
    dark: ["#e8385e", "#b13ad8", "#4920d0"],
  }}
/>

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
| `colors`      | `Colors \| { light; dark }`                             | —           | The colors. A `Blob` is `{ color, x?, y?, size?, falloff?, opacity? }`. Can differ per theme. |
| `preset`      | `PresetName`                                            | —           | A curated palette + layout (see below). `colors` overrides it.        |
| `theme`       | `"system" \| "light" \| "dark"`                         | `"system"`  | `system` follows the OS and updates live. Picks `{ light, dark }` values. |
| `variant`     | `"mesh" \| "aurora" \| "linear" \| "radial" \| "conic"` | `"mesh"`    | How the colors are arranged.                                          |
| `angle`       | `number`                                                | `135`       | Angle for `linear` / `conic`.                                         |
| `background`  | `string \| { light; dark }`                             | preset/theme| Solid color painted behind every layer. Can differ per theme.         |
| `grain`       | `boolean \| number`                                     | `false`     | SVG film grain. `true` = `0.15`, or pass `0`–`1`.                     |
| `grainScale`  | `number`                                                | `180`       | Grain fineness (smaller = finer/denser).                              |
| `grainFrequency` | `number`                                             | —           | Set the noise `baseFrequency` directly (overrides `grainScale`).      |
| `grainOctaves`   | `number`                                             | `2`         | Noise octaves — more = softer/cloudier, fewer = tighter.              |
| `blur`        | `number`                                                | `0`         | Softness. Baked into the blobs for mesh/aurora (filter-free, no flicker); a CSS blur in px for linear/radial/conic. |
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
- **aurora** — same blobs blended with `screen` for glowing, neon overlaps. Wants a
  dark background (the `screen` blend washes out on light ones).
- **linear** / **radial** / **conic** — classic CSS gradients across your colors.

## `<Noise />` — texture without the gradient

Just the grain. Add a `blur` to frost what's behind it (a textured
`backdrop-blur`) and a `tint` for paper-like tones. Overlays anything, or wraps
content like `<Gradient>`.

```tsx
import { Noise } from "modgrad";

// paper-textured, tinted panel wrapping content
<Noise intensity={0.5} tint="#b8a575" tintAmount={0.25} style={{ padding: 24 }}>
  <p>Looks like paper.</p>
</Noise>

// frosted, textured glass over whatever's behind it
<Noise blur={10} intensity={0.35} tint="#fff" tintAmount={0.08} />
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `intensity` | `boolean \| number` | `0.15` | Grain strength (`true` = 0.15). |
| `scale` / `frequency` / `octaves` | `number` | `180` / — / `2` | Grain texture controls (same as `grain*` on `Gradient`). |
| `blur` | `number` | `0` | Backdrop blur in px — frosts the content behind. |
| `tint` | `string` | — | Wash color painted over the backdrop. |
| `tintAmount` | `number` | `0.12` | Tint opacity. |
| `opacity` / `blendMode` / `fixed` / `zIndex` / `className` / `style` / `children` | — | — | Same as `Gradient`. |

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
