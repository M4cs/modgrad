import { useEffect, useState } from "react";
import type { ResolvedTheme, Themeable, ThemeMode } from "./types";

/**
 * Resolves a `ThemeMode` into a concrete "light" | "dark". When set to
 * "system" it tracks `prefers-color-scheme` and updates live. SSR-safe: it
 * starts at a deterministic default and corrects after hydration.
 */
export function useResolvedTheme(theme: ThemeMode): ResolvedTheme {
  const [resolved, setResolved] = useState<ResolvedTheme>(
    theme === "system" ? "dark" : theme
  );

  useEffect(() => {
    if (theme !== "system") {
      setResolved(theme);
      return;
    }
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setResolved(mq.matches ? "dark" : "light");
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [theme]);

  return resolved;
}

/** Pick the right side of a themeable value for the resolved theme. */
export function pickTheme<T>(
  value: Themeable<T> | undefined,
  theme: ResolvedTheme
): T | undefined {
  if (value == null) return undefined;
  if (
    typeof value === "object" &&
    !Array.isArray(value) &&
    "light" in value &&
    "dark" in value
  ) {
    return (value as { light: T; dark: T })[theme];
  }
  return value as T;
}
