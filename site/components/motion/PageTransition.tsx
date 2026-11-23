"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "cover" | "hold" | "reveal";

/** Matches the timings in app/motion.css. */
const COVER_MS = 240;
const REVEAL_MS = 300;
/** If a page is slow, uncover anyway rather than trap the visitor. */
const MAX_HOLD_MS = 4000;

const clean = (path: string) => path.replace(/\/+$/, "") || "/";

/**
 * Plays the chosen transition between internal pages: cover, swap the
 * page out of sight, uncover.
 *
 * The listener only calls preventDefault, which next/link honours. The
 * click still bubbles, so conversion tracking and menu handlers run.
 * New-tab clicks, downloads, in-page anchors, other sites and the
 * browser's back button behave normally. Reduced motion skips it.
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhaseState] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  const timer = useRef<number | undefined>(undefined);

  const setPhase = (next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  };

  const reveal = () => {
    window.clearTimeout(timer.current);
    setPhase("reveal");
    timer.current = window.setTimeout(() => setPhase("idle"), REVEAL_MS);
  };

  useEffect(() => {
    if (phaseRef.current === "hold") reveal();
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const link = (e.target as Element | null)?.closest?.("a");
      if (!link || link.hasAttribute("download")) return;
      if (link.target && link.target !== "_self") return;

      const raw = link.getAttribute("href");
      if (!raw || raw.startsWith("#")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (/\.[a-z0-9]+$/i.test(url.pathname)) return;
      if (clean(url.pathname) === clean(window.location.pathname)) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      e.preventDefault();
      if (phaseRef.current !== "idle") return;

      document.querySelectorAll("dialog[open]").forEach((d) => (d as HTMLDialogElement).close());
      setPhase("cover");
      timer.current = window.setTimeout(() => {
        setPhase("hold");
        router.push(`${url.pathname}${url.search}${url.hash}`);
        timer.current = window.setTimeout(reveal, MAX_HOLD_MS);
      }, COVER_MS);
    };

    window.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("click", onClick, true);
      window.clearTimeout(timer.current);
    };
  }, [router]);

  return <div aria-hidden className="motion-page" data-phase={phase} />;
}
