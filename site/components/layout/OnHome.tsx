"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Adds `home` classes on the home page only. The header uses it to
 * make room for the hero's sidebar rail, which starts at the top of the
 * page on `/` (mockup), and to drop its CTA there since the rail has
 * one. Static export renders each page with its own path, so the HTML
 * already matches before hydration.
 */
export function OnHome({
  home,
  className,
  children,
}: {
  home: string;
  className?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  return <div className={cn(className, pathname === "/" && home)}>{children}</div>;
}
