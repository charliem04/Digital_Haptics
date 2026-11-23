"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { RAMP } from "./params";
import { posterBackground } from "./poster";

/**
 * ════════════════════════════════════════════════════════════════════
 *  LIQUID BACKDROP (docs/VISUAL_GUIDE.md §10.2, §10.3).
 *
 *  First paint is a CSS poster: no image, no JavaScript dependency, and
 *  never the LCP element. After `load` and idle, on capable devices, the
 *  renderer is imported and its canvas cross-fades in. With reduced
 *  motion, data saver, low-power hardware or no WebGL2, the renderer is
 *  not downloaded or the poster simply stays.
 *
 *  Decorative: aria-hidden, no pointer events.
 * ════════════════════════════════════════════════════════════════════
 */

type NetworkInfo = { saveData?: boolean };
type DeviceInfo = Navigator & { connection?: NetworkInfo; deviceMemory?: number };

function shouldAnimate(): boolean {
  if (typeof WebGL2RenderingContext === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.matchMedia("(prefers-reduced-data: reduce)").matches) return false;
  const device = navigator as DeviceInfo;
  if (device.connection?.saveData) return false;
  if (device.deviceMemory !== undefined && device.deviceMemory < 4) return false;
  if (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4) return false;
  return true;
}

/** Run after `load`, once the main thread is idle. */
function afterLoadAndIdle(run: () => void): () => void {
  let idle = 0;
  let timer = 0;
  // Safari has no requestIdleCallback.
  const hasIdle = typeof window.requestIdleCallback === "function";
  const schedule = () => {
    if (hasIdle) idle = window.requestIdleCallback(run, { timeout: 2000 });
    else timer = window.setTimeout(run, 1200);
  };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
  return () => {
    window.removeEventListener("load", schedule);
    if (idle) window.cancelIdleCallback(idle);
    if (timer) window.clearTimeout(timer);
  };
}

export function LiquidBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas || !shouldAnimate()) return;

    let dead = false;
    let stop: (() => void) | undefined;
    const cancel = afterLoadAndIdle(async () => {
      try {
        // Off the main thread wherever the browser allows it, so the
        // liquid can never hold up scrolling or taps.
        const run =
          "transferControlToOffscreen" in canvas && typeof Worker === "function"
            ? (await import("./runLiquidWorker")).runLiquidWorker
            : (await import("./runLiquid")).runLiquid;
        if (dead) return;
        const openings = Array.from(document.querySelectorAll("[data-liquid-opening]"));
        const dispose = await run(canvas, root, openings, {
          onReady: () => setLive(true),
          onLost: () => setLive(false),
        });
        if (dead) dispose();
        else stop = dispose;
      } catch {
        // No WebGL2 or a shader failure: the poster stays.
        setLive(false);
      }
    });

    // Reduced motion switched on mid-visit: stop and return to the poster.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onReducedChange = () => {
      if (!reduced.matches || dead) return;
      dead = true;
      cancel();
      stop?.();
      stop = undefined;
      setLive(false);
    };
    reduced.addEventListener("change", onReducedChange);

    return () => {
      reduced.removeEventListener("change", onReducedChange);
      dead = true;
      cancel();
      stop?.();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      data-liquid={live ? "live" : "poster"}
      className={cn(
        // Where the poster's mass sits: matched to the canvas's opening frame.
        // lvh, so a phone's collapsing address bar never resizes the canvas.
        "pointer-events-none fixed inset-x-0 top-0 z-0 h-[100lvh] overflow-hidden [--lh:22%] [--lw:38%] [--lx:44%] [--ly:27%] lg:[--lh:36%] lg:[--lw:14%] lg:[--lx:81%] lg:[--ly:85%]"
      )}
      style={{
        backgroundColor: RAMP[0].color,
        backgroundImage: posterBackground(RAMP),
      }}
    >
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 size-full opacity-0 transition-opacity duration-[600ms] ease-out motion-reduce:transition-none",
          live && "opacity-100"
        )}
      />
    </div>
  );
}
