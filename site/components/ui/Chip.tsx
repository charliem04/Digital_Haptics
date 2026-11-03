import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Chips (PLAN §4.5): mono caps in a 1px ink box; active is ink-filled
 * with ice text.
 *
 * <Chip> is a static tag. <ChipButton> is a toggle (a filter): a real
 * <button> with aria-pressed, tall enough for the 44px touch target.
 */
const BOX = "border border-ink px-2.5 py-1.5 font-mono text-label-sm uppercase tracking-label";

export function Chip({
  children,
  active = false,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-block", BOX, active ? "bg-ink text-ice" : "text-ink", className)}>
      {children}
    </span>
  );
}

export function ChipButton({
  children,
  pressed,
  className,
  ...rest
}: { children: ReactNode; pressed: boolean } & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-pressed" | "children"
>) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        "inline-flex min-h-touch items-center transition-[color,background-color,transform] duration-[250ms] ease-brand active:translate-y-px",
        BOX,
        pressed ? "bg-ink text-ice" : "text-ink hover:bg-ink/10",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
