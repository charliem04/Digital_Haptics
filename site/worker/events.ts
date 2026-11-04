import type { Env } from "./env.ts";
import { empty, json, readJson, sameOrigin } from "./http.ts";
import { flags } from "./flags.generated.ts";

/**
 * POST /api/event — conversion events into Workers Analytics Engine
 * (PLAN §8, decision D2). Sent by lib/tracking.ts with sendBeacon.
 *
 * Stored per data point: blobs [event, location, path, site_env],
 * index [event]. No IP, no user agent, no id: counts, not people.
 * Query in the dashboard (Workers → Analytics Engine) or the SQL API:
 *   SELECT blob1 AS event, blob2 AS loc, count() FROM digitalhaptics_events
 *   WHERE timestamp > NOW() - INTERVAL '7' DAY GROUP BY event, loc
 */
const EVENTS = new Set([
  "cta_click",
  "form_start",
  "form_submit",
  "call_click",
  "booking_complete",
]);
const DEMO_EVENTS = new Set(["demo_start", "demo_complete"]);

export function allowedEvent(name: unknown): name is string {
  if (typeof name !== "string") return false;
  if (EVENTS.has(name)) return true;
  // 🚩 Only while the demo exists.
  return flags.automationsDemo && DEMO_EVENTS.has(name);
}

const short = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/[^\w\-/.]/g, "").slice(0, max) : "";

export async function handleEvent(req: Request, env: Env): Promise<Response> {
  if (req.method !== "POST") return json({ error: "method" }, 405);
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  const body = await readJson(req, 2048);
  if (!body || !allowedEvent(body.e)) return json({ error: "event" }, 400);

  try {
    env.EVENTS?.writeDataPoint({
      blobs: [body.e, short(body.loc, 40), short(body.path, 200), env.SITE_ENV ?? "production"],
      doubles: [1],
      indexes: [body.e],
    });
  } catch (e) {
    console.warn("[event] analytics write failed:", e);
  }
  return empty();
}
