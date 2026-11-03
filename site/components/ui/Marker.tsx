import { cn } from "@/lib/cn";

/**
 * Signal squares (PLAN §4.4). Decorative, always aria-hidden.
 *
 *   marker  8px, at line intersections and cut-corner ends, sparingly
 *   dot     7px status dot beside LIVE / LIVE SITE / a result (mockup)
 */
export function Marker({
  size = "marker",
  className,
}: {
  size?: "marker" | "dot";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "block shrink-0 bg-signal",
        size === "dot" ? "size-[7px]" : "size-2",
        className
      )}
    />
  );
}
