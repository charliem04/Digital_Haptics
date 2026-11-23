import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** The small muted line above a section heading. */
export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-room-small text-muted", className)}>{children}</p>;
}
