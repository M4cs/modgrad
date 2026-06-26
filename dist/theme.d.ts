import type { ResolvedTheme, Themeable, ThemeMode } from "./types";
/**
 * Resolves a `ThemeMode` into a concrete "light" | "dark". When set to
 * "system" it tracks `prefers-color-scheme` and updates live. SSR-safe: it
 * starts at a deterministic default and corrects after hydration.
 */
export declare function useResolvedTheme(theme: ThemeMode): ResolvedTheme;
/** Pick the right side of a themeable value for the resolved theme. */
export declare function pickTheme<T>(value: Themeable<T> | undefined, theme: ResolvedTheme): T | undefined;
