import type { Config } from "tailwindcss";

/**
 * ── DESIGN TOKENS ───────────────────────────────────────────────────
 * Molten Room. The full system, with roles and measured contrast, is
 * docs/VISUAL_GUIDE.md.
 *
 * Colors resolve to the RGB-channel variables in app/globals.css, so
 * opacity modifiers work (`bg-room/40`).
 *
 * `colors`, `borderRadius` and `boxShadow` REPLACE Tailwind's defaults
 * instead of extending them, so a stock `text-indigo-600`, `rounded-lg`
 * or `shadow-md` can't slip in.
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
      room: rgb("room"),
      surface: rgb("surface"),
      raised: rgb("raised"),
      line: rgb("line"), // decorative dividers only
      text: rgb("text"),
      muted: rgb("muted"),
      amber: rgb("amber"),
      "amber-hover": rgb("amber-hover"),
      "on-amber": rgb("on-amber"),
      error: rgb("error"),
    },
    borderRadius: {
      none: "0",
      DEFAULT: "0",
      // Shape language (VISUAL_GUIDE §4).
      // Variables so squircle browsers can scale them (globals.css).
      panel: "var(--r-panel)",
      field: "var(--r-field)",
      notice: "var(--r-notice)",
      control: "9999px",
    },
    boxShadow: {
      none: "none",
    },
    fontFamily: {
      body: ["var(--font-body)", "system-ui", "sans-serif"],
      // Chakra Petch, for the logo only.
      logo: ["var(--font-display)", "system-ui", "sans-serif"],
    },
    extend: {
      fontSize: {
        // Compact body sizes still used by lists, notes and form rows.
        body: ["clamp(1rem, 1.18vw, 1.0625rem)", { lineHeight: "1.55" }], // 16 → 17
        "body-sm": ["0.9375rem", { lineHeight: "1.55" }], // 15
        "body-xs": ["0.875rem", { lineHeight: "1.55" }], // 14
        // Type scale (VISUAL_GUIDE §3). Manrope throughout.
        "room-display": [
          "clamp(3rem, 6.6vw, 6.5rem)",
          { lineHeight: "1", letterSpacing: "-0.035em", fontWeight: "500" },
        ],
        "room-title": [
          "clamp(2.7rem, 6vw, 5.6rem)",
          { lineHeight: "0.98", letterSpacing: "-0.035em", fontWeight: "500" },
        ],
        "room-cta": [
          "clamp(2rem, 3.6vw, 3.25rem)",
          { lineHeight: "1.02", letterSpacing: "-0.03em", fontWeight: "500" },
        ],
        "room-section": [
          "clamp(1.9rem, 3vw, 2.9rem)",
          { lineHeight: "1.08", letterSpacing: "-0.025em", fontWeight: "500" },
        ],
        "room-form": ["1.875rem", { lineHeight: "1.1", fontWeight: "500" }], // 30
        "room-card": ["1.625rem", { lineHeight: "1.1", fontWeight: "500" }], // 26
        "room-step": ["1.3125rem", { lineHeight: "1.6", fontWeight: "500" }], // 21
        "room-price": ["1.25rem", { lineHeight: "1.6", fontWeight: "500" }], // 20
        "room-lede": ["1.1875rem", { lineHeight: "1.6" }], // 19
        "room-body": ["1.0625rem", { lineHeight: "1.6" }], // 17
        "room-small": ["0.9375rem", { lineHeight: "1.6" }], // 15
        "room-caption": ["0.875rem", { lineHeight: "1.6" }], // 14, the minimum
        "room-logo": ["1.125rem", { lineHeight: "1", fontWeight: "700" }], // 18
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
        // Molten Room section padding (VISUAL_GUIDE §4).
        "room-section": "104px",
        "room-section-sm": "56px",
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
      keyframes: {
        // Mobile menu opening: a quick fade (dur.quick, ease.out).
        "menu-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "menu-in": "menu-in 250ms cubic-bezier(0.21, 0.65, 0.36, 1)",
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
