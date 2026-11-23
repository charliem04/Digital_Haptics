import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SectionAmbient, SectionDivider } from "@/components/motion/SectionMotion";
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
  frost: `bg-surface`,
  "steel-panel": `bg-raised`,
  ink: `bg-surface text-text`,
} as const;

const SPACING = {
  default: "py-room-section-sm lg:py-room-section",
  tight: "py-10 lg:py-16",
  none: "",
} as const;

/** Read by the liquid-edge divider so it matches the section's own fill. */
const TONE_FILL = {
  none: "[--section-bg:var(--room)]",
  frost: "[--section-bg:var(--surface)]",
  "steel-panel": "[--section-bg:var(--raised)]",
  ink: "[--section-bg:var(--surface)]",
} as const;

export function Section({
  tone = "none",
  spacing = "default",
  ambient = tone !== "none",
  divider = spacing === "default",
  className,
  containerClassName,
  children,
  ...rest
}: {
  tone?: keyof typeof TONES;
  spacing?: keyof typeof SPACING;
  /** Background motion (motion.config.ts). On for toned sections. */
  ambient?: boolean;
  /** Animated top edge. Off for tight sections that follow a page hero. */
  divider?: boolean;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn("relative", TONE_FILL[tone], TONES[tone], SPACING[spacing], className)}
      {...rest}
    >
      {ambient && <SectionAmbient />}
      {divider && <SectionDivider />}
      <Container className={cn("relative", containerClassName)}>{children}</Container>
    </section>
  );
}
