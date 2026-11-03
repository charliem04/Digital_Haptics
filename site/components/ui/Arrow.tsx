import { cn } from "@/lib/cn";

/**
 * The ↘ arrow, drawn rather than typed.
 *
 * The self-hosted JetBrains Mono is Google's latin subset, which has no
 * U+2198, so a typed ↘ falls back to whatever system font has one and
 * changes weight and width from machine to machine. The path is the
 * mockup's arrow-block glyph (viewBox 30, stroke 3).
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

/**
 * The signal square with an ink ↘ that leads the hero headline
 * (mockup: 76px, glyph 34px). Scales with the display type.
 */
export function ArrowBlock({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-[clamp(2.75rem,5.28vw,4.75rem)] shrink-0 items-center justify-center bg-signal text-ink",
        className
      )}
    >
      <Arrow className="size-[45%]" />
    </span>
  );
}
