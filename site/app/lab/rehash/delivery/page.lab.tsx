import type { Metadata } from "next";
import { Harness } from "@/lab/rehash/delivery/Harness";

/** /lab/rehash/delivery: dev-only measurements for the live hero. */
export const metadata: Metadata = {
  title: "Lab — hero delivery measurements",
  robots: { index: false, follow: false },
};

export default function DeliveryPage() {
  return <Harness />;
}
