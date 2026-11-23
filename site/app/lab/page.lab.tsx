import type { Metadata } from "next";
import { Lab } from "@/lab/hero-motion/demo/Lab";

/**
 * /lab — hero motion backgrounds, side by side with their controls.
 *
 * DEV ONLY. The `.lab.tsx` extension is a page extension under
 * `next dev` and nothing at all under `next build` (next.config.mjs),
 * so this route, three.js and tweakpane never reach `out/`.
 */
export const metadata: Metadata = {
  title: "Lab — hero motion",
  robots: { index: false, follow: false },
};

export default function LabPage() {
  return <Lab />;
}
