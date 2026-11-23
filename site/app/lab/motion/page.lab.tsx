import type { Metadata } from "next";
import { MotionLab } from "@/lab/motion/MotionLab";

/**
 * /lab/motion: side-by-side motion options for Charles to choose from.
 *
 * DEV ONLY. `.lab.tsx` is a page extension under `next dev` and nothing
 * at all under `next build` (next.config.mjs), so this never reaches `out/`.
 */
export const metadata: Metadata = {
  title: "Lab: motion options",
  robots: { index: false, follow: false },
};

export default function MotionLabPage() {
  return <MotionLab />;
}
