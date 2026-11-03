import type { Config } from "tailwindcss";

/**
 * ── DESIGN TOKENS ───────────────────────────────────────────────────
 * Values come from PLAN §4 and the Hybrid mockup
 * (docs/design-reference/digital-haptics-design-system/Hybrid.dc.html).
 * The full table, with sources and contrast ratios, is §3 of
 * docs/REFACTOR_AUDIT.md.
 *
 * Colors resolve to the RGB-channel variables in app/globals.css, so
 * opacity modifiers work (`bg-ink/20`).
 *
 * `colors`, `borderRadius` and `boxShadow` REPLACE Tailwind's defaults
 * instead of extending them, so a stock `text-indigo-600`, `rounded-lg`
 * or `shadow-md` can't slip in. Radius is 0 everywhere: shape comes
 * from cut corners (PLAN §4.3).
 *
 * Contrast rule (PLAN §4.1): `signal` is never text on a light ground.
 * ────────────────────────────────────────────────────────────────────
 */
const rgb = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      inherit: "inherit",
      ice: rgb("ice"),
      frost: rgb("frost"),
      white: rgb("white"),
      "steel-panel": rgb("steel-panel"),
      hairline: rgb("hairline"),
      ink: rgb("ink"),
      steel: rgb("steel"),
      signal: rgb("signal"),
      // Mockup extras, not listed in PLAN §4.1:
      "steel-deep": rgb("steel-deep"), // hero subline, sidebar copy
      "flare-core": rgb("flare-core"), // flare node centre (decorative)
    },
    borderRadius: {
      none: "0",
      DEFAULT: "0",
      // The flare node is the one round element (decision D4). It is
      // decorative and aria-hidden; nothing interactive uses this.
      flare: "9999px",
    },
    boxShadow: {
      none: "none",
      // Flare glow: signal at alpha 0x73 (0.45), from the mockup.
      "flare-v": "0 0 22px 5px rgb(var(--signal) / 0.45)",
      "flare-h": "0 0 14px 3px rgb(var(--signal) / 0.45)",
      "flare-node": "0 0 36px 16px rgb(var(--signal) / 0.45)",
    },
    fontFamily: {
      display: ["var(--font-display)", "system-ui", "sans-serif"],
      body: ["var(--font-body)", "system-ui", "sans-serif"],
      mono: ["var(--font-mono)", "ui-monospace", "monospace"],
    },
    extend: {
      fontSize: {
        // Display roles: Chakra Petch 600, uppercase (PLAN §4.2).
        display: [
          "clamp(3.375rem, 7.78vw, 7rem)", // 54px → 112px
          { lineHeight: "0.9", letterSpacing: "-0.01em" },
        ],
        "display-sm": [
          "clamp(2.5rem, 4.86vw, 4.375rem)", // 40px → 70px
          { lineHeight: "0.9" },
        ],
        heading: ["clamp(1.75rem, 2.5vw, 2.25rem)", { lineHeight: "1.1" }], // 28 → 36
        subheading: ["clamp(1.25rem, 1.67vw, 1.5rem)", { lineHeight: "1.2" }], // 20 → 24
        // Body roles: Manrope, line-height 1.55.
        "body-lg": ["clamp(1.0625rem, 1.32vw, 1.1875rem)", { lineHeight: "1.55" }], // 17 → 19
        body: ["clamp(1rem, 1.18vw, 1.0625rem)", { lineHeight: "1.55" }], // 16 → 17
        "body-sm": ["0.9375rem", { lineHeight: "1.55" }], // 15
        "body-xs": ["0.875rem", { lineHeight: "1.55" }], // 14
        // Label roles: JetBrains Mono, uppercase.
        "label-lg": ["0.8125rem", { lineHeight: "1.4" }], // 13: buttons
        label: ["0.75rem", { lineHeight: "1.6" }], // 12: nav, section label, rows
        "label-sm": ["0.6875rem", { lineHeight: "1.7" }], // 11: boxed labels, panels
        logo: ["1.125rem", { lineHeight: "1", letterSpacing: "0.12em" }], // 18
      },
      letterSpacing: {
        tight: "-0.01em",
        "label-xs": "0.08em",
        "label-sm": "0.1em",
        label: "0.12em",
        "label-md": "0.14em",
        "label-lg": "0.16em",
        subheading: "0.04em",
      },
      spacing: {
        gutter: "64px",
        "gutter-sm": "20px",
        section: "clamp(96px, 8.33vw, 120px)",
        "section-sm": "clamp(48px, 13vw, 64px)",
        sidebar: "320px",
        "cut-sm": "var(--cut-sm)",
        "cut-md": "var(--cut-md)",
        "cut-lg": "var(--cut-lg)",
        "cut-xl": "var(--cut-xl)",
      },
      maxWidth: {
        page: "1440px",
        // Hero subline (mockup).
        lede: "520px",
      },
      minHeight: {
        // Buttons: 52 default (PLAN §4.5), 48 compact. Both clear 44.
        button: "52px",
        "button-sm": "48px",
        input: "48px",
        touch: "44px",
      },
      backgroundImage: {
        dots: "radial-gradient(rgb(var(--ink) / 0.2) 1px, transparent 1.4px)",
        "dots-dense": "radial-gradient(rgb(var(--ink) / 0.3) 1.1px, transparent 1.5px)",
      },
      // Pair each grid with its pitch: `bg-dots bg-dot-pitch`,
      // `bg-dots-dense bg-dot-pitch-dense`.
      backgroundSize: {
        "dot-pitch": "var(--dot-size) var(--dot-size)",
        "dot-pitch-dense": "10px 10px",
      },
      transitionTimingFunction: {
        // Same curve as `ease.out` in lib/motion.ts; change both together.
        brand: "cubic-bezier(0.21, 0.65, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
