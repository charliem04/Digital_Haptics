import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Container } from "./Container";

/**
 * Section wrapper (PLAN §4.3): vertical rhythm of 96–120px on desktop
 * and 48–64px on mobile, with the page container inside.
 *
 *   tone     none (the dotted ice ground shows through), frost,
 *            steel-panel, or ink (an ice-on-ink slab)
 *   spacing  default, tight (half), or none (the caller pads)
 *
 * Give it `aria-labelledby` pointing at the section heading's id, so it
 * is announced as a named region.
 */
const TONES = {
  none: "",
  frost: "bg-frost",
  "steel-panel": "bg-steel-panel",
  ink: "bg-ink text-ice",
} as const;

const SPACING = {
  default: "py-section-sm lg:py-section",
  tight: "py-10 lg:py-16",
  none: "",
} as const;

export function Section({
  tone = "none",
  spacing = "default",
  className,
  containerClassName,
  children,
  ...rest
}: {
  tone?: keyof typeof TONES;
  spacing?: keyof typeof SPACING;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn(TONES[tone], SPACING[spacing], className)} {...rest}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
