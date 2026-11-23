import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { validateTuning } from "@/lab/liquid-tuner/schema";
import { Tuner } from "@/lab/liquid-tuner/Tuner";

/**
 * /lab/liquid: live controls for the homepage liquid.
 *
 * DEV ONLY. The `.lab.tsx` extension is not a route in `next build`
 * (next.config.mjs), so this page never reaches `out/`.
 *
 * Reads tuning.json from disk rather than importing it: an import would
 * make every save hot-reload this page and lose the tuner's view state.
 */
export const metadata: Metadata = {
  title: "Lab: liquid tuner",
  robots: { index: false, follow: false },
};

const SAVED = path.join(process.cwd(), "components", "home", "liquid", "tuning.json");

export default async function LiquidTunerPage() {
  const saved = validateTuning(JSON.parse(await readFile(SAVED, "utf8")));
  return <Tuner saved={saved} />;
}
