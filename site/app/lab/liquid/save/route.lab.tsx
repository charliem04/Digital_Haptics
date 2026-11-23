import { writeFile } from "node:fs/promises";
import path from "node:path";
import { validateTuning } from "@/lab/liquid-tuner/schema";

/**
 * DEV ONLY: writes the tuner's values to tuning.json. `.lab.tsx` is not a
 * route in `next build`. The checks stop another site open in the same
 * browser from posting to the local dev server.
 */
const TARGET = path.join(process.cwd(), "components", "home", "liquid", "tuning.json");

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return Response.json({ error: "Wrong origin" }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return Response.json({ error: "Expected JSON" }, { status: 415 });
  }
  let tuning;
  try {
    tuning = validateTuning(await request.json());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid values";
    return Response.json({ error: message }, { status: 400 });
  }
  await writeFile(TARGET, `${JSON.stringify(tuning, null, 2)}\n`, "utf8");
  return Response.json({ tuning });
}
