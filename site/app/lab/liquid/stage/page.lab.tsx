import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { TunerBackdrop } from "@/lab/liquid-tuner/Stage";

/** DEV ONLY. The tuner's preview frame: the real hero over the tuned liquid. */
export const metadata: Metadata = {
  title: "Lab: liquid stage",
  robots: { index: false, follow: false },
};

export default function LiquidStagePage() {
  return <Hero backdrop={<TunerBackdrop />} />;
}
