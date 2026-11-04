"use client";

/**
 * One delegated click listener for the PLAN §8 events, instead of an
 * onClick on every button that offers them. A link added anywhere later
 * is tracked without anyone remembering to wire it.
 *
 *   cta_click   any link to the CTA destination (/start/). Location is
 *               the nearest [data-track-loc], else the enclosing
 *               landmark or section's id ("hero", "footer", …).
 *   call_click  any tel: link.
 *
 * form_start / form_submit fire from the intake form, booking_complete
 * from the scheduler embed. Mounted once, in the root layout.
 */
import { useEffect } from "react";
import { trackEvent } from "@/lib/tracking";

function locationOf(el: Element): string | undefined {
  const tagged = el.closest("[data-track-loc]")?.getAttribute("data-track-loc");
  if (tagged) return tagged;
  if (el.closest("header")) return "header";
  if (el.closest("footer")) return "footer";
  if (el.closest("dialog")) return "menu";
  const section = el.closest("section[aria-labelledby]")?.getAttribute("aria-labelledby");
  return section ?? undefined;
}

export function InteractionTracking({ ctaHref }: { ctaHref: string }) {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if (href.startsWith("tel:")) trackEvent("call_click", locationOf(a));
      else if (href === ctaHref || href === ctaHref.replace(/\/$/, ""))
        trackEvent("cta_click", locationOf(a));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [ctaHref]);

  return null;
}
