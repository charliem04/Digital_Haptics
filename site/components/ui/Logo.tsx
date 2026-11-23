import Link from "next/link";
import { site } from "@/site.config";
import { cn } from "@/lib/cn";

/** Wordmark: a round amber mark and the name in Chakra Petch 700. Links home. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex min-h-touch items-center gap-2.5 font-logo text-room-logo text-text no-underline",
        className
      )}
    >
      <span aria-hidden className="block size-3.5 rounded-control bg-amber" />
      {site.name}
    </Link>
  );
}
