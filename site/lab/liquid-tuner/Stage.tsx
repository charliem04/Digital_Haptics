"use client";

import { useEffect, useRef } from "react";
import { LiquidEngine } from "@/components/home/liquid/engine";
import { DESKTOP, PHONE, type LiquidSettings } from "@/components/home/liquid/params";
import type { Tuning } from "./schema";
import css from "./tuner.module.css";

/**
 * The tuner's preview, inside an iframe so the real header and hero get
 * their true breakpoints. It runs the production engine without the
 * homepage's performance governor, so quality never changes by itself
 * while tuning.
 */

export type Device = "desktop" | "phone";

export type StageCommand = {
  type: "tuning";
  tuning: Tuning;
  device: Device;
  paused: boolean;
  showPage: boolean;
};

export type StageReport =
  | { type: "ready" }
  | { type: "stats"; fps: number }
  | { type: "error"; message: string };

const MAX_DT = 1 / 20;

function settingsFor(command: StageCommand): LiquidSettings {
  const phone = command.device === "phone";
  // The live site's pixel caps, so what is tuned is what ships.
  const live = phone ? PHONE : DESKTOP;
  return {
    ...command.tuning[command.device],
    maxDpr: live.maxDpr,
    maxCanvasPixels: live.maxCanvasPixels,
    fps: live.fps,
  };
}

const report = (message: StageReport) => window.parent.postMessage(message, window.location.origin);

export function TunerBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    let dead = false;
    let engine: LiquidEngine | undefined;
    let starting = false;
    let latest: StageCommand | undefined;
    let raf = 0;
    let last = 0;
    let frames = 0;
    let elapsed = 0;

    const layout = () => {
      if (!engine) return;
      const box = root.getBoundingClientRect();
      engine.resize(Math.round(box.width), Math.round(box.height));
      engine.frame(0);
    };

    const apply = () => {
      if (!engine || !latest) return;
      engine.retune({
        look: latest.tuning.look,
        settings: settingsFor(latest),
        ramp: latest.tuning.ramp,
      });
      layout();
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const interval = last === 0 ? 1000 / 60 : now - last;
      last = now;
      engine?.frame(latest?.paused ? 0 : Math.min(interval / 1000, MAX_DT));
      frames++;
      elapsed += interval;
      if (elapsed >= 500) {
        report({ type: "stats", fps: Math.round((frames * 1000) / elapsed) });
        frames = 0;
        elapsed = 0;
      }
    };

    const start = async (command: StageCommand) => {
      starting = true;
      try {
        const created = await LiquidEngine.create(canvas, settingsFor(command));
        if (dead) {
          created.dispose();
          return;
        }
        engine = created;
        apply();
        raf = requestAnimationFrame(tick);
      } catch (error) {
        report({
          type: "error",
          message: error instanceof Error ? error.message : "The preview could not start",
        });
      }
    };

    const onMessage = (event: MessageEvent<StageCommand>) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      if (event.data?.type !== "tuning") return;
      latest = event.data;
      document.documentElement.classList.toggle(css.bare, !latest.showPage);
      if (!starting) void start(latest);
      else apply();
    };

    const resizer = new ResizeObserver(layout);
    resizer.observe(root);
    window.addEventListener("message", onMessage);
    report({ type: "ready" });

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      resizer.disconnect();
      window.removeEventListener("message", onMessage);
      engine?.dispose();
    };
  }, []);

  return (
    <div ref={rootRef} aria-hidden data-tuner-canvas className={css.backdrop}>
      <canvas ref={canvasRef} className={css.canvas} />
    </div>
  );
}
