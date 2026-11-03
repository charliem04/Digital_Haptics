import Link from "next/link";
import { site } from "@/site.config";
import { cn } from "@/lib/cn";

/**
 * Wordmark (PLAN §4.5): 14px square + DIGITAL HAPTICS in Chakra Petch
 * 700, 18px, .12em. Links home. `tone="ice"` is for ink slabs (footer):
 * ice text, signal square.
 */
export function Logo({ tone = "ink", className }: { tone?: "ink" | "ice"; className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex min-h-touch items-center gap-2.5 font-display text-logo font-bold uppercase no-underline",
        tone === "ice" ? "text-ice" : "text-ink",
        className
      )}
    >
      <span aria-hidden className={cn("block size-3.5", tone === "ice" ? "bg-signal" : "bg-ink")} />
      {site.name}
    </Link>
  );
}
