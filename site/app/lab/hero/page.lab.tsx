import type { Metadata } from "next";
import { HeroLab } from "./HeroLab";

/**
 * /lab/hero: hero layout options over the live liquid.
 * DEV ONLY (`.lab.tsx`), never built into the site.
 */
export const metadata: Metadata = {
  title: "Lab: hero options",
  robots: { index: false, follow: false },
};

export default function HeroLabPage() {
  return <HeroLab />;
}
