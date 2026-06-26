import type { CSSProperties } from "react";

/** A value that can either be shared across themes, or differ per theme. */
export type Themeable<T> = T | { light: T; dark: T };

/** What the user asks for. `system` follows `prefers-color-scheme`. */
export type ThemeMode = "system" | "light" | "dark";

/** What `system` resolves to at runtime. */
export type ResolvedTheme = "light" | "dark";

/** A single color in the gradient. Either a plain color string, or a
 * fully-controlled "blob" with an explicit position, size and softness. */
export type GradientStop =
  | string
  | {
      /** Any CSS color. */
      color: string;
      /** Horizontal center, 0–100 (% of the box). Auto-placed if omitted. */
      x?: number;
      /** Vertical center, 0–100 (% of the box). Auto-placed if omitted. */
      y?: number;
      /** Blob radius as a % of the box's larger side. Default ~65. */
      size?: number;
      /** Where the color fades to transparent, 0–1 of `size`. Default 1. */
      falloff?: number;
      /** Per-blob opacity, 0–1. Default 1. */
      opacity?: number;
    };

export type GradientVariant =
  | "mesh"
  | "aurora"
  | "linear"
  | "radial"
  | "conic";

export type Vec2 = { x: number; y: number };

export interface GradientProps {
  /** The colors of the gradient. 2+ recommended. Can differ per theme. */
  colors?: Themeable<GradientStop[]>;
  /** A built-in palette + layout. Overridden by `colors` if both given. */
  preset?: PresetName;
  /** How the colors are arranged. Default "mesh". */
  variant?: GradientVariant;
  /** Angle in degrees for linear/conic variants. Default 135. */
  angle?: number;

  /** light / dark / system (follows the OS). Default "system". */
  theme?: ThemeMode;

  /** Solid backdrop painted behind every layer. Can differ per theme. */
  background?: Themeable<string>;

  /** Film-grain noise. `true` = 0.15, or pass 0–1 for intensity. */
  grain?: boolean | number;
  /** Grain fineness knob: smaller = finer/denser. Default 180. */
  grainScale?: number;
  /** Directly set the noise `baseFrequency` (overrides `grainScale`). */
  grainFrequency?: number;
  /** Noise octaves — more = softer/cloudier, fewer = tighter. Default 2. */
  grainOctaves?: number;

  /** Gaussian blur applied to the color layers, in px. Default 0. */
  blur?: number;

  /** Animate the layers with slow organic motion. `true` or `{ speed }`. */
  animate?: boolean | { speed?: number };
  /** Color layers drift toward the pointer. */
  interactive?: boolean;

  /** Overall opacity, 0–1. Useful when used as a translucent overlay. */
  opacity?: number;
  /** CSS mix-blend-mode against what's behind it (overlay use). */
  blendMode?: CSSProperties["mixBlendMode"];

  /** Render as a fixed full-viewport layer instead of filling its parent. */
  fixed?: boolean;
  /** Stacking order. */
  zIndex?: number;

  className?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
  /** Deterministic auto-placement / animation seed. */
  seed?: number;
}

export type PresetName =
  | "arc"
  | "sunset"
  | "ocean"
  | "aurora"
  | "peach"
  | "mint"
  | "dusk"
  | "candy"
  | "mono"
  | "ember";

export interface Preset {
  colors: Themeable<GradientStop[]>;
  variant?: GradientVariant;
  background?: Themeable<string>;
  angle?: number;
}
