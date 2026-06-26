import { useMemo } from "react";
import type { CSSProperties } from "react";
import type { GradientProps, GradientStop } from "./types";
import { presets } from "./presets";
import {
  resolveLayers,
  blobBackground,
  flatBackground,
  type Layer,
} from "./mesh";
import { grainDataUrl } from "./grain";
import { useLayerMotion } from "./useLayerMotion";
import { useResolvedTheme, pickTheme } from "./theme";

const FILL: CSSProperties = {
  position: "absolute",
  inset: 0,
};

// Layers are drawn at OVERSCAN× the container size and centered, so their edges
// (and the soft fade of a blur) always sit outside the clipped viewport — even
// while animating or chasing the pointer. EDGE is the margin on each side, in %.
const OVERSCAN = 2;
const EDGE = ((OVERSCAN - 1) / 2) * 100; // 50

/**
 * A beautiful, optionally animated gradient layer. Drop it into any
 * `position: relative` container as a background, or give it `opacity` /
 * `blendMode` to use as a translucent overlay.
 */
export function Gradient(props: GradientProps) {
  const {
    preset,
    variant: variantProp,
    angle = 135,
    grain = false,
    grainScale = 180,
    grainFrequency,
    grainOctaves,
    blur = 0,
    animate = false,
    interactive = false,
    opacity = 1,
    blendMode,
    fixed = false,
    zIndex,
    className,
    style,
    children,
    seed = 1,
    theme = "system",
  } = props;

  const resolvedTheme = useResolvedTheme(theme);

  const base = preset ? presets[preset] : undefined;
  const colors: GradientStop[] =
    pickTheme(props.colors ?? base?.colors, resolvedTheme) ?? defaultColors;
  const variant = variantProp ?? base?.variant ?? "mesh";
  const background =
    pickTheme(props.background ?? base?.background, resolvedTheme) ??
    (resolvedTheme === "light" ? "#f4f4f7" : "#11111a");
  const effAngle = props.angle ?? base?.angle ?? angle;

  const layers = useMemo(
    () => resolveLayers(colors, seed),
    // colors identity may change each render; stringify for a stable key.
    [JSON.stringify(colors), seed]
  );

  const isLayered = variant === "mesh" || variant === "aurora";
  const animateOn = !!animate;
  const speed =
    typeof animate === "object" && animate.speed ? animate.speed : 1;

  const motionRefs = useLayerMotion({
    count: isLayered ? layers.length : 0,
    animate: animateOn,
    speed,
    interactive,
    seed,
  });

  const grainAmount = grain === true ? 0.15 : grain === false ? 0 : grain;

  const container: CSSProperties = {
    ...(fixed ? { position: "fixed", inset: 0 } : FILL),
    overflow: "hidden",
    pointerEvents: "none",
    isolation: "isolate",
    opacity,
    mixBlendMode: blendMode,
    zIndex,
    background,
    ...style,
  };

  return (
    <div className={className} style={container} aria-hidden>
      {isLayered ? (
        <div
          style={{
            position: "absolute",
            // When blurred, the OVERSCAN lives on this filtered wrapper so the
            // blur's filter region falls far outside the viewport (no clipped
            // edge) and the moving blobs rasterize into one clean image per
            // frame instead of fighting the filter as separate GPU layers.
            inset: blur ? `-${EDGE}%` : 0,
            filter: blur ? `blur(${blur}px)` : undefined,
            ...(blur
              ? {
                  transform: "translateZ(0)",
                  willChange: "transform",
                  backfaceVisibility: "hidden" as const,
                }
              : null),
          }}
        >
          {layers.map((l, i) => (
            <div
              key={i}
              ref={(el) => {
                motionRefs.current[i] = el;
              }}
              style={{
                position: "absolute",
                // overscan lives here only when there's no blur wrapper to host it
                inset: blur ? 0 : `-${EDGE}%`,
                background: blobBackground(overscan(l)),
                opacity: l.opacity,
                mixBlendMode: variant === "aurora" ? "screen" : "normal",
                // Promote to a stable GPU layer for smooth motion ONLY when not
                // inside a blur filter — promotion under a filter causes the
                // shimmer we're fixing.
                willChange:
                  (animateOn || interactive) && !blur ? "transform" : undefined,
              }}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            ...FILL,
            background: flatBackground(
              variant as "linear" | "radial" | "conic",
              layers as Layer[],
              effAngle
            ),
            filter: blur ? `blur(${blur}px)` : undefined,
            // zoom in so the blur's soft edge never reveals a dark border.
            transform: blur ? "scale(1.4)" : undefined,
          }}
        />
      )}

      {grainAmount > 0 && (
        <div
          style={{
            ...FILL,
            backgroundImage: grainDataUrl({
              scale: grainScale,
              frequency: grainFrequency,
              octaves: grainOctaves,
            }),
            backgroundRepeat: "repeat",
            opacity: grainAmount,
            mixBlendMode: "overlay",
          }}
        />
      )}

      {children}
    </div>
  );
}

/** Remap a blob's position & size into the OVERSCAN-sized layer box so it
 * renders in the same visible spot, just with hidden margin all around. */
function overscan(l: Layer): Layer {
  return {
    ...l,
    x: (l.x + EDGE) / OVERSCAN,
    y: (l.y + EDGE) / OVERSCAN,
    size: l.size / OVERSCAN,
  };
}

const defaultColors: GradientStop[] = [
  "#e8385e",
  "#b13ad8",
  "#4920d0",
  "#f6d8ec",
];
