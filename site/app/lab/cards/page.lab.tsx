import type { Metadata } from "next";
import { getCases } from "@/lib/content";
import { CardsLab, type LabCase } from "./CardsLab";

/**
 * /lab/cards: case card frame options, shown over the liquid (home) and
 * on plain room (/work). DEV ONLY (`.lab.tsx`), never built into the site.
 */
export const metadata: Metadata = {
  title: "Lab: case card options",
  robots: { index: false, follow: false },
};

export default function CardsLabPage() {
  const cases: LabCase[] = getCases().map((c) => ({
    slug: c.slug,
    client: c.client,
    meta: c.location ? `${c.trade} · ${c.location}` : c.trade,
    result: c.results[0]?.value ?? "[RESULT]",
    status: c.demo ? "Demo" : c.liveUrl ? "Live site" : "Case study",
    image: c.cardImage ?? c.heroImage,
  }));
  return <CardsLab cases={cases} />;
}
