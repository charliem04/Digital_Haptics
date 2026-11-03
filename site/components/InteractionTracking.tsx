"use client";

/**
 * One delegated listener for call and booking links, instead of an onClick on every button that offers them.
 *
 * Doing it here means a link added anywhere later is tracked without
 * anyone remembering to wire it, and no component has to import
 * analytics to render a phone number.
 *
 * PHASE 4: rewritten to emit the PLAN §8 events (cta_click, call_click,
 * booking_complete…) to the destination chosen in decision D2, then
 * mounted in the layout. Unmounted until then.
 */
import { useEffect } from "react";
import { site } from "@/site.config";

/** Widened: site.config.ts is `as const`. */
const calUrl: string = site.booking.calUrl;
import { trackEvent, type ConversionEvent } from "@/lib/tracking";

function classify(href: string): ConversionEvent | null {
  if (href.startsWith("tel:")) return "Call";
  if (href.startsWith("sms:")) return "Text";
  if (calUrl && href.startsWith(calUrl)) return "Book";
  return null;
}

export function InteractionTracking() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const event = classify(anchor.getAttribute("href") ?? "");
      if (!event) return;
      trackEvent(event);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
