import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** A small muted label, such as "Intake" or "Coming soon". Not interactive. */
export function SmallLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-block self-start text-room-small text-muted", className)}>
      {children}
    </span>
  );
}
