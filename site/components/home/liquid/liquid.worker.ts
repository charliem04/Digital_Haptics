import { LiquidEngine } from "./engine";
import { createLoop, type LiquidLoop } from "./liquidLoop";
import { DESKTOP, PHONE } from "./params";

/**
 * The liquid's own thread. Shader compilation, the first draw and every
 * frame happen here, so none of it can block scrolling, taps or paint.
 * Started by runLiquidWorker, which owns everything that needs the DOM.
 */

export type LiquidSize = { width: number; height: number; dpr: number };

export type LiquidCommand =
  | ({ type: "init"; canvas: OffscreenCanvas; phone: boolean; wanted: boolean } & LiquidSize)
  | ({ type: "resize" } & LiquidSize)
  | { type: "wanted"; wanted: boolean };

export type LiquidReport = { type: "ready" | "lost" | "failed" };

const scope = self as unknown as {
  postMessage: (report: LiquidReport) => void;
  onmessage: ((event: MessageEvent<LiquidCommand>) => void) | null;
};

let engine: LiquidEngine | undefined;
let loop: LiquidLoop | undefined;
let size: LiquidSize = { width: 0, height: 0, dpr: 1 };
let wanted = false;

const draw = () => {
  engine?.resize(size.width, size.height, size.dpr);
  engine?.frame(0);
};

async function init(command: Extract<LiquidCommand, { type: "init" }>) {
  size = command;
  wanted = command.wanted;
  const settings = command.phone ? PHONE : DESKTOP;
  try {
    command.canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      loop?.stop();
      scope.postMessage({ type: "lost" });
    });
    engine = await LiquidEngine.create(command.canvas, settings);
    // Uses the latest size, in case the page resized during compilation.
    draw();
    loop = createLoop(engine, settings);
    loop.setWanted(wanted);
    scope.postMessage({ type: "ready" });
  } catch {
    // No WebGL2 here, no GPU, or a shader failure: the poster stays.
    scope.postMessage({ type: "failed" });
  }
}

scope.onmessage = ({ data }) => {
  if (data.type === "init") {
    void init(data);
  } else if (data.type === "resize") {
    size = data;
    draw();
  } else {
    wanted = data.wanted;
    loop?.setWanted(wanted);
  }
};
