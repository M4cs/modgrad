import type { CSSProperties } from "react";
import { grainDataUrl } from "./grain";

const FILL: CSSProperties = { position: "absolute", inset: 0 };

export interface NoiseProps {
  /** Grain strength. `true` = 0.15, or pass 0–1. Default 0.15. */
  intensity?: boolean | number;
  /** Grain fineness (smaller = finer/denser). Default 180. */
  scale?: number;
  /** Set the noise `baseFrequency` directly (overrides `scale`). */
  frequency?: number;
  /** Noise octaves — more = softer/cloudier, fewer = tighter. Default 2. */
  octaves?: number;
  /** How the grain blends with what's behind it. Default "overlay". */
  grainBlendMode?: CSSProperties["mixBlendMode"];

  /** Backdrop blur in px — frosts the content behind, like a textured
   * `backdrop-blur`. Default 0. */
  blur?: number;

  /** Optional wash color (e.g. a paper tone) painted over the backdrop. */
  tint?: string;
  /** Tint opacity, 0–1. Default 0.12. */
  tintAmount?: number;

  /** Overall opacity, 0–1. */
  opacity?: number;
  /** Blend the whole layer against what's behind it. */
  blendMode?: CSSProperties["mixBlendMode"];

  /** Render as a fixed full-viewport layer. */
  fixed?: boolean;
  /** Stacking order (layer mode). */
  zIndex?: number;

  className?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
}

/**
 * A texture-only layer: SVG film grain, an optional backdrop blur and an
 * optional tint — no gradient. Drop it over anything for a paper / frosted-glass
 * feel, or wrap content to make a textured panel (content sits above
 * automatically, same as `<Gradient>`).
 */
export function Noise(props: NoiseProps) {
  const {
    intensity = 0.15,
    scale = 180,
    frequency,
    octaves,
    grainBlendMode = "overlay",
    blur = 0,
    tint,
    tintAmount = 0.12,
    opacity = 1,
    blendMode,
    fixed = false,
    zIndex,
    className,
    style,
    children,
  } = props;

  const grainAmount =
    intensity === true ? 0.15 : intensity === false ? 0 : intensity;

  // The texture itself: optional tint wash + grain, with the backdrop blur on
  // the same surface so the frost and texture read together.
  const surface: CSSProperties = {
    backdropFilter: blur ? `blur(${blur}px)` : undefined,
    WebkitBackdropFilter: blur ? `blur(${blur}px)` : undefined,
    background: tint
      ? `color-mix(in srgb, ${tint} ${Math.round(tintAmount * 100)}%, transparent)`
      : undefined,
  };

  const grain =
    grainAmount > 0 ? (
      <div
        style={{
          ...FILL,
          backgroundImage: grainDataUrl({ scale, frequency, octaves }),
          backgroundRepeat: "repeat",
          opacity: grainAmount,
          mixBlendMode: grainBlendMode,
        }}
      />
    ) : null;

  // BOX MODE — wrap content: texture sits behind, content stays on top with no
  // z-index wiring (the isolate wrapper scopes the texture's negative z).
  if (children != null && children !== false) {
    return (
      <div
        className={className}
        style={{ position: "relative", isolation: "isolate", ...style }}
      >
        <div
          aria-hidden
          style={{
            ...FILL,
            zIndex: -1,
            overflow: "hidden",
            pointerEvents: "none",
            borderRadius: "inherit",
            opacity,
            mixBlendMode: blendMode,
            ...surface,
          }}
        >
          {grain}
        </div>
        {children}
      </div>
    );
  }

  // LAYER MODE — a bare overlay to drop on top of anything.
  return (
    <div
      aria-hidden
      className={className}
      style={{
        ...(fixed ? { position: "fixed", inset: 0 } : FILL),
        overflow: "hidden",
        pointerEvents: "none",
        opacity,
        mixBlendMode: blendMode,
        zIndex,
        ...surface,
        ...style,
      }}
    >
      {grain}
    </div>
  );
}
