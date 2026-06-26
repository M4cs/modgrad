import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Gradient, Noise, presets } from "../src/index";
import type { GradientVariant, PresetName, ThemeMode } from "../src/index";
import "./demo.css";

/* ----------------------------------------------------------------- Hero */
function Hero() {
  return (
    <header className="hero">
      <Gradient
        colors={["#e8385e", "#b13ad8", "#4920d0", "#f6d8ec", "#ff7eb3"]}
        background="#3a1565"
        grain={0.12}
        blur={30}
        animate
        interactive
      />
      <div className="hero-inner">
        <h1>modgrad</h1>
        <p>Beautiful, living gradient backgrounds for React.</p>
        <div className="install mono">
          <span style={{ opacity: 0.6 }}>$</span> bun add modgrad
        </div>
      </div>
      <div className="scroll-hint">scroll ↓ move your mouse</div>
    </header>
  );
}

/* ---------------------------------------------------- Showcase card */
const SHOW_COLORS = ["#e8385e", "#b13ad8", "#4920d0", "#f6d8ec"];

function ShowcaseCard() {
  return (
    <div className="show-card">
      <div className="show-cover">
        <Gradient colors={SHOW_COLORS} grain={0.14} animate blur={18} />
        <span className="show-tag mono">◈ modgrad</span>
        <span className="show-dur mono">CSS · 0 deps</span>
      </div>
      <div className="show-body">
        <div className="show-avatar">
          <Gradient colors={SHOW_COLORS} animate />
        </div>
        <div>
          <h3>Nebula Pass</h3>
          <div className="show-sub">a living gradient, rendered in CSS</div>
        </div>
      </div>
      <div className="show-foot">
        <div className="chips">
          <span className="chip">mesh</span>
          <span className="chip">grain</span>
          <span className="chip">animate</span>
        </div>
        <button className="show-cta" aria-label="open">
          →
        </button>
      </div>
    </div>
  );
}

function ShowcaseSection() {
  return (
    <section className="block" id="showcase">
      <div className="wrap">
        <div className="eyebrow">Compose it</div>
        <h2>Drop it into anything</h2>
        <p className="lead">
          A gradient cover, a matching avatar, a soft glow — all the same{" "}
          <code>&lt;Gradient /&gt;</code>, filling whatever shape contains it.
          No canvas, no images.
        </p>
        <div className="show-row">
          <ShowcaseCard />
          <div className="show-aside">
            <pre className="snippet mono">
              <code>
                {"<"}
                <span className="a">div</span> className=
                <span className="s">"cover"</span>
                {">\n  <"}
                <span className="a">Gradient</span>{"\n    "}
                <span className="k">colors</span>={"{"}
                <span className="s">colors</span>
                {"}"}
                {"\n    "}
                <span className="k">grain</span>={"{"}
                <span className="n">0.14</span>
                {"} "}
                <span className="k">blur</span>={"{"}
                <span className="n">18</span>
                {"}"}
                {"\n    "}
                <span className="k">animate</span>
                {"\n  />\n"}
                {"</"}
                <span className="a">div</span>
                {">"}
              </code>
            </pre>
            <p style={{ color: "var(--muted)", marginTop: 16 }}>
              The cover, the round avatar and any glow are the same component —
              shape comes from <code>border-radius</code> on the parent, so it
              fits a card, a pill, a circle, or a full page.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- Presets */
function PresetGallery() {
  const names = Object.keys(presets) as PresetName[];
  return (
    <section className="block">
      <div className="wrap">
        <div className="eyebrow">Batteries included</div>
        <h2>Presets</h2>
        <p className="lead">
          Ten curated palettes. Add <code>grain</code>, <code>animate</code> or{" "}
          <code>blur</code> to any of them.
        </p>
        <div className="grid">
          {names.map((name) => (
            <div className="tile" key={name}>
              <Gradient preset={name} grain={0.1} animate />
              <span className="label">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- Variants */
function VariantGallery() {
  const variants: { v: GradientVariant; note: string }[] = [
    { v: "mesh", note: "layered blobs" },
    { v: "aurora", note: "screen blend" },
    { v: "liquid", note: "warped swirls" },
    { v: "linear", note: "angle 135°" },
    { v: "radial", note: "centered" },
    { v: "conic", note: "sweep" },
  ];
  const colors = ["#22d3ee", "#a78bfa", "#fb7185", "#34d399"];
  return (
    <section className="block">
      <div className="wrap">
        <div className="eyebrow">One palette, many looks</div>
        <h2>Variants</h2>
        <p className="lead">
          The same four colors rendered five ways via the <code>variant</code>{" "}
          prop.
        </p>
        <div className="grid">
          {variants.map(({ v, note }) => (
            <div className="tile" key={v}>
              <Gradient colors={colors} variant={v} background="#070712" />
              <span className="label">{v}</span>
              <span className="sub">{note}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- Liquid */
function LiquidSection() {
  const colors = ["#e8385e", "#b13ad8", "#4920d0", "#ff7eb3"];
  return (
    <section className="block" id="liquid">
      <div className="wrap">
        <div className="eyebrow">Beyond circles</div>
        <h2>Liquid warp</h2>
        <p className="lead">
          An SVG noise filter melts the mesh's blobs into organic swirls and
          waves — the shader-gradient look, still pure CSS/SVG and zero deps.
          Use <code>variant="liquid"</code> for the one-word version, or add{" "}
          <code>warp</code> to any <code>mesh</code> / <code>aurora</code> and
          tune <code>scale</code>, <code>intensity</code>, <code>detail</code>.
          Add <code>animate</code> and the colors drift <em>through</em> the
          warp — a smooth, jitter-free flow.
        </p>
        <div className="grid">
          <div className="tile">
            <Gradient colors={colors} variant="liquid" background="#1a0b2e" />
            <span className="label">liquid</span>
            <span className="sub">static warp</span>
          </div>
          <div className="tile">
            <Gradient
              colors={colors}
              variant="liquid"
              background="#1a0b2e"
              animate
            />
            <span className="label">liquid · animate</span>
            <span className="sub">flowing</span>
          </div>
          <div className="tile">
            <Gradient
              colors={colors}
              background="#1a0b2e"
              warp={{ scale: 2, intensity: 110 }}
              animate
            />
            <span className="label">warp tuned</span>
            <span className="sub">big molten swirls</span>
          </div>
          <div className="tile">
            <Gradient
              colors={colors}
              variant="aurora"
              background="#05010f"
              warp={{ scale: 1.4, intensity: 70 }}
              grain={0.1}
              animate
            />
            <span className="label">aurora · warp</span>
            <span className="sub">composes with any layered look</span>
          </div>
        </div>
        <pre className="snippet mono">
          <code>
            {"<"}
            <span className="a">Gradient</span> <span className="k">colors</span>
            ={"{"}
            <span className="s">colors</span>
            {"} "}
            <span className="k">variant</span>=<span className="s">"liquid"</span>{" "}
            <span className="k">animate</span> {"/>"}
            {"\n\n"}
            <span style={{ opacity: 0.5 }}>// or tune it on any mesh/aurora</span>
            {"\n<"}
            <span className="a">Gradient</span> <span className="k">colors</span>
            ={"{"}
            <span className="s">colors</span>
            {"} "}
            <span className="k">warp</span>={"{{ "}
            <span className="k">scale</span>: <span className="n">2</span>,{" "}
            <span className="k">intensity</span>: <span className="n">110</span>
            {" }} "}
            <span className="k">animate</span> {"/>"}
          </code>
        </pre>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- Overlay */
function OverlaySection() {
  return (
    <section className="block">
      <div className="wrap">
        <div className="eyebrow">Not just backgrounds</div>
        <h2>Translucent overlays</h2>
        <p className="lead">
          Give it <code>opacity</code> and a <code>blendMode</code> to wash a
          gradient over a photo, video or any content underneath.
        </p>
        <div
          className="overlay-card"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1400&q=80')",
          }}
        >
          <Gradient
            colors={["#ff5e62", "#7b2ff7", "#1fa2ff"]}
            opacity={0.7}
            blendMode="overlay"
            grain={0.1}
            animate
          />
          <div className="content">
            <h3>Mountain Pass</h3>
            <p>gradient overlay · blendMode="overlay" · opacity 0.7</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- Playground */
// Each palette is a { light, dark } color config — exactly the shape you can
// pass straight to <Gradient colors={...} />.
const PALETTES: { light: string[]; dark: string[] }[] = [
  {
    dark: ["#e8385e", "#b13ad8", "#4920d0", "#f6d8ec"],
    light: ["#f4768f", "#c98bff", "#7c6cff", "#ffffff"],
  },
  {
    dark: ["#22d3ee", "#34d399", "#a78bfa", "#2dd4bf"],
    light: ["#7fe9f5", "#9be8c4", "#cdbcff", "#a6efe0"],
  },
  {
    dark: ["#ff5e62", "#ff9966", "#ffd86b", "#7b2ff7"],
    light: ["#ff9aa0", "#ffc6a3", "#ffe9a8", "#b89cff"],
  },
  {
    dark: ["#f857a6", "#ff5858", "#a17fe0", "#5d3ff0"],
    light: ["#ffa3cf", "#ff9d9d", "#cbb6f2", "#a896f7"],
  },
  {
    dark: ["#0f2027", "#2c5364", "#00c6ff", "#92fe9d"],
    light: ["#8aa0a8", "#a7c2cf", "#9fe4ff", "#c8ffce"],
  },
];

const PLAY_BG = { light: "#eef0f5", dark: "#0b0b14" };

function Playground() {
  const [variant, setVariant] = useState<GradientVariant>("mesh");
  const [grain, setGrain] = useState(0.15);
  const [grainScale, setGrainScale] = useState(180);
  const [grainOctaves, setGrainOctaves] = useState(2);
  const [blur, setBlur] = useState(20);
  const [palette, setPalette] = useState(0);
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [animate, setAnimate] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [interactive, setInteractive] = useState(true);
  const [warp, setWarp] = useState(false);

  // warp only applies to the layered variants.
  const layered =
    variant === "mesh" || variant === "aurora" || variant === "liquid";

  const pal = PALETTES[palette]!;
  const swatchColors = theme === "light" ? pal.light : pal.dark;

  return (
    <section className="block">
      <div className="wrap">
        <div className="eyebrow">Try it</div>
        <h2>Playground</h2>
        <p className="lead">Every prop, live.</p>
        <div className="play">
          <div className="play-stage">
            <Gradient
              colors={{ light: pal.light, dark: pal.dark }}
              theme={theme}
              variant={variant}
              grain={grain}
              grainScale={grainScale}
              grainOctaves={grainOctaves}
              blur={blur}
              warp={warp}
              animate={animate ? { speed } : false}
              interactive={interactive}
              background={PLAY_BG}
            />
          </div>
          <div className="controls">
            <div className="ctrl">
              <label>variant</label>
              <div className="seg">
                {(
                  [
                    "mesh",
                    "aurora",
                    "liquid",
                    "linear",
                    "radial",
                    "conic",
                  ] as const
                ).map((v) => (
                  <button
                    key={v}
                    className={variant === v ? "on" : ""}
                    onClick={() => setVariant(v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="ctrl">
              <label>
                grain <b>{grain.toFixed(2)}</b>
              </label>
              <input
                type="range"
                min={0}
                max={0.5}
                step={0.01}
                value={grain}
                onChange={(e) => setGrain(+e.target.value)}
              />
            </div>
            <div className="ctrl">
              <label>
                grain detail <b>{(130 / grainScale).toFixed(2)} freq</b>
              </label>
              <input
                type="range"
                min={60}
                max={600}
                step={10}
                /* invert so dragging right = finer */
                value={660 - grainScale}
                onChange={(e) => setGrainScale(660 - +e.target.value)}
              />
            </div>
            <div className="ctrl">
              <label>
                grain octaves <b>{grainOctaves}</b>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={grainOctaves}
                onChange={(e) => setGrainOctaves(+e.target.value)}
              />
            </div>
            <div className="ctrl">
              <label>
                blur <b>{blur}px</b>
              </label>
              <input
                type="range"
                min={0}
                max={80}
                step={1}
                value={blur}
                onChange={(e) => setBlur(+e.target.value)}
              />
            </div>
            <div className="ctrl">
              <label>
                speed <b>{speed.toFixed(2)}×</b>
              </label>
              <input
                type="range"
                min={0}
                max={3}
                step={0.05}
                value={speed}
                disabled={!animate}
                onChange={(e) => setSpeed(+e.target.value)}
              />
            </div>
            <div className="ctrl">
              <label>palette</label>
              <div className="swatches">
                {PALETTES.map((p, i) => (
                  <button
                    key={i}
                    className="sw"
                    onClick={() => setPalette(i)}
                    style={{
                      background: `linear-gradient(135deg, ${(theme === "light"
                        ? p.light
                        : p.dark
                      ).join(",")})`,
                      outline: palette === i ? "2px solid #fff" : "none",
                      outlineOffset: 2,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="ctrl">
              <label>theme</label>
              <div className="seg">
                {(["system", "light", "dark"] as const).map((t) => (
                  <button
                    key={t}
                    className={theme === t ? "on" : ""}
                    onClick={() => setTheme(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={animate}
                onChange={(e) => setAnimate(e.target.checked)}
              />
              animate
            </label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={interactive}
                onChange={(e) => setInteractive(e.target.checked)}
              />
              interactive (follow cursor)
            </label>
            <label
              className="toggle"
              style={{ opacity: layered ? 1 : 0.4 }}
              title={layered ? "" : "warp needs a layered variant"}
            >
              <input
                type="checkbox"
                checked={warp}
                disabled={!layered}
                onChange={(e) => setWarp(e.target.checked)}
              />
              warp (liquid swirls)
            </label>
          </div>
        </div>

        <pre className="snippet mono">
          <code>
            {"<"}
            <span className="a">Gradient</span>
            {"\n  "}
            <span className="k">colors</span>={"{{"}
            {"\n    "}
            <span className="k">dark</span>:{" ["}
            <span className="s">{pal.dark.map((c) => `"${c}"`).join(", ")}</span>
            {"],"}
            {"\n    "}
            <span className="k">light</span>:{" ["}
            <span className="s">
              {pal.light.map((c) => `"${c}"`).join(", ")}
            </span>
            {"],"}
            {"\n  }}"}
            {"\n  "}
            <span className="k">theme</span>=<span className="s">"{theme}"</span>
            {"\n  "}
            <span className="k">variant</span>=
            <span className="s">"{variant}"</span>
            {"\n  "}
            <span className="k">grain</span>={"{"}
            <span className="n">{grain.toFixed(2)}</span>
            {"}"}
            {grainScale !== 180 ? (
              <>
                {"\n  "}
                <span className="k">grainScale</span>={"{"}
                <span className="n">{grainScale}</span>
                {"}"}
              </>
            ) : null}
            {grainOctaves !== 2 ? (
              <>
                {"\n  "}
                <span className="k">grainOctaves</span>={"{"}
                <span className="n">{grainOctaves}</span>
                {"}"}
              </>
            ) : null}
            {"\n  "}
            <span className="k">blur</span>={"{"}
            <span className="n">{blur}</span>
            {"}"}
            {warp && layered ? (
              <>
                {"\n  "}
                <span className="k">warp</span>
              </>
            ) : null}
            {animate ? (
              <>
                {"\n  "}
                <span className="k">animate</span>
                {speed !== 1 ? (
                  <>
                    ={"{{ "}
                    <span className="k">speed</span>:{" "}
                    <span className="n">{speed}</span>
                    {" }}"}
                  </>
                ) : null}
              </>
            ) : null}
            {interactive ? (
              <>
                {"\n  "}
                <span className="k">interactive</span>
              </>
            ) : null}
            {"\n/>"}
          </code>
        </pre>
      </div>
    </section>
  );
}

/* ------------------------------------------------------ Light / dark */
function ThemeSection() {
  return (
    <section className="block" id="theme">
      <div className="wrap">
        <div className="eyebrow">Light & dark</div>
        <h2>Theme-aware colors</h2>
        <p className="lead">
          Pass <code>theme="light" | "dark" | "system"</code>. Presets and your
          own <code>colors</code> / <code>background</code> can carry separate{" "}
          <code>{"{ light, dark }"}</code> values — <code>system</code> follows
          the OS and updates live.
        </p>
        <div className="theme-row">
          <div className="theme-card on-light">
            <Gradient preset="arc" theme="light" grain={0.14} animate />
            <div className="theme-meta">
              <span className="dot" /> theme="light"
            </div>
          </div>
          <div className="theme-card on-dark">
            <Gradient preset="arc" theme="dark" grain={0.14} animate />
            <div className="theme-meta">
              <span className="dot" /> theme="dark"
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- Noise */
function NoiseSection() {
  return (
    <section className="block" id="noise">
      <div className="wrap">
        <div className="eyebrow">Texture, standalone</div>
        <h2>The &lt;Noise /&gt; layer</h2>
        <p className="lead">
          Just the grain — no gradient. Add a <code>blur</code> to frost what's
          behind it (a textured <code>backdrop-blur</code>) and a{" "}
          <code>tint</code> for paper-like tones. Overlay it, or wrap content.
        </p>
        <div className="grid">
          {/* paper */}
          <div className="tile" style={{ background: "#e9e2d0" }}>
            <Noise intensity={0.5} scale={120} tint="#b8a575" tintAmount={0.25} />
            <span className="label" style={{ color: "#3a3320" }}>
              paper
            </span>
          </div>
          {/* frosted backdrop-blur over a gradient */}
          <div className="tile">
            <Gradient preset="candy" animate />
            <Noise blur={10} intensity={0.35} tint="#ffffff" tintAmount={0.08} />
            <span className="label">frosted · blur</span>
          </div>
          {/* tinted texture */}
          <div className="tile" style={{ background: "#0f1420" }}>
            <Noise intensity={0.4} tint="#3b82f6" tintAmount={0.18} />
            <span className="label">tinted</span>
          </div>
          {/* box mode: textured panel wrapping content */}
          <Noise
            intensity={0.5}
            scale={120}
            tint="#c9bfa3"
            tintAmount={0.3}
            className="tile"
            style={{
              background: "#efe9da",
              display: "grid",
              placeItems: "center",
            }}
          >
            <span
              className="mono"
              style={{ color: "#4a4126", fontWeight: 700, zIndex: 1 }}
            >
              &lt;Noise&gt; wraps content
            </span>
          </Noise>
        </div>
      </div>
    </section>
  );
}

function App() {
  return (
    <>
      <Hero />
      <ShowcaseSection />
      <PresetGallery />
      <VariantGallery />
      <LiquidSection />
      <ThemeSection />
      <OverlaySection />
      <NoiseSection />
      <Playground />
      <footer>
        <div className="wrap">
          modgrad · MIT · zero-dependency React gradients
        </div>
      </footer>
    </>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
