import type { Metadata } from "next";
import { LiquidGlassLab } from "./LiquidGlassLab";

/**
 * /lab/liquid-glass: the liquid-glass-web-react lens over the live liquid.
 * DEV ONLY (`.lab.tsx`), never built into the site.
 */
export const metadata: Metadata = {
  title: "Lab: liquid glass",
  robots: { index: false, follow: false },
};

export default function LiquidGlassLabPage() {
  return <LiquidGlassLab />;
}
