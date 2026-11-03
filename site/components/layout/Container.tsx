import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Page container (PLAN §4.3): max 1440px, 20px side gutters on mobile,
 * 64px from lg up. Same rule as the `.page-x` class in globals.css.
 */
export function Container({
  as: Tag = "div",
  className,
  children,
  ...rest
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={cn("page-x", className)} {...rest}>
      {children}
    </Tag>
  );
}
