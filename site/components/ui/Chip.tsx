import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Chips (docs/VISUAL_GUIDE.md §8). <Chip> is a static tag. <ChipButton>
 * is a toggle (a filter): a real <button> with aria-pressed. Both are
 * at least 44px tall.
 */
const BOX = "rounded-control border px-4 py-1.5 font-body text-room-small";
const ON = "border-text bg-text text-room";
const OFF = "border-line text-text";

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
    <span className={cn("inline-flex min-h-touch items-center", BOX, active ? ON : OFF, className)}>
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
        pressed ? ON : `${OFF} hover:bg-raised`,
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
