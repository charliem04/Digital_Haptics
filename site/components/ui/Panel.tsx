import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A solid rounded surface (docs/VISUAL_GUIDE.md §4). `surface` and
 * `raised` are panels and cards; `field` is the input shell. Pass `as`
 * to render the outer layer as a link.
 */
const FILLS = {
  surface: "bg-surface",
  raised: "bg-raised",
  field: "bg-room",
} as const;

export type PanelFill = keyof typeof FILLS;

type PanelProps = {
  fill?: PanelFill;
  /** Element or component to render as the outer layer (e.g. next/link). */
  as?: ElementType;
  /** Classes for the inner (fill) layer: padding, layout. */
  innerClassName?: string;
  children?: ReactNode;
  href?: string;
} & Omit<HTMLAttributes<HTMLElement>, "children">;

export function Panel({
  fill = "surface",
  as: Tag = "div",
  className,
  innerClassName,
  children,
  ...rest
}: PanelProps) {
  const radius = fill === "field" ? "rounded-field" : "rounded-panel";
  return (
    <Tag className={cn("group/panel relative isolate", radius, className)} {...rest}>
      <div className={cn("h-full", radius, FILLS[fill], innerClassName)}>{children}</div>
    </Tag>
  );
}
