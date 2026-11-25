import type { Metadata } from "next";
import { WidgetsLab } from "@/lab/widgets/WidgetsLab";

/**
 * /lab/widgets: widget entrance and hover options.
 *
 * DEV ONLY. `.lab.tsx` is a page extension under `next dev` and nothing
 * at all under `next build` (next.config.mjs), so this never reaches `out/`.
 */
export const metadata: Metadata = {
  title: "Lab: widget motion",
  robots: { index: false, follow: false },
};

export default function WidgetsLabPage() {
  return <WidgetsLab />;
}
