import { cn } from "@/lib/cn";

/**
 * The ↘ arrow, drawn rather than typed.
 *
 * The self-hosted fonts are latin subsets with no U+2198, so a typed ↘
 * would fall back to whatever system font has one.
 */
export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 30 30"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="square"
      className={cn("inline-block shrink-0", className)}
    >
      <path d="M5 5 L25 25 M25 9 L25 25 L9 25" />
    </svg>
  );
}
