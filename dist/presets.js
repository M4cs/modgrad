/** Curated palettes. `arc` reproduces the Browser Company / Arc card gradient
 * and carries distinct light/dark colors to show off theming. */
export const presets = {
    arc: {
        variant: "mesh",
        background: { light: "#f4ecff", dark: "#2c0f63" },
        colors: {
            // softer, brighter blend on light backgrounds
            light: [
                { color: "#f4768f", x: 22, y: 18, size: 70 },
                { color: "#ffffff", x: 86, y: 16, size: 62, falloff: 0.9 },
                { color: "#c98bff", x: 30, y: 58, size: 70 },
                { color: "#7c6cff", x: 70, y: 92, size: 80 },
            ],
            // the deep neon Arc card look on dark
            dark: [
                { color: "#e8385e", x: 22, y: 18, size: 70 },
                { color: "#f6d8ec", x: 86, y: 16, size: 62, falloff: 0.9 },
                { color: "#b13ad8", x: 30, y: 58, size: 70 },
                { color: "#4920d0", x: 70, y: 92, size: 80 },
            ],
        },
    },
    sunset: {
        variant: "mesh",
        background: { light: "#ffe9d6", dark: "#3a1d6e" },
        colors: ["#ff5e62", "#ff9966", "#ffd86b", "#7b2ff7"],
    },
    ocean: {
        variant: "mesh",
        background: { light: "#dcf3ff", dark: "#06283d" },
        colors: ["#1fa2ff", "#12d8fa", "#22e1c3", "#256eff"],
    },
    aurora: {
        variant: "aurora",
        background: { light: "#eaf7ff", dark: "#020617" },
        colors: ["#22d3ee", "#34d399", "#a78bfa", "#2dd4bf"],
    },
    peach: {
        variant: "mesh",
        background: { light: "#fff1e8", dark: "#3a2a26" },
        colors: ["#ffecd2", "#fcb69f", "#ff8aa1", "#ffd1ba"],
    },
    mint: {
        variant: "mesh",
        background: { light: "#e6fff2", dark: "#0f3d3e" },
        colors: ["#a8ff78", "#78ffd6", "#43e97b", "#38f9d7"],
    },
    dusk: {
        variant: "mesh",
        background: { light: "#efe4ff", dark: "#11052c" },
        colors: ["#7303c0", "#ec38bc", "#03001e", "#fdeff9"],
    },
    candy: {
        variant: "mesh",
        background: { light: "#ffe6f3", dark: "#2b0a3d" },
        colors: ["#f857a6", "#ff5858", "#a17fe0", "#5d3ff0"],
    },
    mono: {
        variant: "mesh",
        background: { light: "#ececf0", dark: "#1b1b1f" },
        colors: ["#3a3a44", "#52525b", "#27272a", "#71717a"],
    },
    ember: {
        variant: "mesh",
        background: { light: "#ffe7d6", dark: "#1a0500" },
        colors: ["#f12711", "#f5af19", "#ff512f", "#dd2476"],
    },
};
