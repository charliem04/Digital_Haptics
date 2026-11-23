import type { Metadata } from "next";
import { WindowsLab } from "@/lab/windows/WindowsLab";

/**
 * /lab/windows: ways to open more windows onto the liquid background.
 *
 * DEV ONLY. `.lab.tsx` is a page extension under `next dev` and nothing
 * at all under `next build` (next.config.mjs), so this never reaches `out/`.
 */
export const metadata: Metadata = {
  title: "Lab: liquid windows",
  robots: { index: false, follow: false },
};

export default function WindowsLabPage() {
  return <WindowsLab />;
}
