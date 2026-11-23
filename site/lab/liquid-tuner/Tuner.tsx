"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Pane } from "tweakpane";
import launch from "./launch.json";
import {
  DEVICE_RANGES,
  LOOK_RANGES,
  STOP_NAMES,
  validateTuning,
  type LookKey,
  type Tuning,
} from "./schema";
import type { Device, StageCommand, StageReport } from "./Stage";
import css from "./tuner.module.css";

/** Real viewport sizes, so the hero uses its true breakpoints. */
const FRAMES: Record<Device, { width: number; height: number }> = {
  desktop: { width: 1440, height: 900 },
  phone: { width: 390, height: 844 },
};

const GROUPS: { title: string; keys: [LookKey, string][] }[] = [
  {
    title: "Form",
    keys: [
      ["coverage", "Coverage"],
      ["viscosity", "Viscosity"],
      ["stretch", "Stretch"],
      ["warpAmount", "Warp amount"],
      ["warpScale", "Warp scale"],
      ["seed", "Seed"],
    ],
  },
  {
    title: "Motion",
    keys: [
      ["flowSpeed", "Flow speed"],
      ["gravity", "Gravity"],
      ["buoyancy", "Buoyancy"],
      ["cameraDrift", "Camera drift"],
    ],
  },
  {
    title: "Look",
    keys: [
      ["rimWidth", "Rim width"],
      ["depthOfField", "Depth of field"],
      ["fogAmount", "Fog"],
    ],
  },
  {
    title: "Grain",
    keys: [
      ["grainAmount", "Amount"],
      ["grainSize", "Size"],
      ["grainFps", "Frames per second"],
    ],
  },
];

const MEMORY_KEY = "liquid-tuner";

type Memory = {
  device: Device;
  paused: boolean;
  showPage: boolean;
  status: string;
  draft: Tuning;
};

function assign(target: Tuning, next: Tuning) {
  Object.assign(target.look, next.look);
  Object.assign(target.desktop, next.desktop);
  Object.assign(target.phone, next.phone);
  next.ramp.forEach((stop, i) => Object.assign(target.ramp[i], stop));
}

export function Tuner({ saved }: { saved: Tuning }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<Pane>();
  const [tuning] = useState<Tuning>(() => structuredClone(saved));
  const savedRef = useRef(JSON.stringify(saved));

  const [device, setDevice] = useState<Device>("desktop");
  const [paused, setPaused] = useState(false);
  const [showPage, setShowPage] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [fps, setFps] = useState<number>();
  const [stageError, setStageError] = useState("");
  const [scale, setScale] = useState(1);

  const view = useRef({ device, paused, showPage });
  view.current = { device, paused, showPage };

  const send = useCallback(() => {
    const command: StageCommand = { type: "tuning", tuning, ...view.current };
    frameRef.current?.contentWindow?.postMessage(command, window.location.origin);
  }, [tuning]);

  const isDirty = useCallback(
    () => JSON.stringify(validateTuning(tuning)) !== savedRef.current,
    [tuning]
  );

  const changed = useCallback(() => {
    setDirty(isDirty());
    setStatus("");
    send();
  }, [isDirty, send]);

  // A save rewrites a file the dev server watches, which can reload this
  // page. Keep the view and any draft so that costs nothing.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(MEMORY_KEY);
      if (!raw) return;
      const memory = JSON.parse(raw) as Memory;
      assign(tuning, validateTuning(memory.draft));
      paneRef.current?.refresh();
      setDevice(memory.device === "phone" ? "phone" : "desktop");
      setPaused(memory.paused === true);
      setShowPage(memory.showPage !== false);
      setStatus(typeof memory.status === "string" ? memory.status : "");
      setDirty(isDirty());
    } catch {
      sessionStorage.removeItem(MEMORY_KEY);
    }
  }, [isDirty, tuning]);

  useEffect(() => {
    const memory: Memory = { device, paused, showPage, status, draft: tuning };
    sessionStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
  }, [device, dirty, paused, showPage, status, tuning]);

  useEffect(send, [send, device, paused, showPage]);

  useEffect(() => {
    const onMessage = (event: MessageEvent<StageReport>) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.type === "ready") {
        setStageError("");
        send();
      } else if (event.data?.type === "stats") setFps(event.data.fps);
      else if (event.data?.type === "error") setStageError(event.data.message);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [send]);

  useEffect(() => {
    let pane: Pane | undefined;
    let dead = false;
    import("tweakpane").then(({ Pane: PaneClass }) => {
      if (dead || !panelRef.current) return;
      pane = new PaneClass({ container: panelRef.current });
      paneRef.current = pane;

      for (const group of GROUPS) {
        const folder = pane.addFolder({ title: group.title });
        for (const [key, label] of group.keys) {
          folder.addBinding(tuning.look, key, { label, ...LOOK_RANGES[key] });
        }
      }
      for (const [name, title] of [
        ["desktop", "Desktop"],
        ["phone", "Phone"],
      ] as const) {
        const folder = pane.addFolder({ title });
        folder.addBinding(tuning[name], "blobCount", {
          label: "Blob count",
          ...DEVICE_RANGES.blobCount,
        });
        folder.addBinding(tuning[name], "renderScale", {
          label: "Render scale",
          ...DEVICE_RANGES.renderScale,
        });
      }
      const colours = pane.addFolder({ title: "Colours (space to core)", expanded: false });
      STOP_NAMES.forEach((label, i) => colours.addBinding(tuning.ramp[i], "color", { label }));
      pane.on("change", changed);
    });
    return () => {
      dead = true;
      pane?.dispose();
    };
  }, [changed, tuning]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const fit = () => {
      const box = stage.getBoundingClientRect();
      const frame = FRAMES[device];
      setScale(Math.min((box.width - 32) / frame.width, (box.height - 32) / frame.height, 1));
    };
    fit();
    const resizer = new ResizeObserver(fit);
    resizer.observe(stage);
    return () => resizer.disconnect();
  }, [device]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const load = (next: Tuning, message: string) => {
    assign(tuning, next);
    paneRef.current?.refresh();
    changed();
    setStatus(message);
  };

  const save = async () => {
    setSaving(true);
    setStatus("");
    try {
      const response = await fetch("/lab/liquid/save/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(tuning),
      });
      const body = (await response.json()) as { tuning?: Tuning; error?: string };
      if (!response.ok || !body.tuning) throw new Error(body.error ?? "Save failed");
      savedRef.current = JSON.stringify(body.tuning);
      assign(tuning, body.tuning);
      paneRef.current?.refresh();
      setDirty(false);
      setStatus("Saved. Deploy to publish it.");
    } catch (error) {
      setStatus(`Not saved: ${error instanceof Error ? error.message : "unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const frame = FRAMES[device];

  return (
    <div className={css.shell}>
      <main ref={stageRef} className={css.stage}>
        <div style={{ width: frame.width * scale, height: frame.height * scale }}>
          <iframe
            ref={frameRef}
            src="/lab/liquid/stage/"
            title="Liquid preview"
            className={css.frame}
            style={{
              width: frame.width,
              height: frame.height,
              transform: `scale(${scale})`,
            }}
          />
        </div>
        {stageError && (
          <p role="alert" className={css.stageError}>
            The preview could not start: {stageError}. This page needs WebGL2 and a hardware GPU.
          </p>
        )}
      </main>

      <aside className={css.side}>
        <h1 className={css.title}>Liquid tuner</h1>
        <div className={css.row} role="group" aria-label="Preview device">
          {(["desktop", "phone"] as const).map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={device === name}
              className={css.button}
              onClick={() => setDevice(name)}
            >
              {name === "desktop" ? "Desktop" : "Phone"}
            </button>
          ))}
        </div>
        <div className={css.row}>
          <button
            type="button"
            aria-pressed={showPage}
            className={css.button}
            onClick={() => setShowPage((value) => !value)}
          >
            Page on top
          </button>
          <button
            type="button"
            aria-pressed={paused}
            className={css.button}
            onClick={() => setPaused((value) => !value)}
          >
            Pause
          </button>
        </div>
        <p className={css.meta}>{fps === undefined ? "Starting preview" : `${fps} fps`}</p>

        <div ref={panelRef} className={css.panel} />

        <div className={css.actions}>
          <button type="button" className={css.primary} disabled={!dirty || saving} onClick={save}>
            {saving ? "Saving" : dirty ? "Save changes" : "Saved"}
          </button>
          <div className={css.row}>
            <button
              type="button"
              className={css.button}
              disabled={!dirty}
              onClick={() => load(JSON.parse(savedRef.current) as Tuning, "Back to last save.")}
            >
              Revert
            </button>
            <button
              type="button"
              className={css.button}
              onClick={() => load(validateTuning(launch), "Launch values loaded. Not saved yet.")}
            >
              Restore launch
            </button>
          </div>
          <p role="status" className={css.meta}>
            {status || (dirty ? "Unsaved changes" : " ")}
          </p>
        </div>
      </aside>
    </div>
  );
}
