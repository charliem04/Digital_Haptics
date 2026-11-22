"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

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

export function LiquidBackdrop({ className }: { className?: string }) {
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
        const { runLiquid } = await import("./runLiquid");
        if (dead) return;
        const dispose = await runLiquid(canvas, root, {
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

    return () => {
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
        "pointer-events-none absolute overflow-hidden [--lh:50%] [--lw:38%] [--lx:44%] [--ly:50%] lg:[--lh:40%] lg:[--lw:14%] lg:[--lx:81%] lg:[--ly:84%]",
        className
      )}
      style={{
        backgroundColor: "#181c21",
        backgroundImage:
          "radial-gradient(var(--lw) var(--lh) at var(--lx) var(--ly), #871922 0%, #a81f20 22%, #e22e20 42%, #f56c36 58%, #f5a254 74%, #987d57 84%, #415a54 92%, transparent 100%), radial-gradient(calc(var(--lw) * 2.4) calc(var(--lh) * 2) at var(--lx) var(--ly), #1c4345 0%, #133236 55%, transparent 100%)",
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
