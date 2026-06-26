import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { resolveWarp, WarpFilter } from "./warp";
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

// Minimum baked softness for an animated mesh, so the moving blobs never shimmer
// in Firefox. The flicker threshold scales with the painted area: a tiny preview
// is fine while crisp, but a full-screen mesh needs much more softness. So the
// floor is `max(MIN_MOTION_BLUR, side × SIZE_MOTION_BLUR)` px, where `side` is
// the element's larger edge — e.g. ~40px on a 1440px hero, ~7px on a 250px tile.
const MIN_MOTION_BLUR = 8;
const SIZE_MOTION_BLUR = 0.028;
const MAX_MOTION_BLUR = 64;

// Default strength of the always-on anti-banding dither (overlay opacity).
// Subtle enough to read as "clean", strong enough to scatter 8-bit band edges.
const DEFAULT_DITHER = 0.06;
// A dedicated, fine + tight noise tile for dithering — finer than the artistic
// `grain` (higher baseFrequency) and single-octave so it's per-pixel speckle,
// not cloud. Built once; the same neutral tile dithers every gradient.
const DITHER_URL = grainDataUrl({ scale: 120, octaves: 1 });

// useLayoutEffect on the client, useEffect on the server (avoids SSR warnings).
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Track an element's larger side (px) for the size-aware motion-blur floor. */
function useMaxSide() {
  const ref = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState(0);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () =>
      setSide(Math.max(el.offsetWidth, el.offsetHeight));
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, side] as const;
}

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
    dither = true,
    blur = 0,
    warp: warpProp,
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

  const isLayered =
    variant === "mesh" || variant === "aurora" || variant === "liquid";
  // `liquid` is mesh with the warp filter on by default; any layered variant
  // can opt in (or liquid can opt out) via the `warp` prop.
  const warp = resolveWarp(
    variant === "liquid" ? (warpProp ?? true) : warpProp
  );
  const rawId = useId();
  const warpId = `mg-warp-${rawId.replace(/:/g, "")}`;
  const animateOn = !!animate;
  const speed =
    typeof animate === "object" && animate.speed ? animate.speed : 1;

  const motionRefs = useLayerMotion({
    count: isLayered ? layers.length : 0,
    animate: animateOn,
    speed,
    interactive,
    seed,
    // When warping, the field itself now morphs (see WarpFilter), so the colors
    // only need a touch more travel to read as flowing — pushing them hard
    // through the displacement is what used to snap across its ridges.
    driftScale: warp ? 1.15 : 1,
  });

  const grainAmount = grain === true ? 0.15 : grain === false ? 0 : grain;
  const ditherAmount =
    dither === true ? DEFAULT_DITHER : dither === false ? 0 : dither;

  const [rootRef, maxSide] = useMaxSide();

  // A moving, overscanned mesh that's too crisp shimmers in Firefox. Enforce a
  // minimum softness whenever the mesh animates so it can never flicker, no
  // matter how low `blur` is set — scaled to the painted area, since larger
  // surfaces need much more. Static gradients keep the exact blur asked, and
  // aurora is exempt (its `screen` blend washes to white when softened).
  const motionOn = animateOn || interactive;
  const motionFloor = Math.min(
    MAX_MOTION_BLUR,
    Math.max(MIN_MOTION_BLUR, maxSide * SIZE_MOTION_BLUR)
  );
  const effBlur =
    isLayered && motionOn && variant !== "aurora"
      ? Math.max(blur, motionFloor)
      : blur;

  // For mesh/aurora, `blur` is emulated by softening the blobs (filter-free).
  // Diminishing curve: 30 → ~0.30, 80 → ~0.53.
  const layeredSoft = effBlur > 0 ? effBlur / (effBlur + 70) : 0;

  // The gradient itself (color layers + grain) — shared by both render modes.
  const paint = (
    <>
      {isLayered ? (
        // `blur` is baked into the blob softness (filter-free) so the mesh
        // never sits under a *blur* filter (which flickers in Firefox at
        // full-screen sizes). The optional `warp` displacement filter goes on
        // this wrapper instead, deforming the composited blobs as one group.
        // Each blob overscans the clip so its edges never enter view, and the
        // warp's filter region is oversized to match.
        <div style={{ ...FILL, filter: warp ? `url(#${warpId})` : undefined }}>
          {warp && (
            <WarpFilter
              id={warpId}
              warp={warp}
              animate={animateOn}
              speed={speed}
            />
          )}
          {layers.map((l, i) => (
            <div
              key={i}
              ref={(el) => {
                motionRefs.current[i] = el;
              }}
              style={{
                position: "absolute",
                inset: `-${EDGE}%`,
                background: blobBackground(overscan(l), layeredSoft),
                // The soft multi-stop falloff fills more area than a hard edge,
                // which makes `screen` (aurora) overlaps saturate to white — so
                // hold aurora layers back to keep the glow without blowing out.
                opacity: variant === "aurora" ? l.opacity * 0.5 : l.opacity,
                mixBlendMode: variant === "aurora" ? "screen" : "normal",
                willChange:
                  animateOn || interactive ? "transform" : undefined,
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

      {ditherAmount > 0 && (
        // Anti-banding dither: a fine, neutral, symmetric (lighten+darken)
        // overlay noise that scatters 8-bit band edges so smooth/dark gradients
        // stop showing contour rings. Distinct from the visible `grain` texture.
        <div
          style={{
            ...FILL,
            backgroundImage: DITHER_URL,
            backgroundRepeat: "repeat",
            opacity: ditherAmount,
            mixBlendMode: "overlay",
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
    </>
  );

  // BOX MODE — content passed as children. Render a self-contained box: the
  // gradient fills it and the content automatically sits above, no z-index or
  // `position: relative` wiring required. This is the intuitive, drop-in usage.
  if (children != null && children !== false) {
    return (
      <div
        ref={rootRef}
        className={className}
        // `isolation: isolate` makes this a stacking context, which scopes the
        // gradient's `zIndex: -1` to this box: it paints above the box's own
        // background but below the children — so content sits on top without
        // any z-index wiring, and children stay direct so flex/grid layout on
        // `style` keeps working.
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
            background,
          }}
        >
          {paint}
        </div>
        {children}
      </div>
    );
  }

  // LAYER MODE — no children. A bare fill layer to drop into your own
  // positioned container (as a background) or over content (as an overlay).
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
    <div ref={rootRef} className={className} style={container} aria-hidden>
      {paint}
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
