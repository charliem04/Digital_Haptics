"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { RAMP } from "./params";
import { posterBackground } from "./poster";
import { LIQUID_STATE_EVENT, perfFlags } from "@/lib/perf";

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

/** Why the liquid should stay a poster, or null when it should run. */
function posterReason(): string | null {
  if (typeof WebGL2RenderingContext === "undefined") return "no WebGL2";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "reduced motion";
  if (window.matchMedia("(prefers-reduced-data: reduce)").matches) return "reduced data";
  const device = navigator as DeviceInfo;
  if (device.connection?.saveData) return "save-data";
  if (device.deviceMemory !== undefined && device.deviceMemory < 4) return "deviceMemory < 4";
  // Safari deliberately under-reports cores, so a capable iPhone can look
  // like a budget phone. It's exempt, and the frame governor protects it.
  const safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  if (!safari && navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4) {
    return "hardwareConcurrency <= 4";
  }
  return null;
}

/** Perf probe: tell the HUD what the liquid is doing. */
const announce = (state: string) => {
  if (perfFlags()) window.dispatchEvent(new CustomEvent(LIQUID_STATE_EVENT, { detail: state }));
};

/**
 * Can a worker draw WebGL2 here? Some Safari versions have OffscreenCanvas
 * without WebGL2 on it. Checked first because handing a canvas to a worker
 * can't be undone.
 */
function canRenderInWorker(canvas: HTMLCanvasElement): boolean {
  if (!("transferControlToOffscreen" in canvas) || typeof Worker !== "function") return false;
  if (typeof OffscreenCanvas === "undefined") return false;
  try {
    const gl = new OffscreenCanvas(1, 1).getContext("webgl2");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
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
  const [mainThread, setMainThread] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const reason = perfFlags()?.off.has("liquid") ? "off by ?perf" : posterReason();
    if (reason) {
      announce(`poster (${reason})`);
      return;
    }
    announce("waiting for load + idle");

    let dead = false;
    let stop: (() => void) | undefined;
    const cancel = afterLoadAndIdle(async () => {
      try {
        // Off the main thread wherever the browser allows it, so the
        // liquid can never hold up scrolling or taps.
        const useWorker = !mainThread && canRenderInWorker(canvas);
        const run = useWorker
          ? (await import("./runLiquidWorker")).runLiquidWorker
          : (await import("./runLiquid")).runLiquid;
        if (dead) return;
        const openings = Array.from(document.querySelectorAll("[data-liquid-opening]"));
        const dispose = await run(canvas, root, openings, {
          onReady: () => {
            announce(`live (${useWorker ? "worker" : "main thread"})`);
            setLive(true);
          },
          onLost: () => {
            announce("poster (context lost or worker failed)");
            setLive(false);
            // A failed worker gets one retry on the main thread, on a
            // fresh canvas because the first now belongs to the worker.
            if (useWorker) setMainThread(true);
          },
        });
        if (dead) dispose();
        else stop = dispose;
      } catch {
        // No WebGL2 or a shader failure: the poster stays.
        announce("poster (no hardware GPU, or shader failed)");
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
  }, [mainThread]);

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
        key={mainThread ? "main" : "worker"}
        ref={canvasRef}
        className={cn(
          "absolute inset-0 size-full opacity-0 transition-opacity duration-[600ms] ease-out motion-reduce:transition-none",
          live && "opacity-100"
        )}
      />
    </div>
  );
}
