"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Puts a migrated route, shell included, inside the Molten Room `.room`
 * scope (docs/VISUAL_GUIDE.md). Static export renders each page with its
 * own path, so the HTML is already right before hydration.
 *
 * The flagged Automations page and the supporting pages join in R6,
 * when this moves onto the body and goes away.
 */
const MIGRATED =
  /^\/(?:|work\/|work\/(?!_\/)[^/]+\/|services\/|services\/(?:web-design|local-seo)\/|pricing\/|start\/|start\/thanks\/|styleguide\/)$/;

export function RoomScope({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  // Client-side navigation reports the path without its trailing slash.
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const inRoom = MIGRATED.test(path);
  return (
    <div className={cn("flex min-h-dvh flex-1 flex-col", inRoom && "room")}>
      {children}
      {inRoom && <div aria-hidden className="room-grain" />}
    </div>
  );
}
