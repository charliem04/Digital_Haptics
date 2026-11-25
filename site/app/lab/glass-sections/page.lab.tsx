import type { Metadata } from "next";
import { GlassSectionsLab } from "./GlassSectionsLab";

/**
 * /lab/glass-sections: whole page sections as frosted glass over the live
 * liquid. DEV ONLY (`.lab.tsx`), never built into the site.
 */
export const metadata: Metadata = {
  title: "Lab: glass sections",
  robots: { index: false, follow: false },
};

export default function GlassSectionsLabPage() {
  return <GlassSectionsLab />;
}
