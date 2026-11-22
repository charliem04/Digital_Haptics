import type { Metadata } from "next";
import { Suspense } from "react";
import { getRehashContent } from "@/lab/rehash/content";
import { RehashView } from "@/lab/rehash/Views";

/** One direction and page, framed by the /lab/rehash switcher. Dev only. */
export const metadata: Metadata = {
  title: "Lab — visual rehash view",
  robots: { index: false, follow: false },
};

export default function RehashViewPage() {
  return (
    <Suspense>
      <RehashView content={getRehashContent()} />
    </Suspense>
  );
}
