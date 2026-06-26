interface MotionOpts {
    count: number;
    animate: boolean;
    speed: number;
    interactive: boolean;
    seed: number;
}
/**
 * Drives per-layer transforms with a single rAF loop: slow sinusoidal drift
 * (animate) and/or easing toward the pointer (interactive). Returns refs to
 * attach to each layer element. No-ops (and parks the loop) when idle.
 */
export declare function useLayerMotion({ count, animate, speed, interactive, seed, }: MotionOpts): import("react").RefObject<(HTMLDivElement | null)[]>;
export {};
