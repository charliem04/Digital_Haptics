import Link from "next/link";
import { site } from "@/site.config";
import { cn } from "@/lib/cn";

/**
 * Wordmark (PLAN §4.5): 14px ink square + DIGITAL HAPTICS in Chakra
 * Petch 700, 18px, .12em. Links home.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex min-h-touch items-center gap-2.5 font-display text-logo font-bold uppercase text-ink no-underline",
        className
      )}
    >
      <span aria-hidden className="block size-3.5 bg-ink" />
      {site.name}
    </Link>
  );
}
