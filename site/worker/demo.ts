import type { Env } from "./env.ts";
import { json, limited, readJson, sameOrigin } from "./http.ts";
import { verifyTurnstile } from "./turnstile.ts";
import { flags } from "./flags.generated.ts";
import { toE164 } from "../lib/intake-rules.ts";
import { demoSequence } from "../data/demo.ts";

/**
 * ════════════════════════════════════════════════════════════════════
 *  🚩 POST /api/demo — the automations demo (PLAN §7).
 *  404 unless FEATURE_AUTOMATIONS_DEMO is on.
 *
 *  MOCK ONLY in this phase: the SMS backend isn't built (PLAN §7), so
 *  this validates the request exactly as the real one will, then
 *  returns the sequence the visitor would receive for the UI to play.
 *  Nothing is sent and the number is not stored: it is validated and
 *  dropped. The rate limiter keys on IP only.
 *
 *  Before the flag goes on (PLAN §7, required): real SMS sending behind
 *  this same validation, per-number limits on the messaging side,
 *  STOP/HELP handling, and the demo label on every message.
 * ════════════════════════════════════════════════════════════════════
 */
export async function handleDemo(req: Request, env: Env): Promise<Response> {
  if (!flags.automationsDemo) return json({ error: "not found" }, 404);
  if (req.method !== "POST") return json({ error: "method" }, 405);
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  if (await limited(env.LIMITER, req, "demo")) return json({ error: "rate" }, 429);

  const body = await readJson(req, 4096);
  if (!body) return json({ error: "body" }, 400);
  if (typeof body.phone !== "string" || !toE164(body.phone)) {
    return json({ error: "invalid", errors: { phone: "Enter a 10-digit US mobile number." } }, 400);
  }
  if (body.consent !== true) {
    return json(
      { error: "invalid", errors: { consent: "Tick the box to receive the demo texts." } },
      400
    );
  }
  const turnstile = await verifyTurnstile(env, body.turnstile, req.headers.get("CF-Connecting-IP"));
  if (turnstile === "failed") return json({ error: "turnstile" }, 403);

  return json({ ok: true, mock: true, messages: demoSequence });
}
