import type { Metadata } from "next";
import { Switcher } from "@/lab/rehash/Switcher";

/** /lab/rehash: dev-only comparison of the three visual directions. */
export const metadata: Metadata = {
  title: "Lab — visual rehash",
  robots: { index: false, follow: false },
};

export default function RehashIndexPage() {
  return <Switcher />;
}
