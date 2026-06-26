import { useEffect, useState } from "react";
/**
 * Resolves a `ThemeMode` into a concrete "light" | "dark". When set to
 * "system" it tracks `prefers-color-scheme` and updates live. SSR-safe: it
 * starts at a deterministic default and corrects after hydration.
 */
export function useResolvedTheme(theme) {
    const [resolved, setResolved] = useState(theme === "system" ? "dark" : theme);
    useEffect(() => {
        if (theme !== "system") {
            setResolved(theme);
            return;
        }
        if (typeof window === "undefined" || !window.matchMedia)
            return;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const update = () => setResolved(mq.matches ? "dark" : "light");
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, [theme]);
    return resolved;
}
/** Pick the right side of a themeable value for the resolved theme. */
export function pickTheme(value, theme) {
    if (value == null)
        return undefined;
    if (typeof value === "object" &&
        !Array.isArray(value) &&
        "light" in value &&
        "dark" in value) {
        return value[theme];
    }
    return value;
}
